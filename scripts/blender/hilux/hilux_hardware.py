"""
Hilux Exterior Hardware & Jewelry Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs door handles with keyholes, aerodynamic side mirrors with LED turn indicators,
tubular platform side steps with anti-slip tread pads, 4 mud flaps, wipers, sharkfin antenna,
and chrome HILUX / SR5 emblems.
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
    REAR_AXLE_Y
)

def build_exterior_hardware(materials):
    mat_bronze = materials.get("Mat_Hilux_OxideBronze")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_satin = materials.get("Mat_SatinBlack_Trim")
    mat_steel = materials.get("Mat_SteelChassis_Black")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    mat_mirror = materials.get("Mat_Mirror_Chrome")
    mat_amber = materials.get("Mat_LED_TurnAmber")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    
    col_name = "06_Exterior_Hardware"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Sculpted Exterior Grab Door Handles (4 Doors)
    # Front doors: Y = +0.20m, Z = 0.90m
    # Rear doors: Y = -0.80m, Z = 0.90m
    # -------------------------------------------------------------
    handle_locs = [
        ("FrontDoorHandle", 0.20, 1.0, True),   # Driver door has keyhole
        ("FrontDoorHandle", 0.20, -1.0, False),
        ("RearDoorHandle", -0.82, 1.0, False),
        ("RearDoorHandle", -0.82, -1.0, False),
    ]
    
    for label, y_pos, mult, has_keyhole in handle_locs:
        sfx = "_L" if mult > 0 else "_R"
        bm_h = bmesh.new()
        
        # Handle grab bar
        bmesh_create_cube(
            bm_h,
            size=0.02,
            matrix=mat_trans(0.855 * mult, y_pos, 0.90) @ mat_scale(1.0, 8.5, 1.6)
        )
        # Handle pocket cup escutcheon
        bmesh_create_cube(
            bm_h,
            size=0.015,
            matrix=mat_trans(0.845 * mult, y_pos, 0.90) @ mat_scale(0.8, 10.0, 2.2)
        )
        # Keyhole lock cylinder on driver door
        if has_keyhole:
            bmesh_create_cylinder(
                bm_h,
                radius=0.006,
                depth=0.008,
                segments=12,
                matrix=mat_trans(0.858 * mult, y_pos - 0.09, 0.90) @ mat_rot_y(90)
            )
            
        obj_h = create_bmesh_object(f"HARDWARE_{label}{sfx}", col_name, bm_h)
        assign_material(obj_h, mat_bronze)
        apply_bevel_and_weighted_normals(obj_h, width=0.002, segments=2)
        objects.append(obj_h)

    # -------------------------------------------------------------
    # 2. Aerodynamic Side Mirrors with Integrated LED Indicators (Left & Right)
    # Mounted to front door sail corners at Y = +0.72m, Z = 1.08m, X = ±0.92m
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        # A. Mirror Mounting Triangle Base (Satin Black)
        bm_base = bmesh.new()
        bmesh_create_cube(
            bm_base,
            size=0.04,
            matrix=mat_trans(0.83 * mult, 0.72, 1.06) @ mat_rot_z(15 * mult) @ mat_scale(1.5, 2.4, 2.8)
        )
        obj_base = create_bmesh_object(f"HARDWARE_MirrorBase{sfx}", col_name, bm_base)
        assign_material(obj_base, mat_satin)
        objects.append(obj_base)

        # B. Mirror Skull Cap Shell (Oxide Bronze Metallic)
        bm_shell = bmesh.new()
        bmesh_create_cube(
            bm_shell,
            size=0.06,
            matrix=mat_trans(0.98 * mult, 0.68, 1.09) @ mat_rot_z(-12 * mult) @ mat_scale(2.5, 3.8, 2.4)
        )
        obj_shell = create_bmesh_object(f"HARDWARE_MirrorShell{sfx}", col_name, bm_shell)
        assign_material(obj_shell, mat_bronze)
        apply_bevel_and_weighted_normals(obj_shell, width=0.004, segments=2)
        objects.append(obj_shell)

        # C. Amber LED Turn Indicator Repeater Strip
        bm_led = bmesh.new()
        bmesh_create_cube(
            bm_led,
            size=0.012,
            matrix=mat_trans(1.02 * mult, 0.69, 1.09) @ mat_rot_z(-12 * mult) @ mat_scale(0.8, 12.0, 0.6)
        )
        obj_led = create_bmesh_object(f"LIGHT_MirrorTurnSignal{sfx}", col_name, bm_led)
        assign_material(obj_led, mat_amber)
        objects.append(obj_led)

        # D. Reflective Chrome Mirror Glass
        bm_glass = bmesh.new()
        bmesh_create_cube(
            bm_glass,
            size=0.008,
            matrix=mat_trans(0.97 * mult, 0.67, 1.09) @ mat_rot_z(18 * mult) @ mat_scale(0.8, 20.0, 14.0)
        )
        obj_glass = create_bmesh_object(f"HARDWARE_MirrorGlass{sfx}", col_name, bm_glass)
        assign_material(obj_glass, mat_mirror)
        objects.append(obj_glass)

    # -------------------------------------------------------------
    # 3. Full-Length Tubular Platform Side Steps / Rock Sliders (Left & Right)
    # Extends from front wheel arch (Y=+0.90m) to rear wheel arch (Y=-1.10m)
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_step = bmesh.new()
        
        # Main tubular runner (3-inch / 76mm diameter tube)
        # Ends curved inwards towards the rocker
        bmesh_create_cylinder(
            bm_step,
            radius=0.038,
            depth=1.95,
            segments=16,
            matrix=mat_trans(0.88 * mult, -0.10, 0.38) @ mat_rot_x(90)
        )
        
        # Support outrigger brackets connecting to chassis frame (3 mounting arms)
        for arm_y in [0.70, -0.10, -0.90]:
            bmesh_create_cylinder(
                bm_step,
                radius=0.024,
                depth=0.32,
                segments=12,
                matrix=mat_trans(0.72 * mult, arm_y, 0.38) @ mat_rot_y(90)
            )
            
        # Molded composite anti-slip tread pads (Front door pad & Rear door pad)
        for pad_y in [0.35, -0.65]:
            bmesh_create_cube(
                bm_step,
                size=0.02,
                matrix=mat_trans(0.88 * mult, pad_y, 0.422) @ mat_scale(5.2, 22.0, 0.6)
            )
            
        obj_step = create_bmesh_object(f"HARDWARE_SideStepPlatform{sfx}", col_name, bm_step)
        assign_material(obj_step, mat_steel)
        apply_bevel_and_weighted_normals(obj_step, width=0.003, segments=2)
        objects.append(obj_step)

    # -------------------------------------------------------------
    # 4. Heavy-Duty Molded Mud Flaps (4 Units)
    # Front mud flaps: behind front wheels at Y = +1.02m
    # Rear mud flaps: behind rear wheels at Y = -2.05m
    # -------------------------------------------------------------
    mudflap_locs = [
        ("FrontMudFlap", FRONT_AXLE_Y - 0.52, 1.0, 0.34),
        ("FrontMudFlap", FRONT_AXLE_Y - 0.52, -1.0, 0.34),
        ("RearMudFlap",  REAR_AXLE_Y - 0.52, 1.0, 0.35),
        ("RearMudFlap",  REAR_AXLE_Y - 0.52, -1.0, 0.35),
    ]
    for label, y_pos, mult, z_center in mudflap_locs:
        sfx = "_L" if mult > 0 else "_R"
        bm_flap = bmesh.new()
        bmesh_create_cube(
            bm_flap,
            size=0.012,
            matrix=mat_trans(0.86 * mult, y_pos, z_center) @ mat_scale(18.0, 1.0, 22.0)
        )
        obj_flap = create_bmesh_object(f"HARDWARE_{label}{sfx}", col_name, bm_flap)
        assign_material(obj_flap, mat_trim)
        apply_bevel_and_weighted_normals(obj_flap, width=0.002, segments=2)
        objects.append(obj_flap)

    # -------------------------------------------------------------
    # 5. Windshield Wiper Assembly (Driver & Passenger Articulated Blades)
    # Resting on cowl at Y = +0.90m, Z = 1.10m
    # -------------------------------------------------------------
    bm_wipers = bmesh.new()
    for wx, wy, angle in [(-0.35, 0.88, 8), (0.22, 0.91, 10)]:
        # Wiper pivot spindle
        bmesh_create_cylinder(
            bm_wipers,
            radius=0.014,
            depth=0.03,
            segments=12,
            matrix=mat_trans(wx, wy, 1.09)
        )
        # Wiper articulated arm
        bmesh_create_cylinder(
            bm_wipers,
            radius=0.007,
            depth=0.48,
            segments=8,
            matrix=mat_trans(wx + 0.22, wy + 0.05, 1.14) @ mat_rot_z(angle) @ mat_rot_y(75)
        )
        # Aerodynamic wiper blade
        bmesh_create_cube(
            bm_wipers,
            size=0.015,
            matrix=mat_trans(wx + 0.25, wy + 0.06, 1.16) @ mat_rot_z(angle) @ mat_scale(34.0, 0.8, 0.8)
        )
    obj_wipers = create_bmesh_object("HARDWARE_WindshieldWipers", col_name, bm_wipers)
    assign_material(obj_wipers, mat_satin)
    objects.append(obj_wipers)

    # -------------------------------------------------------------
    # 6. Aerodynamic Sharkfin Roof Antenna
    # Centerline of roof rear at Y = -0.95m, Z = 1.82m
    # -------------------------------------------------------------
    bm_antenna = bmesh.new()
    # Sculpted tapered fin
    bmesh_create_cube(
        bm_antenna,
        size=0.02,
        matrix=mat_trans(0.0, -0.95, 1.84) @ mat_scale(1.8, 8.5, 3.4)
    )
    obj_antenna = create_bmesh_object("HARDWARE_SharkfinAntenna", col_name, bm_antenna)
    assign_material(obj_antenna, mat_bronze)
    apply_bevel_and_weighted_normals(obj_antenna, width=0.002, segments=2)
    objects.append(obj_antenna)

    # -------------------------------------------------------------
    # 7. Chrome Badges: HILUX Door & Tailgate Emblems, SR5 Tailgate Badge
    # -------------------------------------------------------------
    bm_badges = bmesh.new()
    # Left Front Door "HILUX" Badge
    bmesh_create_cube(
        bm_badges,
        size=0.008,
        matrix=mat_trans(0.855, 0.55, 0.88) @ mat_scale(0.8, 20.0, 3.2)
    )
    # Right Front Door "HILUX" Badge
    bmesh_create_cube(
        bm_badges,
        size=0.008,
        matrix=mat_trans(-0.855, 0.55, 0.88) @ mat_scale(0.8, 20.0, 3.2)
    )
    # Tailgate "HILUX" Badge (Left side of tailgate)
    bmesh_create_cube(
        bm_badges,
        size=0.008,
        matrix=mat_trans(-0.52, -2.78, 0.95) @ mat_scale(24.0, 0.8, 3.8)
    )
    # Tailgate "SR5" Badge (Right side of tailgate)
    bmesh_create_cube(
        bm_badges,
        size=0.008,
        matrix=mat_trans(0.55, -2.78, 0.95) @ mat_scale(14.0, 0.8, 3.8)
    )
    obj_badges = create_bmesh_object("HARDWARE_Badges_Chrome", col_name, bm_badges)
    assign_material(obj_badges, mat_chrome)
    objects.append(obj_badges)

    print(f"[HILUX] Exterior Hardware generated with {len(objects)} objects.")
    return objects
