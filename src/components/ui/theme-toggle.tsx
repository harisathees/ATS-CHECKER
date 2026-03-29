"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted before rendering
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    console.log("Current theme:", theme, "Resolved theme:", resolvedTheme);
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 group"
        aria-label="Toggle theme"
      >
        <div className="h-6 w-6"></div>
      </button>
    );
  }

  // Use resolvedTheme for more reliable theme detection
  const isLight = resolvedTheme === "light";

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 group"
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200 dark:text-gray-600" />
      ) : (
        <Sun className="h-6 w-6 group-hover:scale-110 transition-transform duration-200 dark:text-gray-600" />
      )}
    </button>
  );
}
