"""
=============================================================================
RENDER 2014 MERCEDES-BENZ ACTROS MP4 GIGASPACE (2010s HEAVY TRUCK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio validation shots of the procedural 2014 Actros MP4:
1. Front 3/4 Hero (15-deg raked GigaSpace cab, cascading grille, illuminated star, Boomerang DRLs, MirrorCam)
2. Rear 3/4 (Jost fifth-wheel, 3-piece mudguards, Euro LED lamps, catwalk, umbilical suzies, SCR/DPF box)
3. Side Profile (Euro 4x2 tractor stance, full aero side skirts, 650L fuel tank, AdBlue tank, collar wings)
4. Front Elevation (Cascading trapezoidal grille, glowing halo Mercedes star, ABA radar, aero sunvisor LEDs)
5. Rear Elevation (ECE 70.01 chevrons, Euro LED taillamps, ECAS air suspension, trailer pylon Gladhand couplers)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

if "generate_actros_mp4_2010s" in sys.modules:
    del sys.modules["generate_actros_mp4_2010s"]
import generate_actros_mp4_2010s
from generate_actros_mp4_2010s import safe_reset_scene, create_all_actros_materials, build_complete_actros_mp4

# 1. Reset Scene and Build Actros MP4
safe_reset_scene()
materials = create_all_actros_materials()
root = build_complete_actros_mp4(materials)

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead", "GroundBounce"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Ambient Environment
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.045, 0.05, 1.0)
    bg_node.inputs["Strength"].default_value = 0.90

# 1. Overhead Heavy Softbox (Z = 8.5 m for tall GigaSpace cab)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 7500
top_data.shape = 'RECTANGLE'
top_data.size = 6.0
top_data.size_y = 10.0
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
bpy.context.scene.collection.objects.link(top_obj)
top_obj.location = (0.0, -0.40, 8.5)
top_obj.rotation_euler = (0.0, 0.0, 0.0)

# 2. Key Light (Front Right, angled down)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 8500
key_data.shape = 'RECTANGLE'
key_data.size = 5.0
key_data.size_y = 6.0
key_data.color = (1.0, 0.97, 0.94)
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
bpy.context.scene.collection.objects.link(key_obj)
key_obj.location = (6.8, 6.2, 5.8)
key_dir = Vector((-6.8, -6.2, -3.8)).normalized()
key_obj.rotation_euler = key_dir.to_track_quat('-Z', 'Y').to_euler()

# 3. Fill Light (Front Left, soft cool ambient)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 5200
fill_data.shape = 'RECTANGLE'
fill_data.size = 5.5
fill_data.size_y = 7.0
fill_data.color = (0.92, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
bpy.context.scene.collection.objects.link(fill_obj)
fill_obj.location = (-7.2, 5.5, 4.8)
fill_dir = Vector((7.2, -5.5, -2.8)).normalized()
fill_obj.rotation_euler = fill_dir.to_track_quat('-Z', 'Y').to_euler()

# 4. Rear Rim / Hair Light (Highlights GigaSpace roof contour & catwalk)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='AREA')
rim_data.energy = 6800
rim_data.shape = 'RECTANGLE'
rim_data.size = 6.0
rim_data.size_y = 5.0
rim_data.color = (0.96, 0.98, 1.0)
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
bpy.context.scene.collection.objects.link(rim_obj)
rim_obj.location = (-4.8, -7.2, 6.2)
rim_dir = Vector((4.8, 7.2, -4.2)).normalized()
rim_obj.rotation_euler = rim_dir.to_track_quat('-Z', 'Y').to_euler()

# 5. Ground Studio Floor Bounce Plate
ground_mesh = bpy.data.meshes.new("StudioGround_Mesh")
ground_obj = bpy.data.objects.new("StudioGround", ground_mesh)
bpy.context.scene.collection.objects.link(ground_obj)

mat_ground = bpy.data.materials.new(name="Mat_StudioGround")
mat_ground.use_nodes = True
bsdf_g = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf_g:
    bsdf_g.inputs["Base Color"].default_value = (0.16, 0.17, 0.18, 1.0)
    bsdf_g.inputs["Roughness"].default_value = 0.28
    if "Metallic" in bsdf_g.inputs:
        bsdf_g.inputs["Metallic"].default_value = 0.15
ground_obj.data.materials.append(mat_ground)

# Large circular studio floor disc
bm_g = generate_actros_mp4_2010s.bmesh.new()
generate_actros_mp4_2010s.add_cylinder_to_bmesh(bm_g, (0.0, -0.40, -0.010), 22.0, 0.020, segments=48, axis='Z')
bm_g.to_mesh(ground_mesh)
bm_g.free()

# Camera setup
cam_data = bpy.data.cameras.new("Assessment_Camera")
cam_data.lens = 55.0  # 55mm focal length for true automotive perspective
cam_data.sensor_width = 36.0
cam_data.clip_start = 0.1
cam_data.clip_end = 150.0
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Render settings: High quality, fast evaluation
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
if hasattr(scene, 'eevee'):
    if hasattr(scene.eevee, 'taa_render_samples'):
        scene.eevee.taa_render_samples = 32
    if hasattr(scene.eevee, 'use_gtao'):
        scene.eevee.use_gtao = True
    if hasattr(scene.eevee, 'use_bloom'):
        scene.eevee.use_bloom = True
    if hasattr(scene.eevee, 'use_ssr'):
        scene.eevee.use_ssr = True

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

def render_camera_view(cam_pos, look_at, filename, label, lens=55.0):
    cam_data.lens = lens
    cam_obj.location = Vector(cam_pos)
    direction = (Vector(look_at) - Vector(cam_pos)).normalized()
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    
    out_path = os.path.join(ARTIFACTS_DIR, filename)
    scene.render.filepath = out_path
    print(f"--> Rendering view: {filename} ({label})...")
    bpy.ops.render.render(write_still=True)
    print(f"    [DONE] Wrote image to: {out_path}")

print("=" * 80)
print("RENDERING 2014 MERCEDES-BENZ ACTROS MP4 GIGASPACE ASSESSMENT VIEWS")
print("=" * 80)

# Target vehicle center points:
# Center of vehicle body: X = 0.0, Y = -0.50 m, Z = 2.00 m (Tall GigaSpace cab)
# Front cab focus: X = 0.0, Y = +1.60 m, Z = 1.80 m
# Rear chassis focus: X = 0.0, Y = -1.80 m, Z = 1.20 m

# 1. Front 3/4 Hero View:
render_camera_view(
    cam_pos=(7.40, 7.80, 3.40),
    look_at=(0.0, 0.90, 1.95),
    filename="actros_mp4_front_three_quarter.png",
    label="Front 3/4 Hero View: 15-deg raked GigaSpace cab, cascading grille, illuminated star, Boomerang DRLs, MirrorCam",
    lens=52.0
)

# 2. Rear 3/4 View:
render_camera_view(
    cam_pos=(-7.60, -7.50, 3.20),
    look_at=(0.0, -1.30, 1.45),
    filename="actros_mp4_rear_three_quarter.png",
    label="Rear 3/4 View: Jost fifth-wheel, 3-piece mudguards, Euro LED lamps, catwalk, umbilical suzies, SCR/DPF box",
    lens=52.0
)

# 3. Side Profile View:
render_camera_view(
    cam_pos=(10.50, -0.50, 2.10),
    look_at=(0.0, -0.50, 2.00),
    filename="actros_mp4_side_profile.png",
    label="Side Profile View: Euro 4x2 tractor stance, full aero side skirts, 650L fuel tank, AdBlue tank, collar wings",
    lens=55.0
)

# 4. Front Elevation View:
render_camera_view(
    cam_pos=(0.0, 9.20, 2.10),
    look_at=(0.0, 1.80, 2.00),
    filename="actros_mp4_front_elevation.png",
    label="Front Elevation View: Cascading trapezoidal grille, glowing halo Mercedes star, ABA radar, aero sunvisor LEDs",
    lens=58.0
)

# 5. Rear Elevation View:
render_camera_view(
    cam_pos=(0.0, -8.60, 1.80),
    look_at=(0.0, -1.80, 1.50),
    filename="actros_mp4_rear_elevation.png",
    label="Rear Elevation View: ECE 70.01 chevrons, Euro LED taillamps, ECAS air suspension, trailer pylon Gladhand couplers",
    lens=58.0
)

print("=" * 80)
print("ALL 5 ACTROS MP4 ASSESSMENT SHOTS RENDERED SUCCESSFULLY!")
print("=" * 80)
