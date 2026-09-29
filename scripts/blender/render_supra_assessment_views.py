"""
=============================================================================
RENDER TOYOTA SUPRA A80 (1990s COUPE) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Toyota Supra A80:
1. Front 3/4 Hero (Renaissance Red, Coke-bottle waist, triple projector headlamps, 17" alloy wheels)
2. Rear 3/4 (Iconic high hoop rear spoiler wing, quad round afterburner taillights, fastback glass, cannon exhaust)
3. Side Profile (Curvaceous coupe silhouette, side brake cooling air scoops, door shutlines, 17" wheels)
4. Front Elevation (Front bumper intercooler mouth, twin horizontal cooling slots, active chin spoiler, triple projector pods)
5. Rear Elevation (Quad afterburner circular taillight pods, high hoop wing arch, rear license recess, 90mm stainless cannon)
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

if "generate_toyota_supra_a80_master_cad" in sys.modules:
    del sys.modules["generate_toyota_supra_a80_master_cad"]
import generate_toyota_supra_a80_master_cad
from generate_toyota_supra_a80_master_cad import generate_toyota_supra_master

# Build Toyota Supra A80 from completely purged factory state
generate_toyota_supra_master()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\c92892f5-7cac-4196-9d9c-8538b401dfc6\.tempmediaStorage"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

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
    bg_node.inputs["Color"].default_value = (0.04, 0.042, 0.048, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2400
top_data.shape = 'RECTANGLE'
top_data.size = 2.5
top_data.size_y = 6.0
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Key for Renaissance Red 3L2)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2400
key_data.size = 5.2
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.2, 3.2)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1300
fill_data.size = 5.0
fill_data.color = (0.90, 0.95, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 3.6, 2.8)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (High Hoop Wing & Rear Haunches Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 8.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.2, 3.2)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=35, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.016, 0.020, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.40
    g_bsdf.inputs["Roughness"].default_value = 0.22
ground_obj.data.materials.append(mat_ground)

# Render Configuration (Cycles or EEVEE)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.film_transparent = False

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 52.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

views = [
    # 1. Front 3/4 Dynamic (Hero Stance)
    ("supra_1_front_34.png", Vector((-4.4, 4.4, 1.65)), Vector((0.0, 0.15, 0.58)), 48.0),
    # 2. Rear 3/4 Dynamic (Hoop Wing & Afterburner Taillights)
    ("supra_2_rear_34.png",  Vector((-4.4, -4.4, 1.65)), Vector((0.0, -0.20, 0.65)), 48.0),
    # 3. Direct Side Profile (Coke-Bottle Waist & Side Brake Scoops)
    ("supra_3_side.png",     Vector((-5.6, 0.0, 0.72)), Vector((0.0, 0.0, 0.60)), 54.0),
    # 4. Direct Front Fascia (Intercooler Mouth & Triple Projector Eyes)
    ("supra_4_front.png",    Vector((0.0, 4.6, 0.72)), Vector((0.0, 0.0, 0.55)), 50.0),
    # 5. Direct Rear Fascia (Quad Afterburners & High Hoop Arch)
    ("supra_5_rear.png",     Vector((0.0, -4.6, 0.85)), Vector((0.0, -0.20, 0.70)), 50.0),
]

rendered_files = []

for filename, pos, target, flen in views:
    cam_data.lens = flen
    cam_obj.location = pos
    direction = target - pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(ARTIFACTS_DIR, filename)
    scene.render.filepath = out_path
    print(f"Rendering: {filename}...")
    bpy.ops.render.render(write_still=True)
    rendered_files.append(out_path)
    print(f"  ✓ Saved to {out_path}")

print("=" * 80)
print("ALL 5 CANONICAL VIEWS RENDERED SUCCESSFULLY:")
for rf in rendered_files:
    print(f"  IMAGE: {rf}")
print("=" * 80)
