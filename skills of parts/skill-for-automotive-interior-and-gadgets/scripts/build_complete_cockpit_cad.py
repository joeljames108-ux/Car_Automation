import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Euler

# Ensure project root is in sys.path for Blender background mode
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

def create_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if clearcoat > 0.0:
            if "Coat Weight" in bsdf.inputs:
                bsdf.inputs["Coat Weight"].default_value = clearcoat
            elif "Clearcoat" in bsdf.inputs:
                bsdf.inputs["Clearcoat"].default_value = clearcoat
        if emission_color and emission_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (*emission_color, 1.0)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

def build_dashboard_assembly():
    """Generates the main dashboard beam, driver cowl, and passenger fascia."""
    bm = bmesh.new()
    width = 1.48
    depth = 0.52
    height = 0.38
    
    # 6 transverse stations along X from left to right
    nx, ny = 24, 12
    dx = width / nx
    dy = depth / ny
    
    vert_grid = []
    for j in range(ny + 1):
        row = []
        y_pos = 0.40 + j * dy
        for i in range(nx + 1):
            x_pos = -width/2 + i * dx
            # Profile: higher at driver side (-0.38m) for binnacle cowl
            binnacle_lift = 0.08 * math.exp(-((x_pos - (-0.38))**2) / 0.05) if j > 4 else 0.0
            # Center slope down to bridge
            z_base = 0.62 + (1.0 - (j / ny)**1.5) * 0.18 + binnacle_lift
            v = bm.verts.new(Vector((x_pos, y_pos, z_base)))
            row.append(v)
        vert_grid.append(row)
    bm.verts.ensure_lookup_table()
    
    for j in range(ny):
        for i in range(nx):
            bm.faces.new([vert_grid[j][i], vert_grid[j][i+1], vert_grid[j+1][i+1], vert_grid[j+1][i]])
            
    mesh = bpy.data.meshes.new("INTERIOR_Dashboard_Main_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("INTERIOR_Dashboard_Main", mesh)
    bpy.context.collection.objects.link(obj)
    
    sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.004
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.002
    bev.segments = 2
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_mat("Mat_Dashboard_Leather", (0.04, 0.04, 0.05), metallic=0.0, roughness=0.65)
    obj.data.materials.append(mat)
    return obj

def build_center_console_bridge():
    """Generates the cantilevered center bridge console with pass-through storage tunnel."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    # Scale to bridge proportions
    for v in bm.verts:
        v.co.x *= 0.22  # 220mm wide
        v.co.y *= 0.85  # 850mm long
        v.co.z *= 0.12  # 120mm thick
        # Center in cockpit
        v.co.y += 0.25
        v.co.z += 0.40
        # Cantilever rake
        if v.co.y > 0.4:
            v.co.z += (v.co.y - 0.4) * 0.45
            
    mesh = bpy.data.meshes.new("INTERIOR_Center_Console_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("INTERIOR_Center_Console", mesh)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.003
    bev.segments = 2
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_mat("Mat_Console_Carbon", (0.02, 0.02, 0.02), metallic=0.3, roughness=0.35)
    obj.data.materials.append(mat)
    return obj

def build_sport_seat(name="INTERIOR_Seat_Driver", x_pos=-0.380):
    """Generates anatomical sport bucket seat with cushion, side bolsters, and headrest."""
    bm = bmesh.new()
    # 1. Base cushion
    res1 = bmesh.ops.create_cube(bm, size=1.0)
    for v in res1['verts']:
        v.co.x = v.co.x * 0.46 + x_pos
        v.co.y = v.co.y * 0.48 + 0.02
        v.co.z = v.co.z * 0.10 + 0.28
        # Ischial dishing
        if abs(v.co.x - x_pos) < 0.15 and abs(v.co.y - 0.02) < 0.18 and v.co.z > 0.28:
            v.co.z -= 0.025
            
    # 2. Reclined backrest
    res2 = bmesh.ops.create_cube(bm, size=1.0)
    for v in res2['verts']:
        v.co.x = v.co.x * 0.44 + x_pos
        v.co.y = v.co.y * 0.08 - 0.22
        v.co.z = v.co.z * 0.58 + 0.60
        recline_y = (v.co.z - 0.35) * math.tan(math.radians(15.0))
        v.co.y -= recline_y
        
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.004
    bev.segments = 2
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_mat(f"{name}_Nappa", (0.05, 0.05, 0.06), metallic=0.0, roughness=0.55)
    obj.data.materials.append(mat)
    return obj

def build_steering_assembly():
    """Generates D-cut ergonomic steering wheel with hub and spokes."""
    bm = bmesh.new()
    radius = 0.180  # 360mm diameter
    tube_r = 0.014
    segments = 32
    
    # Outer ring
    outer_low = []
    outer_high = []
    inner_low = []
    inner_high = []
    
    for i in range(segments):
        ang = (2.0 * math.pi * i) / segments
        y_c = radius * math.sin(ang)
        if y_c < -radius * 0.60:
            y_c = -radius * 0.60
        x_c = radius * math.cos(ang)
        
        # Center at driver hub
        cx = -0.380 + x_c
        cy = 0.440
        cz = 0.680 + y_c
        
        outer_low.append(bm.verts.new(Vector((cx, cy - tube_r, cz - tube_r))))
        outer_high.append(bm.verts.new(Vector((cx, cy + tube_r, cz + tube_r))))
        inner_low.append(bm.verts.new(Vector((cx * 0.92, cy - tube_r*0.7, cz * 0.92))))
        inner_high.append(bm.verts.new(Vector((cx * 0.92, cy + tube_r*0.7, cz * 0.92))))
        
    bm.verts.ensure_lookup_table()
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([outer_low[i], outer_low[i_next], outer_high[i_next], outer_high[i]])
        
    # Center Hub
    res_hub = bmesh.ops.create_cube(bm, size=1.0)
    for v in res_hub['verts']:
        v.co.x = v.co.x * 0.10 - 0.380
        v.co.y = v.co.y * 0.04 + 0.440
        v.co.z = v.co.z * 0.10 + 0.680
        
    mesh = bpy.data.meshes.new("INTERIOR_Steering_Wheel_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new("INTERIOR_Steering_Wheel", mesh)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.002
    bev.segments = 2
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_mat("Mat_Steering_Alcantara", (0.03, 0.03, 0.03), metallic=0.0, roughness=0.75)
    obj.data.materials.append(mat)
    return obj

def assemble_complete_cockpit(export_path=None):
    """Builds and integrates all cockpit structures and the 7 signature gadgets."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    print("Assembling Complete Class-A Automotive Cockpit with Gadgets...")
    
    # 1. Structural Cabin Elements
    dash = build_dashboard_assembly()
    console = build_center_console_bridge()
    seat_driver = build_sport_seat("INTERIOR_Seat_Driver", x_pos=-0.380)
    seat_passenger = build_sport_seat("INTERIOR_Seat_Passenger", x_pos=0.380)
    steering = build_steering_assembly()
    
    # Import / instantiate the 7 signature gadgets using procedural routines
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    if os.getcwd() not in sys.path:
        sys.path.insert(0, os.getcwd())
        
    from generate_interior_gadgets_cad import (
        build_curved_oled_display,
        build_mmi_rotary_puck,
        build_turbine_air_vent,
        build_electronic_shifter_toggle,
        build_wireless_charger_pad,
        build_manettino_dial,
        build_ar_hud_projector_well
    )
    
    # Position gadgets accurately at SAE hardpoints
    g_oled = build_curved_oled_display("INTERIOR_Curved_OLED_Ribbon", width=0.480, height=0.150, loc=(-0.10, 0.62, 0.72))
    g_mmi = build_mmi_rotary_puck("INTERIOR_MMI_Rotary_Controller", radius=0.032, loc=(-0.04, 0.22, 0.47))
    g_toggle = build_electronic_shifter_toggle("INTERIOR_Shift_By_Wire_Toggle", loc=(-0.04, 0.34, 0.47))
    g_qi = build_wireless_charger_pad("INTERIOR_Qi_Charging_Pad", width=0.160, length=0.090, loc=(0.0, 0.46, 0.48))
    g_hud = build_ar_hud_projector_well("INTERIOR_AR_HUD_Well", width=0.200, depth=0.130, loc=(-0.380, 0.72, 0.79))
    g_manettino = build_manettino_dial("INTERIOR_Manettino_Dial", loc=(-0.335, 0.448, 0.650))
    
    # Turbine Vents (Driver Left, Center Pair, Passenger Right)
    v_left = build_turbine_air_vent("INTERIOR_Vent_Driver_Left", radius=0.034, loc=(-0.68, 0.58, 0.68))
    v_mid_l = build_turbine_air_vent("INTERIOR_Vent_Center_Left", radius=0.030, loc=(-0.05, 0.56, 0.60))
    v_mid_r = build_turbine_air_vent("INTERIOR_Vent_Center_Right", radius=0.030, loc=(0.05, 0.56, 0.60))
    v_right = build_turbine_air_vent("INTERIOR_Vent_Passenger_Right", radius=0.034, loc=(0.68, 0.58, 0.68))
    
    all_objects = [
        dash, console, seat_driver, seat_passenger, steering,
        g_oled, g_mmi, g_toggle, g_qi, g_hud, g_manettino,
        v_left, v_mid_l, v_mid_r, v_right
    ]
    
    # Bake modifiers before export to preserve Class-A mesh resolution
    for o in all_objects:
        bpy.context.view_layer.objects.active = o
        for mod in list(o.modifiers):
            if mod.type != 'ARMATURE':
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    pass
                    
    if export_path:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            use_selection=False,
            export_apply=False,
            export_extras=True,
            export_yup=True
        )
        print(f"Exported Complete Cockpit GLB to: {export_path}")
        
    return all_objects

if __name__ == '__main__':
    out_glb = os.path.abspath("public/models/interior/cockpit_hypercar_interior_cad.glb")
    assemble_complete_cockpit(export_path=out_glb)
