// ===================================================================
// EXTERIOR 3D GLTF / GLB VEHICLE ASSEMBLY TYPE DEFINITIONS
// ===================================================================
// Master 3D scene graph, instance transforms, physical materials,
// paint zones, and attachment hardpoint coordinate definitions.
// ===================================================================

import type { MaterialGrade } from "../sim/assemblyTypes";
import type { ExteriorComponentId } from "../sim/exteriorAssemblyTypes";
import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
  LightingConfig,
  GlassConfig,
  ExteriorWheelConfig,
  ExteriorTireConfig,
  ExteriorBrakeVisualConfig,
} from "../sim/types/exterior";

export type ExteriorComponent3DType = ExteriorComponentId;

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Euler3D {
  x: number;
  y: number;
  z: number;
  order?: string;
}

export interface Transform3D {
  position: Vector3D;
  rotation: Euler3D;
  scale: Vector3D;
}

export type PaintZone3D =
  | "BODY_PAINTED"
  | "CONTRAST_ROOF"
  | "UNPAINTED_CARBON"
  | "GLASS_TRANSMISSIVE"
  | "LIGHTING_EMISSIVE"
  | "CHROME_POLISHED"
  | "RUBBER_MATTE"
  | "WHEEL_FINISH"
  | "BRAKE_CALIPER";

export interface ExteriorVariant3D {
  id: MaterialGrade;
  materialGrade: MaterialGrade;
  color: number; // Hex integer representation
  finish: string;
  label: string;
}

export interface ExteriorManifestRef {
  componentType: ExteriorComponent3DType;
  assetPath: string;
  defaultTransform: Transform3D;
  explodedVector: Vector3D;
  massKg: number;
  paintZone: PaintZone3D;
  submeshNames?: {
    primaryBody?: string[];
    carbonAccent?: string[];
    glassTransmissive?: string[];
    lightingEmissive?: string[];
    chromeTrim?: string[];
    fasteners?: string[];
  };
}

export interface ExteriorComponentInstance3D {
  instanceId: string;
  type: ExteriorComponent3DType;
  manifestRef: ExteriorManifestRef;
  transform: Transform3D;
  variant: ExteriorVariant3D;
  visible: boolean;
  opacity: number;
  selected: boolean;
  highlighted: boolean;
  paintZone: PaintZone3D;
  materialOverride?: string;
}

export interface Exterior3DSceneConfig {
  showWireframe: boolean;
  showPaintZones: boolean;
  showPanelGaps: boolean;
  showAeroFlow: boolean;
  explodedAmount: number; // 0.0 to 1.0
  cameraPreset: "front_three_quarter" | "rear_three_quarter" | "profile_left" | "top_down" | "underbody";
  autoRotate: boolean;
  environmentHdri: "studio_neutral" | "outdoor_sunset" | "race_pit_garage" | "cyberpunk_neon";
}
