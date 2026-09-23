"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

function OpsLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/ops/overview";
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, check if current user is an operator or owner authoritatively
  useEffect(() => {
    async function checkExistingAuth() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          const res = await fetch("/api/ops/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ token: data.session.access_token }),
          });
          const json = await res.json();
          if (json.authorized) {
            setSuccessMsg(`الجلسة نشطة برتبة ${json.role}. جاري نقلك إلى لوحة التحكم...`);
            setTimeout(() => {
              router.push(redirectTarget);
            }, 500);
          }
        }
      } catch {}
    }
    checkExistingAuth();
  }, [router, redirectTarget, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setErrorMsg("تعذر الاتصال بقاعدة بيانات المصادقة. تحقق من إعدادات الاتصال.");
        setIsLoading(false);
        return;
      }

      // 1. Authenticate with Supabase Auth
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr || !data?.session) {
        setErrorMsg(
          signInErr?.message === "Invalid login credentials"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من بيانات الاعتماد."
            : `فشل تسجيل الدخول: ${signInErr?.message || "خطأ غير معروف"}`
        );
        setIsLoading(false);
        return;
      }

      const token = data.session.access_token;

      // Store in client storage & cookies
      if (typeof window !== "undefined") {
        const isHttps = window.location.protocol === "https:";
        const secureAttr = isHttps ? "; Secure" : "";
        localStorage.setItem("ops_auth_token", token);
        localStorage.setItem("bac_auth_user", JSON.stringify(data.user));
        document.cookie = `ops_auth_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
      }

      // 2. Server-side authoritative verification of OPERATOR or OWNER role
      const verifyRes = await fetch("/api/ops/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.authorized) {
        setErrorMsg(
          `تم قبول بيانات الاعتماد، لكن هذا الحساب ليس لديه صلاحيات مشغل (OPERATOR أو OWNER). دخول قاعدة العمليات محصور على الإدارة العليا.`
        );
        setIsLoading(false);
        return;
      }

      // 3. Authorized! Show badge and redirect
      setSuccessMsg(`مرحباً بك! تم التحقق من الصلاحيات الإدارية (${verifyData.role}). جاري فتح قمرة العمليات...`);

      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } catch (err: any) {
      console.error("[Ops Login Error]:", err);
      setErrorMsg("حدث خطأ غير متوقع أثناء المصادقة. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-600/20">
            OP
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              SHATER OPS
            </div>
            <div className="text-xs font-semibold text-slate-200">
              Operations Cockpit
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <span>العودة للمنصة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 border border-indigo-500/30 flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-950/50">
                <Shield className="w-8 h-8 text-indigo-200" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                مركز العمليات والإدارة العليا
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                منطقة مقيدة حصرياً بالمشغلين والإدارة العليا (OWNER / OPERATOR)
              </p>
            </div>
          </div>

          {/* Form Box */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-200 flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-semibold">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  البريد الإلكتروني الإداري (Operator Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@bacmastery.dz"
                    disabled={isLoading}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    كلمة المرور (Secret Key / Password)
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    dir="ltr"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full pr-9 pl-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري التحقق من الصلاحيات...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>تسجيل الدخول إلى مركز العمليات</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                SHATER Operations Authorization Engine • Phase P0.1 Commercial Hardening
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-900 text-center text-[11px] text-slate-600 font-mono">
        Secured with Remote Supabase Row-Level Security & Role-Based Access Control
      </footer>
    </div>
  );
}

export default function OpsLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
          جاري التحميل...
        </div>
      }
    >
      <OpsLoginForm />
    </React.Suspense>
  );
}
