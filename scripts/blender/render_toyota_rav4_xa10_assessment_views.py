"""
=============================================================================
RENDER TOYOTA RAV4 (XA10) (CROSSOVER 1990s) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Toyota RAV4 XA10:
1. Front 3/4 Hero (Bright Electric Blue Metallic body, dark graphite cladding, 16" alloy wheels, curved halogens)
2. Rear 3/4 Crossover (External spare tire carrier with embossed white 'RAV4' cover, vertical taillights, stainless exhaust)
3. Side Profile (Fun-in-the-sun 3-door 2,200mm wheelbase, B-pillar hoop styling arch, dual pop-up sunroofs, cladding)
4. Front Elevation (Curved hood with Toyota oval badge, trapezoid halogens, wrap-around amber indicators, front skid plate)
5. Rear Elevation (Side-hinged tailgate, full-size spare tire, vertical wrap-around taillights, heated backlite with wiper)
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

import generate_toyota_rav4_xa10_master_cad
generate_toyota_rav4_xa10_master_cad.build_and_export_toyota_rav4()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\toyota_rav4_xa10"
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

# Overhead Strip Softbox (Highlights roof rails, sunroof panels, and hood creases)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 880
top_data.shape = 'RECTANGLE'
top_data.size = 3.2
top_data.size_y = 7.0
top_data.color = (0.98, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = Vector((0.0, -1.25, 4.00))
top_obj.rotation_euler = Euler((0, 0, 0))

# Key Light (Front 3/4)
key_data = bpy.data.lights.new(name="Assessment_Key", type='AREA')
key_data.energy = 850
key_data.shape = 'RECTANGLE'
key_data.size = 2.4
key_data.size_y = 3.5
key_data.color = (1.0, 0.97, 0.94)
key_obj = bpy.data.objects.new("Assessment_Key", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = Vector((3.8, 1.8, 2.6))
dir_k = Vector((0.0, -1.25, 0.7)) - key_obj.location
key_obj.rotation_euler = dir_k.to_track_quat('-Z', 'Y').to_euler()

# Fill Light (Opposite side)
fill_data = bpy.data.lights.new(name="Assessment_Fill", type='AREA')
fill_data.energy = 440
fill_data.shape = 'RECTANGLE'
fill_data.size = 2.8
fill_data.size_y = 4.0
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_Fill", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = Vector((-4.0, -1.25, 2.0))
dir_f = Vector((0.0, -1.25, 0.7)) - fill_obj.location
fill_obj.rotation_euler = dir_f.to_track_quat('-Z', 'Y').to_euler()

# Rim Light (Crisp shoulder highlight)
rim_data = bpy.data.lights.new(name="Assessment_Rim", type='AREA')
rim_data.energy = 650
rim_data.shape = 'RECTANGLE'
rim_data.size = 2.2
rim_data.size_y = 4.5
rim_data.color = (0.95, 0.97, 1.0)
rim_obj = bpy.data.objects.new("Assessment_Rim", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = Vector((-3.4, -4.5, 2.4))
dir_r = Vector((0.0, -1.25, 0.7)) - rim_obj.location
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
        o.rotation_euler = Euler((0, 0, 0), 'XYZ')

views = [
    ("toyota_rav4_front_three_quarter", Vector((3.4, 1.6, 1.7)), Vector((0.0, -1.25, 0.70))),
    ("toyota_rav4_rear_three_quarter", Vector((-3.4, -4.2, 1.8)), Vector((0.0, -1.25, 0.70))),
    ("toyota_rav4_side_profile", Vector((-5.6, -1.25, 0.95)), Vector((0.0, -1.25, 0.70))),
    ("toyota_rav4_front_elevation", Vector((0.0, 4.0, 0.95)), Vector((0.0, -1.25, 0.70))),
    ("toyota_rav4_rear_elevation", Vector((0.0, -6.0, 1.05)), Vector((0.0, -1.25, 0.70)))
]

rendered_files = []
for name, pos, target in views:
    cam_obj.location = pos
    direction = target - pos
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    out_path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    rendered_files.append(out_path)

    # Also copy to artifacts dir for easy previewing
    art_path = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    shutil.copyfile(out_path, art_path)
    print(f"[OK] Rendered {name} -> {out_path} and {art_path}")

print("=" * 80)
print(f"ALL 5 ASSESSMENT VIEWS FOR TOYOTA RAV4 (XA10) RENDERED SUCCESSFULLY!")
print("=" * 80)
