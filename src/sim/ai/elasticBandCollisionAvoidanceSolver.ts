// ============================================================================
// PHASE 93 — ELASTIC BAND REAL-TIME COLLISION AVOIDANCE PATH PLANNER
// ============================================================================
// Real-time Elastic Band (EB) trajectory deformation framework for autonomous
// high-speed emergency obstacle evasion. Balances internal elastic contraction
// tension forces with external repulsive potential field gradients.
//
// Reference Autonomous Path Planning:
//   - Total Force on Band Bubble: F_total(x_i) = F_int(x_i) + F_ext(x_i)
//   - Internal Contraction Tension: F_int(x_i) = k_tension * (x_{i-1} - 2*x_i + x_{i+1})
//   - External Obstacle Repulsion: F_ext(x_i) = - ∇ U_obstacle(x_i)
//   - Artificial Potential Field: U_obs(x) = 0.5 * η_rep * (1/d_obs - 1/d_safety)² if d < d_safety
//   - Road Boundary Repulsion: U_road(y) = k_road * exp(|y| - y_max)
// ============================================================================

export interface ObstacleBubble {
  obstacleId: string;
  posXMetres: number; // Longitudinal distance ahead
  posYMetres: number; // Lateral offset from centerline (m)
  speedKmh: number;
  radiusM: number;
  timeToCollisionSec: number;
  safetyMarginM: number;
}

export interface ElasticBandWaypoint {
  nodeIndex: number;
  longitudinalXM: number;
  lateralYM: number;
  bubbleRadiusM: number;
  internalTensionForceN: number;
  externalRepulsionForceN: number;
  resultantForceN: number;
  targetSpeedKmh: number;
  curvatureRadPerM: number;
}

export interface ElasticBandEvasionResult {
  vehicleSpeedKmh: number;
  isCollisionImminent: boolean;
  evasionFeasible: boolean;
  minimumClearanceToObstacleM: number;
  peakLateralEvasionOffsetM: number;
  maxEvasionLateralG: number;
  computationTimeMs: number;
  iterationsToConvergence: number;
  elasticBandWaypoints: ElasticBandWaypoint[];
  obstacles: ObstacleBubble[];
  selectedEvasionDirection: 'LEFT_EVASION' | 'RIGHT_EVASION' | 'EMERGENCY_STOP';
}

export interface ElasticBandSolverParams {
  vehicleSpeedKmh: number;
  initialPathLengthM?: number;
  numBandNodes?: number;
  obstacles?: ObstacleBubble[];
  roadHalfWidthM?: number;
}

export class ElasticBandCollisionAvoidanceSolver {
  private static readonly DEFAULT_PATH_LENGTH_M = 120.0;
  private static readonly DEFAULT_NUM_NODES = 30;
  private static readonly K_TENSION = 180.0; // N/m internal elastic tension
  private static readonly ETA_REPULSION = 2500.0; // External potential strength
  private static readonly MAX_LATERAL_G_LIMIT = 3.5; // High-performance racing downforce & tire grip limit

  /**
   * Solves real-time Elastic Band trajectory deformation to smoothly evade
   * static/dynamic obstacles while minimizing lateral acceleration jerk.
   */
  public static solveElasticBandTrajectory(params: ElasticBandSolverParams): ElasticBandEvasionResult {
    const vKmh = Math.max(20.0, Math.min(220.0, params.vehicleSpeedKmh));
    const vMs = (vKmh * 1000.0) / 3600.0;
    const pathLenM = params.initialPathLengthM ?? this.DEFAULT_PATH_LENGTH_M;
    const numNodes = params.numBandNodes ?? this.DEFAULT_NUM_NODES;
    const roadWidth = params.roadHalfWidthM ?? 4.2;

    const tStart = performance.now();

    // Default emergency scenario: Stalled vehicle 45m ahead on right lane
    const obstacles: ObstacleBubble[] = params.obstacles ?? [
      {
        obstacleId: 'STALLED_TRUCK_HAZARD',
        posXMetres: 48.0,
        posYMetres: 0.85,
        speedKmh: 0.0,
        radiusM: 1.85,
        timeToCollisionSec: 48.0 / vMs,
        safetyMarginM: 1.4,
      },
    ];

    // ────────────────────────────────────────────────────────────────────────
    // 1. Initialize Baseline Centerline Waypoints
    // ────────────────────────────────────────────────────────────────────────
    const dx = pathLenM / (numNodes - 1);
    const xCoords: number[] = [];
    const yCoords: number[] = [];

    for (let i = 0; i < numNodes; i++) {
      xCoords.push(i * dx);
      yCoords.push(0.0); // Baseline along centerline
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. Iterative Elastic Band Physics-Based Trajectory Deformation
    // ────────────────────────────────────────────────────────────────────────
    let iteration = 0;
    const maxIterations = 40;
    let maxDisplacement = 999.0;

    while (iteration < maxIterations && maxDisplacement > 0.005) {
      maxDisplacement = 0.0;

      for (let i = 1; i < numNodes - 1; i++) {
        const x = xCoords[i];
        const y = yCoords[i];

        // 1. Internal Contraction Tension Force (smoothness & curvature minimization)
        const fIntY = this.K_TENSION * (yCoords[i - 1] - 2.0 * y + yCoords[i + 1]);

        // 2. External Repulsive Potential Forces from all obstacles (Anisotropic longitudinal bubble)
        let fExtY = 0.0;
        for (const obs of obstacles) {
          // Longitudinal distance stretched for high-speed preview (4.5x aspect ratio)
          const dxNorm = (x - obs.posXMetres) / 4.5;
          const dyNorm = (y - obs.posYMetres);
          const distToObs = Math.sqrt(dxNorm * dxNorm + dyNorm * dyNorm);
          const effectiveSafetyDist = obs.radiusM + obs.safetyMarginM + 0.8;

          if (distToObs < effectiveSafetyDist && distToObs > 0.05) {
            // Repulsive gradient pushing laterally away from obstacle center
            const gradMagnitude = this.ETA_REPULSION * ((1.0 / distToObs) - (1.0 / effectiveSafetyDist)) * (1.0 / (distToObs * distToObs));
            const yDir = dyNorm !== 0 ? Math.sign(dyNorm) : (obs.posYMetres >= 0 ? -1.0 : 1.0);
            fExtY += gradMagnitude * yDir * 0.45;
          }
        }

        // 3. Road Boundary Potential (Keep vehicle within tarmac limits)
        if (Math.abs(y) > (roadWidth - 1.2)) {
          const boundaryPenetration = Math.abs(y) - (roadWidth - 1.2);
          fExtY += -Math.sign(y) * boundaryPenetration * 450.0;
        }

        // Apply deformation step with curvature relaxation
        const deltaY = (fIntY + fExtY) * 0.0006;
        const clampedDeltaY = Math.max(-0.25, Math.min(0.25, deltaY));
        yCoords[i] += clampedDeltaY;

        // Hard clamp to road boundaries
        yCoords[i] = Math.max(-roadWidth + 0.8, Math.min(roadWidth - 0.8, yCoords[i]));

        if (Math.abs(clampedDeltaY) > maxDisplacement) maxDisplacement = Math.abs(clampedDeltaY);
      }
      iteration++;
    }

    const tComputeMs = performance.now() - tStart;

    // ────────────────────────────────────────────────────────────────────────
    // 3. Kinematics, Curvature & Evasion Verification
    // ────────────────────────────────────────────────────────────────────────
    const waypoints: ElasticBandWaypoint[] = [];
    let minClearanceM = 999.0;
    let peakOffsetM = 0.0;
    let peakLatG = 0.0;

    for (let i = 0; i < numNodes; i++) {
      const x = xCoords[i];
      const y = yCoords[i];

      if (Math.abs(y) > peakOffsetM) peakOffsetM = Math.abs(y);

      // Distance to obstacles
      for (const obs of obstacles) {
        const d = Math.sqrt(Math.pow(x - obs.posXMetres, 2) + Math.pow(y - obs.posYMetres, 2)) - obs.radiusM;
        if (d < minClearanceM) minClearanceM = d;
      }

      // Curvature approximation: κ = y'' / (1 + y'²)^1.5
      let kappa = 0.0;
      if (i > 0 && i < numNodes - 1) {
        const dy1 = (y - yCoords[i - 1]) / dx;
        const dy2 = (yCoords[i + 1] - y) / dx;
        const d2y = (dy2 - dy1) / dx;
        kappa = d2y / Math.pow(1.0 + dy1 * dy1, 1.5);
      }

      const latG = (vMs * vMs * Math.abs(kappa)) / 9.81;
      if (latG > peakLatG) peakLatG = latG;

      // Bubble radius based on speed and obstacle clearance
      const bubbleRad = Math.max(1.2, 2.5 - Math.min(1.0, latG / 1.5));

      waypoints.push({
        nodeIndex: i,
        longitudinalXM: Math.round(x * 10) / 10,
        lateralYM: Math.round(y * 100) / 100,
        bubbleRadiusM: Math.round(bubbleRad * 10) / 10,
        internalTensionForceN: Math.round(this.K_TENSION * y * 10) / 10,
        externalRepulsionForceN: 0,
        resultantForceN: 0,
        targetSpeedKmh: vKmh,
        curvatureRadPerM: Math.round(kappa * 1000) / 1000,
      });
    }

    const isEvasionFeasible = minClearanceM > 0.5 && peakLatG <= this.MAX_LATERAL_G_LIMIT;
    const evasionDir: ElasticBandEvasionResult['selectedEvasionDirection'] =
      !isEvasionFeasible ? 'EMERGENCY_STOP' : yCoords[Math.floor(numNodes / 2)] < 0 ? 'RIGHT_EVASION' : 'LEFT_EVASION';

    return {
      vehicleSpeedKmh: vKmh,
      isCollisionImminent: obstacles.some(o => o.timeToCollisionSec < 3.0),
      evasionFeasible: isEvasionFeasible,
      minimumClearanceToObstacleM: Math.round(minClearanceM * 100) / 100,
      peakLateralEvasionOffsetM: Math.round(peakOffsetM * 100) / 100,
      maxEvasionLateralG: Math.round(peakLatG * 100) / 100,
      computationTimeMs: Math.round(tComputeMs * 100) / 100,
      iterationsToConvergence: iteration,
      elasticBandWaypoints: waypoints,
      obstacles,
      selectedEvasionDirection: evasionDir,
    };
  }
}
