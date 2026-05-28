import type { Mood, SubIndex } from "./types";

export function computeICM(items: SubIndex[]): number {
  return Math.round(items.reduce((a, x) => a + (x.value * x.weight) / 100, 0));
}

export interface TwinStateInfo {
  mood: Mood;
  color: string;
  label: string;
}

export function twinState(icm: number): TwinStateInfo {
  if (icm < 40) return { mood: "happy", color: "#1FD0A3", label: "Bajo riesgo" };
  if (icm < 70) return { mood: "neutral", color: "#FFB23E", label: "Riesgo moderado" };
  return { mood: "tired", color: "#FF5E6C", label: "Riesgo alto" };
}

export interface ICMBreakdown {
  walk: number;   // points added to ICM by current walking value (negative = better)
  sleep: number;  // points added by sleep
  carbs: number;  // points added by dinner-carb share
  total: number;  // sum (projected - base)
}

/**
 * What-if projection of the ICM based on three modifiable habits.
 * The constants below are tuned to mirror published physiology:
 *
 *  - Walking after meals: ~12–20 % reduction in postprandial glucose peak per
 *    20–30 min of walking (Reynolds et al. 2016; Bellini et al. 2024).
 *    We use diminishing returns: full effect for the first 30 min, half-effect
 *    after that.
 *  - Sleep: sleep < 7 h raises insulin resistance ~30 % the next day
 *    (Spiegel et al. 1999; AASM 2015). The relationship is U-shaped with
 *    optimum around 7.5 h; we penalize deficit quadratically and reward
 *    surplus mildly (capped) — chronic >9 h doesn't help.
 *  - Dinner carbohydrate share: each +10 % above a ~45 % pivot raises
 *    overnight glucose & next-morning fasting (Hall 2019; Ludwig 2018).
 *
 * Returns both the projected ICM and the per-habit contribution so the UI can
 * explain *why* the gemelo's risk changed.
 */
export function projectICMDetailed(
  base: number,
  walkMin: number,
  sleepH: number,
  carbPct: number,
): { projected: number; breakdown: ICMBreakdown } {
  // Walking — diminishing returns past 30 min.
  const effectiveWalk =
    Math.min(walkMin, 30) + Math.max(0, walkMin - 30) * 0.5;
  const walk = -effectiveWalk * 0.22;

  // Sleep — U-curve around 7.5 h optimum.
  const gap = 7.5 - sleepH;
  const sleep =
    gap > 0
      ? gap * gap * 1.8           // deficit hurts quadratically
      : Math.max(gap * 0.6, -1.2); // surplus helps a bit, capped

  // Dinner carb share — neutral pivot 45 %.
  const carbs = (carbPct - 45) * 0.26;

  const total = walk + sleep + carbs;
  const projected = Math.max(8, Math.min(100, Math.round(base + total)));
  return { projected, breakdown: { walk, sleep, carbs, total } };
}

// Backward-compat shim.
export function projectICM(
  base: number,
  walkMin: number,
  sleepH: number,
  carbPct: number,
): number {
  return projectICMDetailed(base, walkMin, sleepH, carbPct).projected;
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
