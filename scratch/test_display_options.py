import bpy
import math
import os
from mathutils import Vector, Euler

glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide inactive shifters to simulate Three.js runtime with standard Auto shifter
for obj in bpy.data.objects:
    name = obj.name.upper()
    if "SHIFTER_" in name and not "SHIFTER_AUTO" in name:
        obj.hide_render = True

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
fill_obj.location = Vector((0.0, -0.30, 0.80))
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

# Candidates: Three (X, Y, Z) => Blender (X, -Z, Y)
# Target: Three (0.01, 0.58, 0.08) => Blender (0.01, -0.08, 0.58)
tests = [
    # Option A: Centered view slightly above shifter:
    # Three: pos=(0.01, 0.68, 0.42), target=(0.01, 0.58, 0.08), fov=46
    ("display_opt_a.png", Vector((0.01, -0.42, 0.68)), Vector((0.01, -0.08, 0.58)), 46),

    # Option B: Driver-angled perspective:
    # Three: pos=(-0.14, 0.72, 0.44), target=(0.01, 0.58, 0.08), fov=44
    ("display_opt_b.png", Vector((-0.14, -0.44, 0.72)), Vector((0.01, -0.08, 0.58)), 44),

    # Option C: Direct eye-level touchscreen inspection:
    # Three: pos=(0.01, 0.62, 0.36), target=(0.01, 0.58, 0.08), fov=52
    ("display_opt_c.png", Vector((0.01, -0.36, 0.62)), Vector((0.01, -0.08, 0.58)), 52),
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
