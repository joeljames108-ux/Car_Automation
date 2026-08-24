// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REAL-TIME PARAMETRIC TRANSFORM SOLVER
// ============================================================================
// Calculates dynamic 3D geometric deformation matrices, scale vectors, and
// position offsets for all engine components in real-time as the user adjusts
// engine specifications (bore, stroke, rod length, turbo boost, radiator, etc.).
// ============================================================================

import type { Engine3DComponentType } from '../types';
import type { EngineConfig } from '../../sim/types';

export interface ComponentParametricTransform {
  scale: [number, number, number]; // [scaleX, scaleY, scaleZ]
  positionOffset?: [number, number, number]; // [offsetX, offsetY, offsetZ]
}

// ── Baseline Engineering Standards (V12 Reference Engine) ──
export const BASELINE_ENGINE_SPECS = {
  boreMm: 88.0,
  strokeMm: 82.0,
  rodLengthMm: 140.0,
  compressionRatio: 11.5,
  turboSize: 0.5,
  boostPressureBar: 1.2,
  coolingRadiator: 0.8,
  exhaustCollectorDiaMm: 76.0,
  exhaustPrimaryLengthMm: 650.0,
};

/**
 * Solves the exact 3D parametric scale and offset for any given component type
 * based on live EngineConfig specifications.
 */
export function solveParametricTransformForComponent(
  type: Engine3DComponentType,
  engineConfig?: Partial<EngineConfig>
): ComponentParametricTransform {
  if (!engineConfig) {
    return { scale: [1, 1, 1] };
  }

  const bore = engineConfig.bore ?? BASELINE_ENGINE_SPECS.boreMm;
  const stroke = engineConfig.stroke ?? BASELINE_ENGINE_SPECS.strokeMm;
  const rodLength = engineConfig.rodLength ?? BASELINE_ENGINE_SPECS.rodLengthMm;
  const cr = engineConfig.compressionRatio ?? BASELINE_ENGINE_SPECS.compressionRatio;
  const turboSize = engineConfig.turboSize ?? BASELINE_ENGINE_SPECS.turboSize;
  const boost = engineConfig.boostPressure ?? BASELINE_ENGINE_SPECS.boostPressureBar;
  const rad = engineConfig.coolingRadiator ?? BASELINE_ENGINE_SPECS.coolingRadiator;
  const primaryLen = engineConfig.exhaustPrimaryLength ?? BASELINE_ENGINE_SPECS.exhaustPrimaryLengthMm;
  const collectorDia = engineConfig.exhaustCollectorDia ?? BASELINE_ENGINE_SPECS.exhaustCollectorDiaMm;

  // Normalized scaling factors (1.0 = baseline)
  const boreScale = Math.max(0.75, Math.min(1.35, bore / BASELINE_ENGINE_SPECS.boreMm));
  const strokeScale = Math.max(0.70, Math.min(1.40, stroke / BASELINE_ENGINE_SPECS.strokeMm));
  const rodScale = Math.max(0.80, Math.min(1.25, rodLength / BASELINE_ENGINE_SPECS.rodLengthMm));
  const compRatioScale = Math.max(0.85, Math.min(1.20, 1.0 + (cr - BASELINE_ENGINE_SPECS.compressionRatio) * 0.04));
  const turboScale = Math.max(0.70, Math.min(1.50, 0.70 + turboSize * 0.40 + (boost / 3.0) * 0.30));
  const radScale = Math.max(0.75, Math.min(1.30, 0.70 + rad * 0.375));
  const exhaustLenScale = Math.max(0.80, Math.min(1.30, primaryLen / BASELINE_ENGINE_SPECS.exhaustPrimaryLengthMm));
  const exhaustDiaScale = Math.max(0.80, Math.min(1.30, collectorDia / BASELINE_ENGINE_SPECS.exhaustCollectorDiaMm));

  switch (type) {
    // ── 1. PISTONS (Bore diameter scales X & Z, Compression dome scales Y) ──
    case 'piston':
      return {
        scale: [boreScale, compRatioScale, boreScale],
        positionOffset: [0, (strokeScale - 1.0) * 0.05 + (rodScale - 1.0) * 0.035, 0],
      };

    // ── 2. CRANKSHAFT (Stroke length scales journal throw radius Y & Z, bore pitch scales X) ──
    case 'crankshaft':
      return {
        scale: [1.0 + (boreScale - 1.0) * 0.40, strokeScale, strokeScale],
        positionOffset: [0, 0, 0],
      };

    // ── 3. CONNECTING RODS (Rod length elongates column along Z, cross-section scales with bore/stroke) ──
    case 'connecting-rod':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.20,
          1.0 + (strokeScale - 1.0) * 0.20,
          rodScale,
        ],
        positionOffset: [0, (strokeScale - 1.0) * 0.025, 0],
      };

    // ── 4. ENGINE BLOCK (Cylinder bore sleeves & deck envelope adjust) ──
    // X = Longitudinal length, Y = Deck Height (Stroke + Rod), Z = Lateral Width across banks (Bore)
    case 'engine-block': {
      const blockLengthScale = 1.0 + (boreScale - 1.0) * 0.40;
      const blockHeightScale = 1.0 + (strokeScale - 1.0) * 0.45 + (rodScale - 1.0) * 0.25;
      const blockWidthScale = 1.0 + (boreScale - 1.0) * 0.55;
      return {
        scale: [blockLengthScale, blockHeightScale, blockWidthScale],
        positionOffset: [0, (strokeScale - 1.0) * 0.015, 0],
      };
    }

    // ── 5. CYLINDER HEADS (Combustion chambers adjust with bore diameter, deck elevates with stroke) ──
    case 'cylinder-head-left': {
      const headLengthScale = 1.0 + (boreScale - 1.0) * 0.40;
      const headWidthScale = 1.0 + (boreScale - 1.0) * 0.55;
      const headHeightScale = 1.0 + (compRatioScale - 1.0) * 0.15;
      return {
        scale: [headLengthScale, headHeightScale, headWidthScale],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.055 + (rodScale - 1.0) * 0.035,
          (boreScale - 1.0) * 0.035,
        ],
      };
    }
    case 'cylinder-head-right': {
      const headLengthScale = 1.0 + (boreScale - 1.0) * 0.40;
      const headWidthScale = 1.0 + (boreScale - 1.0) * 0.55;
      const headHeightScale = 1.0 + (compRatioScale - 1.0) * 0.15;
      return {
        scale: [headLengthScale, headHeightScale, headWidthScale],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.055 + (rodScale - 1.0) * 0.035,
          -(boreScale - 1.0) * 0.035,
        ],
      };
    }

    // ── 6. VALVE COVERS (Follow cylinder head deck envelope) ──
    case 'valve-cover-left': {
      const coverLengthScale = 1.0 + (boreScale - 1.0) * 0.40;
      const coverWidthScale = 1.0 + (boreScale - 1.0) * 0.55;
      return {
        scale: [coverLengthScale, 1.0, coverWidthScale],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.070 + (rodScale - 1.0) * 0.045,
          (boreScale - 1.0) * 0.040,
        ],
      };
    }
    case 'valve-cover-right': {
      const coverLengthScale = 1.0 + (boreScale - 1.0) * 0.40;
      const coverWidthScale = 1.0 + (boreScale - 1.0) * 0.55;
      return {
        scale: [coverLengthScale, 1.0, coverWidthScale],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.070 + (rodScale - 1.0) * 0.045,
          -(boreScale - 1.0) * 0.040,
        ],
      };
    }

    // ── 7. TURBOCHARGER (Compressor & Turbine housing volume scales with boost & A/R) ──
    case 'turbocharger':
      return {
        scale: [turboScale, turboScale, turboScale],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.035,
          (boreScale - 1.0) * 0.030,
        ],
      };

    // ── 8. RADIATOR (Core thickness, width & height scale with cooling demand) ──
    case 'radiator':
      return {
        scale: [1.0 + (radScale - 1.0) * 0.35, radScale, radScale],
      };

    // ── 9. EXHAUST HEADERS (Primary length and merge collector diameter) ──
    case 'exhaust-header-left':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          exhaustLenScale * (1.0 + (strokeScale - 1.0) * 0.20),
          exhaustDiaScale * (1.0 + (boreScale - 1.0) * 0.35),
        ],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.045 + (rodScale - 1.0) * 0.025,
          (boreScale - 1.0) * 0.040,
        ],
      };
    case 'exhaust-header-right':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          exhaustLenScale * (1.0 + (strokeScale - 1.0) * 0.20),
          exhaustDiaScale * (1.0 + (boreScale - 1.0) * 0.35),
        ],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.045 + (rodScale - 1.0) * 0.025,
          -(boreScale - 1.0) * 0.040,
        ],
      };

    // ── 10. INTAKE MANIFOLD (Velocity stack trumpet height and runner cross-section) ──
    case 'intake-manifold-left':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          1.0 + (strokeScale - 1.0) * 0.15,
          1.0 + (boreScale - 1.0) * 0.35,
        ],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.050 + (rodScale - 1.0) * 0.030,
          (boreScale - 1.0) * 0.020,
        ],
      };
    case 'intake-manifold-right':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          1.0 + (strokeScale - 1.0) * 0.15,
          1.0 + (boreScale - 1.0) * 0.35,
        ],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.050 + (rodScale - 1.0) * 0.030,
          -(boreScale - 1.0) * 0.020,
        ],
      };

    // ── 11. DRY SUMP PAN (Sump width & depth matches block crankcase) ──
    case 'dry-sump':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          1.0 + (strokeScale - 1.0) * 0.40,
          1.0 + (boreScale - 1.0) * 0.50,
        ],
        positionOffset: [0, -(strokeScale - 1.0) * 0.020, 0],
      };

    // ── 12. TRANSAXLE / GEARBOX ──
    case 'transaxle':
      return {
        scale: [1.0, 1.0, 1.0],
      };

    // ── 13. TOP ENGINE COVER (Matches block deck width and elevates with deck) ──
    case 'engine-cover':
      return {
        scale: [
          1.0 + (boreScale - 1.0) * 0.40,
          1.0,
          1.0 + (boreScale - 1.0) * 0.55,
        ],
        positionOffset: [
          0,
          (strokeScale - 1.0) * 0.075 + (rodScale - 1.0) * 0.050,
          0,
        ],
      };

    default:
      return { scale: [1, 1, 1] };
  }
}

export default solveParametricTransformForComponent;
