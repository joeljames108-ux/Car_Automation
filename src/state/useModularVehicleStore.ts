// ===================================================================
// CENTRAL MODULAR VEHICLE STORE — STATE MANAGEMENT HOOK
// ===================================================================
// Manages master chassis assembly state, installed component maps,
// anchor bindings, deterministic coordinate space alignment, live aggregate
// vehicle statistics, assembly validation, and history undo/redo stacks.
// ===================================================================

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  ModularVehicleAssembly,
  ModularChassis,
  InstalledModularComponent,
  AnchorBinding,
  AggregateVehicleStats,
  ValidationResult,
  EnginePosition,
  DriveType,
} from "../sim/modularVehicle/types";
import {
  MasterCoordinateSpace,
  createDefaultCoordinateSpace,
} from "../sim/modularVehicle/coordinateSpace";
import { globalComponentRegistry } from "../sim/modularVehicle/componentRegistry";
import { computeAggregateStats } from "../sim/modularVehicle/vehicleAggregator";
import { validateAssembly } from "../sim/modularVehicle/validationEngine";
import { vehicleEventBus } from "../sim/modularVehicle/eventBus";
import { bridgeEngineToModularComponent } from "../sim/modularVehicle/engineIntegrationBridge";
import { useDesign } from "./DesignContext";

function generateInstanceId(): string {
  return `inst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Default base chassis specifications */
const DEFAULT_BASE_CHASSIS: ModularChassis = {
  id: "chassis_spaceframe_v1",
  name: "Aluminum Spaceframe Base Chassis",
  chassisType: "aluminum_spaceframe",
  wheelbaseMm: 2650,
  trackWidthFrontMm: 1620,
  trackWidthRearMm: 1640,
  frontOverhangMm: 850,
  rearOverhangMm: 650,
  totalLengthMm: 4150,
  totalWidthMm: 1860,
  anchors: [
    {
      id: "ENGINE_MOUNT_FRONT",
      position: { x: 2000, y: 0 },
      rotation: 0,
      category: "engine_mount",
      compatibilityTags: ["engine_bay", "front_mount"],
      zOrder: 2,
    },
    {
      id: "ENGINE_MOUNT_REAR",
      position: { x: 1400, y: 0 },
      rotation: 0,
      category: "engine_mount",
      compatibilityTags: ["engine_bay", "rear_mount"],
      zOrder: 2,
    },
    {
      id: "TRANSMISSION_MOUNT",
      position: { x: 1200, y: 0 },
      rotation: 0,
      category: "transmission_mount",
      compatibilityTags: ["transmission_bellhousing"],
      zOrder: 2,
    },
    {
      id: "FRONT_SUSPENSION_LEFT",
      position: { x: 2650, y: 810 },
      rotation: 0,
      category: "suspension_upper",
      compatibilityTags: ["front_axle"],
      mirroredPairId: "FRONT_SUSPENSION_RIGHT",
      zOrder: 4,
    },
    {
      id: "FRONT_SUSPENSION_RIGHT",
      position: { x: 2650, y: -810 },
      rotation: 0,
      category: "suspension_upper",
      compatibilityTags: ["front_axle"],
      mirroredPairId: "FRONT_SUSPENSION_LEFT",
      zOrder: 4,
    },
    {
      id: "REAR_SUSPENSION_LEFT",
      position: { x: 0, y: 820 },
      rotation: 0,
      category: "suspension_upper",
      compatibilityTags: ["rear_axle"],
      mirroredPairId: "REAR_SUSPENSION_RIGHT",
      zOrder: 4,
    },
    {
      id: "REAR_SUSPENSION_RIGHT",
      position: { x: 0, y: -820 },
      rotation: 0,
      category: "suspension_upper",
      compatibilityTags: ["rear_axle"],
      mirroredPairId: "REAR_SUSPENSION_LEFT",
      zOrder: 4,
    },
    {
      id: "STEERING_RACK",
      position: { x: 2450, y: 0 },
      rotation: 0,
      category: "steering_rack",
      compatibilityTags: ["front_axle"],
      zOrder: 3,
    },
    {
      id: "FRONT_BRAKE_LEFT",
      position: { x: 2650, y: 810 },
      rotation: 0,
      category: "brake_caliper",
      compatibilityTags: ["front_wheel"],
      mirroredPairId: "FRONT_BRAKE_RIGHT",
      zOrder: 5,
    },
    {
      id: "FRONT_BRAKE_RIGHT",
      position: { x: 2650, y: -810 },
      rotation: 0,
      category: "brake_caliper",
      compatibilityTags: ["front_wheel"],
      mirroredPairId: "FRONT_BRAKE_LEFT",
      zOrder: 5,
    },
    {
      id: "REAR_BRAKE_LEFT",
      position: { x: 0, y: 820 },
      rotation: 0,
      category: "brake_caliper",
      compatibilityTags: ["rear_wheel"],
      mirroredPairId: "REAR_BRAKE_RIGHT",
      zOrder: 5,
    },
    {
      id: "REAR_BRAKE_RIGHT",
      position: { x: 0, y: -820 },
      rotation: 0,
      category: "brake_caliper",
      compatibilityTags: ["rear_wheel"],
      mirroredPairId: "REAR_BRAKE_LEFT",
      zOrder: 5,
    },
    {
      id: "COOLING_PRIMARY",
      position: { x: 2950, y: 0 },
      rotation: 0,
      category: "cooling_primary",
      compatibilityTags: ["radiator"],
      zOrder: 1,
    },
    {
      id: "EXHAUST_MANIFOLD",
      position: { x: 1600, y: -400 },
      rotation: 90,
      category: "exhaust_manifold",
      compatibilityTags: ["exhaust_header"],
      zOrder: 2,
    },
    {
      id: "BATTERY_MOUNT",
      position: { x: 500, y: -300 },
      rotation: 0,
      category: "battery_mount",
      compatibilityTags: ["electrical"],
      zOrder: 2,
    },
    {
      id: "AERO_FRONT_SPLITTER",
      position: { x: 3100, y: 0 },
      rotation: 0,
      category: "aero_front",
      compatibilityTags: ["front_splitter"],
      zOrder: 6,
    },
    {
      id: "AERO_REAR_WING",
      position: { x: -450, y: 0 },
      rotation: 0,
      category: "aero_rear",
      compatibilityTags: ["rear_wing"],
      zOrder: 6,
    },
  ],
  engineeringData: {
    mass: 240,
    centreOfMass: { x: 1325, y: 0, z: 360 },
    cost: 11500,
    torsionalRigidity: 34,
  },
  svgGroupId: "chassis-master-assembly",
  svgViewBox: { x: 0, y: 0, width: 960, height: 440 },
};

export function useModularVehicleStore() {
  const { design, sim } = useDesign();
  const [chassis, setChassis] = useState<ModularChassis>(DEFAULT_BASE_CHASSIS);
  const [installed, setInstalled] = useState<Map<string, InstalledModularComponent>>(new Map());
  const [enginePosition, setEnginePosition] = useState<EnginePosition>("front");
  const [driveType, setDriveType] = useState<DriveType>("rwd");
  const [debugAnchors, setDebugAnchors] = useState<boolean>(false);
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [history, setHistory] = useState<Map<string, InstalledModularComponent>[]>([]);

  // Coordinate Space Instance
  const coordinateSpace = useMemo(() => {
    return createDefaultCoordinateSpace(chassis.wheelbaseMm);
  }, [chassis.wheelbaseMm]);

  // Synchronize Engine designed in Engine Tab via EngineIntegrationBridge
  useEffect(() => {
    if (design?.engine && sim) {
      const bridgedEngine = bridgeEngineToModularComponent(design.engine, sim);
      globalComponentRegistry.register(bridgedEngine);
      vehicleEventBus.emit({ type: "ENGINE_SYNCED", engineId: bridgedEngine.id });
    }
  }, [design.engine, sim]);

  // Real-time Aggregate Vehicle Dynamic Statistics
  const aggregateStats: AggregateVehicleStats = useMemo(() => {
    return computeAggregateStats(chassis, installed);
  }, [chassis, installed]);

  // Real-time Validation Engine Analysis
  const validationResults: ValidationResult[] = useMemo(() => {
    const assembly: ModularVehicleAssembly = {
      id: "current_assembly",
      name: "Modular Vehicle Assembly",
      chassis,
      installedComponents: installed,
      enginePosition,
      driveType,
      aggregateStats,
      validationResults: [],
      isComplete: false,
    };
    return validateAssembly(assembly, globalComponentRegistry);
  }, [chassis, installed, enginePosition, driveType, aggregateStats]);

  // Check if current assembly is valid and complete
  const isAssemblyComplete = useMemo(() => {
    const hasErrors = validationResults.some(
      (r) => r.severity === "ERROR" || r.severity === "CRITICAL"
    );
    return !hasErrors && installed.size > 3;
  }, [validationResults, installed]);

  // Install a modular component onto specified chassis anchors
  const installComponent = useCallback(
    (componentId: string, anchorBindings: AnchorBinding[], side?: "left" | "right" | "centre") => {
      const comp = globalComponentRegistry.get(componentId);
      if (!comp) {
        console.error(`[useModularVehicleStore] Component ${componentId} not found in registry.`);
        return;
      }

      // Save history state for undo
      setHistory((prev) => [...prev, new Map(installed)]);

      const instanceId = generateInstanceId();
      const firstBinding = anchorBindings[0];
      const targetAnchor = firstBinding
        ? chassis.anchors.find((a) => a.id === firstBinding.chassisAnchorId)
        : undefined;
      const compMount = firstBinding
        ? comp.mountingPoints.find((m) => m.id === firstBinding.componentMountId)
        : comp.mountingPoints[0];

      const resolvedTransform =
        targetAnchor && compMount
          ? coordinateSpace.solveAttachmentTransform(targetAnchor, compMount, side === "right")
          : { translateX: 0, translateY: 0, rotation: 0, scaleX: 1, scaleY: 1, mirrorX: false };

      const newInstalled: InstalledModularComponent = {
        instanceId,
        componentId,
        anchorBindings,
        resolvedTransform,
        installationState: "installed",
        installedAt: Date.now(),
        side,
      };

      setInstalled((prev) => {
        const next = new Map(prev);
        next.set(instanceId, newInstalled);
        return next;
      });

      vehicleEventBus.emit({ type: "COMPONENT_INSTALLED", componentId, instanceId });
    },
    [chassis, installed, coordinateSpace]
  );

  // Remove an installed component by instance ID
  const removeComponent = useCallback(
    (instanceId: string) => {
      const inst = installed.get(instanceId);
      if (!inst) return;

      setHistory((prev) => [...prev, new Map(installed)]);

      setInstalled((prev) => {
        const next = new Map(prev);
        next.delete(instanceId);
        return next;
      });

      if (selectedInstanceId === instanceId) {
        setSelectedInstanceId(null);
      }

      vehicleEventBus.emit({
        type: "COMPONENT_REMOVED",
        componentId: inst.componentId,
        instanceId,
      });
    },
    [installed, selectedInstanceId]
  );

  // Undo last installation / removal action
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setInstalled(previousState);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  // Reset complete assembly
  const resetAssembly = useCallback(() => {
    setHistory((prev) => [...prev, new Map(installed)]);
    setInstalled(new Map());
    setSelectedInstanceId(null);
    vehicleEventBus.emit({ type: "ASSEMBLY_RESET" });
  }, [installed]);

  return {
    // State
    chassis,
    setChassis,
    installed,
    enginePosition,
    setEnginePosition,
    driveType,
    setDriveType,
    debugAnchors,
    setDebugAnchors,
    explodedView,
    setExplodedView,
    selectedInstanceId,
    setSelectedInstanceId,
    hoveredComponentId,
    setHoveredComponentId,
    coordinateSpace,
    aggregateStats,
    validationResults,
    isAssemblyComplete,

    // Actions
    installComponent,
    removeComponent,
    undo,
    resetAssembly,
    canUndo: history.length > 0,
  };
}
