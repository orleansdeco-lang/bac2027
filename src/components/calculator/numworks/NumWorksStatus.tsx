import React from "react";
import { AngleUnit, NumWorksAppId } from "./types";
import { Battery, BatteryCharging } from "lucide-react";

interface NumWorksStatusProps {
  appId: NumWorksAppId;
  angleUnit: AngleUnit;
  isShiftActive?: boolean;
  isAlphaActive?: boolean;
}

const APP_TITLES: Record<NumWorksAppId, string> = {
  home: "APPLICATIONS",
  calculs: "CALCULS",
  grapheur: "GRAPHEUR",
  python: "PYTHON",
  statistiques: "STATISTIQUES",
  probabilites: "PROBABILITÉS",
  equations: "ÉQUATIONS",
  parametres: "PARAMÈTRES",
};

export function NumWorksStatus({
  appId,
  angleUnit,
  isShiftActive = false,
  isAlphaActive = false,
}: NumWorksStatusProps) {
  const currentTitle = APP_TITLES[appId] || "NUMWORKS";

  return (
    <div
      className="w-full h-6 px-2.5 flex items-center justify-between text-slate-900 font-sans select-none shrink-0"
      style={{ backgroundColor: "#FFB703" }}
    >
      {/* Left side: Angle unit and modifiers */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight">
        <span className="uppercase px-1 py-0.5 rounded bg-black/10 text-slate-950 font-mono text-[9px] leading-none">
          {angleUnit}
        </span>
        {isShiftActive && (
          <span className="px-1 py-0.5 rounded bg-amber-700 text-white font-mono text-[8px] font-black leading-none animate-pulse">
            SHIFT
          </span>
        )}
        {isAlphaActive && (
          <span className="px-1 py-0.5 rounded bg-cyan-700 text-white font-mono text-[8px] font-black leading-none animate-pulse">
            ALPHA
          </span>
        )}
      </div>

      {/* Center: Current active app title */}
      <div className="text-[11px] sm:text-xs font-black tracking-widest uppercase font-mono truncate max-w-[170px] text-center text-slate-950">
        {currentTitle}
      </div>

      {/* Right side: Battery Indicator */}
      <div className="flex items-center gap-1 text-[10px] font-bold">
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-2.5 border border-slate-950 rounded-[2px] p-[1px] flex items-center">
            <div className="h-full w-full bg-slate-950 rounded-[1px]" />
          </div>
          <div className="w-[1.5px] h-1.5 bg-slate-950 rounded-r-xs" />
        </div>
      </div>
    </div>
  );
}
