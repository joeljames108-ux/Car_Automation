"""
=============================================================================
RENDER AUDI GRANDSPHERE CONCEPT ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Audi Grandsphere Concept:
1. Front 3/4 Hero (Monolithic hood, illuminated Singleframe mask, digital eye optics)
2. Rear 3/4 Boat-Tail (Continuous holographic Carmine Red laser lightblade, tapering Kamm diffuser)
3. Side Profile (Low-slung monolithic silhouette, 3,190mm wheelbase, 23" turbine wheels)
4. Front Elevation (Illuminated four rings, digital matrix projection eyes, carbon chin splitter)
5. Rear Elevation (Carmine Red rings, full-width laser ribbon, dual venturi diffusers)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
import shutil
import importlib
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_audi_grandsphere_master_cad
importlib.reload(generate_audi_grandsphere_master_cad)
generate_audi_grandsphere_master_cad.generate_audi_grandsphere_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\0a5342a6-a583-4086-aab4-20cc4428086b"
SCREENSHOTS_DIR = r"E:\Car_Automation\assets\screenshots\audi_grandsphere"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.045, 0.055, 1.0)
    bg_node.inputs["Strength"].default_value = 0.80

# Overhead Strip Softbox (Controlled soft specular highlight along the canopy)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 850
top_data.shape = 'RECTANGLE'
top_data.size = 3.0
top_data.size_y = 8.5
top_data.color = (0.95, 0.97, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -1.595, 4.8)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Cool Tech Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2200
key_data.size = 7.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.8, 3.8, 4.0)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Deep Indigo/Teal Fill for futuristic concept feel)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1200
fill_data.size = 7.0
fill_data.color = (0.90, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.8, 2.8, 3.8)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Speed-tail Kamm contour accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 7.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -8.5, 3.8)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Ceramic Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=45, location=(0, -1.595, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.018, 0.022, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.40
    g_bsdf.inputs["Roughness"].default_value = 0.06
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 1.0
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 1.0
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

# Angle definitions calibrated for standard axle coordinates (L=5.350m, Y: +1.080m to -4.270m, Center Y = -1.595m)
angles = [
    ("grandsphere_front_three_quarter", (5.8,  3.8, 1.70), (0.0, -1.30, 0.68), 50.0),
    ("grandsphere_rear_three_quarter",  (5.8, -7.0, 1.70), (0.0, -1.80, 0.68), 50.0),
    ("grandsphere_side_profile",        (8.2, -1.595, 0.85), (0.0, -1.595, 0.70), 52.0),
    ("grandsphere_front_elevation",     (0.0,  6.2, 0.80), (0.0,  0.20, 0.65), 50.0),
    ("grandsphere_rear_elevation",      (0.0, -9.2, 0.80), (0.0, -3.20, 0.65), 50.0),
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
    copy_file = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    shutil.copy2(out_file, copy_file)
    print(f"[RENDERED] {name} -> {out_file} & {copy_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Audi Grandsphere Concept assessment views rendered successfully.")
