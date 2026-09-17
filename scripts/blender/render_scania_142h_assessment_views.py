"""
=============================================================================
RENDER SCANIA 142H V8 6x4 (1980s HEAVY TRUCK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio validation shots of the procedural Scania 142H V8:
1. Front 3/4 Hero (CR19 Sleeper, Swedish Rally Red, 5-slat white grille, V8 badge, Hadley horns)
2. Rear 3/4 (Tandem planetary hub reduction bogie, Jost 5th wheel, catwalk, 3-piece mudguards)
3. Side Profile (6x4 proportion, 400L D-tank, battery box, stepped stirrups, aerodynamic wings)
4. Front Elevation (Three-wiper pantograph, H4 lamps with wipers, corner air deflectors, sunvisor)
5. Rear Elevation (ECE R58 underrun bar, 6-chamber Euro taillights, ECE 70 chevron marker plates)
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

# Check if Phase 2 generator is available, else run Phase 1
try:
    import generate_scania_142h_phase2
    importlib.reload(generate_scania_142h_phase2)
    print("[RENDER] Building Scania 142H Complete (Phase 1 + Phase 2)...")
    generate_scania_142h_phase2.build_scania_142h_complete()
except Exception as e:
    print(f"[RENDER] Building Scania 142H Phase 1 (Phase 2 not yet loaded: {e})...")
    import generate_scania_142h_phase1
    importlib.reload(generate_scania_142h_phase1)
    generate_scania_142h_phase1.build_scania_142h_phase1()

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

# 1. Overhead Heavy Softbox (Z = 6.2 m)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 5000
top_data.shape = 'RECTANGLE'
top_data.size = 3.6
top_data.size_y = 8.5
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -0.2, 6.2)
bpy.context.scene.collection.objects.link(top_obj)

# 2. Key Light (High-Output Commercial Vehicle Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 4200
key_data.size = 6.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (6.8, 6.5, 4.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# 3. Fill Light (Cool Diffuse Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 2600
fill_data.size = 6.5
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-6.8, 5.5, 3.8)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# 4. Rim Light (Aerofoil, Roofline, and Tandem Mudguard Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 8.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -7.5, 4.5)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# 5. Low Chassis & Front Bumper Bounce Light
bounce_data = bpy.data.lights.new(name="Assessment_GroundBounce", type='AREA')
bounce_data.energy = 1600
bounce_data.size = 4.0
bounce_data.color = (0.95, 0.95, 0.95)
bounce_obj = bpy.data.objects.new("Assessment_GroundBounce", bounce_data)
bounce_obj.location = (0.0, 4.5, 0.6)
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

# Angle definitions calibrated for Scania 142H (L=5.9m, W=2.5m, H=3.85m)
angles = [
    ("scania_142h_front_three_quarter", (7.4,  7.6, 2.5), (0.0,  0.50, 1.85), 45.0),
    ("scania_142h_rear_three_quarter",  (7.6, -7.0, 2.4), (0.0, -1.10, 1.70), 45.0),
    ("scania_142h_side_profile",        (9.4, -0.25, 2.1), (0.0, -0.25, 1.85), 45.0),
    ("scania_142h_front_elevation",     (0.0,  8.5, 2.1), (0.0,  1.80, 1.95), 45.0),
    ("scania_142h_rear_elevation",      (0.0, -8.5, 1.9), (0.0, -1.50, 1.70), 45.0),
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

print("[COMPLETE] All 5 Scania 142H V8 assessment views rendered successfully.")
