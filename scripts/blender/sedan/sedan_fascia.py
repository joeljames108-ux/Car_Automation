"""
Sedan Front Fascia & Aerodynamics (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_mirrored, link_and_finish, make_quad_patch,
        FRONT_BUMPER_Y
    )
except ImportError:
    from sedan_common import (
        link_mirrored, link_and_finish, make_quad_patch,
        FRONT_BUMPER_Y
    )

def build_front_fascia(mats):
    created = []
    mat_paint = mats.get("paint")
    mat_carbon = mats.get("carbon")
    mat_gloss = mats.get("gloss_black")
    mat_chrome = mats.get("chrome")

    print("[SEDAN_FASCIA] Generating Front Fascia, Grille & Carbon Splitter...")

    # ------------------------------------------------------------------------
    # 1. SCULPTED FRONT BUMPER COVER (GEO_Front_Bumper)
    # ------------------------------------------------------------------------
    bm_fb = bmesh.new()
    fb_rows = []
    fb_stations = [
        # (y, z, x_center, x_mid, x_outer)
        (2.300, 0.720, 0.590, 0.760, 0.925),
        (2.380, 0.590, 0.570, 0.740, 0.905),
        (2.440, 0.440, 0.550, 0.720, 0.885),
        (2.460, 0.310, 0.530, 0.690, 0.865),
        (2.420, 0.165, 0.500, 0.660, 0.835),
    ]
    for y_c, z_v, x1, x2, x3 in fb_stations:
        fb_rows.append([
            Vector((0.000, y_c, z_v)),
            Vector((x1 * 0.50, y_c, z_v)),
            Vector((x1, y_c - 0.040, z_v)),
            Vector((x2, y_c - 0.110, z_v * 0.98)),
            Vector((x3, y_c - 0.220, z_v * 0.95)),
        ])
    make_quad_patch(bm_fb, fb_rows)
    bmesh.ops.solidify(bm_fb, geom=bm_fb.faces, thickness=0.005)
    obj_fb = link_mirrored("GEO_Front_Bumper", "02_Bumpers_Fascia", bm_fb, mat_paint, bevel=0.004, subsurf=1)
    created.append(obj_fb)

    # ------------------------------------------------------------------------
    # 2. SIGNATURE EXECUTIVE RADIATOR GRILLE & CHROME SURROUND
    # ------------------------------------------------------------------------
    bm_gr = bmesh.new()
    # Inner honeycomb mesh backing
    rc_m = bmesh.ops.create_cube(bm_gr, size=1.0)
    bmesh.ops.scale(bm_gr, vec=Vector((0.64, 0.035, 0.23)), verts=rc_m['verts'])
    bmesh.ops.translate(bm_gr, vec=Vector((0.00, 2.420, 0.540)), verts=rc_m['verts'])
    
    # Vertical grille slats
    for sx in [-0.26, -0.18, -0.10, -0.02, 0.06, 0.14, 0.22]:
        rc_sl = bmesh.ops.create_cube(bm_gr, size=1.0)
        bmesh.ops.scale(bm_gr, vec=Vector((0.012, 0.045, 0.22)), verts=rc_sl['verts'])
        bmesh.ops.translate(bm_gr, vec=Vector((sx, 2.430, 0.540)), verts=rc_sl['verts'])
        
    obj_gr = link_and_finish("GEO_Grille_Mesh", "02_Bumpers_Fascia", bm_gr, mat_gloss, bevel=0.003, subsurf=0)
    created.append(obj_gr)

    # Polished Chrome Grille Perimeter Bezel
    bm_gb = bmesh.new()
    rc_gb = bmesh.ops.create_cube(bm_gb, size=1.0)
    bmesh.ops.scale(bm_gb, vec=Vector((0.68, 0.020, 0.26)), verts=rc_gb['verts'])
    bmesh.ops.translate(bm_gb, vec=Vector((0.00, 2.435, 0.540)), verts=rc_gb['verts'])
    obj_gb = link_and_finish("GEO_Grille_Bezel_Chrome", "02_Bumpers_Fascia", bm_gb, mat_chrome, bevel=0.006, subsurf=0)
    created.append(obj_gb)

    # ------------------------------------------------------------------------
    # 3. LOWER AIR DAM & SIDE BRAKE COOLING DUCTS
    # ------------------------------------------------------------------------
    bm_ad = bmesh.new()
    # Central lower air dam
    rc_ad = bmesh.ops.create_cube(bm_ad, size=1.0)
    bmesh.ops.scale(bm_ad, vec=Vector((0.72, 0.040, 0.12)), verts=rc_ad['verts'])
    bmesh.ops.translate(bm_ad, vec=Vector((0.00, 2.440, 0.260)), verts=rc_ad['verts'])
    
    # Active Aero Louvers inside air dam
    for vz in [0.23, 0.26, 0.29]:
        rc_lv = bmesh.ops.create_cube(bm_ad, size=1.0)
        bmesh.ops.scale(bm_ad, vec=Vector((0.68, 0.030, 0.012)), verts=rc_lv['verts'])
        bmesh.ops.translate(bm_ad, vec=Vector((0.00, 2.445, vz)), verts=rc_lv['verts'])
        
    # Side Brake Duct Curtains (L & R)
    for sx in [-0.68, 0.68]:
        rc_sc = bmesh.ops.create_cube(bm_ad, size=1.0)
        bmesh.ops.scale(bm_ad, vec=Vector((0.16, 0.060, 0.16)), verts=rc_sc['verts'])
        bmesh.ops.rotate(bm_ad, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14 if sx > 0 else 14), 4, 'Z'), verts=rc_sc['verts'])
        bmesh.ops.translate(bm_ad, vec=Vector((sx, 2.380, 0.320)), verts=rc_sc['verts'])
        
    obj_ad = link_and_finish("GEO_Lower_Air_Dam_Ducts", "02_Bumpers_Fascia", bm_ad, mat_gloss, bevel=0.003, subsurf=0)
    created.append(obj_ad)

    # ------------------------------------------------------------------------
    # 4. CARBON FIBER FRONT SPLITTER WITH SIDE WINGLETS
    # ------------------------------------------------------------------------
    bm_sp = bmesh.new()
    sp_rows = []
    for i in range(6):
        t_s = i / 5.0
        sp_x = 0.890 * t_s
        sp_y = 2.450 - 0.180 * (t_s**2)
        sp_rows.append([
            Vector((sp_x, sp_y, 0.135)),
            Vector((sp_x, sp_y + 0.075, 0.130)),
        ])
    make_quad_patch(bm_sp, sp_rows)
    bmesh.ops.solidify(bm_sp, geom=bm_sp.faces, thickness=0.018)
    
    # Aerodynamic Endplate Winglets
    for sx in [-0.890, 0.890]:
        rc_w = bmesh.ops.create_cube(bm_sp, size=1.0)
        bmesh.ops.scale(bm_sp, vec=Vector((0.020, 0.14, 0.065)), verts=rc_w['verts'])
        bmesh.ops.translate(bm_sp, vec=Vector((sx, 2.360, 0.165)), verts=rc_w['verts'])
        
    obj_sp = link_mirrored("GEO_Front_Splitter", "02_Bumpers_Fascia", bm_sp, mat_carbon, bevel=0.003, subsurf=0)
    created.append(obj_sp)

    # Carbon Fiber Front Canards (L & R)
    bm_can = bmesh.new()
    for sx in [-1, 1]:
        rc_c = bmesh.ops.create_cube(bm_can, size=1.0)
        bmesh.ops.scale(bm_can, vec=Vector((0.14, 0.16, 0.012)), verts=rc_c['verts'])
        bmesh.ops.rotate(bm_can, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16), 4, 'X'), verts=rc_c['verts'])
        bmesh.ops.translate(bm_can, vec=Vector((sx * 0.880, 2.300, 0.400)), verts=rc_c['verts'])
    obj_can = link_and_finish("GEO_Front_Canards", "02_Bumpers_Fascia", bm_can, mat_carbon, bevel=0.003, subsurf=0)
    created.append(obj_can)

    print(f"[SEDAN_FASCIA] Successfully generated {len(created)} front fascia objects.")
    return created
