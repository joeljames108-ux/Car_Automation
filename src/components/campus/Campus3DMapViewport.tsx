import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useCampusStore } from "../../state/campusStore";
import { CampusUnitDefinition, CampusUnitId } from "../../sim/campus/campusTypes";
import { Building2, Compass, Factory, Layers, ShieldCheck, Zap, Sun, CloudRain, Wind, Snowflake, Train } from "lucide-react";
import { CampusModelLoader } from "./CampusModelLoader";
import { BuildingPlacementEngine } from "./BuildingPlacementEngine";
import { CampusCameraController } from "./CampusCameraController";
import { CAMPUS_PLOTS, getCampusModelPath, RAILWAY_TERMINAL_PLOT, getRailwayModelPath } from "../../sim/campus/campusPlotCoordinates";

/**
 * 45° ISOMETRIC RESIN DIORAMA CAMPUS 3D VIEWPORT
 * 
 * Aesthetic Standards:
 * - Projection: True isometric projection at 45° yaw and 35.264° pitch.
 * - Baseplate: Warm alabaster resin diorama base (#ece6dc) with architectural drafting grid lines (#ded7cb / #94a3b8).
 * - Lighting: Warm studio illumination (#fffbf0 key light, #f8fafc ambient, #edf4f9/#e2d9cc hemisphere).
 * - Atmosphere: Warm cream fog (#f6f4ee) seamlessly blending the resin tabletop.
 * - Weather Particle System: Dynamic toggleable ambient particles (sunny pollen motes, rain streaks, autumn foliage).
 * - Procedural & Blender Pipeline: Direct loading of all 112 authentic Blender 5.2 GLB models from /models/campus/.
 * - Typography: Floating high-contrast black lacquer label plates (UNIT_XX // NAME) elevated in world space.
 * - Colliders: UNIT_13 linear 150m crash rail, UNIT_08 southern perimeter circuit loop,
 *   UNIT_10 outsource boundary with logistics box trucks.
 */

export interface Campus3DMapViewportProps {
  onSelectUnit?: (id: CampusUnitId) => void;
  onOpenRailwayTerminal?: () => void;
  weather?: "sunny" | "rain" | "autumn" | "winter";
  timeOfDay?: "dawn" | "noon" | "sunset" | "night";
}

export const Campus3DMapViewport: React.FC<Campus3DMapViewportProps> = ({
  onSelectUnit,
  onOpenRailwayTerminal,
  weather = "sunny",
  timeOfDay = "noon",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraControllerRef = useRef<CampusCameraController | null>(null);
  const buildingMeshesMap = useRef<Map<CampusUnitId, THREE.Group>>(new Map());
  const railwayMeshGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemisphereLightRef = useRef<THREE.HemisphereLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);

  const weatherParticlesRef = useRef<{
    points: THREE.Points;
    positions: Float32Array;
    velocities: Float32Array;
  } | null>(null);

  const {
    units,
    factoryState,
    selectedUnitId,
    selectUnit,
    cameraFocusTarget,
    railwayTerminalState,
  } = useCampusStore();

  const [hoveredUnit, setHoveredUnit] = useState<CampusUnitDefinition | null>(null);
  const [isHoveringRailway, setIsHoveringRailway] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentWeather, setCurrentWeather] = useState<"sunny" | "rain" | "autumn" | "winter">(weather);

  useEffect(() => {
    setCurrentWeather(weather);
  }, [weather]);

  // ── Three.js Lifecycle ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup: Warm Alabaster / Cream Resin Tabletop Palette
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color("#f6f4ee");
    scene.fog = new THREE.FogExp2("#f6f4ee", 0.0016);

    // 2. Camera setup - True Isometric (45° Yaw, 35.264° Pitch)
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1400);

    // Exact Isometric Coordinates: X = Z, Y = X * sqrt(2)
    const isoDist = 185;
    camera.position.set(isoDist, isoDist * Math.SQRT2, isoDist);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 35;
    controls.maxDistance = 550;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    cameraControllerRef.current = new CampusCameraController(camera, controls);

    // 5. Lighting: Warm Studio Tabletop Illumination
    const ambientLight = new THREE.AmbientLight("#f8fafc", 0.9);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight("#edf4f9", "#e2d9cc", 0.65);
    hemisphereLightRef.current = hemisphereLight;
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight("#fffbf0", 2.2);
    keyLightRef.current = keyLight;
    keyLight.position.set(160, 240, 140);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 20;
    keyLight.shadow.camera.far = 700;
    keyLight.shadow.camera.left = -220;
    keyLight.shadow.camera.right = 220;
    keyLight.shadow.camera.top = 220;
    keyLight.shadow.camera.bottom = -220;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const softFillLight = new THREE.DirectionalLight("#e0f2fe", 0.6);
    softFillLight.position.set(-180, 90, -140);
    scene.add(softFillLight);

    const warmRimLight = new THREE.DirectionalLight("#fed7aa", 0.45);
    warmRimLight.position.set(120, 60, -180);
    scene.add(warmRimLight);

    // 6. Baseplate & Environment
    buildCampusEnvironment(scene);

    // 7. Render 14 Units (Procedural Blender 3D GLBs + Fallback)
    buildCampusBuildings(scene, units, factoryState);

    // 7b. Render HQ Cargo Railway Terminal (Phase 200)
    buildRailwayTerminal(scene, railwayTerminalState);

    // 8. Setup Weather Particles
    setupWeather(scene, weather);

    // 9. Raycasting setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x: e.clientX, y: e.clientY });

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      buildingMeshesMap.current.forEach(group => {
        group.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData.unitId) {
            interactiveMeshes.push(child);
          }
        });
      });
      if (railwayMeshGroupRef.current) {
        railwayMeshGroupRef.current.traverse(child => {
          if ((child as THREE.Mesh).isMesh && (child.userData.isRailwayTerminal || child.userData.unitId === "HQ_CARGO_RAILWAY_TERMINAL")) {
            interactiveMeshes.push(child);
          }
        });
      }

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData.isRailwayTerminal || hit.userData.unitId === "HQ_CARGO_RAILWAY_TERMINAL") {
          setIsHoveringRailway(true);
          setHoveredUnit(null);
          renderer.domElement.style.cursor = "pointer";
          return;
        }
        const uId = hit.userData.unitId as CampusUnitId;
        if (uId && units[uId]) {
          setIsHoveringRailway(false);
          setHoveredUnit(units[uId]);
          renderer.domElement.style.cursor = "pointer";
          return;
        }
      }
      setIsHoveringRailway(false);
      setHoveredUnit(null);
      renderer.domElement.style.cursor = "default";
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      buildingMeshesMap.current.forEach(group => {
        group.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData.unitId) {
            interactiveMeshes.push(child);
          }
        });
      });
      if (railwayMeshGroupRef.current) {
        railwayMeshGroupRef.current.traverse(child => {
          if ((child as THREE.Mesh).isMesh && (child.userData.isRailwayTerminal || child.userData.unitId === "HQ_CARGO_RAILWAY_TERMINAL")) {
            interactiveMeshes.push(child);
          }
        });
      }

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData.isRailwayTerminal || hit.userData.unitId === "HQ_CARGO_RAILWAY_TERMINAL") {
          if (onOpenRailwayTerminal) {
            onOpenRailwayTerminal();
          }
          return;
        }
        const uId = hit.userData.unitId as CampusUnitId;
        if (uId) {
          selectUnit(uId);
          if (onSelectUnit) onSelectUnit(uId);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("click", handlePointerDown);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation render loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();

      // Update ambient weather particles
      if (weatherParticlesRef.current) {
        const wp = weatherParticlesRef.current;
        const posAttr = wp.points.geometry.attributes.position as THREE.BufferAttribute;
        const arr = wp.positions;
        const vel = wp.velocities;
        const count = arr.length / 3;

        for (let i = 0; i < count; i++) {
          arr[i * 3] += vel[i * 3];
          arr[i * 3 + 1] += vel[i * 3 + 1];
          arr[i * 3 + 2] += vel[i * 3 + 2];

          if (arr[i * 3 + 1] < 0.2) {
            arr[i * 3 + 1] = 52 + Math.random() * 8;
            arr[i * 3] = (Math.random() - 0.5) * 320;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 360;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Subtle pulse on selected building beacon
      if (selectedUnitId) {
        const group = buildingMeshesMap.current.get(selectedUnitId);
        if (group) {
          const beacon = group.getObjectByName("SELECTION_BEACON");
          if (beacon) {
            beacon.rotation.z += 0.025;
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handlePointerDown);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── Setup / Switch Weather Particles ──
  const setupWeather = (scene: THREE.Scene, mode: "sunny" | "rain" | "autumn" | "winter") => {
    if (weatherParticlesRef.current) {
      scene.remove(weatherParticlesRef.current.points);
      weatherParticlesRef.current.points.geometry.dispose();
      (weatherParticlesRef.current.points.material as THREE.Material).dispose();
      weatherParticlesRef.current = null;
    }

    const count = mode === "rain" ? 280 : 140;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = Math.random() * 55 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 360;

      if (mode === "sunny") {
        velocities[i * 3] = (Math.random() - 0.5) * 0.08;
        velocities[i * 3 + 1] = -Math.random() * 0.05 - 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
      } else if (mode === "rain") {
        velocities[i * 3] = 0.25;
        velocities[i * 3 + 1] = -Math.random() * 1.5 - 1.2;
        velocities[i * 3 + 2] = 0.12;
      } else if (mode === "winter") {
        velocities[i * 3] = (Math.random() - 0.5) * 0.05;
        velocities[i * 3 + 1] = -Math.random() * 0.4 - 0.15;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      } else {
        // autumn
        velocities[i * 3] = (Math.random() - 0.5) * 0.18;
        velocities[i * 3 + 1] = -Math.random() * 0.1 - 0.04;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const color =
      mode === "sunny"
        ? "#fde047"
        : mode === "rain"
        ? "#7dd3fc"
        : mode === "autumn"
        ? "#fb923c"
        : "#ffffff";
    const size =
      mode === "sunny" ? 1.6 : mode === "rain" ? 1.2 : mode === "autumn" ? 2.4 : 1.8;

    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: mode === "sunny" ? 0.75 : mode === "rain" ? 0.65 : mode === "winter" ? 0.85 : 0.85,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geom, mat);
    scene.add(points);
    weatherParticlesRef.current = { points, positions, velocities };
  };

  // Re-run setupWeather when weather state changes
  useEffect(() => {
    if (sceneRef.current) {
      setupWeather(sceneRef.current, currentWeather);
    }
  }, [currentWeather]);

  // ── Dynamic Atmosphere & Time-of-Day Lighting (Phase 223) ──
  useEffect(() => {
    if (
      !sceneRef.current ||
      !keyLightRef.current ||
      !ambientLightRef.current ||
      !hemisphereLightRef.current
    ) {
      return;
    }
    const scene = sceneRef.current;

    if (timeOfDay === "dawn") {
      scene.background = new THREE.Color("#fef3c7");
      if (scene.fog) (scene.fog as THREE.FogExp2).color.set("#fef3c7");
      keyLightRef.current.color.set("#fed7aa");
      keyLightRef.current.intensity = 1.7;
      ambientLightRef.current.color.set("#ffedd5");
      ambientLightRef.current.intensity = 0.75;
      hemisphereLightRef.current.color.set("#fed7aa");
      hemisphereLightRef.current.groundColor.set("#e2d9cc");
    } else if (timeOfDay === "sunset") {
      scene.background = new THREE.Color("#fed7aa");
      if (scene.fog) (scene.fog as THREE.FogExp2).color.set("#fed7aa");
      keyLightRef.current.color.set("#f97316");
      keyLightRef.current.intensity = 2.0;
      ambientLightRef.current.color.set("#fef3c7");
      ambientLightRef.current.intensity = 0.7;
      hemisphereLightRef.current.color.set("#fb923c");
      hemisphereLightRef.current.groundColor.set("#78716c");
    } else if (timeOfDay === "night") {
      scene.background = new THREE.Color("#0f172a");
      if (scene.fog) (scene.fog as THREE.FogExp2).color.set("#0f172a");
      keyLightRef.current.color.set("#38bdf8");
      keyLightRef.current.intensity = 0.5;
      ambientLightRef.current.color.set("#1e293b");
      ambientLightRef.current.intensity = 0.4;
      hemisphereLightRef.current.color.set("#0284c7");
      hemisphereLightRef.current.groundColor.set("#020617");
    } else {
      // noon (default warm diorama)
      scene.background = new THREE.Color("#f6f4ee");
      if (scene.fog) (scene.fog as THREE.FogExp2).color.set("#f6f4ee");
      keyLightRef.current.color.set("#fffbf0");
      keyLightRef.current.intensity = 2.2;
      ambientLightRef.current.color.set("#f8fafc");
      ambientLightRef.current.intensity = 0.9;
      hemisphereLightRef.current.color.set("#edf4f9");
      hemisphereLightRef.current.groundColor.set("#e2d9cc");
    }
  }, [timeOfDay]);

  // ── Re-render buildings when units or factoryState updates ──
  useEffect(() => {
    if (!sceneRef.current) return;
    buildCampusBuildings(sceneRef.current, units, factoryState);
  }, [units, factoryState]);

  // ── Re-render Railway Terminal when railwayTerminalState updates ──
  useEffect(() => {
    if (!sceneRef.current) return;
    buildRailwayTerminal(sceneRef.current, railwayTerminalState);
  }, [railwayTerminalState]);

  // ── Smooth Camera Transition when cameraFocusTarget or selectedUnitId changes ──
  useEffect(() => {
    if (!cameraControllerRef.current) return;

    if (cameraFocusTarget) {
      const [tx, ty, tz] = cameraFocusTarget;
      cameraControllerRef.current.flyTo(tx, ty, tz, 65);
    } else if (selectedUnitId && units[selectedUnitId]) {
      const u = units[selectedUnitId];
      cameraControllerRef.current.flyTo(u.mapCoordinates.x, u.mapCoordinates.y, u.mapCoordinates.z, 60);
    }
  }, [cameraFocusTarget, selectedUnitId, units]);

  // ── Selection Beacon Visibility Toggle ──
  useEffect(() => {
    buildingMeshesMap.current.forEach((group, uId) => {
      const beacon = group.getObjectByName("SELECTION_BEACON");
      if (beacon) {
        beacon.visible = uId === selectedUnitId;
      }
    });
  }, [selectedUnitId]);

  // ── Baseplate Environment (Warm Alabaster Resin Slab + Architectural Drafting Grid) ──
  const buildCampusEnvironment = (scene: THREE.Scene) => {
    // 1. Master Matte Resin Baseplate Slab (Extended to cover Western Logistics Rail Spur)
    const baseplateGeo = new THREE.BoxGeometry(410, 6, 380);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: "#ebe6dc", // Warm alabaster / cream resin diorama pedestal
      roughness: 0.75,
      metalness: 0.05,
    });
    const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
    baseplate.position.set(-35, -3.01, 0);
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // 2. Architectural Drafting Grid Lines
    const gridHelper = new THREE.GridHelper(408, 68, "#94a3b8", "#ded7cb");
    gridHelper.position.set(-35, 0.02, 0);
    scene.add(gridHelper);

    // Recessed Expansion Joints (Architectural relief channels every 24m)
    [-216, -168, -120, -72, -24, 24, 72, 120, 168].forEach(xPos => {
      const jointGeo = new THREE.BoxGeometry(0.8, 0.4, 370);
      const jointMat = new THREE.MeshBasicMaterial({ color: "#cdc4b6" });
      const joint = new THREE.Mesh(jointGeo, jointMat);
      joint.position.set(xPos, 0.03, 0);
      scene.add(joint);
    });

    [-144, -96, -48, 0, 48, 96, 144].forEach(zPos => {
      const jointGeo = new THREE.BoxGeometry(330, 0.4, 0.8);
      const jointMat = new THREE.MeshBasicMaterial({ color: "#cdc4b6" });
      const joint = new THREE.Mesh(jointGeo, jointMat);
      joint.position.set(0, 0.03, zPos);
      scene.add(joint);
    });

    // 3. Central Pedestrian Travertine Boulevard (North-South & East-West)
    const boulevardMat = new THREE.MeshStandardMaterial({
      color: "#f8f6f0", // Warm travertine white concrete
      roughness: 0.82,
      metalness: 0.02,
    });
    const boulevardNS = new THREE.Mesh(new THREE.PlaneGeometry(16, 260), boulevardMat);
    boulevardNS.rotation.x = -Math.PI / 2;
    boulevardNS.position.set(0, 0.06, 0);
    boulevardNS.receiveShadow = true;
    scene.add(boulevardNS);

    const boulevardEW = new THREE.Mesh(new THREE.PlaneGeometry(240, 16), boulevardMat);
    boulevardEW.rotation.x = -Math.PI / 2;
    boulevardEW.position.set(0, 0.06, 0);
    boulevardEW.receiveShadow = true;
    scene.add(boulevardEW);

    // Central Executive Roundabout Plaza
    const centerPlazaGeo = new THREE.CylinderGeometry(24, 24, 0.5, 48);
    const centerPlazaMat = new THREE.MeshStandardMaterial({
      color: "#334155", // Slate stone plaza ring
      roughness: 0.6,
      metalness: 0.15,
    });
    const centerPlaza = new THREE.Mesh(centerPlazaGeo, centerPlazaMat);
    centerPlaza.position.set(0, 0.25, 0);
    centerPlaza.receiveShadow = true;
    scene.add(centerPlaza);

    // Azure Reflective Basin Pool
    const poolGeo = new THREE.CylinderGeometry(9, 9, 0.8, 32);
    const poolMat = new THREE.MeshStandardMaterial({
      color: "#0284c7",
      roughness: 0.08,
      metalness: 0.85,
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(0, 0.55, 0);
    scene.add(pool);

    // 4. OUTSOURCE BOUNDARY LINE (Zone A Perimeter Transition)
    const boundaryGeo = new THREE.BoxGeometry(320, 0.6, 12);
    const boundaryMat = new THREE.MeshStandardMaterial({
      color: "#92400e", // Natural unpaved gravel/dirt road transition
      roughness: 0.92,
    });
    const boundaryRoad = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundaryRoad.position.set(0, 0.08, -85);
    boundaryRoad.receiveShadow = true;
    scene.add(boundaryRoad);

    // Yellow/Black Hazard Posts across boundary
    for (let x = -130; x <= 130; x += 20) {
      const postGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.5);
      const postMat = new THREE.MeshStandardMaterial({ color: "#eab308" });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 1.75, -85);
      scene.add(post);
    }

    // Logistics Delivery Box Trucks (Outsourced freight)
    createLogisticsBoxTruck(scene, 15, -85);
    createLogisticsBoxTruck(scene, -85, -85);

    // 5. LINEAR COLLIDER: UNIT_13 Safety 150m Crash Test Rail Corridor
    const railBedGeo = new THREE.BoxGeometry(8, 0.4, 150);
    const railBedMat = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.88 });
    const railBed = new THREE.Mesh(railBedGeo, railBedMat);
    railBed.position.set(110, 0.15, 60);
    railBed.receiveShadow = true;
    scene.add(railBed);

    // Twin Steel Propulsion Rails
    [-2, 2].forEach(offset => {
      const railGeo = new THREE.BoxGeometry(0.3, 0.3, 148);
      const railMat = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.2 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(110 + offset, 0.45, 60);
      scene.add(rail);
    });

    // Concrete Crash Impact Barrier at End of Rail
    const barrierGeo = new THREE.BoxGeometry(10, 6, 8);
    const barrierMat = new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.85 });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(110, 3, -15);
    barrier.castShadow = true;
    barrier.receiveShadow = true;
    scene.add(barrier);

    // 6. MOTORSPORT TRACK COLLIDER: UNIT_08 Southern Perimeter Circuit Loop
    const trackCurve = new THREE.EllipseCurve(
      0, 155, // Center (X, Z)
      110, 24, // X radius, Y radius
      0, 2 * Math.PI,
      false, 0
    );
    const trackPoints = trackCurve.getPoints(64);
    const trackShape = new THREE.Shape(trackPoints);
    const trackGeo = new THREE.ShapeGeometry(trackShape);
    const trackMat = new THREE.MeshStandardMaterial({
      color: "#1e293b", // Dark racing asphalt
      roughness: 0.92,
      side: THREE.DoubleSide,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.05;
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);
  };

  // ── Logistics Box Truck Generator (Outsource Freight) ──
  const createLogisticsBoxTruck = (scene: THREE.Scene, posX: number, posZ: number) => {
    const truckGroup = new THREE.Group();
    truckGroup.position.set(posX, 0.2, posZ);

    // Cab
    const cabGeo = new THREE.BoxGeometry(3.5, 3.2, 4.5);
    const cabMat = new THREE.MeshStandardMaterial({ color: "#fb7185", roughness: 0.4 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.8, 4);
    truckGroup.add(cab);

    // Box Trailer
    const boxGeo = new THREE.BoxGeometry(3.8, 4.2, 9);
    const boxMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 2.3, -3);
    truckGroup.add(box);

    scene.add(truckGroup);
  };

  // ── Floating Black Lacquer Label Texture Factory ──
  const createLabelTexture = (unitKey: string, name: string, zoneLabel: string): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // High-Gloss Dark Slate Lacquer Pill Background
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(8, 8, 496, 124, 16);
      } else {
        ctx.rect(8, 8, 496, 124);
      }
      ctx.fill();

      // Cyan Accent Rim Border
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Unit Key Badge Pill
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(24, 20, 96, 30, 8);
      } else {
        ctx.rect(24, 20, 96, 30);
      }
      ctx.fill();

      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(unitKey, 72, 35);

      // Zone Subtitle
      ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText(zoneLabel.toUpperCase(), 135, 36);

      // Main Building Name
      ctx.font = "bold 24px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#f8fafc";
      ctx.textAlign = "left";
      ctx.fillText(name, 24, 95);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // ── Render 14 Campus Units (Procedural Blender 3D GLBs + Fallback) ──
  const buildCampusBuildings = (
    scene: THREE.Scene,
    unitsMap: Record<CampusUnitId, CampusUnitDefinition>,
    facState: typeof factoryState
  ) => {
    // Clear old meshes
    buildingMeshesMap.current.forEach(group => {
      scene.remove(group);
    });
    buildingMeshesMap.current.clear();

    const modelLoader = CampusModelLoader.getInstance();

    Object.values(unitsMap).forEach(unit => {
      const group = new THREE.Group();
      group.name = `CAMPUS_UNIT_${unit.id}`;
      const plot = CAMPUS_PLOTS[unit.id];
      const isLocked = unit.status === "locked" || unit.status === "outsourced" || unit.level === 0;

      // Resolve procedural 3D GLB model path
      const modelPath = getCampusModelPath(unit.id, unit.level, isLocked);

      modelLoader.loadModel(modelPath, unit.id, unit.level).then(({ scene: modelScene, isPlaceholderFallback }) => {
        if (isPlaceholderFallback) {
          // Generate procedural diorama fallback
          createProceduralBuildingMesh(group, unit, facState);
        } else {
          group.add(modelScene);
        }
      });

      // World placement: Snap to plot position or map coordinates
      if (plot) {
        BuildingPlacementEngine.placeBuildingOnPlot(group, unit, plot);
      } else {
        group.position.set(unit.mapCoordinates.x, unit.mapCoordinates.y, unit.mapCoordinates.z);
        group.rotation.y = unit.mapCoordinates.rotationY;
      }

      // If plot is locked, also add surveyor stakes & caution ribbon
      if (isLocked && plot) {
        const lockedMarker = BuildingPlacementEngine.createLockedPlotMarker(plot, unit.name);
        group.add(lockedMarker);
      }

      // Attach user data to group
      group.userData = {
        unitId: unit.id,
        unitKey: unit.unitKey,
        level: unit.level,
        status: unit.status,
      };

      // Selection Highlight Ring / Beacon
      const ringRadius = Math.max(unit.mapCoordinates.footprint.width, unit.mapCoordinates.footprint.length) * 0.65;
      const ringGeo = new THREE.RingGeometry(ringRadius, ringRadius * 1.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: selectedUnitId === unit.id ? "#0284c7" : "#0ea5e9",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: selectedUnitId === unit.id ? 0.95 : 0.25,
      });
      const selectionRing = new THREE.Mesh(ringGeo, ringMat);
      selectionRing.name = "SELECTION_BEACON";
      selectionRing.rotation.x = -Math.PI / 2;
      selectionRing.position.y = 0.25;
      selectionRing.visible = selectedUnitId === unit.id;
      group.add(selectionRing);

      // Floating Black Lacquer Label Plate
      const labelTexture = createLabelTexture(unit.unitKey, unit.name, unit.zoneLabel);
      const labelGeo = new THREE.PlaneGeometry(16, 4.4);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      const labelHeight = isLocked ? 10 : (unit.mapCoordinates.footprint.height + 4.5);
      labelMesh.position.set(0, labelHeight, unit.mapCoordinates.footprint.length * 0.45);
      labelMesh.rotation.x = -0.3; // Tilted slightly towards isometric camera
      labelMesh.userData.unitId = unit.id;
      group.add(labelMesh);

      scene.add(group);
      buildingMeshesMap.current.set(unit.id, group);
    });
  };

  // ── Render HQ Cargo Railway Terminal (Phase 200) ──
  const buildRailwayTerminal = (
    scene: THREE.Scene,
    railState: typeof railwayTerminalState
  ) => {
    if (railwayMeshGroupRef.current) {
      scene.remove(railwayMeshGroupRef.current);
      railwayMeshGroupRef.current = null;
    }

    const group = new THREE.Group();
    group.name = "HQ_CARGO_RAILWAY_TERMINAL";
    const plot = RAILWAY_TERMINAL_PLOT;

    const modelPath = getRailwayModelPath(railState.level);
    const modelLoader = CampusModelLoader.getInstance();

    modelLoader
      .loadModel(modelPath, undefined, railState.level)
      .then(({ scene: modelScene, isPlaceholderFallback }) => {
        if (isPlaceholderFallback) {
          createProceduralRailwayMesh(group, railState.level);
        } else {
          modelScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.isRailwayTerminal = true;
            }
          });
          group.add(modelScene);
        }
      });

    group.position.set(plot.worldPosition.x, plot.worldPosition.y, plot.worldPosition.z);
    group.rotation.y = (plot.rotationDeg * Math.PI) / 180;
    group.userData = {
      isRailwayTerminal: true,
      unitId: "HQ_CARGO_RAILWAY_TERMINAL",
      level: railState.level,
    };

    // Floating Black Lacquer Label Plate for Railway
    const labelTexture = createLabelTexture(
      `RAIL L${railState.level}`,
      railState.level === 0 ? "Grass Embankment" : `HQ Cargo Rail Terminal (L${railState.level})`,
      "Zone A Logistics"
    );
    const labelGeo = new THREE.PlaneGeometry(16, 4.4);
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 14, 0);
    labelMesh.rotation.x = -0.3;
    labelMesh.userData.isRailwayTerminal = true;
    group.add(labelMesh);

    scene.add(group);
    railwayMeshGroupRef.current = group;
  };

  const createProceduralRailwayMesh = (group: THREE.Group, level: number) => {
    // Ballast bed
    const ballastGeo = new THREE.BoxGeometry(30, 0.6, 90);
    const ballastMat = new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 0.95 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.y = 0.3;
    ballast.receiveShadow = true;
    ballast.userData.isRailwayTerminal = true;
    group.add(ballast);

    // Twin Steel Rails
    [-3, 3].forEach((rx) => {
      const railGeo = new THREE.BoxGeometry(0.3, 0.4, 88);
      const railMat = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.85, roughness: 0.2 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(rx, 0.7, 0);
      rail.userData.isRailwayTerminal = true;
      group.add(rail);
    });

    if (level > 0) {
      const shedGeo = new THREE.BoxGeometry(16, 8, 30);
      const shedMat = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.7 });
      const shed = new THREE.Mesh(shedGeo, shedMat);
      shed.position.set(10, 4, -15);
      shed.castShadow = true;
      shed.userData.isRailwayTerminal = true;
      group.add(shed);
    }
  };

  // ── Procedural Diorama Architecture Factory (Fallback Geometry) ──
  const createProceduralBuildingMesh = (
    group: THREE.Group,
    unit: CampusUnitDefinition,
    facState: typeof factoryState
  ) => {
    const { width, length, height } = unit.mapCoordinates.footprint;

    // Palette Mapping:
    // 1970 Era: Warm lavender exposed brick, coral-pink I-beams, tinted acrylic clerestory windows, concrete rooftop parking
    const lavenderBrickMat = new THREE.MeshStandardMaterial({
      color: "#9d8ba8", // Warm lavender exposed brick
      roughness: 0.88,
      metalness: 0.05,
    });
    const coralBeamMat = new THREE.MeshStandardMaterial({
      color: "#fb7185", // Coral-pink structural I-beams
      roughness: 0.45,
      metalness: 0.55,
    });
    const acrylicWindowMat = new THREE.MeshStandardMaterial({
      color: "#38bdf8", // Tinted acrylic clerestory window
      roughness: 0.1,
      metalness: 0.85,
    });
    const concreteRoofMat = new THREE.MeshStandardMaterial({
      color: "#94a3b8", // Concrete rooftop parking
      roughness: 0.75,
    });

    // Special handling for Unit 10: FACTORY (Unowned / Outsourced)
    if (unit.isFactory) {
      if (facState.ownershipStatus === "no_factory_outsourced" || facState.ownershipStatus === "land_acquired") {
        // Demarcated Future Site / Surveyor Markers across Outsource Boundary
        const plotGeo = new THREE.BoxGeometry(width, 0.4, length);
        const plotMat = new THREE.MeshStandardMaterial({
          color: "#1e293b",
          roughness: 0.9,
          wireframe: true,
        });
        const plotMesh = new THREE.Mesh(plotGeo, plotMat);
        plotMesh.position.y = 0.2;
        plotMesh.userData.unitId = unit.id;
        group.add(plotMesh);

        // Wooden surveyor corner stakes & caution tape
        [-width / 2, width / 2].forEach(cx => {
          [-length / 2, length / 2].forEach(cz => {
            const stakeGeo = new THREE.CylinderGeometry(0.5, 0.5, 7);
            const stakeMat = new THREE.MeshStandardMaterial({ color: "#f59e0b" });
            const stake = new THREE.Mesh(stakeGeo, stakeMat);
            stake.position.set(cx, 3.5, cz);
            stake.userData.unitId = unit.id;
            group.add(stake);
          });
        });

        // Steel truss framework outline (under construction)
        const frameGeo = new THREE.BoxGeometry(width * 0.85, height * 0.65, length * 0.85);
        const frameMat = new THREE.MeshStandardMaterial({
          color: "#f59e0b",
          wireframe: true,
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.y = (height * 0.65) / 2;
        frameMesh.userData.unitId = unit.id;
        group.add(frameMesh);
        return;
      }
    }

    // Special handling for Locked Expansion Plots (UNIT_03, UNIT_08, UNIT_09, UNIT_13)
    if (unit.status === "locked") {
      const plotGeo = new THREE.BoxGeometry(width, 0.4, length);
      const plotMat = new THREE.MeshStandardMaterial({
        color: "#0f172a",
        roughness: 0.95,
        wireframe: true,
      });
      const plotMesh = new THREE.Mesh(plotGeo, plotMat);
      plotMesh.position.y = 0.2;
      plotMesh.userData.unitId = unit.id;
      group.add(plotMesh);

      // Yellow surveyor stakes
      [-width / 2, width / 2].forEach(cx => {
        [-length / 2, length / 2].forEach(cz => {
          const stakeGeo = new THREE.CylinderGeometry(0.4, 0.4, 5);
          const stakeMat = new THREE.MeshStandardMaterial({ color: "#eab308" });
          const stake = new THREE.Mesh(stakeGeo, stakeMat);
          stake.position.set(cx, 2.5, cz);
          stake.userData.unitId = unit.id;
          group.add(stake);
        });
      });
      return;
    }

    // Special handling for UNIT_07: Testing & Validation HQ (Skid Pad only at start)
    if (unit.id === "TESTING_VALIDATION_HQ" && unit.level <= 1) {
      // Circular Asphalt Skid Pad
      const padGeo = new THREE.CylinderGeometry(width * 0.48, width * 0.48, 0.4, 48);
      const padMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.9 });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.y = 0.2;
      padMesh.receiveShadow = true;
      padMesh.userData.unitId = unit.id;
      group.add(padMesh);

      // Concentric Radius Ring Lines
      [width * 0.2, width * 0.35].forEach(r => {
        const ringGeo = new THREE.RingGeometry(r - 0.2, r + 0.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: "#f8fafc", side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.42;
        group.add(ring);
      });

      // Telemetry Mast
      const mastGeo = new THREE.CylinderGeometry(0.3, 0.5, 12);
      const mastMat = new THREE.MeshStandardMaterial({ color: "#fb7185", metalness: 0.8 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(0, 6, 0);
      group.add(mast);
      return;
    }

    // ── Standard 1970 Architecture Structure ──
    // 1. Concrete Ground Plinth
    const plinthGeo = new THREE.BoxGeometry(width * 1.05, 1.2, length * 1.05);
    const plinthMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.7 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.6;
    plinth.receiveShadow = true;
    plinth.userData.unitId = unit.id;
    group.add(plinth);

    // 2. Warm Lavender Exposed Brick Facade
    const bodyGeo = new THREE.BoxGeometry(width, height, length);
    const body = new THREE.Mesh(bodyGeo, lavenderBrickMat);
    body.position.y = height / 2 + 1.2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.unitId = unit.id;
    group.add(body);

    // 3. Coral-Pink Structural I-Beam Exoskeleton
    [-width / 2, width / 2].forEach(bx => {
      const colGeo = new THREE.BoxGeometry(1.4, height + 2, 1.4);
      const col = new THREE.Mesh(colGeo, coralBeamMat);
      col.position.set(bx, (height + 2) / 2 + 0.5, -length / 2);
      col.castShadow = true;
      group.add(col);

      const col2 = new THREE.Mesh(colGeo, coralBeamMat);
      col2.position.set(bx, (height + 2) / 2 + 0.5, length / 2);
      col2.castShadow = true;
      group.add(col2);
    });

    // 4. Tinted Acrylic Clerestory Windows
    const bandGeo = new THREE.BoxGeometry(width * 1.02, 1.8, length * 1.02);
    const windowBand = new THREE.Mesh(bandGeo, acrylicWindowMat);
    windowBand.position.y = height + 0.4;
    group.add(windowBand);

    // 5. Concrete Rooftop Parking Deck with Access Stairwell
    const roofDeckGeo = new THREE.BoxGeometry(width * 0.95, 0.8, length * 0.95);
    const roofDeck = new THREE.Mesh(roofDeckGeo, concreteRoofMat);
    roofDeck.position.y = height + 1.6;
    roofDeck.castShadow = true;
    group.add(roofDeck);

    // Rooftop Stairwell Headhouse
    const stairGeo = new THREE.BoxGeometry(width * 0.28, 3.2, length * 0.28);
    const stair = new THREE.Mesh(stairGeo, coralBeamMat);
    stair.position.set(-width * 0.25, height + 3.2, -length * 0.25);
    stair.castShadow = true;
    group.add(stair);
  };

  // Preset Camera Angles
  const setCameraPreset = (mode: "overview" | "zone_a" | "zone_b" | "zone_c" | "zone_d" | "railway") => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    const isoDist = 185;

    if (mode === "overview") {
      controls.target.set(0, 0, 0);
      camera.position.set(isoDist, isoDist * Math.SQRT2, isoDist);
    } else if (mode === "zone_a") {
      controls.target.set(0, 10, -100);
      camera.position.set(90, 120, -20);
    } else if (mode === "zone_b") {
      controls.target.set(-55, 10, 10);
      camera.position.set(25, 110, 90);
    } else if (mode === "zone_c") {
      controls.target.set(50, 10, 5);
      camera.position.set(130, 110, 85);
    } else if (mode === "zone_d") {
      controls.target.set(0, 10, 110);
      camera.position.set(90, 120, 190);
    } else if (mode === "railway") {
      controls.target.set(-180, 8, -45);
      camera.position.set(-110, 110, 35);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#f6f4ee] rounded-2xl overflow-hidden border border-[#dad4c5] select-none shadow-xl">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Subtle Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 65%, rgba(218, 212, 197, 0.45) 100%)",
        }}
      />

      {/* Floating Viewport Camera & Weather Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#f8f6f0]/95 backdrop-blur-md border border-[#dad4c5] shadow-lg">
        <button
          onClick={() => setCameraPreset("overview")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
        >
          <Compass size={13} className="text-cyan-600" /> 45° ISO
        </button>
        <button
          onClick={() => setCameraPreset("zone_a")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-amber-800 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
        >
          <Factory size={13} className="text-amber-600" /> ZONE A
        </button>
        <button
          onClick={() => setCameraPreset("zone_b")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-purple-800 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
        >
          <Zap size={13} className="text-purple-600" /> ZONE B
        </button>
        <button
          onClick={() => setCameraPreset("zone_c")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-blue-800 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
        >
          <Building2 size={13} className="text-blue-600" /> ZONE C
        </button>
        <button
          onClick={() => setCameraPreset("zone_d")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-rose-800 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
        >
          <ShieldCheck size={13} className="text-rose-600" /> ZONE D
        </button>
        <button
          onClick={() => setCameraPreset("railway")}
          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/80 border border-[#dad4c5] text-slate-700 hover:text-cyan-800 hover:bg-white transition-all flex items-center gap-1 shadow-sm"
          title="Focus on HQ Cargo Railway Terminal"
        >
          <Train size={13} className="text-cyan-600" /> RAIL HUB
        </button>

        <div className="h-4 w-px bg-[#dad4c5] mx-1" />

        {/* Weather Controls */}
        <button
          onClick={() => setCurrentWeather("sunny")}
          className={`p-1.5 rounded-lg border transition-all ${
            currentWeather === "sunny"
              ? "bg-amber-100/90 border-amber-300 text-amber-700 shadow-sm"
              : "bg-white/60 border-transparent text-slate-400 hover:text-slate-700"
          }`}
          title="Sunny pollen motes"
        >
          <Sun size={13} />
        </button>
        <button
          onClick={() => setCurrentWeather("rain")}
          className={`p-1.5 rounded-lg border transition-all ${
            currentWeather === "rain"
              ? "bg-sky-100/90 border-sky-300 text-sky-700 shadow-sm"
              : "bg-white/60 border-transparent text-slate-400 hover:text-slate-700"
          }`}
          title="Light rain"
        >
          <CloudRain size={13} />
        </button>
        <button
          onClick={() => setCurrentWeather("autumn")}
          className={`p-1.5 rounded-lg border transition-all ${
            currentWeather === "autumn"
              ? "bg-orange-100/90 border-orange-300 text-orange-700 shadow-sm"
              : "bg-white/60 border-transparent text-slate-400 hover:text-slate-700"
          }`}
          title="Autumn leaves"
        >
          <Wind size={13} />
        </button>
        <button
          onClick={() => setCurrentWeather("winter")}
          className={`p-1.5 rounded-lg border transition-all ${
            currentWeather === "winter"
              ? "bg-indigo-100/90 border-indigo-300 text-indigo-700 shadow-sm"
              : "bg-white/60 border-transparent text-slate-400 hover:text-slate-700"
          }`}
          title="Winter snowfall"
        >
          <Snowflake size={13} />
        </button>
      </div>

      {/* Campus Map Legend & Diorama Hint */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none p-3.5 rounded-xl bg-[#f8f6f0]/95 backdrop-blur-md border border-[#dad4c5] max-w-sm shadow-lg text-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Layers size={15} className="text-cyan-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            14-Unit Resin Diorama Campus
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          True 45° isometric tabletop view. Procedural Blender 3D CAD architecture with dynamic weather motes & zone telemetry.
        </p>
      </div>

      {/* Floating Hover Badge */}
      {hoveredUnit && (
        <div
          className="fixed z-50 pointer-events-none p-3 rounded-xl bg-[#fdfcf9]/98 border border-[#dad4c5] shadow-2xl backdrop-blur-md flex flex-col gap-1 -translate-x-1/2 -translate-y-full -mt-4 min-w-[220px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800">
              {hoveredUnit.unitKey || hoveredUnit.code}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {hoveredUnit.zoneLabel}
            </span>
          </div>

          <span className="text-xs font-bold text-slate-900 mt-1">{hoveredUnit.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{hoveredUnit.footprintClass}</span>

          <div className="flex items-center justify-between gap-3 text-[10px] font-mono mt-1 pt-1 border-t border-slate-200">
            <span className="text-slate-500">1970 State:</span>
            <span className={`font-bold ${
              hoveredUnit.status === "operational" ? "text-emerald-700" :
              hoveredUnit.status === "outsourced" ? "text-amber-700" : "text-cyan-700"
            }`}>
              {hoveredUnit.startingState1970}
            </span>
          </div>
        </div>
      )}

      {/* Floating Hover Badge for HQ Cargo Railway Terminal */}
      {isHoveringRailway && !hoveredUnit && (
        <div
          className="fixed z-50 pointer-events-none p-3 rounded-xl bg-[#fdfcf9]/98 border border-[#dad4c5] shadow-2xl backdrop-blur-md flex flex-col gap-1 -translate-x-1/2 -translate-y-full -mt-4 min-w-[220px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800">
              RAIL_TERMINAL
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              ZONE A LOGISTICS
            </span>
          </div>

          <span className="text-xs font-bold text-slate-900 mt-1">
            {railwayTerminalState.level === 0 ? "Undeveloped Rail Embankment" : `HQ Cargo Rail Terminal (Level ${railwayTerminalState.level})`}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {railwayTerminalState.operationalStatus === "under_construction" ? "Civil Works Under Construction" : "Operational Heavy Logistics"}
          </span>

          <div className="flex items-center justify-between gap-3 text-[10px] font-mono mt-1 pt-1 border-t border-slate-200">
            <span className="text-slate-500">Action:</span>
            <span className="font-bold text-cyan-700">Click to Open Terminal (R)</span>
          </div>
        </div>
      )}
    </div>
  );
};
