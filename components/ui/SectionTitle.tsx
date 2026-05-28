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
    <div className={`flex items-center justify-between mb-2 mt-4 ${className}`}>
      <h3 className="text-sub text-[13px] font-bold uppercase tracking-wide">
        {children}
      </h3>
      {right}
    </div>
  );
}
