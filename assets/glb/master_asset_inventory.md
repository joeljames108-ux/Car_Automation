# Master Automotive GLB Asset Inventory & Rework Classification

> **Total Assets Inventoried**: 217 GLB files
> **Originals Secured**: 100% backed up in `/assets/glb/original/` and `/assets/glb/backup/`

## Summary by Automotive Subsystem
| Subsystem Domain | Asset Count | Major Rework (A) | Moderate Refinement (B) | Reference (C) |
|---|---|---|---|---|
| **Aero** | 1 | 0 | 1 | 0 |
| **Chassis** | 6 | 0 | 6 | 0 |
| **Exterior** | 136 | 4 | 132 | 0 |
| **Forced Induction** | 5 | 0 | 5 | 0 |
| **General** | 2 | 0 | 2 | 0 |
| **Interior** | 29 | 0 | 29 | 0 |
| **Powertrain** | 35 | 35 | 0 | 0 |
| **Source Archive** | 3 | 0 | 0 | 3 |

---

## Aero Assets (1 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `gt3_diffuser_exhaust_01.glb` | Active Aerodynamics & Venturi Channels | 36 | 6 | 1,560 | 45.4 KB | Standard | **B — moderate refinement**: Check DRS actuator pivots and diffuser strakes |

## Chassis Assets (6 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `hatchback_chassis_01.glb` | Structural Frame & Monocoque | 44 | 5 | 2,772 | 135.6 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |
| `offroad_ladder_chassis_01.glb` | Structural Frame & Monocoque | 11 | 3 | 1,332 | 53.4 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |
| `gt3_race_chassis_01.glb` | Structural Frame & Monocoque | 22 | 4 | 888 | 26.5 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |
| `sports_car_chassis_01.glb` | Structural Frame & Monocoque | 22 | 4 | 888 | 26.5 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |
| `supercar_monocoque_chassis_01.glb` | Structural Frame & Monocoque | 22 | 4 | 888 | 26.5 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |
| `ev_skateboard_chassis_01.glb` | Structural Frame & Monocoque | 9 | 4 | 228 | 22.2 KB | Standard | **B — moderate refinement**: Needs hardpoint alignment to master coordinates and FEA stress zones |

## Exterior Assets (136 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `hatchback_ford_escort.glb` | Vehicle Component | 37 | 37 | 250,131 | 12.79 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `full_modular_car_assembly.glb` | Vehicle Component | 2330 | 395 | 256,426 | 11.61 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `car_exterior_primary_backup_v0.glb` | Vehicle Component | 782 | 21 | 217,869 | 9.84 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `sports_car_bmw_i8_raw.glb` | Flagship Hybrid Supercar Body | 782 | 21 | 217,869 | 9.84 MB | Hero | **A — major rework required (Master Asset)**: Originally 1500+ fragmented pieces, now consolidated to 16 nodes |
| `car_exterior_primary.glb` | Vehicle Component | 782 | 21 | 217,869 | 9.84 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hypercar_apex_gt3.glb` | Competition GT3 / Le Mans Hypercar Body | 1275 | 124 | 204,500 | 8.21 MB | Hero | **A — major rework required**: High mesh count, needs shutline definition and aero pivot setup |
| `sports_coupe_gt.glb` | Vehicle Component | 1163 | 97 | 196,300 | 7.41 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `sports_car_bmw_i8.glb` | Flagship Hybrid Supercar Body | 16 | 12 | 217,881 | 7.26 MB | Hero | **A — major rework required (Master Asset)**: Originally 1500+ fragmented pieces, now consolidated to 16 nodes |
| `vehicle_valkyrie_flying_buttress_lmh.glb` | Vehicle Component | 357 | 58 | 65,194 | 2.19 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_apex_huayra_active_vector.glb` | Vehicle Component | 357 | 58 | 65,194 | 2.19 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_cyber_autonomous_pursuit_gt.glb` | Vehicle Component | 354 | 57 | 64,594 | 2.17 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_nurburgring_dssv_stance_king.glb` | Vehicle Component | 354 | 57 | 64,702 | 2.17 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_cyber_interceptor_pursuit.glb` | Vehicle Component | 324 | 56 | 54,796 | 1.90 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_phantom_forged_carbon_gt.glb` | Vehicle Component | 322 | 55 | 54,752 | 1.90 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_nurburgring_record_breaker.glb` | Vehicle Component | 328 | 52 | 54,508 | 1.89 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_apex_hyper_valkyrie_lmh.glb` | Vehicle Component | 328 | 52 | 54,508 | 1.89 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_time_attack_carbon_phantom.glb` | Vehicle Component | 248 | 42 | 51,864 | 1.68 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_wec_le_mans_hypercar_prototype.glb` | Vehicle Component | 248 | 42 | 51,864 | 1.68 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_apex_hyper_gt_stradale.glb` | Vehicle Component | 248 | 42 | 51,864 | 1.68 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_formula_supremacy_aero_spec.glb` | Vehicle Component | 176 | 38 | 46,616 | 1.45 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_hypercar_apex_gt3.glb` | Competition GT3 / Le Mans Hypercar Body | 204 | 44 | 38,660 | 1.34 MB | Hero | **A — major rework required**: High mesh count, needs shutline definition and aero pivot setup |
| `vehicle_grand_tourer_coupe.glb` | Vehicle Component | 202 | 44 | 37,880 | 1.32 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_lemans_prototype.glb` | Vehicle Component | 169 | 48 | 38,960 | 1.32 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vehicle_time_attack_widebody.glb` | Vehicle Component | 168 | 48 | 38,948 | 1.31 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_car_assembly.glb` | Vehicle Component | 78 | 21 | 12,376 | 841.0 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `headlights.glb` | Vehicle Component | 60 | 24 | 8,904 | 623.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `brakes.glb` | Vehicle Component | 128 | 8 | 7,916 | 533.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `wheels.glb` | Wheel & Rim Assembly | 56 | 5 | 13,208 | 474.9 KB | Standard | **B — moderate refinement**: Check axle rotation pivot and brake caliper clearance |
| `front_fenders.glb` | Vehicle Component | 18 | 3 | 6,152 | 403.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `modular_gt3_apex.glb` | Vehicle Component | 114 | 14 | 20,116 | 339.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_wing.glb` | Aerodynamic Downforce Element | 15 | 3 | 3,632 | 309.6 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `rotor_internal_vanes.glb` | Vehicle Component | 124 | 3 | 3,840 | 256.0 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hood_panel.glb` | Vehicle Closure Panel | 12 | 5 | 10,220 | 251.6 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `hood.glb` | Vehicle Closure Panel | 12 | 5 | 10,220 | 251.6 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `taillights.glb` | Vehicle Component | 37 | 7 | 2,508 | 249.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `side_skirts.glb` | Vehicle Component | 18 | 2 | 2,484 | 244.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `bmw_i8_supercar_hood_open.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 242.1 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `bmw_i8_supercar_hood_closed.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 242.1 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `ford_escort_rs_cosworth_gt3_hood_open.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 241.8 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `ford_escort_rs_cosworth_hood_open.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 241.8 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `ford_escort_rs_cosworth_gt3_hood_closed.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 241.7 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `ford_escort_rs_cosworth_hood_closed.glb` | Vehicle Closure Panel | 12 | 5 | 9,972 | 241.7 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `suspension_rear.glb` | Vehicle Component | 18 | 6 | 6,348 | 187.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `front_splitter.glb` | Aerodynamic Downforce Element | 14 | 5 | 1,886 | 184.7 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `rotor_bobbins_valves.glb` | Vehicle Component | 56 | 3 | 2,160 | 162.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `powertrain_bay.glb` | Vehicle Component | 30 | 8 | 4,160 | 155.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `cockpit_interior.glb` | Vehicle Component | 29 | 5 | 4,528 | 147.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `suspension_front.glb` | Vehicle Component | 19 | 9 | 4,308 | 147.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_diffuser.glb` | Aerodynamic Downforce Element | 9 | 3 | 1,388 | 136.5 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `exhaust_tips.glb` | Vehicle Component | 13 | 4 | 4,748 | 135.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `wheel_hub_details.glb` | Wheel & Rim Assembly | 16 | 4 | 3,760 | 116.9 KB | Standard | **B — moderate refinement**: Check axle rotation pivot and brake caliper clearance |
| `drivetrain_differential.glb` | Vehicle Component | 31 | 6 | 2,672 | 107.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `racing_hardware.glb` | Vehicle Component | 21 | 5 | 2,768 | 97.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_subframe.glb` | Vehicle Component | 22 | 4 | 1,884 | 92.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `pneumatic_air_jacks.glb` | Vehicle Component | 20 | 5 | 1,744 | 87.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `inconel_exhaust_headers.glb` | Vehicle Component | 13 | 3 | 2,988 | 84.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `telemetry_sensors.glb` | Vehicle Component | 32 | 4 | 1,336 | 77.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `inboard_pushrod_heave.glb` | Vehicle Component | 12 | 6 | 2,160 | 72.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `caliper_bridges_clips.glb` | Vehicle Component | 20 | 2 | 1,888 | 71.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `chassis_door_sills.glb` | Vehicle Closure Panel | 20 | 6 | 1,444 | 69.8 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `chassis_ground_straps.glb` | Vehicle Component | 14 | 4 | 1,184 | 68.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hub_drive_pins.glb` | Vehicle Component | 28 | 3 | 832 | 68.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `aerodynamic_widebody_kit.glb` | Vehicle Component | 5 | 1 | 2,624 | 66.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `turbo_blankets_lines.glb` | Vehicle Component | 12 | 4 | 2,176 | 65.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hybrid_kers_inverter.glb` | Vehicle Component | 20 | 3 | 1,368 | 62.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `underbody_venturi_tunnels.glb` | Vehicle Component | 17 | 3 | 1,228 | 62.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `exhaust_resonators_o2.glb` | Vehicle Component | 12 | 3 | 1,792 | 61.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `fuel_cell_system.glb` | Vehicle Component | 10 | 5 | 1,708 | 61.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `racing_clutch_flywheel.glb` | Wheel & Rim Assembly | 17 | 4 | 1,248 | 60.2 KB | Standard | **B — moderate refinement**: Check axle rotation pivot and brake caliper clearance |
| `bumper_air_curtains.glb` | Vehicle Component | 22 | 4 | 728 | 58.4 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `spaceframe_subframes.glb` | Vehicle Component | 18 | 3 | 1,396 | 57.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `exhaust_slip_springs.glb` | Vehicle Component | 16 | 2 | 1,632 | 56.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `front_subframe.glb` | Vehicle Component | 14 | 6 | 872 | 55.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `doors_butterfly_pair.glb` | Vehicle Closure Panel | 6 | 4 | 1,984 | 54.3 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `pedal_hydraulics.glb` | Vehicle Component | 14 | 6 | 808 | 52.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `cockpit_dash_display.glb` | Vehicle Component | 19 | 5 | 814 | 52.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `steering_system.glb` | Vehicle Component | 11 | 4 | 1,328 | 51.0 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `swan_neck_pylons.glb` | Vehicle Component | 20 | 4 | 800 | 49.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `cockpit_electronics.glb` | Vehicle Component | 13 | 7 | 1,068 | 48.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `dry_sump_system.glb` | Vehicle Component | 9 | 6 | 988 | 45.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `active_aero_louvers.glb` | Vehicle Component | 19 | 4 | 388 | 39.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `winglet_gurney_fasteners.glb` | Aerodynamic Downforce Element | 19 | 2 | 408 | 38.3 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `splitter_ramps_skids.glb` | Aerodynamic Downforce Element | 20 | 3 | 376 | 37.9 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `sequential_shifter_gate.glb` | Vehicle Component | 13 | 4 | 700 | 35.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `seat_halo_brackets.glb` | Vehicle Component | 16 | 4 | 392 | 35.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `transaxle_dual_coolers.glb` | Vehicle Component | 13 | 6 | 528 | 35.0 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `windshield.glb` | Vehicle Component | 8 | 4 | 752 | 32.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `fog_lights.glb` | Vehicle Component | 6 | 3 | 1,008 | 32.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `roof_snorkel.glb` | Vehicle Component | 3 | 2 | 310 | 31.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `mirrors.glb` | Vehicle Component | 8 | 3 | 816 | 31.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `intercoolers_bov.glb` | Vehicle Component | 12 | 4 | 336 | 31.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rollcage_padding_dials.glb` | Vehicle Component | 10 | 6 | 380 | 30.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `emergency_cutoff_straps.glb` | Vehicle Component | 8 | 4 | 664 | 28.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `driver_drink_footboard.glb` | Vehicle Component | 8 | 5 | 444 | 26.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `doors.glb` | Vehicle Closure Panel | 10 | 3 | 472 | 26.1 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `oil_catch_tanks.glb` | Vehicle Component | 7 | 4 | 432 | 25.9 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rotor_wear_infrared.glb` | Vehicle Component | 12 | 3 | 272 | 25.7 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `clutch_inspection_slave.glb` | Vehicle Component | 9 | 3 | 400 | 25.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `dive_planes_venturi.glb` | Vehicle Component | 10 | 1 | 480 | 24.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `active_splitter_motors.glb` | Aerodynamic Downforce Element | 8 | 4 | 312 | 24.4 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `aerocatch_hood_latches.glb` | Vehicle Closure Panel | 8 | 4 | 480 | 24.4 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `pneumatic_shift_bottle.glb` | Vehicle Component | 6 | 4 | 416 | 24.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `diffuser_strakes_light.glb` | Aerodynamic Downforce Element | 7 | 2 | 608 | 24.2 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `splitter_struts_keel.glb` | Aerodynamic Downforce Element | 9 | 4 | 512 | 24.2 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `helmet_blower_ducting.glb` | Vehicle Component | 9 | 3 | 408 | 24.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `front_bumper.glb` | Vehicle Component | 3 | 2 | 844 | 23.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `drs_actuator_bearings.glb` | Vehicle Component | 8 | 4 | 280 | 22.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `a_pillar.glb` | Vehicle Component | 2 | 1 | 800 | 21.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `c_pillar.glb` | Vehicle Component | 2 | 1 | 800 | 21.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `exhaust_flame_dispersers.glb` | Vehicle Component | 8 | 3 | 248 | 19.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `wing_endplate_extractors.glb` | Aerodynamic Downforce Element | 12 | 2 | 124 | 18.2 KB | Standard | **B — moderate refinement**: Verify carbon fiber weave orientation and mounting brackets |
| `dorsal_shark_fin.glb` | Vehicle Component | 6 | 3 | 188 | 17.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `b_pillar.glb` | Vehicle Component | 2 | 1 | 640 | 17.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `ground_effect_lasers.glb` | Vehicle Component | 6 | 3 | 144 | 14.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_window.glb` | Vehicle Component | 8 | 2 | 124 | 13.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `badges.glb` | Vehicle Component | 2 | 1 | 192 | 12.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `cockpit_center_net.glb` | Vehicle Component | 5 | 3 | 124 | 11.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hood_naca_radiator_screens.glb` | Vehicle Closure Panel | 5 | 2 | 70 | 10.6 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `rear_bumper.glb` | Vehicle Component | 4 | 4 | 100 | 10.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `auxiliary_coolers.glb` | Vehicle Component | 7 | 3 | 48 | 9.4 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `cockpit_camera_monitors.glb` | Vehicle Component | 6 | 2 | 42 | 8.0 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `roll_cage.glb` | Vehicle Component | 2 | 1 | 96 | 7.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rocker_panels.glb` | Vehicle Component | 2 | 1 | 96 | 7.5 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `side_glass.glb` | Vehicle Component | 4 | 2 | 48 | 7.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `canards.glb` | Vehicle Component | 4 | 1 | 48 | 7.2 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `exhaust_thermal_aero.glb` | Vehicle Component | 4 | 2 | 48 | 7.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `crash_boxes.glb` | Vehicle Component | 4 | 1 | 48 | 6.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `roof_panel.glb` | Vehicle Component | 3 | 1 | 64 | 6.1 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `wipers.glb` | Vehicle Component | 2 | 1 | 64 | 5.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `trunk_decklid.glb` | Vehicle Component | 3 | 2 | 36 | 5.6 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `firewall_bulkhead.glb` | Vehicle Component | 2 | 1 | 24 | 3.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `vents.glb` | Vehicle Component | 2 | 1 | 24 | 3.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `rear_quarters.glb` | Vehicle Component | 2 | 1 | 24 | 3.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `floor_pan.glb` | Vehicle Component | 2 | 1 | 24 | 3.8 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `door_handles.glb` | Vehicle Closure Panel | 2 | 1 | 24 | 3.7 KB | Standard | **B — moderate refinement**: Verify hinge kinematic pivot and shut lines |
| `grille.glb` | Vehicle Component | 1 | 1 | 12 | 2.3 KB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |

## Forced Induction Assets (5 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `turbo_quad.glb` | Turbo / Supercharger Assembly | 388 | 10 | 238,904 | 8.35 MB | Standard | **B — moderate refinement**: Add detailed compressor/turbine wheel geometry and oil lines |
| `turbo_twin.glb` | Turbo / Supercharger Assembly | 191 | 10 | 119,308 | 4.16 MB | Standard | **B — moderate refinement**: Add detailed compressor/turbine wheel geometry and oil lines |
| `turbo_single.glb` | Turbo / Supercharger Assembly | 95 | 10 | 59,318 | 2.08 MB | Standard | **B — moderate refinement**: Add detailed compressor/turbine wheel geometry and oil lines |
| `supercharger_twin_screw.glb` | Turbo / Supercharger Assembly | 41 | 6 | 8,232 | 301.2 KB | Standard | **B — moderate refinement**: Add detailed compressor/turbine wheel geometry and oil lines |
| `supercharger_centrifugal.glb` | Turbo / Supercharger Assembly | 11 | 5 | 4,596 | 139.2 KB | Standard | **B — moderate refinement**: Add detailed compressor/turbine wheel geometry and oil lines |

## General Assets (2 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `hypercar_apex_gt3_backup_v0.glb` | Vehicle Component | 204 | 44 | 38,660 | 1.34 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |
| `hypercar_apex_gt3_original.glb` | Vehicle Component | 204 | 44 | 38,660 | 1.34 MB | Standard | **B — moderate refinement**: Needs weighted normals and material tuning |

## Interior Assets (29 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `cockpit_luxury_executive.glb` | Cockpit, Seating & Dashboard | 297 | 37 | 29,292 | 1.20 MB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_bespoke_atelier.glb` | Cockpit, Seating & Dashboard | 236 | 26 | 20,920 | 902.5 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_gt3_competition.glb` | Cockpit, Seating & Dashboard | 185 | 42 | 13,576 | 720.3 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_hypercar_carbon.glb` | Cockpit, Seating & Dashboard | 182 | 41 | 13,224 | 698.1 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_hypercar_halo.glb` | Cockpit, Seating & Dashboard | 51 | 19 | 6,592 | 293.7 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_executive_theater.glb` | Cockpit, Seating & Dashboard | 72 | 17 | 4,604 | 246.5 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_coachbuilt_vip_salon.glb` | Cockpit, Seating & Dashboard | 37 | 8 | 3,656 | 176.2 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `dashboard_classic.glb` | Cockpit, Seating & Dashboard | 23 | 12 | 5,576 | 161.9 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_endurance_gt3.glb` | Cockpit, Seating & Dashboard | 34 | 11 | 1,992 | 115.5 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `dashboard_luxury_gt.glb` | Cockpit, Seating & Dashboard | 13 | 6 | 2,344 | 82.3 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `steering_wheel_gt3_yoke.glb` | Cockpit, Seating & Dashboard | 24 | 18 | 1,156 | 71.1 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `steering_formula.glb` | Cockpit, Seating & Dashboard | 24 | 18 | 1,156 | 71.1 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `seat_carbon_race.glb` | Cockpit, Seating & Dashboard | 36 | 6 | 600 | 66.7 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `steering_suede_carbon.glb` | Cockpit, Seating & Dashboard | 12 | 6 | 1,396 | 55.4 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `steering_wheel_sport.glb` | Cockpit, Seating & Dashboard | 12 | 6 | 1,396 | 55.4 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `door_cards_executive.glb` | Cockpit, Seating & Dashboard | 20 | 5 | 576 | 49.5 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `door_cards_sport.glb` | Cockpit, Seating & Dashboard | 20 | 5 | 576 | 49.5 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `steering_luxury_3spoke.glb` | Cockpit, Seating & Dashboard | 8 | 4 | 1,380 | 47.0 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `roof_starlight.glb` | Cockpit, Seating & Dashboard | 4 | 3 | 1,212 | 39.7 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `seat_sport_bucket.glb` | Cockpit, Seating & Dashboard | 22 | 5 | 264 | 36.1 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `seat_executive_lounge.glb` | Cockpit, Seating & Dashboard | 20 | 4 | 240 | 32.8 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `seat_luxury_massage.glb` | Cockpit, Seating & Dashboard | 20 | 4 | 240 | 32.8 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `center_console_gt3.glb` | Cockpit, Seating & Dashboard | 7 | 6 | 768 | 31.4 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `dashboard_sport.glb` | Cockpit, Seating & Dashboard | 12 | 9 | 358 | 31.4 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `cockpit_quantum_hyperblade.glb` | Cockpit, Seating & Dashboard | 13 | 8 | 118 | 21.9 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `pedals_race.glb` | Cockpit, Seating & Dashboard | 11 | 2 | 132 | 18.2 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `center_console_executive.glb` | Cockpit, Seating & Dashboard | 7 | 5 | 172 | 16.8 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `dashboard_executive.glb` | Cockpit, Seating & Dashboard | 9 | 7 | 78 | 14.0 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |
| `dashboard_hyper_glass.glb` | Cockpit, Seating & Dashboard | 7 | 7 | 54 | 11.0 KB | Standard | **B — moderate refinement**: Alcantara/leather texture mapping, steering yoke pivot calibration |

## Powertrain Assets (35 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `turbocharger.glb` | Engine Block & Internal Assembly | 191 | 10 | 119,308 | 4.16 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `radiator.glb` | Engine Block & Internal Assembly | 123 | 12 | 88,032 | 3.56 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `cylinder-head-right.glb` | Engine Block & Internal Assembly | 367 | 9 | 116,524 | 3.54 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `cylinder-head-left.glb` | Engine Block & Internal Assembly | 367 | 9 | 116,524 | 3.54 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `v12_racing_engine_exploded.glb` | Engine Block & Internal Assembly | 252 | 23 | 53,026 | 2.05 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `crankshaft.glb` | Engine Block & Internal Assembly | 207 | 6 | 65,052 | 2.03 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine-block.glb` | Engine Block & Internal Assembly | 277 | 8 | 50,336 | 1.77 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine-cover.glb` | Engine Block & Internal Assembly | 40 | 6 | 25,856 | 1.52 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_hypercar_quartz.glb` | Engine Block & Internal Assembly | 40 | 6 | 22,208 | 1.34 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `rear_car_assembly_exploded.glb` | Engine Block & Internal Assembly | 179 | 20 | 21,826 | 1.07 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `rear_car_assembly_complete.glb` | Engine Block & Internal Assembly | 179 | 20 | 21,826 | 1.07 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `intake-manifold-left.glb` | Engine Block & Internal Assembly | 122 | 8 | 34,140 | 1.01 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `intake-manifold-right.glb` | Engine Block & Internal Assembly | 122 | 8 | 34,140 | 1.01 MB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `exhaust-header-right.glb` | Engine Block & Internal Assembly | 81 | 8 | 35,904 | 955.2 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `exhaust-header-left.glb` | Engine Block & Internal Assembly | 81 | 8 | 35,904 | 954.9 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `valve-cover-left.glb` | Engine Block & Internal Assembly | 77 | 7 | 18,236 | 712.4 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `connecting-rod.glb` | Engine Block & Internal Assembly | 29 | 6 | 21,140 | 623.7 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `valve-cover-right.glb` | Engine Block & Internal Assembly | 73 | 7 | 16,432 | 613.9 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `dry-sump.glb` | Engine Block & Internal Assembly | 110 | 7 | 15,556 | 578.3 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_w16_quad_turbo_hypersport.glb` | Engine Block & Internal Assembly | 50 | 5 | 8,292 | 471.6 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `transaxle.glb` | Engine Block & Internal Assembly | 97 | 6 | 9,044 | 469.5 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `timing-chain.glb` | Engine Block & Internal Assembly | 107 | 6 | 6,608 | 435.7 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_inline_twin_cam_turbo.glb` | Engine Block & Internal Assembly | 32 | 6 | 10,348 | 421.8 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_rotary_apex_trochoid.glb` | Engine Block & Internal Assembly | 7 | 4 | 7,932 | 381.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_f1_pneumatic_carbon_plenum.glb` | Engine Block & Internal Assembly | 15 | 4 | 9,076 | 370.5 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `piston.glb` | Engine Block & Internal Assembly | 36 | 7 | 10,968 | 358.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_supercharged_v8_shaker.glb` | Engine Block & Internal Assembly | 17 | 3 | 6,448 | 333.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `v12_racing_engine.glb` | Engine Block & Internal Assembly | 88 | 10 | 21,536 | 329.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `v12_racing_engine_complete.glb` | Engine Block & Internal Assembly | 88 | 10 | 21,536 | 329.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_boxer_twin_plenum_flat.glb` | Engine Block & Internal Assembly | 35 | 5 | 6,056 | 323.0 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_heritage_wrinkle.glb` | Engine Block & Internal Assembly | 18 | 4 | 4,612 | 253.9 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_gt3_endurance.glb` | Engine Block & Internal Assembly | 13 | 4 | 4,304 | 214.3 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_billet_skeleton.glb` | Engine Block & Internal Assembly | 19 | 3 | 3,516 | 198.9 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_stealth_vortex.glb` | Engine Block & Internal Assembly | 18 | 2 | 2,800 | 161.1 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |
| `engine_cover_exposed_itb.glb` | Engine Block & Internal Assembly | 4 | 2 | 868 | 30.4 KB | Hero | **A — major rework required**: Verify modular separation (block, heads, crankshaft, pistons, manifolds) |

## Source Archive Assets (3 Models)
| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |
|---|---|---|---|---|---|---|---|
| `fordEscortRSCosworth.glb` | Raw Extracted CAD/Mesh Model | 37 | 37 | 250,131 | 12.79 MB | Raw Source | **C — reference only**: Unprocessed source asset |
| `2015-bmw-i8_xs_car.glb` | Raw Extracted CAD/Mesh Model | 782 | 21 | 217,869 | 9.84 MB | Raw Source | **C — reference only**: Unprocessed source asset |
| `2015-bmw-i8_xs_car.glb` | Raw Extracted CAD/Mesh Model | 782 | 21 | 217,869 | 9.84 MB | Raw Source | **C — reference only**: Unprocessed source asset |
