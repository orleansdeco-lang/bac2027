"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShieldCheck, RefreshCw, ExternalLink, Search } from "lucide-react";
import { useAdminSession } from "@/lib/admin/client";
import Link from "next/link";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Tableau de Bord Opérationnel",
    subtitle: "Surveillance en direct, visiteurs actifs, acquisition et conversion",
  },
  "/admin/overview": {
    title: "Tableau de Bord Opérationnel",
    subtitle: "Surveillance en direct, visiteurs actifs, acquisition et conversion",
  },
  "/admin/visitors": {
    title: "Visiteurs en Direct & Trafic",
    subtitle: "Sessions actives, répartition par wilayas, terminaux et navigateurs",
  },
  "/admin/acquisition": {
    title: "Acquisition & Canaux",
    subtitle: "Attribution premier et dernier contact, sources de trafic et campagnes",
  },
  "/admin/acquisition/funnel": {
    title: "Entonnoir de Conversion",
    subtitle: "Analyse des étapes de conversion et déperditions de la visite au paiement",
  },
  "/admin/acquisition/campaigns": {
    title: "Campagnes Marketing & UTM",
    subtitle: "Performances des campagnes sponsorisées et tests publicitaires",
  },
  "/admin/users": {
    title: "Utilisateurs & Inscriptions",
    subtitle: "Comptes élèves, parcours individuel, filières et statut d'abonnement",
  },
  "/admin/students": {
    title: "Utilisateurs & Inscriptions",
    subtitle: "Comptes élèves, parcours individuel, filières et statut d'abonnement",
  },
  "/admin/orders": {
    title: "Commandes COD & Abonnements",
    subtitle: "Gestion des commandes de packs physiques, livraisons et encaissements",
  },
  "/admin/ads": {
    title: "Publicités & Bannières Internes",
    subtitle: "Emplacements publicitaires ciblés par filière et wilaya",
  },
  "/admin/campaign-debugger": {
    title: "Débogueur de Campagnes",
    subtitle: "Générateur et vérificateur d'URLs de tracking UTM",
  },
  "/admin/analytics/pages": {
    title: "Performance des Pages",
    subtitle: "Pages d'atterrissage les plus consultées, engagement et durées de session",
  },
  "/admin/analytics/health": {
    title: "Santé du Suivi & Télémétrie",
    subtitle: "Diagnostic de la collecte d'événements, pixel Meta et intégrité",
  },
  "/admin/content": {
    title: "Contenu des Cours",
    subtitle: "Validation et structure pédagogique du programme de Terminale",
  },
  "/admin/exercises": {
    title: "Banque d'Exercices",
    subtitle: "Sujets de baccalauréat, corrigés et exercices d'entraînement",
  },
  "/admin/learning": {
    title: "Diagnostic & Apprentissage",
    subtitle: "Taux de complétion, diagnostic initial et maîtrise des compétences",
  },
  "/admin/orientation": {
    title: "Orientation Universitaire",
    subtitle: "Écoles supérieures, universités et seuils d'admission",
  },
  "/admin/study-rooms": {
    title: "Diwan & Espaces d'Étude",
    subtitle: "Gestion des salons d'émulation et de travail collaboratif",
  },
  "/admin/ai": {
    title: "Assistant IA Opérations",
    subtitle: "Centre de commande IA avec outils d'audit en lecture sécurisée",
  },
  "/admin/ai/daily-report": {
    title: "Rapport Journalier IA",
    subtitle: "Synthèse d'activité quotidienne et détection des anomalies",
  },
  "/admin/data-quality": {
    title: "Qualité des Données",
    subtitle: "Audit d'intégrité de la base de données et couverture de tracking",
  },
  "/admin/audit": {
    title: "Journal des Opérations",
    subtitle: "Traçabilité immuable des actions d'administration (Append-Only)",
  },
};

interface AdminHeaderProps {
  onToggleMobileDrawer: () => void;
}

export function AdminHeader({ onToggleMobileDrawer }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refetch } = useAdminSession();
  const [searchQuery, setSearchQuery] = useState("");

  const currentMeta = PAGE_TITLES[pathname] || {
    title: "Centre de Contrôle SHATER",
    subtitle: "Système Central d'Exploitation & d'Analyse",
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/users?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-[#0D1526]/90 backdrop-blur-md border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between z-20">
      {/* Left side: Mobile Menu + Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileDrawer}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#131E36] border border-[#1E293B]"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Safe
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Search, Status, Refresh, and Public links */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Rechercher élève, commande, session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 w-64 bg-[#080D1A] border border-[#1E293B] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Security Invariant Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-[11px] font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RBAC + RLS Actif</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          title="Actualiser les données"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#131E36] border border-[#1E293B] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Link to public student platform */}
        <Link
          href="/dashboard"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] transition-colors"
        >
          <span>Espace Élève</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
