import { useMemo } from "react";

interface ChartPoint { x: number; y: number; }
interface ChartSeries {
  data: ChartPoint[];
  color: string;
  label?: string;
  fill?: boolean;
}

export function LineChart({
  series, xLabel, xUnit, height = 180, yMin, yMax,
}: {
  series: ChartSeries[];
  xLabel?: string; yLabel?: string; xUnit?: string; yUnit?: string;
  height?: number; yMin?: number; yMax?: number;
}) {
  const { paths, xTicks, yTicks } = useMemo(() => {
    if (series.length === 0 || series[0].data.length === 0) {
      return { paths: [], gridLines: [], xTicks: [], yTicks: [] };
    }
    const allPoints = series.flatMap((s) => s.data);
    const xMin = Math.min(...allPoints.map((p) => p.x));
    const xMax = Math.max(...allPoints.map((p) => p.x));
    const yLo = yMin ?? Math.min(...allPoints.map((p) => p.y));
    const yHi = yMax ?? Math.max(...allPoints.map((p) => p.y));
    const xRange = xMax - xMin || 1;
    const yRange = yHi - yLo || 1;

    const W = 100, H = 100;
    const pad = 5;
    const toX = (x: number) => pad + ((x - xMin) / xRange) * (W - 2 * pad);
    const toY = (y: number) => H - pad - ((y - yLo) / yRange) * (H - 2 * pad);

    const paths = series.map((s) => {
      const line = s.data.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x).toFixed(2)},${toY(p.y).toFixed(2)}`).join(" ");
      let fill = "";
      if (s.fill) {
        fill = `M${toX(s.data[0].x).toFixed(2)},${toY(yLo).toFixed(2)} ` +
          s.data.map((p) => `L${toX(p.x).toFixed(2)},${toY(p.y).toFixed(2)}`).join(" ") +
          ` L${toX(s.data[s.data.length - 1].x).toFixed(2)},${toY(yLo).toFixed(2)} Z`;
      }
      return { line, fill, color: s.color };
    });

    const gridLinesTmp: { y: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const yVal = yLo + (yRange * i) / 4;
      gridLinesTmp.push({ y: toY(yVal), label: yVal.toFixed(yRange > 100 ? 0 : 1) });
    }

    const xTicks: { x: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + (xRange * i) / 4;
      xTicks.push({ x: toX(xVal), label: xVal.toFixed(xRange > 100 ? 0 : 1) });
    }

    return { paths, gridLines: gridLinesTmp, xTicks, yTicks: gridLinesTmp };
  }, [series, yMin, yMax]);

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1="5" y1={t.y} x2="95" y2={t.y} stroke="#1e2839" strokeWidth="0.3" />
            <text x="2" y={t.y + 1} fontSize="2.5" fill="#475569" textAnchor="start">
              {t.label}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={`x${i}`} x={t.x} y="99" fontSize="2.5" fill="#475569" textAnchor="middle">
            {t.label}
          </text>
        ))}
        {paths.map((p, i) => (
          <g key={i}>
            {p.fill && <path d={p.fill} fill={p.color} opacity="0.12" />}
            <path d={p.line} fill="none" stroke={p.color} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {xLabel && (
        <div className="text-center text-[9px] text-slate-600 -mt-1">
          {xLabel}{xUnit && ` (${xUnit})`}
        </div>
      )}
    </div>
  );
}
