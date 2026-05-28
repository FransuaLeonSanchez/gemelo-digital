"use client";
import { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-page flex items-center justify-center px-2 py-4 sm:py-8">
      <div
        className="relative bg-bg overflow-hidden shadow-soft"
        style={{
          width: "min(100vw, 390px)",
          height: "min(100dvh, 820px)",
          borderRadius: 44,
          border: "8px solid #0E1320",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 0 0 1px #1A2030",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-32 h-6 bg-black rounded-b-2xl flex items-center justify-end pr-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1A1F2C] border border-[#2A3142]" />
        </div>

        {/* Status bar */}
        <div className="absolute top-1.5 left-0 right-0 z-20 px-7 flex items-center justify-between text-[11px] font-bold text-txt">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 opacity-90">
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryFull size={14} />
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 pt-9">{children}</div>
      </div>
    </div>
  );
}
