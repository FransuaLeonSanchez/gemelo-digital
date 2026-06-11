import type { Mood } from "@/lib/types";

export interface TwinPalette {
  color: string;     // accent / aura
  glow: string;      // aura glow stop
  cheek: string;
  label: string;
}

export const palettes: Record<Mood, TwinPalette> = {
  happy:   { color: "#2DD4BF", glow: "#2DD4BF", cheek: "#FF9AB3", label: "Saludable" },
  neutral: { color: "#FBBF24", glow: "#FBBF24", cheek: "#FFB7A0", label: "Regular" },
  tired:   { color: "#FB7185", glow: "#FB7185", cheek: "#B97581", label: "En riesgo" },
};

export function getTwinState(icm: number): { mood: Mood; palette: TwinPalette } {
  const mood: Mood = icm < 40 ? "happy" : icm < 70 ? "neutral" : "tired";
  return { mood, palette: palettes[mood] };
}
