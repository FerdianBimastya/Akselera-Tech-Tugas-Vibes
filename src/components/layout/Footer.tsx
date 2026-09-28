import React from "react";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { SITE_CONFIG } from "@/constants/config";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black transition-colors mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <AkseleraLogo width={180} height={48} variant="auto" />
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
            <span className="font-mono text-[11px]">Sistem Online • v{SITE_CONFIG.version}</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-500 gap-4">
          <p>{SITE_CONFIG.copyright}</p>
          <div className="flex space-x-6">
            <span className="hover:underline cursor-pointer">Privasi Internal</span>
            <span className="hover:underline cursor-pointer">Ketentuan Layanan</span>
            <span className="hover:underline cursor-pointer">Dukungan TI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
