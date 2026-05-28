"use client";
import type { Mood } from "@/lib/types";
import { palettes } from "./twinStates";

interface Props {
  mood: Mood;
  size?: number;
  skinTone?: number;     // 0-4
  hair?: "corto" | "largo" | "recogido" | "rizado";
  glasses?: boolean;
  presentation?: "femenina" | "masculina" | "neutra";
}

const SKIN_TONES = ["#F4D5B8", "#E8B98A", "#D29A6C", "#B07A4F", "#8B5A36"];

export function TwinFallbackSVG({
  mood,
  size = 200,
  skinTone = 1,
  hair = "largo",
  glasses = false,
  presentation = "femenina",
}: Props) {
  const p = palettes[mood];
  const skin = SKIN_TONES[Math.max(0, Math.min(SKIN_TONES.length - 1, skinTone))];

  // Mouth path by mood
  const mouth =
    mood === "happy"
      ? "M82,128 Q100,144 118,128"
      : mood === "neutral"
      ? "M84,132 L116,132"
      : "M82,138 Q100,124 118,138";

  // Eye shape
  const eyeRy = mood === "tired" ? 2.2 : mood === "neutral" ? 3.2 : 4;
  // Eyebrow tilt
  const browL = mood === "tired" ? "M76,90 L92,95" : mood === "neutral" ? "M76,92 L92,92" : "M76,92 Q84,87 92,91";
  const browR = mood === "tired" ? "M108,95 L124,90" : mood === "neutral" ? "M108,92 L124,92" : "M108,91 Q116,87 124,92";

  // Hair shape
  const hairFill =
    hair === "corto" ? "M58,70 Q100,38 142,70 L142,84 Q100,68 58,84 Z"
    : hair === "largo" ? "M52,76 Q100,28 148,76 L148,170 Q140,140 132,170 L132,90 L68,90 L68,170 Q60,140 52,170 Z"
    : hair === "recogido" ? "M58,72 Q100,34 142,72 L142,86 Q100,72 58,86 Z M134,52 a14 14 0 1 0 0.1 0"
    : "M55,80 Q70,38 100,42 Q130,38 145,80 Q150,72 142,70 Q138,52 100,50 Q62,52 58,70 Q50,72 55,80 Z";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Aura */}
      <div
        className="absolute inset-0 rounded-full animate-aura"
        style={{
          background: `radial-gradient(circle, ${p.glow}55 0%, ${p.glow}1f 40%, transparent 70%)`,
          filter: "blur(4px)",
        }}
      />
      {/* Telemetry dots */}
      {[0, 1, 2, 3].map((i) => {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 6;
        const r = size / 2 - 6;
        const x = Math.cos(ang) * r + size / 2;
        const y = Math.sin(ang) * r + size / 2;
        return (
          <span
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              width: 6,
              height: 6,
              left: x - 3,
              top: y - 3,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        );
      })}

      {/* Twin body */}
      <div className="relative animate-breathe">
        <div className="animate-float">
          <svg
            width={size * 0.78}
            height={size * 0.78}
            viewBox="0 0 200 200"
            style={{
              transition: "filter 400ms",
              filter: `drop-shadow(0 6px 16px ${p.color}55)`,
            }}
          >
            {/* Shoulders / shirt */}
            <path
              d="M30,200 Q30,150 70,140 L130,140 Q170,150 170,200 Z"
              fill={p.color}
              opacity="0.85"
            />
            <path
              d="M30,200 Q30,150 70,140 L130,140 Q170,150 170,200 Z"
              fill="url(#shirt-grad)"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="shirt-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Neck */}
            <rect x="88" y="128" width="24" height="20" rx="6" fill={skin} />
            {/* Head */}
            <ellipse cx="100" cy="100" rx="46" ry="50" fill={skin} />

            {/* Hair */}
            <path d={hairFill} fill="#2A1E16" opacity="0.92" />

            {/* Eyebrows */}
            <path d={browL} stroke="#2A1E16" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d={browR} stroke="#2A1E16" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Eyes */}
            <g className="animate-blink" style={{ transformOrigin: "100px 108px" }}>
              <ellipse cx="84" cy="108" rx="3.6" ry={eyeRy} fill="#1B1B1B" />
              <ellipse cx="116" cy="108" rx="3.6" ry={eyeRy} fill="#1B1B1B" />
              {mood !== "tired" && (
                <>
                  <circle cx="85.2" cy="106.7" r="1.1" fill="#fff" />
                  <circle cx="117.2" cy="106.7" r="1.1" fill="#fff" />
                </>
              )}
            </g>

            {/* Under-eye shadow for tired */}
            {mood === "tired" && (
              <>
                <path d="M78,115 Q84,118 90,115" stroke="#7A4453" strokeWidth="1.6" fill="none" opacity="0.7" />
                <path d="M110,115 Q116,118 122,115" stroke="#7A4453" strokeWidth="1.6" fill="none" opacity="0.7" />
              </>
            )}

            {/* Cheeks (happy only) */}
            {mood === "happy" && (
              <>
                <circle cx="74" cy="120" r="6" fill={p.cheek} opacity="0.55" />
                <circle cx="126" cy="120" r="6" fill={p.cheek} opacity="0.55" />
              </>
            )}

            {/* Mouth */}
            <path
              d={mouth}
              stroke="#1B1B1B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ transition: "d 400ms" }}
            />

            {/* Glasses */}
            {glasses && (
              <g stroke={p.color} strokeWidth="2.4" fill="none">
                <circle cx="84" cy="108" r="10" />
                <circle cx="116" cy="108" r="10" />
                <line x1="94" y1="108" x2="106" y2="108" />
              </g>
            )}

            {/* Earring (presentation femenina) */}
            {presentation === "femenina" && (
              <>
                <circle cx="56" cy="118" r="2.4" fill={p.color} />
                <circle cx="144" cy="118" r="2.4" fill={p.color} />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
