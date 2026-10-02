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
    border: "border-amber-400/50 hover:border-amber-500/80",
    glow: "from-amber-400/10",
    iconBg: "bg-amber-100 border-amber-300 shadow-2xs",
    iconText: "text-amber-800",
    titleColor: "text-slate-900",
    topGlow: "bg-amber-500",
  },
  purple: {
    border: "border-indigo-300/60 hover:border-indigo-400/80",
    glow: "from-indigo-400/10",
    iconBg: "bg-indigo-100 border-indigo-300 shadow-2xs",
    iconText: "text-indigo-800",
    titleColor: "text-slate-900",
    topGlow: "bg-indigo-500",
  },
  emerald: {
    border: "border-emerald-300/60 hover:border-emerald-400/80",
    glow: "from-emerald-400/10",
    iconBg: "bg-emerald-100 border-emerald-300 shadow-2xs",
    iconText: "text-emerald-800",
    titleColor: "text-slate-900",
    topGlow: "bg-emerald-500",
  },
  amber: {
    border: "border-amber-300/60 hover:border-amber-400/80",
    glow: "from-amber-400/10",
    iconBg: "bg-amber-100 border-amber-300 shadow-2xs",
    iconText: "text-amber-800",
    titleColor: "text-slate-900",
    topGlow: "bg-amber-500",
  },
  blue: {
    border: "border-sky-300/60 hover:border-sky-400/80",
    glow: "from-sky-400/10",
    iconBg: "bg-sky-100 border-sky-300 shadow-2xs",
    iconText: "text-sky-800",
    titleColor: "text-slate-900",
    topGlow: "bg-sky-500",
  },
  rose: {
    border: "border-rose-300/60 hover:border-rose-400/80",
    glow: "from-rose-400/10",
    iconBg: "bg-rose-100 border-rose-300 shadow-2xs",
    iconText: "text-rose-800",
    titleColor: "text-slate-900",
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
      className={`relative rounded-2xl bg-gradient-to-b from-[#faf8f5]/95 via-[#f6f2ea]/95 to-[#f1ede3]/95 border ${styles.border} backdrop-blur-2xl p-4 md:p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden group ${className}`}
    >
      {/* Top Laser Accent Light Line */}
      <div
        className={`absolute top-0 left-6 right-6 h-[2px] ${styles.topGlow} opacity-60 blur-[1px] group-hover:opacity-100 group-hover:blur-[0.5px] transition-all duration-300`}
      />

      {/* Subtle Corner Radial Ambient Glow */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${styles.glow} via-transparent to-transparent rounded-full blur-2xl pointer-events-none`}
      />

      {/* ── CARD HEADER ── */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between gap-2 border-b border-[#ded5c4] pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`p-2 rounded-xl border ${styles.iconBg} ${styles.iconText} shadow-2xs shrink-0`}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h4 className={`text-xs md:text-sm font-extrabold font-mono uppercase tracking-wider truncate ${styles.titleColor}`}>
                {title}
              </h4>
              {subtitle && (
                <p className="text-[10px] md:text-[11px] text-slate-600 font-mono mt-0.5 truncate">
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
        <div className="mt-4 pt-3 border-t border-[#ded5c4] text-xs font-mono relative z-10">{footer}</div>
      )}
    </div>
  );
}
