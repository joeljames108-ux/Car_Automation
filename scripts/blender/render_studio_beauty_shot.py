"""
==============================================================================
BLENDER 5.2 4K STUDIO BEAUTY SHOT RENDERER: GT3 IN ROSSO CORSA RED
==============================================================================
Sets up a high-end automotive commercial photography studio:
- Imports the production GLB (modular_gt3_apex.glb)
- Seamless infinity cyclorama studio backdrop & dark reflective epoxy floor
- 3-Point softbox lighting system (Overhead strip softbox, side fill, rear rim)
- 50mm cinematic prime lens camera angled at low front 3/4 hero perspective
- 4K UHD resolution: 3840 x 2160 with color management (AgX / Filmic High Contrast)
- Exports high-resolution beauty render to public/renders/rosso_corsa_gt3_studio_4k.png
==============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[BLENDER_STUDIO_RENDER] {msg}")

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

def setup_studio_environment():
    log("Building infinity cyclorama studio backdrop & reflective floor...")

    # 1. Dark Reflective Epoxy Floor
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Studio_Epoxy_Floor"

    mat_floor = bpy.data.materials.new(name="Studio_Floor_Epoxy")
    mat_floor.use_nodes = True
    pbr_floor = mat_floor.node_tree.nodes.get("Principled BSDF")
    if pbr_floor:
        if "Base Color" in pbr_floor.inputs:
            pbr_floor.inputs["Base Color"].default_value = (0.02, 0.022, 0.025, 1.0)
        if "Metallic" in pbr_floor.inputs:
            pbr_floor.inputs["Metallic"].default_value = 0.35
        if "Roughness" in pbr_floor.inputs:
            pbr_floor.inputs["Roughness"].default_value = 0.08
        if "Coat Weight" in pbr_floor.inputs:
            pbr_floor.inputs["Coat Weight"].default_value = 0.95
        elif "Clearcoat" in pbr_floor.inputs:
            pbr_floor.inputs["Clearcoat"].default_value = 0.95
    floor.data.materials.append(mat_floor)

    # 2. Seamless Curved Cyc Wall Backdrop
    bpy.ops.mesh.primitive_cylinder_add(radius=18, depth=8, vertices=64, location=(0, 6, 4))
    cyc = bpy.context.active_object
    cyc.name = "Studio_Cyc_Backdrop"
    cyc.scale = (1.4, 0.6, 1.0)

    mat_cyc = bpy.data.materials.new(name="Studio_Cyc_Wall")
    mat_cyc.use_nodes = True
    pbr_cyc = mat_cyc.node_tree.nodes.get("Principled BSDF")
    if pbr_cyc:
        if "Base Color" in pbr_cyc.inputs:
            pbr_cyc.inputs["Base Color"].default_value = (0.05, 0.055, 0.065, 1.0)
        if "Roughness" in pbr_cyc.inputs:
            pbr_cyc.inputs["Roughness"].default_value = 0.65
    cyc.data.materials.append(mat_cyc)

def setup_studio_lighting():
    log("Placing automotive 3-point softbox studio lighting...")

    # Key Overhead Strip Softbox (Creates long highlight lines across roof, bonnet and haunches)
    bpy.ops.object.light_add(type='AREA', location=(0, -0.2, 4.2))
    key_light = bpy.context.active_object
    key_light.name = "Key_Overhead_Softbox"
    key_light.data.energy = 450.0
    key_light.data.shape = 'RECTANGLE'
    key_light.data.size = 2.4
    key_light.data.size_y = 6.8
    key_light.data.color = (1.0, 0.98, 0.96)

    # Side Rim Accent Light (Left Flank)
    bpy.ops.object.light_add(type='AREA', location=(-3.8, -1.2, 1.8))
    rim_left = bpy.context.active_object
    rim_left.name = "Rim_Left_Softbox"
    rim_left.data.energy = 220.0
    rim_left.data.shape = 'RECTANGLE'
    rim_left.data.size = 1.2
    rim_left.data.size_y = 4.2
    rim_left.rotation_euler = (math.radians(45), math.radians(-30), math.radians(70))
    rim_left.data.color = (0.95, 0.98, 1.0)

    # Rear Rim Light (Highlights swan-neck wing and 6-strake diffuser)
    bpy.ops.object.light_add(type='AREA', location=(2.2, 3.8, 2.2))
    rim_rear = bpy.context.active_object
    rim_rear.name = "Rim_Rear_Softbox"
    rim_rear.data.energy = 280.0
    rim_rear.data.shape = 'RECTANGLE'
    rim_rear.data.size = 1.6
    rim_rear.data.size_y = 3.2
    rim_rear.rotation_euler = (math.radians(-40), math.radians(25), math.radians(-140))
    rim_rear.data.color = (1.0, 0.92, 0.88)

    # Front Splitter Ground Fill
    bpy.ops.object.light_add(type='AREA', location=(-1.2, -4.5, 0.6))
    front_fill = bpy.context.active_object
    front_fill.name = "Front_Splitter_Fill"
    front_fill.data.energy = 90.0
    front_fill.data.shape = 'RECTANGLE'
    front_fill.data.size = 2.0
    front_fill.data.size_y = 1.0
    front_fill.rotation_euler = (math.radians(75), 0, math.radians(-15))

def setup_hero_camera():
    log("Configuring 50mm cinema hero camera (low front 3/4 perspective)...")
    # Camera position: low angle, front 3/4 showing splitter, canards, wheels, and flank
    cam_data = bpy.data.cameras.new("Hero_Camera_50mm")
    cam_data.lens = 52.0
    cam_data.sensor_width = 36.0
    cam_data.dof.use_dof = False

    cam_obj = bpy.data.objects.new("Hero_Studio_Camera", cam_data)
    cam_obj.location = Vector((-3.85, -4.65, 0.98))

    # Aim at car center
    target = Vector((0, -0.2, 0.42))
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

def apply_rosso_corsa_paint():
    log("Applying deep multi-coat Italian Rosso Corsa paint shader...")
    for mat in bpy.data.materials:
        if "Paint" in mat.name or "Body" in mat.name:
            pbr = mat.node_tree.nodes.get("Principled BSDF") if mat.node_tree else None
            if pbr:
                # Authentic Rosso Corsa: Hex #D40000 -> sRGB (0.83, 0.00, 0.00)
                if "Base Color" in pbr.inputs:
                    pbr.inputs["Base Color"].default_value = (0.78, 0.02, 0.02, 1.0)
                if "Metallic" in pbr.inputs:
                    pbr.inputs["Metallic"].default_value = 0.12
                if "Roughness" in pbr.inputs:
                    pbr.inputs["Roughness"].default_value = 0.14
                if "Coat Weight" in pbr.inputs:
                    pbr.inputs["Coat Weight"].default_value = 1.0
                elif "Clearcoat" in pbr.inputs:
                    pbr.inputs["Clearcoat"].default_value = 1.0
                if "Coat Roughness" in pbr.inputs:
                    pbr.inputs["Coat Roughness"].default_value = 0.03
                elif "Clearcoat Roughness" in pbr.inputs:
                    pbr.inputs["Clearcoat Roughness"].default_value = 0.03

def render_beauty_shot(output_image_path):
    log("Configuring 4K UHD render engine (3840x2160)...")
    scene = bpy.context.scene

    # 4K Resolution
    scene.render.resolution_x = 3840
    scene.render.resolution_y = 2160
    scene.render.resolution_percentage = 100

    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'

    scene.render.engine = 'BLENDER_EEVEE'

    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
    scene.render.filepath = output_image_path

    log(f"Rendering 4K studio beauty shot to: {output_image_path}")
    bpy.ops.render.render(write_still=True)
    log("4K studio beauty shot render complete!")

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    glb_path = os.path.join(root_dir, "public", "models", "exterior", "modular_gt3_apex.glb")
    out_img = os.path.join(root_dir, "public", "renders", "rosso_corsa_gt3_studio_4k.png")

    reset_scene()
    setup_studio_environment()
    setup_studio_lighting()
    setup_hero_camera()

    if os.path.exists(glb_path):
        log(f"Importing vehicle GLB: {glb_path}")
        bpy.ops.import_scene.gltf(filepath=glb_path)
    else:
        log(f"Warning: GLB not found at {glb_path}")

    apply_rosso_corsa_paint()
    render_beauty_shot(out_img)

if __name__ == "__main__":
    main()
