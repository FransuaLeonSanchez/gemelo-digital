"use client";
import { useMemo, useState } from "react";
import { Sparkles, TrendingDown, TrendingUp, Minus, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { projectICM, twinState } from "@/lib/icm";
import { icmToday } from "@/lib/mockData";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
}

export function TwinScreen({ onNav, appearance }: Props) {
  const [walk, setWalk] = useState(20);
  const [sleep, setSleep] = useState(6);
  const [carbs, setCarbs] = useState(60);

  const projected = useMemo(
    () => projectICM(icmToday, walk, sleep, carbs),
    [walk, sleep, carbs],
  );
  const ts = twinState(projected);
  const delta = projected - icmToday;

  const message =
    delta < 0
      ? {
          icon: <TrendingDown size={16} />,
          color: "#1FD0A3",
          text: `Si cumples este plan, tu riesgo bajaría ${Math.abs(delta)} puntos hoy.`,
        }
      : delta > 0
      ? {
          icon: <TrendingUp size={16} />,
          color: "#FF5E6C",
          text: `Cuidado: este escenario subiría tu riesgo ${delta} puntos.`,
        }
      : {
          icon: <Minus size={16} />,
          color: "#FFB23E",
          text: "Este escenario mantiene tu riesgo igual.",
        };

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-3 pb-[110px]">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-txt text-[20px] font-extrabold">Mi gemelo</h1>
        <Pill color={ts.color}>{ts.label}</Pill>
      </div>

      <div
        className="flex flex-col items-center justify-center rounded-3xl py-5 mb-4"
        style={{
          background: `radial-gradient(120% 90% at 50% 10%, ${ts.color}22, transparent 70%), linear-gradient(180deg, #161B27, #11151F)`,
          border: "1px solid #262D3D",
          transition: "background 500ms",
        }}
      >
        <TwinAvatar mood={ts.mood} size={180} appearance={appearance} />
        <div className="mt-3 text-center">
          <p className="text-sub text-[10px] uppercase tracking-[0.2em] font-bold">
            ICM proyectado
          </p>
          <p
            className="text-[34px] font-extrabold leading-none transition-colors"
            style={{ color: ts.color }}
          >
            {projected}
          </p>
          <p className="text-hint text-[11px] mt-1">
            Hoy: {icmToday} ·{" "}
            <span style={{ color: ts.color }}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </p>
        </div>
      </div>

      <Card>
        <p className="text-txt text-[14px] font-extrabold mb-1">¿Qué pasaría si…?</p>
        <p className="text-sub text-[12px] mb-4">
          Mueve los sliders y mira cómo reacciona tu gemelo.
        </p>
        <div className="space-y-5">
          <Slider
            label="Caminar hoy"
            value={walk}
            min={0}
            max={60}
            unit=" min"
            color="#37D67A"
            onChange={setWalk}
          />
          <Slider
            label="Dormir esta noche"
            value={sleep}
            min={4}
            max={9}
            step={0.5}
            unit=" h"
            color="#A78BFA"
            onChange={setSleep}
          />
          <Slider
            label="Carbohidratos en la cena"
            value={carbs}
            min={20}
            max={80}
            unit=" %"
            color="#1FD0A3"
            onChange={setCarbs}
          />
        </div>
      </Card>

      <div
        className="mt-3 rounded-2xl p-4 flex items-start gap-3 border"
        style={{
          backgroundColor: `${message.color}14`,
          borderColor: `${message.color}55`,
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${message.color}22`, color: message.color }}
        >
          <Sparkles size={16} />
        </div>
        <p className="text-txt text-[13px] leading-snug">
          <span style={{ color: message.color, fontWeight: 800 }}>
            {message.icon} {delta < 0 ? "Mejor escenario" : delta > 0 ? "Peor escenario" : "Sin cambios"} ·{" "}
          </span>
          {message.text}
        </p>
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={() => onNav("projection")}>
          <span className="flex items-center gap-2">
            Ver mi proyección a 5 años <ChevronRight size={16} />
          </span>
        </Button>
      </div>
    </div>
  );
}
