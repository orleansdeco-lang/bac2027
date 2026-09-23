"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  BookOpen,
} from "lucide-react";

interface SubjectRule {
  id: string;
  name: string;
  coeff: number;
  placeholderScore?: number;
}

const STREAM_DEFINITIONS: Record<
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

export function CalculatorClient() {
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
    // Allow empty string or numbers between 0 and 20
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

  // Calculation logic
  const { totalPoints, totalCoeffs, average, isComplete } = useMemo(() => {
    let pts = 0;
    let coeffs = 0;
    let complete = true;

    currentStream.subjects.forEach((subj) => {
      const val = parseFloat(scores[subj.id] || "0");
      if (scores[subj.id] === undefined || scores[subj.id] === "") {
        complete = false;
      }
      pts += (isNaN(val) ? 0 : val) * subj.coeff;
      coeffs += subj.coeff;
    });

    const avg = coeffs > 0 ? pts / coeffs : 0;
    return {
      totalPoints: pts,
      totalCoeffs: coeffs,
      average: avg,
      isComplete: complete,
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

  // Orientation opportunities based on current score
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
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-serif font-black text-2xl text-[#1E3A34]">
              الشاطر
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-[#2C5E54]">
              حاسبة معدل البكالوريا والتوجيه
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/scientific-calculator"
              className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <span>الآلة الحاسبة العلمية (Casio 3D)</span>
              <span>🔬</span>
            </Link>
            <Link
              href="/bac-2027"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              دليل الشعب
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold transition-all shadow-sm"
            >
              تشخيص مستواي مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-10 pb-10 md:pt-12 md:pb-12 border-b border-[#E8E2D5] text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C5E54]/10 text-[#2C5E54] text-xs font-bold">
            <Calculator className="w-4 h-4" />
            <span>المعاملات الرسمية المعتمدة لوزارة التربية الوطنية الجزائرية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#1E3A34] leading-tight">
            حاسبة معدل البكالوريا 2027
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            اختر شعبتك، ضع نقاطك المتوقعة أو المحصل عليها في الاختبارات التجريبية، واكتشف معدلك التقديري والتخصصات الجامعية المتاحة أمامك.
          </p>

          {/* Banner link to 3D Scientific Calculator */}
          <div className="pt-2">
            <Link
              href="/scientific-calculator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-teal-200 text-teal-800 hover:border-teal-400 hover:shadow-sm text-xs font-bold transition-all group"
            >
              <span className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                🔬
              </span>
              <span>هل تحتاج إلى آلة حاسبة علمية لحساب الدوال واللوغاريتمات؟</span>
              <span className="text-teal-600 underline font-extrabold mr-1">فتح الحاسبة ثلاثية الأبعاد Casio Pro &larr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main interactive area for BAC Calculator */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Stream Selector */}
        <div className="space-y-3 mb-8">
          <label className="block text-xs font-bold text-slate-700">اختر الشعبة:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(STREAM_DEFINITIONS).map(([k, def]) => (
              <button
                key={k}
                onClick={() => {
                  setStreamKey(k);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                  streamKey === k
                    ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-sm"
                    : "bg-white text-slate-700 border-[#E8E2D5] hover:border-slate-400"
                }`}
              >
                {def.badge}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Grade Inputs */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">نقاط المواد (على 20)</h2>
                <p className="text-xs text-slate-500">أدخل العلامة بين 0 و 20 لكل مادة</p>
              </div>
              <button
                onClick={resetScores}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentStream.subjects.map((subj) => {
                const isKey = subj.coeff >= 5;
                const score = scores[subj.id] || "";
                return (
                  <div
                    key={subj.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                      isKey ? "bg-[#2C5E54]/5 border-[#2C5E54]/20" : "bg-[#FAF8F5] border-[#E8E2D5]"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{subj.name}</span>
                        {isKey && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C5E54] text-white font-bold">
                            أساسية
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        المعامل: <strong className="text-slate-800">{subj.coeff}</strong>
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
                        className="w-20 text-center py-1.5 px-2 text-sm font-mono font-bold bg-white border border-[#E8E2D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5E54] text-slate-900"
                      />
                      <span className="text-xs text-slate-400 font-mono">/ 20</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Instant Results Card */}
          <div className="lg:col-span-5 space-y-6 sticky top-20">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#EFE9DC] via-[#F7F3EA] to-[#FFFCF7] border border-[#E4DED2] shadow-clay space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C5E54] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>النتيجة التقديرية</span>
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${mention.color}`}>
                  {mention.label}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-500">المعدل العام التقديري للبكالوريا:</div>
                <div className="text-5xl sm:text-6xl font-serif font-black text-[#1E3A34] tracking-tight font-mono">
                  {average.toFixed(2)}
                  <span className="text-base text-slate-400 font-sans mr-2">/ 20</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4DED2]">
                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#E4DED2]">
                  <span className="text-[10px] text-slate-500 block">مجموع النقاط</span>
                  <span className="text-xl font-black text-slate-800 font-mono">
                    {totalPoints.toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#E4DED2]">
                  <span className="text-[10px] text-slate-500 block">مجموع المعاملات</span>
                  <span className="text-xl font-black text-slate-800 font-mono">
                    {totalCoeffs}
                  </span>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3 pt-2 border-t border-[#E4DED2]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <GraduationCap className="w-4 h-4 text-[#2C5E54]" />
                  <span>أفق التوجيه والفرص المتاحة بمعدل ({average.toFixed(2)}):</span>
                </div>

                {opportunities.length > 0 ? (
                  <div className="space-y-2">
                    {opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/90 border border-[#E4DED2] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{opp.title}</div>
                          <div className="text-[10px] text-slate-500">{opp.category}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {opp.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ضع نقاطك لاكتشاف التخصصات الجامعية والمدارس العليا التي تتطابق مع مستواك.
                  </p>
                )}
              </div>

              {/* Call to action */}
              <div className="pt-2">
                <Link
                  href="/auth/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold shadow-md transition-all"
                >
                  <span>أريد رفع معدلي — ابدأ التشخيص مع الشاطر</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Strategic Advice Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#2C5E54]" />
                <span>كيف ترفع معدلك بنقطتين إضافيتين؟</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                في شهادة البكالوريا، رفع علامة مادة أساسية ذات معامل 6 بمقدار 2 نقطة فقط يعطيك 12 نقطة إضافية في رصيدك الكلي! احرص على سد الثغرات في المواد ذات المعاملات المرتفعة أولاً.
              </p>
              <div className="pt-2">
                <Link
                  href="/curriculum"
                  className="text-xs font-bold text-[#2C5E54] hover:underline inline-flex items-center gap-1"
                >
                  <span>استكشف المنهاج والتمارين التفاعلية</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-[#F2ECE1]/40 py-8 px-4 text-center text-xs text-slate-500 mt-16">
        <p>© 2026-2027 الشاطر (SHATER) — حاسبة معدل البكالوريا الجزائرية الرسمية.</p>
        <p className="mt-1">المعاملات مطابقة للجريدة الرسمية والتنظيم التربوي لوزارة التربية الوطنية.</p>
      </footer>
    </div>
  );
}
