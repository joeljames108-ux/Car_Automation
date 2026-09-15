// ============================================================================
// MODULAR VEHICLE CANVAS VIEWPORT
// ============================================================================
// Photorealistic Three.js WebGL viewport for inspecting isolated modular sub-assemblies
// and cumulative zero-offset assembled vehicles with real-time exploded view,
// X-Ray inspection, and 360-degree orbit controls.
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Camera,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Box,
  Layers,
  Sparkles,
  MoveHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import {
  useModularVehicleBuilderStore,
  getStageGlbPaths,
  getFinalPowertrainGlbPaths,
  getStageIndividualParts,
  getCompleteVehicleGlbPath,
  STAGE_EXPLODED_OFFSETS,
  AssemblyStage,
} from "../../state/modularVehicleBuilderStore";

export const ModularVehicleCanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zustand Store Subscriptions
  const selectedModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const currentStage = useModularVehicleBuilderStore((s) => s.currentStage);
  const installedStages = useModularVehicleBuilderStore((s) => s.installedStages);
  const hiddenPartIds = useModularVehicleBuilderStore((s) => s.hiddenPartIds);
  const viewportMode = useModularVehicleBuilderStore((s) => s.viewportMode);
  const explodedProgress = useModularVehicleBuilderStore((s) => s.explodedProgress);
  const isXRay = useModularVehicleBuilderStore((s) => s.isXRay);
  const isAutoRotate = useModularVehicleBuilderStore((s) => s.isAutoRotate);
  const bodyColorHex = useModularVehicleBuilderStore((s) => s.bodyColorHex);
  const enginePosition = useModularVehicleBuilderStore((s) => s.enginePosition);

  const setViewportMode = useModularVehicleBuilderStore((s) => s.setViewportMode);
  const setExplodedProgress = useModularVehicleBuilderStore((s) => s.setExplodedProgress);
  const setIsXRay = useModularVehicleBuilderStore((s) => s.setIsXRay);
  const setIsAutoRotate = useModularVehicleBuilderStore((s) => s.setIsAutoRotate);

  // Local Viewport States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<string>("iso");
  const [viewportTheme, setViewportTheme] = useState<"light" | "dark">("light");

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rootAssemblyGroupRef = useRef<THREE.Group | null>(null);
  const stageGroupsMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  // Studio Lighting & Grid References
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const shadowPlaneMatRef = useRef<THREE.ShadowMaterial | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const underFillRef = useRef<THREE.DirectionalLight | null>(null);

  // Shared GLTF Loader instance
  const gltfLoaderRef = useRef<GLTFLoader>(new GLTFLoader());

  // --------------------------------------------------------------------------
  // Initialize Three.js WebGL Scene
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene - Light Automotive Design Studio Canvas
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewportTheme === "light" ? 0xeef2f6 : 0x0a0c10);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.8, 2.6, 4.4);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing & tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = viewportTheme === "light" ? 1.15 : 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.0;
    controls.maxDistance = 20.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't dip far below floor
    controls.target.set(0, 0.65, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      viewportTheme === "light" ? 0.95 : 0.85
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Key Light
    const keyLight = new THREE.DirectionalLight(
      0xfff8ee,
      viewportTheme === "light" ? 2.2 : 2.4
    );
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Rim/Back Light
    const rimLight = new THREE.DirectionalLight(
      viewportTheme === "light" ? 0x94b8e8 : 0x70aaff,
      viewportTheme === "light" ? 1.3 : 1.8
    );
    rimLight.position.set(-6, 6, -6);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Warm Underbody Fill
    const underFill = new THREE.DirectionalLight(
      viewportTheme === "light" ? 0xe2e8f0 : 0xffeedd,
      viewportTheme === "light" ? 0.8 : 0.9
    );
    underFill.position.set(0, -4, 0);
    scene.add(underFill);
    underFillRef.current = underFill;

    // 6. Ground Studio Grid & Shadow Plane
    const isLight = viewportTheme === "light";
    const gridHelper = new THREE.GridHelper(
      16,
      32,
      isLight ? 0x64748b : 0x00f0ff,
      isLight ? 0xcbd5e1 : 0x1f293d
    );
    gridHelper.position.y = -0.01;
    if (isLight) {
      (gridHelper.material as THREE.Material).transparent = true;
      (gridHelper.material as THREE.Material).opacity = 0.6;
    }
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const shadowPlaneGeo = new THREE.PlaneGeometry(20, 20);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: isLight ? 0.22 : 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.012;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlaneMatRef.current = shadowPlaneMat;

    // 7. Root Assembly Group
    const rootAssembly = new THREE.Group();
    rootAssembly.name = "ModularVehicleRoot";
    scene.add(rootAssembly);
    rootAssemblyGroupRef.current = rootAssembly;

    if (typeof window !== "undefined") {
      (window as any).__viewportDebug = {
        scene,
        rootAssembly,
        camera,
        controls,
        stageGroupsMap: stageGroupsMapRef.current,
      };
    }

    // 8. Animation Render Loop
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotate;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Resize Observer
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
      stageGroupsMapRef.current.clear();
      rootAssembly.clear();
      scene.clear();
    };
  }, []);

  // --------------------------------------------------------------------------
  // Update Auto-Rotate in Controls
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  // --------------------------------------------------------------------------
  // Dynamic Studio Lighting & Background Theme Switcher
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (viewportTheme === "light") {
      scene.background = new THREE.Color(0xeef2f6);
      if (gridHelperRef.current) {
        scene.remove(gridHelperRef.current);
        gridHelperRef.current.geometry.dispose();
        if (Array.isArray(gridHelperRef.current.material)) {
          gridHelperRef.current.material.forEach((m) => m.dispose());
        } else {
          gridHelperRef.current.material.dispose();
        }
        const newGrid = new THREE.GridHelper(16, 32, 0x64748b, 0xcbd5e1);
        newGrid.position.y = -0.01;
        (newGrid.material as THREE.Material).transparent = true;
        (newGrid.material as THREE.Material).opacity = 0.6;
        scene.add(newGrid);
        gridHelperRef.current = newGrid;
      }
      if (shadowPlaneMatRef.current) {
        shadowPlaneMatRef.current.opacity = 0.22;
      }
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.95;
      if (keyLightRef.current) keyLightRef.current.intensity = 2.2;
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 1.3;
        rimLightRef.current.color.setHex(0x94b8e8);
      }
      if (underFillRef.current) {
        underFillRef.current.intensity = 0.8;
        underFillRef.current.color.setHex(0xe2e8f0);
      }
      if (rendererRef.current) {
        rendererRef.current.toneMappingExposure = 1.15;
      }
    } else {
      scene.background = new THREE.Color(0x0a0c10);
      if (gridHelperRef.current) {
        scene.remove(gridHelperRef.current);
        gridHelperRef.current.geometry.dispose();
        if (Array.isArray(gridHelperRef.current.material)) {
          gridHelperRef.current.material.forEach((m) => m.dispose());
        } else {
          gridHelperRef.current.material.dispose();
        }
        const newGrid = new THREE.GridHelper(14, 28, 0x00f0ff, 0x1f293d);
        newGrid.position.y = -0.01;
        scene.add(newGrid);
        gridHelperRef.current = newGrid;
      }
      if (shadowPlaneMatRef.current) {
        shadowPlaneMatRef.current.opacity = 0.45;
      }
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.85;
      if (keyLightRef.current) keyLightRef.current.intensity = 2.4;
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 1.8;
        rimLightRef.current.color.setHex(0x70aaff);
      }
      if (underFillRef.current) {
        underFillRef.current.intensity = 0.9;
        underFillRef.current.color.setHex(0xffeedd);
      }
      if (rendererRef.current) {
        rendererRef.current.toneMappingExposure = 1.25;
      }
    }
  }, [viewportTheme]);

  // --------------------------------------------------------------------------
  // Load / Update Subsystems in 3D Scene
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootAssemblyGroupRef.current;
    if (!root) return;

    // Determine stages to display based on currentStage and viewportMode:
    let stagesToDisplay: AssemblyStage[] = [];

    if (currentStage === "complete") {
      // In complete stage:
      // If user enabled exploded view (> 0.02), load modular subsystems for radial exploded inspection
      if (explodedProgress > 0.02) {
        const stagesSet = new Set<AssemblyStage>();
        installedStages.forEach((st) => stagesSet.add(st as AssemblyStage));
        stagesToDisplay = Array.from(stagesSet);
      } else {
        // Otherwise load unified Class-A assembled car GLB
        stagesToDisplay = ["complete"];
      }
    } else if (viewportMode === "subsystem_isolated") {
      if (currentStage !== "model_select") {
        stagesToDisplay = [currentStage];
      }
    } else {
      // Accumulated mode
      const stagesSet = new Set<AssemblyStage>();
      installedStages.forEach((st) => stagesSet.add(st as AssemblyStage));
      if (currentStage !== "model_select") {
        stagesSet.add(currentStage);
      }
      stagesToDisplay = Array.from(stagesSet);
    }

    setIsLoading(true);
    setLoadError(null);

    // Remove existing child groups that are no longer needed
    const currentMap = stageGroupsMapRef.current;
    const stagesSet = new Set(stagesToDisplay);

    for (const [stId, group] of currentMap.entries()) {
      if (!stagesSet.has(stId as AssemblyStage) || !groupMatchesModel(group, selectedModel)) {
        root.remove(group);
        currentMap.delete(stId);
      }
    }

    // Load missing stage groups
    const loader = gltfLoaderRef.current;
    const loadPromises = stagesToDisplay.map((stageId) => {
      // If already loaded for current model AND has child meshes, keep it
      const existing = currentMap.get(stageId);
      if (existing && groupMatchesModel(existing, selectedModel)) {
        if (existing.parent !== root) {
          root.add(existing);
        }
        if (existing.children.length > 0) {
          return Promise.resolve();
        }
        // Stale empty group: remove and reload
        root.remove(existing);
        currentMap.delete(stageId);
      }

      // If model changed or stage needs reloading, remove previous stage group first
      if (currentMap.has(stageId)) {
        const oldGroup = currentMap.get(stageId)!;
        root.remove(oldGroup);
        currentMap.delete(stageId);
      }

      const stageGroup = new THREE.Group();
      stageGroup.name = `StageGroup_${stageId}`;
      (stageGroup as any).modelCategory = selectedModel;
      root.add(stageGroup);
      currentMap.set(stageId, stageGroup);

      // If complete stage, load the dedicated complete vehicle GLB
      if (stageId === "complete") {
        const completeUrls = getStageGlbPaths("complete", selectedModel);
        return Promise.all(
          completeUrls.map(
            (url) =>
              new Promise<void>((resolve) => {
                loader.load(
                  url,
                  (gltf) => {
                    const modelScene = gltf.scene;
                    modelScene.traverse((child) => {
                      if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;

                        // Customize body metallic paint while preserving carbon, chrome, trim, and LEDs
                        if (mesh.material) {
                          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                          mats.forEach((m, idx) => {
                            const matName = m.name || "";
                            const isExcluded =
                              matName.includes("Skeleton") ||
                              matName.includes("Steel") ||
                              matName.includes("Glass") ||
                              matName.includes("Lens") ||
                              matName.includes("Light") ||
                              matName.includes("LED") ||
                              matName.includes("Chrome") ||
                              matName.includes("Trim") ||
                              matName.includes("Black") ||
                              matName.includes("Rubber") ||
                              matName.includes("Tire");

                            const isPaint =
                              matName.includes("Paint") ||
                              matName.includes("Fleet") ||
                              matName.includes("Body") ||
                              matName.includes("Outer") ||
                              matName.includes("SuperWhite") ||
                              matName.includes("OxideBronze") ||
                              matName.includes("Forest_Jade") ||
                              matName.includes("bodypaint") ||
                              matName.includes("Bentley") ||
                              matName.includes("StJames") ||
                              matName.includes("Monaco");

                            if (!isExcluded && isPaint) {
                              const cloned = (m as THREE.MeshStandardMaterial).clone();
                              cloned.color.set(bodyColorHex);
                              cloned.roughness = 0.15;
                              cloned.metalness = 0.85;
                              if (Array.isArray(mesh.material)) {
                                mesh.material[idx] = cloned;
                              } else {
                                mesh.material = cloned;
                              }
                            }
                          });
                        }

                        // Apply X-Ray if enabled
                        if (isXRay && mesh.material) {
                          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                          mats.forEach((m, idx) => {
                            const xmat = (m as THREE.MeshStandardMaterial).clone();
                            xmat.transparent = true;
                            xmat.opacity = 0.35;
                            xmat.wireframe = true;
                            if (Array.isArray(mesh.material)) {
                              mesh.material[idx] = xmat;
                            } else {
                              mesh.material = xmat;
                            }
                          });
                        }
                      }
                    });
                    stageGroup.add(modelScene);
                    if (stageGroup.parent !== root) {
                      root.add(stageGroup);
                    }
                    resolve();
                  },
                  undefined,
                  (err) => {
                    console.warn(`[ModularViewport] Failed loading complete car ${url}:`, err);
                    createFallbackProxyGeometry("complete_car", stageGroup);
                    if (stageGroup.parent !== root) {
                      root.add(stageGroup);
                    }
                    resolve();
                  }
                );
              })
          )
        );
      }

      // If Coupe (Bentley), SUV, Pickup, Hypercar (Divo), or Bus model, load dedicated CAD stage subassemblies
      const isCustomModel =
        selectedModel === "coupe" ||
        (selectedModel as string) === "bentley" ||
        (selectedModel as string) === "gt_coupe" ||
        (selectedModel as string) === "sports_coupe" ||
        (selectedModel as string) === "grand_tourer" ||
        selectedModel === "suv" ||
        selectedModel === "pickup_truck" ||
        (selectedModel as string) === "pickup" ||
        (selectedModel as string) === "truck" ||
        (selectedModel as string) === "hilux" ||
        selectedModel === "hypercar" ||
        (selectedModel as string) === "divo" ||
        (selectedModel as string) === "megawatt" ||
        selectedModel === "bus_shuttle" ||
        (selectedModel as string) === "bus" ||
        (selectedModel as string) === "transit_bus";

      if (isCustomModel) {
        const customUrls = getStageGlbPaths(stageId, selectedModel);
        return Promise.all(
          customUrls.map((url) => {
            const partGroup = new THREE.Group();
            partGroup.name = `${stageId}_${selectedModel}`;
            stageGroup.add(partGroup);

            return new Promise<void>((resolve) => {
              loader.load(
                url,
                (gltf) => {
                  const modelScene = gltf.scene;
                  modelScene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                      const mesh = child as THREE.Mesh;
                      mesh.castShadow = true;
                      mesh.receiveShadow = true;

                      // If exterior panel, customize body color (preserve structural framework steel)
                      const isSkeleton = mesh.name.startsWith("FRAMEWORK_") || mesh.name.startsWith("CHASSIS_");
                      if (stageId === "exterior_panels" && !isSkeleton && mesh.material) {
                        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        mats.forEach((m, idx) => {
                          const matName = m.name || "";
                          const isExcluded =
                            matName.includes("Skeleton") ||
                            matName.includes("Steel") ||
                            matName.includes("Glass") ||
                            matName.includes("Lens") ||
                            matName.includes("Light") ||
                            matName.includes("LED") ||
                            matName.includes("Chrome") ||
                            matName.includes("Trim") ||
                            matName.includes("Black") ||
                            matName.includes("Rubber") ||
                            matName.includes("Tire");

                          const isPaint =
                            matName.includes("Paint") ||
                            matName.includes("Fleet") ||
                            matName.includes("Coach") ||
                            matName.includes("Body") ||
                            matName.includes("Outer") ||
                            matName.includes("Crimson") ||
                            matName.includes("SuperWhite") ||
                            matName.includes("OxideBronze") ||
                            matName.includes("TitaniumGrey") ||
                            matName.includes("Divo") ||
                            matName.includes("Bentley") ||
                            matName.includes("StJames") ||
                            matName.includes("Monaco");

                          if (!isExcluded && isPaint) {
                            const cloned = (m as THREE.MeshStandardMaterial).clone();
                            cloned.color.set(bodyColorHex);
                            cloned.roughness = 0.15;
                            cloned.metalness = 0.85;
                            if (Array.isArray(mesh.material)) {
                              mesh.material[idx] = cloned;
                            } else {
                              mesh.material = cloned;
                            }
                          }
                        });
                      }

                      // Apply X-Ray if enabled
                      if (isXRay && mesh.material) {
                        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        mats.forEach((m, idx) => {
                          const xmat = (m as THREE.MeshStandardMaterial).clone();
                          xmat.transparent = true;
                          xmat.opacity = 0.35;
                          xmat.wireframe = true;
                          if (Array.isArray(mesh.material)) {
                            mesh.material[idx] = xmat;
                          } else {
                            mesh.material = xmat;
                          }
                        });
                      }
                    }
                  });
                  partGroup.add(modelScene);
                  resolve();
                },
                undefined,
                (err) => {
                  console.warn(`[ModularViewport] Failed loading ${selectedModel} stage ${url}:`, err);
                  createFallbackProxyGeometry(stageId, stageGroup);
                  resolve();
                }
              );
            });
          })
        );
      }

      // If stage is engine or gearbox, load the final complete GLB directly
      if (stageId === "engine" || stageId === "gearbox") {
        const glbUrls = getStageGlbPaths(stageId, selectedModel);
        return Promise.all(
          glbUrls.map((url) => {
            const partGroup = new THREE.Group();
            partGroup.name = `${stageId}_final_assembly`;
            stageGroup.add(partGroup);

            return new Promise<void>((resolve) => {
              loader.load(
                url,
                (gltf) => {
                  const modelScene = gltf.scene;
                  modelScene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                      const mesh = child as THREE.Mesh;
                      mesh.castShadow = true;
                      mesh.receiveShadow = true;
                      if (isXRay && mesh.material) {
                        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        mats.forEach((m, idx) => {
                          const xmat = (m as THREE.MeshStandardMaterial).clone();
                          xmat.transparent = true;
                          xmat.opacity = 0.35;
                          xmat.wireframe = true;
                          if (Array.isArray(mesh.material)) {
                            mesh.material[idx] = xmat;
                          } else {
                            mesh.material = xmat;
                          }
                        });
                      }
                    }
                  });
                  partGroup.add(modelScene);
                  if (stageGroup.parent !== root) {
                    root.add(stageGroup);
                  }
                  resolve();
                },
                undefined,
                (err) => {
                  console.warn(`[ModularViewport] Failed loading ${stageId} ${url}:`, err);
                  createFallbackProxyGeometry(stageId, stageGroup);
                  if (stageGroup.parent !== root) {
                    root.add(stageGroup);
                  }
                  resolve();
                }
              );
            });
          })
        );
      }

      const individualParts = getStageIndividualParts(stageId);
      if (individualParts.length > 0) {
        return Promise.all(
          individualParts.map((partItem) => {
            const url = `/models/modular_parts/individual/${partItem.glbFilename}`;
            const partGroup = new THREE.Group();
            partGroup.name = partItem.id;
            (partGroup as any).baseOffset = partItem.offset;
            partGroup.visible = !hiddenPartIds.includes(partItem.id);
            stageGroup.add(partGroup);

            return new Promise<void>((resolve) => {
              loader.load(
                url,
                (gltf) => {
                  const modelScene = gltf.scene;
                  modelScene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                      const mesh = child as THREE.Mesh;
                      mesh.castShadow = true;
                      mesh.receiveShadow = true;

                      // If exterior panel, customize body color
                      if (stageId === "exterior_panels" && mesh.material) {
                        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        mats.forEach((m, idx) => {
                          const matName = m.name || "";
                          const isExcluded =
                            matName.includes("Skeleton") ||
                            matName.includes("Steel") ||
                            matName.includes("Glass") ||
                            matName.includes("Lens") ||
                            matName.includes("Light") ||
                            matName.includes("LED") ||
                            matName.includes("Chrome") ||
                            matName.includes("Trim") ||
                            matName.includes("Black") ||
                            matName.includes("Rubber") ||
                            matName.includes("Tire");

                          const isPaint =
                            matName.includes("Paint") ||
                            matName.includes("Fleet") ||
                            matName.includes("Body") ||
                            matName.includes("Outer");

                          if (!isExcluded && isPaint) {
                            const cloned = (m as THREE.MeshStandardMaterial).clone();
                            cloned.color.set(bodyColorHex);
                            cloned.roughness = 0.15;
                            cloned.metalness = 0.85;
                            if (Array.isArray(mesh.material)) {
                              mesh.material[idx] = cloned;
                            } else {
                              mesh.material = cloned;
                            }
                          }
                        });
                      }

                      // Apply X-Ray if enabled
                      if (isXRay && mesh.material) {
                        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        mats.forEach((m, idx) => {
                          const xmat = (m as THREE.MeshStandardMaterial).clone();
                          xmat.transparent = true;
                          xmat.opacity = 0.35;
                          xmat.wireframe = true;
                          if (Array.isArray(mesh.material)) {
                            mesh.material[idx] = xmat;
                          } else {
                            mesh.material = xmat;
                          }
                        });
                      }
                    }
                  });
                  partGroup.add(modelScene);
                  resolve();
                },
                undefined,
                (err) => {
                  console.warn(`[ModularViewport] Failed loading ${url}:`, err);
                  createFallbackProxyGeometry(partItem.id, partGroup);
                  resolve();
                }
              );
            });
          })
        );
      }

      // Fallback: stage-level GLB paths
      const glbUrls = getStageGlbPaths(stageId, selectedModel);
      return Promise.all(
        glbUrls.map(
          (url) =>
            new Promise<void>((resolve) => {
              loader.load(
                url,
                (gltf) => {
                  const modelScene = gltf.scene;
                  modelScene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                      const mesh = child as THREE.Mesh;
                      mesh.castShadow = true;
                      mesh.receiveShadow = true;
                    }
                  });
                  stageGroup.add(modelScene);
                  resolve();
                },
                undefined,
                (err) => {
                  console.warn(`[ModularViewport] Failed loading fallback ${url}:`, err);
                  createFallbackProxyGeometry(stageId, stageGroup);
                  resolve();
                }
              );
            })
        )
      );
    });

    Promise.all(loadPromises)
      .then(() => {
        setIsLoading(false);
        updateExplodedTransforms();

        // Auto-center camera target to loaded model bounding box
        if (root && controlsRef.current) {
          const box = new THREE.Box3().setFromObject(root);
          if (!box.isEmpty()) {
            const center = new THREE.Vector3();
            box.getCenter(center);
            controlsRef.current.target.set(center.x, Math.max(0.4, center.y), center.z);
            controlsRef.current.update();
          }
        }
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to assemble modular components");
        setIsLoading(false);
      });
  }, [selectedModel, currentStage, installedStages, viewportMode, bodyColorHex, isXRay, explodedProgress, enginePosition]);

  // Helper to check if chassis group matches current model
  function groupMatchesModel(group: THREE.Group | undefined, model: string): boolean {
    if (!group) return false;
    return (group as any).modelCategory === model;
  }

  // --------------------------------------------------------------------------
  // Update Part Visibility when hiddenPartIds changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootAssemblyGroupRef.current;
    if (!root) return;
    root.traverse((child) => {
      if (child instanceof THREE.Group && (child as any).baseOffset) {
        child.visible = !hiddenPartIds.includes(child.name);
      }
    });
  }, [hiddenPartIds]);

  // --------------------------------------------------------------------------
  // Apply Exploded View Offsets & Engine Front/Mid/Rear Positioning
  // --------------------------------------------------------------------------
  const updateExplodedTransforms = useCallback(() => {
    const currentMap = stageGroupsMapRef.current;
    const m = String(selectedModel || "").toLowerCase();
    const isCoupe = m === "coupe" || m === "bentley" || m === "gt_coupe" || m === "grand_tourer" || m === "sports_coupe";
    const isPickup = m === "pickup_truck" || m === "pickup" || m === "truck" || m === "hilux";
    const isSuv = m === "suv";
    const isHypercar = m === "hypercar" || m === "divo" || m === "megawatt";
    const isBus = m === "bus_shuttle" || m === "bus" || m === "transit_bus";
    const isZeroOffsetCAD = isCoupe || isPickup || isSuv || isHypercar || isBus;

    for (const [stId, group] of currentMap.entries()) {
      const stageOffset = STAGE_EXPLODED_OFFSETS[stId] || [0, 0, 0];
      const factor = explodedProgress;

      let baseX = 0;
      let baseY = 0;
      let baseZ = 0;

      if (!isZeroOffsetCAD) {
        if (stId === "engine") {
          if (enginePosition === "mid") {
            baseX = 0; baseY = -0.30; baseZ = 0.15;
          } else if (enginePosition === "rear") {
            baseX = 0; baseY = -1.55; baseZ = 0.15;
          } else {
            // Front engine
            baseX = 0; baseY = 0.85; baseZ = 0.15;
          }
        } else if (stId === "gearbox") {
          if (enginePosition === "mid") {
            baseX = 0; baseY = -0.85; baseZ = 0.15;
          } else if (enginePosition === "rear") {
            baseX = 0; baseY = -1.05; baseZ = 0.15;
          } else {
            // Front engine -> gearbox behind front engine
            baseX = 0; baseY = 0.30; baseZ = 0.15;
          }
        }
      }

      group.position.set(
        baseX + stageOffset[0] * factor * 0.4,
        baseY + stageOffset[1] * factor * 0.4,
        baseZ + stageOffset[2] * factor * 0.4
      );

      // Displace individual parts radially
      group.children.forEach((child) => {
        const partOffset = (child as any).baseOffset;
        if (partOffset) {
          child.position.set(
            partOffset[0] * factor,
            partOffset[1] * factor,
            partOffset[2] * factor
          );
        }
      });
    }
  }, [explodedProgress, enginePosition, selectedModel]);

  useEffect(() => {
    updateExplodedTransforms();
  }, [explodedProgress, updateExplodedTransforms]);

  // --------------------------------------------------------------------------
  // Fallback Proxy Mesh Generator (Safety Net)
  // --------------------------------------------------------------------------
  function createFallbackProxyGeometry(stageId: string, parentGroup: THREE.Group) {
    const geo = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      roughness: 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.4, 0);
    parentGroup.add(mesh);
  }

  // --------------------------------------------------------------------------
  // Camera Presets
  // --------------------------------------------------------------------------
  const applyCameraPreset = (preset: "iso" | "front" | "side" | "rear" | "top") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    setActiveCamPreset(preset);

    const dist = viewportMode === "subsystem_isolated" ? 3.0 : 5.0;

    switch (preset) {
      case "iso":
        cam.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
        controls.target.set(0, 0.6, 0);
        break;
      case "front":
        cam.position.set(0, 0.7, dist);
        controls.target.set(0, 0.7, 0);
        break;
      case "side":
        cam.position.set(dist * 1.1, 0.7, 0);
        controls.target.set(0, 0.7, 0);
        break;
      case "rear":
        cam.position.set(0, 0.8, -dist);
        controls.target.set(0, 0.8, 0);
        break;
      case "top":
        cam.position.set(0.01, dist * 1.2, 0);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[460px] md:h-[500px] lg:h-[540px] rounded-2xl overflow-hidden shadow-2xl select-none transition-colors ${
        viewportTheme === "light"
          ? "bg-[#eef2f6] border border-slate-300"
          : "bg-slate-950 border border-slate-800"
      }`}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 pointer-events-none transition-colors ${
          viewportTheme === "light" ? "bg-[#eef2f6]/80 text-slate-800" : "bg-slate-950/75 text-cyan-400"
        }`}>
          <div className={`w-10 h-10 rounded-full border-2 animate-spin ${
            viewportTheme === "light" ? "border-slate-300 border-t-amber-500" : "border-cyan-500/20 border-t-cyan-400"
          }`} />
          <span className={`text-xs font-mono tracking-widest font-bold uppercase animate-pulse ${
            viewportTheme === "light" ? "text-slate-700" : "text-cyan-400"
          }`}>
            Assembling 3D Modular Nodes...
          </span>
        </div>
      )}

      {/* Error Banner */}
      {loadError && (
        <div className="absolute top-4 left-4 right-4 bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-mono p-2.5 rounded-xl z-30">
          ⚠️ {loadError}
        </div>
      )}

      {/* =====================================================================
          TOP CONTROLS BAR: Dual Mode Toggle & Camera Presets
          ===================================================================== */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-auto">
        {/* Left: Dual Viewport Mode Toggle (As shown in Wireframe 3) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              if (currentStage === "complete") {
                setExplodedProgress(explodedProgress > 0 ? 0 : 0.4);
              } else {
                setViewportMode("subsystem_isolated");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              (currentStage === "complete" ? explodedProgress > 0 : viewportMode === "subsystem_isolated")
                ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Box size={13} className="text-cyan-400" />
            <span>{currentStage === "complete" ? "EXPLODED PARTS VIEW" : "ISOLATED PART GLB"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentStage === "complete") {
                setExplodedProgress(0);
              }
              setViewportMode("accumulated");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              (currentStage === "complete" ? explodedProgress === 0 : viewportMode === "accumulated")
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Layers size={13} className="text-emerald-400" />
            <span>{currentStage === "complete" ? "COMPLETE ASSEMBLED CAR" : "ACCUMULATED CAR GLB"}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
              {installedStages.length} INSTALLED
            </span>
          </button>
        </div>

        {/* Right: Camera Angles & Visual Modes */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg font-mono text-[10px]">
          {(["iso", "front", "side", "rear", "top"] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyCameraPreset(preset)}
              className={`px-2 py-1 rounded-md font-bold uppercase transition-all cursor-pointer ${
                activeCamPreset === preset
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              {preset}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-700/60 mx-1" />

          {/* X-Ray Toggle */}
          <button
            type="button"
            onClick={() => setIsXRay(!isXRay)}
            title="Toggle X-Ray Wireframe"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isXRay
                ? "bg-purple-500/25 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            {isXRay ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title="Toggle 360 Auto-Rotate"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isAutoRotate
                ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <RotateCcw size={13} className={isAutoRotate ? "animate-spin" : ""} />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={() => applyCameraPreset("iso")}
            title="Reset Camera Target"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent"
          >
            <Maximize2 size={13} />
          </button>

          <div className="w-px h-4 bg-slate-700/60 mx-1" />

          {/* Light / Dark Studio Environment Toggle */}
          <button
            type="button"
            onClick={() => setViewportTheme(viewportTheme === "light" ? "dark" : "light")}
            title={viewportTheme === "light" ? "Switch to Dark Studio" : "Switch to Light Studio"}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewportTheme === "light"
                ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            {viewportTheme === "light" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM OVERLAY: Real-Time Exploded View Slider
          ===================================================================== */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl pointer-events-auto z-20">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs font-bold whitespace-nowrap">
            <MoveHorizontal size={14} className="text-amber-400" />
            <span>EXPLODED VIEW:</span>
            <span className="text-amber-400 min-w-[36px]">
              {Math.round(explodedProgress * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedProgress}
            onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setExplodedProgress(0.0)}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              explodedProgress === 0
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            0% (ASSEMBLED)
          </button>
          <button
            type="button"
            onClick={() => setExplodedProgress(0.5)}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              Math.abs(explodedProgress - 0.5) < 0.05
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => setExplodedProgress(1.0)}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              explodedProgress === 1
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            100% (FULL CAD EXPLODE)
          </button>
        </div>
      </div>
    </div>
  );
};
