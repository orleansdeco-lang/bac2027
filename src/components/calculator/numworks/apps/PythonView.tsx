import React, { useState } from "react";
import { PythonFontSize } from "../types";
import { Play, RotateCcw, Code, Check } from "lucide-react";

interface PythonViewProps {
  fontSize: PythonFontSize;
}

const TEMPLATES = [
  {
    name: "1. Méthode de Dichotomie",
    nameAr: "خوارزمية التنصيف",
    code: `# Recherche du zéro de f(x) = x^2 - 2
def f(x):
    return x**2 - 2

def dichotomie(a, b, e):
    while (b - a) > e:
        m = (a + b) / 2
        if f(a) * f(m) <= 0:
            b = m
        else:
            a = m
    return (a + b) / 2

# Exécution pour sqrt(2) avec précision 0.001
sol = dichotomie(1, 2, 0.001)
print("Racine approchée =", round(sol, 4))
`,
  },
  {
    name: "2. Suite Numérique (Un+1)",
    nameAr: "المتتاليات التراجعية",
    code: `# Calcul du terme Un = 0.5 * Un + 3
def suite_un(n, u0=10):
    u = u0
    for i in range(1, n + 1):
        u = 0.5 * u + 3
    return u

for n in [1, 2, 5, 10]:
    print(f"U({n}) = {suite_un(n):.4f}")
`,
  },
  {
    name: "3. Calcul de Factorielle",
    nameAr: "حساب العاملي n!",
    code: `def fact(n):
    if n <= 1:
        return 1
    res = 1
    for i in range(2, n + 1):
        res *= i
    return res

for k in [4, 5, 6, 7]:
    print(f"{k}! = {fact(k)}")
`,
  },
  {
    name: "4. Nombre Premier",
    nameAr: "اختبار العدد الأولي",
    code: `def est_premier(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

nombres = [17, 21, 29, 35, 41]
for n in nombres:
    print(f"{n} est premier: {est_premier(n)}")
`,
  },
];

export function PythonView({ fontSize }: PythonViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplate(index);
    setCode(TEMPLATES[index].code);
    setTerminalOutput([]);
  };

  const executePythonCode = () => {
    setIsRunning(true);
    setTerminalOutput([">>> Exécution du script Python..."]);

    setTimeout(() => {
      const logs: string[] = [];
      try {
        // Safe runner simulation for standard math Python templates
        if (selectedTemplate === 0) {
          // Dichotomie
          const f = (x: number) => x * x - 2;
          let a = 1,
            b = 2,
            e = 0.001;
          while (b - a > e) {
            const m = (a + b) / 2;
            if (f(a) * f(m) <= 0) b = m;
            else a = m;
          }
          const sol = (a + b) / 2;
          logs.push(`Racine approchée = ${sol.toFixed(4)}`);
        } else if (selectedTemplate === 1) {
          // Suite
          const suite = (n: number, u0: number) => {
            let u = u0;
            for (let i = 1; i <= n; i++) u = 0.5 * u + 3;
            return u;
          };
          [1, 2, 5, 10].forEach((n) => {
            logs.push(`U(${n}) = ${suite(n, 10).toFixed(4)}`);
          });
        } else if (selectedTemplate === 2) {
          // Factorielle
          const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
          [4, 5, 6, 7].forEach((k) => {
            logs.push(`${k}! = ${fact(k)}`);
          });
        } else if (selectedTemplate === 3) {
          // Premier
          const isPrime = (n: number) => {
            if (n < 2) return false;
            for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
            return true;
          };
          [17, 21, 29, 35, 41].forEach((n) => {
            logs.push(`${n} est premier: ${isPrime(n) ? "True" : "False"}`);
          });
        } else {
          logs.push("Script exécuté avec succès (Code 0)");
        }
      } catch (err: any) {
        logs.push(`Erreur d'exécution: ${err?.message || "Erreur"}`);
      }

      setTerminalOutput([
        `>>> Python 3.11 NumWorks Engine`,
        ...logs,
        `>>> [Terminé en 12ms]`,
      ]);
      setIsRunning(false);
    }, 300);
  };

  const isLarge = fontSize === "large";

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-900 text-slate-100 font-mono select-none overflow-hidden text-xs">
      {/* Template selector tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-950 border-b border-slate-800 overflow-x-auto shrink-0">
        <span className="text-[10px] text-amber-400 font-bold px-1 flex items-center gap-1 shrink-0">
          <Code className="w-3 h-3" />
          <span>Modèles:</span>
        </span>
        {TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectTemplate(idx)}
            className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-all cursor-pointer ${
              selectedTemplate === idx
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 p-2 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-sans">
          <span>ÉDITEUR DE CODE PYTHON</span>
          <span className="text-amber-400 font-mono">script.py</span>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className={`flex-1 w-full bg-slate-950 text-emerald-400 p-2 rounded-lg border border-slate-800 font-mono outline-none resize-none leading-relaxed shadow-inner ${
            isLarge ? "text-xs" : "text-[11px]"
          }`}
        />
      </div>

      {/* Terminal / Output Area */}
      {terminalOutput.length > 0 && (
        <div className="h-24 mx-2 mb-1 p-2 bg-black/90 border border-slate-700 rounded-lg overflow-y-auto font-mono text-[10px] text-cyan-300 space-y-0.5 shrink-0 shadow-inner">
          {terminalOutput.map((line, i) => (
            <div key={i} className="leading-tight">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => handleSelectTemplate(selectedTemplate)}
          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Réinitialiser</span>
        </button>

        <button
          type="button"
          onClick={executePythonCode}
          disabled={isRunning}
          className="px-3.5 py-1 rounded bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? "Exécution..." : "Exécuter le script"}</span>
        </button>
      </div>
    </div>
  );
}
