import React from "react";
import { NumWorksAppId } from "../types";
import {
  Calculator,
  LineChart,
  Terminal,
  BarChart2,
  PieChart,
  Equal,
  Settings,
} from "lucide-react";

interface HomeViewProps {
  selectedIndex: number;
  onSelectApp: (appId: NumWorksAppId) => void;
}

export const APPS_LIST: {
  id: NumWorksAppId;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  badge: string;
}[] = [
  {
    id: "calculs",
    name: "Calculs",
    nameAr: "الحسابات",
    icon: <Calculator className="w-5 h-5" />,
    bgGradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-400",
    badge: "1",
  },
  {
    id: "grapheur",
    name: "Grapheur",
    nameAr: "الراسم البياني",
    icon: <LineChart className="w-5 h-5" />,
    bgGradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-400",
    badge: "2",
  },
  {
    id: "python",
    name: "Python",
    nameAr: "بايثون",
    icon: <Terminal className="w-5 h-5" />,
    bgGradient: "from-amber-500 to-yellow-600",
    borderColor: "border-amber-400",
    badge: "3",
  },
  {
    id: "statistiques",
    name: "Statistiques",
    nameAr: "الإحصاء",
    icon: <BarChart2 className="w-5 h-5" />,
    bgGradient: "from-purple-500 to-violet-600",
    borderColor: "border-purple-400",
    badge: "4",
  },
  {
    id: "probabilites",
    name: "Probabilités",
    nameAr: "الاحتمالات",
    icon: <PieChart className="w-5 h-5" />,
    bgGradient: "from-rose-500 to-pink-600",
    borderColor: "border-rose-400",
    badge: "5",
  },
  {
    id: "equations",
    name: "Équations",
    nameAr: "المعادلات",
    icon: <Equal className="w-5 h-5" />,
    bgGradient: "from-orange-500 to-amber-600",
    borderColor: "border-orange-400",
    badge: "6",
  },
  {
    id: "parametres",
    name: "Paramètres",
    nameAr: "الإعدادات",
    icon: <Settings className="w-5 h-5" />,
    bgGradient: "from-slate-600 to-slate-700",
    borderColor: "border-slate-400",
    badge: "⚙",
  },
];

export function HomeView({ selectedIndex, onSelectApp }: HomeViewProps) {
  return (
    <div className="w-full h-full p-2.5 overflow-y-auto flex flex-col justify-between select-none bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
      {/* Top micro subtitle */}
      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1 mb-1 flex items-center justify-between">
        <span>CHOISISSEZ UNE APPLICATION</span>
        <span className="text-[9px] font-mono opacity-70">Appuyer sur [OK]</span>
      </div>

      {/* Grid of Apps: 3 columns x 2 rows (+ 1 centered setting) */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {APPS_LIST.slice(0, 6).map((app, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => onSelectApp(app.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer border text-center ${
                isSelected
                  ? `bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500 -translate-y-0.5 ${app.borderColor}`
                  : "bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:bg-white hover:shadow-xs"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${app.bgGradient} text-white flex items-center justify-center shadow-xs mb-1`}
              >
                {app.icon}
              </div>
              <span className="text-[11px] font-bold tracking-tight leading-tight line-clamp-1">
                {app.name}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {app.nameAr}
              </span>

              {/* Little badge number */}
              <span className="absolute top-1 right-1 text-[8px] font-mono text-slate-400 font-semibold">
                {app.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Paramètres bar at the bottom */}
      <button
        type="button"
        onClick={() => onSelectApp("parametres")}
        className={`mt-2 w-full py-1.5 px-3 rounded-lg flex items-center justify-between text-xs font-bold transition-all cursor-pointer border ${
          selectedIndex === 6
            ? "bg-slate-800 text-white shadow-sm ring-2 ring-blue-500 border-slate-700"
            : "bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Paramètres (الإعدادات العامة)</span>
        </div>
        <span className="text-[9px] font-mono opacity-60">rad • normal</span>
      </button>
    </div>
  );
}
