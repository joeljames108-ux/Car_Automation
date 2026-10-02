import React from "react";
import {
  Cog,
  Car,
  Wind,
  Sofa,
  ShieldCheck,
  Activity,
  Trophy,
  Factory,
  ArrowLeft,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Gauge,
  Wrench,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import type { Stage } from "../StageSwitcher";

interface CreateVehicleHubProps {
  onSelectStage: (stage: Stage) => void;
}

interface CreationDivision {
  step: string;
  id: Stage;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  iconBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  tags: string[];
  secondaryAction?: {
    label: string;
    stage: Stage;
    icon: React.ReactNode;
  };
}

export const CreateVehicleHub: React.FC<CreateVehicleHubProps> = ({ onSelectStage }) => {
  const { company } = useCompany();
  const { year, month, day, activeProject } = useSimulationClockStore();
  const { devMode, toggleModal } = useDeveloperModeStore();
  const {
    engineStatus,
    transmissionStatus,
    vehicleStatus,
    aeroStatus,
    interiorStatus,
  } = useGuidedEngineeringStore();

  const getStageStatus = (stageId: Stage) => {
    switch (stageId) {
      case "engine":
        if (engineStatus === "configured" && transmissionStatus === "configured") {
          return "configured";
        }
        if (engineStatus === "configured" || transmissionStatus === "configured") {
          return "incomplete";
        }
        return engineStatus;
      case "vehicle":
        return vehicleStatus;
      case "aero_studio":
        return aeroStatus;
      case "interior":
        return interiorStatus;
      default:
        return "unconfigured";
    }
  };

  const handleSelectDivision = (stageId: Stage) => {
    if (stageId === "engine") {
      onSelectStage("powertrain_studio_select");
      return;
    }
    onSelectStage(stageId);
  };

  const divisions: CreationDivision[] = [
    {
      step: "01",
      id: "engine",
      title: "1. Engine",
      category: "Powertrain & Propulsion",
      subtitle: "ICE, Turbo, Hybrid & Electrification",
      description:
        "Combustion cycle simulation, displacement, valvetrain, turbochargers, dyno calibration, and NVH acoustics.",
      image: "/assets/divisions/engine.jpg",
      icon: <Cog size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-700",
      accentBorder: "hover:border-amber-500 hover:shadow-amber-500/20",
      badgeBg: "bg-amber-500/30 border-amber-400/60 text-amber-200",
      badgeText: "POWERTRAIN",
      tags: ["ICE • Turbo • Hybrid", "720° Dyno Maps", "NVH Lab"],
    },
    {
      step: "02",
      id: "vehicle",
      title: "2. Vehicle Studio",
      category: "Chassis & Body Architecture",
      subtitle: "Class-A CAD Surfaces & Hardpoints",
      description:
        "Master chassis hardpoints, 12-subsystem assembly, carbon monocoque tub, wheel geometry, and body styling.",
      image: "/assets/divisions/vehicle.jpg",
      icon: <Car size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-cyan-600 to-cyan-800",
      accentBorder: "hover:border-cyan-500 hover:shadow-cyan-500/20",
      badgeBg: "bg-cyan-500/30 border-cyan-400/60 text-cyan-200",
      badgeText: "CHASSIS & BODY",
      tags: ["Class-A CAD", "Modular Hardpoints", "Carbon Tub"],
    },
    {
      step: "03",
      id: "aero_studio",
      title: "3. Aero Studio",
      category: "Aerodynamics & Virtual Wind Tunnel",
      subtitle: "Downforce, Drag & CFD Streamlines",
      description:
        "Parametric multi-element wings, active DRS actuators, Venturi underbody tunnels, splitters, and CFD polars.",
      image: "/assets/divisions/aero.jpg",
      icon: <Wind size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-teal-500 to-teal-700",
      accentBorder: "hover:border-teal-500 hover:shadow-teal-500/20",
      badgeBg: "bg-teal-500/30 border-teal-400/60 text-teal-200",
      badgeText: "AERODYNAMICS",
      tags: ["LBM CFD", "Active Aero", "Venturi Ground Effect"],
    },
    {
      step: "04",
      id: "interior",
      title: "4. Interior",
      category: "Cockpit Architecture & HMI",
      subtitle: "Cabin Ergonomics, OLED Displays & ADAS",
      description:
        "SAE J1100 H-Point ergonomic compliance, curved OLED digital instrument clusters, tactical switchgear, and bespoke upholstery.",
      image: "/assets/divisions/interior.jpg",
      icon: <Sofa size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-purple-600 to-purple-800",
      accentBorder: "hover:border-purple-500 hover:shadow-purple-500/20",
      badgeBg: "bg-purple-500/30 border-purple-400/60 text-purple-200",
      badgeText: "COCKPIT & HMI",
      tags: ["Curved OLED", "SAE J826 Ergonomics", "Bespoke Leather"],
    },
    {
      step: "05",
      id: "safety",
      title: "5. Safety Center",
      category: "Crash Structures & Compliance",
      subtitle: "FEM Structural Impact & NCAP Ratings",
      description:
        "Non-linear FEM crash simulation, crumple zones, side intrusion barriers, active rollover protection, and airbag calibration.",
      image: "/assets/divisions/safety.jpg",
      icon: <ShieldCheck size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-rose-500 to-rose-700",
      accentBorder: "hover:border-rose-500 hover:shadow-rose-500/20",
      badgeBg: "bg-rose-500/30 border-rose-400/60 text-rose-200",
      badgeText: "CRASH COMPLIANCE",
      tags: ["FEM Impact", "Crumple Zones", "5-Star NCAP"],
    },
    {
      step: "06",
      id: "simulation",
      title: "6. Sim & Testing",
      category: "Vehicle Dynamics & Track Proving",
      subtitle: "Acceleration, Skidpad & Circuit Telemetry",
      description:
        "Multi-physics lap simulator, 0-60 mph benchmarks, dynamic 4-post shaker rig, tire slip angles, and full telemetry analytics.",
      image: "/assets/divisions/simulation.jpg",
      icon: <Activity size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-blue-600 to-blue-800",
      accentBorder: "hover:border-blue-500 hover:shadow-blue-500/20",
      badgeBg: "bg-blue-500/30 border-blue-400/60 text-blue-200",
      badgeText: "SIMULATION & DYNAMICS",
      tags: ["100Hz Telemetry", "Lap Simulator", "Skidpad Lateral G"],
    },
    {
      step: "07",
      id: "manufacturing",
      title: "7. Manufacture",
      category: "Assembly Line & Supply Chain",
      subtitle: "Tooling Amortization & Line Throughput",
      description:
        "Stamping dies, robotic assembly cycle times, plant capacity planning, bill of materials unit cost optimization, and shop floor throughput.",
      image: "/assets/divisions/manufacture.jpg",
      icon: <Factory size={18} className="text-white" />,
      iconBg: "bg-gradient-to-br from-emerald-600 to-emerald-800",
      accentBorder: "hover:border-emerald-500 hover:shadow-emerald-500/20",
      badgeBg: "bg-emerald-500/30 border-emerald-400/60 text-emerald-200",
      badgeText: "TOOLING & PRODUCTION",
      tags: ["Stamping Dies", "Tooling Amortization", "Line Speed"],
    },
  ];

  const topDivisions = divisions.slice(0, 3);
  const bottomDivisions = divisions.slice(3, 7);

  const renderDivisionCard = (div: CreationDivision, isTopRow: boolean) => {
    const status = getStageStatus(div.id);
    const isConfigured = status === "configured";
    const isInvalidated = status === "invalidated";
    const isIncomplete = status === "incomplete";
    return (
      <div
        key={div.id}
        onClick={() => handleSelectDivision(div.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectDivision(div.id);
          }
        }}
        className={`group relative rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-[#fdfbf7] shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full min-h-0 ${
          isConfigured
            ? "border-emerald-500/50 hover:border-emerald-600 shadow-[0_4px_20px_rgba(16,185,129,0.08)]"
            : isIncomplete
            ? "border-amber-500/70 hover:border-amber-600 shadow-[0_4px_20px_rgba(245,158,11,0.12)]"
            : isInvalidated
            ? "border-amber-500/50 hover:border-amber-600"
            : "border-[#d8beac] hover:border-[#b8744c]"
        }`}
      >
        {/* Visual Hero Image Section */}
        <div className={`relative ${isTopRow ? "h-22 sm:h-26 lg:h-28" : "h-20 sm:h-24 lg:h-26"} w-full overflow-hidden bg-slate-200 shrink-0`}>
          <img
            src={div.image}
            alt={div.title}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
          />
          {/* Subtle top & bottom scrims to maximize contrast */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/65 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

          {/* Floating Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
            <span className="text-[10px] font-mono font-black text-white px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/20 shadow-2xs">
              {div.step}
            </span>
            {isConfigured ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-mono tracking-wider backdrop-blur-md shadow-2xs bg-emerald-500/35 border-emerald-400/70 text-emerald-100 flex items-center gap-1">
                <CheckCircle2 size={9} className="text-emerald-300" />
                <span>BUILT</span>
              </span>
            ) : isInvalidated ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-mono tracking-wider backdrop-blur-md shadow-2xs bg-amber-500/30 border-amber-400/60 text-amber-200 animate-pulse">
                RECALC
              </span>
            ) : isIncomplete ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-mono tracking-wider backdrop-blur-md shadow-2xs bg-amber-500/35 border-amber-400/80 text-amber-900 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                <span>INCOMPLETE</span>
              </span>
            ) : (
              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border font-mono tracking-wider backdrop-blur-md shadow-2xs ${div.badgeBg}`}>
                {div.badgeText}
              </span>
            )}
          </div>

          {/* Bottom Category Overlay */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
            <span className="text-[9px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wide uppercase truncate">
              {div.category}
            </span>
            <ChevronRight
              size={11}
              className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="p-2 sm:p-2.5 bg-[#fdfbf7] group-hover:bg-[#fffefb] border-t border-[#eed8c8] flex flex-col justify-between flex-1 min-h-0 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg ${div.iconBg} text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0`}>
                {React.cloneElement(div.icon as React.ReactElement, { size: 14 })}
              </div>
              <div className="min-w-0">
                <h3
                  className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#b8744c] transition-colors uppercase tracking-wider font-mono truncate"
                  style={{ color: "#0f172a" }}
                >
                  {div.title}
                </h3>
                <div
                  className="text-[9px] font-bold text-slate-500 tracking-wide font-mono truncate"
                  style={{ color: "#64748b" }}
                >
                  {div.subtitle}
                </div>
              </div>
            </div>

            <p
              className="text-[10px] sm:text-[11px] text-slate-700 line-clamp-2 mt-0.5 leading-snug font-sans font-medium"
              style={{ color: "#334155" }}
            >
              {div.description}
            </p>
          </div>

          {/* Tags & Action Button Row */}
          <div className="pt-1.5 mt-1 border-t border-[#eed8c8]/80 flex flex-col gap-1">
            {/* Feature Tags */}
            <div className="flex flex-wrap gap-1">
              {isIncomplete && div.id === "engine" ? (
                <>
                  <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded shadow-2xs">
                    {engineStatus === "configured" ? "✓ Engine Done" : "⚡ Engine Needed"}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded shadow-2xs animate-pulse">
                    {transmissionStatus === "configured" ? "✓ Trans Done" : "⚡ Trans Needed"}
                  </span>
                </>
              ) : (
                div.tags.slice(0, isTopRow ? 3 : 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[8px] font-mono font-bold text-slate-700 bg-white border border-[#dad4c5] px-1.5 py-0.2 rounded shadow-2xs truncate"
                    style={{ color: "#334155" }}
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDivision(div.id);
                }}
                className="flex items-center gap-1 text-[11px] font-black text-slate-900 group-hover:text-amber-700 hover:text-amber-700 transition-colors font-mono cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                style={{ color: "#0f172a" }}
              >
                <span>
                  {isConfigured
                    ? "TUNE PART"
                    : isIncomplete
                    ? "COMPLETE PART"
                    : "BUILD PART"}
                </span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </button>

              {div.secondaryAction && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStage(div.secondaryAction!.stage);
                  }}
                  className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-slate-700 hover:text-slate-950 px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-[#dad4c5] transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  {div.secondaryAction.icon}
                  <span>{div.secondaryAction.label}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-menu-root w-full h-full max-h-screen text-slate-900 flex flex-col justify-between select-none bg-gradient-to-br from-[#f8f5ee] via-[#f3ede2] to-[#ebe3d5] p-2.5 sm:p-3 relative font-sans overflow-hidden">
      {/* Ambient background soft light orbs contained to prevent pseudo-overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP BAR HEADER & BREADCRUMBS
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full py-1.5 px-3 sm:px-4 mb-2 rounded-xl bg-white/95 border border-[#dad4c5] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        {/* Back to Main Menu Button */}
        <button
          onClick={() => onSelectStage("main_menu")}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-[#d2ccc0] hover:border-amber-500 text-slate-800 transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-amber-600" />
          <span className="text-xs font-black tracking-wider uppercase font-mono">
            Main Menu
          </span>
        </button>

        {/* Center Title Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400/50" />
          <div>
            <div className="text-xs sm:text-sm font-black tracking-wider text-slate-900 font-mono uppercase leading-tight">
              VEHICLE CREATION HUB
            </div>
            <div className="text-[9px] font-bold text-slate-500 font-mono tracking-widest uppercase">
              Select an Engineering Division
            </div>
          </div>
        </div>

        {/* Right: Active Project & Sim Date + Dev Mode Switch */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
              devMode
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-800 hover:bg-emerald-500/30"
                : "bg-white border-[#d2ccc0] text-slate-700 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Open Developer Control Matrix (Ctrl+Shift+D)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                devMode ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <Wrench size={11} className={devMode ? "text-emerald-700" : "text-slate-500"} />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
              Dev Mode: {devMode ? "ON" : "OFF"}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-[#dad4c5] shadow-2xs">
            <div>
              <div className="text-xs font-black text-slate-900 font-mono leading-tight">
                {activeProject.name}
              </div>
              <div className="text-[9px] text-amber-700 font-mono font-bold">
                {formatSimDate(year, month, day)}
              </div>
            </div>
            <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-600 shrink-0">
              <Gauge size={13} />
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          HERO SUBTITLE BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mb-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shrink-0">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-wide flex items-center gap-1.5 font-mono">
            <Sparkles size={16} className="text-amber-500" />
            AUTOMOTIVE DESIGN & ENGINEERING DIVISIONS
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium line-clamp-1">
            Execute the complete Class-A development lifecycle. Select any division below to enter its specialized workspace.
          </p>
        </div>
        <div className="text-[9px] font-mono text-slate-700 font-bold bg-white border border-[#dad4c5] px-2.5 py-0.5 rounded-md shrink-0 shadow-2xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>7 CORE DISCIPLINES</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          THE 7 HERO DIVISION CARDS (3 ABOVE, 4 BELOW)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 min-h-0 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto mb-1">
        {/* Top Row: 3 Engineering Divisions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5 flex-1 min-h-0">
          {topDivisions.map((div) => renderDivisionCard(div, true))}
        </div>

        {/* Bottom Row: 4 Engineering Divisions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 flex-1 min-h-0">
          {bottomDivisions.map((div) => renderDivisionCard(div, false))}
        </div>
      </section>

    </div>
  );
};
