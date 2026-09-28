"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 transition-colors ${className}`}
      role="radiogroup"
      aria-label="Pilih Mode Tampilan"
    >
      {/* Light Mode Button */}
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          theme === "light"
            ? "bg-black text-white shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        }`}
        title="Mode Terang"
        aria-checked={theme === "light"}
        role="radio"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>Light</span>
      </button>

      {/* Dark Mode Button */}
      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          theme === "dark"
            ? "bg-white text-black shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        }`}
        title="Mode Gelap"
        aria-checked={theme === "dark"}
        role="radio"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <span>Dark</span>
      </button>

      {/* System Theme Button */}
      <button
        onClick={() => setTheme("system")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          theme === "system"
            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        }`}
        title="Ikuti Sistem"
        aria-checked={theme === "system"}
        role="radio"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span>Auto</span>
      </button>
    </div>
  );
};
