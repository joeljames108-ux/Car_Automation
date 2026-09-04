import React, { useState } from "react";
import { X, Layers, Ruler, Activity, Eye, Zap, EyeOff, ShieldCheck, Cog, Wind, Sofa } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface CinematicBlueprintXRayOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export type VehicleLayer = "body" | "aero" | "chassis" | "suspension" | "powertrain" | "interior";

export const CinematicBlueprintXRayOverlay: React.FC<CinematicBlueprintXRayOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeLayers, setActiveLayers] = useState<Record<VehicleLayer, boolean>>({
    body: true,
    aero: true,
    chassis: true,
    suspension: true,
    powertrain: true,
    interior: true,
  });

  const [explodedPercent, setExplodedPercent] = useState(0);
  const [stressHeatMap, setStressHeatMap] = useState(true);

  if (!isOpen) return null;

  const toggleLayer = (l: VehicleLayer) => {
    playHMIClickSound();
    setActiveLayers((prev) => ({ ...prev, [l]: !prev[l] }));
  };

  const layersList: { id: VehicleLayer; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "body", label: "Exterior Body Shell", icon: <Layers size={13} />, color: "#fbbf24" },
    { id: "aero", label: "Aerodynamic Appendages", icon: <Wind size={13} />, color: "#f59e0b" },
    { id: "chassis", label: "Carbon Monocoque & Subframe", icon: <ShieldCheck size={13} />, color: "#f59e0b" },
    { id: "suspension", label: "Double Wishbone Suspension", icon: <Activity size={13} />, color: "#10b981" },
    { id: "powertrain", label: "V8 Twin-Turbo Powertrain", icon: <Cog size={13} />, color: "#f59e0b" },
    { id: "interior", label: "OLED Cockpit & Carbon Seats", icon: <Sofa size={13} />, color: "#d97706" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-nh-materialize select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-amber-950/95 border-2 border-amber-500/40 p-6 shadow-[0_0_90px_rgba(6,182,212,0.3)] flex flex-col gap-5 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CAD Blueprint Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg">
              <Ruler size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-widest text-amber-300 font-mono">
                  CAD BLUEPRINT & X-RAY DIAGNOSTICS
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                  ISO 8855 CALIBRATED
                </span>
              </div>
              <p className="text-xs text-amber-300/60 font-mono">
                Multi-Layer Structural Peeling, Exploded Kinematics & FEA Stress Hotspots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Blueprint Canvas & CAD Dimension Diagram */}
        <div className="relative w-full aspect-[16/9] max-h-96 rounded-2xl border border-amber-500/30 bg-amber-950/80 overflow-hidden flex items-center justify-center">
          {/* Blueprint Grid Lines */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* SVG Vehicle Wireframe & Dimensions */}
          <svg className="w-full h-full p-6 overflow-visible" viewBox="0 0 600 320">
            {/* Centerline axes */}
            <line x1="20" y1="160" x2="580" y2="160" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="6 3" />
            <line x1="300" y1="20" x2="300" y2="300" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="6 3" />

            {/* Layer 1: Exterior Body Wireframe */}
            {activeLayers.body && (
              <path
                d="M 60 210 Q 120 205, 170 170 Q 220 90, 340 90 Q 420 90, 480 170 Q 510 205, 540 210 Z"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                transform={`translate(0, ${-explodedPercent * 0.4})`}
                className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              />
            )}

            {/* Layer 2: Aero Wings & Diffuser */}
            {activeLayers.aero && (
              <g transform={`translate(0, ${-explodedPercent * 0.7})`}>
                <rect x="40" y="210" width="40" height="8" rx="2" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <path d="M 500 110 L 535 90 L 540 100 L 505 120 Z" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <line x1="520" y1="100" x2="520" y2="160" stroke="#f59e0b" strokeWidth="1.5" />
              </g>
            )}

            {/* Layer 3: Spaceframe Chassis */}
            {activeLayers.chassis && (
              <g transform={`translate(0, 0)`}>
                <rect x="120" y="150" width="360" height="60" rx="8" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <line x1="180" y1="150" x2="260" y2="90" stroke="#f59e0b" strokeWidth="1.8" />
                <line x1="260" y1="90" x2="380" y2="90" stroke="#f59e0b" strokeWidth="1.8" />
                <line x1="380" y1="90" x2="440" y2="150" stroke="#f59e0b" strokeWidth="1.8" />
              </g>
            )}

            {/* Layer 4: Suspension & Wheels */}
            {activeLayers.suspension && (
              <g transform={`translate(0, ${explodedPercent * 0.5})`}>
                <circle cx="160" cy="210" r="32" fill="none" stroke="#10b981" strokeWidth="2" />
                <circle cx="440" cy="210" r="32" fill="none" stroke="#10b981" strokeWidth="2" />
                <line x1="160" y1="210" x2="180" y2="170" stroke="#10b981" strokeWidth="2" />
                <line x1="440" y1="210" x2="420" y2="170" stroke="#10b981" strokeWidth="2" />
              </g>
            )}

            {/* Layer 5: Powertrain V8 */}
            {activeLayers.powertrain && (
              <g transform={`translate(0, ${explodedPercent * 0.2})`}>
                <rect x="220" y="160" width="80" height="40" rx="4" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="260" cy="180" r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              </g>
            )}

            {/* Layer 6: Cockpit Seats */}
            {activeLayers.interior && (
              <g transform={`translate(0, ${-explodedPercent * 0.1})`}>
                <path d="M 330 190 L 330 140 Q 340 120, 360 120" fill="none" stroke="#d97706" strokeWidth="2" />
              </g>
            )}

            {/* Dimension Lines */}
            <g className="font-mono text-[9px] fill-cyan-300">
              {/* Wheelbase Dimension */}
              <line x1="160" y1="260" x2="440" y2="260" stroke="#f59e0b" strokeWidth="1" />
              <line x1="160" y1="250" x2="160" y2="270" stroke="#f59e0b" strokeWidth="1" />
              <line x1="440" y1="250" x2="440" y2="270" stroke="#f59e0b" strokeWidth="1" />
              <text x="300" y="255" textAnchor="middle">
                WHEELBASE: 2,720 mm
              </text>

              {/* Total Length Dimension */}
              <line x1="60" y1="290" x2="540" y2="290" stroke="#f59e0b" strokeWidth="1" />
              <line x1="60" y1="280" x2="60" y2="300" stroke="#f59e0b" strokeWidth="1" />
              <line x1="540" y1="280" x2="540" y2="300" stroke="#f59e0b" strokeWidth="1" />
              <text x="300" y="285" textAnchor="middle">
                OVERALL LENGTH: 4,680 mm
              </text>
            </g>

            {/* FEA Stress Hotspots */}
            {stressHeatMap && (
              <g>
                {[
                  [180, 150, "98 MPa", "#ef4444"],
                  [420, 150, "112 MPa", "#f97316"],
                  [260, 90, "64 MPa", "#eab308"],
                  [380, 90, "72 MPa", "#eab308"],
                ].map(([x, y, label, color], idx) => (
                  <g key={idx} transform={`translate(${x}, ${y})`}>
                    <circle r="6" fill={color as string} className="animate-ping" opacity="0.6" />
                    <circle r="4" fill={color as string} />
                    <text x="8" y="4" fontSize="8" fontFamily="monospace" fill={color as string} fontWeight="bold">
                      {label}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* Controls Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Layer Peeling Checkboxes */}
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/20 flex flex-col gap-2.5">
            <span className="font-mono text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5 mb-1">
              <Layers size={13} />
              <span>X-RAY LAYER VISIBILITY</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              {layersList.map((l) => {
                const isOn = activeLayers[l.id];
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLayer(l.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isOn
                        ? "bg-amber-500/15 text-white border-amber-400/40 shadow-sm"
                        : "bg-white/[0.03] text-amber-400/50 border-white/5 hover:bg-white/5"
                    }`}
                  >
                    {isOn ? <Eye size={12} className="text-amber-400" /> : <EyeOff size={12} />}
                    <span className="truncate">{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exploded View & FEA Stress Sliders */}
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/20 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-amber-300 font-bold mb-1.5">
                <span>EXPLODED KINEMATICS SEPARATION</span>
                <span>{explodedPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={explodedPercent}
                onChange={(e) => setExplodedPercent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  playHMIClickSound();
                  setStressHeatMap(!stressHeatMap);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  stressHeatMap
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-white/5 text-amber-300/60 border-white/10"
                }`}
              >
                <Activity size={13} className={stressHeatMap ? "text-rose-400 animate-pulse" : ""} />
                <span>FEA STRESS TENSOR HEAT MAP</span>
              </button>

              <button
                onClick={() => {
                  playHMIClickSound();
                  setActiveLayers({
                    body: true,
                    aero: true,
                    chassis: true,
                    suspension: true,
                    powertrain: true,
                    interior: true,
                  });
                  setExplodedPercent(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-amber-200/70 border border-white/10 cursor-pointer"
              >
                RESET CAD POSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
