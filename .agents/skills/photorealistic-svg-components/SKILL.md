---
name: photorealistic-svg-components
description: Design standard and architectural specification for creating photorealistic, interactive 3D Isometric SVG automotive components and subassemblies.
---

# Photorealistic SVG Automotive Components Design Standard

This skill defines the standard for engineering and rendering **photorealistic, scalable, and animatable SVG components** for the vehicle assembly system.

---

## 1. The 7-Layer SVG Material Pipeline

Every isometric or 2D automotive SVG component MUST be structured using the 7-Layer Rendering Pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: MICRO-DETAIL      (Machining marks, knurling, etc) │
│ Layer 6: AMBIENT OCCLUSION (Contact shadows, bore depth)    │
│ Layer 5: SPECULAR HOTSPOTS (High-contrast gloss reflection) │
│ Layer 4: DIRECTIONAL LIGHT (Consistent key/ambient lighting)│
│ Layer 3: TEXTURE OVERLAYS  (feTurbulence grain, carbon twill│
│ Layer 2: MATERIAL GRADIENT (5+ stop base color gradients)   │
│ Layer 1: BASE GEOMETRY     (Isometric projection polygons)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Global Lighting Architecture

All components across the entire engine and vehicle assembly MUST adhere to the standardized light source:

- **Key Light Direction**: Upper-Left at **Azimuth 225°**, **Elevation 45° to 55°** (`<feDistantLight azimuth="225" elevation="50" />`).
- **Facet Shading Hierarchy**:
  - **Top Faces (+Z)**: High specular reflection, lightest tones (`#ffffff` highlights, `fills.top`).
  - **Left Faces (-X / Front)**: Mid-tone directional lighting (`fills.left` / `fills.front`).
  - **Right Faces (+Y / Side)**: Ambient shadow tone, lowest lightness (`fills.right`).
  - **Under-Deck / Recesses**: Near-black ambient occlusion (`#000000` to `#090d16` at 0.6–0.9 opacity).

---

## 3. Material Presets & Texture Filters

When authoring a component, import and use [`isoMaterialPipeline.tsx`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/src/components/assembly/iso3d/isoMaterialPipeline.tsx):

```tsx
import { getPhotorealisticMaterial, SpecularHotspot, ContactShadow, MachiningMark } from "./isoMaterialPipeline";

const { fills, filter, preset } = getPhotorealisticMaterial(materialGrade, "forged_aluminum");
```

### Material Lookup Guide

| Material Grade / ID | Target Automotive Part | Filter ID | Texture Characteristics |
|---|---|---|---|
| `cast_iron` | Engine Blocks, Brake Rotors, Turbo Exhaust Volutes | `mat-cast-iron-filter` | Rough granular porosity (`feTurbulence 0.65`) + deep shadow multiplication |
| `cast_aluminum` | Cylinder Heads, Transmission Casings, Intake Runners | `mat-cast-alum-filter` | Matte silver grain (`feTurbulence 0.5`) + gentle specular sparkle |
| `forged_steel` | Crankshafts, Connecting Rods, Camshafts | `mat-brushed-metal-filter` | Directional mill-grain lines (`baseFrequency 0.04 0.95`) |
| `forged_aluminum` | Pistons, Suspension Control Arms, Wheel Hubs | `mat-brushed-metal-filter` | High-sheen silver-platinum brushed polish |
| `billet_cnc` | CNC Throttle Bodies, Custom Intake Manifolds | `mat-cnc-micro-filter` | Mirror-polished surface with cyan ambient reflection |
| `titanium_grade5` | Valves, Retainers, Connecting Rods, Exhaust Pipes | `mat-satin-titanium-filter` | Satin gunmetal with subtle platinum chamfers |
| `carbon_fibre` | Plenum Chambers, Strut Braces, Aero Splitters | `mat-carbon-weave-filter` | 2x2 Twill diagonal weave pattern (`#pat-carbon-twill`) + resin gloss |
| `rubber_elastomer` | Gaskets, Bushings, O-Rings, Couplers | `mat-rubber-pore-filter` | Ultra-matte dark charcoal with micro-pore texture |
| `copper` / `brass` | Head Gaskets, Small-End Bushings, Valve Guides | `mat-copper-filter` | Warm orange/amber metallic sheen with specular chamfers |
| `chrome_mirror` | Wrist Pins, Bearing Journals, Damper Shafts | `mat-mirror-specular-filter` | High-contrast multi-band chrome reflections |
| `inconel_heat` | Exhaust Headers, Turbo Manifolds, Downpipes | `mat-satin-titanium-filter` | Heat-patina rainbow gradient (`#mat-grad-inconel-top`) |

---

## 4. Component Implementation Checklist

When creating or upgrading a component:

1. **Polygon Geometry**: Compute 3D isometric points using `projectIso()` or `getIsoBoxFacets()` from `isoMath.ts`.
2. **Apply Gradients & Filters**:
   - `fill={fills.top}` / `fill={fills.left}` / `fill={fills.right}`
   - `filter={filter}` (applies appropriate `feTurbulence` / specular lighting)
3. **Contact Shadow**: Add `<ContactShadow cx={...} cy={...} rx={...} ry={...} />` at the mating plane between adjacent parts.
4. **Specular Hotspots**: Place `<SpecularHotspot cx={...} cy={...} rx={...} ry={...} />` on top surfaces and curved journals.
5. **Machining Details**: Add 2–4 `<MachiningMark x1={...} y1={...} x2={...} y2={...} />` lines along CNC-milled surfaces.
6. **Fasteners & Ports**: Use 12-point ARP bolt heads (`#arp-bolt-head-12pt`) or socket recesses (`#hex-socket-recess`).
7. **Interactive States**: Support `onMouseEnter`, `onMouseLeave`, `isActive`, and `isHovered` with smooth CSS transitions (`duration-700 ease-out`).

---

## 5. Reference Code Template

```tsx
import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, getIsoBoxFacets } from "./isoMath";
import {
  getPhotorealisticMaterial,
  SpecularHotspot,
  ContactShadow,
  MachiningMark,
} from "./isoMaterialPipeline";

interface CustomComponentIsoProps {
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

export const CustomComponentIso: React.FC<CustomComponentIsoProps> = ({
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 220 };
  const materialGrade = selectedVariants?.custom_part || "forged";
  const { fills, filter } = getPhotorealisticMaterial(materialGrade, "forged_aluminum");

  const facets = getIsoBoxFacets({ x: -50, y: -25, z: 0 }, 100, 50, 40, originScreen);

  return (
    <g
      id="iso-custom-component"
      onMouseEnter={() => onHoverComponent?.("custom_part" as any)}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* Layer 6: Contact Shadow */}
      <ContactShadow cx={originScreen.x} cy={originScreen.y + 20} rx={45} ry={15} opacity={0.6} />

      {/* Layer 1-3: Base Geometry + Multi-Stop Gradient + Texture Filter */}
      <path d={facets.right} fill={fills.right} filter={filter} stroke="#090d16" strokeWidth="2" />
      <path d={facets.left} fill={fills.left} filter={filter} stroke="#090d16" strokeWidth="2" />
      <path d={facets.top} fill={fills.top} filter={filter} stroke="#090d16" strokeWidth="2.5" />

      {/* Layer 5: Specular Chamfer Edge & Hotspot */}
      <path d={facets.top} fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.9" />
      <SpecularHotspot cx={originScreen.x - 5} cy={originScreen.y - 5} rx={18} ry={7} intensity={0.8} />

      {/* Layer 7: Micro-Detail Machining Marks */}
      <MachiningMark x1={facets.points.p1.x + 5} y1={facets.points.p1.y + 2} x2={facets.points.p3.x - 5} y2={facets.points.p3.y + 2} />
    </g>
  );
};
```
