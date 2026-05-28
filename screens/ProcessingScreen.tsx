"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
}

const STEPS = [
  "Detectando rostro y puntos faciales…",
  "Generando expresiones del gemelo (saludable · neutral · fatigado)…",
  "Sincronizando dispositivos conectados…",
  "Cargando perfil metabólico base (referencia Perú)…",
  "Calibrando tu Índice de Carga Metabólica…",
];

export function ProcessingScreen({ onNav, appearance }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: any[] = [];
    STEPS.forEach((_, i) =>
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 850)),
    );
    timers.push(setTimeout(() => onNav("home"), STEPS.length * 850 + 600));
    return () => timers.forEach(clearTimeout);
  }, [onNav]);

  return (
    <div className="flex flex-col h-full px-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <TwinAvatar mood="neutral" size={180} appearance={appearance} />
        <div className="mt-7 text-center">
          <h2 className="text-txt text-[20px] font-extrabold">Creando tu gemelo</h2>
          <p className="text-sub text-[12px] mt-1">Esto solo tomará unos segundos…</p>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 text-[12px] transition-opacity ${
                done ? "opacity-100" : current ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: done ? "#1FD0A322" : current ? "#4DA3FF22" : "#262D3D",
                  border: `1px solid ${done ? "#1FD0A3" : current ? "#4DA3FF" : "#262D3D"}`,
                }}
              >
                {done ? (
                  <Check size={12} className="text-brand-teal" />
                ) : current ? (
                  <Loader2 size={12} className="text-brand-blue animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-hint" />
                )}
              </span>
              <span className={done ? "text-txt" : "text-sub"}>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
