"""
=============================================================================
Autonomous Blender Visual Feedback Loop: Mazda MX-5 Miata (ND) (2010s)
5-Angle Validation Render Suite (EEVEE)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

# Import Phase 34 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

from generate_mazda_mx5_nd_phase2 import generate_mazda_mx5_nd_phase2

def setup_studio_lighting():
    # World lighting
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("MX5_Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1.0)
        bg.inputs["Strength"].default_value = 0.85

    # Key light
    key_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_data.energy = 450.0
    key_data.size = 5.0
    key_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new(name="Key_Light", object_data=key_data)
    key_obj.location = Vector((3.5, 3.5, 4.0))
    key_obj.rotation_euler = Euler((math.radians(45), 0, math.radians(45)), 'XYZ')
    bpy.context.scene.collection.objects.link(key_obj)

    # Fill light
    fill_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_data.energy = 260.0
    fill_data.size = 6.0
    fill_data.color = (0.85, 0.90, 1.0)
    fill_obj = bpy.data.objects.new(name="Fill_Light", object_data=fill_data)
    fill_obj.location = Vector((-4.0, -2.5, 3.5))
    fill_obj.rotation_euler = Euler((math.radians(50), 0, math.radians(-130)), 'XYZ')
    bpy.context.scene.collection.objects.link(fill_obj)

    # Rim light
    rim_data = bpy.data.lights.new(name="Rim_Light", type='SPOT')
    rim_data.energy = 750.0
    rim_data.spot_size = math.radians(60)
    rim_data.color = (1.0, 0.95, 0.90)
    rim_obj = bpy.data.objects.new(name="Rim_Light", object_data=rim_data)
    rim_obj.location = Vector((0.0, -5.0, 3.8))
    rim_obj.rotation_euler = Euler((math.radians(55), 0, math.radians(180)), 'XYZ')
    bpy.context.scene.collection.objects.link(rim_obj)


def capture_validation_angles():
    # 1. Generate complete vehicle
    generate_mazda_mx5_nd_phase2(export_glb=False)
    setup_studio_lighting()

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.film_transparent = False

    cam_data = bpy.data.cameras.new(name="Validation_Cam")
    cam_data.lens = 65.0
    cam_obj = bpy.data.objects.new(name="Validation_Cam", object_data=cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    out_dir = os.path.join(base_dir, "exports", "renders", "mazda_mx5_nd")
    os.makedirs(out_dir, exist_ok=True)

    # 5 standard validation angles
    angles = [
        ("front_three_quarter", Vector((3.4, 3.8, 1.8)), Vector((0.0, 0.3, 0.65))),
        ("rear_three_quarter",  Vector((3.4, -3.8, 1.7)), Vector((0.0, -0.3, 0.60))),
        ("side_profile",        Vector((5.2, 0.0, 1.25)), Vector((0.0, 0.0, 0.60))),
        ("front_elevation",     Vector((0.0, 5.0, 1.10)), Vector((0.0, 0.5, 0.55))),
        ("rear_elevation",      Vector((0.0, -4.8, 1.15)), Vector((0.0, -0.5, 0.55)))
    ]

    for name, loc, look_at in angles:
        cam_obj.location = loc
        dir_vec = look_at - loc
        rot_quat = dir_vec.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        out_img = os.path.join(out_dir, f"mx5_nd_{name}.png")
        scene.render.filepath = out_img
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {out_img}")

if __name__ == "__main__":
    capture_validation_angles()
