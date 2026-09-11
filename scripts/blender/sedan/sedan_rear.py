"""
Sedan Rear Fascia, Diffuser & Quad Exhausts (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_mirrored, link_and_finish, make_quad_patch,
        REAR_BUMPER_Y
    )
except ImportError:
    from sedan_common import (
        link_mirrored, link_and_finish, make_quad_patch,
        REAR_BUMPER_Y
    )

def build_rear_fascia(mats):
    created = []
    mat_paint = mats.get("paint")
    mat_carbon = mats.get("carbon")
    mat_gloss = mats.get("gloss_black")
    mat_exhaust = mats.get("exhaust_titanium")
    mat_tail = mats.get("oled_tail")

    print("[SEDAN_REAR] Generating Rear Bumper, Diffuser, Side Skirts & Quad Exhausts...")

    # ------------------------------------------------------------------------
    # 1. SCULPTED REAR BUMPER COVER (GEO_Rear_Bumper)
    # ------------------------------------------------------------------------
    bm_rb = bmesh.new()
    rb_rows = []
    rb_stations = [
        (-2.380, 1.010, 0.600, 0.760, 0.940),
        (-2.440, 0.820, 0.580, 0.740, 0.920),
        (-2.470, 0.620, 0.560, 0.720, 0.900),
        (-2.450, 0.400, 0.540, 0.700, 0.880),
        (-2.400, 0.200, 0.520, 0.680, 0.850),
    ]
    for y_v, z_v, x1, x2, x3 in rb_stations:
        rb_rows.append([
            Vector((0.000, y_v, z_v)),
            Vector((x1 * 0.50, y_v, z_v)),
            Vector((x1, y_v + 0.040, z_v)),
            Vector((x2, y_v + 0.110, z_v * 0.98)),
            Vector((x3, y_v + 0.220, z_v * 0.95)),
        ])
    make_quad_patch(bm_rb, rb_rows)
    bmesh.ops.solidify(bm_rb, geom=bm_rb.faces, thickness=0.005)
    obj_rb = link_mirrored("GEO_Rear_Bumper", "02_Bumpers_Fascia", bm_rb, mat_paint, bevel=0.004, subsurf=1)
    created.append(obj_rb)

    # ------------------------------------------------------------------------
    # 2. CARBON FIBER REAR DIFFUSER WITH VERTICAL STRAKES
    # ------------------------------------------------------------------------
    bm_df = bmesh.new()
    # Main diffuser tray
    rc_d = bmesh.ops.create_cube(bm_df, size=1.0)
    bmesh.ops.scale(bm_df, vec=Vector((1.46, 0.44, 0.048)), verts=rc_d['verts'])
    bmesh.ops.translate(bm_df, vec=Vector((0.00, -2.360, 0.210)), verts=rc_d['verts'])
    
    # 4 Vertical Aerodynamic Strakes
    for sx in [-0.42, -0.18, 0.18, 0.42]:
        rc_fin = bmesh.ops.create_cube(bm_df, size=1.0)
        bmesh.ops.scale(bm_df, vec=Vector((0.016, 0.38, 0.075)), verts=rc_fin['verts'])
        bmesh.ops.translate(bm_df, vec=Vector((sx, -2.360, 0.180)), verts=rc_fin['verts'])
        
    obj_df = link_and_finish("GEO_Rear_Diffuser", "02_Bumpers_Fascia", bm_df, mat_carbon, bevel=0.003, subsurf=0)
    created.append(obj_df)

    # ------------------------------------------------------------------------
    # 3. QUAD TITANIUM POLISHED EXHAUST TIPS (DUAL TWIN PIPES)
    # ------------------------------------------------------------------------
    bm_ex = bmesh.new()
    for sx in [-0.68, -0.58, 0.58, 0.68]:
        # Cylindrical outer tip with slash cut bevel
        rc_pipe = bmesh.ops.create_cone(bm_ex, cap_ends=True, radius1=0.048, radius2=0.048, depth=0.200, segments=32)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_pipe['verts'])
        bmesh.ops.translate(bm_ex, vec=Vector((sx, -2.420, 0.235)), verts=rc_pipe['verts'])
    obj_ex = link_and_finish("GEO_Quad_Exhaust_Tips", "07_Powertrain_Drivetrain", bm_ex, mat_exhaust, bevel=0.002, subsurf=0)
    created.append(obj_ex)

    # ------------------------------------------------------------------------
    # 4. REAR REFLECTORS & LICENSE PLATE RECESS
    # ------------------------------------------------------------------------
    bm_ref = bmesh.new()
    for sx in [-0.74, 0.74]:
        rc_rf = bmesh.ops.create_cube(bm_ref, size=1.0)
        bmesh.ops.scale(bm_ref, vec=Vector((0.14, 0.020, 0.035)), verts=rc_rf['verts'])
        bmesh.ops.translate(bm_ref, vec=Vector((sx, -2.400, 0.440)), verts=rc_rf['verts'])
    obj_ref = link_and_finish("GEO_Rear_Reflectors", "03_Lighting_Optics", bm_ref, mat_tail, bevel=0.002, subsurf=0)
    created.append(obj_ref)

    # ------------------------------------------------------------------------
    # 5. CARBON FIBER SIDE SKIRT EXTENSION BLADES (L & R)
    # ------------------------------------------------------------------------
    bm_sk = bmesh.new()
    for sx in [-0.900, 0.900]:
        rc_sk = bmesh.ops.create_cube(bm_sk, size=1.0)
        bmesh.ops.scale(bm_sk, vec=Vector((0.055, 2.180, 0.026)), verts=rc_sk['verts'])
        bmesh.ops.translate(bm_sk, vec=Vector((sx, 0.000, 0.155)), verts=rc_sk['verts'])
        
        # Rear aero fin at skirt termination
        rc_fn = bmesh.ops.create_cube(bm_sk, size=1.0)
        bmesh.ops.scale(bm_sk, vec=Vector((0.016, 0.160, 0.070)), verts=rc_fn['verts'])
        bmesh.ops.translate(bm_sk, vec=Vector((sx + (0.020 if sx > 0 else -0.020), -1.050, 0.180)), verts=rc_fn['verts'])
        
    obj_sk = link_and_finish("GEO_Side_Skirts", "02_Bumpers_Fascia", bm_sk, mat_carbon, bevel=0.003, subsurf=0)
    created.append(obj_sk)

    print(f"[SEDAN_REAR] Successfully generated {len(created)} rear fascia & skirt objects.")
    return created
