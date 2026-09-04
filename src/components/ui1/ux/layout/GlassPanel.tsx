import React from "react";
export interface GlassPanelProps {
  children: React.ReactNode; className?: string; padding?: string;
  rounded?: string; hover?: boolean; glow?: boolean; glowColor?: string;
  style?: React.CSSProperties; onClick?: () => void;
}
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children, className = "", padding = "p-5", rounded = "rounded-2xl",
  hover = false, glow = false, glowColor = "rgba(196,168,96,0.15)",
  style, onClick,
}) => {
  const hoverStyles = hover ? {
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
    cursor: onClick ? "pointer" : "default",
  } : {};
  return (
    <div className={[padding, rounded, className].join(" ")} style={{
      background: "rgba(26,16,8,0.55)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: glow ? "0 0 20px "+glowColor : "0 8px 32px rgba(0,0,0,0.3)",
      ...hoverStyles, ...style,
    }} onClick={onClick}>{children}</div>
  );
};