"""
Bus Heavy-Duty Wheels, Dually Assemblies & Brakes Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def create_ventilated_commercial_rim(name, location, radius, depth, is_convex=True, sign=1.0, mat_alloy=None, col_name="09_Bus_Wheels_Dually_Brakes"):
    """Creates a forged 22.5 commercial alloy rim with 10 teardrop cooling holes and deep drop center."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    segments = 40
    half_d = depth / 2.0
    dish_offset = 0.045 if is_convex else -0.065
    
    # Outer rim lip and barrel
    outer_verts_front = []
    outer_verts_back = []
    mid_verts_front = []
    hub_verts = []
    
    hub_radius = 0.120
    mid_radius = 0.220
    
    for i in range(segments):
        ang = 2.0 * math.pi * i / segments
        ca = math.cos(ang)
        sa = math.sin(ang)
        
        # Outer rim bead
        v_of = bm.verts.new(Vector((radius * ca, radius * sa, half_d)))
        v_ob = bm.verts.new(Vector((radius * ca, radius * sa, -half_d)))
        outer_verts_front.append(v_of)
        outer_verts_back.append(v_ob)
        
        # Intermediate drop center (dish)
        v_mf = bm.verts.new(Vector((mid_radius * ca, mid_radius * sa, half_d + dish_offset * 0.5)))
        mid_verts_front.append(v_mf)
        
        # Center hub mounting face
        v_h = bm.verts.new(Vector((hub_radius * ca, hub_radius * sa, half_d + dish_offset)))
        hub_verts.append(v_h)
        
    bm.verts.ensure_lookup_table()
    
    # Connect barrel quads
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new((outer_verts_front[i], outer_verts_front[ni], outer_verts_back[ni], outer_verts_back[i]))
        
        # 10 ventilation windows: skip face every 4 segments to form open teardrop vents
        if i % 4 != 0:
            bm.faces.new((mid_verts_front[i], mid_verts_front[ni], outer_verts_front[ni], outer_verts_front[i]))
            
        bm.faces.new((hub_verts[i], hub_verts[ni], mid_verts_front[ni], mid_verts_front[i]))
        
    # Center hub face
    center_v = bm.verts.new(Vector((0.0, 0.0, half_d + dish_offset)))
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new((center_v, hub_verts[i], hub_verts[ni]))
        
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = (0, math.radians(90 if sign > 0 else -90), 0)
    if col_name:
        c.link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat_alloy:
        obj.data.materials.append(mat_alloy)
    c.apply_finishing(obj, bevel=0.003)
    return obj

def build_wheel_station(label, wheel_x, wheel_y, hub_z, is_convex, sign, mat_registry, created_objects, is_dually=False):
    """Assembles tire, 10-hole rim, chrome lug nuts, center hub, brake rotor, and caliper."""
    tire_r = c.TIRE_RADIUS # 0.520m
    rim_r = c.WHEEL_RADIUS  # 0.285m
    tire_w = c.FRONT_TIRE_WIDTH # 0.295m
    
    # 1. Open-bead Hollow Commercial Tire (Rim is visible inside!)
    tire = c.create_tube(
        f"WHEEL_Tire_{label}",
        location=(wheel_x, wheel_y, hub_z),
        inner_radius=rim_r - 0.015,
        outer_radius=tire_r,
        depth=tire_w,
        rotation=(0, math.radians(90), 0),
        vertices=36,
        col_name="09_Bus_Wheels_Dually_Brakes",
        mat=mat_registry.tire_rubber,
        bevel=0.012
    )
    created_objects.append(tire)
    
    # 2. Forged 22.5 Alloy Rim with 10 Teardrop Vents
    rim = create_ventilated_commercial_rim(
        f"WHEEL_Rim_{label}",
        location=(wheel_x, wheel_y, hub_z),
        radius=rim_r,
        depth=tire_w - 0.030,
        is_convex=is_convex,
        sign=sign,
        mat_alloy=mat_registry.alloy_wheel,
        col_name="09_Bus_Wheels_Dually_Brakes"
    )
    created_objects.append(rim)
    
    # 3. Center Grease / Drive Hub Cap
    cap_radius = 0.110 if is_convex else 0.130
    cap_depth = 0.065 if is_convex else 0.120
    dish_z_offset = sign * (tire_w/2.0 + (0.015 if is_convex else -0.040))
    hub_cap = c.create_cylinder(
        f"WHEEL_HubCap_{label}",
        location=(wheel_x + dish_z_offset, wheel_y, hub_z),
        radius=cap_radius,
        depth=cap_depth,
        rotation=(0, math.radians(90), 0),
        vertices=24,
        col_name="09_Bus_Wheels_Dually_Brakes",
        mat=mat_registry.alloy_wheel
    )
    created_objects.append(hub_cap)
    
    # 4. Chrome Lug Nuts (10-Lug Commercial Pattern at R=0.165m)
    lug_r = 0.165
    for lug_i in range(10):
        ang = 2.0 * math.pi * lug_i / 10.0
        lug_y = wheel_y + lug_r * math.sin(ang)
        lug_z = hub_z + lug_r * math.cos(ang)
        lug_x = wheel_x + dish_z_offset + sign * 0.012
        lug = c.create_cylinder(
            f"WHEEL_LugNut_{label}_{lug_i+1:02d}",
            location=(lug_x, lug_y, lug_z),
            radius=0.015,
            depth=0.024,
            rotation=(0, math.radians(90), 0),
            vertices=12,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.mirror_chrome
        )
        created_objects.append(lug)
        
    # 5. Heavy-Duty Ventilated Brake Rotor (Inside rim)
    brake_x = wheel_x - sign * (0.070 if is_convex else 0.120)
    rotor = c.create_cylinder(
        f"BRAKE_Rotor_{label}",
        location=(brake_x, wheel_y, hub_z),
        radius=0.230,
        depth=0.045,
        rotation=(0, math.radians(90), 0),
        vertices=32,
        col_name="09_Bus_Wheels_Dually_Brakes",
        mat=mat_registry.brake_rotor
    )
    created_objects.append(rotor)
    
    # 6. Pneumatic Brake Caliper
    caliper = c.create_box(
        f"BRAKE_Caliper_{label}",
        location=(brake_x, wheel_y + 0.130, hub_z + 0.120),
        size=(0.090, 0.220, 0.150),
        col_name="09_Bus_Wheels_Dually_Brakes",
        mat=mat_registry.brake_caliper
    )
    created_objects.append(caliper)

def build_bus_wheels_and_brakes(mat_registry):
    """Constructs complete Tri-Axle commercial wheel set: Steer, Dually Drive, and Trailing Tag."""
    created_objects = []
    hub_z = c.HUB_Z # 0.520m
    
    # -------------------------------------------------------------------------
    # 1. FRONT STEER AXLE (FL & FR) - Single Convex Wheels
    # -------------------------------------------------------------------------
    for side, sign in [("FL", 1.0), ("FR", -1.0)]:
        wheel_x = sign * (c.FRONT_TRACK / 2.0)
        wheel_y = c.FRONT_AXLE_Y # +4.050m
        build_wheel_station(f"{side}", wheel_x, wheel_y, hub_z, is_convex=True, sign=sign,
                            mat_registry=mat_registry, created_objects=created_objects)
        
    # -------------------------------------------------------------------------
    # 2. REAR DRIVE AXLE (RL & RR) - Dually Dual Wheels (Outer Concave + Inner)
    # -------------------------------------------------------------------------
    for side, sign in [("RL", 1.0), ("RR", -1.0)]:
        center_x = sign * (c.REAR_TRACK / 2.0)
        wheel_y = c.REAR_AXLE_Y # -2.150m
        
        # Outer Dually Wheel (Deep Concave Drop Center)
        outer_x = center_x + sign * (c.DUAL_SPACING / 2.0)
        build_wheel_station(f"{side}_Outer", outer_x, wheel_y, hub_z, is_convex=False, sign=sign,
                            mat_registry=mat_registry, created_objects=created_objects, is_dually=True)
        
        # Inner Dually Wheel (Spaced Inboard)
        inner_x = center_x - sign * (c.DUAL_SPACING / 2.0)
        inner_tire = c.create_tube(
            f"WHEEL_Tire_{side}_Inner",
            location=(inner_x, wheel_y, hub_z),
            inner_radius=c.WHEEL_RADIUS - 0.015,
            outer_radius=c.TIRE_RADIUS,
            depth=c.FRONT_TIRE_WIDTH,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.tire_rubber,
            bevel=0.012
        )
        created_objects.append(inner_tire)
        
        inner_rim = c.create_cylinder(
            f"WHEEL_Rim_{side}_Inner",
            location=(inner_x, wheel_y, hub_z),
            radius=c.WHEEL_RADIUS,
            depth=c.FRONT_TIRE_WIDTH - 0.040,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="09_Bus_Wheels_Dually_Brakes",
            mat=mat_registry.alloy_wheel
        )
        created_objects.append(inner_rim)

    # -------------------------------------------------------------------------
    # 3. REAR TAG AXLE (TL & TR) - Single Convex Wheels (Trailing / Steerable)
    # -------------------------------------------------------------------------
    for side, sign in [("TL", 1.0), ("TR", -1.0)]:
        wheel_x = sign * (c.TAG_TRACK / 2.0)
        wheel_y = c.TAG_AXLE_Y # -3.500m
        build_wheel_station(f"{side}", wheel_x, wheel_y, hub_z, is_convex=True, sign=sign,
                            mat_registry=mat_registry, created_objects=created_objects)

    print(f"[BUS_WHEELS] Assembled complete Volvo 9700 Tri-Axle system with {len(created_objects)} parts.")
    return created_objects
