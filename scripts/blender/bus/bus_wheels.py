"""
Bus Heavy-Duty Wheels, Dually Assemblies & Brakes Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_wheels_and_brakes(mat_registry):
    """Constructs 22.5-inch forged commercial alloy wheels, heavy duty tires, and dually rear assemblies."""
    created_objects = []
    
    # Wheel Geometry Specs
    rim_radius = c.WHEEL_RADIUS # 0.285 m
    tire_radius = c.TIRE_RADIUS # 0.510 m
    front_w = c.FRONT_TIRE_WIDTH # 0.295 m
    hub_z = c.HUB_Z # 0.510 m
    
    # -------------------------------------------------------------------------
    # 1. FRONT STEER AXLE WHEELS (Left & Right)
    # -------------------------------------------------------------------------
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        wheel_x = sign * (c.FRONT_TRACK / 2.0)
        wheel_y = c.FRONT_AXLE_Y
        
        # Front Commercial Tire
        tire = c.create_cylinder(
            f"WHEEL_Tire_{side}",
            location=(wheel_x, wheel_y, hub_z),
            radius=tire_radius,
            depth=front_w,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.tire_rubber
        )
        created_objects.append(tire)
        
        # Front Forged Alloy Rim with 10-Hole Ventilation
        rim = c.create_cylinder(
            f"WHEEL_Rim_{side}",
            location=(wheel_x + sign * 0.020, wheel_y, hub_z),
            radius=rim_radius,
            depth=front_w - 0.040,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.alloy_wheel
        )
        created_objects.append(rim)
        
        # 10-Lug Commercial Wheel Center Hub Cap
        hub_cap = c.create_cylinder(
            f"WHEEL_HubCap_{side}",
            location=(wheel_x + sign * (front_w/2.0 + 0.010), wheel_y, hub_z),
            radius=0.110,
            depth=0.060,
            rotation=(0, math.radians(90), 0),
            vertices=24,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.alloy_wheel
        )
        created_objects.append(hub_cap)
        
        # Heavy-Duty Vented Brake Disc & Caliper
        disc = c.create_cylinder(
            f"BRAKE_Rotor_{side}",
            location=(wheel_x - sign * 0.060, wheel_y, hub_z),
            radius=0.220,
            depth=0.045,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.brake_rotor
        )
        created_objects.append(disc)
        
        caliper = c.create_box(
            f"BRAKE_Caliper_{side}",
            location=(wheel_x - sign * 0.060, wheel_y + 0.140, hub_z + 0.120),
            size=(0.090, 0.220, 0.160),
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.brake_caliper
        )
        created_objects.append(caliper)

    # -------------------------------------------------------------------------
    # 2. REAR DUALLY DRIVE AXLE WHEELS (Dual Tires per Side)
    # -------------------------------------------------------------------------
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        center_x = sign * (c.REAR_TRACK / 2.0)
        wheel_y = c.REAR_AXLE_Y
        
        # Outer and Inner Dual Wheels
        for d_idx, d_offset in enumerate([c.DUAL_SPACING/2.0, -c.DUAL_SPACING/2.0]):
            dually_label = "Outer" if d_idx == 0 else "Inner"
            tire_x = center_x + sign * d_offset
            
            r_tire = c.create_cylinder(
                f"WHEEL_Tire_{side}_{dually_label}",
                location=(tire_x, wheel_y, hub_z),
                radius=tire_radius,
                depth=front_w,
                rotation=(0, math.radians(90), 0),
                vertices=36,
                col_name="09_Bus_Wheels_Dually_Brakes",
                mat=mat_registry.tire_rubber
            )
            created_objects.append(r_tire)
            
            r_rim = c.create_cylinder(
                f"WHEEL_Rim_{side}_{dually_label}",
                location=(tire_x + sign * 0.015, wheel_y, hub_z),
                radius=rim_radius,
                depth=front_w - 0.040,
                rotation=(0, math.radians(90), 0),
                vertices=36,
                col_name="09_Bus_Wheels_Dually_Brakes",
                mat=mat_registry.alloy_wheel
            )
            created_objects.append(r_rim)

        # Heavy-Duty Flanged Rear Axle Drive Hub Cap
        r_hub_cap = c.create_cylinder(
            f"WHEEL_DriveHubCap_{side}",
            location=(center_x + sign * (c.DUAL_SPACING/2.0 + front_w/2.0 + 0.015), wheel_y, hub_z),
            radius=0.130,
            depth=0.110,
            rotation=(0, math.radians(90), 0),
            vertices=24,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.alloy_wheel
        )
        created_objects.append(r_hub_cap)
        
        # Rear Pneumatic Heavy-Duty Brake Assembly
        r_disc = c.create_cylinder(
            f"BRAKE_Rotor_{side}",
            location=(center_x - sign * (c.DUAL_SPACING/2.0 + 0.120), wheel_y, hub_z),
            radius=0.240,
            depth=0.050,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.brake_rotor
        )
        created_objects.append(r_disc)

    print(f"[BUS_WHEELS] Created {len(created_objects)} wheel & brake assembly objects.")
    return created_objects
