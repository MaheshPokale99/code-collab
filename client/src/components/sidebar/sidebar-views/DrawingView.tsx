import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import useResponsive from "@/hooks/useResponsive"

function DrawingView() {
    const { viewHeight } = useResponsive()

    return (
        <div
            className="flex h-full w-full flex-col"
            style={{ height: viewHeight, maxHeight: viewHeight }}
        >
            <div className="view-title">Drawing Board</div>
            <div className="flex-1 overflow-hidden">
                <Tldraw />
            </div>
        </div>
    )
}

export default DrawingView 