"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLearningResource } from "@/domain/learning-ecosystem/types";
import { getExternalResourcesForSkill } from "@/domain/learning-ecosystem/external-resources";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  ExternalLink,
  CheckCircle2,
  Video,
  FileText,
  Layers,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookmarkCheck,
} from "lucide-react";

interface ExternalResourceWithReturnTicketProps {
  skillId: string;
  resource?: ExternalLearningResource;
  onReturnAction?: () => void;
  returnActionLabel_ar?: string;
  returnActionLabel_fr?: string;
  locale?: string;
}

export function ExternalResourceWithReturnTicket({
  skillId,
  resource: propResource,
  onReturnAction,
  returnActionLabel_ar,
  returnActionLabel_fr,
  locale = "ar",
}: ExternalResourceWithReturnTicketProps) {
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const resource =
    propResource || getExternalResourcesForSkill(skillId)[0] || null;

  const [hasVisited, setHasVisited] = useState(false);

  if (!resource) return null;

  const getTypeIcon = () => {
    switch (resource.resourceType) {
      case "video":
        return <Video className="h-4 w-4 text-rose-400" />;
      case "official_document":
      case "pdf":
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <Layers className="h-4 w-4 text-amber-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (resource.resourceType) {
      case "video":
        return isAr ? "درس مرئي معتمد" : "Vidéo Pédagogique";
      case "official_document":
        return isAr ? "وثيقة توجيهية رسمية" : "Document Officiel";
      case "interactive":
        return isAr ? "محاكاة تفاعلية" : "Animation Interactive";
      default:
        return isAr ? "مرجع بيداغوجي" : "Ressource Pédagogique";
    }
  };

  const getReturnActionText = () => {
    if (returnActionLabel_ar && isAr) return returnActionLabel_ar;
    if (returnActionLabel_fr && !isAr) return returnActionLabel_fr;

    switch (resource.suggestedReturnAction) {
      case "isomorphic_retest":
        return isAr ? "رجعت؟ اختبر فهمك في السؤال التوأم" : "De retour ? Passez le retest jumeau";
      case "checkpoint_quiz":
        return isAr ? "رجعت؟ تحقق من فهمك بسؤال سريع" : "De retour ? Validez par un quiz";
      case "active_recall":
        return isAr ? "رجعت؟ استرجع الأفكار الأساسية" : "De retour ? Faites le rappel actif";
      default:
        return isAr ? "رجعت؟ أكمل تدريب المهارة" : "De retour ? Poursuivez l'entraînement";
    }
  };

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-[#0f172a]/95 to-[#0b1120]/95 p-5 sm:p-6 space-y-5 shadow-lg relative overflow-hidden">
      {/* Top Tag & Provenance */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80">
            {getTypeIcon()}
          </div>
          <span className="text-xs font-bold text-slate-200">
            {getTypeLabel()}
          </span>
          <Badge
            variant="outline"
            size="sm"
            className="border-emerald-500/40 text-emerald-400 text-[10px] flex items-center gap-1"
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{isAr ? "مصدر رسمي معتمد" : "Source Certifiée"}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span>
            {resource.estimatedDurationMinutes} {isAr ? "دقيقة" : "min"}
          </span>
        </div>
      </div>

      {/* Title & Provider */}
      <div className="space-y-1.5">
        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
          {isAr ? resource.title_ar : resource.title_fr}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-blue-400 font-semibold">{resource.provider}</span>
          <span>•</span>
          <span>{isAr ? "منهاج البكالوريا الجزائري" : "Programme BAC Algérie"}</span>
        </div>
      </div>

      {/* Pedagogical Why Explanation */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1">
        <span className="font-bold text-blue-300 block">
          {isAr ? "علاش ننصحوك بهذا المرجع؟" : "Pourquoi cette ressource ?"}
        </span>
        <p className="text-slate-300 leading-relaxed">
          {isAr ? resource.whyRecommended_ar : resource.whyRecommended_fr}
        </p>
      </div>

      {/* Outbound Link (Detour) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setHasVisited(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20"
        >
          <span>{isAr ? "فتح المرجع الخارجي ↗" : "Ouvrir la ressource ↗"}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <span className="text-[11px] text-slate-400 text-center sm:text-start">
          {isAr
            ? "يفتح في تبويب جديد • احتفظ بهذه الصفحة للعودة للاختبار"
            : "S'ouvre dans un nouvel onglet • Gardez cette page pour le retour"}
        </span>
      </div>

      {/* Authoritative Return Ticket */}
      <div
        className={`p-4 rounded-xl border transition-all duration-300 ${
          hasVisited
            ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10"
            : "bg-slate-900/60 border-slate-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                hasVisited ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isAr ? "تذكرة العودة (Return Ticket)" : "Billet de Retour (Validation)"}
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                {isAr
                  ? "BAC Mastery ليست دليلاً للروابط. بعد الاطلاع على المصدر، عد فوراً لتثبيت المهارة هنا."
                  : "Consultez la ressource puis validez directement votre acquis sur BAC Mastery."}
              </p>
            </div>
          </div>

          {onReturnAction ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onReturnAction}
              className={`font-bold text-xs shrink-0 ${
                hasVisited ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              <span>{getReturnActionText()}</span>
              <NextArrow className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Link href="/dashboard" className="shrink-0">
              <Button
                variant="primary"
                size="sm"
                className={`font-bold text-xs ${
                  hasVisited ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <span>{getReturnActionText()}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
