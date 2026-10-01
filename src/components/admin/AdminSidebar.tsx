"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Compass,
  MessageSquare,
  Megaphone,
  Radio,
  Filter,
  TrendingUp,
  FileText,
  Bug,
  Layers,
  Bot,
  Sparkles,
  Activity,
  History,
  Shield,
  LogOut,
  ChevronRight,
  Lock,
  FileCheck,
  Package,
} from "lucide-react";
import { useAdminSession } from "@/lib/admin/client";
import { AdminPermission } from "@/lib/admin/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: AdminPermission;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "OPÉRATIONS & ANALYTICS",
    items: [
      {
        name: "Tableau de Bord",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "platform.read",
      },
      {
        name: "Visiteurs en Direct",
        href: "/admin/visitors",
        icon: Radio,
        permission: "analytics.read",
        badge: "Live",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      },
      {
        name: "Acquisition & Canaux",
        href: "/admin/acquisition",
        icon: TrendingUp,
        permission: "analytics.read",
      },
      {
        name: "Entonnoir de Conversion",
        href: "/admin/acquisition/funnel",
        icon: Filter,
        permission: "analytics.read",
      },
      {
        name: "Campagnes Marketing",
        href: "/admin/acquisition/campaigns",
        icon: Megaphone,
        permission: "analytics.read",
      },
      {
        name: "Performance des Pages",
        href: "/admin/analytics/pages",
        icon: FileText,
        permission: "analytics.read",
      },
      {
        name: "Débogueur de Campagnes",
        href: "/admin/campaign-debugger",
        icon: Bug,
        permission: "platform.read",
      },
    ],
  },
  {
    label: "CLIENTS & REVENUS",
    items: [
      {
        name: "Utilisateurs & Élèves",
        href: "/admin/users",
        icon: Users,
        permission: "students.read",
      },
      {
        name: "Commandes COD & Packs",
        href: "/admin/orders",
        icon: Package,
        permission: "orders.read",
        badge: "COD",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      },
      {
        name: "Publicités Internes",
        href: "/admin/ads",
        icon: Layers,
        permission: "ads.read",
      },
    ],
  },
  {
    label: "CONTENU & PÉDAGOGIE",
    items: [
      {
        name: "Contenu des Cours",
        href: "/admin/content",
        icon: BookOpen,
        permission: "content.read",
      },
      {
        name: "Banque d'Exercices",
        href: "/admin/exercises",
        icon: HelpCircle,
        permission: "exercises.read",
      },
      {
        name: "Diagnostic & Apprentissage",
        href: "/admin/learning",
        icon: GraduationCap,
        permission: "learning.read",
      },
      {
        name: "Orientation Universitaire",
        href: "/admin/orientation",
        icon: Compass,
        permission: "orientation.read",
      },
      {
        name: "Diwan & Espaces d'Étude",
        href: "/admin/study-rooms",
        icon: MessageSquare,
        permission: "study_rooms.read",
      },
    ],
  },
  {
    label: "INTELLIGENCE & SYSTÈME",
    items: [
      {
        name: "Assistant IA Opérations",
        href: "/admin/ai",
        icon: Bot,
        permission: "ai.use",
        badge: "Garde-Fou",
      },
      {
        name: "Rapport Journalier IA",
        href: "/admin/ai/daily-report",
        icon: Sparkles,
        permission: "platform.read",
        badge: "Quotidien",
      },
      {
        name: "Santé du Suivi",
        href: "/admin/analytics/health",
        icon: Activity,
        permission: "platform.read",
      },
      {
        name: "Qualité des Données",
        href: "/admin/data-quality",
        icon: FileCheck,
        permission: "platform.read",
      },
      {
        name: "Journal des Opérations",
        href: "/admin/audit",
        icon: History,
        permission: "audit.read",
      },
    ],
  },
];

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAdminSession();

  const roleBadgeColor =
    user?.role === "OWNER"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
      : user?.role === "OPERATOR"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
      : "bg-teal-500/10 text-teal-400 border-teal-500/30";

  return (
    <aside className="w-72 bg-[#0D1526] border-r border-[#1E293B] flex flex-col h-full select-none text-left">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-wide text-base">SHATER Control</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              OPERATIONS CENTER v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Operator Badge */}
      <div className="px-4 py-2.5 bg-[#080D1A]/80 border-b border-[#1E293B]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-[130px]">
            {user?.email || "Opérateur SHATER"}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
        >
          {user?.role || "OPERATOR"}
        </span>
      </div>

      {/* Navigation List grouped */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              {group.label}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const allowed = !item.permission || hasPermission(item.permission);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#131E36]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-indigo-400"
                          : "text-slate-400 group-hover:text-slate-300"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.badgeColor || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                        {item.badge}
                      </span>
                    )}
                    {!allowed && (
                      <span title="Accès restreint RBAC">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer & Logout */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0A101D] space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion Sécurisée</span>
        </button>

        <div className="text-center text-[10px] text-slate-400 font-mono">
          Protocole Sécurité: HMAC+JWT • RLS Actif
        </div>
      </div>
    </aside>
  );
}
