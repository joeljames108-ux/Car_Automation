// =============================================================================
// EXTERIOR 3D - GLB CAR MODEL LOADER WITH EXPANDED PBR MATERIAL SYSTEM
// =============================================================================
// 12 PBR material types with clearcoat, sheen, transmission, emissive:
// paint, glass, caliper, carbon, chrome, rubber, headlight, taillight,
// brushed_aluminum, interior_leather, exhaust_tip, led_indicator
// =============================================================================
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type PaintFinishType = "gloss" | "metallic" | "matte" | "satin" | "chameleon";

interface GlbCarModelProps {
  modelPath?: string;
  paintColorHex?: number;
  caliperColorHex?: string;
  paintFinish?: PaintFinishType;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

const DEFAULT_MODEL = "/models/exterior/sports_car_bmw_i8.glb";

function createPaintMaterial(color: number, finish: PaintFinishType): THREE.MeshPhysicalMaterial {
  const pc = new THREE.Color(color);
  const base: THREE.MeshPhysicalMaterialParameters = { color: pc, side: THREE.DoubleSide, envMapIntensity: 1.8 };
  switch (finish) {
    case "gloss":
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.92, roughness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.005, reflectivity: 1.0, specularIntensity: 1.0, specularColor: new THREE.Color(0xffffff), sheen: 0.4, sheenColor: pc.clone().multiplyScalar(0.6), sheenRoughness: 0.15 });
    case "metallic":
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.88, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.01, reflectivity: 1.0, specularIntensity: 0.9, sheen: 0.3, sheenColor: pc.clone().multiplyScalar(0.7), sheenRoughness: 0.2 });
    case "matte":
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.4, roughness: 0.65, clearcoat: 0.15, clearcoatRoughness: 0.3, reflectivity: 0.4, envMapIntensity: 0.8 });
    case "satin":
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.7, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.1, reflectivity: 0.7, sheen: 0.15, sheenColor: pc.clone().multiplyScalar(0.8), sheenRoughness: 0.3 });
    case "chameleon":
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.85, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.01, reflectivity: 1.0, sheen: 0.6, sheenColor: new THREE.Color().setHSL(0.55, 0.8, 0.5), sheenRoughness: 0.1, iridescence: 1.0, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 600] });
    default:
      return new THREE.MeshPhysicalMaterial({ ...base, metalness: 0.88, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.01 });
  }
}

export const GlbCarModel: React.FC<GlbCarModelProps> = ({ modelPath = DEFAULT_MODEL, paintColorHex = 0x0044cc, caliperColorHex = "#dc2626", paintFinish = "metallic", autoRotate = false, autoRotateSpeed = 0.3 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  useFrame((_, delta) => { if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * autoRotateSpeed; });
  useEffect(() => {
    if (!clonedScene) return;
    // === EXPANDED PBR MATERIALS ===
    const paintMaterial = createPaintMaterial(paintColorHex, paintFinish);

    // Glass with transmission
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#c8ddf0"), metalness: 0.0, roughness: 0.01, transmission: 0.92, transparent: true, opacity: 0.45, ior: 1.52, thickness: 0.005, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1.0, clearcoatRoughness: 0.01, envMapIntensity: 2.5 });

    // Tinted window glass
    const tintedGlass = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#1a2540"), metalness: 0.0, roughness: 0.01, transmission: 0.7, transparent: true, opacity: 0.55, ior: 1.52, thickness: 0.008, depthWrite: false, side: THREE.DoubleSide, clearcoat: 0.8, envMapIntensity: 1.8 });

    // Brake caliper
    const caliperMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(caliperColorHex), metalness: 0.85, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.6 });

    // Carbon fiber
    const carbonMat = new THREE.MeshPhysicalMaterial({ color: 0x111622, metalness: 0.40, roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.04, reflectivity: 0.9, envMapIntensity: 1.6, side: THREE.DoubleSide });

    // Headlight emissive
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xfbbf24, emissiveIntensity: 3.0, roughness: 0.05, metalness: 0.1 });

    // DRL strip emissive
    const drlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, roughness: 0.1, metalness: 0.0 });

    // Taillight OLED
    const oledRed = new THREE.MeshStandardMaterial({ color: 0xff1122, emissive: 0xff0022, emissiveIntensity: 3.0, roughness: 0.1, metalness: 0.1 });

    // Chrome / polished metal
    const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 1.0, roughness: 0.04, clearcoat: 0.9, clearcoatRoughness: 0.005, envMapIntensity: 2.8 });

    // Brushed aluminum
    const brushedAluminum = new THREE.MeshPhysicalMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.05, envMapIntensity: 1.4 });

    // Rubber / tire
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.0, roughness: 0.88 });

    // Exhaust tip (hot metal)
    const exhaustMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.1, envMapIntensity: 1.5 });

    // LED indicator amber
    const indicatorMat = new THREE.MeshStandardMaterial({ color: 0xff9900, emissive: 0xff8800, emissiveIntensity: 2.0, roughness: 0.1, metalness: 0.05 });

    // Brake disc (dark steel)
    const brakeDiscMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4, clearcoat: 0.2, envMapIntensity: 0.8 });

    // Apply materials by mesh name
    clonedScene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const n = mesh.name.toLowerCase();
      // === MESH NAME DETECTION ===
      const isPaint = n.includes("body") || n.includes("paint") || n.includes("door") || n.includes("hood") || n.includes("fender") || n.includes("roof") || n.includes("bumper") || n.includes("quarter") || n.includes("fascia") || n.includes("skirt") || n.includes("panel") || n.includes("skin") || n.includes("arch") || n.includes("cover") || n.includes("shell") || n.includes("cowl") || n.includes("deck") || n.includes("spine") || n.includes("aileron") || n.includes("spoiler") || n.includes("wing") || n.includes("lip") || n.includes("canard");

      const isGlass = n.includes("glass") || n.includes("windshield") || n.includes("windscreen") || n.includes("backlite") || n.includes("canopy");
      const isTintedGlass = n.includes("window") || n.includes("side_glass") || n.includes("rear_window");
      const isCaliper = n.includes("caliper") || n.includes("calliper") || n.includes("brake_pad");
      const isBrakeDisc = n.includes("rotor") || n.includes("disc") || n.includes("brake_rotor");
      const isCarbon = n.includes("carbon") || n.includes("monocoque") || n.includes("weave") || n.includes("tub") || n.includes("strake") || n.includes("diffuser") || n.includes("splitter");
      const isTailLight = n.includes("taillight") || n.includes("lightbar") || (n.includes("light") && n.includes("rear"));
      const isHeadLight = n.includes("headlight") || (n.includes("light") && n.includes("front"));
      const isDrl = n.includes("drl") || n.includes("daytime") || n.includes("led_strip");
      const isIndicator = n.includes("indicator") || n.includes("turn_signal") || n.includes("turn_signal");
      const isChrome = n.includes("chrome") || n.includes("grille") || n.includes("trim") || n.includes("logo") || n.includes("badge") || n.includes("emblem") || n.includes("ornament");
      const isExhaust = n.includes("exhaust") || n.includes("tip") || n.includes("muffler") || n.includes("tailpipe");
      const isRubber = n.includes("tire") || n.includes("tyre") || n.includes("rubber") || n.includes("wiper") || n.includes("seal") || n.includes("gasket");
      const isAluminum = n.includes("aluminum") || n.includes("aluminium") || n.includes("sill") || n.includes("rocker") || n.includes("rail");

      // === MATERIAL ASSIGNMENT (priority order) ===
      if (isCaliper) mesh.material = caliperMat;
      else if (isBrakeDisc) mesh.material = brakeDiscMat;
      else if (isTailLight) mesh.material = oledRed;
      else if (isDrl) mesh.material = drlMat;
      else if (isHeadLight) mesh.material = headlightMat;
      else if (isIndicator) mesh.material = indicatorMat;
      else if (isGlass) mesh.material = glassMaterial;
      else if (isTintedGlass) mesh.material = tintedGlass;
      else if (isCarbon) mesh.material = carbonMat;
      else if (isChrome) mesh.material = chromeMat;
      else if (isExhaust) mesh.material = exhaustMat;
      else if (isAluminum) mesh.material = brushedAluminum;
      else if (isRubber) mesh.material = rubberMat;
      else if (isPaint) { if (mesh.material instanceof THREE.MeshStandardMaterial && mesh.material.map) paintMaterial.map = mesh.material.map; mesh.material = paintMaterial; }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    // Recompute normals for smooth shading
    clonedScene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) { try { mesh.geometry.computeVertexNormals(); } catch { /* */ } }
      }
    });
  }, [clonedScene, paintColorHex, caliperColorHex, paintFinish]);

  return (<group ref={groupRef} name="GLB_Car_Model"><primitive object={clonedScene} /></group>);
};

useGLTF.preload("/models/exterior/sports_car_bmw_i8.glb");

