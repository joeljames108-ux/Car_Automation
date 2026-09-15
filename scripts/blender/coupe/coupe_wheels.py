"""
Bentley Continental GT II Coupe (2011) Wheels, Tires & Carbon-Ceramic Brakes Builder (Blender 5.2 LTS)
Authentic Mulliner 21-inch 5-Twin-Spoke Directional Diamond-Cut Alloy Wheels + 420mm Carbon-Ceramic Brembo Brakes
"""

import bpy
import bmesh
import math
from mathutils import Vector
import coupe_common as c

def create_mulliner_spoke_cluster(name, hub_x, axle_y, hub_z, sign, tire_w, mat_cut, mat_pocket, col_name):
    """
    Creates an authentic Mulliner 21-inch 5-twin-spoke (10 radiating spokes) alloy wheel face in BMesh.
    Spokes radiate outward radially from hub center to rim barrel with machined diamond-cut front faces.
    """
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    c.link_to_collection(obj, col_name)
    
    bm = bmesh.new()
    
    spoke_face_x = hub_x + sign * (tire_w / 2.0 - 0.014)
    spoke_back_x = spoke_face_x - sign * 0.024
    
    r_in = 0.052
    r_out = c.WHEEL_RADIUS - 0.010
    
    # 5 main arms, each splitting into twin spokes
    for arm in range(5):
        arm_angle = (2.0 * math.pi * arm) / 5.0
        
        for twin_idx, d_ang in enumerate([-0.058, 0.058]):
            ang = arm_angle + d_ang
            cos_a = math.cos(ang)
            sin_a = math.sin(ang)
            
            # Tangential perpendicular unit vector in YZ
            tan_y = -sin_a
            tan_z =  cos_a
            
            w_in = 0.011   # half-width at hub
            w_out = 0.016  # half-width at rim
            
            # 4 vertices on front face (diamond-cut)
            # Inner left, Inner right, Outer right, Outer left
            p_in_l_front = Vector((spoke_face_x, axle_y + r_in * cos_a - w_in * tan_y, hub_z + r_in * sin_a - w_in * tan_z))
            p_in_r_front = Vector((spoke_face_x, axle_y + r_in * cos_a + w_in * tan_y, hub_z + r_in * sin_a + w_in * tan_z))
            p_out_r_front = Vector((spoke_face_x, axle_y + r_out * cos_a + w_out * tan_y, hub_z + r_out * sin_a + w_out * tan_z))
            p_out_l_front = Vector((spoke_face_x, axle_y + r_out * cos_a - w_out * tan_y, hub_z + r_out * sin_a - w_out * tan_z))
            
            # 4 vertices on back face (pocket depth)
            p_in_l_back = Vector((spoke_back_x, axle_y + r_in * cos_a - (w_in * 1.1) * tan_y, hub_z + r_in * sin_a - (w_in * 1.1) * tan_z))
            p_in_r_back = Vector((spoke_back_x, axle_y + r_in * cos_a + (w_in * 1.1) * tan_y, hub_z + r_in * sin_a + (w_in * 1.1) * tan_z))
            p_out_r_back = Vector((spoke_back_x, axle_y + r_out * cos_a + (w_out * 1.1) * tan_y, hub_z + r_out * sin_a + (w_out * 1.1) * tan_z))
            p_out_l_back = Vector((spoke_back_x, axle_y + r_out * cos_a - (w_out * 1.1) * tan_y, hub_z + r_out * sin_a - (w_out * 1.1) * tan_z))
            
            v_if_l = bm.verts.new(p_in_l_front)
            v_if_r = bm.verts.new(p_in_r_front)
            v_of_r = bm.verts.new(p_out_r_front)
            v_of_l = bm.verts.new(p_out_l_front)
            
            v_ib_l = bm.verts.new(p_in_l_back)
            v_ib_r = bm.verts.new(p_in_r_back)
            v_ob_r = bm.verts.new(p_out_r_back)
            v_ob_l = bm.verts.new(p_out_l_back)
            
            # Faces:
            # Front face (diamond cut)
            if sign > 0:
                f_front = bm.faces.new((v_if_l, v_if_r, v_of_r, v_of_l))
                f_back  = bm.faces.new((v_ob_l, v_ob_r, v_ib_r, v_ib_l))
                f_side1 = bm.faces.new((v_if_l, v_of_l, v_ob_l, v_ib_l))
                f_side2 = bm.faces.new((v_if_r, v_ib_r, v_ob_r, v_of_r))
                f_tip   = bm.faces.new((v_of_l, v_of_r, v_ob_r, v_ob_l))
                f_base  = bm.faces.new((v_if_l, v_ib_l, v_ib_r, v_if_r))
            else:
                f_front = bm.faces.new((v_of_l, v_of_r, v_if_r, v_if_l))
                f_back  = bm.faces.new((v_ib_l, v_ib_r, v_ob_r, v_ob_l))
                f_side1 = bm.faces.new((v_ib_l, v_ob_l, v_of_l, v_if_l))
                f_side2 = bm.faces.new((v_of_r, v_ob_r, v_ib_r, v_if_r))
                f_tip   = bm.faces.new((v_ob_l, v_ob_r, v_of_r, v_of_l))
                f_base  = bm.faces.new((v_if_r, v_ib_r, v_ib_l, v_if_l))
                
            f_front.material_index = 0
            for f in [f_back, f_side1, f_side2, f_tip, f_base]:
                f.material_index = 1
                
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.data.materials.append(mat_cut)
    obj.data.materials.append(mat_pocket)
    c.apply_finishing(obj, bevel=0.002)
    return obj

def build_coupe_wheels_and_brakes(mat_registry):
    """Constructs 4 authentic 21-inch Mulliner diamond-cut wheels, Continental tires, and Brembo carbon-ceramic brakes."""
    created_objects = []
    
    corners = [
        ("FL",  1.0, c.FRONT_AXLE_Y, c.TRACK_FRONT / 2.0, c.TIRE_WIDTH_F, 0.420),
        ("FR", -1.0, c.FRONT_AXLE_Y, c.TRACK_FRONT / 2.0, c.TIRE_WIDTH_F, 0.420),
        ("RL",  1.0, c.REAR_AXLE_Y,  c.TRACK_REAR / 2.0,  c.TIRE_WIDTH_R, 0.380),
        ("RR", -1.0, c.REAR_AXLE_Y,  c.TRACK_REAR / 2.0,  c.TIRE_WIDTH_R, 0.380),
    ]
    
    for corner, sign, axle_y, half_track, tire_w, rotor_dia in corners:
        hub_x = sign * half_track
        hub_z = c.HUB_Z
        
        # 1. Low-Profile Performance Rubber Tire with Sidewall Curvature
        tire = c.create_tube(
            f"WHEEL_Tire_{corner}",
            location=(hub_x, axle_y, hub_z),
            inner_radius=c.WHEEL_RADIUS,
            outer_radius=c.TIRE_RADIUS,
            depth=tire_w,
            rotation=(0, math.radians(90), 0),
            vertices=40,
            col_name="04_Coupe_Wheels_Tires",
            mat=mat_registry.tire_rubber,
            bevel=0.008
        )
        created_objects.append(tire)
        
        # 2. 21-inch Mulliner Alloy Rim Barrel & Deep Interior
        rim_barrel = c.create_tube(
            f"WHEEL_Rim_Barrel_{corner}",
            location=(hub_x, axle_y, hub_z),
            inner_radius=c.WHEEL_RADIUS - 0.035,
            outer_radius=c.WHEEL_RADIUS,
            depth=tire_w - 0.015,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="04_Coupe_Wheels_Tires",
            mat=mat_registry.alloy_diamond_cut,
            bevel=0.003
        )
        created_objects.append(rim_barrel)
        
        # 3. Outer Stepped Rim Flange (Polished Diamond-Cut Ring)
        rim_flange = c.create_tube(
            f"WHEEL_Rim_Flange_{corner}",
            location=(hub_x + sign * (tire_w/2.0 - 0.008), axle_y, hub_z),
            inner_radius=c.WHEEL_RADIUS - 0.015,
            outer_radius=c.WHEEL_RADIUS + 0.006,
            depth=0.018,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="04_Coupe_Wheels_Tires",
            mat=mat_registry.alloy_diamond_cut,
            bevel=0.002
        )
        created_objects.append(rim_flange)
        
        # 4. Authentic Mulliner 5-Twin-Spoke Radial Alloy Face
        spokes = create_mulliner_spoke_cluster(
            f"WHEEL_Mulliner_Spokes_{corner}",
            hub_x=hub_x,
            axle_y=axle_y,
            hub_z=hub_z,
            sign=sign,
            tire_w=tire_w,
            mat_cut=mat_registry.alloy_diamond_cut,
            mat_pocket=mat_registry.alloy_dark_pocket,
            col_name="04_Coupe_Wheels_Tires"
        )
        created_objects.append(spokes)

        # 5. Center Hub Cap with Self-Leveling Winged Bentley "B" Medallion
        hub_cap = c.create_cylinder(
            f"WHEEL_Center_HubCap_{corner}",
            location=(hub_x + sign * (tire_w/2.0 - 0.004), axle_y, hub_z),
            radius=0.050,
            depth=0.022,
            rotation=(0, math.radians(90), 0),
            vertices=32,
            col_name="04_Coupe_Wheels_Tires",
            mat=mat_registry.matrix_chrome,
            bevel=0.002
        )
        created_objects.append(hub_cap)
        
        # Center "B" Emblem Core Disc
        emblem_core = c.create_cylinder(
            f"WHEEL_Emblem_Core_{corner}",
            location=(hub_x + sign * (tire_w/2.0 + 0.002), axle_y, hub_z),
            radius=0.036,
            depth=0.012,
            rotation=(0, math.radians(90), 0),
            vertices=28,
            col_name="04_Coupe_Wheels_Tires",
            mat=mat_registry.trim_piano_black
        )
        created_objects.append(emblem_core)

        # 6. 5 Chrome Lug Nuts in Circular Array
        spoke_face_x = hub_x + sign * (tire_w/2.0 - 0.010)
        for l_idx in range(5):
            lug_angle = (2.0 * math.pi * l_idx) / 5.0 + math.radians(36)
            lug_y = axle_y + 0.075 * math.cos(lug_angle)
            lug_z = hub_z + 0.075 * math.sin(lug_angle)
            lug = c.create_cylinder(
                f"WHEEL_LugNut_{corner}_{l_idx+1:02d}",
                location=(spoke_face_x, lug_y, lug_z),
                radius=0.012,
                depth=0.020,
                rotation=(0, math.radians(90), 0),
                vertices=16,
                col_name="04_Coupe_Wheels_Tires",
                mat=mat_registry.matrix_chrome
            )
            created_objects.append(lug)

        # 7. Cross-Drilled Carbon-Ceramic Brake Disc Rotor
        rotor_x = hub_x - sign * 0.045
        rotor = c.create_tube(
            f"BRAKE_CarbonCeramic_Rotor_{corner}",
            location=(rotor_x, axle_y, hub_z),
            inner_radius=0.110,
            outer_radius=rotor_dia / 2.0,
            depth=0.038,
            rotation=(0, math.radians(90), 0),
            vertices=36,
            col_name="03_Coupe_Suspension_Brakes",
            mat=mat_registry.carbon_rotor,
            bevel=0.002
        )
        created_objects.append(rotor)
        
        # Center Rotor Hat (Anodized Dark Gray Aluminum)
        rotor_hat = c.create_cylinder(
            f"BRAKE_Rotor_CenterHat_{corner}",
            location=(rotor_x + sign * 0.010, axle_y, hub_z),
            radius=0.114,
            depth=0.042,
            rotation=(0, math.radians(90), 0),
            vertices=28,
            col_name="03_Coupe_Suspension_Brakes",
            mat=mat_registry.alloy_dark_pocket
        )
        created_objects.append(rotor_hat)

        # 8. High-Performance Multi-Piston Red Brembo Brake Caliper
        caliper_offset_y = -0.135 if "F" in corner else 0.125
        caliper_offset_z = 0.055
        caliper = c.create_box(
            f"BRAKE_Brembo_Caliper_{corner}",
            location=(rotor_x + sign * 0.015, axle_y + caliper_offset_y, hub_z + caliper_offset_z),
            size=(0.075, 0.220 if "F" in corner else 0.170, 0.095),
            col_name="03_Coupe_Suspension_Brakes",
            mat=mat_registry.brembo_caliper_red,
            bevel=0.004
        )
        created_objects.append(caliper)

    print(f"[COUPE_WHEELS] Assembled 4 21-inch Mulliner 5-twin-spoke diamond-cut wheels and Brembo brakes ({len(created_objects)} parts).")
    return created_objects
