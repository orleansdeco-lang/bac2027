"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  FileText,
  Clock,
  Eye,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface PageStat {
  path: string;
  pageviews: number;
  uniqueVisitors: number;
  avgDurationSeconds: number;
  isLanding: boolean;
}

export default function AdminPagesAnalyticsPage() {
  const [pages, setPages] = useState<PageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin/operations/pages")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data?.pages) {
          setPages(resData.data.pages);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Analyse des Pages & Rétention de Contenu
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pages d'atterrissage les plus fréquentées, volumes de consultation et temps d'attention moyen.
          </p>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">
          Classement des Pages par Volume
        </h3>

        {pages.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-xl space-y-1">
            <div className="text-slate-300 font-medium">Données de consultation en cours de collecte</div>
            <div>Dès les prochaines sessions, le volume et le temps moyen par écran apparaîtront ici.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Chemin d'accès (Route)</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Vues de Page</th>
                  <th className="pb-3">Visiteurs Uniques</th>
                  <th className="pb-3">Temps Moyen Passé</th>
                  <th className="pb-3 text-right">Aperçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {pages.map((p) => (
                  <tr key={p.path} className="hover:bg-[#131E36]/30 transition-colors">
                    <td className="py-3 font-mono font-semibold text-slate-200">
                      {p.path}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        p.path === "/" || p.path.startsWith("/checkout")
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {p.path === "/" ? "Accueil / Landing" : p.path.startsWith("/checkout") ? "Tunnel Commande" : "Espace Pédagogique"}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-100">{p.pageviews}</td>
                    <td className="py-3 font-mono text-slate-300">{p.uniqueVisitors}</td>
                    <td className="py-3 font-mono text-teal-400">{p.avgDurationSeconds}s</td>
                    <td className="py-3 text-right">
                      <Link
                        href={p.path}
                        target="_blank"
                        className="p-1 rounded text-slate-400 hover:text-slate-200 inline-block"
                        title="Ouvrir la page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
