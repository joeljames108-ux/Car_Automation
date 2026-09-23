# GT3 Supercar GLB Forensic Report

> **Source Asset**: `public/models/Car_GT3_Supercar_Complete.glb`  
> **File Size**: 12,997,244 bytes (12.40 MB)  
> **Inspected**: 2026-09-18  

---

## 1. Top-Level Structure

| Metric | Value |
| :--- | :--- |
| glTF Version | 2.0 |
| Total Meshes | 51 |
| Total Nodes | 88 |
| Total Materials | 14 |
| Total Textures | **0** (pure PBR, no raster images) |
| Total Images | **0** |
| Total Accessors | 201 |
| Total BufferViews | 201 |
| Total Triangles | **358,788** |
| Total Vertices | **337,834** |

---

## 2. Byte Budget Breakdown

| Data Category | Bytes | MB | % of File |
| :--- | ---: | ---: | ---: |
| **JSON Chunk** (scene graph, materials) | 55,396 | 0.05 | 0.4% |
| **Binary Buffer** (geometry data) | 12,941,820 | 12.34 | 99.6% |

### Binary Buffer Decomposition

| Attribute | Bytes | MB | % of Buffer |
| :--- | ---: | ---: | ---: |
| Vertex POSITION (vec3 float32) | 4,054,008 | 3.87 | 31.3% |
| Vertex NORMAL (vec3 float32) | 4,054,008 | 3.87 | 31.3% |
| UV TEXCOORD_0 (vec2 float32) | 2,702,672 | 2.58 | 20.9% |
| Face INDEX (uint16) | 2,152,728 | 2.05 | 16.6% |

### Key Insight: The Byte Budget Formula

```
Estimated GLB size ≈ total_vertices × 32 bytes + indices_overhead + JSON_overhead

Where 32 bytes/vertex = 12 (position) + 12 (normal) + 8 (UV)

For 337,834 verts: 337,834 × 32 = 10,810,688 bytes (10.31 MB)
+ 2,152,728 bytes indices = 12,963,416 bytes ≈ 12.37 MB ✓
```

**To reach 15 MB target: need ~420,000 – 440,000 vertices.**

---

## 3. Subsystem Triangle Budget (Per VEHICLE_ROOT Branch)

| Subsystem | Meshes | Triangles | % of Total | Vertices | Est. MB |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **BODY** | 10 | 134,264 | 37.4% | 111,890 | 3.41 |
| **CABIN** | 11 | 113,520 | 31.6% | 106,344 | 3.25 |
| **WHEELS** | 16 | 52,352 | 14.6% | 53,068 | 1.62 |
| **BRAKES** | 5 | 28,860 | 8.0% | 35,698 | 1.09 |
| **LIGHTING** | 3 | 14,472 | 4.0% | 17,532 | 0.54 |
| **GLASS** | 1 | 8,952 | 2.5% | 7,954 | 0.24 |
| **TIRES** | 4 | 4,800 | 1.3% | 4,000 | 0.12 |
| **UNDERBODY** | 1 | 1,568 | 0.4% | 1,348 | 0.04 |
| AERO_MOUNTING_POINTS | 0 | 0 | 0.0% | 0 | 0.00 |
| CHASSIS ★ | 0 | 0 | 0.0% | 0 | 0.00 |
| ENGINE_BAY ★ | 0 | 0 | 0.0% | 0 | 0.00 |
| SUSPENSION ★ | 0 | 0 | 0.0% | 0 | 0.00 |
| **TOTAL** | **51** | **358,788** | **100%** | **337,834** | **~12.4** |

> ★ = Empty subsystems (structural scaffolding only, no geometry). These are the primary opportunity for reaching 15 MB.

---

## 4. Top 25 Meshes by Triangle Count

| Mesh Name | Triangles | Vertices | Material |
| :--- | ---: | ---: | :--- |
| body | 80,566 | 51,404 | Paint_RossoCorsa |
| interior_light | 52,534 | 50,748 | InteriorLeather |
| leather | 21,960 | 20,434 | InteriorLeather |
| interior_dark | 19,939 | 20,565 | InteriorLeather |
| chrome | 18,568 | 26,246 | PolishedMetal |
| brakes | 14,172 | 19,218 | BremboCaliper |
| plastic_gray | 13,920 | 13,320 | SatinTrim |
| lights_red | 12,020 | 15,312 | LED_Red |
| carbon_fibre_trim | 9,756 | 7,916 | CarbonFiber |
| wheel (×4) | 9,120 ea. | ~9,640 ea. | ForgedAlloy |
| glass | 8,952 | 7,954 | Glass_Dielectric |
| steering_leather | 8,144 | 5,838 | InteriorLeather |
| steering_carbon | 5,632 | 4,134 | CarbonFiber |
| metal | 5,344 | 6,122 | SatinTrim |
| steering_column | 4,110 | 3,408 | InteriorLeather |
| brake (×4) | 3,672 ea. | 4,120 ea. | BrakeRotor |
| rim_fl/fr/rl/rr | 3,490 ea. | ~3,000 ea. | ForgedAlloy |

---

## 5. Material Forensics (14 PBR Materials)

| ID | Name | Base Color RGB | Met | Rgh | Extensions |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 00 | Supercar_SatinTrim | [0.06, 0.06, 0.07] | 0.40 | 0.45 | — |
| 01 | Supercar_Paint_RossoCorsa | [0.84, 0.04, 0.06] | 0.92 | 0.10 | KHR_materials_clearcoat |
| 02 | Supercar_CarbonFiber | [0.03, 0.03, 0.04] | 0.20 | 0.18 | KHR_materials_clearcoat |
| 03 | Supercar_PolishedMetal | [0.92, 0.93, 0.95] | 0.98 | 0.08 | — |
| 04 | Supercar_ApexBadge | [0.95, 0.78, 0.12] | 0.75 | 0.20 | KHR_materials_clearcoat |
| 05 | Supercar_BrakeRotor | [0.22, 0.23, 0.25] | 0.80 | 0.35 | — |
| 06 | Supercar_BremboCaliper | [0.88, 0.03, 0.05] | 0.35 | 0.18 | KHR_materials_clearcoat |
| 07 | Supercar_InteriorLeather | [0.04, 0.04, 0.04] | 0.05 | 0.78 | — |
| 08 | Supercar_LED_Red | [1.00, 0.02, 0.02] | 0.00 | 0.50 | KHR_materials_emissive_strength |
| 09 | Supercar_Glass_Dielectric | [0.90, 0.95, 1.00] | 0.00 | 0.02 | KHR_materials_clearcoat |
| 10 | Supercar_LED_White | [1.00, 1.00, 1.00] | 0.00 | 0.50 | KHR_materials_emissive_strength |
| 11 | Supercar_TireRubber | [0.03, 0.03, 0.03] | 0.00 | 0.88 | — |
| 12 | Supercar_TitaniumExhaust | [0.65, 0.63, 0.60] | 0.96 | 0.22 | — |
| 13 | Supercar_ForgedAlloy | [0.88, 0.89, 0.92] | 0.98 | 0.16 | KHR_materials_clearcoat |

### Material-to-Mesh Coverage

| Material | Total Tris | % | Top Meshes |
| :--- | ---: | ---: | :--- |
| InteriorLeather | 107,211 | 29.9% | carpet, interior_dark, interior_light, leather, steering_column, steering_leather |
| Paint_RossoCorsa | 80,566 | 22.5% | body |
| ForgedAlloy | 50,440 | 14.1% | rim_fl/fr/rl/rr, wheel (×4) |
| SatinTrim | 25,641 | 7.1% | blue, metal, plastic_gray, trim, wipers |
| PolishedMetal | 18,568 | 5.2% | chrome |
| CarbonFiber | 16,868 | 4.7% | carbon fibre, carbon_fibre_trim, steering_carbon, centre (×4) |
| BrakeRotor | 14,688 | 4.1% | brake (×4) |
| BremboCaliper | 14,172 | 3.9% | brakes |
| LED_Red | 12,524 | 3.5% | steering_red_lights, lights_red |
| Glass_Dielectric | 8,952 | 2.5% | glass |
| TireRubber | 4,800 | 1.3% | tire (×4) |
| LED_White | 2,452 | 0.7% | leds, lights |
| TitaniumExhaust | 1,688 | 0.5% | nuts (×4) |
| ApexBadge | 218 | 0.1% | yellow_trim |

---

## 6. Node Hierarchy (Full Tree)

```text
VEHICLE_ROOT
├── AERO_MOUNTING_POINTS
│   ├── DIFFUSER_MOUNT
│   ├── ENGINE_MOUNT_MID
│   ├── EXHAUST_MOUNT
│   ├── FRONT_SPLITTER_MOUNT
│   ├── FRONT_SUSPENSION_L / R
│   ├── FRONT_WHEEL_L / R
│   ├── INTERCOOLER_MOUNT_L / R
│   ├── RADIATOR_MOUNT_L / R
│   ├── REAR_SUSPENSION_L / R
│   ├── REAR_WHEEL_L / R
│   ├── REAR_WING_MOUNT
│   ├── SIDE_SKIRT_MOUNT_L / R
│   └── TRANSMISSION_MOUNT
├── BODY (10 meshes: body, carbon fibre, carbon_fibre_trim, chrome, metal, plastic_gray, trim, wipers, blue, yellow_trim)
├── BRAKES (5 meshes: brakes, brake ×4)
├── CABIN (11 meshes: carpet, interior_dark, interior_light, leather, steering_carbon, steering_centre, steering_column, steering_leather, steering_metal, steering_red_lights, steering_trim)
├── CHASSIS (empty)
├── ENGINE_BAY (empty)
├── GLASS (1 mesh: glass)
├── LIGHTING (3 meshes: leds, lights, lights_red)
├── SUSPENSION (empty)
├── TIRES (4 meshes: tire ×4)
├── UNDERBODY (1 mesh: grills)
└── WHEELS (16 meshes: centre ×4, nuts ×4, rim_fl/fr/rl/rr, wheel ×4, wheel_fl/fr/rl/rr empties)
```

---

## 7. glTF Extensions Used

- `KHR_materials_clearcoat` — Used on paint, carbon fiber, caliper, glass, alloy, badge (6 materials)
- `KHR_materials_emissive_strength` — Used on LED_Red and LED_White (2 materials)

---

## 8. Accessor Component Types

| Type Code | Type Name | Count | Used For |
| :--- | :--- | ---: | :--- |
| 5126 | FLOAT (32-bit) | 153 | Vertex positions, normals, UVs |
| 5123 | UNSIGNED_SHORT (16-bit) | 48 | Face indices |

> Using UNSIGNED_SHORT (16-bit) for indices means each mesh is capped at 65,535 vertices max. This is standard and efficient for WebGL compatibility.

---

## 9. Key Architectural Takeaways

1. **Zero textures, 100% mathematical PBR** — All realism comes from metallic/roughness/clearcoat physics, not baked images.
2. **~338k vertices × 32 bytes/vertex = 10.8 MB geometry** — The entire file weight is vertex data buffers.
3. **51 separate meshes with 14 materials** — Clean separation by functional part and shader type.
4. **12 subsystem branches under VEHICLE_ROOT** — Modular, kinematic-ready hierarchy.
5. **20 empty CAD hardpoints** — Enable snap-in attachment of modular components at world-space coordinates.
6. **3 empty subsystems (CHASSIS, ENGINE_BAY, SUSPENSION)** — Primary upgrade opportunity for the 15 MB standard.
7. **Geometry quality pipeline**: `remove_doubles(0.0005)` → `shade_smooth_by_angle(35°)` → `Bevel(3mm, 2 segments)` → `WeightedNormal(keep_sharp=True)`.
