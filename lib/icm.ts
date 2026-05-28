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

// What-if simulator (frontend-only math)
export function projectICM(
  base: number,
  walkMin: number,
  sleepH: number,
  carbPct: number,
): number {
  const v = base - walkMin * 0.18 - (sleepH - 6) * 4 + (carbPct - 50) * 0.22;
  return Math.max(8, Math.min(100, Math.round(v)));
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
