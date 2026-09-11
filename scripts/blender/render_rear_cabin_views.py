import bpy
import math
import os
from mathutils import Vector, Euler

def render_rear_cabin_showcase():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")
    os.makedirs(out_dir, exist_ok=True)

    views = [
        # (filename, camera_loc, target_loc, lens_mm)
        ("rear_cabin_panoramic.png", Vector((-0.65, -0.40, 1.15)), Vector((0.0, -1.45, 0.45)), 22.0),
        ("row2_executive_view.png", Vector((-0.55, -0.85, 0.95)), Vector((0.0, -1.35, 0.40)), 28.0),
        ("row3_stadium_view.png", Vector((0.0, -1.40, 1.10)), Vector((0.0, -2.18, 0.45)), 26.0),
        ("cabin_from_rear_looking_fwd.png", Vector((0.0, -1.75, 0.85)), Vector((0.0, -0.10, 0.55)), 20.0),
    ]

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Lighting setup
    world = bpy.data.worlds.new("InteriorWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.55, 0.65, 0.78, 1.0)
        bg.inputs["Strength"].default_value = 0.8
    bpy.context.scene.world = world

    sun_data = bpy.data.lights.new("SunKey", type='SUN')
    sun_data.energy = 2.8
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    sun_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(-30)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    # Rear cabin area light
    rear_dome = bpy.data.lights.new("RearDome", type='AREA')
    rear_dome.energy = 16.0
    rear_dome.color = (0.95, 0.98, 1.0)
    rear_dome.size = 1.2
    rear_obj = bpy.data.objects.new("RearDome", rear_dome)
    rear_obj.location = Vector((0.0, -1.40, 1.35))
    bpy.context.scene.collection.objects.link(rear_obj)

    # Ambient fill
    fill_light = bpy.data.lights.new("CabinFill", type='POINT')
    fill_light.energy = 8.0
    fill_light.color = (0.92, 0.95, 1.0)
    fill_obj = bpy.data.objects.new("CabinFill", fill_light)
    fill_obj.location = Vector((0.0, -0.80, 0.95))
    bpy.context.scene.collection.objects.link(fill_obj)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, "RenderSettings") and 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.film_transparent = False

    cam_data = bpy.data.cameras.new("RenderCam")
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    for filename, cam_loc, target_loc, lens in views:
        cam_obj.location = cam_loc
        direction = target_loc - cam_loc
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()
        cam_data.lens = lens

        out_path = os.path.join(out_dir, filename)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {out_path}")

if __name__ == "__main__":
    render_rear_cabin_showcase()
