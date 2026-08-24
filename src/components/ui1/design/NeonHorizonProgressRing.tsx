import React from "react";

export interface NeonHorizonProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: "cyan" | "magenta" | "gold" | "emerald";
  label?: string;
  sublabel?: string;
  className?: string;
}

export const NeonHorizonProgressRing: React.FC<NeonHorizonProgressRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "cyan",
  label,
  sublabel,
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  const colorMap = {
    cyan: {
      stroke: "#00e5ff",
      glow: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.7))",
      text: "text-cyan-300",
    },
    magenta: {
      stroke: "#e040fb",
      glow: "drop-shadow(0 0 6px rgba(224, 64, 251, 0.7))",
      text: "text-fuchsia-300",
    },
    gold: {
      stroke: "#ffd740",
      glow: "drop-shadow(0 0 6px rgba(255, 215, 64, 0.7))",
      text: "text-amber-300",
    },
    emerald: {
      stroke: "#00e676",
      glow: "drop-shadow(0 0 6px rgba(0, 230, 118, 0.7))",
      text: "text-emerald-300",
    },
  }[color];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ filter: colorMap.glow, transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-xs font-bold nh-font-mono leading-none ${colorMap.text}`}>
          {label ?? `${Math.round(percentage)}%`}
        </span>
        {sublabel && (
          <span className="text-[8px] text-slate-400 nh-font-mono uppercase tracking-wider mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
