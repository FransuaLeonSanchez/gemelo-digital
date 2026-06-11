"use client";
import { ReactNode } from "react";

export function SectionTitle({
  children,
  right,
  className = "",
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-2.5 mt-5 ${className}`}>
      <h3 className="text-sub text-[11px] font-extrabold uppercase tracking-[0.16em]">
        {children}
      </h3>
      {right}
    </div>
  );
}
