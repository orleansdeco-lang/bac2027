"use client";

import React, { useState } from "react";
import {
  Binary,
  ArrowRightLeft,
  Percent,
  Check,
  Copy,
  Sparkles,
  HelpCircle,
  Calculator,
} from "lucide-react";

// ============================================================================
// 1. QUADRATIC EQUATION & DELTA SOLVER (حل المعادلات والمميز دلتا)
// ============================================================================
function DeltaEquationSolver() {
  const [a, setA] = useState<string>("1");
  const [b, setB] = useState<string>("-5");
  const [c, setC] = useState<string>("6");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const numA = parseFloat(a);
  const numB = parseFloat(b);
  const numC = parseFloat(c);

  const isValid = !isNaN(numA) && !isNaN(numB) && !isNaN(numC) && numA !== 0;

  // Delta calculation: Δ = b² - 4ac
  const delta = isValid ? numB * numB - 4 * numA * numC : 0;

  let solutionType: "two_real" | "one_double" | "no_real" = "two_real";
  let x1: number | null = null;
  let x2: number | null = null;
  let x0: number | null = null;
  let complexZ1: string | null = null;
  let complexZ2: string | null = null;
  let factorForm: string = "";

  if (isValid) {
    if (delta > 0) {
      solutionType = "two_real";
      x1 = (-numB - Math.sqrt(delta)) / (2 * numA);
      x2 = (-numB + Math.sqrt(delta)) / (2 * numA);
      // Format factor form: a(x - x1)(x - x2)
      const aPrefix = numA === 1 ? "" : numA === -1 ? "-" : `${numA}`;
      const f1 = x1 >= 0 ? `(x - ${x1.toFixed(3).replace(/\.?0+$/, "")})` : `(x + ${Math.abs(x1).toFixed(3).replace(/\.?0+$/, "")})`;
      const f2 = x2 >= 0 ? `(x - ${x2.toFixed(3).replace(/\.?0+$/, "")})` : `(x + ${Math.abs(x2).toFixed(3).replace(/\.?0+$/, "")})`;
      factorForm = `${aPrefix}${f1}${f2}`;
    } else if (Math.abs(delta) < 1e-12) {
      solutionType = "one_double";
      x0 = -numB / (2 * numA);
      const aPrefix = numA === 1 ? "" : numA === -1 ? "-" : `${numA}`;
      const f0 = x0 >= 0 ? `(x - ${x0.toFixed(3).replace(/\.?0+$/, "")})²` : `(x + ${Math.abs(x0).toFixed(3).replace(/\.?0+$/, "")})²`;
      factorForm = `${aPrefix}${f0}`;
    } else {
      solutionType = "no_real";
      const realPart = (-numB / (2 * numA)).toFixed(3).replace(/\.?0+$/, "");
      const imagPart = (Math.sqrt(Math.abs(delta)) / (2 * Math.abs(numA))).toFixed(3).replace(/\.?0+$/, "");
      complexZ1 = `${realPart} - ${imagPart} i`;
      complexZ2 = `${realPart} + ${imagPart} i`;
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro info banner */}
      <div className="p-4 rounded-2xl bg-surface border border-theme flex items-start gap-3">
        <span className="text-xl">📐</span>
        <div className="text-xs text-theme-secondary space-y-1">
          <div className="font-bold text-theme-text text-sm">
            حل معادلات الدرجة الثانية: ax² + bx + c = 0
          </div>
          <div>
            أدخل المعاملات (a، b، c) لحساب المميز دلتا بالتفصيل، إيجاد الجذور، كتابة التحليل النموذجي، ودراسة إشارة العبارة.
          </div>
        </div>
      </div>

      {/* Input coefficients */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-card border border-theme shadow-xs space-y-1.5">
          <label className="text-xs font-bold text-theme-text block">
            المعامل a (مضروب في x²):
          </label>
          <input
            type="number"
            step="any"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full text-center font-mono font-bold text-base py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="مثال: 1"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-theme shadow-xs space-y-1.5">
          <label className="text-xs font-bold text-theme-text block">
            المعامل b (مضروب في x):
          </label>
          <input
            type="number"
            step="any"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full text-center font-mono font-bold text-base py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="مثال: -5"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-theme shadow-xs space-y-1.5">
          <label className="text-xs font-bold text-theme-text block">
            الحد الثابت c:
          </label>
          <input
            type="number"
            step="any"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="w-full text-center font-mono font-bold text-base py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="مثال: 6"
          />
        </div>
      </div>

      {numA === 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
          تنبيه: المعامل a يجب ألا يساوي الصفر لتكون المعادلة من الدرجة الثانية.
        </div>
      )}

      {/* Results details */}
      {isValid && (
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay space-y-5">
          {/* Equation summary */}
          <div className="text-center pb-4 border-b border-theme/60">
            <div className="text-xs text-theme-muted mb-1 font-bold">المعادلة المدروسة:</div>
            <div className="text-lg sm:text-2xl font-black font-mono text-[var(--color-primary)]" dir="ltr">
              {numA === 1 ? "" : numA === -1 ? "-" : numA}x² {numB >= 0 ? `+ ${numB}` : `- ${Math.abs(numB)}`}x {numC >= 0 ? `+ ${numC}` : `- ${Math.abs(numC)}`} = 0
            </div>
          </div>

          {/* Delta calculation steps */}
          <div className="p-4 rounded-2xl bg-surface border border-theme space-y-2">
            <div className="text-xs font-bold text-theme-text flex items-center justify-between">
              <span>حساب المميز دلتا (Δ = b² - 4ac):</span>
              <button
                type="button"
                onClick={() => copyToClipboard(String(delta), "delta")}
                className="text-[11px] text-theme-muted hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
              >
                {copiedText === "delta" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === "delta" ? "تم النسخ" : "نسخ Δ"}</span>
              </button>
            </div>

            <div className="font-mono text-sm sm:text-base text-theme-text font-bold" dir="ltr">
              Δ = ({numB})² - 4 × ({numA}) × ({numC}) = {numB * numB} - {4 * numA * numC} = <span className="text-emerald-600 dark:text-emerald-400 font-black">{delta}</span>
            </div>
          </div>

          {/* Solution Cases */}
          {solutionType === "two_real" && x1 !== null && x2 !== null && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  بما أن Δ {">"} 0، فإن للمعادلة حلين حقيقيين متمايزين:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                  <div className="p-3 rounded-xl bg-card border border-theme flex items-center justify-between">
                    <div>
                      <div className="text-xs text-theme-muted font-bold">الحل الأول (x₁):</div>
                      <div className="text-lg font-black font-mono text-theme-text mt-0.5">
                        x₁ = {x1.toFixed(4).replace(/\.?0+$/, "")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(x1), "x1")}
                      className="p-1.5 rounded-lg hover:bg-surface text-theme-muted hover:text-theme-text cursor-pointer"
                      title="نسخ الحل الأول"
                    >
                      {copiedText === "x1" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-theme flex items-center justify-between">
                    <div>
                      <div className="text-xs text-theme-muted font-bold">الحل الثاني (x₂):</div>
                      <div className="text-lg font-black font-mono text-theme-text mt-0.5">
                        x₂ = {x2.toFixed(4).replace(/\.?0+$/, "")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(x2), "x2")}
                      className="p-1.5 rounded-lg hover:bg-surface text-theme-muted hover:text-theme-text cursor-pointer"
                      title="نسخ الحل الثاني"
                    >
                      {copiedText === "x2" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Factorization form */}
              <div className="p-3.5 rounded-2xl bg-surface border border-theme text-xs space-y-1">
                <div className="font-bold text-theme-text">التحليل النموذجي لثلاثي الحدود:</div>
                <div className="font-mono text-sm text-[var(--color-primary)] font-bold" dir="ltr">
                  P(x) = {factorForm}
                </div>
              </div>

              {/* Sign rule */}
              <div className="p-3.5 rounded-2xl bg-surface border border-theme text-xs space-y-1">
                <div className="font-bold text-theme-text">دراسة الإشارة:</div>
                <div className="text-theme-secondary leading-relaxed">
                  • داخل مجال الجذرين [{Math.min(x1, x2).toFixed(2)}, {Math.max(x1, x2).toFixed(2)}]: الإشارة <strong>عكس إشارة a</strong> ({numA > 0 ? "سالبة -" : "موجبة +"}).
                  <br />
                  • خارج مجال الجذرين: الإشارة <strong>نفس إشارة a</strong> ({numA > 0 ? "موجبة +" : "سالبة -"}).
                </div>
              </div>
            </div>
          )}

          {solutionType === "one_double" && x0 !== null && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  بما أن Δ = 0، فإن للمعادلة حلاً مضاعفاً وحيداً:
                </div>
                <div className="p-3 rounded-xl bg-card border border-theme flex items-center justify-between" dir="ltr">
                  <div>
                    <div className="text-xs text-theme-muted font-bold">الحل المضاعف (x₀ = -b / 2a):</div>
                    <div className="text-xl font-black font-mono text-theme-text mt-0.5">
                      x₀ = {x0.toFixed(4).replace(/\.?0+$/, "")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(x0), "x0")}
                    className="p-1.5 rounded-lg hover:bg-surface text-theme-muted hover:text-theme-text cursor-pointer"
                  >
                    {copiedText === "x0" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme text-xs space-y-1">
                <div className="font-bold text-theme-text">التحليل النموذجي:</div>
                <div className="font-mono text-sm text-[var(--color-primary)] font-bold" dir="ltr">
                  P(x) = {factorForm}
                </div>
              </div>
            </div>
          )}

          {solutionType === "no_real" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  بما أن Δ {"<"} 0، فالمعادلة ليس لها حلول في مجموعة الأعداد الحقيقية ℝ.
                </div>
                <div className="text-xs text-theme-secondary">
                  ثلاثي الحدود لا ينعدم وله دائماً نفس إشارة a ({numA > 0 ? "موجب تماماً على ℝ" : "سالب تماماً على ℝ"}).
                </div>
              </div>

              {/* Complex solutions for Maths/Sciences streams */}
              {complexZ1 && complexZ2 && (
                <div className="p-4 rounded-2xl bg-surface border border-theme space-y-2">
                  <div className="text-xs font-bold text-theme-text">
                    الحلول في مجموعة الأعداد المركبة ℂ (لشعب العلوم والرياضيات والتقني):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs" dir="ltr">
                    <div className="p-2.5 rounded-xl bg-card border border-theme">
                      <span className="text-theme-muted">z₁ = </span>
                      <span className="font-bold text-theme-text">{complexZ1}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-theme">
                      <span className="text-theme-muted">z₂ = </span>
                      <span className="font-bold text-theme-text">{complexZ2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. PHYSICS & CHEMISTRY UNIT CONVERTER (محول الوحدات الفيزيائية والكيميائية)
// ============================================================================
type UnitCategory = "energy" | "pressure" | "volume" | "time" | "mass" | "angle";

interface UnitOption {
  id: string;
  name_ar: string;
  symbol: string;
  factorToBase: number; // Multiply by this to get base unit
}

const UNIT_CATEGORIES: Record<UnitCategory, { title: string; baseUnit: string; icon: string; units: UnitOption[] }> = {
  energy: {
    title: "الطاقة والعمل",
    baseUnit: "J",
    icon: "⚡",
    units: [
      { id: "J", name_ar: "جول", symbol: "J", factorToBase: 1 },
      { id: "kJ", name_ar: "كيلو جول", symbol: "kJ", factorToBase: 1000 },
      { id: "eV", name_ar: "إلكترون فولت", symbol: "eV", factorToBase: 1.602176634e-19 },
      { id: "MeV", name_ar: "ميغا إلكترون فولت", symbol: "MeV", factorToBase: 1.602176634e-13 },
      { id: "cal", name_ar: "حريرة (كالوري)", symbol: "cal", factorToBase: 4.184 },
    ],
  },
  pressure: {
    title: "الضغط والغازات",
    baseUnit: "Pa",
    icon: "💨",
    units: [
      { id: "Pa", name_ar: "باسكال", symbol: "Pa", factorToBase: 1 },
      { id: "hPa", name_ar: "هيكتوباسكال", symbol: "hPa", factorToBase: 100 },
      { id: "kPa", name_ar: "كيلوباسكال", symbol: "kPa", factorToBase: 1000 },
      { id: "bar", name_ar: "بار", symbol: "bar", factorToBase: 100000 },
      { id: "atm", name_ar: "ضغط جوي نظامي", symbol: "atm", factorToBase: 101325 },
      { id: "mmHg", name_ar: "ميليمتر زئبق", symbol: "mmHg", factorToBase: 133.322 },
    ],
  },
  volume: {
    title: "الحجم والمحاليل",
    baseUnit: "m³",
    icon: "🧪",
    units: [
      { id: "m3", name_ar: "متر مكعب", symbol: "m³", factorToBase: 1 },
      { id: "L", name_ar: "لتر", symbol: "L", factorToBase: 0.001 },
      { id: "dL", name_ar: "ديسيلتر", symbol: "dL", factorToBase: 0.0001 },
      { id: "mL", name_ar: "ميليلتر", symbol: "mL", factorToBase: 0.000001 },
      { id: "cm3", name_ar: "سنتيمتر مكعب", symbol: "cm³", factorToBase: 0.000001 },
    ],
  },
  time: {
    title: "الزمن وتطور التفاعلات",
    baseUnit: "s",
    icon: "⏱️",
    units: [
      { id: "s", name_ar: "ثانية", symbol: "s", factorToBase: 1 },
      { id: "min", name_ar: "دقيقة", symbol: "min", factorToBase: 60 },
      { id: "h", name_ar: "ساعة", symbol: "h", factorToBase: 3600 },
      { id: "day", name_ar: "يوم", symbol: "j", factorToBase: 86400 },
      { id: "year", name_ar: "سنة", symbol: "an", factorToBase: 31536000 },
      { id: "ms", name_ar: "ميلي ثانية", symbol: "ms", factorToBase: 0.001 },
    ],
  },
  mass: {
    title: "الكتلة والكمية المادية",
    baseUnit: "kg",
    icon: "⚖️",
    units: [
      { id: "kg", name_ar: "كيلوغرام", symbol: "kg", factorToBase: 1 },
      { id: "g", name_ar: "غرام", symbol: "g", factorToBase: 0.001 },
      { id: "mg", name_ar: "ميليغرام", symbol: "mg", factorToBase: 0.000001 },
      { id: "u", name_ar: "وحدة كتل ذرية", symbol: "u", factorToBase: 1.6605390666e-27 },
      { id: "ton", name_ar: "طن", symbol: "t", factorToBase: 1000 },
    ],
  },
  angle: {
    title: "الزوايا وحساب المثلثات",
    baseUnit: "deg",
    icon: "📐",
    units: [
      { id: "deg", name_ar: "درجة", symbol: "°", factorToBase: 1 },
      { id: "rad", name_ar: "راديان", symbol: "rad", factorToBase: 180 / Math.PI },
      { id: "grad", name_ar: "غراد", symbol: "grad", factorToBase: 0.9 },
    ],
  },
};

function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("energy");
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnitId, setFromUnitId] = useState<string>("eV");
  const [toUnitId, setToUnitId] = useState<string>("J");
  const [copied, setCopied] = useState(false);

  const catData = UNIT_CATEGORIES[category];
  const fromUnit = catData.units.find((u) => u.id === fromUnitId) || catData.units[0];
  const toUnit = catData.units.find((u) => u.id === toUnitId) || catData.units[1];

  const numInput = parseFloat(inputValue);
  const isValid = !isNaN(numInput);

  // Conversion: input * (fromFactor / toFactor)
  let convertedResult = 0;
  if (isValid && fromUnit && toUnit) {
    const valueInBase = numInput * fromUnit.factorToBase;
    convertedResult = valueInBase / toUnit.factorToBase;
  }

  const formatSmartNumber = (val: number): string => {
    if (isNaN(val)) return "0";
    if (val === 0) return "0";
    if (Math.abs(val) < 0.0001 || Math.abs(val) >= 1e7) {
      return val.toExponential(6).replace(/\+/, "");
    }
    return val.toLocaleString("en-US", { maximumFractionDigits: 8 });
  };

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNIT_CATEGORIES[newCat].units;
    setFromUnitId(units[0].id);
    setToUnitId(units[1] ? units[1].id : units[0].id);
  };

  const swapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(convertedResult));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((key) => {
          const c = UNIT_CATEGORIES[key];
          const isSelected = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryChange(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                  : "bg-card text-theme-secondary border-theme hover:bg-surface-soft hover:text-theme-text"
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* From Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-theme-text block">
              التحويل من:
            </label>
            <div className="space-y-2">
              <input
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full font-mono font-bold text-base py-2.5 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center"
                placeholder="أدخل القيمة"
              />
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none cursor-pointer"
              >
                {catData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name_ar} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-6">
            <button
              type="button"
              onClick={swapUnits}
              className="p-3 rounded-2xl bg-surface border border-theme hover:bg-[var(--color-primary-soft)] hover:border-[var(--color-primary)] text-theme-secondary hover:text-[var(--color-primary)] transition-all cursor-pointer shadow-xs active:scale-95"
              title="تبديل الوحدتين"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-theme-text block">
              التحويل إلى:
            </label>
            <div className="space-y-2">
              <div className="w-full font-mono font-black text-base py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-center truncate select-all">
                {isValid ? formatSmartNumber(convertedResult) : "0"}
              </div>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none cursor-pointer"
              >
                {catData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name_ar} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversion Result Detail & Copy */}
        {isValid && (
          <div className="p-4 rounded-2xl bg-surface border border-theme flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-mono text-sm sm:text-base font-bold text-theme-text text-center sm:text-start" dir="ltr">
              {inputValue} {fromUnit?.symbol} ={" "}
              <span className="text-[var(--color-primary)] font-black text-lg">
                {formatSmartNumber(convertedResult)} {toUnit?.symbol}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-theme text-xs font-bold text-theme-text flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم النسخ!" : "نسخ النتيجة"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. PERCENTAGE & VARIATION RATE CALCULATOR (حاسبة النسب المئوية والتطور)
// ============================================================================
function PercentageTools() {
  // Tool 1: X% of Y
  const [pct, setPct] = useState<string>("20");
  const [totalVal, setTotalVal] = useState<string>("150");

  // Tool 2: Variation rate (V2 - V1) / V1 * 100
  const [v1, setV1] = useState<string>("100");
  const [v2, setV2] = useState<string>("125");

  const numPct = parseFloat(pct);
  const numTotal = parseFloat(totalVal);
  const pctResult = !isNaN(numPct) && !isNaN(numTotal) ? (numPct / 100) * numTotal : 0;

  const numV1 = parseFloat(v1);
  const numV2 = parseFloat(v2);
  const isVariationValid = !isNaN(numV1) && !isNaN(numV2) && numV1 !== 0;
  const variationRate = isVariationValid ? ((numV2 - numV1) / numV1) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tool 1: Calculate Percentage */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
          <Percent className="w-4 h-4 text-[var(--color-primary)]" />
          <span>حساب النسبة المئوية من قيمة</span>
        </div>
        <p className="text-xs text-theme-muted">
          لحساب مقدار النسبة المئوية أو التخفيض من أي مقدار:
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-secondary w-16">النسبة:</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="w-full font-mono font-bold text-sm py-2 px-3 pl-8 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="20"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-theme-muted">%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-secondary w-16">من القيمة:</span>
            <input
              type="number"
              value={totalVal}
              onChange={(e) => setTotalVal(e.target.value)}
              className="w-full flex-1 font-mono font-bold text-sm py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="150"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-theme text-center space-y-1">
          <div className="text-xs text-theme-muted font-bold">النتيجة:</div>
          <div className="text-2xl font-black font-mono text-[var(--color-primary)]">
            {pctResult.toFixed(3).replace(/\.?0+$/, "")}
          </div>
          <div className="text-[11px] text-theme-muted mt-1">
            القيمة بعد الزيادة: {(numTotal + pctResult).toFixed(2)} | بعد التخفيض: {(numTotal - pctResult).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tool 2: Variation Rate */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-theme shadow-clay space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
          <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>معدل التطور والنمو (نسبة التغير %)</span>
        </div>
        <p className="text-xs text-theme-muted">
          حساب نسبة التغير والتطور بين القيمة الابتدائية والقيمة النهائية:
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-secondary w-24">القيمة الابتدائية:</span>
            <input
              type="number"
              value={v1}
              onChange={(e) => setV1(e.target.value)}
              className="w-full flex-1 font-mono font-bold text-sm py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-secondary w-24">القيمة النهائية:</span>
            <input
              type="number"
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              className="w-full flex-1 font-mono font-bold text-sm py-2 px-3 rounded-xl border border-theme bg-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="125"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-theme text-center space-y-1">
          <div className="text-xs text-theme-muted font-bold">معدل التطور T:</div>
          <div
            className={`text-2xl font-black font-mono ${
              variationRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
            dir="ltr"
          >
            {variationRate >= 0 ? `+${variationRate.toFixed(2)}%` : `${variationRate.toFixed(2)}%`}
          </div>
          <div className="text-[11px] text-theme-muted mt-1">
            {variationRate >= 0 ? "تطور إيجابي (زيادة)" : "تطور سلبي (انخفاض)"} بمقدار{" "}
            {Math.abs(numV2 - numV1).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN WRAPPER: STUDENT TOOLS COMPANION (أدوات الطالب العلمية)
// ============================================================================
export function StudentMathPhysicsTools() {
  const [selectedTool, setSelectedTool] = useState<"equation" | "converter" | "percentage">("equation");

  return (
    <div className="space-y-6 pt-4">
      {/* Tool Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-theme shadow-clay">
        <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          <span>أدوات مساعدة إضافية يحتاجها طالب البكالوريا:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTool("equation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedTool === "equation"
                ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                : "bg-surface text-theme-secondary border-theme hover:bg-card hover:text-theme-text"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>حل المعادلات والمميز (Δ)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTool("converter")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedTool === "converter"
                ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                : "bg-surface text-theme-secondary border-theme hover:bg-card hover:text-theme-text"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>محول الوحدات الفيزيائية والكيميائية</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTool("percentage")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedTool === "percentage"
                ? "bg-[#2C5E54] text-white border-[#2C5E54] shadow-xs"
                : "bg-surface text-theme-secondary border-theme hover:bg-card hover:text-theme-text"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>النسب المئوية ومعدل التطور</span>
          </button>
        </div>
      </div>

      {/* Render active tool */}
      <div className="pt-2">
        {selectedTool === "equation" && <DeltaEquationSolver />}
        {selectedTool === "converter" && <UnitConverterTool />}
        {selectedTool === "percentage" && <PercentageTools />}
      </div>
    </div>
  );
}
