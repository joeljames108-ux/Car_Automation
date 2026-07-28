import { useState } from "react";
import { Gauge, Wind, Disc, Activity, Cpu, Sparkles, Navigation, ArrowRight } from "lucide-react";
import { useDesign } from "../state/DesignContext";

interface ChassisHotspotViewerProps {
  onSelectStage?: (stage: string) => void;
}

export function ChassisHotspotViewer({ onSelectStage }: ChassisHotspotViewerProps) {
  const { design, sim } = useDesign();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const dispLiters = (sim.displacement / 1000).toFixed(1);

  // Calculate component status rings (Green / Yellow / Red) based on live simulation stats
  const engineStatus = (sim.knockRisk || 0) > 0.45 ? "red" : (sim.coolingMargin || 0.5) < 0.25 ? "yellow" : "green";
  const frontAeroStatus = (sim.dragCoeff || 0.3) > 0.45 ? "yellow" : "green";
  const rearAeroStatus = (sim.aeroBalance || 50) < 35 || (sim.aeroBalance || 50) > 65 ? "yellow" : "green";
  const wheelStatus = (sim.lateralG || 1.2) < 0.9 ? "yellow" : "green";
  const brakeStatus = (sim.brakingDist || 35) > 42 ? "red" : (sim.brakingDist || 35) > 36 ? "yellow" : "green";
  const ecuStatus = (sim.reliability || 0.8) < 0.65 ? "red" : (sim.reliability || 0.8) < 0.8 ? "yellow" : "green";

  const getRingColor = (status: "green" | "yellow" | "red") => {
    if (status === "red") return { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.2)", glow: "rgba(239, 68, 68, 0.7)", border: "border-red-500/80 text-red-300 bg-red-500/10" };
    if (status === "yellow") return { stroke: "#eab308", fill: "rgba(234, 179, 8, 0.2)", glow: "rgba(234, 179, 8, 0.7)", border: "border-yellow-500/80 text-yellow-300 bg-yellow-500/10" };
    return { stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.15)", glow: "rgba(34, 197, 94, 0.6)", border: "border-emerald-500/80 text-emerald-300 bg-emerald-500/10" };
  };

  const hotspots = [
    {
      id: "engine",
      stage: "engine",
      label: "Engine Bay & Powertrain",
      icon: <Gauge size={16} className="text-cyan-400" />,
      cx: 240,
      cy: 160,
      stat: `${sim.peakPower} HP | ${sim.peakTorque} Nm`,
      detail: `${design.engine.layout.toUpperCase()} ${sim.cylinderCount} Cyl (${dispLiters}L)`,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-400/60 text-cyan-300",
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
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-400/60 text-emerald-300",
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
      color: "from-purple-500/20 to-fuchsia-500/10 border-purple-400/60 text-purple-300",
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
      color: "from-amber-500/20 to-yellow-500/10 border-amber-400/60 text-amber-300",
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
      color: "from-rose-500/20 to-red-500/10 border-rose-400/60 text-rose-300",
      glowColor: "rgba(251, 113, 133, 0.6)",
      status: brakeStatus,
      ring: getRingColor(brakeStatus),
    },
    {
      id: "electronics",
      stage: "infotainment",
      label: "Cockpit & Telemetry ECU",
      icon: <Cpu size={16} className="text-indigo-400" />,
      cx: 430,
      cy: 160,
      stat: `Infotainment OS: ${(design.infotainment?.osTier || "standard").toUpperCase()}`,
      detail: `ADAS Assist Level ${design.infotainment?.adasLevel || 0} | Drive ECU Active`,
      color: "from-indigo-500/20 to-violet-500/10 border-indigo-400/60 text-indigo-300",
      glowColor: "rgba(129, 140, 248, 0.6)",
      status: ecuStatus,
      ring: getRingColor(ecuStatus),
    },
  ];

  const currentHotspotObj = hotspots.find((h) => h.id === activeHotspot);

  return (
    <div className="bg-slate-900/75 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <h3 className="text-base font-bold text-slate-100">Interactive Hotspot Diagnostics</h3>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Hover reticles to inspect • Click to edit</span>
        </div>
      </div>

      {/* SVG Chassis Blueprint */}
      <div className="relative w-full overflow-x-auto py-2 flex justify-center items-center">
        <div className="relative w-[800px] h-[300px] flex-shrink-0">
          <svg
            viewBox="0 0 800 300"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          >
            <defs>
              {/* Grid pattern background */}
              <pattern id="chassisGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.07)" strokeWidth="1" />
              </pattern>
              {/* Cyan gradient line */}
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Grid Fill */}
            <rect width="800" height="300" fill="url(#chassisGrid)" rx="12" />

            {/* Center Axis Lines */}
            <line x1="50" y1="160" x2="750" y2="160" stroke="rgba(34, 211, 238, 0.2)" strokeDasharray="4,4" strokeWidth="1" />

            {/* Aerodynamic Airflow Particles Visualizer */}
            <path
              d="M 50 140 Q 200 130, 300 110 T 600 110 T 750 150"
              fill="none"
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="8,6"
              className="animate-[dash_10s_linear_infinite]"
            />
            <path
              d="M 50 180 Q 200 190, 300 210 T 600 210 T 750 170"
              fill="none"
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="8,6"
              className="animate-[dash_12s_linear_infinite]"
            />

            {/* CAR CHASSIS SILHOUETTE WIREFRAME */}
            {/* Main Body Outer Frame */}
            <path
              d="M 80 160 
                 C 90 140, 130 120, 200 115 
                 L 320 100 
                 C 380 75, 520 75, 580 100 
                 L 660 115 
                 C 720 120, 750 140, 760 160 
                 C 750 180, 720 200, 660 205 
                 L 580 220 
                 C 520 245, 380 245, 320 220 
                 L 200 205 
                 C 130 200, 90 180, 80 160 Z"
              fill="rgba(15, 23, 42, 0.75)"
              stroke="url(#cyanGrad)"
              strokeWidth="2.5"
              className="transition-all duration-300"
            />

            {/* Cockpit Canopy Outline */}
            <path
              d="M 330 115 
                 C 370 90, 490 90, 530 115 
                 L 540 160 
                 L 530 205 
                 C 490 230, 370 230, 330 205 Z"
              fill="rgba(34, 211, 238, 0.08)"
              stroke="rgba(34, 211, 238, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />

            {/* Front Splitter Contour */}
            <path d="M 60 160 Q 75 125, 110 125 L 110 195 Q 75 195, 60 160 Z" fill="rgba(52, 211, 153, 0.15)" stroke="#34d399" strokeWidth="1.5" />

            {/* Rear Wing Winglet Outline */}
            <path d="M 720 110 L 760 110 L 765 210 L 720 210 Z" fill="rgba(192, 132, 252, 0.15)" stroke="#c084fc" strokeWidth="1.5" />

            {/* Front Wheels (Left & Right) */}
            <rect x="180" y="80" width="65" height="30" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <rect x="180" y="210" width="65" height="30" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />

            {/* Rear Wheels (Left & Right) */}
            <rect x="550" y="75" width="75" height="35" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <rect x="550" y="210" width="75" height="35" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />

            {/* Brake Discs Indicators */}
            <circle cx="212" cy="95" r="10" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="212" cy="225" r="10" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="587" cy="92" r="12" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="587" cy="227" r="12" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="3,2" />

            {/* Engine Block Contour */}
            <rect x="230" y="135" width="70" height="50" rx="8" fill="rgba(34, 211, 238, 0.15)" stroke="#22d3ee" strokeWidth="1.5" />
            <text x="265" y="164" fill="#22d3ee" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ENGINE</text>

            {/* HOTSPOT TARGET RETICLES WITH COLOR-CODED STATUS RINGS */}
            {hotspots.map((hs) => {
              const isSelected = activeHotspot === hs.id;
              return (
                <g
                  key={hs.id}
                  className="cursor-pointer group/reticle"
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
                  <line x1={hs.cx - 5} y1={hs.cy} x2={hs.cx + 5} y2={hs.cy} stroke="#fff" strokeWidth="1.5" />
                  <line x1={hs.cx} y1={hs.cy - 5} x2={hs.cx} y2={hs.cy + 5} stroke="#fff" strokeWidth="1.5" />
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
                className={`w-64 p-3 rounded-xl bg-slate-950/90 backdrop-blur-2xl border ${currentHotspotObj.color} shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                    {currentHotspotObj.icon}
                    <span>{currentHotspotObj.label}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${currentHotspotObj.ring.border}`}>
                    {currentHotspotObj.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mb-0.5">{currentHotspotObj.stat}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{currentHotspotObj.detail}</div>

                <button
                  onClick={() => onSelectStage && onSelectStage(currentHotspotObj.stage)}
                  className="mt-2.5 w-full py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Tune Module</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
