"use client";

import React from "react";
import {
    Code,
    Shield,
    BarChart3,
    Megaphone,
    Stethoscope,
    Briefcase,
    GraduationCap,
    Palette,
} from "lucide-react";

interface IndustrySelectorProps {
    selected: string;
    onChange: (industry: string) => void;
}

const industries = [
    { id: "software", label: "Software Engineering", icon: Code, color: "from-blue-500 to-cyan-500" },
    { id: "cybersecurity", label: "Cybersecurity", icon: Shield, color: "from-red-500 to-orange-500" },
    { id: "data-science", label: "Data Science", icon: BarChart3, color: "from-emerald-500 to-green-500" },
    { id: "marketing", label: "Marketing", icon: Megaphone, color: "from-pink-500 to-rose-500" },
    { id: "healthcare", label: "Healthcare", icon: Stethoscope, color: "from-teal-500 to-cyan-500" },
    { id: "finance", label: "Finance", icon: Briefcase, color: "from-amber-500 to-yellow-500" },
    { id: "education", label: "Education", icon: GraduationCap, color: "from-violet-500 to-purple-500" },
    { id: "design", label: "Design / UX", icon: Palette, color: "from-fuchsia-500 to-pink-500" },
];

export function IndustrySelector({ selected, onChange }: IndustrySelectorProps) {
    return (
        <div
            className="rounded-2xl p-5 border border-white/5"
            style={{
                background: "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                backdropFilter: "blur(16px)",
            }}
        >
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Target Industry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {industries.map((ind) => {
                    const isActive = selected === ind.id;
                    return (
                        <button
                            key={ind.id}
                            onClick={() => onChange(ind.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${isActive
                                    ? "border-violet-500/30 bg-violet-500/10 text-white scale-105"
                                    : "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive
                                        ? `bg-gradient-to-br ${ind.color}`
                                        : "bg-white/5"
                                    }`}
                            >
                                <ind.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                            </div>
                            <span className="text-center leading-tight">{ind.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
