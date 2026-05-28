"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Coffee,
  Soup,
  Moon,
  Apple,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  UtensilsCrossed,
  Flame,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/charts/Sparkline";
import { glucoseDay } from "@/lib/mockData";
import type { GlucemicLoad, Meal, MealType, ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  meals: Meal[];
  setMeals: (m: Meal[]) => void;
}

const SLOTS: {
  type: MealType;
  icon: any;
  hint: string;
  color: string;
}[] = [
  { type: "Desayuno", icon: Coffee, hint: "07:00–09:00", color: "#FFB23E" },
  { type: "Almuerzo", icon: Soup,   hint: "12:30–14:00", color: "#4DA3FF" },
  { type: "Cena",     icon: Moon,   hint: "19:00–21:00", color: "#A78BFA" },
  { type: "Snack",    icon: Apple,  hint: "opcional",    color: "#37D67A" },
];

const MOCK_DETECTION: Record<MealType, Omit<Meal, "type" | "time" | "photo">> = {
  Desayuno: { name: "Pan con palta + jugo de papaya", carbs: 45, kcal: 320, load: "Media", predictedPeak: 128 },
  Almuerzo: { name: "Arroz con pollo + ensalada",     carbs: 78, kcal: 540, load: "Alta",  predictedPeak: 158 },
  Cena:     { name: "Quinua con verduras al wok",     carbs: 38, kcal: 310, load: "Baja",  predictedPeak: 112 },
  Snack:    { name: "Plátano + frutos secos",         carbs: 28, kcal: 180, load: "Media", predictedPeak: 118 },
};

const LOAD_COLOR: Record<GlucemicLoad, string> = {
  Baja: "#1FD0A3",
  Media: "#FFB23E",
  Alta: "#FF5E6C",
};

const loadIdx = (l: GlucemicLoad) => (l === "Baja" ? 0 : l === "Media" ? 1 : 2);

type CapStage = "options" | "camera" | "analyzing" | "detected" | "denied";

export function LogInputScreen({ onNav, meals, setMeals }: Props) {
  const [selected, setSelected] = useState<MealType | null>(null);
  const [stage, setStage] = useState<CapStage>("options");
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [showDoneToast, setShowDoneToast] = useState<MealType | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getMeal = (t: MealType) => meals.find((m) => m.type === t);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stopCamera(), []);

  const openSlot = (t: MealType) => {
    setSelected(t);
    setStage("options");
    setPhoto(null);
  };

  const closeCapture = () => {
    stopCamera();
    setSelected(null);
    setStage("options");
    setPhoto(null);
  };

  const enableCamera = async () => {
    setStage("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setStage("denied");
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    const canvas = document.createElement("canvas");
    const size = Math.min(v.videoWidth, v.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    canvas.getContext("2d")?.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setStage("analyzing");
    setTimeout(() => setStage("detected"), 1300);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setStage("analyzing");
      setTimeout(() => setStage("detected"), 1300);
    };
    reader.readAsDataURL(f);
  };

  const registerMeal = () => {
    if (!selected) return;
    const detected = MOCK_DETECTION[selected];
    const meal: Meal = {
      type: selected,
      ...detected,
      time: new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      photo,
    };
    setMeals([...meals.filter((m) => m.type !== selected), meal]);
    setShowDoneToast(selected);
    setTimeout(() => setShowDoneToast(null), 2400);
    closeCapture();
  };

  const removeMeal = (t: MealType) => {
    setMeals(meals.filter((m) => m.type !== t));
  };

  // Day stats
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
  const totalCarbs = meals.reduce((a, m) => a + m.carbs, 0);
  const avgLoad: GlucemicLoad =
    meals.length === 0
      ? "Baja"
      : meals.reduce((a, m) => a + loadIdx(m.load), 0) / meals.length < 0.7
      ? "Baja"
      : meals.reduce((a, m) => a + loadIdx(m.load), 0) / meals.length < 1.4
      ? "Media"
      : "Alta";
  const completed = meals.filter((m) => m.type !== "Snack").length;

  // CAPTURE SUB-SCREEN
  if (selected) {
    const slot = SLOTS.find((s) => s.type === selected)!;
    const Icon = slot.icon;
    const detected = MOCK_DETECTION[selected];

    return (
      <div className="flex flex-col h-full px-5 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={closeCapture}
            className="w-9 h-9 rounded-full bg-card border border-line flex items-center justify-center active:scale-95"
            aria-label="Cerrar"
          >
            <X size={16} className="text-txt" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${slot.color}22`, color: slot.color }}
            >
              <Icon size={14} />
            </div>
            <h1 className="text-txt text-[16px] font-extrabold">{selected}</h1>
          </div>
          <div className="w-9" />
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {stage === "options" && (
          <>
            <p className="text-sub text-[13px] leading-snug mb-3">
              Toma una foto a tu plato o sube una imagen. La IA estima la carga
              glucémica y el pico de azúcar que generará.
            </p>

            <div className="space-y-3">
              <OptionCard
                icon={<Camera size={20} />}
                color="#4DA3FF"
                title="Tomar una foto"
                body="Usa la cámara para detectar tu plato."
                onClick={enableCamera}
                recommended
              />
              <OptionCard
                icon={<ImagePlus size={20} />}
                color="#1FD0A3"
                title="Cargar una imagen"
                body="Sube una foto desde tu galería."
                onClick={() => fileRef.current?.click()}
              />
            </div>

            <div className="mt-auto pt-4">
              <div className="rounded-2xl bg-card2 border border-line p-3 flex items-start gap-2.5">
                <Sparkles size={16} className="text-brand-blue shrink-0 mt-0.5" />
                <p className="text-sub text-[11.5px] leading-snug">
                  Tu gemelo predice cómo este plato afectará tu glucosa en los
                  próximos 60–120 minutos.
                </p>
              </div>
            </div>
          </>
        )}

        {(stage === "camera" || stage === "analyzing" || stage === "detected") && (
          <>
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card2 border border-line">
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: stage === "camera" && !photo ? "block" : "none" }}
              />
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="plato" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {stage === "camera" && !photo && (
                <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-[10px] text-txt font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                  EN VIVO
                </span>
              )}
              {stage === "analyzing" && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <div className="bg-card border border-line rounded-2xl px-4 py-2 flex items-center gap-2 shadow-soft">
                    <Loader2 size={14} className="text-brand-blue animate-spin" />
                    <span className="text-txt text-[12px] font-bold">Analizando el plato…</span>
                  </div>
                </div>
              )}
              {stage === "detected" && (
                <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-[10px] text-brand-teal font-bold">
                  ✓ Plato detectado
                </span>
              )}
              {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />}
            </div>

            {stage === "camera" && !photo && (
              <div className="mt-4 space-y-3">
                <Button onClick={capture} icon={<Camera size={18} />}>Capturar</Button>
                <Button variant="ghost" onClick={() => setStage("options")}>Volver</Button>
              </div>
            )}

            {stage === "detected" && (
              <>
                <Card className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <Pill color="#4DA3FF">
                      <Sparkles size={10} /> Detectado por IA
                    </Pill>
                    <span className="text-hint text-[10px]">95 % confianza</span>
                  </div>
                  <p className="text-txt text-[15px] font-extrabold">{detected.name}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <Stat label="Carga" value={detected.load} color={LOAD_COLOR[detected.load]} />
                    <Stat label="Carbos" value={`${detected.carbs} g`} color="#1FD0A3" />
                    <Stat label="Energía" value={`${detected.kcal} kcal`} color="#4DA3FF" />
                  </div>
                  <div className="mt-3 rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-3 flex items-start gap-2">
                    <Sparkles size={14} className="text-brand-amber mt-0.5" />
                    <p className="text-txt text-[12px] leading-snug">
                      <span className="text-brand-amber font-extrabold">Predicción del gemelo: </span>
                      este plato podría subir tu glucosa a{" "}
                      <span className="text-brand-amber font-extrabold">~{detected.predictedPeak} mg/dL</span>{" "}
                      en 60 min.
                    </p>
                  </div>
                </Card>
                <div className="mt-3 space-y-3">
                  <Button onClick={registerMeal}>Registrar {selected.toLowerCase()}</Button>
                  <Button
                    variant="ghost"
                    icon={<RotateCcw size={16} />}
                    onClick={() => {
                      setPhoto(null);
                      setStage("options");
                    }}
                  >
                    Volver a tomar
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {stage === "denied" && (
          <div className="rounded-3xl bg-card2 border border-line p-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-red/15 text-brand-red flex items-center justify-center">
              <AlertTriangle size={26} />
            </div>
            <div>
              <p className="text-txt text-[14px] font-extrabold">Cámara no disponible</p>
              <p className="text-sub text-[12px] leading-snug mt-1">
                Permite el acceso a la cámara o sube una imagen desde tu galería.
              </p>
            </div>
            <Button icon={<ImagePlus size={18} />} onClick={() => fileRef.current?.click()}>
              Cargar imagen
            </Button>
            <Button variant="ghost" onClick={enableCamera}>Reintentar cámara</Button>
          </div>
        )}
      </div>
    );
  }

  // MAIN MEAL DAY VIEW
  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-2 pb-[110px] relative">
      <div className="flex items-center justify-between py-1">
        <button
          onClick={() => onNav("home")}
          className="w-9 h-9 rounded-full bg-card border border-line flex items-center justify-center active:scale-95"
        >
          <X size={16} className="text-txt" />
        </button>
        <h1 className="text-txt text-[16px] font-extrabold">Tu día de comidas</h1>
        <div className="w-9" />
      </div>

      <p className="text-sub text-[12px] mt-1 mb-3 leading-snug">
        Registra cada comida para que tu gemelo prediga tu glucosa del día.
      </p>

      {/* Day summary */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sub text-[11px] uppercase tracking-wider font-bold">
            Resumen del día
          </p>
          <Pill color={LOAD_COLOR[avgLoad]}>Carga {avgLoad.toLowerCase()}</Pill>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <DayStat
            icon={<Flame size={14} />}
            color="#FF5E6C"
            value={`${totalKcal}`}
            unit="kcal"
            label="energía"
          />
          <DayStat
            icon={<Zap size={14} />}
            color="#1FD0A3"
            value={`${totalCarbs}`}
            unit="g"
            label="carbos"
          />
          <DayStat
            icon={<UtensilsCrossed size={14} />}
            color="#4DA3FF"
            value={`${completed}/3`}
            unit=""
            label="principales"
          />
        </div>

        <p className="text-sub text-[11px] uppercase tracking-wider font-bold mt-3 mb-1">
          Glucosa estimada del día
        </p>
        <Sparkline data={glucoseDay} color="#4DA3FF" height={70} showAxis={false} />
        <p className="text-hint text-[10.5px] leading-snug mt-1">
          La curva se ajusta a medida que registras cada comida. Tu gemelo
          recalcula el ICM y las recomendaciones.
        </p>
      </Card>

      {/* 4 meal slots */}
      <div className="mt-4 space-y-3">
        {SLOTS.map((s) => {
          const meal = getMeal(s.type);
          const Icon = s.icon;
          return (
            <button
              key={s.type}
              onClick={() => openSlot(s.type)}
              className="w-full text-left bg-card border border-line rounded-2xl p-3 active:scale-[0.99] transition"
              style={{ borderLeft: `3px solid ${meal ? s.color : "#262D3D"}` }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-card2 border border-line flex items-center justify-center shrink-0">
                  {meal?.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={meal.photo} alt={meal.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={22} style={{ color: s.color }} />
                  )}
                  {meal && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-teal text-bg flex items-center justify-center"
                      style={{ boxShadow: "0 0 0 2px #161B27" }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-txt text-[14px] font-extrabold">{s.type}</p>
                    <span className="text-hint text-[10px]">· {meal?.time ?? s.hint}</span>
                  </div>
                  {meal ? (
                    <>
                      <p className="text-sub text-[12px] truncate">{meal.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Pill color={LOAD_COLOR[meal.load]}>{meal.load}</Pill>
                        <span className="text-hint text-[10.5px]">
                          {meal.carbs} g · {meal.kcal} kcal · pico ~{meal.predictedPeak}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sub text-[12px]">Toca para registrar</p>
                  )}
                </div>
                {meal ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMeal(s.type);
                    }}
                    className="p-1.5 rounded-lg text-sub hover:text-brand-red active:scale-90"
                    aria-label="quitar"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}22`, color: s.color }}
                  >
                    <Camera size={14} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {meals.length > 0 && (
        <div className="mt-5">
          <Button onClick={() => onNav("home")} icon={<CheckCircle2 size={16} />}>
            Guardar día y sincronizar con mi gemelo
          </Button>
        </div>
      )}

      {showDoneToast && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 bg-card border border-brand-teal/40 rounded-full px-4 py-2 text-brand-teal text-[12px] font-extrabold inline-flex items-center gap-2 shadow-soft animate-[fadeIn_220ms_ease-out]">
          <Check size={14} /> {showDoneToast} registrado
        </div>
      )}
    </div>
  );
}

function OptionCard({
  icon,
  color,
  title,
  body,
  onClick,
  recommended,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
  onClick: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-line rounded-2xl p-4 flex items-start gap-3 active:scale-[0.99] transition text-left"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-txt text-[14px] font-extrabold">{title}</p>
          {recommended && (
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              Recomendado
            </span>
          )}
        </div>
        <p className="text-sub text-[12px] mt-0.5 leading-snug">{body}</p>
      </div>
    </button>
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

function DayStat({
  icon,
  color,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode;
  color: string;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-card2 border border-line px-2.5 py-2">
      <div className="flex items-center gap-1 text-hint text-[10px] uppercase font-bold">
        <span style={{ color }}>{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-[18px] font-extrabold mt-0.5 leading-tight" style={{ color }}>
        {value} <span className="text-sub text-[11px] font-bold">{unit}</span>
      </p>
    </div>
  );
}
