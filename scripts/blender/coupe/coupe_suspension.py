"""
Bentley Continental GT II Coupe (2011) Suspension Subsystem Builder (Blender 5.2 LTS)
Front Double-Wishbone & Rear Multi-Link Adaptive Air Suspension with CDC Damping
"""

import bpy
import bmesh
import math
from mathutils import Vector
import coupe_common as c

def build_coupe_suspension(mat_registry):
    """
    Constructs Class-A authentic independent front double-wishbone suspension and
    rear multi-link suspension with adaptive air struts, anti-roll bars, and tie rods.
    All parts registered in '03_Coupe_Suspension_Brakes' with prefix 'SUSP_'.
    """
    created_objects = []
    col_name = "03_Coupe_Suspension_Brakes"
    
    mat_aluminum = getattr(mat_registry, "suspension_aluminum", mat_registry.chassis_steel)
    mat_air_spring = getattr(mat_registry, "suspension_air_spring", mat_registry.trim_piano_black)
    mat_chrome = mat_registry.matrix_chrome
    
    # -------------------------------------------------------------------------
    # 1. FRONT INDEPENDENT DOUBLE-WISHBONE SUSPENSION (L & R)
    # -------------------------------------------------------------------------
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        hub_x = sign * (c.TRACK_FRONT / 2.0 - 0.120)
        sub_x = sign * 0.380
        axle_y = c.FRONT_AXLE_Y
        hub_z = c.HUB_Z
        
        # Upper Wishbone (A-Arm) - High mount forged aluminum
        uca = c.create_box(
            f"SUSP_Front_UpperWishbone_{side}",
            location=((hub_x + sub_x) / 2.0, axle_y, hub_z + 0.180),
            size=(abs(hub_x - sub_x), 0.240, 0.024),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.003
        )
        created_objects.append(uca)
        
        # Lower Wishbone (LCA) - Heavy duty cast cradle
        lca = c.create_box(
            f"SUSP_Front_LowerWishbone_{side}",
            location=((hub_x + sub_x * 0.85) / 2.0, axle_y, hub_z - 0.120),
            size=(abs(hub_x - sub_x * 0.85), 0.320, 0.035),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.004
        )
        created_objects.append(lca)
        
        # Steering Knuckle / Upright (Forged Aluminum Spindle)
        knuckle = c.create_box(
            f"SUSP_Front_SteeringKnuckle_{side}",
            location=(hub_x, axle_y, hub_z + 0.030),
            size=(0.045, 0.080, 0.320),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.003
        )
        created_objects.append(knuckle)
        
        # Adaptive Air Spring / CDC Damper Strut (Cylinder Body + Rubber Bellows)
        strut_top_z = hub_z + 0.360
        strut_bot_z = hub_z - 0.080
        strut_x = hub_x - sign * 0.060
        strut = c.create_cylinder(
            f"SUSP_Front_AirStrut_Bellows_{side}",
            location=(strut_x, axle_y + 0.015, (strut_top_z + strut_bot_z) / 2.0),
            radius=0.062,
            depth=abs(strut_top_z - strut_bot_z),
            rotation=(0, 0, 0),
            vertices=24,
            col_name=col_name,
            mat=mat_air_spring
        )
        created_objects.append(strut)
        
        # Upper Air Strut Top Mount (Machined Aluminum Turret Cap)
        strut_cap = c.create_cylinder(
            f"SUSP_Front_Strut_TopMount_{side}",
            location=(strut_x, axle_y + 0.015, strut_top_z + 0.015),
            radius=0.080,
            depth=0.035,
            rotation=(0, 0, 0),
            vertices=24,
            col_name=col_name,
            mat=mat_aluminum
        )
        created_objects.append(strut_cap)
        
        # Steering Tie Rod & Ball Joint
        tie_rod = c.create_cylinder(
            f"SUSP_Front_SteeringTieRod_{side}",
            location=((hub_x + sign * 0.280) / 2.0, axle_y - 0.110, hub_z - 0.020),
            radius=0.014,
            depth=abs(hub_x - sign * 0.280),
            rotation=(0, math.radians(90), 0),
            vertices=16,
            col_name=col_name,
            mat=mat_chrome
        )
        created_objects.append(tie_rod)
        
        # Anti-Roll Drop Link
        drop_link = c.create_cylinder(
            f"SUSP_Front_SwayBar_DropLink_{side}",
            location=(hub_x - sign * 0.050, axle_y + 0.120, hub_z),
            radius=0.012,
            depth=0.180,
            rotation=(0, 0, 0),
            vertices=14,
            col_name=col_name,
            mat=mat_chrome
        )
        created_objects.append(drop_link)

    # Front Transverse Anti-Roll Sway Bar (Torsion Bar across subframe)
    front_sway_bar = c.create_cylinder(
        "SUSP_Front_Transverse_AntiRollBar",
        location=(0.0, c.FRONT_AXLE_Y + 0.120, c.HUB_Z - 0.090),
        radius=0.018,
        depth=c.TRACK_FRONT - 0.350,
        rotation=(0, math.radians(90), 0),
        vertices=24,
        col_name=col_name,
        mat=mat_chrome
    )
    created_objects.append(front_sway_bar)

    # -------------------------------------------------------------------------
    # 2. REAR MULTI-LINK INDEPENDENT SUSPENSION (L & R)
    # -------------------------------------------------------------------------
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        hub_x = sign * (c.TRACK_REAR / 2.0 - 0.120)
        sub_x = sign * 0.360
        axle_y = c.REAR_AXLE_Y
        hub_z = c.HUB_Z
        
        # Upper Camber Link
        upper_link = c.create_box(
            f"SUSP_Rear_UpperCamberLink_{side}",
            location=((hub_x + sub_x) / 2.0, axle_y + 0.040, hub_z + 0.160),
            size=(abs(hub_x - sub_x), 0.070, 0.024),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.003
        )
        created_objects.append(upper_link)
        
        # Lower Track Control Arm
        lower_arm = c.create_box(
            f"SUSP_Rear_LowerTrackArm_{side}",
            location=((hub_x + sub_x * 0.85) / 2.0, axle_y - 0.060, hub_z - 0.110),
            size=(abs(hub_x - sub_x * 0.85), 0.140, 0.032),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.004
        )
        created_objects.append(lower_arm)
        
        # Rear Wheel Hub Carrier / Knuckle
        rear_knuckle = c.create_box(
            f"SUSP_Rear_HubCarrier_{side}",
            location=(hub_x, axle_y, hub_z + 0.020),
            size=(0.050, 0.090, 0.300),
            col_name=col_name,
            mat=mat_aluminum,
            bevel=0.003
        )
        created_objects.append(rear_knuckle)
        
        # Rear Adaptive Air Spring / Damper Unit
        r_strut_top_z = hub_z + 0.340
        r_strut_bot_z = hub_z - 0.080
        r_strut_x = hub_x - sign * 0.070
        rear_strut = c.create_cylinder(
            f"SUSP_Rear_AirStrut_Bellows_{side}",
            location=(r_strut_x, axle_y - 0.020, (r_strut_top_z + r_strut_bot_z) / 2.0),
            radius=0.065,
            depth=abs(r_strut_top_z - r_strut_bot_z),
            rotation=(0, 0, 0),
            vertices=24,
            col_name=col_name,
            mat=mat_air_spring
        )
        created_objects.append(rear_strut)
        
        # Rear Strut Upper Mount
        rear_strut_cap = c.create_cylinder(
            f"SUSP_Rear_Strut_TopMount_{side}",
            location=(r_strut_x, axle_y - 0.020, r_strut_top_z + 0.015),
            radius=0.082,
            depth=0.035,
            rotation=(0, 0, 0),
            vertices=24,
            col_name=col_name,
            mat=mat_aluminum
        )
        created_objects.append(rear_strut_cap)
        
        # Rear Anti-Roll Drop Link
        r_drop_link = c.create_cylinder(
            f"SUSP_Rear_SwayBar_DropLink_{side}",
            location=(hub_x - sign * 0.050, axle_y - 0.130, hub_z),
            radius=0.012,
            depth=0.180,
            rotation=(0, 0, 0),
            vertices=14,
            col_name=col_name,
            mat=mat_chrome
        )
        created_objects.append(r_drop_link)

    # Rear Transverse Anti-Roll Sway Bar
    rear_sway_bar = c.create_cylinder(
        "SUSP_Rear_Transverse_AntiRollBar",
        location=(0.0, c.REAR_AXLE_Y - 0.130, c.HUB_Z - 0.090),
        radius=0.018,
        depth=c.TRACK_REAR - 0.350,
        rotation=(0, math.radians(90), 0),
        vertices=24,
        col_name=col_name,
        mat=mat_chrome
    )
    created_objects.append(rear_sway_bar)

    print(f"[COUPE_SUSPENSION] Constructed Bentley Continental GT II double-wishbone & multi-link suspension ({len(created_objects)} parts).")
    return created_objects
