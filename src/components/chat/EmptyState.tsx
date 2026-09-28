"use client";

import React from "react";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  onNewChatClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewChatClick }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-neutral-50/60 dark:bg-neutral-950/60 bg-grid-pattern select-none relative overflow-hidden">
      {/* Background Decorative Ambient Blur */}
      <div className="absolute w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none -top-20 -right-20" />
      <div className="absolute w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none -bottom-20 -left-20" />

      <div className="max-w-md w-full flex flex-col items-center z-10 animate-fadeIn">
        {/* Brand Icon Glass Box */}
        <div className="mb-6 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-105">
          <AkseleraLogo width={200} height={54} variant="auto" showText={false} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-neutral-900 dark:text-white">
          Ruang Obrolan Akselera.Tech
        </h2>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 max-w-sm">
          Platform komunikasi internal real-time terenkripsi untuk kolaborasi tim Akselera.Tech secara cepat & efisien.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
          <span className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
            ⚡ Auto-Sync Instant
          </span>
          <span className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
            🔒 End-to-End Encrypted
          </span>
          <span className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
            💬 Direct 1-on-1 Chat
          </span>
        </div>

        {/* Action Button */}
        {onNewChatClick && (
          <Button
            variant="primary"
            size="lg"
            onClick={onNewChatClick}
            className="flex items-center gap-2.5 font-bold tracking-wide rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all py-3 px-6 text-xs uppercase"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Mulai Chat Baru</span>
          </Button>
        )}

        {/* Security Tag Footer */}
        <div className="mt-12 flex items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Akselera.Tech Internal Security Protocol</span>
        </div>
      </div>
    </div>
  );
};

