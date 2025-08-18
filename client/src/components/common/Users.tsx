import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex min-h-[200px] flex-grow justify-center overflow-y-auto py-2">
            <div className="flex h-full w-full flex-wrap items-start gap-x-2 gap-y-6">
                {users.map((user) => {
                    return <User key={user.socketId} user={user} />
                })}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status, typing } = user
    const title = `${username} - ${status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"}${typing ? " - typing..." : ""}`

    return (
        <div
            className="relative flex w-[100px] flex-col items-center gap-2"
            title={title}
        >
            <div className="relative">
                <Avatar name={username} size="50" round={"12px"} title={title} />
                <div
                    className={`absolute right-0 top-0 h-3 w-3 rounded-full ${
                        status === USER_CONNECTION_STATUS.ONLINE
                            ? "bg-green-500"
                            : "bg-danger"
                    }`}
                ></div>
                {typing && (
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="line-clamp-2 max-w-full text-ellipsis break-words text-center">
                    {username}
                </p>
                {typing && (
                    <div className="flex items-center gap-1 text-xs text-blue-400">
                        <div className="flex gap-1">
                            <div className="h-1 w-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-1 w-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-1 w-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs">typing</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Users
