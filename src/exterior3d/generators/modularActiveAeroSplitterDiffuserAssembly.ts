/**
 * ============================================================================
 * MODULAR ACTIVE AERO SPLITTER, ROOF SHARK FIN & DIFFUSER ASSEMBLY
 * ============================================================================
 * Generates competition aerodynamic hardware for high-downforce GT3 & LMH track machinery:
 *
 * 1. Active Motorized Front Splitter with Dynamic Underside Flaps ($0^\circ \to 25^\circ$ Pitch)
 * 2. Carbon-Fiber Underfloor Keel Guides & Air Dam Vortex Generators
 * 3. Quick-Release Anodized Aluminum / Titanium Front Tow Hook Assembly
 * 4. High-Speed FIA Yaw-Stability Roof Shark Fin with Pitot Tube Mast
 * 5. Dynamic DRS & Downforce Balance Telemetry Solver (Front/Rear % Balance)
 * ============================================================================
 */

import * as THREE from "three";

export interface ActiveSplitterSharkFinSpec {
  splitterExtensionMm: number; // e.g. 180mm front protrusion
  splitterFlapAngleDeg: number; // 0° (Low Drag) to 25° (Maximum Braking / High Downforce)
  hasRoofSharkFin: boolean;
  sharkFinHeightMm: number; // e.g. 280mm
  hasAnodizedTowHook: boolean;
  towHookColorHex: string; // e.g. "#ef4444" (Racing Red)
  hasUnderfloorStrakes: boolean;
}

export interface SplitterAeroBalanceResult {
  frontDownforceN: number;
  splitterEfficiencyLOverD: number;
  aerodynamicBalanceFrontPct: number; // e.g. 44.5% Front / 55.5% Rear
  yawStabilityDerivCnBeta: number; // High-speed yaw restoring moment from shark fin
}

export class ModularActiveAeroSplitterDiffuserAssembly {
  /**
   * Generates Watertight 3D Active Splitter & Shark Fin Hardware Assembly.
   */
  public static generateAssembly(
    spec: ActiveSplitterSharkFinSpec,
    materials?: {
      carbonSplitterMat?: THREE.Material;
      titaniumSupportRodsMat?: THREE.Material;
      anodizedHardwareMat?: THREE.Material;
      pitotProbeMat?: THREE.Material;
    }
  ): THREE.Group {
    const masterGroup = new THREE.Group();
    masterGroup.name = "ACTIVE_AERO_SPLITTER_SHARK_FIN_ASSEMBLY";

    const defaultCarbonMat =
      materials?.carbonSplitterMat ||
      new THREE.MeshPhysicalMaterial({
        color: 0x14181f,
        roughness: 0.22,
        metalness: 0.9,
        clearcoat: 0.9,
      });

    const defaultTiMat =
      materials?.titaniumSupportRodsMat ||
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.2,
        metalness: 0.98,
      });

    const defaultTowMat =
      materials?.anodizedHardwareMat ||
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.towHookColorHex),
        roughness: 0.3,
        metalness: 0.85,
      });

    const defaultPitotMat =
      materials?.pitotProbeMat ||
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.15,
        metalness: 0.99,
      });

    // ── 1. Front Active Carbon Splitter Blade ──
    const splitter = this.buildActiveFrontSplitter(spec, defaultCarbonMat, defaultTiMat);
    masterGroup.add(splitter);

    // ── 2. FIA Racing Tow Hook ──
    if (spec.hasAnodizedTowHook) {
      const towHook = this.buildTowHook(spec, defaultTowMat, defaultTiMat);
      masterGroup.add(towHook);
    }

    // ── 3. High-Speed Roof Shark Fin & Pitot Sensor Mast ──
    if (spec.hasRoofSharkFin) {
      const sharkFin = this.buildRoofSharkFin(spec, defaultCarbonMat, defaultPitotMat);
      masterGroup.add(sharkFin);
    }

    // ── 4. Underfloor Keel Air Dam Strakes ──
    if (spec.hasUnderfloorStrakes) {
      const strakes = this.buildUnderfloorKeelStrakes(defaultCarbonMat);
      masterGroup.add(strakes);
    }

    return masterGroup;
  }

  /**
   * Builds 3D Active Front Splitter with Motorized Flap and Support Tie Rods.
   */
  private static buildActiveFrontSplitter(
    spec: ActiveSplitterSharkFinSpec,
    carbonMat: THREE.Material,
    tiMat: THREE.Material
  ): THREE.Group {
    const splitterGroup = new THREE.Group();
    splitterGroup.name = "FRONT_ACTIVE_SPLITTER_BLADE";

    const extM = spec.splitterExtensionMm / 1000;

    // 1. Main Sculpted Carbon Splitter Tray
    const trayShape = new THREE.Shape();
    trayShape.moveTo(-1.02, 0);
    trayShape.lineTo(-1.02, 0.45);
    trayShape.lineTo(-0.85, 0.45 + extM);
    trayShape.lineTo(0.85, 0.45 + extM);
    trayShape.lineTo(1.02, 0.45);
    trayShape.lineTo(1.02, 0);
    trayShape.closePath();

    const trayGeo = new THREE.ExtrudeGeometry(trayShape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    });

    const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
    trayMesh.rotation.x = Math.PI / 2;
    trayMesh.position.set(0, 0.12, -2.15);
    trayMesh.castShadow = true;
    splitterGroup.add(trayMesh);

    // 2. Motorized Dynamic Underside Aero Flap
    const flapGeo = new THREE.BoxGeometry(0.72, 0.008, 0.18);
    const flapMesh = new THREE.Mesh(flapGeo, carbonMat);
    flapMesh.position.set(0, 0.10, -2.05);
    flapMesh.rotation.x = THREE.MathUtils.degToRad(-spec.splitterFlapAngleDeg);
    flapMesh.castShadow = true;
    splitterGroup.add(flapMesh);

    // 3. Titanium Splitter Support Tie Rods
    const rodAngles = [-0.45, 0.45];
    for (const rx of rodAngles) {
      const rodGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.28, 8);
      const rodMesh = new THREE.Mesh(rodGeo, tiMat);
      rodMesh.position.set(rx, 0.24, -2.18);
      rodMesh.rotation.x = THREE.MathUtils.degToRad(32);
      rodMesh.castShadow = true;
      splitterGroup.add(rodMesh);
    }

    return splitterGroup;
  }

  /**
   * Builds Front Racing Tow Hook with CNC Machined Pivot Ring.
   */
  private static buildTowHook(
    spec: ActiveSplitterSharkFinSpec,
    towMat: THREE.Material,
    tiMat: THREE.Material
  ): THREE.Group {
    const towGroup = new THREE.Group();
    towGroup.name = "RACING_TOW_HOOK";

    // Stem Mount
    const stemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12);
    const stemMesh = new THREE.Mesh(stemGeo, tiMat);
    stemMesh.rotation.x = Math.PI / 2;
    stemMesh.position.set(0.35, 0.28, -2.22);
    towGroup.add(stemMesh);

    // Torus Tow Eyelet Ring
    const ringGeo = new THREE.TorusGeometry(0.026, 0.007, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, towMat);
    ringMesh.position.set(0.35, 0.28, -2.27);
    towGroup.add(ringMesh);

    return towGroup;
  }

  /**
   * Builds Roof Centerline Yaw Stability Shark Fin with Pitot Tube.
   */
  private static buildRoofSharkFin(
    spec: ActiveSplitterSharkFinSpec,
    carbonMat: THREE.Material,
    pitotMat: THREE.Material
  ): THREE.Group {
    const finGroup = new THREE.Group();
    finGroup.name = "ROOF_YAW_STABILITY_SHARK_FIN";

    const finHeightM = spec.sharkFinHeightMm / 1000;

    // 1. Aerodynamic Fin Blade (Tapered NACA 0006 Chord)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.008, 0);
    finShape.lineTo(0.004, finHeightM);
    finShape.lineTo(-1.25, 0.02);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.012,
      bevelEnabled: false,
    });

    const finMesh = new THREE.Mesh(finGeo, carbonMat);
    finMesh.rotation.y = Math.PI / 2;
    finMesh.position.set(0.006, 1.15, 0.35);
    finMesh.castShadow = true;
    finGroup.add(finMesh);

    // 2. High-Precision Airspeed Pitot Tube Mast
    const pitotGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.16, 8);
    const pitotMesh = new THREE.Mesh(pitotGeo, pitotMat);
    pitotMesh.rotation.x = Math.PI / 2;
    pitotMesh.position.set(0, 1.15 + finHeightM, 0.35);
    finGroup.add(pitotMesh);

    return finGroup;
  }

  /**
   * Builds Underfloor Keel Air Dam Strakes.
   */
  private static buildUnderfloorKeelStrakes(carbonMat: THREE.Material): THREE.Group {
    const strakesGroup = new THREE.Group();
    strakesGroup.name = "UNDERFLOOR_KEEL_STRAKES";

    const strakeOffsets = [-0.55, -0.25, 0.25, 0.55];
    for (const ox of strakeOffsets) {
      const sGeo = new THREE.BoxGeometry(0.008, 0.045, 0.65);
      const sMesh = new THREE.Mesh(sGeo, carbonMat);
      sMesh.position.set(ox, 0.09, -1.65);
      sMesh.castShadow = true;
      strakesGroup.add(sMesh);
    }

    return strakesGroup;
  }

  /**
   * Solves Active Splitter Aerodynamic Downforce & Yaw Restoring Stability.
   */
  public static solveAeroBalance(
    spec: ActiveSplitterSharkFinSpec,
    rearDownforceN: number = 2800,
    airspeedKmH: number = 280
  ): SplitterAeroBalanceResult {
    const v = airspeedKmH / 3.6;
    const q = 0.5 * 1.225 * v * v;

    // Splitter Extension & Dynamic Flap Angle Downforce
    const areaM2 = (spec.splitterExtensionMm / 1000) * 1.85;
    const flapClFactor = 1.0 + (spec.splitterFlapAngleDeg / 25) * 0.85;
    const frontDownforceN = q * areaM2 * 1.45 * flapClFactor;

    const totalDownforce = frontDownforceN + rearDownforceN;
    const frontPct = (frontDownforceN / totalDownforce) * 100;

    // Shark fin aerodynamic yaw damping derivative
    const yawStability = spec.hasRoofSharkFin ? 0.082 : 0.024;

    return {
      frontDownforceN,
      splitterEfficiencyLOverD: 4.6 - (spec.splitterFlapAngleDeg / 25) * 0.9,
      aerodynamicBalanceFrontPct: Math.round(frontPct * 10) / 10,
      yawStabilityDerivCnBeta: yawStability,
    };
  }
}
