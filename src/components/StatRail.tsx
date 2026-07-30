import { useState, useEffect, useRef } from "react";
import { Gauge, Zap, Weight, Timer, TrendingUp, DollarSign, Battery, HelpCircle, Info } from "lucide-react";
import { useDesign } from "../state/DesignContext";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  prevValue: string | number;
  unit: string;
  tooltipTitle: string;
  tooltipDesc: string;
  subMetric?: string;
}

export function StatRail() {
  const { sim } = useDesign();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Store previous sim snapshot for comparison column
  const prevSimRef = useRef(sim);
  const [prevSim, setPrevSim] = useState(sim);

  // Update prev snapshot on a debounced timer (captures "previous" state)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPrevSim(prevSimRef.current);
      prevSimRef.current = sim;
    }, 2000);
    return () => clearTimeout(timeout);
  }, [sim]);

  const pwrToWeight = (sim.peakPower / (sim.weight / 1000)).toFixed(1);

  const stats: StatItem[] = [
    {
      icon: <Zap size={14} />,
      label: "Power",
      value: sim.peakPower,
      prevValue: prevSim.peakPower,
      unit: "hp",
      tooltipTitle: "Peak Horsepower Output",
      tooltipDesc: "Calculated from engine displacement, RPM limit, turbo boost pressure, and valvetrain tuning.",
      subMetric: `${pwrToWeight} hp/tonne`
    },
    {
      icon: <Gauge size={14} />,
      label: "Torque",
      value: sim.peakTorque,
      prevValue: prevSim.peakTorque,
      unit: "Nm",
      tooltipTitle: "Peak Torque Force",
      tooltipDesc: "Low-end pulling force. Influenced by cylinder bore/stroke ratio, boost pressure, and hybrid motor assist.",
      subMetric: `@ ${sim.peakTorqueRpm || 3500} RPM`
    },
    {
      icon: <Weight size={14} />,
      label: "Weight",
      value: sim.weight,
      prevValue: prevSim.weight,
      unit: "kg",
      tooltipTitle: "Curb Weight",
      tooltipDesc: "Total vehicle mass including chassis materials, engine block metal, interior trim, and battery packs.",
      subMetric: `Bias: ${sim.weightDistFront || 55}% F / ${100 - (sim.weightDistFront || 55)}% R`
    },
    {
      icon: <Timer size={14} />,
      label: "0-60",
      value: sim.accel0_60,
      prevValue: prevSim.accel0_60,
      unit: "s",
      tooltipTitle: "0 to 60 mph Acceleration",
      tooltipDesc: "Derived from power-to-weight ratio, tire compound grip coefficient, gearbox launch control, and AWD traction.",
      subMetric: `Traction limit: ${(sim.accel0_60 < 3.0 ? "AWD Launch" : "Grip Limited")}`
    },
    {
      icon: <TrendingUp size={14} />,
      label: "Top Speed",
      value: sim.topSpeed,
      prevValue: prevSim.topSpeed,
      unit: "km/h",
      tooltipTitle: "Terminal Aerodynamic Speed",
      tooltipDesc: "Maximum velocity where aerodynamic drag force equals peak engine wheel horsepower.",
      subMetric: `Drag Cd: ${sim.dragCoeff || 0.31}`
    },
    {
      icon: <DollarSign size={14} />,
      label: "Cost",
      value: `$${(sim.totalCost / 1000).toFixed(0)}k`,
      prevValue: `$${(prevSim.totalCost / 1000).toFixed(0)}k`,
      unit: "",
      tooltipTitle: "Estimated MSRP",
      tooltipDesc: "Total production BOM cost plus manufacturing tooling amortization and engineering markup.",
      subMetric: `Tier: ${sim.totalCost > 150000 ? "Supercar / Luxury" : sim.totalCost > 40000 ? "Premium" : "Economy"}`
    },
  ];

  if (sim.isHybrid || sim.isElectric) {
    stats.splice(5, 0, {
      icon: <Battery size={14} />,
      label: "Battery",
      value: sim.batteryEnergy,
      prevValue: prevSim.batteryEnergy,
      unit: "kWh",
      tooltipTitle: "EV Battery Capacity",
      tooltipDesc: "Usable lithium-ion / solid-state energy storage feeding electric drive motors.",
      subMetric: `Voltage: 800V Architecture`
    });
  }

  return (
    <div className="flex flex-col gap-2 stagger-enter relative">
      <div className="label-mono px-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ok-400 animate-pulse" />
          Live Stats
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Hover for specs</span>
      </div>

      {stats.map((s) => (
        <div
          key={s.label}
          className="relative flex gap-1.5 animate-slide-up group"
          onMouseEnter={() => setHoveredLabel(s.label)}
          onMouseLeave={() => setHoveredLabel(null)}
        >
          {/* Current value */}
          <div className="flex-1 flex items-center gap-2 bg-base-900 border border-base-800 rounded-lg px-3 py-2 transition-all duration-300 hover:border-accent-500/50 hover:bg-base-850 glass-shimmer hover-lift inner-light stat-value-glow cursor-help">
            <span className="text-accent-400 transition-transform duration-300 group-hover:scale-110 icon-bounce">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>{s.label}</span>
                <HelpCircle size={10} className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
              </div>
              <div className="font-mono text-sm text-slate-200 transition-colors value-transition">
                {s.value}<span className="text-xs text-slate-500 ml-0.5">{s.unit}</span>
              </div>
            </div>
          </div>

          {/* Comparison value */}
          <div className="flex-1 flex items-center gap-2 bg-base-900/60 border border-base-800/50 rounded-lg px-2.5 py-2 transition-all duration-300 hover:border-purple-500/20 glass-shimmer">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-purple-400/50 uppercase tracking-wider">{s.label}</div>
              <div className="font-mono text-sm text-purple-300/70 transition-colors value-transition">
                {s.prevValue}<span className="text-xs text-purple-400/40 ml-0.5">{s.unit}</span>
              </div>
            </div>
          </div>

          {/* Popover Tooltip Card */}
          {hoveredLabel === s.label && (
            <div className="glass-panel absolute right-full mr-2 top-0 z-50 w-64 p-3 bg-base-950/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-xl animate-scale-reveal text-left pointer-events-none">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
                <Info size={13} className="text-cyan-400" />
                {s.tooltipTitle}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{s.tooltipDesc}</p>
              {s.subMetric && (
                <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>SPEC METRIC:</span>
                  <span className="text-cyan-400 font-semibold">{s.subMetric}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

