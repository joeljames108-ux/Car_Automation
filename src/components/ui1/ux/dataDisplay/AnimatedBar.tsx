import React from "react";

export interface AnimatedBarProps {
  value: number; max?: number; color?: string; bgColor?: string;
  height?: number; label?: string; showValue?: boolean; animated?: boolean;
  className?: string; glowColor?: string;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  value, max = 100, color = "linear-gradient(90deg, #c4a860, #e8c874)",
  bgColor = "rgba(255,255,255,0.06)", height = 6, label, showValue = true,
  animated = true, className = "", glowColor = "rgba(196,168,96,0.3)",
}) => {
  const pct = Math.min(Math.max(value / max, 0), 100);
  return (
    <div className={"flex flex-col gap-1 "+className}>
      {(label || showValue) && <div className="flex items-center justify-between">
        {label && <span className="text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">{label}</span>}
        {showValue && <span className="text-[11px] font-mono font-bold text-amber-200">{Math.round(pct)}%</span>}
      </div>}
      <div className="w-full rounded-full overflow-hidden" style={{height,background:bgColor}}>
        <div className="h-full rounded-full" style={{
          width: pct + "%", background: color,
          transition: animated ? "width 0.8s cubic-bezier(0.16,1,0.3,1)" : "none",
          boxShadow: "0 0 10px "+glowColor,
          willChange: "width",
        }} />
      </div>
    </div>
  );
};