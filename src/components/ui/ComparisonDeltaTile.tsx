import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export interface ComparisonDeltaTileProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  higherIsBetter?: boolean;
  accentColor?: string;
  className?: string;
}

export const ComparisonDeltaTile: React.FC<ComparisonDeltaTileProps> = ({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  higherIsBetter = true,
  accentColor = "text-amber-400",
  className = "",
}) => {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;
  const isNeutral = delta === 0;

  const isGood = (isPositive && higherIsBetter) || (isNegative && !higherIsBetter);
  const isBad = (isNegative && higherIsBetter) || (isPositive && !higherIsBetter);

  return (
    <div className={`p-3 rounded-2xl bg-slate-900/60 border border-white/10 ${className}`}>
      <span className="text-slate-400 text-[10px] uppercase block mb-0.5">{label}</span>
      <div className="flex items-baseline justify-between gap-1">
        <span className={`text-base font-bold font-mono ${accentColor}`}>
          {value} {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
        </span>
        {delta !== undefined && (
          <span
            className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
              isGood ? "text-emerald-400" : isBad ? "text-rose-400" : "text-slate-400"
            }`}
          >
            {isPositive && <ArrowUp size={10} />}
            {isNegative && <ArrowDown size={10} />}
            {isNeutral && <Minus size={10} />}
            <span>
              {deltaLabel ?? (isPositive ? `+${delta}` : `${delta}`)} {unit}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
