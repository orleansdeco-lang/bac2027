import React from "react";
import { NumWorksSettings } from "../types";
import { Sun, Check, RotateCcw } from "lucide-react";

interface ParametresViewProps {
  settings: NumWorksSettings;
  setSettings: React.Dispatch<React.SetStateAction<NumWorksSettings>>;
}

export function ParametresView({ settings, setSettings }: ParametresViewProps) {
  const handleReset = () => {
    setSettings({
      angleUnit: "rad",
      resultFormat: "exact",
      writingFormat: "natural",
      complexFormat: "real",
      brightness: 100,
      pythonFontSize: "small",
    });
  };

  return (
    <div className="w-full h-full p-2.5 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 select-none text-xs overflow-y-auto">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold px-0.5">
          <span>PARAMÈTRES SYSTÈME NUMWORKS</span>
          <span>Version 22.2</span>
        </div>

        {/* 1. Unité d'angle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold">Unité d&apos;angle</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {settings.angleUnit === "rad" ? "Radians (rad)" : "Degrés (deg)"}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, angleUnit: "rad" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.angleUnit === "rad"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Radians
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, angleUnit: "deg" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.angleUnit === "deg"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Degrés
            </button>
          </div>
        </div>

        {/* 2. Format résultat */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold">Format résultat</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Affichage des fractions et radicaux
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, resultFormat: "exact" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.resultFormat === "exact"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Exact
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, resultFormat: "decimal" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.resultFormat === "decimal"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Décimal
            </button>
          </div>
        </div>

        {/* 3. Format écriture */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold">Format écriture</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Style de saisie mathématique
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, writingFormat: "natural" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.writingFormat === "natural"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Naturelle
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, writingFormat: "linear" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.writingFormat === "linear"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Linéaire
            </button>
          </div>
        </div>

        {/* 4. Forme complexe */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold">Forme complexe</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Nombres imaginaires (i)
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, complexFormat: "real" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.complexFormat === "real"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Réel
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, complexFormat: "cartesian" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.complexFormat === "cartesian"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              a + ib
            </button>
          </div>
        </div>

        {/* 5. Luminosité */}
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Luminosité de l&apos;écran</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-amber-600">
              {settings.brightness}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={settings.brightness}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                brightness: Number(e.target.value) || 100,
              }))
            }
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* 6. Police Python */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold">Police Python</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Taille de police dans l&apos;éditeur
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, pythonFontSize: "large" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.pythonFontSize === "large"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Grande
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, pythonFontSize: "small" }))
              }
              className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer transition-all ${
                settings.pythonFontSize === "small"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Petite
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 text-[11px] rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Valeurs par défaut</span>
        </button>
      </div>
    </div>
  );
}
