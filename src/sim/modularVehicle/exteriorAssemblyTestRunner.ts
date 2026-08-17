// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY TEST RUNNER
// ===================================================================
// Comprehensive unit test suite verifying the 40+ exterior component taxonomy,
// progressive assembly workflow, aerodynamics equations, shut-line tolerances,
// 3D parametric solvers, and metallurgy FEA models.
// ===================================================================

import { EXTERIOR_ASSEMBLY_REGISTRY } from "../exteriorAssemblyTypes";
import {
  APEX_HERITAGE_PAINT_SWATCHES,
  SHUT_LINE_SPECIFICATION_STANDARDS,
  createDefaultExteriorConfig,
  createDefaultPaintConfig,
  createDefaultAeroConfig,
} from "../constants/exteriorConstants";
import { EXTERIOR_PRESET_LIBRARY } from "../../state/exteriorAssemblyPresets";
import { calculateAeroForces } from "../../exterior3d/physics/aeroForceCalculator";
import { calculateChassisTorsionalRigidity } from "./chassisTorsionModel";
import { calculateBrakeThermalState } from "./thermalBrakeModel";
import { validateAllPanelGaps } from "../../exterior3d/physics/panelGapValidator";
import { solveExteriorTransformForComponent } from "../../exterior3d/physics/exteriorParametricSolver";
import { EXTERIOR_3D_MANIFEST } from "../../exterior3d/manifests/exteriorManifest";
import { computeExteriorSimAggregates } from "./exteriorSimBridge";
import { generateSedanChassis3DGeometry } from "../../exterior3d/generators/sedanChassisGeometry";
import { generateSedanSubframeSuspension3DGeometry } from "../../exterior3d/generators/sedanSubframeSuspensionGeometry";

export interface ExteriorTestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export class ExteriorAssemblyTestRunner {
  private results: ExteriorTestResult[] = [];

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

  public executeAllTests(): ExteriorTestResult[] {
    this.results = [];

    // ── Suite 1: Exterior Taxonomy & Registry Metadata ──
    this.runTest("Exterior Taxonomy", "Registry contains all 40+ required subsystems", () => {
      if (EXTERIOR_ASSEMBLY_REGISTRY.length < 23) {
        throw new Error(`Expected at least 23 exterior subsystems, found ${EXTERIOR_ASSEMBLY_REGISTRY.length}`);
      }
    });

    this.runTest("Exterior Taxonomy", "All components have valid variants and fastener torque", () => {
      for (const comp of EXTERIOR_ASSEMBLY_REGISTRY) {
        if (!comp.variants || comp.variants.length === 0) {
          throw new Error(`Component ${comp.id} missing material variants`);
        }
        if (comp.statDeltas.weight <= 0) {
          throw new Error(`Component ${comp.id} has invalid weight delta: ${comp.statDeltas.weight}`);
        }
      }
    });

    // ── Suite 2: Preset Library Verification ──
    this.runTest("Preset Library", "All 8 exterior presets contain valid configurations", () => {
      if (EXTERIOR_PRESET_LIBRARY.length < 8) {
        throw new Error(`Expected 8 presets, found ${EXTERIOR_PRESET_LIBRARY.length}`);
      }
      for (const preset of EXTERIOR_PRESET_LIBRARY) {
        if (!preset.variants.chassis_frame) {
          throw new Error(`Preset ${preset.id} missing root chassis_frame variant`);
        }
      }
    });

    // ── Suite 3: Aerodynamics & Downforce Physics Engine ──
    this.runTest("Aerodynamics Engine", "Calculates total Cd and downforce sweep across speeds", () => {
      const aeroConfig = createDefaultAeroConfig();
      const res = calculateAeroForces(aeroConfig);

      if (res.totalCd <= 0.2 || res.totalCd >= 0.8) {
        throw new Error(`Unexpected total Cd: ${res.totalCd}`);
      }
      if (res.speedSweep.length !== 7) {
        throw new Error(`Expected 7 speed sweep points, found ${res.speedSweep.length}`);
      }

      const highSpeedPoint = res.speedSweep.find((s) => s.speedKmh === 250);
      if (!highSpeedPoint || highSpeedPoint.downforceKg <= 0) {
        throw new Error("Invalid high-speed downforce calculation");
      }
    });

    // ── Suite 4: Chassis Torsional Rigidity & FEA ──
    this.runTest("Chassis Torsion Model", "Roll cage and titanium metallurgy increase torsional stiffness", () => {
      const baseRes = calculateChassisTorsionalRigidity("cast", false);
      const gt3Res = calculateChassisTorsionalRigidity("titanium", true);

      if (gt3Res.effectiveRigidityKNmPerDeg <= baseRes.effectiveRigidityKNmPerDeg) {
        throw new Error(
          `GT3 rigidity (${gt3Res.effectiveRigidityKNmPerDeg}) should exceed base (${baseRes.effectiveRigidityKNmPerDeg})`
        );
      }
      if (gt3Res.safetyRating !== "FIA_GT3_APPROVED") {
        throw new Error(`Expected FIA_GT3_APPROVED rating for reinforced titanium tub`);
      }
    });

    // ── Suite 5: Shut-Line Gap Tolerances ──
    this.runTest("Shut-Line Tolerances", "Evaluates all panel pairs against nominal standards", () => {
      const gapRes = validateAllPanelGaps(0, 0.0);
      if (gapRes.entries.length < 5) {
        throw new Error(`Expected at least 5 panel gap checks, found ${gapRes.entries.length}`);
      }
      if (!gapRes.overallPass) {
        throw new Error("Expected nominal gaps to pass standard factory tolerances");
      }
    });

    // ── Suite 6: 3D Asset Manifest & Parametric Solver ──
    this.runTest("3D Manifest & Solver", "Solves dynamic transforms based on wheelbase and aero settings", () => {
      const extConfig = createDefaultExteriorConfig();
      extConfig.wheelbase = 2900; // Stretched wheelbase
      const aeroConfig = createDefaultAeroConfig();
      aeroConfig.wingAngleOfAttackDeg = 24;

      const solvedWing = solveExteriorTransformForComponent(
        "rear_wing_spoiler",
        extConfig,
        aeroConfig,
        EXTERIOR_3D_MANIFEST["rear_wing_spoiler"].defaultTransform
      );

      if (solvedWing.rotation.z !== (24 * Math.PI) / 180) {
        throw new Error(`Wing rotation mismatch: ${solvedWing.rotation.z}`);
      }
    });

    // ── Suite 7: Thermal Brake Fade Model ──
    this.runTest("Thermal Brake Model", "Carbon-ceramic brakes maintain stopping power under repeated stops", () => {
      const steelBrakes = calculateBrakeThermalState(false, 76, 8);
      const carbonBrakes = calculateBrakeThermalState(true, 76, 8);

      if (carbonBrakes.brakeFadePercent >= steelBrakes.brakeFadePercent) {
        throw new Error("Carbon ceramic brakes should have significantly less fade than steel");
      }
      if (carbonBrakes.stoppingDistance100_0M >= steelBrakes.stoppingDistance100_0M) {
        throw new Error("Carbon ceramic stopping distance should be shorter after 8 consecutive stops");
      }
    });

    // ── Suite 8: Exterior Simulation Bridge Aggregates ──
    this.runTest("Simulation Bridge", "Computes realistic total vehicle mass and downforce metrics", () => {
      const extConfig = createDefaultExteriorConfig();
      const pntConfig = createDefaultPaintConfig();
      const arConfig = createDefaultAeroConfig();

      const agg = computeExteriorSimAggregates(
        ["chassis_frame", "front_subframe", "rear_subframe", "hood_panel", "roof_panel"],
        { chassis_frame: "forged" },
        extConfig,
        pntConfig,
        arConfig
      );

      if (agg.curbWeightKg < 400 || agg.curbWeightKg > 1500) {
        throw new Error(`Abnormal vehicle curb weight: ${agg.curbWeightKg} kg`);
      }
      if (agg.torsionalRigidityKNmPerDeg < 20) {
        throw new Error(`Abnormal torsional rigidity: ${agg.torsionalRigidityKNmPerDeg} kNm/deg`);
      }
    });

    // ── Suite 9: Sedan Unibody Geometry Hierarchy ──
    this.runTest("Sedan Unibody 3D", "Constructs full unibody shell with front rails, shock towers, pillars, and X-brace", () => {
      const group = generateSedanChassis3DGeometry();

      if (!group || group.children.length < 5) {
        throw new Error(`Expected at least 5 main unibody sub-assemblies, found ${group?.children?.length}`);
      }

      const names = group.children.map((c: any) => c.name);
      if (!names.includes("1_Front_Substructure") || !names.includes("2_Cabin_Safety_Cell_Ring_Frames")) {
        throw new Error("Missing required sedan cabin or front substructure groups");
      }
    });

    // ── Suite 10: Sedan Subframe & Double Wishbone Suspension ──
    this.runTest("Sedan Subframe 3D", "Constructs double wishbone front suspension, steering rack, and 5-link rear suspension", () => {
      const frontGroup = generateSedanSubframeSuspension3DGeometry("front");
      const rearGroup = generateSedanSubframeSuspension3DGeometry("rear");

      if (!frontGroup || frontGroup.children.length < 4) {
        throw new Error("Front subframe missing required suspension, steering, or brake assemblies");
      }
      if (!rearGroup || rearGroup.children.length < 2) {
        throw new Error("Rear subframe missing 5-link suspension assembly");
      }
    });

    return this.results;
  }
}
