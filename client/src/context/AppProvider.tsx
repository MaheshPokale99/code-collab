import { ReactNode } from "react"
import { AppContextProvider } from "./AppContext.tsx"
import { ChatContextProvider } from "./ChatContext.tsx"
import { FileContextProvider } from "./FileContext.tsx"
import { RunCodeContextProvider } from "./RunCodeContext.tsx"
import { SettingContextProvider } from "./SettingContext.tsx"
import { SocketProvider } from "./SocketContext.tsx"
import { ViewContextProvider } from "./ViewContext.tsx"
import { CopilotContextProvider } from "./CopilotContext.tsx"

function AppProvider({ children }: { children: ReactNode }) {
    return (
        <AppContextProvider>
            <SocketProvider>
                <SettingContextProvider>
                    <ViewContextProvider>
                        <FileContextProvider>
                            <CopilotContextProvider>
                                <RunCodeContextProvider>
                                    <ChatContextProvider>
                                        {children}
                                    </ChatContextProvider>
                                </RunCodeContextProvider>
                            </CopilotContextProvider>
                        </FileContextProvider>
                    </ViewContextProvider>
                </SettingContextProvider>
            </SocketProvider>
        </AppContextProvider>
    )
}

export default AppProvider
