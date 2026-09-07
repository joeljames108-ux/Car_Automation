/**
 * ============================================================================
 * INTERACTIVE DASHBOARD 3D VIEWPORT (Three.js WebGL Engine)
 * ============================================================================
 * Loads `public/models/interior/dashboard_interactive_master.glb` created in Blender 5.2.
 * Viewpoint matches Image 4 (driver eye-level looking directly forward at the dashboard).
 * Reactively updates:
 * - Steering Wheel mesh swap (Sport 3-Spoke, GT3 Yoke, Formula, Classic Wood)
 * - Steering Wheel grip material & leather color
 * - Upper Dash Pad Color (Two-tone top deck matching Image 4)
 * - Dashboard Decorative Trim (Walnut Wood, Twill Carbon, Brushed Titanium, Piano Black)
 * - Infotainment Screen Live Canvas Texture (Navigation, Telemetry, Media, Climate)
 * - Instrument Cluster Live Virtual Display Texture
 * - Center Console Shifter Swap (Automatic Lever, Gated Manual, Electronic Toggle)
 * - Multi-Zone Ambient LED light guides
 * - Interactive 3D Raycasting: clicking on parts focuses that configuration card!
 * ============================================================================
 */

import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  useInteriorDashboardConfigStore,
  type CameraPose,
} from "../../state/interiorDashboardConfigStore";

export const InteractiveDashboardCanvasViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Zustand Store Selectors
  const steeringWheelStyle = useInteriorDashboardConfigStore((s) => s.steeringWheelStyle);
  const steeringGripMaterial = useInteriorDashboardConfigStore((s) => s.steeringGripMaterial);
  const steeringColor = useInteriorDashboardConfigStore((s) => s.steeringColor);
  const steeringStripe = useInteriorDashboardConfigStore((s) => s.steeringStripe);
  const paddleShifters = useInteriorDashboardConfigStore((s) => s.paddleShifters);
  const driveMode = useInteriorDashboardConfigStore((s) => s.driveMode);

  const upperDashPadColor = useInteriorDashboardConfigStore((s) => s.upperDashPadColor);
  const dashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.dashboardTrimMaterial);
  const infotainmentMode = useInteriorDashboardConfigStore((s) => s.infotainmentMode);
  const clusterStyle = useInteriorDashboardConfigStore((s) => s.clusterStyle);
  const ambientLightColor = useInteriorDashboardConfigStore((s) => s.ambientLightColor);

  const shifterStyle = useInteriorDashboardConfigStore((s) => s.shifterStyle);
  const nightMode = useInteriorDashboardConfigStore((s) => s.nightMode);
  const cameraPose = useInteriorDashboardConfigStore((s) => s.cameraPose);
  const setActivePanel = useInteriorDashboardConfigStore((s) => s.setActivePanel);

  // Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic Textures
  const infotainmentCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const infotainmentTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const clusterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const clusterTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Camera Target Interpolation
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(-0.18, 0.58, 1.05));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0.02, 0.35, -0.05));

  // Update Infotainment Canvas
  const drawInfotainmentCanvas = useCallback((mode: string) => {
    let canvas = infotainmentCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 320;
      infotainmentCanvasRef.current = canvas;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      infotainmentTextureRef.current = tex;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark sleek background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 512, 320);

    // Top status bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 512, 36);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("APEX OS 5.2", 18, 23);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("5G LTE", 380, 23);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("12:45 PM", 440, 23);

    if (mode === "navigation") {
      // Navigation GPS Map
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(16, 48, 480, 256);

      // Grid roads
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 3;
      for (let y = 60; y < 300; y += 45) {
        ctx.beginPath();
        ctx.moveTo(16, y);
        ctx.lineTo(496, y);
        ctx.stroke();
      }
      for (let x = 30; x < 490; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, 48);
        ctx.lineTo(x, 304);
        ctx.stroke();
      }

      // Cyan Glowing Route Line
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(140, 280);
      ctx.lineTo(140, 180);
      ctx.lineTo(280, 180);
      ctx.lineTo(280, 100);
      ctx.lineTo(390, 100);
      ctx.stroke();

      // Navigation Arrow
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(140, 280, 10, 0, Math.PI * 2);
      ctx.fill();

      // Turn Prompt Card
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.fillRect(28, 60, 220, 75);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.strokeRect(28, 60, 220, 75);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("In 200m ➔ Turn Right", 40, 90);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText("Onto Apex Ring Road", 40, 115);

      // Speed Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillRect(430, 60, 50, 50);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.strokeRect(430, 60, 50, 50);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("65", 442, 92);
    } else if (mode === "telemetry") {
      // Telemetry Racing Screen
      ctx.fillStyle = "#111827";
      ctx.fillRect(16, 48, 480, 256);

      // RPM Bar
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(35, 65, 440, 20);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(35, 65, 340, 20);
      ctx.fillStyle = "#f87171";
      ctx.font = "bold 13px monospace";
      ctx.fillText("RPM: 7,420 / 9,000", 35, 105);

      // Speed Readout
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 64px monospace";
      ctx.fillText("142", 50, 180);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("MPH", 185, 180);

      // Gear Indicator
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 60px monospace";
      ctx.fillText("4", 260, 180);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText("GEAR", 260, 205);

      // Boost & G-Force
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(340, 125, 135, 110);
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 18px monospace";
      ctx.fillText("BOOST: 1.8 BAR", 350, 160);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("LAT G: +1.34", 350, 195);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("TIRES: 195°F", 350, 225);
    } else if (mode === "media") {
      // Media Audio Player
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(16, 48, 480, 256);

      // Album Art Box
      ctx.fillStyle = "#4338ca";
      ctx.fillRect(40, 80, 140, 140);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("⚡", 95, 165);

      // Song Info
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("Cyberdrive Overdrive", 205, 120);
      ctx.fillStyle = "#a5b4fc";
      ctx.font = "15px sans-serif";
      ctx.fillText("Apex Synthetics (Lossless Hi-Fi)", 205, 150);

      // Equalizer bars
      for (let i = 0; i < 18; i++) {
        const barH = 15 + Math.sin(i * 0.8 + 2) * 35 + 20;
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(205 + i * 14, 210 - barH, 8, barH);
      }
    } else {
      // Climate Control Mode
      ctx.fillStyle = "#0c1a29";
      ctx.fillRect(16, 48, 480, 256);

      // Driver Temp
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(140, 170, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText("72°F", 105, 182);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px sans-serif";
      ctx.fillText("DRIVER AC", 110, 210);

      // Passenger Temp
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(370, 170, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText("68°F", 335, 182);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px sans-serif";
      ctx.fillText("PASSENGER", 335, 210);

      // Center Status
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("SYNC AUTO | FAN SPEED 3", 160, 95);
    }

    if (infotainmentTextureRef.current) {
      infotainmentTextureRef.current.needsUpdate = true;
    }
  }, []);

  // Update Cluster Canvas
  const drawClusterCanvas = useCallback((style: string) => {
    let canvas = clusterCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      clusterCanvasRef.current = canvas;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      clusterTextureRef.current = tex;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, 512, 256);

    if (style === "digital") {
      // Digital Tachometer Arc
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 170, 110, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Digital Speed
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px monospace";
      ctx.fillText("88", 220, 180);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("MPH", 240, 215);

      // Gear
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 42px monospace";
      ctx.fillText("D4", 240, 105);
    } else {
      // Dual Analog Dials
      // Left: Speedo
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(140, 130, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("75", 125, 140);
      ctx.font = "12px sans-serif";
      ctx.fillText("MPH", 127, 160);

      // Right: Tachometer
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(370, 130, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("4.5", 355, 140);
      ctx.font = "12px sans-serif";
      ctx.fillText("x1000 RPM", 340, 160);
    }

    if (clusterTextureRef.current) {
      clusterTextureRef.current.needsUpdate = true;
    }
  }, []);

  // Update Camera Target based on pose
  const setCameraView = useCallback((pose: CameraPose) => {
    if (pose === "driver") {
      // Image 4 driver POV (wide front-facing cockpit view)
      targetCamPos.current.set(-0.18, 0.58, 1.05);
      targetLookAt.current.set(0.02, 0.35, -0.05);
    } else if (pose === "center") {
      // Center Infotainment Close-up
      targetCamPos.current.set(0.0, 0.42, 0.55);
      targetLookAt.current.set(0.0, 0.32, -0.10);
    } else if (pose === "steering") {
      // Steering Wheel & Cluster Focus
      targetCamPos.current.set(-0.35, 0.52, 0.50);
      targetLookAt.current.set(-0.35, 0.40, -0.15);
    } else {
      // Wide Panoramic Cabin
      targetCamPos.current.set(0.0, 0.75, 1.45);
      targetLookAt.current.set(0.0, 0.30, 0.0);
    }
  }, []);

  // Sync 3D scene with Zustand Store
  const updateSceneState = useCallback(() => {
    const root = modelRef.current;
    if (!root) return;

    // 1. Steering Wheels Mesh Visibility
    const wheelSport = root.getObjectByName("STEERING_SPORT_3SPOKE");
    const wheelYoke = root.getObjectByName("STEERING_GT3_YOKE");
    const wheelFormula = root.getObjectByName("STEERING_FORMULA");
    const wheelClassic = root.getObjectByName("STEERING_CLASSIC_WOOD");

    if (wheelSport) wheelSport.visible = steeringWheelStyle === "sport";
    if (wheelYoke) wheelYoke.visible = steeringWheelStyle === "yoke";
    if (wheelFormula) wheelFormula.visible = steeringWheelStyle === "formula";
    if (wheelClassic) wheelClassic.visible = steeringWheelStyle === "classic";

    // Active Steering Wheel Material & Color
    let activeWheel = wheelSport;
    if (steeringWheelStyle === "yoke") activeWheel = wheelYoke;
    else if (steeringWheelStyle === "formula") activeWheel = wheelFormula;
    else if (steeringWheelStyle === "classic") activeWheel = wheelClassic;

    if (activeWheel && (activeWheel as any).material) {
      const mat = (activeWheel as any).material as THREE.MeshStandardMaterial;
      mat.color.set(steeringColor);
      if (steeringGripMaterial === "alcantara") {
        mat.roughness = 0.85;
        mat.metalness = 0.1;
      } else if (steeringGripMaterial === "carbon") {
        mat.roughness = 0.18;
        mat.metalness = 0.3;
      } else if (steeringGripMaterial === "wood") {
        mat.roughness = 0.25;
        mat.color.set("#5c2c16");
      } else {
        mat.roughness = 0.45;
      }
      mat.needsUpdate = true;
    }

    // 2. 12 O'Clock Stripe
    const stripe = root.getObjectByName("STEERING_TOP_STRIPE");
    if (stripe) {
      stripe.visible = steeringStripe !== "none";
      if ((stripe as any).material) {
        const mat = (stripe as any).material as THREE.MeshStandardMaterial;
        if (steeringStripe === "red") mat.color.set("#ef4444");
        else if (steeringStripe === "yellow") mat.color.set("#eab308");
        else if (steeringStripe === "blue") mat.color.set("#3b82f6");
        mat.needsUpdate = true;
      }
    }

    // 3. Paddle Shifters
    const paddles = root.getObjectByName("STEERING_PADDLE_SHIFTERS");
    if (paddles) {
      paddles.visible = paddleShifters !== "none";
      if ((paddles as any).material) {
        const mat = (paddles as any).material as THREE.MeshStandardMaterial;
        if (paddleShifters === "red") mat.color.set("#dc2626");
        else if (paddleShifters === "carbon") mat.color.set("#18181b");
        else mat.color.set("#94a3b8"); // billet
        mat.needsUpdate = true;
      }
    }

    // 4. Drive Mode Dial
    const driveDial = root.getObjectByName("STEERING_DRIVE_MODE_DIAL");
    if (driveDial && (driveDial as any).material) {
      const mat = (driveDial as any).material as THREE.MeshStandardMaterial;
      if (driveMode === "track") mat.color.set("#dc2626");
      else if (driveMode === "comfort") mat.color.set("#3b82f6");
      else if (driveMode === "wet") mat.color.set("#06b6d4");
      else mat.color.set("#f59e0b"); // sport gold
      mat.needsUpdate = true;
    }

    // 5. Upper Dashboard Pad Color (Image 4 Aegean Blue or User Choice)
    const upperPad = root.getObjectByName("DASH_UPPER_PAD");
    if (upperPad && (upperPad as any).material) {
      const mat = (upperPad as any).material as THREE.MeshStandardMaterial;
      mat.color.set(upperDashPadColor);
      mat.roughness = 0.38;
      mat.needsUpdate = true;
    }

    // 6. Dashboard Decorative Trim Spear
    const trimSpear = root.getObjectByName("DASH_TRIM_SPEAR");
    if (trimSpear && (trimSpear as any).material) {
      const mat = (trimSpear as any).material as THREE.MeshStandardMaterial;
      if (dashboardTrimMaterial === "carbon") {
        mat.color.set("#18181b");
        mat.roughness = 0.16;
        mat.metalness = 0.35;
      } else if (dashboardTrimMaterial === "aluminum") {
        mat.color.set("#cbd5e1");
        mat.roughness = 0.22;
        mat.metalness = 0.92;
      } else if (dashboardTrimMaterial === "piano_black") {
        mat.color.set("#09090b");
        mat.roughness = 0.05;
        mat.metalness = 0.1;
      } else if (dashboardTrimMaterial === "forged_carbon") {
        mat.color.set("#1e1e24");
        mat.roughness = 0.20;
        mat.metalness = 0.30;
      } else {
        // Walnut Wood
        mat.color.set("#4a2511");
        mat.roughness = 0.28;
        mat.metalness = 0.15;
      }
      mat.needsUpdate = true;
    }

    // 7. Ambient Light Guide Color
    const ambientLight = root.getObjectByName("DASH_AMBIENT_LIGHT");
    if (ambientLight && (ambientLight as any).material) {
      const mat = (ambientLight as any).material as THREE.MeshStandardMaterial;
      if (ambientLightColor === "none") {
        mat.emissive.set("#000000");
      } else {
        mat.emissive.set(ambientLightColor);
        mat.emissiveIntensity = nightMode ? 2.5 : 1.2;
      }
      mat.needsUpdate = true;
    }

    // 8. Center Console Shifters
    const shifterAuto = root.getObjectByName("CONSOLE_SHIFTER_AUTO");
    const shifterManual = root.getObjectByName("CONSOLE_SHIFTER_MANUAL");
    const shifterToggle = root.getObjectByName("CONSOLE_SHIFTER_TOGGLE");

    if (shifterAuto) shifterAuto.visible = shifterStyle === "auto";
    if (shifterManual) shifterManual.visible = shifterStyle === "manual";
    if (shifterToggle) shifterToggle.visible = shifterStyle === "toggle";

    // 9. Displays (Infotainment & Cluster Texture Application)
    const screen = root.getObjectByName("INFOTAINMENT_SCREEN");
    if (screen && (screen as any).material && infotainmentTextureRef.current) {
      (screen as any).material.map = infotainmentTextureRef.current;
      (screen as any).material.needsUpdate = true;
    }

    const cluster = root.getObjectByName("CLUSTER_SCREEN");
    if (cluster && (cluster as any).material && clusterTextureRef.current) {
      (cluster as any).material.map = clusterTextureRef.current;
      (cluster as any).material.needsUpdate = true;
    }
  }, [
    steeringWheelStyle,
    steeringGripMaterial,
    steeringColor,
    steeringStripe,
    paddleShifters,
    driveMode,
    upperDashPadColor,
    dashboardTrimMaterial,
    ambientLightColor,
    shifterStyle,
    nightMode,
  ]);

  // Initial Scene Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background
    scene.background = new THREE.Color(nightMode ? "#060911" : "#111625");

    // Camera matching Image 4 Driver POV
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.05, 50);
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(targetLookAt.current);
    controls.minDistance = 0.3;
    controls.maxDistance = 2.5;
    controls.maxPolarAngle = Math.PI * 0.58;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(nightMode ? 0x223355 : 0xf1f5f9, nightMode ? 0.8 : 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, nightMode ? 0.9 : 2.2);
    keyLight.position.set(0.5, 2.0, 1.5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, nightMode ? 2.5 : 1.2, 3.5);
    fillLight.position.set(0.0, 0.5, 0.2);
    scene.add(fillLight);

    // Load Master Interactive Dashboard GLB
    const loader = new GLTFLoader();
    loader.load(
      "/models/interior/dashboard_interactive_master.glb",
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        scene.add(model);

        // Initial canvas draws
        drawInfotainmentCanvas(infotainmentMode);
        drawClusterCanvas(clusterStyle);

        // Apply all state options
        updateSceneState();
      },
      undefined,
      (err) => {
        console.error("Failed to load dashboard_interactive_master.glb:", err);
      }
    );

    // 3D Raycasting click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (modelRef.current) {
        const intersects = raycaster.intersectObjects(modelRef.current.children, true);
        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          const hitName = hitObj.name.toUpperCase();

          if (hitName.includes("STEERING")) {
            setActivePanel("steering");
          } else if (hitName.includes("DASH") || hitName.includes("INFOTAINMENT") || hitName.includes("CLUSTER")) {
            setActivePanel("dashboard");
          } else if (hitName.includes("CONSOLE") || hitName.includes("SHIFTER") || hitName.includes("CABIN")) {
            setActivePanel("other");
          }
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    // Render Loop
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth Camera Interpolation
      camera.position.lerp(targetCamPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update when store options change
  useEffect(() => {
    drawInfotainmentCanvas(infotainmentMode);
  }, [infotainmentMode, drawInfotainmentCanvas]);

  useEffect(() => {
    drawClusterCanvas(clusterStyle);
  }, [clusterStyle, drawClusterCanvas]);

  useEffect(() => {
    updateSceneState();
  }, [updateSceneState]);

  useEffect(() => {
    setCameraView(cameraPose);
  }, [cameraPose, setCameraView]);

  return (
    <div className="relative w-full h-full min-h-[360px] select-none overflow-hidden rounded-xl bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Viewport Overlay Badge */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-2 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D COCKPIT DIAGRAM • DRIVER POV</span>
      </div>

      {/* Interactive Raycast Hint */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur border border-white/10 text-[10px] font-mono text-slate-400 pointer-events-none">
        Click 3D components to focus controls • Drag to orbit
      </div>
    </div>
  );
};
