import { DrawingData } from "@/types/app"
import {
    SocketContext as SocketContextType,
    SocketEvent,
    SocketId,
} from "@/types/socket"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { useAppContext } from "./AppContext"

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

function getBackendUrl(): string {
    const defaultBackendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

    if (typeof window === "undefined") {
        return defaultBackendUrl
    }

    const searchParams = new URLSearchParams(window.location.search)
    const explicitBackend = searchParams.get("backend")

    if (explicitBackend) {
        return explicitBackend
    }

    const backendInstance = searchParams.get("backendInstance")

    if (backendInstance === "1") {
        return "http://127.0.0.1:4101"
    }

    if (backendInstance === "2") {
        return "http://127.0.0.1:4102"
    }

    return defaultBackendUrl
}

const BACKEND_URL = getBackendUrl()

const SOCKET_TRANSPORTS = import.meta.env.VITE_SOCKET_TRANSPORTS
    ?.split(",")
    .map((transport: string) => transport.trim())
    .filter(
        (transport: string): transport is "polling" | "websocket" =>
            transport === "polling" || transport === "websocket",
    )

const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
        currentUser,
    } = useAppContext()

    // Use useRef to maintain a stable socket instance
    const socketRef = useRef<Socket | null>(null)

    // Initialize socket if not already initialized
    if (!socketRef.current) {
        socketRef.current = io(BACKEND_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            autoConnect: false,
            forceNew: false,
            transports:
                SOCKET_TRANSPORTS && SOCKET_TRANSPORTS.length > 0
                    ? SOCKET_TRANSPORTS
                    : undefined,
        })
    }

    const handleError = useCallback(
        (err: any) => {
            console.error("Socket error:", err)
            setStatus(USER_STATUS.CONNECTION_FAILED)
            toast.dismiss()
            toast.error("Failed to connect to the server. Please try again.")
        },
        [setStatus],
    )

    // Keep a ref so the connect handler always sees the latest currentUser
    // without being re-created on every render (which would cause the useEffect
    // to re-register listeners on every keystroke).
    const currentUserRef = useRef(currentUser)
    useEffect(() => {
        currentUserRef.current = currentUser
    })

    const handleConnect = useCallback(() => {
        setStatus(USER_STATUS.INITIAL)

        // If we were in a room before losing the connection, rejoin automatically.
        const user = currentUserRef.current
        if (user.roomId && socketRef.current) {
            socketRef.current.emit(SocketEvent.JOIN_REQUEST, {
                roomId: user.roomId,
                username: user.username,
            })
        }
    }, [setStatus])

    const handleDisconnect = useCallback(() => {
        setStatus(USER_STATUS.DISCONNECTED)
    }, [setStatus])

    const handleReconnectFailed = useCallback(() => {
        setStatus(USER_STATUS.CONNECTION_FAILED)
        toast.error("Connection lost. Please refresh the page.")
    }, [setStatus])

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(USER_STATUS.INITIAL)
        toast.error(
            "The username you chose already exists in the room. Please choose a different username.",
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: User; users: RemoteUser[] }) => {
            console.log("Join accepted:", user)
            setCurrentUser(user)
            setUsers(users)
            toast.dismiss()
            setStatus(USER_STATUS.JOINED)
            toast.success("Successfully joined the room!")
        },
        [setCurrentUser, setStatus, setUsers],
    )

    const handleUserLeft = useCallback(
        ({ user }: { user: User }) => {
            toast.success(`${user.username} left the room`)
            setUsers(users.filter((u: User) => u.username !== user.username))
        },
        [setUsers, users],
    )

    const handleRequestDrawing = useCallback(
        ({ socketId }: { socketId: SocketId }) => {
            if (!socketRef.current) return
            socketRef.current.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData })
        },
        [drawingData],
    )

    const handleDrawingSync = useCallback(
        ({ drawingData }: { drawingData: DrawingData }) => {
            setDrawingData(drawingData)
        },
        [setDrawingData],
    )

    useEffect(() => {
        const socket = socketRef.current
        if (!socket) return

        // Connection event handlers
        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleError)
        socket.on("reconnect_failed", handleReconnectFailed)

        // Room event handlers
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)

        // Drawing event handlers
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)

        // Connect the socket once on mount
        if (!socket.connected) {
            socket.connect()
        }

        // Cleanup function
        return () => {
            socket.off("connect", handleConnect)
            socket.off("disconnect", handleDisconnect)
            socket.off("connect_error", handleError)
            socket.off("reconnect_failed", handleReconnectFailed)
            socket.off(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
            socket.off(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
            socket.off(SocketEvent.USER_DISCONNECTED, handleUserLeft)
            socket.off(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
            socket.off(SocketEvent.SYNC_DRAWING, handleDrawingSync)
        }
    }, [
        handleConnect,
        handleDisconnect,
        handleDrawingSync,
        handleError,
        handleJoiningAccept,
        handleReconnectFailed,
        handleRequestDrawing,
        handleUserLeft,
        handleUsernameExist,
    ])

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current!,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export { SocketProvider }
export default SocketContext
