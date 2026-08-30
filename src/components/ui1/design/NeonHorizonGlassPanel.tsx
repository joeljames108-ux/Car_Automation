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
  // Smoked frosted glass — one coherent surface ramp, neutral depth only
  const variantStyles = {
    primary:
      "bg-amber-950/60/80 backdrop-blur-2xl border border-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
    secondary:
      "bg-amber-950/60/70 backdrop-blur-xl border border-white/8 shadow-[0_12px_32px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]",
    tertiary:
      "bg-amber-950/60/50 backdrop-blur-lg border border-white/6 shadow-[0_8px_20px_rgba(0,0,0,0.30)]",
    floating:
      "bg-amber-950/60/90 backdrop-blur-3xl border border-white/12 shadow-[0_24px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)]",
    inset:
      "bg-amber-950/60/85 backdrop-blur-md border border-white/6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]",
    window:
      "bg-amber-950/60/85 backdrop-blur-3xl border border-white/12 shadow-[0_28px_70px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.10)]",
  }[variant];

  const cornerStyles = {
    // reticle draws real instrument corner ticks via .nh-reticle-corners
    reticle: "rounded-2xl relative nh-reticle-corners",
    rounded: "rounded-2xl",
    sharp: "rounded-lg",
    pill: "rounded-full",
  }[corners];

  // Accent = quiet border tint only. No outer glow.
  const glowStyles = {
    none: "",
    cyan: "border-sky-400/25",
    magenta: "border-violet-400/20",
    gold: "border-amber-400/25",
    emerald: "border-emerald-400/25",
    pulse: "border-rose-400/30",
  }[glow];

  const hoverClass = hoverable
    ? "transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_48px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 cursor-pointer"
    : "";

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative overflow-hidden text-slate-200 ${variantStyles} ${cornerStyles} ${glowStyles} ${hoverClass} ${className}`}
    >
      {/* Header bar */}
      {header && (
        <div className="px-5 py-3.5 border-b border-white/8 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {header.icon && <span className="text-amber-300/90 shrink-0">{header.icon}</span>}
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

      {/* Optional scanline texture */}
      {withScanline && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            backgroundSize: "100% 3px",
          }}
        />
      )}

      {/* Panel body */}
      {children}
    </div>
  );
};
