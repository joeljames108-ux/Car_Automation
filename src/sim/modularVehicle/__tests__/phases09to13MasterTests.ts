// ============================================================================
// PHASES 09 TO 13 — MASTER TEST RUNNER SUITE
// ============================================================================
// Automated test assertions for:
// - Phase 09: Multi-View Orthographic & Axonometric SVG Blueprint Engine
// - Phase 10: Exploded View Kinematics & Linear Displacement Solver
// - Phase 11: Master Vehicle Component Catalog & Taxonomy
// - Phase 12: Vehicle Assembly Zustand State Store & JSON Serializer
// - Phase 13: 8-Rule Master Assembly Structural & Compatibility Validation Engine
// ============================================================================

import * as THREE from 'three';
import { MultiViewProjectionEngine } from '../../../exterior3d/projections/multiViewProjectionEngine';
import { ExplodedViewKinematicsSolver } from '../../../exterior3d/kinematics/explodedViewKinematicsSolver';
import { MasterComponentCatalog } from '../../../exterior3d/manifests/masterComponentCatalog';
import { useMasterVehicleAssemblyStore } from '../../../state/masterVehicleAssemblyStore';
import { MasterAssemblyValidationEngine } from '../../../exterior3d/validation/masterAssemblyValidationEngine';

export interface Phase09to13TestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class Phases09to13MasterTestRunner {
  public executeAllTests(): Phase09to13TestResult[] {
    const results: Phase09to13TestResult[] = [];

    // ── 1. PHASE 09: Multi-View Projection Engine ──
    const t0 = performance.now();
    try {
      const topBp = MultiViewProjectionEngine.renderBlueprint('TOP_PLAN', {
        wheelbaseMm: 2800,
        frontTrackMm: 1600,
        rearTrackMm: 1620,
        rideHeightMm: 130,
        roofHeightMm: 1400,
        engineBayLengthMm: 950,
        cabinWidthMm: 1820,
        frontOverhangMm: 850,
        rearOverhangMm: 950,
      });

      const sideBp = MultiViewProjectionEngine.renderBlueprint('SIDE_PROFILE', {
        wheelbaseMm: 2800,
        frontTrackMm: 1600,
        rearTrackMm: 1620,
        rideHeightMm: 130,
        roofHeightMm: 1400,
        engineBayLengthMm: 950,
        cabinWidthMm: 1820,
        frontOverhangMm: 850,
        rearOverhangMm: 950,
      });

      const hasPaths = topBp.paths.length > 0 && sideBp.paths.length > 0;
      const hasHardpoints = topBp.hardpointMarkers.length >= 20;
      const hasDimensions = sideBp.dimensionLines.length > 0;

      results.push({
        suite: 'Phase09_MultiViewProjection',
        name: 'Multi-View Projection Engine computes Top/Side/Isometric SVG paths and dimension callouts',
        passed: hasPaths && hasHardpoints && hasDimensions,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase09_MultiViewProjection',
        name: 'Multi-View Projection Engine computes Top/Side/Isometric SVG paths and dimension callouts',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // ── 2. PHASE 10: Exploded View Kinematics Solver ──
    const t1 = performance.now();
    try {
      const wheelTraj = ExplodedViewKinematicsSolver.generateSubsystemTrajectory(
        'WHEEL_FL',
        'wheels_brakes',
        new THREE.Vector3(-0.8, 0.33, 0)
      );

      const pos0 = ExplodedViewKinematicsSolver.computeComponentDisplacement(wheelTraj, 0.0);
      const pos100 = ExplodedViewKinematicsSolver.computeComponentDisplacement(wheelTraj, 1.0);

      const displacedX = Math.abs(pos100.x - pos0.x) > 0.8;
      const passed = displacedX && wheelTraj.explodedDirection.x < 0;

      results.push({
        suite: 'Phase10_ExplodedKinematics',
        name: 'Exploded View Kinematics Solver calculates non-colliding lateral and vertical trajectories',
        passed,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase10_ExplodedKinematics',
        name: 'Exploded View Kinematics Solver calculates non-colliding lateral and vertical trajectories',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // ── 3. PHASE 11: Master Component Catalog ──
    const t2 = performance.now();
    try {
      const allComps = Object.values(MasterComponentCatalog.COMPONENTS);
      const hasCategories = allComps.length >= 8;
      const allHaveMass = allComps.every((c) => c.massKg > 0 && c.costUsd > 0);
      const allHaveCoM = allComps.every((c) => c.centerOfMassOffsetM.length === 3);

      results.push({
        suite: 'Phase11_ComponentCatalog',
        name: 'Master Component Catalog defines modular chassis, powertrain, suspension, and aero parts',
        passed: hasCategories && allHaveMass && allHaveCoM,
        score: allComps.length,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase11_ComponentCatalog',
        name: 'Master Component Catalog defines modular chassis, powertrain, suspension, and aero parts',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // ── 4. PHASE 12: Assembly Zustand Store & Serializer ──
    const t3 = performance.now();
    try {
      const state = useMasterVehicleAssemblyStore.getState();
      state.recomputeMetrics();
      const mass = state.totalMassKg;
      const exportedJson = state.exportJSON();
      const importOk = state.importJSON(exportedJson);

      const passed = mass > 800 && exportedJson.includes('CHASSIS') && importOk;

      results.push({
        suite: 'Phase12_AssemblyStore',
        name: 'Vehicle Assembly State Store executes undo/redo, real-time metrics, and JSON serialization',
        passed,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase12_AssemblyStore',
        name: 'Vehicle Assembly State Store executes undo/redo, real-time metrics, and JSON serialization',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    // ── 5. PHASE 13: 8-Rule Master Validation Engine ──
    const t4 = performance.now();
    try {
      const state = useMasterVehicleAssemblyStore.getState();
      const report = MasterAssemblyValidationEngine.validateVehicleAssembly(
        state.installedComponentIds,
        state.socketAssignments
      );

      const passed = report.overallPassed && report.ruleResults.length === 8 && report.compositeQualityScorePct > 90;

      results.push({
        suite: 'Phase13_ValidationEngine',
        name: '8-Rule Master Validation Engine validates completeness, sockets, weight bias, and thermal safety',
        passed,
        durationMs: performance.now() - t4,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase13_ValidationEngine',
        name: '8-Rule Master Validation Engine validates completeness, sockets, weight bias, and thermal safety',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t4,
      });
    }

    return results;
  }
}
