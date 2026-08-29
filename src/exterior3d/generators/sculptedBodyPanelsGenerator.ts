// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — SCULPTED BODY PANELS 3D GENERATOR
// ============================================================================
// 100-Phase Master Automotive CAD Architecture — Block 04: Articulated Sculpted Hood, S-Duct & Struts
// - Parametric G2 Curvature Stamped Hood Loft with Functional Clamshell Articulation
// - Dual Recessed Carbon S-Duct Extractor Nostrils with Directional Turning Vanes
// - Dual High-Pressure Hydraulic Gas Lift Struts & Billet Aluminum Multi-Link Hinges
// - Carbon Underside Structural Stiffening Skeleton, AeroCatch Latches & Heated Washer Jets
// ============================================================================

import * as THREE from 'three';
import { VehicleBodyType } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { AutomotivePBRMaterialSystem } from '../materials/automotivePBRMaterialSystem';
import { ModularBodyPanelCustomizer, PaintConfiguration } from '../materials/modularBodyPanelCustomizer';

export interface BodyClosuresArticulation {
  hoodOpenProgress?: number;      // 0 to 1
  doorOpenProgress?: number;      // 0 to 1
  rearHatchOpenProgress?: number; // 0 to 1
}

export class SculptedBodyPanelsGenerator {
  public static buildSculptedBody(
    bodyType: VehicleBodyType,
    wheelbaseMm: number,
    trackWidthMm: number,
    materialGrade: MaterialGrade = 'forged',
    isXRay: boolean = false,
    paintColorHex: number = 0xb45309,
    articulation: BodyClosuresArticulation = {},
    paintConfig?: Partial<PaintConfiguration>,
    trackWidthFrontMm?: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `SculptedBody_${bodyType}`;

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000; // default rear half-track (0.86m)
    const halfTfM = trackWidthFrontMm ? (trackWidthFrontMm / 2) / 1000 : halfTrM * 0.976; // 0.84m

    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const frontNoseX = frontAxleX + 0.88; // Phase 2: 880mm Front Overhang
    const rearBumperX = rearAxleX - 0.72; // Phase 2: 720mm Rear Bumper (1020mm with Diffuser & Wing)

    // Phase 3 & 4 Dimensional Envelope
    const frontWidthM = (halfTfM + 0.15) * 2;   // 1.98m (1,980mm over front fenders)
    const rearHaunchWidthM = (halfTrM + 0.165) * 2; // 2.05m (2,050mm over rear haunches)
    const cockpitWidthM = 1.24;                 // 1.24m (1,240mm cockpit canopy)

    // ── 1. Luxury PBR Materials ──
    const bodyPaintMaterial = paintConfig
      ? ModularBodyPanelCustomizer.createPaintMaterial(paintConfig, isXRay)
      : new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(paintColorHex),
          metalness: 0.88,
          roughness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          reflectivity: 1.0,
          specularIntensity: 1.0,
          specularColor: new THREE.Color(0xffffff),
          envMapIntensity: 1.6,
          sheen: 0.3,
          sheenColor: new THREE.Color(paintColorHex).multiplyScalar(0.7),
          sheenRoughness: 0.2,
          side: THREE.DoubleSide,
          transparent: isXRay,
          opacity: isXRay ? 0.25 : 1.0,
          depthWrite: !isXRay,
        });

    const carbonAeroMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      metalness: 0.92,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.4,
      sheen: 0.2,
      sheenColor: new THREE.Color(0x1a1a2e),
      side: THREE.DoubleSide,
      normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getCarbonWeaveNormalTexture() : null,
      transparent: isXRay,
      opacity: isXRay ? 0.25 : 1.0,
    });

    const titaniumStrutMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.98,
      roughness: 0.12,
    });

    const titaniumHaloMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.98,
      roughness: 0.10,
      clearcoat: 0.8,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.5,
      sheen: 0.5,
      sheenColor: new THREE.Color('#d4a843'),
      sheenRoughness: 0.15,
    });

    const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c8ddf0'),
      metalness: 0.0,
      roughness: 0.01,
      transmission: 0.92,
      transparent: true,
      opacity: 0.45,
      ior: 1.52,
      thickness: 0.004,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.2,
      reflectivity: 0.95,
      specularColor: new THREE.Color(0xffffff),
      specularIntensity: 0.8,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const titaniumExhaustMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Blue-purple titanium flame tint
      metalness: 0.96,
      roughness: 0.15,
    });

    const trimGlossBlackMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      metalness: 0.95,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 1.6,
      specularIntensity: 1.0,
      side: THREE.DoubleSide,
    });

    const rubberGasketMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10, // EPDM Weatherstripping Rubber
      metalness: 0.05,
      roughness: 0.95,
    });

    const meshGrilleMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.85,
      roughness: 0.4,
      wireframe: true,
    });

    const f1RainLightMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Glowing Red FIA Rain Light
    });

    const amberIndicatorMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber Mirror Indicator & BSM Triangle
    });

    const defrosterWireMat = new THREE.MeshBasicMaterial({
      color: 0xf97316, // Copper Defroster Filament
    });

    const cyanHandleGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, // Cyan Touch Handle Micro-LED
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c8ddf0'),
      metalness: 0.0,
      roughness: 0.005,
      transmission: 0.96,
      transparent: true,
      opacity: 0.38,
      ior: 1.52,
      thickness: 0.006,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.005,
      envMapIntensity: 2.8,
      specularColor: new THREE.Color(0xffffff),
      specularIntensity: 0.7,
    });

    const velocityTrumpetMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.98,
      roughness: 0.1,
    });

    const velocityFilterRedMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 0.95,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.3,
    });

    // ── 2. Route to Dedicated Body Archetype Generator ──
    switch (bodyType) {
      case 'sedan':
        return this.buildSedanExecutiveBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumStrutMaterial,
          rubberGasketMat, titaniumExhaustMaterial, articulation
        );

      case 'coupe':
        return this.buildCoupeFastbackBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumStrutMaterial,
          rubberGasketMat, titaniumExhaustMaterial, articulation
        );

      case 'convertible':
      case 'sports_car':
        return this.buildSportsRoadsterBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumHaloMaterial,
          titaniumExhaustMaterial, articulation
        );

      case 'suv':
        return this.buildSUVBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumStrutMaterial,
          rubberGasketMat, titaniumExhaustMaterial, articulation
        );

      case 'pickup':
        return this.buildPickupTruckBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumStrutMaterial,
          rubberGasketMat, titaniumExhaustMaterial, articulation
        );

      case 'hatchback':
      case 'wagon':
        return this.buildHatchbackWagonBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial,
          glassMaterial, trimGlossBlackMaterial, titaniumStrutMaterial,
          rubberGasketMat, titaniumExhaustMaterial, articulation
        );

      case 'supercar':
      case 'hypercar':
      default:
        return this.buildHypercarSculptedBody(
          frontAxleX, rearAxleX, frontNoseX, rearBumperX,
          halfTfM, halfTrM, frontWidthM, rearHaunchWidthM, cockpitWidthM, wbM,
          bodyPaintMaterial, carbonAeroMaterial, titaniumStrutMaterial, titaniumHaloMaterial,
          mirrorGlassMat, titaniumExhaustMaterial, trimGlossBlackMaterial, rubberGasketMat,
          meshGrilleMat, f1RainLightMat, amberIndicatorMat, defrosterWireMat,
          cyanHandleGlowMat, glassMaterial, velocityTrumpetMat, velocityFilterRedMat, articulation
        );
    }
  }

  // ==========================================================================
  // HYPERCAR & SUPERCAR MASTER BODY SCULPTURE
  // ==========================================================================
  private static buildHypercarSculptedBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    frontWidthM: number,
    rearHaunchWidthM: number,
    cockpitWidthM: number,
    wbM: number,
    bodyPaintMaterial: THREE.Material,
    carbonAeroMaterial: THREE.Material,
    titaniumStrutMaterial: THREE.Material,
    titaniumHaloMaterial: THREE.Material,
    mirrorGlassMat: THREE.Material,
    titaniumExhaustMaterial: THREE.Material,
    trimGlossBlackMaterial: THREE.Material,
    rubberGasketMat: THREE.Material,
    meshGrilleMat: THREE.Material,
    f1RainLightMat: THREE.Material,
    amberIndicatorMat: THREE.Material,
    defrosterWireMat: THREE.Material,
    cyanHandleGlowMat: THREE.Material,
    glassMaterial: THREE.Material,
    velocityTrumpetMat: THREE.Material,
    velocityFilterRedMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Hypercar_SculptedBody';

    // ── 1. Ground Effect Floor & Keel ──
    const monocoqueFloor = this.buildPhase23GroundEffectFloorAndVenturiThroat(frontAxleX, rearAxleX, frontNoseX, rearBumperX, halfTfM, halfTrM, rearHaunchWidthM, carbonAeroMaterial, trimGlossBlackMaterial, titaniumStrutMaterial);
    group.add(monocoqueFloor);

    // ── 2. Front Bumper & Splitter ──
    const frontFascia = this.buildPhase22FrontBumperAndSDuct(frontNoseX, frontAxleX, halfTfM, frontWidthM, bodyPaintMaterial, carbonAeroMaterial, titaniumStrutMaterial, trimGlossBlackMaterial, meshGrilleMat);
    group.add(frontFascia);

    // ── 3. Sculpted Hood & S-Duct Extractors ──
    const hood = this.buildBlock04SculptedHoodAndSDuct(frontAxleX, frontNoseX, halfTfM, bodyPaintMaterial, carbonAeroMaterial, rubberGasketMat, titaniumStrutMaterial, trimGlossBlackMaterial, meshGrilleMat, articulation);
    group.add(hood);

    // ── 4. Widebody Front Fenders ──
    const frontFenders = this.buildPhase6FrontFenders(frontAxleX, halfTfM, bodyPaintMaterial, carbonAeroMaterial, trimGlossBlackMaterial);
    group.add(frontFenders);

    // ── 5. Scalloped Dihedral Doors & Bargeboards ──
    const doorsAndRockers = this.buildPhase25DoorsUndercutsAndIntercoolers(frontAxleX, rearAxleX, halfTfM, halfTrM, bodyPaintMaterial, carbonAeroMaterial, trimGlossBlackMaterial, rubberGasketMat, titaniumStrutMaterial, cyanHandleGlowMat, articulation);
    group.add(doorsAndRockers);

    // ── 6. Greenhouse Canopy & Aero Mirrors ──
    const greenhouse = this.buildPhase20GreenhouseAndAeroMirrors(frontAxleX, rearAxleX, halfTfM, cockpitWidthM, bodyPaintMaterial, glassMaterial, trimGlossBlackMaterial, amberIndicatorMat, titaniumHaloMaterial, mirrorGlassMat, carbonAeroMaterial);
    group.add(greenhouse);

    // ── 7. Double-Bubble Roof Skin & Ram-Air Scoop ──
    const roof = this.buildPhase17RoofSkinAndRamAirScoop(frontAxleX, rearAxleX, cockpitWidthM, bodyPaintMaterial, carbonAeroMaterial, meshGrilleMat);
    group.add(roof);

    // ── 8. Muscular Rear Haunches & Intercooler Vents ──
    const rearHaunches = this.buildPhase6RearHaunches(rearAxleX, halfTrM, bodyPaintMaterial, carbonAeroMaterial, trimGlossBlackMaterial);
    group.add(rearHaunches);

    // ── 9. Rear Engine Decklid & Gas Struts ──
    const engineDecklid = this.buildPhase19EngineDecklidAndGasStruts(rearAxleX, wbM, halfTrM, bodyPaintMaterial, glassMaterial, carbonAeroMaterial, velocityTrumpetMat, velocityFilterRedMat, defrosterWireMat, titaniumStrutMaterial, rubberGasketMat, articulation);
    group.add(engineDecklid);

    // ── 10. Rear Fascia, Diffuser & DRS GT3 Wing ──
    const rearFasciaAndWing = this.buildPhase13RearFasciaAndDrsWing(rearBumperX, rearAxleX, halfTrM, rearHaunchWidthM, bodyPaintMaterial, carbonAeroMaterial, titaniumExhaustMaterial, titaniumStrutMaterial, f1RainLightMat, trimGlossBlackMaterial, meshGrilleMat);
    group.add(rearFasciaAndWing);

    // ── 11. Livery Decals ──
    const livery = this.buildLiveryDecals(frontAxleX, rearAxleX, halfTrM);
    group.add(livery);

    return group;
  }

  // ==========================================================================
  // BLOCK 01 & 02: PHASE 23 ACTIVE GROUND EFFECT VENTURI FLOOR, KEEL & SKIRTS
  // ==========================================================================
  private static buildPhase23GroundEffectFloorAndVenturiThroat(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    rearHaunchWidthM: number,
    carbonMat: THREE.Material,
    trimMat: THREE.Material,
    titaniumMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block01_02_Phase23GroundEffectFloorAndVenturiThroat';

    const totalLength = frontNoseX - rearBumperX;
    const centerX = (frontNoseX + rearBumperX) / 2;

    // 1. Full-Length Aerodynamic Flat Underbody Floor (t = 25mm, Width = 2.05m at rear)
    const floorGeo = new THREE.BoxGeometry(totalLength * 0.96, 0.025, rearHaunchWidthM * 0.98);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(centerX, 0.11, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // 2. Central Aerodynamic Stagnation Keel Splitter (Dividing left and right floor at Z = 0.0m)
    const keelGeo = new THREE.BoxGeometry(totalLength * 0.82, 0.065, 0.022);
    const keel = new THREE.Mesh(keelGeo, carbonMat);
    keel.position.set(centerX, 0.08, 0);
    group.add(keel);

    // 3. 6 Curved Venturi Tunnel Guide Strakes (3 per side at Z = ±0.25m, ±0.52m, ±0.78m)
    const strakeZOffsets = [-0.78, -0.52, -0.25, 0.25, 0.52, 0.78];
    const strakeGeo = new THREE.BoxGeometry(totalLength * 0.72, 0.052, 0.016);
    strakeZOffsets.forEach((sz, idx) => {
      const strake = new THREE.Mesh(strakeGeo, carbonMat);
      strake.position.set(centerX, 0.082, sz);
      strake.rotation.y = (idx < 3 ? 0.04 : -0.04);
      group.add(strake);
    });

    // 4. Underside Composite Carbon-Kevlar Honeycomb Structural Stiffening Ribs
    const ribGeo = new THREE.BoxGeometry(0.04, 0.012, rearHaunchWidthM * 0.82);
    for (let r = -3; r <= 3; r++) {
      const rib = new THREE.Mesh(ribGeo, carbonMat);
      rib.position.set(centerX + r * 0.45, 0.096, 0);
      group.add(rib);
    }

    // 5. Stepped Serrated Ground-Effect Floor Edge Sealing Skirts (Left & Right at Z = ±0.99m)
    const skirtLength = Math.abs(frontAxleX - rearAxleX) * 1.08;
    const skirtEdgeGeo = new THREE.BoxGeometry(skirtLength, 0.04, 0.025);
    const skirtL = new THREE.Mesh(skirtEdgeGeo, carbonMat);
    skirtL.position.set(centerX, 0.09, -0.99);

    const skirtR = skirtL.clone();
    skirtR.position.z = 0.99;
    group.add(skirtL, skirtR);

    // 6. Stepped Vortex-Shedding Teeth along Floor Edge
    const toothGeo = new THREE.BoxGeometry(0.04, 0.015, 0.035);
    for (let t = -4; t <= 4; t++) {
      const xPos = centerX + t * 0.22;
      const toothL = new THREE.Mesh(toothGeo, carbonMat);
      toothL.position.set(xPos, 0.075, -1.00);
      toothL.rotation.y = (t % 2 === 0 ? 1 : -1) * 0.20;

      const toothR = toothL.clone();
      toothR.position.z = 1.00;
      toothR.rotation.y = -toothL.rotation.y;
      group.add(toothL, toothR);
    }

    // 7. 4 High-Speed Billet Aluminum Air Jack Receptacles (Left & Right, Front & Rear)
    const jackGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.06, 16);
    const jackPositions = [
      [frontAxleX + 0.15, -0.82],
      [frontAxleX + 0.15, 0.82],
      [rearAxleX - 0.15, -0.84],
      [rearAxleX - 0.15, 0.84],
    ];
    jackPositions.forEach(([jx, jz]) => {
      const jack = new THREE.Mesh(jackGeo, titaniumMat);
      jack.position.set(jx, 0.095, jz);
      group.add(jack);
    });

    // 8. Central Titanium Undertray Skid Rub-Blocks
    const skidGeo = new THREE.BoxGeometry(0.24, 0.008, 0.12);
    for (let k = -2; k <= 2; k++) {
      const skid = new THREE.Mesh(skidGeo, titaniumMat);
      skid.position.set(centerX + k * 0.65, 0.095, 0);
      group.add(skid);
    }

    // 9. Central Monocoque Cockpit Safety Tub with Structural Apertures
    const tubLength = Math.abs(frontAxleX - rearAxleX) * 1.12;
    const tubCenterX = (frontAxleX + rearAxleX) / 2;
    const tubGeo = new THREE.BoxGeometry(tubLength, 0.32, 1.24);
    const tub = new THREE.Mesh(tubGeo, trimMat);
    tub.position.set(tubCenterX, 0.28, 0);
    group.add(tub);

    // 10. Front Crash Structure Pressure Relief Bleed Apertures (Left & Right)
    const apertureGeo = new THREE.BoxGeometry(0.18, 0.08, 0.04);
    const apertureL = new THREE.Mesh(apertureGeo, carbonMat);
    apertureL.position.set(frontAxleX - 0.16, 0.34, -0.64);
    apertureL.rotation.y = 0.35;

    const apertureR = apertureL.clone();
    apertureR.position.z = 0.64;
    apertureR.rotation.y = -0.35;
    group.add(apertureL, apertureR);

    return group;
  }

  // ==========================================================================
  // BLOCK 03: PHASE 22 — PRODUCTION-GRADE SCULPTED FRONT FASCIA, NOSE CONE,
  //           RADIATOR AIR DAM, BRAKE DUCTS, SPLITTER & CANARDS
  // ==========================================================================
  // Design: Precision-matched continuous 3D volumetric front clip assembly.
  // The upper nose deck connects seamlessly to the hood leading edge at
  // X = 1.13m (Y = 0.54m), sloping forward to the prow apex at X = 1.33m (Y = 0.46m).
  // The sculpted bumper cheeks wrap around the front corners from Z = ±0.62m to
  // Z = ±0.98m and match the front fender leading edge with 0.0mm gap.
  // ==========================================================================
  private static buildPhase22FrontBumperAndSDuct(
    frontNoseX: number,
    frontAxleX: number,
    halfTfM: number,
    frontWidthM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    strutMat: THREE.Material,
    trimMat: THREE.Material,
    grilleMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block03_Phase22ProductionFrontFascia';

    const hoodLeadingX = frontAxleX + 0.68; // 1.13m
    const bumperLength = frontNoseX - hoodLeadingX; // ~0.20m (1.13m to 1.33m)
    const noseWidth = 1.24; // 1,240mm matching hood width
    const halfNW = noseWidth / 2; // 0.62m

    // ═══════════════════════════════════════════════════════════════════
    // 1. CONTINUOUS UPPER NOSE CONE & SHARK-NOSE PROW (64 x 48 Grid)
    //    Spans X in [hoodLeadingX, frontNoseX], Z in [-halfNW, +halfNW]
    //    Matches hood leading edge (Y = 0.54m) at X = hoodLeadingX exactly!
    // ═══════════════════════════════════════════════════════════════════
    const noseGeo = new THREE.PlaneGeometry(bumperLength, noseWidth, 64, 48);
    noseGeo.rotateX(-Math.PI / 2);
    const posN = noseGeo.attributes.position;

    for (let i = 0; i < posN.count; i++) {
      const px = posN.getX(i); // [-bumperLength/2, +bumperLength/2]
      const pz = posN.getZ(i); // [-halfNW, +halfNW]
      const u = (px + bumperLength / 2) / bumperLength; // 0 (hood shutline) to 1 (nose tip)
      const v = pz / halfNW; // -1 to +1

      // Forward downward rake: 0 at hood shutline (u = 0), dropping 0.08m at nose tip (u = 1)
      const forwardRake = -Math.pow(u, 1.2) * 0.080;

      // Central aerodynamic prow spine: sharp ridge in center that peaks near nose tip
      const prowSpine = Math.exp(-Math.pow(v * 4.5, 2)) * (0.020 + u * 0.015);

      // Transverse convex roll: drops 0.025m at outer edges joining headlights/cheeks
      const crownRoll = -Math.pow(v, 2) * 0.020 - Math.pow(v, 4) * 0.008;

      // Forward sweep: plan-view prow points forward at center
      posN.setY(i, forwardRake + prowSpine + crownRoll);
      posN.setX(i, px + (1.0 - v * v) * 0.025 * u);
    }
    noseGeo.computeVertexNormals();

    const noseCone = new THREE.Mesh(noseGeo, paintMat);
    noseCone.position.set((hoodLeadingX + frontNoseX) / 2, 0.535, 0);
    noseCone.castShadow = true;
    noseCone.receiveShadow = true;
    group.add(noseCone);

    // ═══════════════════════════════════════════════════════════════════
    // 2. SCULPTED 3D BUMPER CHEEKS & CORNER WRAPS (Left & Right)
    //    Continuous 3D compound-curved surface wrapping from nose apex
    //    around the front corner and joining the front fender leading edge
    // ═══════════════════════════════════════════════════════════════════
    const createCheekGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const cheekSpanX = frontNoseX - frontAxleX + 0.12; // ~1.00m
      const cheekHeight = 0.38;
      const geo = new THREE.PlaneGeometry(cheekSpanX, cheekHeight, 64, 40);
      geo.rotateY(Math.PI / 2);
      const posC = geo.attributes.position;

      for (let i = 0; i < posC.count; i++) {
        const pz = posC.getZ(i); // along vehicle length
        const py = posC.getY(i); // height
        const u = (pz + cheekSpanX / 2) / cheekSpanX; // 0 = front/nose tip to 1 = rear/wheel arch
        const h = (py + cheekHeight / 2) / cheekHeight; // 0 = bottom/splitter to 1 = top/fender

        // Progressive outward flare from nose width (0.62m) to outer flare width (0.98m)
        const flareWidth = Math.sin(u * (Math.PI / 2.0)) * (frontWidthM / 2 - 0.62);

        // Convex pillow bulge in mid-height
        const pillow = Math.sin(h * Math.PI) * 0.028 * (0.6 + u * 0.4);

        // Tumblehome inward curve at top edge joining fender
        const topRoll = -Math.pow(h, 2.2) * 0.015;

        // Front corner inward wrap toward radiator mouth
        const frontWrap = (1.0 - u) * (1.0 - h) * 0.035;

        posC.setX(i, (isLeft ? -1 : 1) * (flareWidth + pillow + topRoll - frontWrap));
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Left Bumper Cheek
    const cheekLGeo = createCheekGeo(true);
    const cheekL = new THREE.Mesh(cheekLGeo, paintMat);
    cheekL.position.set((frontNoseX + frontAxleX - 0.12) / 2, 0.34, -0.62);
    cheekL.castShadow = true;
    cheekL.receiveShadow = true;

    // Right Bumper Cheek
    const cheekRGeo = createCheekGeo(false);
    const cheekR = new THREE.Mesh(cheekRGeo, paintMat);
    cheekR.position.set((frontNoseX + frontAxleX - 0.12) / 2, 0.34, 0.62);
    cheekR.castShadow = true;
    cheekR.receiveShadow = true;

    group.add(cheekL, cheekR);

    // ═══════════════════════════════════════════════════════════════════
    // 3. FRONT NOSE BADGE & BRAND CREST PLAQUE
    // ═══════════════════════════════════════════════════════════════════
    const badgeGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.006, 24);
    badgeGeo.rotateX(Math.PI / 2);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.1,
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(frontNoseX - 0.04, 0.485, 0);
    badge.rotation.x = -0.32;
    group.add(badge);

    // ═══════════════════════════════════════════════════════════════════
    // 4. DEEP RECESSED CENTRAL RADIATOR AIR DAM & HONEYCOMB GRILLE
    // ═══════════════════════════════════════════════════════════════════
    // Sculpted Air Dam Frame (Gloss Black Bezel)
    const damGeo = new THREE.BoxGeometry(0.18, 0.22, 0.94);
    const damFrame = new THREE.Mesh(damGeo, trimMat);
    damFrame.position.set(frontNoseX - 0.10, 0.26, 0);
    group.add(damFrame);

    // Hexagonal Mesh Grille — recessed inside the frame
    const hexGeo = new THREE.PlaneGeometry(0.88, 0.18, 12, 6);
    const hexMesh = new THREE.Mesh(hexGeo, grilleMat);
    hexMesh.position.set(frontNoseX - 0.08, 0.26, 0);
    hexMesh.rotation.y = Math.PI;
    group.add(hexMesh);

    // Dual High-Efficiency Aluminum Radiator Heat Exchangers
    const radGeo = new THREE.BoxGeometry(0.04, 0.20, 0.38);
    const radL = new THREE.Mesh(radGeo, strutMat);
    radL.position.set(frontNoseX - 0.20, 0.26, -0.22);
    radL.rotation.z = -0.35;

    const radR = new THREE.Mesh(radGeo, strutMat);
    radR.position.set(frontNoseX - 0.20, 0.26, 0.22);
    radR.rotation.z = -0.35;

    // Twin Electric Cooling Fan Shrouds
    const fanGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.025, 20);
    fanGeo.rotateZ(Math.PI / 2);
    const fanL = new THREE.Mesh(fanGeo, trimMat);
    fanL.position.set(frontNoseX - 0.24, 0.26, -0.22);

    const fanR = fanL.clone();
    fanR.position.z = 0.22;
    group.add(radL, radR, fanL, fanR);

    // 4b. ADAS Millimeter-Wave Radar & LiDAR Sensor Pod
    const radarGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.015, 24);
    radarGeo.rotateZ(Math.PI / 2);
    const radarMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      metalness: 0.98,
      roughness: 0.04,
    });
    const radarPod = new THREE.Mesh(radarGeo, radarMat);
    radarPod.position.set(frontNoseX - 0.07, 0.24, 0);
    group.add(radarPod);

    // 4c. Track-Day Aluminum Folding Tow Hook (Crimson Anodized)
    const towEyeGeo = new THREE.TorusGeometry(0.024, 0.006, 12, 24);
    const towMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.92,
      roughness: 0.18,
    });
    const towHook = new THREE.Mesh(towEyeGeo, towMat);
    towHook.position.set(frontNoseX - 0.05, 0.20, 0.32);
    towHook.rotation.y = Math.PI / 2;
    group.add(towHook);

    // 4d. Ultrasonic Parking Sensor Bezels (4 Array across bumper)
    const sensorBezelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 16);
    sensorBezelGeo.rotateZ(Math.PI / 2);
    const sensorPositions = [-0.52, -0.22, 0.22, 0.52];
    sensorPositions.forEach((spZ) => {
      const sensor = new THREE.Mesh(sensorBezelGeo, trimMat);
      sensor.position.set(frontNoseX - 0.07, 0.18, spZ);
      group.add(sensor);
    });

    // ═══════════════════════════════════════════════════════════════════
    // 5. SCULPTED BRAKE COOLING NACA INTAKE DUCTS
    // ═══════════════════════════════════════════════════════════════════
    const ductGeo = new THREE.BoxGeometry(0.18, 0.12, 0.20);
    const ductL = new THREE.Mesh(ductGeo, trimMat);
    ductL.position.set(frontNoseX - 0.08, 0.24, -0.68);
    ductL.rotation.y = 0.22;

    const ductR = new THREE.Mesh(ductGeo, trimMat);
    ductR.position.set(frontNoseX - 0.08, 0.24, 0.68);
    ductR.rotation.y = -0.22;

    // Internal Carbon Turning Vane Arrays (3 per duct)
    const vaneGeo = new THREE.BoxGeometry(0.14, 0.006, 0.005);
    for (let vn = 0; vn < 3; vn++) {
      const zSpread = (vn - 1) * 0.035;
      const vL = new THREE.Mesh(vaneGeo, carbonMat);
      vL.position.set(frontNoseX - 0.08, 0.22 + vn * 0.016, -0.68 + zSpread);
      vL.rotation.y = 0.22;

      const vR = new THREE.Mesh(vaneGeo, carbonMat);
      vR.position.set(frontNoseX - 0.08, 0.22 + vn * 0.016, 0.68 - zSpread);
      vR.rotation.y = -0.22;
      group.add(vL, vR);
    }
    group.add(ductL, ductR);

    // ═══════════════════════════════════════════════════════════════════
    // 6. CONTOURED CARBON FIBER FRONT SPLITTER BLADE
    //    Contoured aerofoil-profile splitter spanning width of front end
    // ═══════════════════════════════════════════════════════════════════
    const splitterGeo = new THREE.BoxGeometry(0.48, 0.022, frontWidthM * 1.02);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(frontNoseX - 0.08, 0.11, 0);
    splitter.castShadow = true;
    splitter.receiveShadow = true;
    group.add(splitter);

    // Central Aerodynamic Stagnation Keel
    const keelGeo = new THREE.BoxGeometry(0.28, 0.028, 0.04);
    const keel = new THREE.Mesh(keelGeo, carbonMat);
    keel.position.set(frontNoseX - 0.08, 0.125, 0);
    group.add(keel);

    // Endplate Vortex Fences (Left & Right)
    const fenceGeo = new THREE.BoxGeometry(0.38, 0.12, 0.018);
    const fenceL = new THREE.Mesh(fenceGeo, carbonMat);
    fenceL.position.set(frontNoseX - 0.08, 0.16, -(frontWidthM * 0.515));

    const fenceR = new THREE.Mesh(fenceGeo, carbonMat);
    fenceR.position.set(frontNoseX - 0.08, 0.16, frontWidthM * 0.515);
    group.add(fenceL, fenceR);

    // Titanium Turnbuckle Support Tie-Rods
    const tStrutGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 12);
    const tStrutL = new THREE.Mesh(tStrutGeo, strutMat);
    tStrutL.position.set(frontNoseX + 0.02, 0.20, -0.32);
    tStrutL.rotation.z = -0.55;

    const tStrutR = tStrutL.clone();
    tStrutR.position.z = 0.32;
    group.add(tStrutL, tStrutR);

    // ═══════════════════════════════════════════════════════════════════
    // 7. TIERED CARBON FIBER DIVE PLANES / CANARDS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const canardUpperGeo = new THREE.BoxGeometry(0.16, 0.012, 0.22);
    const canardUpL = new THREE.Mesh(canardUpperGeo, carbonMat);
    canardUpL.position.set(frontNoseX - 0.12, 0.32, -(frontWidthM * 0.46));
    canardUpL.rotation.x = 0.26;
    canardUpL.rotation.z = -0.06;

    const canardUpR = canardUpL.clone();
    canardUpR.position.z = frontWidthM * 0.46;
    canardUpR.rotation.x = -0.26;

    const canardLowerGeo = new THREE.BoxGeometry(0.18, 0.012, 0.24);
    const canardLowL = new THREE.Mesh(canardLowerGeo, carbonMat);
    canardLowL.position.set(frontNoseX - 0.06, 0.22, -(frontWidthM * 0.47));
    canardLowL.rotation.x = 0.22;
    canardLowL.rotation.z = -0.05;

    const canardLowR = canardLowL.clone();
    canardLowR.position.z = frontWidthM * 0.47;
    canardLowR.rotation.x = -0.22;

    group.add(canardUpL, canardUpR, canardLowL, canardLowR);
    return group;
  }

  // ==========================================================================
  // BLOCK 04: PRODUCTION-GRADE ARTICULATED SCULPTED HOOD, S-DUCT EXTRACTORS,
  //           HYDRAULIC STRUTS & STRUCTURAL SKELETON
  // ==========================================================================
  // Design: Precision 3D volumetric stamped clamshell hood.
  // Spans X in [hoodRearX, hoodLeadingX] = [0.37m, 1.13m] and Z in [-0.62m, +0.62m].
  // Cowl height at X = 0.37m is Y = 0.68m; front leading edge at X = 1.13m is Y = 0.54m.
  // Power dome rises +45mm in center. Precision boundary matching with fenders/bumper.
  // ==========================================================================
  public static buildBlock04SculptedHoodAndSDuct(
    frontAxleX: number,
    frontNoseX: number,
    halfTfM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    gasketMat: THREE.Material,
    strutMat: THREE.Material,
    trimMat: THREE.Material,
    meshMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block04_ProductionSculptedHood';

    const hoodLeadingX = frontAxleX + 0.68; // 1.13m
    const hoodRearX = frontAxleX - 0.08; // 0.37m
    const hoodLength = hoodLeadingX - hoodRearX; // 0.76m
    const hoodWidth = 1.24; // 1,240mm total hood width
    const halfW = hoodWidth / 2; // 0.62m
    const halfL = hoodLength / 2; // 0.38m
    const hoodAngle = (articulation.hoodOpenProgress || 0) * (Math.PI / 3.6);

    // ═══════════════════════════════════════════════════════════════════
    // 1. ARTICULATED FORWARD HOOD PIVOT ASSEMBLY
    // ═══════════════════════════════════════════════════════════════════
    const hoodPivot = new THREE.Group();
    hoodPivot.position.set(hoodRearX, 0.68, 0);
    hoodPivot.rotation.z = hoodAngle;

    // ── 1a. High-Density Parametric G2 Curvature Stamped Hood Loft (80 x 60 Grid) ──
    const hoodGeo = new THREE.PlaneGeometry(hoodLength, hoodWidth, 80, 60);
    hoodGeo.rotateX(-Math.PI / 2);
    const pos = hoodGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i); // [-halfL, +halfL]
      const pz = pos.getZ(i); // [-halfW, +halfW]
      const u = (px + halfL) / hoodLength; // 0 (cowl) to 1 (front nose shutline)
      const v = pz / halfW; // -1 to +1

      // Forward baseline rake: drops 0.145m from cowl to front shutline (0.68m -> 0.535m)
      const forwardRake = -Math.pow(u, 1.1) * 0.135 - Math.pow(u, 2.4) * 0.010;

      // Muscular central power dome: Gaussian crest rising +0.042m, peaking at u = 0.55
      const domePeak = Math.exp(-Math.pow((u - 0.55) * 2.2, 2));
      const centerDome = Math.exp(-Math.pow(v * 2.8, 2)) * 0.042 * domePeak;

      // Full-length aerodynamic spine ridge running along Z = 0
      const spineRidge = Math.exp(-Math.pow(v * 7.0, 2)) * 0.016 * (0.5 + u * 0.5);

      // Dual muscle crest ridges at v = ±0.32
      const muscleL = Math.exp(-Math.pow((v + 0.32) * 9.0, 2)) * 0.015 * (0.4 + u * 0.6);
      const muscleR = Math.exp(-Math.pow((v - 0.32) * 9.0, 2)) * 0.015 * (0.4 + u * 0.6);

      // Transverse curvature: rolls smoothly down to meet the fender flange at v = ±1
      const sideDrop = -Math.pow(v, 2) * 0.016 - Math.pow(v, 4) * 0.008;

      pos.setY(i, forwardRake + centerDome + spineRidge + muscleL + muscleR + sideDrop);
    }
    hoodGeo.computeVertexNormals();

    const hoodSkin = new THREE.Mesh(hoodGeo, paintMat);
    hoodSkin.position.set(halfL, 0, 0);
    hoodSkin.castShadow = true;
    hoodSkin.receiveShadow = true;
    hoodPivot.add(hoodSkin);

    // ── 1b. Precision Perimeter Shutline Gaskets (Left, Right & Front) ──
    const shutLineGeo = new THREE.BoxGeometry(hoodLength * 0.98, 0.004, 0.004);
    const shutLineL = new THREE.Mesh(shutLineGeo, gasketMat);
    shutLineL.position.set(halfL, -0.005, -halfW);

    const shutLineR = shutLineL.clone();
    shutLineR.position.z = halfW;
    hoodPivot.add(shutLineL, shutLineR);

    // ── 1c. Hood Underside Carbon Stiffener Panel ──
    const undersideGeo = new THREE.PlaneGeometry(hoodLength * 0.94, hoodWidth * 0.90, 8, 6);
    undersideGeo.rotateX(Math.PI / 2);
    const underside = new THREE.Mesh(undersideGeo, carbonMat);
    underside.position.set(halfL, -0.010, 0);
    hoodPivot.add(underside);

    // ═══════════════════════════════════════════════════════════════════
    // 2. DUAL RECESSED S-DUCT HEAT EXTRACTOR CHANNELS WITH TURNING VANES
    // ═══════════════════════════════════════════════════════════════════
    const nostrilWidth = 0.18;
    const nostrilLength = 0.28;
    const nostrilGeo = new THREE.BoxGeometry(nostrilLength, 0.025, nostrilWidth);

    const nostrilL = new THREE.Mesh(nostrilGeo, carbonMat);
    nostrilL.position.set(halfL * 1.1, -0.06, -0.28);
    nostrilL.rotation.z = -0.15;

    const nostrilR = new THREE.Mesh(nostrilGeo, carbonMat);
    nostrilR.position.set(halfL * 1.1, -0.06, 0.28);
    nostrilR.rotation.z = -0.15;
    hoodPivot.add(nostrilL, nostrilR);

    // Directional Turning Vane Arrays (3 per nostril)
    const vaneGeo = new THREE.BoxGeometry(0.12, 0.008, 0.006);
    for (let vn = 0; vn < 3; vn++) {
      const zOffset = -0.28 + (vn - 1) * 0.045;
      const vL = new THREE.Mesh(vaneGeo, carbonMat);
      vL.position.set(halfL * 1.1, -0.05, zOffset);
      vL.rotation.y = 0.18;
      hoodPivot.add(vL);

      const vR = new THREE.Mesh(vaneGeo, carbonMat);
      vR.position.set(halfL * 1.1, -0.05, -zOffset);
      vR.rotation.y = -0.18;
      hoodPivot.add(vR);
    }

    // Underside Carbon X-Brace Skeleton
    const xBraceGeo = new THREE.BoxGeometry(hoodLength * 0.88, 0.010, 0.030);
    const brace1 = new THREE.Mesh(xBraceGeo, carbonMat);
    brace1.position.set(halfL, -0.018, 0);
    brace1.rotation.y = 0.42;

    const brace2 = new THREE.Mesh(xBraceGeo, carbonMat);
    brace2.position.set(halfL, -0.018, 0);
    brace2.rotation.y = -0.42;
    hoodPivot.add(brace1, brace2);

    // Flush AeroCatch Hood Pins
    const aeroCatchGeo = new THREE.BoxGeometry(0.055, 0.004, 0.022);
    const latchL = new THREE.Mesh(aeroCatchGeo, trimMat);
    latchL.position.set(hoodLength * 0.88, -0.12, -0.42);

    const latchR = latchL.clone();
    latchR.position.z = 0.42;
    hoodPivot.add(latchL, latchR);

    // Billet Aluminum Hinge Arms
    const hingeGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.07, 16);
    const hingeL = new THREE.Mesh(hingeGeo, strutMat);
    hingeL.position.set(0, 0, -hoodWidth * 0.36);

    const hingeR = hingeL.clone();
    hingeR.position.z = hoodWidth * 0.36;
    hoodPivot.add(hingeL, hingeR);

    group.add(hoodPivot);

    // ═══════════════════════════════════════════════════════════════════
    // 3. HYDRAULIC GAS LIFT STRUTS
    // ═══════════════════════════════════════════════════════════════════
    const cylinderGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.18, 16);
    const pistonGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.20, 16);

    const strutLGroup = new THREE.Group();
    strutLGroup.position.set(frontAxleX + 0.10, 0.52, -halfW * 0.88);
    strutLGroup.rotation.z = 0.30 + hoodAngle * 0.4;

    const cylL = new THREE.Mesh(cylinderGeo, gasketMat);
    cylL.position.y = 0.09;
    const pisL = new THREE.Mesh(pistonGeo, strutMat);
    pisL.position.y = 0.20;
    strutLGroup.add(cylL, pisL);

    const strutRGroup = strutLGroup.clone();
    strutRGroup.position.z = halfW * 0.88;
    group.add(strutLGroup, strutRGroup);

    // ═══════════════════════════════════════════════════════════════════
    // 4. INTEGRATED WINDSHIELD COWL PANEL & WASHER JETS
    // ═══════════════════════════════════════════════════════════════════
    const cowlGeo = new THREE.BoxGeometry(0.12, 0.020, hoodWidth * 0.94);
    const cowl = new THREE.Mesh(cowlGeo, carbonMat);
    cowl.position.set(hoodRearX - 0.04, 0.685, 0);

    const washerGeo = new THREE.BoxGeometry(0.010, 0.005, 0.010);
    const washL = new THREE.Mesh(washerGeo, trimMat);
    washL.position.set(hoodRearX - 0.02, 0.695, -0.30);

    const washR = washL.clone();
    washR.position.z = 0.30;

    group.add(cowl, washL, washR);
    return group;
  }

  // ==========================================================================
  // BLOCK 05: PHASE 6 — PRODUCTION-GRADE 3D VOLUMETRIC FRONT FENDERS,
  //           HEADLIGHT POD BUCKETS, ARCH FLARES & PRESSURE LOUVERS
  // ==========================================================================
  // Design: Precision continuous 3D volumetric front fender panels (Left & Right).
  // Inner boundary welds along the hood shutline (Z = ±0.62m) with zero gap.
  // The muscular fender crown crests 60mm above the hood line at X = frontAxleX
  // (Y = 0.72m, Z = ±0.82m), wraps down around the front wheel opening to the outer
  // wheel arch flare (Z = ±0.98m, Y = 0.44m), and connects seamlessly to the front
  // bumper cheeks at X = 1.13m (Y = 0.53m).
  // ==========================================================================
  private static buildPhase6FrontFenders(
    frontAxleX: number,
    halfTfM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    trimMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block05_Phase6VolumetricFrontFenders';

    const fenderInnerZ = 0.62; // Hood shutline boundary (1,240mm hood width)
    const fenderArchZ = halfTfM + 0.14; // ~0.98m (1,960mm front width over wheel flares)
    const fenderFrontX = frontAxleX + 0.68; // 1.13m (Bumper splitline)
    const fenderRearX = frontAxleX - 0.28; // 0.17m (Door shutline / A-pillar base)
    const fenderLength = fenderFrontX - fenderRearX; // 0.96m
    const crownWidth = fenderArchZ - fenderInnerZ; // 0.36m

    // ═══════════════════════════════════════════════════════════════════
    // 1. CONTINUOUS 3D LOFTED FENDER CROWNS (Left & Right)
    //    32x20 high-density parametric grid creating Class-A curvature
    // ═══════════════════════════════════════════════════════════════════
    const createFenderCrownGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(fenderLength, crownWidth, 64, 48);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); // [-fenderLength/2, +fenderLength/2]
        const pz = pos.getZ(i); // [-crownWidth/2, +crownWidth/2]
        const u = (px + fenderLength / 2) / fenderLength; // 0 (rear/door) to 1 (front/bumper)
        const w = (pz + crownWidth / 2) / crownWidth; // 0 (inner hood shutline) to 1 (outer flare)

        // Rear: X = 0.17m -> Front: X = 1.13m
        // Baseline forward slope: matches hood edge height (0.68m at rear -> 0.535m at front)
        const forwardSlope = -Math.pow(u, 1.1) * 0.145;

        // Front axle center in local U coordinates (X = 0.45m -> u = (0.45 - 0.17) / 0.96 = 0.29)
        const axleU = (frontAxleX - fenderRearX) / fenderLength;
        const distFromAxle = (u - axleU);

        // Muscular wheel arch peak: rises +0.055m directly above front wheel
        const wheelArchPeak = Math.exp(-Math.pow(distFromAxle * 3.2, 2)) * 0.055 * Math.sin(w * Math.PI);

        // Transverse shoulder swelling: peaks at w = 0.55
        const shoulderCrest = Math.sin(w * Math.PI) * 0.032;

        // Downward roll to outer wheel flare
        const flareDrop = -Math.pow(w, 2.2) * 0.040;

        pos.setY(i, forwardSlope + wheelArchPeak + shoulderCrest + flareDrop);

        // Plan-view widebody swell at wheel center
        const wheelSwell = Math.exp(-Math.pow(distFromAxle * 3.2, 2)) * 0.025 * w;
        pos.setZ(i, pz + (isLeft ? -wheelSwell : wheelSwell));
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Left Fender Crown
    const crownLGeo = createFenderCrownGeo(true);
    const crownL = new THREE.Mesh(crownLGeo, paintMat);
    crownL.position.set((fenderFrontX + fenderRearX) / 2, 0.68, -(fenderInnerZ + crownWidth / 2));
    crownL.castShadow = true;
    crownL.receiveShadow = true;

    // Right Fender Crown
    const crownRGeo = createFenderCrownGeo(false);
    const crownR = new THREE.Mesh(crownRGeo, paintMat);
    crownR.position.set((fenderFrontX + fenderRearX) / 2, 0.68, fenderInnerZ + crownWidth / 2);
    crownR.castShadow = true;
    crownR.receiveShadow = true;

    group.add(crownL, crownR);

    // ═══════════════════════════════════════════════════════════════════
    // 2. SCULPTED OUTER WHEEL ARCH FLARE FLANKS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const createOuterFlankGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const archSpan = fenderLength * 1.02;
      const flankHeight = 0.44;
      const geo = new THREE.PlaneGeometry(archSpan, flankHeight, 60, 40);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); // along vehicle length
        const py = pos.getY(i); // height
        const u = (pz + archSpan / 2) / archSpan;
        const h = (py + flankHeight / 2) / flankHeight;

        // Distance from front wheel center
        const xFromAxle = pz - (fenderLength * 0.5 - (fenderFrontX - frontAxleX));
        const rad = Math.sqrt(xFromAxle * xFromAxle + py * py);

        const wheelArchRadius = 0.43;
        const archProximity = Math.max(0, 1.0 - Math.abs(rad - wheelArchRadius) * 4.0);

        const flareBulge = archProximity * 0.030 * h;
        const topRoll = Math.pow(h, 2.2) * 0.024;
        const rockerTuck = (1.0 - h) * u * 0.015;

        pos.setX(i, (isLeft ? 1 : -1) * (flareBulge - topRoll - rockerTuck));
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Left Outer Flank
    const flankLGeo = createOuterFlankGeo(true);
    const flankL = new THREE.Mesh(flankLGeo, paintMat);
    flankL.position.set((fenderFrontX + fenderRearX) / 2, 0.44, -fenderArchZ);
    flankL.castShadow = true;

    // Right Outer Flank
    const flankRGeo = createOuterFlankGeo(false);
    const flankR = new THREE.Mesh(flankRGeo, paintMat);
    flankR.position.set((fenderFrontX + fenderRearX) / 2, 0.44, fenderArchZ);
    flankR.castShadow = true;

    group.add(flankL, flankR);

    // ═══════════════════════════════════════════════════════════════════
    // 3. ROLLED WHEEL ARCH LIP RIMS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const archRadius = 0.435;
    const archRimGeo = new THREE.TorusGeometry(archRadius, 0.016, 16, 32, Math.PI);
    archRimGeo.rotateY(Math.PI / 2);
    archRimGeo.rotateZ(Math.PI);

    const archRimL = new THREE.Mesh(archRimGeo, paintMat);
    archRimL.position.set(frontAxleX, 0.44, -fenderArchZ - 0.01);
    archRimL.castShadow = true;

    const archRimR = new THREE.Mesh(archRimGeo.clone(), paintMat);
    archRimR.position.set(frontAxleX, 0.44, fenderArchZ + 0.01);
    archRimR.castShadow = true;

    group.add(archRimL, archRimR);

    // ═══════════════════════════════════════════════════════════════════
    // 4. CARBON FIBER TOP PRESSURE RELIEF CHIMNEY LOUVERS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const louverTroughGeo = new THREE.BoxGeometry(0.34, 0.010, 0.12);
    const louverTroughL = new THREE.Mesh(louverTroughGeo, carbonMat);
    louverTroughL.position.set(frontAxleX + 0.02, 0.70, -(fenderInnerZ + crownWidth * 0.55));
    louverTroughL.rotation.z = -0.06;

    const louverTroughR = louverTroughL.clone();
    louverTroughR.position.z = fenderInnerZ + crownWidth * 0.55;
    group.add(louverTroughL, louverTroughR);

    const louverGeo = new THREE.BoxGeometry(0.040, 0.006, 0.10);
    for (let k = 0; k < 5; k++) {
      const xOffset = frontAxleX + (k - 2) * 0.058;
      const yOffset = 0.706 + Math.cos((k - 2) * 0.4) * 0.010;

      const louverL = new THREE.Mesh(louverGeo, carbonMat);
      louverL.position.set(xOffset, yOffset, -(fenderInnerZ + crownWidth * 0.55));
      louverL.rotation.z = -0.30;

      const louverR = new THREE.Mesh(louverGeo, carbonMat);
      louverR.position.set(xOffset, yOffset, fenderInnerZ + crownWidth * 0.55);
      louverR.rotation.z = -0.30;

      group.add(louverL, louverR);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. INNER COMPOSITE WHEEL WELL SPLASH LINERS (Full Tub Enclosure)
    // ═══════════════════════════════════════════════════════════════════
    const linerGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.36, 32, 1, true, 0, Math.PI);
    linerGeo.rotateX(Math.PI / 2);
    linerGeo.rotateZ(Math.PI);

    const linerL = new THREE.Mesh(linerGeo, trimMat);
    linerL.position.set(frontAxleX, 0.43, -(fenderArchZ - 0.12));

    const linerR = linerL.clone();
    linerR.position.z = fenderArchZ - 0.12;

    group.add(linerL, linerR);
    return group;
  }

  // ==========================================================================
  // BLOCK 06: PHASE 25 — PRODUCTION-GRADE SCULPTED DIHEDRAL DOORS,
  //           COKE-BOTTLE WAISTLINE, INTERCOOLER DUCTS & CARBON ROCKERS
  // ==========================================================================
  // Design: Replaces flat box doors with 3D sculpted lofted door skins featuring
  // authentic Coke-bottle tumblehome inward curvature, shoulder character lines,
  // deeply carved sidepod radiator channels, and continuous carbon rocker skirts.
  // ==========================================================================
  private static buildPhase25DoorsUndercutsAndIntercoolers(
    frontAxleX: number,
    rearAxleX: number,
    halfTfM: number,
    halfTrM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    trimMat: THREE.Material,
    gasketMat: THREE.Material,
    hingeMat: THREE.Material,
    handleLedMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block06_Phase25ProductionSculptedDoorsAndRockers';

    const cabinLength = Math.abs(frontAxleX - rearAxleX);
    const doorLength = cabinLength * 0.74;
    const doorHeight = 0.48;
    const doorCenterX = (frontAxleX + rearAxleX) / 2 + 0.06;
    const waistlineZ = 0.86; // 1,720mm coke-bottle inward waistline tuck

    // ═══════════════════════════════════════════════════════════════════
    // 1. FULL-LENGTH SCULPTED CARBON FIBER ROCKER SKIRTS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const skirtGeo = new THREE.BoxGeometry(cabinLength * 1.10, 0.035, 0.16);
    const skirtL = new THREE.Mesh(skirtGeo, carbonMat);
    skirtL.position.set(doorCenterX - 0.04, 0.135, -0.94);
    skirtL.castShadow = true;

    const skirtR = skirtL.clone();
    skirtR.position.z = 0.94;
    group.add(skirtL, skirtR);

    // Forward Aerodynamic Vortex Guide Fins
    const finGeo = new THREE.BoxGeometry(0.20, 0.09, 0.012);
    const finL = new THREE.Mesh(finGeo, carbonMat);
    finL.position.set(frontAxleX - 0.32, 0.17, -1.00);
    finL.rotation.y = 0.16;

    const finR = finL.clone();
    finR.position.z = 1.00;
    finR.rotation.y = -0.16;
    group.add(finL, finR);

    // ═══════════════════════════════════════════════════════════════════
    // 2. SCULPTED DIHEDRAL BUTTERFLY DOORS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const createDoorSkinGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(doorLength, doorHeight, 24, 16);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i);
        const py = pos.getY(i);
        const u = (pz + doorLength / 2) / doorLength;
        const h = (py + doorHeight / 2) / doorHeight;

        const waistTuck = Math.sin(u * Math.PI) * 0.045;
        const tumblehome = Math.sin(h * Math.PI) * 0.032 - Math.pow(h, 2.5) * 0.020;
        const shoulderCrease = Math.exp(-Math.pow((h - 0.85) * 8.0, 2)) * 0.015;
        const scoopFactor = u > 0.4 ? Math.sin((u - 0.4) / 0.6 * Math.PI) : 0;
        const intakeScoop = -scoopFactor * (1.0 - h) * 0.042;

        pos.setX(i, (isLeft ? -1 : 1) * (waistTuck + tumblehome + shoulderCrease + intakeScoop));
      }
      geo.computeVertexNormals();
      return geo;
    };

    const doorAngle = (articulation.doorOpenProgress || 0) * (Math.PI / 3.2);

    // Left Door
    const doorPivotL = new THREE.Group();
    doorPivotL.position.set(frontAxleX - 0.12, 0.68, -waistlineZ);
    doorPivotL.rotation.z = -doorAngle * 0.7;
    doorPivotL.rotation.y = -doorAngle * 0.7;

    const doorSkinLGeo = createDoorSkinGeo(true);
    const doorSkinL = new THREE.Mesh(doorSkinLGeo, paintMat);
    doorSkinL.position.set(-doorLength / 2, -0.16, 0);
    doorSkinL.castShadow = true;
    doorSkinL.receiveShadow = true;

    const hingeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.08, 16);
    const hingeL = new THREE.Mesh(hingeGeo, hingeMat);
    doorPivotL.add(hingeL);

    const handleGeo = new THREE.BoxGeometry(0.075, 0.016, 0.005);
    const handleL = new THREE.Mesh(handleGeo, handleLedMat);
    handleL.position.set(-doorLength * 0.72, 0.015, -0.038);
    doorSkinL.add(handleL);

    const gasketGeo = new THREE.BoxGeometry(doorLength * 1.01, doorHeight * 1.01, 0.008);
    const gasketL = new THREE.Mesh(gasketGeo, gasketMat);
    gasketL.position.set(-doorLength / 2, -0.16, 0.032);
    doorPivotL.add(doorSkinL, gasketL);

    // Right Door
    const doorPivotR = new THREE.Group();
    doorPivotR.position.set(frontAxleX - 0.12, 0.68, waistlineZ);
    doorPivotR.rotation.z = doorAngle * 0.7;
    doorPivotR.rotation.y = -doorAngle * 0.7;

    const doorSkinRGeo = createDoorSkinGeo(false);
    const doorSkinR = new THREE.Mesh(doorSkinRGeo, paintMat);
    doorSkinR.position.set(-doorLength / 2, -0.16, 0);
    doorSkinR.castShadow = true;
    doorSkinR.receiveShadow = true;

    const hingeR = hingeL.clone();
    doorPivotR.add(hingeR);

    const handleR = handleL.clone();
    handleR.position.z = 0.038;
    doorSkinR.add(handleR);

    const gasketR = gasketL.clone();
    gasketR.position.z = -0.032;
    doorPivotR.add(doorSkinR, gasketR);

    group.add(doorPivotL, doorPivotR);

    // ═══════════════════════════════════════════════════════════════════
    // 3. SIDE AIRPOD CHARGE-AIR INTERCOOLER RADIATOR CORES
    // ═══════════════════════════════════════════════════════════════════
    const icGeo = new THREE.BoxGeometry(0.24, 0.20, 0.06);
    const icL = new THREE.Mesh(icGeo, hingeMat);
    icL.position.set(rearAxleX + 0.50, 0.44, -0.86);
    icL.rotation.y = 0.24;

    const icR = icL.clone();
    icR.position.z = 0.86;
    icR.rotation.y = -0.24;
    group.add(icL, icR);

    // Slotted Thermal Extraction Gills
    const gillGeo = new THREE.BoxGeometry(0.075, 0.007, 0.05);
    for (let g = 0; g < 4; g++) {
      const gX = rearAxleX + 0.36 + g * 0.065;
      const gY = 0.60 + g * 0.014;

      const gillL = new THREE.Mesh(gillGeo, carbonMat);
      gillL.position.set(gX, gY, -0.90);
      gillL.rotation.z = -0.22;

      const gillR = new THREE.Mesh(gillGeo, carbonMat);
      gillR.position.set(gX, gY, 0.90);
      gillR.rotation.z = -0.22;

      group.add(gillL, gillR);
    }

    return group;
  }

  // ==========================================================================
  // BLOCK 07: PHASE 20 — PRODUCTION-GRADE GREENHOUSE, A-PILLARS, C-PILLARS &
  //           AERODYNAMIC FLOW-THROUGH WING-STALK MIRRORS
  // ==========================================================================
  private static buildPhase20GreenhouseAndAeroMirrors(
    frontAxleX: number,
    rearAxleX: number,
    halfTfM: number,
    cockpitWidthM: number,
    paintMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    amberMat: THREE.Material,
    haloMat: THREE.Material,
    mirrorGlassMat: THREE.Material,
    carbonMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block07_Phase20ProductionGreenhouseAndMirrors';

    const halfCockpitZ = cockpitWidthM / 2; // ~0.62m
    const cabinCenterX = (frontAxleX + rearAxleX) / 2;

    // 1. Sculpted Curved A-Pillars & Roof Cantrail Rails (Left & Right)
    //    Replaces box geometry with smooth catenary-arc TubeGeometry
    const aPillarCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(frontAxleX - 0.12, 0.68, -halfCockpitZ * 0.94),
      new THREE.Vector3(frontAxleX - 0.22, 0.82, -halfCockpitZ * 0.96),
      new THREE.Vector3(frontAxleX - 0.34, 0.98, -halfCockpitZ * 0.97),
      new THREE.Vector3(frontAxleX - 0.46, 1.12, -halfCockpitZ * 0.96),
    ]);
    const aPillarGeoL = new THREE.TubeGeometry(aPillarCurveL, 24, 0.022, 12, false);
    const aPillarLMesh = new THREE.Mesh(aPillarGeoL, paintMat);
    aPillarLMesh.castShadow = true;
    group.add(aPillarLMesh);

    const aPillarCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(frontAxleX - 0.12, 0.68, halfCockpitZ * 0.94),
      new THREE.Vector3(frontAxleX - 0.22, 0.82, halfCockpitZ * 0.96),
      new THREE.Vector3(frontAxleX - 0.34, 0.98, halfCockpitZ * 0.97),
      new THREE.Vector3(frontAxleX - 0.46, 1.12, halfCockpitZ * 0.96),
    ]);
    const aPillarGeoR = new THREE.TubeGeometry(aPillarCurveR, 24, 0.022, 12, false);
    const aPillarRMesh = new THREE.Mesh(aPillarGeoR, paintMat);
    aPillarRMesh.castShadow = true;
    group.add(aPillarRMesh);

    // Windshield Header Crossbar (curved arc)
    const headerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(frontAxleX - 0.46, 1.12, -halfCockpitZ * 0.94),
      new THREE.Vector3(frontAxleX - 0.48, 1.145, 0),
      new THREE.Vector3(frontAxleX - 0.46, 1.12, halfCockpitZ * 0.94),
    ]);
    const headerGeo = new THREE.TubeGeometry(headerCurve, 20, 0.020, 10, false);
    const header = new THREE.Mesh(headerGeo, paintMat);
    header.castShadow = true;
    group.add(header);

    // Rear Header Crossbar (curved arc)
    const rearHeaderCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(rearAxleX + 0.14, 1.12, -halfCockpitZ * 0.94),
      new THREE.Vector3(rearAxleX + 0.12, 1.14, 0),
      new THREE.Vector3(rearAxleX + 0.14, 1.12, halfCockpitZ * 0.94),
    ]);
    const rearHeaderGeo = new THREE.TubeGeometry(rearHeaderCurve, 20, 0.018, 10, false);
    const rearHeader = new THREE.Mesh(rearHeaderGeo, paintMat);
    rearHeader.castShadow = true;
    group.add(rearHeader);

    // 2. Sculpted Curved C-Pillars (Left & Right) — flowing fastback profile
    const cPillarCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(rearAxleX + 0.14, 1.12, -halfCockpitZ * 0.95),
      new THREE.Vector3(rearAxleX + 0.24, 0.98, -halfCockpitZ * 0.97),
      new THREE.Vector3(rearAxleX + 0.38, 0.84, -halfCockpitZ * 0.99),
      new THREE.Vector3(rearAxleX + 0.52, 0.70, -halfCockpitZ * 1.0),
    ]);
    const cPillarGeoL = new THREE.TubeGeometry(cPillarCurveL, 24, 0.022, 12, false);
    const cPillarLMesh = new THREE.Mesh(cPillarGeoL, paintMat);
    cPillarLMesh.castShadow = true;
    group.add(cPillarLMesh);

    const cPillarCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(rearAxleX + 0.14, 1.12, halfCockpitZ * 0.95),
      new THREE.Vector3(rearAxleX + 0.24, 0.98, halfCockpitZ * 0.97),
      new THREE.Vector3(rearAxleX + 0.38, 0.84, halfCockpitZ * 0.99),
      new THREE.Vector3(rearAxleX + 0.52, 0.70, halfCockpitZ * 1.0),
    ]);
    const cPillarGeoR = new THREE.TubeGeometry(cPillarCurveR, 24, 0.022, 12, false);
    const cPillarRMesh = new THREE.Mesh(cPillarGeoR, paintMat);
    cPillarRMesh.castShadow = true;
    group.add(cPillarRMesh);

    // 2b. Windshield Glass Canopy (continuous tinted glass surface)
    const windshieldGeo = new THREE.PlaneGeometry(
      Math.hypot(0.34, 0.44), cockpitWidthM * 0.86, 16, 20
    );
    windshieldGeo.rotateY(Math.PI / 2);
    const windshieldPos = windshieldGeo.attributes.position;
    const windshieldHalfW = Math.max(cockpitWidthM * 0.43, 0.01);
    for (let i = 0; i < windshieldPos.count; i++) {
      const py = windshieldPos.getY(i);
      const pz = windshieldPos.getZ(i);
      const h = Math.min(Math.max((py + 0.22) / 0.44, 0), 1);
      const w = Math.min(Math.max(pz / windshieldHalfW, -1), 1);
      const curvature = Math.cos(w * Math.PI * 0.5) * 0.04 * Math.sin(h * Math.PI);
      if (isFinite(curvature)) {
        windshieldPos.setX(i, windshieldPos.getX(i) + curvature);
      }
    }
    windshieldGeo.computeBoundingSphere();
    windshieldGeo.computeVertexNormals();
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(frontAxleX - 0.29, 0.90, 0);
    windshield.rotation.z = 0.52;
    group.add(windshield);

    // 2c. Rear Glass Canopy
    const rearGlassGeo = new THREE.PlaneGeometry(
      Math.hypot(0.38, 0.42), cockpitWidthM * 0.82, 16, 16
    );
    rearGlassGeo.rotateY(Math.PI / 2);
    const rearGlassPos = rearGlassGeo.attributes.position;
    const rearGlassHalfW = Math.max(cockpitWidthM * 0.41, 0.01);
    for (let i = 0; i < rearGlassPos.count; i++) {
      const py = rearGlassPos.getY(i);
      const pz = rearGlassPos.getZ(i);
      const w = Math.min(Math.max(pz / rearGlassHalfW, -1), 1);
      const curvature = Math.cos(w * Math.PI * 0.5) * 0.03;
      if (isFinite(curvature)) {
        rearGlassPos.setX(i, rearGlassPos.getX(i) + curvature);
      }
    }
    rearGlassGeo.computeBoundingSphere();
    rearGlassGeo.computeVertexNormals();
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(rearAxleX + 0.33, 0.93, 0);
    rearGlass.rotation.z = -0.48;
    group.add(rearGlass);

    // 3. Grade-5 Titanium FIA Safety Halo Roll Hoop Structure
    const haloGeo = new THREE.TorusGeometry(0.52, 0.028, 16, 32, Math.PI);
    haloGeo.rotateZ(Math.PI);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set((frontAxleX + rearAxleX) / 2 + 0.04, 1.10, 0);
    group.add(halo);

    // 4. Flow-Through Aerodynamic Side Mirrors
    const mirrorCapGeo = new THREE.SphereGeometry(0.065, 16, 12);
    mirrorCapGeo.scale(1.8, 0.85, 1.0);
    const dualStalkGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.18, 12);
    const indicatorBladeGeo = new THREE.BoxGeometry(0.14, 0.008, 0.008);
    const mirrorGlassGeo = new THREE.BoxGeometry(0.008, 0.072, 0.12);
    const bsmTriangleGeo = new THREE.BoxGeometry(0.010, 0.015, 0.015);
    const surroundCamGeo = new THREE.SphereGeometry(0.012, 12, 12);
    const strakeGeo = new THREE.BoxGeometry(0.08, 0.006, 0.012);

    // Left Mirror Pod
    const mirrorLGroup = new THREE.Group();
    mirrorLGroup.position.set(frontAxleX - 0.06, 0.78, -halfCockpitZ - 0.14);

    const stalkL = new THREE.Mesh(dualStalkGeo, trimMat);
    stalkL.rotation.z = Math.PI / 3.8;
    stalkL.position.set(0, 0, -0.06);

    const capL = new THREE.Mesh(mirrorCapGeo, paintMat);
    capL.position.set(-0.02, 0.06, -0.12);

    const indicatorL = new THREE.Mesh(indicatorBladeGeo, amberMat);
    indicatorL.position.set(-0.02, 0.06, -0.19);

    const glassL = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    glassL.position.set(-0.02, 0.06, -0.05);

    const bsmL = new THREE.Mesh(bsmTriangleGeo, amberMat);
    bsmL.position.set(-0.022, 0.08, -0.09);

    const camPodL = new THREE.Mesh(surroundCamGeo, trimMat);
    camPodL.position.set(0, -0.02, -0.06);

    for (let k = 0; k < 3; k++) {
      const strake = new THREE.Mesh(strakeGeo, carbonMat);
      strake.position.set(-0.10, 0.03 + k * 0.025, -0.12);
      mirrorLGroup.add(strake);
    }

    mirrorLGroup.add(stalkL, capL, indicatorL, glassL, bsmL, camPodL);

    // Right Mirror Pod
    const mirrorRGroup = new THREE.Group();
    mirrorRGroup.position.set(frontAxleX - 0.06, 0.78, halfCockpitZ + 0.14);

    const stalkR = stalkL.clone();
    stalkR.position.set(0, 0, 0.06);

    const capR = new THREE.Mesh(mirrorCapGeo, paintMat);
    capR.position.set(-0.02, 0.06, 0.12);

    const indicatorR = new THREE.Mesh(indicatorBladeGeo, amberMat);
    indicatorR.position.set(-0.02, 0.06, 0.19);

    const glassR = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    glassR.position.set(-0.02, 0.06, 0.05);

    const bsmR = new THREE.Mesh(bsmTriangleGeo, amberMat);
    bsmR.position.set(-0.022, 0.08, 0.09);

    const camPodR = new THREE.Mesh(surroundCamGeo, trimMat);
    camPodR.position.set(0, -0.02, 0.06);

    for (let k = 0; k < 3; k++) {
      const strake = new THREE.Mesh(strakeGeo, carbonMat);
      strake.position.set(-0.10, 0.03 + k * 0.025, 0.12);
      mirrorRGroup.add(strake);
    }

    // 5. Articulated Aerodynamic Twin Windshield Wiper Assembly
    const cowlScreenGeo = new THREE.BoxGeometry(0.08, 0.015, cockpitWidthM * 0.96);
    const cowlScreen = new THREE.Mesh(cowlScreenGeo, trimMat);
    cowlScreen.position.set(frontAxleX - 0.08, 0.69, 0);
    group.add(cowlScreen);

    // Dual Washer Jet Nozzles
    [-0.24, 0.24].forEach((jetZ) => {
      const jetGeo = new THREE.BoxGeometry(0.012, 0.008, 0.012);
      const jet = new THREE.Mesh(jetGeo, trimMat);
      jet.position.set(frontAxleX - 0.06, 0.70, jetZ);
      group.add(jet);
    });

    // Driver-side Wiper Arm & Aero Blade
    const wiperArmGeo = new THREE.BoxGeometry(0.42, 0.008, 0.010);
    const wiperBladeGeo = new THREE.BoxGeometry(0.48, 0.006, 0.014);

    const wiperDriverGroup = new THREE.Group();
    wiperDriverGroup.position.set(frontAxleX - 0.14, 0.72, -0.22);
    wiperDriverGroup.rotation.z = -0.42;
    wiperDriverGroup.rotation.y = 0.12;

    const armD = new THREE.Mesh(wiperArmGeo, trimMat);
    armD.position.set(0.18, 0, 0);
    const bladeD = new THREE.Mesh(wiperBladeGeo, trimMat);
    bladeD.position.set(0.20, 0.005, 0);
    wiperDriverGroup.add(armD, bladeD);

    // Passenger-side Wiper Arm & Aero Blade
    const wiperPassGroup = new THREE.Group();
    wiperPassGroup.position.set(frontAxleX - 0.14, 0.72, 0.22);
    wiperPassGroup.rotation.z = -0.42;
    wiperPassGroup.rotation.y = -0.10;

    const armP = new THREE.Mesh(wiperArmGeo, trimMat);
    armP.position.set(0.18, 0, 0);
    const bladeP = new THREE.Mesh(wiperBladeGeo, trimMat);
    bladeP.position.set(0.20, 0.005, 0);
    wiperPassGroup.add(armP, bladeP);

    group.add(wiperDriverGroup, wiperPassGroup);
    group.add(mirrorLGroup, mirrorRGroup);
    return group;
  }

  // ==========================================================================
  // BLOCK 08: PHASE 17 ROOF SKIN, RAM-AIR SCOOP & 7 DELTA VORTEX GENERATORS
  // ==========================================================================
  private static buildPhase17RoofSkinAndRamAirScoop(
    frontAxleX: number,
    rearAxleX: number,
    cockpitWidthM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    grilleMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block08_Phase17RoofSkinAndRamAirScoop';

    const cabinCenterX = (frontAxleX + rearAxleX) / 2;
    const roofLength = Math.abs(frontAxleX - rearAxleX) * 0.58;
    const roofWidth = cockpitWidthM * 0.94; // ~1.16m

    // 1. Double-Bubble Continuous Camber Roof Loft (24 x 16 Grid)
    const roofGeo = new THREE.PlaneGeometry(roofLength, roofWidth, 24, 16);
    roofGeo.rotateX(-Math.PI / 2);

    const pos = roofGeo.attributes.position;
    const halfW = roofWidth / 2;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const v = z / halfW;
      const doubleBubble = Math.sin(Math.abs(v) * Math.PI) * 0.038 - Math.exp(-Math.pow(v * 4.0, 2)) * 0.015;
      pos.setY(i, doubleBubble);
    }
    roofGeo.computeVertexNormals();

    const roof = new THREE.Mesh(roofGeo, paintMat);
    roof.position.set(cabinCenterX - 0.04, 1.14, 0);
    roof.castShadow = true;
    group.add(roof);

    // 2. Central Dorsal Ram-Air Engine Induction Roof Scoop (Width = 0.28m)
    const scoopGroup = new THREE.Group();
    const scoopBodyGeo = new THREE.BoxGeometry(roofLength * 0.72, 0.08, 0.28);
    const scoopBody = new THREE.Mesh(scoopBodyGeo, carbonMat);
    scoopBody.position.set(cabinCenterX - 0.08, 1.18, 0);

    // Forward Ram-Air Inlet Mouth with Honeycomb Mesh
    const scoopMouthGeo = new THREE.BoxGeometry(0.04, 0.06, 0.24);
    const scoopMouth = new THREE.Mesh(scoopMouthGeo, grilleMat);
    scoopMouth.position.set(cabinCenterX + roofLength * 0.26, 1.18, 0);

    scoopGroup.add(scoopBody, scoopMouth);
    group.add(scoopGroup);

    // 3. 7-Tier Delta-Profile Vortex Generator Fins (Span across roof trailing edge)
    const finGeo = new THREE.BoxGeometry(0.12, 0.024, 0.008);
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Leave central clearance for ram-air scoop
      const fin = new THREE.Mesh(finGeo, carbonMat);
      fin.position.set(cabinCenterX - 0.32, 1.155, i * 0.12);
      fin.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.12;
      group.add(fin);
    }

    // 4. Aerodynamic Shark-Fin Radio / GPS Antenna Module
    const sharkFinGeo = new THREE.ConeGeometry(0.025, 0.075, 16);
    sharkFinGeo.rotateX(Math.PI / 2);
    sharkFinGeo.scale(0.35, 1.0, 1.8);
    const sharkFin = new THREE.Mesh(sharkFinGeo, carbonMat);
    sharkFin.position.set(cabinCenterX - 0.28, 1.165, 0);
    sharkFin.rotation.x = -0.15;
    group.add(sharkFin);

    return group;
  }

  // ==========================================================================
  // BLOCK 09: PHASE 6 — PRODUCTION-GRADE 3D VOLUMETRIC REAR HAUNCHES,
  //           WIDEBODY ARCH FLARES, NACA DUCTS & WAKE PRESSURE VENTS
  // ==========================================================================
  // Design: Replaces disconnected half-cylinders and box infills with full
  // 3D volumetric lofted rear quarter panels. The muscular haunch swells
  // 80mm above the beltline over the wide rear tires, and sweeps cleanly
  // from the door shutline into the rear bumper fascia.
  // ==========================================================================
  private static buildPhase6RearHaunches(
    rearAxleX: number,
    halfTrM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    trimMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block09_Phase6ProductionVolumetricRearHaunches';

    const haunchInnerZ = 0.66; // Cockpit/decklid shutline boundary
    const haunchArchZ = halfTrM + 0.165; // ~1.025m (2,050mm total widebody rear width)
    const haunchFrontX = rearAxleX + 0.52; // Door shutline junction
    const haunchRearX = rearAxleX - 0.42; // Rear bumper junction
    const haunchLength = haunchFrontX - haunchRearX; // ~0.94m
    const crownWidth = haunchArchZ - haunchInnerZ; // ~0.365m

    // ═══════════════════════════════════════════════════════════════════
    // 1. CONTINUOUS 3D LOFTED REAR HAUNCH TOP CROWNS (Left & Right)
    //    32x20 parametric grid creating muscular widebody shoulder crests
    // ═══════════════════════════════════════════════════════════════════
    const createRearCrownGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(haunchLength, crownWidth, 32, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); // along vehicle length [-haunchLength/2, +haunchLength/2]
        const pz = pos.getZ(i); // across crown width [-crownWidth/2, +crownWidth/2]
        const u = (px + haunchLength / 2) / haunchLength; // 0 (rear/bumper) to 1 (front/door)
        const w = (pz + crownWidth / 2) / crownWidth; // 0 (inner decklid) to 1 (outer flare)

        // Rear axle center in local U
        const axleU = (haunchFrontX - rearAxleX) / haunchLength; // ~0.55
        const distFromAxle = (u - axleU);

        // Muscular rear haunch crest: peaks at rear axle
        const haunchLift = Math.exp(-Math.pow(distFromAxle * 2.6, 2)) * 0.068;

        // Transverse shoulder swelling
        const shoulderCrest = Math.sin(w * Math.PI) * 0.042;

        // Downward roll to outer wheel flare
        const flareDrop = -Math.pow(w, 2.4) * 0.048;

        // Fastback rear slope toward tail
        const rearSlope = -(1.0 - u) * 0.035;

        pos.setY(i, haunchLift + shoulderCrest + flareDrop + rearSlope);

        // Plan-view widebody flare swell
        const wideSwell = Math.exp(-Math.pow(distFromAxle * 2.8, 2)) * 0.035 * w;
        pos.setZ(i, pz + (isLeft ? -wideSwell : wideSwell));
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Left Haunch Crown
    const crownLGeo = createRearCrownGeo(true);
    const crownL = new THREE.Mesh(crownLGeo, paintMat);
    crownL.position.set((haunchFrontX + haunchRearX) / 2, 0.70, -(haunchInnerZ + crownWidth / 2));
    crownL.castShadow = true;
    crownL.receiveShadow = true;

    // Right Haunch Crown
    const crownRGeo = createRearCrownGeo(false);
    const crownR = new THREE.Mesh(crownRGeo, paintMat);
    crownR.position.set((haunchFrontX + haunchRearX) / 2, 0.70, haunchInnerZ + crownWidth / 2);
    crownR.castShadow = true;
    crownR.receiveShadow = true;

    group.add(crownL, crownR);

    // ═══════════════════════════════════════════════════════════════════
    // 2. SCULPTED OUTER REAR WHEEL ARCH FLARE FLANKS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const createRearFlankGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const archSpan = haunchLength * 1.02;
      const flankHeight = 0.48;
      const geo = new THREE.PlaneGeometry(archSpan, flankHeight, 30, 18);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i);
        const py = pos.getY(i);
        const u = (pz + archSpan / 2) / archSpan;
        const h = (py + flankHeight / 2) / flankHeight;

        const xFromAxle = pz - (haunchLength * 0.5 - (haunchFrontX - rearAxleX));
        const rad = Math.sqrt(xFromAxle * xFromAxle + py * py);

        const wheelArchRadius = 0.47;
        const archProximity = Math.max(0, 1.0 - Math.abs(rad - wheelArchRadius) * 3.8);

        const flareBulge = archProximity * 0.038 * h;
        const topRoll = Math.pow(h, 2.2) * 0.030;
        const rockerTuck = (1.0 - h) * (1.0 - u) * 0.020;

        pos.setX(i, (isLeft ? 1 : -1) * (flareBulge - topRoll - rockerTuck));
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Left Outer Flank
    const flankLGeo = createRearFlankGeo(true);
    const flankL = new THREE.Mesh(flankLGeo, paintMat);
    flankL.position.set((haunchFrontX + haunchRearX) / 2, 0.44, -haunchArchZ);
    flankL.castShadow = true;

    // Right Outer Flank
    const flankRGeo = createRearFlankGeo(false);
    const flankR = new THREE.Mesh(flankRGeo, paintMat);
    flankR.position.set((haunchFrontX + haunchRearX) / 2, 0.44, haunchArchZ);
    flankR.castShadow = true;

    group.add(flankL, flankR);

    // ═══════════════════════════════════════════════════════════════════
    // 3. ROLLED REAR WHEEL ARCH LIP RIMS (Left & Right)
    // ═══════════════════════════════════════════════════════════════════
    const archRadius = 0.475;
    const archRimGeo = new THREE.TorusGeometry(archRadius, 0.018, 16, 32, Math.PI);
    archRimGeo.rotateY(Math.PI / 2);
    archRimGeo.rotateZ(Math.PI);

    const archRimL = new THREE.Mesh(archRimGeo, paintMat);
    archRimL.position.set(rearAxleX, 0.44, -haunchArchZ - 0.01);
    archRimL.castShadow = true;

    const archRimR = new THREE.Mesh(archRimGeo.clone(), paintMat);
    archRimR.position.set(rearAxleX, 0.44, haunchArchZ + 0.01);
    archRimR.castShadow = true;

    group.add(archRimL, archRimR);

    // ═══════════════════════════════════════════════════════════════════
    // 4. RECESSED CARBON NACA INTERCOOLER SCOOPS & WAKE PRESSURE GILLS
    // ═══════════════════════════════════════════════════════════════════
    const scoopGeo = new THREE.CapsuleGeometry(0.075, 0.34, 12, 20);
    scoopGeo.rotateZ(Math.PI / 2);

    const scoopL = new THREE.Mesh(scoopGeo, carbonMat);
    scoopL.position.set(rearAxleX + 0.44, 0.52, -(haunchArchZ - 0.04));
    scoopL.rotation.y = 0.22;

    const scoopR = scoopL.clone();
    scoopR.position.z = haunchArchZ - 0.04;
    scoopR.rotation.y = -0.22;
    group.add(scoopL, scoopR);

    // Wake Pressure Extraction Louver Slats (3 per side)
    const ventGeo = new THREE.BoxGeometry(0.11, 0.012, 0.14);
    for (let v = 0; v < 3; v++) {
      const xPos = rearAxleX - 0.28 - v * 0.075;
      const yPos = 0.42 + v * 0.055;

      const ventL = new THREE.Mesh(ventGeo, carbonMat);
      ventL.position.set(xPos, yPos, -haunchArchZ * 0.95);
      ventL.rotation.y = -0.20;

      const ventR = new THREE.Mesh(ventGeo, carbonMat);
      ventR.position.set(xPos, yPos, haunchArchZ * 0.95);
      ventR.rotation.y = 0.20;

      group.add(ventL, ventR);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. INNER COMPOSITE REAR WHEEL WELL SPLASH LINERS (Full Tub Enclosure)
    // ═══════════════════════════════════════════════════════════════════
    const linerGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.38, 32, 1, true, 0, Math.PI);
    linerGeo.rotateX(Math.PI / 2);
    linerGeo.rotateZ(Math.PI);

    const linerL = new THREE.Mesh(linerGeo, trimMat);
    linerL.position.set(rearAxleX, 0.44, -(haunchArchZ - 0.12));

    const linerR = linerL.clone();
    linerR.position.z = haunchArchZ - 0.12;

    group.add(linerL, linerR);

    // 6. Fuel Filler / High-Voltage EV Charge Port Door Flap (Right Rear Haunch)
    const fuelDoorGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.008, 24);
    fuelDoorGeo.rotateX(Math.PI / 2);
    const fuelDoor = new THREE.Mesh(fuelDoorGeo, paintMat);
    fuelDoor.position.set(rearAxleX + 0.18, 0.72, haunchInnerZ + crownWidth * 0.45);
    fuelDoor.rotation.y = -0.15;

    const fuelBezelGeo = new THREE.TorusGeometry(0.064, 0.003, 8, 24);
    const fuelBezel = new THREE.Mesh(fuelBezelGeo, carbonMat);
    fuelBezel.position.set(rearAxleX + 0.18, 0.72, haunchInnerZ + crownWidth * 0.45 + 0.002);
    fuelBezel.rotation.y = -0.15;

    group.add(fuelDoor, fuelBezel);
    return group;
  }

  // ==========================================================================
  // BLOCK 10: PHASE 19 — FASTBACK ENGINE DECKLID, HYDRAULIC STRUTS & LOUVERS
  // ==========================================================================
  private static buildPhase19EngineDecklidAndGasStruts(
    rearAxleX: number,
    wbM: number,
    halfTrM: number,
    paintMat: THREE.Material,
    glassMat: THREE.Material,
    carbonMat: THREE.Material,
    trumpetMat: THREE.Material,
    filterMat: THREE.Material,
    defrosterMat: THREE.Material,
    strutMat: THREE.Material,
    gasketMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block10_Phase19ProductionEngineDecklid';

    const deckLength = wbM * 0.48;
    const deckCenterX = rearAxleX + wbM * 0.18;
    const deckWidth = halfTrM * 1.56; // ~1.34m

    // 1. Stationary Velocity Intake Stacks Underneath Glass Hatch
    const trumpetGeo = new THREE.CylinderGeometry(0.040, 0.022, 0.11, 16);
    const filterCapGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.028, 16);

    for (let r = 0; r < 3; r++) {
      const xOffset = deckCenterX + (r - 1) * 0.11;
      const tL = new THREE.Mesh(trumpetGeo, trumpetMat);
      tL.position.set(xOffset, 0.74, -0.12);
      const capL = new THREE.Mesh(filterCapGeo, filterMat);
      capL.position.set(xOffset, 0.80, -0.12);

      const tR = new THREE.Mesh(trumpetGeo, trumpetMat);
      tR.position.set(xOffset, 0.74, 0.12);
      const capR = new THREE.Mesh(filterCapGeo, filterMat);
      capR.position.set(xOffset, 0.80, 0.12);

      group.add(tL, capL, tR, capR);
    }

    // 2. Articulated Rear Engine Decklid Assembly
    const hatchAngle = (articulation.rearHatchOpenProgress || 0) * (Math.PI / 3.4);
    const hatchPivot = new THREE.Group();
    hatchPivot.position.set(rearAxleX + wbM * 0.38, 1.08, 0);
    hatchPivot.rotation.z = hatchAngle;

    // Sculpted Fastback Decklid Frame
    const hatchFrameGeo = new THREE.BoxGeometry(deckLength * 0.94, 0.028, deckWidth * 0.86);
    const hatchFrame = new THREE.Mesh(hatchFrameGeo, paintMat);
    hatchFrame.position.set(-deckLength * 0.44, -0.16, 0);
    hatchFrame.rotation.z = 0.28;
    hatchFrame.castShadow = true;
    hatchPivot.add(hatchFrame);

    // Transparent Rear Engine Glass Window
    const glassGeo = new THREE.BoxGeometry(deckLength * 0.84, 0.014, deckWidth * 0.62);
    const engineGlass = new THREE.Mesh(glassGeo, glassMat);
    engineGlass.position.set(-deckLength * 0.44, -0.152, 0);
    engineGlass.rotation.z = 0.28;
    hatchPivot.add(engineGlass);

    // Defroster Heating Filaments
    const wireGeo = new THREE.BoxGeometry(0.004, 0.003, deckWidth * 0.58);
    for (let w = -1.5; w <= 1.5; w++) {
      const wire = new THREE.Mesh(wireGeo, defrosterMat);
      wire.position.set(-deckLength * 0.44 + w * (deckLength * 0.18), -0.15 + w * 0.05, 0);
      wire.rotation.z = 0.28;
      hatchPivot.add(wire);
    }

    // Dual Carbon Fiber Heat Extraction Chimney Louvers
    const chimneyLouverGeo = new THREE.BoxGeometry(deckLength * 0.72, 0.018, 0.095);
    const chimneyL = new THREE.Mesh(chimneyLouverGeo, carbonMat);
    chimneyL.position.set(-deckLength * 0.44, -0.148, -deckWidth * 0.38);
    chimneyL.rotation.z = 0.28;

    const chimneyR = chimneyL.clone();
    chimneyR.position.z = deckWidth * 0.38;
    hatchPivot.add(chimneyL, chimneyR);

    // Hinge Arms
    const hingeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.075, 16);
    const hingeL = new THREE.Mesh(hingeGeo, strutMat);
    hingeL.position.set(0, 0, -deckWidth * 0.35);

    const hingeR = hingeL.clone();
    hingeR.position.z = deckWidth * 0.35;
    hatchPivot.add(hingeL, hingeR);

    group.add(hatchPivot);

    // 3. Hydraulic Gas Lift Struts
    const cylinderGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.20, 16);
    const pistonGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 16);

    const strutLGroup = new THREE.Group();
    strutLGroup.position.set(rearAxleX + 0.12, 0.74, -deckWidth * 0.42);
    strutLGroup.rotation.z = -0.45 + hatchAngle * 0.5;

    const cylL = new THREE.Mesh(cylinderGeo, gasketMat);
    cylL.position.y = 0.10;
    const pisL = new THREE.Mesh(pistonGeo, strutMat);
    pisL.position.y = 0.22;
    strutLGroup.add(cylL, pisL);

    const strutRGroup = strutLGroup.clone();
    strutRGroup.position.z = deckWidth * 0.42;
    group.add(strutLGroup, strutRGroup);

    // 4. Integrated Aerodynamic Ducktail Lip Spoiler
    const ducktailGeo = new THREE.BoxGeometry(0.14, 0.038, (halfTrM + 0.16) * 1.92);
    const ducktail = new THREE.Mesh(ducktailGeo, paintMat);
    ducktail.position.set(rearAxleX - 0.28, 0.72, 0);
    ducktail.rotation.z = 0.32;
    ducktail.castShadow = true;

    // 5. Center High-Mount Stop Lamp (CHMSL) LED Third Brake Light Bar
    const chmslGeo = new THREE.BoxGeometry(0.015, 0.012, 0.36);
    const chmslMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const chmsl = new THREE.Mesh(chmslGeo, chmslMat);
    chmsl.position.set(rearAxleX - 0.25, 0.738, 0);

    const chmslBezelGeo = new THREE.BoxGeometry(0.020, 0.016, 0.38);
    const chmslBezel = new THREE.Mesh(chmslBezelGeo, carbonMat);
    chmslBezel.position.set(rearAxleX - 0.25, 0.738, 0);

    group.add(ducktail, chmslBezel, chmsl);

    return group;
  }

  // ==========================================================================
  // BLOCK 11: PHASE 13 — PRODUCTION-GRADE REAR FASCIA, DIFFUSER & ACTIVE GT3 WING
  // ==========================================================================
  private static buildPhase13RearFasciaAndDrsWing(
    rearBumperX: number,
    rearAxleX: number,
    halfTrM: number,
    rearHaunchWidthM: number,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    exhaustMat: THREE.Material,
    strutMat: THREE.Material,
    rainLightMat: THREE.Material,
    trimMat: THREE.Material,
    grilleMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block11_Phase13ProductionRearFasciaDrsWing';

    const width = rearHaunchWidthM * 0.95; // ~1.95m

    // ═══════════════════════════════════════════════════════════════════
    // 1. SCULPTED 3D WRAP-AROUND REAR BUMPER SHELL (32 x 16 Grid)
    // ═══════════════════════════════════════════════════════════════════
    const bumperLength = 0.38;
    const bumperHeight = 0.36;
    const bumperGeo = new THREE.PlaneGeometry(width, bumperHeight, 32, 16);
    const posB = bumperGeo.attributes.position;

    for (let i = 0; i < posB.count; i++) {
      const pz = posB.getX(i); // across width [-width/2, +width/2]
      const py = posB.getY(i); // height [-bumperHeight/2, +bumperHeight/2]
      const w = pz / (width / 2); // -1 to +1

      // Wrap-around curvature at outer rear haunch junctions
      const wrapAround = -Math.pow(w, 2) * 0.08 - Math.pow(w, 4) * 0.06;
      // Slight vertical convexity
      const verticalCrown = Math.cos((py / (bumperHeight / 2)) * (Math.PI / 2)) * 0.025;

      posB.setZ(i, wrapAround + verticalCrown);
    }
    bumperGeo.computeVertexNormals();

    const bumper = new THREE.Mesh(bumperGeo, paintMat);
    bumper.position.set(rearBumperX + 0.12, 0.42, 0);
    bumper.rotation.y = Math.PI;
    bumper.castShadow = true;
    bumper.receiveShadow = true;
    group.add(bumper);

    // ═══════════════════════════════════════════════════════════════════
    // 2. FULL-WIDTH HEXAGONAL HEAT EXTRACTION WIREFRAME MESH
    // ═══════════════════════════════════════════════════════════════════
    const meshGeo = new THREE.BoxGeometry(0.02, 0.16, width * 0.88);
    const rearMesh = new THREE.Mesh(meshGeo, grilleMat);
    rearMesh.position.set(rearBumperX + 0.04, 0.48, 0);
    group.add(rearMesh);

    // ═══════════════════════════════════════════════════════════════════
    // 3. MULTI-CHANNEL VENTURI DIFFUSER EXPANSION RAMP (-12 deg slope)
    // ═══════════════════════════════════════════════════════════════════
    const rampGeo = new THREE.BoxGeometry(0.68, 0.03, width * 0.98);
    const ramp = new THREE.Mesh(rampGeo, carbonMat);
    ramp.position.set(rearBumperX + 0.14, 0.19, 0);
    ramp.rotation.z = -0.18;
    group.add(ramp);

    // 6 Vertical Deep Carbon Diffuser Strakes
    const strakePositions = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];
    const strakeGeo = new THREE.BoxGeometry(0.58, 0.16, 0.016);
    strakePositions.forEach((posZ) => {
      const strake = new THREE.Mesh(strakeGeo, carbonMat);
      strake.position.set(rearBumperX + 0.14, 0.17, posZ);
      strake.rotation.z = -0.18;
      group.add(strake);
    });

    // 4. Central FIA F1-Spec Pulsing LED Rain Light
    const rainLightGeo = new THREE.BoxGeometry(0.04, 0.06, 0.10);
    const rainLight = new THREE.Mesh(rainLightGeo, rainLightMat);
    rainLight.position.set(rearBumperX + 0.02, 0.22, 0);
    group.add(rainLight);

    // ═══════════════════════════════════════════════════════════════════
    // 5. QUAD TITANIUM SLASH-CUT EXHAUSTS WITH BLUE-PURPLE HEAT TINT
    // ═══════════════════════════════════════════════════════════════════
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 24);
    exhaustGeo.rotateZ(Math.PI / 2);

    const quadOffsets = [-0.22, -0.12, 0.12, 0.22];
    quadOffsets.forEach((posZ) => {
      const pipe = new THREE.Mesh(exhaustGeo, exhaustMat);
      pipe.position.set(rearBumperX - 0.05, 0.38, posZ);
      group.add(pipe);
    });

    // 5b. Recessed Rear License Plate Pocket & Tag LED Lighting
    const platePocketGeo = new THREE.BoxGeometry(0.04, 0.14, 0.54);
    const platePocket = new THREE.Mesh(platePocketGeo, trimMat);
    platePocket.position.set(rearBumperX + 0.08, 0.38, 0);
    group.add(platePocket);

    const plateGeo = new THREE.BoxGeometry(0.008, 0.11, 0.48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(rearBumperX + 0.06, 0.38, 0);
    group.add(plate);

    // Dual Tag Lights
    [-0.14, 0.14].forEach((tagZ) => {
      const tagLightGeo = new THREE.BoxGeometry(0.015, 0.008, 0.035);
      const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const tagLight = new THREE.Mesh(tagLightGeo, tagMat);
      tagLight.position.set(rearBumperX + 0.065, 0.44, tagZ);
      group.add(tagLight);
    });

    // Rear Backup Camera Lens
    const camGeo = new THREE.SphereGeometry(0.008, 12, 12);
    const cam = new THREE.Mesh(camGeo, trimMat);
    cam.position.set(rearBumperX + 0.062, 0.445, 0);
    group.add(cam);

    // ═══════════════════════════════════════════════════════════════════
    // 6. ACTIVE DRS DUAL-TIER GT3 REAR WING WITH SWAN-NECK PYLONS
    // ═══════════════════════════════════════════════════════════════════
    const wingGroup = new THREE.Group();

    // Mainplane Airfoil
    const wingMainGeo = new THREE.BoxGeometry(0.32, 0.024, 1.88);
    const wingMain = new THREE.Mesh(wingMainGeo, carbonMat);
    wingMain.position.set(rearAxleX - 0.35, 1.16, 0);
    wingMain.rotation.z = 0.06;
    wingGroup.add(wingMain);

    // DRS Upper Flap with Carbon Gurney Flap
    const drsFlapGeo = new THREE.BoxGeometry(0.12, 0.016, 1.84);
    const drsFlap = new THREE.Mesh(drsFlapGeo, carbonMat);
    drsFlap.position.set(rearAxleX - 0.44, 1.19, 0);
    drsFlap.rotation.z = 0.14;

    const gurneyGeo = new THREE.BoxGeometry(0.008, 0.014, 1.84);
    const gurney = new THREE.Mesh(gurneyGeo, carbonMat);
    gurney.position.set(-0.06, 0.007, 0);
    drsFlap.add(gurney);
    wingGroup.add(drsFlap);

    // Central Hydraulic DRS Actuator Piston
    const actuatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 16);
    const actuator = new THREE.Mesh(actuatorGeo, strutMat);
    actuator.position.set(rearAxleX - 0.38, 1.15, 0);
    actuator.rotation.z = Math.PI / 4;
    wingGroup.add(actuator);

    // Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.44, 0.24, 0.016);
    const endL = new THREE.Mesh(endplateGeo, carbonMat);
    endL.position.set(rearAxleX - 0.35, 1.16, -0.94);

    const endR = endL.clone();
    endR.position.z = 0.94;
    wingGroup.add(endL, endR);

    // Swan-Neck Top Pylons
    const pylonGeo = new THREE.BoxGeometry(0.045, 0.44, 0.02);
    const pylonL = new THREE.Mesh(pylonGeo, carbonMat);
    pylonL.position.set(rearAxleX - 0.24, 0.96, -0.36);
    pylonL.rotation.z = -0.25;

    const pylonR = pylonL.clone();
    pylonR.position.z = 0.36;
    wingGroup.add(pylonL, pylonR);

    group.add(wingGroup);
    return group;
  }

  // ==========================================================================
  // BLOCK 12: LIVERY TYPOGRAPHY & RACE DECALS
  // ==========================================================================
  private static buildLiveryDecals(
    frontAxleX: number,
    rearAxleX: number,
    halfTrM: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Block12_LiveryDecals';

    const decalMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.90,
      side: THREE.DoubleSide,
    });

    // Hood Livery Plaque / Text Stripe
    const hoodDecalGeo = new THREE.BoxGeometry(0.24, 0.005, 0.08);
    const hoodDecalL = new THREE.Mesh(hoodDecalGeo, decalMat);
    hoodDecalL.position.set(frontAxleX + 0.18, 0.65, -0.48);
    hoodDecalL.rotation.y = 0.28;

    const hoodDecalR = new THREE.Mesh(hoodDecalGeo, decalMat);
    hoodDecalR.position.set(frontAxleX + 0.18, 0.65, 0.48);
    hoodDecalR.rotation.y = -0.28;

    // Door Side Number Plate (#7) placed on waistline (Z = ±0.92m)
    const doorDecalGeo = new THREE.BoxGeometry(0.28, 0.12, 0.005);
    const doorDecalL = new THREE.Mesh(doorDecalGeo, decalMat);
    doorDecalL.position.set((frontAxleX + rearAxleX) / 2, 0.54, -0.92);

    const doorDecalR = doorDecalL.clone();
    doorDecalR.position.z = 0.92;

    group.add(hoodDecalL, hoodDecalR, doorDecalL, doorDecalR);
    return group;
  }

  // ==========================================================================
  // ARCHETYPE 1: EXECUTIVE THREE-BOX SEDAN
  // ==========================================================================
  private static buildSedanExecutiveBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    strutMat: THREE.Material,
    rubberMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Sedan_ExecutiveBody';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.05;

    // 1. Aerodynamic Underbody Skid Pan
    const floorGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.04, bodyWidth);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(midX, 0.12, 0);
    group.add(floor);

    // 2. Sculpted Compound-Curved Front Fascia (28x16 lofted mesh)
    const createSedanNoseGeo = (): THREE.BufferGeometry => {
      const spanX = frontNoseX - frontAxleX + 0.10;
      const spanZ = bodyWidth * 0.94;
      const geo = new THREE.PlaneGeometry(spanX, spanZ, 28, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + spanX / 2) / spanX; // 0=rear/hood join, 1=front nose tip
        const v = Math.abs(pz) / (spanZ / 2); // 0=center, 1=outer corner

        // Elegant regal prow drop
        const prowY = 0.58 - u * 0.16;
        // Lateral waterfall taper
        const crownZ = -Math.pow(v, 2.0) * 0.06;
        // Front corner curvature
        const cornerWrap = Math.pow(u, 2.0) * Math.pow(v, 2.0) * -0.04;

        pos.setY(i, prowY + crownZ + cornerWrap);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const sedanNose = new THREE.Mesh(createSedanNoseGeo(), bodyPaintMat);
    sedanNose.position.set((frontNoseX + frontAxleX - 0.10) / 2, 0, 0);
    sedanNose.castShadow = true;
    group.add(sedanNose);

    // Regal Waterfall Chrome Radiator Grille
    const grilleFrameGeo = new THREE.BoxGeometry(0.06, 0.28, bodyWidth * 0.46);
    const grilleFrame = new THREE.Mesh(grilleFrameGeo, trimMat);
    grilleFrame.position.set(frontNoseX - 0.02, 0.40, 0);

    // Vertical Chrome Slats (14 slats)
    const slatGeo = new THREE.BoxGeometry(0.05, 0.24, 0.008);
    for (let s = 0; s < 14; s++) {
      const slatZ = (s - 6.5) * (bodyWidth * 0.44 / 14);
      const slat = new THREE.Mesh(slatGeo, strutMat);
      slat.position.set(0.01, 0, slatZ);
      grilleFrame.add(slat);
    }
    group.add(grilleFrame);

    // 3. Stamped Long Executive Hood (30x20 vertex grid)
    const hoodLen = frontNoseX - frontAxleX + 0.14;
    const createSedanHoodGeo = (): THREE.BufferGeometry => {
      const spanZ = bodyWidth * 0.90;
      const geo = new THREE.PlaneGeometry(hoodLen, spanZ, 30, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + hoodLen / 2) / hoodLen; // 0=windshield cowl, 1=front grille
        const v = Math.abs(pz) / (spanZ / 2);

        // Slope from cowl (Y=0.72m) down to grille join (Y=0.58m)
        const slopeY = 0.72 - u * 0.14;
        // Central crown bulge (+25mm)
        const crown = (1.0 - Math.pow(v, 2.0)) * 0.025;
        // Dual executive character creases at v = 0.38
        const creaseDist = Math.abs(v - 0.38);
        const crease = Math.max(0, 0.014 - creaseDist * 0.08);

        pos.setY(i, slopeY + crown + crease);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const hoodMesh = new THREE.Mesh(createSedanHoodGeo(), bodyPaintMat);
    const hoodOpenAngle = (articulation.hoodOpenProgress || 0) * 0.65;
    hoodMesh.position.set(frontAxleX + hoodLen * 0.44, Math.sin(hoodOpenAngle) * 0.25, 0);
    hoodMesh.rotation.z = -hoodOpenAngle;
    hoodMesh.castShadow = true;
    group.add(hoodMesh);

    // Chrome Center Hood Spear
    const spearGeo = new THREE.BoxGeometry(hoodLen * 0.85, 0.010, 0.012);
    const spear = new THREE.Mesh(spearGeo, strutMat);
    spear.position.set(frontAxleX + hoodLen * 0.44, 0.68, 0);
    group.add(spear);

    // 4. Executive 4-Door Cabin Section with A/B/C Pillars
    const doorOpenAngle = (articulation.doorOpenProgress || 0) * 0.75;
    const cabinLen = wbM * 0.76;

    // Sculpted Front Doors with compound curvature (20x12 vertex grid)
    const createSedanDoorGeo = (isLeft: boolean, doorLen: number, doorH: number): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(doorLen, doorH, 20, 12);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + doorLen / 2) / doorLen;
        const h = (py + doorH / 2) / doorH;
        const waistTuck = Math.sin(u * Math.PI) * 0.035;
        const tumblehome = Math.sin(h * Math.PI) * 0.025 - Math.pow(h, 2.5) * 0.015;
        const shoulderCrease = Math.exp(-Math.pow((h - 0.82) * 8.0, 2)) * 0.012;
        pos.setX(i, (isLeft ? -1 : 1) * (waistTuck + tumblehome + shoulderCrease));
      }
      geo.computeVertexNormals();
      return geo;
    };
    const frontDoorLen = cabinLen * 0.50;
    const frontDoorH = 0.46;
    const doorFrontL = new THREE.Mesh(createSedanDoorGeo(true, frontDoorLen, frontDoorH), bodyPaintMat);
    doorFrontL.position.set(midX + cabinLen * 0.24, 0.46, -bodyWidth / 2 - Math.sin(doorOpenAngle) * 0.18);
    doorFrontL.rotation.y = doorOpenAngle;
    doorFrontL.castShadow = true;
    const doorFrontR = new THREE.Mesh(createSedanDoorGeo(false, frontDoorLen, frontDoorH), bodyPaintMat);
    doorFrontR.position.set(midX + cabinLen * 0.24, 0.46, bodyWidth / 2 + Math.sin(doorOpenAngle) * 0.18);
    doorFrontR.rotation.y = -doorOpenAngle;
    doorFrontR.castShadow = true;
    group.add(doorFrontL, doorFrontR);

    // Sculpted Rear Doors with compound curvature
    const rearDoorLen = cabinLen * 0.46;
    const doorRearL = new THREE.Mesh(createSedanDoorGeo(true, rearDoorLen, frontDoorH), bodyPaintMat);
    doorRearL.position.set(midX - cabinLen * 0.22, 0.46, -bodyWidth / 2);
    doorRearL.castShadow = true;
    const doorRearR = new THREE.Mesh(createSedanDoorGeo(false, rearDoorLen, frontDoorH), bodyPaintMat);
    doorRearR.position.set(midX - cabinLen * 0.22, 0.46, bodyWidth / 2);
    doorRearR.castShadow = true;
    group.add(doorRearL, doorRearR);

    // Chrome Daylight Opening (DLO) Beltline Trim
    const dloGeo = new THREE.BoxGeometry(cabinLen * 0.98, 0.015, 0.02);
    const dloL = new THREE.Mesh(dloGeo, strutMat);
    dloL.position.set(midX, 0.70, -bodyWidth * 0.48);
    const dloR = dloL.clone();
    dloR.position.z = bodyWidth * 0.48;
    group.add(dloL, dloR);

    // Center B-Pillar in High-Gloss Black
    const bPillarGeo = new THREE.BoxGeometry(0.08, 0.54, 0.04);
    const bPillarL = new THREE.Mesh(bPillarGeo, trimMat);
    bPillarL.position.set(midX, 0.72, -bodyWidth * 0.44);
    const bPillarR = bPillarL.clone();
    bPillarR.position.z = bodyWidth * 0.44;
    group.add(bPillarL, bPillarR);

    // 5. Sedan Greenhouse (Windshield, Formal C-Pillar, Rear Backlite)
    const windshieldGeo = new THREE.PlaneGeometry(0.60, bodyWidth * 0.80);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(midX + cabinLen * 0.40, 0.82, 0);
    windshield.rotation.z = -0.58;
    group.add(windshield);

    const rearGlassGeo = new THREE.PlaneGeometry(0.56, bodyWidth * 0.78);
    rearGlassGeo.rotateX(-Math.PI / 2);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(midX - cabinLen * 0.38, 0.82, 0);
    rearGlass.rotation.z = 0.54;
    group.add(rearGlass);

    // Sculpted Sedan Roof with compound curvature (20x12 grid)
    const createSedanRoofGeo = (): THREE.BufferGeometry => {
      const rLen = cabinLen * 0.64, rW = bodyWidth * 0.82;
      const geo = new THREE.PlaneGeometry(rLen, rW, 20, 12);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const pz = pos.getZ(i);
        const u = Math.abs(pz) / (rW / 2);
        const crown = (1.0 - Math.pow(u, 2.0)) * 0.015;
        pos.setY(i, crown);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const roof = new THREE.Mesh(createSedanRoofGeo(), bodyPaintMat);
    roof.position.set(midX, 1.02, 0);
    roof.castShadow = true;

    const sunRoofGeo = new THREE.PlaneGeometry(cabinLen * 0.42, bodyWidth * 0.58, 1, 1);
    const sunRoof = new THREE.Mesh(sunRoofGeo, glassMat);
    sunRoof.rotation.x = -Math.PI / 2;
    sunRoof.position.set(0, 0.005, 0);
    roof.add(sunRoof);
    group.add(roof);

    // 6. Sculpted Three-Box Trunk Decklid with compound curvature
    const trunkLen = frontAxleX - wbM - rearBumperX - 0.10;
    const createTrunkGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(trunkLen, bodyWidth * 0.88, 16, 10);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const pz = pos.getZ(i);
        const u = Math.abs(pz) / (bodyWidth * 0.44);
        const crown = (1.0 - Math.pow(u, 2.0)) * 0.012;
        const drop = Math.pow(Math.abs(px) / (trunkLen / 2), 2.0) * 0.008;
        pos.setY(i, crown - drop);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const trunk = new THREE.Mesh(createTrunkGeo(), bodyPaintMat);
    trunk.position.set(rearAxleX - trunkLen * 0.48, 0.70, 0);
    trunk.castShadow = true;

    // Chrome Trunk Finisher Bar
    const trunkTrimGeo = new THREE.BoxGeometry(0.04, 0.02, bodyWidth * 0.72);
    const trunkTrim = new THREE.Mesh(trunkTrimGeo, strutMat);
    trunkTrim.position.set(-trunkLen * 0.48, 0.015, 0);
    trunk.add(trunkTrim);
    group.add(trunk);

    // 7. Sculpted Rear Sedan Bumper with compound curvature (16x10 grid)
    const createRearBumperGeo = (): THREE.BufferGeometry => {
      const bLen = 0.36, bH = 0.34, bW = bodyWidth * 0.94;
      const geo = new THREE.PlaneGeometry(bH, bW, 16, 10);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); const pz = pos.getZ(i);
        const v = Math.abs(pz) / (bW / 2);
        const wrapBack = Math.pow(v, 2.5) * 0.03;
        pos.setX(i, py + wrapBack);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const rearBumper = new THREE.Mesh(createRearBumperGeo(), bodyPaintMat);
    rearBumper.position.set(rearBumperX + 0.18, 0.40, 0);
    rearBumper.rotation.y = Math.PI / 2;
    rearBumper.castShadow = true;

    const exhaustTipGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.08, 16);
    exhaustTipGeo.rotateZ(Math.PI / 2);
    const exhaustL = new THREE.Mesh(exhaustTipGeo, strutMat);
    exhaustL.position.set(-0.16, -0.08, -bodyWidth * 0.32);
    const exhaustR = exhaustL.clone();
    exhaustR.position.z = bodyWidth * 0.32;
    rearBumper.add(exhaustL, exhaustR);

    group.add(rearBumper);
    return group;
  }

  // ==========================================================================
  // ARCHETYPE 2: GRAND TOURER & FASTBACK COUPE
  // ==========================================================================
  private static buildCoupeFastbackBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    strutMat: THREE.Material,
    rubberMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Coupe_FastbackBody';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.08;

    // 1. Aerodynamic Underbody Floor
    const floorGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.03, bodyWidth);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(midX, 0.11, 0);
    group.add(floor);

    // 2. Aggressive Shark-Nose Front Fascia (28x16 compound lofted curve)
    const createCoupeNoseGeo = (): THREE.BufferGeometry => {
      const spanX = frontNoseX - frontAxleX + 0.12;
      const spanZ = bodyWidth * 0.96;
      const geo = new THREE.PlaneGeometry(spanX, spanZ, 28, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + spanX / 2) / spanX;
        const v = Math.abs(pz) / (spanZ / 2);

        // Shark-nose forward rake (low front prow)
        const noseY = 0.54 - u * 0.20;
        // Muscular crown slope
        const crownZ = -Math.pow(v, 2.2) * 0.08;
        // Aggressive aerodynamic corner tuck
        const tuck = Math.pow(u, 2.0) * Math.pow(v, 1.8) * -0.05;

        pos.setY(i, noseY + crownZ + tuck);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const coupeNose = new THREE.Mesh(createCoupeNoseGeo(), bodyPaintMat);
    coupeNose.position.set((frontNoseX + frontAxleX - 0.12) / 2, 0, 0);
    coupeNose.castShadow = true;
    group.add(coupeNose);

    // Carbon Front Splitter Blade
    const splitterGeo = new THREE.BoxGeometry(0.38, 0.022, bodyWidth * 1.02);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(frontNoseX - 0.12, 0.10, 0);
    group.add(splitter);

    // 3. Long Sculpted Power-Bulge Hood with Heat Extractor Vents
    const hoodLen = frontNoseX - frontAxleX + 0.20;
    const createCoupeHoodGeo = (): THREE.BufferGeometry => {
      const spanZ = bodyWidth * 0.90;
      const geo = new THREE.PlaneGeometry(hoodLen, spanZ, 30, 24);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + hoodLen / 2) / hoodLen;
        const v = Math.abs(pz) / (spanZ / 2);

        const slopeY = 0.68 - u * 0.14;
        // Prominent muscular power dome (+35mm in center)
        const powerDome = Math.exp(-Math.pow(v / 0.32, 2.0)) * 0.035;
        // Lateral crown curvature
        const sideRoll = -Math.pow(v, 2.2) * 0.04;

        pos.setY(i, slopeY + powerDome + sideRoll);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const coupeHood = new THREE.Mesh(createCoupeHoodGeo(), bodyPaintMat);
    const hoodOpenAngle = (articulation.hoodOpenProgress || 0) * 0.65;
    coupeHood.position.set(frontAxleX + hoodLen * 0.42, Math.sin(hoodOpenAngle) * 0.25, 0);
    coupeHood.rotation.z = -hoodOpenAngle;
    coupeHood.castShadow = true;
    group.add(coupeHood);

    // Dual Carbon Fiber Hood Heat Extractor Vents
    const ventGeo = new THREE.BoxGeometry(0.24, 0.012, 0.09);
    const ventL = new THREE.Mesh(ventGeo, carbonMat);
    ventL.position.set(frontAxleX + 0.22, 0.63, -bodyWidth * 0.22);
    ventL.rotation.y = 0.18;

    const ventR = ventL.clone();
    ventR.position.z = bodyWidth * 0.22;
    ventR.rotation.y = -0.18;
    group.add(ventL, ventR);

    // 4. 2 Elongated Frameless Coupe Doors with Coke-Bottle Waistline
    const doorLen = wbM * 0.68;
    const doorOpenAngle = (articulation.doorOpenProgress || 0) * 0.85;

    const doorGeo = new THREE.BoxGeometry(doorLen, 0.44, 0.06);
    const doorL = new THREE.Mesh(doorGeo, bodyPaintMat);
    doorL.position.set(midX + 0.05, 0.44, -bodyWidth / 2 - Math.sin(doorOpenAngle) * 0.22);
    doorL.rotation.y = doorOpenAngle;

    const doorR = new THREE.Mesh(doorGeo, bodyPaintMat);
    doorR.position.set(midX + 0.05, 0.44, bodyWidth / 2 + Math.sin(doorOpenAngle) * 0.22);
    doorR.rotation.y = -doorOpenAngle;
    group.add(doorL, doorR);

    // 5. Continuous Unbroken Fastback Roofline (Sweeping directly to rear ducktail)
    const windshieldGeo = new THREE.PlaneGeometry(0.64, bodyWidth * 0.78);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(midX + wbM * 0.32, 0.76, 0);
    windshield.rotation.z = -0.66;
    group.add(windshield);

    // Sculpted Swept Fastback Roof with compound curvature
    const createFastbackRoofGeo = (): THREE.BufferGeometry => {
      const rLen = wbM * 0.76, rW = bodyWidth * 0.76;
      const geo = new THREE.PlaneGeometry(rLen, rW, 20, 12);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const pz = pos.getZ(i);
        const u = Math.abs(pz) / (rW / 2);
        const crown = (1.0 - Math.pow(u, 2.0)) * 0.018;
        pos.setY(i, crown);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const roof = new THREE.Mesh(createFastbackRoofGeo(), bodyPaintMat);
    roof.position.set(midX - 0.08, 0.94, 0);
    roof.rotation.z = 0.10;
    roof.castShadow = true;
    group.add(roof);

    // Fastback Rear Sloping Glass Backlite
    const fastbackGlassGeo = new THREE.PlaneGeometry(0.74, bodyWidth * 0.70);
    fastbackGlassGeo.rotateX(-Math.PI / 2);
    const fastbackGlass = new THREE.Mesh(fastbackGlassGeo, glassMat);
    fastbackGlass.position.set(rearAxleX + 0.12, 0.78, 0);
    fastbackGlass.rotation.z = 0.60;
    group.add(fastbackGlass);

    // 6. Sculpted Muscular Widebody Rear Haunches
    const createHaunchGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(0.72, 0.38, 16, 10);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + 0.36) / 0.72;
        const bulge = Math.sin(u * Math.PI) * 0.04;
        const taper = Math.pow(py / 0.19, 2) * -0.01;
        pos.setX(i, (isLeft ? -1 : 1) * (bulge + taper));
      }
      geo.computeVertexNormals();
      return geo;
    };
    const haunchL = new THREE.Mesh(createHaunchGeo(true), bodyPaintMat);
    haunchL.position.set(rearAxleX, 0.54, -halfTrM * 1.05);
    haunchL.castShadow = true;
    const haunchR = new THREE.Mesh(createHaunchGeo(false), bodyPaintMat);
    haunchR.position.set(rearAxleX, 0.54, halfTrM * 1.05);
    haunchR.castShadow = true;
    group.add(haunchL, haunchR);

    // Integrated Carbon Ducktail Spoiler
    const ducktailGeo = new THREE.BoxGeometry(0.22, 0.065, bodyWidth * 0.84);
    const ducktail = new THREE.Mesh(ducktailGeo, carbonMat);
    ducktail.position.set(rearBumperX + 0.22, 0.70, 0);
    ducktail.rotation.z = -0.32;
    group.add(ducktail);

    // 7. Sculpted Rear Fascia with compound curvature
    const createCoupeRearBumperGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(0.34, bodyWidth * 0.96, 14, 10);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); const pz = pos.getZ(i);
        const v = Math.abs(pz) / (bodyWidth * 0.48);
        pos.setX(i, Math.pow(v, 2.5) * 0.03);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const rearBumper = new THREE.Mesh(createCoupeRearBumperGeo(), bodyPaintMat);
    rearBumper.position.set(rearBumperX + 0.16, 0.38, 0);
    rearBumper.rotation.y = Math.PI / 2;
    rearBumper.castShadow = true;

    const quadTipGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.08, 16);
    quadTipGeo.rotateZ(Math.PI / 2);
    for (let q = -1; q <= 1; q += 2) {
      const tip1 = new THREE.Mesh(quadTipGeo, exhaustMat);
      tip1.position.set(-0.15, -0.07, q * (bodyWidth * 0.32));
      const tip2 = new THREE.Mesh(quadTipGeo, exhaustMat);
      tip2.position.set(-0.15, -0.07, q * (bodyWidth * 0.32 + 0.08));
      rearBumper.add(tip1, tip2);
    }

    group.add(rearBumper);
    return group;
  }

  // ==========================================================================
  // ARCHETYPE 3: COMPACT SPORTS ROADSTER & SPYDER
  // ==========================================================================
  private static buildSportsRoadsterBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    haloMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SportsRoadster_Body';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.02;

    // 1. Lightweight Monocoque Tub Floor
    const floorGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.03, bodyWidth);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(midX, 0.10, 0);
    group.add(floor);

    // 2. Ultra-Low Compound-Curved Front Nose (28x16 lofted curve)
    const createRoadsterNoseGeo = (): THREE.BufferGeometry => {
      const spanX = frontNoseX - frontAxleX + 0.10;
      const spanZ = bodyWidth * 0.92;
      const geo = new THREE.PlaneGeometry(spanX, spanZ, 28, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + spanX / 2) / spanX;
        const v = Math.abs(pz) / (spanZ / 2);

        const noseY = 0.50 - u * 0.22;
        const crownZ = -Math.pow(v, 2.0) * 0.06;
        const cornerTuck = Math.pow(u, 2.0) * Math.pow(v, 2.0) * -0.04;

        pos.setY(i, noseY + crownZ + cornerTuck);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const roadsterNose = new THREE.Mesh(createRoadsterNoseGeo(), bodyPaintMat);
    roadsterNose.position.set((frontNoseX + frontAxleX - 0.10) / 2, 0, 0);
    roadsterNose.castShadow = true;
    group.add(roadsterNose);

    // Carbon Front Chin Splitter
    const chinGeo = new THREE.BoxGeometry(0.32, 0.018, bodyWidth * 0.98);
    const chin = new THREE.Mesh(chinGeo, carbonMat);
    chin.position.set(frontNoseX - 0.08, 0.09, 0);
    group.add(chin);

    // 3. Scalloped Roadster Bonnet with Radiator Extractor Vents
    const hoodLen = frontNoseX - frontAxleX + 0.18;
    const createRoadsterHoodGeo = (): THREE.BufferGeometry => {
      const spanZ = bodyWidth * 0.88;
      const geo = new THREE.PlaneGeometry(hoodLen, spanZ, 28, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + hoodLen / 2) / hoodLen;
        const v = Math.abs(pz) / (spanZ / 2);

        const slopeY = 0.62 - u * 0.12;
        const valley = Math.sin(v * Math.PI) * 0.022;
        pos.setY(i, slopeY - valley);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const roadsterHood = new THREE.Mesh(createRoadsterHoodGeo(), bodyPaintMat);
    const hoodOpenAngle = (articulation.hoodOpenProgress || 0) * 0.65;
    roadsterHood.position.set(frontAxleX + hoodLen * 0.44, Math.sin(hoodOpenAngle) * 0.25, 0);
    roadsterHood.rotation.z = -hoodOpenAngle;
    roadsterHood.castShadow = true;
    group.add(roadsterHood);

    // 4. Compact 2-Door Speedster Cockpit with Low Cutout Doors
    const doorLen = wbM * 0.60;
    const doorOpenAngle = (articulation.doorOpenProgress || 0) * 0.85;

    const doorGeo = new THREE.BoxGeometry(doorLen, 0.38, 0.05);
    const doorL = new THREE.Mesh(doorGeo, bodyPaintMat);
    doorL.position.set(midX, 0.38, -bodyWidth / 2 - Math.sin(doorOpenAngle) * 0.20);
    doorL.rotation.y = doorOpenAngle;

    const doorR = new THREE.Mesh(doorGeo, bodyPaintMat);
    doorR.position.set(midX, 0.38, bodyWidth / 2 + Math.sin(doorOpenAngle) * 0.20);
    doorR.rotation.y = -doorOpenAngle;
    group.add(doorL, doorR);

    // 5. Low Speedster Raked Windscreen with Brushed Titanium Frame
    const windshieldGeo = new THREE.PlaneGeometry(0.46, bodyWidth * 0.74);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(midX + wbM * 0.24, 0.66, 0);
    windshield.rotation.z = -0.74;
    group.add(windshield);

    // 6. Dual Aerodynamic Speedster Cowls & Titanium Roll Hoops
    const hoopGeo = new THREE.TorusGeometry(0.14, 0.022, 16, 24, Math.PI);
    hoopGeo.rotateZ(Math.PI);
    const hoopL = new THREE.Mesh(hoopGeo, haloMat);
    hoopL.position.set(midX - wbM * 0.18, 0.74, -0.30);

    const hoopR = hoopL.clone();
    hoopR.position.z = 0.30;
    group.add(hoopL, hoopR);

    // Sculpted Aerodynamic Cowl Fairings Behind Hoops
    const cowlGeo = new THREE.ConeGeometry(0.14, 0.54, 16);
    cowlGeo.rotateZ(Math.PI / 2);
    const cowlL = new THREE.Mesh(cowlGeo, bodyPaintMat);
    cowlL.position.set(midX - wbM * 0.40, 0.62, -0.30);

    const cowlR = cowlL.clone();
    cowlR.position.z = 0.30;
    group.add(cowlL, cowlR);

    // 7. Compact Rear Deck & Center Dual Sport Exhaust
    const rearDeckGeo = new THREE.BoxGeometry(wbM * 0.44, 0.28, bodyWidth * 0.90);
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyPaintMat);
    rearDeck.position.set(rearAxleX - 0.15, 0.36, 0);

    const centerExhaustGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.08, 16);
    centerExhaustGeo.rotateZ(Math.PI / 2);
    const exL = new THREE.Mesh(centerExhaustGeo, exhaustMat);
    exL.position.set(-wbM * 0.22, -0.04, -0.05);
    const exR = exL.clone();
    exR.position.z = 0.05;
    rearDeck.add(exL, exR);

    group.add(rearDeck);
    return group;
  }

  // ==========================================================================
  // ARCHETYPE 4: HIGH-RIDING SUV & CROSSOVER
  // ==========================================================================
  private static buildSUVBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    strutMat: THREE.Material,
    rubberMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SUV_RuggedBody';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.10;

    // 1. High-Clearance Protective Chassis Skid Plate
    const skidGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.04, bodyWidth * 0.94);
    const skid = new THREE.Mesh(skidGeo, trimMat);
    skid.position.set(midX, 0.18, 0);
    group.add(skid);

    // 2. Bold Upright SUV Front Fascia (28x16 compound lofted curve)
    const createSUVNoseGeo = (): THREE.BufferGeometry => {
      const spanX = frontNoseX - frontAxleX + 0.12;
      const spanZ = bodyWidth * 0.96;
      const geo = new THREE.PlaneGeometry(spanX, spanZ, 28, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + spanX / 2) / spanX;
        const v = Math.abs(pz) / (spanZ / 2);

        // High upright SUV nose
        const noseY = 0.72 - u * 0.12;
        const crownZ = -Math.pow(v, 2.0) * 0.05;
        pos.setY(i, noseY + crownZ);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const suvNose = new THREE.Mesh(createSUVNoseGeo(), bodyPaintMat);
    suvNose.position.set((frontNoseX + frontAxleX - 0.12) / 2, 0, 0);
    suvNose.castShadow = true;
    group.add(suvNose);

    // Brushed Aluminum Skid Guard
    const frontGuardGeo = new THREE.BoxGeometry(0.14, 0.20, bodyWidth * 0.58);
    const frontGuard = new THREE.Mesh(frontGuardGeo, strutMat);
    frontGuard.position.set(frontNoseX - 0.04, 0.34, 0);
    group.add(frontGuard);

    // 3. High Power-Dome SUV Hood (30x20 vertex grid)
    const hoodLen = frontNoseX - frontAxleX + 0.18;
    const createSUVHoodGeo = (): THREE.BufferGeometry => {
      const spanZ = bodyWidth * 0.92;
      const geo = new THREE.PlaneGeometry(hoodLen, spanZ, 30, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + hoodLen / 2) / hoodLen;
        const v = Math.abs(pz) / (spanZ / 2);

        const slopeY = 0.88 - u * 0.16;
        const powerDome = (1.0 - Math.pow(v, 2.0)) * 0.035;
        pos.setY(i, slopeY + powerDome);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const suvHood = new THREE.Mesh(createSUVHoodGeo(), bodyPaintMat);
    const hoodOpenAngle = (articulation.hoodOpenProgress || 0) * 0.65;
    suvHood.position.set(frontAxleX + hoodLen * 0.42, Math.sin(hoodOpenAngle) * 0.25, 0);
    suvHood.rotation.z = -hoodOpenAngle;
    suvHood.castShadow = true;
    group.add(suvHood);

    // 4. Boxed Wheel Arch Cladding Flares
    const flareGeo = new THREE.TorusGeometry(0.40, 0.045, 8, 24, Math.PI);
    flareGeo.rotateZ(Math.PI);
    const flareFL = new THREE.Mesh(flareGeo, trimMat);
    flareFL.position.set(frontAxleX, 0.44, -halfTfM * 1.04);
    const flareFR = flareFL.clone();
    flareFR.position.z = halfTfM * 1.04;
    const flareRL = flareFL.clone();
    flareRL.position.x = rearAxleX;
    flareRL.position.z = -halfTrM * 1.04;
    const flareRR = flareRL.clone();
    flareRR.position.z = halfTrM * 1.04;
    group.add(flareFL, flareFR, flareRL, flareRR);

    // 5. Tall 5-Door Greenhouse with Sculpted Doors & Roof Rails
    const cabinLen = wbM * 0.88;
    const createSUVDoorGeo = (isLeft: boolean, dLen: number, dH: number): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(dLen, dH, 18, 10);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + dLen / 2) / dLen;
        const h = (py + dH / 2) / dH;
        const tuck = Math.sin(u * Math.PI) * 0.025;
        const tumble = Math.sin(h * Math.PI) * 0.018;
        const shoulder = Math.exp(-Math.pow((h - 0.78) * 6.0, 2)) * 0.010;
        pos.setX(i, (isLeft ? -1 : 1) * (tuck + tumble + shoulder));
      }
      geo.computeVertexNormals();
      return geo;
    };
    const suvDoorFL = new THREE.Mesh(createSUVDoorGeo(true, cabinLen * 0.48, 0.58), bodyPaintMat);
    suvDoorFL.position.set(midX + cabinLen * 0.22, 0.58, -bodyWidth / 2);
    suvDoorFL.castShadow = true;
    const suvDoorFR = new THREE.Mesh(createSUVDoorGeo(false, cabinLen * 0.48, 0.58), bodyPaintMat);
    suvDoorFR.position.set(midX + cabinLen * 0.22, 0.58, bodyWidth / 2);
    suvDoorFR.castShadow = true;
    const suvDoorRL = new THREE.Mesh(createSUVDoorGeo(true, cabinLen * 0.48, 0.58), bodyPaintMat);
    suvDoorRL.position.set(midX - cabinLen * 0.22, 0.58, -bodyWidth / 2);
    suvDoorRL.castShadow = true;
    const suvDoorRR = new THREE.Mesh(createSUVDoorGeo(false, cabinLen * 0.48, 0.58), bodyPaintMat);
    suvDoorRR.position.set(midX - cabinLen * 0.22, 0.58, bodyWidth / 2);
    suvDoorRR.castShadow = true;
    group.add(suvDoorFL, suvDoorFR, suvDoorRL, suvDoorRR);

    // Upright Windshield
    const windshieldGeo = new THREE.PlaneGeometry(0.70, bodyWidth * 0.82);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(midX + cabinLen * 0.44, 1.02, 0);
    windshield.rotation.z = -0.46;
    group.add(windshield);

    // High Roof with Satin Aluminum Roof Rails
    const roofGeo = new THREE.BoxGeometry(cabinLen * 0.80, 0.04, bodyWidth * 0.86);
    const roof = new THREE.Mesh(roofGeo, bodyPaintMat);
    roof.position.set(midX - 0.04, 1.30, 0);

    const railGeo = new THREE.BoxGeometry(cabinLen * 0.74, 0.03, 0.03);
    const railL = new THREE.Mesh(railGeo, strutMat);
    railL.position.set(0, 0.04, -bodyWidth * 0.38);
    const railR = railL.clone();
    railR.position.z = bodyWidth * 0.38;
    roof.add(railL, railR);
    group.add(roof);

    // 6. Sculpted Vertical Tailgate with compound curvature
    const createTailgateGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(0.74, bodyWidth * 0.88, 12, 10);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); const pz = pos.getZ(i);
        const v = Math.abs(pz) / (bodyWidth * 0.44);
        const curvature = Math.pow(v, 2.0) * 0.02;
        pos.setX(i, curvature);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const tailgate = new THREE.Mesh(createTailgateGeo(), bodyPaintMat);
    tailgate.position.set(rearBumperX + 0.18, 0.76, 0);
    tailgate.rotation.y = Math.PI / 2;
    tailgate.castShadow = true;

    const rearGlassGeo = new THREE.BoxGeometry(0.03, 0.36, bodyWidth * 0.78);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(-0.02, 0.16, 0);
    tailgate.add(rearGlass);
    group.add(tailgate);

    // 7. Sculpted Rear SUV Bumper with compound curvature
    const createSUVRearBumperGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(0.44, bodyWidth * 0.98, 14, 10);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); const pz = pos.getZ(i);
        const v = Math.abs(pz) / (bodyWidth * 0.49);
        pos.setX(i, Math.pow(v, 2.5) * 0.03);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const rearBumper = new THREE.Mesh(createSUVRearBumperGeo(), bodyPaintMat);
    rearBumper.position.set(rearBumperX + 0.19, 0.46, 0);
    rearBumper.rotation.y = Math.PI / 2;
    rearBumper.castShadow = true;

    const hitchGeo = new THREE.BoxGeometry(0.12, 0.06, 0.06);
    const hitch = new THREE.Mesh(hitchGeo, trimMat);
    hitch.position.set(-0.16, -0.12, 0);
    rearBumper.add(hitch);
    group.add(rearBumper);

    return group;
  }

  // ==========================================================================
  // ARCHETYPE 5: UTILITY PICKUP TRUCK
  // ==========================================================================
  private static buildPickupTruckBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    strutMat: THREE.Material,
    rubberMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PickupTruck_Body';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.12;

    // 1. Heavy Duty Ladder Frame Skid
    const frameGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.05, bodyWidth * 0.92);
    const frame = new THREE.Mesh(frameGeo, trimMat);
    frame.position.set(midX, 0.20, 0);
    group.add(frame);

    // 2. Bold Industrial Front Grille & Heavy-Duty Steel Bumper
    const frontFasciaGeo = new THREE.BoxGeometry(0.44, 0.54, bodyWidth * 0.98);
    const frontFascia = new THREE.Mesh(frontFasciaGeo, bodyPaintMat);
    frontFascia.position.set(frontNoseX - 0.22, 0.58, 0);

    const steelBumperGeo = new THREE.BoxGeometry(0.18, 0.20, bodyWidth * 1.02);
    const steelBumper = new THREE.Mesh(steelBumperGeo, strutMat);
    steelBumper.position.set(0.18, -0.16, 0);
    frontFascia.add(steelBumper);
    group.add(frontFascia);

    // Flat Truck Hood with Cowl Induction Scoop
    const hoodLen = frontNoseX - frontAxleX + 0.16;
    const hoodGeo = new THREE.BoxGeometry(hoodLen, 0.04, bodyWidth * 0.94);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(frontAxleX + hoodLen * 0.44, 0.86, 0);
    group.add(hood);

    // 3. Sculpted Truck Cab with compound curvature
    const cabLen = wbM * 0.50;
    const cabCenterX = frontAxleX - cabLen * 0.45;

    const createCabGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(cabLen, bodyWidth * 0.92, 16, 12);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + bodyWidth * 0.46) / (bodyWidth * 0.92);
        const v = (py + cabLen / 2) / cabLen;
        const tuck = Math.sin(u * Math.PI) * 0.03;
        const roofCurve = Math.exp(-Math.pow((v - 0.85) * 5, 2)) * 0.02;
        pos.setX(i, tuck + roofCurve);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const cab = new THREE.Mesh(createCabGeo(), bodyPaintMat);
    cab.position.set(cabCenterX, 0.64, 0);
    cab.rotation.y = Math.PI / 2;
    cab.castShadow = true;
    group.add(cab);

    // Upright Windshield
    const windshieldGeo = new THREE.PlaneGeometry(0.64, bodyWidth * 0.82);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(cabCenterX + cabLen * 0.44, 1.04, 0);
    windshield.rotation.z = -0.40;
    group.add(windshield);

    // Vertical Cab Backlite Glass
    const backliteGeo = new THREE.BoxGeometry(0.03, 0.34, bodyWidth * 0.74);
    const backlite = new THREE.Mesh(backliteGeo, glassMat);
    backlite.position.set(cabCenterX - cabLen * 0.48, 1.04, 0);
    group.add(backlite);

    // 4. Separate Open Cargo Bed with Flared Fenders
    const bedLen = frontAxleX - cabLen * 0.92 - rearBumperX;
    const bedCenterX = rearAxleX + 0.05;

    // Bed Floor with Ribbed Composite Bedliner
    const bedFloorGeo = new THREE.BoxGeometry(bedLen, 0.06, bodyWidth * 0.96);
    const bedFloor = new THREE.Mesh(bedFloorGeo, trimMat);
    bedFloor.position.set(bedCenterX, 0.44, 0);
    group.add(bedFloor);

    // Sculpted Bed Side Walls with slight outward bulge
    const createBedWallGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(bedLen, 0.44, 14, 8);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + bedLen / 2) / bedLen;
        const bulge = Math.sin(u * Math.PI) * 0.012;
        pos.setX(i, (isLeft ? -1 : 1) * bulge);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const bedWallL = new THREE.Mesh(createBedWallGeo(true), bodyPaintMat);
    bedWallL.position.set(bedCenterX, 0.66, -bodyWidth / 2);
    bedWallL.castShadow = true;
    const bedWallR = new THREE.Mesh(createBedWallGeo(false), bodyPaintMat);
    bedWallR.position.set(bedCenterX, 0.66, bodyWidth / 2);
    bedWallR.castShadow = true;
    group.add(bedWallL, bedWallR);

    // Functional Drop-Down Tailgate
    const tailgateGeo = new THREE.BoxGeometry(0.05, 0.44, bodyWidth * 0.96);
    const tailgate = new THREE.Mesh(tailgateGeo, bodyPaintMat);
    tailgate.position.set(rearBumperX + 0.16, 0.66, 0);
    group.add(tailgate);

    // Heavy-Duty Rear Steel Step Bumper
    const rearBumperGeo = new THREE.BoxGeometry(0.24, 0.18, bodyWidth * 1.04);
    const rearBumper = new THREE.Mesh(rearBumperGeo, strutMat);
    rearBumper.position.set(rearBumperX + 0.06, 0.38, 0);
    group.add(rearBumper);

    return group;
  }

  // ==========================================================================
  // ARCHETYPE 6: SPORT HATCHBACK & WAGON
  // ==========================================================================
  private static buildHatchbackWagonBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    trimMat: THREE.Material,
    strutMat: THREE.Material,
    rubberMat: THREE.Material,
    exhaustMat: THREE.Material,
    articulation: BodyClosuresArticulation
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'HatchbackWagon_Body';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;
    const bodyWidth = (halfTfM + halfTrM) * 1.04;

    // 1. Lower Floor
    const floorGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.03, bodyWidth);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(midX, 0.12, 0);
    group.add(floor);

    // 2. Athletic Front Fascia & Honeycomb Mesh (28x16 lofted curve)
    const createHatchNoseGeo = (): THREE.BufferGeometry => {
      const spanX = frontNoseX - frontAxleX + 0.10;
      const spanZ = bodyWidth * 0.94;
      const geo = new THREE.PlaneGeometry(spanX, spanZ, 28, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + spanX / 2) / spanX;
        const v = Math.abs(pz) / (spanZ / 2);

        const noseY = 0.56 - u * 0.18;
        const crownZ = -Math.pow(v, 2.0) * 0.06;
        pos.setY(i, noseY + crownZ);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const hatchNose = new THREE.Mesh(createHatchNoseGeo(), bodyPaintMat);
    hatchNose.position.set((frontNoseX + frontAxleX - 0.10) / 2, 0, 0);
    hatchNose.castShadow = true;
    group.add(hatchNose);

    // Compact Sculpted Hood with Twin Feature Creases
    const hoodLen = frontNoseX - frontAxleX + 0.14;
    const createHatchHoodGeo = (): THREE.BufferGeometry => {
      const spanZ = bodyWidth * 0.90;
      const geo = new THREE.PlaneGeometry(hoodLen, spanZ, 28, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);
        const u = (px + hoodLen / 2) / hoodLen;
        const v = Math.abs(pz) / (spanZ / 2);

        const slopeY = 0.68 - u * 0.12;
        const crown = (1.0 - Math.pow(v, 2.0)) * 0.022;
        pos.setY(i, slopeY + crown);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const hatchHood = new THREE.Mesh(createHatchHoodGeo(), bodyPaintMat);
    const hoodOpenAngle = (articulation.hoodOpenProgress || 0) * 0.65;
    hatchHood.position.set(frontAxleX + hoodLen * 0.44, Math.sin(hoodOpenAngle) * 0.25, 0);
    hatchHood.rotation.z = -hoodOpenAngle;
    hatchHood.castShadow = true;
    group.add(hatchHood);

    // 3. 2-Box Cabin Section with Sculpted Doors
    const cabinLen = wbM * 0.82;
    const createHatchDoorGeo = (isLeft: boolean): THREE.BufferGeometry => {
      const dLen = cabinLen * 0.48, dH = 0.46;
      const geo = new THREE.PlaneGeometry(dLen, dH, 18, 10);
      geo.rotateY(Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const pz = pos.getZ(i); const py = pos.getY(i);
        const u = (pz + dLen / 2) / dLen;
        const h = (py + dH / 2) / dH;
        const tuck = Math.sin(u * Math.PI) * 0.03;
        const tumble = Math.sin(h * Math.PI) * 0.02 - Math.pow(h, 2.5) * 0.012;
        pos.setX(i, (isLeft ? -1 : 1) * (tuck + tumble));
      }
      geo.computeVertexNormals();
      return geo;
    };
    const hatchDoorFL = new THREE.Mesh(createHatchDoorGeo(true), bodyPaintMat);
    hatchDoorFL.position.set(midX + cabinLen * 0.22, 0.46, -bodyWidth / 2);
    hatchDoorFL.castShadow = true;
    const hatchDoorFR = new THREE.Mesh(createHatchDoorGeo(false), bodyPaintMat);
    hatchDoorFR.position.set(midX + cabinLen * 0.22, 0.46, bodyWidth / 2);
    hatchDoorFR.castShadow = true;
    group.add(hatchDoorFL, hatchDoorFR);

    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(0.60, bodyWidth * 0.78);
    windshieldGeo.rotateX(-Math.PI / 2);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(midX + cabinLen * 0.38, 0.80, 0);
    windshield.rotation.z = -0.58;
    group.add(windshield);

    // Extended Flat Roofline with sculpted curvature
    const createHatchRoofGeo = (): THREE.BufferGeometry => {
      const rLen = cabinLen * 0.86, rW = bodyWidth * 0.80;
      const geo = new THREE.PlaneGeometry(rLen, rW, 18, 10);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const pz = pos.getZ(i);
        const u = Math.abs(pz) / (rW / 2);
        const crown = (1.0 - Math.pow(u, 2.0)) * 0.012;
        pos.setY(i, crown);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const roof = new THREE.Mesh(createHatchRoofGeo(), bodyPaintMat);
    roof.position.set(midX - 0.06, 0.98, 0);
    roof.castShadow = true;
    group.add(roof);

    // Roof Hatch Spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.24, 0.04, bodyWidth * 0.78);
    const spoiler = new THREE.Mesh(spoilerGeo, carbonMat);
    spoiler.position.set(midX - cabinLen * 0.48, 1.02, 0);
    spoiler.rotation.z = -0.15;
    group.add(spoiler);

    // 4. Steep Rear Hatch Glass & Tailgate
    const hatchGlassGeo = new THREE.PlaneGeometry(0.56, bodyWidth * 0.74);
    hatchGlassGeo.rotateX(-Math.PI / 2);
    const hatchGlass = new THREE.Mesh(hatchGlassGeo, glassMat);
    hatchGlass.position.set(midX - cabinLen * 0.46, 0.76, 0);
    hatchGlass.rotation.z = 0.58;
    group.add(hatchGlass);

    // Lower Tailgate Panel
    const hatchDoorGeo = new THREE.BoxGeometry(0.06, 0.36, bodyWidth * 0.88);
    const hatchDoor = new THREE.Mesh(hatchDoorGeo, bodyPaintMat);
    hatchDoor.position.set(rearBumperX + 0.16, 0.48, 0);
    group.add(hatchDoor);

    // Sculpted Rear Bumper with compound curvature
    const createHatchBumperGeo = (): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(0.30, bodyWidth * 0.94, 14, 10);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i); const pz = pos.getZ(i);
        const v = Math.abs(pz) / (bodyWidth * 0.47);
        pos.setX(i, Math.pow(v, 2.5) * 0.025);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const rearBumper = new THREE.Mesh(createHatchBumperGeo(), bodyPaintMat);
    rearBumper.position.set(rearBumperX + 0.16, 0.34, 0);
    rearBumper.rotation.y = Math.PI / 2;
    rearBumper.castShadow = true;

    const exhaustTipGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.08, 16);
    exhaustTipGeo.rotateZ(Math.PI / 2);
    const exL = new THREE.Mesh(exhaustTipGeo, exhaustMat);
    exL.position.set(-0.14, -0.04, -0.06);
    const exR = exL.clone();
    exR.position.z = 0.06;
    rearBumper.add(exL, exR);
    group.add(rearBumper);

    return group;
  }

  // ==========================================================================
  // ARCHETYPE 7: FORMULA SINGLE-SEATER (OPEN-WHEEL MONOPOSTO)
  // ==========================================================================
  private static buildFormulaSingleSeaterBody(
    frontAxleX: number,
    rearAxleX: number,
    frontNoseX: number,
    rearBumperX: number,
    halfTfM: number,
    halfTrM: number,
    bodyPaintMat: THREE.Material,
    carbonMat: THREE.Material,
    haloMat: THREE.Material,
    rainLightMat: THREE.Material,
    trimMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FormulaSingleSeater_Body';

    const wbM = frontAxleX - rearAxleX;
    const midX = (frontAxleX + rearAxleX) / 2;

    // 1. Carbon Stepped Floor & Underbody Tea-Tray
    const floorGeo = new THREE.BoxGeometry(frontNoseX - rearBumperX, 0.02, 1.40);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(midX, 0.08, 0);
    group.add(floor);

    // 2. Needle-Sharp Aerodynamic Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.18, frontNoseX - frontAxleX + 0.35, 16);
    noseGeo.rotateZ(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyPaintMat);
    nose.position.set(frontAxleX + (frontNoseX - frontAxleX + 0.35) * 0.45, 0.32, 0);
    group.add(nose);

    // Multi-Element Front Downforce Wing with Endplate Vortex Fences
    const frontWingGeo = new THREE.BoxGeometry(0.28, 0.025, halfTfM * 2.15);
    const frontWing = new THREE.Mesh(frontWingGeo, carbonMat);
    frontWing.position.set(frontNoseX - 0.05, 0.12, 0);

    const endplateGeo = new THREE.BoxGeometry(0.36, 0.22, 0.015);
    const endL = new THREE.Mesh(endplateGeo, carbonMat);
    endL.position.set(0, 0.08, -halfTfM * 1.08);
    const endR = endL.clone();
    endR.position.z = halfTfM * 1.08;
    frontWing.add(endL, endR);
    group.add(frontWing);

    // 3. Narrow Monocoque Chassis Cockpit (Width = 0.62m)
    const monocoqueGeo = new THREE.BoxGeometry(wbM * 0.72, 0.36, 0.64);
    const monocoque = new THREE.Mesh(monocoqueGeo, bodyPaintMat);
    monocoque.position.set(midX + 0.08, 0.36, 0);
    group.add(monocoque);

    // 4. Grade-5 Titanium Halo Driver Safety Hoop
    const haloArchGeo = new THREE.TorusGeometry(0.24, 0.028, 16, 24, Math.PI);
    haloArchGeo.rotateZ(Math.PI);
    const haloArch = new THREE.Mesh(haloArchGeo, haloMat);
    haloArch.position.set(midX + 0.04, 0.72, 0);

    const haloCenterStrutGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.26, 12);
    const haloStrut = new THREE.Mesh(haloCenterStrutGeo, haloMat);
    haloStrut.position.set(midX + 0.26, 0.62, 0);
    haloStrut.rotation.z = -0.42;
    group.add(haloArch, haloStrut);

    // 5. Sculpted Left & Right Sidepod Radiator Ducts
    const sidepodLen = wbM * 0.54;
    const sidepodGeo = new THREE.BoxGeometry(sidepodLen, 0.32, 0.38);
    const sidepodL = new THREE.Mesh(sidepodGeo, bodyPaintMat);
    sidepodL.position.set(midX - 0.06, 0.30, -0.52);

    const sidepodR = sidepodL.clone();
    sidepodR.position.z = 0.52;
    group.add(sidepodL, sidepodR);

    // 6. Engine Cowl Shark Fin & Overhead Air Intake Snorkel
    const snorkelGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.38, 16);
    snorkelGeo.rotateZ(Math.PI / 2);
    const snorkel = new THREE.Mesh(snorkelGeo, bodyPaintMat);
    snorkel.position.set(midX - 0.22, 0.82, 0);
    group.add(snorkel);

    const sharkFinGeo = new THREE.BoxGeometry(wbM * 0.44, 0.32, 0.015);
    const sharkFin = new THREE.Mesh(sharkFinGeo, carbonMat);
    sharkFin.position.set(rearAxleX + wbM * 0.18, 0.74, 0);
    group.add(sharkFin);

    // 7. High-Mount Dual-Element Rear Downforce Wing with Flashing Rain Light
    const rearWingGeo = new THREE.BoxGeometry(0.32, 0.03, halfTrM * 1.85);
    const rearWing = new THREE.Mesh(rearWingGeo, carbonMat);
    rearWing.position.set(rearBumperX + 0.12, 0.94, 0);

    const rearEndplateGeo = new THREE.BoxGeometry(0.42, 0.48, 0.015);
    const rearEndL = new THREE.Mesh(rearEndplateGeo, carbonMat);
    rearEndL.position.set(0, -0.06, -halfTrM * 0.92);
    const rearEndR = rearEndL.clone();
    rearEndR.position.z = halfTrM * 0.92;
    rearWing.add(rearEndL, rearEndR);

    // FIA Flashing Red Rain Light
    const rainLightGeo = new THREE.BoxGeometry(0.04, 0.06, 0.08);
    const rainLight = new THREE.Mesh(rainLightGeo, rainLightMat);
    rainLight.position.set(rearBumperX + 0.04, 0.22, 0);

    group.add(rearWing, rainLight);
    return group;
  }
}

