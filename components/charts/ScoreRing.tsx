"use client";
import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-100
  color: string;
  size?: number;
  stroke?: number;
  label?: string;
  bigLabel?: string;
}

export function ScoreRing({
  value,
  color,
  size = 150,
  stroke = 12,
  label = "ICM",
  bigLabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const offset = c - (shown / 100) * c;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#262D3D"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1), stroke 400ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-extrabold leading-none"
          style={{
            color,
            fontSize: size >= 130 ? 40 : size >= 90 ? 28 : 22,
          }}
        >
          {bigLabel ?? Math.round(value)}
        </span>
        <span
          className="text-sub uppercase tracking-wider font-bold mt-1"
          style={{ fontSize: size >= 130 ? 11 : 10 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
