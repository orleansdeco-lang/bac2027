"use client";

import React from "react";
import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Target, Flag, Play, RotateCcw, CheckCircle2, ChevronDown, ArrowDown } from "lucide-react";

interface RoadVisualizerProps {
  targetScore: number;
  currentBaselineText: string;
  gapText?: string;
  activeMission?: {
    id: string;
    subjectId: string;
    skillTitle: string;
    estimatedMinutes?: number;
    reasonBadge?: string;
    reasonText?: string;
    repairStatus?: "none" | "repair_started" | "repair_completed" | "retest_passed";
  } | null;
  masteredCount: number;
  totalSkills: number;
  locale: "ar" | "fr";
  onStartMission?: () => void;
}

export function RoadVisualizer({
  targetScore,
  currentBaselineText,
  gapText,
  activeMission,
  masteredCount,
  totalSkills,
  locale,
  onStartMission,
}: RoadVisualizerProps) {
  const isAr = locale === "ar";

  return (
    <div className="relative py-4 px-2 sm:px-4 max-w-xl mx-auto">
      {/* Visual Central Pathway Spine */}
      <div className="absolute top-12 bottom-12 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-amber-500/40 via-blue-500/60 to-emerald-500/40 -translate-x-1/2 pointer-events-none" />

      {/* =================================================================== */}
      {/* NODE 1: THE TARGET GOAL (TOP DESTINATION)                           */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8 group">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#162032] border-2 border-amber-500/70 text-amber-400 shadow-glow/20">
          <Target className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isAr ? "الهدف الاستراتيجي في البكالوريا" : "Objectif BAC Cible"}
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              {targetScore > 0 ? targetScore.toFixed(2) : "16.00"}/20
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr ? "الوجهة النهائية التي تُبنى كل خطوة للوصول إليها." : "La destination finale qui guide chaque mission."}
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 2: CURRENT STATE & GAP                                         */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] border border-slate-700 text-slate-300">
          <Flag className="h-5 w-5" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              {isAr ? "الموقع الحالي والانطلاقة" : "Position de départ"}
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] text-slate-400 border-slate-700">
              {currentBaselineText}
            </Badge>
          </div>
          {gapText && (
            <p className="text-xs text-blue-400/90 font-medium mt-0.5">
              {isAr ? `الفجوة التقريبية: ${gapText}` : `Écart estimé : ${gapText}`}
            </p>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 3: THE ACTIVE MISSION (FOCAL POINT OF THE PRODUCT)             */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6 mb-8">
        {/* Pulsing focal node icon */}
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 border-2 border-blue-400 text-white shadow-lg shadow-blue-600/30 animate-pulse">
          <Play className="h-5 w-5 fill-current" />
        </div>

        <div className="flex-1">
          <Card className="p-4 sm:p-5 border-blue-500/40 bg-gradient-to-br from-[#162238] to-[#111827] shadow-lg shadow-blue-950/40 relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                {isAr ? "مهمتك الآن" : "Mission Actuelle"}
              </span>
              {activeMission?.estimatedMinutes && (
                <span className="text-[11px] font-mono text-slate-400">
                  ~{activeMission.estimatedMinutes} {isAr ? "دقيقة" : "min"}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug mb-2">
              {activeMission?.skillTitle || (isAr ? "أتقن قاعدة السلسلة في الاشتقاق" : "Dérivation des fonctions composées")}
            </h3>

            {/* Rationale if present */}
            {activeMission?.reasonText && (
              <div className="p-2.5 rounded-xl bg-[#0B1020]/70 border border-slate-800 text-xs text-slate-300 mb-3 leading-relaxed">
                <span className="font-semibold text-blue-400 block mb-0.5">
                  {isAr ? "علاش هذي المهمة بالذات؟" : "Pourquoi cette mission ?"}
                </span>
                {activeMission.reasonText}
              </div>
            )}

            {/* Action CTA */}
            {activeMission?.id ? (
              <Link href={`/mission/${activeMission.id}`} className="block">
                <Button variant="primary" fullWidth size="md" className="font-bold shadow-md shadow-blue-700/20">
                  <span>{isAr ? "ابدأ المهمة الآن" : "Démarrer la mission"}</span>
                  <span className="text-xs">→</span>
                </Button>
              </Link>
            ) : (
              <Button variant="primary" fullWidth size="md" onClick={onStartMission} className="font-bold">
                <span>{isAr ? "ابدأ المهمة الآن" : "Démarrer la mission"}</span>
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* =================================================================== */}
      {/* NODE 4: DEMONSTRATED EVIDENCE (FOUNDATION AT BASE)                   */}
      {/* =================================================================== */}
      <div className="relative flex items-start gap-4 sm:gap-6">
        <div className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] border border-emerald-500/50 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">
              {isAr ? "إتقان مُثبت بالأدلة" : "Maîtrise démontrée"}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {masteredCount}/{totalSkills} {isAr ? "مهارة" : "compétences"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr ? "كل خطأ تم ترميمه وتأكيد فهمه باختبار توأمي ينتقل إلى رصيدك المثبت." : "Chaque erreur corrigée et validée par re-test jumeau enrichit votre socle."}
          </p>
        </div>
      </div>
    </div>
  );
}
