// ============================================================================
// PHASE 47 — PHOTOREALISTIC MODULAR INTERIOR COCKPIT & HMI STUDIO
// ============================================================================
// Procedural Three.js 3D interior cabin generator with leather bucket seats,
// carbon shell seatbacks, curved OLED displays, and ambient RGB fiber-optics.
// ============================================================================

import * as THREE from 'three';

export interface InteriorCockpitTheme {
  primaryLeatherColorHex: string;
  accentStitchingColorHex: string;
  ambientLightColorHex: string;
  carbonWeaveGloss: number;
}

export class PhotorealisticInteriorStudio {
  /**
   * Generates a complete 3D photorealistic interior cabin cockpit hierarchy.
   */
  public static buildInteriorCockpit3D(theme?: Partial<InteriorCockpitTheme>): THREE.Group {
    const config: InteriorCockpitTheme = {
      primaryLeatherColorHex: '#1e222d',
      accentStitchingColorHex: '#00f0ff',
      ambientLightColorHex: '#00f0ff',
      carbonWeaveGloss: 0.85,
      ...theme,
    };

    const cockpitGroup = new THREE.Group();
    cockpitGroup.name = 'INTERIOR_COCKPIT_3D';

    // Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.primaryLeatherColorHex),
      roughness: 0.75,
      metalness: 0.1,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.25,
      metalness: 0.4,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      roughness: 0.1,
      metalness: 0.9,
      emissive: new THREE.Color(0x003366),
      emissiveIntensity: 0.4,
    });

    const ambientLightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.ambientLightColorHex),
    });

    // 1. Dashboard Structure
    const dashGeo = new THREE.BoxGeometry(1.45, 0.35, 0.55);
    const dashboard = new THREE.Mesh(dashGeo, leatherMat);
    dashboard.position.set(0, 0.72, -0.65);
    cockpitGroup.add(dashboard);

    // 2. Curved OLED Digital Instrument Cluster Display
    const screenGeo = new THREE.BoxGeometry(0.75, 0.18, 0.02);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.25, 0.82, -0.45);
    screen.rotation.x = -0.15;
    cockpitGroup.add(screen);

    // 3. Center Infotainment Console Screen
    const centerScreenGeo = new THREE.BoxGeometry(0.32, 0.24, 0.02);
    const centerScreen = new THREE.Mesh(centerScreenGeo, screenMat);
    centerScreen.position.set(0.18, 0.75, -0.45);
    centerScreen.rotation.y = -0.18;
    centerScreen.rotation.x = -0.12;
    cockpitGroup.add(centerScreen);

    // 4. Ambient Fiber-Optic Light Strip (Glowing Curve)
    const ambientStripGeo = new THREE.BoxGeometry(1.42, 0.008, 0.012);
    const ambientStrip = new THREE.Mesh(ambientStripGeo, ambientLightMat);
    ambientStrip.position.set(0, 0.74, -0.42);
    cockpitGroup.add(ambientStrip);

    // 5. Driver & Passenger Carbon Bucket Seats
    const buildSeat = (isDriver: boolean) => {
      const seatGroup = new THREE.Group();
      const xPos = isDriver ? -0.38 : 0.38;

      // Cushion Base
      const baseGeo = new THREE.BoxGeometry(0.48, 0.12, 0.52);
      const base = new THREE.Mesh(baseGeo, leatherMat);
      base.position.set(0, 0.32, -1.25);
      seatGroup.add(base);

      // Backrest
      const backGeo = new THREE.BoxGeometry(0.46, 0.68, 0.10);
      const back = new THREE.Mesh(backGeo, leatherMat);
      back.position.set(0, 0.65, -1.48);
      back.rotation.x = -0.22;
      seatGroup.add(back);

      // Carbon Shell Seatback Rear Cover
      const shellGeo = new THREE.BoxGeometry(0.48, 0.70, 0.04);
      const shell = new THREE.Mesh(shellGeo, carbonMat);
      shell.position.set(0, 0.65, -1.53);
      shell.rotation.x = -0.22;
      seatGroup.add(shell);

      // Headrest
      const headGeo = new THREE.BoxGeometry(0.24, 0.18, 0.08);
      const head = new THREE.Mesh(headGeo, leatherMat);
      head.position.set(0, 1.05, -1.62);
      seatGroup.add(head);

      seatGroup.position.x = xPos;
      return seatGroup;
    };

    cockpitGroup.add(buildSeat(true));
    cockpitGroup.add(buildSeat(false));

    // 6. Sport Steering Wheel
    const wheelGroup = new THREE.Group();
    const rimGeo = new THREE.TorusGeometry(0.18, 0.018, 16, 32);
    const rim = new THREE.Mesh(rimGeo, leatherMat);
    wheelGroup.add(rim);

    const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
    const hub = new THREE.Mesh(hubGeo, carbonMat);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    wheelGroup.position.set(-0.38, 0.74, -0.38);
    wheelGroup.rotation.x = -0.25;
    cockpitGroup.add(wheelGroup);

    return cockpitGroup;
  }
}
