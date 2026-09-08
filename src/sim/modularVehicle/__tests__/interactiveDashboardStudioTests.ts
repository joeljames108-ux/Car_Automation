// ============================================================================
// INTERACTIVE AUTOMOTIVE DASHBOARD & COCKPIT STUDIO — TEST SUITE
// ============================================================================
// Validates:
// 1. Master GLB asset existence and payload size (deterministic Blender 5.2 export)
// 2. Full semantic state configuration across 7 Steering Wheels, 7 Shifters,
//    11 Trims, 8 Infotainment Modes, 5 Clusters, HUD, and Seating
// 3. Multi-physics engineering consequence engine (Price, Weight, Power, Scores)
// 4. Factory Theme Presets batch application
// 5. Undo / Redo history stack and versioned JSON Save / Load serialization
// 6. Camera pose calibration and exploded view parameters
// ============================================================================

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  useInteriorDashboardConfigStore,
  computeCockpitEngineering,
  COCKPIT_THEME_PRESETS,
  SteeringWheelStyle,
  ShifterStyle,
  DashboardTrimType,
  InfotainmentMode,
  ClusterStyle,
  HUDMode,
  DriveModeType,
  SeatStyle,
} from "../../../state/interiorDashboardConfigStore";

export function runInteractiveDashboardStudioTests(): { passed: number; failed: number } {
  console.log("\n================================================================");
  console.log("RUNNING INTERACTIVE AUTOMOTIVE DASHBOARD & COCKPIT STUDIO TESTS");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`[FAIL] ${name}: ${err?.message || err}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Master GLB Asset Existence & Size Verification
  // --------------------------------------------------------------------------
  runTest("TEST 1: Blender 5.2 Master GLB payload exists and meets size threshold", () => {
    const glbPath = path.resolve(process.cwd(), "public/models/interior/dashboard_interactive_master.glb");
    assert.ok(fs.existsSync(glbPath), `Expected GLB file at ${glbPath}`);
    const stats = fs.statSync(glbPath);
    assert.ok(stats.size > 500000, `Expected GLB size > 500 KB, got ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`       Verified GLB asset: ${(stats.size / 1024).toFixed(1)} KB at ${glbPath}`);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Steering Wheel Subassembly Switching (All 7 Styles)
  // --------------------------------------------------------------------------
  runTest("TEST 2: Steering wheel modular styles (7 discrete architectures)", () => {
    const store = useInteriorDashboardConfigStore.getState();
    const wheelStyles: SteeringWheelStyle[] = [
      "sport",
      "gt_3spoke",
      "yoke",
      "formula",
      "luxury_2spoke",
      "classic_4spoke",
      "performance_4spoke",
    ];

    for (const style of wheelStyles) {
      store.setSteeringWheelStyle(style);
      const updated = useInteriorDashboardConfigStore.getState();
      assert.equal(updated.steeringWheelStyle, style, `Failed to set steering wheel style: ${style}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 3: Shifter Mechanism Switching (All 7 Selectors)
  // --------------------------------------------------------------------------
  runTest("TEST 3: Shifter mechanism selectors (7 discrete assemblies)", () => {
    const store = useInteriorDashboardConfigStore.getState();
    const shifters: ShifterStyle[] = [
      "auto",
      "manual_gated",
      "manual_h",
      "toggle",
      "rotary",
      "crystal",
      "performance",
    ];

    for (const shifter of shifters) {
      store.setShifterStyle(shifter);
      const updated = useInteriorDashboardConfigStore.getState();
      assert.equal(updated.shifterStyle, shifter, `Failed to set shifter style: ${shifter}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 4: Dashboard Trim PBR Material Presets (11 Options)
  // --------------------------------------------------------------------------
  runTest("TEST 4: Dashboard trim material families (11 PBR trim types)", () => {
    const store = useInteriorDashboardConfigStore.getState();
    const trims: DashboardTrimType[] = [
      "walnut",
      "dark_walnut",
      "carbon",
      "forged_carbon",
      "titanium",
      "aluminum",
      "piano_black",
      "smoked_chrome",
      "bronze",
      "copper",
      "ceramic",
    ];

    for (const trim of trims) {
      store.setDashboardTrimMaterial(trim);
      const updated = useInteriorDashboardConfigStore.getState();
      assert.equal(updated.dashboardTrimMaterial, trim, `Failed to set dashboard trim: ${trim}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 5: Dynamic Infotainment Display Modes (8 Modes)
  // --------------------------------------------------------------------------
  runTest("TEST 5: Infotainment vector UI modes (8 dynamic modes)", () => {
    const store = useInteriorDashboardConfigStore.getState();
    const modes: InfotainmentMode[] = [
      "navigation",
      "telemetry",
      "media",
      "climate",
      "vehicle",
      "camera",
      "performance",
      "settings",
    ];

    for (const mode of modes) {
      store.setInfotainmentMode(mode);
      const updated = useInteriorDashboardConfigStore.getState();
      assert.equal(updated.infotainmentMode, mode, `Failed to set infotainment mode: ${mode}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 6: Instrument Cluster Styles & Projected HUD Modes
  // --------------------------------------------------------------------------
  runTest("TEST 6: Instrument cluster styles & HUD projection planes", () => {
    const store = useInteriorDashboardConfigStore.getState();
    const clusters: ClusterStyle[] = ["digital", "analog", "performance", "minimal", "track"];
    const hudModes: HUDMode[] = ["off", "minimal", "performance", "navigation"];

    for (const cluster of clusters) {
      store.setClusterStyle(cluster);
      assert.equal(useInteriorDashboardConfigStore.getState().clusterStyle, cluster);
    }

    for (const hud of hudModes) {
      store.setHudMode(hud);
      assert.equal(useInteriorDashboardConfigStore.getState().hudMode, hud);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 7: Multi-Physics Engineering Consequence Engine Calculations
  // --------------------------------------------------------------------------
  runTest("TEST 7: Multi-physics engineering engine (Price, Mass, Power, Radar Scores)", () => {
    // 1. Lightweight Motorsport Configuration
    const trackMetrics = computeCockpitEngineering({
      steeringWheelStyle: "formula",
      steeringGripMaterial: "alcantara",
      dashboardTrimMaterial: "forged_carbon",
      infotainmentMode: "performance",
      clusterStyle: "track",
      shifterStyle: "performance",
      seatStyle: "racing",
      hudMode: "performance",
      nightMode: false,
    });

    assert.ok(trackMetrics.totalPriceDelta > 10000, `Expected track price > $10,000, got ${trackMetrics.totalPriceDelta}`);
    assert.ok(trackMetrics.totalWeightDelta < -15, `Expected weight reduction < -15kg, got ${trackMetrics.totalWeightDelta}kg`);
    assert.ok(trackMetrics.trackScore >= 90, `Expected track score >= 90, got ${trackMetrics.trackScore}`);
    assert.ok(trackMetrics.sportScore >= 90, `Expected sport score >= 90, got ${trackMetrics.sportScore}`);

    // 2. High Luxury Grand Touring Configuration
    const luxuryMetrics = computeCockpitEngineering({
      steeringWheelStyle: "luxury_2spoke",
      steeringGripMaterial: "leather",
      dashboardTrimMaterial: "walnut",
      infotainmentMode: "navigation",
      clusterStyle: "analog",
      shifterStyle: "crystal",
      seatStyle: "luxury",
      hudMode: "off",
      nightMode: false,
    });

    assert.ok(luxuryMetrics.luxuryScore >= 90, `Expected luxury score >= 90, got ${luxuryMetrics.luxuryScore}`);
    assert.ok(luxuryMetrics.comfortScore >= 90, `Expected comfort score >= 90, got ${luxuryMetrics.comfortScore}`);
    assert.ok(luxuryMetrics.totalWeightDelta > 15, `Expected weight addition > 15kg, got ${luxuryMetrics.totalWeightDelta}kg`);
    assert.ok(luxuryMetrics.totalPowerConsumptionW > 200, `Expected power draw > 200W, got ${luxuryMetrics.totalPowerConsumptionW}W`);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Curated Theme Presets Application
  // --------------------------------------------------------------------------
  runTest("TEST 8: Batch theme presets application across all subassemblies", () => {
    const store = useInteriorDashboardConfigStore.getState();

    for (const preset of COCKPIT_THEME_PRESETS) {
      store.applyThemePreset(preset.id);
      const state = useInteriorDashboardConfigStore.getState();

      assert.equal(state.steeringWheelStyle, preset.steeringWheelStyle, `Mismatch wheel for ${preset.id}`);
      assert.equal(state.dashboardTrimMaterial, preset.dashboardTrimMaterial, `Mismatch trim for ${preset.id}`);
      assert.equal(state.shifterStyle, preset.shifterStyle, `Mismatch shifter for ${preset.id}`);
      assert.equal(state.clusterStyle, preset.clusterStyle, `Mismatch cluster for ${preset.id}`);
      assert.equal(state.stitchingColor, preset.stitchingColor, `Mismatch stitching for ${preset.id}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 9: History Stack (Undo & Redo Verification)
  // --------------------------------------------------------------------------
  runTest("TEST 9: Configurator undo/redo history stack", () => {
    const store = useInteriorDashboardConfigStore.getState();
    store.reset();

    // Make sequential changes
    store.setSteeringWheelStyle("formula");
    assert.equal(useInteriorDashboardConfigStore.getState().steeringWheelStyle, "formula");

    store.setDashboardTrimMaterial("forged_carbon");
    assert.equal(useInteriorDashboardConfigStore.getState().dashboardTrimMaterial, "forged_carbon");

    // Perform Undo
    store.undo();
    assert.equal(useInteriorDashboardConfigStore.getState().dashboardTrimMaterial, "walnut"); // reverted to previous default

    store.undo();
    assert.equal(useInteriorDashboardConfigStore.getState().steeringWheelStyle, "sport"); // reverted to initial

    // Perform Redo
    store.redo();
    assert.equal(useInteriorDashboardConfigStore.getState().steeringWheelStyle, "formula");
  });

  // --------------------------------------------------------------------------
  // TEST 10: Versioned JSON Save / Load Round-Trip
  // --------------------------------------------------------------------------
  runTest("TEST 10: Versioned JSON save and load serialization round-trip", () => {
    const store = useInteriorDashboardConfigStore.getState();

    // Set distinctive configuration
    store.setSteeringWheelStyle("gt_3spoke");
    store.setDashboardTrimMaterial("titanium");
    store.setShifterStyle("manual_gated");
    store.setStitchingColor("gold");
    store.setNightMode(true);

    const exportedJson = store.exportConfigJson();
    assert.ok(exportedJson.length > 50, "Exported JSON was empty or too short");

    const parsed = JSON.parse(exportedJson);
    assert.equal(parsed.version, "5.2");
    assert.equal(parsed.steeringWheelStyle, "gt_3spoke");
    assert.equal(parsed.dashboardTrimMaterial, "titanium");

    // Reset store to default
    store.reset();
    assert.notEqual(useInteriorDashboardConfigStore.getState().dashboardTrimMaterial, "titanium");

    // Import saved JSON
    const success = store.importConfigJson(exportedJson);
    assert.ok(success, "importConfigJson returned false");

    const reloaded = useInteriorDashboardConfigStore.getState();
    assert.equal(reloaded.steeringWheelStyle, "gt_3spoke");
    assert.equal(reloaded.dashboardTrimMaterial, "titanium");
    assert.equal(reloaded.shifterStyle, "manual_gated");
    assert.equal(reloaded.stitchingColor, "gold");
    assert.equal(reloaded.nightMode, true);
  });

  // --------------------------------------------------------------------------
  // TEST 11: Camera Calibration & Height Offsets
  // --------------------------------------------------------------------------
  runTest("TEST 11: Driver perspective camera calibration & height bounds", () => {
    const store = useInteriorDashboardConfigStore.getState();
    store.reset();
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "dashboard_center", "Default camera pose must be dashboard_center");

    const heights: ("low" | "normal" | "tall")[] = ["low", "normal", "tall"];
    for (const h of heights) {
      store.setDriverHeight(h);
      assert.equal(useInteriorDashboardConfigStore.getState().driverHeight, h);
    }

    const poses = [
      "dashboard_center",
      "driver",
      "driver_close",
      "steering",
      "cluster",
      "infotainment",
      "console",
      "seats",
      "doors",
      "vents",
      "passenger",
      "full_cockpit",
      "orbit_360",
      "exploded",
    ] as const;
    for (const p of poses) {
      store.setCameraPose(p);
      assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, p);
    }

    // Contextual auto-focus tests:
    // Configuring seats must automatically focus camera on seats
    store.setSeatStyle("bucket");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "seats");
    assert.equal(useInteriorDashboardConfigStore.getState().seatStyle, "bucket");

    store.setSeatBeltColor("red");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "seats");

    // Configuring shifter must focus on console
    store.setShifterStyle("manual_gated");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "console");

    // Switching active panel to seats must focus on seats
    store.setActivePanel("seats");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "seats");
    assert.equal(useInteriorDashboardConfigStore.getState().activePanel, "seats");

    // Switching active panel to steering must focus on steering
    store.setActivePanel("steering");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "steering");

    // Switching active panel to dashboard must focus on dashboard_center
    store.setActivePanel("dashboard");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "dashboard_center");

    // Resetting must restore default dashboard_center pose
    store.reset();
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "dashboard_center");
  });

  // --------------------------------------------------------------------------
  // TEST 12: Bidirectional Synchronization Between Steppers & 3D Model Properties
  // --------------------------------------------------------------------------
  runTest("TEST 12: Bidirectional synchronization between 10 steppers and 3D properties", () => {
    const store = useInteriorDashboardConfigStore.getState();
    store.reset();

    // 1. Stepper -> 3D synchronization
    // Steering Wheel Stepper: index 2 is "Aerodynamic Track Yoke" -> sets steeringWheelStyle = 'yoke'
    store.setOption("steeringWheel", 2);
    assert.equal(useInteriorDashboardConfigStore.getState().steeringWheelStyle, "yoke", "Setting steering stepper to 2 must set 3D style to yoke");
    assert.equal(useInteriorDashboardConfigStore.getState().selections.steeringWheel, 2);

    // Instrument Cluster Stepper: index 0 is "Analog Dials" -> sets clusterStyle = 'analog'
    store.setOption("instrumentCluster", 0);
    assert.equal(useInteriorDashboardConfigStore.getState().clusterStyle, "analog", "Setting cluster stepper to 0 must set 3D cluster to analog");

    // Decorative Trim Stepper: index 2 is "Carbon Fiber 2x2" -> sets dashboardTrimMaterial = 'carbon'
    store.setOption("interiorTrim", 2);
    assert.equal(useInteriorDashboardConfigStore.getState().dashboardTrimMaterial, "carbon", "Setting trim stepper to 2 must set 3D trim to carbon");

    // Seat Architecture Stepper: index 2 is "Carbon Fiber Bucket" -> sets seatStyle = 'bucket'
    store.setOption("seatType", 2);
    assert.equal(useInteriorDashboardConfigStore.getState().seatStyle, "bucket", "Setting seat stepper to 2 must set 3D seat to bucket");

    // 2. 3D Mutator -> Steppers & Metrics synchronization
    // When user selects a classic wheel from the 3D card:
    store.setSteeringWheelStyle("classic_4spoke");
    assert.equal(useInteriorDashboardConfigStore.getState().selections.steeringWheel, 0, "Setting 3D classic wheel must sync stepper to index 0");
    assert.ok(useInteriorDashboardConfigStore.getState().metrics.reliability > 0, "Metrics must recompute on 3D wheel change");

    // When user selects walnut trim from 3D card:
    store.setDashboardTrimMaterial("walnut");
    assert.equal(useInteriorDashboardConfigStore.getState().selections.interiorTrim, 3, "Setting 3D walnut trim must sync stepper to index 3");

    // When user selects standard comfort seat from 3D card:
    store.setSeatStyle("standard");
    assert.equal(useInteriorDashboardConfigStore.getState().selections.seatType, 0, "Setting 3D standard seat must sync stepper to index 0");

    // When user changes color swatch:
    store.setColor("#7f1d1d");
    assert.equal(useInteriorDashboardConfigStore.getState().interiorColor, "#7f1d1d");
    assert.equal(useInteriorDashboardConfigStore.getState().upperDashPadColor, "#7f1d1d");
    assert.equal(useInteriorDashboardConfigStore.getState().steeringColor, "#7f1d1d");
  });

  // --------------------------------------------------------------------------
  // TEST 13: Factory Preset & Reset State Integrity
  // --------------------------------------------------------------------------
  runTest("TEST 13: Theme Presets and Factory Reset maintain complete sync", () => {
    const store = useInteriorDashboardConfigStore.getState();
    store.reset();

    // Apply obsidian preset
    store.applyThemePreset("THEME_OBSIDIAN");
    const obsidianState = useInteriorDashboardConfigStore.getState();
    assert.equal(obsidianState.steeringWheelStyle, "sport");
    assert.equal(obsidianState.dashboardTrimMaterial, "carbon");
    assert.equal(obsidianState.selections.steeringWheel, 1);
    assert.equal(obsidianState.selections.interiorTrim, 2);

    // Reset restores all defaults
    store.reset();
    const resetState = useInteriorDashboardConfigStore.getState();
    assert.equal(resetState.cameraPose, "dashboard_center");
    assert.equal(resetState.steeringWheelStyle, "sport");
    assert.equal(resetState.dashboardTrimMaterial, "walnut");
    assert.equal(resetState.selections.steeringWheel, 0);
    assert.equal(resetState.selections.interiorTrim, 0);
    assert.equal(resetState.metrics.overallRating, "C");
  });

  // --------------------------------------------------------------------------
  // TEST 14: Integrated Electronics & Aviation Avionics Architecture
  // --------------------------------------------------------------------------
  runTest("TEST 14: Integrated Electronics & Aviation Avionics Architecture & Telemetry", () => {
    const store = useInteriorDashboardConfigStore.getState();
    store.reset();

    // 1. HUD Avionics Modes Verification
    const hudModes: HUDMode[] = ["off", "minimal", "performance", "navigation"];
    for (const hud of hudModes) {
      store.setHudMode(hud);
      assert.equal(useInteriorDashboardConfigStore.getState().hudMode, hud, `Failed to set HUD mode: ${hud}`);
    }

    // 2. Cluster Styles Verification
    const clusterStyles: ClusterStyle[] = ["digital", "analog", "performance", "minimal", "track"];
    for (const style of clusterStyles) {
      store.setClusterStyle(style);
      assert.equal(useInteriorDashboardConfigStore.getState().clusterStyle, style, `Failed to set cluster style: ${style}`);
    }

    // 3. Electrical Power & Technology Telemetry
    // Activating performance HUD & track cluster increases avionics technology score and power draw
    store.setHudMode("performance");
    store.setClusterStyle("track");
    store.setInfotainmentMode("performance");
    const techState = useInteriorDashboardConfigStore.getState();
    assert.ok(techState.engineering.totalPowerConsumptionW > 0, "Integrated avionics must register power draw");
    assert.ok(techState.engineering.technologyScore > 50, "Advanced avionics cluster & HUD must yield high tech score");

    // 4. Ambient Lighting & Night Mode Synchronization
    store.setAmbientLightColor("cyan");
    store.setLightingMode("night");
    const lightingState = useInteriorDashboardConfigStore.getState();
    assert.equal(lightingState.ambientLightColor, "cyan");
    assert.equal(lightingState.lightingMode, "night");

    // 5. Clean Reset
    store.reset();
    assert.equal(useInteriorDashboardConfigStore.getState().hudMode, "off");
    assert.equal(useInteriorDashboardConfigStore.getState().cameraPose, "dashboard_center");
  });

  console.log("----------------------------------------------------------------");
  console.log(`Dashboard Studio Results: ${passed} passed, ${failed} failed.`);
  console.log("================================================================\n");

  return { passed, failed };
}
