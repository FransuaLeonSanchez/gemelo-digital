"use client";
import { ReactNode } from "react";

export function Pill({
  children,
  color = "#60A5FA",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10.5px] font-bold tracking-wide ${className}`}
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}
