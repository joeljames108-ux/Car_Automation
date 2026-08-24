import React, { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface NeonHorizonSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  sublabel?: string;
  options: (NeonHorizonSelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "minimal";
  className?: string;
}

export const NeonHorizonSelect: React.FC<NeonHorizonSelectProps> = ({
  label,
  sublabel,
  options,
  value,
  onChange,
  icon,
  variant = "primary",
  className = "",
  disabled,
  ...rest
}) => {
  const normalizedOptions: NeonHorizonSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playHMIClickSound();
    onChange(e.target.value);
  };

  const variantStyles = {
    primary:
      "bg-[#081226]/85 border-cyan-400/30 text-cyan-100 focus:border-cyan-300 focus:shadow-[0_0_20px_rgba(0,229,255,0.35)]",
    secondary:
      "bg-[#0a1630]/70 border-white/15 text-slate-200 focus:border-cyan-400/50",
    minimal:
      "bg-black/30 border-cyan-500/20 text-slate-200 focus:border-cyan-400/40",
  }[variant];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="nh-label-caps text-slate-400">{label}</span>
          {sublabel && <span className="text-[10px] nh-font-mono text-cyan-400/80">{sublabel}</span>}
        </div>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-cyan-400 pointer-events-none z-10">{icon}</div>
        )}
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl py-2 text-xs font-semibold nh-font-body tracking-wider transition-all duration-200 cursor-pointer backdrop-blur-md border outline-none pr-9 ${
            icon ? "pl-9" : "pl-3.5"
          } ${variantStyles} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          {...rest}
        >
          {normalizedOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-[#060c1c] text-slate-100 py-1 font-sans"
            >
              {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ""}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 text-cyan-400/70 pointer-events-none transition-transform"
        />
      </div>
    </div>
  );
};
