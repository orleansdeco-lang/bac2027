import React, { useRef, useEffect } from "react";
import { CalculationHistoryItem, AngleUnit, ResultFormat } from "../types";
import { evaluateExpression } from "../math-engine";
import { RotateCcw, Copy, Check, ArrowRight } from "lucide-react";

interface CalculsViewProps {
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  history: CalculationHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<CalculationHistoryItem[]>>;
  angleUnit: AngleUnit;
  resultFormat: ResultFormat;
  ansValue: string;
  setAnsValue: React.Dispatch<React.SetStateAction<string>>;
  onExecute: () => void;
}

export function CalculsView({
  expression,
  setExpression,
  history,
  setHistory,
  angleUnit,
  resultFormat,
  ansValue,
  setAnsValue,
  onExecute,
}: CalculsViewProps) {
  const historyEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCopyResult = (val: string, id: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSelectHistory = (item: CalculationHistoryItem) => {
    setExpression(item.expression);
  };

  // Preview live evaluation for feedback
  const liveEval = expression.trim()
    ? evaluateExpression(expression, angleUnit, ansValue)
    : null;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono select-none overflow-hidden text-xs">
      {/* History scroll list */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center gap-1.5 p-4">
            <span className="text-xl">12 × 3 = 36</span>
            <p className="text-[11px] font-sans">
              Entrez un calcul mathématique et appuyez sur <span className="font-bold text-blue-500 font-mono">[EXE]</span>.
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              Définit les fractions exactes, trigonométrie ({angleUnit}), puissances et racines.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold truncate">{item.expression}</span>
                <span className="text-[9px] text-slate-400">{item.timestamp}</span>
              </div>

              <div className="flex items-baseline justify-end gap-2 mt-1">
                {/* Exact representation if differs from decimal */}
                {item.exactResult !== item.decimalResult && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                    {item.exactResult}
                  </span>
                )}
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  = {item.decimalResult}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyResult(item.decimalResult, item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                  title="Copier le résultat"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={historyEndRef} />
      </div>

      {/* Input bar and live preview */}
      <div className="p-2 bg-slate-100 dark:bg-slate-800/95 border-t border-slate-200 dark:border-slate-700">
        {/* Live preview */}
        {liveEval && !liveEval.error && expression.trim() && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1 mb-1 font-sans">
            <span className="text-blue-600 dark:text-blue-400 font-bold">Aperçu direct:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              ≈ {liveEval.exact !== liveEval.decimal ? `${liveEval.exact} = ` : ""}
              {liveEval.decimal}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 shadow-inner">
          <span className="text-blue-600 font-black text-sm">▶</span>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onExecute();
              }
            }}
            placeholder="2sin(π/3) + 3/4..."
            className="flex-1 bg-transparent border-none outline-none font-mono text-sm font-bold text-slate-900 dark:text-white"
          />
          {expression && (
            <button
              type="button"
              onClick={() => setExpression("")}
              className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
