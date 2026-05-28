"use client";
import { Activity, Droplet, Heart, Leaf, Moon, Sparkles } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Sparkline } from "@/components/charts/Sparkline";
import { subIndexHistory, subIndexInfo, subIndices } from "@/lib/mockData";
import type { ScreenId, SubIndexKey } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  subIndexKey: SubIndexKey;
}

const ICONS: Record<string, any> = {
  Glucosa: Droplet,
  Actividad: Activity,
  Sueño: Moon,
  Estrés: Heart,
  Nutrición: Leaf,
};

export function SubIndexDetailScreen({ onNav, subIndexKey }: Props) {
  const idx = subIndices.find((s) => s.key === subIndexKey)!;
  const info = subIndexInfo[subIndexKey];
  const history = subIndexHistory[subIndexKey];
  const Icon = ICONS[subIndexKey] ?? Sparkles;

  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-2 pb-[100px]">
      <TopBar title={subIndexKey} onBack={() => onNav("home")} />

      <div className="flex items-center gap-4">
        <ScoreRing value={idx.value} color={idx.color} size={120} label="puntos" />
        <div className="flex-1">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold mb-2"
            style={{ backgroundColor: `${idx.color}1f`, color: idx.color }}
          >
            <Icon size={12} /> peso {idx.weight}% del ICM
          </div>
          <p className="text-txt text-[14px] font-extrabold leading-snug">
            Hoy aportas {idx.value}/100 a tu carga metabólica.
          </p>
        </div>
      </div>

      <Card className="mt-4">
        <p className="text-sub text-[11px] uppercase tracking-wider font-bold mb-1">
          Qué significa
        </p>
        <p className="text-txt text-[13px] leading-relaxed">{info.what}</p>
      </Card>

      <Card className="mt-3">
        <p className="text-sub text-[11px] uppercase tracking-wider font-bold mb-2">
          Últimos 7 días
        </p>
        <Sparkline data={history} color={idx.color} showAxis={false} height={90} />
        <div className="flex justify-between mt-1 text-hint text-[10px]">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span>
          <span>Vie</span><span>Sáb</span><span>Hoy</span>
        </div>
      </Card>

      <Card className="mt-3">
        <p className="text-sub text-[11px] uppercase tracking-wider font-bold mb-2">
          Cómo mejorarlo
        </p>
        <ul className="space-y-2">
          {info.tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                style={{ backgroundColor: `${idx.color}22`, color: idx.color }}
              >
                {i + 1}
              </span>
              <p className="text-txt text-[13px] leading-snug">{t}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
