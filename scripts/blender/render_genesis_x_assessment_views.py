"""
=============================================================================
RENDER GENESIS X CONVERTIBLE CONCEPT (PHASE 23 & 24) ASSESSMENT VIEWS
=============================================================================
Renders 5 standard automotive validation angles:
1. Front 3/4 Hero (Two-Line LED quad light-pipes, G-Matrix inverted crest grille, long parabolic bonnet, 22" turbine wheels)
2. Rear 3/4 (Concave boat-tail transom, two-line ruby taillamps, integrated ducktail CHMSL, rear diffuser strakes)
3. Side Profile (Anti-wedge Parabolic Line, high-rake frameless windshield, slim digital camera mirror stalks, flush door dots)
4. Front Elevation (Athletic elegance road stance, low-slung splitter, dark titanium crest border, dual quad light channels)
5. Rear Elevation (Boat-tail concave apron, dimensional GENESIS typography, dual two-line ruby LEDs, carbon venturi diffuser)
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

# Import Phase 24 generator
if "generate_genesis_x_convertible_phase2" in sys.modules:
    del sys.modules["generate_genesis_x_convertible_phase2"]

import generate_genesis_x_convertible_phase2
print("[RENDER] Executing Genesis X Convertible Concept master complete build...")
generate_genesis_x_convertible_phase2.build_genesis_x_convertible_phase2()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"
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

# Overhead Strip Softbox (Spanning long grand touring bonnet and tonneau deck)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 3800
top_data.shape = 'RECTANGLE'
top_data.size = 3.2
top_data.size_y = 7.6
top_data.color = (0.98, 0.99, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.8)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Cool Pearlescent Key for Crane White multi-coat metallic highlights and G-Matrix facet reflection)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 3400
key_data.size = 6.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.0, 5.0, 3.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Warm Soft Fill for ambient shadows across sculpted parabolic flank)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 2200
fill_data.size = 6.0
fill_data.color = (1.0, 0.98, 0.95)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.0, 4.6, 3.5)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on concave boat-tail transom and titanium brightware)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 14.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.4, 3.8)
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
    g_bsdf.inputs["Base Color"].default_value = (0.010, 0.012, 0.016, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.50
    g_bsdf.inputs["Roughness"].default_value = 0.06
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

# Angle definitions for Genesis X Convertible Concept (L=4.980m, W=1.980m, H=1.350m)
angles = [
    ("genesis_x_convertible_front_three_quarter", (5.0,  5.4, 1.45), (0.0,  0.30, 0.65), 52.0),
    ("genesis_x_convertible_rear_three_quarter",  (5.0, -5.4, 1.45), (0.0, -0.30, 0.65), 52.0),
    ("genesis_x_convertible_side_profile",        (6.6,  0.0, 0.75), (0.0,  0.00, 0.65), 50.0),
    ("genesis_x_convertible_front_elevation",     (0.0,  5.6, 0.72), (0.0,  0.30, 0.65), 52.0),
    ("genesis_x_convertible_rear_elevation",      (0.0, -5.6, 0.72), (0.0, -0.30, 0.65), 52.0),
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

print("[COMPLETE] All 5 Genesis X Convertible Concept assessment views rendered successfully.")
