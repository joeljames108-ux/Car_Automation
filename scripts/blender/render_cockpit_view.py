"""
Renders a photorealistic preview of the interactive dashboard GLB matching Image 4
(Driver eye-level looking directly forward at the dashboard).
"""
import bpy
import math
import os
import sys
from mathutils import Vector, Euler

def render_preview():
    # Load GLB
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_img = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/6b65af10-4dec-4c71-90b8-d02c18319690/dashboard_interactive_preview.png")

    # Reset scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Hide extra wheels so only Sport 3-Spoke is visible
    for obj in bpy.data.objects:
        name = obj.name.upper()
        if "STEERING_GT3_YOKE" in name or "STEERING_FORMULA" in name or "STEERING_CLASSIC_WOOD" in name:
            obj.hide_render = True
            obj.hide_viewport = True
        if "CONSOLE_SHIFTER_MANUAL" in name or "CONSOLE_SHIFTER_TOGGLE" in name:
            obj.hide_render = True
            obj.hide_viewport = True

    # Camera matching Image 4 (driver eye level looking at dashboard & windshield)
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.lens = 28 # Wide cinematic interior lens
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Position camera at driver head position
    cam_obj.location = Vector((-0.18, -1.02, 0.58))
    # Look towards center-forward (slight pitch down)
    cam_obj.rotation_euler = Euler((math.radians(78), 0.0, math.radians(10)), 'XYZ')

    # Studio Lighting
    world = bpy.data.worlds.new("InteriorWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.75, 0.82, 0.95, 1.0) # Sky fill through windshield
        bg.inputs["Strength"].default_value = 1.2
    bpy.context.scene.world = world

    # Directional Key Light from windshield
    sun_data = bpy.data.lights.new("SunKey", type='SUN')
    sun_data.energy = 2.5
    sun_data.color = (1.0, 0.98, 0.92)
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    sun_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(-30)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    # Interior Soft Fill
    fill_data = bpy.data.lights.new("InteriorFill", type='POINT')
    fill_data.energy = 25.0
    fill_data.color = (0.6, 0.8, 1.0)
    fill_obj = bpy.data.objects.new("InteriorFill", fill_data)
    fill_obj.location = Vector((0.0, -0.2, 0.5))
    bpy.context.scene.collection.objects.link(fill_obj)

    # Render Settings (Cycles for photorealism)
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 64
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 720
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.filepath = out_img

    print(f"Rendering photorealistic preview to {out_img}...")
    bpy.ops.render.render(write_still=True)
    print("Preview render complete.")

if __name__ == "__main__":
    render_preview()
