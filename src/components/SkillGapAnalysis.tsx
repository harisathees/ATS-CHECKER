"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface SkillGapAnalysisProps {
    technicalSkills: string[];
    softSkills: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
}

export function SkillGapAnalysis({
    technicalSkills,
    softSkills,
    matchedKeywords,
    missingKeywords,
}: SkillGapAnalysisProps) {
    return (
        <div
            className="rounded-2xl p-6 border border-white/5"
            style={{
                background: "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
                backdropFilter: "blur(16px)",
            }}
        >
            <h3 className="text-lg font-bold text-white mb-5">Skill Analysis</h3>

            <div className="space-y-5">
                {/* Technical Skills */}
                {technicalSkills.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {technicalSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Soft Skills */}
                {softSkills.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-2">Soft Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {softSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Keywords present */}
                {matchedKeywords.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <h4 className="text-sm font-semibold text-green-400">
                                Keywords Found ({matchedKeywords.length})
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {matchedKeywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-full bg-green-500/10 text-green-300 border border-green-500/20"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing keywords */}
                {missingKeywords.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <h4 className="text-sm font-semibold text-red-400">
                                Missing Keywords ({missingKeywords.length})
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {missingKeywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 text-red-300 border border-red-500/20"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
