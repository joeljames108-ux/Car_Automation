"""
=============================================================================
RENDER FERRARI F12BERLINETTA PHASE 1 ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity beauty assessment shots of the generated Ferrari F12berlinetta:
1. Front 3/4 Hero (Rosso Corsa, sculpted hood, front splitter, sweeping fender crests)
2. Rear 3/4 (Muscular haunches, Kammback tail, competition diffuser strakes, quad exhausts)
3. Side Profile (20" staggered forged wheels, Aero Bridge flank canal, door waistline scoop)
4. Front Elevation (Smiling radiator intake, active brake cooling ducts, chin winglets)
5. Rear Elevation (Truncated Kamm transom, signature circular taillights, rear diffuser)
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

if "generate_ferrari_f12_berlinetta_phase1" in sys.modules:
    del sys.modules["generate_ferrari_f12_berlinetta_phase1"]
if "generate_ferrari_f12_berlinetta_phase2" in sys.modules:
    del sys.modules["generate_ferrari_f12_berlinetta_phase2"]
import generate_ferrari_f12_berlinetta_phase2

# 1. Build Complete Ferrari F12berlinetta Master (Phase 1 + Phase 2 Micro-Jewelry)
generate_ferrari_f12_berlinetta_phase2.build_ferrari_f12berlinetta_master_complete()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 2. Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# 3. Studio World & Lighting
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
top_data.energy = 2800
top_data.shape = 'RECTANGLE'
top_data.size = 2.6
top_data.size_y = 6.5
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, 0.0, 4.4)
bpy.context.scene.collection.objects.link(top_obj)

# Key Light (Warm Classic Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 2600
key_data.size = 6.0
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (5.2, 5.0, 3.6)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# Fill Light (Cool Soft Fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 1500
fill_data.size = 6.0
fill_data.color = (0.94, 0.96, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-5.2, 4.2, 3.4)
fill_obj.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# Rim Light (C-Pillar, Roofline & Rear Haunch Accent)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_data.energy = 8.5
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (0.0, -6.0, 3.5)
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
    g_bsdf.inputs["Base Color"].default_value = (0.015, 0.017, 0.020, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 0.40
    g_bsdf.inputs["Roughness"].default_value = 0.07
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
if hasattr(scene, "eevee"):
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 64
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Angle definitions for Ferrari F12berlinetta (L=4.618m, W=1.942m, H=1.273m)
angles = [
    ("f12_front_three_quarter", (5.2,  5.2, 1.45), (0.0,  0.20, 0.65), 50.0),
    ("f12_rear_three_quarter",  (5.2, -5.2, 1.45), (0.0, -0.20, 0.65), 50.0),
    ("f12_side_profile",        (6.5,  0.0, 0.75), (0.0,  0.00, 0.65), 55.0),
    ("f12_front_elevation",     (0.0,  5.8, 0.70), (0.0,  0.20, 0.60), 50.0),
    ("f12_rear_elevation",      (0.0, -5.8, 0.70), (0.0, -0.20, 0.65), 50.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

for name, loc, target, lens in angles:
    cam_obj.location = Vector(loc)
    cam_data.lens = lens
    look_at(cam_obj, target)

    out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {name} -> {out_file} ({os.path.getsize(out_file)} bytes)")

print("[COMPLETE] All 5 Ferrari F12berlinetta assessment views rendered successfully.")
