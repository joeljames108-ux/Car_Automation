"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 5
Subsystems 32 to 34:
- Subsystem 32: Rollover Hoop Gloss Protective Caps & Wind Baffle Screen
- Subsystem 33: Under-Mirror Puddle Lamps with Leaper Ground Projection
- Subsystem 34: Exhaust Heat Shield Stamped Dimples & Tailpipe Bracket Mounts
"""

PART_FTYPE2_EXTRA5 = '''
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 32: ROLLOVER HOOP CAPS & AIR TURBULENCE BAFFLE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rollover_caps_and_baffle(parent_col, mats):
    """
    Constructs the rollover hoop protective capping and center turbulence baffle:
    - Gloss black aerodynamic crown caps on top of both safety roll hoops.
    - Fine mesh anti-buffeting screen inserted between hoops to eliminate cockpit wind roar.
    """
    objs = []
    bm_caps = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.360
        hy = -0.440
        hz = 1.140

        # Protective Aerodynamic Crown Cap
        mat_cap = Matrix.Translation(Vector((hx, hy, hz)))
        bmesh.ops.create_cube(bm_caps, size=1.0, matrix=mat_cap @ Matrix.Diagonal(Vector((0.260, 0.065, 0.024, 1.0))))

    # Center Wind Turbulence Mesh Infill (Between left and right hoops)
    mat_mesh = Matrix.Translation(Vector((0.0, -0.440, 1.020)))
    bmesh.ops.create_cube(bm_caps, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.420, 0.005, 0.180, 1.0))))

    obj_caps = link_obj("GEO_FTYPE_Rollover_Caps_and_Baffle", bm_caps, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_caps)
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 33: UNDER-MIRROR PUDDLE LAMPS (LEAPER PROJECTION)
# ----------------------------------------------------------------------------

def build_jaguar_ftype_mirror_puddle_lamps(parent_col, mats):
    """
    Constructs the under-mirror puddle illumination lamps:
    - Microscopic LED projector lenses recessed in underside of each side mirror housing.
    - Projects the iconic illuminated Jaguar Leaper feline graphic onto ground.
    """
    objs = []
    bm_puddle = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        sx = mx_sign * 0.985
        sy = 0.660
        sz = 0.840

        # Under-Mirror Micro Projector Lens (Facing ground)
        mat_pud = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cylinder(bm_puddle, radius=0.010, depth=0.006, segments=12, matrix=mat_pud)

    obj_puddle = link_obj("GEO_FTYPE_Puddle_Lamp_Projectors", bm_puddle, parent_col, mats["drl_white"], bevel=0.0003)
    objs.append(obj_puddle)
    return objs


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 34: EXHAUST HEAT SHIELD DIMPLES & MUFFLER CLAMPS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_exhaust_clamps_and_dimples(parent_col, mats):
    """
    Constructs exhaust mounting hardware and thermal management details:
    - Heavy-duty T-bolt band clamps securing quad exhaust tips to rear muffler outlets.
    - Stamped hexagonal thermal expansion dimples on underbody aluminum heat shields.
    """
    objs = []
    bm_clamps = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        for sub_x_off in [-0.045, 0.045]:
            tx = qx_sign * 0.620 + sub_x_off
            ty = -2.040
            tz = 0.250

            mat_clamp = Matrix.Translation(Vector((tx, ty, tz)))
            # Heavy Stainless Band Clamp
            bmesh.ops.create_cylinder(bm_clamps, radius=0.048, depth=0.024, segments=16, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
            # Clamping Tightening Bolt & Nut
            mat_bolt = mat_clamp @ Matrix.Translation(Vector((0, 0, 0.052)))
            bmesh.ops.create_cylinder(bm_clamps, radius=0.006, depth=0.030, segments=8, matrix=mat_bolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_clamps = link_obj("GEO_FTYPE_Exhaust_T_Bolt_Clamps", bm_clamps, parent_col, mats["chrome"], bevel=0.0005)
    objs.append(obj_clamps)
    return objs
'''
