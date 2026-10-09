"""
=============================================================================
RENDER PORSCHE MACAN GTS (CROSSOVER 2010s) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Porsche Macan GTS:
1. Front 3/4 Hero (Carmine Red metallic, GTS SportDesign nose, PDLS+ 4-point LED halo, 20" RS Spyder wheels)
2. Rear 3/4 Crossover (3D sculpted smoked LED taillights, bi-plane roof spoiler, quad sport exhaust, diffuser)
3. Side Profile (Coupe flyline roof, satin black GTS Side Blades, red brake calipers, 2,807mm wheelbase)
4. Front Elevation (Trapezoidal central cooling intake, intercooler scoops, clamshell hood with crest, LED DRLs)
5. Rear Elevation (PORSCHE script badge, Macan GTS designation, quad exhaust tips, vertical diffuser fins)
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

import generate_porsche_macan_gts_master_cad
generate_porsche_macan_gts_master_cad.build_and_export_porsche_macan()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\porsche_macan_gts"
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

# Overhead Strip Softbox (Highlights roof flyline, panoramic glass, and clamshell hood)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 1050
top_data.shape = 'RECTANGLE'
top_data.size = 3.2
top_data.size_y = 8.5
top_data.color = (0.98, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.40, 4.30))
top_obj.rotation_euler = Euler((0, 0, 0))

# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 950
key_data.shape = 'RECTANGLE'
key_data.size = 2.6
key_data.size_y = 4.2
key_data.color = (1.0, 0.98, 0.95)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((4.5, 2.4, 2.7))
dir_k = Vector((0.0, -1.40, 0.80)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 520
fill_data.shape = 'RECTANGLE'
fill_data.size = 3.2
fill_data.size_y = 4.5
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-4.8, -1.40, 2.2))
dir_f = Vector((0.0, -1.40, 0.80)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 750
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.4
rim_data.size_y = 5.2
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-3.9, -5.2, 2.5))
dir_r = Vector((0.0, -1.40, 0.80)) - rim_obj.location
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
    bsdf_g.inputs["Base Color"].default_value = (0.045, 0.048, 0.055, 1.0)
    bsdf_g.inputs["Roughness"].default_value = 0.35
    bsdf_g.inputs["Metallic"].default_value = 0.2
obj_ground.data.materials.append(mat_ground)

# Render Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
if hasattr(scene, 'eevee'):
    if hasattr(scene.eevee, 'use_raytracing'):
        scene.eevee.use_raytracing = True
    if hasattr(scene.eevee, 'use_screen_refraction'):
        scene.eevee.use_screen_refraction = True
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

# Ensure neutral frame 1 and closed flush stance for all articulating body panels, hide hitboxes
bpy.context.scene.frame_set(1)
for obj_name in ["DOOR_FL", "DOOR_FR", "DOOR_RL", "DOOR_RR", "DOOR_Tailgate", "HOOD_Main"]:
    o = bpy.data.objects.get(obj_name)
    if o:
        o.rotation_euler = Euler((0, 0, 0))

for o in bpy.data.objects:
    if o.name.startswith("HITBOX_"):
        o.hide_render = True

# 5 Canonical Automotive Inspection Angles
views = [
    {
        "filename": "porsche_macan_front_three_quarter.png",
        "cam_loc": Vector((4.5, 3.8, 2.2)),
        "look_at": Vector((0.0, -0.8, 0.85)),
        "lens": 50.0
    },
    {
        "filename": "porsche_macan_rear_three_quarter.png",
        "cam_loc": Vector((-4.6, -6.2, 2.3)),
        "look_at": Vector((0.0, -2.4, 0.85)),
        "lens": 50.0
    },
    {
        "filename": "porsche_macan_side_profile.png",
        "cam_loc": Vector((-7.2, -1.45, 1.35)),
        "look_at": Vector((0.0, -1.45, 0.85)),
        "lens": 52.0
    },
    {
        "filename": "porsche_macan_front_elevation.png",
        "cam_loc": Vector((0.0, 6.2, 1.15)),
        "look_at": Vector((0.0, 0.5, 0.75)),
        "lens": 55.0
    },
    {
        "filename": "porsche_macan_rear_elevation.png",
        "cam_loc": Vector((0.0, -7.2, 1.25)),
        "look_at": Vector((0.0, -2.8, 0.75)),
        "lens": 55.0
    }
]

print("=" * 80)
print("RENDERING PORSCHE MACAN GTS CANONICAL ASSESSMENT VIEWS")
print("=" * 80)

for v in views:
    out_name = v["filename"]
    print(f"-> Rendering {out_name}...")
    cam_obj.location = v["cam_loc"]
    cam_data.lens = v["lens"]
    dir_vec = (v["look_at"] - v["cam_loc"]).normalized()
    cam_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()

    save_path_screenshots = os.path.join(SCREENSHOTS_DIR, out_name)
    save_path_artifacts = os.path.join(ARTIFACTS_DIR, out_name)

    scene.render.filepath = save_path_screenshots
    bpy.ops.render.render(write_still=True)

    shutil.copyfile(save_path_screenshots, save_path_artifacts)
    print(f"   [OK] Saved to {save_path_screenshots} and {save_path_artifacts}")

print("=" * 80)
print("ALL 5 CANONICAL ASSESSMENT VIEWS RENDERED SUCCESSFULLY!")
print("=" * 80)
