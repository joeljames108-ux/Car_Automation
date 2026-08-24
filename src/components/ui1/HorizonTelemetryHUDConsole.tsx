import React, { useState, useEffect } from "react";
import {
  Gauge,
  Activity,
  Flame,
  ShieldCheck,
  Zap,
  Bot,
  BarChart3,
  Wind,
  Thermometer,
  TrendingUp,
  DollarSign,
  Cpu,
  Layers,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { useCompany } from "../../state/CompanyContext";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { HORIZONHorizonGlassPanel } from "./design/HORIZONHorizonGlassPanel";
import { HORIZONHorizonDataCard } from "./design/HORIZONHorizonDataCard";
import { HORIZONHorizonTabs } from "./design/HORIZONHorizonTabs";
import { HORIZONHorizonBadge } from "./design/HORIZONHorizonBadge";

export function HorizonTelemetryHUDConsole() {
  const { design, sim, updateEngine, updateAero } = useDesign();
  const { company } = useCompany();

  const [activeSubTab, setActiveSubTab] = useState<string>("cluster");
  const [rpm, setRpm] = useState(6400);
  const [speed, setSpeed] = useState(284);
  const [boostBar, setBoostBar] = useState(1.42);
  const [oilTemp, setOilTemp] = useState(98);
  const [brakeTemp, setBrakeTemp] = useState(380);

  // Live Telemetry Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const targetRpm = Math.floor(6800 + Math.sin(Date.now() / 500) * 1600);
      const targetSpeed = Math.floor(270 + Math.sin(Date.now() / 800) * 45);
      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.15));
      setSpeed((prev) => Math.round(prev + (targetSpeed - prev) * 0.15));
      setBoostBar(Number((1.2 + Math.sin(Date.now() / 400) * 0.4).toFixed(2)));
      setOilTemp(Math.round(95 + Math.sin(Date.now() / 1200) * 8));
      setBrakeTemp(Math.round(370 + Math.sin(Date.now() / 900) * 40));
    }, 70);
    return () => clearInterval(interval);
  }, []);

  const shiftLights = [1, 2, 3, 4, 5, 6, 7, 8];
  const activeLightsCount = Math.min(8, Math.max(0, Math.floor((rpm / 8500) * 8)));

  return (
    <div className="w-full flex flex-col gap-5 text-slate-100 animate-nh-materialize">
      {/* Navigation Tabs */}
      <HORIZONHorizonTabs
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
        tabs={[
          { id: "cluster", label: "Cockpit Telemetry Cluster", icon: <Gauge size={14} /> },
          { id: "ai_feed", label: "Apex AI Engineer Diagnostics", icon: <Bot size={14} /> },
          { id: "supply_matrix", label: "Supply Chain & Material Yield", icon: <DollarSign size={14} /> },
        ]}
      />

      {/* =========================================================================
          SUB-TAB 1: DIGITAL COCKPIT TELEMETRY CLUSTER
          ========================================================================= */}
      {activeSubTab === "cluster" && (
        <div className="flex flex-col gap-5">
          {/* Shift Light LED Array Header */}
          <HORIZONHorizonGlassPanel variant="secondary" corners="rounded" className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="nh-label-caps text-sky-400 text-xs">SHIFT LIGHTS:</span>
                <div className="flex items-center gap-1.5">
                  {shiftLights.map((idx) => {
                    const isActive = idx <= activeLightsCount;
                    const isRedline = idx >= 7;
                    return (
                      <div
                        key={idx}
                        className={`w-6 h-3 rounded-sm transition-all duration-75 ${
 isActive
 ? isRedline
 ? "bg-rose-500 animate-pulse"
 : "bg-sky-300"
 : "bg-slate-800 border border-white/5"
 }`}
                      />
                    );
                  })}
                </div>
              </div>

              <HORIZONHorizonBadge variant="live" pulse>
                POWERTRAIN NOMINAL
              </HORIZONHorizonBadge>
            </div>
          </HORIZONHorizonGlassPanel>

          {/* Main Gauges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Speedometer & Tachometer */}
            <HORIZONHorizonGlassPanel
              variant="primary"
              corners="reticle"
              glow="cyan"
              withScanline
              className="p-6 flex flex-col items-center justify-center text-center"
            >
              <span className="nh-label-caps text-slate-400 text-xs mb-2">VEHICLE VELOCITY</span>
              <div className="text-5xl font-black nh-font-headline nh-gradient-text-cyan">
                {speed} <span className="text-lg nh-font-mono text-slate-400">km/h</span>
              </div>

              <div className="w-full mt-6 flex justify-around border-t border-sky-400/15 pt-4 nh-font-mono text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">RPM</div>
                  <div className="text-sky-300 font-bold text-base">{rpm}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">GEAR</div>
                  <div className="text-sky-300 font-bold text-base">5 / 7</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">0-60 MPH</div>
                  <div className="text-emerald-300 font-bold text-base">{sim.accel0_60.toFixed(2)}s</div>
                </div>
              </div>
            </HORIZONHorizonGlassPanel>

            {/* Turbo Boost & Thermal Gauges */}
            <HORIZONHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "THERMAL & PRESSURE TELEMETRY",
                icon: <Thermometer size={14} />,
              }}
              className="p-5 flex flex-col gap-4"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs nh-font-mono mb-1">
                    <span className="text-slate-400">TURBO BOOST:</span>
                    <span className="text-amber-300 font-bold">{boostBar} BAR</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070c1b] rounded-full p-0.5 border border-white/10">
                    <div
                      style={{ width: `${(boostBar / 2.0) * 100}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs nh-font-mono mb-1">
                    <span className="text-slate-400">ENGINE OIL TEMP:</span>
                    <span className="text-sky-300 font-bold">{oilTemp} °C</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070c1b] rounded-full p-0.5 border border-white/10">
                    <div
                      style={{ width: `${(oilTemp / 130) * 100}%` }}
                      className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs nh-font-mono mb-1">
                    <span className="text-slate-400">BRAKE ROTOR TEMP:</span>
                    <span className="text-sky-300 font-bold">{brakeTemp} °C</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070c1b] rounded-full p-0.5 border border-white/10">
                    <div
                      style={{ width: `${(brakeTemp / 800) * 100}%` }}
                      className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-100"
                    />
                  </div>
                </div>
              </div>
            </HORIZONHorizonGlassPanel>

            {/* Aerodynamic Telemetry */}
            <HORIZONHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "AERODYNAMIC TELEMETRY",
                icon: <Wind size={14} />,
              }}
              className="p-5"
            >
              <div className="grid grid-cols-2 gap-3">
                <HORIZONHorizonDataCard
                  label="DRAG CD"
                  value={sim.dragCoeff.toFixed(3)}
                  accentColor="cyan"
                />
                <HORIZONHorizonDataCard
                  label="LIFT CL"
                  value={sim.liftCoeff.toFixed(3)}
                  accentColor="emerald"
                />
                <HORIZONHorizonDataCard
                  label="DOWNFORCE"
                  value={sim.downforce}
                  unit="N"
                  accentColor="gold"
                />
                <HORIZONHorizonDataCard
                  label="AERO BAL"
                  value={`${(sim.aeroBalance * 100).toFixed(0)}%`}
                  accentColor="magenta"
                />
              </div>
            </HORIZONHorizonGlassPanel>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: APEX AI ENGINEER DIAGNOSTICS STREAM
          ========================================================================= */}
      {activeSubTab === "ai_feed" && (
        <HORIZONHorizonGlassPanel
          variant="primary"
          corners="reticle"
          header={{
            title: "Apex AI Domain Agent Diagnostic Stream",
            icon: <Bot size={16} />,
            badge: <HORIZONHorizonBadge variant="live">25 DOMAIN AGENTS ONLINE</HORIZONHorizonBadge>,
          }}
          className="p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { agent: "AERODYNAMICS AGENT", rec: "Increase Rear Wing Angle by 2.5° to optimize high-speed cornering grip", impact: "+45N Downforce (-0.008 Cd)", priority: "high" },
              { agent: "POWERTRAIN ECU AGENT", rec: "Advance Ignition Timing by 1.2° across 4500-7500 RPM band", impact: "+18 HP (+22 Nm Torque)", priority: "medium" },
              { agent: "SUSPENSION DYNAMICS AGENT", rec: "Stiffen Front Anti-Roll Bar by 12% to eliminate understeer on turn-in", impact: "+0.04 Lateral G", priority: "medium" },
              { agent: "THERMAL MANAGEMENT AGENT", rec: "Expand Front Brake Cooling Duct aperture by 15mm", impact: "-45°C Rotor Peak Temp", priority: "high" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#070c1b]/80 border border-sky-400/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] nh-font-mono font-bold text-sky-400 uppercase tracking-widest">{item.agent}</span>
                    <HORIZONHorizonBadge variant={item.priority === "high" ? "coral" : "gold"}>
                      {item.priority} PRIORITY
                    </HORIZONHorizonBadge>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">{item.rec}</p>
                </div>
                <div className="text-[11px] nh-font-mono font-bold text-emerald-300 border-t border-white/10 pt-2 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  <span>{item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </HORIZONHorizonGlassPanel>
      )}

      {/* =========================================================================
          SUB-TAB 3: SUPPLY CHAIN & MATERIAL YIELD
          ========================================================================= */}
      {activeSubTab === "supply_matrix" && (
        <HORIZONHorizonGlassPanel
          variant="primary"
          corners="reticle"
          header={{
            title: "Supply Chain & Material Yield Matrix",
            icon: <DollarSign size={16} />,
          }}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HORIZONHorizonDataCard
              label="TOTAL REVENUE"
              value={`$${(company.totalRevenue / 1e6).toFixed(2)}M`}
              accentColor="emerald"
            />
            <HORIZONHorizonDataCard
              label="TOTAL UNIT COST"
              value={`$${(sim.totalCost / 1e3).toFixed(1)}k`}
              accentColor="cyan"
            />
            <HORIZONHorizonDataCard
              label="ESTIMATED MARGIN"
              value={`${sim.profitMargin.toFixed(1)}%`}
              accentColor="gold"
            />
          </div>
        </HORIZONHorizonGlassPanel>
      )}
    </div>
  );
}
