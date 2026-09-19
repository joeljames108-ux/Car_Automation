"""
=============================================================================
RENDER LEXUS LS 400 (UCF20) (PHASE 43 & 44) ASSESSMENT VIEWS
=============================================================================
Renders 5 standard automotive validation angles:
1. Front 3/4 Hero (Trapezoidal chrome grille, 3D Lexus 'L' emblem, 16" 5-spoke alloys, crystal headlamps)
2. Rear 3/4 (Aerodynamic C-pillars, multi-tier jewel taillights, wrap-around bumper, dual oval exhausts)
3. Side Profile (Whisper-quiet aerodynamic saloon silhouette Cd 0.28, two-tone lower cladding)
4. Front Elevation (Flagship Lexus executive stance, multi-reflector headlights, lower fog lamps)
5. Rear Elevation (Multi-tier jewel taillight clusters, trunk chrome garnish, dual oval exhaust tips)
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

if "generate_lexus_ls400_phase2" in sys.modules:
    del sys.modules["generate_lexus_ls400_phase2"]

import generate_lexus_ls400_phase2
print("[RENDER] Executing Lexus LS 400 (UCF20) master complete build...")
generate_lexus_ls400_phase2.generate_lexus_ls400_complete()

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

# Key Light (Cool-Neutral Key for rich reflections off Deep Emerald Pearl paint & chrome)
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

# Rim Light (Accent on C-pillar, roofline, and rear jewel taillights)
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

# 3. Camera Setup & 5 Standard Automotive Angles
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 65
cam_data.sensor_width = 36
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

views = [
    {
        "name": "lexus_ls400_front_three_quarter",
        "cam_loc": (4.6, 5.4, 1.65),
        "target": (0.0, 0.25, 0.65),
        "desc": "Front 3/4 Hero (Trapezoidal chrome grille, 3D Lexus 'L' emblem, 16\" alloy wheels)"
    },
    {
        "name": "lexus_ls400_rear_three_quarter",
        "cam_loc": (4.6, -5.4, 1.65),
        "target": (0.0, -0.25, 0.65),
        "desc": "Rear 3/4 (C-pillars, multi-tier jewel taillights, two-tone cladding, dual exhaust)"
    },
    {
        "name": "lexus_ls400_side_profile",
        "cam_loc": (6.6, 0.0, 1.35),
        "target": (0.0, 0.0, 0.65),
        "desc": "Side Profile (Whisper-quiet aerodynamic saloon silhouette, two-tone lower cladding)"
    },
    {
        "name": "lexus_ls400_front_elevation",
        "cam_loc": (0.0, 6.2, 1.35),
        "target": (0.0, 1.2, 0.65),
        "desc": "Front Elevation (Trapezoidal chrome grille, crystal headlamps, lower fog lamps)"
    },
    {
        "name": "lexus_ls400_rear_elevation",
        "cam_loc": (0.0, -6.2, 1.35),
        "target": (0.0, -1.2, 0.65),
        "desc": "Rear Elevation (Multi-tier jewel taillamps, chrome trunk garnish, dual oval tips)"
    }
]

for v in views:
    cam_obj.location = Vector(v["cam_loc"])
    target_vec = Vector(v["target"])
    direction = target_vec - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_file = os.path.join(ARTIFACTS_DIR, f"{v['name']}.png")
    scene.render.filepath = out_file
    print(f"[RENDER] Rendering {v['name']} - {v['desc']}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {v['name']} -> {out_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Lexus LS 400 (UCF20) assessment views rendered successfully.")
