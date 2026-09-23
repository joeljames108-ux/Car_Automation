"""
=============================================================================
Autonomous 5-View Assessment Renderer: Range Rover (L405) (2010s)
Renders high-resolution 1080p verification images across 5 automotive perspectives:
1. Front 3/4 Hero View (Fuji White, Atlas Silver Grille, Sweeping LED Angel Wing DRLs)
2. Rear 3/4 View (Floating Santorini Black Roof, Vertical Blade LED Taillamps, Split Tailgate)
3. Side Profile View (21" Diamond-Turned Forged Wheels, Fender Gills, Reductive Silhouette)
4. Front Elevation (Clamshell Bonnet, RANGE ROVER Lettering, Lower Satin Skid Plate)
5. Rear Elevation (Powered Clamshell Tailgate, Integrated Dual Exhausts, Tapered Stern)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load Complete Model
glb_path = r"e:\Car_Automation\public\models\Car_Range_Rover_L405_2010s_Complete.glb"
print("=" * 80)
print(f"LOADING VEHICLE 38: {glb_path}")
print("=" * 80)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Set up studio lighting environment
world = bpy.data.worlds.new("Studio_World")
bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs['Color'].default_value = (0.08, 0.09, 0.10, 1.0)
    bg_node.inputs['Strength'].default_value = 1.2

# Studio Floor
bpy.ops.mesh.primitive_plane_add(size=35.0, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Studio_Ground_Plane"
mat_floor = bpy.data.materials.new("Studio_Floor_Mat")
mat_floor.use_nodes = True
floor_bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
if floor_bsdf:
    floor_bsdf.inputs['Base Color'].default_value = (0.12, 0.13, 0.14, 1.0)
    floor_bsdf.inputs['Roughness'].default_value = 0.35
    floor_bsdf.inputs['Metallic'].default_value = 0.20
floor.data.materials.append(mat_floor)

# Key Light
light_data_key = bpy.data.lights.new(name="Key_Light", type='AREA')
light_data_key.energy = 1600.0
light_data_key.size = 7.0
light_key = bpy.data.objects.new("Key_Light", light_data_key)
bpy.context.scene.collection.objects.link(light_key)
light_key.location = (4.8, 4.8, 5.2)
light_key.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-35)), 'XYZ')

# Fill Light
light_data_fill = bpy.data.lights.new(name="Fill_Light", type='AREA')
light_data_fill.energy = 900.0
light_data_fill.size = 6.0
light_fill = bpy.data.objects.new("Fill_Light", light_data_fill)
bpy.context.scene.collection.objects.link(light_fill)
light_fill.location = (-4.8, -3.8, 4.2)
light_fill.rotation_euler = Euler((math.radians(40), math.radians(-25), math.radians(135)), 'XYZ')

# Rim/Top Light
light_data_rim = bpy.data.lights.new(name="Rim_Light", type='AREA')
light_data_rim.energy = 1200.0
light_data_rim.size = 8.0
light_rim = bpy.data.objects.new("Rim_Light", light_data_rim)
bpy.context.scene.collection.objects.link(light_rim)
light_rim.location = (0.0, 0.0, 7.0)
light_rim.rotation_euler = Euler((0, 0, 0), 'XYZ')

# Camera setup
camera_data = bpy.data.cameras.new(name="Assessment_Camera")
camera_data.lens = 52.0
camera_obj = bpy.data.objects.new("Assessment_Camera", camera_data)
bpy.context.scene.collection.objects.link(camera_obj)
bpy.context.scene.camera = camera_obj

scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\fd8f6cef-bcdc-4ccd-be00-38d826129553"
os.makedirs(output_dir, exist_ok=True)

viewpoints = [
    {
        "filename": "range_rover_l405_front_three_quarter.png",
        "cam_pos": (4.5, 5.2, 1.9),
        "target": (0.0, 0.2, 0.80),
        "title": "Front 3/4 Hero View (Fuji White, Atlas Silver Grille, Sweeping LED Angel Wing DRLs)"
    },
    {
        "filename": "range_rover_l405_rear_three_quarter.png",
        "cam_pos": (4.5, -5.2, 1.9),
        "target": (0.0, -0.2, 0.80),
        "title": "Rear 3/4 View (Floating Santorini Black Roof, Vertical Blade LED Taillamps, Split Tailgate)"
    },
    {
        "filename": "range_rover_l405_side_profile.png",
        "cam_pos": (6.8, 0.0, 1.10),
        "target": (0.0, 0.0, 0.80),
        "title": "Side Profile View (21\" Diamond-Turned Forged Wheels, Fender Gills, Reductive Silhouette)"
    },
    {
        "filename": "range_rover_l405_front_elevation.png",
        "cam_pos": (0.0, 6.6, 1.00),
        "target": (0.0, 0.0, 0.80),
        "title": "Front Elevation (Clamshell Bonnet, RANGE ROVER Lettering, Lower Satin Skid Plate)"
    },
    {
        "filename": "range_rover_l405_rear_elevation.png",
        "cam_pos": (0.0, -6.6, 1.05),
        "target": (0.0, 0.0, 0.80),
        "title": "Rear Elevation (Powered Clamshell Tailgate, Integrated Dual Exhausts, Tapered Stern)"
    }
]

def look_at(cam, target_pos):
    direction = Vector(target_pos) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

print("\n" + "=" * 80)
print("EXECUTING AUTONOMOUS 5-VIEW ASSESSMENT RENDERS: RANGE ROVER (L405)")
print("=" * 80)

for vp in viewpoints:
    cam_pos = vp["cam_pos"]
    target = vp["target"]
    camera_obj.location = Vector(cam_pos)
    look_at(camera_obj, target)

    out_path = os.path.join(output_dir, vp["filename"])
    scene.render.filepath = out_path

    print(f"Rendering: {vp['title']} -> {vp['filename']}")
    bpy.ops.render.render(write_still=True)
    size = os.path.getsize(out_path)
    print(f"  ✓ Rendered: {out_path} ({size:,} bytes)")

print("\n✓ All 5 assessment viewpoints successfully rendered!")
