import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import usePageEvents from "@/hooks/usePageEvents"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import CodeMirror, { ViewUpdate, scrollPastEnd } from "@uiw/react-codemirror"
import { useEffect, useRef } from "react"
import { tokyoNight } from "@uiw/codemirror-themes-all"
import { langs } from "@uiw/codemirror-extensions-langs"
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip"

function Editor() {
    const { users, currentUser } = useAppContext()
    const { activeFile, updateFileContent } = useFileSystem()
    const { language, fontFamily } = useSettings()
    const { socket } = useSocket()
    const editorRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<number | null>(null)
    const lastContentRef = useRef<string>("")

    // Other users to show cursors for (filter out self)
    const getOtherUsers = () => users.filter(u => u.username !== currentUser.username)

    // Listen wheel event to zoom in/out and prevent page reload
    usePageEvents()

    // Apply font family to editor
    useEffect(() => {
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    useEffect(() => {
        const handleResize = () => {
            if (editorRef.current) {
                const height = editorRef.current.clientHeight
                editorRef.current.style.height = `${height}px`
            }
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const handleChange = (value: string, viewUpdate?: ViewUpdate) => {
        if (!activeFile) return

        // Update file content locally
        updateFileContent(activeFile.id, value)

        // Only emit typing events if content actually changed
        if (value !== lastContentRef.current) {
            // Emit cursor typing start with current position
            const cursorPosition = viewUpdate?.state.selection.main.head || 0
            socket.emit(SocketEvent.TYPING_START, { cursorPosition })

            // Emit file updated with correct payload shape
            socket.emit(SocketEvent.FILE_UPDATED, {
                fileId: activeFile.id,
                newContent: value,
            })

            // Update last content
            lastContentRef.current = value

            // Debounce typing pause
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = window.setTimeout(() => {
                socket.emit(SocketEvent.TYPING_PAUSE)
            }, 1000)
        }
    }

    const getLanguageExtension = () => {
        if (!language || !(language in langs)) return []
        const langFunction = langs[language as keyof typeof langs]
        return [langFunction()]
    }

    return (
        <div
            ref={editorRef}
            className="h-full w-full overflow-hidden bg-black"
        >
            <CodeMirror
                value={activeFile?.content || ""}
                height="100%"
                theme={tokyoNight}
                onChange={handleChange}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightSelectionMatches: true,
                    foldKeymap: true,
                    closeBracketsKeymap: true,
                    defaultKeymap: true,
                    searchKeymap: true,
                    historyKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                }}
                extensions={[
                    hyperLink,
                    color,
                    tooltipField(getOtherUsers),
                    cursorTooltipBaseTheme,
                    scrollPastEnd(),
                    ...getLanguageExtension(),
                ]}
                className="h-full w-full [&_.cm-editor]:bg-black [&_.cm-scroller]:bg-black [&_.cm-gutters]:bg-black [&_.cm-activeLineGutter]:bg-zinc-900 [&_.cm-activeLine]:bg-zinc-900"
            />
        </div>
    )
}

export default Editor
