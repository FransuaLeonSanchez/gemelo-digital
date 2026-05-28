"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  icon?: ReactNode;
  className?: string;
  full?: boolean;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
  full = true,
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-brand-blue text-bg font-extrabold"
      : variant === "danger"
      ? "bg-transparent border border-line text-brand-red font-bold"
      : "bg-transparent border border-line text-sub font-bold";
  return (
    <button
      onClick={onClick}
      className={`${full ? "w-full" : ""} h-12 rounded-2xl px-5 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${styles} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
