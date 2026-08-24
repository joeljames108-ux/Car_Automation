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
    // ── 1. PISTONS (Bore diameter scales X & Y, Compression dome scales Z) ──
    case 'piston':
      return {
        scale: [boreScale, boreScale, compRatioScale],
      };

    // ── 2. CRANKSHAFT (Stroke length scales journal throw radius Y & Z) ──
    case 'crankshaft':
      return {
        scale: [1.0, strokeScale, strokeScale],
      };

    // ── 3. CONNECTING RODS (Rod length elongates column along Z) ──
    case 'connecting-rod':
      return {
        scale: [
          1.0 + (strokeScale - 1.0) * 0.15,
          1.0 + (boreScale - 1.0) * 0.15,
          rodScale,
        ],
      };

    // ── 4. ENGINE BLOCK (Cylinder bore sleeves & deck envelope adjust) ──
    case 'engine-block': {
      const blockWidthScale = 1.0 + (boreScale - 1.0) * 0.35;
      const blockHeightScale = 1.0 + (strokeScale - 1.0) * 0.20 + (rodScale - 1.0) * 0.20;
      return {
        scale: [1.0, blockWidthScale, blockHeightScale],
      };
    }

    // ── 5. CYLINDER HEADS (Combustion chambers adjust with bore diameter) ──
    case 'cylinder-head-left':
    case 'cylinder-head-right': {
      const headScale = 1.0 + (boreScale - 1.0) * 0.25;
      return {
        scale: [1.0, headScale, headScale],
      };
    }

    // ── 6. VALVE COVERS (Follow cylinder head deck envelope) ──
    case 'valve-cover-left':
    case 'valve-cover-right': {
      const coverScale = 1.0 + (boreScale - 1.0) * 0.20;
      return {
        scale: [1.0, coverScale, 1.0],
      };
    }

    // ── 7. TURBOCHARGER (Compressor & Turbine housing volume scales with boost & A/R) ──
    case 'turbocharger':
      return {
        scale: [turboScale, turboScale, turboScale],
      };

    // ── 8. RADIATOR (Core thickness, width & height scale with cooling demand) ──
    case 'radiator':
      return {
        scale: [1.0 + (radScale - 1.0) * 0.35, radScale, radScale],
      };

    // ── 9. EXHAUST HEADERS (Primary length and merge collector diameter) ──
    case 'exhaust-header-left':
    case 'exhaust-header-right':
      return {
        scale: [exhaustLenScale, exhaustDiaScale, exhaustDiaScale],
      };

    // ── 10. INTAKE MANIFOLD (Velocity stack trumpet height and runner cross-section) ──
    case 'intake-manifold-left':
    case 'intake-manifold-right': {
      const runnerScale = 1.0 + (boreScale - 1.0) * 0.20;
      return {
        scale: [1.0, runnerScale, runnerScale],
      };
    }

    // ── 11. DRY SUMP PAN (Sump width matches block crankcase) ──
    case 'dry-sump': {
      const sumpWidthScale = 1.0 + (boreScale - 1.0) * 0.25;
      return {
        scale: [1.0, sumpWidthScale, 1.0],
      };
    }

    // ── 12. TRANSAXLE / GEARBOX ──
    case 'transaxle':
      return {
        scale: [1.0, 1.0, 1.0],
      };

    // ── 13. TOP ENGINE COVER (Matches block deck width) ──
    case 'engine-cover': {
      const coverWidth = 1.0 + (boreScale - 1.0) * 0.25;
      return {
        scale: [1.0, coverWidth, 1.0],
      };
    }

    default:
      return { scale: [1, 1, 1] };
  }
}

export default solveParametricTransformForComponent;
