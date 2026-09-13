"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: "home" | "roadmap" | "missions" | "progress" | string;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function AppShell({
  children,
  activeNav,
  showTopBar = true,
  showBottomNav = true,
  showSidebar,
  showFooter = true,
}: AppShellProps) {
  const pathname = usePathname();
  const isAppPage =
    Boolean(pathname) &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/roadmap") ||
      pathname.startsWith("/progress") ||
      pathname.startsWith("/error-lab") ||
      pathname.startsWith("/exam") ||
      pathname.startsWith("/account"));

  const shouldShowSidebar = showSidebar !== undefined ? showSidebar : isAppPage;

  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)] transition-colors duration-200">
      {showTopBar && <TopBar />}

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 md:px-8 py-4 md:py-6 flex gap-6 pb-24 md:pb-12">
        {shouldShowSidebar && <Sidebar />}

        <main className="flex-1 min-w-0">
          {children}
        </main>
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
