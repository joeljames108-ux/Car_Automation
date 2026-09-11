"""
Hilux Front Fascia & Lighting Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the chiseled front bumper, 2025 hexagonal grille with dark chrome bar,
multi-material bi-LED headlights with DRL brows, projectors, fog lights, and front skid plate.
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
    FRONT_AXLE_Y,
    FRONT_BUMPER_Y
)

def build_front_fascia(materials):
    mat_bronze = materials.get("Mat_Hilux_OxideBronze")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_darkchrome = materials.get("Mat_DarkChrome_Grille")
    mat_pianoblack = materials.get("Mat_PianoBlack_Grille")
    mat_skid = materials.get("Mat_SkidPlate_Alum")
    mat_emblem = materials.get("Mat_Emblem_Chrome")
    mat_housing = materials.get("Mat_BlackPlastic_Housing")
    mat_reflector = materials.get("Mat_Reflector_Chrome")
    mat_projector = materials.get("Mat_LED_Projector_Beam")
    mat_drl = materials.get("Mat_LED_Headlight_DRL")
    mat_amber = materials.get("Mat_LED_TurnAmber")
    mat_lens = materials.get("Mat_OpticalGlass_Headlamp")
    
    col_name = "04_Front_Fascia_Lighting"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Front Bumper Assembly (Coordinated Body-Color Upper & Rugged Lower Cladding)
    # Tightly contours the nose (Y = +2.18m to +2.48m, Z = 0.40m to 0.86m)
    # -------------------------------------------------------------
    # A. Upper Body-Colored Bumper Fascia (under headlights & grille)
    bm_bumper_up = bmesh.new()
    # Center upper section
    bmesh_create_cube(
        bm_bumper_up,
        size=0.06,
        matrix=mat_trans(0.0, 2.42, 0.74) @ mat_scale(18.0, 1.2, 2.2)
    )
    # Left & Right upper corner wings sweeping under headlights into fenders
    for mult in [1.0, -1.0]:
        bmesh_create_cube(
            bm_bumper_up,
            size=0.06,
            matrix=mat_trans(0.72 * mult, 2.34, 0.76) @ mat_rot_z(-18 * mult) @ mat_scale(3.6, 1.5, 2.4)
        )
        bmesh_create_cube(
            bm_bumper_up,
            size=0.06,
            matrix=mat_trans(0.85 * mult, 2.20, 0.74) @ mat_rot_z(-10 * mult) @ mat_scale(1.4, 2.4, 2.2)
        )
    obj_bumper_up = create_bmesh_object("FASCIA_FrontBumper_Upper", col_name, bm_bumper_up)
    assign_material(obj_bumper_up, mat_bronze)
    apply_bevel_and_weighted_normals(obj_bumper_up, width=0.003, segments=2)
    objects.append(obj_bumper_up)

    # B. Lower Rugged Composite Cladding Valence & Corner Air Ducts
    bm_bumper_low = bmesh.new()
    # Center lower chin
    bmesh_create_cube(
        bm_bumper_low,
        size=0.06,
        matrix=mat_trans(0.0, 2.44, 0.50) @ mat_scale(17.5, 1.4, 2.6)
    )
    # Lower corner air dam wings wrapping into wheel arch flares
    for mult in [1.0, -1.0]:
        bmesh_create_cube(
            bm_bumper_low,
            size=0.06,
            matrix=mat_trans(0.82 * mult, 2.28, 0.50) @ mat_rot_z(-18 * mult) @ mat_scale(2.6, 2.2, 2.8)
        )
        # Vertical Fog Light / Air Curtain Pocket Recess
        bmesh_create_cube(
            bm_bumper_low,
            size=0.05,
            matrix=mat_trans(0.70 * mult, 2.40, 0.56) @ mat_scale(2.0, 0.8, 3.4)
        )
        
    # Center Front License Plate Mounting Plinth
    bmesh_create_cube(
        bm_bumper_low,
        size=0.02,
        matrix=mat_trans(0.0, 2.49, 0.52) @ mat_scale(20.0, 0.4, 5.0)
    )
    
    obj_bumper_low = create_bmesh_object("FASCIA_FrontBumper_Lower", col_name, bm_bumper_low)
    assign_material(obj_bumper_low, mat_trim)
    apply_bevel_and_weighted_normals(obj_bumper_low, width=0.003, segments=2)
    objects.append(obj_bumper_low)

    # -------------------------------------------------------------
    # 2. Front Skid Plate (Stamped Off-Road Aluminum)
    # Slopes up from subframe (Y=2.10, Z=0.30) to bumper lower chin (Y=2.46, Z=0.38)
    # -------------------------------------------------------------
    bm_skid = bmesh.new()
    bmesh_create_cube(
        bm_skid,
        size=0.015,
        matrix=mat_trans(0.0, 2.28, 0.34) @ mat_rot_x(-14) @ mat_scale(48.0, 26.0, 1.0)
    )
    # Stamped cooling slot indentations (3 center slots)
    for sx in [-0.18, 0.0, 0.18]:
        bmesh_create_cube(
            bm_skid,
            size=0.01,
            matrix=mat_trans(sx, 2.28, 0.35) @ mat_rot_x(-14) @ mat_scale(10.0, 3.5, 1.2)
        )
    obj_skid = create_bmesh_object("FASCIA_FrontSkidPlate", col_name, bm_skid)
    assign_material(obj_skid, mat_skid)
    apply_bevel_and_weighted_normals(obj_skid, width=0.002, segments=2)
    objects.append(obj_skid)

    # -------------------------------------------------------------
    # 3. 2025 Hexagonal Grille Assembly
    # Upper dark chrome brow, piano black horizontal slats, chrome emblem
    # -------------------------------------------------------------
    # Upper Dark Chrome Grille Header Bar (spans full width between headlights)
    bm_header = bmesh.new()
    bmesh_create_cube(
        bm_header,
        size=0.05,
        matrix=mat_trans(0.0, 2.38, 1.02) @ mat_scale(23.0, 1.2, 1.0)
    )
    obj_header = create_bmesh_object("FASCIA_GrilleHeaderBar", col_name, bm_header)
    assign_material(obj_header, mat_darkchrome)
    apply_bevel_and_weighted_normals(obj_header, width=0.002, segments=2)
    objects.append(obj_header)

    # Main Grille Frame & Horizontal Piano Black Slats
    bm_grille = bmesh.new()
    # Outer hexagonal surround (X = -0.54 to +0.54, Z = 0.70 to 1.02)
    bmesh_create_cube(
        bm_grille,
        size=0.04,
        matrix=mat_trans(0.0, 2.40, 0.88) @ mat_scale(27.0, 1.2, 6.0)
    )
    # 3 Bold Horizontal Slats (2025 HiLux SR5 styling)
    for slat_z in [0.94, 0.86, 0.78]:
        bmesh_create_cube(
            bm_grille,
            size=0.025,
            matrix=mat_trans(0.0, 2.415, slat_z) @ mat_scale(42.0, 0.6, 0.9)
        )
    obj_grille = create_bmesh_object("FASCIA_GrilleSlats", col_name, bm_grille)
    assign_material(obj_grille, mat_pianoblack)
    apply_bevel_and_weighted_normals(obj_grille, width=0.002, segments=2)
    objects.append(obj_grille)

    # Central Toyota 3-Oval Chrome Emblem
    bm_emblem = bmesh.new()
    # Outer oval ring
    bmesh_create_torus(
        bm_emblem,
        major_radius=0.075,
        minor_radius=0.012,
        major_segments=24,
        minor_segments=8,
        matrix=mat_trans(0.0, 2.435, 0.88) @ mat_scale(1.3, 1.0, 0.85)
    )
    # Inner vertical oval ring
    bmesh_create_torus(
        bm_emblem,
        major_radius=0.048,
        minor_radius=0.009,
        major_segments=20,
        minor_segments=8,
        matrix=mat_trans(0.0, 2.438, 0.88) @ mat_scale(0.7, 1.0, 1.1)
    )
    # Inner horizontal cross oval ring
    bmesh_create_torus(
        bm_emblem,
        major_radius=0.052,
        minor_radius=0.009,
        major_segments=20,
        minor_segments=8,
        matrix=mat_trans(0.0, 2.438, 0.91) @ mat_scale(1.1, 1.0, 0.6)
    )
    obj_emblem = create_bmesh_object("FASCIA_ToyotaEmblem", col_name, bm_emblem)
    assign_material(obj_emblem, mat_emblem)
    objects.append(obj_emblem)

    # -------------------------------------------------------------
    # 4. Multi-Component Bi-LED Headlight Assemblies (Left & Right)
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        # A. Rear Lamp Housing Bucket (Dark Plastic)
        bm_hl_house = bmesh.new()
        bmesh_create_cube(
            bm_hl_house,
            size=0.06,
            matrix=mat_trans(0.70 * mult, 2.26, 0.95) @ mat_rot_z(-12 * mult) @ mat_scale(4.8, 2.8, 2.2)
        )
        obj_hl_house = create_bmesh_object(f"LIGHT_HeadlampHousing{sfx}", col_name, bm_hl_house)
        assign_material(obj_hl_house, mat_housing)
        objects.append(obj_hl_house)

        # B. Chrome Parabolic Reflectors & Bezel
        bm_hl_refl = bmesh.new()
        # Main projector cup
        bmesh_create_cylinder(
            bm_hl_refl,
            radius=0.055,
            depth=0.05,
            segments=16,
            matrix=mat_trans(0.66 * mult, 2.30, 0.95) @ mat_rot_x(90)
        )
        # High beam / secondary cup
        bmesh_create_cylinder(
            bm_hl_refl,
            radius=0.045,
            depth=0.04,
            segments=16,
            matrix=mat_trans(0.78 * mult, 2.27, 0.95) @ mat_rot_x(90)
        )
        obj_hl_refl = create_bmesh_object(f"LIGHT_HeadlampReflector{sfx}", col_name, bm_hl_refl)
        assign_material(obj_hl_refl, mat_reflector)
        objects.append(obj_hl_refl)

        # C. Bi-LED Projector Lenses (Clear Glass Sphere Lenses with high emissive core)
        bm_hl_proj = bmesh.new()
        bmesh_create_sphere(
            bm_hl_proj,
            radius=0.038,
            segments=16,
            ring_count=8,
            matrix=mat_trans(0.66 * mult, 2.32, 0.95)
        )
        bmesh_create_sphere(
            bm_hl_proj,
            radius=0.030,
            segments=16,
            ring_count=8,
            matrix=mat_trans(0.78 * mult, 2.29, 0.95)
        )
        obj_hl_proj = create_bmesh_object(f"LIGHT_HeadlampProjector{sfx}", col_name, bm_hl_proj)
        assign_material(obj_hl_proj, mat_projector)
        objects.append(obj_hl_proj)

        # D. LED DRL Eyebrow Light Pipe (Top contour of headlamp)
        bm_hl_drl = bmesh.new()
        bmesh_create_cube(
            bm_hl_drl,
            size=0.018,
            matrix=mat_trans(0.72 * mult, 2.33, 1.01) @ mat_rot_z(-10 * mult) @ mat_scale(15.0, 0.6, 0.8)
        )
        obj_hl_drl = create_bmesh_object(f"LIGHT_HeadlampDRL{sfx}", col_name, bm_hl_drl)
        assign_material(obj_hl_drl, mat_drl)
        objects.append(obj_hl_drl)

        # E. Amber Turn Signal Strip (Lower edge)
        bm_hl_turn = bmesh.new()
        bmesh_create_cube(
            bm_hl_turn,
            size=0.016,
            matrix=mat_trans(0.75 * mult, 2.32, 0.89) @ mat_rot_z(-12 * mult) @ mat_scale(12.0, 0.5, 0.6)
        )
        obj_hl_turn = create_bmesh_object(f"LIGHT_HeadlampTurnSignal{sfx}", col_name, bm_hl_turn)
        assign_material(obj_hl_turn, mat_amber)
        objects.append(obj_hl_turn)

        # F. Optical Polycarbonate Outer Cover Lens
        bm_hl_lens = bmesh.new()
        bmesh_create_cube(
            bm_hl_lens,
            size=0.01,
            matrix=mat_trans(0.72 * mult, 2.34, 0.95) @ mat_rot_z(-12 * mult) @ mat_scale(28.0, 1.0, 14.0)
        )
        obj_hl_lens = create_bmesh_object(f"LIGHT_HeadlampOuterLens{sfx}", col_name, bm_hl_lens)
        assign_material(obj_hl_lens, mat_lens)
        apply_bevel_and_weighted_normals(obj_hl_lens, width=0.001, segments=2)
        objects.append(obj_hl_lens)

    # -------------------------------------------------------------
    # 5. Front LED Projector Fog Lights (Left & Right)
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_fog = bmesh.new()
        # Chrome bezel ring inside vertical fog lamp pocket
        bmesh_create_torus(
            bm_fog,
            major_radius=0.036,
            minor_radius=0.007,
            major_segments=16,
            minor_segments=8,
            matrix=mat_trans(0.70 * mult, 2.42, 0.56) @ mat_rot_x(90)
        )
        # Inner projector lamp
        bmesh_create_sphere(
            bm_fog,
            radius=0.028,
            segments=12,
            ring_count=6,
            matrix=mat_trans(0.70 * mult, 2.42, 0.56)
        )
        obj_fog = create_bmesh_object(f"LIGHT_FogLight{sfx}", col_name, bm_fog)
        assign_material(obj_fog, mat_projector)
        objects.append(obj_fog)

    print(f"[HILUX] Front Fascia generated with {len(objects)} objects.")
    return objects
