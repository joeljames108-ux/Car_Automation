// ============================================================================
// AERO STUDIO CANVAS VIEWPORT
// ============================================================================
// Ultra-photorealistic Three.js WebGL viewport for the Aero Design Studio.
// Loads genuine Blender 5.2 LTS modular CAD GLBs, executes 60 FPS parametric
// transforms around mechanical hinge pivots, renders wind-tunnel streamlines,
// and smoothly transitions cameras to inspected aerodynamic subassemblies.
// ============================================================================

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Camera,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Wind,
  Layers,
  Sparkles,
  Focus,
  Crosshair,
  Compass,
} from "lucide-react";
import {
  useAeroStudioStore,
  AERO_CAMERA_VIEWS,
  AeroComponentId,
  AeroCameraPresetId,
  CameraViewDef,
  resolveHostVehicleGlb,
} from "../../state/aeroStudioStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";

// Dedicated list of genuine modular aerodynamic additions (mounted to host vehicle hardpoints)
const AERO_ATTACHMENT_GLB_ASSETS = [
  { id: "rearWing", path: "/models/aero/AERO_REAR_WING_001.glb", name: "Rear Wing Assembly" },
  { id: "rearSpoiler", path: "/models/aero/AERO_REAR_SPOILER_001.glb", name: "Rear Pedestal Spoiler" },
  { id: "frontSplitter", path: "/models/aero/AERO_FRONT_SPLITTER_001.glb", name: "Front Track Splitter" },
  { id: "canards", path: "/models/aero/AERO_CANARD_001.glb", name: "Canard Dive Planes" },
  { id: "activeAero", path: "/models/aero/AERO_ACTIVE_AERO_001.glb", name: "Active Aero System" },
];

export const AeroStudioCanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store Subscriptions - Synchronized with Vehicle Studio
  const selectedComponent = useAeroStudioStore((s) => s.selectedComponent);
  const activeSubTab = useAeroStudioStore((s) => s.activeSubTab);
  const activeCameraPreset = useAeroStudioStore((s) => s.activeCameraPreset);
  const setActiveCameraPreset = useAeroStudioStore((s) => s.setActiveCameraPreset);
  const config = useAeroStudioStore((s) => s.config);
  const physics = useAeroStudioStore((s) => s.physics);
  const inspectionExplodedPct = useAeroStudioStore((s) => s.inspectionExplodedPct);
  const activeAeroDeploymentPct = useAeroStudioStore((s) => s.activeAeroDeploymentPct);
  const wheelAeroDiscsInstalled = useAeroStudioStore((s) => s.wheelAeroDiscsInstalled);
  const canardTierCount = useAeroStudioStore((s) => s.canardTierCount);
  const splitterTieRodsVisible = useAeroStudioStore((s) => s.splitterTieRodsVisible);
  const isolatedComponentView = useAeroStudioStore((s) => s.isolatedComponentView);
  const setSelectedComponent = useAeroStudioStore((s) => s.setSelectedComponent);

  // Active Vehicle Architecture & Design State (Inherited from Vehicle Studio)
  const vehicleVariant = useAeroStudioStore((s) => s.vehicleVariant);
  const setVehicleVariant = useAeroStudioStore((s) => s.setVehicleVariant);
  const modularModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const bodyColorHex = useModularVehicleBuilderStore((s) => s.bodyColorHex);
  const activeWingAngleDeg = useModularVehicleBuilderStore((s) => s.activeWingAngleDeg);
  const drsActive = useModularVehicleBuilderStore((s) => s.drsActive);

  // Auto-sync variant with Vehicle Studio model choice if changed
  useEffect(() => {
    if (modularModel && vehicleVariant !== modularModel) {
      setVehicleVariant(modularModel as any);
    }
  }, [modularModel, vehicleVariant, setVehicleVariant]);

  // Resolve host vehicle binary GLB path
  const activeHostGlbPath = useMemo(() => {
    return resolveHostVehicleGlb(vehicleVariant || modularModel || "sedan");
  }, [vehicleVariant, modularModel]);

  const rearSpoilerAngleDeg = useAeroStudioStore((s) => s.rearSpoilerAngleDeg);
  const rearSpoilerHeightMm = useAeroStudioStore((s) => s.rearSpoilerHeightMm);
  const rearSpoilerWidthMm = useAeroStudioStore((s) => s.rearSpoilerWidthMm);
  const rearSpoilerGurneyMm = useAeroStudioStore((s) => s.rearSpoilerGurneyMm);
  const underbodyTunnelDepthMm = useAeroStudioStore((s) => s.underbodyTunnelDepthMm);
  const underbodyFloorStrakeCount = useAeroStudioStore((s) => s.underbodyFloorStrakeCount);

  // Local Viewport Controls
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [viewAngleLabel, setViewAngleLabel] = useState<string>("Rear Wing Focus");

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Loaded Node Cache for instant 60 FPS updates
  const nodesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const assetGroupsMapRef = useRef<Map<string, THREE.Group>>(new Map());

  // Host Vehicle Reference for Dynamic Swapping
  const hostVehicleGroupRef = useRef<THREE.Group | null>(null);

  // Camera Lerp Transition State
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(1.75, 1.65, 2.85));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(0.0, 1.15, 2.15));
  const isTransitioningCameraRef = useRef<boolean>(false);

  // Streamlines Particle System Ref
  const streamlineParticlesRef = useRef<THREE.Points | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);
  const particleOriginalsRef = useRef<Float32Array | null>(null);

  // --------------------------------------------------------------------------
  // Camera smooth transition trigger
  // --------------------------------------------------------------------------
  const triggerCameraFocus = useCallback((presetId: AeroCameraPresetId) => {
    const viewDef: CameraViewDef = AERO_CAMERA_VIEWS[presetId] || AERO_CAMERA_VIEWS.vehicleOverview;
    targetCamPosRef.current.set(...viewDef.position);

    // Dynamic focus target detection from Blender GLB empty node
    let foundWorldPos: THREE.Vector3 | null = null;
    if (presetId !== "vehicleOverview" && !presetId.includes("FullCar")) {
      const nodes = nodesMapRef.current;
      // Search for corresponding *_FocusTarget node
      for (const [nodeName, node] of nodes.entries()) {
        if (nodeName.includes("FocusTarget")) {
          const lowerName = nodeName.toLowerCase();
          const compPrefix = presetId.toLowerCase().replace(/floor|skirts|canards|splitter|wing|spoiler|disc|ducts|louvers/g, "");
          if (lowerName.includes(compPrefix) || (presetId.includes("rearSpoiler") && lowerName.includes("spoiler"))) {
            const wp = new THREE.Vector3();
            node.getWorldPosition(wp);
            foundWorldPos = wp;
            break;
          }
        }
      }
    }

    if (foundWorldPos) {
      targetCamLookRef.current.copy(foundWorldPos);
    } else {
      targetCamLookRef.current.set(...viewDef.target);
    }

    isTransitioningCameraRef.current = true;
    const readableLabels: Record<string, string> = {
      vehicleOverview: "Vehicle Overview",
      rearWingDefault: "Rear Wing Elevated 3/4",
      rearWingAngleInspection: "Wing Angle Inspection",
      rearWingProfile: "Wing Profile View",
      rearWingFullCar: "Rear Full Car View",
      rearSpoilerDefault: "Pedestal Spoiler Focus",
      rearSpoilerDecklid: "Spoiler Decklid Inspection",
      frontSplitterDefault: "Splitter 3/4 Low",
      frontSplitterLowCenter: "Splitter Low Center",
      canardsClose: "Canards Macro Inspection",
      underbodyFloorDefault: "Underbody Floor Suction",
      underbodyTunnels: "Venturi Tunnels Close",
    };
    setViewAngleLabel(readableLabels[presetId] || `${presetId} Inspection`);
  }, []);

  // When activeCameraPreset changes in store, fly camera to it
  useEffect(() => {
    triggerCameraFocus(activeCameraPreset);
  }, [activeCameraPreset, triggerCameraFocus]);

  // --------------------------------------------------------------------------
  // Wind-Tunnel Streamlines Particle Generator
  // --------------------------------------------------------------------------
  const createStreamlineSystem = (scene: THREE.Scene) => {
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f0ff);
    const blueColor = new THREE.Color(0x0077ff);
    const goldColor = new THREE.Color(0xffaa00);

    for (let i = 0; i < particleCount; i++) {
      // Wind originates in front of vehicle (Z -3.5 to -5.0) and flows rearward (to Z +3.8)
      // Standard automotive coordinates: -Z is front, +Z is rear
      const x = (Math.random() - 0.5) * 2.2;
      const y = 0.05 + Math.random() * 1.55;
      const z = -3.5 - Math.random() * 1.5;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3 + 0] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Base airspeed variation
      velocities[i] = 0.08 + Math.random() * 0.06;

      // Streamline color gradient based on height
      const mixCol = y < 0.35 ? blueColor : cyanColor;
      colors[i * 3 + 0] = mixCol.r;
      colors[i * 3 + 1] = mixCol.g;
      colors[i * 3 + 2] = mixCol.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom glowing circle point texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(0,240,255,0.85)");
      grad.addColorStop(1, "rgba(0,100,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.075,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    particles.name = "AeroStreamlines";
    scene.add(particles);

    streamlineParticlesRef.current = particles;
    particleVelocitiesRef.current = velocities;
    particleOriginalsRef.current = originalPositions;
  };

  // --------------------------------------------------------------------------
  // Initialize Three.js Scene, Camera, Lights, and Grid
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e); // High-contrast deep carbon black
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    const initialView = AERO_CAMERA_VIEWS.rearWing;
    camera.position.set(...initialView.position);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.6;
    controls.maxDistance = 16.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.06; // Allow viewing shallow from below diffuser
    controls.target.set(...initialView.target);
    controlsRef.current = controls;

    // 5. Studio Aero Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light (Clean Crisp Automotive Studio Key)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.6);
    keyLight.position.set(4.5, 7.5, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    // Cyan Wind-Tunnel Rim Light
    const aeroRimLight = new THREE.DirectionalLight(0x00d9ff, 2.2);
    aeroRimLight.position.set(-5.0, 4.5, -5.5);
    scene.add(aeroRimLight);

    // Underbody Diffuser Inspection Fill
    const underFill = new THREE.DirectionalLight(0x4466aa, 1.4);
    underFill.position.set(0, -3.5, 0);
    scene.add(underFill);

    // Subtle Top-down Daylight Strip
    const topStrip = new THREE.DirectionalLight(0xffffff, 1.0);
    topStrip.position.set(0, 9, 0);
    scene.add(topStrip);

    // 6. Ground Studio Grid & Shadow Plane
    const grid = new THREE.GridHelper(14, 28, 0x00f0ff, 0x182030);
    grid.position.y = -0.002;
    scene.add(grid);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.ShadowMaterial({ opacity: 0.55 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.004;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 7. Wind-Tunnel Streamlines
    createStreamlineSystem(scene);

    // 8. GLTF Loader Pipeline for Aerodynamic Components
    const loader = new GLTFLoader();
    let loadedCount = 0;
    const totalCount = AERO_ATTACHMENT_GLB_ASSETS.length;

    // Initialize host vehicle container group in scene
    const hostGroup = new THREE.Group();
    hostGroup.name = "hostVehicleGroup";
    scene.add(hostGroup);
    hostVehicleGroupRef.current = hostGroup;
    assetGroupsMapRef.current.set("hostChassis", hostGroup);

    AERO_ATTACHMENT_GLB_ASSETS.forEach((asset) => {
      loader.load(
        asset.path,
        (gltf) => {
          const group = gltf.scene;
          group.name = asset.id;
          scene.add(group);
          assetGroupsMapRef.current.set(asset.id, group);

          // Traverse and cache child nodes for 60 FPS live rotation/pivot manipulation
          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Enhance material sheen and reflections
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.roughness = Math.max(0.12, child.material.roughness);
                child.material.envMapIntensity = 1.25;
              }
            }
            if (child.name) {
              nodesMapRef.current.set(child.name, child);
            }
          });

          loadedCount++;
          setLoadProgress(Math.round((loadedCount / totalCount) * 100));
          if (loadedCount >= totalCount) {
            setIsLoading(false);
          }
        },
        undefined,
        (err) => {
          console.warn(`[AeroStudio] Error loading ${asset.path}:`, err);
          loadedCount++;
          if (loadedCount >= totalCount) setIsLoading(false);
        }
      );
    });

    // 9. Continuous Animation Loop (60 FPS)
    let isMounted = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Smooth Camera Lerping
      if (isTransitioningCameraRef.current && cameraRef.current && controlsRef.current) {
        const cam = cameraRef.current;
        const ctr = controlsRef.current;

        cam.position.lerp(targetCamPosRef.current, 0.08);
        ctr.target.lerp(targetCamLookRef.current, 0.08);

        const distPos = cam.position.distanceTo(targetCamPosRef.current);
        const distLook = ctr.target.distanceTo(targetCamLookRef.current);
        if (distPos < 0.015 && distLook < 0.015) {
          isTransitioningCameraRef.current = false;
        }
      }

      // Update Controls
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.1;
        controlsRef.current.update();
      }

      // Streamlines Flow Animation
      if (streamlineParticlesRef.current && showStreamlines) {
        const geom = streamlineParticlesRef.current.geometry;
        const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const velocities = particleVelocitiesRef.current!;
        const originals = particleOriginalsRef.current!;
        const speedScale = (config.airspeedKmh / 160.0) * 0.9;

        for (let i = 0; i < velocities.length; i++) {
          const zIdx = i * 3 + 2;
          const yIdx = i * 3 + 1;
          const xIdx = i * 3 + 0;

          // Move particles rearward along Z axis from front (-Z) to rear (+Z)
          positions[zIdx] += velocities[i] * speedScale;

          // Deflection around rear wing
          if (positions[zIdx] > 1.8 && positions[zIdx] < 2.4 && Math.abs(positions[xIdx]) < 0.85) {
            positions[yIdx] += 0.003 * Math.sin(positions[zIdx] * 4);
          }

          // Loop particles back to front
          if (positions[zIdx] > 3.6) {
            positions[zIdx] = -3.6 - Math.random() * 0.8;
            positions[yIdx] = originals[yIdx] + (Math.random() - 0.5) * 0.1;
            positions[xIdx] = originals[xIdx];
          }
        }
        posAttr.needsUpdate = true;
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 10. Responsive Resizing
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // --------------------------------------------------------------------------
  // REACTIVE HOST VEHICLE LOADER (Synchronized with Vehicle Studio)
  // Loads and mounts the exact GLB model corresponding to the vehicle produced/selected.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current || !hostVehicleGroupRef.current) return;
    const hostGroup = hostVehicleGroupRef.current;
    const loader = new GLTFLoader();

    // Clear previous host vehicle model meshes
    while (hostGroup.children.length > 0) {
      const child = hostGroup.children[0];
      hostGroup.remove(child);
      child.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
    }

    loader.load(
      activeHostGlbPath,
      (gltf) => {
        const model = gltf.scene;
        model.name = "hostVehicleModel";

        // Apply car paint color and shadows to host vehicle
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const matName = (child.material?.name || "").toLowerCase();
            const nodeName = (child.name || "").toLowerCase();
            const isBodyPart =
              matName.includes("paint") ||
              matName.includes("body") ||
              matName.includes("car_paint") ||
              matName.includes("exterior") ||
              nodeName.includes("body") ||
              nodeName.includes("hood") ||
              nodeName.includes("door") ||
              nodeName.includes("trunk") ||
              nodeName.includes("fender") ||
              nodeName.includes("roof");

            if (isBodyPart && child.material instanceof THREE.MeshStandardMaterial) {
              child.material = child.material.clone();
              child.material.color.set(bodyColorHex || "#00e5ff");
              child.material.metalness = 0.85;
              child.material.roughness = 0.22;
              child.material.envMapIntensity = 1.4;
            }
          }
        });

        hostGroup.add(model);
      },
      undefined,
      (err) => {
        console.warn(`[AeroStudio] Failed to load host vehicle GLB at ${activeHostGlbPath}:`, err);
      }
    );
  }, [activeHostGlbPath]);

  // Live paint color updates on the loaded host vehicle
  useEffect(() => {
    if (!hostVehicleGroupRef.current) return;
    hostVehicleGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const matName = (child.material?.name || "").toLowerCase();
        const nodeName = (child.name || "").toLowerCase();
        const isBodyPart =
          matName.includes("paint") ||
          matName.includes("body") ||
          matName.includes("car_paint") ||
          matName.includes("exterior") ||
          nodeName.includes("body") ||
          nodeName.includes("hood") ||
          nodeName.includes("door") ||
          nodeName.includes("trunk") ||
          nodeName.includes("fender") ||
          nodeName.includes("roof");

        if (isBodyPart) {
          child.material.color.set(bodyColorHex || "#00e5ff");
        }
      }
    });
  }, [bodyColorHex]);

  // --------------------------------------------------------------------------
  // LIVE GLB PARAMETRIC 60 FPS TRANSFORM BINDINGS
  // Continuously adjusts mesh rotations and positions around genuine hinge lines!
  // --------------------------------------------------------------------------
  useEffect(() => {
    const nodes = nodesMapRef.current;
    if (nodes.size === 0) return;

    // 1. REAR WING & REAR SPOILER
    const effectiveAngle = drsActive ? -10 : (activeWingAngleDeg || config.rearWing.angleOfAttackDeg);
    const mainPlane = nodes.get("RearWing_MainPlane") || nodes.get("AERO_WING_AIRFOIL");
    if (mainPlane) {
      // In Blender, airfoil points -Y rearward. Pitching down increases downforce:
      mainPlane.rotation.x = -THREE.MathUtils.degToRad(effectiveAngle);
      const spanScale = config.rearWing.spanMm / 1650;
      mainPlane.scale.x = spanScale;
    }

    const upperElement = nodes.get("RearWing_UpperElement");
    if (upperElement) {
      const flapPitch = drsActive ? 0.08 : -THREE.MathUtils.degToRad(effectiveAngle * 1.32);
      upperElement.rotation.x = flapPitch;
      upperElement.scale.x = config.rearWing.spanMm / 1650;
    }

    const gurney = nodes.get("RearWing_Gurney");
    if (gurney) {
      const gHeightScale = Math.max(0.2, config.rearWing.gurneyHeightMm / 12);
      gurney.scale.z = gHeightScale;
    }

    const wingRoot = nodes.get("RearWing_Root");
    if (wingRoot) {
      const heightOffset = Math.max(0, (config.rearWing.heightMm - 260) / 1000);
      wingRoot.position.y = heightOffset;
    }

    // Rear Spoiler
    const spoilerBlade = nodes.get("RearSpoiler_Blade") || nodes.get("AERO_DUCKTAIL_BLADE");
    if (spoilerBlade) {
      spoilerBlade.rotation.x = -THREE.MathUtils.degToRad(rearSpoilerAngleDeg);
      spoilerBlade.scale.x = rearSpoilerWidthMm / 1350;
    }
    const spoilerGurney = nodes.get("RearSpoiler_Gurney");
    if (spoilerGurney) {
      spoilerGurney.scale.z = Math.max(0.1, rearSpoilerGurneyMm / 8);
    }
    const spoilerRoot = nodes.get("RearSpoiler_Root");
    if (spoilerRoot) {
      spoilerRoot.position.y = Math.max(0, (rearSpoilerHeightMm - 110) / 1000);
    }

    // Rear Wing vs Rear Spoiler mutual visibility
    const rearWingGroup = assetGroupsMapRef.current.get("rearWing");
    const rearSpoilerGroup = assetGroupsMapRef.current.get("rearSpoiler");
    if (rearWingGroup && rearSpoilerGroup) {
      if (selectedComponent === "rearSpoiler") {
        rearSpoilerGroup.visible = true;
        rearWingGroup.visible = false;
      } else {
        rearWingGroup.visible = true;
        rearSpoilerGroup.visible = false;
      }
    }

    // 2. FRONT SPLITTER
    const splitterBlade = nodes.get("FrontSplitter_Blade") || nodes.get("AERO_TRACK_SPLITTER_TRAY");
    const extOffset = (config.frontWing.mainChordMm - 320) / 1000;
    if (splitterBlade) {
      splitterBlade.rotation.x = THREE.MathUtils.degToRad(config.frontWing.flapAngleDeg * 0.4);
    }

    const frontSplitterGroup = assetGroupsMapRef.current.get("frontSplitter");
    if (frontSplitterGroup) {
      frontSplitterGroup.visible = selectedComponent === "frontSplitter" || activeSubTab === "frontAero";
    }

    const tieRodsL = nodes.get("FrontSplitter_TieRods_L") || nodes.get("SPLITTER_TIEROD_0.45");
    const tieRodsR = nodes.get("FrontSplitter_TieRods_R") || nodes.get("SPLITTER_TIEROD_-0.45");
    if (tieRodsL && tieRodsR) {
      tieRodsL.visible = splitterTieRodsVisible;
      tieRodsR.visible = splitterTieRodsVisible;
    }

    // 3. CANARDS / DIVE PLANES
    const canardsGroup = assetGroupsMapRef.current.get("canards");
    if (canardsGroup) {
      canardsGroup.visible = canardTierCount >= 1 && (selectedComponent === "canards" || activeSubTab === "frontAero");
    }

    const canardUpperL = nodes.get("Canards_Upper_L");
    const canardUpperR = nodes.get("Canards_Upper_R");
    if (canardUpperL && canardUpperR) {
      canardUpperL.rotation.x = -THREE.MathUtils.degToRad(config.canards.incidenceDeg);
      canardUpperR.rotation.x = -THREE.MathUtils.degToRad(config.canards.incidenceDeg);
    }

    const canardLowerL = nodes.get("Canards_Lower_L");
    const canardLowerR = nodes.get("Canards_Lower_R");
    const bracketLowerL = nodes.get("Canards_Bracket_Lower_L");
    const bracketLowerR = nodes.get("Canards_Bracket_Lower_R");
    const showLowerTier = canardTierCount >= 2;
    if (canardLowerL && canardLowerR) {
      canardLowerL.visible = showLowerTier;
      canardLowerR.visible = showLowerTier;
      canardLowerL.rotation.x = -THREE.MathUtils.degToRad(config.canards.incidenceDeg * 1.18);
      canardLowerR.rotation.x = -THREE.MathUtils.degToRad(config.canards.incidenceDeg * 1.18);
    }
    if (bracketLowerL && bracketLowerR) {
      bracketLowerL.visible = showLowerTier;
      bracketLowerR.visible = showLowerTier;
    }

    // 4. ACTIVE AERO
    const activeAeroGroup = assetGroupsMapRef.current.get("activeAero");
    if (activeAeroGroup) {
      activeAeroGroup.visible =
        selectedComponent === "activeAero" ||
        selectedComponent === "activeWing" ||
        selectedComponent === "activeAirbrake" ||
        activeAeroDeploymentPct > 0 ||
        activeSubTab === "activeAero";
    }

    const activeBlade = nodes.get("Active_Wing_Blade");
    if (activeBlade) {
      const activeAngle = drsActive ? -10 : (activeWingAngleDeg || (4 + (activeAeroDeploymentPct / 100) * 44));
      activeBlade.rotation.x = -THREE.MathUtils.degToRad(activeAngle);
    }

    const activeFlapL = nodes.get("Active_Front_Flap_L");
    const activeFlapR = nodes.get("Active_Front_Flap_R");
    if (activeFlapL && activeFlapR) {
      const activeFrontFlapDeg = (activeAeroDeploymentPct / 100) * 16;
      activeFlapL.rotation.x = THREE.MathUtils.degToRad(activeFrontFlapDeg);
      activeFlapR.rotation.x = THREE.MathUtils.degToRad(activeFrontFlapDeg);
    }

    // 7. EXPLODED / INSPECTION VIEW OFFSETS (Both Macro Subsystems & Discrete Modular Parts)
    const expl = inspectionExplodedPct;

    // Macro Assembly Displacements (Front: -Z, Rear: +Z, Ground: Y)
    const wingRootExpl = nodes.get("RearWing_Root");
    if (wingRootExpl) {
      wingRootExpl.position.y = Math.max(0, (config.rearWing.heightMm - 260) / 1000) + expl * 0.65;
      wingRootExpl.position.z = expl * 0.45;
    }
    const spoilerRootExpl = nodes.get("RearSpoiler_Root");
    if (spoilerRootExpl) {
      spoilerRootExpl.position.y = Math.max(0, (rearSpoilerHeightMm - 110) / 1000) + expl * 0.55;
      spoilerRootExpl.position.z = expl * 0.40;
    }
    const splitterRootExpl = nodes.get("FrontSplitter_Root");
    if (splitterRootExpl) {
      splitterRootExpl.position.z = -expl * 0.55;
      splitterRootExpl.position.y = -expl * 0.25;
    }
    const canardsRootExpl = nodes.get("Canards_Root");
    if (canardsRootExpl) {
      canardsRootExpl.position.x = expl * 0.35;
      canardsRootExpl.position.z = -expl * 0.30;
    }
    const diffuserRootExpl = nodes.get("Diffuser_Root");
    if (diffuserRootExpl) {
      diffuserRootExpl.position.z = expl * 0.55;
      diffuserRootExpl.position.y = -expl * 0.35;
    }
    const underbodyRootExpl = nodes.get("Underbody_Root");
    if (underbodyRootExpl) {
      underbodyRootExpl.position.y = 0.08 - expl * 0.40;
    }
    const roofAeroRootExpl = nodes.get("RoofAero_Root");
    if (roofAeroRootExpl) {
      roofAeroRootExpl.position.y = expl * 0.45;
    }

    // Micro Subcomponent Separations (Only in Modular Inspection Mode when expl > 0)
    if (upperElement && expl > 0.01) {
      upperElement.position.z = 2.32 + expl * 0.22;
      upperElement.position.y = 1.18 + expl * 0.12;
    }
    const epL = nodes.get("RearWing_Endplate_L");
    const epR = nodes.get("RearWing_Endplate_R");
    if (epL && epR && expl > 0.01) {
      epL.position.x = 0.83 + expl * 0.24;
      epR.position.x = -0.83 - expl * 0.24;
    }
    const pylonL = nodes.get("RearWing_Support_L");
    const pylonR = nodes.get("RearWing_Support_R");
    if (pylonL && pylonR && expl > 0.01) {
      pylonL.position.x = 0.38 + expl * 0.10;
      pylonR.position.x = -0.38 - expl * 0.10;
    }

    // 8. ISOLATED COMPONENT VIEW
    const hostChassisGroup = assetGroupsMapRef.current.get("hostChassis");
    if (hostChassisGroup) {
      hostChassisGroup.visible = !isolatedComponentView;
    }

    // 9. SELECTED COMPONENT SUBTLE VISUAL EMPHASIS (Section 31)
    assetGroupsMapRef.current.forEach((group, assetId) => {
      const isSelected =
        assetId === selectedComponent ||
        (selectedComponent === "activeAirbrake" && assetId === "activeAero") ||
        (selectedComponent === "activeWing" && assetId === "activeAero") ||
        (selectedComponent === "undertrayFloor" && assetId === "underbodyFloor") ||
        (selectedComponent === "roofFin" && assetId === "roofAero") ||
        (selectedComponent === "vortexGenerators" && assetId === "roofAero") ||
        (selectedComponent === "coolingLouvers" && assetId === "coolingAero") ||
        (selectedComponent === "brakeDucts" && assetId === "coolingAero") ||
        (selectedComponent === "wheelDiscs" && assetId === "wheelAero") ||
        (selectedComponent === "wheelSpats" && assetId === "wheelAero");

      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (isSelected) {
            child.material.emissive = new THREE.Color(0x002e40);
            child.material.emissiveIntensity = 0.45;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0.0;
          }
        }
      });
    });
  }, [
    config,
    selectedComponent,
    activeAeroDeploymentPct,
    wheelAeroDiscsInstalled,
    canardTierCount,
    splitterTieRodsVisible,
    inspectionExplodedPct,
    isolatedComponentView,
    rearSpoilerAngleDeg,
    rearSpoilerHeightMm,
    rearSpoilerWidthMm,
    rearSpoilerGurneyMm,
    underbodyTunnelDepthMm,
    underbodyFloorStrakeCount,
    activeWingAngleDeg,
    drsActive,
  ]);

  // Wireframe toggle
  useEffect(() => {
    nodesMapRef.current.forEach((node) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        node.material.wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // Streamlines visibility toggle
  useEffect(() => {
    if (streamlineParticlesRef.current) {
      streamlineParticlesRef.current.visible = showStreamlines;
    }
  }, [showStreamlines]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#07090e] shadow-2xl select-none"
    >
      {/* Three.js Canvas Element */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#07090e]/90 backdrop-blur-md flex flex-col items-center justify-center z-30">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Wind size={24} className="text-cyan-400 animate-pulse" />
          </div>
          <p className="text-xs font-mono tracking-wider text-cyan-300 uppercase">
            Loading Precision Aero Digital-Twin CAD Assets ({loadProgress}%)
          </p>
          <div className="w-48 h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Top Floating Viewport HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        {/* Left Badge: Camera & Component Target */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <Crosshair size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {viewAngleLabel}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 font-semibold">
            HOST: {(vehicleVariant || modularModel || "sedan").toUpperCase()}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            60 FPS LIVE HINGE
          </span>
        </div>

        {/* Right HUD Controls: Streamlines, Auto-rotate, Wireframe, Reset */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <button
            onClick={() => setShowStreamlines(!showStreamlines)}
            title="Toggle Wind-Tunnel Streamlines"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showStreamlines
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Wind size={13} />
            <span>Streamlines</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Studio Turntable"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              autoRotate
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RotateCcw size={14} className={autoRotate ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            title="Toggle Wireframe CAD Mesh"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              wireframeMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Layers size={14} />
          </button>

          <button
            onClick={() => triggerCameraFocus("vehicleOverview")}
            title="Reset Camera to Overview"
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <Focus size={14} />
          </button>
        </div>
      </div>

      {/* Quick Camera Focus Floating Shortcuts at Viewport Bottom-Left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg z-20">
        <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5">View:</span>
        {/* Dynamic Contextual Camera Angles */}
        {activeSubTab === "rearAero" ? (
          <>
            <button
              onClick={() => setActiveCameraPreset("rearWingDefault")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "rearWingDefault" || activeCameraPreset === "rearWing"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Elevated 3/4
            </button>
            <button
              onClick={() => setActiveCameraPreset("rearWingAngleInspection")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "rearWingAngleInspection"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Angle Inspection
            </button>
            <button
              onClick={() => setActiveCameraPreset("rearWingProfile")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "rearWingProfile"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Wing Profile
            </button>
            <button
              onClick={() => setActiveCameraPreset("rearWingFullCar")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "rearWingFullCar"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Full Car Rear
            </button>
          </>
        ) : activeSubTab === "frontAero" ? (
          <>
            <button
              onClick={() => setActiveCameraPreset("frontSplitterDefault")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "frontSplitterDefault" || activeCameraPreset === "frontSplitter"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Splitter 3/4
            </button>
            <button
              onClick={() => setActiveCameraPreset("frontSplitterLowCenter")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "frontSplitterLowCenter"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Low Center
            </button>
            <button
              onClick={() => setActiveCameraPreset("canardsClose")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "canardsClose" || activeCameraPreset === "canards"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Canards Close
            </button>
          </>
        ) : activeSubTab === "underbody" ? (
          <>
            <button
              onClick={() => setActiveCameraPreset("diffuser")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "diffuser"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Diffuser Exit
            </button>
            <button
              onClick={() => setActiveCameraPreset("underbodyTunnels")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "underbodyTunnels"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Venturi Tunnels
            </button>
            <button
              onClick={() => setActiveCameraPreset("underbodyFloorDefault")}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeCameraPreset === "underbodyFloorDefault" || activeCameraPreset === "underbodyFloor"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              Low Floor
            </button>
          </>
        ) : (
          (
            [
              { id: "vehicleOverview", label: "Full Car" },
              { id: "frontSplitter", label: "Splitter" },
              { id: "canards", label: "Canards" },
              { id: "rearWing", label: "Rear Wing" },
              { id: "diffuser", label: "Diffuser" },
              { id: "activeWing", label: "Active" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => {
                if (v.id === "vehicleOverview") {
                  setActiveCameraPreset("vehicleOverview");
                } else {
                  setSelectedComponent(v.id as AeroComponentId);
                }
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                (v.id === "vehicleOverview" && viewAngleLabel.includes("Overview")) ||
                selectedComponent === v.id
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              {v.label}
            </button>
          ))
        )}
      </div>

      {/* Bottom Right Live Telemetry Quick Badge */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-mono z-20">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Total DF:</span>
          <span className="text-cyan-400 font-bold">
            {physics.totalDownforceN.toFixed(0)} N
          </span>
          <span className="text-[10px] text-slate-500">
            ({(physics.totalDownforceN / 9.80665).toFixed(0)} kg)
          </span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Bal:</span>
          <span className="text-emerald-400 font-bold">
            {physics.aeroBalanceFrontPct.toFixed(1)}% F
          </span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Cd:</span>
          <span className="text-amber-300 font-bold">
            {physics.totalCd.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};
