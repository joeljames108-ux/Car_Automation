---
name: skill-for-underbody-and-aero-undertray
description: Automotive ground-effect underbody and aerodynamic undertray engineering skill. Formulates Class-A CAD procedural modeling, 12k triangle budget, full-flat undertray, twin Venturi ground-effect tunnels, 10-12 deg rear diffuser expansion angle, vertical vortex-generator strakes (controlling tire squirt), front NACA brake cooling ducts, jacking point pads, active diffuser flap action, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Underbody & Aero Undertray: Ground-Effect Aerodynamics & 12k Triangle CAD Standard

This skill establishes the **quantitative aerodynamic engineering standard, Venturi effect fluid dynamics, diffuser expansion angle limits ($10^\circ – 12^\circ$), and procedural Blender CAD pipeline** for designing full-flat carbon underbody trays, ground-effect venturi tunnels, NACA cooling ducts, and rear aerodynamic diffusers. Every underbody generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **8,000 – 12,000 triangles** to the underbody subsystem) and guarantee zero see-through floor voids from any viewing angle while supporting active diffuser trim options.

---

## 1. Master Coordinate System & Underbody Spatial Limits

The underbody spans the entire bottom footprint of the vehicle:

| Underbody Zone | Longitudinal ($Y$) Range | Lateral ($X$) Range | Vertical ($Z$) Elevation |
|:---|:---|:---|:---|
| **Front Undertray & NACA Ducts** | $Y \in [+0.850\text{m}, +2.150\text{m}]$ | $X \in [-0.920\text{m}, +0.920\text{m}]$ | $Z = +0.105\text{m}$ (Flat reference plane) |
| **Center Venturi Flat Floor**    | $Y \in [-0.650\text{m}, +0.850\text{m}]$ | $X \in [-0.850\text{m}, +0.850\text{m}]$ | $Z = +0.110\text{m}$ (Underbody throat) |
| **Rear Diffuser Expansion Tunnel**| $Y \in [-2.280\text{m}, -0.650\text{m}]$ | $X \in [-0.960\text{m}, +0.960\text{m}]$ | $Z \in [+0.110\text{m}, +0.440\text{m}]$ (Upsweep) |

---

## 2. Quantitative Triangle & Mesh Budget (Underbody Subsystem)

Under the **15MB / 400,000+ Triangle Standard**, the underbody accounts for **~12,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Underbody Component Mesh                                  │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Full-Length Flat Floor & Chassis Belly Pan                │  4,000       │ 33.3%      │
│ Twin Venturi Ground-Effect Acceleration Tunnels           │  3,000       │ 25.0%      │
│ Multi-Chamber Rear Diffuser with 4 Vertical Vortex Strakes│  3,000       │ 25.0%      │
│ Front NACA Brake Cooling Ducts & Engine Sump Louvers      │  1,000       │  8.3%      │
│ Jacking Point Rubber Puck Pads & Fastener Mounting Array │  1,000       │  8.3%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (UNDERBODY & AERO UNDERTRAY SUBSYSTEM)              │ ~12,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Venturi Ground-Effect Aerodynamics & Fluid Flow

### A. Venturi Acceleration Throat & Floor Sealing
- Air entering beneath the front splitter is accelerated into a narrow underbody throat ($Z = 105\text{mm}$).
- By Bernoulli's principle:
  $$P_{\text{underbody}} = P_{\text{ambient}} - \frac{1}{2}\rho v^2$$
  Creating intense low-pressure suction pulling the chassis into the road without the drag penalty of top-mounted wings.
- **Side Skirt Edge Sealing:** Raised $12\text{mm}$ longitudinal outer fences along $X = \pm 0.850\text{m}$ to block high-pressure ambient air from spilling under the sides.

### B. Rear Diffuser Expansion Angle ($10^\circ – 12^\circ$)
- The rear diffuser gradually expands the air cross-sectional area to decelerate high-speed air back to ambient velocity.
- **Anti-Detachment Law:** Diffuser upsweep angle $\alpha_{\text{diffuser}}$ is strictly maintained between $10.5^\circ$ and $12.0^\circ$:
  $$\alpha > 14.0^\circ \implies \text{Boundary layer separation and catastrophic loss of downforce!}$$

### C. Vertical Vortex-Generator Strakes (Tire Squirt Management)
- 4 thin vertical aerodynamic fences ($t = 3.5\text{mm}$) dividing the diffuser into 3 independent expansion chambers.
- **Tire Squirt Shielding:** Outboard strakes shield the diffuser vacuum from turbulent, rotating air shed by the rear tires.
- Sharp bottom edges shed longitudinal helical vortices that energize the boundary layer and delay flow separation.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Underbody)

```python
def apply_underbody_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline to underbody components."""
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
        
    # Step 3: Catmull-Clark Subdivision
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (2.0mm strake edge fillets)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.002
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ underbody_carbon_composite│ (0.04, 0.04, 0.045)  │ 0.55      │ 0.05     │ 0.00      │ Impact-resistant matte carbon│
│ diffuser_gloss_carbon     │ (0.03, 0.03, 0.04)   │ 0.16      │ 0.15     │ 1.00      │ High-gloss aerodynamic finish│
│ naca_duct_satin_black     │ (0.06, 0.06, 0.07)   │ 0.45      │ 0.40     │ 0.00      │ Molded automotive polymer    │
│ jacking_point_polyurethane│ (0.08, 0.08, 0.08)   │ 0.85      │ 0.00     │ 0.00      │ High-durometer rubber pucks  │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every underbody GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Active Diffuser Throat Flap (`DIFFUSER_Active_Flap`)**:
  - Transverse hinge pin at $Y = -1.250\text{m}, Z = +0.120\text{m}$.
  - **`Action_Diffuser_Flap_Trim`**: Adjusts expansion angle between $0.0^\circ$ (standard downforce) and $+4.5^\circ$ (DRS stall mode to reduce straight-line drag) ($30\text{ fps}$, 20 frames, `BEZIER`).
  - Custom Property: `{"interactive": true, "option_id": "active_diffuser", "type": "slider", "min": 0.0, "max": 4.5, "action": "Action_Diffuser_Flap_Trim"}`.
- **Underbody Transparency X-Ray Toggle**:
  - Configurator option switching underbody material opacity from $1.0$ (solid floor) to $0.15$ (semi-transparent X-ray), enabling interactive inspection of the chassis, engine, and pushrod suspension.

### B. Raycast Collision Hitboxes
- `HITBOX_Diffuser_Rear`: Collision hull over center diffuser strakes for aero inspection.
- `HITBOX_Underbody_NACA`: Hit-target over front NACA cooling scoops.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports active diffuser actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
