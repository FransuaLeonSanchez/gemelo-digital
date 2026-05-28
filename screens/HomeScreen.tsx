"use client";
import {
  Bell,
  ChevronRight,
  Droplet,
  Activity,
  Moon,
  Heart,
  Leaf,
  Sparkles,
  Coffee,
  Soup,
  Apple,
  Check,
  UtensilsCrossed,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Sparkline } from "@/components/charts/Sparkline";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { glucoseDay, mockUser, recommendations, subIndices } from "@/lib/mockData";
import { twinState } from "@/lib/icm";
import type { Meal, MealType, ScreenId, SubIndexKey, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  onOpenSubIndex: (k: SubIndexKey) => void;
  appearance: TwinAppearance;
  icm: number;
  useImage?: boolean;
  alertsUnread?: boolean;
  meals: Meal[];
}

const MEAL_ICONS: Record<MealType, any> = {
  Desayuno: Coffee,
  Almuerzo: Soup,
  Cena: Moon,
  Snack: Apple,
};
const MEAL_COLORS: Record<MealType, string> = {
  Desayuno: "#FFB23E",
  Almuerzo: "#4DA3FF",
  Cena: "#A78BFA",
  Snack: "#37D67A",
};
const MEAL_ORDER: MealType[] = ["Desayuno", "Almuerzo", "Cena", "Snack"];

const ICONS: Record<string, any> = {
  Glucosa: Droplet,
  Actividad: Activity,
  Sueño: Moon,
  Estrés: Heart,
  Nutrición: Leaf,
};

export function HomeScreen({
  onNav,
  onOpenSubIndex,
  appearance,
  icm,
  alertsUnread = true,
  useImage = false,
  meals,
}: Props) {
  const ts = twinState(icm);
  const peak = Math.max(...glucoseDay);
  const peakIdx = glucoseDay.indexOf(peak);
  const peakTime = `${String(Math.floor(peakIdx / 2)).padStart(2, "0")}:${peakIdx % 2 === 0 ? "00" : "30"}`;
  const current = glucoseDay[glucoseDay.length - 1];

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-2 pb-[100px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-sub text-[12px]">Buenos días</p>
          <h1 className="text-txt text-[22px] font-extrabold">Hola, {mockUser.name} 👋</h1>
        </div>
        <button
          onClick={() => onNav("alerts")}
          className="relative w-10 h-10 rounded-full bg-card border border-line flex items-center justify-center active:scale-95"
        >
          <Bell size={18} className="text-txt" />
          {alertsUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-red" />
          )}
        </button>
      </div>

      {/* ICM card */}
      <Card>
        <div className="flex items-start gap-4">
          <ScoreRing value={icm} color={ts.color} size={132} />
          <div className="flex-1 pt-2">
            <Pill color={ts.color}>{ts.label}</Pill>
            <p className="text-txt text-[14px] font-bold mt-2 leading-tight">
              Índice de Carga Metabólica de hoy
            </p>
            <p className="text-sub text-[12px] mt-1 leading-snug">
              Tu sueño y glucosa son los que más suman riesgo.
            </p>
          </div>
        </div>
      </Card>

      {/* Twin card */}
      <div className="mt-3">
        <Card onClick={() => onNav("twin")}>
          <div className="flex items-center gap-3">
            <TwinAvatar mood={ts.mood} size={86} appearance={appearance} useImage={useImage} />
            <div className="flex-1">
              <p className="text-txt text-[14px] font-extrabold">Tu gemelo digital</p>
              <p className="text-sub text-[12px] mt-0.5 leading-snug">
                Hoy se ve <span style={{ color: ts.color, fontWeight: 700 }}>{ts.label.toLowerCase()}</span>.
                Tócalo para simular escenarios.
              </p>
            </div>
            <ChevronRight size={18} className="text-sub" />
          </div>
        </Card>
      </div>

      <SectionTitle>Tus señales de hoy</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {subIndices.map((s) => {
          const Icon = ICONS[s.key] ?? Sparkles;
          return (
            <Card key={s.key} onClick={() => onOpenSubIndex(s.key as SubIndexKey)}>
              <div className="flex items-start gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}22`, color: s.color }}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-txt text-[12px] font-bold truncate">{s.key}</p>
                  <p className="text-hint text-[10px]">peso {s.weight}%</p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar value={s.value} color={s.color} />
                <p className="text-[11px] mt-1.5 font-bold" style={{ color: s.color }}>
                  {s.value}/100
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionTitle
        right={
          <button
            onClick={() => onNav("log")}
            className="text-brand-blue text-[11px] font-extrabold inline-flex items-center gap-1"
          >
            Registrar <ChevronRight size={12} />
          </button>
        }
      >
        Tus comidas de hoy
      </SectionTitle>
      <Card onClick={() => onNav("log")}>
        {(() => {
          const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
          const totalCarbs = meals.reduce((a, m) => a + m.carbs, 0);
          const filled = meals.length;
          return (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div>
                    <p className="text-txt text-[13px] font-extrabold leading-tight">
                      {filled === 0
                        ? "Aún sin registrar"
                        : `${filled} ${filled === 1 ? "comida" : "comidas"} hoy`}
                    </p>
                    <p className="text-sub text-[11px]">
                      {filled === 0
                        ? "Toca para registrar tu primera comida"
                        : `${totalKcal} kcal · ${totalCarbs} g carbos`}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-sub" />
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {MEAL_ORDER.map((t) => {
                  const meal = meals.find((m) => m.type === t);
                  const Icon = MEAL_ICONS[t];
                  const color = MEAL_COLORS[t];
                  const done = !!meal;
                  return (
                    <div
                      key={t}
                      className="rounded-xl bg-card2 border border-line px-1.5 py-2 text-center relative"
                      style={done ? { borderColor: `${color}55`, backgroundColor: `${color}14` } : {}}
                    >
                      <div
                        className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: done ? `${color}33` : "#262D3D",
                          color: done ? color : "#5C6678",
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <p
                        className="text-[10px] font-extrabold mt-1"
                        style={{ color: done ? color : "#8A95AC" }}
                      >
                        {t}
                      </p>
                      {done && (
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-teal text-bg flex items-center justify-center"
                          style={{ boxShadow: "0 0 0 2px #161B27" }}
                        >
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </Card>

      <SectionTitle>Glucosa de hoy</SectionTitle>
      <Card>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sub text-[11px] uppercase tracking-wider font-bold">Actual</p>
            <p className="text-txt text-[24px] font-extrabold">
              {current} <span className="text-sub text-[12px] font-bold">mg/dL</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sub text-[11px] uppercase tracking-wider font-bold">Pico</p>
            <p className="text-brand-amber text-[18px] font-extrabold">
              {peak} <span className="text-sub text-[11px] font-bold">· {peakTime}</span>
            </p>
          </div>
        </div>
        <div className="mt-2">
          <Sparkline data={glucoseDay} color="#4DA3FF" highlightMaxLabel={`${peak}`} />
        </div>
      </Card>

      <SectionTitle>Recomendación del día</SectionTitle>
      <Card accent={recommendations[0].color} onClick={() => onNav("recommendations")}>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${recommendations[0].color}22`,
              color: recommendations[0].color,
            }}
          >
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <Pill color={recommendations[0].color}>{recommendations[0].tag}</Pill>
            <p className="text-txt text-[14px] font-extrabold mt-1.5 leading-tight">
              {recommendations[0].title}
            </p>
            <p className="text-sub text-[12px] mt-1 leading-snug">
              {recommendations[0].reason}
            </p>
          </div>
          <ChevronRight size={18} className="text-sub" />
        </div>
      </Card>
    </div>
  );
}
