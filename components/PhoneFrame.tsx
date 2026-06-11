"use client";
import { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-page flex items-center justify-center px-2 py-4 sm:py-8 overflow-hidden">
      {/* Ambient backdrop glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-48 w-[520px] h-[520px] rounded-full opacity-[0.22]"
        style={{ background: "radial-gradient(circle, #3D7BF6 0%, transparent 68%)", filter: "blur(90px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -right-48 w-[560px] h-[560px] rounded-full opacity-[0.16]"
        style={{ background: "radial-gradient(circle, #7C5CF6 0%, transparent 68%)", filter: "blur(100px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 38%, transparent 0%, rgba(4,6,12,0.55) 100%)",
        }}
      />

      <div className="relative" style={{ width: "min(100vw, 390px)" }}>
        {/* Side buttons */}
        <div aria-hidden className="absolute -left-[3px] top-[118px] w-[3px] h-7 rounded-l-md bg-[#1B2335]" />
        <div aria-hidden className="absolute -left-[3px] top-[158px] w-[3px] h-12 rounded-l-md bg-[#1B2335]" />
        <div aria-hidden className="absolute -left-[3px] top-[216px] w-[3px] h-12 rounded-l-md bg-[#1B2335]" />
        <div aria-hidden className="absolute -right-[3px] top-[160px] w-[3px] h-[72px] rounded-r-md bg-[#1B2335]" />

        <div
          className="relative bg-bg overflow-hidden"
          style={{
            width: "min(100vw, 390px)",
            height: "min(100dvh, 820px)",
            borderRadius: 48,
            border: "8px solid #0B0F1B",
            boxShadow:
              "0 50px 100px -24px rgba(0,0,0,0.75), 0 0 0 1px #202A40, inset 0 0 0 1px #161D2E",
          }}
        >
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[112px] h-[27px] bg-black rounded-full flex items-center justify-end pr-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10141F] border border-[#222C42]" />
          </div>

          {/* Status bar */}
          <div className="absolute top-[13px] left-0 right-0 z-20 px-8 flex items-center justify-between text-[11px] font-bold text-txt">
            <span className="tabular-nums tracking-wide">9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryFull size={14} />
            </div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 pt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
