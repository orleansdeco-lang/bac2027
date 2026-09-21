"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  MessageCircle,
  QrCode as QrCodeIcon,
} from "lucide-react";
import {
  downloadMarketingPoster,
  shareMarketingPoster,
  renderMarketingPosterCanvas,
} from "@/lib/referral/marketing-card";

interface MarketingPosterCardProps {
  referralCode: string;
  studentName?: string;
  discountPercentage?: number;
  locale?: string;
}

export function MarketingPosterCard({
  referralCode,
  studentName,
  discountPercentage = 10,
  locale = "ar",
}: MarketingPosterCardProps) {
  const isAr = locale === "ar";
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const regUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(referralCode)}`
      : `https://shater.dz/auth/register?ref=${encodeURIComponent(referralCode)}`;

  // Generate preview image on mount or when referralCode changes
  useEffect(() => {
    let active = true;
    renderMarketingPosterCanvas({
      referralCode,
      regUrl,
      studentName,
      discountPercentage,
    })
      .then((canvas) => {
        if (active) {
          setPreviewDataUrl(canvas.toDataURL("image/png"));
        }
      })
      .catch((err) => console.error("Error generating poster preview:", err));

    return () => {
      active = false;
    };
  }, [referralCode, regUrl, studentName, discountPercentage]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadMarketingPoster({
        referralCode,
        regUrl,
        studentName,
        discountPercentage,
      });
    } catch (err) {
      console.error("Failed to download poster:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      await shareMarketingPoster({
        referralCode,
        regUrl,
        studentName,
        discountPercentage,
      });
    } catch (err) {
      console.error("Failed to share poster:", err);
    } finally {
      setSharing(false);
    }
  };

  const copyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(regUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl bg-card border-2 border-[var(--color-primary)]/40 p-5 sm:p-7 shadow-clay space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-theme-text">
              {isAr ? "بطاقة المشاركة والتسويق (QR Code + كود الخصم)" : "Carte Marketing & Parrainage"}
            </h3>
          </div>
          <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
            {isAr
              ? "صورة تسويقية رسمية مصممة خصيصاً لمشاركتها مع أصدقائك وفي مجموعات الدراسة. تحتوي على كود الإحالة ورمز QR لمسحه مباشرة."
              : "Affiche promotionnelle officielle avec votre code et QR Code scannable pour vos amis."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold text-xs border border-[var(--color-accent)]/30">
            {isAr ? `تخفيض ${discountPercentage}%` : `-${discountPercentage}%`}
          </span>
        </div>
      </div>

      {/* Main Layout: Preview Poster + Quick Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Poster Visual Preview Column */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[var(--color-primary)]/30 shadow-md bg-stone-900 relative group flex items-center justify-center">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt={`بطاقة دعوة شاطر - كود ${referralCode}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <QrCodeIcon className="w-12 h-12 text-stone-500 animate-pulse" />
                <span className="text-xs text-stone-400 font-medium">
                  {isAr ? "جارٍ توليد البطاقة التسويقية..." : "Génération de la carte..."}
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-theme-muted mt-2 font-medium">
            {isAr ? "معاينة البطاقة (PNG عالية الدقة 900×1200)" : "Aperçu de la carte haute résolution"}
          </span>
        </div>

        {/* Action Controls Column */}
        <div className="md:col-span-6 lg:col-span-7 space-y-4">
          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-surface border border-theme space-y-2">
            <span className="text-xs font-bold text-theme-muted block">
              {isAr ? "كود الخصم والإحالة الخاص بك:" : "Votre code parrainage :"}
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono font-black text-2xl sm:text-3xl text-[var(--color-primary)] tracking-wider select-all">
                {referralCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="px-3.5 py-2 rounded-xl bg-card border border-theme hover:border-[var(--color-primary)] text-xs font-bold text-theme-text transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">{isAr ? "تم النسخ ✓" : "Copié"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-theme-secondary" />
                    <span>{isAr ? "نسخ الكود" : "Copier"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Download Poster Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-black text-sm transition-all shadow-clay flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloading
                  ? isAr
                    ? "جارٍ تحضير الصورة..."
                    : "Préparation..."
                  : isAr
                  ? "تحميل بطاقة المشاركة (صورة PNG)"
                  : "Télécharger la carte (Image PNG)"}
              </span>
            </button>

            {/* Share / WhatsApp Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="py-3 px-4 rounded-xl bg-card border-2 border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] text-theme-text font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{isAr ? "مشاركة البطاقة بالهاتف" : "Partager l'image"}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🎓 هدية خاصة لك! سجل في منصة شاطر لتحضير بكالوريا 2027 واستفد من خصم 10% فوري مع أسبوع تجريبي مجاني عبر كود الخصم: ${referralCode}\nرابط التسجيل المباشر:\n${regUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isAr ? "مشاركة عبر واتساب" : "WhatsApp"}</span>
              </a>
            </div>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={copyLink}
              className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-theme/40 text-theme-muted text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-theme"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{isAr ? "تم نسخ رابط التسجيل المباشر ✓" : "Lien copié"}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isAr ? "نسخ رابط التسجيل المباشر مع الكود" : "Copier le lien direct"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
