"""
Sedan Suspension, Steering & Coilovers (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y, HUB_Z
    )
except ImportError:
    from sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y, HUB_Z
    )

def build_suspension(mats):
    created = []
    mat_alum = mats.get("billet_aluminum")
    mat_steel = mats.get("chassis_steel")
    mat_caliper = mats.get("caliper") # For bright red coil springs
    mat_matte = mats.get("matte_black")

    print("[SEDAN_SUSPENSION] Generating Double-Wishbone Arms, Adaptive Coilovers & Steering Rack...")

    # ------------------------------------------------------------------------
    # 1. FRONT DOUBLE-WISHBONE SUSPENSION ARMS (L & R)
    # ------------------------------------------------------------------------
    bm_sf = bmesh.new()
    for sx in [-1, 1]:
        # Lower A-Arm
        make_tube(bm_sf, Vector((sx * 0.42, FRONT_AXLE_Y - 0.16, 0.22)), Vector((sx * 0.74, FRONT_AXLE_Y, 0.23)), radius=0.018)
        make_tube(bm_sf, Vector((sx * 0.42, FRONT_AXLE_Y + 0.16, 0.22)), Vector((sx * 0.74, FRONT_AXLE_Y, 0.23)), radius=0.018)
        make_tube(bm_sf, Vector((sx * 0.42, FRONT_AXLE_Y - 0.16, 0.22)), Vector((sx * 0.42, FRONT_AXLE_Y + 0.16, 0.22)), radius=0.020)
        
        # Upper Wishbone
        make_tube(bm_sf, Vector((sx * 0.46, FRONT_AXLE_Y - 0.12, 0.44)), Vector((sx * 0.72, FRONT_AXLE_Y, 0.44)), radius=0.015)
        make_tube(bm_sf, Vector((sx * 0.46, FRONT_AXLE_Y + 0.12, 0.44)), Vector((sx * 0.72, FRONT_AXLE_Y, 0.44)), radius=0.015)
        
        # Front Steering Knuckle / Upright
        rc_kn = bmesh.ops.create_cube(bm_sf, size=1.0)
        bmesh.ops.scale(bm_sf, vec=Vector((0.040, 0.060, 0.24)), verts=rc_kn['verts'])
        bmesh.ops.translate(bm_sf, vec=Vector((sx * 0.76, FRONT_AXLE_Y, 0.34)), verts=rc_kn['verts'])
        
    obj_sf = link_and_finish("GEO_Suspension_Front_Wishbones", "08_Suspension_Steering", bm_sf, mat_alum, bevel=0.003, subsurf=0)
    created.append(obj_sf)

    # ------------------------------------------------------------------------
    # 2. REAR MULTI-LINK SUSPENSION ARMS (L & R)
    # ------------------------------------------------------------------------
    bm_sr = bmesh.new()
    for sx in [-1, 1]:
        # Lower Camber Arm
        make_tube(bm_sr, Vector((sx * 0.44, REAR_AXLE_Y - 0.18, 0.22)), Vector((sx * 0.76, REAR_AXLE_Y, 0.23)), radius=0.018)
        make_tube(bm_sr, Vector((sx * 0.44, REAR_AXLE_Y + 0.18, 0.22)), Vector((sx * 0.76, REAR_AXLE_Y, 0.23)), radius=0.018)
        make_tube(bm_sr, Vector((sx * 0.44, REAR_AXLE_Y - 0.18, 0.22)), Vector((sx * 0.44, REAR_AXLE_Y + 0.18, 0.22)), radius=0.020)
        
        # Upper Control Link
        make_tube(bm_sr, Vector((sx * 0.48, REAR_AXLE_Y - 0.10, 0.45)), Vector((sx * 0.74, REAR_AXLE_Y, 0.45)), radius=0.016)
        make_tube(bm_sr, Vector((sx * 0.48, REAR_AXLE_Y + 0.10, 0.45)), Vector((sx * 0.74, REAR_AXLE_Y, 0.45)), radius=0.016)
        
        # Rear Wheel Carrier Upright
        rc_kn = bmesh.ops.create_cube(bm_sr, size=1.0)
        bmesh.ops.scale(bm_sr, vec=Vector((0.040, 0.060, 0.24)), verts=rc_kn['verts'])
        bmesh.ops.translate(bm_sr, vec=Vector((sx * 0.78, REAR_AXLE_Y, 0.34)), verts=rc_kn['verts'])
        
    obj_sr = link_and_finish("GEO_Suspension_Rear_MultiLink", "08_Suspension_Steering", bm_sr, mat_alum, bevel=0.003, subsurf=0)
    created.append(obj_sr)

    # ------------------------------------------------------------------------
    # 3. 4X ADAPTIVE COILOVER DAMPER STRUTS WITH RED SPRINGS
    # ------------------------------------------------------------------------
    bm_co = bmesh.new()
    for ay in [FRONT_AXLE_Y, REAR_AXLE_Y]:
        for sx in [-0.700, 0.700]:
            # Damper body cylinder
            rc_d = bmesh.ops.create_cone(bm_co, cap_ends=True, radius1=0.028, radius2=0.028, depth=0.38, segments=24)
            bmesh.ops.translate(bm_co, vec=Vector((sx, ay, 0.420)), verts=rc_d['verts'])
            
            # Helical coil spring representation (stepped concentric rings)
            for sz_offset in [-0.12, -0.06, 0.00, 0.06, 0.12]:
                rc_sp = bmesh.ops.create_cone(bm_co, cap_ends=False, radius1=0.046, radius2=0.046, depth=0.022, segments=24)
                bmesh.ops.translate(bm_co, vec=Vector((sx, ay, 0.420 + sz_offset)), verts=rc_sp['verts'])
                
    obj_co = link_and_finish("GEO_Adaptive_Coilovers", "08_Suspension_Steering", bm_co, mat_caliper, bevel=0.002, subsurf=0)
    created.append(obj_co)

    # ------------------------------------------------------------------------
    # 4. ELECTRIC POWER STEERING RACK & TIE RODS
    # ------------------------------------------------------------------------
    bm_st = bmesh.new()
    # Central rack housing
    rc_rk = bmesh.ops.create_cube(bm_st, size=1.0)
    bmesh.ops.scale(bm_st, vec=Vector((0.88, 0.080, 0.075)), verts=rc_rk['verts'])
    bmesh.ops.translate(bm_st, vec=Vector((0.00, FRONT_AXLE_Y + 0.100, 0.250)), verts=rc_rk['verts'])
    
    # Tie Rods to steering knuckles
    for sx in [-1, 1]:
        make_tube(bm_st, Vector((sx * 0.44, FRONT_AXLE_Y + 0.100, 0.250)), Vector((sx * 0.76, FRONT_AXLE_Y + 0.05, 0.260)), radius=0.014)
        
        # Rubber bellows boot
        rc_bt = bmesh.ops.create_cone(bm_st, cap_ends=True, radius1=0.025, radius2=0.025, depth=0.100, segments=16)
        bmesh.ops.rotate(bm_st, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_bt['verts'])
        bmesh.ops.translate(bm_st, vec=Vector((sx * 0.48, FRONT_AXLE_Y + 0.100, 0.250)), verts=rc_bt['verts'])
        
    obj_st = link_and_finish("GEO_Steering_Rack_Assembly", "08_Suspension_Steering", bm_st, mat_alum, bevel=0.003, subsurf=0)
    created.append(obj_st)

    # ------------------------------------------------------------------------
    # 5. FRONT & REAR TUBULAR ANTI-ROLL SWAY BARS
    # ------------------------------------------------------------------------
    bm_arb = bmesh.new()
    for ay in [FRONT_AXLE_Y + 0.20, REAR_AXLE_Y - 0.20]:
        make_tube(bm_arb, Vector((-0.68, ay, 0.22)), Vector((0.68, ay, 0.22)), radius=0.016)
        for sx in [-0.68, 0.68]:
            make_tube(bm_arb, Vector((sx, ay, 0.22)), Vector((sx, ay + (-0.12 if ay > 0 else 0.12), 0.24)), radius=0.014)
            
    obj_arb = link_and_finish("GEO_AntiRoll_SwayBars", "08_Suspension_Steering", bm_arb, mat_steel, bevel=0.002, subsurf=0)
    created.append(obj_arb)

    print(f"[SEDAN_SUSPENSION] Successfully generated {len(created)} suspension objects.")
    return created
