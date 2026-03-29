"use client";

import React, { useEffect, useState } from "react";

interface ScoreCardProps {
    overallScore: number;
    formatting: number;
    keywords: number;
    impact: number;
    skillsAlignment: number;
}

function AnimatedRing({
    score,
    size = 200,
    strokeWidth = 12,
}: {
    score: number;
    size?: number;
    strokeWidth?: number;
}) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 200);
        return () => clearTimeout(timer);
    }, [score]);

    const getColor = (s: number) => {
        if (s >= 80) return { start: "#22c55e", end: "#10b981" };
        if (s >= 60) return { start: "#f59e0b", end: "#eab308" };
        return { start: "#ef4444", end: "#f43f5e" };
    };

    const color = getColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color.start} />
                        <stop offset="100%" stopColor={color.end} />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                {/* Score ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    filter="url(#glow)"
                    style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tabular-nums">
                    {animatedScore}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                    ATS Score
                </span>
            </div>
        </div>
    );
}

function MiniBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(value), 300);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-white tabular-nums">{value}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        boxShadow: `0 0 8px ${color}40`,
                    }}
                />
            </div>
        </div>
    );
}

export function ScoreCard({
    overallScore,
    formatting,
    keywords,
    impact,
    skillsAlignment,
}: ScoreCardProps) {
    const getVerdict = (s: number) => {
        if (s >= 85) return { text: "Excellent", color: "text-green-400" };
        if (s >= 70) return { text: "Good", color: "text-emerald-400" };
        if (s >= 55) return { text: "Fair", color: "text-yellow-400" };
        return { text: "Needs Work", color: "text-red-400" };
    };
    const verdict = getVerdict(overallScore);

    return (
        <div
            className="rounded-2xl p-6 border border-white/5"
            style={{
                background:
                    "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                backdropFilter: "blur(16px)",
            }}
        >
            <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Circular score */}
                <div className="flex flex-col items-center">
                    <AnimatedRing score={overallScore} />
                    <span className={`mt-3 text-lg font-bold ${verdict.color}`}>
                        {verdict.text}
                    </span>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 w-full space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                        Score Breakdown
                    </h3>
                    <MiniBar label="Formatting & Structure" value={formatting} color="#8b5cf6" />
                    <MiniBar label="Keyword Relevance" value={keywords} color="#06b6d4" />
                    <MiniBar label="Impact & Metrics" value={impact} color="#f59e0b" />
                    <MiniBar label="Skills Alignment" value={skillsAlignment} color="#22c55e" />
                </div>
            </div>
        </div>
    );
}
