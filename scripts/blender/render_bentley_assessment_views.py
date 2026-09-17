"""
=============================================================================
RENDER BENTLEY CONTINENTAL GT SPEED CONVERTIBLE (PHASE 21 & 22) ASSESSMENT VIEWS
=============================================================================
Renders 5 standard automotive validation angles:
1. Front 3/4 Hero (Twin cut-crystal matrix LED headlamps, dark tint Speed matrix grille, Flying 'B' mascot, 22" Speed wheels)
2. Rear 3/4 (Elliptical cut-crystal LED taillamps, quad rifled oval exhaust tips, muscular haunches, tonneau deck garnish)
3. Side Profile (Graceful Bentley powerline, swept roofline, front fender vents with chrome strakes, pop-out flush handles)
4. Front Elevation (Grand touring presence, matrix lower intake vanes, Mulliner brightware, Sequin Blue metallic paint)
5. Rear Elevation (Tapered elliptical taillamp jewelry, rear diffuser strakes, cursive Speed script, twin dual-exit pipes)
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

# Import Phase 22 generator
if "generate_bentley_continental_gt_speed_phase2" in sys.modules:
    del sys.modules["generate_bentley_continental_gt_speed_phase2"]

import generate_bentley_continental_gt_speed_phase2
print("[RENDER] Executing Bentley Continental GT Speed Convertible master complete build...")
generate_bentley_continental_gt_speed_phase2.build_bentley_continental_gt_speed_phase2()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\e5fb91c6-ac5d-499e-9cc7-3a418ae8a7e4"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 1. Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# 2. Studio World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.028, 0.030, 0.035, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Spanning long grand touring bonnet and tonneau deck)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 3600
top_data.shape = 'RECTANGLE'
top_data.size = 3.0
top_data.size_y = 7.4
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.6)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Key for Sequin Blue metallic highlights and diamond facet refraction)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 3200
key_data.size = 5.8
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.8, 3.6)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill for ambient shadows across sculpted flank)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 2000
fill_data.size = 5.8
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 4.5, 3.4)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on rear powerline haunches and chrome elliptical exhausts)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 12.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.2, 3.6)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"

mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.012, 0.014, 0.018, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.45
    g_bsdf.inputs["Roughness"].default_value = 0.07
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 0.95
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 0.95
ground_obj.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 52.0
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

# Angle definitions for Bentley Continental GT Speed Convertible (L=4.850m, W=1.954m, H=1.399m)
angles = [
    ("bentley_continental_front_three_quarter", (4.8,  5.2, 1.45), (0.0,  0.30, 0.65), 52.0),
    ("bentley_continental_rear_three_quarter",  (4.8, -5.2, 1.45), (0.0, -0.30, 0.65), 52.0),
    ("bentley_continental_side_profile",        (6.4,  0.0, 0.75), (0.0,  0.00, 0.65), 50.0),
    ("bentley_continental_front_elevation",     (0.0,  5.4, 0.72), (0.0,  0.30, 0.65), 52.0),
    ("bentley_continental_rear_elevation",      (0.0, -5.4, 0.72), (0.0, -0.30, 0.65), 52.0),
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

print("[COMPLETE] All 5 Bentley Continental GT Speed Convertible assessment views rendered successfully.")
