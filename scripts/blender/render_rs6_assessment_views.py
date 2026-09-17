"""
=============================================================================
RENDER AUDI RS6 SEDAN (C6) 2000s ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio assessment shots for the 2000s Sedan flagship:
1. Front 3/4 Hero (Singleframe grille, 4 rings, 10-LED DRLs, wide Quattro blisters)
2. Rear 3/4 (Dual oval RS exhausts, ducktail decklid, ribbon taillights)
3. Side Profile (Widebody Quattro blister arches, Tornado crease, 20" wheels)
4. Front Elevation (Singleframe trapezoid grille, intercooler scoops, LED DRLs)
5. Rear Elevation (Dual giant oval chrome RS exhaust tips, diffuser, 4 rings)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# 1. Build Audi RS6 C6 model in the current scene
import sys
gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)
from generate_audi_rs6_c6_sedan import build_audi_rs6_c6

build_audi_rs6_c6()

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

# Key Light
key_data = bpy.data.lights.new("Assessment_KeyLight", 'AREA')
key_data.energy = 1800
key_data.size = 7.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.5, 5.5, 5.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light
fill_data = bpy.data.lights.new("Assessment_FillLight", 'AREA')
fill_data.energy = 1000
fill_data.size = 7.0
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.5, 4.2, 4.2)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light
rim_data = bpy.data.lights.new("Assessment_RimLight", 'SUN')
rim_data.energy = 4.8
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.8, 4.2)
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

# Balanced camera locations for Audi RS6 Sedan (C6) (L=4.928m, W=1.889m, H=1.456m)
angles = [
    ("rs6_front_three_quarter", (5.5, 5.5, 1.70), (0.0, 0.1, 0.70), 50.0),
    ("rs6_rear_three_quarter", (5.5, -5.5, 1.70), (0.0, -0.1, 0.70), 50.0),
    ("rs6_side_profile", (7.4, 0.0, 0.85), (0.0, 0.0, 0.70), 58.0),
    ("rs6_front_elevation", (0.0, 6.5, 0.85), (0.0, 0.2, 0.70), 52.0),
    ("rs6_rear_elevation", (0.0, -6.5, 0.85), (0.0, -0.2, 0.70), 52.0),
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

print("[COMPLETE] All 5 Audi RS6 Sedan (C6) assessment views rendered successfully.")
