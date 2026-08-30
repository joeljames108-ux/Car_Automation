import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Scale,
  Wind,
  Rocket,
  ChevronDown,
  Activity,
  Disc,
  Sliders,
  Gauge,
  Thermometer,
  BarChart3,
  Layers,
  Fan,
  Circle,
  Zap,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

/* ─── panel glass ─── */
const glassPanel =
  "rounded-2xl bg-[#0e1626]/70 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]";
const innerCard =
  "p-3.5 rounded-2xl bg-[#0e1626]/80 border border-white/8";

export function NeonAeroLab() {
  const { sim, updateAero } = useDesign();

  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [balanceMode, setBalanceMode] = useState<
    "balanced" | "max_downforce" | "low_drag"
  >("balanced");
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<"monthly" | "weekly">("monthly");
  const [frameMaterial, setFrameMaterial] = useState<string>(
    "Carbon Fiber (Standard)"
  );
  const [bodyMaterial, setBodyMaterial] = useState<string>(
    "Carbon Fiber (Advanced)"
  );
  const [frameDropdownOpen, setFrameDropdownOpen] = useState<boolean>(false);
  const [bodyDropdownOpen, setBodyDropdownOpen] = useState<boolean>(false);

  const camCanvasRef = useRef<HTMLCanvasElement | null>(null);

  /* ─── Live Racetrack Camera Feed Simulation ─── */
  useEffect(() => {
    const canvas = camCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderCam = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark asphalt & sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, "#0c1526");
      skyGrad.addColorStop(1, "#1e3557");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Distant green hills
      ctx.fillStyle = "#112e24";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.quadraticCurveTo(w * 0.35, h * 0.38, w * 0.7, h * 0.45);
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(0, h * 0.45);
      ctx.fill();

      // Asphalt Track
      const trackGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
      trackGrad.addColorStop(0, "#222d40");
      trackGrad.addColorStop(1, "#0d1420");
      ctx.fillStyle = trackGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Track kerb stripes (Red & White)
      ctx.strokeStyle = "#c96f6f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h);
      ctx.lineTo(w * 0.48, h * 0.45);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.88, h);
      ctx.lineTo(w * 0.52, h * 0.45);
      ctx.stroke();

      // Moving Sports Car on Track
      const carX = w * 0.5 + Math.sin(frame * 0.04) * 25;
      const carY = h * 0.68 + Math.cos(frame * 0.04) * 3;

      // Car Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.ellipse(carX, carY + 8, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Car Body (Sleek Dark Hypercar with Red Taillights)
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(carX - 18, carY - 6, 36, 12, 4);
      ctx.fill();

      // Red taillight strip
      ctx.fillStyle = "#c96f6f";
      ctx.fillRect(carX - 14, carY + 2, 7, 2);
      ctx.fillRect(carX + 7, carY + 2, 7, 2);

      // Cyan headlights reflection
      ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
      ctx.beginPath();
      ctx.arc(carX - 11, carY - 4, 3, 0, Math.PI * 2);
      ctx.arc(carX + 11, carY - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Camera Rec Indicator
      ctx.fillStyle = frame % 60 < 30 ? "#c96f6f" : "transparent";
      ctx.beginPath();
      ctx.arc(w - 12, 12, 3, 0, Math.PI * 2);
      ctx.fill();

      if (cameraActive) {
        animId = requestAnimationFrame(renderCam);
      }
    };

    if (cameraActive) {
      animId = requestAnimationFrame(renderCam);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraActive]);

  /* ─── Auto-Balance presets ─── */
  const handleAutoBalance = (
    mode: "balanced" | "max_downforce" | "low_drag"
  ) => {
    playHMIClickSound();
    setBalanceMode(mode);

    if (mode === "balanced") {
      updateAero({ wingAngle: 18, splitterLength: 55, diffuserAngle: 12 });
    } else if (mode === "max_downforce") {
      updateAero({ wingAngle: 32, splitterLength: 85, diffuserAngle: 18 });
    } else if (mode === "low_drag") {
      updateAero({ wingAngle: 6, splitterLength: 20, diffuserAngle: 6 });
    }
  };

  /* ─── Sub-Tabs definition (9 tabs from reference) ─── */
  const allSubTabs = [
    { id: "front_aero", label: "Front Aero", icon: <Shield size={12} /> },
    { id: "sidepod", label: "Sidepod", icon: <Layers size={12} /> },
    { id: "diffuser", label: "Diffuser", icon: <Fan size={12} /> },
    { id: "rear_ring", label: "Rear Ring", icon: <Circle size={12} /> },
    { id: "active_aero", label: "Active Aero", icon: <Zap size={12} /> },
    { id: "cooling", label: "Cooling", icon: <Thermometer size={12} /> },
    { id: "wheel_aero", label: "Wheel Aero", icon: <Disc size={12} /> },
    { id: "wind_tunnel", label: "Wind Tunnel", icon: <Sliders size={12} /> },
    { id: "dashboard", label: "Aero Dashboard", icon: <Activity size={12} /> },
  ];

  const isDashboardView = activeSubTab === "dashboard";

  /* ─── Auto-Balance Pills (shared between views) ─── */
  const AutoBalancePills = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
        AUTO BALANCE:
      </span>
      <button
        onClick={() => handleAutoBalance("balanced")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
 balanceMode === "balanced"
 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
 : "bg-white/[0.04] text-amber-200/60 hover:text-amber-50 border border-white/8"
 }`}
      >
        <Scale size={12} className="text-emerald-400" />
        <span>Perfect 50/50</span>
      </button>
      <button
        onClick={() => handleAutoBalance("max_downforce")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
 balanceMode === "max_downforce"
 ? "bg-sky-400/15 text-sky-300 border border-sky-400/35"
 : "bg-white/[0.04] text-amber-200/60 hover:text-amber-50 border border-white/8"
 }`}
      >
        <Wind size={12} className="text-sky-400" />
        <span>Max Downforce</span>
      </button>
      <button
        onClick={() => handleAutoBalance("low_drag")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
 balanceMode === "low_drag"
 ? "bg-sky-400/15 text-sky-300 border border-sky-400/35"
 : "bg-white/[0.04] text-amber-200/60 hover:text-amber-50 border border-white/8"
 }`}
      >
        <Rocket size={12} className="text-sky-400" />
        <span>Low Drag Speed</span>
      </button>
    </div>
  );

  /* ─── Sub-Tabs Ribbon (shared) ─── */
  const SubTabsRibbon = (
    <div className="flex items-center gap-1.5 flex-wrap py-1">
      {allSubTabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              playHMIClickSound();
              setActiveSubTab(tab.id);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
 isActive
 ? "bg-sky-400/20 text-sky-100 border border-sky-300/40"
 : "bg-white/[0.04] text-amber-200/60 hover:text-amber-50 border border-white/6"
 }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  /* ─── CFD Lab Data + Camera card (shared) ─── */
  const CfdLabCard = (
    <div className={`${innerCard} p-4 flex flex-col justify-between gap-2.5`}>
      <span className="text-xs font-bold text-amber-100/80 uppercase tracking-wider">
        CFD LAB DATA
      </span>
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-amber-200/60">Drag Cd:</span>
          <span className="font-bold text-amber-50">0.315</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-200/60">Power Loss:</span>
          <span className="font-bold text-amber-50">14 kW @ 200 km/h</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-white/8">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-50">Camera</span>
          <span className="text-[10px] text-amber-200/60">Racetrack Cam</span>
        </div>
        <button
          onClick={() => setCameraActive(!cameraActive)}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
 cameraActive ? "bg-sky-400/80" : "bg-slate-700/80"
 }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
 cameraActive ? "translate-x-4" : "translate-x-0"
 }`}
          />
        </button>
      </div>
      <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 relative bg-black">
        <canvas
          ref={camCanvasRef}
          width={240}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );

  /* ─── Aero Forces Chart card (shared) ─── */
  const AeroForcesChart = (
    <div className={`${innerCard} p-4 flex flex-col justify-between gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-100/80 uppercase tracking-wider">
            AERO FORCES OVER VELOCITY
          </span>
          <span className="w-2 h-2 rounded-full border border-sky-400" />
        </div>
        <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => setTimeScale("monthly")}
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all ${
 timeScale === "monthly"
 ? "bg-white text-slate-900 font-bold"
 : "text-amber-200/60"
 }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeScale("weekly")}
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all ${
 timeScale === "weekly"
 ? "bg-white text-slate-900 font-bold"
 : "text-amber-200/60"
 }`}
          >
            Weekly
          </button>
        </div>
      </div>
      <div className="w-full h-36 relative flex flex-col justify-between pt-1">
        <span className="text-[8px] text-amber-300/50 font-mono">Newtons</span>
        <div className="flex-1 w-full relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[7px] text-amber-400 font-mono pointer-events-none">
            <span>200</span>
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          <div className="absolute inset-y-0 left-6 right-2 flex justify-between items-end opacity-20 pointer-events-none">
            <div className="w-4 bg-slate-500 rounded-t-sm h-[30%]" />
            <div className="w-4 bg-slate-500 rounded-t-sm h-[50%]" />
            <div className="w-4 bg-slate-500 rounded-t-sm h-[70%]" />
            <div className="w-4 bg-slate-500 rounded-t-sm h-[85%]" />
            <div className="w-4 bg-slate-500 rounded-t-sm h-[95%]" />
          </div>
          <svg
            className="w-full h-full pl-6 overflow-visible"
            viewBox="0 0 180 75"
            preserveAspectRatio="none"
          >
            <path
              d="M 5 60 Q 50 50 90 40 T 175 18"
              fill="none"
              stroke="#8fb9d9"
              strokeWidth="2"
            />
            <path
              d="M 5 68 Q 60 55 105 35 T 175 12"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.8"
            />
            <path
              d="M 5 45 Q 70 52 120 62 T 175 70"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <div className="flex items-center justify-between text-[8px] text-amber-300/50 font-mono pl-6 pr-2 pt-1 border-t border-white/6">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     VIEW 1: FRAME & BODY MATERIALS (when NOT on Aero Dashboard tab)
     ========================================================================= */
  if (!isDashboardView) {
    return (
      <div className="w-full flex flex-col gap-4 text-amber-50 animate-nh-materialize select-none">
        {/* Title Row + Auto Balance */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-50">
              <Shield size={16} />
            </div>
            <h2 className="text-sm font-bold text-amber-50 tracking-wide uppercase">
              FRAME & BODY MATERIALS
            </h2>
          </div>
          {AutoBalancePills}
        </div>

        {/* Main grid: Left (materials) + Right (metrics + tabs + charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Materials panel (5 cols) */}
          <div
            className={`lg:col-span-5 flex flex-col justify-between gap-5 p-5 ${glassPanel}`}
          >
            {/* Dropdown 1: FRAME MATERIAL */}
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                FRAME MATERIAL
              </span>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setFrameDropdownOpen(!frameDropdownOpen);
                  setBodyDropdownOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-[#0e1626]/80 hover:bg-[#111a2b] border border-white/10 flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="text-sm font-medium text-amber-50">
                  {frameMaterial}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-amber-200/60 transition-transform ${
 frameDropdownOpen ? "rotate-180" : ""
 }`}
                />
              </button>
              {frameDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-2xl bg-[#0e1626] border border-white/15 shadow-2xl z-30 flex flex-col gap-1">
                  {[
                    "Carbon Fiber (Standard)",
                    "Forged Carbon Monocoque",
                    "Titanium Spaceframe",
                    "Aluminum Hydroformed",
                  ].map((mat) => (
                    <button
                      key={mat}
                      onClick={() => {
                        playHMIClickSound();
                        setFrameMaterial(mat);
                        setFrameDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
 frameMaterial === mat
 ? "bg-sky-400/15 text-sky-300 font-bold"
 : "text-amber-100/80 hover:bg-white/5"
 }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown 2: BODY MATERIAL */}
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                BODY MATERIAL
              </span>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setBodyDropdownOpen(!bodyDropdownOpen);
                  setFrameDropdownOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-[#0e1626]/80 hover:bg-[#111a2b] border border-white/10 flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="text-sm font-medium text-amber-50">
                  {bodyMaterial}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-amber-200/60 transition-transform ${
 bodyDropdownOpen ? "rotate-180" : ""
 }`}
                />
              </button>
              {bodyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-2xl bg-[#0e1626] border border-white/15 shadow-2xl z-30 flex flex-col gap-1">
                  {[
                    "Carbon Fiber (Advanced)",
                    "Aramid Graphene Matrix",
                    "Carbon-Kevlar Composite",
                    "Prepreg Fiberglass",
                  ].map((mat) => (
                    <button
                      key={mat}
                      onClick={() => {
                        playHMIClickSound();
                        setBodyMaterial(mat);
                        setBodyDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
 bodyMaterial === mat
 ? "bg-sky-400/15 text-sky-300 font-bold"
 : "text-amber-100/80 hover:bg-white/5"
 }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2x2 Indicators Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`${innerCard} flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  FRAME WT FACTOR
                </span>
                <span className="text-2xl font-extrabold text-amber-50 mt-2">
                  0.15
                </span>
              </div>
              <div className={`${innerCard} flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  FRAME STRENGTH
                </span>
                <span className="text-2xl font-extrabold text-amber-50 mt-2">
                  0.98
                </span>
              </div>
              <div className={`${innerCard} flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  FRAME $/kg
                </span>
                <span className="text-2xl font-extrabold text-amber-300 mt-2">
                  $180.00
                </span>
              </div>
              <div className={`${innerCard} flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  CORROSION RESIST
                </span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-2">
                  98%
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Metrics + Sub-Tabs + Charts (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 2 Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${innerCard} p-4 flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  TOP SPEED IMPACT
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-extrabold text-amber-50">
                    284{" "}
                    <span className="text-xs font-medium text-amber-200/60">
                      km/h
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 text-[10px] font-bold border border-sky-400/30">
                    Sports Pace
                  </span>
                </div>
              </div>
              <div className={`${innerCard} p-4 flex flex-col justify-between`}>
                <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
                  EST. LAP TIME IMPACT
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-extrabold text-amber-50">
                    146.22s
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Lap Shaved: -1.45s
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Tabs */}
            {SubTabsRibbon}

            {/* Bottom 2 charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CfdLabCard}
              {AeroForcesChart}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: AERODYNAMICS RESEARCH CENTER (when on Aero Dashboard tab)
     ========================================================================= */
  return (
    <div className="w-full flex flex-col gap-4 text-amber-50 animate-nh-materialize select-none">
      {/* Title Row + Auto Balance */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-50">
            <Gauge size={16} />
          </div>
          <h2 className="text-sm font-bold text-amber-50 tracking-wide uppercase">
            Aerodynamics Research Center
          </h2>
        </div>
        {AutoBalancePills}
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* DRAG CO */}
        <div className={`${innerCard} p-4 flex flex-col justify-between`}>
          <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
            DRAG CO
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-50">
              0.417
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Balanced
            </span>
          </div>
        </div>

        {/* DOWNFORCE LOAD */}
        <div className={`${innerCard} p-4 flex flex-col justify-between`}>
          <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
            DOWNFORCE LOAD
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-50">
              5774{" "}
              <span className="text-xs font-medium text-amber-200/60">N</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              High Cornering Grip
            </span>
          </div>
        </div>

        {/* TOP SPEED IMPACT */}
        <div className={`${innerCard} p-4 flex flex-col justify-between`}>
          <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
            TOP SPEED IMPACT
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-50">
              284{" "}
              <span className="text-xs font-medium text-amber-200/60">km/h</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 text-[10px] font-bold border border-sky-400/30">
              Sports Pace
            </span>
          </div>
        </div>

        {/* EST. LAP TIME IMPACT */}
        <div className={`${innerCard} p-4 flex flex-col justify-between`}>
          <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-wider">
            EST. LAP TIME IMPACT
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-50">
              146.22s
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Lap Shaved: -1.45s
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      {SubTabsRibbon}

      {/* Bottom 3-Column Layout: Aero Dashboard + CFD Lab Data + Aero Forces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Col 1: AERO PERFORMANCE DASHBOARD (3x3 grid) */}
        <div className={`${innerCard} p-4 flex flex-col gap-3`}>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-amber-100/80" />
            <span className="text-xs font-bold text-amber-100/80 uppercase tracking-wider">
              AERO PERFORMANCE DASHBOARD
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Row 1 */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                DRAG COEFFICIENT
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                0.417
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                LIFT COEFFICIENT
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                -0.897
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                FRONT DOWNFORCE
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                2741{" "}
                <span className="text-[9px] font-medium text-amber-200/60">N</span>
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                Dl @ 100 KM/H
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                924{" "}
                <span className="text-[9px] font-medium text-amber-200/60">N</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                Dl @ 200 KM/H
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                3695{" "}
                <span className="text-[9px] font-medium text-amber-200/60">N</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                TOP SPEED
              </span>
              <span className="text-lg font-extrabold text-amber-50">
                2813{" "}
                <span className="text-[9px] font-medium text-amber-200/60">
                  km/h
                </span>
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                COOLING EFFL.
              </span>
              <span className="text-lg font-extrabold text-amber-50">83%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                AERO BALANCE
              </span>
              <span className="text-lg font-extrabold text-amber-50">55%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-amber-300/50 uppercase tracking-wider">
                WIND NOISE
              </span>
              <span className="text-lg font-extrabold text-amber-50">64%</span>
            </div>
          </div>
        </div>

        {/* Col 2: CFD Lab Data + Camera */}
        {CfdLabCard}

        {/* Col 3: Aero Forces Over Velocity */}
        {AeroForcesChart}
      </div>
    </div>
  );
}
