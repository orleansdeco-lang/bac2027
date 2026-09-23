"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  History,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Atom,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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
  if (n > 170) return Infinity;
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

// Greatest Common Divisor for fraction reduction
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Convert float to exact fraction string if rational
function toFractionString(val: number): string | null {
  if (!isFinite(val) || Math.abs(val) > 1e6) return null;
  if (Number.isInteger(val)) return null;

  const tolerance = 1.0e-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = val;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < 10000);

  if (k1 > 1 && k1 < 10000) {
    return `${h1}/${k1}`;
  }
  return null;
}

// Evaluate mathematical expressions cleanly and safely
function evaluateMathExpression(expr: string, angleMode: "deg" | "rad", ansVal: string): number {
  let cleaned = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "Math.PI")
    .replace(/Ans/g, `(${ansVal || "0"})`)
    .replace(/e(?![a-zA-Z0-9_])/g, "Math.E");

  const toRad = angleMode === "deg" ? "(Math.PI/180)*" : "";
  const fromRad = angleMode === "deg" ? "*(180/Math.PI)" : "";

  // Functions mapping
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
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [result, setResult] = useState<string>("0");
  const [lastAnswer, setLastAnswer] = useState<string>("0");
  const [isFractionView, setIsFractionView] = useState<boolean>(false);
  const [fractionString, setFractionString] = useState<string | null>(null);

  const [memory, setMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Context synthesizer for realistic mechanical click
  const playClickSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Audio playback ignored
    }
  };

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        insertText(e.key);
      } else if (e.key === ".") {
        insertText(".");
      } else if (e.key === "+") {
        insertText("+");
      } else if (e.key === "-") {
        insertText("-");
      } else if (e.key === "*") {
        insertText("×");
      } else if (e.key === "/") {
        e.preventDefault();
        insertText("÷");
      } else if (e.key === "(" || e.key === ")") {
        insertText(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculateResult();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleAllClear();
      } else if (e.key === "ArrowLeft") {
        moveCursorLeft();
      } else if (e.key === "ArrowRight") {
        moveCursorRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expression, cursorPos, lastAnswer, angleMode, isShift]);

  // Insert text at cursor position
  const insertText = (text: string) => {
    playClickSound();
    setErrorMsg(null);
    setIsShift(false);
    setIsAlpha(false);

    setExpression((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos((prev) => prev + text.length);
  };

  // Backspace at cursor
  const handleBackspace = () => {
    playClickSound();
    setErrorMsg(null);
    if (cursorPos === 0) return;

    setExpression((prev) => {
      const before = prev.slice(0, cursorPos - 1);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - 1));
  };

  // All Clear
  const handleAllClear = () => {
    playClickSound();
    setExpression("");
    setCursorPos(0);
    setResult("0");
    setFractionString(null);
    setIsFractionView(false);
    setErrorMsg(null);
    setIsShift(false);
    setIsAlpha(false);
    setHistoryIndex(-1);
  };

  // Navigation D-Pad movements
  const moveCursorLeft = () => {
    playClickSound();
    setCursorPos((prev) => Math.max(0, prev - 1));
  };

  const moveCursorRight = () => {
    playClickSound();
    setCursorPos((prev) => Math.min(expression.length, prev + 1));
  };

  const navigateHistoryUp = () => {
    playClickSound();
    if (history.length === 0) return;
    const nextIdx = Math.min(history.length - 1, historyIndex + 1);
    setHistoryIndex(nextIdx);
    setExpression(history[nextIdx].expression);
    setCursorPos(history[nextIdx].expression.length);
    setResult(history[nextIdx].result);
  };

  const navigateHistoryDown = () => {
    playClickSound();
    if (historyIndex <= 0) {
      setHistoryIndex(-1);
      setExpression("");
      setCursorPos(0);
      setResult("0");
    } else {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setExpression(history[nextIdx].expression);
      setCursorPos(history[nextIdx].expression.length);
      setResult(history[nextIdx].result);
    }
  };

  // Toggle Fraction vs Decimal view (S <=> D)
  const toggleFractionDecimal = () => {
    playClickSound();
    if (!fractionString) return;
    setIsFractionView((prev) => !prev);
  };

  // Calculation execution
  const calculateResult = () => {
    playClickSound();
    if (!expression.trim()) return;

    try {
      let exprToEval = expression;
      // Auto-close open parentheses
      const openCount = (exprToEval.match(/\(/g) || []).length;
      const closeCount = (exprToEval.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        exprToEval += ")".repeat(openCount - closeCount);
      }

      const val = evaluateMathExpression(exprToEval, angleMode, lastAnswer);

      if (isNaN(val)) {
        setErrorMsg("Math ERROR");
        setResult("Syntax Error");
        return;
      }

      if (!isFinite(val)) {
        setErrorMsg("Division by Zero / Infinity");
        setResult("Math ERROR");
        return;
      }

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

      // Check for exact fraction
      const frac = toFractionString(val);
      setFractionString(frac);
      setIsFractionView(false);

      setErrorMsg(null);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: formatted,
        timestamp: new Date().toLocaleTimeString("ar-DZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
      setHistoryIndex(-1);
    } catch {
      setErrorMsg("Syntax ERROR");
      setResult("Syntax ERROR");
    }
  };

  // Memory ops
  const handleMemoryStore = () => {
    playClickSound();
    const val = parseFloat(result) || 0;
    setMemory(val);
  };

  const handleMemoryAdd = () => {
    playClickSound();
    const val = parseFloat(result) || 0;
    setMemory((prev) => prev + val);
  };

  const handleMemoryRecall = () => {
    playClickSound();
    insertText(String(memory));
  };

  const handleMemoryClear = () => {
    playClickSound();
    setMemory(0);
  };

  // Copy result
  const copyResult = () => {
    if (result && result !== "0" && !result.includes("ERROR")) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // BAC Physical Constants
  const BAC_CONSTANTS = [
    { label: "c (ضوء)", val: "3e8", desc: "3.00 × 10⁸ m/s" },
    { label: "NA (أفوغادرو)", val: "6.022e23", desc: "6.022 × 10²³ mol⁻¹" },
    { label: "g (جاذبية)", val: "9.80", desc: "9.80 m/s²" },
    { label: "e (شحنة)", val: "1.602e-19", desc: "1.602 × 10⁻¹⁹ C" },
    { label: "R (غازات)", val: "8.314", desc: "8.314 J/(mol·K)" },
    { label: "F (فاراداي)", val: "96485", desc: "96 485 C/mol" },
    { label: "ln(2)", val: "0.693147", desc: "0.6931 (زمن نصف العمر)" },
    { label: "h (بلانك)", val: "6.626e-34", desc: "6.626 × 10⁻³⁴ J·s" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* ================================================================= */}
        {/* 3D HARDWARE CALCULATOR (CASIO CLASSWIZ TACTILE BODY)             */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 flex justify-center">
          {/* Main 3D Beveled Calculator Housing (Always authentic LTR layout) */}
          <div dir="ltr" className="w-full max-w-[430px] p-5 sm:p-6 rounded-[40px] bg-gradient-to-b from-[#2d3239] via-[#21252b] to-[#181a1f] border-t-2 border-l border-white/20 border-b-4 border-r-2 border-[#0d0f12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] relative select-none">
            {/* Corner Hardware Screws (Authentic physical look) */}
            <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#15171a] border border-white/10 shadow-inner flex items-center justify-center">
              <span className="w-1 h-[0.5px] bg-white/20 block transform rotate-45" />
            </span>
            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#15171a] border border-white/10 shadow-inner flex items-center justify-center">
              <span className="w-1 h-[0.5px] bg-white/20 block transform -rotate-45" />
            </span>
            <span className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-[#15171a] border border-white/10 shadow-inner flex items-center justify-center">
              <span className="w-1 h-[0.5px] bg-white/20 block transform -rotate-12" />
            </span>
            <span className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#15171a] border border-white/10 shadow-inner flex items-center justify-center">
              <span className="w-1 h-[0.5px] bg-white/20 block transform rotate-75" />
            </span>

            {/* Top Bar: Brand, Model, Solar Cell & Audio Toggle */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif font-black tracking-widest text-slate-100 text-sm">
                    SHATER
                  </span>
                  <span className="font-mono text-[10px] text-teal-400 font-bold tracking-wider">
                    fx-991DZ
                  </span>
                </div>
                <div className="font-sans text-[8px] tracking-wider text-slate-400 font-semibold uppercase">
                  ClassWiz • Natural V.P.A.M.
                </div>
              </div>

              {/* Realistic Photovoltaic Solar Strip */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((p) => !p)}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  title={soundEnabled ? "كتم صوت النقر الميكانيكي" : "تفعيل صوت النقر الميكانيكي"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <div
                  className="w-16 h-5 rounded bg-gradient-to-b from-[#2b1708] to-[#120803] border border-[#482811] shadow-inner grid grid-cols-4 gap-[1px] p-[1.5px]"
                  title="خلية شمسية مدمجة ثنائية الطاقة (Two-Way Power)"
                >
                  <div className="bg-[#1f1106] border-r border-[#3a1d08]/60" />
                  <div className="bg-[#1f1106] border-r border-[#3a1d08]/60" />
                  <div className="bg-[#1f1106] border-r border-[#3a1d08]/60" />
                  <div className="bg-[#1f1106]" />
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* REALISTIC NATURAL LCD SCREEN DISPLAY                          */}
            {/* ============================================================= */}
            <div className="p-3.5 rounded-2xl bg-[#bfcdb7] text-[#1c2a1c] border-4 border-[#121417] shadow-[inset_0_4px_12px_rgba(0,0,0,0.65),0_1px_1px_rgba(255,255,255,0.2)] mb-4 relative overflow-hidden font-mono">
              {/* Screen Glass Angle Glare Highlight */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none transform -rotate-45" />

              {/* Top Status Indicators Row */}
              <div className="flex items-center justify-between text-[10px] font-bold border-b border-[#9cae94] pb-1 text-[#2d422d] select-none">
                <div className="flex items-center gap-2">
                  <span className={`px-1 rounded ${isShift ? "bg-[#334633] text-[#bfcdb7]" : "opacity-20"}`}>
                    S
                  </span>
                  <span className={`px-1 rounded ${isAlpha ? "bg-[#334633] text-[#bfcdb7]" : "opacity-20"}`}>
                    A
                  </span>
                  <span className={`px-1 rounded ${memory !== 0 ? "bg-[#334633] text-[#bfcdb7]" : "opacity-20"}`}>
                    M
                  </span>
                  <span className="px-1 rounded bg-[#334633] text-[#bfcdb7] uppercase">
                    {angleMode === "deg" ? "D" : "R"}
                  </span>
                  <span className="opacity-20">Math</span>
                </div>

                <div className="flex items-center gap-1.5 text-[9px]">
                  {history.length > 0 && <span>▲▼</span>}
                  <button
                    type="button"
                    onClick={copyResult}
                    className="hover:text-black transition-colors"
                    title="نسخ النتيجة"
                  >
                    {copied ? "تم!" : "نسخ"}
                  </button>
                </div>
              </div>

              {/* Expression Input Line with Realistic Blinking Cursor */}
              <div className="min-h-[26px] text-left text-sm sm:text-base tracking-wider overflow-x-auto whitespace-nowrap text-[#1a291a] pt-1.5 font-bold flex items-center justify-start">
                <span>
                  {expression.slice(0, cursorPos)}
                  <span className="inline-block w-0.5 h-4 bg-[#1a291a] animate-pulse align-middle" />
                  {expression.slice(cursorPos)}
                </span>
                {!expression && <span className="opacity-25">0</span>}
              </div>

              {/* Main Result Display Line */}
              <div className="min-h-[38px] flex items-center justify-end text-end text-2xl sm:text-3xl font-black tracking-tight text-[#0f1b0f] font-mono overflow-x-auto whitespace-nowrap pt-1">
                {isFractionView && fractionString ? fractionString : result}
              </div>

              {/* Sub-status or Error */}
              {errorMsg && (
                <div className="text-[10px] text-rose-800 text-end font-bold animate-pulse">
                  [{errorMsg}]
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* TACTILE 3D KEYPAD AREA                                        */}
            {/* ============================================================= */}
            <div className="space-y-2.5">
              {/* --- Row 1: SHIFT, ALPHA, REPLAY D-PAD, MODE, ON --- */}
              <div className="grid grid-cols-5 items-center gap-1.5 pb-1">
                {/* SHIFT KEY */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-amber-400 mb-0.5 tracking-wider">
                    SHIFT
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsShift((p) => !p);
                      setIsAlpha(false);
                    }}
                    className={`w-full h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center border-t border-white/20 border-b-2 border-black/80 ${
                      isShift
                        ? "bg-amber-500 text-black shadow-inner translate-y-0.5"
                        : "bg-gradient-to-b from-[#3a3f47] to-[#282c34] text-amber-300 shadow-[0_3px_0_#15171b,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none"
                    }`}
                  >
                    Shift
                  </button>
                </div>

                {/* ALPHA KEY */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-rose-400 mb-0.5 tracking-wider">
                    ALPHA
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsAlpha((p) => !p);
                      setIsShift(false);
                    }}
                    className={`w-full h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center border-t border-white/20 border-b-2 border-black/80 ${
                      isAlpha
                        ? "bg-rose-500 text-white shadow-inner translate-y-0.5"
                        : "bg-gradient-to-b from-[#3a3f47] to-[#282c34] text-rose-300 shadow-[0_3px_0_#15171b,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none"
                    }`}
                  >
                    Alpha
                  </button>
                </div>

                {/* CIRCULAR REPLAY D-PAD (CENTER CONTROLLER) */}
                <div className="flex justify-center -mt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2d313a] to-[#181a1f] border-2 border-white/10 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.15)] grid grid-cols-3 grid-rows-3 items-center justify-items-center p-1 relative">
                    <button
                      type="button"
                      onClick={navigateHistoryUp}
                      className="col-start-2 row-start-1 text-slate-300 hover:text-teal-400 active:scale-90 transition-transform"
                      title="السابق في السجل"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={moveCursorLeft}
                      className="col-start-1 row-start-2 text-slate-300 hover:text-teal-400 active:scale-90 transition-transform"
                      title="تحريك المؤشر يساراً"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="col-start-2 row-start-2 w-3.5 h-3.5 rounded-full bg-[#121417] border border-white/10 shadow-inner" />
                    <button
                      type="button"
                      onClick={moveCursorRight}
                      className="col-start-3 row-start-2 text-slate-300 hover:text-teal-400 active:scale-90 transition-transform"
                      title="تحريك المؤشر يميناً"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={navigateHistoryDown}
                      className="col-start-2 row-start-3 text-slate-300 hover:text-teal-400 active:scale-90 transition-transform"
                      title="التالي في السجل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* MODE / SETUP KEY (DEG/RAD TOGGLE) */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-amber-400 mb-0.5 tracking-wider">
                    {angleMode === "deg" ? "SETUP:RAD" : "SETUP:DEG"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setAngleMode((prev) => (prev === "deg" ? "rad" : "deg"));
                    }}
                    className="w-full h-8 rounded-lg bg-gradient-to-b from-[#3a3f47] to-[#282c34] text-slate-200 border-t border-white/20 border-b-2 border-black/80 shadow-[0_3px_0_#15171b,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none font-bold text-[11px] flex items-center justify-center"
                  >
                    MODE
                  </button>
                </div>

                {/* ON / AC RESET KEY */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                    PWR
                  </span>
                  <button
                    type="button"
                    onClick={handleAllClear}
                    className="w-full h-8 rounded-lg bg-gradient-to-b from-[#3a3f47] to-[#282c34] text-slate-200 border-t border-white/20 border-b-2 border-black/80 shadow-[0_3px_0_#15171b,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none font-bold text-xs flex items-center justify-center"
                  >
                    ON
                  </button>
                </div>
              </div>

              {/* --- Function Row 2: Fraction, Sqrt, x², x^y, log, ln --- */}
              <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
                {/* S<=>D / Fraction */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">a b/c</span>
                  <button
                    type="button"
                    onClick={toggleFractionDecimal}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                    title="تحويل كسر إلى عشري والعكس"
                  >
                    S⇔D
                  </button>
                </div>

                {/* Sqrt / Cbrt */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">∛</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "cbrt(" : "sqrt(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    √□
                  </button>
                </div>

                {/* x² */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">x³</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "^3" : "^2")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    x²
                  </button>
                </div>

                {/* x^y */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">ʸ√x</span>
                  <button
                    type="button"
                    onClick={() => insertText("^")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    x^□
                  </button>
                </div>

                {/* log */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">10ˣ</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "10^(" : "log(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    log
                  </button>
                </div>

                {/* ln */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">eˣ</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "e^(" : "ln(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    ln
                  </button>
                </div>
              </div>

              {/* --- Function Row 3: (-), sin, cos, tan, (, ) --- */}
              <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
                {/* (-) */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">abs</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "abs(" : "(-")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    (-)
                  </button>
                </div>

                {/* sin */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">sin⁻¹</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "asin(" : "sin(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    sin
                  </button>
                </div>

                {/* cos */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">cos⁻¹</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "acos(" : "cos(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    cos
                  </button>
                </div>

                {/* tan */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">tan⁻¹</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "atan(" : "tan(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    tan
                  </button>
                </div>

                {/* ( */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-rose-400 font-bold">X</span>
                  <button
                    type="button"
                    onClick={() => insertText("(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    (
                  </button>
                </div>

                {/* ) */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-rose-400 font-bold">Y</span>
                  <button
                    type="button"
                    onClick={() => insertText(")")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold"
                  >
                    )
                  </button>
                </div>
              </div>

              {/* --- Function Row 4: nCr, nPr, STO, M+, MC, MR --- */}
              <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">n!</span>
                  <button
                    type="button"
                    onClick={() => insertText(isShift ? "factorial(" : "nCr(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                    title="التوفيقات nCr"
                  >
                    nCr
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">P</span>
                  <button
                    type="button"
                    onClick={() => insertText("nPr(")}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                    title="الترتيبات nPr"
                  >
                    nPr
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">RCL</span>
                  <button
                    type="button"
                    onClick={handleMemoryRecall}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    MR
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">STO</span>
                  <button
                    type="button"
                    onClick={handleMemoryStore}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    MS
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">M-</span>
                  <button
                    type="button"
                    onClick={handleMemoryAdd}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    M+
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-amber-400 font-bold">CLR</span>
                  <button
                    type="button"
                    onClick={handleMemoryClear}
                    className="w-full h-7 rounded-lg bg-gradient-to-b from-[#383d46] to-[#24272e] text-slate-200 border-t border-white/15 border-b-2 border-black shadow-[0_2.5px_0_#121417] active:translate-y-0.5 active:shadow-none font-bold text-[10px]"
                  >
                    MC
                  </button>
                </div>
              </div>

              {/* =========================================================== */}
              {/* PRIMARY NUMPAD & OPERATOR BLOCKS (3D TACTILE KEYS)           */}
              {/* =========================================================== */}
              <div className="pt-1.5 space-y-2">
                {/* Row 1: 7, 8, 9, DEL, AC */}
                <div className="grid grid-cols-5 gap-2 text-base font-mono">
                  <button
                    type="button"
                    onClick={() => insertText("7")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    7
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("8")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    8
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("9")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    9
                  </button>
                  {/* DEL (Warm Red Plastic) */}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#e0584b] to-[#b33327] text-white font-black text-sm border-t border-white/30 border-b-3 border-[#731911] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    DEL
                  </button>
                  {/* AC (Warm Orange/Red) */}
                  <button
                    type="button"
                    onClick={handleAllClear}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#d8483b] to-[#ab281c] text-white font-black text-sm border-t border-white/30 border-b-3 border-[#6b140c] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    AC
                  </button>
                </div>

                {/* Row 2: 4, 5, 6, ×, ÷ */}
                <div className="grid grid-cols-5 gap-2 text-base font-mono">
                  <button
                    type="button"
                    onClick={() => insertText("4")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    4
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("5")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    5
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("6")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    6
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("×")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-lg border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("÷")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-lg border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    ÷
                  </button>
                </div>

                {/* Row 3: 1, 2, 3, +, - */}
                <div className="grid grid-cols-5 gap-2 text-base font-mono">
                  <button
                    type="button"
                    onClick={() => insertText("1")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("2")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("3")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("+")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-lg border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("-")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-lg border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    -
                  </button>
                </div>

                {/* Row 4: 0, ., ×10ˣ (π), Ans (e), = */}
                <div className="grid grid-cols-5 gap-2 text-base font-mono">
                  <button
                    type="button"
                    onClick={() => insertText("0")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText(".")}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#eef2f6] to-[#d1d7e0] text-[#1c222b] font-black border-t border-white border-b-3 border-[#95a0af] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    .
                  </button>
                  {/* ×10ˣ or π with Shift */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-amber-400 font-bold -mt-3.5 mb-0.5">π</span>
                    <button
                      type="button"
                      onClick={() => insertText(isShift ? "π" : "*10^(")}
                      className="w-full h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-xs border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                    >
                      {isShift ? "π" : "×10ˣ"}
                    </button>
                  </div>
                  {/* Ans or e with Shift */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-amber-400 font-bold -mt-3.5 mb-0.5">e</span>
                    <button
                      type="button"
                      onClick={() => insertText(isShift ? "e" : "Ans")}
                      className="w-full h-11 rounded-xl bg-gradient-to-b from-[#3a3f4a] to-[#252830] text-slate-100 font-black text-xs border-t border-white/20 border-b-3 border-[#101216] shadow-[0_4px_0_#0f1216,0_6px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                    >
                      {isShift ? "e" : "Ans"}
                    </button>
                  </div>
                  {/* EQUALS KEY (Bold Tactile Finish) */}
                  <button
                    type="button"
                    onClick={calculateResult}
                    className="h-11 rounded-xl bg-gradient-to-b from-[#2b7264] to-[#1c4d43] text-emerald-200 font-black text-2xl border-t border-emerald-400/40 border-b-3 border-[#0f2d27] shadow-[0_4px_0_#0a1f1b,0_6px_10px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    =
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COMPANION SIDE PANEL: BAC CONSTANTS & CALCULATION TAPE            */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* BAC Physical Constants Drawer */}
          <div className="p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Atom className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>ثوابت البكالوريا الرسمية (فيزياء وكيمياء)</span>
            </div>
            <p className="text-xs text-theme-muted">
              اضغط على أي ثابت لإدراجه فوراً في شاشة الآلة الحاسبة:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {BAC_CONSTANTS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertText(c.val)}
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

          {/* Quick Real Calculator Guide */}
          <div className="p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>دليل اختصارات Casio المحترفة</span>
            </div>
            <div className="text-xs text-theme-secondary space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  SHIFT
                </span>
                <span>
                  يفعّل الدوال العكسية باللون الأصفر: sin⁻¹، cos⁻¹، tan⁻¹، ∛x، π، e.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold font-mono text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  S⇔D
                </span>
                <span>يحول النتيجة بين كسر مضبوط وعدد عشري بدقة تامة.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold font-mono text-slate-400 bg-card-muted px-1.5 py-0.5 rounded">
                  D-PAD
                </span>
                <span>القرص الدائري في الوسط للتنقل في السجل وتحريك المؤشر لتعديل المعادلة.</span>
              </div>
            </div>
          </div>

          {/* Calculation History Tape */}
          <div className="p-5 rounded-3xl bg-card border border-theme shadow-clay space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
                <History className="w-4 h-4 text-[var(--color-primary)]" />
                <span>سجل العمليات الحسابية</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  مسح
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-theme-muted">
                لا توجد عمليات سابقة بعد.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setExpression(item.result);
                      setCursorPos(item.result.length);
                      setResult(item.result);
                    }}
                    className="p-2.5 rounded-2xl bg-card-muted/60 border border-theme hover:border-[var(--color-primary)] cursor-pointer transition-all text-xs font-mono"
                    title="اضغط لاستعادة النتيجة في شاشة الحاسبة"
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
