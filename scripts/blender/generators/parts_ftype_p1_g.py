"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part G
Subsystems 12 to 16:
- Subsystem 12: Active Sport Exhaust Headers, High-Flow Resonator & Rear Valved Muffler
- Subsystem 13: Front Radiator Core, Twin Oil Coolers & Supercharger Heat Exchanger
- Subsystem 14: Aluminum Strut Tower Cross-Bracing & Engine Bay Bulkhead
- Subsystem 15: Aerodynamic Polyurethane Side Skirt Ground Effects
- Subsystem 16: Structural Aluminum Crash Beams & Tow Hook Receivers
"""

PART_FTYPE_G = '''
# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 12: ACTIVE SPORT EXHAUST SYSTEM & VALVED MUFFLER
# ----------------------------------------------------------------------------

def build_jaguar_ftype_exhaust_plumbing(parent_col, mats):
    """
    Constructs the quad-pipe active sport exhaust plumbing:
    - Dual hydroformed stainless steel 4-into-1 exhaust headers flanking V8 engine.
    - Twin catalytic converter cannisters beneath front footwells.
    - Central X-pipe resonator equalizing exhaust backpressure pulses.
    - Transverse rear active valved muffler canister located beneath rear bumper.
    - 4 individual connector pipes feeding into the outboard quad tips.
    """
    objs = []
    bm_exh = bmesh.new()

    # 1. Dual Exhaust Headers (Left and Right of engine block)
    for hx_sign in [-1.0, 1.0]:
        mat_hdr = Matrix.Translation(Vector((hx_sign * 0.320, 1.250, 0.380)))
        bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((0.080, 0.440, 0.120, 1.0))))

        # Catalytic Converter Canisters (Y = +0.700m, Z = 0.220m)
        mat_cat = Matrix.Translation(Vector((hx_sign * 0.280, 0.700, 0.220)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.065, depth=0.280, segments=16, matrix=mat_cat @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Central Twin Exhaust Pipes & X-Pipe (Y: -0.800m to +0.550m, Z = 0.190m)
    for px_sign in [-1.0, 1.0]:
        mat_pipe = Matrix.Translation(Vector((px_sign * 0.140, -0.150, 0.190)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.035, depth=1.350, segments=14, matrix=mat_pipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Resonator Box (Y = -0.300m, Z = 0.190m)
    mat_res = Matrix.Translation(Vector((0.0, -0.300, 0.190)))
    bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.360, 0.320, 0.090, 1.0))))

    # 3. Transverse Rear Valved Silencer Muffler (Y = -1.820m, Z = 0.260m)
    mat_muff = Matrix.Translation(Vector((0.0, -1.820, 0.260)))
    bmesh.ops.create_cylinder(bm_exh, radius=0.110, depth=0.980, segments=20, matrix=mat_muff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 4 Connector Pipes Feeding into Quad Outlets (2 per side)
    for qx_sign in [-1.0, 1.0]:
        for q_sub in [-0.045, 0.045]:
            mat_qpipe = Matrix.Translation(Vector((qx_sign * 0.620 + q_sub, -1.980, 0.250)))
            bmesh.ops.create_cylinder(bm_exh, radius=0.038, depth=0.280, segments=14, matrix=mat_qpipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_exh = link_obj("GEO_FTYPE_Sport_Exhaust_System", bm_exh, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_exh)
    return objs


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 13: COOLING RADIATORS & SUPERCHARGER HEAT EXCHANGERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_cooling_pack(parent_col, mats):
    """
    Constructs the multi-tier automotive cooling assembly:
    - Primary heavy-duty engine coolant aluminum radiator.
    - Low-temperature auxiliary radiator for water-to-air supercharger intercoolers.
    - Air conditioning condenser and twin auxiliary engine oil coolers in lower bumper corners.
    - Dual electric puller cooling fans with aerodynamic shrouds.
    """
    objs = []
    bm_rad = bmesh.new()

    # 1. Main Engine Radiator & Supercharger Heat Exchanger (Y = +1.880m, Z = 0.440m)
    mat_rad = Matrix.Translation(Vector((0.0, 1.880, 0.440))) @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Radiator Core Stacking (Finned Aluminum Core)
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.740, 0.060, 0.420, 1.0))))
    # Upper & Lower End Tanks
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Translation(Vector((0, 0, 0.220))) @ Matrix.Diagonal(Vector((0.760, 0.075, 0.050, 1.0))))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Translation(Vector((0, 0, -0.220))) @ Matrix.Diagonal(Vector((0.760, 0.075, 0.050, 1.0))))

    # 2. Dual Electric Puller Fan Shrouds (Behind radiator)
    for fx_sign in [-1.0, 1.0]:
        mat_fan = mat_rad @ Matrix.Translation(Vector((fx_sign * 0.185, -0.050, 0)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.160, depth=0.035, segments=20, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Outer Auxiliary Oil Coolers (In front bumper shark gills, X = +/- 0.680m, Y = +1.980m)
    for ox_sign in [-1.0, 1.0]:
        mat_oil = Matrix.Translation(Vector((ox_sign * 0.680, 1.980, 0.360))) @ Euler((math.radians(8), ox_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_oil @ Matrix.Diagonal(Vector((0.200, 0.045, 0.150, 1.0))))

    obj_rad = link_obj("GEO_FTYPE_Cooling_Module_and_Fans", bm_rad, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_rad)
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 14: STRUT TOWER BRACES & ENGINE BAY BULKHEAD
# ----------------------------------------------------------------------------

def build_jaguar_ftype_structural_bracing(parent_col, mats):
    """
    Constructs high-rigidity structural aluminum reinforcements:
    - Cast aluminum front shock tower cross-brace (V-brace connecting towers to firewall).
    - Front hydroformed crash structure horns and radiator support core.
    - Rear axle subframe diagonal cross-ties.
    """
    objs = []
    bm_brace = bmesh.new()

    # 1. Front V-Strut Tower Cross-Brace (Over engine supercharger)
    # Towers at X = +/- 0.580m, Y = +1.280m, Z = 0.720m to Firewall Center (X = 0, Y = +0.820m, Z = 0.810m)
    p_firewall = Vector((0.0, 0.820, 0.810))
    for bx_sign in [-1.0, 1.0]:
        p_tower = Vector((bx_sign * 0.580, 1.280, 0.720))
        mid_b = (p_tower + p_firewall) * 0.5
        mat_v = Matrix.Translation(mid_b) @ Vector((0, 0, 1)).rotation_difference(p_firewall - p_tower).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_brace, radius=0.018, depth=(p_firewall - p_tower).length, segments=14, matrix=mat_v)

    # Lateral Tower Tie Bar (Spanning directly between towers)
    mat_lat = Matrix.Translation(Vector((0.0, 1.280, 0.720)))
    bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=1.160, segments=14, matrix=mat_lat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Crash Horns & Energy Absorber Boxes (Y = +1.950m to +2.180m, Z = 0.380m)
    for cx_sign in [-1.0, 1.0]:
        mat_horn = Matrix.Translation(Vector((cx_sign * 0.480, 2.060, 0.380)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_horn @ Matrix.Diagonal(Vector((0.100, 0.220, 0.120, 1.0))))

    # Transverse Bumper Crash Beam (Aluminum Box Beam across front)
    mat_beam = Matrix.Translation(Vector((0.0, 2.160, 0.380)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_beam @ Matrix.Diagonal(Vector((1.240, 0.080, 0.110, 1.0))))

    obj_brace = link_obj("GEO_FTYPE_Chassis_Bracing_and_Crash_Beams", bm_brace, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_brace)
    return objs


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 15: AERODYNAMIC SIDE SKIRTS & GROUND EFFECTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_aerodynamic_side_skirts(parent_col, mats):
    """
    Constructs the sculpted polyurethane aerodynamic rocker side skirts:
    - Left and right low-drag side skirts spanning between front and rear wheel arches (Y: -1.050m to +1.050m).
    - Flared aerodynamic flick/strake ahead of the rear wheel arch to optimize flow around wide rear tires.
    - Integrated under-door stone guard trim and jacking point pads.
    """
    objs = []
    bm_skirts = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.880
        # Main Side Skirt Runner (Y = 0.000m, Z = 0.140m)
        mat_sk = Matrix.Translation(Vector((sx, 0.000, 0.145)))
        bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_sk @ Matrix.Diagonal(Vector((0.070, 2.100, 0.038, 1.0))))

        # Rear Aero Flick (Ahead of rear wheel arch, Y = -0.920m)
        mat_flick = Matrix.Translation(Vector((sx_sign * 0.920, -0.920, 0.170))) @ Euler((0, sx_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_flick @ Matrix.Diagonal(Vector((0.025, 0.220, 0.090, 1.0))))

        # Jacking Point Reinforcement Pads (Front and Rear of sill)
        for jp_y in [0.950, -0.950]:
            mat_pad = Matrix.Translation(Vector((sx_sign * 0.840, jp_y, 0.125)))
            bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.060, 0.090, 0.018, 1.0))))

    obj_skirts = link_obj("GEO_FTYPE_Aerodynamic_Side_Skirts", bm_skirts, parent_col, mats["gloss_black"], bevel=0.0012)
    objs.append(obj_skirts)
    return objs
'''
