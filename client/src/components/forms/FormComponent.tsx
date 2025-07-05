import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { LuUsers, LuUser } from "react-icons/lu"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const [isJoining, setIsJoining] = useState(false)
    const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const createNewRoomId = () => {
        const newRoomId = uuidv4()
        setCurrentUser({ ...currentUser, roomId: newRoomId })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value.trim()
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (!socket.connected) {
            toast.error("Not connected to server. Please wait or refresh the page.")
            return false
        }
        
        const username = currentUser.username.trim()
        const roomId = currentUser.roomId.trim()

        if (username.length === 0) {
            toast.error("Enter your username")
            usernameRef.current?.focus()
            return false
        } else if (roomId.length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (roomId.length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (username.length < 3) {
            toast.error("Username must be at least 3 characters long")
            usernameRef.current?.focus()
            return false
        }
        return true
    }

    const joinRoom = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (isJoining) {
            console.log("Already attempting to join...")
            return
        }

        if (!validateForm()) return

        const cleanUsername = currentUser.username.trim()
        const cleanRoomId = currentUser.roomId.trim()
        
        // Update the current user with cleaned values
        setCurrentUser({
            username: cleanUsername,
            roomId: cleanRoomId
        })

        console.log("Attempting to join room:", cleanRoomId)
        setIsJoining(true)
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        
        // Emit join request
        socket.emit(SocketEvent.JOIN_REQUEST, {
            username: cleanUsername,
            roomId: cleanRoomId
        })
    }

    useEffect(() => {
        // Handle room ID from URL if present
        if (currentUser.roomId.length === 0 && location.state?.roomId) {
            console.log("Setting room ID from location state:", location.state.roomId)
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            usernameRef.current?.focus()
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        // Handle navigation when joined
        if (status === USER_STATUS.JOINED && currentUser.roomId) {
            const roomId = currentUser.roomId.trim()
            console.log("Navigation triggered. Status:", status, "RoomId:", roomId)
            
            // Reset joining state
            setIsJoining(false)
            
            // Navigate immediately when joined
            navigate(`/editor/${roomId}`, {
                state: { username: currentUser.username },
                replace: true
            })
        }
    }, [currentUser.roomId, currentUser.username, navigate, status])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (joinTimeoutRef.current) {
                clearTimeout(joinTimeoutRef.current)
            }
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="flex w-full flex-col items-center justify-center gap-8">
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <LuUsers className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="roomId"
                        type="text"
                        name="roomId"
                        placeholder="Enter room ID"
                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        onChange={handleInputChanges}
                        value={currentUser.roomId}
                        disabled={isJoining}
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <LuUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                        disabled={isJoining}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-3 font-medium text-white transition-all duration-200 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                    disabled={isJoining || !socket.connected}
                >
                    {isJoining ? "Joining..." : "Join Room"}
                </button>
            </form>
            <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Don't have a room?</span>
                <button
                    className="font-medium text-purple-400 hover:text-purple-300 focus:outline-none disabled:opacity-50"
                    onClick={createNewRoomId}
                    type="button"
                    disabled={isJoining}
                >
                    Generate Room ID
                </button>
            </div>
        </div>
    )
}

export default FormComponent
