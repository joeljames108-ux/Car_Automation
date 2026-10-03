"""
=============================================================================
RENDER HONDA S2000 AP1 (VEHICLE 27) ASSESSMENT VIEWS
=============================================================================
Renders 5 canonical automotive validation angles directly from active scene:
1. honda_s2000_1_front_34.png
2. honda_s2000_2_rear_34.png
3. honda_s2000_3_side.png
4. honda_s2000_4_front.png
5. honda_s2000_5_rear.png
=============================================================================
"""

import bpy
import math
import os
import shutil
from mathutils import Vector, Euler

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\fbb2023f-5dad-483d-9587-0dee9ed24815"
OUTPUT_DIR = r"E:\Car_Automation\assets\screenshots\honda_s2000_assessment"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def setup_studio():
    # Remove previous studio lights/cams/floors
    for obj in list(bpy.data.objects):
        if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead"]):
            bpy.data.objects.remove(obj, do_unlink=True)

    # Studio World & Ambient HDRI-like gradient
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("StudioWorld")
        bpy.context.scene.world = world

    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.045, 0.048, 0.055, 1.0)
        bg_node.inputs["Strength"].default_value = 1.0

    # Overhead Strip Softbox (Soft white illumination across Silverstone Metallic paint)
    top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
    top_data.energy = 3200
    top_data.shape = 'RECTANGLE'
    top_data.size = 2.8
    top_data.size_y = 7.5
    top_data.color = (1.0, 0.98, 0.96)
    top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
    top_obj.location = (0.0, -1.30, 4.2)
    bpy.context.scene.collection.objects.link(top_obj)

    # Key Light (Crisp Warm Key for hood contours and front fender flairs)
    key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
    key_data.energy = 2800
    key_data.size = 5.0
    key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
    key_obj.location = (-4.5, 2.5, 3.2)
    key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(-50)), 'XYZ')
    bpy.context.scene.collection.objects.link(key_obj)

    # Fill Light (Cool Soft Fill for passenger flank and cockpit)
    fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
    fill_data.energy = 1800
    fill_data.size = 5.5
    fill_data.color = (0.92, 0.95, 1.0)
    fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
    fill_obj.location = (4.5, -0.5, 2.8)
    fill_obj.rotation_euler = Euler((math.radians(40), math.radians(-15), math.radians(70)), 'XYZ')
    bpy.context.scene.collection.objects.link(fill_obj)

    # Rim Light (Crisp Rear Accent on ducktail spoiler, roll hoops and twin cannons)
    rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='AREA')
    rim_data.energy = 2400
    rim_data.size = 4.0
    rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
    rim_obj.location = (0.0, -5.8, 3.2)
    rim_obj.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
    bpy.context.scene.collection.objects.link(rim_obj)

    # Front Fill Light
    front_data = bpy.data.lights.new(name="Assessment_FrontFill", type='AREA')
    front_data.energy = 1600
    front_data.size = 4.0
    front_obj = bpy.data.objects.new("Assessment_FrontFill", front_data)
    front_obj.location = (0.0, 4.5, 1.8)
    front_obj.rotation_euler = Euler((math.radians(20), 0, math.radians(180)), 'XYZ')
    bpy.context.scene.collection.objects.link(front_obj)

    # Studio Reflective Floor
    bpy.ops.mesh.primitive_plane_add(size=36, location=(0, -1.30, 0))
    ground_obj = bpy.context.active_object
    ground_obj.name = "StudioGround"

    mat_ground = bpy.data.materials.new("Ground_Mat")
    mat_ground.use_nodes = True
    g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
    if g_bsdf:
        g_bsdf.inputs["Base Color"].default_value = (0.020, 0.022, 0.026, 1.0)
        g_bsdf.inputs["Metallic"].default_value = 0.35
        g_bsdf.inputs["Roughness"].default_value = 0.12
        if "Coat Weight" in g_bsdf.inputs:
            g_bsdf.inputs["Coat Weight"].default_value = 0.85
        elif "Clearcoat" in g_bsdf.inputs:
            g_bsdf.inputs["Clearcoat"].default_value = 0.85
    ground_obj.data.materials.append(mat_ground)

    # Camera Setup
    cam_data = bpy.data.cameras.new("AssessmentCam")
    cam_data.lens = 45.0
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

    return cam_obj, cam_data


def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()


# 5 Canonical automotive validation angles for Honda S2000 AP1
# Center of car is approximately at (0.0, -1.30, 0.55)
VIEWS = [
    # 1. Front 3/4 Hero
    ("honda_s2000_1_front_34", (-3.6, 2.5, 1.25), (0.0, -1.10, 0.50), 45.0),
    # 2. Rear 3/4
    ("honda_s2000_2_rear_34", (-3.6, -4.8, 1.25), (0.0, -1.50, 0.50), 45.0),
    # 3. Side Profile
    ("honda_s2000_3_side", (-5.4, -1.30, 0.70), (0.0, -1.30, 0.55), 48.0),
    # 4. Front Elevation
    ("honda_s2000_4_front", (0.0, 3.8, 0.65), (0.0, -0.40, 0.50), 50.0),
    # 5. Rear Elevation
    ("honda_s2000_5_rear", (0.0, -6.0, 0.65), (0.0, -2.20, 0.50), 50.0),
]


def render_part(part_indices):
    cam_obj, cam_data = setup_studio()
    scene = bpy.context.scene

    for idx in part_indices:
        name, loc, target, lens = VIEWS[idx]
        cam_obj.location = Vector(loc)
        cam_data.lens = lens
        look_at(cam_obj, target)

        out_local = os.path.join(OUTPUT_DIR, f"{name}.png")
        out_artifact = os.path.join(ARTIFACTS_DIR, f"{name}.png")
        
        scene.render.filepath = out_local
        bpy.ops.render.render(write_still=True)
        shutil.copy2(out_local, out_artifact)
        print(f"✅ Rendered [{name}] -> {out_local} ({os.path.getsize(out_local)} bytes)")
