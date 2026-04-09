import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"

function WorkSpace() {
    const { viewHeight } = useResponsive()
    const { activityState } = useAppContext()

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
        </div>
    )
}

export default WorkSpace
