/**
 * ============================================================================
 * MODULAR ASSEMBLY SCENE GRAPH & 3D HARDPOINT ORCHESTRATOR
 * ============================================================================
 * Hierarchical Three.js scene graph manager for the Linear Vehicle Assembly Studio.
 * Handles:
 * 1. Standardized 3D mounting hardpoints (engine, transmission, suspension, body, aero)
 * 2. High-fidelity procedural PBR 3D subassemblies
 * 3. Dynamic engine placement (Front / Mid / Rear)
 * 4. Exploded mechanical assembly offsets (0% to 100%)
 * 5. Parametric aerodynamic live pivot rotations (wing angle, splitter, diffuser)
 * 6. Installation transition animations and preview ghosting
 */

import * as THREE from "three";
import { EngineConfig } from "../../../sim/types";
import { EnginePosition, PaintFinish } from "../../../sim/types";
import { UniversalGlbAssetLoader } from "../../../exterior3d/loaders/universalGlbAssetLoader";
import { AutomotivePBRMaterialSystem } from "../../../exterior3d/materials/automotivePBRMaterialSystem";

export type AssemblyStageId =
  | "chassis"
  | "engine"
  | "transmission"
  | "suspension"
  | "brakes"
  | "wheels"
  | "body_structure"
  | "glass"
  | "interior"
  | "electronics"
  | "final_exterior"
  | "complete"
  | "aero_studio";

export interface ChassisConfig3D {
  type: "gt3" | "sports" | "coupe" | "sedan" | "hypercar" | "supercar" | "track";
  architecture: "monocoque" | "spaceframe" | "carbon_tub" | "tubular_cradle" | "ladder" | "ev_skateboard";
  wheelbaseMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
  rideHeightMm: number;
}

export interface AeroParameters3D {
  rearWingEnabled: boolean;
  rearWingType: "single_plane" | "dual_plane" | "swan_neck" | "active_drs";
  rearWingAngleDeg: number; // -5 to 28 deg
  rearWingHeightMm: number; // 150 to 500 mm
  rearWingWidthMm: number; // 1200 to 1950 mm
  gurneyFlap: boolean;
  endplateSize: "compact" | "standard" | "extended" | "swan_neck";

  frontSplitterEnabled: boolean;
  frontSplitterLengthMm: number; // 40 to 220 mm
  frontSplitterAngleDeg: number; // -2 to 6 deg
  frontCanards: boolean;
  frontCanardAngleDeg: number; // 0 to 25 deg

  diffuserEnabled: boolean;
  diffuserAngleDeg: number; // 0 to 22 deg
  diffuserStrakes: number; // 2 to 6
  diffuserExitWidthMm: number; // 800 to 1400 mm

  sideSkirtsEnabled: boolean;
  sideSkirtExtensionMm: number; // 20 to 120 mm
  vortexFins: boolean;
  underbodyVenturiTunnels: boolean;
  venturiTunnelCount?: number; // 2 to 6 underbody venturi tunnels (GT3 spec: 4)
}

export interface InstalledSubsystemsState {
  installedStages: Set<AssemblyStageId>;
  chassis: ChassisConfig3D;
  engine: EngineConfig;
  enginePosition: EnginePosition;
  engineOffsetMm?: number; // Stage 2: lateral drop-in offset (-150 to +150 mm)
  transmissionType: "manual_6" | "dct_7" | "seq_8" | "ev_direct";
  diffCoolingFins?: boolean; // Stage 3: differential cooling fin block
  cvBoots?: boolean; // Stage 3: CV joint boots at driveshaft exits
  suspensionType: "double_wishbone" | "multilink" | "pushrod" | "air_active";
  activeCoilovers?: boolean; // Stage 4: electronically active coilover dampers
  arbFrontNmPerDeg?: number; // Stage 4: front anti-roll bar stiffness (Nm/deg)
  arbRearNmPerDeg?: number; // Stage 4: rear anti-roll bar stiffness (Nm/deg)
  brakeType: "carbon_ceramic" | "slotted_steel" | "drilled_sport";
  brakeBiasPct?: number; // Stage 5: front brake bias (%)
  caliperColor: string;
  wheelStyle: "centerlock_gt3" | "forged_turbofan" | "carbon_spoke" | "deep_dish";
  tireCompound: "racing_slick" | "semi_slick" | "street_sport";
  bodyKit: "gt3_aero" | "carbon_widebody" | "sculpted_supercar" | "oem_sport";
  fenderLouvers?: boolean; // Stage 7: fender vent louvers
  doorStyle?: "butterfly" | "scissor" | "gullwing" | "conventional";
  doorOpenAngleDeg?: number;
  bonnetStyle?: "extractor_vents" | "naca_ducts" | "louvered" | "smooth_supercar";
  bonnetOpenAngleDeg?: number;
  dickyStyle?: "vented_decklid" | "ducktail_trunk" | "carbon_tailgate" | "active_airbrake";
  dickyOpenAngleDeg?: number;
  paintColor: string;
  paintFinish: PaintFinish;
  glassType: "laminated_clear" | "race_polycarbonate" | "privacy_tint";
  lexanEngineCover?: boolean; // Stage 8: Lexan engine cover inspection window
  interiorType: "carbon_bucket_gt3" | "alcantara_comfort" | "formula_yoke_cockpit";
  sixPointHarness?: boolean; // Stage 9: FIA 6-point harnesses
  motecDisplay?: boolean; // Stage 9: digital MoTeC display unit
  electronicsType: "motorsport_ecu_telemetry" | "800v_hv_harness" | "adas_sensor_suite";
  raychemLooms?: boolean; // Stage 10: Raychem mil-spec wire looms
  exhaustType: "quad_titanium" | "center_dual" | "f1_side_exit";
  heatTintIntensity?: number; // Stage 11: titanium blue heat-tint gradient (0-100%)
  towHooksFront?: boolean; // Stage 11: front tow hook
  towHooksRear?: boolean; // Stage 11: rear tow hook
  aero: AeroParameters3D;
}

export class ModularAssemblySceneGraph {
  public rootGroup: THREE.Group;
  public chassisGroup: THREE.Group;
  public engineGroup: THREE.Group;
  public transmissionGroup: THREE.Group;
  public suspensionGroup: THREE.Group;
  public brakesGroup: THREE.Group;
  public wheelsGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public glassGroup: THREE.Group;
  public interiorGroup: THREE.Group;
  public electronicsGroup: THREE.Group;
  public exteriorDetailsGroup: THREE.Group;
  public aeroGroup: THREE.Group;

  // Closures Kinematic Pivots (Doors, Bonnet, Dicky)
  public leftDoorPivot: THREE.Group;
  public rightDoorPivot: THREE.Group;
  public bonnetPivot: THREE.Group;
  public dickyPivot: THREE.Group;

  // Aero parametric pivots
  public rearWingPivot: THREE.Group;
  public rearWingMeshGroup: THREE.Group;
  public frontSplitterPivot: THREE.Group;
  public diffuserPivot: THREE.Group;
  public leftCanardPivot: THREE.Group;
  public rightCanardPivot: THREE.Group;

  // Anchor indicators & CAD Gizmos
  public anchorVisualizersGroup: THREE.Group;
  public comGizmoGroup: THREE.Group;
  public measurementGroup: THREE.Group;

  // Kinematic Sub-Assemblies
  public frontLeftWheelAssembly: THREE.Group;
  public frontRightWheelAssembly: THREE.Group;
  public rearLeftWheelAssembly: THREE.Group;
  public rearRightWheelAssembly: THREE.Group;
  public steeringRackGroup: THREE.Group;
  public driveshaftMesh: THREE.Mesh | null = null;
  public pulleyMeshes: THREE.Mesh[] = [];

  // Clipping Planes for Section Views
  public sectionClippingPlanes: THREE.Plane[] = [];

  // Materials Cache
  private materials: { [key: string]: THREE.Material } = {};
  private glbCache: Map<string, THREE.Group> = new Map();
  public showFeaStress: boolean = false;
  public activeFeaLoadCase: "torsional" | "cornering" | "braking" | "crash" = "torsional";
  public chassisMetallurgyMode: "titanium" | "aluminum_6061" | "chromoly_4130" | "carbon_autoclave" | "hardox_steel" | "default" = "default";
  private onModelLoadedCallback: (() => void) | null = null;

  // Visibility states
  private isolatedStage: AssemblyStageId | null = null;
  private subsystemVisibilityModes: Map<AssemblyStageId, "normal" | "ghost" | "xray" | "hidden"> = new Map();

  public setFeaStressMode(enabled: boolean) {
    this.showFeaStress = enabled;
  }

  public setFeaLoadCase(loadCase: "torsional" | "cornering" | "braking" | "crash") {
    this.activeFeaLoadCase = loadCase;
  }

  public setChassisMetallurgy(mode: "titanium" | "aluminum_6061" | "chromoly_4130" | "carbon_autoclave" | "hardox_steel" | "default") {
    this.chassisMetallurgyMode = mode;
  }

  public setOnModelLoaded(cb: () => void) {
    this.onModelLoadedCallback = cb;
  }

  public async preloadGlbChassisOrBody(uri: string): Promise<void> {
    if (this.glbCache.has(uri)) return;
    try {
      const asset = await UniversalGlbAssetLoader.loadAsset(uri);
      if (asset && asset.scene) {
        this.glbCache.set(uri, asset.scene);
        if (this.onModelLoadedCallback) this.onModelLoadedCallback();
      }
    } catch {
      // Graceful fallback to procedural CAD models
    }
  }

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "VehicleRoot";

    this.chassisGroup = new THREE.Group();
    this.chassisGroup.name = "Chassis_Assembly";

    this.engineGroup = new THREE.Group();
    this.engineGroup.name = "Engine_Assembly";

    this.transmissionGroup = new THREE.Group();
    this.transmissionGroup.name = "Transmission_Assembly";

    this.suspensionGroup = new THREE.Group();
    this.suspensionGroup.name = "Suspension_Assembly";

    this.brakesGroup = new THREE.Group();
    this.brakesGroup.name = "Brakes_Assembly";

    this.wheelsGroup = new THREE.Group();
    this.wheelsGroup.name = "Wheels_Assembly";

    this.frontLeftWheelAssembly = new THREE.Group();
    this.frontRightWheelAssembly = new THREE.Group();
    this.rearLeftWheelAssembly = new THREE.Group();
    this.rearRightWheelAssembly = new THREE.Group();
    this.steeringRackGroup = new THREE.Group();

    this.wheelsGroup.add(
      this.frontLeftWheelAssembly,
      this.frontRightWheelAssembly,
      this.rearLeftWheelAssembly,
      this.rearRightWheelAssembly
    );

    this.bodyGroup = new THREE.Group();
    this.bodyGroup.name = "Body_Assembly";

    this.leftDoorPivot = new THREE.Group();
    this.leftDoorPivot.name = "LeftDoor_Pivot";
    this.rightDoorPivot = new THREE.Group();
    this.rightDoorPivot.name = "RightDoor_Pivot";
    this.bonnetPivot = new THREE.Group();
    this.bonnetPivot.name = "Bonnet_Pivot";
    this.dickyPivot = new THREE.Group();
    this.dickyPivot.name = "Dicky_Pivot";

    this.bodyGroup.add(
      this.leftDoorPivot,
      this.rightDoorPivot,
      this.bonnetPivot,
      this.dickyPivot
    );

    this.glassGroup = new THREE.Group();
    this.glassGroup.name = "Glass_Assembly";

    this.interiorGroup = new THREE.Group();
    this.interiorGroup.name = "Interior_Assembly";

    this.electronicsGroup = new THREE.Group();
    this.electronicsGroup.name = "Electronics_Assembly";

    this.exteriorDetailsGroup = new THREE.Group();
    this.exteriorDetailsGroup.name = "ExteriorDetails_Assembly";

    this.aeroGroup = new THREE.Group();
    this.aeroGroup.name = "Aerodynamics_Assembly";

    this.rearWingPivot = new THREE.Group();
    this.rearWingPivot.name = "RearWing_Pivot";
    this.rearWingMeshGroup = new THREE.Group();
    this.rearWingPivot.add(this.rearWingMeshGroup);

    this.frontSplitterPivot = new THREE.Group();
    this.frontSplitterPivot.name = "FrontSplitter_Pivot";

    this.diffuserPivot = new THREE.Group();
    this.diffuserPivot.name = "Diffuser_Pivot";

    this.leftCanardPivot = new THREE.Group();
    this.rightCanardPivot = new THREE.Group();

    this.anchorVisualizersGroup = new THREE.Group();
    this.anchorVisualizersGroup.name = "Mounting_Anchors";

    this.comGizmoGroup = new THREE.Group();
    this.comGizmoGroup.name = "CenterOfMass_Gizmo";
    this.comGizmoGroup.visible = false;

    this.measurementGroup = new THREE.Group();
    this.measurementGroup.name = "Measurement_Calipers";

    // Build hierarchy
    this.rootGroup.add(
      this.chassisGroup,
      this.engineGroup,
      this.transmissionGroup,
      this.suspensionGroup,
      this.brakesGroup,
      this.wheelsGroup,
      this.bodyGroup,
      this.glassGroup,
      this.interiorGroup,
      this.electronicsGroup,
      this.exteriorDetailsGroup,
      this.aeroGroup,
      this.anchorVisualizersGroup,
      this.comGizmoGroup,
      this.measurementGroup
    );

    this.aeroGroup.add(
      this.rearWingPivot,
      this.frontSplitterPivot,
      this.diffuserPivot,
      this.leftCanardPivot,
      this.rightCanardPivot
    );

    this.initMaterials();
    this.initCoMGizmo();
  }

  /**
   * Rebuilds or updates all 3D geometry based on the full installed state.
   */
  public updateScene(
    state: InstalledSubsystemsState,
    currentPreviewStage: AssemblyStageId | null = null,
    explodedProgress: number = 0.0,
    isXRay: boolean = false
  ) {
    const wb = state.chassis.wheelbaseMm / 1000;
    const tf = (state.chassis.frontTrackMm / 2) / 1000;
    const tr = (state.chassis.rearTrackMm / 2) / 1000;
    const rh = state.chassis.rideHeightMm / 1000;

    // Clear previous dynamic meshes
    this.clearGroup(this.chassisGroup);
    this.clearGroup(this.engineGroup);
    this.clearGroup(this.transmissionGroup);
    this.clearGroup(this.suspensionGroup);
    this.clearGroup(this.brakesGroup);
    this.clearGroup(this.wheelsGroup);
    this.clearGroup(this.bodyGroup);
    this.clearGroup(this.glassGroup);
    this.clearGroup(this.interiorGroup);
    this.clearGroup(this.electronicsGroup);
    this.clearGroup(this.exteriorDetailsGroup);
    this.clearGroup(this.rearWingMeshGroup);
    this.clearGroup(this.frontSplitterPivot);
    this.clearGroup(this.diffuserPivot);
    this.clearGroup(this.leftCanardPivot);
    this.clearGroup(this.rightCanardPivot);
    this.clearGroup(this.anchorVisualizersGroup);

    const isInstalled = (stage: AssemblyStageId) => state.installedStages.has(stage);
    const isPreviewing = (stage: AssemblyStageId) => currentPreviewStage === stage;
    const shouldRender = (stage: AssemblyStageId) => isInstalled(stage) || isPreviewing(stage);

    // ── STAGE 1: CHASSIS ──
    if (shouldRender("chassis")) {
      const chassisMesh = this.buildChassis3D(state.chassis, isPreviewing("chassis"));
      this.chassisGroup.add(chassisMesh);
    }

    // ── STAGE 2: ENGINE ──
    if (shouldRender("engine")) {
      const engineMesh = this.buildEngine3D(state.engine, state.enginePosition, isPreviewing("engine"));
      this.engineGroup.add(engineMesh);
      // Position Engine by mounting point + lateral drop-in offset
      const pos = this.getEngineMountPosition(state.enginePosition, wb, rh);
      const lateralOffsetM = (state.engineOffsetMm || 0) / 1000;
      this.engineGroup.position.set(pos.x + lateralOffsetM, pos.y, pos.z);
    } else {
      this.engineGroup.position.set(0, 0, 0);
    }

    // ── STAGE 3: TRANSMISSION ──
    if (shouldRender("transmission")) {
      const transMesh = this.buildTransmission3D(
        state.transmissionType,
        state.diffCoolingFins ?? false,
        state.cvBoots ?? false,
        isPreviewing("transmission")
      );
      this.transmissionGroup.add(transMesh);
      const engPos = this.getEngineMountPosition(state.enginePosition, wb, rh);
      const transZ = state.enginePosition === "rear" ? engPos.z - 0.42 : engPos.z + 0.45;
      const lateralOffsetM = (state.engineOffsetMm || 0) / 1000;
      this.transmissionGroup.position.set(lateralOffsetM * 0.6, engPos.y - 0.05, transZ);
    }

    // ── STAGE 4: SUSPENSION ──
    if (shouldRender("suspension")) {
      const suspMesh = this.buildSuspension3D(
        state.suspensionType,
        wb,
        tf,
        tr,
        rh,
        state.activeCoilovers ?? false,
        state.arbFrontNmPerDeg ?? 250,
        state.arbRearNmPerDeg ?? 180,
        isPreviewing("suspension")
      );
      this.suspensionGroup.add(suspMesh);
    }

    // ── STAGE 5: BRAKES ──
    if (shouldRender("brakes")) {
      const brakesMesh = this.buildBrakes3D(state.brakeType, state.caliperColor, wb, tf, tr, rh, isPreviewing("brakes"));
      this.brakesGroup.add(brakesMesh);
    }

    // ── STAGE 6: WHEELS & TYRES ──
    if (shouldRender("wheels")) {
      const wheelsMesh = this.buildWheels3D(state.wheelStyle, state.tireCompound, wb, tf, tr, rh, isPreviewing("wheels"));
      this.wheelsGroup.add(wheelsMesh);
    }

    // ── STAGE 7: BODY STRUCTURE, CLOSURES & PANELS ──
    if (shouldRender("body_structure")) {
      const bodyMesh = this.buildBodyPanels3D(state, wb, tf, tr, rh, isPreviewing("body_structure"));
      this.bodyGroup.add(bodyMesh);
    }

    // ── STAGE 8: GLASS & CANOPY ──
    if (shouldRender("glass")) {
      const glassMesh = this.buildGlass3D(state.glassType, state.lexanEngineCover ?? false, wb, tf, tr, rh, isPreviewing("glass"));
      this.glassGroup.add(glassMesh);
    }

    // ── STAGE 9: INTERIOR & COCKPIT ──
    if (shouldRender("interior")) {
      const interiorMesh = this.buildInterior3D(
        state.interiorType,
        state.sixPointHarness ?? false,
        state.motecDisplay ?? false,
        wb,
        rh,
        isPreviewing("interior")
      );
      this.interiorGroup.add(interiorMesh);
    }

    // ── STAGE 10: ELECTRONICS & WIRING ──
    if (shouldRender("electronics")) {
      const elecMesh = this.buildElectronics3D(
        state.electronicsType,
        state.raychemLooms ?? false,
        state.electronicsType === "800v_hv_harness",
        wb,
        rh,
        isPreviewing("electronics")
      );
      this.electronicsGroup.add(elecMesh);
    }

    // ── STAGE 11: FINAL EXTERIOR DETAILS ──
    if (shouldRender("final_exterior")) {
      const extMesh = this.buildExteriorDetails3D(
        state.exhaustType,
        state.heatTintIntensity ?? 50,
        state.towHooksFront ?? true,
        state.towHooksRear ?? true,
        wb,
        tf,
        tr,
        rh,
        isPreviewing("final_exterior")
      );
      this.exteriorDetailsGroup.add(extMesh);
    }

    // ── STAGE 12: AERODYNAMICS STUDIO (Parametric Modules) ──
    if (shouldRender("aero_studio") || isInstalled("aero_studio") || state.aero.rearWingEnabled || state.aero.frontSplitterEnabled || state.aero.diffuserEnabled) {
      this.updateParametricAero(state.aero, wb, tf, tr, rh, isPreviewing("aero_studio"));
    }

    // Apply Exploded View Offsets
    this.applyExplodedOffsets(explodedProgress, wb);

    // Apply X-Ray transparency if active
    if (isXRay) {
      this.applyXRayMode();
    }
  }

  // ==========================================================================
  // ENGINE MOUNT POINT CALCULATOR
  // ==========================================================================
  private getEngineMountPosition(pos: EnginePosition, wb: number, rh: number): THREE.Vector3 {
    switch (pos) {
      case "mid":
        return new THREE.Vector3(0, rh + 0.32, 0.15); // Behind driver, ahead of rear axle
      case "rear":
        return new THREE.Vector3(0, rh + 0.34, (wb * 0.5) + 0.28); // Behind rear axle
      case "front":
      default:
        return new THREE.Vector3(0, rh + 0.32, -(wb * 0.5) + 0.32); // Ahead of cabin, over front subframe
    }
  }

  // ==========================================================================
  // PARAMETRIC AERO PIVOTS & GEOMETRY
  // ==========================================================================
  private updateParametricAero(
    aero: AeroParameters3D,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ) {
    const carbonMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55, wireframe: false })
      : this.materials.carbon;

    // 1. REAR WING WITH LIVE MECHANICAL PIVOT & SWAN-NECK GT3 AEROFOIL
    if (aero.rearWingEnabled) {
      const wingHeightM = aero.rearWingHeightMm / 1000;
      const wingWidthM = aero.rearWingWidthMm / 1000;
      const wingZ = (wb * 0.5) + 0.62; // Deck position

      // Set Pivot position at the base mounting brackets on the rear deck
      this.rearWingPivot.position.set(0, rh + 0.82 + (wingHeightM * 0.55), wingZ);

      // ROTATE PIVOT BY USER ANGLE IN REAL TIME!
      this.rearWingPivot.rotation.x = (aero.rearWingAngleDeg * Math.PI) / 180;

      // Swan-Neck Upright Pylons (Mount to top surface of wing for laminar underside flow)
      [-0.32, 0.32].forEach((xPos) => {
        const pylonCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(xPos, -wingHeightM * 0.75, 0.08),
          new THREE.Vector3(xPos, -wingHeightM * 0.35, 0.04),
          new THREE.Vector3(xPos, -wingHeightM * 0.05, -0.06),
          new THREE.Vector3(xPos, 0.04, -0.04)
        );
        const pylonGeo = new THREE.TubeGeometry(pylonCurve, 16, 0.018, 8, false);
        const pylon = new THREE.Mesh(pylonGeo, carbonMat);
        this.rearWingMeshGroup.add(pylon);
      });

      // Main Cambered Aerofoil Wing Chord (Cambered teardrop profile)
      const chordDepth = 0.34;
      const chordThickness = 0.035;
      const mainChordGeo = new THREE.CylinderGeometry(chordDepth * 0.48, chordDepth * 0.52, wingWidthM, 16);
      const mainWing = new THREE.Mesh(mainChordGeo, carbonMat);
      mainWing.rotation.z = Math.PI / 2;
      mainWing.rotation.x = 0.12;
      mainWing.scale.set(1.0, chordThickness / (chordDepth * 0.5), 1.0);
      mainWing.position.set(0, 0, 0);
      this.rearWingMeshGroup.add(mainWing);

      // Secondary Slotted Flap (if dual plane or swan neck)
      if (aero.rearWingType === "dual_plane" || aero.rearWingType === "swan_neck") {
        const flapDepth = 0.18;
        const flapGeo = new THREE.CylinderGeometry(flapDepth * 0.46, flapDepth * 0.52, wingWidthM * 0.96, 12);
        const flap = new THREE.Mesh(flapGeo, carbonMat);
        flap.rotation.z = Math.PI / 2;
        flap.rotation.x = -0.18;
        flap.scale.set(1.0, 0.02 / (flapDepth * 0.5), 1.0);
        flap.position.set(0, 0.065, -0.14);
        this.rearWingMeshGroup.add(flap);
      }

      // Aerodynamic Endplates with Vortex Spill Fences
      const endplateHeight = aero.endplateSize === "extended" ? 0.36 : aero.endplateSize === "compact" ? 0.20 : 0.26;
      const endplateDepth = chordDepth * 1.35;
      const endplateGeo = new THREE.BoxGeometry(0.012, endplateHeight, endplateDepth);
      [-wingWidthM * 0.5, wingWidthM * 0.5].forEach((sideX) => {
        const endplate = new THREE.Mesh(endplateGeo, carbonMat);
        endplate.position.set(sideX, 0, -0.02);
        this.rearWingMeshGroup.add(endplate);
      });

      // Optional Titanium Gurney Flap
      if (aero.gurneyFlap) {
        const gurneyGeo = new THREE.BoxGeometry(wingWidthM * 0.98, 0.022, 0.008);
        const gurney = new THREE.Mesh(gurneyGeo, this.materials.aluminum);
        gurney.position.set(0, 0.024, chordDepth * 0.46);
        this.rearWingMeshGroup.add(gurney);
      }
    }

    // 2. FRONT SPLITTER WITH SWEPT TRAY & DOWNTURN CANARDS
    if (aero.frontSplitterEnabled) {
      const splitExtM = aero.frontSplitterLengthMm / 1000;
      const splitZ = -(wb * 0.5) - 0.72;

      this.frontSplitterPivot.position.set(0, rh + 0.06, splitZ);
      this.frontSplitterPivot.rotation.x = -(aero.frontSplitterAngleDeg * Math.PI) / 180;

      // Swept Carbon Fiber Splitter Tray (Contoured Leading Edge)
      const splitterWidth = tf * 1.95;
      const splitterLength = 0.42 + splitExtM;
      const splitterGeo = new THREE.BoxGeometry(splitterWidth, 0.022, splitterLength);
      const splitter = new THREE.Mesh(splitterGeo, carbonMat);
      splitter.position.set(0, 0, -splitExtM * 0.5);
      this.frontSplitterPivot.add(splitter);

      // Splitter Lateral Vertical Endplate Fences
      const endFenceGeo = new THREE.BoxGeometry(0.015, 0.12, splitterLength * 0.9);
      [-splitterWidth * 0.5, splitterWidth * 0.5].forEach((fenceX) => {
        const fence = new THREE.Mesh(endFenceGeo, carbonMat);
        fence.position.set(fenceX, 0.05, -splitExtM * 0.5);
        this.frontSplitterPivot.add(fence);
      });

      // Adjustable Titanium Support Turnbuckle Struts
      const strutGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8);
      [-0.32, 0.32].forEach((strutX) => {
        const strut = new THREE.Mesh(strutGeo, this.materials.chrome);
        strut.rotation.x = -Math.PI / 7;
        strut.position.set(strutX, 0.10, -splitExtM * 0.85);
        this.frontSplitterPivot.add(strut);
      });
    }

    // 3. REAR VENTURI DIFFUSER WITH EXPANSION RAMPS & FIA RAIN LIGHT
    if (aero.diffuserEnabled) {
      const diffZ = (wb * 0.5) + 0.42;
      this.diffuserPivot.position.set(0, rh + 0.08, diffZ);
      this.diffuserPivot.rotation.x = -(aero.diffuserAngleDeg * Math.PI) / 180;

      const exitWidthM = aero.diffuserExitWidthMm / 1000;
      const diffGeo = new THREE.BoxGeometry(exitWidthM, 0.018, 0.72);
      const diffMesh = new THREE.Mesh(diffGeo, carbonMat);
      diffMesh.position.set(0, 0, 0.34);
      this.diffuserPivot.add(diffMesh);

      // Vertical Aerodynamic Vortex Strakes
      const strakesCount = Math.max(2, Math.min(6, aero.diffuserStrakes));
      const strakeSpacing = exitWidthM / (strakesCount + 1);
      for (let i = 1; i <= strakesCount; i++) {
        const sx = -exitWidthM / 2 + i * strakeSpacing;
        const strakeGeo = new THREE.BoxGeometry(0.010, 0.12, 0.68);
        const strake = new THREE.Mesh(strakeGeo, carbonMat);
        strake.position.set(sx, -0.05, 0.34);
        this.diffuserPivot.add(strake);
      }

      // Central FIA Motorsport Flashing Rain Light
      const rainLightGeo = new THREE.BoxGeometry(0.08, 0.04, 0.03);
      const rainLight = new THREE.Mesh(rainLightGeo, this.materials.ledRed);
      rainLight.position.set(0, 0.02, 0.68);
      this.diffuserPivot.add(rainLight);
    }

    // 3b. UNDERBODY VENTURI TUNNELS (GT3 spec: 4-tunnel configuration)
    if (aero.underbodyVenturiTunnels) {
      const tunnelCount = Math.max(2, Math.min(6, aero.venturiTunnelCount || 4));
      const tunnelSpacing = (tf * 1.6) / tunnelCount;
      const tunnelGeo = new THREE.BoxGeometry(0.08, 0.06, wb * 0.70);
      for (let i = 0; i < tunnelCount; i++) {
        const tx = -(tf * 0.8) + i * tunnelSpacing + tunnelSpacing * 0.5;
        const channel = new THREE.Mesh(tunnelGeo, carbonMat);
        channel.position.set(tx, rh + 0.045, wb * 0.18);
        this.diffuserPivot.add(channel);
      }
    }

    // 4. DIVE PLANES / CANARDS (Dual-Tier Curved Carbon Vanes)
    if (aero.frontCanards) {
      const canardZ = -(wb * 0.5) - 0.52;
      const canardY = rh + 0.30;
      const angleRad = (aero.frontCanardAngleDeg * Math.PI) / 180;

      const canardGeo = new THREE.BoxGeometry(0.22, 0.012, 0.16);

      this.leftCanardPivot.position.set(-tf * 0.94, canardY, canardZ);
      this.leftCanardPivot.rotation.z = -0.15;
      this.leftCanardPivot.rotation.x = -angleRad;
      const canL = new THREE.Mesh(canardGeo, carbonMat);
      this.leftCanardPivot.add(canL);

      this.rightCanardPivot.position.set(tf * 0.94, canardY, canardZ);
      this.rightCanardPivot.rotation.z = 0.15;
      this.rightCanardPivot.rotation.x = -angleRad;
      const canR = new THREE.Mesh(canardGeo, carbonMat);
      this.rightCanardPivot.add(canR);
    }
  }

  private initMaterials() {
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x14161b,
      roughness: 0.32,
      metalness: 0.88,
    });

    this.materials.carbonGloss = new THREE.MeshPhysicalMaterial({
      color: 0x111317,
      roughness: 0.12,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    this.materials.aluminum = new THREE.MeshStandardMaterial({
      color: 0xb0bccd,
      roughness: 0.2,
      metalness: 0.95,
    });

    this.materials.castIron = new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.65,
      metalness: 0.78,
    });

    this.materials.gold = new THREE.MeshStandardMaterial({
      color: 0xe5b838,
      roughness: 0.25,
      metalness: 0.92,
    });

    this.materials.redAnodized = new THREE.MeshStandardMaterial({
      color: 0xde1a1a,
      roughness: 0.22,
      metalness: 0.88,
    });

    this.materials.blueAnodized = new THREE.MeshStandardMaterial({
      color: 0x1d64ec,
      roughness: 0.22,
      metalness: 0.88,
    });

    this.materials.titaniumBurnt = new THREE.MeshPhysicalMaterial({
      color: 0x7c8ba1,
      roughness: 0.18,
      metalness: 0.95,
      sheen: 0.8,
      sheenColor: new THREE.Color(0x818cf8),
    });

    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.05,
      metalness: 0.99,
    });

    this.materials.tireRubber = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      roughness: 0.92,
      metalness: 0.08,
    });

    this.materials.brakeCarbonCeramic = new THREE.MeshStandardMaterial({
      color: 0x1e2026,
      roughness: 0.42,
      metalness: 0.65,
    });

    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.25,
      transparent: true,
      roughness: 0.04,
      metalness: 0.05,
      ior: 1.52,
      thickness: 0.006,
    });

    this.materials.glassTinted = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transmission: 0.75,
      opacity: 0.55,
      transparent: true,
      roughness: 0.06,
      metalness: 0.1,
      ior: 1.54,
      thickness: 0.008,
    });

    this.materials.ledWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.materials.ledCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.materials.ledRed = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    this.materials.ledAmber = new THREE.MeshBasicMaterial({ color: 0xff9900 });
  }

  // ==========================================================================
  // PROCEDURAL 3D SUBASSEMBLY BUILDERS (HIGH FIDELITY CAD GRADE)
  // ==========================================================================

  private buildChassis3D(c: ChassisConfig3D, isPreview: boolean): THREE.Group {
    const group = new THREE.Group();

    // Map vehicle chassis configuration to authored high-fidelity GLB model
    let chassisGlbUri = "/models/chassis/sports_car_chassis_01.glb";
    if (c.architecture === "carbon_tub" || c.type === "hypercar" || c.type === "supercar") {
      chassisGlbUri = "/models/chassis/supercar_monocoque_chassis_01.glb";
    } else if (c.architecture === "tubular_cradle" || c.type === "gt3" || c.type === "track") {
      chassisGlbUri = "/models/chassis/gt3_race_chassis_01.glb";
    } else if (c.architecture === "ev_skateboard") {
      chassisGlbUri = "/models/chassis/ev_skateboard_chassis_01.glb";
    } else if (c.architecture === "ladder") {
      chassisGlbUri = "/models/chassis/offroad_ladder_chassis_01.glb";
    } else if (c.architecture === "monocoque" || c.type === "sedan") {
      chassisGlbUri = "/models/chassis/hatchback_chassis_01.glb";
    }

    // Trigger async preload
    this.preloadGlbChassisOrBody(chassisGlbUri);

    const metallurgyMat = this.chassisMetallurgyMode !== "default"
      ? AutomotivePBRMaterialSystem.getChassisMetallurgyMaterial(this.chassisMetallurgyMode, true)
      : null;

    const feaStressMat = this.showFeaStress
      ? AutomotivePBRMaterialSystem.getFeaLoadCaseStressMaterial(this.activeFeaLoadCase, 0.72)
      : null;

    const mat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, wireframe: true })
      : feaStressMat || metallurgyMat || (c.architecture === "carbon_tub" ? AutomotivePBRMaterialSystem.getMaterialForGrade("ceramic") : this.materials.carbon);

    const aluMat = isPreview ? mat : feaStressMat || metallurgyMat || this.materials.aluminum;
    const chromeMat = isPreview ? mat : feaStressMat || metallurgyMat || this.materials.chrome;

    const wb = c.wheelbaseMm / 1000;
    const tf = (c.frontTrackMm / 2) / 1000;
    const rh = c.rideHeightMm / 1000;

    // Check if authored GLB chassis frame is cached
    const cachedGlb = this.glbCache.get(chassisGlbUri);
    if (cachedGlb && !isPreview) {
      const glbInstance = cachedGlb.clone();
      glbInstance.scale.set(tf * 1.1, 0.95, wb * 0.42);
      glbInstance.position.set(0, rh + 0.18, -(wb * 0.05));
      if (this.showFeaStress) {
        glbInstance.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const isHighStressNode = child.name.includes("Tower") || child.name.includes("Cradle") || child.name.includes("Wishbone") || child.name.includes("Crash") || child.name.includes("Hoop");
            const nodeRatio = isHighStressNode ? 0.88 : child.name.includes("Crossmember") ? 0.62 : 0.35;
            child.material = AutomotivePBRMaterialSystem.getFeaLoadCaseStressMaterial(this.activeFeaLoadCase, nodeRatio);
          }
        });
      } else if (metallurgyMat) {
        glbInstance.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = metallurgyMat;
          }
        });
      }
      group.add(glbInstance);
    }

    // 1. Carbon Monocell Cockpit Tub
    const tubGeo = new THREE.BoxGeometry(tf * 1.55, 0.48, wb * 0.72);
    const tub = new THREE.Mesh(tubGeo, mat);
    tub.position.set(0, rh + 0.26, -(wb * 0.05));
    group.add(tub);

    // 2. Cockpit Ingress Recess
    const cockpitCutGeo = new THREE.BoxGeometry(tf * 1.25, 0.35, wb * 0.52);
    const cockpitCut = new THREE.Mesh(cockpitCutGeo, this.materials.castIron);
    cockpitCut.position.set(0, rh + 0.38, -(wb * 0.05));
    group.add(cockpitCut);

    // 3. Left & Right Structural Box Sills with Impact Honeycomb
    const sillGeo = new THREE.BoxGeometry(0.18, 0.26, wb * 0.88);
    const sillL = new THREE.Mesh(sillGeo, mat);
    sillL.position.set(-tf * 0.88, rh + 0.16, 0);
    const sillR = new THREE.Mesh(sillGeo, mat);
    sillR.position.set(tf * 0.88, rh + 0.16, 0);
    group.add(sillL, sillR);

    // 4. Front Crash Structure (Aluminum Honeycomb Cone)
    const crashBoxGeo = new THREE.ConeGeometry(0.18, 0.42, 6);
    const crashBox = new THREE.Mesh(crashBoxGeo, aluMat);
    crashBox.rotation.x = -Math.PI / 2;
    crashBox.position.set(0, rh + 0.22, -(wb * 0.5) - 0.22);
    group.add(crashBox);

    // 5. Front Subframe Extrusions & Suspension Hardpoint Clevises
    const railGeo = new THREE.BoxGeometry(0.1, 0.12, wb * 0.42);
    const railL = new THREE.Mesh(railGeo, aluMat);
    railL.position.set(-tf * 0.52, rh + 0.18, -(wb * 0.42));
    const railR = new THREE.Mesh(railGeo, aluMat);
    railR.position.set(tf * 0.52, rh + 0.18, -(wb * 0.42));
    group.add(railL, railR);

    // Suspension Clevis Mounts (Titanium)
    const clevisGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06);
    const clevisL = new THREE.Mesh(clevisGeo, aluMat);
    clevisL.position.set(-tf * 0.52, rh + 0.24, -(wb * 0.5));
    const clevisR = new THREE.Mesh(clevisGeo, aluMat);
    clevisR.position.set(tf * 0.52, rh + 0.24, -(wb * 0.5));
    group.add(clevisL, clevisR);

    // 6. Rear Engine Bay Subframe Cradle (Tubular Chromoly)
    const cradleGeo = new THREE.BoxGeometry(tf * 1.35, 0.16, wb * 0.46);
    const rearCradle = new THREE.Mesh(cradleGeo, aluMat);
    rearCradle.position.set(0, rh + 0.18, (wb * 0.46));
    group.add(rearCradle);

    // 7. Structural Bulkheads
    const bhGeo = new THREE.BoxGeometry(tf * 1.5, 0.45, 0.08);
    const bhFront = new THREE.Mesh(bhGeo, mat);
    bhFront.position.set(0, rh + 0.28, -(wb * 0.38));
    const bhRear = new THREE.Mesh(bhGeo, mat);
    bhRear.position.set(0, rh + 0.32, (wb * 0.32));
    group.add(bhFront, bhRear);

    // 8. FIA Roll Cage Primary Hoops & Diagonals
    const hoopGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.72, 12);
    const hoopL = new THREE.Mesh(hoopGeo, chromeMat);
    hoopL.position.set(-tf * 0.68, rh + 0.62, 0.05);
    const hoopR = new THREE.Mesh(hoopGeo, chromeMat);
    hoopR.position.set(tf * 0.68, rh + 0.62, 0.05);

    const crossBarGeo = new THREE.CylinderGeometry(0.024, 0.024, tf * 1.36, 12);
    const crossBar = new THREE.Mesh(crossBarGeo, chromeMat);
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, rh + 0.95, 0.05);
    group.add(hoopL, hoopR, crossBar);

    // 9. Aerodynamic Flat Undertray Floor
    const floorGeo = new THREE.BoxGeometry(tf * 1.72, 0.025, wb * 1.12);
    const floor = new THREE.Mesh(floorGeo, mat);
    floor.position.set(0, rh + 0.02, 0);
    group.add(floor);

    return group;
  }

  private buildEngine3D(e: EngineConfig, pos: EnginePosition, isPreview: boolean): THREE.Group {
    const group = new THREE.Group();
    const castMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0xffa000, transparent: true, opacity: 0.55, wireframe: true })
      : this.materials.castIron;
    const redMat = isPreview ? castMat : this.materials.redAnodized;
    const chromeMat = isPreview ? castMat : this.materials.chrome;
    const goldMat = isPreview ? castMat : this.materials.gold;
    const carbonMat = isPreview ? castMat : this.materials.carbon;
    const titMat = isPreview ? castMat : this.materials.titaniumBurnt;

    // 1. Engine Block with Machined Ribs
    const blockGeo = new THREE.BoxGeometry(0.54, 0.38, 0.64);
    const block = new THREE.Mesh(blockGeo, castMat);
    group.add(block);

    // Deep Sump Oil Pan with Baffles
    const sumpGeo = new THREE.BoxGeometry(0.46, 0.12, 0.58);
    const sump = new THREE.Mesh(sumpGeo, this.materials.aluminum);
    sump.position.set(0, -0.25, 0);
    group.add(sump);

    // 2. Dual Cylinder Heads (V-Angle configuration)
    const headGeo = new THREE.BoxGeometry(0.25, 0.18, 0.60);
    const headL = new THREE.Mesh(headGeo, redMat);
    headL.rotation.z = Math.PI / 5.5;
    headL.position.set(-0.24, 0.24, 0);
    const headR = new THREE.Mesh(headGeo, redMat);
    headR.rotation.z = -Math.PI / 5.5;
    headR.position.set(0.24, 0.24, 0);
    group.add(headL, headR);

    // Spark Plug Coils & Wire Covers
    for (let i = -2; i <= 2; i++) {
      const coilGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.05, 8);
      const coilL = new THREE.Mesh(coilGeo, goldMat);
      coilL.position.set(-0.25, 0.34, i * 0.11);
      const coilR = new THREE.Mesh(coilGeo, goldMat);
      coilR.position.set(0.25, 0.34, i * 0.11);
      group.add(coilL, coilR);
    }

    // 3. Carbon Fiber Intake Plenum with Twin CNC Throttle Bodies
    const plenumGeo = new THREE.BoxGeometry(0.32, 0.16, 0.52);
    const plenum = new THREE.Mesh(plenumGeo, carbonMat);
    plenum.position.set(0, 0.36, 0);
    group.add(plenum);

    const throttleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
    const throttleL = new THREE.Mesh(throttleGeo, this.materials.aluminum);
    throttleL.rotation.x = Math.PI / 2;
    throttleL.position.set(-0.1, 0.36, -0.32);
    const throttleR = new THREE.Mesh(throttleGeo, this.materials.aluminum);
    throttleR.rotation.x = Math.PI / 2;
    throttleR.position.set(0.1, 0.36, -0.32);
    group.add(throttleL, throttleR);

    // 4. Twin Turbochargers with Wastegate Actuators & Boost Pipes
    if (e.intake.includes("turbo") || e.intake === "bi_turbo" || e.intake === "compound_turbo") {
      const turboGeo = new THREE.TorusGeometry(0.09, 0.045, 12, 24);
      const turboL = new THREE.Mesh(turboGeo, goldMat);
      turboL.rotation.y = Math.PI / 2;
      turboL.position.set(-0.36, 0.08, 0.16);

      const turboR = new THREE.Mesh(turboGeo, goldMat);
      turboR.rotation.y = Math.PI / 2;
      turboR.position.set(0.36, 0.08, 0.16);

      // Wastegate Actuators
      const wgGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8);
      const wgL = new THREE.Mesh(wgGeo, this.materials.aluminum);
      wgL.position.set(-0.38, 0.18, 0.16);
      const wgR = new THREE.Mesh(wgGeo, this.materials.aluminum);
      wgR.position.set(0.38, 0.18, 0.16);

      // Titanium Charge Pipes
      const pipeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 12);
      const pipeL = new THREE.Mesh(pipeGeo, titMat);
      pipeL.rotation.z = Math.PI / 4;
      pipeL.position.set(-0.25, 0.22, -0.05);
      const pipeR = new THREE.Mesh(pipeGeo, titMat);
      pipeR.rotation.z = -Math.PI / 4;
      pipeR.position.set(0.25, 0.22, -0.05);

      group.add(turboL, turboR, wgL, wgR, pipeL, pipeR);
    }

    // 5. Serpentine Belt Pulleys (Kinematic Rotation Target)
    this.pulleyMeshes = [];
    const mainPulleyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24);
    const mainPulley = new THREE.Mesh(mainPulleyGeo, chromeMat);
    mainPulley.rotation.x = Math.PI / 2;
    mainPulley.position.set(0, -0.08, -0.34);
    this.pulleyMeshes.push(mainPulley);

    const altPulleyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16);
    const altPulley = new THREE.Mesh(altPulleyGeo, this.materials.aluminum);
    altPulley.rotation.x = Math.PI / 2;
    altPulley.position.set(0.22, 0.12, -0.34);
    this.pulleyMeshes.push(altPulley);

    const wpPulleyGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.035, 16);
    const wpPulley = new THREE.Mesh(wpPulleyGeo, this.materials.aluminum);
    wpPulley.rotation.x = Math.PI / 2;
    wpPulley.position.set(-0.22, 0.05, -0.34);
    this.pulleyMeshes.push(wpPulley);

    group.add(mainPulley, altPulley, wpPulley);

    // Serpentine Belt Geometry
    const beltGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 32);
    const belt = new THREE.Mesh(beltGeo, this.materials.tireRubber);
    belt.position.set(0, 0.02, -0.34);
    group.add(belt);

    // 6. Inconel Exhaust Manifold Headers
    const headerGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.38, 12);
    const headerL = new THREE.Mesh(headerGeo, titMat);
    headerL.rotation.z = Math.PI / 3;
    headerL.position.set(-0.35, -0.06, 0.05);
    const headerR = new THREE.Mesh(headerGeo, titMat);
    headerR.rotation.z = -Math.PI / 3;
    headerR.position.set(0.35, -0.06, 0.05);
    group.add(headerL, headerR);

    return group;
  }

  private buildTransmission3D(
    type: string,
    diffCoolingFins: boolean,
    cvBoots: boolean,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const aluMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, wireframe: true })
      : this.materials.aluminum;
    const ironMat = isPreview ? aluMat : this.materials.castIron;
    const chromeMat = isPreview ? aluMat : this.materials.chrome;

    // 1. Transaxle Bellhousing with Hex Perimeter Bolts
    const bellGeo = new THREE.ConeGeometry(0.28, 0.26, 24);
    const bell = new THREE.Mesh(bellGeo, aluMat);
    bell.rotation.x = Math.PI / 2;
    bell.position.set(0, 0, -0.13);
    group.add(bell);

    // 2. Main Transaxle Housing with Structural Ribs
    const caseGeo = new THREE.BoxGeometry(0.32, 0.28, 0.48);
    const gearbox = new THREE.Mesh(caseGeo, aluMat);
    gearbox.position.set(0, 0, 0.2);
    group.add(gearbox);

    // Top Hydraulic Valve Actuator Block (DCT / Sequential control)
    const valveGeo = new THREE.BoxGeometry(0.18, 0.08, 0.22);
    const valveBlock = new THREE.Mesh(valveGeo, this.materials.redAnodized);
    valveBlock.position.set(0, 0.18, 0.15);
    group.add(valveBlock);

    // 3. Limited Slip Differential Housing
    const diffGeo = new THREE.SphereGeometry(0.16, 20, 20);
    const diff = new THREE.Mesh(diffGeo, ironMat);
    diff.position.set(0, 0, 0.5);
    group.add(diff);

    // 3b. Longitudinal Differential Cooling Fins (thermal management block)
    if (diffCoolingFins && !isPreview) {
      const finGeo = new THREE.BoxGeometry(0.02, 0.09, 0.26);
      for (let i = -2; i <= 2; i++) {
        const finL = new THREE.Mesh(finGeo, ironMat);
        finL.position.set(-0.155, 0.01, 0.5 + i * 0.05);
        finL.rotation.x = Math.PI / 2;
        const finR = new THREE.Mesh(finGeo, ironMat);
        finR.position.set(0.155, 0.01, 0.5 + i * 0.05);
        finR.rotation.x = Math.PI / 2;
        group.add(finL, finR);
      }
    }

    // 4. Heavy-Duty CV-Joint Half-Shafts
    const axleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.62, 16);
    const axleShaft = new THREE.Mesh(axleGeo, chromeMat);
    axleShaft.rotation.z = Math.PI / 2;
    axleShaft.position.set(0, 0, 0.5);
    group.add(axleShaft);

    // 4b. Accordion CV Boots (rubber bellows protecting CV joints)
    if (cvBoots) {
      const bootGeo = new THREE.TorusGeometry(0.055, 0.02, 10, 16);
      const bootL = new THREE.Mesh(bootGeo, isPreview ? chromeMat : this.materials.tireRubber);
      bootL.rotation.y = Math.PI / 2;
      bootL.position.set(-0.22, 0, 0.5);
      const bootR = new THREE.Mesh(bootGeo, isPreview ? chromeMat : this.materials.tireRubber);
      bootR.rotation.y = Math.PI / 2;
      bootR.position.set(0.22, 0, 0.5);
      group.add(bootL, bootR);
    }

    // 5. Driveshaft with Central Carrier Bearing
    const driveGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 16);
    this.driveshaftMesh = new THREE.Mesh(driveGeo, chromeMat);
    this.driveshaftMesh.rotation.x = Math.PI / 2;
    this.driveshaftMesh.position.set(0, 0, -0.65);
    group.add(this.driveshaftMesh);

    return group;
  }

  private buildSuspension3D(
    type: string,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    activeCoilovers: boolean,
    arbFrontNmPerDeg: number,
    arbRearNmPerDeg: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const carbonArmMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, wireframe: true })
      : this.materials.carbon;
    const springMat = isPreview ? carbonArmMat : activeCoilovers ? this.materials.blueAnodized : this.materials.gold;
    const damperBodyMat = isPreview ? carbonArmMat : activeCoilovers ? this.materials.redAnodized : this.materials.aluminum;
    const aluMat = isPreview ? carbonArmMat : this.materials.aluminum;
    const goldMat = isPreview ? carbonArmMat : this.materials.gold;

    const corners = [
      { x: -tf, z: -(wb * 0.5), isFront: true, isLeft: true },
      { x: tf, z: -(wb * 0.5), isFront: true, isLeft: false },
      { x: -tr, z: (wb * 0.5), isFront: false, isLeft: true },
      { x: tr, z: (wb * 0.5), isFront: false, isLeft: false },
    ];

    corners.forEach((c) => {
      const cornerGroup = new THREE.Group();
      cornerGroup.position.set(c.x, rh + 0.18, c.z);

      // 1. Aero Carbon Upper Wishbone (A-Arm)
      const uArmGeo = new THREE.BoxGeometry(0.28, 0.02, 0.18);
      const upperArm = new THREE.Mesh(uArmGeo, carbonArmMat);
      upperArm.rotation.z = c.isLeft ? 0.28 : -0.28;
      upperArm.position.set(c.isLeft ? 0.14 : -0.14, 0.09, 0);

      // 2. Lower Wishbone
      const lArmGeo = new THREE.BoxGeometry(0.32, 0.025, 0.22);
      const lowerArm = new THREE.Mesh(lArmGeo, carbonArmMat);
      lowerArm.rotation.z = c.isLeft ? -0.12 : 0.12;
      lowerArm.position.set(c.isLeft ? 0.15 : -0.15, -0.07, 0);

      // 3. Inboard Pushrod Linkage with Titanium Spherical Bearings
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12);
      const pushrod = new THREE.Mesh(rodGeo, this.materials.chrome);
      pushrod.rotation.z = c.isLeft ? 0.65 : -0.65;
      pushrod.position.set(c.isLeft ? 0.12 : -0.12, 0.12, 0);

      // 4. Inboard Rocker Bellcrank (Anodized Gold)
      const rockerGeo = new THREE.BoxGeometry(0.08, 0.05, 0.06);
      const rocker = new THREE.Mesh(rockerGeo, goldMat);
      rocker.position.set(c.isLeft ? 0.26 : -0.26, 0.22, 0);

      // 5. Remote-Reservoir Inboard Coilover Damper with Piggyback Canister
      const shockBodyGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.26, 16);
      const shockBody = new THREE.Mesh(shockBodyGeo, damperBodyMat);
      shockBody.rotation.z = c.isLeft ? -0.32 : 0.32;
      shockBody.position.set(c.isLeft ? 0.32 : -0.32, 0.24, 0);

      const canisterGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12);
      const canister = new THREE.Mesh(canisterGeo, goldMat);
      canister.position.set(c.isLeft ? 0.35 : -0.35, 0.32, 0.04);

      cornerGroup.add(upperArm, lowerArm, pushrod, rocker, shockBody, canister);

      // 5b. Active Coilover Electronics: ride-height sensor puck + damping actuator
      if (activeCoilovers && !isPreview) {
        const sensorGeo = new THREE.BoxGeometry(0.05, 0.03, 0.05);
        const sensor = new THREE.Mesh(sensorGeo, this.materials.ledAmber);
        sensor.position.set(c.isLeft ? 0.3 : -0.3, 0.1, 0.06);
        const actuatorGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 10);
        const actuator = new THREE.Mesh(actuatorGeo, springMat);
        actuator.position.set(c.isLeft ? 0.38 : -0.38, 0.28, -0.03);
        cornerGroup.add(sensor, actuator);
      }

      // 6. Upright / Knuckle Hub Carrier (Billet 6061-T6 Aluminum)
      const hubGeo = new THREE.BoxGeometry(0.09, 0.22, 0.12);
      const hub = new THREE.Mesh(hubGeo, aluMat);
      hub.position.set(0, 0.01, 0);

      cornerGroup.add(hub);
      group.add(cornerGroup);
    });

    // 7. Tubular Front & Rear Anti-Roll Bars — diameter scales with stiffness setting
    const frontBarRadius = 0.008 + Math.min(1, Math.max(0, (arbFrontNmPerDeg || 60) / 220)) * 0.012;
    const rearBarRadius = 0.008 + Math.min(1, Math.max(0, (arbRearNmPerDeg || 50) / 220)) * 0.012;

    const arbFrontGeo = new THREE.CylinderGeometry(frontBarRadius, frontBarRadius, tf * 1.3, 12);
    const arbFront = new THREE.Mesh(arbFrontGeo, this.materials.redAnodized);
    arbFront.rotation.z = Math.PI / 2;
    arbFront.position.set(0, rh + 0.28, -(wb * 0.46));

    const arbRearGeo = new THREE.CylinderGeometry(rearBarRadius, rearBarRadius, tr * 1.3, 12);
    const arbRear = new THREE.Mesh(arbRearGeo, this.materials.redAnodized);
    arbRear.rotation.z = Math.PI / 2;
    arbRear.position.set(0, rh + 0.28, (wb * 0.46));

    group.add(arbFront, arbRear);

    // 7b. Adjustable Drop Links linking ARB ends to the anti-roll levers
    if (!isPreview) {
      const dropLinkGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.14, 8);
      [
        { halfTrack: tf, zPos: -(wb * 0.46) },
        { halfTrack: tr, zPos: wb * 0.46 },
      ].forEach((axle) => {
        [-1, 1].forEach((side) => {
          const link = new THREE.Mesh(dropLinkGeo, this.materials.chrome);
          link.position.set(side * axle.halfTrack * 0.72, rh + 0.21, axle.zPos);
          group.add(link);
        });
      });
    }

    return group;
  }

  private buildBrakes3D(
    type: string,
    caliperColorHex: string,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const rotorMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 })
      : this.materials.brakeCarbonCeramic;

    const caliperMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(caliperColorHex || "#ef4444"),
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
    });

    const corners = [
      { x: -tf, z: -(wb * 0.5), isFront: true, isLeft: true },
      { x: tf, z: -(wb * 0.5), isFront: true, isLeft: false },
      { x: -tr, z: (wb * 0.5), isFront: false, isLeft: true },
      { x: tr, z: (wb * 0.5), isFront: false, isLeft: false },
    ];

    corners.forEach((c) => {
      const corner = new THREE.Group();
      corner.position.set(c.x, rh + 0.18, c.z);

      // 1. 410mm Carbon-Ceramic Ventilated Rotor (Cross-Drilled)
      const radius = c.isFront ? 0.21 : 0.19;
      const rotorThickness = 0.038;
      const rotorGeo = new THREE.CylinderGeometry(radius, radius, rotorThickness, 36);
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.rotation.z = Math.PI / 2;
      corner.add(rotor);

      // Aluminum Bell / Rotor Hat with weight reduction scallops
      const hatGeo = new THREE.CylinderGeometry(0.095, 0.095, rotorThickness + 0.006, 24);
      const hat = new THREE.Mesh(hatGeo, this.materials.aluminum);
      hat.rotation.z = Math.PI / 2;
      corner.add(hat);

      // 10 Floating Titanium Drive Bobbins / Drive Bushings
      for (let b = 0; b < 10; b++) {
        const bobbinAngle = (b * Math.PI * 2) / 10;
        const bobbinGeo = new THREE.CylinderGeometry(0.007, 0.007, rotorThickness + 0.008, 8);
        const bobbin = new THREE.Mesh(bobbinGeo, this.materials.chrome);
        bobbin.rotation.z = Math.PI / 2;
        bobbin.position.set(0, Math.sin(bobbinAngle) * 0.105, Math.cos(bobbinAngle) * 0.105);
        corner.add(bobbin);
      }

      // 2. Sculpted Brembo-Style 8-Piston Monobloc Caliper
      const caliperGeo = new THREE.BoxGeometry(0.075, 0.15, 0.25);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(c.isLeft ? -0.025 : 0.025, 0.12, 0.06);

      // Titanium Pad Bridge Pins & Bleed Screws
      for (let p = 0; p < 2; p++) {
        const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8);
        const pin = new THREE.Mesh(pinGeo, this.materials.chrome);
        pin.rotation.z = Math.PI / 2;
        pin.position.set(c.isLeft ? -0.025 : 0.025, 0.17, (p - 0.5) * 0.09 + 0.06);
        corner.add(pin);
      }

      // Dual Bleeder Screws
      const bleedGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.02, 6);
      const bleed = new THREE.Mesh(bleedGeo, this.materials.gold);
      bleed.position.set(c.isLeft ? -0.025 : 0.025, 0.20, 0.06);
      corner.add(caliper, bleed);

      // 3. Braided Stainless Steel Hydraulic Line with Banjo Bolt
      const hoseCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(c.isLeft ? -0.025 : 0.025, 0.16, 0.02),
        new THREE.Vector3(c.isLeft ? 0.03 : -0.03, 0.19, -0.04),
        new THREE.Vector3(c.isLeft ? 0.05 : -0.05, 0.16, -0.10)
      );
      const hoseGeo = new THREE.TubeGeometry(hoseCurve, 12, 0.005, 6, false);
      const hose = new THREE.Mesh(hoseGeo, this.materials.chrome);
      corner.add(hose);

      group.add(corner);
    });

    return group;
  }

  private buildWheels3D(
    style: string,
    compound: string,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const tireMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45, wireframe: true })
      : new THREE.MeshPhysicalMaterial({
          color: 0x14161b,
          roughness: 0.82,
          metalness: 0.04,
          clearcoat: 0.15,
          clearcoatRoughness: 0.6,
        });

    const rimMat = isPreview
      ? tireMat
      : new THREE.MeshPhysicalMaterial({
          color: 0xd4d4d8,
          roughness: 0.10,
          metalness: 0.95,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          reflectivity: 0.98,
        });

    const corners = [
      { x: -tf - 0.04, z: -(wb * 0.5), isFront: true, isLeft: true },
      { x: tf + 0.04, z: -(wb * 0.5), isFront: true, isLeft: false },
      { x: -tr - 0.04, z: (wb * 0.5), isFront: false, isLeft: true },
      { x: tr + 0.04, z: (wb * 0.5), isFront: false, isLeft: false },
    ];

    corners.forEach((c) => {
      const wheel = new THREE.Group();
      wheel.position.set(c.x, rh + 0.18, c.z);

      const tireRadius = c.isFront ? 0.33 : 0.35;
      const tireWidth = c.isFront ? 0.27 : 0.33;
      const rimRadius = c.isFront ? 0.245 : 0.255;

      // 1. Competition Michelin Pilot Sport Cup 2 Tire (Curved Sidewall Profile)
      const tireTorusGeo = new THREE.TorusGeometry(tireRadius * 0.78, tireRadius * 0.24, 16, 36);
      const tireTorus = new THREE.Mesh(tireTorusGeo, tireMat);
      tireTorus.scale.set(1.0, 1.0, tireWidth / (tireRadius * 0.48));
      wheel.add(tireTorus);

      // Tire Center Tread Band with Longitudinal Sipes
      const treadGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth * 0.82, 36, 1, true);
      const tread = new THREE.Mesh(treadGeo, tireMat);
      tread.rotation.z = Math.PI / 2;
      wheel.add(tread);

      // 2. Forged Concave Monoblock Rim Outer Barrel & Polished Lip
      const rimBarrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius * 0.94, tireWidth * 0.95, 32, 1, true);
      const rimBarrel = new THREE.Mesh(rimBarrelGeo, rimMat);
      rimBarrel.rotation.z = Math.PI / 2;
      wheel.add(rimBarrel);

      const rimLipGeo = new THREE.TorusGeometry(rimRadius, 0.012, 12, 32);
      const rimLip = new THREE.Mesh(rimLipGeo, rimMat);
      rimLip.position.set(c.isLeft ? -tireWidth * 0.46 : tireWidth * 0.46, 0, 0);
      wheel.add(rimLip);

      // 3. Forged Concave 10-Spoke Assembly (Deep Dish Inward Slope)
      const spokeCount = 10;
      const spokeLength = rimRadius * 0.88;
      for (let i = 0; i < spokeCount; i++) {
        const spokeAngle = (i * Math.PI * 2) / spokeCount;
        const spokeGeo = new THREE.BoxGeometry(0.016, 0.022, spokeLength);
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = spokeAngle;
        // Inward concave tilt
        spoke.rotation.y = c.isLeft ? 0.12 : -0.12;
        spoke.position.set(
          c.isLeft ? -tireWidth * 0.36 : tireWidth * 0.36,
          (Math.sin(spokeAngle) * spokeLength) / 2,
          (Math.cos(spokeAngle) * spokeLength) / 2
        );
        wheel.add(spoke);
      }

      // 4. Center Hub & Anodized Centerlock Nut (Red on Left, Blue on Right)
      const centerlockGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.035, 6);
      const centerlockMat = c.isLeft ? this.materials.redAnodized : this.materials.blueAnodized;
      const centerlock = new THREE.Mesh(centerlockGeo, centerlockMat);
      centerlock.rotation.z = Math.PI / 2;
      centerlock.position.set(c.isLeft ? -tireWidth * 0.48 : tireWidth * 0.48, 0, 0);
      wheel.add(centerlock);

      // Stainless Steel Centerlock Safety Lock Ring Pin
      const pinRingGeo = new THREE.TorusGeometry(0.028, 0.004, 8, 16);
      const pinRing = new THREE.Mesh(pinRingGeo, this.materials.chrome);
      pinRing.position.set(c.isLeft ? -tireWidth * 0.50 : tireWidth * 0.50, 0, 0);
      wheel.add(pinRing);

      group.add(wheel);
    });

    return group;
  }

  private buildBodyPanels3D(
    state: InstalledSubsystemsState,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();

    // Clear previous closure meshes from pivots
    while (this.leftDoorPivot.children.length > 0) this.leftDoorPivot.remove(this.leftDoorPivot.children[0]);
    while (this.rightDoorPivot.children.length > 0) this.rightDoorPivot.remove(this.rightDoorPivot.children[0]);
    while (this.bonnetPivot.children.length > 0) this.bonnetPivot.remove(this.bonnetPivot.children[0]);
    while (this.dickyPivot.children.length > 0) this.dickyPivot.remove(this.dickyPivot.children[0]);

    const finish = state.paintFinish;
    let bodyMat: THREE.Material;
    if (isPreview) {
      bodyMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55, wireframe: false });
    } else if (finish === "metallic") {
      bodyMat = AutomotivePBRMaterialSystem.getMetallicFlakePaint(state.paintColor || "#22d3ee", 0.12, 0.85);
    } else if (finish === "pearl") {
      bodyMat = AutomotivePBRMaterialSystem.getPearlescentPaint(state.paintColor || "#0ea5e9", "#c084fc");
    } else if (finish === "matte") {
      bodyMat = AutomotivePBRMaterialSystem.getMatteSatinPaint(state.paintColor || "#1e293b");
    } else if ((finish as string) === "candy") {
      bodyMat = AutomotivePBRMaterialSystem.getCandyApplePaint(state.paintColor || "#b91c1c");
    } else if ((finish as string) === "chameleon") {
      bodyMat = AutomotivePBRMaterialSystem.getChameleonPaint(state.paintColor || "#8b5cf6", "#06b6d4");
    } else if ((finish as string) === "carbon") {
      bodyMat = AutomotivePBRMaterialSystem.getForgedCarbon(true);
    } else {
      bodyMat = AutomotivePBRMaterialSystem.getAutomotivePaint(state.paintColor || "#e11d48", 0.05, 0.92);
    }

    const carbonMat = isPreview ? bodyMat : this.materials.carbonGloss;
    const trimMat = isPreview ? bodyMat : this.materials.castIron;

    // Determine and preload matching full car body GLB model
    let bodyGlbUri = "/models/exterior/hypercar_apex_gt3.glb";
    if (state.chassis.type === "coupe") {
      bodyGlbUri = "/models/exterior/sports_coupe_gt.glb";
    } else if (state.chassis.type === "sedan") {
      bodyGlbUri = "/models/exterior/hatchback_ford_escort.glb";
    }
    this.preloadGlbChassisOrBody(bodyGlbUri);

    // If full vehicle GLB is cached and not in preview, mount it with active paint
    const cachedBodyGlb = this.glbCache.get(bodyGlbUri);
    if (cachedBodyGlb && !isPreview) {
      const bodyInstance = cachedBodyGlb.clone();
      bodyInstance.scale.set(tf * 1.05, 0.96, wb * 0.40);
      bodyInstance.position.set(0, rh + 0.16, 0);
      bodyInstance.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name.includes("Paint") || child.name.includes("Body") || child.name.includes("Fuselage") || child.name.includes("Fender") || child.name.includes("Haunch")) {
            child.material = bodyMat;
          } else if (child.name.includes("Glass") || child.name.includes("Canopy") || child.name.includes("Windshield")) {
            child.material = AutomotivePBRMaterialSystem.getDielectricGlass("#0f172a", 0.65, 1.52);
          } else if (child.name.includes("Carbon") || child.name.includes("Splitter") || child.name.includes("Wing") || child.name.includes("Diffuser")) {
            child.material = AutomotivePBRMaterialSystem.getCarbonFiber(true);
          }
        }
      });
      group.add(bodyInstance);
    }

    // ── 1. SCULPTED MAIN MONOCOQUE FUSELAGE & COCKPIT GREENHOUSE ──
    // Lower aerodynamic tub with side waistline taper (Coke-bottle styling)
    const tubLength = wb * 1.15;
    const tubWidth = tf * 1.62;
    const tubGeo = new THREE.CylinderGeometry(tubWidth * 0.48, tubWidth * 0.52, tubLength, 16);
    const tubMesh = new THREE.Mesh(tubGeo, bodyMat);
    tubMesh.rotation.x = Math.PI / 2;
    tubMesh.scale.set(1.0, 0.44, 1.0);
    tubMesh.position.set(0, rh + 0.32, 0);
    group.add(tubMesh);

    // Upper aerodynamic roof canopy / greenhouse (streamlined teardrop profile)
    const canopyLength = wb * 0.72;
    const canopyWidth = tf * 1.18;
    const canopyGeo = new THREE.SphereGeometry(canopyWidth * 0.54, 16, 12);
    const canopyMesh = new THREE.Mesh(canopyGeo, bodyMat);
    canopyMesh.scale.set(1.0, 0.65, canopyLength / canopyWidth);
    canopyMesh.position.set(0, rh + 0.58, -(wb * 0.04));
    group.add(canopyMesh);

    // Center Spine / Roof Aero Channel (Double-Bubble Roof)
    const spineGeo = new THREE.BoxGeometry(0.14, 0.04, canopyLength * 0.85);
    const spineMesh = new THREE.Mesh(spineGeo, carbonMat);
    spineMesh.position.set(0, rh + 0.88, -(wb * 0.04));
    group.add(spineMesh);

    // ── 2. SCULPTED FLARED WHEEL ARCHES (CURVED FENDERS) ──
    const archRadius = 0.38;
    const archWidth = 0.22;
    const archGeo = new THREE.TorusGeometry(archRadius, archWidth * 0.45, 12, 24, Math.PI * 0.92);

    // Front Left & Right Flared Fenders
    const fFL = new THREE.Mesh(archGeo, bodyMat);
    fFL.rotation.y = Math.PI / 2;
    fFL.rotation.z = Math.PI * 0.04;
    fFL.scale.set(1.0, 1.1, 1.35);
    fFL.position.set(-tf * 0.98, rh + 0.22, -(wb * 0.5));

    const fFR = new THREE.Mesh(archGeo, bodyMat);
    fFR.rotation.y = -Math.PI / 2;
    fFR.rotation.z = Math.PI * 0.04;
    fFR.scale.set(1.0, 1.1, 1.35);
    fFR.position.set(tf * 0.98, rh + 0.22, -(wb * 0.5));

    // Rear Left & Right Muscular Widebody Haunches
    const fRL = new THREE.Mesh(archGeo, bodyMat);
    fRL.rotation.y = Math.PI / 2;
    fRL.rotation.z = Math.PI * 0.04;
    fRL.scale.set(1.0, 1.18, 1.45);
    fRL.position.set(-tr * 0.98, rh + 0.24, (wb * 0.5));

    const fRR = new THREE.Mesh(archGeo, bodyMat);
    fRR.rotation.y = -Math.PI / 2;
    fRR.rotation.z = Math.PI * 0.04;
    fRR.scale.set(1.0, 1.18, 1.45);
    fRR.position.set(tr * 0.98, rh + 0.24, (wb * 0.5));

    group.add(fFL, fFR, fRL, fRR);

    // Front Fender Inner Carbon Wheel Liners
    const linerGeo = new THREE.CylinderGeometry(archRadius * 0.92, archRadius * 0.92, archWidth * 0.8, 16, 1, true, 0, Math.PI);
    [-tf * 0.98, tf * 0.98].forEach((xPos, idx) => {
      const liner = new THREE.Mesh(linerGeo, trimMat);
      liner.rotation.z = Math.PI / 2;
      liner.rotation.x = idx === 0 ? Math.PI : 0;
      liner.position.set(xPos, rh + 0.22, -(wb * 0.5));
      group.add(liner);
    });

    // Fender Top Carbon Louvers (heat extraction, Stage 7 option)
    if (state.fenderLouvers && !isPreview) {
      const louverFinGeo = new THREE.BoxGeometry(0.14, 0.008, 0.045);
      [-(wb * 0.5), wb * 0.5].forEach((zPos) => {
        [-1, 1].forEach((side) => {
          for (let i = 0; i < 4; i++) {
            const fin = new THREE.Mesh(louverFinGeo, carbonMat);
            fin.rotation.x = 0.32;
            fin.position.set(side * tf * 0.95, rh + 0.56 - i * 0.006, zPos + (i - 1.5) * 0.065);
            group.add(fin);
          }
        });
      });
    }

    // ── 3. AERODYNAMIC FRONT NOSE CONE & BUMPER FASCIA ──
    const noseLength = 0.62;
    const noseGeo = new THREE.ConeGeometry(tf * 0.96, noseLength, 16);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.scale.set(1.05, 0.38, 1.0);
    noseMesh.position.set(0, rh + 0.32, -(wb * 0.5) - (noseLength * 0.45));
    group.add(noseMesh);

    // Front Radiator Air Intake Grille (Trapezoidal Center Mesh)
    const grilleGeo = new THREE.BoxGeometry(tf * 0.92, 0.18, 0.08);
    const grilleMesh = new THREE.Mesh(grilleGeo, trimMat);
    grilleMesh.position.set(0, rh + 0.22, -(wb * 0.5) - 0.64);
    group.add(grilleMesh);

    // Outboard Brake Cooling Ducts
    const brakeDuctGeo = new THREE.BoxGeometry(0.24, 0.12, 0.06);
    [-1, 1].forEach((side) => {
      const duct = new THREE.Mesh(brakeDuctGeo, carbonMat);
      duct.position.set(side * tf * 0.72, rh + 0.22, -(wb * 0.5) - 0.62);
      duct.rotation.y = side * -0.22;
      group.add(duct);
    });

    // ── 4. REAR AERO BUMPER FASCIA & EXTRACTION MESH ──
    const rearBumperLength = 0.58;
    const rearBumperGeo = new THREE.BoxGeometry(tr * 1.88, 0.38, rearBumperLength);
    const rearBumper = new THREE.Mesh(rearBumperGeo, bodyMat);
    rearBumper.position.set(0, rh + 0.36, (wb * 0.5) + (rearBumperLength * 0.5));
    group.add(rearBumper);

    // Rear Heat Extraction Hex Mesh Panel
    const rearMeshGeo = new THREE.BoxGeometry(tr * 1.55, 0.18, 0.04);
    const rearMesh = new THREE.Mesh(rearMeshGeo, trimMat);
    rearMesh.position.set(0, rh + 0.35, (wb * 0.5) + rearBumperLength + 0.01);
    group.add(rearMesh);

    // ── 5. SCULPTED SIDE SKIRTS WITH VORTEX FENCES ──
    const skirtLength = wb * 0.88;
    const skirtGeo = new THREE.BoxGeometry(0.18, 0.045, skirtLength);
    const skirtL = new THREE.Mesh(skirtGeo, carbonMat);
    skirtL.position.set(-tf * 0.98, rh + 0.08, 0);
    const skirtR = new THREE.Mesh(skirtGeo, carbonMat);
    skirtR.position.set(tf * 0.98, rh + 0.08, 0);
    group.add(skirtL, skirtR);

    // Side Skirt Rear Aero Winglets
    const wingletGeo = new THREE.BoxGeometry(0.02, 0.12, 0.18);
    const wingletL = new THREE.Mesh(wingletGeo, carbonMat);
    wingletL.position.set(-tf * 1.04, rh + 0.14, wb * 0.38);
    const wingletR = new THREE.Mesh(wingletGeo, carbonMat);
    wingletR.position.set(tf * 1.04, rh + 0.14, wb * 0.38);
    group.add(wingletL, wingletR);

    // ── 6. MATRIX LED HEADLIGHT CLUSTERS & OLED REAR LIGHTBAR ──
    // Swept-back, razor-sharp headlight clusters with dual projector lenses
    [-1, 1].forEach((side) => {
      const headHousingGeo = new THREE.BoxGeometry(0.26, 0.055, 0.28);
      const headHousing = new THREE.Mesh(headHousingGeo, trimMat);
      headHousing.rotation.y = side * -0.28;
      headHousing.rotation.z = side * -0.06;
      headHousing.position.set(side * tf * 0.68, rh + 0.44, -(wb * 0.5) - 0.52);

      // Glowing Ice-Blue DRL Blade
      const drlGeo = new THREE.BoxGeometry(0.24, 0.015, 0.26);
      const drl = new THREE.Mesh(drlGeo, this.materials.ledCyan);
      drl.position.set(0, -0.015, 0.01);
      headHousing.add(drl);

      // Dual Projector Crystal Lenses
      for (let p = 0; p < 2; p++) {
        const projGeo = new THREE.SphereGeometry(0.025, 12, 12);
        const proj = new THREE.Mesh(projGeo, this.materials.ledWhite);
        proj.position.set((p - 0.5) * 0.08, 0.01, -0.06);
        headHousing.add(proj);
      }

      group.add(headHousing);
    });

    // Full-Width 3D Continuous OLED Taillight Strip (Smoked Housing)
    const tailHousingGeo = new THREE.BoxGeometry(tr * 1.78, 0.05, 0.06);
    const tailHousing = new THREE.Mesh(tailHousingGeo, trimMat);
    tailHousing.position.set(0, rh + 0.53, (wb * 0.5) + rearBumperLength + 0.01);

    const tailBarGeo = new THREE.BoxGeometry(tr * 1.74, 0.025, 0.02);
    const tailBar = new THREE.Mesh(tailBarGeo, this.materials.ledRed);
    tailBar.position.set(0, 0, 0.025);
    tailHousing.add(tailBar);
    group.add(tailHousing);

    // ── 7. DOORS (LEFT & RIGHT) WITH ARTICULATION PIVOTS ──
    const doorLength = wb * 0.46;
    const doorHeight = 0.44;
    const doorThickness = 0.12;

    this.leftDoorPivot.position.set(-tf * 0.92, rh + 0.38, -(wb * 0.16));
    this.rightDoorPivot.position.set(tf * 0.92, rh + 0.38, -(wb * 0.16));

    // Left Door Assembly (Sculpted Outer Skin)
    const doorSkinGeo = new THREE.BoxGeometry(doorThickness, doorHeight, doorLength);
    const leftDoorSkin = new THREE.Mesh(doorSkinGeo, bodyMat);
    leftDoorSkin.position.set(0, 0, doorLength * 0.5);
    this.leftDoorPivot.add(leftDoorSkin);

    // Left Side NACA Air Scoop
    const leftDuctGeo = new THREE.BoxGeometry(0.05, 0.18, doorLength * 0.55);
    const leftDuct = new THREE.Mesh(leftDuctGeo, carbonMat);
    leftDuct.position.set(-0.045, -0.04, doorLength * 0.55);
    this.leftDoorPivot.add(leftDuct);

    // Left Aerofoil Stalk Mirror
    const mirrorStemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8);
    const leftStem = new THREE.Mesh(mirrorStemGeo, carbonMat);
    leftStem.rotation.z = Math.PI / 3;
    leftStem.position.set(-0.06, doorHeight * 0.42, doorLength * 0.12);
    const mirrorHeadGeo = new THREE.SphereGeometry(0.065, 12, 8);
    const leftMirrorHead = new THREE.Mesh(mirrorHeadGeo, carbonMat);
    leftMirrorHead.scale.set(1.4, 0.65, 0.85);
    leftMirrorHead.position.set(-0.12, doorHeight * 0.48, doorLength * 0.12);
    this.leftDoorPivot.add(leftStem, leftMirrorHead);

    // Right Door Assembly
    const rightDoorSkin = new THREE.Mesh(doorSkinGeo, bodyMat);
    rightDoorSkin.position.set(0, 0, doorLength * 0.5);
    this.rightDoorPivot.add(rightDoorSkin);

    const rightDuct = new THREE.Mesh(leftDuctGeo, carbonMat);
    rightDuct.position.set(0.045, -0.04, doorLength * 0.55);
    this.rightDoorPivot.add(rightDuct);

    const rightStem = new THREE.Mesh(mirrorStemGeo, carbonMat);
    rightStem.rotation.z = -Math.PI / 3;
    rightStem.position.set(0.06, doorHeight * 0.42, doorLength * 0.12);
    const rightMirrorHead = new THREE.Mesh(mirrorHeadGeo, carbonMat);
    rightMirrorHead.scale.set(1.4, 0.65, 0.85);
    rightMirrorHead.position.set(0.12, doorHeight * 0.48, doorLength * 0.12);
    this.rightDoorPivot.add(rightStem, rightMirrorHead);

    // ── 8. BONNET (FRONT CLAMSHELL HOOD) WITH PIVOT ──
    const bonnetLength = wb * 0.54;
    this.bonnetPivot.position.set(0, rh + 0.50, -(wb * 0.12));

    const bonnetSkinGeo = new THREE.BoxGeometry(tf * 1.58, 0.06, bonnetLength);
    const bonnetSkin = new THREE.Mesh(bonnetSkinGeo, bodyMat);
    bonnetSkin.position.set(0, 0, -(bonnetLength * 0.5));
    this.bonnetPivot.add(bonnetSkin);

    // Central Bonnet Aerodynamic Power Bulge
    const bulgeGeo = new THREE.BoxGeometry(tf * 0.55, 0.035, bonnetLength * 0.85);
    const bulge = new THREE.Mesh(bulgeGeo, bodyMat);
    bulge.position.set(0, 0.025, -(bonnetLength * 0.5));
    this.bonnetPivot.add(bulge);

    // Bonnet NACA Ducts & S-Duct Radiator Chimneys
    if (state.bonnetStyle !== "smooth_supercar") {
      const bVentGeo = new THREE.BoxGeometry(tf * 0.32, 0.02, bonnetLength * 0.38);
      const bVentL = new THREE.Mesh(bVentGeo, carbonMat);
      bVentL.position.set(-tf * 0.36, 0.035, -(bonnetLength * 0.52));
      const bVentR = new THREE.Mesh(bVentGeo, carbonMat);
      bVentR.position.set(tf * 0.36, 0.035, -(bonnetLength * 0.52));
      this.bonnetPivot.add(bVentL, bVentR);

      // AeroCatch Quick-Release Fastener Pins
      const pinGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.015, 12);
      const pinL = new THREE.Mesh(pinGeo, this.materials.aluminum);
      pinL.position.set(-tf * 0.52, 0.035, -(bonnetLength * 0.84));
      const pinR = new THREE.Mesh(pinGeo, this.materials.aluminum);
      pinR.position.set(tf * 0.52, 0.035, -(bonnetLength * 0.84));
      this.bonnetPivot.add(pinL, pinR);
    }

    // ── 9. DICKY (REAR TRUNK / ENGINE DECKLID) WITH PIVOT ──
    const dickyLength = wb * 0.46;
    this.dickyPivot.position.set(0, rh + 0.54, (wb * 0.14));

    const dickySkinGeo = new THREE.BoxGeometry(tr * 1.54, 0.06, dickyLength);
    const dickySkin = new THREE.Mesh(dickySkinGeo, bodyMat);
    dickySkin.position.set(0, 0, dickyLength * 0.5);
    this.dickyPivot.add(dickySkin);

    // Decklid Louvers / Engine Cooling Slots
    const dLouversGeo = new THREE.BoxGeometry(tr * 0.78, 0.018, dickyLength * 0.45);
    const dLouvers = new THREE.Mesh(dLouversGeo, carbonMat);
    dLouvers.position.set(0, 0.035, dickyLength * 0.45);
    this.dickyPivot.add(dLouvers);

    if (state.dickyStyle === "ducktail_trunk" || state.dickyStyle === "active_airbrake") {
      const ducktailGeo = new THREE.BoxGeometry(tr * 1.52, 0.045, 0.12);
      const ducktail = new THREE.Mesh(ducktailGeo, carbonMat);
      ducktail.position.set(0, 0.065, dickyLength * 0.95);
      ducktail.rotation.x = Math.PI / 7;
      this.dickyPivot.add(ducktail);
    }

    // Apply initial closure rotations
    this.setClosuresArticulation(
      state.doorOpenAngleDeg || 0,
      state.bonnetOpenAngleDeg || 0,
      state.dickyOpenAngleDeg || 0,
      state.doorStyle || "butterfly"
    );

    return group;
  }

  /**
   * Articulates closures (Doors, Bonnet, Dicky) dynamically in real time.
   */
  public setClosuresArticulation(
    doorsDeg: number,
    bonnetDeg: number,
    dickyDeg: number,
    doorStyle: "butterfly" | "scissor" | "gullwing" | "conventional" = "butterfly"
  ) {
    const doorRad = (doorsDeg * Math.PI) / 180;
    const bonnetRad = (bonnetDeg * Math.PI) / 180;
    const dickyRad = (dickyDeg * Math.PI) / 180;

    // Articulate Left & Right Doors based on kinematics
    if (doorStyle === "scissor") {
      this.leftDoorPivot.rotation.set(0, 0, doorRad);
      this.rightDoorPivot.rotation.set(0, 0, -doorRad);
    } else if (doorStyle === "gullwing") {
      this.leftDoorPivot.rotation.set(0, 0, doorRad * 1.1);
      this.rightDoorPivot.rotation.set(0, 0, -doorRad * 1.1);
    } else if (doorStyle === "conventional") {
      this.leftDoorPivot.rotation.set(0, -doorRad, 0);
      this.rightDoorPivot.rotation.set(0, doorRad, 0);
    } else {
      // Butterfly / Dihedral
      this.leftDoorPivot.rotation.set(-doorRad * 0.35, doorRad * 0.45, doorRad * 0.65);
      this.rightDoorPivot.rotation.set(-doorRad * 0.35, -doorRad * 0.45, -doorRad * 0.65);
    }

    // Articulate Bonnet & Dicky
    this.bonnetPivot.rotation.x = -bonnetRad;
    this.dickyPivot.rotation.x = dickyRad;
  }

  private buildGlass3D(
    type: string,
    lexanEngineCover: boolean,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const mat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, wireframe: true })
      : type === "privacy_tint" ? this.materials.glassTinted : this.materials.glass;
    const trimMat = this.materials.castIron;

    // 1. Double-Curved Raked Laminated Windshield with Ceramic Frit
    const wsRadius = tf * 1.25;
    const wsGeo = new THREE.CylinderGeometry(wsRadius, wsRadius * 1.08, 0.72, 24, 1, true, -Math.PI * 0.28, Math.PI * 0.56);
    const ws = new THREE.Mesh(wsGeo, mat);
    ws.rotation.x = Math.PI / 2.75;
    ws.rotation.z = Math.PI;
    ws.position.set(0, rh + 0.68, -(wb * 0.16));
    group.add(ws);

    // Ceramic Frit Border Band (A-Pillar Windshield Trim)
    const fritGeo = new THREE.TorusGeometry(wsRadius * 1.02, 0.015, 8, 24, Math.PI * 0.56);
    const frit = new THREE.Mesh(fritGeo, trimMat);
    frit.rotation.x = Math.PI / 2.75;
    frit.position.set(0, rh + 0.68, -(wb * 0.16));
    group.add(frit);

    // 2. Curved Polycarbonate Rear Engine View Screen with Cooling Slots
    const rearGlassGeo = new THREE.CylinderGeometry(tf * 1.05, tf * 1.15, 0.76, 20, 1, true, -Math.PI * 0.26, Math.PI * 0.52);
    const rearGlass = new THREE.Mesh(rearGlassGeo, mat);
    rearGlass.rotation.x = -Math.PI / 3.1;
    rearGlass.position.set(0, rh + 0.68, (wb * 0.22));
    group.add(rearGlass);

    // 3. Frameless Side Windows (Tapered Teardrop Quarter Glass)
    const sideWinGeo = new THREE.BoxGeometry(0.012, 0.26, wb * 0.48);
    const winL = new THREE.Mesh(sideWinGeo, mat);
    winL.rotation.y = 0.05;
    winL.position.set(-tf * 0.76, rh + 0.68, 0);
    const winR = new THREE.Mesh(sideWinGeo, mat);
    winR.rotation.y = -0.05;
    winR.position.set(tf * 0.76, rh + 0.68, 0);
    group.add(winL, winR);

    // 4. Lexan Engine Cover Inspection Window
    if (lexanEngineCover) {
      const lexanMat = isPreview ? mat : this.materials.glass;
      const coverGeo = new THREE.BoxGeometry(tf * 0.95, 0.015, wb * 0.32);
      const cover = new THREE.Mesh(coverGeo, lexanMat);
      cover.position.set(0, rh + 0.64, wb * 0.24);
      group.add(cover);

      // Billet quick-release fastener rings around the window
      if (!isPreview) {
        const ringGeo = new THREE.TorusGeometry(0.024, 0.006, 8, 16);
        [-1, 1].forEach((side) => {
          const ring = new THREE.Mesh(ringGeo, this.materials.aluminum);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(side * tf * 0.38, rh + 0.65, wb * 0.16);
          group.add(ring);
        });
      }
    }

    return group;
  }

  private buildInterior3D(
    type: string,
    sixPointHarness: boolean,
    motecDisplay: boolean,
    wb: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const carbonMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 })
      : this.materials.carbon;
    const redAccent = isPreview ? carbonMat : this.materials.redAnodized;

    // 1. Dual FIA Homologated Carbon Monocoque Bucket Seats
    const seatBackGeo = new THREE.BoxGeometry(0.44, 0.68, 0.12);
    const seatBaseGeo = new THREE.BoxGeometry(0.44, 0.12, 0.46);

    const seatL = new THREE.Group();
    seatL.add(new THREE.Mesh(seatBackGeo, carbonMat));
    const baseL = new THREE.Mesh(seatBaseGeo, carbonMat);
    baseL.position.set(0, -0.32, 0.22);
    seatL.add(baseL);
    seatL.position.set(-0.35, rh + 0.44, -0.05);

    const seatR = new THREE.Group();
    seatR.add(new THREE.Mesh(seatBackGeo, carbonMat));
    const baseR = new THREE.Mesh(seatBaseGeo, carbonMat);
    baseR.position.set(0, -0.32, 0.22);
    seatR.add(baseR);
    seatR.position.set(0.35, rh + 0.44, -0.05);

    group.add(seatL, seatR);

    // 2. 6-Point Sabelt Racing Harness Straps (Vibrant Red) + Billet Harness Bar
    if (sixPointHarness) {
      const strapGeo = new THREE.BoxGeometry(0.06, 0.52, 0.015);
      const strapL1 = new THREE.Mesh(strapGeo, redAccent);
      strapL1.position.set(-0.42, rh + 0.46, -0.01);
      const strapL2 = new THREE.Mesh(strapGeo, redAccent);
      strapL2.position.set(-0.28, rh + 0.46, -0.01);
      group.add(strapL1, strapL2);

      // Right-side mirror straps
      const strapR1 = new THREE.Mesh(strapGeo, redAccent);
      strapR1.position.set(0.42, rh + 0.46, -0.01);
      const strapR2 = new THREE.Mesh(strapGeo, redAccent);
      strapR2.position.set(0.28, rh + 0.46, -0.01);
      group.add(strapR1, strapR2);

      // 7075 billet harness bar behind the seats
      const harnessBarGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.05, 12);
      const harnessBar = new THREE.Mesh(harnessBarGeo, this.materials.aluminum);
      harnessBar.rotation.z = Math.PI / 2;
      harnessBar.position.set(0, rh + 0.62, 0.16);
      group.add(harnessBar);
    }

    // 3. Formula-Style Yoke Steering Wheel with Buttons & Paddle Shifters
    const yokeGeo = new THREE.TorusGeometry(0.13, 0.022, 12, 24);
    const steerWheel = new THREE.Mesh(yokeGeo, redAccent);
    steerWheel.position.set(-0.35, rh + 0.64, -(wb * 0.16));
    steerWheel.rotation.x = -Math.PI / 5.5;

    const paddleGeo = new THREE.BoxGeometry(0.04, 0.12, 0.01);
    const paddleL = new THREE.Mesh(paddleGeo, this.materials.carbon);
    paddleL.position.set(-0.44, rh + 0.64, -(wb * 0.18));
    const paddleR = new THREE.Mesh(paddleGeo, this.materials.carbon);
    paddleR.position.set(-0.26, rh + 0.64, -(wb * 0.18));
    group.add(steerWheel, paddleL, paddleR);

    // 4. MoTeC Motorsport Digital Cluster Display (10.2" Display)
    const dashHousingGeo = new THREE.BoxGeometry(0.92, 0.16, 0.28);
    const dashHousing = new THREE.Mesh(dashHousingGeo, this.materials.carbon);
    dashHousing.position.set(0, rh + 0.64, -(wb * 0.25));
    group.add(dashHousing);

    if (motecDisplay) {
      const motecGeo = new THREE.BoxGeometry(0.56, 0.14, 0.02);
      const motecScreen = new THREE.Mesh(motecGeo, this.materials.ledCyan);
      motecScreen.position.set(-0.3, rh + 0.65, -(wb * 0.22));
      group.add(motecScreen);

      // Shift-light LED strip capping the display
      if (!isPreview) {
        const shiftLightGeo = new THREE.BoxGeometry(0.4, 0.02, 0.02);
        const shiftLights = new THREE.Mesh(shiftLightGeo, this.materials.ledRed);
        shiftLights.position.set(-0.3, rh + 0.735, -(wb * 0.22));
        group.add(shiftLights);
      }
    }

    return group;
  }

  private buildElectronics3D(
    type: string,
    raychemLooms: boolean,
    highVoltage800V: boolean,
    wb: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const aluMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 })
      : this.materials.aluminum;

    // 1. Bosch Motorsport MS6 Racing ECU Module
    const ecuGeo = new THREE.BoxGeometry(0.24, 0.09, 0.24);
    const ecu = new THREE.Mesh(ecuGeo, aluMat);
    ecu.position.set(-0.36, rh + 0.36, -(wb * 0.28));
    group.add(ecu);

    // 2. Raychem Mil-Spec Wire Harness Bundles (braided loom trunk lines)
    if (raychemLooms && !isPreview) {
      const wireGeo = new THREE.CylinderGeometry(0.018, 0.018, wb * 0.92, 12);
      const wireHarness = new THREE.Mesh(wireGeo, this.materials.ledAmber);
      wireHarness.rotation.x = Math.PI / 2;
      wireHarness.position.set(0.18, rh + 0.09, 0);
      group.add(wireHarness);

      // Branch looms to each corner + sensor tee-off bundles
      const branchGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.5, 8);
      [-1, 1].forEach((side) => {
        [-1, 1].forEach((endIdx) => {
          const branch = new THREE.Mesh(branchGeo, this.materials.carbon);
          branch.rotation.x = Math.PI / 2;
          branch.rotation.y = side * 0.35;
          branch.position.set(side * 0.32, rh + 0.12, endIdx * wb * 0.34);
          group.add(branch);
        });
      });

      // ECU connector block (55-pin Deutsch motorsport connector)
      const connGeo = new THREE.BoxGeometry(0.09, 0.05, 0.04);
      const conn = new THREE.Mesh(connGeo, this.materials.gold);
      conn.position.set(-0.36, rh + 0.31, -(wb * 0.28) - 0.13);
      group.add(conn);
    }

    // 2b. High-Voltage 800V traction lines (shielded orange HV conduit)
    if (highVoltage800V && !isPreview) {
      const hvGeo = new THREE.CylinderGeometry(0.014, 0.014, wb * 0.98, 10);
      const hvLineA = new THREE.Mesh(hvGeo, this.materials.ledAmber);
      hvLineA.rotation.x = Math.PI / 2;
      hvLineA.position.set(-0.14, rh + 0.06, 0);
      const hvLineB = new THREE.Mesh(hvGeo, this.materials.ledRed);
      hvLineB.rotation.x = Math.PI / 2;
      hvLineB.position.set(-0.1, rh + 0.06, 0);
      group.add(hvLineA, hvLineB);
    }

    // 3. Telemetry Antenna & Kill Switch
    const antennaGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8);
    const antenna = new THREE.Mesh(antennaGeo, this.materials.carbon);
    antenna.position.set(0, rh + 0.98, wb * 0.2);
    group.add(antenna);

    return group;
  }

  private buildExteriorDetails3D(
    exhaust: string,
    heatTintIntensity: number,
    towHooksFront: boolean,
    towHooksRear: boolean,
    wb: number,
    tf: number,
    tr: number,
    rh: number,
    isPreview: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    const carbonMat = isPreview
      ? new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 })
      : this.materials.carbonGloss;

    // 1. Carbon Stalk Wing Mirrors with Aerofoil Profile
    const mirrorStalkGeo = new THREE.BoxGeometry(0.22, 0.025, 0.08);
    const mirrorL = new THREE.Mesh(mirrorStalkGeo, carbonMat);
    mirrorL.position.set(-tf * 1.02, rh + 0.68, -(wb * 0.22));
    const mirrorR = new THREE.Mesh(mirrorStalkGeo, carbonMat);
    mirrorR.position.set(tf * 1.02, rh + 0.68, -(wb * 0.22));
    group.add(mirrorL, mirrorR);

    // 2. Quad Titanium Exhaust Tips with Heat-Tint Blue Gradient
    // Intensity 0% = raw brushed titanium, 100% = full blue/purple flame tint at the exits.
    const tint = Math.min(100, Math.max(0, heatTintIntensity ?? 70)) / 100;
    const tipBaseColor = new THREE.Color(0x9aa5b5).lerp(new THREE.Color(0x8ea2c8), tint);
    const tipExitColor = new THREE.Color(0xb7c0cd).lerp(new THREE.Color(0x4338ca), tint);

    if (!isPreview) {
      const tipGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 20);
      const tipMat = new THREE.MeshPhysicalMaterial({
        color: tipBaseColor,
        roughness: 0.16 - tint * 0.04,
        metalness: 0.95,
        sheen: tint,
        sheenColor: new THREE.Color(0x6366f1),
      });
      const exitGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20);
      const exitMat = new THREE.MeshStandardMaterial({
        color: tipExitColor,
        roughness: 0.25,
        metalness: 0.8,
        emissive: new THREE.Color(0x312e81).multiplyScalar(tint * 0.55),
      });

      const isQuad = exhaust === "quad_titanium";
      const xs = isQuad ? [-0.19, -0.065, 0.065, 0.19] : exhaust === "center_dual" ? [-0.09, 0.09] : [-tr * 0.85, tr * 0.85];
      xs.forEach((x) => {
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.rotation.x = Math.PI / 2;
        tipMesh.position.set(x, rh + 0.29, (wb * 0.5) + 0.74);
        group.add(tipMesh);

        const exitMesh = new THREE.Mesh(exitGeo, exitMat);
        exitMesh.rotation.x = Math.PI / 2;
        exitMesh.position.set(x, rh + 0.29, (wb * 0.5) + 0.86);
        group.add(exitMesh);
      });
    }

    // 3. Racing Tow Hooks (FIA compliant red loops)
    const hookLoopGeo = new THREE.TorusGeometry(0.045, 0.012, 10, 20);
    const towStrapGeo = new THREE.BoxGeometry(0.04, 0.015, 0.14);
    if (towHooksFront && !isPreview) {
      const frontLoop = new THREE.Mesh(hookLoopGeo, this.materials.redAnodized);
      frontLoop.position.set(tf * 0.55, rh + 0.24, -(wb * 0.5) - 0.78);
      group.add(frontLoop);
      const strap = new THREE.Mesh(towStrapGeo, this.materials.redAnodized);
      strap.position.set(tf * 0.55, rh + 0.24, -(wb * 0.5) - 0.72);
      group.add(strap);
    }
    if (towHooksRear && !isPreview) {
      const rearLoop = new THREE.Mesh(hookLoopGeo, this.materials.redAnodized);
      rearLoop.position.set(tr * 0.55, rh + 0.26, (wb * 0.5) + 0.76);
      group.add(rearLoop);
    }

    return group;
  }

  // ==========================================================================
  // EXPLODED VIEW MOTION INTERPOLATION
  // ==========================================================================
  private applyExplodedOffsets(progress: number, wb: number) {
    const factor = Math.max(0, Math.min(1, progress));

    this.chassisGroup.position.set(0, -0.45 * factor, 0);
    this.bodyGroup.position.set(0, 1.15 * factor, 0);
    this.glassGroup.position.set(0, 1.45 * factor, 0);
    this.interiorGroup.position.set(0, 0.55 * factor, 0);

    // Suspension & Brakes & Wheels separate outwards laterally
    this.wheelsGroup.position.set(0, 0, 0);
    this.brakesGroup.position.set(0, 0, 0);
    this.suspensionGroup.position.set(0, 0, 0);

    this.wheelsGroup.children.forEach((child, i) => {
      const isLeft = i % 2 === 0;
      child.position.x += (isLeft ? -0.85 : 0.85) * factor;
    });

    this.brakesGroup.children.forEach((child, i) => {
      const isLeft = i % 2 === 0;
      child.position.x += (isLeft ? -0.55 : 0.55) * factor;
    });

    // Aero displacements
    this.rearWingPivot.position.y += 0.65 * factor;
    this.rearWingPivot.position.z += 0.45 * factor;
    this.frontSplitterPivot.position.z -= 0.65 * factor;
    this.diffuserPivot.position.z += 0.55 * factor;
  }

  // ==========================================================================
  // CAD ENGINEERING TOOLS & GIZMOS
  // ==========================================================================

  private initCoMGizmo() {
    // Spherical datum marker (yellow & black checkerboard aesthetic)
    const sphereGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffea00, wireframe: true });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);

    // Crosshair rings
    const ringGeo = new THREE.RingGeometry(0.08, 0.09, 32);
    const ringX = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide }));
    ringX.rotation.y = Math.PI / 2;
    const ringY = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide }));
    ringY.rotation.x = Math.PI / 2;
    const ringZ = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide }));

    this.comGizmoGroup.add(sphere, ringX, ringY, ringZ);
  }

  public updateCenterOfMass(comMm: [number, number, number], visible: boolean) {
    this.comGizmoGroup.visible = visible;
    if (visible) {
      this.comGizmoGroup.position.set(
        comMm[0] / 1000,
        comMm[1] / 1000,
        comMm[2] / 1000
      );
    }
  }

  public setSectionClippingPlane(axis: "off" | "x" | "y" | "z", offset: number) {
    if (axis === "off") {
      this.sectionClippingPlanes = [];
    } else {
      let normal = new THREE.Vector3(1, 0, 0);
      if (axis === "y") normal = new THREE.Vector3(0, 1, 0);
      if (axis === "z") normal = new THREE.Vector3(0, 0, 1);
      this.sectionClippingPlanes = [new THREE.Plane(normal, -offset)];
    }

    // Apply to all standard mesh materials
    this.rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            m.clippingPlanes = this.sectionClippingPlanes;
            m.clipShadows = true;
          });
        } else {
          obj.material.clippingPlanes = this.sectionClippingPlanes;
          obj.material.clipShadows = true;
        }
      }
    });
  }

  public setSteeringAngle(deg: number) {
    const rad = (deg * Math.PI) / 180;
    this.frontLeftWheelAssembly.rotation.y = rad;
    this.frontRightWheelAssembly.rotation.y = rad;
  }

  public setSuspensionTravel(travelMm: number) {
    const travelM = travelMm / 1000;
    const camberDeltaRad = -(travelMm / 50) * 0.05; // Camber gain under compression

    this.frontLeftWheelAssembly.position.y = travelM;
    this.frontLeftWheelAssembly.rotation.z = camberDeltaRad;

    this.frontRightWheelAssembly.position.y = travelM;
    this.frontRightWheelAssembly.rotation.z = -camberDeltaRad;

    this.rearLeftWheelAssembly.position.y = travelM * 0.9;
    this.rearLeftWheelAssembly.rotation.z = camberDeltaRad * 0.8;

    this.rearRightWheelAssembly.position.y = travelM * 0.9;
    this.rearRightWheelAssembly.rotation.z = -camberDeltaRad * 0.8;
  }

  public spinDrivetrain(deltaSec: number, rpm = 3500) {
    const radPerSec = (rpm * 2 * Math.PI) / 60;
    const deltaRad = radPerSec * deltaSec;

    this.frontLeftWheelAssembly.rotation.x += deltaRad * 0.25;
    this.frontRightWheelAssembly.rotation.x += deltaRad * 0.25;
    this.rearLeftWheelAssembly.rotation.x += deltaRad * 0.25;
    this.rearRightWheelAssembly.rotation.x += deltaRad * 0.25;

    this.pulleyMeshes.forEach((p) => {
      p.rotation.z += deltaRad;
    });

    if (this.driveshaftMesh) {
      this.driveshaftMesh.rotation.z += deltaRad;
    }
  }

  public setIsolatedStage(stage: AssemblyStageId | null) {
    this.isolatedStage = stage;
    this.setSubsystemVisibilityMode(stage || "chassis", stage ? "isolated" : "normal");
  }

  public setSubsystemVisibilityMode(category: AssemblyStageId, mode: "normal" | "ghost" | "xray" | "hidden" | "isolated") {
    if (mode === "isolated") {
      this.isolatedStage = category;
    } else if (this.isolatedStage === category && mode === "normal") {
      this.isolatedStage = null;
    } else {
      this.subsystemVisibilityModes.set(category, mode);
    }

    const groupMap: Partial<Record<AssemblyStageId, THREE.Group>> = {
      chassis: this.chassisGroup,
      engine: this.engineGroup,
      transmission: this.transmissionGroup,
      suspension: this.suspensionGroup,
      brakes: this.brakesGroup,
      wheels: this.wheelsGroup,
      body_structure: this.bodyGroup,
      glass: this.glassGroup,
      interior: this.interiorGroup,
      electronics: this.electronicsGroup,
      final_exterior: this.exteriorDetailsGroup,
      aero_studio: this.aeroGroup,
    };

    Object.entries(groupMap).forEach(([stage, grp]) => {
      if (!grp) return;
      const stageId = stage as AssemblyStageId;

      if (this.isolatedStage) {
        grp.visible = stageId === this.isolatedStage;
        return;
      }

      const stageMode = this.subsystemVisibilityModes.get(stageId) || "normal";
      grp.visible = stageMode !== "hidden";

      grp.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.material) {
          if (stageMode === "ghost") {
            obj.material.transparent = true;
            obj.material.opacity = 0.18;
            obj.material.depthWrite = false;
          } else if (stageMode === "xray") {
            obj.material.transparent = true;
            obj.material.opacity = 0.45;
            obj.material.wireframe = true;
          } else {
            obj.material.transparent = false;
            obj.material.opacity = 1.0;
            obj.material.wireframe = false;
            obj.material.depthWrite = true;
          }
        }
      });
    });
  }

  public updateMeasurementCalipers(p1: [number, number, number] | null, p2: [number, number, number] | null) {
    this.clearGroup(this.measurementGroup);
    if (!p1 || !p2) return;

    const v1 = new THREE.Vector3(p1[0] / 1000, p1[1] / 1000, p1[2] / 1000);
    const v2 = new THREE.Vector3(p2[0] / 1000, p2[1] / 1000, p2[2] / 1000);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([v1, v2]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,
      dashSize: 0.05,
      gapSize: 0.02,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();

    const dotGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const dot1 = new THREE.Mesh(dotGeo, dotMat);
    dot1.position.copy(v1);
    const dot2 = new THREE.Mesh(dotGeo, dotMat);
    dot2.position.copy(v2);

    this.measurementGroup.add(line, dot1, dot2);
  }

  private applyXRayMode() {
    this.rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = obj.name.includes("Chassis") || obj.name.includes("Engine") ? 0.9 : 0.25;
          obj.material.depthWrite = false;
        }
      }
    });
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
      }
    }
  }
}
