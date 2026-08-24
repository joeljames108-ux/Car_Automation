import React, { ReactNode } from "react";

export interface NeonHorizonBadgeProps {
  children: ReactNode;
  variant?: "cyan" | "magenta" | "gold" | "emerald" | "coral" | "neutral" | "live";
  size?: "xs" | "sm" | "md";
  icon?: ReactNode;
  pulse?: boolean;
  className?: string;
}

export const NeonHorizonBadge: React.FC<NeonHorizonBadgeProps> = ({
  children,
  variant = "cyan",
  size = "sm",
  icon,
  pulse = false,
  className = "",
}) => {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1 rounded",
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5 rounded-md",
    md: "px-3 py-1 text-xs gap-2 rounded-lg",
  }[size];

  const variantClasses = {
    cyan: "bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.2)]",
    magenta: "bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-200 shadow-[0_0_10px_rgba(224,64,251,0.2)]",
    gold: "bg-amber-500/15 border-amber-400/40 text-amber-200 shadow-[0_0_10px_rgba(255,215,64,0.2)]",
    emerald: "bg-emerald-500/15 border-emerald-400/40 text-emerald-200 shadow-[0_0_10px_rgba(0,230,118,0.2)]",
    coral: "bg-rose-500/15 border-rose-400/40 text-rose-200 shadow-[0_0_10px_rgba(255,82,82,0.2)]",
    neutral: "bg-slate-800/60 border-white/10 text-slate-300",
    live: "bg-cyan-500/20 border-cyan-400/50 text-cyan-100 shadow-[0_0_12px_rgba(0,229,255,0.35)]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center nh-font-mono font-bold border tracking-wider uppercase select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {variant === "live" || pulse ? (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-nh-pulse-dot mr-0.5" />
      ) : null}
      {icon}
      {children}
    </span>
  );
};
