"""
Render Assessment Views: Bentley EXP 100 GT Future Limousine (Vehicle 33)
Generates 5 validation viewpoint renders for autonomous visual feedback loop.
"""
import bpy
import math
import os
from mathutils import Vector, Euler

# Output directory
output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\282c15c4-2794-4f22-a9e6-eb26884ece49"

# Import the complete vehicle GLB
glb_path = r"e:\Car_Automation\public\models\Car_Bentley_EXP100_GT_Future_Complete.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Setup render settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in dir(bpy.types) else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

# Add HDRI-style lighting
world = bpy.data.worlds.new('EXP100_Studio')
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links
nodes.clear()
bg = nodes.new('ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.25, 0.28, 0.32, 1.0)
bg.inputs['Strength'].default_value = 1.0
output = nodes.new('ShaderNodeOutputWorld')
links.new(bg.outputs['Background'], output.inputs['Surface'])

# Add 3-point studio lighting
def add_area_light(name, location, rotation_euler, energy=500, size=3.0):
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.active_object
    light.name = name
    light.rotation_euler = rotation_euler
    light.data.energy = energy
    light.data.size = size
    return light

add_area_light('Key_Light', (3.0, 3.0, 4.0), (math.radians(-45), 0, math.radians(45)), energy=800, size=4.0)
add_area_light('Fill_Light', (-3.0, 2.0, 2.5), (math.radians(-30), 0, math.radians(-45)), energy=400, size=5.0)
add_area_light('Rim_Light', (0.0, -4.0, 3.0), (math.radians(-20), 0, math.radians(180)), energy=600, size=3.0)
add_area_light('Ground_Bounce', (0.0, 0.0, -0.5), (math.radians(90), 0, 0), energy=150, size=8.0)

# Camera setup
camera_data = bpy.data.cameras.new('Assessment_Camera')
camera_data.lens = 55
camera_obj = bpy.data.objects.new('Assessment_Camera', camera_data)
scene.collection.objects.link(camera_obj)
scene.camera = camera_obj

# Define 5 assessment viewpoints
viewpoints = [
    {
        'name': 'bentley_exp100_gt_front_three_quarter',
        'location': Vector((4.5, 5.5, 2.8)),
        'rotation': Euler((math.radians(68), 0, math.radians(142)), 'XYZ'),
    },
    {
        'name': 'bentley_exp100_gt_rear_three_quarter',
        'location': Vector((-4.5, -5.5, 2.8)),
        'rotation': Euler((math.radians(68), 0, math.radians(-38)), 'XYZ'),
    },
    {
        'name': 'bentley_exp100_gt_side_profile',
        'location': Vector((10.5, 0.0, 2.0)),
        'rotation': Euler((math.radians(80), 0, math.radians(90)), 'XYZ'),
    },
    {
        'name': 'bentley_exp100_gt_front_elevation',
        'location': Vector((0.0, 8.0, 2.0)),
        'rotation': Euler((math.radians(76), 0, math.radians(0)), 'XYZ'),
    },
    {
        'name': 'bentley_exp100_gt_rear_elevation',
        'location': Vector((0.0, -8.0, 2.0)),
        'rotation': Euler((math.radians(76), 0, math.radians(180)), 'XYZ'),
    },
]

# Render each viewpoint
for vp in viewpoints:
    camera_obj.location = vp['location']
    camera_obj.rotation_euler = vp['rotation']
    
    output_path = os.path.join(output_dir, vp['name'] + '.png')
    scene.render.filepath = output_path
    
    bpy.ops.render.render(write_still=True)
    print(f"  Rendered: {output_path}")

print(f"\nAll 5 assessment views rendered successfully!")
