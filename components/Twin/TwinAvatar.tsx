"use client";
import { useState } from "react";
import type { Mood, TwinAppearance } from "@/lib/types";
import { palettes } from "./twinStates";
import { TwinFallbackSVG } from "./TwinFallbackSVG";

interface Props {
  mood: Mood;
  size?: number;
  appearance?: Partial<TwinAppearance>;
  useImage?: boolean;
}

// useImage defaults to false so the polished SVG fallback shows out of the box.
// Once /public/images/twin/{happy,neutral,tired}.png exist, set useImage to true
// (e.g. via TWIN_USE_IMAGE env flag or per-screen prop) to swap to artwork.
export function TwinAvatar({ mood, size = 200, appearance, useImage = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const p = palettes[mood];

  // Try to use the image if useImage flag is true and we haven't failed loading it yet
  const showImage = useImage && !imgFailed;
  const src = `/images/twin/${mood}.png`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <>
          {/* Aura background */}
          <div
            className="absolute inset-0 rounded-full animate-aura"
            style={{
              background: `radial-gradient(circle, ${p.glow}66 0%, ${p.glow}22 45%, transparent 72%)`,
              filter: "blur(4px)",
            }}
          />
          <div className="relative animate-breathe">
            <div className="animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`gemelo ${mood}`}
                onError={() => setImgFailed(true)}
                style={{
                  width: size * 0.86,
                  height: size * 0.86,
                  objectFit: "contain",
                  borderRadius: "50%",
                  border: `2px solid ${p.color}66`,
                  filter: `drop-shadow(0 8px 18px ${p.color}55)`,
                  transition: "filter 400ms, border-color 400ms",
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <TwinFallbackSVG
          mood={mood}
          size={size}
          skinTone={appearance?.skinTone ?? 1}
          hair={appearance?.hair ?? "largo"}
          glasses={appearance?.glasses ?? false}
          presentation={appearance?.presentation ?? "femenina"}
        />
      )}
    </div>
  );
}
