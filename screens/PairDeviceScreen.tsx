"use client";
import { useEffect, useState } from "react";
import {
  Bluetooth,
  CheckCircle2,
  X,
  Watch,
  Loader2,
  Heart,
  Activity,
  Moon,
  Droplet,
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
      const t = setTimeout(() => setStep("found"), 1600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const close = () => onNav(returnTo);

  const finish = () => {
    onPaired({ name: name.trim() || device.name, model: device.name, type: device.type });
    setStep("success");
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative mt-auto bg-bg2 rounded-t-3xl border-t border-line px-6 pt-5 pb-7 animate-[slideUp_280ms_ease-out]">
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-sub active:scale-95"
        >
          <X size={16} />
        </button>

        {step === "searching" && <SearchingStep />}
        {step === "found" && (
          <FoundStep
            onAdd={() => setStep("device")}
            onSkip={() => onNav(returnTo)}
          />
        )}
        {step === "device" && (
          <DeviceStep
            deviceName={device.name}
            description={device.description}
            color={device.color}
            onContinue={() => setStep("naming")}
          />
        )}
        {step === "naming" && (
          <NamingStep
            name={name}
            setName={setName}
            color={device.color}
            onContinue={finish}
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
          @keyframes slideUp {
            from { transform: translateY(40%); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
          @keyframes ripple {
            0%   { transform: scale(0.6); opacity: 0.6; }
            100% { transform: scale(2.0); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

function StepWrap({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="text-txt text-[18px] font-extrabold">{title}</h2>
      {subtitle && <p className="text-sub text-[12px] mt-1 leading-snug">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SearchingStep() {
  return (
    <StepWrap title="Buscando dispositivos…" subtitle="Asegúrate de tener el Bluetooth encendido.">
      <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border border-brand-blue/40"
            style={{ animation: `ripple 2.2s ease-out ${i * 0.7}s infinite` }}
          />
        ))}
        <div className="w-24 h-24 rounded-full bg-brand-blue/15 border border-brand-blue/40 flex items-center justify-center">
          <Bluetooth size={36} className="text-brand-blue" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-brand-blue text-[12px] font-bold">
        <Loader2 size={14} className="animate-spin" />
        Escaneando…
      </div>
    </StepWrap>
  );
}

function FoundStep({ onAdd, onSkip }: { onAdd: () => void; onSkip: () => void }) {
  return (
    <StepWrap title="Se encontró un dispositivo" subtitle="Bluetooth · a 1.2 m de ti">
      <div className="w-36 h-36 mx-auto rounded-full bg-brand-blue/20 border-4 border-brand-blue/30 flex items-center justify-center relative">
        <Bluetooth size={36} className="text-brand-blue" />
        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-bg2 border-2 border-brand-blue flex items-center justify-center">
          <Watch size={12} className="text-brand-blue" />
        </span>
      </div>
      <div className="mt-6 space-y-3">
        <Button onClick={onAdd}>Añadir dispositivo</Button>
        <Button variant="ghost" onClick={onSkip}>No tengo dispositivo</Button>
      </div>
    </StepWrap>
  );
}

function DeviceStep({
  deviceName,
  description,
  color,
  onContinue,
}: {
  deviceName: string;
  description: string;
  color: string;
  onContinue: () => void;
}) {
  return (
    <StepWrap title={deviceName} subtitle={description}>
      <div
        className="w-40 h-40 mx-auto rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${color}33, ${color}0d 65%, transparent)`,
        }}
      >
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1A2030] to-[#0B0E14] border border-line flex items-center justify-center shadow-soft rotate-[-8deg]">
          <Watch size={48} className="text-txt" />
          {/* Watch face details */}
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="absolute bottom-3 left-3 text-[7px] font-extrabold text-brand-blue">
            10:24
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-left">
        <SpecChip icon={<Heart size={12} />} color="#FF5E6C" label="HRV" />
        <SpecChip icon={<Activity size={12} />} color="#37D67A" label="Pasos" />
        <SpecChip icon={<Moon size={12} />} color="#A78BFA" label="Sueño" />
        <SpecChip icon={<Droplet size={12} />} color="#4DA3FF" label="Presión" />
      </div>

      <div className="mt-5">
        <Button onClick={onContinue}>Añadir smartwatch</Button>
      </div>
    </StepWrap>
  );
}

function SpecChip({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <div
      className="rounded-xl border px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-bold"
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
}: {
  name: string;
  setName: (v: string) => void;
  color: string;
  onContinue: () => void;
}) {
  return (
    <StepWrap title="Nombra tu smartwatch" subtitle="Así lo verás en tu perfil y en alertas.">
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
        <button
          onClick={() => setName("")}
          className="text-sub hover:text-txt"
          aria-label="limpiar"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-hint text-[10px] mt-2 text-right">{name.length}/32</p>

      <div className="mt-5">
        <Button onClick={onContinue}>Continuar</Button>
      </div>
    </StepWrap>
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
    <StepWrap title={`${name} añadido`} subtitle="Tu gemelo ya recibe datos en tiempo real.">
      <div
        className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}22`, border: `2px solid ${color}` }}
      >
        <CheckCircle2 size={48} style={{ color }} strokeWidth={2.2} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-left">
        <DataPreview label="Frecuencia" value="76 bpm" color="#FF5E6C" />
        <DataPreview label="HRV" value="38 ms" color="#A78BFA" />
        <DataPreview label="Pasos hoy" value="4,820" color="#37D67A" />
        <DataPreview label="Sueño anoche" value="5h 40m" color="#4DA3FF" />
      </div>

      <div className="mt-5 space-y-3">
        <Button onClick={onDone}>Listo</Button>
        <Button variant="ghost" onClick={onView}>Ver dispositivo</Button>
      </div>
    </StepWrap>
  );
}

function DataPreview({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-card2 border border-line px-3 py-2">
      <p className="text-hint text-[10px] uppercase font-bold">{label}</p>
      <p className="text-[14px] font-extrabold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
