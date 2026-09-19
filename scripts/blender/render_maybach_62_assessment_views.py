"""
=============================================================================
Maybach 62 (W240) - Autonomous Visual Feedback & Camera Assessment Pipeline
Renders 5 Automotive Validation Views into Artifacts Directory
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import the Phase 46 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

import generate_maybach_62_phase2

# Run complete vehicle generation in scene
generate_maybach_62_phase2.generate_maybach_62_complete()

# Setup Studio Lighting and Ground Plane
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
if hasattr(scene, 'eevee'):
    if hasattr(scene.eevee, 'use_gtao'):
        scene.eevee.use_gtao = True
    if hasattr(scene.eevee, 'use_bloom'):
        scene.eevee.use_bloom = True
    if hasattr(scene.eevee, 'use_ssr'):
        scene.eevee.use_ssr = True

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

world = scene.world
if world is None:
    world = bpy.data.worlds.new("Maybach_Studio_World")
    scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.12, 0.13, 0.15, 1.0)
bg.inputs['Strength'].default_value = 1.2
out = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], out.inputs['Surface'])

# Key, Fill, Rim & Overhead Softbox Lights
def add_light(name, light_type, energy, location, rotation=None):
    light_data = bpy.data.lights.new(name=name, type=light_type)
    light_data.energy = energy
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = location
    if rotation:
        light_obj.rotation_euler = rotation
    scene.collection.objects.link(light_obj)
    return light_obj

add_light("Key_Light", 'AREA', 2200.0, (5.5, 6.0, 4.5))
add_light("Fill_Light", 'AREA', 1200.0, (-5.5, -4.5, 3.8))
add_light("Rim_Light", 'SPOT', 1600.0, (-4.5, 6.5, 3.5))
add_light("Overhead_Softbox", 'AREA', 2800.0, (0.0, 0.0, 6.0))

# Ground studio platform
bm_ground = bmesh.new()
bmesh.ops.create_grid(bm_ground, x_segments=2, y_segments=2, size=30.0)
mesh_ground = bpy.data.meshes.new("Ground_Mesh")
bm_ground.to_mesh(mesh_ground)
bm_ground.free()
obj_ground = bpy.data.objects.new("Studio_Ground", mesh_ground)
scene.collection.objects.link(obj_ground)
mat_ground = bpy.data.materials.new("Studio_Ground_Mat")
mat_ground.use_nodes = True
bsdf_g = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf_g:
    bsdf_g.inputs['Base Color'].default_value = (0.08, 0.09, 0.10, 1.0)
    bsdf_g.inputs['Roughness'].default_value = 0.35
obj_ground.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("Assessment_Camera")
cam_data.lens = 50
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def point_camera(cam, target):
    loc = cam.location
    direction = Vector(target) - loc
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

views = [
    ("maybach_62_front_three_quarter", "Front 3/4 Hero (Cathedral waterfall grille, standing mascot, 19-inch alloy wheels)", (5.6, 6.2, 2.6), (0.0, 0.4, 0.7)),
    ("maybach_62_rear_three_quarter", "Rear 3/4 (Swept C-pillars, full-width LED taillight strip, two-tone coachwork)", (5.8, -6.4, 2.6), (0.0, -0.4, 0.7)),
    ("maybach_62_side_profile", "Side Profile (6.16m monolithic limousine silhouette, electrochromic roof, gold coachline)", (7.6, 0.0, 1.4), (0.0, 0.0, 0.8)),
    ("maybach_62_front_elevation", "Front Elevation (Cathedral chrome grille, standing Double-M mascot, bi-xenon headlights)", (0.0, 7.4, 1.2), (0.0, 2.8, 0.8)),
    ("maybach_62_rear_elevation", "Rear Elevation (Full-width ruby LED taillamp band, chrome garnish, trapezoidal tips)", (0.0, -7.4, 1.2), (0.0, -2.8, 0.8)),
]

artifacts_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\eae4f157-86a5-4bd2-a22c-b6d21ff59614"
os.makedirs(artifacts_dir, exist_ok=True)

for slug, desc, loc, tgt in views:
    print(f"[RENDER] Rendering {slug} - {desc}...")
    cam_obj.location = Vector(loc)
    point_camera(cam_obj, tgt)
    out_img = os.path.join(artifacts_dir, f"{slug}.png")
    scene.render.filepath = out_img
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {slug} -> {out_img} ({os.path.getsize(out_img)} bytes)")

print("[COMPLETE] All 5 Maybach 62 assessment views rendered successfully.")
