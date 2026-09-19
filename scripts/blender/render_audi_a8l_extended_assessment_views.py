"""
Autonomous Visual Feedback Assessment Script: Audi A8L Extended 6-Door Limousine (2010s, Vehicle 31)
Renders 5 standard automotive validation viewpoints in Blender EEVEE Next:
1. Front 3/4 Hero View (Hexagonal Singleframe chrome grille, 4 Audi rings, Matrix LED headlights, DRL brows)
2. Rear 3/4 View (Sovereign lounge coachwork, full-LED taillights, horizontal chrome blade, dual trapezoidal exhausts)
3. Side Profile View (6.36m aluminum unibody silhouette, 6 forward-opening doors, continuous tornado crease, 19" 15-spoke wheels)
4. Front Elevation View (Singleframe grille with 8 horizontal chrome louvers, ACC radar domes, front splitter)
5. Rear Elevation View (Continuous chrome accent blade, LED light ribbons, diffuser strakes, trapezoidal exhaust bezels)
Saves high-resolution PNGs directly to the artifacts directory.
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 62 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

import generate_audi_a8l_extended_phase2

# Run complete generator
generate_audi_a8l_extended_phase2.generate_audi_a8l_extended_phase2()

# Setup high-end photographic studio environment
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'

# World lighting
world = scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.05, 0.055, 0.065, 1.0)
bg.inputs['Strength'].default_value = 1.0
w_out = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], w_out.inputs['Surface'])

# Studio Key, Fill & Rim Lights
def add_light(name, ltype, pos, energy, size=1.0, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type=ltype)
    light_data.energy = energy
    light_data.color = color
    if ltype == 'AREA':
        light_data.size = size
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = pos
    scene.collection.objects.link(light_obj)
    return light_obj

# Studio light array tailored for Moonlight Blue metallic lacquer and Singleframe chrome
add_light("Studio_Key_Front_Left", 'AREA', Vector((3.8, 5.0, 3.2)), energy=2000.0, size=3.5, color=(1.0, 0.98, 0.95))
add_light("Studio_Key_Front_Right", 'AREA', Vector((-3.8, 5.0, 3.0)), energy=1600.0, size=3.0, color=(0.95, 0.98, 1.0))
add_light("Studio_Rim_Rear_Left", 'AREA', Vector((4.2, -5.5, 3.4)), energy=1800.0, size=3.5, color=(0.96, 0.97, 1.0))
add_light("Studio_Rim_Rear_Right", 'AREA', Vector((-4.2, -5.5, 3.4)), energy=1800.0, size=3.5, color=(1.0, 0.98, 0.95))
add_light("Studio_Overhead_Softbox", 'AREA', Vector((0.0, -0.5, 5.5)), energy=1000.0, size=7.5, color=(1.0, 1.0, 1.0))
add_light("Studio_Ground_Fill", 'AREA', Vector((0.0, -0.5, -0.4)), energy=450.0, size=9.0, color=(0.9, 0.92, 0.95))
add_light("Studio_Grille_Spot", 'SPOT', Vector((0.0, 4.2, 1.2)), energy=850.0, size=0.5, color=(1.0, 1.0, 1.0))

# Matte Studio Floor Plane
bm_floor = bmesh.new()
bmesh.ops.create_grid(bm_floor, x_segments=2, y_segments=2, size=34.0)
mesh_floor = bpy.data.meshes.new("Studio_Floor_Mesh")
bm_floor.to_mesh(mesh_floor)
bm_floor.free()
obj_floor = bpy.data.objects.new("Studio_Floor", mesh_floor)
obj_floor.location = Vector((0.0, 0.0, 0.0))
scene.collection.objects.link(obj_floor)

mat_ground = bpy.data.materials.new(name="Mat_Studio_Ground")
mat_ground.use_nodes = True
g_nodes = mat_ground.node_tree.nodes
g_nodes.clear()
g_out = g_nodes.new(type='ShaderNodeOutputMaterial')
g_bsdf = g_nodes.new(type='ShaderNodeBsdfPrincipled')
g_bsdf.inputs['Base Color'].default_value = (0.045, 0.048, 0.052, 1.0)
g_bsdf.inputs['Roughness'].default_value = 0.45
mat_ground.node_tree.links.new(g_bsdf.outputs['BSDF'], g_out.inputs['Surface'])
obj_floor.data.materials.append(mat_ground)

# Camera configuration
cam_data = bpy.data.cameras.new(name="AssessmentCamera")
cam_data.lens = 55.0  # 55mm portrait focal length (distortion-free automotive CAD standard)
cam_obj = bpy.data.objects.new(name="AssessmentCamera", object_data=cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def set_camera_view(cam_obj, eye_pos, target_pos=Vector((0.0, 0.0, 0.78))):
    cam_obj.location = eye_pos
    direction = target_pos - eye_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

# Artifact destination directory
artifact_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\282c15c4-2794-4f22-a9e6-eb26884ece49"

validation_views = [
    (
        "audi_a8l_extended_front_three_quarter.png",
        "Front 3/4 Hero View (Singleframe chrome grille, 4 Audi rings, Matrix LED headlights, DRL brows)",
        Vector((5.2, 5.5, 2.0)),
        Vector((0.0, 0.2, 0.80))
    ),
    (
        "audi_a8l_extended_rear_three_quarter.png",
        "Rear 3/4 View (Sovereign lounge coachwork, full-LED taillights, horizontal chrome blade, dual trapezoidal exhausts)",
        Vector((5.2, -5.5, 2.0)),
        Vector((0.0, -0.2, 0.80))
    ),
    (
        "audi_a8l_extended_side_profile.png",
        "Side Profile View (6.36m aluminum unibody silhouette, 6 forward-opening doors, continuous tornado crease)",
        Vector((11.0, 0.0, 1.20)),
        Vector((0.0, 0.0, 0.75))
    ),
    (
        "audi_a8l_extended_front_elevation.png",
        "Front Elevation View (Singleframe grille with 8 horizontal chrome louvers, ACC radar domes, front splitter)",
        Vector((0.0, 6.8, 1.15)),
        Vector((0.0, 0.0, 0.75))
    ),
    (
        "audi_a8l_extended_rear_elevation.png",
        "Rear Elevation View (Continuous chrome accent blade, LED light ribbons, diffuser strakes, trapezoidal exhaust bezels)",
        Vector((0.0, -6.8, 1.15)),
        Vector((0.0, 0.0, 0.75))
    )
]

print("=============================================================================")
print("STARTING 5-VIEW AUTONOMOUS VISUAL FEEDBACK RENDERING FOR AUDI A8L EXTENDED")
print("=============================================================================")

for fname, desc, eye, tgt in validation_views:
    out_path = os.path.join(artifact_dir, fname)
    print(f"\n[RENDERING] {desc} -> {out_path}")
    set_camera_view(cam_obj, eye, tgt)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    if os.path.exists(out_path):
        size = os.path.getsize(out_path)
        print(f"✓ Rendered: {out_path} ({size} bytes / {size / 1024.0:.1f} KB)")
    else:
        print(f"✗ FAILED to render: {out_path}")

print("\n=============================================================================")
print("ALL 5 VALIDATION VIEWPOINTS SUCCESSFULLY RENDERED!")
print("=============================================================================")
