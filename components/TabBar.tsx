"use client";
import { Home, BarChart3, UtensilsCrossed, UserCircle2, Sparkles } from "lucide-react";
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
    <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-9 pointer-events-none bg-gradient-to-t from-bg via-bg/80 to-transparent">
      <div className="relative pointer-events-auto h-[64px] rounded-[26px] bg-bg2/90 backdrop-blur-xl border border-white/[0.07] shadow-soft">
        <div className="absolute inset-0 grid grid-cols-5 items-center px-1">
          {left.map((it) => (
            <TabItem key={it.id} it={it} active={active === it.id} onNav={onNav} />
          ))}
          <div /> {/* spacer for + */}
          {right.map((it) => (
            <TabItem key={it.id} it={it} active={active === it.id} onNav={onNav} />
          ))}
        </div>

        {/* Center plate button */}
        <button
          onClick={() => onNav("log")}
          className="absolute left-1/2 -translate-x-1/2 -top-[26px] w-[54px] h-[54px] rounded-full text-white flex items-center justify-center active:scale-95 transition"
          style={{
            background: "linear-gradient(135deg, #3D7BF6 0%, #7C5CF6 100%)",
            boxShadow:
              "0 12px 26px -6px rgba(99,124,246,0.55), 0 0 0 5px #090D17, inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
          aria-label="Registrar comida"
        >
          <UtensilsCrossed size={21} strokeWidth={2.4} />
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
      className="flex flex-col items-center gap-[3px] py-1.5"
    >
      <span
        className={`flex items-center justify-center w-10 h-[26px] rounded-full transition-colors duration-200 ${
          active ? "bg-brand-blue/15 text-brand-blue" : "text-sub"
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </span>
      <span
        className={`text-[9.5px] tracking-wide ${
          active ? "text-brand-blue font-extrabold" : "text-sub font-semibold"
        }`}
      >
        {it.label}
      </span>
    </button>
  );
}
