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
  Layers,
} from "lucide-react";

interface NumWorksKeypadProps {
  onKeyPress: (key: string) => void;
  isShiftActive?: boolean;
  isAlphaActive?: boolean;
  isCompact?: boolean;
}

export function NumWorksKeypad({
  onKeyPress,
  isShiftActive = false,
  isAlphaActive = false,
  isCompact = false,
}: NumWorksKeypadProps) {
  // Trigger haptic vibration feedback on touch devices if available
  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
        window.navigator.vibrate(8);
      }
    } catch {
      // Ignore vibration errors
    }
  };

  const handleKey = (key: string) => {
    triggerHaptic();
    onKeyPress(key);
  };

  return (
    <div className={`w-full flex flex-col select-none ${isCompact ? "gap-2.5 pt-1" : "gap-3.5 pt-2"}`}>
      {/* ========================================================= */}
      {/* 1. ZONE DE NAVIGATION (Authentic D-Pad, Home, OK, Back)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 items-center gap-2 px-1">
        {/* Left: Directional D-Pad (Sculpted cross controller) */}
        <div className="flex justify-center items-center">
          <div className="relative w-[78px] h-[78px] bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.8)] border border-slate-300 dark:border-slate-700/60 flex items-center justify-center">
            {/* Up arrow */}
            <button
              type="button"
              onClick={() => handleKey("ArrowUp")}
              title="Haut / Up"
              aria-label="Flèche haut"
              className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#333842] hover:bg-[#3E4451] active:translate-y-[1px] active:bg-[#21252B] text-slate-200 rounded-t-md flex items-center justify-center shadow-[0_2px_0_#1E2227,0_3px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer border-t border-white/20"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            {/* Down arrow */}
            <button
              type="button"
              onClick={() => handleKey("ArrowDown")}
              title="Bas / Down"
              aria-label="Flèche bas"
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#333842] hover:bg-[#3E4451] active:translate-y-[1px] active:bg-[#21252B] text-slate-200 rounded-b-md flex items-center justify-center shadow-[0_2px_0_#1E2227,0_3px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer border-b border-black/30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {/* Left arrow */}
            <button
              type="button"
              onClick={() => handleKey("ArrowLeft")}
              title="Gauche / Left"
              aria-label="Flèche gauche"
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#333842] hover:bg-[#3E4451] active:translate-x-[-1px] active:bg-[#21252B] text-slate-200 rounded-l-md flex items-center justify-center shadow-[0_2px_0_#1E2227,0_3px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer border-l border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Right arrow */}
            <button
              type="button"
              onClick={() => handleKey("ArrowRight")}
              title="Droite / Right"
              aria-label="Flèche droite"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#333842] hover:bg-[#3E4451] active:translate-x-[1px] active:bg-[#21252B] text-slate-200 rounded-r-md flex items-center justify-center shadow-[0_2px_0_#1E2227,0_3px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer border-r border-black/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Center disc indent */}
            <div className="w-5 h-5 rounded-full bg-[#CBD5E1] dark:bg-[#0F172A] shadow-inner border border-black/10" />
          </div>
        </div>

        {/* Center: Yellow Home button + Sculpted Power button */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          {/* Home button (NumWorks Yellow #FFB703) */}
          <button
            type="button"
            onClick={() => handleKey("Home")}
            title="Accueil / Home (Touche Jaune)"
            aria-label="Touche Maison Home"
            className="w-13 h-10 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 border-t border-amber-200/60 shadow-[0_3px_0_#D97706,0_4px_6px_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#D97706] transition-all cursor-pointer"
            style={{ backgroundColor: "#FFB703", color: "#0F172A" }}
          >
            <Home className="w-4 h-4 drop-shadow-xs" />
            <span className="text-[8px] font-black uppercase tracking-wider leading-none">Home</span>
          </button>

          {/* Discreet Power button */}
          <button
            type="button"
            onClick={() => handleKey("Power")}
            title="Marche / Arrêt (Power)"
            aria-label="Touche Power"
            className="w-8 h-4 rounded-full bg-[#21252B] hover:bg-[#2C313A] active:translate-y-[1px] text-slate-300 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-white/5 transition-all cursor-pointer"
          >
            <Power className="w-2.5 h-2.5 text-rose-400" />
          </button>
        </div>

        {/* Right: Circular Back button + Concave OK button */}
        <div className="flex items-center justify-center gap-2">
          {/* Back ↩ */}
          <button
            type="button"
            onClick={() => handleKey("Back")}
            title="Retour / Back (↩)"
            aria-label="Touche Retour Back"
            className="w-10 h-10 rounded-full bg-[#333842] hover:bg-[#3E4451] active:translate-y-[2px] active:shadow-[0_1px_0_#1E2227] text-white flex flex-col items-center justify-center shadow-[0_3px_0_#1E2227,0_4px_6px_rgba(0,0,0,0.25)] border-t border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[7.5px] font-bold uppercase tracking-tighter">Back</span>
          </button>

          {/* OK Concave button */}
          <button
            type="button"
            onClick={() => handleKey("Enter")}
            title="Valider / OK"
            aria-label="Touche OK"
            className="w-12 h-12 rounded-full bg-[#181A1F] hover:bg-[#21252B] active:translate-y-[2px] active:shadow-[0_1px_0_#0C0D10] text-white flex items-center justify-center font-black text-sm shadow-[0_3.5px_0_#0C0D10,0_5px_8px_rgba(0,0,0,0.45)] border-t border-white/25 ring-1 ring-white/10 transition-all cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ZONE DES FONCTIONS SCIENTIFIQUES ET VARIABLES (4 rangées) */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        {/* Ligne 1: shift, alpha, x,n,t, var, toolbox, ⌫ */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("Shift")}
            title="Shift (2nde)"
            className={`h-9 rounded-lg font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer border-t ${
              isShiftActive
                ? "bg-[#FFB703] text-slate-950 ring-2 ring-amber-300 shadow-[0_1px_0_#D97706] translate-y-[2px]"
                : "bg-[#2A2E38] hover:bg-[#343946] text-[#FF9F1C] border-white/10 shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D]"
            }`}
          >
            shift
          </button>

          <button
            type="button"
            onClick={() => handleKey("Alpha")}
            title="Alpha (lettres)"
            className={`h-9 rounded-lg font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer border-t ${
              isAlphaActive
                ? "bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 shadow-[0_1px_0_#0891B2] translate-y-[2px]"
                : "bg-[#2A2E38] hover:bg-[#343946] text-cyan-300 border-white/10 shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D]"
            }`}
          >
            alpha
          </button>

          <button
            type="button"
            onClick={() => handleKey("x")}
            title="Variable x, n, t"
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono font-semibold text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer italic"
          >
            x,n,t
          </button>

          <button
            type="button"
            onClick={() => handleKey("var")}
            title="Variables"
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-slate-200 font-semibold text-[11px] flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            var
          </button>

          <button
            type="button"
            onClick={() => handleKey("toolbox")}
            title="Boîte à outils / القوالب"
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-slate-200 text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleKey("Backspace")}
            title="Effacer / Backspace (⌫)"
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-rose-300 text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Ligne 2: e^x, ln, log, i, ,, x^y */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("exp(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            e<sup>x</sup>
          </button>
          <button
            type="button"
            onClick={() => handleKey("ln(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            ln
          </button>
          <button
            type="button"
            onClick={() => handleKey("log(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            log
          </button>
          <button
            type="button"
            onClick={() => handleKey("i")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer italic"
          >
            i
          </button>
          <button
            type="button"
            onClick={() => handleKey(",")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-sm flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer font-bold"
          >
            ,
          </button>
          <button
            type="button"
            onClick={() => handleKey("^")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            x<sup>y</sup>
          </button>
        </div>

        {/* Ligne 3: sin, cos, tan, π, √, x^2 */}
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("sin(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            sin
          </button>
          <button
            type="button"
            onClick={() => handleKey("cos(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            cos
          </button>
          <button
            type="button"
            onClick={() => handleKey("tan(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            tan
          </button>
          <button
            type="button"
            onClick={() => handleKey("π")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-serif text-sm flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            π
          </button>
          <button
            type="button"
            onClick={() => handleKey("√(")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            √
          </button>
          <button
            type="button"
            onClick={() => handleKey("²")}
            className="h-9 rounded-lg bg-[#2A2E38] hover:bg-[#343946] text-white font-mono text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            x²
          </button>
        </div>

        {/* Ligne 4: 7, 8, 9 avec les parenthèses ( ) à droite */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("7")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleKey("8")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleKey("9")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleKey("(")}
            className="h-10 rounded-xl bg-[#2A2E38] hover:bg-[#343946] text-white font-mono font-bold text-sm flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            (
          </button>
          <button
            type="button"
            onClick={() => handleKey(")")}
            className="h-10 rounded-xl bg-[#2A2E38] hover:bg-[#343946] text-white font-mono font-bold text-sm flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
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
            onClick={() => handleKey("4")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleKey("5")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleKey("6")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleKey("×")}
            className="h-10 rounded-xl bg-[#3B4252] hover:bg-[#454D5F] text-[#FBBF24] font-black text-base flex items-center justify-center shadow-[0_3px_0_#222730,0_4px_6px_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#222730] border-t border-white/10 transition-all cursor-pointer"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => handleKey("÷")}
            className="h-10 rounded-xl bg-[#3B4252] hover:bg-[#454D5F] text-[#FBBF24] font-black text-base flex items-center justify-center shadow-[0_3px_0_#222730,0_4px_6px_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#222730] border-t border-white/10 transition-all cursor-pointer"
          >
            ÷
          </button>
        </div>

        {/* Ligne 6: 1, 2, 3, +, - */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("1")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleKey("2")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleKey("3")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleKey("+")}
            className="h-10 rounded-xl bg-[#3B4252] hover:bg-[#454D5F] text-white font-black text-base flex items-center justify-center shadow-[0_3px_0_#222730,0_4px_6px_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#222730] border-t border-white/10 transition-all cursor-pointer"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleKey("-")}
            className="h-10 rounded-xl bg-[#3B4252] hover:bg-[#454D5F] text-white font-black text-base flex items-center justify-center shadow-[0_3px_0_#222730,0_4px_6px_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#222730] border-t border-white/10 transition-all cursor-pointer"
          >
            -
          </button>
        </div>

        {/* Ligne 7: 0, ., ×10^x, Ans, EXE */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleKey("0")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKey(".")}
            className="h-10 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-black text-base flex items-center justify-center shadow-[0_3px_0_#CBD5E1,0_4px_6px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-[0_1px_0_#CBD5E1] border-t border-white transition-all cursor-pointer"
          >
            .
          </button>
          <button
            type="button"
            onClick={() => handleKey("×10^")}
            className="h-10 rounded-xl bg-[#2A2E38] hover:bg-[#343946] text-slate-200 font-semibold text-[11px] flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            ×10<sup>x</sup>
          </button>
          <button
            type="button"
            onClick={() => handleKey("Ans")}
            className="h-10 rounded-xl bg-[#2A2E38] hover:bg-[#343946] text-slate-200 font-semibold text-xs flex items-center justify-center shadow-[0_2.5px_0_#16181D,0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_#16181D] border-t border-white/10 transition-all cursor-pointer"
          >
            Ans
          </button>
          <button
            type="button"
            onClick={() => handleKey("EXE")}
            title="Exécuter (EXE)"
            className="h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs tracking-wider flex items-center justify-center shadow-[0_3px_0_#1E40AF,0_5px_8px_rgba(37,99,235,0.4)] active:translate-y-[2px] active:shadow-[0_1px_0_#1E40AF] border-t border-blue-400/30 transition-all cursor-pointer"
          >
            EXE
          </button>
        </div>
      </div>
    </div>
  );
}
