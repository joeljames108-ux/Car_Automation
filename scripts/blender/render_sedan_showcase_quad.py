"""
Render 4 high-definition studio showcase views of the newly generated Class-A Sedan GLB.
"""
import bpy
import os
import math
from mathutils import Vector

GLB_PATH = r"e:\Car_Automation\public\models\Car_Sedan_Complete.glb"
OUTPUT_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\c774af4c-ac14-4622-b3f7-1682dd510f06"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
all_corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
min_x = min(c.x for c in all_corners)
max_x = max(c.x for c in all_corners)
min_y = min(c.y for c in all_corners)
max_y = max(c.y for c in all_corners)
min_z = min(c.z for c in all_corners)
max_z = max(c.z for c in all_corners)

cx = (min_x + max_x) / 2
cy = (min_y + max_y) / 2
cz = (min_z + max_z) / 2
max_dim = max(max_x - min_x, max_y - min_y, max_z - min_z)

print(f"Loaded Sedan: {len(meshes)} meshes, bounds: X=[{min_x:.3f}, {max_x:.3f}], Y=[{min_y:.3f}, {max_y:.3f}], Z=[{min_z:.3f}, {max_z:.3f}]")

scene = bpy.context.scene
scene.render.resolution_x = 1000
scene.render.resolution_y = 600

# Studio Lighting
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.04, 0.05, 0.07, 1.0)

# Key Light
key_light = bpy.data.lights.new("KeyLight", type='SUN')
key_light.energy = 4.5
key_obj = bpy.data.objects.new("KeyLight", key_light)
scene.collection.objects.link(key_obj)
key_obj.location = (cx + 5, cy + 5, cz + 8)

# Fill Light
fill_light = bpy.data.lights.new("FillLight", type='SUN')
fill_light.energy = 2.0
fill_obj = bpy.data.objects.new("FillLight", fill_light)
scene.collection.objects.link(fill_obj)
fill_obj.location = (cx - 6, cy - 5, cz + 6)

# Rim Light
rim_light = bpy.data.lights.new("RimLight", type='SUN')
rim_light.energy = 3.0
rim_obj = bpy.data.objects.new("RimLight", rim_light)
scene.collection.objects.link(rim_obj)
rim_obj.location = (cx, cy - 8, cz + 4)

# Camera
cam_data = bpy.data.cameras.new("StudioCam")
cam_obj = bpy.data.objects.new("StudioCam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def point_at(cam, target):
    direction = target - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

target = Vector((cx, cy, cz))

views = [
    ("sedan_render_iso.png", Vector((cx + max_dim * 0.95, cy + max_dim * 1.05, cz + max_dim * 0.45))),
    ("sedan_render_side.png", Vector((cx + max_dim * 1.45, cy, cz + 0.10))),
    ("sedan_render_rear.png", Vector((cx + max_dim * 0.95, cy - max_dim * 1.10, cz + max_dim * 0.42))),
    ("sedan_render_top.png", Vector((cx + 0.1, cy - 0.2, cz + max_dim * 1.55))),
]

for filename, pos in views:
    cam_obj.location = pos
    point_at(cam_obj, target)
    scene.render.filepath = os.path.join(OUTPUT_DIR, filename)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {filename}")

print("All 4 showcase renders complete!")
