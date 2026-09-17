"""
=============================================================================
RENDER ALFA ROMEO GIULIA QUADRIFOGLIO 2010s ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio assessment shots for the 2010s Sedan flagship:
1. Front 3/4 Hero (Scudetto shield grille, Trilobo, carbon splitter, J-blade LED DRLs)
2. Rear 3/4 (Quad staggered exhaust tips, carbon diffuser, carbon decklid spoiler)
3. Side Profile (Coke-bottle waistline, 19" 5-hole Tele-Dial wheels, clover fender badges)
4. Front Elevation (Trilobo intakes, Biscione shield, carbon extractors, bi-xenon lamps)
5. Rear Elevation (Aggressive diffuser strakes, quad tailpipes, sculpted rear haunches)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

# 1. Build Giulia Quadrifoglio model in the current scene
gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)
from generate_alfa_romeo_giulia_quadrifoglio import build_alfa_romeo_giulia_quadrifoglio

build_alfa_romeo_giulia_quadrifoglio()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 2. Clean previous cameras/lights
for obj in list(bpy.data.objects):
    if "Studio" in obj.name or "Assessment" in obj.name or "Light" in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# 3. Studio World & High-Key Three-Point Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Key Light (Warm Key)
key_data = bpy.data.lights.new("Assessment_KeyLight", 'AREA')
key_data.energy = 1900
key_data.size = 7.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.2, 5.2, 5.0)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new("Assessment_FillLight", 'AREA')
fill_data.energy = 1100
fill_data.size = 7.0
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.2, 4.0, 4.0)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Crisp Edge Highlighting for Roof & Haunches)
rim_data = bpy.data.lights.new("Assessment_RimLight", 'SUN')
rim_data.energy = 5.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.5, 4.0)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Ground Shadow Plane
bpy.ops.mesh.primitive_plane_add(size=35, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.03, 0.03, 0.035, 1.0)
    g_bsdf.inputs["Roughness"].default_value = 0.5
ground_obj.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 50.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Render Engine Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Balanced camera locations for Alfa Romeo Giulia Quadrifoglio (L=4.639m, W=1.873m, H=1.426m)
angles = [
    ("giulia_front_three_quarter", (5.2, 5.2, 1.65), (0.0, 0.15, 0.68), 50.0),
    ("giulia_rear_three_quarter",  (5.2, -5.2, 1.65), (0.0, -0.15, 0.68), 50.0),
    ("giulia_side_profile",        (7.0, 0.0, 0.80),  (0.0, 0.0, 0.68), 55.0),
    ("giulia_front_elevation",     (0.0, 6.0, 0.80),  (0.0, 0.20, 0.68), 50.0),
    ("giulia_rear_elevation",      (0.0, -6.0, 0.80), (0.0, -0.20, 0.68), 50.0),
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

print("[COMPLETE] All 5 Alfa Romeo Giulia Quadrifoglio assessment views rendered successfully.")
