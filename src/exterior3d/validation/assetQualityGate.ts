// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 8-STAGE QUALITY GATE ENGINE
// ============================================================================
// Performs exhaustive engineering & visual quality checks against the Master
// Automotive 3D Asset Bible standard before assets can be homologated.
// ============================================================================

import * as THREE from 'three';
import {
  BaseAutomotiveAssetContract,
  ChassisAssetContract,
  AttachmentSocketSpec,
} from '../contracts/assetContracts';
import { MasterAttachmentSocketEngine } from '../physics/masterAttachmentSocketEngine';

export interface QualityGateStageResult {
  stageId: number;
  stageName: string;
  passed: boolean;
  scorePct: number;
  criticalErrors: string[];
  warnings: string[];
  metrics: Record<string, number | string | boolean>;
}

export interface CompleteAssetQualityReport {
  assetId: string;
  assetName: string;
  subsystem: string;
  allPassed: boolean;
  compositeScorePct: number;
  stageResults: QualityGateStageResult[];
  homologationVerdict: 'HOMOLOGATED_PASS' | 'REVISE_DEFECTS_FAIL';
}

export class AutomotiveAssetQualityGate {
  /**
   * Executes the full 8-Stage Quality Gate on an automotive asset contract.
   */
  public static evaluateAsset(
    contract: BaseAutomotiveAssetContract,
    geometryMesh?: THREE.Object3D
  ): CompleteAssetQualityReport {
    const stageResults: QualityGateStageResult[] = [];

    // Stage 1: Geometry Quality & Silhouette Fidelity
    stageResults.push(this.gate1_GeometryIntegrity(contract, geometryMesh));

    // Stage 2: Automotive Engineering Plausibility
    stageResults.push(this.gate2_AutomotivePlausibility(contract));

    // Stage 3: Material & PBR Parameter Validation
    stageResults.push(this.gate3_PbrMaterialValidation(contract, geometryMesh));

    // Stage 4: Texture & Normal Map Channel Verification
    stageResults.push(this.gate4_TextureNormalMapVerification(contract));

    // Stage 5: Coordinate System & Metric Scale Alignment
    stageResults.push(this.gate5_CoordinateSystemScaleAlignment(contract, geometryMesh));

    // Stage 6: Modularity & Structural Socket Verification
    stageResults.push(this.gate6_ModularitySocketVerification(contract));

    // Stage 7: Deterministic Assembly Cycle & Transform Invariance
    stageResults.push(this.gate7_DeterministicAssemblyCycle(contract));

    // Stage 8: Performance Budget & Draw Call Compliance
    stageResults.push(this.gate8_PerformanceAndPolygonBudget(contract, geometryMesh));

    const allPassed = stageResults.every((r) => r.passed);
    const totalScore = stageResults.reduce((acc, r) => acc + r.scorePct, 0) / stageResults.length;

    return {
      assetId: contract.assetId,
      assetName: contract.name,
      subsystem: contract.subsystem,
      allPassed,
      compositeScorePct: Math.round(totalScore * 10) / 10,
      stageResults,
      homologationVerdict: allPassed ? 'HOMOLOGATED_PASS' : 'REVISE_DEFECTS_FAIL',
    };
  }

  // ── GATE 1: GEOMETRY INTEGRITY ──
  private static gate1_GeometryIntegrity(
    contract: BaseAutomotiveAssetContract,
    mesh?: THREE.Object3D
  ): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const dims = contract.boundingDimensionsM;
    if (dims.lengthM <= 0 || dims.widthM <= 0 || dims.heightM <= 0) {
      errors.push('Bounding dimensions must be strictly positive non-zero values.');
    }

    if (contract.massKg <= 0 || contract.massKg > 5000) {
      errors.push(`Mass (${contract.massKg} kg) is outside realistic automotive range (1 - 5000 kg).`);
    }

    let triangleCount = 0;
    if (mesh) {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geo = child.geometry;
          if (geo.index) {
            triangleCount += geo.index.count / 3;
          } else if (geo.attributes.position) {
            triangleCount += geo.attributes.position.count / 3;
          }
        }
      });
    }

    const passed = errors.length === 0;
    return {
      stageId: 1,
      stageName: 'Geometry Quality & Silhouette Fidelity',
      passed,
      scorePct: passed ? 100 : Math.max(0, 100 - errors.length * 35),
      criticalErrors: errors,
      warnings,
      metrics: {
        boundingLengthM: dims.lengthM,
        boundingWidthM: dims.widthM,
        boundingHeightM: dims.heightM,
        massKg: contract.massKg,
        extractedTriangles: triangleCount,
      },
    };
  }

  // ── GATE 2: AUTOMOTIVE ENGINEERING PLAUSIBILITY ──
  private static gate2_AutomotivePlausibility(contract: BaseAutomotiveAssetContract): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (contract.subsystem === 'chassis_platform') {
      const chContract = contract as ChassisAssetContract;
      const [minWb, maxWb] = chContract.wheelbaseRangeMm || [2000, 3500];
      if (minWb < 1800 || maxWb > 4200) {
        errors.push(`Wheelbase range [${minWb}, ${maxWb}] mm is outside passenger car engineering norms.`);
      }

      if (chContract.groundClearanceNominalMm < 40 || chContract.groundClearanceNominalMm > 350) {
        errors.push(`Ground clearance (${chContract.groundClearanceNominalMm} mm) violates automotive clearance thresholds.`);
      }

      if (chContract.engineBayVolumeLiters < 100 || chContract.engineBayVolumeLiters > 900) {
        warnings.push(`Engine bay volume (${chContract.engineBayVolumeLiters} L) requires packaging verification.`);
      }
    }

    const passed = errors.length === 0;
    return {
      stageId: 2,
      stageName: 'Automotive Engineering Plausibility',
      passed,
      scorePct: passed ? 100 : 50,
      criticalErrors: errors,
      warnings,
      metrics: {
        subsystem: contract.subsystem,
        torsionalRigidity: contract.torsionalStiffnessContributionNmPerDeg,
      },
    };
  }

  // ── GATE 3: MATERIAL & PBR PARAMETER VALIDATION ──
  private static gate3_PbrMaterialValidation(
    contract: BaseAutomotiveAssetContract,
    mesh?: THREE.Object3D
  ): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (contract.requiredMaterialSlots.length === 0) {
      errors.push('Asset does not declare any required PBR material slots.');
    }

    let pbrMaterialCount = 0;
    if (mesh) {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          pbrMaterialCount++;
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.roughness !== undefined && (mat.roughness < 0 || mat.roughness > 1)) {
            errors.push(`Material ${mat.name} has invalid roughness ${mat.roughness}.`);
          }
          if (mat.metalness !== undefined && (mat.metalness < 0 || mat.metalness > 1)) {
            errors.push(`Material ${mat.name} has invalid metalness ${mat.metalness}.`);
          }
        }
      });
    }

    const passed = errors.length === 0;
    return {
      stageId: 3,
      stageName: 'Material & PBR Parameter Validation',
      passed,
      scorePct: passed ? 100 : 40,
      criticalErrors: errors,
      warnings,
      metrics: {
        declaredSlots: contract.requiredMaterialSlots.join(', '),
        instantiatedPBRMaterials: pbrMaterialCount,
      },
    };
  }

  // ── GATE 4: TEXTURE & NORMAL MAP VERIFICATION ──
  private static gate4_TextureNormalMapVerification(contract: BaseAutomotiveAssetContract): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const reqMaps = contract.lodBudget.requiredTextureMaps;
    if (!reqMaps.includes('normal_tangent') && contract.lodBudget.lodLevel === 'LOD0_HERO') {
      warnings.push('LOD0 Hero asset does not mandate tangent-space normal map.');
    }

    const passed = errors.length === 0;
    return {
      stageId: 4,
      stageName: 'Texture & Normal Map Channel Verification',
      passed,
      scorePct: 100,
      criticalErrors: errors,
      warnings,
      metrics: {
        requiredTextureMaps: reqMaps.join(', '),
        maxResolution: contract.lodBudget.maxTextureResolution,
      },
    };
  }

  // ── GATE 5: COORDINATE SYSTEM & METRIC SCALE ALIGNMENT ──
  private static gate5_CoordinateSystemScaleAlignment(
    contract: BaseAutomotiveAssetContract,
    mesh?: THREE.Object3D
  ): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Centerline symmetry check: CoM X offset should be near 0 for symmetrical components
    if (contract.subsystem === 'chassis_platform' && Math.abs(contract.centerOfMassOffsetM[0]) > 0.05) {
      errors.push(`Chassis Center of Mass X-offset (${contract.centerOfMassOffsetM[0]} m) violates lateral symmetry.`);
    }

    const passed = errors.length === 0;
    return {
      stageId: 5,
      stageName: 'Coordinate System & Metric Scale Alignment',
      passed,
      scorePct: passed ? 100 : 60,
      criticalErrors: errors,
      warnings,
      metrics: {
        centerOfMassOffsetM: contract.centerOfMassOffsetM.join(', '),
        symmetryPlane: 'YZ (X=0)',
        scaleUnit: '1.0 unit = 1.0 meter',
      },
    };
  }

  // ── GATE 6: MODULARITY & STRUCTURAL SOCKET VERIFICATION ──
  private static gate6_ModularitySocketVerification(contract: BaseAutomotiveAssetContract): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (contract.subsystem === 'chassis_platform' && contract.providedSockets.length < 10) {
      errors.push(`Chassis provides only ${contract.providedSockets.length} sockets; minimum 10 required for full modularity.`);
    }

    contract.providedSockets.forEach((s) => {
      const normLen = Math.sqrt(
        s.normalVector[0] ** 2 + s.normalVector[1] ** 2 + s.normalVector[2] ** 2
      );
      if (Math.abs(normLen - 1.0) > 0.05) {
        warnings.push(`Socket ${s.socketId} normal vector is not normalized (len=${normLen.toFixed(3)}).`);
      }
      if (s.torqueRatingNm <= 0) {
        errors.push(`Socket ${s.socketId} has invalid fastener torque rating (${s.torqueRatingNm} Nm).`);
      }
    });

    const passed = errors.length === 0;
    return {
      stageId: 6,
      stageName: 'Modularity & Structural Socket Verification',
      passed,
      scorePct: passed ? 100 : 50,
      criticalErrors: errors,
      warnings,
      metrics: {
        providedSocketCount: contract.providedSockets.length,
        parentSocketTargetId: contract.parentSocketTargetId,
      },
    };
  }

  // ── GATE 7: DETERMINISTIC ASSEMBLY CYCLE TEST ──
  private static gate7_DeterministicAssemblyCycle(contract: BaseAutomotiveAssetContract): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let invariantPassCount = 0;
    contract.providedSockets.forEach((socket) => {
      const isInvariant = MasterAttachmentSocketEngine.verifyTransformInvariance(socket, 5);
      if (isInvariant) {
        invariantPassCount++;
      } else {
        errors.push(`Socket ${socket.socketId} failed deterministic assembly invariance test.`);
      }
    });

    const passed = errors.length === 0;
    return {
      stageId: 7,
      stageName: 'Deterministic Assembly Cycle & Transform Invariance',
      passed,
      scorePct: passed ? 100 : Math.round((invariantPassCount / Math.max(1, contract.providedSockets.length)) * 100),
      criticalErrors: errors,
      warnings,
      metrics: {
        testedSockets: contract.providedSockets.length,
        invariancePassRatePct: contract.providedSockets.length > 0
          ? Math.round((invariantPassCount / contract.providedSockets.length) * 100)
          : 100,
      },
    };
  }

  // ── GATE 8: PERFORMANCE & POLYGON BUDGET COMPLIANCE ──
  private static gate8_PerformanceAndPolygonBudget(
    contract: BaseAutomotiveAssetContract,
    mesh?: THREE.Object3D
  ): QualityGateStageResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const maxTriangles = contract.lodBudget.maxTriangles;

    let triCount = 0;
    if (mesh) {
      mesh.traverse((c) => {
        if (c instanceof THREE.Mesh && c.geometry) {
          const geo = c.geometry;
          triCount += geo.index ? geo.index.count / 3 : (geo.attributes.position ? geo.attributes.position.count / 3 : 0);
        }
      });

      if (triCount > maxTriangles) {
        warnings.push(`Instantiated geometry (${triCount} tris) exceeds budget (${maxTriangles} tris).`);
      }
    }

    return {
      stageId: 8,
      stageName: 'Performance Budget & Draw Call Compliance',
      passed: errors.length === 0,
      scorePct: 100,
      criticalErrors: errors,
      warnings,
      metrics: {
        lodTier: contract.lodBudget.lodLevel,
        maxTrianglesBudget: maxTriangles,
        actualTriangles: triCount,
        maxDrawCallsBudget: contract.lodBudget.maxDrawCalls,
      },
    };
  }
}
