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
        opps.push({ title: "كليات الطب، الصيدلة، وطب الأسنان", category: "علوم طبية", badge: "مضمون بنسبة عالية" });
      }
      opps.push({ title: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)", category: "مدارس النخبة", badge: "تنافسي" });
      opps.push({ title: "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)", category: "تكنولوجيا", badge: "متاح" });
    }

    if (avg >= 14.5) {
      opps.push({ title: "المدارس العليا للأساتذة (ENS)", category: "تكوين أساتذة", badge: "متاح" });
      opps.push({ title: "المدرسة الوطنية العليا للبيوتكنولوجيا (ENSB)", category: "بيولوجيا متقدمة", badge: "متاح" });
      if (stKey === "gestion") {
        opps.push({ title: "المدرسة العليا للتجارة والمصارف (ESC / EHEC)", category: "مالية وأعمال", badge: "متاح بقوة" });
      }
      if (stKey === "technique" || stKey === "math") {
        opps.push({ title: "المدرسة المتعددة التقنيات (ENP Polytech)", category: "هندسة دولة", badge: "متاح بقوة" });
      }
      if (stKey === "lettres" || stKey === "langues") {
        opps.push({ title: "المعهد العالي للترجمة ومدارس العلوم السياسية", category: "لغات وعلاقات", badge: "متاح بقوة" });
      }
    }

    if (avg >= 12.0) {
      opps.push({ title: "الهندسة المعمارية والعمران (Architecture)", category: "هندسة معمارية", badge: "متاح" });
      opps.push({ title: "علوم المادة والرياضيات والإعلام الآلي (MI / SM)", category: "جامعي", badge: "متاح" });
      opps.push({ title: "كليات الحقوق والعلوم الاقتصادية", category: "علوم إدارية", badge: "متاح" });
      opps.push({ title: "بيولوجيا وعلوم الأرض (SNV)", category: "علوم طبيعية", badge: "متاح" });
    }

    if (avg >= 10.0 && opps.length === 0) {
      opps.push({ title: "العلوم والتكنولوجيا (ST)", category: "جامعي", badge: "متاح" });
      opps.push({ title: "الآداب واللغات الأجنبية والعلوم الإنسانية", category: "جامعي", badge: "متاح" });
    }

    return opps;
  };

  const opportunities = getOpportunities(average, streamKey);

  return (
    <div className="space-y-6">
      {/* Stream Selector */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-theme-text">اختر الشعبة:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(STREAM_DEFINITIONS).map(([k, def]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStreamKey(k)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border text-center cursor-pointer ${
                streamKey === k
                  ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-sm"
                  : "bg-card text-theme-text border-theme hover:border-slate-400"
              }`}
            >
              {def.badge}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Grade Inputs */}
        <div className="lg:col-span-7 bg-card p-5 sm:p-7 rounded-3xl border border-theme shadow-clay space-y-5">
          <div className="flex items-center justify-between border-b border-theme/60 pb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-theme-text font-serif">نقاط المواد (على 20)</h2>
              <p className="text-xs text-theme-muted">أدخل العلامة بين 0 و 20 لكل مادة وفق المعاملات الرسمية</p>
            </div>
            <button
              type="button"
              onClick={resetScores}
              className="inline-flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text transition-colors font-semibold p-1.5 rounded-xl hover:bg-card-hover"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {currentStream.subjects.map((subj) => {
              const isKey = subj.coeff >= 5;
              const score = scores[subj.id] || "";
              return (
                <div
                  key={subj.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isKey ? "bg-[var(--color-primary-muted)]/20 border-[var(--color-primary)]/30" : "bg-surface-soft border-theme"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-theme-text">{subj.name}</span>
                      {isKey && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C5E54] text-white font-bold">
                          أساسية
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-theme-muted font-mono">
                      المعامل: <strong className="text-theme-text">{subj.coeff}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      placeholder="0.00"
                      value={score}
                      onChange={(e) => handleScoreChange(subj.id, e.target.value)}
                      className="w-20 text-center py-1.5 px-2 text-sm font-mono font-bold bg-card border border-theme rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5E54] text-theme-text"
                    />
                    <span className="text-xs text-theme-muted font-mono">/ 20</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Instant Results Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#EFE9DC] via-[#F7F3EA] to-[#FFFCF7] dark:from-[#1b2320] dark:via-[#19201d] dark:to-[#161a18] border border-[#E4DED2] dark:border-slate-800 shadow-clay space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C5E54] dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>النتيجة التقديرية</span>
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${mention.color}`}>
                {mention.label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">المعدل العام التقديري للبكالوريا:</div>
              <div className="text-5xl sm:text-6xl font-serif font-black text-[#1E3A34] dark:text-emerald-300 tracking-tight font-mono">
                {average.toFixed(2)}
                <span className="text-base text-slate-400 font-sans mr-2">/ 20</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4DED2] dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-card border border-[#E4DED2] dark:border-theme">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مجموع النقاط</span>
                <span className="text-xl font-black text-slate-800 dark:text-white font-mono">
                  {totalPoints.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-card border border-[#E4DED2] dark:border-theme">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مجموع المعاملات</span>
                <span className="text-xl font-black text-slate-800 dark:text-white font-mono">
                  {totalCoeffs}
                </span>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-3 pt-2 border-t border-[#E4DED2] dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <GraduationCap className="w-4 h-4 text-[#2C5E54] dark:text-emerald-400" />
                <span>أفق التوجيه والفرص المتاحة بمعدل ({average.toFixed(2)}):</span>
              </div>

              {opportunities.length > 0 ? (
                <div className="space-y-2">
                  {opportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white/90 dark:bg-card border border-[#E4DED2] dark:border-theme flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{opp.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{opp.category}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {opp.badge}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ضع نقاطك لاكتشاف التخصصات الجامعية والمدارس العليا التي تتطابق مع مستواك.
                </p>
              )}
            </div>

            {/* Call to action */}
            <div className="pt-2">
              <Link
                href="/auth/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <span>أريد رفع معدلي — ابدأ التشخيص مع الشاطر</span>
                <ArrowLeft className="w-4 h-4" />
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
