import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import usePageEvents from "@/hooks/usePageEvents"
import useResponsive from "@/hooks/useResponsive"
import { editorThemes } from "@/resources/Themes"
import { FileSystemItem } from "@/types/file"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { LanguageName, loadLanguage } from "@uiw/codemirror-extensions-langs"
import CodeMirror, {
    Extension,
    ViewUpdate,
    scrollPastEnd,
} from "@uiw/react-codemirror"
import { useEffect, useMemo, useState, useRef } from "react"
import toast from "react-hot-toast"
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip"
import { tokyoNight } from "@uiw/codemirror-themes-all"
import { langs } from "@uiw/codemirror-extensions-langs"

function Editor() {
    const { users, currentUser } = useAppContext()
    const { activeFile, setActiveFile, updateFileContent } = useFileSystem()
    const { theme, language, fontSize, fontFamily } = useSettings()
    const { socket } = useSocket()
    const { viewHeight } = useResponsive()
    const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0))
    const filteredUsers = useMemo(
        () => users.filter((u) => u.username !== currentUser.username),
        [users, currentUser],
    )
    const [extensions, setExtensions] = useState<Extension[]>([])
    const editorRef = useRef<HTMLDivElement>(null)

    const onCodeChange = (code: string, view: ViewUpdate) => {
        if (!activeFile) return

        const file: FileSystemItem = { ...activeFile, content: code }
        setActiveFile(file)
        const cursorPosition = view.state?.selection?.main?.head
        socket.emit(SocketEvent.TYPING_START, { cursorPosition })
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: code,
        })
        clearTimeout(timeOut)

        const newTimeOut = setTimeout(
            () => socket.emit(SocketEvent.TYPING_PAUSE),
            1000,
        )
        setTimeOut(newTimeOut)
    }

    // Listen wheel event to zoom in/out and prevent page reload
    usePageEvents()

    useEffect(() => {
        const extensions = [
            color,
            hyperLink,
            tooltipField(filteredUsers),
            cursorTooltipBaseTheme,
            scrollPastEnd(),
        ]
        const langExt = loadLanguage(language.toLowerCase() as LanguageName)
        if (langExt) {
            extensions.push(langExt)
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                {
                    duration: 5000,
                },
            )
        }

        setExtensions(extensions)
    }, [filteredUsers, language])

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

    const handleChange = (value: string) => {
        if (!activeFile) return

        // Update file content
        updateFileContent(activeFile.id, value)

        // Emit content change event
        socket.emit("file-updated", {
            fileId: activeFile.id,
            content: value,
        })
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
                    ...getLanguageExtension(),
                ]}
                className="h-full w-full [&_.cm-editor]:bg-black [&_.cm-scroller]:bg-black [&_.cm-gutters]:bg-black [&_.cm-activeLineGutter]:bg-zinc-900 [&_.cm-activeLine]:bg-zinc-900"
            />
        </div>
    )
}

export default Editor
