"""
AUTO TYCOON CAMPUS HQ - 5-ANGLE SCREENSHOT ASSESSMENT PROTOCOL (§0.3 / PHASE 63)

Renders standard 5-angle assessment screenshots for any Campus building GLB or active scene:
1. FRONT_3Q: Front 3/4 isometric view
2. REAR_3Q:  Rear 3/4 isometric view
3. SIDE:     Side elevation view
4. FRONT:    Front elevation view
5. TOP_DOWN: Aerial top-down view

Implements clean diorama studio lighting with warm cream background matching Light Theme standards.
Screenshots are saved to public/screenshots/campus/<unit_name>/ for autonomous visual self-critique.

Usage:
  blender --background --python scripts/blender/campus/render/campus_assessment_views.py -- <path_to_glb> [output_dir]
"""

import os
import sys
import math
import bpy
import mathutils

def setup_diorama_studio(center_z: float = 6.0, radius: float = 25.0):
    # World background: Elegant warm cream / alabaster (#F6F4EE)
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Campus_Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.918, 0.902, 0.867, 1.0)
        bg_node.inputs["Strength"].default_value = 1.0

    # Key light: Warm sunlight
    key_light_data = bpy.data.lights.new(name="Studio_Key_Sun", type='SUN')
    key_light_data.energy = 3.5
    key_light_data.color = (1.0, 0.96, 0.90)
    key_light_obj = bpy.data.objects.new("Studio_Key_Sun", key_light_data)
    bpy.context.collection.objects.link(key_light_obj)
    key_light_obj.rotation_euler = (math.radians(50), math.radians(20), math.radians(45))

    # Fill light: Cool sky fill
    fill_light_data = bpy.data.lights.new(name="Studio_Fill_Sun", type='SUN')
    fill_light_data.energy = 1.5
    fill_light_data.color = (0.85, 0.92, 1.0)
    fill_light_obj = bpy.data.objects.new("Studio_Fill_Sun", fill_light_data)
    bpy.context.collection.objects.link(fill_light_obj)
    fill_light_obj.rotation_euler = (math.radians(65), math.radians(-30), math.radians(-135))

    # Camera
    cam_data = bpy.data.cameras.new(name="Assessment_Camera")
    cam_data.lens = 55.0  # Natural architectural perspective
    cam_data.clip_start = 0.5
    cam_data.clip_end = 500.0
    cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Render settings
    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'

    # Set render engine safely in Blender 5.x
    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except Exception:
        try:
            scene.render.engine = 'BLENDER_EEVEE'
        except Exception:
            pass

    return cam_obj

def get_scene_bounds():
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')

    for o in mesh_objects:
        for v in o.bound_box:
            wv = o.matrix_world @ mathutils.Vector(v)
            min_x = min(min_x, wv.x)
            min_y = min(min_y, wv.y)
            min_z = min(min_z, wv.z)
            max_x = max(max_x, wv.x)
            max_y = max(max_y, wv.y)
            max_z = max(max_z, wv.z)

    if not mesh_objects:
        return mathutils.Vector((0, 0, 0)), 20.0

    focus_z = min_z + (max_z - min_z) * 0.38
    center = mathutils.Vector(((min_x + max_x) / 2.0, (min_y + max_y) / 2.0, focus_z))
    radius = max(max_x - min_x, max_y - min_y, max_z - min_z) * 0.95
    return center, max(radius, 15.0)

def render_assessment_suite(output_dir: str, prefix: str = "capture") -> list:
    os.makedirs(output_dir, exist_ok=True)
    center, radius = get_scene_bounds()
    cam_obj = setup_diorama_studio(center.z, radius)

    distance = radius * 2.2

    # In world coordinates where +Y is front entrance:
    angles = [
        ("01_FRONT_3Q",  135,  30, distance),
        ("02_REAR_3Q",   -45,  30, distance),
        ("03_SIDE",       90,  18, distance * 0.95),
        ("04_FRONT",     180,  18, distance * 0.95),
        ("05_TOP_DOWN",  135,  85, distance * 1.2),
    ]

    rendered_files = []

    for name, yaw_deg, pitch_deg, dist in angles:
        yaw_rad = math.radians(yaw_deg)
        pitch_rad = math.radians(pitch_deg)

        # Spherical coordinates relative to target center
        cam_x = center.x + dist * math.cos(pitch_rad) * math.sin(yaw_rad)
        cam_y = center.y - dist * math.cos(pitch_rad) * math.cos(yaw_rad)
        cam_z = center.z + dist * math.sin(pitch_rad)

        cam_obj.location = (cam_x, cam_y, cam_z)

        # Look at target center
        direction = center - cam_obj.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        out_path = os.path.join(output_dir, f"{prefix}_{name}.png")
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        rendered_files.append(out_path)
        print(f"  [RENDERED] {name:14} -> {out_path}")

    return rendered_files

def run_assessment_on_glb(glb_path: str, output_base_dir: str = None) -> list:
    if not os.path.exists(glb_path):
        print(f"[ERROR] GLB not found: {glb_path}")
        return []

    # Clean scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in bpy.data.meshes: bpy.data.meshes.remove(block)
    for block in bpy.data.materials: bpy.data.materials.remove(block)

    # Import
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Remove HITBOX collision meshes so they do not occlude visual architecture or skew bounds
    for obj in list(bpy.data.objects):
        if obj.name.startswith("HITBOX_") or "hitbox" in obj.name.lower():
            bpy.data.objects.remove(obj, do_unlink=True)

    filename_base = os.path.splitext(os.path.basename(glb_path))[0]
    if not output_base_dir:
        # Default to public/screenshots/campus/<unit>/
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", ".."))
        output_base_dir = os.path.join(project_root, "public", "screenshots", "campus", filename_base)

    print(f"\n>>> Running 5-Angle Assessment Suite on: {os.path.basename(glb_path)}")
    print(f"    Target directory: {output_base_dir}")
    rendered = render_assessment_suite(output_base_dir, prefix=filename_base)
    print(f"    [COMPLETED] 5/5 views captured successfully.\n")
    return rendered

if __name__ == "__main__":
    target_glb = "public/models/campus/hq_01_corporate_l1.glb"
    out_dir = None
    for i, arg in enumerate(sys.argv):
        if arg.endswith(".glb"):
            target_glb = arg
            if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("-"):
                out_dir = sys.argv[i + 1]
            break

    run_assessment_on_glb(target_glb, out_dir)
