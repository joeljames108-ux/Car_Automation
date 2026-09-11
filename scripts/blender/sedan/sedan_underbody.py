"""
Sedan Underbody Aero Tray & Wheelhouse Liners (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )
except ImportError:
    from sedan_common import (
        link_and_finish,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )

def build_underbody(mats):
    created = []
    mat_carbon = mats.get("carbon")
    mat_matte = mats.get("matte_black")
    mat_gloss = mats.get("gloss_black")

    print("[SEDAN_UNDERBODY] Generating Flat Underbody Aero Tray & Wheelhouse Liners...")

    # ------------------------------------------------------------------------
    # 1. FLAT CARBON FIBER UNDERBODY AERO TRAY
    # ------------------------------------------------------------------------
    bm_ub = bmesh.new()
    rc_ub = bmesh.ops.create_cube(bm_ub, size=1.0)
    bmesh.ops.scale(bm_ub, vec=Vector((1.68, 4.25, 0.016)), verts=rc_ub['verts'])
    bmesh.ops.translate(bm_ub, vec=Vector((0.00, -0.05, 0.130)), verts=rc_ub['verts'])
    
    # NACA ducts for gearbox and differential cooling
    for ny in [0.85, -0.85]:
        rc_naca = bmesh.ops.create_cube(bm_ub, size=1.0)
        bmesh.ops.scale(bm_ub, vec=Vector((0.18, 0.28, 0.024)), verts=rc_naca['verts'])
        bmesh.ops.translate(bm_ub, vec=Vector((0.00, ny, 0.135)), verts=rc_naca['verts'])
        
    obj_ub = link_and_finish("GEO_Underbody_Flat_Tray", "11_Underbody_Aero", bm_ub, mat_carbon, bevel=0.002, subsurf=0)
    created.append(obj_ub)

    # ------------------------------------------------------------------------
    # 2. INNER WHEELHOUSE SPLASH LINERS (FRONT & REAR)
    # ------------------------------------------------------------------------
    bm_wh_f = bmesh.new()
    for sx in [-0.80, 0.80]:
        rc_wf = bmesh.ops.create_cone(bm_wh_f, cap_ends=False, radius1=0.385, radius2=0.385, depth=0.22, segments=32)
        bmesh.ops.rotate(bm_wh_f, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_wf['verts'])
        bmesh.ops.translate(bm_wh_f, vec=Vector((sx, FRONT_AXLE_Y, 0.340)), verts=rc_wf['verts'])
    # Remove lower half below rocker level (Z < 0.20)
    lower_verts_f = [v for v in bm_wh_f.verts if v.co.z < 0.20]
    bmesh.ops.delete(bm_wh_f, geom=lower_verts_f, context='VERTS')
    obj_wh_f = link_and_finish("GEO_Wheelhouse_Liner_Front", "11_Underbody_Aero", bm_wh_f, mat_gloss, bevel=0.0, subsurf=0)
    created.append(obj_wh_f)

    bm_wh_r = bmesh.new()
    for sx in [-0.80, 0.80]:
        rc_wr = bmesh.ops.create_cone(bm_wh_r, cap_ends=False, radius1=0.390, radius2=0.390, depth=0.24, segments=32)
        bmesh.ops.rotate(bm_wh_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_wr['verts'])
        bmesh.ops.translate(bm_wh_r, vec=Vector((sx, REAR_AXLE_Y, 0.340)), verts=rc_wr['verts'])
    # Remove lower half below rocker level (Z < 0.20)
    lower_verts_r = [v for v in bm_wh_r.verts if v.co.z < 0.20]
    bmesh.ops.delete(bm_wh_r, geom=lower_verts_r, context='VERTS')
    obj_wh_r = link_and_finish("GEO_Wheelhouse_Liner_Rear", "11_Underbody_Aero", bm_wh_r, mat_gloss, bevel=0.0, subsurf=0)
    created.append(obj_wh_r)

    print(f"[SEDAN_UNDERBODY] Successfully generated {len(created)} underbody & liner objects.")
    return created
