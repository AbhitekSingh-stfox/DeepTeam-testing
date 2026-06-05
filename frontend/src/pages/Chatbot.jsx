import { useState } from 'react'

function ChatBot() {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {
        if (!message.trim()) return

        const userTextInput = message    
        setMessage("")
        setLoading(true)

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userTextInput
            }
        ])

        try {
            const res = await fetch("http://127.0.0.1:8000/text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userTextInput }),
            })

            const data = await res.json()

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: data.response,
                    total_tokens: data.total_tokens,
                }
            ])
        } catch (error) {
            console.error("Error sending text:", error)
        } finally {
            setLoading(false)
        }
    }

    const sendVoice = async (file) => {
        setLoading(true)
        const formData = new FormData()
        formData.append("audio", file)

        try {
            const res = await fetch("http://127.0.0.1:8000/voice", {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            setMessages((prev) => [
                ...prev,
                { role: "user", content: data.transcript },
                {
                    role: "ai",
                    content: data.response,
                    total_tokens: data.total_tokens,
                }
            ])

            new Audio(`http://localhost:8000${data.audio_url}`).play()
        } catch (error) {
            console.error("Error sending voice:", error)
        } finally {
            setLoading(false)
        }
    }

    const useTestAudio = async () => {
        const response = await fetch("http://127.0.0.1:8000/audio/test.wav")
        const blob = await response.blob()
        const file = new File([blob], "test.wav", {
            type: "audio/wav"
        })

        await sendVoice(file)
    }

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-[#0c0c0e] p-4">
            <div className="w-full max-w-2xl h-[88vh] flex flex-col bg-[#111114] border border-white/[0.07] rounded-[20px] overflow-hidden">

                {/* Header */}
                <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-[34px] rounded-[10px] bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-sm">
                            ✦
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#e8e8f0] tracking-tight leading-none">AI Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#555562]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online
                    </div>
                </header>

                {/* Messages Panel Container */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                            <span className="text-2xl opacity-30">✦</span>
                            <p className="text-xs text-[#444450]">Start a conversation</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        if (msg.role === "user") {
                            return (
                                <div key={index} className="flex justify-end">
                                    <div className="max-w-[75%] bg-violet-700 text-violet-100 text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-br-[4px]">
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        }

                        if (msg.role === "ai") {
                            return (
                                <div key={index} className="flex items-end gap-2">
                                    <div className="w-[26px] h-[26px] shrink-0 rounded-[8px] bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-[11px] text-[#555562]">
                                        ✦
                                    </div>
                                    <div className="max-w-[75%] bg-[#18181c] border border-white/[0.07] text-[#c4c4d0] text-[13px] leading-relaxed px-3.5 py-2.5 rounded-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
                                        <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                                        {msg.total_tokens && (
                                            <span className="inline-flex mt-1.5 text-[10px] text-amber-600/70 bg-amber-400/[0.07] border border-amber-400/15 px-2 py-0.5 rounded-full">
                                                {msg.total_tokens} tokens
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        return null
                    })}

                    {/* Single Typing Indicator */}
                    {loading && (
                        <div className="flex items-end gap-2">
                            <div className="w-[26px] h-[26px] shrink-0 rounded-[8px] bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-[11px] text-[#555562]">
                                ✦
                            </div>
                            <div className="bg-[#18181c] border border-white/[0.07] px-3.5 py-3 rounded-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a3a48] animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a3a48] animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a3a48] animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Controls */}
                <div className="shrink-0 p-3.5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 bg-[#18181c] border border-white/[0.08] focus-within:border-violet-600/40 rounded-[14px] px-3.5 py-2 transition-colors">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message..."
                            disabled={loading}
                            className="flex-1 bg-transparent outline-none text-[13px] text-[#c4c4d0] placeholder:text-[#3a3a48]"
                        />
                        <button
                            onClick={useTestAudio}
                            disabled={loading}
                            className="w-8 h-8 shrink-0 rounded-[9px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#666670] text-sm transition hover:bg-white/[0.07]"
                        >
                            🎙
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className="shrink-0 bg-violet-700 hover:bg-violet-600 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[9px] transition"
                        >
                            Send
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ChatBot