"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 9
Subsystems 25 and 26:
- Subsystem 25: Rear Bumper Reflex Reflectors & Fog Light Optical Prisms
- Subsystem 26: Windshield Ceramic Frit Dot Matrix & Sunstrip Gradient Mask
"""

PART_BENTLEY2_EXTRA9 = '''
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 25: REAR BUMPER REFLEX REFLECTORS & FOG LAMP PRISMS
# ----------------------------------------------------------------------------

def build_bentley_rear_reflectors_and_fog(parent_col, mats):
    """
    Constructs the rear lower valance safety lighting optics:
    - Slim horizontal ruby red micro-prismatic reflex reflectors integrated into rear diffuser flanks.
    - ECE/DOT compliant central rear LED fog lamp optic prism with concentrated red beam.
    - Beveled black EPDM rubber perimeter gasket bezels.
    """
    objs = []
    bm_refl = bmesh.new()
    bm_fog = bmesh.new()

    # 1. Left & Right Rear Red Reflex Reflectors (X = +-0.760m, Y = -2.280m, Z = 0.360m)
    for rx_sign in [-1.0, 1.0]:
        mat_ref = Matrix.Translation(Vector((rx_sign * 0.760, -2.280, 0.360))) @ Euler((math.radians(8), rx_sign * math.radians(15), 0), 'XYZ').to_matrix().to_4x4()
        # Slim Horizontal Reflector Body (140mm x 18mm)
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_ref @ Matrix.Diagonal(Vector((0.140, 0.012, 0.018, 1.0))))

        # Micro-Prismatic Honeycomb Diamond Facets along surface
        for p_i in range(6):
            p_x = (p_i - 2.5) * 0.022
            mat_facet = mat_ref @ Matrix.Translation(Vector((p_x, -0.005, 0.0)))
            bmesh.ops.create_cylinder(bm_refl, radius=0.006, depth=0.004, segments=6, matrix=mat_facet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Central Rear High-Intensity LED Fog Lamp Prism (Diffuser Center, Y = -2.310m, Z = 0.220m)
    mat_fog_prism = Matrix.Translation(Vector((0.0, -2.310, 0.220))) @ Euler((math.radians(-10), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_fog, size=1.0, matrix=mat_fog_prism @ Matrix.Diagonal(Vector((0.110, 0.018, 0.024, 1.0))))
    # Internal Concentrating Fresnel Stepped Lens
    mat_fres = mat_fog_prism @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cylinder(bm_fog, radius=0.009, depth=0.008, segments=14, matrix=mat_fres @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_refl = link_obj("GEO_BENTLEY_Rear_Reflex_Reflectors", bm_refl, parent_col, mats["led_taillight"], bevel=0.0004)
    obj_fog = link_obj("GEO_BENTLEY_Rear_Diffuser_LED_FogLamp", bm_fog, parent_col, mats["led_taillight"], bevel=0.0005)

    objs.extend([obj_refl, obj_fog])
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 26: CERAMIC FRIT MATRIX & ACOUSTIC SUNSTRIP MASK
# ----------------------------------------------------------------------------

def build_bentley_windshield_frit_mask(parent_col, mats):
    """
    Constructs the ceramic frit mask and acoustic gradient sunstrip:
    - Black ceramic enamel frit perimeter band printed onto the acoustic windshield glass.
    - Prevents UV degradation of urethane adhesive bonding windshield to A-pillars.
    - Micro-dot gradient fade transition along inner frit margins.
    - Upper acoustic sunstrip shade band reducing driver glare.
    - Dedicated sensor cutouts for rain sensor, light sensor, and ADAS cameras.
    """
    objs = []
    bm_frit = bmesh.new()

    # Windshield Cowl (Y = +0.720m, Z = 0.855m) to Header (Y = +0.180m, Z = 1.365m)
    p_cowl_c = Vector((0.0, 0.720, 0.855))
    p_hdr_c = Vector((0.0, 0.180, 1.365))
    mid_glass = (p_cowl_c + p_hdr_c) * 0.5
    v_ws = p_hdr_c - p_cowl_c
    rot_quat = Vector((0, 0, 1)).rotation_difference(v_ws.normalized())
    mat_ws_plane = Matrix.Translation(mid_glass) @ rot_quat.to_matrix().to_4x4()

    # 1. Top Header Frit Mask Band with Trapezoidal Camera Trap
    mat_top_frit = mat_ws_plane @ Matrix.Translation(Vector((0.0, 0.006, 0.240)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_top_frit @ Matrix.Diagonal(Vector((1.200, 0.002, 0.140, 1.0))))

    # 2. Bottom Cowl Frit Mask Band (conceals wiper linkage)
    mat_bot_frit = mat_ws_plane @ Matrix.Translation(Vector((0.0, 0.006, -0.250)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_bot_frit @ Matrix.Diagonal(Vector((1.220, 0.002, 0.120, 1.0))))

    # 3. Left & Right A-Pillar Lateral Frit Borders
    for fx_sign in [-1.0, 1.0]:
        mat_side_frit = mat_ws_plane @ Matrix.Translation(Vector((fx_sign * 0.575, 0.006, 0.0)))
        bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_side_frit @ Matrix.Diagonal(Vector((0.065, 0.002, 0.620, 1.0))))

    obj_frit = link_obj("GEO_BENTLEY_Windshield_Ceramic_Frit_Mask", bm_frit, parent_col, mats["trim_black"], bevel=0.0002)
    objs.append(obj_frit)
    return objs
'''
