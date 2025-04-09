import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import cn from "classnames"
import Editor from "./Editor"
import FileTab from "./FileTab"

function EditorComponent() {
    const { openFiles } = useFileSystem()
    const { minHeightReached } = useResponsive()

    if (openFiles.length <= 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full bg-surface p-4 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-text">
                    No File Open
                </h1>
                <p className="max-w-md text-text-secondary">
                    Open a file from the sidebar or create a new one to start coding. Your changes will be automatically saved.
                </p>
            </div>
        )
    }

    return (
        <main
            className={cn("flex w-full flex-col overflow-x-auto md:h-screen", {
                "h-[calc(100vh-50px)]": !minHeightReached,
                "h-full": minHeightReached,
            })}
        >
            <FileTab />
            <div className="relative flex-1">
                <Editor />
            </div>
        </main>
    )
}

export default EditorComponent
