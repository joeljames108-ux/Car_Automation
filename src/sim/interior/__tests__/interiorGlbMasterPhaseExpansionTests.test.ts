// ============================================================================
// MASTER INTERIOR 3D GLB & AESTHETICS SUITE EXPANSION UNIT TESTS
// ============================================================================
// Tests 3D geometry subassembly generators, procedural PBR texture synthesizers,
// 4-zone climate CFD solver, psychoacoustics ANC solver, SAE J1100 ergonomics,
// and complete GLB binary exporter.
// ============================================================================

import { describe, it, expect } from "vitest";
import * as THREE from "three";

if (typeof globalThis !== "undefined" && typeof (globalThis as any).FileReader === "undefined") {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

import { DashboardModularGlbGenerator } from "../../../exterior3d/generators/interior/dashboardModularGlbGenerator";
import { SeatModularGlbGenerator } from "../../../exterior3d/generators/interior/seatModularGlbGenerator";
import { SteeringModularGlbGenerator } from "../../../exterior3d/generators/interior/steeringModularGlbGenerator";
import { CenterConsoleModularGlbGenerator } from "../../../exterior3d/generators/interior/centerConsoleModularGlbGenerator";
import { DoorCardModularGlbGenerator } from "../../../exterior3d/generators/interior/doorCardModularGlbGenerator";
import { CabinEnvironmentModularGlbGenerator } from "../../../exterior3d/generators/interior/cabinEnvironmentModularGlbGenerator";
import { InteriorPbrMaterialSynthesizer } from "../../../exterior3d/materials/interiorPbrMaterialSynthesizer";
import { CabinAeroThermalSimulation } from "../cabinAeroThermalSimulation";
import { CabinPsychoacousticsSolver } from "../cabinPsychoacousticsSolver";
import { SaeJ1100ErgonomicsBiometrics } from "../saeJ1100ErgonomicsBiometrics";
import { CompleteInteriorGlbMasterGenerator } from "../../modularVehicle/generateCompleteInteriorGlb";

describe("Interior 3D GLB & Cockpit Engineering Suite", () => {
  // ==========================================================================
  // 1. DASHBOARD MODULAR GLB GENERATOR
  // ==========================================================================
  describe("DashboardModularGlbGenerator", () => {
    it("generates full multi-tier dashboard with Hyperscreen OLED blade", () => {
      const dash = DashboardModularGlbGenerator.buildDashboardGroup({
        typology: "pillar_to_pillar_hyperscreen_blade",
        primaryMaterial: "nappa_leather",
        secondaryMaterial: "nappa_leather",
        trimAccentMaterial: "forged_carbon_composite",
        hyperscreenEnabled: true,
        ambientLightColorHex: "#00f0ff",
        hudEnabled: true,
      });

      expect(dash).toBeInstanceOf(THREE.Group);
      expect(dash.name).toBe("Dashboard_Subassembly_Root");
      expect(dash.children.length).toBeGreaterThanOrEqual(6);

      const hyperscreen = dash.getObjectByName("Curved_Hyperscreen_OLED_Blade");
      expect(hyperscreen).toBeDefined();

      const hud = dash.getObjectByName("HUD_Projection_Cavity");
      expect(hud).toBeDefined();

      const acousticSpeaker = dash.getObjectByName("CenterAcousticSpeaker_Base");
      expect(acousticSpeaker).toBeDefined();
    });

    it("generates executive dual tier layout with glovebox seam and HVAC louvers", () => {
      const dash = DashboardModularGlbGenerator.buildDashboardGroup({
        typology: "executive_dual_tier_leather",
        primaryMaterial: "semi_aniline_leather",
        secondaryMaterial: "semi_aniline_leather",
        trimAccentMaterial: "open_pore_walnut",
        hyperscreenEnabled: false,
        ambientLightColorHex: "#ffaa00",
        hudEnabled: false,
      });

      expect(dash).toBeInstanceOf(THREE.Group);
      const glovebox = dash.getObjectByName("Passenger_Glovebox_Door");
      expect(glovebox).toBeDefined();

      const vent1 = dash.getObjectByName("HVAC_Vent_Housing_1");
      expect(vent1).toBeDefined();
    });
  });

  // ==========================================================================
  // 2. SEATING MODULAR GLB GENERATOR
  // ==========================================================================
  describe("SeatModularGlbGenerator", () => {
    it("generates carbon-fiber fixed racing buckets with 6-point harness", () => {
      const seating = SeatModularGlbGenerator.buildSeatingGroup({
        frontSeatType: "carbon_monocoque_fixed_bucket",
        primaryMaterial: "perforated_alcantara",
        secondaryMaterial: "perforated_alcantara",
        harnessType: "6_point_fia_race",
        harnessColorHex: "#d6001c",
        seatCount: 2,
        hasHeadrestSpeakers: true,
      });

      expect(seating).toBeInstanceOf(THREE.Group);
      const driverSeat = seating.getObjectByName("DriverSeat_Unit");
      expect(driverSeat).toBeDefined();

      const shell = driverSeat?.getObjectByName("Seat_Backrest_StructuralShell");
      expect(shell).toBeDefined();

      const camlock = driverSeat?.getObjectByName("FIA_Rotary_Camlock_Buckle");
      expect(camlock).toBeDefined();
    });

    it("generates 4-seater luxury executive layout with rear VIP lounge bench", () => {
      const seating = SeatModularGlbGenerator.buildSeatingGroup({
        frontSeatType: "executive_22way_massage_ottoman",
        primaryMaterial: "nappa_leather",
        secondaryMaterial: "nappa_leather",
        seatCount: 4,
        hasHeadrestSpeakers: true,
      });

      expect(seating).toBeInstanceOf(THREE.Group);
      const rearBench = seating.getObjectByName("Rear_VIP_Lounge_Bench");
      expect(rearBench).toBeDefined();

      const rearArmrest = rearBench?.getObjectByName("Rear_VIP_CenterArmrest");
      expect(rearArmrest).toBeDefined();
    });
  });

  // ==========================================================================
  // 3. STEERING MODULAR GLB GENERATOR
  // ==========================================================================
  describe("SteeringModularGlbGenerator", () => {
    it("generates Formula GT3 carbon yoke with telemetry OLED and paddle shifters", () => {
      const steering = SteeringModularGlbGenerator.buildSteeringGroup({
        typology: "formula_gt3_carbon_yoke",
        rimMaterial: "perforated_alcantara",
        spokeMaterial: "3k_twill_carbon_fiber",
        accentColorHex: "#00f0ff",
        hasTelemetryDisplay: true,
        hasMagneticPaddles: true,
        hasManettinoDial: true,
      });

      expect(steering).toBeInstanceOf(THREE.Group);
      const columnHsg = steering.getObjectByName("SteeringColumn_Housing");
      expect(columnHsg).toBeDefined();

      const rotatingGroup = steering.getObjectByName("SteeringWheel_RotatingSubassembly");
      expect(rotatingGroup).toBeDefined();

      const teleScreen = rotatingGroup?.getObjectByName("Yoke_Telemetry_OLED_Screen");
      expect(teleScreen).toBeDefined();

      const downPaddle = rotatingGroup?.getObjectByName("MagneticPaddle_Downshift");
      expect(downPaddle).toBeDefined();
    });

    it("generates 3-spoke round luxury wheel with horn pad and center stripe", () => {
      const steering = SteeringModularGlbGenerator.buildSteeringGroup({
        typology: "classic_heritage_3spoke_polished",
        rimMaterial: "semi_aniline_leather",
        spokeMaterial: "open_pore_walnut",
        accentColorHex: "#ffff00",
        hasTelemetryDisplay: false,
        hasMagneticPaddles: true,
      });

      expect(steering).toBeInstanceOf(THREE.Group);
      const rotatingGroup = steering.getObjectByName("SteeringWheel_RotatingSubassembly");
      const rim = rotatingGroup?.getObjectByName("SteeringWheel_RimTorus");
      expect(rim).toBeDefined();

      const hornPad = rotatingGroup?.getObjectByName("SteeringWheel_CentralHornPad");
      expect(hornPad).toBeDefined();
    });
  });

  // ==========================================================================
  // 4. CENTER CONSOLE MODULAR GLB GENERATOR
  // ==========================================================================
  describe("CenterConsoleModularGlbGenerator", () => {
    it("generates floating bridge with crystal drive selector and thermal cup holders", () => {
      const consoleGroup = CenterConsoleModularGlbGenerator.buildCenterConsoleGroup({
        typology: "crystal_glass_monostable_rotary",
        primaryMaterial: "nappa_leather",
        trimAccentMaterial: "forged_carbon_composite",
        ambientLightColorHex: "#00f0ff",
        hasCrystalShifter: true,
        hasWirelessCharger: true,
        hasCupHolderHalos: true,
        hasRearTouchscreen: true,
      });

      expect(consoleGroup).toBeInstanceOf(THREE.Group);
      const upperBridge = consoleGroup.getObjectByName("Console_UpperFloatingBridge");
      expect(upperBridge).toBeDefined();

      const crystalKnob = consoleGroup.getObjectByName("Drive_Selector_CrystalKnob");
      expect(crystalKnob).toBeDefined();

      const qiPad = consoleGroup.getObjectByName("Wireless_Qi_ChargingDeck");
      expect(qiPad).toBeDefined();

      const rearScreen = consoleGroup.getObjectByName("Rear_Passenger_Climate_Touchscreen");
      expect(rearScreen).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. DOOR CARD MODULAR GLB GENERATOR
  // ==========================================================================
  describe("DoorCardModularGlbGenerator", () => {
    it("generates symmetric left and right door cards with acoustic speaker grilles", () => {
      const doorCards = DoorCardModularGlbGenerator.buildDoorCardAssemblies({
        primaryMaterial: "nappa_leather",
        secondaryMaterial: "nappa_leather",
        trimAccentMaterial: "open_pore_walnut",
        ambientLightColorHex: "#00f0ff",
        hasSeatMemoryButtons: true,
        hasPuddleLamps: true,
        cabinWidthM: 1.62,
      });

      expect(doorCards).toBeInstanceOf(THREE.Group);
      expect(doorCards.children.length).toBe(2);

      const leftDoor = doorCards.getObjectByName("DoorCard_Left");
      expect(leftDoor).toBeDefined();

      const speaker = leftDoor?.getObjectByName("Door_AcousticSpeakerGrille");
      expect(speaker).toBeDefined();

      const armrest = leftDoor?.getObjectByName("Door_FloatingPaddedArmrest");
      expect(armrest).toBeDefined();
    });
  });

  // ==========================================================================
  // 6. CABIN ENVIRONMENT MODULAR GLB GENERATOR
  // ==========================================================================
  describe("CabinEnvironmentModularGlbGenerator", () => {
    it("generates pillars, starlight headliner, overhead flight console and sport pedals", () => {
      const cabinEnv = CabinEnvironmentModularGlbGenerator.buildCabinEnvironmentGroup({
        headlinerMaterial: "perforated_alcantara",
        carpetMaterial: "perforated_alcantara",
        ambientLightColorHex: "#00f0ff",
        hasStarlightHeadliner: true,
        hasSportPedals: true,
      });

      expect(cabinEnv).toBeInstanceOf(THREE.Group);
      const floorTub = cabinEnv.getObjectByName("Cabin_FloorTub");
      expect(floorTub).toBeDefined();

      const starlights = cabinEnv.getObjectByName("Starlight_FiberOptic_Constellations");
      expect(starlights).toBeDefined();
      expect(starlights?.children.length).toBeGreaterThanOrEqual(100);

      const pedalBox = cabinEnv.getObjectByName("Drilled_Sport_PedalBox");
      expect(pedalBox).toBeDefined();

      const brakePedal = pedalBox?.getObjectByName("Sport_Brake_Pedal");
      expect(brakePedal).toBeDefined();
    });
  });

  // ==========================================================================
  // 7. INTERIOR PBR MATERIAL SYNTHESIZER
  // ==========================================================================
  describe("InteriorPbrMaterialSynthesizer", () => {
    it("synthesizes physical PBR materials with realistic specular and sheen", () => {
      const synth = InteriorPbrMaterialSynthesizer.getInstance();
      const nappaMat = synth.createPhysicalMaterial({
        id: "test_nappa",
        name: "Test Nappa",
        materialType: "nappa_leather",
        baseColorHex: "#111215",
        roughness: 0.5,
        metalness: 0.04,
        sheen: 0.7,
        clearcoat: 0.1,
      });

      expect(nappaMat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(nappaMat.roughness).toBeCloseTo(0.5, 2);
      expect(nappaMat.metalness).toBeCloseTo(0.04, 2);
      expect(nappaMat.sheen).toBeCloseTo(0.7, 2);
    });

    it("returns curated luxury and track presets correctly", () => {
      const carbonMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("carbon_fiber_twill");
      expect(carbonMat.clearcoat).toBeGreaterThanOrEqual(0.9);

      const crystalMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("crystal_glass");
      expect(crystalMat.transmission).toBeGreaterThanOrEqual(0.9);
      expect(crystalMat.ior).toBeCloseTo(1.54, 2);
    });
  });

  // ==========================================================================
  // 8. CABIN AERO-THERMAL SIMULATION SOLVER
  // ==========================================================================
  describe("CabinAeroThermalSimulation", () => {
    it("solves 4-zone microclimate heat exchange, PMV/PPD, and heat pump COP", () => {
      const report = CabinAeroThermalSimulation.solveCabinThermodynamics(
        {
          ambientTempC: 34.0, // Hot summer day
          solarIrradiationWm2: 850,
          cabinVolumeM3: 3.2,
          glassAreaM2: 2.8,
          glassShadingFactor: 0.8,
          insulationRating: "bespoke_acoustic_double_glazing",
          occupantCount: 2,
        },
        {
          driver: { targetTempC: 21.0, fanSpeedLevel: 4, seatHeatingLevel: 0, seatVentilationLevel: 2, airRecirculationMode: "auto_recirculation" },
          passenger: { targetTempC: 22.0, fanSpeedLevel: 3, seatHeatingLevel: 0, seatVentilationLevel: 1, airRecirculationMode: "auto_recirculation" },
          rear_left: { targetTempC: 22.0, fanSpeedLevel: 2, seatHeatingLevel: 0, seatVentilationLevel: 0, airRecirculationMode: "auto_recirculation" },
          rear_right: { targetTempC: 22.0, fanSpeedLevel: 2, seatHeatingLevel: 0, seatVentilationLevel: 0, airRecirculationMode: "auto_recirculation" },
        },
        300
      );

      expect(report.overallCabinAverageTempC).toBeLessThan(34.0);
      expect(report.hvacPowerConsumptionKw).toBeGreaterThan(0);
      expect(report.heatPumpCop).toBeGreaterThanOrEqual(2.0);
      expect(report.zones.driver.currentTempC).toBeDefined();
      expect(report.zones.driver.perceivedThermalComfortPmv).toBeDefined();
    });
  });

  // ==========================================================================
  // 9. CABIN PSYCHOACOUSTICS SOLVER
  // ==========================================================================
  describe("CabinPsychoacousticsSolver", () => {
    it("calculates Sabine RT60 reverberation time, Speech Transmission Index, and ANC attenuation", () => {
      const report = CabinPsychoacousticsSolver.solveCabinAcoustics(
        {
          cabinVolumeM3: 3.4,
          internalSurfaceAreaM2: 12.8,
          primaryUpholstery: "nappa_leather",
          headlinerMaterial: "perforated_alcantara",
          carpetDensityGsm: 1800,
          acousticGlassThicknessMm: 5.2,
          hasActiveNoiseCancellation: true,
          speakerChannelCount: 21,
          amplifierPowerWattsRms: 1400,
        },
        120
      );

      expect(report.overallSplDbA).toBeGreaterThan(40);
      expect(report.overallSplDbA).toBeLessThan(75);
      expect(report.noiseAttenuatedByAncDb).toBeGreaterThan(0);
      expect(report.reverberationTimeRt60Seconds).toBeGreaterThan(0.1);
      expect(report.speechTransmissionIndexSti).toBeGreaterThanOrEqual(0.7);
      expect(report.articulationIndexPct).toBeGreaterThan(70);
    });
  });

  // ==========================================================================
  // 10. SAE J1100 ERGONOMICS & BIOMETRICS SOLVER
  // ==========================================================================
  describe("SaeJ1100ErgonomicsBiometrics", () => {
    it("evaluates driver H-point, SAE J941 eyellipse, and ECE R43 sightline angles", () => {
      const result = SaeJ1100ErgonomicsBiometrics.evaluateDriverPackaging(
        {
          percentile: "95th_male",
          statureMm: 1880,
          sittingHeightMm: 980,
          armSpanMm: 1920,
          wearingHelmet: false,
        },
        {
          acceleratorHeelPointXyzMm: [0, -450, 200],
          steeringWheelCenterPivotMm: [480, -450, 680],
          steeringWheelDiameterMm: 360,
          seatTrackTravelXRangeMm: [-120, 120],
          seatHeightAdjustmentZRangeMm: [-30, 30],
          seatBackAngleRangeDeg: [18, 32],
          windshieldHeaderZMm: 1180,
          aPillarLeftAngleDeg: 32,
          aPillarWidthMm: 65,
          roofHeadlinerZMm: 1220,
        },
        0.7,
        24.0
      );

      expect(result.hPointCoordinateMm[0]).toBeGreaterThan(0);
      expect(result.eyellipseCentroidMm[2]).toBeGreaterThan(result.hPointCoordinateMm[2]);
      expect(result.headroomClearanceMm).toBeGreaterThan(0);
      expect(result.kneeAngleDeg).toBeGreaterThan(80);
      expect(result.aPillarBinocularObscurationDeg).toBeLessThan(10);
      expect(result.driverComfortScore).toBeGreaterThan(60);
    });
  });

  // ==========================================================================
  // 11. COMPLETE INTERIOR GLB MASTER GENERATOR
  // ==========================================================================
  describe("CompleteInteriorGlbMasterGenerator", () => {
    it("builds and exports luxury executive, hypercar carbon, and gt3 track GLB buffers", async () => {
      const luxuryScene = CompleteInteriorGlbMasterGenerator.buildInteriorScene("luxury_executive", 0.0);
      expect(luxuryScene).toBeInstanceOf(THREE.Scene);
      expect(luxuryScene.children.length).toBeGreaterThanOrEqual(6);

      const hypercarScene = CompleteInteriorGlbMasterGenerator.buildInteriorScene("hypercar_carbon", 0.0);
      expect(hypercarScene).toBeInstanceOf(THREE.Scene);

      const gt3Scene = CompleteInteriorGlbMasterGenerator.buildInteriorScene("gt3_competition", 0.1);
      expect(gt3Scene).toBeInstanceOf(THREE.Scene);

      const glbBuffer = await CompleteInteriorGlbMasterGenerator.exportSceneToGlbBufferAsync(luxuryScene);
      expect(glbBuffer).toBeDefined();
      expect(glbBuffer.byteLength).toBeGreaterThan(1000);
    });
  });
});
