"""
Honda S2000 AP1 (2000s) Phase 18: Part F
Subsystems 21 to 26 & Master Showroom Assembly Function:
21. Trunk Lid Lock Cylinder & Emergency Safety Glow Handle
22. Wheel Arch Stone Guard Protective Films & Lip Flanges
23. Front Hood Latch Striker Loop & Secondary Safety Catch
24. Convertible Soft-Top Rear Deck Chrome Tonneau Snaps
25. 16-Inch AP1 Wheel Center Caps with Chrome "H" & Valve Stems
26. Engine Bay Factory VIN Chassis Plaque & Emissions Stamping
Master Assembly Function: build_honda_s2000_ap1_phase2()
"""

PART_S2K2_F = '''
# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 21: TRUNK LID LOCK CYLINDER & SAFETY CATCH
# ----------------------------------------------------------------------------

def build_s2000_trunk_lock_and_emergency_handle(parent_col, mats):
    """
    Constructs the rear trunk lid mechanical latching and release hardware:
    - Chrome trunk keylock tumbler cylinder situated to right of rear license plate (X = +0.220m, Y = -2.030m, Z = 0.520m).
    - Trunk lid lower rubber cushion bump stops absorbing closing impact.
    - Inside trunk lid interior emergency glow-in-the-dark escape release T-handle.
    """
    objs = []
    bm_tlock = bmesh.new()
    bm_tbump = bmesh.new()

    # 1. Chrome Trunk Keylock Cylinder (X = +0.220m, Y = -2.030m, Z = 0.520m)
    mat_tl = Matrix.Translation(Vector((0.220, -2.030, 0.520))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tlock, radius=0.010, depth=0.016, segments=16, matrix=mat_tl @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Keyway Slit
    bmesh.ops.create_cube(bm_tlock, size=1.0, matrix=mat_tl @ Matrix.Translation(Vector((0, -0.009, 0))) @ Matrix.Diagonal(Vector((0.002, 0.004, 0.008, 1.0))))

    # 2. Trunk Lid Rubber Cushion Bump Stops (Left & Right, X = +/- 0.540m, Y = -1.980m, Z = 0.680m)
    for bx_sign in [-1.0, 1.0]:
        mat_bump = Matrix.Translation(Vector((bx_sign * 0.540, -1.980, 0.680)))
        bmesh.ops.create_cylinder(bm_tbump, radius=0.012, depth=0.018, segments=14, matrix=mat_bump)

    # 3. Trunk Interior Emergency Glow-in-the-Dark Release T-Handle
    mat_ehandle = Matrix.Translation(Vector((0.0, -1.880, 0.740)))
    bmesh.ops.create_cylinder(bm_tlock, radius=0.004, depth=0.065, segments=8, matrix=mat_ehandle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_tlock = link_obj("GEO_S2K_Trunk_Lock_and_Emergency_Handle", bm_tlock, parent_col, mats["chrome"], bevel=0.0004)
    obj_tbump = link_obj("GEO_S2K_Trunk_Rubber_Bump_Stops", bm_tbump, parent_col, mats["trim"], bevel=0.0006)

    objs.extend([obj_tlock, obj_tbump])
    return objs

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 22: WHEEL ARCH STONE GUARDS & FLANGES
# ----------------------------------------------------------------------------

def build_s2000_wheel_arch_stone_guards(parent_col, mats):
    """
    Constructs the transparent stone-chip protective film patches:
    - Pre-cut clear urethane anti-chip protective decals ahead of rear wheel arches (X = +/- 0.810m, Y = -0.780m, Z = 0.380m).
    - Rolled inner fender lip flanges shielding tire clearance envelopes.
    """
    objs = []
    bm_guards = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        # Clear Protective Film Patch ahead of rear wheel
        mat_guard = Matrix.Translation(Vector((gx_sign * 0.812, -0.780, 0.380))) @ Euler((0, 0, gx_sign * math.radians(-5)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_guard @ Matrix.Diagonal(Vector((0.002, 0.180, 0.140, 1.0))))

        # Inner Fender Lip Flange (Front & Rear)
        for fy in [1.200, -1.200]:
            mat_flange = Matrix.Translation(Vector((gx_sign * 0.730, fy, 0.480)))
            bmesh.ops.create_cylinder(bm_guards, radius=0.345, depth=0.016, segments=20, matrix=mat_flange @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_guards = link_obj("GEO_S2K_Wheel_Arch_Stone_Guards", bm_guards, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_guards)
    return objs

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 23: HOOD LATCH STRIKER & SECONDARY SAFETY CATCH
# ----------------------------------------------------------------------------

def build_s2000_hood_latch_striker_and_catch(parent_col, mats):
    """
    Constructs the front hood locking striker and emergency safety catch:
    - Heavy-gauge steel U-bolt striker loop mounted beneath front hood leading edge (X = 0.0m, Y = +1.860m, Z = 0.585m).
    - Spring-loaded secondary safety release finger lever protruding through front grille opening.
    - Yellow zinc-dichromate plated secondary catch latch pivot mechanism.
    """
    objs = []
    bm_striker = bmesh.new()

    mat_stk = Matrix.Translation(Vector((0.0, 1.860, 0.585)))

    # 1. Hood Striker U-Bolt Loop (Diameter = 8mm, Width = 50mm)
    bmesh.ops.create_cylinder(bm_striker, radius=0.004, depth=0.050, segments=12, matrix=mat_stk @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    for sx in [-0.025, 0.025]:
        mat_leg = mat_stk @ Matrix.Translation(Vector((sx, 0, 0.018)))
        bmesh.ops.create_cylinder(bm_striker, radius=0.004, depth=0.035, segments=10, matrix=mat_leg)

    # 2. Secondary Safety Release Finger Hook Lever
    mat_hook = Matrix.Translation(Vector((0.020, 1.890, 0.560)))
    bmesh.ops.create_cube(bm_striker, size=1.0, matrix=mat_hook @ Matrix.Diagonal(Vector((0.012, 0.065, 0.020, 1.0))))

    obj_striker = link_obj("GEO_S2K_Hood_Latch_Striker_and_Catch", bm_striker, parent_col, mats["chrome"], bevel=0.0006)
    objs.append(obj_striker)
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 24: SOFT-TOP TONNEAU CHROME SNAPS & REAR FLANGE SEAL
# ----------------------------------------------------------------------------

def build_s2000_soft_top_tonneau_snaps_and_trim(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau cover attachment snaps and trim:
    - 6 Chrome mushroom-head Tenax tonneau cover securing snaps along rear deck surround (Y = -0.760m, Z = 0.835m).
    - Molded black rubber tonneau perimeter bead flange.
    """
    objs = []
    bm_snaps = bmesh.new()

    # 6 Tonneau Securing Snaps around rear cockpit curve
    snap_coords = [
        Vector((-0.580, -0.620, 0.830)),
        Vector((-0.380, -0.740, 0.835)),
        Vector((-0.140, -0.780, 0.838)),
        Vector((0.140, -0.780, 0.838)),
        Vector((0.380, -0.740, 0.835)),
        Vector((0.580, -0.620, 0.830)),
    ]

    for s_coord in snap_coords:
        mat_snap = Matrix.Translation(s_coord)
        # Chrome Mushroom Head Snap Stud
        bmesh.ops.create_cylinder(bm_snaps, radius=0.006, depth=0.008, segments=14, matrix=mat_snap)
        # Base Escutcheon Washer
        bmesh.ops.create_cylinder(bm_snaps, radius=0.010, depth=0.003, segments=14, matrix=mat_snap @ Matrix.Translation(Vector((0, 0, -0.003))))

    obj_snaps = link_obj("GEO_S2K_SoftTop_Chrome_Tonneau_Snaps", bm_snaps, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_snaps)
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 25: AP1 WHEEL CENTER CAPS & CHROME VALVE STEMS
# ----------------------------------------------------------------------------

def build_s2000_wheel_center_caps_and_valve_stems(parent_col, mats):
    """
    Constructs the authentic AP1 16-inch 5-spoke wheel center hub caps:
    - 4 Circular cast aluminum center caps (Radius = 34mm) centered in wheel hubs (X = +/- 0.740m).
    - Embossed raised chrome Honda "H" insignia in center cap face.
    - 4 Polished metal tire air inflation valve stems with knurled dust caps.
    """
    objs = []
    bm_caps = bmesh.new()
    bm_valves = bmesh.new()

    wheel_locs = [
        (Vector((-0.735, 1.200, 0.316)), -1.0),
        (Vector((0.735, 1.200, 0.316)), 1.0),
        (Vector((-0.755, -1.200, 0.316)), -1.0),
        (Vector((0.755, -1.200, 0.316)), 1.0),
    ]

    for w_pos, wx_sign in wheel_locs:
        mat_hub = Matrix.Translation(w_pos)

        # 1. Wheel Center Hub Cap Face (Radius = 0.034m, X offset = +/- 0.045m outward)
        mat_cap = mat_hub @ Matrix.Translation(Vector((wx_sign * 0.045, 0, 0)))
        bmesh.ops.create_cylinder(bm_caps, radius=0.034, depth=0.012, segments=22, matrix=mat_cap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Embossed Raised Chrome "H" Logo on Cap
        mat_ch = mat_cap @ Matrix.Translation(Vector((wx_sign * 0.007, 0, 0)))
        bmesh.ops.create_cube(bm_caps, size=1.0, matrix=mat_ch @ Matrix.Diagonal(Vector((0.004, 0.024, 0.022, 1.0))))

        # 2. Tire Air Valve Stem & Knurled Cap (Angled at 45 deg, R = 0.210m from hub center)
        v_ang = math.pi * 0.25
        vx = wx_sign * 0.035
        vy = 0.200 * math.cos(v_ang)
        vz = 0.200 * math.sin(v_ang)
        mat_valve = mat_hub @ Matrix.Translation(Vector((vx, vy, vz))) @ Euler((0, wx_sign * math.radians(-25), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_valves, radius=0.0045, depth=0.032, segments=10, matrix=mat_valve @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_caps = link_obj("GEO_S2K_Wheel_Center_Caps", bm_caps, parent_col, mats["chrome"], bevel=0.0004)
    obj_valves = link_obj("GEO_S2K_Wheel_Tire_Valve_Stems", bm_valves, parent_col, mats["chrome"], bevel=0.0002)

    objs.extend([obj_caps, obj_valves])
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 26: ENGINE BAY VIN CHASSIS PLAQUE & SERIAL NUMBERS
# ----------------------------------------------------------------------------

def build_s2000_engine_bay_vin_and_chassis_plaque(parent_col, mats):
    """
    Constructs the authentic Tochigi factory aluminum VIN chassis identification plate:
    - Stamped aluminum VIN plaque riveted onto passenger firewall / cowl (X = +0.280m, Y = +0.865m, Z = 0.680m).
    - Embossed chassis code: "JHMAP114... HONDA MOTOR CO., LTD. TOCHIGI JAPAN".
    - Dual aluminum blind pop-rivets.
    """
    objs = []
    bm_vin = bmesh.new()

    mat_vin = Matrix.Translation(Vector((0.280, 0.865, 0.680))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Stamped Aluminum VIN Data Plate (Width = 0.105m, Height = 0.055m, Thickness = 0.002m)
    bmesh.ops.create_cube(bm_vin, size=1.0, matrix=mat_vin @ Matrix.Diagonal(Vector((0.105, 0.002, 0.055, 1.0))))

    # 2. Left and Right Aluminum Blind Pop-Rivets
    for rx in [-0.046, 0.046]:
        mat_rivet = mat_vin @ Matrix.Translation(Vector((rx, -0.002, 0)))
        bmesh.ops.create_cylinder(bm_vin, radius=0.0035, depth=0.006, segments=10, matrix=mat_rivet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_vin = link_obj("GEO_S2K_Engine_Bay_VIN_Plaque", bm_vin, parent_col, mats["alloy"], bevel=0.0002)
    objs.append(obj_vin)
    return objs

# =============================================================================
# MASTER SHOWROOM VEHICLE INTEGRATION & EXPORT FUNCTION (PHASE 18)
# =============================================================================

def build_honda_s2000_ap1_phase2():
    """
    Integrates the full Phase 17 Foundation (40 Subsystems) with all Phase 18
    Micro-Detail & Jewelry (26 Subsystems) to produce the complete, showroom-grade
    Honda S2000 AP1 (2000s) master model and exports to all 3 designated GLB paths.
    """
    print("=" * 80)
    print("STARTING FULL SHOWROOM CAD INTEGRATION: HONDA S2000 AP1 (2000s) - PHASE 18")
    print("=" * 80)

    # 1. Clean Existing Scene Geometry
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Master Collection
    col_name = "Honda_S2000_AP1_2000s_Master"
    root_col = bpy.data.collections.get(col_name)
    if not root_col:
        root_col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(root_col)

    # 3. Initialize Material Palettes
    print("[INIT] Initializing Phase 17 & Phase 18 Unified Material Suites...")
    from generate_honda_s2000_ap1_phase1 import get_materials_suite as get_p1_mats
    mats_p1 = get_p1_mats()
    mats_p2 = get_jewelry_materials_suite()

    all_master_objects = []

    # Import Foundation Builders from Phase 17
    from generate_honda_s2000_ap1_phase1 import (
        build_s2000_monocoque_body_shell,
        build_s2000_soft_top_and_windshield_frame,
        build_s2000_high_xbone_chassis_and_wheel_tubs,
        build_s2000_ap1_wheels_brakes_and_tires,
        build_s2000_polyurethane_bumpers_and_valances,
        build_s2000_front_double_wishbone_and_eps,
        build_s2000_rear_double_wishbone_and_subframe,
        build_s2000_f20c_powertrain_and_transmission,
        build_s2000_exhaust_system_and_dual_mufflers,
        build_s2000_torsen_lsd_and_finned_casing,
        build_s2000_radiator_fans_and_condenser,
        build_s2000_brake_plumbing_and_fuel_tank,
        build_s2000_twin_safety_roll_hoops,
        build_s2000_cockpit_interior_and_sport_seats,
        build_s2000_hood_hinges_and_radiator_support,
        build_s2000_trunk_hinges_and_rear_crash_bar,
        build_s2000_strut_brace_and_torsional_ties,
        build_s2000_front_and_rear_sway_bars,
        build_s2000_front_brake_cooling_ducts,
        build_s2000_underfloor_aero_pan_and_diffuser,
        build_s2000_f20c_valve_cover_and_ignition_coils,
        build_s2000_intake_manifold_and_throttle_body,
        build_s2000_rear_axle_halfshafts_and_cv_joints,
        build_s2000_electronic_power_steering_system,
        build_s2000_floorpan_ribs_and_sill_pinchwelds,
        build_s2000_digital_instrument_binnacle_and_steering_wheel,
        build_s2000_clutch_hydraulic_system,
        build_s2000_battery_and_chassis_grounds,
        build_s2000_windshield_cowl_and_wiper_spindles,
        build_s2000_front_skid_plate_and_air_dam,
        build_s2000_fuel_filler_neck_and_housing,
        build_s2000_fuse_box_and_engine_bay_harnesses,
        build_s2000_ac_system_and_compressor,
        build_s2000_brake_booster_and_abs_modulator,
        build_s2000_center_console_and_shifter,
        build_s2000_engine_accessories_and_dipstick,
        build_s2000_front_subframe_gussets_and_tow_hook,
        build_s2000_soft_top_frame_bows_and_latches,
        build_s2000_rear_bumper_lower_aero_and_mesh,
        build_s2000_exhaust_hangers_and_heat_shields,
    )

    print("[MASTER BUILD] Executing Phase 17 Foundation CAD Subsystems (1 to 40)...")
    all_master_objects.extend(build_s2000_monocoque_body_shell(root_col, mats_p1))
    all_master_objects.extend(build_s2000_soft_top_and_windshield_frame(root_col, mats_p1))
    all_master_objects.extend(build_s2000_high_xbone_chassis_and_wheel_tubs(root_col, mats_p1))
    all_master_objects.extend(build_s2000_ap1_wheels_brakes_and_tires(root_col, mats_p1))
    all_master_objects.extend(build_s2000_polyurethane_bumpers_and_valances(root_col, mats_p1))
    all_master_objects.extend(build_s2000_front_double_wishbone_and_eps(root_col, mats_p1))
    all_master_objects.extend(build_s2000_rear_double_wishbone_and_subframe(root_col, mats_p1))
    all_master_objects.extend(build_s2000_f20c_powertrain_and_transmission(root_col, mats_p1))
    all_master_objects.extend(build_s2000_exhaust_system_and_dual_mufflers(root_col, mats_p1))
    all_master_objects.extend(build_s2000_torsen_lsd_and_finned_casing(root_col, mats_p1))
    all_master_objects.extend(build_s2000_radiator_fans_and_condenser(root_col, mats_p1))
    all_master_objects.extend(build_s2000_brake_plumbing_and_fuel_tank(root_col, mats_p1))
    all_master_objects.extend(build_s2000_twin_safety_roll_hoops(root_col, mats_p1))
    all_master_objects.extend(build_s2000_cockpit_interior_and_sport_seats(root_col, mats_p1))
    all_master_objects.extend(build_s2000_hood_hinges_and_radiator_support(root_col, mats_p1))
    all_master_objects.extend(build_s2000_trunk_hinges_and_rear_crash_bar(root_col, mats_p1))
    all_master_objects.extend(build_s2000_strut_brace_and_torsional_ties(root_col, mats_p1))
    all_master_objects.extend(build_s2000_front_and_rear_sway_bars(root_col, mats_p1))
    all_master_objects.extend(build_s2000_front_brake_cooling_ducts(root_col, mats_p1))
    all_master_objects.extend(build_s2000_underfloor_aero_pan_and_diffuser(root_col, mats_p1))
    all_master_objects.extend(build_s2000_f20c_valve_cover_and_ignition_coils(root_col, mats_p1))
    all_master_objects.extend(build_s2000_intake_manifold_and_throttle_body(root_col, mats_p1))
    all_master_objects.extend(build_s2000_rear_axle_halfshafts_and_cv_joints(root_col, mats_p1))
    all_master_objects.extend(build_s2000_electronic_power_steering_system(root_col, mats_p1))
    all_master_objects.extend(build_s2000_floorpan_ribs_and_sill_pinchwelds(root_col, mats_p1))
    all_master_objects.extend(build_s2000_digital_instrument_binnacle_and_steering_wheel(root_col, mats_p1))
    all_master_objects.extend(build_s2000_clutch_hydraulic_system(root_col, mats_p1))
    all_master_objects.extend(build_s2000_battery_and_chassis_grounds(root_col, mats_p1))
    all_master_objects.extend(build_s2000_windshield_cowl_and_wiper_spindles(root_col, mats_p1))
    all_master_objects.extend(build_s2000_front_skid_plate_and_air_dam(root_col, mats_p1))
    all_master_objects.extend(build_s2000_fuel_filler_neck_and_housing(root_col, mats_p1))
    all_master_objects.extend(build_s2000_fuse_box_and_engine_bay_harnesses(root_col, mats_p1))
    all_master_objects.extend(build_s2000_ac_system_and_compressor(root_col, mats_p1))
    all_master_objects.extend(build_s2000_brake_booster_and_abs_modulator(root_col, mats_p1))
    all_master_objects.extend(build_s2000_center_console_and_shifter(root_col, mats_p1))
    all_master_objects.extend(build_s2000_engine_accessories_and_dipstick(root_col, mats_p1))
    all_master_objects.extend(build_s2000_front_subframe_gussets_and_tow_hook(root_col, mats_p1))
    all_master_objects.extend(build_s2000_soft_top_frame_bows_and_latches(root_col, mats_p1))
    all_master_objects.extend(build_s2000_rear_bumper_lower_aero_and_mesh(root_col, mats_p1))
    all_master_objects.extend(build_s2000_exhaust_hangers_and_heat_shields(root_col, mats_p1))

    print("[MASTER BUILD] Executing Phase 18 Micro-Detail & Jewelry Subsystems (1 to 26)...")
    # 1. Projector Headlights
    all_master_objects.extend(build_s2000_ap1_projector_headlights(root_col, mats_p2))
    # 2. Triple-Cluster Taillights
    all_master_objects.extend(build_s2000_ap1_triple_cluster_taillights(root_col, mats_p2))
    # 3. Polished Exhaust Tips
    all_master_objects.extend(build_s2000_ap1_polished_exhaust_tips(root_col, mats_p2))
    # 4. Side View Mirrors
    all_master_objects.extend(build_s2000_ap1_side_view_mirrors(root_col, mats_p2))
    # 5. Exterior Door Handles
    all_master_objects.extend(build_s2000_door_handles_and_key_cylinders(root_col, mats_p2))
    # 6. Honda Front & Rear Badges
    all_master_objects.extend(build_s2000_honda_front_and_rear_h_badges(root_col, mats_p2))
    # 7. S2000 Fender Badges
    all_master_objects.extend(build_s2000_fender_script_badges(root_col, mats_p2))
    # 8. Third Brake Lamp
    all_master_objects.extend(build_s2000_high_mount_third_brake_lamp(root_col, mats_p2))
    # 9. Wiper Arms & Blades
    all_master_objects.extend(build_s2000_windshield_wiper_arms_and_blades(root_col, mats_p2))
    # 10. Front Side Markers
    all_master_objects.extend(build_s2000_front_bumper_side_markers(root_col, mats_p2))
    # 11. Rear Defroster Window
    all_master_objects.extend(build_s2000_rear_window_defroster_grid(root_col, mats_p2))
    # 12. License Plates & Frames
    all_master_objects.extend(build_s2000_license_plates_and_frames(root_col, mats_p2))
    # 13. Rearview Mirror & Sun Visors
    all_master_objects.extend(build_s2000_rearview_mirror_and_sun_visors(root_col, mats_p2))
    # 14. Beltline Weatherstripping
    all_master_objects.extend(build_s2000_beltline_weatherstripping_and_seals(root_col, mats_p2))
    # 15. Front Chin Lip Spoiler
    all_master_objects.extend(build_s2000_front_chin_spoiler_and_spats(root_col, mats_p2))
    # 16. Rear Decklid Lip Spoiler
    all_master_objects.extend(build_s2000_rear_decklid_ducktail_spoiler(root_col, mats_p2))
    # 17. Inner Fender Liners
    all_master_objects.extend(build_s2000_inner_fender_liners_and_clips(root_col, mats_p2))
    # 18. Engine Bay Decals & Sensors
    all_master_objects.extend(build_s2000_engine_bay_decals_and_sensors(root_col, mats_p2))
    # 19. Drilled Sport Pedals
    all_master_objects.extend(build_s2000_sport_pedals_and_footrest(root_col, mats_p2))
    # 20. Steering Wheel Emblem & Radio Door
    all_master_objects.extend(build_s2000_steering_wheel_emblem_and_radio_door(root_col, mats_p2))
    # 21. Trunk Lock & Emergency Release
    all_master_objects.extend(build_s2000_trunk_lock_and_emergency_handle(root_col, mats_p2))
    # 22. Wheel Arch Stone Guards
    all_master_objects.extend(build_s2000_wheel_arch_stone_guards(root_col, mats_p2))
    # 23. Hood Latch Striker
    all_master_objects.extend(build_s2000_hood_latch_striker_and_catch(root_col, mats_p2))
    # 24. Soft-Top Tonneau Snaps
    all_master_objects.extend(build_s2000_soft_top_tonneau_snaps_and_trim(root_col, mats_p2))
    # 25. Wheel Center Caps & Valve Stems
    all_master_objects.extend(build_s2000_wheel_center_caps_and_valve_stems(root_col, mats_p2))
    # 26. VIN Chassis Plaque
    all_master_objects.extend(build_s2000_engine_bay_vin_and_chassis_plaque(root_col, mats_p2))
    # 27. Headlamp Washers
    all_master_objects.extend(build_s2000_headlamp_washers(root_col, mats_p2))
    # 28. Hood Washer Nozzles
    all_master_objects.extend(build_s2000_hood_washer_nozzles(root_col, mats_p2))
    # 29. Hood Insulation Pad
    all_master_objects.extend(build_s2000_hood_insulation_pad(root_col, mats_p2))
    # 30. Rotor Cooling Vanes
    all_master_objects.extend(build_s2000_brake_rotor_cooling_vanes(root_col, mats_p2))
    # 31. Caliper Crossover Lines
    all_master_objects.extend(build_s2000_caliper_hydraulic_crossover_lines(root_col, mats_p2))
    # 32. Front Air Deflector Vanes
    all_master_objects.extend(build_s2000_front_air_deflector_vanes(root_col, mats_p2))
    # 33. Hazard Switch & Clock
    all_master_objects.extend(build_s2000_hazard_switch_and_clock(root_col, mats_p2))
    # 34. Passenger Airbag & Compartment
    all_master_objects.extend(build_s2000_passenger_airbag_and_secret_compartment(root_col, mats_p2))
    # 35. 12V Accessory Socket
    all_master_objects.extend(build_s2000_auxiliary_power_socket(root_col, mats_p2))
    # 36. Soft-Top Internal Straps
    all_master_objects.extend(build_s2000_soft_top_internal_straps_and_flaps(root_col, mats_p2))
    # 37. Jacking Pucks & Scuppers
    all_master_objects.extend(build_s2000_jacking_pucks_and_sill_scuppers(root_col, mats_p2))
    # 38. JDM Side Winkers
    all_master_objects.extend(build_s2000_jdm_fender_side_winkers(root_col, mats_p2))
    # 39. Door Sill Treadplates
    all_master_objects.extend(build_s2000_door_sill_treadplates(root_col, mats_p2))
    # 40. Underbody Conduit Bundle
    all_master_objects.extend(build_s2000_underbody_conduit_bundle(root_col, mats_p2))
    # 41. Trunk Tool Kit & Jack
    all_master_objects.extend(build_s2000_trunk_tool_kit_and_jack(root_col, mats_p2))
    # 42. Tweeter Speakers & Demister Vents
    all_master_objects.extend(build_s2000_tweeter_speakers_and_defroster_vents(root_col, mats_p2))
    # 43. Fuel Door Latch Mechanism
    all_master_objects.extend(build_s2000_fuel_door_latch_mechanism(root_col, mats_p2))
    # 44. Undertray Service Flaps
    all_master_objects.extend(build_s2000_undertray_service_flaps(root_col, mats_p2))
    # 45. Radiator Upper Mounts
    all_master_objects.extend(build_s2000_radiator_upper_mounts(root_col, mats_p2))
    # 46. Rear Towing Port
    all_master_objects.extend(build_s2000_rear_towing_cover_and_eyelet(root_col, mats_p2))
    # 47. Map Lamps & Visor Clips
    all_master_objects.extend(build_s2000_map_lamps_and_visor_clips(root_col, mats_p2))
    # 48. Trunk Carpet & Spare Spinner
    all_master_objects.extend(build_s2000_trunk_carpet_and_spare_spinner(root_col, mats_p2))
    # 49. Shifter Trim Ring Screws
    all_master_objects.extend(build_s2000_shifter_trim_ring_screws(root_col, mats_p2))
    # 50. License Lamp Wiring Grommets
    all_master_objects.extend(build_s2000_license_lamp_wiring_grommets(root_col, mats_p2))
    # 51. Ignition Key Cylinder
    all_master_objects.extend(build_s2000_ignition_cylinder_and_bezel(root_col, mats_p2))
    # 52. Carpet Heel Pad
    all_master_objects.extend(build_s2000_carpet_heel_pad(root_col, mats_p2))
    # 53. Hood Leveling Cushions
    all_master_objects.extend(build_s2000_hood_leveling_cushions(root_col, mats_p2))
    # 54. Windshield Ceramic Frit Mask
    all_master_objects.extend(build_s2000_windshield_ceramic_frit_mask(root_col, mats_p2))
    # 55. License Plate Overhead Lamps
    all_master_objects.extend(build_s2000_license_plate_lamps(root_col, mats_p2))
    # 56. Hood Sealing Gaskets
    all_master_objects.extend(build_s2000_hood_sealing_gaskets(root_col, mats_p2))
    # 57. Exhaust Heat Shield Embossing
    all_master_objects.extend(build_s2000_exhaust_heat_shield_embossing(root_col, mats_p2))

    # Comprehensive Statistical Verification
    total_verts = sum(len(o.data.vertices) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print("=" * 80)
    print(f"[SUMMARY] Honda S2000 AP1 (2000s) Master Showroom Model Complete!")
    print(f"          Total Hierarchy Objects : {len(all_master_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")
    print("=" * 80)

    # Multi-Target Master GLB Export
    export_targets = [
        os.path.abspath(r"E:/Car_Automation/public/models/vehicles/convertible/2000s/vehicle.glb"),
        os.path.abspath(r"E:/Car_Automation/public/models/Car_Honda_S2000_AP1_2000s.glb"),
        os.path.abspath(r"E:/Car_Automation/exports/Car_Honda_S2000_AP1_2000s.glb"),
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Master Showroom Vehicle GLB -> {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
        print(f"         Export complete! File size: {file_size_mb:.2f} MB")

    print("=" * 80)
    print("HONDA S2000 AP1 (2000s) PHASE 18 GENERATION & INTEGRATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_honda_s2000_ap1_phase2()
'''
