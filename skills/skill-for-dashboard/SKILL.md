---
name: skill-for-dashboard
description: Automotive dashboard and center console engineering skill. Formulates driver-oriented cockpit sweep, 75k-95k triangle CAD budget, 5-modifier geometry amplification pipeline, anti-glare hooded OLED binnacle, floating ultra-wide infotainment display, continuous climate ribbon vents, center bridge console with floating storage tray, electronic monostable gear selector, Start/Stop aircraft safety gate, MMI knurled dial, split butterfly padded leather armrest, concealed ambient LED lightpipes, PBR shaders, baked NLA actions, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Dashboard & Center Console: Cockpit Architecture & 95k Triangle Standard

This skill establishes the **quantitative architectural standards, ergonomic sightlines, multi-tier surfacing formulas, and procedural Blender CAD pipeline** for designing luxury and sports automotive dashboards, digital displays, and center bridge consoles. Every dashboard generated must strictly comply with the **650,000+ Triangle Vehicle Standard** (allocating **75,000 – 95,000 triangles** to the dashboard and center console assembly) and provide fully interactive butterfly armrests, sliding tambour doors, gear shifters, start flip gates, and raycast hitboxes.

---

## 1. Master Coordinate System & Spatial Envelope

The dashboard and center console assembly forms the primary cockpit architecture spanning the full width of the cabin:

| Cockpit Zone | Lateral Extents ($X$) | Longitudinal Extents ($Y$) | Vertical Extents ($Z$) |
|:---|:---|:---|:---|
| **Full Dashboard Deck** | $X \in [-0.750\text{m}, +0.750\text{m}]$ | $Y \in [0.460\text{m}, 0.850\text{m}]$ | $Z \in [0.480\text{m}, 0.820\text{m}]$ |
| **Driver Binnacle Cowl** | $X \in [-0.560\text{m}, -0.200\text{m}]$ | $Y \in [0.460\text{m}, 0.680\text{m}]$ | $Z \in [0.650\text{m}, 0.820\text{m}]$ |
| **Floating Infotainment Display** | $X \in [-0.065\text{m}, +0.265\text{m}]$ | $Y \in [0.430\text{m}, 0.460\text{m}]$ | $Z \in [0.610\text{m}, 0.790\text{m}]$ |
| **Horizontal Climate Ribbon** | $X \in [-0.680\text{m}, +0.680\text{m}]$ | $Y \approx 0.475\text{m}$ | $Z \in [0.628\text{m}, 0.648\text{m}]$ |
| **Center Bridge Console** | $X \in [-0.170\text{m}, +0.170\text{m}]$ | $Y \in [-0.420\text{m}, +0.380\text{m}]$ | $Z \in [0.230\text{m}, 0.610\text{m}]$ |
| **Split Butterfly Armrest** | $X \in [-0.170\text{m}, +0.170\text{m}]$ | $Y \in [-0.420\text{m}, -0.080\text{m}]$ | $Z \approx 0.488\text{m}$ |

---

## 2. Quantitative Triangle & Mesh Budget (Dashboard & Console)

Under the upgraded ultra-fidelity standard, the dashboard and center console assembly is allocated **75,000 – 95,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Dashboard & Console Component Mesh                        │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Driver-Oriented Upper Top Deck (Anti-glare hooded cowl)   │ 24,000       │ 25.3%      │
│ Floating 14.5" OLED Infotainment & Passenger Aux Display   │ 12,000       │ 12.6%      │
│ Continuous Horizontal Climate Ribbon (Micro-louvers/Dials)│ 14,000       │ 14.7%      │
│ Center Bridge Console (Upper control deck + lower tray)   │ 20,000       │ 21.1%      │
│ Monostable Shifter, Start Gate, Volume Wheel & MMI Dial   │ 12,000       │ 12.6%      │
│ Split Butterfly Padded Leather Armrest & Storage Tub      │ 13,000       │ 13.7%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (DASHBOARD & CENTER BRIDGE CONSOLE)                 │ ~95,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Driver-Oriented Asymmetric Ergonomics

### A. Driver Cowl Peak & Sightline Formula
The dashboard top deck features an asymmetric arch peaked at $X_{\text{driver}} = -0.380\text{m}$, providing anti-glare shading for the 12.3-inch curved digital instrument cluster:
$$Z_{\text{cowl}}(x) = Z_{\text{base}} + \Delta Z_{\text{hood}} \cdot \cos^{1.5}\left( \frac{|x - (-0.380)|}{w_{\text{binnacle}}} \cdot \frac{\pi}{2} \right)$$
- Prevents windshield reflections from obscuring critical digital instrumentation.
- Screen tilted upward $14.0^\circ$ toward driver eye-line ($Z_{\text{eye}} \approx 1.05\text{m}$).

### B. Floating Center Infotainment Display (14.5" OLED)
- **Compound Rotation:** Angled $8.0^\circ$ yaw towards the driver (LHD) and $15.0^\circ$ pitch upward to optimize reachability and minimize ocular refocus time:
  $$\mathbf{R}_{\text{display}} = \mathbf{R}_z(-8.0^\circ) \cdot \mathbf{R}_x(+15.0^\circ)$$
- **Ultra-Thin Bezel:** $2.5\text{mm}$ brushed titanium perimeter frame with edge-to-edge optical glass.
- **Cantilevered Neck:** Structural billet aluminum pedestal anchoring the display rigidly to the dashboard cross-car magnesium beam.

### C. Continuous Horizontal Climate Ribbon
- **Acoustic Low-Velocity Air Delivery:** Full-width continuous slot ($20\text{mm}$ height) running beneath the upper display tier.
- **Knurled Micro-Louvers:** Internal multi-vane directional louvers actuated by tactile satin aluminum slider toggles.

---

## 4. Center Bridge Console & Switchgear

### A. Floating Bridge Architecture
- **Two-Tier Architecture:** Upper control deck for immediate driver hand reach; open floating storage tray underneath for wireless charging pads and mobile device storage.
- **Monostable Electronic Gear Selector:** Sculpted shift lever with perforated leather palm rest, brushed titanium trigger release, and electronic 'P' park button.
- **Engine Start/Stop Button:** Billet aluminum tactile button enclosed beneath a protective red anodized aircraft-style flip gate.
- **MMI Navigation Controller:** $\varnothing 52\text{mm}$ rotary dial with precision diamond-knurled aluminum perimeter ring and black glass capacitive touch top.
- **Cup Holder Compartment:** Roll-top tambour sliding door mechanism concealing dual heated/cooled cup holders.

### B. Split Butterfly Luxury Leather Armrest
- **Dual-Lid Butterfly Opening:** Left and right lids articulate independently, enabling driver or passenger access without obstructing the other occupant.
- **Negative French Seam Gutter:** Center division gutter ($-8\text{mm}$) with double contrast stitching matching the seat craftsmanship.

---

## 5. The 5-Modifier Class-A Amplification Pipeline (Dashboard)

To achieve **~60,000 triangles** with mirror-like specular highlights:

```python
def apply_dashboard_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline."""
    # Step 1: Vertex Welding
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Smooth Shading by Angle
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
    
    # Step 4: Angle-Limited Bevel Modifier (3.0mm soft chamfers)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.003
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(38.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 6. PBR Material Physics & Shader Recipes

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ leather_nappa_dash        │ (0.02, 0.022, 0.024) │ 0.36      │ 0.02     │ 0.18      │ Soft-touch upper top deck    │
│ brushed_titanium_trim     │ (0.30, 0.31, 0.33)   │ 0.22      │ 0.92     │ 0.00      │ Accent ribbon & bezels       │
│ open_pore_walnut          │ (0.045, 0.032, 0.020)│ 0.62      │ 0.00     │ 0.00      │ Matte natural wood inlay     │
│ display_oled_glass        │ (0.01, 0.012, 0.015) │ 0.05      │ 0.10     │ 1.00      │ Optical glass transmission   │
│ ambient_led_lightpipe     │ (0.10, 0.70, 1.00)   │ 0.10      │ 0.00     │ 0.00      │ Emissive strength 6.0 (cyan) │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 7. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every dashboard and center console GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Split Butterfly Armrest Lids (`ARMREST_Lid_L` & `ARMREST_Lid_R`)**:
  - Longitudinal outer hinge axes along $X = \pm 0.170\text{m}$ at $Z \approx 0.46\text{m}$.
  - **`Action_Armrest_Open_L`**: Left lid rotates $+85.0^\circ$ outward around its left hinge.
  - **`Action_Armrest_Open_R`**: Right lid rotates $-85.0^\circ$ outward around its right hinge.
  - Custom Property: `{"interactive": true, "option_id": "armrest_butterfly", "type": "toggle", "actions": ["Action_Armrest_Open_L", "Action_Armrest_Open_R"]}`.
- **Roll-Top Tambour Cupholder Door (`CONSOLE_Cupholder_Tambour`)**:
  - Sliding track over console deck.
  - **`Action_Cupholder_Slide`**: Retracts $-120\text{mm}$ rearward underneath armrest edge.
  - Custom Property: `{"interactive": true, "option_id": "cupholder_cover", "type": "linear", "min": 0.0, "max": -0.12, "action": "Action_Cupholder_Slide"}`.
- **Monostable Electronic Gear Shifter (`CONSOLE_Shifter_Lever`)**:
  - Pivot bearing located below console plate at $(X = -0.040, Y = 0.120, Z = 0.450)$.
  - **`Action_Shifter_PRND`**: Stepped tilt positions: Park ($+15^\circ$), Reverse ($+7.5^\circ$), Neutral ($0^\circ$), Drive ($-7.5^\circ$).
  - Custom Property: `{"interactive": true, "option_id": "gear_shifter", "type": "stepped", "steps": ["P", "R", "N", "D"], "action": "Action_Shifter_PRND"}`.
- **Engine Start/Stop Red Safety Flip Gate (`CONSOLE_Start_SafetyGate`)**:
  - Horizontal top hinge axis.
  - **`Action_Start_Safety_Gate`**: Flips $+90.0^\circ$ vertical to expose the pushbutton.
  - Custom Property: `{"interactive": true, "option_id": "start_safety_gate", "type": "toggle", "action": "Action_Start_Safety_Gate"}`.
- **Engine Start/Stop Pushbutton (`CONSOLE_Start_Button`)**:
  - Center of start switch housing.
  - **`Action_Start_Button_Press`**: Depresses $-3.5\text{mm}$ with acoustic ignition trigger.
  - Custom Property: `{"interactive": true, "option_id": "engine_start", "type": "trigger", "action": "Action_Start_Button_Press"}`.
- **Passenger Glovebox Door (`DASH_Glovebox_Door`)**:
  - Lower horizontal hinge along $Z = 0.48\text{m}, X \in [0.20\text{m}, 0.65\text{m}]$.
  - **`Action_Glovebox_Open`**: Damped drop $-42.0^\circ$ downward.
  - Custom Property: `{"interactive": true, "option_id": "glovebox_door", "type": "toggle", "action": "Action_Glovebox_Open"}`.
- **Directional Climate Ribbon Micro-Louvers (`CLIMATE_Louver_Array`)**:
  - **`Action_Vent_Deflect`**: Vanes deflect $\pm 15.0^\circ$ to redirect acoustic cabin airflow.

### B. Raycast Collision Hitboxes
- `HITBOX_Armrest_Lid_L` / `HITBOX_Armrest_Lid_R`: Bounding boxes for butterfly lid clicks.
- `HITBOX_Cupholder_Handle`: Rectangular pull tab for tambour slider.
- `HITBOX_Shifter_Grip`: Palm grip hull for gear toggle clicks.
- `HITBOX_Start_Gate`: Red anodized gate collision hull.
- `HITBOX_Start_Button`: Circular cylinder hit-target.
- `HITBOX_MMI_Dial`: $\varnothing 52\text{mm}$ cylinder hit-target for MMI rotary interactions.
- `HITBOX_Glovebox_Latch`: Chrome release button for glovebox.
- `HITBOX_Infotainment_Touch`: Planar screen hitbox for UI touch simulation.

---

## 8. Mandatory Blender glTF Export Invocation

When exporting any dashboard asset:
```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports baked kinematic NLA actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves local hinge pivot positions
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
