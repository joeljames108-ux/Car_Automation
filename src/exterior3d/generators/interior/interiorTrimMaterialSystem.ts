// ============================================================================
// INTERIOR TRIM MATERIAL SYSTEM — WOOD, CARBON, ALUMINUM, CHROME, KNURLING
// ============================================================================
// Detailed interior trim and accent material geometries:
// - Open-pore wood veneer panels (walnut, oak, bamboo, eucalyptus)
// - Carbon fiber inlay strips and decorative panels
// - Brushed / polished aluminum accent bars and bezels
// - Chrome trim surrounds and bezels
// - Knurled rotary knobs and dials
// - Piano black lacquer trim panels
// - Brushed bronze / rose gold accents
// - Open-pore ash wood grain pattern
// - Diamond-knurled volume knob
// - Suede / Alcantara insert panels
// - Rosewood / bamboo cross-band inlays
// - Ceramic white porcelain accents
// - Backlit laser-etched pattern panels
// - Illuminated aluminum door sill plates
// - Dashboard decorative inlay border
// - Center console trim surround
// - Gear selector trim ring
// - Steering wheel center badge
// - Air vent bezel rings
// - Seat adjustment knob details
// - Sun visor vanity mirror surround
// - Glove box trim panel
// - Seat memory button surround
// - Window switch surround
// ============================================================================

import * as THREE from "three";

export type TrimMaterialType =
  | "open_pore_walnut"
  | "open_pore_oak"
  | "open_pore_bamboo"
  | "carbon_fiber_gloss"
  | "carbon_fiber_matte"
  | "brushed_aluminum"
  | "polished_aluminum"
  | "piano_black"
  | "brushed_bronze"
  | "rose_gold"
  | "suede_insert"
  | "ceramic_white"
  | "laser_etched_backlit"
  | "chrome_polished"
  | "titanium_natural"
  | "open_pore_eucalyptus";

export interface TrimPanelConfig {
  material: TrimMaterialType;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  colorHex: string;
  hasEdgeHighlight: boolean;
  edgeColorHex: string;
}

export class InteriorTrimMaterialSystem {
  /**
   * Creates PBR material for the specified trim type.
   */
  public static getTrimMaterial(type: TrimMaterialType, colorHex?: string): THREE.MeshPhysicalMaterial {
    switch (type) {
      case "open_pore_walnut":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#5c3a21"),
          roughness: 0.42,
          metalness: 0.05,
          clearcoat: 0.3,
          clearcoatRoughness: 0.12,
          envMapIntensity: 0.7,
        });
      case "open_pore_oak":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#a0845c"),
          roughness: 0.48,
          metalness: 0.03,
          clearcoat: 0.25,
          clearcoatRoughness: 0.15,
          envMapIntensity: 0.65,
        });
      case "open_pore_bamboo":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#c8b87a"),
          roughness: 0.38,
          metalness: 0.02,
          clearcoat: 0.35,
          clearcoatRoughness: 0.10,
          envMapIntensity: 0.7,
        });
      case "carbon_fiber_gloss":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#1a1008"),
          roughness: 0.15,
          metalness: 0.4,
          clearcoat: 0.95,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.5,
        });
      case "carbon_fiber_matte":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#111418"),
          roughness: 0.55,
          metalness: 0.3,
          clearcoat: 0.1,
          envMapIntensity: 0.8,
        });
      case "brushed_aluminum":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#c0c4cc"),
          roughness: 0.22,
          metalness: 0.92,
          clearcoat: 0.5,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.4,
        });
      case "polished_aluminum":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#e0e4ec"),
          roughness: 0.08,
          metalness: 0.96,
          clearcoat: 0.8,
          clearcoatRoughness: 0.01,
          envMapIntensity: 2.0,
        });
      case "piano_black":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#050508"),
          roughness: 0.05,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          envMapIntensity: 2.5,
        });
      case "brushed_bronze":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#b08d57"),
          roughness: 0.25,
          metalness: 0.88,
          clearcoat: 0.4,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.3,
        });
      case "rose_gold":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#d4a088"),
          roughness: 0.18,
          metalness: 0.92,
          clearcoat: 0.6,
          clearcoatRoughness: 0.03,
          envMapIntensity: 1.6,
        });
      case "suede_insert":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#1e222d"),
          roughness: 0.92,
          metalness: 0.02,
          sheen: 0.5,
          sheenColor: new THREE.Color(colorHex || "#1e222d").multiplyScalar(1.2),
          envMapIntensity: 0.3,
        });
      case "ceramic_white":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#f0ece4"),
          roughness: 0.15,
          metalness: 0.0,
          clearcoat: 0.9,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.2,
        });
      case "chrome_polished":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#e8e8f0"),
          roughness: 0.02,
          metalness: 0.98,
          clearcoat: 1.0,
          clearcoatRoughness: 0.005,
          envMapIntensity: 3.0,
        });
      case "titanium_natural":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#8a929a"),
          roughness: 0.28,
          metalness: 0.88,
          clearcoat: 0.3,
          envMapIntensity: 1.1,
        });
      case "open_pore_eucalyptus":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#6b4423"),
          roughness: 0.40,
          metalness: 0.04,
          clearcoat: 0.28,
          clearcoatRoughness: 0.14,
          envMapIntensity: 0.65,
        });
      case "laser_etched_backlit":
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex || "#1a1a2e"),
          roughness: 0.35,
          metalness: 0.2,
          emissive: new THREE.Color(colorHex || "#f59e0b"),
          emissiveIntensity: 0.5,
          clearcoat: 0.6,
          clearcoatRoughness: 0.08,
          envMapIntensity: 1.0,
        });
    }
  }

  /**
   * Creates a decorative wood inlay panel with edge banding.
   */
  public static createWoodInlayPanel(config: TrimPanelConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = `WoodInlay_${config.material}`;
    const w = config.widthMm / 1000;
    const h = config.heightMm / 1000;
    const d = config.depthMm / 1000;

    const mat = this.getTrimMaterial(config.material, config.colorHex);
    const panelGeo = new THREE.BoxGeometry(w, d, h);
    const panel = new THREE.Mesh(panelGeo, mat);
    panel.name = "Inlay_Panel";
    group.add(panel);

    // Edge highlight band
    if (config.hasEdgeHighlight) {
      const edgeMat = this.getTrimMaterial("brushed_aluminum", config.edgeColorHex);
      const edgeThickness = 0.003;

      // Top edge
      const topGeo = new THREE.BoxGeometry(w + edgeThickness * 2, edgeThickness, edgeThickness);
      const top = new THREE.Mesh(topGeo, edgeMat);
      top.position.set(0, d / 2 + edgeThickness / 2, -h / 2);
      group.add(top);

      // Bottom edge
      const bot = new THREE.Mesh(topGeo, edgeMat);
      bot.position.set(0, d / 2 + edgeThickness / 2, h / 2);
      group.add(bot);

      // Left edge
      const sideGeo = new THREE.BoxGeometry(edgeThickness, edgeThickness, h + edgeThickness * 2);
      const left = new THREE.Mesh(sideGeo, edgeMat);
      left.position.set(-w / 2, d / 2 + edgeThickness / 2, 0);
      group.add(left);

      // Right edge
      const right = new THREE.Mesh(sideGeo, edgeMat);
      right.position.set(w / 2, d / 2 + edgeThickness / 2, 0);
      group.add(right);
    }

    return group;
  }

  /**
   * Creates a knurled rotary knob (diamond knurling pattern).
   */
  public static createKnurledKnob(
    diameterMm: number,
    heightMm: number,
    materialType: TrimMaterialType = "brushed_aluminum",
    colorHex?: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "KnurledKnob";
    const r = diameterMm / 2000;
    const h = heightMm / 1000;

    const mat = this.getTrimMaterial(materialType, colorHex);

    // Main knob body
    const bodyGeo = new THREE.CylinderGeometry(r, r, h, 32);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.name = "Knob_Body";
    group.add(body);

    // Knurling ring (diamond texture approximation)
    const knurlCount = Math.floor(Math.PI * 2 * r / 0.003);
    const knurlGeo = new THREE.TorusGeometry(r + 0.001, 0.001, 4, knurlCount);
    const knurl = new THREE.Mesh(knurlGeo, mat);
    knurl.position.y = h * 0.3;
    knurl.rotation.x = Math.PI / 2;
    knurl.name = "Knurl_Ring";
    group.add(knurl);

    // Second knurl ring
    const knurl2 = new THREE.Mesh(knurlGeo, mat);
    knurl2.position.y = -h * 0.3;
    knurl2.rotation.x = Math.PI / 2;
    knurl2.name = "Knurl_Ring_2";
    group.add(knurl2);

    // Top indicator line
    const indGeo = new THREE.BoxGeometry(0.003, 0.001, r * 1.2);
    const indMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ind = new THREE.Mesh(indGeo, indMat);
    ind.position.y = h / 2 + 0.001;
    ind.name = "Indicator_Line";
    group.add(ind);

    return group;
  }

  /**
   * Creates a decorative trim border for the dashboard.
   */
  public static createDashboardTrimBorder(
    widthMm: number,
    materialType: TrimMaterialType = "brushed_aluminum",
    colorHex?: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "DashboardTrimBorder";
    const w = widthMm / 1000;
    const mat = this.getTrimMaterial(materialType, colorHex);

    // Continuous horizontal trim bar
    const barGeo = new THREE.BoxGeometry(w, 0.006, 0.025);
    const bar = new THREE.Mesh(barGeo, mat);
    bar.name = "Trim_Bar";
    group.add(bar);

    // End caps
    for (const side of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12);
      const cap = new THREE.Mesh(capGeo, mat);
      cap.position.set(side * w / 2, 0, 0);
      cap.rotation.x = Math.PI / 2;
      cap.name = `EndCap_${side > 0 ? "R" : "L"}`;
      group.add(cap);
    }

    return group;
  }

  /**
   * Creates an illuminated aluminum door sill plate with logo projection.
   */
  public static createDoorSillPlate(
    widthMm: number = 500,
    materialType: TrimMaterialType = "brushed_aluminum",
    colorHex?: string,
    ambientColorHex: string = "#f59e0b"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "DoorSillPlate";
    const w = widthMm / 1000;
    const mat = this.getTrimMaterial(materialType, colorHex);

    // Base plate
    const plateGeo = new THREE.BoxGeometry(w, 0.006, 0.12);
    const plate = new THREE.Mesh(plateGeo, mat);
    plate.name = "Sill_BasePlate";
    group.add(plate);

    // Raised edge rails
    const railGeo = new THREE.BoxGeometry(w + 0.01, 0.004, 0.008);
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, mat);
      rail.position.set(0, 0.005, side * 0.055);
      rail.name = `Sill_Rail_${side > 0 ? "R" : "L"}`;
      group.add(rail);
    }

    // Illuminated text area
    const textGeo = new THREE.BoxGeometry(w * 0.7, 0.002, 0.04);
    const textMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ambientColorHex),
      transparent: true,
      opacity: 0.6,
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(0, 0.008, 0);
    textMesh.name = "Sill_IlluminatedText";
    group.add(textMesh);

    // Screw details
    for (const x of [-w * 0.42, 0, w * 0.42]) {
      const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8);
      const screwMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(x, 0.005, 0.05);
      screw.name = "Sill_Screw";
      group.add(screw);
    }

    return group;
  }

  /**
   * Creates air vent bezel ring.
   */
  public static createAirVentBezel(
    diameterMm: number = 40,
    materialType: TrimMaterialType = "chrome_polished",
    colorHex?: string,
    hasAmbientLight: boolean = true,
    ambientColorHex: string = "#f59e0b"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "AirVentBezel";
    const r = diameterMm / 2000;
    const mat = this.getTrimMaterial(materialType, colorHex);

    // Outer bezel ring
    const bezelGeo = new THREE.TorusGeometry(r, 0.004, 12, 32);
    const bezel = new THREE.Mesh(bezelGeo, mat);
    bezel.rotation.y = Math.PI / 2;
    bezel.name = "Vent_Bezel";
    group.add(bezel);

    // Inner ring
    const innerGeo = new THREE.TorusGeometry(r * 0.7, 0.003, 8, 24);
    const inner = new THREE.Mesh(innerGeo, mat);
    inner.rotation.y = Math.PI / 2;
    inner.name = "Vent_InnerRing";
    group.add(inner);

    // Ambient light ring (optional)
    if (hasAmbientLight) {
      const ambientGeo = new THREE.TorusGeometry(r + 0.003, 0.002, 8, 32);
      const ambientMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ambientColorHex),
        transparent: true,
        opacity: 0.6,
      });
      const ambient = new THREE.Mesh(ambientGeo, ambientMat);
      ambient.rotation.y = Math.PI / 2;
      ambient.position.x = 0.002;
      ambient.name = "Vent_AmbientRing";
      group.add(ambient);
    }

    // Turbine blade spokes (5)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.002, 0.001, r * 0.55);
      const blade = new THREE.Mesh(bladeGeo, mat);
      blade.position.set(0, Math.sin(angle) * r * 0.35, Math.cos(angle) * r * 0.35);
      blade.rotation.x = angle;
      blade.name = `Vent_Blade_${i}`;
      group.add(blade);
    }

    return group;
  }

  /**
   * Creates a seat adjustment knob.
   */
  public static createSeatAdjustmentKnob(
    materialType: TrimMaterialType = "brushed_aluminum"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "SeatAdjustmentKnob";
    const mat = this.getTrimMaterial(materialType);

    // Main rotary knob
    const knobGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.018, 20);
    const knob = new THREE.Mesh(knobGeo, mat);
    knob.rotation.z = Math.PI / 2;
    knob.name = "AdjKnob_Body";
    group.add(knob);

    // Knurling ridges
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const ridgeGeo = new THREE.BoxGeometry(0.020, 0.001, 0.001);
      const ridge = new THREE.Mesh(ridgeGeo, mat);
      ridge.position.set(0, Math.sin(angle) * 0.016, Math.cos(angle) * 0.016);
      ridge.rotation.x = angle;
      group.add(ridge);
    }

    // Direction arrow indicator
    const arrowGeo = new THREE.BoxGeometry(0.001, 0.008, 0.003);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0.011, 0, 0);
    group.add(arrow);

    return group;
  }

  /**
   * Creates a glove box trim panel with push-button latch.
   */
  public static createGloveBoxTrim(
    widthMm: number = 400,
    heightMm: number = 180,
    materialType: TrimMaterialType = "open_pore_walnut",
    colorHex?: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "GloveBoxTrim";
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const mat = this.getTrimMaterial(materialType, colorHex);

    // Main panel
    const panelGeo = new THREE.BoxGeometry(w, 0.012, h);
    const panel = new THREE.Mesh(panelGeo, mat);
    panel.name = "GloveBox_Panel";
    group.add(panel);

    // Chrome trim strip along bottom
    const stripMat = this.getTrimMaterial("chrome_polished");
    const stripGeo = new THREE.BoxGeometry(w * 0.9, 0.003, 0.008);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(0, -0.008, h / 2 - 0.02);
    strip.name = "GloveBox_ChromeStrip";
    group.add(strip);

    // Push-button latch
    const latchGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.008, 12);
    const latch = new THREE.Mesh(latchGeo, stripMat);
    latch.position.set(w * 0.38, -0.010, 0);
    latch.rotation.x = Math.PI / 2;
    latch.name = "GloveBox_Latch";
    group.add(latch);

    return group;
  }

  /**
   * Creates a window switch surround panel.
   */
  public static createWindowSwitchSurround(
    materialType: TrimMaterialType = "brushed_aluminum"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "WindowSwitchSurround";
    const mat = this.getTrimMaterial(materialType);

    // Surround frame
    const frameGeo = new THREE.BoxGeometry(0.14, 0.008, 0.08);
    const frame = new THREE.Mesh(frameGeo, mat);
    frame.name = "Switch_Frame";
    group.add(frame);

    // Switch cutouts (2 windows)
    for (let i = 0; i < 2; i++) {
      const cutoutGeo = new THREE.BoxGeometry(0.04, 0.012, 0.025);
      const cutoutMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
      const cutout = new THREE.Mesh(cutoutGeo, cutoutMat);
      cutout.position.set(-0.025 + i * 0.05, -0.004, 0);
      cutout.name = `Window_Switch_${i}`;
      group.add(cutout);
    }

    return group;
  }
}
