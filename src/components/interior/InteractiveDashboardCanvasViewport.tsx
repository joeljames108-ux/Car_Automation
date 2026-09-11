/**
 * ============================================================================
 * INTERACTIVE DASHBOARD CANVAS VIEWPORT (Three.js WebGL Engine)
 * ============================================================================
 * Clean, modular integration of:
 * - DashboardAssetManager (GLTF loading & semantic node indexing)
 * - DashboardMaterialManager (PBR shaders, leathers, carbons, woods, metals)
 * - DashboardVisibilityManager (instant wheel & shifter swaps, exploded offsets)
 * - DashboardCameraController (calibrated driver POV & smooth lerping)
 * - DashboardScreenTextureManager (dynamic canvas textures for 8 screen modes & 5 clusters)
 * - DashboardLightingManager (day/sunset/night lighting & screen glow)
 * - DashboardInteractionManager (3D raycasting click-to-configure)
 * ============================================================================
 */

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useInteriorDashboardConfigStore } from "../../state/interiorDashboardConfigStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import { DashboardAssetManager } from "./dashboardAssetManager";
import { DashboardMaterialManager } from "./dashboardMaterialManager";
import { DashboardVisibilityManager } from "./dashboardVisibilityManager";
import { DashboardCameraController } from "./dashboardCameraController";
import { DashboardScreenTextureManager } from "./dashboardScreenTextureManager";
import { DashboardLightingManager } from "./dashboardLightingManager";
import { DashboardInteractionManager } from "./dashboardInteractionManager";
import { Loader2 } from "lucide-react";

export const InteractiveDashboardCanvasViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Store Selectors
  const steeringWheelStyle = useInteriorDashboardConfigStore((s) => s.steeringWheelStyle);
  const steeringGripMaterial = useInteriorDashboardConfigStore((s) => s.steeringGripMaterial);
  const steeringColor = useInteriorDashboardConfigStore((s) => s.steeringColor);
  const steeringStripe = useInteriorDashboardConfigStore((s) => s.steeringStripe);
  const paddleShifters = useInteriorDashboardConfigStore((s) => s.paddleShifters);

  const upperDashPadColor = useInteriorDashboardConfigStore((s) => s.upperDashPadColor);
  const dashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.dashboardTrimMaterial);
  const infotainmentMode = useInteriorDashboardConfigStore((s) => s.infotainmentMode);
  const clusterStyle = useInteriorDashboardConfigStore((s) => s.clusterStyle);
  const hudMode = useInteriorDashboardConfigStore((s) => s.hudMode);
  const ambientLightColor = useInteriorDashboardConfigStore((s) => s.ambientLightColor);

  const shifterStyle = useInteriorDashboardConfigStore((s) => s.shifterStyle);
  const seatStyle = useInteriorDashboardConfigStore((s) => s.seatStyle);
  const seatBeltColor = useInteriorDashboardConfigStore((s) => s.seatBeltColor);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const stitchingColor = useInteriorDashboardConfigStore((s) => s.stitchingColor);
  const windshieldTint = useInteriorDashboardConfigStore((s) => s.windshieldTint);
  const lightingMode = useInteriorDashboardConfigStore((s) => s.lightingMode);
  const nightMode = useInteriorDashboardConfigStore((s) => s.nightMode);

  // Rear Cabin / Multi-Row Seating
  const seatingCapacity = useInteriorDashboardConfigStore((s) => s.seatingCapacity);
  const row2SeatingType = useInteriorDashboardConfigStore((s) => s.row2SeatingType);
  const row3SeatingType = useInteriorDashboardConfigStore((s) => s.row3SeatingType);
  const rearEntertainment = useInteriorDashboardConfigStore((s) => s.rearEntertainment);
  const rearFoldingTables = useInteriorDashboardConfigStore((s) => s.rearFoldingTables);

  const cameraPose = useInteriorDashboardConfigStore((s) => s.cameraPose);
  const driverHeight = useInteriorDashboardConfigStore((s) => s.driverHeight);
  const explodedProgress = useInteriorDashboardConfigStore((s) => s.explodedProgress);
  const setActivePanel = useInteriorDashboardConfigStore((s) => s.setActivePanel);

  // Modular Interior CAD hidden parts
  const hiddenPartIds = useModularVehicleBuilderStore((s) => s.hiddenPartIds);

  // Manager Refs
  const assetMgrRef = useRef<DashboardAssetManager | null>(null);
  const matMgrRef = useRef<DashboardMaterialManager | null>(null);
  const visMgrRef = useRef<DashboardVisibilityManager | null>(null);
  const camCtrlRef = useRef<DashboardCameraController | null>(null);
  const texMgrRef = useRef<DashboardScreenTextureManager | null>(null);
  const lightMgrRef = useRef<DashboardLightingManager | null>(null);
  const interactMgrRef = useRef<DashboardInteractionManager | null>(null);

  // Setup Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05070c");

    const camera = new THREE.PerspectiveCamera(64, width / height, 0.05, 50);
    camera.position.set(0.0, 0.92, 0.92);
    camera.lookAt(0.0, 0.60, -0.30);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Instantiate Managers
    const assetManager = new DashboardAssetManager();
    const materialManager = new DashboardMaterialManager(assetManager);
    const visibilityManager = new DashboardVisibilityManager(assetManager);
    const cameraController = new DashboardCameraController(camera, controls);
    const textureManager = new DashboardScreenTextureManager(assetManager);
    const lightingManager = new DashboardLightingManager(scene);
    const interactionManager = new DashboardInteractionManager(camera, assetManager, (panel) => {
      setActivePanel(panel);
    });

    assetMgrRef.current = assetManager;
    matMgrRef.current = materialManager;
    visMgrRef.current = visibilityManager;
    camCtrlRef.current = cameraController;
    texMgrRef.current = textureManager;
    lightMgrRef.current = lightingManager;
    interactMgrRef.current = interactionManager;

    // Load Master GLB
    let isMounted = true;
    assetManager
      .loadModel("/models/interior/dashboard_interactive_master.glb", (pct) => {
        if (isMounted) setLoadPercent(pct);
      })
      .then((model) => {
        if (!isMounted) return;
        scene.add(model);
        visibilityManager.registerInitialTransforms();
        textureManager.bindToMeshes();

        // Initial State Sync
        visibilityManager.updateSteeringWheel(steeringWheelStyle);
        visibilityManager.updateShifter(shifterStyle);
        visibilityManager.updatePaddleShifters(paddleShifters);
        visibilityManager.updateHUD(hudMode);
        visibilityManager.updateClusterStyle(clusterStyle);
        visibilityManager.updateSeatingCapacity(seatingCapacity);
        visibilityManager.updateRow2Style(row2SeatingType);
        visibilityManager.updateRearAmenities(rearEntertainment, rearFoldingTables);

        materialManager.updateUpperDashPadColor(upperDashPadColor);
        materialManager.updateDashboardTrim(dashboardTrimMaterial);
        materialManager.updateSteeringGripMaterial(steeringGripMaterial, steeringColor);
        materialManager.updateSteeringStripe(steeringStripe);
        materialManager.updateAmbientLighting(ambientLightColor, nightMode);
        materialManager.updateStitching(stitchingColor);
        materialManager.updateWindshieldTint(windshieldTint);
        materialManager.updateSeatUpholstery(interiorColor, seatStyle);
        materialManager.updateSeatBelts(seatBeltColor);

        lightingManager.setLightingMode(lightingMode);
        cameraController.setPose(cameraPose);
        cameraController.setDriverHeight(driverHeight);

        setIsReady(true);
      })
      .catch((err) => {
        console.error("[InteractiveDashboardCanvasViewport] Failed to load GLB:", err);
      });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Click Raycast Handler
    const handleClick = (e: MouseEvent) => {
      if (interactMgrRef.current && container) {
        interactMgrRef.current.handleClick(e, container);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      cameraController.update();
      textureManager.updateAnimation(delta);
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Reactive State Updates (In-Memory, No GLB Reload)
  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateSteeringWheel(steeringWheelStyle);
  }, [steeringWheelStyle, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateShifter(shifterStyle);
  }, [shifterStyle, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updatePaddleShifters(paddleShifters);
  }, [paddleShifters, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateHUD(hudMode);
  }, [hudMode, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateClusterStyle(clusterStyle);
  }, [clusterStyle, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateExplodedView(explodedProgress);
  }, [explodedProgress, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateUpperDashPadColor(upperDashPadColor);
  }, [upperDashPadColor, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateDashboardTrim(dashboardTrimMaterial);
  }, [dashboardTrimMaterial, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateSteeringGripMaterial(steeringGripMaterial, steeringColor);
  }, [steeringGripMaterial, steeringColor, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateSteeringStripe(steeringStripe);
  }, [steeringStripe, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateAmbientLighting(ambientLightColor, nightMode);
  }, [ambientLightColor, nightMode, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateStitching(stitchingColor);
  }, [stitchingColor, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateWindshieldTint(windshieldTint);
  }, [windshieldTint, isReady]);

  useEffect(() => {
    if (!isReady || !camCtrlRef.current) return;
    camCtrlRef.current.setPose(cameraPose);
  }, [cameraPose, isReady]);

  useEffect(() => {
    if (!isReady || !camCtrlRef.current) return;
    camCtrlRef.current.setDriverHeight(driverHeight);
  }, [driverHeight, isReady]);

  useEffect(() => {
    if (!isReady || !lightMgrRef.current) return;
    lightMgrRef.current.setLightingMode(lightingMode);
  }, [lightingMode, isReady]);

  useEffect(() => {
    if (!isReady || !texMgrRef.current) return;
    texMgrRef.current.setInfotainmentMode(infotainmentMode);
  }, [infotainmentMode, isReady]);

  useEffect(() => {
    if (!isReady || !texMgrRef.current) return;
    texMgrRef.current.setClusterStyle(clusterStyle);
  }, [clusterStyle, isReady]);

  useEffect(() => {
    if (!isReady || !texMgrRef.current) return;
    texMgrRef.current.setHUDMode(hudMode);
  }, [hudMode, isReady]);

  // Reactive Rear Cabin Multi-Row Seating Visibility Hooks
  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateSeatingCapacity(seatingCapacity);
  }, [seatingCapacity, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateRow2Style(row2SeatingType);
  }, [row2SeatingType, isReady]);

  useEffect(() => {
    if (!isReady || !visMgrRef.current) return;
    visMgrRef.current.updateRearAmenities(rearEntertainment, rearFoldingTables);
  }, [rearEntertainment, rearFoldingTables, isReady]);

  // Reactive Seat Upholstery and Belts Propagation
  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateSeatUpholstery(interiorColor, seatStyle);
  }, [interiorColor, seatStyle, isReady]);

  useEffect(() => {
    if (!isReady || !matMgrRef.current) return;
    matMgrRef.current.updateSeatBelts(seatBeltColor);
  }, [seatBeltColor, isReady]);

  // Modular CAD Components dynamic visibility sync
  useEffect(() => {
    if (!isReady || !assetMgrRef.current) return;
    const assetMgr = assetMgrRef.current;

    const partNodeMap: Record<string, string[]> = {
      dashboard: ["DASH_UPPER_PAD", "DASH_UPPER_COWL_BINNACLE", "DASH_UPPER_PASS_SWEEP", "DASH_TRIM_SPEAR"],
      steering_wheel: ["STEERING", "STEERING_SPORT_3SPOKE", "STEERING_GT_3SPOKE", "STEERING_GT3_YOKE"],
      seats: ["CABIN_SEATS"],
      center_console: ["CONSOLE_ROOT"],
      door_panels: ["DOOR_PANELS_ROOT"],
      instrument_cluster: ["CLUSTER_HOOD", "CLUSTER_SCREEN"],
      infotainment: ["INFOTAINMENT_BEZEL", "INFOTAINMENT_SCREEN"],
    };

    Object.entries(partNodeMap).forEach(([partId, nodes]) => {
      const isVisible = !hiddenPartIds.includes(partId);
      nodes.forEach((nodeName) => {
        const node = assetMgr.getNode(nodeName);
        if (node) {
          node.visible = isVisible;
        }
      });
    });
  }, [hiddenPartIds, isReady]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Screen Indicator */}
      {!isReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-200 tracking-wider uppercase">
            Loading Class-A Cockpit CAD... ({loadPercent}%)
          </p>
          <p className="text-xs text-slate-400 mt-1">Blender 5.2 Master GLB • PBR Shaders & Avionics</p>
        </div>
      )}
    </div>
  );
};
