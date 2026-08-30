import { useState, useEffect, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import {
  Gauge,
  Wind,
  Disc,
  Activity,
  Cpu,
  Sparkles,
  Navigation,
  ArrowRight,
  Maximize2,
  ArrowLeft,
  X,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";

interface ChassisHotspotViewerProps {
  onSelectStage?: (stage: string) => void;
}

function ChassisHotspotViewerComponent({ onSelectStage }: ChassisHotspotViewerProps) {
  const { design, sim } = useDesign();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  const openZoomModal = () => {
    setIsZoomed(true);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalActive(true);
      });
    });
  };

  const closeZoomModal = () => {
    setIsZoomed(false);
    setModalActive(false);
    setTimeout(() => {
      setModalRendered(false);
    }, 400);
  };

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  const hotspots = useMemo(() => {
    const dispLiters = (sim.displacement / 1000).toFixed(1);
    const engineStatus =
      (sim.knockRisk || 0) > 0.45
        ? "red"
        : (sim.coolingMargin || 0.5) < 0.25
          ? "yellow"
          : "green";
    const frontAeroStatus =
      (sim.dragCoeff || 0.3) > 0.45 ? "yellow" : "green";
    const rearAeroStatus =
      (sim.aeroBalance || 50) < 35 || (sim.aeroBalance || 50) > 65
        ? "yellow"
        : "green";
    const wheelStatus = (sim.lateralG || 1.2) < 0.9 ? "yellow" : "green";
    const brakeStatus =
      (sim.brakingDist || 35) > 42
        ? "red"
        : (sim.brakingDist || 35) > 36
          ? "yellow"
          : "green";
    const ecuStatus =
      (sim.reliability || 0.8) < 0.65
        ? "red"
        : (sim.reliability || 0.8) < 0.8
          ? "yellow"
          : "green";

    const getRingColor = (status: "green" | "yellow" | "red") => {
      if (status === "red")
        return {
          stroke: "#ef4444",
          fill: "rgba(239, 68, 68, 0.25)",
          glow: "rgba(239, 68, 68, 0.8)",
          border: "border-red-500/80 text-red-300 bg-red-950/80",
        };
      if (status === "yellow")
        return {
          stroke: "#facc15",
          fill: "rgba(250, 204, 21, 0.25)",
          glow: "rgba(250, 204, 21, 0.8)",
          border: "border-yellow-500/80 text-yellow-300 bg-yellow-950/80",
        };
      return {
        stroke: "#22c55e",
        fill: "rgba(34, 197, 94, 0.2)",
        glow: "rgba(34, 197, 94, 0.7)",
        border: "border-emerald-500/80 text-emerald-300 bg-emerald-950/80",
      };
    };

    return [
      {
        id: "engine",
        stage: "engine",
        label: "Engine Bay & Powertrain",
        icon: <Gauge size={16} className="text-cyan-400" />,
        cx: 240,
        cy: 160,
        stat: `${sim.peakPower} HP | ${sim.peakTorque} Nm`,
        detail: `${design.engine.layout.toUpperCase()} ${sim.cylinderCount} Cyl (${dispLiters}L)`,
        color: "border-cyan-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-cyan-300",
        glowColor: "rgba(34, 211, 238, 0.6)",
        status: engineStatus,
        ring: getRingColor(engineStatus),
      },
      {
        id: "front-aero",
        stage: "aero",
        label: "Front Splitter & Aero",
        icon: <Wind size={16} className="text-emerald-400" />,
        cx: 110,
        cy: 160,
        stat: `Cd ${sim.dragCoeff.toFixed(2)} | Front Bias ${(sim.aeroBalance || 50).toFixed(0)}%`,
        detail: `Splitter ${design.vehicle.aero?.splitterLength || 100}mm | Floor: ${(design.vehicle.aero?.underbody || "flat").replace("_", " ")}`,
        color: "border-emerald-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-emerald-300",
        glowColor: "rgba(52, 211, 153, 0.6)",
        status: frontAeroStatus,
        ring: getRingColor(frontAeroStatus),
      },
      {
        id: "rear-aero",
        stage: "aero",
        label: "Rear Wing & Diffuser",
        icon: <Wind size={16} className="text-purple-400" />,
        cx: 690,
        cy: 160,
        stat: `${sim.downforce || 0} kg Downforce @ 200km/h`,
        detail: `Rear Wing Angle ${design.vehicle.aero?.wingAngle || 0}° | Diffuser ${design.vehicle.aero?.diffuserAngle || 0}°`,
        color: "border-purple-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-purple-300",
        glowColor: "rgba(192, 132, 252, 0.6)",
        status: rearAeroStatus,
        ring: getRingColor(rearAeroStatus),
      },
      {
        id: "wheels",
        stage: "vehicle",
        label: "Suspension & Tyres",
        icon: <Activity size={16} className="text-amber-400" />,
        cx: 210,
        cy: 225,
        stat: `Cornering ${(sim.lateralG || 1.2).toFixed(2)}g | ${(design.vehicle.tireCompound || "street").toUpperCase()}`,
        detail: `Wheel Width ${design.vehicle.wheelWidth || 9}" | Diameter ${design.vehicle.wheelDiameter || 19}"`,
        color: "border-amber-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-slate-300",
        glowColor: "rgba(251, 191, 36, 0.6)",
        status: wheelStatus,
        ring: getRingColor(wheelStatus),
      },
      {
        id: "brakes",
        stage: "vehicle",
        label: "Brake System",
        icon: <Disc size={16} className="text-rose-400" />,
        cx: 580,
        cy: 225,
        stat: `Brake Type: ${(design.vehicle.brakeType || "steel").toUpperCase()}`,
        detail: `Disc Size ${design.vehicle.brakeDiscSize || 380}mm | Bias ${((design.vehicle.brakeBias || 0.6) * 100).toFixed(0)}% F`,
        color: "border-rose-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-rose-300",
        glowColor: "rgba(251, 113, 133, 0.6)",
        status: brakeStatus,
        ring: getRingColor(brakeStatus),
      },
      {
        id: "electronics",
        stage: "infotainment",
        label: "Cockpit & Telemetry ECU",
        icon: <Cpu size={16} className="text-blue-400" />,
        cx: 430,
        cy: 160,
        stat: `Infotainment OS: ${(design.infotainment?.osTier || "standard").toUpperCase()}`,
        detail: `ADAS Assist Level ${design.infotainment?.adasLevel || 0} | Drive ECU Active`,
        color: "border-blue-500/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-blue-300",
        glowColor: "rgba(129, 140, 248, 0.6)",
        status: ecuStatus,
        ring: getRingColor(ecuStatus),
      },
    ];
  }, [
    sim.peakPower,
    sim.peakTorque,
    sim.displacement,
    sim.cylinderCount,
    design.engine.layout,
    sim.dragCoeff,
    sim.aeroBalance,
    design.vehicle.aero?.splitterLength,
    design.vehicle.aero?.underbody,
    sim.downforce,
    design.vehicle.aero?.wingAngle,
    design.vehicle.aero?.diffuserAngle,
    sim.lateralG,
    design.vehicle.tireCompound,
    design.vehicle.wheelWidth,
    design.vehicle.wheelDiameter,
    design.vehicle.brakeType,
    design.vehicle.brakeDiscSize,
    design.vehicle.brakeBias,
    design.infotainment?.osTier,
    design.infotainment?.adasLevel,
    sim.knockRisk,
    sim.coolingMargin,
    sim.brakingDist,
    sim.reliability,
  ]);

  const currentHotspotObj = hotspots.find((h) => h.id === activeHotspot);

  return (
    <div className="panel bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden group">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Navigation size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                TELEMETRY CHASSIS BLUEPRINT
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> CLICK TO TUNE
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Interactive Hotspot Diagnostics
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Hover reticles to inspect • Click to edit</span>
        </div>
      </div>

      {/* Technical Chassis Blueprint Diagram Image with Interactive Overlay */}
      <div className="relative w-full overflow-x-auto py-2 flex justify-center items-center group">
        <button
          onClick={openZoomModal}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 border border-cyan-500/50 text-cyan-300 p-2 rounded-full shadow-lg z-30 hover:bg-slate-800 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold px-3"
          title="Click to Zoom Chassis Blueprint"
        >
          <Maximize2 size={12} />
          <span>Zoom Blueprint</span>
        </button>
        <div className="relative w-[800px] h-[300px] flex-shrink-0 rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          {/* Blueprint Image */}
          <img
            src="/chassis_hotspots_diagram.png"
            alt="F1 Supercar Chassis Telemetry Blueprint"
            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]"
          />

          {/* SVG Overlay Layer for Reticles */}
          <svg
            viewBox="0 0 800 300"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* HOTSPOT TARGET RETICLES WITH COLOR-CODED STATUS RINGS */}
            {hotspots.map((hs) => {
              const isSelected = activeHotspot === hs.id;
              return (
                <g
                  key={hs.id}
                  className="cursor-pointer group/reticle pointer-events-auto"
                  onMouseEnter={() => setActiveHotspot(hs.id)}
                  onClick={() => onSelectStage && onSelectStage(hs.stage)}
                >
                  {/* Outer Pulsing Status Ring */}
                  <circle
                    cx={hs.cx}
                    cy={hs.cy}
                    r={isSelected ? 24 : 18}
                    fill="none"
                    stroke={hs.ring.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-300 animate-ping opacity-75"
                  />
                  {/* Status Ring Aura Background */}
                  <circle
                    cx={hs.cx}
                    cy={hs.cy}
                    r={isSelected ? 16 : 12}
                    fill={hs.ring.fill}
                    stroke={hs.ring.stroke}
                    strokeWidth={2.5}
                    className="transition-all duration-200 shadow-lg"
                  />
                  {/* Inner Target Point */}
                  <circle
                    cx={hs.cx}
                    cy={hs.cy}
                    r={4}
                    fill={hs.ring.stroke}
                  />
                  {/* Crosshair lines */}
                  <line
                    x1={hs.cx - 5}
                    y1={hs.cy}
                    x2={hs.cx + 5}
                    y2={hs.cy}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={hs.cx}
                    y1={hs.cy - 5}
                    x2={hs.cx}
                    y2={hs.cy + 5}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Telemetry Popover HUD */}
          {currentHotspotObj && (
            <div
              className="absolute z-30 transition-all duration-300 pointer-events-none"
              style={{
                left: `${(currentHotspotObj.cx / 800) * 100}%`,
                top: `${(currentHotspotObj.cy / 300) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              <div
                className={`w-64 p-3.5 rounded-xl bg-slate-950/95 backdrop-blur-2xl border ${currentHotspotObj.color} shadow-[0_0_30px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-100">
                    {currentHotspotObj.icon}
                    <span>{currentHotspotObj.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${currentHotspotObj.ring.border}`}
                  >
                    {currentHotspotObj.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {currentHotspotObj.stat}
                </div>
                <div className="text-[11px] text-slate-300 leading-tight">
                  {currentHotspotObj.detail}
                </div>

                <button
                  onClick={() =>
                    onSelectStage && onSelectStage(currentHotspotObj.stage)
                  }
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <span>Tune Module</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ultra-Smooth Spatial Glass Lightbox Modal for Blueprint Viewer */}
      {modalRendered &&
        createPortal(
          <div
            className={`schematic-backdrop ${modalActive ? "active" : ""}`}
            onClick={closeZoomModal}
          >
            <div
              className="schematic-modal-container max-w-5xl bg-slate-950/95 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar with Back & Close */}
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
                <button
                  onClick={closeZoomModal}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold hover:bg-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                  <Navigation size={14} className="text-cyan-400" />
                  Interactive Telemetry Chassis Blueprint
                </div>
                <button
                  onClick={closeZoomModal}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* High-Resolution Expanded Blueprint Box */}
              <div className="relative w-full h-[420px] bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                <img
                  src="/chassis_hotspots_diagram.png"
                  alt="F1 Supercar Chassis Telemetry Blueprint"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                />
              </div>

              {/* Hotspot Diagnostics Grid */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-800">
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    className="bg-[#090d16] border border-slate-800 rounded-2xl p-3 text-left shadow-sm backdrop-blur-md"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 mb-1">
                      {hs.icon}
                      <span>{hs.label}</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-400">
                      {hs.stat}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {hs.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export const ChassisHotspotViewer = memo(ChassisHotspotViewerComponent);
