import { AngleUnit } from "./types";

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Convert float to exact fraction string if rational
export function toExactFraction(val: number): string | null {
  if (!Number.isFinite(val) || Math.abs(val) > 1e6) return null;
  if (Number.isInteger(val)) return String(val);

  const tolerance = 1.0e-7;
  let h1 = 1,
    h2 = 0,
    k1 = 0,
    k2 = 1;
  let b = Math.abs(val);

  for (let i = 0; i < 20; i++) {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;

    if (Math.abs(Math.abs(val) - h1 / k1) <= Math.abs(val) * tolerance || k1 > 10000) {
      break;
    }
    const diff = b - a;
    if (Math.abs(diff) < 1e-12) break;
    b = 1 / diff;
  }

  if (k1 > 1 && k1 < 10000 && Math.abs(Math.abs(val) - h1 / k1) < 1e-5) {
    const sign = val < 0 ? "-" : "";
    return `${sign}${h1}/${k1}`;
  }
  return null;
}

// Factorial calculation
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Combinations nCr = n! / (r! * (n - r)!)
export function combinations(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  r = Math.min(r, n - r);
  let c = 1;
  for (let i = 0; i < r; i++) {
    c = (c * (n - i)) / (i + 1);
  }
  return Math.round(c);
}

// Safely evaluate standard math expressions
export function evaluateExpression(
  rawExpr: string,
  angleUnit: AngleUnit = "rad",
  ans: string = "0"
): { numeric: number; exact: string; decimal: string; error?: string } {
  try {
    if (!rawExpr.trim()) {
      return { numeric: 0, exact: "0", decimal: "0" };
    }

    let expr = rawExpr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "Math.PI")
      .replace(/Ans/g, `(${ans || "0"})`)
      .replace(/²/g, "^2")
      .replace(/×10\^/g, "*10^")
      .replace(/e(?![a-zA-Z0-9_])/g, "Math.E");

    // Replace powers: e.g. a^b -> Math.pow(a, b)
    // Handle nested or chained powers using a recursive regex
    let powerIteration = 0;
    while (expr.includes("^") && powerIteration < 10) {
      powerIteration++;
      expr = expr.replace(
        /([a-zA-Z0-9_.]+|\([^()]+\))\^([a-zA-Z0-9_.]+|\([^()]+\))/g,
        "Math.pow($1,$2)"
      );
    }

    // Replace square roots: √(x) or √(number)
    expr = expr.replace(/√\(([^)]+)\)/g, "Math.sqrt($1)");
    expr = expr.replace(/√([0-9.]+)/g, "Math.sqrt($1)");

    // Angle conversion helpers
    const degToRad = "(Math.PI/180)*";
    const radToDeg = "*(180/Math.PI)";

    if (angleUnit === "deg") {
      expr = expr.replace(/\bsin\(([^)]+)\)/g, `Math.sin(${degToRad}($1))`);
      expr = expr.replace(/\bcos\(([^)]+)\)/g, `Math.cos(${degToRad}($1))`);
      expr = expr.replace(/\btan\(([^)]+)\)/g, `Math.tan(${degToRad}($1))`);
      expr = expr.replace(/\basin\(([^)]+)\)/g, `(Math.asin($1)${radToDeg})`);
      expr = expr.replace(/\bacos\(([^)]+)\)/g, `(Math.acos($1)${radToDeg})`);
      expr = expr.replace(/\batan\(([^)]+)\)/g, `(Math.atan($1)${radToDeg})`);
    } else {
      expr = expr.replace(/\bsin\(([^)]+)\)/g, "Math.sin($1)");
      expr = expr.replace(/\bcos\(([^)]+)\)/g, "Math.cos($1)");
      expr = expr.replace(/\btan\(([^)]+)\)/g, "Math.tan($1)");
      expr = expr.replace(/\basin\(([^)]+)\)/g, "Math.asin($1)");
      expr = expr.replace(/\bacos\(([^)]+)\)/g, "Math.acos($1)");
      expr = expr.replace(/\batan\(([^)]+)\)/g, "Math.atan($1)");
    }

    expr = expr.replace(/\bln\(([^)]+)\)/g, "Math.log($1)");
    expr = expr.replace(/\blog\(([^)]+)\)/g, "Math.log10($1)");
    expr = expr.replace(/\bexp\(([^)]+)\)/g, "Math.exp($1)");
    expr = expr.replace(/\babs\(([^)]+)\)/g, "Math.abs($1)");

    // Check for disallowed characters for safety
    if (/[^0-9+\-*/()., MathPIEpowsqrtsincoltanbgx10]/.test(expr)) {
      // Discard unsafe identifiers
      const sanitized = expr.replace(/[^0-9+\-*/().,MathPIEpowsqrtsincoltanbg]/g, "");
      expr = sanitized;
    }

    // Safely execute via Function
    const fn = new Function(`"use strict"; return (${expr});`);
    const val = fn();

    if (typeof val !== "number" || isNaN(val)) {
      return { numeric: NaN, exact: "Erreur", decimal: "Erreur", error: "Valeur indéfinie" };
    }

    // Format results
    const decStr = Math.abs(val) < 1e-12 ? "0" : Number(val.toFixed(9)).toString();
    const fracStr = toExactFraction(val);
    const exactStr = fracStr || decStr;

    return {
      numeric: val,
      exact: exactStr,
      decimal: decStr,
    };
  } catch (err: any) {
    return {
      numeric: NaN,
      exact: "Erreur de syntaxe",
      decimal: "Erreur de syntaxe",
      error: err?.message || "Erreur",
    };
  }
}

// Evaluate a function at a given x
export function evalFunctionAt(
  rawExpr: string,
  x: number,
  angleUnit: AngleUnit = "rad"
): number {
  try {
    let expr = rawExpr
      .replace(/x/g, `(${x})`)
      .replace(/X/g, `(${x})`);
    const res = evaluateExpression(expr, angleUnit, "0");
    return res.numeric;
  } catch {
    return NaN;
  }
}

// Normal Distribution PDF and CDF
// Standard error function approximation (Abramowitz and Stegun 7.1.26)
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function normalPdf(x: number, mean: number, std: number): number {
  if (std <= 0) return 0;
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
  return coefficient * Math.exp(exponent);
}

export function normalCdf(x: number, mean: number, std: number): number {
  if (std <= 0) return x >= mean ? 1 : 0;
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
}

// Binomial Distribution PMF
export function binomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Quadratic Equation Solver: ax^2 + bx + c = 0
export interface QuadraticResult {
  a: number;
  b: number;
  c: number;
  delta: number;
  rootType: "two-real" | "one-double" | "two-complex" | "linear" | "invalid";
  x1?: string;
  x2?: string;
  x0?: string;
  x1Dec?: number;
  x2Dec?: number;
  x0Dec?: number;
  vertexX?: number;
  vertexY?: number;
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) {
    if (b === 0) {
      return { a, b, c, delta: 0, rootType: "invalid" };
    }
    const root = -c / b;
    return {
      a,
      b,
      c,
      delta: 0,
      rootType: "linear",
      x0: toExactFraction(root) || root.toFixed(4),
      x0Dec: root,
    };
  }

  const delta = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = -delta / (4 * a);

  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const r1 = (-b - sqrtDelta) / (2 * a);
    const r2 = (-b + sqrtDelta) / (2 * a);

    // Exact representation check
    const isPerfSquare = Number.isInteger(sqrtDelta);
    let x1Str: string;
    let x2Str: string;

    if (isPerfSquare) {
      x1Str = toExactFraction(r1) || r1.toFixed(4);
      x2Str = toExactFraction(r2) || r2.toFixed(4);
    } else {
      x1Str = `(${-b} - √${delta}) / ${2 * a} ≈ ${r1.toFixed(4)}`;
      x2Str = `(${-b} + √${delta}) / ${2 * a} ≈ ${r2.toFixed(4)}`;
    }

    return {
      a,
      b,
      c,
      delta,
      rootType: "two-real",
      x1: x1Str,
      x2: x2Str,
      x1Dec: r1,
      x2Dec: r2,
      vertexX,
      vertexY,
    };
  } else if (delta === 0) {
    const r0 = -b / (2 * a);
    return {
      a,
      b,
      c,
      delta,
      rootType: "one-double",
      x0: toExactFraction(r0) || r0.toFixed(4),
      x0Dec: r0,
      vertexX,
      vertexY,
    };
  } else {
    // Complex roots: (-b ± i*sqrt(-delta)) / 2a
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-delta) / (2 * Math.abs(a));
    const realPartStr = toExactFraction(realPart) || realPart.toFixed(4);
    const imagPartStr = toExactFraction(imagPart) || imagPart.toFixed(4);

    return {
      a,
      b,
      c,
      delta,
      rootType: "two-complex",
      x1: `${realPartStr} - ${imagPartStr} i`,
      x2: `${realPartStr} + ${imagPartStr} i`,
      vertexX,
      vertexY,
    };
  }
}
