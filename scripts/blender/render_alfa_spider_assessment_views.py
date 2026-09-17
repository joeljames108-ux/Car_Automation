"""
=============================================================================
RENDER ALFA ROMEO SPIDER VELOCE PHASE 1 & 2 ASSESSMENT VIEWS
=============================================================================
Renders 5 standard automotive validation angles:
1. Front 3/4 Hero (Scudetto, hooded headlamps, curved splitters, Pininfarina waistline)
2. Rear 3/4 (Coda Tronca Kamm transom, rear quarter flares, Campagnolo Turbina wheels)
3. Side Profile (Classic Italian roadster proportions, folded convertible top, 14" Turbinas)
4. Front Elevation (Heart grille aperture, chrome bumperettes, low raked windshield)
5. Rear Elevation (Truncated vertical Kamm tail, dual exhaust tips, horizontal taillights)
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

# Try phase 2 if available, else phase 1
if "generate_alfa_romeo_spider_veloce_phase2" in sys.modules:
    del sys.modules["generate_alfa_romeo_spider_veloce_phase2"]
if "generate_alfa_romeo_spider_veloce_phase1" in sys.modules:
    del sys.modules["generate_alfa_romeo_spider_veloce_phase1"]

try:
    import generate_alfa_romeo_spider_veloce_phase2
    print("[RENDER] Found Phase 2 generator. Executing master complete build...")
    generate_alfa_romeo_spider_veloce_phase2.build_alfa_spider_master_complete()
except ImportError:
    print("[RENDER] Phase 2 generator not found. Executing Phase 1 build...")
    import generate_alfa_romeo_spider_veloce_phase1
    # Phase 1 runs on import or we can call build if structured

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\cd1cdf13-8e18-4ff9-a473-58c1a7ca5714"
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
    bg_node.inputs["Color"].default_value = (0.04, 0.042, 0.048, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2400
top_data.shape = 'RECTANGLE'
top_data.size = 2.4
top_data.size_y = 5.8
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 3.8)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Classic Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2200
key_data.size = 5.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.5, 4.2, 3.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1300
fill_data.size = 5.0
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.5, 3.8, 3.0)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Coda Tronca transom and roof edge highlight)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 7.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.5, 3.0)
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
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.017, 0.020, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.40
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

# Angle definitions for Alfa Romeo Spider (L=4.120m, W=1.630m, H=1.290m)
angles = [
    ("alfa_spider_front_three_quarter", (4.2,  4.5, 1.35), (0.0,  0.15, 0.55), 50.0),
    ("alfa_spider_rear_three_quarter",  (4.2, -4.5, 1.35), (0.0, -0.15, 0.55), 50.0),
    ("alfa_spider_side_profile",        (5.4,  0.0, 0.70), (0.0,  0.00, 0.55), 50.0),
    ("alfa_spider_front_elevation",     (0.0,  4.8, 0.65), (0.0,  0.20, 0.55), 50.0),
    ("alfa_spider_rear_elevation",      (0.0, -4.8, 0.65), (0.0, -0.20, 0.55), 50.0),
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

print("[COMPLETE] All 5 Alfa Romeo Spider Veloce assessment views rendered successfully.")
