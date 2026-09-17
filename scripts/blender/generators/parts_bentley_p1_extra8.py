"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 8
Subsystem 21:
- Subsystem 21: Front Splitter Winglets, Tire Wake Air Dams & CSiC Brake Cooling Ducts
"""

PART_BENTLEY_EXTRA8 = '''
# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 21: FRONT SPLITTER WINGLETS, AIR DAMS & BRAKE DUCTS
# ----------------------------------------------------------------------------

def build_bentley_splitter_and_cooling_ducts(parent_col, mats):
    """
    Constructs high-speed aerodynamic front splitter and brake duct architecture:
    - High-gloss piano black front splitter extending across the entire front bumper apron.
    - Turned-up aerodynamic endplate winglets managing wheel arch pressure and wake vortices.
    - Low-drag tire wake air deflector spats positioned forward of both front wheels.
    - High-pressure carbon composite brake cooling conduits delivering air to the 440mm CSiC discs.
    """
    objs = []
    bm_splitter = bmesh.new()
    bm_ducts = bmesh.new()

    # 1. Front High-Gloss Piano Black Aerodynamic Splitter (Y: +2.280m to +2.440m, Z = 0.190m)
    mat_split = Matrix.Translation(Vector((0.0, 2.360, 0.190)))
    bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_split @ Matrix.Diagonal(Vector((1.760, 0.160, 0.024, 1.0))))

    # Turned-Up Outer Aerodynamic Endplate Winglets (X = +-0.900m)
    for w_sign in [-1.0, 1.0]:
        mat_winglet = Matrix.Translation(Vector((w_sign * 0.890, 2.340, 0.235))) @ Euler((0, w_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_winglet @ Matrix.Diagonal(Vector((0.022, 0.180, 0.110, 1.0))))

    # 2. Front Tire Wake Deflector Spats (Y = +1.740m, X = +-0.840m, Z = 0.200m)
    for spat_sign in [-1.0, 1.0]:
        mat_spat = Matrix.Translation(Vector((spat_sign * 0.840, 1.740, 0.200)))
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.140, 0.025, 0.075, 1.0))))

    # 3. High-Pressure CSiC Front Brake Cooling Ducts (Leading from bumper scoops to wheel hubs)
    for duct_sign in [-1.0, 1.0]:
        p_inlet = Vector((duct_sign * 0.620, 2.180, 0.310))
        p_hub = Vector((duct_sign * 0.720, 1.480, 0.365))
        p_mid = (p_inlet + p_hub) * 0.5
        v_flow = p_hub - p_inlet
        length = v_flow.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_flow.normalized())

        mat_duct = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_ducts, radius=0.042, depth=length, segments=14, matrix=mat_duct)

        # Flared Carbon Rotor Cooling Backing Shroud
        mat_shroud = Matrix.Translation(Vector((duct_sign * 0.750, 1.440, 0.365))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_ducts, cap_ends=False, radius=0.190, depth=0.035, segments=20, matrix=mat_shroud)

    obj_splitter = link_obj("GEO_BENTLEY_Front_Aero_Splitter_Winglets", bm_splitter, parent_col, mats["piano_black"], bevel=0.0012)
    obj_ducts = link_obj("GEO_BENTLEY_CSiC_Front_Brake_Cooling_Ducts", bm_ducts, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_splitter, obj_ducts])
    return objs
'''
