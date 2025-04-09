import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-8 p-6 sm:w-[500px] sm:p-8">
            <div className="text-center">
                <h1 className="mb-3 text-4xl font-bold text-text">
                    Welcome to <span className="text-primary">Code Collab</span>
                </h1>
                <p className="text-lg text-text-secondary">
                    Join a room or create a new one to start coding together
                </p>
            </div>
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-6">
                <div className="space-y-2">
                    <label htmlFor="roomId" className="block text-sm font-medium text-text-secondary">
                        Room ID
                    </label>
                    <input
                        id="roomId"
                        type="text"
                        name="roomId"
                        placeholder="Enter room ID"
                        className="input-field"
                        onChange={handleInputChanges}
                        value={currentUser.roomId}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        className="input-field"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary mt-4"
                    disabled={status === USER_STATUS.ATTEMPTING_JOIN}
                >
                    {status === USER_STATUS.ATTEMPTING_JOIN ? "Joining..." : "Join Room"}
                </button>
            </form>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Don't have a room?</span>
                <button
                    className="btn-secondary font-medium"
                    onClick={createNewRoomId}
                >
                    Generate Room ID
                </button>
            </div>
        </div>
    )
}

export default FormComponent
