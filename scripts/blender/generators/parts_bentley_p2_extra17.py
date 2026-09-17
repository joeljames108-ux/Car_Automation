"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 17
Subsystems 42 and 43:
- Subsystem 42: B-Pillar Coat Hooks & Rear Passenger Grab Handles
- Subsystem 43: Glovebox Polished Chrome Push Button & Keylock Cylinder
"""

PART_BENTLEY2_EXTRA17 = '''
# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 42: B-PILLAR COAT HOOKS & REAR PASSENGER GRAB HANDLES
# ----------------------------------------------------------------------------

def build_bentley_interior_hooks_and_handles(parent_col, mats):
    """
    Constructs interior tactile luxury details:
    - Retractable spring-damped polished chrome coat hooks on rear cabin waistrails.
    - Hand-stitched Imperial Blue leather assist grab handles with chrome pivot brackets.
    """
    objs = []
    bm_hooks = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # 1. Retractable Chrome Coat Hook (Inner waistrail, X = +-0.720m, Y = -0.520m, Z = 0.810m)
        mat_hook = Matrix.Translation(Vector((hx_sign * 0.720, -0.520, 0.810)))
        bmesh.ops.create_cube(bm_hooks, size=1.0, matrix=mat_hook @ Matrix.Diagonal(Vector((0.012, 0.024, 0.018, 1.0))))
        # Swivel Hook Horn
        mat_horn = mat_hook @ Matrix.Translation(Vector((-hx_sign * 0.008, 0, -0.008)))
        bmesh.ops.create_cylinder(bm_hooks, radius=0.003, depth=0.016, segments=10, matrix=mat_horn)

        # 2. Rear Passenger Leather Assist Strap (Y = -0.680m, Z = 0.820m)
        mat_strap = Matrix.Translation(Vector((hx_sign * 0.710, -0.680, 0.820)))
        bmesh.ops.create_cube(bm_hooks, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.014, 0.090, 0.018, 1.0))))

    obj_hooks = link_obj("GEO_BENTLEY_Interior_Coat_Hooks_and_Straps", bm_hooks, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_hooks)
    return objs


# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 43: GLOVEBOX CHROME BUTTON & KEYLOCK CYLINDER
# ----------------------------------------------------------------------------

def build_bentley_glovebox_controls(parent_col, mats):
    """
    Constructs passenger dashboard fascia convenience controls:
    - Valet parking keylock cylinder and chrome touch release button on glovebox door.
    - Soft-open damped hinge pivot guide.
    """
    objs = []
    bm_lock = bmesh.new()

    # Passenger Side Dashboard Lower Fascia (X = +0.420m, Y = +0.420m, Z = 0.580m)
    mat_glove = Matrix.Translation(Vector((0.420, 0.420, 0.580)))
    # Chrome Release Button
    bmesh.ops.create_cylinder(bm_lock, radius=0.010, depth=0.006, segments=16, matrix=mat_glove @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Micro Key Slot for Valet Lock
    mat_slot = mat_glove @ Matrix.Translation(Vector((0, 0.004, 0)))
    bmesh.ops.create_cube(bm_lock, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.002, 0.002, 0.008, 1.0))))

    obj_lock = link_obj("GEO_BENTLEY_Glovebox_Chrome_Release_Button", bm_lock, parent_col, mats["chrome"], bevel=0.0003)
    objs.append(obj_lock)
    return objs
'''
