// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — CLOSURES & BODY PANELS 3D GENERATOR
// ============================================================================
// Procedurally generates exterior body panels, doors, hood, trunk, fenders,
// bumpers, and roof skin using high-polygon sculpted parametric CAD surfaces.
// ============================================================================

import * as THREE from 'three';
import { VehicleBodyType } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { SculptedBodyPanelsGenerator, BodyClosuresArticulation } from './sculptedBodyPanelsGenerator';
import { PaintConfiguration } from '../materials/modularBodyPanelCustomizer';

export class ModularClosuresGenerator {
  public static buildClosures(
    bodyType: VehicleBodyType,
    wheelbaseMm: number,
    trackWidthMm: number,
    materialGrade: MaterialGrade = 'forged',
    isXRay: boolean = false,
    paintColorHex: number = 0xb45309,
    articulation?: BodyClosuresArticulation,
    paintConfig?: Partial<PaintConfiguration>,
    trackWidthFrontMm?: number
  ): THREE.Group {
    return SculptedBodyPanelsGenerator.buildSculptedBody(
      bodyType,
      wheelbaseMm,
      trackWidthMm,
      materialGrade,
      isXRay,
      paintColorHex,
      articulation,
      paintConfig,
      trackWidthFrontMm
    );
  }
}
