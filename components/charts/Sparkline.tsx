"use client";

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  highlightMaxLabel?: string;
  showAxis?: boolean;
}

export function Sparkline({
  data,
  color,
  width = 320,
  height = 110,
  highlightMaxLabel,
  showAxis = true,
}: Props) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + h - ((v - min) / range) * h;
    return [x, y] as const;
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${pad + h} L${pts[0][0]},${pad + h} Z`;

  const maxIdx = data.indexOf(max);
  const [mx, my] = pts[maxIdx];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`g-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#g-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={mx} cy={my} r={4} fill={color} />
      <circle cx={mx} cy={my} r={9} fill={color} opacity="0.2" />
      {highlightMaxLabel && (
        <g>
          <rect
            x={Math.min(width - 70, Math.max(0, mx - 30))}
            y={Math.max(0, my - 24)}
            width="60"
            height="18"
            rx="8"
            fill="#1C2230"
            stroke={color}
            strokeOpacity="0.35"
          />
          <text
            x={Math.min(width - 40, Math.max(30, mx))}
            y={Math.max(12, my - 11)}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={color}
          >
            {highlightMaxLabel}
          </text>
        </g>
      )}
      {showAxis && (
        <g>
          <text x={pad} y={height - 0} fontSize="9" fill="#5C6678">
            00:00
          </text>
          <text x={width - pad} y={height - 0} fontSize="9" fill="#5C6678" textAnchor="end">
            24:00
          </text>
        </g>
      )}
    </svg>
  );
}
