"use client";
import { useState } from "react";
import { Download, Share2, FileCheck2 } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/charts/Sparkline";
import { glucoseDay, mockUser, mtsCriteria, projection5y, weekICM } from "@/lib/mockData";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
}

export function DoctorReportScreen({ onNav }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const avgICM = Math.round(weekICM.reduce((a, b) => a + b.icm, 0) / weekICM.length);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const today = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-2 pb-[120px] relative">
      <TopBar title="Reporte médico" onBack={() => onNav("profile")} />

      <div className="bg-[#F4F6FB] text-[#0B0E14] rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-[#D7DCE6] pb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#5C6678] font-bold">
              Reporte metabólico
            </p>
            <p className="text-[16px] font-extrabold">Gemelo Digital · Resumen semanal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4DA3FF22] text-[#1859B6] flex items-center justify-center">
            <FileCheck2 size={18} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[12px]">
          <Field label="Paciente" value={mockUser.name} />
          <Field label="Edad" value={`${mockUser.age} años`} />
          <Field label="Sexo" value={mockUser.sex} />
          <Field label="Cintura" value={`${mockUser.waist} cm`} />
          <Field label="Ciudad" value={mockUser.city} />
          <Field label="Fecha" value={today} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Tile label="ICM promedio" value={String(avgICM)} sub="esta semana" color="#FFB23E" />
          <Tile label="Tiempo en rango" value="68%" sub="meta 70%" color="#4DA3FF" />
          <Tile label="Pasos / día" value="6,420" sub="meta 7,000" color="#37D67A" />
          <Tile label="Sueño promedio" value="6.1 h" sub="meta 7 h" color="#A78BFA" />
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-[#5C6678] font-bold mb-1">
            Curva de glucosa (últimas 24 h)
          </p>
          <div className="bg-white rounded-xl p-2 border border-[#D7DCE6]">
            <Sparkline data={glucoseDay} color="#1859B6" highlightMaxLabel="162" showAxis={false} />
          </div>
        </div>

        {/* 5 criterios NCEP-ATP III */}
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-[#5C6678] font-bold mb-1">
            Criterios diagnósticos (NCEP-ATP III)
          </p>
          <ul className="bg-white rounded-xl border border-[#D7DCE6] divide-y divide-[#E5E9F2]">
            {mtsCriteria.map((c) => (
              <li key={c.key} className="flex items-center justify-between px-3 py-1.5">
                <div>
                  <p className="text-[11px] font-bold text-[#0B0E14]">{c.key}</p>
                  <p className="text-[9px] text-[#5C6678]">{c.threshold}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-extrabold text-[#0B0E14] tabular-nums">
                    {c.value}
                  </span>
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: c.altered ? "#FFE0E2" : "#E9F8F1",
                      color: c.altered ? "#B53241" : "#1A8B5B",
                    }}
                  >
                    {c.altered ? "ALTERADO" : "OK"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-[#5C6678] mt-1.5 leading-snug">
            {mtsCriteria.filter((c) => c.altered).length} de 5 alterados ·{" "}
            <span className="font-bold text-[#0B0E14]">
              Pre-síndrome metabólico (riesgo creciente).
            </span>
          </p>
        </div>

        {/* Laboratorio + índices */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Tile label="HbA1c" value={`${mockUser.labs.hba1c}%`} sub="≥ 5.7 alerta" color="#FFB23E" />
          <Tile label="TyG" value={mockUser.labs.tyg.toFixed(2)} sub="proxy insulina" color="#A78BFA" />
          <Tile label="HRV" value={`${mockUser.labs.hrv} ms`} sub="estrés alto" color="#FF5E6C" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2 bg-[#FFE9E9] border border-[#FFC9C9]">
            <p className="text-[10px] uppercase font-bold text-[#B53241]">Riesgo 5 años</p>
            <p className="text-[18px] font-extrabold text-[#B53241]">{projection5y.current}%</p>
            <p className="text-[10px] text-[#B53241]">camino actual</p>
          </div>
          <div className="rounded-xl p-2 bg-[#E9F8F1] border border-[#BDE7D2]">
            <p className="text-[10px] uppercase font-bold text-[#1A8B5B]">Con plan</p>
            <p className="text-[18px] font-extrabold text-[#1A8B5B]">{projection5y.withPlan}%</p>
            <p className="text-[10px] text-[#1A8B5B]">objetivo del gemelo</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#D7DCE6] flex items-center justify-between text-[10px] text-[#5C6678]">
          <span>Generado por Gemelo Digital Metabólico</span>
          <span className="font-bold">{today}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Button icon={<Download size={16} />} onClick={() => show("Reporte descargado")}>
          Descargar PDF
        </Button>
        <Button
          variant="ghost"
          icon={<Share2 size={16} />}
          onClick={() => show("Reporte compartido")}
        >
          Compartir con mi médico
        </Button>
      </div>

      {toast && (
        <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 bg-card border border-brand-teal/40 rounded-full px-4 py-2 text-brand-teal text-[12px] font-extrabold">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[#5C6678] font-bold">{label}</p>
      <p className="text-[#0B0E14] font-bold">{value}</p>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-2 border"
      style={{ backgroundColor: `${color}1A`, borderColor: `${color}55` }}
    >
      <p className="text-[10px] uppercase font-bold text-[#5C6678]">{label}</p>
      <p className="text-[16px] font-extrabold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-[#5C6678]">{sub}</p>
    </div>
  );
}
