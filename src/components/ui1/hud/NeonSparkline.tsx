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
    cyan: { stroke: "#8fb9d9" },
    magenta: { stroke: "#a99cc9" },
    gold: { stroke: "#d9b36c" },
    emerald: { stroke: "#7cbfa0" },
  }[color];

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`}>
      <polyline
        fill="none"
        stroke={colorMap.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
