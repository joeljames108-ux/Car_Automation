"""
=============================================================================
RENDER NISSAN MURANO (Z50) (CROSSOVER 2000s) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Nissan Murano Z50:
1. Front 3/4 Hero (Sunlit Copper Pearl metallic, signature tooth chrome grille, Bi-Xenon optics, 18" alloy wheels)
2. Rear 3/4 Crossover (Vertical wrap-around LED lightbars, curved backlite glass, roof spoiler, dual polished exhausts)
3. Side Profile (Sculpted aerodynamic crossover profile, 2,824mm wheelbase, flush B/C-pillars, iconic kicking quarter glass)
4. Front Elevation (Bold chrome tooth-like grille, Bi-Xenon headlights, wide lower radiator intake, circular fog lamps)
5. Rear Elevation (Fastback aerodynamic tailgate, roof spoiler with CHMSL, vertical LED taillamps, dual stainless exhausts)
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

import generate_nissan_murano_z50_master_cad
generate_nissan_murano_z50_master_cad.build_and_export_nissan_murano()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\nissan_murano_z50"
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

# Overhead Strip Softbox (Highlights roof rails, moonroof, and hood creases)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 950
top_data.shape = 'RECTANGLE'
top_data.size = 3.4
top_data.size_y = 8.0
top_data.color = (0.98, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.45, 4.40))
top_obj.rotation_euler = Euler((0, 0, 0))

# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 900
key_data.shape = 'RECTANGLE'
key_data.size = 2.6
key_data.size_y = 4.0
key_data.color = (1.0, 0.97, 0.94)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((4.4, 2.2, 2.8))
dir_k = Vector((0.0, -1.45, 0.85)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 480
fill_data.shape = 'RECTANGLE'
fill_data.size = 3.0
fill_data.size_y = 4.5
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-4.6, -1.45, 2.2))
dir_f = Vector((0.0, -1.45, 0.85)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 700
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.4
rim_data.size_y = 5.0
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-3.8, -5.2, 2.6))
dir_r = Vector((0.0, -1.45, 0.85)) - rim_obj.location
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
for obj_name in ["DOOR_FL", "DOOR_FR", "DOOR_RL", "DOOR_RR", "DOOR_Tailgate", "HOOD_Main"]:
    o = bpy.data.objects.get(obj_name)
    if o:
        o.rotation_euler = Euler((0, 0, 0), 'XYZ')

# Canonical Validation Assessment Angles
assessment_views = [
    (
        "nissan_murano_front_three_quarter.png",
        Vector((4.5, 3.8, 2.2)),
        Vector((0.0, -0.8, 0.85))
    ),
    (
        "nissan_murano_rear_three_quarter.png",
        Vector((-4.6, -6.2, 2.3)),
        Vector((0.0, -2.4, 0.85))
    ),
    (
        "nissan_murano_side_profile.png",
        Vector((-7.2, -1.45, 1.35)),
        Vector((0.0, -1.45, 0.85))
    ),
    (
        "nissan_murano_front_elevation.png",
        Vector((0.0, 6.2, 1.25)),
        Vector((0.0, 0.4, 0.85))
    ),
    (
        "nissan_murano_rear_elevation.png",
        Vector((0.0, -7.2, 1.35)),
        Vector((0.0, -2.8, 0.85))
    )
]

print("=" * 80)
print("RENDERING NISSAN MURANO (Z50) CANONICAL ASSESSMENT VIEWS")
print("=" * 80)

for filename, cam_pos, target_pos in assessment_views:
    cam_obj.location = cam_pos
    direction = target_pos - cam_pos
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    out_path = os.path.join(SCREENSHOTS_DIR, filename)
    scene.render.filepath = out_path
    print(f"-> Rendering {filename}...")
    bpy.ops.render.render(write_still=True)

    # Also copy to artifacts directory for direct user-facing viewing
    artifact_copy = os.path.join(ARTIFACTS_DIR, filename)
    shutil.copyfile(out_path, artifact_copy)
    print(f"   [OK] Saved to {out_path} and {artifact_copy}")

print("=" * 80)
print("ALL 5 CANONICAL ASSESSMENT VIEWS RENDERED SUCCESSFULLY!")
print("=" * 80)
