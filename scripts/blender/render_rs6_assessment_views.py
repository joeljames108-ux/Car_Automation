"""
=============================================================================
RENDER AUDI RS6 SEDAN (C6) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio assessment shots for the 2000s Sedan:
1. Front 3/4 Hero (Singleframe hexagonal grille, 10-LED DRL headlights, 20" Rotor rims)
2. Rear 3/4 (Broad flared Ur-Quattro arches, twin oval RS exhaust tips, LED lightbars)
3. Side Profile (Muscular C-pillar, blistered quattro fenders, aggressive stance)
4. Front Elevation (Singleframe grille with RS 6 badge, lower intercooler intakes)
5. Rear Elevation (Rear trunk lip spoiler, RS diffuser, oval exhausts)
=============================================================================
"""

import bpy
import math
import os
import shutil
from mathutils import Vector, Euler

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"e:\Car_Automation\assets\screenshots\audi_rs6"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Ensure all hitboxes are hidden in render and viewport
for obj in bpy.data.objects:
    if obj.name.startswith("HITBOX_"):
        obj.hide_render = True
        obj.hide_viewport = True

# Remove any existing studio cameras/lights to avoid clutter
for obj in list(bpy.data.objects):
    if "Studio" in obj.name or "Assessment" in obj.name or "Light" in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# 1. World & Lighting
world = bpy.context.scene.world or bpy.data.worlds.new("StudioWorld")
bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.042, 0.048, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Key Light
key_light_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_light_data.energy = 1800
key_light_data.size = 7.0
key_light = bpy.data.objects.new("Assessment_KeyLight", key_light_data)
key_light.location = (5.5, 5.5, 5.2)
key_light.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_light)

# Fill Light
fill_light_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_light_data.energy = 1100
fill_light_data.size = 7.0
fill_light = bpy.data.objects.new("Assessment_FillLight", fill_light_data)
fill_light.location = (-5.5, 4.2, 4.2)
fill_light.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_light)

# Rim Light
rim_light_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_light_data.energy = 5.0
rim_light = bpy.data.objects.new("Assessment_RimLight", rim_light_data)
rim_light.location = (0.0, -7.0, 4.2)
rim_light.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_light)

# Ground Shadow Plane
bpy.ops.mesh.primitive_plane_add(size=35, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.025, 0.027, 0.032, 1.0)
    g_bsdf.inputs["Roughness"].default_value = 0.45
ground_obj.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 50.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Render Settings
scene = bpy.context.scene
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Balanced automotive camera positions for Audi RS6 C6 (Wheelbase 2.846m, Overall length ~4.9m)
angles = [
    ("rs6_front_three_quarter", (5.2, 5.2, 1.65), (0.0, -1.0, 0.68), 50.0),
    ("rs6_rear_three_quarter", (5.2, -6.8, 1.65), (0.0, -1.8, 0.68), 50.0),
    ("rs6_side_profile", (8.0, -1.5, 0.80), (0.0, -1.5, 0.68), 52.0),
    ("rs6_front_elevation", (0.0, 6.2, 0.80), (0.0, 0.5, 0.65), 50.0),
    ("rs6_rear_elevation", (0.0, -7.5, 0.80), (0.0, -2.0, 0.65), 50.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

for name, loc, target, lens in angles:
    cam_obj.location = Vector(loc)
    cam_data.lens = lens
    look_at(cam_obj, target)
    
    out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    shutil.copy2(out_file, os.path.join(SCREENSHOTS_DIR, f"{name}.png"))
    print(f"[RENDERED] {name} -> {out_file} ({os.path.getsize(out_file)} bytes)")

bpy.data.objects.remove(ground_obj, do_unlink=True)
print("[COMPLETE] All 5 Audi RS6 Sedan (C6) validation angles rendered successfully.")
