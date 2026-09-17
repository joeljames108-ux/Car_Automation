"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part E
Subsystem 8: 5.0L Supercharged V8 Powertrain Block & 8-Speed ZF Transmission
Subsystem 9: All-Aluminum Double Wishbone Suspension & Adaptive Dynamics
"""

PART_FTYPE_E = '''
# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 8: 5.0L SUPERCHARGED V8 POWERTRAIN & 8-SPEED DRIVETRAIN
# ----------------------------------------------------------------------------

def build_jaguar_ftype_powertrain_and_drivetrain(parent_col, mats):
    """
    Constructs the 5.0L Supercharged V8 (AJ133) engine and all-aluminum drivetrain:
    - 90-degree V8 aluminum engine block situated behind front axle (Front mid-ship layout).
    - Twin Vortex Eaton Roots-type supercharger nestled inside cylinder bank vee.
    - Dual water-to-air charge air intercooler housings with embossed Jaguar script.
    - ZF 8HP70 8-speed Quickshift transmission casing and bellhousing.
    - Longitudinal propshaft connecting to rear Electronic Active Differential (EAD).
    """
    objs = []
    bm_eng = bmesh.new()
    bm_trans = bmesh.new()

    # 1. 5.0L V8 Engine Block (Y: +0.950m to +1.550m, Z = 0.280m to 0.580m)
    mat_block = Matrix.Translation(Vector((0.0, 1.250, 0.420)))
    bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_block @ Matrix.Diagonal(Vector((0.560, 0.580, 0.320, 1.0))))

    # Cylinder Head Banks (Left and Right canted at 45 degrees)
    for bx_sign in [-1.0, 1.0]:
        mat_bank = Matrix.Translation(Vector((bx_sign * 0.220, 1.250, 0.540))) @ Euler((0, bx_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_bank @ Matrix.Diagonal(Vector((0.240, 0.560, 0.160, 1.0))))

    # 2. Eaton Twin Vortex Supercharger & Dual Intercooler Coolers (Vee Center, Z = 0.650m)
    mat_sc = Matrix.Translation(Vector((0.0, 1.280, 0.650)))
    bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_sc @ Matrix.Diagonal(Vector((0.340, 0.480, 0.140, 1.0))))

    # Front Supercharger Pulley & Serpentine Belt Drive
    mat_pulley = Matrix.Translation(Vector((0.0, 1.560, 0.650)))
    bmesh.ops.create_cylinder(bm_eng, radius=0.045, depth=0.040, segments=20, matrix=mat_pulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. ZF 8-Speed Quickshift Automatic Transmission (Y: +0.350m to +0.950m, Z = 0.260m to 0.440m)
    mat_tr = Matrix.Translation(Vector((0.0, 0.680, 0.340)))
    # Bellhousing
    bmesh.ops.create_cylinder(bm_trans, radius=0.220, depth=0.220, segments=20, matrix=mat_tr @ Matrix.Translation(Vector((0, 0.240, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Gearbox Main Tunnel Body
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_tr @ Matrix.Diagonal(Vector((0.280, 0.480, 0.240, 1.0))))

    # 4. Longitudinal Propshaft (Y: -0.950m to +0.350m, Z = 0.250m)
    mat_prop = Matrix.Translation(Vector((0.0, -0.300, 0.250)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.038, depth=1.300, segments=16, matrix=mat_prop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 5. Rear Electronic Active Differential (EAD) Casing (Axle Y = -1.311m, Z = 0.320m)
    mat_diff = Matrix.Translation(Vector((0.0, -1.311, 0.320)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_diff @ Matrix.Diagonal(Vector((0.360, 0.340, 0.280, 1.0))))
    # Rear Finned Cooling Sump
    for f_i in range(5):
        y_f = (f_i - 2) * 0.035
        mat_fin = mat_diff @ Matrix.Translation(Vector((0, y_f, -0.140)))
        bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.320, 0.010, 0.035, 1.0))))

    # Half-shafts to rear wheel hubs
    for hx_sign in [-1.0, 1.0]:
        mat_half = Matrix.Translation(Vector((hx_sign * 0.450, -1.311, 0.335)))
        bmesh.ops.create_cylinder(bm_trans, radius=0.024, depth=0.550, segments=12, matrix=mat_half @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_eng = link_obj("GEO_FTYPE_AJ133_V8_Supercharged_Engine", bm_eng, parent_col, mats["engine_metal"], bevel=0.002)
    obj_trans = link_obj("GEO_FTYPE_ZF8HP_Transmission_and_EAD", bm_trans, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_eng, obj_trans])
    return objs


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 9: DOUBLE WISHBONE SUSPENSION & ADAPTIVE DAMPERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_suspension_subassemblies(parent_col, mats):
    """
    Constructs all-aluminum double wishbone front and rear suspension architecture:
    - Upper and lower forged aluminum A-arms with spherical bush mountings.
    - Adaptive Dynamics continuously variable electronic coilover dampers.
    - Front and rear hollow tubular anti-roll sway bars with drop links.
    - Cast aluminum steering knuckles and hub carriers.
    """
    objs = []
    bm_susp = bmesh.new()

    axle_locations = [
        ("Front", 1.311, 0.620, True),
        ("Rear", -1.311, 0.640, False),
    ]

    for ax_name, ay, arm_x, is_front in axle_locations:
        for sx_sign in [-1.0, 1.0]:
            # 1. Lower A-Arm Control Wishbone (Z = 0.200m)
            mat_low = Matrix.Translation(Vector((sx_sign * arm_x * 0.65, ay, 0.210)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_low @ Matrix.Diagonal(Vector((0.320, 0.240, 0.035, 1.0))))

            # 2. Upper Control Wishbone (Z = 0.420m)
            mat_up = Matrix.Translation(Vector((sx_sign * arm_x * 0.68, ay, 0.420)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_up @ Matrix.Diagonal(Vector((0.280, 0.200, 0.030, 1.0))))

            # 3. Adaptive Dynamics Coilover Spring/Damper Strut
            p_lower = Vector((sx_sign * (arm_x * 0.72), ay, 0.220))
            p_upper = Vector((sx_sign * (arm_x * 0.45), ay, 0.600))
            mid_strut = (p_lower + p_upper) * 0.5
            mat_strut = Matrix.Translation(mid_strut) @ Vector((0, 0, 1)).rotation_difference(p_upper - p_lower).to_matrix().to_4x4()

            # Damper Body Cylinder
            bmesh.ops.create_cylinder(bm_susp, radius=0.024, depth=(p_upper - p_lower).length * 0.6, segments=12, matrix=mat_strut)
            # Progressive Coil Spring Over Damper
            bmesh.ops.create_cylinder(bm_susp, radius=0.042, depth=(p_upper - p_lower).length * 0.5, segments=14, matrix=mat_strut)

            # 4. Aluminum Hub Carrier / Steering Knuckle
            mat_knuckle = Matrix.Translation(Vector((sx_sign * arm_x * 0.90, ay, 0.340)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_knuckle @ Matrix.Diagonal(Vector((0.080, 0.120, 0.240, 1.0))))

        # 5. Transverse Anti-Roll Sway Bar (Spanning between left and right lower wishbones)
        mat_sway = Matrix.Translation(Vector((0.0, ay + (0.160 if is_front else -0.160), 0.240)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.016, depth=1.120, segments=14, matrix=mat_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_susp = link_obj("GEO_FTYPE_DoubleWishbone_Suspension", bm_susp, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_susp)
    return objs
'''
