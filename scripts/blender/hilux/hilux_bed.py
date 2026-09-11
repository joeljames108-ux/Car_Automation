"""
Hilux Cargo Bed & Aerodynamic Sail Panel Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs outer bed panels, inner corrugated bed with tie-downs, tailgate with spoiler lip & handle,
bed rail caps, and the signature 2025 aerodynamic sail panel / sport bar.
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
    bmesh_create_torus,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_rot_z,
    mat_scale,
    REAR_AXLE_Y,
    OVERALL_WIDTH
)

def build_cargo_bed(materials):
    mat_bronze = materials.get("Mat_Hilux_OxideBronze")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_bedliner = materials.get("Mat_BedLiner_Rough")
    mat_sportbar = materials.get("Mat_SportBar_Composite")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    mat_chmsl = materials.get("Mat_LED_Taillight_Stop")
    
    col_name = "03_Cargo_Bed"
    objects = []
    
    # Coordinates for bed:
    # Front bulkhead: Y = -1.26m
    # Tailgate outer edge: Y = -2.76m
    # Bed length = 1.50m
    # Bed floor Z = 0.80m, Bed rail top Z = 1.30m, Lower outer sill Z = 0.46m
    
    # -------------------------------------------------------------
    # 1. Outer Bed Side Panels (Left & Right)
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_side = bmesh.new()
        
        # Outer panel vertices
        # Top rail outer edge
        v_top_f = bm_side.verts.new((0.86 * mult, -1.26, 1.30))
        v_top_m = bm_side.verts.new((0.87 * mult, REAR_AXLE_Y, 1.30))
        v_top_r = bm_side.verts.new((0.86 * mult, -2.76, 1.30))
        
        # Mid-shoulder character crease
        v_mid_f = bm_side.verts.new((0.89 * mult, -1.26, 0.94))
        v_mid_m = bm_side.verts.new((0.90 * mult, REAR_AXLE_Y, 0.94))
        v_mid_r = bm_side.verts.new((0.88 * mult, -2.76, 0.94))
        
        # Lower sill / wheel arch contour
        v_bot_f = bm_side.verts.new((0.82 * mult, -1.26, 0.46))
        v_arch_f = bm_side.verts.new((0.86 * mult, REAR_AXLE_Y + 0.48, 0.48))
        v_arch_t = bm_side.verts.new((0.89 * mult, REAR_AXLE_Y, 0.82))
        v_arch_r = bm_side.verts.new((0.86 * mult, REAR_AXLE_Y - 0.48, 0.48))
        v_bot_r = bm_side.verts.new((0.82 * mult, -2.76, 0.52))
        
        # Faces: Top half
        bm_side.faces.new((v_top_f, v_top_m, v_mid_m, v_mid_f))
        bm_side.faces.new((v_top_m, v_top_r, v_mid_r, v_mid_m))
        
        # Faces: Lower half around wheel arch
        bm_side.faces.new((v_mid_f, v_mid_m, v_arch_t, v_arch_f))
        bm_side.faces.new((v_mid_f, v_arch_f, v_bot_f))
        bm_side.faces.new((v_mid_m, v_mid_r, v_arch_r, v_arch_t))
        bm_side.faces.new((v_mid_r, v_bot_r, v_arch_r))
        
        bmesh.ops.recalc_face_normals(bm_side, faces=bm_side.faces)
        
        obj_side = create_bmesh_object(f"BED_OuterSide{sfx}", col_name, bm_side)
        assign_material(obj_side, mat_bronze)
        apply_bevel_and_weighted_normals(obj_side, width=0.003, segments=2)
        objects.append(obj_side)
        
        # ---------------------------------------------------------
        # Fuel Filler Door (Driver Side Left only)
        # ---------------------------------------------------------
        if mult > 0: # Left side
            bm_fuel = bmesh.new()
            bmesh_create_cube(
                bm_fuel,
                size=0.015,
                matrix=mat_trans(0.895, REAR_AXLE_Y + 0.35, 0.98) @ mat_scale(1.0, 9.5, 9.5)
            )
            obj_fuel = create_bmesh_object("BED_FuelFillerDoor", col_name, bm_fuel)
            assign_material(obj_fuel, mat_bronze)
            apply_bevel_and_weighted_normals(obj_fuel, width=0.001, segments=2)
            objects.append(obj_fuel)

    # -------------------------------------------------------------
    # 2. Inner Corrugated Bed Tub (Floor, Bulkhead, Inner Walls, Wheelboxes)
    # -------------------------------------------------------------
    bm_tub = bmesh.new()
    
    # Bed floor main plate: Y = -1.28 to -2.72, X = -0.74 to +0.74, Z = 0.80
    bmesh_create_cube(
        bm_tub,
        size=0.03,
        matrix=mat_trans(0.0, -2.00, 0.80) @ mat_scale(49.0, 48.0, 1.0)
    )
    
    # 7 Longitudinal Corrugation Ribs
    for rib_x in [-0.60, -0.40, -0.20, 0.0, 0.20, 0.40, 0.60]:
        bmesh_create_cube(
            bm_tub,
            size=0.025,
            matrix=mat_trans(rib_x, -2.00, 0.82) @ mat_scale(1.8, 47.0, 0.7)
        )
        
    # Front Bulkhead Wall (behind cab)
    bmesh_create_cube(
        bm_tub,
        size=0.03,
        matrix=mat_trans(0.0, -1.28, 1.05) @ mat_scale(49.0, 1.0, 16.5)
    )
    
    # Left & Right Inner Bed Walls
    for mult in [1.0, -1.0]:
        bmesh_create_cube(
            bm_tub,
            size=0.03,
            matrix=mat_trans(0.74 * mult, -2.00, 1.05) @ mat_scale(1.0, 48.0, 16.5)
        )
        # Inner Wheel Wells
        bmesh_create_cube(
            bm_tub,
            size=0.04,
            matrix=mat_trans(0.64 * mult, REAR_AXLE_Y, 0.96) @ mat_scale(5.0, 18.0, 8.0)
        )
        
    obj_tub = create_bmesh_object("BED_InnerTub_Corrugated", col_name, bm_tub)
    assign_material(obj_tub, mat_bedliner)
    apply_bevel_and_weighted_normals(obj_tub, width=0.002, segments=2)
    objects.append(obj_tub)
    
    # -------------------------------------------------------------
    # 3. Heavy-Duty Tie-Down D-Rings (4 Corners)
    # -------------------------------------------------------------
    dring_locs = [
        (-0.68, -1.35, 0.83),
        ( 0.68, -1.35, 0.83),
        (-0.68, -2.65, 0.83),
        ( 0.68, -2.65, 0.83),
    ]
    for idx, (dx, dy, dz) in enumerate(dring_locs):
        bm_dring = bmesh.new()
        bmesh_create_torus(
            bm_dring,
            major_radius=0.025,
            minor_radius=0.006,
            major_segments=16,
            minor_segments=8,
            matrix=mat_trans(dx, dy, dz) @ mat_rot_x(45)
        )
        # Mount bracket
        bmesh_create_cube(
            bm_dring,
            size=0.015,
            matrix=mat_trans(dx, dy, dz - 0.01) @ mat_scale(2.5, 2.5, 1.0)
        )
        obj_dring = create_bmesh_object(f"BED_TieDown_Dring_{idx+1}", col_name, bm_dring)
        assign_material(obj_dring, mat_zinc)
        objects.append(obj_dring)

    # -------------------------------------------------------------
    # 4. Tailgate with Integrated Spoiler Lip, Handle & TOYOTA Emboss
    # -------------------------------------------------------------
    bm_tg = bmesh.new()
    
    # Main tailgate stamped slab (Z = 0.74m to 1.30m, tight shut line to bumper)
    bmesh_create_cube(
        bm_tg,
        size=0.05,
        matrix=mat_trans(0.0, -2.75, 1.02) @ mat_scale(30.0, 1.2, 11.2)
    )
    
    # Integrated Aerodynamic Top Spoiler Lip
    bmesh_create_cube(
        bm_tg,
        size=0.04,
        matrix=mat_trans(0.0, -2.765, 1.29) @ mat_scale(30.2, 2.2, 1.2)
    )
    
    # Stamped Center Character Chamfer / Embossment (trapezoid contour)
    bmesh_create_cube(
        bm_tg,
        size=0.02,
        matrix=mat_trans(0.0, -2.775, 1.02) @ mat_scale(48.0, 0.5, 14.0)
    )
    
    obj_tg = create_bmesh_object("BED_Tailgate", col_name, bm_tg)
    assign_material(obj_tg, mat_bronze)
    apply_bevel_and_weighted_normals(obj_tg, width=0.003, segments=2)
    objects.append(obj_tg)
    
    # Recessed Center Tailgate Handle Assembly
    bm_handle = bmesh.new()
    # Handle recess bucket
    bmesh_create_cube(
        bm_handle,
        size=0.03,
        matrix=mat_trans(0.0, -2.775, 1.18) @ mat_scale(6.5, 0.6, 2.8)
    )
    # Latch lever handle
    bmesh_create_cube(
        bm_handle,
        size=0.02,
        matrix=mat_trans(0.0, -2.785, 1.18) @ mat_scale(4.8, 0.4, 1.4)
    )
    obj_handle = create_bmesh_object("BED_Tailgate_Handle", col_name, bm_handle)
    assign_material(obj_handle, mat_trim)
    objects.append(obj_handle)
    
    # -------------------------------------------------------------
    # 5. Bed Top Rail Protective Caps (Sides & Bulkhead)
    # -------------------------------------------------------------
    bm_caps = bmesh.new()
    # Left rail cap
    bmesh_create_cube(
        bm_caps,
        size=0.04,
        matrix=mat_trans(0.80, -2.00, 1.31) @ mat_scale(2.2, 37.5, 0.5)
    )
    # Right rail cap
    bmesh_create_cube(
        bm_caps,
        size=0.04,
        matrix=mat_trans(-0.80, -2.00, 1.31) @ mat_scale(2.2, 37.5, 0.5)
    )
    # Front bulkhead cap
    bmesh_create_cube(
        bm_caps,
        size=0.04,
        matrix=mat_trans(0.0, -1.28, 1.31) @ mat_scale(38.0, 2.0, 0.5)
    )
    # Tailgate top cap
    bmesh_create_cube(
        bm_caps,
        size=0.04,
        matrix=mat_trans(0.0, -2.75, 1.31) @ mat_scale(37.5, 1.8, 0.5)
    )
    obj_caps = create_bmesh_object("BED_RailCaps", col_name, bm_caps)
    assign_material(obj_caps, mat_trim)
    apply_bevel_and_weighted_normals(obj_caps, width=0.002, segments=2)
    objects.append(obj_caps)

    # -------------------------------------------------------------
    # 6. Aerodynamic Sail Panel / Sport Bar (2025 HiLux SR5 Signature)
    # Sculpted triangular aerodynamic buttress with negative-space cutout
    # -------------------------------------------------------------
    bm_bar = bmesh.new()
    
    for mult in [1.0, -1.0]:
        # A. Front vertical pillar along rear cab wall
        bmesh_create_cube(
            bm_bar,
            size=0.05,
            matrix=mat_trans(0.74 * mult, -1.24, 1.54) @ mat_scale(1.2, 1.6, 9.2)
        )
        # B. Slanted rear aerodynamic buttress sloping down to bed rail
        bmesh_create_cube(
            bm_bar,
            size=0.05,
            matrix=mat_trans(0.74 * mult, -1.46, 1.54) @ mat_rot_x(-45) @ mat_scale(1.2, 1.6, 12.0)
        )
        # C. Bed rail mounting plinth
        bmesh_create_cube(
            bm_bar,
            size=0.04,
            matrix=mat_trans(0.76 * mult, -1.46, 1.31) @ mat_scale(1.8, 12.0, 0.6)
        )
    
    # Center High-Mounted Stop Lamp (CHMSL) integrated in cross arch
    bmesh_create_cube(
        bm_bar,
        size=0.02,
        matrix=mat_trans(0.0, -1.31, 1.78) @ mat_scale(12.0, 0.5, 1.5)
    )
    
    bmesh.ops.recalc_face_normals(bm_bar, faces=bm_bar.faces)
    
    obj_bar = create_bmesh_object("BED_AeroSailPanel_SportBar", col_name, bm_bar)
    assign_material(obj_bar, mat_sportbar)
    apply_bevel_and_weighted_normals(obj_bar, width=0.003, segments=2)
    objects.append(obj_bar)
    
    print(f"[HILUX] Cargo Bed generated with {len(objects)} objects.")
    return objects
