// ===================================================================
// 3D ISOMETRIC PROJECTION MATHEMATICAL MATRIX & GEOMETRY ENGINE
// Standard 30-Degree Isometric Axonometric Projection (X-Right, Y-Left, Z-Up)
// ===================================================================

export interface IsoPoint3D {
  x: number; // Left-Right axis
  y: number; // In-Out depth axis
  z: number; // Vertical height axis
}

export interface ScreenPoint2D {
  x: number;
  y: number;
}

// 30-Degree Isometric Angles in Radians
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const COS_30 = Math.cos(ISO_ANGLE); // ~0.866025
const SIN_30 = Math.sin(ISO_ANGLE); // 0.5

/**
 * Projects a 3D point (x, y, z) into 2D Isometric Screen Coordinates (screenX, screenY)
 * @param pt 3D Point in isometric space
 * @param originScreen Center offset on the SVG canvas (default center: x=250, y=220)
 */
export function projectIso(
  pt: IsoPoint3D,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
): ScreenPoint2D {
  const screenX = originScreen.x + (pt.x - pt.y) * COS_30;
  const screenY = originScreen.y + (pt.x + pt.y) * SIN_30 - pt.z;
  return { x: Math.round(screenX * 100) / 100, y: Math.round(screenY * 100) / 100 };
}

/**
 * Generates SVG Path data for a 3D Volumetric Isometric Box / Cube facet
 */
export function getIsoBoxFacets(
  origin: IsoPoint3D,
  dx: number,
  dy: number,
  dz: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const p0 = projectIso({ x: origin.x, y: origin.y, z: origin.z }, originScreen);
  const p1 = projectIso({ x: origin.x + dx, y: origin.y, z: origin.z }, originScreen);
  const p2 = projectIso({ x: origin.x + dx, y: origin.y + dy, z: origin.z }, originScreen);
  const p3 = projectIso({ x: origin.x, y: origin.y + dy, z: origin.z }, originScreen);

  const p4 = projectIso({ x: origin.x, y: origin.y, z: origin.z + dz }, originScreen);
  const p5 = projectIso({ x: origin.x + dx, y: origin.y, z: origin.z + dz }, originScreen);
  const p6 = projectIso({ x: origin.x + dx, y: origin.y + dy, z: origin.z + dz }, originScreen);
  const p7 = projectIso({ x: origin.x, y: origin.y + dy, z: origin.z + dz }, originScreen);

  return {
    top: `M ${p4.x} ${p4.y} L ${p5.x} ${p5.y} L ${p6.x} ${p6.y} L ${p7.x} ${p7.y} Z`,
    left: `M ${p0.x} ${p0.y} L ${p3.x} ${p3.y} L ${p7.x} ${p7.y} L ${p4.x} ${p4.y} Z`,
    right: `M ${p3.x} ${p3.y} L ${p2.x} ${p2.y} L ${p6.x} ${p6.y} L ${p7.x} ${p7.y} Z`,
    front: `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p5.x} ${p5.y} L ${p4.x} ${p4.y} Z`,
    points: { p0, p1, p2, p3, p4, p5, p6, p7 },
  };
}

/**
 * Calculates Z-depth sorting index for overlapping 3D isometric shapes
 */
export function getIsoDepthSort(pt: IsoPoint3D): number {
  return pt.x + pt.y + pt.z * 1.5;
}

/**
 * Projects a 3D circle at given height Z into 2D Isometric Ellipse parameters
 */
export function projectIsoEllipse(
  center3D: IsoPoint3D,
  radius: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  const rx = radius * COS_30;
  const ry = radius * SIN_30;
  return { cx: center2D.x, cy: center2D.y, rx, ry };
}

/**
 * Projects a 3D circle lying on a tilted V-bank deck plane into isometric screen ellipse parameters
 */
export function projectIsoTiltedEllipse(
  center3D: IsoPoint3D,
  radius: number,
  bankSide: "left" | "right",
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  // 90-degree V-bank angle projection (45° outward tilt per bank)
  const rx = radius * COS_30 * 0.98;
  const ry = radius * (bankSide === "left" ? 0.78 : 0.58);
  const tiltDeg = bankSide === "left" ? -32 : 38;

  return {
    cx: center2D.x,
    cy: center2D.y,
    rx,
    ry,
    tiltDeg,
  };
}

/**
 * Computes SVG Path for a 3D Isometric Trapezoidal Strengthening Rib
 */
export function getIsoRibTrapezoid(
  topCenter: IsoPoint3D,
  botCenter: IsoPoint3D,
  width: number,
  thickness: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const halfW = width / 2;
  const tFL = projectIso({ x: topCenter.x - halfW, y: topCenter.y + thickness, z: topCenter.z }, originScreen);
  const tFR = projectIso({ x: topCenter.x + halfW, y: topCenter.y + thickness, z: topCenter.z }, originScreen);
  const tBL = projectIso({ x: topCenter.x - halfW, y: topCenter.y, z: topCenter.z }, originScreen);
  const tBR = projectIso({ x: topCenter.x + halfW, y: topCenter.y, z: topCenter.z }, originScreen);

  const bFL = projectIso({ x: botCenter.x - halfW, y: botCenter.y + thickness, z: botCenter.z }, originScreen);
  const bFR = projectIso({ x: botCenter.x + halfW, y: botCenter.y + thickness, z: botCenter.z }, originScreen);
  const bBL = projectIso({ x: botCenter.x - halfW, y: botCenter.y, z: botCenter.z }, originScreen);
  const bBR = projectIso({ x: botCenter.x + halfW, y: botCenter.y, z: botCenter.z }, originScreen);

  return {
    topCap: `M ${tBL.x} ${tBL.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`,
    frontFace: `M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${bFR.x} ${bFR.y} L ${bFL.x} ${bFL.y} Z`,
    leftFace: `M ${tBL.x} ${tBL.y} L ${tFL.x} ${tFL.y} L ${bFL.x} ${bFL.y} L ${bBL.x} ${bBL.y} Z`,
    rightFace: `M ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${bBR.x} ${bBR.y} L ${bFR.x} ${bFR.y} Z`,
    points: { tFL, tFR, tBL, tBR, bFL, bFR, bBL, bBR },
  };
}

/**
 * Linearly interpolates between two 2D screen points
 */
export function lerpScreenPoint(p1: ScreenPoint2D, p2: ScreenPoint2D, t: number): ScreenPoint2D {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

/**
 * Projects a 3D circle lying on a 60° V-bank deck plane into isometric screen ellipse parameters.
 * Each bank is tilted 30° from vertical (60° total V-angle).
 * This matches high-performance V12 engines (Ferrari, Lamborghini, BMW).
 */
export function projectIso60VEllipse(
  center3D: IsoPoint3D,
  radius: number,
  bankSide: "left" | "right",
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  // 60° V-angle → 30° tilt per bank from vertical
  // Foreshortening factors tuned for 30° isometric + 30° bank tilt
  const rx = radius * COS_30 * 0.95;
  const ry = radius * (bankSide === "left" ? 0.72 : 0.52);
  const tiltDeg = bankSide === "left" ? -25 : 30;

  return {
    cx: center2D.x,
    cy: center2D.y,
    rx,
    ry,
    tiltDeg,
  };
}

/**
 * Generates an SVG cubic Bezier path string through a series of 3D points projected to 2D.
 * Creates smooth curved casting surfaces instead of straight polygon edges.
 * Uses Catmull-Rom → Bezier conversion for natural-looking cast aluminium contours.
 */
export function getIsoCurvedPath(
  points3D: IsoPoint3D[],
  originScreen: ScreenPoint2D = { x: 250, y: 220 },
  closed: boolean = true
): string {
  const pts = points3D.map((p) => projectIso(p, originScreen));
  if (pts.length < 2) return "";

  let d = `M ${pts[0].x} ${pts[0].y}`;

  if (pts.length === 2) {
    d += ` L ${pts[1].x} ${pts[1].y}`;
    if (closed) d += " Z";
    return d;
  }

  // Catmull-Rom spline tension factor (0.5 = centripetal)
  const tension = 0.35;

  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];

    if (i === 0 && !closed) {
      continue; // skip first segment for open paths
    }

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  if (closed) d += " Z";
  return d;
}

/**
 * Generates 3D corner points for a V12 bank deck surface at a given 60° V-angle.
 * Returns front-left, front-right, back-left, back-right projected screen points.
 */
export function getV12BankDeckCorners(
  blockLength: number,
  bankSide: "left" | "right",
  outerY: number,
  innerY: number,
  outerZ: number,
  innerZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const halfLen = blockLength / 2;
  const ySign = bankSide === "left" ? 1 : -1;

  const outerFL = projectIso({ x: -halfLen, y: outerY * ySign, z: outerZ }, originScreen);
  const outerFR = projectIso({ x: halfLen, y: outerY * ySign, z: outerZ }, originScreen);
  const innerBL = projectIso({ x: -halfLen, y: innerY * ySign, z: innerZ }, originScreen);
  const innerBR = projectIso({ x: halfLen, y: innerY * ySign, z: innerZ }, originScreen);

  return { outerFL, outerFR, innerBL, innerBR };
}
