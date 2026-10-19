import React from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Power,
  RotateCcw,
  Delete,
  Settings,
  Layers,
} from "lucide-react";

interface NumWorksKeypadProps {
  onKeyPress: (key: string) => void;
  isShiftActive?: boolean;
  isAlphaActive?: boolean;
}

export function NumWorksKeypad({
  onKeyPress,
  isShiftActive = false,
  isAlphaActive = false,
}: NumWorksKeypadProps) {
  return (
    <div className="w-full flex flex-col gap-3.5 select-none pt-2">
      {/* ========================================================= */}
      {/* 1. ZONE DE NAVIGATION (Directional D-pad, Home, OK, Back) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 items-center gap-2 px-1">
        {/* Left: Directional D-Pad (Up, Down, Left, Right) */}
        <div className="flex justify-center items-center">
          <div className="relative w-20 h-20 bg-slate-300 dark:bg-slate-700/60 rounded-full p-1 shadow-inner flex items-center justify-center">
            {/* Up */}
            <button
              type="button"
              onClick={() => onKeyPress("ArrowUp")}
              title="Haut / Up"
              aria-label="Flèche haut"
              className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-900 active:scale-95 text-white rounded-t-md flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            {/* Down */}
            <button
              type="button"
              onClick={() => onKeyPress("ArrowDown")}
              title="Bas / Down"
              aria-label="Flèche bas"
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-900 active:scale-95 text-white rounded-b-md flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {/* Left */}
            <button
              type="button"
              onClick={() => onKeyPress("ArrowLeft")}
              title="Gauche / Left"
              aria-label="Flèche gauche"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-900 active:scale-95 text-white rounded-l-md flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Right */}
            <button
              type="button"
              onClick={() => onKeyPress("ArrowRight")}
              title="Droite / Right"
              aria-label="Flèche droite"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-900 active:scale-95 text-white rounded-r-md flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Center disc */}
            <div className="w-5 h-5 rounded-full bg-slate-400 dark:bg-slate-600 shadow-inner" />
          </div>
        </div>

        {/* Center: Yellow Home button + Small Power button */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("Home")}
            title="Accueil / Home (Touche Jaune)"
            aria-label="Touche Maison Home"
            className="w-12 h-10 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 hover:brightness-105 transition-all cursor-pointer"
            style={{ backgroundColor: "#FFB703", color: "#0F172A" }}
          >
            <Home className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-wider">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("Power")}
            title="Marche / Arrêt (Power)"
            aria-label="Touche Power"
            className="w-7 h-5 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-black active:scale-95 text-slate-300 flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <Power className="w-3 h-3 text-red-400" />
          </button>
        </div>

        {/* Right: OK button (circular) + Back (↩) button */}
        <div className="flex items-center justify-center gap-2">
          {/* Back ↩ */}
          <button
            type="button"
            onClick={() => onKeyPress("Back")}
            title="Retour / Back (↩)"
            aria-label="Touche Retour Back"
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 active:bg-slate-900 active:scale-95 text-white flex flex-col items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[8px] font-bold">Back</span>
          </button>

          {/* OK */}
          <button
            type="button"
            onClick={() => onKeyPress("Enter")}
            title="Valider / OK"
            aria-label="Touche OK"
            className="w-12 h-12 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-white flex items-center justify-center font-black text-sm shadow-lg ring-2 ring-slate-400/30 transition-all cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ZONE DES FONCTIONS SCIENTIFIQUES ET VARIABLES (4 rangées) */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-1.5 pt-1">
        {/* Ligne 1: shift, alpha, x,n,t, var, toolbox (قوالب), ⌫ */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("Shift")}
            title="Shift (2nde)"
            className={`h-9 rounded-lg font-bold text-[11px] flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              isShiftActive
                ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300"
                : "bg-slate-800 hover:bg-slate-700 text-[#FF9F1C] active:scale-95"
            }`}
          >
            shift
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("Alpha")}
            title="Alpha (lettres)"
            className={`h-9 rounded-lg font-bold text-[11px] flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              isAlphaActive
                ? "bg-cyan-500 text-slate-950 ring-2 ring-cyan-300"
                : "bg-slate-800 hover:bg-slate-700 text-cyan-300 active:scale-95"
            }`}
          >
            alpha
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("x")}
            title="Variable x, n, t"
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer italic"
          >
            x,n,t
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("var")}
            title="Variables"
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-[11px] flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            var
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("toolbox")}
            title="Boîte à outils / القوالب"
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onKeyPress("Backspace")}
            title="Effacer / Backspace (⌫)"
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-300 text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Ligne 2: e^x, ln, log, i, ,, x^y */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("exp(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            e<sup>x</sup>
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("ln(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            ln
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("log(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            log
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("i")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer italic"
          >
            i
          </button>
          <button
            type="button"
            onClick={() => onKeyPress(",")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer font-bold"
          >
            ,
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("^")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            x<sup>y</sup>
          </button>
        </div>

        {/* Ligne 3: sin, cos, tan, π, √, x^2 */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("sin(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            sin
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("cos(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            cos
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("tan(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            tan
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("π")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-serif text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            π
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("√(")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            √
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("²")}
            className="h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            x²
          </button>
        </div>

        {/* Ligne 4: 7, 8, 9 avec les parenthèses ( ) à droite */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("7")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("8")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("9")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("(")}
            className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            (
          </button>
          <button
            type="button"
            onClick={() => onKeyPress(")")}
            className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            )
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ZONE DES CHIFFRES ET OPERATIONS DE BASE (3 rangées x 5) */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-1.5">
        {/* Ligne 5: 4, 5, 6, ×, ÷ */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("4")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("5")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("6")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("×")}
            className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-amber-300 font-bold text-base flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("÷")}
            className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-amber-300 font-bold text-base flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            ÷
          </button>
        </div>

        {/* Ligne 6: 1, 2, 3, +, - */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("1")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("2")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("3")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("+")}
            className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-base flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("-")}
            className="h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-base flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            -
          </button>
        </div>

        {/* Ligne 7: 0, ., ×10^x, Ans, EXE */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => onKeyPress("0")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => onKeyPress(".")}
            className="h-10 rounded-xl bg-white dark:bg-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            .
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("×10^")}
            className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-[11px] flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            ×10<sup>x</sup>
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("Ans")}
            className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
          >
            Ans
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("EXE")}
            title="Exécuter (EXE)"
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-95 text-white font-black text-xs tracking-wider flex items-center justify-center shadow-md transition-all cursor-pointer ring-1 ring-blue-300/30"
          >
            EXE
          </button>
        </div>
      </div>
    </div>
  );
}
