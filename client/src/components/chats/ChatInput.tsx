import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useEffect, useRef } from "react"
import { LuSendHorizonal } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleTyping = () => {
        if (inputRef.current) {
            const cursorPosition = inputRef.current.selectionStart || 0;
            socket.emit(SocketEvent.TYPING_START, { cursorPosition });
        }
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit(SocketEvent.TYPING_PAUSE)
        }, 1000)
    }

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [])

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])

            if (inputRef.current) inputRef.current.value = ""
            socket.emit(SocketEvent.TYPING_PAUSE)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-dark/80 p-2 backdrop-blur-sm"
            >
                <input
                    type="text"
                    className="w-full flex-grow rounded-lg border-none bg-surface/50 p-2 text-text outline-none placeholder:text-text-secondary transition-all duration-200 focus:bg-surface focus:ring-2 focus:ring-primary/20"
                    placeholder="Type a message..."
                    ref={inputRef}
                    onChange={handleTyping}
                />
                <button
                    className="flex items-center justify-center rounded-lg bg-primary p-2 text-background transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
                    type="submit"
                >
                    <LuSendHorizonal size={20} />
                </button>
            </form>
        </div>
    )
}

export default ChatInput
