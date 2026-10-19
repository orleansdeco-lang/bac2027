import React, { useState, useRef, useEffect } from "react";
import { solveQuadratic } from "../math-engine";

export function EquationsView() {
  const [eqType, setEqType] = useState<"quadratic" | "linear">("quadratic");

  // Quadratic coefficients: ax^2 + bx + c = 0
  const [a, setA] = useState(1);
  const [b, setB] = useState(-3);
  const [c, setC] = useState(2);

  // Linear coefficients: ax + b = 0
  const [linA, setLinA] = useState(2);
  const [linB, setLinB] = useState(-6);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const quadResult = solveQuadratic(a, b, c);

  // Linear root
  const linRoot = linA !== 0 ? -linB / linA : null;

  // Mini Canvas parabola curve visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Axes
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1;

    // Y Axis (centered)
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // X Axis (centered)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (eqType === "quadratic") {
      if (a === 0) return;
      // Plot parabola: y = ax^2 + bx + c
      const vX = quadResult.vertexX || 0;
      const vY = quadResult.vertexY || 0;
      const xSpan = 8;
      const ySpan = Math.max(Math.abs(vY) * 2.5, 10);

      const toScreenX = (x: number) => width / 2 + ((x - vX) / xSpan) * (width * 0.4);
      const toScreenY = (y: number) => height / 2 - ((y - vY) / ySpan) * (height * 0.4);

      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;
      for (let px = 0; px <= width; px += 2) {
        const x = vX + ((px - width / 2) / (width * 0.4)) * xSpan;
        const y = a * x * x + b * x + c;
        const py = toScreenY(y);

        if (py >= -20 && py <= height + 20) {
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Highlight roots on X axis
      if (quadResult.rootType === "two-real" && quadResult.x1Dec !== undefined && quadResult.x2Dec !== undefined) {
        [quadResult.x1Dec, quadResult.x2Dec].forEach((rx) => {
          const sx = toScreenX(rx);
          const sy = toScreenY(0);
          ctx.fillStyle = "#2563EB";
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (quadResult.rootType === "one-double" && quadResult.x0Dec !== undefined) {
        const sx = toScreenX(quadResult.x0Dec);
        const sy = toScreenY(0);
        ctx.fillStyle = "#2563EB";
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Linear plot
      if (linA === 0) return;
      const toScreenX = (x: number) => width / 2 + (x / 10) * (width * 0.4);
      const toScreenY = (y: number) => height / 2 - (y / 10) * (height * 0.4);

      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const xStart = -8;
      const xEnd = 8;
      ctx.moveTo(toScreenX(xStart), toScreenY(linA * xStart + linB));
      ctx.lineTo(toScreenX(xEnd), toScreenY(linA * xEnd + linB));
      ctx.stroke();

      if (linRoot !== null) {
        ctx.fillStyle = "#2563EB";
        ctx.beginPath();
        ctx.arc(toScreenX(linRoot), toScreenY(0), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [eqType, a, b, c, linA, linB, quadResult, linRoot]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-50 dark:bg-slate-900 select-none text-xs overflow-hidden">
      {/* Equation Type Tabs */}
      <div className="grid grid-cols-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0">
        <button
          type="button"
          onClick={() => setEqType("quadratic")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            eqType === "quadratic"
              ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 font-black"
              : "hover:bg-slate-100"
          }`}
        >
          Degré 2: ax² + bx + c = 0
        </button>
        <button
          type="button"
          onClick={() => setEqType("linear")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            eqType === "linear"
              ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 font-black"
              : "hover:bg-slate-100"
          }`}
        >
          Degré 1: ax + b = 0
        </button>
      </div>

      <div className="flex-1 p-2 flex flex-col justify-between overflow-y-auto">
        {/* Canvas visual plot */}
        <div className="h-20 bg-white rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 mb-1.5 shadow-xs">
          <canvas ref={canvasRef} width={340} height={80} className="w-full h-full block" />
        </div>

        {eqType === "quadratic" ? (
          <div className="space-y-1.5 font-mono">
            {/* Coefficients a, b, c */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500">a =</span>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value) || 0)}
                  className="w-12 text-right bg-transparent font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500">b =</span>
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(Number(e.target.value) || 0)}
                  className="w-12 text-right bg-transparent font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500">c =</span>
                <input
                  type="number"
                  value={c}
                  onChange={(e) => setC(Number(e.target.value) || 0)}
                  className="w-12 text-right bg-transparent font-bold outline-none"
                />
              </div>
            </div>

            {/* Discriminant Delta (Δ) banner */}
            <div className="p-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-700 dark:text-orange-300 font-sans">
                  Discriminant (المميّز):
                </span>
                <span className="font-black text-xs text-orange-600 dark:text-orange-400">
                  Δ = b² - 4ac = {quadResult.delta}
                </span>
              </div>
              <span className="text-[9px] px-1 py-0.5 rounded font-bold font-sans bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                {quadResult.delta > 0
                  ? "Δ > 0 (Deux racines)"
                  : quadResult.delta === 0
                  ? "Δ = 0 (Racine double)"
                  : "Δ < 0 (Racines complexes)"}
              </span>
            </div>

            {/* Solutions / Roots */}
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-500 block">
                SOLUTIONS DE L'ÉQUATION:
              </span>

              {quadResult.rootType === "two-real" && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/40 p-1 rounded">
                    <span className="font-bold text-blue-700 dark:text-blue-300">x₁ =</span>
                    <span className="font-black">{quadResult.x1}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/40 p-1 rounded">
                    <span className="font-bold text-blue-700 dark:text-blue-300">x₂ =</span>
                    <span className="font-black">{quadResult.x2}</span>
                  </div>
                </div>
              )}

              {quadResult.rootType === "one-double" && (
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/40 p-1 rounded text-xs">
                  <span className="font-bold text-blue-700 dark:text-blue-300">x₀ = -b / 2a =</span>
                  <span className="font-black">{quadResult.x0}</span>
                </div>
              )}

              {quadResult.rootType === "two-complex" && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-950/40 p-1 rounded">
                    <span className="font-bold text-purple-700 dark:text-purple-300">z₁ =</span>
                    <span className="font-black">{quadResult.x1}</span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-950/40 p-1 rounded">
                    <span className="font-bold text-purple-700 dark:text-purple-300">z₂ =</span>
                    <span className="font-black">{quadResult.x2}</span>
                  </div>
                </div>
              )}

              {quadResult.rootType === "invalid" && (
                <span className="text-rose-500 font-sans">
                  Coefficients invalides (a = 0 et b = 0)
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Linear equation: ax + b = 0 */
          <div className="space-y-2 font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">a =</span>
                <input
                  type="number"
                  value={linA}
                  onChange={(e) => setLinA(Number(e.target.value) || 0)}
                  className="w-14 text-right bg-transparent font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">b =</span>
                <input
                  type="number"
                  value={linB}
                  onChange={(e) => setLinB(Number(e.target.value) || 0)}
                  className="w-14 text-right bg-transparent font-bold outline-none"
                />
              </div>
            </div>

            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-sans font-bold text-slate-600 dark:text-slate-400">
                Solution unique (x = -b / a):
              </span>
              <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                x = {linRoot !== null ? Number(linRoot.toFixed(4)).toString() : "Indéfinie"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
