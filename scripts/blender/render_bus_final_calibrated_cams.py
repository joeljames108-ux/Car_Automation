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
    sun_data.energy = 3.2
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new(name="Sun", object_data=sun_data)
    bpy.context.scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(50), math.radians(15), math.radians(45))
    
    # Cabin overhead ambient fill lights
    dome_data = bpy.data.lights.new(name="DomeFill", type='POINT')
    dome_data.energy = 140.0
    dome_data.color = (0.95, 0.97, 1.0)
    dome_obj = bpy.data.objects.new(name="DomeFill", object_data=dome_data)
    bpy.context.scene.collection.objects.link(dome_obj)
    dome_obj.location = (0.0, -0.6, 1.25)
    
    rear_data = bpy.data.lights.new(name="RearFill", type='POINT')
    rear_data.energy = 100.0
    rear_data.color = (0.95, 0.97, 1.0)
    rear_obj = bpy.data.objects.new(name="RearFill", object_data=rear_data)
    bpy.context.scene.collection.objects.link(rear_obj)
    rear_obj.location = (0.0, -1.8, 1.25)
    
    driver_data = bpy.data.lights.new(name="DriverFill", type='POINT')
    driver_data.energy = 60.0
    driver_data.color = (1.0, 0.98, 0.92)
    driver_obj = bpy.data.objects.new(name="DriverFill", object_data=driver_data)
    bpy.context.scene.collection.objects.link(driver_obj)
    driver_obj.location = (-0.38, -0.2, 1.0)

    door_data = bpy.data.lights.new(name="DoorFill", type='POINT')
    door_data.energy = 80.0
    door_data.color = (0.98, 0.95, 0.90)
    door_obj = bpy.data.objects.new(name="DoorFill", object_data=door_data)
    bpy.context.scene.collection.objects.link(door_obj)
    door_obj.location = (0.45, -0.3, 1.0)

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
    
    # Finely-calibrated 10 bus interior poses in Blender coordinates (X_bl = X_three, Y_bl = -Z_three, Z_bl = Y_three)
    calibrated_poses = [
        ("bus_cam_01_overview_final", Vector((0.16, -1.25, 1.12)), Vector((-0.16, 0.00, 0.64)), 62),
        ("bus_cam_02_steering_final", Vector((-0.38, -0.58, 0.88)), Vector((-0.38, 0.04, 0.64)), 52),
        ("bus_cam_03_cluster_final", Vector((-0.38, -0.38, 0.82)), Vector((-0.38, 0.09, 0.73)), 42),
        ("bus_cam_04_infotainment_final", Vector((-0.04, -0.38, 0.76)), Vector((0.01, 0.08, 0.58)), 46),
        ("bus_cam_05_console_final", Vector((-0.10, -0.44, 0.86)), Vector((0.10, -0.02, 0.54)), 50),
        ("bus_cam_06_dashboard_final", Vector((0.18, -0.95, 1.02)), Vector((-0.16, 0.06, 0.66)), 62),
        ("bus_cam_07_seats_final", Vector((0.20, -0.32, 1.02)), Vector((-0.38, -0.65, 0.64)), 54),
        ("bus_cam_08_rear_cabin_final", Vector((-0.12, -0.22, 1.06)), Vector((0.00, -2.15, 0.85)), 65),
        ("bus_cam_09_doors_final", Vector((-0.12, -0.78, 1.00)), Vector((0.65, -0.18, 0.72)), 56),
        ("bus_cam_10_summary_final", Vector((0.08, -1.25, 1.25)), Vector((-0.08, -0.35, 0.68)), 65),
    ]
    
    for name, eye, target, fov in calibrated_poses:
        out_p = os.path.join(out_dir, f"{name}.png")
        render_pose(cam, name, eye, target, fov, out_p)
    print("ALL 10 BUS FINAL CALIBRATED ANGLES RENDERED SUCCESSFULLY!")
