"""
Bugatti Divo Hardware, Air Intakes & Signature Details (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_hardware(mat_registry):
    """Constructs side mirror cameras, fuel cap, VIN plate, and aerodynamic air intakes."""
    created_objects = []

    # 1. Aerodynamic Side Mirror Cameras (Digital Rear-View System)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        mirror_x = sign * 1.050
        mirror_y = 0.350
        mirror_z = c.BELTLINE_Z + 0.080
        
        # Camera Housing Arm
        arm = c.create_cylinder(
            f"HARDWARE_Side_Mirror_Cam_Arm_{side}",
            location=(sign * 0.680, mirror_y + 0.080, mirror_z + 0.020),
            radius=0.018,
            depth=0.380,
            rotation=(0, math.radians(-10), math.radians(25 if sign > 0 else -25)),
            vertices=16,
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(arm)
        
        # Camera Sensor Housing
        cam = c.create_box(
            f"HARDWARE_Side_Mirror_Cam_Housing_{side}",
            location=(mirror_x, mirror_y, mirror_z),
            size=(0.110, 0.060, 0.070),
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.divo_titanium_grey
        )
        created_objects.append(cam)
        
        # Optical Camera Lens
        lens = c.create_cylinder(
            f"HARDWARE_Side_Mirror_Cam_Lens_{side}",
            location=(mirror_x, mirror_y - 0.028, mirror_z),
            radius=0.032,
            depth=0.025,
            rotation=(math.radians(90), 0, 0),
            vertices=24,
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(lens)

    # 2. Rear Center High-Mount Fuel Cap (Behind Cockpit)
    fuel_cap = c.create_cylinder(
        "HARDWARE_Rear_Center_Fuel_Cap",
        location=(0.0, -0.050, c.ROOF_CROWN_Z - 0.080),
        radius=0.070,
        depth=0.025,
        vertices=24,
        col_name="11_Divo_Hardware_AirIntakes",
        mat=mat_registry.divo_titanium_grey
    )
    created_objects.append(fuel_cap)

    # 3. VIN & Homologation Plate (Driver Door Sill)
    vin_plate = c.create_box(
        "HARDWARE_VIN_Homologation_Plate",
        location=(0.720, 0.350, c.GROUND_CLEARANCE + 0.180),
        size=(0.120, 0.060, 0.003),
        col_name="11_Divo_Hardware_AirIntakes",
        mat=mat_registry.horseshoe_chrome
    )
    created_objects.append(vin_plate)

    # 4. Front S-Duct Air Intakes (Feeds Active Aero & Brake Cooling)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        s_duct = c.create_box(
            f"HARDWARE_Front_S_Duct_Intake_{side}",
            location=(sign * 0.420, c.FRONT_BUMPER_Y - 0.120, c.GROUND_CLEARANCE + 0.220),
            size=(0.180, 0.150, 0.120),
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(s_duct)

    # 5. Rear Top-Exit Brake Cooling Louvers (Integrated in Diffuser Sidewalls)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        brake_louver = c.create_box(
            f"HARDWARE_Rear_Brake_Cooling_Louver_{side}",
            location=(sign * 0.880, c.REAR_BUMPER_Y + 0.020, c.GROUND_CLEARANCE + 0.420),
            size=(0.180, 0.220, 0.240),
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.carbon_gloss
        )
        created_objects.append(brake_louver)

    # 6. W16 Quad Turbo Wastegate Dump Pipes (Visible through rear diffuser center)
    for wg_idx in range(4):
        x_off = -0.120 + wg_idx * 0.080
        wastegate = c.create_cylinder(
            f"HARDWARE_W16_Wastegate_Pipe_{wg_idx+1}",
            location=(x_off, c.REAR_BUMPER_Y + 0.080, c.GROUND_CLEARANCE + 0.320),
            radius=0.022,
            depth=0.180,
            rotation=(math.radians(90), 0, 0),
            vertices=16,
            col_name="11_Divo_Hardware_AirIntakes",
            mat=mat_registry.titanium_exhaust
        )
        created_objects.append(wastegate)

    print(f"[DIVO_HARDWARE] Created {len(created_objects)} hardware, air intake & signature detail objects.")
    return created_objects