import React, { ReactNode } from "react";
import { ScrollRevealCard, ScrollRevealCardProps } from "./ScrollRevealCard";
import { useSpring, SPRING_PRESETS } from "./useSpringPhysics";

/**
 * AnimatedSection — Reusable scroll-reveal section with header animation.
 * Wraps content in ScrollRevealCard with staggered header + children entrance.
 */

export interface AnimatedSectionProps {
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  accentColor?: string;
  children: ReactNode;
  staggerDelay?: number;
  headerSpring?: keyof typeof SPRING_PRESETS;
  direction?: ScrollRevealCardProps["direction"];
  className?: string;
  headerClassName?: string;
  showDivider?: boolean;
  headerAction?: ReactNode;
}
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  title, subtitle, badge, accentColor = "#f59e0b", children,
  staggerDelay = 120, headerSpring = "gentle", direction = "up",
  className = "", headerClassName = "", showDivider = true, headerAction,
}) => {
  const headerProgress = useSpring(1, SPRING_PRESETS[headerSpring]);
  const badgeSpring = useSpring(1, SPRING_PRESETS.bouncy);

  const headerStyle: React.CSSProperties = {
    opacity: headerProgress,
    transform: "translateY(" + (20 * (1 - headerProgress)) + "px)",
  };

  const badgeStyle: React.CSSProperties = {
    opacity: badgeSpring,
    transform: "scale(" + (0.8 + 0.2 * badgeSpring) + ")",
  };

  const dividerStyle: React.CSSProperties = {
    transform: "scaleX(" + headerProgress + ")",
    transformOrigin: "left",
    backgroundColor: accentColor,
  };

  return (
    <ScrollRevealCard direction={direction} className={className}>
      <div className={"mb-6 " + headerClassName}>
        {badge && <div style={badgeStyle} className="mb-3">{badge}</div>}
        {title && (
          <div style={headerStyle} className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-900 tracking-tight">{title}</h3>
              {subtitle && <p className="text-sm text-amber-700/70 mt-1 font-medium">{subtitle}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        {showDivider && title && (
          <div style={dividerStyle} className="h-0.5 w-full mt-3 rounded-full opacity-60" />
        )}
      </div>
      <ScrollRevealCard direction={direction} delay={staggerDelay} spring="gentle">
        {children}
      </ScrollRevealCard>
    </ScrollRevealCard>
  );
};
// ======================================================================
// AnimatedStatCard — Stat card with animated counter + progress bar
// ======================================================================

export interface AnimatedStatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
  color?: string;
  delay?: number;
  className?: string;
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  label, value, suffix = "", icon, color = "#f59e0b", delay = 0, className = "",
}) => {
  const progress = useSpring(1, SPRING_PRESETS.gentle);
  return (
    <ScrollRevealCard delay={delay} direction="up" className={className}>
      <div className="rounded-xl p-4 border border-amber-200/40 bg-gradient-to-br from-amber-50/80 to-orange-50/40 backdrop-blur-sm" style={{ borderLeft: "3px solid " + color, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2 mb-2">
          {icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: color + "15", color }}>{icon}</div>}
          <span className="text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-black text-amber-900 tabular-nums">{Math.round(value * progress)}{suffix}</div>
        <div className="mt-2 h-1 rounded-full bg-amber-200/40 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: (value * progress) + "%", backgroundColor: color }} />
        </div>
      </div>
    </ScrollRevealCard>
  );
};

// ======================================================================
// AnimatedListItem — List item with icon + slide-in entrance
// ======================================================================

export interface AnimatedListItemProps {
  children: ReactNode;
  icon?: ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children, icon, delay = 0, className = "",
}) => {
  return (
    <ScrollRevealCard delay={delay} direction="left" spring="gentle">
      <div className={"flex items-start gap-3 py-2 " + className}>
        {icon && <div className="w-6 h-6 rounded-md bg-amber-100/60 flex items-center justify-center text-amber-600 text-xs mt-0.5 shrink-0">{icon}</div>}
        <div className="text-sm text-amber-800 font-medium leading-relaxed">{children}</div>
      </div>
    </ScrollRevealCard>
  );
};