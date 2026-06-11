"use client";
/**
 * RPM3DCreatorScreen — crea el gemelo 3D real a partir de la selfie.
 *
 * Embebe el creador de Ready Player Me (readyplayer.me) en un iframe y
 * escucha su Frame API (postMessage):
 *   1. v1.frame.ready    → nos suscribimos a los eventos
 *   2. v1.avatar.exported → llega la URL del GLB del avatar generado
 *
 * Al GLB le pedimos `morphTargets=ARKit` (52 blendshapes para las
 * expresiones del gemelo) y `quality=low` (~2 MB, liviano para móvil).
 * Todo ocurre en el navegador del usuario → funciona igual en Vercel.
 *
 * Docs: https://docs.readyplayer.me/ready-player-me/integration-guides/web
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  onCreated: (glbUrl: string) => void;
}

const RPM_SUBDOMAIN = "demo"; // subdominio público de pruebas de RPM
const RPM_URL = `https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody`;

export function RPM3DCreatorScreen({ onNav, onCreated }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let json: any;
      try {
        json = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (json?.source !== "readyplayerme") return;

      // 1) El frame está listo → suscribirse a todos los eventos v1
      if (json.eventName === "v1.frame.ready") {
        setLoading(false);
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*",
        );
      }

      // 2) Avatar exportado → URL del GLB
      if (json.eventName === "v1.avatar.exported") {
        const base: string = json.data?.url ?? "";
        if (!base) return;
        // Pedimos blendshapes ARKit (expresiones) y calidad baja (liviano)
        const glb = `${base.split("?")[0]}?morphTargets=ARKit&quality=low`;
        setDone(true);
        onCreated(glb);
        setTimeout(() => onNav("profileForm"), 900);
      }
    },
    [onCreated, onNav],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-2 flex items-center justify-between">
        <button
          onClick={() => onNav("createTwin")}
          className="w-9 h-9 rounded-full bg-card border border-line flex items-center justify-center active:scale-95"
          aria-label="Atrás"
        >
          <ChevronLeft size={18} className="text-txt" />
        </button>
        <h1 className="text-txt text-[15px] font-extrabold">Gemelo 3D realista</h1>
        <div className="w-9" />
      </div>

      <p className="text-sub text-[11.5px] px-5 pb-2 leading-snug">
        Tómate una selfie o súbela: Ready Player Me genera tu avatar 3D y GEMA
        le dará vida según tu estado metabólico.
      </p>

      {/* Creador RPM */}
      <div className="relative flex-1 mx-3 mb-3 rounded-2xl overflow-hidden border border-line bg-card2">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card2">
            <Loader2 size={28} className="text-brand-blue animate-spin" />
            <p className="text-sub text-[12px]">Cargando el creador 3D…</p>
            <p className="text-hint text-[10.5px] max-w-[240px] text-center leading-snug">
              Requiere internet. Si no carga, vuelve atrás y usa el gemelo
              ilustrado.
            </p>
          </div>
        )}
        {done && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-bg/90">
            <div className="w-16 h-16 rounded-full bg-brand-teal/15 border-2 border-brand-teal flex items-center justify-center">
              <Sparkles size={28} className="text-brand-teal" />
            </div>
            <p className="text-txt text-[15px] font-extrabold">¡Gemelo 3D creado!</p>
            <p className="text-sub text-[12px]">Preparando tus datos…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={RPM_URL}
          className="w-full h-full"
          allow="camera *; microphone *; clipboard-write"
          title="Creador de avatar 3D"
        />
      </div>
    </div>
  );
}
