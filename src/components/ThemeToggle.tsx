"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
    const { theme, setTheme } = useTheme();
    // Avoid hydration mismatch by only rendering after mount
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 transition-all ${collapsed ? "justify-center" : ""}`}>
                <div className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Theme</span>}
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all ${collapsed ? "justify-center" : ""}`}
            title="Toggle theme"
        >
            <div className="relative w-4 h-4 flex-shrink-0 flex items-center justify-center">
                <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
    );
}
