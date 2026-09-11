"""
Bus Lighting & Optics Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_lighting(mat_registry):
    """Constructs LED projector headlights, vertical taillight towers, and LED destination matrix boards."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    
    # 1. Front LED Matrix Route Destination Display Sign (Main Header Box)
    dest_sign = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Front",
        location=(0.0, c.FRONT_BUMPER_Y - 0.080, c.DESTINATION_SIGN_Z),
        size=(1.850, 0.060, 0.320),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(dest_sign)
    
    # Curbside Passenger Route Display Sign
    side_dest = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Side",
        location=(-1.0 * (bw/2.0 + 0.028), 3.200, c.DESTINATION_SIGN_Z - 0.150),
        size=(0.030, 0.950, 0.180),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(side_dest)
    
    # Rear Route Number Display
    rear_dest = c.create_box(
        "LIGHT_Destination_Matrix_Sign_Rear",
        location=(0.0, c.REAR_BUMPER_Y + 0.025, c.DESTINATION_SIGN_Z - 0.120),
        size=(0.650, 0.040, 0.220),
        col_name="04_Bus_Lighting_Optics",
        mat=mat_registry.led_destination
    )
    created_objects.append(rear_dest)

    # 2. Front Headlamp Clusters (Multi-Element Bi-LED Projector + DRL Lightbar)
    hl_z = c.GROUND_CLEARANCE + 0.620
    hl_y = c.FRONT_BUMPER_Y - 0.120
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        hl_x = sign * 0.920
        # Housing bezel
        hl_housing = c.create_box(
            f"LIGHT_Headlight_Housing_{side}",
            location=(hl_x, hl_y, hl_z),
            size=(0.420, 0.220, 0.240),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(hl_housing)
        
        # Dual Projector Lenses (Low & High Beam)
        for p_idx, p_x_offset in [(1, -0.080), (2, 0.080)]:
            lens = c.create_cylinder(
                f"LIGHT_Headlight_Projector_Lens_{side}_{p_idx}",
                location=(hl_x + sign * p_x_offset, hl_y + 0.100, hl_z),
                radius=0.065,
                depth=0.080,
                rotation=(math.radians(90), 0, 0),
                vertices=24,
                col_name="04_Bus_Lighting_Optics",
                mat=mat_registry.led_headlight
            )
            created_objects.append(lens)
            
        # Amber Sequential Turn Signal Indicator
        indicator = c.create_box(
            f"LIGHT_Front_Turn_Indicator_{side}",
            location=(hl_x + sign * 0.140, hl_y + 0.090, hl_z + 0.090),
            size=(0.140, 0.040, 0.040),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_amber_marker
        )
        created_objects.append(indicator)

    # 3. Rear Vertical LED Taillight Towers (Multi-Segment Pillar Integration)
    tl_z = c.GROUND_CLEARANCE + 1.250
    tl_y = c.REAR_BUMPER_Y + 0.020
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        tl_x = sign * 1.080
        # Vertical taillight tower bar
        tl_bar = c.create_box(
            f"LIGHT_Rear_Taillight_Tower_{side}",
            location=(tl_x, tl_y, tl_z),
            size=(0.140, 0.050, 1.200),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_taillight
        )
        created_objects.append(tl_bar)
        
        # Upper Center High-Mount Stop Lamp (CHMSL)
        if side == "L":
            chmsl = c.create_box(
                "LIGHT_CHMSL_HighMount_Brake_Lamp",
                location=(0.0, tl_y, c.ROOF_BODY_Z - 0.080),
                size=(0.550, 0.040, 0.060),
                col_name="04_Bus_Lighting_Optics",
                mat=mat_registry.led_taillight
            )
            created_objects.append(chmsl)

    # 4. Roof Clearance & Amber Marker Lights (Perimeter Safety Lighting)
    # Front Roof Amber Markers
    for i, x_pos in enumerate([-1.100, -0.550, 0.0, 0.550, 1.100]):
        marker = c.create_box(
            f"LIGHT_Roof_Clearance_Marker_Front_{i+1:02d}",
            location=(x_pos, c.FRONT_BUMPER_Y - 0.250, c.ROOF_BODY_Z + 0.040),
            size=(0.090, 0.050, 0.040),
            col_name="04_Bus_Lighting_Optics",
            mat=mat_registry.led_amber_marker
        )
        created_objects.append(marker)

    print(f"[BUS_LIGHTING] Created {len(created_objects)} lighting & destination objects.")
    return created_objects
