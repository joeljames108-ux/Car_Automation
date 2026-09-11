"""
Bugatti Divo Staggered Forged Wheels & Carbon Ceramic Brakes (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_wheels_and_brakes(mat_registry):
    """Constructs staggered 20/21" forged alloy wheels, directional aero blades, Michelin Pilot Sport Cup 2 tires, and carbon ceramic brakes."""
    created_objects = []

    # 1. Front Steer Wheels (20" x 9.5J, 285/30 R20 Michelin Pilot Sport Cup 2)
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        wheel_x = sign * (c.FRONT_TRACK / 2.0)
        wheel_y = c.FRONT_AXLE_Y
        
        # Front Ultra-High Performance Tire
        tire = c.create_cylinder(
            f"WHEEL_Tire_Front_{side}",
            location=(wheel_x, wheel_y, c.FRONT_HUB_Z),
            radius=c.FRONT_TIRE_RADIUS,
            depth=c.FRONT_TIRE_WIDTH,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.pilot_sport_cup2
        )
        created_objects.append(tire)
        
        # Front Forged Alloy Rim with 5 Twin-Spoke Directional Aero Blades
        rim = c.create_cylinder(
            f"WHEEL_Rim_Front_{side}",
            location=(wheel_x + sign * 0.015, wheel_y, c.FRONT_HUB_Z),
            radius=c.FRONT_RIM_RADIUS,
            depth=c.FRONT_TIRE_WIDTH - 0.050,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_wheel_rim
        )
        created_objects.append(rim)
        
        # Directional Aero Blades (Turquoise Pinstripe on Leading Edge)
        for blade_idx in range(5):
            angle = blade_idx * math.radians(72)
            blade_x = math.cos(angle) * 0.200
            blade_z = math.sin(angle) * 0.200
            blade = c.create_box(
                f"WHEEL_Rim_Aero_Blade_Front_{side}_{blade_idx+1}",
                location=(wheel_x + sign * 0.020 + blade_x, wheel_y, c.FRONT_HUB_Z + blade_z),
                size=(0.012, 0.080, 0.080),
                col_name="09_Divo_Aero_Wheels_Brakes",
                mat=mat_registry.divo_wheel_turquoise
            )
            created_objects.append(blade)
        
        # Bugatti Monobloc Center Lock Nut
        center_lock = c.create_cylinder(
            f"WHEEL_CenterLock_Front_{side}",
            location=(wheel_x + sign * (c.FRONT_TIRE_WIDTH/2.0 + 0.008), wheel_y, c.FRONT_HUB_Z),
            radius=0.075,
            depth=0.045,
            rotation=(0, math.radians(90), 0),
            vertices=24,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_wheel_rim
        )
        created_objects.append(center_lock)
        
        # 420mm Carbon Ceramic Matrix Brake Disc
        disc = c.create_cylinder(
            f"BRAKE_Rotor_Front_{side}",
            location=(wheel_x - sign * 0.055, wheel_y, c.FRONT_HUB_Z),
            radius=0.210,
            depth=0.036,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.carbon_ceramic_rotor
        )
        created_objects.append(disc)
        
        # Monobloc 8-Piston Front Caliper (Divo Turquoise Blue)
        caliper = c.create_box(
            f"BRAKE_Caliper_Front_{side}",
            location=(wheel_x - sign * 0.055, wheel_y + 0.150, c.FRONT_HUB_Z + 0.080),
            size=(0.080, 0.220, 0.150),
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_brake_caliper
        )
        created_objects.append(caliper)

    # 2. Rear Drive Wheels (21" x 13.0J, 355/25 R21 Michelin Pilot Sport Cup 2)
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        wheel_x = sign * (c.REAR_TRACK / 2.0)
        wheel_y = c.REAR_AXLE_Y
        
        # Rear Massive 355mm Footprint Tire
        r_tire = c.create_cylinder(
            f"WHEEL_Tire_Rear_{side}",
            location=(wheel_x, wheel_y, c.REAR_HUB_Z),
            radius=c.REAR_TIRE_RADIUS,
            depth=c.REAR_TIRE_WIDTH,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.pilot_sport_cup2
        )
        created_objects.append(r_tire)
        
        # Rear Forged Alloy Rim (Wider Barrel)
        r_rim = c.create_cylinder(
            f"WHEEL_Rim_Rear_{side}",
            location=(wheel_x + sign * 0.015, wheel_y, c.REAR_HUB_Z),
            radius=c.REAR_RIM_RADIUS,
            depth=c.REAR_TIRE_WIDTH - 0.060,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_wheel_rim
        )
        created_objects.append(r_rim)
        
        # Directional Aero Blades (Rear)
        for blade_idx in range(5):
            angle = blade_idx * math.radians(72)
            blade_x = math.cos(angle) * 0.210
            blade_z = math.sin(angle) * 0.210
            r_blade = c.create_box(
                f"WHEEL_Rim_Aero_Blade_Rear_{side}_{blade_idx+1}",
                location=(wheel_x + sign * 0.020 + blade_x, wheel_y, c.REAR_HUB_Z + blade_z),
                size=(0.012, 0.090, 0.090),
                col_name="09_Divo_Aero_Wheels_Brakes",
                mat=mat_registry.divo_wheel_turquoise
            )
            created_objects.append(r_blade)
        
        # Center Lock Nut
        r_lock = c.create_cylinder(
            f"WHEEL_CenterLock_Rear_{side}",
            location=(wheel_x + sign * (c.REAR_TIRE_WIDTH/2.0 + 0.010), wheel_y, c.REAR_HUB_Z),
            radius=0.080,
            depth=0.050,
            rotation=(0, math.radians(90), 0),
            vertices=24,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_wheel_rim
        )
        created_objects.append(r_lock)
        
        # 400mm Rear Carbon Ceramic Disc
        r_disc = c.create_cylinder(
            f"BRAKE_Rotor_Rear_{side}",
            location=(wheel_x - sign * 0.050, wheel_y, c.REAR_HUB_Z),
            radius=0.200,
            depth=0.034,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.carbon_ceramic_rotor
        )
        created_objects.append(r_disc)
        
        # 6-Piston Rear Caliper
        r_caliper = c.create_box(
            f"BRAKE_Caliper_Rear_{side}",
            location=(wheel_x - sign * 0.050, wheel_y + 0.160, c.REAR_HUB_Z + 0.100),
            size=(0.070, 0.190, 0.130),
            col_name="09_Divo_Aero_Wheels_Brakes",
            mat=mat_registry.divo_brake_caliper
        )
        created_objects.append(r_caliper)

    print(f"[DIVO_WHEELS] Created {len(created_objects)} staggered wheel, tire, brake & aero blade objects.")
    return created_objects