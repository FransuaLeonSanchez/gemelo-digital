"use client";
import { useState } from "react";
import { Camera, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { TopBar } from "@/components/ui/TopBar";
import { detectedMeal } from "@/lib/mockData";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
}

type Tab = "comida" | "sueño" | "estrés";
type MealStage = "empty" | "loading" | "detected" | "saved";

export function LogInputScreen({ onNav }: Props) {
  const [tab, setTab] = useState<Tab>("comida");
  const [meal, setMeal] = useState<MealStage>("empty");
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(5);
  const [savedFlow, setSavedFlow] = useState<null | string>(null);

  const takePhoto = () => {
    setMeal("loading");
    setTimeout(() => setMeal("detected"), 1200);
  };

  const registerMeal = () => {
    setMeal("saved");
    setSavedFlow("Comida registrada");
  };

  if (savedFlow) return <SavedConfirmation message={savedFlow} onNav={onNav} />;

  return (
    <div className="flex flex-col h-full px-5 pt-2 pb-[100px] overflow-y-auto scroll-hide">
      <TopBar title="Registrar día" onBack={() => onNav("home")} />

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-card2 rounded-2xl p-1 border border-line">
        {(["comida", "sueño", "estrés"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-[12px] font-extrabold capitalize transition ${
              tab === t ? "bg-brand-blue text-bg" : "text-sub"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "comida" && (
        <div className="space-y-4">
          <Card onClick={meal === "empty" ? takePhoto : undefined} className="text-center">
            <div className="flex flex-col items-center gap-2 py-2">
              {meal === "empty" && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                    <Camera size={24} />
                  </div>
                  <p className="text-txt text-[14px] font-extrabold">Toma una foto de tu plato</p>
                  <p className="text-sub text-[12px]">
                    La IA estima su carga glucémica
                  </p>
                </>
              )}
              {meal !== "empty" && (
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-card2 border border-line relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/meals/plate.jpg"
                    alt="plato"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 40%, #F4D5B855, transparent 60%), linear-gradient(180deg, #2A3142, #11151F)",
                    }}
                  >
                    <div className="text-6xl">🍛</div>
                  </div>
                  {meal === "loading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-card border border-line rounded-2xl px-4 py-2 flex items-center gap-2">
                        <Loader2 size={14} className="text-brand-blue animate-spin" />
                        <span className="text-txt text-[12px] font-bold">Analizando el plato…</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {meal === "detected" && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <Pill color="#4DA3FF">
                    <Sparkles size={10} /> Detectado por IA
                  </Pill>
                  <span className="text-hint text-[10px]">95 % confianza</span>
                </div>
                <p className="text-txt text-[16px] font-extrabold">{detectedMeal.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Stat label="Carga" value={detectedMeal.load} color="#FFB23E" />
                  <Stat label="Carbos" value={`${detectedMeal.carbs} g`} color="#1FD0A3" />
                  <Stat label="Energía" value={`${detectedMeal.kcal} kcal`} color="#4DA3FF" />
                </div>
                <div className="mt-3 rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-3 flex items-start gap-2">
                  <Sparkles size={14} className="text-brand-amber mt-0.5" />
                  <p className="text-txt text-[12px] leading-snug">
                    <span className="text-brand-amber font-extrabold">Predicción del gemelo: </span>
                    este plato podría subir tu glucosa a{" "}
                    <span className="text-brand-amber font-extrabold">~{detectedMeal.predictedPeak} mg/dL</span> en{" "}
                    {detectedMeal.predictedMinutes} min.
                  </p>
                </div>
              </Card>
              <Button onClick={registerMeal}>Registrar comida</Button>
              <Button variant="ghost" onClick={() => setMeal("empty")}>
                Volver a tomar foto
              </Button>
            </>
          )}
        </div>
      )}

      {tab === "sueño" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sub text-[12px] text-center">¿Cuántas horas dormiste anoche?</p>
            <p className="text-brand-purple text-center text-[44px] font-extrabold leading-tight">
              {sleep.toFixed(1)}
              <span className="text-txt text-[16px] font-bold ml-1">h</span>
            </p>
            <div className="mt-2">
              <Slider
                label="Horas de sueño"
                value={sleep}
                min={3}
                max={10}
                step={0.5}
                unit=" h"
                color="#A78BFA"
                onChange={setSleep}
              />
            </div>
          </Card>
          <Button onClick={() => setSavedFlow("Sueño registrado")}>Guardar sueño</Button>
        </div>
      )}

      {tab === "estrés" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sub text-[12px] text-center">
              ¿Cómo calificarías tu estrés hoy?
            </p>
            <p className="text-brand-red text-center text-[44px] font-extrabold leading-tight">
              {stress}
              <span className="text-txt text-[16px] font-bold">/10</span>
            </p>
            <div className="mt-2">
              <Slider
                label="Nivel de estrés"
                value={stress}
                min={1}
                max={10}
                unit="/10"
                color="#FF5E6C"
                onChange={setStress}
              />
            </div>
          </Card>
          <Button onClick={() => setSavedFlow("Estrés registrado")}>Guardar estrés</Button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card2 border border-line rounded-xl p-2 text-center">
      <p className="text-hint text-[10px] uppercase font-bold">{label}</p>
      <p className="text-[14px] font-extrabold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function SavedConfirmation({ message, onNav }: { message: string; onNav: (s: ScreenId) => void }) {
  return (
    <div className="flex flex-col h-full px-6 pb-[110px]">
      <TopBar title="Listo" onBack={() => onNav("home")} />
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-brand-teal/15 border border-brand-teal/40 flex items-center justify-center">
          <CheckCircle2 size={42} className="text-brand-teal" />
        </div>
        <h2 className="text-txt text-[22px] font-extrabold mt-5">¡Registrado!</h2>
        <p className="text-sub text-[13px] mt-2 max-w-[260px]">
          {message}. Tu gemelo recalculó tu ICM con este dato.
        </p>
      </div>
      <div className="space-y-3">
        <Button onClick={() => onNav("twin")}>Ver mi gemelo</Button>
        <Button variant="ghost" onClick={() => onNav("home")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
