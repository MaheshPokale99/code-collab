import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { User } from "@/types/user"
import { useEffect, useRef, useState } from "react"
import { LuUser } from "react-icons/lu"

function ChatList() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { messages, isNewMessage, setIsNewMessage, lastScrollHeight, setLastScrollHeight } = useChatRoom()
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const [typingUsers, setTypingUsers] = useState<string[]>([])

    useEffect(() => {
        // Handle typing indicators
        socket.on(SocketEvent.TYPING_START, ({ user }: { user: User }) => {
            if (user.username !== currentUser.username) {
                setTypingUsers(prev => 
                    prev.includes(user.username) ? prev : [...prev, user.username]
                )
            }
        })

        socket.on(SocketEvent.TYPING_PAUSE, ({ user }: { user: User }) => {
            if (user.username !== currentUser.username) {
                setTypingUsers(prev => prev.filter(username => username !== user.username))
            }
        })

        return () => {
            socket.off(SocketEvent.TYPING_START)
            socket.off(SocketEvent.TYPING_PAUSE)
        }
    }, [socket, currentUser.username])

    useEffect(() => {
        if (messagesContainerRef.current) {
            if (isNewMessage) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                setIsNewMessage(false)
            } else {
                messagesContainerRef.current.scrollTop = lastScrollHeight
            }
        }
    }, [messages, isNewMessage, lastScrollHeight, setIsNewMessage])

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            setLastScrollHeight(messagesContainerRef.current.scrollTop)
        }
    }

    return (
        <div
            className="flex-grow overflow-auto rounded-lg bg-dark/80 p-4 backdrop-blur-sm"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {/* Chat messages */}
            {messages.map((message, index) => {
                const isOwnMessage = message.username === currentUser.username
                return (
                    <div
                        key={index}
                        className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                                <LuUser className="h-4 w-4 text-text-secondary" />
                            </div>
                            
                            {/* Message Content */}
                            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-sm font-medium text-primary">
                                        {message.username}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {message.timestamp}
                                    </span>
                                </div>
                                <div className={`rounded-2xl px-4 py-2.5 shadow-lg ${
                                    isOwnMessage 
                                        ? 'bg-primary/20 text-text' 
                                        : 'bg-surface text-text'
                                }`}>
                                    <p className="leading-relaxed">{message.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
            
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                        <LuUser className="h-4 w-4 text-text-secondary" />
                    </div>
                    <div className="rounded-2xl bg-surface px-4 py-2.5">
                        <p className="text-sm text-text-secondary italic">
                            {typingUsers.length === 1
                                ? `${typingUsers[0]} is typing...`
                                : typingUsers.length === 2
                                ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                                : `${typingUsers.length} people are typing...`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatList
