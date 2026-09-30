"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DiwanTable } from "@/types/diwan";

interface SharedStudyCardProps {
  table: DiwanTable;
  onAskInChat?: (promptText: string) => void;
  className?: string;
}

export function SharedStudyCard({
  table,
  onAskInChat,
  className = "",
}: SharedStudyCardProps) {
  const [copied, setCopied] = useState(false);
  const [showFullFormulas, setShowFullFormulas] = useState(false);

  // Subject-specific study assets mapped to Algerian BAC topics
  const studyMaterials: Record<
    string,
    {
      curriculumUrl: string;
      exerciseTitle: string;
      exerciseText: string;
      keyFormulas: { label: string; formula: string }[];
    }
  > = {
    math: {
      curriculumUrl: "/curriculum?subject=math",
      exerciseTitle: "تمرين مقترح: المتتاليات التراجعية والتقارب (BAC)",
      exerciseText:
        "لتكن المتتالية (uₙ) المعرفة بـ u₀ = 1 و uₙ₊₁ = (1/2)uₙ + 1.\n1. برهن بالتراجع أن: uₙ < 2 لكل n ∈ ℕ.\n2. ادرس رتابة (uₙ) واستنتج أنها متقاربة.\n3. نضع vₙ = uₙ - 2؛ بيّن أن (vₙ) هندسية واحسب نهايتها.",
      keyFormulas: [
        { label: "المتتالية الحسابية", formula: "uₙ = uₚ + (n - p)·r" },
        { label: "مجموع حسابية", formula: "Sₙ = (الحدود/2) · (الأول + الأخير)" },
        { label: "المتتالية الهندسية", formula: "uₙ = uₚ · q⁽ⁿ⁻ᵖ⁾" },
        { label: "مجموع هندسية", formula: "Sₙ = الأول · (1 - qⁿ) / (1 - q)" },
      ],
    },
    physics: {
      curriculumUrl: "/curriculum?subject=physics",
      exerciseTitle: "مسألة بكالوريا: ثنائي القطب RC وتطور التوتر",
      exerciseText:
        "نربط مكثفة سعتها C بناقل أومي مقاومته R ومولد ذي توتر E.\n1. جد المعادلة التفاضلية الحاكمة للتوتر u_C(t).\n2. بيّن أن الحل من الشكل: u_C(t) = E(1 - e⁻ᵗ/ᵀ).\n3. احسب قيمة ثابت الزمن τ وحدد وحدة قياسه بالتحليل البعدي.",
      keyFormulas: [
        { label: "قانون أوم", formula: "u_R = R · i" },
        { label: "شحنة المكثفة", formula: "q(t) = C · u_C(t)" },
        { label: "ثابت الزمن RC", formula: "τ = R · C  [s]" },
        { label: "الطاقة المخزنة", formula: "E_c = (1/2) · C · u_C²" },
      ],
    },
    sciences: {
      curriculumUrl: "/curriculum?subject=sciences",
      exerciseTitle: "مهمة مركبة: الاستنساخ والترجمة وتثبيط الإنزيم",
      exerciseText:
        "باستغلال الوثائق ومكتسباتك القبلية:\n1. وضّح برسم تخطيطي وظيفي مراحل التعبير المورثي من النواة إلى الهيولى.\n2. فسّر آلية تأثير مادة الـ α-أمانيتين المثبطة لإنزيم ARN بوليميراز.",
      keyFormulas: [
        { label: "مقر الاستنساخ", formula: "النواة (ARN بوليميراز)" },
        { label: "شفرة البداية", formula: "AUG (ميثيونين)" },
        { label: "شفرات التوقف", formula: "UAA, UAG, UGA" },
        { label: "الرابطة الببتيدية", formula: "تفاعل تكاثف بين COOH و NH₂" },
      ],
    },
    philosophy: {
      curriculumUrl: "/curriculum?subject=philosophy",
      exerciseTitle: "مقالة مقارنة: هل التمايز بين العلم والفلسفة قطعي؟",
      exerciseText:
        "قارن بين المشكلة الفلسفية والإشكالية العلمية مبرزاً:\n- أوجه الاختلاف (الموضوع، المنهج، الهدف).\n- أوجه الاتفاق والتشابه.\n- مواطن التداخل والتكامل الوظيفي بينهما.",
      keyFormulas: [
        { label: "منهج الفلسفة", formula: "تأملي عقلي نقدي (استبطاني)" },
        { label: "منهج العلم", formula: "تجريبي استقرائي (ملاحظة + فرضية)" },
        { label: "طبيعة السؤال", formula: "الفلسفة: لماذا؟ | العلم: كيف؟" },
      ],
    },
  };

  const material = studyMaterials[table.subject] || {
    curriculumUrl: `/curriculum?subject=${table.subject}`,
    exerciseTitle: `تمرين مقترح في: ${table.topic}`,
    exerciseText: `حل مسألة نموذجية في مادة ${table.subject} تدور حول ${table.topic}. ركّز على المنهجية الوزارية وخطوات البرهان المعتمدة.`,
    keyFormulas: [
      { label: "المفهوم الأساسي", formula: table.topic },
      { label: "المرجع الرسمي", formula: "المنهاج الوزاري للبكالوريا الجزائرية" },
    ],
  };

  const handleCopyExercise = () => {
    navigator.clipboard.writeText(`${material.exerciseTitle}\n\n${material.exerciseText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (onAskInChat) {
      onAskInChat(`تمرين للمراجعة: ${material.exerciseTitle}\n${material.exerciseText}`);
    }
  };

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#0B1222]/95 p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-4 text-right ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>واش نراجعو في هذا المجلس؟</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                مرجع موحد
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
              {table.topic}
            </p>
          </div>
        </div>

        {/* Link to Curriculum */}
        <Link
          href={material.curriculumUrl}
          target="_blank"
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-blue-400 hover:text-blue-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <span>تصفح المنهاج</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Suggested BAC Exercise Card */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{material.exerciseTitle}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyExercise}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
              title="نسخ نص التمرين"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "تم النسخ" : "نسخ"}</span>
            </button>

            {onAskInChat && (
              <button
                type="button"
                onClick={handleSendToChat}
                className="p-1.5 px-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="إرسال التمرين للمحادثة"
              >
                <HelpCircle className="w-3 h-3" />
                <span>شارك في الشات</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-xl border border-white/5 font-sans">
          {material.exerciseText}
        </p>
      </div>

      {/* Key Formulas & Cheat Sheet */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowFullFormulas(!showFullFormulas)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>ملخص القوانين والمفاتيح السريعة ({material.keyFormulas.length})</span>
          </span>
          {showFullFormulas ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showFullFormulas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-in fade-in">
            {material.keyFormulas.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-0.5"
              >
                <span className="text-[10px] text-slate-400">{item.label}</span>
                <span className="text-xs font-mono font-bold text-emerald-300 dir-ltr text-right">
                  {item.formula}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
