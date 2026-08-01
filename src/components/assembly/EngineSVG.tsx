import { ComponentId, AssemblyPhase, ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";

interface EngineSVGProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  layout?: "i4" | "v6" | "v8";
  className?: string;
}

export function EngineSVG({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
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
        opacity = 0.55; // Floating transparent outline in exploded view
      } else {
        opacity = 0.15; // Hidden/ghost outline when not in exploded view
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

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      {/* Laser Target Reticle Overlay for Active Component Alignment */}
      {activeComponentId && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="w-48 h-48 border border-cyan-400/40 rounded-full animate-ping opacity-25" />
          <div className="absolute w-64 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute h-64 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
        </div>
      )}

      <svg
        viewBox="0 0 500 450"
        className="w-full h-full max-h-[500px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Metallic Gradients */}
          <linearGradient id="metal-block" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="metal-crank" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="metal-piston" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="copper-gasket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="turbo-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-active" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center Origin Reference Grid (subtle engineering crosshairs) */}
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4">
          <line x1="250" y1="20" x2="250" y2="430" />
          <line x1="20" y1="225" x2="480" y2="225" />
        </g>

        {/* ── 1. ENGINE BLOCK (Core Structural Hub) ── */}
        <g
          id="block"
          className={`transition-all duration-700 ease-out ${
            blockState.isActive ? "filter-glow-active" : ""
          } ${!blockState.isInstalled && isExplodedView ? "animate-pulse" : ""}`}
          style={{
            transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
            opacity: blockState.opacity,
          }}
        >
          {/* Main Block Shell */}
          <rect
            x="160"
            y="160"
            width="180"
            height="150"
            rx="12"
            fill="url(#metal-block)"
            stroke={blockState.isHovered || blockState.isActive ? "#22d3ee" : blockState.isInstalled ? "#475569" : "#334155"}
            strokeWidth={blockState.isHovered || blockState.isActive ? "3" : "2"}
            filter={blockState.isHovered ? "url(#glow-cyan)" : undefined}
          />
          {/* Cylinder Bores (4 inline bore sleeves) */}
          <rect x="175" y="170" width="32" height="110" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="215" y="170" width="32" height="110" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="253" y="170" width="32" height="110" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="293" y="170" width="32" height="110" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* Coolant Passages / Water Jacket Lines */}
          <circle cx="170" cy="180" r="3" fill="#0284c7" />
          <circle cx="330" cy="180" r="3" fill="#0284c7" />
          <circle cx="170" cy="260" r="3" fill="#0284c7" />
          <circle cx="330" cy="260" r="3" fill="#0284c7" />
          <text x="250" y="240" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            ENGINE BLOCK
          </text>
        </g>

        {/* ── 2. CRANKSHAFT & MAIN BEARINGS ── */}
        <g
          id="crankshaft"
          className={`transition-all duration-700 ease-out ${
            crankState.isActive ? "filter-glow-active" : ""
          }`}
          style={{
            transform: `translate(${crankState.offsetX}px, ${crankState.offsetY}px)`,
            opacity: crankState.opacity,
          }}
        >
          {/* Main Crank Shaft Axis */}
          <path
            d="M 165 310 Q 195 290 215 310 T 255 310 T 295 310 T 335 310"
            fill="none"
            stroke="url(#metal-crank)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Counterweights */}
          <circle cx="195" cy="322" r="16" fill="#475569" stroke={crankState.isHovered ? "#22d3ee" : "#334155"} strokeWidth="2" />
          <circle cx="235" cy="298" r="16" fill="#475569" stroke={crankState.isHovered ? "#22d3ee" : "#334155"} strokeWidth="2" />
          <circle cx="275" cy="322" r="16" fill="#475569" stroke={crankState.isHovered ? "#22d3ee" : "#334155"} strokeWidth="2" />
          <circle cx="315" cy="298" r="16" fill="#475569" stroke={crankState.isHovered ? "#22d3ee" : "#334155"} strokeWidth="2" />
          {/* Flywheel Ring Gear flange */}
          <rect x="150" y="295" width="12" height="30" rx="3" fill="#64748b" />
        </g>

        {/* ── 3. CONNECTING RODS ── */}
        <g
          id="rods"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${rodState.offsetX}px, ${rodState.offsetY}px)`,
            opacity: rodState.opacity,
          }}
        >
          {/* 4 H-Beam Connecting Rods linking Crankshaft to Pistons */}
          <rect x="187" y="210" width="8" height="80" rx="2" fill="#94a3b8" stroke="#475569" />
          <rect x="227" y="200" width="8" height="80" rx="2" fill="#94a3b8" stroke="#475569" />
          <rect x="265" y="210" width="8" height="80" rx="2" fill="#94a3b8" stroke="#475569" />
          <rect x="305" y="200" width="8" height="80" rx="2" fill="#94a3b8" stroke="#475569" />
        </g>

        {/* ── 4. PISTONS (Reciprocating Assemblies) ── */}
        <g
          id="pistons"
          className={`transition-all duration-700 ease-out ${
            isAssemblyComplete ? "animate-piston-cycle" : ""
          }`}
          style={{
            transform: `translate(${pistonState.offsetX}px, ${pistonState.offsetY}px)`,
            opacity: pistonState.opacity,
          }}
        >
          {/* Piston 1 */}
          <rect x="177" y="180" width="28" height="32" rx="4" fill="url(#metal-piston)" stroke={pistonState.isHovered ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
          <line x1="177" y1="186" x2="205" y2="186" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="177" y1="192" x2="205" y2="192" stroke="#0f172a" strokeWidth="1.5" />

          {/* Piston 2 */}
          <rect x="217" y="172" width="28" height="32" rx="4" fill="url(#metal-piston)" stroke={pistonState.isHovered ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
          <line x1="217" y1="178" x2="245" y2="178" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="217" y1="184" x2="245" y2="184" stroke="#0f172a" strokeWidth="1.5" />

          {/* Piston 3 */}
          <rect x="255" y="180" width="28" height="32" rx="4" fill="url(#metal-piston)" stroke={pistonState.isHovered ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
          <line x1="255" y1="186" x2="283" y2="186" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="255" y1="192" x2="283" y2="192" stroke="#0f172a" strokeWidth="1.5" />

          {/* Piston 4 */}
          <rect x="295" y="172" width="28" height="32" rx="4" fill="url(#metal-piston)" stroke={pistonState.isHovered ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
          <line x1="295" y1="178" x2="323" y2="178" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="295" y1="184" x2="323" y2="184" stroke="#0f172a" strokeWidth="1.5" />
        </g>

        {/* ── 5. OIL PAN / SUMP ── */}
        <g
          id="oil_pan"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${panState.offsetX}px, ${panState.offsetY}px)`,
            opacity: panState.opacity,
          }}
        >
          <path
            d="M 160 310 L 175 370 L 325 370 L 340 310 Z"
            fill="#1e293b"
            stroke={panState.isHovered ? "#22d3ee" : "#334155"}
            strokeWidth="2"
          />
          {/* Oil level fluid line */}
          <path d="M 180 355 L 320 355" stroke="#eab308" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
          {/* Drain plug */}
          <rect x="310" y="367" width="10" height="6" fill="#94a3b8" />
        </g>

        {/* ── 6. HEAD GASKET ── */}
        <g
          id="head_gasket"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${gasketState.offsetX}px, ${gasketState.offsetY}px)`,
            opacity: gasketState.opacity,
          }}
        >
          <rect x="155" y="152" width="190" height="8" rx="2" fill="url(#copper-gasket)" stroke="#c2410c" strokeWidth="1" />
          <circle cx="189" cy="156" r="6" fill="#0f172a" />
          <circle cx="229" cy="156" r="6" fill="#0f172a" />
          <circle cx="267" cy="156" r="6" fill="#0f172a" />
          <circle cx="307" cy="156" r="6" fill="#0f172a" />
        </g>

        {/* ── 7. CYLINDER HEAD ── */}
        <g
          id="cylinder_head"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${headState.offsetX}px, ${headState.offsetY}px)`,
            opacity: headState.opacity,
          }}
        >
          <rect
            x="155"
            y="70"
            width="190"
            height="80"
            rx="8"
            fill="url(#metal-block)"
            stroke={headState.isHovered || headState.isActive ? "#22d3ee" : "#475569"}
            strokeWidth="2"
          />
          {/* Combustion Domes */}
          <path d="M 175 150 A 16 16 0 0 1 207 150 Z" fill="#0f172a" />
          <path d="M 215 150 A 16 16 0 0 1 247 150 Z" fill="#0f172a" />
          <path d="M 253 150 A 16 16 0 0 1 285 150 Z" fill="#0f172a" />
          <path d="M 293 150 A 16 16 0 0 1 325 150 Z" fill="#0f172a" />
          <text x="250" y="115" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            CYLINDER HEAD
          </text>
        </g>

        {/* ── 8. VALVES & SPRINGS ── */}
        <g
          id="valves"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${valveState.offsetX}px, ${valveState.offsetY}px)`,
            opacity: valveState.opacity,
          }}
        >
          {/* Intake Valves (Cyan) */}
          <line x1="183" y1="90" x2="183" y2="140" stroke="#38bdf8" strokeWidth="3" />
          <polygon points="177,142 189,142 183,136" fill="#38bdf8" />

          <line x1="223" y1="90" x2="223" y2="140" stroke="#38bdf8" strokeWidth="3" />
          <polygon points="217,142 229,142 223,136" fill="#38bdf8" />

          {/* Exhaust Valves (Coral / Orange) */}
          <line x1="199" y1="90" x2="199" y2="140" stroke="#fb923c" strokeWidth="3" />
          <polygon points="193,142 205,142 199,136" fill="#fb923c" />

          <line x1="239" y1="90" x2="239" y2="140" stroke="#fb923c" strokeWidth="3" />
          <polygon points="233,142 245,142 239,136" fill="#fb923c" />
        </g>

        {/* ── 9. CAMSHAFTS ── */}
        <g
          id="camshaft"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${camState.offsetX}px, ${camState.offsetY}px)`,
            opacity: camState.opacity,
          }}
        >
          {/* Dual Overhead Camshaft Shafts */}
          <line x1="165" y1="80" x2="335" y2="80" stroke="url(#metal-crank)" strokeWidth="8" strokeLinecap="round" />
          {/* Cam Lobes */}
          <polygon points="183,72 187,88 179,88" fill="#cbd5e1" />
          <polygon points="223,72 227,88 219,88" fill="#cbd5e1" />
          <polygon points="263,72 267,88 259,88" fill="#cbd5e1" />
          <polygon points="303,72 307,88 299,88" fill="#cbd5e1" />
          {/* Cam Sprocket Gear */}
          <circle cx="160" cy="80" r="14" fill="#475569" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
        </g>

        {/* ── 10. INTAKE MANIFOLD ── */}
        <g
          id="intake_manifold"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${intakeState.offsetX}px, ${intakeState.offsetY}px)`,
            opacity: intakeState.opacity,
          }}
        >
          {/* Curved Runner Plenum Pipes */}
          <path
            d="M 60 110 L 110 110 C 140 110 145 95 155 95"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 60 110 L 110 110 C 140 110 145 125 155 125"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Throttle Body Body */}
          <rect x="45" y="95" width="20" height="30" rx="4" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="55" cy="110" r="6" fill="#38bdf8" />
        </g>

        {/* ── 11. EXHAUST HEADERS ── */}
        <g
          id="exhaust_headers"
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translate(${exhaustState.offsetX}px, ${exhaustState.offsetY}px)`,
            opacity: exhaustState.opacity,
          }}
        >
          {/* Tubular Collector Pipes */}
          <path
            d="M 345 95 C 360 95 380 120 410 130"
            fill="none"
            stroke="#f97316"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 345 125 C 360 125 380 130 410 130"
            fill="none"
            stroke="#ea580c"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Exhaust Collector Flange */}
          <rect x="405" y="118" width="12" height="24" rx="3" fill="#78350f" />
        </g>

        {/* ── 12. TURBOCHARGER ── */}
        <g
          id="turbocharger"
          className={`transition-all duration-700 ease-out ${
            turboState.isActive ? "animate-spin-slow" : ""
          }`}
          style={{
            transform: `translate(${turboState.offsetX}px, ${turboState.offsetY}px)`,
            opacity: turboState.opacity,
          }}
        >
          {/* Compressor Snail Housing */}
          <path
            d="M 410 180 C 440 150 460 190 430 210 C 410 220 395 195 410 180 Z"
            fill="url(#turbo-gold)"
            stroke={turboState.isHovered ? "#fbbf24" : "#d97706"}
            strokeWidth="2"
          />
          {/* Turbine Impeller Wheel */}
          <circle cx="425" cy="190" r="14" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
          <path d="M 425 180 L 425 200 M 415 190 L 435 190 M 418 183 L 432 197 M 418 197 L 432 183" stroke="#fbbf24" strokeWidth="2" />
          {/* Wastegate Actuator Canister */}
          <rect x="445" y="165" width="16" height="20" rx="3" fill="#64748b" />
          <line x1="435" y1="175" x2="445" y2="175" stroke="#94a3b8" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
