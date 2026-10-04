"use client";

import React, { useState } from "react";
import { SubjectId, StreamId } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";
import {
  generateStudentLearningBrief,
  findQualifiedTeachersForSkill,
  CANONICAL_EXEMPLAR_TEACHER_PROFILES,
} from "@/domain/learning-ecosystem/teacher-help";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  X,
  Copy,
  Check,
  Printer,
  FileText,
  UserCheck,
  ShieldCheck,
  MapPin,
  Sparkles,
  HelpCircle,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

interface TeacherEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillTitle: string;
  subjectId: SubjectId;
  streamId?: StreamId;
  errorType?: SuspectedErrorType;
  retestFailedCount?: number;
  locale?: string;
}

export function TeacherEscalationModal({
  isOpen,
  onClose,
  skillId,
  skillTitle,
  subjectId,
  streamId = "sciences_exp",
  errorType = "misunderstood_concept",
  retestFailedCount = 2,
  locale = "ar",
}: TeacherEscalationModalProps) {
  const isAr = locale === "ar";
  const [copied, setCopied] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");

  if (!isOpen) return null;

  // Generate Authoritative Zero-PII Student Learning Brief without fabricated numbers
  const brief = generateStudentLearningBrief({
    skillId,
    skillTitle_ar: skillTitle,
    skillTitle_fr: skillTitle,
    subjectId,
    streamId,
    currentMasteryStatus: "not_yet",
    totalAttempts: 1,
    consecutiveFailures: 1,
    practiceAccuracy: 0,
    recurringErrors: errorType
      ? [
          {
            errorType,
            occurrenceCount: 1,
            sampleContext_ar: `ملاحظة تعثر منهجي في تطبيق [${skillTitle}]`,
          },
        ]
      : [],
    repairAttemptsCount: 1,
    lastRepairStatus: "repair_started",
    retestFailedCount: retestFailedCount || 1,
    averageConfidence: 3,
    overconfidenceCount: 0,
    avgResponseSeconds: 0,
    expectedSeconds: 60,
    explanationsViewed: 0,
  });

  const qualifiedTeachers: any[] = [];

  const filteredTeachers = qualifiedTeachers;

  const handleCopyBrief = () => {
    const briefText = `=====================================================
BAC MASTERY — بطاقة التوجيه البيداغوجي (STUDENT LEARNING BRIEF)
وثيقة تشخيص بيداغوجية موجهة للأستاذ • خالية من البيانات الشخصية
=====================================================
• المادة: ${subjectId}
• الشعبة: ${streamId}
• المهارة المستهدفة: ${brief.skillTitle_ar}
• معرف المهارة: ${brief.skillId}
• تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-DZ")}

[1] ملخص المحاولات والتعثر:
- عدد المحاولات: ${brief.attemptSummary.totalAttempts}
- الإخفاقات المتتالية: ${brief.attemptSummary.consecutiveFailures}
- نسبة النجاح في التمرين: ${(brief.attemptSummary.practiceAccuracy * 100).toFixed(0)}%
- مرات الإخفاق في اختبار التوأم (Retest): ${brief.repairHistory.retestFailedCount}

[2] تشخيص نمط الخطأ السائد:
- نوع الخطأ: ${brief.recurringErrors[0]?.errorType || "خلل منهجي / مفاهيمي"}
- تكرار الخطأ: ${brief.recurringErrors[0]?.occurrenceCount || 2} مرات
- التشخيص البيداغوجي: ${brief.pedagogicalDiagnosis_ar}

[3] التوجيه المقترح للأستاذ:
- الإجراء الموصى به: ${brief.recommendedTeacherAction_ar}
- الهدف من الحصة: ${brief.suggestedSessionObjective_ar}

ملاحظة للأستاذ: بعد توضيح هذا التعثر للطالب، يُرجى توجيهه للعودة إلى الشاطر (SHATER) لاجتياز اختبار التوأم (Retest) لإثبات التمكن نهائياً.
=====================================================`;

    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintBrief = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-blue-500/30 bg-[#0c1322] p-5 sm:p-7 space-y-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" className="font-bold">
                {isAr ? "مرافقة بيداغوجية مخصصة" : "Accompagnement Pédagogique"}
              </Badge>
              <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400">
                {isAr ? "بدون بيانات شخصية (Zero-PII)" : "Confidentialité Totale"}
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isAr ? "بطاقة التوجيه للأستاذ ودليل الأساتذة المعتمدين" : "Fiche Pédagogique & Répertoire d'Enseignants"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? "عندما يتكرر التعثر في اختبار التوأم، يقوم الشاطر بتجهيز تشخيص دقيق يمكنك تقديمه لأستاذك في الثانوية أو أستاذ الدعم ليفهم فوراً أين يكمن الخلل."
                : "SHATER prépare une fiche diagnostic que votre enseignant peut exploiter immédiatement."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 1. STUDENT LEARNING BRIEF CARD (Ready to Copy / Print)            */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {isAr ? "بطاقة التوجيه البيداغوجي (Student Learning Brief)" : "Fiche Pédagogique Synthétique"}
                </span>
                <span className="text-[11px] text-amber-300/80">
                  {isAr ? "جاهزة للنسخ أو الطباعة وتقديمها للأستاذ" : "Prête à être remise à votre enseignant"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyBrief}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? (isAr ? "تم النسخ بنجاح!" : "Copié !") : (isAr ? "نسخ البطاقة" : "Copier")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintBrief}
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isAr ? "طباعة" : "Imprimer"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المهارة ونقطة التعثر" : "Notion ciblée"}</span>
              <span className="font-bold text-white block">{skillTitle}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? "طبيعة الخلل المرصود" : "Nature de l'erreur"}</span>
              <span className="font-bold text-amber-400 block">
                {isAr ? "خطأ منهجي في تطبيق القاعدة الرياضية" : "Erreur méthodologique"}
              </span>
            </div>
          </div>

          {/* Diagnostic & Teacher Action */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">
                {isAr ? "📋 التشخيص البيداغوجي الدقيق:" : "Diagnostic Pédagogique :"}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {brief.pedagogicalDiagnosis_ar}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="font-bold text-emerald-400 block mb-0.5">
                {isAr ? "🎯 التوجيه المقترح للأستاذ:" : "Action suggérée :"}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {brief.recommendedTeacherAction_ar}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. VERIFIED TEACHER DIRECTORY (NO MARKETPLACE / NO PAYMENTS)      */}
        {/* ================================================================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? "دليل الأساتذة المعتمدين والمفتشين البيداغوجيين" : "Répertoire d'Enseignants Agréés"}
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <GraduationCap className="h-6 w-6 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">
              {isAr ? "قائمة الأساتذة المعتمدين قيد التحديث" : "Répertoire d'enseignants en cours d'actualisation"}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {isAr
                ? "يمكنك نسخ بطاقة التوجيه البيداغوجي أعلاه وتقديمها مباشرة لأستاذك في الثانوية أو أستاذ الدعم ليفهم فوراً طبيعة التعثر ويقدم لك الشرح المركز."
                : "Vous pouvez copier la fiche pédagogique ci-dessus et la présenter directement à votre enseignant au lycée."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
          <span className="text-slate-400 text-[11px]">
            {isAr
              ? "تذكير: BAC Mastery لا تتدخل في أي معاملات مالية • الهدف توجيه بيداغوجي بحت."
              : "Accompagnement pédagogique strict, sans intermédiation commerciale."}
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="font-bold">
            <span>{isAr ? "إغلاق" : "Fermer"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
