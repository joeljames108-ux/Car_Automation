"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 13
Subsystems 30 and 31:
- Subsystem 30: CSiC Vacuum Brake Booster, Bosch ABS/ESP Hydraulic Unit & Hardlines
- Subsystem 31: Tunnel Acoustic Deadening Baffles & High-Tensile Propshaft Safety Hoops
"""

PART_BENTLEY_EXTRA13 = '''
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 30: BRAKE BOOSTER, ABS/ESP HYDRAULIC MODULATOR & HARDLINES
# ----------------------------------------------------------------------------

def build_bentley_brake_hydraulics_and_abs(parent_col, mats):
    """
    Constructs high-pressure brake actuation and electronic stability control:
    - Tandem vacuum booster and aluminum master cylinder on driver firewall.
    - High-frequency Bosch ESP 9.0 electro-hydraulic modulator valve block with accumulator.
    - Pre-formed stainless steel hard brake hydraulic lines radiating to all four wheel arches.
    - Brake fluid reservoir bottle with low-level sensor cap.
    """
    objs = []
    bm_booster = bmesh.new()
    bm_lines = bmesh.new()

    # 1. Tandem Vacuum Brake Booster (Driver side firewall, X = -0.420m, Y = +0.870m, Z = 0.710m)
    mat_boost = Matrix.Translation(Vector((-0.420, 0.870, 0.710)))
    # Dual-Diaphragm Vacuum Booster Canister
    bmesh.ops.create_cylinder(bm_booster, radius=0.115, depth=0.110, segments=22, matrix=mat_boost @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Aluminum Tandem Master Cylinder
    mat_mc = mat_boost @ Matrix.Translation(Vector((0, 0.110, 0)))
    bmesh.ops.create_cylinder(bm_booster, radius=0.032, depth=0.140, segments=16, matrix=mat_mc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Translucent Polyethylene Fluid Reservoir
    mat_res = mat_mc @ Matrix.Translation(Vector((0, 0, 0.075)))
    bmesh.ops.create_cube(bm_booster, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.085, 0.130, 0.080, 1.0))))

    # 2. Bosch ESP/ABS Hydraulic Control Modulator Unit (Behind left shock tower at Y = +1.180m, Z = 0.620m)
    mat_abs = Matrix.Translation(Vector((-0.480, 1.180, 0.620)))
    # Billet Aluminum Hydraulic Modulator Block
    bmesh.ops.create_cube(bm_booster, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.130, 0.110, 0.110, 1.0))))
    # Modulator High-Speed Electric Return Pump Motor
    mat_apump = mat_abs @ Matrix.Translation(Vector((0, -0.075, 0)))
    bmesh.ops.create_cylinder(bm_booster, radius=0.042, depth=0.065, segments=16, matrix=mat_apump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Stainless Steel Hard Brake Hydraulic Lines radiating to wheel wells
    wheel_dest = [
        (-0.720,  1.425, 0.440),
        ( 0.720,  1.425, 0.440),
        (-0.710, -1.426, 0.440),
        ( 0.710, -1.426, 0.440),
    ]
    p_abs_ctr = Vector((-0.480, 1.180, 0.620))
    for wx, wy, wz in wheel_dest:
        p_whl = Vector((wx, wy, wz))
        p_mid = (p_abs_ctr + p_whl) * 0.5
        v_line = p_whl - p_abs_ctr
        length = v_line.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_line.normalized())

        mat_line = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_lines, radius=0.0035, depth=length, segments=8, matrix=mat_line)

    obj_booster = link_obj("GEO_BENTLEY_Brake_Booster_and_ABS_Unit", bm_booster, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_lines = link_obj("GEO_BENTLEY_Stainless_Brake_Hydraulic_Hardlines", bm_lines, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_booster, obj_lines])
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 31: TUNNEL ACOUSTIC BAFFLES & PROPSHAFT SAFETY HOOPS
# ----------------------------------------------------------------------------

def build_bentley_tunnel_baffles_and_safety_hoops(parent_col, mats):
    """
    Constructs transmission tunnel acoustic attenuation and driveline safety loops:
    - High-density viscoelastic acoustic decoupling foam pads lining the center tunnel.
    - Dual high-tensile steel circular propshaft containment safety hoops (NHRA / FIA spec).
    - Prevents carbon fiber propshaft flailing in the extreme event of universal joint failure at 208 mph.
    - Underfloor hydraulic line routing clips and rubber vibration isolator grommets.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_baffles = bmesh.new()

    # 1. High-Tensile Steel Propshaft Safety Containment Hoops (Forward at Y = +0.100m, Rearward at Y = -0.900m)
    for hoop_y in [0.100, -0.900]:
        mat_hoop = Matrix.Translation(Vector((0.0, hoop_y, 0.280)))
        # Circular Loop surrounding carbon propshaft (Radius = 0.075m)
        bmesh.ops.create_torus(bm_hoops, major_radius=0.075, minor_radius=0.008, major_segments=20, minor_segments=10, matrix=mat_hoop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Heavy-Duty Steel Mounting Cleats to Tunnel Wall
        for c_sign in [-1.0, 1.0]:
            mat_cleat = mat_hoop @ Matrix.Translation(Vector((c_sign * 0.095, 0, 0)))
            bmesh.ops.create_cube(bm_hoops, size=1.0, matrix=mat_cleat @ Matrix.Diagonal(Vector((0.040, 0.050, 0.015, 1.0))))

    # 2. Viscoelastic Center Tunnel Acoustic Sound Deadening Foam Mats (Lining tunnel walls)
    for b_sign in [-1.0, 1.0]:
        mat_baf = Matrix.Translation(Vector((b_sign * 0.210, -0.300, 0.360)))
        bmesh.ops.create_cube(bm_baffles, size=1.0, matrix=mat_baf @ Matrix.Diagonal(Vector((0.025, 2.100, 0.160, 1.0))))

    obj_hoops = link_obj("GEO_BENTLEY_Propshaft_Safety_Containment_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.001)
    obj_baffles = link_obj("GEO_BENTLEY_Tunnel_Acoustic_Sound_Baffles", bm_baffles, parent_col, mats["trim_black"], bevel=0.0012)

    objs.extend([obj_hoops, obj_baffles])
    return objs
'''
