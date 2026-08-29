// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — PROCEDURAL STEERING WHEEL 3D GENERATOR
// ============================================================================
// Constructs 6 distinct automotive steering wheel typologies in Three.js:
// 1. GT3 / Formula Race Yoke (Carbon yoke, 16-LED shift bar, magnetic titanium paddles)
// 2. Flat-Bottom Sport (Perforated leather/Alcantara, 12 o'clock stripe, aluminum paddles)
// 3. Classic 3-Spoke Round (Polished mirror aluminum, mahogany wood rim, classic horn)
// 4. Executive Two-Spoke (Semi-aniline leather, capacitive pads, crystal scroll wheels)
// 5. Drift Deep-Dish (90mm deep dish suede rim, slotted spokes, quick-release hub)
// 6. Cyber-Steer Retractable (Folding steer-by-wire yoke for autonomous mode)
// ============================================================================

import * as THREE from 'three';
import {
  SteeringWheelTypology,
  InteriorMaterialTheme,
} from '../../types/interiorStudioTypes';

export class SteeringWheel3DGenerator {
  /**
   * Builds the complete steering wheel and steering column assembly.
   */
  public static buildSteeringWheel(
    typology: SteeringWheelTypology,
    materials: InteriorMaterialTheme,
    steeringAngleRad: number = 0
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = `SteeringWheel_${typology}`;

    // Steering Column Housing (Stalks for Turn Signals & Wipers)
    const columnGroup = this.buildSteeringColumn();
    root.add(columnGroup);

    // Rotating Wheel Sub-Group
    const wheelRotatingGroup = new THREE.Group();
    wheelRotatingGroup.name = 'WheelRotatingGroup';
    wheelRotatingGroup.rotation.x = steeringAngleRad;

    // Materials
    const rimLeatherMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.primaryColorHex),
      roughness: 0.65,
      metalness: 0.05,
      clearcoat: 0.1,
      sheen: 0.3,
      sheenColor: new THREE.Color(materials.primaryColorHex).multiplyScalar(1.2),
      envMapIntensity: 0.4,
    });

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0d14,
      roughness: 0.18,
      metalness: 0.4,
      clearcoat: 0.88,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
    });

    const aluMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.25,
      metalness: 0.94,
      envMapIntensity: 1.4,
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.32,
      metalness: 0.88,
      envMapIntensity: 1.2,
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x6b3a19,
      roughness: 0.45,
      metalness: 0.05,
      envMapIntensity: 0.8,
    });

    const accentStitchMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(materials.stitchingColorHex),
    });

    // Build specific wheel geometry
    switch (typology) {
      case 'gt3_race_yoke':
        this.buildGt3RaceYoke(wheelRotatingGroup, carbonMat, titaniumMat, accentStitchMat);
        break;

      case 'flat_bottom_sport':
        this.buildFlatBottomSport(wheelRotatingGroup, rimLeatherMat, aluMat, carbonMat, accentStitchMat);
        break;

      case 'classic_3_spoke_round':
        this.buildClassic3Spoke(wheelRotatingGroup, woodMat, aluMat);
        break;

      case 'executive_2_spoke':
        this.buildExecutive2Spoke(wheelRotatingGroup, rimLeatherMat, aluMat);
        break;

      case 'drift_deep_dish':
        this.buildDriftDeepDish(wheelRotatingGroup, rimLeatherMat, aluMat);
        break;

      case 'autonomous_retractable':
      default:
        this.buildAutonomousRetractable(wheelRotatingGroup, carbonMat, aluMat, accentStitchMat);
        break;
    }

    root.add(wheelRotatingGroup);
    return root;
  }

  // ==========================================================================
  // STEERING COLUMN & STALKS
  // ==========================================================================
  private static buildSteeringColumn(): THREE.Group {
    const colGroup = new THREE.Group();
    colGroup.name = 'SteeringColumn';

    const colMat = new THREE.MeshStandardMaterial({ color: 0x181e29, roughness: 0.7, metalness: 0.2 });
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x0f141c, roughness: 0.5, metalness: 0.8 });

    // Main Column Shroud
    const shroudGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.22, 24);
    const shroud = new THREE.Mesh(shroudGeo, colMat);
    shroud.position.set(0.10, 0, 0);
    shroud.rotation.z = Math.PI / 2;
    colGroup.add(shroud);

    // Left Stalk (Turn Signals & High Beams)
    const stalkLGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.12, 12);
    const stalkL = new THREE.Mesh(stalkLGeo, stalkMat);
    stalkL.position.set(0.06, 0.02, -0.09);
    stalkL.rotation.x = -Math.PI / 3;
    colGroup.add(stalkL);

    // Right Stalk (Rain Wipers & Washers)
    const stalkRGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.12, 12);
    const stalkR = new THREE.Mesh(stalkRGeo, stalkMat);
    stalkR.position.set(0.06, 0.02, 0.09);
    stalkR.rotation.x = Math.PI / 3;
    colGroup.add(stalkR);

    return colGroup;
  }

  // ==========================================================================
  // 1. GT3 / FORMULA RACE YOKE
  // ==========================================================================
  private static buildGt3RaceYoke(
    root: THREE.Group,
    carbonMat: THREE.Material,
    tiMat: THREE.Material,
    accentMat: THREE.Material
  ): void {
    // Carbon Central Hub & Chassis Plate
    const hubGeo = new THREE.BoxGeometry(0.03, 0.16, 0.22);
    const hub = new THREE.Mesh(hubGeo, carbonMat);
    root.add(hub);

    // Left & Right Ergonomic Polyurethane Grip Handles
    for (const z of [-0.14, 0.14]) {
      const gripGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.20, 16);
      const grip = new THREE.Mesh(gripGeo, carbonMat);
      grip.position.set(0, 0, z);
      root.add(grip);

      // Grip thumb contour bumps
      const bumpGeo = new THREE.SphereGeometry(0.016, 12, 12);
      const bump = new THREE.Mesh(bumpGeo, carbonMat);
      bump.position.set(-0.012, 0.06, z);
      root.add(bump);
    }

    // Top 16-LED RPM Shift Light Bar (Curved Upper Brow)
    for (let i = 0; i < 12; i++) {
      const ledGeo = new THREE.BoxGeometry(0.008, 0.008, 0.010);
      const ledColor = i < 4 ? 0x22c55e : i < 8 ? 0xeab308 : 0xef4444;
      const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.016, 0.085, -0.06 + i * 0.011);
      root.add(led);
    }

    // Dual Rotary Thumb Dials (TC & ABS Adjusters)
    for (const z of [-0.06, 0.06]) {
      const dialGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.014, 16);
      const dialMat = new THREE.MeshStandardMaterial({ color: z < 0 ? 0xfbbf24 : 0xf59e0b, roughness: 0.3, metalness: 0.8 });
      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.position.set(-0.018, -0.02, z);
      dial.rotation.z = Math.PI / 2;
      root.add(dial);
    }

    // Large Magnetic Titanium Paddle Shifters (Behind Wheel)
    for (const z of [-0.13, 0.13]) {
      const paddleGeo = new THREE.BoxGeometry(0.006, 0.14, 0.038);
      const paddle = new THREE.Mesh(paddleGeo, tiMat);
      paddle.position.set(0.045, 0.02, z);
      root.add(paddle);
    }
  }

  // ==========================================================================
  // 2. FLAT-BOTTOM SPORT WHEEL
  // ==========================================================================
  private static buildFlatBottomSport(
    root: THREE.Group,
    leatherMat: THREE.Material,
    aluMat: THREE.Material,
    carbonMat: THREE.Material,
    accentMat: THREE.Material
  ): void {
    const r = 0.17;

    // Top & Side Curved Torus Rim
    const topArcGeo = new THREE.TorusGeometry(r, 0.018, 16, 32, Math.PI * 1.5);
    const topArc = new THREE.Mesh(topArcGeo, leatherMat);
    topArc.rotation.z = Math.PI * 0.75;
    root.add(topArc);

    // Flat Bottom Carbon Section
    const flatBottomGeo = new THREE.BoxGeometry(0.026, 0.028, r * 1.4);
    const flatBottom = new THREE.Mesh(flatBottomGeo, carbonMat);
    flatBottom.position.set(0, -r * 0.88, 0);
    root.add(flatBottom);

    // 12 o'Clock Center Alignment Stripe
    const stripeGeo = new THREE.BoxGeometry(0.038, 0.012, 0.012);
    const stripe = new THREE.Mesh(stripeGeo, accentMat);
    stripe.position.set(0, r, 0);
    root.add(stripe);

    // Center Airbag Boss & 3 Spokes
    const hubGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.032, 24);
    const hub = new THREE.Mesh(hubGeo, leatherMat);
    hub.rotation.z = Math.PI / 2;
    root.add(hub);

    // Aluminum Spokes (Left, Right, Bottom)
    for (const angle of [0, Math.PI, -Math.PI / 2]) {
      const spokeGeo = new THREE.BoxGeometry(0.014, r * 0.75, 0.038);
      const spoke = new THREE.Mesh(spokeGeo, aluMat);
      spoke.position.set(0, Math.sin(angle) * (r * 0.45), Math.cos(angle) * (r * 0.45));
      spoke.rotation.x = -angle + Math.PI / 2;
      root.add(spoke);
    }

    // Aluminum Paddle Shifters (+ on right, - on left)
    for (const z of [-r * 0.72, r * 0.72]) {
      const paddleGeo = new THREE.BoxGeometry(0.005, 0.11, 0.030);
      const paddle = new THREE.Mesh(paddleGeo, aluMat);
      paddle.position.set(0.038, 0.03, z);
      root.add(paddle);
    }
  }

  // ==========================================================================
  // 3. CLASSIC 3-SPOKE ROUND WHEEL
  // ==========================================================================
  private static buildClassic3Spoke(
    root: THREE.Group,
    woodMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    const r = 0.185;

    // Full 360 Torus Mahogany Wood Rim
    const rimGeo = new THREE.TorusGeometry(r, 0.016, 16, 36);
    const rim = new THREE.Mesh(rimGeo, woodMat);
    root.add(rim);

    // Polished Center Horn Button
    const hornGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.024, 24);
    const horn = new THREE.Mesh(hornGeo, aluMat);
    horn.rotation.z = Math.PI / 2;
    root.add(horn);

    // 3 Slotted Polished Aluminum Spokes
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const spokeGeo = new THREE.BoxGeometry(0.008, r * 0.75, 0.032);
      const spoke = new THREE.Mesh(spokeGeo, aluMat);
      spoke.position.set(-0.025, Math.sin(angle) * (r * 0.45), Math.cos(angle) * (r * 0.45));
      spoke.rotation.x = -angle + Math.PI / 2;
      root.add(spoke);
    }
  }

  // ==========================================================================
  // 4. EXECUTIVE TWO-SPOKE LUXURY WHEEL
  // ==========================================================================
  private static buildExecutive2Spoke(
    root: THREE.Group,
    leatherMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    const r = 0.18;

    // Smooth Oval Torus Rim
    const rimGeo = new THREE.TorusGeometry(r, 0.019, 16, 32);
    const rim = new THREE.Mesh(rimGeo, leatherMat);
    root.add(rim);

    // Wide Center Airbag Cushion with Heated Logo
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.035, 24);
    const hub = new THREE.Mesh(hubGeo, leatherMat);
    hub.rotation.z = Math.PI / 2;
    root.add(hub);

    // Horizontal Wide Luxury Spokes (Left & Right)
    for (const z of [-r * 0.5, r * 0.5]) {
      const spokeGeo = new THREE.BoxGeometry(0.016, 0.048, r * 0.5);
      const spoke = new THREE.Mesh(spokeGeo, aluMat);
      spoke.position.set(0, -0.02, z * 0.5);
      root.add(spoke);

      // Capacitive Touch Control Glass Pod
      const touchGeo = new THREE.BoxGeometry(0.004, 0.032, 0.06);
      const touchMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const touch = new THREE.Mesh(touchGeo, touchMat);
      touch.position.set(-0.012, -0.02, z);
      root.add(touch);
    }
  }

  // ==========================================================================
  // 5. DRIFT 90MM DEEP DISH SUEDE WHEEL
  // ==========================================================================
  private static buildDriftDeepDish(
    root: THREE.Group,
    suedeMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    const r = 0.165;
    const dishDepth = 0.09; // 90mm deep dish offset

    // Suede Rim offset forward
    const rimGeo = new THREE.TorusGeometry(r, 0.018, 16, 32);
    const rim = new THREE.Mesh(rimGeo, suedeMat);
    rim.position.set(-dishDepth, 0, 0);
    root.add(rim);

    // Quick-Release Splined Hub at base
    const hubGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.045, 24);
    const hub = new THREE.Mesh(hubGeo, aluMat);
    hub.rotation.z = Math.PI / 2;
    root.add(hub);

    // 3 Slanted CNC Aluminum Spokes connecting base to offset rim
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const spokeGeo = new THREE.CylinderGeometry(0.008, 0.008, Math.sqrt(r * r + dishDepth * dishDepth) * 0.9, 12);
      const spoke = new THREE.Mesh(spokeGeo, aluMat);
      spoke.position.set(-dishDepth * 0.5, Math.sin(angle) * (r * 0.45), Math.cos(angle) * (r * 0.45));
      spoke.rotation.z = Math.atan2(r, dishDepth);
      spoke.rotation.x = -angle + Math.PI / 2;
      root.add(spoke);
    }
  }

  // ==========================================================================
  // 6. CYBER-STEER RETRACTABLE FOLDING YOKE
  // ==========================================================================
  private static buildAutonomousRetractable(
    root: THREE.Group,
    carbonMat: THREE.Material,
    aluMat: THREE.Material,
    accentMat: THREE.Material
  ): void {
    // Aerodynamic Minimalist Center Blade
    const bladeGeo = new THREE.BoxGeometry(0.024, 0.07, 0.28);
    const blade = new THREE.Mesh(bladeGeo, carbonMat);
    root.add(blade);

    // Motorized Left & Right Folding Grip Winglets
    for (const z of [-0.14, 0.14]) {
      const gripGeo = new THREE.BoxGeometry(0.028, 0.16, 0.038);
      const grip = new THREE.Mesh(gripGeo, carbonMat);
      grip.position.set(0, 0, z);
      root.add(grip);

      // Cyan Steer-by-Wire Status Light Ring
      const ringGeo = new THREE.TorusGeometry(0.016, 0.004, 12, 24);
      const ring = new THREE.Mesh(ringGeo, accentMat);
      ring.position.set(-0.016, 0, z);
      ring.rotation.y = Math.PI / 2;
      root.add(ring);
    }
  }
}
