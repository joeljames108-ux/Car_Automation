import React from "react";

export interface NeonSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "cyan" | "magenta" | "gold" | "emerald";
  className?: string;
}

export const NeonSparkline: React.FC<NeonSparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = "cyan",
  className = "",
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const colorMap = {
    cyan: { stroke: "#00e5ff", glow: "drop-shadow(0 0 4px rgba(0, 229, 255, 0.8))" },
    magenta: { stroke: "#e040fb", glow: "drop-shadow(0 0 4px rgba(224, 64, 251, 0.8))" },
    gold: { stroke: "#ffd740", glow: "drop-shadow(0 0 4px rgba(255, 215, 64, 0.8))" },
    emerald: { stroke: "#00e676", glow: "drop-shadow(0 0 4px rgba(0, 230, 118, 0.8))" },
  }[color];

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`}>
      <polyline
        fill="none"
        stroke={colorMap.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: colorMap.glow }}
      />
    </svg>
  );
};
