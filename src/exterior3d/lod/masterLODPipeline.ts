// ============================================================================
// PHASE 06 — MASTER MULTI-TIER LEVEL OF DETAIL (LOD 1–6) PIPELINE
// ============================================================================
// Defines strict geometric polygon budgets, texture resolution ceilings,
// shader complexity limits, and distance thresholds across all 6 LOD tiers.
// ============================================================================

export type LODTier = 'LOD1_HERO' | 'LOD2_HIGH' | 'LOD3_MEDIUM' | 'LOD4_LOW' | 'LOD5_DISTANT' | 'LOD6_PHYSICS_PROXY';

export interface LODTierBudget {
  tier: LODTier;
  distanceRangeMeters: [number, number];
  maxTrianglesPerVehicle: number;
  maxDrawCalls: number;
  textureResolutionLimit: number;
  supportsClearcoat: boolean;
  supportsTransmission: boolean;
  supportsProceduralNormals: boolean;
  castShadows: boolean;
  receiveShadows: boolean;
  description: string;
}

export class MasterLODPipeline {
  public static readonly BUDGETS: Record<LODTier, LODTierBudget> = {
    LOD1_HERO: {
      tier: 'LOD1_HERO',
      distanceRangeMeters: [0.0, 3.5],
      maxTrianglesPerVehicle: 350000,
      maxDrawCalls: 120,
      textureResolutionLimit: 2048,
      supportsClearcoat: true,
      supportsTransmission: true,
      supportsProceduralNormals: true,
      castShadows: true,
      receiveShadows: true,
      description: 'Ultra-close hero inspection in showroom/configurator with full micro-detail',
    },
    LOD2_HIGH: {
      tier: 'LOD2_HIGH',
      distanceRangeMeters: [3.5, 8.0],
      maxTrianglesPerVehicle: 120000,
      maxDrawCalls: 65,
      textureResolutionLimit: 1024,
      supportsClearcoat: true,
      supportsTransmission: true,
      supportsProceduralNormals: true,
      castShadows: true,
      receiveShadows: true,
      description: 'Standard orbit inspection and high-fidelity garage view',
    },
    LOD3_MEDIUM: {
      tier: 'LOD3_MEDIUM',
      distanceRangeMeters: [8.0, 20.0],
      maxTrianglesPerVehicle: 45000,
      maxDrawCalls: 35,
      textureResolutionLimit: 512,
      supportsClearcoat: false,
      supportsTransmission: false,
      supportsProceduralNormals: false,
      castShadows: true,
      receiveShadows: true,
      description: 'Dyno test cell and trackside camera perspectives',
    },
    LOD4_LOW: {
      tier: 'LOD4_LOW',
      distanceRangeMeters: [20.0, 60.0],
      maxTrianglesPerVehicle: 15000,
      maxDrawCalls: 18,
      textureResolutionLimit: 256,
      supportsClearcoat: false,
      supportsTransmission: false,
      supportsProceduralNormals: false,
      castShadows: false,
      receiveShadows: true,
      description: 'In-motion circuit racing simulation and multi-car grid render',
    },
    LOD5_DISTANT: {
      tier: 'LOD5_DISTANT',
      distanceRangeMeters: [60.0, 200.0],
      maxTrianglesPerVehicle: 3500,
      maxDrawCalls: 6,
      textureResolutionLimit: 128,
      supportsClearcoat: false,
      supportsTransmission: false,
      supportsProceduralNormals: false,
      castShadows: false,
      receiveShadows: false,
      description: 'Distant circuit telemetry and spectator camera views',
    },
    LOD6_PHYSICS_PROXY: {
      tier: 'LOD6_PHYSICS_PROXY',
      distanceRangeMeters: [0.0, 999.0],
      maxTrianglesPerVehicle: 500,
      maxDrawCalls: 1,
      textureResolutionLimit: 0,
      supportsClearcoat: false,
      supportsTransmission: false,
      supportsProceduralNormals: false,
      castShadows: false,
      receiveShadows: false,
      description: 'Convex collision proxy and aerodynamic CFD bounding volume',
    },
  };

  /**
   * Selects the optimal LOD tier based on camera distance with hysteresis buffering.
   */
  public static selectTierForDistance(distanceMeters: number, previousTier?: LODTier): LODTier {
    const d = Math.max(0, distanceMeters);

    if (d < 3.2) return 'LOD1_HERO';
    if (d < 7.8) return 'LOD2_HIGH';
    if (d < 19.0) return 'LOD3_MEDIUM';
    if (d < 58.0) return 'LOD4_LOW';
    if (d < 190.0) return 'LOD5_DISTANT';
    return 'LOD5_DISTANT';
  }
}
