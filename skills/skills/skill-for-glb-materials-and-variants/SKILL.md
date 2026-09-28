---
name: skill-for-glb-materials-and-variants
description: Automotive PBR material matrix and multi-variant glTF extension standard. Formulates the implementation of KHR_materials_variants for real-time WebGL car configurators, embedding multiple exterior paint options (metallic, matte, pearlescent), interior leather trims (Cognac, Nero, Bordeaux), and carbon fiber packages into a single 15MB GLB without duplicating geometry, complete with Blender baking and Three.js runtime switching.
---

# Skill for glTF Materials & Variants: `KHR_materials_variants` Automotive Standard

This skill establishes the **quantitative technical specification, Blender procedural authoring pipeline, and Three.js WebGL runtime switching architecture** for `KHR_materials_variants`. It enables a single 15MB / 400,000+ triangle automotive asset to encapsulate all paint, leather, and trim options with zero geometry duplication and instant, 0ms latency switching in real-time 3D configurators.

---

## 1. Architectural Principles of `KHR_materials_variants`

### The Duplication Anti-Pattern (STRICTLY PROHIBITED)
Exporting separate 15MB GLB files for each vehicle color (e.g. `Car_Red.glb`, `Car_Blue.glb`, `Car_Black.glb`) forces the web client to download 15MB repeatedly upon every color click, resulting in network bottlenecks, memory thrashing, and blank loading screens.

### The Multi-Variant Solution
With `KHR_materials_variants`:
1. **Single Geometry Buffer:** The 450,000 polygons exist **only once** in the binary `.bin` buffer.
2. **Material Index Remapping:** Each primitive references multiple material indices mapped to named variant strings.
3. **Instant Runtime Switching:** The Three.js renderer swaps material references on the GPU in a single frame (<16ms) without re-parsing geometry.

---

## 2. Standard Automotive Variant Matrix

Every vehicle or modular interior suite must encode standard variant mappings across three primary categories:

```text
┌───────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Variant Slot              │ Registered Variant Options                                             │
├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ **EXTERIOR_PAINT**        │ "Paint_Rosso_Corsa", "Paint_Blu_Elettrico", "Paint_Giallo_Modena",     │
│                           │ "Paint_Nero_Daytona_Metallic", "Paint_Bianco_Avus", "Paint_Verde_Mantis"│
├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ **INTERIOR_LEATHER**      │ "Interior_Cognac_Luxury", "Interior_Nero_Alcantara",                   │
│                           │ "Interior_Bordeaux_Sport", "Interior_Saddle_Tan"                       │
├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ **AERODYNAMIC_TRIM**      │ "Trim_Gloss_Twill_Carbon", "Trim_Forged_Composites", "Trim_Satin_Black"│
├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ **BRAKE_CALIPERS**        │ "Caliper_Brembo_Rosso", "Caliper_Giallo_Fly", "Caliper_Acid_Green"     │
└───────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Blender Procedural Authoring Pipeline

In Blender, `KHR_materials_variants` is authored by creating multiple material slots on the target mesh and assigning variant associations via custom properties or the official glTF exporter extension:

```python
def assign_material_variant(mesh_obj, variant_name, material):
    """Assigns an alternate material variant to a mesh object."""
    # Ensure material exists in object slots
    slot_idx = None
    for idx, slot in enumerate(mesh_obj.material_slots):
        if slot.material == material:
            slot_idx = idx
            break
            
    if slot_idx is None:
        mesh_obj.data.materials.append(material)
        slot_idx = len(mesh_obj.data.materials) - 1
        
    # Register in glTF variants dictionary
    if "gltf_materials_variants" not in mesh_obj:
        mesh_obj["gltf_materials_variants"] = []
        
    variants_list = list(mesh_obj.get("gltf_materials_variants", []))
    variants_list.append({
        "variant": variant_name,
        "material_index": slot_idx
    })
    mesh_obj["gltf_materials_variants"] = variants_list
```

---

## 4. PBR Shader Physics Matrix

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Variant Key               │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Properties               │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ Paint_Rosso_Corsa         │ (0.85, 0.03, 0.04)   │ 0.08      │ 0.92     │ 1.00      │ Clearcoat rough 0.04         │
│ Paint_Blu_Elettrico       │ (0.02, 0.18, 0.72)   │ 0.10      │ 0.94     │ 1.00      │ Deep pearlescent blue        │
│ Paint_Giallo_Modena       │ (0.95, 0.78, 0.02)   │ 0.12      │ 0.88     │ 1.00      │ High-saturation racing yellow│
│ Paint_Nero_Daytona        │ (0.02, 0.02, 0.02)   │ 0.08      │ 0.96     │ 1.00      │ Diamond-flake metallic black │
│ Interior_Cognac_Luxury    │ (0.48, 0.23, 0.08)   │ 0.44      │ 0.00     │ 0.00      │ Sheen 0.70, warm aniline dye │
│ Interior_Nero_Alcantara   │ (0.05, 0.05, 0.055)  │ 0.88      │ 0.00     │ 0.00      │ Sheen 0.65, soft micro-fiber │
│ Interior_Bordeaux_Sport   │ (0.35, 0.04, 0.08)   │ 0.42      │ 0.00     │ 0.00      │ Sheen 0.60, deep crimson dye │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 5. Three.js Client Runtime Integration

In the frontend WebGL configurator, load and switch variants using the standard Three.js pattern:

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class VehicleVariantManager {
  private parser: any;
  private variantsExtension: any;
  private scene: THREE.Group;

  constructor(gltf: any) {
    this.scene = gltf.scene;
    this.parser = gltf.parser;
    this.variantsExtension = gltf.userData.gltfExtensions?.['KHR_materials_variants'];
  }

  public getAvailableVariants(): string[] {
    if (!this.variantsExtension) return [];
    return this.variantsExtension.variants.map((v: any) => v.name);
  }

  public selectVariant(variantName: string): void {
    if (!this.variantsExtension) return;
    
    const variantIndex = this.variantsExtension.variants.findIndex(
      (v: any) => v.name === variantName
    );
    if (variantIndex === -1) return;

    this.scene.traverse(async (object: any) => {
      if (!object.isMesh || !object.userData.gltfExtensions?.['KHR_materials_variants']) {
        return;
      }

      const meshVariants = object.userData.gltfExtensions['KHR_materials_variants'].mappings;
      const mapping = meshVariants.find((m: any) => m.variants.includes(variantIndex));

      if (mapping) {
        object.material = await this.parser.getDependency('material', mapping.material);
      }
    });
  }
}
```

---

## 6. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_morph=True,
    export_apply=False,
    export_yup=True,
    export_materials='EXPORT',
    # Enable glTF 2.0 Material Variants extension
    export_material_variants=True
)
```
