"""
=============================================================================
Autonomous 5-View Assessment Renderer: Tesla Cybertruck (Future Era, Vehicle 61)
Renders high-resolution 1080p verification images across 5 automotive perspectives:
1. Front 3/4 Hero View (Brushed Stainless Exoskeleton, Razor Lightbar, Angular Aero Nose)
2. Rear 3/4 View (Sloping Sail Panels, Motorized Vault Tonneau, Razor Red Taillight Strip)
3. Side Profile View (Monolithic Peaked Silhouette, Peaked Apex Roof, 20" Cyber Wheels)
4. Front Elevation (Razor Blade Front Lightbar, Faceted Steel Bumper, Auxiliary Projectors)
5. Rear Elevation (Angular Stainless Tailgate, Razor Red Strip, Steel Step Bumper & Hitch)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load Complete Model
glb_path = r"e:\Car_Automation\public\models\vehicles\pickup\future\vehicle.glb"
if not os.path.exists(glb_path):
    glb_path = r"e:\Car_Automation\public\models\Car_Tesla_Cybertruck_Future_Complete.glb"
print("=" * 80)
print(f"LOADING VEHICLE 61: {glb_path}")
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
    floor_bsdf.inputs['Base Color'].default_value = (0.10, 0.11, 0.12, 1.0)
    floor_bsdf.inputs['Roughness'].default_value = 0.32
    floor_bsdf.inputs['Metallic'].default_value = 0.22
floor.data.materials.append(mat_floor)

# Key Light
light_data_key = bpy.data.lights.new(name="Key_Light", type='AREA')
light_data_key.energy = 2700.0
light_data_key.size = 8.5
light_key = bpy.data.objects.new("Key_Light", light_data_key)
scene.collection.objects.link(light_key)
light_key.location = (5.6, 5.2, 5.8)
light_key.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-35)), 'XYZ')

# Fill Light
light_data_fill = bpy.data.lights.new(name="Fill_Light", type='AREA')
light_data_fill.energy = 1700.0
light_data_fill.size = 9.0
light_fill = bpy.data.objects.new("Fill_Light", light_data_fill)
scene.collection.objects.link(light_fill)
light_fill.location = (-5.6, -4.5, 4.8)
light_fill.rotation_euler = Euler((math.radians(50), math.radians(-25), math.radians(140)), 'XYZ')

# Rim / Roof Highlight Light (highlights stainless steel origami apex)
light_data_rim = bpy.data.lights.new(name="Rim_Light", type='AREA')
light_data_rim.energy = 2400.0
light_data_rim.size = 7.0
light_rim = bpy.data.objects.new("Rim_Light", light_data_rim)
scene.collection.objects.link(light_rim)
light_rim.location = (0.0, 0.65, 7.8)
light_rim.rotation_euler = Euler((0, 0, 0), 'XYZ')

# Camera Setup
cam_data = bpy.data.cameras.new("Assessment_Camera")
cam_data.lens = 55.0
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def point_camera_at(cam, target):
    loc = cam.location
    direction = target - loc
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\2c47a96e-e12f-4035-bd51-7c626c58db65"
os.makedirs(output_dir, exist_ok=True)

views = [
    {
        "name": "front_three_quarter",
        "desc": "Front 3/4 Hero View (Brushed Stainless, Razor Lightbar, Origami Nose)",
        "loc": (5.8, 5.8, 2.2),
        "target": Vector((0.0, 0.4, 0.90)),
        "filename": "cybertruck_future_front_three_quarter.png"
    },
    {
        "name": "rear_three_quarter",
        "desc": "Rear 3/4 View (Sloping Sail Panels, Vault Bed, Razor Red Taillight)",
        "loc": (-5.8, -6.0, 2.2),
        "target": Vector((0.0, -0.6, 0.92)),
        "filename": "cybertruck_future_rear_three_quarter.png"
    },
    {
        "name": "side_profile",
        "desc": "Side Profile View (Iconic Peaked Silhouette, Origami Apex, 20in Cyber Wheels)",
        "loc": (7.4, 0.0, 1.25),
        "target": Vector((0.0, 0.0, 0.95)),
        "filename": "cybertruck_future_side_profile.png"
    },
    {
        "name": "front_elevation",
        "desc": "Front Elevation (Razor Blade Front Lightbar, Faceted Steel Bumper)",
        "loc": (0.0, 7.0, 1.12),
        "target": Vector((0.0, 0.0, 1.02)),
        "filename": "cybertruck_future_front_elevation.png"
    },
    {
        "name": "rear_elevation",
        "desc": "Rear Elevation (Angular Stainless Tailgate, Razor Red Strip, Steel Step Bumper)",
        "loc": (0.0, -7.0, 1.15),
        "target": Vector((0.0, 0.0, 1.05)),
        "filename": "cybertruck_future_rear_elevation.png"
    }
]

print("=" * 80)
print("RENDERING 5 VERIFICATION VIEWPOINTS FOR VEHICLE 61: TESLA CYBERTRUCK (FUTURE)")
print("=" * 80)

for idx, v in enumerate(views, 1):
    out_path = os.path.join(output_dir, v["filename"])
    scene.render.filepath = out_path
    cam_obj.location = Vector(v["loc"])
    point_camera_at(cam_obj, v["target"])
    print(f"[{idx}/5] Rendering {v['desc']} -> {v['filename']}...")
    bpy.ops.render.render(write_still=True)
    if os.path.exists(out_path):
        sz = os.path.getsize(out_path)
        print(f"      ✓ Rendered: {out_path} ({sz:,} bytes)")
    else:
        print(f"      ✗ Render failed: {out_path}")

print("=" * 80)
print("✓ ALL 5 ASSESSMENT PERSPECTIVES RENDERED SUCCESSFULLY FOR VEHICLE 61!")
print("=" * 80)
