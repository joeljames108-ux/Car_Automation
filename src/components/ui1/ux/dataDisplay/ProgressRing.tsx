import React, { useMemo } from "react";

export interface ProgressRingProps {
  value: number; max?: number; size?: number; strokeWidth?: number;
  color?: string; bgColor?: string; label?: string; showValue?: boolean;
  animated?: boolean; className?: string; glowIntensity?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value, max = 100, size = 80, strokeWidth = 6, color = "#c4a860",
  bgColor = "rgba(255,255,255,0.08)", label, showValue = true,
  animated = true, className = "", glowIntensity = 0.4,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - pct);
  const gid = useMemo(() => "ring-" + Math.random().toString(36).substr(2, 9), []);
  return (
    <div className={"relative inline-flex items-center justify-center " + className} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
          {glowIntensity > 0 && <filter id={gid+"-glow"}><feGaussianBlur stdDeviation={glowIntensity*3} result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>}
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={"url(#"+gid+")"}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" filter={glowIntensity > 0 ? "url(#"+gid+"-glow)" : undefined}
          style={{ transition: animated ? "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" : "none", willChange: "stroke-dashoffset" }} />
      </svg>
      {(showValue || label) && <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && <span className="text-xs font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>}
        {label && <span className="text-[9px] text-amber-300/60 font-mono uppercase">{label}</span>}
      </div>}
    </div>
  );
};