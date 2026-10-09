"""
=============================================================================
RENDER VOLVO 240 TURBO ESTATE (245 TURBO) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Volvo 240 Turbo Estate:
1. Front 3/4 Hero (Black Turbo grille, diagonal sash, Iron Mark, flush headlamps, Virgo alloys)
2. Rear 3/4 Estate (Vertical D-pillar, wagon roofline, 6-zone taillights, heavy 5 mph bumpers)
3. Side Profile ("Flying Brick" silhouette, roof rain gutters, long estate cargo glass, rub strips)
4. Front Elevation (Blunt hood power bulge, Turbo chin spoiler, halogen fog lamps, 5 mph bumper)
5. Rear Elevation (Strictly vertical tailgate, heated backlite, wiper, 240 TURBO badge, exhaust cannon)
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

import generate_volvo_240_turbo_estate_master_cad
importlib.reload(generate_volvo_240_turbo_estate_master_cad)
generate_volvo_240_turbo_estate_master_cad.generate_volvo_240_turbo_estate_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\volvo_240_turbo_estate"
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

# Overhead Strip Softbox (Highlights along the long estate roof and swage ribs)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 900
top_data.shape = 'RECTANGLE'
top_data.size = 2.8
top_data.size_y = 8.0
top_data.color = (0.96, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -1.455, 4.6)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Swedish Studio Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2000
key_data.size = 6.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.5, 3.2, 3.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Nordic Sky Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1100
fill_data.size = 6.5
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.5, 2.2, 3.6)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (D-Pillar and vertical tailgate outline)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 6.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -7.5, 3.6)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Rear Key Light (Studio Rear Key illuminating Tailgate, Taillights & Badges)
rear_key_data = bpy.data.lights.new(name="Assessment_RearKey", type='AREA')
rear_key_data.energy = 2200
rear_key_data.size = 6.5
rear_key_data.color = (0.96, 0.98, 1.0)
rear_key_obj = bpy.data.objects.new("Assessment_RearKey", rear_key_data)
rear_key_obj.location = (-4.2, -6.5, 3.2)
rear_key_obj.rotation_euler = Euler((math.radians(-40), math.radians(-15), math.radians(-145)), 'XYZ')
bpy.context.scene.collection.objects.link(rear_key_obj)

# Dark Reflective Ceramic Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=45, location=(0, -1.455, 0))
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

# Angle definitions calibrated for Volvo 240 (L=4.790m, Y: +0.940m to -3.850m, Center Y = -1.455m)
angles = [
    ("volvo_240_turbo_front_three_quarter", ( 4.80,  3.20, 1.60), (0.0, -1.00, 0.70), 50.0),
    ("volvo_240_turbo_rear_three_quarter",  ( 4.80, -6.00, 1.60), (0.0, -1.90, 0.70), 50.0),
    ("volvo_240_turbo_side_profile",        ( 6.80, -1.45, 0.95), (0.0, -1.45, 0.70), 52.0),
    ("volvo_240_turbo_front_elevation",     ( 0.00,  5.20, 0.90), (0.0,  0.40, 0.65), 50.0),
    ("volvo_240_turbo_rear_elevation",      ( 0.00, -7.20, 0.90), (0.0, -2.80, 0.65), 50.0),
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

print("=" * 80)
print("ALL 5 CANONICAL BEAUTY ASSESSMENT VIEWS RENDERED SUCCESSFULLY")
print("=" * 80)
