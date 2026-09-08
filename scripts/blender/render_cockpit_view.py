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
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_img = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/6b65af10-4dec-4c71-90b8-d02c18319690/dashboard_interactive_preview.png")

    # Reset scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Hide extra alternative wheels and shifters recursively so default Sport 3-Spoke & Auto Shifter are cleanly isolated
    def hide_recursive(obj):
        obj.hide_render = True
        obj.hide_viewport = True
        for ch in obj.children:
            hide_recursive(ch)

    hide_prefixes = [
        "STEERING_GT3_YOKE", "STEERING_FORMULA", "STEERING_CLASSIC_WOOD",
        "CONSOLE_SHIFTER_MANUAL", "CONSOLE_SHIFTER_TOGGLE",
        "YOKE_GRIP", "STEERING_YOKE"
    ]
    for obj in bpy.data.objects:
        name = obj.name.upper()
        for pref in hide_prefixes:
            if pref in name:
                hide_recursive(obj)

    # Camera matching Image 4 (driver eye level looking forward across dashboard & windshield)
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.lens = 22 # 22mm wide cinematic cockpit lens to capture wheel, console, and passenger dash
    cam_data.clip_start = 0.05
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Position camera at driver eye level looking forward
    cam_loc = Vector((-0.24, -0.74, 0.78))
    cam_target = Vector((0.04, 0.04, 0.59))
    cam_obj.location = cam_loc
    direction = (cam_target - cam_loc).normalized()
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    # Studio Lighting Setup
    world = bpy.data.worlds.new("InteriorWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.55, 0.65, 0.78, 1.0) # Daylight through windshield
        bg.inputs["Strength"].default_value = 0.65
    bpy.context.scene.world = world

    # 1. Directional Sun Key Light through windshield
    sun_data = bpy.data.lights.new("SunKey", type='SUN')
    sun_data.energy = 2.4
    sun_data.color = (1.0, 0.98, 0.94)
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    sun_obj.rotation_euler = Euler((math.radians(48), math.radians(18), math.radians(-25)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    # 2. Driver Shoulder Fill Light (soft illumination for steering wheel, buttons, crest, dials)
    driver_fill = bpy.data.lights.new("DriverFill", type='POINT')
    driver_fill.energy = 6.0
    driver_fill.color = (1.0, 0.98, 0.95)
    driver_fill.shadow_soft_size = 0.25
    fill_obj = bpy.data.objects.new("DriverFill", driver_fill)
    fill_obj.location = Vector((-0.28, -0.65, 0.82))
    bpy.context.scene.collection.objects.link(fill_obj)

    # 3. Overhead Cabin Dome Area Light (subtle ambient interior roof glow)
    dome_light = bpy.data.lights.new("CabinDome", type='AREA')
    dome_light.energy = 10.0
    dome_light.color = (0.96, 0.98, 1.0)
    dome_light.size = 0.70
    dome_obj = bpy.data.objects.new("CabinDome", dome_light)
    dome_obj.location = Vector((0.0, -0.30, 1.18))
    dome_obj.rotation_euler = Euler((0, 0, 0), 'XYZ')
    bpy.context.scene.collection.objects.link(dome_obj)

    # 4. Center Console Soft Fill
    console_light = bpy.data.lights.new("ConsoleFill", type='POINT')
    console_light.energy = 4.0
    console_light.color = (0.92, 0.95, 1.0)
    console_light.shadow_soft_size = 0.20
    console_obj = bpy.data.objects.new("ConsoleFill", console_light)
    console_obj.location = Vector((0.0, -0.20, 0.66))
    bpy.context.scene.collection.objects.link(console_obj)

    # Color Management (AgX / Filmic High Contrast)
    try:
        bpy.context.scene.view_settings.view_transform = 'AgX'
        bpy.context.scene.view_settings.look = 'High Contrast'
    except Exception:
        bpy.context.scene.view_settings.view_transform = 'Filmic'
        bpy.context.scene.view_settings.look = 'Medium High Contrast'

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
