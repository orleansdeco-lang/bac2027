"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Sparkles, Compass } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export type HeroStreamId = "sciences_exp" | "math" | "technique_math" | "gestion_eco" | "lettres_philo" | "langues";

interface SpecialtyPreview {
  nameAr: string;
  category: string;
  badge: "ELIGIBLE" | "COMPETITIVE" | "BORDERLINE";
  formulaAr: string;
  weightedScore: number;
  thresholdNote: string;
  icon: string;
}

const STREAMS_CONFIG: Record<HeroStreamId, { nameAr: string; shortName: string; defaultAvg: number; keySubjectName: string }> = {
  sciences_exp: { nameAr: "علوم تجريبية", shortName: "علوم", defaultAvg: 15.5, keySubjectName: "علوم الطبيعة والحياة" },
  math: { nameAr: "رياضيات", shortName: "رياضيات", defaultAvg: 16.0, keySubjectName: "الرياضيات" },
  technique_math: { nameAr: "تقني رياضي", shortName: "تقني", defaultAvg: 15.0, keySubjectName: "التكنولوجيا (الهندسة)" },
  gestion_eco: { nameAr: "تسيير واقتصاد", shortName: "تسيير", defaultAvg: 14.0, keySubjectName: "الاقتصاد / المحاسبة" },
  lettres_philo: { nameAr: "آداب وفلسفة", shortName: "فلسفة", defaultAvg: 13.5, keySubjectName: "الأدب العربي / الفلسفة" },
  langues: { nameAr: "لغات أجنبية", shortName: "لغات", defaultAvg: 14.0, keySubjectName: "اللغة الأجنبية (1/2/3)" },
};

export function HeroInteractiveOrientation() {
  const [selectedStream, setSelectedStream] = useState<HeroStreamId>("sciences_exp");
  const [bacAverage, setBacAverage] = useState<number>(15.5);

  const handleAverageChange = (val: number) => {
    const clamped = Math.min(20, Math.max(10, Math.round(val * 100) / 100));
    setBacAverage(clamped);
    trackEvent("try_orientation_demo", {
      streamId: selectedStream,
      generalAverage: clamped,
    });
  };

  // Exact MESRS formula calculation strictly matching /orientation engine
  const specialties = useMemo<SpecialtyPreview[]>(() => {
    const avg = bacAverage;
    // In MESRS engine, when specific subject grade is unentered, weighted average equals general average:
    // ((2 * avg) + avg) / 3 = avg
    const weightedScore = Number(avg.toFixed(2));

    if (selectedStream === "sciences_exp") {
      return [
        {
          nameAr: "العلوم الطبية (طب بشري)",
          category: "كليات الطب والصيدلة",
          badge: avg >= 16.0 ? "ELIGIBLE" : avg >= 15.0 ? "COMPETITIVE" : "BORDERLINE",
          formulaAr: "((2 × معدل الباك) + العلوم) ÷ 3",
          weightedScore,
          thresholdNote: avg >= 15.0 ? "مستوفٍ لشرط الترشح الأولي (15.00)" : "يتطلب 15.00 كحد أدنى للمشاركة",
          icon: "🩺",
        },
        {
          nameAr: "المدرسة العليا للذكاء الاصطناعي (ENSIA)",
          category: "المدارس الوطنية العليا - سيدي عبد الله",
          badge: avg >= 16.5 ? "ELIGIBLE" : avg >= 15.5 ? "COMPETITIVE" : "BORDERLINE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: avg >= 16.0 ? "مؤهل للتسجيل بالترتيب الوطني" : "يخضع للترتيب الوطني حسب المقاعد",
          icon: "🤖",
        },
        {
          nameAr: "المدرسة الوطنية العليا للإعلام الآلي (ESI)",
          category: "إعلام آلي وهندسة البرمجيات",
          badge: avg >= 16.8 ? "ELIGIBLE" : avg >= 16.0 ? "COMPETITIVE" : "BORDERLINE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "الترتيب حسب المقاعد المتاحة",
          icon: "💻",
        },
      ];
    }

    if (selectedStream === "math") {
      return [
        {
          nameAr: "الذكاء الاصطناعي والإعلام الآلي (ENSIA / ESI)",
          category: "الأولوية الأولى وطنيا لشعبة الرياضيات 🥇",
          badge: avg >= 16.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "أولوية أولى مباشرة لشعبة الرياضيات",
          icon: "🤖",
        },
        {
          nameAr: "المدرسة الوطنية متعددة التقنيات (Polytechnique)",
          category: "أقسام تحضيرية كبرى في العلوم والتكنولوجيا",
          badge: avg >= 15.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "مؤهل للأقسام التحضيرية",
          icon: "📐",
        },
        {
          nameAr: "العلوم الطبية (طب بشري)",
          category: "كليات الطب والصيدلة",
          badge: avg >= 15.5 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + العلوم) ÷ 3",
          weightedScore,
          thresholdNote: "مستوفٍ للحد الأدنى للمشاركة في الترتيب",
          icon: "🩺",
        },
      ];
    }

    if (selectedStream === "technique_math") {
      return [
        {
          nameAr: "المدرسة العليا للإعلام الآلي والذكاء الاصطناعي",
          category: "حصة مخصصة لتقني رياضي",
          badge: avg >= 15.5 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "أولوية مباشرة لطلاب التقني الرياضي",
          icon: "💻",
        },
        {
          nameAr: "المدارس العليا للتكنولوجيا والهندسة التطبيقية",
          category: "هندسة ميكانيكية، مدنية، كهربائية، طرائق",
          badge: avg >= 14.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + مادة التخصص) ÷ 3",
          weightedScore,
          thresholdNote: "مؤهل مباشر للأقسام التحضيرية",
          icon: "⚙️",
        },
        {
          nameAr: "الهندسة المعمارية والعمران (Architecture)",
          category: "كليات الهندسة والمدارس الوطنية",
          badge: avg >= 13.5 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "معدل البكالوريا العام (المنشور الوزاري)",
          weightedScore,
          thresholdNote: "مؤهل للتسجيل التنافسي",
          icon: "🏛️",
        },
      ];
    }

    if (selectedStream === "gestion_eco") {
      return [
        {
          nameAr: "المدرسة العليا للدراسات التجارية (HEC / ESC)",
          category: "مدارس التسيير والتجارة الكبرى",
          badge: avg >= 14.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + المحاسبة/الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "الأولوية الأولى لشعبة التسيير والاقتصاد",
          icon: "📊",
        },
        {
          nameAr: "المدرسة العليا للإحصاء والاقتصاد التطبيقي (ENSSEA)",
          category: "المدارس الوطنية - القليعة",
          badge: avg >= 13.5 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + الرياضيات) ÷ 3",
          weightedScore,
          thresholdNote: "أقسام تحضيرية للاقتصاد الكمي",
          icon: "📈",
        },
        {
          nameAr: "العلوم الاقتصادية والتجارية والتسيير (SEGC)",
          category: "جامعات الجزائر",
          badge: avg >= 11.0 ? "ELIGIBLE" : "BORDERLINE",
          formulaAr: "معدل البكالوريا العام",
          weightedScore,
          thresholdNote: "مؤهل للتسجيل المباشر",
          icon: "💼",
        },
      ];
    }

    if (selectedStream === "lettres_philo") {
      return [
        {
          nameAr: "المدرسة العليا للأساتذة (ENS فلسفة / أدب عربي)",
          category: "تكوين أساتذة التعليم الثانوي والمتوسط",
          badge: avg >= 14.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "((2 × معدل الباك) + الأدب/الفلسفة) ÷ 3",
          weightedScore,
          thresholdNote: "منصب عمل مضمون في قطاع التربية",
          icon: "📜",
        },
        {
          nameAr: "الحقوق والعلوم السياسية (Droit)",
          category: "كليات الحقوق الوطنية",
          badge: avg >= 11.5 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "معدل البكالوريا العام",
          weightedScore,
          thresholdNote: "متاح ومؤهل بجميع جامعات الوطن",
          icon: "⚖️",
        },
        {
          nameAr: "علوم الإعلام والاتصال والصحافة",
          category: "كليات الإعلام والعلوم الإنسانية",
          badge: avg >= 12.0 ? "ELIGIBLE" : "COMPETITIVE",
          formulaAr: "معدل البكالوريا العام",
          weightedScore,
          thresholdNote: "مؤهل للتسجيل التنافسي",
          icon: "🎙️",
        },
      ];
    }

    // Default: Langues
    return [
      {
        nameAr: "المدرسة العليا للأساتذة (ENS لغات أجنبية)",
        category: "تكوين أساتذة الإنجليزية والفرنسية",
        badge: avg >= 14.5 ? "ELIGIBLE" : "COMPETITIVE",
        formulaAr: "((2 × معدل الباك) + لغة التخصص) ÷ 3",
        weightedScore,
        thresholdNote: "الأولوية الأولى لشعبة اللغات الأجنبية",
        icon: "🌍",
      },
      {
        nameAr: "الترجمة الفورية والتحريرية (Traduction)",
        category: "معاهد الترجمة الكبرى",
        badge: avg >= 13.5 ? "ELIGIBLE" : "COMPETITIVE",
        formulaAr: "((2 × معدل الباك) + معدل اللغات) ÷ 3",
        weightedScore,
        thresholdNote: "مؤهل للتسجيل التنافسي",
        icon: "🗣️",
      },
      {
        nameAr: "الأدب الإنجليزي واللغات الأجنبية المطبقة",
        category: "كليات الآداب واللغات",
        badge: avg >= 11.5 ? "ELIGIBLE" : "BORDERLINE",
        formulaAr: "معدل البكالوريا العام",
        weightedScore,
        thresholdNote: "مؤهل للتسجيل المباشر",
        icon: "📚",
      },
    ];
  }, [selectedStream, bacAverage]);

  return (
    <div className="w-full rounded-3xl bg-[#0B1222] border border-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden" dir="rtl">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">معاينة فورية: «واش نقدر نقرا؟»</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                بدون حساب
              </span>
            </div>
            <p className="text-[11px] text-slate-400">مبني على المنشور الوزاري الرسمي 2026/2027</p>
          </div>
        </div>

        <Link
          href={`/orientation?stream=${selectedStream}&avg=${bacAverage}`}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>المستكشف الكامل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. Stream Selector */}
      <div className="pt-3.5 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>1. اختر شعبتك:</span>
          <span className="text-[11px] text-amber-400">{STREAMS_CONFIG[selectedStream].nameAr}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {(Object.entries(STREAMS_CONFIG) as [HeroStreamId, { nameAr: string; shortName: string }][]).map(
            ([streamId, meta]) => {
              const isSelected = selectedStream === streamId;
              return (
                <button
                  key={streamId}
                  type="button"
                  onClick={() => {
                    setSelectedStream(streamId);
                    trackEvent("orientation_stream_selected", { streamId });
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20 scale-[1.02]"
                      : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {meta.shortName}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 2. Bac Average Slider & Input */}
      <div className="pt-3.5 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>2. أدخل معدل البكالوريا التقديري:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black font-mono text-emerald-400">{bacAverage.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">/ 20</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="10"
          max="19.5"
          step="0.1"
          value={bacAverage}
          onChange={(e) => handleAverageChange(parseFloat(e.target.value))}
          className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* Quick Average Presets */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-slate-400">معدلات سريعة:</span>
          <div className="flex items-center gap-1.5">
            {[12.0, 14.0, 15.5, 17.0].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAverageChange(preset)}
                className={`px-2 py-0.5 rounded-md font-mono font-bold transition-all ${
                  Math.abs(bacAverage - preset) < 0.05
                    ? "bg-emerald-500 text-white"
                    : "bg-white/[0.05] text-slate-400 hover:text-white"
                }`}
              >
                {preset.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live 3 Eligible Specialties Cards */}
      <div className="pt-3.5 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>3. التخصصات الأبرز بالمعادلة الوزارية:</span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>مطابق لـ /orientation</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {specialties.map((spec, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between gap-3 text-right"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{spec.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">{spec.nameAr}</h4>
                    {spec.badge === "ELIGIBLE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        مؤهل للتسجيل ✅
                      </span>
                    )}
                    {spec.badge === "COMPETITIVE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        تنافسي ⚡
                      </span>
                    )}
                    {spec.badge === "BORDERLINE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        يتطلب رفع المعدل 🔒
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>{spec.category}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      المعدل الموزون: {spec.weightedScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-[10px] text-slate-400 font-mono block hidden sm:block">
                  {spec.formulaAr}
                </span>
                <span className="text-[10px] font-bold text-amber-300 block">
                  {spec.thresholdNote}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions inside Widget */}
      <div className="mt-3.5 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10">
        <Link
          href={`/orientation?stream=${selectedStream}&avg=${bacAverage}`}
          className="w-full sm:w-auto"
        >
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>عرض كل التخصصات في المستكشف الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </Link>

        <Link href="/auth/register" className="w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ابدأ مجاناً</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
