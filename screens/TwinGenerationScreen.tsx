"use client";
import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  onComplete: () => void; // called when done → sets useImage = true in parent
}

const STEPS = [
  { label: "Analizando características faciales…",      twin: null },
  { label: "Generando tu gemelo saludable…",             twin: "happy"   },
  { label: "Generando tu gemelo en estado regular…",    twin: "neutral"  },
  { label: "Generando tu gemelo en riesgo…",             twin: "tired"   },
  { label: "Calibrando expresiones y aura metabólica…", twin: null       },
];

const STATE_META = {
  happy:   { label: "Saludable",  color: "#2DD4BF" },
  neutral: { label: "Regular",    color: "#FBBF24" },
  tired:   { label: "En riesgo",  color: "#FB7185" },
};

export function TwinGenerationScreen({ onNav, onComplete }: Props) {
  const [step, setStep] = useState(0);   // 0 = nothing done yet
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 900));
    });
    timers.push(setTimeout(() => setDone(true), STEPS.length * 900 + 300));
    return () => timers.forEach(clearTimeout);
  }, []);

  const revealed = STEPS.slice(0, step)
    .map((s) => s.twin)
    .filter(Boolean) as string[];

  return (
    <div className="flex flex-col h-full px-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Spinner or success icon */}
        {!done ? (
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue"
              style={{ animation: "spin 1.1s linear infinite" }}
            />
            <Sparkles size={28} className="text-brand-blue" />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-brand-teal/15 border-2 border-brand-teal flex items-center justify-center">
            <Sparkles size={36} className="text-brand-teal" />
          </div>
        )}

        <div className="mt-7 text-center">
          <h2 className="text-txt text-[22px] font-extrabold">
            {done ? "¡Tu gemelo está listo!" : "Generando tu gemelo…"}
          </h2>
          <p className="text-sub text-[12px] mt-1">
            {done
              ? "Tus 3 estados metabólicos han sido creados."
              : "La IA está personalizando tus 3 estados."}
          </p>
        </div>

        {/* Step list */}
        <ul className="mt-6 w-full space-y-2.5">
          {STEPS.map((s, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <li
                key={i}
                className={`flex items-center gap-3 text-[12.5px] transition-opacity ${
                  isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-35"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isDone
                      ? "#2DD4BF22"
                      : isActive
                      ? "#60A5FA22"
                      : "#222C42",
                    border: `1px solid ${
                      isDone ? "#2DD4BF" : isActive ? "#60A5FA" : "#222C42"
                    }`,
                  }}
                >
                  {isDone ? (
                    <Check size={12} className="text-brand-teal" />
                  ) : isActive ? (
                    <Loader2 size={12} className="text-brand-blue animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-hint" />
                  )}
                </span>
                <span className={isDone ? "text-txt" : "text-sub"}>{s.label}</span>
              </li>
            );
          })}
        </ul>

        {/* Preview of generated twins */}
        {revealed.length > 0 && (
          <div className="mt-6 flex gap-3 justify-center">
            {(["happy", "neutral", "tired"] as const).map((mood) => {
              const m = STATE_META[mood];
              const ready = revealed.includes(mood);
              return (
                <div key={mood} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-[82px] h-[82px] rounded-[20px] overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: ready ? m.color : "#222C42",
                      opacity: ready ? 1 : 0.25,
                      boxShadow: ready ? `0 4px 16px ${m.color}44` : "none",
                      transition: "all 0.5s ease",
                    }}
                  >
                    {ready ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/images/twin/${mood}.png`}
                        alt={m.label}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-card2" />
                    )}
                  </div>
                  <span
                    className="text-[10px] font-extrabold"
                    style={{ color: ready ? m.color : "#5D6883" }}
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {done && (
        <Button
          onClick={() => {
            onComplete();
            onNav("profileForm");
          }}
          icon={<Sparkles size={16} />}
        >
          Ver mi gemelo
        </Button>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
