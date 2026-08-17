// ============================================================================
// PHASE 03 — MASTER GEOMETRY ARCHITECTURE & 3D COORDINATE SYSTEM
// ============================================================================
// Standardized 3D Millimeter Coordinate Space, Three.js Metre Mapping,
// and 2D Multi-View (Top, Side, Front, Isometric) Canvas Projections.
// ============================================================================

import * as THREE from 'three';

export interface Point3D_MM {
  x: number; // Lateral: 0 = Centerline, +X = Right, -X = Left (mm)
  y: number; // Vertical: 0 = Ground plane, +Y = Upwards (mm)
  z: number; // Longitudinal: 0 = Front Axle, +Z = Forward, -Z = Rearward (mm)
}

export interface Vector3D_MM {
  x: number;
  y: number;
  z: number;
}

export interface CanvasPoint2D {
  x: number;
  y: number;
}

export interface IsometricProjectionConfig {
  viewAngleDeg: number; // typically 30 deg isometric angle
  scalePxPerMm: number; // e.g. 0.15 px / mm
  originCanvasX: number;
  originCanvasY: number;
}

export class Master3DCoordinateSystem {
  /**
   * Converts 3D Millimeter Chassis Coordinates to Three.js World Metric Coordinates (metres).
   */
  public static mmToThree(ptMm: Point3D_MM): THREE.Vector3 {
    return new THREE.Vector3(
      ptMm.x / 1000.0,
      ptMm.y / 1000.0,
      ptMm.z / 1000.0
    );
  }

  /**
   * Converts Three.js World Metric Coordinates back to 3D Millimeter Coordinates.
   */
  public static threeToMm(vec: THREE.Vector3): Point3D_MM {
    return {
      x: Math.round(vec.x * 1000.0 * 100) / 100,
      y: Math.round(vec.y * 1000.0 * 100) / 100,
      z: Math.round(vec.z * 1000.0 * 100) / 100,
    };
  }

  /**
   * Projects 3D mm coordinates to 2D Top View (Plan View, looking down from +Y).
   * Screen X = Vehicle Right (+X), Screen Y = Vehicle Forward (+Z).
   */
  public static projectTopView(ptMm: Point3D_MM, scale: number, centerCanvas: CanvasPoint2D): CanvasPoint2D {
    return {
      x: centerCanvas.x + ptMm.x * scale,
      y: centerCanvas.y - ptMm.z * scale, // +Z forward maps up on screen
    };
  }

  /**
   * Projects 3D mm coordinates to 2D Side View (Profile View from left side, looking at -X).
   * Screen X = Vehicle Forward (+Z), Screen Y = Vertical Up (+Y).
   */
  public static projectSideView(ptMm: Point3D_MM, scale: number, centerCanvas: CanvasPoint2D): CanvasPoint2D {
    return {
      x: centerCanvas.x + ptMm.z * scale,
      y: centerCanvas.y - ptMm.y * scale, // +Y up maps up on screen
    };
  }

  /**
   * Projects 3D mm coordinates to 2D Front View (Looking head-on at +Z).
   * Screen X = Vehicle Right (+X), Screen Y = Vertical Up (+Y).
   */
  public static projectFrontView(ptMm: Point3D_MM, scale: number, centerCanvas: CanvasPoint2D): CanvasPoint2D {
    return {
      x: centerCanvas.x + ptMm.x * scale,
      y: centerCanvas.y - ptMm.y * scale,
    };
  }

  /**
   * Projects 3D mm coordinates to 30° Axonometric Isometric View.
   */
  public static projectIsometricView(ptMm: Point3D_MM, cfg: IsometricProjectionConfig): CanvasPoint2D {
    const angleRad = (cfg.viewAngleDeg * Math.PI) / 180.0;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    // Iso X: +X (Right) goes down-right, -Z (Rear) goes down-left
    const isoX = (ptMm.x * cosA - ptMm.z * cosA) * cfg.scalePxPerMm;
    // Iso Y: +Y (Up) goes straight up, +X & -Z contribute down
    const isoY = (-ptMm.y + (ptMm.x * sinA + ptMm.z * sinA)) * cfg.scalePxPerMm;

    return {
      x: cfg.originCanvasX + isoX,
      y: cfg.originCanvasY + isoY,
    };
  }

  /**
   * Computes Euclidean 3D distance between two millimeter points.
   */
  public static distance3D(p1: Point3D_MM, p2: Point3D_MM): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Mirrored point across longitudinal centerline (X = 0).
   */
  public static mirrorPointX(ptMm: Point3D_MM): Point3D_MM {
    return {
      x: -ptMm.x,
      y: ptMm.y,
      z: ptMm.z,
    };
  }
}
