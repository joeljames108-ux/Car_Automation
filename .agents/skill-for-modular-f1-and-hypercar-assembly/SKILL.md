---
name: skill-for-modular-f1-and-hypercar-assembly
description: Comprehensive operational skill for building, configuring, and assembling Formula 1 single-seaters (20 sockets) and Le Mans / Road Hypercars (25 sockets) part-by-part with independent 3D GLBs, aerodynamic downforce/drag calculations, and FIA/ACO homologation compliance.
---

# Modular F1 & Hypercar Part-by-Part Assembly Skill

This skill governs the end-to-end design, modular authoring, 3D GLB export, and runtime dynamic assembly of **Formula 1 cars (20 sockets)** and **Hypercars (25 sockets)**.

---

## 1. Core Principles

1. **Part-by-Part Autonomy**: Every automotive subsystem (Front Wing, Nose Cone, Survival Cell, Floor, Sidepods, Power Unit, Suspension, Rear Wing, Diffuser, Wheels) is authored as an independent 3D GLB asset.
2. **Zero-Offset Spatial Hardpoints**: All individual component GLB files are authored relative to the universal origin $(0, 0, 0)$ located on the ground plane directly below the center of the front axle. Loading all parts at $(0, 0, 0)$ automatically creates a fully aligned vehicle.
3. **Multi-Configuration Registry**: Every socket offers at least 3 selectable configurations (e.g. Monza low-drag vs. Monaco high-downforce wings; LMH e-AWD front motor vs. LMDh rear hybrid; V6 TT vs. V8 TT vs. V12 NA engines).
4. **Regulatory Enforcement**:
   - Formula 1: FIA Article 3 (Aerodynamics), Article 5 (Power Unit), Article 12 (Survival Cell), Article 13 (Crash Structures).
   - Hypercar: FIA/ACO LMH (bespoke chassis, $200\,\text{kW}$ front hybrid $>190\,\text{km/h}$) vs. IMSA/ACO LMDh (spec spine, $50\,\text{kW}$ rear hybrid), and Balance of Performance (BoP) $C_L/C_D \approx 4.0:1$ window.

---

## 2. The Formula 1 Modular Architecture (20 Sockets)

```
                                  [SOCKET_HALO]
                                  (0, 720, 950)
                                        |
[SOCKET_FRONT_WING]   [SOCKET_NOSE_CONE]  [SOCKET_SURVIVAL_CELL]   [SOCKET_POWER_UNIT]   [SOCKET_REAR_WING]
 (0, 120, -1350) ===>   (0, 320, -700) ===>  (0, 300, 1100)   ===>  (0, 380, 1950) ===>   (0, 850, 3750)
         |                     |                    |                      |                     |
   [SUSP_FL/FR]           [COCKPIT_TRIM]     [SIDEPODS L/R]          [GEARBOX]           [REAR_DIFFUSER]
(-/+450, 360, 0)          (0, 520, 850)     (-/+650, 340, 1200)    (0, 350, 2750)        (0, 200, 3550)
         |                                          |                      |                     |
   [WHEELS_FL/FR]                           [FLOOR_UNDERBODY]        [SUSP_RL/RR]        [WHEELS_RL/RR]
(-/+900, 360, 0)                             (0, 75, 1400)         (-/+450, 360, 3600)  (-/+900, 360, 3600)
```

### Primary Sockets & Typical Configurations:
1. `SOCKET_FRONT_WING`:
   - `f1_fw_monza_low_drag` ($C_l = -0.85, C_d = 0.18$)
   - `f1_fw_monaco_high_downforce` ($C_l = -1.45, C_d = 0.34$)
   - `f1_fw_balanced_silverstone` ($C_l = -1.15, C_d = 0.25$)
2. `SOCKET_FLOOR_UNDERBODY`:
   - `f1_floor_venturi_standard` (2023 FIA TD039 $15\,\text{mm}$ raised edge)
   - `f1_floor_aggressive_vortex_edge` (6-slot edge vortex generators)
3. `SOCKET_SIDEPOD_L` & `SOCKET_SIDEPOD_R`:
   - `f1_sidepod_extreme_undercut` (Red Bull RB19 style)
   - `f1_sidepod_bathtub_gully` (Ferrari SF-23 style)
   - `f1_sidepod_zeropod_slim` (Mercedes W13/W14 style)
4. `SOCKET_POWER_UNIT`:
   - `f1_pu_ferrari_066` ($1,025\,\text{hp}$, high-RPM boost)
   - `f1_pu_honda_rbpth002` (low center of gravity, ultra-durable thermal cycles)
   - `f1_pu_2026_future_spec` ($350\,\text{kW}$ MGU-K, no MGU-H, 100% sustainable e-fuel)
5. `SOCKET_REAR_WING`:
   - `f1_rw_monza_spoon` (low-drag shallow spoon, $C_d = 0.16$)
   - `f1_rw_monaco_barn_door` (deep chord, dual beam wing, $C_l = -1.65$)
   - `f1_rw_2026_active_x_mode` (active Z-mode cornering / X-mode straightaway flap)

---

## 3. The Hypercar Modular Architecture (25 Sockets)

```
                                  [SOCKET_DORSAL_SHARK_FIN]
                                        (0, 920, 2400)
                                              |
[SOCKET_FRONT_SPLITTER]   [SOCKET_FRONT_CLAMSHELL]   [SOCKET_CENTRAL_MONOCOQUE]   [SOCKET_ICE_POWERTRAIN]   [SOCKET_REAR_WING]
 (0, 90, -950)     ===>    (0, 480, -300)     ===>    (0, 420, 1100)      ===>   (0, 440, 2150)    ===>  (0, 980, 3650)
        |                         |                         |                           |                      |
[FRONT_HYBRID_MGU]        [WINDSCREEN_ROOF]         [BATTERY_900V]              [EXHAUST_SYSTEM]        [REAR_DIFFUSER]
  (0, 260, 0)              (0, 950, 1050)            (0, 240, 1350)              (0, 720, 2250)         (0, 220, 3400)
        |                         |                         |                           |                      |
 [FRONT_SUSPENSION]       [ROOF_AIR_SCOOP]          [FLOOR_UNDERBODY]           [GEARBOX_REAR]          [REAR_SUSPENSION]
  (0, 380, 0)              (0, 1080, 1550)           (0, 65, 1550)               (0, 360, 2800)         (0, 380, 3150)
```

### Primary Sockets & Typical Configurations:
1. `SOCKET_ICE_POWERTRAIN`:
   - `hypercar_ice_v6_twin_turbo` (Ferrari 499P 3.0L $120^\circ$ V6 TT, $500\,\text{kW}$ BoP)
   - `hypercar_ice_v8_twin_turbo` (Porsche 963 4.6L V8 TT, $520\,\text{kW}$)
   - `hypercar_ice_v12_atmospheric` (Aston Martin Valkyrie 6.5L Cosworth V12, $11,100\,\text{RPM}$, $1,000\,\text{hp}$)
   - `hypercar_ice_v16_megawatt` (Bugatti Tourbillon 8.3L Cosworth V16, $1,000\,\text{hp}$)
2. `SOCKET_REAR_WING`:
   - `hypercar_rw_swan_neck_lemans` (Single-element high efficiency, $C_L/C_D \approx 4.0:1$)
   - `hypercar_rw_active_biplane_road` (Multi-element active airbrake flap)
   - `hypercar_rw_wingless_underfloor_venturi` (Peugeot 9X8 style underfloor Venturi reliance)
3. `SOCKET_FRONT_HYBRID_MGU`:
   - `hypercar_mgu_front_200kw_awd` (LMH electric AWD above $190\,\text{km/h}$)
   - `hypercar_front_ballast_rwd` (LMDh spec rear-drive ballast plate)

---

## 4. Blender 5.x Procedural Modeling & Export Rules

When creating individual GLB parts for the modular repository:
1. **World Hardpoint Placement**: Author each mesh at its true vehicle coordinate $(X, Y, Z)$ so the origin remains at $(0, 0, 0)$ front axle ground center.
2. **CAD Fillets**: Apply $1.2-2.5\,\text{mm}$ bevel chamfers with 2 segments and `WeightedNormal` (`keep_sharp=True`).
3. **Pre-Export Modifier Baking**: Bake all `Mirror`, `Solidify`, and `Bevel` modifiers before export (`export_apply=False`).
4. **Metadata Extras**: Attach component metadata to the root object extras:
   ```json
   {
     "socket_id": "SOCKET_FRONT_WING",
     "part_id": "f1_fw_monza_low_drag",
     "mass_kg": 9.5,
     "cd": 0.18,
     "cl": -0.85
   }
   ```
5. **Path Conventions**:
   - F1 parts: `public/models/modular_parts/f1/<part_id>.glb`
   - Hypercar parts: `public/models/modular_parts/hypercar/<part_id>.glb`
