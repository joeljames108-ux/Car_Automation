import React from "react";

export interface NeonRadialDialProps {
  rpm: number;
  maxRpm?: number;
  gear: number;
  size?: number;
  className?: string;
}

export const NeonRadialDial: React.FC<NeonRadialDialProps> = ({
  rpm,
  maxRpm = 9000,
  gear,
  size = 140,
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));
  const isRedline = percentage > 85;

  // Needle angle (-120deg to 120deg)
  const needleAngle = -120 + (percentage / 100) * 240;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Dial Ring */}
      <div
        className={`absolute inset-0 rounded-full border transition-all duration-300 ${
 isRedline
 ? "border-rose-400/40"
 : "border-white/12"
 }`}
      />

      <svg width={size} height={size} className="overflow-visible">
        {/* RPM Tick Marks */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = -120 + (i / 9) * 240;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (size / 2 - 12) * Math.sin(rad);
          const y1 = size / 2 - (size / 2 - 12) * Math.cos(rad);
          const x2 = size / 2 + (size / 2 - 4) * Math.sin(rad);
          const y2 = size / 2 - (size / 2 - 4) * Math.cos(rad);
          const isHigh = i >= 8;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHigh ? "#d97b70" : "rgba(127,181,216, 0.35)"}
              strokeWidth={i % 3 === 0 ? "2" : "1"}
            />
          );
        })}

        {/* Dynamic Needle */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2 + (size / 2 - 14) * Math.sin((needleAngle * Math.PI) / 180)}
          y2={size / 2 - (size / 2 - 14) * Math.cos((needleAngle * Math.PI) / 180)}
          stroke={isRedline ? "#d97b70" : "#a9cde8"}
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            transition: "all 0.1s cubic-bezier(0.1, 0.9, 0.2, 1)",
          }}
        />
      </svg>

      {/* Center Gear & RPM Hub */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] nh-label-caps text-slate-400 leading-none">GEAR</span>
        <span className="text-2xl font-black nh-font-headline text-white leading-none my-0.5">
          {gear === 0 ? "N" : gear}
        </span>
        <span
          className={`text-[11px] nh-font-mono font-bold ${
 isRedline ? "text-rose-300 animate-pulse" : "text-sky-300"
 }`}
        >
          {rpm.toLocaleString()} RPM
        </span>
      </div>
    </div>
  );
};
