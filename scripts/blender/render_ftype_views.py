"""
Sets up Blender 3D viewport and camera framing for Jaguar F-Type V8 R Convertible beauty assessment.
"""
import bpy
import math
from mathutils import Vector, Euler

def setup_viewport(angle_name):
    # Ensure in Object Mode
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

    # Deselect all
    bpy.ops.object.select_all(action='DESELECT')

    # Ensure studio lighting in scene if not present
    if "Studio_Key_Light" not in bpy.data.objects:
        light_data = bpy.data.lights.new(name="Studio_Key", type='SUN')
        light_data.energy = 4.5
        light_data.color = (1.0, 0.98, 0.95)
        sun_obj = bpy.data.objects.new("Studio_Key_Light", light_data)
        bpy.context.scene.collection.objects.link(sun_obj)
        sun_obj.rotation_euler = (math.radians(50.0), math.radians(20.0), math.radians(-35.0))

    if "Studio_Fill_Light" not in bpy.data.objects:
        fill_data = bpy.data.lights.new(name="Studio_Fill", type='SUN')
        fill_data.energy = 2.5
        fill_data.color = (0.92, 0.95, 1.0)
        fill_obj = bpy.data.objects.new("Studio_Fill_Light", fill_data)
        bpy.context.scene.collection.objects.link(fill_obj)
        fill_obj.rotation_euler = (math.radians(45.0), math.radians(-30.0), math.radians(145.0))

    # Center is at Y = -1.35m, Z = 0.50m
    views = {
        "front_34": {
            "dist": 4.6,
            "loc": Vector((0.0, -0.9, 0.50)),
            "rot": Euler((math.radians(68.0), 0.0, math.radians(225.0))).to_quaternion()
        },
        "rear_34": {
            "dist": 4.6,
            "loc": Vector((0.0, -1.8, 0.50)),
            "rot": Euler((math.radians(68.0), 0.0, math.radians(45.0))).to_quaternion()
        },
        "side": {
            "dist": 5.0,
            "loc": Vector((0.0, -1.35, 0.50)),
            "rot": Euler((math.radians(88.0), 0.0, math.radians(270.0))).to_quaternion()
        },
        "front": {
            "dist": 4.0,
            "loc": Vector((0.0, 0.0, 0.45)),
            "rot": Euler((math.radians(88.0), 0.0, math.radians(180.0))).to_quaternion()
        },
        "rear": {
            "dist": 4.0,
            "loc": Vector((0.0, -2.6, 0.45)),
            "rot": Euler((math.radians(88.0), 0.0, math.radians(0.0))).to_quaternion()
        }
    }

    cfg = views.get(angle_name, views["front_34"])

    # Configure viewport space
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'
                        space.overlay.show_overlays = False
                        r3d = space.region_3d
                        r3d.view_perspective = 'PERSP'
                        r3d.view_distance = cfg["dist"]
                        r3d.view_location = cfg["loc"]
                        r3d.view_rotation = cfg["rot"]
                        r3d.update()
                        return True
    return False

if __name__ == "__main__":
    setup_viewport("front_34")
