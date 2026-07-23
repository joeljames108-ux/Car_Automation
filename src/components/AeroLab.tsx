import { useMemo, useState } from "react";
import {
  Wind, CarFront, Layers3, Combine, Zap, Plane, Thermometer, Disc3,
  Video, Cpu, BarChart3, Gauge, TrendingUp, CircuitBoard, Bot, Sparkles,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import type { SimResult, AeroResearchConfig } from "../sim/types";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { CFDView } from "./ui/CFDView";
import { LineChart } from "./ui/LineChart";
import {
  FRONT_BUMPER_SHAPES, SIDEPOD_INLET_POSITIONS, UNDERBODY_FLOOR_TYPES,
  WHEEL_AERO_TYPES, MIRROR_AERO_TYPES, CFD_QUALITIES, AERO_MODES,
  ENDPLATE_DESIGNS, OIL_COOLER_PLACEMENTS, TRACKS,
} from "../sim/constants";
import type {
  FrontBumperShape, UnderbodyFloorType, WheelAeroType, MirrorAeroType,
  CfdQuality, AeroMode,
} from "../sim/types";

type Dept =
  | "front" | "sidepod" | "diffuser" | "underbody" | "active"
  | "rearwing" | "cooling" | "wheel" | "mirror" | "windtunnel"
  | "cfd" | "dashboard";

const DEPTS: { id: Dept; label: string; icon: React.ReactNode }[] = [
  { id: "front",      label: "Front Aero",      icon: <CarFront size={14} /> },
  { id: "sidepod",    label: "Sidepod",          icon: <Layers3 size={14} /> },
  { id: "diffuser",   label: "Diffuser",         icon: <Combine size={14} /> },
  { id: "underbody",  label: "Underbody",        icon: <Layers3 size={14} /> },
  { id: "rearwing",   label: "Rear Wing",        icon: <Plane size={14} /> },
  { id: "active",     label: "Active Aero",      icon: <Zap size={14} /> },
  { id: "cooling",    label: "Cooling",          icon: <Thermometer size={14} /> },
  { id: "wheel",      label: "Wheel Aero",       icon: <Disc3 size={14} /> },
  { id: "mirror",     label: "Mirrors",          icon: <Video size={14} /> },
  { id: "windtunnel", label: "Wind Tunnel",      icon: <Wind size={14} /> },
  { id: "cfd",        label: "CFD Supercomputer",icon: <Cpu size={14} /> },
  { id: "dashboard",  label: "Aero Dashboard",   icon: <BarChart3 size={14} /> },
];

function MetricBar({ label, value, accent = "accent" }: { label: string; value: number; accent?: "accent" | "ok" | "warn" | "danger" | "default" }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const color = accent === "ok" ? "bg-ok-500" : accent === "warn" ? "bg-warn-500" : accent === "danger" ? "bg-danger-500" : accent === "default" ? "bg-slate-500" : "bg-accent-500";
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-slate-400">{(pct).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AeroLab() {
  const { design, sim, updateAeroResearch } = useDesign();
  const ar = design.vehicle.aeroResearch;
  const [dept, setDept] = useState<Dept>("dashboard");

  const update = <K extends keyof AeroResearchConfig>(key: K, patch: Partial<AeroResearchConfig[K]>) =>
    updateAeroResearch({ [key]: typeof ar[key] === "object" ? { ...(ar[key] as object), ...patch } : patch } as Partial<AeroResearchConfig>);

  return (
    <div className="space-y-4">
      <div className="panel p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Wind size={20} className="text-accent-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Aerodynamics Research Center</h2>
              <p className="text-[10px] text-slate-500">Fine-tune downforce distribution & flow efficiency</p>
            </div>
          </div>
          
          {/* Quick Aero Balance Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-mono font-semibold mr-1">AUTO BALANCE:</span>
            <button
              onClick={() => {
                update("rearWing", { angleOfAttack: 12, elements: 2, gurneyFlap: true });
                update("front", { splitterExtension: 120, splitterAngle: 4 });
                update("diffuser", { angle: 12 });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-ok-500/15 border border-ok-500/30 text-ok-400 hover:bg-ok-500/25 transition-all shadow-sm"
              title="Set perfect 50/50 front-rear downforce distribution"
            >
              ⚖️ Perfect 50/50
            </button>
            <button
              onClick={() => {
                update("rearWing", { angleOfAttack: 22, elements: 3, gurneyFlap: true });
                update("front", { splitterExtension: 220, splitterAngle: 8, divePlanes: 2 });
                update("diffuser", { angle: 18, gurneyFlap: true });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all shadow-sm"
              title="Maximize total downforce for technical circuits"
            >
              🏎️ Max Downforce
            </button>
            <button
              onClick={() => {
                update("rearWing", { angleOfAttack: 2, elements: 1, gurneyFlap: false });
                update("front", { splitterExtension: 40, splitterAngle: 1, divePlanes: 0 });
                update("diffuser", { angle: 6, gurneyFlap: false });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all shadow-sm"
              title="Minimize drag coefficient for maximum top speed"
            >
              🚀 Low Drag Speed
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {DEPTS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDept(d.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                dept === d.id
                  ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
                  : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
              }`}
            >
              {d.icon}
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {dept === "front" && (
            <Section title="Front Aero Designer" icon={<CarFront size={16} />}>
              <Select<FrontBumperShape>
                label="Front Bumper Shape"
                value={ar.front.bumperShape}
                options={(Object.keys(FRONT_BUMPER_SHAPES) as FrontBumperShape[]).map((b) => ({ value: b, label: FRONT_BUMPER_SHAPES[b].label }))}
                onChange={(val) => update("front", { bumperShape: val })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Slider label="Air Dam" value={ar.front.airDam} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("front", { airDam: v })} />
                <Slider label="Splitter Extension" value={ar.front.splitterExtension} min={0} max={300} unit="mm" onChange={(v) => update("front", { splitterExtension: v })} />
                <Slider label="Splitter Angle" value={ar.front.splitterAngle} min={0} max={15} step={0.5} unit="°" onChange={(v) => update("front", { splitterAngle: v })} />
                <Slider label="Dive Planes (Canards)" value={ar.front.divePlanes} min={0} max={4} onChange={(v) => update("front", { divePlanes: v })} />
                <Slider label="Brake Cooling Ducts" value={ar.front.brakeDucts} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("front", { brakeDucts: v })} />
                <Slider label="Hood Vents" value={ar.front.hoodVents} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("front", { hoodVents: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Toggle label="Air Curtains" value={ar.front.airCurtains} onChange={(v) => update("front", { airCurtains: v })} />
                <Toggle label="Active Grille Shutters" value={ar.front.activeGrilleShutters} onChange={(v) => update("front", { activeGrilleShutters: v })} />
              </div>
            </Section>
          )}

          {dept === "sidepod" && (
            <Section title="Sidepod Designer" icon={<Layers3 size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Sidepod Width" value={ar.sidepod.width} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { width: v })} />
                <Slider label="Sidepod Height" value={ar.sidepod.height} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { height: v })} />
                <Slider label="Inlet Size" value={ar.sidepod.inletSize} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { inletSize: v })} />
                <Slider label="Undercut Depth" value={ar.sidepod.undercut} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { undercut: v })} />
                <Slider label="Cooling Outlet Size" value={ar.sidepod.outletSize} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { outletSize: v })} />
                <Slider label="Coke-Bottle Taper" value={ar.sidepod.cokeBottleTaper} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { cokeBottleTaper: v })} />
                <Slider label="Curvature" value={ar.sidepod.curvature} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("sidepod", { curvature: v })} />
                <Select label="Inlet Position" value={ar.sidepod.inletPosition} options={SIDEPOD_INLET_POSITIONS.map((p) => ({ value: p.value, label: p.label }))} onChange={(v) => update("sidepod", { inletPosition: v })} />
              </div>
              <div className="mt-3">
                <Toggle label="Sidepod Floor" value={ar.sidepod.floor} onChange={(v) => update("sidepod", { floor: v })} />
              </div>
            </Section>
          )}

          {dept === "diffuser" && (
            <Section title="Diffuser Designer" icon={<Combine size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Length" value={ar.diffuser.length} min={100} max={600} unit="mm" onChange={(v) => update("diffuser", { length: v })} />
                <Slider label="Angle" value={ar.diffuser.angle} min={0} max={25} step={0.5} unit="°" onChange={(v) => update("diffuser", { angle: v })} />
                <Slider label="Exit Height" value={ar.diffuser.exitHeight} min={20} max={160} unit="mm" onChange={(v) => update("diffuser", { exitHeight: v })} />
                <Slider label="Exit Width" value={ar.diffuser.exitWidth} min={800} max={1800} unit="mm" onChange={(v) => update("diffuser", { exitWidth: v })} />
                <Slider label="Tunnel Width" value={ar.diffuser.tunnelWidth} min={80} max={400} unit="mm" onChange={(v) => update("diffuser", { tunnelWidth: v })} />
                <Slider label="Tunnel Depth" value={ar.diffuser.tunnelDepth} min={20} max={120} unit="mm" onChange={(v) => update("diffuser", { tunnelDepth: v })} />
                <Slider label="Channels" value={ar.diffuser.channels} min={2} max={8} onChange={(v) => update("diffuser", { channels: v })} />
                <Slider label="Strakes" value={ar.diffuser.strakes} min={0} max={6} onChange={(v) => update("diffuser", { strakes: v })} />
                <Slider label="Strake Angle" value={ar.diffuser.strakeAngle} min={0} max={15} step={0.5} unit="°" onChange={(v) => update("diffuser", { strakeAngle: v })} />
                <Slider label="Kick-up Angle" value={ar.diffuser.kickupAngle} min={0} max={20} step={0.5} unit="°" onChange={(v) => update("diffuser", { kickupAngle: v })} />
              </div>
              <div className="mt-3">
                <Toggle label="Gurney Flap" value={ar.diffuser.gurneyFlap} onChange={(v) => update("diffuser", { gurneyFlap: v })} />
              </div>
            </Section>
          )}

          {dept === "underbody" && (
            <Section title="Underbody Designer" icon={<Layers3 size={16} />}>
              <div className="mb-3">
                <label className="label-mono mb-1.5 block">Floor Type</label>
                <ChoiceGrid<UnderbodyFloorType>
                  value={ar.underbody.floorType}
                  options={(Object.keys(UNDERBODY_FLOOR_TYPES) as UnderbodyFloorType[]).map((f) => ({ value: f, label: UNDERBODY_FLOOR_TYPES[f].label }))}
                  onChange={(v) => update("underbody", { floorType: v })}
                  columns={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Floor Fences" value={ar.underbody.floorFences} min={0} max={4} onChange={(v) => update("underbody", { floorFences: v })} />
                <Slider label="Cooling Channels" value={ar.underbody.coolingChannels} min={0} max={3} onChange={(v) => update("underbody", { coolingChannels: v })} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Toggle label="Skid Blocks" value={ar.underbody.skidBlocks} onChange={(v) => update("underbody", { skidBlocks: v })} />
                <Toggle label="Floor Edge Wings" value={ar.underbody.floorEdgeWings} onChange={(v) => update("underbody", { floorEdgeWings: v })} />
              </div>
            </Section>
          )}

          {dept === "rearwing" && (
            <Section title="Rear Wing Designer" icon={<Plane size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Elements" value={ar.rearWing.elements} min={1} max={3} onChange={(v) => update("rearWing", { elements: v })} />
                <Slider label="Span" value={ar.rearWing.span} min={800} max={2000} unit="mm" onChange={(v) => update("rearWing", { span: v })} />
                <Slider label="Chord Length" value={ar.rearWing.chord} min={100} max={400} unit="mm" onChange={(v) => update("rearWing", { chord: v })} />
                <Slider label="Angle of Attack" value={ar.rearWing.angleOfAttack} min={0} max={30} step={0.5} unit="°" onChange={(v) => update("rearWing", { angleOfAttack: v })} />
                <Select label="Endplate Design" value={ar.rearWing.endplateDesign} options={ENDPLATE_DESIGNS.map((p) => ({ value: p.value, label: p.label }))} onChange={(v) => update("rearWing", { endplateDesign: v })} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Toggle label="Swan-Neck Mount" value={ar.rearWing.swanNeckMount} onChange={(v) => update("rearWing", { swanNeckMount: v })} />
                <Toggle label="Gurney Flap" value={ar.rearWing.gurneyFlap} onChange={(v) => update("rearWing", { gurneyFlap: v })} />
                <Toggle label="Beam Wing" value={ar.rearWing.beamWing} onChange={(v) => update("rearWing", { beamWing: v })} />
              </div>
            </Section>
          )}

          {dept === "active" && (
            <Section title="Active Aero" icon={<Zap size={16} />}>
              <Toggle label="Enable Active Aero System" value={ar.active.enabled} onChange={(v) => update("active", { enabled: v })} />
              <div className={"mt-3 " + (ar.active.enabled ? "" : "opacity-40 pointer-events-none")}>
                <label className="label-mono mb-1.5 block">Mode</label>
                <ChoiceGrid<AeroMode>
                  value={ar.active.mode}
                  options={(Object.keys(AERO_MODES) as AeroMode[]).map((m) => ({ value: m, label: AERO_MODES[m].label }))}
                  onChange={(v) => update("active", { mode: v })}
                  columns={5}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  <Toggle label="Active Splitter" value={ar.active.activeSplitter} onChange={(v) => update("active", { activeSplitter: v })} />
                  <Toggle label="Adaptive Wing" value={ar.active.adaptiveWing} onChange={(v) => update("active", { adaptiveWing: v })} />
                  <Toggle label="Deployable Spoiler" value={ar.active.deployableSpoiler} onChange={(v) => update("active", { deployableSpoiler: v })} />
                  <Toggle label="Active Grille" value={ar.active.activeGrille} onChange={(v) => update("active", { activeGrille: v })} />
                  <Toggle label="Movable Diffuser Flap" value={ar.active.movableDiffuser} onChange={(v) => update("active", { movableDiffuser: v })} />
                  <Toggle label="Air Brake" value={ar.active.airBrake} onChange={(v) => update("active", { airBrake: v })} />
                  <Toggle label="Ride-Height Adjustment" value={ar.active.rideHeightAdj} onChange={(v) => update("active", { rideHeightAdj: v })} />
                  <Toggle label="DRS" value={ar.active.drs} onChange={(v) => update("active", { drs: v })} />
                </div>
                <div className="mt-3 max-w-xs">
                  <Slider label="DRS Opening Angle" value={ar.active.drsOpeningAngle} min={0} max={60} step={1} unit="°" onChange={(v) => update("active", { drsOpeningAngle: v })} />
                </div>
              </div>
            </Section>
          )}

          {dept === "cooling" && (
            <Section title="Cooling Aerodynamics" icon={<Thermometer size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Radiator Size" value={ar.cooling.radiatorSize} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { radiatorSize: v })} />
                <Slider label="Brake Ducts" value={ar.cooling.brakeDucts} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { brakeDucts: v })} />
                <Slider label="Battery Cooling" value={ar.cooling.batteryCooling} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { batteryCooling: v })} />
                <Slider label="Engine Bay Extraction" value={ar.cooling.engineBayExtraction} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { engineBayExtraction: v })} />
                <Slider label="Hood Vents" value={ar.cooling.hoodVents} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { hoodVents: v })} />
                <Slider label="Fender Vents" value={ar.cooling.fenderVents} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { fenderVents: v })} />
                <Slider label="Heat Shields" value={ar.cooling.heatShields} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("cooling", { heatShields: v })} />
                <Select label="Oil Cooler Placement" value={ar.cooling.oilCoolerPlacement} options={OIL_COOLER_PLACEMENTS.map((p) => ({ value: p.value, label: p.label }))} onChange={(v) => update("cooling", { oilCoolerPlacement: v })} />
              </div>
            </Section>
          )}

          {dept === "wheel" && (
            <Section title="Wheel Aero" icon={<Disc3 size={16} />}>
              <div className="mb-3">
                <label className="label-mono mb-1.5 block">Wheel Aero Type</label>
                <ChoiceGrid<WheelAeroType>
                  value={ar.wheel.wheelAero}
                  options={(Object.keys(WHEEL_AERO_TYPES) as WheelAeroType[]).map((w) => ({ value: w, label: WHEEL_AERO_TYPES[w].label }))}
                  onChange={(v) => update("wheel", { wheelAero: v })}
                  columns={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Spoke Pattern Openness" value={ar.wheel.spokePattern} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("wheel", { spokePattern: v })} />
                <Slider label="Wheel Arch Vents" value={ar.wheel.archVents} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("wheel", { archVents: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Toggle label="Tire Deflectors" value={ar.wheel.tireDeflectors} onChange={(v) => update("wheel", { tireDeflectors: v })} />
                <Toggle label="Mudguards" value={ar.wheel.mudguards} onChange={(v) => update("wheel", { mudguards: v })} />
              </div>
            </Section>
          )}

          {dept === "mirror" && (
            <Section title="Mirror & Camera Systems" icon={<Video size={16} />}>
              <label className="label-mono mb-1.5 block">Mirror Type</label>
              <ChoiceGrid<MirrorAeroType>
                value={ar.mirror}
                options={(Object.keys(MIRROR_AERO_TYPES) as MirrorAeroType[]).map((m) => ({ value: m, label: MIRROR_AERO_TYPES[m].label }))}
                onChange={(v) => updateAeroResearch({ mirror: v })}
                columns={2}
              />
              <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Drag Δ</div>
                  <div className="font-mono text-slate-300">{(MIRROR_AERO_TYPES[ar.mirror].dragDelta >= 0 ? "+" : "") + MIRROR_AERO_TYPES[ar.mirror].dragDelta.toFixed(3)}</div>
                </div>
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Visibility</div>
                  <div className="font-mono text-slate-300">{(MIRROR_AERO_TYPES[ar.mirror].visibilityFactor * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Cost</div>
                  <div className="font-mono text-slate-300">{MIRROR_AERO_TYPES[ar.mirror].costFactor.toFixed(1)}×</div>
                </div>
              </div>
            </Section>
          )}

          {dept === "windtunnel" && (
            <Section title="Wind Tunnel" icon={<Wind size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="Wind Speed" value={ar.windTunnel.windSpeed} min={40} max={350} step={5} unit=" km/h" onChange={(v) => update("windTunnel", { windSpeed: v })} />
                <Slider label="Yaw Angle" value={ar.windTunnel.yawAngle} min={-20} max={20} step={1} unit="°" onChange={(v) => update("windTunnel", { yawAngle: v })} />
                <Slider label="Pitch" value={ar.windTunnel.pitch} min={-5} max={5} step={0.5} unit="°" onChange={(v) => update("windTunnel", { pitch: v })} />
                <Slider label="Ride Height" value={ar.windTunnel.rideHeight} min={40} max={200} unit="mm" onChange={(v) => update("windTunnel", { rideHeight: v })} />
                <Slider label="Crosswind" value={ar.windTunnel.crosswind} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update("windTunnel", { crosswind: v })} />
              </div>
              <div className="mt-3">
                <Toggle label="Rolling Road" value={ar.windTunnel.rollingRoad} onChange={(v) => update("windTunnel", { rollingRoad: v })} />
              </div>
            </Section>
          )}

          {dept === "cfd" && (
            <Section title="CFD Supercomputer" icon={<Cpu size={16} />}>
              <label className="label-mono mb-1.5 block">Simulation Quality</label>
              <ChoiceGrid<CfdQuality>
                value={ar.cfd.quality}
                options={(Object.keys(CFD_QUALITIES) as CfdQuality[]).map((q) => ({ value: q, label: CFD_QUALITIES[q].label }))}
                onChange={(v) => update("cfd", { quality: v })}
                columns={5}
              />
              <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Accuracy</div>
                  <div className="font-mono text-slate-300">{(CFD_QUALITIES[ar.cfd.quality].accuracyFactor * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Sim Time</div>
                  <div className="font-mono text-slate-300">{CFD_QUALITIES[ar.cfd.quality].timeFactor.toFixed(1)}×</div>
                </div>
                <div className="bg-base-850 rounded p-2 border border-base-800 text-center">
                  <div className="label-mono text-slate-500">Cost</div>
                  <div className="font-mono text-slate-300">{CFD_QUALITIES[ar.cfd.quality].costFactor.toFixed(1)}×</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">Higher fidelity CFD subtly improves the realized drag coefficient and lowers flow-separation risk through better-informed design choices.</p>
            </Section>
          )}

          {dept === "dashboard" && <AeroDashboard sim={sim} ar={ar} update={update} />}
        </div>

        {/* Right rail: live metrics + visualization */}
        <div className="space-y-4">
          <CFDView aero={design.vehicle.aero} dragCoeff={sim.dragCoeff} liftCoeff={sim.liftCoeff} downforce={sim.downforce} />

          <Section title="Aero Metrics" icon={<Gauge size={16} />}>
            <div className="space-y-2">
              <MetricBar label="Cooling Efficiency" value={sim.coolingEfficiency} accent="ok" />
              <MetricBar label="Brake Cooling" value={sim.brakeCooling} accent="ok" />
              <MetricBar label="Ground Effect" value={sim.groundEffect} accent="accent" />
              <MetricBar label="Flow Separation Risk" value={sim.separationRisk} accent={sim.separationRisk > 0.6 ? "danger" : sim.separationRisk > 0.35 ? "warn" : "ok"} />
              <MetricBar label="Aero Noise" value={sim.aeroNoise} accent={sim.aeroNoise > 0.6 ? "warn" : "default"} />
            </div>
          </Section>

          <Section title="Downforce Split" icon={<TrendingUp size={16} />}>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Front Downforce" value={sim.frontDownforce} unit="N" accent="accent" />
              <StatTile label="Rear Downforce" value={sim.rearDownforce} unit="N" accent="accent" />
              <StatTile label="Aero Balance" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} sub="rear bias" />
              <StatTile label="Center of Pressure" value={sim.centerOfPressure.toFixed(2)} />
            </div>
          </Section>

          {dept !== "dashboard" && (
            <Section title="Drag & Downforce vs Speed" icon={<CircuitBoard size={16} />}>
              <LineChart
                series={[
                  { data: sim.dragVsSpeed.map((p) => ({ x: p.speed, y: p.downforce })), color: "#22d3ee", label: "Downforce (N)" },
                  { data: sim.dragVsSpeed.map((p) => ({ x: p.speed, y: p.drag })), color: "#f59e0b", label: "Drag (N)" },
                ]}
                xLabel="Speed" xUnit="km/h"
                height={170}
              />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function AeroDashboard({
  sim, ar, update,
}: {
  sim: SimResult;
  ar: AeroResearchConfig;
  update: <K extends keyof AeroResearchConfig>(key: K, patch: Partial<AeroResearchConfig[K]>) => void;
}) {
  const trackPredictions = useMemo(() => {
    return sim.lapTimes.map((lt) => {
      const t = TRACKS[lt.trackId];
      const formatLap = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = (secs % 60).toFixed(3);
        return m > 0 ? `${m}:${s.padStart(6, "0")}` : `${s}s`;
      };
      const fuel = (1 + sim.dragCoeff * 0.4).toFixed(2);
      return {
        id: lt.trackId,
        name: lt.trackName,
        country: t?.country || "Global",
        length: t?.length || 4.5,
        highSpeed: t?.highSpeed || false,
        lapTime: formatLap(lt.time),
        topSpeed: `${lt.topSpeed} km/h`,
        cornering: `${Math.round(lt.avgSpeed)} km/h`,
        fuel: `${fuel}×`,
      };
    });
  }, [sim.lapTimes, sim.dragCoeff]);

  const dfAt = (kmh: number) => {
    const ms = kmh / 3.6;
    return Math.round(0.5 * 1.225 * ms * ms * sim.frontalArea * (-sim.liftCoeff));
  };

  const recommendations = useMemo(() => {
    const recs: { text: string; tone: "ok" | "warn" | "danger" }[] = [];
    if (sim.separationRisk > 0.5) recs.push({ text: `Reduce diffuser angle by ${(Math.max(0, ar.diffuser.angle - 14)).toFixed(0)}° to limit flow separation.`, tone: "danger" });
    if (sim.aeroBalance < 0.45) recs.push({ text: "Rear downforce is low — increase wing AoA or add a Gurney flap for stability.", tone: "warn" });
    if (sim.aeroBalance > 0.62) recs.push({ text: "Front-heavy aero balance — reduce splitter extension or dive planes.", tone: "warn" });
    if (sim.dragCoeff > 0.4) recs.push({ text: "High drag — switch to aero disc wheels or enable active grille shutters.", tone: "warn" });
    if (sim.coolingEfficiency < 0.7) recs.push({ text: "Cooling is marginal — enlarge radiator or add hood/fender vents.", tone: "warn" });
    if (sim.groundEffect < 0.4 && ar.underbody.floorType === "flat") recs.push({ text: "Upgrade to Venturi or Ground Effect tunnels for more downforce.", tone: "ok" });
    if (sim.brakeCooling < 0.6) recs.push({ text: "Brake cooling is low — increase brake ducts or use open-spoke wheels.", tone: "warn" });
    if (recs.length === 0) recs.push({ text: "Aero setup is well balanced. Consider finer CFD fidelity for marginal gains.", tone: "ok" });
    return recs;
  }, [sim, ar]);

  const toneColor = (t: "ok" | "warn" | "danger") =>
    t === "ok" ? "text-ok-400 border-ok-500/40 bg-ok-500/10" :
    t === "warn" ? "text-warn-400 border-warn-500/40 bg-warn-500/10" :
    "text-danger-400 border-danger-500/40 bg-danger-500/10";

  return (
    <>
      <Section title="Aero Performance Dashboard" icon={<BarChart3 size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatTile label="Drag Coefficient" value={sim.dragCoeff.toFixed(3)} accent="accent" />
          <StatTile label="Lift Coefficient" value={sim.liftCoeff.toFixed(3)} accent="accent" />
          <StatTile label="Front Downforce" value={sim.frontDownforce} unit="N" />
          <StatTile label="Rear Downforce" value={sim.rearDownforce} unit="N" />
          <StatTile label="DF @ 100 km/h" value={dfAt(100)} unit="N" accent="ok" />
          <StatTile label="DF @ 200 km/h" value={dfAt(200)} unit="N" accent="ok" />
          <StatTile label="DF @ 300 km/h" value={dfAt(300)} unit="N" accent="ok" />
          <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
          <StatTile label="Cooling Eff." value={`${(sim.coolingEfficiency * 100).toFixed(0)}%`} accent="ok" />
          <StatTile label="Aero Balance" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} />
          <StatTile label="Center of Pressure" value={sim.centerOfPressure.toFixed(2)} />
          <StatTile label="Wind Noise" value={`${(sim.aeroNoise * 100).toFixed(0)}%`} accent={sim.aeroNoise > 0.6 ? "warn" : "default"} />
        </div>
      </Section>

      <Section title="Downforce vs Speed" icon={<TrendingUp size={16} />}>
        <LineChart
          series={[
            { data: sim.dragVsSpeed.map((p) => ({ x: p.speed, y: p.downforce })), color: "#22d3ee", label: "Downforce (N)" },
            { data: sim.dragVsSpeed.map((p) => ({ x: p.speed, y: p.drag })), color: "#f59e0b", label: "Drag (N)" },
          ]}
          xLabel="Speed" xUnit="km/h"
          height={200}
        />
      </Section>

      <Section title="Real-Time Track Predictions" icon={<CircuitBoard size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-base-800">
                <th className="text-left py-1.5 px-2 label-mono">Circuit</th>
                <th className="text-right py-1.5 px-2 label-mono">Est. Lap</th>
                <th className="text-right py-1.5 px-2 label-mono">Top Speed</th>
                <th className="text-right py-1.5 px-2 label-mono">Cornering</th>
                <th className="text-right py-1.5 px-2 label-mono">Fuel</th>
              </tr>
            </thead>
            <tbody>
              {trackPredictions.map((t) => (
                <tr key={t.id} className="border-b border-base-800/50 hover:bg-base-850/50">
                  <td className="py-1.5 px-2">
                    <div className="text-slate-200">{t.name}</div>
                    <div className="text-[10px] text-slate-500">{t.country} · {t.length} km · {t.highSpeed ? "High-speed" : "Technical"}</div>
                  </td>
                  <td className="text-right py-1.5 px-2 font-mono text-accent-300">{t.lapTime}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-slate-300">{t.topSpeed}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-slate-300">{t.cornering}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-warn-400">{t.fuel}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Chief Aero Engineer AI Assistant (Apex AI)" icon={<Bot size={18} className="text-cyan-400" />}>
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/90 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_35px_rgba(34,211,238,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
            <Bot size={110} className="text-cyan-400" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-sky-500/20 border border-cyan-400/50 text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Bot size={26} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-100">Dr. Elena Vance</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                    APEX CHIEF AERODYNAMICIST AI
                  </span>
                </div>

                {/* Quick Auto-Optimize All Button */}
                <button
                  onClick={() => {
                    update("rearWing", { angleOfAttack: 14, elements: 2, gurneyFlap: true, span: 1600 });
                    update("front", { splitterExtension: 140, splitterAngle: 4.5, airCurtains: true });
                    update("diffuser", { angle: 13, gurneyFlap: true, length: 450 });
                    update("underbody", { floorType: "ground_effect_tunnels", floorEdgeWings: true });
                    update("wheel", { wheelAero: "aero_discs" });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-purple-500/25 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/35 transition-all shadow-[0_0_16px_rgba(34,211,238,0.3)] active:scale-95"
                >
                  <Sparkles size={14} className="text-cyan-300 animate-spin" /> Auto-Optimize All Aero Setup
                </button>
              </div>

              {/* Advanced Efficiency Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="bg-base-950/80 rounded-lg p-2 border border-white/5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">L/D Efficiency Ratio</div>
                  <div className="font-mono text-xs font-bold text-cyan-300">{(-sim.liftCoeff / Math.max(0.01, sim.dragCoeff)).toFixed(2)}:1</div>
                </div>
                <div className="bg-base-950/80 rounded-lg p-2 border border-white/5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Aero Balance</div>
                  <div className="font-mono text-xs font-bold text-emerald-400">{(sim.aeroBalance * 100).toFixed(1)}% Front</div>
                </div>
                <div className="bg-base-950/80 rounded-lg p-2 border border-white/5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Flow Separation</div>
                  <div className={`font-mono text-xs font-bold ${sim.separationRisk > 0.5 ? "text-rose-400" : "text-emerald-400"}`}>
                    {(sim.separationRisk * 100).toFixed(0)}% Risk
                  </div>
                </div>
                <div className="bg-base-950/80 rounded-lg p-2 border border-white/5 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Cooling Index</div>
                  <div className="font-mono text-xs font-bold text-purple-300">{(sim.coolingEfficiency * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              {/* Dynamic Balance Diagnosis */}
              <div className="text-xs text-slate-300 leading-relaxed mb-3">
                {sim.aeroBalance < 0.46 ? (
                  <p>
                    <strong className="text-amber-400">Rear-Bias Understeer:</strong> Front downforce is insufficient (<span className="font-mono text-cyan-300">{(sim.aeroBalance * 100).toFixed(1)}% front</span>). At high speed, the front axle will wash out under braking and push through apex turns.
                  </p>
                ) : sim.aeroBalance > 0.55 ? (
                  <p>
                    <strong className="text-rose-400">Front-Heavy Oversteer:</strong> Excess front loading (<span className="font-mono text-cyan-300">{(sim.aeroBalance * 100).toFixed(1)}% front</span>). Severe risk of high-speed rear breakaway on fast corner entries.
                  </p>
                ) : (
                  <p>
                    <strong className="text-emerald-400">Optimum Aero Window:</strong> Handling balance is locked at <span className="font-mono text-emerald-300">{(sim.aeroBalance * 100).toFixed(1)}% front</span> / <span className="font-mono text-emerald-300">{((1 - sim.aeroBalance) * 100).toFixed(1)}% rear</span>. Exceptional turn-in precision and rear stability.
                  </p>
                )}
              </div>

              {/* Actionable Engineering Advice & 1-Click Trim Fix */}
              <div className="bg-base-950/80 rounded-xl p-3 border border-white/5 space-y-2 mb-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">RECOMMENDED ENGINEERING TRIM:</div>
                {sim.aeroBalance < 0.46 ? (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300">Increase Front Splitter extension to 180mm & angle to +4.5° to restore front authority.</span>
                    <button
                      onClick={() => {
                        update("front", { splitterExtension: 180, splitterAngle: 4.5 });
                        update("rearWing", { angleOfAttack: Math.max(2, ar.rearWing.angleOfAttack - 3) });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all shrink-0"
                    >
                      Apply Front Trim
                    </button>
                  </div>
                ) : sim.aeroBalance > 0.55 ? (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300">Add +4.0° Rear Wing AoA & Gurney flap to plant the rear axle.</span>
                    <button
                      onClick={() => {
                        update("rearWing", { angleOfAttack: Math.min(28, ar.rearWing.angleOfAttack + 5), gurneyFlap: true });
                        update("diffuser", { angle: 14 });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all shrink-0"
                    >
                      Apply Rear Trim
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span>✓ Aerodynamic trim is optimal for maximum high-speed grip. No further adjustments required.</span>
                  </div>
                )}
              </div>

              {/* Detailed Telemetry Recommendations */}
              <div className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${toneColor(r.tone)} flex items-start gap-2`}>
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
