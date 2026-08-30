import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { Gauge, Zap, Weight, Timer, TrendingUp, DollarSign, Battery, HelpCircle, Info, Activity, Disc, Wind, Flag, Fuel, ShieldCheck, Maximize2, ArrowLeft, X } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { AnimatedCounter } from "./ui/AnimatedCounter";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  initialValue: string | number;
  value: string | number;
  unit: string;
  deltaText: string;
  deltaColor: string;
  tooltipTitle: string;
  tooltipDesc: string;
  subMetric?: string;
}

export function StatRailComponent() {
  const { sim } = useDesign();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<StatItem | null>(null);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  const openStatModal = (stat: StatItem) => {
    setSelectedStat(stat);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalActive(true);
      });
    });
  };

  const closeStatModal = () => {
    setModalActive(false);
    setTimeout(() => {
      setModalRendered(false);
      setSelectedStat(null);
    }, 400);
  };

  useEffect(() => {
    if (selectedStat) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedStat]);

  // Store initial baseline sim snapshot on first load for permanent initial vs present comparison
  const initialSimRef = useRef(sim);
  const initialSim = initialSimRef.current;

  const stats = useMemo<StatItem[]>(() => {
    const pwrToWeight = (sim.peakPower / (sim.weight / 1000)).toFixed(1);

    // Compute numeric deltas
    const pwrDiff = sim.peakPower - initialSim.peakPower;
    const trqDiff = sim.peakTorque - initialSim.peakTorque;
    const wgtDiff = sim.weight - initialSim.weight;
    const accDiff = Number((sim.accel0_60 - initialSim.accel0_60).toFixed(2));
    const qtrDiff = Number(((sim.quarterMile || 11.5) - (initialSim.quarterMile || 11.5)).toFixed(2));
    const latDiff = Number(((sim.lateralG || 1.1) - (initialSim.lateralG || 1.1)).toFixed(2));
    const brkDiff = Number(((sim.brakingDist || 32) - (initialSim.brakingDist || 32)).toFixed(1));
    const dwnDiff = (sim.downforce || 0) - (initialSim.downforce || 0);
    const spdDiff = sim.topSpeed - initialSim.topSpeed;
    const fueDiff = Number(((sim.fuelEconomy || 8.5) - (initialSim.fuelEconomy || 8.5)).toFixed(1));
    const cstDiff = Math.round((sim.totalCost - initialSim.totalCost) / 1000);

    const items: StatItem[] = [
    {
      icon: <Zap size={14} />,
      label: "Power",
      initialValue: initialSim.peakPower,
      value: sim.peakPower,
      unit: "hp",
      deltaText: pwrDiff > 0 ? `+${pwrDiff} hp` : pwrDiff < 0 ? `${pwrDiff} hp` : "Base",
      deltaColor: pwrDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : pwrDiff < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Peak Horsepower Output",
      tooltipDesc: "Calculated from engine displacement, RPM limit, turbo boost pressure, and valvetrain tuning.",
      subMetric: `${pwrToWeight} hp/tonne`
    },
    {
      icon: <Gauge size={14} />,
      label: "Torque",
      initialValue: initialSim.peakTorque,
      value: sim.peakTorque,
      unit: "Nm",
      deltaText: trqDiff > 0 ? `+${trqDiff} Nm` : trqDiff < 0 ? `${trqDiff} Nm` : "Base",
      deltaColor: trqDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : trqDiff < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Peak Torque Force",
      tooltipDesc: "Low-end pulling force. Influenced by cylinder bore/stroke ratio, boost pressure, and hybrid motor assist.",
      subMetric: `@ ${sim.peakTorqueRpm || 3500} RPM`
    },
    {
      icon: <Weight size={14} />,
      label: "Weight",
      initialValue: initialSim.weight,
      value: sim.weight,
      unit: "kg",
      deltaText: wgtDiff > 0 ? `+${wgtDiff} kg` : wgtDiff < 0 ? `${wgtDiff} kg` : "Base",
      deltaColor: wgtDiff < 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : wgtDiff > 0 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Curb Weight",
      tooltipDesc: "Total vehicle mass including chassis materials, engine block metal, interior trim, and battery packs.",
      subMetric: `Bias: ${sim.weightDistFront || 55}% F / ${100 - (sim.weightDistFront || 55)}% R`
    },
    {
      icon: <Timer size={14} />,
      label: "0-60 MPH",
      initialValue: initialSim.accel0_60,
      value: sim.accel0_60,
      unit: "s",
      deltaText: accDiff > 0 ? `+${accDiff}s` : accDiff < 0 ? `${accDiff}s` : "Base",
      deltaColor: accDiff < 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : accDiff > 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "0 to 60 mph Acceleration",
      tooltipDesc: "Derived from power-to-weight ratio, tire compound grip coefficient, gearbox launch control, and AWD traction.",
      subMetric: `Limit: ${(sim.accel0_60 < 3.0 ? "AWD Launch" : "Grip Limited")}`
    },
    {
      icon: <Flag size={14} />,
      label: "1/4 Mile",
      initialValue: (initialSim.quarterMile || 11.5).toFixed(2),
      value: (sim.quarterMile || 11.5).toFixed(2),
      unit: "s",
      deltaText: qtrDiff > 0 ? `+${qtrDiff}s` : qtrDiff < 0 ? `${qtrDiff}s` : "Base",
      deltaColor: qtrDiff < 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : qtrDiff > 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Quarter Mile Drag Strip",
      tooltipDesc: "Elapsed time for standing 1/4 mile sprint including launch slip and gear shift delays.",
      subMetric: `@ ${sim.quarterMileSpeed?.toFixed(0) || 205} km/h trap`
    },
    {
      icon: <Activity size={14} />,
      label: "Lateral Grip",
      initialValue: (initialSim.lateralG || 1.1).toFixed(2),
      value: (sim.lateralG || 1.1).toFixed(2),
      unit: "G",
      deltaText: latDiff > 0 ? `+${latDiff} G` : latDiff < 0 ? `${latDiff} G` : "Base",
      deltaColor: latDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : latDiff < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Peak Lateral Cornering Acceleration",
      tooltipDesc: "Maximum sustained cornering G-force on 300ft skidpad before mechanical understeer or slide.",
      subMetric: `Skidpad: ${(sim.skidpad || sim.lateralG * 0.95).toFixed(2)} G`
    },
    {
      icon: <Disc size={14} />,
      label: "Braking 60-0",
      initialValue: (initialSim.brakingDist || 32).toFixed(1),
      value: (sim.brakingDist || 32).toFixed(1),
      unit: "m",
      deltaText: brkDiff > 0 ? `+${brkDiff}m` : brkDiff < 0 ? `${brkDiff}m` : "Base",
      deltaColor: brkDiff < 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : brkDiff > 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Emergency Braking Distance",
      tooltipDesc: "Distance required to decelerate from 60mph to 0. Calculated from brake rotor size, caliper pistons, and tire compound.",
      subMetric: `Cooling: ${((sim.brakeCooling || 0.85) * 100).toFixed(0)}%`
    },
    {
      icon: <Wind size={14} />,
      label: "Downforce",
      initialValue: initialSim.downforce || 0,
      value: sim.downforce || 0,
      unit: "N",
      deltaText: dwnDiff > 0 ? `+${dwnDiff} N` : dwnDiff < 0 ? `${dwnDiff} N` : "Base",
      deltaColor: dwnDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : dwnDiff < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Total Aerodynamic Load",
      tooltipDesc: "Total downward aerodynamic force pressing vehicle into asphalt at 200 km/h.",
      subMetric: `Balance: ${((sim.aeroBalance || 0.5) * 100).toFixed(1)}% Front`
    },
    {
      icon: <TrendingUp size={14} />,
      label: "Top Speed",
      initialValue: initialSim.topSpeed,
      value: sim.topSpeed,
      unit: "km/h",
      deltaText: spdDiff > 0 ? `+${spdDiff} km/h` : spdDiff < 0 ? `${spdDiff} km/h` : "Base",
      deltaColor: spdDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : spdDiff < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Terminal Aerodynamic Speed",
      tooltipDesc: "Maximum velocity where aerodynamic drag force equals peak engine wheel horsepower.",
      subMetric: `Drag Cd: ${sim.dragCoeff || 0.31}`
    },
    {
      icon: <Fuel size={14} />,
      label: "Economy",
      initialValue: (initialSim.fuelEconomy || 8.5).toFixed(1),
      value: (sim.fuelEconomy || 8.5).toFixed(1),
      unit: "L/100k",
      deltaText: fueDiff < 0 ? `${fueDiff} L` : fueDiff > 0 ? `+${fueDiff} L` : "Base",
      deltaColor: fueDiff < 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : fueDiff > 0 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
      tooltipTitle: "Combined Fuel Consumption",
      tooltipDesc: "Estimated EPA / WLTP combined cycle fuel consumption per 100km.",
      subMetric: `Thermal Eff: ${((sim.thermalEfficiency || 0.38) * 100).toFixed(0)}%`
    },
    {
      icon: <DollarSign size={14} />,
      label: "Est. MSRP",
      initialValue: `$${(initialSim.totalCost / 1000).toFixed(0)}k`,
      value: `$${(sim.totalCost / 1000).toFixed(0)}k`,
      unit: "",
      deltaText: cstDiff > 0 ? `+$${cstDiff}k` : cstDiff < 0 ? `-$${Math.abs(cstDiff)}k` : "Base",
      deltaColor: cstDiff <= 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-sky-500/15 text-sky-400 border-sky-500/30",
      tooltipTitle: "Estimated MSRP",
      tooltipDesc: "Total production BOM cost plus manufacturing tooling amortization and engineering markup.",
      subMetric: `Tier: ${sim.totalCost > 150000 ? "Supercar" : sim.totalCost > 40000 ? "Premium" : "Economy"}`
    },
  ];

    if (sim.isHybrid || sim.isElectric) {
      const batDiff = (sim.batteryEnergy || 0) - (initialSim.batteryEnergy || 0);
      items.splice(6, 0, {
        icon: <Battery size={14} />,
        label: "Battery",
        initialValue: initialSim.batteryEnergy || 0,
        value: sim.batteryEnergy || 0,
        unit: "kWh",
        deltaText: batDiff > 0 ? `+${batDiff} kWh` : batDiff < 0 ? `${batDiff} kWh` : "Base",
        deltaColor: batDiff > 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-slate-500/10 text-amber-200/60 border-amber-500/30/20",
        tooltipTitle: "EV Battery Capacity",
        tooltipDesc: "Usable lithium-ion / solid-state energy storage feeding electric drive motors.",
        subMetric: `Range: ${sim.electricRange || 450} km`
      });
    }

    return items;
  }, [sim, initialSim]);

  return (
    <div className="flex flex-col gap-2.5 stagger-enter relative select-none w-full">
      {/* Panel Header */}
      <div className="label-mono px-1 flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-50 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-ok-400 animate-pulse" />
          LIVE STATS
        </div>
        <span className="text-[10px] text-amber-300/50 font-mono font-semibold">HOVER FOR SPECS</span>
      </div>

      {/* Metric Cards - 2-Row Precision Integrated Layout */}
      {stats.map((s) => {
        return (
          <div
            key={s.label}
            onClick={() => openStatModal(s)}
            className="relative flex flex-col gap-1.5 bg-base-900/80 border border-base-800 rounded-xl p-3 transition-all duration-200 hover:border-amber-500/50 hover:bg-base-850 cursor-pointer group shadow-sm overflow-hidden"
            onMouseEnter={() => setHoveredLabel(s.label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            {/* ── TOP ROW: Icon, Metric Label & Live Delta Badge ── */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-amber-50 uppercase tracking-wider flex items-center gap-1">
                  <span>{s.label}</span>
                  <HelpCircle size={10} className="opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity shrink-0" />
                </div>
              </div>

              {/* Live Delta Badge (Sits safely inside right padding - ZERO OVERFLOW) */}
              <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.deltaColor}`}>
                {s.deltaText}
              </div>
            </div>

            {/* ── BOTTOM ROW: Initial → Present Spec Comparison Bar ── */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px] font-mono w-full">
              {/* Sub-metric label on the left (No truncation!) */}
              <span className="text-[9.5px] text-amber-300/50 font-medium truncate max-w-[130px]" title={s.subMetric}>
                {s.subMetric}
              </span>

              {/* Initial → Present Specs Inline */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-amber-300/50">
                  <span className="text-[8px] uppercase tracking-widest text-amber-300/50 mr-0.5">INIT</span>
                  {s.initialValue}
                  {s.unit ? ` ${s.unit}` : ""}
                </span>

                <span className="text-amber-400 font-sans text-xs">→</span>

                <span className="font-bold text-amber-50">
                  <span className="text-[8px] uppercase tracking-widest text-amber-400 mr-0.5">NOW</span>
                  {!isNaN(Number(s.value)) ? (
                    <AnimatedCounter
                      value={Number(s.value)}
                      decimals={String(s.value).includes(".") ? String(s.value).split(".")[1].length : 0}
                    />
                  ) : (
                    <span>{s.value}</span>
                  )}
                  {s.unit ? ` ${s.unit}` : ""}
                </span>
              </div>
            </div>

            {/* Popover Specs Card */}
            {hoveredLabel === s.label && (
              <div className="stat-rail-popover absolute right-full mr-3 top-0 z-50 w-64 p-3.5 bg-white/95 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-xl animate-scale-reveal text-left pointer-events-none">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                  <Info size={14} className="text-amber-400 shrink-0" />
                  <span>{s.tooltipTitle}</span>
                </div>
                <p className="text-[11px] text-amber-100/80 leading-relaxed">{s.tooltipDesc}</p>
                <div className="mt-2 pt-1.5 border-t border-amber-800/30 flex items-center justify-between text-[10px] font-mono text-amber-200/60">
                  <span>SPEC COMPARISON:</span>
                  <span className="text-amber-400 font-semibold">{s.initialValue} → {s.value} {s.unit}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Ultra-Smooth Spatial Glass Lightbox Modal for Telemetry Stats */}
      {modalRendered && selectedStat && createPortal(
        <div 
          className={`schematic-backdrop ${modalActive ? "active" : ""}`}
          onClick={closeStatModal}
        >
          <div 
            className="schematic-modal-container max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back & Close */}
            <div className="w-full flex items-center justify-between border-b border-amber-200/50 pb-3.5 mb-4">
              <button
                onClick={closeStatModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
                <Activity size={14} className="text-[#007aff]" />
                {selectedStat.label} Telemetry Analysis
              </div>
              <button
                onClick={closeStatModal}
                className="p-1.5 rounded-full text-amber-200/60 hover:text-amber-500 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Stat Card Display */}
            <div className="w-full bg-gradient-to-br from-white/95 via-amber-50/30 to-slate-100/50 border border-amber-200/50 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-[#007aff] mb-3 shadow-md">
                {selectedStat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-wide mb-1">{selectedStat.tooltipTitle}</h3>
              <p className="text-xs text-amber-400 max-w-md leading-relaxed mb-4">{selectedStat.tooltipDesc}</p>

              {/* Huge Live Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-mono font-black text-slate-900">{selectedStat.value}</span>
                <span className="text-base font-mono font-bold text-[#007aff]">{selectedStat.unit}</span>
              </div>

              <div className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full border ${selectedStat.deltaColor}`}>
                Delta: {selectedStat.deltaText}
              </div>
            </div>

            {/* Baseline Specs Comparison Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-amber-200/40">
              <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3.5 text-center shadow-sm backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase tracking-wider mb-1">Baseline Initial</span>
                <span className="text-base font-mono font-bold text-amber-500">{selectedStat.initialValue} {selectedStat.unit}</span>
              </div>
              <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3.5 text-center shadow-sm backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase tracking-wider mb-1">Current Spec</span>
                <span className="text-base font-mono font-bold text-[#007aff]">{selectedStat.value} {selectedStat.unit}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export const StatRail = memo(StatRailComponent);

