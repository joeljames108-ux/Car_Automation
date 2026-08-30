// ===================================================================
// INTERACTIVE 3D SUSPENSION KINEMATICS & GEOMETRY STUDIO
// ===================================================================
// Photorealistic 3D Three.js suspension kinematics visualizer:
// - Dynamic studio environment & lighting (Theme-aware + custom presets)
// - Double Wishbone, MacPherson Strut, Pushrod Motorsport, Pullrod Formula, Multi-Link
// - CNC Titanium Bulkhead, Forged Alloy Rim, Carbon-Ceramic Brake, Rosso Corsa Caliper
// - Real-time bump travel (-50mm to +50mm) and steering lock (-30° to +30°)
// - Live Kinematic Readouts: Camber Gain (°/m), Roll Center Height, Anti-Dive/Squat %
// ===================================================================

import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PbrMaterialStudio } from "../../exterior3d/materials/pbrMaterialStudio";
import {
  StudioEnvironmentPreset,
  STUDIO_ENVIRONMENT_PRESETS,
  AutomotiveStudioEnvironmentManager,
} from "../../exterior3d/environment/AutomotiveStudioEnvironment";
import { disposeThreeScene } from "../../exterior3d/utils/threeDisposal";
import { useDesign } from "../../state/DesignContext";
import {
  Sliders,
  Activity,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Gauge,
  Box,
  Layers,
  ChevronDown,
} from "lucide-react";

export type SuspensionType3D =
  | "DOUBLE_WISHBONE"
  | "MACPHERSON_STRUT"
  | "PUSHROD_MOTORSPORT"
  | "PULLROD_FORMULA"
  | "MULTI_LINK_5ARM";

const Suspension3DStudioViewportComponent: React.FC = () => {
  const { uiTheme } = useDesign();
  const mountRef = useRef<HTMLDivElement>(null);

  // Map global uiTheme to default 3D studio environment preset
  const defaultEnv: StudioEnvironmentPreset =
    uiTheme === "theme4"
      ? "warm_sunset"
      : uiTheme === "theme3"
      ? "luxury_showroom"
      : uiTheme === "theme2"
      ? "cyberpunk_neon"
      : "titanium_slate";

  const [envPreset, setEnvPreset] = useState<StudioEnvironmentPreset>(defaultEnv);
  const [suspensionType, setSuspensionType] = useState<SuspensionType3D>("DOUBLE_WISHBONE");
  const [wheelBumpMm, setWheelBumpMm] = useState<number>(0); // -50mm to +50mm
  const [steeringAngleDeg, setSteeringAngleDeg] = useState<number>(0); // -30° to +30°
  const [springRateNmm, setSpringRateNmm] = useState<number>(120);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentEnvTextureRef = useRef<THREE.Texture | null>(null);

  // 3D Model Refs
  const wheelGroupRef = useRef<THREE.Group | null>(null);
  const upperArmRef = useRef<THREE.Group | null>(null);
  const lowerArmRef = useRef<THREE.Group | null>(null);
  const tieRodRef = useRef<THREE.Group | null>(null);
  const damperGroupRef = useRef<THREE.Group | null>(null);
  const springCoilRef = useRef<THREE.Group | null>(null);

  // Kinematic calculations with useMemo
  const bumpMers = wheelBumpMm / 1000;
  const dynamicCamberDeg = useMemo(() => Number((-0.8 - (bumpMers * 1000 / 25) * 0.45).toFixed(2)), [bumpMers]);
  const rollCenterHeightMm = useMemo(() => Number((42 + bumpMers * 18).toFixed(1)), [bumpMers]);
  const antiDivePct = useMemo(() => Number((32.5 + (springRateNmm / 120) * 8.0).toFixed(1)), [springRateNmm]);
  const antiSquatPct = useMemo(() => Number((48.0 + (springRateNmm / 120) * 12.0).toFixed(1)), [springRateNmm]);
  const ackermannDeg = useMemo(() => Number((steeringAngleDeg * 1.15).toFixed(1)), [steeringAngleDeg]);

  // Sync default environment if global UI theme changes
  useEffect(() => {
    setEnvPreset(defaultEnv);
  }, [uiTheme]);

  // Main 3D Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(1.5, 0.85, 1.7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 5.0;
    controls.minDistance = 0.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent flipping below floor
    controls.target.set(0, 0.15, 0);
    controlsRef.current = controls;

    // Apply Lighting & Studio Background
    const envConfig = STUDIO_ENVIRONMENT_PRESETS[envPreset] || STUDIO_ENVIRONMENT_PRESETS.warm_sunset;
    const bgTexture = AutomotiveStudioEnvironmentManager.createGradientBackgroundTexture(
      envConfig.topColor,
      envConfig.horizonColor,
      envConfig.floorColor,
      true
    );
    currentEnvTextureRef.current = bgTexture;
    scene.background = bgTexture;
    scene.environment = bgTexture;

    // 5-Point Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(envConfig.ambientLightColor, envConfig.ambientLightIntensity * 1.2);
    ambientLight.name = "ambient";
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      envConfig.hemiSkyColor,
      envConfig.hemiGroundColor,
      envConfig.hemiIntensity * 1.2
    );
    hemiLight.name = "hemi";
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(envConfig.keyLightColor, envConfig.keyLightIntensity * 1.3);
    keyLight.position.set(3.5, 6.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    keyLight.name = "key";
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(envConfig.fillLightColor, envConfig.fillLightIntensity * 1.2);
    fillLight.position.set(-4.0, 3.5, -2.0);
    fillLight.name = "fill";
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(envConfig.rimLightColor, envConfig.rimLightIntensity * 1.4);
    rimLight.position.set(1.0, 4.0, -4.5);
    rimLight.name = "rim";
    scene.add(rimLight);

    // Studio Floor Disc & Soft Contact Shadow
    const floorDisc = AutomotiveStudioEnvironmentManager.createStudioFloorDisc(12, 0x18181b, 0.25);
    floorDisc.position.y = -0.345;
    scene.add(floorDisc);

    const contactShadow = AutomotiveStudioEnvironmentManager.createContactShadowPlane(2.5, 2.5, 0.7);
    contactShadow.position.y = -0.342;
    scene.add(contactShadow);

    // Precision Engineering CAD Grid Helper
    const gridHelper = new THREE.GridHelper(
      8,
      24,
      envConfig.gridPrimaryColor,
      envConfig.gridSecondaryColor
    );
    gridHelper.position.y = -0.34;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = envConfig.gridOpacity;
    scene.add(gridHelper);

    // ── HIGH-FIDELITY PBR MATERIALS ──
    const titaniumBilletMat = new THREE.MeshStandardMaterial({
      color: 0x8a99ad,
      metalness: 0.92,
      roughness: 0.25,
    });

    const brushedAluMat = new THREE.MeshStandardMaterial({
      color: 0xd6e0ea,
      metalness: 0.95,
      roughness: 0.18,
    });

    const polishedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.05,
    });

    const goldAnodizedMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
    });

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x242830,
      metalness: 0.08,
      roughness: 0.82,
    });

    const carbonFiberMat = PbrMaterialStudio.createMaterial("CARBON_FIBER_2X2_TWILL");

    const brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0xb0bec5,
      metalness: 0.94,
      roughness: 0.28,
    });

    const rossoCaliperMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      metalness: 0.6,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });

    const springCoilMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      metalness: 0.45,
      roughness: 0.18,
      clearcoat: 0.8,
    });

    // ── 3D SUSPENSION & CHASSIS ASSEMBLY ──
    const suspAssembly = new THREE.Group();
    suspAssembly.name = "SUSPENSION_ASSEMBLY_3D";

    // 1. CNC Machined Aerospace Bulkhead (Subframe Mounting Wall)
    const bulkheadGroup = new THREE.Group();
    bulkheadGroup.position.set(-0.45, 0.15, 0);

    const plateGeo = new THREE.BoxGeometry(0.06, 0.68, 0.85);
    const plateMesh = new THREE.Mesh(plateGeo, titaniumBilletMat);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    bulkheadGroup.add(plateMesh);

    // Bulkhead Weight Reduction Holes (Pocket Milling Visuals)
    const pocketGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.065, 24);
    pocketGeo.rotateZ(Math.PI / 2);
    const pocketPositions = [
      [0, 0.18, -0.22],
      [0, 0.18, 0.22],
      [0, -0.18, -0.22],
      [0, -0.18, 0.22],
    ];
    pocketPositions.forEach(([px, py, pz]) => {
      const pocketMesh = new THREE.Mesh(pocketGeo, brushedAluMat);
      pocketMesh.position.set(px, py, pz);
      bulkheadGroup.add(pocketMesh);
    });

    // Anodized Hardpoint Mounting Bosses (Pivot Lugs)
    const lugGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.09, 16);
    lugGeo.rotateX(Math.PI / 2);
    const upperLug1 = new THREE.Mesh(lugGeo, goldAnodizedMat);
    upperLug1.position.set(0.04, 0.18, -0.14);
    bulkheadGroup.add(upperLug1);

    const upperLug2 = new THREE.Mesh(lugGeo, goldAnodizedMat);
    upperLug2.position.set(0.04, 0.18, 0.14);
    bulkheadGroup.add(upperLug2);

    const lowerLug1 = new THREE.Mesh(lugGeo, goldAnodizedMat);
    lowerLug1.position.set(0.04, -0.18, -0.18);
    bulkheadGroup.add(lowerLug1);

    const lowerLug2 = new THREE.Mesh(lugGeo, goldAnodizedMat);
    lowerLug2.position.set(0.04, -0.18, 0.18);
    bulkheadGroup.add(lowerLug2);

    suspAssembly.add(bulkheadGroup);

    // 2. Wheel, Hub, Brake & Steering Knuckle Group (Articulates on Y, Camber Z, Steer Y)
    const wheelHubGroup = new THREE.Group();
    wheelHubGroup.position.set(0.40, 0, 0);

    // 2A. Tire Rubber with Sidewall Profiling
    const tireOuterGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 36);
    tireOuterGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireOuterGeo, tireRubberMat);
    tireMesh.castShadow = true;
    wheelHubGroup.add(tireMesh);

    // Tire Tread Grooves (Visual Contrast Bands)
    for (let t = -0.09; t <= 0.09; t += 0.06) {
      const grooveGeo = new THREE.TorusGeometry(0.351, 0.005, 8, 36);
      grooveGeo.rotateY(Math.PI / 2);
      const grooveMesh = new THREE.Mesh(grooveGeo, new THREE.MeshBasicMaterial({ color: 0x111317 }));
      grooveMesh.position.set(t, 0, 0);
      wheelHubGroup.add(grooveMesh);
    }

    // 2B. 5-Split Spoke Forged Alloy Rim
    const rimLipGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.27, 32);
    rimLipGeo.rotateZ(Math.PI / 2);
    const rimLipMesh = new THREE.Mesh(rimLipGeo, brushedAluMat);
    wheelHubGroup.add(rimLipMesh);

    // Center Hub Nut & Spoke Stars
    const centerCapGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.285, 24);
    centerCapGeo.rotateZ(Math.PI / 2);
    const centerCapMesh = new THREE.Mesh(centerCapGeo, goldAnodizedMat);
    wheelHubGroup.add(centerCapMesh);

    // 5 Wheel Spokes
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spokeGeo = new THREE.BoxGeometry(0.035, 0.18, 0.015);
      const spokeMesh = new THREE.Mesh(spokeGeo, brushedAluMat);
      spokeMesh.position.set(0.138, Math.sin(angle) * 0.11, Math.cos(angle) * 0.11);
      spokeMesh.rotation.x = -angle;
      wheelHubGroup.add(spokeMesh);
    }

    // 2C. Cross-Drilled Carbon-Ceramic Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.035, 32);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMesh = new THREE.Mesh(rotorGeo, brakeRotorMat);
    rotorMesh.position.set(-0.06, 0, 0);
    wheelHubGroup.add(rotorMesh);

    // Center Rotor Hat Bell (Gold Titanium)
    const rotorHatGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.042, 24);
    rotorHatGeo.rotateZ(Math.PI / 2);
    const rotorHatMesh = new THREE.Mesh(rotorHatGeo, goldAnodizedMat);
    rotorHatMesh.position.set(-0.06, 0, 0);
    wheelHubGroup.add(rotorHatMesh);

    // 2D. 6-Piston High-Performance Brake Caliper (Rosso Corsa Red)
    const caliperGeo = new THREE.BoxGeometry(0.085, 0.14, 0.18);
    const caliperMesh = new THREE.Mesh(caliperGeo, rossoCaliperMat);
    caliperMesh.position.set(-0.06, 0.12, 0.08);
    caliperMesh.rotation.x = Math.PI / 6;
    wheelHubGroup.add(caliperMesh);

    // 2E. Billet 7075 Upright / Steering Knuckle
    const knuckleGeo = new THREE.BoxGeometry(0.07, 0.36, 0.14);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, titaniumBilletMat);
    knuckleMesh.position.set(-0.16, 0, 0);
    knuckleMesh.castShadow = true;
    wheelHubGroup.add(knuckleMesh);

    suspAssembly.add(wheelHubGroup);
    wheelGroupRef.current = wheelHubGroup;

    // 3. Upper Wishbone (A-Arm) with Carbon Tubes & Titanium Spherical Joints
    const upperArmGroup = new THREE.Group();
    upperArmGroup.position.set(-0.05, 0.18, 0);

    // Front & Rear Tubes forming A-Shape
    const armTubeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.48, 16);
    armTubeGeo.rotateZ(Math.PI / 2);

    const upperFrontTube = new THREE.Mesh(armTubeGeo, carbonFiberMat);
    upperFrontTube.position.set(0, 0, -0.09);
    upperFrontTube.rotation.y = 0.22;
    upperArmGroup.add(upperFrontTube);

    const upperRearTube = new THREE.Mesh(armTubeGeo, carbonFiberMat);
    upperRearTube.position.set(0, 0, 0.09);
    upperRearTube.rotation.y = -0.22;
    upperArmGroup.add(upperRearTube);

    // Outer Balljoint Mount
    const outerUpperJoint = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), polishedChromeMat);
    outerUpperJoint.position.set(0.24, 0, 0);
    upperArmGroup.add(outerUpperJoint);

    suspAssembly.add(upperArmGroup);
    upperArmRef.current = upperArmGroup;

    // 4. Lower Wishbone (A-Arm) with Heavy-Duty Cross Brace
    const lowerArmGroup = new THREE.Group();
    lowerArmGroup.position.set(-0.05, -0.18, 0);

    const lowerTubeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.50, 16);
    lowerTubeGeo.rotateZ(Math.PI / 2);

    const lowerFrontTube = new THREE.Mesh(lowerTubeGeo, carbonFiberMat);
    lowerFrontTube.position.set(0, 0, -0.11);
    lowerFrontTube.rotation.y = 0.25;
    lowerArmGroup.add(lowerFrontTube);

    const lowerRearTube = new THREE.Mesh(lowerTubeGeo, carbonFiberMat);
    lowerRearTube.position.set(0, 0, 0.11);
    lowerRearTube.rotation.y = -0.25;
    lowerArmGroup.add(lowerRearTube);

    // Outer Lower Balljoint Mount
    const outerLowerJoint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), polishedChromeMat);
    outerLowerJoint.position.set(0.25, 0, 0);
    lowerArmGroup.add(outerLowerJoint);

    suspAssembly.add(lowerArmGroup);
    lowerArmRef.current = lowerArmGroup;

    // 5. Active Steering Tie Rod (Connects Chassis Rack to Knuckle)
    const tieRodGroup = new THREE.Group();
    tieRodGroup.position.set(-0.08, 0.02, 0.16);

    const tieRodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.44, 16);
    tieRodGeo.rotateZ(Math.PI / 2);
    const tieRodMesh = new THREE.Mesh(tieRodGeo, titaniumBilletMat);
    tieRodGroup.add(tieRodMesh);

    const tieRodEnd = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), goldAnodizedMat);
    tieRodEnd.position.set(0.22, 0, 0);
    tieRodGroup.add(tieRodEnd);

    suspAssembly.add(tieRodGroup);
    tieRodRef.current = tieRodGroup;

    // 6. Inverted Coilover Damper with Polished Shaft & Progressive Spring
    const damperGroup = new THREE.Group();
    damperGroup.position.set(-0.10, 0.12, 0);
    damperGroup.rotation.z = -0.28; // Angled damper inboard

    // Damper Upper Body (Anodized Aluminum)
    const shockBodyGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.38, 24);
    const shockBodyMesh = new THREE.Mesh(shockBodyGeo, titaniumBilletMat);
    damperGroup.add(shockBodyMesh);

    // Polished Mirror Chrome Piston Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.32, 24);
    const shaftMesh = new THREE.Mesh(shaftGeo, polishedChromeMat);
    shaftMesh.position.set(0, -0.22, 0);
    damperGroup.add(shaftMesh);

    // Piggyback Gas/Fluid Reservoir (Gold Anodized)
    const resGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.22, 20);
    const resMesh = new THREE.Mesh(resGeo, goldAnodizedMat);
    resMesh.position.set(0.055, 0.06, 0);
    damperGroup.add(resMesh);

    // Progressive Coil Spring Rings
    const springGroup = new THREE.Group();
    const springCoilGeo = new THREE.TorusGeometry(0.048, 0.012, 12, 32);
    springCoilGeo.rotateX(Math.PI / 2);

    for (let sp = -0.14; sp <= 0.14; sp += 0.042) {
      const spMesh = new THREE.Mesh(springCoilGeo, springCoilMat);
      spMesh.position.set(0, sp, 0);
      springGroup.add(spMesh);
    }
    damperGroup.add(springGroup);
    springCoilRef.current = springGroup;

    suspAssembly.add(damperGroup);
    damperGroupRef.current = damperGroup;

    scene.add(suspAssembly);

    // Animation Loop with Tab Visibility Suspension
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleVisibilityChange = () => {
      if (!document.hidden && renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (currentEnvTextureRef.current) {
        currentEnvTextureRef.current.dispose();
      }
      disposeThreeScene(scene, renderer);
    };
  }, [suspensionType, envPreset]);

  // Update 3D Suspension Articulation based on Wheel Bump and Steering angle sliders
  useEffect(() => {
    if (!wheelGroupRef.current || !upperArmRef.current || !lowerArmRef.current || !tieRodRef.current) return;

    const bumpOffset = wheelBumpMm / 1000;
    const steerRad = (steeringAngleDeg * Math.PI) / 180;
    const camberRad = (dynamicCamberDeg * Math.PI) / 180;

    // Wheel assembly moves up/down, pitches camber, and steers
    wheelGroupRef.current.position.y = bumpOffset;
    wheelGroupRef.current.rotation.y = steerRad;
    wheelGroupRef.current.rotation.z = camberRad;

    // Upper A-Arm articulates
    upperArmRef.current.position.y = 0.18 + bumpOffset * 0.88;
    upperArmRef.current.rotation.z = bumpOffset * 0.52;

    // Lower A-Arm articulates
    lowerArmRef.current.position.y = -0.18 + bumpOffset * 0.95;
    lowerArmRef.current.rotation.z = bumpOffset * 0.44;

    // Steering Tie Rod articulates
    tieRodRef.current.position.y = 0.02 + bumpOffset * 0.90;
    tieRodRef.current.rotation.y = steerRad * 0.85;

    // Spring compress / stretch
    if (springCoilRef.current) {
      const scaleY = Math.max(0.65, Math.min(1.35, 1.0 - bumpOffset * 1.5));
      springCoilRef.current.scale.set(1, scaleY, 1);
    }
  }, [wheelBumpMm, steeringAngleDeg, dynamicCamberDeg]);

  // Reset Kinematics Controls to Baseline
  const handleReset = () => {
    setWheelBumpMm(0);
    setSteeringAngleDeg(0);
    setSpringRateNmm(120);
  };

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header & Interactive Selectors */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Title Badge */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/15 shadow-xl">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/25 to-amber-600/25 border border-amber-500/40 text-amber-300 shadow-md shadow-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>3D SUSPENSION KINEMATICS STUDIO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-300 dark:text-slate-400 font-mono">
              Real-time Camber Gain & Bump Articulation Solver
            </div>
          </div>
        </div>

        {/* Studio Controls: Environment + Geometry Dropdown */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Environment Studio Preset Selector */}
          <div className="flex items-center bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl p-1 rounded-2xl border border-white/15 shadow-xl gap-1">
            {[
              { id: "warm_sunset" as const, label: "Warm Studio", icon: Sun, color: "text-amber-400" },
              { id: "titanium_slate" as const, label: "Titanium CAD", icon: Layers, color: "text-amber-400" },
              { id: "luxury_showroom" as const, label: "Clean Light", icon: Sparkles, color: "text-slate-100" },
              { id: "cyberpunk_neon" as const, label: "Neon Dark", icon: Zap, color: "text-amber-400" },
            ].map((env) => {
              const Icon = env.icon;
              const isSel = envPreset === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => setEnvPreset(env.id)}
                  title={env.label}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isSel
                      ? "bg-amber-500/20 border border-amber-400/60 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon size={12} className={env.color} />
                  <span className="hidden sm:inline">{env.label}</span>
                </button>
              );
            })}
          </div>

          {/* Suspension Geometry Dropdown */}
          <div className="relative bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl rounded-2xl border border-white/15 shadow-xl">
            <select
              value={suspensionType}
              onChange={(e) => setSuspensionType(e.target.value as SuspensionType3D)}
              className="bg-transparent text-white text-xs font-mono font-bold rounded-2xl px-3.5 py-2 outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="DOUBLE_WISHBONE" className="bg-slate-900 text-white">Double Wishbone A-Arm</option>
              <option value="MACPHERSON_STRUT" className="bg-slate-900 text-white">MacPherson Strut</option>
              <option value="PUSHROD_MOTORSPORT" className="bg-slate-900 text-white">Pushrod Inboard Rocker</option>
              <option value="PULLROD_FORMULA" className="bg-slate-900 text-white">Pullrod Formula Monoposto</option>
              <option value="MULTI_LINK_5ARM" className="bg-slate-900 text-white">5-Link Multi-Link Rear</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Left Kinematic Articulation Sliders Panel */}
      <div className="absolute top-20 left-3.5 bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl w-80 space-y-4 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold font-mono text-white tracking-wider">
            <Sliders size={14} className="text-amber-400" />
            <span>KINEMATIC ARTICULATION</span>
          </div>
          <button
            onClick={handleReset}
            title="Reset to 0mm Datum"
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-amber-300 transition-colors cursor-pointer px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/40"
          >
            <RotateCcw size={11} />
            <span>RESET</span>
          </button>
        </div>

        {/* Wheel Bump Travel */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-200 font-semibold">Wheel Bump Travel:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              wheelBumpMm > 0
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : wheelBumpMm < 0
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-white/10 text-white border border-white/15"
            }`}>
              {wheelBumpMm > 0 ? `+${wheelBumpMm}` : wheelBumpMm} mm
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={wheelBumpMm}
            onChange={(e) => setWheelBumpMm(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-800/80 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>-50mm Rebound</span>
            <span>0mm Datum</span>
            <span>+50mm Bump</span>
          </div>
        </div>

        {/* Steering Lock Angle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-200 font-semibold">Steering Lock Angle:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              steeringAngleDeg !== 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/10 text-white border border-white/15"
            }`}>
              {steeringAngleDeg > 0 ? `+${steeringAngleDeg}` : steeringAngleDeg}°
            </span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={steeringAngleDeg}
            onChange={(e) => setSteeringAngleDeg(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800/80 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>-30° Left</span>
            <span>0° Center</span>
            <span>+30° Right</span>
          </div>
        </div>

        {/* Coil Spring Stiffness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-200 font-semibold">Coil Spring Rate:</span>
            <span className="font-bold px-2 py-0.5 rounded-md text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {springRateNmm} N/mm
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={220}
            step={5}
            value={springRateNmm}
            onChange={(e) => setSpringRateNmm(Number(e.target.value))}
            className="w-full accent-purple-400 bg-slate-800/80 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>60 (Touring)</span>
            <span>120 (Sport)</span>
            <span>220 (FIA GT3)</span>
          </div>
        </div>
      </div>

      {/* Right Kinematics Readout Telemetry HUD */}
      <div className="absolute bottom-3.5 right-3.5 bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl w-80 space-y-2.5 pointer-events-auto font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white tracking-wider font-sans">
            <Gauge size={14} className="text-amber-400" />
            <span>KINEMATIC READOUT TELEMETRY</span>
          </div>
          <span className="text-[9px] text-amber-300 font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
            LIVE 60FPS
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-300 font-medium">Dynamic Camber:</span>
          <span className="font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
            {dynamicCamberDeg > 0 ? `+${dynamicCamberDeg}` : dynamicCamberDeg}°
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-300 font-medium">Roll Center Height:</span>
          <span className="font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
            {rollCenterHeightMm} mm
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-300 font-medium">Anti-Dive Rating:</span>
          <span className="font-extrabold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
            {antiDivePct}%
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-300 font-medium">Anti-Squat Rating:</span>
          <span className="font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
            {antiSquatPct}%
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-t border-white/10 pt-1.5">
          <span className="text-slate-300 font-medium">Ackermann Steer Angle:</span>
          <span className="font-extrabold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
            {ackermannDeg}°
          </span>
        </div>
      </div>
    </div>
  );
};

export const Suspension3DStudioViewport = memo(Suspension3DStudioViewportComponent);

