"use client";
import { useEffect, useState } from "react";
import {
  Bluetooth,
  CheckCircle2,
  Watch,
  Loader2,
  Heart,
  Activity,
  Moon,
  Droplet,
  ChevronLeft,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockUser, pairingCatalog } from "@/lib/mockData";
import type { PairedDevice, ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  onPaired: (d: PairedDevice) => void;
  returnTo: ScreenId;
}

type Step = "searching" | "found" | "device" | "naming" | "success";

export function PairDeviceScreen({ onNav, onPaired, returnTo }: Props) {
  const [step, setStep] = useState<Step>("searching");
  const [name, setName] = useState(`Smartwatch de ${mockUser.name}`);
  const device = pairingCatalog[0]; // Huawei Watch D2

  useEffect(() => {
    if (step === "searching") {
      const t = setTimeout(() => setStep("found"), 1700);
      return () => clearTimeout(t);
    }
  }, [step]);

  const finish = () => {
    onPaired({
      name: name.trim() || device.name,
      model: device.name,
      type: device.type,
    });
    setStep("success");
  };

  // Step indicator (5 dots).
  const STEPS: Step[] = ["searching", "found", "device", "naming", "success"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-2 flex items-center justify-between">
        <button
          onClick={() => onNav(returnTo)}
          className="w-9 h-9 rounded-full bg-card border border-line flex items-center justify-center active:scale-95"
          aria-label="Atrás"
        >
          <ChevronLeft size={18} className="text-txt" />
        </button>
        <h1 className="text-txt text-[16px] font-extrabold">Conectar dispositivo</h1>
        <button
          onClick={() => onNav(returnTo)}
          className="text-sub text-[11px] font-bold inline-flex items-center gap-1 active:scale-95"
          aria-label="Saltar"
        >
          <SkipForward size={12} /> Saltar
        </button>
      </div>

      {/* Step dots */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === stepIdx ? 22 : 8,
                backgroundColor:
                  i < stepIdx
                    ? "#1FD0A3"
                    : i === stepIdx
                    ? "#4DA3FF"
                    : "#262D3D",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div
        key={step}
        className="flex-1 flex flex-col px-5 pt-3 pb-6 animate-[fadeIn_240ms_ease-out]"
      >
        {step === "searching" && <SearchingStep />}
        {step === "found" && (
          <FoundStep onAdd={() => setStep("device")} onSkip={() => onNav(returnTo)} />
        )}
        {step === "device" && (
          <DeviceStep
            deviceName={device.name}
            description={device.description}
            color={device.color}
            onContinue={() => setStep("naming")}
            onBack={() => setStep("found")}
          />
        )}
        {step === "naming" && (
          <NamingStep
            name={name}
            setName={setName}
            color={device.color}
            onContinue={finish}
            onBack={() => setStep("device")}
          />
        )}
        {step === "success" && (
          <SuccessStep
            name={name}
            color={device.color}
            onDone={() => onNav(returnTo)}
            onView={() => onNav("profile")}
          />
        )}

        <style jsx global>{`
          @keyframes ripple {
            0%   { transform: scale(0.6); opacity: 0.55; }
            100% { transform: scale(2.0); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

function StepFrame({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-4">{children}</div>
        <h2 className="text-txt text-[22px] font-extrabold leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-sub text-[13px] mt-2 max-w-[320px] leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-3">{footer}</div>
    </>
  );
}

function SearchingStep() {
  return (
    <StepFrame
      title="Buscando dispositivos…"
      subtitle="Asegúrate de tener tu smartwatch encendido y el Bluetooth activado."
      footer={
        <div className="flex items-center justify-center gap-2 text-brand-blue text-[12px] font-bold">
          <Loader2 size={14} className="animate-spin" />
          Escaneando…
        </div>
      }
    >
      <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border border-brand-blue/40"
            style={{ animation: `ripple 2.2s ease-out ${i * 0.7}s infinite` }}
          />
        ))}
        <div className="w-28 h-28 rounded-full bg-brand-blue/15 border border-brand-blue/40 flex items-center justify-center">
          <Bluetooth size={42} className="text-brand-blue" />
        </div>
      </div>
    </StepFrame>
  );
}

function FoundStep({ onAdd, onSkip }: { onAdd: () => void; onSkip: () => void }) {
  return (
    <StepFrame
      title="Dispositivo encontrado"
      subtitle="Bluetooth · a 1.2 m de ti"
      footer={
        <>
          <Button onClick={onAdd}>Añadir dispositivo</Button>
          <Button variant="ghost" onClick={onSkip}>No tengo dispositivo</Button>
        </>
      }
    >
      <div className="w-44 h-44 mx-auto rounded-full bg-brand-blue/20 border-4 border-brand-blue/30 flex items-center justify-center relative">
        <Bluetooth size={48} className="text-brand-blue" />
        <span className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-bg2 border-2 border-brand-blue flex items-center justify-center">
          <Watch size={16} className="text-brand-blue" />
        </span>
      </div>
    </StepFrame>
  );
}

function DeviceStep({
  deviceName,
  description,
  color,
  onContinue,
  onBack,
}: {
  deviceName: string;
  description: string;
  color: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <StepFrame
      title={deviceName}
      subtitle={description}
      footer={
        <>
          <Button onClick={onContinue}>Añadir smartwatch</Button>
          <Button variant="ghost" onClick={onBack}>Elegir otro</Button>
        </>
      }
    >
      <div
        className="w-48 h-48 mx-auto rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${color}33, ${color}0d 65%, transparent)`,
        }}
      >
        <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-[#1A2030] to-[#0B0E14] border border-line flex items-center justify-center shadow-soft rotate-[-8deg]">
          <Watch size={56} className="text-txt" />
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-red" />
          <span className="absolute bottom-3 left-3 text-[8px] font-extrabold text-brand-blue">
            10:24
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-[300px] mx-auto">
        <SpecChip icon={<Heart size={12} />} color="#FF5E6C" label="HRV" />
        <SpecChip icon={<Activity size={12} />} color="#37D67A" label="Pasos" />
        <SpecChip icon={<Moon size={12} />} color="#A78BFA" label="Sueño" />
        <SpecChip icon={<Droplet size={12} />} color="#4DA3FF" label="Presión" />
      </div>
    </StepFrame>
  );
}

function SpecChip({
  icon,
  color,
  label,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
}) {
  return (
    <div
      className="rounded-xl border px-2.5 py-1.5 flex items-center gap-2 text-[11.5px] font-bold"
      style={{ borderColor: `${color}55`, backgroundColor: `${color}14`, color }}
    >
      {icon}
      {label}
    </div>
  );
}

function NamingStep({
  name,
  setName,
  color,
  onContinue,
  onBack,
}: {
  name: string;
  setName: (v: string) => void;
  color: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <StepFrame
      title="Nombra tu smartwatch"
      subtitle="Así lo verás en tu perfil y en las alertas que envíe tu gemelo."
      footer={
        <>
          <Button onClick={onContinue}>Continuar</Button>
          <Button variant="ghost" onClick={onBack}>Atrás</Button>
        </>
      }
    >
      <div className="w-32 h-32 mx-auto rounded-full bg-card2 border-2 border-line flex items-center justify-center">
        <Watch size={56} style={{ color }} />
      </div>

      <div className="mt-5 w-full max-w-[320px] mx-auto">
        <div
          className="rounded-2xl bg-card border-2 px-4 py-3 flex items-center gap-3"
          style={{ borderColor: `${color}55` }}
        >
          <Watch size={18} className="text-sub" />
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="bg-transparent outline-none flex-1 text-txt text-[14px] font-bold placeholder:text-hint"
          />
          <span className="text-hint text-[10px] font-bold tabular-nums">
            {name.length}/32
          </span>
        </div>
      </div>
    </StepFrame>
  );
}

function SuccessStep({
  name,
  color,
  onDone,
  onView,
}: {
  name: string;
  color: string;
  onDone: () => void;
  onView: () => void;
}) {
  return (
    <StepFrame
      title={`${name} añadido`}
      subtitle="Tu gemelo ya recibe datos en tiempo real."
      footer={
        <>
          <Button onClick={onDone}>Continuar</Button>
          <Button variant="ghost" onClick={onView}>Ver mi perfil</Button>
        </>
      }
    >
      <div
        className="w-28 h-28 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}22`, border: `2px solid ${color}` }}
      >
        <CheckCircle2 size={56} style={{ color }} strokeWidth={2.2} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 max-w-[320px] mx-auto text-left">
        <DataPreview label="Frecuencia" value="74 bpm" color="#FF5E6C" />
        <DataPreview label="HRV" value="42 ms" color="#A78BFA" />
        <DataPreview label="Pasos hoy" value="4,820" color="#37D67A" />
        <DataPreview label="Sueño anoche" value="5h 40m" color="#4DA3FF" />
      </div>
    </StepFrame>
  );
}

function DataPreview({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-card2 border border-line px-3 py-2">
      <p className="text-hint text-[10px] uppercase font-bold">{label}</p>
      <p className="text-[16px] font-extrabold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
