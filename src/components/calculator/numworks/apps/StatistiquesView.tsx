import React, { useState, useRef, useEffect } from "react";
import { StatRow } from "../types";
import { Plus, Trash2, BarChart2, Table } from "lucide-react";

export function StatistiquesView() {
  const [activeTab, setActiveTab] = useState<"donnees" | "stats" | "graphique">("donnees");
  const [rows, setRows] = useState<StatRow[]>([
    { id: "1", val: 10, freq: 2 },
    { id: "2", val: 12, freq: 5 },
    { id: "3", val: 14, freq: 8 },
    { id: "4", val: 16, freq: 4 },
    { id: "5", val: 18, freq: 1 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAddRow = () => {
    const lastVal = rows.length > 0 ? rows[rows.length - 1].val + 2 : 10;
    setRows((prev) => [
      ...prev,
      { id: Math.random().toString(), val: lastVal, freq: 1 },
    ]);
  };

  const handleUpdate = (id: string, field: "val" | "freq", value: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDelete = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Calculations
  const totalCount = rows.reduce((acc, r) => acc + (r.freq || 0), 0);
  const sumWeighted = rows.reduce((acc, r) => acc + (r.val || 0) * (r.freq || 0), 0);
  const mean = totalCount > 0 ? sumWeighted / totalCount : 0;

  const sumSquares = rows.reduce(
    (acc, r) => acc + (r.freq || 0) * Math.pow((r.val || 0) - mean, 2),
    0
  );
  const variance = totalCount > 0 ? sumSquares / totalCount : 0;
  const stdDev = Math.sqrt(variance);

  // Sorted values for median and quartiles
  const expanded: number[] = [];
  rows.forEach((r) => {
    for (let i = 0; i < (r.freq || 0); i++) {
      expanded.push(r.val);
    }
  });
  expanded.sort((a, b) => a - b);

  const min = expanded.length > 0 ? expanded[0] : 0;
  const max = expanded.length > 0 ? expanded[expanded.length - 1] : 0;
  const median =
    expanded.length > 0
      ? expanded.length % 2 === 1
        ? expanded[Math.floor(expanded.length / 2)]
        : (expanded[expanded.length / 2 - 1] + expanded[expanded.length / 2]) / 2
      : 0;
  const q1 = expanded.length > 0 ? expanded[Math.floor(expanded.length * 0.25)] : 0;
  const q3 = expanded.length > 0 ? expanded[Math.floor(expanded.length * 0.75)] : 0;

  // Draw Histogram on Canvas
  useEffect(() => {
    if (activeTab !== "graphique") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    if (rows.length === 0) return;

    const maxFreq = Math.max(...rows.map((r) => r.freq), 1);
    const padX = 30;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Draw baseline
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.stroke();

    const barW = Math.min(36, chartW / rows.length - 8);
    const spacing = chartW / rows.length;

    rows.forEach((row, i) => {
      const barH = (row.freq / maxFreq) * chartH;
      const x = padX + i * spacing + (spacing - barW) / 2;
      const y = height - padY - barH;

      // Bar fill & stroke
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = "#6D28D9";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barW, barH);

      // Frequency label on top of bar
      ctx.fillStyle = "#4C1D95";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(row.freq), x + barW / 2, y - 4);

      // Value label below axis
      ctx.fillStyle = "#1E293B";
      ctx.font = "9px monospace";
      ctx.fillText(String(row.val), x + barW / 2, height - padY + 12);
    });

    // Histogram Title
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Histogramme des effectifs (N1 en fonction de V1)", padX, 14);
  }, [activeTab, rows]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-50 dark:bg-slate-900 select-none text-xs overflow-hidden">
      {/* 3 Sub-tabs */}
      <div className="grid grid-cols-3 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("donnees")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "donnees"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Données (V1/N1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "stats"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Statistiques
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("graphique")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "graphique"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Histogramme
        </button>
      </div>

      {/* Tab 1: Données */}
      {activeTab === "donnees" && (
        <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-auto rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full text-[11px] font-mono border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-1 px-2 text-left font-black text-purple-600">
                    V1 (Valeurs)
                  </th>
                  <th className="py-1 px-2 text-right font-black text-blue-600">
                    N1 (Effectifs)
                  </th>
                  <th className="w-8 py-1 px-1"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <td className="py-1 px-2">
                      <input
                        type="number"
                        value={row.val}
                        onChange={(e) =>
                          handleUpdate(row.id, "val", Number(e.target.value) || 0)
                        }
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </td>
                    <td className="py-1 px-2 text-right">
                      <input
                        type="number"
                        value={row.freq}
                        onChange={(e) =>
                          handleUpdate(row.id, "freq", Number(e.target.value) || 0)
                        }
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none text-right"
                      />
                    </td>
                    <td className="py-1 px-1 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer text-[11px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>
            <span className="text-[10px] font-mono text-slate-500">
              Total N = {totalCount}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Statistiques calculées */}
      {activeTab === "stats" && (
        <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 font-sans block">Effectif total (N)</span>
              <span className="text-sm font-black text-purple-600">{totalCount}</span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 font-sans block">Moyenne (x̄)</span>
              <span className="text-sm font-black text-blue-600">{mean.toFixed(3)}</span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 font-sans block">Variance (V)</span>
              <span className="text-sm font-black text-emerald-600">{variance.toFixed(3)}</span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 font-sans block">Écart-type (σ)</span>
              <span className="text-sm font-black text-emerald-600">{stdDev.toFixed(3)}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5">
              <span className="text-slate-500 font-sans">Minimum</span>
              <span className="font-bold">{min}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5">
              <span className="text-slate-500 font-sans">1er Quartile (Q1)</span>
              <span className="font-bold">{q1}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5">
              <span className="text-slate-500 font-sans">Médiane (Med)</span>
              <span className="font-bold text-purple-600">{median}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5">
              <span className="text-slate-500 font-sans">3ème Quartile (Q3)</span>
              <span className="font-bold">{q3}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Maximum</span>
              <span className="font-bold">{max}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Histogramme Canvas */}
      {activeTab === "graphique" && (
        <div className="flex-1 flex flex-col items-center justify-center p-1 bg-white relative">
          <canvas
            ref={canvasRef}
            width={340}
            height={200}
            className="w-full h-full block"
          />
        </div>
      )}
    </div>
  );
}
