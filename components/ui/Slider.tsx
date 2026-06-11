"use client";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  color?: string;
  unit?: string;
  onChange: (v: number) => void;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  color = "#60A5FA",
  unit = "",
  onChange,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-txt text-[13px] font-semibold">{label}</span>
        <span
          className="text-[12px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}14` }}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className="brand w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          ["--thumb" as any]: color,
          background: `linear-gradient(90deg, ${color} ${pct}%, #222C42 ${pct}%)`,
        }}
      />
    </div>
  );
}
