"""
Hilux Rear Fascia & Lighting Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the rear bumper with integrated corner steps, central step tread, license plate mount,
and 3D sculpted vertical multi-component LED taillights with C-clamp light pipes.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from hilux_common import (
    create_bmesh_object,
    assign_material,
    apply_bevel_and_weighted_normals,
    create_box,
    bmesh_create_cube,
    bmesh_create_cylinder,
    bmesh_create_sphere,
    bmesh_create_torus,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_rot_z,
    mat_scale,
    REAR_AXLE_Y,
    REAR_BUMPER_Y
)

def build_rear_fascia(materials):
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_housing = materials.get("Mat_BlackPlastic_Housing")
    mat_reflector = materials.get("Mat_Reflector_Chrome")
    mat_stop = materials.get("Mat_LED_Taillight_Stop")
    mat_reverse = materials.get("Mat_LED_Reverse")
    mat_turn = materials.get("Mat_LED_TurnAmber")
    mat_lens_red = materials.get("Mat_OpticalGlass_Taillamp")
    mat_lens_clear = materials.get("Mat_OpticalGlass_Clear")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    
    col_name = "05_Rear_Fascia_Lighting"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Rear Stepped Bumper Assembly
    # Y = -2.76m to -2.86m, Z = 0.40m to 0.68m
    # -------------------------------------------------------------
    bm_rbump = bmesh.new()
    
    # Main Central Bumper Beam (seamlessly bridging up to the tailgate shut line)
    bmesh_create_cube(
        bm_rbump,
        size=0.08,
        matrix=mat_trans(0.0, -2.80, 0.58) @ mat_scale(20.0, 1.8, 4.4)
    )
    
    # Lower Central Step Recess with Anti-Slip Tread
    bmesh_create_cube(
        bm_rbump,
        size=0.04,
        matrix=mat_trans(0.0, -2.82, 0.48) @ mat_scale(18.0, 3.2, 0.8)
    )
    # Anti-slip tread grooves across center step
    for tx in [-0.28, -0.14, 0.0, 0.14, 0.28]:
        bmesh_create_cube(
            bm_rbump,
            size=0.01,
            matrix=mat_trans(tx, -2.82, 0.50) @ mat_scale(0.8, 10.0, 0.4)
        )
        
    # Left & Right Integrated Corner Kick-Steps (HiLux Signature)
    for mult in [1.0, -1.0]:
        # Stepped corner kick-plate
        bmesh_create_cube(
            bm_rbump,
            size=0.06,
            matrix=mat_trans(0.84 * mult, -2.78, 0.58) @ mat_rot_z(15 * mult) @ mat_scale(3.2, 2.5, 4.4)
        )
        # Corner step tread pad
        bmesh_create_cube(
            bm_rbump,
            size=0.03,
            matrix=mat_trans(0.84 * mult, -2.78, 0.72) @ mat_scale(4.8, 3.2, 0.5)
        )
        # Corner red safety reflector
        bmesh_create_cube(
            bm_rbump,
            size=0.015,
            matrix=mat_trans(0.86 * mult, -2.82, 0.46) @ mat_rot_z(15 * mult) @ mat_scale(8.0, 0.5, 2.2)
        )
        
    # Rear License Plate Recess & LED Illumination Lamps
    bmesh_create_cube(
        bm_rbump,
        size=0.02,
        matrix=mat_trans(0.0, -2.83, 0.56) @ mat_scale(24.0, 0.5, 6.5)
    )
    # Dual LED license plate lamps
    for lx in [-0.16, 0.16]:
        bmesh_create_cube(
            bm_rbump,
            size=0.015,
            matrix=mat_trans(lx, -2.82, 0.62) @ mat_scale(2.2, 0.8, 0.8)
        )
        
    obj_rbump = create_bmesh_object("REAR_Bumper_Step", col_name, bm_rbump)
    assign_material(obj_rbump, mat_trim)
    apply_bevel_and_weighted_normals(obj_rbump, width=0.003, segments=2)
    objects.append(obj_rbump)

    # -------------------------------------------------------------
    # 2. 3D Sculpted Vertical LED Taillight Assemblies (Left & Right)
    # Y = -2.70m to -2.78m, Z = 0.84m to 1.30m, X = ±0.80m to ±0.88m
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        # A. Rear Housing Bucket
        bm_tl_house = bmesh.new()
        bmesh_create_cube(
            bm_tl_house,
            size=0.05,
            matrix=mat_trans(0.82 * mult, -2.72, 1.07) @ mat_rot_z(10 * mult) @ mat_scale(1.6, 2.0, 9.2)
        )
        obj_tl_house = create_bmesh_object(f"LIGHT_TaillampHousing{sfx}", col_name, bm_tl_house)
        assign_material(obj_tl_house, mat_housing)
        objects.append(obj_tl_house)

        # B. Internal Chrome Reflector Tray
        bm_tl_refl = bmesh.new()
        bmesh_create_cube(
            bm_tl_refl,
            size=0.03,
            matrix=mat_trans(0.83 * mult, -2.74, 1.07) @ mat_rot_z(10 * mult) @ mat_scale(1.8, 1.2, 14.8)
        )
        obj_tl_refl = create_bmesh_object(f"LIGHT_TaillampReflector{sfx}", col_name, bm_tl_refl)
        assign_material(obj_tl_refl, mat_reflector)
        objects.append(obj_tl_refl)

        # C. C-Clamp Sculpted LED Stop / Tail Light Pipe (2025 Signature)
        bm_tl_pipe = bmesh.new()
        # Vertical outer spine of the C-clamp
        bmesh_create_cube(
            bm_tl_pipe,
            size=0.018,
            matrix=mat_trans(0.85 * mult, -2.75, 1.07) @ mat_scale(0.8, 0.8, 23.0)
        )
        # Upper horizontal return bar
        bmesh_create_cube(
            bm_tl_pipe,
            size=0.016,
            matrix=mat_trans(0.82 * mult, -2.755, 1.26) @ mat_scale(3.6, 0.7, 0.9)
        )
        # Lower horizontal return bar
        bmesh_create_cube(
            bm_tl_pipe,
            size=0.016,
            matrix=mat_trans(0.82 * mult, -2.755, 0.88) @ mat_scale(3.6, 0.7, 0.9)
        )
        obj_tl_pipe = create_bmesh_object(f"LIGHT_TaillampLED_Pipe{sfx}", col_name, bm_tl_pipe)
        assign_material(obj_tl_pipe, mat_stop)
        objects.append(obj_tl_pipe)

        # D. White LED Reverse Lamp (Center inner section)
        bm_tl_rev = bmesh.new()
        bmesh_create_cube(
            bm_tl_rev,
            size=0.02,
            matrix=mat_trans(0.81 * mult, -2.755, 1.02) @ mat_scale(2.4, 0.6, 2.2)
        )
        obj_tl_rev = create_bmesh_object(f"LIGHT_TaillampReverse{sfx}", col_name, bm_tl_rev)
        assign_material(obj_tl_rev, mat_reverse)
        objects.append(obj_tl_rev)

        # E. Amber LED Turn Indicator Strip
        bm_tl_turn = bmesh.new()
        bmesh_create_cube(
            bm_tl_turn,
            size=0.018,
            matrix=mat_trans(0.81 * mult, -2.755, 1.12) @ mat_scale(2.5, 0.6, 1.6)
        )
        obj_tl_turn = create_bmesh_object(f"LIGHT_TaillampTurn{sfx}", col_name, bm_tl_turn)
        assign_material(obj_tl_turn, mat_turn)
        objects.append(obj_tl_turn)

        # F. Sculpted Outer Optical Polycarbonate Lens Cover
        bm_tl_lens = bmesh.new()
        bmesh_create_cube(
            bm_tl_lens,
            size=0.01,
            matrix=mat_trans(0.83 * mult, -2.765, 1.07) @ mat_rot_z(10 * mult) @ mat_scale(10.0, 1.0, 45.0)
        )
        obj_tl_lens = create_bmesh_object(f"LIGHT_TaillampOuterLens{sfx}", col_name, bm_tl_lens)
        assign_material(obj_tl_lens, mat_lens_red)
        apply_bevel_and_weighted_normals(obj_tl_lens, width=0.001, segments=2)
        objects.append(obj_tl_lens)

    print(f"[HILUX] Rear Fascia generated with {len(objects)} objects.")
    return objects
