import React from "react";

export interface NeonArcGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
  color?: "cyan" | "magenta" | "gold" | "emerald";
  className?: string;
}

export const NeonArcGauge: React.FC<NeonArcGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  size = 120,
  color = "cyan",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // 240 degree arc gauge (from 150deg to 390deg)
  const radius = (size - 14) / 2;
  const cx = size / 2;
  const cy = size / 2;
  
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + (percentage / 100) * totalAngle;

  const polarToCartesian = (centerX: number, centerY: number, rad: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + rad * Math.cos(angleInRadians),
      y: centerY + rad * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, rad: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, rad, endA);
    const end = polarToCartesian(x, y, rad, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", rad, rad, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const bgPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const activePath = describeArc(cx, cy, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  const colors = {
    cyan: {
      stroke: "#00e5ff",
      glow: "drop-shadow(0 0 8px rgba(0, 229, 255, 0.75))",
      text: "text-cyan-200",
    },
    magenta: {
      stroke: "#e040fb",
      glow: "drop-shadow(0 0 8px rgba(224, 64, 251, 0.75))",
      text: "text-fuchsia-200",
    },
    gold: {
      stroke: "#ffd740",
      glow: "drop-shadow(0 0 8px rgba(255, 215, 64, 0.75))",
      text: "text-amber-200",
    },
    emerald: {
      stroke: "#00e676",
      glow: "drop-shadow(0 0 8px rgba(0, 230, 118, 0.75))",
      text: "text-emerald-200",
    },
  }[color];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Track Arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Active Arc */}
        <path
          d={activePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: colors.glow, transition: "d 0.3s ease" }}
        />
      </svg>

      {/* Center Digital Telemetry Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
        <span className="text-[10px] nh-label-caps text-slate-400 leading-none mb-0.5">
          {label}
        </span>
        <span className={`text-base font-extrabold nh-font-headline ${colors.text} leading-tight`}>
          {Math.round(value)}
        </span>
        {unit && (
          <span className="text-[9px] nh-font-mono text-slate-400/80 leading-none">{unit}</span>
        )}
      </div>
    </div>
  );
};
