import React, { useState } from "react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string | number;
  description?: string;
  color?: "cyan" | "magenta" | "gold" | "emerald";
  className?: string;
}

export const NeonHorizonSlider: React.FC<NeonHorizonSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  formatValue,
  description,
  color = "cyan",
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const displayVal = formatValue ? formatValue(value) : value;

  const colorStyles = {
    cyan: {
      fill: "bg-amber-500/70",
      glow: "",
      text: "text-amber-300",
      badge: "border-amber-500/30 bg-amber-500/20 text-sky-200",
    },
    magenta: {
      fill: "bg-amber-500/70",
      glow: "",
      text: "text-amber-300",
      badge: "border-amber-500/30 bg-amber-500/20 text-sky-200",
    },
    gold: {
      fill: "bg-amber-400/70",
      glow: "",
      text: "text-amber-300",
      badge: "border-amber-400/30 bg-amber-500/12 text-amber-200",
    },
    emerald: {
      fill: "bg-emerald-400/70",
      glow: "",
      text: "text-emerald-300",
      badge: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
    },
  }[color];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    playHMIClickSound();
  };

  return (
    <div
      className={`flex flex-col gap-1.5 p-2 rounded-xl transition-all duration-200 ${
 isHovered ? "bg-white/[0.03]" : ""
 } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="nh-label-caps text-amber-200/70">{label}</span>
          {description && (
            <span className="text-[10px] text-amber-400/50 nh-font-mono hidden sm:inline">
              {description}
            </span>
          )}
        </div>
        <div
          className={`px-2 py-0.5 rounded-md border text-[11px] nh-font-mono font-bold transition-all ${colorStyles.badge}`}
        >
          {displayVal}
          {unit && <span className="text-[10px] opacity-75 ml-0.5">{unit}</span>}
        </div>
      </div>

      <div className="relative flex items-center h-5">
        {/* Track background */}
        <div className="w-full h-1.5 bg-amber-950/80 rounded-full overflow-hidden border border-white/10 relative">
          {/* Active fill */}
          <div
            className={`h-full ${colorStyles.fill} rounded-full transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Range Input over top */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Precision thumb marker */}
        <div
          className={`absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-500/80 shadow-[0_1px_4px_rgba(0,0,0,0.5)] pointer-events-none transform -translate-x-1/2 transition-transform duration-75 ${
 isHovered ? "scale-110" : "scale-100"
 }`}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
