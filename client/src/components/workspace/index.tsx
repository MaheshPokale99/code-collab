import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"
import { useState } from "react"
import { LuPhone } from "react-icons/lu"
import VideoCall from "@/components/video/VideoCall"

function WorkSpace() {
    const { viewHeight } = useResponsive()
    const { activityState, users } = useAppContext()
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)

    return (
        <div className="relative flex-1 overflow-hidden">
            {/* Main Content */}
            <div
                className="absolute left-0 top-0 w-full max-w-full flex-grow overflow-x-hidden md:static md:h-full"
                style={{ height: viewHeight }}
            >
                <div className="h-full w-full rounded-lg border border-white/10 bg-black/50 backdrop-blur-sm">
                    {activityState === ACTIVITY_STATE.DRAWING ? (
                        <DrawingEditor />
                    ) : (
                        <EditorComponent />
                    )}
                </div>
            </div>

            {/* Floating Video Call Button */}
            {users.length > 1 && (
                <button
                    onClick={() => setIsVideoCallOpen(true)}
                    className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 hover:scale-110"
                    title="Start Video Call"
                >
                    <LuPhone size={24} />
                </button>
            )}

            {/* Video Call Modal */}
            <VideoCall 
                isOpen={isVideoCallOpen} 
                onClose={() => setIsVideoCallOpen(false)} 
            />
        </div>
    )
}

export default WorkSpace
