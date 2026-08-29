// ============================================================================
// F1 2024-REGULATION PROCEDURAL GEOMETRY — Photorealistic Ground-Effect Car
// ============================================================================
// Models a 2024-spec F1 car with:
//   - Ground-effect venturi floor (narrow tunnels, edge fences)
//   - Narrow, low front wing with outwash endplates
//   - Slimmed sidepods with undercut and downwash ramp
//   - Large 18" wheels with wheel covers
//   - Proper halo + survival cell proportions
//   - Swan-neck rear wing with DRS
// ============================================================================

import * as THREE from "three";

// ─── MATERIAL PALETTE ──────────────────────────────────────────────────────

export const F1Materials = {
  /** Deep carbon fiber — nearly black with subtle metallic sheen */
  carbon: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0e,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
    }),

  /** Team livery paint — high-gloss with clearcoat */
  livery: (color: number = 0x06b6d4) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.06,
      metalness: 0.65,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.8,
    }),

  /** Structural titanium — matte gray with slight warmth */
  titanium: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x8a8d94,
      roughness: 0.28,
      metalness: 0.95,
      clearcoat: 0.2,
    }),

  /** Engine gold — heat-resistant coating */
  engineGold: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.18,
      metalness: 0.92,
      clearcoat: 0.4,
    }),

  /** Tire rubber — very rough, no metalness */
  rubber: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x111115,
      roughness: 0.94,
      metalness: 0.0,
    }),

  /** Brake caliper red */
  brakeRed: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.12,
      metalness: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    }),

  /** Glowing brake disc */
  brakeGlow: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x7f1d1d,
      roughness: 0.35,
      metalness: 0.85,
      emissive: 0xef4444,
      emissiveIntensity: 0.3,
    }),

  /** Mirror-finish chrome */
  chrome: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
    }),

  /** Tinted polycarbonate glass */
  glass: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      roughness: 0.0,
      metalness: 0.1,
      transmission: 0.6,
      thickness: 0.02,
      ior: 1.52,
      transparent: true,
      opacity: 0.85,
    }),

  /** Exhaust heat shielding */
  heatShield: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x7c2d12,
      roughness: 0.55,
      metalness: 0.45,
    }),

  /** Matte dark plastic / aero surface */
  darkPlastic: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x0d0d12,
      roughness: 0.88,
      metalness: 0.05,
    }),

  /** X-ray transparency for exploded views */
  xrayBody: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5,
    }),

  /** Inlet / duct interior — matte black */
  ductInterior: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      roughness: 0.95,
      metalness: 0.0,
    }),

  /** FIA plank — yellowish composite */
  plank: () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x8B7355,
      roughness: 0.92,
      metalness: 0.0,
    }),

  /** Wheel cover — carbon with livery accent */
  wheelCover: (color: number = 0x06b6d4) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.15,
      metalness: 0.75,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
    }),
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

/** CatmullRom tube from a list of Vector3 control points */
function tubeFrom(
  pts: THREE.Vector3[],
  radius: number,
  segs: number = 12,
  radSegs: number = 10
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  return new THREE.TubeGeometry(curve, segs, radius, radSegs, false);
}

/** NACA 4-digit airfoil cross-section */
function airfoilShape(
  chord: number,
  thickness: number,
  camber: number = 0.02
): THREE.Shape {
  const shape = new THREE.Shape();
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * chord;
    const yt =
      thickness *
      (0.2969 * Math.sqrt(t) -
        0.126 * t -
        0.3516 * t * t +
        0.2843 * t * t * t -
        0.1036 * t * t * t * t);
    const yc = camber * (1 - (2 * t - 1) ** 2);
    const yUpper = yc + yt;
    if (i === 0) shape.moveTo(x, yUpper);
    else shape.lineTo(x, yUpper);
  }
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const x = t * chord;
    const yt =
      thickness *
      (0.2969 * Math.sqrt(t) -
        0.126 * t -
        0.3516 * t * t +
        0.2843 * t * t * t -
        0.1036 * t * t * t * t);
    const yc = camber * (1 - (2 * t - 1) ** 2);
    shape.lineTo(x, yc - yt);
  }
  shape.closePath();
  return shape;
}

/** Smooth swept wing element — extruded airfoil along a span */
function wingElement(
  chord: number,
  thickness: number,
  camber: number,
  span: number,
  sweepBack: number,
  dihedral: number
): THREE.BufferGeometry {
  const foil = airfoilShape(chord, thickness, camber);
  const geo = new THREE.ExtrudeGeometry(foil, {
    depth: span,
    bevelEnabled: true,
    bevelThickness: 0.001,
    bevelSize: 0.001,
    bevelSegments: 1,
  });
  geo.translate(-chord * 0.35, 0, -span / 2);
  geo.rotateY(Math.PI / 2);
  // Apply sweep and dihedral as a slight rotation
  const mat = new THREE.Matrix4();
  mat.makeRotationX(dihedral);
  geo.applyMatrix4(mat);
  return geo;
}

// ═══════════════════════════════════════════════════════════════════════════
// SURVIVAL CELL — 2024-spec narrow monocoque
// ═══════════════════════════════════════════════════════════════════════════

export function buildSurvivalCell(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Survival_Cell";
  const mat = xray ? F1Materials.xrayBody() : F1Materials.livery();
  const carbon = F1Materials.carbon();

  // ── Main tub profile (cross-section extruded along Z) ──
  // The 2024 monocoque is narrow at the nose, widens for the cockpit,
  // then tapers sharply to the engine cover.
  const tubShape = new THREE.Shape();
  // Cross-section at the widest point (cockpit area)
  tubShape.moveTo(-0.14, 0.0); // floor left
  tubShape.lineTo(0.14, 0.0); // floor right
  tubShape.quadraticCurveTo(0.20, 0.06, 0.20, 0.14); // right side
  tubShape.quadraticCurveTo(0.19, 0.22, 0.12, 0.26); // right shoulder
  tubShape.lineTo(-0.12, 0.26); // top
  tubShape.quadraticCurveTo(-0.19, 0.22, -0.20, 0.14); // left shoulder
  tubShape.quadraticCurveTo(-0.20, 0.06, -0.14, 0.0); // left side

  const tubGeo = new THREE.ExtrudeGeometry(tubShape, {
    depth: 1.6, // length of the cockpit section
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 4,
  });
  tubGeo.translate(0, 0, -0.8); // center on Z
  const tub = new THREE.Mesh(tubGeo, mat);
  tub.castShadow = true;
  tub.receiveShadow = true;
  g.add(tub);

  // ── Nose taper — narrow extruded shape from cockpit front to nose tip ──
  const noseShape = new THREE.Shape();
  noseShape.moveTo(-0.06, 0.0);
  noseShape.lineTo(0.06, 0.0);
  noseShape.quadraticCurveTo(0.09, 0.03, 0.09, 0.08);
  noseShape.quadraticCurveTo(0.08, 0.14, 0.04, 0.16);
  noseShape.lineTo(-0.04, 0.16);
  noseShape.quadraticCurveTo(-0.08, 0.14, -0.09, 0.08);
  noseShape.quadraticCurveTo(-0.09, 0.03, -0.06, 0.0);

  const noseTaperGeo = new THREE.ExtrudeGeometry(noseShape, {
    depth: 1.2,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 3,
  });
  noseTaperGeo.translate(0, 0.02, -2.0);
  const noseTaper = new THREE.Mesh(noseTaperGeo, mat);
  noseTaper.castShadow = true;
  g.add(noseTaper);

  // ── Engine cover hump — smooth taper behind cockpit ──
  const coverShape = new THREE.Shape();
  coverShape.moveTo(-0.08, 0.0);
  coverShape.lineTo(0.08, 0.0);
  coverShape.quadraticCurveTo(0.14, 0.04, 0.14, 0.12);
  coverShape.quadraticCurveTo(0.12, 0.22, 0.0, 0.24);
  coverShape.quadraticCurveTo(-0.12, 0.22, -0.14, 0.12);
  coverShape.quadraticCurveTo(-0.14, 0.04, -0.08, 0.0);

  const coverGeo = new THREE.ExtrudeGeometry(coverShape, {
    depth: 1.2,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  coverGeo.translate(0, 0.18, 0.8);
  const cover = new THREE.Mesh(coverGeo, mat);
  cover.castShadow = true;
  g.add(cover);

  // ── Shark fin / T-wing on engine cover ──
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.5, 0);
  finShape.lineTo(0.4, 0.18);
  finShape.lineTo(0, 0.14);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.004,
    bevelEnabled: false,
  });
  const fin = new THREE.Mesh(finGeo, mat);
  fin.position.set(-0.002, 0.36, 0.6);
  g.add(fin);

  // ── Roll hoop airbox intake ──
  const intakeShape = new THREE.Shape();
  intakeShape.moveTo(-0.04, -0.02);
  intakeShape.lineTo(0.04, -0.02);
  intakeShape.quadraticCurveTo(0.05, 0.0, 0.04, 0.02);
  intakeShape.lineTo(-0.04, 0.02);
  intakeShape.quadraticCurveTo(-0.05, 0.0, -0.04, -0.02);
  const intakeGeo = new THREE.ExtrudeGeometry(intakeShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  intakeGeo.translate(0, 0, -0.03);
  const intake = new THREE.Mesh(intakeGeo, F1Materials.darkPlastic());
  intake.position.set(0, 0.48, -0.15);
  intake.rotation.x = 0.15;
  g.add(intake);

  // ── Cockpit headrest padding ──
  const headrestGeo = new THREE.BoxGeometry(0.20, 0.08, 0.12);
  headrestGeo.translate(0, 0, 0);
  const headrest = new THREE.Mesh(headrestGeo, F1Materials.darkPlastic());
  headrest.position.set(0, 0.38, 0.55);
  g.add(headrest);

  // ── Cockpit rim / padding surround ──
  const rimPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rx = 0.13 + 0.02 * Math.sin(a * 2);
    const ry = 0.04;
    rimPts.push(
      new THREE.Vector3(
        Math.cos(a) * rx,
        0.30 + Math.sin(a) * ry,
        0.42 + Math.sin(a) * 0.10
      )
    );
  }
  const rimGeo = tubeFrom(rimPts, 0.006, 24, 6);
  const rim = new THREE.Mesh(rimGeo, F1Materials.darkPlastic());
  g.add(rim);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOSE CONE — 2024 narrow tapered nose with S-duct and camera pods
// ═══════════════════════════════════════════════════════════════════════════

export function buildNoseCone(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Nose_Cone";
  const mat = xray ? F1Materials.xrayBody() : F1Materials.livery();

  // ── Main nose body — tapered from 0.10 to 0.03 over 0.8m ──
  const noseProfile: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = t * 0.8;
    const w = 0.03 + Math.pow(t, 0.6) * 0.07; // smooth taper
    noseProfile.push(new THREE.Vector2(w, z));
  }
  const noseGeo = new THREE.LatheGeometry(noseProfile, 20);
  noseGeo.rotateX(Math.PI / 2);
  noseGeo.translate(0, 0.04, 0.4);
  const nose = new THREE.Mesh(noseGeo, mat);
  nose.castShadow = true;
  g.add(nose);

  // ── Nose tip — small rounded cap ──
  const tipGeo = new THREE.SphereGeometry(0.025, 12, 8);
  const tip = new THREE.Mesh(tipGeo, F1Materials.chrome());
  tip.position.set(0, 0.04, 0.82);
  g.add(tip);

  // ── FIA camera pods (T-cam housings) ──
  [-1, 1].forEach((side) => {
    const camGeo = new THREE.CapsuleGeometry(0.010, 0.018, 6, 8);
    const cam = new THREE.Mesh(camGeo, F1Materials.darkPlastic());
    cam.position.set(side * 0.04, 0.12, 0.50);
    cam.rotation.z = side * 0.3;
    g.add(cam);
  });

  // ── Nose mounting pillars (front wing attach points) ──
  [-1, 1].forEach((side) => {
    const pillarGeo = new THREE.CylinderGeometry(0.008, 0.010, 0.06, 8);
    const pillar = new THREE.Mesh(pillarGeo, F1Materials.titanium());
    pillar.position.set(side * 0.06, 0.06, 0.20);
    pillar.rotation.z = side * 0.25;
    g.add(pillar);
  });

  // ── S-duct exit (on top of nose) ──
  const sductGeo = new THREE.BoxGeometry(0.04, 0.005, 0.06);
  const sduct = new THREE.Mesh(sductGeo, F1Materials.darkPlastic());
  sduct.position.set(0, 0.16, 0.35);
  g.add(sduct);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// FRONT WING — 2024 narrow wing with 4 elements + endplates
// ═══════════════════════════════════════════════════════════════════════════

export function buildFrontWing(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Front_Wing";
  const mat = xray ? F1Materials.xrayBody() : F1Materials.livery();
  const carbon = F1Materials.carbon();

  // ── 4-element wing with proper F1 2024 proportions ──
  // 2024 front wing is ~1.8m span, narrow chord
  const elements = [
    { y: 0.0, chord: 0.15, thick: 0.018, camber: 0.035, span: 0.80, mat: carbon },
    { y: 0.02, chord: 0.12, thick: 0.015, camber: 0.028, span: 0.78, mat: carbon },
    { y: 0.035, chord: 0.09, thick: 0.012, camber: 0.022, span: 0.75, mat },
    { y: 0.045, chord: 0.07, thick: 0.010, camber: 0.018, span: 0.72, mat },
  ];

  elements.forEach((el) => {
    [-1, 1].forEach((side) => {
      const foil = airfoilShape(el.chord, el.thick, el.camber);
      const geo = new THREE.ExtrudeGeometry(foil, {
        depth: el.span,
        bevelEnabled: true,
        bevelThickness: 0.001,
        bevelSize: 0.001,
        bevelSegments: 1,
      });
      geo.translate(-el.chord * 0.3, 0, 0);
      geo.rotateY(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, el.mat);
      mesh.position.set(side * 0.04, el.y, 0);
      mesh.castShadow = true;
      g.add(mesh);
    });
  });

  // ── Endplates — tall curved vertical fins ──
  [-1, 1].forEach((side) => {
    const epShape = new THREE.Shape();
    epShape.moveTo(0, -0.01);
    epShape.lineTo(0, 0.14);
    epShape.quadraticCurveTo(0.008, 0.16, 0.02, 0.14);
    epShape.lineTo(0.02, -0.01);
    epShape.closePath();
    const epGeo = new THREE.ExtrudeGeometry(epShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    epGeo.rotateY(Math.PI / 2);
    const ep = new THREE.Mesh(epGeo, mat);
    ep.position.set(side * 0.82, -0.01, 0);
    ep.castShadow = true;
    g.add(ep);

    // Gurney flap on trailing edge
    const gurneyGeo = new THREE.BoxGeometry(0.005, 0.018, 0.15);
    const gurney = new THREE.Mesh(gurneyGeo, carbon);
    gurney.position.set(side * 0.835, 0.12, 0);
    g.add(gurney);

    // Front brake duct scoop
    const scoopGeo = new THREE.SphereGeometry(0.03, 10, 8, 0, Math.PI);
    const scoop = new THREE.Mesh(scoopGeo, carbon);
    scoop.position.set(side * 0.50, -0.02, 0);
    scoop.rotation.x = Math.PI / 2;
    scoop.scale.set(1.5, 0.8, 0.6);
    g.add(scoop);
  });

  // ── Central neutral section (FIA plank connection) ──
  const plankGeo = new THREE.BoxGeometry(0.08, 0.008, 0.14);
  const plank = new THREE.Mesh(plankGeo, F1Materials.darkPlastic());
  plank.position.set(0, -0.01, 0);
  g.add(plank);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// HALO — Titanium safety structure with aero fairing
// ═══════════════════════════════════════════════════════════════════════════

export function buildHalo(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Halo";
  const mat = F1Materials.titanium();
  const bodyMat = xray ? F1Materials.xrayBody() : F1Materials.livery();

  // ── Main hoop — follows cockpit rim ──
  const hoopPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const a = Math.PI * 0.12 + t * Math.PI * 0.76;
    hoopPts.push(
      new THREE.Vector3(
        Math.cos(a) * 0.18,
        Math.sin(a) * 0.18 + 0.30,
        -0.02 + Math.sin(t * Math.PI) * 0.03
      )
    );
  }
  const hoopGeo = tubeFrom(hoopPts, 0.016, 36, 10);
  const hoop = new THREE.Mesh(hoopGeo, mat);
  hoop.castShadow = true;
  g.add(hoop);

  // ── Central pillar (front mount) ──
  const pillarPts = [
    new THREE.Vector3(0, 0.34, -0.16),
    new THREE.Vector3(0, 0.40, -0.10),
    new THREE.Vector3(0, 0.46, -0.04),
  ];
  const pillarGeo = tubeFrom(pillarPts, 0.020, 10, 8);
  const pillar = new THREE.Mesh(pillarGeo, mat);
  pillar.castShadow = true;
  g.add(pillar);

  // ── Side mounting lugs ──
  [-1, 1].forEach((side) => {
    const lugGeo = new THREE.CylinderGeometry(0.018, 0.020, 0.03, 10);
    const lug = new THREE.Mesh(lugGeo, mat);
    lug.position.set(side * 0.18, 0.32, -0.01);
    g.add(lug);

    // Bolt detail
    const boltGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.006, 6);
    const bolt = new THREE.Mesh(boltGeo, F1Materials.chrome());
    bolt.position.set(side * 0.18, 0.345, -0.01);
    g.add(bolt);
  });

  // ── Aero fairing on top of halo ──
  const fairingGeo = new THREE.CapsuleGeometry(0.010, 0.10, 6, 10);
  const fairing = new THREE.Mesh(fairingGeo, bodyMat);
  fairing.position.set(0, 0.50, -0.04);
  fairing.rotation.z = Math.PI / 2;
  g.add(fairing);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// COCKPIT TRIM — Steering wheel, mirrors, dashboard
// ═══════════════════════════════════════════════════════════════════════════

export function buildCockpitTrim(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Cockpit_Trim";

  // ── Steering wheel — F1 yoke with display ──
  const wheelGrp = new THREE.Group();

  // Main rim — oval tube
  const rimPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rx = 0.09 * (1 + 0.12 * Math.cos(a * 2));
    const ry = 0.065 * (1 + 0.08 * Math.sin(a * 3));
    rimPts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
  }
  const rimGeo = tubeFrom(rimPts, 0.010, 40, 8);
  wheelGrp.add(new THREE.Mesh(rimGeo, F1Materials.carbon()));

  // LCD display
  const screenGeo = new THREE.PlaneGeometry(0.10, 0.05);
  const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x001122,
    emissive: 0x0055cc,
    emissiveIntensity: 0.7,
    roughness: 0.0,
    metalness: 0.2,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.008, 0.01);
  wheelGrp.add(screen);

  // Screen housing
  const housingGeo = new THREE.BoxGeometry(0.11, 0.06, 0.012);
  housingGeo.translate(0, 0.008, 0.004);
  wheelGrp.add(new THREE.Mesh(housingGeo, F1Materials.darkPlastic()));

  // Rubber grips
  [-1, 1].forEach((side) => {
    const gripGeo = new THREE.CapsuleGeometry(0.014, 0.04, 6, 8);
    const grip = new THREE.Mesh(gripGeo, F1Materials.rubber());
    grip.position.set(side * 0.08, -0.015, 0);
    grip.rotation.z = Math.PI / 2;
    wheelGrp.add(grip);
  });

  // Shift paddles
  [-1, 1].forEach((side) => {
    const pGeo = new THREE.BoxGeometry(0.006, 0.035, 0.020);
    const p = new THREE.Mesh(pGeo, F1Materials.chrome());
    p.position.set(side * 0.05, 0.04, -0.012);
    wheelGrp.add(p);
  });

  // Rotator knobs
  for (let i = 0; i < 5; i++) {
    const kGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6);
    const k = new THREE.Mesh(kGeo, F1Materials.brakeRed());
    k.position.set(-0.03 + i * 0.015, -0.018, 0.010);
    k.rotation.x = Math.PI / 2;
    wheelGrp.add(k);
  }

  // Hub / column
  const hubGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.10, 8);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, F1Materials.titanium());
  hub.position.set(0, 0, -0.05);
  wheelGrp.add(hub);

  wheelGrp.position.set(0, 0.40, 0.18);
  wheelGrp.rotation.x = -0.35;
  g.add(wheelGrp);

  // ── Side mirrors — teardrop housing on carbon stalks ──
  [-1, 1].forEach((side) => {
    const mGrp = new THREE.Group();

    // Stalk
    const stalkPts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.08, 0.01, 0.02),
      new THREE.Vector3(side * 0.14, 0, 0),
    ];
    const stalkGeo = tubeFrom(stalkPts, 0.004, 8, 6);
    mGrp.add(new THREE.Mesh(stalkGeo, F1Materials.carbon()));

    // Housing
    const housingGeo = new THREE.SphereGeometry(0.020, 10, 8);
    housingGeo.scale(1.5, 0.9, 0.7);
    const housing = new THREE.Mesh(housingGeo, F1Materials.livery());
    housing.position.set(side * 0.14, 0, 0);
    mGrp.add(housing);

    // Mirror surface
    const surfGeo = new THREE.PlaneGeometry(0.028, 0.016);
    const surf = new THREE.Mesh(surfGeo, F1Materials.chrome());
    surf.position.set(side * 0.14, 0, 0.012);
    mGrp.add(surf);

    mGrp.position.set(side * 0.22, 0.44, 0.22);
    g.add(mGrp);
  });

  // ── Dashboard cowl ──
  const cowlGeo = new THREE.CapsuleGeometry(0.035, 0.18, 6, 10);
  cowlGeo.rotateZ(Math.PI / 2);
  const cowl = new THREE.Mesh(cowlGeo, F1Materials.darkPlastic());
  cowl.position.set(0, 0.36, 0.12);
  cowl.scale.set(3.0, 0.7, 0.5);
  g.add(cowl);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// POWER UNIT — 1.6L V6 Turbo-Hybrid
// ═══════════════════════════════════════════════════════════════════════════

export function buildPowerUnit(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Power_Unit";
  const goldMat = F1Materials.engineGold();
  const tiMat = F1Materials.titanium();

  // ── Main block — smooth capsule ──
  const blockGeo = new THREE.CapsuleGeometry(0.14, 0.45, 10, 20);
  blockGeo.rotateZ(Math.PI / 2);
  const block = new THREE.Mesh(blockGeo, goldMat);
  block.castShadow = true;
  g.add(block);

  // ── Cylinder head covers (V6 banks at ~90°) ──
  [-1, 1].forEach((side) => {
    const headGeo = new THREE.CapsuleGeometry(0.04, 0.40, 8, 12);
    headGeo.rotateZ(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, F1Materials.brakeRed());
    head.position.set(0, 0.14, 0);
    head.rotation.z = side * 0.35;
    head.castShadow = true;
    g.add(head);
  });

  // ── Turbocharger — scroll housing ──
  const turboGrp = new THREE.Group();
  const turboHousing = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.016, 10, 20),
    tiMat
  );
  turboHousing.rotation.y = Math.PI / 2;
  turboGrp.add(turboHousing);

  // Compressor outlet
  const compPipe = tubeFrom(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.05, 0.02),
      new THREE.Vector3(0, 0.07, 0.05),
    ],
    0.010,
    10,
    8
  );
  turboGrp.add(new THREE.Mesh(compPipe, tiMat));
  turboGrp.position.set(0, 0.18, 0.12);
  g.add(turboGrp);

  // ── MGU-K ──
  const mguKGeo = new THREE.CapsuleGeometry(0.035, 0.08, 8, 12);
  mguKGeo.rotateZ(Math.PI / 2);
  const mguK = new THREE.Mesh(mguKGeo, F1Materials.chrome());
  mguK.position.set(0.20, 0.04, -0.10);
  g.add(mguK);

  // ── MGU-H ──
  const mguHGeo = new THREE.CapsuleGeometry(0.025, 0.06, 8, 10);
  mguHGeo.rotateZ(Math.PI / 2);
  const mguH = new THREE.Mesh(mguHGeo, F1Materials.chrome());
  mguH.position.set(-0.16, 0.16, 0.10);
  g.add(mguH);

  // ── Exhaust collector pipes ──
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 0.4 - Math.PI * 0.2;
    const pts = [
      new THREE.Vector3(Math.cos(a) * 0.08, -0.10, 0.08 + i * 0.05),
      new THREE.Vector3(Math.cos(a) * 0.12, -0.16, 0.18 + i * 0.03),
      new THREE.Vector3(0, -0.14, 0.28),
    ];
    const geo = tubeFrom(pts, 0.010, 8, 6);
    g.add(new THREE.Mesh(geo, F1Materials.heatShield()));
  }

  // ── Exhaust tip ──
  const tipGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.05, 14);
  tipGeo.rotateX(Math.PI / 2);
  const tip = new THREE.Mesh(tipGeo, tiMat);
  tip.position.set(0, -0.14, 0.30);
  g.add(tip);

  // ── Energy store (battery) below engine ──
  const batGeo = new THREE.BoxGeometry(0.26, 0.06, 0.30);
  const bat = new THREE.Mesh(batGeo, F1Materials.darkPlastic());
  bat.position.set(0, -0.16, 0);
  g.add(bat);

  // ── Coolant lines ──
  [-1, 1].forEach((side) => {
    const pts = [
      new THREE.Vector3(side * 0.12, 0, -0.18),
      new THREE.Vector3(side * 0.16, 0.04, 0),
      new THREE.Vector3(side * 0.12, 0.02, 0.18),
    ];
    const geo = tubeFrom(pts, 0.006, 8, 6);
    g.add(new THREE.Mesh(geo, F1Materials.heatShield()));
  });

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// GEARBOX — 8-speed structural cassette
// ═══════════════════════════════════════════════════════════════════════════

export function buildGearbox(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Gearbox";

  // Main casing
  const casingGeo = new THREE.CapsuleGeometry(0.14, 0.42, 10, 16);
  casingGeo.rotateZ(Math.PI / 2);
  const casing = new THREE.Mesh(casingGeo, F1Materials.titanium());
  casing.castShadow = true;
  g.add(casing);

  // Output shafts
  [-1, 1].forEach((side) => {
    const shaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.18, 8);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, F1Materials.chrome());
    shaft.position.set(side * 0.24, -0.03, 0.20);
    g.add(shaft);

    const flangeGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.015, 10);
    flangeGeo.rotateZ(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, F1Materials.titanium());
    flange.position.set(side * 0.28, -0.03, 0.20);
    g.add(flange);
  });

  // Differential housing
  const diffGeo = new THREE.SphereGeometry(0.05, 10, 8);
  diffGeo.scale(1.2, 0.8, 1.0);
  const diff = new THREE.Mesh(diffGeo, F1Materials.titanium());
  diff.position.set(0, -0.02, 0.22);
  g.add(diff);

  // Rear suspension pickup points
  [-1, 1].forEach((side) => {
    const pGeo = new THREE.BoxGeometry(0.015, 0.025, 0.035);
    const p = new THREE.Mesh(pGeo, F1Materials.titanium());
    p.position.set(side * 0.15, 0.12, 0.18);
    g.add(p);
  });

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// REAR WING — Multi-plane with DRS + swan-neck pylons
// ═══════════════════════════════════════════════════════════════════════════

export function buildRearWing(isDrsOpen: boolean, xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Rear_Wing";
  const mat = xray ? F1Materials.xrayBody() : F1Materials.livery();
  const carbon = F1Materials.carbon();

  // ── Main plane — large airfoil ──
  const mainGeo = wingElement(0.30, 0.022, 0.04, 1.30, 0, 0);
  const mainMesh = new THREE.Mesh(mainGeo, carbon);
  mainMesh.castShadow = true;
  g.add(mainMesh);

  // ── DRS flap ──
  const drsGeo = wingElement(0.16, 0.018, 0.03, 1.26, 0, 0);
  const drsMesh = new THREE.Mesh(drsGeo, mat);
  drsMesh.position.set(0, 0.045, 0.18);
  if (isDrsOpen) {
    drsMesh.rotation.x = -Math.PI / 5;
    drsMesh.position.y += 0.035;
  }
  drsMesh.castShadow = true;
  g.add(drsMesh);

  // ── Beam wing (lower element) ──
  const beamGeo = wingElement(0.10, 0.014, 0.02, 1.05, 0, 0);
  const beamMesh = new THREE.Mesh(beamGeo, carbon);
  beamMesh.position.set(0, -0.22, 0.10);
  g.add(beamMesh);

  // ── Endplates ──
  [-1, 1].forEach((side) => {
    const epShape = new THREE.Shape();
    epShape.moveTo(0, -0.24);
    epShape.lineTo(0, 0.08);
    epShape.quadraticCurveTo(0.008, 0.12, 0.02, 0.08);
    epShape.lineTo(0.02, -0.24);
    epShape.closePath();
    const epGeo = new THREE.ExtrudeGeometry(epShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    epGeo.rotateY(Math.PI / 2);
    const ep = new THREE.Mesh(epGeo, mat);
    ep.position.set(side * 0.64, -0.01, 0.04);
    ep.castShadow = true;
    g.add(ep);
  });

  // ── Swan-neck pylons (top-mounted) ──
  [-1, 1].forEach((side) => {
    const pts = [
      new THREE.Vector3(side * 0.24, 0.06, -0.04),
      new THREE.Vector3(side * 0.26, 0.15, 0),
      new THREE.Vector3(side * 0.24, 0.20, 0.04),
    ];
    const geo = tubeFrom(pts, 0.006, 8, 6);
    const pylon = new THREE.Mesh(geo, carbon);
    pylon.castShadow = true;
    g.add(pylon);
  });

  // ── DRS actuator ──
  const actGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8);
  const act = new THREE.Mesh(actGeo, F1Materials.titanium());
  act.position.set(0, 0.05, 0.12);
  act.rotation.x = Math.PI / 2;
  g.add(act);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOOR — Ground-effect venturi tunnels + diffuser
// ═══════════════════════════════════════════════════════════════════════════

export function buildFloor(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Floor";
  const carbon = F1Materials.carbon();

  // ── Main floor plate — smooth tapered shape ──
  const floorShape = new THREE.Shape();
  floorShape.moveTo(-0.35, -1.2);
  floorShape.quadraticCurveTo(-0.42, -0.6, -0.48, 0);
  floorShape.quadraticCurveTo(-0.44, 0.5, -0.32, 0.85);
  floorShape.lineTo(0.32, 0.85);
  floorShape.quadraticCurveTo(0.44, 0.5, 0.48, 0);
  floorShape.quadraticCurveTo(0.42, -0.6, 0.35, -1.2);
  floorShape.closePath();

  const floorGeo = new THREE.ExtrudeGeometry(floorShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, carbon);
  floorMesh.castShadow = true;
  floorMesh.receiveShadow = true;
  g.add(floorMesh);

  // ── Venturi tunnel strakes ──
  for (let i = 0; i < 4; i++) {
    [-1, 1].forEach((side) => {
      const pts = [
        new THREE.Vector3(side * (0.22 + i * 0.06), 0, -0.2 + i * 0.25),
        new THREE.Vector3(side * (0.25 + i * 0.06), -0.06, 0.1 + i * 0.25),
        new THREE.Vector3(side * (0.27 + i * 0.06), -0.04, 0.4 + i * 0.25),
      ];
      const geo = tubeFrom(pts, 0.005, 8, 5);
      g.add(new THREE.Mesh(geo, carbon));
    });
  }

  // ── Rear diffuser ──
  const diffPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    diffPts.push(new THREE.Vector3(0, -0.015 + t * 0.10, 0.75 + t * 0.40));
  }
  const diffGeo = tubeFrom(diffPts, 0.18, 12, 8);
  const diffuser = new THREE.Mesh(diffGeo, carbon);
  g.add(diffuser);

  // ── Diffuser vertical vanes ──
  for (let i = -3; i <= 3; i++) {
    const vShape = new THREE.Shape();
    vShape.moveTo(0, 0);
    vShape.lineTo(0, 0.08);
    vShape.lineTo(0.005, 0.08);
    vShape.lineTo(0.005, 0);
    vShape.closePath();
    const vGeo = new THREE.ExtrudeGeometry(vShape, {
      depth: 0.30,
      bevelEnabled: false,
    });
    vGeo.rotateX(-0.12);
    const vane = new THREE.Mesh(vGeo, carbon);
    vane.position.set(i * 0.10, -0.015, 0.85);
    g.add(vane);
  }

  // ── FIA plank ──
  const plankGeo = new THREE.BoxGeometry(0.30, 0.005, 1.30);
  const plank = new THREE.Mesh(plankGeo, F1Materials.plank());
  plank.position.set(0, -0.018, 0);
  g.add(plank);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEPODS — 2024 undercut + downwash ramp design
// ═══════════════════════════════════════════════════════════════════════════

export function buildSidepod(isLeft: boolean, xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = isLeft ? "Sidepod_L" : "Sidepod_R";
  const mat = xray ? F1Materials.xrayBody() : F1Materials.livery();
  const sign = isLeft ? -1 : 1;

  // ── Main body — swept capsule with undercut ──
  const spGeo = new THREE.CapsuleGeometry(0.10, 1.0, 10, 14);
  spGeo.rotateX(Math.PI / 2);
  const sp = new THREE.Mesh(spGeo, mat);
  sp.castShadow = true;
  g.add(sp);

  // ── Radiator inlet opening ──
  const inletGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.03, 14);
  inletGeo.rotateX(Math.PI / 2);
  const inlet = new THREE.Mesh(inletGeo, F1Materials.ductInterior());
  inlet.position.set(sign * -0.02, 0.04, -0.50);
  g.add(inlet);

  // ── Inlet lip ──
  const lipGeo = new THREE.TorusGeometry(0.065, 0.005, 8, 14);
  lipGeo.rotateX(Math.PI / 2);
  const lip = new THREE.Mesh(lipGeo, mat);
  lip.position.set(sign * -0.02, 0.04, -0.52);
  g.add(lip);

  // ── Cooling louvers ──
  for (let i = 0; i < 5; i++) {
    const lGeo = new THREE.BoxGeometry(0.004, 0.035, 0.05);
    const louver = new THREE.Mesh(lGeo, F1Materials.darkPlastic());
    louver.position.set(sign * -0.10, 0.04 + i * 0.010, -0.15 + i * 0.07);
    g.add(louver);
  }

  g.position.x = sign * 0.35;
  g.position.z = 0.1;

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// WHEELS — 18" with wheel covers + brake assembly
// ═══════════════════════════════════════════════════════════════════════════

export function buildWheel(isRear: boolean, xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = isRear ? "Wheel_Rear" : "Wheel_Front";

  const tireR = isRear ? 0.30 : 0.29;
  const tireW = isRear ? 0.38 : 0.28;

  // ── Tire — smooth torus ──
  const tireGeo = new THREE.TorusGeometry(tireR - 0.035, 0.05, 14, 42);
  tireGeo.rotateY(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, F1Materials.rubber());
  tire.castShadow = true;
  tire.receiveShadow = true;
  g.add(tire);

  // ── Tread surface ──
  const treadGeo = new THREE.CylinderGeometry(
    tireR,
    tireR,
    tireW - 0.08,
    28
  );
  treadGeo.rotateZ(Math.PI / 2);
  const tread = new THREE.Mesh(treadGeo, F1Materials.rubber());
  tread.castShadow = true;
  g.add(tread);

  // ── Sidewall rings ──
  [-1, 1].forEach((side) => {
    const swGeo = new THREE.TorusGeometry(tireR - 0.015, 0.006, 6, 28);
    swGeo.rotateY(Math.PI / 2);
    const sw = new THREE.Mesh(swGeo, F1Materials.rubber());
    sw.position.x = side * (tireW * 0.44);
    g.add(sw);

    // Tire lettering ring
    const ltGeo = new THREE.TorusGeometry(tireR * 0.78, 0.003, 5, 20);
    ltGeo.rotateY(Math.PI / 2);
    const lt = new THREE.Mesh(ltGeo, F1Materials.darkPlastic());
    lt.position.x = side * (tireW * 0.47);
    g.add(lt);
  });

  // ── Wheel cover — 2024-spec flat disc ──
  const coverGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.015, 28);
  coverGeo.rotateZ(Math.PI / 2);
  const cover = new THREE.Mesh(
    coverGeo,
    F1Materials.wheelCover()
  );
  g.add(cover);

  // ── Rim center hub ──
  const hubGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 14);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, F1Materials.titanium());
  g.add(hub);

  // ── Center lock nut ──
  const lockGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 6);
  lockGeo.rotateZ(Math.PI / 2);
  const lock = new THREE.Mesh(lockGeo, F1Materials.brakeRed());
  lock.position.x = 0.02;
  g.add(lock);

  // ── 5-spoke rim (behind cover, visible through slots) ──
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const pts = [
      new THREE.Vector3(0, Math.sin(a) * 0.035, Math.cos(a) * 0.035),
      new THREE.Vector3(0, Math.sin(a) * 0.10, Math.cos(a) * 0.10),
      new THREE.Vector3(0, Math.sin(a) * 0.17, Math.cos(a) * 0.17),
    ];
    const geo = tubeFrom(pts, 0.006, 8, 5);
    g.add(new THREE.Mesh(geo, F1Materials.titanium()));
  }

  // ── Brake disc — ventilated carbon ──
  const discGeo = new THREE.TorusGeometry(0.12, 0.015, 8, 28);
  discGeo.rotateY(Math.PI / 2);
  const disc = new THREE.Mesh(discGeo, F1Materials.brakeGlow());
  g.add(disc);

  // ── Brake caliper — detailed Brembo ──
  const calGrp = new THREE.Group();
  const calMainGeo = new THREE.BoxGeometry(0.05, 0.05, 0.08);
  calGrp.add(new THREE.Mesh(calMainGeo, F1Materials.brakeRed()));

  // Caliper bridge
  const bridgeGeo = new THREE.BoxGeometry(0.055, 0.015, 0.085);
  bridgeGeo.translate(0, 0.035, 0);
  calGrp.add(new THREE.Mesh(bridgeGeo, F1Materials.brakeRed()));

  // Pistons
  for (let i = 0; i < 4; i++) {
    const pGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6);
    pGeo.rotateX(Math.PI / 2);
    const piston = new THREE.Mesh(pGeo, F1Materials.chrome());
    piston.position.set(
      -0.012 + (i % 2) * 0.024,
      -0.015 + Math.floor(i / 2) * 0.03,
      0
    );
    calGrp.add(piston);
  }

  calGrp.position.set(0.025, 0.10, 0);
  g.add(calGrp);

  // ── Brake cooling duct ──
  const ductGeo = new THREE.CylinderGeometry(0.022, 0.030, 0.06, 10);
  ductGeo.rotateX(Math.PI / 2);
  const duct = new THREE.Mesh(ductGeo, F1Materials.darkPlastic());
  duct.position.set(-0.05, 0, 0);
  g.add(duct);

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUSPENSION — Pushrod double wishbone
// ═══════════════════════════════════════════════════════════════════════════

export function buildSuspension(isRear: boolean, xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = isRear ? "Suspension_Rear" : "Suspension_Front";
  const carbon = F1Materials.carbon();
  const ti = F1Materials.titanium();
  const armLen = isRear ? 0.55 : 0.48;

  // Upper wishbone (2 arms)
  [-1, 1].forEach((side) => {
    const pts = [
      new THREE.Vector3(-side * 0.025, 0.10, -armLen * 0.28),
      new THREE.Vector3(-side * 0.008, 0.12, 0),
      new THREE.Vector3(side * 0.10, 0.10, armLen * 0.30),
    ];
    const geo = tubeFrom(pts, 0.005, 8, 5);
    g.add(new THREE.Mesh(geo, carbon));
  });

  // Lower wishbone (2 arms)
  [-1, 1].forEach((side) => {
    const pts = [
      new THREE.Vector3(-side * 0.035, 0.015, -armLen * 0.28),
      new THREE.Vector3(-side * 0.015, 0.008, 0),
      new THREE.Vector3(side * 0.12, 0.0, armLen * 0.30),
    ];
    const geo = tubeFrom(pts, 0.006, 8, 5);
    g.add(new THREE.Mesh(geo, carbon));
  });

  // Pushrod
  const pushPts = [
    new THREE.Vector3(0, 0.06, armLen * 0.08),
    new THREE.Vector3(0, 0.12, -armLen * 0.12),
  ];
  const pushGeo = tubeFrom(pushPts, 0.003, 6, 5);
  g.add(new THREE.Mesh(pushGeo, F1Materials.chrome()));

  // Rocker
  const rockerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6);
  const rocker = new THREE.Mesh(rockerGeo, ti);
  rocker.position.set(0, 0.13, -armLen * 0.12);
  rocker.rotation.z = Math.PI / 2;
  g.add(rocker);

  // Upright
  const upShape = new THREE.Shape();
  upShape.moveTo(-0.012, -0.06);
  upShape.lineTo(-0.015, 0.06);
  upShape.quadraticCurveTo(-0.012, 0.08, -0.004, 0.08);
  upShape.lineTo(0.004, 0.08);
  upShape.quadraticCurveTo(0.012, 0.08, 0.015, 0.06);
  upShape.lineTo(0.012, -0.06);
  upShape.closePath();
  const upGeo = new THREE.ExtrudeGeometry(upShape, {
    depth: 0.020,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
  });
  upGeo.translate(0, 0, -0.010);
  const upright = new THREE.Mesh(upGeo, ti);
  upright.position.set(0, 0.04, armLen * 0.30);
  upright.castShadow = true;
  g.add(upright);

  // Anti-roll bar (front only)
  if (!isRear) {
    const arbPts = [
      new THREE.Vector3(-0.30, 0.12, -armLen * 0.08),
      new THREE.Vector3(0, 0.14, -armLen * 0.12),
      new THREE.Vector3(0.30, 0.12, -armLen * 0.08),
    ];
    const arbGeo = tubeFrom(arbPts, 0.004, 10, 5);
    g.add(new THREE.Mesh(arbGeo, ti));
  }

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// REAR DIFFUSER — Standalone detailed unit
// ═══════════════════════════════════════════════════════════════════════════

export function buildRearDiffuser(xray = false): THREE.Group {
  const g = new THREE.Group();
  g.name = "Rear_Diffuser";
  const carbon = F1Materials.carbon();

  // Main body
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.35, 0);
  bodyShape.quadraticCurveTo(-0.38, 0.05, -0.30, 0.10);
  bodyShape.lineTo(0.30, 0.10);
  bodyShape.quadraticCurveTo(0.38, 0.05, 0.35, 0);
  bodyShape.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
  bodyGeo.rotateX(-0.12);
  const body = new THREE.Mesh(bodyGeo, carbon);
  body.castShadow = true;
  g.add(body);

  // Vertical vanes
  for (let i = -3; i <= 3; i++) {
    const vShape = new THREE.Shape();
    vShape.moveTo(0, 0);
    vShape.lineTo(0, 0.08);
    vShape.lineTo(0.004, 0.08);
    vShape.lineTo(0.004, 0);
    vShape.closePath();
    const vGeo = new THREE.ExtrudeGeometry(vShape, {
      depth: 0.32,
      bevelEnabled: false,
    });
    vGeo.rotateX(-0.12);
    const vane = new THREE.Mesh(vGeo, carbon);
    vane.position.set(i * 0.085, -0.01, 0.04);
    g.add(vane);
  }

  // Exhaust exits above diffuser
  [-1, 1].forEach((side) => {
    const exGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.035, 10);
    exGeo.rotateX(Math.PI / 2);
    const ex = new THREE.Mesh(exGeo, F1Materials.titanium());
    ex.position.set(side * 0.05, 0.12, 0.18);
    g.add(ex);
  });

  return g;
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER EXPORT — Build any F1 socket by ID
// ═══════════════════════════════════════════════════════════════════════════

export function buildF1Component(
  socketId: string,
  xray = false,
  isDrsOpen = false
): THREE.Group | null {
  switch (socketId) {
    case "SOCKET_SURVIVAL_CELL":
      return buildSurvivalCell(xray);
    case "SOCKET_NOSE_CONE":
      return buildNoseCone(xray);
    case "SOCKET_FRONT_WING":
      return buildFrontWing(xray);
    case "SOCKET_HALO":
      return buildHalo(xray);
    case "SOCKET_COCKPIT_TRIM":
      return buildCockpitTrim(xray);
    case "SOCKET_POWER_UNIT":
      return buildPowerUnit(xray);
    case "SOCKET_GEARBOX":
      return buildGearbox(xray);
    case "SOCKET_REAR_WING":
      return buildRearWing(isDrsOpen, xray);
    case "SOCKET_FLOOR_UNDERBODY":
      return buildFloor(xray);
    case "SOCKET_SIDEPOD_L":
      return buildSidepod(true, xray);
    case "SOCKET_SIDEPOD_R":
      return buildSidepod(false, xray);
    case "SOCKET_REAR_DIFFUSER":
      return buildRearDiffuser(xray);
    case "SOCKET_SUSPENSION_FL":
    case "SOCKET_SUSPENSION_FR":
      return buildSuspension(false, xray);
    case "SOCKET_SUSPENSION_RL":
    case "SOCKET_SUSPENSION_RR":
      return buildSuspension(true, xray);
    case "SOCKET_WHEEL_FL":
    case "SOCKET_WHEEL_FR":
      return buildWheel(false, xray);
    case "SOCKET_WHEEL_RL":
    case "SOCKET_WHEEL_RR":
      return buildWheel(true, xray);
    default:
      return null;
  }
}
