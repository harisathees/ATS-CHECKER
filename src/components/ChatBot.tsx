"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, MessageSquare, Sparkles } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    message: string;
}

interface ChatBotProps {
    resumeId: string | null;
    isOpen: boolean;
    onClose: () => void;
    apiBase: string;
}

export function ChatBot({ resumeId, isOpen, onClose, apiBase }: ChatBotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            message:
                "👋 Hi! I'm your AI Career Coach. I can help you improve your resume, suggest skills, and prepare for roles. Ask me anything!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", message: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch(`${apiBase}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    resume_id: resumeId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", message: data.data.message },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        message: "Sorry, I encountered an error. Please try again.",
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    message: "Unable to connect to the server. Please check if the backend is running.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-[420px] h-[100dvh] sm:h-auto sm:max-h-[600px] flex flex-col sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10"
            style={{
                background: "linear-gradient(180deg, rgba(10,10,25,0.98), rgba(8,6,20,0.99))",
                backdropFilter: "blur(24px)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">AI Career Coach</h4>
                        <p className="text-xs text-gray-400">
                            {resumeId ? "Resume context active" : "General advice mode"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[420px]">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                                : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <User className="w-3.5 h-3.5 text-white" />
                            ) : (
                                <Bot className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white border border-blue-500/20 rounded-tr-md"
                                : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-md"
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about your resume..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Floating chat button
export function ChatButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30 hover:scale-110 transition-transform"
        >
            <MessageSquare className="w-6 h-6 text-white" />
        </button>
    );
}
