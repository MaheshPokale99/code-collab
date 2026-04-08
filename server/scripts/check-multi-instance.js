const path = require("path")
const { spawn } = require("child_process")
const { io } = require("socket.io-client")
const dotenv = require("dotenv")

const serverDir = path.resolve(__dirname, "..")
const envPath = path.join(serverDir, ".env")

dotenv.config({ path: envPath })

const JOIN_REQUEST = "join-request"
const JOIN_ACCEPTED = "join-accepted"
const USER_JOINED = "user-joined"
const USERNAME_EXISTS = "username-exists"
const SEND_MESSAGE = "send-message"
const RECEIVE_MESSAGE = "receive-message"
const SYNC_FILE_STRUCTURE = "sync-file-structure"
const TIMEOUT_MS = 20000

const instanceConfigs = [
	{
		label: "server-1",
		port: Number(process.env.TEST_SERVER_ONE_PORT ?? 4101),
	},
	{
		label: "server-2",
		port: Number(process.env.TEST_SERVER_TWO_PORT ?? 4102),
	},
]

const serverProcesses = []
const testSockets = []

function ensureRedisConfig() {
	if (
		!process.env.REDIS_ADDR &&
		!process.env.REDIS_URL &&
		!process.env.REDIS_HOST
	) {
		throw new Error(
			"Redis is not configured. Set REDIS_ADDR, REDIS_URL, or REDIS_HOST in server/.env before running this check."
		)
	}
}

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

function onceSocketEvent(socket, eventName, timeoutMs = TIMEOUT_MS) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			socket.off(eventName, handleEvent)
			reject(new Error(`Timed out waiting for "${eventName}"`))
		}, timeoutMs)

		const handleEvent = (payload) => {
			clearTimeout(timeout)
			resolve(payload)
		}

		socket.once(eventName, handleEvent)
	})
}

function startServerInstance({ label, port }) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			process.execPath,
			["-r", "ts-node/register", "src/server.ts"],
			{
				cwd: serverDir,
				env: {
					...process.env,
					PORT: String(port),
					SOCKET_IO_TRANSPORTS:
						process.env.SOCKET_IO_TRANSPORTS || "websocket",
				},
				stdio: ["ignore", "pipe", "pipe"],
			}
		)

		serverProcesses.push(child)

		let isReady = false
		const timeout = setTimeout(() => {
			if (isReady) {
				return
			}

			child.kill()
			reject(
				new Error(`Timed out waiting for ${label} to start on port ${port}.`)
			)
		}, TIMEOUT_MS)

		child.stdout.on("data", (chunk) => {
			const output = String(chunk)
			process.stdout.write(`[${label}] ${output}`)

			if (output.includes(`Listening on port ${port}`)) {
				isReady = true
				clearTimeout(timeout)
				resolve({ child, port, label })
			}
		})

		child.stderr.on("data", (chunk) => {
			process.stderr.write(`[${label}] ${String(chunk)}`)
		})

		child.on("exit", (code) => {
			if (isReady) {
				return
			}

			clearTimeout(timeout)
			reject(
				new Error(`${label} exited before becoming ready. Exit code: ${code}`)
			)
		})
	})
}

function connectTestClient(baseUrl, username, roomId) {
	return new Promise((resolve, reject) => {
		const socket = io(baseUrl, {
			transports: ["websocket"],
			reconnection: false,
			timeout: TIMEOUT_MS,
			forceNew: true,
		})

		testSockets.push(socket)

		const timeout = setTimeout(() => {
			socket.disconnect()
			reject(new Error(`Timed out while joining ${baseUrl} as ${username}.`))
		}, TIMEOUT_MS)

		const cleanup = () => {
			clearTimeout(timeout)
			socket.off("connect_error", handleError)
			socket.off("error", handleError)
			socket.off(USERNAME_EXISTS, handleUsernameExists)
			socket.off(JOIN_ACCEPTED, handleJoinAccepted)
		}

		const handleError = (error) => {
			cleanup()
			reject(
				error instanceof Error
					? error
					: new Error(`Socket error while connecting to ${baseUrl}.`)
			)
		}

		const handleUsernameExists = () => {
			cleanup()
			reject(new Error(`Username "${username}" already exists in ${roomId}.`))
		}

		const handleJoinAccepted = (payload) => {
			cleanup()
			resolve({ socket, payload })
		}

		socket.once("connect", () => {
			socket.emit(JOIN_REQUEST, { roomId, username })
		})

		socket.on("connect_error", handleError)
		socket.on("error", handleError)
		socket.once(USERNAME_EXISTS, handleUsernameExists)
		socket.once(JOIN_ACCEPTED, handleJoinAccepted)
	})
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message)
	}
}

async function cleanup() {
	for (const socket of testSockets) {
		try {
			socket.disconnect()
		} catch (error) {
			// Best-effort cleanup.
		}
	}

	await delay(300)

	for (const child of serverProcesses) {
		if (!child.killed) {
			child.kill()
		}
	}
}

async function run() {
	ensureRedisConfig()

	const roomId = `cluster-test-${Date.now()}`
	console.log(`Using room: ${roomId}`)
	console.log("Starting two backend instances...")

	await Promise.all(instanceConfigs.map(startServerInstance))
	await delay(500)

	const firstClient = await connectTestClient(
		`http://127.0.0.1:${instanceConfigs[0].port}`,
		"cluster-user-a",
		roomId
	)

	const userJoinedPromise = onceSocketEvent(firstClient.socket, USER_JOINED)

	const secondClient = await connectTestClient(
		`http://127.0.0.1:${instanceConfigs[1].port}`,
		"cluster-user-b",
		roomId
	)

	const userJoinedPayload = await userJoinedPromise
	assert(
		userJoinedPayload?.user?.username === "cluster-user-b",
		"The first client did not receive the cross-instance user-joined event."
	)

		const joinedUsers =
			secondClient.payload?.users?.map((user) => user.username) || []
	assert(
		joinedUsers.includes("cluster-user-a") &&
			joinedUsers.includes("cluster-user-b"),
		"The second client did not receive the full cluster-wide room user list."
	)

	const syncFilePromise = onceSocketEvent(
		secondClient.socket,
		SYNC_FILE_STRUCTURE
	)

	firstClient.socket.emit(SYNC_FILE_STRUCTURE, {
		socketId: secondClient.socket.id,
		fileStructure: [{ id: "root", name: "index.ts", type: "file" }],
		openFiles: ["index.ts"],
		activeFile: "index.ts",
	})

	const syncPayload = await syncFilePromise
	assert(
		Array.isArray(syncPayload?.fileStructure),
		"The second client did not receive the cross-instance direct socket sync."
	)

	const receiveMessagePromise = onceSocketEvent(
		firstClient.socket,
		RECEIVE_MESSAGE
	)

	secondClient.socket.emit(SEND_MESSAGE, {
		message: {
			id: "cluster-message",
			username: "cluster-user-b",
			content: "Redis adapter sync works",
			timestamp: new Date().toISOString(),
		},
	})

	const messagePayload = await receiveMessagePromise
	assert(
		messagePayload?.message?.content === "Redis adapter sync works",
		"The first client did not receive the cross-instance chat message."
	)

	console.log("")
	console.log("PASS: multi-instance socket sync works across both servers.")
	console.log(
		`Verified ports ${instanceConfigs[0].port} and ${instanceConfigs[1].port} with Redis-backed pub/sub.`
	)
}

async function main() {
	try {
		await run()
		await cleanup()
		process.exit(0)
	} catch (error) {
		console.error("")
		console.error("FAIL:", error instanceof Error ? error.message : error)
		await cleanup()
		process.exit(1)
	}
}

void main()
