import express, { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import { SocketEvent } from "./types/socket"
import { USER_CONNECTION_STATUS } from "./types/user"
import { Server, Socket } from "socket.io"
import path from "path"
import {
	closeSocketCluster,
	getReservationRefreshIntervalMs,
	getSocketUser,
	getUsersInRoom,
	refreshUsernameReservation,
	releaseUsernameReservation,
	reserveUsername,
	setSocketUser,
	setupSocketCluster,
	type SocketClusterState,
} from "./socketCluster"

dotenv.config()

function getSocketTransports(): Array<"polling" | "websocket"> | undefined {
	const configuredTransports = process.env.SOCKET_IO_TRANSPORTS

	if (!configuredTransports) {
		return undefined
	}

	const transports = configuredTransports
		.split(",")
		.map((transport) => transport.trim())
		.filter(
			(transport): transport is "polling" | "websocket" =>
				transport === "polling" || transport === "websocket"
		)

	return transports.length > 0 ? transports : undefined
}

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static(path.join(__dirname, "public"))) // Serve static files

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
	transports: getSocketTransports(),
})

const reservationRefreshIntervals = new Map<string, NodeJS.Timeout>()

function stopUsernameReservationRefresh(socketId: string): void {
	const refreshInterval = reservationRefreshIntervals.get(socketId)

	if (!refreshInterval) {
		return
	}

	clearInterval(refreshInterval)
	reservationRefreshIntervals.delete(socketId)
}

function startUsernameReservationRefresh(
	socketId: string,
	clusterState: SocketClusterState,
	getUser: () => ReturnType<typeof getSocketUser>
): void {
	stopUsernameReservationRefresh(socketId)

	if (!clusterState.pubClient) {
		return
	}

	const refreshIntervalMs = getReservationRefreshIntervalMs(clusterState)
	const refreshInterval = setInterval(() => {
		const user = getUser()

		if (!user) {
			stopUsernameReservationRefresh(socketId)
			return
		}

		void refreshUsernameReservation(clusterState, user).catch((error) => {
			console.error("Failed to refresh username reservation:", error)
		})
	}, refreshIntervalMs)

	refreshInterval.unref()
	reservationRefreshIntervals.set(socketId, refreshInterval)
}

function getSocketRoomId(socket: Socket): string | null {
	const user = getSocketUser(socket)

	if (!user) {
		console.error("User not found for socket ID:", socket.id)
		return null
	}

	return user.roomId
}

function registerSocketHandlers(clusterState: SocketClusterState): void {
	io.on("connection", (socket) => {
		const getCurrentUser = () => getSocketUser(socket)

	// Handle user actions
		socket.on(SocketEvent.JOIN_REQUEST, async ({ roomId, username }) => {
			const reserved = await reserveUsername(
				io,
				clusterState,
				roomId,
				username,
				socket.id
			)

			if (!reserved) {
				io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
				return
			}

			const user = {
				username: username.trim(),
				roomId,
				status: USER_CONNECTION_STATUS.ONLINE,
				cursorPosition: 0,
				typing: false,
				socketId: socket.id,
				currentFile: null,
			}

			try {
				setSocketUser(socket, user)
				startUsernameReservationRefresh(socket.id, clusterState, getCurrentUser)
				socket.join(roomId)

				const users = await getUsersInRoom(io, roomId)

				socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
				io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
			} catch (error) {
				stopUsernameReservationRefresh(socket.id)
				setSocketUser(socket, null)
				await releaseUsernameReservation(clusterState, user)
				console.error("Failed to join room:", error)
				socket.emit("error", "Failed to join the room.")
			}
		})

		socket.on("disconnecting", () => {
			const user = getCurrentUser()

			if (!user) {
				return
			}

			socket.broadcast
				.to(user.roomId)
				.emit(SocketEvent.USER_DISCONNECTED, { user })

			stopUsernameReservationRefresh(socket.id)
			void releaseUsernameReservation(clusterState, user).catch((error) => {
				console.error("Failed to release username reservation:", error)
			})
			setSocketUser(socket, null)
		})

		socket.on("disconnect", () => {
			stopUsernameReservationRefresh(socket.id)
		})

	// Handle file actions
		socket.on(
			SocketEvent.SYNC_FILE_STRUCTURE,
			({ fileStructure, openFiles, activeFile, socketId }) => {
				io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
					fileStructure,
					openFiles,
					activeFile,
				})
			}
		)

		socket.on(
			SocketEvent.DIRECTORY_CREATED,
			({ parentDirId, newDirectory }) => {
				const roomId = getSocketRoomId(socket)
				if (!roomId) return
				socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
					parentDirId,
					newDirectory,
				})
			}
		)

		socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
				dirId,
				children,
			})
		})

		socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
				dirId,
				newName,
			})
		})

		socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
		})

		socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
		})

		socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
				fileId,
				newContent,
			})
		})

		socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
				fileId,
				newName,
			})
		})

		socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
		})

	// Handle user status
		socket.on(SocketEvent.USER_OFFLINE, () => {
			const user = getCurrentUser()

			if (!user) return

			setSocketUser(socket, {
				...user,
				status: USER_CONNECTION_STATUS.OFFLINE,
			})

			socket.broadcast
				.to(user.roomId)
				.emit(SocketEvent.USER_OFFLINE, { socketId: socket.id })
		})

		socket.on(SocketEvent.USER_ONLINE, () => {
			const user = getCurrentUser()

			if (!user) return

			setSocketUser(socket, {
				...user,
				status: USER_CONNECTION_STATUS.ONLINE,
			})

			socket.broadcast
				.to(user.roomId)
				.emit(SocketEvent.USER_ONLINE, { socketId: socket.id })
		})

	// Handle chat actions
		socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.RECEIVE_MESSAGE, { message })
		})

	// Handle cursor position
		socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
			const user = getCurrentUser()

			if (!user) return

			const updatedUser = { ...user, typing: true, cursorPosition }
			setSocketUser(socket, updatedUser)
			socket.broadcast
				.to(updatedUser.roomId)
				.emit(SocketEvent.TYPING_START, { user: updatedUser })
		})

		socket.on(SocketEvent.TYPING_PAUSE, () => {
			const user = getCurrentUser()

			if (!user) return

			const updatedUser = { ...user, typing: false }
			setSocketUser(socket, updatedUser)
			socket.broadcast
				.to(updatedUser.roomId)
				.emit(SocketEvent.TYPING_PAUSE, { user: updatedUser })
		})

		socket.on(SocketEvent.REQUEST_DRAWING, () => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
		})

		socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
			socket.broadcast
				.to(socketId)
				.emit(SocketEvent.SYNC_DRAWING, { drawingData })
		})

		socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
			const roomId = getSocketRoomId(socket)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, {
				snapshot,
			})
		})

	// Handle video call events
		socket.on(SocketEvent.VIDEO_CALL_START, () => {
			const user = getCurrentUser()
			if (!user) return

			// Broadcast to all users in the room except the sender
			socket.broadcast.to(user.roomId).emit(SocketEvent.VIDEO_CALL_START, {
				from: user.username,
				peerId: socket.id,
			})
		})

		socket.on(SocketEvent.VIDEO_CALL_END, () => {
			const user = getCurrentUser()
			if (!user) return

			// Broadcast to all users in the room
			socket.broadcast.to(user.roomId).emit(SocketEvent.VIDEO_CALL_END, {
				from: user.username,
			})
		})

		socket.on(SocketEvent.VIDEO_ANSWER, ({ answer, to }) => {
			// Forward the answer to the specific peer
			io.to(to).emit(SocketEvent.VIDEO_ANSWER, {
				from: socket.id,
				answer,
			})
		})

		socket.on(SocketEvent.ICE_CANDIDATE, ({ candidate, to }) => {
			// Forward ICE candidate to the specific peer
			io.to(to).emit(SocketEvent.ICE_CANDIDATE, {
				from: socket.id,
				candidate,
			})
		})
	})
}

const PORT = process.env.PORT || 3000

app.get("/", (req: Request, res: Response) => {
	// Send the index.html file
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

async function shutdown(
	signal: string,
	clusterState: SocketClusterState
): Promise<void> {
	console.log(`${signal} received. Shutting down gracefully...`)

	await closeSocketCluster(clusterState)

	await new Promise<void>((resolve) => {
		server.close(() => {
			resolve()
		})
	})

	process.exit(0)
}

async function startServer(): Promise<void> {
	const clusterState = await setupSocketCluster(io)

	registerSocketHandlers(clusterState)

	server.listen(PORT, () => {
		console.log(`Listening on port ${PORT}`)
	})

	process.on("SIGINT", () => {
		void shutdown("SIGINT", clusterState)
	})

	process.on("SIGTERM", () => {
		void shutdown("SIGTERM", clusterState)
	})
}

void startServer().catch((error) => {
	console.error("Failed to start server:", error)
	process.exit(1)
})
