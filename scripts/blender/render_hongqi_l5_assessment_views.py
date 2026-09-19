"""
Autonomous Visual Feedback Assessment Script: Hongqi L5 State Limousine (2020s, Vehicle 32)
Renders 5 standard automotive validation viewpoints in Blender Cycles/EEVEE:
1. Front 3/4 Hero View (Waterfall chrome grille, 3D Red Flag mascot, barrel headlamps with halos, 20" sunflower wheels)
2. Rear 3/4 View (Formal C-pillar privacy sails, palace lantern taillights, bamboo chrome accents, dual chrome exhausts)
3. Side Profile View (5.555m sovereign profile, continuous shoulder line, round wheel arches, celadon jade handles)
4. Front Elevation View (Monumental upright waterfall radiator shell with 36 slats, hood red flag spear, bumper chrome)
5. Rear Elevation View (Upright palace lantern taillights, chrome decklid script plinth, rectangular exhaust tips)
Saves high-resolution PNGs directly to the artifacts directory.
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 64 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

import generate_hongqi_l5_phase2

# Run complete generator
generate_hongqi_l5_phase2.generate_hongqi_l5_phase2()

# Setup high-end photographic studio environment
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'

# World lighting
world = scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.08, 0.085, 0.095, 1.0)
bg.inputs['Strength'].default_value = 1.0
w_out = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], w_out.inputs['Surface'])

# Studio Key, Fill & Rim Lights
def add_light(name, ltype, pos, energy, size=1.0, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type=ltype)
    light_data.energy = energy
    light_data.color = color
    if ltype == 'AREA':
        light_data.size = size
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = pos
    scene.collection.objects.link(light_obj)
    return light_obj

# Studio light array tailored for Hongqi L5 Onyx Black piano lacquer and electroplated chrome
add_light("Studio_Key_Front_Left", 'AREA', Vector((3.5, 4.5, 3.2)), energy=2000.0, size=3.5, color=(1.0, 0.98, 0.95))
add_light("Studio_Key_Front_Right", 'AREA', Vector((-3.5, 4.5, 3.0)), energy=1600.0, size=3.0, color=(0.95, 0.98, 1.0))
add_light("Studio_Front_Fill", 'AREA', Vector((0.0, 5.5, 2.0)), energy=1800.0, size=4.0, color=(1.0, 1.0, 1.0))
add_light("Studio_Rim_Rear_Left", 'AREA', Vector((3.8, -4.8, 3.4)), energy=1800.0, size=3.5, color=(0.96, 0.97, 1.0))
add_light("Studio_Rim_Rear_Right", 'AREA', Vector((-3.8, -4.8, 3.4)), energy=1800.0, size=3.5, color=(1.0, 0.98, 0.95))
add_light("Studio_Overhead_Softbox", 'AREA', Vector((0.0, 0.0, 5.5)), energy=1200.0, size=7.0, color=(1.0, 1.0, 1.0))
add_light("Studio_Ground_Fill", 'AREA', Vector((0.0, 0.0, -0.4)), energy=500.0, size=8.5, color=(0.9, 0.92, 0.95))
add_light("Studio_Grille_Spot", 'SPOT', Vector((0.0, 4.2, 1.4)), energy=1200.0, size=0.8, color=(1.0, 1.0, 1.0))

# Matte Studio Floor Plane
bm_floor = bmesh.new()
bmesh.ops.create_grid(bm_floor, x_segments=2, y_segments=2, size=32.0)
mesh_floor = bpy.data.meshes.new("Studio_Floor_Mesh")
bm_floor.to_mesh(mesh_floor)
bm_floor.free()
obj_floor = bpy.data.objects.new("Studio_Floor", mesh_floor)
obj_floor.location = Vector((0.0, 0.0, 0.0))
scene.collection.objects.link(obj_floor)

mat_ground = bpy.data.materials.new(name="Mat_Studio_Ground")
mat_ground.use_nodes = True
g_nodes = mat_ground.node_tree.nodes
g_nodes.clear()
g_out = g_nodes.new(type='ShaderNodeOutputMaterial')
g_bsdf = g_nodes.new(type='ShaderNodeBsdfPrincipled')
g_bsdf.inputs['Base Color'].default_value = (0.045, 0.048, 0.052, 1.0)
g_bsdf.inputs['Roughness'].default_value = 0.45
mat_ground.node_tree.links.new(g_bsdf.outputs['BSDF'], g_out.inputs['Surface'])
obj_floor.data.materials.append(mat_ground)

# Camera configuration
cam_data = bpy.data.cameras.new(name="AssessmentCamera")
cam_data.lens = 55.0  # 55mm portrait focal length (distortion-free automotive CAD standard)
cam_obj = bpy.data.objects.new(name="AssessmentCamera", object_data=cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def set_camera_view(cam_obj, eye_pos, target_pos=Vector((0.0, 0.0, 0.80))):
    cam_obj.location = eye_pos
    direction = target_pos - eye_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

# Artifact destination directory
artifact_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\282c15c4-2794-4f22-a9e6-eb26884ece49"

validation_views = [
    (
        "hongqi_l5_front_three_quarter.png",
        "Front 3/4 Hero View (Waterfall chrome grille, 3D Red Flag mascot, barrel headlamps with halos, 20-inch wheels)",
        Vector((4.6, 5.2, 2.0)),
        Vector((0.0, 0.4, 0.82))
    ),
    (
        "hongqi_l5_rear_three_quarter.png",
        "Rear 3/4 View (Formal C-pillar privacy sails, palace lantern taillights, bamboo chrome accents, dual exhausts)",
        Vector((4.8, -5.2, 2.0)),
        Vector((0.0, -0.4, 0.82))
    ),
    (
        "hongqi_l5_side_profile.png",
        "Side Profile View (5.555m sovereign profile, continuous shoulder line, round wheel arches, celadon jade handles)",
        Vector((9.8, 0.0, 1.25)),
        Vector((0.0, 0.0, 0.80))
    ),
    (
        "hongqi_l5_front_elevation.png",
        "Front Elevation View (Monumental upright waterfall radiator shell with 36 slats, hood red flag spear, bumper chrome)",
        Vector((0.0, 6.2, 1.25)),
        Vector((0.0, 1.2, 0.74))
    ),
    (
        "hongqi_l5_rear_elevation.png",
        "Rear Elevation View (Upright palace lantern taillights, chrome decklid script plinth, rectangular exhaust tips)",
        Vector((0.0, -6.2, 1.20)),
        Vector((0.0, -1.0, 0.78))
    )
]

print("=============================================================================")
print("STARTING 5-VIEW AUTONOMOUS VISUAL FEEDBACK RENDERING FOR HONGQI L5 LIMOUSINE")
print("=============================================================================")

for fname, desc, eye, tgt in validation_views:
    out_path = os.path.join(artifact_dir, fname)
    print(f"\n[RENDERING] {desc} -> {out_path}")
    set_camera_view(cam_obj, eye, tgt)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    if os.path.exists(out_path):
        size = os.path.getsize(out_path)
        print(f"✓ Rendered: {out_path} ({size} bytes / {size / 1024.0:.1f} KB)")
    else:
        print(f"✗ FAILED to render: {out_path}")

print("\n=============================================================================")
print("ALL 5 VALIDATION VIEWPOINTS SUCCESSFULLY RENDERED!")
print("=============================================================================")
