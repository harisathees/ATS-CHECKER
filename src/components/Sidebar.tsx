"use client";

import React from "react";
import {
    LayoutDashboard,
    Upload,
    MessageSquare,
    Briefcase,
    FileText,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Link,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Upload Resume", icon: Upload },
    { id: "rewrite", label: "AI Rewriter", icon: Sparkles },
    { id: "jobmatch", label: "Job Match", icon: Briefcase },
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "history", label: "My Resumes", icon: FileText },
    { id: "jobreference", label: "Job Reference", icon: Link },
];

export function Sidebar({
    activeTab,
    onTabChange,
    collapsed,
    onToggle,
    mobileOpen,
    onMobileClose,
}: SidebarProps) {
    const { user, logout } = useAuth();

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={onMobileClose}
                />
            )}
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/5 flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"
                    } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-4 border-b border-gray-200 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="ml-3 font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                            ATS<span className="text-violet-500 dark:text-violet-400">Checker</span>
                        </span>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center px-3 py-3 mt-2 rounded-xl text-sm font-medium transition-all relative group ${isActive
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                    } ${collapsed ? "justify-center" : ""}`}
                            >
                                {isActive && (
                                    <div
                                        className="absolute inset-0 rounded-xl z-0"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.05))",
                                            border: "1px solid rgba(139,92,246,0.1)",
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 relative z-10 flex-shrink-0 transition-colors ${isActive ? "text-violet-500 dark:text-violet-400" : "group-hover:text-violet-500 dark:group-hover:text-violet-300"
                                        }`}
                                />
                                {!collapsed && (
                                    <span className="relative z-10 whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && !collapsed && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-violet-400 z-10" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Theme & Logout */}
                <div className="p-3 border-t border-gray-200 dark:border-white/5 space-y-2">
                    <ThemeToggle collapsed={collapsed} />

                    {user && (
                        <>
                            <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/20 transition-all ${collapsed ? "justify-center" : ""}`}
                                title="Log out"
                            >
                                <LogOut className="w-4 h-4 flex-shrink-0" />
                                {!collapsed && <span>Log out</span>}
                            </button>
                        </>
                    )}
                </div>

                {/* Collapse toggle */}
                <div className="p-2 border-t border-gray-200 dark:border-white/5">
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
