// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — ULTRA-HIGH-FIDELITY INTERIOR 3D GENERATOR
// ============================================================================
// Procedurally constructs ultra-high-detail Three.js meshes for vehicle cockpits:
// - Live Digital OLED Cluster & Holographic Windshield HUD
// - GT3/F1 Multi-Function Steering Yoke with Rotary Dials & Magnetic Paddle Shifters
// - Diamond-Quilted Alcantara Bucket Seats with 6-Point Racing Harnesses & Cam-Lock
// - Open-Gate Shifter Console with Aircraft Red Start/Stop Flap
// - Multi-Zone Ambient Fiber-Optic Cabin Lighting
// ============================================================================

import * as THREE from 'three';
import {
  ModularInteriorConfiguration,
  InteriorTrimGrade,
} from '../types/modularInteriorTypes';

export class ModularInterior3DGenerator {
  public static buildModularInterior(
    config: Partial<ModularInteriorConfiguration>,
    wheelbaseMm: number,
    trackWidthMm: number
  ): THREE.Group {
    const interiorRoot = new THREE.Group();
    interiorRoot.name = 'ModularInteriorRoot';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const dashId = config.dashboardId || 'DASHBOARD_01_EXECUTIVE';
    const clusterId = config.instrumentClusterId || 'CLUSTER_VIRTUAL_COCKPIT_12_3';
    const wheelId = config.steeringWheelId || 'STEERING_GT3_YOKE';
    const seatId = config.frontSeatsId || 'SEATS_SPORT_BOLSTERED';
    const consoleId = config.centerConsoleId || 'CONSOLE_SPORT_GATED';
    const trimGrade = config.primaryTrimGrade || 'nappa_leather';
    const ambientColorHex = config.ambientLightingColorHex || '#06b6d4';

    // 1. Modular Sculpted Dashboard
    const dashboardMesh = this.buildDashboard(dashId, halfTrM, trimGrade, ambientColorHex);
    interiorRoot.add(dashboardMesh);

    // 2. High-Tech OLED Digital Instrument Cluster & HUD
    const clusterMesh = this.buildCluster(clusterId);
    clusterMesh.position.set(-0.35, 0.74, -0.32);
    interiorRoot.add(clusterMesh);

    // Windshield Holographic HUD Projector
    const hudMesh = this.buildHolographicHUD();
    hudMesh.position.set(-0.28, 0.88, -0.32);
    interiorRoot.add(hudMesh);

    // 3. Multi-Function Racing Steering Wheel & Column
    const wheelMesh = this.buildSteeringWheel(wheelId, trimGrade);
    wheelMesh.position.set(-0.46, 0.70, -0.32);
    interiorRoot.add(wheelMesh);

    // 4. Sport Aluminum Pedal Box (Accelerator, Brake, Dead Pedal Footrest)
    const pedalBox = this.buildPedalBox();
    pedalBox.position.set(-0.18, 0.20, -0.32);
    interiorRoot.add(pedalBox);

    // 5. Center Console with Gated Shifter & Red Start Flap
    const consoleMesh = this.buildCenterConsole(consoleId, wbM, trimGrade);
    consoleMesh.position.set(-0.58, 0.30, 0);
    interiorRoot.add(consoleMesh);

    // 6. Front Diamond-Quilted Bucket Seats with 6-Point Harnesses
    const driverSeat = this.buildSeat(seatId, trimGrade, true);
    driverSeat.position.set(-0.70, 0.28, -0.34);

    const passSeat = this.buildSeat(seatId, trimGrade, false);
    passSeat.position.set(-0.70, 0.28, 0.34);
    interiorRoot.add(driverSeat, passSeat);

    // 7. Multi-Zone Ambient Fiber-Optic Cabin Light Strips
    const lightStrip = this.buildAmbientLightstrip(halfTrM, ambientColorHex);
    lightStrip.position.set(-0.24, 0.68, 0);
    interiorRoot.add(lightStrip);

    // 8. Windshield Defroster Mesh Grille Strip
    const defroster = this.buildDefrosterGrille(halfTrM);
    defroster.position.set(-0.10, 0.79, 0);
    interiorRoot.add(defroster);

    // 9. Frameless Electrochromic Rearview Mirror & Forward ADAS Camera Pod
    const mirror = this.buildRearviewMirror();
    mirror.position.set(-0.18, 1.08, 0);
    interiorRoot.add(mirror);

    // 10. Left & Right Sculpted Door Cards with Audio Grilles and Power Window Switches
    const leftDoorCard = this.buildDoorCard(halfTrM, trimGrade, true);
    leftDoorCard.position.set(-0.60, 0.48, -halfTrM * 0.94);

    const rightDoorCard = this.buildDoorCard(halfTrM, trimGrade, false);
    rightDoorCard.position.set(-0.60, 0.48, halfTrM * 0.94);

    interiorRoot.add(leftDoorCard, rightDoorCard);

    return interiorRoot;
  }

  // ── 0a. WINDSHIELD DEFROSTER GRILLE ──
  private static buildDefrosterGrille(halfTrM: number): THREE.Mesh {
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9, metalness: 0.2 });
    const grilleGeo = new THREE.BoxGeometry(0.04, 0.008, halfTrM * 1.35);
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.name = 'Defroster_Grille';
    return grille;
  }

  // ── 0b. FRAMELESS REARVIEW MIRROR & ADAS CAMERA ──
  private static buildRearviewMirror(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Rearview_Mirror_Assembly';

    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.8 });
    const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.02,
      metalness: 0.98,
      reflectivity: 0.98,
      clearcoat: 1.0,
    });
    const podMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7, metalness: 0.3 });

    // Windshield Header Mounting Stalk & ADAS Camera Pod
    const stalkGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12);
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.rotation.x = Math.PI / 4;
    group.add(stalk);

    const adasPodGeo = new THREE.BoxGeometry(0.06, 0.04, 0.08);
    const adasPod = new THREE.Mesh(adasPodGeo, podMat);
    adasPod.position.set(0.02, 0.02, 0);
    group.add(adasPod);

    // Frameless Mirror Housing & Glass
    const mirrorBodyGeo = new THREE.BoxGeometry(0.012, 0.065, 0.22);
    const mirrorBody = new THREE.Mesh(mirrorBodyGeo, stalkMat);
    mirrorBody.position.set(-0.02, -0.03, 0);

    const mirrorGlassGeo = new THREE.BoxGeometry(0.004, 0.060, 0.214);
    const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    mirrorGlass.position.set(-0.026, -0.03, 0);

    group.add(mirrorBody, mirrorGlass);
    return group;
  }

  // ── 0c. SCULPTED DOOR CARDS & AUDIO GRILLES ──
  private static buildDoorCard(halfTrM: number, trim: InteriorTrimGrade, isLeft: boolean): THREE.Group {
    const cardGroup = new THREE.Group();
    cardGroup.name = `DoorCard_${isLeft ? 'L' : 'R'}`;

    const mainMat = this.getTrimMaterial(trim);
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.25 });
    const switchMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });

    const zSign = isLeft ? 1 : -1;

    // 1. Padded Armrest Cushion
    const armrestGeo = new THREE.BoxGeometry(0.55, 0.08, 0.09);
    const armrest = new THREE.Mesh(armrestGeo, mainMat);
    armrest.position.set(0, 0, zSign * 0.04);
    cardGroup.add(armrest);

    // 2. Brushed Metal Door Release Pull Lever
    const handleGeo = new THREE.BoxGeometry(0.08, 0.025, 0.015);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.18, 0.08, zSign * 0.06);
    cardGroup.add(handle);

    // 3. Power Window & Mirror Switch Panel
    const switchPanelGeo = new THREE.BoxGeometry(0.12, 0.015, 0.04);
    const switchPanel = new THREE.Mesh(switchPanelGeo, switchMat);
    switchPanel.position.set(0.12, 0.045, zSign * 0.05);

    [-0.03, 0, 0.03].forEach((sX) => {
      const btnGeo = new THREE.BoxGeometry(0.018, 0.008, 0.012);
      const btn = new THREE.Mesh(btnGeo, handleMat);
      btn.position.set(sX, 0.008, 0);
      switchPanel.add(btn);
    });
    cardGroup.add(switchPanel);

    // 4. Laser-Perforated High-End Audio Speaker Grille
    const speakerGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.012, 24);
    speakerGeo.rotateX(Math.PI / 2);
    const speaker = new THREE.Mesh(speakerGeo, speakerMat);
    speaker.position.set(0.22, -0.12, zSign * 0.04);
    cardGroup.add(speaker);

    return cardGroup;
  }

  // ── 0d. PEDAL BOX GENERATOR ──
  private static buildPedalBox(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PedalBox_Assembly';

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.05, roughness: 0.95 });

    // 1. Accelerator Pedal (Narrow Long Organ Pedal)
    const gasGeo = new THREE.BoxGeometry(0.02, 0.12, 0.04);
    const gasPedal = new THREE.Mesh(gasGeo, metalMat);
    gasPedal.position.set(0, 0.06, 0.07);
    gasPedal.rotation.z = -0.35;

    // 2. Brake Pedal (Wide Heavy-Duty Racing Pad with Rubber Studs)
    const brakeGeo = new THREE.BoxGeometry(0.025, 0.09, 0.065);
    const brakePedal = new THREE.Mesh(brakeGeo, metalMat);
    brakePedal.position.set(0, 0.08, 0.00);
    brakePedal.rotation.z = -0.35;

    const rubberPadGeo = new THREE.BoxGeometry(0.008, 0.075, 0.05);
    const rubberPad = new THREE.Mesh(rubberPadGeo, rubberMat);
    rubberPad.position.set(-0.012, 0, 0);
    brakePedal.add(rubberPad);

    // 3. Clutch / Dead Pedal Footrest Plate (Left Foot Rest)
    const restGeo = new THREE.BoxGeometry(0.015, 0.14, 0.055);
    const deadPedal = new THREE.Mesh(restGeo, metalMat);
    deadPedal.position.set(0.02, 0.07, -0.08);
    deadPedal.rotation.z = -0.42;

    group.add(gasPedal, brakePedal, deadPedal);
    return group;
  }

  // ── 1. DASHBOARD GENERATOR ──
  private static buildDashboard(dashId: string, halfTrM: number, trim: InteriorTrimGrade, ambientHex: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `Dashboard_${dashId}`;

    const mainMat = this.getTrimMaterial(trim);
    const carbonMat = this.getTrimMaterial('forged_carbon');
    const aluminumMat = this.getTrimMaterial('brushed_aluminum');

    // Upper Dashboard Wing with Leather Stitching
    const upperGeo = new THREE.BoxGeometry(0.48, 0.18, halfTrM * 1.54);
    const upper = new THREE.Mesh(upperGeo, mainMat);
    upper.position.set(-0.25, 0.72, 0);
    upper.castShadow = true;
    group.add(upper);

    // Lower Knee Bolster Subframe with Glovebox
    const lowerGeo = new THREE.BoxGeometry(0.38, 0.16, halfTrM * 1.42);
    const lower = new THREE.Mesh(lowerGeo, carbonMat);
    lower.position.set(-0.22, 0.58, 0);
    group.add(lower);

    // Center Infotainment Glass Display (Ultrawide 16:9 Screen)
    const screenGeo = new THREE.BoxGeometry(0.02, 0.16, 0.34);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.23, 0.76, 0.05);

    // Screen Glass Bezel
    const bezelGeo = new THREE.BoxGeometry(0.024, 0.17, 0.35);
    const bezel = new THREE.Mesh(bezelGeo, carbonMat);
    bezel.position.set(-0.232, 0.76, 0.05);
    group.add(bezel, screen);

    // Quad Turbine AC Air Vents with Aluminum Louvers
    const ventPositions = [
      [-0.24, 0.70, -halfTrM * 0.65],
      [-0.24, 0.70, -0.12],
      [-0.24, 0.70, 0.22],
      [-0.24, 0.70, halfTrM * 0.65],
    ];

    ventPositions.forEach((pos) => {
      const ventRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.005, 8, 20),
        aluminumMat
      );
      ventRing.rotation.y = Math.PI / 2;
      ventRing.position.set(pos[0], pos[1], pos[2]);
      group.add(ventRing);
    });

    return group;
  }

  // ── 2. OLED DIGITAL CLUSTER & HUD ──
  private static buildCluster(clusterId: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `Cluster_${clusterId}`;

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Cluster Binnacle Cowl
    const binnacleGeo = new THREE.BoxGeometry(0.18, 0.14, 0.30);
    const binnacle = new THREE.Mesh(binnacleGeo, bezelMat);
    binnacle.position.set(0.04, 0.02, 0);
    group.add(binnacle);

    // Digital OLED Screen Panel
    const screenGeo = new THREE.BoxGeometry(0.015, 0.11, 0.26);
    const screen = new THREE.Mesh(screenGeo, glassMat);
    screen.position.set(0, 0, 0);
    group.add(screen);

    // Sweeping Tachometer Arc Ring
    const tachoArc = new THREE.Mesh(
      new THREE.RingGeometry(0.045, 0.052, 24, 1, 0, Math.PI * 1.5),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    tachoArc.rotation.y = Math.PI / 2;
    tachoArc.position.set(-0.01, 0, 0);
    group.add(tachoArc);

    // High-RPM Redline Needle Indicator
    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(0.002, 0.04, 0.004),
      needleMat
    );
    needle.position.set(-0.012, 0.02, 0);
    needle.rotation.x = 0.6;
    group.add(needle);

    return group;
  }

  private static buildHolographicHUD(): THREE.Group {
    const hud = new THREE.Group();
    hud.name = 'Windshield_Holographic_HUD';

    const hudMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.65,
    });

    const hudPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.08), hudMat);
    hudPlane.rotation.y = Math.PI / 2;
    hud.add(hudPlane);

    return hud;
  }

  // ── 3. GT3 / F1 STEERING WHEEL & PADDLE SHIFTERS ──
  private static buildSteeringWheel(wheelId: string, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Steering_${wheelId}`;

    const wheelGripMat = this.getTrimMaterial(trim === 'alcantara_race' ? 'alcantara_race' : 'nappa_leather');
    const carbonMat = this.getTrimMaterial('forged_carbon');
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });
    const redAccentMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const goldAccentMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const blueAccentMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

    // 1. Titanium Steering Column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.28, 16), metalMat);
    col.position.set(0.1, -0.06, 0);
    col.rotation.z = -Math.PI / 6;
    group.add(col);

    // 2. Carbon Fiber Magnetic Paddle Shifters (Upshift + / Downshift -)
    [-0.08, 0.08].forEach((py, idx) => {
      const paddleGeo = new THREE.BoxGeometry(0.008, 0.12, 0.028);
      const paddle = new THREE.Mesh(paddleGeo, carbonMat);
      paddle.position.set(0.03, 0.02, py);
      group.add(paddle);
    });

    // 3. F1/GT3 Yoke Frame or Flat-Bottom Sports Rim
    if (wheelId === 'STEERING_GT3_YOKE') {
      // Carbon Center Frame
      const centerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.24), carbonMat);
      group.add(centerFrame);

      // Ergonomic Alcantara Side Grips
      [-0.12, 0.12].forEach((gy) => {
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 16), wheelGripMat);
        grip.position.set(0, 0, gy);
        group.add(grip);
      });
    } else {
      // Flat-Bottom Racing Rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 12, 28), wheelGripMat);
      rim.rotation.y = Math.PI / 2;
      group.add(rim);

      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.03, 0.26), carbonMat);
      group.add(spoke);
    }

    // 4. Center Horn Boss with Metallic Emblem
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.025, 20), carbonMat);
    boss.rotation.z = Math.PI / 2;
    group.add(boss);

    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 16), metalMat);
    badge.rotation.z = Math.PI / 2;
    group.add(badge);

    // 5. 4 Rotary Cockpit Mode Dials (Engine, TC, ABS, Diff)
    const dialPositions = [
      [-0.03, -0.05, redAccentMat],
      [-0.03, 0.05, blueAccentMat],
      [0.03, -0.05, goldAccentMat],
      [0.03, 0.05, redAccentMat],
    ];

    dialPositions.forEach((dp) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.028, 12), dp[2] as THREE.Material);
      dial.rotation.z = Math.PI / 2;
      dial.position.set(-0.01, dp[0] as number, dp[1] as number);
      group.add(dial);
    });

    return group;
  }

  // ── 4. CENTER CONSOLE & CONTROLS ──
  private static buildCenterConsole(consoleId: string, wbM: number, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Console_${consoleId}`;

    const mainMat = this.getTrimMaterial('forged_carbon');
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.95, roughness: 0.15 });
    const redFlapMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.2, clearcoat: 0.8 });

    // Console Base Spine
    const base = new THREE.Mesh(new THREE.BoxGeometry(wbM * 0.46, 0.16, 0.24), mainMat);
    group.add(base);

    // Open-Gate Chrome Shifter Grid with Spherical Billet Knob
    const gatePlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.10), metalMat);
    gatePlate.position.set(0.06, 0.085, 0);
    group.add(gatePlate);

    const shiftLever = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.10, 12), metalMat);
    shiftLever.position.set(0.06, 0.14, 0);

    const shiftKnob = new THREE.Mesh(new THREE.SphereGeometry(0.020, 16, 16), metalMat);
    shiftKnob.position.set(0.06, 0.19, 0);
    group.add(shiftLever, shiftKnob);

    // Aircraft-Style Hinged Red Start/Stop Button Safety Flap
    const startBox = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), mainMat);
    startBox.position.set(-0.06, 0.09, 0);

    const startFlap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.012, 0.032), redFlapMat);
    startFlap.position.set(-0.06, 0.105, 0);
    group.add(startBox, startFlap);

    // Dual Carbon Fiber Cupholder Recesses
    [-0.04, 0.04].forEach((cy) => {
      const cupRing = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.004, 8, 20), metalMat);
      cupRing.rotation.x = Math.PI / 2;
      cupRing.position.set(-0.16, 0.085, cy);
      group.add(cupRing);
    });

    return group;
  }

  // ── 5. SEATS & 6-POINT RACING HARNESSES ──
  private static buildSeat(seatId: string, trim: InteriorTrimGrade, isDriver: boolean): THREE.Group {
    const group = new THREE.Group();
    group.name = `Seat_${seatId}_${isDriver ? 'Driver' : 'Passenger'}`;

    const seatMat = this.getTrimMaterial(trim === 'alcantara_race' ? 'alcantara_race' : 'nappa_leather');
    const shellMat = this.getTrimMaterial('forged_carbon');
    const harnessMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8, metalness: 0.1 });
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.9 });

    // 1. Deep Bucket Seat Bottom Cushion
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.13, 0.44), seatMat);
    bottom.castShadow = true;
    group.add(bottom);

    // High Lateral Thigh Bolsters
    [-0.20, 0.20].forEach((by) => {
      const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.10, 0.08), seatMat);
      bolster.position.set(0, 0.07, by);
      group.add(bolster);
    });

    // 2. Sculpted Backrest with Shoulder Wing Bolsters
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.44), seatMat);
    back.position.set(-0.17, 0.30, 0);
    back.rotation.z = -0.15;
    group.add(back);

    // Integrated Headrest
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.15, 0.24), seatMat);
    head.position.set(-0.25, 0.65, 0);
    group.add(head);

    // 3. Exposed Carbon Fiber Monocoque Back Shell
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.46), shellMat);
    shell.position.set(-0.23, 0.30, 0);
    shell.rotation.z = -0.15;
    shell.castShadow = true;
    group.add(shell);

    // 4. 6-Point Racing Harness Straps & Quick-Release Cam-Lock Buckle
    // Shoulder Straps
    [-0.09, 0.09].forEach((sy) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.05), harnessMat);
      strap.position.set(-0.15, 0.30, sy);
      strap.rotation.z = -0.15;
      group.add(strap);
    });

    // Central Anodized Cam-Lock Rotary Buckle
    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.020, 16), buckleMat);
    buckle.rotation.z = Math.PI / 2;
    buckle.position.set(-0.06, 0.14, 0);
    group.add(buckle);

    return group;
  }

  // ── 6. AMBIENT FIBER-OPTIC LIGHT STRIP ──
  private static buildAmbientLightstrip(halfTrM: number, colorHex: string): THREE.Mesh {
    const lightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
    });

    const stripGeo = new THREE.BoxGeometry(0.015, 0.012, halfTrM * 1.52);
    const strip = new THREE.Mesh(stripGeo, lightMat);
    strip.name = 'AmbientLightstrip';
    return strip;
  }

  // ── PBR MATERIAL FACTORY ──
  private static getTrimMaterial(trim: InteriorTrimGrade): THREE.MeshStandardMaterial {
    switch (trim) {
      case 'forged_carbon':
        return new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.25, metalness: 0.65 });
      case 'open_pore_wood':
        return new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.70, metalness: 0.05 });
      case 'alcantara_race':
        return new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95, metalness: 0.0 });
      case 'brushed_aluminum':
        return new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.25, metalness: 0.95 });
      case 'nappa_leather':
      default:
        return new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75, metalness: 0.1 });
    }
  }
}
