"""
Honda S2000 AP1 (2000s) Phase 17: Part H
Subsystems 33 to 36 & Master Assembly Function:
33. A/C Condenser, Aluminum Hardlines & A/C Compressor
34. Vacuum Brake Booster Servo & ABS Modulator Block
35. Cockpit Center Tunnel Console, Teardrop Billet Knob & E-Brake
36. Engine Oil Dipstick Tube, Coolant Thermostat & Accessory Drive
Master Assembly Function: build_honda_s2000_ap1_phase1()
"""

PART_S2K_H = '''
# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 33: A/C CONDENSER, COMPRESSOR & HARDLINES
# ----------------------------------------------------------------------------

def build_s2000_ac_system_and_compressor(parent_col, mats):
    """
    Constructs the compact air conditioning refrigeration system:
    - High-efficiency aluminum micro-channel A/C condenser mounted ahead of radiator (Y = +1.790m, Z = 0.380m).
    - Cylindrical aluminum desiccant receiver-drier bottle on right side frame rail.
    - Engine-driven scroll-type A/C compressor driven by serpentine belt (Right lower engine, X = +0.180m, Y = +1.020m, Z = 0.340m).
    - High and low pressure aluminum hardlines with Schrader service charging ports.
    """
    objs = []
    bm_ac = bmesh.new()

    # 1. A/C Condenser Core (Mounted immediately ahead of main radiator, Y = +1.790m, Z = 0.380m)
    mat_cond = Matrix.Translation(Vector((0.0, 1.790, 0.380)))
    bmesh.ops.create_cube(bm_ac, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.640, 0.024, 0.320, 1.0))))

    # Condenser Left and Right Aluminum Header Manifold Tubes
    for cx in [-0.325, 0.325]:
        mat_chdr = Matrix.Translation(Vector((cx, 1.790, 0.380)))
        bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.320, segments=14, matrix=mat_chdr)

    # 2. Desiccant Receiver-Drier Canister (Right Frame Rail, X = +0.380m, Y = 1.680m, Z = 0.360m)
    mat_drier = Matrix.Translation(Vector((0.380, 1.680, 0.360)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.032, depth=0.180, segments=18, matrix=mat_drier)
    # Binary Pressure Switch atop drier
    mat_psw = mat_drier @ Matrix.Translation(Vector((0, 0, 0.095)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.025, segments=10, matrix=mat_psw)

    # 3. Engine-Driven A/C Compressor (Lower Right Engine Bay, X = +0.180m, Y = 1.020m, Z = 0.340m)
    mat_comp = Matrix.Translation(Vector((0.180, 1.020, 0.340)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.055, depth=0.160, segments=18, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Magnetic Clutch & Pulley (Front of compressor, Y = +0.930m)
    mat_cpulley = mat_comp @ Matrix.Translation(Vector((0, -0.085, 0)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.062, depth=0.026, segments=20, matrix=mat_cpulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. High-Pressure Refrigerant Hardline (Compressor to Condenser)
    mat_acline = Matrix.Translation(Vector((0.280, 1.400, 0.380))) @ Euler((0, 0, math.radians(-12)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.005, depth=0.740, segments=10, matrix=mat_acline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ac = link_obj("GEO_S2K_Air_Conditioning_System", bm_ac, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_ac)
    return objs

# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 34: BRAKE BOOSTER, MASTER CYLINDER & ABS MODULATOR
# ----------------------------------------------------------------------------

def build_s2000_brake_booster_and_abs_modulator(parent_col, mats):
    """
    Constructs the high-response braking hydraulic system:
    - Large-diameter vacuum brake booster servo mounted on driver firewall (X = -0.380m, Y = +0.860m, Z = 0.540m).
    - Tandem aluminum brake master cylinder with dual-circuit translucent plastic fluid reservoir.
    - 4-Channel ABS Hydraulic Control Unit (HCU) modulator block nestled on right inner apron (X = +0.480m, Y = +1.120m, Z = 0.480m).
    - Steel hydraulic brake hardlines distributing fluid to front and rear circuits.
    """
    objs = []
    bm_brake = bmesh.new()

    # 1. Vacuum Brake Booster Diaphragm Canister (X = -0.380m, Y = 0.860m, Z = 0.540m)
    mat_bb = Matrix.Translation(Vector((-0.380, 0.860, 0.540))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_brake, radius=0.115, depth=0.085, segments=24, matrix=mat_bb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Tandem Master Cylinder (Extending forward from booster, Y = 0.760m)
    mat_mc = mat_bb @ Matrix.Translation(Vector((0, -0.080, 0)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.024, depth=0.130, segments=16, matrix=mat_mc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Master Cylinder Fluid Reservoir (Translucent plastic with max/min level lines)
    mat_mres = mat_mc @ Matrix.Translation(Vector((0, 0.010, 0.055)))
    bmesh.ops.create_cube(bm_brake, size=1.0, matrix=mat_mres @ Matrix.Diagonal(Vector((0.075, 0.125, 0.065, 1.0))))
    # Yellow Threaded Reservoir Cap
    mat_mcap = mat_mres @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.022, depth=0.014, segments=16, matrix=mat_mcap)

    # 3. 4-Channel ABS Modulator Block (Right Inner Apron, X = +0.480m, Y = +1.120m, Z = 0.480m)
    mat_abs = Matrix.Translation(Vector((0.480, 1.120, 0.480)))
    bmesh.ops.create_cube(bm_brake, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.095, 0.110, 0.095, 1.0))))
    # ABS Solenoid Valve Dome Caps (4 Solenoid Towers)
    for sxi in [-0.025, 0.025]:
        for syi in [-0.030, 0.030]:
            mat_sol = mat_abs @ Matrix.Translation(Vector((sxi, syi, 0.055)))
            bmesh.ops.create_cylinder(bm_brake, radius=0.012, depth=0.022, segments=12, matrix=mat_sol)

    # 4. Brake Fluid Hardlines traversing firewall
    mat_bline = Matrix.Translation(Vector((0.050, 0.875, 0.520)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.003, depth=0.880, segments=8, matrix=mat_bline @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_brake = link_obj("GEO_S2K_Brake_Booster_and_ABS_System", bm_brake, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_brake)
    return objs

# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 35: CENTER TUNNEL CONSOLE, SHIFT KNOB & HANDBRAKE
# ----------------------------------------------------------------------------

def build_s2000_center_console_and_shifter(parent_col, mats):
    """
    Constructs the iconic AP1 high-tunnel center console and tactile driver controls:
    - High-backbone transmission tunnel trim cover (X = 0.0m, Y: -0.650m to +0.450m, Z = 0.460m to 0.580m).
    - Leather-stitched shift boot collar nestled in brushed aluminum surround bezel.
    - Weighted spherical/teardrop machined aluminum AP1 6-speed manual shift knob with red engraved shift pattern.
    - Leather-wrapped emergency handbrake lever with aluminum release button.
    - Center storage glove box compartment with push-push latch door.
    """
    objs = []
    bm_con = bmesh.new()

    # 1. Main Center Console Tunnel Trim (Width = 0.220m, Length = 1.100m)
    mat_tun = Matrix.Translation(Vector((0.0, -0.100, 0.520)))
    bmesh.ops.create_cube(bm_con, size=1.0, matrix=mat_tun @ Matrix.Diagonal(Vector((0.210, 1.050, 0.120, 1.0))))

    # 2. Brushed Aluminum Shifter Bezel Ring (Y = +0.220m, Z = 0.585m)
    mat_sring = Matrix.Translation(Vector((0.0, 0.220, 0.585)))
    bmesh.ops.create_cylinder(bm_con, radius=0.058, depth=0.012, segments=22, matrix=mat_sring)

    # 3. Conical Gathered Leather Shift Boot
    mat_boot = Matrix.Translation(Vector((0.0, 0.220, 0.620)))
    bmesh.ops.create_cone(bm_con, segments=18, cap_ends=True, cap_tris=False, radius1=0.052, radius2=0.014, depth=0.075, matrix=mat_boot)

    # 4. AP1 Machined Aluminum 6-Speed Teardrop Shift Knob (Y = +0.220m, Z = 0.675m)
    mat_knob = Matrix.Translation(Vector((0.0, 0.220, 0.675)))
    bmesh.ops.create_cylinder(bm_con, radius=0.024, depth=0.048, segments=20, matrix=mat_knob)
    # Polished Aluminum Top Cap
    mat_kcap = mat_knob @ Matrix.Translation(Vector((0, 0, 0.022)))
    bmesh.ops.create_cylinder(bm_con, radius=0.022, depth=0.008, segments=18, matrix=mat_kcap)

    # 5. Handbrake Lever & Leather Boot (Driver side of tunnel, X = -0.065m, Y = -0.050m, Z = 0.560m)
    mat_ebrake = Matrix.Translation(Vector((-0.065, -0.050, 0.560))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_con, radius=0.014, depth=0.210, segments=14, matrix=mat_ebrake @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Aluminum Release Button
    mat_ebutton = mat_ebrake @ Matrix.Translation(Vector((0, 0.108, 0)))
    bmesh.ops.create_cylinder(bm_con, radius=0.006, depth=0.015, segments=10, matrix=mat_ebutton @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 6. Center Console Cupholder & Glove Storage Door (Y = -0.380m)
    mat_door = Matrix.Translation(Vector((0.0, -0.380, 0.582)))
    bmesh.ops.create_cube(bm_con, size=1.0, matrix=mat_door @ Matrix.Diagonal(Vector((0.170, 0.260, 0.012, 1.0))))

    obj_con = link_obj("GEO_S2K_Center_Tunnel_Console_and_Shifter", bm_con, parent_col, mats["interior_dark"], bevel=0.001)
    objs.append(obj_con)
    return objs

# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 36: OIL DIPSTICK, THERMOSTAT & ACCESSORY DRIVE
# ----------------------------------------------------------------------------

def build_s2000_engine_accessories_and_dipstick(parent_col, mats):
    """
    Constructs the engine bay accessory hardware and fluids check equipment:
    - High-visibility orange/yellow engine oil dipstick pull handle and curved guide tube.
    - Die-cast aluminum coolant thermostat housing with upper radiator hose neck.
    - Front serpentine accessory drive ribbed belt traversing crankshaft, alternator, and water pump.
    - Alternator stator casing and cooling fan fins (Left front engine bay, X = -0.160m, Y = +0.980m, Z = 0.420m).
    """
    objs = []
    bm_acc = bmesh.new()

    # 1. Engine Oil Level Dipstick (Front Right of Engine, X = +0.135m, Y = 0.720m, Z = 0.580m)
    mat_dip = Matrix.Translation(Vector((0.135, 0.720, 0.580)))
    # Guide Tube extending down to oil pan
    bmesh.ops.create_cylinder(bm_acc, radius=0.005, depth=0.340, segments=10, matrix=mat_dip @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4())
    # Pull Ring Handle
    mat_handle = mat_dip @ Matrix.Translation(Vector((0, -0.030, 0.175)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.014, depth=0.008, segments=16, matrix=mat_handle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Coolant Thermostat Housing & Upper Radiator Neck (Front Center, X = 0.0m, Y = 0.630m, Z = 0.480m)
    mat_therm = Matrix.Translation(Vector((0.0, 0.630, 0.480)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.034, depth=0.065, segments=16, matrix=mat_therm)
    # Upper Radiator Hose Outlet Spigot (Angled forward towards radiator)
    mat_spigot = mat_therm @ Matrix.Translation(Vector((0, 0.040, 0.015))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_acc, radius=0.022, depth=0.055, segments=14, matrix=mat_spigot @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. High-Output Compact Alternator (Left Front Engine, X = -0.160m, Y = 0.980m, Z = 0.420m)
    mat_alt = Matrix.Translation(Vector((-0.160, 0.980, 0.420)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.062, depth=0.135, segments=18, matrix=mat_alt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Alternator Multi-Groove Drive Pulley
    mat_apulley = mat_alt @ Matrix.Translation(Vector((0, -0.075, 0)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.038, depth=0.022, segments=18, matrix=mat_apulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Serpentine Accessory Drive Belt (Multi-ribbed rubber belt loop)
    mat_belt = Matrix.Translation(Vector((-0.040, 0.905, 0.380)))
    bmesh.ops.create_cube(bm_acc, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.320, 0.018, 0.280, 1.0))))

    obj_acc = link_obj("GEO_S2K_Engine_Accessories_and_Dipstick", bm_acc, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_acc)
    return objs

# =============================================================================
# MASTER ASSEMBLY & EXECUTION FUNCTION: HONDA S2000 AP1 (PHASE 17)
# =============================================================================

def build_honda_s2000_ap1_phase1():
    """
    Executes the comprehensive Phase 17 Class-A CAD procedural assembly of the
    Honda S2000 AP1 (2000s) Roadster across all 36 micro-engineered subsystems.
    """
    print("=" * 80)
    print("STARTING PROCEDURAL CAD GENERATION: HONDA S2000 AP1 (2000s) - PHASE 17")
    print("=" * 80)

    # 1. Clean Existing Scene Geometry
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Master Hierarchy Collection
    col_name = "Honda_S2000_AP1_Phase1"
    root_col = bpy.data.collections.get(col_name)
    if not root_col:
        root_col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(root_col)

    # 3. Initialize PBR Materials
    print("[INIT] Initializing S2000 AP1 PBR Material Palette...")
    mats = get_materials_suite()

    all_generated_objects = []

    # 1. High X-Bone Monocoque Body Shell (42 stations)
    print("[BUILD 01/36] Generating 42-Station Continuous High X-Bone Monocoque Shell...")
    objs_shell = build_s2000_monocoque_body_shell(root_col, mats)
    all_generated_objects.extend(objs_shell)

    # 2. Convertible Soft-Top Tonneau Boot & Windshield Frame
    print("[BUILD 02/40] Generating Convertible Soft-Top Tonneau & Windshield Frame...")
    objs_top = build_s2000_soft_top_and_windshield_frame(root_col, mats)
    all_generated_objects.extend(objs_top)

    # 3. Underbody High X-Bone Backbone Chassis & Enclosed Tubs
    print("[BUILD 03/40] Generating Underbody High X-Bone Chassis & Wheel Tubs...")
    objs_chassis = build_s2000_high_xbone_chassis_and_wheel_tubs(root_col, mats)
    all_generated_objects.extend(objs_chassis)

    # 4. 16-Inch AP1 5-Spoke Alloy Wheels, Brakes & Tires
    print("[BUILD 04/40] Generating 16-Inch AP1 Wheels, Potenza Tires & Disc Brakes...")
    objs_wheels = build_s2000_ap1_wheels_brakes_and_tires(root_col, mats)
    all_generated_objects.extend(objs_wheels)

    # 5. Front & Rear Fascias, Bumper Covers & AP1 Grille
    print("[BUILD 05/40] Generating Front & Rear Fascias, Bumpers & Grille Openings...")
    objs_fascia = build_s2000_polyurethane_bumpers_and_valances(root_col, mats)
    all_generated_objects.extend(objs_fascia)

    # 6. Front In-Wheel Double Wishbone Suspension & EPS Rack
    print("[BUILD 06/40] Generating Front In-Wheel Double Wishbone Suspension & Steering...")
    objs_fsusp = build_s2000_front_double_wishbone_and_eps(root_col, mats)
    all_generated_objects.extend(objs_fsusp)

    # 7. Rear Multi-Link Double Wishbone Subframe & Axles
    print("[BUILD 07/40] Generating Rear Multi-Link Double Wishbone Subframe...")
    objs_rsusp = build_s2000_rear_double_wishbone_and_subframe(root_col, mats)
    all_generated_objects.extend(objs_rsusp)

    # 8. F20C 2.0L DOHC VTEC Longitudinal Engine & 6-Speed Transmission
    print("[BUILD 08/40] Generating F20C 2.0L DOHC VTEC Engine & 6-Speed Transmission...")
    objs_eng = build_s2000_f20c_powertrain_and_transmission(root_col, mats)
    all_generated_objects.extend(objs_eng)

    # 9. Stainless Dual Exhaust System, Manifold & Resonators
    print("[BUILD 09/40] Generating Dual Stainless Exhaust System & 4-into-2-into-1 Header...")
    objs_exh = build_s2000_exhaust_system_and_dual_mufflers(root_col, mats)
    all_generated_objects.extend(objs_exh)

    # 10. Torsen Limited-Slip Differential & Finned Casing
    print("[BUILD 10/40] Generating Torsen Limited-Slip Differential & Finned Housing...")
    objs_diff = build_s2000_torsen_lsd_and_finned_casing(root_col, mats)
    all_generated_objects.extend(objs_diff)

    # 11. High-Efficiency Engine Cooling Module & Dual Electric Fans
    print("[BUILD 11/40] Generating Engine Cooling Radiator & Dual Electric Shrouds...")
    objs_rad = build_s2000_radiator_fans_and_condenser(root_col, mats)
    all_generated_objects.extend(objs_rad)

    # 12. 50-Liter Fuel Tank Assembly & Evap Canister
    print("[BUILD 12/40] Generating 50-Liter Fuel Tank & Evaporative Emissions Canister...")
    objs_tank = build_s2000_brake_plumbing_and_fuel_tank(root_col, mats)
    all_generated_objects.extend(objs_tank)

    # 13. Twin Tubular Safety Roll Hoops & Center Aero Deflector
    print("[BUILD 13/40] Generating Twin Safety Roll Hoops & Acrylic Wind Deflector...")
    objs_hoops = build_s2000_twin_safety_roll_hoops(root_col, mats)
    all_generated_objects.extend(objs_hoops)

    # 14. Cockpit Roadster Tub & Contoured Sport Bucket Seats
    print("[BUILD 14/40] Generating Cockpit Roadster Tub & High-Bolster Sport Seats...")
    objs_seats = build_s2000_cockpit_interior_and_sport_seats(root_col, mats)
    all_generated_objects.extend(objs_seats)

    # 15. Front Core Support, Hood Latches & Dual Prop Rods
    print("[BUILD 15/40] Generating Front Core Support & Dual Hood Latches...")
    objs_core = build_s2000_hood_hinges_and_radiator_support(root_col, mats)
    all_generated_objects.extend(objs_core)

    # 16. Rear Subframe Rearmost Structure, Trunk Pan & Crash Beam
    print("[BUILD 16/40] Generating Rear Trunk Pan & Aluminum Impact Crash Beam...")
    objs_trunk = build_s2000_trunk_hinges_and_rear_crash_bar(root_col, mats)
    all_generated_objects.extend(objs_trunk)

    # 17. Front Strut Tower X-Brace & Torsional Ties
    print("[BUILD 17/36] Generating Front Strut Tower Stress Bar & Torsional Braces...")
    objs_brace = build_s2000_strut_brace_and_torsional_ties(root_col, mats)
    all_generated_objects.extend(objs_brace)

    # 18. Front & Rear Anti-Roll Sway Bars
    print("[BUILD 18/36] Generating Front & Rear Tubular Anti-Roll Sway Bars...")
    objs_sway = build_s2000_front_and_rear_sway_bars(root_col, mats)
    all_generated_objects.extend(objs_sway)

    # 19. Front Brake Ram-Air Cooling Ducts
    print("[BUILD 19/36] Generating Front Brake Ram-Air Cooling Ducts & Shrouds...")
    objs_bduct = build_s2000_front_brake_cooling_ducts(root_col, mats)
    all_generated_objects.extend(objs_bduct)

    # 20. Underfloor Aero Pan & Rear Diffuser
    print("[BUILD 20/36] Generating Underfloor Aerodynamic Tray & Diffuser Strakes...")
    objs_aero = build_s2000_underfloor_aero_pan_and_diffuser(root_col, mats)
    all_generated_objects.extend(objs_aero)

    # 21. F20C Red Valve Cover Detailing & Ignition Coils
    print("[BUILD 21/36] Generating F20C Red Crackle Valve Cover & Ignition Coils...")
    objs_vc = build_s2000_f20c_valve_cover_and_ignition_coils(root_col, mats)
    all_generated_objects.extend(objs_vc)

    # 22. High-Flow Cast Aluminum Intake Manifold
    print("[BUILD 22/36] Generating High-Flow Intake Manifold & Throttle Body...")
    objs_im = build_s2000_intake_manifold_and_throttle_body(root_col, mats)
    all_generated_objects.extend(objs_im)

    # 23. Rear Axle Half-Shafts & CV Joints
    print("[BUILD 23/36] Generating Rear Axle Drive Half-Shafts & Accordion CV Boots...")
    objs_axle = build_s2000_rear_axle_halfshafts_and_cv_joints(root_col, mats)
    all_generated_objects.extend(objs_axle)

    # 24. Electronic Power Steering (EPS) Gearbox & Column
    print("[BUILD 24/36] Generating Coaxial Electronic Power Steering System...")
    objs_eps = build_s2000_electronic_power_steering_system(root_col, mats)
    all_generated_objects.extend(objs_eps)

    # 25. Floorpan Stiffening Ribs & Sill Pinchwelds
    print("[BUILD 25/36] Generating Floorpan Longitudinal Ribs & Sill Pinchwelds...")
    objs_ribs = build_s2000_floorpan_ribs_and_sill_pinchwelds(root_col, mats)
    all_generated_objects.extend(objs_ribs)

    # 26. Digital LED Instrument Binnacle & Sport Wheel
    print("[BUILD 26/36] Generating Digital LED Instrument Cluster & 3-Spoke Wheel...")
    objs_cockpit = build_s2000_digital_instrument_binnacle_and_steering_wheel(root_col, mats)
    all_generated_objects.extend(objs_cockpit)

    # 27. Clutch Hydraulic System & Slave Cylinder
    print("[BUILD 27/36] Generating Clutch Hydraulic Master/Slave Cylinder System...")
    objs_clutch = build_s2000_clutch_hydraulic_system(root_col, mats)
    all_generated_objects.extend(objs_clutch)

    # 28. 12V Lightweight Battery & Ground Straps
    print("[BUILD 28/36] Generating 12V Lightweight Battery & Ground Straps...")
    objs_bat = build_s2000_battery_and_chassis_grounds(root_col, mats)
    all_generated_objects.extend(objs_bat)

    # 29. Windshield Cowl Induction Grille & Wipers
    print("[BUILD 29/36] Generating Windshield Cowl Grille & Wiper Spindles...")
    objs_cowl = build_s2000_windshield_cowl_and_wiper_spindles(root_col, mats)
    all_generated_objects.extend(objs_cowl)

    # 30. Front Underbody Skid Plate & Air Dam
    print("[BUILD 30/36] Generating Front Underbody Skid Plate & Radiator Air Dam...")
    objs_skid = build_s2000_front_skid_plate_and_air_dam(root_col, mats)
    all_generated_objects.extend(objs_skid)

    # 31. Fuel Filler Neck & Quarter Panel Flange
    print("[BUILD 31/36] Generating Fuel Filler Neck & Quarter Panel Flange...")
    objs_fuel = build_s2000_fuel_filler_neck_and_housing(root_col, mats)
    all_generated_objects.extend(objs_fuel)

    # 32. Engine Bay Relay/Fuse Box & Harnesses
    print("[BUILD 32/36] Generating Engine Bay Fuse Box & Wiring Harness Looms...")
    objs_elec = build_s2000_fuse_box_and_engine_bay_harnesses(root_col, mats)
    all_generated_objects.extend(objs_elec)

    # 33. A/C Condenser, Compressor & Hardlines
    print("[BUILD 33/36] Generating A/C Condenser, Compressor & Refrigerant Lines...")
    objs_ac = build_s2000_ac_system_and_compressor(root_col, mats)
    all_generated_objects.extend(objs_ac)

    # 34. Brake Booster, Master Cylinder & ABS Modulator
    print("[BUILD 34/36] Generating Vacuum Brake Booster & ABS Modulator Valve Block...")
    objs_brake = build_s2000_brake_booster_and_abs_modulator(root_col, mats)
    all_generated_objects.extend(objs_brake)

    # 35. Center Tunnel Console, Shift Knob & Handbrake
    print("[BUILD 35/36] Generating Center Tunnel Console, AP1 Billet Shifter & E-Brake...")
    objs_con = build_s2000_center_console_and_shifter(root_col, mats)
    all_generated_objects.extend(objs_con)

    # 36. Engine Accessories, Dipstick & Thermostat
    print("[BUILD 36/40] Generating Oil Dipstick Tube, Thermostat & Accessory Drive...")
    objs_acc = build_s2000_engine_accessories_and_dipstick(root_col, mats)
    all_generated_objects.extend(objs_acc)

    # 37. Front Subframe Gussets & Front Tow Hook
    print("[BUILD 37/40] Generating Front Subframe Gussets & Front Tow Hook...")
    objs_gusset = build_s2000_front_subframe_gussets_and_tow_hook(root_col, mats)
    all_generated_objects.extend(objs_gusset)

    # 38. Soft-Top Mechanical Folding Bows & Latches
    print("[BUILD 38/40] Generating Soft-Top Mechanical Frame Bows & Latches...")
    objs_bow = build_s2000_soft_top_frame_bows_and_latches(root_col, mats)
    all_generated_objects.extend(objs_bow)

    # 39. Rear Bumper Lower Aero Mesh & Vortex Generators
    print("[BUILD 39/40] Generating Rear Bumper Lower Aero Mesh & Vortex Generators...")
    objs_raero = build_s2000_rear_bumper_lower_aero_and_mesh(root_col, mats)
    all_generated_objects.extend(objs_raero)

    # 40. Exhaust Hangers & Heat Shield Baffles
    print("[BUILD 40/40] Generating Exhaust Isolator Hangers & Heat Shield Baffles...")
    objs_exh_mounts = build_s2000_exhaust_hangers_and_heat_shields(root_col, mats)
    all_generated_objects.extend(objs_exh_mounts)

    # Statistical Evaluation & Verification
    total_verts = sum(len(o.data.vertices) for o in all_generated_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_generated_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print("=" * 80)
    print(f"[SUMMARY] Honda S2000 AP1 (2000s) Phase 17 Foundation Complete!")
    print(f"          Total Hierarchy Objects : {len(all_generated_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")
    print("=" * 80)

    # Preliminary Phase 17 Export
    export_targets = [
        os.path.abspath(r"E:/Car_Automation/exports/Car_Honda_S2000_AP1_Phase1.glb"),
    ]
    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Phase 17 Foundation CAD GLB -> {export_path}")
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
    print("HONDA S2000 AP1 (2000s) PHASE 17 GENERATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_honda_s2000_ap1_phase1()
'''
