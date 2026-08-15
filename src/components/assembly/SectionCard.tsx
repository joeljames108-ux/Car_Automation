// ===================================================================
// APEX ENGINE BUILDER — SECTION CARD COMPONENT (PHASE 19)
// Reusable Glassmorphic Studio Container for 3-Card Stage Layouts
// ===================================================================

import React from "react";

export type CardAccent = "cyan" | "purple" | "emerald" | "amber" | "blue";

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
  }
> = {
  cyan: {
    border: "border-cyan-500/30 hover:border-cyan-500/50",
    glow: "from-cyan-500/10",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    iconText: "text-cyan-300",
    titleColor: "text-slate-100",
  },
  purple: {
    border: "border-purple-500/30 hover:border-purple-500/50",
    glow: "from-purple-500/10",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconText: "text-purple-300",
    titleColor: "text-slate-100",
  },
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    glow: "from-emerald-500/10",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconText: "text-emerald-300",
    titleColor: "text-slate-100",
  },
  amber: {
    border: "border-amber-500/30 hover:border-amber-500/50",
    glow: "from-amber-500/10",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconText: "text-amber-300",
    titleColor: "text-slate-100",
  },
  blue: {
    border: "border-blue-500/30 hover:border-blue-500/50",
    glow: "from-blue-500/10",
    iconBg: "bg-blue-500/15 border-blue-500/30",
    iconText: "text-blue-300",
    titleColor: "text-slate-100",
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
      className={`relative rounded-2xl bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-base-950/40 border ${styles.border} backdrop-blur-xl p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${styles.glow} via-transparent to-transparent rounded-full blur-2xl pointer-events-none`}
      />

      {/* ── CARD HEADER ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div
                className={`p-1.5 rounded-xl border ${styles.iconBg} ${styles.iconText} shadow-sm shrink-0`}
              >
                {icon}
              </div>
            )}
            <div>
              <h4 className={`text-xs md:text-sm font-extrabold font-mono ${styles.titleColor}`}>
                {title}
              </h4>
              {subtitle && (
                <p className="text-[10px] md:text-[11px] text-slate-400 font-mono mt-0.5">
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
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">{footer}</div>
      )}
    </div>
  );
}
