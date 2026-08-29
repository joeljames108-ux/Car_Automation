// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — PROCEDURAL DASHBOARD 3D GENERATOR
// ============================================================================
// Constructs 5 distinct automotive dashboard architectures in Three.js:
// 1. Executive Monolith: Dual-tier leather waterfall, open-pore wood, hidden micro-louvres
// 2. GT3 Track Cockpit: Dry carbon cowl, exposed titanium roll-cage brackets, toggle bank
// 3. Hyperscreen Blade: 56" curved glass surface with triple live OLED canvas screens
// 4. Grand Tourer: Dual-tone hand-stitched Nappa leather, knurled aluminum rotary turbine vents
// 5. Classic Heritage: Brushed chrome round bezels, mechanical toggle switches, orange needles
// ============================================================================

import * as THREE from 'three';
import {
  DashboardArchitectureClass,
  InteriorMaterialTheme,
} from '../../types/interiorStudioTypes';
import { InteriorCanvasTextureFactory } from '../../textures/interiorCanvasTextures';

export class Dashboard3DGenerator {
  /**
   * Builds the procedural 3D dashboard assembly for the specified architecture class.
   */
  public static buildDashboard(
    dashClass: DashboardArchitectureClass,
    trackWidthM: number,
    materials: InteriorMaterialTheme,
    ambientColorHex: string = '#f59e0b'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `Dashboard_${dashClass}`;

    const halfTr = trackWidthM / 2;
    const dashWidth = Math.max(1.36, Math.min(1.56, trackWidthM * 0.94));

    // Common PBR Materials
    const leatherMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.primaryColorHex),
      roughness: 0.68,
      metalness: 0.05,
      clearcoat: 0.12,
      clearcoatRoughness: 0.45,
      sheen: 0.3,
      sheenColor: new THREE.Color(materials.primaryColorHex).multiplyScalar(1.25),
      sheenRoughness: 0.6,
      envMapIntensity: 0.4,
    });

    const secondaryLeatherMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.secondaryColorHex),
      roughness: 0.72,
      metalness: 0.04,
      clearcoat: 0.1,
      sheen: 0.25,
      sheenColor: new THREE.Color(materials.secondaryColorHex).multiplyScalar(1.2),
      envMapIntensity: 0.35,
    });

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0f16,
      roughness: 0.22,
      metalness: 0.4,
      clearcoat: 0.85,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.2,
    });

    const brushedAluMat = new THREE.MeshPhysicalMaterial({
      color: 0xd1d5db,
      roughness: 0.20,
      metalness: 0.94,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
    });

    const woodVeneerMat = new THREE.MeshPhysicalMaterial({
      color: 0x5c3a21,
      roughness: 0.42,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.7,
    });

    const screenGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070d,
      roughness: 0.04,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 1.8,
    });

    const ambientLightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ambientColorHex),
    });

    // Sub-assemblies based on architecture class
    switch (dashClass) {
      case 'gt3_track_cockpit':
        this.buildGt3TrackCockpit(group, dashWidth, carbonMat, brushedAluMat);
        break;

      case 'hyper_minimalist_glass':
        this.buildHyperscreenBlade(group, dashWidth, leatherMat, screenGlassMat, ambientLightMat);
        break;

      case 'luxury_grand_tourer':
        this.buildLuxuryGrandTourer(group, dashWidth, leatherMat, secondaryLeatherMat, brushedAluMat, ambientLightMat);
        break;

      case 'classic_heritage_sport':
        this.buildClassicHeritage(group, dashWidth, leatherMat, brushedAluMat);
        break;

      case 'executive_monolith':
      default:
        this.buildExecutiveMonolith(group, dashWidth, leatherMat, woodVeneerMat, brushedAluMat, screenGlassMat, ambientLightMat);
        break;
    }

    // Common Defroster Grille Strip along the windshield base
    const defrosterGeo = new THREE.BoxGeometry(dashWidth * 0.92, 0.012, 0.04);
    const defrosterMesh = new THREE.Mesh(defrosterGeo, brushedAluMat);
    defrosterMesh.position.set(-0.12, 0.81, 0);
    group.add(defrosterMesh);

    return group;
  }

  // ==========================================================================
  // 1. EXECUTIVE MONOLITH ARCHITECTURE
  // ==========================================================================
  private static buildExecutiveMonolith(
    root: THREE.Group,
    w: number,
    leatherMat: THREE.Material,
    woodMat: THREE.Material,
    aluMat: THREE.Material,
    screenMat: THREE.Material,
    ambientMat: THREE.Material
  ): void {
    // Upper Cowl (Curved Leather Top)
    const upperCowlGeo = new THREE.BoxGeometry(w, 0.16, 0.48);
    const upperCowl = new THREE.Mesh(upperCowlGeo, leatherMat);
    upperCowl.position.set(-0.32, 0.78, 0);
    root.add(upperCowl);
    // Turbine-Style HVAC Air Vents (4 across dashboard)
    for (let v = 0; v < 4; v++) {
      const ventGroup = new THREE.Group();
      const ventX = -0.55 + v * 0.28;
      const ventZ = v < 2 ? -0.28 : 0.28;
      const ringGeo = new THREE.TorusGeometry(0.028, 0.004, 8, 24);
      const ring = new THREE.Mesh(ringGeo, aluMat);
      ring.rotation.y = Math.PI / 2;
      ventGroup.add(ring);
      for (let b = 0; b < 5; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.002, 0.04, 0.003);
        const blade = new THREE.Mesh(bladeGeo, aluMat);
        blade.position.set(0, -0.02 + b * 0.01, 0);
        blade.rotation.z = (b - 2) * 0.15;
        ventGroup.add(blade);
      }
      const knobGeo = new THREE.SphereGeometry(0.006, 8, 8);
      const knob = new THREE.Mesh(knobGeo, aluMat);
      knob.position.set(0, 0, 0.025);
      ventGroup.add(knob);
      ventGroup.position.set(ventX, 0.66, ventZ);
      root.add(ventGroup);
    }

    // Dashboard Button Row
    for (let b = 0; b < 4; b++) {
      const btnGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12);
      const btn = new THREE.Mesh(btnGeo, aluMat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(-0.50 + b * 0.04, 0.60, -0.22);
      root.add(btn);
      const rGeo = new THREE.TorusGeometry(0.014, 0.001, 6, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: b === 0 ? 0x22c55e : 0xf59e0b });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.y = Math.PI / 2;
      rMesh.position.set(-0.50 + b * 0.04, 0.60, -0.215);
      root.add(rMesh);
    }

    // Brushed Aluminum Dashboard Trim Strip
    const trimGeo = new THREE.BoxGeometry(w * 0.88, 0.006, 0.015);
    const trim = new THREE.Mesh(trimGeo, aluMat);
    trim.position.set(-0.32, 0.72, 0);
    root.add(trim);


    // Mid-Tier Open-Pore Wood Waterfall Fascia
    const woodFasciaGeo = new THREE.BoxGeometry(w * 0.96, 0.12, 0.03);
    const woodFascia = new THREE.Mesh(woodFasciaGeo, woodMat);
    woodFascia.position.set(-0.46, 0.70, 0);
    woodFascia.rotation.x = -0.15;
    root.add(woodFascia);

    // Lower Knee Bolster Subframe
    const lowerBolsterGeo = new THREE.BoxGeometry(w * 0.94, 0.28, 0.36);
    const lowerBolster = new THREE.Mesh(lowerBolsterGeo, leatherMat);
    lowerBolster.position.set(-0.36, 0.52, 0);
    root.add(lowerBolster);

    // 12.3" Virtual Instrument Cluster with Live Canvas Texture
    const clusterTexture = InteriorCanvasTextureFactory.createClusterTexture({ theme: 'luxury_gold_elegance' });
    const clusterMat = new THREE.MeshBasicMaterial({ map: clusterTexture });
    const clusterGeo = new THREE.PlaneGeometry(0.42, 0.20);
    const clusterMesh = new THREE.Mesh(clusterGeo, clusterMat);
    clusterMesh.position.set(-0.44, 0.75, -0.34);
    clusterMesh.rotation.y = Math.PI / 2 + 0.08;
    root.add(clusterMesh);

    // 14.5" Central Infotainment Screen
    const infoTexture = InteriorCanvasTextureFactory.createInfotainmentTexture('luxury_gold_elegance');
    const infoMat = new THREE.MeshBasicMaterial({ map: infoTexture });
    const infoGeo = new THREE.PlaneGeometry(0.48, 0.28);
    const infoMesh = new THREE.Mesh(infoGeo, infoMat);
    infoMesh.position.set(-0.47, 0.68, 0.08);
    infoMesh.rotation.y = Math.PI / 2 - 0.12;
    infoMesh.rotation.x = -0.15;
    root.add(infoMesh);

    // Passenger Co-Pilot Auxiliary Screen
    const passTexture = InteriorCanvasTextureFactory.createPassengerScreenTexture('luxury_gold_elegance');
    const passMat = new THREE.MeshBasicMaterial({ map: passTexture });
    const passGeo = new THREE.PlaneGeometry(0.36, 0.18);
    const passMesh = new THREE.Mesh(passGeo, passMat);
    passMesh.position.set(-0.46, 0.71, 0.44);
    passMesh.rotation.y = Math.PI / 2 - 0.06;
    root.add(passMesh);

    // Full-Width Ambient Light Ribbon (Under Upper Cowl)
    const ambientStripGeo = new THREE.BoxGeometry(w * 0.95, 0.008, 0.012);
    const ambientStrip = new THREE.Mesh(ambientStripGeo, ambientMat);
    ambientStrip.position.set(-0.45, 0.74, 0);
    root.add(ambientStrip);

    // Brushed Aluminum HVAC Micro-Louvres
    const louvreGeo = new THREE.BoxGeometry(w * 0.90, 0.018, 0.02);
    const louvre = new THREE.Mesh(louvreGeo, aluMat);
    louvre.position.set(-0.47, 0.62, 0);
    root.add(louvre);
  }

  // ==========================================================================
  // 2. GT3 TRACK COMPETITION COCKPIT
  // ==========================================================================
  private static buildGt3TrackCockpit(
    root: THREE.Group,
    w: number,
    carbonMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    // Ultra-lightweight Carbon Dash Shell
    const shellGeo = new THREE.BoxGeometry(w * 0.88, 0.22, 0.38);
    const shell = new THREE.Mesh(shellGeo, carbonMat);
    shell.position.set(-0.30, 0.74, 0);
    root.add(shell);

    // Exposed Titanium Roll-Cage Dash Gussets
    for (const zSide of [-w * 0.42, w * 0.42]) {
      const gussetGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.36, 16);
      const gusset = new THREE.Mesh(gussetGeo, aluMat);
      gusset.position.set(-0.25, 0.65, zSide);
      gusset.rotation.z = Math.PI / 4;
      root.add(gusset);
    }

    // Driver-Centric MoTeC Race Display (High Brightness Canvas)
    const raceTexture = InteriorCanvasTextureFactory.createClusterTexture({
      driveMode: 'TRACK',
      theme: 'motorsport_track_telemetry',
    });
    const raceMat = new THREE.MeshBasicMaterial({ map: raceTexture });
    const raceDisplayGeo = new THREE.PlaneGeometry(0.38, 0.22);
    const raceDisplay = new THREE.Mesh(raceDisplayGeo, raceMat);
    raceDisplay.position.set(-0.44, 0.75, -0.34);
    raceDisplay.rotation.x = -0.10;
    root.add(raceDisplay);

    // Aluminum Billet Switchbank (Traction Control, ABS, Radio, Pit Limiter)
    const switchBankGeo = new THREE.BoxGeometry(0.24, 0.14, 0.06);
    const switchBank = new THREE.Mesh(switchBankGeo, aluMat);
    switchBank.position.set(-0.42, 0.64, 0.05);
    switchBank.rotation.y = -0.22;
    root.add(switchBank);

    // 6 Miniature Billet Toggles
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const toggleGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.024, 8);
        const toggleMat = new THREE.MeshStandardMaterial({ color: col === 0 ? 0xef4444 : 0xfbbf24, metalness: 0.9, roughness: 0.2 });
        const toggle = new THREE.Mesh(toggleGeo, toggleMat);
        toggle.position.set(-0.46, 0.67 - row * 0.05, -0.02 + col * 0.06);
        toggle.rotation.x = Math.PI / 3;
        root.add(toggle);
      }
    }
  }

  // ==========================================================================
  // 3. HYPERSCREEN BLADE ARCHITECTURE
  // ==========================================================================
  private static buildHyperscreenBlade(
    root: THREE.Group,
    w: number,
    leatherMat: THREE.Material,
    screenMat: THREE.Material,
    ambientMat: THREE.Material
  ): void {
    // Minimalist Leather Top Trim Cap
    const topCapGeo = new THREE.BoxGeometry(w, 0.08, 0.44);
    const topCap = new THREE.Mesh(topCapGeo, leatherMat);
    topCap.position.set(-0.30, 0.80, 0);
    root.add(topCap);

    // Continuous 56" Curved OLED Glass Monolith
    const bladeGeo = new THREE.BoxGeometry(w * 0.94, 0.28, 0.025);
    const blade = new THREE.Mesh(bladeGeo, screenMat);
    blade.position.set(-0.44, 0.70, 0);
    blade.rotation.x = -0.14;
    root.add(blade);

    // 1. Driver Cluster Canvas
    const clusterTex = InteriorCanvasTextureFactory.createClusterTexture({ theme: 'cyberpunk_neon_cyan' });
    const clusterMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.22), new THREE.MeshBasicMaterial({ map: clusterTex }));
    clusterMesh.position.set(-0.455, 0.70, -0.34);
    clusterMesh.rotation.x = -0.14;
    root.add(clusterMesh);

    // 2. Central Massive Infotainment Canvas
    const infoTex = InteriorCanvasTextureFactory.createInfotainmentTexture('cyberpunk_neon_cyan');
    const infoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.24), new THREE.MeshBasicMaterial({ map: infoTex }));
    infoMesh.position.set(-0.455, 0.70, 0.05);
    infoMesh.rotation.x = -0.14;
    root.add(infoMesh);

    // 3. Passenger Co-Pilot Screen Canvas
    const passTex = InteriorCanvasTextureFactory.createPassengerScreenTexture('cyberpunk_neon_cyan');
    const passMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.20), new THREE.MeshBasicMaterial({ map: passTex }));
    passMesh.position.set(-0.455, 0.70, 0.44);
    passMesh.rotation.x = -0.14;
    root.add(passMesh);

    // Continuous Ambient Halo Surrounding the Blade
    const haloGeo = new THREE.BoxGeometry(w * 0.96, 0.008, 0.012);
    const haloTop = new THREE.Mesh(haloGeo, ambientMat);
    haloTop.position.set(-0.43, 0.84, 0);

    const haloBottom = new THREE.Mesh(haloGeo, ambientMat);
    haloBottom.position.set(-0.47, 0.56, 0);

    root.add(haloTop, haloBottom);
  }

  // ==========================================================================
  // 4. LUXURY GRAND TOURER ARCHITECTURE
  // ==========================================================================
  private static buildLuxuryGrandTourer(
    root: THREE.Group,
    w: number,
    primaryLeather: THREE.Material,
    secondaryLeather: THREE.Material,
    aluMat: THREE.Material,
    ambientMat: THREE.Material
  ): void {
    // Upper Hand-Stitched Leather Cowl
    const upperGeo = new THREE.BoxGeometry(w, 0.18, 0.50);
    const upper = new THREE.Mesh(upperGeo, primaryLeather);
    upper.position.set(-0.32, 0.78, 0);
    root.add(upper);

    // Lower Contrast Leather Fascia
    const lowerGeo = new THREE.BoxGeometry(w * 0.94, 0.24, 0.38);
    const lower = new THREE.Mesh(lowerGeo, secondaryLeather);
    lower.position.set(-0.34, 0.54, 0);
    root.add(lower);

    // 4 Distinct Knurled Aluminum Turbine HVAC Vents
    const ventPositionsZ = [-0.56, -0.18, 0.18, 0.56];
    ventPositionsZ.forEach((z) => {
      const ventGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.035, 24);
      const vent = new THREE.Mesh(ventGeo, aluMat);
      vent.position.set(-0.45, 0.68, z);
      vent.rotation.z = Math.PI / 2;
      root.add(vent);

      // Glowing Center Turbine Hub
      const hubGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const hub = new THREE.Mesh(hubGeo, ambientMat);
      hub.position.set(-0.47, 0.68, z);
      root.add(hub);
    });

    // Central Floating OLED Display
    const infoTexture = InteriorCanvasTextureFactory.createInfotainmentTexture('luxury_gold_elegance');
    const screenGeo = new THREE.PlaneGeometry(0.44, 0.26);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: infoTexture }));
    screen.position.set(-0.46, 0.72, 0);
    screen.rotation.x = -0.12;
    root.add(screen);

    // Virtual Instrument Cluster
    const clusterTexture = InteriorCanvasTextureFactory.createClusterTexture({ theme: 'luxury_gold_elegance' });
    const clusterMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.20), new THREE.MeshBasicMaterial({ map: clusterTexture }));
    clusterMesh.position.set(-0.44, 0.76, -0.35);
    clusterMesh.rotation.x = -0.10;
    root.add(clusterMesh);
  }

  // ==========================================================================
  // 5. CLASSIC HERITAGE SPORT ARCHITECTURE
  // ==========================================================================
  private static buildClassicHeritage(
    root: THREE.Group,
    w: number,
    leatherMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    // Retro Padded Vinyl/Leather Dash Cap
    const capGeo = new THREE.BoxGeometry(w * 0.92, 0.16, 0.44);
    const cap = new THREE.Mesh(capGeo, leatherMat);
    cap.position.set(-0.30, 0.76, 0);
    root.add(cap);

    // Brushed Aluminum Flat Gauge Fascia
    const fasciaGeo = new THREE.BoxGeometry(w * 0.88, 0.20, 0.02);
    const fascia = new THREE.Mesh(fasciaGeo, aluMat);
    fascia.position.set(-0.44, 0.68, 0);
    root.add(fascia);

    // 5 Deep-Set Round Chrome Bezels for Analog Dials
    const dialXs = [-0.44, -0.28, -0.12, 0.12, 0.28];
    const dialRadii = [0.065, 0.065, 0.040, 0.040, 0.040];

    dialXs.forEach((z, idx) => {
      const bezelGeo = new THREE.TorusGeometry(dialRadii[idx], 0.008, 16, 32);
      const bezel = new THREE.Mesh(bezelGeo, aluMat);
      bezel.position.set(-0.46, 0.70, z);
      bezel.rotation.y = Math.PI / 2;
      root.add(bezel);

      // Gauge Dial Face with Orange Needle
      const faceGeo = new THREE.CircleGeometry(dialRadii[idx] - 0.004, 24);
      const faceMat = new THREE.MeshBasicMaterial({ color: 0x0f141c });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.set(-0.455, 0.70, z);
      face.rotation.y = -Math.PI / 2;
      root.add(face);

      // Needle
      const needleGeo = new THREE.BoxGeometry(0.003, dialRadii[idx] * 0.75, 0.002);
      const needleMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Vibrant Orange
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.set(-0.458, 0.70 + dialRadii[idx] * 0.2, z);
      needle.rotation.x = Math.PI / 4;
      root.add(needle);
    });

    // Row of Mechanical Metal Toggle Switches
    for (let i = 0; i < 5; i++) {
      const toggleGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.022, 12);
      const toggle = new THREE.Mesh(toggleGeo, aluMat);
      toggle.position.set(-0.46, 0.60, -0.10 + i * 0.05);
      toggle.rotation.x = Math.PI / 3;
      root.add(toggle);
    }
  }
}
