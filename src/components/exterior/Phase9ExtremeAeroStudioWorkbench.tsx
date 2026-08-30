/**
 * ============================================================================
 * PHASE 9 EXTREME AERO & DYNAMIC HYDRAULIC WORKBENCH
 * ============================================================================
 * Interactive Three.js WebGL workbench for extreme hypercar engineering:
 *
 * 1. 4-Quadrant Active Aero Flap Vectoring Sliders (FL, FR, RL, RR Flap Angles)
 * 2. Instant Dynamic Airbrake Deployment ($68^\circ$ Pitch Emergency Brake Mode)
 * 3. Active Pushrod Stance Geometry & Ride Height Adjuster ($-35\text{mm} \to +40\text{mm}$)
 * 4. Multi-Zone RGB Neon Underglow Strobe & Palette Customizer
 * 5. Radiator & Intercooler Thermal Rejection Flow Rate Telemetry HUD
 * 6. High-Fidelity Universal Binary GLB Export (.glb)
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CompletePhase9MasterHypercarAssembly, Phase9CompleteVehicleConfig } from "../../exterior3d/generators/completePhase9MasterHypercarAssembly";
import { ActiveHydraulicAeroFlapsDrsCad } from "../../exterior3d/aerodynamics/activeHydraulicAeroFlapsDrsCad";
import { HyperExtremeSculptedBodyworkCad } from "../../exterior3d/geometry/hyperExtremeSculptedBodyworkCad";
import { DualIntercoolerRadiatorHeatExchangerCadGenerator } from "../../exterior3d/generators/dualIntercoolerRadiatorHeatExchangerCadGenerator";
import { ActiveSuspensionStanceGeometryCad } from "../../exterior3d/kinematics/activeSuspensionStanceGeometryCad";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { CarbonWeavePattern } from "../../exterior3d/materials/proceduralCarbonFiberWeaveArchitectures";

export const Phase9ExtremeAeroStudioWorkbench: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  // ── 4-Quadrant Flap Controls ──
  const [flAngle, setFlAngle] = useState<number>(12);
  const [frAngle, setFrAngle] = useState<number>(12);
  const [rlAngle, setRlAngle] = useState<number>(24);
  const [rrAngle, setRrAngle] = useState<number>(24);
  const [isAirbrakeActive, setIsAirbrakeActive] = useState<boolean>(false);
  const [isDrsActive, setIsDrsActive] = useState<boolean>(false);

  // ── Sculpted Bodywork Toggles ──
  const [hasSidepodUndercuts, setHasSidepodUndercuts] = useState<boolean>(true);
  const [hasRoofScoop, setHasRoofScoop] = useState<boolean>(true);
  const [hasHoodSDuct, setHasHoodSDuct] = useState<boolean>(true);
  const [hasFlyingButtresses, setHasFlyingButtresses] = useState<boolean>(true);

  // ── Active Stance & Suspension ──
  const [frontRideHeightMm, setFrontRideHeightMm] = useState<number>(-20); // -35 to +40
  const [rearRideHeightMm, setRearRideHeightMm] = useState<number>(-15);

  // ── Underglow & Styling ──
  const [underglowColorHex, setUnderglowColorHex] = useState<string>("#00f0ff");
  const [underglowIntensity, setUnderglowIntensity] = useState<number>(1.8);
  const [bodyColorHex, setBodyColorHex] = useState<string>("#00f0ff");
  const [carbonPattern, setCarbonPattern] = useState<CarbonWeavePattern>("FORGED_COMPOSITE_CHOPPED");

  // ── Telemetry Solvers ──
  const flapTelemetry = useMemo(() => {
    return ActiveHydraulicAeroFlapsDrsCad.solveFlapVectoringTelemetry(
      {
        flFlapAngleDeg: flAngle,
        frFlapAngleDeg: frAngle,
        rlFlapAngleDeg: rlAngle,
        rrFlapAngleDeg: rrAngle,
        isAirbrakeActive,
        isDrsActive,
        hasHydraulicPistons: true,
      },
      280
    );
  }, [flAngle, frAngle, rlAngle, rrAngle, isAirbrakeActive, isDrsActive]);

  const coolingMetrics = useMemo(() => {
    return DualIntercoolerRadiatorHeatExchangerCadGenerator.solveCoolingThermalMetrics(
      {
        radiatorCoreWidthMm: 580,
        radiatorCoreHeightMm: 340,
        intercoolerCoreThicknessMm: 85,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3200,
        hasAnodizedAnFittings: true,
      },
      280
    );
  }, []);

  const stanceTelemetry = useMemo(() => {
    return ActiveSuspensionStanceGeometryCad.solveStanceTelemetry({
      mode: "TRACK_ATTACK_SLAMMED",
      frontRideHeightOffsetMm: frontRideHeightMm,
      rearRideHeightOffsetMm: rearRideHeightMm,
      frontCamberDeg: -3.2,
      rearCamberDeg: -2.4,
      hasDssvDampers: true,
      hasHeaveSprings: true,
    });
  }, [frontRideHeightMm, rearRideHeightMm]);

  // ── Rebuild Master Model ──
  const rebuildVehicleModel = useCallback(() => {
    if (!sceneRef.current) return;

    if (carGroupRef.current) {
      sceneRef.current.remove(carGroupRef.current);
      carGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    }

    const config: Phase9CompleteVehicleConfig = {
      name: "APEX_HUAYRA_ACTIVE_VECTOR",
      bodyColorHex,
      carbonPattern,
      sculptedBody: {
        hasSidepodUndercuts,
        sidepodUndercutDepthMm: 180,
        hasRoofPeriscopeScoop: hasRoofScoop,
        roofScoopHeightMm: 160,
        hasHoodSDuct,
        sDuctWidthMm: 420,
        hasFlyingButtresses,
        buttressSpanMm: 680,
      },
      activeFlaps: {
        flFlapAngleDeg: flAngle,
        frFlapAngleDeg: frAngle,
        rlFlapAngleDeg: rlAngle,
        rrFlapAngleDeg: rrAngle,
        isAirbrakeActive,
        isDrsActive,
        hasHydraulicPistons: true,
      },
      cooling: {
        radiatorCoreWidthMm: 580,
        radiatorCoreHeightMm: 340,
        intercoolerCoreThicknessMm: 85,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3200,
        hasAnodizedAnFittings: true,
      },
      suspension: {
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: frontRideHeightMm,
        rearRideHeightOffsetMm: rearRideHeightMm,
        frontCamberDeg: -3.2,
        rearCamberDeg: -2.4,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      },
      sensorsAndUnderglow: {
        hasRoofLidarPod: true,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex,
        underglowIntensity,
        underglowMode: "BREATHING_PULSE",
      },
      exhaustTempC: 820,
    };

    const vehicleMaster = CompletePhase9MasterHypercarAssembly.generateMasterVehicle(config);
    sceneRef.current.add(vehicleMaster);
    carGroupRef.current = vehicleMaster;
  }, [
    bodyColorHex,
    carbonPattern,
    hasSidepodUndercuts,
    hasRoofScoop,
    hasHoodSDuct,
    hasFlyingButtresses,
    flAngle,
    frAngle,
    rlAngle,
    rrAngle,
    isAirbrakeActive,
    isDrsActive,
    frontRideHeightMm,
    rearRideHeightMm,
    underglowColorHex,
    underglowIntensity,
  ]);

  // ── Viewport Initialization ──
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030508);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.0, 2.2, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Adaptive Render Loop
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };

    controls.addEventListener("change", markDirty);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      if (isDirty) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 1500) {
          isDirty = false;
        }
      }
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      markDirty();
    };
    window.addEventListener("resize", handleResize);

    rebuildVehicleModel();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    rebuildVehicleModel();
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.shadowMap.needsUpdate = true;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [rebuildVehicleModel]);

  // ── Universal Binary GLB Export ──
  const handleExportGlb = async () => {
    if (!carGroupRef.current) return;
    playHMIClickSound();
    try {
      const res = await UniversalGlbExporter.exportVehicleToGlb(carGroupRef.current, {
        binary: true,
        vehicleName: "APEX_HUAYRA_ACTIVE_VECTOR_PHASE9",
      });
      const glbBlob = new Blob([res.buffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(glbBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `APEX_PHASE9_HYPERCAR_${Date.now()}.glb`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export GLB", e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/80 text-white rounded-2xl border border-white/10 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
          <h2 className="text-sm font-bold tracking-widest text-emerald-300 uppercase">
            Phase 9 Extreme Aero & Dynamic Hydraulic CAD Workbench
          </h2>
        </div>
        <button
          onClick={handleExportGlb}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-amber-600 hover:from-emerald-400 hover:to-amber-500 text-xs font-bold uppercase tracking-wider text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          Export Binary GLB (.glb)
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left 3D Viewport */}
        <div className="relative flex-1 bg-black/60 min-h-[420px]" ref={mountRef}>
          {/* Real-time Flap Vectoring HUD */}
          <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-10">
            <div className="px-3.5 py-2.5 rounded-xl bg-black/80 border border-emerald-500/30 backdrop-blur-md text-xs font-mono text-emerald-200">
              <div className="text-[10px] text-emerald-400 uppercase tracking-widest">4-Quadrant Downforce Vectoring</div>
              <div className="text-sm font-bold text-white mt-0.5">{flapTelemetry.totalDownforceN} N <span className="text-xs text-gray-400">({(flapTelemetry.totalDownforceN / 9.80665).toFixed(0)} kg)</span></div>
              <div className="text-[11px] text-emerald-300/80">Anti-Roll Torque: {flapTelemetry.rollRestoringTorqueNm} Nm</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md text-xs font-mono text-amber-200">
              <div className="text-[10px] text-amber-400 uppercase tracking-widest">Pushrod Stance & Heat Exchanger</div>
              <div className="text-sm font-bold text-white mt-0.5">Clearance: {stanceTelemetry.groundClearanceFrontMm}mm F / {stanceTelemetry.groundClearanceRearMm}mm R</div>
              <div className="text-[11px] text-amber-300/80">Heat Rejection: {coolingMetrics.totalHeatRejectionKw} kW (ΔT {coolingMetrics.chargeAirTempDropC}°C)</div>
            </div>
          </div>
        </div>

        {/* Right Engineering Controls */}
        <div className="w-full lg:w-96 p-5 bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto flex flex-col gap-5">
          {/* Section 1: 4-Quadrant Flap Corner Controls */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">4-Quadrant Active Aero Flaps</h3>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setIsAirbrakeActive(!isAirbrakeActive);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                  isAirbrakeActive
                    ? "bg-red-500/30 border-red-400 text-red-300 animate-pulse shadow-[0_0_10px_#ef4444]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {isAirbrakeActive ? "AIRBRAKE DEPLOYED (68°)" : "DEPLOY AIRBRAKE"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-300">Front-Left ({flAngle}°)</span>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={flAngle}
                  onChange={(e) => setFlAngle(parseInt(e.target.value, 10))}
                  className="accent-emerald-400 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-300">Front-Right ({frAngle}°)</span>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={frAngle}
                  onChange={(e) => setFrAngle(parseInt(e.target.value, 10))}
                  className="accent-emerald-400 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-300">Rear-Left ({rlAngle}°)</span>
                <input
                  type="range"
                  min="0"
                  max="68"
                  value={rlAngle}
                  onChange={(e) => setRlAngle(parseInt(e.target.value, 10))}
                  className="accent-emerald-400 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-300">Rear-Right ({rrAngle}°)</span>
                <input
                  type="range"
                  min="0"
                  max="68"
                  value={rrAngle}
                  onChange={(e) => setRrAngle(parseInt(e.target.value, 10))}
                  className="accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 2: Sculpted Bodywork */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Sculpted Aerodynamic Bodywork</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              {[
                { label: "Deep Undercuts", state: hasSidepodUndercuts, set: setHasSidepodUndercuts },
                { label: "Roof Ram Scoop", state: hasRoofScoop, set: setHasRoofScoop },
                { label: "Hood S-Duct", state: hasHoodSDuct, set: setHasHoodSDuct },
                { label: "Flying Buttress", state: hasFlyingButtresses, set: setHasFlyingButtresses },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playHMIClickSound();
                    item.set(!item.state);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    item.state
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 3: Active Suspension Stance */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Pushrod Suspension Stance</h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Front Ride Height Offset</span>
                <span className="font-mono text-emerald-400">{frontRideHeightMm} mm</span>
              </div>
              <input
                type="range"
                min="-35"
                max="40"
                value={frontRideHeightMm}
                onChange={(e) => setFrontRideHeightMm(parseInt(e.target.value, 10))}
                className="accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Rear Ride Height Offset</span>
                <span className="font-mono text-emerald-400">{rearRideHeightMm} mm</span>
              </div>
              <input
                type="range"
                min="-30"
                max="25"
                value={rearRideHeightMm}
                onChange={(e) => setRearRideHeightMm(parseInt(e.target.value, 10))}
                className="accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 4: RGB Underglow */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Cyberpunk RGB Underglow</h3>
            <div className="flex gap-2">
              {["#00f0ff", "#10b981", "#f59e0b", "#ef4444", "#f59e0b"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    playHMIClickSound();
                    setUnderglowColorHex(c);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    underglowColorHex === c ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
