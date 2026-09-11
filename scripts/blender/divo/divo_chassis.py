"""
Bugatti Divo Carbon Monocoque Chassis & W16 Powertrain Builder (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_chassis_and_powertrain(mat_registry):
    """Constructs the carbon fiber monocoque tub, subframes, 8.0L W16 engine, quad turbos, and pushrod suspension."""
    created_objects = []

    # 1. Structural Carbon Fiber Monocoque Cockpit Tub
    tub_mesh = bpy.data.meshes.new("CHASSIS_Carbon_Monocoque_Tub_Mesh")
    tub_obj = bpy.data.objects.new("CHASSIS_Carbon_Monocoque_Tub", tub_mesh)
    
    bm = bmesh.new()
    tub_w = 1.620
    tub_l = 2.450
    tub_h = 0.780
    tub_z = c.GROUND_CLEARANCE + tub_h / 2.0
    tub_y = 0.150 # Centered around cockpit
    
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        x = v.co.x * tub_w
        y = v.co.y * tub_l
        z = v.co.z * tub_h
        
        # Footwell narrowing towards front (+Y)
        if y > 0.4:
            x *= 0.65
        # Side sills contour
        if z < 0:
            x *= 0.90
            
        v.co.x = x
        v.co.y = y
        v.co.z = z
        
    bm.to_mesh(tub_mesh)
    bm.free()
    
    tub_obj.location = (0.0, tub_y, tub_z)
    c.link_to_collection(tub_obj, "06_Divo_Chassis_Tub_Subframe")
    tub_obj.data.materials.append(mat_registry.carbon_satin)
    c.apply_finishing(tub_obj, bevel=0.004)
    created_objects.append(tub_obj)

    # 2. Front High-Strength Aluminum Crash Structure & Subframe
    front_subframe = c.create_box(
        "CHASSIS_Front_Aluminum_Subframe",
        location=(0.0, c.FRONT_AXLE_Y + 0.180, c.GROUND_CLEARANCE + 0.180),
        size=(1.250, 0.750, 0.280),
        col_name="06_Divo_Chassis_Tub_Subframe",
        mat=mat_registry.w16_engine_block
    )
    created_objects.append(front_subframe)

    # 3. Rear Tubular Spaceframe Cradle (Houses 8.0L W16 Engine & 7-Speed DCT)
    rear_cradle = c.create_box(
        "CHASSIS_Rear_Powertrain_Cradle",
        location=(0.0, c.REAR_AXLE_Y - 0.120, c.GROUND_CLEARANCE + 0.240),
        size=(1.420, 1.450, 0.380),
        col_name="06_Divo_Chassis_Tub_Subframe",
        mat=mat_registry.carbon_satin
    )
    created_objects.append(rear_cradle)

    # 4. Iconic 8.0-Liter Quad-Turbocharged W16 Engine Assembly
    # Mid-mounted between cockpit and rear axle (Y=-0.65m)
    w16_block = c.create_box(
        "POWERTRAIN_8L_W16_Engine_Block",
        location=(0.0, -0.680, c.GROUND_CLEARANCE + 0.380),
        size=(0.780, 0.980, 0.480),
        col_name="07_Divo_Powertrain_W16_QuadTurbo",
        mat=mat_registry.w16_engine_block
    )
    created_objects.append(w16_block)

    # Twin Carbon Fiber W16 Valve Covers with "1500" Emblems
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        valve_cover = c.create_box(
            f"POWERTRAIN_W16_Carbon_Valve_Cover_{side}",
            location=(sign * 0.240, -0.680, c.GROUND_CLEARANCE + 0.640),
            size=(0.280, 0.880, 0.120),
            col_name="07_Divo_Powertrain_W16_QuadTurbo",
            mat=mat_registry.w16_carbon_covers
        )
        created_objects.append(valve_cover)

    # Quad Turbochargers (2 per side)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        for t_idx, y_off in enumerate([0.220, -0.220]):
            turbo = c.create_cylinder(
                f"POWERTRAIN_QuadTurbo_{side}_{t_idx+1}",
                location=(sign * 0.460, -0.680 + y_off, c.GROUND_CLEARANCE + 0.420),
                radius=0.110,
                depth=0.180,
                rotation=(0, math.radians(90), 0),
                vertices=24,
                col_name="07_Divo_Powertrain_W16_QuadTurbo",
                mat=mat_registry.turbo_compressor
            )
            created_objects.append(turbo)

    # Dual High-Capacity Aluminum Charge Air Intercoolers
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        ic = c.create_box(
            f"POWERTRAIN_Charge_Air_Intercooler_{side}",
            location=(sign * 0.680, -1.050, c.GROUND_CLEARANCE + 0.480),
            size=(0.260, 0.480, 0.380),
            col_name="07_Divo_Powertrain_W16_QuadTurbo",
            mat=mat_registry.w16_engine_block
        )
        created_objects.append(ic)

    # 5. Centered 3D-Printed Titanium Quad Exhaust Outlets
    # 4 distinct horizontal exhaust pipes integrated in rear carbon diffuser
    for e_idx, x_off in enumerate([-0.180, -0.060, 0.060, 0.180]):
        pipe = c.create_cylinder(
            f"POWERTRAIN_Titanium_Exhaust_Tip_{e_idx+1}",
            location=(x_off, c.REAR_BUMPER_Y + 0.050, c.GROUND_CLEARANCE + 0.280),
            radius=0.052,
            depth=0.320,
            rotation=(math.radians(90), 0, 0),
            vertices=24,
            col_name="07_Divo_Powertrain_W16_QuadTurbo",
            mat=mat_registry.titanium_exhaust
        )
        created_objects.append(pipe)

    # 6. Pushrod Inboard Suspension with Active Magnetorheological Dampers
    # Front Inboard Dampers
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        damper = c.create_cylinder(
            f"SUSP_Front_Pushrod_Damper_{side}",
            location=(sign * 0.320, c.FRONT_AXLE_Y, c.GROUND_CLEARANCE + 0.420),
            radius=0.035,
            depth=0.380,
            rotation=(math.radians(45), 0, math.radians(35 if sign > 0 else -35)),
            vertices=16,
            col_name="08_Divo_Pushrod_Suspension",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(damper)

    # Rear Inboard Dampers
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        r_damper = c.create_cylinder(
            f"SUSP_Rear_Pushrod_Damper_{side}",
            location=(sign * 0.350, c.REAR_AXLE_Y, c.GROUND_CLEARANCE + 0.460),
            radius=0.038,
            depth=0.420,
            rotation=(math.radians(40), 0, math.radians(30 if sign > 0 else -30)),
            vertices=16,
            col_name="08_Divo_Pushrod_Suspension",
            mat=mat_registry.divo_racing_blue
        )
        created_objects.append(r_damper)

    print(f"[DIVO_CHASSIS] Created {len(created_objects)} chassis, powertrain & suspension objects.")
    return created_objects
