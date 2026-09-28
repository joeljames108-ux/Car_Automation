"""
=============================================================================
Autonomous 5-View Assessment Renderer: Dodge Challenger SRT Demon 170 (2020s, Vehicle 46)
Renders high-resolution 1080p verification images across 5 automotive perspectives:
1. Front 3/4 Hero View (Destroyer Grey, Air-Grabber Scoop, Air-Catcher Headlamps, Yellow Splitter Protectors)
2. Rear 3/4 View (Rear Widebody Drag Flares, Mickey Thompson ET Drag Radials, Ducktail Spoiler, Black Tips)
3. Side Profile View (Coupe Drag Stance, Staggered 18/17-inch Setup, Demon 170 Yellow-Eyed Fender Badges)
4. Front Elevation (Wide Menacing Stance, Quad Halos with Hollow Air-Catcher, Yellow Splitter Corners)
5. Rear Elevation (Full-Width LED Taillight Loop, Ducktail Drag Spoiler, Dual Black Vapor Chrome Outlets)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load Complete Model
glb_path = r"e:\Car_Automation\public\models\Car_Dodge_Challenger_Demon_2020s_Complete.glb"
print("=" * 80)
print(f"LOADING VEHICLE 46: {glb_path}")
print("=" * 80)
bpy.ops.import_scene.gltf(filepath=glb_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in dir(bpy.types) else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

# Set up studio lighting environment
world = bpy.data.worlds.new("Studio_World")
scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.07, 0.08, 0.09, 1.0)
    bg_node.inputs['Strength'].default_value = 1.2

# Studio Floor
bpy.ops.mesh.primitive_plane_add(size=35.0, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Studio_Ground_Plane"
mat_floor = bpy.data.materials.new("Studio_Floor_Mat")
mat_floor.use_nodes = True
floor_bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
if floor_bsdf:
    floor_bsdf.inputs['Base Color'].default_value = (0.11, 0.12, 0.13, 1.0)
    floor_bsdf.inputs['Roughness'].default_value = 0.35
    floor_bsdf.inputs['Metallic'].default_value = 0.20
floor.data.materials.append(mat_floor)

# Key Light
light_data_key = bpy.data.lights.new(name="Key_Light", type='AREA')
light_data_key.energy = 1900.0
light_data_key.size = 7.5
light_key = bpy.data.objects.new("Key_Light", light_data_key)
scene.collection.objects.link(light_key)
light_key.location = (4.8, 5.0, 4.6)
light_key.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-35)), 'XYZ')

# Fill Light
light_data_fill = bpy.data.lights.new(name="Fill_Light", type='AREA')
light_data_fill.energy = 1150.0
light_data_fill.size = 8.5
light_fill = bpy.data.objects.new("Fill_Light", light_data_fill)
scene.collection.objects.link(light_fill)
light_fill.location = (-5.2, -4.2, 4.0)
light_fill.rotation_euler = Euler((math.radians(50), math.radians(-25), math.radians(140)), 'XYZ')

# Rim Light
light_data_rim = bpy.data.lights.new(name="Rim_Light", type='AREA')
light_data_rim.energy = 1500.0
light_data_rim.size = 6.5
light_rim = bpy.data.objects.new("Rim_Light", light_data_rim)
scene.collection.objects.link(light_rim)
light_rim.location = (0.0, -6.5, 4.8)
light_rim.rotation_euler = Euler((math.radians(60), 0, math.radians(180)), 'XYZ')

# Camera Setup
camera_data = bpy.data.cameras.new(name="Assessment_Camera")
camera_data.lens = 50.0
camera_obj = bpy.data.objects.new("Assessment_Camera", camera_data)
scene.collection.objects.link(camera_obj)
scene.camera = camera_obj

output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\2c47a96e-e12f-4035-bd51-7c626c58db65"
os.makedirs(output_dir, exist_ok=True)

viewpoints = [
    {
        "filename": "challenger_demon_2020s_front_three_quarter.png",
        "cam_pos": (4.6, 5.2, 1.8),
        "target": (0.0, 0.2, 0.70),
        "title": "Front 3/4 Hero View (Destroyer Grey, Air-Grabber Hood, Yellow Splitter Protectors)"
    },
    {
        "filename": "challenger_demon_2020s_rear_three_quarter.png",
        "cam_pos": (-4.5, -5.2, 1.7),
        "target": (0.0, -0.4, 0.70),
        "title": "Rear 3/4 View (Rear Widebody Flares, 315 Drag Radials, Ducktail Spoiler)"
    },
    {
        "filename": "challenger_demon_2020s_side_profile.png",
        "cam_pos": (6.2, 0.0, 1.45),
        "target": (0.0, 0.0, 0.70),
        "title": "Side Profile View (Coupe Drag Silhouette, Staggered 18/17 Setup, Demon 170 Badges)"
    },
    {
        "filename": "challenger_demon_2020s_front_elevation.png",
        "cam_pos": (0.0, 6.2, 1.35),
        "target": (0.0, 1.0, 0.70),
        "title": "Front Elevation (Wide Grille, Hollow Air-Catcher Inlet, Yellow Shipping Guards)"
    },
    {
        "filename": "challenger_demon_2020s_rear_elevation.png",
        "cam_pos": (0.0, -6.2, 1.35),
        "target": (0.0, -1.0, 0.70),
        "title": "Rear Elevation (Full-Width LED Loop, Integrated Ducktail Spoiler, Dual Black Tips)"
    },
]

def point_camera_at(cam, target):
    direction = target - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

for vp in viewpoints:
    camera_obj.location = Vector(vp["cam_pos"])
    point_camera_at(camera_obj, Vector(vp["target"]))
    
    out_path = os.path.join(output_dir, vp["filename"])
    scene.render.filepath = out_path
    
    print(f"Rendering {vp['title']} -> {out_path}...")
    bpy.ops.render.render(write_still=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  ✓ Saved: {vp['filename']} ({size_kb:.1f} KB)")

print("=" * 80)
print("ALL 5 ASSESSMENT VIEWS RENDERED SUCCESSFULLY!")
print("=" * 80)
