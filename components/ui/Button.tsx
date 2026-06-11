"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  icon?: ReactNode;
  className?: string;
  full?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
  full = true,
  disabled,
}: Props) {
  const styles =
    variant === "primary"
      ? "text-white font-bold border border-white/10 bg-brand-gradient shadow-[0_10px_24px_-8px_rgba(99,124,246,0.55)]"
      : variant === "danger"
      ? "bg-brand-red/10 border border-brand-red/25 text-brand-red font-bold"
      : "bg-white/[0.04] border border-white/[0.08] text-txt font-bold";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${full ? "w-full" : ""} h-12 rounded-full px-6 inline-flex items-center justify-center gap-2 text-[14px] active:scale-[0.97] transition-all duration-150 disabled:opacity-50 ${styles} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
