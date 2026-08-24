import React from "react";
import { StatTile } from "./Controls";
import type { SimResult } from "../../sim/types";

export type KPIMetricKey =
  | "power"
  | "torque"
  | "weight"
  | "topSpeed"
  | "accel0_60"
  | "accel0_100"
  | "accel0_200"
  | "quarterMile"
  | "brakingDist"
  | "lateralG"
  | "powerToWeight"
  | "cost"
  | "nvhNoise"
  | "groundSuction"
  | "procurementRate"
  | "dragCoeff"
  | "downforce"
  | "fuelEconomy"
  | "reliability"
  | "safetyRating"
  | "drivability";

export interface PerformanceKPIGridProps {
  sim: SimResult;
  metrics?: KPIMetricKey[];
  columns?: string;
  className?: string;
}

const DEFAULT_METRICS: KPIMetricKey[] = [
  "power",
  "torque",
  "weight",
  "topSpeed",
  "accel0_60",
  "accel0_100",
  "accel0_200",
  "quarterMile",
  "brakingDist",
  "lateralG",
  "powerToWeight",
  "cost",
  "nvhNoise",
  "groundSuction",
  "procurementRate",
];

export const PerformanceKPIGrid: React.FC<PerformanceKPIGridProps> = ({
  sim,
  metrics = DEFAULT_METRICS,
  columns = "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
  className = "",
}) => {
  const p2w = sim.weight > 0 ? (sim.peakPower / (sim.weight / 1000)).toFixed(0) : "0";
  const accel0_200 = (sim.accel0_100 + sim.accel100_200).toFixed(2);

  const renderTile = (key: KPIMetricKey) => {
    switch (key) {
      case "power":
        return <StatTile key={key} label="Power" value={sim.peakPower} unit="hp" accent="accent" sub={sim.peakPowerRpm ? `@ ${sim.peakPowerRpm} rpm` : undefined} />;
      case "torque":
        return <StatTile key={key} label="Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={sim.peakTorqueRpm ? `@ ${sim.peakTorqueRpm} rpm` : undefined} />;
      case "weight":
        return <StatTile key={key} label="Weight" value={sim.weight} unit="kg" />;
      case "topSpeed":
        return <StatTile key={key} label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />;
      case "accel0_60":
        return <StatTile key={key} label="0-60 mph" value={sim.accel0_60} unit="s" accent={sim.accel0_60 < 3 ? "ok" : "default"} />;
      case "accel0_100":
        return <StatTile key={key} label="0-100 km/h" value={sim.accel0_100} unit="s" />;
      case "accel0_200":
        return <StatTile key={key} label="0-200 km/h" value={accel0_200} unit="s" />;
      case "quarterMile":
        return <StatTile key={key} label="Quarter Mile" value={sim.quarterMile} unit="s" sub={`${sim.quarterMileSpeed} km/h`} />;
      case "brakingDist":
        return <StatTile key={key} label="Braking 100-0" value={sim.brakingDist} unit="m" />;
      case "lateralG":
        return <StatTile key={key} label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />;
      case "powerToWeight":
        return <StatTile key={key} label="Power/Weight" value={p2w} unit="hp/t" accent="accent" />;
      case "cost":
        return <StatTile key={key} label="Cost" value={`$${((sim.totalCost || sim.vehicleCost || 0) / 1000).toFixed(0)}k`} accent="accent" />;
      case "nvhNoise":
        return sim.nvhSoundOutput ? (
          <StatTile
            key={key}
            label="Cabin NVH Noise"
            value={sim.nvhSoundOutput.finalCabinDba}
            unit="dBA"
            sub={sim.nvhSoundOutput.psychoacoustics?.zwickerLoudnessSones ? `${sim.nvhSoundOutput.psychoacoustics.zwickerLoudnessSones} Sones` : undefined}
            accent="ok"
          />
        ) : null;
      case "groundSuction":
        return sim.lbmWindTunnel ? (
          <StatTile
            key={key}
            label="Ground Suction"
            value={`+${sim.lbmWindTunnel.groundEffectSuctionGainPct}%`}
            sub={sim.lbmWindTunnel.reynoldsNumber ? `Re ${sim.lbmWindTunnel.reynoldsNumber.toLocaleString()}` : undefined}
            accent="accent"
          />
        ) : null;
      case "procurementRate":
        return sim.supplyChainProcurement ? (
          <StatTile
            key={key}
            label="Procurement Rate"
            value={`$${sim.supplyChainProcurement.effectiveUnitPriceUSD}`}
            unit="/kg"
            sub={`Tariff $${sim.supplyChainProcurement.tariffCostUSD}`}
            accent="warn"
          />
        ) : null;
      case "dragCoeff":
        return <StatTile key={key} label="Drag (Cd)" value={sim.dragCoeff.toFixed(3)} accent="accent" />;
      case "downforce":
        return <StatTile key={key} label="Downforce" value={sim.downforce.toFixed(0)} unit="kg" accent="accent" />;
      case "fuelEconomy":
        return <StatTile key={key} label="Fuel Economy" value={sim.fuelEconomy.toFixed(1)} unit="L/100k" />;
      case "reliability":
        return <StatTile key={key} label="Reliability" value={(sim.reliability * 100).toFixed(0)} unit="%" accent="ok" />;
      case "safetyRating":
        return <StatTile key={key} label="Safety Rating" value={(sim.safetyRating * 100).toFixed(0)} unit="/100" accent="ok" />;
      case "drivability":
        return <StatTile key={key} label="Drivability" value={(sim.drivability * 100).toFixed(0)} unit="/100" accent="accent" />;
      default:
        return null;
    }
  };

  return (
    <div className={`grid gap-2 ${columns} ${className}`}>
      {metrics.map((m) => renderTile(m))}
    </div>
  );
};
