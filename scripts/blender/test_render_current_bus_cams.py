import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import bus cockpit GLB
    glb_path = os.path.abspath("public/models/interior/cockpit_transit_bus.glb")
    print(f"Loading GLB from: {glb_path}")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Lighting setup
    # Sun light
    sun_data = bpy.data.lights.new(name="Sun", type='SUN')
    sun_data.energy = 2.5
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new(name="Sun", object_data=sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(50), math.radians(15), math.radians(45))
    
    # Cabin fill lights
    dome_data = bpy.data.lights.new(name="DomeFill", type='POINT')
    dome_data.energy = 80.0
    dome_data.color = (0.95, 0.97, 1.0)
    dome_obj = bpy.data.objects.new(name="DomeFill", object_data=dome_data)
    bpy.context.scene.collection.objects.link(dome_obj)
    dome_obj.location = (0.0, -0.8, 1.25)
    
    rear_data = bpy.data.lights.new(name="RearFill", type='POINT')
    rear_data.energy = 60.0
    rear_data.color = (0.95, 0.97, 1.0)
    rear_obj = bpy.data.objects.new(name="RearFill", object_data=rear_data)
    bpy.context.scene.collection.objects.link(rear_obj)
    rear_obj.location = (0.0, -1.8, 1.25)
    
    # Camera setup
    cam_data = bpy.data.cameras.new(name="ConfigCamera")
    cam_obj = bpy.data.objects.new(name="ConfigCamera", object_data=cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 540
    scene.render.film_transparent = False
    
    return cam_obj

def look_at(cam_obj, eye, target):
    cam_obj.location = eye
    direction = target - eye
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

def three_to_blender(three_pos):
    # Three.js: X is right, Y is up, Z is rearward
    # Blender: X is right, Y is forward (-Z_three), Z is up (Y_three)
    return Vector((three_pos[0], -three_pos[2], three_pos[1]))

def fov_to_focal_length(fov_deg, sensor_width=36.0):
    return sensor_width / (2.0 * math.tan(math.radians(fov_deg) / 2.0))

def render_pose(cam_obj, pose_name, eye_blender, target_blender, fov, output_path):
    look_at(cam_obj, eye_blender, target_blender)
    cam_obj.data.lens = fov_to_focal_length(fov)
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {pose_name} -> {output_path}")

if __name__ == "__main__":
    cam = setup_scene()
    out_dir = os.path.abspath("C:/Users/joelj/.gemini/antigravity-ide/brain/71f60dcd-8058-4911-8400-0b607a565735")
    
    # Current poses from dashboardCameraController.ts converted to Blender space
    current_poses = {
        "overview": (Vector((-0.08, -0.82, 1.00)), Vector((0.05, 0.10, 0.58)), 64),
        "dashboard_center": (Vector((0.0, -0.92, 0.92)), Vector((0.0, 0.30, 0.60)), 64),
        "steering": (Vector((-0.38, -0.64, 0.80)), Vector((-0.38, -0.246, 0.66)), 48),
        "cluster": (Vector((-0.38, -0.42, 0.81)), Vector((-0.38, -0.078, 0.735)), 38),
        "infotainment": (Vector((0.01, -0.40, 0.80)), Vector((0.01, -0.08, 0.60)), 46),
        "console": (Vector((-0.18, -0.46, 0.78)), Vector((0.0, -0.14, 0.52)), 46),
        "seats": (Vector((0.0, 0.10, 0.96)), Vector((-0.38, -0.65, 0.65)), 54),
        "doors": (Vector((-0.05, -0.48, 0.76)), Vector((-0.74, -0.30, 0.52)), 52),
        "rear_cabin": (Vector((0.0, 0.40, 0.95)), Vector((0.0, 1.35, 0.62)), 62),
        "summary": (Vector((-0.08, -0.82, 1.00)), Vector((0.05, 0.10, 0.58)), 64),
    }
    
    for name, (eye, target, fov) in current_poses.items():
        out_p = os.path.join(out_dir, f"test_current_{name}.png")
        render_pose(cam, name, eye, target, fov, out_p)
