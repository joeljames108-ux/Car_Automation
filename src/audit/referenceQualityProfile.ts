// ============================================================================
// PHASE 02 — REFERENCE ASSET FORENSICS — BENCHMARK QUALITY PROFILES & TYPES
// ============================================================================
// Defines typed schemas and quality profiles extracted from the 3 reference
// packages (Volvo P1800 Restomod, BYD Atto 3, Rocket Bunny Nissan Silvia S15).
// ============================================================================

export type ReferenceAssetId =
  | 'volvo_p1800_restomod_widebody'
  | 'byd_atto_3_2024'
  | 'nissan_silvia_s15_rocket_bunny';

export interface TextureMapForensicEntry {
  fileName: string;
  fileSizeBytes: number;
  channelType:
    | 'diffuse_albedo'
    | 'normal_tangent'
    | 'roughness_metallic'
    | 'ambient_occlusion'
    | 'alpha_transparency'
    | 'emissive_glow'
    | 'composite_material';
  componentTarget:
    | 'body_shell'
    | 'engine_bay'
    | 'interior_cabin'
    | 'wheels_rims'
    | 'tires'
    | 'brake_rotors_calipers'
    | 'lighting_optics'
    | 'badges_trim'
    | 'carbon_fiber';
  resolutionEstimate: string;
  hasAlphaChannel: boolean;
  colorSpace: 'sRGB' | 'Linear';
}

export interface ReferencePackageAuditReport {
  assetId: ReferenceAssetId;
  displayName: string;
  sourceFormat: 'FBX' | 'GLTF' | 'GLB' | 'OBJ';
  packageSizeBytes: number;
  totalTextureCount: number;
  textures: TextureMapForensicEntry[];
  componentSeparationHierarchy: string[];
  geometricPlausibilityScore: number; // 0-100
  pbrTextureCompletenessScore: number; // 0-100
  keyArchitecturalTakeaways: string[];
}

export interface AutomotiveReferenceQualityProfile {
  profileVersion: string;
  generatedTimestamp: string;
  heroDetailStandard: {
    minimumTextureResolution: number;
    mandatoryChannels: string[];
    maxPanelGapToleranceMm: number;
    requiredSeparateComponents: string[];
  };
  functionalDetailStandard: {
    minimumTextureResolution: number;
    mandatoryChannels: string[];
    requiredSeparateComponents: string[];
  };
  pbrShaderStandards: {
    paintLayers: string[];
    glassTransmissionMin: number;
    carbonFiberWeaveRepeat: number;
    tireRoughnessMin: number;
    brakeRotorMachiningNormalRequired: boolean;
  };
  auditedPackages: ReferencePackageAuditReport[];
}
