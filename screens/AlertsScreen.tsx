"use client";
import { AlertTriangle, Moon, Sparkles } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { alerts } from "@/lib/mockData";
import type { ScreenId } from "@/lib/types";

const ICONS: Record<string, any> = {
  "alert-triangle": AlertTriangle,
  moon: Moon,
  sparkles: Sparkles,
};

interface Props {
  onNav: (s: ScreenId) => void;
}

export function AlertsScreen({ onNav }: Props) {
  return (
    <div className="h-full overflow-y-auto scroll-hide px-5 pt-2 pb-[100px]">
      <TopBar title="Alertas" onBack={() => onNav("home")} />

      <ul className="space-y-3">
        {alerts.map((a, i) => {
          const Icon = ICONS[a.icon] ?? Sparkles;
          return (
            <li
              key={i}
              className="bg-card border border-white/[0.08] rounded-[20px] p-3 flex items-start gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${a.color}22`, color: a.color }}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-txt text-[14px] font-extrabold">{a.title}</p>
                  <span className="text-hint text-[10px]">{a.time}</span>
                </div>
                <p className="text-sub text-[12px] mt-0.5 leading-snug">{a.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-hint text-[11px] text-center mt-6">
        Recibes alertas cuando tu gemelo detecta un patrón importante.
      </p>
    </div>
  );
}
