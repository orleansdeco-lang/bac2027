import React, { useState } from "react";
import {
  ExternalLink,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

export function NumWorksSimulatorIframe() {
  const [iframeKey, setIframeKey] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 py-2">
      {/* Top Banner Info */}
      <div className="w-full max-w-xl p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 text-theme-text text-sm flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">المحاكي السحابي الرسمي لآلة NumWorks</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              نسخة أصلية كاملة
            </span>
          </div>
          <p className="text-xs text-theme-muted">
            يعمل هذا المحاكي مباشرة عبر خوادم شركة NumWorks الرسمية ويوفر نظام التشغيل الحقيقي (Epsilon OS) بكامل التحديثات والتطبيقات.
          </p>
        </div>
      </div>

      {/* Control bar: reload, fullscreen and external link */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>تكبير ملء الشاشة (Plein écran)</span>
        </button>

        <button
          type="button"
          onClick={handleReload}
          className="px-3 py-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-text flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تحميل</span>
        </button>

        <a
          href="https://www.numworks.com/simulator/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-text flex items-center gap-1.5 transition-all shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>فتح في نافذة مستقلة</span>
        </a>
      </div>

      {/* Official iframe wrapper */}
      <div className="w-full flex justify-center py-2">
        <iframe
          key={iframeKey}
          src="https://www.numworks.com/simulator/embed/"
          width="360"
          height="720"
          loading="lazy"
          title="NumWorks Official Graphing Calculator Simulator"
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            maxWidth: "100%",
          }}
        />
      </div>

      {/* Fullscreen Overlay for Iframe */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto">
          {/* Header */}
          <div className="w-full max-w-[400px] flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-lg text-white mb-2 shrink-0">
            <span className="text-xs font-mono font-bold">
              NUMWORKS OFFICIAL SIMULATOR
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

          <div className="w-full flex justify-center items-center flex-1 my-auto">
            <iframe
              src="https://www.numworks.com/simulator/embed/"
              width="360"
              height="720"
              loading="lazy"
              title="NumWorks Official Simulator Fullscreen"
              style={{
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
                maxWidth: "100%",
              }}
            />
          </div>
        </div>
      )}

      <div className="text-center text-xs text-theme-muted max-w-sm">
        💡 <span className="font-bold">نصيحة:</span> يمكنك استخدام لوحة مفاتيح حاسوبك للتنقل السريع داخل المحاكي، أو التبديل إلى "الوضع التفاعلي المدمج" لسرعة فائقة بدون اتصال بالإنترنت.
      </div>
    </div>
  );
}
