"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 8
Subsystems 23 and 24:
- Subsystem 23: Exhaust Tip Fluted Rifled Liners & Bumper Thermal Bezels
- Subsystem 24: Illuminated Stainless Steel "SPEED" Door Sill Treadplates
"""

PART_BENTLEY2_EXTRA8 = '''
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 23: EXHAUST TIP RIFLED LINERS & BUMPER THERMAL BEZELS
# ----------------------------------------------------------------------------

def build_bentley_exhaust_detailing(parent_col, mats):
    """
    Constructs the micro-detailing inside the Speed elliptical exhaust tailpipes:
    - Directional spiral internal rifling grooves inside the elliptical twin tailpipes.
    - Matte black thermal soot baffle wall separating inner gas bores from outer chrome sleeve.
    - High-temperature fluorosilicone bumper heat isolation bezels preventing paint blistering.
    - Dual internal gas exhaust dividing blades.
    """
    objs = []
    bm_rifling = bmesh.new()
    bm_bezels = bmesh.new()
    bm_soot = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        mat_tip = Matrix.Translation(Vector((tx_sign * 0.620, -2.355, 0.285))) @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4()

        # 1. High-Temperature Bumper Thermal Isolation Gasket Bezel (Surrounding chrome tip)
        mat_e_gasket = mat_tip @ Matrix.Diagonal(Vector((1.42, 1.0, 0.88, 1.0)))
        bmesh.ops.create_cylinder(bm_bezels, cap_ends=False, radius=0.096, depth=0.024, segments=28, matrix=mat_e_gasket @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Internal Soot Baffle Backing Plate
        mat_baf = mat_tip @ Matrix.Translation(Vector((0, 0.040, 0))) @ Matrix.Diagonal(Vector((1.32, 1.0, 0.80, 1.0)))
        bmesh.ops.create_cylinder(bm_soot, radius=0.082, depth=0.010, segments=24, matrix=mat_baf @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Directional Spiral Rifled Internal Grooves (Speed bespoke exhaust architecture)
        for r_i in range(8):
            r_ang = r_i * (2.0 * math.pi / 8.0)
            mat_rifle = mat_tip @ Euler((0, 0, r_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.072, 0.0, 0.0)))
            bmesh.ops.create_cube(bm_rifling, size=1.0, matrix=mat_rifle @ Matrix.Diagonal(Vector((0.005, 0.110, 0.005, 1.0))))

        # 4. Central Horizontal Chrome Exhaust Divider Blade
        mat_blade = mat_tip @ Matrix.Translation(Vector((0, -0.010, 0)))
        bmesh.ops.create_cube(bm_rifling, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.140, 0.080, 0.006, 1.0))))

    obj_rifling = link_obj("GEO_BENTLEY_Exhaust_Internal_Rifling_and_Blades", bm_rifling, parent_col, mats["chrome"], bevel=0.0004)
    obj_bezels = link_obj("GEO_BENTLEY_Exhaust_Bumper_Thermal_Bezels", bm_bezels, parent_col, mats["trim_black"], bevel=0.0005)
    obj_soot = link_obj("GEO_BENTLEY_Exhaust_Inner_Soot_Baffles", bm_soot, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_rifling, obj_bezels, obj_soot])
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 24: ILLUMINATED "SPEED" DOOR SILL TREADPLATES
# ----------------------------------------------------------------------------

def build_bentley_illuminated_treadplates(parent_col, mats):
    """
    Constructs the handcrafted illuminated door sill treadplates:
    - Positioned along the structural aluminum door sills (X = +-0.840m, Y = +0.180m, Z = 0.280m).
    - Brushed stainless steel treadplate body with hand-polished mirror perimeter chamfers.
    - Electroluminescent backlit cursive "SPEED" script logo glowing in pure white.
    - Black ribbed vulcanized rubber traction pads flanking the illuminated emblem.
    """
    objs = []
    bm_plates = bmesh.new()
    bm_illum = bmesh.new()
    bm_rubber = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_sill = Matrix.Translation(Vector((sx_sign * 0.840, 0.180, 0.282)))

        # 1. Brushed Stainless Steel Base Treadplate (Length: 0.720m, Width: 0.085m)
        bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.085, 0.720, 0.008, 1.0))))

        # 2. Electroluminescent Backlit "SPEED" Script Graphic Plaque (Center of treadplate)
        mat_text = mat_sill @ Matrix.Translation(Vector((0, 0, 0.005)))
        bmesh.ops.create_cube(bm_illum, size=1.0, matrix=mat_text @ Matrix.Diagonal(Vector((0.038, 0.220, 0.004, 1.0))))

        # 3. Vulcanized Rubber Grip Traction Ribs (Forward & Aft of script)
        for rib_off in [-0.220, 0.220]:
            mat_rib = mat_sill @ Matrix.Translation(Vector((0, rib_off, 0.005)))
            bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.065, 0.140, 0.004, 1.0))))

    obj_plates = link_obj("GEO_BENTLEY_Brushed_Stainless_Door_Treadplates", bm_plates, parent_col, mats["chrome"], bevel=0.0005)
    obj_illum = link_obj("GEO_BENTLEY_Illuminated_Speed_Sill_Graphics", bm_illum, parent_col, mats["led_drl"], bevel=0.0003)
    obj_rubber = link_obj("GEO_BENTLEY_Treadplate_Rubber_Traction_Ribs", bm_rubber, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_plates, obj_illum, obj_rubber])
    return objs
'''
