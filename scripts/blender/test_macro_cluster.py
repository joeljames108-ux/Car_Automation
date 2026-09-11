import bpy
import math
import os
from mathutils import Vector, Euler

def test_cluster_positions():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Convert Three.js to Blender: Blender X = Three X, Blender Y = -Three Z, Blender Z = Three Y

    # Lighting
    world = bpy.data.worlds.new("TestWorld")
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.7, 0.75, 0.85, 1.0)
        bg.inputs["Strength"].default_value = 1.0
    bpy.context.scene.world = world

    sun_data = bpy.data.lights.new("SunKey", type='SUN')
    sun_data.energy = 3.0
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    sun_obj.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(-30)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    cam_data = bpy.data.cameras.new("TestCam")
    cam_data.clip_start = 0.05
    cam_obj = bpy.data.objects.new("TestCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 540

    tests = [
        # Three Z = 0.20 (in front of stalks, macro cluster view):
        # Three pos: (-0.38, 0.74, 0.20) => Blender loc: (-0.38, -0.20, 0.74)
        # Three target: (-0.38, 0.735, 0.078) => Blender target: (-0.38, -0.078, 0.735)
        ("test_cluster_macro_z020.png", Vector((-0.38, -0.20, 0.74)), Vector((-0.38, -0.078, 0.735)), 48),
        # Three Z = 0.24 (just past wheel rim):
        ("test_cluster_macro_z024.png", Vector((-0.38, -0.24, 0.75)), Vector((-0.38, -0.078, 0.735)), 44),
        # Three Z = 0.28 (slight cockpit context):
        ("test_cluster_macro_z028.png", Vector((-0.38, -0.28, 0.76)), Vector((-0.38, -0.078, 0.735)), 42),
    ]

    for filename, cam_loc, cam_target, fov in tests:
        cam_obj.location = cam_loc
        dir_vec = (cam_target - cam_loc).normalized()
        cam_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
        f = 36.0 / (2.0 * math.tan(math.radians(fov) / 2.0))
        cam_data.lens = f

        scene.render.filepath = os.path.join(out_dir, filename)
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {filename}")

if __name__ == "__main__":
    test_cluster_positions()
