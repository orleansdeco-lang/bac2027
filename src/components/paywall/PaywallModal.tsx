"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Calendar,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FeatureKey } from "@/lib/access/types";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: FeatureKey | string;
  title?: string;
  description?: string;
}

const FEATURE_DESCRIPTIONS: Record<
  string,
  { title: string; desc: string; icon: React.ReactNode; trialNote: string; proBenefit: string }
> = {
  EXAMS_FULL_LIBRARY: {
    title: "المكتبة الكاملة لأرشيف البكالوريا والفروض",
    desc: "افتح الأرشيف التاريخي الشامل لجميع البكالوريات الرسمية، الفروض الفصلية، والحلول الوزارية المفصلة.",
    icon: <BookOpen className="w-6 h-6 text-amber-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: كامل الأرشيف (2008-2026) + الفروض الفصلية + التصحيحات الوزارية وسلالم التنقيط",
  },
  PLANNER_PRO_AI: {
    title: "المخطط الذكي Planner PRO",
    desc: "جدولة تلقائية ذكية تعيد ترتيب مهامك عند التأخر، وتتكيف مع نقاط ضعفك وشعبتك الرسمية.",
    icon: <Calendar className="w-6 h-6 text-purple-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: التوزيع الذكي للحصص، إعادة الجدولة الديناميكية، والتكامل مع ثغرات التشخيص",
  },
  DIAGNOSTIC_FULL: {
    title: "التشخيص الشامل وشجرة التمكن",
    desc: "كشف الثغرات عبر جميع المواد، تصنيف مستوى التمكن لكل درس، وخريطة مخصصة لسد الفجوات.",
    icon: <Brain className="w-6 h-6 text-blue-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: فحص شامل لجميع المواد، شجرة المفاهيم المترابطة، وتقرير الجاهزية للبكالوريا",
  },
  ERROR_LAB_AI_TWINS: {
    title: "مخبر الأخطاء والأسئلة التوأم (AI Twins)",
    desc: "توليد أسئلة توأم ذكية للأخطاء التي ارتكبتها للتأكد من هضم الفكرة واستيعاب فخاخ البكالوريا.",
    icon: <Zap className="w-6 h-6 text-rose-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: أسئلة توأم مولدة ذكياً، جولات ترميم مكثفة، وتتبع مؤشر القضاء على الثغرة",
  },
  AI_TUTOR_UNLIMITED: {
    title: "الأستاذ الذكي غير المحدود (AI Tutor PRO)",
    desc: "مرافقة بيداغوجية تفاعلية على مدار الساعة لشرح خطوات الحل، تفكيك المنهجية، وتقنية فاينمان.",
    icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: مرافقة كاملة، فحص منهجي خطوة بخطوة، وأسئلة غير محدودة",
  },
  ANALYTICS_PRO: {
    title: "التحليلات المتقدمة ومؤشر الجاهزية",
    desc: "تنبؤ مبني على بياناتك الحقيقية لنسبة جاهزيتك للبكالوريا وتتبع ساعات التركيز الفعالة.",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
    trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
    proBenefit: "يستمر معك طيلة العام: مسار التطور نحو البكالوريا، نسبة تغطية المنهاج، وتنبؤ ذكي بالعلامة المتوقعة",
  },
};

export function PaywallModal({
  isOpen,
  onClose,
  feature = "EXAMS_FULL_LIBRARY",
  title,
  description,
}: PaywallModalProps) {
  if (!isOpen) return null;

  const featureInfo =
    FEATURE_DESCRIPTIONS[feature] || {
      title: title || "ميزة حصرية لمشتركي الشاطر بريميوم",
      desc: description || "هذه الميزة مصممة للطلاب الراغبين في التفوق والحصول على متابعة مخصصة.",
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      trialNote: "متاح بالكامل خلال فترة التجربة المجانية (3 أيام)",
      proBenefit: "بريميوم يمنحك التوجيه الشخصي والوصول الشامل لجميع أدوات المنصة طيلة الموسم",
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-amber-500/30 bg-card text-theme-text shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 -left-1/4 h-32 bg-gradient-to-b from-amber-500/15 via-purple-500/5 to-transparent pointer-events-none blur-2xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative text-center space-y-4">
          {/* Feature Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            {featureInfo.icon}
          </div>

          <div>
            <Badge
              variant="outline"
              size="sm"
              className="mb-2 text-xs font-bold text-amber-400 border-amber-500/30 bg-amber-500/10"
            >
              الشاطر بريميوم • SHATER PREMIUM ⭐
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-theme-text">
              {featureInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1.5 leading-relaxed max-w-md mx-auto">
              {featureInfo.desc}
            </p>
          </div>

          {/* Comparison Cards: Trial vs Premium Subscription */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right pt-2">
            <div className="p-3.5 rounded-2xl bg-surface/70 border border-theme/80 space-y-1.5">
              <span className="text-[11px] font-bold text-theme-muted uppercase tracking-wider block">
                ⏳ فترة التجربة (3 أيام)
              </span>
              <p className="text-xs text-theme-text leading-relaxed">
                {featureInfo.trialNote}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                ⭐ بعد التفعيل الكامل
              </span>
              <p className="text-xs text-theme-text leading-relaxed font-medium">
                {featureInfo.proBenefit}
              </p>
            </div>
          </div>

          {/* Transparent Pricing Overview */}
          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-theme flex items-center justify-between gap-4 text-right">
            <div>
              <span className="text-[11px] text-theme-muted block font-bold">خيارات الاشتراك الرسمية:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black text-amber-400 font-mono">1,500 دج</span>
                <span className="text-xs text-theme-secondary">شهرياً</span>
                <span className="text-stone-500 text-xs">•</span>
                <span className="text-sm font-black text-emerald-400 font-mono">4,900 دج</span>
                <span className="text-xs text-emerald-400 font-bold">للموسم كامل</span>
              </div>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px] text-emerald-400 border-emerald-500/30">
              الدفع عبر بريدي موب / CCP أو عند الاستلام
            </Badge>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link href="/subscribe" className="w-full sm:w-auto flex-1">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-sm gap-2 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>الترقية إلى الشاطر بريميوم الآن</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="w-full sm:w-auto text-xs text-theme-muted hover:text-theme-text"
            >
              <span>إغلاق</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
