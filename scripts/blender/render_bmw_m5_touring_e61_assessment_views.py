"""
=============================================================================
RENDER BMW M5 TOURING E61 (2000s WAGON) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated BMW M5 Touring (E61):
1. Front 3/4 Hero (Silverstone II paint, twin kidney grilles, Hawk-Eye Angel Eyes, Style 167 wheels)
2. Rear 3/4 Estate (M roof spoiler, quad 80mm exhaust cannons, rear diffuser, Celis LED taillights)
3. Side Profile (Sleek European high-performance estate stance, flame surfacing, fender gills)
4. Front Elevation (Twin kidneys, M front bumper intakes, swept amber eyebrows, corona rings)
5. Rear Elevation (Quad exhausts, underbody diffuser, rear window wiper, 3D M5 badging)
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

import generate_bmw_m5_touring_e61_master_cad
importlib.reload(generate_bmw_m5_touring_e61_master_cad)
generate_bmw_m5_touring_e61_master_cad.generate_bmw_m5_touring_e61_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\bmw_m5_touring_e61"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Clean previous studio objects
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

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 950
top_data.shape = 'RECTANGLE'
top_data.size = 3.0
top_data.size_y = 8.5
top_data.color = (0.96, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.55, 4.40))
top_obj.rotation_euler = Euler((0, 0, 0))

# 3-Point Automotive Lighting
# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 850
key_data.shape = 'RECTANGLE'
key_data.size = 2.4
key_data.size_y = 3.8
key_data.color = (1.0, 0.98, 0.95)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((4.2, 3.4, 2.8))
dir_k = Vector((0.0, -0.6, 0.7)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 420
fill_data.shape = 'RECTANGLE'
fill_data.size = 3.0
fill_data.size_y = 4.5
fill_data.color = (0.90, 0.94, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-4.6, -1.5, 2.2))
dir_f = Vector((0.0, -1.5, 0.7)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 650
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.0
rim_data.size_y = 5.0
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-3.8, -5.2, 2.6))
dir_r = Vector((0.0, -2.4, 0.7)) - rim_obj.location
rim_obj.rotation_euler = dir_r.to_track_quat('-Z', 'Y').to_euler()

# Dark Studio Ground Floor with subtle reflectivity
bm_ground = bmesh.new()
sx, sy = 25.0, 30.0
for v in [(-sx, -sy, 0.0), (sx, -sy, 0.0), (sx, sy, 0.0), (-sx, sy, 0.0)]:
    bm_ground.verts.new(v)
bm_ground.faces.new(bm_ground.verts)
mesh_ground = bpy.data.meshes.new("Assessment_Ground_Mesh")
bm_ground.to_mesh(mesh_ground)
bm_ground.free()
obj_ground = bpy.data.objects.new("Assessment_Ground", mesh_ground)
bpy.context.scene.collection.objects.link(obj_ground)

mat_ground = bpy.data.materials.new("MAT_Assessment_Ground")
mat_ground.use_nodes = True
bsdf_g = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf_g:
    bsdf_g.inputs["Base Color"].default_value = (0.05, 0.052, 0.058, 1.0)
    bsdf_g.inputs["Roughness"].default_value = 0.35
    bsdf_g.inputs["Metallic"].default_value = 0.2
obj_ground.data.materials.append(mat_ground)

# Render Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'

if hasattr(scene, 'eevee'):
    if hasattr(scene.eevee, 'use_gtao'):
        scene.eevee.use_gtao = True
    if hasattr(scene.eevee, 'use_bloom'):
        scene.eevee.use_bloom = False
    if hasattr(scene.eevee, 'use_ssr'):
        scene.eevee.use_ssr = True

cam_data = bpy.data.cameras.new("Assessment_Cam")
cam_data.lens = 50.0
cam_obj = bpy.data.objects.new("Assessment_Cam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

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

views = [
    ("bmw_m5_touring_front_three_quarter", ( 4.80,  3.20, 1.60), (0.0, -1.10, 0.70), 50.0),
    ("bmw_m5_touring_rear_three_quarter",  ( 4.80, -6.40, 1.60), (0.0, -2.10, 0.70), 50.0),
    ("bmw_m5_touring_side_profile",        ( 7.00, -1.55, 0.95), (0.0, -1.55, 0.70), 52.0),
    ("bmw_m5_touring_front_elevation",     ( 0.00,  5.20, 0.90), (0.0,  0.30, 0.65), 50.0),
    ("bmw_m5_touring_rear_elevation",      ( 0.00, -7.40, 0.90), (0.0, -2.90, 0.65), 50.0),
]

for shot_name, cam_pos, target_pos, focal_length in views:
    cam_obj.location = Vector(cam_pos)
    direction = Vector(target_pos) - Vector(cam_pos)
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    cam_data.lens = focal_length

    temp_path = os.path.join(ARTIFACTS_DIR, f"{shot_name}.png")
    perm_path = os.path.join(SCREENSHOTS_DIR, f"{shot_name}.png")

    scene.render.filepath = temp_path
    bpy.ops.render.render(write_still=True)
    shutil.copy2(temp_path, perm_path)
    print(f"[RENDERED] {shot_name} -> {temp_path} & {perm_path} ({os.path.getsize(temp_path)} bytes)")

print("=" * 80)
print("ALL 5 CANONICAL BEAUTY ASSESSMENT VIEWS RENDERED SUCCESSFULLY")
print("=" * 80)
