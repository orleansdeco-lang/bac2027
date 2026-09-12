"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { syncAllLocalStorageToCloud } from "@/lib/repositories";
import { StrategicProfile } from "@/types/onboarding";
import {
  Compass,
  User,
  LogOut,
  LogIn,
  Cloud,
  CloudOff,
  RefreshCw,
  Target,
  Clock,
  Zap,
  ShieldCheck,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading, isConfigured } = useAuth();
  const { locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await StudentRepository.getProfile(user?.id);
        setProfile(p);
      } catch (err) {
        console.error("Error loading student profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await syncAllLocalStorageToCloud(user.id);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error("Error syncing to cloud:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-blue-400 animate-spin" />
            <p className="text-sm font-mono text-slate-400">
              {isAr ? "جاري تحميل الحساب..." : "Chargement du profil..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="home">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* Account Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isAr ? "حساب التلميذ وإعدادات الخطة" : "Compte & Préférences"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? "إدارة جلستك، المزامنة السحابية مع Supabase، وتفاصيل الخطة الدراسية."
                : "Gestion de votre session et de votre synchronisation cloud."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                <span>{isAr ? "متزامن" : "Connecté"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="flex items-center gap-1 text-slate-400">
                <CloudOff className="h-3 w-3" />
                <span>{isAr ? "محلي" : "Local"}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">{isAr ? "البريد الإلكتروني" : "E-mail"}</span>
              <span className="text-sm font-bold text-white font-mono break-all">
                {user?.email || (isAr ? "جلسة محلية (بدون تسجيل)" : "Session locale (invité)")}
              </span>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="w-full sm:w-auto text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? (isAr ? "جاري المزامنة..." : "Synchronisation...") : (isAr ? "مزامنة البيانات الآن" : "Synchroniser")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full sm:w-auto text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isAr ? "تسجيل الخروج" : "Déconnexion"}</span>
              </Button>

              {syncSuccess && (
                <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
                  ✓ {isAr ? "تمت المزامنة بنجاح!" : "Synchronisation réussie !"}
                </span>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                {isAr
                  ? "أنت تستخدم حالياً الوضع المحلي. يمكنك تسجيل حساب لحفظ تقدمك السحابي ومتابعته من أي جهاز."
                  : "Connectez-vous pour synchroniser votre progression dans le cloud."}
              </p>
              <Link href="/auth">
                <Button variant="primary" size="sm">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{isAr ? "تسجيل الدخول / إنشاء حساب" : "Connexion"}</span>
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Academic Profile Details */}
        <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span>{isAr ? "بيانات المسار والهدف الدراسي" : "Objectifs Académiques"}</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">{isAr ? "الشعبة" : "Filière"}</span>
              <span className="font-bold text-slate-200">
                {isAr ? "علوم تجريبية" : "Sciences Expérimentales"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">{isAr ? "معدل البكالوريا المستهدف" : "Objectif BAC"}</span>
              <span className="font-bold text-amber-300 font-mono">
                {profile?.targetScore ? `${profile.targetScore.toFixed(1)}/20` : "16.0/20"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">{isAr ? "الوقت الأسبوعي" : "Temps"}</span>
              <span className="font-bold text-slate-200">
                {profile?.availableTime ? profile.availableTime : "8-12 سا/أسبوع"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">{isAr ? "مستوى الطاقة" : "Énergie"}</span>
              <span className="font-bold text-slate-200">
                {profile?.studyEnergy ? profile.studyEnergy : "normal"}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="w-full text-xs border-slate-700">
                <span>{isAr ? "تعديل تفاصيل الخطة (Onboarding)" : "Modifier le profil"}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* System & Architecture Integrity Card */}
        <Card className="border-slate-800 bg-[#0e1628]/80 p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? "أمان البيانات والخصوصية" : "Sécurité & Confidentialité"}</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isAr
              ? "بياناتك الأكاديمية محمية بسياسات RLS الصارمة على Supabase. لا يتم استخدام أي ذكاء اصطناعي خارجي أو مشاركة بياناتك مع أطراف ثالثة."
              : "Vos données sont protégées par les politiques RLS strictes sur Supabase."}
          </p>
        </Card>
      </Container>
    </AppShell>
  );
}
