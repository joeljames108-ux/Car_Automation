// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — LIGHTING, GLASS & AERO 3D GENERATOR
// ============================================================================
// 100-Phase Master Automotive CAD Architecture — Phase 21: OLED Taillight Micro-Optics
// - Quad-Projector Matrix LED Headlights with Polycarbonate Lenses & Ice-Blue DRL Blades
// - Full-Width Continuous 3D OLED Taillight Lightbar (1,920mm span) with Dark Acrylic Housing
// - 3D Volumetric OLED Micro-Optic Brake Light Blades & Sequential Amber Turn Guides
// - Dual High-Intensity Laser Rear Fog Projectors & Crystal White Reversing Micro-Arrays
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';

export interface LightingConfiguration {
  headlightsOn?: boolean;
  highBeamsOn?: boolean;
  drlOn?: boolean;
  hazardsOn?: boolean;
  underglowOn?: boolean;
  underglowColorHex?: string;
}

export class ModularLightingGlassAeroGenerator {
  // ── 1. PHASE 21 LIGHTING GENERATOR (Matrix LED Projectors & OLED Taillight) ──
  public static buildLighting(
    wheelbaseMm: number,
    trackWidthMm: number,
    config: LightingConfiguration = {}
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Lighting_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;
    const frontNoseX = 0.45 + 0.88; // Phase 2: 880mm front overhang
    const rearBumperX = 0.45 - wbM - 0.72; // Phase 2: 720mm rear bumper (1020mm with wing)

    const headlightsOn = config.headlightsOn ?? true;
    const drlOn = config.drlOn ?? true;

    // LED Optics Materials
    const ledProjectorMat = new THREE.MeshBasicMaterial({
      color: headlightsOn ? 0xffffff : 0x334155
    });
    const drlGlowMat = new THREE.MeshBasicMaterial({
      color: drlOn ? 0x38bdf8 : 0x1e293b
    });
    const amberIndicatorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const taillightOledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const laserFogMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c });
    const reverseLedMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const housingDarkMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, metalness: 0.96, roughness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.4 });
    const chromeReflectorMat = new THREE.MeshPhysicalMaterial({ color: 0xf1f5f9, metalness: 0.99, roughness: 0.01, clearcoat: 1.0, clearcoatRoughness: 0.01, envMapIntensity: 2.0, reflectivity: 1.0 });

    const polycarbLensMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      transmission: 0.97,
      transparent: true,
      opacity: 0.35,
      roughness: 0.005,
      metalness: 0.0,
      ior: 1.58,
      thickness: 0.003,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      envMapIntensity: 2.0,
      depthWrite: false,
    });

    const smokeAcrylicMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#450a0a'),
      transmission: 0.88,
      transparent: true,
      opacity: 0.68,
      roughness: 0.01,
      metalness: 0.0,
      ior: 1.5,
      thickness: 0.005,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 1.5,
    });

    // Front Matrix Dotted LED Headlights (Left & Right - embedded flush in sculpted fender sockets)
    const leftHeadlight = this.createPhase9HeadlightCluster(
      0.45 + 0.67, // 1.12m
      0.54,        // 0.54m (exact hood/fender splitline height)
      -0.74,       // -0.74m (centered in fender/bumper corner socket)
      ledProjectorMat,
      drlGlowMat,
      amberIndicatorMat,
      housingDarkMat,
      chromeReflectorMat,
      polycarbLensMat,
      true
    );
    const rightHeadlight = this.createPhase9HeadlightCluster(
      0.45 + 0.67, // 1.12m
      0.54,        // 0.54m
      0.74,        // +0.74m
      ledProjectorMat,
      drlGlowMat,
      amberIndicatorMat,
      housingDarkMat,
      chromeReflectorMat,
      polycarbLensMat,
      false
    );
    group.add(leftHeadlight, rightHeadlight);

    // Rear Full-Width Continuous 3D OLED Taillight Assembly (Width = 1.92m)
    const taillightGroup = this.createPhase21TaillightCluster(
      rearBumperX,
      halfTrM,
      taillightOledMat,
      amberIndicatorMat,
      laserFogMat,
      reverseLedMat,
      housingDarkMat,
      smokeAcrylicMat
    );
    group.add(taillightGroup);

    // Underglow Neon Ground Light Tubes (Left, Right, Front, Rear)
    if (config.underglowOn) {
      const neonColor = config.underglowColorHex ? parseInt(config.underglowColorHex.replace('#', '0x'), 16) : 0x06b6d4;
      const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });

      const midX = (0.45 + (0.45 - wbM)) / 2;
      const sideTubeGeo = new THREE.CylinderGeometry(0.012, 0.012, wbM * 0.88, 16);
      sideTubeGeo.rotateZ(Math.PI / 2);

      const tubeL = new THREE.Mesh(sideTubeGeo, neonMat);
      tubeL.position.set(midX, 0.06, -halfTrM * 0.95);

      const tubeR = tubeL.clone();
      tubeR.position.z = halfTrM * 0.95;

      const endTubeGeo = new THREE.CylinderGeometry(0.012, 0.012, halfTrM * 1.4, 16);
      endTubeGeo.rotateX(Math.PI / 2);

      const tubeFront = new THREE.Mesh(endTubeGeo, neonMat);
      tubeFront.position.set(0.45 + 0.55, 0.06, 0);

      const tubeRear = new THREE.Mesh(endTubeGeo, neonMat);
      tubeRear.position.set(0.45 - wbM - 0.45, 0.06, 0);

      group.add(tubeL, tubeR, tubeFront, tubeRear);
    }

    return group;
  }

  private static createPhase21TaillightCluster(
    rearBumperX: number,
    halfTrM: number,
    oledMat: THREE.Material,
    amberMat: THREE.Material,
    laserFogMat: THREE.Material,
    reverseMat: THREE.Material,
    housingMat: THREE.Material,
    smokeLensMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Phase21_OLED_Taillight_Cluster';

    const spanWidth = halfTrM * 1.76; // ~1.52m span across rear decklid

    // 1. Continuous 3D OLED Light Ribbon Lightbar
    const tailBarGeo = new THREE.BoxGeometry(0.04, 0.032, spanWidth);
    const tailBar = new THREE.Mesh(tailBarGeo, oledMat);
    tailBar.position.set(rearBumperX + 0.04, 0.53, 0);

    // Dark Smoked Acrylic Lightbar Enclosure
    const tailHousingGeo = new THREE.BoxGeometry(0.08, 0.085, spanWidth * 1.02);
    const tailHousing = new THREE.Mesh(tailHousingGeo, housingMat);
    tailHousing.position.set(rearBumperX + 0.05, 0.52, 0);

    const smokeCoverGeo = new THREE.BoxGeometry(0.015, 0.075, spanWidth * 1.01);
    const smokeCover = new THREE.Mesh(smokeCoverGeo, smokeLensMat);
    smokeCover.position.set(rearBumperX + 0.02, 0.52, 0);

    group.add(tailHousing, tailBar, smokeCover);

    // 2. 16 Segmented 3D Volumetric OLED Micro-Optic Brake Blades per Side
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.045, 0.008);
    for (let b = 0; b < 16; b++) {
      const zOffset = halfTrM * 0.35 + b * 0.024;

      // Left OLED Blades
      const bladeL = new THREE.Mesh(bladeGeo, oledMat);
      bladeL.position.set(rearBumperX + 0.035, 0.52, -zOffset);
      bladeL.rotation.y = 0.12;

      // Right OLED Blades
      const bladeR = new THREE.Mesh(bladeGeo, oledMat);
      bladeR.position.set(rearBumperX + 0.035, 0.52, zOffset);
      bladeR.rotation.y = -0.12;

      group.add(bladeL, bladeR);
    }

    // 3. Sequential Sweeping Amber Turn Signal Optical Light Guides (Left & Right)
    const turnBladeGeo = new THREE.BoxGeometry(0.035, 0.012, 0.24);
    const turnL = new THREE.Mesh(turnBladeGeo, amberMat);
    turnL.position.set(rearBumperX + 0.038, 0.49, -halfTrM * 0.72);
    turnL.rotation.y = 0.18;

    const turnR = turnL.clone();
    turnR.position.z = halfTrM * 0.72;
    turnR.rotation.y = -0.18;
    group.add(turnL, turnR);

    // 4. Dual High-Intensity Laser Rear Fog Projector Lenses
    const laserLensGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 16);
    laserLensGeo.rotateZ(Math.PI / 2);
    const fogL = new THREE.Mesh(laserLensGeo, laserFogMat);
    fogL.position.set(rearBumperX + 0.04, 0.47, -halfTrM * 0.42);

    const fogR = fogL.clone();
    fogR.position.z = halfTrM * 0.42;
    group.add(fogL, fogR);

    // 5. Dual Crystal White Reversing Micro-Arrays (4-element LED strip)
    const revGeo = new THREE.BoxGeometry(0.025, 0.010, 0.14);
    const revL = new THREE.Mesh(revGeo, reverseMat);
    revL.position.set(rearBumperX + 0.04, 0.47, -halfTrM * 0.22);

    const revR = revL.clone();
    revR.position.z = halfTrM * 0.22;
    group.add(revL, revR);

    return group;
  }

  private static createPhase9HeadlightCluster(
    x: number,
    y: number,
    z: number,
    projectorMat: THREE.Material,
    drlMat: THREE.Material,
    amberMat: THREE.Material,
    housingMat: THREE.Material,
    reflectorMat: THREE.Material,
    lensMat: THREE.Material,
    isLeft: boolean
  ): THREE.Group {
    const cluster = new THREE.Group();
    cluster.position.set(x, y, z);
    const yawAngle = isLeft ? 0.38 : -0.38;
    const pitchAngle = 0.05;

    const podGroup = new THREE.Group();
    podGroup.rotation.y = yawAngle;
    podGroup.rotation.z = isLeft ? -pitchAngle : pitchAngle;

    // 1. Aerodynamically Sculpted Dark Inner Housing Bezel (Flush with fender cutout)
    const bucketGeo = new THREE.BoxGeometry(0.14, 0.065, 0.22);
    const bucket = new THREE.Mesh(bucketGeo, housingMat);
    bucket.position.set(-0.02, 0, 0);
    podGroup.add(bucket);

    // 2. High-Sheen Chrome / Dark Chrome Reflector Shroud
    const shroudGeo = new THREE.BoxGeometry(0.12, 0.058, 0.20);
    const shroud = new THREE.Mesh(shroudGeo, reflectorMat);
    shroud.position.set(0.01, 0, 0);
    podGroup.add(shroud);

    // 3. Triple Matrix Jewel Crystal LED Projectors
    const projectorArray = new THREE.Group();
    projectorArray.position.set(0.035, 0, 0);

    const crystalGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const bezelRingGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16);
    bezelRingGeo.rotateZ(Math.PI / 2);

    for (let i = 0; i < 3; i++) {
      const pZ = (i - 1) * 0.055;

      const bezelRing = new THREE.Mesh(bezelRingGeo, reflectorMat);
      bezelRing.position.set(-0.005, 0, pZ);

      const crystalLens = new THREE.Mesh(crystalGeo, projectorMat);
      crystalLens.position.set(0.004, 0, pZ);

      const coreGeo = new THREE.SphereGeometry(0.006, 10, 10);
      const core = new THREE.Mesh(coreGeo, drlMat);
      core.position.set(0.002, 0, pZ);

      projectorArray.add(bezelRing, crystalLens, core);
    }
    podGroup.add(projectorArray);

    // 4. Swept Boomerang DRL Light Guide Ribbon
    const drlRibbonGeo = new THREE.BoxGeometry(0.010, 0.006, 0.20);
    const drlUpper = new THREE.Mesh(drlRibbonGeo, drlMat);
    drlUpper.position.set(0.045, 0.024, 0);
    drlUpper.rotation.x = isLeft ? 0.08 : -0.08;

    const drlLowerGeo = new THREE.BoxGeometry(0.010, 0.005, 0.14);
    const drlLower = new THREE.Mesh(drlLowerGeo, drlMat);
    drlLower.position.set(0.048, -0.024, isLeft ? 0.025 : -0.025);
    podGroup.add(drlUpper, drlLower);

    // 5. Segmented Amber Turn Indicators
    const indGeo = new THREE.BoxGeometry(0.008, 0.005, 0.025);
    for (let k = 0; k < 4; k++) {
      const indZ = (k - 1.5) * 0.038;
      const ind = new THREE.Mesh(indGeo, amberMat);
      ind.position.set(0.046, 0.028, indZ);
      podGroup.add(ind);
    }

    // 6. Sculpted Refractive Polycarbonate Aerodynamic Outer Lens Cover
    const lensCoverGeo = new THREE.BoxGeometry(0.015, 0.062, 0.22);
    const lensCover = new THREE.Mesh(lensCoverGeo, lensMat);
    lensCover.position.set(0.052, 0, 0);
    podGroup.add(lensCover);

    cluster.add(podGroup);
    return cluster;
  }

  // ── 2. GLASS & CANOPY GENERATOR (Optical Glass & Cockpit HUD) ──
  public static buildGlass(wheelbaseMm: number, trackWidthMm: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Glass_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;
    const cabinCenterX = 0.45 - wbM * 0.45;
    const cabinLength = wbM * 0.62;

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38bdf8'),
      metalness: 0.1,
      roughness: 0.04,
      transmission: 0.94,
      thickness: 0.03,
      transparent: true,
      opacity: 0.55,
      ior: 1.52,
    });

    const fritMat = new THREE.MeshBasicMaterial({ color: 0x05070a });

    // 1. Curved Aerodynamic Windshield
    const windshieldGeo = new THREE.PlaneGeometry(0.64, halfTrM * 1.45, 16, 12);
    windshieldGeo.rotateX(-Math.PI / 2);
    const posW = windshieldGeo.attributes.position;
    for (let i = 0; i < posW.count; i++) {
      const z = posW.getZ(i);
      const curve = Math.cos((z / (halfTrM * 0.72)) * (Math.PI / 2)) * 0.035;
      posW.setY(i, curve);
    }
    windshieldGeo.computeVertexNormals();

    const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshield.position.set(cabinCenterX + cabinLength * 0.38, 0.84, 0);
    windshield.rotation.z = -0.62;
    group.add(windshield);

    // Black Ceramic Frit Border on Windshield Top & Sides
    const fritGeo = new THREE.BoxGeometry(0.04, 0.005, halfTrM * 1.46);
    const fritTop = new THREE.Mesh(fritGeo, fritMat);
    fritTop.position.set(cabinCenterX + cabinLength * 0.38 - 0.18, 0.98, 0);
    fritTop.rotation.z = -0.62;
    group.add(fritTop);

    // 2. Cockpit Telemetry HUD Glass Strip
    const hudGeo = new THREE.BoxGeometry(0.015, 0.09, 0.28);
    const hudMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const hudScreen = new THREE.Mesh(hudGeo, hudMat);
    hudScreen.position.set(cabinCenterX + cabinLength * 0.24, 0.76, 0);
    group.add(hudScreen);

    // 3. Rear Screen Glass
    const rearGlassGeo = new THREE.PlaneGeometry(0.66, halfTrM * 1.40, 16, 12);
    rearGlassGeo.rotateX(-Math.PI / 2);
    const posR = rearGlassGeo.attributes.position;
    for (let i = 0; i < posR.count; i++) {
      const z = posR.getZ(i);
      const curve = Math.cos((z / (halfTrM * 0.70)) * (Math.PI / 2)) * 0.028;
      posR.setY(i, curve);
    }
    rearGlassGeo.computeVertexNormals();

    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMaterial);
    rearGlass.position.set(cabinCenterX - cabinLength * 0.32, 0.92, 0);
    rearGlass.rotation.z = 0.52;
    group.add(rearGlass);

    return group;
  }

  public static buildAerodynamics(
    wheelbaseMm: number,
    trackWidthMm: number,
    drsOpen: boolean = false,
    airbrakeActive: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Aerodynamics_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;
    const rearAxleX = 0.45 - wbM;
    const wingSpan = halfTrM * 2.18; // ~1.88m span

    const carbonAeroMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.92,
      roughness: 0.22,
    });

    const titaniumActuatorMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.98,
      roughness: 0.12,
    });

    const flapAngle = airbrakeActive ? 0.78 : drsOpen ? -0.12 : 0.14; // Airbrake = +45°, DRS Open = -7°, Nominal = +8°

    // 1. Dual-Tier GT3 Active DRS Rear Wing Mainplane
    const wingMainGeo = new THREE.BoxGeometry(0.32, 0.024, wingSpan);
    const wingMain = new THREE.Mesh(wingMainGeo, carbonAeroMat);
    wingMain.position.set(rearAxleX - 0.35, 1.16, 0);
    wingMain.rotation.z = 0.06;
    group.add(wingMain);

    // 2. Active Upper DRS Flap with Carbon Gurney Flap
    const flapGeo = new THREE.BoxGeometry(0.14, 0.016, wingSpan * 0.98);
    const flap = new THREE.Mesh(flapGeo, carbonAeroMat);
    flap.position.set(rearAxleX - 0.44, 1.19, 0);
    flap.rotation.z = flapAngle;

    const gurneyGeo = new THREE.BoxGeometry(0.008, 0.014, wingSpan * 0.98);
    const gurney = new THREE.Mesh(gurneyGeo, carbonAeroMat);
    gurney.position.set(-0.06, 0.007, 0);
    flap.add(gurney);
    group.add(flap);

    // 3. Central Hydraulic DRS Actuator
    const actuatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 16);
    const actuator = new THREE.Mesh(actuatorGeo, titaniumActuatorMat);
    actuator.position.set(rearAxleX - 0.38, 1.15, 0);
    actuator.rotation.z = Math.PI / 4 + (drsOpen ? -0.15 : airbrakeActive ? 0.25 : 0);
    group.add(actuator);

    // 4. Vertical Carbon Wing Endplates (Left & Right)
    const endplateGeo = new THREE.BoxGeometry(0.44, 0.24, 0.016);
    const endL = new THREE.Mesh(endplateGeo, carbonAeroMat);
    endL.position.set(rearAxleX - 0.35, 1.16, -wingSpan / 2);

    const endR = endL.clone();
    endR.position.z = wingSpan / 2;
    group.add(endL, endR);

    // 5. Dual Swan-Neck Pylons
    const pylonGeo = new THREE.BoxGeometry(0.045, 0.44, 0.02);
    const pylonL = new THREE.Mesh(pylonGeo, carbonAeroMat);
    pylonL.position.set(rearAxleX - 0.24, 0.96, -0.36);
    pylonL.rotation.z = -0.25;

    const pylonR = pylonL.clone();
    pylonR.position.z = 0.36;
    group.add(pylonL, pylonR);

    return group;
  }

  // ── 4. REAL-TIME 3D CFD STREAMLINES & VORTEX VISUALIZER ──
  public static buildCFDStreamlines(wheelbaseMm: number, trackWidthMm: number): THREE.Group {
    const streamGroup = new THREE.Group();
    streamGroup.name = 'CFD_Streamlines_Visualization';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;
    const frontX = 0.45 + 0.92;
    const rearX = 0.45 - wbM - 0.85;

    // Multi-Tier Streamline Ribbons
    const streamLinesData = [
      // Centerline High-Speed Roof Flow
      { start: [frontX, 0.45, 0], end: [rearX, 1.25, 0], color: 0xec4899, radius: 0.008 },
      { start: [frontX - 0.1, 0.52, -0.15], end: [rearX, 1.22, -0.20], color: 0x06b6d4, radius: 0.007 },
      { start: [frontX - 0.1, 0.52, 0.15], end: [rearX, 1.22, 0.20], color: 0x06b6d4, radius: 0.007 },
      // Side Flank & Mirror Vortex Streams
      { start: [frontX - 0.4, 0.48, -halfTrM * 0.9], end: [rearX, 0.65, -halfTrM * 1.05], color: 0x10b981, radius: 0.006 },
      { start: [frontX - 0.4, 0.48, halfTrM * 0.9], end: [rearX, 0.65, halfTrM * 1.05], color: 0x10b981, radius: 0.006 },
      // Underbody Venturi Suction Streamlines
      { start: [frontX - 0.2, 0.10, -0.3], end: [rearX, 0.35, -0.45], color: 0x3b82f6, radius: 0.008 },
      { start: [frontX - 0.2, 0.10, 0.3], end: [rearX, 0.35, 0.45], color: 0x3b82f6, radius: 0.008 },
      // Wingtip Trailing Vortex Coils
      { start: [rearX + 0.3, 1.16, -halfTrM * 0.95], end: [rearX - 0.4, 1.30, -halfTrM * 1.15], color: 0xf59e0b, radius: 0.009 },
      { start: [rearX + 0.3, 1.16, halfTrM * 0.95], end: [rearX - 0.4, 1.30, halfTrM * 1.15], color: 0xf59e0b, radius: 0.009 },
    ];

    streamLinesData.forEach((s) => {
      const p1 = new THREE.Vector3(s.start[0], s.start[1], s.start[2]);
      const p2 = new THREE.Vector3(s.end[0], s.end[1], s.end[2]);
      const curve = new THREE.LineCurve3(p1, p2);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, s.radius, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: 0.75,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      streamGroup.add(tube);
    });

    return streamGroup;
  }

  // ── 5. EXHAUST BACKFIRE FLAME VFX ──
  public static buildExhaustFlames(wheelbaseMm: number, trackWidthMm: number): THREE.Group {
    const flameGroup = new THREE.Group();
    flameGroup.name = 'Exhaust_Backfire_Flames';

    const wbM = wheelbaseMm / 1000;
    const rearBumperX = 0.45 - wbM - 0.72;

    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85,
    });

    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
    });

    const quadOffsets = [-0.22, -0.12, 0.12, 0.22];
    quadOffsets.forEach((posZ) => {
      // Outer Flame Cone
      const coneGeo = new THREE.ConeGeometry(0.048, 0.32, 16);
      coneGeo.rotateZ(Math.PI / 2);
      const flame = new THREE.Mesh(coneGeo, outerFlameMat);
      flame.position.set(rearBumperX - 0.22, 0.38, posZ);

      // Inner Hot Core
      const coreGeo = new THREE.ConeGeometry(0.024, 0.22, 12);
      coreGeo.rotateZ(Math.PI / 2);
      const core = new THREE.Mesh(coreGeo, innerCoreMat);
      core.position.set(rearBumperX - 0.16, 0.38, posZ);

      flameGroup.add(flame, core);
    });

    // Dynamic Flash Point Light
    const flameLight = new THREE.PointLight(0x38bdf8, 3.5, 4.0);
    flameLight.position.set(rearBumperX - 0.20, 0.38, 0);
    flameGroup.add(flameLight);

    return flameGroup;
  }
}
