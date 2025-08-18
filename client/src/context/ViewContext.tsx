import { ViewType } from "@/components/sidebar/sidebar-views"
import { ReactNode, createContext, useContext, useState } from "react"

interface ViewContextType {
    activeView: ViewType
    setActiveView: (view: ViewType) => void
    isSidebarOpen: boolean
    setIsSidebarOpen: (isOpen: boolean) => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewContextProvider({ children }: { children: ReactNode }) {
    const [activeView, setActiveView] = useState<ViewType>("FILES")
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

    return (
        <ViewContext.Provider
            value={{
                activeView,
                setActiveView,
                isSidebarOpen,
                setIsSidebarOpen,
            }}
        >
            {children}
        </ViewContext.Provider>
    )
}

export function useViews() {
    const context = useContext(ViewContext)
    if (context === undefined) {
        throw new Error("useViews must be used within a ViewProvider")
    }
    return context
}
