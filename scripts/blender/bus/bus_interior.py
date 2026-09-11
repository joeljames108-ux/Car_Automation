"""
Bus Interior Cockpit & Passenger Seating Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_interior(mat_registry):
    """Constructs driver cockpit station, ergonomic passenger seating rows, and safety grab rails."""
    created_objects = []
    
    # 1. Driver Ergonomic Cockpit Station (LHD, Forward Left)
    driver_x = 0.580
    driver_y = 4.200
    driver_floor_z = c.FLOOR_Z + 0.120
    
    # Driver Dashboard & Instrument Console Binnacle
    dash = c.create_box(
        "INTERIOR_Driver_Dashboard_Console",
        location=(driver_x, driver_y + 0.550, driver_floor_z + 0.550),
        size=(0.850, 0.650, 0.480),
        col_name="10_Bus_Interior_Cockpit",
        mat=mat_registry.cockpit_dash
    )
    created_objects.append(dash)
    
    # Steering Column & Transit Wheel
    column = c.create_cylinder(
        "INTERIOR_Steering_Column",
        location=(driver_x, driver_y + 0.380, driver_floor_z + 0.480),
        radius=0.045,
        depth=0.550,
        rotation=(math.radians(-35), 0, 0),
        vertices=16,
        col_name="10_Bus_Interior_Cockpit",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(column)
    
    wheel = c.create_cylinder(
        "INTERIOR_Steering_Wheel",
        location=(driver_x, driver_y + 0.260, driver_floor_z + 0.720),
        radius=0.240,
        depth=0.040,
        rotation=(math.radians(-35), 0, 0),
        vertices=32,
        col_name="10_Bus_Interior_Cockpit",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(wheel)
    
    # Driver Pneumatic Suspension High-Back Seat
    driver_seat = c.create_box(
        "INTERIOR_Driver_Seat_Assembly",
        location=(driver_x, driver_y, driver_floor_z + 0.450),
        size=(0.580, 0.580, 0.820),
        col_name="10_Bus_Interior_Cockpit",
        mat=mat_registry.seat_fabric
    )
    created_objects.append(driver_seat)
    
    # Fare Box / Smartcard Ticket Validator Terminal
    fare_box = c.create_box(
        "INTERIOR_FareBox_Smartcard_Terminal",
        location=(driver_x - 0.550, driver_y + 0.400, driver_floor_z + 0.450),
        size=(0.280, 0.280, 0.900),
        col_name="10_Bus_Interior_Cockpit",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(fare_box)

    # 2. Passenger Ergonomic Transit Seating Rows (8 Pairs along cabin)
    row_y_start = 2.800
    row_y_end = -3.800
    num_rows = 7
    row_step = (row_y_start - row_y_end) / (num_rows - 1)
    
    for r_idx in range(num_rows):
        y_pos = row_y_start - r_idx * row_step
        # Left and Right pairs of 2-passenger bench seats
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            # Skip center exit door zone on curbside (-X)
            if sign < 0 and -0.600 < y_pos < 1.000:
                continue
                
            seat_x = sign * 0.780
            seat_obj = c.create_box(
                f"INTERIOR_Passenger_Seat_Row_{r_idx+1:02d}_{side}",
                location=(seat_x, y_pos, c.FLOOR_Z + 0.480),
                size=(0.880, 0.480, 0.780),
                col_name="10_Bus_Interior_Cockpit",
                mat=mat_registry.seat_fabric
            )
            created_objects.append(seat_obj)

    # 3. Full-Length Overhead Grab Rails & Vertical Stanchion Poles (High-Vis Safety Yellow)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        rail_x = sign * 0.350
        overhead_rail = c.create_cylinder(
            f"INTERIOR_Overhead_GrabRail_{side}",
            location=(rail_x, -0.400, c.ROOF_BODY_Z - 0.450),
            radius=0.018,
            depth=7.800,
            rotation=(math.radians(90), 0, 0),
            vertices=16,
            col_name="10_Bus_Interior_Cockpit",
            mat=mat_registry.grab_rail_yellow
        )
        created_objects.append(overhead_rail)
        
        # Vertical Stanchion Poles
        for p_idx, p_y in enumerate([2.200, 0.800, -0.800, -2.400, -3.800]):
            pole = c.create_cylinder(
                f"INTERIOR_Stanchion_Pole_{side}_{p_idx+1:02d}",
                location=(rail_x, p_y, c.FLOOR_Z + (c.ROOF_BODY_Z - c.FLOOR_Z)/2.0),
                radius=0.018,
                depth=c.ROOF_BODY_Z - c.FLOOR_Z - 0.400,
                vertices=16,
                col_name="10_Bus_Interior_Cockpit",
                mat=mat_registry.grab_rail_yellow
            )
            created_objects.append(pole)

    print(f"[BUS_INTERIOR] Created {len(created_objects)} interior & cockpit objects.")
    return created_objects
