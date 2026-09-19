"use client";

import React, { useRef, useState } from "react";
import { BacExperience } from "@/types/experience";
import { Download, Share2, X, Sparkles, Check, AlertTriangle, Lightbulb, GraduationCap, CheckCircle2 } from "lucide-react";

interface ExperienceImageCardProps {
  experience: BacExperience;
  isOpen: boolean;
  onClose: () => void;
}

const STREAM_NAMES: Record<string, string> = {
  sciences: "علوم تجريبية",
  math: "رياضيات",
  technique_math: "تقني رياضي",
  gestion_economie: "تسيير واقتصاد",
  lettres_philo: "آداب وفلسفة",
  langues_etrangeres: "لغات أجنبية",
};

export function ExperienceImageCard({ experience, isOpen, onClose }: ExperienceImageCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const streamLabel = STREAM_NAMES[experience.stream_id] || experience.stream_id;

  // Generate Canvas and export as Image
  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const cardEl = cardRef.current;
    if (!cardEl) return null;

    // Create an offscreen canvas with 2x resolution for crisp text
    const width = 1080;
    const height = 1350; // 4:5 Instagram post ratio
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Background gradient (Warm eye-friendly beige to soft cream)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#FAF6EE");
    bgGrad.addColorStop(1, "#F3EDE0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle geometric accents
    ctx.fillStyle = "rgba(95, 143, 134, 0.06)";
    ctx.beginPath();
    ctx.arc(950, 100, 350, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(215, 166, 106, 0.06)";
    ctx.beginPath();
    ctx.arc(100, 1200, 300, 0, Math.PI * 2);
    ctx.fill();

    // 2. Header Box: Brand identity
    ctx.fillStyle = "#1E3A34";
    ctx.beginPath();
    ctx.roundRect(60, 60, width - 120, 120, 24);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px 'Cairo', 'IBM Plex Sans Arabic', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("الشاطر | SHATER BAC 2027 🇩🇿", width - 110, 125);

    ctx.font = "24px 'Cairo', sans-serif";
    ctx.fillStyle = "#AFC8BD";
    ctx.fillText("بنك تجارب وخبرات البكالوريا الميدانية", width - 110, 158);

    // Left header badge
    ctx.fillStyle = "#D7A66A";
    ctx.font = "bold 26px 'Cairo', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("خلاصة الميدان ⭐", 110, 135);

    // 3. Author info banner
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(60, 210, width - 120, 150, 24);
    ctx.fill();
    ctx.strokeStyle = "#E4DED2";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#26302F";
    ctx.font = "bold 38px 'Cairo', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(experience.author_name, width - 110, 275);

    // Stream and Role
    ctx.font = "bold 26px 'Cairo', sans-serif";
    ctx.fillStyle = "#5F8F86";
    const subText = `الشعبة: ${streamLabel} ${experience.final_grade ? `• المعدل: ${experience.final_grade.toFixed(2)}/20` : ""}`;
    ctx.fillText(subText, width - 110, 325);

    if (experience.target_major || experience.university_major) {
      ctx.font = "24px 'Cairo', sans-serif";
      ctx.fillStyle = "#D7A66A";
      ctx.textAlign = "left";
      ctx.fillText(`الوجهة: ${experience.university_major || experience.target_major}`, 110, 295);
    }

    // Helper text wrapper
    const wrapText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number, maxLines = 6) => {
      const words = text.split(" ");
      let line = "";
      let y = startY;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
          lineCount++;
          if (lineCount >= maxLines - 1) {
            line += words.slice(n + 1).join(" ");
            if (ctx.measureText(line).width > maxWidth) {
              line = line.substring(0, Math.floor(line.length * 0.8)) + "...";
            }
            ctx.fillText(line, x, y);
            return y + lineHeight;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
      return y + lineHeight;
    };

    // 4. Trap Box (أكبر فخ)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(60, 390, width - 120, 360, 24);
    ctx.fill();
    ctx.strokeStyle = "#F2A99B";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trap Header
    ctx.fillStyle = "#C8796B";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("⚠️ أكبر فخ نحذركم منه:", width - 110, 450);

    ctx.fillStyle = "#26302F";
    ctx.font = "26px 'Cairo', sans-serif";
    wrapText(experience.biggest_trap, width - 110, 500, width - 220, 42, 6);

    // 5. Winning Routine Box (السر أو الروتين الحاسم)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(60, 780, width - 120, 360, 24);
    ctx.fill();
    ctx.strokeStyle = "#9EC7B3";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Routine Header
    ctx.fillStyle = "#456B64";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("💡 السر أو الروتين الحاسم:", width - 110, 840);

    ctx.fillStyle = "#26302F";
    ctx.font = "26px 'Cairo', sans-serif";
    wrapText(experience.winning_routine, width - 110, 890, width - 220, 42, 6);

    // 6. Footer Branding & Call to Action
    ctx.fillStyle = "#1E3A34";
    ctx.beginPath();
    ctx.roundRect(60, 1170, width - 120, 120, 24);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Cairo', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("اقرأ مئات التجارب الحقيقية وانضم لأقوى تحضير للبكالوريا 🎯", width - 110, 1235);

    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.fillStyle = "#D7A66A";
    ctx.textAlign = "left";
    ctx.fillText("bac2027-three.vercel.app", 110, 1235);

    return canvas;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `shater-tajriba-${experience.id}.png`;
      a.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShareImage = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      handleDownload();
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          return;
        }
        const file = new File([blob], `shater-tajriba-${experience.id}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `تجربة بكالوريا من ${experience.author_name}`,
              text: `💡 تجربة حقيقية في البكالوريا من ${experience.author_name} (${streamLabel}) على منصة الشاطر:\nhttps://bac2027-three.vercel.app/experiences#${experience.id}`,
            });
          } catch {
            handleDownload();
          }
        } else {
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-theme-surface border border-theme p-5 sm:p-6 my-6 shadow-2xl text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-xl p-2 text-theme-muted hover:bg-theme-base transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 border-b border-theme pb-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-theme-text">
              مشاركة التجربة كبطاقة صورة لشبكات التواصل
            </h3>
            <p className="text-[11px] text-theme-secondary">
              قالب رسمي بهوية الشاطر جاهز للنشر على إنستغرام، فيسبوك، وتيليغرام.
            </p>
          </div>
        </div>

        {/* Live Card Preview */}
        <div
          ref={cardRef}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#FAF6EE] to-[#F3EDE0] border border-[#E4DED2] text-[#26302F] space-y-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4DED2] pb-2.5">
            <div className="text-start">
              <span className="text-[10px] font-bold text-[#D7A66A] block">خلاصة الميدان ⭐</span>
              <span className="text-xs font-black text-[#1E3A34]">الشاطر | SHATER BAC 2027 🇩🇿</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5F8F86]/15 text-[#5F8F86] font-bold">
              {streamLabel}
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center justify-between text-xs">
            <div className="font-bold text-sm text-[#1E3A34]">
              {experience.author_name}
            </div>
            {experience.final_grade && (
              <span className="font-mono font-extrabold text-[#5F8F86] bg-white px-2 py-0.5 rounded-md border border-[#E4DED2]">
                المعدل: {experience.final_grade.toFixed(2)}/20
              </span>
            )}
          </div>

          {/* Trap Box */}
          <div className="p-3 rounded-xl bg-white border border-[#F2A99B] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#C8796B]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>⚠️ أكبر فخ نحذركم منه:</span>
            </div>
            <p className="text-slate-700 leading-relaxed line-clamp-4 text-[11px]">
              {experience.biggest_trap}
            </p>
          </div>

          {/* Routine Box */}
          <div className="p-3 rounded-xl bg-white border border-[#9EC7B3] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#456B64]">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>💡 السر أو الروتين الحاسم:</span>
            </div>
            <p className="text-slate-700 leading-relaxed line-clamp-4 text-[11px]">
              {experience.winning_routine}
            </p>
          </div>

          {/* Footer watermark */}
          <div className="pt-2 border-t border-[#E4DED2] flex items-center justify-between text-[10px] text-slate-500">
            <span>منصة الشاطر الرسمية للبكالوريا</span>
            <span className="font-mono font-bold text-[#5F8F86]">bac2027-three.vercel.app</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleNativeShareImage}
            disabled={isGenerating}
            className="w-full sm:flex-1 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{isGenerating ? "جاري تجهيز الصورة..." : "مشاركة الصورة فورياً"}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full sm:w-auto min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-theme-surface hover:bg-theme-base border border-theme text-theme-text transition-all cursor-pointer"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? "تم التحميل بنجاح!" : "تحميل كـ PNG"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
