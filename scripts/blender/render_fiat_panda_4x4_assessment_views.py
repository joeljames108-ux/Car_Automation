"""
=============================================================================
RENDER FIAT PANDA 4x4 (141A) (CROSSOVER 1980s) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Fiat Panda 4x4:
1. Front 3/4 Hero (Alpine Forest Green body, textured bumpers, bull-bar, asymmetric grille, 5-bar chrome slash, Pirelli MS35 knobby wheels)
2. Rear 3/4 Micro-Crossover (Boxy Giugiaro hatch stance, vertical 3-tier taillights, Steyr-Puch 4x4 badges, white '4x4' mudflaps)
3. Side Profile (Compact 3,410mm profile, external rain gutters, lower side protective cladding with embossed '4x4', exposed door hinges)
4. Front Elevation (Asymmetric stamped cooling slots on driver side, solid passenger side with chrome slash, rectangular halogens, bull-bar)
5. Rear Elevation (Flat heated backlite glass with orange demister lines, wiper, rear mudflaps with '4x4', exhaust tailpipe)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import shutil
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_fiat_panda_4x4_master_cad
generate_fiat_panda_4x4_master_cad.build_and_export_fiat_panda()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\fiat_panda_4x4"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Clean previous studio objects
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Environment Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.045, 0.048, 0.055, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Highlights roof rain gutters, swage lines, and hood)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 850
top_data.shape = 'RECTANGLE'
top_data.size = 3.0
top_data.size_y = 6.5
top_data.color = (0.98, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.15, 3.80))
top_obj.rotation_euler = Euler((0, 0, 0))

# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 820
key_data.shape = 'RECTANGLE'
key_data.size = 2.2
key_data.size_y = 3.2
key_data.color = (1.0, 0.97, 0.94)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((3.6, 2.8, 2.4))
dir_k = Vector((0.0, -0.4, 0.6)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 420
fill_data.shape = 'RECTANGLE'
fill_data.size = 2.6
fill_data.size_y = 3.8
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-3.8, -1.1, 1.8))
dir_f = Vector((0.0, -1.1, 0.6)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 620
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.0
rim_data.size_y = 4.2
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-3.2, -4.2, 2.2))
dir_r = Vector((0.0, -2.0, 0.6)) - rim_obj.location
rim_obj.rotation_euler = dir_r.to_track_quat('-Z', 'Y').to_euler()

# Dark Studio Ground Floor with subtle reflectivity
bm_ground = bmesh.new()
sx, sy = 20.0, 25.0
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
    bsdf_g.inputs["Base Color"].default_value = (0.045, 0.048, 0.055, 1.0)
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

cam_data = bpy.data.cameras.new("Assessment_Cam")
cam_data.lens = 50.0
cam_obj = bpy.data.objects.new("Assessment_Cam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Ensure neutral frame 1 and closed flush stance for all articulating body panels
bpy.context.scene.frame_set(1)
for obj_name in ["DOOR_FL", "DOOR_FR", "DOOR_Tailgate", "HOOD_Main"]:
    o = bpy.data.objects.get(obj_name)
    if o:
        o.rotation_euler = Euler((0, 0, 0))

# Ensure semantic interaction hitboxes are completely hidden from camera renders
for obj in bpy.data.objects:
    if obj.name.startswith("HITBOX_"):
        obj.hide_render = True

# Standard 5 automotive views tailored to Panda's compact 3.41m proportions
views = [
    ("fiat_panda_4x4_front_three_quarter", ( 3.60,  3.20, 1.40), (0.0, -0.60, 0.65), 50.0),
    ("fiat_panda_4x4_rear_three_quarter",  ( 3.60, -4.80, 1.40), (0.0, -1.60, 0.65), 50.0),
    ("fiat_panda_4x4_side_profile",        ( 5.20, -1.15, 0.95), (0.0, -1.15, 0.65), 50.0),
    ("fiat_panda_4x4_front_elevation",     ( 0.00,  4.20, 0.85), (0.0,  0.20, 0.55), 52.0),
    ("fiat_panda_4x4_rear_elevation",      ( 0.00, -5.40, 0.85), (0.0, -2.40, 0.55), 52.0),
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
