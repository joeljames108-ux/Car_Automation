---
name: skill-for-lighting-optics
description: Automotive multi-element lighting optics engineering skill. Formulates multi-part internal projector lenses, 20k triangle CAD budget, 5-modifier geometry amplification pipeline, extruded 3D DRL light-pipes, sequential OLED taillamp ribbons, dielectric polycarbonate lens transmission, HDR emissive strength shaders, interactive lighting animation states, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Lighting Optics: Automotive Optical Engineering & 20k Triangle Standard

This skill establishes the **quantitative engineering standard, optical physics formulas, multi-layer refractive geometry, and procedural Blender CAD pipeline** for designing luxury and sports automotive headlamp assemblies, OLED taillamp lightbars, and daytime running lights (DRL). Every lighting set generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **16,000 – 25,000 triangles** to the lighting subsystem) and provide fully interactive illumination states, sequential indicator animations, and raycast hitboxes.

---

## 1. Master Coordinate System & Hardpoint Placement

Lighting assemblies mount directly to the front and rear fascia clip hardpoints:

| Optical Unit | Longitudinal ($Y$) | Lateral ($X$) | Vertical ($Z$) | Snapping Hardpoint |
|:---|:---|:---|:---|:---|
| **Headlamp Assembly Left**  | $+2.080\text{m}$ | $-0.760\text{m}$ | $+0.580\text{m}$ | `SOCK_LIGHT_HEADLAMP_L` |
| **Headlamp Assembly Right** | $+2.080\text{m}$ | $+0.760\text{m}$ | $+0.580\text{m}$ | `SOCK_LIGHT_HEADLAMP_R` |
| **OLED Tail Lightbar Left** | $-2.240\text{m}$ | $-0.680\text{m}$ | $+0.740\text{m}$ | `SOCK_LIGHT_TAILLAMP_L` |
| **OLED Tail Lightbar Right**| $-2.240\text{m}$ | $+0.680\text{m}$ | $+0.740\text{m}$ | `SOCK_LIGHT_TAILLAMP_R` |

---

## 2. Quantitative Triangle & Mesh Budget (Lighting Subsystem)

Under the **15MB / 400,000+ Triangle Standard**, lighting accounts for **~20,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Lighting Component Mesh                                   │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Dual Quartz Projector Lenses & Internal Heat Sinks (×2)   │  6,000       │ 30.0%      │
│ Extruded 3D DRL Acrylic Light-Pipe Brow & Diodes (×2)     │  4,000       │ 20.0%      │
│ Fluted Amber Turn Signal Reflectors & Internal Bezels     │  3,000       │ 15.0%      │
│ Full-Width Continuous 3D OLED Tail Lightbar Ribbon        │  4,000       │ 20.0%      │
│ Outer Double-Curved Polycarbonate Optical Lenses (×4)     │  3,000       │ 15.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (LIGHTING SUBSYSTEM)                                │ ~20,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

> [!CAUTION]
> **NO FLAT EMISSIVE BLOCKS**:
> Generating headlights as flat rectangular polygons with a single solid glowing material is strictly prohibited. An automotive headlamp is a precision optical instrument comprising a matte dark internal housing bucket, stepped parabolic chrome reflectors, thick quartz glass hemispherical projector spheres, micro-extruded DRL prism pipes, and an outer dielectric polycarbonate cover!

---

## 3. Optical Multi-Layer Geometry Standards

### A. Dual Quartz Projector Core
- **Low Beam & High Beam:** Hemispherical plano-convex quartz glass lens ($\varnothing 75\text{mm}$, focal length $45\text{mm}$) with micro-fresnel concentric ridges on the inner planar face.
- **Projector Shutter & Solenoid:** Cutoff shield producing the sharp European ECE / US DOT asymmetric low-beam cutoff pattern ($15^\circ$ kick-up on shoulder side).
- **Dielectric Glass:** `transmission = 0.96`, `roughness = 0.01`, `ior = 1.52`.

### B. Extruded 3D DRL Light-Pipe
- **Curved Continuous Light Conduit:** $12\text{mm}$ cross-section parabolic light guide following the fender shutline crest ($L \approx 480\text{mm}$).
- **Internal Laser-Etched Micro-Prisms:** Distributes internal light evenly across the guide surface without hotspot clustering.
- **HDR Emission:** Emissive strength $= 22.0\text{ W/m}^2$, pure daylight white ($6,500\text{K}$, sRGB `(1.0, 1.0, 1.0)`).

### C. 3D Full-Width OLED Tail Lightbar
- **Aesthetic Light Ribbon:** Continuous thin blade ($14\text{mm}$ height) spanning the rear tail fascia ($X \in [-0.780\text{m}, +0.780\text{m}]$).
- **Multi-Level OLED Segments:** 64 individual micro-OLED planar emitters arranged in an aerodynamic swept 3D array.
- **Dual-Intensity Brake Logic:** Rest illumination ($8.0\text{ W/m}^2$, deep ruby red `(1.0, 0.02, 0.02)`) intensifies to $35.0\text{ W/m}^2$ upon brake engagement.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Lighting)

```python
def apply_lighting_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline for optical components."""
    # Step 1: Vertex Welding
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Smooth Shading
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(35))
    else:
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(35)
        
    # Step 3: Catmull-Clark Subdivision Surface
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (2.0mm optical bezel fillets)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.002
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(32.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Prevents optical distortion across curved lenses)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Optical Material Matrix

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Next Optical Properties  │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ lens_polycarbonate_outer  │ (0.92, 0.95, 0.98)   │ 0.01      │ 0.00     │ 1.00      │ Transmission 0.94, IOR 1.58  │
│ projector_quartz_glass    │ (0.98, 0.99, 1.00)   │ 0.005     │ 0.00     │ 1.00      │ Transmission 0.98, IOR 1.52  │
│ led_drl_white_hdr         │ (1.00, 1.00, 1.00)   │ 0.15      │ 0.00     │ 0.00      │ Emissive strength 22.0       │
│ oled_tail_red_hdr         │ (1.00, 0.02, 0.02)   │ 0.15      │ 0.00     │ 0.00      │ Emissive strength 18.0 / 35.0│
│ indicator_amber_diode     │ (1.00, 0.45, 0.02)   │ 0.20      │ 0.00     │ 0.00      │ Emissive strength 16.0       │
│ lamp_housing_satin_black  │ (0.04, 0.04, 0.045)  │ 0.50      │ 0.10     │ 0.00      │ Dark heat-resistant cavity   │
│ lamp_reflector_chrome     │ (0.94, 0.95, 0.96)   │ 0.04      │ 1.00     │ 0.00      │ Specular mirror reflection   │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Lighting States & Animation Actions

Every lighting GLB must be generated with baked NLA animation actions controlling emissive light states:

### A. Baked NLA Animation Actions
- **`Action_Light_DRL_Ignite`**: Fades DRL light-pipes from 0 to full daylight brightness ($22.0\text{ W/m}^2$) upon vehicle unlock ($30\text{ fps}$, 15 frames, smooth ramp).
- **`Action_Light_LowBeam_Ignite`**: Projector lenses ignite with characteristic HID/LED blue flash ($12,000\text{K}$) before settling to $6,000\text{K}$ operating beam.
- **`Action_Light_HighBeam_Toggle`**: Solenoid shutter drops to unleash full long-range illumination ($45.0\text{ W/m}^2$).
- **`Action_Light_Indicator_Sequence_L/R`**: Dynamic sequential fluid sweep from inside out across the 16 amber LED indicator segments ($30\text{ fps}$, 18 frames, cyclic).
- **`Action_Light_Brake_Intensify`**: Instantaneous step transition of tail lightbar from rest illumination ($18.0$) to full emergency brake intensity ($35.0\text{ W/m}^2$).

### B. Custom Properties Schema
```json
{
  "interactive": true,
  "component_id": "lighting_master",
  "option_id": "headlight_mode",
  "label": "Headlight State",
  "type": "stepped",
  "steps": ["OFF", "DRL_AUTO", "LOW_BEAM", "HIGH_BEAM"],
  "actions": ["Action_Light_DRL_Ignite", "Action_Light_LowBeam_Ignite", "Action_Light_HighBeam_Toggle"]
}
```

### C. Raycast Collision Hitboxes
- `HITBOX_Headlight_L` / `HITBOX_Headlight_R`: Outer lens collision hulls.
- `HITBOX_Taillight_L` / `HITBOX_Taillight_R`: Rear lightbar collision hulls.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports lighting state animation clips
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # Preserves component hierarchy
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
