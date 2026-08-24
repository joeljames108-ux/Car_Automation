import React from "react";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  color?: "cyan" | "magenta" | "emerald";
  className?: string;
}

export const NeonHorizonToggle: React.FC<NeonHorizonToggleProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  color = "cyan",
  className = "",
}) => {
  const handleClick = () => {
    if (disabled) return;
    playHMITabSound();
    onChange(!checked);
  };

  const knobStyles = {
    cyan: "bg-sky-400 border-sky-300/70",
    magenta: "bg-sky-400 border-sky-300/70",
    emerald: "bg-emerald-400 border-emerald-300/70",
  }[color];

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer select-none transition-all duration-200 hover:bg-white/[0.04] ${
 disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
 } ${className}`}
    >
      <div className="flex flex-col pr-4">
        <span className="text-xs font-semibold nh-font-body tracking-wider text-slate-200">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-slate-400 nh-font-mono">{description}</span>
        )}
      </div>

      <div
        className={`relative w-11 h-6 rounded-full transition-all duration-300 p-0.5 border ${
 checked
 ? "bg-sky-400/15 border-sky-400/30"
 : "bg-[#0a111e] border-white/10"
 }`}
      >
        <div
          className={`w-4.5 h-4.5 rounded-full border transition-all duration-300 transform ${
            checked
              ? `translate-x-5 ${knobStyles}`
              : "translate-x-0 bg-slate-500 border-slate-400"
          }`}
        />
      </div>
    </div>
  );
};
