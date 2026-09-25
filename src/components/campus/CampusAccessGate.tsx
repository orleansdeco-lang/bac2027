"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useLearningAccessGate } from "@/lib/hooks";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Lock,
  Sparkles,
  Users,
  Share2,
  Clock,
  ShieldAlert,
  ArrowRight,
  LogIn,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";

interface CampusAccessGateProps {
  children: React.ReactNode;
  requiredStream?: StreamId;
  isTableSession?: boolean;
}

export function CampusAccessGate({
  children,
  requiredStream,
  isTableSession = false,
}: CampusAccessGateProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const gate = useLearningAccessGate({ redirectToAuth: false });
  const pathname = usePathname();
  const router = useRouter();

  const [copiedInvite, setCopiedInvite] = useState(false);

  // Check auth user from localStorage as fallback
  const [hasLocalAuth, setHasLocalAuth] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("bac_auth_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.id) setHasLocalAuth(true);
        } catch {}
      }
    }
  }, []);

  const isAuthenticated = Boolean(user || hasLocalAuth);

  // Loading State
  if (isAuthLoading || gate.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center" dir="rtl">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <p className="text-sm font-bold text-theme-muted">جاري التحقق من صلاحيات مجالس العلم وبنك التجارب...</p>
      </div>
    );
  }

  // 1. STRICT AUTHENTICATION GATE
  if (!isAuthenticated) {
    const fullCurrentUrl = typeof window !== "undefined" ? window.location.href : pathname;
    const loginUrl = `/auth?mode=login&redirect=${encodeURIComponent(pathname)}&notice=campus_auth_required`;
    const registerUrl = `/auth/register?redirect=${encodeURIComponent(pathname)}`;

    return (
      <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-8" dir="rtl">
        <Card className="max-w-xl w-full p-6 sm:p-8 border-purple-500/40 bg-surface-elevated/95 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-3xl">
          {/* Top ambient glow */}
          <div className="absolute top-0 right-1/4 -left-1/4 h-32 bg-gradient-to-b from-purple-500/15 via-indigo-500/5 to-transparent pointer-events-none blur-2xl" />

          <div className="relative text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/25">
              <Lock className="w-8 h-8" />
            </div>

            <Badge variant="primary" size="md" className="mb-3 px-3 py-1 font-bold">
              فضاء مجالس العلم وبنك التجارب 🏛️
            </Badge>

            <h2 className="text-xl sm:text-2xl font-black text-theme-text mb-3">
              منطقة مخصصة لطلاب البكالوريا المسجلين
            </h2>

            <p className="text-sm text-theme-muted leading-relaxed mb-6 max-w-md mx-auto">
              للانضمام إلى طاولات المذاكرة التفاعلية ثلاثية الأبعاد، تبادل الملخصات، وحفظ التجارب والفخاخ الوزارية في حقيبتك اليومية، يرجى تسجيل الدخول أو إنشاء حسابك المجاني.
            </p>

            <div className="p-4 rounded-2xl bg-surface border border-theme/80 mb-6 text-right space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>طاولات دراسية تفاعلية متزامنة حسب الشعبة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>بنك تجارب حقيقي من متفوقي البكالوريات السابقة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تكامل تلقائي مع معمل الأخطاء وجدولك اليومي</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={loginUrl} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للمتابعة</span>
                </Button>
              </Link>
              <Link href={registerUrl} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full gap-2">
                  <span>إنشاء حساب تلميذ جديد</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. SUBSCRIPTION & TRIAL GATE
  const hasAccess = gate.hasPremiumAccess;
  if (!hasAccess && gate.accessDecision && !gate.accessDecision.canUseProduct) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-8" dir="rtl">
        <Card className="max-w-xl w-full p-6 sm:p-8 border-amber-500/40 bg-surface-elevated/95 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="relative text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <Badge variant="warning" size="md" className="mb-3 px-3 py-1 font-bold">
              فترة التجربة انتهت ⏳
            </Badge>

            <h2 className="text-xl sm:text-2xl font-black text-theme-text mb-3">
              اشترك الآن للوصول الكامل إلى مجالس العلم
            </h2>

            <p className="text-sm text-theme-muted leading-relaxed mb-6">
              لقد انتهت فترة الـ 7 أيام التجريبية المجانية. للانضمام إلى طاولات التحدي التفاعلية وبنك التجارب، فعّل اشتراكك الفصلي أو السنوي للبكالوريا.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/subscribe" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>تفعيل الاشتراك الآن</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full">
                  <span>العودة للوحة التحكم</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 3. TABLE SESSION STREAM VERIFICATION (SPECTATOR VS PARTICIPANT)
  const studentStream =
    gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp";

  const isStreamMismatch = Boolean(
    isTableSession && requiredStream && requiredStream !== studentStream
  );

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  return (
    <>
      {/* Stream Mismatch Notice Banner (Spectator Mode) */}
      {isStreamMismatch && requiredStream && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 sm:p-4 text-theme-text" dir="rtl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-right">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-500">وضع المشاهدة والمعاينة (Spectator Mode)</span>
                  <Badge variant="outline" size="sm" className="text-[10px] border-amber-500/40 text-amber-500">
                    شعبة {ALGERIAN_BAC_STREAMS[requiredStream]?.name_ar || requiredStream}
                  </Badge>
                </div>
                <p className="text-xs text-theme-muted mt-0.5">
                  أنت مسجل بشعبة ({ALGERIAN_BAC_STREAMS[studentStream as keyof typeof ALGERIAN_BAC_STREAMS]?.name_ar || studentStream}). المقاعد محصورة لطلاب هذه الشعبة، لكن يمكنك المتابعة ومشاركة الرابط.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInvite}
              className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10 gap-2 shrink-0 w-full sm:w-auto font-bold text-xs"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>تم نسخ رابط الدعوة!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>شارك الطاولة مع زميل في هذه الشعبة</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
