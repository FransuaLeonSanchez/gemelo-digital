"use client";

interface Props {
  data: { d: string; icm: number }[];
  height?: number;
  highlightIdx?: number;
}

const colorFor = (v: number) =>
  v < 40 ? "#1FD0A3" : v < 70 ? "#FFB23E" : "#FF5E6C";

export function BarsWeek({ data, height = 130, highlightIdx }: Props) {
  const max = Math.max(...data.map((d) => d.icm), 100);
  const idx = highlightIdx ?? data.length - 1;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.icm / max) * (height - 26);
          const c = colorFor(d.icm);
          const active = i === idx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-bold ${active ? "" : "text-hint"}`}
                style={{ color: active ? c : undefined }}
              >
                {d.icm}
              </span>
              <div
                className="w-full rounded-md origin-bottom transition-all"
                style={{
                  height: `${h}px`,
                  backgroundColor: active ? c : `${c}55`,
                  border: active ? `1px solid ${c}` : "1px solid #262D3D",
                  animation: "grow 700ms ease-out both",
                  animationDelay: `${i * 60}ms`,
                }}
              />
              <span className={`text-[10px] ${active ? "text-txt font-bold" : "text-sub"}`}>
                {d.d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
