"""
=============================================================================
RENDER 2000s VOLVO FH12 GLOBETROTTER XL (HEAVY TRUCK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio validation shots of the procedural 2000s Volvo FH12:
1. Front 3/4 Hero (Globetrotter XL high roof, Volvo Silver Metallic, curved mesh grille, diagonal iron mark, aerodynamic mirrors)
2. Rear 3/4 (Jost 5th wheel, aluminum catwalk, coiled Suzie lines, 6-chamber Euro taillights, quarter fenders)
3. Side Profile (Aerodynamic 4x2 tractor proportion, 650L D-tank, full side skirts, Alcoa wheels, cab side extenders)
4. Front Elevation (Swept windshield, pantograph wipers, integrated bumper fog lights, sun visor with LED markers)
5. Rear Elevation (ECE R58 underrun bar, ECE 70 chevron plates, working floodlights, trailer connection gantry)
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

import importlib

print("[RENDER] Building Volvo FH12 Complete (Phase 1 + Phase 2)...")
import generate_volvo_fh12_phase2
importlib.reload(generate_volvo_fh12_phase2)
generate_volvo_fh12_phase2.build_volvo_fh12_complete()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead", "GroundBounce"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Ambient Environment
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.045, 0.05, 1.0)
    bg_node.inputs["Strength"].default_value = 0.90

# 1. Overhead Heavy Softbox (Z = 6.4 m)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 5200
top_data.shape = 'RECTANGLE'
top_data.size = 3.8
top_data.size_y = 8.8
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -0.2, 6.4)
bpy.context.scene.collection.objects.link(top_obj)

# 2. Key Light (High-Output Commercial Vehicle Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 4400
key_data.size = 6.8
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (6.8, 6.8, 4.4)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# 3. Fill Light (Cool Diffuse Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 2800
fill_data.size = 6.8
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-6.8, 5.8, 4.0)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# 4. Rim Light (Roofline, Globetrotter dome, and Fairing Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 9.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -7.8, 4.8)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# 5. Low Chassis & Front Bumper Bounce Light
bounce_data = bpy.data.lights.new(name="Assessment_GroundBounce", type='AREA')
bounce_data.energy = 1800
bounce_data.size = 4.2
bounce_data.color = (0.95, 0.95, 0.95)
bounce_obj = bpy.data.objects.new("Assessment_GroundBounce", bounce_data)
bounce_obj.location = (0.0, 4.8, 0.6)
bounce_obj.rotation_euler = Euler((math.radians(-30), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(bounce_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.02, 0.022, 0.025, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.30
    g_bsdf.inputs["Roughness"].default_value = 0.10
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 0.90
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 0.90
ground_obj.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 45.0
cam_data.clip_start = 0.1
cam_data.clip_end = 150.0
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

# Angle definitions calibrated for Volvo FH12 Globetrotter XL (L=6.0m, W=2.5m, H=3.9m)
angles = [
    ("volvo_fh12_front_three_quarter", (7.5,  7.8, 2.6), (0.0,  0.50, 1.95), 45.0),
    ("volvo_fh12_rear_three_quarter",  (7.8, -7.2, 2.5), (0.0, -1.10, 1.75), 45.0),
    ("volvo_fh12_side_profile",        (9.6, -0.20, 2.2), (0.0, -0.20, 1.95), 45.0),
    ("volvo_fh12_front_elevation",     (0.0,  8.6, 2.2), (0.0,  1.80, 2.05), 45.0),
    ("volvo_fh12_rear_elevation",      (0.0, -8.6, 2.0), (0.0, -1.50, 1.75), 45.0),
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

print("[COMPLETE] All 5 Volvo FH12 Globetrotter XL assessment views rendered successfully.")
