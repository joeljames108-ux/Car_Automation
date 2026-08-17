# 🏎️ Modular 3D glTF Vehicle Asset Library

Place your downloaded or custom 3D model files (`.glb`, `.gltf`, `.bin`, `.png` textures) in these dedicated folders. The application automatically detects, loads, caches, and attaches them to the vehicle assembly scene graph.

---

## 📁 Directory Structure & Recommended Naming

```text
public/models/
│
├── chassis/
│   ├── sedan_chassis_01.glb
│   ├── coupe_chassis_01.glb
│   ├── sports_spaceframe.glb
│   ├── pickup_ladder_frame.glb
│   └── carbon_monocell.glb
│
├── interior/
│   ├── dashboard_executive.glb
│   ├── dashboard_sport.glb
│   ├── cluster_virtual_cockpit.glb
│   ├── steering_wheel_sport.glb
│   ├── steering_wheel_gt3_yoke.glb
│   ├── seat_sport_bucket.glb
│   ├── seat_carbon_race.glb
│   └── center_console.glb
│
├── powertrain/
│   ├── v8_biturbo_engine.glb
│   ├── v12_racing_engine.glb
│   ├── i4_turbo_engine.glb
│   ├── dual_ev_motor.glb
│   └── dct_transmission.glb
│
├── exterior/
│   ├── front_bumper.glb
│   ├── rear_bumper.glb
│   ├── doors_fl.glb / doors_fr.glb
│   ├── hood.glb
│   ├── trunk.glb
│   ├── headlights.glb / taillights.glb
│   ├── front_splitter.glb
│   └── rear_gt_wing.glb
│
└── suspension/
    ├── double_wishbone_front.glb
    ├── multilink_rear.glb
    ├── carbon_ceramic_brake_disc.glb
    ├── brake_caliper_6pot.glb
    └── wheel_rim_19inch.glb
```

---

## 📐 3D Coordinate Space & Scaling Standards

| Axis | Direction | Description |
|---|---|---|
| **$+X$** | Forward | Points toward the front bumper |
| **$+Y$** | Up | Points toward the roof / sky |
| **$+Z$** | Right | Points toward the passenger side ($+Z$ right, $-Z$ driver) |
| **Origin $(0,0,0)$** | Ground Center | Center of the front axle at the ground plane |
| **Unit Scale** | $1.0\text{ unit} = 1.0\text{ meter}$ | ($1000\text{mm} = 1.0\text{ unit}$) |

---

## 🔩 Standard Attachment Node Names (Optional for Auto-Snapping)

If your 3D models (in Blender, Maya, or 3ds Max) contain empty objects/nodes named with the following prefixes, the physics attachment engine will automatically snap corresponding components to those exact 3D coordinates:

- `MOUNT_ENGINE_FL` / `MOUNT_ENGINE_FR`
- `MOUNT_TRANS_REAR`
- `MOUNT_SUSP_FL` / `MOUNT_SUSP_FR` / `MOUNT_SUSP_RL` / `MOUNT_SUSP_RR`
- `MOUNT_DASHBOARD`
- `MOUNT_CLUSTER`
- `MOUNT_STEERING`
- `MOUNT_DRIVER_SEAT` / `MOUNT_PASSENGER_SEAT`
- `MOUNT_CENTER_CONSOLE`
- `MOUNT_AERO_FRONT` / `MOUNT_AERO_REAR`

---

## 💡 Automatic Fallback
If any `.glb` model is not present, the system automatically renders high-fidelity programmatic Three.js CAD proxy meshes, ensuring everything continues to work seamlessly without errors.
