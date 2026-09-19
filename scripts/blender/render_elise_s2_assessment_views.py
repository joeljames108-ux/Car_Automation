"""
=============================================================================
Autonomous 5-Angle Validation & Visual Assessment Suite: Lotus Elise Series 2 (2000s)
=============================================================================
Renders high-resolution validation views across 5 standard automotive angles:
1. Front 3/4
2. Rear 3/4
3. Side Profile
4. Front Elevation
5. Rear Elevation
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

# Import Phase 32 Generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_path = os.path.join(gen_dir, "generators")
if generators_path not in sys.path:
    sys.path.append(generators_path)

import generate_lotus_elise_s2_phase2

def setup_studio_lighting():
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.film_transparent = False

    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Elise_Studio_World")
        scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.05, 0.05, 0.06, 1.0)
        bg.inputs['Strength'].default_value = 1.0

    for light_data in [
        ("Key_Softbox", Vector((-3.2, 3.8, 3.4)), 480.0, (1.0, 0.98, 0.95)),
        ("Fill_Cool", Vector((3.4, 2.8, 2.2)), 260.0, (0.92, 0.96, 1.0)),
        ("Rim_Rear", Vector((0.0, -4.6, 3.2)), 550.0, (1.0, 0.99, 0.96)),
        ("Under_Glow", Vector((0.0, 0.0, -0.4)), 80.0, (0.8, 0.85, 0.9)),
    ]:
        light = bpy.data.lights.new(name=light_data[0], type='POINT')
        light.energy = light_data[2]
        light.color = light_data[3]
        light_obj = bpy.data.objects.new(name=light_data[0], object_data=light)
        light_obj.location = light_data[1]
        scene.collection.objects.link(light_obj)

    # Studio Floor
    bpy.ops.mesh.primitive_plane_add(size=35.0, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Studio_Ground_Plane"
    mat_ground = bpy.data.materials.new("MAT_Studio_Ground")
    mat_ground.use_nodes = True
    bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.07, 0.07, 0.08, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.35
        bsdf.inputs['Metallic'].default_value = 0.20
    ground.data.materials.append(mat_ground)


def position_camera(cam_obj, target_pt, distance, azimuth_deg, elevation_deg):
    az_rad = math.radians(azimuth_deg)
    el_rad = math.radians(elevation_deg)
    cx = target_pt.x + distance * math.cos(el_rad) * math.sin(az_rad)
    cy = target_pt.y + distance * math.cos(el_rad) * math.cos(az_rad)
    cz = target_pt.z + distance * math.sin(el_rad)
    cam_obj.location = Vector((cx, cy, cz))

    direction = target_pt - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()


def render_elise_s2_validation_views():
    # 1. Execute Complete Master Assembly (Purges all default objects)
    generate_lotus_elise_s2_phase2.build_lotus_elise_s2_phase2()

    # 2. Setup Lighting & Ground
    setup_studio_lighting()

    # 3. Create Camera
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("Validation_Camera")
    cam_data.lens = 54.0
    cam_obj = bpy.data.objects.new("Validation_Camera", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # 4. Target Points and Angles
    target = Vector((0.0, 0.0, 0.520))
    artifacts_dir = "C:\\Users\\acer\\.gemini\\antigravity-ide\\brain\\6b65af10-4dec-4c71-90b8-d02c18319690"
    os.makedirs(artifacts_dir, exist_ok=True)

    views = [
        ("elise_s2_front_three_quarter", 4.8, 38.0, 14.0),
        ("elise_s2_rear_three_quarter", 4.8, 142.0, 14.0),
        ("elise_s2_side_profile", 4.5, 90.0, 4.0),
        ("elise_s2_front_elevation", 4.2, 0.0, 6.0),
        ("elise_s2_rear_elevation", 4.2, 180.0, 6.0),
    ]

    for (name, dist, az, el) in views:
        position_camera(cam_obj, target, dist, az, el)
        out_png = os.path.join(artifacts_dir, f"{name}.png")
        scene.render.filepath = out_png
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {name} -> {out_png} ({os.path.getsize(out_png)} bytes)")

    print("[COMPLETE] All 5 Lotus Elise S2 assessment views rendered successfully.")


if __name__ == "__main__":
    render_elise_s2_validation_views()
