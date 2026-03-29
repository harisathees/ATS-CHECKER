"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {/* <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>Mounted: {mounted ? "Yes" : "No"}</div>
      <button
        onClick={() => setTheme("light")}
        className="block w-full mt-2 px-2 py-1 bg-blue-500 text-white rounded"
      >
        Force Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className="block w-full mt-1 px-2 py-1 bg-gray-500 text-white rounded"
      >
        Force Dark
      </button> */}
    </div>
  );
}
