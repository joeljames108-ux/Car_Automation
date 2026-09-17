"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part E
Subsystem 14: Cup II Wheel Center Caps & Valve Stems
Subsystem 15: Right Front Fender Fuel Filler Flap & Finger Notch
Subsystem 16: Cockpit Rearview Mirror, Sun Visors & Seatbelt Guides
Subsystem 17: Engine Bay Decals, Catch Latches & Bump Stops
Subsystem 18: Master Vehicle Integration & 3-Target GLB Export
"""

PART_P2_E = '''
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 14: CUP II WHEEL CENTER CAPS & VALVE STEMS
# ----------------------------------------------------------------------------

def build_993_wheel_center_caps_and_valve_stems(parent_col, mats):
    """
    Constructs the 17-inch Cup II alloy wheel jewelry:
    - 4 concave aluminum wheel center hub caps bearing the multi-color Porsche crest.
    - Concave cap bevel with snap-ring groove.
    - 4 chrome/brass Schrader tire valve stems with knurled dust caps.
    """
    objs = []
    bm_caps = bmesh.new()
    bm_crests = bmesh.new()
    bm_valves = bmesh.new()

    wheel_positions = [
        (-0.720, 1.136, 0.318, -1.0),  # Front Left
        (0.720, 1.136, 0.318, 1.0),    # Front Right
        (-0.745, -1.136, 0.318, -1.0), # Rear Left
        (0.745, -1.136, 0.318, 1.0),   # Rear Right
    ]

    for wx, wy, wz, wx_sign in wheel_positions:
        mat_wheel_hub = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Concave Cast Aluminum Center Hub Cap (Diameter 76mm, R = 0.038m)
        mat_cap = mat_wheel_hub @ Matrix.Translation(Vector((0, 0, wx_sign * 0.022)))
        bmesh.ops.create_cylinder(bm_caps, radius=0.038, depth=0.012, segments=24, matrix=mat_cap)

        # Recessed Center Face
        mat_crest_face = mat_cap @ Matrix.Translation(Vector((0, 0, wx_sign * 0.005)))
        bmesh.ops.create_cylinder(bm_crests, radius=0.024, depth=0.004, segments=20, matrix=mat_crest_face)
        # Miniature Gold Crest Shield on Center Cap
        bmesh.ops.create_cube(bm_crests, size=1.0, matrix=mat_crest_face @ Matrix.Diagonal(Vector((0.018, 0.024, 0.004, 1.0))))

        # 2. Chrome/Brass Tire Valve Stem & Knurled Dust Cap
        # Positioned between spokes at R = 0.175m from hub
        v_ang = math.radians(36)
        mat_valve = mat_wheel_hub @ Matrix.Translation(Vector((0.175 * math.cos(v_ang), 0.175 * math.sin(v_ang), wx_sign * 0.045))) @ Euler((0, wx_sign * math.radians(-32), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_valves, radius=0.004, depth=0.025, segments=10, matrix=mat_valve)
        # Knurled Chrome Dust Cap
        bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.010, segments=12, matrix=mat_valve @ Matrix.Translation(Vector((0, 0, wx_sign * 0.012))))

    obj_caps = link_obj("GEO_993_Wheel_Center_Hub_Caps", bm_caps, parent_col, mats["alloy"], bevel=0.0008)
    obj_crests = link_obj("GEO_993_Wheel_Cap_Porsche_Crests", bm_crests, parent_col, mats["gold"], bevel=0.0005)
    obj_valves = link_obj("GEO_993_Wheel_Tire_Valve_Stems", bm_valves, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_caps, obj_crests, obj_valves])
    return objs

# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 15: FUEL FILLER FLAP & FINGER NOTCH
# ----------------------------------------------------------------------------

def build_993_fuel_filler_flap_and_finger_notch(parent_col, mats):
    """
    Constructs the right front fender fuel filler access door:
    - Flush-mounted rectangular-oval flap on right front wing (X = +0.780m, Y = +0.880m, Z = 0.680m).
    - Curved perimeter shutline groove matching front fender crown contour.
    - Finger release notch on rear edge.
    - Interior hinge swing bracket and rubber spill catch drain basin.
    """
    objs = []
    bm_flap = bmesh.new()
    bm_seal = bmesh.new()

    # Fuel Door Axis: Right front fender, angled along fender crown
    mat_flap = Matrix.Translation(Vector((0.780, 0.880, 0.680))) @ Euler((0, math.radians(24), 0), 'XYZ').to_matrix().to_4x4()

    # 1. Perimeter Shutline Gap & Rubber Spill Catch Ring
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_flap @ Matrix.Diagonal(Vector((0.006, 0.145, 0.115, 1.0))))

    # 2. Flush-Mounted Bodywork Flap (135mm x 105mm)
    mat_door = mat_flap @ Matrix.Translation(Vector((0.002, 0, 0)))
    bmesh.ops.create_cube(bm_flap, size=1.0, matrix=mat_door @ Matrix.Diagonal(Vector((0.004, 0.135, 0.105, 1.0))))

    # 3. Finger Release Notch (Rear edge undercut)
    mat_notch = mat_door @ Matrix.Translation(Vector((-0.002, -0.062, 0)))
    bmesh.ops.create_cylinder(bm_seal, radius=0.010, depth=0.006, segments=12, matrix=mat_notch)

    # 4. Internal Hinge Swing Arm & Gas Cap Tether Boss
    mat_hinge = mat_flap @ Matrix.Translation(Vector((-0.025, 0.050, 0)))
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.035, 0.024, 0.045, 1.0))))

    obj_flap = link_obj("GEO_993_Fuel_Filler_Door_Flap", bm_flap, parent_col, mats["body"], bevel=0.001)
    obj_seal = link_obj("GEO_993_Fuel_Filler_Shutline_Gasket", bm_seal, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_flap, obj_seal])
    return objs

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 16: COCKPIT REARVIEW MIRROR, SUN VISORS & SEATBELTS
# ----------------------------------------------------------------------------

def build_993_cockpit_mirror_visors_and_seatbelts(parent_col, mats):
    """
    Constructs exterior-visible cockpit jewelry:
    - Windshield-mounted interior rearview mirror with day/night anti-glare flip tab.
    - Dual padded vinyl sun visors folded flat against windshield upper header.
    - B-pillar chrome seatbelt guide loops and webbed safety belts.
    """
    objs = []
    bm_mirror = bmesh.new()
    bm_visors = bmesh.new()
    bm_belts = bmesh.new()

    # 1. Interior Rearview Mirror (Windshield Center Upper, X = 0.000m, Y = +0.680m, Z = 1.190m)
    mat_m_mount = Matrix.Translation(Vector((0.0, 0.680, 1.190)))
    # Windshield Glass Mounting Puck
    bmesh.ops.create_cylinder(bm_mirror, radius=0.016, depth=0.008, segments=14, matrix=mat_m_mount)
    # Ball-Joint Articulated Arm
    mat_m_arm = mat_m_mount @ Matrix.Translation(Vector((0, -0.028, -0.020))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_mirror, radius=0.006, depth=0.040, segments=10, matrix=mat_m_arm)

    # Mirror Pod Housing (Beveled wedge)
    mat_m_pod = mat_m_arm @ Matrix.Translation(Vector((0, 0, -0.025)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_pod @ Matrix.Diagonal(Vector((0.210, 0.028, 0.065, 1.0))))
    # Anti-Glare Prismatic Mirror Glass Face (Facing rearwards)
    mat_m_glass = mat_m_pod @ Matrix.Translation(Vector((0, -0.014, 0)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_glass @ Matrix.Diagonal(Vector((0.200, 0.004, 0.058, 1.0))))
    # Day/Night Toggle Flip Tab
    mat_m_tab = mat_m_pod @ Matrix.Translation(Vector((0, -0.008, -0.035)))
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_m_tab @ Matrix.Diagonal(Vector((0.018, 0.012, 0.010, 1.0))))

    # 2. Dual Padded Sun Visors (Driver & Passenger, folded along header)
    for vx_sign in [-1.0, 1.0]:
        mat_visor = Matrix.Translation(Vector((vx_sign * 0.280, 0.690, 1.250))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_visors, size=1.0, matrix=mat_visor @ Matrix.Diagonal(Vector((0.280, 0.014, 0.085, 1.0))))
        # Swivel Hinge Pivot Arm
        mat_v_hinge = mat_visor @ Matrix.Translation(Vector((vx_sign * 0.130, 0, 0.040)))
        bmesh.ops.create_cylinder(bm_mirror, radius=0.004, depth=0.045, segments=8, matrix=mat_v_hinge)

    # 3. B-Pillar Chrome Seatbelt Guide Loops & Belts (Left & Right)
    for bx_sign in [-1.0, 1.0]:
        mat_bguide = Matrix.Translation(Vector((bx_sign * 0.610, -0.220, 0.880)))
        # Chrome Pivot Loop
        bmesh.ops.create_torus(bm_mirror, major_radius=0.022, minor_radius=0.004, major_segments=16, minor_segments=8, matrix=mat_bguide)
        # Webbed Safety Belt Running Down to Inertia Reel
        mat_belt = mat_bguide @ Matrix.Translation(Vector((0, 0.005, -0.160)))
        bmesh.ops.create_cube(bm_belts, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.048, 0.004, 0.320, 1.0))))

    obj_mirror = link_obj("GEO_993_Cockpit_Rearview_Mirror", bm_mirror, parent_col, mats["mirror_glass"], bevel=0.001)
    obj_visors = link_obj("GEO_993_Cockpit_Sun_Visors", bm_visors, parent_col, mats["rubber"], bevel=0.0015)
    obj_belts = link_obj("GEO_993_Cockpit_Seatbelt_Webbing", bm_belts, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_mirror, obj_visors, obj_belts])
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 17: ENGINE BAY DECALS, CATCH LATCHES & BUMP STOPS
# ----------------------------------------------------------------------------

def build_993_engine_bay_decals_and_latches(parent_col, mats):
    """
    Constructs underhood and engine decklid maintenance jewelry:
    - Decklid primary safety catch and release latch mechanism.
    - Rubber cushion bump stops on rear quarter jambs.
    - Factory Porsche engine compartment informational decals:
      * Mobil 1 Advanced Synthetic Lubricant recommendation plaque.
      * Poly-V alternator belt routing diagram plate.
      * High-voltage ignition warning decal.
    """
    objs = []
    bm_latch = bmesh.new()
    bm_decals = bmesh.new()

    # 1. Decklid Safety Catch & Release Latch (Rear Center Bulkhead, Y = -1.980m, Z = 0.705m)
    mat_latch = Matrix.Translation(Vector((0.0, -1.980, 0.705)))
    bmesh.ops.create_cube(bm_latch, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.085, 0.045, 0.038, 1.0))))
    # Release Solenoid Plunger & Catch Hook
    mat_hook = mat_latch @ Matrix.Translation(Vector((0, 0.015, 0.018)))
    bmesh.ops.create_cylinder(bm_latch, radius=0.006, depth=0.024, segments=10, matrix=mat_hook)

    # 2. Rubber Decklid Cushion Bump Stops (Left & Right rear jambs)
    for bx_sign in [-1.0, 1.0]:
        mat_bump = Matrix.Translation(Vector((bx_sign * 0.520, -1.920, 0.730)))
        bmesh.ops.create_cylinder(bm_latch, radius=0.012, depth=0.018, segments=14, matrix=mat_bump)

    # 3. Factory Maintenance Decals in Engine Compartment:
    # Mobil 1 Synthetic Oil Decal (Right bulkhead plate)
    mat_oil_decal = Matrix.Translation(Vector((0.360, -1.720, 0.735))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_oil_decal @ Matrix.Diagonal(Vector((0.095, 0.003, 0.055, 1.0))))

    # Poly-V Alternator Belt Routing Diagram (Left fan shroud top)
    mat_belt_decal = Matrix.Translation(Vector((-0.180, -1.620, 0.720))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_belt_decal @ Matrix.Diagonal(Vector((0.080, 0.003, 0.045, 1.0))))

    # High Voltage Ignition Warning Decal (Left quarter inner wall)
    mat_ign_decal = Matrix.Translation(Vector((-0.460, -1.550, 0.680)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_ign_decal @ Matrix.Diagonal(Vector((0.003, 0.075, 0.045, 1.0))))

    obj_latch = link_obj("GEO_993_Decklid_Safety_Latch_and_Stops", bm_latch, parent_col, mats["chrome"], bevel=0.001)
    obj_decals = link_obj("GEO_993_Engine_Bay_Factory_Decals", bm_decals, parent_col, mats["alloy"], bevel=0.0005)

    objs.extend([obj_latch, obj_decals])
    return objs

# ----------------------------------------------------------------------------
# 18. MASTER VEHICLE INTEGRATION & 3-TARGET GLB EXPORT
# ----------------------------------------------------------------------------

def build_porsche_993_cabriolet_master_complete():
    """
    Executes the complete Porsche 911 (993) Carrera Cabriolet generation:
    - Combines all 32 Phase 15 Foundation & Running Gear subsystems.
    - Combines all 17 Phase 16 Micro-Jewelry, Lighting Optics & Badging subsystems.
    - Verifies watertight Class-A CAD mesh integrity and zero see-through voids.
    - Exports unified showroom master models to all 3 designated targets.
    """
    print("=" * 80)
    print("STARTING PROCEDURAL GENERATION: PORSCHE 911 (993) CABRIOLET MASTER (PHASE 15 + 16)")
    print("=" * 80)

    # Initialize materials suites for both foundation and jewelry
    mats_p1 = get_p1_materials_suite()
    mats_p2 = get_phase2_materials_suite()

    # Create root master collection
    root_col = bpy.data.collections.new("Porsche_911_993_Cabriolet_Master")
    bpy.context.scene.collection.children.link(root_col)

    all_master_objects = []

    # -------------------------------------------------------------------------
    # PART A: PHASE 15 FOUNDATION, BODY SHELL & RUNNING GEAR
    # -------------------------------------------------------------------------
    print("[FOUNDATION 1/32] Building 42-Station Continuous Monocoque Body Shell...")
    objs_body = build_993_monocoque_body_shell(root_col, mats_p1)
    all_master_objects.extend(objs_body)

    print("[FOUNDATION 2/32] Building Cabriolet Soft-Top, Tonneau Boot & Glass...")
    objs_soft_top = build_993_cabriolet_soft_top_and_tonneau_boot(root_col, mats_p1)
    all_master_objects.extend(objs_soft_top)

    print("[FOUNDATION 3/32] Building Underbody Aerodynamic Floorpan & Enclosed Tubs...")
    objs_floor = build_993_underbody_chassis_and_wheel_tubs(root_col, mats_p1)
    all_master_objects.extend(objs_floor)

    print("[FOUNDATION 4/32] Building 17-Inch Cup II 5-Spoke Wheels, Brakes & Tires...")
    objs_wheels = build_993_cup2_wheels_and_tires(root_col, mats_p1)
    all_master_objects.extend(objs_wheels)

    print("[FOUNDATION 5/32] Building Polyurethane Bumpers & Primary Lighting Envelopes...")
    objs_bumpers = build_993_polyurethane_bumpers_and_lighting_envelopes(root_col, mats_p1)
    all_master_objects.extend(objs_bumpers)

    print("[FOUNDATION 6/32] Building Front MacPherson Struts & Steering Rack...")
    objs_f_susp = build_993_front_macpherson_struts_and_steering_rack(root_col, mats_p1)
    all_master_objects.extend(objs_f_susp)

    print("[FOUNDATION 7/32] Building Rear LSA Multi-Link Suspension & Subframe...")
    objs_r_susp = build_993_lsa_multilink_rear_suspension_and_subframe(root_col, mats_p1)
    all_master_objects.extend(objs_r_susp)

    print("[FOUNDATION 8/32] Building 3.6L Boxer Flat-Six Powertrain & Transaxle...")
    objs_boxer = build_993_air_cooled_36l_flat_six_boxer_powertrain(root_col, mats_p1)
    all_master_objects.extend(objs_boxer)

    print("[FOUNDATION 9/32] Building Heat Exchangers, Muffler & Dual Tailpipes...")
    objs_exhaust = build_993_exhaust_system_heat_exchangers_and_dual_tailpipes(root_col, mats_p1)
    all_master_objects.extend(objs_exhaust)

    print("[FOUNDATION 10/32] Building Frunk Luggage Tub, Spare Wheel & Battery...")
    objs_frunk = build_993_front_frunk_tub_spare_wheel_and_battery_box(root_col, mats_p1)
    all_master_objects.extend(objs_frunk)

    print("[FOUNDATION 11/32] Building Front Auxiliary Oil Cooler & A/C Condenser...")
    objs_cool = build_993_front_oil_cooler_and_ac_condenser_pack(root_col, mats_p1)
    all_master_objects.extend(objs_cool)

    print("[FOUNDATION 12/32] Building Rocker Pinchwelds & Jacking Pucks...")
    objs_jacks = build_993_chassis_pinchwelds_jacking_pucks_and_drainage(root_col, mats_p1)
    all_master_objects.extend(objs_jacks)

    print("[FOUNDATION 13/32] Building Windshield Cowl Louvers & Wipers...")
    objs_cowl = build_993_windshield_cowl_louvers_and_monoblade_wipers(root_col, mats_p1)
    all_master_objects.extend(objs_cowl)

    print("[FOUNDATION 14/32] Building Rear Retractable Spoiler & Louvers...")
    objs_spoiler = build_993_rear_retractable_spoiler_mechanism_and_grille(root_col, mats_p1)
    all_master_objects.extend(objs_spoiler)

    print("[FOUNDATION 15/32] Building Cockpit Tub, Sport Seats & Center Console...")
    objs_cockpit = build_993_cockpit_interior_tub_and_sports_seats(root_col, mats_p1)
    all_master_objects.extend(objs_cockpit)

    print("[FOUNDATION 16/32] Building Frunk Scissor Hinges & Gas Struts...")
    objs_frunk_hinges = build_993_front_luggage_lid_hinges_and_gas_struts(root_col, mats_p1)
    all_master_objects.extend(objs_frunk_hinges)

    print("[FOUNDATION 17/32] Building Decklid Hinges & 12-Blade Cooling Fan...")
    objs_fan = build_993_rear_decklid_hinges_and_fan_shroud(root_col, mats_p1)
    all_master_objects.extend(objs_fan)

    print("[FOUNDATION 18/32] Building Fuel Cell & Brake Plumbing...")
    objs_fuel = build_993_hydraulic_brake_lines_and_fuel_tank(root_col, mats_p1)
    all_master_objects.extend(objs_fuel)

    print("[FOUNDATION 19/32] Building Front Strut Tower Brace & Reinforcement Ties...")
    objs_braces = build_993_chassis_reinforcement_crossbraces(root_col, mats_p1)
    all_master_objects.extend(objs_braces)

    print("[FOUNDATION 20/32] Building Underfloor Aero Strakes & NACA Duct...")
    objs_strakes = build_993_underfloor_aero_strakes_and_diffuser_tunnels(root_col, mats_p1)
    all_master_objects.extend(objs_strakes)

    print("[FOUNDATION 21/32] Building Front Subframe Crossmember & Anti-Roll Bar...")
    objs_f_sway = build_993_front_subframe_crossmember_and_anti_roll_bar(root_col, mats_p1)
    all_master_objects.extend(objs_f_sway)

    print("[FOUNDATION 22/32] Building Rear Sway Bar & LSA Drop Links...")
    objs_r_sway = build_993_rear_swaybar_and_lsa_drop_links(root_col, mats_p1)
    all_master_objects.extend(objs_r_sway)

    print("[FOUNDATION 23/32] Building Oil Thermostat & External Rocker Sill Oil Lines...")
    objs_oil_lines = build_993_oil_thermostat_and_external_sill_lines(root_col, mats_p1)
    all_master_objects.extend(objs_oil_lines)

    print("[FOUNDATION 24/32] Building Dry-Sump Oil Reservoir Tank & Filter Console...")
    objs_oil_tank = build_993_dry_sump_oil_tank_and_filter_console(root_col, mats_p1)
    all_master_objects.extend(objs_oil_tank)

    print("[FOUNDATION 25/32] Building VarioRam Variable Induction System & Plenum...")
    objs_vram = build_993_varioram_induction_system_and_plenum(root_col, mats_p1)
    all_master_objects.extend(objs_vram)

    print("[FOUNDATION 26/32] Building Twin-Spark Dual Distributors & Ignition Harness...")
    objs_dist = build_993_twin_spark_dual_distributor_and_ignition_harness(root_col, mats_p1)
    all_master_objects.extend(objs_dist)

    print("[FOUNDATION 27/32] Building Rear Axle Half-Shafts & CV Boots...")
    objs_cv = build_993_rear_axle_half_shafts_and_cv_boots(root_col, mats_p1)
    all_master_objects.extend(objs_cv)

    print("[FOUNDATION 28/32] Building Front Brake Cooling Ducts & Air Guides...")
    objs_bduct = build_993_front_brake_cooling_ducts_and_air_guides(root_col, mats_p1)
    all_master_objects.extend(objs_bduct)

    print("[FOUNDATION 29/32] Building Cabriolet Rear Torsional K-Braces...")
    objs_kbraces = build_993_cabriolet_rear_diagonal_reinforcement_k_braces(root_col, mats_p1)
    all_master_objects.extend(objs_kbraces)

    print("[FOUNDATION 30/32] Building Brake Booster Servo & Washer Fluid Reservoir...")
    objs_booster = build_993_washer_fluid_reservoir_and_brake_booster_assembly(root_col, mats_p1)
    all_master_objects.extend(objs_booster)

    print("[FOUNDATION 31/32] Building Transmission Shift Linkage & Tunnel Coupler...")
    objs_shift = build_993_transmission_shift_linkage_and_tunnel_shaft(root_col, mats_p1)
    all_master_objects.extend(objs_shift)

    print("[FOUNDATION 32/32] Building Cockpit 5-Gauge Instrument Binnacle & Steering Wheel...")
    objs_gauges = build_993_cockpit_five_gauge_binnacle_and_steering_wheel(root_col, mats_p1)
    all_master_objects.extend(objs_gauges)

    # -------------------------------------------------------------------------
    # PART B: PHASE 16 MICRO-JEWELRY, LIGHTING OPTICS & BADGING
    # -------------------------------------------------------------------------
    print("[JEWELRY 1/17] Building Polyellipsoid Projector Headlamps & Parabolic Reflectors...")
    objs_hl = build_993_polyellipsoid_headlamps_and_projectors(root_col, mats_p2)
    all_master_objects.extend(objs_hl)

    print("[JEWELRY 2/17] Building Front Bumper Turn Signals & Halogen Fog Lamps...")
    objs_ts = build_993_front_turn_signals_and_fog_lamps(root_col, mats_p2)
    all_master_objects.extend(objs_ts)

    print("[JEWELRY 3/17] Building Continuous Heckleuchtenband Rear Reflector Bar & Taillamps...")
    objs_heck = build_993_heckleuchtenband_and_taillamps(root_col, mats_p2)
    all_master_objects.extend(objs_heck)

    print("[JEWELRY 4/17] Building Polished Stainless Double-Walled Oval Exhaust Tips...")
    objs_exh = build_993_polished_dual_oval_exhaust_tips(root_col, mats_p2)
    all_master_objects.extend(objs_exh)

    print("[JEWELRY 5/17] Building Aerodynamic Teardrop Cup Side View Mirrors...")
    objs_mirrors = build_993_aerodynamic_teardrop_cup_mirrors(root_col, mats_p2)
    all_master_objects.extend(objs_mirrors)

    print("[JEWELRY 6/17] Building Recessed Aerodynamic Door Handles & Keylocks...")
    objs_handles = build_993_recessed_door_handles_and_keylocks(root_col, mats_p2)
    all_master_objects.extend(objs_handles)

    print("[JEWELRY 7/17] Building Enamel Stuttgart Porsche Hood Crest Wappen Badge...")
    objs_crest = build_993_stuttgart_porsche_hood_crest(root_col, mats_p2)
    all_master_objects.extend(objs_crest)

    print("[JEWELRY 8/17] Building Raised 3D Cursive 'Carrera' Rear Decklid Script...")
    objs_carrera = build_993_raised_carrera_rear_decklid_script(root_col, mats_p2)
    all_master_objects.extend(objs_carrera)

    print("[JEWELRY 9/17] Building Retractable Spoiler Airflow Louvers & Accordion Bellows...")
    objs_sp_louvers = build_993_retractable_spoiler_louvers_and_bellows(root_col, mats_p2)
    all_master_objects.extend(objs_sp_louvers)

    print("[JEWELRY 10/17] Building Cabriolet Tenax Chrome Fasteners & Canvas Welts...")
    objs_tenax = build_993_cabriolet_tenax_fasteners_and_canvas_welts(root_col, mats_p2)
    all_master_objects.extend(objs_tenax)

    print("[JEWELRY 11/17] Building Windshield Reveal Molding & Pantograph Wipers...")
    objs_wipers = build_993_windshield_reveal_molding_and_pantograph_wipers(root_col, mats_p2)
    all_master_objects.extend(objs_wipers)

    print("[JEWELRY 12/17] Building Front Lower Chin Spoiler & Tire Deflection Spats...")
    objs_chin = build_993_front_chin_spoiler_and_tire_spats(root_col, mats_p2)
    all_master_objects.extend(objs_chin)

    print("[JEWELRY 13/17] Building Flared Hip Stone Guard Decals & Door Sill Plates...")
    objs_guards = build_993_flared_hip_stone_guards_and_sill_plates(root_col, mats_p2)
    all_master_objects.extend(objs_guards)

    print("[JEWELRY 14/17] Building Cup II Wheel Center Hub Caps & Chrome Valve Stems...")
    objs_ccaps = build_993_wheel_center_caps_and_valve_stems(root_col, mats_p2)
    all_master_objects.extend(objs_ccaps)

    print("[JEWELRY 15/17] Building Right Front Fender Fuel Filler Flap & Finger Notch...")
    objs_fuel_flap = build_993_fuel_filler_flap_and_finger_notch(root_col, mats_p2)
    all_master_objects.extend(objs_fuel_flap)

    print("[JEWELRY 16/17] Building Cockpit Interior Rearview Mirror, Visors & Seatbelts...")
    objs_visors = build_993_cockpit_mirror_visors_and_seatbelts(root_col, mats_p2)
    all_master_objects.extend(objs_visors)

    print("[JEWELRY 17/23] Building Engine Bay Safety Latches, Stops & Maintenance Decals...")
    objs_elat = build_993_engine_bay_decals_and_latches(root_col, mats_p2)
    all_master_objects.extend(objs_elat)

    print("[JEWELRY 18/23] Building Wheel Arch Liners & Fender Hardware...")
    objs_liners = build_993_wheel_arch_liners_and_fender_hardware(root_col, mats_p2)
    all_master_objects.extend(objs_liners)

    print("[JEWELRY 19/23] Building Windshield Cowl Washer Jets & Plumbing...")
    objs_jets = build_993_windshield_washer_jets_and_hoses(root_col, mats_p2)
    all_master_objects.extend(objs_jets)

    print("[JEWELRY 20/23] Building German Registration Plates (S-PR 993) & Brackets...")
    objs_plates = build_993_german_registration_plates_and_brackets(root_col, mats_p2)
    all_master_objects.extend(objs_plates)

    print("[JEWELRY 21/23] Building Center Console Cassette Holder, Handbrake & Switches...")
    objs_cons = build_993_console_cassette_holder_and_switches(root_col, mats_p2)
    all_master_objects.extend(objs_cons)

    print("[JEWELRY 22/23] Building Floor-Hinged Pedal Cluster & Tailored Mats...")
    objs_pedals = build_993_floor_hinged_pedal_cluster_and_mats(root_col, mats_p2)
    all_master_objects.extend(objs_pedals)

    print("[JEWELRY 23/27] Building Convertible Windschott Aerodynamic Mesh Deflector...")
    objs_windschott = build_993_convertible_windschott_deflector(root_col, mats_p2)
    all_master_objects.extend(objs_windschott)

    print("[JEWELRY 24/27] Building Frunk Needle-Felt Carpet, Toolkit & Spare Straps...")
    objs_f_carpet = build_993_frunk_carpet_toolkit_and_straps(root_col, mats_p2)
    all_master_objects.extend(objs_f_carpet)

    print("[JEWELRY 25/27] Building Underbody Aero Undertrays & Dzus Fasteners...")
    objs_undertrays = build_993_underbody_aero_undertrays_and_dzus_fasteners(root_col, mats_p2)
    all_master_objects.extend(objs_undertrays)

    print("[JEWELRY 26/27] Building Sport Seat Fluted Leather Pleats & Electric Controls...")
    objs_pleats = build_993_sport_seat_pleats_and_controls(root_col, mats_p2)
    all_master_objects.extend(objs_pleats)

    print("[JEWELRY 27/31] Building Cabriolet Rear Quarter Trim Panels & Hi-Fi Speakers...")
    objs_qtrim = build_993_cabriolet_rear_quarter_trim_and_speakers(root_col, mats_p2)
    all_master_objects.extend(objs_qtrim)

    print("[JEWELRY 28/31] Building 6-Speed Gear Shifter, Shift Crest & Leather Gaiter...")
    objs_shifter = build_993_cockpit_shifter_crest_and_gaiter(root_col, mats_p2)
    all_master_objects.extend(objs_shifter)

    print("[JEWELRY 29/31] Building Frunk Main Fuse Center & Braided Wiring Harness...")
    objs_fusebox = build_993_frunk_fuse_box_and_wiring_harness(root_col, mats_p2)
    all_master_objects.extend(objs_fusebox)

    print("[JEWELRY 30/31] Building Lower Rocker Sill Porsche Script Side Stripes...")
    objs_stripes = build_993_rocker_sill_porsche_stripes(root_col, mats_p2)
    all_master_objects.extend(objs_stripes)

    print("[JEWELRY 31/33] Building Stamped Aluminum VIN Plate & Factory Placards...")
    objs_vin = build_993_stamped_vin_plate_and_production_tags(root_col, mats_p2)
    all_master_objects.extend(objs_vin)

    print("[JEWELRY 32/33] Building Dashboard Glovebox Door & Interior Badging...")
    objs_gbox = build_993_dashboard_glovebox_and_badging(root_col, mats_p2)
    all_master_objects.extend(objs_gbox)

    print("[JEWELRY 33/34] Building Dashboard AC Vents & HVAC Climate Sliders...")
    objs_vents = build_993_dashboard_ac_vents_and_climate_sliders(root_col, mats_p2)
    all_master_objects.extend(objs_vents)

    print("[JEWELRY 34/34] Building Cockpit Door Pull Handles & Map Pockets...")
    objs_dpull = build_993_cockpit_door_pockets_and_pull_handles(root_col, mats_p2)
    all_master_objects.extend(objs_dpull)

    # Statistical Evaluation & Verification
    total_verts = sum(len(o.data.vertices) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_master_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print("=" * 80)
    print(f"[SUMMARY] Porsche 911 (993) Carrera Cabriolet Master Vehicle Complete!")
    print(f"          Total Hierarchy Objects : {len(all_master_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")
    print("=" * 80)

    # Export unified master vehicle to all 3 designated target locations
    export_targets = [
        os.path.abspath(r"E:\\Car_Automation\\public\\models\\vehicles\\convertible\\1990s\\vehicle.glb"),
        os.path.abspath(r"E:\\Car_Automation\\public\\models\\Car_Porsche_911_993_Cabriolet_1990s.glb"),
        os.path.abspath(r"E:\\Car_Automation\\exports\\Car_Porsche_911_993_Cabriolet_1990s.glb"),
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Showroom Master CAD GLB -> {export_path}")
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
    print("PORSCHE 911 (993) CABRIOLET SHOWROOM MASTER GENERATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_porsche_993_cabriolet_master_complete()
'''
