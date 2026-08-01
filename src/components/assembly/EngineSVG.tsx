import { ComponentId, AssemblyPhase, ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";
import { EngineConfig } from "../../sim/types";

interface EngineSVGProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  layout?: string;
  engineConfig?: Partial<EngineConfig>;
  className?: string;
}

export function EngineSVG({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
  engineConfig,
  className = "",
}: EngineSVGProps) {

  // Helper to determine component visibility, exploded offset, or active highlight state
  const getPartState = (id: ComponentId) => {
    const isInstalled = installedComponents.includes(id);
    const isActive = activeComponentId === id;
    const isHovered = hoveredComponentId === id;
    const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === id);

    let offsetX = 0;
    let offsetY = 0;
    let opacity = 1;

    if (!isInstalled && !isActive) {
      if (isExplodedView && meta) {
        offsetX = meta.explodedOffset.x;
        offsetY = meta.explodedOffset.y;
        opacity = 0.55;
      } else {
        opacity = 0.15;
      }
    }

    return {
      isInstalled,
      isActive,
      isHovered,
      offsetX,
      offsetY,
      opacity,
      meta,
    };
  };

  const blockState = getPartState("block");
  const crankState = getPartState("crankshaft");
  const pistonState = getPartState("pistons");
  const rodState = getPartState("rods");
  const panState = getPartState("oil_pan");
  const gasketState = getPartState("head_gasket");
  const headState = getPartState("cylinder_head");
  const camState = getPartState("camshaft");
  const valveState = getPartState("valves");
  const intakeState = getPartState("intake_manifold");
  const exhaustState = getPartState("exhaust_headers");
  const turboState = getPartState("turbocharger");

  // Active spotlight location
  const activeMeta = activeComponentId ? ENGINE_ASSEMBLY_COMPONENTS.find(c => c.id === activeComponentId) : null;
  const spotlightX = activeMeta ? activeMeta.slotPosition.x : 250;
  const spotlightY = activeMeta ? activeMeta.slotPosition.y : 225;

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      {/* Laser Target Reticle Overlay */}
      {activeComponentId && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="w-56 h-56 border border-amber-500/50 rounded-full animate-ping opacity-35" />
          <div className="absolute w-80 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="absolute h-80 w-[1px] bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />
        </div>
      )}

      <svg
        viewBox="0 0 500 450"
        className="w-full h-full max-h-[500px] overflow-visible filter drop-shadow-[0_20px_45px_rgba(100,60,40,0.25)]"
      >
        {/* CAD Engineering Background Grid Overlay */}
        <rect width="500" height="450" fill="url(#cad-grid)" className="pointer-events-none" />

        <defs>
          {/* ── 1. PHOTOREALISTIC METALLIC & MATERIAL GRADIENTS ── */}
          {/* CNC Brushed Aluminum Cylinder Head */}
          <linearGradient id="brushed-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="12%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="92%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Slate Blue Cast Iron Engine Block */}
          <linearGradient id="slate-block" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5b708b" />
            <stop offset="25%" stopColor="#415671" />
            <stop offset="60%" stopColor="#2c3b4e" />
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          {/* Anodized Steel-Blue/Gunmetal Pistons */}
          <linearGradient id="blue-piston" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7da2ca" />
            <stop offset="18%" stopColor="#50759e" />
            <stop offset="55%" stopColor="#325073" />
            <stop offset="85%" stopColor="#1c334d" />
            <stop offset="100%" stopColor="#0d1b2a" />
          </linearGradient>

          {/* Forged Steel Connecting Rods & Crankshaft */}
          <linearGradient id="forged-steel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#8a95a5" />
            <stop offset="82%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* 3D Round Cylindrical Pipe Gradient for Aluminum Intake */}
          <linearGradient id="pipe-cylinder-3d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#f1f5f9" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="82%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Blue Silicone Hose Couplers */}
          <linearGradient id="blue-silicone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="30%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="90%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Heat-Treated Copper Exhaust Runners */}
          <linearGradient id="copper-heat-treated" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="15%" stopColor="#ffedd5" />
            <stop offset="40%" stopColor="#fb923c" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="88%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>

          {/* Polished Stainless Steel Downpipe */}
          <linearGradient id="stainless-downpipe" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#64748b" />
            <stop offset="88%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Cast Aluminum Turbo Housing */}
          <linearGradient id="turbo-housing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="88%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Golden Impeller Wheel Hub */}
          <linearGradient id="gold-hub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Subtle Thin Copper Head Gasket */}
          <linearGradient id="copper-gasket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="50%" stopColor="#b8834a" />
            <stop offset="100%" stopColor="#8b6332" />
          </linearGradient>

          {/* Inner Cylinder Bore Depth Gradient */}
          <linearGradient id="bore-depth-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="15%" stopColor="#111827" />
            <stop offset="50%" stopColor="#0a0f1d" />
            <stop offset="85%" stopColor="#111827" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Combustion Chamber Flame Glow Gradient */}
          <radialGradient id="combustion-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f97316" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#dc2626" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>

          {/* Airflow Velocity Streamline Gradient */}
          <linearGradient id="intake-airflow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          {/* ── 2. SVG TEXTURE PATTERNS ── */}
          <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.12" />
          </pattern>

          <pattern id="honing-crosshatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="0.8" opacity="0.45" />
            <line x1="0" y1="0" x2="8" y2="0" stroke="#475569" strokeWidth="0.8" opacity="0.45" />
          </pattern>

          {/* ── 3. SPECULAR & DEEP DROP SHADOW FILTERS ── */}
          <filter id="soft-shadow-3d" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="3" dy="10" stdDeviation="8" floodColor="#3c2415" floodOpacity="0.35" />
          </filter>

          <filter id="heat-shimmer-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
              <animate attributeName="baseFrequency" values="0.04;0.07;0.04" dur="2s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Studio Lighting Ambient Glow Circle */}
        {activeComponentId && (
          <circle
            cx={spotlightX}
            cy={spotlightY}
            r="160"
            fill="url(#brushed-head)"
            opacity="0.12"
            className="transition-all duration-700 ease-out"
          >
            <animate attributeName="r" values="140;170;140" dur="3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* ── 1. ENGINE BLOCK (Slate Blue Cast Iron Base with 3D Ribs & Lugs) ── */}
        <g
          id="block"
          className={`transition-all duration-700 ease-out ${
            blockState.isActive ? "filter-glow-active" : ""
          } ${!blockState.isInstalled && isExplodedView ? "animate-pulse" : ""}`}
          style={{
            transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
            opacity: blockState.opacity,
          }}
          filter={blockState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Billet Oil Dipstick Tube & Yellow Pull Handle */}
          <g>
            <path d="M 146 235 C 130 235 118 215 114 185" fill="none" stroke="url(#pipe-cylinder-3d)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="114" cy="180" r="5" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
          </g>

          {/* Main Slate Blue Block Shell */}
          <path
            d="M 148 148 L 352 148 Q 356 148 356 154 L 356 302 Q 356 310 344 310 L 156 310 Q 144 310 144 302 L 144 154 Q 144 148 148 148 Z"
            fill="url(#slate-block)"
            stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#2c3b4e"}
            strokeWidth="2.5"
          />

          {/* Heavy Duty Block Side Mounting Lugs */}
          <g fill="#253346" stroke="#172230" strokeWidth="1.5">
            <rect x="134" y="174" width="12" height="28" rx="3" />
            <circle cx="140" cy="188" r="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />

            <rect x="134" y="238" width="12" height="28" rx="3" />
            <circle cx="140" cy="252" r="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />

            <rect x="354" y="174" width="12" height="28" rx="3" />
            <circle cx="360" cy="188" r="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />

            <rect x="354" y="238" width="12" height="28" rx="3" />
            <circle cx="360" cy="252" r="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          </g>

          {/* Horizontal Reinforcement Structural Ribs */}
          <line x1="145" y1="185" x2="355" y2="185" stroke="#1e293b" strokeWidth="2.5" opacity="0.6" />
          <line x1="145" y1="215" x2="355" y2="215" stroke="#1e293b" strokeWidth="2.5" opacity="0.6" />
          <line x1="145" y1="265" x2="355" y2="265" stroke="#1e293b" strokeWidth="2.5" opacity="0.6" />

          {/* Oil Gallery Threaded Plugs */}
          <circle cx="152" cy="165" r="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1" />
          <circle cx="152" cy="290" r="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1" />

          {/* 4 Precision Cylinder Bores */}
          {[172, 212, 252, 292].map((xPos, idx) => (
            <g key={`bore-${idx}`}>
              <rect x={xPos} y="158" width="36" height="124" rx="4" fill="#0c1322" stroke="#1e2d42" strokeWidth="2" />
              <rect x={xPos + 1} y="159" width="34" height="122" fill="url(#honing-crosshatch)" />
              {/* Cylinder Bore Wall Highlights */}
              <line x1={xPos + 1} y1="158" x2={xPos + 1} y2="282" stroke="#64748b" strokeWidth="1.2" opacity="0.6" />
              <line x1={xPos + 35} y1="158" x2={xPos + 35} y2="282" stroke="#334155" strokeWidth="1.2" opacity="0.6" />
            </g>
          ))}

          {/* Laser Debossed Engine Block Text */}
          <text
            x="250"
            y="242"
            fill="#1e293b"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="900"
            letterSpacing="2.5"
            opacity="0.9"
          >
            ENGINE BLOCK (CAST STEEL)
          </text>
        </g>

        {/* ── 2. FORGED STEEL CRANKSHAFT WITH DETAILED COUNTERWEIGHTS & SNOUT ── */}
        <g
          id="crankshaft"
          className={`transition-all duration-700 ease-out ${
            crankState.isActive ? "filter-glow-active" : ""
          }`}
          style={{
            transform: `translate(${crankState.offsetX}px, ${crankState.offsetY}px)`,
            opacity: crankState.opacity,
          }}
          filter={crankState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Main Forged Crank Shaft Axis */}
          <path
            d="M 90 305 L 375 305"
            fill="none"
            stroke="url(#forged-steel)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Polished Main Journals */}
          {[168, 208, 250, 290, 332].map((xPos, idx) => (
            <g key={`journal-${idx}`}>
              <rect x={xPos} y="296" width="14" height="18" rx="2" fill="url(#pipe-cylinder-3d)" stroke="#475569" strokeWidth="1" />
              <line x1={xPos + 2} y1="298" x2={xPos + 12} y2="298" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            </g>
          ))}

          {/* 4 Swept D-Shaped Counterweight Webs with Drill Holes */}
          {[
            { cx: 190, cy: 320, rot: 0 },
            { cx: 230, cy: 290, rot: 180 },
            { cx: 270, cy: 320, rot: 0 },
            { cx: 310, cy: 290, rot: 180 },
          ].map((cw, idx) => (
            <g key={`counterweight-${idx}`}>
              <path
                d={`M ${cw.cx - 20} ${cw.cy - 8} Q ${cw.cx} ${cw.cy + 24} ${cw.cx + 20} ${cw.cy - 8} Z`}
                fill="url(#forged-steel)"
                stroke="#334155"
                strokeWidth="1.8"
              />
              {/* Precision Weight Balance Drill Holes */}
              <circle cx={cw.cx - 8} cy={cw.cy + 6} r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              <circle cx={cw.cx + 8} cy={cw.cy + 6} r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              <circle cx={cw.cx} cy={cw.cy + 12} r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            </g>
          ))}

          {/* Left Extended Crankshaft Snout (3 Stepped Diameter Sections) */}
          <g fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.2">
            {/* Step 1: Main Seal Journal */}
            <rect x="126" y="297" width="18" height="16" rx="2" />
            {/* Step 2: Timing Gear Journal */}
            <rect x="106" y="299" width="20" height="12" rx="2" />
            {/* Step 3: Keyed Snout Tip */}
            <rect x="85" y="301" width="21" height="8" rx="1.5" />
          </g>
          {/* Keyway Slot */}
          <rect x="90" y="303" width="10" height="4" fill="#0f172a" rx="1" />

          {/* Right Flywheel Flange with 6-Bolt Circle Pattern */}
          <g>
            <rect x="352" y="288" width="18" height="34" rx="3" fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.5" />
            <circle cx="361" cy="293" r="2" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
            <circle cx="361" cy="301" r="2" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
            <circle cx="361" cy="309" r="2" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
            <circle cx="361" cy="317" r="2" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
            {/* Ring Gear Starter Teeth */}
            <line x1="369" y1="288" x2="369" y2="322" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        </g>

        {/* ── 3. FORGED STEEL H-BEAM CONNECTING RODS ── */}
        <g
          id="rods"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${rodState.offsetX}px, ${rodState.offsetY}px)`,
            opacity: rodState.opacity,
          }}
        >
          {[
            { x: 184, y: 194, h: 104 },
            { x: 224, y: 184, h: 104 },
            { x: 264, y: 194, h: 104 },
            { x: 304, y: 184, h: 104 },
          ].map((rod, idx) => (
            <g key={`rod-${idx}`}>
              {/* Forged Steel H-Beam Shank */}
              <rect x={rod.x} y={rod.y} width="12" height={rod.h} rx="4" fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.5" />
              {/* Recessed H-Beam Center Channel */}
              <rect x={rod.x + 2.5} y={rod.y + 10} width="7" height={rod.h - 22} rx="1.5" fill="#172230" />
              {/* Small-End Wrist Pin Bushing (Bronze) */}
              <circle cx={rod.x + 6} cy={rod.y + 5} r="4" fill="none" stroke="#b45309" strokeWidth="1.5" />
              {/* Big-End Rod Cap Split Line & ARP Fasteners */}
              <line x1={rod.x} y1={rod.y + rod.h - 10} x2={rod.x + 12} y2={rod.y + rod.h - 10} stroke="#0f172a" strokeWidth="1.5" />
              <circle cx={rod.x + 2.5} cy={rod.y + rod.h - 5} r="1.8" fill="#ffffff" stroke="#334155" strokeWidth="0.8" />
              <circle cx={rod.x + 9.5} cy={rod.y + rod.h - 5} r="1.8" fill="#ffffff" stroke="#334155" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* ── 4. ANODIZED GUNMETAL/BLUE PISTONS WITH RING LANDS ── */}
        <g
          id="pistons"
          className={`transition-all duration-700 ease-out ${
            isAssemblyComplete ? "animate-piston-cycle" : ""
          }`}
          style={{
            transform: `translate(${pistonState.offsetX}px, ${pistonState.offsetY}px)`,
            opacity: pistonState.opacity,
          }}
          filter={pistonState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {[
            { x: 174, y: 162, h: 40 },
            { x: 214, y: 152, h: 40 },
            { x: 254, y: 162, h: 40 },
            { x: 294, y: 152, h: 40 },
          ].map((p, idx) => (
            <g key={`piston-${idx}`}>
              {/* Metallic Anodized Crown & Skirt */}
              <rect x={p.x} y={p.y} width="32" height={p.h} rx="5" fill="url(#blue-piston)" stroke="#1e3a5f" strokeWidth="2" />
              {/* Crown Top Bevel Specular Highlight */}
              <line x1={p.x + 2} y1={p.y + 2} x2={p.x + 30} y2={p.y + 2} stroke="#94b8d4" strokeWidth="1.8" />
              {/* 3 Distinct Compression & Oil Scraper Rings */}
              <line x1={p.x} y1={p.y + 8} x2={p.x + 32} y2={p.y + 8} stroke="#f8fafc" strokeWidth="1.2" />
              <line x1={p.x} y1={p.y + 14} x2={p.x + 32} y2={p.y + 14} stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1={p.x} y1={p.y + 20} x2={p.x + 32} y2={p.y + 20} stroke="#0f172a" strokeWidth="1.5" />
              {/* Wrist Pin Bore & Hollow Pin */}
              <circle cx={p.x + 16} cy={p.y + 28} r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx={p.x + 16} cy={p.y + 28} r="2.5" fill="#475569" />
            </g>
          ))}
        </g>

        {/* ── 5. SUBTLE COPPER HEAD GASKET ── */}
        <g
          id="head_gasket"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${gasketState.offsetX}px, ${gasketState.offsetY}px)`,
            opacity: gasketState.opacity,
          }}
        >
          <rect x="142" y="144" width="216" height="5" rx="2" fill="url(#copper-gasket)" stroke="#9a3412" strokeWidth="0.8" opacity="0.95" />
        </g>

        {/* ── 6. BRUSHED ALUMINUM CNC CYLINDER HEAD (Wider Body & Domes) ── */}
        <g
          id="cylinder_head"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${headState.offsetX}px, ${headState.offsetY}px)`,
            opacity: headState.opacity,
          }}
          filter={headState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Spark Plugs & Ignition Coil Packs */}
          {[190, 230, 270, 310].map((spx, idx) => (
            <g key={`sparkplug-${idx}`}>
              <rect x={spx - 3} y="44" width="6" height="16" rx="1.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <rect x={spx - 4} y="42" width="8" height="4" rx="1" fill="#1e293b" />
              <line x1={spx} y1="36" x2={spx} y2="42" stroke="#ea580c" strokeWidth="1.5" />
            </g>
          ))}

          {/* Main Brushed Aluminum Cylinder Head Block */}
          <rect
            x="142"
            y="58"
            width="216"
            height="86"
            rx="8"
            fill="url(#brushed-head)"
            stroke={headState.isHovered || headState.isActive ? "#38bdf8" : "#94a3b8"}
            strokeWidth="2.5"
          />
          {/* Top Edge Bevel & Machined Flange Lip */}
          <line x1="142" y1="62" x2="358" y2="62" stroke="#ffffff" strokeWidth="2" />

          {/* 4 Combustion Dome Cutout Scallops along bottom edge */}
          {[190, 230, 270, 310].map((cx, idx) => (
            <g key={`dome-${idx}`}>
              <path d={`M ${cx - 15} 144 A 15 15 0 0 1 ${cx + 15} 144 Z`} fill="#1e293b" opacity="0.3" />
              {isAssemblyComplete && (
                <path d={`M ${cx - 15} 144 A 15 15 0 0 1 ${cx + 15} 144 Z`} fill="url(#combustion-glow)" className="animate-pulse" />
              )}
            </g>
          ))}

          {/* Recessed Deck Hex Bolts Across Top Rim */}
          {[158, 192, 226, 260, 294, 328, 345].map((bx, idx) => (
            <circle key={`head-bolt-${idx}`} cx={bx} cy="66" r="3.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          ))}

          {/* Laser Debossed Typography */}
          <text
            x="250"
            y="105"
            fill="#334155"
            fontSize="9.5"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="900"
            letterSpacing="2.5"
            opacity="0.95"
          >
            CYLINDER HEAD (CNC PORTED)
          </text>
        </g>

        {/* ── 7. DUAL VALVE SPRINGS, STEMS & MUSHROOM HEADS ── */}
        <g
          id="valves"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${valveState.offsetX}px, ${valveState.offsetY}px)`,
            opacity: valveState.opacity,
          }}
        >
          {[174, 184, 214, 224, 254, 264, 294, 304].map((vx, idx) => (
            <g key={`valve-${idx}`}>
              {/* Thick Stem */}
              <line x1={vx} y1="68" x2={vx} y2="136" stroke="#334155" strokeWidth="3.5" />
              <line x1={vx - 0.5} y1="68" x2={vx - 0.5} y2="136" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
              {/* Dual Valve Coil Springs */}
              {[78, 84, 90, 96, 102].map((sy, sidx) => (
                <line key={`spring-${sidx}`} x1={vx - 4} y1={sy} x2={vx + 4} y2={sy} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              ))}
              {/* Titanium Retainer Cap */}
              <rect x={vx - 5} y="71" width="10" height="5" rx="1.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
              {/* Mushroom Valve Disc Head */}
              <path d={`M ${vx - 7} 136 L ${vx + 7} 136 L ${vx + 3} 128 L ${vx - 3} 128 Z`} fill="#475569" stroke="#1e293b" strokeWidth="1" />
            </g>
          ))}
        </g>

        {/* ── 8. CAMSHAFTS & DRIVE SPROCKETS ── */}
        <g
          id="camshaft"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${camState.offsetX}px, ${camState.offsetY}px)`,
            opacity: camState.opacity,
          }}
        >
          {/* Dual Overhead Camshaft Sprocket Gears */}
          <circle cx="146" cy="72" r="9" fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 1.5" />
          <circle cx="146" cy="86" r="9" fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 1.5" />

          <line x1="150" y1="72" x2="350" y2="72" stroke="url(#forged-steel)" strokeWidth="9" strokeLinecap="round" />
          <line x1="150" y1="86" x2="350" y2="86" stroke="url(#forged-steel)" strokeWidth="9" strokeLinecap="round" />
        </g>

        {/* ── 9. DUAL Y-PIPE POLISHED ALUMINUM INTAKE & BLUE SILICONE COUPLERS ── */}
        <g
          id="intake_manifold"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${intakeState.offsetX}px, ${intakeState.offsetY}px)`,
            opacity: intakeState.opacity,
          }}
          filter={intakeState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Main Top Intake Runner (Curved Aluminum Pipe) */}
          <path
            d="M 60 76 C 90 76 110 82 142 82"
            fill="none"
            stroke="url(#pipe-cylinder-3d)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 60 76 C 90 76 110 82 142 82"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Main Bottom Intake Runner (Curved Aluminum Pipe) */}
          <path
            d="M 60 124 C 90 124 110 118 142 118"
            fill="none"
            stroke="url(#pipe-cylinder-3d)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 60 124 C 90 124 110 118 142 118"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Blue Silicone Hose Couplers with Stainless Clamps */}
          <g>
            <rect x="62" y="66" width="22" height="20" rx="4" fill="url(#blue-silicone)" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="64" y="67" width="4" height="18" fill="#f8fafc" />
            <rect x="78" y="67" width="4" height="18" fill="#f8fafc" />

            <rect x="62" y="114" width="22" height="20" rx="4" fill="url(#blue-silicone)" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="64" y="115" width="4" height="18" fill="#f8fafc" />
            <rect x="78" y="115" width="4" height="18" fill="#f8fafc" />
          </g>

          {/* Left Intake Inlet Flange */}
          <circle cx="102" cy="100" r="16" fill="url(#pipe-cylinder-3d)" stroke="#475569" strokeWidth="2" />
          <circle cx="102" cy="100" r="10" fill="#0f172a" />
        </g>

        {/* ── 10. GLOWING HEAT-TREATED COPPER EXHAUST RUNNERS ── */}
        <g
          id="exhaust_headers"
          className={`transition-all duration-700 ease-out ${
            isAssemblyComplete ? "filter-heat-shimmer" : ""
          }`}
          style={{
            transform: `translate(${exhaustState.offsetX}px, ${exhaustState.offsetY}px)`,
            opacity: exhaustState.opacity,
          }}
          filter={exhaustState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Top Primary Copper Runner */}
          <path
            d="M 358 82 C 385 82 405 95 415 118"
            fill="none"
            stroke="url(#copper-heat-treated)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Specular Highlight on Copper Tube */}
          <path
            d="M 358 80 C 385 80 405 93 415 116"
            fill="none"
            stroke="#ffedd5"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Bottom Primary Copper Runner */}
          <path
            d="M 358 128 C 385 128 405 125 415 120"
            fill="none"
            stroke="url(#copper-heat-treated)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Collector Merger Ring */}
          <circle cx="415" cy="119" r="10" fill="#ea580c" stroke="#7c2d12" strokeWidth="2" />
        </g>

        {/* ── 11. DETAILED TURBOCHARGER & STAINLESS DOWNPIPE LOOP ── */}
        <g
          id="turbocharger"
          className={`transition-all duration-700 ease-out ${
            isAssemblyComplete ? "filter-heat-shimmer" : ""
          }`}
          style={{
            transform: `translate(${turboState.offsetX}px, ${turboState.offsetY}px)`,
            opacity: turboState.opacity,
          }}
          filter={turboState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Looping Heavy-Duty Stainless Downpipe under Turbo */}
          <path
            d="M 415 155 C 420 185 440 215 425 230 C 405 240 375 230 365 205 C 358 190 358 175 362 165"
            fill="none"
            stroke="url(#stainless-downpipe)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 415 153 C 420 183 440 213 425 228 C 405 238 375 228 365 203"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Downpipe V-Band Clamps */}
          <circle cx="423" cy="165" r="10" fill="none" stroke="#f8fafc" strokeWidth="2.5" />
          <circle cx="364" cy="200" r="10" fill="none" stroke="#f8fafc" strokeWidth="2.5" />

          {/* Cast Aluminum Compressor Volute Housing */}
          <path
            d="M 405 110 C 445 80 475 125 445 160 C 415 168 392 142 405 110 Z"
            fill="url(#turbo-housing)"
            stroke={turboState.isHovered ? "#38bdf8" : "#475569"}
            strokeWidth="2.5"
          />

          {/* Impeller Wheel Well & Multi-Blade Rotor */}
          <g className={isAssemblyComplete ? "animate-spin-slow" : ""}>
            <circle cx="432" cy="132" r="18" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />
            <circle cx="432" cy="132" r="7" fill="url(#gold-hub)" />
            {/* 10 Curved Compressor Blades */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((ang, bidx) => (
              <line
                key={`blade-${bidx}`}
                x1={432 + 7 * Math.cos((ang * Math.PI) / 180)}
                y1={132 + 7 * Math.sin((ang * Math.PI) / 180)}
                x2={432 + 16 * Math.cos((ang * Math.PI) / 180)}
                y2={132 + 16 * Math.sin((ang * Math.PI) / 180)}
                stroke="#fef08a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Wastegate Actuator Canister & Control Arm */}
          <rect x="455" y="102" width="18" height="24" rx="4" fill="url(#pipe-cylinder-3d)" stroke="#334155" strokeWidth="1.5" />
          <line x1="442" y1="114" x2="455" y2="114" stroke="#94a3b8" strokeWidth="3" />
        </g>

        {/* ── 12. BRUSHED STEEL OIL PAN SUMP & RULER SCALE PLATE ── */}
        <g
          id="oil_pan"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${panState.offsetX}px, ${panState.offsetY}px)`,
            opacity: panState.opacity,
          }}
          filter={panState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
        >
          {/* Brushed Steel Oil Pan Sump Shell */}
          <path
            d="M 156 310 L 168 360 Q 172 368 184 368 L 316 368 Q 328 368 332 360 L 344 310 Z"
            fill="url(#pipe-cylinder-3d)"
            stroke={panState.isHovered ? "#38bdf8" : "#475569"}
            strokeWidth="2.5"
          />

          {/* Front Scale Recessed Calibration Plate */}
          <rect x="172" y="324" width="156" height="30" rx="5" fill="url(#forged-steel)" stroke="#334155" strokeWidth="1.5" />

          {/* Engraved Ruler Calibration Scale Ticks */}
          {[
            180, 186, 192, 198, 204, 210, 216, 222, 228, 234, 240, 246, 252, 258, 264, 270, 276, 282, 288, 294, 300, 306,
            312, 318, 324,
          ].map((tx, idx) => (
            <line
              key={`tick-${idx}`}
              x1={tx}
              y1="328"
              x2={tx}
              y2={idx % 5 === 0 ? "342" : "335"}
              stroke="#0f172a"
              strokeWidth={idx % 5 === 0 ? "1.8" : "1"}
            />
          ))}

          {/* Central Triangular Pointer Needle */}
          <polygon points="247,348 253,348 250,328" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />

          {/* Hex Oil Pan Drain Plug */}
          <circle cx="328" cy="360" r="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
