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
    <div className="w-full rounded-3xl bg-white border border-[#E4DED2] p-4 sm:p-6 shadow-card relative overflow-hidden" dir="rtl">
      {/* Decorative Subtle Brand Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#5F8F86]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D7A66A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E4DED2] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#DCE9E4] text-[#385853] flex items-center justify-center border border-[#5F8F86]/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#0F172A]">معاينة فورية: «واش نقدر نقرا؟»</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F2EB] text-[#245431] text-[10px] font-bold border border-[#6E9B7B]/30">
                بدون تسجيل
              </span>
            </div>
            <p className="text-[11px] text-[#475569]">مبني على المنشور الوزاري الرسمي 2026/2027</p>
          </div>
        </div>

        <Link
          href={`/orientation?stream=${selectedStream}&avg=${bacAverage}`}
          className="text-[11px] font-bold text-[#5F8F86] hover:text-[#527D75] transition-colors flex items-center gap-1 shrink-0"
        >
          <span>المستكشف الكامل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. Stream Selector */}
      <div className="pt-3.5 space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
          <span>1. اختر شعبتك:</span>
          <span className="text-[11px] text-[#5F8F86] font-black">{STREAMS_CONFIG[selectedStream].nameAr}</span>
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
                      ? "bg-[#5F8F86] text-white border-[#5F8F86] shadow-sm scale-[1.02]"
                      : "bg-[#F7F3EA] text-[#334155] border-[#E4DED2] hover:bg-[#EFE9DC] hover:text-[#0F172A]"
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
        <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
          <span>2. أدخل معدل البكالوريا التقديري:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black font-mono text-[#5F8F86]">{bacAverage.toFixed(2)}</span>
            <span className="text-[11px] text-[#475569]">/ 20</span>
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
          className="w-full accent-[#5F8F86] h-2 bg-[#EFE9DC] rounded-lg cursor-pointer"
        />

        {/* Quick Average Presets */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-[#475569]">معدلات سريعة:</span>
          <div className="flex items-center gap-1.5">
            {[12.0, 14.0, 15.5, 17.0].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAverageChange(preset)}
                className={`px-2 py-0.5 rounded-md font-mono font-bold transition-all text-xs border ${
                  Math.abs(bacAverage - preset) < 0.05
                    ? "bg-[#5F8F86] text-white border-[#5F8F86] shadow-sm"
                    : "bg-[#F7F3EA] text-[#475569] border-[#E4DED2] hover:bg-[#EFE9DC] hover:text-[#0F172A]"
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
        <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
          <span>3. التخصصات الأبرز بالمعادلة الوزارية:</span>
          <span className="text-[10px] text-[#385853] font-bold flex items-center gap-1 bg-[#DCE9E4] px-2 py-0.5 rounded-full border border-[#5F8F86]/30">
            <Sparkles className="w-3 h-3 text-[#5F8F86]" />
            <span>مطابق للمنشور الوزاري</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {specialties.map((spec, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-[#E4DED2] hover:border-[#5F8F86] hover:bg-white transition-all flex items-center justify-between gap-3 text-right"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{spec.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-[#0F172A] truncate">{spec.nameAr}</h4>
                    {spec.badge === "ELIGIBLE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2EB] text-[#245431] border border-[#6E9B7B]/30">
                        مؤهل للتسجيل ✅
                      </span>
                    )}
                    {spec.badge === "COMPETITIVE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F9EFE2] text-[#8C5D23] border border-[#D7A66A]/40">
                        تنافسي ⚡
                      </span>
                    )}
                    {spec.badge === "BORDERLINE" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1EFEA] text-[#554E45] border border-[#D8D0C3]">
                        يتطلب رفع المعدل 🔒
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#475569] flex items-center gap-2 pt-0.5">
                    <span>{spec.category}</span>
                    <span>•</span>
                    <span className="font-mono text-[#385853] font-bold">
                      المعدل الموزون: {spec.weightedScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-[10px] text-[#475569] font-mono block hidden sm:block">
                  {spec.formulaAr}
                </span>
                <span className="text-[10px] font-bold text-[#8C5D23] block">
                  {spec.thresholdNote}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions inside Widget */}
      <div className="mt-3.5 pt-3.5 border-t border-[#E4DED2] flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10">
        <Link
          href={`/orientation?stream=${selectedStream}&avg=${bacAverage}`}
          className="w-full sm:w-auto"
        >
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F7F3EA] hover:bg-[#EFE9DC] text-[#385853] border border-[#5F8F86]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#5F8F86]" />
            <span>عرض كل التخصصات في المستكشف الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </Link>

        <Link href="/auth/register" className="w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#5F8F86] hover:bg-[#527D75] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ابدأ مجاناً</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
