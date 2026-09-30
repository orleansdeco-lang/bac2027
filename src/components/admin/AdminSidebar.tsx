"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Compass,
  MessageSquare,
  Megaphone,
  BarChart3,
  Bot,
  History,
  Shield,
  LogOut,
  ChevronLeft,
  Lock,
  FileCheck,
  BrainCircuit,
  Package,
  Sparkles,
} from "lucide-react";
import { useAdminSession } from "@/lib/admin/client";
import { AdminPermission } from "@/lib/admin/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: AdminPermission;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "نظرة عامة",
    href: "/admin/overview",
    icon: LayoutDashboard,
    permission: "platform.read",
  },
  {
    name: "الطلاب",
    href: "/admin/students",
    icon: Users,
    permission: "students.read",
  },
  {
    name: "إدارة الطلبات",
    href: "/admin/orders",
    icon: Package,
    permission: "orders.read",
    badge: "COD",
  },
  {
    name: "المحتوى",
    href: "/admin/content",
    icon: BookOpen,
    permission: "content.read",
  },
  {
    name: "مراجعة الوكيل",
    href: "/admin/content/review",
    icon: FileCheck,
    permission: "content.read",
    badge: "وكيل AI",
  },
  {
    name: "التمارين",
    href: "/admin/exercises",
    icon: HelpCircle,
    permission: "exercises.read",
  },
  {
    name: "ذكاء التمارين",
    href: "/admin/exercises/intelligence",
    icon: BrainCircuit,
    permission: "exercises.read",
    badge: "وكيل AI",
  },
  {
    name: "التعلم",
    href: "/admin/learning",
    icon: GraduationCap,
    permission: "learning.read",
  },
  {
    name: "ذكاء التعلم",
    href: "/admin/learning/intelligence",
    icon: Sparkles,
    permission: "learning.read",
    badge: "مستكشف AI",
  },
  {
    name: "التوجيه",
    href: "/admin/orientation",
    icon: Compass,
    permission: "orientation.read",
  },
  {
    name: "مجلس العلم",
    href: "/admin/study-rooms",
    icon: MessageSquare,
    permission: "study_rooms.read",
  },
  {
    name: "الإعلانات",
    href: "/admin/ads",
    icon: Megaphone,
    permission: "ads.read",
  },
  {
    name: "التحليلات",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics.read",
  },
  {
    name: "جودة البيانات",
    href: "/admin/data-quality",
    icon: FileCheck,
    permission: "platform.read",
  },
  {
    name: "مساعد SHATER",
    href: "/admin/ai",
    icon: Bot,
    permission: "ai.use",
    badge: "وضع المراقبة",
  },
  {
    name: "سجل العمليات",
    href: "/admin/audit",
    icon: History,
    permission: "audit.read",
  },
];

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAdminSession();

  const roleBadgeColor =
    user?.role === "OWNER"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
      : user?.role === "OPERATOR"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
      : "bg-teal-500/10 text-teal-400 border-teal-500/30";

  return (
    <aside className="w-72 bg-[#0D1526] border-l border-[#1E293B] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-lg">
            ش
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-wide text-base">مركز تحكم الشاطر</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              SHATER CONTROL CENTER v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Operator Badge */}
      <div className="px-4 py-3 bg-[#080D1A]/60 border-b border-[#1E293B]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-[130px]">
            {user?.email || "مدير النظام"}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
        >
          {user?.role || "GUEST"}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          الوحدات الإدارية
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const allowed = !item.permission || hasPermission(item.permission);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#131E36]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
                {!allowed && (
                  <span title="يتطلب تصريحاً إضافياً">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  </span>
                )}
                {isActive && (
                  <ChevronLeft className="w-4 h-4 text-indigo-400" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0A101D] space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج الآمن</span>
        </button>

        <div className="text-center text-[10px] text-slate-500 font-mono">
          Security Protocol: HMAC+JWT • RLS Enforced
        </div>
      </div>
    </aside>
  );
}
