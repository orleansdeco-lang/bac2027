import React from "react";
import {
  NumWorksAppId,
  NumWorksSettings,
  CalculationHistoryItem,
  GraphFunction,
} from "./types";
import { NumWorksStatus } from "./NumWorksStatus";
import { HomeView } from "./apps/HomeView";
import { CalculsView } from "./apps/CalculsView";
import { GrapheurView } from "./apps/GrapheurView";
import { PythonView } from "./apps/PythonView";
import { StatistiquesView } from "./apps/StatistiquesView";
import { ProbabilitesView } from "./apps/ProbabilitesView";
import { EquationsView } from "./apps/EquationsView";
import { ParametresView } from "./apps/ParametresView";

interface NumWorksScreenProps {
  currentApp: NumWorksAppId;
  setCurrentApp: (app: NumWorksAppId) => void;
  homeSelectedIndex: number;
  settings: NumWorksSettings;
  setSettings: React.Dispatch<React.SetStateAction<NumWorksSettings>>;
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  history: CalculationHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<CalculationHistoryItem[]>>;
  ansValue: string;
  setAnsValue: React.Dispatch<React.SetStateAction<string>>;
  functions: GraphFunction[];
  setFunctions: React.Dispatch<React.SetStateAction<GraphFunction[]>>;
  isShiftActive: boolean;
  isAlphaActive: boolean;
  onExecuteCalculs: () => void;
  isPoweredOn: boolean;
  isFullscreen?: boolean;
}

export function NumWorksScreen({
  currentApp,
  setCurrentApp,
  homeSelectedIndex,
  settings,
  setSettings,
  expression,
  setExpression,
  history,
  setHistory,
  ansValue,
  setAnsValue,
  functions,
  setFunctions,
  isShiftActive,
  isAlphaActive,
  onExecuteCalculs,
  isPoweredOn,
  isFullscreen = false,
}: NumWorksScreenProps) {
  return (
    <div className="w-full bg-[#0B0F19] p-2 sm:p-2.5 rounded-[20px] shadow-[inset_0_3px_8px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.15)] border border-slate-800/80 relative">
      {/* Glossy LCD Panel Housing */}
      <div
        className={`w-full rounded-[14px] overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.35)] flex flex-col transition-all relative border border-slate-400/40 bg-white dark:bg-slate-900 ${
          isFullscreen
            ? "h-[290px] sm:h-[320px]"
            : "h-[260px] sm:h-[280px]"
        }`}
        style={{
          filter: isPoweredOn
            ? `brightness(${settings.brightness}%)`
            : "brightness(0%)",
        }}
      >
        {isPoweredOn ? (
          <>
            {/* Top Status Bar in NumWorks Yellow #FFB703 */}
            <NumWorksStatus
              appId={currentApp}
              angleUnit={settings.angleUnit}
              isShiftActive={isShiftActive}
              isAlphaActive={isAlphaActive}
            />

            {/* App View Area */}
            <div className="flex-1 w-full overflow-hidden relative">
              {currentApp === "home" && (
                <HomeView
                  selectedIndex={homeSelectedIndex}
                  onSelectApp={(appId) => setCurrentApp(appId)}
                />
              )}

              {currentApp === "calculs" && (
                <CalculsView
                  expression={expression}
                  setExpression={setExpression}
                  history={history}
                  setHistory={setHistory}
                  angleUnit={settings.angleUnit}
                  resultFormat={settings.resultFormat}
                  ansValue={ansValue}
                  setAnsValue={setAnsValue}
                  onExecute={onExecuteCalculs}
                />
              )}

              {currentApp === "grapheur" && (
                <GrapheurView
                  functions={functions}
                  setFunctions={setFunctions}
                  angleUnit={settings.angleUnit}
                />
              )}

              {currentApp === "python" && (
                <PythonView fontSize={settings.pythonFontSize} />
              )}

              {currentApp === "statistiques" && <StatistiquesView />}

              {currentApp === "probabilites" && <ProbabilitesView />}

              {currentApp === "equations" && <EquationsView />}

              {currentApp === "parametres" && (
                <ParametresView
                  settings={settings}
                  setSettings={setSettings}
                />
              )}
            </div>

            {/* Subtle Glass Reflection Glare Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none rounded-[14px] z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-[#05070B] flex items-center justify-center text-slate-700 text-xs font-mono">
            Appuyez sur le bouton Marche pour allumer
          </div>
        )}
      </div>
    </div>
  );
}
