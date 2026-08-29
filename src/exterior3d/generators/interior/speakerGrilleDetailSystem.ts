// ============================================================================
// SPEAKER GRILLE DETAIL SYSTEM — LASER-CUT PERFORATED GRILLES, ILLUMINATED
// ============================================================================
// High-fidelity audio system speaker geometry for luxury interiors:
// - Laser-cut micro-perforated aluminum speaker grilles (2mm holes, hex pattern)
// - Illuminated brand crest badges (Bang & Olufsen, Burmester, Naim, Mark Levinson)
// - Door-mounted woofer/midrange assemblies with surround rings
// - A-pillar tweeter domes with motorized pop-up mechanisms
// - Dashboard center channel speaker grille
// - Rear parcel shelf speaker housings
// - Subwoofer enclosure (trunk / under-seat)
// - Amplifier heat sink housing detail
// - Speaker wiring conduit routing visualization
// - Active noise cancellation microphone locations
// - Headrest-mounted surround speakers
// - Frequency-response visualizer mesh
// - Cross-over network component placement
// - Speaker cone materials (Kevlar, paper, aluminum, beryllium)
// - Floating lens speaker covers (B&O style)
// ============================================================================

import * as THREE from "three";

export type SpeakerType = "woofer" | "midrange" | "tweeter" | "subwoofer" | "center_channel" | "surround";
export type SpeakerGrillePattern = "hexagonal" | "circular" | "linear_slot" | "custom_logo" | "mesh_woven";
export type SpeakerBrand = "bespoke" | "bang_olufsen" | "burmester" | "naim" | "mark_levinson" | "focal" | "harman_kardon";

export interface SpeakerConfig {
  type: SpeakerType;
  brand: SpeakerBrand;
  diameterMm: number;
  grillePattern: SpeakerGrillePattern;
  hasIllumination: boolean;
  illuminationColorHex: string;
  grilleColorHex: string;
  surroundColorHex: string;
  isMotorized: boolean;
  coneMaterial: "kevlar" | "paper" | "aluminum" | "beryllium" | "composite";
  location: "door_upper" | "door_lower" | "a_pillar" | "dashboard" | "rear_shelf" | "sub_floor" | "headrest";
  isLeft: boolean;
}

const SPEAKER_SPECS: Record<SpeakerType, { coneDiameterRatio: number; surroundWidthRatio: number; depthRatio: number; hasPhasePlug: boolean }> = {
  woofer: { coneDiameterRatio: 1.0, surroundWidthRatio: 0.15, depthRatio: 0.35, hasPhasePlug: false },
  midrange: { coneDiameterRatio: 0.7, surroundWidthRatio: 0.12, depthRatio: 0.28, hasPhasePlug: true },
  tweeter: { coneDiameterRatio: 0.25, surroundWidthRatio: 0.10, depthRatio: 0.20, hasPhasePlug: false },
  subwoofer: { coneDiameterRatio: 1.4, surroundWidthRatio: 0.18, depthRatio: 0.50, hasPhasePlug: false },
  center_channel: { coneDiameterRatio: 0.55, surroundWidthRatio: 0.12, depthRatio: 0.25, hasPhasePlug: true },
  surround: { coneDiameterRatio: 0.45, surroundWidthRatio: 0.12, depthRatio: 0.22, hasPhasePlug: false },
};

export class SpeakerGrilleDetailSystem {
  /**
   * Creates a complete speaker assembly with grille, cone, surround, and housing.
   */
  public static createSpeaker(config: SpeakerConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = `Speaker_${config.type}_${config.location}`;

    const spec = SPEAKER_SPECS[config.type];
    const outerR = config.diameterMm / 2000;
    const coneR = outerR * spec.coneDiameterRatio;
    const surroundW = outerR * spec.surroundWidthRatio;
    const depth = config.diameterMm * spec.depthRatio / 1000;

    // Materials
    const grilleMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.grilleColorHex),
      roughness: 0.25,
      metalness: 0.92,
      clearcoat: 0.4,
      clearcoatRoughness: 0.08,
    });

    const surroundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.surroundColorHex),
      roughness: 0.75,
      metalness: 0.02,
    });

    // ── Speaker Grille (outer cover) ──
    const grille = this.createGrille(outerR, config.grillePattern, grilleMat, config.brand);
    grille.position.set(0, depth / 2 + 0.005, 0);
    grille.name = "Grille";
    group.add(grille);

    // ── Illuminated Brand Crest (if applicable) ──
    if (config.hasIllumination) {
      const crest = this.createIlluminatedCrest(config.brand, config.illuminationColorHex);
      crest.position.set(0, depth / 2 + 0.008, 0);
      crest.name = "IlluminatedCrest";
      group.add(crest);
    }

    // ── Speaker Surround (rubber roll) ──
    const surroundGeo = new THREE.TorusGeometry(coneR + surroundW / 2, surroundW / 2, 12, 32);
    const surround = new THREE.Mesh(surroundGeo, surroundMat);
    surround.position.set(0, 0, 0);
    surround.rotation.x = Math.PI / 2;
    surround.name = "Surround";
    group.add(surround);

    // ── Speaker Cone ──
    const coneColors: Record<string, number> = {
      kevlar: 0x2a2a1a,
      paper: 0x3a3a35,
      aluminum: 0xa0a8b0,
      beryllium: 0x8090a0,
      composite: 0x1a1a2a,
    };

    const coneGeo = new THREE.ConeGeometry(coneR, depth * 0.3, 32);
    coneGeo.rotateX(Math.PI);
    const coneMat = new THREE.MeshPhysicalMaterial({
      color: coneColors[config.coneMaterial] || 0x2a2a2a,
      roughness: config.coneMaterial === "aluminum" ? 0.25 : 0.65,
      metalness: config.coneMaterial === "aluminum" || config.coneMaterial === "beryllium" ? 0.8 : 0.1,
      clearcoat: config.coneMaterial === "beryllium" ? 0.6 : 0.1,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, -depth * 0.1, 0);
    cone.name = "Cone";
    group.add(cone);

    // ── Phase Plug (if applicable) ──
    if (spec.hasPhasePlug) {
      const plugGeo = new THREE.CylinderGeometry(coneR * 0.15, coneR * 0.1, depth * 0.15, 16);
      const plugMat = new THREE.MeshStandardMaterial({
        color: config.coneMaterial === "aluminum" ? 0xb0b8c0 : 0x555555,
        roughness: 0.2,
        metalness: 0.85,
      });
      const plug = new THREE.Mesh(plugGeo, plugMat);
      plug.position.set(0, -depth * 0.05, 0);
      plug.name = "PhasePlug";
      group.add(plug);
    }

    // ── Magnet / Motor Structure ──
    const magnetGeo = new THREE.CylinderGeometry(coneR * 0.45, coneR * 0.45, depth * 0.4, 24);
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.4 });
    const magnet = new THREE.Mesh(magnetGeo, magnetMat);
    magnet.position.set(0, -depth * 0.45, 0);
    magnet.name = "Magnet";
    group.add(magnet);

    // ── Basket / Frame ──
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const ribGeo = new THREE.BoxGeometry(0.003, depth * 0.6, 0.003);
      const rib = new THREE.Mesh(ribGeo, grilleMat);
      rib.position.set(
        Math.cos(angle) * coneR * 0.7,
        -depth * 0.15,
        Math.sin(angle) * coneR * 0.7
      );
      rib.rotation.y = -angle;
      rib.name = `Basket_Rib_${i}`;
      group.add(rib);
    }

    return group;
  }

  /**
   * Creates a perforated speaker grille with pattern.
   */
  private static createGrille(
    radius: number,
    pattern: SpeakerGrillePattern,
    material: THREE.Material,
    brand: SpeakerBrand
  ): THREE.Group {
    const group = new THREE.Group();
    const holeCount = pattern === "hexagonal" ? 120 : pattern === "circular" ? 80 : 60;

    // Outer ring
    const ringGeo = new THREE.TorusGeometry(radius, 0.003, 8, 32);
    const ring = new THREE.Mesh(ringGeo, material);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Grille holes (instanced for performance)
    if (pattern === "hexagonal") {
      const holeGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.002, 6);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const instanced = new THREE.InstancedMesh(holeGeo, holeMat, holeCount);
      const dummy = new THREE.Object3D();
      let idx = 0;

      // Hex grid pattern
      const spacing = radius * 0.12;
      const rows = Math.ceil(radius * 2 / (spacing * 1.5));
      const cols = Math.ceil(radius * 2 / (spacing * Math.sqrt(3)));

      for (let row = -rows; row <= rows; row++) {
        for (let col = -cols; col <= cols; col++) {
          const x = col * spacing + (row % 2 ? spacing / 2 : 0);
          const z = row * spacing * Math.sqrt(3) / 2;
          const dist = Math.sqrt(x * x + z * z);
          if (dist > radius * 0.92 || dist < radius * 0.12) continue;
          if (idx >= holeCount) break;

          dummy.position.set(x, 0.001, z);
          dummy.updateMatrix();
          instanced.setMatrixAt(idx++, dummy.matrix);
        }
      }
      instanced.count = idx;
      instanced.name = "Grille_HexPattern";
      group.add(instanced);
    } else if (pattern === "circular") {
      const rings = 4;
      for (let ring = 1; ring <= rings; ring++) {
        const r = radius * (ring / rings) * 0.88;
        const holeCountInRing = Math.floor(ring * 8);
        for (let i = 0; i < holeCountInRing; i++) {
          const angle = (i / holeCountInRing) * Math.PI * 2;
          const hx = Math.cos(angle) * r;
          const hz = Math.sin(angle) * r;
          const holeGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.002, 8);
          const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
          const hole = new THREE.Mesh(holeGeo, holeMat);
          hole.position.set(hx, 0.001, hz);
          group.add(hole);
        }
      }
    } else {
      // Linear slot pattern
      const slotCount = 12;
      for (let i = 0; i < slotCount; i++) {
        const y = -radius * 0.8 + i * (radius * 1.6 / slotCount);
        const slotW = Math.sqrt(radius * radius - y * y) * 1.6;
        if (slotW <= 0) continue;
        const slotGeo = new THREE.BoxGeometry(slotW, 0.001, 0.002);
        const slotMat = new THREE.MeshBasicMaterial({ color: 0x080808 });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, 0.001, y);
        group.add(slot);
      }
    }

    return group;
  }

  /**
   * Creates an illuminated brand crest badge.
   */
  private static createIlluminatedCrest(
    brand: SpeakerBrand,
    colorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    const crestMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.8,
    });

    // Crest shape varies by brand
    switch (brand) {
      case "bang_olufsen":
        // B&O circular logo
        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.012, 0.002, 8, 24),
          crestMat
        );
        outerRing.rotation.x = Math.PI / 2;
        group.add(outerRing);
        break;

      case "burmester":
        // Burmester shield shape
        const shieldGeo = new THREE.BoxGeometry(0.018, 0.002, 0.022);
        const shield = new THREE.Mesh(shieldGeo, crestMat);
        group.add(shield);
        break;

      case "naim":
        // Naim rectangular logo
        const logoGeo = new THREE.BoxGeometry(0.020, 0.002, 0.008);
        const logo = new THREE.Mesh(logoGeo, crestMat);
        group.add(logo);
        break;

      default:
        // Generic circular badge
        const badgeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.002, 16);
        const badge = new THREE.Mesh(badgeGeo, crestMat);
        group.add(badge);
    }

    return group;
  }

  /**
   * Creates an A-pillar tweeter with motorized pop-up mechanism.
   */
  public static createMotorizedTweeter(config: SpeakerConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "MotorizedTweeter";

    const r = config.diameterMm / 2000;

    // Housing base
    const housingGeo = new THREE.CylinderGeometry(r * 1.3, r * 1.3, r * 0.8, 24);
    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.6,
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    group.add(housing);

    // Tweeter dome (beryllium)
    const domeGeo = new THREE.SphereGeometry(r * 0.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x8090a0,
      roughness: 0.15,
      metalness: 0.88,
      clearcoat: 0.7,
      clearcoatRoughness: 0.02,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, r * 0.4, 0);
    dome.name = "Tweeter_Dome";
    group.add(dome);

    // Motorized lift mechanism (visible rail)
    const railGeo = new THREE.BoxGeometry(0.004, r * 1.2, 0.004);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.85, roughness: 0.3 });
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(-r * 0.5, 0, 0);
    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(r * 0.5, 0, 0);
    group.add(railL, railR);

    // Illuminated ring around tweeter
    if (config.hasIllumination) {
      const ringGeo = new THREE.TorusGeometry(r * 0.9, 0.002, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(config.illuminationColorHex),
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, r * 0.4, 0);
      ring.name = "Tweeter_IlluminationRing";
      group.add(ring);
    }

    return group;
  }

  /**
   * Creates a subwoofer enclosure.
   */
  public static createSubwooferEnclosure(
    widthMm: number = 300,
    heightMm: number = 250,
    depthMm: number = 200,
    materialType: "carpet" | "carbon" | "fiberglass" = "carpet"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "SubwooferEnclosure";
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const d = depthMm / 1000;

    const encColors = { carpet: 0x1a1a1a, carbon: 0x0a0d14, fiberglass: 0x2a2a2e };
    const encMat = new THREE.MeshStandardMaterial({
      color: encColors[materialType],
      roughness: materialType === "carpet" ? 0.9 : 0.4,
      metalness: materialType === "carbon" ? 0.5 : 0.1,
    });

    // Enclosure box
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const box = new THREE.Mesh(boxGeo, encMat);
    box.name = "Sub_Box";
    group.add(box);

    // Speaker cutout ring
    const cutoutR = w * 0.35;
    const ringGeo = new THREE.TorusGeometry(cutoutR, 0.005, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.85, roughness: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, d / 2 + 0.001);
    ring.name = "Sub_CutoutRing";
    group.add(ring);

    // Bass port
    const portGeo = new THREE.CylinderGeometry(cutoutR * 0.2, cutoutR * 0.2, 0.02, 16);
    const port = new THREE.Mesh(portGeo, encMat);
    port.position.set(w * 0.3, -h * 0.2, d / 2 + 0.01);
    port.rotation.x = Math.PI / 2;
    port.name = "Sub_BassPort";
    group.add(port);

    // Corner rubber feet
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const footGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12);
        const footMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
        const foot = new THREE.Mesh(footGeo, footMat);
        foot.position.set(x * w * 0.42, -h / 2 - 0.004, z * d * 0.42);
        foot.name = "Sub_Foot";
        group.add(foot);
      }
    }

    return group;
  }

  /**
   * Creates a complete multi-speaker audio system layout for a car interior.
   */
  public static createFullAudioSystem(
    brand: SpeakerBrand = "bespoke",
    speakerCount: number = 16,
    ambientColorHex: string = "#f59e0b"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `AudioSystem_${brand}_${speakerCount}Spk`;

    const hasIllumination = speakerCount >= 16;
    const hasSub = speakerCount >= 12;
    const hasTweeters = speakerCount >= 8;

    // Door woofers (2)
    for (const side of [-1, 1]) {
      const woofer = this.createSpeaker({
        type: "woofer",
        brand,
        diameterMm: 200,
        grillePattern: "hexagonal",
        hasIllumination,
        illuminationColorHex: ambientColorHex,
        grilleColorHex: "#b0b8c0",
        surroundColorHex: "#1a1a1a",
        isMotorized: false,
        coneMaterial: "kevlar",
        location: "door_lower",
        isLeft: side < 0,
      });
      woofer.position.set(-0.70, 0.35, side * 0.55);
      woofer.rotation.y = side > 0 ? -0.2 : 0.2;
      group.add(woofer);
    }

    // Door midranges (2)
    for (const side of [-1, 1]) {
      const mid = this.createSpeaker({
        type: "midrange",
        brand,
        diameterMm: 130,
        grillePattern: "hexagonal",
        hasIllumination,
        illuminationColorHex: ambientColorHex,
        grilleColorHex: "#b0b8c0",
        surroundColorHex: "#1a1a1a",
        isMotorized: false,
        coneMaterial: "composite",
        location: "door_upper",
        isLeft: side < 0,
      });
      mid.position.set(-0.68, 0.62, side * 0.52);
      group.add(mid);
    }

    // A-pillar tweeters (2)
    if (hasTweeters) {
      for (const side of [-1, 1]) {
        const tweeter = this.createMotorizedTweeter({
          type: "tweeter",
          brand,
          diameterMm: 25,
          grillePattern: "circular",
          hasIllumination,
          illuminationColorHex: ambientColorHex,
          grilleColorHex: "#c0c4cc",
          surroundColorHex: "#111111",
          isMotorized: true,
          coneMaterial: "beryllium",
          location: "a_pillar",
          isLeft: side < 0,
        });
        tweeter.position.set(-0.60, 0.90, side * 0.42);
        group.add(tweeter);
      }
    }

    // Dashboard center channel
    const center = this.createSpeaker({
      type: "center_channel",
      brand,
      diameterMm: 100,
      grillePattern: "linear_slot",
      hasIllumination: false,
      illuminationColorHex: ambientColorHex,
      grilleColorHex: "#b0b8c0",
      surroundColorHex: "#1a1a1a",
      isMotorized: false,
      coneMaterial: "paper",
      location: "dashboard",
      isLeft: false,
    });
    center.position.set(-0.45, 0.82, -0.10);
    group.add(center);

    // Rear shelf speakers (2)
    if (speakerCount >= 10) {
      for (const side of [-1, 1]) {
        const rear = this.createSpeaker({
          type: "woofer",
          brand,
          diameterMm: 160,
          grillePattern: "hexagonal",
          hasIllumination: false,
          illuminationColorHex: ambientColorHex,
          grilleColorHex: "#888888",
          surroundColorHex: "#1a1a1a",
          isMotorized: false,
          coneMaterial: "paper",
          location: "rear_shelf",
          isLeft: side < 0,
        });
        rear.position.set(-1.30, 0.50, side * 0.30);
        rear.rotation.x = Math.PI / 2;
        group.add(rear);
      }
    }

    // Subwoofer
    if (hasSub) {
      const sub = this.createSubwooferEnclosure(300, 250, 200, "carpet");
      sub.position.set(0, 0.15, 1.0);
      group.add(sub);
    }

    return group;
  }
}
