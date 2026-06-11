"use client";
import { useMemo, useState } from "react";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronRight,
  Info,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { projectICMDetailed, twinState } from "@/lib/icm";
import { icmToday, subIndices } from "@/lib/mockData";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
  useImage?: boolean;
  icmBase?: number;
}

function formatDelta(n: number) {
  const rounded = Math.round(n * 10) / 10;
  if (Math.abs(rounded) < 0.05) return "0";
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function TwinScreen({ onNav, appearance, useImage = false, icmBase = icmToday }: Props) {
  const [walk, setWalk] = useState(20);
  const [sleep, setSleep] = useState(6);
  const [carbs, setCarbs] = useState(60);
  const [openInfo, setOpenInfo] = useState(false);

  const { projected, breakdown } = useMemo(
    () => projectICMDetailed(icmBase, walk, sleep, carbs),
    [icmBase, walk, sleep, carbs],
  );

  const ts = twinState(projected);
  const delta = projected - icmBase;

  const message =
    delta < 0
      ? {
          icon: <TrendingDown size={16} />,
          color: "#1FD0A3",
          title: "Mejor escenario",
          text: `Si cumples este plan, tu riesgo bajaría ${Math.abs(delta)} puntos hoy.`,
        }
      : delta > 0
      ? {
          icon: <TrendingUp size={16} />,
          color: "#FF5E6C",
          title: "Peor escenario",
          text: `Cuidado: este escenario subiría tu riesgo ${delta} puntos.`,
        }
      : {
          icon: <Minus size={16} />,
          color: "#FFB23E",
          title: "Sin cambios",
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
        <TwinAvatar mood={ts.mood} size={180} appearance={appearance} useImage={useImage} />
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
            Hoy: {icmBase} ·{" "}
            <span style={{ color: ts.color }}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </p>
        </div>
      </div>

      <Card>
        <p className="text-txt text-[14px] font-extrabold mb-1">¿Qué pasaría si…?</p>
        <p className="text-sub text-[12px] mb-4">
          Cada slider modifica tu ICM por una vía fisiológica diferente. Mira la
          contribución a la derecha.
        </p>

        <div className="space-y-5">
          <SliderRow
            color="#37D67A"
            contribution={breakdown.walk}
            sourceNote="Caminar tras comer baja el pico postprandial hasta 20 % (Reynolds 2016)."
          >
            <Slider
              label="Caminar hoy"
              value={walk}
              min={0}
              max={60}
              unit=" min"
              color="#37D67A"
              onChange={setWalk}
            />
          </SliderRow>

          <SliderRow
            color="#A78BFA"
            contribution={breakdown.sleep}
            sourceNote="Dormir < 7 h eleva la resistencia a la insulina ~30 % al día siguiente (Spiegel 1999)."
          >
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
          </SliderRow>

          <SliderRow
            color="#1FD0A3"
            contribution={breakdown.carbs}
            sourceNote="A más carbohidratos en la cena, mayor glucosa en ayunas (Hall 2019)."
          >
            <Slider
              label="Carbohidratos en la cena"
              value={carbs}
              min={20}
              max={80}
              unit=" %"
              color="#1FD0A3"
              onChange={setCarbs}
            />
          </SliderRow>
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
        <div className="flex-1">
          <p className="text-[12px] font-extrabold mb-0.5" style={{ color: message.color }}>
            <span className="inline-flex items-center gap-1">
              {message.icon} {message.title}
            </span>
            <span className="text-hint font-bold ml-2">
              ({formatDelta(breakdown.total)} pts)
            </span>
          </p>
          <p className="text-txt text-[13px] leading-snug">{message.text}</p>
        </div>
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={() => onNav("projection")}>
          <span className="flex items-center gap-2">
            Ver mi proyección a 5 años <ChevronRight size={16} />
          </span>
        </Button>
      </div>

      {/* ICM info accordion */}
      <button
        onClick={() => setOpenInfo((o) => !o)}
        className="mt-4 w-full bg-card border border-line rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-2 text-txt text-[13px] font-extrabold">
          <Info size={15} className="text-brand-blue" />
          ¿Qué es el ICM?
        </span>
        <ChevronDown
          size={18}
          className={`text-sub transition-transform ${openInfo ? "rotate-180" : ""}`}
        />
      </button>

      {openInfo && (
        <div className="mt-2 rounded-2xl border border-line bg-card2 p-4 text-[12.5px] text-sub leading-relaxed">
          <p>
            El <span className="text-txt font-extrabold">Índice de Carga
            Metabólica (ICM)</span> es un score{" "}
            <span className="text-txt font-bold">interno de tu gemelo</span> que
            va de 0 a 100, donde más alto = mayor riesgo metabólico hoy.
            <span className="text-hint"> No es un estándar internacional</span>:
            está inspirado en composite scores publicados como el{" "}
            <span className="text-txt font-bold">MetS-Z (Gurka &amp; DeBoer)</span>{" "}
            y el <span className="text-txt font-bold">CMDS</span>.
          </p>

          <p className="mt-2 text-txt font-extrabold text-[12px]">Cómo se calcula</p>
          <p className="mt-1">
            Promedio ponderado de 5 sub-índices (cada uno 0–100):
          </p>
          <ul className="mt-2 space-y-1">
            {subIndices.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between bg-card border border-line rounded-xl px-3 py-1.5"
              >
                <span className="text-txt text-[12px] font-bold">{s.key}</span>
                <span className="font-extrabold text-[12px]" style={{ color: s.color }}>
                  {s.weight}%
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-txt font-extrabold text-[12px]">Umbrales</p>
          <div className="flex gap-2 mt-1">
            <Pill color="#1FD0A3">0–39 saludable</Pill>
            <Pill color="#FFB23E">40–69 moderado</Pill>
            <Pill color="#FF5E6C">70+ alto</Pill>
          </div>
          <p className="text-hint text-[11px] mt-3 leading-snug">
            En esta demo el ICM se calcula localmente. En el producto real, el
            modelo individual aprende de tus datos en sus primeras 2 semanas
            (CGM, wearable, hábitos) y refina los pesos por persona.
          </p>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  color,
  contribution,
  sourceNote,
  children,
}: {
  color: string;
  contribution: number;
  sourceNote: string;
  children: React.ReactNode;
}) {
  const isBetter = contribution < -0.05;
  const isWorse = contribution > 0.05;
  const chipColor = isBetter ? "#1FD0A3" : isWorse ? "#FF5E6C" : "#8A95AC";

  return (
    <div>
      {children}
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-hint text-[10.5px] leading-snug max-w-[78%]">
          {sourceNote}
        </p>
        <span
          className="text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums"
          style={{
            backgroundColor: `${chipColor}1f`,
            color: chipColor,
            border: `1px solid ${chipColor}44`,
          }}
        >
          {formatDelta(contribution)} ICM
        </span>
      </div>
    </div>
  );
}
