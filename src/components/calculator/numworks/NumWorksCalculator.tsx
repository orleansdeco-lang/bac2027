"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export function NumWorksCalculator() {
  const [currentApp, setCurrentApp] = useState<NumWorksAppId>("home");
  const [homeSelectedIndex, setHomeSelectedIndex] = useState(0);
  const [isPoweredOn, setIsPoweredOn] = useState(true);

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

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when focusing other inputs outside calculator
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
  }, [handleKeyPress]);

  return (
    <div className="w-full flex justify-center py-4 select-none">
      {/* ======================================================== */}
      {/* AUTHENTIC NUMWORKS RECTANGULAR CASING                     */}
      {/* ======================================================== */}
      <div className="w-full max-w-[390px] sm:max-w-[410px] bg-[#F1F3F5] dark:bg-[#1E293B] border-2 border-slate-300 dark:border-slate-700 rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-3.5 sm:p-5 flex flex-col gap-3 transition-all relative">
        {/* Subtle hardware highlights / beveled edge */}
        <div className="absolute inset-0 rounded-[32px] sm:rounded-[36px] pointer-events-none ring-1 ring-white/60 dark:ring-white/10" />

        {/* Brand Header */}
        <div className="flex items-center justify-center pt-1 pb-0.5">
          <span className="font-sans font-black tracking-[0.28em] text-slate-700 dark:text-slate-300 text-xs uppercase opacity-90 drop-shadow-xs">
            NUMWORKS
          </span>
        </div>

        {/* LCD Screen Display */}
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
        />

        {/* 3-Zone Tactile Keypad */}
        <NumWorksKeypad
          onKeyPress={handleKeyPress}
          isShiftActive={isShiftActive}
          isAlphaActive={isAlphaActive}
        />

        {/* Bottom micro branding or model */}
        <div className="text-center pt-1">
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            N0120 Graphing Engine
          </span>
        </div>
      </div>
    </div>
  );
}
