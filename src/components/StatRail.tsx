import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import {
  Gauge,
  Zap,
  Weight,
  Timer,
  TrendingUp,
  DollarSign,
  Battery,
  HelpCircle,
  Info,
  Activity,
  Disc,
  Wind,
  Flag,
  Fuel,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ChevronsDownUp,
  SlidersHorizontal,
  Sparkles,
  Rows,
  ListCollapse,
  PanelRightClose,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { AnimatedCounter } from "./ui/AnimatedCounter";
import { useGuidedEngineeringStore } from "../state/guidedEngineeringStore";
import { useLiveStatsRailStore } from "../state/liveStatsRailStore";

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

interface StatCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  labels: string[];
}

const STAT_CATEGORIES: StatCategory[] = [
  {
    id: "powertrain",
    name: "Powertrain & Output",
    icon: <Zap size={13} className="text-amber-600" />,
    labels: ["Power", "Torque", "Battery"],
  },
  {
    id: "dynamics",
    name: "Chassis & Dynamics",
    icon: <Activity size={13} className="text-cyan-600" />,
    labels: ["Weight", "0-60 MPH", "1/4 Mile", "Lateral Grip", "Braking 60-0"],
  },
  {
    id: "aero_economics",
    name: "Aero & Valuation",
    icon: <Wind size={13} className="text-teal-600" />,
    labels: ["Downforce", "Top Speed", "Economy", "Est. MSRP"],
  },
];

export function StatRailComponent() {
  const { sim } = useDesign();
  const { engineStatus, vehicleStatus, aeroStatus } = useGuidedEngineeringStore();
  const { toggleCollapseToRight, setIsCollapsedToRight } = useLiveStatsRailStore();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<StatItem | null>(null);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  // ── COLLAPSIBLE & EXPANDABLE CONTROLS ──
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem("apex:statrail-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem("apex:statrail-categories-collapsed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [viewMode, setViewMode] = useState<"compact" | "detailed">(() => {
    try {
      return (window.localStorage.getItem("apex:statrail-viewmode") as "compact" | "detailed") || "detailed";
    } catch {
      return "detailed";
    }
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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

  const isEngineReady = engineStatus === "configured";
  const isVehicleReady = vehicleStatus === "configured";
  const isAeroReady = aeroStatus === "configured";

  const stats = useMemo<StatItem[]>(() => {
    const pwrToWeight = isEngineReady && isVehicleReady && sim.weight > 0
      ? (sim.peakPower / (sim.weight / 1000)).toFixed(1)
      : "—";

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
        initialValue: isEngineReady ? initialSim.peakPower : "—",
        value: isEngineReady ? sim.peakPower : "—",
        unit: isEngineReady ? "hp" : "",
        deltaText: isEngineReady
          ? pwrDiff > 0 ? `+${pwrDiff} hp` : pwrDiff < 0 ? `${pwrDiff} hp` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady
          ? pwrDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : pwrDiff < 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Peak Horsepower Output",
        tooltipDesc: "Calculated from engine displacement, RPM limit, turbo boost pressure, and valvetrain tuning.",
        subMetric: isEngineReady && isVehicleReady ? `${pwrToWeight} hp/tonne` : isEngineReady ? "Configure Vehicle" : "Awaiting configuration"
      },
      {
        icon: <Gauge size={14} />,
        label: "Torque",
        initialValue: isEngineReady ? initialSim.peakTorque : "—",
        value: isEngineReady ? sim.peakTorque : "—",
        unit: isEngineReady ? "Nm" : "",
        deltaText: isEngineReady
          ? trqDiff > 0 ? `+${trqDiff} Nm` : trqDiff < 0 ? `${trqDiff} Nm` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady
          ? trqDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : trqDiff < 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Peak Torque Force",
        tooltipDesc: "Low-end pulling force. Influenced by cylinder bore/stroke ratio, boost pressure, and hybrid motor assist.",
        subMetric: isEngineReady ? `@ ${sim.peakTorqueRpm || 3500} RPM` : "Awaiting configuration"
      },
      {
        icon: <Weight size={14} />,
        label: "Weight",
        initialValue: isVehicleReady ? initialSim.weight : "—",
        value: isVehicleReady ? sim.weight : "—",
        unit: isVehicleReady ? "kg" : "",
        deltaText: isVehicleReady
          ? wgtDiff > 0 ? `+${wgtDiff} kg` : wgtDiff < 0 ? `${wgtDiff} kg` : "Base"
          : "Awaiting",
        deltaColor: isVehicleReady
          ? wgtDiff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : wgtDiff > 0 ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Curb Weight",
        tooltipDesc: "Total vehicle mass including chassis materials, engine block metal, interior trim, and battery packs.",
        subMetric: isVehicleReady ? `Bias: ${sim.weightDistFront || 55}% F / ${100 - (sim.weightDistFront || 55)}% R` : "Awaiting configuration"
      },
      {
        icon: <Timer size={14} />,
        label: "0-60 MPH",
        initialValue: isEngineReady && isVehicleReady ? initialSim.accel0_60 : "—",
        value: isEngineReady && isVehicleReady ? sim.accel0_60 : "—",
        unit: isEngineReady && isVehicleReady ? "s" : "",
        deltaText: isEngineReady && isVehicleReady
          ? accDiff > 0 ? `+${accDiff}s` : accDiff < 0 ? `${accDiff}s` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady && isVehicleReady
          ? accDiff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : accDiff > 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "0 to 60 mph Acceleration",
        tooltipDesc: "Derived from power-to-weight ratio, tire compound grip coefficient, gearbox launch control, and AWD traction.",
        subMetric: isEngineReady && isVehicleReady ? `Limit: ${(sim.accel0_60 < 3.0 ? "AWD Launch" : "Grip Limited")}` : "Awaiting configuration"
      },
      {
        icon: <Flag size={14} />,
        label: "1/4 Mile",
        initialValue: isEngineReady && isVehicleReady ? (initialSim.quarterMile || 11.5).toFixed(2) : "—",
        value: isEngineReady && isVehicleReady ? (sim.quarterMile || 11.5).toFixed(2) : "—",
        unit: isEngineReady && isVehicleReady ? "s" : "",
        deltaText: isEngineReady && isVehicleReady
          ? qtrDiff > 0 ? `+${qtrDiff}s` : qtrDiff < 0 ? `${qtrDiff}s` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady && isVehicleReady
          ? qtrDiff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : qtrDiff > 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Quarter Mile Drag Strip",
        tooltipDesc: "Elapsed time for standing 1/4 mile sprint including launch slip and gear shift delays.",
        subMetric: isEngineReady && isVehicleReady ? `@ ${sim.quarterMileSpeed?.toFixed(0) || 205} km/h trap` : "Awaiting configuration"
      },
      {
        icon: <Activity size={14} />,
        label: "Lateral Grip",
        initialValue: isVehicleReady ? (initialSim.lateralG || 1.1).toFixed(2) : "—",
        value: isVehicleReady ? (sim.lateralG || 1.1).toFixed(2) : "—",
        unit: isVehicleReady ? "G" : "",
        deltaText: isVehicleReady
          ? latDiff > 0 ? `+${latDiff} G` : latDiff < 0 ? `${latDiff} G` : "Base"
          : "Awaiting",
        deltaColor: isVehicleReady
          ? latDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : latDiff < 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Peak Lateral Cornering Acceleration",
        tooltipDesc: "Maximum sustained cornering G-force on 300ft skidpad before mechanical understeer or slide.",
        subMetric: isVehicleReady ? `Skidpad: ${(sim.skidpad || sim.lateralG * 0.95).toFixed(2)} G` : "Awaiting configuration"
      },
      {
        icon: <Disc size={14} />,
        label: "Braking 60-0",
        initialValue: isVehicleReady ? (initialSim.brakingDist || 32).toFixed(1) : "—",
        value: isVehicleReady ? (sim.brakingDist || 32).toFixed(1) : "—",
        unit: isVehicleReady ? "m" : "",
        deltaText: isVehicleReady
          ? brkDiff > 0 ? `+${brkDiff}m` : brkDiff < 0 ? `${brkDiff}m` : "Base"
          : "Awaiting",
        deltaColor: isVehicleReady
          ? brkDiff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : brkDiff > 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Emergency Braking Distance",
        tooltipDesc: "Distance required to decelerate from 60mph to 0. Calculated from brake rotor size, caliper pistons, and tire compound.",
        subMetric: isVehicleReady ? `Cooling: ${((sim.brakeCooling || 0.85) * 100).toFixed(0)}%` : "Awaiting configuration"
      },
      {
        icon: <Wind size={14} />,
        label: "Downforce",
        initialValue: isAeroReady ? (initialSim.downforce || 0) : "—",
        value: isAeroReady ? (sim.downforce || 0) : "—",
        unit: isAeroReady ? "N" : "",
        deltaText: isAeroReady
          ? dwnDiff > 0 ? `+${dwnDiff} N` : dwnDiff < 0 ? `${dwnDiff} N` : "Base"
          : "Awaiting",
        deltaColor: isAeroReady
          ? dwnDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : dwnDiff < 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Total Aerodynamic Load",
        tooltipDesc: "Total downward aerodynamic force pressing vehicle into asphalt at 200 km/h.",
        subMetric: isAeroReady ? `Balance: ${((sim.aeroBalance || 0.5) * 100).toFixed(1)}% Front` : "Awaiting configuration"
      },
      {
        icon: <TrendingUp size={14} />,
        label: "Top Speed",
        initialValue: isEngineReady && isVehicleReady ? initialSim.topSpeed : "—",
        value: isEngineReady && isVehicleReady ? sim.topSpeed : "—",
        unit: isEngineReady && isVehicleReady ? "km/h" : "",
        deltaText: isEngineReady && isVehicleReady
          ? spdDiff > 0 ? `+${spdDiff} km/h` : spdDiff < 0 ? `${spdDiff} km/h` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady && isVehicleReady
          ? spdDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : spdDiff < 0 ? "bg-rose-50 text-rose-700 border-rose-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Terminal Aerodynamic Speed",
        tooltipDesc: "Maximum velocity where aerodynamic drag force equals peak engine wheel horsepower.",
        subMetric: isEngineReady && isVehicleReady ? `Drag Cd: ${sim.dragCoeff || 0.31}` : "Awaiting configuration"
      },
      {
        icon: <Fuel size={14} />,
        label: "Economy",
        initialValue: isEngineReady ? (initialSim.fuelEconomy || 8.5).toFixed(1) : "—",
        value: isEngineReady ? (sim.fuelEconomy || 8.5).toFixed(1) : "—",
        unit: isEngineReady ? "L/100k" : "",
        deltaText: isEngineReady
          ? fueDiff < 0 ? `${fueDiff} L` : fueDiff > 0 ? `+${fueDiff} L` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady
          ? fueDiff < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : fueDiff > 0 ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Combined Fuel Consumption",
        tooltipDesc: "Estimated EPA / WLTP combined cycle fuel consumption per 100km.",
        subMetric: isEngineReady ? `Thermal Eff: ${((sim.thermalEfficiency || 0.38) * 100).toFixed(0)}%` : "Awaiting configuration"
      },
      {
        icon: <DollarSign size={14} />,
        label: "Est. MSRP",
        initialValue: isEngineReady || isVehicleReady ? `$${(initialSim.totalCost / 1000).toFixed(0)}k` : "—",
        value: isEngineReady || isVehicleReady ? `$${(sim.totalCost / 1000).toFixed(0)}k` : "—",
        unit: "",
        deltaText: isEngineReady || isVehicleReady
          ? cstDiff > 0 ? `+$${cstDiff}k` : cstDiff < 0 ? `-$${Math.abs(cstDiff)}k` : "Base"
          : "Awaiting",
        deltaColor: isEngineReady || isVehicleReady
          ? cstDiff <= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-sky-50 text-amber-700 border-sky-300"
          : "bg-slate-100 text-slate-500 border-slate-200",
        tooltipTitle: "Estimated MSRP",
        tooltipDesc: "Total production BOM cost plus manufacturing tooling amortization and engineering markup.",
        subMetric: isEngineReady || isVehicleReady ? `Tier: ${sim.totalCost > 150000 ? "Supercar" : sim.totalCost > 40000 ? "Premium" : "Economy"}` : "Awaiting configuration"
      },
    ];

    if ((sim.isHybrid || sim.isElectric) && isEngineReady) {
      const batDiff = (sim.batteryEnergy || 0) - (initialSim.batteryEnergy || 0);
      items.splice(2, 0, {
        icon: <Battery size={14} />,
        label: "Battery",
        initialValue: initialSim.batteryEnergy || 0,
        value: sim.batteryEnergy || 0,
        unit: "kWh",
        deltaText: batDiff > 0 ? `+${batDiff} kWh` : batDiff < 0 ? `${batDiff} kWh` : "Base",
        deltaColor: batDiff > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-200",
        tooltipTitle: "EV Battery Capacity",
        tooltipDesc: "Usable lithium-ion / solid-state energy storage feeding electric drive motors.",
        subMetric: `Range: ${sim.electricRange || 450} km`
      });
    }

    return items;
  }, [sim, initialSim, isEngineReady, isVehicleReady, isAeroReady]);

  // Handlers for category collapsing & expanding
  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => {
      const next = { ...prev, [catId]: !prev[catId] };
      try {
        window.localStorage.setItem("apex:statrail-categories-collapsed", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const areAllCategoriesCollapsed = useMemo(() => {
    return STAT_CATEGORIES.every((c) => !!collapsedCategories[c.id]);
  }, [collapsedCategories]);

  const toggleCollapseAll = () => {
    if (areAllCategoriesCollapsed) {
      setCollapsedCategories({});
      try {
        window.localStorage.setItem("apex:statrail-categories-collapsed", JSON.stringify({}));
      } catch {}
    } else {
      const all: Record<string, boolean> = {};
      STAT_CATEGORIES.forEach((c) => {
        all[c.id] = true;
      });
      setCollapsedCategories(all);
      try {
        window.localStorage.setItem("apex:statrail-categories-collapsed", JSON.stringify(all));
      } catch {}
    }
  };

  const toggleViewMode = () => {
    const next = viewMode === "compact" ? "detailed" : "compact";
    setViewMode(next);
    try {
      window.localStorage.setItem("apex:statrail-viewmode", next);
    } catch {}
  };

  const togglePanelCollapse = () => {
    const next = !isPanelCollapsed;
    setIsPanelCollapsed(next);
    try {
      window.localStorage.setItem("apex:statrail-collapsed", String(next));
    } catch {}
  };

  // Helper to generate a live preview snippet when a category is collapsed
  const getCategorySummary = (catId: string, catStats: StatItem[]): string => {
    if (catId === "powertrain") {
      const pwr = catStats.find((s) => s.label === "Power");
      const trq = catStats.find((s) => s.label === "Torque");
      if (pwr && pwr.value !== "—") {
        return `${pwr.value} hp${trq && trq.value !== "—" ? ` · ${trq.value} Nm` : ""}`;
      }
      return "Awaiting specs";
    }
    if (catId === "dynamics") {
      const wgt = catStats.find((s) => s.label === "Weight");
      const acc = catStats.find((s) => s.label === "0-60 MPH");
      if (wgt && wgt.value !== "—") {
        return `${wgt.value} kg${acc && acc.value !== "—" ? ` · ${acc.value}s` : ""}`;
      }
      return "Awaiting specs";
    }
    if (catId === "aero_economics") {
      const spd = catStats.find((s) => s.label === "Top Speed");
      const msrp = catStats.find((s) => s.label === "Est. MSRP");
      if (spd && spd.value !== "—") {
        return `${spd.value} km/h${msrp && msrp.value !== "—" ? ` · ${msrp.value}` : ""}`;
      }
      return "Awaiting specs";
    }
    return "";
  };

  // ── COLLAPSED MINI-RAIL VIEW ──
  if (isPanelCollapsed) {
    return (
      <div className="flex flex-col gap-2 stagger-enter relative select-none w-full">
        <div
          onClick={togglePanelCollapse}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/95 border-2 border-[#dfd6c8] shadow-md hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-black text-slate-800 tracking-wider uppercase truncate">
              LIVE STATS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
              {stats.filter((s) => s.value !== "—").length}/{stats.length} Active
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePanelCollapse();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold transition-all shadow-xs cursor-pointer"
            >
              <ChevronDown size={13} />
              <span>Expand</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapseToRight();
              }}
              title="Collapse Live Stats to Right Side"
              className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition-all shadow-xs cursor-pointer group"
              aria-label="Collapse Live Stats to Right Side"
            >
              <PanelRightClose size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mini quick-metrics chips preview */}
        <div className="grid grid-cols-3 gap-1.5 px-0.5">
          {[
            { label: "PWR", val: stats.find(s => s.label === "Power")?.value || "—", unit: "hp" },
            { label: "WGT", val: stats.find(s => s.label === "Weight")?.value || "—", unit: "kg" },
            { label: "0-60", val: stats.find(s => s.label === "0-60 MPH")?.value || "—", unit: "s" },
          ].map((m) => (
            <div
              key={m.label}
              onClick={togglePanelCollapse}
              className="p-1.5 rounded-xl bg-white/90 border border-[#dfd6c8] text-center shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
            >
              <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">{m.label}</span>
              <span className="text-[11px] font-mono font-black text-slate-800 truncate">
                {m.val} {m.val !== "—" ? m.unit : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 stagger-enter relative select-none w-full">
      {/* ── PANEL HEADER WITH COLLAPSE / EXPAND & VIEW MODE CONTROLS ── */}
      <div className="flex items-center justify-between px-1.5 py-1 rounded-xl bg-[#faf7f2]/90 border border-[#e2d8cb] shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-black text-slate-900 tracking-wider uppercase truncate">
            LIVE STATS
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-500 hidden sm:inline">
            ({stats.filter((s) => s.value !== "—").length}/{stats.length})
          </span>
        </div>

        {/* Action Controls: Compact Switch, Collapse/Expand All, Minimize Rail */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Compact / Detailed Toggle */}
          <button
            type="button"
            onClick={toggleViewMode}
            title={viewMode === "compact" ? "Switch to Detailed View" : "Switch to Compact View"}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
              viewMode === "compact"
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                : "bg-white text-slate-700 hover:text-slate-900 border-slate-300"
            }`}
          >
            {viewMode === "compact" ? "Compact" : "Detail"}
          </button>

          {/* Expand All / Collapse All Button */}
          <button
            type="button"
            onClick={toggleCollapseAll}
            title={areAllCategoriesCollapsed ? "Expand All Categories" : "Collapse All Categories"}
            className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            {areAllCategoriesCollapsed ? <ChevronsUpDown size={13} /> : <ChevronsDownUp size={13} />}
          </button>

          {/* Minimize / Collapse Entire Panel Vertically */}
          <button
            type="button"
            onClick={togglePanelCollapse}
            title="Minimize Live Stats Panel Vertically"
            className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <ChevronUp size={13} />
          </button>

          {/* Collapse to Right Side */}
          <button
            type="button"
            onClick={toggleCollapseToRight}
            title="Collapse Live Stats to Right Side"
            className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-xs group"
            aria-label="Collapse Live Stats to Right Side"
          >
            <span className="text-[10px] font-mono font-bold hidden sm:inline">Collapse</span>
            <PanelRightClose size={13} className="text-amber-800 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── ACCORDION CATEGORIES: POWERTRAIN, DYNAMICS, AERO ── */}
      <div className="flex flex-col gap-2">
        {STAT_CATEGORIES.map((cat) => {
          const catStats = stats.filter((s) => cat.labels.includes(s.label));
          if (catStats.length === 0) return null;

          const isCollapsed = !!collapsedCategories[cat.id];
          const summary = getCategorySummary(cat.id, catStats);

          return (
            <div
              key={cat.id}
              className="flex flex-col rounded-2xl bg-white/70 border border-[#dfd6c8] overflow-hidden shadow-xs transition-all"
            >
              {/* Category Header (Click to Collapse/Expand) */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#f6f2e9] hover:bg-[#ede5d6] border-b border-[#e5dcd0] transition-colors cursor-pointer text-left select-none"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-white border border-[#dfd6c8] flex items-center justify-center shrink-0">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-mono font-extrabold text-slate-900 uppercase tracking-wider truncate">
                    {cat.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-500">
                    ({catStats.length})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* When collapsed, show quick live preview chip */}
                  {isCollapsed && (
                    <span className="text-[9.5px] font-mono font-bold text-amber-800 bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.5 rounded shadow-xs truncate max-w-[130px]">
                      {summary}
                    </span>
                  )}

                  <ChevronDown
                    size={14}
                    className={`text-slate-500 transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </div>
              </button>

              {/* Category Body: Stat Cards List */}
              {!isCollapsed && (
                <div className="flex flex-col gap-1.5 p-1.5">
                  {catStats.map((s) => {
                    const isCardExpanded = expandedCard === s.label;

                    return (
                      <div
                        key={s.label}
                        onClick={() => setExpandedCard(isCardExpanded ? null : s.label)}
                        className={`relative flex flex-col transition-all duration-200 cursor-pointer group shadow-xs overflow-hidden select-none ${
                          viewMode === "compact"
                            ? "bg-white/95 hover:bg-[#fffdfa] border border-[#e2d8ca] hover:border-amber-400 rounded-xl px-2.5 py-1.5 gap-1"
                            : "bg-white/95 hover:bg-[#fffdfa] border border-[#e2d8ca] hover:border-amber-400 rounded-xl p-2.5 gap-1.5"
                        } ${isCardExpanded ? "ring-2 ring-amber-400/60 border-amber-400 shadow-sm" : ""}`}
                        onMouseEnter={() => setHoveredLabel(s.label)}
                        onMouseLeave={() => setHoveredLabel(null)}
                      >
                        {/* ── TOP ROW: Icon, Metric Label & Live Delta / Value ── */}
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                              {s.icon}
                            </div>
                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 truncate">
                              <span>{s.label}</span>
                            </div>
                          </div>

                          {/* Right Side: Value & Delta */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* If in compact mode, display the value prominently on top row */}
                            {viewMode === "compact" && (
                              <span className="font-mono font-black text-xs text-slate-900">
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
                            )}

                            {/* Live Delta Badge */}
                            <div className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.deltaColor}`}>
                              {s.deltaText}
                            </div>

                            <ChevronDown
                              size={12}
                              className={`text-slate-400 group-hover:text-amber-700 transition-transform duration-200 shrink-0 ${
                                isCardExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* ── BOTTOM ROW (Detailed View only): Initial → Present Spec Comparison Bar ── */}
                        {viewMode === "detailed" && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px] font-mono w-full">
                            {/* Sub-metric label on the left */}
                            <span className="text-[9px] text-slate-500 font-medium truncate max-w-[120px]" title={s.subMetric}>
                              {s.subMetric}
                            </span>

                            {/* Initial → Present Specs Inline */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-slate-400">
                                <span className="text-[8px] uppercase tracking-widest text-slate-400 mr-0.5">INIT</span>
                                {s.initialValue}
                                {s.unit ? ` ${s.unit}` : ""}
                              </span>

                              <span className="text-slate-300 font-sans text-xs">→</span>

                              <span className="font-bold text-slate-900">
                                <span className="text-[8px] uppercase tracking-widest text-amber-700 mr-0.5">NOW</span>
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
                        )}

                        {/* ── INLINE EXPANDED DETAILS (When clicked to expand) ── */}
                        {isCardExpanded && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-[10px] text-slate-700 space-y-2 animate-fadeIn"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900 block">{s.tooltipTitle}</span>
                                <p className="text-[10px] text-slate-600 leading-normal mt-0.5">{s.tooltipDesc}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 font-mono text-[9.5px]">
                              <span className="text-slate-500">SPEC PROGRESSION:</span>
                              <span className="font-bold text-amber-800">
                                {s.initialValue} → {s.value} {s.unit}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => openStatModal(s)}
                              className="w-full py-1 px-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <Maximize2 size={10} />
                              <span>Open Telemetry Inspector</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── SPATIAL LIGHTBOX MODAL FOR TELEMETRY STATS ── */}
      {modalRendered && selectedStat && createPortal(
        <div 
          className={`schematic-backdrop ${modalActive ? "active" : ""}`}
          onClick={closeStatModal}
        >
          <div 
            className="schematic-modal-container max-w-xl bg-white/95 border-2 border-[#dfd6c8] shadow-2xl rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back & Close */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
              <button
                onClick={closeStatModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-400/40 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-800">
                <Activity size={14} className="text-amber-600" />
                {selectedStat.label} Telemetry Analysis
              </div>
              <button
                onClick={closeStatModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Stat Card Display */}
            <div className="w-full bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border border-amber-200/60 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-3 shadow-sm">
                {selectedStat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-wide mb-1">{selectedStat.tooltipTitle}</h3>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed mb-4">{selectedStat.tooltipDesc}</p>

              {/* Huge Live Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-mono font-black text-slate-900">{selectedStat.value}</span>
                <span className="text-base font-mono font-bold text-amber-600">{selectedStat.unit}</span>
              </div>

              <div className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full border ${selectedStat.deltaColor}`}>
                Delta: {selectedStat.deltaText}
              </div>
            </div>

            {/* Baseline Specs Comparison Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-200">
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-3.5 text-center shadow-xs">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Baseline Initial</span>
                <span className="text-base font-mono font-bold text-slate-700">{selectedStat.initialValue} {selectedStat.unit}</span>
              </div>
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-3.5 text-center shadow-xs">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Current Spec</span>
                <span className="text-base font-mono font-bold text-amber-700">{selectedStat.value} {selectedStat.unit}</span>
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
