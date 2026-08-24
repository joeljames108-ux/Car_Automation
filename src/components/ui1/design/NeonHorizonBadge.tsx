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
    cyan: "bg-sky-400/12 border-sky-400/30 text-sky-200",
    magenta: "bg-sky-500/15 border-sky-400/40 text-sky-200",
    gold: "bg-amber-500/15 border-amber-400/40 text-amber-200",
    emerald: "bg-emerald-500/15 border-emerald-400/40 text-emerald-200",
    coral: "bg-rose-500/15 border-rose-400/40 text-rose-200",
    neutral: "bg-slate-800/60 border-white/10 text-slate-300",
    live: "bg-sky-400/12 border-sky-400/30 text-sky-100",
  }[variant];

  return (
    <span
      className={`inline-flex items-center nh-font-mono font-bold border tracking-wider uppercase select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {variant === "live" || pulse ? (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-nh-pulse-dot mr-0.5" />
      ) : null}
      {icon}
      {children}
    </span>
  );
};
