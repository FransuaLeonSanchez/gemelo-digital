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
  const interactive = onClick ? "active:scale-[0.99] cursor-pointer transition-transform" : "";
  return (
    <div
      onClick={onClick}
      className={`${base} border border-line rounded-2xl p-4 ${interactive} ${className}`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}
