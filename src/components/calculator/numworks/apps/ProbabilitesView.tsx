import React, { useState, useRef, useEffect } from "react";
import { normalCdf, normalPdf, binomialPmf } from "../math-engine";

export function ProbabilitesView() {
  const [distType, setDistType] = useState<"normale" | "binomiale">("normale");

  // Normal distribution parameters
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [normBoundType, setNormBoundType] = useState<"left" | "between" | "right">("between");
  const [normA, setNormA] = useState(-1);
  const [normB, setNormB] = useState(1);

  // Binomial distribution parameters
  const [binomN, setBinomN] = useState(10);
  const [binomP, setBinomP] = useState(0.5);
  const [binomK, setBinomK] = useState(5);
  const [binomBoundType, setBinomBoundType] = useState<"eq" | "lte" | "gte">("eq");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Normal Probability
  let normProb = 0;
  if (sigma > 0) {
    if (normBoundType === "left") {
      normProb = normalCdf(normB, mu, sigma);
    } else if (normBoundType === "right") {
      normProb = 1 - normalCdf(normA, mu, sigma);
    } else {
      normProb = Math.max(0, normalCdf(normB, mu, sigma) - normalCdf(normA, mu, sigma));
    }
  }

  // Compute Binomial Probability
  let binomProb = 0;
  if (binomBoundType === "eq") {
    binomProb = binomialPmf(binomN, binomP, binomK);
  } else if (binomBoundType === "lte") {
    for (let i = 0; i <= binomK; i++) {
      binomProb += binomialPmf(binomN, binomP, i);
    }
  } else {
    for (let i = binomK; i <= binomN; i++) {
      binomProb += binomialPmf(binomN, binomP, i);
    }
  }
  const binomMean = binomN * binomP;
  const binomVar = binomN * binomP * (1 - binomP);

  // Draw Bell Curve or Binomial Bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    if (distType === "normale") {
      // Gaussian Bell Curve
      const s = Math.max(0.1, sigma);
      const xMin = mu - 3.5 * s;
      const xMax = mu + 3.5 * s;
      const yMax = normalPdf(mu, mu, s) * 1.15;

      const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
      const toScreenY = (y: number) => height - 20 - (y / yMax) * (height - 35);

      // Shaded area under curve
      ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
      ctx.beginPath();
      let firstShade = true;

      for (let px = 0; px <= width; px += 2) {
        const x = xMin + (px / width) * (xMax - xMin);
        let inBounds = false;
        if (normBoundType === "left" && x <= normB) inBounds = true;
        else if (normBoundType === "right" && x >= normA) inBounds = true;
        else if (normBoundType === "between" && x >= normA && x <= normB) inBounds = true;

        if (inBounds) {
          const y = normalPdf(x, mu, s);
          const py = toScreenY(y);
          if (firstShade) {
            ctx.moveTo(px, height - 20);
            ctx.lineTo(px, py);
            firstShade = false;
          } else {
            ctx.lineTo(px, py);
          }
        } else if (!firstShade) {
          ctx.lineTo(px, height - 20);
          break;
        }
      }
      ctx.lineTo(width, height - 20);
      ctx.closePath();
      ctx.fill();

      // Draw Bell Curve line
      ctx.strokeStyle = "#E11D48";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = normalPdf(x, mu, s);
        const py = toScreenY(y);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Baseline axis
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      // X ticks
      ctx.fillStyle = "#64748B";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      [-2, -1, 0, 1, 2].forEach((k) => {
        const val = mu + k * s;
        const sx = toScreenX(val);
        ctx.fillText(val.toFixed(1), sx, height - 6);
      });
    } else {
      // Binomial distribution bar chart
      const maxP = Math.max(...Array.from({ length: binomN + 1 }, (_, i) => binomialPmf(binomN, binomP, i)), 0.01);
      const padX = 15;
      const barAreaW = width - padX * 2;
      const barW = Math.min(22, (barAreaW / (binomN + 1)) * 0.7);
      const step = barAreaW / (binomN + 1);

      // Baseline
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      for (let k = 0; k <= binomN; k++) {
        const p = binomialPmf(binomN, binomP, k);
        const barH = (p / maxP) * (height - 45);
        const bx = padX + k * step;
        const by = height - 20 - barH;

        let isSelected = false;
        if (binomBoundType === "eq" && k === binomK) isSelected = true;
        if (binomBoundType === "lte" && k <= binomK) isSelected = true;
        if (binomBoundType === "gte" && k >= binomK) isSelected = true;

        ctx.fillStyle = isSelected ? "#E11D48" : "#CBD5E1";
        ctx.fillRect(bx, by, barW, barH);

        // Value text
        ctx.fillStyle = "#64748B";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(k), bx + barW / 2, height - 8);
      }
    }
  }, [distType, mu, sigma, normBoundType, normA, normB, binomN, binomP, binomK, binomBoundType]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-50 dark:bg-slate-900 select-none text-xs overflow-hidden">
      {/* Distribution Type Selector */}
      <div className="grid grid-cols-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0">
        <button
          type="button"
          onClick={() => setDistType("normale")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            distType === "normale"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-black"
              : "hover:bg-slate-100"
          }`}
        >
          Loi Normale N(μ, σ)
        </button>
        <button
          type="button"
          onClick={() => setDistType("binomiale")}
          className={`py-1.5 text-center transition-all cursor-pointer ${
            distType === "binomiale"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 font-black"
              : "hover:bg-slate-100"
          }`}
        >
          Loi Binomiale B(n, p)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-2 flex flex-col justify-between overflow-y-auto">
        {/* Canvas Visual Graph */}
        <div className="h-24 bg-white rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 mb-1.5 shadow-xs">
          <canvas ref={canvasRef} width={340} height={96} className="w-full h-full block" />
        </div>

        {/* Normal Distribution Inputs */}
        {distType === "normale" ? (
          <div className="space-y-1.5 font-mono">
            {/* Parameters mu & sigma */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-sans font-bold text-slate-500">Moyenne (μ):</span>
                <input
                  type="number"
                  value={mu}
                  onChange={(e) => setMu(Number(e.target.value) || 0)}
                  className="w-14 text-right bg-transparent font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-sans font-bold text-slate-500">Écart-type (σ):</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={sigma}
                  onChange={(e) => setSigma(Math.max(0.01, Number(e.target.value) || 1))}
                  className="w-14 text-right bg-transparent font-bold outline-none"
                />
              </div>
            </div>

            {/* Range type */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">
              <button
                type="button"
                onClick={() => setNormBoundType("left")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  normBoundType === "left" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(X ≤ b)
              </button>
              <button
                type="button"
                onClick={() => setNormBoundType("between")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  normBoundType === "between" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(a ≤ X ≤ b)
              </button>
              <button
                type="button"
                onClick={() => setNormBoundType("right")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  normBoundType === "right" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(X ≥ a)
              </button>
            </div>

            {/* Bounds inputs */}
            <div className="flex items-center justify-between gap-2">
              {normBoundType !== "left" && (
                <div className="flex-1 flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
                  <span className="text-slate-500">a =</span>
                  <input
                    type="number"
                    step="0.5"
                    value={normA}
                    onChange={(e) => setNormA(Number(e.target.value) || 0)}
                    className="w-12 text-right bg-transparent font-bold outline-none"
                  />
                </div>
              )}
              {normBoundType !== "right" && (
                <div className="flex-1 flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
                  <span className="text-slate-500">b =</span>
                  <input
                    type="number"
                    step="0.5"
                    value={normB}
                    onChange={(e) => setNormB(Number(e.target.value) || 0)}
                    className="w-12 text-right bg-transparent font-bold outline-none"
                  />
                </div>
              )}
            </div>

            {/* Result display */}
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold text-rose-700 dark:text-rose-300">
                Probabilité P =
              </span>
              <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                {normProb.toFixed(5)} ({ (normProb * 100).toFixed(2) }%)
              </span>
            </div>
          </div>
        ) : (
          /* Binomial Distribution Inputs */
          <div className="space-y-1.5 font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-sans font-bold text-slate-500">Essais (n):</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={binomN}
                  onChange={(e) => setBinomN(Math.max(1, Number(e.target.value) || 1))}
                  className="w-12 text-right bg-transparent font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-sans font-bold text-slate-500">Succès (p):</span>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={binomP}
                  onChange={(e) =>
                    setBinomP(Math.min(1, Math.max(0, Number(e.target.value) || 0)))
                  }
                  className="w-14 text-right bg-transparent font-bold outline-none"
                />
              </div>
            </div>

            {/* k selection */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px]">
              <button
                type="button"
                onClick={() => setBinomBoundType("eq")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  binomBoundType === "eq" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(X = k)
              </button>
              <button
                type="button"
                onClick={() => setBinomBoundType("lte")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  binomBoundType === "lte" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(X ≤ k)
              </button>
              <button
                type="button"
                onClick={() => setBinomBoundType("gte")}
                className={`flex-1 py-0.5 rounded cursor-pointer ${
                  binomBoundType === "gte" ? "bg-rose-600 text-white font-bold" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                P(X ≥ k)
              </button>
            </div>

            <div className="flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
              <span className="text-slate-500 font-sans">Valeur k (0 ≤ k ≤ {binomN}):</span>
              <input
                type="number"
                min="0"
                max={binomN}
                value={binomK}
                onChange={(e) =>
                  setBinomK(Math.min(binomN, Math.max(0, Number(e.target.value) || 0)))
                }
                className="w-12 text-right bg-transparent font-bold outline-none"
              />
            </div>

            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold text-rose-700 dark:text-rose-300">
                Probabilité =
              </span>
              <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                {binomProb.toFixed(5)} ({ (binomProb * 100).toFixed(2) }%)
              </span>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-sans pt-0.5">
              <span>E(X) = {binomMean.toFixed(2)}</span>
              <span>V(X) = {binomVar.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
