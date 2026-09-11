"""
Hilux Suspension Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs front independent double wishbone suspension (UCAs, LCAs, coilovers, steering rack, sway bar)
and rear heavy-duty live axle leaf spring suspension (5-leaf packs, U-bolts, shackles, staggered shocks).
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
    REAR_AXLE_Y,
    FRONT_TRACK,
    REAR_TRACK,
    HUB_Z
)

def build_suspension(materials):
    mat_cast = materials.get("Mat_Suspension_CastArm")
    mat_coil = materials.get("Mat_Suspension_Coil")
    mat_shock = materials.get("Mat_Suspension_ShockBody")
    mat_leaf = materials.get("Mat_Suspension_LeafPack")
    mat_axle = materials.get("Mat_Differential_CastIron")
    mat_steel = materials.get("Mat_SteelChassis_Black")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    
    col_name = "08_Suspension_Brakes"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Front Independent Double-Wishbone Suspension (Left & Right)
    # Front axle center: Y = +1.5425m, Hub Z = 0.388m, Hub X = ±0.770m
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_front_susp = bmesh.new()
        
        # A. Lower Control Arm (LCA) - Heavy Cast Steel A-Arm
        # Pivots on chassis cradle (X = ±0.28m, Z = 0.30m) out to lower ball joint (X = ±0.68m, Z = 0.28m)
        lca_inner_f = Vector((0.28 * mult, FRONT_AXLE_Y + 0.18, 0.30))
        lca_inner_r = Vector((0.28 * mult, FRONT_AXLE_Y - 0.18, 0.30))
        lca_ball = Vector((0.68 * mult, FRONT_AXLE_Y, 0.28))
        
        # Front strut of LCA
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.022,
            depth=(lca_ball - lca_inner_f).length,
            segments=12,
            matrix=mat_trans(*( (lca_ball + lca_inner_f) / 2.0 )) @ mat_rot_z(25 * mult) @ mat_rot_y(90 * mult)
        )
        # Rear strut of LCA
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.022,
            depth=(lca_ball - lca_inner_r).length,
            segments=12,
            matrix=mat_trans(*( (lca_ball + lca_inner_r) / 2.0 )) @ mat_rot_z(-25 * mult) @ mat_rot_y(90 * mult)
        )
        
        # B. Upper Control Arm (UCA) - High-Mount A-Arm
        # Pivots on chassis shock tower (X = ±0.42m, Z = 0.54m) out to upper ball joint (X = ±0.66m, Z = 0.52m)
        uca_inner_f = Vector((0.42 * mult, FRONT_AXLE_Y + 0.14, 0.54))
        uca_inner_r = Vector((0.42 * mult, FRONT_AXLE_Y - 0.14, 0.54))
        uca_ball = Vector((0.66 * mult, FRONT_AXLE_Y, 0.52))
        
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.016,
            depth=(uca_ball - uca_inner_f).length,
            segments=12,
            matrix=mat_trans(*( (uca_ball + uca_inner_f) / 2.0 )) @ mat_rot_z(25 * mult) @ mat_rot_y(90 * mult)
        )
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.016,
            depth=(uca_ball - uca_inner_r).length,
            segments=12,
            matrix=mat_trans(*( (uca_ball + uca_inner_r) / 2.0 )) @ mat_rot_z(-25 * mult) @ mat_rot_y(90 * mult)
        )
        
        # C. Steering Knuckle & Spindle Spoke
        # Connects lower ball joint (Z=0.28) and upper ball joint (Z=0.52) to wheel hub (Z=0.388)
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.026,
            depth=0.26,
            segments=12,
            matrix=mat_trans(0.68 * mult, FRONT_AXLE_Y, 0.40)
        )
        # Hub wheel bearing snout
        bmesh_create_cylinder(
            bm_front_susp,
            radius=0.045,
            depth=0.09,
            segments=16,
            matrix=mat_trans(0.72 * mult, FRONT_AXLE_Y, HUB_Z) @ mat_rot_y(90)
        )
        
        obj_front_susp = create_bmesh_object(f"SUSP_FrontWishbone{sfx}", col_name, bm_front_susp)
        assign_material(obj_front_susp, mat_cast)
        apply_bevel_and_weighted_normals(obj_front_susp, width=0.002, segments=2)
        objects.append(obj_front_susp)

        # D. Front Coilover Assembly (Blue Damper + Black Heavy Coil Spring)
        bm_coilover = bmesh.new()
        # Central Shock Absorber Damper Body
        bmesh_create_cylinder(
            bm_coilover,
            radius=0.032,
            depth=0.36,
            segments=16,
            matrix=mat_trans(0.50 * mult, FRONT_AXLE_Y, 0.44) @ mat_rot_y(-12 * mult)
        )
        # Damper chrome shaft
        bmesh_create_cylinder(
            bm_coilover,
            radius=0.012,
            depth=0.18,
            segments=12,
            matrix=mat_trans(0.52 * mult, FRONT_AXLE_Y, 0.52) @ mat_rot_y(-12 * mult)
        )
        obj_damper = create_bmesh_object(f"SUSP_FrontShockDamper{sfx}", col_name, bm_coilover)
        assign_material(obj_damper, mat_shock)
        objects.append(obj_damper)

        # Helical Coil Spring around the damper
        bm_spring = bmesh.new()
        num_turns = 6
        points_per_turn = 16
        total_pts = num_turns * points_per_turn
        coil_radius = 0.052
        z_start = 0.32
        z_end = 0.56
        dz = (z_end - z_start) / total_pts
        
        for p in range(total_pts):
            theta = 2.0 * math.pi * (p / points_per_turn)
            cz = z_start + dz * p
            cx = (0.50 + coil_radius * math.cos(theta)) * mult
            cy = FRONT_AXLE_Y + coil_radius * math.sin(theta)
            bmesh_create_sphere(
                bm_spring,
                radius=0.008,
                segments=6,
                ring_count=4,
                matrix=mat_trans(cx, cy, cz)
            )
        obj_spring = create_bmesh_object(f"SUSP_FrontCoilSpring{sfx}", col_name, bm_spring)
        assign_material(obj_spring, mat_coil)
        objects.append(obj_spring)

    # E. Steering Rack & Articulated Tie Rods
    bm_rack = bmesh.new()
    bmesh_create_cylinder(
        bm_rack,
        radius=0.030,
        depth=0.65,
        segments=16,
        matrix=mat_trans(0.0, FRONT_AXLE_Y + 0.08, 0.32) @ mat_rot_y(90)
    )
    # Left & Right Tie Rods to steering knuckles
    for mult in [1.0, -1.0]:
        bmesh_create_cylinder(
            bm_rack,
            radius=0.012,
            depth=0.34,
            segments=12,
            matrix=mat_trans(0.48 * mult, FRONT_AXLE_Y + 0.06, 0.34) @ mat_rot_y(90)
        )
    obj_rack = create_bmesh_object("SUSP_FrontSteeringRack", col_name, bm_rack)
    assign_material(obj_rack, mat_cast)
    objects.append(obj_rack)

    # F. Front Anti-Roll Sway Bar
    bm_sway = bmesh.new()
    bmesh_create_cylinder(
        bm_sway,
        radius=0.016,
        depth=0.92,
        segments=16,
        matrix=mat_trans(0.0, FRONT_AXLE_Y - 0.12, 0.30) @ mat_rot_y(90)
    )
    for mult in [1.0, -1.0]:
        bmesh_create_cylinder(
            bm_sway,
            radius=0.010,
            depth=0.14,
            segments=10,
            matrix=mat_trans(0.46 * mult, FRONT_AXLE_Y - 0.06, 0.28)
        )
    obj_sway = create_bmesh_object("SUSP_FrontAntiRollBar", col_name, bm_sway)
    assign_material(obj_sway, mat_steel)
    objects.append(obj_sway)

    # -------------------------------------------------------------
    # 2. Rear Heavy-Duty Live Axle & Multi-Leaf Spring Suspension
    # Rear axle center: Y = -1.5425m, Hub Z = 0.388m, Hub X = ±0.775m
    # -------------------------------------------------------------
    # A. Cast Iron Rear Axle Housing & Central Differential Pumpkin
    bm_axle = bmesh.new()
    # Central Differential Pumpkin Bulb
    bmesh_create_sphere(
        bm_axle,
        radius=0.145,
        segments=20,
        ring_count=12,
        matrix=mat_trans(0.0, REAR_AXLE_Y, HUB_Z) @ mat_scale(1.0, 1.35, 1.15)
    )
    # Differential rear cover plate
    bmesh_create_cylinder(
        bm_axle,
        radius=0.125,
        depth=0.04,
        segments=16,
        matrix=mat_trans(0.0, REAR_AXLE_Y - 0.12, HUB_Z) @ mat_rot_x(90)
    )
    # Axle Tube Housing (Left & Right extending to wheel hubs)
    bmesh_create_cylinder(
        bm_axle,
        radius=0.048,
        depth=1.52,
        segments=16,
        matrix=mat_trans(0.0, REAR_AXLE_Y, HUB_Z) @ mat_rot_y(90)
    )
    # Outer brake backing flange collars
    for mult in [1.0, -1.0]:
        bmesh_create_cylinder(
            bm_axle,
            radius=0.095,
            depth=0.035,
            segments=16,
            matrix=mat_trans(0.72 * mult, REAR_AXLE_Y, HUB_Z) @ mat_rot_y(90)
        )
    obj_axle = create_bmesh_object("SUSP_RearLiveAxleHousing", col_name, bm_axle)
    assign_material(obj_axle, mat_axle)
    apply_bevel_and_weighted_normals(obj_axle, width=0.003, segments=2)
    objects.append(obj_axle)

    # B. Multi-Leaf Spring Packs (Left & Right) - 5 Stepped Heavy Steel Leaves
    # Extends from front frame hanger (Y = -0.85m) to rear shackle (Y = -2.15m)
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_leaf = bmesh.new()
        spring_x = 0.54 * mult
        
        # 5 Stepped leaf spring plates stacked vertically
        leaf_lengths = [1.30, 1.10, 0.90, 0.70, 0.50]
        for idx, l_len in enumerate(leaf_lengths):
            # Leaves have subtle parabolic arch (camber)
            z_layer = HUB_Z - 0.045 - (idx * 0.012)
            bmesh_create_cube(
                bm_leaf,
                size=0.01,
                matrix=mat_trans(spring_x, REAR_AXLE_Y, z_layer) @ mat_scale(7.0, l_len * 100.0, 1.0)
            )
            
        # Front Spring Eye Hanger Bushing
        bmesh_create_cylinder(
            bm_leaf,
            radius=0.032,
            depth=0.08,
            segments=12,
            matrix=mat_trans(spring_x, REAR_AXLE_Y + 0.65, HUB_Z + 0.02) @ mat_rot_y(90)
        )
        
        # Rear Spring Eye & Pivoting Shackle
        bmesh_create_cylinder(
            bm_leaf,
            radius=0.032,
            depth=0.08,
            segments=12,
            matrix=mat_trans(spring_x, REAR_AXLE_Y - 0.65, HUB_Z + 0.04) @ mat_rot_y(90)
        )
        # Steel Shackle side plates
        for s_side in [0.04, -0.04]:
            bmesh_create_cube(
                bm_leaf,
                size=0.01,
                matrix=mat_trans(spring_x + s_side, REAR_AXLE_Y - 0.65, HUB_Z + 0.09) @ mat_scale(1.0, 4.0, 12.0)
            )
            
        # Heavy-Duty Twin U-Bolts clamping leaf pack to axle tube
        for u_offset in [0.05, -0.05]:
            bmesh_create_cylinder(
                bm_leaf,
                radius=0.008,
                depth=0.18,
                segments=8,
                matrix=mat_trans(spring_x + 0.04, REAR_AXLE_Y + u_offset, HUB_Z - 0.03)
            )
            bmesh_create_cylinder(
                bm_leaf,
                radius=0.008,
                depth=0.18,
                segments=8,
                matrix=mat_trans(spring_x - 0.04, REAR_AXLE_Y + u_offset, HUB_Z - 0.03)
            )
            
        obj_leaf = create_bmesh_object(f"SUSP_RearLeafSpringPack{sfx}", col_name, bm_leaf)
        assign_material(obj_leaf, mat_leaf)
        apply_bevel_and_weighted_normals(obj_leaf, width=0.002, segments=2)
        objects.append(obj_leaf)

        # C. Staggered Heavy-Duty Telescopic Rear Shock Absorbers
        # One shock tilted forward, one tilted rearward to counter axle wrap under diesel torque
        tilt_sign = 1.0 if mult > 0 else -1.0
        bm_rshock = bmesh.new()
        bmesh_create_cylinder(
            bm_rshock,
            radius=0.028,
            depth=0.46,
            segments=14,
            matrix=mat_trans(0.48 * mult, REAR_AXLE_Y + (0.12 * tilt_sign), HUB_Z + 0.12) @ mat_rot_x(18 * tilt_sign)
        )
        obj_rshock = create_bmesh_object(f"SUSP_RearShockAbsorber{sfx}", col_name, bm_rshock)
        assign_material(obj_rshock, mat_shock)
        objects.append(obj_rshock)

    print(f"[HILUX] Suspension generated with {len(objects)} objects.")
    return objects
