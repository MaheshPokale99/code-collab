import { useViews } from "@/context/ViewContext"
import { VIEWS, ViewType, viewComponents, viewIcons } from "./sidebar-views/index"
import SidebarButton from "./sidebar-views/SidebarButton"
import cn from "classnames"
import useResponsive from "@/hooks/useResponsive"
import { motion, AnimatePresence } from "framer-motion"

function Sidebar() {
    const { activeView, isSidebarOpen } = useViews()
    const { minHeightReached } = useResponsive()

    return (
        <aside className="flex h-full">
            {/* Navigation Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-[60px] w-full gap-4 self-end overflow-hidden border-t border-zinc-800 bg-black/90 p-3 backdrop-blur-xl md:static md:h-full md:w-[60px] md:min-w-[60px] md:flex-col md:border-r md:border-t-0 md:p-4 md:pt-6",
                    {
                        hidden: minHeightReached,
                    },
                )}
            >
                <div className="flex flex-1 items-center justify-around gap-4 md:flex-col md:justify-start">
                    <SidebarButton
                        viewName="FILES"
                        icon={viewIcons.FILES}
                    />
                    <SidebarButton
                        viewName="CHATS"
                        icon={viewIcons.CHATS}
                    />
                    <SidebarButton
                        viewName="COPILOT"
                        icon={viewIcons.COPILOT}
                    />
                    <SidebarButton
                        viewName="RUN"
                        icon={viewIcons.RUN}
                    />
                    <SidebarButton
                        viewName="CLIENTS"
                        icon={viewIcons.CLIENTS}
                    />
                    <SidebarButton
                        viewName="DRAWING"
                        icon={viewIcons.DRAWING}
                    />
                    <SidebarButton
                        viewName="SETTINGS"
                        icon={viewIcons.SETTINGS}
                    />
                </div>
            </motion.div>

            {/* View Content */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-0 z-20 h-full w-full flex-col border-r border-zinc-800 bg-black/90 backdrop-blur-xl md:static md:min-w-[320px]"
                    >
                        {viewComponents[activeView]}
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    )
}

export default Sidebar
