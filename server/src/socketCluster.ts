import { createAdapter } from "@socket.io/redis-adapter"
import { createClient, type RedisClientOptions } from "redis"
import type { Server } from "socket.io"
import type { User } from "./types/user"

const DEFAULT_REDIS_PORT = 6379
const DEFAULT_REDIS_DB = 0
const DEFAULT_USERNAME_TTL_SECONDS = 45
const MINIMUM_REFRESH_INTERVAL_MS = 5000
type SocketRedisClient = ReturnType<typeof createClient>

export interface SocketClusterState {
	pubClient: SocketRedisClient | null
	subClient: SocketRedisClient | null
	usernameReservationTtlSeconds: number
}

function normalizeUsername(username: string): string {
	return username.trim().toLowerCase()
}

function getUsernameReservationKey(roomId: string, username: string): string {
	return `code-collab:rooms:${roomId}:usernames:${normalizeUsername(username)}`
}

function getRedisSocketOptionsFromAddress(
	redisAddress: string
): RedisClientOptions | null {
	const trimmedAddress = redisAddress.trim()

	if (!trimmedAddress) {
		return null
	}

	if (
		trimmedAddress.startsWith("redis://") ||
		trimmedAddress.startsWith("rediss://")
	) {
		return { url: trimmedAddress }
	}

	const [host, portValue] = trimmedAddress.split(":")
	const port = Number(portValue ?? DEFAULT_REDIS_PORT)

	if (!host) {
		return null
	}

	return {
		socket: {
			host,
			port: Number.isFinite(port) && port > 0 ? port : DEFAULT_REDIS_PORT,
		},
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		database: Number(process.env.REDIS_DB ?? DEFAULT_REDIS_DB),
	}
}

function getRedisOptions(): RedisClientOptions | null {
	if (process.env.REDIS_URL) {
		return { url: process.env.REDIS_URL }
	}

	if (process.env.REDIS_ADDR) {
		return getRedisSocketOptionsFromAddress(process.env.REDIS_ADDR)
	}

	if (!process.env.REDIS_HOST) {
		return null
	}

	return {
		socket: {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT ?? DEFAULT_REDIS_PORT),
		},
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		database: Number(process.env.REDIS_DB ?? DEFAULT_REDIS_DB),
	}
}

function getUsernameReservationTtlSeconds(): number {
	const ttl = Number(
		process.env.REDIS_USERNAME_TTL_SECONDS ?? DEFAULT_USERNAME_TTL_SECONDS
	)

	return Number.isFinite(ttl) && ttl > 0
		? Math.floor(ttl)
		: DEFAULT_USERNAME_TTL_SECONDS
}

async function isSocketActive(io: Server, socketId: string): Promise<boolean> {
	const sockets = await io.in(socketId).fetchSockets()
	return sockets.length > 0
}

export function getSocketUser(socket: { data: { user?: User } }): User | null {
	return socket.data.user ?? null
}

export async function getUsersInRoom(io: Server, roomId: string): Promise<User[]> {
	const sockets = await io.in(roomId).fetchSockets()

	return sockets
		.map((socket) => getSocketUser(socket))
		.filter((user): user is User => user !== null)
}

export function setSocketUser(
	socket: { data: { user?: User } },
	user: User | null
): void {
	if (user) {
		socket.data.user = user
		return
	}

	delete socket.data.user
}

export async function reserveUsername(
	io: Server,
	clusterState: SocketClusterState,
	roomId: string,
	username: string,
	socketId: string
): Promise<boolean> {
	const normalizedUsername = normalizeUsername(username)

	if (!normalizedUsername) {
		return false
	}

	if (!clusterState.pubClient) {
		const users = await getUsersInRoom(io, roomId)
		return !users.some(
			(user) => normalizeUsername(user.username) === normalizedUsername
		)
	}

	const reservationKey = getUsernameReservationKey(roomId, username)

	for (let attempt = 0; attempt < 2; attempt++) {
		const reservationResult = await clusterState.pubClient.set(
			reservationKey,
			socketId,
			{
				NX: true,
				EX: clusterState.usernameReservationTtlSeconds,
			}
		)

		if (reservationResult === "OK") {
			return true
		}

		const existingSocketId = await clusterState.pubClient.get(reservationKey)

		if (!existingSocketId) {
			continue
		}

		const socketIsStillActive = await isSocketActive(io, existingSocketId)

		if (socketIsStillActive) {
			return false
		}

		const reservationOwner = await clusterState.pubClient.get(reservationKey)

		if (reservationOwner === existingSocketId) {
			await clusterState.pubClient.del(reservationKey)
		}
	}

	return false
}

export async function refreshUsernameReservation(
	clusterState: SocketClusterState,
	user: User
): Promise<void> {
	if (!clusterState.pubClient) {
		return
	}

	const reservationKey = getUsernameReservationKey(user.roomId, user.username)
	const reservationOwner = await clusterState.pubClient.get(reservationKey)

	if (reservationOwner !== user.socketId) {
		return
	}

	await clusterState.pubClient.expire(
		reservationKey,
		clusterState.usernameReservationTtlSeconds
	)
}

export async function releaseUsernameReservation(
	clusterState: SocketClusterState,
	user: User
): Promise<void> {
	if (!clusterState.pubClient) {
		return
	}

	const reservationKey = getUsernameReservationKey(user.roomId, user.username)
	const reservationOwner = await clusterState.pubClient.get(reservationKey)

	if (reservationOwner === user.socketId) {
		await clusterState.pubClient.del(reservationKey)
	}
}

export function getReservationRefreshIntervalMs(
	clusterState: SocketClusterState
): number {
	return Math.max(
		Math.floor((clusterState.usernameReservationTtlSeconds * 1000) / 3),
		MINIMUM_REFRESH_INTERVAL_MS
	)
}

export async function setupSocketCluster(
	io: Server
): Promise<SocketClusterState> {
	const redisOptions = getRedisOptions()
	const usernameReservationTtlSeconds = getUsernameReservationTtlSeconds()

	if (!redisOptions) {
		console.log(
			"Redis is not configured. Socket.IO will run in single-instance mode."
		)

		return {
			pubClient: null,
			subClient: null,
			usernameReservationTtlSeconds,
		}
	}

	const pubClient = createClient(redisOptions)
	const subClient = pubClient.duplicate()

	pubClient.on("error", (error) => {
		console.error("Redis pub client error:", error)
	})

	subClient.on("error", (error) => {
		console.error("Redis sub client error:", error)
	})

	await Promise.all([pubClient.connect(), subClient.connect()])

	io.adapter(createAdapter(pubClient, subClient))

	console.log("Redis adapter enabled for Socket.IO clustering.")

	return {
		pubClient,
		subClient,
		usernameReservationTtlSeconds,
	}
}

export async function closeSocketCluster(
	clusterState: SocketClusterState
): Promise<void> {
	await Promise.all([
		clusterState.pubClient?.quit(),
		clusterState.subClient?.quit(),
	])
}
