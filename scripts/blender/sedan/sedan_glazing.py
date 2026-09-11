"""
Sedan Greenhouse Glazing & Optical Dielectric Glass (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
try:
    from .sedan_common import (
        link_mirrored, link_sided, link_and_finish, make_quad_patch,
        HOOD_REAR_Y, COWL_Z, BELTLINE_Z,
        ROOF_FRONT_Y, ROOF_REAR_Y, ROOF_CROWN_Z,
        BACKLITE_BOTTOM_Y
    )
except ImportError:
    from sedan_common import (
        link_mirrored, link_sided, link_and_finish, make_quad_patch,
        HOOD_REAR_Y, COWL_Z, BELTLINE_Z,
        ROOF_FRONT_Y, ROOF_REAR_Y, ROOF_CROWN_Z,
        BACKLITE_BOTTOM_Y
    )

def build_greenhouse_glazing(mats):
    created = []
    mat_glass_clear = mats.get("glass_clear")
    mat_glass_tint = mats.get("glass_tint")
    mat_gloss = mats.get("gloss_black")

    print("[SEDAN_GLAZING] Generating Optical Dielectric Windshield, Panoramic Roof & Flush Side Windows...")

    # ------------------------------------------------------------------------
    # 1. OPTICAL DIELECTRIC CLEAR WINDSHIELD
    # ------------------------------------------------------------------------
    bm_ws = bmesh.new()
    ws_rows = []
    for i in range(8):
        t_w = i / 7.0
        w_y = HOOD_REAR_Y + (ROOF_FRONT_Y - HOOD_REAR_Y) * t_w
        w_z = COWL_Z + (ROOF_CROWN_Z - COWL_Z) * t_w + 0.038 * math.sin(t_w * math.pi)
        w_span = 0.650 + (0.535 - 0.650) * t_w
        ws_rows.append([
            Vector((0.000, w_y, w_z)),
            Vector((w_span * 0.35, w_y, w_z * 0.996)),
            Vector((w_span * 0.72, w_y, w_z * 0.988)),
            Vector((w_span * 1.00, w_y - 0.015, w_z * 0.978)),
        ])
    make_quad_patch(bm_ws, ws_rows)
    bmesh.ops.solidify(bm_ws, geom=bm_ws.faces, thickness=0.004)
    obj_ws = link_mirrored("GEO_Windshield", "04_Greenhouse_Glazing", bm_ws, mat_glass_clear, bevel=0.002, subsurf=1)
    created.append(obj_ws)

    # ------------------------------------------------------------------------
    # 2. PANORAMIC TINTED GLASS ROOF
    # ------------------------------------------------------------------------
    bm_rf_gl = bmesh.new()
    rf_rows = []
    for i in range(8):
        t_r = i / 7.0
        r_y = (ROOF_FRONT_Y - 0.04) + ((ROOF_REAR_Y + 0.04) - (ROOF_FRONT_Y - 0.04)) * t_r
        peak_z = ROOF_CROWN_Z + 0.014 * math.sin(t_r * math.pi)
        rf_rows.append([
            Vector((0.000, r_y, peak_z)),
            Vector((0.200, r_y, peak_z + 0.004)),
            Vector((0.380, r_y, peak_z - 0.002)),
            Vector((0.480, r_y, peak_z - 0.008)),
        ])
    make_quad_patch(bm_rf_gl, rf_rows)
    bmesh.ops.solidify(bm_rf_gl, geom=bm_rf_gl.faces, thickness=0.004)
    obj_rf_gl = link_mirrored("GEO_Panoramic_Roof_Glass", "04_Greenhouse_Glazing", bm_rf_gl, mat_glass_tint, bevel=0.002, subsurf=1)
    created.append(obj_rf_gl)

    # ------------------------------------------------------------------------
    # 3. HEATED REAR GLASS / BACKLITE WITH PRIVACY TINT
    # ------------------------------------------------------------------------
    bm_rg = bmesh.new()
    rg_rows = []
    for i in range(8):
        t_g = i / 7.0
        g_y = ROOF_REAR_Y + (BACKLITE_BOTTOM_Y - ROOF_REAR_Y) * t_g
        g_z = ROOF_CROWN_Z + (1.040 - ROOF_CROWN_Z) * t_g + 0.032 * math.sin(t_g * math.pi)
        g_span = 0.535 + (0.650 - 0.535) * t_g
        rg_rows.append([
            Vector((0.000, g_y, g_z)),
            Vector((g_span * 0.35, g_y, g_z * 0.996)),
            Vector((g_span * 0.72, g_y, g_z * 0.988)),
            Vector((g_span * 1.00, g_y + 0.015, g_z * 0.978)),
        ])
    make_quad_patch(bm_rg, rg_rows)
    bmesh.ops.solidify(bm_rg, geom=bm_rg.faces, thickness=0.004)
    obj_rg = link_mirrored("GEO_Rear_Glass", "04_Greenhouse_Glazing", bm_rg, mat_glass_tint, bevel=0.002, subsurf=1)
    created.append(obj_rg)

    # ------------------------------------------------------------------------
    # 4. FLUSH FRONT SIDE DOOR WINDOWS (L & R)
    # ------------------------------------------------------------------------
    bm_swf = bmesh.new()
    swf_rows = []
    for i in range(8):
        t_s = i / 7.0
        sy = 0.920 + (-0.280 - 0.920) * t_s
        if sy >= ROOF_FRONT_Y:
            t_a = (sy - 0.920) / (ROOF_FRONT_Y - 0.920)
            z_top = 0.930 + (ROOF_CROWN_Z - 0.02 - 0.930) * t_a
            x_top = 0.640 + (0.540 - 0.640) * t_a
        else:
            z_top = ROOF_CROWN_Z - 0.02
            x_top = 0.540
        swf_rows.append([
            Vector((x_top, sy, z_top)),
            Vector((x_top + (0.860 - x_top) * 0.5, sy, (z_top + BELTLINE_Z) * 0.5)),
            Vector((0.860, sy, BELTLINE_Z)),
        ])
    make_quad_patch(bm_swf, swf_rows)
    bmesh.ops.solidify(bm_swf, geom=bm_swf.faces, thickness=0.003)
    obj_sw_fl, obj_sw_fr = link_sided("GEO_SideWindow_FL", "GEO_SideWindow_FR", "04_Greenhouse_Glazing", bm_swf, mat_glass_clear, bevel=0.001, subsurf=0)
    created.extend([obj_sw_fl, obj_sw_fr])

    # ------------------------------------------------------------------------
    # 5. FLUSH REAR SIDE DOOR WINDOWS & HOFMEISTER KINK GLASS (L & R)
    # ------------------------------------------------------------------------
    bm_swr = bmesh.new()
    swr_rows = []
    for i in range(8):
        t_s = i / 7.0
        sy = -0.280 + (-1.280 - (-0.280)) * t_s
        if sy >= ROOF_REAR_Y:
            z_top = ROOF_CROWN_Z - 0.02
            x_top = 0.540
        else:
            t_c = (sy - ROOF_REAR_Y) / (-1.280 - ROOF_REAR_Y)
            z_top = (ROOF_CROWN_Z - 0.02) + (0.970 - (ROOF_CROWN_Z - 0.02)) * t_c
            x_top = 0.540 + (0.850 - 0.540) * t_c
        swr_rows.append([
            Vector((x_top, sy, z_top)),
            Vector((x_top + (0.860 - x_top) * 0.5, sy, (z_top + BELTLINE_Z) * 0.5)),
            Vector((0.860, sy, BELTLINE_Z)),
        ])
    make_quad_patch(bm_swr, swr_rows)
    bmesh.ops.solidify(bm_swr, geom=bm_swr.faces, thickness=0.003)
    obj_sw_rl, obj_sw_rr = link_sided("GEO_SideWindow_RL", "GEO_SideWindow_RR", "04_Greenhouse_Glazing", bm_swr, mat_glass_tint, bevel=0.001, subsurf=0)
    created.extend([obj_sw_rl, obj_sw_rr])

    print(f"[SEDAN_GLAZING] Successfully generated {len(created)} glazing objects.")
    return created
