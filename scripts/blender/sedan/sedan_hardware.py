"""
Sedan Exterior Hardware, Mirrors & Jewelry (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish
    )
except ImportError:
    from sedan_common import (
        link_and_finish
    )

def build_exterior_hardware(mats):
    created = []
    mat_paint = mats.get("paint")
    mat_carbon = mats.get("carbon")
    mat_chrome = mats.get("chrome")
    mat_gloss = mats.get("gloss_black")
    mat_matte = mats.get("matte_black")
    mat_amber = mats.get("led_amber")

    print("[SEDAN_HARDWARE] Generating M-Style Aero Wing Mirrors, Flush Handles & Wiper Assembly...")

    # ------------------------------------------------------------------------
    # 1. M-STYLE AERODYNAMIC WING MIRRORS (L & R)
    # ------------------------------------------------------------------------
    def make_aero_mirror(is_left):
        bm = bmesh.new()
        sx = 1 if is_left else -1
        
        # Dual aerodynamic mounting stalks
        rc_stk1 = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.070, 0.022, 0.016)), verts=rc_stk1['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.880, 0.720, 0.930)), verts=rc_stk1['verts'])
        
        rc_stk2 = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.060, 0.018, 0.014)), verts=rc_stk2['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.890, 0.760, 0.950)), verts=rc_stk2['verts'])
        
        # Aerodynamic mirror shell
        rc_m = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.150, 0.115, 0.070)), verts=rc_m['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14 * sx), 4, 'Z'), verts=rc_m['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.980, 0.720, 0.940)), verts=rc_m['verts'])
        
        # Reflective mirror glass insert
        rc_gl = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.010, 0.100, 0.060)), verts=rc_gl['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.965, 0.715, 0.940)), verts=rc_gl['verts'])
        
        # LED turn repeater strip
        rc_rep = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.090, 0.010, 0.008)), verts=rc_rep['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14 * sx), 4, 'Z'), verts=rc_rep['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.985, 0.740, 0.940)), verts=rc_rep['verts'])
        
        return bm

    bm_mir_l = make_aero_mirror(True)
    bm_mir_r = make_aero_mirror(False)
    obj_mir_l = link_and_finish("GEO_Mirror_L", "05_Exterior_Jewelry", bm_mir_l, mat_paint, bevel=0.003, subsurf=1)
    obj_mir_r = link_and_finish("GEO_Mirror_R", "05_Exterior_Jewelry", bm_mir_r, mat_paint, bevel=0.003, subsurf=1)
    created.extend([obj_mir_l, obj_mir_r])

    # ------------------------------------------------------------------------
    # 2. FLUSH POP-OUT ELECTRONIC DOOR HANDLES (4 DOORS)
    # ------------------------------------------------------------------------
    bm_dh = bmesh.new()
    for sx in [-0.940, 0.940]:
        for hy in [0.350, -0.750]:
            rc_dh = bmesh.ops.create_cube(bm_dh, size=1.0)
            bmesh.ops.scale(bm_dh, vec=Vector((0.016, 0.140, 0.024)), verts=rc_dh['verts'])
            bmesh.ops.translate(bm_dh, vec=Vector((sx, hy, 0.880)), verts=rc_dh['verts'])
    obj_dh = link_and_finish("GEO_Flush_Door_Handles", "05_Exterior_Jewelry", bm_dh, mat_chrome, bevel=0.002, subsurf=0)
    created.append(obj_dh)

    # ------------------------------------------------------------------------
    # 3. ARTICULATED WINDSHIELD WIPER ASSEMBLY
    # ------------------------------------------------------------------------
    bm_wp = bmesh.new()
    for wx_base, wy_base, wz_base, w_len, w_ang in [
        (0.22, 0.92, 0.93, 0.58, -35),
        (-0.35, 0.92, 0.93, 0.54, -38)
    ]:
        # Wiper pivot spindle
        rc_p = bmesh.ops.create_cone(bm_wp, cap_ends=True, radius1=0.016, radius2=0.016, depth=0.035, segments=16)
        bmesh.ops.translate(bm_wp, vec=Vector((wx_base, wy_base, wz_base)), verts=rc_p['verts'])
        
        # Wiper arm
        rc_arm = bmesh.ops.create_cube(bm_wp, size=1.0)
        bmesh.ops.scale(bm_wp, vec=Vector((0.010, w_len * 0.5, 0.008)), verts=rc_arm['verts'])
        bmesh.ops.rotate(bm_wp, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(w_ang), 4, 'Z'), verts=rc_arm['verts'])
        bmesh.ops.translate(bm_wp, vec=Vector((wx_base + 0.14, wy_base - 0.16, wz_base + 0.06)), verts=rc_arm['verts'])
        
        # Rubber blade
        rc_bl = bmesh.ops.create_cube(bm_wp, size=1.0)
        bmesh.ops.scale(bm_wp, vec=Vector((0.006, w_len * 0.95, 0.012)), verts=rc_bl['verts'])
        bmesh.ops.rotate(bm_wp, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(w_ang), 4, 'Z'), verts=rc_bl['verts'])
        bmesh.ops.translate(bm_wp, vec=Vector((wx_base + 0.18, wy_base - 0.20, wz_base + 0.08)), verts=rc_bl['verts'])
        
    obj_wp = link_and_finish("GEO_Windshield_Wipers", "05_Exterior_Jewelry", bm_wp, mat_matte, bevel=0.002, subsurf=0)
    created.append(obj_wp)

    # ------------------------------------------------------------------------
    # 4. POLISHED CHROME EXECUTIVE MODEL BADGES
    # ------------------------------------------------------------------------
    bm_bdg = bmesh.new()
    # Front grille crest emblem
    rc_fe = bmesh.ops.create_cone(bm_bdg, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.012, segments=32)
    bmesh.ops.rotate(bm_bdg, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_fe['verts'])
    bmesh.ops.translate(bm_bdg, vec=Vector((0.00, 2.445, 0.540)), verts=rc_fe['verts'])
    
    # Rear trunk script badge
    rc_rb = bmesh.ops.create_cube(bm_bdg, size=1.0)
    bmesh.ops.scale(bm_bdg, vec=Vector((0.18, 0.010, 0.024)), verts=rc_rb['verts'])
    bmesh.ops.translate(bm_bdg, vec=Vector((0.42, -2.405, 0.980)), verts=rc_rb['verts'])
    
    obj_bdg = link_and_finish("GEO_Executive_Badges", "05_Exterior_Jewelry", bm_bdg, mat_chrome, bevel=0.002, subsurf=0)
    created.append(obj_bdg)

    print(f"[SEDAN_HARDWARE] Successfully generated {len(created)} hardware objects.")
    return created
