"""
=============================================================================
RENDER MERCEDES-BENZ 300TD W123T ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Mercedes-Benz 300TD W123T:
1. Front 3/4 Hero (Upright chrome grille, 3D star hood ornament, sealed-beam headlamps, Bundt wheels)
2. Rear 3/4 Estate (Wagon roofline, chrome luggage rails, Barényi ribbed taillights, double bumpers)
3. Side Profile (Classic estate proportions, full-length roof rails, 6-window greenhouse, rub strips)
4. Front Elevation (Monumental chrome radiator shell, star emblem, amber turn signals, overriders)
5. Rear Elevation (Upward tailgate, rear wiper, heated backlite, 300TD badges, downward exhaust)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import shutil
import importlib
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_mercedes_benz_300td_w123t_master_cad
importlib.reload(generate_mercedes_benz_300td_w123t_master_cad)
generate_mercedes_benz_300td_w123t_master_cad.generate_mercedes_300td_w123t_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\mercedes_300td_w123t"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.045, 0.048, 0.055, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Highlights along the long station wagon roof and chrome rails)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 900
top_data.shape = 'RECTANGLE'
top_data.size = 2.8
top_data.size_y = 8.0
top_data.color = (0.96, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -1.48, 4.6)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm German Studio Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2000
key_data.size = 6.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.5, 3.2, 3.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Sky Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1100
fill_data.size = 6.5
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.5, 2.2, 3.6)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Wagon D-pillar and tailgate outline)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 6.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -7.5, 3.6)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Ceramic Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=45, location=(0, -1.48, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.018, 0.022, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.40
    g_bsdf.inputs["Roughness"].default_value = 0.07
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 1.0
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 1.0
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
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Angle definitions calibrated for standard axle coordinates (L=4.725m, Y: +0.880m to -3.845m, Center Y = -1.482m)
angles = [
    ("mercedes_300td_front_three_quarter", ( 4.80,  3.20, 1.60), (0.0, -1.00, 0.70), 50.0),
    ("mercedes_300td_rear_three_quarter",  ( 4.80, -6.00, 1.60), (0.0, -1.90, 0.70), 50.0),
    ("mercedes_300td_side_profile",        ( 6.80, -1.48, 0.95), (0.0, -1.48, 0.70), 52.0),
    ("mercedes_300td_front_elevation",     ( 0.00,  5.20, 0.90), (0.0,  0.40, 0.65), 50.0),
    ("mercedes_300td_rear_elevation",      ( 0.00, -7.20, 0.90), (0.0, -2.80, 0.65), 50.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

# Ensure neutral frame 1 and closed flush stance for all articulating body panels
bpy.context.scene.frame_set(1)
for obj_name in ["DOOR_FL", "DOOR_FR", "DOOR_RL", "DOOR_RR", "DOOR_Tailgate", "HOOD_Main"]:
    o = bpy.data.objects.get(obj_name)
    if o:
        o.rotation_euler = Euler((0, 0, 0))

# Ensure semantic interaction hitboxes are completely hidden from camera renders
for obj in bpy.data.objects:
    if obj.name.startswith("HITBOX_"):
        obj.hide_render = True

for name, loc, target, lens in angles:
    cam_obj.location = Vector(loc)
    cam_data.lens = lens
    look_at(cam_obj, target)

    out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    copy_file = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    shutil.copy2(out_file, copy_file)
    print(f"[RENDERED] {name} -> {out_file} & {copy_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Mercedes-Benz 300TD W123T assessment views rendered successfully.")
