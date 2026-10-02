import React from "react";
import type { StageLoadingConfig } from "./stageLoadingData";

interface StageLoadingSchematicProps {
  config: StageLoadingConfig;
}

export const StageLoadingSchematics: React.FC<StageLoadingSchematicProps> = ({ config }) => {
  const { schematicType, accentColor } = config;

  switch (schematicType) {
    // ── 1. GLOBAL CAMPUS & HQ ──
    case "campus":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Isometric Campus Grid Base */}
          <g opacity="0.4" stroke={accentColor} strokeWidth="0.8">
            <line x1="70" y1="130" x2="270" y2="40" />
            <line x1="170" y1="175" x2="370" y2="85" />
            <line x1="270" y1="215" x2="470" y2="125" />
            <line x1="70" y1="130" x2="270" y2="215" strokeDasharray="3 3" />
            <line x1="170" y1="85" x2="370" y2="175" strokeDasharray="3 3" />
            <line x1="270" y1="40" x2="470" y2="125" strokeDasharray="3 3" />
          </g>

          {/* Cargo Railway Tracks */}
          <path d="M 40 160 L 220 205 L 500 120" stroke="#78716c" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M 40 160 L 220 205 L 500 120" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="6 6" />

          {/* Moving Railway Cargo Pulse */}
          <circle r="5" fill="#f59e0b">
            <animateMotion path="M 40 160 L 220 205 L 500 120" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Main HQ Executive Tower (Isometric) */}
          <g transform="translate(230, 50)">
            {/* Left face */}
            <path d="M 0 40 L 40 58 L 40 120 L 0 102 Z" fill={accentColor} fillOpacity="0.25" stroke={accentColor} strokeWidth="1.2" />
            {/* Right face */}
            <path d="M 40 58 L 80 40 L 80 102 L 40 120 Z" fill={accentColor} fillOpacity="0.4" stroke={accentColor} strokeWidth="1.2" />
            {/* Top roof */}
            <path d="M 0 40 L 40 22 L 80 40 L 40 58 Z" fill={accentColor} fillOpacity="0.7" stroke={accentColor} strokeWidth="1.2" />
            {/* Tower spire antenna with blinking beacon */}
            <line x1="40" y1="22" x2="40" y2="2" stroke={accentColor} strokeWidth="2" />
            <circle cx="40" cy="2" r="3" fill="#ef4444" className="animate-ping" />
            <circle cx="40" cy="2" r="2.5" fill="#ef4444" />
          </g>

          {/* R&D Wind Tunnel Hall */}
          <g transform="translate(130, 95)">
            <path d="M 0 25 L 50 45 L 50 75 L 0 55 Z" fill="#0284c7" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1" />
            <path d="M 50 45 L 90 27 L 90 57 L 50 75 Z" fill="#0284c7" fillOpacity="0.35" stroke="#0284c7" strokeWidth="1" />
            <path d="M 0 25 L 40 7 L 90 27 L 50 45 Z" fill="#0284c7" fillOpacity="0.6" stroke="#0284c7" strokeWidth="1" />
            {/* Wind flow arrows */}
            <path d="M 10 32 L 35 43 M 45 40 L 70 29" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
          </g>

          {/* Cargo Railway Terminal Station */}
          <g transform="translate(330, 110)">
            <path d="M 0 20 L 40 36 L 40 60 L 0 44 Z" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1" />
            <path d="M 40 36 L 80 18 L 80 42 L 40 60 Z" fill="#f59e0b" fillOpacity="0.35" stroke="#f59e0b" strokeWidth="1" />
            <path d="M 0 20 L 40 4 L 80 18 L 40 36 Z" fill="#f59e0b" fillOpacity="0.6" stroke="#f59e0b" strokeWidth="1" />
            {/* Container cranes */}
            <path d="M 20 12 L 20 -2 L 55 12" stroke="#ea580c" strokeWidth="1.5" />
          </g>

          {/* Radar Scanning Ring */}
          <g transform="translate(270, 110)">
            <ellipse cx="0" cy="0" rx="90" ry="40" stroke={accentColor} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <ellipse cx="0" cy="0" rx="140" ry="60" stroke={accentColor} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.35" />
            <text x="-80" y="35" fill={accentColor} fontSize="9" fontFamily="monospace" opacity="0.8">CAMPUS LAT: 52.072°N | LON: -1.014°W</text>
            <text x="50" y="-25" fill="#f59e0b" fontSize="9" fontFamily="monospace" opacity="0.8">RAIL SIDING: 4 TRACKS OK</text>
          </g>
        </svg>
      );

    // ── 2. APEX HEADQUARTERS HUB ──
    case "main_menu":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Central Apex Hub Emblem */}
          <g transform="translate(270, 105)">
            <circle cx="0" cy="0" r="42" fill="#fffbeb" stroke={accentColor} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="54" stroke={accentColor} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" className="animate-spin" />
            <polygon points="-16,-14 -6,-14 0,10 6,-14 16,-14 7,16 -7,16" fill={accentColor} />
            <text x="0" y="28" textAnchor="middle" fill="#78350f" fontSize="7" fontFamily="monospace" fontWeight="bold">APEX HQ</text>
          </g>

          {/* Departmental Satellites */}
          {[
            { x: 120, y: 60, label: "R&D LAB", color: "#4f46e5" },
            { x: 120, y: 150, label: "OPERATIONS", color: "#ea580c" },
            { x: 420, y: 60, label: "MOTORSPORT", color: "#dc2626" },
            { x: 420, y: 150, label: "SHOWROOM", color: "#059669" },
            { x: 270, y: 30, label: "CREATION", color: "#d97706" },
            { x: 270, y: 180, label: "FINANCE", color: "#16a34a" },
          ].map((sat, i) => (
            <g key={i}>
              {/* Connector Link */}
              <line x1="270" y1="105" x2={sat.x} y2={sat.y} stroke={sat.color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
              {/* Flow particle */}
              <circle r="3" fill={sat.color}>
                <animateMotion path={`M 270 105 L ${sat.x} ${sat.y}`} dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Node */}
              <g transform={`translate(${sat.x}, ${sat.y})`}>
                <circle cx="0" cy="0" r="14" fill="#ffffff" stroke={sat.color} strokeWidth="2" />
                <circle cx="0" cy="0" r="5" fill={sat.color} />
                <text x="0" y="22" textAnchor="middle" fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">{sat.label}</text>
              </g>
            </g>
          ))}
          <text x="180" y="210" fill="#92400e" fontSize="9" fontFamily="monospace" fontWeight="bold">GLOBAL COMMAND ORCHESTRATOR ONLINE</text>
        </svg>
      );

    // ── 3. VEHICLE ARCHITECTURE & CREATION HUB ──
    case "architecture":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Blueprint Grid Lines */}
          <g opacity="0.35" stroke="#d97706" strokeWidth="0.8">
            <line x1="30" y1="40" x2="510" y2="40" strokeDasharray="4 4" />
            <line x1="30" y1="110" x2="510" y2="110" strokeDasharray="4 4" />
            <line x1="30" y1="170" x2="510" y2="170" strokeDasharray="4 4" />
            <line x1="120" y1="20" x2="120" y2="190" />
            <line x1="270" y1="20" x2="270" y2="190" />
            <line x1="420" y1="20" x2="420" y2="190" />
          </g>

          {/* Modular Hardpoint Anchors */}
          {[
            { x: 120, y: 150, label: "FRONT AXLE [0,0,0]" },
            { x: 420, y: 150, label: "REAR AXLE [0,2720,0]" },
            { x: 270, y: 130, label: "H-POINT CABIN" },
            { x: 270, y: 60, label: "ROOF APEX [1150mm]" },
            { x: 60, y: 150, label: "FRONT OVERHANG" },
            { x: 480, y: 150, label: "DIFFUSER TRAIL" },
          ].map((pt, i) => (
            <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle cx="0" cy="0" r="6" stroke="#d97706" strokeWidth="1.5" fill="#ffffff" />
              <line x1="-9" y1="0" x2="9" y2="0" stroke="#d97706" strokeWidth="1" />
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#d97706" strokeWidth="1" />
              <circle cx="0" cy="0" r="2" fill="#ef4444" />
              <text x="8" y="-6" fill="#78350f" fontSize="7" fontFamily="monospace" fontWeight="bold">{pt.label}</text>
            </g>
          ))}

          {/* Architectural Spaceframe Outline */}
          <path
            d="M 60 150 L 120 150 L 160 110 L 240 70 L 320 70 L 420 120 L 480 150"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Wheelbase Dimension Line */}
          <line x1="120" y1="180" x2="420" y2="180" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M 120 176 L 120 184 M 420 176 L 420 184" stroke="#0284c7" strokeWidth="1.5" />
          <text x="235" y="195" fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="bold">WHEELBASE: 2,720 mm</text>
        </svg>
      );

    // ── 4. POWERTRAIN & ENGINE STUDIO ──
    case "engine":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Cylinder Bore Wall */}
          <rect x="210" y="25" width="120" height="150" rx="4" stroke="#78716c" strokeWidth="2.5" fill="#f5f5f4" fillOpacity="0.6" />
          <line x1="210" y1="75" x2="330" y2="75" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="2 2" />

          {/* Combustion Chamber Flame Pulse */}
          <g transform="translate(270, 48)">
            <circle cx="0" cy="0" r="18" fill="#f97316" fillOpacity="0.35" className="animate-ping" />
            <path d="M -8 10 L 0 -12 L 8 10 Z" fill="#ef4444" />
            <circle cx="0" cy="-2" r="5" fill="#fef08a" />
          </g>

          {/* Spark Plug & Valves */}
          <rect x="264" y="10" width="12" height="20" fill="#a8a29e" stroke="#57534e" strokeWidth="1.2" rx="2" />
          <line x1="270" y1="2" x2="270" y2="12" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 230 18 L 244 38 M 236 38 L 252 38" stroke="#0284c7" strokeWidth="2" />
          <path d="M 310 18 L 296 38 M 288 38 L 304 38" stroke="#dc2626" strokeWidth="2" />

          {/* Moving Reciprocating Piston */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,38; 0,0" dur="0.8s" repeatCount="indefinite" />
            <rect x="220" y="60" width="100" height="42" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <line x1="220" y1="68" x2="320" y2="68" stroke="#334155" strokeWidth="1.5" />
            <line x1="220" y1="74" x2="320" y2="74" stroke="#334155" strokeWidth="1.5" />
            <circle cx="270" cy="85" r="7" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          </g>

          {/* Connecting Rod & Crankshaft */}
          <line x1="270" y1="110" x2="270" y2="175" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <circle cx="270" cy="175" r="14" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          <circle cx="270" cy="175" r="5" fill="#f8fafc" />

          {/* Spinning Turbocharger */}
          <g transform="translate(370, 75)">
            <circle cx="45" cy="45" r="38" stroke="#f97316" strokeWidth="2" fill="#fff7ed" strokeDasharray="6 4" />
            <path d="M 10 45 Q 45 20 80 45" stroke="#ea580c" strokeWidth="2" />
            <g transform="translate(45, 45)">
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#c2410c" strokeWidth="2.5" />
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#c2410c" strokeWidth="2.5" />
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#c2410c" strokeWidth="2" />
              <line x1="15" y1="-15" x2="-15" y2="15" stroke="#c2410c" strokeWidth="2" />
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.2s" repeatCount="indefinite" />
            </g>
            <text x="15" y="100" fill="#ea580c" fontSize="9" fontFamily="monospace" fontWeight="bold">TURBO BOOST: 1.85 BAR</text>
          </g>

          <text x="210" y="210" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">V8 TWIN-TURBO 90° HOT-V CALIBRATION</text>
        </svg>
      );

    // ── 5. CHASSIS & VEHICLE STUDIO ──
    case "chassis":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Engineering Coordinate Grid */}
          <g opacity="0.3" stroke="#94a3b8" strokeWidth="0.7">
            <line x1="40" y1="40" x2="500" y2="40" />
            <line x1="40" y1="100" x2="500" y2="100" />
            <line x1="40" y1="160" x2="500" y2="160" />
            <line x1="120" y1="20" x2="120" y2="190" />
            <line x1="270" y1="20" x2="270" y2="190" />
            <line x1="420" y1="20" x2="420" y2="190" />
          </g>

          {/* Supercar Silhouette Wireframe */}
          <path
            d="M 60 145 C 80 145 95 115 130 115 C 160 115 185 110 220 75 C 260 40 330 40 370 70 C 410 100 440 120 480 125 L 485 145 C 470 145 450 155 435 155 C 415 155 390 145 365 145 L 180 145 C 160 145 130 155 110 155 C 90 155 75 145 60 145 Z"
            stroke={accentColor}
            strokeWidth="2.5"
            fill={accentColor}
            fillOpacity="0.08"
          />

          {/* Wheels */}
          <g transform="translate(125, 145)">
            <circle cx="0" cy="0" r="28" stroke="#334155" strokeWidth="3" fill="#f8fafc" />
            <circle cx="0" cy="0" r="18" stroke="#ca8a04" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="0" cy="0" r="6" fill="#334155" />
            <rect x="10" y="-12" width="6" height="18" rx="2" fill="#ef4444" />
          </g>
          <g transform="translate(415, 145)">
            <circle cx="0" cy="0" r="28" stroke="#334155" strokeWidth="3" fill="#f8fafc" />
            <circle cx="0" cy="0" r="18" stroke="#ca8a04" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="0" cy="0" r="6" fill="#334155" />
            <rect x="10" y="-12" width="6" height="18" rx="2" fill="#ef4444" />
          </g>

          {/* Moving Laser Beam */}
          <line x1="40" y1="30" x2="40" y2="180" stroke="#06b6d4" strokeWidth="2.5" opacity="0.8">
            <animate attributeName="x1" values="50; 480; 50" dur="3s" repeatCount="indefinite" />
            <animate attributeName="x2" values="50; 480; 50" dur="3s" repeatCount="indefinite" />
          </line>

          {/* Center of Mass Marker */}
          <g transform="translate(265, 125)">
            <circle cx="0" cy="0" r="8" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M 0 0 L 8 0 A 8 8 0 0 1 0 8 Z" fill="#ef4444" />
            <path d="M 0 0 L -8 0 A 8 8 0 0 1 0 -8 Z" fill="#ef4444" />
            <text x="14" y="4" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">CoM (44:56)</text>
          </g>

          <text x="210" y="162" fill="#0284c7" fontSize="9" fontFamily="monospace">WHEELBASE: 2,720 mm</text>
          <text x="60" y="32" fill="#475569" fontSize="9" fontFamily="monospace">CHASSIS RIGIDITY: 45,200 Nm/deg</text>
        </svg>
      );

    // ── 6. AERODYNAMICS & WIND TUNNEL ──
    case "aero":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <line x1="30" y1="160" x2="510" y2="160" stroke="#64748b" strokeWidth="2" />
          <path d="M 30 160 L 510 160" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 6" />

          {/* Low-Drag Profile */}
          <path
            d="M 70 148 C 100 145 130 120 180 120 C 230 120 270 70 340 70 C 390 70 420 110 460 120 L 485 125 C 475 148 450 148 440 148 C 420 148 400 148 380 148 L 170 148 C 150 148 130 148 110 148 Z"
            fill="#0369a1"
            fillOpacity="0.2"
            stroke="#0284c7"
            strokeWidth="2.5"
          />

          {/* Active DRS Wing */}
          <g transform="translate(450, 85)">
            <rect x="0" y="0" width="30" height="4" rx="2" fill="#0284c7" />
            <line x1="12" y1="4" x2="12" y2="35" stroke="#0284c7" strokeWidth="2" />
            <line x1="22" y1="4" x2="22" y2="35" stroke="#0284c7" strokeWidth="2" />
            <path d="M 17 -12 L 17 0 M 13 -4 L 17 0 L 21 -4" stroke="#ef4444" strokeWidth="2" />
            <text x="-15" y="-16" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">-340 kg</text>
          </g>

          {/* Animated CFD Streamlines */}
          <g stroke="#38bdf8" strokeWidth="1.8" opacity="0.85">
            <path d="M 30 55 C 140 55 240 45 340 45 C 400 45 460 70 510 100" strokeDasharray="16 12">
              <animate attributeName="stroke-dashoffset" values="0; -280" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M 30 90 C 120 90 180 85 240 75 C 310 65 390 95 510 135" strokeDasharray="20 10">
              <animate attributeName="stroke-dashoffset" values="0; -300" dur="1.8s" repeatCount="indefinite" />
            </path>
            <path d="M 30 155 L 140 155 C 240 155 350 152 440 138 C 470 132 490 120 510 115" stroke="#0ea5e9" strokeWidth="2.2" strokeDasharray="18 10">
              <animate attributeName="stroke-dashoffset" values="0; -280" dur="1.5s" repeatCount="indefinite" />
            </path>
          </g>

          <text x="180" y="200" fill="#0369a1" fontSize="10" fontFamily="monospace" fontWeight="bold">AERODYNAMIC COEFFICIENT: Cd 0.285 | Cl -0.840</text>
        </svg>
      );

    // ── 7. INTERIOR & COCKPIT STUDIO ──
    case "interior":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Curved OLED Infotainment Screen */}
          <path d="M 60 70 C 180 55 360 55 480 70 L 475 140 C 360 128 180 128 65 140 Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2.5" />

          {/* Speedometer */}
          <g transform="translate(140, 95)">
            <circle cx="0" cy="0" r="32" stroke="#4338ca" strokeWidth="4" strokeDasharray="160 50" />
            <path d="M 0 0 L 16 -18" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0; 120; 45; 180; 90" dur="3s" repeatCount="indefinite" />
            </path>
            <circle cx="0" cy="0" r="5" fill="#f43f5e" />
            <text x="-16" y="16" fill="#818cf8" fontSize="10" fontFamily="monospace" fontWeight="bold">285 KM/H</text>
          </g>

          {/* Tachometer */}
          <g transform="translate(250, 95)">
            <circle cx="0" cy="0" r="32" stroke="#4338ca" strokeWidth="4" strokeDasharray="150 60" />
            <path d="M 0 0 L 18 -14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0; 140; 80; 160; 110" dur="2.4s" repeatCount="indefinite" />
            </path>
            <circle cx="0" cy="0" r="5" fill="#f59e0b" />
            <text x="-14" y="16" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">8,400 RPM</text>
          </g>

          {/* D-Cut Steering Wheel */}
          <g transform="translate(195, 175)">
            <path d="M -50 0 C -50 -50 50 -50 50 0 L 35 20 C 15 28 -15 28 -35 20 Z" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
            <circle cx="0" cy="-12" r="16" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <line x1="0" y1="-44" x2="0" y2="-37" stroke="#ef4444" strokeWidth="4" />
          </g>

          <text x="170" y="210" fill="#6d28d9" fontSize="10" fontFamily="monospace" fontWeight="bold">SAE J1100 ERGONOMIC CAD COCKPIT</text>
        </svg>
      );

    // ── 9. INDUSTRIAL OPERATIONS & ROBOTICS ──
    case "operations":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <rect x="40" y="145" width="460" height="22" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <line x1="50" y1="156" x2="490" y2="156" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6">
            <animate attributeName="stroke-dashoffset" values="0; -50" dur="1s" repeatCount="indefinite" />
          </line>

          {/* Car Body */}
          <g transform="translate(190, 95)">
            <path d="M 10 40 L 40 20 L 100 20 L 130 40 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <rect x="0" y="40" width="140" height="15" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          </g>

          {/* KUKA Robotic Welding Arm */}
          <g transform="translate(140, 60)">
            <rect x="-15" y="80" width="30" height="15" rx="2" fill="#ea580c" />
            <line x1="0" y1="80" x2="-20" y2="40" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" />
            <circle cx="-20" cy="40" r="7" fill="#475569" />
            <line x1="-20" y1="40" x2="35" y2="25" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
            <circle cx="35" cy="25" r="5" fill="#475569" />
            <line x1="35" y1="25" x2="55" y2="45" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            {/* Sparks */}
            <circle cx="55" cy="45" r="8" fill="#fef08a" className="animate-ping" />
            <path d="M 55 45 L 48 38 M 55 45 L 62 37 M 55 45 L 60 52" stroke="#f59e0b" strokeWidth="1.5" />
          </g>

          <text x="180" y="200" fill="#c2410c" fontSize="10" fontFamily="monospace" fontWeight="bold">TAKT TIME: 64s | KUKA ROBOT CELLS: 128 ACTIVE</text>
        </svg>
      );

    // ── 11. FLEET GARAGE & SHOWROOM TURNTABLE ──
    case "garage":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Turntable Base Platform (Isometric Ellipse) */}
          <ellipse cx="270" cy="155" rx="180" ry="45" fill="#f1f5f9" stroke="#64748b" strokeWidth="3" />
          <ellipse cx="270" cy="155" rx="140" ry="32" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Dual Hydraulic Service Lift Posts */}
          <rect x="70" y="40" width="16" height="120" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="454" y="40" width="16" height="120" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="86" y1="100" x2="160" y2="100" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" />
          <line x1="454" y1="100" x2="380" y2="100" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" />

          {/* Staged Vehicle Silhouette on Turntable */}
          <path
            d="M 170 145 C 190 145 210 115 240 115 C 270 115 285 85 320 85 C 345 85 365 115 390 120 L 400 145 Z"
            fill="#475569"
            fillOpacity="0.2"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Rotating Spotlight Cones */}
          <polygon points="270,10 190,155 350,155" fill="#fef08a" fillOpacity="0.12" />

          <text x="175" y="200" fill="#334155" fontSize="10" fontFamily="monospace" fontWeight="bold">SHOWROOM TURNTABLE: 360° INSPECTION READY</text>
        </svg>
      );

    // ── 12. MOTORSPORT & RACE TELEMETRY ──
    case "motorsport":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <path
            d="M 80 120 C 80 60 140 40 200 40 C 260 40 280 80 340 70 C 400 60 460 70 470 120 C 480 170 420 180 350 180 C 280 180 250 140 180 140 C 120 140 80 170 80 120 Z"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          <path
            d="M 80 120 C 80 60 140 40 200 40 C 260 40 280 80 340 70 C 400 60 460 70 470 120 C 480 170 420 180 350 180 C 280 180 250 140 180 140 C 120 140 80 170 80 120 Z"
            stroke="#b91c1c"
            strokeWidth="4"
            strokeDasharray="12 6"
            strokeLinejoin="round"
          />

          {/* Animated Race Car Apex Tracer */}
          <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
            <animateMotion
              path="M 80 120 C 80 60 140 40 200 40 C 260 40 280 80 340 70 C 400 60 460 70 470 120 C 480 170 420 180 350 180 C 280 180 250 140 180 140 C 120 140 80 170 80 120 Z"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>

          <text x="170" y="32" fill="#b91c1c" fontSize="9" fontFamily="monospace" fontWeight="bold">SECTOR 1 [SPEED TRAP 324 KM/H]</text>
          <text x="380" y="55" fill="#15803d" fontSize="9" fontFamily="monospace" fontWeight="bold">SECTOR 2 [-0.240s DELTA]</text>
          <text x="180" y="198" fill="#ca8a04" fontSize="9" fontFamily="monospace" fontWeight="bold">SECTOR 3 [PURPLE OVERALL]</text>
        </svg>
      );

    // ── 13. FORMULA 1 CONSTRUCTOR ──
    case "f1":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <g transform="translate(270, 110)">
            <line x1="-220" y1="0" x2="220" y2="0" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="4 2" />

            {/* Front Wing Assembly */}
            <path d="M -190 -65 L -165 -65 L -165 65 L -190 65 Z" fill="#e11d48" fillOpacity="0.3" stroke="#e11d48" strokeWidth="1.5" />
            <line x1="-180" y1="-65" x2="-180" y2="65" stroke="#e11d48" strokeWidth="1" />

            {/* Monocoque */}
            <path
              d="M -190 0 L -140 -14 L -80 -18 L -30 -35 L 70 -35 L 120 -20 L 160 -15 L 175 -8 L 175 8 L 160 15 L 120 20 L 70 35 L -30 35 L -80 18 L -140 14 Z"
              fill="#1c1917"
              stroke="#e11d48"
              strokeWidth="2"
            />

            {/* Titanium Halo Cockpit Protection */}
            <path d="M -15 0 L 15 -12 L 35 -10 L 35 10 L 15 12 Z" stroke="#cbd5e1" strokeWidth="3" fill="#334155" />
            <circle cx="20" cy="0" r="7" fill="#f59e0b" />

            {/* Wheels */}
            <rect x="-145" y="-95" width="45" height="26" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
            <rect x="-145" y="69" width="45" height="26" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
            <rect x="105" y="-105" width="55" height="30" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
            <rect x="105" y="75" width="55" height="30" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />

            {/* DRS Rear Wing */}
            <rect x="165" y="-55" width="22" height="110" rx="3" fill="#881337" stroke="#e11d48" strokeWidth="2" />
            <line x1="172" y1="-55" x2="172" y2="55" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 3" />
            <text x="145" y="-62" fill="#e11d48" fontSize="8" fontFamily="monospace" fontWeight="bold">DRS: ARMED</text>
          </g>

          <text x="150" y="208" fill="#be123c" fontSize="10" fontFamily="monospace" fontWeight="bold">FIA TECHNICAL REGULATIONS 2026 AUDIT: PASS</text>
        </svg>
      );

    // ── 14. LE MANS HYPERCAR CONSTRUCTOR ──
    case "hypercar":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Prototype Silhouette with Dorsal Shark Fin */}
          <path
            d="M 50 145 C 80 145 110 115 160 115 C 200 115 240 65 310 65 C 340 65 365 75 390 90 L 475 90 C 490 90 495 105 490 145 L 440 145 C 420 145 400 145 380 145 L 170 145 C 150 145 130 145 110 145 Z"
            fill="#1d4ed8"
            fillOpacity="0.2"
            stroke="#2563eb"
            strokeWidth="2.5"
          />

          {/* Central Dorsal Shark Fin */}
          <path d="M 280 65 L 370 65 L 440 90 L 370 90 Z" fill="#2563eb" fillOpacity="0.5" stroke="#1d4ed8" strokeWidth="1.5" />
          <path d="M 260 70 L 290 55 L 320 65 Z" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />

          {/* Wheels */}
          <circle cx="120" cy="145" r="28" fill="#0f172a" stroke="#2563eb" strokeWidth="3" />
          <circle cx="410" cy="145" r="28" fill="#0f172a" stroke="#2563eb" strokeWidth="3" />

          {/* Hybrid Battery Flow */}
          <g transform="translate(220, 115)">
            <rect x="0" y="0" width="70" height="24" rx="4" fill="#0284c7" fillOpacity="0.3" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="10" y1="12" x2="60" y2="12" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3">
              <animate attributeName="stroke-dashoffset" values="0; -40" dur="1s" repeatCount="indefinite" />
            </line>
            <text x="8" y="16" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">900V HYBRID</text>
          </g>

          <text x="170" y="200" fill="#1d4ed8" fontSize="10" fontFamily="monospace" fontWeight="bold">WEC LMH BALANCE OF PERFORMANCE WINDOW LOCK</text>
        </svg>
      );

    // ── 15. ADVANCED R&D & TECH TREE ──
    case "rd":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <g stroke="#4f46e5" strokeWidth="1.5" opacity="0.6">
            <line x1="120" y1="110" x2="220" y2="70" />
            <line x1="120" y1="110" x2="220" y2="150" />
            <line x1="220" y1="70" x2="320" y2="70" />
            <line x1="220" y1="150" x2="320" y2="150" />
            <line x1="320" y1="70" x2="420" y2="110" />
            <line x1="320" y1="150" x2="420" y2="110" />
          </g>

          {[
            { cx: 120, cy: 110, label: "BASE ALLOYS", color: "#4f46e5" },
            { cx: 220, cy: 70, label: "SOLID-STATE BATTERY", color: "#06b6d4" },
            { cx: 220, cy: 150, label: "CARBON NANOTUBES", color: "#8b5cf6" },
            { cx: 320, cy: 70, label: "PLASMA IGNITION", color: "#f59e0b" },
            { cx: 320, cy: 150, label: "ACTIVE MORPH AERO", color: "#10b981" },
            { cx: 420, cy: 110, label: "QUANTUM AI TOPOLOGY", color: "#ec4899" },
          ].map((n, i) => (
            <g key={i} transform={`translate(${n.cx}, ${n.cy})`}>
              <circle cx="0" cy="0" r="18" fill="#ffffff" stroke={n.color} strokeWidth="3" />
              <circle cx="0" cy="0" r="8" fill={n.color} />
              <text x="0" y="32" textAnchor="middle" fill="#1e1b4b" fontSize="8" fontFamily="monospace" fontWeight="bold">{n.label}</text>
            </g>
          ))}

          <circle r="4" fill="#06b6d4">
            <animateMotion path="M 120 110 L 220 70 L 320 70 L 420 110" dur="2.5s" repeatCount="indefinite" />
          </circle>

          <text x="180" y="200" fill="#4338ca" fontSize="10" fontFamily="monospace" fontWeight="bold">88 PATENTS SYNCHRONIZED ACROSS DIVISIONS</text>
        </svg>
      );

    // ── 16. CRASH SAFETY & HOMOLOGATION LAB ──
    case "safety":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Crash Test Track Rails */}
          <line x1="40" y1="160" x2="400" y2="160" stroke="#64748b" strokeWidth="4" />
          <line x1="40" y1="168" x2="400" y2="168" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />

          {/* Rigid Concrete Impact Barrier Block */}
          <rect x="400" y="70" width="70" height="100" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          {/* Deformable Honeycomb Face */}
          <rect x="382" y="80" width="18" height="80" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Crash Sled Moving Toward Barrier */}
          <g transform="translate(180, 100)">
            {/* Sled Chassis */}
            <rect x="0" y="35" width="140" height="25" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            <circle cx="25" cy="60" r="12" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
            <circle cx="115" cy="60" r="12" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />

            {/* Crash Test Dummy Target Icon */}
            <circle cx="70" cy="18" r="14" fill="#eab308" stroke="#0f172a" strokeWidth="2" />
            <path d="M 70 4 A 14 14 0 0 1 84 18 L 70 18 Z" fill="#0f172a" />
            <path d="M 70 32 A 14 14 0 0 1 56 18 L 70 18 Z" fill="#0f172a" />

            {/* Velocity Vector Arrow */}
            <line x1="140" y1="47" x2="190" y2="47" stroke="#ef4444" strokeWidth="3" />
            <polygon points="190,42 205,47 190,52" fill="#ef4444" />
            <text x="140" y="36" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">64 KM/H</text>
          </g>

          <text x="170" y="200" fill="#dc2626" fontSize="10" fontFamily="monospace" fontWeight="bold">EURO NCAP 5-STAR CRUMPLE ZONE ABSORPTION OK</text>
        </svg>
      );

    // ── 17. MULTI-PHYSICS SIMULATION DASHBOARD ──
    case "simulation":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Oscilloscope Grid */}
          <rect x="50" y="30" width="440" height="140" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <g opacity="0.25" stroke="#06b6d4" strokeWidth="0.8">
            <line x1="50" y1="65" x2="490" y2="65" strokeDasharray="3 3" />
            <line x1="50" y1="100" x2="490" y2="100" />
            <line x1="50" y1="135" x2="490" y2="135" strokeDasharray="3 3" />
            <line x1="160" y1="30" x2="160" y2="170" strokeDasharray="3 3" />
            <line x1="270" y1="30" x2="270" y2="170" />
            <line x1="380" y1="30" x2="380" y2="170" strokeDasharray="3 3" />
          </g>

          {/* Lateral G Waveform (Cyan) */}
          <path
            d="M 60 100 Q 110 50 160 100 T 260 100 T 360 100 T 460 100"
            stroke="#22d3ee"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Speed / Throttle Waveform (Green) */}
          <path
            d="M 60 140 C 120 135 180 80 240 70 C 300 60 380 65 480 50"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 2"
          />

          {/* Brake Pressure Waveform (Red) */}
          <path
            d="M 60 160 L 220 160 L 240 75 L 260 160 L 480 160"
            stroke="#f43f5e"
            strokeWidth="2"
            fill="none"
          />

          <text x="70" y="52" fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">LATERAL: 1.62G</text>
          <text x="200" y="52" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">THROTTLE: 100%</text>
          <text x="350" y="52" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">BRAKE: 85 BAR</text>
          <text x="180" y="195" fill="#0891b2" fontSize="10" fontFamily="monospace" fontWeight="bold">NUMERICAL INTEGRATION: 1,000Hz RK4 SOLVER</text>
        </svg>
      );

    // ── 18. PROVING GROUNDS & TESTING LAB ──
    case "testing":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Banked Oval Track */}
          <ellipse cx="270" cy="105" rx="200" ry="75" stroke="#cbd5e1" strokeWidth="18" />
          <ellipse cx="270" cy="105" rx="200" ry="75" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="14 8" />

          {/* Constant Radius Skidpad Circle */}
          <circle cx="270" cy="105" r="45" stroke="#ca8a04" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="270" cy="105" r="4" fill="#ca8a04" />
          <text x="245" y="110" fill="#a16207" fontSize="8" fontFamily="monospace" fontWeight="bold">200m SKIDPAD</text>

          {/* High Speed Oval Car Pulse */}
          <circle r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2">
            <animateMotion path="M 70 105 A 200 75 0 1 0 470 105 A 200 75 0 1 0 70 105" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Slalom Cones Array */}
          <g transform="translate(180, 150)">
            {[0, 45, 90, 135, 180].map((cx, i) => (
              <polygon key={i} points={`${cx},10 ${cx - 5},22 ${cx + 5},22`} fill="#f97316" stroke="#c2410c" strokeWidth="1" />
            ))}
          </g>

          <text x="170" y="200" fill="#1d4ed8" fontSize="10" fontFamily="monospace" fontWeight="bold">HIGH-SPEED OVAL & SLALOM PROVING GROUNDS</text>
        </svg>
      );

    // ── 19. CORPORATE FINANCE & TREASURY ──
    case "finance":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <g opacity="0.3" stroke="#94a3b8" strokeWidth="0.8">
            <line x1="60" y1="50" x2="480" y2="50" />
            <line x1="60" y1="95" x2="480" y2="95" />
            <line x1="60" y1="140" x2="480" y2="140" />
          </g>

          {/* Ascending Revenue Trendline */}
          <path
            d="M 60 145 C 130 140 180 110 240 100 C 300 90 350 50 420 40 L 480 30"
            stroke="#16a34a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 60 145 C 130 140 180 110 240 100 C 300 90 350 50 420 40 L 480 30 L 480 160 L 60 160 Z"
            fill="#16a34a"
            fillOpacity="0.12"
          />

          {/* Candlesticks */}
          {[
            { x: 100, open: 135, close: 125, high: 120, low: 140, green: true },
            { x: 160, open: 128, close: 115, high: 110, low: 132, green: true },
            { x: 220, open: 116, close: 122, high: 112, low: 126, green: false },
            { x: 280, open: 118, close: 95, high: 90, low: 122, green: true },
            { x: 340, open: 92, close: 72, high: 68, low: 98, green: true },
            { x: 400, open: 70, close: 48, high: 42, low: 76, green: true },
            { x: 460, open: 45, close: 28, high: 22, low: 50, green: true },
          ].map((c, i) => (
            <g key={i}>
              <line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={c.green ? "#16a34a" : "#dc2626"} strokeWidth="1.2" />
              <rect
                x={c.x - 7}
                y={Math.min(c.open, c.close)}
                width="14"
                height={Math.max(Math.abs(c.open - c.close), 4)}
                rx="2"
                fill={c.green ? "#22c55e" : "#ef4444"}
              />
            </g>
          ))}

          <text x="160" y="195" fill="#15803d" fontSize="10" fontFamily="monospace" fontWeight="bold">ENTERPRISE VALUATION & AUDIT RECONCILIATION</text>
        </svg>
      );

    // ── 20. PROCUREMENT & CONTRACTS ──
    case "contracts":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Legal Contract Document */}
          <g transform="translate(180, 25)">
            <rect x="0" y="0" width="180" height="150" rx="8" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" className="shadow-lg" />
            <line x1="25" y1="25" x2="155" y2="25" stroke="#1e3a8a" strokeWidth="3" />
            <line x1="25" y1="45" x2="135" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="25" y1="60" x2="155" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="25" y1="75" x2="120" y2="75" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="25" y1="90" x2="145" y2="90" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Red Wax Seal Badge */}
            <circle cx="140" cy="115" r="16" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            <polygon points="140,105 143,113 151,113 145,118 147,126 140,121 133,126 135,118 129,113 137,113" fill="#fef08a" />

            {/* Signature Quill Vector */}
            <path d="M 30 120 Q 55 110 70 125 T 100 115" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Supplier SLA Status Badges */}
          <g transform="translate(50, 75)">
            <rect x="0" y="0" width="95" height="28" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
            <text x="10" y="18" fill="#0369a1" fontSize="8" fontFamily="monospace" fontWeight="bold">TIER-1 OEM: OK</text>
          </g>
          <g transform="translate(395, 75)">
            <rect x="0" y="0" width="95" height="28" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
            <text x="10" y="18" fill="#15803d" fontSize="8" fontFamily="monospace" fontWeight="bold">ESCROW: LOCKED</text>
          </g>

          <text x="165" y="200" fill="#1e3a8a" fontSize="10" fontFamily="monospace" fontWeight="bold">B2B SUPPLIER MASTER SLA VERIFICATION</text>
        </svg>
      );

    // ── 21. CALENDAR & ROADMAP ──
    case "calendar":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Calendar Grid Frame */}
          <g transform="translate(140, 25)">
            <rect x="0" y="0" width="260" height="150" rx="8" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
            <rect x="0" y="0" width="260" height="32" rx="8" fill="#fef08a" />
            <text x="15" y="21" fill="#854d0e" fontSize="11" fontFamily="monospace" fontWeight="bold">2026 MASTER SEASON SCHEDULE</text>

            {/* Weekday Grid Cells */}
            {[0, 1, 2, 3, 4].map((col) => (
              <line key={col} x1={52 * col} y1="32" x2={52 * col} y2="150" stroke="#fef08a" strokeWidth="1" />
            ))}
            {[0, 1, 2].map((row) => (
              <line key={row} x1="0" y1={32 + 39 * row} x2="260" y2={32 + 39 * row} stroke="#fef08a" strokeWidth="1" />
            ))}

            {/* Checkered Flag on Race Day */}
            <circle cx="130" cy="90" r="14" fill="#dc2626" />
            <text x="130" y="94" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">GP</text>
          </g>

          {/* Left / Right Milestone Callouts */}
          <text x="30" y="105" fill="#ca8a04" fontSize="9" fontFamily="monospace" fontWeight="bold">ROUND 1: MONZA</text>
          <text x="420" y="105" fill="#16a34a" fontSize="9" fontFamily="monospace" fontWeight="bold">GENEVA AUTO SHOW</text>

          <text x="175" y="200" fill="#a16207" fontSize="10" fontFamily="monospace" fontWeight="bold">SIMULATION CHRONO CLOCK SYNCHRONIZED</text>
        </svg>
      );

    // ── 22. REPUTATION & MEDIA STANDING ──
    case "reputation":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Golden Trophy / 5-Star Halo */}
          <g transform="translate(270, 95)">
            <circle cx="0" cy="0" r="48" fill="#fef9c3" stroke="#eab308" strokeWidth="3" />
            {/* Laurel Wreath */}
            <path d="M -35 15 C -45 -15 -25 -40 0 -45 C 25 -40 45 -15 35 15" stroke="#ca8a04" strokeWidth="2.5" strokeDasharray="6 3" />
            <text x="0" y="8" textAnchor="middle" fill="#854d0e" fontSize="20" fontWeight="black" fontFamily="sans-serif">9.8</text>
            <text x="0" y="22" textAnchor="middle" fill="#ca8a04" fontSize="8" fontFamily="monospace" fontWeight="bold">OVERALL SCORE</text>
          </g>

          {/* 5 Golden Stars */}
          <g transform="translate(270, 28)">
            {[-40, -20, 0, 20, 40].map((cx, i) => (
              <polygon key={i} points={`${cx},-8 ${cx + 3},-2 ${cx + 8},-2 ${cx + 4},2 ${cx + 6},8 ${cx},4 ${cx - 6},8 ${cx - 4},2 ${cx - 8},-2 ${cx - 3},-2`} fill="#eab308" />
            ))}
          </g>

          <text x="80" y="100" fill="#a16207" fontSize="9" fontFamily="monospace" fontWeight="bold">TOPGEAR: 10/10</text>
          <text x="400" y="100" fill="#a16207" fontSize="9" fontFamily="monospace" fontWeight="bold">MOTOR TREND: BEST IN CLASS</text>
          <text x="170" y="200" fill="#854d0e" fontSize="10" fontFamily="monospace" fontWeight="bold">GLOBAL BRAND PRESTIGE INDEX: 1.48x</text>
        </svg>
      );

    // ── 23. WORKFORCE & TALENT ACQUISITION ──
    case "workforce":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Org Chart Tree Nodes */}
          {/* Executive CTO Node */}
          <g transform="translate(270, 45)">
            <rect x="-45" y="-15" width="90" height="30" rx="6" fill="#0d9488" stroke="#115e59" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">CHIEF ENGINEER</text>
          </g>

          {/* Tree Branches */}
          <line x1="270" y1="60" x2="270" y2="90" stroke="#0d9488" strokeWidth="1.5" />
          <line x1="90" y1="90" x2="450" y2="90" stroke="#0d9488" strokeWidth="1.5" />
          <line x1="90" y1="90" x2="90" y2="120" stroke="#0d9488" strokeWidth="1.5" />
          <line x1="210" y1="90" x2="210" y2="120" stroke="#0d9488" strokeWidth="1.5" />
          <line x1="330" y1="90" x2="330" y2="120" stroke="#0d9488" strokeWidth="1.5" />
          <line x1="450" y1="90" x2="450" y2="120" stroke="#0d9488" strokeWidth="1.5" />

          {/* Division Leads */}
          {[
            { x: 90, label: "AERODYNAMICS", count: "34 Eng" },
            { x: 210, label: "POWERTRAIN", count: "52 Eng" },
            { x: 330, label: "CHASSIS / CAD", count: "48 Eng" },
            { x: 450, label: "RACING CREW", count: "60 Staff" },
          ].map((dept, i) => (
            <g key={i} transform={`translate(${dept.x}, 135)`}>
              <rect x="-42" y="-15" width="84" height="30" rx="5" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />
              <text x="0" y="-1" textAnchor="middle" fill="#0f766e" fontSize="7" fontFamily="monospace" fontWeight="bold">{dept.label}</text>
              <text x="0" y="10" textAnchor="middle" fill="#115e59" fontSize="8" fontFamily="monospace">{dept.count}</text>
            </g>
          ))}

          <text x="170" y="200" fill="#0f766e" fontSize="10" fontFamily="monospace" fontWeight="bold">ENGINEERING TALENT RETENTION: 96.2% OPTIMAL</text>
        </svg>
      );

    // ── 24. SUPPLY CHAIN & LOGISTICS ──
    case "supplyChain":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Freight Train Tracks */}
          <line x1="30" y1="150" x2="510" y2="150" stroke="#78716c" strokeWidth="4" />
          <line x1="30" y1="156" x2="510" y2="156" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="6 4" />

          {/* Intermodal Freight Train Wagons */}
          <g transform="translate(160, 110)">
            {/* Locomotive */}
            <rect x="0" y="0" width="60" height="36" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
            {/* Container 1 */}
            <rect x="68" y="0" width="55" height="36" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            {/* Container 2 */}
            <rect x="130" y="0" width="55" height="36" rx="2" fill="#16a34a" stroke="#15803d" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="15" cy="40" r="5" fill="#334155" />
            <circle cx="45" cy="40" r="5" fill="#334155" />
            <circle cx="85" cy="40" r="5" fill="#334155" />
            <circle cx="150" cy="40" r="5" fill="#334155" />
          </g>

          {/* Harbor Gantry Crane */}
          <g transform="translate(390, 45)">
            <line x1="0" y1="105" x2="25" y2="20" stroke="#ca8a04" strokeWidth="3" />
            <line x1="50" y1="105" x2="25" y2="20" stroke="#ca8a04" strokeWidth="3" />
            <line x1="10" y1="20" x2="80" y2="20" stroke="#ca8a04" strokeWidth="3" />
            <line x1="60" y1="20" x2="60" y2="55" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="48" y="55" width="24" height="15" fill="#0284c7" />
          </g>

          <text x="160" y="200" fill="#c2410c" fontSize="10" fontFamily="monospace" fontWeight="bold">JUST-IN-SEQUENCE LOGISTICS BUFFER: 14.5 DAYS</text>
        </svg>
      );

    // ── 25. POWERTRAIN DYNO & ECU CALIBRATION ──
    case "dyno_ecu":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Dyno Rollers Under Wheel */}
          <g transform="translate(160, 120)">
            <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
            <circle cx="0" cy="0" r="20" stroke="#ca8a04" strokeWidth="2" strokeDasharray="4 2" />
            {/* Spinning Roller Drums */}
            <circle cx="-16" cy="38" r="14" fill="#64748b" stroke="#334155" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" from="0 -16 38" to="360 -16 38" dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="38" r="14" fill="#64748b" stroke="#334155" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" from="0 16 38" to="360 16 38" dur="0.6s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Live Dyno Power Curve Display */}
          <g transform="translate(260, 40)">
            <rect x="0" y="0" width="220" height="120" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
            <g opacity="0.25" stroke="#f97316" strokeWidth="0.8">
              <line x1="0" y1="30" x2="220" y2="30" />
              <line x1="0" y1="60" x2="220" y2="60" />
              <line x1="0" y1="90" x2="220" y2="90" />
            </g>
            {/* Horsepower Curve (Orange) */}
            <path d="M 15 105 C 60 95 120 45 180 20 L 205 18" stroke="#f97316" strokeWidth="2.5" fill="none" />
            {/* Torque Curve (Cyan) */}
            <path d="M 15 80 C 50 35 120 30 180 50 L 205 75" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
            <text x="15" y="16" fill="#f97316" fontSize="8" fontFamily="monospace" fontWeight="bold">840 HP @ 7,800 RPM</text>
            <text x="120" y="16" fill="#06b6d4" fontSize="8" fontFamily="monospace" fontWeight="bold">920 Nm @ 4,200 RPM</text>
          </g>

          <text x="170" y="200" fill="#ea580c" fontSize="10" fontFamily="monospace" fontWeight="bold">CHASSIS DYNO ROLLER LOAD BALANCED (120Hz)</text>
        </svg>
      );

    // ── 26. TELEMETRY TRACK BATTLES ──
    case "track_battle":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Two Racing Cars in Hot Pursuit */}
          <line x1="40" y1="120" x2="500" y2="120" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="40" y1="126" x2="500" y2="126" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 6" />

          {/* Lead Car (Red) */}
          <g transform="translate(320, 85)">
            <path d="M 0 30 L 25 15 L 70 15 L 90 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <rect x="75" y="5" width="10" height="25" fill="#b91c1c" />
            <circle cx="20" cy="32" r="7" fill="#0f172a" />
            <circle cx="75" cy="32" r="7" fill="#0f172a" />
            <text x="15" y="8" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">P1 LEADER</text>
          </g>

          {/* Chaser Car (Ghost Cyan) */}
          <g transform="translate(130, 85)">
            <path d="M 0 30 L 25 15 L 70 15 L 90 30 Z" fill="#06b6d4" fillOpacity="0.4" stroke="#0891b2" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="20" cy="32" r="7" fill="#0f172a" />
            <circle cx="75" cy="32" r="7" fill="#0f172a" />
            <text x="10" y="8" fill="#0891b2" fontSize="8" fontFamily="monospace" fontWeight="bold">GHOST [-0.182s]</text>
          </g>

          {/* Delta Box */}
          <g transform="translate(240, 30)">
            <rect x="0" y="0" width="70" height="25" rx="5" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5" />
            <text x="35" y="17" textAnchor="middle" fill="#dc2626" fontSize="10" fontFamily="monospace" fontWeight="bold">DELTA: -0.182s</text>
          </g>

          <text x="170" y="200" fill="#b91c1c" fontSize="10" fontFamily="monospace" fontWeight="bold">HIGH-FREQUENCY GHOST LAP SYNCHRONIZATION</text>
        </svg>
      );

    // ── 27. TRACK LAYOUT MASTER STUDIO ──
    case "track_layout":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Topographical Contour Splines */}
          <g opacity="0.3" stroke="#10b981" strokeWidth="0.8">
            <ellipse cx="270" cy="110" rx="220" ry="70" strokeDasharray="3 3" />
            <ellipse cx="270" cy="110" rx="170" ry="50" strokeDasharray="3 3" />
            <ellipse cx="270" cy="110" rx="120" ry="35" strokeDasharray="3 3" />
          </g>

          {/* Curvature Continuous Circuit Spline */}
          <path
            d="M 90 120 C 110 50 200 40 280 60 C 360 80 420 50 450 110 C 470 160 380 180 290 160 C 200 140 160 180 110 160 Z"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Apex Markers & Radii */}
          {[
            { x: 190, y: 46, r: "R=65m" },
            { x: 450, y: 110, r: "R=42m" },
            { x: 290, y: 160, r: "R=88m" },
          ].map((pt, i) => (
            <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle cx="0" cy="0" r="5" fill="#ef4444" />
              <text x="8" y="4" fill="#047857" fontSize="8" fontFamily="monospace" fontWeight="bold">{pt.r}</text>
            </g>
          ))}

          <text x="175" y="200" fill="#047857" fontSize="10" fontFamily="monospace" fontWeight="bold">FIA GRADE 1 ELEVATION & APEX CONTINUITY</text>
        </svg>
      );

    // ── 28. 3D TRANSMISSION & DRIVETRAIN STUDIO ──
    case "transmission3d":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Intermeshing Spur / Helical Gears */}
          <g transform="translate(200, 110)">
            <circle cx="0" cy="0" r="45" fill="#f8fafc" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="8 4" />
            <circle cx="0" cy="0" r="18" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#8b5cf6" strokeWidth="2" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#8b5cf6" strokeWidth="2" />
            <animateTransform attributeName="transform" type="rotate" from="0 200 110" to="360 200 110" dur="2s" repeatCount="indefinite" />
          </g>

          <g transform="translate(285, 110)">
            <circle cx="0" cy="0" r="38" fill="#f8fafc" stroke="#6d28d9" strokeWidth="3" strokeDasharray="7 4" />
            <circle cx="0" cy="0" r="15" fill="#6d28d9" fillOpacity="0.2" stroke="#6d28d9" strokeWidth="2" />
            <animateTransform attributeName="transform" type="rotate" from="0 285 110" to="-360 285 110" dur="1.7s" repeatCount="indefinite" />
          </g>

          {/* Clutch Plates Stack */}
          <g transform="translate(370, 75)">
            {[0, 8, 16, 24, 32].map((x, i) => (
              <line key={i} x1={x} y1="0" x2={x} y2="70" stroke={i % 2 === 0 ? "#ca8a04" : "#475569"} strokeWidth="3" />
            ))}
            <text x="0" y="85" fill="#ca8a04" fontSize="8" fontFamily="monospace" fontWeight="bold">DCT CLUTCH</text>
          </g>

          <text x="175" y="200" fill="#6d28d9" fontSize="10" fontFamily="monospace" fontWeight="bold">DUAL-CLUTCH 7-SPEED DCT RATIOS CALIBRATED</text>
        </svg>
      );

    // ── 29. KINEMATIC SUSPENSION MASTER STUDIO ──
    case "suspension3d":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Double-Wishbone Linkage Geometry */}
          <g transform="translate(270, 110)">
            {/* Wheel & Tire */}
            <rect x="90" y="-70" width="30" height="140" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            {/* Upper A-Arm */}
            <line x1="-80" y1="-40" x2="90" y2="-30" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
            {/* Lower A-Arm */}
            <line x1="-90" y1="40" x2="90" y2="40" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
            {/* Upright Knuckle */}
            <line x1="90" y1="-30" x2="90" y2="40" stroke="#0369a1" strokeWidth="6" strokeLinecap="round" />

            {/* Coilover Spring (Zig-zag) */}
            <path
              d="M -30 -35 L -20 -15 L -40 5 L -20 25 L -40 40 L -30 45"
              stroke="#ef4444"
              strokeWidth="3.5"
              fill="none"
              strokeLinejoin="round"
            />
            {/* Remote Damper Reservoir */}
            <rect x="-70" y="-10" width="14" height="35" rx="3" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
          </g>

          <text x="165" y="200" fill="#0369a1" fontSize="10" fontFamily="monospace" fontWeight="bold">PUSHROD ROCKER & DYNAMIC CAMBER GAIN OK</text>
        </svg>
      );

    // ── 30. NVH ACOUSTICS & SOUND LAB ──
    case "nvh":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Anechoic Chamber Acoustic Ripples */}
          <g transform="translate(140, 105)">
            <circle cx="0" cy="0" r="15" stroke="#06b6d4" strokeWidth="2" fill="#e0f2fe" />
            <circle cx="0" cy="0" r="30" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
            <circle cx="0" cy="0" r="50" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
            <circle cx="0" cy="0" r="75" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="8 6" opacity="0.3" />
            {/* Microphone */}
            <rect x="-6" y="-12" width="12" height="24" rx="4" fill="#0f172a" />
            <line x1="0" y1="12" x2="0" y2="35" stroke="#0f172a" strokeWidth="2" />
          </g>

          {/* 12-Band FFT Frequency Equalizer Analyzer */}
          <g transform="translate(260, 45)">
            <rect x="0" y="0" width="220" height="110" rx="6" fill="#0f172a" stroke="#0891b2" strokeWidth="1.5" />
            {[20, 45, 75, 90, 60, 85, 100, 70, 50, 65, 40, 25].map((h, i) => (
              <g key={i} transform={`translate(${16 + i * 16}, ${100 - h})`}>
                <rect x="0" y="0" width="10" height={h} rx="2" fill={h > 80 ? "#ef4444" : h > 50 ? "#ca8a04" : "#10b981"} />
              </g>
            ))}
            <text x="15" y="16" fill="#22d3ee" fontSize="8" fontFamily="monospace">64 dBA WHISPER CABIN LEVEL</text>
          </g>

          <text x="175" y="200" fill="#0891b2" fontSize="10" fontFamily="monospace" fontWeight="bold">FAST-FOURIER ACOUSTIC HARMONICS OPTIMIZED</text>
        </svg>
      );

    // ── 31. DIGITAL TWIN TELEMETRY ──
    case "twin":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Holographic Wireframe Vehicle */}
          <g transform="translate(270, 110)">
            <path
              d="M -160 30 C -130 30 -110 5 -70 5 C -30 5 -10 -25 30 -25 C 70 -25 90 5 130 10 L 150 30 Z"
              stroke="#6366f1"
              strokeWidth="2.5"
              fill="#6366f1"
              fillOpacity="0.1"
              strokeDasharray="4 2"
            />
            {/* Radiating IoT Sensor Nodes */}
            {[
              { x: -110, y: 15, label: "STEER SENSOR" },
              { x: 0, y: -20, label: "THERMAL CPU" },
              { x: 90, y: 20, label: "BRAKE TEMP" },
            ].map((node, i) => (
              <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                <circle cx="0" cy="0" r="5" fill="#4f46e5" />
                <circle cx="0" cy="0" r="12" stroke="#818cf8" strokeWidth="1" className="animate-ping" />
                <text x="0" y="-12" textAnchor="middle" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">{node.label}</text>
              </g>
            ))}
          </g>

          <text x="170" y="200" fill="#4338ca" fontSize="10" fontFamily="monospace" fontWeight="bold">REAL-TIME CAN-BUS PACKETS: 2,500 MSG/SEC</text>
        </svg>
      );



    // ── 34. COMMERCIAL SALES LAUNCH ──
    case "sales":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Luxury Showroom Glass Pedestal */}
          <ellipse cx="270" cy="140" rx="140" ry="35" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
          {/* Delivery Car with Presentation Bow */}
          <g transform="translate(270, 95)">
            <path d="M -60 25 C -40 25 -30 5 0 5 C 30 5 40 25 60 25 Z" fill="#059669" fillOpacity="0.3" stroke="#059669" strokeWidth="2" />
            {/* Gift Ribbon Bow */}
            <circle cx="0" cy="5" r="8" fill="#ef4444" />
            <path d="M -12 2 Q 0 -10 12 2" stroke="#ef4444" strokeWidth="2" />
          </g>

          <text x="175" y="200" fill="#047857" fontSize="10" fontFamily="monospace" fontWeight="bold">64 GLOBAL SHOWROOM ALLOCATIONS 100% RESERVED</text>
        </svg>
      );

    // ── 35. WORLD COMPETITORS ──
    case "competitors":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Market Share Donut Chart */}
          <g transform="translate(180, 105)">
            <circle cx="0" cy="0" r="50" stroke="#0284c7" strokeWidth="20" strokeDasharray="180 140" fill="none" />
            <circle cx="0" cy="0" r="50" stroke="#e2e8f0" strokeWidth="20" strokeDasharray="140 180" fill="none" strokeDashoffset="180" />
            <text x="0" y="5" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="bold" fontFamily="monospace">18.4%</text>
            <text x="0" y="18" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">APEX SHARE</text>
          </g>

          {/* Competitor Spec Comparison Bars */}
          <g transform="translate(290, 55)">
            <text x="0" y="10" fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">APEX FLAGSHIP: 840 HP</text>
            <rect x="0" y="15" width="180" height="12" rx="3" fill="#0284c7" />

            <text x="0" y="45" fill="#475569" fontSize="8" fontFamily="monospace">RIVAL MARQUE A: 780 HP</text>
            <rect x="0" y="50" width="155" height="12" rx="3" fill="#cbd5e1" />

            <text x="0" y="80" fill="#475569" fontSize="8" fontFamily="monospace">RIVAL MARQUE B: 720 HP</text>
            <rect x="0" y="85" width="135" height="12" rx="3" fill="#cbd5e1" />
          </g>

          <text x="175" y="200" fill="#0284c7" fontSize="10" fontFamily="monospace" fontWeight="bold">GLOBAL OEM BENCHMARK LEADERSHIP VERIFIED</text>
        </svg>
      );

    // ── 36. ENGINEERING COMPARISON ──
    case "compare":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* 6-Axis Polygonal Radar Chart */}
          <g transform="translate(270, 105)">
            {/* Radar Webs */}
            <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Axis Lines */}
            <line x1="0" y1="0" x2="0" y2="-60" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="0" x2="52" y2="-30" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="0" x2="52" y2="30" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="60" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="0" x2="-52" y2="30" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="0" x2="-52" y2="-30" stroke="#94a3b8" strokeWidth="1" />

            {/* Apex Benchmark Polygon (Indigo) */}
            <polygon points="0,-55 48,-25 40,25 0,50 -45,28 -48,-25" fill="#6366f1" fillOpacity="0.25" stroke="#4f46e5" strokeWidth="2" />

            <text x="0" y="-66" textAnchor="middle" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">POWER</text>
            <text x="60" y="-30" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">AERO</text>
            <text x="60" y="35" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">GRIP</text>
            <text x="0" y="72" textAnchor="middle" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">WEIGHT</text>
            <text x="-65" y="35" textAnchor="end" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">RIGIDITY</text>
            <text x="-65" y="-30" textAnchor="end" fill="#4338ca" fontSize="7" fontFamily="monospace" fontWeight="bold">BRAKING</text>
          </g>

          <text x="175" y="200" fill="#4338ca" fontSize="10" fontFamily="monospace" fontWeight="bold">6-AXIS RADAR METRICS BENCHMARK NORMALIZED</text>
        </svg>
      );

    // ── 37. PROJECT GENESIS OVERVIEW ──
    case "project_overview":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Milestone Timeline Spine */}
          <line x1="60" y1="105" x2="480" y2="105" stroke="#b45309" strokeWidth="3" />

          {/* 5 Milestone Gateway Nodes */}
          {[
            { x: 90, label: "PHASE 1: CONCEPT", done: true },
            { x: 180, label: "PHASE 2: ENGINE", done: true },
            { x: 270, label: "PHASE 3: CHASSIS", done: true },
            { x: 360, label: "PHASE 4: AERO CFD", done: false },
            { x: 450, label: "PHASE 5: LAUNCH", done: false },
          ].map((m, i) => (
            <g key={i} transform={`translate(${m.x}, 105)`}>
              <circle cx="0" cy="0" r="14" fill={m.done ? "#b45309" : "#ffffff"} stroke="#b45309" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill={m.done ? "#ffffff" : "#b45309"} fontSize="8" fontWeight="bold">
                {m.done ? "✓" : i + 1}
              </text>
              <text x="0" y={i % 2 === 0 ? -22 : 28} textAnchor="middle" fill="#78350f" fontSize="7" fontFamily="monospace" fontWeight="bold">
                {m.label}
              </text>
            </g>
          ))}

          <text x="170" y="200" fill="#b45309" fontSize="10" fontFamily="monospace" fontWeight="bold">EXECUTIVE GATEWAY MILESTONE READINESS: 88%</text>
        </svg>
      );

    // ── 38. SIMULATION SETTINGS ──
    case "settings":
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          {/* Mechanical Clockwork Gear Mechanism */}
          <g transform="translate(230, 95)">
            <circle cx="0" cy="0" r="42" fill="#f8fafc" stroke="#64748b" strokeWidth="3" strokeDasharray="12 6" />
            <circle cx="0" cy="0" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <animateTransform attributeName="transform" type="rotate" from="0 230 95" to="360 230 95" dur="4s" repeatCount="indefinite" />
          </g>
          <g transform="translate(305, 115)">
            <circle cx="0" cy="0" r="32" fill="#f8fafc" stroke="#475569" strokeWidth="2.5" strokeDasharray="8 4" />
            <animateTransform attributeName="transform" type="rotate" from="0 305 115" to="-360 305 115" dur="3s" repeatCount="indefinite" />
          </g>

          <text x="170" y="195" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">GRAPHICS SHADERS & 120Hz TELEMETRY CALIBRATED</text>
        </svg>
      );

    // ── 39. DEFAULT FALLBACK ──
    default:
      return (
        <svg viewBox="0 0 540 220" className="w-full h-full max-h-56 select-none" fill="none">
          <g transform="translate(270, 100)">
            <circle cx="0" cy="0" r="75" stroke={accentColor} strokeWidth="2" strokeDasharray="16 8" opacity="0.6" className="animate-spin" />
            <circle cx="0" cy="0" r="50" stroke="#64748b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
            <circle cx="0" cy="0" r="28" fill={accentColor} fillOpacity="0.15" stroke={accentColor} strokeWidth="2" />
            <line x1="-90" y1="0" x2="90" y2="0" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="-90" x2="0" y2="90" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="5" fill={accentColor} />
          </g>
          <text x="180" y="200" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">SYNCHRONIZING APEX MULTI-PHYSICS RUNTIME</text>
        </svg>
      );
  }
};
