"""
Bus Bi-Fold Passenger Doors & Accessibility System Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_doors(mat_registry):
    """Constructs front boarding door, center accessibility door with ADA ramp housing."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    # Curbside is Right (+X = LHD driver, -X = Curbside / Boarding in RHT markets)
    curb_sign = -1.0 # Right flank
    
    # 1. Forward Passenger Boarding Bi-Fold Door (Near Front Axle, Y=4.40m)
    door_w = 1.150
    door_h = 2.450
    door_z = c.FLOOR_Z + door_h / 2.0
    door_leaf_w = (door_w - 0.040) / 2.0
    
    for leaf_idx, offset_y in [(1, door_leaf_w/2.0), (2, -door_leaf_w/2.0)]:
        leaf_y = 4.350 + offset_y
        door_leaf = c.create_box(
            f"DOOR_Front_BiFold_Leaf_{leaf_idx}",
            location=(curb_sign * (bw/2.0 + 0.022), leaf_y, door_z),
            size=(0.045, door_leaf_w, door_h),
            col_name="05_Bus_Doors_Access",
            mat=mat_registry.body_cyan
        )
        created_objects.append(door_leaf)
        
        # Dual Full-Height Glass Panels per Leaf
        for pane_idx, pane_z_offset in [(1, 0.450), (2, -0.450)]:
            glass_pane = c.create_box(
                f"DOOR_Front_Glass_Pane_Leaf_{leaf_idx}_{pane_idx}",
                location=(curb_sign * (bw/2.0 + 0.028), leaf_y, door_z + pane_z_offset),
                size=(0.020, door_leaf_w - 0.080, 0.850),
                col_name="05_Bus_Doors_Access",
                mat=mat_registry.glass_tinted
            )
            created_objects.append(glass_pane)
            
        # Rubber Safety Pinch Edge
        pinch_rubber = c.create_box(
            f"DOOR_Front_Safety_PinchRubber_Leaf_{leaf_idx}",
            location=(curb_sign * (bw/2.0 + 0.030), leaf_y + (door_leaf_w/2.0 if leaf_idx==2 else -door_leaf_w/2.0), door_z),
            size=(0.030, 0.040, door_h),
            col_name="05_Bus_Doors_Access",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(pinch_rubber)

    # 2. Center Passenger Exit Bi-Fold Door (Wheelbase Midpoint, Y=0.20m)
    center_door_y = 0.200
    for leaf_idx, offset_y in [(1, door_leaf_w/2.0), (2, -door_leaf_w/2.0)]:
        leaf_y = center_door_y + offset_y
        c_door_leaf = c.create_box(
            f"DOOR_Center_BiFold_Leaf_{leaf_idx}",
            location=(curb_sign * (bw/2.0 + 0.022), leaf_y, door_z),
            size=(0.045, door_leaf_w, door_h),
            col_name="05_Bus_Doors_Access",
            mat=mat_registry.body_cyan
        )
        created_objects.append(c_door_leaf)
        
        # Glass Panes for Center Door
        for pane_idx, pane_z_offset in [(1, 0.450), (2, -0.450)]:
            c_glass = c.create_box(
                f"DOOR_Center_Glass_Pane_Leaf_{leaf_idx}_{pane_idx}",
                location=(curb_sign * (bw/2.0 + 0.028), leaf_y, door_z + pane_z_offset),
                size=(0.020, door_leaf_w - 0.080, 0.850),
                col_name="05_Bus_Doors_Access",
                mat=mat_registry.glass_tinted
            )
            created_objects.append(c_glass)

    # 3. ADA Wheelchair Electric Telescoping Ramp Enclosure (Under Center Door)
    ada_ramp = c.create_box(
        "DOOR_ADA_Electric_Ramp_Housing",
        location=(curb_sign * (bw/2.0 - 0.050), center_door_y, c.FLOOR_Z - 0.050),
        size=(0.350, 1.250, 0.060),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.chassis_steel
    )
    created_objects.append(ada_ramp)

    # 4. Rear Mechanical & Electrical Service Access Hatches (Flanks & Rear)
    for hatch_idx, (y_pos, h_w, h_h, side, sign) in enumerate([
        (-4.600, 0.950, 0.650, "R", -1.0), # High-voltage charging port door
        (-4.600, 0.950, 0.650, "L", 1.0),  # Pneumatic / coolant service door
    ]):
        hatch = c.create_box(
            f"DOOR_Service_Access_Hatch_{side}_{hatch_idx+1:02d}",
            location=(sign * (bw/2.0 + 0.018), y_pos, c.GROUND_CLEARANCE + 0.550),
            size=(0.030, h_w, h_h),
            col_name="05_Bus_Doors_Access",
            mat=mat_registry.body_cyan
        )
        created_objects.append(hatch)

    print(f"[BUS_DOORS] Created {len(created_objects)} door and access objects.")
    return created_objects
