"""
=============================================================================
RENDER ROLLS-ROYCE SILVER SHADOW II (PHASE 39 & 40) ASSESSMENT VIEWS
=============================================================================
Renders 5 standard automotive validation angles:
1. Front 3/4 Hero (Pantheon temple grille, Spirit of Ecstasy, dual round headlamps, stainless hubcaps)
2. Rear 3/4 (Formal C-pillars, upright backlight, flat bootlid, vertical taillamps, chrome overriders)
3. Side Profile (Classic 1970s British three-box saloon silhouette, waistline coachline, upright glasshouse)
4. Front Elevation (Regal temple facade, Spirit of Ecstasy mascot, heavy bumper overriders)
5. Rear Elevation (Formal boot transom, vertical fluted taillights, chrome license plinth, dual exhausts)
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

if "generate_rolls_royce_silver_shadow_phase2" in sys.modules:
    del sys.modules["generate_rolls_royce_silver_shadow_phase2"]

import generate_rolls_royce_silver_shadow_phase2
print("[RENDER] Executing Rolls-Royce Silver Shadow II master complete build...")
generate_rolls_royce_silver_shadow_phase2.build_rolls_royce_silver_shadow_phase2()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\eae4f157-86a5-4bd2-a22c-b6d21ff59614"
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
    bg_node.inputs["Color"].default_value = (0.024, 0.026, 0.030, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 4200
top_data.shape = 'RECTANGLE'
top_data.size = 3.2
top_data.size_y = 7.2
top_data.color = (1.0, 0.98, 0.95)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.8)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Cool-Neutral Key for rich reflections off chrome Pantheon grille and velvet paint)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 3600
key_data.size = 6.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.2, 5.0, 3.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 2400
fill_data.size = 6.0
fill_data.color = (0.95, 0.97, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.2, 4.8, 3.6)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on C-pillar, formal roofline, and rear chrome overriders)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 16.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.0, 3.8)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Floor
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"

mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.012, 0.014, 0.018, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.45
    g_bsdf.inputs["Roughness"].default_value = 0.08
ground_obj.data.materials.append(mat_ground)

# 3. Setup Camera & Render Settings
cam_data = bpy.data.cameras.new("Assessment_Camera")
cam_data.lens = 52
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

# EEVEE Engine Setup
if hasattr(scene, "eevee"):
    try:
        scene.eevee.use_gtao = True
        scene.eevee.use_bloom = True
        scene.eevee.use_ssr = True
        scene.eevee.use_ssr_refraction = True
    except Exception:
        pass

# 4. Define 5 Automotive Validation Views
center_target = Vector((0.0, 0.0, 0.720))

views = [
    # (name, azimuth_deg, elev_deg, dist, target_offset)
    ("rolls_royce_silver_shadow_front_three_quarter", 38.0, 14.0, 7.2, Vector((0.0, 0.10, 0.0))),
    ("rolls_royce_silver_shadow_rear_three_quarter",  142.0, 14.0, 7.2, Vector((0.0, -0.10, 0.0))),
    ("rolls_royce_silver_shadow_side_profile",        90.0,  6.0,  7.5, Vector((0.0, 0.0, -0.05))),
    ("rolls_royce_silver_shadow_front_elevation",     0.0,   8.0,  6.8, Vector((0.0, 0.20, -0.02))),
    ("rolls_royce_silver_shadow_rear_elevation",      180.0, 8.0,  6.8, Vector((0.0, -0.20, -0.02))),
]

for name, az, el, dist, toff in views:
    rad_az = math.radians(az)
    rad_el = math.radians(el)
    target = center_target + toff

    cam_x = target.x + dist * math.cos(rad_el) * math.sin(rad_az)
    cam_y = target.y + dist * math.cos(rad_el) * math.cos(rad_az)
    cam_z = target.z + dist * math.sin(rad_el)

    cam_obj.location = Vector((cam_x, cam_y, cam_z))
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {name} -> {out_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Rolls-Royce Silver Shadow II assessment views rendered successfully.")
