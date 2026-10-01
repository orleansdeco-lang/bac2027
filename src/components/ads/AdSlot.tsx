"use client";

import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, MessageCircle, Megaphone } from "lucide-react";
import { AdCampaign, AdPlacement } from "@/lib/ads/types";
import { sendAnalyticsEvent } from "@/lib/analytics/tracker";

interface AdSlotProps {
  placement: AdPlacement | string;
  stream?: string;
  wilaya?: number;
  subject?: string;
  className?: string;
}

export function AdSlot({
  placement,
  stream,
  wilaya,
  subject,
  className = "",
}: AdSlotProps) {
  const [ad, setAd] = useState<AdCampaign | null>(null);
  const [hasReportedImpression, setHasReportedImpression] = useState(false);

  useEffect(() => {
    // Attempt to fetch matching active campaign for placement
    const controller = new AbortController();
    fetch(`/api/ads/active?placement=${encodeURIComponent(placement)}&stream=${encodeURIComponent(stream || "")}&wilaya=${encodeURIComponent(wilaya || "")}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ad) {
          setAd(data.ad);
        }
      })
      .catch(() => {
        // Fallback: silent without crashing UI
      });

    return () => controller.abort();
  }, [placement, stream, wilaya, subject]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track impression strictly when actually visible in viewport (>= 50% visible, deduplicated)
  useEffect(() => {
    if (!ad || hasReportedImpression) return;

    // Check session deduplication key
    const dedupeKey = `shater_ad_imp_${ad.id}_${placement}`;
    try {
      if (typeof window !== "undefined" && window.sessionStorage?.getItem(dedupeKey)) {
        setHasReportedImpression(true);
        return;
      }
    } catch {
      // Ignore storage access errors
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: report once if IntersectionObserver is unavailable
      sendAnalyticsEvent("ad_impression", {
        adId: ad.id,
        campaignId: ad.id,
        placement,
      });
      setHasReportedImpression(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          sendAnalyticsEvent("ad_impression", {
            adId: ad.id,
            campaignId: ad.id,
            placement,
          });
          setHasReportedImpression(true);
          try {
            window.sessionStorage?.setItem(dedupeKey, "1");
          } catch {
            // Ignore storage access errors
          }
          observer.disconnect();
        }
      },
      {
        threshold: 0.5,
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [ad, hasReportedImpression, placement]);

  if (!ad || !ad.creative) {
    return null;
  }

  const { creative } = ad;

  const handleCtaClick = () => {
    sendAnalyticsEvent("ad_clicked", {
      adId: ad.id,
      campaignId: ad.id,
      placement,
      ctaType: creative.ctaType,
    });

    if (creative.ctaType === "whatsapp") {
      const cleanPhone = creative.ctaDestination.replace(/\D/g, "");
      const text = encodeURIComponent(creative.whatsappPrefillText || "مرحباً، أود الاستفسار عن الدورة المعلنة في منصة شاطر.");
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    } else {
      window.open(creative.ctaDestination, "_blank");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`my-4 p-4 rounded-2xl bg-[#0D1526] border border-[#1E293B] shadow-sm relative overflow-hidden text-right ${className}`}
      dir="rtl"
    >
      {/* Mandatory Official Sponsor / Annonce Badge */}
      <div className="flex items-center justify-between mb-3 text-[11px] border-b border-[#1E293B]/70 pb-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">محتوى ترويجي معتمد</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">
          إعلان • Annonce
        </span>
      </div>

      {/* Ad Body */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {creative.assetUrl && (
          <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-[#1E293B]">
            <img
              src={creative.assetUrl}
              alt={creative.titleAr}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 space-y-1 text-right w-full">
          <h4 className="text-sm font-bold text-slate-100 line-clamp-1">
            {creative.titleAr}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {creative.bodyAr}
          </p>
        </div>

        <button
          onClick={handleCtaClick}
          className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          {creative.ctaType === "whatsapp" ? (
            <>
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>{creative.ctaLabelAr || "تواصل عبر واتساب"}</span>
            </>
          ) : (
            <>
              <span>{creative.ctaLabelAr || "اكتشف المزيد"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
