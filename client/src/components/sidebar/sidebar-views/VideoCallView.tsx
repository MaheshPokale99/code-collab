import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { useState } from "react"
import { LuPhone, LuUsers } from "react-icons/lu"
import VideoCall from "@/components/video/VideoCall"

function VideoCallView() {
    const { viewHeight } = useResponsive()
    const { users, currentUser } = useAppContext()
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)

    return (
        <>
            <div className="flex flex-col p-4" style={{ height: viewHeight }}>
                <h1 className="view-title">Video Call</h1>
                
                <div className="flex-1 flex flex-col gap-4">
                    {/* Call Status */}
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <LuUsers className="text-blue-400" size={20} />
                            <span className="text-white font-medium">Room Participants</span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            {users.length} user{users.length !== 1 ? 's' : ''} in room
                        </p>
                    </div>

                    {/* Call Controls */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setIsVideoCallOpen(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            <LuPhone size={20} />
                            Start Video Call
                        </button>

                        <div className="text-center text-zinc-400 text-sm">
                            Start a video call with all users in the room
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="flex-1">
                        <h3 className="text-white font-medium mb-3">Participants</h3>
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
                                            {user.status === 'online' ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Call Modal */}
            <VideoCall 
                isOpen={isVideoCallOpen} 
                onClose={() => setIsVideoCallOpen(false)} 
            />
        </>
    )
}

export default VideoCallView
