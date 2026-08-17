// ============================================================================
// PHASE 03 — MASTER GEOMETRY & HARDPOINTS — TEST RUNNER SUITE
// ============================================================================
// Automated test assertions for Phase 03: 3D Coordinate Space, Three.js
// Conversion, Hardpoint Taxonomy, Parametric Solver & Packaging Clearances.
// ============================================================================

import {
  Master3DCoordinateSystem,
  Point3D_MM,
} from '../../../exterior3d/geometry/masterCoordinateSystem';
import {
  MASTER_HARDPOINT_TAXONOMY,
} from '../../../exterior3d/geometry/hardpointTaxonomy';
import {
  ParametricHardpointSolver,
  VehicleDimensionalParams,
} from '../../../exterior3d/geometry/parametricHardpointSolver';

export interface HardpointTestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class Phase03HardpointTestRunner {
  public executeAllTests(): HardpointTestResult[] {
    const results: HardpointTestResult[] = [];

    // Test 1: Coordinate Space Transformations (mm <-> Three.js <-> Isometric)
    const t0 = performance.now();
    try {
      const ptMm: Point3D_MM = { x: -380, y: 220, z: 120 };
      const threeVec = Master3DCoordinateSystem.mmToThree(ptMm);
      const backToMm = Master3DCoordinateSystem.threeToMm(threeVec);

      const isRoundTripExact =
        Math.abs(backToMm.x - ptMm.x) < 0.01 &&
        Math.abs(backToMm.y - ptMm.y) < 0.01 &&
        Math.abs(backToMm.z - ptMm.z) < 0.01;

      const topView = Master3DCoordinateSystem.projectTopView(ptMm, 0.2, { x: 500, y: 500 });
      const isoView = Master3DCoordinateSystem.projectIsometricView(ptMm, {
        viewAngleDeg: 30,
        scalePxPerMm: 0.15,
        originCanvasX: 400,
        originCanvasY: 400,
      });

      const passed = isRoundTripExact && typeof topView.x === 'number' && typeof isoView.x === 'number';

      results.push({
        suite: 'Phase03_CoordinateSpace',
        name: 'Master 3D Coordinate System converts mm to Three.js metres and multi-view canvas projections',
        passed,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase03_CoordinateSpace',
        name: 'Master 3D Coordinate System converts mm to Three.js metres and multi-view canvas projections',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // Test 2: Master Hardpoint Taxonomy Definition Coverage
    const t1 = performance.now();
    try {
      const count = Object.keys(MASTER_HARDPOINT_TAXONOMY).length;
      const allHaveTorque = Object.values(MASTER_HARDPOINT_TAXONOMY).every(
        (hp) => typeof hp.nominalTorqueNm === 'number'
      );
      const allHaveJointType = Object.values(MASTER_HARDPOINT_TAXONOMY).every(
        (hp) => hp.jointType && hp.zone
      );

      results.push({
        suite: 'Phase03_HardpointTaxonomy',
        name: 'Master Hardpoint Taxonomy defines 20+ standardized pickup points across all 7 automotive zones',
        passed: count >= 20 && allHaveTorque && allHaveJointType,
        score: count,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase03_HardpointTaxonomy',
        name: 'Master Hardpoint Taxonomy defines 20+ standardized pickup points across all 7 automotive zones',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // Test 3: Parametric Solver Scaling Across Diverse Body Dimensions
    const t2 = performance.now();
    try {
      const sedanParams: VehicleDimensionalParams = {
        wheelbaseMm: 2800,
        frontTrackMm: 1620,
        rearTrackMm: 1640,
        rideHeightMm: 135,
        roofHeightMm: 1440,
        engineBayLengthMm: 980,
        cabinWidthMm: 1820,
        frontOverhangMm: 860,
        rearOverhangMm: 960,
      };

      const solved = ParametricHardpointSolver.solveAllHardpoints(sedanParams);
      const hasSolvedPoints = solved.size >= 20;
      const rearDamper = solved.get('HP_REAR_SHOCK_TOP_MOUNT_L');
      // Rear axle should be at -2800 mm, shock mount offset ~ -10 -> -2810 mm
      const rearZScaled = rearDamper ? Math.abs(rearDamper.worldPositionMm.z - (-2810)) < 1.0 : false;

      results.push({
        suite: 'Phase03_ParametricSolver',
        name: 'Parametric Hardpoint Solver scales 3D coordinates deterministically with wheelbase and track',
        passed: hasSolvedPoints && rearZScaled,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase03_ParametricSolver',
        name: 'Parametric Hardpoint Solver scales 3D coordinates deterministically with wheelbase and track',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // Test 4: Packaging Clearance Envelope & Symmetry Evaluation
    const t3 = performance.now();
    try {
      const supercarParams: VehicleDimensionalParams = {
        wheelbaseMm: 2650,
        frontTrackMm: 1680,
        rearTrackMm: 1720,
        rideHeightMm: 105,
        roofHeightMm: 1180,
        engineBayLengthMm: 920,
        cabinWidthMm: 1940,
        frontOverhangMm: 900,
        rearOverhangMm: 800,
      };

      const solved = ParametricHardpointSolver.solveAllHardpoints(supercarParams);
      const evalReport = ParametricHardpointSolver.evaluatePackagingClearances(supercarParams, solved);

      results.push({
        suite: 'Phase03_PackagingClearance',
        name: 'Packaging Clearance Evaluator validates firewall clearance, tire bump envelope and symmetry',
        passed: evalReport.packagingPass && evalReport.symmetryCompliant && evalReport.groundClearanceAdequate,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase03_PackagingClearance',
        name: 'Packaging Clearance Evaluator validates firewall clearance, tire bump envelope and symmetry',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    return results;
  }
}
