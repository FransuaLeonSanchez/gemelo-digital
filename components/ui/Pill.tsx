"use client";
import { ReactNode } from "react";

export function Pill({
  children,
  color = "#4DA3FF",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${className}`}
      style={{
        backgroundColor: `${color}1f`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {children}
    </span>
  );
}
