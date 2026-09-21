"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: "home" | "roadmap" | "missions" | "progress" | string;
  showTopBar?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  noPadding?: boolean;
}

export function AppShell({
  children,
  activeNav,
  showTopBar = true,
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
      pathname.startsWith("/exams") ||
      pathname.startsWith("/experiences") ||
      pathname.startsWith("/planner") ||
      pathname.startsWith("/account"));

  const shouldShowSidebar = showSidebar !== undefined ? showSidebar : isAppPage;

  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)] transition-colors duration-200">
      {showTopBar && <TopBar />}

      <div
        className={cn(
          "flex-1 w-full mx-auto flex gap-4 md:gap-5 lg:gap-6 xl:gap-8",
          noPadding
            ? "p-0 max-w-none"
            : "max-w-[1920px] 3xl:max-w-[2400px] px-3 sm:px-4 md:px-6 lg:px-8 3xl:px-12 py-4 md:py-6 pb-8 md:pb-12"
        )}
      >
        {shouldShowSidebar && <Sidebar />}

        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>

      {showFooter && (
        <footer className="hidden md:block py-6 border-t border-theme text-center text-xs text-theme-muted transition-colors duration-200">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span>الشاطر | SHATER © {new Date().getFullYear()} — منظومة ذكية للتعلم والتدريب وبناء الكفاءة</span>
            <span className="hidden sm:inline text-theme-border opacity-50">•</span>
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى مساعدة ودعم فني في منظومة الشاطر.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>
                خدمة المساعدة والدعم WhatsApp (
                <span dir="ltr" className="font-mono inline-block text-left" style={{ unicodeBidi: "isolate" }}>
                  +213 550 85 32 34
                </span>
                )
              </span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
