"""
Sedan Matrix LED & OLED Lighting Optics (Blender 4.x / 5.x)
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

def build_lighting_optics(mats):
    created = []
    mat_gloss = mats.get("gloss_black")
    mat_chrome = mats.get("chrome")
    mat_led_white = mats.get("led_projector")
    mat_drl_blue = mats.get("drl_ice_blue")
    mat_oled_red = mats.get("oled_tail")
    mat_amber = mats.get("led_amber")
    mat_lens = mats.get("lens")

    print("[SEDAN_LIGHTING] Generating Matrix LED Projectors, DRL Lightguides & 3D OLED Taillights...")

    # ------------------------------------------------------------------------
    # 1. MATRIX LED HEADLIGHT CLUSTERS (L & R)
    # ------------------------------------------------------------------------
    def make_headlight(is_left):
        bm = bmesh.new()
        sx = 1 if is_left else -1
        
        # 1A. Dark housing bucket
        rc_h = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.15, 0.24, 0.065)), verts=rc_h['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_h['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.690, 2.220, 0.680)), verts=rc_h['verts'])
        
        # 1B. Twin Matrix Projector Lenses
        for dy_pj, dz_pj in [(-0.035, 0.010), (0.035, -0.010)]:
            rc_pj = bmesh.ops.create_cone(bm, cap_ends=True, radius1=0.030, radius2=0.030, depth=0.025, segments=24)
            bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_pj['verts'])
            bmesh.ops.translate(bm, vec=Vector((sx * (0.690 + dy_pj * 0.45), 2.250 + dy_pj, 0.680 + dz_pj)), verts=rc_pj['verts'])
            
        # 1C. Glowing Ice-Blue DRL Lightguide Brow
        rc_drl = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.145, 0.014, 0.009)), verts=rc_drl['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_drl['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.690, 2.260, 0.715)), verts=rc_drl['verts'])
        
        # 1D. Sequential Amber Turn Indicator
        rc_ind = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.120, 0.012, 0.007)), verts=rc_ind['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_ind['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.700, 2.245, 0.645)), verts=rc_ind['verts'])
        
        return bm

    bm_hl_l = make_headlight(True)
    bm_hl_r = make_headlight(False)
    obj_hl_l = link_and_finish("GEO_Headlight_L", "03_Lighting_Optics", bm_hl_l, mat_led_white, bevel=0.002, subsurf=0)
    obj_hl_r = link_and_finish("GEO_Headlight_R", "03_Lighting_Optics", bm_hl_r, mat_led_white, bevel=0.002, subsurf=0)
    created.extend([obj_hl_l, obj_hl_r])

    # Headlight Protective Polycarbonate Outer Lenses
    def make_headlight_lens(is_left):
        bm = bmesh.new()
        sx = 1 if is_left else -1
        rc_l = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.17, 0.015, 0.080)), verts=rc_l['verts'])
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_l['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * 0.690, 2.270, 0.680)), verts=rc_l['verts'])
        return bm

    bm_len_l = make_headlight_lens(True)
    bm_len_r = make_headlight_lens(False)
    obj_len_l = link_and_finish("GEO_Headlight_Lens_L", "03_Lighting_Optics", bm_len_l, mat_lens, bevel=0.001, subsurf=0)
    obj_len_r = link_and_finish("GEO_Headlight_Lens_R", "03_Lighting_Optics", bm_len_r, mat_lens, bevel=0.001, subsurf=0)
    created.extend([obj_len_l, obj_len_r])

    # ------------------------------------------------------------------------
    # 2. CONTINUOUS FULL-WIDTH 3D OLED TAILLIGHT BAR
    # ------------------------------------------------------------------------
    def make_taillight_bar():
        bm = bmesh.new()
        # Center connecting ruby bar across trunk decklid
        rc_cb = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.85, 0.035, 0.024)), verts=rc_cb['verts'])
        bmesh.ops.translate(bm, vec=Vector((0.00, -2.400, 0.900)), verts=rc_cb['verts'])
        
        # Outer L and R blade clusters
        for sx in [-1, 1]:
            rc_ob = bmesh.ops.create_cube(bm, size=1.0)
            bmesh.ops.scale(bm, vec=Vector((0.32, 0.045, 0.038)), verts=rc_ob['verts'])
            bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(10 * sx), 4, 'Z'), verts=rc_ob['verts'])
            bmesh.ops.translate(bm, vec=Vector((sx * 0.640, -2.380, 0.895)), verts=rc_ob['verts'])
            
            # Internal geometric OLED segments
            for dx in [0.00, 0.06, 0.12]:
                rc_seg = bmesh.ops.create_cube(bm, size=1.0)
                bmesh.ops.scale(bm, vec=Vector((0.022, 0.030, 0.025)), verts=rc_seg['verts'])
                bmesh.ops.translate(bm, vec=Vector((sx * (0.540 + dx), -2.375, 0.895)), verts=rc_seg['verts'])
                
        return bm

    bm_tb = make_taillight_bar()
    obj_tb = link_and_finish("GEO_Taillight_Lightbar_OLED", "03_Lighting_Optics", bm_tb, mat_oled_red, bevel=0.002, subsurf=0)
    created.append(obj_tb)

    # ------------------------------------------------------------------------
    # 3. CHMSL (CENTER HIGH-MOUNTED STOP LAMP)
    # ------------------------------------------------------------------------
    bm_chmsl = bmesh.new()
    rc_ch = bmesh.ops.create_cube(bm_chmsl, size=1.0)
    bmesh.ops.scale(bm_chmsl, vec=Vector((0.40, 0.025, 0.015)), verts=rc_ch['verts'])
    bmesh.ops.translate(bm_chmsl, vec=Vector((0.00, -0.760, 1.425)), verts=rc_ch['verts'])
    obj_chmsl = link_and_finish("GEO_Brake_Light_CHMSL", "03_Lighting_Optics", bm_chmsl, mat_oled_red, bevel=0.002, subsurf=0)
    created.append(obj_chmsl)

    print(f"[SEDAN_LIGHTING] Successfully generated {len(created)} lighting optic objects.")
    return created
