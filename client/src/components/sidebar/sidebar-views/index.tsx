
import { BsChatSquareText } from "react-icons/bs"
import { LuCode2, LuFileText, LuSettings, LuUsers, LuPalette, LuPlay } from "react-icons/lu"
import ChatsView from "./ChatsView"
import CopilotView from "./CopilotView"
import DrawingView from "./DrawingView"
import FilesView from "./FilesView"
import RunView from "./RunView"
import SettingsView from "./SettingsView"
import UsersView from "./UsersView"
import VideoCallView from "./VideoCallView"

export enum ViewType {
    FILES = "files",
    CHATS = "chats",
    USERS = "users",
    SETTINGS = "settings",
    DRAWING = "drawing",
    RUN = "run",
    COPILOT = "copilot",
    VIDEO_CALL = "video-call",
}

export const VIEWS = [
    {
        id: ViewType.FILES,
        name: "Files",
        icon: LuFileText,
        component: FilesView,
    },
    {
        id: ViewType.CHATS,
        name: "Chat",
        icon: BsChatSquareText,
        component: ChatsView,
    },
    {
        id: ViewType.USERS,
        name: "Users",
        icon: LuUsers,
        component: UsersView,
    },
    {
        id: ViewType.VIDEO_CALL,
        name: "Participants",
        icon: LuUsers,
        component: VideoCallView,
    },
    {
        id: ViewType.DRAWING,
        name: "Drawing",
        icon: LuPalette,
        component: DrawingView,
    },
    {
        id: ViewType.RUN,
        name: "Run",
        icon: LuPlay,
        component: RunView,
    },
    {
        id: ViewType.COPILOT,
        name: "Copilot",
        icon: LuCode2,
        component: CopilotView,
    },
    {
        id: ViewType.SETTINGS,
        name: "Settings",
        icon: LuSettings,
        component: SettingsView,
    },
]

export const viewComponents = VIEWS.reduce((acc, view) => {
    acc[view.id] = view.component
    return acc
}, {} as Record<ViewType, React.ComponentType>)

export const viewIcons = VIEWS.reduce((acc, view) => {
    acc[view.id] = view.icon
    return acc
}, {} as Record<ViewType, React.ComponentType>) 