"""
Bugatti Divo Asymmetric Cockpit & Bespoke Interior (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_interior(mat_registry):
    """Constructs the asymmetric driver-focused cockpit, Alcantara steering wheel, and structural carbon spine."""
    created_objects = []

    # 1. Structural Carbon Fiber Interior Spine (Central Cockpit Structural Element)
    spine = c.create_box(
        "INTERIOR_Carbon_Cockpit_Spine",
        location=(0.0, 0.250, c.GROUND_CLEARANCE + 0.420),
        size=(0.180, 1.650, 0.520),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.interior_matte_carbon
    )
    created_objects.append(spine)

    # 2. Asymmetric Driver Cockpit (Left Side Focus)
    # Driver Seat - Carbon Shell with Alcantara Upholstery
    driver_seat = c.create_box(
        "INTERIOR_Driver_Carbon_Shell_Seat",
        location=(0.420, 0.150, c.GROUND_CLEARANCE + 0.220),
        size=(0.520, 0.880, 0.620),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.alcantara_grey
    )
    created_objects.append(driver_seat)
    
    # Driver Seat Alcantara Cushion
    seat_cushion = c.create_box(
        "INTERIOR_Driver_Alcantara_Cushion",
        location=(0.420, 0.150, c.GROUND_CLEARANCE + 0.550),
        size=(0.480, 0.820, 0.080),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.alcantara_grey
    )
    created_objects.append(seat_cushion)

    # Passenger Seat (Right Side - Different Design)
    passenger_seat = c.create_box(
        "INTERIOR_Passenger_Carbon_Shell_Seat",
        location=(-0.420, 0.150, c.GROUND_CLEARANCE + 0.220),
        size=(0.520, 0.880, 0.620),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.alcantara_grey
    )
    created_objects.append(passenger_seat)
    
    # Passenger Asymmetric Blue Leather Accent
    passenger_leather = c.create_box(
        "INTERIOR_Passenger_Blue_Leather_Accent",
        location=(-0.420, 0.150, c.GROUND_CLEARANCE + 0.550),
        size=(0.480, 0.820, 0.080),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.leather_divo_blue
    )
    created_objects.append(passenger_leather)

    # 3. Bugatti Divo Alcantara Flat-Bottom Steering Wheel
    wheel = c.create_cylinder(
        "INTERIOR_Divo_Steering_Wheel",
        location=(0.420, 0.680, c.GROUND_CLEARANCE + 0.580),
        radius=0.165,
        depth=0.035,
        rotation=(math.radians(-25), 0, 0),
        vertices=32,
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.alcantara_grey
    )
    created_objects.append(wheel)
    
    # Steering Wheel Center Mark (Turquoise)
    wheel_center = c.create_box(
        "INTERIOR_Steering_Wheel_Turquoise_Center_Mark",
        location=(0.420, 0.680, c.GROUND_CLEARANCE + 0.580),
        size=(0.020, 0.015, 0.020),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.divo_racing_blue
    )
    created_objects.append(wheel_center)
    
    # Steering Column
    column = c.create_cylinder(
        "INTERIOR_Steering_Column",
        location=(0.420, 0.820, c.GROUND_CLEARANCE + 0.550),
        radius=0.030,
        depth=0.320,
        rotation=(math.radians(-25), 0, 0),
        vertices=16,
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.interior_matte_carbon
    )
    created_objects.append(column)

    # 4. Minimalist Instrument Cluster (Digital Display Integrated in Column Cowl)
    cluster = c.create_box(
        "INTERIOR_Digital_Instrument_Cluster",
        location=(0.420, 0.920, c.GROUND_CLEARANCE + 0.780),
        size=(0.220, 0.040, 0.060),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.divo_titanium_grey
    )
    created_objects.append(cluster)

    # 5. Central Console & HVAC Controls (Between Seats)
    console = c.create_box(
        "INTERIOR_Central_Console_Controls",
        location=(0.0, 0.400, c.GROUND_CLEARANCE + 0.380),
        size=(0.280, 0.480, 0.180),
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.interior_matte_carbon
    )
    created_objects.append(console)

    # 6. Race-Ready 6-Point Harness Mounts
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        for h_idx, y_pos in enumerate([0.450, 0.050, -0.350]):
            harness = c.create_box(
                f"INTERIOR_Harness_Mount_{side}_{h_idx+1}",
                location=(sign * 0.580, y_pos, c.GROUND_CLEARANCE + 0.380),
                size=(0.030, 0.030, 0.025),
                col_name="10_Divo_Cockpit_Interior",
                mat=mat_registry.divo_racing_blue
            )
            created_objects.append(harness)

    # 7. Fire Suppression System Bottle (Behind Passenger Seat)
    fire_bottle = c.create_cylinder(
        "INTERIOR_Fire_Suppression_Bottle",
        location=(-0.580, -0.500, c.GROUND_CLEARANCE + 0.500),
        radius=0.060,
        depth=0.380,
        vertices=24,
        col_name="10_Divo_Cockpit_Interior",
        mat=mat_registry.divo_brake_caliper
    )
    created_objects.append(fire_bottle)

    print(f"[DIVO_INTERIOR] Created {len(created_objects)} asymmetric cockpit & bespoke interior objects.")
    return created_objects