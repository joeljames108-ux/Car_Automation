"""
=============================================================================
Cadillac Fleetwood 75 Formal Limousine (1970s) - Autonomous Visual Feedback Pipeline
Renders 5 Automotive Validation Views into Artifacts Directory
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import the Phase 54 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

import generate_cadillac_fleetwood_75_phase2

# Run complete vehicle generation and GLB export
generate_cadillac_fleetwood_75_phase2.generate_cadillac_fleetwood_75_phase2()

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
    world = bpy.data.worlds.new("Cadillac_Studio_World")
    scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.10, 0.11, 0.13, 1.0)
bg.inputs['Strength'].default_value = 1.2
out = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], out.inputs['Surface'])

# Studio Lights
def add_light(name, light_type, energy, location, rotation=None):
    light_data = bpy.data.lights.new(name=name, type=light_type)
    light_data.energy = energy
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = location
    if rotation:
        light_obj.rotation_euler = rotation
    scene.collection.objects.link(light_obj)
    return light_obj

add_light("Key_Light", 'AREA', 2600.0, (6.0, 6.2, 4.8))
add_light("Fill_Light", 'AREA', 1500.0, (-6.0, -5.0, 4.0))
add_light("Rim_Light", 'SPOT', 1900.0, (-5.0, 6.5, 3.8))
add_light("Overhead_Softbox", 'AREA', 3200.0, (0.0, 0.0, 7.0))

# Ground studio platform
bm_ground = bmesh.new()
bmesh.ops.create_grid(bm_ground, x_segments=2, y_segments=2, size=35.0)
mesh_ground = bpy.data.meshes.new("Ground_Mesh")
bm_ground.to_mesh(mesh_ground)
bm_ground.free()
obj_ground = bpy.data.objects.new("Studio_Ground", mesh_ground)
scene.collection.objects.link(obj_ground)
mat_ground = bpy.data.materials.new("Studio_Ground_Mat")
mat_ground.use_nodes = True
bsdf_g = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf_g:
    bsdf_g.inputs['Base Color'].default_value = (0.06, 0.07, 0.08, 1.0)
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
    ("cadillac_fleetwood_75_front_three_quarter", "Front 3/4 Hero (Egg-crate grille, quad rectangular headlamps, standup crest, whitewall tires, wire wheels)", (5.8, 6.2, 2.2), (0.0, 0.5, 0.7)),
    ("cadillac_fleetwood_75_rear_three_quarter", "Rear 3/4 (Padded Elk Grain vinyl roof, opera window, sail panel coach lamp, vertical blade taillights)", (5.8, -6.4, 2.2), (0.0, -0.5, 0.7)),
    ("cadillac_fleetwood_75_side_profile", "Side Profile (Monumental 6.4m slab-sided silhouette, 3.848m wheelbase, rocker spear, opera window)", (8.2, 0.0, 1.4), (0.0, 0.0, 0.8)),
    ("cadillac_fleetwood_75_front_elevation", "Front Elevation (Chrome egg-crate grille, standup hood mascot, quad headlights, 5-mph bumper overriders)", (0.0, 7.5, 1.2), (0.0, 2.8, 0.8)),
    ("cadillac_fleetwood_75_rear_elevation", "Rear Elevation (Vertical blade taillights, formal small rear window, chrome bumper with overriders)", (0.0, -7.5, 1.2), (0.0, -2.8, 0.8)),
]

artifacts_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\282c15c4-2794-4f22-a9e6-eb26884ece49"
os.makedirs(artifacts_dir, exist_ok=True)

for slug, desc, loc, tgt in views:
    print(f"[RENDER] Rendering {slug} - {desc}...")
    cam_obj.location = Vector(loc)
    point_camera(cam_obj, tgt)
    out_img = os.path.join(artifacts_dir, f"{slug}.png")
    scene.render.filepath = out_img
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {slug} -> {out_img} ({os.path.getsize(out_img)} bytes)")

print("[COMPLETE] All 5 Cadillac Fleetwood 75 assessment views rendered successfully.")
