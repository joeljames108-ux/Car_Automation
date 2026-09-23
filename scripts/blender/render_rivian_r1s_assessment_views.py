"""
=============================================================================
Autonomous 5-View Assessment Renderer: Rivian R1S (Future, Vehicle 40)
Renders high-resolution 1080p verification images across 5 automotive perspectives:
1. Front 3/4 Hero View (Glacier White, Stadium Headlamps, Full-Width Horizon Lightbar)
2. Rear 3/4 View (Full-Width Red Lightbar, Split Adventure Tailgate, Floating Roof)
3. Side Profile View (22" Sport Bright Alloys, Rivian Yellow Brake Calipers, Black Pillars)
4. Front Elevation (Dual Tow Hooks, Sculpted Aero Fascia, Iconic Stadium Headlights)
5. Rear Elevation (RIVIAN Satin Chrome Lettering, Rear Diffuser Skid Plate, Horizon Lightbar)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load Complete Model
glb_path = r"e:\Car_Automation\public\models\Car_Rivian_R1S_Future_Complete.glb"
print("=" * 80)
print(f"LOADING VEHICLE 40: {glb_path}")
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
light_data_key.energy = 1800.0
light_data_key.size = 7.0
light_key = bpy.data.objects.new("Key_Light", light_data_key)
scene.collection.objects.link(light_key)
light_key.location = (5.0, 5.0, 5.5)
light_key.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-35)), 'XYZ')

# Fill Light
light_data_fill = bpy.data.lights.new(name="Fill_Light", type='AREA')
light_data_fill.energy = 1100.0
light_data_fill.size = 8.0
light_fill = bpy.data.objects.new("Fill_Light", light_data_fill)
scene.collection.objects.link(light_fill)
light_fill.location = (-5.5, -4.5, 4.0)
light_fill.rotation_euler = Euler((math.radians(50), math.radians(-25), math.radians(140)), 'XYZ')

# Rim Light
light_data_rim = bpy.data.lights.new(name="Rim_Light", type='AREA')
light_data_rim.energy = 1400.0
light_data_rim.size = 6.0
light_rim = bpy.data.objects.new("Rim_Light", light_data_rim)
scene.collection.objects.link(light_rim)
light_rim.location = (0.0, -6.5, 5.0)
light_rim.rotation_euler = Euler((math.radians(60), 0, math.radians(180)), 'XYZ')

# Camera Setup
camera_data = bpy.data.cameras.new(name="Assessment_Camera")
camera_data.lens = 52.0
camera_obj = bpy.data.objects.new("Assessment_Camera", camera_data)
scene.collection.objects.link(camera_obj)
scene.camera = camera_obj

output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\fd8f6cef-bcdc-4ccd-be00-38d826129553"
os.makedirs(output_dir, exist_ok=True)

viewpoints = [
    {
        "filename": "rivian_r1s_front_three_quarter.png",
        "cam_pos": (4.6, 5.5, 2.0),
        "target": (0.0, 0.2, 0.85),
        "title": "Front 3/4 Hero View (Glacier White, Stadium Headlamps, Horizon Lightbar)"
    },
    {
        "filename": "rivian_r1s_rear_three_quarter.png",
        "cam_pos": (4.6, -5.5, 2.0),
        "target": (0.0, -0.2, 0.85),
        "title": "Rear 3/4 View (Full-Width Red Lightbar, Split Adventure Tailgate, Floating Roof)"
    },
    {
        "filename": "rivian_r1s_side_profile.png",
        "cam_pos": (7.2, 0.0, 1.20),
        "target": (0.0, 0.0, 0.85),
        "title": "Side Profile View (22\" Sport Bright Alloys, Rivian Yellow Brake Calipers, Black Pillars)"
    },
    {
        "filename": "rivian_r1s_front_elevation.png",
        "cam_pos": (0.0, 6.8, 1.05),
        "target": (0.0, 0.0, 0.85),
        "title": "Front Elevation (Dual Tow Hooks, Sculpted Aero Fascia, Iconic Stadium Headlights)"
    },
    {
        "filename": "rivian_r1s_rear_elevation.png",
        "cam_pos": (0.0, -6.8, 1.10),
        "target": (0.0, 0.0, 0.85),
        "title": "Rear Elevation (RIVIAN Satin Chrome Lettering, Rear Diffuser Skid Plate, Horizon Lightbar)"
    }
]

def look_at(cam, target_pos):
    direction = Vector(target_pos) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

print("\n" + "=" * 80)
print("EXECUTING AUTONOMOUS 5-VIEW ASSESSMENT RENDERS: RIVIAN R1S")
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

print("\n✓ Rivian R1S assessment view renders completed successfully!")
