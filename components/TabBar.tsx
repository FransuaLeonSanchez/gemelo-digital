"use client";
import { Home, BarChart3, Plus, UserCircle2, Sparkles } from "lucide-react";
import type { ScreenId } from "@/lib/types";

interface Props {
  active: ScreenId;
  onNav: (s: ScreenId) => void;
}

const items: { id: ScreenId; label: string; icon: any }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "progress", label: "Progreso", icon: BarChart3 },
  { id: "twin", label: "Gemelo", icon: Sparkles },
  { id: "profile", label: "Perfil", icon: UserCircle2 },
];

export function TabBar({ active, onNav }: Props) {
  // Center button overlaps; split items 2 / + / 2
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="relative h-[78px] bg-bg2/95 backdrop-blur-md border-t border-line">
        <div className="absolute inset-0 grid grid-cols-5 items-center px-2">
          {left.map((it) => (
            <TabItem key={it.id} it={it} active={active === it.id} onNav={onNav} />
          ))}
          <div /> {/* spacer for + */}
          {right.map((it) => (
            <TabItem key={it.id} it={it} active={active === it.id} onNav={onNav} />
          ))}
        </div>

        {/* Center + button */}
        <button
          onClick={() => onNav("log")}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-brand-blue text-bg flex items-center justify-center active:scale-95 transition"
          style={{ boxShadow: "0 10px 24px rgba(77,163,255,0.45), 0 0 0 6px #0B0E14" }}
          aria-label="Registrar"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function TabItem({
  it,
  active,
  onNav,
}: {
  it: { id: ScreenId; label: string; icon: any };
  active: boolean;
  onNav: (s: ScreenId) => void;
}) {
  const Icon = it.icon;
  return (
    <button
      onClick={() => onNav(it.id)}
      className={`flex flex-col items-center gap-1 py-2 ${
        active ? "text-brand-blue" : "text-sub"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span className={`text-[10px] ${active ? "font-extrabold" : "font-semibold"}`}>
        {it.label}
      </span>
    </button>
  );
}
