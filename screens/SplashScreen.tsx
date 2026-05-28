"use client";
import { Camera } from "lucide-react";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import { Button } from "@/components/ui/Button";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
}

export function SplashScreen({ onNav, appearance }: Props) {
  return (
    <div className="flex flex-col h-full px-6 pb-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <TwinAvatar mood="neutral" size={190} appearance={appearance} />
        <div className="mt-8">
          <div className="text-brand-blue text-[11px] font-extrabold tracking-[0.3em] uppercase mb-2">
            Gemelo Digital
          </div>
          <h1 className="text-txt text-[26px] font-extrabold leading-tight">
            Tu gemelo digital<br />metabólico
          </h1>
          <p className="text-sub text-[13px] mt-3 max-w-[300px]">
            Detecta tu riesgo de síndrome metabólico antes de que aparezcan los síntomas.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <Button onClick={() => onNav("createTwin")} icon={<Camera size={18} />}>
          Crear mi gemelo
        </Button>
        <Button variant="ghost" onClick={() => onNav("home")}>
          Ya tengo cuenta
        </Button>
        <p className="text-hint text-[10px] text-center pt-1">
          Prevención metabólica · 87 % de adultos peruanos tiene al menos 1 alteración.
        </p>
      </div>
    </div>
  );
}
