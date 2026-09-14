export const ENERGY_STATE_LABELS: Record<string, { ar: string; fr: string }> = {
  good: { ar: "ممتازة", fr: "Optimale" },
  normal: { ar: "طبيعية", fr: "Normale" },
  tired: { ar: "مرهق", fr: "Fatigué" },
  stressed: { ar: "متوتر", fr: "Stressé" },
};

export function formatEnergyState(state?: string | null, isAr = true): string {
  if (!state) return isAr ? "طبيعية" : "Normale";
  const mapped = ENERGY_STATE_LABELS[state];
  return mapped ? (isAr ? mapped.ar : mapped.fr) : state;
}
