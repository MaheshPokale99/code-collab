import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        // If the file is already active, do nothing
        if (activeFile?.id === fileId) return

        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 100
            } else {
                fileTabNode.scrollLeft -= 100
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel)

        return () => {
            fileTabNode.removeEventListener("wheel", handleWheel)
        }
    }, [])

    // Update the editor language when a file is opened
    useEffect(() => {
        if (activeFile?.name === undefined) return
        // Get file extension on file open and set language when file is opened
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        // Check if custom mapping exists
        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    return (
        <div
            className="flex h-[50px] w-full select-none gap-2 overflow-x-auto border-b border-zinc-800 bg-black p-2 pb-0"
            ref={fileTabRef}
        >
            {openFiles.map((file) => (
                <span
                    key={file.id}
                    className={cn(
                        "group flex w-fit cursor-pointer items-center rounded-t-md border-t border-x border-transparent px-3 py-2 text-white transition-all duration-200",
                        { 
                            "border-t-purple-500 bg-zinc-900 shadow-glow-sm": file.id === activeFile?.id,
                            "hover:border-zinc-700 hover:bg-zinc-900/50": file.id !== activeFile?.id
                        }
                    )}
                    onClick={() => changeActiveFile(file.id)}
                >
                    <Icon
                        icon={getIconClassName(file.name)}
                        fontSize={20}
                        className="mr-2 min-w-fit text-zinc-400 group-hover:text-white"
                    />
                    <p
                        className="flex-grow cursor-pointer overflow-hidden truncate text-sm font-medium"
                        title={file.name}
                    >
                        {file.name}
                    </p>
                    <IoClose
                        className="ml-3 inline rounded-md p-1 text-zinc-400 opacity-0 transition-all duration-200 hover:bg-zinc-800 hover:text-white group-hover:opacity-100"
                        size={18}
                        onClick={(e) => {
                            e.stopPropagation()
                            closeFile(file.id)
                        }}
                    />
                </span>
            ))}
        </div>
    )
}

export default FileTab
