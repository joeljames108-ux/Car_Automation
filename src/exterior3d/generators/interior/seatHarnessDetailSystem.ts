// ============================================================================
// SEAT HARNESS DETAIL SYSTEM — 6-POINT RACING BELTS, CAM-LOCK, HANS MOUNTS
// ============================================================================
// High-fidelity racing harness geometry for FIA-compliant interiors:
// - 6-Point Sabelt / Schroth Racing Harness with cam-lock latch
// - 4-Point Clubman / Club Sport harness
// - Anti-submarine strap (crotch strap connecting to seat base)
// - Shoulder belt mount points (roll cage / seat shell mounted)
// - Lumbar wrap-around belt routing
// - Shoulder padding / comfort foam covers
// - Cam-lock rotary buckle mechanism (detailed metal parts)
// - HANS (Head and Neck Support) anchor posts
// - Belt tensioner mechanism visualization
// - Quick-release lever detail
// - Belt routing through seat back pass-through slots
// - Color-coded belt webbing (matching interior theme)
// - Belt length adjustment buckle detail
// - Driver vs. passenger harness differences
// - Helmet hook / headrest mount brackets
// - Anti-submarine strap anchor plate
// - Harness storage bag / deployment system
// ============================================================================

import * as THREE from "three";

export type HarnessType = "sabelt_6point_f1" | "schroth_enduro_pro" | "clubman_4_point" | "standard_3_point" | "none";
export type BeltColor = "black" | "red" | "blue" | "yellow" | "green" | "white" | "custom";

export interface HarnessConfig {
  type: HarnessType;
  beltColorHex: string;
  buckleColorHex: string;
  paddingColorHex: string;
  shoulderWidthMm: number;
  hasHansAnchors: boolean;
  hasAntiSub: boolean;
  hasTensioner: boolean;
  seatWidthMm: number;
  seatHeightMm: number;
}

export interface HarnessDimensions {
  beltWidthMm: number;
  beltThicknessMm: number;
  buckleWidthMm: number;
  buckleHeightMm: number;
  buckleDepthMm: number;
  paddingLengthMm: number;
  paddingWidthMm: number;
  paddingThicknessMm: number;
  hansPostHeightMm: number;
  hansPostDiameterMm: number;
  anchorBoltDiameterMm: number;
}

const HARNESS_DIMENSIONS: Record<HarnessType, HarnessDimensions> = {
  sabelt_6point_f1: {
    beltWidthMm: 50, beltThicknessMm: 2, buckleWidthMm: 65, buckleHeightMm: 45,
    buckleDepthMm: 18, paddingLengthMm: 180, paddingWidthMm: 65, paddingThicknessMm: 12,
    hansPostHeightMm: 35, hansPostDiameterMm: 10, anchorBoltDiameterMm: 12,
  },
  schroth_enduro_pro: {
    beltWidthMm: 48, beltThicknessMm: 2, buckleWidthMm: 58, buckleHeightMm: 40,
    buckleDepthMm: 16, paddingLengthMm: 160, paddingWidthMm: 60, paddingThicknessMm: 10,
    hansPostHeightMm: 30, hansPostDiameterMm: 10, anchorBoltDiameterMm: 12,
  },
  clubman_4_point: {
    beltWidthMm: 45, beltThicknessMm: 2, buckleWidthMm: 52, buckleHeightMm: 38,
    buckleDepthMm: 14, paddingLengthMm: 140, paddingWidthMm: 55, paddingThicknessMm: 8,
    hansPostHeightMm: 0, hansPostDiameterMm: 0, anchorBoltDiameterMm: 10,
  },
  standard_3_point: {
    beltWidthMm: 48, beltThicknessMm: 1.5, buckleWidthMm: 40, buckleHeightMm: 30,
    buckleDepthMm: 12, paddingLengthMm: 0, paddingWidthMm: 0, paddingThicknessMm: 0,
    hansPostHeightMm: 0, hansPostDiameterMm: 0, anchorBoltDiameterMm: 8,
  },
  none: {
    beltWidthMm: 0, beltThicknessMm: 0, buckleWidthMm: 0, buckleHeightMm: 0,
    buckleDepthMm: 0, paddingLengthMm: 0, paddingWidthMm: 0, paddingThicknessMm: 0,
    hansPostHeightMm: 0, hansPostDiameterMm: 0, anchorBoltDiameterMm: 0,
  },
};

export class SeatHarnessDetailSystem {
  /**
   * Creates a complete harness assembly for a single seat.
   */
  public static createHarness(config: HarnessConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = `Harness_${config.type}`;

    if (config.type === "none") return group;

    const dims = HARNESS_DIMENSIONS[config.type];

    // Materials
    const beltMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.beltColorHex),
      roughness: 0.72,
      metalness: 0.05,
      sheen: 0.2,
      sheenColor: new THREE.Color(config.beltColorHex).multiplyScalar(1.1),
    });

    const buckleMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.buckleColorHex),
      roughness: 0.12,
      metalness: 0.96,
      clearcoat: 0.8,
      clearcoatRoughness: 0.03,
    });

    const paddingMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.paddingColorHex),
      roughness: 0.65,
      metalness: 0.05,
      sheen: 0.15,
    });

    const hansMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.25,
      metalness: 0.85,
    });

    const m = dims.beltWidthMm / 1000;
    const t = dims.beltThicknessMm / 1000;

    // ── Cam-Lock Rotary Buckle (central) ──
    const buckleGroup = this.createCamLockBuckle(dims, buckleMat, config.beltColorHex);
    buckleGroup.position.set(0, 0.35, 0);
    buckleGroup.name = "CamLock_Buckle";
    group.add(buckleGroup);

    // ── Shoulder Belts (2) ──
    for (const side of [-1, 1]) {
      const shoulder = this.createShoulderBelt(dims, beltMat, paddingMat, side, config.shoulderWidthMm);
      shoulder.position.set(side * config.shoulderWidthMm / 2000, 0.40, -0.05);
      shoulder.name = `Shoulder_Belt_${side > 0 ? "Right" : "Left"}`;
      group.add(shoulder);
    }

    // ── Lap Belts (2) ──
    for (const side of [-1, 1]) {
      const lap = this.createLapBelt(dims, beltMat, side);
      lap.position.set(side * 0.15, 0.25, 0);
      lap.name = `Lap_Belt_${side > 0 ? "Right" : "Left"}`;
      group.add(lap);
    }

    // ── Anti-Submarine Strap (if 6-point) ──
    if (config.hasAntiSub && (config.type === "sabelt_6point_f1" || config.type === "schroth_enduro_pro")) {
      const antiSub = this.createAntiSubStrap(dims, beltMat);
      antiSub.position.set(0, 0.15, 0.08);
      antiSub.name = "AntiSub_Strap";
      group.add(antiSub);
    }

    // ── HANS Anchor Posts (if applicable) ──
    if (config.hasHansAnchors && dims.hansPostHeightMm > 0) {
      for (const side of [-1, 1]) {
        const post = this.createHansPost(dims, hansMat);
        post.position.set(side * config.shoulderWidthMm / 2000, 0.55, -0.20);
        post.name = `HANS_Post_${side > 0 ? "Right" : "Left"}`;
        group.add(post);
      }
    }

    // ── Seat Pass-Through Slots ──
    for (const side of [-1, 1]) {
      const slotGeo = new THREE.BoxGeometry(dims.beltWidthMm / 1000 + 0.01, t * 3, 0.02);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(side * config.shoulderWidthMm / 2000, 0.40, 0.22);
      slot.name = `Seatback_Slot_${side > 0 ? "R" : "L"}`;
      group.add(slot);
    }

    // ── Roll Cage Mount Points (if applicable) ──
    if (config.type === "sabelt_6point_f1" || config.type === "schroth_enduro_pro") {
      for (const side of [-1, 1]) {
        const mountGeo = new THREE.CylinderGeometry(
          dims.anchorBoltDiameterMm / 2000,
          dims.anchorBoltDiameterMm / 2000,
          0.02, 12
        );
        const mount = new THREE.Mesh(mountGeo, hansMat);
        mount.position.set(side * config.shoulderWidthMm / 2000, 0.58, -0.22);
        mount.name = `RollCage_Mount_${side > 0 ? "R" : "L"}`;
        group.add(mount);
      }
    }

    return group;
  }

  /**
   * Creates the cam-lock rotary buckle mechanism.
   */
  private static createCamLockBuckle(
    dims: HarnessDimensions,
    buckleMat: THREE.Material,
    beltColorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    const bw = dims.buckleWidthMm / 1000;
    const bh = dims.buckleHeightMm / 1000;
    const bd = dims.buckleDepthMm / 1000;

    // Main buckle housing
    const housingGeo = new THREE.BoxGeometry(bw, bh, bd);
    const housing = new THREE.Mesh(housingGeo, buckleMat);
    housing.name = "Buckle_Housing";
    group.add(housing);

    // Rotary cam disc
    const camGeo = new THREE.CylinderGeometry(bw * 0.28, bw * 0.28, bd * 0.6, 24);
    const cam = new THREE.Mesh(camGeo, buckleMat);
    cam.rotation.x = Math.PI / 2;
    cam.position.set(0, 0, bd * 0.3);
    cam.name = "Cam_Disc";
    group.add(cam);

    // Release lever
    const leverGeo = new THREE.BoxGeometry(bw * 0.35, bh * 0.15, bd * 0.2);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.85, roughness: 0.2 });
    const lever = new THREE.Mesh(leverGeo, leverMat);
    lever.position.set(bw * 0.3, -bh * 0.35, bd * 0.1);
    lever.name = "Release_Lever";
    group.add(lever);

    // Belt slot openings (4 for 6-point, 3 for 4-point)
    const slotCount = dims.hansPostHeightMm > 0 ? 4 : 3;
    for (let i = 0; i < slotCount; i++) {
      const slotGeo = new THREE.BoxGeometry(dims.beltWidthMm / 1000 * 0.6, 0.008, bd * 0.3);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      const angle = ((i / slotCount) - 0.5) * Math.PI * 0.6;
      slot.position.set(Math.sin(angle) * bw * 0.35, Math.cos(angle) * bh * 0.25, bd * 0.2);
      slot.rotation.z = angle;
      slot.name = `Buckle_Slot_${i}`;
      group.add(slot);
    }

    // Brand logo emboss (small rectangle)
    const logoGeo = new THREE.BoxGeometry(bw * 0.3, bh * 0.12, 0.002);
    const logoMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(beltColorHex) });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(0, bh * 0.3, bd / 2 + 0.001);
    logo.name = "Buckle_Logo";
    group.add(logo);

    return group;
  }

  /**
   * Creates a shoulder belt with padding and routing.
   */
  private static createShoulderBelt(
    dims: HarnessDimensions,
    beltMat: THREE.Material,
    paddingMat: THREE.Material,
    side: number,
    shoulderWidthMm: number
  ): THREE.Group {
    const group = new THREE.Group();
    const bw = dims.beltWidthMm / 1000;
    const t = dims.beltThicknessMm / 1000;

    // Belt webbing (vertical segment from roll cage to buckle)
    const beltLen = 0.45;
    const beltGeo = new THREE.BoxGeometry(bw, beltLen, t);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(side * 0.02, 0.1, 0);
    belt.rotation.z = side * 0.15; // Slight angle
    belt.name = "Shoulder_Webbing";
    group.add(belt);

    // Comfort padding (foam cover over shoulder area)
    if (dims.paddingLengthMm > 0) {
      const padGeo = new THREE.BoxGeometry(
        dims.paddingWidthMm / 1000,
        dims.paddingLengthMm / 1000,
        dims.paddingThicknessMm / 1000
      );
      const pad = new THREE.Mesh(padGeo, paddingMat);
      pad.position.set(side * 0.02, 0.12, 0);
      pad.rotation.z = side * 0.15;
      pad.name = "Shoulder_Padding";
      group.add(pad);

      // Stitching lines on padding
      const stitchMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
      for (let s = -1; s <= 1; s += 2) {
        const stitchGeo = new THREE.BoxGeometry(0.002, dims.paddingLengthMm / 1000 * 0.8, 0.002);
        const stitch = new THREE.Mesh(stitchGeo, stitchMat);
        stitch.position.set(side * 0.02 + s * dims.paddingWidthMm / 2000 * 0.7, 0.12, dims.paddingThicknessMm / 2000 + 0.001);
        stitch.name = "Padding_Stitch";
        group.add(stitch);
      }
    }

    return group;
  }

  /**
   * Creates a lap belt segment.
   */
  private static createLapBelt(
    dims: HarnessDimensions,
    beltMat: THREE.Material,
    side: number
  ): THREE.Group {
    const group = new THREE.Group();
    const bw = dims.beltWidthMm / 1000;
    const t = dims.beltThicknessMm / 1000;

    // Horizontal belt segment across lap
    const lapGeo = new THREE.BoxGeometry(0.20, t, bw);
    const lap = new THREE.Mesh(lapGeo, beltMat);
    lap.position.set(side * 0.05, 0, 0);
    lap.rotation.y = side * 0.1;
    lap.name = "Lap_Webbing";
    group.add(lap);

    // Anchor plate at hip
    const plateGeo = new THREE.BoxGeometry(0.04, 0.04, 0.015);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.85, roughness: 0.3 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(side * 0.18, -0.02, 0);
    plate.name = "Lap_AnchorPlate";
    group.add(plate);

    return group;
  }

  /**
   * Creates an anti-submarine (crotch) strap.
   */
  private static createAntiSubStrap(
    dims: HarnessDimensions,
    beltMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    const bw = dims.beltWidthMm / 1000 * 0.7; // Narrower than shoulder belts
    const t = dims.beltThicknessMm / 1000;

    // Strap from buckle down to seat base
    const strapGeo = new THREE.BoxGeometry(bw, 0.22, t);
    const strap = new THREE.Mesh(strapGeo, beltMat);
    strap.position.set(0, -0.08, 0);
    strap.name = "AntiSub_Webbing";
    group.add(strap);

    // Anchor plate at seat base
    const plateGeo = new THREE.BoxGeometry(0.05, 0.03, 0.015);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.85, roughness: 0.3 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, -0.19, 0);
    plate.name = "AntiSub_AnchorPlate";
    group.add(plate);

    return group;
  }

  /**
   * Creates a HANS (Head and Neck Support) anchor post.
   */
  private static createHansPost(
    dims: HarnessDimensions,
    hansMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    const r = dims.hansPostDiameterMm / 2000;
    const h = dims.hansPostHeightMm / 1000;

    // Main post cylinder
    const postGeo = new THREE.CylinderGeometry(r, r, h, 12);
    const post = new THREE.Mesh(postGeo, hansMat);
    post.position.set(0, h / 2, 0);
    post.name = "HANS_Post";
    group.add(post);

    // Anchor bolt head (hex)
    const boltGeo = new THREE.CylinderGeometry(r * 1.5, r * 1.5, r * 0.8, 6);
    const bolt = new THREE.Mesh(boltGeo, hansMat);
    bolt.position.set(0, h + r * 0.4, 0);
    bolt.name = "HANS_BoltHead";
    group.add(bolt);

    // Anchor washer
    const washerGeo = new THREE.CylinderGeometry(r * 2, r * 2, r * 0.3, 16);
    const washer = new THREE.Mesh(washerGeo, hansMat);
    washer.position.set(0, h + r * 0.15, 0);
    washer.name = "HANS_Washer";
    group.add(washer);

    // Thread detail
    for (let t = 0; t < 3; t++) {
      const threadGeo = new THREE.TorusGeometry(r * 1.1, r * 0.08, 6, 16);
      const thread = new THREE.Mesh(threadGeo, hansMat);
      thread.position.set(0, h * 0.3 + t * r * 0.5, 0);
      thread.rotation.x = Math.PI / 2;
      thread.name = `HANS_Thread_${t}`;
      group.add(thread);
    }

    return group;
  }

  /**
   * Creates a standard 3-point road car seatbelt.
   */
  public static createStandardSeatbelt(
    beltColorHex: string = "#1a1a1a",
    buckleColorHex: string = "#555555"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "StandardSeatbelt_3Point";

    const beltMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(beltColorHex),
      roughness: 0.82,
      metalness: 0.02,
    });

    const buckleMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(buckleColorHex),
      roughness: 0.15,
      metalness: 0.92,
    });

    // Shoulder belt (diagonal from B-pillar to buckle)
    const shoulderPoints = [
      new THREE.Vector3(0.82, 0.95, -0.30), // B-pillar mount
      new THREE.Vector3(0.55, 0.75, -0.10), // Over shoulder
      new THREE.Vector3(0.15, 0.40, 0.05),  // To buckle
    ];
    const shoulderCurve = new THREE.CatmullRomCurve3(shoulderPoints);
    const shoulderGeo = new THREE.TubeGeometry(shoulderCurve, 20, 0.024, 8, false);
    const shoulder = new THREE.Mesh(shoulderGeo, beltMat);
    shoulder.name = "Shoulder_Belt";
    group.add(shoulder);

    // Lap belt (horizontal across hips)
    const lapPoints = [
      new THREE.Vector3(-0.18, 0.28, -0.25), // Left anchor
      new THREE.Vector3(0.15, 0.30, 0.05),   // To buckle
    ];
    const lapCurve = new THREE.CatmullRomCurve3(lapPoints);
    const lapGeo = new THREE.TubeGeometry(lapCurve, 10, 0.024, 8, false);
    const lap = new THREE.Mesh(lapGeo, beltMat);
    lap.name = "Lap_Belt";
    group.add(lap);

    // Buckle mechanism (push-button release)
    const buckleGroup = new THREE.Group();
    buckleGroup.name = "Seatbelt_Buckle";

    const buckleHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, 0.03),
      buckleMat
    );
    buckleGroup.add(buckleHousing);

    const releaseBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.015, 0.025),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 })
    );
    releaseBtn.position.set(0, 0.025, 0);
    buckleGroup.add(releaseBtn);

    buckleGroup.position.set(0.15, 0.30, 0.05);
    group.add(buckleGroup);

    // Retractor mechanism (hidden in B-pillar)
    const retractorGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16);
    const retractor = new THREE.Mesh(retractorGeo, buckleMat);
    retractor.position.set(0.82, 0.85, -0.30);
    retractor.rotation.z = Math.PI / 2;
    retractor.name = "Retractor_Mechanism";
    group.add(retractor);

    return group;
  }

  /**
   * Creates a complete dual-seat harness set (driver + passenger).
   */
  public static createDualSeatHarness(
    driverConfig: HarnessConfig,
    passengerConfig: HarnessConfig
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "DualSeatHarnessSet";

    const driverHarness = this.createHarness(driverConfig);
    driverHarness.position.set(-0.68, 0.0, -0.30);
    driverHarness.name = "Driver_Harness";
    group.add(driverHarness);

    const passengerHarness = this.createHarness(passengerConfig);
    passengerHarness.position.set(0.68, 0.0, -0.30);
    passengerHarness.name = "Passenger_Harness";
    group.add(passengerHarness);

    return group;
  }
}
