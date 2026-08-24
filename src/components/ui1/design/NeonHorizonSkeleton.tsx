import React from "react";

export interface NeonHorizonSkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}

export const NeonHorizonSkeleton: React.FC<NeonHorizonSkeletonProps> = ({
  className = "",
  variant = "rect",
  width,
  height,
}) => {
  const variantStyles = {
    text: "rounded-md h-4",
    rect: "rounded-xl",
    circle: "rounded-full",
  }[variant];

  return (
    <div
      style={{ width, height }}
      className={`bg-gradient-to-r from-cyan-950/40 via-cyan-500/15 to-cyan-950/40 bg-[length:200%_100%] border border-cyan-400/10 animate-[nh-neon-shimmer_2s_infinite] ${variantStyles} ${className}`}
    />
  );
};
