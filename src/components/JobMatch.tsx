"use client";

import React, { useState } from "react";
import { Briefcase, Target, CheckCircle, XCircle, TrendingUp, Loader2, Search, MapPin, Building2, ExternalLink } from "lucide-react";

interface JobMatchProps {
    resumeId: string | null;
    apiBase: string;
}

interface MatchResult {
    match_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    analysis: {
        strengths: string[];
        gaps: string[];
        recommendations: string[];
        overall_fit: string;
    };
}

interface JobVacancy {
    id: string;
    title: string;
    company: string;
    location: string;
    platform: string;
    url: string;
    description: string;
    posted_at: string;
}

export function JobMatch({ resumeId, apiBase }: JobMatchProps) {
    const [targetRole, setTargetRole] = useState("");
    const [platform, setPlatform] = useState("linkedin");
    const [isSearching, setIsSearching] = useState(false);
    const [jobs, setJobs] = useState<JobVacancy[]>([]);

    // Legacy generic matcher states
    const [jobDescription, setJobDescription] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [matchMode, setMatchMode] = useState<"search" | "manual">("search");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MatchResult | null>(null);
    const [error, setError] = useState("");

    const handleSearchJobs = async () => {
        if (!targetRole.trim()) {
            setError("Please enter a target role to search.");
            return;
        }
        setIsSearching(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch(`${apiBase}/api/jobs/search?role=${encodeURIComponent(targetRole)}&platform=${encodeURIComponent(platform)}`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
                if (data.data.length === 0) {
                    setError("No jobs found for this role. Try different keywords.");
                }
            } else {
                setError(data.error || "Failed to search jobs.");
            }
        } catch {
            setError("Unable to connect to the server to search jobs.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleMatch = async (titleToMatch: string, descToMatch: string) => {
        if (!resumeId) {
            setError("Please upload a resume first.");
            return;
        }
        if (!descToMatch.trim()) {
            setError("Job description is missing.");
            return;
        }

        setJobTitle(titleToMatch);
        setJobDescription(descToMatch);
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`${apiBase}/api/job-match`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_id: resumeId,
                    job_description: descToMatch,
                    job_title: titleToMatch,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || "Failed to match job.");
            }
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-green-600 dark:text-green-400";
        if (s >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 w-fit">
                <button
                    onClick={() => { setMatchMode("search"); setResult(null); setError(""); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${matchMode === "search" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                >
                    Live Job Vacancies
                </button>
                <button
                    onClick={() => { setMatchMode("manual"); setResult(null); setError(""); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${matchMode === "manual" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                >
                    Paste Custom JD
                </button>
            </div>

            {/* Input section */}
            <div className="rounded-2xl p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm backdrop-blur-xl transition-colors">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {matchMode === "search" ? "Search Real-time Roles" : "Manual Job Match"}
                    </h3>
                </div>

                <div className="space-y-4">
                    {matchMode === "search" ? (
                        <>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Target Role</label>
                                    <input
                                        type="text"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        placeholder="e.g. Frontend Developer, Data Scientist"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Platform</label>
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-violet-500/50 dark:[&>option]:bg-[#0f0f1e] transition-colors"
                                    >
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="naukri">Naukri.com</option>
                                        <option value="glassdoor">Glassdoor</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSearchJobs}
                                disabled={isSearching}
                                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/5 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSearching ? (
                                    <><Loader2 className="w-4 h-4 text-violet-600 dark:text-white animate-spin" /> Searching...</>
                                ) : (
                                    <><Search className="w-4 h-4 text-violet-600 dark:text-white" /> Search Vacancies</>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Job title (e.g. Senior Software Engineer)"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here..."
                                rows={6}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                            />
                            <button
                                onClick={() => handleMatch(jobTitle, jobDescription)}
                                disabled={loading || !resumeId}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Match...</>
                                ) : (
                                    <><Target className="w-4 h-4" /> Analyze Match</>
                                )}
                            </button>
                        </>
                    )}

                    {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}

                    {!resumeId && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Upload a resume first to use job matching
                        </p>
                    )}
                </div>
            </div>

            {/* Live Jobs List */}
            {matchMode === "search" && jobs.length > 0 && !result && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">Live Job Vacancies</h3>
                    <div className="grid gap-4">
                        {jobs.map(job => (
                            <div key={job.id} className="p-5 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-200 dark:border-white/10 hover:border-violet-500/30 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <a href={job.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2">
                                            {job.title}
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-300">{job.platform}</span>
                                        </div>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-500 line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleMatch(job.title, job.description)}
                                        disabled={loading || !resumeId}
                                        className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        {loading && jobTitle === job.title ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Target className="w-4 h-4" />
                                        )}
                                        Match Resume
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Match Results View */}
            {result && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis: {jobTitle}</h3>
                        <button onClick={() => setResult(null)} className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                            Close Analysis &rarr;
                        </button>
                    </div>

                    {/* Match Score */}
                    <div className="rounded-2xl p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm text-center transition-colors">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">Match Score</p>
                        <p className={`text-6xl font-black ${getScoreColor(result.match_score)}`}>
                            {result.match_score}%
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-4 max-w-lg mx-auto leading-relaxed">
                            {result.analysis.overall_fit}
                        </p>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Matched */}
                        <div className="rounded-2xl p-5 border border-green-200 dark:border-white/5 bg-green-50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    Matched Keywords ({result.matched_keywords?.length || 0})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.matched_keywords?.map((kw, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/20"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Missing */}
                        <div className="rounded-2xl p-5 border border-red-200 dark:border-white/5 bg-red-50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-3">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    Missing Keywords ({result.missing_keywords?.length || 0})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.missing_keywords?.map((kw, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm">
                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">💪 Strengths</h4>
                            <ul className="space-y-3">
                                {result.analysis.strengths?.map((s, i) => (
                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
                                        <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm">
                            <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center gap-2">⚡ Areas to Improve</h4>
                            <ul className="space-y-3">
                                {result.analysis.gaps?.map((g, i) => (
                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
                                        <XCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <span className="leading-relaxed">{g}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
