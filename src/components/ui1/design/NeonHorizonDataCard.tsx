import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { NeonHorizonGlassPanel } from "./NeonHorizonGlassPanel";
import { AnimatedCounter } from "../../ui/AnimatedCounter";

export interface NeonHorizonDataCardProps {
  label: string;
  value: number | string;
  unit?: string;
  delta?: {
    value: number | string;
    positive?: boolean;
    text?: string;
  };
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "floating" | "inset";
  glow?: "none" | "cyan" | "magenta" | "gold" | "emerald";
  accentColor?: "cyan" | "magenta" | "gold" | "emerald" | "coral";
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
}

export const NeonHorizonDataCard: React.FC<NeonHorizonDataCardProps> = ({
  label,
  value,
  unit,
  delta,
  icon,
  variant = "secondary",
  glow = "none",
  accentColor = "cyan",
  sparkline,
  onClick,
  className = "",
}) => {
  const accentClasses = {
    cyan: "text-sky-300 border-sky-400/25",
    magenta: "text-sky-300 border-sky-400/30",
    gold: "text-amber-300 border-amber-400/30",
    emerald: "text-emerald-300 border-emerald-400/30",
    coral: "text-rose-300 border-rose-400/30",
  }[accentColor];

  const isNumeric = typeof value === "number";

  return (
    <NeonHorizonGlassPanel
      variant={variant}
      glow={glow}
      corners="rounded"
      hoverable={!!onClick}
      onClick={onClick}
      className={`p-3.5 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="nh-label-caps text-slate-400 text-[10px] tracking-wider truncate">
          {label}
        </span>
        {icon && (
          <div className={`p-1 rounded-lg bg-black/30 border ${accentClasses} text-xs shrink-0`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className={`text-xl font-extrabold nh-font-headline tracking-tight ${accentClasses.split(" ")[0]} truncate`}>
            {isNumeric ? <AnimatedCounter value={value as number} /> : value}
          </span>
          {unit && (
            <span className="text-xs text-slate-400 nh-font-mono font-medium">
              {unit}
            </span>
          )}
        </div>

        {delta && (
          <div
            className={`flex items-center gap-0.5 text-[10px] nh-font-mono font-bold px-1.5 py-0.5 rounded-md ${
 delta.positive
 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
 : "bg-rose-500/15 text-rose-300 border border-rose-400/30"
 }`}
          >
            {delta.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{delta.text ?? delta.value}</span>
          </div>
        )}
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className="mt-2 h-4 w-full flex items-end gap-0.5">
          {sparkline.map((val, idx) => {
            const min = Math.min(...sparkline);
            const max = Math.max(...sparkline);
            const height = max === min ? 50 : Math.max(15, ((val - min) / (max - min)) * 100);
            return (
              <div
                key={idx}
                className="flex-1 bg-sky-300/30 rounded-t-sm transition-all duration-300 hover:bg-sky-300/60"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </NeonHorizonGlassPanel>
  );
};
