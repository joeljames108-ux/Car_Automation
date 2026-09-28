"""
=============================================================================
RENDER HONDA CIVIC TYPE R (EK9) CANONICAL ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Civic Type R EK9:
1. Front 3/4 Hero (Championship White, red 'H' badge, Type R front chin spoiler)
2. Rear 3/4 Hatchback (High-mount pedestal roof wing, single stainless exhaust)
3. Side Profile (15" Enkei 7-spoke white alloys, flush glass, side skirts)
4. Front Elevation (Honeycomb upper grille, teardrop headlamps, lower air dam)
5. Rear Elevation (Wrap-around vertical taillights, red 'H' crest, exhaust tip)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

# 1. Clean entire scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

# 2. Import freshly exported Master GLB to verify roundtrip fidelity
glb_path = r"e:\Car_Automation\public\models\Car_Honda_Civic_Type_R_EK9_1990s.glb"
print(f"[IMPORT] Loading Master GLB: {glb_path}")
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide any hitboxes from rendering
for obj in bpy.data.objects:
    if obj.name.startswith("HITBOX_"):
        obj.hide_render = True

# Target output directories
REPO_DIR = r"e:\Car_Automation\assets\screenshots\ek9_assessment"
CONV_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\db1ded0e-da82-4d9a-9cde-e589de13d7ab"
os.makedirs(REPO_DIR, exist_ok=True)
os.makedirs(CONV_DIR, exist_ok=True)

# 3. Studio World & Atmospheric Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.042, 0.048, 1.0)
    bg_node.inputs["Strength"].default_value = 0.85

# Overhead Strip Softbox (Rim highlight on roof, hood, and spoiler)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 2200
top_data.shape = 'RECTANGLE'
top_data.size = 2.4
top_data.size_y = 6.0
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.2)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Classic Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2000
key_data.size = 5.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (4.8, 4.5, 3.5)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1200
fill_data.size = 5.5
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-4.8, 3.8, 3.2)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (C-Pillar, Roofline & Wing Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 6.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -5.5, 3.2)
rim_obj.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Dark Reflective Epoxy Showroom Floor
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.018, 0.022, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.35
    g_bsdf.inputs["Roughness"].default_value = 0.08
    if "Coat Weight" in g_bsdf.inputs:
        g_bsdf.inputs["Coat Weight"].default_value = 0.95
    elif "Clearcoat" in g_bsdf.inputs:
        g_bsdf.inputs["Clearcoat"].default_value = 0.95
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

# Angle definitions for Honda Civic Type R EK9 (L=4.180m, W=1.695m, H=1.360m)
angles = [
    ("ek9_front_three_quarter", (4.8,  4.8, 1.45), (0.0,  0.10, 0.65), 50.0),
    ("ek9_rear_three_quarter",  (4.8, -4.8, 1.45), (0.0, -0.10, 0.65), 50.0),
    ("ek9_side_profile",        (6.2,  0.0, 0.75), (0.0,  0.00, 0.65), 55.0),
    ("ek9_front_elevation",     (0.0,  5.5, 0.70), (0.0,  0.15, 0.62), 50.0),
    ("ek9_rear_elevation",      (0.0, -5.5, 0.70), (0.0, -0.15, 0.65), 50.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

for name, loc, target, lens in angles:
    cam_obj.location = Vector(loc)
    cam_data.lens = lens
    look_at(cam_obj, target)

    out_file1 = os.path.join(REPO_DIR, f"{name}.png")
    out_file2 = os.path.join(CONV_DIR, f"{name}.png")
    scene.render.filepath = out_file1
    bpy.ops.render.render(write_still=True)
    if os.path.exists(out_file1):
        import shutil
        shutil.copy2(out_file1, out_file2)
        print(f"[RENDERED] {name} -> {out_file1} ({os.path.getsize(out_file1)} bytes)")

print("[COMPLETE] All 5 Honda Civic Type R EK9 assessment views rendered successfully.")
