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
    cyan: { stroke: "#7fb5d8", text: "text-sky-300" },
    magenta: { stroke: "#9d8fc4", text: "text-amber-300" },
    gold: { stroke: "#d9b36c", text: "text-amber-300" },
    emerald: { stroke: "#6fbf9a", text: "text-emerald-300" },
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
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-xs font-bold nh-font-mono leading-none ${colorMap.text}`}>
          {label ?? `${Math.round(percentage)}%`}
        </span>
        {sublabel && (
          <span className="text-[8px] text-amber-200/60 nh-font-mono uppercase tracking-wider mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
