"use client";

import React, { useState } from "react";
import {
  Bug,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";

export default function AdminCampaignDebuggerPage() {
  const [baseUrl, setBaseUrl] = useState("https://shater.dz");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("paid_social");
  const [campaign, setCampaign] = useState("shater_bac2027_launch");
  const [content, setContent] = useState("video_orientation_01");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate clean UTM URL
  const buildUrl = () => {
    try {
      const u = new URL(baseUrl);
      if (source.trim()) u.searchParams.set("utm_source", source.trim().toLowerCase());
      if (medium.trim()) u.searchParams.set("utm_medium", medium.trim().toLowerCase());
      if (campaign.trim()) u.searchParams.set("utm_campaign", campaign.trim().toLowerCase());
      if (content.trim()) u.searchParams.set("utm_content", content.trim().toLowerCase());
      if (term.trim()) u.searchParams.set("utm_term", term.trim().toLowerCase());
      return u.toString();
    } catch {
      return `${baseUrl}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
    }
  };

  const finalUrl = buildUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Validation rules
  const hasSpaces = /\s/.test(source) || /\s/.test(medium) || /\s/.test(campaign);
  const isWellFormed = Boolean(source && medium && campaign && !hasSpaces);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Générateur & Débogueur d'URLs de Campagnes
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Concevez et vérifiez des liens de tracking conformes aux standards de l'architecture SHATER v2.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Attribution Double Active</span>
        </div>
      </div>

      {/* UTM Form */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-100">
          Configuration des Paramètres de Campagne
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Base URL */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-300">URL d'atterrissage (Landing Page)</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://shater.dz/ ou https://shater.dz/checkout"
              className="w-full px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Source (<code>utm_source</code>) *
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="facebook, instagram, tiktok, google, telegram"
              className="w-full px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Medium */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Support (<code>utm_medium</code>) *
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="paid_social, cpc, reel, story, influencer"
              className="w-full px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Campaign */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Nom de la Campagne (<code>utm_campaign</code>) *
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="ex: shater_lancement_bac2027"
              className="w-full px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Contenu de l'Annonce (<code>utm_content</code>)
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ex: video_orientation_01 ou banniere_promo"
              className="w-full px-3.5 py-2 rounded-xl bg-[#080D1A] border border-[#1E293B] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Generated URL Box */}
        <div className="p-4 rounded-xl bg-[#080D1A] border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>URL Complète Générée</span>
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copié dans le presse-papiers</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le Lien</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-lg bg-[#0D1526] font-mono text-xs text-slate-200 break-all select-all border border-[#1E293B]">
            {finalUrl}
          </div>
        </div>

        {/* Validation and Behavior Simulation */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-200">Simulation du Comportement dans SHATER :</div>
          <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#1E293B] space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>First-Touch :</strong> Si le visiteur est nouveau, <code>{campaign}</code> sera figé comme origine de sa découverte.
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-teal-400" />
              <span>
                <strong>Last-Touch :</strong> S'il s'inscrit ou commande lors de cette visite, <code>{campaign}</code> recevra le crédit de la conversion.
              </span>
            </div>
            {hasSpaces && (
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Attention : Votre URL contient des espaces. Préférez les tirets du bas (_) ou tirets courts (-).</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
