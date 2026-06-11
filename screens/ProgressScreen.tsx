"use client";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { BarsWeek } from "@/components/charts/BarsWeek";
import { Button } from "@/components/ui/Button";
import { projection5y, weekICM, weekMetrics } from "@/lib/mockData";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
}

export function ProgressScreen({ onNav }: Props) {
  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-3 pb-[100px]">
      <h1 className="text-txt text-[22px] font-extrabold mb-3">Progreso</h1>

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sub text-[12px] uppercase tracking-wider font-bold">
            ICM últimos 7 días
          </p>
          <Pill color="#2DD4BF">↓ tendencia</Pill>
        </div>
        <div className="mt-3">
          <BarsWeek data={weekICM} />
        </div>
        <p className="text-sub text-[12px] mt-3 leading-snug">
          Tu tendencia mejoró el viernes y volvió a subir el fin de semana.
        </p>
      </Card>

      <SectionTitle>Resumen semanal</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {weekMetrics.map((m) => (
          <Card key={m.label}>
            <p className="text-sub text-[11px] uppercase font-bold">{m.label}</p>
            <p className="text-[22px] font-extrabold mt-1" style={{ color: m.color }}>
              {m.value}
            </p>
            <p className="text-hint text-[11px]">{m.sub}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Riesgo a 5 años</SectionTitle>
      <Card accent="#FBBF24" onClick={() => onNav("projection")}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-brand-amber text-[40px] font-extrabold leading-none">
              {projection5y.current}%
            </p>
            <p className="text-txt text-[13px] mt-2 leading-snug font-semibold">
              Probabilidad estimada de desarrollar diabetes tipo 2 si no cambias tus hábitos.
            </p>
            <p className="text-sub text-[12px] mt-1 leading-snug">
              Bajaría a{" "}
              <span className="text-brand-teal font-extrabold">{projection5y.withPlan}%</span>{" "}
              cumpliendo tu plan.
            </p>
          </div>
          <ChevronRight size={18} className="text-sub mt-1" />
        </div>
        <div className="mt-3">
          <Button onClick={() => onNav("projection")}>Ver proyección detallada</Button>
        </div>
      </Card>

      <SectionTitle>Reporte para tu médico</SectionTitle>
      <Card onClick={() => onNav("doctor")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-extrabold">
            PDF
          </div>
          <div className="flex-1">
            <p className="text-txt text-[14px] font-extrabold">Resumen semanal exportable</p>
            <p className="text-sub text-[12px]">Llévalo a tu próxima cita médica.</p>
          </div>
          <ChevronRight size={18} className="text-sub" />
        </div>
      </Card>
    </div>
  );
}
