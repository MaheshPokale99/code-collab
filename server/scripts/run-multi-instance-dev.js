const path = require("path")
const { spawn } = require("child_process")
const dotenv = require("dotenv")

const serverDir = path.resolve(__dirname, "..")
const envPath = path.join(serverDir, ".env")

dotenv.config({ path: envPath })

const instances = [
	{
		label: "server-1",
		port: Number(process.env.TEST_SERVER_ONE_PORT ?? 4101),
	},
	{
		label: "server-2",
		port: Number(process.env.TEST_SERVER_TWO_PORT ?? 4102),
	},
]

const childProcesses = []

function startInstance({ label, port }) {
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

	childProcesses.push(child)

	child.stdout.on("data", (chunk) => {
		process.stdout.write(`[${label}] ${String(chunk)}`)
	})

	child.stderr.on("data", (chunk) => {
		process.stderr.write(`[${label}] ${String(chunk)}`)
	})

	child.on("exit", (code) => {
		process.stdout.write(
			`[${label}] stopped with exit code ${code ?? "unknown"}\n`
		)
	})

	return child
}

function stopAll() {
	for (const child of childProcesses) {
		if (!child.killed) {
			child.kill()
		}
	}
}

function printUsage() {
	console.log("Started local multi-instance backend cluster.")
	console.log("")
	console.log("Backend instances:")
	console.log(`- server-1: http://127.0.0.1:${instances[0].port}`)
	console.log(`- server-2: http://127.0.0.1:${instances[1].port}`)
	console.log("")
	console.log("Client test URLs:")
	console.log("- http://localhost:5173/?backendInstance=1")
	console.log("- http://localhost:5173/?backendInstance=2")
	console.log("")
	console.log("Or use explicit backend URLs:")
	console.log(
		`- http://localhost:5173/?backend=http://127.0.0.1:${instances[0].port}`
	)
	console.log(
		`- http://localhost:5173/?backend=http://127.0.0.1:${instances[1].port}`
	)
	console.log("")
	console.log(
		"Join the same room from both browser windows. One socket will stay on server-1 and the other on server-2."
	)
	console.log("Press Ctrl+C to stop both backend instances.")
	console.log("")
}

function main() {
	printUsage()

	for (const instance of instances) {
		startInstance(instance)
	}

	process.on("SIGINT", () => {
		stopAll()
		process.exit(0)
	})

	process.on("SIGTERM", () => {
		stopAll()
		process.exit(0)
	})
}

main()
