// ============================================================================
// BODY ARCHITECTURE MATRIX — TYPE DEFINITIONS
// ============================================================================
// Defines the 24 Architecture IDs, 7 Eras, Design DNA, and Cell Contracts
// for the 168-cell Body-Only Architecture Library.
// ============================================================================

export type BodyArchitectureId =
  | "sedan"
  | "hatchback"
  | "coupe"
  | "convertible"
  | "roadster"
  | "sports_car"
  | "supercar"
  | "hypercar"
  | "grand_tourer"
  | "muscle_car"
  | "luxury_car"
  | "limousine"
  | "shooting_brake"
  | "wagon"
  | "crossover"
  | "suv"
  | "offroad_4x4"
  | "pickup"
  | "heavy_truck"
  | "van"
  | "mpv"
  | "bus"
  | "formula"
  | "gt3";

export type VehicleEraId =
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s"
  | "future";

export interface DesignDNA {
  proportions: string;
  silhouette: string;
  greenhouse: string;
  hoodCabin: string;
  surfacing: string;
  aeroPhilosophy: string;
  wheels: string;
  engineering: string;
}

export interface BodyArchitectureCell {
  architecture: BodyArchitectureId;
  era: VehicleEraId;
  referenceVehicle: string;
  inspirationOnly: true;
  glb: string; // /models/vehicles/{architecture}/{era}/vehicle.glb
  designDNA: DesignDNA;
  fallbackGlb: string; // legacy complete GLB fallback
}

export interface ArchitectureDefinition {
  id: BodyArchitectureId;
  label: string;
  group: "passenger" | "performance" | "utility" | "commercial" | "motorsport";
  tagline: string;
  description: string;
  fallbackGlb: string;
}

export interface EraDefinition {
  id: VehicleEraId;
  label: string;
  yearRange: string;
  badge: string;
  description: string;
}
