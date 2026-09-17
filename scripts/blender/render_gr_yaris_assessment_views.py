"""
=============================================================================
RENDER TOYOTA GR YARIS (2020S HATCHBACK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Toyota GR Yaris:
1. Front 3/4 Hero (Gazoo Racing Pure White, massive intercooler mouth, Triple-LED optics)
2. Rear 3/4 (WRC blister haunches, continuous full-width LED light-bar, diffuser, dual exhausts)
3. Side Profile (18" forged BBS 10-spoke alloys, Red GR calipers, sloping carbon roof)
4. Front Elevation (Trapezoidal intercooler grille, vertical brake duct canards, GR badging)
5. Rear Elevation (Dual 90mm chrome exhaust tips, 4 diffuser strakes, light-bar, GR badge)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

if "generate_toyota_gr_yaris" in sys.modules:
    del sys.modules["generate_toyota_gr_yaris"]
import generate_toyota_gr_yaris
from generate_toyota_gr_yaris import build_toyota_gr_yaris_master

# Build Toyota GR Yaris from completely purged factory state
build_toyota_gr_yaris_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

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
    bg_node.inputs["Color"].default_value = (0.05, 0.052, 0.058, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2500
top_data.shape = 'RECTANGLE'
top_data.size = 2.4
top_data.size_y = 6.0
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Classic Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2400
key_data.size = 5.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.5, 3.5)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1400
fill_data.size = 5.5
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 3.8, 3.3)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Carbon Roof & Rear Haunch Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 7.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.5, 3.3)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.02, 0.022, 0.025, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.35
    g_bsdf.inputs["Roughness"].default_value = 0.08
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 0.95
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 0.95
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
if hasattr(scene, "eevee"):
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 64
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Angle definitions for Toyota GR Yaris (L=3.995m, W=1.805m, H=1.455m)
angles = [
    ("gr_yaris_front_three_quarter", (4.5,  4.4, 1.35), (0.0,  0.10, 0.65), 50.0),
    ("gr_yaris_rear_three_quarter",  (4.5, -4.4, 1.35), (0.0, -0.10, 0.68), 50.0),
    ("gr_yaris_side_profile",        (5.6,  0.0, 0.74), (0.0,  0.00, 0.65), 55.0),
    ("gr_yaris_front_elevation",     (0.0,  5.2, 0.68), (0.0,  0.15, 0.64), 50.0),
    ("gr_yaris_rear_elevation",      (0.0, -5.2, 0.68), (0.0, -0.15, 0.65), 50.0),
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
    print(f"[RENDERED] {name} -> {out_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Toyota GR Yaris assessment views rendered successfully.")
