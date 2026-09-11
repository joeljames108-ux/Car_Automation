"""
Bus Exterior Hardware & Mirrors Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_hardware(mat_registry):
    """Constructs coach-style aerodynamic rear-view mirrors, wipers, and roof escape hatches."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    
    # 1. High-Mounted Aerodynamic Coach Side Mirrors (Rabbit-Ear Style)
    # Mounted near front A-pillars at Z=2.20m, extending outward for full flank sightlines
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        mirror_base_x = sign * (bw/2.0 + 0.050)
        mirror_head_x = sign * (bw/2.0 + 0.380)
        mirror_y = c.FRONT_BUMPER_Y - 0.400
        mirror_z = 2.150
        
        # Tubular Mounting Arm
        arm = c.create_cylinder(
            f"HARDWARE_Side_Mirror_Arm_{side}",
            location=((mirror_base_x + mirror_head_x)/2.0, mirror_y, mirror_z + 0.120),
            radius=0.024,
            depth=0.420,
            rotation=(0, math.radians(75 if sign > 0 else -75), 0),
            vertices=16,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(arm)
        
        # Mirror Housing Shell
        housing = c.create_box(
            f"HARDWARE_Side_Mirror_Housing_{side}",
            location=(mirror_head_x, mirror_y, mirror_z),
            size=(0.140, 0.180, 0.480),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.body_dark_accent
        )
        created_objects.append(housing)
        
        # Mirror Reflective Optical Glass Face
        glass_face = c.create_box(
            f"HARDWARE_Side_Mirror_Glass_{side}",
            location=(mirror_head_x, mirror_y - 0.085, mirror_z),
            size=(0.110, 0.015, 0.440),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(glass_face)
        
        # Blind-Spot Wide-Angle Convex Sub-Mirror
        convex_sub = c.create_box(
            f"HARDWARE_Side_Mirror_Convex_{side}",
            location=(mirror_head_x, mirror_y - 0.088, mirror_z - 0.160),
            size=(0.105, 0.012, 0.120),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(convex_sub)

    # 2. Heavy-Duty Dual Pantograph Windshield Wipers
    for w_idx, (w_x, w_y, w_z) in enumerate([(-0.450, c.FRONT_BUMPER_Y - 0.080, 1.250), (0.450, c.FRONT_BUMPER_Y - 0.080, 1.250)]):
        wiper_arm = c.create_cylinder(
            f"HARDWARE_Windshield_Wiper_Arm_{w_idx+1:02d}",
            location=(w_x, w_y, w_z),
            radius=0.016,
            depth=1.100,
            rotation=(math.radians(15), 0, math.radians(-35 if w_idx==0 else 35)),
            vertices=12,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(wiper_arm)
        
        wiper_blade = c.create_box(
            f"HARDWARE_Windshield_Wiper_Blade_{w_idx+1:02d}",
            location=(w_x + (0.250 if w_idx==0 else -0.250), w_y + 0.020, w_z + 0.350),
            size=(0.020, 0.020, 0.950),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(wiper_blade)

    # 3. Roof Emergency Escape & Ventilation Hatches (Dual Skylights)
    for h_idx, y_pos in enumerate([2.800, -3.400]):
        escape_hatch = c.create_box(
            f"HARDWARE_Roof_Emergency_Escape_Hatch_{h_idx+1:02d}",
            location=(0.0, y_pos, c.ROOF_BODY_Z + 0.060),
            size=(0.850, 0.850, 0.080),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.body_white
        )
        created_objects.append(escape_hatch)

    # 4. Front & Rear License Plate Mounts & Telematics Dome
    front_plate = c.create_box(
        "HARDWARE_Front_License_Plate_Bracket",
        location=(0.0, c.FRONT_BUMPER_Y + 0.025, c.GROUND_CLEARANCE + 0.280),
        size=(0.520, 0.020, 0.140),
        col_name="11_Bus_Hardware_Mirrors",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(front_plate)
    
    rear_plate = c.create_box(
        "HARDWARE_Rear_License_Plate_Bracket",
        location=(0.0, c.REAR_BUMPER_Y - 0.025, c.GROUND_CLEARANCE + 0.380),
        size=(0.520, 0.020, 0.140),
        col_name="11_Bus_Hardware_Mirrors",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(rear_plate)
    
    telematics_dome = c.create_cylinder(
        "HARDWARE_Roof_GPS_Telematics_Antenna",
        location=(0.0, 4.400, c.ROOF_BODY_Z + 0.080),
        radius=0.120,
        depth=0.100,
        vertices=24,
        col_name="11_Bus_Hardware_Mirrors",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(telematics_dome)

    print(f"[BUS_HARDWARE] Created {len(created_objects)} hardware & mirror objects.")
    return created_objects
