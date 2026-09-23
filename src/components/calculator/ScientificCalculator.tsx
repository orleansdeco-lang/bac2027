"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  History,
  Copy,
  Check,
  Delete,
  Sparkles,
  Info,
  BookOpen,
  Atom,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

// Factorial calculation
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS overflow
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Permutations nPr = n! / (n - r)!
function nPr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n) return NaN;
  return factorial(n) / factorial(n - r);
}

// Combinations nCr = n! / (r! * (n - r)!)
function nCr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n) return NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// Evaluate mathematical expressions cleanly and safely
function evaluateMathExpression(expr: string, angleMode: "deg" | "rad"): number {
  let cleaned = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "Math.PI")
    .replace(/Ans/g, "ANS_VAL");

  // Handle angle conversions for trig
  const toRad = angleMode === "deg" ? "(Math.PI/180)*" : "";
  const fromRad = angleMode === "deg" ? "*(180/Math.PI)" : "";

  // Replace functions
  cleaned = cleaned.replace(/sin\(([^)]+)\)/g, `Math.sin(${toRad}($1))`);
  cleaned = cleaned.replace(/cos\(([^)]+)\)/g, `Math.cos(${toRad}($1))`);
  cleaned = cleaned.replace(/tan\(([^)]+)\)/g, `Math.tan(${toRad}($1))`);
  cleaned = cleaned.replace(/asin\(([^)]+)\)/g, `(${fromRad}Math.asin($1))`);
  cleaned = cleaned.replace(/acos\(([^)]+)\)/g, `(${fromRad}Math.acos($1))`);
  cleaned = cleaned.replace(/atan\(([^)]+)\)/g, `(${fromRad}Math.atan($1))`);

  cleaned = cleaned.replace(/ln\(([^)]+)\)/g, "Math.log($1)");
  cleaned = cleaned.replace(/log\(([^)]+)\)/g, "Math.log10($1)");
  cleaned = cleaned.replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)");
  cleaned = cleaned.replace(/cbrt\(([^)]+)\)/g, "Math.cbrt($1)");
  cleaned = cleaned.replace(/abs\(([^)]+)\)/g, "Math.abs($1)");
  cleaned = cleaned.replace(/e\^(\d+|\([^)]+\))/g, "Math.exp($1)");
  cleaned = cleaned.replace(/10\^(\d+|\([^)]+\))/g, "Math.pow(10, $1)");
  cleaned = cleaned.replace(/\^/g, "**");

  // Function constructor sandbox with Math context
  const evalFunc = new Function(
    "Math",
    "factorial",
    "nPr",
    "nCr",
    `"use strict"; return (${cleaned});`
  );

  return evalFunc(Math, factorial, nPr, nCr);
}

export function ScientificCalculator() {
  const [expression, setExpression] = useState<string>("");
  const [result, setResult] = useState<string>("0");
  const [lastAnswer, setLastAnswer] = useState<string>("0");
  const [memory, setMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [isSecondFunction, setIsSecondFunction] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus and key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focused on input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        appendInput(e.key);
      } else if (e.key === ".") {
        appendInput(".");
      } else if (e.key === "+") {
        appendInput("+");
      } else if (e.key === "-") {
        appendInput("-");
      } else if (e.key === "*") {
        appendInput("×");
      } else if (e.key === "/") {
        e.preventDefault();
        appendInput("÷");
      } else if (e.key === "(" || e.key === ")") {
        appendInput(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculateResult();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "Escape") {
        clearAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expression, lastAnswer, angleMode]);

  const appendInput = (val: string) => {
    setErrorMsg(null);
    setExpression((prev) => prev + val);
  };

  const clearAll = () => {
    setExpression("");
    setResult("0");
    setErrorMsg(null);
  };

  const backspace = () => {
    setErrorMsg(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculateResult = () => {
    if (!expression.trim()) return;

    try {
      // Replace Ans with value
      let exprToEval = expression.replace(/Ans/g, lastAnswer);

      // Auto-close open parentheses
      const openCount = (exprToEval.match(/\(/g) || []).length;
      const closeCount = (exprToEval.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        exprToEval += ")".repeat(openCount - closeCount);
      }

      const val = evaluateMathExpression(exprToEval, angleMode);

      if (isNaN(val)) {
        setErrorMsg("قيمة غير معرفة (Math Error)");
        setResult("Error");
        return;
      }

      if (!isFinite(val)) {
        setErrorMsg("قسمة على الصفر أو ما لا نهاية");
        setResult("Infinity");
        return;
      }

      // Format result nicely
      let formatted: string;
      if (Math.abs(val) < 1e-6 && val !== 0) {
        formatted = val.toExponential(6);
      } else if (Math.abs(val) > 1e11) {
        formatted = val.toExponential(6);
      } else {
        formatted = String(Number(val.toFixed(10)));
      }

      setResult(formatted);
      setLastAnswer(formatted);
      setErrorMsg(null);

      // Record in history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: formatted,
        timestamp: new Date().toLocaleTimeString("ar-DZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error("Calculation error:", err);
      setErrorMsg("خطأ في الصيغة (Syntax Error)");
      setResult("Error");
    }
  };

  // Memory operations
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => appendInput(String(memory));
  const memoryAdd = () => {
    const currentVal = parseFloat(result) || 0;
    setMemory((prev) => prev + currentVal);
  };
  const memorySubtract = () => {
    const currentVal = parseFloat(result) || 0;
    setMemory((prev) => prev - currentVal);
  };

  // Copy result
  const copyResult = () => {
    if (result && result !== "0" && result !== "Error") {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // BAC Physical Constants Pool
  const BAC_CONSTANTS = [
    { label: "c (ضوء)", val: "3e8", desc: "3.00 × 10⁸ m/s" },
    { label: "NA (أفوغادرو)", val: "6.022e23", desc: "6.022 × 10²³ mol⁻¹" },
    { label: "g (جاذبية)", val: "9.80", desc: "9.80 m/s²" },
    { label: "e (شحنة)", val: "1.602e-19", desc: "1.602 × 10⁻¹⁹ C" },
    { label: "R (غازات)", val: "8.314", desc: "8.314 J/(mol·K)" },
    { label: "ln(2)", val: "0.693147", desc: "0.693 (زمن نصف العمر)" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Modes Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-theme shadow-clay">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-lg shadow-xs">
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-theme-text">
                الآلة الحاسبة العلمية المحترفة
              </h2>
              <Badge variant="outline" size="sm" className="border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10 font-bold text-[10px]">
                BAC Casio FX Pro
              </Badge>
            </div>
            <p className="text-xs text-theme-muted">
              حسابات دقيقة للدوال المثلثية، اللوغاريتم، الاحتمالات، والثوابت الفيزيائية.
            </p>
          </div>
        </div>

        {/* Toggles: Deg/Rad & History */}
        <div className="flex items-center gap-2">
          {/* Deg / Rad toggle */}
          <div className="flex items-center bg-card-muted p-1 rounded-2xl border border-theme text-xs font-bold">
            <button
              type="button"
              onClick={() => setAngleMode("deg")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                angleMode === "deg"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              DEG (درجات)
            </button>
            <button
              type="button"
              onClick={() => setAngleMode("rad")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                angleMode === "rad"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-theme-muted hover:text-theme-text"
              }`}
            >
              RAD (راديان)
            </button>
          </div>

          {/* History Button */}
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className={`p-2.5 rounded-2xl border border-theme transition-all flex items-center gap-1.5 text-xs font-bold ${
              showHistory
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]/40"
                : "bg-card text-theme-secondary hover:text-theme-text"
            }`}
            title="سجل الحسابات"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">السجل ({history.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Calculator Body (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* LCD Screen Container */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#1E2522] text-[#F3F4F3] border-2 border-emerald-900/40 shadow-inner space-y-2 relative overflow-hidden">
            {/* Screen Top Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400/80 border-b border-emerald-900/40 pb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 uppercase">
                  {angleMode}
                </span>
                {memory !== 0 && (
                  <span className="font-bold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    M = {memory}
                  </span>
                )}
                {isSecondFunction && (
                  <span className="font-bold px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                    2ndF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {result !== "0" && (
                  <button
                    type="button"
                    onClick={copyResult}
                    className="p-1 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    title="نسخ النتيجة"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "تم النسخ" : "نسخ"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expression Formula Display */}
            <div className="min-h-[28px] text-end text-sm sm:text-base font-mono text-stone-300/80 overflow-x-auto whitespace-nowrap tracking-wide py-1">
              {expression || <span className="opacity-30">0</span>}
            </div>

            {/* Result Line Display */}
            <div className="min-h-[48px] flex items-center justify-end text-end text-2xl sm:text-4xl font-mono font-black text-emerald-400 overflow-x-auto whitespace-nowrap tracking-tight">
              {result}
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="text-xs text-rose-400 font-mono text-end pt-1 animate-pulse">
                ⚠ {errorMsg}
              </div>
            )}
          </div>

          {/* Calculator Keypad Grid */}
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            {/* Top Function / Memory Row */}
            <div className="grid grid-cols-6 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setIsSecondFunction((p) => !p)}
                className={`p-2.5 rounded-xl font-bold transition-all ${
                  isSecondFunction
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-card-muted hover:bg-surface text-theme-text border border-theme"
                }`}
              >
                2nd
              </button>
              <button
                type="button"
                onClick={memoryClear}
                className="p-2.5 rounded-xl bg-card-muted hover:bg-surface text-theme-text border border-theme font-bold"
              >
                MC
              </button>
              <button
                type="button"
                onClick={memoryRecall}
                className="p-2.5 rounded-xl bg-card-muted hover:bg-surface text-theme-text border border-theme font-bold"
              >
                MR
              </button>
              <button
                type="button"
                onClick={memoryAdd}
                className="p-2.5 rounded-xl bg-card-muted hover:bg-surface text-theme-text border border-theme font-bold"
              >
                M+
              </button>
              <button
                type="button"
                onClick={memorySubtract}
                className="p-2.5 rounded-xl bg-card-muted hover:bg-surface text-theme-text border border-theme font-bold"
              >
                M-
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="p-2.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 font-bold"
              >
                AC
              </button>
            </div>

            {/* Main Keypad Buttons: Scientific & Numerical */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 text-sm font-mono">
              {/* Row 1 */}
              <button
                type="button"
                onClick={() => appendInput(isSecondFunction ? "asin(" : "sin(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                {isSecondFunction ? "sin⁻¹" : "sin"}
              </button>
              <button
                type="button"
                onClick={() => appendInput(isSecondFunction ? "acos(" : "cos(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                {isSecondFunction ? "cos⁻¹" : "cos"}
              </button>
              <button
                type="button"
                onClick={() => appendInput(isSecondFunction ? "atan(" : "tan(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                {isSecondFunction ? "tan⁻¹" : "tan"}
              </button>
              <button
                type="button"
                onClick={() => appendInput("(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                (
              </button>
              <button
                type="button"
                onClick={() => appendInput(")")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                )
              </button>
              <button
                type="button"
                onClick={backspace}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-rose-500 flex items-center justify-center"
                title="حذف خانة"
              >
                ⌫
              </button>

              {/* Row 2 */}
              <button
                type="button"
                onClick={() => appendInput("ln(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="اللوغاريتم النيبيري الطبيعي"
              >
                ln
              </button>
              <button
                type="button"
                onClick={() => appendInput("log(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="اللوغاريتم العشري الأساس 10"
              >
                log
              </button>
              <button
                type="button"
                onClick={() => appendInput("^2")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => appendInput("^")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                xʸ
              </button>
              <button
                type="button"
                onClick={() => appendInput("sqrt(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                √x
              </button>
              <button
                type="button"
                onClick={() => appendInput("÷")}
                className="p-3 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/30 font-bold text-[var(--color-primary)] transition-colors"
              >
                ÷
              </button>

              {/* Row 3 */}
              <button
                type="button"
                onClick={() => appendInput(isSecondFunction ? "cbrt(" : "e^(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                {isSecondFunction ? "∛x" : "eˣ"}
              </button>
              <button
                type="button"
                onClick={() => appendInput(isSecondFunction ? "10^(" : "π")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
              >
                {isSecondFunction ? "10ˣ" : "π"}
              </button>
              <button
                type="button"
                onClick={() => appendInput("7")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => appendInput("8")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => appendInput("9")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => appendInput("×")}
                className="p-3 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/30 font-bold text-[var(--color-primary)] transition-colors"
              >
                ×
              </button>

              {/* Row 4 */}
              <button
                type="button"
                onClick={() => appendInput("factorial(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="العاملي Factorial n!"
              >
                n!
              </button>
              <button
                type="button"
                onClick={() => appendInput("nCr(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="التوفيقات Combinations nCr"
              >
                nCr
              </button>
              <button
                type="button"
                onClick={() => appendInput("4")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => appendInput("5")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => appendInput("6")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => appendInput("-")}
                className="p-3 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/30 font-bold text-[var(--color-primary)] transition-colors"
              >
                -
              </button>

              {/* Row 5 */}
              <button
                type="button"
                onClick={() => appendInput("nPr(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="الترتيبات Permutations nPr"
              >
                nPr
              </button>
              <button
                type="button"
                onClick={() => appendInput("abs(")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="القيمة المطلقة"
              >
                |x|
              </button>
              <button
                type="button"
                onClick={() => appendInput("1")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => appendInput("2")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => appendInput("3")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => appendInput("+")}
                className="p-3 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/30 font-bold text-[var(--color-primary)] transition-colors"
              >
                +
              </button>

              {/* Row 6 */}
              <button
                type="button"
                onClick={() => appendInput("Ans")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="النتيجة السابقة Ans"
              >
                Ans
              </button>
              <button
                type="button"
                onClick={() => appendInput("0")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => appendInput(".")}
                className="p-3 rounded-xl bg-surface hover:bg-card-muted border border-theme font-black text-theme-text shadow-2xs"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => appendInput("*10^")}
                className="p-3 rounded-xl bg-card-muted/80 hover:bg-surface border border-theme font-bold text-theme-text"
                title="الترميز العلمي ×10ˣ"
              >
                ×10ˣ
              </button>
              <button
                type="button"
                onClick={calculateResult}
                className="col-span-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-sm transition-all"
              >
                =
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel: BAC Physics Constants & History (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* BAC Physical & Chemical Constants Card */}
          <div className="p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Atom className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>ثوابت البكالوريا الرسمية (فيزياء وكيمياء)</span>
            </div>
            <p className="text-xs text-theme-muted">
              اضغط على أي ثابت لإدراجه فوراً في العملية الحسابية:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {BAC_CONSTANTS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => appendInput(c.val)}
                  className="p-2.5 rounded-2xl bg-card-muted/70 hover:bg-[var(--color-primary-soft)] hover:border-[var(--color-primary)] border border-theme text-start transition-all group"
                >
                  <div className="font-bold text-theme-text group-hover:text-[var(--color-primary)] font-mono">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-theme-muted font-mono mt-0.5">
                    {c.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History Drawer / Card */}
          <div className="p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
                <History className="w-4 h-4 text-[var(--color-primary)]" />
                <span>سجل الحسابات الأخيرة</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  مسح السجل
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-theme-muted">
                لا توجد حسابات سابقة بعد.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setExpression(item.result);
                      setResult(item.result);
                    }}
                    className="p-2.5 rounded-2xl bg-card-muted/60 border border-theme hover:border-[var(--color-primary)] cursor-pointer transition-all text-xs font-mono"
                    title="اضغط لاستخدام النتيجة"
                  >
                    <div className="text-theme-muted text-[11px] truncate text-end">
                      {item.expression} =
                    </div>
                    <div className="font-black text-theme-text text-sm text-end text-emerald-600 dark:text-emerald-400">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
