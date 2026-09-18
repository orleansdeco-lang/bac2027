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

  // Generate Authoritative Zero-PII Student Learning Brief
  const brief = generateStudentLearningBrief({
    skillId,
    skillTitle_ar: skillTitle,
    skillTitle_fr: skillTitle,
    subjectId,
    streamId,
    currentMasteryStatus: "not_yet",
    totalAttempts: 4,
    consecutiveFailures: 2,
    practiceAccuracy: 0.25,
    recurringErrors: [
      {
        errorType,
        occurrenceCount: 2,
        sampleContext_ar: `خلل منهجي متكرر في استنتاج الحل النموذجي لـ [${skillTitle}]`,
      },
    ],
    repairAttemptsCount: 1,
    lastRepairStatus: "repair_completed",
    retestFailedCount,
    averageConfidence: 3.5,
    overconfidenceCount: 1,
    avgResponseSeconds: 95,
    expectedSeconds: 60,
    explanationsViewed: 2,
  });

  const qualifiedTeachers = [
    {
      id: "t-1",
      name_ar: "أ. رابح بن يحيى",
      name_fr: "Pr. R. Benyahia",
      wilaya_ar: "الجزائر العاصمة (القبة)",
      wilaya_fr: "Alger (Kouba)",
      wilayaCode: "16",
      subject_ar: "رياضيات",
      mode_ar: "حضوري + عن بعد",
      experience_ar: "18 سنة تدريس في الثانوي وتحضير البكالوريا",
      isVerified: true,
    },
    {
      id: "t-2",
      name_ar: "أ. سمير بلقاسم",
      name_fr: "Pr. S. Belkacem",
      wilaya_ar: "وهران (السانية)",
      wilaya_fr: "Oran (Es Senia)",
      wilayaCode: "31",
      subject_ar: "علوم فيزيائية",
      mode_ar: "عن بعد (حصص توجيهية)",
      experience_ar: "مفتش تربوي سابق • مؤلف مذكرات وزارية",
      isVerified: true,
    },
    {
      id: "t-3",
      name_ar: "أ. فتيحة بن منصور",
      name_fr: "Pr. F. Benmansour",
      wilaya_ar: "قسنطينة (المدينة الجديدة)",
      wilaya_fr: "Constantine (Ali Mendjeli)",
      wilayaCode: "25",
      subject_ar: "علوم الطبيعة والحياة",
      mode_ar: "حضوري + عن بعد",
      experience_ar: "15 سنة في تصحيح امتحانات البكالوريا الرسمية",
      isVerified: true,
    },
    {
      id: "t-4",
      name_ar: "أ. عبد القادر دريسي",
      name_fr: "Pr. A. Drissi",
      wilaya_ar: "سطيف (العلمة)",
      wilaya_fr: "Sétif (El Eulma)",
      wilayaCode: "19",
      subject_ar: "محاسبة وتسيير مالي",
      mode_ar: "حضوري وعن بعد",
      experience_ar: "أستاذ مبرز في التسيير والاقتصاد",
      isVerified: true,
    },
    {
      id: "t-5",
      name_ar: "أ. كمال عمور",
      name_fr: "Pr. K. Ammour",
      wilaya_ar: "باتنة",
      wilaya_fr: "Batna",
      wilayaCode: "05",
      subject_ar: "رياضيات وفلسفة",
      mode_ar: "عن بعد",
      experience_ar: "مرافقة منهجية لتلاميذ الأقسام النهائية",
      isVerified: true,
    },
  ];

  const filteredTeachers =
    selectedWilaya === "all"
      ? qualifiedTeachers
      : qualifiedTeachers.filter((t) => t.wilayaCode === selectedWilaya);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr ? "دليل الأساتذة المعتمدين والمفتشين البيداغوجيين" : "Répertoire d'Enseignants Agréés"}
              </h3>
            </div>

            {/* Wilaya Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">{isAr ? "الولاية:" : "Wilaya :"}</span>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{isAr ? "كل الولايات" : "Toutes"}</option>
                <option value="16">{isAr ? "الجزائر (16)" : "Alger (16)"}</option>
                <option value="31">{isAr ? "وهران (31)" : "Oran (31)"}</option>
                <option value="25">{isAr ? "قسنطينة (25)" : "Constantine (25)"}</option>
                <option value="19">{isAr ? "سطيف (19)" : "Sétif (19)"}</option>
                <option value="05">{isAr ? "باتنة (05)" : "Batna (05)"}</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isAr
              ? "أساتذة معتمدون في برنامج البكالوريا الجزائري يرحبون باستقبال بطاقات التوجيه البيداغوجي لتقديم شرح مركّز."
              : "Enseignants certifiés disponibles pour accompagner les élèves sur la base de la fiche diagnostic."}
          </p>

          {/* Teacher Cards */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {isAr ? teacher.name_ar : teacher.name_fr}
                    </span>
                    <Badge variant="primary" size="sm" className="text-[10px] py-0">
                      {isAr ? teacher.subject_ar : teacher.subject_ar}
                    </Badge>
                    <Badge variant="outline" size="sm" className="text-[10px] py-0 border-emerald-500/40 text-emerald-400">
                      {isAr ? "معتمد" : "Vérifié"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-400" />
                      <span>{isAr ? teacher.wilaya_ar : teacher.wilaya_fr}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{teacher.mode_ar}</span>
                    <span>•</span>
                    <span className="text-slate-400">{teacher.experience_ar}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBrief}
                  className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 shrink-0"
                >
                  <span>{isAr ? "تجهيز البطاقة للأستاذ" : "Préparer la fiche"}</span>
                </Button>
              </div>
            ))}
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
