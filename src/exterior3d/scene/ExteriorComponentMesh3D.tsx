// ===================================================================
// EXTERIOR COMPONENT 3D MESH RENDERER (REACT THREE FIBER)
// ===================================================================
// Renders authored GLB assets from EXTERIOR_3D_MANIFEST / HOOD_GLB_ASSET_CONFIGS
// with real-time PBR paint-zone material swaps, parametric scaling, exploded
// view offsets, hover glow, and click-to-select. Falls back to procedural
// generator geometry when no GLB asset exists for the component.
// ===================================================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ExteriorComponentInstance3D } from "../types";
import { useExterior3DStore } from "../store/useExterior3DStore";
import { resolveExteriorMaterialForZone } from "../materials/automotivePaintResolver";
import { solveExteriorTransformForComponent } from "../physics/exteriorParametricSolver";
import { VehicleGlbAssetLoader } from "../assets/vehicleGlbAssetLoader";
import { GLBMaterialClassifier } from "../loaders/glbMaterialClassifier";
import {
  resolveHoodGlbAsset,
  type ResolvedHoodGlbAsset,
} from "../assets/hoodGlbAssetRegistry";

import { generateChassisFrame3DGeometry } from "../generators/chassisFrameGenerator";
import { generateSubframe3DGeometry } from "../generators/subframeGenerator";
import { generateHoodPanel3DGeometry } from "../generators/hoodPanelGenerator";
import { generateFenders3DGeometry } from "../generators/fenderGenerator";
import { generateDoors3DGeometry } from "../generators/doorPanelGenerator";
import { generateRoofPanel3DGeometry } from "../generators/roofPanelGenerator";
import { generateTrunkLid3DGeometry } from "../generators/trunkLidGenerator";
import { generateFrontSplitter3DGeometry } from "../generators/frontSplitterGenerator";
import { generateRearDiffuser3DGeometry } from "../generators/rearDiffuserGenerator";
import { generateRearWing3DGeometry } from "../generators/rearWingGenerator";
import { generateSideSkirts3DGeometry } from "../generators/sideSkirtGenerator";
import { generateHeadlights3DGeometry } from "../generators/headlightGenerator";
import { generateTaillights3DGeometry } from "../generators/taillightGenerator";
import { generateFogLights3DGeometry } from "../generators/fogLightGenerator";
import { generateWindshield3DGeometry } from "../generators/windshieldGenerator";
import { generateSideGlass3DGeometry } from "../generators/sideGlassGenerator";
import { generateRearWindow3DGeometry } from "../generators/rearWindowGenerator";
import { generateMirrors3DGeometry } from "../generators/mirrorGenerator";
import { generateWheel3DGeometry } from "../generators/wheelGenerator";
import { generateTire3DGeometry } from "../generators/tireGenerator";
import { generateBrakes3DGeometry } from "../generators/brakeCaliperGenerator";
import { generateFrontSuspension3DGeometry } from "../generators/frontSuspensionGenerator";
import { generateRearSuspension3DGeometry } from "../generators/rearSuspensionGenerator";
import { generateRearBumper3DGeometry } from "../generators/rearBumperGenerator";
import { generateExhaustTips3DGeometry } from "../generators/exhaustTipsGenerator";

// GLB assets confirmed present under public/models — these render as the
// authored binary assets instead of procedural stand-ins.
const AVAILABLE_EXTERIOR_GLB_ASSETS = new Set<string>([
  "/models/chassis/sports_car_chassis_01.glb",
  "/models/chassis/hatchback_chassis_01.glb",
  "/models/chassis/supercar_monocoque_chassis_01.glb",
  "/models/chassis/gt3_race_chassis_01.glb",
  "/models/chassis/ev_skateboard_chassis_01.glb",
  "/models/chassis/offroad_ladder_chassis_01.glb",
  "/models/exterior/sports_car_bmw_i8.glb",
  "/models/exterior/hatchback_ford_escort.glb",
  "/models/exterior/hypercar_apex_gt3.glb",
  "/models/exterior/sports_coupe_gt.glb",
  "/models/exterior/doors_butterfly_pair.glb",
  "/models/exterior/aerodynamic_widebody_kit.glb",
  "/models/exterior/full_modular_car_assembly.glb",
  "/models/exterior/front_subframe.glb",
  "/models/exterior/rear_subframe.glb",
  "/models/exterior/floor_pan.glb",
  "/models/exterior/firewall_bulkhead.glb",
  "/models/exterior/a_pillar.glb",
  "/models/exterior/b_pillar.glb",
  "/models/exterior/c_pillar.glb",
  "/models/exterior/rocker_panels.glb",
  "/models/exterior/crash_boxes.glb",
  "/models/exterior/roll_cage.glb",
  "/models/exterior/suspension_front.glb",
  "/models/exterior/suspension_rear.glb",
  "/models/exterior/brakes.glb",
  "/models/exterior/wheels.glb",
  "/models/exterior/hood.glb",
  "/models/exterior/hood_panel.glb",
  "/models/exterior/front_fenders.glb",
  "/models/exterior/doors.glb",
  "/models/exterior/rear_quarters.glb",
  "/models/exterior/trunk_decklid.glb",
  "/models/exterior/roof_panel.glb",
  "/models/exterior/front_bumper.glb",
  "/models/exterior/rear_bumper.glb",
  "/models/exterior/front_splitter.glb",
  "/models/exterior/rear_diffuser.glb",
  "/models/exterior/side_skirts.glb",
  "/models/exterior/rear_wing.glb",
  "/models/exterior/canards.glb",
  "/models/exterior/vents.glb",
  "/models/exterior/windshield.glb",
  "/models/exterior/side_glass.glb",
  "/models/exterior/rear_window.glb",
  "/models/exterior/headlights.glb",
  "/models/exterior/taillights.glb",
  "/models/exterior/fog_lights.glb",
  "/models/exterior/mirrors.glb",
  "/models/exterior/grille.glb",
  "/models/exterior/exhaust_tips.glb",
  "/models/exterior/door_handles.glb",
  "/models/exterior/wipers.glb",
  "/models/exterior/badges.glb",
  "/models/exterior/rear_car_assembly.glb",
]);

interface HighlightBase {
  emissive: THREE.Color;
  emissiveIntensity: number;
}

interface ExteriorComponentMesh3DProps {
  instance: ExteriorComponentInstance3D;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

const HOVER_GLOW_COLOR = 0x0284c7;
const SELECT_GLOW_COLOR = 0x38bdf8;

/** Zone a classified GLB material maps to for paint-config-driven swaps. */
function zoneForClassification(
  type: ReturnType<typeof GLBMaterialClassifier.classify>["type"]
): "BODY_PAINTED" | "GLASS_TRANSMISSIVE" | "RUBBER_MATTE" | "CHROME_POLISHED" | "LIGHTING_EMISSIVE" | null {
  switch (type) {
    case "paint":
      return "BODY_PAINTED";
    case "glass":
      return "GLASS_TRANSMISSIVE";
    case "rubber":
      return "RUBBER_MATTE";
    case "chrome":
      return "CHROME_POLISHED";
    case "emissive":
      return "LIGHTING_EMISSIVE";
    default:
      return null;
  }
}

function applyConfiguredPaintToMaterial(
  material: THREE.Material | null,
  paintConfig: ReturnType<typeof useExterior3DStore.getState>["paintConfig"]
): void {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;
  const mappedZone = zoneForClassification(GLBMaterialClassifier.classify(material).type);
  if (!mappedZone || material.map) return;
  const configured = resolveExteriorMaterialForZone(mappedZone, paintConfig) as
    | THREE.MeshStandardMaterial
    | undefined;
  if (configured) {
    material.color.copy(configured.color);
    material.metalness = configured.metalness;
    material.roughness = configured.roughness;
  }
}

export const ExteriorComponentMesh3D: React.FC<ExteriorComponentMesh3DProps> = ({
  instance,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const meshRef = useRef<THREE.Group>(null);

  const paintConfig = useExterior3DStore((s) => s.paintConfig);
  const exteriorConfig = useExterior3DStore((s) => s.exteriorConfig);
  const aeroConfig = useExterior3DStore((s) => s.aeroConfig);
  const sceneConfig = useExterior3DStore((s) => s.sceneConfig);
  const hoveredInstanceId = useExterior3DStore((s) => s.hoveredInstanceId);
  const selectedInstanceId = useExterior3DStore((s) => s.selectedInstanceId);
  const hoodGlbPresetId = useExterior3DStore((s) => s.hoodGlbPresetId);
  const hoodGlbOpen = useExterior3DStore((s) => s.hoodGlbOpen);

  const isHovered = hoveredInstanceId === instance.type;
  const isSelected = selectedInstanceId === instance.type;

  // Procedurally generate 3D group geometry based on component type
  // (also serves as the sizing reference footprint for fitted GLB assets)
  const geometryGroup = useMemo(() => {
    switch (instance.type) {
      case "chassis_frame":
        return generateChassisFrame3DGeometry(exteriorConfig);
      case "front_subframe":
        return generateSubframe3DGeometry("front");
      case "rear_subframe":
        return generateSubframe3DGeometry("rear");
      case "hood_panel":
        return generateHoodPanel3DGeometry(exteriorConfig);
      case "front_fenders":
        return generateFenders3DGeometry();
      case "doors_assembly":
        return generateDoors3DGeometry();
      case "roof_panel":
        return generateRoofPanel3DGeometry();
      case "trunk_decklid":
        return generateTrunkLid3DGeometry();
      case "front_splitter_tray":
        return generateFrontSplitter3DGeometry(aeroConfig);
      case "rear_diffuser_tunnel":
        return generateRearDiffuser3DGeometry(aeroConfig);
      case "rear_wing_spoiler":
        return generateRearWing3DGeometry(aeroConfig);
      case "side_skirts_aero":
        return generateSideSkirts3DGeometry();
      case "headlights_matrix":
        return generateHeadlights3DGeometry();
      case "taillights_oled":
        return generateTaillights3DGeometry();
      case "fog_drl_lights":
        return generateFogLights3DGeometry();
      case "windshield_glass":
        return generateWindshield3DGeometry();
      case "side_door_glass":
        return generateSideGlass3DGeometry();
      case "rear_window_backlite":
        return generateRearWindow3DGeometry();
      case "side_mirrors":
        return generateMirrors3DGeometry();
      case "wheels_tires_assembly": {
        const wheelGrp = new THREE.Group();
        wheelGrp.add(generateWheel3DGeometry());
        wheelGrp.add(generateTire3DGeometry());
        return wheelGrp;
      }
      case "brake_rotors_calipers":
        return generateBrakes3DGeometry();
      case "suspension_front_assembly":
        return generateFrontSuspension3DGeometry();
      case "suspension_rear_assembly":
        return generateRearSuspension3DGeometry();
      case "rear_bumper_fascia":
        return generateRearBumper3DGeometry();
      case "exhaust_tips_surround":
        return generateExhaustTips3DGeometry();
      default: {
        // Generic box placeholder for trim pieces
        const generic = new THREE.Group();
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.1, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x0284c7 })
        );
        generic.add(box);
        return generic;
      }
    }
  }, [instance.type, exteriorConfig, aeroConfig]);

  // Resolve the configured GLB asset path for this component instance
  const hoodAsset: ResolvedHoodGlbAsset | null =
    instance.type === "hood_panel"
      ? resolveHoodGlbAsset(hoodGlbPresetId, hoodGlbOpen)
      : null;

  const glbAssetPath = useMemo(() => {
    if (instance.type === "hood_panel") return hoodAsset ? hoodAsset.assetPath : null;
    const declared = instance.manifestRef.assetPath;
    return declared && AVAILABLE_EXTERIOR_GLB_ASSETS.has(declared) ? declared : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance.type, instance.manifestRef.assetPath, hoodAsset?.assetPath]);

  // Authored GLB scene state (null → procedural fallback renders instead)
  const [loadedGlbScene, setLoadedGlbScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    setLoadedGlbScene(null);
    if (!glbAssetPath) return;

    let cancelled = false;

    VehicleGlbAssetLoader.getInstance()
      .loadModel(glbAssetPath)
      .then((result) => {
        if (cancelled || !result.scene || result.scene.children.length === 0) return;

        const prepared = result.scene;
        prepared.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          // Per-instance material clones so config/highlight mutations stay local
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mesh.material = mats.map((m) => {
            if (!m) return m;
            const clone = m.clone();
            applyConfiguredPaintToMaterial(clone, paintConfig);
            return clone;
          });
        });

        setLoadedGlbScene(prepared);
      })
      .catch(() => {
        // Asset missing/unloadable — keep the procedural generator geometry
        if (!cancelled) setLoadedGlbScene(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glbAssetPath]);

  /**
   * Fits the loaded GLB into the procedural reference footprint so manifest
   * transforms / exploded vectors remain correct regardless of asset units.
   */
  const fittedGlbScene = useMemo(() => {
    if (!loadedGlbScene) return null;

    const refBox = new THREE.Box3().setFromObject(geometryGroup);
    const refSize = new THREE.Vector3();
    const refCenter = new THREE.Vector3();
    refBox.getSize(refSize);
    refBox.getCenter(refCenter);
    const refMaxDim = Math.max(refSize.x, refSize.y, refSize.z);

    const wrapper = new THREE.Group();
    wrapper.name = `Glb_${instance.type}`;
    wrapper.add(loadedGlbScene);

    const box = new THREE.Box3().setFromObject(wrapper);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0 && refMaxDim > 0) {
      const s = refMaxDim / maxDim;
      wrapper.scale.setScalar(s);
      wrapper.position.set(
        refCenter.x - center.x * s,
        refCenter.y - center.y * s,
        refCenter.z - center.z * s
      );
    }

    return wrapper;
  }, [loadedGlbScene, geometryGroup, instance.type]);

  // Unified interactive scene: clones materials per instance and records base
  // emissive state so hover/select glow can restore authored values exactly
  const interactiveScene = useMemo(() => {
    const root = fittedGlbScene ?? geometryGroup;
    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = mats.map((m) => {
        if (!m) return m;
        const clone = m.clone();
        if (clone instanceof THREE.MeshStandardMaterial) {
          (clone.userData as Record<string, unknown>).__highlightBase = {
            emissive: clone.emissive.clone(),
            emissiveIntensity: clone.emissiveIntensity,
          } satisfies HighlightBase;
        }
        return clone;
      });
    });
    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fittedGlbScene, geometryGroup]);

  // Re-apply paint configuration live without reloading the GLB.
  // Only authored GLB assets need this — procedural generators read the
  // paint/aero configs directly during generation.
  useEffect(() => {
    if (!loadedGlbScene || !interactiveScene) return;
    interactiveScene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;
        applyConfiguredPaintToMaterial(m, paintConfig);
      });
    });
  }, [loadedGlbScene, interactiveScene, paintConfig]);

  // Real-time animation loop: exploded view, parametric morphing, and
  // interactive hover/selection highlight pulses
  const clockRef = useRef(new THREE.Clock());

  useFrame(() => {
    if (!meshRef.current) return;

    // Parametric transform calculation
    const solved = solveExteriorTransformForComponent(
      instance.type,
      exteriorConfig,
      aeroConfig,
      instance.manifestRef.defaultTransform
    );

    // Exploded view offset
    const expl = sceneConfig.explodedAmount;
    const explVec = instance.manifestRef.explodedVector;

    meshRef.current.position.set(
      solved.position.x + explVec.x * expl,
      solved.position.y + explVec.y * expl,
      solved.position.z + explVec.z * expl
    );

    meshRef.current.rotation.set(solved.rotation.x, solved.rotation.y, solved.rotation.z);

    meshRef.current.scale.set(solved.scale.x, solved.scale.y, solved.scale.z);

    // Interactive highlight: pulsing emissive glow on hover / selection
    const active = isHovered || isSelected;
    const t = clockRef.current.getElapsedTime();
    const pulse = 0.5 + 0.5 * Math.sin(t * 4.5);
    const glow = isSelected ? 0.32 + 0.18 * pulse : 0.22 + 0.14 * pulse;
    const glowColorHex = isSelected ? SELECT_GLOW_COLOR : HOVER_GLOW_COLOR;

    meshRef.current.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;
        const base = (m.userData as Record<string, unknown>).__highlightBase as
          | HighlightBase
          | undefined;
        if (!base) return;
        if (active) {
          m.emissive.copy(base.emissive).lerp(new THREE.Color(glowColorHex), 0.85);
          m.emissiveIntensity = Math.max(base.emissiveIntensity, glow);
        } else {
          const needsRestore =
            m.emissiveIntensity !== base.emissiveIntensity ||
            !m.emissive.equals(base.emissive);
          if (needsRestore) {
            m.emissive.copy(base.emissive);
            m.emissiveIntensity = base.emissiveIntensity;
          }
        }
        m.needsUpdate = true;
      });
    });
  });

  return (
    <group
      ref={meshRef}
      name={`Component_${instance.type}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (onPointerOver) onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (onPointerOut) onPointerOut();
      }}
    >
      <primitive object={interactiveScene} />
    </group>
  );
};
