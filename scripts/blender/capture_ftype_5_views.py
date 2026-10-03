"""
Captures and saves all 5 canonical automotive validation views for Jaguar F-Type V8 R Convertible.
"""
import os
import bpy
import math
from mathutils import Vector, Euler

def capture_all_views():
    artifacts_dir = r"C:/Users/acer/.gemini/antigravity-ide/brain/fbb2023f-5dad-483d-9587-0dee9ed24815"
    docs_dir = r"e:/Car_Automation/docs/screenshots/ftype"
    os.makedirs(docs_dir, exist_ok=True)
    os.makedirs(artifacts_dir, exist_ok=True)

    # Ensure Object Mode
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')

    # Studio Lighting
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
    views = [
        ("ftype_1_front_34", 4.6, Vector((0.0, -0.9, 0.50)), Euler((math.radians(68.0), 0.0, math.radians(225.0))).to_quaternion()),
        ("ftype_2_rear_34",  4.6, Vector((0.0, -1.8, 0.50)), Euler((math.radians(68.0), 0.0, math.radians(45.0))).to_quaternion()),
        ("ftype_3_side",     5.0, Vector((0.0, -1.35, 0.50)), Euler((math.radians(88.0), 0.0, math.radians(270.0))).to_quaternion()),
        ("ftype_4_front",    4.0, Vector((0.0, 0.0, 0.45)), Euler((math.radians(88.0), 0.0, math.radians(180.0))).to_quaternion()),
        ("ftype_5_rear",     4.0, Vector((0.0, -2.6, 0.45)), Euler((math.radians(88.0), 0.0, math.radians(0.0))).to_quaternion()),
    ]

    saved_files = []

    # Find 3D View area
    space_3d = None
    r3d = None
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space_3d = space
                        r3d = space.region_3d
                        break
                if space_3d:
                    break
        if space_3d:
            break

    if not space_3d:
        print("ERROR: Could not find 3D viewport")
        return []

    space_3d.shading.type = 'MATERIAL'
    space_3d.overlay.show_overlays = False
    r3d.view_perspective = 'PERSP'

    for name, dist, loc, rot in views:
        r3d.view_distance = dist
        r3d.view_location = loc
        r3d.view_rotation = rot
        r3d.update()

        # Render OpenGL viewport
        path_docs = os.path.join(docs_dir, f"{name}.png")
        path_art = os.path.join(artifacts_dir, f"{name}.png")

        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.context.scene.render.filepath = path_docs
        bpy.ops.render.opengl(write_still=True)

        if os.path.exists(path_docs):
            import shutil
            shutil.copy2(path_docs, path_art)
            saved_files.append((name, path_docs, path_art))
            print(f"Captured {name}: {path_docs}")

    return saved_files

if __name__ == "__main__":
    capture_all_views()
