"""
=============================================================================
RENDER NISSAN GT-R R35 (2000s COUPE) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Nissan GT-R R35:
1. Front 3/4 Hero (Super Silver metallic, aero-blade fenders, twin NACA ducts, lightning LED DRLs, 20" Rays wheels)
2. Rear 3/4 (Carbon rear pedestal wing, quad round afterburner taillights, carbon diffuser, quad 120mm titanium cannons)
3. Side Profile (Fighter-jet canopy, C-pillar kink line, vertical fender vents, Rays 10-spoke alloys, Brembo gold calipers)
4. Front Elevation (V-motion bumper intake, intercooler cores, GT-R emblem badge, carbon chin splitter, lightning brows)
5. Rear Elevation (Quad afterburners with concentric halo rings, carbon wing blade, quad burnt titanium tips, F1 lamp)
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

if "generate_nissan_gtr_r35_master_cad" in sys.modules:
    del sys.modules["generate_nissan_gtr_r35_master_cad"]
import generate_nissan_gtr_r35_master_cad
from generate_nissan_gtr_r35_master_cad import generate_nissan_gtr_r35_master

# Build Nissan GT-R R35 from completely purged factory state
generate_nissan_gtr_r35_master()

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
    bg_node.inputs["Color"].default_value = (0.035, 0.038, 0.045, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2600
top_data.shape = 'RECTANGLE'
top_data.size = 2.8
top_data.size_y = 6.5
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.5)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Cool Crisp Key for Super Silver KAB Metallic)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2500
key_data.size = 5.4
key_data.color = (0.95, 0.98, 1.0)
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.0, 4.5, 3.4)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Warm Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1400
fill_data.size = 5.2
fill_data.color = (1.0, 0.96, 0.92)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.0, 3.8, 2.9)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (Accent on Rear Wing & Aero Diffuser)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 9.0
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.5, 3.4)
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
    # 1. Front 3/4 Dynamic Hero Stance
    ("gtr_1_front_34", Vector((4.60, 5.00, 1.65)), Vector((0.0, 0.45, 0.62))),
    # 2. Rear 3/4 Carbon Wing & Diffuser
    ("gtr_2_rear_34", Vector((-4.50, -4.80, 1.65)), Vector((0.0, -0.65, 0.65))),
    # 3. Side Profile Silhouette
    ("gtr_3_side", Vector((5.60, 0.00, 1.28)), Vector((0.0, 0.0, 0.65))),
    # 4. Front Elevation (V-Motion, Splitter, Headlights)
    ("gtr_4_front", Vector((0.00, 5.50, 1.15)), Vector((0.0, 1.20, 0.60))),
    # 5. Rear Elevation (Quad Afterburners & Quad Titanium Cannons)
    ("gtr_5_rear", Vector((0.00, -5.50, 1.18)), Vector((0.0, -1.20, 0.65))),
]

for name, cam_pos, target_pos in views:
    cam_obj.location = cam_pos
    dir_vec = target_pos - cam_pos
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_path
    print(f"Rendering: {name} -> {out_path}")
    bpy.ops.render.render(write_still=True)
    print(f"✅ Saved: {out_path}")

print("=============================================================================")
print("ALL 5 NISSAN GT-R R35 ASSESSMENT VIEWS RENDERED SUCCESSFULLY!")
print("=============================================================================")
