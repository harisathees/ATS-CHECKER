"use client";

import React, { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { ScoreCard } from "@/components/ScoreCard";
import { AIInsights } from "@/components/AIInsights";
import { SkillGapAnalysis } from "@/components/SkillGapAnalysis";
import { IndustrySelector } from "@/components/IndustrySelector";
import { ProSuggestions } from "@/components/ProSuggestions";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ChatBot, ChatButton } from "@/components/ChatBot";
import { JobMatch } from "@/components/JobMatch";
import { ResumeRewriter } from "@/components/ResumeRewriter";
import { JobReference } from "@/components/JobReference";
import {
  Upload,
  Download,
  Sparkles,
  FileText,
  TrendingUp,
  Clock,
  Menu,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/context/AuthContext";
import { PDFReport } from "@/components/PDFReport";
import { ResumeData } from "@/lib/gemini-service";

const API_BASE = "http://localhost:5000";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResumeData | null>(null);
  const { user, token, loading: authLoading } = useAuth();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [industry, setIndustry] = useState("software");
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeHistory, setResumeHistory] = useState<Record<string, unknown>[]>([]);

  const scores = results?.ats_analysis
    ? {
      overall: results.ats_analysis.score || 0,
      formatting: results.ats_analysis.formatting_score || 0,
      keywords: results.ats_analysis.keywords_score || 0,
      impact: results.ats_analysis.impact_score || 0,
      skills: results.ats_analysis.skills_alignment_score || 0,
    }
    : null;

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setResults(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("industry", industry);

        // Try Express backend first, fallback to Next.js API
        let response: Response;
        try {
          response = await fetch(`${API_BASE}/api/upload-resume`, {
            method: "POST",
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            body: formData,
          });
        } catch {
          // Fallback to Next.js API route
          response = await fetch("/api/process-resume", {
            method: "POST",
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            body: formData,
          });
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to process resume");
        }

        if (data.success && data.data) {
          setResults(data.data);
          setResumeId(data.data.resume_id || null);
          setActiveTab("dashboard");
          // Refresh history
          fetchHistory();
        } else {
          if (data.data && !data.data.is_resume) {
            setResults(data.data);
          } else {
            throw new Error("Invalid response from server");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [industry]
  );

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/resumes`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setResumeHistory(data.data || []);
      }
    } catch {
      // Backend not available
    }
  };

  const handleReset = () => {
    setResults(null);
    setResumeId(null);
    setError(null);
    setActiveTab("upload");
  };

  const handleDownloadReport = async () => {
    if (!results) return;
    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "800px";
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.style.padding = "20px";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(tempContainer);
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempContainer);
      root.render(<PDFReport data={results} />);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 800,
        height: tempContainer.scrollHeight,
        logging: false,
      });
      root.unmount();
      document.body.removeChild(tempContainer);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const fileName = `resume-analysis-${new Date().toISOString().split("T")[0]
        }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-600 dark:text-violet-300">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Checkerligence
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Craft the Perfect
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ATS-Ready Resume
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Upload your resume for instant AI analysis, scoring, and
                optimization. Get actionable insights to pass any ATS system.
              </p>
            </div>

            {/* Industry selector */}
            <IndustrySelector
              selected={industry}
              onChange={setIndustry}
            />

            {/* File upload */}
            <FileUpload
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 text-center">
                <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 dark:border-white/5">
              {[
                { label: "ATS Systems", value: "100+", icon: TrendingUp },
                { label: "100% Free", value: "✓", icon: Sparkles },
                { label: "AI Powered", value: "Gemini", icon: FileText },
              ].map((stat, i) => {
                return (
                  <div key={i} className="text-center group">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "dashboard":
        if (!results || !results.is_resume) {
          return (
            <div className="text-center py-20">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Resume Analyzed
              </h3>
              <p className="text-gray-400 mb-6">
                Upload a resume to see your dashboard
              </p>
              <button
                onClick={() => setActiveTab("upload")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Upload Resume
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {results.header?.name || "Resume"} Analysis
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Industry: {results.industry || industry} • Analyzed just now
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  New Resume
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-sm text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Score Card */}
            {scores && (
              <ScoreCard
                overallScore={scores.overall}
                formatting={scores.formatting}
                keywords={scores.keywords}
                impact={scores.impact}
                skillsAlignment={scores.skills}
              />
            )}

            {/* Grid: Insights + Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsights
                insights={[]}
                recommendations={results.ats_analysis?.recommendations || []}
                issues={results.ats_analysis?.issues || []}
              />
              <SkillGapAnalysis
                technicalSkills={results.sections?.skills?.technical || []}
                softSkills={results.sections?.skills?.soft || []}
                matchedKeywords={results.ats_analysis?.keyword_matches || []}
                missingKeywords={results.ats_analysis?.missing_keywords || []}
              />
            </div>

            {/* Pro Suggestions */}
            <ProSuggestions data={results} />
          </div>
        );

      case "rewrite":
        return <ResumeRewriter resumeId={resumeId} apiBase={API_BASE} />;

      case "jobmatch":
        return <JobMatch resumeId={resumeId} apiBase={API_BASE} />;

      case "chat":
        return (
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-2xl border border-white/5 overflow-hidden h-[calc(100vh-180px)]"
              style={{
                background: "linear-gradient(135deg, rgba(15,15,30,0.8), rgba(20,10,35,0.8))",
              }}
            >
              <ChatBot
                resumeId={resumeId}
                isOpen={true}
                onClose={() => setActiveTab("dashboard")}
                apiBase={API_BASE}
              />
            </div>
          </div>
        );

      case "history":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h2>
            {resumeHistory.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No resume history yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Your analyzed resumes will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {resumeHistory.map((r) => (
                  <div
                    key={r.id as string}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-fuchsia-500/20 border border-violet-200 dark:border-violet-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {r.file_name as string}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(r.industry as string) || "General"} • v{r.version as number} •{" "}
                          {new Date(r.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {(r.overall_score as number) != null && (
                      <div
                        className={`text-lg font-bold ${(r.overall_score as number) >= 80
                          ? "text-green-400"
                          : (r.overall_score as number) >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {r.overall_score as number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "jobreference":
        return <JobReference />;

      default:
        return null;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingAnimation isProcessing={isProcessing} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white tracking-tight">ATSChecker</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <main
        className={`transition-all duration-300 min-h-screen ${sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[240px]"
          }`}
      >
        <div className="p-6 md:p-8 max-w-6xl mx-auto">{renderContent()}</div>
      </main>

      {/* Floating chat button (when not on chat tab) */}
      {activeTab !== "chat" && (
        <>
          <ChatButton onClick={() => setChatOpen(true)} />
          <ChatBot
            resumeId={resumeId}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            apiBase={API_BASE}
          />
        </>
      )}
    </>
  );
}
