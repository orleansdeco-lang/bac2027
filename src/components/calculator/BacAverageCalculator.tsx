"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

export interface SubjectRule {
  id: string;
  name: string;
  coeff: number;
  placeholderScore?: number;
}

export const STREAM_DEFINITIONS: Record<
  string,
  {
    name: string;
    badge: string;
    subjects: SubjectRule[];
  }
> = {
  sciences: {
    name: "علوم تجريبية (Sciences Expérimentales)",
    badge: "علوم تجريبية",
    subjects: [
      { id: "snv", name: "علوم الطبيعة والحياة", coeff: 6 },
      { id: "phys", name: "العلوم الفيزيائية", coeff: 5 },
      { id: "math", name: "الرياضيات", coeff: 5 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 3 },
      { id: "philo", name: "الفلسفة", coeff: 2 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 2 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 2 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
  math: {
    name: "رياضيات (Mathématiques)",
    badge: "رياضيات",
    subjects: [
      { id: "math", name: "الرياضيات", coeff: 7 },
      { id: "phys", name: "العلوم الفيزيائية", coeff: 6 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 3 },
      { id: "snv", name: "علوم الطبيعة والحياة", coeff: 2 },
      { id: "philo", name: "الفلسفة", coeff: 2 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 2 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 2 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
  technique: {
    name: "تقني رياضي (Technique Mathématiques)",
    badge: "تقني رياضي",
    subjects: [
      { id: "tech", name: "التكنولوجيا (الهندسة التخصصية)", coeff: 6 },
      { id: "math", name: "الرياضيات", coeff: 6 },
      { id: "phys", name: "العلوم الفيزيائية", coeff: 6 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 3 },
      { id: "philo", name: "الفلسفة", coeff: 2 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 2 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 2 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
  gestion: {
    name: "تسيير واقتصاد (Gestion et Économie)",
    badge: "تسيير واقتصاد",
    subjects: [
      { id: "compta", name: "التسيير المحاسبي والمالي", coeff: 6 },
      { id: "eco", name: "الاقتصاد والمناجمنت", coeff: 5 },
      { id: "math", name: "الرياضيات", coeff: 5 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 4 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 3 },
      { id: "droit", name: "القانون", coeff: 2 },
      { id: "philo", name: "الفلسفة", coeff: 2 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 2 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
  lettres: {
    name: "آداب وفلسفة (Lettres et Philosophie)",
    badge: "آداب وفلسفة",
    subjects: [
      { id: "philo", name: "الفلسفة", coeff: 6 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 6 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 4 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 3 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 3 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "math", name: "الرياضيات", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
  langues: {
    name: "لغات أجنبية (Langues Étrangères)",
    badge: "لغات أجنبية",
    subjects: [
      { id: "l3", name: "اللغة الأجنبية الثالثة (إسبانية/ألمانية/إيطالية)", coeff: 5 },
      { id: "fr", name: "اللغة الفرنسية", coeff: 5 },
      { id: "en", name: "اللغة الإنجليزية", coeff: 5 },
      { id: "ar", name: "اللغة العربية وآدابها", coeff: 5 },
      { id: "hist_geo", name: "التاريخ والجغرافيا", coeff: 2 },
      { id: "philo", name: "الفلسفة", coeff: 2 },
      { id: "islamic", name: "العلوم الإسلامية", coeff: 2 },
      { id: "math", name: "الرياضيات", coeff: 2 },
      { id: "sport", name: "التربية البدنية (اختياري)", coeff: 1 },
    ],
  },
};

export function BacAverageCalculator() {
  const [streamKey, setStreamKey] = useState<string>("sciences");
  const [scores, setScores] = useState<Record<string, string>>({
    snv: "15",
    phys: "14",
    math: "14.5",
    ar: "13",
    philo: "12",
    hist_geo: "15",
    islamic: "17",
    fr: "14",
    en: "16",
    sport: "18",
  });

  const currentStream = STREAM_DEFINITIONS[streamKey] || STREAM_DEFINITIONS.sciences;

  const handleScoreChange = (id: string, value: string) => {
    if (value === "") {
      setScores((prev) => ({ ...prev, [id]: "" }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 20) {
      setScores((prev) => ({ ...prev, [id]: value }));
    }
  };

  const resetScores = () => {
    const empty: Record<string, string> = {};
    currentStream.subjects.forEach((s) => {
      empty[s.id] = "";
    });
    setScores(empty);
  };

  const { totalPoints, totalCoeffs, average } = useMemo(() => {
    let pts = 0;
    let coeffs = 0;

    currentStream.subjects.forEach((subj) => {
      const val = parseFloat(scores[subj.id] || "0");
      pts += (isNaN(val) ? 0 : val) * subj.coeff;
      coeffs += subj.coeff;
    });

    const avg = coeffs > 0 ? pts / coeffs : 0;
    return {
      totalPoints: pts,
      totalCoeffs: coeffs,
      average: avg,
    };
  }, [currentStream, scores]);

  const getMention = (avg: number) => {
    if (avg >= 18) return { label: "ممتاز (Excellent)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (avg >= 16) return { label: "جيد جداً (Très Bien)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (avg >= 14) return { label: "جيد (Bien)", color: "text-[#2C5E54] bg-[#2C5E54]/10 border-[#2C5E54]/20" };
    if (avg >= 12) return { label: "قريب من الجيد (Assez Bien)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (avg >= 10) return { label: "مقبول (Passable)", color: "text-slate-700 bg-slate-100 border-slate-200" };
    return { label: "راسب (Ajourné)", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const mention = getMention(average);

  const getOpportunities = (avg: number, stKey: string) => {
    const opps: { title: string; category: string; badge: string }[] = [];

    if (avg >= 16.5) {
      if (stKey === "sciences" || stKey === "math") {
        opps.push({ title: "كليات الطب، الصيدلة، وطب الأسنان", category: "علوم طبية", badge: "فرصة تنافسية قوية" });
      }
      opps.push({ title: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)", category: "مدارس النخبة", badge: "تنافسي (موزون)" });
      opps.push({ title: "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)", category: "تكنولوجيا", badge: "تنافسي (موزون)" });
    }

    if (avg >= 14.5) {
      opps.push({ title: "المدارس العليا للأساتذة (ENS)", category: "تكوين أساتذة", badge: "مؤهل للترشح (مقابلة)" });
      opps.push({ title: "المدرسة الوطنية العليا للبيوتكنولوجيا (ENSB)", category: "بيولوجيا متقدمة", badge: "مؤهل للترشح" });
      if (stKey === "gestion") {
        opps.push({ title: "المدرسة العليا للتجارة والمصارف (ESC / EHEC)", category: "مالية وأعمال", badge: "فرصة تنافسية" });
      }
      if (stKey === "technique" || stKey === "math") {
        opps.push({ title: "المدرسة المتعددة التقنيات (ENP Polytech)", category: "هندسة دولة", badge: "فرصة تنافسية" });
      }
      if (stKey === "lettres" || stKey === "langues") {
        opps.push({ title: "المعهد العالي للترجمة ومدارس العلوم السياسية", category: "لغات وعلاقات", badge: "فرصة تنافسية" });
      }
    }

    if (avg >= 12.0) {
      opps.push({ title: "الهندسة المعمارية والعمران (Architecture)", category: "هندسة معمارية", badge: "مؤهل للترشح" });
      opps.push({ title: "علوم المادة والرياضيات والإعلام الآلي (MI / SM)", category: "جامعي", badge: "مؤهل للترشح" });
      opps.push({ title: "كليات الحقوق والعلوم الاقتصادية", category: "علوم إدارية", badge: "مؤهل للترشح" });
      opps.push({ title: "بيولوجيا وعلوم الأرض (SNV)", category: "علوم طبيعية", badge: "مؤهل للترشح" });
    }

    if (avg >= 10.0 && opps.length === 0) {
      opps.push({ title: "العلوم والتكنولوجيا (ST)", category: "جامعي", badge: "مؤهل للترشح" });
      opps.push({ title: "الآداب واللغات الأجنبية والعلوم الإنسانية", category: "جامعي", badge: "مؤهل للترشح" });
    }

    return opps;
  };

  const opportunities = getOpportunities(average, streamKey);

  return (
    <div className="space-y-6">
      {/* Stream Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-theme-text">اختر الشعبة:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-theme">
          {Object.entries(STREAM_DEFINITIONS).map(([k, def]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStreamKey(k)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                streamKey === k
                  ? "bg-[#0F766E] text-white shadow-xs"
                  : "text-theme-text hover:bg-white/80 dark:hover:bg-stone-700"
              }`}
            >
              {def.badge}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Grade Inputs */}
        <div className="lg:col-span-7 bg-card p-4 sm:p-5 rounded-3xl border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-theme/60 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-theme-text font-serif">نقاط المواد (على 20)</h2>
              <p className="text-[11px] text-theme-muted">المعاملات الرسمية معتمدة آلياً حسب الشعبة</p>
            </div>
            <button
              type="button"
              onClick={resetScores}
              className="inline-flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text transition-colors font-semibold p-1 rounded-lg hover:bg-card-hover"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentStream.subjects.map((subj) => {
              const isKey = subj.coeff >= 5;
              const score = scores[subj.id] || "";
              return (
                <div
                  key={subj.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    isKey ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/40" : "bg-surface-soft border-theme"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-text truncate">{subj.name}</span>
                      {isKey && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#0F766E] text-white font-bold shrink-0">
                          أساسية
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-theme-muted font-mono block">
                      المعامل: <strong className="text-theme-text">{subj.coeff}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      placeholder="00"
                      value={score}
                      onChange={(e) => handleScoreChange(subj.id, e.target.value)}
                      className="w-16 h-8 text-center font-mono font-bold text-xs bg-card border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-theme-text"
                    />
                    <span className="text-[10px] text-theme-muted">/20</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Instant Results Card */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-850 to-emerald-900 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>النتيجة التقديرية</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                {mention.label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-emerald-200/80 font-medium">المعدل العام التقديري للبكالوريا:</div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                {average.toFixed(2)}
                <span className="text-xs text-emerald-300 font-sans mr-2 font-bold">/ 20</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-center">
                <span className="text-[10px] text-emerald-200 block">مجموع النقاط</span>
                <span className="text-base font-black text-white font-mono">
                  {totalPoints.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-center">
                <span className="text-[10px] text-emerald-200 block">مجموع المعاملات</span>
                <span className="text-base font-black text-white font-mono">
                  {totalCoeffs}
                </span>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-2 pt-2 border-t border-white/15">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
                <GraduationCap className="w-4 h-4 text-emerald-300" />
                <span>أفق التوجيه والفرص بمعدل ({average.toFixed(2)}):</span>
              </div>

              {opportunities.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {opportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{opp.title}</div>
                        <div className="text-[10px] text-emerald-200/80 font-medium">{opp.category}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                        {opp.badge}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-100/80 font-medium leading-relaxed">
                  ضع نقاطك لاكتشاف التخصصات الجامعية والمدارس العليا التي تتطابق مع مستواك.
                </p>
              )}

              {/* Legal Disclaimer Note */}
              <p className="text-[10px] text-slate-500 leading-tight">
                * ملاحظة رسمية: هذه النتائج استرشادية بحسب معدلات الدفعات السابقة. القبول النهائي يخضع لمعايير الترتيب التنافسي للدفعة الحالية.
              </p>
            </div>

            {/* Direct Link to Official Orientation Subsystem */}
            <div className="pt-2 space-y-2">
              <Link
                href="/orientation"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <span>مستكشف التوجيه الجامعي الرسمي (حساب المعدل الموزون)</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/register"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#2C5E54]/20 hover:bg-[#2C5E54]/30 text-[#2C5E54] dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer border border-[#2C5E54]/30"
              >
                <span>أريد رفع معدلي — ابدأ التشخيص مع الشاطر</span>
              </Link>
            </div>
          </div>

          {/* Strategic Advice Card */}
          <div className="p-5 rounded-3xl bg-card border border-theme space-y-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2C5E54] dark:text-emerald-400" />
              <span>كيف ترفع معدلك بنقطتين إضافيتين؟</span>
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              في شهادة البكالوريا، رفع علامة مادة أساسية ذات معامل 6 بمقدار نقطتين فقط يمنحك 12 نقطة إضافية في رصيدك الكلي! احرص دائماً على سد الثغرات في المواد ذات المعاملات المرتفعة أولاً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
