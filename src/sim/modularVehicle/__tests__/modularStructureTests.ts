// ============================================================================
// MODULAR VEHICLE STRUCTURE & TELEMETRY ENGINE UNIT TEST SUITE
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ModularStructureEngine } from '../modularStructureEngine';
import { ModularStructureVisualizer } from '../../../exterior3d/geometry/modularStructureVisualizer';
import { CHASSIS_50_MAP } from '../../../exterior3d/manifests/chassis50Manifest';
import { VehicleSubsystemStage } from '../../../exterior3d/types/vehicleConstructionTypes';
import { MaterialGrade } from '../../assemblyTypes';

export function runModularStructureTests() {
  console.log('\n================================================================');
  console.log('RUNNING MODULAR VEHICLE STRUCTURE & 3D TELEMETRY TEST SUITE');
  console.log('================================================================\n');

  const allStages: VehicleSubsystemStage[] = [
    'architecture',
    'chassis_platform',
    'powertrain_engine',
    'transmission',
    'suspension',
    'wheels_brakes',
    'body_structure',
    'exterior_panels',
    'lighting_glass',
    'aerodynamics',
    'interior_cabin',
    'electronics',
  ];

  const defaultGrades: Record<VehicleSubsystemStage, MaterialGrade> = {
    architecture: 'forged',
    chassis_platform: 'forged',
    powertrain_engine: 'billet',
    transmission: 'billet',
    suspension: 'titanium',
    wheels_brakes: 'ceramic',
    body_structure: 'titanium',
    exterior_panels: 'ceramic',
    lighting_glass: 'forged',
    aerodynamics: 'ceramic',
    interior_cabin: 'titanium',
    electronics: 'billet',
  };

  // Test 1: Full Sedan Chassis Mass & CoG Calculation
  const sedanChassis = CHASSIS_50_MAP['SEDAN_CHASSIS_01'] || Object.values(CHASSIS_50_MAP)[0];
  const sedanTel = ModularStructureEngine.solveStructure(
    sedanChassis,
    allStages,
    defaultGrades,
    2850,
    1620,
    1640,
    140
  );

  console.log(`[TEST 1] Sedan Chassis: Mass = ${sedanTel.totalMassKg}kg | CoG X = ${sedanTel.centerOfGravity.xMm}mm | F/R = ${sedanTel.weightDistribution.frontPercent}% / ${sedanTel.weightDistribution.rearPercent}%`);
  assert(sedanTel.totalMassKg >= 900 && sedanTel.totalMassKg <= 2600, 'Sedan mass out of realistic range');
  assert(Math.abs(sedanTel.weightDistribution.frontPercent + sedanTel.weightDistribution.rearPercent - 100) < 0.1, 'Weight distribution does not sum to 100%');
  assert(sedanTel.centerOfGravity.yMm > 200 && sedanTel.centerOfGravity.yMm < 750, 'CoG height unrealistic');

  // Test 2: 4-Corner Loads Equilibrium
  const sumLoadsKg = sedanTel.cornerLoadsKg.fl + sedanTel.cornerLoadsKg.fr + sedanTel.cornerLoadsKg.rl + sedanTel.cornerLoadsKg.rr;
  console.log(`[TEST 2] 4-Corner Sum: ${sumLoadsKg}kg vs Total: ${sedanTel.totalMassKg}kg`);
  assert(Math.abs(sumLoadsKg - sedanTel.totalMassKg) < 1.0, 'Corner loads sum does not equal total mass');

  const sumForcesN = sedanTel.cornerForcesN.fl + sedanTel.cornerForcesN.fr + sedanTel.cornerForcesN.rl + sedanTel.cornerForcesN.rr;
  const expectedTotalForceN = sedanTel.totalMassKg * 9.80665;
  assert(Math.abs(sumForcesN - expectedTotalForceN) < 10.0, 'Corner vertical reaction forces do not balance gravitational force');

  // Test 3: Torsional Rigidity Architecture Comparison (Carbon Monocell vs Ladder Frame)
  const hypercarChassis = Object.values(CHASSIS_50_MAP).find((c) => c.architectureClass === 'f1_prepreg_monocoque' || c.architectureClass === 'carbon_composite_monocell') || sedanChassis;
  const truckChassis = Object.values(CHASSIS_50_MAP).find((c) => c.architectureClass === 'heavy_duty_ladder_frame') || sedanChassis;

  const hypercarTel = ModularStructureEngine.solveStructure(hypercarChassis, allStages, defaultGrades, 2700, 1680, 1720, 95);
  const truckTel = ModularStructureEngine.solveStructure(truckChassis, allStages, defaultGrades, 3400, 1750, 1750, 240);

  console.log(`[TEST 3] Rigidity: Hypercar = ${hypercarTel.structuralRigidity.torsionalStiffnessKNmDeg} kNm/° (${hypercarTel.structuralRigidity.rigidityGrade}) vs Truck = ${truckTel.structuralRigidity.torsionalStiffnessKNmDeg} kNm/° (${truckTel.structuralRigidity.rigidityGrade})`);
  assert(hypercarTel.structuralRigidity.torsionalStiffnessKNmDeg > truckTel.structuralRigidity.torsionalStiffnessKNmDeg, 'Carbon Monocell should have higher torsional rigidity than Ladder Frame');
  assert(hypercarTel.structuralRigidity.chassisTorsionalFrequencyHz > 30, 'Hypercar natural frequency should be > 30 Hz');

  // Test 4: FEA Stress Hotspots Validation
  console.log(`[TEST 4] FEA Hotspots evaluated: ${sedanTel.feaHotspots.length} hotspots`);
  assert(sedanTel.feaHotspots.length >= 5, 'FEA solver did not return enough structural hotspots');
  for (const spot of sedanTel.feaHotspots) {
    assert(spot.vonMisesStressMpa > 0, `Hotspot ${spot.name} has zero stress`);
    assert(spot.safetyFactor > 0.5, `Hotspot ${spot.name} safety factor dangerously low`);
  }

  // Test 5: 3D Visualizer Scene Graph Construction
  const visualizerGroup = ModularStructureVisualizer.createTelemetryOverlayGroup(
    sedanTel,
    2850,
    1620,
    1640,
    140,
    { showCoG: true, showFEAStress: true, showLoadVectors: true }
  );
  console.log(`[TEST 5] 3D Visualizer Overlay Subsystems: ${visualizerGroup.children.length} active groups`);
  assert(visualizerGroup.children.length >= 3, 'Visualizer did not generate CoG, Load Vectors, and FEA overlays');

  console.log('\n================================================================');
  console.log('✅ ALL MODULAR VEHICLE STRUCTURE & TELEMETRY TESTS PASSED 100%');
  console.log('================================================================\n');
}

// Run when executed directly
if (import.meta.url.endsWith('modularStructureTests.ts') || process.argv[1]?.includes('modularStructureTests')) {
  runModularStructureTests();
}
