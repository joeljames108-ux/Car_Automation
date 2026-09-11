"""
Sedan Monocoque Chassis & Structural Frame (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )
except ImportError:
    from sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )

def build_chassis(mats):
    created = []
    mat_steel = mats.get("chassis_steel")
    mat_alum = mats.get("billet_aluminum")
    mat_gloss = mats.get("gloss_black")

    print("[SEDAN_CHASSIS] Generating Monocoque Frame, Subframes & Crash Structures...")

    # ------------------------------------------------------------------------
    # 1. MAIN MONOCOQUE FLOORPAN & LONGITUDINAL RAILS
    # ------------------------------------------------------------------------
    bm_ch = bmesh.new()
    # Left and Right Side Sill Rails
    for sx in [-0.74, 0.74]:
        rc_c = bmesh.ops.create_cube(bm_ch, size=1.0)
        bmesh.ops.scale(bm_ch, vec=Vector((0.14, 3.10, 0.12)), verts=rc_c['verts'])
        bmesh.ops.translate(bm_ch, vec=Vector((sx, 0.00, 0.220)), verts=rc_c['verts'])
        
    # Main Passenger Floorpan Tub
    rc_tub = bmesh.ops.create_cube(bm_ch, size=1.0)
    bmesh.ops.scale(bm_ch, vec=Vector((1.36, 2.20, 0.08)), verts=rc_tub['verts'])
    bmesh.ops.translate(bm_ch, vec=Vector((0.00, -0.05, 0.200)), verts=rc_tub['verts'])
    
    # Transmission Tunnel Ridge
    rc_tn = bmesh.ops.create_cube(bm_ch, size=1.0)
    bmesh.ops.scale(bm_ch, vec=Vector((0.32, 2.20, 0.18)), verts=rc_tn['verts'])
    bmesh.ops.translate(bm_ch, vec=Vector((0.00, -0.05, 0.320)), verts=rc_tn['verts'])
    
    obj_ch = link_and_finish("GEO_Chassis_Floorpan", "06_Chassis_Monocoque", bm_ch, mat_steel, bevel=0.005, subsurf=0)
    created.append(obj_ch)

    # ------------------------------------------------------------------------
    # 2. FRONT & REAR HIGH-STRENGTH ALUMINUM SUBFRAMES
    # ------------------------------------------------------------------------
    bm_fs = bmesh.new()
    # Front Suspension Cradle Subframe
    rc_fs = bmesh.ops.create_cube(bm_fs, size=1.0)
    bmesh.ops.scale(bm_fs, vec=Vector((1.12, 0.78, 0.12)), verts=rc_fs['verts'])
    bmesh.ops.translate(bm_fs, vec=Vector((0.00, FRONT_AXLE_Y, 0.210)), verts=rc_fs['verts'])
    obj_fs = link_and_finish("GEO_Front_Subframe", "06_Chassis_Monocoque", bm_fs, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_fs)

    bm_rsf = bmesh.new()
    # Rear Suspension Cradle Subframe
    rc_rsf = bmesh.ops.create_cube(bm_rsf, size=1.0)
    bmesh.ops.scale(bm_rsf, vec=Vector((1.15, 0.82, 0.12)), verts=rc_rsf['verts'])
    bmesh.ops.translate(bm_rsf, vec=Vector((0.00, REAR_AXLE_Y, 0.210)), verts=rc_rsf['verts'])
    obj_rsf = link_and_finish("GEO_Rear_Subframe", "06_Chassis_Monocoque", bm_rsf, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_rsf)

    # ------------------------------------------------------------------------
    # 3. FIREWALL & ENGINE BAY STRUT TOWERS
    # ------------------------------------------------------------------------
    bm_fw = bmesh.new()
    # Firewall Bulkhead
    rc_fw = bmesh.ops.create_cube(bm_fw, size=1.0)
    bmesh.ops.scale(bm_fw, vec=Vector((1.46, 0.05, 0.68)), verts=rc_fw['verts'])
    bmesh.ops.translate(bm_fw, vec=Vector((0.00, 0.940, 0.580)), verts=rc_fw['verts'])
    
    # Front Shock Strut Towers (L & R)
    for sx in [-0.68, 0.68]:
        rc_st = bmesh.ops.create_cone(bm_fw, cap_ends=True, radius1=0.14, radius2=0.10, depth=0.35, segments=24)
        bmesh.ops.translate(bm_fw, vec=Vector((sx, FRONT_AXLE_Y, 0.520)), verts=rc_st['verts'])
        
    # Aluminum Strut Tower Cross-Brace
    make_tube(bm_fw, Vector((-0.68, FRONT_AXLE_Y, 0.680)), Vector((0.68, FRONT_AXLE_Y, 0.680)), radius=0.018)
    
    obj_fw = link_and_finish("GEO_Firewall_Strut_Towers", "06_Chassis_Monocoque", bm_fw, mat_steel, bevel=0.004, subsurf=0)
    created.append(obj_fw)

    # ------------------------------------------------------------------------
    # 4. FRONT & REAR CRASH STRUCTURES
    # ------------------------------------------------------------------------
    bm_cf = bmesh.new()
    rc_cf = bmesh.ops.create_cube(bm_cf, size=1.0)
    bmesh.ops.scale(bm_cf, vec=Vector((1.18, 0.12, 0.14)), verts=rc_cf['verts'])
    bmesh.ops.translate(bm_cf, vec=Vector((0.00, 2.240, 0.380)), verts=rc_cf['verts'])
    obj_cf = link_and_finish("GEO_Crash_Structure_Front", "06_Chassis_Monocoque", bm_cf, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_cf)

    bm_cr = bmesh.new()
    rc_cr = bmesh.ops.create_cube(bm_cr, size=1.0)
    bmesh.ops.scale(bm_cr, vec=Vector((1.20, 0.12, 0.14)), verts=rc_cr['verts'])
    bmesh.ops.translate(bm_cr, vec=Vector((0.00, -2.260, 0.420)), verts=rc_cr['verts'])
    obj_cr = link_and_finish("GEO_Crash_Structure_Rear", "06_Chassis_Monocoque", bm_cr, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_cr)

    print(f"[SEDAN_CHASSIS] Successfully generated {len(created)} chassis & structural objects.")
    return created
