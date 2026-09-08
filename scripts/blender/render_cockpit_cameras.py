"""
==============================================================================
COCKPIT MULTI-CAMERA RENDERER (BLENDER 5.2 LTS)
==============================================================================
Renders high-fidelity viewport previews of the remodeled cockpit:
1. Driver POV (eye level behind sculpted wheel, framing cluster gauges)
2. Seats Focus (contoured sport bucket seats, lateral bolsters, harness guides)
3. Center Console & Shifter Focus (sculpted knee bolsters, gated manual shifter)
==============================================================================
"""

import bpy
import os
import math
from mathutils import Vector, Euler

def setup_render_settings():
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

def render_camera_view(camera_obj, output_path):
    bpy.context.scene.camera = camera_obj
    bpy.context.scene.render.filepath = output_path
    print(f"[RENDER] Rendering view '{camera_obj.name}' -> {output_path}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER] Completed '{output_path}'")

def point_camera_at(cam_obj, target_loc):
    direction = Vector(target_loc) - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

def main():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    if not os.path.exists(glb_path):
        print(f"ERROR: GLB not found at {glb_path}")
        return

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Lighting setup
    # Key sun
    sun_data = bpy.data.lights.new(name="SunKey", type='SUN')
    sun_data.energy = 2.8
    sun_data.color = (1.0, 0.96, 0.90)
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.location = (1.8, -1.8, 3.2)
    sun_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))

    # Cabin Fill
    fill_data = bpy.data.lights.new(name="CabinFill", type='POINT')
    fill_data.energy = 45.0
    fill_data.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("CabinFill", fill_data)
    bpy.context.scene.collection.objects.link(fill_obj)
    fill_obj.location = (0.0, -0.15, 0.95)

    # World background
    world = bpy.data.worlds.new("CockpitWorld")
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs[0].default_value = (0.05, 0.06, 0.08, 1.0)
        bg_node.inputs[1].default_value = 0.6
    bpy.context.scene.world = world

    setup_render_settings()

    # Create cameras
    cam_data = bpy.data.cameras.new("CamDriver")
    cam_data.lens = 28.0 # ~54 deg FOV
    cam_driver = bpy.data.objects.new("CamDriver", cam_data)
    bpy.context.scene.collection.objects.link(cam_driver)
    # Driver eye point: X = -0.38 (behind wheel at Y=0.26), Y = -0.16, Z = 0.88
    cam_driver.location = (-0.38, -0.16, 0.88)
    point_camera_at(cam_driver, (-0.38, 0.44, 0.68))

    # Seats Camera (Looking backward and down at driver & passenger bucket seats)
    cam_seats_data = bpy.data.cameras.new("CamSeats")
    cam_seats_data.lens = 32.0
    cam_seats = bpy.data.objects.new("CamSeats", cam_seats_data)
    bpy.context.scene.collection.objects.link(cam_seats)
    cam_seats.location = (-0.05, 0.30, 0.98)
    point_camera_at(cam_seats, (-0.25, -0.22, 0.65))

    # Console Camera (Looking at center console bridge, shifter, and knee bolsters)
    cam_console_data = bpy.data.cameras.new("CamConsole")
    cam_console_data.lens = 35.0
    cam_console = bpy.data.objects.new("CamConsole", cam_console_data)
    bpy.context.scene.collection.objects.link(cam_console)
    cam_console.location = (-0.18, -0.06, 0.82)
    point_camera_at(cam_console, (0.0, 0.16, 0.44))

    out_dir = os.path.abspath("public/models/interior/previews")
    os.makedirs(out_dir, exist_ok=True)

    render_camera_view(cam_driver, os.path.join(out_dir, "preview_driver_pov.png"))
    render_camera_view(cam_seats, os.path.join(out_dir, "preview_seats_focus.png"))
    render_camera_view(cam_console, os.path.join(out_dir, "preview_console_focus.png"))

    print("[SUCCESS] All 3 camera angle previews rendered successfully!")

if __name__ == "__main__":
    main()
