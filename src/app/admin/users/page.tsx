"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import {
  Users,
  Search,
  MapPin,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  History,
  Activity,
  Layers,
  Phone,
  Tag,
} from "lucide-react";

interface UserItem {
  id: string;
  fullName: string;
  phone: string;
  wilaya: string;
  stream: string;
  createdAt: string;
  status: string;
  firstCampaign: string;
  firstSource: string;
  ordersCount: number;
}

interface UserJourneyData {
  identifier: string;
  userProfile?: {
    id: string;
    fullName?: string;
    phone?: string;
    stream?: string;
    wilaya?: string;
    createdAt?: string;
  };
  attribution?: {
    firstSource?: string;
    firstCampaign?: string;
    lastSource?: string;
    lastCampaign?: string;
  };
  timeline: Array<{
    id: string;
    type: string;
    titleFr: string;
    detailFr: string;
    timestamp: string;
    badgeFr?: string;
  }>;
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

  // User Journey Modal state
  const [selectedJourney, setSelectedJourney] = useState<UserJourneyData | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  const fetchUsers = (searchStr: string = "") => {
    setLoading(true);
    adminFetch(`/api/admin/operations/users?q=${encodeURIComponent(searchStr)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data?.users) {
          setUsers(resData.data.users);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const openJourney = (identifier: string) => {
    setJourneyLoading(true);
    setSelectedJourney(null);
    adminFetch(`/api/admin/operations/users?journey=${encodeURIComponent(identifier)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setSelectedJourney(resData.data);
        }
      })
      .finally(() => setJourneyLoading(false));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Search */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Utilisateurs & Profils Élèves (BAC 2027)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Recherche par nom, téléphone, wilaya et inspection du parcours d'acquisition complet.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher nom, téléphone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-64 bg-[#080D1A] border border-[#1E293B] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            Comptes Inscrits ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[11px]">
                <th className="pb-3">Élève / Identité</th>
                <th className="pb-3">Téléphone</th>
                <th className="pb-3">Wilaya</th>
                <th className="pb-3">Filière</th>
                <th className="pb-3">Campagne d'Origine</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right">Parcours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#131E36]/30 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{u.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-300">{u.phone}</td>
                  <td className="py-3 text-slate-300">{u.wilaya}</td>
                  <td className="py-3 text-indigo-400 font-medium">{u.stream}</td>
                  <td className="py-3">
                    {u.firstCampaign !== "Organique / Direct" ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[10px]">
                        {u.firstCampaign}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">Direct</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      u.status === "Abonné Payé"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : u.status === "Commande en cours"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openJourney(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold transition-colors"
                    >
                      Inspecter Parcours
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Journey Modal / Drawer */}
      {(selectedJourney || journeyLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#080D1A]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Parcours & Chronologie Utilisateur
                  </h3>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {selectedJourney?.userProfile?.fullName || "Inspection de session"} • {selectedJourney?.userProfile?.phone || ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedJourney(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131E36]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {journeyLoading ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  Chargement de la chronologie des événements...
                </div>
              ) : selectedJourney ? (
                <>
                  {/* Attribution Summary Banner */}
                  <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Premier Contact (First Touch)</div>
                      <div className="font-semibold text-indigo-400">
                        {selectedJourney.attribution?.firstCampaign || "Accès Direct"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Source: {selectedJourney.attribution?.firstSource || "direct"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Dernier Contact (Last Touch)</div>
                      <div className="font-semibold text-teal-400">
                        {selectedJourney.attribution?.lastCampaign || "Accès Direct"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Source: {selectedJourney.attribution?.lastSource || "direct"}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-3 relative pl-4 border-l-2 border-[#1E293B] ml-2">
                    {selectedJourney.timeline.map((item) => (
                      <div key={item.id} className="relative space-y-1">
                        <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#0D1526]" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{item.titleFr}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.detailFr}</p>
                        {item.badgeFr && (
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                            {item.badgeFr}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-400">Chargement des utilisateurs...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
