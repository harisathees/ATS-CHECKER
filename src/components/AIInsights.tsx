"use client";

import React from "react";
import { Brain, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

interface AIInsightsProps {
    insights: string[];
    recommendations: string[];
    issues: string[];
}

export function AIInsights({ insights, recommendations, issues }: AIInsightsProps) {
    return (
        <div
            className="rounded-2xl p-6 border border-white/5"
            style={{
                background:
                    "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                backdropFilter: "blur(16px)",
            }}
        >
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Insights</h3>
            </div>

            <div className="space-y-4">
                {/* Critical Issues */}
                {issues.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                            <AlertTriangle className="w-4 h-4" />
                            Issues Found
                        </div>
                        {issues.slice(0, 4).map((issue, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                                <p className="text-sm text-gray-300 leading-relaxed">{issue}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            Recommendations
                        </div>
                        {recommendations.slice(0, 4).map((rec, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                            >
                                <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
