import React from "react";
import { LineChart } from "./LineChart";

export interface PowerTorquePoint {
  rpm: number;
  power: number;
  torque: number;
}

export interface PowerTorqueCurveChartProps {
  powerCurve: PowerTorquePoint[];
  height?: number;
  showLegend?: boolean;
  powerColor?: string;
  torqueColor?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

export const PowerTorqueCurveChart: React.FC<PowerTorqueCurveChartProps> = ({
  powerCurve,
  height = 220,
  showLegend = true,
  powerColor = "#22d3ee",
  torqueColor = "#f59e0b",
  xLabel = "RPM",
  yLabel = "hp / Nm",
  className = "",
}) => {
  const series = [
    {
      data: (powerCurve || []).map((p) => ({ x: p.rpm, y: p.power })),
      color: powerColor,
      fill: true,
    },
    {
      data: (powerCurve || []).map((p) => ({ x: p.rpm, y: p.torque })),
      color: torqueColor,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <LineChart series={series} xLabel={xLabel} yLabel={yLabel} height={height} />
      {showLegend && (
        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 px-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 bg-cyan-400 rounded-sm" />
            <span className="font-mono text-slate-300">Power (hp)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 bg-amber-500 rounded-sm" />
            <span className="font-mono text-slate-300">Torque (Nm)</span>
          </span>
        </div>
      )}
    </div>
  );
};
