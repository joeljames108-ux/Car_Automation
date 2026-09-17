"""
=============================================================================
RENDER CIVIC ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated 2020s Honda Civic Sedan:
1. Front 3/4 Hero (Isometric/Perspective dynamic angle)
2. Rear 3/4 Fastback & Ducktail
3. Side Profile (Silhouette, wheelbase, beltline, stance)
4. Front Elevation (Upper/lower honeycomb grille, inverted L DRL optics)
5. Rear Elevation (Wrap-around L taillights, diffuser)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

# 1. Build Honda Civic model in current scene
gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)
from generate_honda_civic_sedan import build_honda_civic_sedan_master, export_glb, PUBLIC_TARGET, PUBLIC_CAR_TARGET, EXPORTS_DIR

build_honda_civic_sedan_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 2. Clean previous cameras/lights
for obj in list(bpy.data.objects):
    if "Studio" in obj.name or "Assessment" in obj.name or "Light" in obj.name or "KeyLight" in obj.name or "FillLight" in obj.name or "RimLight" in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# 3. Setup World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Creates rich specular reflections along waistline and roof)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2400
top_data.shape = 'RECTANGLE'
top_data.size = 2.6
top_data.size_y = 7.2
top_data.color = (1.0, 0.98, 0.95)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2000
key_data.size = 6.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.2, 5.0, 3.8)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1200
fill_data.size = 6.0
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.2, 4.0, 3.5)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Haunches & Fastback C-Pillar Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 6.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.5, 3.5)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Floor (Studio Showroom)
bpy.ops.mesh.primitive_plane_add(size=35, location=(0, 0, 0))
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
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Angle definitions for Honda Civic Sedan (L=4.674m, W=1.801m, H=1.415m):
angles = [
    ("civic_front_three_quarter", (5.2, 5.2, 1.65), (0.0, 0.15, 0.65), 50.0),
    ("civic_rear_three_quarter",  (5.2, -5.2, 1.65), (0.0, -0.15, 0.65), 50.0),
    ("civic_side_profile",        (7.0, 0.0, 0.80),  (0.0, 0.0, 0.68), 55.0),
    ("civic_front_elevation",     (0.0, 6.0, 0.80),  (0.0, 0.20, 0.65), 50.0),
    ("civic_rear_elevation",      (0.0, -6.0, 0.80), (0.0, -0.20, 0.65), 50.0),
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

print("[COMPLETE] All 5 Honda Civic Sedan assessment views rendered successfully.")
