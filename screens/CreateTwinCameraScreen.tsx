"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import type { ScreenId } from "@/lib/types";

interface Props {
  onNav: (s: ScreenId) => void;
  setUserPhoto: (data: string | null) => void;
}

type Mode = "choose" | "camera" | "upload";
type CamState = "idle" | "requesting" | "live" | "denied";

export function CreateTwinCameraScreen({ onNav, setUserPhoto }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [camState, setCamState] = useState<CamState>("idle");
  const [captured, setCaptured] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  const enableCamera = async () => {
    setMode("camera");
    setCamState("requesting");
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
    } catch (err) {
      setCamState("denied");
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
    const canvas = document.createElement("canvas");
    const size = Math.min(v.videoWidth, v.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    canvas.getContext("2d")?.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    const data = canvas.toDataURL("image/png");
    setCaptured(data);
    stopCamera();
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCaptured(reader.result as string);
      setMode("upload");
    };
    reader.readAsDataURL(file);
  };

  const useThis = () => {
    setUserPhoto(captured);
    onNav("customize");
  };

  const retake = () => {
    setCaptured(null);
    if (mode === "camera") enableCamera();
    else if (mode === "upload") fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <TopBar
        title="Crear mi gemelo"
        onBack={() => {
          stopCamera();
          onNav("welcome");
        }}
      />

      {/* Hidden file input — always available */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {mode === "choose" && !captured && (
        <>
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
              onClick={() => fileInputRef.current?.click()}
            />
            <OptionCard
              icon={<UserPlus size={20} />}
              color="#A78BFA"
              title="Crear sin foto"
              body="Diseña tu gemelo desde cero con el editor."
              onClick={() => onNav("customize")}
            />
          </div>

          <div className="mt-auto rounded-2xl bg-card2 border border-line p-3 flex items-start gap-2.5">
            <Sparkles size={16} className="text-brand-blue shrink-0 mt-0.5" />
            <p className="text-sub text-[11.5px] leading-snug">
              Tu gemelo no es un retrato realista: es un personaje que reacciona
              a tu estado metabólico en tiempo real.
            </p>
          </div>
        </>
      )}

      {mode === "camera" && (
        <>
          <p className="text-sub text-[13px] leading-snug mb-3">
            Coloca tu rostro dentro de la guía y captura tu foto.
          </p>

          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card2 border border-line">
            {camState === "requesting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-sub gap-2">
                <Loader2 size={28} className="animate-spin text-brand-blue" />
                <p className="text-[12px]">Pidiendo permiso de cámara…</p>
              </div>
            )}
            {camState === "denied" && !captured && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-red/15 text-brand-red flex items-center justify-center">
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <p className="text-txt text-[14px] font-extrabold">Cámara no disponible</p>
                  <p className="text-sub text-[12px] leading-snug mt-1">
                    Permite el acceso a la cámara en tu navegador, o sube una
                    imagen desde tu galería.
                  </p>
                </div>
              </div>
            )}

            {/* Live video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: "scaleX(-1)",
                display: camState === "live" && !captured ? "block" : "none",
              }}
            />

            {/* Captured photo */}
            {captured && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={captured}
                alt="captura"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Face guide */}
            {camState === "live" && !captured && (
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
            {captured && (
              <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-[10px] text-brand-teal font-bold">
                ✓ Foto capturada
              </span>
            )}
            {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />}
          </div>

          <div className="mt-5 space-y-3">
            {camState === "live" && !captured && (
              <Button onClick={capture} icon={<Camera size={18} />}>
                Capturar
              </Button>
            )}
            {captured && (
              <>
                <Button onClick={useThis}>Usar esta foto</Button>
                <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={retake}>
                  Repetir
                </Button>
              </>
            )}
            {camState === "denied" && (
              <>
                <Button onClick={() => fileInputRef.current?.click()} icon={<ImagePlus size={18} />}>
                  Cargar imagen
                </Button>
                <Button variant="ghost" onClick={enableCamera}>
                  Reintentar cámara
                </Button>
              </>
            )}
            <button
              onClick={() => {
                stopCamera();
                setMode("choose");
                setCaptured(null);
              }}
              className="w-full text-hint text-[12px] py-1"
            >
              Volver a opciones
            </button>
          </div>
        </>
      )}

      {mode === "upload" && captured && (
        <>
          <p className="text-sub text-[13px] leading-snug mb-3">
            Esta imagen inspirará la apariencia de tu gemelo.
          </p>
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card2 border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={captured} alt="subida" className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-[10px] text-brand-teal font-bold">
              ✓ Imagen cargada
            </span>
          </div>
          <div className="mt-5 space-y-3">
            <Button onClick={useThis}>Usar esta imagen</Button>
            <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={retake}>
              Elegir otra
            </Button>
            <button
              onClick={() => {
                setMode("choose");
                setCaptured(null);
              }}
              className="w-full text-hint text-[12px] py-1"
            >
              Volver a opciones
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OptionCard({
  icon,
  color,
  title,
  body,
  onClick,
  recommended,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
  onClick: () => void;
  recommended?: boolean;
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
        <div className="flex items-center gap-2">
          <p className="text-txt text-[14px] font-extrabold">{title}</p>
          {recommended && (
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              Recomendado
            </span>
          )}
        </div>
        <p className="text-sub text-[12px] mt-0.5 leading-snug">{body}</p>
      </div>
    </button>
  );
}
