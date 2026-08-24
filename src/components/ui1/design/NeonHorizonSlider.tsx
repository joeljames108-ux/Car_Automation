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
      fill: "from-cyan-500 to-sky-400",
      glow: "shadow-[0_0_12px_rgba(0,229,255,0.6)]",
      text: "text-cyan-300",
      badge: "border-cyan-400/40 bg-cyan-500/15 text-cyan-200",
    },
    magenta: {
      fill: "from-fuchsia-500 to-purple-400",
      glow: "shadow-[0_0_12px_rgba(224,64,251,0.6)]",
      text: "text-fuchsia-300",
      badge: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200",
    },
    gold: {
      fill: "from-amber-500 to-yellow-400",
      glow: "shadow-[0_0_12px_rgba(255,215,64,0.6)]",
      text: "text-amber-300",
      badge: "border-amber-400/40 bg-amber-500/15 text-amber-200",
    },
    emerald: {
      fill: "from-emerald-500 to-teal-400",
      glow: "shadow-[0_0_12px_rgba(0,230,118,0.6)]",
      text: "text-emerald-300",
      badge: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
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
        isHovered ? "bg-cyan-500/5" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="nh-label-caps text-slate-300">{label}</span>
          {description && (
            <span className="text-[10px] text-slate-500 nh-font-mono hidden sm:inline">
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
        <div className="w-full h-1.5 bg-[#0a1630] rounded-full overflow-hidden border border-white/10 relative">
          {/* Active fill with gradient */}
          <div
            className={`h-full bg-gradient-to-r ${colorStyles.fill} ${colorStyles.glow} rounded-full transition-all duration-75`}
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

        {/* Custom Glowing Thumb Marker */}
        <div
          className={`absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 ${colorStyles.glow} pointer-events-none transform -translate-x-1/2 transition-transform duration-75 ${
            isHovered ? "scale-125" : "scale-100"
          }`}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
