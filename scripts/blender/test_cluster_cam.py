import bpy
import math
import os
from mathutils import Vector, Euler

def test_cameras():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Hide extra wheels and shifters
    def hide_recursive(obj):
        obj.hide_render = True
        obj.hide_viewport = True
        for ch in obj.children:
            hide_recursive(ch)

    hide_prefixes = [
        "STEERING_GT3_YOKE", "STEERING_FORMULA", "STEERING_CLASSIC",
        "STEERING_LUXURY", "STEERING_PERFORMANCE", "STEERING_GT_3SPOKE",
        "CONSOLE_SHIFTER_MANUAL", "CONSOLE_SHIFTER_TOGGLE", "CONSOLE_SHIFTER_ROTARY",
        "CONSOLE_SHIFTER_CRYSTAL", "CONSOLE_SHIFTER_PERFORMANCE"
    ]
    for obj in bpy.data.objects:
        name = obj.name.upper()
        for pref in hide_prefixes:
            if pref in name:
                hide_recursive(obj)

    # Convert Three.js coordinates to Blender:
    # Three.js: X=X, Y=Z (Up), Z=-Y (Depth)
    # So: Blender X = Three X, Blender Y = -Three Z, Blender Z = Three Y

    # Lighting
    world = bpy.data.worlds.new("TestWorld")
    world.use_nodes = True
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

    fill_data = bpy.data.lights.new("Fill", type='POINT')
    fill_data.energy = 15.0
    fill_obj = bpy.data.objects.new("Fill", fill_data)
    fill_obj.location = Vector((-0.38, -0.60, 0.85))
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

    tests = [
        # 1. Current steering preset: Three: pos=(-0.38, 0.80, 0.64), target=(-0.38, 0.66, 0.246), fov=48
        ("test_cam_steering.png", Vector((-0.38, -0.64, 0.80)), Vector((-0.38, -0.246, 0.66)), 48),
        # 2. Current cluster preset: Three: pos=(-0.38, 0.78, 0.40), target=(-0.38, 0.735, 0.078), fov=38
        ("test_cam_cluster_current.png", Vector((-0.38, -0.40, 0.78)), Vector((-0.38, -0.078, 0.735)), 38),
        # 3. High cluster view: Three: pos=(-0.38, 0.83, 0.45), target=(-0.38, 0.735, 0.078), fov=34
        ("test_cam_cluster_high.png", Vector((-0.38, -0.45, 0.83)), Vector((-0.38, -0.078, 0.735)), 34),
        # 4. Driver POV: Three: pos=(-0.38, 0.88, 0.72), target=(-0.38, 0.68, -0.25), fov=56
        ("test_cam_driver.png", Vector((-0.38, -0.72, 0.88)), Vector((-0.38, 0.25, 0.68)), 56),
    ]

    for filename, cam_loc, cam_target, fov in tests:
        cam_obj.location = cam_loc
        dir_vec = (cam_target - cam_loc).normalized()
        cam_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
        # Set FOV (focal length from FOV)
        # sensor width = 36mm
        # fov = 2 * atan(sensor / (2 * f)) => f = sensor / (2 * tan(fov/2))
        f = 36.0 / (2.0 * math.tan(math.radians(fov) / 2.0))
        cam_data.lens = f

        scene.render.filepath = os.path.join(out_dir, filename)
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {filename}")

if __name__ == "__main__":
    test_cameras()
