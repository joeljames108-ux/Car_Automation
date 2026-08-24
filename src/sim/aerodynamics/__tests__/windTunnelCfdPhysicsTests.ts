/**
 * ============================================================================
 * WIND TUNNEL & CFD PHYSICS TEST SUITE
 * ============================================================================
 */

import { WindTunnelCfdPhysicsEngine, WindTunnelState } from "../windTunnelCfdPhysicsEngine";

export function runWindTunnelCfdPhysicsTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`[PASS] Wind Tunnel CFD Test: ${testName}`);
    } else {
      failed++;
      console.error(`[FAIL] Wind Tunnel CFD Test: ${testName}`);
    }
  }

  const baselineState: WindTunnelState = {
    airSpeedKmh: 250,
    airDensity: 1.225,
    temperatureC: 20,
    frontWingAngleDeg: 10,
    rearWingAngleDeg: 15,
    drsActive: false,
    rideHeightFrontMm: 35,
    rideHeightRearMm: 45,
    diffuserRampDeg: 12,
    sidepodVenturiWidthMm: 400,
    activeAirbrake: false,
  };

  const baselineRes = WindTunnelCfdPhysicsEngine.solve(baselineState);

  // Test 1: Baseline Downforce & Drag
  assert(baselineRes.totalDownforceN > 0, "Computes positive total downforce");
  assert(baselineRes.totalDragN > 0, "Computes positive aerodynamic drag");
  assert(baselineRes.liftToDragRatio > 0, "Computes positive L/D efficiency ratio");

  // Test 2: DRS Effect (DRS Open should reduce rear drag and total drag)
  const drsState = { ...baselineState, drsActive: true };
  const drsRes = WindTunnelCfdPhysicsEngine.solve(drsState);
  assert(drsRes.totalDragN < baselineRes.totalDragN, "DRS activation reduces total aerodynamic drag");

  // Test 3: Active Airbrake Effect (Airbrake should increase drag significantly)
  const airbrakeState = { ...baselineState, activeAirbrake: true };
  const airbrakeRes = WindTunnelCfdPhysicsEngine.solve(airbrakeState);
  assert(airbrakeRes.totalDragN > baselineRes.totalDragN * 1.3, "Airbrake deployment increases drag by > 30%");

  // Test 4: Porpoising Limit Cycle Instability
  const lowRideHeightState = { ...baselineState, rideHeightFrontMm: 15, airSpeedKmh: 320 };
  const lowRideRes = WindTunnelCfdPhysicsEngine.solve(lowRideHeightState);
  assert(lowRideRes.porpoisingRiskScore > 50, "Low ride height + high speed triggers porpoising risk score");

  // Test 5: Particle Flowfield & Station Pressure Distribution
  assert(baselineRes.particles.length > 30, "Generates flowfield particle streamlines");
  assert(baselineRes.pressureDistribution.length === 11, "Generates 11 surface station pressure profiles");

  return { passed, failed };
}
