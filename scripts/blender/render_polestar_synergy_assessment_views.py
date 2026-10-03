"""
=============================================================================
RENDER POLESTAR SYNERGY CONCEPT (FUTURE COUPE) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the exported Polestar Synergy GLB:
1. Front 3/4 Hero (Satin Pearl White, hammerhead splitter, 22" turbine wheels, cyan laser blades)
2. Rear 3/4 (Full-width floating razor lightblade, Venturi diffuser tunnels, muscular sponsons)
3. Side Profile (Ultra-low 1,070mm silhouette, flow-through pontoon bypass tunnels, canopy rake)
4. Front Elevation (Dual blade laser headlights, LiDAR sensor pod, front air curtain channels)
5. Rear Elevation (Continuous 2,050mm ruby lightblade edge, 6 diffuser fins, central safety strobe)
=============================================================================
"""

import bpy
import math
import os
import sys
import shutil
from mathutils import Vector, Euler

# 1. Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for b in [bpy.data.meshes, bpy.data.materials, bpy.data.textures,
          bpy.data.images, bpy.data.cameras, bpy.data.lights]:
    for item in list(b):
        b.remove(item, do_unlink=True)

# 2. Import the actual exported GLB to verify the exact asset
glb_path = r"e:\Car_Automation\public\models\vehicles\coupe\future\vehicle.glb"
print(f"Importing GLB for assessment: {glb_path}")
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide all semantic hitboxes so they don't occlude beauty rendering
for obj in list(bpy.context.scene.objects):
    if "HITBOX" in obj.name.upper():
        obj.hide_render = True
        obj.hide_viewport = True

OUTPUT_DIR = r"e:\Car_Automation\assets\screenshots\polestar_synergy_assessment"
os.makedirs(OUTPUT_DIR, exist_ok=True)
ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\fbb2023f-5dad-483d-9587-0dee9ed24815"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Studio World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.025, 0.027, 0.032, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2800
top_data.shape = 'RECTANGLE'
top_data.size = 2.6
top_data.size_y = 6.8
top_data.color = (0.96, 0.98, 1.0)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -1.2, 4.2)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Crisp Neutral Key for Satin White & Matte Carbon)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2600
key_data.size = 5.4
key_data.color = (1.0, 1.0, 1.0)
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.2, 3.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Subtle Cool Ice Tint highlighting Swedish Gold & Cyan Lasers)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1600
fill_data.size = 5.2
fill_data.color = (0.92, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 3.4, 2.8)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on Rear Decklid, Floating Lightblade & Diffuser)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 8.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.2, 3.0)
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
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.016, 0.019, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.50
    g_bsdf.inputs["Roughness"].default_value = 0.20
ground_obj.data.materials.append(mat_ground)

# Render Configuration (Eevee / Eevee Next)
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
    ("polestar_synergy_1_front_34.png", Vector((-4.5,  4.2, 1.55)), Vector((0.0, -0.40, 0.48)), 48.0),
    # 2. Rear 3/4 Dynamic (Floating Razor Lightblade & Diffuser)
    ("polestar_synergy_2_rear_34.png",  Vector((-4.5, -4.5, 1.55)), Vector((0.0, -2.40, 0.52)), 48.0),
    # 3. Direct Side Profile (Ultra-Low Silhouette & Bypass Channels)
    ("polestar_synergy_3_side.png",     Vector((-5.6, -1.3, 0.85)), Vector((0.0, -1.30, 0.48)), 52.0),
    # 4. Direct Front Fascia (Dual Blade Lasers & Hammerhead Nose)
    ("polestar_synergy_4_front.png",    Vector(( 0.0,  4.6, 0.75)), Vector((0.0,  0.80, 0.38)), 48.0),
    # 5. Direct Rear Fascia (Continuous Ruby Lightblade & 6-Fin Diffuser)
    ("polestar_synergy_5_rear.png",     Vector(( 0.0, -4.8, 0.80)), Vector((0.0, -3.40, 0.52)), 48.0),
]

rendered_files = []

for filename, pos, target, flen in views:
    cam_data.lens = flen
    cam_obj.location = pos
    direction = target - pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(OUTPUT_DIR, filename)
    scene.render.filepath = out_path
    print(f"Rendering: {filename}...")
    bpy.ops.render.render(write_still=True)
    rendered_files.append(out_path)

    # Mirror to brain artifacts directory
    art_path = os.path.join(ARTIFACTS_DIR, filename)
    shutil.copy2(out_path, art_path)
    print(f"  ✓ Saved to {out_path} and mirrored to {art_path}")

print("=" * 80)
print("POLESTAR SYNERGY CONCEPT: ALL 5 CANONICAL VIEWS RENDERED SUCCESSFULLY:")
for rf in rendered_files:
    print(f"  IMAGE: {rf}")
print("=" * 80)
