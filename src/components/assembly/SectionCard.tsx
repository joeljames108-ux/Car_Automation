// ===================================================================
// APEX ENGINE BUILDER — SECTION CARD COMPONENT
// Reusable High-Contrast Glassmorphic Studio Container for Stage Layouts
// ===================================================================

import React from "react";

export type CardAccent = "cyan" | "purple" | "emerald" | "amber" | "blue" | "rose";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accent?: CardAccent;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ACCENT_STYLES: Record<
  CardAccent,
  {
    border: string;
    glow: string;
    iconBg: string;
    iconText: string;
    titleColor: string;
    topGlow: string;
  }
> = {
  cyan: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    glow: "from-amber-500/15",
    iconBg: "bg-amber-500/20 border-amber-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
    iconText: "text-amber-300",
    titleColor: "text-amber-100",
    topGlow: "bg-amber-500",
  },
  purple: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    glow: "from-amber-500/15",
    iconBg: "bg-amber-500/20 border-amber-400/40 shadow-[0_0_12px_rgba(192,132,252,0.3)]",
    iconText: "text-amber-300",
    titleColor: "text-amber-100",
    topGlow: "bg-amber-500",
  },
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    glow: "from-emerald-500/15",
    iconBg: "bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    iconText: "text-emerald-300",
    titleColor: "text-emerald-100",
    topGlow: "bg-emerald-500",
  },
  amber: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    glow: "from-amber-500/15",
    iconBg: "bg-amber-500/20 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]",
    iconText: "text-amber-300",
    titleColor: "text-amber-100",
    topGlow: "bg-amber-500",
  },
  blue: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    glow: "from-amber-500/15",
    iconBg: "bg-amber-500/20 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    iconText: "text-amber-300",
    titleColor: "text-amber-100",
    topGlow: "bg-amber-500",
  },
  rose: {
    border: "border-rose-500/30 hover:border-rose-500/60",
    glow: "from-rose-500/15",
    iconBg: "bg-rose-500/20 border-rose-400/40 shadow-[0_0_12px_rgba(251,113,133,0.3)]",
    iconText: "text-rose-300",
    titleColor: "text-rose-100",
    topGlow: "bg-rose-500",
  },
};

export function SectionCard({
  title,
  subtitle,
  icon,
  badge,
  accent = "cyan",
  className = "",
  children,
  footer,
}: SectionCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-b from-amber-900/60/90 via-slate-950/95 to-black/95 border ${styles.border} backdrop-blur-2xl p-4 md:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 flex flex-col justify-between overflow-hidden group ${className}`}
    >
      {/* Top Laser Accent Light Line */}
      <div
        className={`absolute top-0 left-6 right-6 h-[2px] ${styles.topGlow} opacity-70 blur-[1px] group-hover:opacity-100 group-hover:blur-[0.5px] transition-all duration-300`}
      />

      {/* Subtle Corner Radial Ambient Glow */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${styles.glow} via-transparent to-transparent rounded-full blur-2xl pointer-events-none`}
      />

      {/* ── CARD HEADER ── */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between gap-2 border-b border-amber-800/30 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`p-2 rounded-xl border ${styles.iconBg} ${styles.iconText} shadow-md shrink-0`}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h4 className={`text-xs md:text-sm font-extrabold font-mono uppercase tracking-wider truncate ${styles.titleColor}`}>
                {title}
              </h4>
              {subtitle && (
                <p className="text-[10px] md:text-[11px] text-amber-200/60 font-mono mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* ── CARD BODY CONTENT ── */}
        <div className="space-y-3 py-1">{children}</div>
      </div>

      {/* ── CARD FOOTER (IF ANY) ── */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-amber-800/30 text-xs font-mono relative z-10">{footer}</div>
      )}
    </div>
  );
}
