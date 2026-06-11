"use client";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-1 mb-2">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center active:scale-95 transition disabled:opacity-30"
        disabled={!onBack}
        aria-label="Atrás"
      >
        <ChevronLeft size={18} className="text-txt" />
      </button>
      <h1 className="text-txt text-[16px] font-bold tracking-tight">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </div>
  );
}
