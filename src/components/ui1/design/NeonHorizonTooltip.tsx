import React, { useState, ReactNode } from "react";

export interface NeonHorizonTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const NeonHorizonTooltip: React.FC<NeonHorizonTooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const [visible, setVisible] = useState(false);

  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${posClasses} z-50 px-3 py-1.5 rounded-xl bg-[#0a111e]/95 backdrop-blur-xl border border-white/12 text-amber-50 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.7)] pointer-events-none whitespace-nowrap animate-nh-materialize`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
