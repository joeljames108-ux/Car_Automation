import bpy
import os
import math
from mathutils import Vector

def render_fine_shots():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Lighting
    world = bpy.data.worlds.new("World_Studio")
    bpy.context.scene.world = world
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.05, 0.06, 0.08, 1.0)
    bg.inputs[1].default_value = 1.0

    sun_data = bpy.data.lights.new("Sun", 'SUN')
    sun_data.energy = 3.0
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new("Sun", sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(50), math.radians(15), math.radians(-35))

    area_data = bpy.data.lights.new("Area_Cabin", 'AREA')
    area_data.energy = 60.0
    area_data.size = 2.4
    area_data.color = (0.92, 0.96, 1.0)
    area_obj = bpy.data.objects.new("Area_Cabin", area_data)
    bpy.context.scene.collection.objects.link(area_obj)
    area_obj.location = (0.0, -1.40, 1.25)

    cam_data = bpy.data.cameras.new("RenderCam")
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 960
    bpy.context.scene.render.resolution_y = 540

    shots = [
        ("rear_cabin_high_quarter", (-0.55, -0.65, 1.08), (0.05, -1.55, 0.38), 62),
        ("rear_row2_beauty", (0.38, -0.85, 0.82), (-0.08, -1.35, 0.42), 52),
        ("rear_row3_beauty", (0.35, -1.50, 0.92), (0.0, -2.18, 0.45), 55),
    ]

    out_dir = os.path.abspath("scratch/renders")
    os.makedirs(out_dir, exist_ok=True)

    for shot_name, pos, target, fov in shots:
        cam_obj.location = pos
        cam_data.angle = math.radians(fov)
        direction = Vector(target) - Vector(pos)
        cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

        out_path = os.path.join(out_dir, f"{shot_name}.png")
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"[RENDER] Saved: {out_path}")

if __name__ == "__main__":
    render_fine_shots()
