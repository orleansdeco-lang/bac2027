"use client";

import React from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: "home" | "roadmap" | "missions" | "progress" | string;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  showFooter?: boolean;
}

export function AppShell({
  children,
  activeNav,
  showTopBar = true,
  showBottomNav = true,
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)] transition-colors duration-200">
      {showTopBar && <TopBar />}

      <div className="flex-1 pb-20 md:pb-10">
        {children}
      </div>

      {showFooter && (
        <footer className="hidden md:block py-6 border-t border-theme text-center text-xs text-theme-muted transition-colors duration-200">
          BAC Mastery © {new Date().getFullYear()} — ماشي واش تقرا. كيفاش توصل.
        </footer>
      )}

      {showBottomNav && <BottomNav />}
    </div>
  );
}
