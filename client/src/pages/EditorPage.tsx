import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect, useRef } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"

function EditorPage() {
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser, setStatus } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const hasJoinedRef = useRef(false)


    useEffect(() => {
        // If we don't have a roomId in the URL, redirect to home
        if (!roomId) {
            console.log("No roomId in URL, redirecting to home")
            navigate("/")
            return
        }

        // If we have a username from location state but no currentUser username
        if (!currentUser.username && location.state?.username) {
            console.log("Setting up new user from location state")
            const newUser: User = {
                username: location.state.username,
                roomId: roomId
            }
            setCurrentUser(newUser)
            
            // Only emit join request if we're not already attempting to join
            if (status !== USER_STATUS.ATTEMPTING_JOIN && !hasJoinedRef.current) {
                console.log("Emitting join request for new user")
                setStatus(USER_STATUS.ATTEMPTING_JOIN)
                socket.emit(SocketEvent.JOIN_REQUEST, newUser)
                hasJoinedRef.current = true
            }
            return
        }

        // If we have no username at all, redirect to home
        if (!currentUser.username && !location.state?.username) {
            console.log("No username found, redirecting to home")
            navigate("/", {
                state: { roomId },
                replace: true
            })
            return
        }

        // If we have a currentUser but different roomId, update it
        if (currentUser.username && currentUser.roomId !== roomId && !hasJoinedRef.current) {
            console.log("Updating room ID for existing user")
            const updatedUser = { ...currentUser, roomId }
            setCurrentUser(updatedUser)
            
            if (status !== USER_STATUS.ATTEMPTING_JOIN) {
                console.log("Emitting join request for updated user")
                setStatus(USER_STATUS.ATTEMPTING_JOIN)
                socket.emit(SocketEvent.JOIN_REQUEST, updatedUser)
                hasJoinedRef.current = true
            }
        }
    }, [
        currentUser,
        location.state,
        navigate,
        roomId,
        setCurrentUser,
        socket,
        status,
        setStatus
    ])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log("EditorPage unmounting, cleaning up...")
            hasJoinedRef.current = false
        }
    }, [])

    useEffect(() => {
        // Handle connection failures
        if (status === USER_STATUS.CONNECTION_FAILED) {
            toast.error("Failed to connect to the room. Redirecting to home...")
            setTimeout(() => {
                navigate("/", { replace: true })
            }, 2000)
        }
    }, [status, navigate])

    // Handle successful join
    useEffect(() => {
        if (status === USER_STATUS.JOINED) {
            console.log("Successfully joined room")
        }
    }, [status])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    if (!currentUser.username || !roomId || status === USER_STATUS.ATTEMPTING_JOIN) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="text-center">
                <h2 className="text-xl mb-2">Loading...</h2>
                <p className="text-zinc-400">Setting up your workspace</p>
            </div>
        </div>
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-black">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-4 top-0 h-[40rem] w-[40rem] animate-pulse-slow rounded-full bg-purple-500/5 blur-3xl opacity-20" />
                <div className="absolute -right-4 bottom-0 h-[40rem] w-[40rem] animate-pulse-slow rounded-full bg-blue-500/5 blur-3xl opacity-20" />
                <div className="absolute left-1/2 top-1/2 h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-indigo-500/5 blur-3xl opacity-10" />
            </div>

            {/* Main content */}
            <div className="relative flex h-full overflow-hidden">
                <SplitterComponent>
                    <Sidebar />
                    <WorkSpace/>
                </SplitterComponent>
            </div>
        </div>
    )
}

export default EditorPage
