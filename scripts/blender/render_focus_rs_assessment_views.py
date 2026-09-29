"""
=============================================================================
RENDER FORD FOCUS RS MK3 (2010S HATCHBACK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the Ford Focus RS Mk3:
1. Front 3/4 Hero (Nitrous Blue, trapezoidal RS grille, Bi-Xenon optics, chin splitter)
2. Rear 3/4 (Towering aero roof wing, 4-fin tunnel diffuser, dual 115mm chrome exhausts)
3. Side Profile (19" forged RS wheels, Brembo blue calipers, kinetic beltline)
4. Front Elevation (Trapezoidal upper grille, blue RS badge, intercooler mouth, brake ducts)
5. Rear Elevation (Aerodynamic diffuser, F1 fog lamp, dual exhausts, RS roof wing)
=============================================================================
"""

import bpy
import math
import os
import shutil
import sys
from mathutils import Vector, Euler

# Target output directories
REPO_DIR = r"e:\Car_Automation\assets\screenshots\focus_rs_assessment"
CONV_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\c92892f5-7cac-4196-9d9c-8538b401dfc6"
os.makedirs(REPO_DIR, exist_ok=True)
os.makedirs(CONV_DIR, exist_ok=True)

# Ensure all doors and articulating parts are in resting closed position for assessment
bpy.context.scene.frame_set(1)
for obj in bpy.data.objects:
    if obj.name.startswith("HITBOX_"):
        obj.hide_render = True
    if obj.animation_data:
        if obj.animation_data.nla_tracks:
            for track in obj.animation_data.nla_tracks:
                track.mute = True
        obj.animation_data.action = None
    obj.rotation_euler = (0, 0, 0)
bpy.context.view_layer.update()

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Atmospheric Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.038, 0.040, 0.046, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Rim highlight on roof, hood, and spoiler)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2600
top_data.shape = 'RECTANGLE'
top_data.size = 2.4
top_data.size_y = 6.4
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.5)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Classic Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2400
key_data.size = 6.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.2, 4.8, 3.6)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1400
fill_data.size = 6.0
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.2, 4.0, 3.4)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim/Kicker Light (Rear Quarter Separation)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='AREA')
rim_data.energy = 2000
rim_data.size = 4.5
rim_data.color = (0.85, 0.92, 1.0)
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (-4.6, -4.8, 3.0)
rim_obj.rotation_euler = Euler((math.radians(50), math.radians(20), math.radians(145)), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Studio Ground Floor with subtle dark reflection
bpy.ops.mesh.primitive_plane_add(size=35.0, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Assessment_Floor"
floor_mat = bpy.data.materials.new("Assessment_FloorMat")
floor_mat.use_nodes = True
f_bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
if f_bsdf:
    f_bsdf.inputs["Base Color"].default_value = (0.018, 0.019, 0.022, 1.0)
    f_bsdf.inputs["Roughness"].default_value = 0.28
    f_bsdf.inputs["Metallic"].default_value = 0.35
floor.data.materials.append(floor_mat)

# Configure Render Engine
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

# Camera definitions: (name, eye_pos, target_pos, fov_deg)
center_car = Vector((0.0, 0.0, 0.65))
views = [
    ("focus_rs_front_three_quarter", Vector((5.8, 5.5, 2.00)), center_car + Vector((0, 0.2, 0.0)), 38.0),
    ("focus_rs_rear_three_quarter",  Vector((-5.8, -5.5, 2.00)), center_car + Vector((0, -0.2, 0.0)), 38.0),
    ("focus_rs_side_profile",        Vector((8.4, 0.0, 1.10)),   center_car, 32.0),
    ("focus_rs_front_elevation",     Vector((0.0, 6.2, 1.10)),   center_car + Vector((0, 0.5, 0.0)), 32.0),
    ("focus_rs_rear_elevation",      Vector((0.0, -6.2, 1.10)),  center_car + Vector((0, -0.5, 0.0)), 32.0),
]

cam_data = bpy.data.cameras.new(name="AssessmentCamera")
cam_obj = bpy.data.objects.new("AssessmentCamera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

for view_name, eye, target, fov in views:
    cam_obj.location = eye
    direction = target - eye
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    cam_data.angle = math.radians(fov)
    bpy.context.view_layer.update()

    out_file = os.path.join(REPO_DIR, f"{view_name}.png")
    scene.render.filepath = out_file
    print(f"[ASSESSMENT RENDER] Rendering {view_name} -> {out_file}...")
    bpy.ops.render.render(write_still=True)

    # Mirror to conversation artifact directory for immediate visual inspection
    conv_file = os.path.join(CONV_DIR, f"{view_name}.png")
    shutil.copy2(out_file, conv_file)
    print(f"[ASSESSMENT RENDER] Mirrored to {conv_file}")

print("================================================================================")
print("FORD FOCUS RS MK3 ASSESSMENT VIEWS RENDERED SUCCESSFULLY")
print("================================================================================")
