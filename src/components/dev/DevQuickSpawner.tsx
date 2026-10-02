import React, { useState } from "react";
import {
  Rocket,
  Cog,
  Car,
  Wind,
  Sofa,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import type { Stage } from "../StageSwitcher";
import type { EngineLayout, EngineConfig } from "../../sim/types";

interface DevQuickSpawnerProps {
  onSelectStage: (stage: Stage) => void;
  onClose?: () => void;
}

interface PresetSpawns {
  id: string;
  name: string;
  badge: string;
  engineLayout: EngineLayout;
  cylinders: number;
  displacementCc: number;
  aspiration: "naturally_aspirated" | "turbocharged" | "supercharged" | "twin_turbo";
  powerHp: number;
  bodyType: string;
  platform: string;
  interiorType: string;
  aeroPackage: string;
  targetStage: Stage;
}

const PRESET_SPAWNS: PresetSpawns[] = [
  {
    id: "v12_hypercar",
    name: "V12 Hypercar Track Special",
    badge: "HYPERCAR",
    engineLayout: "v12",
    cylinders: 12,
    displacementCc: 6500,
    aspiration: "naturally_aspirated",
    powerHp: 780,
    bodyType: "supercar",
    platform: "carbon_monocoque",
    interiorType: "alcantara_track",
    aeroPackage: "active_drs_wing",
    targetStage: "vehicle",
  },
  {
    id: "v8_twin_turbo_gt",
    name: "V8 Twin-Turbo Grand Tourer",
    badge: "GT COUPE",
    engineLayout: "v8",
    cylinders: 8,
    displacementCc: 4400,
    aspiration: "twin_turbo",
    powerHp: 650,
    bodyType: "coupe",
    platform: "aluminum_spaceframe",
    interiorType: "nappa_leather_luxury",
    aeroPackage: "low_drag_touring",
    targetStage: "vehicle",
  },
  {
    id: "boxer6_turbo_sport",
    name: "Boxer-6 Turbocharged Sport",
    badge: "SPORTS CAR",
    engineLayout: "boxer6",
    cylinders: 6,
    displacementCc: 3600,
    aspiration: "turbocharged",
    powerHp: 480,
    bodyType: "coupe",
    platform: "rear_engine_sports",
    interiorType: "carbon_bucket_seats",
    aeroPackage: "ducktail_spoiler",
    targetStage: "aero_studio",
  },
  {
    id: "ev_hyperdrive",
    name: "800V Dual-Motor EV Hyperdrive",
    badge: "ELECTRIC",
    engineLayout: "v8", // Represented in base sim
    cylinders: 0,
    displacementCc: 0,
    aspiration: "naturally_aspirated",
    powerHp: 950,
    bodyType: "supercar",
    platform: "skateboard_ev",
    interiorType: "curved_oled_digital",
    aeroPackage: "ground_effect_venturi",
    targetStage: "interior",
  },
  {
    id: "classic_1970_i4",
    name: "1970 Classic Twin-Cam Inline-4",
    badge: "HISTORIC",
    engineLayout: "i4",
    cylinders: 4,
    displacementCc: 1990,
    aspiration: "naturally_aspirated",
    powerHp: 160,
    bodyType: "sedan",
    platform: "steel_unibody",
    interiorType: "analog_wood_trim",
    aeroPackage: "factory_clean",
    targetStage: "engine",
  },
];

export const DevQuickSpawner: React.FC<DevQuickSpawnerProps> = ({
  onSelectStage,
  onClose,
}) => {
  const { updateEngine, updateVehicle } = useDesign();
  const { setStageStatus } = useGuidedEngineeringStore();
  const { setOverride, devMode } = useDeveloperModeStore();

  const [selectedPreset, setSelectedPreset] = useState<string>("v12_hypercar");
  const [targetDestination, setTargetDestination] = useState<Stage>("vehicle");
  const [spawnStatus, setSpawnStatus] = useState<string | null>(null);

  const activePreset =
    PRESET_SPAWNS.find((p) => p.id === selectedPreset) || PRESET_SPAWNS[0];

  const handleSpawn = () => {
    // Ensure workflow gating doesn't block navigating into the studio
    setOverride("ignoreWorkflowGating", true);

    // 1. Update engine parameters
    updateEngine({
      layout: activePreset.engineLayout,
      cylinders: activePreset.cylinders,
      displacement: activePreset.displacementCc / 1000,
      aspiration: activePreset.aspiration,
      aspirationType: activePreset.aspiration === "twin_turbo" ? "twin_turbo" : activePreset.aspiration === "turbocharged" ? "single_turbo" : "na",
    } as Partial<EngineConfig>);

    // 2. Update vehicle parameters
    updateVehicle({
      platform: activePreset.platform,
      exterior: {
        bodyType: activePreset.bodyType,
      },
    } as any);

    // 3. Mark all prior stages as configured
    setStageStatus("engine", "configured");
    setStageStatus("vehicle", "configured");
    setStageStatus("aero", "configured");
    setStageStatus("interior", "configured");

    setSpawnStatus(`Spawned ${activePreset.name}! Teleporting...`);

    setTimeout(() => {
      onSelectStage(targetDestination);
      if (onClose) onClose();
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Rocket size={18} className="text-amber-400" />
            DIRECT TEST SPAWNER (BYPASS PIPELINE)
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Instantly assemble and inject any engine, chassis, interior, and aero configuration into active 3D memory.
          </p>
        </div>
        {!devMode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono">
            <ShieldAlert size={12} />
            <span>Dev Mode Recommended</span>
          </div>
        )}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_SPAWNS.map((preset) => {
          const isSelected = preset.id === selectedPreset;
          return (
            <div
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset.id);
                setTargetDestination(preset.targetStage);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/15 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "bg-slate-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-amber-300">
                    {preset.badge}
                  </span>
                  {isSelected && <CheckCircle2 size={16} className="text-amber-400" />}
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-100">{preset.name}</h4>
                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Cog size={12} className="text-amber-400" />
                    <span>
                      {preset.engineLayout.toUpperCase()} • {preset.powerHp} HP
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car size={12} className="text-cyan-400" />
                    <span className="capitalize">{preset.bodyType} ({preset.platform})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind size={12} className="text-teal-400" />
                    <span>{preset.aeroPackage}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sofa size={12} className="text-purple-400" />
                    <span>{preset.interiorType}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Stage Destination Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-3">
        <label className="block text-xs font-mono font-bold text-slate-300">
          TELEPORT DESTINATION AFTER SPAWN:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: "engine", label: "1. Engine Studio", icon: <Cog size={14} /> },
            { id: "vehicle", label: "2. Vehicle Studio", icon: <Car size={14} /> },
            { id: "aero_studio", label: "3. Aero Studio", icon: <Wind size={14} /> },
            { id: "interior", label: "4. Interior Studio", icon: <Sofa size={14} /> },
          ].map((dest) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => setTargetDestination(dest.id as Stage)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                targetDestination === dest.id
                  ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500"
              }`}
            >
              {dest.icon}
              <span>{dest.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spawn Action Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-mono text-emerald-400">
          {spawnStatus && <span>{spawnStatus}</span>}
        </div>
        <button
          type="button"
          onClick={handleSpawn}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono font-extrabold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Rocket size={16} />
          <span>SPAWN CONFIGURATION & LAUNCH</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
