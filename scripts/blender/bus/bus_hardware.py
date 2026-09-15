"""
Bus Exterior Hardware & Mirrors Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_hardware(mat_registry):
    """Constructs aerodynamic coach touring mirrors, dual pantograph wipers, roof escape hatches, and emblems."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    
    # -------------------------------------------------------------------------
    # 1. HIGH-MOUNTED AERODYNAMIC COACH TOURING MIRRORS (Rabbit-Ear Style)
    # -------------------------------------------------------------------------
    # Mounted near front roof/A-pillar corners at Z=2.45m, extending outward & forward
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        base_x = sign * (bw/2.0 + 0.020)
        base_y = c.FRONT_BUMPER_Y - 0.420
        base_z = 2.450
        
        mirror_head_x = sign * (bw/2.0 + 0.400)
        mirror_head_y = c.FRONT_BUMPER_Y - 0.180
        mirror_head_z = 2.150
        
        # Primary Sweeping Aerodynamic Mounting Arm (Oriented along directional vector)
        arm_v = Vector((mirror_head_x - base_x, mirror_head_y - base_y, mirror_head_z - base_z))
        arm_depth = arm_v.length
        arm_rot = Vector((0, 0, 1)).rotation_difference(arm_v.normalized()).to_euler()
        
        arm = c.create_cylinder(
            f"HARDWARE_Coach_Mirror_Arm_{side}",
            location=((base_x + mirror_head_x)/2.0, (base_y + mirror_head_y)/2.0, (base_z + mirror_head_z)/2.0),
            radius=0.026,
            depth=arm_depth,
            rotation=arm_rot,
            vertices=20,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(arm)

        # Upper Triangular Stabilizer Strut from Roofline (Z=2.75m)
        strut_base_z = 2.750
        strut_base_y = c.FRONT_BUMPER_Y - 0.380
        strut_v = Vector((mirror_head_x - base_x, mirror_head_y - strut_base_y, mirror_head_z - strut_base_z))
        strut_rot = Vector((0, 0, 1)).rotation_difference(strut_v.normalized()).to_euler()
        strut = c.create_cylinder(
            f"HARDWARE_Coach_Mirror_Strut_{side}",
            location=((base_x + mirror_head_x)/2.0, (strut_base_y + mirror_head_y)/2.0, (strut_base_z + mirror_head_z)/2.0),
            radius=0.016,
            depth=strut_v.length,
            rotation=strut_rot,
            vertices=16,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(strut)
        
        # Aerodynamic Mirror Housing Shell (Gloss Body Accent)
        housing = c.create_box(
            f"HARDWARE_Coach_Mirror_Housing_{side}",
            location=(mirror_head_x, mirror_head_y, mirror_head_z),
            size=(0.160, 0.220, 0.540),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_piano_black if hasattr(mat_registry, "trim_piano_black") else mat_registry.body_dark_accent
        )
        created_objects.append(housing)
        
        # Primary Flat Heated Mirror Glass Face
        glass_face = c.create_box(
            f"HARDWARE_Coach_Mirror_Glass_Primary_{side}",
            location=(mirror_head_x, mirror_head_y - 0.105, mirror_head_z + 0.070),
            size=(0.130, 0.015, 0.360),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(glass_face)
        
        # Lower Blind-Spot Wide-Angle Convex Sub-Mirror
        convex_sub = c.create_box(
            f"HARDWARE_Coach_Mirror_Glass_Convex_{side}",
            location=(mirror_head_x, mirror_head_y - 0.108, mirror_head_z - 0.180),
            size=(0.125, 0.015, 0.120),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(convex_sub)

    # -------------------------------------------------------------------------
    # 2. HEAVY-DUTY DUAL PANTOGRAPH WINDSHIELD WIPERS (Parked Horizontal Configuration)
    # -------------------------------------------------------------------------
    # Precisely fitted to the aerodynamic raked & panoramic curved windshield surface
    def get_ws_y(x, z):
        v_fac = max(0.0, min(1.0, (z - 1.180) / 1.820))
        y_rake = c.FRONT_BUMPER_Y - 0.350 - 0.530 * v_fac
        half_w = bw / 2.0 - 0.070
        norm_x = max(-1.0, min(1.0, x / half_w))
        corner_pull_y = -0.160 * (norm_x**2)
        return y_rake + corner_pull_y

    wiper_z = 1.280
    rake_pitch = math.radians(16.2)
    
    wiper_configs = [
        ("Driver", 0.260, 0.620, -1.0),   # Left / Driver side in LHD
        ("Curbside", -0.260, -0.620, 1.0) # Right / Door side
    ]
    
    for w_name, pivot_x, blade_center_x, yaw_sign in wiper_configs:
        pivot_y = get_ws_y(pivot_x, wiper_z - 0.040)
        blade_y = get_ws_y(blade_center_x, wiper_z)
        blade_yaw = yaw_sign * math.radians(7.5)
        
        # Motor pivot hub on cowl
        pivot_hub = c.create_cylinder(
            f"HARDWARE_Wiper_PivotHub_{w_name}",
            location=(pivot_x, pivot_y + 0.025, wiper_z - 0.040),
            radius=0.024,
            depth=0.040,
            rotation=(rake_pitch, 0, 0),
            vertices=16,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(pivot_hub)
        
        # Articulated Pantograph Linkages
        arm_len = abs(blade_center_x - pivot_x)
        arm_mid_x = (pivot_x + blade_center_x) / 2.0
        arm_mid_y = get_ws_y(arm_mid_x, wiper_z) + 0.020
        
        # Primary lower drive arm
        arm_lower = c.create_cylinder(
            f"HARDWARE_Wiper_Arm_Lower_{w_name}",
            location=(arm_mid_x, arm_mid_y, wiper_z - 0.015),
            radius=0.012,
            depth=arm_len + 0.040,
            rotation=(rake_pitch, math.radians(90), blade_yaw),
            vertices=12,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(arm_lower)
        
        # Secondary stabilizing pantograph rod
        arm_upper = c.create_cylinder(
            f"HARDWARE_Wiper_Arm_Upper_{w_name}",
            location=(arm_mid_x, arm_mid_y - 0.005, wiper_z + 0.025),
            radius=0.008,
            depth=arm_len * 0.92,
            rotation=(rake_pitch, math.radians(90), blade_yaw),
            vertices=12,
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(arm_upper)
        
        # Aerodynamic articulated wiper blade
        blade = c.create_box(
            f"HARDWARE_Wiper_Blade_{w_name}",
            location=(blade_center_x, blade_y + 0.022, wiper_z + 0.010),
            size=(0.760, 0.022, 0.030),
            rotation=(rake_pitch, 0, blade_yaw),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(blade)
        
        # Center Articulated Chrome Retainer Clip
        blade_clip = c.create_box(
            f"HARDWARE_Wiper_BladeClip_{w_name}",
            location=(blade_center_x, blade_y + 0.028, wiper_z + 0.010),
            size=(0.048, 0.028, 0.038),
            rotation=(rake_pitch, 0, blade_yaw),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(blade_clip)

    # -------------------------------------------------------------------------
    # 3. ROOF EMERGENCY ESCAPE & VENTILATION HATCHES (Dual Pop-Up Skylights)
    # -------------------------------------------------------------------------
    for h_idx, y_pos in enumerate([3.100, -3.800]):
        escape_hatch = c.create_box(
            f"HARDWARE_Roof_Escape_Hatch_{h_idx+1:02d}",
            location=(0.0, y_pos, c.ROOF_BODY_Z + 0.065),
            size=(0.880, 0.880, 0.075),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.body_white
        )
        created_objects.append(escape_hatch)
        
        # Red Emergency Egress Release Handle
        hatch_handle = c.create_box(
            f"HARDWARE_Roof_Hatch_Handle_{h_idx+1:02d}",
            location=(0.0, y_pos, c.ROOF_BODY_Z + 0.105),
            size=(0.180, 0.080, 0.030),
            col_name="11_Bus_Hardware_Mirrors",
            mat=mat_registry.led_taillight
        )
        created_objects.append(hatch_handle)

    # -------------------------------------------------------------------------
    # 4. CHROME VOLVO 9700 REAR BADGE & EXTERIOR BADGING
    # -------------------------------------------------------------------------
    rear_badge = c.create_box(
        "HARDWARE_Rear_Model_Badge_Volvo9700",
        location=(0.680, c.REAR_BUMPER_Y + 0.025, c.BELTLINE_Z + 0.120),
        size=(0.320, 0.015, 0.050),
        col_name="11_Bus_Hardware_Mirrors",
        mat=mat_registry.mirror_chrome
    )
    created_objects.append(rear_badge)

    print(f"[BUS_HARDWARE] Assembled coach mirrors, wipers, and hardware with {len(created_objects)} items.")
    return created_objects
