import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { PiPencilSimpleFill } from "react-icons/pi"
import {
    RiFileAddLine,
    RiFolderAddLine,
    RiFolderUploadLine,
} from "react-icons/ri"
import RenameView from "./RenameView"
import useResponsive from "@/hooks/useResponsive"

function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } =
        useFileSystem()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)
    const { viewHeight } = useResponsive()

    const handleClickOutside = (e: MouseEvent) => {
        if (
            explorerRef.current &&
            !explorerRef.current.contains(e.target as Node)
        ) {
            setSelectedDirId(fileStructure.id)
        }
    }

    const handleCreateFile = () => {
        const fileName = prompt("Enter file name")
        if (fileName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createFile(parentDirId, fileName)
        }
    }

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name")
        if (dirName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createDirectory(parentDirId, dirName)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div className="flex h-full flex-col" style={{ height: viewHeight }}>
            <div className="flex h-full flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 bg-black/30 p-4">
                    <h2 className="text-lg font-semibold text-white/80">Files</h2>
                    <div className="flex gap-2">
                        <button
                            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                            onClick={handleCreateFile}
                            title="Create File"
                        >
                            <RiFileAddLine size={20} />
                        </button>
                        <button
                            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                            onClick={handleCreateDirectory}
                            title="Create Directory"
                        >
                            <RiFolderAddLine size={20} />
                        </button>
                        <button
                            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                            onClick={collapseDirectories}
                            title="Collapse All Directories"
                        >
                            <RiFolderUploadLine size={20} />
                        </button>
                    </div>
                </div>
                <div
                    className="flex-1 overflow-y-auto p-2"
                    ref={explorerRef}
                    onClick={handleClickOutside}
                >
                    {sortedFileStructure.children &&
                        sortedFileStructure.children.map((item) => (
                            <Directory
                                key={item.id}
                                item={item}
                                setSelectedDirId={setSelectedDirId}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: dirRef,
    })
    const { deleteDirectory, toggleDirectory } = useFileSystem()

    const handleDirClick = (dirId: string) => {
        setSelectedDirId(dirId)
        toggleDirectory(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(
            `Are you sure you want to delete directory?`,
        )
        if (isConfirmed) {
            deleteDirectory(id)
        }
    }

    // Add F2 key event listener to directory for renaming
    useEffect(() => {
        const dirNode = dirRef.current

        if (!dirNode) return

        dirNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        dirNode.addEventListener("keydown", handleF2)

        return () => {
            dirNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    return (
        <div className="overflow-x-auto">
            <div
                className="group flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
            >
                {item.isOpen ? (
                    <AiOutlineFolderOpen size={20} className="mr-2 min-w-fit text-purple-400" />
                ) : (
                    <AiOutlineFolder size={20} className="mr-2 min-w-fit text-purple-400" />
                )}
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <p
                        className="flex-grow overflow-hidden truncate text-sm"
                        title={item.name}
                    >
                        {item.name}
                    </p>
                )}
            </div>
            <div
                className={cn("ml-4 overflow-hidden transition-all duration-200", {
                    "h-0": !item.isOpen,
                })}
            >
                {item.children &&
                    item.children.map((child) => (
                        <Directory
                            key={child.id}
                            item={child}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
            {menuOpen && (
                <DirectoryMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameDirectory={handleRenameDirectory}
                    handleDeleteDirectory={handleDeleteDirectory}
                />
            )}
        </div>
    )
}

function File({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const fileRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: fileRef,
    })
    const { openFile, deleteFile } = useFileSystem()
    const { activityState, setActivityState } = useAppContext()
    const { isMobile } = useWindowDimensions()
    const { setIsSidebarOpen } = useViews()

    const handleFileClick = (fileId: string) => {
        setSelectedDirId(fileId)
        openFile(fileId)
        if (activityState === ACTIVITY_STATE.DRAWING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }
        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteFile = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(`Are you sure you want to delete file?`)
        if (isConfirmed) {
            deleteFile(id)
        }
    }

    // Add F2 key event listener to file for renaming
    useEffect(() => {
        const fileNode = fileRef.current

        if (!fileNode) return

        fileNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        fileNode.addEventListener("keydown", handleF2)

        return () => {
            fileNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    return (
        <div
            className="group flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
            onClick={() => handleFileClick(item.id)}
            ref={fileRef}
        >
            <Icon
                icon={getIconClassName(item.name)}
                fontSize={20}
                className="mr-2 min-w-fit"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <p
                    className="flex-grow overflow-hidden truncate text-sm"
                    title={item.name}
                >
                    {item.name}
                </p>
            )}
            {menuOpen && (
                <FileMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameFile={handleRenameFile}
                    handleDeleteFile={handleDeleteFile}
                />
            )}
        </div>
    )
}

function FileMenu({
    top,
    left,
    id,
    handleRenameFile,
    handleDeleteFile,
}: {
    top: number
    left: number
    id: Id
    handleRenameFile: (e: MouseEvent) => void
    handleDeleteFile: (e: MouseEvent, id: Id) => void
}) {
    return (
        <div
            className="fixed z-50 min-w-[150px] rounded-lg border border-white/10 bg-black/90 p-1 backdrop-blur-xl"
            style={{ top, left }}
        >
            <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                onClick={handleRenameFile}
            >
                <PiPencilSimpleFill size={16} />
                Rename
            </button>
            <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                onClick={(e) => handleDeleteFile(e, id)}
            >
                <MdDelete size={16} />
                Delete
            </button>
        </div>
    )
}

function DirectoryMenu({
    top,
    left,
    id,
    handleRenameDirectory,
    handleDeleteDirectory,
}: {
    top: number
    left: number
    id: Id
    handleRenameDirectory: (e: MouseEvent) => void
    handleDeleteDirectory: (e: MouseEvent, id: Id) => void
}) {
    return (
        <div
            className="fixed z-50 min-w-[150px] rounded-lg border border-white/10 bg-black/90 p-1 backdrop-blur-xl"
            style={{ top, left }}
        >
            <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                onClick={handleRenameDirectory}
            >
                <PiPencilSimpleFill size={16} />
                Rename
            </button>
            <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                onClick={(e) => handleDeleteDirectory(e, id)}
            >
                <MdDelete size={16} />
                Delete
            </button>
        </div>
    )
}

export default FileStructureView
