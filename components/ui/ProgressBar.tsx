"use client";

export function ProgressBar({
  value,
  color = "#60A5FA",
  className = "",
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}B3, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}
