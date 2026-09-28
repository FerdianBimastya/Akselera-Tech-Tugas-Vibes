"use client";

import React from "react";
import Link from "next/link";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { SITE_CONFIG } from "@/constants/config";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <AkseleraLogo width={210} height={56} variant="auto" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {SITE_CONFIG.navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
