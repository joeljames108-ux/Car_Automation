// ============================================================================
// F1 AERODYNAMICS SUITE — PROCFD WING ELEMENTS, VORTEX GENERATORS, BRAKE DUCTS
// ============================================================================
// Detailed aerodynamic components for 2026 ground-effect F1 cars:
// - Multi-element front wing with 5 flap elements, outwash endplates, dive planes
// - Rear wing with beam wing, swan-neck pylons, DRS actuator mechanism
// - Venturi floor with 4 longitudinal fences, diffuser with 5 strakes
// - Brake duct assemblies with cooling scoops and internal vanes
// - Vortex generators, turning vanes, bargeboards, cape
// - Engine cover with shark fin, airbox, cooling louvers
// ============================================================================

import * as THREE from "three";

export interface F1WingConfig {
  material: THREE.Material;
  accentMaterial: THREE.Material;
  carbonMaterial: THREE.Material;
  explodedAmount: number;
  frontWingSpanMm: number;
  frontWingElementsCount: number;
  frontWingFlapAngleDeg: number;
  rearWingMainPlaneAngleDeg: number;
  rearWingBeamWingProfile: "SINGLE_FLAT" | "DOUBLE_CASCADE" | "MARRAY结构";
  diffuserExpansionAngleDeg: number;
  floorVenturiThroatHeightMm: number;
}

export class F1AerodynamicsSuite {
  /**
   * Creates a detailed 5-element front wing with outwash endplates and dive planes.
   * Each element has proper chord, camber, and angle-of-attack.
   */
  public static createFrontWing(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_FrontWing_Detailed";

    const span = config.frontWingSpanMm / 1000; // mm to meters
    const mainChord = 0.42;
    const flapChord = 0.10;
    const flapGap = 0.028;
    const endplateHeight = 0.32;

    // ── Mainplane ──
    const mainGeo = new THREE.BoxGeometry(span, 0.025, mainChord);
    const mainMesh = new THREE.Mesh(mainGeo, config.material);
    mainMesh.position.set(0, 0.12, 0);
    mainMesh.name = "FW_Mainplane";
    group.add(mainMesh);

    // ── Flap Elements (up to 5) ──
    const elementCount = Math.min(config.frontWingElementsCount, 5);
    for (let f = 1; f <= elementCount; f++) {
      const flapSpan = span - 0.06 * f; // Taper inboard
      const flapGeo = new THREE.BoxGeometry(flapSpan, 0.015, flapChord);
      const flap = new THREE.Mesh(flapGeo, config.carbonMaterial);
      const y = 0.12 + f * flapGap;
      const z = -f * 0.07;
      flap.position.set(0, y, z);
      flap.rotation.x = THREE.MathUtils.degToRad(config.frontWingFlapAngleDeg * 0.35 * f);
      flap.name = `FW_Flap_${f}`;
      group.add(flap);
    }

    // ── Endplates with vortex-generating slots ──
    const epGeo = new THREE.BoxGeometry(0.018, endplateHeight, 0.58);
    const epL = new THREE.Mesh(epGeo, config.accentMaterial);
    epL.position.set(-span / 2, 0.22, 0);
    epL.name = "FW_Endplate_L";
    const epR = new THREE.Mesh(epGeo.clone(), config.accentMaterial);
    epR.position.set(span / 2, 0.22, 0);
    epR.name = "FW_Endplate_R";

    // Endplate slots (3 horizontal slits for outwash)
    for (let s = 0; s < 3; s++) {
      const slotGeo = new THREE.BoxGeometry(0.022, 0.012, 0.12);
      const slotL = new THREE.Mesh(slotGeo, config.carbonMaterial);
      slotL.position.set(-span / 2, 0.15 + s * 0.07, 0.15);
      const slotR = new THREE.Mesh(slotGeo.clone(), config.carbonMaterial);
      slotR.position.set(span / 2, 0.15 + s * 0.07, 0.15);
      group.add(slotL, slotR);
    }

    group.add(epL, epR);

    // ── Dive Planes / Canards ──
    const diveGeo = new THREE.BoxGeometry(0.35, 0.018, 0.22);
    const diveL = new THREE.Mesh(diveGeo, config.carbonMaterial);
    diveL.position.set(-0.75, 0.28, 0.18);
    diveL.rotation.y = 0.15;
    diveL.rotation.x = THREE.MathUtils.degToRad(-8);
    diveL.name = "FW_DivePlane_L";
    const diveR = new THREE.Mesh(diveGeo.clone(), config.carbonMaterial);
    diveR.position.set(0.75, 0.28, 0.18);
    diveR.rotation.y = -0.15;
    diveR.rotation.x = THREE.MathUtils.degToRad(-8);
    diveR.name = "FW_DivePlane_R";
    group.add(diveL, diveR);

    // ── Nose pillar connecting wing to chassis ──
    const pillarGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.45, 12);
    const pillar = new THREE.Mesh(pillarGeo, config.carbonMaterial);
    pillar.position.set(0, 0.35, -0.15);
    pillar.rotation.x = THREE.MathUtils.degToRad(12);
    pillar.name = "FW_NosePillar";
    group.add(pillar);

    // ── Turning Vanes (behind front wheels) ──
    const vaneGeo = new THREE.BoxGeometry(0.015, 0.18, 0.28);
    const vaneL = new THREE.Mesh(vaneGeo, config.carbonMaterial);
    vaneL.position.set(-0.42, 0.2, 0.6);
    vaneL.rotation.y = 0.3;
    vaneL.name = "FW_TurningVane_L";
    const vaneR = new THREE.Mesh(vaneGeo.clone(), config.carbonMaterial);
    vaneR.position.set(0.42, 0.2, 0.6);
    vaneR.rotation.y = -0.3;
    vaneR.name = "FW_TurningVane_R";
    group.add(vaneL, vaneR);

    return group;
  }

  /**
   * Creates a detailed rear wing with swan-neck pylons, beam wing, DRS flap, endplates.
   */
  public static createRearWing(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_RearWing_Detailed";

    // ── Swan-Neck Pylons ──
    const pylonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 0.55, -0.05),
      new THREE.Vector3(0, 0.75, -0.02),
      new THREE.Vector3(0, 0.90, 0),
    ]);
    const pylonGeo = new THREE.TubeGeometry(pylonCurve, 20, 0.015, 8, false);
    const pylonL = new THREE.Mesh(pylonGeo, config.carbonMaterial);
    pylonL.position.set(-0.18, 0, 0);
    pylonL.name = "RW_Pylon_L";
    const pylonR = new THREE.Mesh(pylonGeo.clone(), config.carbonMaterial);
    pylonR.position.set(0.18, 0, 0);
    pylonR.name = "RW_Pylon_R";
    group.add(pylonL, pylonR);

    // ── Mainplane ──
    const mainGeo = new THREE.BoxGeometry(1.25, 0.032, 0.34);
    const mainMesh = new THREE.Mesh(mainGeo, config.material);
    mainMesh.position.set(0, 0.92, 0);
    mainMesh.rotation.x = THREE.MathUtils.degToRad(config.rearWingMainPlaneAngleDeg);
    mainMesh.name = "RW_Mainplane";
    group.add(mainMesh);

    // ── DRS Flap (upper element) ──
    const drsGeo = new THREE.BoxGeometry(1.22, 0.022, 0.18);
    const drsFlap = new THREE.Mesh(drsGeo, config.accentMaterial);
    drsFlap.position.set(0, 1.03, -0.04);
    drsFlap.rotation.x = THREE.MathUtils.degToRad(config.rearWingMainPlaneAngleDeg + 12);
    drsFlap.name = "RW_DRS_Flap";
    group.add(drsFlap);

    // DRS actuator pods
    const actuatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
    const actL = new THREE.Mesh(actuatorGeo, config.carbonMaterial);
    actL.position.set(-0.35, 0.98, -0.04);
    actL.name = "RW_DRS_Actuator_L";
    const actR = new THREE.Mesh(actuatorGeo.clone(), config.carbonMaterial);
    actR.position.set(0.35, 0.98, -0.04);
    actR.name = "RW_DRS_Actuator_R";
    group.add(actL, actR);

    // ── Rear Endplates with Gurney Flap ──
    const epGeo = new THREE.BoxGeometry(0.018, 0.55, 0.48);
    const epL = new THREE.Mesh(epGeo, config.accentMaterial);
    epL.position.set(-0.63, 0.85, 0);
    epL.name = "RW_Endplate_L";
    const epR = new THREE.Mesh(epGeo.clone(), config.accentMaterial);
    epR.position.set(0.63, 0.85, 0);
    epR.name = "RW_Endplate_R";
    group.add(epL, epR);

    // Gurney flaps on endplates
    const gurneyGeo = new THREE.BoxGeometry(0.008, 0.04, 0.34);
    const gurneyL = new THREE.Mesh(gurneyGeo, config.carbonMaterial);
    gurneyL.position.set(-0.63, 0.85, -0.24);
    gurneyL.name = "RW_GurneyFlap_L";
    const gurneyR = new THREE.Mesh(gurneyGeo.clone(), config.carbonMaterial);
    gurneyR.position.set(0.63, 0.85, -0.24);
    gurneyR.name = "RW_GurneyFlap_R";
    group.add(gurneyL, gurneyR);

    // ── Beam Wing ──
    if (config.rearWingBeamWingProfile === "SINGLE_FLAT") {
      const beamGeo = new THREE.BoxGeometry(0.95, 0.022, 0.16);
      const beam = new THREE.Mesh(beamGeo, config.carbonMaterial);
      beam.position.set(0, 0.42, 0);
      beam.name = "RW_BeamWing";
      group.add(beam);
    } else {
      // Double cascade beam wing
      const beamUpper = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.018, 0.14), config.carbonMaterial);
      beamUpper.position.set(0, 0.46, 0);
      beamUpper.name = "RW_BeamWing_Upper";
      const beamLower = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.018, 0.12), config.carbonMaterial);
      beamLower.position.set(0, 0.42, 0);
      beamLower.name = "RW_BeamWing_Lower";
      group.add(beamUpper, beamLower);
    }

    return group;
  }

  /**
   * Creates a detailed venturi floor with 4 longitudinal fences and rear diffuser with strakes.
   */
  public static createVenturiFloor(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_VenturiFloor_Detailed";

    const floorLength = 3.4;
    const floorWidth = 1.68;
    const throatHeight = config.floorVenturiThroatHeightMm / 1000;

    // ── Main Floor Plank ──
    const plankGeo = new THREE.BoxGeometry(floorWidth, 0.03, floorLength);
    const plank = new THREE.Mesh(plankGeo, config.carbonMaterial);
    plank.position.set(0, 0.06, 0.1);
    plank.name = "Floor_MainPlank";
    group.add(plank);

    // ── Venturi Tunnels (Left & Right) ──
    const tunnelWidth = 0.32;
    const tunnelLength = 2.2;
    for (const side of [-1, 1]) {
      const tunnelGeo = new THREE.BoxGeometry(tunnelWidth, throatHeight, tunnelLength);
      const tunnel = new THREE.Mesh(tunnelGeo, config.carbonMaterial);
      tunnel.position.set(side * 0.48, 0.06 - throatHeight / 2, 0.2);
      tunnel.name = `Floor_VenturiTunnel_${side > 0 ? "R" : "L"}`;
      group.add(tunnel);
    }

    // ── 4 Longitudinal Floor Fences ──
    const fencePositions = [-0.68, -0.36, 0.36, 0.68];
    fencePositions.forEach((x, i) => {
      const fenceGeo = new THREE.BoxGeometry(0.012, 0.08, 2.8);
      const fence = new THREE.Mesh(fenceGeo, config.carbonMaterial);
      fence.position.set(x, 0.04, 0.15);
      fence.name = `Floor_Fence_${i + 1}`;
      group.add(fence);
    });

    // ── Edge Skirts (2026 ground-effect regulation) ──
    for (const side of [-1, 1]) {
      const skirtGeo = new THREE.BoxGeometry(0.025, 0.04, 2.6);
      const skirt = new THREE.Mesh(skirtGeo, config.carbonMaterial);
      skirt.position.set(side * 0.85, 0.04, 0.1);
      skirt.name = `Floor_Skirt_${side > 0 ? "R" : "L"}`;
      group.add(skirt);
    }

    // ── Plank Skid Blocks (FIA Mandated Titanium Wear Blocks) ──
    for (let z = -1.0; z <= 1.2; z += 0.5) {
      for (const x of [-0.3, 0, 0.3]) {
        const blockGeo = new THREE.BoxGeometry(0.08, 0.008, 0.08);
        const blockMat = new THREE.MeshStandardMaterial({
          color: 0x8a8a8a,
          roughness: 0.5,
          metalness: 0.7,
        });
        const block = new THREE.Mesh(blockGeo, blockMat);
        block.position.set(x, 0.044, z);
        block.name = `Floor_SkidBlock_${x}_${z}`;
        group.add(block);
      }
    }

    // ── Rear Diffuser with 5 Strakes ──
    const diffGroup = new THREE.Group();
    diffGroup.name = "Floor_Diffuser";

    const diffGeo = new THREE.BoxGeometry(1.05, 0.28, 0.70);
    const diff = new THREE.Mesh(diffGeo, config.carbonMaterial);
    diff.position.set(0, 0.18, -1.30);
    diff.rotation.x = THREE.MathUtils.degToRad(-config.diffuserExpansionAngleDeg);
    diff.name = "Diffuser_MainBox";
    diffGroup.add(diff);

    // 5 Vertical strakes inside diffuser
    const strakeWidth = 1.0 / 5;
    for (let i = 0; i < 5; i++) {
      const strakeGeo = new THREE.BoxGeometry(0.008, 0.22, 0.60);
      const strake = new THREE.Mesh(strakeGeo, config.carbonMaterial);
      strake.position.set(-0.5 + strakeWidth * (i + 0.5), 0.18, -1.30);
      strake.rotation.x = THREE.MathUtils.degToRad(-config.diffuserExpansionAngleDeg);
      strake.name = `Diffuser_Strake_${i + 1}`;
      diffGroup.add(strake);
    }

    // Gurney tab trailing edge of diffuser
    const gurneyGeo = new THREE.BoxGeometry(1.0, 0.015, 0.008);
    const gurney = new THREE.Mesh(gurneyGeo, config.accentMaterial);
    gurney.position.set(0, 0.32, -1.62);
    gurney.name = "Diffuser_GurneyTab";
    diffGroup.add(gurney);

    group.add(diffGroup);

    return group;
  }

  /**
   * Creates brake duct assemblies with cooling scoops and internal vanes for all 4 corners.
   */
  public static createBrakeDucts(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_BrakeDucts";

    const corners = [
      { name: "FL", x: -0.82, z: 1.50, side: -1 },
      { name: "FR", x: 0.82, z: 1.50, side: 1 },
      { name: "RL", x: -0.78, z: -1.30, side: -1 },
      { name: "RR", x: 0.78, z: -1.30, side: 1 },
    ];

    corners.forEach((corner) => {
      const ductGroup = new THREE.Group();
      ductGroup.name = `BrakeDuct_${corner.name}`;

      // Outer scoop opening
      const scoopGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI * 1.5);
      const scoopMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.6,
      });
      const scoop = new THREE.Mesh(scoopGeo, scoopMat);
      scoop.rotation.y = corner.side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scoop.name = `BrakeDuct_Scoop_${corner.name}`;
      ductGroup.add(scoop);

      // Internal cooling vanes (3 curved vanes)
      for (let v = 0; v < 3; v++) {
        const vaneAngle = (v / 3) * Math.PI;
        const vaneGeo = new THREE.BoxGeometry(0.008, 0.08, 0.06);
        const vane = new THREE.Mesh(vaneGeo, config.carbonMaterial);
        vane.position.set(
          Math.cos(vaneAngle) * 0.08,
          Math.sin(vaneAngle) * 0.08,
          0
        );
        vane.rotation.z = vaneAngle;
        vane.name = `BrakeDuct_Vane_${corner.name}_${v}`;
        ductGroup.add(vane);
      }

      // Brake duct channel (cylinder leading to disc)
      const channelGeo = new THREE.CylinderGeometry(0.06, 0.10, 0.25, 12);
      channelGeo.rotateZ(Math.PI / 2);
      const channel = new THREE.Mesh(channelGeo, config.carbonMaterial);
      channel.position.set(corner.side * 0.05, 0, 0);
      channel.name = `BrakeDuct_Channel_${corner.name}`;
      ductGroup.add(channel);

      ductGroup.position.set(corner.x, 0.32, corner.z);
      group.add(ductGroup);
    });

    return group;
  }

  /**
   * Creates the engine cover with shark fin, airbox intake scoop, and cooling louvers.
   */
  public static createEngineCover(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_EngineCover";

    // ── Engine Cover Skin ──
    const coverGeo = new THREE.BoxGeometry(0.68, 0.42, 1.20);
    const cover = new THREE.Mesh(coverGeo, config.material);
    cover.position.set(0, 0.68, -0.60);
    cover.name = "EngineCover_Skin";
    group.add(cover);

    // ── Airbox Intake Scoop ──
    const airboxOuterGeo = new THREE.BoxGeometry(0.32, 0.40, 0.55);
    const airbox = new THREE.Mesh(airboxOuterGeo, config.material);
    airbox.position.set(0, 0.82, -0.38);
    airbox.name = "EngineCover_Airbox";
    group.add(airbox);

    // Airbox internal ramp
    const rampGeo = new THREE.BoxGeometry(0.28, 0.02, 0.40);
    const ramp = new THREE.Mesh(rampGeo, config.carbonMaterial);
    ramp.position.set(0, 0.78, -0.42);
    ramp.rotation.x = THREE.MathUtils.degToRad(-25);
    ramp.name = "EngineCover_AirboxRamp";
    group.add(ramp);

    // ── Shark Fin ──
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 0.48);
    finShape.lineTo(-1.15, 0.22);
    finShape.lineTo(-1.15, 0);
    finShape.closePath();
    const finExtSettings: THREE.ExtrudeGeometryOptions = { depth: 0.010, bevelEnabled: false };
    const finExtrude = new THREE.ExtrudeGeometry(finShape, finExtSettings);
    const finMesh = new THREE.Mesh(finExtrude, config.accentMaterial);
    finMesh.rotation.y = Math.PI / 2;
    finMesh.position.set(0.005, 0.72, -0.50);
    finMesh.name = "EngineCover_SharkFin";
    group.add(finMesh);

    // ── Cooling Louvers (6 slots per side) ──
    for (const side of [-1, 1]) {
      for (let l = 0; l < 6; l++) {
        const louverGeo = new THREE.BoxGeometry(0.008, 0.04, 0.06);
        const louver = new THREE.Mesh(louverGeo, config.carbonMaterial);
        louver.position.set(
          side * 0.35,
          0.58 + l * 0.035,
          -0.45 - l * 0.15
        );
        louver.rotation.z = side * THREE.MathUtils.degToRad(15);
        louver.name = `EngineCover_Louver_${side > 0 ? "R" : "L"}_${l}`;
        group.add(louver);
      }
    }

    return group;
  }

  /**
   * Creates sidepods with downwash ramps, undercut channels, and radiator inlets.
   */
  public static createSidepods(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_Sidepods";

    for (const side of [-1, 1]) {
      const podGroup = new THREE.Group();
      podGroup.name = `Sidepod_${side > 0 ? "R" : "L"}`;

      // Main sidepod volume
      const podGeo = new THREE.BoxGeometry(0.48, 0.42, 1.45);
      const pod = new THREE.Mesh(podGeo, config.material);
      pod.position.set(0, 0.34, 0);
      pod.name = "Sidepod_MainVolume";
      podGroup.add(pod);

      // Radiator inlet opening
      const inletGeo = new THREE.BoxGeometry(0.04, 0.28, 0.22);
      const inlet = new THREE.Mesh(inletGeo, config.carbonMaterial);
      inlet.position.set(side * 0.22, 0.38, 0.65);
      inlet.name = "Sidepod_Inlet";
      podGroup.add(inlet);

      // Downwash ramp surface
      const rampGeo = new THREE.BoxGeometry(0.42, 0.015, 0.65);
      const ramp = new THREE.Mesh(rampGeo, config.material);
      ramp.position.set(0, 0.22, -0.55);
      ramp.rotation.x = THREE.MathUtils.degToRad(-8);
      ramp.name = "Sidepod_DownwashRamp";
      podGroup.add(ramp);

      // Undercut channel (air channel between monocoque and sidepod lower edge)
      const undercutGeo = new THREE.BoxGeometry(0.12, 0.06, 1.0);
      const undercut = new THREE.Mesh(undercutGeo, config.carbonMaterial);
      undercut.position.set(side * 0.22, 0.15, 0.05);
      undercut.name = "Sidepod_Undercut";
      podGroup.add(undercut);

      // Cooling exit louvers (rear of sidepod)
      for (let c = 0; c < 4; c++) {
        const coolGeo = new THREE.BoxGeometry(0.008, 0.035, 0.05);
        const cool = new THREE.Mesh(coolGeo, config.carbonMaterial);
        cool.position.set(side * 0.20, 0.30 + c * 0.04, -0.68);
        cool.name = `Sidepod_CoolingExit_${c}`;
        podGroup.add(cool);
      }

      podGroup.position.set(side * 0.58, 0, -0.05);
      group.add(podGroup);
    }

    return group;
  }

  /**
   * Creates a full monocoque survival cell with cockpit opening, headrest, and HANS mounts.
   */
  public static createMonocoque(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_Monocoque_Detailed";

    // Main survival cell
    const tubGeo = new THREE.BoxGeometry(0.72, 0.55, 2.40);
    const tub = new THREE.Mesh(tubGeo, config.material);
    tub.position.set(0, 0.35, 0.20);
    tub.name = "Monocoque_SurvivalCell";
    group.add(tub);

    // Nose cone with crash structure
    const noseGeo = new THREE.ConeGeometry(0.35, 1.40, 4);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, config.material);
    nose.position.set(0, 0.32, 2.00);
    nose.scale.set(0.9, 0.5, 1.0);
    nose.name = "Monocoque_NoseCone";
    group.add(nose);

    // Nose crash box (energy absorbing structure)
    const crashBoxGeo = new THREE.BoxGeometry(0.28, 0.22, 0.35);
    const crashBox = new THREE.Mesh(crashBoxGeo, config.carbonMaterial);
    crashBox.position.set(0, 0.32, 1.55);
    crashBox.name = "Monocoque_CrashBox";
    group.add(crashBox);

    // Cockpit opening surround
    const surroundGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 16, Math.PI);
    const surround = new THREE.Mesh(surroundGeo, config.carbonMaterial);
    surround.position.set(0, 0.62, 0.30);
    surround.rotation.x = Math.PI / 2;
    surround.rotation.z = Math.PI;
    surround.name = "Monocoque_CockpitSurround";
    group.add(surround);

    // Headrest
    const headrestGeo = new THREE.BoxGeometry(0.30, 0.22, 0.15);
    const headrest = new THREE.Mesh(headrestGeo, config.accentMaterial);
    headrest.position.set(0, 0.72, -0.25);
    headrest.name = "Monocoque_Headrest";
    group.add(headrest);

    // HANS mounting points
    for (const side of [-1, 1]) {
      const hansGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8);
      const hans = new THREE.Mesh(hansGeo, config.accentMaterial);
      hans.position.set(side * 0.18, 0.72, -0.30);
      hans.name = `Monocoque_HANS_${side > 0 ? "R" : "L"}`;
      group.add(hans);
    }

    // Titanium Halo
    const haloCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, 0.55),
      new THREE.Vector3(-0.25, 0.74, 0.10),
      new THREE.Vector3(0, 0.78, -0.45),
      new THREE.Vector3(0.25, 0.74, 0.10),
      new THREE.Vector3(0, 0.72, 0.55),
    ]);
    const haloGeo = new THREE.TubeGeometry(haloCurve, 32, 0.024, 8, false);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x8a929a,
      roughness: 0.25,
      metalness: 0.9,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.name = "Monocoque_Halo";
    group.add(halo);

    // Central Halo Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.35, 8);
    const pillar = new THREE.Mesh(pillarGeo, haloMat);
    pillar.position.set(0, 0.55, 0.55);
    pillar.name = "Monocoque_HaloPillar";
    group.add(pillar);

    return group;
  }

  /**
   * Creates a full suspension system with pushrod/pullrod, wishbones, uprights, and heave springs.
   */
  public static createSuspension(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_Suspension_Detailed";

    const corners = [
      { name: "FL", x: -0.88, z: 1.52, isFront: true, isRight: false },
      { name: "FR", x: 0.88, z: 1.52, isFront: true, isRight: true },
      { name: "RL", x: -0.84, z: -1.32, isFront: false, isRight: false },
      { name: "RR", x: 0.84, z: -1.32, isFront: false, isRight: true },
    ];

    corners.forEach((corner) => {
      const suspGroup = new THREE.Group();
      suspGroup.name = `Suspension_${corner.name}`;

      // Upper wishbone (two arms)
      const wishLen = Math.abs(corner.x) - 0.32;
      for (let arm = 0; arm < 2; arm++) {
        const armGeo = new THREE.CylinderGeometry(0.010, 0.010, wishLen, 6);
        armGeo.rotateZ(Math.PI / 2);
        const armMesh = new THREE.Mesh(armGeo, config.carbonMaterial);
        armMesh.position.set(
          corner.x * 0.52,
          0.52 + arm * 0.04,
          corner.z
        );
        armMesh.name = `Susp_UpperWishbone_${corner.name}_${arm}`;
        suspGroup.add(armMesh);
      }

      // Lower wishbone (two arms, wider)
      for (let arm = 0; arm < 2; arm++) {
        const armGeo = new THREE.CylinderGeometry(0.012, 0.012, wishLen + 0.05, 6);
        armGeo.rotateZ(Math.PI / 2);
        const armMesh = new THREE.Mesh(armGeo, config.carbonMaterial);
        armMesh.position.set(
          corner.x * 0.52,
          0.18 - arm * 0.03,
          corner.z
        );
        armMesh.name = `Susp_LowerWishbone_${corner.name}_${arm}`;
        suspGroup.add(armMesh);
      }

      // Pushrod / Pullrod
      const prCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(corner.x * 0.85, 0.18, corner.z),
        new THREE.Vector3(corner.x * 0.55, 0.42, corner.z * 0.6),
        new THREE.Vector3(corner.x * 0.35, 0.52, corner.z * 0.3),
      ]);
      const prGeo = new THREE.TubeGeometry(prCurve, 12, 0.008, 6, false);
      const prMesh = new THREE.Mesh(prGeo, config.carbonMaterial);
      prMesh.name = `Susp_Pushrod_${corner.name}`;
      suspGroup.add(prMesh);

      // Upright / Knuckle
      const uprightGeo = new THREE.BoxGeometry(0.04, 0.18, 0.06);
      const upright = new THREE.Mesh(uprightGeo, config.carbonMaterial);
      upright.position.set(corner.x, 0.35, corner.z);
      upright.name = `Susp_Upright_${corner.name}`;
      suspGroup.add(upright);

      // Rocker / Bellcrank (at inboard end of pushrod)
      const rockerGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8);
      const rocker = new THREE.Mesh(rockerGeo, config.accentMaterial);
      rocker.position.set(corner.x * 0.35, 0.52, corner.z * 0.3);
      rocker.rotation.x = Math.PI / 2;
      rocker.name = `Susp_Rocker_${corner.name}`;
      suspGroup.add(rocker);

      group.add(suspGroup);
    });

    // ── Heave Springs (central, connecting front and rear rockers via torsion bar) ──
    const torsionBarGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.8, 6);
    torsionBarGeo.rotateZ(Math.PI / 2);
    const torsionBar = new THREE.Mesh(torsionBarGeo, config.accentMaterial);
    torsionBar.position.set(0, 0.50, 0.10);
    torsionBar.name = "Susp_TorsionBar";
    group.add(torsionBar);

    return group;
  }

  /**
   * Creates detailed 18-inch wheels with Pirelli slicks, aero covers, and tire markings.
   */
  public static createWheels(config: F1WingConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "F1_Wheels_Detailed";

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.88,
      metalness: 0.02,
    });

    const rimCoverMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.25,
      metalness: 0.85,
    });

    const brakeGlowFactor = 0.4;
    const brakeMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: brakeGlowFactor * 2.5,
      roughness: 0.6,
    });

    const corners = [
      { name: "FL", x: -0.92, z: 1.55, width: 0.305, isFront: true },
      { name: "FR", x: 0.92, z: 1.55, width: 0.305, isFront: true },
      { name: "RL", x: -0.88, z: -1.35, width: 0.405, isFront: false },
      { name: "RR", x: 0.88, z: -1.35, width: 0.405, isFront: false },
    ];

    corners.forEach((corner) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.name = `Wheel_${corner.name}`;

      // Tire (Pirelli slick 18-inch)
      const tireRadius = 0.36;
      const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, corner.width, 32);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.name = "Tire_Slick";
      wheelGroup.add(tire);

      // Tire sidewall bulge (subtle ellipsoid at edges)
      for (const sign of [-1, 1]) {
        const bulgeGeo = new THREE.TorusGeometry(tireRadius, 0.012, 8, 24);
        bulgeGeo.rotateY(Math.PI / 2);
        const bulge = new THREE.Mesh(bulgeGeo, tireMat);
        bulge.position.set(sign * corner.width * 0.48, 0, 0);
        bulge.name = `Tire_Sidewall_${sign > 0 ? "R" : "L"}`;
        wheelGroup.add(bulge);
      }

      // Aero wheel cover (carbon disc with slots)
      const coverGeo = new THREE.CylinderGeometry(0.30, 0.30, corner.width + 0.005, 24);
      coverGeo.rotateZ(Math.PI / 2);
      const cover = new THREE.Mesh(coverGeo, rimCoverMat);
      cover.name = "Wheel_AeroCover";
      wheelGroup.add(cover);

      // Center lock nut
      const nutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6);
      nutGeo.rotateZ(Math.PI / 2);
      const nutMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
        metalness: 0.8,
      });
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(corner.x > 0 ? 0.025 : -0.025, 0, 0);
      nut.name = "Wheel_CenterLockNut";
      wheelGroup.add(nut);

      // Brake disc (carbon-carbon, glowing)
      const discGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 24);
      discGeo.rotateZ(Math.PI / 2);
      const disc = new THREE.Mesh(discGeo, brakeMat);
      disc.name = "Brake_Disc";
      wheelGroup.add(disc);

      // Brake caliper (6-piston)
      const caliperGeo = new THREE.BoxGeometry(0.10, 0.08, 0.06);
      const caliperMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.25,
        metalness: 0.8,
      });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(0, 0.10, 0);
      caliper.name = "Brake_Caliper";
      wheelGroup.add(caliper);

      // Ventilation holes in brake disc
      for (let h = 0; h < 8; h++) {
        const angle = (h / 8) * Math.PI * 2;
        const holeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.045, 6);
        holeGeo.rotateZ(Math.PI / 2);
        const hole = new THREE.Mesh(holeGeo, brakeMat);
        hole.position.set(0, Math.sin(angle) * 0.09, Math.cos(angle) * 0.09);
        hole.name = `Brake_VentHole_${h}`;
        wheelGroup.add(hole);
      }

      wheelGroup.position.set(corner.x, 0.36, corner.z);
      group.add(wheelGroup);
    });

    return group;
  }

  /**
   * Creates the complete F1 car by assembling all sub-systems.
   */
  public static createFullCar(design: {
    livery: {
      primaryColorHex: string;
      secondaryColorHex: string;
      tertiaryColorHex: string;
      finishType: string;
    };
    aero: {
      frontWingElementsCount: number;
      frontWingFlapAngleDeg: number;
      rearWingMainPlaneAngleDeg: number;
      rearWingBeamWingProfile: "SINGLE_FLAT" | "DOUBLE_CASCADE" | "MARRAY结构";
      diffuserExpansionAngleDeg: number;
      floorVenturiThroatHeightMm: number;
      frontWingSpanMm: number;
      rearWingDrsFlapGapOpenMm: number;
    };
  }, options: {
    explodedAmount: number;
    wireframe: boolean;
    drsOpen?: boolean;
  }): THREE.Group {
    const root = new THREE.Group();
    root.name = "F1_FULL_CAR_DETAILED";

    const primaryColor = new THREE.Color(design.livery.primaryColorHex);
    const secondaryColor = new THREE.Color(design.livery.secondaryColorHex);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: design.livery.finishType === "MATTE_LIGHTWEIGHT" ? 0.65 : 0.15,
      metalness: design.livery.finishType === "SATIN_PEARLESCENT" ? 0.8 : 0.4,
      wireframe: options.wireframe,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      roughness: 0.2,
      metalness: 0.6,
      wireframe: options.wireframe,
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a),
      roughness: 0.45,
      metalness: 0.3,
      wireframe: options.wireframe,
    });

    const wingConfig: F1WingConfig = {
      material: bodyMaterial,
      accentMaterial,
      carbonMaterial,
      explodedAmount: options.explodedAmount,
      ...design.aero,
    };

    // Assemble all sub-systems
    const monoGroup = this.createMonocoque(wingConfig);
    monoGroup.position.set(0, options.explodedAmount * 0.3, options.explodedAmount * 0.2);
    root.add(monoGroup);

    const fwGroup = this.createFrontWing(wingConfig);
    fwGroup.position.set(0, options.explodedAmount * 0.15, options.explodedAmount * 1.2);
    root.add(fwGroup);

    const rwGroup = this.createRearWing(wingConfig);
    rwGroup.position.set(0, options.explodedAmount * 0.25, -options.explodedAmount * 1.1);
    root.add(rwGroup);

    const floorGroup = this.createVenturiFloor(wingConfig);
    floorGroup.position.set(0, -options.explodedAmount * 0.3, 0);
    root.add(floorGroup);

    const sidepodGroup = this.createSidepods(wingConfig);
    sidepodGroup.position.set(0, 0, 0);
    root.add(sidepodGroup);

    const engineCover = this.createEngineCover(wingConfig);
    root.add(engineCover);

    const suspGroup = this.createSuspension(wingConfig);
    suspGroup.position.set(0, 0, 0);
    root.add(suspGroup);

    const brakeDucts = this.createBrakeDucts(wingConfig);
    root.add(brakeDucts);

    const wheelGroup = this.createWheels(wingConfig);
    wheelGroup.position.set(options.explodedAmount * 0.5, 0, 0);
    root.add(wheelGroup);

    return root;
  }
}
