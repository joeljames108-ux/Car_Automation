/**
 * ============================================================================
 * COCKPIT ELECTRONICS & AVIATION AVIONICS SUITE
 * ============================================================================
 * Comprehensive automotive electronics and aerospace-inspired avionics suite
 * integrated directly into the Interactive Dashboard Configurator:
 * - Flight-Deck Command Bar: Master Avionics Power, E-Kill Guard, Launch Control,
 *   Pit Limiter, Glass Cockpit HUD (AR / Primary Flight Display), DO-178C Status
 * - 6 Categorized Decks covering all 20 Electronics & Avionics Modules
 * - Real-Time Bidirectional Synchronization with Three.js 3D Viewport & Store
 * - Live Avionics & Electrical Impact Telemetry (Power Watts, Bus Load, Cyber Risk)
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Cpu,
  Wifi,
  ShieldAlert,
  Zap,
  Radio,
  Plane,
  Compass,
  Navigation as NavIcon,
  Activity,
  DollarSign,
  Car,
  Thermometer,
  BatteryCharging,
  Wrench,
  Sparkles,
  Volume2,
  Snowflake,
  Sofa,
  Lightbulb,
  KeyRound,
  ParkingSquare,
  Eye,
  Crown,
  Brain,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Save,
  Layers,
  AlertTriangle,
  Power,
  Gauge,
  Sliders,
  RadioReceiver,
  Monitor,
  Mic,
  CircuitBoard,
  ChevronRight,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { simulate } from "../../sim/engine";
import {
  useInteriorDashboardConfigStore,
  type CameraPose,
  type HUDMode,
  type ClusterStyle,
  type InfotainmentMode,
} from "../../state/interiorDashboardConfigStore";
import { INFO_OS_TIERS, INFO_VOICE_LEVELS } from "../../sim/constants";
import {
  CLUSTER_LEVELS,
  INFOTAINMENT_SCREENS,
  SCREEN_TECH_OPTIONS,
  CONNECTIVITY_TIERS,
  CONNECTIVITY_EXTRAS,
  AUDIO_TIERS,
  CLIMATE_TIERS,
  CLIMATE_EXTRAS,
  SEAT_TIERS,
  SEAT_FEATURES,
  LIGHTING_TIERS,
  ADAS_LEVELS,
  PARKING_FEATURES,
  KEY_TYPES,
  HUD_TYPES,
  DASH_MATERIALS,
  ROOF_TYPES,
  CONVENIENCE_FEATURES,
  LUXURY_PACKAGE,
  AI_FEATURES,
  SAFETY_ELECTRONICS,
  type ClusterLevel,
} from "../../sim/electronicsData";
import type { InfotainmentConfig } from "../../sim/types";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

/* ---------- UI Sub-Components ---------- */

function ChoiceCard<T extends string | number>({
  value,
  options,
  onChange,
  columns = 3,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => {
              playHMIClickSound();
              onChange(o.value);
            }}
            className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
              selected
                ? "bg-cyan-950/70 border-cyan-400 text-white ring-1 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
            }`}
          >
            <div className="text-[11px] font-bold tracking-tight">{o.label}</div>
            {o.sub && (
              <div className="text-[9px] text-slate-400 mt-0.5 font-normal leading-tight">
                {o.sub}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
  icon,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playHMIClickSound();
        onChange(!value);
      }}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border transition-all text-left cursor-pointer ${
        value
          ? "bg-cyan-950/50 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        {icon && <span className={value ? "text-cyan-400" : "text-slate-500"}>{icon}</span>}
        <div className="truncate">
          <div className={`text-[11px] font-bold ${value ? "text-cyan-300" : "text-slate-300"}`}>
            {label}
          </div>
          {desc && <div className="text-[9px] text-slate-400 truncate">{desc}</div>}
        </div>
      </div>
      <span
        className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${
          value ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function ModuleStatsRow({ m }: { m: { cost: number; weight: number; power: number; luxury: number; tech: number } }) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
      <div>
        <div className="text-[8px] text-slate-400 uppercase font-mono">Cost</div>
        <div className="font-mono text-[10px] font-bold text-cyan-300">+${m.cost}</div>
      </div>
      <div>
        <div className="text-[8px] text-slate-400 uppercase font-mono">Mass</div>
        <div className="font-mono text-[10px] font-bold text-slate-300">+{m.weight}kg</div>
      </div>
      <div>
        <div className="text-[8px] text-slate-400 uppercase font-mono">Power</div>
        <div className="font-mono text-[10px] font-bold text-amber-400">{m.power}W</div>
      </div>
      <div>
        <div className="text-[8px] text-slate-400 uppercase font-mono">Tech</div>
        <div className="font-mono text-[10px] font-bold text-emerald-400">
          {Math.round(m.tech * 100)}%
        </div>
      </div>
    </div>
  );
}

interface CockpitElectronicsAvionicsSuiteProps {
  onSyncToVehicle: () => void;
  onSelectCameraPose?: (pose: CameraPose) => void;
}

export const CockpitElectronicsAvionicsSuite: React.FC<CockpitElectronicsAvionicsSuiteProps> = ({
  onSyncToVehicle,
  onSelectCameraPose,
}) => {
  const { design, updateInfotainment } = useDesign();
  const info = design.infotainment;
  const sim = useMemo(() => simulate(design), [design]);

  // 3D Dashboard Store Selectors & Setters
  const setHudMode = useInteriorDashboardConfigStore((s) => s.setHudMode);
  const setClusterStyle = useInteriorDashboardConfigStore((s) => s.setClusterStyle);
  const setInfotainmentMode = useInteriorDashboardConfigStore((s) => s.setInfotainmentMode);
  const setAmbientLightColor = useInteriorDashboardConfigStore((s) => s.setAmbientLightColor);
  const setLightingMode = useInteriorDashboardConfigStore((s) => s.setLightingMode);
  const activeHudMode = useInteriorDashboardConfigStore((s) => s.hudMode);

  // Local Aviation Cockpit Tactile Switch States
  const [masterAvionicsPower, setMasterAvionicsPower] = useState<boolean>(true);
  const [eKillSafetyGuard, setEKillSafetyGuard] = useState<boolean>(false);
  const [launchControlArmed, setLaunchControlArmed] = useState<boolean>(false);
  const [pitLimiter, setPitLimiter] = useState<boolean>(false);
  const [selectedDeck, setSelectedDeck] = useState<
    "all" | "displays" | "compute" | "autonomy" | "cabin" | "ai" | "impact"
  >("all");

  const setInfo = <K extends keyof InfotainmentConfig>(key: K, val: InfotainmentConfig[K]) => {
    updateInfotainment({ [key]: val } as Partial<InfotainmentConfig>);
  };

  // Cross-Sync Handlers
  const handleHudChange = (type: InfotainmentConfig["hudType"]) => {
    setInfo("hudType", type);
    const storeHud: HUDMode =
      type === "none" ? "off" : type === "ar" ? "performance" : "navigation";
    setHudMode(storeHud);
  };

  const handleClusterChange = (level: ClusterLevel) => {
    setInfo("clusterLevel", level);
    const storeCluster: ClusterStyle =
      level >= 6 ? "track" : level >= 4 ? "digital" : level === 3 ? "performance" : "analog";
    setClusterStyle(storeCluster);
  };

  const handleDisplayConfigChange = (disp: InfotainmentConfig["displayConfig"]) => {
    setInfo("displayConfig", disp);
    if (disp === "triple" || disp === "dual" || disp === "oled_17_curved") {
      setInfotainmentMode("performance");
    }
  };

  const handleLightingTierChange = (tier: InfotainmentConfig["lightingTier"]) => {
    setInfo("lightingTier", tier);
    if (tier === "dynamic" || tier === "music_sync" || tier === "color64" || tier === "multi") {
      setAmbientLightColor("cyan");
      setLightingMode("night");
    } else if (tier === "white") {
      setAmbientLightColor("amber");
      setLightingMode("day");
    } else {
      setAmbientLightColor("none");
      setLightingMode("day");
    }
  };

  const infotainmentSim = sim.infotainment;

  return (
    <div className="flex flex-col gap-4 w-full text-slate-100">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. AVIATION & FLIGHT-DECK TACTILE COMMAND BAR                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Plane size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-300">
                  AEROSPACE AVIONICS & COCKPIT ELECTRONICS
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-900/60 border border-cyan-600/40 text-cyan-300">
                  DO-178C LEVEL A CERTIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Triple-redundant steer-by-wire bus • Glass cockpit HUD • High-voltage traction power telemetry
              </p>
            </div>
          </div>

          {/* Master Bus Telemetry Badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              BUS: <span className="text-emerald-400 font-bold">CAN-FD + ETHERNET</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              TOTAL DRAW: <span className="text-amber-400 font-bold">{infotainmentSim.powerDraw} W</span>
            </div>
          </div>
        </div>

        {/* Tactical Aviation Toggles Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {/* Master Avionics Power */}
          <button
            type="button"
            onClick={() => {
              playHMIClickSound();
              setMasterAvionicsPower(!masterAvionicsPower);
            }}
            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
              masterAvionicsPower
                ? "bg-emerald-950/40 border-emerald-500/70 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Power size={14} />
              <span className={`w-2 h-2 rounded-full ${masterAvionicsPower ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            </div>
            <div className="mt-2 text-left">
              <div className="text-[10px] font-black uppercase">AVIONICS POWER</div>
              <div className="text-[9px] font-mono">{masterAvionicsPower ? "ARMED / ONLINE" : "COLD SHUTDOWN"}</div>
            </div>
          </button>

          {/* Emergency E-Kill Guard Switch */}
          <button
            type="button"
            onClick={() => {
              playHMIClickSound();
              setEKillSafetyGuard(!eKillSafetyGuard);
            }}
            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
              eKillSafetyGuard
                ? "bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <AlertTriangle size={14} />
              <span className={`w-2 h-2 rounded-full ${eKillSafetyGuard ? "bg-red-500" : "bg-slate-600"}`} />
            </div>
            <div className="mt-2 text-left">
              <div className="text-[10px] font-black uppercase">E-KILL GUARD</div>
              <div className="text-[9px] font-mono">{eKillSafetyGuard ? "TRIGGERED" : "GUARD CLOSED"}</div>
            </div>
          </button>

          {/* Launch Control Armed */}
          <button
            type="button"
            onClick={() => {
              playHMIClickSound();
              setLaunchControlArmed(!launchControlArmed);
            }}
            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
              launchControlArmed
                ? "bg-amber-950/50 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Zap size={14} />
              <span className={`w-2 h-2 rounded-full ${launchControlArmed ? "bg-amber-400" : "bg-slate-600"}`} />
            </div>
            <div className="mt-2 text-left">
              <div className="text-[10px] font-black uppercase">LAUNCH CONTROL</div>
              <div className="text-[9px] font-mono">{launchControlArmed ? "BOOST ARMED" : "STANDBY"}</div>
            </div>
          </button>

          {/* Pit Lane Limiter */}
          <button
            type="button"
            onClick={() => {
              playHMIClickSound();
              setPitLimiter(!pitLimiter);
            }}
            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
              pitLimiter
                ? "bg-blue-950/50 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Sliders size={14} />
              <span className={`w-2 h-2 rounded-full ${pitLimiter ? "bg-blue-400" : "bg-slate-600"}`} />
            </div>
            <div className="mt-2 text-left">
              <div className="text-[10px] font-black uppercase">PIT LIMITER</div>
              <div className="text-[9px] font-mono">{pitLimiter ? "ACTIVE (60 KM/H)" : "OFF"}</div>
            </div>
          </button>

          {/* 3D Glass HUD Mode */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between w-full text-slate-400">
              <Eye size={14} />
              <span className="text-[9px] font-mono text-cyan-400 font-bold">{activeHudMode.toUpperCase()}</span>
            </div>
            <div className="mt-2">
              <div className="text-[10px] font-black uppercase text-slate-200">HUD PROJECTION</div>
              <div className="flex items-center gap-1 mt-1">
                {(["off", "minimal", "performance", "navigation"] as const).map((hm) => (
                  <button
                    key={hm}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setHudMode(hm);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${
                      activeHudMode === hm
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {hm === "performance" ? "PERF" : hm === "navigation" ? "NAV" : hm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Starlink / Satellite Datalink */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between w-full">
              <Radio size={14} className="text-purple-400" />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="mt-2 text-left">
              <div className="text-[10px] font-black uppercase text-slate-200">STARLINK / LEO</div>
              <div className="text-[9px] font-mono text-purple-300 truncate">V2X MESH ACTIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DECK FILTER TABS                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
        {(
          [
            { id: "all", label: "ALL 20 MODULES", icon: Layers },
            { id: "displays", label: "DISPLAYS & HUD", icon: Monitor },
            { id: "compute", label: "COMPUTE & OS", icon: Cpu },
            { id: "autonomy", label: "AUTONOMY & ADAS", icon: Car },
            { id: "cabin", label: "ENVIRONMENT & SOUND", icon: Snowflake },
            { id: "ai", label: "AI & SMART ACCESS", icon: Brain },
            { id: "impact", label: "LIVE TELEMETRY IMPACT", icon: Activity },
          ] as const
        ).map((d) => {
          const Icon = d.icon;
          const active = selectedDeck === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                playHMITabSound();
                setSelectedDeck(d.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-cyan-600 text-white shadow-md ring-1 ring-cyan-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon size={13} />
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. COMPREHENSIVE MODULES GRID                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        {/* =========================================================== */}
        {/* COLUMN / CARD A: GLASS COCKPIT DISPLAYS & COMPUTE           */}
        {/* =========================================================== */}
        {(selectedDeck === "all" || selectedDeck === "displays" || selectedDeck === "compute") && (
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Monitor size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                    DISPLAYS, HUD & OPERATING SYSTEM
                  </h3>
                  <p className="text-[10px] text-slate-400">Glass cockpit cluster, hyperscreen & OS</p>
                </div>
              </div>
            </div>

            {/* 1. Instrument Cluster */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <span>1. Glass Cockpit Cluster</span>
                <span className="font-mono text-cyan-400 text-[10px]">Level {info.clusterLevel}</span>
              </div>
              <ChoiceCard
                value={info.clusterLevel}
                columns={2}
                options={(Object.keys(CLUSTER_LEVELS) as unknown as string[]).map((k) => ({
                  value: Number(k) as ClusterLevel,
                  label: CLUSTER_LEVELS[Number(k) as ClusterLevel].label,
                  sub: CLUSTER_LEVELS[Number(k) as ClusterLevel].sub,
                }))}
                onChange={handleClusterChange}
              />
              <ModuleStatsRow m={CLUSTER_LEVELS[info.clusterLevel]} />
            </div>

            {/* 2. Infotainment Screen Size */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                2. Infotainment Display Configuration
              </label>
              <ChoiceCard
                value={info.displayConfig}
                columns={3}
                options={INFOTAINMENT_SCREENS.map((s) => ({
                  value: s.value as InfotainmentConfig["displayConfig"],
                  label: s.label,
                }))}
                onChange={handleDisplayConfigChange}
              />
            </div>

            {/* 2b. Display Technology */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                2b. Panel Display Matrix Tech
              </label>
              <ChoiceCard
                value={info.displayTech}
                columns={4}
                options={SCREEN_TECH_OPTIONS.map((t) => ({
                  value: t.value as InfotainmentConfig["displayTech"],
                  label: t.label,
                }))}
                onChange={(v) => setInfo("displayTech", v)}
              />
            </div>

            {/* 3. Operating System */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                3. Operating System & Compute Architecture
              </label>
              <ChoiceCard
                value={info.osTier}
                columns={2}
                options={(Object.keys(INFO_OS_TIERS) as InfotainmentConfig["osTier"][]).map((k) => ({
                  value: k,
                  label: INFO_OS_TIERS[k].label,
                  sub: INFO_OS_TIERS[k].description,
                }))}
                onChange={(v) => setInfo("osTier", v)}
              />

              {info.osTier !== "none" && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <ToggleRow
                    label="OTA Updates"
                    value={info.otaUpdates}
                    onChange={(v) => setInfo("otaUpdates", v)}
                  />
                  <ToggleRow
                    label="App Store"
                    value={info.appStore}
                    onChange={(v) => setInfo("appStore", v)}
                  />
                  <ToggleRow
                    label="Multi-User"
                    value={info.multiUser}
                    onChange={(v) => setInfo("multiUser", v)}
                  />
                  <ToggleRow
                    label="Cloud Backup"
                    value={info.cloudBackup}
                    onChange={(v) => setInfo("cloudBackup", v)}
                  />
                  <ToggleRow
                    label="Split-Screen"
                    value={info.splitScreen}
                    onChange={(v) => setInfo("splitScreen", v)}
                  />
                  <ToggleRow
                    label="AI Chatbot"
                    value={info.aiChatbot}
                    onChange={(v) => setInfo("aiChatbot", v)}
                  />
                </div>
              )}
            </div>

            {/* 12. Head-Up Display (HUD) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                12. Aviation Head-Up Display (HUD)
              </label>
              <ChoiceCard
                value={info.hudType}
                columns={2}
                options={(Object.keys(HUD_TYPES) as InfotainmentConfig["hudType"][]).map((k) => ({
                  value: k,
                  label: HUD_TYPES[k].label,
                  sub: HUD_TYPES[k].sub,
                }))}
                onChange={handleHudChange}
              />
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/* COLUMN / CARD B: AUTONOMY, ADAS & CONNECTIVITY              */}
        {/* =========================================================== */}
        {(selectedDeck === "all" || selectedDeck === "autonomy" || selectedDeck === "compute") && (
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Car size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                    AUTONOMOUS FLIGHT/DRIVE & SENSORS
                  </h3>
                  <p className="text-[10px] text-slate-400">ADAS L0-L5, 360° Vision, Radar & Datalink</p>
                </div>
              </div>
            </div>

            {/* 9. Driver Assistance (ADAS) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <span>9. Autonomy Level (ADAS)</span>
                <span className="font-mono text-emerald-400 text-[10px]">Level {info.adasLevel}</span>
              </div>
              <ChoiceCard
                value={info.adasLevel}
                columns={3}
                options={[0, 1, 2, 3, 4, 5].map((lv) => ({
                  value: lv as InfotainmentConfig["adasLevel"],
                  label: ADAS_LEVELS[lv as InfotainmentConfig["adasLevel"]].label,
                  sub: ADAS_LEVELS[lv as InfotainmentConfig["adasLevel"]].sub,
                }))}
                onChange={(v) => setInfo("adasLevel", v)}
              />
              <ModuleStatsRow m={ADAS_LEVELS[info.adasLevel]} />
            </div>

            {/* 4. Connectivity & Telematics */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                4. Datalink & Cellular Bandwidth
              </label>
              <ChoiceCard
                value={info.connectivityTier}
                columns={3}
                options={(Object.keys(CONNECTIVITY_TIERS) as InfotainmentConfig["connectivityTier"][]).map(
                  (k) => ({
                    value: k,
                    label: CONNECTIVITY_TIERS[k].label,
                    sub: CONNECTIVITY_TIERS[k].sub,
                  })
                )}
                onChange={(v) => setInfo("connectivityTier", v)}
              />

              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {CONNECTIVITY_EXTRAS.map((ex) => (
                  <ToggleRow
                    key={ex.key}
                    label={ex.label}
                    desc={ex.desc}
                    value={(info.connExtras as Record<string, boolean>)[ex.key]}
                    onChange={(v) => setInfo("connExtras", { ...info.connExtras, [ex.key]: v })}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                <ToggleRow label="V2V Mesh" value={info.v2v} onChange={(v) => setInfo("v2v", v)} />
                <ToggleRow label="V2I Traffic" value={info.v2i} onChange={(v) => setInfo("v2i", v)} />
                <ToggleRow
                  label="Cloud Sync"
                  value={info.cloudSync}
                  onChange={(v) => setInfo("cloudSync", v)}
                />
              </div>
            </div>

            {/* 10. Automated Parking */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                10. Ground & Valet Parking Systems
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PARKING_FEATURES.map((pf) => (
                  <ToggleRow
                    key={pf.key}
                    label={pf.label}
                    desc={pf.desc}
                    value={(info.parking as Record<string, boolean>)[pf.key]}
                    onChange={(v) => setInfo("parking", { ...info.parking, [pf.key]: v })}
                  />
                ))}
              </div>
            </div>

            {/* 18. Safety Electronics */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                18. Active Radar & Safety Electronics
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SAFETY_ELECTRONICS.map((se) => (
                  <ToggleRow
                    key={se.key}
                    label={se.label}
                    desc={se.desc}
                    value={(info.safetyElectronics as Record<string, boolean>)[se.key]}
                    onChange={(v) =>
                      setInfo("safetyElectronics", { ...info.safetyElectronics, [se.key]: v })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/* COLUMN / CARD C: ENVIRONMENT, SOUND & TELEMETRY IMPACT      */}
        {/* =========================================================== */}
        {(selectedDeck === "all" || selectedDeck === "cabin" || selectedDeck === "ai" || selectedDeck === "impact") && (
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                    CABIN ENVIRONMENT & LIVE IMPACT
                  </h3>
                  <p className="text-[10px] text-slate-400">Audio acoustics, climate & electrical draw</p>
                </div>
              </div>
            </div>

            {/* 5. Audio Systems */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                5. High-Fidelity Audio Acoustics
              </label>
              <ChoiceCard
                value={info.audioTier}
                columns={2}
                options={(Object.keys(AUDIO_TIERS) as InfotainmentConfig["audioTier"][]).map((k) => ({
                  value: k,
                  label: AUDIO_TIERS[k].label,
                  sub: AUDIO_TIERS[k].sub,
                }))}
                onChange={(v) => setInfo("audioTier", v)}
              />
              <ModuleStatsRow m={AUDIO_TIERS[info.audioTier]} />
            </div>

            {/* 6. Climate Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                6. Environmental HVAC & Ionization
              </label>
              <ChoiceCard
                value={info.climateTier}
                columns={3}
                options={(Object.keys(CLIMATE_TIERS) as InfotainmentConfig["climateTier"][]).map((k) => ({
                  value: k,
                  label: CLIMATE_TIERS[k].label,
                  sub: CLIMATE_TIERS[k].sub,
                }))}
                onChange={(v) => setInfo("climateTier", v)}
              />
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {CLIMATE_EXTRAS.map((ex) => (
                  <ToggleRow
                    key={ex.key}
                    label={ex.label}
                    desc={ex.desc}
                    value={(info.climateExtras as Record<string, boolean>)[ex.key]}
                    onChange={(v) =>
                      setInfo("climateExtras", { ...info.climateExtras, [ex.key]: v })
                    }
                  />
                ))}
              </div>
            </div>

            {/* 8. Active Interior Lighting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                8. Interior Ambient Neon Lighting
              </label>
              <ChoiceCard
                value={info.lightingTier}
                columns={2}
                options={(Object.keys(LIGHTING_TIERS) as InfotainmentConfig["lightingTier"][]).map(
                  (k) => ({
                    value: k,
                    label: LIGHTING_TIERS[k].label,
                    sub: LIGHTING_TIERS[k].sub,
                  })
                )}
                onChange={handleLightingTierChange}
              />
            </div>

            {/* 17. AI Co-Pilot Features */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                17. AI Co-Pilot & Neural Assistant
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {AI_FEATURES.map((af) => (
                  <ToggleRow
                    key={af.key}
                    label={af.label}
                    desc={af.desc}
                    value={(info.aiFeatures as Record<string, boolean>)[af.key]}
                    onChange={(v) => setInfo("aiFeatures", { ...info.aiFeatures, [af.key]: v })}
                  />
                ))}
              </div>
            </div>

            {/* 11. Key & Smart Access */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                11. Access Keys & Digital Cryptography
              </label>
              <ChoiceCard
                value={info.keyType}
                columns={3}
                options={(Object.keys(KEY_TYPES) as InfotainmentConfig["keyType"][]).map((k) => ({
                  value: k,
                  label: KEY_TYPES[k].label,
                  sub: KEY_TYPES[k].sub,
                }))}
                onChange={(v) => setInfo("keyType", v)}
              />
            </div>

            {/* 19. Remote Vehicle Control App */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                19. Remote Vehicle Control App
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    "lockUnlock",
                    "startEngine",
                    "climateControl",
                    "locateVehicle",
                    "openTrunk",
                    "chargeScheduling",
                  ] as const
                ).map((k) => (
                  <ToggleRow
                    key={k}
                    label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                    value={info.remoteApp[k]}
                    onChange={(v) => setInfo("remoteApp", { ...info.remoteApp, [k]: v })}
                  />
                ))}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* LIVE TELEMETRY IMPACT CONSOLE                           */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-black uppercase text-slate-200">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Activity size={14} /> Live Avionics Impact Telemetry
                </span>
                <span className="font-mono text-emerald-400">
                  +${infotainmentSim.retailPriceImpact.toLocaleString()} MSRP
                </span>
              </div>

              {/* Generated Trim Badge */}
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[9px] font-mono text-slate-400 uppercase">Generated Cockpit Trim</div>
                <div className="text-sm font-black text-cyan-300">{infotainmentSim.trimName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{infotainmentSim.trimDescription}</div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 uppercase text-[8px]">Power Draw</div>
                  <div className="font-mono text-xs font-bold text-amber-400">{infotainmentSim.powerDraw} W</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 uppercase text-[8px]">Avionics Mass</div>
                  <div className="font-mono text-xs font-bold text-slate-200">{infotainmentSim.weight} kg</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 uppercase text-[8px]">Cyber Risk</div>
                  <div className={`font-mono text-xs font-bold ${
                    infotainmentSim.cybersecurityRisk > 0.4 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {Math.round(infotainmentSim.cybersecurityRisk * 100)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    playHMITabSound();
                    onSyncToVehicle();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Save size={14} />
                  <span>SYNC AVIONICS TO VEHICLE</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
