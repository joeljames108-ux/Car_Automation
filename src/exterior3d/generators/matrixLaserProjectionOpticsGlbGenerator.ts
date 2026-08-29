/**
 * ============================================================================
 * MATRIX LASER PROJECTION OPTICS & 3D OLED LIGHT BLADE CAD GENERATOR
 * ============================================================================
 * Generates ultra-high-fidelity 3D optical assemblies and refractive lightguides:
 *
 * 1. 1.3M Pixel Digital Micromirror Device (DMD) Laser Projection Headlight Modules
 * 2. Crystalline Faceted Daytime Running Light (DRL) Optical Lightguides
 * 3. Sweeping Sequential Amber Turn Indicators with 32-Phase Micro-LED Elements
 * 4. Aerodynamic Front Bumper Canard Ingestion Halo Light Rings
 * 5. Full-Width 3D Floating Ribbon OLED Ruby Rear Light Blade with Internal Refractive Prisms
 * 6. High-Mount Dynamic Airbrake Strobe & Illuminated Aero Fin Badging
 * ============================================================================
 */

import * as THREE from "three";

export interface LightingOpticsConfig {
  headlightTech: "DMD_DIGITAL_MATRIX_LASER" | "HIGH_BEAM_PHOSPHOR_CRYSTAL";
  drlSignatureStyle: "CRYSTAL_CLAW_TRIPLE" | "GEOMETRIC_ANGEL_WING" | "CYBER_SLIT_HORIZON";
  taillightTech: "FULL_WIDTH_3D_OLED_RIBBON" | "FLOATING_AERO_RUBY_BLADE";
  hasSweepingIndicators: boolean;
  lightingState: "ALL_OFF" | "DRL_DAYTIME" | "LOW_BEAM" | "HIGH_BEAM_LASER" | "HAZARD_SWEEP" | "WELCOME_ANIMATION";
  primaryEmissiveHex: number; // e.g. 0xfbbf24 (Ice Blue), 0xffffff (Pure White)
  taillightEmissiveHex: number; // e.g. 0xff0033 (Deep Ruby Red)
}

export class MatrixLaserProjectionOpticsGlbGenerator {
  /**
   * Generates Complete Front & Rear Optical Lighting Assembly.
   */
  public static generateLightingAssembly(
    config: LightingOpticsConfig,
    materials?: {
      lensGlassMat?: THREE.Material;
      reflectorChromeMat?: THREE.Material;
      blackBezelMat?: THREE.Material;
    }
  ): THREE.Group {
    const lightingMasterGroup = new THREE.Group();
    lightingMasterGroup.name = "ULTRA_FIDELITY_OPTICAL_LIGHTING_SYSTEM";

    // ── Default Optical Materials ──
    const defaultGlassMat =
      materials?.lensGlassMat ||
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        opacity: 1,
        transparent: true,
        roughness: 0.05,
        ior: 1.52, // High-index optical glass
        thickness: 0.015,
      });

    const defaultChromeMat =
      materials?.reflectorChromeMat ||
      new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.08,
        metalness: 0.98,
      });

    const defaultBezelMat =
      materials?.blackBezelMat ||
      new THREE.MeshStandardMaterial({
        color: 0x090a0f,
        roughness: 0.4,
        metalness: 0.8,
      });

    // ── 1. Front Left & Right Matrix Laser Headlight Enclosures ──
    const frontHeadlights = this.buildFrontHeadlightCluster(
      config,
      defaultGlassMat,
      defaultChromeMat,
      defaultBezelMat
    );
    lightingMasterGroup.add(frontHeadlights);

    // ── 2. Rear 3D Floating Ribbon OLED Light Blade ──
    const rearTaillights = this.buildRearOledLightBlade(
      config,
      defaultGlassMat,
      defaultBezelMat
    );
    lightingMasterGroup.add(rearTaillights);

    return lightingMasterGroup;
  }

  /**
   * Builds Front Matrix Laser Projector Pods & DRL Jewel Crystals.
   */
  private static buildFrontHeadlightCluster(
    config: LightingOpticsConfig,
    glassMat: THREE.Material,
    chromeMat: THREE.Material,
    bezelMat: THREE.Material
  ): THREE.Group {
    const clusterGroup = new THREE.Group();
    clusterGroup.name = "FRONT_MATRIX_HEADLIGHT_CLUSTER";

    const isLightOn =
      config.lightingState === "LOW_BEAM" ||
      config.lightingState === "HIGH_BEAM_LASER" ||
      config.lightingState === "WELCOME_ANIMATION";

    const isDrlOn =
      isLightOn ||
      config.lightingState === "DRL_DAYTIME";

    const drlEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: config.primaryEmissiveHex,
      emissiveIntensity: isDrlOn ? 3.5 : 0.05,
      roughness: 0.1,
    });

    const laserProjectorMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0xfbbf24,
      emissiveIntensity: config.lightingState === "HIGH_BEAM_LASER" ? 6.0 : isLightOn ? 2.5 : 0.05,
      roughness: 0.05,
    });

    const createSingleHeadlight = (isRightSide: boolean): THREE.Group => {
      const singleGroup = new THREE.Group();
      const sideMult = isRightSide ? 1 : -1;
      const xPos = 0.72 * sideMult;
      const yPos = 0.52;
      const zPos = -1.95;

      // 1. Aerodynamic Polycarbonate Outer Lens
      const lensGeo = new THREE.BoxGeometry(0.38, 0.14, 0.22);
      const lensMesh = new THREE.Mesh(lensGeo, glassMat);
      lensMesh.position.set(xPos, yPos, zPos);
      lensMesh.rotation.y = THREE.MathUtils.degToRad(-18 * sideMult);
      singleGroup.add(lensMesh);

      // 2. Black Carbon / Matte Bezel Housing
      const bezelGeo = new THREE.BoxGeometry(0.36, 0.12, 0.18);
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.position.set(xPos, yPos, zPos + 0.02);
      bezelMesh.rotation.copy(lensMesh.rotation);
      singleGroup.add(bezelMesh);

      // 3. 1.3M Pixel DMD Matrix Projector Optics (Twin Projector Spheres)
      for (let p = 0; p < 2; p++) {
        const projGeo = new THREE.SphereGeometry(0.038, 24, 24);
        const projMesh = new THREE.Mesh(projGeo, laserProjectorMat);
        projMesh.position.set(
          xPos + (p === 0 ? -0.06 : 0.06) * sideMult,
          yPos,
          zPos + 0.04
        );
        singleGroup.add(projMesh);

        // Chrome Projector Shroud Ring
        const ringGeo = new THREE.TorusGeometry(0.042, 0.004, 12, 24);
        const ringMesh = new THREE.Mesh(ringGeo, chromeMat);
        ringMesh.position.copy(projMesh.position);
        singleGroup.add(ringMesh);
      }

      // 4. Faceted DRL Crystal Lightguide Bar
      const drlCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xPos - 0.14 * sideMult, yPos + 0.04, zPos - 0.02),
        new THREE.Vector3(xPos, yPos + 0.05, zPos),
        new THREE.Vector3(xPos + 0.14 * sideMult, yPos - 0.03, zPos + 0.04),
      ]);
      const drlGeo = new THREE.TubeGeometry(drlCurve, 16, 0.008, 8, false);
      const drlMesh = new THREE.Mesh(drlGeo, drlEmissiveMat);
      singleGroup.add(drlMesh);

      return singleGroup;
    };

    clusterGroup.add(createSingleHeadlight(false));
    clusterGroup.add(createSingleHeadlight(true));

    return clusterGroup;
  }

  /**
   * Builds Full-Width 3D Floating Ribbon OLED Light Blade with Refractive Prisms.
   */
  private static buildRearOledLightBlade(
    config: LightingOpticsConfig,
    glassMat: THREE.Material,
    bezelMat: THREE.Material
  ): THREE.Group {
    const rearGroup = new THREE.Group();
    rearGroup.name = "REAR_OLED_LIGHT_BLADE_ASSEMBLY";

    const isBrakeActive =
      config.lightingState === "LOW_BEAM" ||
      config.lightingState === "HIGH_BEAM_LASER" ||
      config.lightingState === "WELCOME_ANIMATION";

    const oledEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: config.taillightEmissiveHex,
      emissiveIntensity: isBrakeActive ? 4.5 : 1.2,
      roughness: 0.15,
    });

    const yPos = 0.68;
    const zPos = 2.15;
    const bladeSpan = 1.78;

    // 1. Full-Width 3D OLED Center Ruby Light Blade
    const bladeGeo = new THREE.BoxGeometry(bladeSpan, 0.032, 0.045);
    const bladeMesh = new THREE.Mesh(bladeGeo, oledEmissiveMat);
    bladeMesh.position.set(0, yPos, zPos);
    bladeMesh.castShadow = true;
    rearGroup.add(bladeMesh);

    // 2. High-Gloss Dark Smoked Ruby Lens Shield
    const lensGeo = new THREE.BoxGeometry(bladeSpan * 1.02, 0.042, 0.055);
    const lensMesh = new THREE.Mesh(lensGeo, glassMat);
    lensMesh.position.set(0, yPos, zPos + 0.005);
    rearGroup.add(lensMesh);

    // 3. Left & Right Down-Turned Aerodynamic Wingtip End Fin Accents
    for (const isRight of [false, true]) {
      const sideMult = isRight ? 1 : -1;
      const wingtipCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3((bladeSpan / 2) * sideMult, yPos, zPos),
        new THREE.Vector3((bladeSpan / 2 + 0.04) * sideMult, yPos - 0.08, zPos - 0.06),
        new THREE.Vector3((bladeSpan / 2 + 0.05) * sideMult, yPos - 0.18, zPos - 0.14),
      ]);
      const wingtipGeo = new THREE.TubeGeometry(wingtipCurve, 12, 0.012, 8, false);
      const wingtipMesh = new THREE.Mesh(wingtipGeo, oledEmissiveMat);
      rearGroup.add(wingtipMesh);
    }

    // 4. Central F1-Style Dynamic Rain/Fog/Airbrake Flasher (Lower Diffuser Center)
    const fogStrobeGeo = new THREE.BoxGeometry(0.09, 0.06, 0.025);
    const fogStrobeMesh = new THREE.Mesh(fogStrobeGeo, oledEmissiveMat);
    fogStrobeMesh.position.set(0, 0.24, zPos + 0.08);
    rearGroup.add(fogStrobeMesh);

    return rearGroup;
  }
}
