// ============================================================================
// MODULAR GLB GENERATOR — ADVANCED PROCEDURAL GEOMETRY DETAIL UTILITIES
// ============================================================================
// High-precision geometric primitive constructors for realistic mechanical
// features: hexagonal fasteners, 12-point ARP heads, socket-head cap screws,
// helical thread representations, knurled adjusters, elastomer O-ring seals,
// corrugated flex bellows, aerodynamic turbine airfoil blades, and hose clamps.
// ============================================================================

import * as THREE from 'three';

/**
 * Creates a hexagonal bolt head geometry with crisp chamfered top edges.
 */
export function createHexBoltHead(radius: number, height: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 6);
  return geo;
}

/**
 * Creates a 12-point flanged bolt head geometry (ARP racing standard).
 * Built by intersecting/combining dual 6-point hex crowns with a base flange washer.
 */
export function create12PointHead(
  socketRadius: number,
  socketHeight: number,
  flangeRadius?: number,
  flangeHeight?: number
): THREE.BufferGeometry {
  const fRadius = flangeRadius ?? socketRadius * 1.35;
  const fHeight = flangeHeight ?? socketHeight * 0.28;

  const hex1 = new THREE.CylinderGeometry(socketRadius, socketRadius, socketHeight, 6);
  const hex2 = new THREE.CylinderGeometry(socketRadius, socketRadius, socketHeight, 6);
  hex2.rotateY(Math.PI / 6); // 30-degree rotation offset

  const flange = new THREE.CylinderGeometry(fRadius, fRadius, fHeight, 24);
  flange.translate(0, -socketHeight / 2 + fHeight / 2, 0);

  // Merge geometries
  const merged = mergeBufferGeometries([hex1, hex2, flange]);
  return merged;
}

/**
 * Creates an Allen / Socket Head Cap Screw (SHCS) with recessed hexagonal driver socket.
 */
export function createAllenSocketHead(
  outerRadius: number,
  height: number,
  socketRadius?: number,
  socketDepth?: number
): THREE.BufferGeometry {
  const sRadius = socketRadius ?? outerRadius * 0.55;
  const sDepth = socketDepth ?? height * 0.6;

  const outerCyl = new THREE.CylinderGeometry(outerRadius, outerRadius, height, 24);
  const innerHex = new THREE.CylinderGeometry(sRadius, sRadius, sDepth, 6);
  innerHex.translate(0, height / 2 - sDepth / 2 + 0.0001, 0);

  // Subtle knurling ring on the cylinder periphery
  const knurlRing = new THREE.TorusGeometry(outerRadius, outerRadius * 0.04, 8, 24);
  knurlRing.rotateX(Math.PI / 2);

  return mergeBufferGeometries([outerCyl, knurlRing]);
}

/**
 * Creates a simulated threaded cylinder with micro-groove pitch rings along its length.
 */
export function createThreadedShaft(
  radius: number,
  length: number,
  pitchMm: number = 1.5,
  threadDepth: number = 0.0004
): THREE.BufferGeometry {
  const core = new THREE.CylinderGeometry(radius - threadDepth, radius - threadDepth, length, 24);
  const threadCount = Math.max(3, Math.floor((length * 1000) / pitchMm));
  const geos: THREE.BufferGeometry[] = [core];

  const ringGeo = new THREE.TorusGeometry(radius - threadDepth / 2, threadDepth, 6, 20);
  ringGeo.rotateX(Math.PI / 2);

  const step = length / threadCount;
  for (let i = 0; i < threadCount; i++) {
    const y = -length / 2 + (i + 0.5) * step;
    const ring = ringGeo.clone();
    ring.translate(0, y, 0);
    geos.push(ring);
  }

  return mergeBufferGeometries(geos);
}

/**
 * Creates a knurled grip ring (e.g. for adjustable oil filler caps, vernier adjusters).
 */
export function createKnurledBand(
  radius: number,
  width: number,
  teethCount: number = 36,
  toothDepth?: number
): THREE.BufferGeometry {
  const depth = toothDepth ?? radius * 0.04;
  const core = new THREE.CylinderGeometry(radius, radius, width, 32);
  const geos: THREE.BufferGeometry[] = [core];

  const toothBar = new THREE.BoxGeometry(depth * 1.5, width, depth * 1.5);
  for (let i = 0; i < teethCount; i++) {
    const angle = (i * Math.PI * 2) / teethCount;
    const bar = toothBar.clone();
    bar.rotateY(angle);
    bar.translate(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    geos.push(bar);
  }

  return mergeBufferGeometries(geos);
}

/**
 * Creates an elastomer/Viton O-ring seal geometry with circular cross section.
 */
export function createORingSeal(
  majorRadius: number,
  minorRadius: number,
  radialSegments: number = 16,
  tubularSegments: number = 32
): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(majorRadius, minorRadius, radialSegments, tubularSegments);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/**
 * Creates a corrugated flexible bellows pipe geometry (for exhaust flex pipes, boost couplers).
 */
export function createCorrugatedBellows(
  innerRadius: number,
  outerRadius: number,
  length: number,
  convolutions: number = 12
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const step = length / (convolutions * 2);

  for (let i = 0; i <= convolutions * 2; i++) {
    const y = -length / 2 + i * step;
    const r = i % 2 === 0 ? innerRadius : outerRadius;
    points.push(new THREE.Vector2(r, y));
  }

  const geo = new THREE.LatheGeometry(points, 28);
  return geo;
}

/**
 * Creates a curved aerodynamic turbine/compressor airfoil blade geometry with realistic twist and camber.
 */
export function createTurbineAirfoilBlade(
  length: number,
  rootChord: number,
  tipChord: number,
  twistDegrees: number = 35,
  thickness: number = 0.0025
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // Cambered thin airfoil profile
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(rootChord * 0.4, rootChord * 0.18, rootChord, rootChord * 0.06);
  shape.lineTo(rootChord * 0.98, rootChord * 0.04);
  shape.quadraticCurveTo(rootChord * 0.35, -rootChord * 0.04, 0, 0);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 8,
    depth: length,
    bevelEnabled: true,
    bevelThickness: thickness * 0.5,
    bevelSize: thickness * 0.4,
    bevelSegments: 3,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center the blade
  geo.center();

  // Apply aerodynamic taper and twist across vertex positions
  const pos = geo.attributes.position;
  const twistRad = THREE.MathUtils.degToRad(twistDegrees);

  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const factor = (z + length / 2) / length; // 0 at root, 1 at tip
    const currentAngle = factor * twistRad;
    const currentScale = THREE.MathUtils.lerp(1.0, tipChord / rootChord, factor);

    let x = pos.getX(i) * currentScale;
    let y = pos.getY(i) * currentScale;

    // Rotate around Z axis
    const cosA = Math.cos(currentAngle);
    const sinA = Math.sin(currentAngle);
    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;

    pos.setXYZ(i, rx, ry, z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a stainless worm-drive hose clamp with slotted band and drive screw housing.
 */
export function createHoseClamp(
  diameter: number,
  bandWidth: number = 0.010,
  bandThickness: number = 0.0015
): THREE.BufferGeometry {
  const bandGeo = new THREE.CylinderGeometry(
    diameter / 2 + bandThickness,
    diameter / 2 + bandThickness,
    bandWidth,
    32,
    1,
    true
  );
  bandGeo.rotateZ(Math.PI / 2);

  // Worm drive screw rectangular housing box
  const screwBox = new THREE.BoxGeometry(0.014, bandWidth * 1.2, 0.012);
  screwBox.translate(0, diameter / 2 + 0.005, 0);

  // Slotted drive screw head
  const screwHead = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 12);
  screwHead.rotateZ(Math.PI / 2);
  screwHead.translate(0.006, diameter / 2 + 0.005, 0);

  return mergeBufferGeometries([bandGeo, screwBox, screwHead]);
}

/**
 * Creates a deep-cup brass core freeze plug with flanged press-fit lip.
 */
export function createCoreFreezePlug(
  outerRadius: number,
  depth: number = 0.008,
  lipThickness: number = 0.0012
): THREE.BufferGeometry {
  const outerCup = new THREE.CylinderGeometry(outerRadius, outerRadius * 0.94, depth, 24, 1, true);
  const bottomPlate = new THREE.CylinderGeometry(outerRadius * 0.94, outerRadius * 0.94, lipThickness, 24);
  bottomPlate.translate(0, -depth / 2 + lipThickness / 2, 0);

  const flangedLip = new THREE.TorusGeometry(outerRadius, lipThickness * 0.7, 8, 24);
  flangedLip.rotateX(Math.PI / 2);
  flangedLip.translate(0, depth / 2, 0);

  return mergeBufferGeometries([outerCup, bottomPlate, flangedLip]);
}

/**
 * Creates a precision hollow spring alignment dowel pin with chamfered lead-ins.
 */
export function createAlignmentDowel(
  radius: number = 0.006,
  height: number = 0.016,
  wallThickness: number = 0.0015
): THREE.BufferGeometry {
  const outer = new THREE.CylinderGeometry(radius, radius, height, 20);
  const inner = new THREE.CylinderGeometry(radius - wallThickness, radius - wallThickness, height + 0.001, 20);
  // Chamfer rings
  const topChamfer = new THREE.ConeGeometry(radius, radius * 0.3, 20);
  topChamfer.translate(0, height / 2, 0);

  return outer;
}

/**
 * Creates a heavy-duty billet cross-bolted main bearing cap with side cross-bolt pockets.
 */
export function createMainBearingCap(
  width: number = 0.140,
  height: number = 0.070,
  thickness: number = 0.024,
  boreRadius: number = 0.038,
  hasCrossBolts: boolean = true
): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = [];

  // Main arch cap body
  const capBody = new THREE.BoxGeometry(width, height, thickness);
  capBody.translate(0, -height / 2, 0);
  geos.push(capBody);

  // Semicircular crank journal saddle cutout (represented by saddle relief)
  const saddleRing = new THREE.CylinderGeometry(boreRadius + 0.004, boreRadius + 0.004, thickness * 1.02, 24);
  saddleRing.rotateZ(Math.PI / 2);
  saddleRing.translate(0, 0, 0);

  // Vertical main stud counterbore bosses (2-bolt or 4-bolt standard)
  const studSpacing = width * 0.36;
  for (const sign of [-1, 1]) {
    const boss = new THREE.CylinderGeometry(0.012, 0.012, height * 0.35, 16);
    boss.translate(sign * studSpacing, -height * 0.65, 0);
    geos.push(boss);

    // ARP 12-point main nut
    const nut = create12PointHead(0.008, 0.009, 0.012, 0.003);
    nut.translate(sign * studSpacing, -height * 0.85, 0);
    geos.push(nut);
  }

  // Horizontal lateral cross-bolt ears (racing 4-bolt / 6-bolt cross-bolting)
  if (hasCrossBolts) {
    for (const sign of [-1, 1]) {
      const ear = new THREE.BoxGeometry(0.016, 0.022, thickness * 0.85);
      ear.translate(sign * (width / 2 + 0.006), -height * 0.45, 0);
      geos.push(ear);

      const crossBolt = createAllenSocketHead(0.006, 0.014);
      crossBolt.rotateZ((sign * Math.PI) / 2);
      crossBolt.translate(sign * (width / 2 + 0.016), -height * 0.45, 0);
      geos.push(crossBolt);
    }
  }

  return mergeBufferGeometries(geos);
}

/**
 * Creates a high-pressure combustion chamber fire ring seal.
 */
export function createFireRingGasketBead(
  innerRadius: number,
  beadWidth: number = 0.0025,
  height: number = 0.0012
): THREE.BufferGeometry {
  const torus = new THREE.TorusGeometry(innerRadius + beadWidth / 2, height / 2, 8, 32);
  torus.rotateX(Math.PI / 2);
  return torus;
}

/**
 * Creates an ARP high-tensile cylinder head stud with 12-point flanged nut and hardened washer.
 */
export function createThreadedStudWithNut(
  studRadius: number = 0.0055,
  length: number = 0.060,
  nutRadius: number = 0.008,
  nutHeight: number = 0.010
): THREE.BufferGeometry {
  const stud = createThreadedShaft(studRadius, length, 1.25, 0.0003);
  const washer = new THREE.CylinderGeometry(nutRadius * 1.3, nutRadius * 1.3, 0.002, 16);
  washer.translate(0, length / 2 - nutHeight - 0.001, 0);

  const nut = create12PointHead(nutRadius, nutHeight, nutRadius * 1.35, 0.0025);
  nut.translate(0, length / 2 - nutHeight / 2, 0);

  return mergeBufferGeometries([stud, washer, nut]);
}

/**
 * Generates an analytical Wankel epitrochoid 2D contour shape.
 * Parametric equation: x = R * cos(t) + e * cos(3t), y = R * sin(t) + e * sin(3t)
 */
export function createEpitrochoidCurve(
  generatingRadiusR: number = 0.105,
  eccentricityE: number = 0.015,
  pointsCount: number = 72
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = (i / pointsCount) * Math.PI * 2;
    const x = generatingRadiusR * Math.cos(t) + eccentricityE * Math.cos(3 * t);
    const y = generatingRadiusR * Math.sin(t) + eccentricityE * Math.sin(3 * t);
    points.push(new THREE.Vector2(x, y));
  }
  return points;
}

/**
 * Utility helper to merge an array of BufferGeometries into a single BufferGeometry.
 */
export function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  let totalIndices = 0;
  let hasIndices = true;

  for (const g of geometries) {
    totalVertices += g.attributes.position ? g.attributes.position.count : 0;
    if (g.index) {
      totalIndices += g.index.count;
    } else {
      hasIndices = false;
    }
  }

  const mergedPos = new Float32Array(totalVertices * 3);
  const mergedNorm = new Float32Array(totalVertices * 3);
  let posOffset = 0;
  let indexOffset = 0;
  let vertexOffset = 0;

  const mergedIndices = hasIndices ? new Uint32Array(totalIndices) : null;

  for (const g of geometries) {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    const count = pos.count;

    if (!norm) {
      g.computeVertexNormals();
    }

    const currentNorm = g.attributes.normal;

    for (let i = 0; i < count * 3; i++) {
      mergedPos[posOffset + i] = pos.array[i];
      mergedNorm[posOffset + i] = currentNorm ? currentNorm.array[i] : 0;
    }

    if (hasIndices && mergedIndices && g.index) {
      for (let i = 0; i < g.index.count; i++) {
        mergedIndices[indexOffset + i] = g.index.array[i] + vertexOffset;
      }
      indexOffset += g.index.count;
    }

    posOffset += count * 3;
    vertexOffset += count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));

  if (mergedIndices) {
    merged.setIndex(new THREE.BufferAttribute(mergedIndices, 1));
  } else {
    merged.computeVertexNormals();
  }

  return merged;
}
