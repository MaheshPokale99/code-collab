import React from "react"
import { BsChatSquareText } from "react-icons/bs"
import { FaRegUser } from "react-icons/fa"
import { FiSettings } from "react-icons/fi"
import { HiOutlineCode } from "react-icons/hi"
import { VscFiles } from "react-icons/vsc"
import { IoPlayOutline } from "react-icons/io5"
import { TbPaint } from "react-icons/tb"
import ChatsView from "./ChatsView"
import CopilotView from "./CopilotView"
import FilesView from "./FilesView"
import RunView from "./RunView"
import SettingsView from "./SettingsView"
import UsersView from "./UsersView"

export const VIEWS = {
    FILES: "FILES",
    CHATS: "CHATS",
    COPILOT: "COPILOT",
    RUN: "RUN",
    CLIENTS: "CLIENTS",
    SETTINGS: "SETTINGS",
    DRAWING: "DRAWING",
} as const

export type ViewType = keyof typeof VIEWS

type ViewRecord = Record<ViewType, JSX.Element>

export const viewIcons: ViewRecord = {
    FILES: <VscFiles size={24} />,
    CHATS: <BsChatSquareText size={22} />,
    COPILOT: <HiOutlineCode size={24} />,
    RUN: <IoPlayOutline size={24} />,
    CLIENTS: <FaRegUser size={22} />,
    SETTINGS: <FiSettings size={24} />,
    DRAWING: <TbPaint size={24} />,
}

export const viewComponents: ViewRecord = {
    FILES: <FilesView />,
    CHATS: <ChatsView />,
    COPILOT: <CopilotView />,
    RUN: <RunView />,
    CLIENTS: <UsersView />,
    SETTINGS: <SettingsView />,
    DRAWING: <FilesView />,
} 