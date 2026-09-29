"""
=============================================================================
RENDER MASERATI MC20 (2020s COUPE) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the exported Maserati MC20 GLB:
1. Front 3/4 Hero (Bianco Audace matte finish, carbon splitter, Birdcage wheels, Blu Infinito calipers)
2. Rear 3/4 (Polycarbonate engine cover with Trident louvers, high dual exhaust, carbon diffuser)
3. Side Profile (Sculptural waist tuck, butterfly door shutlines, low-slung silhouette)
4. Front Elevation (Wide Trident grille mouth with 3D chrome emblem, vertical LED headlamps)
5. Rear Elevation (Horizontal 3D ribbon taillamps, high exhaust cannons, carbon diffuser strakes)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

# 1. Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for b in [bpy.data.meshes, bpy.data.materials, bpy.data.textures,
          bpy.data.images, bpy.data.cameras, bpy.data.lights]:
    for item in list(b):
        b.remove(item, do_unlink=True)

# 2. Import the actual exported GLB to verify the exact asset
glb_path = r"e:\Car_Automation\public\models\vehicles\coupe\2020s\vehicle.glb"
print(f"Importing GLB for assessment: {glb_path}")
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide all semantic hitboxes so they don't occlude beauty rendering
for obj in list(bpy.context.scene.objects):
    if "HITBOX" in obj.name.upper():
        obj.hide_render = True
        obj.hide_viewport = True

OUTPUT_DIR = r"e:\Car_Automation\assets\screenshots\mc20_assessment"
os.makedirs(OUTPUT_DIR, exist_ok=True)
ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\505b8839-d9ba-4002-8d92-080df0ec466a"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Studio World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.030, 0.032, 0.038, 1.0)
    bg_node.inputs["Strength"].default_value = 0.80

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2700
top_data.shape = 'RECTANGLE'
top_data.size = 2.8
top_data.size_y = 6.5
top_data.color = (0.98, 0.99, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Crisp Neutral Key for Bianco Audace Matte White & Twill Carbon)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2500
key_data.size = 5.2
key_data.color = (1.0, 1.0, 1.0)
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.4, 3.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Subtle Azure Tint for Blu Infinito & Bianco Pearl highlights)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1600
fill_data.size = 5.0
fill_data.color = (0.94, 0.97, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 3.6, 2.8)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on Rear Decklid, Trident Engine Cover & Diffuser)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 9.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.2, 3.2)
rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=35, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.012, 0.014, 0.018, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.45
    g_bsdf.inputs["Roughness"].default_value = 0.20
ground_obj.data.materials.append(mat_ground)

# Render Configuration
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.film_transparent = False

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 50.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

views = [
    # 1. Front 3/4 Dynamic Hero Stance
    ("mc20_1_front_34", Vector((4.60, 4.80, 1.55)), Vector((0.0, 0.35, 0.55))),
    # 2. Rear 3/4 Engine Cover Trident & Exhaust
    ("mc20_2_rear_34", Vector((-4.50, -4.60, 1.55)), Vector((0.0, -0.55, 0.58))),
    # 3. Side Profile Silhouette
    ("mc20_3_side", Vector((5.50, 0.00, 1.22)), Vector((0.0, 0.0, 0.58))),
    # 4. Front Elevation (Trident Mouth, Grille, Vertical LEDs)
    ("mc20_4_front", Vector((0.00, 5.20, 1.10)), Vector((0.0, 1.20, 0.55))),
    # 5. Rear Elevation (Horizontal 3D Ribbon Lights & Dual High Exhaust Cannons)
    ("mc20_5_rear", Vector((0.00, -5.20, 1.12)), Vector((0.0, -1.20, 0.58))),
]

for name, cam_pos, target_pos in views:
    cam_obj.location = cam_pos
    dir_vec = target_pos - cam_pos
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    scene.render.filepath = out_path
    print(f"Rendering: {name} -> {out_path}")
    bpy.ops.render.render(write_still=True)
    print(f"✅ Saved: {out_path}")
    import shutil
    shutil.copy2(out_path, os.path.join(ARTIFACTS_DIR, f"{name}.png"))

print("=============================================================================")
print("ALL 5 MASERATI MC20 ASSESSMENT VIEWS RENDERED SUCCESSFULLY FROM GLB!")
print("=============================================================================")
