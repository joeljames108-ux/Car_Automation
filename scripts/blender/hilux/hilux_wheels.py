"""
Hilux Wheel, Tire & Brake Assemblies (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs 4 complete wheel corners: 18-inch 6-spoke dual-finish alloys, 6 lug nuts, center caps,
265/60R18 all-terrain tires with 3D tread, front 319mm ventilated rotors & 4-piston calipers,
and rear 295mm heavy-duty brake drums.
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
    FRONT_AXLE_Y,
    REAR_AXLE_Y,
    FRONT_TRACK,
    REAR_TRACK,
    HUB_Z,
    WHEEL_RADIUS,
    TIRE_RADIUS,
    TIRE_WIDTH
)

def build_wheels_and_brakes(materials):
    mat_alloy_face = materials.get("Mat_Alloy_Machined")
    mat_alloy_pocket = materials.get("Mat_Alloy_DarkGunmetal")
    mat_tire = materials.get("Mat_Tire_Rubber")
    mat_rotor = materials.get("Mat_Brake_Rotor_Vented")
    mat_caliper = materials.get("Mat_Brake_Caliper_Cast")
    mat_drum = materials.get("Mat_Brake_Drum_Cast")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    mat_satin = materials.get("Mat_SatinBlack_Trim")
    
    col_name = "09_Wheels_Tires"
    objects = []
    
    # 4 Wheel Positions: (Label, Y, X_span, Is_Front)
    wheel_corners = [
        ("Front_L", FRONT_AXLE_Y,  FRONT_TRACK / 2.0, True),
        ("Front_R", FRONT_AXLE_Y, -FRONT_TRACK / 2.0, True),
        ("Rear_L",  REAR_AXLE_Y,   REAR_TRACK / 2.0,  False),
        ("Rear_R",  REAR_AXLE_Y,  -REAR_TRACK / 2.0,  False),
    ]
    
    for corner_label, y_pos, x_pos, is_front in wheel_corners:
        mult = 1.0 if x_pos > 0 else -1.0
        sfx = f"_{corner_label}"
        
        # ---------------------------------------------------------
        # 1. 18-inch Six-Spoke Alloy Wheel (Rim, Spokes, Center Cap)
        # ---------------------------------------------------------
        bm_wheel = bmesh.new()
        
        # Outer Rim Barrel (Radius = 0.229m, Width = 0.22m) - hollow tube so spokes are visible
        bmesh_create_cylinder(
            bm_wheel,
            radius=WHEEL_RADIUS,
            depth=0.22,
            segments=24,
            matrix=mat_trans(x_pos, y_pos, HUB_Z) @ mat_rot_y(90),
            cap_ends=False
        )
        
        # Inner Drop Center Rim Well
        bmesh_create_cylinder(
            bm_wheel,
            radius=WHEEL_RADIUS - 0.035,
            depth=0.20,
            segments=24,
            matrix=mat_trans(x_pos - (0.015 * mult), y_pos, HUB_Z) @ mat_rot_y(90),
            cap_ends=False
        )
        
        # 6 Sculpted Alloy Spokes
        for i in range(6):
            angle = math.radians(i * 60.0)
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            
            # Spoke extends from hub (R=0.06m) to rim lip (R=0.215m)
            spoke_r = 0.138
            spoke_y = y_pos + spoke_r * sin_a
            spoke_z = HUB_Z + spoke_r * cos_a
            spoke_x = x_pos + (0.08 * mult) # flush with outer rim face
            
            # Spoke body
            bmesh_create_cube(
                bm_wheel,
                size=0.03,
                matrix=mat_trans(spoke_x, spoke_y, spoke_z) @ mat_rot_x(-math.degrees(angle)) @ mat_scale(1.2, 1.4, 4.8)
            )
            
        # Center Hub & 6 Lug Nuts (6x139.7mm bolt circle -> radius ~ 0.070m)
        bmesh_create_cylinder(
            bm_wheel,
            radius=0.065,
            depth=0.045,
            segments=16,
            matrix=mat_trans(x_pos + (0.075 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
        )
        
        # 6 Chrome Lug Nuts
        for i in range(6):
            lug_angle = math.radians(i * 60.0 + 30.0)
            lug_y = y_pos + 0.070 * math.sin(lug_angle)
            lug_z = HUB_Z + 0.070 * math.cos(lug_angle)
            bmesh_create_cylinder(
                bm_wheel,
                radius=0.012,
                depth=0.030,
                segments=8,
                matrix=mat_trans(x_pos + (0.085 * mult), lug_y, lug_z) @ mat_rot_y(90)
            )
            
        # Center Cap with Toyota Emblem Relief
        bmesh_create_cylinder(
            bm_wheel,
            radius=0.040,
            depth=0.015,
            segments=16,
            matrix=mat_trans(x_pos + (0.092 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
        )
        
        # Valve Stem (Rubber + Brass Cap)
        bmesh_create_cylinder(
            bm_wheel,
            radius=0.005,
            depth=0.032,
            segments=8,
            matrix=mat_trans(x_pos + (0.08 * mult), y_pos + 0.17, HUB_Z + 0.04) @ mat_rot_z(45 * mult)
        )
        
        obj_wheel = create_bmesh_object(f"WHEEL_Alloy18in{sfx}", col_name, bm_wheel)
        assign_material(obj_wheel, mat_alloy_face)
        apply_bevel_and_weighted_normals(obj_wheel, width=0.002, segments=2)
        objects.append(obj_wheel)

        # ---------------------------------------------------------
        # 2. 265/60R18 All-Terrain Tire with Realistic 3D Tread
        # ---------------------------------------------------------
        bm_tire = bmesh.new()
        
        # Main Toroidal Tire Carcass (Outer R = 0.388m, Inner Rim R = 0.229m, Width = 0.265m)
        bmesh_create_torus(
            bm_tire,
            major_radius=(TIRE_RADIUS + WHEEL_RADIUS) / 2.0,
            minor_radius=(TIRE_RADIUS - WHEEL_RADIUS) / 2.0,
            major_segments=32,
            minor_segments=16,
            matrix=mat_trans(x_pos, y_pos, HUB_Z) @ mat_rot_y(90) @ mat_scale(1.0, 1.0, 1.45)
        )
        
        # Outer Tread Ring Blocks (Circumferential all-terrain lugs)
        num_tread_blocks = 24
        for tb in range(num_tread_blocks):
            t_angle = math.radians(tb * (360.0 / num_tread_blocks))
            t_cos = math.cos(t_angle)
            t_sin = math.sin(t_angle)
            
            tb_y = y_pos + (TIRE_RADIUS - 0.006) * t_sin
            tb_z = HUB_Z + (TIRE_RADIUS - 0.006) * t_cos
            
            # Molded geometric tread block lugs
            bmesh_create_cube(
                bm_tire,
                size=0.015,
                matrix=mat_trans(x_pos, tb_y, tb_z) @ mat_rot_x(-math.degrees(t_angle)) @ mat_scale(14.0, 2.5, 1.0)
            )
            
        obj_tire = create_bmesh_object(f"TIRE_265_60R18{sfx}", col_name, bm_tire)
        assign_material(obj_tire, mat_tire)
        apply_bevel_and_weighted_normals(obj_tire, width=0.002, segments=2)
        objects.append(obj_tire)

        # ---------------------------------------------------------
        # 3. Brake Assemblies (Front: 319mm Vented Rotor + 4-Piston Caliper)
        #                      (Rear: 295mm Heavy-Duty Finned Drum)
        # ---------------------------------------------------------
        if is_front:
            # Front Ventilated Disc Brake Rotor
            bm_rotor = bmesh.new()
            # Rotor friction ring (radius ~ 0.160m = 320mm diam)
            bmesh_create_cylinder(
                bm_rotor,
                radius=0.160,
                depth=0.032,
                segments=24,
                matrix=mat_trans(x_pos - (0.045 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
            )
            # Rotor center mounting hat (radius 0.085m)
            bmesh_create_cylinder(
                bm_rotor,
                radius=0.085,
                depth=0.045,
                segments=16,
                matrix=mat_trans(x_pos - (0.030 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
            )
            obj_rotor = create_bmesh_object(f"BRAKE_FrontRotorVented{sfx}", col_name, bm_rotor)
            assign_material(obj_rotor, mat_rotor)
            objects.append(obj_rotor)

            # Front 4-Piston Heavy-Duty Cast Caliper (mounted forward/upper quadrant)
            bm_caliper = bmesh.new()
            caliper_y = y_pos + 0.11
            caliper_z = HUB_Z + 0.09
            bmesh_create_cube(
                bm_caliper,
                size=0.05,
                matrix=mat_trans(x_pos - (0.045 * mult), caliper_y, caliper_z) @ mat_rot_x(-35) @ mat_scale(1.8, 4.4, 2.2)
            )
            # Caliper hydraulic cross-over bridge & bleeder screw
            bmesh_create_cylinder(
                bm_caliper,
                radius=0.006,
                depth=0.025,
                segments=8,
                matrix=mat_trans(x_pos - (0.045 * mult), caliper_y, caliper_z + 0.06)
            )
            obj_caliper = create_bmesh_object(f"BRAKE_FrontCaliper{sfx}", col_name, bm_caliper)
            assign_material(obj_caliper, mat_caliper)
            apply_bevel_and_weighted_normals(obj_caliper, width=0.003, segments=2)
            objects.append(obj_caliper)
        else:
            # Rear 295mm Heavy-Duty Cast Iron Brake Drum
            bm_drum = bmesh.new()
            # Drum outer bell (radius ~ 0.148m)
            bmesh_create_cylinder(
                bm_drum,
                radius=0.148,
                depth=0.095,
                segments=24,
                matrix=mat_trans(x_pos - (0.040 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
            )
            # Outer cooling ribs / perimeter fins
            bmesh_create_cylinder(
                bm_drum,
                radius=0.155,
                depth=0.020,
                segments=24,
                matrix=mat_trans(x_pos - (0.075 * mult), y_pos, HUB_Z) @ mat_rot_y(90)
            )
            obj_drum = create_bmesh_object(f"BRAKE_RearDrum{sfx}", col_name, bm_drum)
            assign_material(obj_drum, mat_drum)
            apply_bevel_and_weighted_normals(obj_drum, width=0.003, segments=2)
            objects.append(obj_drum)

    print(f"[HILUX] Wheels, Tires & Brakes generated with {len(objects)} objects.")
    return objects
