"use client";

import React, { useState } from "react";
import { AdminSessionProvider, useAdminSession } from "@/lib/admin/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, authorized, error } = useAdminSession();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex flex-col items-center justify-center text-slate-400 font-sans p-4" dir="rtl">
        <div className="flex flex-col items-center gap-4 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-200">التحقق من جلسة التحكم...</div>
            <div className="text-xs text-slate-500 font-mono">Verifying cryptographic RBAC session</div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (401 / 403)
  if (!authorized || !user) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4" dir="ltr">
        <div className="max-w-md w-full bg-[#0D1526] border border-[#1E293B] rounded-2xl p-7 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">Accès Refusé : Droits Administrateur Requis</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || "Cette interface est strictement réservée à l'équipe d'exploitation et d'administration de la plateforme SHATER."}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-[11px] font-mono text-slate-400 text-left space-y-1">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>CONTRÔLE DE SÉCURITÉ RBAC</span>
            </div>
            <div>Statut : 403 Interdit</div>
            <div>Règle : requireAdmin() vérifié</div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/ops/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>Connexion Administrateur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Retour à l'espace élève (العودة للمنصة)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Control Center Layout (French-first SaaS LTR)
  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans" dir="ltr">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex" dir="ltr">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative z-10 w-72 h-full bg-[#0D1526] shadow-2xl">
              <AdminSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader onToggleMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080D1A]">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSessionProvider>
  );
}
