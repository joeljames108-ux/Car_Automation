import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "neon" | "gold" | "emerald";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  glow?: boolean;
  sound?: boolean;
}

export const NeonHorizonButton: React.FC<NeonHorizonButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  glow = false,
  sound = true,
  className = "",
  onClick,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (sound) playHMIClickSound();
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    xs: "px-2.5 py-1 text-[10px] rounded-lg gap-1.5",
    sm: "px-3 py-1.5 text-xs rounded-xl gap-2",
    md: "px-4 py-2 text-xs rounded-xl gap-2.5",
    lg: "px-6 py-3 text-sm rounded-2xl gap-3",
  }[size];

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-cyan-500/25 to-sky-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/35 hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(0,229,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]",
    secondary:
      "bg-[#0d1c3a]/70 text-slate-200 border border-white/10 hover:bg-[#132852]/80 hover:border-cyan-400/30 hover:text-cyan-200 shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
    ghost:
      "bg-transparent text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/20",
    danger:
      "bg-gradient-to-r from-red-500/25 to-rose-500/20 text-rose-200 border border-red-400/40 hover:bg-red-500/35 hover:border-red-300 hover:text-white shadow-[0_0_15px_rgba(255,82,82,0.25)]",
    neon:
      "bg-gradient-to-r from-cyan-500/30 via-purple-500/25 to-fuchsia-500/30 text-white border border-cyan-300/60 hover:border-cyan-200 shadow-[0_0_25px_rgba(0,229,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] font-bold",
    gold:
      "bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/35 hover:border-amber-300 hover:text-white shadow-[0_0_15px_rgba(255,215,64,0.25)]",
    emerald:
      "bg-gradient-to-r from-emerald-500/25 to-teal-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/35 hover:border-emerald-300 hover:text-white shadow-[0_0_15px_rgba(0,230,118,0.25)]",
  }[variant];

  const glowClass = glow ? "animate-nh-glow" : "";
  const disabledClass = disabled || loading ? "opacity-40 cursor-not-allowed pointer-events-none" : "active:scale-[0.98]";

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 select-none backdrop-blur-md ${sizeClasses} ${variantClasses} ${glowClass} ${disabledClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
};
