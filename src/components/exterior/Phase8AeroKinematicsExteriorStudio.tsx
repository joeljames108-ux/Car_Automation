/**
 * ============================================================================
 * PHASE 8 AERO-KINEMATICS & HYPER-EXTERIOR 3D STUDIO WORKBENCH
 * ============================================================================
 * Interactive Three.js WebGL workbench for next-gen hypercar engineering:
 *
 * 1. Multi-Axis Dihedral / Butterfly / Gullwing Door Kinematic Actuation (0% to 100%)
 * 2. Active Louvered Fenders, Aerodynamic Canards & Shark Gill Extractors
 * 3. Quad Inconel Exhaust Temperature Modulation ($20^\circ\text{C} \to 950^\circ\text{C}$) with Blued Titanium Shaders
 * 4. Procedural Multi-Axial Carbon Weave Selector (2x2 Twill, Forged Composite, Spread Tow)
 * 5. Real-Time Aero-Acoustic CFD Cockpit Noise HUD (dBA & Sones) & Wind Vector Mesh
 * 6. One-Click High-Resolution Universal Binary GLB Export (.glb)
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HyperAdvancedLouveredFenderAeroCanardCad, LouveredFenderSpec } from "../../exterior3d/geometry/hyperAdvancedLouveredFenderAeroCanardCad";
import { ButterflyDihedralDoorKinematicsCad, DoorKinematicsType } from "../../exterior3d/kinematics/butterflyDihedralDoorKinematicsCad";
import { AeroAcousticCfdWindNoiseSolver } from "../../exterior3d/aerodynamics/aeroAcousticCfdWindNoiseSolver";
import { QuadExhaustInconelTitaniumCadGenerator, ExhaustMountLocation } from "../../exterior3d/generators/quadExhaustInconelTitaniumCadGenerator";
import { ProceduralCarbonFiberWeaveArchitectures, CarbonWeavePattern } from "../../exterior3d/materials/proceduralCarbonFiberWeaveArchitectures";
import { ModularActiveAeroSplitterDiffuserAssembly } from "../../exterior3d/generators/modularActiveAeroSplitterDiffuserAssembly";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

export const Phase8AeroKinematicsExteriorStudio: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  // ── Kinematics & Door Controls ──
  const [doorType, setDoorType] = useState<DoorKinematicsType>("DIHEDRAL_SYNCHRO_HELIX_90");
  const [doorOpenProgress, setDoorOpenProgress] = useState<number>(0.0); // 0 = Closed, 1 = Open

  // ── Aero & Louver Controls ──
  const [louverCount, setLouverCount] = useState<3 | 5 | 7>(7);
  const [canardTiers, setCanardTiers] = useState<1 | 2 | 3>(2);
  const [showSharkGills, setShowSharkGills] = useState<boolean>(true);
  const [splitterFlapAngleDeg, setSplitterFlapAngleDeg] = useState<number>(14);

  // ── Exhaust & Thermal Controls ──
  const [exhaustLocation, setExhaustLocation] = useState<ExhaustMountLocation>("LOWER_DIFFUSER_QUAD_TIPS");
  const [exhaustTempC, setExhaustTempC] = useState<number>(750);
  const [hasBackfireFlames, setHasBackfireFlames] = useState<boolean>(true);

  // ── Carbon Weave & Body Materials ──
  const [carbonPattern, setCarbonPattern] = useState<CarbonWeavePattern>("FORGED_COMPOSITE_CHOPPED");
  const [carbonTintHex, setCarbonTintHex] = useState<string>("#00f0ff");
  const [carbonGloss, setCarbonGloss] = useState<number>(0.92);

  // ── Aero-Acoustics & Simulation ──
  const [airspeedKmH, setAirspeedKmH] = useState<number>(280);
  const [showAcousticMesh, setShowAcousticMesh] = useState<boolean>(false);

  // Computed Real-time Aero-Acoustics & Downforce
  const aeroAcoustics = useMemo(() => {
    return AeroAcousticCfdWindNoiseSolver.solveAeroAcoustics(
      {
        mirrorAerodynamicType: "OPTIMIZED_CARBON_AIRFOIL",
        aPillarRadiusMm: 45,
        windshieldRakeAngleDeg: 26,
        glassType: "ACOUSTIC_PVB_LAMINATED_4_8MM",
        underfloorSealingQualityPct: 92,
      },
      airspeedKmH
    );
  }, [airspeedKmH]);

  const fenderPhysics = useMemo(() => {
    return HyperAdvancedLouveredFenderAeroCanardCad.solveFenderAeroPhysics(
      {
        fenderWidthMm: 2040,
        louverCount,
        louverAngleDeg: 28,
        canardTierCount: canardTiers,
        canardSpanMm: 280,
        hasSharkGillVents: showSharkGills,
        hasAirCurtainDucts: true,
        hasTireWakeDeflectors: true,
      },
      airspeedKmH
    );
  }, [louverCount, canardTiers, showSharkGills, airspeedKmH]);

  const splitterAero = useMemo(() => {
    return ModularActiveAeroSplitterDiffuserAssembly.solveAeroBalance(
      {
        splitterExtensionMm: 180,
        splitterFlapAngleDeg,
        hasRoofSharkFin: true,
        sharkFinHeightMm: 260,
        hasAnodizedTowHook: true,
        towHookColorHex: "#ef4444",
        hasUnderfloorStrakes: true,
      },
      3200,
      airspeedKmH
    );
  }, [splitterFlapAngleDeg, airspeedKmH]);

  // ── Rebuild Full 3D Vehicle Architecture ──
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

    const masterGroup = new THREE.Group();
    masterGroup.name = "PHASE_8_MASTER_HYPERCAR_GROUP";

    // 1. Carbon Weave Material
    const carbonMat = ProceduralCarbonFiberWeaveArchitectures.createCarbonFiberMaterial({
      pattern: carbonPattern,
      resinTintHex: carbonTintHex,
      clearcoatGloss: carbonGloss,
      anisotropyStrength: 0.85,
      weaveScale: 24,
    });

    // 2. Louvered Front Fenders & Canards
    const fenderAssembly = HyperAdvancedLouveredFenderAeroCanardCad.generateFenderCanardAssembly(
      {
        fenderWidthMm: 2040,
        louverCount,
        louverAngleDeg: 28,
        canardTierCount: canardTiers,
        canardSpanMm: 280,
        hasSharkGillVents: showSharkGills,
        hasAirCurtainDucts: true,
        hasTireWakeDeflectors: true,
      },
      { carbonFiberMat: carbonMat }
    );
    masterGroup.add(fenderAssembly);

    // 3. Active Kinematic Doors
    const doorAssembly = ButterflyDihedralDoorKinematicsCad.generateDoorAssembly(
      {
        doorType,
        openProgress: doorOpenProgress,
        doorLengthMm: 1250,
        doorHeightMm: 850,
        hasCarbonAeroMirror: true,
        hasFramelessGlass: true,
        hasPneumaticStruts: true,
      },
      { bodyOuterPaintMat: carbonMat }
    );
    masterGroup.add(doorAssembly);

    // 4. Quad Exhaust Assembly with Dynamic Thermal Shader
    const exhaustAssembly = QuadExhaustInconelTitaniumCadGenerator.generateExhaustAssembly({
      mountLocation: exhaustLocation,
      tipDiameterMm: 102,
      wallThicknessMm: 1.2,
      operatingTempC: exhaustTempC,
      hasBackfireFlames,
      hasHoneycombHeatShield: true,
    });
    masterGroup.add(exhaustAssembly);

    // 5. Active Splitter & Roof Shark Fin
    const splitterAssembly = ModularActiveAeroSplitterDiffuserAssembly.generateAssembly(
      {
        splitterExtensionMm: 180,
        splitterFlapAngleDeg,
        hasRoofSharkFin: true,
        sharkFinHeightMm: 260,
        hasAnodizedTowHook: true,
        towHookColorHex: "#ef4444",
        hasUnderfloorStrakes: true,
      },
      { carbonSplitterMat: carbonMat }
    );
    masterGroup.add(splitterAssembly);

    // 6. Optional Aero-Acoustic Visualization Streamlines
    if (showAcousticMesh) {
      const acousticViz = AeroAcousticCfdWindNoiseSolver.generateAcousticVectorVisualization(airspeedKmH);
      masterGroup.add(acousticViz);
    }

    sceneRef.current.add(masterGroup);
    carGroupRef.current = masterGroup;
  }, [
    doorType,
    doorOpenProgress,
    louverCount,
    canardTiers,
    showSharkGills,
    splitterFlapAngleDeg,
    exhaustLocation,
    exhaustTempC,
    hasBackfireFlames,
    carbonPattern,
    carbonTintHex,
    carbonGloss,
    airspeedKmH,
    showAcousticMesh,
  ]);

  // ── Viewport Initialization ──
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040609);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.8, 2.0, 4.5);
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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    // Grid Floor
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
        vehicleName: "APEX_HYPER_VALKYRIE_LMH",
      });
      const glbBlob = new Blob([res.buffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(glbBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `APEX_HYPER_VALKYRIE_${doorType}_${Date.now()}.glb`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export GLB", e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/80 text-white rounded-2xl border border-white/10 overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-6 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#00f0ff]" />
          <h2 className="text-sm font-bold tracking-widest text-amber-300 uppercase">
            Phase 8 Aero-Kinematics & Hyper-Exterior 3D CAD Workbench
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportGlb}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold uppercase tracking-wider text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            Export Binary GLB (.glb)
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left 3D Viewport */}
        <div className="relative flex-1 bg-black/60 min-h-[420px]" ref={mountRef}>
          {/* Real-time Telemetry Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-10">
            <div className="px-3.5 py-2.5 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md text-xs font-mono text-amber-200">
              <div className="text-[10px] text-amber-400 uppercase tracking-widest">Aero-Acoustics @ {airspeedKmH} km/h</div>
              <div className="text-sm font-bold text-white mt-0.5">{aeroAcoustics.totalCabinNoiseDbA} dBA <span className="text-xs text-gray-400">({aeroAcoustics.zwickerLoudnessSones} Sones)</span></div>
              <div className="text-[11px] text-amber-300/80">Articulation Index: {aeroAcoustics.articulationIndexPct}%</div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md text-xs font-mono text-amber-200">
              <div className="text-[10px] text-amber-400 uppercase tracking-widest">Wheelhouse Pressure Relief</div>
              <div className="text-sm font-bold text-white mt-0.5">-{fenderPhysics.wheelWellPressureReductionPct.toFixed(1)}% <span className="text-xs text-gray-400">(+{fenderPhysics.frontAxleDownforceKg.toFixed(0)} kg front)</span></div>
              <div className="text-[11px] text-amber-300/80">Balance: {splitterAero.aerodynamicBalanceFrontPct}% F / {(100 - splitterAero.aerodynamicBalanceFrontPct).toFixed(1)}% R</div>
            </div>
          </div>
        </div>

        {/* Right Engineering Control Deck */}
        <div className="w-full lg:w-96 p-5 bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto flex flex-col gap-5">
          {/* Section 1: Door Kinematics */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">Door Kinematics & Actuation</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "DIHEDRAL_SYNCHRO_HELIX_90", label: "90° Dihedral Helix" },
                { id: "BUTTERFLY_LE_MANS_FORWARD_UP", label: "Butterfly Le Mans" },
                { id: "GULLWING_ROOF_HINGED", label: "Roof Gullwing" },
                { id: "CONVENTIONAL_FORWARD_SWING", label: "Conventional" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    playHMIClickSound();
                    setDoorType(d.id as DoorKinematicsType);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold border text-left transition-all ${
                    doorType === d.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Door Actuation Slider */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Door Open Position</span>
                <span className="font-mono text-amber-400">{Math.round(doorOpenProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={doorOpenProgress}
                onChange={(e) => setDoorOpenProgress(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 2: Louvered Fenders & Splitter */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">Aero Louvers & Active Splitter</h3>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    playHMIClickSound();
                    setLouverCount(cnt as 3 | 5 | 7);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                    louverCount === cnt
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {cnt} Louvers
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
              <span>Shark Gill Extractors</span>
              <input
                type="checkbox"
                checked={showSharkGills}
                onChange={(e) => setShowSharkGills(e.target.checked)}
                className="accent-amber-400 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Splitter Flap Angle</span>
                <span className="font-mono text-amber-400">{splitterFlapAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={splitterFlapAngleDeg}
                onChange={(e) => setSplitterFlapAngleDeg(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 3: Exhaust Metallurgy & Temperature */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">Inconel / Titanium Exhaust</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "LOWER_DIFFUSER_QUAD_TIPS", label: "Diffuser Quad" },
                { id: "TOP_EXIT_SPYDER_CANNONS", label: "Top Spyder Cannons" },
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    playHMIClickSound();
                    setExhaustLocation(loc.id as ExhaustMountLocation);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                    exhaustLocation === loc.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Exhaust Core Temp (Thermal Bluing)</span>
                <span className="font-mono text-amber-400">{exhaustTempC}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="950"
                step="10"
                value={exhaustTempC}
                onChange={(e) => setExhaustTempC(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 4: Carbon Weave Matrix */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase">Carbon Fiber Weave</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "FORGED_COMPOSITE_CHOPPED", label: "Forged Carbon" },
                { id: "TWILL_2X2_3K", label: "2x2 Twill 3K" },
                { id: "SPREAD_TOW_BIAXIAL", label: "Spread Tow" },
                { id: "PLAIN_WEAVE_1X1", label: "1x1 Plain" },
              ].map((cw) => (
                <button
                  key={cw.id}
                  onClick={() => {
                    playHMIClickSound();
                    setCarbonPattern(cw.id as CarbonWeavePattern);
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                    carbonPattern === cw.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {cw.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
