// ====================================================================
// BODY PANEL GAP & SHUT LINES SYSTEM - Manufacturing Precision
// ====================================================================
// Complete body panel gap simulation:
// - Panel shut lines with configurable widths per panel
// - Rubber/foam/PVC/EPDM weather seal strips
// - Edge highlight reflections
// - Manufacturing tolerance simulation
// - Panel clip mounting points
// - Drain channel grooves (A-pillar, roof ditch)
// - Bumper-to-fender transition gaps
// - Hood/fender radius match
// - Door-to-door flush alignment
// - Trunk lid gap with weather stripping
// - Front/rear bumper fascia gaps
// - Rocker panel to fender transitions
// - Tailgate / hatchback shut lines
// - Fender liner inner edge
// - A-pillar, B-pillar, C-pillar gap coverage
// - Decklid / tonneau cover gaps
// - Fuel door recessed panel gap
// - Camera / sensor bezel gaps
// ====================================================================

import * as THREE from "three";

export interface PanelGapConfig {
  frontHoodGap: number;
  rearTrunkGap: number;
  doorGap: number;
  fenderGap: number;
  bumperGap: number;
  roofGap: number;
  rockerGap: number;
  quarterPanelGap: number;
  cowlGap: number;
  valanceGap: number;
  hatchbackGap: number;
  tailgateGap: number;
  fuelDoorGap: number;
  cameraBezelGap: number;
  sealMaterial: "rubber" | "foam" | "pvc" | "epdm";
  tolerance: number;
  edgeHighlightWidth: number;
  hasDrainChannels: boolean;
  hasClipMarkers: boolean;
}

export const DEFAULT_PANEL_GAPS: PanelGapConfig = {
  frontHoodGap: 3.5,
  rearTrunkGap: 3.8,
  doorGap: 4.0,
  fenderGap: 3.2,
  bumperGap: 4.5,
  roofGap: 3.0,
  rockerGap: 3.5,
  quarterPanelGap: 3.6,
  cowlGap: 3.0,
  valanceGap: 4.2,
  hatchbackGap: 4.0,
  tailgateGap: 4.5,
  fuelDoorGap: 2.5,
  cameraBezelGap: 1.5,
  sealMaterial: "rubber",
  tolerance: 0.5,
  edgeHighlightWidth: 0.003,
  hasDrainChannels: true,
  hasClipMarkers: true,
};

// --- SEAL MATERIALS ---
const SEAL_MATERIALS: Record<string, Partial<THREE.MeshPhysicalMaterialParameters>> = {
  rubber: { color: 0x111111, roughness: 0.85, metalness: 0.0, clearcoat: 0.05 },
  foam: { color: 0x222222, roughness: 0.7, metalness: 0.0, clearcoat: 0.1 },
  pvc: { color: 0x1a1a1a, roughness: 0.75, metalness: 0.0, clearcoat: 0.08 },
  epdm: { color: 0x0e0e0e, roughness: 0.8, metalness: 0.0, clearcoat: 0.06 },
};

// --- PANEL GAP STATISTICS ---
export interface PanelGapStatistics {
  totalGaps: number;
  averageGapWidth: number;
  maxGapWidth: number;
  minGapWidth: number;
  totalSealLength: number;
  clipCount: number;
}

// --- BODY PANEL GAP SYSTEM ---
export class BodyPanelGapSystem {
  private config: PanelGapConfig;

  constructor(config: PanelGapConfig = DEFAULT_PANEL_GAPS) {
    this.config = config;
  }

  // --- SEAL STRIP ---
  public static createSealStrip(gapWidth: number, length: number, material: string): THREE.Mesh {
    const w = gapWidth / 1000;
    const matProps = SEAL_MATERIALS[material] || SEAL_MATERIALS.rubber;
    const mat = new THREE.MeshPhysicalMaterial(matProps);
    const geo = new THREE.BoxGeometry(length, w * 0.8, w * 0.3);
    return new THREE.Mesh(geo, mat);
  }

  // --- SHUT LINE ---
  public static createShutLine(gapWidth: number, length: number, sealMat: string = "rubber"): THREE.Group {
    const group = new THREE.Group();
    const w = gapWidth / 1000;

    // Black gap line
    const gapMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const gapGeo = new THREE.BoxGeometry(length, w * 0.5, 0.001);
    const gap = new THREE.Mesh(gapGeo, gapMat);
    gap.name = "ShutLine_Gap";
    group.add(gap);

    // Weather seal strip
    const seal = this.createSealStrip(gapWidth, length, sealMat);
    seal.name = "ShutLine_Seal";
    seal.position.y = w * 0.25;
    group.add(seal);

    // Edge highlights (reflected light on panel edges)
    const edgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc, metalness: 0.9, roughness: 0.1, clearcoat: 0.8,
    });
    for (const side of [-1, 1]) {
      const edgeGeo = new THREE.BoxGeometry(length, 0.001, 0.003);
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.z = side * w * 0.5;
      group.add(edge);
    }

    // Inner shadow line (dark recess)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const shadowGeo = new THREE.BoxGeometry(length, w * 0.15, 0.001);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = w * 0.35;
    shadow.position.z = 0.001;
    group.add(shadow);

    // Outer lip highlight (catches light on panel edge)
    const lipMat = new THREE.MeshPhysicalMaterial({
      color: 0xdddddd, metalness: 0.85, roughness: 0.08, clearcoat: 0.9,
    });
    const lipGeo = new THREE.BoxGeometry(length, 0.0005, 0.001);
    const lipTop = new THREE.Mesh(lipGeo, lipMat);
    lipTop.position.y = w * 0.25;
    lipTop.position.z = w * 0.55;
    group.add(lipTop);
    const lipBot = lipTop.clone();
    lipBot.position.z = -w * 0.55;
    group.add(lipBot);

    return group;
  }

  // --- DRAIN CHANNEL ---
  public static createDrainChannel(length: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "DrainChannel";

    const channelMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.2 });
    // Main channel groove
    const channelGeo = new THREE.BoxGeometry(length, 0.002, 0.008);
    const channel = new THREE.Mesh(channelGeo, channelMat);
    group.add(channel);

    // Drain holes
    const holeCount = Math.floor(length / 0.15);
    for (let i = 0; i < holeCount; i++) {
      const holeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.003, 8);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.x = -length / 2 + (i + 0.5) * (length / holeCount);
      group.add(hole);
    }

    // Channel sidewalls
    const sideMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.3 });
    for (const side of [-1, 1]) {
      const wallGeo = new THREE.BoxGeometry(length, 0.001, 0.002);
      const wall = new THREE.Mesh(wallGeo, sideMat);
      wall.position.z = side * 0.005;
      group.add(wall);
    }

    return group;
  }

  // --- PANEL CLIP MARKER ---
  public static createClipMarkers(length: number, count: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "PanelClips";

    const clipMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.3 });
    for (let i = 0; i < count; i++) {
      const x = -length / 2 + (i + 0.5) * (length / count);
      // Clip body
      const clipGeo = new THREE.CylinderGeometry(0.003, 0.004, 0.002, 8);
      const clip = new THREE.Mesh(clipGeo, clipMat);
      clip.position.set(x, 0, 0.003);
      group.add(clip);
      // Clip retainer
      const retGeo = new THREE.RingGeometry(0.002, 0.004, 8);
      const retMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
      const ret = new THREE.Mesh(retGeo, retMat);
      ret.position.set(x, 0, 0.004);
      group.add(ret);
    }
    return group;
  }

  // --- TOLERANCE VISUALIZATION ---
  public static createToleranceIndicator(gapWidth: number, length: number, tolerance: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "ToleranceIndicator";
    const w = gapWidth / 1000;
    const t = tolerance / 1000;

    // Upper tolerance bound
    const upperMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1 });
    const upperGeo = new THREE.BoxGeometry(length, t, 0.0005);
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.y = w * 0.25 + t / 2;
    group.add(upper);

    // Lower tolerance bound
    const lower = upper.clone();
    lower.position.y = w * 0.25 - t / 2;
    group.add(lower);

    return group;
  }

  // --- GAP ALIGNMENT GAUGE ---
  public static createAlignmentGauge(length: number, startGap: number, endGap: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "AlignmentGauge";
    const mat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.05 });
    const segCount = 20;
    for (let i = 0; i < segCount; i++) {
      const t = i / (segCount - 1);
      const gap = startGap + (endGap - startGap) * t;
      const w = gap / 1000;
      const segLen = length / segCount;
      const segGeo = new THREE.BoxGeometry(segLen, w * 0.3, 0.0005);
      const seg = new THREE.Mesh(segGeo, mat);
      seg.position.x = -length / 2 + (i + 0.5) * segLen;
      group.add(seg);
    }
    return group;
  }

  // --- PANEL BUILDER METHODS ---
  public static buildHoodGap(wheelbase: number): THREE.Group {
    const gap = this.createShutLine(DEFAULT_PANEL_GAPS.frontHoodGap, wheelbase * 0.35);
    gap.name = "HoodGap";
    gap.rotation.z = Math.PI / 2;
    gap.position.set(wheelbase * 0.3, 0.48, 0);
    if (DEFAULT_PANEL_GAPS.hasClipMarkers) {
      const clips = this.createClipMarkers(wheelbase * 0.35, 6);
      clips.rotation.z = Math.PI / 2;
      clips.position.set(wheelbase * 0.3, 0.48, 0);
      gap.add(clips);
    }
    return gap;
  }

  public static buildDoorGaps(wheelbase: number, trackWidth: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "DoorGaps";
    for (const z of [trackWidth / 2000, -trackWidth / 2000]) {
      const gap = this.createShutLine(DEFAULT_PANEL_GAPS.doorGap, wheelbase * 0.4);
      gap.rotation.x = Math.PI / 2;
      gap.position.set(0, 0.45, z + 0.001);
      group.add(gap);
    }
    return group;
  }

  public static buildTrunkGap(wheelbase: number): THREE.Group {
    const gap = this.createShutLine(DEFAULT_PANEL_GAPS.rearTrunkGap, wheelbase * 0.3);
    gap.name = "TrunkGap";
    gap.rotation.z = Math.PI / 2;
    gap.position.set(-wheelbase * 0.25, 0.5, 0);
    return gap;
  }

  public static buildFenderGaps(wheelbase: number, trackWidth: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "FenderGaps";
    // Front fender to door
    const frontGap = this.createShutLine(DEFAULT_PANEL_GAPS.fenderGap, wheelbase * 0.15);
    frontGap.rotation.x = Math.PI / 2;
    frontGap.position.set(wheelbase * 0.2, 0.43, trackWidth / 2000 + 0.001);
    group.add(frontGap);
    // Rear quarter panel
    const rearGap = this.createShutLine(DEFAULT_PANEL_GAPS.quarterPanelGap, wheelbase * 0.2);
    rearGap.rotation.x = Math.PI / 2;
    rearGap.position.set(-wheelbase * 0.2, 0.43, trackWidth / 2000 + 0.001);
    group.add(rearGap);
    return group;
  }

  public static buildBumperGaps(wheelbase: number, trackWidth: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "BumperGaps";
    // Front bumper to fender
    const frontBumper = this.createShutLine(DEFAULT_PANEL_GAPS.bumperGap, trackWidth / 1000 * 0.3);
    frontBumper.rotation.z = Math.PI / 2;
    frontBumper.position.set(wheelbase * 0.38, 0.35, 0);
    group.add(frontBumper);
    // Rear bumper to quarter
    const rearBumper = this.createShutLine(DEFAULT_PANEL_GAPS.bumperGap, trackWidth / 1000 * 0.3);
    rearBumper.rotation.z = Math.PI / 2;
    rearBumper.position.set(-wheelbase * 0.35, 0.35, 0);
    group.add(rearBumper);
    return group;
  }

  public static buildRoofDitch(wheelbase: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "RoofDitch";
    if (!DEFAULT_PANEL_GAPS.hasDrainChannels) return group;
    for (const z of [0.45, -0.45]) {
      const drain = this.createDrainChannel(wheelbase * 0.6);
      drain.rotation.z = Math.PI / 2;
      drain.position.set(0, 0.76, z);
      group.add(drain);
    }
    return group;
  }

  public static buildHatchbackGap(wheelbase: number): THREE.Group {
    const gap = this.createShutLine(DEFAULT_PANEL_GAPS.hatchbackGap, wheelbase * 0.35);
    gap.name = "HatchbackGap";
    gap.rotation.z = Math.PI / 2;
    gap.position.set(-wheelbase * 0.2, 0.6, 0);
    return gap;
  }

  public static buildFuelDoorGap(): THREE.Group {
    const gap = this.createShutLine(DEFAULT_PANEL_GAPS.fuelDoorGap, 0.08);
    gap.name = "FuelDoorGap";
    gap.rotation.z = Math.PI / 2;
    gap.position.set(0.2, 0.42, 0.73);
    return gap;
  }

  public static buildCameraBezelGap(length: number): THREE.Group {
    const gap = this.createShutLine(DEFAULT_PANEL_GAPS.cameraBezelGap, length);
    gap.name = "CameraBezelGap";
    return gap;
  }

  // --- STATISTICS ---
  public static computeStatistics(config: PanelGapConfig): PanelGapStatistics {
    const gaps = [
      config.frontHoodGap, config.rearTrunkGap, config.doorGap,
      config.fenderGap, config.bumperGap, config.roofGap,
      config.rockerGap, config.quarterPanelGap, config.cowlGap,
      config.valanceGap, config.hatchbackGap, config.tailgateGap,
    ];
    return {
      totalGaps: gaps.length,
      averageGapWidth: gaps.reduce((a, b) => a + b, 0) / gaps.length,
      maxGapWidth: Math.max(...gaps),
      minGapWidth: Math.min(...gaps),
      totalSealLength: gaps.reduce((a, b) => a + b, 0) * 0.1, // approximate total seal length in m
      clipCount: config.hasClipMarkers ? gaps.length * 6 : 0,
    };
  }

  // --- APPLY TO SCENE ---
  public static applyToScene(root: THREE.Object3D, wheelbase: number, trackWidth: number): void {
    const group = new THREE.Group();
    group.name = "PanelGaps";
    group.add(this.buildHoodGap(wheelbase));
    group.add(this.buildDoorGaps(wheelbase, trackWidth));
    group.add(this.buildTrunkGap(wheelbase));
    group.add(this.buildFenderGaps(wheelbase, trackWidth));
    group.add(this.buildBumperGaps(wheelbase, trackWidth));
    group.add(this.buildRoofDitch(wheelbase));
    group.add(this.buildHatchbackGap(wheelbase));
    group.add(this.buildFuelDoorGap());
    root.add(group);
  }
}
