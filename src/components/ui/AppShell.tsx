"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: "home" | "roadmap" | "missions" | "progress" | string;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  noPadding?: boolean;
}

export function AppShell({
  children,
  activeNav,
  showTopBar = true,
  showBottomNav = true,
  showSidebar,
  showFooter = true,
  noPadding = false,
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

      <div
        className={cn(
          "flex-1 w-full mx-auto flex gap-6",
          noPadding
            ? "p-0 max-w-none"
            : "max-w-[1600px] px-3 sm:px-6 md:px-8 py-4 md:py-6 pb-24 md:pb-12"
        )}
      >
        {shouldShowSidebar && <Sidebar />}

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {showFooter && (
        <footer className="hidden md:block py-6 border-t border-theme text-center text-xs text-theme-muted transition-colors duration-200">
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span>BAC Mastery © {new Date().getFullYear()} — ماشي واش تقرا. كيفاش توصل.</span>
            <span className="hidden sm:inline text-theme-border opacity-50">•</span>
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى مساعدة ودعم فني في منصة BAC Mastery.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>خدمة العملاء والدعم الفني WhatsApp (+213 550 85 32 34)</span>
            </a>
          </div>
        </footer>
      )}

      {showBottomNav && <BottomNav />}
    </div>
  );
}
