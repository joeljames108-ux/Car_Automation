"""
=============================================================================
RENDER 1974 KENWORTH W900A (1970s HEAVY TRUCK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated 1974 Kenworth W900A:
1. Front 3/4 Hero (Coffee Brown & Champagne Gold, 34-slat chrome grille, Texas bumper, 6" dual stacks)
2. Rear 3/4 (Sleeper box, headache rack with chains, catwalk deck, Holland 5th wheel, tandem axles)
3. Side Profile (220-inch wheelbase, 120-gal tanks, battery boxes, 10 Alcoa forged wheels)
4. Front Elevation (Towering chrome grille, Grover air horns, 5 bullet lights, bumper guide poles)
5. Rear Elevation (Rear light bar with quad 4" round lamps, DOT cluster, mudflaps, pintle ring)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

gen_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "generators"))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_kenworth_w900a_phase1
import importlib
importlib.reload(generate_kenworth_w900a_phase1)

# Check if Phase 2 generator is available
try:
    import generate_kenworth_w900a_phase2
    importlib.reload(generate_kenworth_w900a_phase2)
    print("[RENDER] Building Kenworth W900A Complete (Phase 1 + Phase 2)...")
    generate_kenworth_w900a_phase2.build_kenworth_w900a_complete()
except Exception as e:
    print(f"[RENDER] Building Kenworth W900A Phase 1 (Phase 2 not yet loaded: {e})...")
    generate_kenworth_w900a_phase1.build_kenworth_w900a_phase1()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead", "Ground"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Environment
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.055, 0.058, 0.065, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# 1. Overhead Strip Softbox (Spans truck length from above)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2800
top_data.shape = 'RECTANGLE'
top_data.size = 4.5
top_data.size_y = 12.0
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -0.3, 7.2)
bpy.context.scene.collection.objects.link(top_obj)

# 2. Key Light (Warm 45-degree Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2400
key_data.size = 7.0
key_data.color = (1.0, 0.98, 0.94)
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (9.5, 9.0, 5.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# 3. Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1600
fill_data.size = 7.0
fill_data.color = (0.93, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-9.5, 7.5, 5.2)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# 4. Low Front Bounce Fill (Illuminates Texas bumper, radiator grille & steering axle)
front_data = bpy.data.lights.new(name="Assessment_FrontBounce", type='AREA')
front_data.energy = 850
front_data.size = 5.0
front_data.color = (1.0, 0.99, 0.98)
front_obj = bpy.data.objects.new("Assessment_FrontBounce", front_data)
front_obj.location = (0.0, 8.8, 1.2)
front_obj.rotation_euler = Euler((math.radians(-15), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(front_obj)

# 5. Rear Softbox (Illuminates tandem axles, headache rack & catwalk)
rear_data = bpy.data.lights.new(name="Assessment_RearSoftbox", type='AREA')
rear_data.energy = 1400
rear_data.size = 6.0
rear_data.color = (0.96, 0.97, 1.0)
rear_obj = bpy.data.objects.new("Assessment_RearSoftbox", rear_data)
rear_obj.location = (8.0, -8.5, 4.2)
rear_obj.rotation_euler = Euler((math.radians(40), math.radians(-15), math.radians(135)), 'XYZ')
bpy.context.scene.collection.objects.link(rear_obj)

# 6. Rim Sun Light (Catches top of stacks, horns & sleeper roof)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 7.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -9.5, 6.5)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# 7. Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=70, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.022, 0.024, 0.028, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.20
    g_bsdf.inputs["Roughness"].default_value = 0.14
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 0.85
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 0.85
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

# Angle definitions for 1974 Kenworth W900A (L=8.10m, W=2.50m, H=3.90m)
angles = [
    ("kenworth_w900a_1970s_front_three_quarter", (8.5,  9.5, 2.8), (0.0,  1.2, 1.8), 45.0),
    ("kenworth_w900a_1970s_rear_three_quarter",  (9.0, -8.5, 3.0), (0.0, -1.8, 1.8), 45.0),
    ("kenworth_w900a_1970s_side_profile",        (13.0, -0.3, 2.0), (0.0, -0.3, 1.8), 45.0),
    ("kenworth_w900a_1970s_front_elevation",     (0.0, 10.5, 2.0), (0.0,  1.5, 1.8), 50.0),
    ("kenworth_w900a_1970s_rear_elevation",      (0.0, -10.5, 2.0), (0.0, -2.0, 1.8), 50.0),
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

print("\n[COMPLETE] All 5 Kenworth W900A assessment views rendered successfully.")
