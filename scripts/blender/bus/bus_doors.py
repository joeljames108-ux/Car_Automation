"""
Bus Passenger Doors & Emergency Egress Access Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_doors(mat_registry):
    """Constructs aerodynamic forward coach plug entrance door and mid-cabin emergency exit door."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    # Curbside / Boarding Door is Right (-X in LHD European/American coach standards)
    curb_sign = -1.0
    
    # -------------------------------------------------------------------------
    # 1. FORWARD PASSENGER ENTRANCE PLUG DOOR (Y = 4.850m)
    # -------------------------------------------------------------------------
    door_w = 0.980
    door_h = 2.150
    door_z = c.GROUND_CLEARANCE + 0.380 + door_h / 2.0 # 1.455m
    door_y = 4.850
    
    # Aerodynamic Coach Door Lower Panel (below window sill)
    lower_door_h = 0.950
    lower_door_z = c.GROUND_CLEARANCE + 0.380 + lower_door_h / 2.0
    front_door_lower = c.create_box(
        "DOOR_Front_Coach_Lower_Panel",
        location=(curb_sign * (bw/2.0 + 0.016), door_y, lower_door_z),
        size=(0.040, door_w, lower_door_h),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.body_cyan if hasattr(mat_registry, "body_cyan") else mat_registry.body_silver
    )
    created_objects.append(front_door_lower)
    
    # Door Upper Perimeter Window Frame (Stiles & Header)
    win_frame_top = c.create_box(
        "DOOR_Front_Coach_Frame_Top",
        location=(curb_sign * (bw/2.0 + 0.016), door_y, door_z + door_h/2.0 - 0.040),
        size=(0.040, door_w, 0.080),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.body_cyan if hasattr(mat_registry, "body_cyan") else mat_registry.body_silver
    )
    created_objects.append(win_frame_top)
    
    for stile_side, stile_sign in [("Fwd", 1.0), ("Aft", -1.0)]:
        stile = c.create_box(
            f"DOOR_Front_Coach_Frame_Stile_{stile_side}",
            location=(curb_sign * (bw/2.0 + 0.016), door_y + stile_sign * (door_w/2.0 - 0.035), door_z + 0.350),
            size=(0.040, 0.070, 1.150),
            col_name="05_Bus_Doors_Access",
            mat=mat_registry.body_cyan if hasattr(mat_registry, "body_cyan") else mat_registry.body_silver
        )
        created_objects.append(stile)
    
    # Panoramic Upper Glass Window in Entrance Door
    door_glass = c.create_box(
        "DOOR_Front_Coach_Window_Pane",
        location=(curb_sign * (bw/2.0 + 0.022), door_y, door_z + 0.350),
        size=(0.020, door_w - 0.140, 1.150),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.glass_tinted
    )
    created_objects.append(door_glass)
    
    # Perimeter Acoustic & Weather Seal Rubber
    seal_rubber = c.create_box(
        "DOOR_Front_Weather_Seal_Rubber",
        location=(curb_sign * (bw/2.0 + 0.018), door_y, door_z),
        size=(0.025, door_w + 0.030, door_h + 0.030),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(seal_rubber)
    
    # Interior Stepwell Boarding Grab Rail (Visible through entrance door glass)
    grab_rail = c.create_cylinder(
        "DOOR_Front_Entrance_GrabRail_Chrome",
        location=(curb_sign * (bw/2.0 - 0.120), door_y - 0.280, door_z - 0.150),
        radius=0.018,
        depth=1.350,
        vertices=16,
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.mirror_chrome
    )
    created_objects.append(grab_rail)

    # -------------------------------------------------------------------------
    # 2. MID-CABIN EMERGENCY PASSENGER DOOR (Y = -0.950m)
    # -------------------------------------------------------------------------
    mid_door_y = -0.950
    mid_door = c.create_box(
        "DOOR_Mid_Emergency_Exit_Leaf",
        location=(curb_sign * (bw/2.0 + 0.016), mid_door_y, door_z),
        size=(0.040, 0.880, door_h),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.body_silver if hasattr(mat_registry, "body_silver") else mat_registry.body_cyan
    )
    created_objects.append(mid_door)
    
    mid_glass = c.create_box(
        "DOOR_Mid_Emergency_Window_Pane",
        location=(curb_sign * (bw/2.0 + 0.022), mid_door_y, door_z + 0.350),
        size=(0.020, 0.720, 1.150),
        col_name="05_Bus_Doors_Access",
        mat=mat_registry.glass_tinted
    )
    created_objects.append(mid_glass)

    print(f"[BUS_DOORS] Assembled coach plug entrance & emergency doors with {len(created_objects)} parts.")
    return created_objects
