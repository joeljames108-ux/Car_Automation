"""
=============================================================================
Autonomous 5-View Assessment Renderer: Mercedes-Benz G-Class W460 (1980s, V49)
Renders high-resolution 1080p verification images across 5 automotive perspectives:
1. Front 3/4 Hero View (Anthracite Grey, Fender-Top Signals, Star Grille, Stone Guards)
2. Rear 3/4 View (Boxy Silhouette, 32" Spare with Vinyl Cover, Bumper Taillights)
3. Side Profile View (Slab Sides, Continuous Rub Strip, Squared Flares, 16" Wheels)
4. Front Elevation (Central 3-Pointed Star, Round Headlamps, Towing Coupler Pin)
5. Rear Elevation (Single Cargo Barn Door, Full Spare, Step Bumperettes, Pintle)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load Complete Model
glb_path = r"e:\Car_Automation\public\models\vehicles\offroad_4x4\1980s\vehicle.glb"
if not os.path.exists(glb_path):
    glb_path = r"e:\Car_Automation\public\models\Car_Mercedes_G_Class_W460_1980s_Complete.glb"
print("=" * 80)
print(f"LOADING VEHICLE 49: {glb_path}")
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
light_data_key.energy = 2200.0
light_data_key.size = 8.0
light_key = bpy.data.objects.new("Key_Light", light_data_key)
scene.collection.objects.link(light_key)
light_key.location = (4.5, 4.5, 5.0)
light_key.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-35)), 'XYZ')

# Fill Light
light_data_fill = bpy.data.lights.new(name="Fill_Light", type='AREA')
light_data_fill.energy = 1300.0
light_data_fill.size = 9.0
light_fill = bpy.data.objects.new("Fill_Light", light_data_fill)
scene.collection.objects.link(light_fill)
light_fill.location = (-5.0, -4.0, 4.2)
light_fill.rotation_euler = Euler((math.radians(50), math.radians(-25), math.radians(140)), 'XYZ')

# Rim Light
light_data_rim = bpy.data.lights.new(name="Rim_Light", type='AREA')
light_data_rim.energy = 1600.0
light_data_rim.size = 7.0
light_rim = bpy.data.objects.new("Rim_Light", light_data_rim)
scene.collection.objects.link(light_rim)
light_rim.location = (0.0, -6.0, 5.0)
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
        "filename": "g_class_w460_1980s_front_three_quarter.png",
        "cam_pos": (3.8, 4.5, 1.80),
        "target": (0.0, 0.2, 0.95),
        "title": "Front 3/4 Hero View (Anthracite Grey, Fender-Top Signals, Star Grille)"
    },
    {
        "filename": "g_class_w460_1980s_rear_three_quarter.png",
        "cam_pos": (-3.8, -4.5, 1.85),
        "target": (0.0, -0.2, 0.95),
        "title": "Rear 3/4 View (Boxy Silhouette, 32in Spare with Star Cover, Barn Door)"
    },
    {
        "filename": "g_class_w460_1980s_side_profile.png",
        "cam_pos": (5.0, 0.0, 1.05),
        "target": (0.0, 0.0, 1.00),
        "title": "Side Profile View (Slab Sides, Continuous Rub Strip, 16in Wheels)"
    },
    {
        "filename": "g_class_w460_1980s_front_elevation.png",
        "cam_pos": (0.0, 5.0, 1.15),
        "target": (0.0, 0.0, 1.00),
        "title": "Front Elevation (Central 3-Pointed Star, Stone Guards, Coupler Pin)"
    },
    {
        "filename": "g_class_w460_1980s_rear_elevation.png",
        "cam_pos": (0.0, -5.0, 1.15),
        "target": (0.0, 0.0, 1.00),
        "title": "Rear Elevation (Cargo Barn Door, Full Spare, Bumper Taillights)"
    }
]

def look_at(cam, target_pos):
    """Points camera towards target coordinates."""
    cam_pos = cam.location
    direction = Vector(target_pos) - cam_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

print("\n" + "=" * 80)
print("RENDERING 5-VIEW ASSESSMENT SUITE: MERCEDES-BENZ G-CLASS W460 (1980s)")
print("=" * 80)

for idx, vp in enumerate(viewpoints, 1):
    cam_pos = vp["cam_pos"]
    target_pos = vp["target"]
    camera_obj.location = Vector(cam_pos)
    look_at(camera_obj, target_pos)

    out_file = os.path.join(output_dir, vp["filename"])
    scene.render.filepath = out_file

    print(f"[{idx}/5] Rendering {vp['title']} -> {vp['filename']}...")
    bpy.ops.render.render(write_still=True)
    size_kb = os.path.getsize(out_file) / 1024
    print(f"      ✓ Rendered successfully ({size_kb:.1f} KB)")

print("\n" + "=" * 80)
print(f"✓ 5-VIEW ASSESSMENT RENDERS COMPLETED FOR VEHICLE 49 (MERCEDES G-CLASS 1980s)!")
print(f"✓ Output Directory: {output_dir}")
print("=" * 80)
