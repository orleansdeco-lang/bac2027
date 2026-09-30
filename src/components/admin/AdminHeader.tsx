"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, RefreshCw, ExternalLink } from "lucide-react";
import { useAdminSession } from "@/lib/admin/client";
import Link from "next/link";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "نظرة عامة", subtitle: "مؤشرات الأداء التشغيلي والأكاديمي للمنصة" },
  "/admin/overview": { title: "نظرة عامة", subtitle: "مؤشرات الأداء التشغيلي والأكاديمي للمنصة" },
  "/admin/students": { title: "إدارة الطلاب", subtitle: "سجل حسابات الطلاب، الشعب، والنشاط الأكاديمي" },
  "/admin/content": { title: "محتوى المنهاج", subtitle: "التحقق من الدروس والملخصات ومصادر المحتوى" },
  "/admin/exercises": { title: "بنك التمارين", subtitle: "إدارة المسائل، التمارين الوزارية، وحلول البكالوريا" },
  "/admin/learning": { title: "التعلم والإتقان", subtitle: "بيانات إتقان المهارات والتشخيص التكويني" },
  "/admin/orientation": { title: "التوجيه الجامعي", subtitle: "منظومة الجامعات والمدارس العليا ومعدلات القبول" },
  "/admin/study-rooms": { title: "مجلس العلم", subtitle: "إدارة ومراقبة غرف المذاكرة الجماعية الحية" },
  "/admin/ads": { title: "الحملات والإعلانات", subtitle: "إدارة البانرات الترويجية والإعلانات الموجهة" },
  "/admin/analytics": { title: "التحليلات ومسار التحويل", subtitle: "حركة الزيارات، التفاعل، ومعدلات الاستبقاء" },
  "/admin/ai": { title: "مساعد SHATER الذكي", subtitle: "بروتوكول الأمان وسياسات التدخل والرقابة الآلية" },
  "/admin/audit": { title: "سجل العمليات", subtitle: "سجل العمليات الإدارية غير القابل للتعديل (Append-Only)" },
};

interface AdminHeaderProps {
  onToggleMobileDrawer: () => void;
}

export function AdminHeader({ onToggleMobileDrawer }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, refetch } = useAdminSession();

  const currentMeta = PAGE_TITLES[pathname] || {
    title: "مركز تحكم الشاطر",
    subtitle: "الإدارة المركزية الموحدة للمنظومة",
  };

  return (
    <header className="h-16 bg-[#0D1526]/80 backdrop-blur-md border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between z-20">
      {/* Right side: Mobile Menu + Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileDrawer}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#131E36] border border-[#1E293B]"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Safe
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Left side: System Status, Refresh, and Public links */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security Invariant Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-[11px] font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RBAC + RLS Enforced</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          title="تحديث البيانات"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#131E36] border border-[#1E293B] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Link to public app */}
        <Link
          href="/dashboard"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] transition-colors"
        >
          <span>منصة الطالب</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
