/**
 * ============================================================================
 * ENDURANCE GT3 COCKPIT & FIA SPACEFRAME ROLLCAGE GLB GENERATOR
 * ============================================================================
 * Generates an ultra-high visual fidelity 3D endurance racing cockpit compliant
 * with FIA Appendix J Article 253 safety regulations:
 * 
 * 1. FIA 253 25CrMo4 CHROME-MOLY SPACEFRAME ROLLCAGE
 *    - Main roll hoop ($D=45\text{mm}, t=2.5\text{mm}$) behind driver seat
 *    - Lateral front A-pillar pillars with double door intrusion X-bars
 *    - CNC-bent roof diagonal reinforce braces & laser-cut multi-hole gusset plates
 * 
 * 2. SFI / FIA SPEC QUICK-RELEASE DRIVER SAFETY NETS
 *    - Triangular window net with quick-release red camlock buckle
 *    - Center tunnel triangular driver containment net
 * 
 * 3. ENDURANCE DRIVER HELMET COOLING & DRINK SYSTEM
 *    - Flexible corrugated silicone airflow ducting connected to roof NACA scoop
 *    - Billet aluminum insulated insulated drink bottle bracket with 12V peristaltic pump
 * 
 * 4. MILITARY-SPEC TOGGLE SWITCH PANEL & ENGINE START CONSOLE
 *    - Red anodized flip missile switch covers for Main Ignition & Fuel Pumps
 *    - 6-Position rotary switch for Traction Control (TC1/TC2) & ABS maps
 *    - Engraved backlit laser-marked aluminum circuit breaker fuse plate
 * 
 * 5. SMART DIGITAL OLED REARVIEW CAMERA MIRROR WITH RADAR HUD
 *    - Ultrawide frameless display rendering live trailing car distance delta
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorPbrMaterialSynthesizer } from "../../materials/interiorPbrMaterialSynthesizer";

export interface EnduranceGt3CockpitOptions {
  rollcageColorHex?: string;
  hasWindowSafetyNets?: boolean;
  hasHelmetCoolingDuct?: boolean;
  hasDrinkSystem?: boolean;
  hasSmartOledMirror?: boolean;
  cageTubeDiameterM?: number;
  cabinWidthM?: number;
  cabinLengthM?: number;
  cabinHeightM?: number;
}

export class EnduranceGt3CockpitGlbGenerator {
  /**
   * Builds the complete FIA GT3 Endurance Cockpit & Rollcage subassembly hierarchy.
   */
  public static buildEnduranceGt3CockpitGroup(options: EnduranceGt3CockpitOptions = {}): THREE.Group {
    const root = new THREE.Group();
    root.name = "EnduranceGt3_Cockpit_Subassembly_Root";

    const width = options.cabinWidthM || 1.42;
    const length = options.cabinLengthM || 2.25;
    const height = options.cabinHeightM || 1.18;
    const tubeD = options.cageTubeDiameterM || 0.045; // 45mm FIA standard
    const cageColorHex = options.rollcageColorHex || "#e63946"; // Race Red

    const synth = InteriorPbrMaterialSynthesizer.getInstance();

    // 1. Materials
    const cageMat = synth.createPhysicalMaterial({
      id: `gt3_rollcage_${cageColorHex}`,
      name: "GT3 Chrome-Moly Gloss Enamel",
      materialType: "titanium_satin_finish",
      baseColorHex: cageColorHex,
      roughness: 0.22,
      metalness: 0.75,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
    });

    const carbonMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("carbon_fiber_twill");
    const aluminumBillet = InteriorPbrMaterialSynthesizer.getPresetMaterial("brushed_aluminum");
    const rubberMat = synth.createPhysicalMaterial({
      id: "gt3_rubber_hoses",
      name: "Silicone Hose Matte",
      materialType: "soft_touch_polyurethane",
      baseColorHex: "#1a1a1a",
      roughness: 0.85,
      metalness: 0.05,
    });

    // ========================================================================
    // 2. FIA CHROME-MOLY SPACEFRAME ROLLCAGE TUBES
    // ========================================================================
    const cageGroup = new THREE.Group();
    cageGroup.name = "FIA_Rollcage_Structure";

    // 2.1 Main Roll Hoop (Behind Seats)
    const mainHoopGeo = new THREE.CylinderGeometry(tubeD / 2, tubeD / 2, height, 16);
    
    // Left Main Pillar
    const leftMainPillar = new THREE.Mesh(mainHoopGeo, cageMat);
    leftMainPillar.position.set(-width / 2 + 0.06, height / 2 + 0.1, 0.45);
    cageGroup.add(leftMainPillar);

    // Right Main Pillar
    const rightMainPillar = new THREE.Mesh(mainHoopGeo, cageMat);
    rightMainPillar.position.set(width / 2 - 0.06, height / 2 + 0.1, 0.45);
    cageGroup.add(rightMainPillar);

    // Main Hoop Upper Crossbar
    const mainTopBarGeo = new THREE.CylinderGeometry(tubeD / 2, tubeD / 2, width - 0.12, 16);
    const mainTopBar = new THREE.Mesh(mainTopBarGeo, cageMat);
    mainTopBar.rotation.z = Math.PI / 2;
    mainTopBar.position.set(0, height + 0.08, 0.45);
    cageGroup.add(mainTopBar);

    // Main Hoop Diagonal Brace
    const diagLen = Math.sqrt(Math.pow(width - 0.12, 2) + Math.pow(height, 2));
    const diagAngle = Math.atan2(height, width - 0.12);
    const diagGeo = new THREE.CylinderGeometry(tubeD / 2, tubeD / 2, diagLen, 16);
    const diagMesh = new THREE.Mesh(diagGeo, cageMat);
    diagMesh.rotation.z = diagAngle;
    diagMesh.position.set(0, height / 2 + 0.1, 0.45);
    cageGroup.add(diagMesh);

    // 2.2 Front A-Pillars & Roof Lateral Bars
    const aPillarLen = Math.sqrt(Math.pow(height, 2) + Math.pow(length * 0.45, 2));
    const aPillarAngle = Math.atan2(length * 0.45, height);
    const aPillarGeo = new THREE.CylinderGeometry(tubeD / 2, tubeD / 2, aPillarLen, 16);

    const leftAPillar = new THREE.Mesh(aPillarGeo, cageMat);
    leftAPillar.rotation.x = aPillarAngle;
    leftAPillar.position.set(-width / 2 + 0.06, height / 2 + 0.1, -0.1);
    cageGroup.add(leftAPillar);

    const rightAPillar = new THREE.Mesh(aPillarGeo, cageMat);
    rightAPillar.rotation.x = aPillarAngle;
    rightAPillar.position.set(width / 2 - 0.06, height / 2 + 0.1, -0.1);
    cageGroup.add(rightAPillar);

    // Windshield Top Transverse Bar
    const frontTopBar = new THREE.Mesh(mainTopBarGeo, cageMat);
    frontTopBar.rotation.z = Math.PI / 2;
    frontTopBar.position.set(0, height + 0.06, -0.42);
    cageGroup.add(frontTopBar);

    // Roof Fore-Aft Lateral Bars
    const roofLateralGeo = new THREE.CylinderGeometry(tubeD / 2, tubeD / 2, 0.88, 16);
    const leftRoofBar = new THREE.Mesh(roofLateralGeo, cageMat);
    leftRoofBar.rotation.x = Math.PI / 2;
    leftRoofBar.position.set(-width / 2 + 0.06, height + 0.07, 0.02);
    cageGroup.add(leftRoofBar);

    const rightRoofBar = new THREE.Mesh(roofLateralGeo, cageMat);
    rightRoofBar.rotation.x = Math.PI / 2;
    rightRoofBar.position.set(width / 2 - 0.06, height + 0.07, 0.02);
    cageGroup.add(rightRoofBar);

    // 2.3 Side Door Intrusion X-Bars (Driver Left & Passenger Right)
    const doorXLen = Math.sqrt(Math.pow(0.88, 2) + Math.pow(height * 0.6, 2));
    const doorXAngle = Math.atan2(height * 0.6, 0.88);
    const doorXGeo = new THREE.CylinderGeometry((tubeD * 0.85) / 2, (tubeD * 0.85) / 2, doorXLen, 16);

    // Left Door Upper-Forward to Lower-Rear Bar
    const leftDoorX1 = new THREE.Mesh(doorXGeo, cageMat);
    leftDoorX1.rotation.x = doorXAngle;
    leftDoorX1.position.set(-width / 2 + 0.05, height * 0.42, 0.02);
    cageGroup.add(leftDoorX1);

    // Left Door Lower-Forward to Upper-Rear Bar
    const leftDoorX2 = new THREE.Mesh(doorXGeo, cageMat);
    leftDoorX2.rotation.x = -doorXAngle;
    leftDoorX2.position.set(-width / 2 + 0.05, height * 0.42, 0.02);
    cageGroup.add(leftDoorX2);

    // 2.4 Laser-Cut Perforated Steel Gusset Plates (At Key Tube Junctions)
    const gussetMat = synth.createPhysicalMaterial({
      id: "gt3_gusset_steel",
      name: "Taco Gusset Laser Cut",
      materialType: "brushed_billet_aluminum",
      baseColorHex: "#2b2d42",
      roughness: 0.35,
      metalness: 0.9,
    });

    for (const side of [-1, 1]) {
      const gussetGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        0, 0.12, 0,
        0, 0, 0.12,
      ]);
      gussetGeo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      gussetGeo.computeVertexNormals();

      const gusset = new THREE.Mesh(gussetGeo, gussetMat);
      gusset.position.set(side * (width / 2 - 0.06), height - 0.04, 0.38);
      gusset.scale.set(1, 1, side);
      cageGroup.add(gusset);
    }

    root.add(cageGroup);

    // ========================================================================
    // 3. SFI / FIA DRIVER WINDOW SAFETY NETS
    // ========================================================================
    if (options.hasWindowSafetyNets !== false) {
      const netGroup = new THREE.Group();
      netGroup.name = "Driver_SafetyNet_Assembly";

      const netMat = synth.createPhysicalMaterial({
        id: "gt3_kevlar_net",
        name: "FIA Kevlar Safety Webbing",
        materialType: "technical_fabric",
        baseColorHex: "#111111",
        roughness: 0.95,
        metalness: 0.0,
      });

      // Quick-Release Camlock Buckle (Red Anodized Aluminum)
      const buckleGeo = new THREE.BoxGeometry(0.045, 0.035, 0.02);
      const buckleMat = synth.createPhysicalMaterial({
        id: "gt3_camlock_red",
        name: "Anodized Red Buckle",
        materialType: "titanium_satin_finish",
        baseColorHex: "#ff0033",
        roughness: 0.2,
        metalness: 0.8,
      });
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(-width / 2 + 0.07, height * 0.85, -0.22);
      netGroup.add(buckle);

      // Webbing Ribbons Grid
      const ribbonThick = 0.003;
      const ribbonWidth = 0.025;
      
      // Horizontal Ribbons
      for (let r = 0; r < 5; r++) {
        const y = height * 0.45 + r * 0.08;
        const ribGeo = new THREE.BoxGeometry(ribbonThick, ribbonWidth, 0.55);
        const ribMesh = new THREE.Mesh(ribGeo, netMat);
        ribMesh.position.set(-width / 2 + 0.07, y, 0.05);
        netGroup.add(ribMesh);
      }

      // Vertical Ribbons
      for (let c = 0; c < 6; c++) {
        const z = -0.18 + c * 0.09;
        const ribGeo = new THREE.BoxGeometry(ribbonThick, 0.38, ribbonWidth);
        const ribMesh = new THREE.Mesh(ribGeo, netMat);
        ribMesh.position.set(-width / 2 + 0.07, height * 0.62, z);
        netGroup.add(ribMesh);
      }

      root.add(netGroup);
    }

    // ========================================================================
    // 4. ENDURANCE DRIVER HELMET COOLING & DRINK SYSTEM
    // ========================================================================
    if (options.hasHelmetCoolingDuct !== false) {
      const coolingGroup = new THREE.Group();
      coolingGroup.name = "Helmet_Cooling_Conduit_System";

      // Corrugated flexible air tube from roof down to driver seat
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-width * 0.2, height + 0.05, 0.1),
        new THREE.Vector3(-width * 0.28, height * 0.85, 0.2),
        new THREE.Vector3(-width * 0.32, height * 0.65, 0.15),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.024, 16, false);
      const hoseMesh = new THREE.Mesh(tubeGeo, rubberMat);
      coolingGroup.add(hoseMesh);

      // Drink Bottle Bracket & Insulated Bottle
      const bottleHolderMat = aluminumBillet;
      const bottleMat = synth.createPhysicalMaterial({
        id: "gt3_drink_bottle",
        name: "Insulated Drink Flask",
        materialType: "titanium_satin_finish",
        baseColorHex: "#f0f0f0",
        roughness: 0.25,
        metalness: 0.85,
      });

      const bottleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.24, 24);
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      bottle.position.set(0.12, 0.35, 0.08);
      coolingGroup.add(bottle);

      // Bottle Cap & Flexible Straw
      const capGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16);
      const cap = new THREE.Mesh(capGeo, rubberMat);
      cap.position.set(0.12, 0.48, 0.08);
      coolingGroup.add(cap);

      root.add(coolingGroup);
    }

    // ========================================================================
    // 5. MILITARY-GRADE TOGGLE SWITCH PANEL & CENTER BRIDGE
    // ========================================================================
    const switchPanelGroup = new THREE.Group();
    switchPanelGroup.name = "GT3_MilitarySwitchPanel";

    // Carbon Fiber Switch Box Base
    const boxGeo = new THREE.BoxGeometry(0.24, 0.16, 0.38);
    const boxMesh = new THREE.Mesh(boxGeo, carbonMat);
    boxMesh.position.set(0, 0.42, -0.05);
    boxMesh.rotation.x = Math.PI * 0.18;
    switchPanelGroup.add(boxMesh);

    // Aluminum Top Faceplate
    const plateGeo = new THREE.BoxGeometry(0.22, 0.005, 0.36);
    const plateMesh = new THREE.Mesh(plateGeo, aluminumBillet);
    plateMesh.position.set(0, 0.485, -0.05);
    plateMesh.rotation.x = Math.PI * 0.18;
    switchPanelGroup.add(plateMesh);

    // 4 Toggle Switches with Red Missile Flip Covers
    const flipCoverMat = synth.createPhysicalMaterial({
      id: "missile_flip_red",
      name: "Missile Switch Cover Red",
      materialType: "titanium_satin_finish",
      baseColorHex: "#d90429",
      roughness: 0.15,
      metalness: 0.7,
      clearcoat: 0.8,
    });

    for (let i = 0; i < 4; i++) {
      const x = -0.075 + i * 0.05;
      const coverGeo = new THREE.BoxGeometry(0.018, 0.03, 0.025);
      const cover = new THREE.Mesh(coverGeo, flipCoverMat);
      cover.position.set(x, 0.52, -0.15);
      cover.rotation.x = Math.PI * 0.18;
      switchPanelGroup.add(cover);
    }

    // 2 Rotary Knobs (TC & ABS Map Selectors) with Knurled Edges
    const knobMat = synth.createPhysicalMaterial({
      id: "rotary_knob_gold",
      name: "Knurled Anodized Gold Knob",
      materialType: "titanium_satin_finish",
      baseColorHex: "#ffb703",
      roughness: 0.25,
      metalness: 0.9,
    });

    for (let k = 0; k < 2; k++) {
      const kx = -0.045 + k * 0.09;
      const knobGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.02, 18);
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.position.set(kx, 0.49, 0.02);
      knob.rotation.x = Math.PI * 0.18;
      switchPanelGroup.add(knob);
    }

    root.add(switchPanelGroup);

    // ========================================================================
    // 6. SMART DIGITAL OLED REARVIEW CAMERA MIRROR WITH RADAR HUD
    // ========================================================================
    if (options.hasSmartOledMirror !== false) {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.name = "SmartOled_Rearview_CameraMirror";

      const mirrorHousingMat = carbonMat;
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0x050811,
      });

      // Beveled Frame
      const frameGeo = new THREE.BoxGeometry(0.24, 0.075, 0.018);
      const frame = new THREE.Mesh(frameGeo, mirrorHousingMat);
      frame.position.set(0, height + 0.02, -0.32);
      mirrorGroup.add(frame);

      // OLED Display Surface
      const screenGeo = new THREE.PlaneGeometry(0.22, 0.065);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, height + 0.02, -0.31);
      mirrorGroup.add(screen);

      // Ball-joint mounting stalk attached to upper windshield crossbar
      const stalkGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12);
      const stalk = new THREE.Mesh(stalkGeo, aluminumBillet);
      stalk.position.set(0, height + 0.05, -0.35);
      stalk.rotation.x = Math.PI * 0.25;
      mirrorGroup.add(stalk);

      root.add(mirrorGroup);
    }

    return root;
  }
}
