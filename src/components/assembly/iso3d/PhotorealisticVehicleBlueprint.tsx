// ============================================================================
// PHOTOREALISTIC SVG AUTOMOTIVE BLUEPRINT & CAD INSPECTOR
// ============================================================================
// Implements the 7-Layer SVG Material Pipeline:
// Layer 7: Micro-Detail (Machining marks, ARP 12-pt bolts, torque callouts)
// Layer 6: Ambient Occlusion (Contact shadows, depth occlusion planes)
// Layer 5: Specular Hotspots (High-contrast gloss highlights, edge chamfers)
// Layer 4: Directional Lighting (Azimuth 225°, Elevation 50° key lighting)
// Layer 3: Texture Overlays (feTurbulence grain, 2x2 Carbon Twill pattern)
// Layer 2: Material Gradients (5+ stop metallic, carbon, and optical gradients)
// Layer 1: Base Geometry (Axonometric 30° & Orthographic projected polygons)
// ============================================================================

import React, { useState, useId, memo } from 'react';
import {
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  Info,
  Shield,
  Eye,
  EyeOff,
  Cpu,
} from 'lucide-react';
import {
  MultiViewProjectionEngine,
  ProjectionViewType,
  RenderedBlueprintView,
} from '../../../exterior3d/projections/multiViewProjectionEngine';
import { VehicleDimensionalParams } from '../../../exterior3d/geometry/parametricHardpointSolver';

export interface PhotorealisticBlueprintProps {
  initialView?: ProjectionViewType;
  dimensions?: Partial<VehicleDimensionalParams>;
  className?: string;
}

export const PhotorealisticVehicleBlueprint: React.FC<PhotorealisticBlueprintProps> = memo(({
  initialView = 'ISOMETRIC_AXONOMETRIC',
  dimensions,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<ProjectionViewType>(initialView);
  const [selectedHardpointId, setSelectedHardpointId] = useState<string | null>(null);

  // 7-Layer Pipeline Toggles
  const [showLayer7MicroDetail, setShowLayer7MicroDetail] = useState(true);
  const [showLayer6AmbientOcclusion, setShowLayer6AmbientOcclusion] = useState(true);
  const [showLayer5SpecularHotspots, setShowLayer5SpecularHotspots] = useState(true);
  const [showLayer3Textures, setShowLayer3Textures] = useState(true);
  const [showCenterlines, setShowCenterlines] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showHardpoints, setShowHardpoints] = useState(true);

  const [vehicleDimensions, setVehicleDimensions] = useState<VehicleDimensionalParams>({
    wheelbaseMm: dimensions?.wheelbaseMm ?? 2820,
    frontTrackMm: dimensions?.frontTrackMm ?? 1600,
    rearTrackMm: dimensions?.rearTrackMm ?? 1620,
    rideHeightMm: dimensions?.rideHeightMm ?? 135,
    roofHeightMm: dimensions?.roofHeightMm ?? 1420,
    engineBayLengthMm: dimensions?.engineBayLengthMm ?? 980,
    cabinWidthMm: dimensions?.cabinWidthMm ?? 1840,
    frontOverhangMm: dimensions?.frontOverhangMm ?? 860,
    rearOverhangMm: dimensions?.rearOverhangMm ?? 980,
  });

  const blueprint: RenderedBlueprintView = MultiViewProjectionEngine.renderBlueprint(
    activeView,
    vehicleDimensions,
    {
      showCenterlines,
      showDimensionCallouts: showDimensions,
      showHardpointNodes: showHardpoints,
      showFastenerTorqueLabels: showLayer7MicroDetail,
      canvasWidthPx: 940,
      canvasHeightPx: 560,
      centerOriginPx: { x: 500, y: 320 },
    }
  );

  const views: { id: ProjectionViewType; label: string; badge: string }[] = [
    { id: 'ISOMETRIC_AXONOMETRIC', label: '30° Isometric Axonometric', badge: '3D ISO' },
    { id: 'SIDE_PROFILE', label: 'Side Elevation (Datum Y-Z)', badge: 'SIDE' },
    { id: 'TOP_PLAN', label: 'Plan View (Datum X-Z)', badge: 'TOP' },
    { id: 'FRONT_ELEVATION', label: 'Front Elevation (Datum X-Y)', badge: 'FRONT' },
  ];

  const uniqueFilterId = useId().replace(/:/g, '-');

  return (
    <div className={`flex flex-col h-full bg-[#080c14] text-slate-100 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden font-sans dark-surface dark-hud cad-hud ${className}`}>
      {/* ── TOP HEADER TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase">
                7-Layer Photorealistic CAD Blueprint
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                DIN ISO 1101
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Key Light Azimuth 225° / Elev 50° · 2x2 Carbon Weave · Specular Hotspots
            </p>
          </div>
        </div>

        {/* View Switcher Ribbon */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
          {views.map((v) => {
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`spring-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus-visible:outline-none focus-ring-emil ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[10px] font-mono opacity-80">{v.badge}</span>
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* SVG RENDER CANVAS */}
        <div className="flex-1 relative bg-[#060910] flex items-center justify-center p-4 overflow-hidden">
          <svg
            viewBox={blueprint.viewBox}
            className="w-full h-full max-h-[580px] rounded-xl border border-slate-800/70 bg-gradient-to-b from-[#090e1a] to-[#04060b] shadow-2xl"
          >
            {/* ── 7-LAYER SVG PIPELINE DEFS (Lighting, Carbon Weave, Metal Grain, Gradients) ── */}
            <defs>
              {/* ISO CAD Grid */}
              <pattern id={`cad-grid-${uniqueFilterId}`} width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="0.75" />
                <circle cx="25" cy="25" r="0.8" fill="rgba(251, 191, 36, 0.15)" />
              </pattern>

              {/* Layer 3: 2x2 Twill Carbon Weave Pattern */}
              <pattern id={`pat-carbon-twill-${uniqueFilterId}`} width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#0c1017" />
                <path d="M 0 0 L 6 6 M 6 0 L 12 6 M 0 6 L 6 12 M 6 6 L 12 12" stroke="#1e293b" strokeWidth="2.5" />
                <path d="M 3 3 L 9 9 M 9 3 L 3 9" stroke="#334155" strokeWidth="1.2" opacity="0.6" />
              </pattern>

              {/* Layer 4: Global Directional Lighting Filter (Azimuth 225°, Elevation 50°) */}
              <filter id={`light-azimuth-225-${uniqueFilterId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting
                  in="blur"
                  surfaceScale="3"
                  specularConstant="1.2"
                  specularExponent="20"
                  result="specular"
                >
                  <feDistantLight azimuth="225" elevation="50" />
                </feSpecularLighting>
                <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular-cut" />
                <feComposite in="SourceGraphic" in2="specular-cut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
              </filter>

              {/* Layer 3: Brushed Metal Micro-Texture Grain */}
              <filter id={`metal-grain-${uniqueFilterId}`} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04 0.95" numOctaves="2" result="noise" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0.15 0" />
                <feComposite in2="SourceGraphic" in="noise" operator="in" />
              </filter>

              {/* Layer 6: Contact AO Drop Shadow Filter */}
              <filter id={`ao-shadow-${uniqueFilterId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                <feOffset dx="0" dy="12" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.75" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Layer 2: 5-Stop Automotive Carbon Monocoque Gradient */}
              <linearGradient id={`grad-carbon-${uniqueFilterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="25%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="75%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Layer 2: 5-Stop Billet Aluminum Gradient */}
              <linearGradient id={`grad-billet-alu-${uniqueFilterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="20%" stopColor="#94a3b8" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Layer 2: Optical Glass Canopy Refraction Gradient */}
              <linearGradient id={`grad-glass-${uniqueFilterId}`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                <stop offset="35%" stopColor="rgba(14, 165, 233, 0.15)" />
                <stop offset="70%" stopColor="rgba(2, 132, 199, 0.05)" />
                <stop offset="100%" stopColor="rgba(125, 211, 252, 0.35)" />
              </linearGradient>

              {/* Layer 5: High-Contrast Specular Chamfer Radial Hotspot */}
              <radialGradient id={`specular-hotspot-${uniqueFilterId}`} cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#fef08a" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill={`url(#cad-grid-${uniqueFilterId})`} />

            {/* ── LAYER 6: AMBIENT OCCLUSION (Chassis Ground Plane Contact Shadow) ── */}
            {showLayer6AmbientOcclusion && (
              <g id="layer-6-ambient-occlusion" opacity="0.85">
                <ellipse
                  cx="500"
                  cy="435"
                  rx="380"
                  ry="48"
                  fill="#000000"
                  filter={`url(#ao-shadow-${uniqueFilterId})`}
                  opacity="0.75"
                />
                <ellipse
                  cx="500"
                  cy="435"
                  rx="260"
                  ry="25"
                  fill="#000000"
                  opacity="0.85"
                />
              </g>
            )}

            {/* ── LAYER 1-3: BASE GEOMETRY + MATERIAL GRADIENT + TEXTURE ── */}
            <g
              id="layer-1-3-geometry-material"
              filter={showLayer3Textures ? `url(#light-azimuth-225-${uniqueFilterId})` : undefined}
            >
              {/* Primary Vehicle Silhouette / Chassis Rails */}
              {blueprint.paths.map((p) => {
                const isOutline = p.id.includes('OUTLINE') || p.id.includes('SILHOUETTE');
                return (
                  <g key={p.id}>
                    {/* Layer 2 / 3 Textured Fill */}
                    {isOutline && (
                      <path
                        d={p.d}
                        fill={showLayer3Textures ? `url(#pat-carbon-twill-${uniqueFilterId})` : `url(#grad-carbon-${uniqueFilterId})`}
                        opacity={0.92}
                      />
                    )}
                    {/* Outline Stroke */}
                    <path
                      d={p.d}
                      stroke={isOutline ? '#fbbf24' : p.strokeColor}
                      strokeWidth={isOutline ? 2.2 : p.strokeWidth}
                      fill={isOutline ? 'none' : p.fillColor}
                      strokeDasharray={p.strokeDashArray}
                      opacity={p.opacity ?? 1.0}
                    />
                  </g>
                );
              })}
            </g>

            {/* ── LAYER 5: SPECULAR HOTSPOTS & CHAMFER HIGHLIGHTS ── */}
            {showLayer5SpecularHotspots && (
              <g id="layer-5-specular-hotspots">
                {/* Roofline Specular Highlight */}
                <path
                  d="M 320 220 Q 480 205 660 250"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                {/* Cowl Edge Specular */}
                <path
                  d="M 280 260 L 390 245"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="1.8"
                  opacity="0.75"
                />
                {/* Radial Hotspot on Front Hood */}
                <circle
                  cx="360"
                  cy="270"
                  r="28"
                  fill={`url(#specular-hotspot-${uniqueFilterId})`}
                  opacity="0.7"
                />
              </g>
            )}

            {/* ── LAYER 7: MICRO-DETAIL & MACHINING MARKS ── */}
            {showLayer7MicroDetail && (
              <g id="layer-7-micro-detail">
                {/* CNC Milling Lines on Subframe Rails */}
                <line x1="420" y1="380" x2="580" y2="380" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3, 3" opacity="0.6" />
                <line x1="420" y1="384" x2="580" y2="384" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3, 3" opacity="0.6" />
                <line x1="420" y1="388" x2="580" y2="388" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3, 3" opacity="0.6" />

                {/* ARP 12-Pt Fastener Markers */}
                <circle cx="430" cy="384" r="3.2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
                <circle cx="570" cy="384" r="3.2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
              </g>
            )}

            {/* Dimension Lines */}
            {showDimensions && blueprint.dimensionLines.map((d) => (
              <path
                key={d.id}
                d={d.d}
                stroke="#38bdf8"
                strokeWidth={d.strokeWidth}
                fill={d.fillColor}
                opacity={0.8}
              />
            ))}

            {/* Dimension Callout Labels */}
            {showDimensions && blueprint.labels.map((l, i) => (
              <text
                key={i}
                x={l.x}
                y={l.y}
                fill={l.fillColor}
                fontSize={l.fontSize}
                textAnchor={l.textAnchor}
                className="font-mono select-none"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
              >
                {l.text}
              </text>
            ))}

            {/* Hardpoint Nodes & Fastener Torque Callouts */}
            {showHardpoints && blueprint.hardpointMarkers.map((hp) => {
              const isSelected = selectedHardpointId === hp.id;
              return (
                <g
                  key={hp.id}
                  className="cursor-pointer transition-transform duration-150 hover:scale-125"
                  onClick={() => setSelectedHardpointId(hp.id)}
                >
                  <circle
                    cx={hp.x}
                    cy={hp.y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#38bdf8' : '#fbbf24'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    style={{ filter: isSelected ? 'drop-shadow(0 0 8px #38bdf8)' : 'drop-shadow(0 0 4px #fbbf24)' }}
                  />
                  <circle
                    cx={hp.x}
                    cy={hp.y}
                    r={isSelected ? 11 : 7}
                    fill="none"
                    stroke={isSelected ? 'rgba(56,189,248,0.6)' : 'rgba(251,191,24,0.3)'}
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </svg>

          {/* Quick HUD Overlays */}
          <div className="absolute bottom-6 left-6 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800/80 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mr-1">
              7-Layer Pipeline:
            </span>
            <button
              onClick={() => setShowLayer7MicroDetail(!showLayer7MicroDetail)}
              className={`spring-press text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                showLayer7MicroDetail ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              L7 Micro
            </button>
            <button
              onClick={() => setShowLayer6AmbientOcclusion(!showLayer6AmbientOcclusion)}
              className={`spring-press text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                showLayer6AmbientOcclusion ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              L6 AO
            </button>
            <button
              onClick={() => setShowLayer5SpecularHotspots(!showLayer5SpecularHotspots)}
              className={`spring-press text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                showLayer5SpecularHotspots ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              L5 Specular
            </button>
            <button
              onClick={() => setShowLayer3Textures(!showLayer3Textures)}
              className={`spring-press text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                showLayer3Textures ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              L3 Carbon Weave
            </button>
          </div>
        </div>

        {/* ── RIGHT PARAMETRIC INSPECTOR SIDEBAR ── */}
        <div className="w-full lg:w-80 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800/80 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Active Hardpoint Telemetry */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                Hardpoint Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-500">DIN 1101</span>
            </div>
            {selectedHardpointId ? (
              <div>
                <div className="text-xs font-bold text-slate-100 font-mono mb-1">
                  {selectedHardpointId}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 font-mono">
                  <div>Zone: Front Suspension</div>
                  <div>Torque: 125 Nm</div>
                  <div>Tolerance: ±0.15 mm</div>
                  <div>Safety Factor: 2.8x</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click any hardpoint node on the blueprint to inspect geometric tolerances and fastener torques.
              </p>
            )}
          </div>

          {/* Quick Parametric Sliders */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wide">
                Dimensional Adjusters
              </span>
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Wheelbase</span>
                <span className="font-bold text-amber-400">{vehicleDimensions.wheelbaseMm} mm</span>
              </div>
              <input
                type="range"
                min="2400"
                max="3200"
                step="10"
                value={vehicleDimensions.wheelbaseMm}
                onChange={(e) =>
                  setVehicleDimensions({ ...vehicleDimensions, wheelbaseMm: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Ride Height</span>
                <span className="font-bold text-amber-400">{vehicleDimensions.rideHeightMm} mm</span>
              </div>
              <input
                type="range"
                min="80"
                max="220"
                step="5"
                value={vehicleDimensions.rideHeightMm}
                onChange={(e) =>
                  setVehicleDimensions({ ...vehicleDimensions, rideHeightMm: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Cabin Width</span>
                <span className="font-bold text-amber-400">{vehicleDimensions.cabinWidthMm} mm</span>
              </div>
              <input
                type="range"
                min="1600"
                max="2100"
                step="10"
                value={vehicleDimensions.cabinWidthMm}
                onChange={(e) =>
                  setVehicleDimensions({ ...vehicleDimensions, cabinWidthMm: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PhotorealisticVehicleBlueprint.displayName = 'PhotorealisticVehicleBlueprint';
