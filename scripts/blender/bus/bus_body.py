"""
Bus Aerodynamic Monocoque Body Shell & Roof HVAC Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_body_and_roof(mat_registry):
    """Constructs the bus monocoque body shell, roof caps, bumpers, and HVAC units."""
    created_objects = []
    
    # 1. Master Transit Bus Body Monocoque Outer Shell
    # Standard transit proportions: W=2.55m, L=10.80m, H=2.95m
    body_mesh = bpy.data.meshes.new("BODY_Transit_Monocoque_Shell_Mesh")
    body_obj = bpy.data.objects.new("BODY_Transit_Monocoque_Shell", body_mesh)
    
    bm = bmesh.new()
    
    bw = c.OVERALL_WIDTH
    bl = c.OVERALL_LENGTH
    bh = c.ROOF_BODY_Z - c.GROUND_CLEARANCE
    bz_center = c.GROUND_CLEARANCE + bh / 2.0
    
    # Create profile box with beveled roof edges and aerodynamic front curve
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        # Scale to dimensions
        x = v.co.x * bw
        y = v.co.y * bl
        z = v.co.z * bh
        
        # Front aerodynamic tumble & windshield rake (+Y > 3.8m)
        if y > 3.8:
            t = (y - 3.8) / (c.FRONT_BUMPER_Y - 3.8)
            # Taper corners
            x *= (1.0 - 0.08 * t)
            # Rake front cap slightly
            if z > 0:
                y -= 0.25 * t * (z / (bh/2.0))
                
        # Rear aerodynamic taper (-Y < -4.0m)
        if y < -4.0:
            t = (abs(y) - 4.0) / (abs(c.REAR_BUMPER_Y) - 4.0)
            x *= (1.0 - 0.04 * t)
            
        # Roof crown curvature (highest at center Z)
        if z > 0:
            norm_x = abs(x) / (bw / 2.0)
            z += 0.08 * (1.0 - norm_x**2)
            
        v.co.x = x
        v.co.y = y
        v.co.z = z
        
    bm.to_mesh(body_mesh)
    bm.free()
    
    body_obj.location = (0.0, 0.0, bz_center)
    c.link_to_collection(body_obj, "01_Bus_Body_Shell")
    body_obj.data.materials.append(mat_registry.body_cyan)
    c.apply_finishing(body_obj, bevel=0.012)
    created_objects.append(body_obj)
    
    # 2. Lower Body Skirting & Protective Rocker Rub-Rails (Dark Accent)
    skirt_h = 0.420
    skirt_z = c.GROUND_CLEARANCE + skirt_h / 2.0
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        skirt = c.create_box(
            f"BODY_Lower_Rocker_Skirting_{side}",
            location=(sign * (bw/2.0 + 0.015), 0.0, skirt_z),
            size=(0.040, bl - 0.200, skirt_h),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.body_dark_accent
        )
        created_objects.append(skirt)
        
        # Heavy-Duty Rubber Rub-Strip
        rub_strip = c.create_box(
            f"BODY_Side_RubStrip_{side}",
            location=(sign * (bw/2.0 + 0.035), 0.0, c.BELTLINE_Z - 0.080),
            size=(0.030, bl - 0.800, 0.090),
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(rub_strip)

    # 3. Front Aerodynamic Bumper & Lower Fascia (Integrated Fog Lamps & Tow Hooks)
    front_bumper = c.create_box(
        "BODY_Front_Bumper_Fascia",
        location=(0.0, c.FRONT_BUMPER_Y - 0.080, c.GROUND_CLEARANCE + 0.280),
        size=(bw - 0.060, 0.320, 0.480),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_dark_accent
    )
    created_objects.append(front_bumper)
    
    # Front Lower Air Dam & Cooling Intake Grille
    front_grille = c.create_box(
        "BODY_Front_Lower_Radiator_Grille",
        location=(0.0, c.FRONT_BUMPER_Y + 0.020, c.GROUND_CLEARANCE + 0.220),
        size=(1.650, 0.060, 0.240),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(front_grille)

    # 4. Rear Service Bumper & Powertrain Ventilation Louvers
    rear_bumper = c.create_box(
        "BODY_Rear_Bumper_Fascia",
        location=(0.0, c.REAR_BUMPER_Y + 0.080, c.GROUND_CLEARANCE + 0.320),
        size=(bw - 0.060, 0.320, 0.520),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_dark_accent
    )
    created_objects.append(rear_bumper)
    
    rear_cooling_grille = c.create_box(
        "BODY_Rear_Engine_Cooling_Louver",
        location=(0.0, c.REAR_BUMPER_Y - 0.020, c.GROUND_CLEARANCE + 0.880),
        size=(1.850, 0.050, 0.650),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(rear_cooling_grille)

    # 5. Dual Heavy-Duty Roof HVAC Climate Control Pods
    for i, (y_pos, label) in enumerate([(1.200, "Front_Passenger"), (-2.200, "Rear_Cabin")]):
        hvac_pod = c.create_box(
            f"BODY_Roof_HVAC_Unit_{label}",
            location=(0.0, y_pos, c.ROOF_BODY_Z + 0.160),
            size=(2.100, 2.300, 0.320),
            col_name="02_Bus_Roof_Pods_HVAC",
            mat=mat_registry.body_white
        )
        created_objects.append(hvac_pod)
        
        # HVAC Side Aerodynamic Exhaust Vents
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            hvac_vent = c.create_box(
                f"BODY_Roof_HVAC_Vent_{label}_{side}",
                location=(sign * 1.060, y_pos, c.ROOF_BODY_Z + 0.160),
                size=(0.040, 1.800, 0.180),
                col_name="02_Bus_Roof_Pods_HVAC",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(hvac_vent)

    # 6. Roof-Mounted High-Voltage Battery Storage Pack Enclosures (Zero-Emission Fleet)
    roof_batt = c.create_box(
        "BODY_Roof_Battery_Pack_HighVoltage",
        location=(0.0, -0.500, c.ROOF_BODY_Z + 0.150),
        size=(1.950, 1.600, 0.300),
        col_name="02_Bus_Roof_Pods_HVAC",
        mat=mat_registry.battery_aluminum
    )
    created_objects.append(roof_batt)

    # 7. Front Destination Header Fairing Cap (Houses Route Matrix Sign)
    dest_fairing = c.create_box(
        "BODY_Front_Destination_Header_Fairing",
        location=(0.0, c.FRONT_BUMPER_Y - 0.350, c.DESTINATION_SIGN_Z),
        size=(bw - 0.120, 0.650, 0.380),
        col_name="01_Bus_Body_Shell",
        mat=mat_registry.body_cyan
    )
    created_objects.append(dest_fairing)

    # 8. Wheel Arch Flares (Front & Rear Dual Arches)
    # Front Steer Arches
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        f_arch = c.create_cylinder(
            f"BODY_WheelArch_Flare_{side}",
            location=(sign * (bw/2.0 + 0.010), c.FRONT_AXLE_Y, c.HUB_Z),
            radius=c.TIRE_RADIUS + 0.090,
            depth=0.080,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(f_arch)
        
    # Rear Dually Arches (Elongated for dual wheels)
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        r_arch = c.create_cylinder(
            f"BODY_WheelArch_Flare_{side}",
            location=(sign * (bw/2.0 + 0.010), c.REAR_AXLE_Y, c.HUB_Z),
            radius=c.TIRE_RADIUS + 0.090,
            depth=0.120,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="01_Bus_Body_Shell",
            mat=mat_registry.trim_satin_black
        )
        created_objects.append(r_arch)

    print(f"[BUS_BODY] Created {len(created_objects)} body and roof objects.")
    return created_objects
