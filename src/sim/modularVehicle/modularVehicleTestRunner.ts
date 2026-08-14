// ===================================================================
// MODULAR VEHICLE TEST RUNNER
// ===================================================================
// Comprehensive self-contained test suite verifying coordinate space math,
// anchor solver alignment, component registry lookups, engine integration
// bridge translation, validation rules, and aggregate stat computations.
// ===================================================================

import { MasterCoordinateSpace, createDefaultCoordinateSpace } from "./coordinateSpace";
import { ComponentRegistry } from "./componentRegistry";
import { bridgeEngineToModularComponent } from "./engineIntegrationBridge";
import { validateAssembly } from "./validationEngine";
import { computeAggregateStats } from "./vehicleAggregator";
import type {
  ModularChassis,
  AnchorPoint,
  MountingPoint,
  ModularComponent,
  EngineConfig,
  EngineSim,
  InstalledModularComponent,
  ModularVehicleAssembly,
} from "./types";

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export class ModularVehicleTestRunner {
  private results: TestResult[] = [];

  private runTest(suite: string, name: string, fn: () => void) {
    const start = performance.now();
    try {
      fn();
      this.results.push({
        suite,
        name,
        passed: true,
        durationMs: performance.now() - start,
      });
    } catch (err: any) {
      this.results.push({
        suite,
        name,
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - start,
      });
    }
  }

  public executeAllTests(): TestResult[] {
    this.results = [];

    // --- Suite 1: Coordinate Space & Transformation Math ---
    this.runTest("CoordinateSpace", "Translates chassis mm coordinates to canvas pixels accurately", () => {
      const space = createDefaultCoordinateSpace(2650);
      const canvasPos = space.chassisToCanvas({ x: 0, y: 0 });
      const roundTrip = space.canvasToChassis(canvasPos);

      if (Math.abs(roundTrip.x) > 0.001 || Math.abs(roundTrip.y) > 0.001) {
        throw new Error(`Roundtrip coordinate conversion failed: got (${roundTrip.x}, ${roundTrip.y})`);
      }
    });

    this.runTest("CoordinateSpace", "Solves deterministic attachment transform for anchor snapping", () => {
      const space = createDefaultCoordinateSpace(2650);
      const chassisAnchor: AnchorPoint = {
        id: "FRONT_SUSPENSION_LEFT",
        position: { x: 2650, y: 750 },
        rotation: 0,
        category: "suspension_upper",
        compatibilityTags: ["front_axle"],
        zOrder: 10,
      };
      const componentMount: MountingPoint = {
        id: "upper_arm_mount",
        localPosition: { x: 50, y: 0 },
        rotation: 0,
        category: "suspension_upper",
        compatibilityTags: ["front_axle"],
      };

      const transform = space.solveAttachmentTransform(chassisAnchor, componentMount);
      if (transform.scaleX !== 1 || transform.scaleY !== 1) {
        throw new Error("Invalid transform scale solved");
      }
      if (typeof transform.translateX !== "number" || typeof transform.translateY !== "number") {
        throw new Error("Non-numeric transform output");
      }
    });

    // --- Suite 2: Component Registry Infrastructure ---
    this.runTest("ComponentRegistry", "Registers and retrieves components by subsystem", () => {
      const registry = new ComponentRegistry();
      const mockComp: ModularComponent = {
        id: "test_brakes_380mm",
        name: "380mm Carbon Ceramic Brakes",
        subsystem: "brakes",
        variantId: "carbon_ceramic",
        variantLabel: "Carbon Ceramic 380mm",
        svgGroupId: "brakes-380mm",
        boundingBox: { x: -100, y: -100, width: 200, height: 200 },
        mountingPoints: [],
        localOrigin: { x: 0, y: 0 },
        defaultScale: 1.0,
        engineeringData: { mass: 12, cost: 3500, brakingForce: 18000 },
        compatibleWith: [],
        incompatibleWith: [],
        dependencies: [],
        requiredAnchorCategories: ["brake_caliper"],
        installLayer: 5,
        isLeftRightPair: true,
        animationDurationMs: 800,
        description: "High-performance ceramic rotor",
      };

      registry.register(mockComp);

      const retrieved = registry.get("test_brakes_380mm");
      if (!retrieved || retrieved.name !== mockComp.name) {
        throw new Error("Failed to retrieve registered component");
      }

      const brakesList = registry.getBySubsystem("brakes");
      if (brakesList.length !== 1 || brakesList[0].id !== mockComp.id) {
        throw new Error("Subsystem index failed");
      }
    });

    // --- Suite 3: Engine Tab Integration Bridge ---
    this.runTest("EngineIntegrationBridge", "Translates EngineConfig & EngineSim into ModularComponent", () => {
      const mockConfig: EngineConfig = {
        layout: "v8",
        bore: 90,
        stroke: 84,
        rodLength: 150,
        compressionRatio: 10.5,
        crank: "forged_steel",
        pistons: "forged",
        valvetrain: "dohc",
        camDuration: 280,
        camLift: 11,
        camTiming: 0,
        valveAngle: 20,
        valveSize: 36,
        intake: "twin_turbo",
        turboSize: 0.6,
        boostPressure: 1.2,
        wastegateSize: 44,
        intercoolerEff: 0.85,
        turboHousing: "inconel",
        compressorAR: 0.6,
        turbineAR: 0.8,
        turbineWheelDia: 60,
        intercoolerType: "air_to_water",
        wastegateType: "external_44mm",
        bovType: "recirculating",
        antiLag: true,
        boostController: "closed_loop",
        fuelSystem: "direct",
        afr: 11.5,
        ignitionTiming: 28,
        rpmLimiter: 8200,
        redline: 8000,
        coolingRadiator: 1,
        coolingOilCooler: 1,
        coolingWaterPump: 1,
        coolingFanSpeed: 1,
        exhaustPrimaryLength: 600,
        exhaustCollectorDia: 76,
        exhaustCat: true,
        exhaustValved: true,
        hasStartStop: false,
        ecuMapMode: "race",
        hybridArchitecture: "none",
        hybridCoupling: "parallel",
        hybridFrontMotorEnabled: false,
        hybridFrontMotorType: "pmac",
        hybridFrontMotorPower: 0,
        hybridRearMotorEnabled: false,
        hybridRearMotorType: "pmac",
        hybridRearMotorPower: 0,
        hasMguH: false,
        mguHMode: "off",
        batteryCapacity: 0,
        batteryChemistry: "li_ion",
        deployMode: "qualifying",
        regenLevel: 0,
        motorLayout: "none",
        evMotorPower: 0,
        evMotorType: "pmac",
        motorPlacement: "p0",
        hybridMotorPower: 0,
      };

      const mockSim: EngineSim = {
        displacement: 4277,
        cylinderCount: 8,
        powerCurve: [{ rpm: 6000, power: 650, torque: 780 }],
        peakPower: 650,
        peakTorque: 780,
        peakPowerRpm: 6800,
        peakTorqueRpm: 4500,
        redline: 8000,
        maxPistonSpeed: 22.4,
        thermalEfficiency: 0.35,
        knockRisk: 0.05,
        octaneRequired: 98,
        bsfc: 240,
        turboLag: 0.2,
        boostPressure: 1.2,
        engineWeight: 215,
        engineCost: 18500,
        reliability: 92,
        nvhEngine: 0.7,
        emissionsEngine: 220,
        fuelEconomyEngine: 12.5,
        mguHPower: 0,
        mguKPower: 0,
        combinedPower: 650,
        combinedTorque: 780,
        batteryWeight: 0,
        batteryCost: 0,
        batteryEnergy: 0,
        electricRange: 0,
        regenEfficiency: 0,
        energyRecoveryPerLap: 0,
        deployDuration: 0,
        isElectric: false,
        isHybrid: false,
      };

      const modularEngine = bridgeEngineToModularComponent(mockConfig, mockSim);
      if (modularEngine.subsystem !== "powertrain") {
        throw new Error("Engine bridge assigned incorrect subsystem");
      }
      if (modularEngine.engineeringData.mass !== 215) {
        throw new Error(`Engine mass mismatch: expected 215, got ${modularEngine.engineeringData.mass}`);
      }
      if (modularEngine.mountingPoints.length === 0) {
        throw new Error("Engine bridge failed to generate mounting points");
      }
    });

    // --- Suite 4: Vehicle Aggregator & Dynamics Metrics ---
    this.runTest("VehicleAggregator", "Computes aggregate vehicle mass, CoM and weight bias", () => {
      const mockChassis: ModularChassis = {
        id: "spaceframe_chassis",
        name: "Aluminum Spaceframe",
        chassisType: "aluminum_spaceframe",
        wheelbaseMm: 2600,
        trackWidthFrontMm: 1600,
        trackWidthRearMm: 1600,
        frontOverhangMm: 800,
        rearOverhangMm: 600,
        totalLengthMm: 4000,
        totalWidthMm: 1800,
        anchors: [],
        engineeringData: { mass: 220, cost: 12000, torsionalRigidity: 32 },
        svgGroupId: "chassis-spaceframe",
        svgViewBox: { x: 0, y: 0, width: 960, height: 440 },
      };

      const installedMap = new Map<string, InstalledModularComponent>();
      const stats = computeAggregateStats(mockChassis, installedMap);

      if (stats.totalMass !== 220) {
        throw new Error(`Aggregate mass mismatch: expected 220, got ${stats.totalMass}`);
      }
      if (stats.totalCost !== 12000) {
        throw new Error("Aggregate cost mismatch");
      }
    });

    // --- Suite 5: Validation Engine ---
    this.runTest("ValidationEngine", "Detects missing required vehicle subsystems", () => {
      const registry = new ComponentRegistry();
      const mockChassis: ModularChassis = {
        id: "monocoque_chassis",
        name: "Carbon Monocoque",
        chassisType: "carbon_tub",
        wheelbaseMm: 2700,
        trackWidthFrontMm: 1620,
        trackWidthRearMm: 1620,
        frontOverhangMm: 850,
        rearOverhangMm: 650,
        totalLengthMm: 4200,
        totalWidthMm: 1850,
        anchors: [],
        engineeringData: { mass: 180, cost: 25000, torsionalRigidity: 45 },
        svgGroupId: "chassis-monocoque",
        svgViewBox: { x: 0, y: 0, width: 960, height: 440 },
      };

      const assembly: ModularVehicleAssembly = {
        id: "test_assembly",
        name: "Test Build",
        chassis: mockChassis,
        installedComponents: new Map(),
        enginePosition: "front",
        driveType: "rwd",
        aggregateStats: computeAggregateStats(mockChassis, new Map()),
        validationResults: [],
        isComplete: false,
      };

      const results = validateAssembly(assembly, registry);
      if (results.length === 0) {
        throw new Error("Validation engine failed to report missing subsystems on bare chassis");
      }
      const missingErrors = results.filter((r) => r.severity === "ERROR");
      if (missingErrors.length < 4) {
        throw new Error(`Expected at least 4 subsystem errors, got ${missingErrors.length}`);
      }
    });

    return this.results;
  }
}
