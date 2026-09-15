"""
Renders high-resolution verification screenshots of the new clean Transit Bus Cockpit.
Validates:
1. Wheel view (framing commercial transit steering wheel, column & stalks)
2. Overview view (wide cockpit workstation from aisle)
3. Cluster view (digital instrument cluster)
4. Console view (driver side door switches & transmission controls)
"""

import bpy
import os
import math
from mathutils import Vector, Euler

def render_views():
    out_dir = r"C:\Users\joelj\.gemini\antigravity-ide\brain\71f60dcd-8058-4911-8400-0b607a565735"
    os.makedirs(out_dir, exist_ok=True)

    # Clear scene and import clean bus glb
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    glb_path = os.path.abspath("public/models/interior/cockpit_transit_bus.glb")
    print(f"Importing {glb_path}...")
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Set up lighting
    bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 720
    bpy.context.scene.render.film_transparent = False

    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.05, 0.07, 0.12, 1.0)
        bg.inputs['Strength'].default_value = 0.6

    # Key light (windshield direction)
    bpy.ops.object.light_add(type='SUN', location=(0, 2, 4))
    sun = bpy.context.active_object
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))

    # Fill light inside cabin
    bpy.ops.object.light_add(type='POINT', location=(-0.38, -0.40, 1.10))
    pt = bpy.context.active_object
    pt.data.energy = 45.0

    # Camera setup
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Camera poses in Blender coordinates (Blender X = Three.js X, Blender Y = -Three.js Z, Blender Z = Three.js Y)
    # Three.js pos (-0.38, 0.90, 0.62) -> Blender pos (-0.38, -0.62, 0.90)
    # Three.js target (-0.38, 0.66, 0.24) -> Blender target (-0.38, -0.24, 0.66)
    def look_at(cam, pos, target):
        cam.location = pos
        direction = target - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    # Hide alternate steering wheels so only primary commercial bus wheel renders
    alt_wheels = [
        "STEERING_CLASSIC_4SPOKE",
        "STEERING_LUXURY_2SPOKE",
        "STEERING_PERFORMANCE_4SPOKE",
        "STEERING_GT_3SPOKE",
        "STEERING_GT3_YOKE",
        "STEERING_FORMULA",
    ]
    for obj in bpy.data.objects:
        if any(w in obj.name for w in alt_wheels):
            obj.hide_render = True
            obj.hide_viewport = True

    # Enable blend transparency for glass materials
    for mat in bpy.data.materials:
        if "Glass" in mat.name or "glass" in mat.name:
            if hasattr(mat, "blend_method"):
                mat.blend_method = 'BLEND'
            if hasattr(mat, "shadow_method"):
                mat.shadow_method = 'NONE'

    views = [
        ("clean_bus_01_wheel.png", Vector((-0.38, -0.68, 0.90)), Vector((-0.38, -0.24, 0.66)), 58),
        ("clean_bus_02_overview.png", Vector((0.15, -0.72, 1.05)), Vector((-0.20, -0.05, 0.65)), 62),
        ("clean_bus_03_cluster.png", Vector((-0.38, -0.38, 0.78)), Vector((-0.38, -0.075, 0.735)), 42),
        ("clean_bus_04_display.png", Vector((-0.12, -0.42, 0.75)), Vector((0.04, -0.04, 0.61)), 46),
        ("clean_bus_05_console.png", Vector((-0.18, -0.40, 0.85)), Vector((-0.08, -0.10, 0.60)), 50),
    ]

    for filename, pos, target, fov in views:
        look_at(cam_obj, pos, target)
        cam_data.lens_unit = 'FOV'
        cam_data.angle = math.radians(fov)
        bpy.context.view_layer.update()

        out_path = os.path.join(out_dir, filename)
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {out_path}")

if __name__ == "__main__":
    render_views()
