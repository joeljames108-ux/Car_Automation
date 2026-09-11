import bpy
import math
import os
from mathutils import Vector, Euler

def test_angles():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Lighting
    world = bpy.data.worlds.new("TestWorld")
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.7, 0.75, 0.85, 1.0)
        bg.inputs["Strength"].default_value = 1.0
    bpy.context.scene.world = world

    sun_data = bpy.data.lights.new("SunKey", type='SUN')
    sun_data.energy = 4.0
    sun_obj = bpy.data.objects.new("SunKey", sun_data)
    sun_obj.rotation_euler = Euler((math.radians(50), math.radians(15), math.radians(-25)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    fill_data = bpy.data.lights.new("Fill", type='POINT')
    fill_data.energy = 25.0
    fill_obj = bpy.data.objects.new("Fill", fill_data)
    fill_obj.location = Vector((-0.38, -0.40, 0.80))
    bpy.context.scene.collection.objects.link(fill_obj)

    cam_data = bpy.data.cameras.new("TestCam")
    cam_data.clip_start = 0.05
    cam_obj = bpy.data.objects.new("TestCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 540

    # Test positions (converted from Three.js: Blender X = Three X, Blender Y = -Three Z, Blender Z = Three Y)
    # Cluster center in Blender is: X=-0.38, Y=-0.078, Z=0.735
    # Three.js target: (-0.38, 0.735, 0.078)
    candidates = [
        # 1. Close macro view: Three pos=(-0.38, 0.75, 0.22), target=(-0.38, 0.735, 0.078), fov=52
        ("cluster_cand_1.png", Vector((-0.38, -0.22, 0.75)), Vector((-0.38, -0.078, 0.735)), 52),
        # 2. Medium view: Three pos=(-0.38, 0.77, 0.28), target=(-0.38, 0.735, 0.078), fov=46
        ("cluster_cand_2.png", Vector((-0.38, -0.28, 0.77)), Vector((-0.38, -0.078, 0.735)), 46),
        # 3. Higher driver angle: Three pos=(-0.38, 0.82, 0.38), target=(-0.38, 0.730, 0.078), fov=40
        ("cluster_cand_3.png", Vector((-0.38, -0.38, 0.82)), Vector((-0.38, -0.078, 0.730)), 40),
        # 4. Elevated over rim: Three pos=(-0.38, 0.85, 0.35), target=(-0.38, 0.725, 0.078), fov=42
        ("cluster_cand_4.png", Vector((-0.38, -0.35, 0.85)), Vector((-0.38, -0.078, 0.725)), 42),
        # 5. In-front of wheel (between wheel and cluster): Three pos=(-0.38, 0.74, 0.16), target=(-0.38, 0.735, 0.078), fov=62
        ("cluster_cand_5.png", Vector((-0.38, -0.16, 0.74)), Vector((-0.38, -0.078, 0.735)), 62),
    ]

    for filename, cam_loc, cam_target, fov in candidates:
        cam_obj.location = cam_loc
        dir_vec = (cam_target - cam_loc).normalized()
        cam_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
        f = 36.0 / (2.0 * math.tan(math.radians(fov) / 2.0))
        cam_data.lens = f

        scene.render.filepath = os.path.join(out_dir, filename)
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {filename}")

if __name__ == "__main__":
    test_angles()
