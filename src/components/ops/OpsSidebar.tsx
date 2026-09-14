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
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "MONITOR",
    items: [
      { href: "/ops/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/ops/students", label: "Students", icon: Users },
      { href: "/ops/learning", label: "Learning", icon: GraduationCap },
      { href: "/ops/content", label: "Content", icon: BookOpen },
    ],
  },
  {
    title: "CONTROL",
    items: [
      { href: "/ops/subscriptions", label: "Subscriptions", icon: Sliders },
      { href: "/ops/finance", label: "Finance & Orders", icon: CreditCard },
      { href: "/ops/issues", label: "Issues Queue", icon: AlertCircle },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { href: "/ops/audit", label: "Audit Log", icon: FileClock },
      { href: "/ops/system", label: "System Health", icon: Server },
    ],
  },
];

export function OpsSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ops_auth_token");
        document.cookie = "ops_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
    }
    try {
      await signOut();
    } catch {}
    window.location.href = "/ops/login";
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-screen text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              OP
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">BAC Mastery</div>
              <div className="text-sm font-semibold text-white">Operations Center</div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
            V1
          </span>
        </div>

        {/* Categorized Navigation */}
        <nav className="p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white font-semibold shadow-sm border-l-2 border-indigo-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Operator Session Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-medium text-slate-300 truncate">
                {user?.email || "Operator Admin"}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">OPERATOR / OWNER</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/60 text-center">
          <Link
            href="/dashboard"
            className="text-[11px] text-slate-400 hover:text-indigo-400 underline transition-colors"
          >
            Back to Student App &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
