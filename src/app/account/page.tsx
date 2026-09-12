"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { StudentService } from "@/lib/services";
import {
  User,
  ShieldCheck,
  RefreshCw,
  LogOut,
  LogIn,
  Target,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Cloud,
  CloudOff,
  Palette,
} from "lucide-react";

export default function AccountPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const p = getStrategicProfile();
    if (p) setProfile(p);
  }, []);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      if (profile) {
        await StudentService.saveProfile(profile);
      }
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      console.error("Manual sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  if (authLoading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
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
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-text tracking-tight font-sans">
              {isAr ? "حساب التلميذ وإعدادات الخطة" : "Compte & Préférences"}
            </h1>
            <p className="text-xs text-theme-secondary mt-1">
              {isAr
                ? "إدارة جلستك، المظهر، والمزامنة السحابية."
                : "Gestion de votre session, apparence et synchronisation cloud."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                <span>{isAr ? "متزامن" : "Connecté"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="flex items-center gap-1 text-theme-muted border-theme">
                <CloudOff className="h-3 w-3" />
                <span>{isAr ? "محلي" : "Local"}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* 1. VISUAL THEME & PERSONALITY SELECTOR */}
        <Card className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Palette className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "المظهر والشخصية البصرية" : "Ambiance & Thème"}</span>
            </div>
            <span className="text-[11px] text-theme-muted font-medium">
              {isAr ? "3 شخصيات للدراسة" : "3 ambiances"}
            </span>
          </div>

          <ThemeSelector variant="cards" />
        </Card>

        {/* 2. Authentication Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-theme-muted block">{isAr ? "البريد الإلكتروني" : "E-mail"}</span>
              <span className="text-sm font-bold text-theme-text font-mono break-all">
                {user?.email || (isAr ? "جلسة محلية (بدون تسجيل)" : "Session locale (invité)")}
              </span>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-theme">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="w-full sm:w-auto text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? (isAr ? "جاري المزامنة..." : "Synchronisation...") : (isAr ? "مزامنة البيانات الآن" : "Synchroniser")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isAr ? "تسجيل الخروج" : "Déconnexion"}</span>
              </Button>

              {syncSuccess && (
                <span className="text-xs text-emerald-400 font-semibold animate-in fade-in-50">
                  ✓ {isAr ? "تمت المزامنة بنجاح!" : "Synchronisation réussie !"}
                </span>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-theme space-y-2">
              <p className="text-xs text-theme-secondary leading-relaxed">
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

        {/* 3. Academic Profile Details */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span>{isAr ? "بيانات المسار والهدف الدراسي" : "Objectifs Académiques"}</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الشعبة" : "Filière"}</span>
              <span className="font-bold text-theme-text">
                {isAr ? "علوم تجريبية" : "Sciences Expérimentales"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "معدل البكالوريا المستهدف" : "Objectif BAC"}</span>
              <span className="font-bold text-amber-400 font-mono">
                {profile?.targetScore ? `${profile.targetScore.toFixed(1)}/20` : "16.0/20"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الوقت الأسبوعي" : "Temps"}</span>
              <span className="font-bold text-theme-text">
                {profile?.availableTime ? profile.availableTime : "8-12 سا/أسبوع"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "مستوى الطاقة" : "Énergie"}</span>
              <span className="font-bold text-theme-text">
                {profile?.studyEnergy ? profile.studyEnergy : "normal"}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <span>{isAr ? "تعديل تفاصيل الخطة (Onboarding)" : "Modifier le profil"}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 4. System & Integrity Card */}
        <Card className="p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-theme-secondary font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? "أمان البيانات والخصوصية" : "Sécurité & Confidentialité"}</span>
          </div>
          <p className="text-theme-muted leading-relaxed">
            {isAr
              ? "بياناتك الأكاديمية محمية بسياسات RLS الصارمة على Supabase. لا يتم استخدام أي ذكاء اصطناعي خارجي أو مشارقة بياناتك مع أطراف ثالثة."
              : "Vos données sont protégées par les politiques RLS strictes sur Supabase."}
          </p>
        </Card>
      </Container>
    </AppShell>
  );
}
