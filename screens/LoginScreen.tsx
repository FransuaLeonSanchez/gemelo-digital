"use client";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TwinAvatar } from "@/components/Twin/TwinAvatar";
import type { ScreenId, TwinAppearance } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  appearance: TwinAppearance;
}

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.5 7.1 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.5 7.1 28.9 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 34.5 26.6 35 24 35c-5.3 0-9.7-2.7-11.3-7H6.1l-.1.1C9.3 38.7 16 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.4l5.8 4.9C40.6 35.6 43 30.2 43 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export function LoginScreen({ onNav, appearance }: Props) {
  const [phase, setPhase] = useState<"idle" | "google" | "email-form">("idle");
  const [email, setEmail] = useState("");

  const googleSignIn = () => {
    setPhase("google");
    setTimeout(() => onNav("welcome"), 1100);
  };

  return (
    <div className="flex flex-col h-full px-6 pb-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <TwinAvatar mood="happy" size={150} appearance={appearance} />
        <div className="mt-7">
          <div className="text-brand-blue text-[10px] font-extrabold tracking-[0.3em] uppercase mb-1.5">
            Gemelo Digital · Metabólico
          </div>
          <h1 className="text-txt text-[24px] font-extrabold leading-tight">
            Bienvenido
          </h1>
          <p className="text-sub text-[12.5px] mt-2 max-w-[280px]">
            Tu gemelo digital aprende de ti y previene el síndrome metabólico
            antes de que aparezca.
          </p>
        </div>
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
