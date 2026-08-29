// ====================================================================
// LIGHTING OPTICS SYSTEM - Headlight/Taillight LED Arrays and Light Pipes
// ====================================================================
// Complete automotive lighting simulation:
// - Matrix LED headlights with individual zone control
// - Sequential/animated turn signals
// - Adaptive driving beam patterns
// - Welcome/leaving home lights
// - Ambient underbody and interior illumination
// - Light pipe / light guide geometry
// - Projector lens with Fresnel optics
// - Volumetric light cones with realistic falloff
// - LED color temperature calibration (2700K-8000K)
// ====================================================================

import * as THREE from 'three';

export interface HeadlightConfig {
  projectorDiameter: number;
  ledCount: number;
  colorTempK: number;
  drlStyle: 'strip' | 'halo' | 'signature' | 'eyebrow' | 'double_l';
  turnSignal: boolean;
  matrixZones: number;
  adaptiveHighBeam: boolean;
  welcomeLight: boolean;
}

export interface TaillightConfig {
  ledCount: number;
  style: 'continuous_strip' | 'segmented' | '3d_wave' | 'y_shaped' | 'l_shaped';
  brakeIntensity: number;
  reverseLight: boolean;
  fogLight: boolean;
  sequential: boolean;
  welcomeAnimation: boolean;
}

export interface LightPipeConfig {
  length: number;
  curve: 'straight' | 'arc' | 'complex';
  color: THREE.Color;
  brightness: number;
  diffuseWidth: number;
}

export interface AmbientLightConfig {
  underglow: boolean;
  underglowColor: THREE.Color;
  puddleLights: boolean;
  doorOpenLights: boolean;
  trunkLight: boolean;
  engineBayLight: boolean;
}

// --- LED COLOR TEMPERATURE TABLE ---
const LED_COLORS: Record<number, THREE.Color> = {
  2700: new THREE.Color(0xffb366), // Warm incandescent
  3200: new THREE.Color(0xffcc88), // Warm halogen
  4000: new THREE.Color(0xffe4b5), // Neutral white
  4500: new THREE.Color(0xfff0d0), // Natural daylight
  5000: new THREE.Color(0xfff8e8), // Cool white
  5500: new THREE.Color(0xffffff), // Midday sun
  6000: new THREE.Color(0xffffff), // Xenon white
  6500: new THREE.Color(0xf0f4ff), // Cool daylight
  8000: new THREE.Color(0xe0eaff), // Blue-white
};

// --- LIGHTING OPTICS SYSTEM ---
export class LightingOpticsSystem {
  // === HEADLIGHT MATERIALS ===
  public static createHeadlightMaterial(colorTemp: number = 6000): THREE.MeshPhysicalMaterial {
    const color = LED_COLORS[colorTemp] || LED_COLORS[6000];
    return new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: 3.0,
      metalness: 0, roughness: 0.01, clearcoat: 1.0, clearcoatRoughness: 0.005,
      transparent: true, opacity: 0.95, transmission: 0.8, ior: 1.58, thickness: 0.002,
    });
  }

  public static createDRLMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf0f6ff, emissive: 0xd8ecff, emissiveIntensity: 3.5, roughness: 0.1,
    });
  }

  public static createMatrixLEDMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4.0,
      metalness: 0, roughness: 0.01, transmission: 0.85, ior: 1.58,
      thickness: 0.001, clearcoat: 1.0,
    });
  }

  // === TAILLIGHT MATERIALS ===
  public static createTaillightMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xff1122, emissive: 0xff0022, emissiveIntensity: 4.0, roughness: 0.08,
    });
  }

  public static createBrakeLightMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 5.0, roughness: 0.08,
    });
  }

  public static createTurnSignalMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xff8800, emissive: 0xff6600, emissiveIntensity: 3.0, roughness: 0.1,
    });
  }

  public static createSequentialSignalMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 3.5, roughness: 0.08,
      transparent: true, opacity: 0.9,
    });
  }

  public static createReverseLightMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.5, roughness: 0.1,
    });
  }

  public static createFogLightMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffdd, emissive: 0xffffaa, emissiveIntensity: 2.0,
      transmission: 0.5, ior: 1.5, thickness: 0.003, roughness: 0.05, clearcoat: 0.8,
    });
  }

  // === HOUSING & LENS ===
  public static createReflectiveHousingMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xd0d4dc, metalness: 0.95, roughness: 0.02,
      clearcoat: 1.0, clearcoatRoughness: 0.01, envMapIntensity: 3.0,
    });
  }

  public static createProjectorLensMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 0.95, ior: 1.58,
      thickness: 0.004, roughness: 0.01, clearcoat: 1.0, clearcoatRoughness: 0.003,
    });
  }

  public static createChromaticAberrationLens(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xf8f8ff, transmission: 0.92, ior: 1.58,
      thickness: 0.005, roughness: 0.005, clearcoat: 1.0, clearcoatRoughness: 0.002,
      dispersion: 0.5, envMapIntensity: 2.5,
    });
  }

  // === LIGHT PIPE / LIGHT GUIDE ===
  public static createLightPipeMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff, emissive: 0xd0e0ff, emissiveIntensity: 2.0,
      transmission: 0.7, ior: 1.49, thickness: 0.008,
      roughness: 0.02, clearcoat: 0.5, transparent: true, opacity: 0.85,
      side: THREE.DoubleSide, depthWrite: false,
    });
  }

  // === VOLUMETRIC LIGHT CONE ===
  public static createVolumetricLightCone(length: number, radius: number, color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    // Outer cone
    const coneGeo = new THREE.ConeGeometry(radius, length, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.08,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    group.add(cone);

    // Inner bright core
    const innerGeo = new THREE.ConeGeometry(radius * 0.3, length * 0.8, 16, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.15,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.rotation.x = Math.PI / 2;
    inner.position.z = length * 0.1;
    group.add(inner);

    // Hot center glow
    const glowGeo = new THREE.ConeGeometry(radius * 0.08, length * 0.6, 8, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().copy(color).multiplyScalar(1.5),
      transparent: true, opacity: 0.25,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = Math.PI / 2;
    glow.position.z = length * 0.15;
    group.add(glow);

    // Ground projection circle
    const groundGeo = new THREE.CircleGeometry(radius * 0.9, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.06,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = length;
    group.add(ground);

    return group;
  }

  // === COMPLETE HEADLIGHT ASSEMBLY ===
  public static buildCompleteHeadlightAssembly(config: HeadlightConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'HeadlightAssembly';

    // Projector lens
    const lensMat = this.createProjectorLensMaterial();
    const lensGeo = new THREE.SphereGeometry(config.projectorDiameter, 32, 32, 0, Math.PI);
    group.add(new THREE.Mesh(lensGeo, lensMat));

    // Reflective housing
    const housingMat = this.createReflectiveHousingMaterial();
    const hGeo = new THREE.CylinderGeometry(
      config.projectorDiameter * 1.2, config.projectorDiameter,
      config.projectorDiameter * 0.5, 32, 1, true
    );
    hGeo.rotateX(Math.PI / 2);
    const housing = new THREE.Mesh(hGeo, housingMat);
    housing.position.z = -config.projectorDiameter * 0.3;
    group.add(housing);

    // Inner reflector bowl
    const bowlGeo = new THREE.SphereGeometry(config.projectorDiameter * 0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bowlMat = this.createReflectiveHousingMaterial();
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.rotation.x = Math.PI;
    bowl.position.z = -config.projectorDiameter * 0.2;
    group.add(bowl);

    // LED array
    const ledMat = this.createHeadlightMaterial(config.colorTempK);
    for (let i = 0; i < config.ledCount; i++) {
      const a = (i / config.ledCount) * Math.PI * 2;
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 8), ledMat);
      led.position.set(
        Math.cos(a) * config.projectorDiameter * 0.5,
        Math.sin(a) * config.projectorDiameter * 0.5,
        0.01
      );
      group.add(led);
    }

    // Matrix LED zones (for adaptive beam)
    if (config.matrixZones > 0) {
      const zoneWidth = config.projectorDiameter * 2 / config.matrixZones;
      const zoneMat = this.createMatrixLEDMaterial();
      for (let i = 0; i < config.matrixZones; i++) {
        const zoneGeo = new THREE.BoxGeometry(zoneWidth * 0.9, 0.004, 0.002);
        const zone = new THREE.Mesh(zoneGeo, zoneMat);
        zone.position.set(
          -config.projectorDiameter + zoneWidth * (i + 0.5),
          -config.projectorDiameter * 0.3,
          0.015
        );
        group.add(zone);
      }
    }

    // DRL styles
    if (config.drlStyle === 'strip') {
      const drl = new THREE.Mesh(
        new THREE.BoxGeometry(config.projectorDiameter * 2.5, 0.004, 0.002),
        this.createDRLMaterial()
      );
      drl.position.y = -config.projectorDiameter * 0.8;
      group.add(drl);
    } else if (config.drlStyle === 'halo') {
      group.add(new THREE.Mesh(
        new THREE.TorusGeometry(config.projectorDiameter * 0.9, 0.003, 8, 64),
        this.createDRLMaterial()
      ));
    } else if (config.drlStyle === 'eyebrow') {
      const browGeo = new THREE.TorusGeometry(config.projectorDiameter * 0.95, 0.002, 6, 32, Math.PI * 0.6);
      const brow = new THREE.Mesh(browGeo, this.createDRLMaterial());
      brow.position.y = config.projectorDiameter * 0.3;
      brow.rotation.z = 0.3;
      group.add(brow);
    } else if (config.drlStyle === 'double_l') {
      for (const side of [-1, 1]) {
        const lGeo = new THREE.BoxGeometry(0.003, config.projectorDiameter * 0.6, 0.002);
        const lMat = this.createDRLMaterial();
        const l = new THREE.Mesh(lGeo, lMat);
        l.position.set(side * config.projectorDiameter * 0.4, 0, 0.01);
        group.add(l);
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(config.projectorDiameter * 0.3, 0.003, 0.002), lMat);
        hBar.position.set(side * config.projectorDiameter * 0.4 - side * config.projectorDiameter * 0.15, config.projectorDiameter * 0.3, 0.01);
        group.add(hBar);
      }
    }

    // Turn signal
    if (config.turnSignal) {
      const sigGeo = new THREE.BoxGeometry(config.projectorDiameter * 0.5, 0.006, 0.002);
      const sig = new THREE.Mesh(sigGeo, this.createTurnSignalMaterial());
      sig.position.set(config.projectorDiameter * 0.8, -config.projectorDiameter * 0.3, 0.01);
      group.add(sig);
    }

    // Volumetric light cone
    const cone = this.createVolumetricLightCone(
      2.5, config.projectorDiameter * 0.5,
      LED_COLORS[config.colorTempK] || LED_COLORS[6000]
    );
    cone.position.z = config.projectorDiameter;
    group.add(cone);

    return group;
  }

  // === COMPLETE TAILLIGHT ASSEMBLY ===
  public static buildCompleteTaillightAssembly(config: TaillightConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'TaillightAssembly';

    const tailMat = this.createTaillightMaterial();
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x800010, transmission: 0.6, ior: 1.58, thickness: 0.003,
      roughness: 0.02, clearcoat: 0.9,
    });

    if (config.style === 'continuous_strip') {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.8), tailMat));
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.82), lensMat));
      // LED dots inside the strip
      for (let i = 0; i < 20; i++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.002, 6, 6),
          new THREE.MeshStandardMaterial({ emissive: 0xff0022, emissiveIntensity: 4 })
        );
        led.position.set(0, 0, -0.35 + i * 0.035);
        group.add(led);
      }
    } else if (config.style === 'segmented') {
      for (let i = 0; i < config.ledCount; i++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.008, 0.06), tailMat);
        seg.position.z = (i - config.ledCount / 2) * 0.07;
        group.add(seg);
      }
    } else if (config.style === '3d_wave') {
      for (let i = 0; i < config.ledCount; i++) {
        const wave = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 0.04), tailMat);
        const z = (i - config.ledCount / 2) * 0.05;
        wave.position.set(0, Math.sin(i * 0.5) * 0.01, z);
        group.add(wave);
      }
    } else if (config.style === 'y_shaped') {
      // Y-shaped light signature
      const stemGeo = new THREE.BoxGeometry(0.02, 0.006, 0.15);
      group.add(new THREE.Mesh(stemGeo, tailMat));
      for (const side of [-1, 1]) {
        const armGeo = new THREE.BoxGeometry(0.02, 0.006, 0.1);
        const arm = new THREE.Mesh(armGeo, tailMat);
        arm.position.set(side * 0.05, 0.02, -0.12);
        arm.rotation.x = side * 0.3;
        group.add(arm);
      }
    } else if (config.style === 'l_shaped') {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.006, 0.3), tailMat);
      group.add(hBar);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.006, 0.15), tailMat);
      vBar.position.set(0, 0, -0.15);
      vBar.rotation.x = Math.PI / 2;
      group.add(vBar);
    }

    // Brake light
    const brakeMat = this.createBrakeLightMaterial();
    const brakeGeo = new THREE.BoxGeometry(0.03, 0.006, 0.4);
    const brake = new THREE.Mesh(brakeGeo, brakeMat);
    brake.position.y = 0.01;
    group.add(brake);

    // Reverse light
    if (config.reverseLight) {
      const rev = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.006, 0.04),
        this.createReverseLightMaterial()
      );
      rev.position.set(0, -0.015, 0.3);
      group.add(rev);
    }

    // Fog light
    if (config.fogLight) {
      const fog = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.006, 0.06),
        this.createFogLightMaterial()
      );
      fog.position.set(0, -0.02, 0.25);
      group.add(fog);
    }

    // Lens cover
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.015, 0.85), lensMat));

    return group;
  }

  // === AMBIENT LIGHT SYSTEM ===
  public static buildAmbientLightSystem(config: AmbientLightConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'AmbientLights';

    if (config.underglow) {
      const underMat = new THREE.MeshBasicMaterial({
        color: config.underglowColor, transparent: true, opacity: 0.3,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      // Underbody strips (front, sides, rear)
      const positions = [
        { w: 1.2, h: 0.01, d: 0.08, pos: new THREE.Vector3(0, -0.01, 0.7) },
        { w: 1.2, h: 0.01, d: 0.08, pos: new THREE.Vector3(0, -0.01, -0.7) },
        { w: 0.08, h: 0.01, d: 1.4, pos: new THREE.Vector3(0.6, -0.01, 0) },
        { w: 0.08, h: 0.01, d: 1.4, pos: new THREE.Vector3(-0.6, -0.01, 0) },
      ];
      for (const p of positions) {
        const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
        const strip = new THREE.Mesh(geo, underMat);
        strip.position.copy(p.pos);
        group.add(strip);
      }
    }

    if (config.puddleLights) {
      const puddleMat = new THREE.MeshBasicMaterial({
        color: 0xfff8e0, transparent: true, opacity: 0.4,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      // Door projection puddle lights
      for (const side of [-0.7, 0.7]) {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), puddleMat);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(0, 0.003, side);
        group.add(puddle);
      }
    }

    if (config.engineBayLight) {
      const engineMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 1.5,
        transparent: true, opacity: 0.6,
      });
      const engineLight = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), engineMat);
      engineLight.position.set(0.3, 0.6, 0);
      group.add(engineLight);
    }

    if (config.trunkLight) {
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.5,
      });
      const trunkLight = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.1), trunkMat);
      trunkLight.position.set(-0.5, 0.5, 0);
      group.add(trunkLight);
    }

    return group;
  }

  // === LIGHT PIPE BUILDER ===
  public static buildLightPipe(config: LightPipeConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'LightPipe';

    const mat = this.createLightPipeMaterial();
    mat.emissive = config.color;
    mat.emissiveIntensity = config.brightness;

    if (config.curve === 'straight') {
      const geo = new THREE.BoxGeometry(0.003, config.diffuseWidth, config.length);
      group.add(new THREE.Mesh(geo, mat));
    } else if (config.curve === 'arc') {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(config.length * 0.3, config.diffuseWidth * 2, config.length * 0.5),
        new THREE.Vector3(0, 0, config.length)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 32, config.diffuseWidth / 2, 8, false);
      group.add(new THREE.Mesh(tubeGeo, mat));
    }

    return group;
  }

  // === SCENE APPLICATION ===
  public static applyHeadlightsToScene(root: THREE.Object3D): void {
    const ledMat = this.createHeadlightMaterial(6000);
    const drlMat = this.createDRLMaterial();
    const reflMat = this.createReflectiveHousingMaterial();
    const lensMat = this.createProjectorLensMaterial();

    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const n = mesh.name.toLowerCase();
      if (n.includes('headlight') && n.includes('led')) mesh.material = ledMat;
      else if (n.includes('drl') || n.includes('daytime')) mesh.material = drlMat;
      else if (n.includes('headlight') && (n.includes('housing') || n.includes('reflector'))) mesh.material = reflMat;
      else if (n.includes('headlight') && n.includes('lens')) mesh.material = lensMat;
    });
  }

  public static applyTaillightsToScene(root: THREE.Object3D): void {
    const tailMat = this.createTaillightMaterial();
    const brakeMat = this.createBrakeLightMaterial();

    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const n = mesh.name.toLowerCase();
      if (n.includes('taillight') && n.includes('brake')) mesh.material = brakeMat;
      else if (n.includes('taillight') || n.includes('lightbar')) mesh.material = tailMat;
      else if (n.includes('fog') && n.includes('light')) mesh.material = this.createFogLightMaterial();
      else if (n.includes('turn') && n.includes('signal')) mesh.material = this.createTurnSignalMaterial();
    });
  }

  public static applyAllLightingToScene(root: THREE.Object3D): void {
    this.applyHeadlightsToScene(root);
    this.applyTaillightsToScene(root);
  }

  // === WELCOME LIGHT SEQUENCE ===
  public static buildWelcomeLightSequence(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'WelcomeLightSequence';

    // Ground puddle projection lights (two circles near doors)
    for (const side of [-0.7, 0.7]) {
      const puddleMat = new THREE.MeshBasicMaterial({
        color: 0xfff0d0, transparent: true, opacity: 0.5,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const puddleGeo = new THREE.CircleGeometry(0.2, 32);
      const puddle = new THREE.Mesh(puddleGeo, puddleMat);
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(0, 0.003, side);
      puddle.name = 'WelcomePuddle_' + (side > 0 ? 'R' : 'L');
      group.add(puddle);

      // Projector lens in mirror underside
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transmission: 0.9, ior: 1.5, thickness: 0.002,
        roughness: 0.01, clearcoat: 1.0,
      });
      const lensGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.003, 16);
      lensGeo.rotateX(Math.PI / 2);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0.83, side > 0 ? side + 0.02 : side - 0.02);
      group.add(lens);
    }

    // Ambient footwell lighting strips
    const footMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (const side of [-0.5, 0.5]) {
      const stripGeo = new THREE.BoxGeometry(0.8, 0.002, 0.03);
      const strip = new THREE.Mesh(stripGeo, footMat);
      strip.position.set(0, 0.2, side);
      group.add(strip);
    }

    return group;
  }

  // === SEQUENTIAL TURN SIGNAL ANIMATOR ===
  public static buildSequentialTurnSignal(count: number = 10, width: number = 0.3): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SequentialTurnSignal';
    const segW = width / count;
    for (let i = 0; i < count; i++) {
      const segMat = new THREE.MeshStandardMaterial({
        color: 0xff8800, emissive: 0xff6600, emissiveIntensity: 3.0,
        transparent: true, opacity: 0.3,
      });
      const segGeo = new THREE.BoxGeometry(segW * 0.9, 0.005, 0.003);
      const seg = new THREE.Mesh(segGeo, segMat);
      seg.position.x = -width / 2 + (i + 0.5) * segW;
      seg.name = 'SeqSegment_' + i;
      group.add(seg);
    }
    return group;
  }

  // === ANIMATE SEQUENTIAL SIGNAL ===
  public static animateSequentialSignal(group: THREE.Group, time: number, speed: number = 3): void {
    const count = group.children.length;
    const phase = (time * speed) % count;
    for (let i = 0; i < count; i++) {
      const seg = group.children[i] as THREE.Mesh;
      const mat = seg.material as THREE.MeshStandardMaterial;
      const dist = Math.abs(i - phase);
      const brightness = Math.max(0, 1 - dist / 4);
      mat.emissiveIntensity = 3.0 * brightness;
      mat.opacity = 0.3 + 0.7 * brightness;
    }
  }

  // === LED MATRIX PATTERN ===
  public static buildMatrixLEDArray(rows: number, cols: number, cellSize: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MatrixLEDArray';
    const mat = this.createMatrixLEDMaterial();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const geo = new THREE.BoxGeometry(cellSize * 0.85, cellSize * 0.85, 0.001);
        const led = new THREE.Mesh(geo, mat);
        led.position.set(
          -cols * cellSize / 2 + (c + 0.5) * cellSize,
          -rows * cellSize / 2 + (r + 0.5) * cellSize,
          0
        );
        led.name = 'LED_' + r + '_' + c;
        group.add(led);
      }
    }
    return group;
  }

  // === WELCOME/LEAVING HOME ANIMATION ===
  public static animateWelcomeSequence(group: THREE.Group, progress: number): void {
    // progress: 0 = off, 1 = fully on
    group.traverse((node: any) => {
      if (!node.isMesh || !node.material) return;
      const mat = node.material as any;
      if (mat && typeof mat === 'object') {
        if ('emissiveIntensity' in mat && typeof mat.emissiveIntensity === 'number') {
          mat.emissiveIntensity = mat.emissiveIntensity * progress;
        }
        if ('opacity' in mat && typeof mat.opacity === 'number') {
          mat.opacity = mat.opacity * progress;
        }
      }
    });
  }

  // === BRAKE LIGHT PULSE (hazard/emergency) ===
  public static buildHazardLightFlasher(): THREE.Mesh {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0,
      roughness: 0.1,
    });
    const geo = new THREE.BoxGeometry(0.04, 0.008, 0.04);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'HazardFlasher';
    return mesh;
  }

  public static animateHazardFlasher(mesh: THREE.Mesh, time: number): void {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = Math.sin(time * 4) > 0 ? 5.0 : 0;
  }
}
