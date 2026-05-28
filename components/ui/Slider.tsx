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
  color = "#4DA3FF",
  unit = "",
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-txt text-[13px] font-semibold">{label}</span>
        <span className="text-[13px] font-extrabold" style={{ color }}>
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
        style={{ ["--thumb" as any]: color }}
      />
    </div>
  );
}
