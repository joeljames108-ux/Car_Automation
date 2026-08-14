// ===================================================================
// MASTER COORDINATE SPACE & ATTACHMENT SOLVER
// ===================================================================
// Converts between:
//   1. Chassis Local Coordinate System (mm):
//      - Origin (0,0,0) = Ground point at rear axle centreline
//      - X-axis: +X is forward towards front axle
//      - Y-axis: +Y is left from centreline (-Y is right)
//      - Z-axis: +Z is up from ground plane
//
//   2. SVG Canvas Coordinate System (px):
//      - Origin (0,0) = Top-left corner of SVG viewport
//      - X-axis: +X is right
//      - Y-axis: +Y is down
// ===================================================================

import type {
  Coordinate2D,
  Transform2D,
  AnchorPoint,
  MountingPoint,
  BoundingBox2D,
} from "./types";

export interface CoordinateSpaceConfig {
  /** SVG viewBox width in pixels */
  canvasWidth: number;
  /** SVG viewBox height in pixels */
  canvasHeight: number;
  /** Total chassis length in mm (including front and rear overhangs) */
  chassisLengthMm: number;
  /** Total chassis width in mm */
  chassisWidthMm: number;
  /** Canvas X pixel coordinate corresponding to rear axle centre (X = 0 mm) */
  rearAxleCanvasX: number;
  /** Canvas Y pixel coordinate corresponding to vehicle centreline (Y = 0 mm) */
  rearAxleCanvasY: number;
  /** Scale factor: millimeters per SVG canvas pixel */
  mmPerPx: number;
}

export class MasterCoordinateSpace {
  private config: CoordinateSpaceConfig;

  constructor(config: CoordinateSpaceConfig) {
    this.config = config;
  }

  /** Convert chassis-local mm coordinates to SVG canvas px coordinates */
  chassisToCanvas(pos: Coordinate2D): Coordinate2D {
    return {
      x: this.config.rearAxleCanvasX + pos.x / this.config.mmPerPx,
      y: this.config.rearAxleCanvasY - pos.y / this.config.mmPerPx, // SVG Y is inverted
    };
  }

  /** Convert SVG canvas px coordinates back to chassis-local mm coordinates */
  canvasToChassis(pos: Coordinate2D): Coordinate2D {
    return {
      x: (pos.x - this.config.rearAxleCanvasX) * this.config.mmPerPx,
      y: (this.config.rearAxleCanvasY - pos.y) * this.config.mmPerPx,
    };
  }

  /** Scale a length from millimeters to SVG canvas pixels */
  mmToPx(mm: number): number {
    return mm / this.config.mmPerPx;
  }

  /** Scale a length from SVG canvas pixels to millimeters */
  pxToMm(px: number): number {
    return px * this.config.mmPerPx;
  }

  /**
   * Deterministically solve the 2D transform required to attach a component's
   * mounting point onto a target chassis anchor point.
   */
  solveAttachmentTransform(
    chassisAnchor: AnchorPoint,
    componentMount: MountingPoint,
    mirror: boolean = false
  ): Transform2D {
    // 1. Target anchor position in canvas space
    const anchorCanvas = this.chassisToCanvas(chassisAnchor.position);

    // 2. Component mounting point in component-local mm → convert to px offset
    const mountPx: Coordinate2D = {
      x: componentMount.localPosition.x / this.config.mmPerPx,
      y: componentMount.localPosition.y / this.config.mmPerPx,
    };

    // 3. If mirrored (e.g. right-hand side component), invert local Y offset
    const effectiveMountY = mirror ? -mountPx.y : mountPx.y;

    // 4. Calculate canvas translation
    const translateX = anchorCanvas.x - mountPx.x;
    const translateY = anchorCanvas.y + effectiveMountY;

    // 5. Calculate rotation alignment
    const rotation = chassisAnchor.rotation - componentMount.rotation;

    return {
      translateX,
      translateY,
      rotation,
      scaleX: 1,
      scaleY: 1,
      mirrorX: mirror,
    };
  }

  /** Generate SVG transform attribute string from a Transform2D */
  toSVGTransform(t: Transform2D): string {
    const parts: string[] = [];
    parts.push(`translate(${t.translateX.toFixed(2)}, ${t.translateY.toFixed(2)})`);
    if (t.rotation !== 0) {
      parts.push(`rotate(${t.rotation.toFixed(2)})`);
    }
    if (t.scaleX !== 1 || t.scaleY !== 1) {
      parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
    }
    if (t.mirrorX) {
      parts.push(`scale(-1, 1)`);
    }
    return parts.join(" ");
  }

  /** Transform a bounding box from component-local space to canvas space */
  transformBoundingBox(box: BoundingBox2D, transform: Transform2D): BoundingBox2D {
    const x = transform.translateX + box.x / this.config.mmPerPx;
    const y = transform.translateY - box.y / this.config.mmPerPx;
    const width = box.width / this.config.mmPerPx;
    const height = box.height / this.config.mmPerPx;
    return { x, y, width, height };
  }

  /** Calculate Euclidean distance between two points in mm */
  distanceMm(p1: Coordinate2D, p2: Coordinate2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** Get front axle position in chassis-local mm coordinates */
  getFrontAxlePosition(wheelbaseMm: number): Coordinate2D {
    return { x: wheelbaseMm, y: 0 };
  }

  /** Get configuration readouts */
  getConfig(): Readonly<CoordinateSpaceConfig> {
    return { ...this.config };
  }
}

/** Create a default coordinate space instance tailored to typical vehicle proportions */
export function createDefaultCoordinateSpace(wheelbaseMm: number = 2650): MasterCoordinateSpace {
  const totalLength = wheelbaseMm + 900 + 600; // Total length: wheelbase + front/rear overhangs
  const totalWidth = 1850;
  const canvasWidth = 960;
  const canvasHeight = 440;
  // Map chassis length into 75% of SVG viewport width
  const mmPerPx = totalLength / (canvasWidth * 0.75);

  return new MasterCoordinateSpace({
    canvasWidth,
    canvasHeight,
    chassisLengthMm: totalLength,
    chassisWidthMm: totalWidth,
    rearAxleCanvasX: canvasWidth * 0.18,
    rearAxleCanvasY: canvasHeight * 0.5,
    mmPerPx,
  });
}
