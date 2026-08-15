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

// ===================================================================
// PHASE 1 — EXTENDED ISOMETRIC GEOMETRY ENGINE
// Layout-agnostic utilities for Boxer, W-Bank, Radial, VR, & more
// ===================================================================

/**
 * Linearly interpolates between two 3D isometric points.
 * Used for smooth transition curves on casting surfaces.
 */
export function lerpIsoPoint3D(a: IsoPoint3D, b: IsoPoint3D, t: number): IsoPoint3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Projects a 3D circle lying on a Boxer / Flat-engine 180° horizontal plane.
 * The deck surface is perpendicular to the Y-axis (cylinders point outward left/right).
 * @param center3D  3D center of the bore on the horizontal deck
 * @param radius    Bore radius in mm
 * @param bankSide  'left' = cylinders pointing +Y, 'right' = cylinders pointing -Y
 * @param originScreen  SVG canvas origin
 */
export function projectIsoFlatEllipse(
  center3D: IsoPoint3D,
  radius: number,
  bankSide: "left" | "right",
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  // 180° flat engine — bores face sideways on the Y-axis plane
  // Foreshortening: the bore opening is nearly edge-on in isometric when looking down
  // Left bank deck faces the viewer more than the right
  const rx = radius * COS_30 * 0.55;       // Extreme horizontal foreshortening
  const ry = radius * (bankSide === "left" ? 0.92 : 0.92);
  const tiltDeg = bankSide === "left" ? -60 : 60;

  return {
    cx: center2D.x,
    cy: center2D.y,
    rx,
    ry,
    tiltDeg,
  };
}

/**
 * Projects a 3D circle on one of four W-engine cylinder bank decks.
 * W-engines have two VR sub-banks each tilted 15° from a common center,
 * with the two VR pairs separated by the main V-angle (typically 72° or 90°).
 *
 * @param center3D      3D center of bore
 * @param radius        Bore radius
 * @param bankIndex     0=left-outer, 1=left-inner, 2=right-inner, 3=right-outer
 * @param mainVAngleDeg Main V-angle between the two VR pairs (72° for W12, 90° for W16)
 * @param subAngleDeg   Narrow sub-angle within each VR pair (15° typical)
 * @param originScreen  SVG canvas origin
 */
export function projectIsoWBankQuadEllipse(
  center3D: IsoPoint3D,
  radius: number,
  bankIndex: 0 | 1 | 2 | 3,
  mainVAngleDeg: number = 72,
  subAngleDeg: number = 15,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  const halfMain = mainVAngleDeg / 2;
  const halfSub = subAngleDeg / 2;

  // Bank tilt angles from vertical:
  // left-outer  = +(halfMain + halfSub) = +43.5° for W12 (72° + 15°)/2
  // left-inner  = +(halfMain - halfSub) = +28.5°
  // right-inner = -(halfMain - halfSub) = -28.5°
  // right-outer = -(halfMain + halfSub) = -43.5°
  const bankAngles = [
    halfMain + halfSub,   // left-outer
    halfMain - halfSub,   // left-inner
    -(halfMain - halfSub), // right-inner
    -(halfMain + halfSub), // right-outer
  ];

  const angleDeg = bankAngles[bankIndex];
  const angleRad = (angleDeg * Math.PI) / 180;

  // Foreshorten based on bank tilt away from viewer
  const foreshorten = Math.cos(angleRad);
  const rx = radius * COS_30 * Math.abs(foreshorten) * 0.88;
  const ry = radius * (0.4 + 0.35 * Math.abs(foreshorten));

  // SVG ellipse rotation matching bank tilt in isometric space
  const tiltDeg = angleDeg * 0.72; // Approximate screen tilt

  return {
    cx: center2D.x,
    cy: center2D.y,
    rx,
    ry,
    tiltDeg,
    bankAngleDeg: angleDeg,
  };
}

/**
 * Generates 3D positions for cylinders arranged in a radial star-pattern.
 * Used for radial aircraft engines (R-2800 style).
 *
 * @param numCylinders  Number of cylinders in the ring (7 or 9 typical)
 * @param ringRadius    Distance from crankshaft center to bore center (mm)
 * @param boreRadius    Individual cylinder bore radius (mm)
 * @param centerZ       Z-height of the cylinder ring center
 * @param startAngleDeg Starting angle offset (typically 0°)
 * @param originScreen  SVG canvas origin
 */
export function projectIsoRadialRing(
  numCylinders: number,
  ringRadius: number,
  boreRadius: number,
  centerZ: number = 100,
  startAngleDeg: number = -90,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const cylinders: Array<{
    center3D: IsoPoint3D;
    center2D: ScreenPoint2D;
    angleDeg: number;
    rx: number;
    ry: number;
    tiltDeg: number;
  }> = [];

  for (let i = 0; i < numCylinders; i++) {
    const angleDeg = startAngleDeg + (360 / numCylinders) * i;
    const angleRad = (angleDeg * Math.PI) / 180;

    const center3D: IsoPoint3D = {
      x: 0,
      y: ringRadius * Math.cos(angleRad),
      z: centerZ + ringRadius * Math.sin(angleRad),
    };

    const center2D = projectIso(center3D, originScreen);

    // Foreshortening based on cylinder's angle around the ring
    // Cylinders pointing toward/away from viewer are more foreshortened
    const facingFactor = Math.abs(Math.sin(angleRad));
    const rx = boreRadius * COS_30 * (0.5 + 0.4 * facingFactor);
    const ry = boreRadius * (0.35 + 0.55 * Math.abs(Math.cos(angleRad)));

    // Tilt follows the radial angle projected into 2D isometric space
    const tiltDeg = angleDeg * 0.65;

    cylinders.push({ center3D, center2D, angleDeg, rx, ry, tiltDeg });
  }

  return cylinders;
}

/**
 * Projects a 3D circle on a V-bank deck at any arbitrary V-angle.
 * Generalizes projectIso60VEllipse and projectIsoTiltedEllipse.
 *
 * @param center3D     3D bore center on the angled deck surface
 * @param radius       Bore radius
 * @param bankSide     'left' or 'right'
 * @param vAngleDeg    Total included V-angle (e.g., 60, 72, 90)
 * @param originScreen SVG canvas origin
 */
export function projectIsoVAngleEllipse(
  center3D: IsoPoint3D,
  radius: number,
  bankSide: "left" | "right",
  vAngleDeg: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const center2D = projectIso(center3D, originScreen);
  const halfAngleRad = ((vAngleDeg / 2) * Math.PI) / 180;
  const foreshorten = Math.cos(halfAngleRad);

  const rx = radius * COS_30 * (0.7 + 0.28 * foreshorten);
  const ry = radius * (bankSide === "left"
    ? 0.45 + 0.4 * foreshorten
    : 0.3 + 0.35 * foreshorten
  );

  // Screen tilt proportional to half-angle, mirrored for right bank
  const tiltDeg = bankSide === "left"
    ? -(vAngleDeg / 2) * 0.82
    : (vAngleDeg / 2) * 0.95;

  return { cx: center2D.x, cy: center2D.y, rx, ry, tiltDeg };
}

/**
 * Generates an SVG path string for the visible wall of an isometric 3D cylinder.
 * Used for individual cylinder barrel/sleeve rendering (radial engines, boxer barrels).
 *
 * @param topCenter3D    3D center of the cylinder top circle
 * @param bottomCenter3D 3D center of the cylinder bottom circle
 * @param radius         Cylinder radius
 * @param originScreen   SVG canvas origin
 */
export function getIsoCylinderWall(
  topCenter3D: IsoPoint3D,
  bottomCenter3D: IsoPoint3D,
  radius: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const topE = projectIsoEllipse(topCenter3D, radius, originScreen);
  const botE = projectIsoEllipse(bottomCenter3D, radius, originScreen);

  // Left and right tangent lines connecting top and bottom ellipses
  const wallPath = `
    M ${topE.cx - topE.rx} ${topE.cy}
    L ${botE.cx - botE.rx} ${botE.cy}
    A ${botE.rx} ${botE.ry} 0 0 0 ${botE.cx + botE.rx} ${botE.cy}
    L ${topE.cx + topE.rx} ${topE.cy}
    A ${topE.rx} ${topE.ry} 0 0 1 ${topE.cx - topE.rx} ${topE.cy}
    Z
  `.trim();

  const topEllipsePath = `
    M ${topE.cx - topE.rx} ${topE.cy}
    A ${topE.rx} ${topE.ry} 0 1 0 ${topE.cx + topE.rx} ${topE.cy}
    A ${topE.rx} ${topE.ry} 0 1 0 ${topE.cx - topE.rx} ${topE.cy}
    Z
  `.trim();

  const bottomEllipsePath = `
    M ${botE.cx - botE.rx} ${botE.cy}
    A ${botE.rx} ${botE.ry} 0 1 0 ${botE.cx + botE.rx} ${botE.cy}
    A ${botE.rx} ${botE.ry} 0 1 0 ${botE.cx - botE.rx} ${botE.cy}
    Z
  `.trim();

  return {
    wallPath,
    topEllipsePath,
    bottomEllipsePath,
    topEllipse: topE,
    bottomEllipse: botE,
  };
}

/**
 * Generates an SVG arc path segment for epitrochoid curves (Wankel rotary housings).
 * Creates a smooth epitrochoidal path from a parametric equation.
 *
 * @param R           Major radius (rotor housing major axis)
 * @param e           Eccentricity (offset of eccentric shaft)
 * @param numPoints   Number of interpolation points (higher = smoother)
 * @param centerX     Screen X center
 * @param centerY     Screen Y center
 * @param scale       Pixel-per-mm scaling factor
 * @param rotation    Rotation angle in degrees
 */
export function getIsoEpitrochoidPath(
  R: number,
  e: number,
  numPoints: number = 120,
  centerX: number = 250,
  centerY: number = 220,
  scale: number = 1.0,
  rotation: number = 0
): string {
  const rotRad = (rotation * Math.PI) / 180;
  const points: ScreenPoint2D[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const theta = (2 * Math.PI * i) / numPoints;
    // Epitrochoid equation: x = (R+e)*cos(θ) - e*cos((R/e + 1)*θ)
    //                       y = (R+e)*sin(θ) - e*sin((R/e + 1)*θ)
    const ratio = R / e;
    const rawX = (R + e) * Math.cos(theta) - e * Math.cos((ratio + 1) * theta);
    const rawY = (R + e) * Math.sin(theta) - e * Math.sin((ratio + 1) * theta);

    // Apply rotation and isometric foreshortening
    const rotX = rawX * Math.cos(rotRad) - rawY * Math.sin(rotRad);
    const rotY = rawX * Math.sin(rotRad) + rawY * Math.cos(rotRad);

    // Apply isometric projection (simplified for XZ plane)
    const screenX = centerX + rotX * scale * COS_30 * 0.85;
    const screenY = centerY + rotY * scale * SIN_30 * 1.1;

    points.push({ x: Math.round(screenX * 100) / 100, y: Math.round(screenY * 100) / 100 });
  }

  if (points.length < 2) return "";

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += " Z";
  return d;
}

/**
 * Generates SVG path data for a 3D isometric box with filleted/rounded edges.
 * Used for precision-machined casting surfaces that have radiused transitions
 * instead of sharp polygon corners (more realistic than getIsoBoxFacets).
 *
 * @param origin   Bottom-front-left corner in 3D
 * @param dx       Width along X
 * @param dy       Depth along Y
 * @param dz       Height along Z
 * @param filletR  Fillet radius (in 3D mm)
 * @param originScreen SVG canvas origin
 */
export function getIsoRoundedBoxFacets(
  origin: IsoPoint3D,
  dx: number,
  dy: number,
  dz: number,
  filletR: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  // Generate corner points same as regular box
  const base = getIsoBoxFacets(origin, dx, dy, dz, originScreen);

  // For each visible face, add cubic bezier curves at corners
  // The fillet radius is projected into 2D and used as control point offset
  const filletScreen = filletR * COS_30 * 0.7;

  // Build rounded top face path with bezier corners
  const { p4, p5, p6, p7 } = base.points;
  const roundedTop = `
    M ${p4.x + filletScreen} ${p4.y}
    L ${p5.x - filletScreen} ${p5.y}
    Q ${p5.x} ${p5.y} ${p5.x} ${p5.y + filletScreen * 0.5}
    L ${p6.x} ${p6.y - filletScreen * 0.5}
    Q ${p6.x} ${p6.y} ${p6.x - filletScreen} ${p6.y}
    L ${p7.x + filletScreen} ${p7.y}
    Q ${p7.x} ${p7.y} ${p7.x} ${p7.y - filletScreen * 0.5}
    L ${p4.x} ${p4.y + filletScreen * 0.5}
    Q ${p4.x} ${p4.y} ${p4.x + filletScreen} ${p4.y}
    Z
  `.trim();

  return {
    ...base,
    roundedTop,
    filletScreen,
  };
}

/**
 * Generates 3D corner points for a Boxer / Flat-engine split crankcase.
 * Returns top-half and bottom-half facets separated by a horizontal parting line.
 *
 * @param blockLength  Length along X (crankshaft axis)
 * @param totalWidth   Total width along Y (both banks + central case)
 * @param caseHeight   Total height along Z
 * @param splitZ       Z-height of the crankcase parting line (typically 40-50% up)
 * @param originScreen SVG canvas origin
 */
export function getIsoSplitCaseFacets(
  blockLength: number,
  totalWidth: number,
  caseHeight: number,
  splitZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const halfL = blockLength / 2;
  const halfW = totalWidth / 2;

  // Upper case (above parting line)
  const upperCase = getIsoBoxFacets(
    { x: -halfL, y: -halfW, z: splitZ },
    blockLength, totalWidth, caseHeight - splitZ,
    originScreen
  );

  // Lower case (below parting line, includes oil sump)
  const lowerCase = getIsoBoxFacets(
    { x: -halfL, y: -halfW, z: 0 },
    blockLength, totalWidth, splitZ,
    originScreen
  );

  // Parting line points (horizontal ring at Z = splitZ)
  const partFL = projectIso({ x: -halfL, y: halfW, z: splitZ }, originScreen);
  const partFR = projectIso({ x: halfL, y: halfW, z: splitZ }, originScreen);
  const partBL = projectIso({ x: -halfL, y: -halfW, z: splitZ }, originScreen);
  const partBR = projectIso({ x: halfL, y: -halfW, z: splitZ }, originScreen);

  const partingLineFront = `M ${partFL.x} ${partFL.y} L ${partFR.x} ${partFR.y}`;
  const partingLineRight = `M ${partFR.x} ${partFR.y} L ${partBR.x} ${partBR.y}`;

  // Cylinder barrel mount flanges (left and right sides)
  const leftBarrelMount = getIsoBoxFacets(
    { x: -halfL * 0.6, y: halfW, z: splitZ - 10 },
    blockLength * 0.6, 25, caseHeight * 0.35,
    originScreen
  );
  const rightBarrelMount = getIsoBoxFacets(
    { x: -halfL * 0.6, y: -halfW - 25, z: splitZ - 10 },
    blockLength * 0.6, 25, caseHeight * 0.35,
    originScreen
  );

  return {
    upperCase,
    lowerCase,
    partingLineFront,
    partingLineRight,
    partingLinePoints: { partFL, partFR, partBL, partBR },
    leftBarrelMount,
    rightBarrelMount,
  };
}

/**
 * Generates isometric positions for a VR-engine's staggered bore pattern.
 * VR engines have a single head covering two rows of staggered cylinders
 * at a narrow included angle (10°–15°).
 *
 * @param numCylinders Total cylinder count (6 for VR6)
 * @param boreSpacingX  Spacing between bores along crank axis
 * @param staggerY      Y-offset between front and rear row
 * @param boreRadius    Bore radius
 * @param deckZ         Z-height of the deck surface
 * @param originScreen  SVG canvas origin
 */
export function getIsoVRStaggeredBores(
  numCylinders: number,
  boreSpacingX: number,
  staggerY: number,
  boreRadius: number,
  deckZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const bores: Array<{
    center3D: IsoPoint3D;
    ellipse: { cx: number; cy: number; rx: number; ry: number };
    row: "front" | "rear";
    index: number;
  }> = [];

  const totalLength = (numCylinders - 1) * boreSpacingX * 0.5;
  const halfLen = totalLength / 2;

  for (let i = 0; i < numCylinders; i++) {
    const row: "front" | "rear" = i % 2 === 0 ? "front" : "rear";
    const pairIndex = Math.floor(i / 2);
    const xPos = -halfLen + pairIndex * boreSpacingX + (row === "rear" ? boreSpacingX * 0.5 : 0);
    const yOffset = row === "front" ? staggerY / 2 : -staggerY / 2;

    const center3D: IsoPoint3D = { x: xPos, y: yOffset, z: deckZ };
    const ellipse = projectIsoEllipse(center3D, boreRadius, originScreen);

    bores.push({ center3D, ellipse, row, index: i });
  }

  return bores;
}

/**
 * Generates bank deck corner geometry for any arbitrary V-angle.
 * Generalizes getV12BankDeckCorners to work with V6 (60°), V8 (90°),
 * V10 (90°/72°), W12 (72°), etc.
 *
 * @param blockLength   Block length along X
 * @param bankSide      'left' or 'right'
 * @param vAngleDeg     Total included V-angle
 * @param outerYNorm    Outer Y distance from centerline (normalized, scales with angle)
 * @param innerYNorm    Inner Y distance (valley side)
 * @param outerZ        Z-height of outer deck edge
 * @param innerZ        Z-height of inner deck edge (valley side, usually lower)
 * @param originScreen  SVG canvas origin
 */
export function getVBankDeckCorners(
  blockLength: number,
  bankSide: "left" | "right",
  vAngleDeg: number,
  outerYNorm: number,
  innerYNorm: number,
  outerZ: number,
  innerZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const halfLen = blockLength / 2;
  const ySign = bankSide === "left" ? 1 : -1;

  // Scale Y extents by V-angle (wider angles = more Y spread)
  const angleFactor = Math.sin(((vAngleDeg / 2) * Math.PI) / 180);
  const outerY = outerYNorm * angleFactor;
  const innerY = innerYNorm * angleFactor;

  const outerFL = projectIso({ x: -halfLen, y: outerY * ySign, z: outerZ }, originScreen);
  const outerFR = projectIso({ x: halfLen, y: outerY * ySign, z: outerZ }, originScreen);
  const innerBL = projectIso({ x: -halfLen, y: innerY * ySign, z: innerZ }, originScreen);
  const innerBR = projectIso({ x: halfLen, y: innerY * ySign, z: innerZ }, originScreen);

  return { outerFL, outerFR, innerBL, innerBR, angleFactor };
}

/**
 * Generates array of bolt boss positions in 3D for any deck surface.
 * Creates evenly-spaced bolt boss locations along a line in 3D space.
 *
 * @param startPt   3D start point of the bolt row
 * @param endPt     3D end point of the bolt row
 * @param count     Number of bolts
 * @param bossRadius Radius of each bolt boss circle
 * @param originScreen SVG canvas origin
 */
export function getIsoBoltBossRow(
  startPt: IsoPoint3D,
  endPt: IsoPoint3D,
  count: number,
  bossRadius: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const bolts: Array<{
    center2D: ScreenPoint2D;
    ellipse: { cx: number; cy: number; rx: number; ry: number };
  }> = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const pt3D = lerpIsoPoint3D(startPt, endPt, t);
    const center2D = projectIso(pt3D, originScreen);
    const ellipse = projectIsoEllipse(pt3D, bossRadius, originScreen);
    bolts.push({ center2D, ellipse });
  }

  return bolts;
}

/**
 * Generates a 3D isometric tapered cylinder (frustum) path.
 * Used for cylinder barrel fins, cooling stacks, and transition cones.
 *
 * @param topCenter3D    Top circle center
 * @param bottomCenter3D Bottom circle center
 * @param topRadius      Top circle radius
 * @param bottomRadius   Bottom circle radius
 * @param originScreen   SVG canvas origin
 */
export function getIsoFrustum(
  topCenter3D: IsoPoint3D,
  bottomCenter3D: IsoPoint3D,
  topRadius: number,
  bottomRadius: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const topE = projectIsoEllipse(topCenter3D, topRadius, originScreen);
  const botE = projectIsoEllipse(bottomCenter3D, bottomRadius, originScreen);

  const wallPath = `
    M ${topE.cx - topE.rx} ${topE.cy}
    L ${botE.cx - botE.rx} ${botE.cy}
    A ${botE.rx} ${botE.ry} 0 0 0 ${botE.cx + botE.rx} ${botE.cy}
    L ${topE.cx + topE.rx} ${topE.cy}
    A ${topE.rx} ${topE.ry} 0 0 1 ${topE.cx - topE.rx} ${topE.cy}
    Z
  `.trim();

  return {
    wallPath,
    topEllipse: topE,
    bottomEllipse: botE,
  };
}

/**
 * Generates 3D bearing web / bulkhead positions along the crankshaft axis.
 * Returns evenly-spaced screen-projected rectangles representing main bearing bulkheads.
 *
 * @param blockLength    Block length along X
 * @param numWebs        Number of main bearing webs (numCylinders + 1 for inline, varies for V)
 * @param webWidth       Width of each web in mm
 * @param webDepthY      Depth of web in Y-axis
 * @param webHeightZ     Height of web in Z-axis
 * @param baseZ          Z-position of web bottom
 * @param originScreen   SVG canvas origin
 */
export function getIsoBearingWebs(
  blockLength: number,
  numWebs: number,
  webWidth: number,
  webDepthY: number,
  webHeightZ: number,
  baseZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const halfL = blockLength / 2;
  const webs: Array<{
    facets: ReturnType<typeof getIsoBoxFacets>;
    index: number;
    xCenter: number;
  }> = [];

  for (let i = 0; i < numWebs; i++) {
    const t = numWebs === 1 ? 0.5 : i / (numWebs - 1);
    const xCenter = -halfL + t * blockLength;

    const facets = getIsoBoxFacets(
      { x: xCenter - webWidth / 2, y: -webDepthY / 2, z: baseZ },
      webWidth, webDepthY, webHeightZ,
      originScreen
    );

    webs.push({ facets, index: i, xCenter });
  }

  return webs;
}

/**
 * Computes 3D positions for an array of cooling fins stacked vertically.
 * Used for air-cooled radial engine cylinder barrels.
 *
 * @param center3D       Center of the finned cylinder
 * @param numFins        Number of cooling fins
 * @param finSpacing     Vertical spacing between fins
 * @param innerRadius    Inner radius (cylinder wall)
 * @param outerRadius    Outer radius (fin tip)
 * @param startZ         Z-position of bottom fin
 * @param originScreen   SVG canvas origin
 */
export function getIsoCoolingFins(
  center3D: IsoPoint3D,
  numFins: number,
  finSpacing: number,
  innerRadius: number,
  outerRadius: number,
  startZ: number,
  originScreen: ScreenPoint2D = { x: 250, y: 220 }
) {
  const fins: Array<{
    innerEllipse: { cx: number; cy: number; rx: number; ry: number };
    outerEllipse: { cx: number; cy: number; rx: number; ry: number };
    z: number;
  }> = [];

  for (let i = 0; i < numFins; i++) {
    const z = startZ + i * finSpacing;
    const finCenter: IsoPoint3D = { x: center3D.x, y: center3D.y, z };
    const innerEllipse = projectIsoEllipse(finCenter, innerRadius, originScreen);
    const outerEllipse = projectIsoEllipse(finCenter, outerRadius, originScreen);
    fins.push({ innerEllipse, outerEllipse, z });
  }

  return fins;
}
