"""
==============================================================================
CINEMATIC AUTOMOTIVE STUDIO RENDERER (BLENDER 5.x)
==============================================================================
Sets up high-end 3-point softbox studio lighting, dark reflective showroom floor,
and a 55mm camera targeting the 4-door executive sedan.
Renders a 1920x1080 beauty shot to 'exports/sedan_render.png'.
==============================================================================
"""

import bpy
import os
import math

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(PROJECT_DIR, "exports")
os.makedirs(out_dir, exist_ok=True)

# 1. Clean existing scene completely
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)

# 2. Import Car_Sedan_Complete.glb
glb_path = os.path.join(out_dir, "Car_Sedan_Complete.glb")
print(f"[RENDER] Importing {glb_path} for rendering pass...")
bpy.ops.import_scene.gltf(filepath=glb_path)

# 3. Enforce silky smooth curvature shading and subdivision across body panels
for obj in list(bpy.data.objects):
    if obj.type == 'MESH':
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # Clear any faceted custom split normals from glTF import
        if getattr(obj.data, 'has_custom_normals', False):
            try:
                bpy.ops.mesh.customdata_custom_splitnormals_clear()
            except Exception:
                pass
                
        for p in obj.data.polygons:
            p.use_smooth = True

# 4. Fine-tune PBR Material Shading
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        continue
    mat_name = mat.name.lower()
    
    # Tires: Carbon black with low specular
    if "tire" in mat_name or "rubber" in mat_name:
        bsdf.inputs['Base Color'].default_value = (0.012, 0.012, 0.014, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.85
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 0.08
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = 0.08
            
    # Body Paint: Tanzanite Blue with deep clearcoat
    elif "paint" in mat_name and "tanzanite" in mat_name:
        bsdf.inputs['Base Color'].default_value = (0.012, 0.045, 0.15, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.94
        bsdf.inputs['Roughness'].default_value = 0.08
        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = 1.0
            if 'Coat Roughness' in bsdf.inputs:
                bsdf.inputs['Coat Roughness'].default_value = 0.02
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = 1.0
            if 'Clearcoat Roughness' in bsdf.inputs:
                bsdf.inputs['Clearcoat Roughness'].default_value = 0.02
                
    # Matte Black Trims & Mudflaps
    elif "matte" in mat_name or "plastic" in mat_name:
        bsdf.inputs['Base Color'].default_value = (0.020, 0.020, 0.023, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.65
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 0.2
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = 0.2

# 5. Camera Setup (55mm Automotive Focal Length, Front 3/4 Beauty Angle)
cam_target = bpy.data.objects.new("Cam_Target", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.5, 0.65)

cam_data = bpy.data.cameras.new("Studio_Camera")
cam_data.lens = 55
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0

cam_obj = bpy.data.objects.new("Studio_Camera", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (4.4, 4.2, 1.55)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

bpy.context.scene.camera = cam_obj

# 6. Softbox Studio Lighting Rig
def add_area_light(name, location, rotation, energy, size_x, size_y, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.size = size_x
    light_data.size_y = size_y
    light_data.color = color
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.scene.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    return light_obj

# Overhead softbox for silky hood and roof specular streaks
add_area_light("Light_Ceiling_Softbox", (0.5, 0.5, 4.5), (0, 0, 0), energy=2200, size_x=6.0, size_y=3.5, color=(0.98, 0.99, 1.0))

# Front 3/4 Key Light (broad warm-neutral illumination for fascia and front 3/4)
add_area_light("Light_Key_Fascia", (3.8, 3.8, 2.5), (math.radians(-35), math.radians(20), math.radians(-35)), energy=1200, size_x=3.5, size_y=2.0, color=(1.0, 0.98, 0.96))

# Low Wheel Accent Light (softly highlights alloy spokes without washing out tire)
add_area_light("Light_Wheel_Accent", (3.5, 1.2, 0.8), (math.radians(-10), math.radians(35), math.radians(-15)), energy=120, size_x=2.0, size_y=1.5, color=(0.95, 0.97, 1.0))

# Soft Fill Light on passenger side
add_area_light("Light_Passenger_Fill", (-4.2, 2.2, 1.8), (math.radians(-25), math.radians(-35), math.radians(35)), energy=400, size_x=4.0, size_y=2.5, color=(0.90, 0.94, 1.0))

# Rim / Contour Backlight (separates roofline and C-pillar from background)
add_area_light("Light_Rear_Rim", (-1.2, -4.5, 3.2), (math.radians(55), math.radians(-15), 0), energy=1800, size_x=5.0, size_y=1.5, color=(0.95, 0.98, 1.0))

# 7. Premium Dark Showroom Floor & Background
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Studio_Floor"

floor_mat = bpy.data.materials.new("Mat_StudioFloor")
floor_mat.use_nodes = True
bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.012, 0.013, 0.016, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.18
    bsdf.inputs['Metallic'].default_value = 0.20
floor.data.materials.append(floor_mat)

# World background
world = bpy.context.scene.world
if world and world.node_tree:
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.020, 0.022, 0.026, 1.0)
        bg_node.inputs['Strength'].default_value = 0.5

# 8. Render Configuration
scene = bpy.context.scene
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
render_filepath = os.path.join(out_dir, "sedan_render.png")
scene.render.filepath = render_filepath

# Cycles photorealistic pass with CPU denoising
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True

print("[RENDER] Starting beauty render pass with Cycles...")
bpy.ops.render.render(write_still=True)
print(f"[STATUS] Render completed successfully: {render_filepath}")
