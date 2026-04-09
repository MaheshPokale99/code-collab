import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { LuUsers } from "react-icons/lu"

// Video calling is not available in this version.
// This view shows room participants only.
function VideoCallView() {
    const { viewHeight } = useResponsive()
    const { users, currentUser } = useAppContext()

    return (
        <div className="flex flex-col p-4" style={{ height: viewHeight }}>
            <h1 className="view-title">Participants</h1>

            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <LuUsers className="text-blue-400" size={20} />
                        <span className="text-white font-medium">Room Participants</span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        {users.length} user{users.length !== 1 ? "s" : ""} in room
                    </p>
                </div>

                <div className="flex-1">
                    <div className="space-y-2">
                        {users.map((user) => (
                            <div
                                key={user.socketId}
                                className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded-lg"
                            >
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm">
                                        {user.username}
                                        {user.username === currentUser.username && (
                                            <span className="text-blue-400 ml-2">(You)</span>
                                        )}
                                    </p>
                                    <p className="text-zinc-400 text-xs">
                                        {user.status === "online" ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCallView
