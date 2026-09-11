"""
Hilux Underbody Protection & Fuel System Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs transmission skid plate, 80L fuel tank with steel straps and heat shield,
and under-bed full-size spare tire carrier with chain hoist winch.
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
    WHEEL_RADIUS,
    TIRE_RADIUS
)

def build_underbody(materials):
    mat_skid = materials.get("Mat_SkidPlate_Alum")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_steel = materials.get("Mat_SteelChassis_Black")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    mat_tire = materials.get("Mat_Tire_Rubber")
    mat_alloy = materials.get("Mat_Alloy_Machined")
    mat_heat = materials.get("Mat_Exhaust_Stainless")
    
    col_name = "01_Chassis_Frame"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Heavy-Duty Transmission & Transfer Case Skid Plate
    # Mounted under transmission crossmember: Y = +0.40m to +1.05m, Z = 0.30m
    # -------------------------------------------------------------
    bm_skid = bmesh.new()
    # Main protective plate
    bmesh_create_cube(
        bm_skid,
        size=0.015,
        matrix=mat_trans(0.0, 0.72, 0.30) @ mat_scale(42.0, 48.0, 1.0)
    )
    # Stamped stiffening corrugations
    for sx in [-0.14, 0.0, 0.14]:
        bmesh_create_cube(
            bm_skid,
            size=0.012,
            matrix=mat_trans(sx, 0.72, 0.29) @ mat_scale(1.2, 38.0, 0.8)
        )
    obj_skid = create_bmesh_object("UNDERBODY_TransmissionSkidPlate", col_name, bm_skid)
    assign_material(obj_skid, mat_skid)
    apply_bevel_and_weighted_normals(obj_skid, width=0.002, segments=2)
    objects.append(obj_skid)

    # -------------------------------------------------------------
    # 2. 80-Liter Polyethylene Fuel Tank with Steel Straps & Heat Shield
    # Mounted inboard of left frame rail: Y = -0.30m to -1.15m, X = -0.28m, Z = 0.42m
    # -------------------------------------------------------------
    bm_tank = bmesh.new()
    # Molded tank body (rounded corners)
    bmesh_create_cube(
        bm_tank,
        size=0.08,
        matrix=mat_trans(-0.28, -0.72, 0.42) @ mat_scale(3.4, 9.5, 2.8)
    )
    # Dual Steel Retention Straps
    for strap_y in [-0.48, -0.92]:
        bmesh_create_cube(
            bm_tank,
            size=0.01,
            matrix=mat_trans(-0.28, strap_y, 0.30) @ mat_scale(3.5, 4.0, 0.8)
        )
    # Stamped Aluminum Exhaust Heat Shield
    bmesh_create_cube(
        bm_tank,
        size=0.008,
        matrix=mat_trans(-0.12, -0.72, 0.42) @ mat_scale(0.8, 9.8, 2.9)
    )
    obj_tank = create_bmesh_object("UNDERBODY_FuelTank_80L", col_name, bm_tank)
    assign_material(obj_tank, mat_trim)
    apply_bevel_and_weighted_normals(obj_tank, width=0.003, segments=2)
    objects.append(obj_tank)

    # -------------------------------------------------------------
    # 3. Full-Size 18-inch Matching Spare Wheel & Under-Bed Winch Hoist
    # Mounted horizontally under rear cargo bed: Y = -2.15m, Z = 0.38m, X = 0.0m
    # -------------------------------------------------------------
    bm_spare = bmesh.new()
    # Spare Tire Carcass (Horizontal orientation)
    bmesh_create_torus(
        bm_spare,
        major_radius=(TIRE_RADIUS + WHEEL_RADIUS) / 2.0,
        minor_radius=(TIRE_RADIUS - WHEEL_RADIUS) / 2.0,
        major_segments=24,
        minor_segments=12,
        matrix=mat_trans(0.0, -2.15, 0.38) @ mat_scale(1.0, 1.0, 1.4)
    )
    # Spare Wheel Rim
    bmesh_create_cylinder(
        bm_spare,
        radius=WHEEL_RADIUS,
        depth=0.20,
        segments=20,
        matrix=mat_trans(0.0, -2.15, 0.38)
    )
    # Chain Winch Hoist Mechanism & Cable Crossmember Mount
    bmesh_create_cylinder(
        bm_spare,
        radius=0.045,
        depth=0.14,
        segments=12,
        matrix=mat_trans(0.0, -2.15, 0.46)
    )
    obj_spare = create_bmesh_object("UNDERBODY_SpareWheelAssembly", col_name, bm_spare)
    assign_material(obj_spare, mat_tire)
    apply_bevel_and_weighted_normals(obj_spare, width=0.002, segments=2)
    objects.append(obj_spare)

    print(f"[HILUX] Underbody & Fuel System generated with {len(objects)} objects.")
    return objects
