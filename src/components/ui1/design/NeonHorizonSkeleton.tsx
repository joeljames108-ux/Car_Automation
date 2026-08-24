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
      className={`bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] bg-[length:200%_100%] border border-white/8 animate-[nh-shimmer_2s_infinite] ${variantStyles} ${className}`}
    />
  );
};
