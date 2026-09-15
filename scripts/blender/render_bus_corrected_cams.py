import bpy
import math
import os
from mathutils import Vector

def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import bus cockpit GLB
    glb_path = os.path.abspath("public/models/interior/cockpit_transit_bus.glb")
    print(f"Loading GLB from: {glb_path}")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Lighting setup
    sun_data = bpy.data.lights.new(name="Sun", type='SUN')
    sun_data.energy = 3.0
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new(name="Sun", object_data=sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(50), math.radians(15), math.radians(45))
    
    # Cabin overhead ambient fill lights
    dome_data = bpy.data.lights.new(name="DomeFill", type='POINT')
    dome_data.energy = 120.0
    dome_data.color = (0.95, 0.97, 1.0)
    dome_obj = bpy.data.objects.new(name="DomeFill", object_data=dome_data)
    bpy.context.scene.collection.objects.link(dome_obj)
    dome_obj.location = (0.0, -0.5, 1.25)
    
    rear_data = bpy.data.lights.new(name="RearFill", type='POINT')
    rear_data.energy = 90.0
    rear_data.color = (0.95, 0.97, 1.0)
    rear_obj = bpy.data.objects.new(name="RearFill", object_data=rear_data)
    bpy.context.scene.collection.objects.link(rear_obj)
    rear_obj.location = (0.0, -1.8, 1.25)
    
    door_data = bpy.data.lights.new(name="DoorFill", type='POINT')
    door_data.energy = 70.0
    door_data.color = (0.98, 0.95, 0.90)
    door_obj = bpy.data.objects.new(name="DoorFill", object_data=door_data)
    bpy.context.scene.collection.objects.link(door_obj)
    door_obj.location = (0.5, -0.2, 1.0)

    # Camera setup
    cam_data = bpy.data.cameras.new(name="ConfigCamera")
    cam_obj = bpy.data.objects.new(name="ConfigCamera", object_data=cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Render settings - Fast EEVEE
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

def fov_to_focal_length(fov_deg, sensor_width=36.0):
    return sensor_width / (2.0 * math.tan(math.radians(fov_deg) / 2.0))

def render_pose(cam_obj, pose_name, eye, target, fov, output_path):
    look_at(cam_obj, eye, target)
    cam_obj.data.lens = fov_to_focal_length(fov)
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {pose_name} -> {output_path}")

if __name__ == "__main__":
    cam = setup_scene()
    out_dir = os.path.abspath("C:/Users/joelj/.gemini/antigravity-ide/brain/71f60dcd-8058-4911-8400-0b607a565735")
    
    # Calibrated 10 bus interior poses in Blender coordinates (X_bl = X_three, Y_bl = -Z_three, Z_bl = Y_three)
    corrected_poses = [
        ("bus_cam_01_overview", Vector((0.0, -1.30, 1.15)), Vector((-0.15, 0.10, 0.65)), 65),
        ("bus_cam_02_steering", Vector((-0.38, -0.40, 0.88)), Vector((-0.38, 0.08, 0.68)), 48),
        ("bus_cam_03_cluster", Vector((-0.38, -0.22, 0.82)), Vector((-0.38, 0.10, 0.74)), 38),
        ("bus_cam_04_infotainment", Vector((-0.05, -0.26, 0.76)), Vector((0.01, 0.08, 0.60)), 44),
        ("bus_cam_05_console", Vector((-0.12, -0.35, 0.84)), Vector((0.12, 0.04, 0.56)), 52),
        ("bus_cam_06_dashboard", Vector((-0.05, -0.85, 0.98)), Vector((-0.10, 0.08, 0.66)), 62),
        ("bus_cam_07_seats", Vector((0.12, -0.18, 0.95)), Vector((-0.38, -0.65, 0.66)), 54),
        ("bus_cam_08_rear_cabin", Vector((0.0, -0.25, 1.12)), Vector((0.0, -2.15, 0.85)), 68),
        ("bus_cam_09_doors", Vector((-0.20, -0.45, 0.96)), Vector((0.68, -0.15, 0.72)), 56),
        ("bus_cam_10_summary", Vector((-0.25, -1.35, 1.25)), Vector((0.05, -0.55, 0.70)), 64),
    ]
    
    for name, eye, target, fov in corrected_poses:
        out_p = os.path.join(out_dir, f"{name}.png")
        render_pose(cam, name, eye, target, fov, out_p)
    print("ALL 10 BUS INTERIOR CAMERA ANGLES RENDERED SUCCESSFULLY!")
