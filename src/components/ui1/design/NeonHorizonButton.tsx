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

  // Quiet cockpit buttons: flat tints, hairline borders, crisp press states.
  const variantClasses = {
    primary:
      "bg-sky-400/15 text-sky-200 border border-sky-400/30 hover:bg-sky-400/25 hover:border-sky-300/50 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    secondary:
      "bg-white/[0.05] text-amber-50 border border-white/10 hover:bg-white/[0.09] hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.25)]",
    ghost:
      "bg-transparent text-amber-200/60 hover:text-amber-50 hover:bg-white/[0.06] border border-transparent hover:border-white/10",
    danger:
      "bg-rose-500/12 text-rose-200 border border-rose-400/30 hover:bg-rose-500/22 hover:border-rose-300/50 hover:text-white",
    neon:
      "bg-sky-400/20 text-white border border-sky-300/40 hover:bg-sky-400/30 hover:border-sky-300/60 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
    gold:
      "bg-amber-400/12 text-amber-200 border border-amber-400/30 hover:bg-amber-400/22 hover:border-amber-300/50 hover:text-white",
    emerald:
      "bg-emerald-400/12 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-400/22 hover:border-emerald-300/50 hover:text-white",
  }[variant];

  const glowClass = "";
  const disabledClass = disabled || loading ? "opacity-40 cursor-not-allowed pointer-events-none" : "active:scale-[0.98]";

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`nh-focus inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 select-none backdrop-blur-md ${sizeClasses} ${variantClasses} ${glowClass} ${disabledClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
};
