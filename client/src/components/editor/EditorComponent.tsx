import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import Editor from "./Editor"
import FileTab from "./FileTab"

function EditorComponent() {
    const { socket } = useSocket()
    const { activeFile } = useFileSystem()
    const { currentUser } = useAppContext()

    return (
        <div className="flex h-full w-full flex-col">
            {/* File Tabs */}
            <div className="flex w-full flex-wrap gap-1 border-b border-white/10 bg-black/30 p-2">
                <FileTab />
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 overflow-hidden">
                {activeFile ? (
                    <Editor />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                            <h3 className="mb-2 text-xl font-semibold text-white/80">
                                No File Selected
                            </h3>
                            <p className="text-sm text-white/60">
                                Open a file from the sidebar to start editing
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EditorComponent
