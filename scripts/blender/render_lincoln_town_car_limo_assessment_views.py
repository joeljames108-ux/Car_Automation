"""
=============================================================================
Lincoln Town Car Stretch Limousine (1980s) - Autonomous Visual Feedback Pipeline
Renders 5 Automotive Validation Views into Artifacts Directory
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import the Phase 56 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
generators_dir = os.path.join(gen_dir, "generators")
if generators_dir not in sys.path:
    sys.path.append(generators_dir)

import generate_lincoln_town_car_limo_phase2

# Run complete vehicle generation and GLB export
generate_lincoln_town_car_limo_phase2.generate_lincoln_town_car_limo_phase2()

# Setup Studio Lighting and Ground Plane
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
if hasattr(scene, 'eevee'):
    if hasattr(scene.eevee, 'use_gtao'):
        scene.eevee.use_gtao = True
    if hasattr(scene.eevee, 'use_bloom'):
        scene.eevee.use_bloom = True
    if hasattr(scene.eevee, 'use_ssr'):
        scene.eevee.use_ssr = True

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

world = scene.world
if world is None:
    world = bpy.data.worlds.new("Lincoln_Studio_World")
    scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.09, 0.10, 0.12, 1.0)
bg.inputs['Strength'].default_value = 1.2
out = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], out.inputs['Surface'])

# Studio Lights
def add_light(name, light_type, energy, location, rotation=None):
    light_data = bpy.data.lights.new(name=name, type=light_type)
    light_data.energy = energy
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = location
    if rotation:
        light_obj.rotation_euler = rotation
    scene.collection.objects.link(light_obj)
    return light_obj

add_light("Key_Light", 'AREA', 2800.0, (6.5, 6.8, 5.0))
add_light("Fill_Light", 'AREA', 1600.0, (-6.5, -5.5, 4.2))
add_light("Rim_Light", 'SPOT', 2100.0, (-5.5, 7.0, 4.0))
add_light("Overhead_Softbox", 'AREA', 3400.0, (0.0, 0.0, 7.5))

# Ground studio platform
bm_ground = bmesh.new()
bmesh.ops.create_grid(bm_ground, x_segments=2, y_segments=2, size=40.0)
mesh_ground = bpy.data.meshes.new("Ground_Mesh")
bm_ground.to_mesh(mesh_ground)
bm_ground.free()
obj_ground = bpy.data.objects.new("Studio_Ground", mesh_ground)
scene.collection.objects.link(obj_ground)
mat_ground = bpy.data.materials.new("Studio_Ground_Mat")
mat_ground.use_nodes = True
bsdf_g = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf_g:
    bsdf_g.inputs['Base Color'].default_value = (0.05, 0.06, 0.07, 1.0)
    bsdf_g.inputs['Roughness'].default_value = 0.35
obj_ground.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("Assessment_Camera")
cam_data.lens = 50
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def point_camera(cam, target):
    loc = cam.location
    direction = Vector(target) - loc
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

views = [
    ("lincoln_town_car_limo_front_three_quarter", "Front 3/4 Hero View (Waterfall grille, quad halogen optics, standup star ornament, turbine wheels, whitewall tires)", (6.2, 6.5, 2.2), (0.0, 0.6, 0.75)),
    ("lincoln_town_car_limo_rear_three_quarter", "Rear 3/4 View (Full-width horizontal light bar, rear 5-mph bumper, padded Cambria roof, French backlight, C-pillar opera lamps)", (-6.2, -6.5, 2.2), (0.0, -0.6, 0.75)),
    ("lincoln_town_car_limo_side_profile", "Side Profile View (6.8m stretch silhouette, brushed aluminum B-pillar band, illuminated opera lamps, turbine wheels, whitewall tires)", (9.4, -0.05, 1.35), (0.0, -0.05, 0.75)),
    ("lincoln_town_car_limo_front_elevation", "Front Elevation View (Upright chrome waterfall grille, quad sealed-beam lamps, bumperettes, fender-top fiber optic monitors)", (0.0, 6.8, 1.25), (0.0, 3.2, 0.75)),
    ("lincoln_town_car_limo_rear_elevation", "Rear Elevation View (Full-width ruby light bar, backup lights, license plate pocket, dual chrome exhaust tips, formal rear window)", (0.0, -7.0, 1.25), (0.0, -3.2, 0.75))
]

artifacts_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\282c15c4-2794-4f22-a9e6-eb26884ece49"
os.makedirs(artifacts_dir, exist_ok=True)

print("\n=============================================================================")
print("STARTING 5-VIEW AUTONOMOUS VISUAL FEEDBACK RENDERING FOR LINCOLN TOWN CAR LIMO")
print("=============================================================================")

for file_id, desc, cam_pos, target_pos in views:
    out_path = os.path.join(artifacts_dir, f"{file_id}.png")
    cam_obj.location = Vector(cam_pos)
    point_camera(cam_obj, target_pos)
    scene.render.filepath = out_path
    print(f"\n[RENDERING] {desc} -> {out_path}")
    bpy.ops.render.render(write_still=True)
    size_bytes = os.path.getsize(out_path)
    print(f"✓ Rendered: {out_path} ({size_bytes} bytes / {size_bytes / 1024:.1f} KB)")

print("\n=============================================================================")
print("ALL 5 VALIDATION VIEWPOINTS SUCCESSFULLY RENDERED!")
print("=============================================================================")
