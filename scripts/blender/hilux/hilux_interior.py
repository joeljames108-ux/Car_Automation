"""
Hilux Interior Cockpit Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the full museum-quality cockpit: dashboard with gauge cluster & 8" infotainment screen,
HVAC louvers, center console with gated shifter & 4WD dial, 3-spoke steering wheel with controls & stalks,
front bucket seats with bolsters & headrests, rear 60/40 bench, 4 door cards, pedals, and rearview mirror.
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
    bmesh_create_cone,
    bmesh_create_sphere,
    bmesh_create_torus,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_rot_z,
    mat_scale
)

def build_interior(materials):
    mat_dash = materials.get("Mat_Interior_DashboardBlack")
    mat_leather = materials.get("Mat_Interior_LeatherBlack")
    mat_fabric = materials.get("Mat_Interior_FabricCharcoal")
    mat_silver = materials.get("Mat_Interior_SilverTrim")
    mat_screen = materials.get("Mat_Interior_ScreenDisplay")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    mat_mirror = materials.get("Mat_Mirror_Chrome")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    
    col_name = "10_Powertrain_Interior"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Full Dashboard Assembly (Instrument Binnacle, Screens, HVAC)
    # Spans X = -0.68m to +0.68m, Y = +0.72m to +0.88m, Z = 0.85m to 1.15m
    # (Australian / International RHD / LHD standard: Model configured LHD driver on Left +X)
    # -------------------------------------------------------------
    bm_dash = bmesh.new()
    
    # Main Dashboard Upper Soft-Touch Body
    bmesh_create_cube(
        bm_dash,
        size=0.08,
        matrix=mat_trans(0.0, 0.78, 1.00) @ mat_scale(17.0, 3.8, 3.2)
    )
    # Lower Passenger Knee Bolster & Glovebox
    bmesh_create_cube(
        bm_dash,
        size=0.06,
        matrix=mat_trans(-0.35, 0.75, 0.78) @ mat_scale(9.0, 2.5, 3.8)
    )
    # Driver's Instrument Binnacle Hood Cowl (Left/Driver side: X = +0.36m)
    bmesh_create_cube(
        bm_dash,
        size=0.06,
        matrix=mat_trans(0.36, 0.74, 1.10) @ mat_scale(6.2, 3.5, 1.8)
    )
    obj_dash = create_bmesh_object("INTERIOR_Dashboard_Main", col_name, bm_dash)
    assign_material(obj_dash, mat_dash)
    apply_bevel_and_weighted_normals(obj_dash, width=0.003, segments=2)
    objects.append(obj_dash)

    # Digital Gauge Cluster & 8" Infotainment Displays
    bm_screens = bmesh.new()
    # Driver Digital Gauge Cluster Display Screen (Speedometer & Tachometer)
    bmesh_create_cube(
        bm_screens,
        size=0.02,
        matrix=mat_trans(0.36, 0.72, 1.06) @ mat_rot_x(-15) @ mat_scale(14.0, 0.5, 6.0)
    )
    # Center 8.0-inch Multimedia Infotainment Touchscreen
    bmesh_create_cube(
        bm_screens,
        size=0.02,
        matrix=mat_trans(0.0, 0.71, 1.04) @ mat_rot_x(-12) @ mat_scale(12.5, 0.6, 8.5)
    )
    obj_screens = create_bmesh_object("INTERIOR_DigitalScreens", col_name, bm_screens)
    assign_material(obj_screens, mat_screen)
    objects.append(obj_screens)

    # Satin Silver Accent Trim Bezels & HVAC Vents
    bm_silver = bmesh.new()
    # Center screen bezel surround
    bmesh_create_cube(
        bm_silver,
        size=0.015,
        matrix=mat_trans(0.0, 0.72, 1.04) @ mat_rot_x(-12) @ mat_scale(18.0, 0.8, 12.0)
    )
    # 4 HVAC Ventilation Louver Outlets (Left, Center-L, Center-R, Right)
    for vent_x in [-0.58, -0.16, 0.16, 0.58]:
        bmesh_create_cube(
            bm_silver,
            size=0.012,
            matrix=mat_trans(vent_x, 0.71, 0.98) @ mat_scale(6.5, 0.6, 4.0)
        )
    # Lower Climate Control Rotary Dials
    for dial_x in [-0.08, 0.08]:
        bmesh_create_cylinder(
            bm_silver,
            radius=0.022,
            depth=0.025,
            segments=16,
            matrix=mat_trans(dial_x, 0.69, 0.88) @ mat_rot_x(90)
        )
    obj_silver = create_bmesh_object("INTERIOR_SilverTrim_HVAC", col_name, bm_silver)
    assign_material(obj_silver, mat_silver)
    apply_bevel_and_weighted_normals(obj_silver, width=0.001, segments=2)
    objects.append(obj_silver)

    # -------------------------------------------------------------
    # 2. Center Console Assembly (Gated Shifter, 4WD Dial, Armrest)
    # Extends from dash (Y = +0.68m) back between front seats (Y = -0.40m), Z = 0.52m to 0.76m
    # -------------------------------------------------------------
    bm_console = bmesh.new()
    # Main Tunnel Body
    bmesh_create_cube(
        bm_console,
        size=0.06,
        matrix=mat_trans(0.0, 0.15, 0.62) @ mat_scale(4.8, 16.5, 3.2)
    )
    # Dual Cup Holders
    for ch_y in [0.25, 0.12]:
        bmesh_create_cylinder(
            bm_console,
            radius=0.038,
            depth=0.045,
            segments=16,
            matrix=mat_trans(-0.06, ch_y, 0.70)
        )
    obj_console = create_bmesh_object("INTERIOR_CenterConsole", col_name, bm_console)
    assign_material(obj_console, mat_dash)
    apply_bevel_and_weighted_normals(obj_console, width=0.003, segments=2)
    objects.append(obj_console)

    # Center Leather Armrest Lid
    bm_armrest = bmesh.new()
    bmesh_create_cube(
        bm_armrest,
        size=0.05,
        matrix=mat_trans(0.0, -0.15, 0.74) @ mat_scale(5.2, 7.5, 1.4)
    )
    obj_armrest = create_bmesh_object("INTERIOR_CenterArmrest", col_name, bm_armrest)
    assign_material(obj_armrest, mat_leather)
    apply_bevel_and_weighted_normals(obj_armrest, width=0.004, segments=2)
    objects.append(obj_armrest)

    # Gated Automatic Shift Lever & 4WD Rotary Selector
    bm_shifter = bmesh.new()
    # Shift Boot (Stitched leather pyramid)
    bmesh_create_cone(
        bm_shifter,
        radius1=0.048,
        radius2=0.018,
        depth=0.07,
        segments=12,
        matrix=mat_trans(0.05, 0.38, 0.74)
    )
    # Shift Knob (Ergonomic T-bar with satin release button)
    bmesh_create_cube(
        bm_shifter,
        size=0.025,
        matrix=mat_trans(0.05, 0.38, 0.81) @ mat_scale(2.2, 3.5, 1.8)
    )
    # Electronic 4WD Rotary Dial (2H / 4H / 4L)
    bmesh_create_cylinder(
        bm_shifter,
        radius=0.028,
        depth=0.020,
        segments=16,
        matrix=mat_trans(-0.08, 0.38, 0.72)
    )
    # Handbrake Lever
    bmesh_create_cylinder(
        bm_shifter,
        radius=0.016,
        depth=0.22,
        segments=12,
        matrix=mat_trans(0.08, 0.05, 0.74) @ mat_rot_x(25)
    )
    obj_shifter = create_bmesh_object("INTERIOR_ShiftLever_Controls", col_name, bm_shifter)
    assign_material(obj_shifter, mat_leather)
    objects.append(obj_shifter)

    # -------------------------------------------------------------
    # 3. Steering Wheel, Column, Control Stalks & Pedals
    # Centered at Driver station: X = +0.36m, Y = +0.52m, Z = 0.98m
    # -------------------------------------------------------------
    bm_wheel = bmesh.new()
    # Steering Column Nacelle Cover
    bmesh_create_cube(
        bm_wheel,
        size=0.05,
        matrix=mat_trans(0.36, 0.62, 0.92) @ mat_rot_x(-25) @ mat_scale(2.8, 4.5, 2.2)
    )
    # 3-Spoke Contoured Leather Steering Wheel Rim (Radius = 0.185m = 370mm diam)
    bmesh_create_torus(
        bm_wheel,
        major_radius=0.185,
        minor_radius=0.018,
        major_segments=24,
        minor_segments=12,
        matrix=mat_trans(0.36, 0.50, 0.98) @ mat_rot_x(-25)
    )
    # Center Airbag Hub Horn Pad
    bmesh_create_cylinder(
        bm_wheel,
        radius=0.065,
        depth=0.045,
        segments=16,
        matrix=mat_trans(0.36, 0.51, 0.98) @ mat_rot_x(-25) @ mat_rot_x(90)
    )
    # Left & Right Steering Wheel Spokes with Multi-Function Button Clusters
    bmesh_create_cube(
        bm_wheel,
        size=0.02,
        matrix=mat_trans(0.36, 0.50, 0.98) @ mat_rot_x(-25) @ mat_scale(15.0, 1.2, 2.2)
    )
    # Lower 6 o'clock Spoke
    bmesh_create_cube(
        bm_wheel,
        size=0.02,
        matrix=mat_trans(0.36, 0.50, 0.88) @ mat_rot_x(-25) @ mat_scale(2.4, 1.2, 8.0)
    )
    # Turn Signal & Wiper Control Stalks
    bmesh_create_cylinder(
        bm_wheel,
        radius=0.008,
        depth=0.14,
        segments=8,
        matrix=mat_trans(0.24, 0.56, 0.96) @ mat_rot_z(45) @ mat_rot_y(70)
    )
    bmesh_create_cylinder(
        bm_wheel,
        radius=0.008,
        depth=0.14,
        segments=8,
        matrix=mat_trans(0.48, 0.56, 0.96) @ mat_rot_z(-45) @ mat_rot_y(-70)
    )
    obj_sw = create_bmesh_object("INTERIOR_SteeringWheel_Assembly", col_name, bm_wheel)
    assign_material(obj_sw, mat_leather)
    apply_bevel_and_weighted_normals(obj_sw, width=0.002, segments=2)
    objects.append(obj_sw)

    # Driver Foot Pedals (Accelerator, Brake, Dead Pedal)
    bm_pedals = bmesh.new()
    # Brake Pedal
    bmesh_create_cube(
        bm_pedals,
        size=0.02,
        matrix=mat_trans(0.34, 0.72, 0.58) @ mat_rot_x(-35) @ mat_scale(3.5, 0.8, 3.8)
    )
    # Accelerator Organ Pedal
    bmesh_create_cube(
        bm_pedals,
        size=0.02,
        matrix=mat_trans(0.44, 0.73, 0.56) @ mat_rot_x(-45) @ mat_scale(2.2, 0.8, 6.5)
    )
    # Dead Footrest Pad
    bmesh_create_cube(
        bm_pedals,
        size=0.02,
        matrix=mat_trans(0.22, 0.74, 0.58) @ mat_rot_x(-45) @ mat_scale(3.2, 0.8, 8.0)
    )
    obj_pedals = create_bmesh_object("INTERIOR_DriverPedals", col_name, bm_pedals)
    assign_material(obj_pedals, mat_silver)
    objects.append(obj_pedals)

    # -------------------------------------------------------------
    # 4. Front Ergonomic Bucket Seats (Driver & Passenger)
    # Driver: X = +0.38m, Passenger: X = -0.38m, Y = +0.05m
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_Driver"), (-1.0, "_Passenger")]:
        bm_seat = bmesh.new()
        seat_x = 0.38 * mult
        seat_y = 0.05
        
        # Lower Seat Cushion Base
        bmesh_create_cube(
            bm_seat,
            size=0.08,
            matrix=mat_trans(seat_x, seat_y, 0.65) @ mat_scale(6.2, 6.5, 1.8)
        )
        # Cushion Left & Right Thigh Bolsters
        for bx in [0.22, -0.22]:
            bmesh_create_cube(
                bm_seat,
                size=0.05,
                matrix=mat_trans(seat_x + bx, seat_y, 0.72) @ mat_scale(1.8, 9.8, 1.8)
            )
            
        # Contoured Seat Backrest (recline angle ~ 15 deg)
        bmesh_create_cube(
            bm_seat,
            size=0.08,
            matrix=mat_trans(seat_x, seat_y - 0.22, 1.05) @ mat_rot_x(-14) @ mat_scale(5.8, 1.8, 7.5)
        )
        # Backrest Torso Side Bolsters
        for bx in [0.22, -0.22]:
            bmesh_create_cube(
                bm_seat,
                size=0.06,
                matrix=mat_trans(seat_x + bx, seat_y - 0.20, 1.05) @ mat_rot_x(-14) @ mat_scale(1.5, 2.5, 8.8)
            )
            
        # Adjustable Headrest on Twin Chrome Posts
        # Chrome posts
        for px in [0.06, -0.06]:
            bmesh_create_cylinder(
                bm_seat,
                radius=0.007,
                depth=0.10,
                segments=8,
                matrix=mat_trans(seat_x + px, seat_y - 0.32, 1.40)
            )
        # Padded Headrest Pillow
        bmesh_create_cube(
            bm_seat,
            size=0.06,
            matrix=mat_trans(seat_x, seat_y - 0.33, 1.48) @ mat_rot_x(-10) @ mat_scale(4.2, 2.2, 3.2)
        )
        
        # Steel Floor Mounting Tracks & Adjustment Lever
        for tx in [0.18, -0.18]:
            bmesh_create_cube(
                bm_seat,
                size=0.02,
                matrix=mat_trans(seat_x + tx, seat_y, 0.54) @ mat_scale(1.4, 25.0, 1.0)
            )
            
        obj_seat = create_bmesh_object(f"INTERIOR_FrontSeat{sfx}", col_name, bm_seat)
        assign_material(obj_seat, mat_leather)
        apply_bevel_and_weighted_normals(obj_seat, width=0.004, segments=2)
        objects.append(obj_seat)

    # -------------------------------------------------------------
    # 5. Rear 60/40 Split 3-Passenger Bench Seat
    # Spans X = -0.65m to +0.65m, Y = -0.75m, Z = 0.65m to 1.45m
    # -------------------------------------------------------------
    bm_rear_seat = bmesh.new()
    # Rear Lower Cushion
    bmesh_create_cube(
        bm_rear_seat,
        size=0.08,
        matrix=mat_trans(0.0, -0.70, 0.65) @ mat_scale(16.5, 6.2, 1.8)
    )
    # Rear Backrest (reclined against rear cab wall)
    bmesh_create_cube(
        bm_rear_seat,
        size=0.08,
        matrix=mat_trans(0.0, -0.96, 1.05) @ mat_rot_x(-10) @ mat_scale(16.5, 1.8, 7.5)
    )
    # 3 Rear Headrests (Left, Center, Right)
    for hx in [-0.45, 0.0, 0.45]:
        bmesh_create_cube(
            bm_rear_seat,
            size=0.05,
            matrix=mat_trans(hx, -1.02, 1.45) @ mat_rot_x(-8) @ mat_scale(4.2, 2.2, 3.2)
        )
    # Center Fold-Down Armrest
    bmesh_create_cube(
        bm_rear_seat,
        size=0.04,
        matrix=mat_trans(0.0, -0.92, 0.95) @ mat_scale(4.8, 1.5, 6.5)
    )
    obj_rear_seat = create_bmesh_object("INTERIOR_RearBenchSeat", col_name, bm_rear_seat)
    assign_material(obj_rear_seat, mat_leather)
    apply_bevel_and_weighted_normals(obj_rear_seat, width=0.004, segments=2)
    objects.append(obj_rear_seat)

    # -------------------------------------------------------------
    # 6. Four Detailed Interior Door Cards (Front & Rear, Left & Right)
    # -------------------------------------------------------------
    door_card_data = [
        ("FrontDoorCard", 0.28, 1.0, 0.52),
        ("FrontDoorCard", 0.28, -1.0, 0.52),
        ("RearDoorCard", -0.78, 1.0, 0.38),
        ("RearDoorCard", -0.78, -1.0, 0.38),
    ]
    for label, y_c, mult, half_len in door_card_data:
        sfx = "_L" if mult > 0 else "_R"
        bm_card = bmesh.new()
        card_x = 0.76 * mult
        
        # Door Card Main Substrate Panel
        bmesh_create_cube(
            bm_card,
            size=0.04,
            matrix=mat_trans(card_x, y_c, 0.70) @ mat_scale(1.0, half_len * 50.0, 11.0)
        )
        # Padded Leather Armrest Shelf
        bmesh_create_cube(
            bm_card,
            size=0.03,
            matrix=mat_trans(card_x - (0.025 * mult), y_c, 0.74) @ mat_scale(2.2, half_len * 35.0, 1.2)
        )
        # Power Window Switch Bezel & Toggle Buttons
        bmesh_create_cube(
            bm_card,
            size=0.015,
            matrix=mat_trans(card_x - (0.028 * mult), y_c + 0.12, 0.77) @ mat_scale(1.8, 7.5, 0.6)
        )
        # Satin Chrome Interior Door Pull Handle
        bmesh_create_cube(
            bm_card,
            size=0.018,
            matrix=mat_trans(card_x - (0.025 * mult), y_c + 0.18, 0.88) @ mat_scale(1.2, 5.0, 1.4)
        )
        # Lower Door Pocket with Integrated Bottle Holder & Speaker Grille
        bmesh_create_cube(
            bm_card,
            size=0.03,
            matrix=mat_trans(card_x - (0.02 * mult), y_c, 0.54) @ mat_scale(1.8, half_len * 40.0, 3.8)
        )
        # Circular Door Speaker Grille
        bmesh_create_cylinder(
            bm_card,
            radius=0.075,
            depth=0.015,
            segments=16,
            matrix=mat_trans(card_x - (0.025 * mult), y_c + 0.18, 0.55) @ mat_rot_y(90)
        )
        obj_card = create_bmesh_object(f"INTERIOR_{label}{sfx}", col_name, bm_card)
        assign_material(obj_card, mat_dash)
        apply_bevel_and_weighted_normals(obj_card, width=0.002, segments=2)
        objects.append(obj_card)

    # -------------------------------------------------------------
    # 7. Interior Day/Night Rearview Mirror
    # Mounted to windshield glass header at Y = +0.38m, Z = 1.68m
    # -------------------------------------------------------------
    bm_rvm = bmesh.new()
    # Mounting stem to header
    bmesh_create_cylinder(
        bm_rvm,
        radius=0.008,
        depth=0.06,
        segments=8,
        matrix=mat_trans(0.0, 0.36, 1.72) @ mat_rot_x(35)
    )
    # Mirror housing frame
    bmesh_create_cube(
        bm_rvm,
        size=0.02,
        matrix=mat_trans(0.0, 0.40, 1.68) @ mat_scale(11.0, 1.2, 3.4)
    )
    # Reflective Chrome Glass Surface
    bmesh_create_cube(
        bm_rvm,
        size=0.015,
        matrix=mat_trans(0.0, 0.39, 1.68) @ mat_scale(13.8, 0.4, 4.0)
    )
    obj_rvm = create_bmesh_object("INTERIOR_RearviewMirror", col_name, bm_rvm)
    assign_material(obj_rvm, mat_mirror)
    objects.append(obj_rvm)

    print(f"[HILUX] Interior Cockpit generated with {len(objects)} objects.")
    return objects
