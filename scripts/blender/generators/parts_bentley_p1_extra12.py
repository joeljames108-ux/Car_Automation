"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 12
Subsystems 28 and 29:
- Subsystem 28: Front Structural Fender Aprons & Acoustic Wheel Arch Liners
- Subsystem 29: Underbody Ground-Effect Strakes, Axle Deflectors & eLSD Cooling Scoop
"""

PART_BENTLEY_EXTRA12 = '''
# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 28: FRONT STRUCTURAL APRONS & ACOUSTIC WHEEL ARCH LINERS
# ----------------------------------------------------------------------------

def build_bentley_fender_aprons_and_liners(parent_col, mats):
    """
    Constructs high-stiffness inner fender aprons and acoustic wheel arch shielding:
    - Left & Right structural cast aluminum shock tower support aprons.
    - Diagonal fender-to-radiator support reinforcement tubular struts.
    - Molded composite acoustic wheelhouse liner shields with sound absorption fleece.
    - Wheelhouse cooling ventilation louver vents relieving aerodynamic front lift.
    """
    objs = []
    bm_aprons = bmesh.new()
    bm_liners = bmesh.new()

    # Front Shock Tower Inner Fender Aprons (Y: +1.150m to +1.750m, X = +-0.620m, Z: 0.420m to 0.720m)
    for ap_sign in [-1.0, 1.0]:
        mat_apron = Matrix.Translation(Vector((ap_sign * 0.620, 1.450, 0.580)))
        # Inner Tower Apron Wall Panel
        bmesh.ops.create_cube(bm_aprons, size=1.0, matrix=mat_apron @ Matrix.Diagonal(Vector((0.040, 0.580, 0.280, 1.0))))

        # Diagonal Strut Rod linking Shock Tower to Upper Radiator Core Support
        p_tow = Vector((ap_sign * 0.540, 1.425, 0.680))
        p_rad = Vector((ap_sign * 0.480, 2.140, 0.680))
        p_mid = (p_tow + p_rad) * 0.5
        v_strut = p_rad - p_tow
        length = v_strut.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_strut.normalized())

        mat_strut = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_aprons, radius=0.014, depth=length, segments=12, matrix=mat_strut)

        # High-Density Acoustic Fleece Sound Deadening Liners (Molded around wheel arches)
        mat_liner = Matrix.Translation(Vector((ap_sign * 0.680, 1.425, 0.480)))
        bmesh.ops.create_cylinder(bm_liners, cap_ends=False, radius=0.380, depth=0.180, segments=22, matrix=mat_liner @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Wheelhouse Pressure Relief Extraction Louvers (Top rear of front wheel arch)
        for louver_i in range(4):
            mat_louver = Matrix.Translation(Vector((ap_sign * 0.660, 1.220 + louver_i * 0.035, 0.660)))
            bmesh.ops.create_cube(bm_aprons, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((0.028, 0.022, 0.008, 1.0))))

    obj_aprons = link_obj("GEO_BENTLEY_Structural_Fender_Aprons", bm_aprons, parent_col, mats["engine_alloy"], bevel=0.0015)
    obj_liners = link_obj("GEO_BENTLEY_Acoustic_Wheelhouse_Liners", bm_liners, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_aprons, obj_liners])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 29: GROUND-EFFECT STRAKES, DEFLECTORS & ELSD COOLING SCOOP
# ----------------------------------------------------------------------------

def build_bentley_ground_effects_and_diffusers(parent_col, mats):
    """
    Constructs high-speed underbody aerodynamic ground-effect components:
    - Molded NACA cooling duct channeling ambient air directly to the rear eLSD casing.
    - Front underbody vortex generators and lateral floor edge sealing blades.
    - Rear axle curved aerodynamic wake deflectors shielding rear suspension arms.
    - Transmission tunnel acoustic and aerodynamic belly shield closure.
    """
    objs = []
    bm_aero = bmesh.new()

    # 1. Rear Differential NACA Cooling Duct (Y = -1.150m, Z = 0.170m)
    mat_naca = Matrix.Translation(Vector((0.0, -1.150, 0.172)))
    # Submerged NACA Ramp Inlet
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.320, 0.035, 1.0))))
    # Direct Air Scoop Channel to eLSD Housing
    mat_scoop = mat_naca @ Matrix.Translation(Vector((0, -0.180, 0.040)))
    bmesh.ops.create_cylinder(bm_aero, radius=0.045, depth=0.220, segments=14, matrix=mat_scoop @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Floor Edge Aerodynamic Sealing Blades (Left & Right under rocker sills)
    for blade_sign in [-1.0, 1.0]:
        mat_blade = Matrix.Translation(Vector((blade_sign * 0.740, -0.200, 0.165)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.020, 2.400, 0.035, 1.0))))

        # Rear Suspension Lower Wishbone Aerodynamic Air Deflectors (Y = -1.380m)
        mat_rdef = Matrix.Translation(Vector((blade_sign * 0.540, -1.380, 0.190)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_rdef @ Matrix.Diagonal(Vector((0.260, 0.080, 0.025, 1.0))))

    # 3. Front Underbody Vortex Generators (Forward floor, Y = +0.850m)
    for vg_i, vg_x in enumerate([-0.360, -0.180, 0.180, 0.360]):
        vg_ang = 15 if vg_x > 0 else -15
        mat_vg = Matrix.Translation(Vector((vg_x, 0.850, 0.162))) @ Euler((0, 0, math.radians(vg_ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_vg @ Matrix.Diagonal(Vector((0.008, 0.090, 0.025, 1.0))))

    obj_aero = link_obj("GEO_BENTLEY_Underbody_GroundEffect_Strakes", bm_aero, parent_col, mats["trim_black"], bevel=0.001)
    objs.append(obj_aero)
    return objs
'''
