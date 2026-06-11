"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: string;
  inner?: boolean;
}

export function Card({ children, className = "", onClick, accent, inner }: Props) {
  const base = inner ? "bg-card2" : "bg-card";
  const interactive = onClick
    ? "active:scale-[0.985] cursor-pointer transition-transform"
    : "";
  return (
    <div
      onClick={onClick}
      className={`relative ${base} border border-white/[0.06] rounded-[20px] p-4 shadow-card ${interactive} ${className}`}
    >
      {accent && (
        <span
          aria-hidden
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}55` }}
        />
      )}
      {children}
    </div>
  );
}
