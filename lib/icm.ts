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
 *
 * Calibrated so the demo can reach all 3 twin states from a base of ~59:
 *   • Optimal (walk 60 min, sleep 8.5 h, carbs 20 %) → ~36 (happy  ✓)
 *   • Default  (walk 20 min, sleep 6 h,   carbs 60 %) → ~62 (neutral ✓)
 *   • Worst    (walk 0  min, sleep 4 h,   carbs 80 %) → ~81 (tired   ✓)
 *
 * Each effect is normalized to a ±max range so the full slider travel
 * produces a meaningful and visible change in the gemelo's expression.
 *
 * Science direction:
 *   Walk    — 20-30 min post-meal walk cuts postprandial glucose peak ~20 %
 *             (Reynolds et al. 2016; Bellini et al. 2024).
 *   Sleep   — < 7 h raises next-day insulin resistance ~30 % (Spiegel 1999).
 *             U-shaped optimum ~7.5 h; >9 h stops helping.
 *   Carbs   — Higher glycemic load at dinner → higher fasting glucose
 *             (Hall 2019; Ludwig 2018).
 */
export function projectICMDetailed(
  base: number,
  walkMin: number,
  sleepH: number,
  carbPct: number,
): { projected: number; breakdown: ICMBreakdown } {
  // Walking — max effect at 60 min (−14 pts), diminishing after 30 min.
  const effectiveWalk = Math.min(walkMin, 30) + Math.max(0, walkMin - 30) * 0.5;
  const walk = -(effectiveWalk / 45) * 14;

  // Sleep — U-curve: 7.5 h optimum.
  //   deficit (< 7.5 h): up to +14 pts at 4 h
  //   surplus (> 7.5 h): up to −5 pts at 9 h
  let sleep: number;
  if (sleepH <= 7.5) {
    const deficit = 7.5 - sleepH;           // 0–3.5 h
    sleep = (deficit / 3.5) * 14;           // 0 → +14
  } else {
    const surplus = sleepH - 7.5;           // 0–1.5 h
    sleep = -(surplus / 1.5) * 5;           // 0 → −5
  }

  // Dinner carb share — neutral pivot 45 %, range 20–80 %.
  //   Max −8 pts at 20 %, max +8 pts at 80 %.
  const carbs = ((carbPct - 45) / 35) * 8;

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
