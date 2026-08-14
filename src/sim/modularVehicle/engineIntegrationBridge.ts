// ===================================================================
// ENGINE TAB INTEGRATION BRIDGE
// ===================================================================
// Integrates the engine designed in the Engine Tab directly into the
// Vehicle Assembly System without duplicating engine logic or rendering.
// Converts EngineConfig + EngineSim -> ModularComponent asset.
// ===================================================================

import type { EngineConfig, EngineSim, EngineLayout } from "../types";
import type {
  ModularComponent,
  ComponentEngineeringData,
  MountingPoint,
} from "./types";

/** Physical bounding dimensions and base dry mass per engine layout architecture (mm & kg) */
const ENGINE_LAYOUT_SPECIFICATIONS: Record<
  EngineLayout,
  { width: number; height: number; depth: number; baseMassKg: number }
> = {
  i3:       { width: 450, height: 600, depth: 500, baseMassKg: 85 },
  i4:       { width: 500, height: 650, depth: 550, baseMassKg: 115 },
  i6:       { width: 550, height: 650, depth: 750, baseMassKg: 160 },
  v6:       { width: 620, height: 600, depth: 580, baseMassKg: 175 },
  v8:       { width: 720, height: 620, depth: 620, baseMassKg: 215 },
  v10:      { width: 760, height: 620, depth: 680, baseMassKg: 245 },
  v12:      { width: 820, height: 620, depth: 740, baseMassKg: 285 },
  w12:      { width: 780, height: 580, depth: 720, baseMassKg: 275 },
  w16:      { width: 840, height: 580, depth: 780, baseMassKg: 320 },
  w18:      { width: 880, height: 580, depth: 820, baseMassKg: 360 },
  boxer4:   { width: 680, height: 420, depth: 520, baseMassKg: 125 },
  boxer6:   { width: 740, height: 420, depth: 580, baseMassKg: 170 },
  rotary:   { width: 420, height: 460, depth: 420, baseMassKg: 95 },
  hybrid:   { width: 680, height: 650, depth: 620, baseMassKg: 195 },
  electric: { width: 520, height: 320, depth: 620, baseMassKg: 85 },
};

/**
 * Converts an EngineConfig and EngineSim instance from the Engine Tab
 * into a fully typed ModularComponent for installation in vehicle assembly.
 */
export function bridgeEngineToModularComponent(
  engineConfig: EngineConfig,
  engineSim: Partial<EngineSim> | Partial<import("../types").SimResult>
): ModularComponent {
  const specs =
    ENGINE_LAYOUT_SPECIFICATIONS[engineConfig.layout] ||
    ENGINE_LAYOUT_SPECIFICATIONS.i4;

  const totalPowerHp = engineSim.combinedPower || engineSim.peakPower || 100;
  const totalTorqueNm = engineSim.combinedTorque || engineSim.peakTorque || 120;
  const totalMassKg = (engineSim.engineWeight || specs.baseMassKg) + (engineSim.batteryWeight || 0);

  // Calculated thermal waste heat in kW (Power_in - Power_out)
  const powerOutputKw = totalPowerHp * 0.7457;
  const thermalEfficiency = Math.max(0.1, Math.min(0.5, engineSim.thermalEfficiency || 0.32));
  const heatOutputKw = powerOutputKw * (1 / thermalEfficiency - 1);

  const engineeringData: ComponentEngineeringData = {
    mass: totalMassKg,
    centreOfMass: {
      x: specs.depth * 0.45,  // slightly forward of flywheel output
      y: 0,                   // on centreline
      z: specs.height * 0.38,  // below geometric midpoint
    },
    cost: (engineSim.engineCost || 2500) + (engineSim.batteryCost || 0),
    power: powerOutputKw,
    torque: totalTorqueNm,
    powerCurve: engineSim.powerCurve,
    heatOutput: heatOutputKw,
    coolingCapacity: 0,       // Engine generates heat, requires cooling from radiator
  };

  // Define component mounting points relative to engine local origin
  const mountingPoints: MountingPoint[] = [
    {
      id: "engine_mount_front",
      localPosition: { x: specs.depth * 0.85, y: 0 },
      rotation: 0,
      category: "engine_mount",
      compatibilityTags: ["engine_bay", "front_mount"],
    },
    {
      id: "engine_mount_rear",
      localPosition: { x: specs.depth * 0.15, y: 0 },
      rotation: 0,
      category: "engine_mount",
      compatibilityTags: ["engine_bay", "rear_mount"],
    },
    {
      id: "bellhousing_flange",
      localPosition: { x: 0, y: 0 },
      rotation: 0,
      category: "transmission_mount",
      compatibilityTags: ["transmission_bellhousing"],
    },
    {
      id: "exhaust_header_flange",
      localPosition: { x: specs.depth * 0.4, y: -specs.width * 0.42 },
      rotation: 90,
      category: "exhaust_manifold",
      compatibilityTags: ["exhaust_downpipe"],
    },
    {
      id: "intake_plenum_flange",
      localPosition: { x: specs.depth * 0.65, y: specs.width * 0.35 },
      rotation: -90,
      category: "intake_manifold",
      compatibilityTags: ["intake_piping"],
    },
  ];

  const displacementL = (engineSim.displacement / 1000).toFixed(1);
  const layoutUpper = engineConfig.layout.toUpperCase();

  return {
    id: `engine_tab_${engineConfig.layout}_${engineSim.displacement}cc`,
    name: `${displacementL}L ${layoutUpper} ${engineSim.isHybrid ? "Hybrid" : engineSim.isElectric ? "EV" : "ICE"} Powertrain`,
    subsystem: "powertrain",
    variantId: engineConfig.layout,
    variantLabel: `${displacementL}L ${layoutUpper} — ${Math.round(totalPowerHp)} HP / ${Math.round(totalTorqueNm)} Nm`,
    svgGroupId: `engine-assembly-${engineConfig.layout}`,
    boundingBox: {
      x: 0,
      y: -specs.width / 2,
      width: specs.depth,
      height: specs.width,
    },
    mountingPoints,
    localOrigin: { x: specs.depth / 2, y: 0 },
    defaultScale: 1.0,
    engineeringData,
    compatibleWith: [],
    incompatibleWith: [],
    dependencies: [],
    requiredAnchorCategories: ["engine_mount"],
    installLayer: 3,
    isLeftRightPair: false,
    animationDurationMs: 1600,
    description: `Custom ${displacementL}L ${layoutUpper} engine imported from Engine Design Studio. Outputting ${Math.round(totalPowerHp)} HP @ ${engineSim.peakPowerRpm || 6500} RPM.`,
  };
}
