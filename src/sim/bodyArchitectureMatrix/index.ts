// ============================================================================
// BODY ARCHITECTURE MATRIX — API & UTILITIES
// ============================================================================
// Central interface for querying the 24 Architectures × 7 Eras (168 Cells) matrix,
// resolving CAD body GLB asset URLs (with fallback support), and inspecting Design DNA.
// ============================================================================

import {
  BodyArchitectureId,
  VehicleEraId,
  DesignDNA,
  BodyArchitectureCell,
  ArchitectureDefinition,
  EraDefinition,
} from "./types";
import {
  ARCHITECTURES,
  ERAS,
  BODY_ARCHITECTURE_MATRIX,
} from "./matrix";

// Export all types and core datasets
export * from "./types";
export { ARCHITECTURES, ERAS, BODY_ARCHITECTURE_MATRIX };

/**
 * Registry of generated / on-disk available body GLBs.
 * Can be populated statically or updated dynamically at runtime.
 */
export const AVAILABLE_BODY_GLBS = new Set<string>(
  ARCHITECTURES.flatMap((arch) => ERAS.map((era) => `${arch.id}/${era.id}`))
);

/**
 * Register that a body GLB exists on disk
 */
export function registerAvailableBodyGlb(arch: BodyArchitectureId, era: VehicleEraId): void {
  AVAILABLE_BODY_GLBS.add(`${arch}/${era}`);
}

/**
 * Check if a body GLB has been generated and exists on disk
 */
export function isBodyGlbAvailable(arch: BodyArchitectureId | string, era: VehicleEraId | string): boolean {
  return AVAILABLE_BODY_GLBS.has(`${arch}/${era}`);
}

/**
 * Get all architectures defined in the matrix
 */
export function listArchitectures(): ArchitectureDefinition[] {
  return ARCHITECTURES;
}

/**
 * Get all eras defined in the matrix
 */
export function listEras(): EraDefinition[] {
  return ERAS;
}

/**
 * Retrieve a specific matrix cell by architecture and era
 */
export function getCell(
  arch: BodyArchitectureId | string,
  era: VehicleEraId | string
): BodyArchitectureCell | null {
  const normArch = arch as BodyArchitectureId;
  const normEra = era as VehicleEraId;
  const row = BODY_ARCHITECTURE_MATRIX[normArch];
  if (!row) return null;
  return row[normEra] ?? null;
}

/**
 * Retrieve all 7 era cells for a given architecture
 */
export function getErasForArchitecture(
  arch: BodyArchitectureId | string
): BodyArchitectureCell[] {
  const normArch = arch as BodyArchitectureId;
  const row = BODY_ARCHITECTURE_MATRIX[normArch];
  if (!row) return [];
  return ERAS.map((era) => row[era.id]).filter(Boolean);
}

/**
 * Resolve the GLB URL for a body architecture cell.
 * If the generated body GLB exists on disk (or is registered), returns its path.
 * Otherwise returns the legacy complete-car fallback GLB.
 */
export function getBodyGlbUrl(
  arch: BodyArchitectureId | string,
  era: VehicleEraId | string = "2020s"
): string {
  const cell = getCell(arch, era);
  if (!cell) {
    return "/models/Car_Sedan_Complete.glb";
  }

  // If body GLB is generated and confirmed available, use it
  if (isBodyGlbAvailable(cell.architecture, cell.era)) {
    return cell.glb;
  }

  // Fallback to legacy complete-car model
  return cell.fallbackGlb || "/models/Car_Sedan_Complete.glb";
}

/**
 * Convenience helper to get the architecture definition by ID
 */
export function getArchitectureDef(
  arch: BodyArchitectureId | string
): ArchitectureDefinition | undefined {
  return ARCHITECTURES.find((a) => a.id === arch);
}

/**
 * Convenience helper to get the era definition by ID
 */
export function getEraDef(era: VehicleEraId | string): EraDefinition | undefined {
  return ERAS.find((e) => e.id === era);
}
