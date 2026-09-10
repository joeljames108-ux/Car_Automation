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
} from "lucide-react";
import {
  useModularVehicleBuilderStore,
  getStageGlbPaths,
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

  const setViewportMode = useModularVehicleBuilderStore((s) => s.setViewportMode);
  const setExplodedProgress = useModularVehicleBuilderStore((s) => s.setExplodedProgress);
  const setIsXRay = useModularVehicleBuilderStore((s) => s.setIsXRay);
  const setIsAutoRotate = useModularVehicleBuilderStore((s) => s.setIsAutoRotate);

  // Local Viewport States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<string>("iso");

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rootAssemblyGroupRef = useRef<THREE.Group | null>(null);
  const stageGroupsMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  // Shared GLTF Loader instance
  const gltfLoaderRef = useRef<GLTFLoader>(new GLTFLoader());

  // --------------------------------------------------------------------------
  // Initialize Three.js WebGL Scene
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // Dark automotive studio slate
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
    renderer.toneMappingExposure = 1.25;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    // Rim/Back Light (Cool blue tint)
    const rimLight = new THREE.DirectionalLight(0x70aaff, 1.8);
    rimLight.position.set(-6, 6, -6);
    scene.add(rimLight);

    // Warm Underbody Fill
    const underFill = new THREE.DirectionalLight(0xffeedd, 0.9);
    underFill.position.set(0, -4, 0);
    scene.add(underFill);

    // 6. Ground Studio Grid & Shadow Plane
    const gridHelper = new THREE.GridHelper(14, 28, 0x00f0ff, 0x1f293d);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const shadowPlaneGeo = new THREE.PlaneGeometry(16, 16);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.012;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 7. Root Assembly Group
    const rootAssembly = new THREE.Group();
    rootAssembly.name = "ModularVehicleRoot";
    scene.add(rootAssembly);
    rootAssemblyGroupRef.current = rootAssembly;

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
  // Load / Update Subsystems in 3D Scene
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootAssemblyGroupRef.current;
    if (!root) return;

    setIsLoading(true);
    setLoadError(null);

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

    // Remove existing child groups that are no longer needed
    const currentMap = stageGroupsMapRef.current;
    const stagesSet = new Set(stagesToDisplay);

    for (const [stId, group] of currentMap.entries()) {
      if (!stagesSet.has(stId as AssemblyStage)) {
        root.remove(group);
        currentMap.delete(stId);
      }
    }

    // Load missing stage groups
    const loader = gltfLoaderRef.current;
    const loadPromises = stagesToDisplay.map((stageId) => {
      // If already loaded and model category didn't change chassis, keep it
      if (currentMap.has(stageId) && (stageId !== "chassis" || groupMatchesModel(currentMap.get(stageId), selectedModel))) {
        return Promise.resolve();
      }

      // If chassis changed model category, remove previous chassis group first
      if (stageId === "chassis" && currentMap.has("chassis")) {
        const oldGroup = currentMap.get("chassis")!;
        root.remove(oldGroup);
        currentMap.delete("chassis");
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
                            if (matName.includes("Paint") || matName.includes("Body") || matName.includes("Outer")) {
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
                    resolve();
                  },
                  undefined,
                  (err) => {
                    console.warn(`[ModularViewport] Failed loading complete car ${url}:`, err);
                    createFallbackProxyGeometry("complete_car", stageGroup);
                    resolve();
                  }
                );
              })
          )
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
                          if (matName.includes("Paint") || matName.includes("Body") || matName === "" || matName.includes("Outer")) {
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
  }, [selectedModel, currentStage, installedStages, viewportMode, bodyColorHex, isXRay, explodedProgress]);

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
  // Apply Exploded View Offsets
  // --------------------------------------------------------------------------
  const updateExplodedTransforms = useCallback(() => {
    const currentMap = stageGroupsMapRef.current;
    for (const [stId, group] of currentMap.entries()) {
      const stageOffset = STAGE_EXPLODED_OFFSETS[stId] || [0, 0, 0];
      const factor = explodedProgress;

      group.position.set(
        stageOffset[0] * factor * 0.4,
        stageOffset[1] * factor * 0.4,
        stageOffset[2] * factor * 0.4
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
  }, [explodedProgress]);

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
      className="relative w-full h-[460px] md:h-[500px] lg:h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none"
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase animate-pulse">
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
