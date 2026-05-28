import type { Mood } from "@/lib/types";

export interface TwinPalette {
  color: string;     // accent / aura
  glow: string;      // aura glow stop
  cheek: string;
  label: string;
}

export const palettes: Record<Mood, TwinPalette> = {
  happy:   { color: "#1FD0A3", glow: "#1FD0A3", cheek: "#FF9AB3", label: "Saludable" },
  neutral: { color: "#FFB23E", glow: "#FFB23E", cheek: "#FFB7A0", label: "Regular" },
  tired:   { color: "#FF5E6C", glow: "#FF5E6C", cheek: "#B97581", label: "En riesgo" },
};

export function getTwinState(icm: number): { mood: Mood; palette: TwinPalette } {
  const mood: Mood = icm < 40 ? "happy" : icm < 70 ? "neutral" : "tired";
  return { mood, palette: palettes[mood] };
}
