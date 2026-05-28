"use client";
import {
  ChevronRight,
  Droplet,
  Scale,
  Watch,
  LogOut,
  FileText,
  Plus,
  Bluetooth,
  Activity,
  Heart,
  Moon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { devices, icmToday, mockUser } from "@/lib/mockData";
import { twinState } from "@/lib/icm";
import type { PairedDevice, ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
  pairedDevice: PairedDevice | null;
  onStartPair: () => void;
}

const DEV_ICONS: Record<string, any> = {
  droplet: Droplet,
  watch: Watch,
  scale: Scale,
};

export function ProfileScreen({ onNav, appearance, pairedDevice, onStartPair }: Props) {
  const ts = twinState(icmToday);

  // If paired during onboarding, replace the generic smartwatch entry.
  const deviceList = devices.map((d) => {
    if (pairedDevice && pairedDevice.type === "smartwatch" && d.icon === "watch") {
      return { ...d, name: `${pairedDevice.name} · ${pairedDevice.model}`, connected: true };
    }
    return d;
  });

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-3 pb-[100px]">
      <h1 className="text-txt text-[22px] font-extrabold mb-3">Perfil</h1>

      <Card>
        <div className="flex items-center gap-3">
          <TwinAvatar mood={ts.mood} size={96} appearance={appearance} />
          <div className="flex-1 min-w-0">
            <p className="text-txt text-[18px] font-extrabold truncate">{mockUser.name}</p>
            <p className="text-sub text-[11px] truncate">{mockUser.email}</p>
            <p className="text-sub text-[11px] mt-0.5">
              Adulto joven · {mockUser.age} años · {mockUser.city}
            </p>
            <div className="mt-2">
              <Pill color={ts.color}>{ts.label}</Pill>
            </div>
          </div>
        </div>
      </Card>

      <SectionTitle>Datos</SectionTitle>
      <Card>
        <div className="divide-y divide-line text-[13px]">
          <Row label="Edad" value={`${mockUser.age} años`} />
          <Row label="Sexo" value={mockUser.sex} />
          <Row label="Estatura" value={`${mockUser.height} cm`} />
          <Row label="Peso" value={`${mockUser.weight} kg`} />
          <Row label="Cintura" value={`${mockUser.waist} cm`} />
          <Row label="Ciudad" value={mockUser.city} />
        </div>
      </Card>

      <SectionTitle>Señales en vivo (wearable)</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <LiveMetric icon={Heart} color="#FF5E6C" label="Frecuencia" value="76 bpm" />
        <LiveMetric icon={Activity} color="#37D67A" label="Pasos hoy" value="4,820" />
        <LiveMetric icon={Moon} color="#A78BFA" label="Sueño" value="5h 40m" />
        <LiveMetric icon={Droplet} color="#4DA3FF" label="Presión" value="124/82" />
      </div>

      <SectionTitle
        right={
          <button
            onClick={onStartPair}
            className="inline-flex items-center gap-1 text-brand-blue text-[11px] font-extrabold"
          >
            <Plus size={12} /> Conectar
          </button>
        }
      >
        Dispositivos
      </SectionTitle>
      <div className="space-y-2">
        {deviceList.map((d) => {
          const Icon = DEV_ICONS[d.icon] ?? Watch;
          return (
            <Card key={d.name}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: d.connected ? "#1FD0A322" : "#262D3D",
                    color: d.connected ? "#1FD0A3" : "#8A95AC",
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-txt text-[13px] font-extrabold truncate">{d.name}</p>
                </div>
                {d.connected ? (
                  <Pill color="#1FD0A3">● Conectado</Pill>
                ) : (
                  <button
                    onClick={onStartPair}
                    className="text-brand-blue text-[11px] font-extrabold flex items-center gap-1"
                  >
                    <Plus size={12} /> Añadir
                  </button>
                )}
              </div>
            </Card>
          );
        })}
        <Card onClick={onStartPair} className="text-center">
          <div className="flex items-center justify-center gap-2 py-1 text-brand-blue font-extrabold text-[13px]">
            <Bluetooth size={16} /> Conectar nuevo dispositivo
          </div>
        </Card>
      </div>

      <SectionTitle>Reporte médico</SectionTitle>
      <Card onClick={() => onNav("doctor")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div className="flex-1">
            <p className="text-txt text-[13px] font-extrabold">Generar reporte</p>
            <p className="text-sub text-[12px]">Resumen para tu próxima cita médica.</p>
          </div>
          <ChevronRight size={18} className="text-sub" />
        </div>
      </Card>

      <div className="mt-5">
        <Button variant="danger" icon={<LogOut size={16} />} onClick={() => onNav("login")}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sub">{label}</span>
      <span className="text-txt font-bold">{value}</span>
    </div>
  );
}

function LiveMetric({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: any;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-hint text-[10px] uppercase font-bold">{label}</p>
          <p className="text-[16px] font-extrabold leading-tight" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
