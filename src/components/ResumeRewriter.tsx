"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

interface ResumeRewriterProps {
    resumeId: string | null;
    apiBase: string;
}

export function ResumeRewriter({ resumeId, apiBase }: ResumeRewriterProps) {
    const [loading, setLoading] = useState(false);
    const [improved, setImproved] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const handleRewrite = async () => {
        if (!resumeId) {
            setError("Please upload a resume first.");
            return;
        }
        setLoading(true);
        setError("");
        setImproved("");
        try {
            const res = await fetch(`${apiBase}/api/rewrite-resume`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume_id: resumeId }),
            });
            const data = await res.json();
            if (data.success) {
                setImproved(data.improved_resume);
            } else {
                setError(data.error || "Failed to rewrite resume.");
            }
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(improved);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Action card */}
            <div
                className="rounded-2xl p-6 border border-white/5"
                style={{
                    background: "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI Resume Rewriter</h3>
                </div>

                <p className="text-sm text-gray-400 mb-5">
                    Our AI will rewrite your resume with stronger action verbs, quantifiable
                    achievements, and optimized keywords for maximum ATS compatibility.
                </p>

                {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

                <button
                    onClick={handleRewrite}
                    disabled={loading || !resumeId}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Rewriting with AI...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Generate Improved Resume
                        </>
                    )}
                </button>

                {!resumeId && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Upload a resume first to use the AI rewriter
                    </p>
                )}
            </div>

            {/* Improved resume output */}
            {improved && (
                <div
                    className="rounded-2xl p-6 border border-white/5 relative"
                    style={{
                        background: "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-fuchsia-400" />
                            AI-Optimized Resume
                        </h4>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <div className="bg-black/30 rounded-xl p-5 border border-white/5 max-h-[600px] overflow-y-auto">
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                            {improved}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
