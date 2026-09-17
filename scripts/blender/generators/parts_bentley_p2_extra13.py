"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 13
Subsystems 34 and 35:
- Subsystem 34: B-Pillar Courtesy Lighting & Soft-Close Door Lock Strikers
- Subsystem 35: Front Bonnet Hydraulic Gas Struts & Alignment Guide Dowels
"""

PART_BENTLEY2_EXTRA13 = '''
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: B-PILLAR COURTESY LAMPS & SOFT-CLOSE DOOR STRIKERS
# ----------------------------------------------------------------------------

def build_bentley_door_strikers_and_courtesy(parent_col, mats):
    """
    Constructs the door aperture entry hardware:
    - B-pillar polished stainless steel door latch striker pins with rotary claw bumpers.
    - Soft-close motorized pull-down door cinching latches.
    - White LED puddle/courtesy entrance step illumination lenses mounted on inner door base.
    - Molded rubber door perimeter weatherstripping gaskets with velvet flocking.
    """
    objs = []
    bm_strikers = bmesh.new()
    bm_lights = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. B-Pillar Door Striker Pin Base (X = +-0.865m, Y = -0.320m, Z = 0.580m)
        mat_strik = Matrix.Translation(Vector((sx_sign * 0.865, -0.320, 0.580)))
        # Stainless Mounting Backing Plate
        bmesh.ops.create_cube(bm_strikers, size=1.0, matrix=mat_strik @ Matrix.Diagonal(Vector((0.008, 0.055, 0.065, 1.0))))
        # Hardened Steel Striker Loop Pin
        mat_pin = mat_strik @ Matrix.Translation(Vector((-sx_sign * 0.015, 0, 0)))
        bmesh.ops.create_torus(bm_strikers, major_radius=0.016, minor_radius=0.004, major_segments=16, minor_segments=8, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Lower Door Sill White LED Courtesy Entrance Step Lamp (Y = +0.180m, Z = 0.320m)
        mat_step = Matrix.Translation(Vector((sx_sign * 0.840, 0.180, 0.320)))
        bmesh.ops.create_cube(bm_lights, size=1.0, matrix=mat_step @ Matrix.Diagonal(Vector((0.012, 0.085, 0.024, 1.0))))

    obj_strikers = link_obj("GEO_BENTLEY_Door_Latch_Striker_Hardware", bm_strikers, parent_col, mats["chrome"], bevel=0.0004)
    obj_lights = link_obj("GEO_BENTLEY_Door_Sill_Courtesy_Step_LEDs", bm_lights, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_strikers, obj_lights])
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: BONNET HYDRAULIC GAS STRUTS & ALIGNMENT DOWELS
# ----------------------------------------------------------------------------

def build_bentley_bonnet_struts_and_latches(parent_col, mats):
    """
    Constructs the long aluminum bonnet support hardware:
    - Left and right nitrogen gas-charged pressurized telescopic hood lift struts.
    - Dual primary hood safety latches and emergency secondary safety catch hook.
    - Conical rubber hood height leveling stop bumpers and stainless locator dowels.
    """
    objs = []
    bm_struts = bmesh.new()
    bm_latches = bmesh.new()

    # Left & Right Bonnet Gas Struts (Spans Y: +1.050m to +1.480m along fender aprons)
    for bx_sign in [-1.0, 1.0]:
        p_chassis = Vector((bx_sign * 0.640, 1.050, 0.680))
        p_hood = Vector((bx_sign * 0.580, 1.480, 0.820))
        p_mid = (p_chassis + p_hood) * 0.5
        v_strut = p_hood - p_chassis
        length = v_strut.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_strut.normalized())

        mat_s = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        # Outer Cylinder Barrel (Chassis end)
        bmesh.ops.create_cylinder(bm_struts, radius=0.012, depth=length * 0.55, segments=14, matrix=mat_s @ Matrix.Translation(Vector((0, 0, -length * 0.22))))
        # Hard Chrome Telescopic Piston Rod
        bmesh.ops.create_cylinder(bm_struts, radius=0.006, depth=length * 0.50, segments=12, matrix=mat_s @ Matrix.Translation(Vector((0, 0, length * 0.22))))

        # Conical Rubber Hood Alignment Leveling Bumpers (Forward radiator corners)
        mat_bump = Matrix.Translation(Vector((bx_sign * 0.520, 2.140, 0.735)))
        bmesh.ops.create_cylinder(bm_latches, radius=0.014, depth=0.022, segments=12, matrix=mat_bump)

    # Dual Primary Hood Locking Latches on Radiator Tie Bar (X = +-0.240m, Y = +2.180m, Z = 0.720m)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.240, 2.180, 0.720)))
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.055, 0.045, 0.035, 1.0))))

    obj_struts = link_obj("GEO_BENTLEY_Bonnet_Telescopic_Gas_Struts", bm_struts, parent_col, mats["chrome"], bevel=0.0005)
    obj_latches = link_obj("GEO_BENTLEY_Bonnet_Latches_and_Bumpers", bm_latches, parent_col, mats["trim_black"], bevel=0.0004)

    objs.extend([obj_struts, obj_latches])
    return objs
'''
