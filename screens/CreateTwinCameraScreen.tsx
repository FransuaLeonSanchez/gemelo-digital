"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  UserPlus,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Box,
} from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  setUserPhoto: (data: string | null) => void;
}

// ─── constants ────────────────────────────────────────────────────────────────
// The mock avatar saved by the user. Extension is uppercase on disk.
const MOCK_PHOTO = "/images/avatars/preview.JPG";

// Fake gallery thumbnails: first slot is the user's real photo, rest are placeholders.
const GALLERY_ITEMS = [
  { id: "real", src: MOCK_PHOTO, label: "Hoy" },
  { id: "p1",   src: null },
  { id: "p2",   src: null },
  { id: "p3",   src: null },
  { id: "p4",   src: null },
  { id: "p5",   src: null },
  { id: "p6",   src: null },
  { id: "p7",   src: null },
  { id: "p8",   src: null },
  { id: "p9",   src: null },
  { id: "p10",  src: null },
  { id: "p11",  src: null },
];

// Placeholder gradient pairs for visual variety in the fake gallery
const PH_COLORS = [
  ["#1A2030","#0F1525"],
  ["#1C1A2E","#0F0E1A"],
  ["#1E1A1A","#150F0F"],
  ["#1A1E1A","#0F150F"],
  ["#1E1C14","#15120A"],
  ["#1A1E2A","#0F1520"],
  ["#1E1A26","#150F1A"],
  ["#141E1E","#0A1515"],
  ["#1E1A18","#150F0E"],
  ["#141820","#0A0F15"],
  ["#1A1814","#110F0A"],
];

type Mode = "choose" | "camera" | "gallery";
type CamState = "idle" | "live" | "captured" | "denied";

export function CreateTwinCameraScreen({ onNav, setUserPhoto }: Props) {
  const [mode, setMode] = useState<Mode>("choose");

  // ── Camera state ──────────────────────────────────────────────────────────
  const [camState, setCamState] = useState<CamState>("idle");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stopCamera(), []);

  const enableCamera = async () => {
    setMode("camera");
    setCamState("idle");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState("live");
    } catch {
      setCamState("denied");
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    // Draw real frame to canvas, but then we display the mock photo for the
    // "taken photo" because the twins were generated from that reference.
    const canvas = document.createElement("canvas");
    const size = Math.min(v.videoWidth, v.videoHeight);
    canvas.width = size; canvas.height = size;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    canvas.getContext("2d")?.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    stopCamera();
    // Use mock photo as the result so generation uses the right reference
    setCapturedPhoto(MOCK_PHOTO);
    setCamState("captured");
  };

  const useThisPhoto = (src: string) => {
    setUserPhoto(src);
    onNav("twinGenerating");
  };

  // ── Gallery state ─────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string | null>(null);

  // ── Render ────────────────────────────────────────────────────────────────

  if (mode === "gallery") {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-2">
          <TopBar
            title="Galería"
            onBack={() => { setSelected(null); setMode("choose"); }}
            right={
              selected ? (
                <button
                  onClick={() => useThisPhoto(selected)}
                  className="bg-brand-blue text-bg text-[12px] font-extrabold px-3 py-1.5 rounded-full active:scale-95"
                >
                  Usar
                </button>
              ) : null
            }
          />
        </div>

        <p className="text-sub text-[12px] px-5 mb-3 leading-snug">
          Toca la foto que quieres usar como referencia para tu gemelo.
        </p>

        <div className="flex-1 overflow-y-auto scroll-hide px-5">
          {/* Date group label */}
          <p className="text-txt text-[13px] font-extrabold mb-2">Recientes</p>
          <div className="grid grid-cols-3 gap-1.5">
            {GALLERY_ITEMS.map((item, i) => {
              const isSelected = selected === item.src && item.src !== null;
              return (
                <button
                  key={item.id}
                  onClick={() => item.src && setSelected(item.src)}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-[0.97]"
                  style={{
                    borderColor: isSelected ? "#4DA3FF" : "transparent",
                    boxShadow: isSelected ? "0 0 0 1px #4DA3FF" : "none",
                  }}
                  disabled={!item.src}
                >
                  {item.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.src}
                      alt="foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${PH_COLORS[(i - 1) % PH_COLORS.length][0]}, ${PH_COLORS[(i - 1) % PH_COLORS.length][1]})`,
                      }}
                    />
                  )}

                  {/* "Hoy" label on first real photo */}
                  {item.label && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.label}
                    </span>
                  )}

                  {/* Selection checkmark */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-blue/20 flex items-end justify-end p-1.5">
                      <CheckCircle2 size={20} className="text-brand-blue" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="px-5 py-4 border-t border-line">
            <Button onClick={() => useThisPhoto(selected)}>
              Usar esta foto
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (mode === "camera") {
    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <TopBar
          title="Tomar foto"
          onBack={() => {
            stopCamera();
            setCapturedPhoto(null);
            setCamState("idle");
            setMode("choose");
          }}
        />
        <p className="text-sub text-[13px] leading-snug mb-3">
          Coloca tu rostro dentro de la guía y captura.
        </p>

        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card2 border border-line">
          {/* Live camera */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: "scaleX(-1)",
              display: camState === "live" ? "block" : "none",
            }}
          />

          {/* Captured — shows mock photo (the reference image) */}
          {camState === "captured" && capturedPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedPhoto} alt="captura" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Idle / requesting */}
          {camState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-blue/40 border-t-brand-blue animate-spin" />
            </div>
          )}

          {/* Denied */}
          {camState === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/15 text-brand-red flex items-center justify-center">
                <AlertTriangle size={26} />
              </div>
              <div>
                <p className="text-txt text-[14px] font-extrabold">Cámara no disponible</p>
                <p className="text-sub text-[12px] mt-1">Permite el acceso o carga una imagen.</p>
              </div>
            </div>
          )}

          {/* Face guide */}
          {camState === "live" && (
            <>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
                <ellipse cx="100" cy="100" rx="55" ry="72" fill="none" stroke="#4DA3FF" strokeWidth="0.8" strokeDasharray="3 2" />
              </svg>
              <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-[10px] text-txt font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                EN VIVO
              </span>
            </>
          )}

          {camState === "captured" && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-[10px] text-brand-teal font-bold">
              ✓ Foto tomada
            </span>
          )}

          {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />}
        </div>

        <div className="mt-5 space-y-3">
          {camState === "live" && (
            <Button onClick={capture} icon={<Camera size={18} />}>Capturar</Button>
          )}
          {camState === "captured" && capturedPhoto && (
            <>
              <Button onClick={() => useThisPhoto(capturedPhoto)}>
                Usar esta foto
              </Button>
              <Button
                variant="ghost"
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  setCapturedPhoto(null);
                  setCamState("idle");
                  enableCamera();
                }}
              >
                Repetir
              </Button>
            </>
          )}
          {camState === "denied" && (
            <>
              <Button onClick={() => { stopCamera(); setMode("gallery"); }} icon={<ImagePlus size={18} />}>
                Cargar desde galería
              </Button>
              <Button variant="ghost" onClick={enableCamera}>Reintentar cámara</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Choose screen ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <TopBar title="Crear mi gemelo" onBack={() => onNav("welcome")} />

      <p className="text-sub text-[13px] leading-snug mb-5">
        Elige cómo crear tu gemelo. Tu foto solo se usa para inspirar su
        apariencia; tú lo personalizas en el siguiente paso.
      </p>

      <div className="space-y-3">
        <OptionCard
          icon={<Camera size={20} />}
          color="#4DA3FF"
          title="Tomar una foto"
          body="Usa la cámara frontal para inspirar tu gemelo."
          onClick={enableCamera}
          recommended
        />
        <OptionCard
          icon={<ImagePlus size={20} />}
          color="#1FD0A3"
          title="Cargar una imagen"
          body="Sube una foto desde tu galería."
          onClick={() => setMode("gallery")}
        />
        <OptionCard
          icon={<Box size={20} />}
          color="#FFB23E"
          title="Gemelo 3D realista"
          body="Selfie → avatar 3D animado (Ready Player Me)."
          onClick={() => onNav("rpm3d")}
          beta
        />
        <OptionCard
          icon={<UserPlus size={20} />}
          color="#A78BFA"
          title="Crear sin foto"
          body="Diseña tu gemelo desde cero con el editor."
          onClick={() => {
            setUserPhoto(null);
            onNav("customize");
          }}
        />
      </div>

      <div className="mt-auto rounded-2xl bg-card2 border border-line p-3 flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
          <Camera size={12} />
        </div>
        <p className="text-sub text-[11.5px] leading-snug">
          Tu gemelo no es un retrato realista: es un personaje que reacciona
          a tu estado metabólico en tiempo real.
        </p>
      </div>
    </div>
  );
}

function OptionCard({
  icon, color, title, body, onClick, recommended, beta,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
  onClick: () => void;
  recommended?: boolean;
  beta?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-line rounded-2xl p-4 flex items-start gap-3 active:scale-[0.99] transition text-left"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-txt text-[14px] font-extrabold">{title}</p>
          {recommended && (
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              Recomendado
            </span>
          )}
          {beta && (
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              Beta 3D
            </span>
          )}
        </div>
        <p className="text-sub text-[12px] mt-0.5 leading-snug">{body}</p>
      </div>
    </button>
  );
}
