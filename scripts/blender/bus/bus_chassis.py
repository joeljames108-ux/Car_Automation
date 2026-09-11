"""
Bus Heavy-Duty Chassis & Electric Drivetrain Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_chassis_and_powertrain(mat_registry):
    """Constructs the heavy-duty steel ladder chassis, battery enclosure, and e-drive units."""
    created_objects = []
    
    # 1. Main Longitudinal Heavy-Duty Frame Rails (Left & Right)
    rail_len = c.OVERALL_LENGTH - 0.800
    rail_w = 0.120
    rail_h = 0.220
    rail_z = c.GROUND_CLEARANCE + 0.120
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        rail_x = sign * 0.580
        rail = c.create_box(
            f"CHASSIS_Frame_Rail_{side}",
            location=(rail_x, 0.0, rail_z),
            size=(rail_w, rail_len, rail_h),
            col_name="06_Bus_Chassis_Frame",
            mat=mat_registry.chassis_steel
        )
        created_objects.append(rail)
        
    # 2. Tubular Structural Crossmembers
    num_cross = 9
    step_y = rail_len / (num_cross - 1)
    for i in range(num_cross):
        y_pos = -rail_len/2.0 + i * step_y
        cross = c.create_box(
            f"CHASSIS_Crossmember_{i+1:02d}",
            location=(0.0, y_pos, rail_z),
            size=(1.280, 0.100, 0.100),
            col_name="06_Bus_Chassis_Frame",
            mat=mat_registry.chassis_steel
        )
        created_objects.append(cross)
        
    # 3. 800V Underfloor Lithium Battery Enclosure Tub (Central Low-Floor Compartment)
    batt_tub = c.create_box(
        "CHASSIS_Battery_Enclosure_Underfloor",
        location=(0.0, 0.200, rail_z - 0.040),
        size=(1.550, 4.400, 0.180),
        col_name="06_Bus_Chassis_Frame",
        mat=mat_registry.battery_aluminum
    )
    created_objects.append(batt_tub)
    
    # High-Voltage Orange Shielded Conduit / Cable Runs
    for sign in [1.0, -1.0]:
        harness = c.create_cylinder(
            f"CHASSIS_HV_Conduit_{'L' if sign > 0 else 'R'}",
            location=(sign * 0.720, 0.0, rail_z - 0.020),
            radius=0.035,
            depth=5.200,
            rotation=(math.radians(90), 0, 0),
            vertices=16,
            col_name="07_Bus_Powertrain_eAxle",
            mat=mat_registry.emotor_orange_harness
        )
        created_objects.append(harness)
        
    # 4. Front Independent Axle Subframe & Air Suspension Bellows
    front_subframe = c.create_box(
        "CHASSIS_Front_Axle_Subframe",
        location=(0.0, c.FRONT_AXLE_Y, rail_z),
        size=(1.850, 0.650, 0.180),
        col_name="06_Bus_Chassis_Frame",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(front_subframe)
    
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        air_bellow = c.create_cylinder(
            f"SUSP_AirBellow_Front_{side}",
            location=(sign * 0.880, c.FRONT_AXLE_Y, c.HUB_Z + 0.120),
            radius=0.140,
            depth=0.280,
            vertices=24,
            col_name="08_Bus_Suspension_AirBags",
            mat=mat_registry.air_suspension_rubber
        )
        created_objects.append(air_bellow)
        
    # 5. Rear Inverted Portal e-Axle & Dual In-Wheel / Central Electric Motor Drive
    rear_subframe = c.create_box(
        "CHASSIS_Rear_Portal_Axle_Cradle",
        location=(0.0, c.REAR_AXLE_Y, rail_z + 0.020),
        size=(1.750, 0.850, 0.220),
        col_name="07_Bus_Powertrain_eAxle",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(rear_subframe)
    
    # Dual Inverter / Traction Motors (450 kW aggregate power)
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        emotor = c.create_cylinder(
            f"POWERTRAIN_eMotor_DriveUnit_{side}",
            location=(sign * 0.620, c.REAR_AXLE_Y, c.HUB_Z),
            radius=0.220,
            depth=0.480,
            rotation=(0, math.radians(90), 0),
            vertices=24,
            col_name="07_Bus_Powertrain_eAxle",
            mat=mat_registry.chassis_steel
        )
        created_objects.append(emotor)
        
        # Dual Rear Air Suspension Bellows (2 bags per side for heavy axle support)
        for offset_y, suffix in [(0.220, "Fwd"), (-0.220, "Aft")]:
            rear_bellow = c.create_cylinder(
                f"SUSP_AirBellow_Rear_{side}_{suffix}",
                location=(sign * 0.780, c.REAR_AXLE_Y + offset_y, c.HUB_Z + 0.160),
                radius=0.130,
                depth=0.320,
                vertices=24,
                col_name="08_Bus_Suspension_AirBags",
                mat=mat_registry.air_suspension_rubber
            )
            created_objects.append(rear_bellow)

    # 6. Low-Floor Passenger Floor Pan Structure (Ground to floor datum Z=0.380m)
    floor_mesh = bpy.data.meshes.new("CHASSIS_LowFloor_Passenger_Deck_Mesh")
    floor_obj = bpy.data.objects.new("CHASSIS_LowFloor_Passenger_Deck", floor_mesh)
    
    bm = bmesh.new()
    # Floor rectangle from front door entrance to rear step
    floor_w = c.OVERALL_WIDTH - 0.220
    floor_l = c.OVERALL_LENGTH - 0.600
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= floor_w
        v.co.y *= floor_l
        v.co.z *= 0.080
    bm.to_mesh(floor_mesh)
    bm.free()
    
    floor_obj.location = (0.0, 0.0, c.FLOOR_Z)
    c.link_to_collection(floor_obj, "06_Bus_Chassis_Frame")
    floor_obj.data.materials.append(mat_registry.chassis_steel)
    c.apply_finishing(floor_obj, bevel=0.003)
    created_objects.append(floor_obj)

    print(f"[BUS_CHASSIS] Created {len(created_objects)} chassis & powertrain objects.")
    return created_objects
