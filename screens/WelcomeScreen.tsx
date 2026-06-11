"use client";
import { useState } from "react";
import { AlertOctagon, Brain, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { peruStats } from "@/lib/mockData";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
  useImage?: boolean;
}

interface Slide {
  badge: string;
  title: string;
  body: string;
  bullets: { value: string; label: string; color: string }[];
  twin: "tired" | "neutral" | "happy";
  Icon: any;
  iconColor: string;
}

const SLIDES: Slide[] = [
  {
    badge: "El problema",
    title: "Una cadena silenciosa",
    body: "El síndrome metabólico avanza sin síntomas. Cuando se detecta, el daño ya es difícil de revertir.",
    bullets: [
      { value: `${peruStats.notHealthy}%`, label: "de adultos peruanos es metabólicamente no saludable", color: "#FB7185" },
      { value: `${peruStats.oneAlteration}%`, label: "tiene al menos 1 alteración metabólica", color: "#FBBF24" },
      { value: `${peruStats.normalWeightAtRisk}%`, label: "con peso normal ya está en riesgo", color: "#A78BFA" },
    ],
    twin: "tired",
    Icon: AlertOctagon,
    iconColor: "#FB7185",
  },
  {
    badge: "La solución",
    title: "Tu gemelo digital",
    body: "Un modelo único que aprende de tu glucosa, sueño, estrés y nutrición para predecir tu riesgo en tiempo real.",
    bullets: [
      { value: "5", label: "sub-índices vigilan tu metabolismo", color: "#60A5FA" },
      { value: "ICM", label: "tu Índice de Carga Metabólica de 0 a 100", color: "#2DD4BF" },
      { value: "What-if", label: "simula cómo cambia tu riesgo con cada hábito", color: "#4ADE80" },
    ],
    twin: "neutral",
    Icon: Brain,
    iconColor: "#60A5FA",
  },
  {
    badge: "Resultados reales",
    title: "Prevenir es posible",
    body: "Los gemelos digitales metabólicos están cambiando la historia de la diabetes en el mundo.",
    bullets: [
      { value: `${peruStats.twinHealthRemission}%`, label: "de remisión de diabetes tipo 2 en 1 año (Twin Health · Cleveland Clinic)", color: "#2DD4BF" },
      { value: "< 15 mg/dL", label: "de error en la predicción glucémica", color: "#60A5FA" },
      { value: "Lima", label: "primer gemelo digital adaptado al contexto peruano", color: "#FBBF24" },
    ],
    twin: "happy",
    Icon: Sparkles,
    iconColor: "#2DD4BF",
  },
];

export function WelcomeScreen({ onNav, appearance, useImage = false }: Props) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;
  const Icon = slide.Icon;

  return (
    <div className="flex flex-col h-full px-6 pb-6">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, k) => (
            <span
              key={k}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: k === i ? 22 : 8,
                backgroundColor: k === i ? "#60A5FA" : "#222C42",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => onNav("createTwin")}
          className="text-sub text-[12px] font-bold active:scale-95"
        >
          Saltar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <TwinAvatar mood={slide.twin} size={150} appearance={appearance} useImage={useImage} />
          <div
            className="absolute -right-1 -bottom-1 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: slide.iconColor,
              color: "#090D17",
              boxShadow: `0 8px 18px ${slide.iconColor}55`,
            }}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div
          className="mt-6 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.2em]"
          style={{ backgroundColor: `${slide.iconColor}1f`, color: slide.iconColor }}
        >
          {slide.badge}
        </div>
        <h1 className="text-txt text-[24px] font-extrabold mt-2 leading-tight">
          {slide.title}
        </h1>
        <p className="text-sub text-[13px] mt-2 max-w-[300px] leading-snug">
          {slide.body}
        </p>

        <ul className="mt-5 space-y-2 w-full max-w-[320px]">
          {slide.bullets.map((b) => (
            <li
              key={b.label}
              className="flex items-center gap-3 bg-card border border-white/[0.08] rounded-[20px] px-3 py-2.5"
            >
              <span
                className="min-w-[58px] text-[15px] font-extrabold text-right tabular-nums"
                style={{ color: b.color }}
              >
                {b.value}
              </span>
              <span className="text-txt text-[12px] leading-snug text-left">
                {b.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => (isLast ? onNav("createTwin") : setI(i + 1))}
          icon={isLast ? <Sparkles size={16} /> : undefined}
        >
          <span className="flex items-center gap-2">
            {isLast ? "Crear mi gemelo digital" : "Continuar"}
            {!isLast && <ChevronRight size={16} />}
          </span>
        </Button>
        {!isLast && (
          <Button variant="ghost" onClick={() => onNav("createTwin")}>
            Comenzar ahora
          </Button>
        )}
      </div>
    </div>
  );
}
