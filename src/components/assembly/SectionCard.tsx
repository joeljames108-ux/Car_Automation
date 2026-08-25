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
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    glow: "from-cyan-500/15",
    iconBg: "bg-cyan-500/20 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
    iconText: "text-cyan-300",
    titleColor: "text-cyan-100",
    topGlow: "bg-cyan-500",
  },
  purple: {
    border: "border-purple-500/30 hover:border-purple-500/60",
    glow: "from-purple-500/15",
    iconBg: "bg-purple-500/20 border-purple-400/40 shadow-[0_0_12px_rgba(192,132,252,0.3)]",
    iconText: "text-purple-300",
    titleColor: "text-purple-100",
    topGlow: "bg-purple-500",
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
    border: "border-blue-500/30 hover:border-blue-500/60",
    glow: "from-blue-500/15",
    iconBg: "bg-blue-500/20 border-blue-400/40 shadow-[0_0_12px_rgba(96,165,250,0.3)]",
    iconText: "text-blue-300",
    titleColor: "text-blue-100",
    topGlow: "bg-blue-500",
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
      className={`relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 border ${styles.border} backdrop-blur-2xl p-4 md:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 flex flex-col justify-between overflow-hidden group ${className}`}
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
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
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
                <p className="text-[10px] md:text-[11px] text-slate-400 font-mono mt-0.5 truncate">
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
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono relative z-10">{footer}</div>
      )}
    </div>
  );
}
