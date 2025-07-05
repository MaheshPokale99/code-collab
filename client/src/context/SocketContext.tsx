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
    useState,
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
        currentUser,
        status,
    } = useAppContext()

    // Use useRef to maintain a stable socket instance
    const socketRef = useRef<Socket | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5

    // Initialize socket if not already initialized
    if (!socketRef.current) {
        console.log("Initializing socket connection...")
        socketRef.current = io(BACKEND_URL, {
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 10000,
            autoConnect: false,
            forceNew: false,
        })
    }

    const handleError = useCallback(
        (err: any) => {
            console.error("Socket error:", err)
            setStatus(USER_STATUS.CONNECTION_FAILED)
            toast.dismiss()
            toast.error("Failed to connect to the server. Please try again.")
            setIsConnecting(false)
        },
        [setStatus],
    )

    const handleConnect = useCallback(() => {
        console.log("Socket connected successfully")
        setStatus(USER_STATUS.INITIAL)
        setIsConnecting(false)
        reconnectAttempts.current = 0

        // If we were in a room, try to rejoin
        if (currentUser.roomId && status === USER_STATUS.DISCONNECTED) {
            console.log("Attempting to rejoin room:", currentUser.roomId)
            socketRef.current?.emit(SocketEvent.JOIN_REQUEST, currentUser)
        }
    }, [setStatus, currentUser, status])

    const handleDisconnect = useCallback(() => {
        console.log("Socket disconnected")
        setStatus(USER_STATUS.DISCONNECTED)
        setIsConnecting(false)

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            console.log(`Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`)
            setTimeout(() => {
                if (socketRef.current && !socketRef.current.connected) {
                    console.log("Attempting to reconnect...")
                    setIsConnecting(true)
                    socketRef.current.connect()
                }
            }, 1000 * reconnectAttempts.current) // Exponential backoff
        } else {
            console.log("Max reconnection attempts reached")
            setStatus(USER_STATUS.CONNECTION_FAILED)
            toast.error("Connection lost. Please refresh the page.")
        }
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
        socket.on("connect_failed", handleError)

        // Room event handlers
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)

        // Drawing event handlers
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)

        // Connect socket if not connected
        if (!socket.connected && !isConnecting) {
            console.log("Connecting socket...")
            setIsConnecting(true)
            socket.connect()
        }

        // Cleanup function
        return () => {
            console.log("Cleaning up socket event listeners...")
            socket.off("connect")
            socket.off("disconnect")
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(SocketEvent.USERNAME_EXISTS)
            socket.off(SocketEvent.JOIN_ACCEPTED)
            socket.off(SocketEvent.USER_DISCONNECTED)
            socket.off(SocketEvent.REQUEST_DRAWING)
            socket.off(SocketEvent.SYNC_DRAWING)
            // Don't disconnect here, just remove listeners
        }
    }, [
        handleConnect,
        handleDisconnect,
        handleDrawingSync,
        handleError,
        handleJoiningAccept,
        handleRequestDrawing,
        handleUserLeft,
        handleUsernameExist,
        isConnecting,
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
