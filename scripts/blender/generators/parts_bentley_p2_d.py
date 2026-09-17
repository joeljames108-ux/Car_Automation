"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part D
Subsystems 7 and 8:
- Subsystem 7: Flush Aerodynamic Pop-Out Door Handles & Puddle Lamps
- Subsystem 8: Mulliner Chrome Waistline Beltline Trim & Tonneau Brightware
"""

PART_BENTLEY2_D = '''
# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: FLUSH POP-OUT DOOR HANDLES & GROUND PUDDLE LAMPS
# ----------------------------------------------------------------------------

def build_bentley_flush_door_handles(parent_col, mats):
    """
    Constructs the motorized flush-fitting exterior door handles:
    - Positioned along the primary power crease line (X = +-0.855m, Y = +0.280m, Z = 0.762m).
    - Recessed pocket escutcheon with chrome perimeter bezel.
    - Motorized pop-out pull paddle finished in body-color with a polished chrome upper accent blade.
    - Micro-switch capacitive touch sensor for keyless entry unlocking.
    - Downward-facing high-output white LED puddle illumination lens projecting a Winged 'B' onto ground.
    """
    objs = []
    bm_pockets = bmesh.new()
    bm_handles = bmesh.new()
    bm_chrome = bmesh.new()
    bm_puddle = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        mat_handle_ctr = Matrix.Translation(Vector((hx_sign * 0.858, 0.280, 0.762))) @ Euler((0, hx_sign * math.radians(2), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Escutcheon Pocket Cavity
        bmesh.ops.create_cube(bm_pockets, size=1.0, matrix=mat_handle_ctr @ Matrix.Diagonal(Vector((0.016, 0.220, 0.048, 1.0))))

        # 2. Flush-Mounted Body-Color Pull Handle Paddle
        mat_paddle = mat_handle_ctr @ Matrix.Translation(Vector((hx_sign * 0.003, 0, 0)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_paddle @ Matrix.Diagonal(Vector((0.012, 0.205, 0.038, 1.0))))

        # 3. Polished Chrome Upper Accent Brightware Blade
        mat_blade = mat_paddle @ Matrix.Translation(Vector((0.0, 0.0, 0.016)))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.014, 0.205, 0.008, 1.0))))

        # Capacitive Lock/Unlock Touch Dimple (Forward end of handle)
        mat_dimple = mat_paddle @ Matrix.Translation(Vector((hx_sign * 0.004, 0.075, 0.0)))
        bmesh.ops.create_cylinder(bm_chrome, radius=0.006, depth=0.004, segments=12, matrix=mat_dimple @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Downward-Facing White LED Ground Puddle Illumination Lens
        mat_pud = mat_paddle @ Matrix.Translation(Vector((0.0, -0.040, -0.018)))
        bmesh.ops.create_cylinder(bm_puddle, radius=0.007, depth=0.006, segments=12, matrix=mat_pud)

    obj_pockets = link_obj("GEO_BENTLEY_Door_Handle_Escutcheon_Pockets", bm_pockets, parent_col, mats["trim_black"], bevel=0.0008)
    obj_handles = link_obj("GEO_BENTLEY_Door_Handle_Painted_Paddles", bm_handles, parent_col, mats["paint"], bevel=0.0006)
    obj_chrome = link_obj("GEO_BENTLEY_Door_Handle_Chrome_Blades", bm_chrome, parent_col, mats["chrome"], bevel=0.0004)
    obj_puddle = link_obj("GEO_BENTLEY_Door_Handle_Puddle_LED_Lenses", bm_puddle, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_pockets, obj_handles, obj_chrome, obj_puddle])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 8: MULLINER CHROME WAISTLINE BELTLINE TRIM & COWL BRIGHTWARE
# ----------------------------------------------------------------------------

def build_bentley_waistline_brightware(parent_col, mats):
    """
    Constructs the opulent Mulliner polished chrome waistline brightware:
    - Continuous hand-polished chrome beltline moulding running from the base of A-pillars,
      along the upper door sills, sweeping over the muscular rear haunches, and encircling
      the entire convertible tonneau soft-top deck well.
    - Chrome windshield cowl header finisher strip spanning across windshield base.
    - Chrome lower window scraper weatherstrip bead preventing moisture intrusion.
    """
    objs = []
    bm_trim = bmesh.new()

    # 1. Left & Right Door Waistline Chrome Strips (Y: +0.720m to -0.450m, X = +-0.850m, Z = 0.840m)
    for tx_sign in [-1.0, 1.0]:
        mat_side = Matrix.Translation(Vector((tx_sign * 0.852, 0.135, 0.842)))
        bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.014, 1.180, 0.012, 1.0))))

        # Rear Haunch Sweep Moulding (Y: -0.450m to -0.920m, sweeping outwards to X = +-0.940m)
        p_start = Vector((tx_sign * 0.852, -0.450, 0.842))
        p_end = Vector((tx_sign * 0.942, -0.920, 0.885))
        p_mid = (p_start + p_end) * 0.5
        v_h = p_end - p_start
        length = v_h.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_h.normalized())

        mat_haunch_trim = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_trim, radius=0.007, depth=length, segments=14, matrix=mat_haunch_trim)

    # 2. Transverse Rear Tonneau Deck Enclosing Chrome Trim Loop (Behind rear seat well, Y = -0.920m)
    mat_r_loop = Matrix.Translation(Vector((0.0, -0.920, 0.885)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_r_loop @ Matrix.Diagonal(Vector((1.880, 0.018, 0.012, 1.0))))

    # 3. Windshield Cowl Transverse Chrome Finisher Strip (Base of windshield, Y = +0.725m, Z = 0.845m)
    mat_cowl = Matrix.Translation(Vector((0.0, 0.725, 0.845)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((1.680, 0.020, 0.012, 1.0))))

    obj_trim = link_obj("GEO_BENTLEY_Mulliner_Waistline_Chrome_Trim", bm_trim, parent_col, mats["chrome"], bevel=0.0006)
    objs.append(obj_trim)
    return objs
'''
