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
}: NumWorksScreenProps) {
  return (
    <div className="w-full bg-[#0F172A] p-2.5 sm:p-3 rounded-2xl shadow-inner border border-slate-700/80">
      {/* Screen Display Frame */}
      <div
        className="w-full h-[260px] sm:h-[280px] bg-white rounded-xl overflow-hidden shadow-md flex flex-col transition-all relative border border-slate-300"
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
          </>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center text-slate-700 text-xs font-mono">
            Appuyez sur le bouton Marche pour allumer
          </div>
        )}
      </div>
    </div>
  );
}
