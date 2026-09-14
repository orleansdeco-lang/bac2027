"use client";

import React, { useState } from "react";

interface LabelItem {
  id: number;
  text_ar: string;
}

interface Props {
  diagramUrl: string;
  caption_ar: string;
  labels: LabelItem[];
}

export const DiagramViewer: React.FC<Props> = ({ diagramUrl, caption_ar, labels }) => {
  // وضع الحفظ الذاتي: إخفاء النصوص حتى يختبر الطالب نفسه
  const [revealLabels, setRevealLabels] = useState<boolean>(false);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 text-right" dir="rtl">
      {/* عنوان الرسم التخطيطي وزر الاختبار الذاتي */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-slate-200">{caption_ar}</h4>
        <button
          onClick={() => setRevealLabels(!revealLabels)}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          {revealLabels ? "إخفاء البيانات للاختبار" : "إظهار أسماء البيانات"}
        </button>
      </div>

      {/* منطقة عرض الرسم التخطيطي */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80">
        {/* سيتم تحميل ملف SVG أو PNG من مجلد public */}
        <img
          src={diagramUrl}
          alt={caption_ar}
          className="max-h-full max-w-full object-contain p-2"
          onError={(e) => {
            // صورة احتياطية في حال لم تكن الصورة محملة بعد
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="text-xs text-slate-500 absolute pointer-events-none">
          [الرسم التخطيطي المرجعي الرسمي للبكالوريا]
        </div>
      </div>

      {/* شبكة البيانات المرقمة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {labels.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-xl text-xs"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
              {item.id}
            </span>
            <span className={`transition-all duration-200 ${revealLabels ? "text-slate-200" : "text-transparent bg-slate-800 rounded select-none px-2"}`}>
              {item.text_ar}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
