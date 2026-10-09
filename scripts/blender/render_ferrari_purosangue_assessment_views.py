"""
=============================================================================
RENDER FERRARI PUROSANGUE (CROSSOVER 2020s) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Ferrari Purosangue:
1. Front 3/4 Hero (Rosso Corsa, Aerobridge ducts, razor DRLs, 22" forged wheels)
2. Rear 3/4 Crossover (Dual horizontal LED blades, suspended roof spoiler, quad exhausts, diffuser)
3. Side Profile (Coupe flyline, welcome coach doors, carbon roof, Giallo calipers, 3,018mm wheelbase)
4. Front Elevation (Central Cavallino grille, lower projector intakes, clamshell hood with Scudetto)
5. Rear Elevation (Ferrari script, Cavallino Rampante, quad exhaust cannons, diffuser channels)
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

import generate_ferrari_purosangue_master_cad
generate_ferrari_purosangue_master_cad.build_and_export_purosangue()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\b4a77049-12bb-41b8-a852-bdc782fd07d7"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\ferrari_purosangue"
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
    bg_node.inputs["Color"].default_value = (0.040, 0.042, 0.048, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Highlights roof flyline, carbon roof, and clamshell hood)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 1100
top_data.shape = 'RECTANGLE'
top_data.size = 3.4
top_data.size_y = 8.8
top_data.color = (0.98, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.50, 4.40))
top_obj.rotation_euler = Euler((0, 0, 0))

# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 980
key_data.shape = 'RECTANGLE'
key_data.size = 2.8
key_data.size_y = 4.4
key_data.color = (1.0, 0.98, 0.96)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((4.6, 2.5, 2.8))
dir_k = Vector((0.0, -1.50, 0.80)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 540
fill_data.shape = 'RECTANGLE'
fill_data.size = 3.4
fill_data.size_y = 4.8
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-5.0, -1.50, 2.4))
dir_f = Vector((0.0, -1.50, 0.80)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 780
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.6
rim_data.size_y = 5.4
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-4.2, -5.5, 2.6))
dir_r = Vector((0.0, -1.50, 0.80)) - rim_obj.location
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
    bsdf_g.inputs["Base Color"].default_value = (0.040, 0.042, 0.048, 1.0)
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

# Ensure neutral frame 1 and closed stance for articulating body panels, hide hitboxes
bpy.context.scene.frame_set(1)
for obj_name in ["DOOR_FL", "DOOR_FR", "DOOR_RL", "DOOR_RR", "DOOR_Tailgate", "HOOD_Main", "INTERIOR_SteeringWheel"]:
    o = bpy.data.objects.get(obj_name)
    if o:
        if o.animation_data:
            o.animation_data.action = None
        o.rotation_euler = Euler((0, 0, 0))

for o in bpy.data.objects:
    if o.name.startswith("HITBOX_"):
        o.hide_render = True

# 5 Canonical Automotive Inspection Angles
views = [
    {
        "filename": "ferrari_purosangue_front_three_quarter.png",
        "cam_loc": Vector((4.6, 4.0, 2.2)),
        "look_at": Vector((0.0, -0.8, 0.85)),
        "lens": 50.0
    },
    {
        "filename": "ferrari_purosangue_rear_three_quarter.png",
        "cam_loc": Vector((-4.6, -5.8, 2.2)),
        "look_at": Vector((0.0, -2.0, 0.85)),
        "lens": 50.0
    },
    {
        "filename": "ferrari_purosangue_side_profile.png",
        "cam_loc": Vector((-5.8, -1.5, 1.15)),
        "look_at": Vector((0.0, -1.5, 0.75)),
        "lens": 55.0
    },
    {
        "filename": "ferrari_purosangue_front_elevation.png",
        "cam_loc": Vector((0.0, 4.8, 0.95)),
        "look_at": Vector((0.0, 0.0, 0.70)),
        "lens": 52.0
    },
    {
        "filename": "ferrari_purosangue_rear_elevation.png",
        "cam_loc": Vector((0.0, -6.2, 1.05)),
        "look_at": Vector((0.0, -2.8, 0.75)),
        "lens": 52.0
    }
]

print("=" * 80)
print("RENDERING FERRARI PUROSANGUE CANONICAL ASSESSMENT VIEWS")
print("=" * 80)

for v in views:
    out_name = v["filename"]
    cam_obj.location = v["cam_loc"]
    cam_data.lens = v["lens"]

    direction = v["look_at"] - v["cam_loc"]
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    save_path = os.path.join(SCREENSHOTS_DIR, out_name)
    scene.render.filepath = save_path

    print(f"-> Rendering {out_name}...")
    bpy.ops.render.render(write_still=True)

    # Replicate to artifacts directory
    artifact_path = os.path.join(ARTIFACTS_DIR, out_name)
    shutil.copyfile(save_path, artifact_path)
    print(f"   [OK] Saved to {save_path} and {artifact_path}")

print("=" * 80)
print("ALL 5 CANONICAL ASSESSMENT VIEWS RENDERED SUCCESSFULLY!")
print("=" * 80)
