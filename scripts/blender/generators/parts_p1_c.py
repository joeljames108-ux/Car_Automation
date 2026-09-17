# Subsystems 9 to 12 for Porsche 911 (993) Carrera Cabriolet Phase 1 (High-Density CAD)

PART_C = '''
# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 9: EXHAUST SYSTEM, HEAT EXCHANGERS & DUAL TAILPIPES
# ----------------------------------------------------------------------------

def build_993_exhaust_system_heat_exchangers_and_dual_tailpipes(parent_col, mats):
    """
    Constructs the 993 exhaust system:
    - Twin stainless steel heat exchangers (Wärmetauscher) routing exhaust headers.
    - 6 primary header runner pipes converging into collector flanges.
    - Dual ceramic catalytic converter canisters with heat shielding.
    - Crossover balance tube and oxygen lambda sensor ports.
    - Massive transverse rear crossover silencer muffler with mounting tension straps.
    - Dual polished oval stainless steel tailpipes exiting through bumper reliefs.
    """
    objs = []
    bm_exh = bmesh.new()

    for exh_sign in [-1.0, 1.0]:
        # Heat Exchanger Outer Casing (Wärmetauscher)
        mat_heat = Matrix.Translation(Vector((exh_sign * 0.360, -1.540, 0.220)))
        bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_heat @ Matrix.Diagonal(Vector((0.140, 0.360, 0.110, 1.0))))

        # Lower Cabin Heat Duct Tubes (Warm air delivery pipes routing forward)
        p_heat_duct_start = Vector((exh_sign * 0.340, -1.360, 0.230))
        p_heat_duct_end = Vector((exh_sign * 0.280, -1.180, 0.240))
        create_cylinder_between(bm_exh, p_heat_duct_start, p_heat_duct_end, radius=0.032, segments=12)

        # 3 Primary Header Runner Pipes per Bank (Converging into collector)
        for py in [-1.420, -1.540, -1.660]:
            p_head = Vector((exh_sign * 0.240, py, 0.290))
            p_coll = Vector((exh_sign * 0.350, py, 0.240))
            create_cylinder_between(bm_exh, p_head, p_coll, radius=0.021, segments=10)
            # Exhaust Flange Collar at Cylinder Head
            mat_flange = Matrix.Translation(p_head)
            bmesh.ops.create_cylinder(bm_exh, radius=0.030, depth=0.012, segments=12, matrix=mat_flange @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Catalytic Converter Canister (Between heat exchanger and muffler)
        mat_cat = Matrix.Translation(Vector((exh_sign * 0.380, -1.740, 0.260))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_exh, radius=0.065, depth=0.180, segments=16, matrix=mat_cat @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Oxygen Lambda Sensor Hex Nut & Sensor Probe
        mat_o2 = mat_cat @ Matrix.Translation(Vector((0, 0.045, 0.068))) @ Euler((math.radians(45), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_exh, radius=0.011, depth=0.028, segments=8, matrix=mat_o2)

    # Crossover Balance Tube Between Left & Right Exhaust Banks
    p_cross_l = Vector((-0.280, -1.780, 0.270))
    p_cross_r = Vector((0.280, -1.780, 0.270))
    create_cylinder_between(bm_exh, p_cross_l, p_cross_r, radius=0.018, segments=10)

    # Transverse Main Silencer Muffler (Y = -1.880m)
    mat_muffler = Matrix.Translation(Vector((0.0, -1.880, 0.290)))
    bmesh.ops.create_cylinder(bm_exh, radius=0.110, depth=0.960, segments=24, matrix=mat_muffler @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Muffler End Caps (Left & Right rounded domed caps)
    for cap_sign in [-1.0, 1.0]:
        mat_cap = Matrix.Translation(Vector((cap_sign * 0.480, -1.880, 0.290)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.112, depth=0.024, segments=20, matrix=mat_cap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Muffler Stainless Steel Tension Mounting Straps & T-Bolts
    for strap_x in [-0.280, 0.280]:
        mat_strap = Matrix.Translation(Vector((strap_x, -1.880, 0.290)))
        bmesh.ops.create_torus(bm_exh, major_radius=0.114, minor_radius=0.005, major_segments=24, minor_segments=6, matrix=mat_strap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Upper Hanger Bracket
        mat_hanger = Matrix.Translation(Vector((strap_x, -1.880, 0.415)))
        bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_hanger @ Matrix.Diagonal(Vector((0.028, 0.045, 0.040, 1.0))))

    # Dual Oval Polished Stainless Steel Exhaust Tailpipes (Y = -2.080m)
    for pipe_sign in [-1.0, 1.0]:
        px = pipe_sign * 0.440
        mat_tail = Matrix.Translation(Vector((px, -2.060, 0.240))) @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_exh, radius=0.042, depth=0.140, segments=20, matrix=mat_tail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Inner Acoustic Perforated Baffle Tube
        mat_inner = mat_tail @ Matrix.Translation(Vector((0, -0.010, 0)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.035, depth=0.120, segments=16, matrix=mat_inner @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Rolled Outer Tip Lip Flange
        mat_lip = mat_tail @ Matrix.Translation(Vector((0, -0.068, 0)))
        bmesh.ops.create_torus(bm_exh, major_radius=0.042, minor_radius=0.004, major_segments=16, minor_segments=6, matrix=mat_lip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_exh = link_obj("GEO_993_Boxer_Exhaust_System_Muffler", bm_exh, parent_col, mats["exhaust"], bevel=0.002)
    objs.append(obj_exh)
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 10: FRONT FRUNK TUB, SPARE WHEEL & BATTERY BOX
# ----------------------------------------------------------------------------

def build_993_front_frunk_tub_spare_wheel_and_battery_box(parent_col, mats):
    """
    Constructs the front luggage tub (Frunk) and accessory hardware:
    - Front passenger luggage compartment recessed tub (Y: +0.650m to +1.650m).
    - Space-saver collapsible spare wheel with securing J-bolt and wing nut.
    - 12V 74Ah Varta lead-acid battery in steel clamping tray with cable terminals.
    - Brake booster servo vacuum canister and dual-circuit fluid reservoir.
    - Canvas tool roll with leather retaining straps and wheel jack.
    """
    objs = []
    bm_frunk = bmesh.new()

    # Luggage Tub Recess (Walls & Floorpan)
    mat_tub = Matrix.Translation(Vector((0.0, 1.150, 0.450)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_tub @ Matrix.Diagonal(Vector((0.740, 0.920, 0.380, 1.0))))

    # Carpet Lining Inset Base
    mat_carpet = Matrix.Translation(Vector((0.0, 1.150, 0.270)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_carpet @ Matrix.Diagonal(Vector((0.710, 0.890, 0.024, 1.0))))

    # Spare Tire Recess Well (Front center nose, forward of tub)
    mat_spare_well = Matrix.Translation(Vector((0.0, 1.700, 0.380)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.240, depth=0.180, segments=24, matrix=mat_spare_well)

    # Collapsible Vredestein Space-Saver Spare Wheel
    mat_spare_tire = Matrix.Translation(Vector((0.0, 1.700, 0.420)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.220, depth=0.110, segments=24, matrix=mat_spare_tire)
    mat_spare_rim = Matrix.Translation(Vector((0.0, 1.700, 0.420)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.160, depth=0.115, segments=20, matrix=mat_spare_rim)

    # Center Hold-Down J-Bolt & Wing Nut
    mat_jbolt = Matrix.Translation(Vector((0.0, 1.700, 0.490)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.007, depth=0.065, segments=8, matrix=mat_jbolt)
    mat_wingnut = Matrix.Translation(Vector((0.0, 1.700, 0.520)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_wingnut @ Matrix.Diagonal(Vector((0.055, 0.014, 0.018, 1.0))))

    # 12V 74Ah Varta Battery Box & Clamping Plate
    mat_bat = Matrix.Translation(Vector((-0.240, 0.720, 0.580)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_bat @ Matrix.Diagonal(Vector((0.220, 0.260, 0.180, 1.0))))
    # Battery Terminals (Red Positive & Black Ground)
    mat_term_pos = Matrix.Translation(Vector((-0.280, 0.780, 0.680)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.010, depth=0.024, segments=8, matrix=mat_term_pos)
    mat_term_neg = Matrix.Translation(Vector((-0.200, 0.780, 0.680)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.010, depth=0.024, segments=8, matrix=mat_term_neg)

    # Vacuum Brake Booster Servo Canister (Tucked in driver cowl corner)
    mat_booster = Matrix.Translation(Vector((-0.260, 0.520, 0.620))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_frunk, radius=0.095, depth=0.110, segments=16, matrix=mat_booster)

    # Dual-Circuit Brake Fluid Reservoir with Yellow Cap
    mat_res = Matrix.Translation(Vector((-0.260, 0.540, 0.730)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.075, 0.120, 0.085, 1.0))))
    mat_res_cap = Matrix.Translation(Vector((-0.260, 0.540, 0.780)))
    bmesh.ops.create_cylinder(bm_frunk, radius=0.022, depth=0.016, segments=12, matrix=mat_res_cap)

    # Porsche Canvas Tool Roll with Straps
    mat_toolroll = Matrix.Translation(Vector((0.220, 1.480, 0.320))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_frunk, radius=0.045, depth=0.280, segments=12, matrix=mat_toolroll @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Bilstein Mechanical Scissor Luggage Jack
    mat_jack = Matrix.Translation(Vector((0.240, 1.250, 0.315)))
    bmesh.ops.create_cube(bm_frunk, size=1.0, matrix=mat_jack @ Matrix.Diagonal(Vector((0.080, 0.320, 0.060, 1.0))))

    obj_frunk = link_obj("GEO_993_Frunk_Luggage_Tub_Structure", bm_frunk, parent_col, mats["underbody"], bevel=0.003)
    objs.append(obj_frunk)
    return objs

# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 11: FRONT AUXILIARY OIL COOLER & A/C CONDENSER PACK
# ----------------------------------------------------------------------------

def build_993_front_oil_cooler_and_ac_condenser_pack(parent_col, mats):
    """
    Constructs the front fender thermal packs:
    - Front right fender auxiliary engine oil cooler heat exchanger with stone guard.
    - Front left fender A/C condenser coil and dual-speed blower fan.
    - Braided stainless steel oil supply and return lines running along right sill.
    - Oil cooler aluminum thermostat manifold block.
    """
    objs = []
    bm_coolers = bmesh.new()

    # Right Front Oil Cooler Core (Tilted to match bumper curvature)
    mat_cooler_r = Matrix.Translation(Vector((0.560, 1.740, 0.320))) @ Euler((0, math.radians(-15), math.radians(10)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_coolers, size=1.0, matrix=mat_cooler_r @ Matrix.Diagonal(Vector((0.065, 0.240, 0.190, 1.0))))

    # Stone Protection Wire Mesh Guard
    mat_guard_r = mat_cooler_r @ Matrix.Translation(Vector((0.038, 0, 0)))
    bmesh.ops.create_cube(bm_coolers, size=1.0, matrix=mat_guard_r @ Matrix.Diagonal(Vector((0.006, 0.230, 0.180, 1.0))))

    # Oil Cooler Electric Blower Fan Shroud & Impeller
    mat_fan_r = mat_cooler_r @ Matrix.Translation(Vector((-0.040, 0, 0)))
    bmesh.ops.create_cylinder(bm_coolers, radius=0.075, depth=0.035, segments=16, matrix=mat_fan_r @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left Front A/C Condenser Coil & Dual-Speed Blower Fan
    mat_cond_l = Matrix.Translation(Vector((-0.560, 1.740, 0.320))) @ Euler((0, math.radians(15), math.radians(-10)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_coolers, size=1.0, matrix=mat_cond_l @ Matrix.Diagonal(Vector((0.065, 0.240, 0.190, 1.0))))
    mat_fan_l = mat_cond_l @ Matrix.Translation(Vector((0.040, 0, 0)))
    bmesh.ops.create_cylinder(bm_coolers, radius=0.075, depth=0.040, segments=16, matrix=mat_fan_l @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # AN-12 Braided Stainless Steel Engine Oil Lines (Feed and return along right rocker sill)
    for line_z in [0.180, 0.210]:
        p_line_front = Vector((0.520, 1.680, line_z))
        p_line_rear = Vector((0.440, -1.350, line_z))
        create_cylinder_between(bm_coolers, p_line_front, p_line_rear, radius=0.011, segments=8)

        # Anodized Blue/Red Aluminum AN Hose Fitting Collars
        mat_an_front = Matrix.Translation(p_line_front)
        bmesh.ops.create_cylinder(bm_coolers, radius=0.016, depth=0.028, segments=10, matrix=mat_an_front)
        mat_an_rear = Matrix.Translation(p_line_rear)
        bmesh.ops.create_cylinder(bm_coolers, radius=0.016, depth=0.028, segments=10, matrix=mat_an_rear)

    # Thermostatic Oil Valve Manifold Block (Ahead of right rear wheel)
    mat_thermo = Matrix.Translation(Vector((0.440, -1.380, 0.220)))
    bmesh.ops.create_cube(bm_coolers, size=1.0, matrix=mat_thermo @ Matrix.Diagonal(Vector((0.075, 0.090, 0.085, 1.0))))

    obj_coolers = link_obj("GEO_993_Front_OilCooler_and_Condenser", bm_coolers, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_coolers)
    return objs

# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 12: CHASSIS PINCHWELDS, JACKING PUCKS & DRAINAGE
# ----------------------------------------------------------------------------

def build_993_chassis_pinchwelds_jacking_pucks_and_drainage(parent_col, mats):
    """
    Constructs structural body seams and underbody protection:
    - Lower rocker seam pinchwelds extending along rocker panels.
    - 4 reinforced vulcanized rubber jacking pucks positioned at factory lift points.
    - Underfloor aerodynamic air deflection scoops and drainage grommets.
    - Body sill drain grommets and stone guard chip shields.
    """
    objs = []
    bm_jacks = bmesh.new()

    for x_sign in [-1.0, 1.0]:
        # Rocker Pinchweld Seam Flange (Continuous structural edge)
        mat_seam = Matrix.Translation(Vector((x_sign * 0.740, 0.000, 0.125)))
        bmesh.ops.create_cube(bm_jacks, size=1.0, matrix=mat_seam @ Matrix.Diagonal(Vector((0.012, 1.840, 0.025, 1.0))))

        # Front & Rear Vulcanized Rubber Jacking Pucks
        mat_jack_f = Matrix.Translation(Vector((x_sign * 0.680, 0.780, 0.118)))
        bmesh.ops.create_cylinder(bm_jacks, radius=0.032, depth=0.022, segments=16, matrix=mat_jack_f)
        mat_jack_r = Matrix.Translation(Vector((x_sign * 0.680, -0.780, 0.118)))
        bmesh.ops.create_cylinder(bm_jacks, radius=0.032, depth=0.022, segments=16, matrix=mat_jack_r)

        # Jacking Point Location Arrows Stamped on Sill Lower Edge
        for ay in [0.780, -0.780]:
            mat_arrow = Matrix.Translation(Vector((x_sign * 0.730, ay, 0.145)))
            bmesh.ops.create_cone(bm_jacks, cap_ends=True, segments=3, radius1=0.014, radius2=0.0, depth=0.004, matrix=mat_arrow @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Underbody Rubber Floorpan Drain Plugs (6 grommets per side)
        for gy in [0.550, 0.250, -0.050, -0.350]:
            mat_plug = Matrix.Translation(Vector((x_sign * 0.420, gy, 0.122)))
            bmesh.ops.create_cylinder(bm_jacks, radius=0.018, depth=0.008, segments=12, matrix=mat_plug)

        # Rear Stone Guard Protective Film Clear Vinyl Patch (Ahead of rear wheel flare)
        mat_film = Matrix.Translation(Vector((x_sign * 0.760, -0.720, 0.320))) @ Euler((0, x_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_jacks, size=1.0, matrix=mat_film @ Matrix.Diagonal(Vector((0.004, 0.180, 0.220, 1.0))))

    obj_jacks = link_obj("GEO_993_Chassis_Pinchwelds_Jacking_Pucks", bm_jacks, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_jacks)
    return objs
'''
