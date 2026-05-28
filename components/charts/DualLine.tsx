"use client";

interface Series {
  data: number[];
  color: string;
  label: string;
}

interface Props {
  series: Series[];
  labels: string[];
  width?: number;
  height?: number;
}

export function DualLine({ series, labels, width = 320, height = 170 }: Props) {
  const all = series.flatMap((s) => s.data);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = 18;
  const w = width - pad * 2;
  const h = height - pad * 2 - 16;
  const range = Math.max(1, max - min);
  const step = w / (labels.length - 1);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={width - pad}
          y1={pad + h * t}
          y2={pad + h * t}
          stroke="#262D3D"
          strokeDasharray="3 4"
        />
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => {
          const x = pad + i * step;
          const y = pad + h - ((v - min) / range) * h;
          return [x, y] as const;
        });
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
        return (
          <g key={si}>
            <path
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={s.color} />
            ))}
            <text
              x={pts[pts.length - 1][0] + 4}
              y={pts[pts.length - 1][1] - 6}
              fontSize="10"
              fontWeight="700"
              fill={s.color}
            >
              {s.data[s.data.length - 1]}%
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text
          key={i}
          x={pad + i * step}
          y={height - 2}
          fontSize="10"
          fill="#8A95AC"
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}
