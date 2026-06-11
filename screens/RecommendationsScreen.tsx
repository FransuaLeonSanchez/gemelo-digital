"use client";
import { useState } from "react";
import { Check, Leaf, Activity, Moon, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { recommendations } from "@/lib/mockData";

const ICONS: Record<string, any> = {
  Nutrición: Leaf,
  Actividad: Activity,
  Sueño: Moon,
};

export function RecommendationsScreen() {
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-3 pb-[100px]">
      <h1 className="text-txt text-[22px] font-extrabold mb-1">Recomendaciones</h1>
      <p className="text-sub text-[12px] mb-4">
        Acciones personalizadas según tu día. Tu gemelo las eligió para ti.
      </p>

      <div className="space-y-3">
        {recommendations.map((r, i) => {
          const Icon = ICONS[r.tag] ?? Sparkles;
          const isDone = !!done[i];
          return (
            <Card key={i} accent={r.color}>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${r.color}22`, color: r.color }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <Pill color={r.color}>{r.tag}</Pill>
                  <p
                    className={`text-txt text-[14px] font-extrabold mt-1.5 leading-tight ${
                      isDone ? "line-through opacity-60" : ""
                    }`}
                  >
                    {r.title}
                  </p>
                  <p className="text-sub text-[12px] mt-1 leading-snug">{r.reason}</p>
                  <button
                    onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                    className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition ${
                      isDone
                        ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/40"
                        : "bg-card2 text-sub border border-white/[0.08]"
                    }`}
                  >
                    <Check size={12} />
                    {isDone ? "Hecho" : "Marcar como hecho"}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
