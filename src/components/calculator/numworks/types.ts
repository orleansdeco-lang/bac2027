export type NumWorksAppId =
  | "home"
  | "calculs"
  | "grapheur"
  | "python"
  | "statistiques"
  | "probabilites"
  | "equations"
  | "parametres";

export type AngleUnit = "rad" | "deg";
export type ResultFormat = "exact" | "decimal";
export type WritingFormat = "natural" | "linear";
export type ComplexFormat = "real" | "cartesian";
export type PythonFontSize = "small" | "large";

export interface NumWorksSettings {
  angleUnit: AngleUnit;
  resultFormat: ResultFormat;
  writingFormat: WritingFormat;
  complexFormat: ComplexFormat;
  brightness: number; // 30 - 100
  pythonFontSize: PythonFontSize;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  exactResult: string;
  decimalResult: string;
  timestamp: string;
}

export interface GraphFunction {
  id: string;
  name: string; // e.g. "f(x)", "g(x)"
  rawExpr: string; // e.g. "2*x^2 + 3*x - 1"
  color: string;
  enabled: boolean;
}

export interface StatRow {
  id: string;
  val: number;
  freq: number;
}
