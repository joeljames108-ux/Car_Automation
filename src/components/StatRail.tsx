import { Gauge, Zap, Weight, Timer, TrendingUp, DollarSign, Battery } from "lucide-react";
import { useDesign } from "../state/DesignContext";

export function StatRail() {
  const { sim } = useDesign();

  const stats = [
    { icon: <Zap size={14} />, label: "Power", value: sim.peakPower, unit: "hp" },
    { icon: <Gauge size={14} />, label: "Torque", value: sim.peakTorque, unit: "Nm" },
    { icon: <Weight size={14} />, label: "Weight", value: sim.weight, unit: "kg" },
    { icon: <Timer size={14} />, label: "0-60", value: sim.accel0_60, unit: "s" },
    { icon: <TrendingUp size={14} />, label: "Top Speed", value: sim.topSpeed, unit: "km/h" },
    { icon: <DollarSign size={14} />, label: "Cost", value: `$${(sim.totalCost / 1000).toFixed(0)}k`, unit: "" },
  ];

  if (sim.isHybrid || sim.isElectric) {
    stats.splice(5, 0, { icon: <Battery size={14} />, label: "Battery", value: sim.batteryEnergy, unit: "kWh" });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="label-mono px-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-ok-400 animate-pulse" />Live Stats</div>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2 bg-base-900 border border-base-800 rounded-lg px-3 py-2 transition-all duration-300 hover:border-accent-500/30 hover:bg-base-850">
          <span className="text-accent-400 transition-transform duration-300 hover:scale-110">{s.icon}</span>
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="font-mono text-sm text-slate-200 transition-colors">
              {s.value}<span className="text-xs text-slate-500 ml-0.5">{s.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
