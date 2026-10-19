import React, { useState, useRef, useEffect, useCallback } from "react";
import { GraphFunction, AngleUnit } from "../types";
import { evalFunctionAt } from "../math-engine";
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Move,
} from "lucide-react";

interface GrapheurViewProps {
  functions: GraphFunction[];
  setFunctions: React.Dispatch<React.SetStateAction<GraphFunction[]>>;
  angleUnit: AngleUnit;
}

type GrapheurTab = "expressions" | "graphique" | "tableau";

export function GrapheurView({
  functions,
  setFunctions,
  angleUnit,
}: GrapheurViewProps) {
  const [activeTab, setActiveTab] = useState<GrapheurTab>("expressions");

  // Canvas Viewport State
  const [xRange, setXRange] = useState<{ min: number; max: number }>({
    min: -6,
    max: 6,
  });
  const [yRange, setYRange] = useState<{ min: number; max: number }>({
    min: -5,
    max: 10,
  });
  const [hoverCoord, setHoverCoord] = useState<{
    x: number;
    y: number;
    fnName: string;
  } | null>(null);

  // Table Configuration State
  const [tableConfig, setTableConfig] = useState({
    start: -5,
    end: 5,
    step: 1,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Add new function
  const handleAddFunction = () => {
    const letters = ["f", "g", "h", "p", "q"];
    const existingNames = functions.map((f) => f.name.charAt(0));
    const nextLetter = letters.find((l) => !existingNames.includes(l)) || "k";
    const colors = ["#2563EB", "#DC2626", "#059669", "#7C3AED", "#EA580C"];
    const nextColor = colors[functions.length % colors.length];

    setFunctions((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: `${nextLetter}(x)`,
        rawExpr: "cos(x)",
        color: nextColor,
        enabled: true,
      },
    ]);
  };

  const handleUpdateExpr = (id: string, newExpr: string) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, rawExpr: newExpr } : fn))
    );
  };

  const handleToggleEnable = (id: string) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, enabled: !fn.enabled } : fn))
    );
  };

  const handleDelete = (id: string) => {
    if (functions.length <= 1) return;
    setFunctions((prev) => prev.filter((fn) => fn.id !== id));
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    setXRange((prev) => {
      const span = (prev.max - prev.min) * factor;
      const center = (prev.max + prev.min) / 2;
      return { min: center - span / 2, max: center + span / 2 };
    });
    setYRange((prev) => {
      const span = (prev.max - prev.min) * factor;
      const center = (prev.max + prev.min) / 2;
      return { min: center - span / 2, max: center + span / 2 };
    });
  };

  const handleResetView = () => {
    setXRange({ min: -6, max: 6 });
    setYRange({ min: -5, max: 10 });
    setHoverCoord(null);
  };

  // Canvas Rendering
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    const xMin = xRange.min;
    const xMax = xRange.max;
    const yMin = yRange.min;
    const yMax = yRange.max;

    // Coordinate mapping functions
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (px: number) => xMin + (px / width) * (xMax - xMin);

    // Grid lines
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#E2E8F0";

    const xSpan = xMax - xMin;
    let xStep = 1;
    if (xSpan > 40) xStep = 5;
    else if (xSpan > 20) xStep = 2;
    else if (xSpan < 4) xStep = 0.5;

    const ySpan = yMax - yMin;
    let yStep = 1;
    if (ySpan > 40) yStep = 5;
    else if (ySpan > 20) yStep = 2;
    else if (ySpan < 4) yStep = 0.5;

    // Draw vertical grid
    const firstX = Math.floor(xMin / xStep) * xStep;
    for (let x = firstX; x <= xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      // Axis labels
      if (Math.abs(x) > 1e-6) {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "9px monospace";
        const sy = Math.max(12, Math.min(height - 4, toScreenY(0) + 10));
        ctx.fillText(x.toFixed(xStep < 1 ? 1 : 0), sx - 4, sy);
      }
    }

    // Draw horizontal grid
    const firstY = Math.floor(yMin / yStep) * yStep;
    for (let y = firstY; y <= yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "9px monospace";
        const sx = Math.max(4, Math.min(width - 24, toScreenX(0) + 4));
        ctx.fillText(y.toFixed(yStep < 1 ? 1 : 0), sx, sy + 3);
      }
    }

    // Draw Axes (X and Y)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#1E293B";

    // X Axis
    const originY = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Origin (0,0) label
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 9px monospace";
    ctx.fillText("0", originX - 9, originY + 11);

    // Plot Functions
    functions.forEach((fn) => {
      if (!fn.enabled || !fn.rawExpr.trim()) return;

      ctx.lineWidth = 2;
      ctx.strokeStyle = fn.color;
      ctx.beginPath();

      let isDrawing = false;
      const stepPx = 1.5; // High resolution sampling

      for (let px = 0; px <= width; px += stepPx) {
        const x = toMathX(px);
        const y = evalFunctionAt(fn.rawExpr, x, angleUnit);

        if (isNaN(y) || !isFinite(y)) {
          isDrawing = false;
          continue;
        }

        const py = toScreenY(y);

        // Clamp extreme jumps (asymptotes)
        if (py < -height || py > height * 2) {
          isDrawing = false;
          continue;
        }

        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });

    // Point Tracing Marker
    if (hoverCoord) {
      const hx = toScreenX(hoverCoord.x);
      const hy = toScreenY(hoverCoord.y);

      // Marker circle
      ctx.fillStyle = "#FFB703";
      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tooltip Box
      const text = `${hoverCoord.fnName}: (${hoverCoord.x.toFixed(2)}, ${hoverCoord.y.toFixed(2)})`;
      ctx.font = "bold 10px monospace";
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + 12;
      const boxHeight = 18;

      let boxX = hx + 8;
      let boxY = hy - 22;
      if (boxX + boxWidth > width) boxX = hx - boxWidth - 8;
      if (boxY < 2) boxY = hy + 10;

      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, boxX + 6, boxY + 12);
    }
  }, [functions, xRange, yRange, hoverCoord, angleUnit]);

  useEffect(() => {
    if (activeTab === "graphique") {
      drawGraph();
    }
  }, [activeTab, drawGraph]);

  // Mouse Interaction for Tracing and Panning
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = mouseX - dragStartRef.current.x;
      const dy = mouseY - dragStartRef.current.y;
      dragStartRef.current = { x: mouseX, y: mouseY };

      const xSpan = xRange.max - xRange.min;
      const ySpan = yRange.max - yRange.min;

      const shiftX = (dx / canvas.width) * xSpan;
      const shiftY = (dy / canvas.height) * ySpan;

      setXRange((prev) => ({ min: prev.min - shiftX, max: prev.max - shiftX }));
      setYRange((prev) => ({ min: prev.min + shiftY, max: prev.max + shiftY }));
      return;
    }

    // Point Tracing: find closest point on active curve
    const mathX = xRange.min + (mouseX / canvas.width) * (xRange.max - xRange.min);
    const firstActiveFn = functions.find((f) => f.enabled && f.rawExpr.trim());

    if (firstActiveFn) {
      const mathY = evalFunctionAt(firstActiveFn.rawExpr, mathX, angleUnit);
      if (!isNaN(mathY) && isFinite(mathY)) {
        setHoverCoord({ x: mathX, y: mathY, fnName: firstActiveFn.name });
      } else {
        setHoverCoord(null);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Table Data Generation
  const tableRows: { x: number; vals: Record<string, string> }[] = [];
  const start = tableConfig.start;
  const end = tableConfig.end;
  const step = Math.max(0.1, tableConfig.step);

  for (let x = start; x <= end + 1e-6; x += step) {
    const cleanX = Number(x.toFixed(4));
    const vals: Record<string, string> = {};
    functions.forEach((fn) => {
      if (fn.enabled) {
        const y = evalFunctionAt(fn.rawExpr, cleanX, angleUnit);
        vals[fn.name] = isNaN(y) ? "Non déf." : Number(y.toFixed(4)).toString();
      }
    });
    tableRows.push({ x: cleanX, vals });
  }

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-50 dark:bg-slate-900 select-none text-xs overflow-hidden">
      {/* 3 Top Sub-Tabs inside Screen */}
      <div className="grid grid-cols-3 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("expressions")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "expressions"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Expressions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("graphique")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "graphique"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Graphique
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tableau")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            activeTab === "tableau"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 font-black"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
          }`}
        >
          Tableau
        </button>
      </div>

      {/* Tab 1: Expressions */}
      {activeTab === "expressions" && (
        <div className="flex-1 p-2.5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>FONCTIONS MATHÉMATIQUES DÉFINIES</span>
              <span>{functions.filter((f) => f.enabled).length} active(s)</span>
            </div>

            {functions.map((fn) => (
              <div
                key={fn.id}
                className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                {/* Enable toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleEnable(fn.id)}
                  title={fn.enabled ? "Masquer" : "Afficher"}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {fn.enabled ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Function name label */}
                <span
                  className="font-mono font-bold text-xs shrink-0 px-1 py-0.5 rounded text-white"
                  style={{ backgroundColor: fn.color }}
                >
                  {fn.name} =
                </span>

                {/* Expression input */}
                <input
                  type="text"
                  value={fn.rawExpr}
                  onChange={(e) => handleUpdateExpr(fn.id, e.target.value)}
                  placeholder="2*x^2 + 3*x - 1"
                  className="flex-1 bg-transparent font-mono text-xs font-bold text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-blue-400 px-1"
                />

                {/* Delete button */}
                {functions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(fn.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add function button */}
            <button
              type="button"
              onClick={handleAddFunction}
              className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1 text-[11px] font-bold hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un élément</span>
            </button>
          </div>

          {/* Bottom Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("graphique")}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs text-[11px] text-center cursor-pointer transition-all"
            >
              Tracer le graphique
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tableau")}
              className="py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-xs text-[11px] text-center cursor-pointer transition-all"
            >
              Afficher les valeurs
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Graphique (HTML5 Canvas) */}
      {activeTab === "graphique" && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={340}
            height={200}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={() => {
              isDraggingRef.current = false;
              setHoverCoord(null);
            }}
            className="w-full h-full cursor-crosshair block"
          />

          {/* Floating Controls Bar */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 p-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm backdrop-blur-xs">
            <button
              type="button"
              onClick={() => handleZoom(0.7)}
              title="Zoom avant (+)"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(1.3)}
              title="Zoom arrière (-)"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Réinitialiser l'axe"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom info pill */}
          <div className="absolute bottom-1 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
            X: [{xRange.min.toFixed(1)}, {xRange.max.toFixed(1)}] • Glisser pour naviguer
          </div>
        </div>
      )}

      {/* Tab 3: Tableau (Table of Values) */}
      {activeTab === "tableau" && (
        <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
          {/* Config Bar */}
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-mono shrink-0 mb-1.5">
            <div className="flex items-center gap-1">
              <span>Début:</span>
              <input
                type="number"
                value={tableConfig.start}
                onChange={(e) =>
                  setTableConfig((prev) => ({
                    ...prev,
                    start: Number(e.target.value) || 0,
                  }))
                }
                className="w-10 bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center font-bold"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>Fin:</span>
              <input
                type="number"
                value={tableConfig.end}
                onChange={(e) =>
                  setTableConfig((prev) => ({
                    ...prev,
                    end: Number(e.target.value) || 0,
                  }))
                }
                className="w-10 bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center font-bold"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>Pas:</span>
              <input
                type="number"
                step="0.5"
                value={tableConfig.step}
                onChange={(e) =>
                  setTableConfig((prev) => ({
                    ...prev,
                    step: Number(e.target.value) || 1,
                  }))
                }
                className="w-10 bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center font-bold"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full text-[11px] font-mono border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-1 px-2 border-r border-slate-200 dark:border-slate-700 text-left font-black">
                    x
                  </th>
                  {functions.map(
                    (fn) =>
                      fn.enabled && (
                        <th
                          key={fn.id}
                          className="py-1 px-2 text-right font-black"
                          style={{ color: fn.color }}
                        >
                          {fn.name}
                        </th>
                      )
                  )}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <td className="py-0.5 px-2 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                      {row.x}
                    </td>
                    {functions.map(
                      (fn) =>
                        fn.enabled && (
                          <td
                            key={fn.id}
                            className="py-0.5 px-2 text-right text-slate-700 dark:text-slate-300"
                          >
                            {row.vals[fn.name]}
                          </td>
                        )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
