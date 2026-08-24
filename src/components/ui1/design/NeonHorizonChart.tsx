import React, { ReactNode } from "react";
import { NeonHorizonGlassPanel } from "./NeonHorizonGlassPanel";

export interface NeonHorizonChartProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const NeonHorizonChart: React.FC<NeonHorizonChartProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = "",
}) => {
  return (
    <NeonHorizonGlassPanel
      variant="primary"
      corners="reticle"
      header={{
        title,
        subtitle,
        badge,
        actions,
      }}
      className={`p-4 ${className}`}
    >
      <div className="w-full relative">{children}</div>
    </NeonHorizonGlassPanel>
  );
};
