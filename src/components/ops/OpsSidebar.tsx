"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  GraduationCap,
  BookOpen,
  Sliders,
  AlertCircle,
  FileClock,
  Server,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ExternalLink,
  Sparkles,
  School,
  MessageSquareQuote,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "MONITOR",
    items: [
      { href: "/ops/overview", label: "Cockpit Overview", icon: LayoutDashboard },
      { href: "/ops/students", label: "Students Directory", icon: Users },
      { href: "/ops/learning", label: "Learning Analytics", icon: GraduationCap },
      { href: "/ops/content", label: "Curriculum Content", icon: BookOpen },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/ops/payments", label: "Payments & Orders", icon: CreditCard, badge: "LIVE" },
      { href: "/ops/subscriptions", label: "Subscriptions", icon: Sliders },
      { href: "/ops/finance", label: "Finance & Orders", icon: CreditCard },
      { href: "/ops/exams", label: "Exams & Subjects Bank", icon: FileCheck, badge: "NEW" },
      { href: "/ops/issues", label: "Anomalies Queue", icon: AlertCircle },
      { href: "/ops/schools", label: "High Schools Queue", icon: School },
      { href: "/ops/experiences", label: "Experiences Moderation", icon: MessageSquareQuote },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { href: "/ops/audit", label: "Audit & Logs", icon: FileClock },
      { href: "/ops/system", label: "System Health", icon: Server },
    ],
  },
];

interface OpsSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function OpsSidebar({ className = "", onClose }: OpsSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ops_auth_token");
        localStorage.removeItem("ops_owner_bypass");
        document.cookie = "ops_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ops_owner_bypass=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
    }
    try {
      await signOut();
    } catch {}
    window.location.href = "/ops/login";
  };

  const userEmail = user?.email || "operator@shater.app";
  const userInitials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "OP";

  return (
    <aside className={`w-64 bg-[#080D1A]/95 backdrop-blur-2xl border-r border-[#1E293B]/80 flex flex-col justify-between shrink-0 select-none min-h-screen text-slate-200 shadow-2xl relative z-20 ${className}`}>
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-[#1E293B]/80 bg-gradient-to-b from-[#0D1526]/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-xs tracking-wider border border-indigo-400/30">
                  BAC
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#080D1A]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operations</span>
                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                    LIVE
                  </span>
                </div>
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                  Command Center
                </div>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="إغلاق القائمة"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
          </div>
        </div>

        {/* Categorized Navigation */}
        <nav className="p-3.5 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center justify-between">
                <span>{group.title}</span>
                <span className="w-8 h-px bg-[#1E293B]/60" />
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative ${
                      isActive
                        ? "bg-indigo-600/15 text-white font-semibold shadow-inner border border-indigo-500/30 backdrop-blur-md"
                        : "text-slate-400 hover:text-slate-100 hover:bg-[#0D1526]/80 hover:border hover:border-[#1E293B]/80"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                    )}
                    <div className="flex items-center gap-2.5 pl-1">
                      <div
                        className={`p-1 rounded-lg transition-colors ${
                          isActive
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "text-slate-400 group-hover:text-indigo-300 group-hover:bg-[#131D31]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Operator Session Footer */}
      <div className="p-3 border-t border-[#1E293B]/80 bg-[#080D1A]/95 backdrop-blur-xl">
        <div className="p-2.5 rounded-xl bg-[#0D1526]/80 border border-[#1E293B]/80 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                {userInitials}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {userEmail}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/20">
                    <ShieldCheck className="w-2.5 h-2.5 inline" />
                    OWNER
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Full Access</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out of Operations"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 px-1 flex items-center justify-between text-[11px]">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors group"
          >
            <span>Student App</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-[10px] text-slate-600 font-mono">v1.3-bento</span>
        </div>
      </div>
    </aside>
  );
}
