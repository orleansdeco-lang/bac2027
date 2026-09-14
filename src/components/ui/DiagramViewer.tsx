"use client";

import React, { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Maximize2,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export interface LabelItem {
  id: number;
  text_ar: string;
}

export interface DiagramViewerProps {
  diagramUrl: string;
  caption_ar: string;
  labels: LabelItem[];
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  diagramUrl,
  caption_ar,
  labels,
}) => {
  // Self-testing mode: hide/reveal all labels
  const [revealLabels, setRevealLabels] = useState<boolean>(false);
  // Track individually clicked labels in self-test mode
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});
  // Lightbox full-screen state
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  // Zoom scale in lightbox
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Keyboard shortcut: Escape closes lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
        setZoomScale(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const toggleAllLabels = () => {
    const next = !revealLabels;
    setRevealLabels(next);
    if (!next) {
      setRevealedIds({});
    }
  };

  const toggleSingleLabel = (id: number) => {
    if (revealLabels) return; // All already visible
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomScale(1);

  return (
    <>
      <div
        className="w-full rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm overflow-hidden text-right transition-all hover:border-purple-400/50 hover:shadow-md space-y-4 p-4 sm:p-5"
        dir="rtl"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                رسم تخطيطي مرجعي للبكالوريا
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {labels.length} بيانات مرقمة
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {caption_ar}
            </h4>
          </div>

          <button
            type="button"
            onClick={toggleAllLabels}
            className={`inline-flex items-center justify-center gap-2 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm ${
              revealLabels
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {revealLabels ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>إخفاء البيانات (وضع الاختبار الذاتي)</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>إظهار جميع البيانات</span>
              </>
            )}
          </button>
        </div>

        {/* Diagram Image Container with Click-to-Zoom */}
        <div
          onClick={() => {
            setIsLightboxOpen(true);
            setZoomScale(1);
          }}
          className="group relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 rounded-xl overflow-hidden border-2 border-slate-200/80 flex items-center justify-center cursor-pointer shadow-inner"
          title="انقر لتكبير الرسم التخطيطي بملء الشاشة"
        >
          <img
            src={diagramUrl}
            alt={caption_ar}
            className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Maximize2 className="w-4 h-4 text-emerald-400" />
              <span>انقر للتكبير بملء الشاشة والفحص الدقيق</span>
            </span>
          </div>

          {/* Floating Zoom Icon */}
          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 text-slate-800 border border-slate-300 shadow-sm flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>

        {/* Numbered Labels Grid */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>جدول البيانات المرقمة:</span>
            </span>
            {!revealLabels && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                💡 انقر على أي رقم مظلل لكشف بياناته بمفرده
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {labels.map((item) => {
              const isVisible = revealLabels || !!revealedIds[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSingleLabel(item.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-xs select-none ${
                    isVisible
                      ? "bg-slate-50 border-slate-200 text-slate-900"
                      : "bg-slate-100/80 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer"
                  }`}
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold shrink-0">
                    {item.id}
                  </span>

                  {isVisible ? (
                    <span className="font-bold text-slate-900 leading-snug">
                      {item.text_ar}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1.5 italic">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>انقر لكشف البيان</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FULLSCREEN LIGHTBOX MODAL WITH ZOOM CONTROLS                        */}
      {/* =================================================================== */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col text-right animate-fade-in"
          dir="rtl"
        >
          {/* Top Controls Bar */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 z-10 shrink-0">
            <div className="flex items-center gap-3 truncate max-w-[60%]">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 shrink-0">
                فحص تكبيري عالي الدقة
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {caption_ar}
              </h3>
            </div>

            {/* Zoom controls & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                  title="تكبير (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 min-w-[3rem] text-center select-none">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                  title="تصغير (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="w-8 h-8 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                  title="إعادة ضبط الحجم (100%)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomScale(1);
                }}
                className="w-9 h-9 rounded-xl bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-colors"
                title="إغلاق (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing">
            <div
              className="transition-transform duration-200 ease-out flex items-center justify-center"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={diagramUrl}
                alt={caption_ar}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-2xl bg-white/95 p-4 border border-slate-700"
              />
            </div>
          </div>

          {/* Bottom Labels Drawer inside Lightbox */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 shrink-0 max-h-44 overflow-y-auto">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-2">
              {labels.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs"
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px]">
                    {item.id}
                  </span>
                  <span className="text-slate-200 font-bold">{item.text_ar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
