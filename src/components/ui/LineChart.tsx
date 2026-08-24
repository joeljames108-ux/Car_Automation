import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, ArrowLeft, X, TrendingUp } from "lucide-react";

interface ChartPoint { x: number; y: number; }
export interface ChartSeries {
  data: ChartPoint[];
  color: string;
  label?: string;
  fill?: boolean;
  unit?: string;
}

export function LineChart({
  series, xLabel, xUnit, height = 200, yMin, yMax, yLabel, yUnit, allowZoom = true,
}: {
  series: ChartSeries[];
  xLabel?: string; yLabel?: string; xUnit?: string; yUnit?: string;
  height?: number; yMin?: number; yMax?: number;
  allowZoom?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const openZoomModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!allowZoom) return;
    setIsZoomed(true);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalActive(true);
      });
    });
  };

  const closeZoomModal = () => {
    setIsZoomed(false);
    setModalActive(false);
    setTimeout(() => {
      setModalRendered(false);
    }, 400);
  };

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  const { paths, xTicks, yTicks } = useMemo(() => {
    if (series.length === 0 || series[0].data.length === 0) {
      return { paths: [], xTicks: [], yTicks: [] };
    }
    const allPoints = series.flatMap((s) => s.data);
    const xMin = Math.min(...allPoints.map((p) => p.x));
    const xMax = Math.max(...allPoints.map((p) => p.x));
    const yLo = yMin ?? Math.min(0, Math.min(...allPoints.map((p) => p.y)));
    const yHi = yMax ?? Math.max(...allPoints.map((p) => p.y)) * 1.08;
    const xRange = xMax - xMin || 1;
    const yRange = yHi - yLo || 1;

    // High-resolution 1000 x height coordinate space
    const W = 1000;
    const H = height;
    const padLeft = 52;
    const padRight = 24;
    const padTop = 16;
    const padBottom = 28;

    const toX = (x: number) => padLeft + ((x - xMin) / xRange) * (W - padLeft - padRight);
    const toY = (y: number) => H - padBottom - ((y - yLo) / yRange) * (H - padTop - padBottom);

    const paths = series.map((s) => {
      const pointsWithSvg = s.data.map((p) => ({
        ...p,
        svgX: toX(p.x),
        svgY: toY(p.y),
      }));

      const line = pointsWithSvg.map((p, i) => `${i === 0 ? "M" : "L"}${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(" ");
      let fill = "";
      if (s.fill) {
        fill = `M${pointsWithSvg[0].svgX.toFixed(1)},${toY(yLo).toFixed(1)} ` +
          pointsWithSvg.map((p) => `L${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(" ") +
          ` L${pointsWithSvg[pointsWithSvg.length - 1].svgX.toFixed(1)},${toY(yLo).toFixed(1)} Z`;
      }

      // Peak point marker
      let peak = pointsWithSvg[0];
      for (const pt of pointsWithSvg) {
        if (pt.y > peak.y) peak = pt;
      }

      return { line, fill, color: s.color, label: s.label, unit: s.unit, points: pointsWithSvg, peak };
    });

    const yTicksTmp: { y: number; yPct: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const yVal = yLo + (yRange * i) / 4;
      const svgY = toY(yVal);
      const yPct = ((svgY - padTop) / (H - padTop - padBottom)) * 100;
      yTicksTmp.push({ y: svgY, yPct, label: Math.round(yVal).toLocaleString() });
    }

    const xTicksTmp: { x: number; xPct: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const xVal = xMin + (xRange * i) / 4;
      const svgX = toX(xVal);
      const xPct = ((svgX - padLeft) / (W - padLeft - padRight)) * 100;
      xTicksTmp.push({ x: svgX, xPct, label: Math.round(xVal).toLocaleString() });
    }

    return { paths, xTicks: xTicksTmp, yTicks: yTicksTmp };
  }, [series, yMin, yMax, height]);

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
    <div className={`w-full relative select-none flex flex-col group ${allowZoom ? "cursor-pointer" : ""}`} style={{ height }} onClick={allowZoom ? openZoomModal : undefined}>
      {/* Zoom Button Icon on Hover */}
      {allowZoom && (
        <button
          onClick={openZoomModal}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 border border-blue-400/40 text-[#007aff] p-1.5 rounded-full shadow-md z-30 hover:bg-blue-50 active:scale-95 cursor-pointer"
          title="Click to Zoom Chart"
        >
          <Maximize2 size={12} />
        </button>
      )}

      {/* Dynamic Hover Tooltip Banner */}
      {hoverIndex !== null && activeRpm !== null && (
        <div className="line-chart-tooltip absolute top-1 left-2 z-20 flex items-center gap-3 bg-white/90 border border-cyan-500/40 rounded-lg px-3 py-1.5 backdrop-blur-md shadow-lg pointer-events-none text-xs font-mono">
          <span className="text-slate-400 font-bold">{activeRpm} {xUnit || ""}:</span>
          {series.map((s, idx) => {
            const pt = s.data[hoverIndex];
            if (!pt) return null;
            return (
              <span key={idx} className="flex items-center gap-1 font-bold" style={{ color: s.color }}>
                <span>{s.label || (idx === 0 ? "Series 1" : "Series 2")}:</span>
                <span>{Math.round(pt.y).toLocaleString()}{s.unit || yUnit || ""}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Main Chart Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-crosshair relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* HTML Y-Axis Labels */}
        <div style={{ position: "absolute", top: 16, bottom: 28, left: 0, width: 46, pointerEvents: "none", zIndex: 5 }}>
          {yTicks.map((t, i) => (
            <span
              key={`ytick-${i}`}
              style={{
                position: "absolute",
                top: `${t.yPct}%`,
                right: 4,
                transform: "translateY(-50%)",
                fontSize: 10,
                fontWeight: 800,
                color: "#1e293b",
                fontFamily: "monospace",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* HTML X-Axis Labels */}
        <div style={{ position: "absolute", bottom: 4, left: 52, right: 24, height: 20, pointerEvents: "none", zIndex: 5 }}>
          {xTicks.map((t, i) => (
            <span
              key={`xtick-${i}`}
              style={{
                position: "absolute",
                left: `${t.xPct}%`,
                transform: "translateX(-50%)",
                fontSize: 10,
                fontWeight: 800,
                color: "#1e293b",
                fontFamily: "monospace",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* SVG Plot Paths & Grids */}
        <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={`grad-${idx}`} id={`chart-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <line
              key={`grid-y-${i}`}
              x1="52"
              y1={t.y}
              x2="976"
              y2={t.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Plot curves and gradient fills */}
          {paths.map((p, i) => (
            <g key={i}>
              {p.fill && <path d={p.fill} fill={`url(#chart-grad-${i})`} />}
              <path
                d={p.line}
                fill="none"
                stroke={p.color}
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animated-chart-line"
              />

              {/* Peak Marker Badge Dot */}
              <circle
                cx={p.peak.svgX}
                cy={p.peak.svgY}
                r="5"
                fill={p.color}
                stroke="#09090b"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
              />
            </g>
          ))}

          {/* Vertical Interactive Hover Line */}
          {hoverIndex !== null && paths[0]?.points[hoverIndex] && (
            <g>
              <line
                x1={paths[0].points[hoverIndex].svgX}
                y1="16"
                x2={paths[0].points[hoverIndex].svgX}
                y2={height - 28}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
              {paths.map((p, idx) => {
                const pt = p.points[hoverIndex];
                if (!pt) return null;
                return (
                  <circle
                    key={`hover-dot-${idx}`}
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r="5"
                    fill={p.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {xLabel && (
        <div className="text-center text-[10px] text-slate-500 font-mono font-bold mt-1">
          {xLabel}{xUnit && ` (${xUnit})`}
        </div>
      )}

      {/* Ultra-Smooth Spatial Glass Lightbox Modal via Portal directly to body */}
      {modalRendered && createPortal(
        <div 
          className={`schematic-backdrop ${modalActive ? "active" : ""}`}
          onClick={closeZoomModal}
        >
          <div 
            className="schematic-modal-container max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back & Close */}
            <div className="w-full flex items-center justify-between border-b border-blue-200/50 pb-3.5 mb-4">
              <button
                onClick={closeZoomModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-[#007aff] border border-blue-400/30 text-xs font-mono font-bold hover:bg-blue-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                <TrendingUp size={14} className="text-[#007aff]" />
                {yLabel || "Telemetry"} Analytics Curve
              </div>
              <button
                onClick={closeZoomModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* High-Resolution Expanded Chart */}
            <div className="w-full bg-gradient-to-br from-white/95 via-blue-50/30 to-slate-100/50 border border-blue-200/50 rounded-2xl p-4 shadow-sm">
              <LineChart
                series={series}
                xLabel={xLabel}
                yLabel={yLabel}
                xUnit={xUnit}
                yUnit={yUnit}
                yMin={yMin}
                yMax={yMax}
                height={380}
                allowZoom={false}
              />
            </div>

            {/* Specifications & Peak Values Bar */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-blue-200/40">
              {paths.map((p, idx) => (
                <div key={idx} className="bg-white/85 border border-blue-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                  <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">{p.label || `Series ${idx + 1}`} Peak</span>
                  <span className="text-sm font-mono font-bold" style={{ color: p.color }}>
                    {Math.round(p.peak.y).toLocaleString()}{p.unit || yUnit || ""}
                  </span>
                  <span className="block text-[9px] font-mono text-slate-400 mt-0.5">@ {p.peak.x} {xUnit || ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

