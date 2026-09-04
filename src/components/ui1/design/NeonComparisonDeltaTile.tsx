import React from "react";
import { NeonEntrance } from "./useNeonEntrance";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

/* ═══ NEON HORIZON COMPARISON DELTA TILE ═══ */

export function NeonComparisonDeltaTile({ label, value, unit, delta, deltaLabel, higherIsBetter = true, accentColor = "#8fb9d9", className = "" }: {
  label: string; value: string | number; unit?: string; delta?: number; deltaLabel?: string;
  higherIsBetter?: boolean; accentColor?: string; className?: string;
}) {
  const isPos = delta !== undefined && delta > 0;
  const isNeg = delta !== undefined && delta < 0;
  const isGood = (isPos && higherIsBetter) || (isNeg && !higherIsBetter);
  const isBad = (isNeg && higherIsBetter) || (isPos && !higherIsBetter);
  return (
    <NeonEntrance type="scale-pop" className={"p-3 rounded-xl bg-amber-950/80 border border-white/[0.08] backdrop-blur-md relative overflow-hidden group hover:border-white/[0.15] transition-all " + className}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle at 50% 100%, " + accentColor + "15, transparent 70%)" }} />
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/50 block mb-1">{label}</span>
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-mono font-black text-lg" style={{ color: accentColor }}>
          {value} {unit && <span className="text-xs font-normal text-amber-400/50">{unit}</span>}
        </span>
        {delta !== undefined && (
          <span className={"text-[10px] font-mono font-bold flex items-center gap-0.5 " + (isGood ? "text-emerald-400" : isBad ? "text-rose-400" : "text-amber-400/50")}>
            {isPos && <ArrowUp size={10} />}{isNeg && <ArrowDown size={10} />}{delta === 0 && <Minus size={10} />}
            {deltaLabel ?? (isPos ? "+" + delta : "" + delta)} {unit}
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, " + accentColor + "40, transparent)" }} />
    </NeonEntrance>
  );
}