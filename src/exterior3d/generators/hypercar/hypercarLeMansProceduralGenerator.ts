// ============================================================================
// HYPERCAR LE MANS PROTOCOL — DETAILED PROCEDURAL 3D HYPERCAR GENERATOR
// ============================================================================
// Generates accurate, modular Three.js geometry for WEC Le Mans Hypercar:
// - CarboTitanium Monocoque Survival Cell with Cockpit Enclosure
// - Active Aerodynamic Rear Wing with DRS and Airbrake Modes
// - Front Splitter with Active Venturi Channels
// - Tri-Motor Hybrid Powertrain (1 ICE + 2 Front Electric Motors)
// - 900V Solid-State Battery Pack with Active Cooling
// - Active Ground-Effect Venturi Underbody with 6 Floor Fences
// - Carbon-Ceramic Matrix Brakes with 420mm Rotors
// - 18-inch Center-Lock Forged Magnesium Wheels with Michelin Slicks
// - LED Matrix Headlights with Sequential Turn Signals
// - Shark Fin Dorsal Stabilizer and Roof Air Scoop
// - Sidepod Radiator Inlets with Louvered Cooling Exits
// ============================================================================

import * as THREE from "three";

export interface HypercarDesignConfig {
  bodyColorHex: number;
  accentColorHex: number;
  carbonColorHex: number;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  explodedAmount: number;
  ddrsMode: "HIGH_DOWNFORCE" | "LOW_DRAG" | "AIRBRAKE";
  hasActiveAero: boolean;
  hasRoofScoop: boolean;
  powertrainLayout: "TRIMOTOR_HYBRID" | "V8_TWIN_TURBO" | "V12_NA";
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
}

export interface HypercarMaterialSet {
  body: THREE.Material;
  accent: THREE.Material;
  carbon: THREE.Material;
  titanium: THREE.Material;
  gold: THREE.Material;
  glass: THREE.Material;
  rubber: THREE.Material;
  brakeGlow: THREE.Material;
  ledWhite: THREE.Material;
  ledRed: THREE.Material;
  ledAmber: THREE.Material;
}

export class HypercarLeMansProceduralGenerator {
  /**
   * Creates the material palette for the hypercar based on design config.
   */
  private static createMaterialSet(config: HypercarDesignConfig): HypercarMaterialSet {
    const bodyColor = new THREE.Color(config.bodyColorHex);
    const accentColor = new THREE.Color(config.accentColorHex);

    return {
      body: new THREE.MeshPhysicalMaterial({
        color: bodyColor,
        roughness: config.roughness,
        metalness: config.metalness,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        wireframe: config.wireframe,
      }),
      accent: new THREE.MeshPhysicalMaterial({
        color: accentColor,
        roughness: 0.18,
        metalness: 0.75,
        clearcoat: 0.8,
        wireframe: config.wireframe,
      }),
      carbon: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(config.carbonColorHex),
        roughness: 0.32,
        metalness: 0.65,
        clearcoat: 0.6,
        wireframe: config.wireframe,
      }),
      titanium: new THREE.MeshStandardMaterial({
        color: 0x8a929a,
        roughness: 0.22,
        metalness: 0.92,
        wireframe: config.wireframe,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.18,
        metalness: 0.95,
        wireframe: config.wireframe,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xc8ddf0,
        transmission: 0.88,
        transparent: true,
        opacity: 0.42,
        roughness: 0.01,
        ior: 1.52,
        thickness: 0.005,
        wireframe: config.wireframe,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: 0x0a0a0c,
        roughness: 0.92,
        metalness: 0.02,
        wireframe: config.wireframe,
      }),
      brakeGlow: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: new THREE.Color(0xff4500),
        emissiveIntensity: 1.5,
        roughness: 0.5,
        wireframe: config.wireframe,
      }),
      ledWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 3.0,
        roughness: 0.1,
        wireframe: config.wireframe,
      }),
      ledRed: new THREE.MeshStandardMaterial({
        color: 0xff1122,
        emissive: new THREE.Color(0xff0022),
        emissiveIntensity: 3.5,
        roughness: 0.1,
        wireframe: config.wireframe,
      }),
      ledAmber: new THREE.MeshStandardMaterial({
        color: 0xffa500,
        emissive: new THREE.Color(0xff8800),
        emissiveIntensity: 2.5,
        roughness: 0.1,
        wireframe: config.wireframe,
      }),
    };
  }

  /**
   * Creates the CarboTitanium monocoque survival cell.
   */
  private static createMonocoque(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_Monocoque";

    const wb = config.wheelbaseMm / 1000;
    const w = config.overallWidthMm / 1000 * 0.55;
    const l = wb * 0.68;

    // Main tub
    const tubGeo = new THREE.BoxGeometry(w, 0.62, l);
    const tub = new THREE.Mesh(tubGeo, mats.carbon);
    tub.position.set(0, 0.38, 0.15);
    tub.castShadow = true;
    tub.name = "Monocoque_Tub";
    group.add(tub);

    // Nose cone with crash structure
    const noseLen = (config.overallLengthMm / 1000) * 0.18;
    const noseGeo = new THREE.ConeGeometry(0.28, noseLen, 5);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, mats.body);
    nose.position.set(0, 0.36, l / 2 + noseLen * 0.45);
    nose.scale.set(0.85, 0.5, 1.0);
    nose.name = "Monocoque_NoseCone";
    group.add(nose);

    // Titanium Roll Structure
    const rollGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.55, 12);
    const rollL = new THREE.Mesh(rollGeo, mats.titanium);
    rollL.position.set(-0.22, 0.85, -0.15);
    const rollR = new THREE.Mesh(rollGeo.clone(), mats.titanium);
    rollR.position.set(0.22, 0.85, -0.15);
    const rollCrossGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.50, 12);
    rollCrossGeo.rotateX(Math.PI / 2);
    const rollCross = new THREE.Mesh(rollCrossGeo, mats.titanium);
    rollCross.position.set(0, 0.90, -0.15);
    group.add(rollL, rollR, rollCross);

    // Cockpit windscreen bubble
    const windscreenGeo = new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const windscreen = new THREE.Mesh(windscreenGeo, mats.glass);
    windscreen.position.set(0, 0.72, 0.35);
    windscreen.scale.set(0.65, 0.55, 0.9);
    windscreen.name = "Monocoque_Windscreen";
    group.add(windscreen);

    // Cockpit surround (carbon fiber lip)
    const lipGeo = new THREE.TorusGeometry(0.24, 0.022, 8, 24, Math.PI * 1.2);
    const lip = new THREE.Mesh(lipGeo, mats.carbon);
    lip.position.set(0, 0.75, 0.28);
    lip.rotation.x = Math.PI / 2;
    lip.rotation.z = Math.PI * 0.9;
    lip.name = "Monocoque_CockpitLip";
    group.add(lip);

    // Side impact structures (SIS)
    for (const side of [-1, 1]) {
      const sisGeo = new THREE.BoxGeometry(0.08, 0.35, l * 0.5);
      const sis = new THREE.Mesh(sisGeo, mats.carbon);
      sis.position.set(side * (w / 2 + 0.04), 0.35, 0);
      sis.name = `Monocoque_SIS_${side > 0 ? "R" : "L"}`;
      group.add(sis);
    }

    return group;
  }

  /**
   * Creates the front bodywork with splitter, dive planes, and radiator inlets.
   */
  private static createFrontBodywork(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_FrontBodywork";

    const fw = config.overallWidthMm / 1000;

    // Front clamshell / hood
    const clamGeo = new THREE.BoxGeometry(fw * 0.92, 0.30, 1.10);
    const clam = new THREE.Mesh(clamGeo, mats.body);
    clam.position.set(0, 0.55, 1.35);
    clam.castShadow = true;
    clam.name = "Front_Clamshell";
    group.add(clam);

    // Front splitter
    const splitterGeo = new THREE.BoxGeometry(fw * 0.98, 0.035, 0.85);
    const splitter = new THREE.Mesh(splitterGeo, mats.carbon);
    splitter.position.set(0, 0.10, 1.55);
    splitter.name = "Front_Splitter";
    group.add(splitter);

    // Splitter side skirts
    for (const side of [-1, 1]) {
      const skirtGeo = new THREE.BoxGeometry(0.03, 0.06, 0.85);
      const skirt = new THREE.Mesh(skirtGeo, mats.carbon);
      skirt.position.set(side * fw * 0.48, 0.08, 1.55);
      skirt.name = `Front_SplitterSkirt_${side > 0 ? "R" : "L"}`;
      group.add(skirt);
    }

    // Front dive planes / canards (2 per side)
    for (const side of [-1, 1]) {
      for (let c = 0; c < 2; c++) {
        const canardGeo = new THREE.BoxGeometry(0.28, 0.015, 0.18);
        const canard = new THREE.Mesh(canardGeo, mats.carbon);
        canard.position.set(side * 0.62, 0.22 + c * 0.06, 1.48);
        canard.rotation.x = THREE.MathUtils.degToRad(-6 - c * 4);
        canard.rotation.y = side * 0.12;
        canard.name = `Front_Canard_${side > 0 ? "R" : "L"}_${c}`;
        group.add(canard);
      }
    }

    // Radiator inlets (left and right)
    for (const side of [-1, 1]) {
      const inletGeo = new THREE.BoxGeometry(0.18, 0.22, 0.35);
      const inlet = new THREE.Mesh(inletGeo, mats.carbon);
      inlet.position.set(side * fw * 0.40, 0.42, 1.15);
      inlet.name = `Front_RadiatorInlet_${side > 0 ? "R" : "L"}`;
      group.add(inlet);

      // Inlet mesh screen
      const screenGeo = new THREE.BoxGeometry(0.16, 0.20, 0.005);
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        wireframe: true,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(side * fw * 0.40, 0.42, 1.32);
      screen.name = `Front_InletScreen_${side > 0 ? "R" : "L"}`;
      group.add(screen);
    }

    // Front wheel arches
    for (const side of [-1, 1]) {
      const archGeo = new THREE.TorusGeometry(0.38, 0.08, 8, 12, Math.PI);
      const arch = new THREE.Mesh(archGeo, mats.body);
      arch.position.set(side * fw * 0.42, 0.36, 1.05);
      arch.rotation.y = Math.PI / 2;
      arch.rotation.z = Math.PI;
      arch.name = `Front_WheelArch_${side > 0 ? "R" : "L"}`;
      group.add(arch);
    }

    return group;
  }

  /**
   * Creates the rear bodywork with engine cover, shark fin, exhaust, and rear diffuser.
   */
  private static createRearBodywork(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_RearBodywork";

    const fw = config.overallWidthMm / 1000;

    // Engine cover
    const engineCoverGeo = new THREE.BoxGeometry(fw * 0.72, 0.38, 1.50);
    const engineCover = new THREE.Mesh(engineCoverGeo, mats.body);
    engineCover.position.set(0, 0.72, -0.80);
    engineCover.castShadow = true;
    engineCover.name = "Rear_EngineCover";
    group.add(engineCover);

    // Shark fin
    if (config.hasRoofScoop) {
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0, 0.42);
      finShape.lineTo(-1.0, 0.18);
      finShape.lineTo(-1.0, 0);
      finShape.closePath();
      const finExt: THREE.ExtrudeGeometryOptions = { depth: 0.010, bevelEnabled: false };
      const finExtrude = new THREE.ExtrudeGeometry(finShape, finExt);
      const fin = new THREE.Mesh(finExtrude, mats.accent);
      fin.rotation.y = Math.PI / 2;
      fin.position.set(0.005, 0.82, -0.55);
      fin.name = "Rear_SharkFin";
      group.add(fin);
    }

    // Roof air scoop
    if (config.hasRoofScoop) {
      const scoopGeo = new THREE.CylinderGeometry(0.15, 0.20, 0.50, 10);
      scoopGeo.rotateX(Math.PI / 2);
      const scoop = new THREE.Mesh(scoopGeo, mats.carbon);
      scoop.position.set(0, 0.95, -0.35);
      scoop.name = "Rear_RoofScoop";
      group.add(scoop);
    }

    // Exhaust system (titanium quad pipes)
    const exhaustPositions = [-0.18, -0.08, 0.08, 0.18];
    exhaustPositions.forEach((ez, i) => {
      const pipeGeo = new THREE.CylinderGeometry(0.032, 0.038, 0.22, 12);
      pipeGeo.rotateX(Math.PI / 2);
      const pipe = new THREE.Mesh(pipeGeo, mats.titanium);
      pipe.position.set(0, 0.25, -1.72);
      pipe.name = `Rear_Exhaust_${i}`;
      group.add(pipe);
    });

    // Exhaust heat shield
    const shieldGeo = new THREE.BoxGeometry(0.55, 0.02, 0.20);
    const shield = new THREE.Mesh(shieldGeo, mats.titanium);
    shield.position.set(0, 0.30, -1.70);
    shield.name = "Rear_ExhaustShield";
    group.add(shield);

    // Rear diffuser
    const diffGeo = new THREE.BoxGeometry(fw * 0.72, 0.25, 0.80);
    const diff = new THREE.Mesh(diffGeo, mats.carbon);
    diff.position.set(0, 0.18, -1.55);
    diff.rotation.x = THREE.MathUtils.degToRad(-12);
    diff.name = "Rear_Diffuser";
    group.add(diff);

    // Diffuser strakes (7 vertical fins)
    for (let s = 0; s < 7; s++) {
      const strakeGeo = new THREE.BoxGeometry(0.008, 0.20, 0.70);
      const strake = new THREE.Mesh(strakeGeo, mats.carbon);
      strake.position.set(-fw * 0.35 + s * (fw * 0.70 / 6), 0.18, -1.55);
      strake.rotation.x = THREE.MathUtils.degToRad(-12);
      strake.name = `Rear_DiffuserStrake_${s}`;
      group.add(strake);
    }

    // Rear wheel arches
    for (const side of [-1, 1]) {
      const archGeo = new THREE.TorusGeometry(0.40, 0.08, 8, 12, Math.PI);
      const arch = new THREE.Mesh(archGeo, mats.body);
      arch.position.set(side * fw * 0.42, 0.36, -1.10);
      arch.rotation.y = Math.PI / 2;
      arch.rotation.z = Math.PI;
      arch.name = `Rear_WheelArch_${side > 0 ? "R" : "L"}`;
      group.add(arch);
    }

    // Rear crash light (FIA mandatory)
    const crashLightGeo = new THREE.BoxGeometry(0.04, 0.05, 0.03);
    const crashLight = new THREE.Mesh(crashLightGeo, mats.ledRed);
    crashLight.position.set(0, 0.18, -1.76);
    crashLight.name = "Rear_CrashLight";
    group.add(crashLight);

    return group;
  }

  /**
   * Creates the active aerodynamic rear wing with DRS mechanism.
   */
  private static createActiveRearWing(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_ActiveRearWing";

    const fw = config.overallWidthMm / 1000;
    const wingSpan = fw * 0.88;

    // Swan-neck pylons
    const pylonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.32, 0),
      new THREE.Vector3(0, 0.55, -0.03),
      new THREE.Vector3(0, 0.78, 0),
      new THREE.Vector3(0, 0.95, 0.05),
    ]);
    const pylonGeo = new THREE.TubeGeometry(pylonCurve, 20, 0.018, 8, false);
    const pylonL = new THREE.Mesh(pylonGeo, mats.carbon);
    pylonL.position.set(-0.20, 0, -1.40);
    pylonL.name = "RearWing_Pylon_L";
    const pylonR = new THREE.Mesh(pylonGeo.clone(), mats.carbon);
    pylonR.position.set(0.20, 0, -1.40);
    pylonR.name = "RearWing_Pylon_R";
    group.add(pylonL, pylonR);

    // Mainplane
    const mainGeo = new THREE.BoxGeometry(wingSpan, 0.035, 0.38);
    const main = new THREE.Mesh(mainGeo, mats.body);
    main.position.set(0, 0.98, -1.42);
    main.rotation.x = THREE.MathUtils.degToRad(8);
    main.name = "RearWing_Mainplane";
    group.add(main);

    // DRS Flap (upper element)
    const drsGeo = new THREE.BoxGeometry(wingSpan - 0.04, 0.025, 0.16);
    const drsFlap = new THREE.Mesh(drsGeo, mats.accent);
    drsFlap.position.set(0, 1.08, -1.38);
    drsFlap.rotation.x = THREE.MathUtils.degToRad(config.ddrsMode === "LOW_DRAG" ? 2 : 14);
    drsFlap.name = "RearWing_DRSFlap";
    group.add(drsFlap);

    // Endplates
    for (const side of [-1, 1]) {
      const epGeo = new THREE.BoxGeometry(0.015, 0.50, 0.42);
      const ep = new THREE.Mesh(epGeo, mats.accent);
      ep.position.set(side * wingSpan / 2, 0.90, -1.42);
      ep.name = `RearWing_Endplate_${side > 0 ? "R" : "L"}`;
      group.add(ep);
    }

    return group;
  }

  /**
   * Creates the active venturi floor with 6 longitudinal fences.
   */
  private static createVenturiFloor(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_VenturiFloor";

    const floorLength = config.wheelbaseMm / 1000 + 0.6;
    const floorWidth = config.overallWidthMm / 1000 * 0.92;

    // Main floor plank
    const plankGeo = new THREE.BoxGeometry(floorWidth, 0.025, floorLength);
    const plank = new THREE.Mesh(plankGeo, mats.carbon);
    plank.position.set(0, 0.06, 0.1);
    plank.castShadow = true;
    plank.name = "Floor_MainPlank";
    group.add(plank);

    // Venturi tunnels
    for (const side of [-1, 1]) {
      const tunnelGeo = new THREE.BoxGeometry(0.35, 0.08, floorLength * 0.65);
      const tunnel = new THREE.Mesh(tunnelGeo, mats.carbon);
      tunnel.position.set(side * 0.48, 0.02, 0.05);
      tunnel.name = `Floor_VenturiTunnel_${side > 0 ? "R" : "L"}`;
      group.add(tunnel);
    }

    // 6 longitudinal fences
    for (let f = 0; f < 6; f++) {
      const fenceX = -floorWidth * 0.42 + f * (floorWidth * 0.84 / 5);
      const fenceGeo = new THREE.BoxGeometry(0.010, 0.065, floorLength * 0.85);
      const fence = new THREE.Mesh(fenceGeo, mats.carbon);
      fence.position.set(fenceX, 0.04, 0.1);
      fence.name = `Floor_Fence_${f}`;
      group.add(fence);
    }

    // Floor edges / side skirts
    for (const side of [-1, 1]) {
      const edgeGeo = new THREE.BoxGeometry(0.020, 0.035, floorLength * 0.9);
      const edge = new THREE.Mesh(edgeGeo, mats.carbon);
      edge.position.set(side * floorWidth / 2, 0.04, 0.1);
      edge.name = `Floor_Edge_${side > 0 ? "R" : "L"}`;
      group.add(edge);
    }

    // Skid blocks (FIA mandated)
    for (let z = -1.0; z <= 1.5; z += 0.4) {
      for (const x of [-0.25, 0, 0.25]) {
        const blockGeo = new THREE.BoxGeometry(0.06, 0.006, 0.06);
        const blockMat = new THREE.MeshStandardMaterial({
          color: 0x777777,
          roughness: 0.45,
          metalness: 0.75,
        });
        const block = new THREE.Mesh(blockGeo, blockMat);
        block.position.set(x, 0.045, z);
        block.name = `Floor_SkidBlock`;
        group.add(block);
      }
    }

    return group;
  }

  /**
   * Creates the tri-motor hybrid powertrain with ICE, battery, and electric motors.
   */
  private static createPowertrain(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_Powertrain";

    // ICE (mid-mounted V8/V12)
    const iceGeo = new THREE.BoxGeometry(0.60, 0.50, 0.75);
    const ice = new THREE.Mesh(iceGeo, mats.carbon);
    ice.position.set(0, 0.40, -0.85);
    ice.castShadow = true;
    ice.name = "Powertrain_ICE";
    group.add(ice);

    // Intake manifold
    const intakeGeo = new THREE.BoxGeometry(0.42, 0.15, 0.35);
    const intake = new THREE.Mesh(intakeGeo, mats.carbon);
    intake.position.set(0, 0.70, -0.80);
    intake.name = "Powertrain_IntakeManifold";
    group.add(intake);

    // Turbochargers (twin-turbo layout)
    for (const side of [-1, 1]) {
      const turboGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12);
      turboGeo.rotateZ(Math.PI / 2);
      const turbo = new THREE.Mesh(turboGeo, mats.titanium);
      turbo.position.set(side * 0.38, 0.45, -0.95);
      turbo.name = `Powertrain_Turbo_${side > 0 ? "R" : "L"}`;
      group.add(turbo);

      // Intercooler
      const icGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
      const ic = new THREE.Mesh(icGeo, mats.accent);
      ic.position.set(side * 0.35, 0.55, -0.65);
      ic.name = `Powertrain_Intercooler_${side > 0 ? "R" : "L"}`;
      group.add(ic);
    }

    // 900V Solid-State Battery Pack (under monocoque)
    const batteryGeo = new THREE.BoxGeometry(0.62, 0.20, 0.80);
    const battery = new THREE.Mesh(batteryGeo, mats.gold);
    battery.position.set(0, 0.12, 0.15);
    battery.name = "Powertrain_Battery900V";
    group.add(battery);

    // Battery cooling lines
    for (const side of [-1, 1]) {
      const lineGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.80, 6);
      lineGeo.rotateX(Math.PI / 2);
      const line = new THREE.Mesh(lineGeo, mats.accent);
      line.position.set(side * 0.25, 0.15, 0.15);
      line.name = `Powertrain_BatteryCooling_${side > 0 ? "R" : "L"}`;
      group.add(line);
    }

    // Front electric motors (one per wheel)
    for (const side of [-1, 1]) {
      const motorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12);
      motorGeo.rotateZ(Math.PI / 2);
      const motor = new THREE.Mesh(motorGeo, mats.gold);
      motor.position.set(side * 0.35, 0.25, 1.40);
      motor.name = `Powertrain_FrontMotor_${side > 0 ? "R" : "L"}`;
      group.add(motor);

      // Half shaft to wheel
      const shaftGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.40, 6);
      shaftGeo.rotateZ(Math.PI / 2);
      const shaft = new THREE.Mesh(shaftGeo, mats.titanium);
      shaft.position.set(side * 0.55, 0.25, 1.40);
      shaft.name = `Powertrain_HalfShaft_${side > 0 ? "R" : "L"}`;
      group.add(shaft);
    }

    // Rear differential
    const diffGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.22, 12);
    diffGeo.rotateZ(Math.PI / 2);
    const diff = new THREE.Mesh(diffGeo, mats.carbon);
    diff.position.set(0, 0.30, -1.20);
    diff.name = "Powertrain_RearDiff";
    group.add(diff);

    // Gearbox
    const gbGeo = new THREE.BoxGeometry(0.48, 0.38, 0.62);
    const gb = new THREE.Mesh(gbGeo, mats.carbon);
    gb.position.set(0, 0.35, -1.15);
    gb.name = "Powertrain_Gearbox";
    group.add(gb);

    // Drive shaft
    const dsGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 8);
    dsGeo.rotateX(Math.PI / 2);
    const ds = new THREE.Mesh(dsGeo, mats.titanium);
    ds.position.set(0, 0.35, -0.35);
    ds.name = "Powertrain_DriveShaft";
    group.add(ds);

    return group;
  }

  /**
   * Creates the suspension system (double wishbone, pushrod, heave elements).
   */
  private static createSuspension(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_Suspension";

    const wb = config.wheelbaseMm / 1000;
    const trackF = config.trackWidthFrontMm / 1000;
    const trackR = config.trackWidthRearMm / 1000;

    const corners = [
      { name: "FL", x: -trackF / 2, z: wb / 2 },
      { name: "FR", x: trackF / 2, z: wb / 2 },
      { name: "RL", x: -trackR / 2, z: -wb / 2 },
      { name: "RR", x: trackR / 2, z: -wb / 2 },
    ];

    corners.forEach((corner) => {
      const suspGroup = new THREE.Group();
      suspGroup.name = `Suspension_${corner.name}`;

      const wishLen = Math.abs(corner.x) * 0.55;

      // Upper wishbone (2 arms)
      for (let arm = 0; arm < 2; arm++) {
        const armGeo = new THREE.CylinderGeometry(0.012, 0.012, wishLen, 8);
        armGeo.rotateZ(Math.PI / 2);
        const armMesh = new THREE.Mesh(armGeo, mats.carbon);
        armMesh.position.set(corner.x * 0.48, 0.55 + arm * 0.03, corner.z);
        armMesh.name = `Susp_Upper_${corner.name}_${arm}`;
        suspGroup.add(armMesh);
      }

      // Lower wishbone (2 arms)
      for (let arm = 0; arm < 2; arm++) {
        const armGeo = new THREE.CylinderGeometry(0.014, 0.014, wishLen + 0.04, 8);
        armGeo.rotateZ(Math.PI / 2);
        const armMesh = new THREE.Mesh(armGeo, mats.carbon);
        armMesh.position.set(corner.x * 0.48, 0.16 - arm * 0.02, corner.z);
        armMesh.name = `Susp_Lower_${corner.name}_${arm}`;
        suspGroup.add(armMesh);
      }

      // Pushrod
      const prCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(corner.x * 0.82, 0.16, corner.z),
        new THREE.Vector3(corner.x * 0.55, 0.38, corner.z * 0.65),
        new THREE.Vector3(corner.x * 0.35, 0.55, corner.z * 0.35),
      ]);
      const prGeo = new THREE.TubeGeometry(prCurve, 12, 0.009, 6, false);
      const prMesh = new THREE.Mesh(prGeo, mats.carbon);
      prMesh.name = `Susp_Pushrod_${corner.name}`;
      suspGroup.add(prMesh);

      // Upright
      const uprightGeo = new THREE.BoxGeometry(0.035, 0.20, 0.055);
      const upright = new THREE.Mesh(uprightGeo, mats.carbon);
      upright.position.set(corner.x, 0.36, corner.z);
      upright.name = `Susp_Upright_${corner.name}`;
      suspGroup.add(upright);

      group.add(suspGroup);
    });

    return group;
  }

  /**
   * Creates the wheel and brake assembly for all 4 corners.
   */
  private static createWheelsAndBrakes(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_WheelsAndBrakes";

    const wb = config.wheelbaseMm / 1000;
    const trackF = config.trackWidthFrontMm / 1000;
    const trackR = config.trackWidthRearMm / 1000;

    const corners = [
      { name: "FL", x: -trackF / 2, z: wb / 2, width: 0.32 },
      { name: "FR", x: trackF / 2, z: wb / 2, width: 0.32 },
      { name: "RL", x: -trackR / 2, z: -wb / 2, width: 0.40 },
      { name: "RR", x: trackR / 2, z: -wb / 2, width: 0.40 },
    ];

    corners.forEach((corner) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.name = `Wheel_${corner.name}`;

      // Tire (Michelin slick)
      const tireRadius = 0.355;
      const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, corner.width, 36);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, mats.rubber);
      tire.name = "Tire";
      wheelGroup.add(tire);

      // Sidewall bulge
      for (const sign of [-1, 1]) {
        const bulgeGeo = new THREE.TorusGeometry(tireRadius, 0.010, 8, 24);
        bulgeGeo.rotateY(Math.PI / 2);
        const bulge = new THREE.Mesh(bulgeGeo, mats.rubber);
        bulge.position.set(sign * corner.width * 0.48, 0, 0);
        wheelGroup.add(bulge);
      }

      // Forged magnesium wheel (mesh multi-spoke)
      const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, corner.width + 0.005, 20);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2e,
        roughness: 0.22,
        metalness: 0.88,
      });
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.name = "Wheel_Rim";
      wheelGroup.add(wheel);

      // Center lock nut (red anodized)
      const nutGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.045, 6);
      nutGeo.rotateZ(Math.PI / 2);
      const nutMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.25,
        metalness: 0.85,
      });
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(corner.x > 0 ? 0.025 : -0.025, 0, 0);
      nut.name = "Wheel_CenterLock";
      wheelGroup.add(nut);

      // Carbon-ceramic brake disc (420mm)
      const discGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.038, 32);
      discGeo.rotateZ(Math.PI / 2);
      const disc = new THREE.Mesh(discGeo, mats.brakeGlow);
      disc.name = "Brake_Disc";
      wheelGroup.add(disc);

      // Ventilation vanes in disc
      for (let v = 0; v < 12; v++) {
        const angle = (v / 12) * Math.PI * 2;
        const vaneGeo = new THREE.BoxGeometry(0.040, 0.006, 0.028);
        const vane = new THREE.Mesh(vaneGeo, mats.brakeGlow);
        vane.position.set(0, Math.sin(angle) * 0.12, Math.cos(angle) * 0.12);
        vane.rotation.x = angle;
        vane.name = `Brake_Vane_${v}`;
        wheelGroup.add(vane);
      }

      // Multi-piston caliper (10-piston)
      const caliperGeo = new THREE.BoxGeometry(0.12, 0.09, 0.065);
      const caliperMat = new THREE.MeshPhysicalMaterial({
        color: 0x22c55e,
        metalness: 0.88,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
      });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(0, 0.12, 0);
      caliper.name = "Brake_Caliper10Pot";
      wheelGroup.add(caliper);

      wheelGroup.position.set(corner.x, 0.355, corner.z);
      group.add(wheelGroup);
    });

    return group;
  }

  /**
   * Creates LED matrix headlights and sequential taillights.
   */
  private static createLighting(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_Lighting";

    const fw = config.overallWidthMm / 1000;
    const frontZ = config.overallLengthMm / 1000 * 0.48;
    const rearZ = -config.overallLengthMm / 1000 * 0.48;

    // Front LED matrix headlights
    for (const side of [-1, 1]) {
      const headlightGroup = new THREE.Group();
      headlightGroup.name = `Headlight_${side > 0 ? "R" : "L"}`;

      // Headlight housing
      const housingGeo = new THREE.BoxGeometry(0.22, 0.08, 0.12);
      const housing = new THREE.Mesh(housingGeo, mats.carbon);
      headlightGroup.add(housing);

      // LED array (4x3 grid of emitters)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const ledGeo = new THREE.BoxGeometry(0.035, 0.015, 0.005);
          const led = new THREE.Mesh(ledGeo, mats.ledWhite);
          led.position.set(
            -0.06 + col * 0.04,
            -0.02 + row * 0.02,
            0.065
          );
          headlightGroup.add(led);
        }
      }

      // DRL strip
      const drlGeo = new THREE.BoxGeometry(0.20, 0.008, 0.005);
      const drl = new THREE.Mesh(drlGeo, mats.ledWhite);
      drl.position.set(0, -0.04, 0.065);
      headlightGroup.add(drl);

      // Turn signal strip (amber)
      const turnGeo = new THREE.BoxGeometry(0.06, 0.008, 0.005);
      const turn = new THREE.Mesh(turnGeo, mats.ledAmber);
      turn.position.set(side * 0.12, -0.04, 0.065);
      headlightGroup.add(turn);

      headlightGroup.position.set(side * fw * 0.35, 0.48, frontZ);
      group.add(headlightGroup);
    }

    // Rear LED taillight bar (continuous)
    const taillightGeo = new THREE.BoxGeometry(fw * 0.75, 0.025, 0.010);
    const taillight = new THREE.Mesh(taillightGeo, mats.ledRed);
    taillight.position.set(0, 0.32, rearZ);
    taillight.name = "Taillight_Bar";
    group.add(taillight);

    // Rear sequential turn signals
    for (const side of [-1, 1]) {
      const seqGeo = new THREE.BoxGeometry(0.10, 0.020, 0.010);
      const seq = new THREE.Mesh(seqGeo, mats.ledAmber);
      seq.position.set(side * fw * 0.38, 0.32, rearZ);
      seq.name = `Taillight_TurnSignal_${side > 0 ? "R" : "L"}`;
      group.add(seq);
    }

    return group;
  }

  /**
   * Creates the sidepods with radiator inlets and cooling exits.
   */
  private static createSidepods(mats: HypercarMaterialSet, config: HypercarDesignConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = "Hypercar_Sidepods";

    const fw = config.overallWidthMm / 1000;

    for (const side of [-1, 1]) {
      const podGroup = new THREE.Group();
      podGroup.name = `Sidepod_${side > 0 ? "R" : "L"}`;

      // Main sidepod volume
      const podGeo = new THREE.BoxGeometry(0.45, 0.45, 1.60);
      const pod = new THREE.Mesh(podGeo, mats.body);
      pod.castShadow = true;
      pod.name = "Sidepod_Main";
      podGroup.add(pod);

      // Radiator inlet
      const inletGeo = new THREE.BoxGeometry(0.04, 0.30, 0.24);
      const inlet = new THREE.Mesh(inletGeo, mats.carbon);
      inlet.position.set(side * 0.22, 0.04, 0.75);
      inlet.name = "Sidepod_Inlet";
      podGroup.add(inlet);

      // Cooling exit louvers (5 slots)
      for (let l = 0; l < 5; l++) {
        const louverGeo = new THREE.BoxGeometry(0.006, 0.030, 0.05);
        const louver = new THREE.Mesh(louverGeo, mats.carbon);
        louver.position.set(side * 0.22, 0.02 + l * 0.035, -0.65);
        louver.name = `Sidepod_Louver_${l}`;
        podGroup.add(louver);
      }

      // Downwash ramp
      const rampGeo = new THREE.BoxGeometry(0.40, 0.012, 0.70);
      const ramp = new THREE.Mesh(rampGeo, mats.body);
      ramp.position.set(0, -0.20, -0.40);
      ramp.rotation.x = THREE.MathUtils.degToRad(-8);
      ramp.name = "Sidepod_DownwashRamp";
      podGroup.add(ramp);

      podGroup.position.set(side * (fw / 2 - 0.22), 0.35, 0.05);
      group.add(podGroup);
    }

    return group;
  }

  /**
   * Assembles the complete hypercar from all sub-systems.
   */
  public static createFullHypercar(config: HypercarDesignConfig): THREE.Group {
    const root = new THREE.Group();
    root.name = "HYPERCAR_FULL_LE_MANS";

    const mats = this.createMaterialSet(config);
    const ex = config.explodedAmount;

    // Monocoque
    const mono = this.createMonocoque(mats, config);
    mono.position.set(0, ex * 0.3, ex * 0.2);
    root.add(mono);

    // Front bodywork
    const front = this.createFrontBodywork(mats, config);
    front.position.set(0, ex * 0.15, ex * 1.0);
    root.add(front);

    // Rear bodywork
    const rear = this.createRearBodywork(mats, config);
    rear.position.set(0, ex * 0.20, -ex * 0.8);
    root.add(rear);

    // Active rear wing
    const wing = this.createActiveRearWing(mats, config);
    wing.position.set(0, ex * 0.25, -ex * 1.1);
    root.add(wing);

    // Venturi floor
    const floor = this.createVenturiFloor(mats, config);
    floor.position.set(0, -ex * 0.3, 0);
    root.add(floor);

    // Powertrain
    const powertrain = this.createPowertrain(mats, config);
    powertrain.position.set(0, 0, 0);
    root.add(powertrain);

    // Suspension
    const susp = this.createSuspension(mats, config);
    root.add(susp);

    // Wheels and brakes
    const wheels = this.createWheelsAndBrakes(mats, config);
    wheels.position.set(ex * 0.4, 0, 0);
    root.add(wheels);

    // Lighting
    const lighting = this.createLighting(mats, config);
    root.add(lighting);

    // Sidepods
    const sidepods = this.createSidepods(mats, config);
    root.add(sidepods);

    return root;
  }

  /**
   * Returns default hypercar configuration.
   */
  public static getDefaultConfig(): HypercarDesignConfig {
    return {
      bodyColorHex: 0x111317,
      accentColorHex: 0xf59e0b,
      carbonColorHex: 0x11141a,
      metalness: 0.85,
      roughness: 0.12,
      wireframe: false,
      explodedAmount: 0,
      ddrsMode: "HIGH_DOWNFORCE",
      hasActiveAero: true,
      hasRoofScoop: true,
      powertrainLayout: "TRIMOTOR_HYBRID",
      wheelbaseMm: 2750,
      trackWidthFrontMm: 1690,
      trackWidthRearMm: 1740,
      overallLengthMm: 4650,
      overallWidthMm: 2000,
      overallHeightMm: 1050,
    };
  }
}
