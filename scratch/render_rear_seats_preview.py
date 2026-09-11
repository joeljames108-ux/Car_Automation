import bpy
import os
import math
from mathutils import Vector, Euler

def render_previews():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Lighting
    world = bpy.data.worlds.new("World_Studio")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.04, 0.05, 0.07, 1.0)
    bg.inputs[1].default_value = 0.85

    # Key sun light
    sun_data = bpy.data.lights.new("Sun", 'SUN')
    sun_data.energy = 2.5
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new("Sun", sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(-30))

    # Overhead cabin area light
    area_data = bpy.data.lights.new("Area_Cabin", 'AREA')
    area_data.energy = 45.0
    area_data.size = 2.0
    area_data.color = (0.9, 0.95, 1.0)
    area_obj = bpy.data.objects.new("Area_Cabin", area_data)
    bpy.context.scene.collection.objects.link(area_obj)
    area_obj.location = (0.0, -1.40, 1.22)
    area_obj.rotation_euler = (0, 0, 0)

    # Rear fill light
    rear_light = bpy.data.lights.new("Point_Rear", 'POINT')
    rear_light.energy = 25.0
    rear_light.color = (0.7, 0.85, 1.0)
    rear_obj = bpy.data.objects.new("Point_Rear", rear_light)
    bpy.context.scene.collection.objects.link(rear_obj)
    rear_obj.location = (0.0, -2.40, 0.90)

    # Camera setup
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 960
    bpy.context.scene.render.resolution_y = 540
    bpy.context.scene.render.film_transparent = False

    shots = [
        ("rear_cabin_wide", (0.20, -0.65, 0.92), (0.0, -1.60, 0.45), 58),
        ("rear_row2_close", (0.32, -0.95, 0.68), (-0.15, -1.35, 0.40), 50),
        ("rear_row3_stadium", (-0.15, -1.55, 0.82), (0.0, -2.18, 0.48), 54),
        ("rear_forward_perspective", (0.0, -2.60, 0.85), (0.0, -0.50, 0.60), 62),
    ]

    out_dir = os.path.abspath("scratch/renders")
    os.makedirs(out_dir, exist_ok=True)

    for shot_name, pos, target, fov in shots:
        cam_obj.location = pos
        cam_data.angle = math.radians(fov)

        direction = Vector(target) - Vector(pos)
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        out_path = os.path.join(out_dir, f"{shot_name}.png")
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {out_path}")

if __name__ == "__main__":
    render_previews()
