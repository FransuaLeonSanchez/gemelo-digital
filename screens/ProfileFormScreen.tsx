"use client";
import { useState } from "react";
import {
  User,
  Mail,
  CalendarDays,
  Ruler,
  Scale,
  MapPin,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { mockUser } from "@/lib/mockData";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
}

interface FormState {
  name: string;
  email: string;
  age: string;
  sex: "Hombre" | "Mujer" | "Otro" | "";
  height: string;
  weight: string;
  waist: string;
  city: string;
  history: string[];
}

const EMPTY: FormState = {
  name: "",
  email: "",
  age: "",
  sex: "",
  height: "",
  weight: "",
  waist: "",
  city: "",
  history: [],
};

const HISTORY_OPTIONS = [
  "Antecedente familiar de diabetes",
  "Hipertensión",
  "Sedentario",
  "Fumador",
  "Estrés crónico",
];

const CITIES = ["Lima Metropolitana", "Callao", "Arequipa", "Trujillo", "Otra"];

export function ProfileFormScreen({ onNav }: Props) {
  const [data, setData] = useState<FormState>(EMPTY);
  const [autofilling, setAutofilling] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const autofill = () => {
    if (autofilling) return;
    setAutofilling(true);
    const sequence: [keyof FormState, FormState[keyof FormState]][] = [
      ["name", mockUser.name],
      ["email", mockUser.email],
      ["age", String(mockUser.age)],
      ["sex", mockUser.sex as any],
      ["height", String(mockUser.height)],
      ["weight", String(mockUser.weight)],
      ["waist", String(mockUser.waist)],
      ["city", mockUser.city],
      ["history", mockUser.history],
    ];
    sequence.forEach(([k, v], i) => {
      setTimeout(() => {
        setData((d) => ({ ...d, [k]: v as any }));
        if (i === sequence.length - 1) {
          setTimeout(() => setAutofilling(false), 250);
        }
      }, i * 90);
    });
  };

  const clearAll = () => setData(EMPTY);

  const toggleHistory = (h: string) => {
    setData((d) =>
      d.history.includes(h)
        ? { ...d, history: d.history.filter((x) => x !== h) }
        : { ...d, history: [...d.history, h] },
    );
  };

  const isComplete =
    data.name && data.email && data.age && data.sex && data.height && data.weight && data.city;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-2">
        <TopBar title="Tus datos" onBack={() => onNav("customize")} />
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide px-5 pb-5">
        <p className="text-sub text-[13px] leading-snug mb-4">
          Conocerte mejor permite a tu gemelo predecir tu riesgo con más
          precisión. Tus datos viven en este dispositivo (Ley N° 29733).
        </p>

        {/* Autofill banner */}
        <div
          className="rounded-[20px] p-3 mb-4 flex items-center gap-3 border"
          style={{
            backgroundColor: "#60A5FA14",
            borderColor: "#60A5FA55",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-txt text-[13px] font-extrabold">Auto-rellenar</p>
            <p className="text-sub text-[11px] leading-snug">
              Para acelerar la demo, completa con datos de muestra.
            </p>
          </div>
          <button
            onClick={autofill}
            disabled={autofilling}
            className="px-3 h-9 rounded-xl bg-brand-gradient text-white shadow-[0_6px_16px_-6px_rgba(99,124,246,0.6)] font-extrabold text-[12px] disabled:opacity-70 active:scale-95"
          >
            {autofilling ? (
              <span className="inline-flex items-center gap-1">
                <Sparkles size={12} className="animate-pulse" /> Rellenando…
              </span>
            ) : (
              "Rellenar"
            )}
          </button>
        </div>

        <SectionTitle
          right={
            data.name || data.email ? (
              <button
                onClick={clearAll}
                className="text-hint text-[11px] inline-flex items-center gap-1 font-bold"
              >
                <X size={11} /> Limpiar
              </button>
            ) : null
          }
        >
          Cuenta
        </SectionTitle>
        <Card>
          <Field
            icon={<User size={14} />}
            label="Nombre"
            value={data.name}
            onChange={(v) => set("name", v)}
            placeholder="Tu nombre"
          />
          <Divider />
          <Field
            icon={<Mail size={14} />}
            label="Email"
            value={data.email}
            onChange={(v) => set("email", v)}
            placeholder="tu@email.com"
            type="email"
          />
        </Card>

        <SectionTitle>Perfil basal</SectionTitle>
        <Card>
          <Field
            icon={<CalendarDays size={14} />}
            label="Edad"
            value={data.age}
            onChange={(v) => set("age", v.replace(/\D/g, "").slice(0, 3))}
            placeholder="años"
            type="numeric"
            suffix="años"
          />
          <Divider />
          <div className="py-2.5">
            <p className="text-hint text-[10px] uppercase tracking-wider font-bold mb-2">
              Sexo
            </p>
            <div className="flex gap-2">
              {(["Hombre", "Mujer", "Otro"] as const).map((s) => {
                const active = data.sex === s;
                return (
                  <button
                    key={s}
                    onClick={() => set("sex", s)}
                    className={`flex-1 h-9 rounded-xl text-[12px] font-extrabold transition ${
                      active
                        ? "bg-brand-gradient text-white shadow-[0_6px_16px_-6px_rgba(99,124,246,0.6)]"
                        : "bg-card2 text-sub border border-white/[0.08]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-3 gap-2 py-2.5">
            <NumberCell
              icon={<Ruler size={12} />}
              label="Estatura"
              value={data.height}
              onChange={(v) => set("height", v)}
              suffix="cm"
            />
            <NumberCell
              icon={<Scale size={12} />}
              label="Peso"
              value={data.weight}
              onChange={(v) => set("weight", v)}
              suffix="kg"
            />
            <NumberCell
              icon={<Ruler size={12} />}
              label="Cintura"
              value={data.waist}
              onChange={(v) => set("waist", v)}
              suffix="cm"
            />
          </div>
          <Divider />
          <div className="py-2.5">
            <p className="text-hint text-[10px] uppercase tracking-wider font-bold mb-2 inline-flex items-center gap-1">
              <MapPin size={12} /> Ciudad
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((c) => {
                const active = data.city === c;
                return (
                  <button
                    key={c}
                    onClick={() => set("city", c)}
                    className={`px-3 h-8 rounded-full text-[11.5px] font-extrabold transition ${
                      active
                        ? "bg-brand-gradient text-white shadow-[0_6px_16px_-6px_rgba(99,124,246,0.6)]"
                        : "bg-card2 text-sub border border-white/[0.08]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <SectionTitle>Antecedentes</SectionTitle>
        <Card>
          <div className="flex flex-wrap gap-2">
            {HISTORY_OPTIONS.map((h) => {
              const active = data.history.includes(h);
              return (
                <button
                  key={h}
                  onClick={() => toggleHistory(h)}
                  className={`px-3 h-9 rounded-full text-[11.5px] font-extrabold transition inline-flex items-center gap-1.5 ${
                    active
                      ? "bg-brand-gradient text-white shadow-[0_6px_16px_-6px_rgba(99,124,246,0.6)]"
                      : "bg-card2 text-sub border border-white/[0.08]"
                  }`}
                >
                  {active && <Check size={12} />}
                  {h}
                </button>
              );
            })}
          </div>
          <p className="text-hint text-[11px] mt-3 leading-snug">
            Tu gemelo usa los antecedentes para ajustar el peso del riesgo
            cardiovascular y de la resistencia a la insulina.
          </p>
        </Card>

        <p className="text-hint text-[10px] text-center mt-4 leading-snug">
          Siguiente paso: conectar tu smartwatch o sensor para recibir datos en
          tiempo real.
        </p>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] bg-bg/90 backdrop-blur-md">
        <Button onClick={() => onNav("pairDevice")}>
          {isComplete ? "Continuar" : "Continuar (datos opcionales)"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "numeric";
  suffix?: string;
}) {
  return (
    <div className="py-2.5">
      <p className="text-hint text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={type === "numeric" ? "numeric" : type === "email" ? "email" : "text"}
          type={type === "email" ? "email" : "text"}
          className="bg-transparent outline-none flex-1 text-txt text-[14px] font-bold placeholder:text-hint"
        />
        {suffix && (
          <span className="text-sub text-[11px] font-bold">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function NumberCell({
  icon,
  label,
  value,
  onChange,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-card2 px-2.5 py-2">
      <p className="text-hint text-[9px] uppercase tracking-wider font-bold inline-flex items-center gap-1">
        {icon}
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-0.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
          placeholder="—"
          inputMode="decimal"
          className="bg-transparent outline-none w-full text-txt text-[16px] font-extrabold placeholder:text-hint"
        />
        <span className="text-hint text-[10px]">{suffix}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-line" />;
}
