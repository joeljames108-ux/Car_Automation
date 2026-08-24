import React, { ReactNode } from "react";

export interface NeonHorizonGlassPanelProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "floating" | "inset" | "window";
  glow?: "none" | "cyan" | "magenta" | "gold" | "emerald" | "pulse";
  corners?: "reticle" | "rounded" | "sharp" | "pill";
  header?: {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    actions?: ReactNode;
  };
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
  withScanline?: boolean;
}

export const NeonHorizonGlassPanel: React.FC<NeonHorizonGlassPanelProps> = ({
  children,
  variant = "primary",
  glow = "none",
  corners = "rounded",
  header,
  className = "",
  style,
  onClick,
  hoverable = false,
  withScanline = false,
}) => {
  // Base glass styles by variant (Smoked Frosted Glass)
  const variantStyles = {
    primary:
      "bg-[#111c2e]/80 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.15)]",
    secondary:
      "bg-[#0e1728]/70 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]",
    tertiary:
      "bg-[#142238]/50 backdrop-blur-lg border border-white/8 shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
    floating:
      "bg-[#121e33]/90 backdrop-blur-3xl border border-sky-400/30 shadow-[0_28px_70px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18)]",
    inset:
      "bg-[#080f1e]/85 backdrop-blur-md border border-white/6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]",
    window:
      "bg-[#111c2e]/85 backdrop-blur-3xl border border-white/14 shadow-[0_30px_80px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  }[variant];

  // Corner style (Smooth rounded corners)
  const cornerStyles = {
    rounded: "rounded-2xl",
    reticle: "rounded-2xl relative",
    sharp: "rounded-lg",
    pill: "rounded-full",
  }[corners];

  // Glow style (Soft subtle ambient glows)
  const glowStyles = {
    none: "",
    cyan: "shadow-[0_0_20px_rgba(56,189,248,0.2)] border-sky-400/40",
    magenta: "shadow-[0_0_20px_rgba(192,132,252,0.2)] border-purple-400/40",
    gold: "shadow-[0_0_20px_rgba(251,191,36,0.2)] border-amber-400/40",
    emerald: "shadow-[0_0_20px_rgba(52,211,153,0.2)] border-emerald-400/40",
    pulse: "animate-pulse border-rose-400/40",
  }[glow];

  const hoverClass = hoverable
    ? "transition-all duration-300 hover:border-white/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:-translate-y-0.5 cursor-pointer"
    : "";

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative overflow-hidden text-slate-100 ${variantStyles} ${cornerStyles} ${glowStyles} ${hoverClass} ${className}`}
    >
      {/* Header bar */}
      {header && (
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {header.icon && <span className="text-sky-400 shrink-0">{header.icon}</span>}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-100 truncate">
                {header.title}
              </span>
              {header.subtitle && (
                <span className="text-[10px] text-slate-400 truncate">
                  {header.subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {header.badge}
            {header.actions}
          </div>
        </div>
      )}

      {/* Panel body */}
      {children}
    </div>
  );
};
