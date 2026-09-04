// ============================================================================
// AUTOMOTIVE BODY SURFACE LOFTING SYSTEM
// ============================================================================
// Generates smooth automotive body geometry by interpolating between
// 2D cross-section profiles along the vehicle length axis (Z).
//
// Key concepts:
// - Cross-sections are defined at stations along the Z (length) axis
//   Negative Z = front, Positive Z = rear (matching project convention)
// - Each cross-section is a 2D profile (X = lateral half-width, Y = height)
// - Catmull-Rom interpolation between stations for smooth transitions
// - Generates BufferGeometry with proper normals and UVs
// - Supports separate upper/lower body halves for panel separation
//
// Coordinate standard: +X right, +Y up, +Z rearward, 1 unit = 1 meter
// ============================================================================

import * as THREE from 'three';

// ── Types ──

/** A single 2D point in the cross-section profile (Y = height, Z = lateral half-width) */
export interface ProfilePoint {
  y: number;
  z: number;
}

/** A cross-section station along the vehicle length (X axis) */
export interface CrossSection {
  /** X position along vehicle length (+X = front, -X = rear) */
  x: number;
  /** Profile points defining the cross-section shape (ordered from bottom-left, around top, to bottom-right) */
  profile: ProfilePoint[];
}

/** Real-world vehicle dimension envelope */
export interface VehicleProportionProfile {
  wheelbase: number;          // meters (typically 2.4 – 3.2)
  trackWidthFront: number;    // meters (typically 1.5 – 1.8)
  trackWidthRear: number;     // meters (typically 1.5 – 1.9)
  overallLength: number;      // meters (typically 3.8 – 5.2)
  overallWidth: number;       // meters (typically 1.7 – 2.1)
  overallHeight: number;      // meters (typically 1.0 – 1.5)
  groundClearance: number;    // meters (typically 0.08 – 0.15)
  frontOverhang: number;      // meters (typically 0.7 – 1.1)
  rearOverhang: number;       // meters (typically 0.6 – 1.0)
  windshieldAngleRad: number; // radians from vertical (typically 0.5 – 0.7)
  hoodHeight: number;         // meters (center of hood, typically 0.7 – 0.95)
  roofHeight: number;         // meters (peak, typically 1.1 – 1.4)
  wheelDiameter: number;      // meters (including tire, typically 0.62 – 0.74)
  frontWheelCenterX: number;  // X coordinate of front axle (+X = front)
  rearWheelCenterX: number;   // X coordinate of rear axle (-X = rear)
  wheelCenterY: number;       // meters (wheel center height = wheelDiameter/2)
  cabinStartX: number;        // X where windshield base starts
  cabinEndX: number;          // X where rear window ends
}

// ── Proportion Profiles for Vehicle Archetypes ──

export const HYPERCAR_PROPORTIONS: VehicleProportionProfile = {
  wheelbase: 2.70,
  trackWidthFront: 1.68,
  trackWidthRear: 1.72,
  overallLength: 4.60,
  overallWidth: 2.04,
  overallHeight: 1.16,
  groundClearance: 0.10,
  frontOverhang: 0.90,
  rearOverhang: 1.00,
  windshieldAngleRad: 0.58,
  hoodHeight: 0.72,
  roofHeight: 1.16,
  wheelDiameter: 0.68,
  frontWheelCenterX: 0.90,
  rearWheelCenterX: -1.80,
  wheelCenterY: 0.34,
  cabinStartX: 0.20,
  cabinEndX: -0.80,
};

export const GT_COUPE_PROPORTIONS: VehicleProportionProfile = {
  wheelbase: 2.80,
  trackWidthFront: 1.62,
  trackWidthRear: 1.66,
  overallLength: 4.75,
  overallWidth: 1.95,
  overallHeight: 1.30,
  groundClearance: 0.12,
  frontOverhang: 0.95,
  rearOverhang: 1.00,
  windshieldAngleRad: 0.52,
  hoodHeight: 0.82,
  roofHeight: 1.30,
  wheelDiameter: 0.66,
  frontWheelCenterX: 0.95,
  rearWheelCenterX: -1.85,
  wheelCenterY: 0.33,
  cabinStartX: 0.30,
  cabinEndX: -1.20,
};

export const PROTOTYPE_RACE_PROPORTIONS: VehicleProportionProfile = {
  wheelbase: 3.05,
  trackWidthFront: 1.70,
  trackWidthRear: 1.70,
  overallLength: 5.00,
  overallWidth: 2.00,
  overallHeight: 1.05,
  groundClearance: 0.07,
  frontOverhang: 0.95,
  rearOverhang: 1.00,
  windshieldAngleRad: 0.65,
  hoodHeight: 0.62,
  roofHeight: 1.05,
  wheelDiameter: 0.71,
  frontWheelCenterX: 0.95,
  rearWheelCenterX: -2.10,
  wheelCenterY: 0.355,
  cabinStartX: 0.15,
  cabinEndX: -0.70,
};

export const SEDAN_PROPORTIONS: VehicleProportionProfile = {
  wheelbase: 2.85,
  trackWidthFront: 1.58,
  trackWidthRear: 1.60,
  overallLength: 4.90,
  overallWidth: 1.88,
  overallHeight: 1.44,
  groundClearance: 0.14,
  frontOverhang: 0.95,
  rearOverhang: 1.10,
  windshieldAngleRad: 0.50,
  hoodHeight: 0.88,
  roofHeight: 1.44,
  wheelDiameter: 0.64,
  frontWheelCenterX: 0.95,
  rearWheelCenterX: -1.90,
  wheelCenterY: 0.32,
  cabinStartX: 0.25,
  cabinEndX: -1.40,
};

// ── Cross-Section Generator ──

/**
 * Generates a set of cross-sections that define a smooth automotive body shape.
 * Cross-sections progress from front nose to rear, each defining the body outline
 * at that longitudinal station.
 */
export function generateHypercarCrossSections(props: VehicleProportionProfile): CrossSection[] {
  const p = props;
  const halfW = p.overallWidth / 2;
  const fenderBulge = 0.06; // extra width at fender peaks

  const sections: CrossSection[] = [];

  // Station 0: Front nose tip (narrow, low, pointed)
  const noseTipX = p.frontWheelCenterX + p.frontOverhang;
  sections.push({
    x: noseTipX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.45,
      height: p.groundClearance + 0.28,
      groundY: p.groundClearance,
      shoulderY: p.groundClearance + 0.22,
      beltlineY: p.groundClearance + 0.28,
      roofY: p.groundClearance + 0.28,
      fenderBulge: 0,
      undercut: 0.02,
    }),
  });

  // Station 1: Front bumper center (wider, splitter height)
  sections.push({
    x: noseTipX - 0.15,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.72,
      height: p.groundClearance + 0.42,
      groundY: p.groundClearance,
      shoulderY: p.groundClearance + 0.32,
      beltlineY: p.groundClearance + 0.40,
      roofY: p.groundClearance + 0.42,
      fenderBulge: 0.02,
      undercut: 0.04,
    }),
  });

  // Station 2: Front of hood (at headlight line)
  sections.push({
    x: p.frontWheelCenterX + 0.40,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.92,
      height: p.hoodHeight,
      groundY: p.groundClearance,
      shoulderY: p.hoodHeight * 0.65,
      beltlineY: p.hoodHeight * 0.85,
      roofY: p.hoodHeight,
      fenderBulge: fenderBulge * 0.5,
      undercut: 0.05,
    }),
  });

  // Station 3: Front wheel center (fender peak)
  sections.push({
    x: p.frontWheelCenterX,
    profile: generateBodyProfile({
      halfWidth: halfW,
      height: p.hoodHeight + 0.04,
      groundY: p.groundClearance,
      shoulderY: p.hoodHeight * 0.7,
      beltlineY: p.hoodHeight * 0.9,
      roofY: p.hoodHeight + 0.04,
      fenderBulge: fenderBulge,
      undercut: 0.06,
      wheelArchRadius: p.wheelDiameter / 2 + 0.04,
      wheelArchCenterY: p.wheelCenterY,
    }),
  });

  // Station 4: A-pillar base (windshield starts)
  sections.push({
    x: p.cabinStartX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.95,
      height: p.roofHeight * 0.72,
      groundY: p.groundClearance,
      shoulderY: p.roofHeight * 0.48,
      beltlineY: p.roofHeight * 0.62,
      roofY: p.roofHeight * 0.72,
      fenderBulge: fenderBulge * 0.3,
      undercut: 0.06,
      cabinWidth: p.overallWidth * 0.58,
      cabinY: p.roofHeight * 0.72,
    }),
  });

  // Station 5: Roof peak / B-pillar
  const roofPeakX = (p.cabinStartX + p.cabinEndX) / 2;
  sections.push({
    x: roofPeakX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.92,
      height: p.roofHeight,
      groundY: p.groundClearance,
      shoulderY: p.roofHeight * 0.52,
      beltlineY: p.roofHeight * 0.68,
      roofY: p.roofHeight,
      fenderBulge: fenderBulge * 0.2,
      undercut: 0.07,
      cabinWidth: p.overallWidth * 0.56,
      cabinY: p.roofHeight,
    }),
  });

  // Station 6: C-pillar / rear glass
  sections.push({
    x: p.cabinEndX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.96,
      height: p.roofHeight * 0.88,
      groundY: p.groundClearance,
      shoulderY: p.roofHeight * 0.55,
      beltlineY: p.roofHeight * 0.72,
      roofY: p.roofHeight * 0.88,
      fenderBulge: fenderBulge * 0.5,
      undercut: 0.06,
      cabinWidth: p.overallWidth * 0.52,
      cabinY: p.roofHeight * 0.88,
    }),
  });

  // Station 7: Rear wheel center (rear haunch peak — widest point)
  sections.push({
    x: p.rearWheelCenterX,
    profile: generateBodyProfile({
      halfWidth: halfW + 0.02, // slightly wider than front
      height: p.roofHeight * 0.78,
      groundY: p.groundClearance,
      shoulderY: p.roofHeight * 0.50,
      beltlineY: p.roofHeight * 0.65,
      roofY: p.roofHeight * 0.78,
      fenderBulge: fenderBulge * 1.3, // muscular rear haunches
      undercut: 0.06,
      wheelArchRadius: p.wheelDiameter / 2 + 0.04,
      wheelArchCenterY: p.wheelCenterY,
    }),
  });

  // Station 8: Rear deck / taillight line
  const rearDeckX = p.rearWheelCenterX - 0.40;
  sections.push({
    x: rearDeckX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.90,
      height: p.roofHeight * 0.62,
      groundY: p.groundClearance,
      shoulderY: p.roofHeight * 0.42,
      beltlineY: p.roofHeight * 0.55,
      roofY: p.roofHeight * 0.62,
      fenderBulge: fenderBulge * 0.6,
      undercut: 0.05,
    }),
  });

  // Station 9: Rear bumper / diffuser area
  const rearEndX = p.rearWheelCenterX - p.rearOverhang;
  sections.push({
    x: rearEndX + 0.15,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.78,
      height: p.groundClearance + 0.45,
      groundY: p.groundClearance,
      shoulderY: p.groundClearance + 0.32,
      beltlineY: p.groundClearance + 0.40,
      roofY: p.groundClearance + 0.45,
      fenderBulge: 0.01,
      undercut: 0.04,
    }),
  });

  // Station 10: Rear tail tip
  sections.push({
    x: rearEndX,
    profile: generateBodyProfile({
      halfWidth: halfW * 0.55,
      height: p.groundClearance + 0.32,
      groundY: p.groundClearance,
      shoulderY: p.groundClearance + 0.24,
      beltlineY: p.groundClearance + 0.30,
      roofY: p.groundClearance + 0.32,
      fenderBulge: 0,
      undercut: 0.02,
    }),
  });

  return sections;
}

// ── Profile Point Generator ──

interface ProfileParams {
  halfWidth: number;
  height: number;
  groundY: number;
  shoulderY: number;
  beltlineY: number;
  roofY: number;
  fenderBulge: number;
  undercut: number;
  wheelArchRadius?: number;
  wheelArchCenterY?: number;
  cabinWidth?: number;
  cabinY?: number;
}

/**
 * Generates a 2D cross-section profile with automotive surface characteristics:
 * - Concave lower body (undercut/coke-bottle)
 * - Convex shoulder (body highlight)
 * - Concave upper transition
 * - Convex roof dome
 * Profile is symmetric — returns full left-to-right profile.
 */
function generateBodyProfile(params: ProfileParams): ProfilePoint[] {
  const { halfWidth, height, groundY, shoulderY, beltlineY, roofY,
          fenderBulge, undercut, wheelArchRadius, wheelArchCenterY,
          cabinWidth, cabinY } = params;
  const PROFILE_RESOLUTION = 32; // points per side for high-density automotive curvature

  const points: ProfilePoint[] = [];

  // Generate right side profile from bottom to top
  const rightSide: ProfilePoint[] = [];

  for (let i = 0; i <= PROFILE_RESOLUTION; i++) {
    const t = i / PROFILE_RESOLUTION; // 0 = bottom, 1 = top
    const y = groundY + t * (roofY - groundY);

    let z: number;

    if (t < 0.15) {
      // Lower body — slight taper inward (aerodynamic underfloor)
      const localT = t / 0.15;
      z = halfWidth * (0.70 + 0.25 * smoothstep(localT));
    } else if (t < 0.35) {
      // Rocker panel — narrow with undercut (coke-bottle effect)
      const localT = (t - 0.15) / 0.20;
      const undercutAmount = undercut * Math.sin(localT * Math.PI);
      z = halfWidth * 0.95 - undercutAmount;
    } else if (t < 0.55) {
      // Shoulder / body highlight (widest point with fender bulge)
      const localT = (t - 0.35) / 0.20;
      const bulge = fenderBulge * Math.sin(localT * Math.PI);
      z = halfWidth + bulge;
    } else if (t < 0.75) {
      // Upper body — gentle inward taper
      const localT = (t - 0.55) / 0.20;
      z = halfWidth * (1.0 - 0.08 * smoothstep(localT));
      if (cabinWidth) {
        // Transition to cabin width
        z = THREE.MathUtils.lerp(z, cabinWidth / 2, smoothstep(localT) * 0.4);
      }
    } else {
      // Roof / greenhouse — taper to roof width
      const localT = (t - 0.75) / 0.25;
      const baseZ = cabinWidth ? cabinWidth / 2 : halfWidth * 0.85;
      z = THREE.MathUtils.lerp(halfWidth * 0.92, baseZ, smoothstep(localT));
    }

    // Apply wheel arch cutout
    if (wheelArchRadius && wheelArchCenterY) {
      const dy = y - wheelArchCenterY;
      if (Math.abs(dy) < wheelArchRadius) {
        const archZ = Math.sqrt(wheelArchRadius * wheelArchRadius - dy * dy);
        const archInner = halfWidth - archZ * 0.15; // subtle arch recess
        // Only apply near the arch — blend smoothly
        const archInfluence = 1.0 - Math.abs(dy) / wheelArchRadius;
        z = THREE.MathUtils.lerp(z, Math.max(z, z + 0.01), archInfluence * 0.3);
      }
    }

    rightSide.push({ y, z });
  }

  // Build full profile: left side (mirrored), then right side
  // Left side goes bottom to top (negative Z)
  for (let i = 0; i <= PROFILE_RESOLUTION; i++) {
    points.push({
      y: rightSide[i].y,
      z: -rightSide[i].z,
    });
  }

  // Top edge connecting left to right (roof cap)
  // Already connected via the top point

  // Right side goes top to bottom (positive Z)
  for (let i = PROFILE_RESOLUTION; i >= 0; i--) {
    points.push({
      y: rightSide[i].y,
      z: rightSide[i].z,
    });
  }

  return points;
}

// ── Lofting Engine ──

/**
 * Generates a smooth body surface mesh by lofting between cross-sections.
 * Uses Catmull-Rom interpolation between stations for smooth curvature.
 *
 * @param sections - Array of cross-sections ordered from front to rear
 * @param longitudinalSubdivisions - Number of interpolated stations between each pair of sections
 * @param name - Mesh name for the scene graph
 * @param material - Material to apply
 * @returns THREE.Mesh with the lofted body surface
 */
export function loftBodySurface(
  sections: CrossSection[],
  longitudinalSubdivisions: number = 8,
  name: string = 'Lofted_Body_Surface',
  material: THREE.Material = new THREE.MeshStandardMaterial({ color: 0x666666 })
): THREE.Mesh {
  if (sections.length < 2) {
    throw new Error('Need at least 2 cross-sections to loft');
  }

  // Ensure all profiles have the same number of points
  const profileLength = sections[0].profile.length;
  for (const s of sections) {
    if (s.profile.length !== profileLength) {
      throw new Error(`Profile length mismatch: expected ${profileLength}, got ${s.profile.length}`);
    }
  }

  // Build interpolated stations using Catmull-Rom
  const allStations: { x: number; profile: ProfilePoint[] }[] = [];

  for (let si = 0; si < sections.length - 1; si++) {
    const s0 = sections[Math.max(0, si - 1)];
    const s1 = sections[si];
    const s2 = sections[si + 1];
    const s3 = sections[Math.min(sections.length - 1, si + 2)];

    for (let sub = 0; sub < longitudinalSubdivisions; sub++) {
      const t = sub / longitudinalSubdivisions;

      // Catmull-Rom interpolation for X position
      const x = catmullRom(s0.x, s1.x, s2.x, s3.x, t);

      // Catmull-Rom interpolation for each profile point
      const profile: ProfilePoint[] = [];
      for (let pi = 0; pi < profileLength; pi++) {
        const y = catmullRom(
          s0.profile[pi].y, s1.profile[pi].y,
          s2.profile[pi].y, s3.profile[pi].y, t
        );
        const z = catmullRom(
          s0.profile[pi].z, s1.profile[pi].z,
          s2.profile[pi].z, s3.profile[pi].z, t
        );
        profile.push({ y, z });
      }

      allStations.push({ x, profile });
    }
  }
  // Add the final section
  allStations.push({
    x: sections[sections.length - 1].x,
    profile: sections[sections.length - 1].profile,
  });

  // Generate mesh geometry from stations
  const totalStations = allStations.length;
  const vertsPerStation = profileLength;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices
  const xMin = allStations[allStations.length - 1].x;
  const xRange = allStations[0].x - xMin;

  for (let si = 0; si < totalStations; si++) {
    const station = allStations[si];
    const u = xRange > 0 ? (station.x - xMin) / xRange : 0;

    for (let pi = 0; pi < vertsPerStation; pi++) {
      const point = station.profile[pi];
      const v = pi / (vertsPerStation - 1);

      positions.push(station.x, point.y, point.z);
      uvs.push(u, v);

      // Placeholder normal — will be computed later
      normals.push(0, 1, 0);
    }
  }

  // Generate triangle indices (quad strips between adjacent stations)
  for (let si = 0; si < totalStations - 1; si++) {
    for (let pi = 0; pi < vertsPerStation - 1; pi++) {
      const a = si * vertsPerStation + pi;
      const b = a + 1;
      const c = (si + 1) * vertsPerStation + pi;
      const d = c + 1;

      // Two triangles per quad
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Create buffer geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // Recompute normals for smooth shading
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Generates a complete body shell group with separate upper and lower panels.
 * Uses the lofting system to create smooth automotive surfaces.
 */
export function generateLoftedBodyShell(
  proportions: VehicleProportionProfile,
  bodyMaterial: THREE.Material,
  carbonMaterial: THREE.Material,
  options: {
    longitudinalSubdivisions?: number;
    splitUpperLower?: boolean;
  } = {}
): THREE.Group {
  const {
    longitudinalSubdivisions = 8,
    splitUpperLower = true,
  } = options;

  const group = new THREE.Group();
  group.name = 'Lofted_Body_Shell';

  const sections = generateHypercarCrossSections(proportions);

  if (splitUpperLower) {
    // Split cross-sections at shoulder line to create separate upper/lower meshes
    const { upperSections, lowerSections } = splitSectionsAtShoulder(sections);

    const upperBody = loftBodySurface(
      upperSections,
      longitudinalSubdivisions,
      'Body_Upper_Shell_Paint',
      bodyMaterial
    );
    group.add(upperBody);

    const lowerBody = loftBodySurface(
      lowerSections,
      longitudinalSubdivisions,
      'Body_Lower_Diffuser_Carbon',
      carbonMaterial
    );
    group.add(lowerBody);
  } else {
    const fullBody = loftBodySurface(
      sections,
      longitudinalSubdivisions,
      'Body_Full_Shell_Paint',
      bodyMaterial
    );
    group.add(fullBody);
  }

  // Add flat floor panel
  const floorGeo = createFloorPanelGeometry(proportions);
  const floor = new THREE.Mesh(floorGeo, carbonMaterial);
  floor.name = 'Body_Flat_Floor_Carbon';
  floor.receiveShadow = true;
  group.add(floor);

  return group;
}

// ── Helper Functions ──

function splitSectionsAtShoulder(
  sections: CrossSection[]
): { upperSections: CrossSection[]; lowerSections: CrossSection[] } {
  const upperSections: CrossSection[] = [];
  const lowerSections: CrossSection[] = [];

  for (const section of sections) {
    const profileLen = section.profile.length;
    const halfLen = Math.floor(profileLen / 2);

    // Find the shoulder point (widest point) approximately at 40% height
    const rightSideStart = halfLen;
    const shoulderIndex = Math.floor(profileLen * 0.35);

    // Upper: from shoulder to shoulder (across top)
    const upperProfile = section.profile.slice(shoulderIndex, profileLen - shoulderIndex);
    upperSections.push({ x: section.x, profile: upperProfile });

    // Lower: from bottom-left to shoulder, then shoulder to bottom-right
    const lowerLeft = section.profile.slice(0, shoulderIndex + 1);
    const lowerRight = section.profile.slice(profileLen - shoulderIndex - 1);
    lowerSections.push({ x: section.x, profile: [...lowerLeft, ...lowerRight] });
  }

  return { upperSections, lowerSections };
}

function createFloorPanelGeometry(props: VehicleProportionProfile): THREE.BufferGeometry {
  const frontX = props.frontWheelCenterX + props.frontOverhang * 0.85;
  const rearX = props.rearWheelCenterX - props.rearOverhang * 0.85;
  const halfW = props.overallWidth * 0.42;
  const y = props.groundClearance;

  const geo = new THREE.PlaneGeometry(
    frontX - rearX,
    halfW * 2,
    12, 4
  );
  geo.rotateX(-Math.PI / 2);
  geo.translate((frontX + rearX) / 2, y, 0);

  // Slightly curve the floor upward at the edges for aero tunnels
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const edgeFactor = Math.abs(z) / halfW;
    if (edgeFactor > 0.7) {
      pos.setY(i, pos.getY(i) + (edgeFactor - 0.7) * 0.03);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  return geo;
}

/** Catmull-Rom scalar interpolation */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

/** Smooth hermite interpolation */
function smoothstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}
