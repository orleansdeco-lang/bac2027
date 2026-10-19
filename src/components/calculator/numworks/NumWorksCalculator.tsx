"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  NumWorksAppId,
  NumWorksSettings,
  CalculationHistoryItem,
  GraphFunction,
} from "./types";
import { NumWorksScreen } from "./NumWorksScreen";
import { NumWorksKeypad } from "./NumWorksKeypad";
import { evaluateExpression } from "./math-engine";
import { APPS_LIST } from "./apps/HomeView";
import {
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Smartphone,
  Home,
  RotateCw,
} from "lucide-react";

export function NumWorksCalculator() {
  const [currentApp, setCurrentApp] = useState<NumWorksAppId>("home");
  const [homeSelectedIndex, setHomeSelectedIndex] = useState(0);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modifiers
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isAlphaActive, setIsAlphaActive] = useState(false);

  // Settings
  const [settings, setSettings] = useState<NumWorksSettings>({
    angleUnit: "rad",
    resultFormat: "exact",
    writingFormat: "natural",
    complexFormat: "real",
    brightness: 100,
    pythonFontSize: "small",
  });

  // Calculs App State
  const [expression, setExpression] = useState("");
  const [ansValue, setAnsValue] = useState("0");
  const [history, setHistory] = useState<CalculationHistoryItem[]>([
    {
      id: "h1",
      expression: "cos(π/3)",
      exactResult: "1/2",
      decimalResult: "0.5",
      timestamp: "10:00",
    },
    {
      id: "h2",
      expression: "2*e^1 + 3/4",
      exactResult: "2e + 3/4",
      decimalResult: "6.1865",
      timestamp: "10:02",
    },
  ]);

  // Grapheur App State
  const [functions, setFunctions] = useState<GraphFunction[]>([
    {
      id: "f1",
      name: "f(x)",
      rawExpr: "2*x^2 + 3*x - 1",
      color: "#2563EB",
      enabled: true,
    },
    {
      id: "f2",
      name: "g(x)",
      rawExpr: "cos(x)",
      color: "#DC2626",
      enabled: true,
    },
  ]);

  // Execute Calculs Expression
  const handleExecuteCalculs = useCallback(() => {
    if (!expression.trim()) return;

    const res = evaluateExpression(expression, settings.angleUnit, ansValue);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newItem: CalculationHistoryItem = {
      id: Math.random().toString(),
      expression: expression,
      exactResult: res.exact,
      decimalResult: res.decimal,
      timestamp: timeStr,
    };

    setHistory((prev) => [...prev, newItem]);
    if (!res.error && !isNaN(res.numeric)) {
      setAnsValue(res.decimal);
    }
    setExpression("");
  }, [expression, settings.angleUnit, ansValue]);

  // Keypad Action Handler
  const handleKeyPress = useCallback(
    (key: string) => {
      // 1. Power key
      if (key === "Power") {
        setIsPoweredOn((prev) => !prev);
        return;
      }

      if (!isPoweredOn) return;

      // 2. Home key
      if (key === "Home") {
        setCurrentApp("home");
        setIsShiftActive(false);
        setIsAlphaActive(false);
        return;
      }

      // 3. Back key
      if (key === "Back") {
        if (currentApp !== "home") {
          setCurrentApp("home");
        } else {
          setExpression((prev) => prev.slice(0, -1));
        }
        return;
      }

      // 4. Modifiers
      if (key === "Shift") {
        setIsShiftActive((prev) => !prev);
        return;
      }
      if (key === "Alpha") {
        setIsAlphaActive((prev) => !prev);
        return;
      }

      // 5. Navigation in Home Screen
      if (currentApp === "home") {
        if (key === "ArrowRight") {
          setHomeSelectedIndex((prev) => Math.min(APPS_LIST.length - 1, prev + 1));
          return;
        }
        if (key === "ArrowLeft") {
          setHomeSelectedIndex((prev) => Math.max(0, prev - 1));
          return;
        }
        if (key === "ArrowDown") {
          setHomeSelectedIndex((prev) =>
            prev + 3 < APPS_LIST.length ? prev + 3 : APPS_LIST.length - 1
          );
          return;
        }
        if (key === "ArrowUp") {
          setHomeSelectedIndex((prev) => Math.max(0, prev - 3));
          return;
        }
        if (key === "Enter" || key === "EXE") {
          const target = APPS_LIST[homeSelectedIndex];
          if (target) {
            setCurrentApp(target.id);
          }
          return;
        }
        return;
      }

      // 6. Navigation / Inputs in Calculs App
      if (currentApp === "calculs") {
        if (key === "Enter" || key === "EXE") {
          handleExecuteCalculs();
          return;
        }
        if (key === "Backspace") {
          setExpression((prev) => prev.slice(0, -1));
          return;
        }
        if (key === "toolbox") {
          setExpression((prev) => prev + "abs(");
          return;
        }
        if (key === "var") {
          setExpression((prev) => prev + "x");
          return;
        }

        // Standard characters input
        setExpression((prev) => prev + key);
        return;
      }

      // 7. Grapheur App inputs
      if (currentApp === "grapheur") {
        if (key === "x") {
          // Handled within input directly
        }
        return;
      }
    },
    [
      isPoweredOn,
      currentApp,
      homeSelectedIndex,
      handleExecuteCalculs,
      setExpression,
    ]
  );

  // Fullscreen Handler
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Attempt native fullscreen if supported
        try {
          if (
            typeof document !== "undefined" &&
            document.documentElement &&
            document.documentElement.requestFullscreen
          ) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // Ignore fullscreen permission rejections
        }
      } else {
        try {
          if (typeof document !== "undefined" && document.exitFullscreen) {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
          }
        } catch {
          // Ignore
        }
      }
      return nextState;
    });
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        return;
      }

      // Avoid intercepting inputs outside calculator
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleKeyPress("Home");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleKeyPress("Enter");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        handleKeyPress("Backspace");
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleKeyPress("ArrowUp");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleKeyPress("ArrowDown");
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleKeyPress("ArrowLeft");
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleKeyPress("ArrowRight");
        return;
      }

      // Math characters
      if (/[0-9+\-*/().,^]/.test(e.key)) {
        let mapped = e.key;
        if (mapped === "*") mapped = "×";
        if (mapped === "/") mapped = "÷";
        handleKeyPress(mapped);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, isFullscreen]);

  // Lock body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  /* ======================================================== */
  /* REALISTIC HARDWARE CHASSIS COMPONENT                     */
  /* ======================================================== */
  const renderHardwareDevice = (inFullscreen: boolean = false) => (
    <div
      className={`w-full bg-[#F5F5F7] dark:bg-[#1A1D24] border-2 border-[#D8DCE3] dark:border-[#2D333F] rounded-[36px] sm:rounded-[42px] p-3 sm:p-5 flex flex-col gap-3 transition-all relative select-none ${
        inFullscreen
          ? "max-w-[430px] my-auto shadow-[0_30px_90px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)]"
          : "max-w-[390px] sm:max-w-[415px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.06),inset_0_1.5px_0_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.06)]"
      }`}
    >
      {/* Precision Perimeter Chamfer Highlight */}
      <div className="absolute inset-0 rounded-[36px] sm:rounded-[42px] pointer-events-none ring-1 ring-white/70 dark:ring-white/10" />

      {/* Brand Header with Realistic Debossed Logo and Controls */}
      <div className="flex items-center justify-between pt-0.5 px-1 pb-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            N0120
          </span>
        </div>

        {/* Debossed NUMWORKS brand logo */}
        <span className="font-sans font-black tracking-[0.35em] text-[#475569] dark:text-[#94A3B8] text-xs sm:text-[13px] uppercase opacity-95 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
          NUMWORKS
        </span>

        {/* Fullscreen Trigger Pill (Quick launch) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={inFullscreen ? "تصغير / Quitter plein écran" : "تكبير ملء الشاشة / Plein écran"}
          className="p-1 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold"
        >
          {inFullscreen ? (
            <>
              <Minimize2 className="w-3 h-3" />
              <span className="hidden sm:inline">تصغير</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-[9px] font-mono font-black text-blue-600 dark:text-blue-400">
                Plein écran
              </span>
            </>
          )}
        </button>
      </div>

      {/* Photorealistic LCD Screen Display */}
      <NumWorksScreen
        currentApp={currentApp}
        setCurrentApp={setCurrentApp}
        homeSelectedIndex={homeSelectedIndex}
        settings={settings}
        setSettings={setSettings}
        expression={expression}
        setExpression={setExpression}
        history={history}
        setHistory={setHistory}
        ansValue={ansValue}
        setAnsValue={setAnsValue}
        functions={functions}
        setFunctions={setFunctions}
        isShiftActive={isShiftActive}
        isAlphaActive={isAlphaActive}
        onExecuteCalculs={handleExecuteCalculs}
        isPoweredOn={isPoweredOn}
        isFullscreen={inFullscreen}
      />

      {/* Authentic Tactile 3-Zone Keypad */}
      <NumWorksKeypad
        onKeyPress={handleKeyPress}
        isShiftActive={isShiftActive}
        isAlphaActive={isAlphaActive}
        isCompact={inFullscreen}
      />

      {/* Bottom Authenticity Label */}
      <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 pt-0.5">
        <span>EPSILON OS v22.2</span>
        <span>DESIGNED IN PARIS</span>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 select-none relative">
      {/* Top Mobile Fullscreen Action Bar */}
      <div className="w-full max-w-[415px] flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-theme-muted">
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-[11px]">تجربة هاتف حقيقية:</span>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>تكبير ملء الشاشة (Plein écran)</span>
        </button>
      </div>

      {/* Normal Inline Calculator */}
      <div className="w-full flex justify-center">{renderHardwareDevice(false)}</div>

      {/* ======================================================== */}
      {/* FULLSCREEN OVERLAY MODAL FOR SMARTPHONES & TABLETS       */}
      {/* ======================================================== */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          {/* Top Sticky Bar in Fullscreen */}
          <div className="w-full max-w-[440px] flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg text-white mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleKeyPress("Home")}
                title="Accueil / Home"
                className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs active:scale-95"
              >
                <Home className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    angleUnit: prev.angleUnit === "rad" ? "deg" : "rad",
                  }))
                }
                title="Changer l'unité d'angle"
                className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-amber-400 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>{settings.angleUnit.toUpperCase()}</span>
              </button>
            </div>

            <span className="text-xs font-black tracking-widest uppercase font-mono text-slate-300">
              NUMWORKS • PLEIN ÉCRAN
            </span>

            {/* Exit Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

          {/* Scaled Device Container */}
          <div className="w-full flex justify-center items-center flex-1 my-auto">
            {renderHardwareDevice(true)}
          </div>

          {/* Micro Helper Note */}
          <div className="text-[10px] text-slate-400 font-sans text-center py-1 shrink-0">
            اضغط زر [Home] الأصفر للعودة للتطبيقات • اضغط [خروج] أو Esc للعودة للموقع
          </div>
        </div>
      )}
    </div>
  );
}
