import { useChatRoom } from "@/context/ChatContext"
import { useViews } from "@/context/ViewContext"
import { ViewType } from "./index"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { tooltipStyles } from "../tooltipStyles"
import cn from "classnames"
import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import { motion } from "framer-motion"

interface ViewButtonProps {
    viewName: ViewType
    icon: JSX.Element
}

const ViewButton = ({ viewName, icon }: ViewButtonProps) => {
    const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } =
        useViews()
    const { isNewMessage } = useChatRoom()
    const [showTooltip, setShowTooltip] = useState(true)
    const { setActivityState } = useAppContext()

    const handleViewClick = (viewName: ViewType) => {
        if (viewName === ViewType.DRAWING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            return
        }
        
        if (activeView === ViewType.DRAWING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (viewName === activeView) {
            setIsSidebarOpen(!isSidebarOpen)
        } else {
            setIsSidebarOpen(true)
            setActiveView(viewName)
        }
    }

    const isActive = activeView === viewName || (viewName === ViewType.DRAWING && activeView === ViewType.FILES)

    return (
        <div className="relative flex flex-col items-center">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewClick(viewName)}
                onMouseEnter={() => setShowTooltip(true)}
                className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 ease-in-out",
                    {
                        "bg-zinc-800 text-white shadow-lg ring-1 ring-zinc-700": isActive,
                        "text-zinc-400 hover:bg-zinc-800/50 hover:text-white": !isActive,
                    }
                )}
                {...(showTooltip && {
                    "data-tooltip-id": `tooltip-${String(viewName)}`,
                    "data-tooltip-content": String(viewName),
                })}
            >
                <motion.div 
                    className="flex items-center justify-center"
                    animate={{ rotate: isActive ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {icon}
                </motion.div>
                {/* Show dot for new message in chat View Button */}
                {viewName === ViewType.CHATS && isNewMessage && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-purple-500 ring-2 ring-black"
                    />
                )}
            </motion.button>
            {/* render the tooltip */}
            {showTooltip && (
                <Tooltip
                    id={`tooltip-${String(viewName)}`}
                    place="right"
                    offset={15}
                    className="!z-50"
                    style={tooltipStyles}
                    noArrow={false}
                    positionStrategy="fixed"
                    float={true}
                />
            )}
        </div>
    )
}

export default ViewButton
