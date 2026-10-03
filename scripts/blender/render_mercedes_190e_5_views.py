"""
=============================================================================
RENDER MERCEDES-BENZ 190E 2.3-16 COSWORTH (1980s SEDAN) 5-VIEW BEAUTY SUITE
=============================================================================
Renders 5 canonical Class-A automotive validation views of the certified
100.0% Grade A Mercedes-Benz 190E 2.3-16 Cosworth:
1. Front 3/4 Hero (Wedge profile, Gullideckel wheels, chrome grille, standing star, chin air dam)
2. Rear 3/4 (Cosworth pedestal wing, Barényi 5-flute taillights, DTM blister arches, dual exhaust)
3. Side Profile (Bruno Sacco wedge silhouette, Sacco-Bretter cladding, 15-hole alloys)
4. Front Elevation (Classic raked radiator, Bosch headlamps, fog lights, lower splitter)
5. Rear Elevation (Aerodynamic decklid wing, Barényi ribbed taillights, dual exhaust cannons)
=============================================================================
"""

import bpy
import math
import os
import shutil
from mathutils import Vector, Euler

CONVERSATION_ID = "478c931e-36b1-4ebf-bfba-261498949c7c"
ARTIFACTS_DIR = os.path.join(os.path.expanduser("~"), ".gemini", "antigravity-ide", "brain", CONVERSATION_ID)
PROJECT_DIR = r"E:\Car_Automation"
SCREENSHOTS_DIR = os.path.join(PROJECT_DIR, "assets", "screenshots", "mercedes_190e")
GLB_PATH = os.path.join(PROJECT_DIR, "public", "models", "vehicles", "sedan", "1980s", "vehicle.glb")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# 1. Clean scene completely
if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)
for mesh in list(bpy.data.meshes):
    bpy.data.meshes.remove(mesh)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat)

# 2. Import Master GLB
print(f"[RENDER] Importing vehicle GLB: {GLB_PATH}")
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

# Set rest frame (closed doors, neutral steering)
bpy.context.scene.frame_set(0)

# Hide all HITBOX collision hulls from render and viewport
for o in bpy.context.scene.objects:
    if "HITBOX" in o.name:
        o.hide_render = True
        o.hide_viewport = True
        o.hide_set(True)

# 3. Studio Lighting & Environment
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.035, 0.038, 0.045, 1.0)
    bg_node.inputs["Strength"].default_value = 0.80

# Overhead Softbox
top_data = bpy.data.lights.new(name="Studio_Overhead", type='AREA')
top_data.energy = 4200
top_data.shape = 'RECTANGLE'
top_data.size = 3.6
top_data.size_y = 8.5
top_data.color = (0.98, 0.99, 1.0)
top_obj = bpy.data.objects.new("Studio_Overhead", top_data)
top_obj.location = (0.0, -1.35, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light
key_data = bpy.data.lights.new(name="Studio_KeyLight", type='AREA')
key_data.energy = 2400
key_data.shape = 'RECTANGLE'
key_data.size = 4.0
key_data.size_y = 4.0
key_data.color = (1.0, 0.98, 0.95)
key_obj = bpy.data.objects.new("Studio_KeyLight", key_data)
key_obj.location = (4.5, 3.0, 3.4)
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light
fill_data = bpy.data.lights.new(name="Studio_FillLight", type='AREA')
fill_data.energy = 1200
fill_data.shape = 'RECTANGLE'
fill_data.size = 5.0
fill_data.size_y = 5.0
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Studio_FillLight", fill_data)
fill_obj.location = (-4.5, 2.2, 2.8)
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent from behind vehicle)
rim_data = bpy.data.lights.new(name="Studio_RimLight", type='AREA')
rim_data.energy = 1600
rim_data.shape = 'RECTANGLE'
rim_data.size = 4.0
rim_data.size_y = 4.0
rim_data.color = (0.95, 0.96, 1.0)
rim_obj = bpy.data.objects.new("Studio_RimLight", rim_data)
rim_obj.location = (-3.2, -5.5, 2.8)
bpy.context.scene.collection.objects.link(rim_obj)

# Studio Ground Floor with subtle dark reflection
bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, -1.35, 0))
floor_obj = bpy.context.active_object
floor_obj.name = "Studio_Floor"
floor_mat = bpy.data.materials.new("Studio_Floor_Mat")
floor_mat.use_nodes = True
floor_bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
if floor_bsdf:
    floor_bsdf.inputs["Base Color"].default_value = (0.025, 0.026, 0.030, 1.0)
    floor_bsdf.inputs["Roughness"].default_value = 0.38
    if "Metallic" in floor_bsdf.inputs:
        floor_bsdf.inputs["Metallic"].default_value = 0.15
if floor_obj.data.materials:
    floor_obj.data.materials[0] = floor_mat
else:
    floor_obj.data.materials.append(floor_mat)

# 4. Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.clip_start = 0.1
cam_data.clip_end = 150.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# 5. Render Engine Configuration
scene = bpy.context.scene
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]:
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
elif hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]:
    scene.render.engine = 'BLENDER_EEVEE'
else:
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 64

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

# Canonical 5 Assessment Views: (Name, Location, Target, Lens)
# Vehicle centroid is at X = 0.0, Y = -1.350, Z = 0.68
angles = [
    ("mercedes_190e_front_three_quarter", (3.8, 2.5, 1.35), (0.0, -1.25, 0.62), 50.0),
    ("mercedes_190e_rear_three_quarter", (3.8, -5.2, 1.35), (0.0, -1.40, 0.62), 50.0),
    ("mercedes_190e_side_profile", (6.2, -1.35, 1.05), (0.0, -1.35, 0.65), 65.0),
    ("mercedes_190e_front_elevation", (0.0, 4.6, 0.95), (0.0, -0.20, 0.58), 60.0),
    ("mercedes_190e_rear_elevation", (0.0, -7.2, 0.95), (0.0, -2.40, 0.58), 60.0),
]

def render_suite():
    for name, loc, target, lens in angles:
        cam_obj.location = Vector(loc)
        cam_data.lens = lens
        look_at(cam_obj, target)

        # 1. Save to project screenshots
        proj_path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
        scene.render.filepath = proj_path
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {name} -> {proj_path}")

        # 2. Mirror to brain artifacts directory
        art_path = os.path.join(ARTIFACTS_DIR, f"{name}.png")
        shutil.copy2(proj_path, art_path)
        print(f"[COPIED] -> {art_path}")

    print("[SUCCESS] All 5 Mercedes-Benz 190E 2.3-16 beauty views rendered and archived.")

if __name__ == "__main__":
    render_suite()
