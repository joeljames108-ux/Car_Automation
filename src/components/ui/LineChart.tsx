import { useState, useMemo, useRef } from "react";

interface ChartPoint { x: number; y: number; }
export interface ChartSeries {
  data: ChartPoint[];
  color: string;
  label?: string;
  fill?: boolean;
  unit?: string;
}

export function LineChart({
  series, xLabel, xUnit, height = 200, yMin, yMax,
}: {
  series: ChartSeries[];
  xLabel?: string; yLabel?: string; xUnit?: string; yUnit?: string;
  height?: number; yMin?: number; yMax?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { paths, xTicks, yTicks, xMin, xMax, yLo, yHi, xRange, yRange } = useMemo(() => {
    if (series.length === 0 || series[0].data.length === 0) {
      return { paths: [], gridLines: [], xTicks: [], yTicks: [], xMin: 0, xMax: 1, yLo: 0, yHi: 1, xRange: 1, yRange: 1 };
    }
    const allPoints = series.flatMap((s) => s.data);
    const xMin = Math.min(...allPoints.map((p) => p.x));
    const xMax = Math.max(...allPoints.map((p) => p.x));
    const yLo = yMin ?? Math.min(0, Math.min(...allPoints.map((p) => p.y)));
    const yHi = yMax ?? Math.max(...allPoints.map((p) => p.y)) * 1.08;
    const xRange = xMax - xMin || 1;
    const yRange = yHi - yLo || 1;

    const W = 100, H = 100;
    const padX = 8, padY = 8;
    const toX = (x: number) => padX + ((x - xMin) / xRange) * (W - 2 * padX);
    const toY = (y: number) => H - padY - ((y - yLo) / yRange) * (H - 2 * padY);

    const paths = series.map((s) => {
      const pointsWithSvg = s.data.map((p) => ({
        ...p,
        svgX: toX(p.x),
        svgY: toY(p.y),
      }));

      const line = pointsWithSvg.map((p, i) => `${i === 0 ? "M" : "L"}${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(" ");
      let fill = "";
      if (s.fill) {
        fill = `M${pointsWithSvg[0].svgX.toFixed(2)},${toY(yLo).toFixed(2)} ` +
          pointsWithSvg.map((p) => `L${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(" ") +
          ` L${pointsWithSvg[pointsWithSvg.length - 1].svgX.toFixed(2)},${toY(yLo).toFixed(2)} Z`;
      }

      // Find peak point for marker badge
      let peak = pointsWithSvg[0];
      for (const pt of pointsWithSvg) {
        if (pt.y > peak.y) peak = pt;
      }

      return { line, fill, color: s.color, label: s.label, unit: s.unit, points: pointsWithSvg, peak };
    });

    const yTicksTmp: { y: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const yVal = yLo + (yRange * i) / 4;
      yTicksTmp.push({ y: toY(yVal), label: Math.round(yVal).toString() });
    }

    const xTicksTmp: { x: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + (xRange * i) / 4;
      xTicksTmp.push({ x: toX(xVal), label: Math.round(xVal).toString() });
    }

    return { paths, xTicks: xTicksTmp, yTicks: yTicksTmp, xMin, xMax, yLo, yHi, xRange, yRange };
  }, [series, yMin, yMax]);

  // Handle mouse moves over SVG to compute closest RPM data point
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !series[0]?.data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const dataLen = series[0].data.length;
    const index = Math.max(0, Math.min(dataLen - 1, Math.floor(relX * dataLen)));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeRpm = hoverIndex !== null && series[0]?.data[hoverIndex] ? series[0].data[hoverIndex].x : null;

  return (
    <div className="w-full relative select-none" style={{ height }}>
      {/* Dynamic Hover Tooltip Banner */}
      {hoverIndex !== null && activeRpm !== null && (
        <div className="line-chart-tooltip absolute top-1 left-2 z-20 flex items-center gap-3 bg-white/90 border border-cyan-500/40 rounded-lg px-3 py-1.5 backdrop-blur-md shadow-lg pointer-events-none text-xs font-mono animate-in fade-in zoom-in-95 duration-100">
          <span className="text-slate-400 font-bold">{activeRpm} RPM:</span>
          {series.map((s, idx) => {
            const pt = s.data[hoverIndex];
            if (!pt) return null;
            return (
              <span key={idx} className="flex items-center gap-1 font-bold" style={{ color: s.color }}>
                <span>{s.label || (idx === 0 ? "Power" : "Torque")}:</span>
                <span>{Math.round(pt.y)}{s.unit || ""}</span>
              </span>
            );
          })}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={`grad-${idx}`} id={`chart-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <g key={`y${i}`}>
              <line x1="8" y1={t.y} x2="92" y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" strokeDasharray="1,1" />
              <text x="7" y={t.y + 0.8} fontSize="2.2" fill="#64748b" textAnchor="end" fontFamily="monospace">
                {t.label}
              </text>
            </g>
          ))}

          {xTicks.map((t, i) => (
            <text key={`x${i}`} x={t.x} y="98" fontSize="2.2" fill="#64748b" textAnchor="middle" fontFamily="monospace">
              {t.label}
            </text>
          ))}

          {/* Plot curves and gradient fills */}
          {paths.map((p, i) => (
            <g key={i}>
              {p.fill && <path d={p.fill} fill={`url(#chart-grad-${i})`} />}
              <path d={p.line} fill="none" stroke={p.color} strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />

              {/* Peak Marker Dot */}
              <circle cx={p.peak.svgX} cy={p.peak.svgY} r="1.5" fill={p.color} stroke="#0b101d" strokeWidth="0.5" />
            </g>
          ))}

          {/* Vertical Interactive Hover Line */}
          {hoverIndex !== null && paths[0]?.points[hoverIndex] && (
            <g>
              <line
                x1={paths[0].points[hoverIndex].svgX}
                y1="8"
                x2={paths[0].points[hoverIndex].svgX}
                y2="92"
                stroke="#38bdf8"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
              {paths.map((p, idx) => {
                const pt = p.points[hoverIndex];
                if (!pt) return null;
                return (
                  <circle
                    key={`hover-dot-${idx}`}
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r="2"
                    fill={p.color}
                    stroke="#ffffff"
                    strokeWidth="0.6"
                    className="animate-ping-once"
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {xLabel && (
        <div className="text-center text-[9px] text-slate-500 font-mono mt-0.5">
          {xLabel}{xUnit && ` (${xUnit})`}
        </div>
      )}
    </div>
  );
}
