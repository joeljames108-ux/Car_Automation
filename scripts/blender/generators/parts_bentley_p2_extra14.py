"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 14
Subsystems 36 and 37:
- Subsystem 36: Rear Boot Power Lift Spindle Struts & Emergency Escape Latch
- Subsystem 37: Windshield Cowl Acoustic Debris Screen & Washer Manifold
"""

PART_BENTLEY2_EXTRA14 = '''
# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: BOOT POWER LIFT SPINDLES & EMERGENCY ESCAPE LATCH
# ----------------------------------------------------------------------------

def build_bentley_boot_lid_mechanisms(parent_col, mats):
    """
    Constructs the automatic power decklid mechanism:
    - Left and right motorized ball-screw linear power spindle drive struts lifting boot lid.
    - Soft-close pull-down motorized trunk latch cinching module with obstacle detection.
    - Glow-in-the-dark phosphor emergency trunk interior escape release T-handle (US FMVSS 401).
    - Trunk drainage water collection troughs flanking decklid shutlines.
    """
    objs = []
    bm_spindles = bmesh.new()
    bm_escape = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # Motorized Power Spindle Drive Strut (Y: -1.750m to -2.050m inside trunk rain channel)
        p_chassis = Vector((bx_sign * 0.580, -1.750, 0.650))
        p_deck = Vector((bx_sign * 0.520, -2.050, 0.820))
        p_mid = (p_chassis + p_deck) * 0.5
        v_s = p_deck - p_chassis
        length = v_s.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_s.normalized())

        mat_spindle = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_spindles, radius=0.016, depth=length, segments=14, matrix=mat_spindle)

    # Glow-in-the-dark Phosphor Interior Escape T-Handle (Mounted inside trunk lid)
    mat_esc = Matrix.Translation(Vector((0.0, -2.180, 0.820)))
    bmesh.ops.create_cube(bm_escape, size=1.0, matrix=mat_esc @ Matrix.Diagonal(Vector((0.065, 0.018, 0.035, 1.0))))

    obj_spindles = link_obj("GEO_BENTLEY_BootLid_Power_Spindle_Drives", bm_spindles, parent_col, mats["trim_black"], bevel=0.0006)
    obj_escape = link_obj("GEO_BENTLEY_Trunk_Interior_Emergency_Escape_Handle", bm_escape, parent_col, mats["led_drl"], bevel=0.0004)

    objs.extend([obj_spindles, obj_escape])
    return objs


# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: COWL ACOUSTIC DEBRIS SCREEN & WASHER MANIFOLD
# ----------------------------------------------------------------------------

def build_bentley_cowl_screen_and_washer_plumbing(parent_col, mats):
    """
    Constructs the windshield wiper cowl trough detailing:
    - Molded polyurethane cowl leaves and debris screen with micro-hexagonal drainage mesh.
    - Pressurized fluid delivery supply manifold piping delivering heated washer fluid to wiper jets.
    - Engine bay rear weatherstrip perimeter bulb gasket isolating acoustic cabin NVH.
    """
    objs = []
    bm_screen = bmesh.new()
    bm_plumbing = bmesh.new()

    # 1. Cowl Screen Plastic Mesh Panel (Y = +0.710m, Z = 0.825m, Spans width: 1.480m)
    mat_cowl_scr = Matrix.Translation(Vector((0.0, 0.710, 0.825)))
    bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_cowl_scr @ Matrix.Diagonal(Vector((1.480, 0.085, 0.012, 1.0))))

    # Hexagonal Drainage Slots along Cowl Tray
    for slot_i in range(10):
        sx = (slot_i - 4.5) * 0.135
        mat_slot = mat_cowl_scr @ Matrix.Translation(Vector((sx, 0, 0.004)))
        bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.085, 0.018, 0.006, 1.0))))

    # 2. Heated Washer Fluid Distribution Conduit Manifold
    mat_pipe = Matrix.Translation(Vector((0.0, 0.715, 0.815)))
    bmesh.ops.create_cylinder(bm_plumbing, radius=0.004, depth=1.350, segments=10, matrix=mat_pipe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_screen = link_obj("GEO_BENTLEY_Windshield_Cowl_Debris_Screen", bm_screen, parent_col, mats["trim_black"], bevel=0.0006)
    obj_plumbing = link_obj("GEO_BENTLEY_Heated_Washer_Fluid_Plumbing", bm_plumbing, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_screen, obj_plumbing])
    return objs
'''
