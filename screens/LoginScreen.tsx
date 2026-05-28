"use client";
import { useState } from "react";
import { Mail, Loader2, Heart, Droplet, Moon, Leaf, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance; // kept for API compatibility; not used here anymore
}

// Stable Unsplash photo (digital health / medical theme). If the network blocks
// it, the fallback SVG below renders instead — the UI never breaks.
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&auto=format&fit=crop";

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.5 7.1 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.5 7.1 28.9 5 24 5 16.3 5 9.7 9.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 34.5 26.6 35 24 35c-5.3 0-9.7-2.7-11.3-7H6.1l-.1.1C9.3 38.7 16 43 24 43z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.4l5.8 4.9C40.6 35.6 43 30.2 43 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function HeroFallback() {
  // Themed SVG — phone with a heart-beat + 5 floating metric chips.
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, #1C2A45 0%, #0F1422 70%), linear-gradient(180deg, #11151F, #0B0E14)",
        }}
      />
      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="halo" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4DA3FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="115" r="110" fill="url(#halo)" />
        {/* Phone */}
        <g transform="translate(168 50)">
          <rect width="64" height="130" rx="14" fill="#0B0E14" stroke="#4DA3FF" strokeOpacity="0.8" strokeWidth="1.5" />
          <rect x="6" y="14" width="52" height="100" rx="8" fill="#0F1525" />
          <circle cx="32" cy="6" r="2.5" fill="#262D3D" />
          <polyline
            points="10,80 18,80 22,62 30,98 36,72 44,86 54,86"
            fill="none"
            stroke="#4DA3FF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="32" y="42" fontSize="10" fontWeight="800" textAnchor="middle" fill="#1FD0A3">
            ICM 59
          </text>
        </g>
        {/* Telemetry dots */}
        <g fill="#1FD0A3">
          <circle cx="120" cy="40" r="3" />
          <circle cx="290" cy="200" r="3" />
        </g>
        <g fill="#4DA3FF">
          <circle cx="80" cy="170" r="3" />
          <circle cx="320" cy="60" r="3" />
        </g>
      </svg>
      {/* Floating icon chips */}
      <Chip className="left-3 top-3" color="#FF5E6C" Icon={Heart} />
      <Chip className="right-3 top-6" color="#4DA3FF" Icon={Droplet} />
      <Chip className="left-4 bottom-6" color="#A78BFA" Icon={Moon} />
      <Chip className="right-4 bottom-3" color="#37D67A" Icon={Activity} />
      <Chip className="left-1/2 -translate-x-1/2 top-2" color="#1FD0A3" Icon={Leaf} />
    </div>
  );
}

function Chip({ className, color, Icon }: { className: string; color: string; Icon: any }) {
  return (
    <div
      className={`absolute w-8 h-8 rounded-xl flex items-center justify-center ${className}`}
      style={{
        backgroundColor: `${color}22`,
        border: `1px solid ${color}55`,
        backdropFilter: "blur(4px)",
        color,
      }}
    >
      <Icon size={14} />
    </div>
  );
}

export function LoginScreen({ onNav }: Props) {
  const [phase, setPhase] = useState<"idle" | "google" | "email-form">("idle");
  const [email, setEmail] = useState("");
  const [imgOk, setImgOk] = useState(true);

  const googleSignIn = () => {
    setPhase("google");
    setTimeout(() => onNav("welcome"), 1100);
  };

  return (
    <div className="flex flex-col h-full px-5 pb-6">
      {/* TITLE — siempre arriba del todo, más grande */}
      <div className="text-center pt-2 pb-1">
        <h2 className="text-brand-blue text-[20px] font-extrabold tracking-[0.18em] uppercase leading-none">
          Gemelo Digital
        </h2>
        <p className="text-sub text-[12px] tracking-[0.32em] uppercase mt-1.5 font-bold">
          Metabólico
        </p>
      </div>

      {/* HERO IMAGE — bajado un poco con margen superior */}
      <div className="relative w-full aspect-[16/11] rounded-3xl overflow-hidden border border-line bg-card2 mt-7">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={HERO_PHOTO}
            alt="Salud metabólica · monitoreo digital"
            className="w-full h-full object-cover"
            onError={() => setImgOk(false)}
            loading="eager"
          />
        ) : (
          <HeroFallback />
        )}
        {/* Bottom gradient + caption for legibility regardless of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white text-[10px] uppercase tracking-[0.2em] font-extrabold opacity-80">
            Prevención metabólica
          </p>
          <p className="text-white text-[13px] font-extrabold mt-0.5">
            Tu salud, en tiempo real
          </p>
        </div>
      </div>

      {/* WELCOME */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mt-3">
        <h1 className="text-txt text-[26px] font-extrabold leading-tight">
          Bienvenido
        </h1>
        <p className="text-sub text-[13px] mt-2 max-w-[300px] leading-snug">
          Tu gemelo digital aprende de ti y previene el síndrome metabólico
          antes de que aparezca.
        </p>
      </div>

      {phase === "email-form" ? (
        <div className="space-y-3">
          <div className="bg-card border border-line rounded-2xl px-4 py-3 flex items-center gap-2">
            <Mail size={16} className="text-sub" />
            <input
              autoFocus
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none flex-1 text-txt text-[14px] placeholder:text-hint"
            />
          </div>
          <Button onClick={() => onNav("welcome")}>Continuar</Button>
          <Button variant="ghost" onClick={() => setPhase("idle")}>
            Volver
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={googleSignIn}
            disabled={phase === "google"}
            className="w-full h-12 rounded-2xl bg-white text-[#1F1F1F] font-extrabold flex items-center justify-center gap-3 active:scale-[0.98] transition disabled:opacity-80"
          >
            {phase === "google" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Conectando con Google…
              </>
            ) : (
              <>
                <GoogleG />
                Continuar con Google
              </>
            )}
          </button>
          <Button
            variant="ghost"
            icon={<Mail size={16} />}
            onClick={() => setPhase("email-form")}
          >
            Continuar con email
          </Button>
          <p className="text-hint text-[10px] text-center pt-1 leading-snug">
            Al continuar aceptas los Términos y la Política de Privacidad.<br />
            Cumplimos con la Ley N° 29733 (Perú) · cifrado AES-256.
          </p>
        </div>
      )}
    </div>
  );
}
