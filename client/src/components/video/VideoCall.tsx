import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { useEffect, useRef, useState } from "react"
import { LuMic, LuMicOff, LuVideo, LuVideoOff, LuPhone, LuPhoneOff } from "react-icons/lu"

interface VideoCallProps {
    isOpen: boolean
    onClose: () => void
}

function VideoCall({ isOpen, onClose }: VideoCallProps) {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({})
    
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isCallActive, setIsCallActive] = useState(false)
    
    const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({})

    // WebRTC configuration
    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    }

    // Initialize local media stream
    const initializeLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setLocalStream(stream)
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            }
        } catch (error) {
            console.error('Error accessing media devices:', error)
        }
    }

    // Create peer connection
    const createPeerConnection = (peerId: string): RTCPeerConnection => {
        const peerConnection = new RTCPeerConnection(rtcConfig)
        
        // Add local stream tracks to peer connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream)
            })
        }

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            const remoteVideo = remoteVideosRef.current[peerId]
            if (remoteVideo && event.streams[0]) {
                remoteVideo.srcObject = event.streams[0]
            }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit(SocketEvent.ICE_CANDIDATE, {
                    candidate: event.candidate,
                    to: peerId
                })
            }
        }

        return peerConnection
    }

    // Start call
    const startCall = async () => {
        await initializeLocalStream()
        setIsCallActive(true)
        
        // Notify other users in the room
        socket.emit(SocketEvent.VIDEO_CALL_START, {
            roomId: currentUser.roomId,
            from: currentUser.username
        })
    }

    // End call
    const endCall = () => {
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
            setLocalStream(null)
        }

        // Close all peer connections
        Object.values(peerConnectionsRef.current).forEach(connection => {
            connection.close()
        })
        peerConnectionsRef.current = {}

        setIsCallActive(false)
        setIsVideoEnabled(true)
        setIsAudioEnabled(true)

        // Notify other users
        socket.emit(SocketEvent.VIDEO_CALL_END, {
            roomId: currentUser.roomId,
            from: currentUser.username
        })
    }

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    // Toggle audio
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    // Handle incoming call
    const handleIncomingCall = async ({ peerId }: { from: string; peerId: string }) => {
        if (!isCallActive) {
            await initializeLocalStream()
            setIsCallActive(true)
        }

        const peerConnection = createPeerConnection(peerId)
        peerConnectionsRef.current[peerId] = peerConnection

        // Create and send answer (offer step could be added for full SFU/mesh)
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        socket.emit(SocketEvent.VIDEO_ANSWER, {
            answer: offer,
            to: peerId
        })
    }

    // Handle video answer
    const handleVideoAnswer = async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
        const peerConnection = peerConnectionsRef.current[from]
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        }
    }

    // Handle ICE candidate
    const handleIceCandidate = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        const peerConnection = peerConnectionsRef.current[from]
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
    }

    useEffect(() => {
        if (!isOpen) return

        // Socket event listeners
        socket.on(SocketEvent.VIDEO_CALL_START, handleIncomingCall)
        socket.on(SocketEvent.VIDEO_ANSWER, handleVideoAnswer)
        socket.on(SocketEvent.ICE_CANDIDATE, handleIceCandidate)

        return () => {
            socket.off(SocketEvent.VIDEO_CALL_START, handleIncomingCall)
            socket.off(SocketEvent.VIDEO_ANSWER, handleVideoAnswer)
            socket.off(SocketEvent.ICE_CANDIDATE, handleIceCandidate)
        }
    }, [isOpen, socket, isCallActive])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
            Object.values(peerConnectionsRef.current).forEach(connection => {
                connection.close()
            })
        }
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl hfull max-h-[80vh] bg-zinc-900 rounded-lg border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Video Call</h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                        {/* Local Video */}
                        <div className="relative bg-zinc-800 rounded-lg overflow-hidden">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                You
                            </div>
                        </div>

                        {/* Remote Videos */}
                        {Object.keys(peerConnectionsRef.current).map(peerId => (
                            <div key={peerId} className="relative bg-zinc-800 rounded-lg overflow-hidden">
                                <video
                                    ref={el => {
                                        if (el) remoteVideosRef.current[peerId] = el
                                    }}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                    {peerId}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 p-4 bg-zinc-800/50 border-t border-white/10">
                    {!isCallActive ? (
                        <button
                            onClick={startCall}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            <LuPhone size={20} />
                            Start Call
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleAudio}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    isAudioEnabled 
                                        ? 'bg-white/20 text-white hover:bg-white/30' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                {isAudioEnabled ? <LuMic size={20} /> : <LuMicOff size={20} />}
                            </button>
                            
                            <button
                                onClick={toggleVideo}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    isVideoEnabled 
                                        ? 'bg-white/20 text-white hover:bg-white/30' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                {isVideoEnabled ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
                            </button>
                            
                            <button
                                onClick={endCall}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <LuPhoneOff size={20} />
                                End Call
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VideoCall
