import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
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

def build_curved_oled_display(name="GADGET_Curved_OLED_Screen", width=0.360, height=0.145, radius_curve=2.8, loc=(0,0,0)):
    """Generates a driver-oriented curved OLED display with satin aluminum chassis and beveled glass."""
    bm = bmesh.new()
    nx, ny = 32, 12
    dx = width / nx
    dy = height / ny
    
    vert_grid = []
    for j in range(ny + 1):
        row = []
        y_pos = -height/2 + j * dy
        for i in range(nx + 1):
            x_pos = -width/2 + i * dx
            # Cylindrical curvature arc
            z_curve = - (x_pos ** 2) / (2.0 * radius_curve)
            v = bm.verts.new(Vector((x_pos, y_pos, z_curve)))
            row.append(v)
        vert_grid.append(row)
    bm.verts.ensure_lookup_table()
    
    for j in range(ny):
        for i in range(nx):
            v00 = vert_grid[j][i]
            v10 = vert_grid[j][i+1]
            v11 = vert_grid[j+1][i+1]
            v01 = vert_grid[j+1][i]
            f = bm.faces.new([v00, v10, v11, v01])
            f.smooth = True
            
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    # Modifiers: Solidify + Bevel + Weighted Normal
    sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.003
    sol.offset = -1.0
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.0012
    bev.segments = 2
    
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat_screen = create_pbr_material(f"{name}_Screen_Mat", (0.008, 0.010, 0.012), metallic=0.0, roughness=0.05, clearcoat=1.0)
    obj.data.materials.append(mat_screen)
    return obj

def build_mmi_rotary_puck(name="GADGET_MMI_Rotary_Dial", radius=0.032, height=0.018, knurl_count=36, loc=(0,0,0)):
    """Generates an executive knurled aluminum MMI rotary controller with crystal top."""
    bm = bmesh.new()
    verts_low = []
    verts_high = []
    n = knurl_count * 2
    for i in range(n):
        ang = (2.0 * math.pi * i) / n
        r = radius if (i % 2 == 0) else (radius - 0.0014)
        x = r * math.cos(ang)
        y = r * math.sin(ang)
        verts_low.append(bm.verts.new(Vector((x, y, 0.0))))
        verts_high.append(bm.verts.new(Vector((x, y, height))))
    bm.verts.ensure_lookup_table()
    
    for i in range(n):
        i_next = (i + 1) % n
        bm.faces.new([verts_low[i], verts_low[i_next], verts_high[i_next], verts_high[i]])
        
    center_top = bm.verts.new(Vector((0.0, 0.0, height - 0.0015)))
    for i in range(n):
        i_next = (i + 1) % n
        bm.faces.new([verts_high[i], verts_high[i_next], center_top])
        
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.0006
    bev.segments = 2
    
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_material(f"{name}_Metal", (0.85, 0.86, 0.88), metallic=0.95, roughness=0.20)
    obj.data.materials.append(mat)
    return obj

def build_turbine_air_vent(name="GADGET_Turbine_AC_Vent", radius=0.035, depth=0.025, blade_count=8, loc=(0,0,0)):
    """Generates a luxury circular turbine AC air vent with radiating aerofoil vanes and center display."""
    bm = bmesh.new()
    segments = 48
    
    # Outer bezel cylinder
    outer_low = [bm.verts.new(Vector((radius*math.cos(2*math.pi*i/segments), radius*math.sin(2*math.pi*i/segments), 0.0))) for i in range(segments)]
    outer_high = [bm.verts.new(Vector((radius*math.cos(2*math.pi*i/segments), radius*math.sin(2*math.pi*i/segments), depth))) for i in range(segments)]
    inner_r = radius * 0.86
    inner_high = [bm.verts.new(Vector((inner_r*math.cos(2*math.pi*i/segments), inner_r*math.sin(2*math.pi*i/segments), depth - 0.003))) for i in range(segments)]
    
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([outer_low[i], outer_low[i_next], outer_high[i_next], outer_high[i]])
        bm.faces.new([outer_high[i], outer_high[i_next], inner_high[i_next], inner_high[i]])
        
    # Central hub
    hub_r = radius * 0.32
    hub_verts = [bm.verts.new(Vector((hub_r*math.cos(2*math.pi*i/24), hub_r*math.sin(2*math.pi*i/24), depth - 0.001))) for i in range(24)]
    hub_center = bm.verts.new(Vector((0.0, 0.0, depth)))
    for i in range(24):
        i_next = (i + 1) % 24
        bm.faces.new([hub_verts[i], hub_verts[i_next], hub_center])
        
    # Turbine helical blades
    for b in range(blade_count):
        ang_root = (2.0 * math.pi * b) / blade_count
        ang_tip = ang_root + math.radians(22.0)
        v0 = bm.verts.new(Vector((hub_r * math.cos(ang_root), hub_r * math.sin(ang_root), depth - 0.008)))
        v1 = bm.verts.new(Vector((hub_r * math.cos(ang_root), hub_r * math.sin(ang_root), depth - 0.002)))
        v2 = bm.verts.new(Vector((inner_r * math.cos(ang_tip), inner_r * math.sin(ang_tip), depth - 0.004)))
        v3 = bm.verts.new(Vector((inner_r * math.cos(ang_tip), inner_r * math.sin(ang_tip), depth - 0.010)))
        bm.faces.new([v0, v1, v2, v3])
        
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    mat = create_pbr_material(f"{name}_Chrome", (0.90, 0.90, 0.92), metallic=1.0, roughness=0.12)
    obj.data.materials.append(mat)
    return obj

def build_electronic_shifter_toggle(name="GADGET_Shift_By_Wire_Toggle", loc=(0,0,0)):
    """Generates an aerodynamic shift-by-wire monostable rocker toggle."""
    bm = bmesh.new()
    w, l, h = 0.024, 0.042, 0.026
    
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w
        v.co.y *= l
        v.co.z *= h
        v.co.z += h * 0.5
        # Front concave thumb contour
        if v.co.y < 0 and v.co.z > (h * 0.4):
            v.co.y += 0.006
            
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.0018
    bev.segments = 3
    
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    
    mat = create_pbr_material(f"{name}_Titanium", (0.28, 0.29, 0.31), metallic=0.90, roughness=0.28)
    obj.data.materials.append(mat)
    return obj

def build_wireless_charger_pad(name="GADGET_Wireless_Qi_Charger", width=0.180, length=0.095, loc=(0,0,0)):
    """Generates a fast Qi wireless charging bay with anti-slip chevron ridges."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= width
        v.co.y *= length
        v.co.z *= 0.008
        v.co.z -= 0.004
        
    # Add 4 raised chevrons on floor
    for c_idx in range(4):
        y_c = -length*0.35 + c_idx * (length * 0.22)
        v0 = bm.verts.new(Vector((-width*0.3, y_c, 0.0015)))
        v1 = bm.verts.new(Vector((0.0, y_c + 0.008, 0.0015)))
        v2 = bm.verts.new(Vector((width*0.3, y_c, 0.0015)))
        v3 = bm.verts.new(Vector((width*0.3, y_c - 0.002, 0.0)))
        v4 = bm.verts.new(Vector((0.0, y_c + 0.006, 0.0)))
        v5 = bm.verts.new(Vector((-width*0.3, y_c - 0.002, 0.0)))
        bm.faces.new([v5, v4, v1, v0])
        bm.faces.new([v4, v3, v2, v1])
        
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.0012
    bev.segments = 2
    
    mat = create_pbr_material(f"{name}_Silicone", (0.10, 0.11, 0.12), metallic=0.0, roughness=0.75)
    obj.data.materials.append(mat)
    return obj

def build_manettino_dial(name="GADGET_Steering_Manettino", radius=0.015, height=0.010, loc=(0,0,0)):
    """Generates a steering-wheel mounted Manettino drive-mode rotary switch with red pointer."""
    bm = bmesh.new()
    segments = 32
    verts_low = []
    verts_high = []
    for i in range(segments):
        ang = (2.0 * math.pi * i) / segments
        x = radius * math.cos(ang)
        y = radius * math.sin(ang)
        verts_low.append(bm.verts.new(Vector((x, y, -height*0.5))))
        verts_high.append(bm.verts.new(Vector((x, y, height*0.5))))
    bm.verts.ensure_lookup_table()
    
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([verts_low[i], verts_low[i_next], verts_high[i_next], verts_high[i]])
        
    c_low = bm.verts.new(Vector((0.0, 0.0, -height*0.5)))
    c_high = bm.verts.new(Vector((0.0, 0.0, height*0.5)))
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([verts_low[i_next], verts_low[i], c_low])
        bm.faces.new([verts_high[i], verts_high[i_next], c_high])
        
    # Add pointer wedge
    p0 = bm.verts.new(Vector((0.0, radius + 0.005, height*0.5)))
    p1 = bm.verts.new(Vector((-0.003, radius*0.8, height*0.5)))
    p2 = bm.verts.new(Vector((0.003, radius*0.8, height*0.5)))
    bm.faces.new([p1, p0, p2])
    
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.0005
    bev.segments = 2
    
    mat = create_pbr_material(f"{name}_Anodized_Red", (0.80, 0.05, 0.05), metallic=0.85, roughness=0.30)
    obj.data.materials.append(mat)
    return obj

def build_ar_hud_projector_well(name="GADGET_AR_HUD_Well", width=0.220, depth=0.140, height=0.065, loc=(0,0,0)):
    """Generates an augmented reality HUD well with tilted combiner cold-mirror glass."""
    bm = bmesh.new()
    # Inverted well
    w_top = width
    w_bot = width * 0.85
    d_top = depth
    d_bot = depth * 0.85
    
    v0 = bm.verts.new(Vector((-w_top/2, -d_top/2, 0.0)))
    v1 = bm.verts.new(Vector((w_top/2, -d_top/2, 0.0)))
    v2 = bm.verts.new(Vector((w_top/2, d_top/2, 0.0)))
    v3 = bm.verts.new(Vector((-w_top/2, d_top/2, 0.0)))
    
    v4 = bm.verts.new(Vector((-w_bot/2, -d_bot/2, -height)))
    v5 = bm.verts.new(Vector((w_bot/2, -d_bot/2, -height)))
    v6 = bm.verts.new(Vector((w_bot/2, d_bot/2, -height)))
    v7 = bm.verts.new(Vector((-w_bot/2, d_bot/2, -height)))
    
    bm.faces.new([v0, v1, v5, v4])
    bm.faces.new([v1, v2, v6, v5])
    bm.faces.new([v2, v3, v7, v6])
    bm.faces.new([v3, v0, v4, v7])
    bm.faces.new([v7, v6, v5, v4])
    
    # Combiner glass plate (tilted 42 deg)
    m0 = bm.verts.new(Vector((-w_bot*0.48, -d_bot*0.3, -height*0.2)))
    m1 = bm.verts.new(Vector((w_bot*0.48, -d_bot*0.3, -height*0.2)))
    m2 = bm.verts.new(Vector((w_bot*0.48, d_bot*0.3, -height*0.8)))
    m3 = bm.verts.new(Vector((-w_bot*0.48, d_bot*0.3, -height*0.8)))
    bm.faces.new([m0, m1, m2, m3])
    
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(loc)
    bpy.context.collection.objects.link(obj)
    
    mat = create_pbr_material(f"{name}_Satin_Black", (0.02, 0.02, 0.03), metallic=0.1, roughness=0.60)
    obj.data.materials.append(mat)
    return obj

def build_all_interior_gadgets_showcase(export_glb_path=None):
    """Assembles all 7 automotive gadgets into a master showcase scene with zero-offset coordinates."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    print("Building Procedural Automotive Interior Gadgets...")
    g1 = build_curved_oled_display(loc=(0.0, 0.0, 0.20))
    g2 = build_mmi_rotary_puck(loc=(-0.18, 0.0, 0.0))
    g3 = build_turbine_air_vent(loc=(0.18, 0.0, 0.02))
    g4 = build_electronic_shifter_toggle(loc=(-0.18, 0.12, 0.0))
    g5 = build_wireless_charger_pad(loc=(0.0, 0.15, -0.01))
    g6 = build_manettino_dial(loc=(0.18, 0.12, 0.01))
    g7 = build_ar_hud_projector_well(loc=(0.0, -0.16, 0.10))
    
    gadgets = [g1, g2, g3, g4, g5, g6, g7]
    print(f"Generated {len(gadgets)} precision automotive interior gadgets.")
    
    # Bake modifiers before export
    for o in gadgets:
        bpy.context.view_layer.objects.active = o
        for mod in list(o.modifiers):
            if mod.type != 'ARMATURE':
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    print(f"Modifier apply: {e}")
                    
    if export_glb_path:
        os.makedirs(os.path.dirname(export_glb_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=export_glb_path,
            export_format='GLB',
            use_selection=False,
            export_apply=False,
            export_extras=True,
            export_yup=True
        )
        print(f"Exported Gadgets Showcase GLB to: {export_glb_path}")
        
    return gadgets

if __name__ == '__main__':
    glb_out = os.path.abspath("public/models/interior/showcase_interior_gadgets.glb")
    build_all_interior_gadgets_showcase(export_glb_path=glb_out)
