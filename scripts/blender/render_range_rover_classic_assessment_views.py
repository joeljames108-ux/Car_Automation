"""
=============================================================================
Autonomous Visual Feedback Loop: Range Rover Classic 3-Door (Vehicle 34, 1970s)
Generates 5 standard automotive validation viewpoints with accurate look-at
tracking, studio 3-point lighting, ground shadow floor, and 1080p rendering.
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

# Destination directory in active agent brain
output_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\ffb9c6c7-59f3-45ce-b19a-94c310375b11"
os.makedirs(output_dir, exist_ok=True)

# Master GLB path
glb_path = r"e:\Car_Automation\public\models\Car_Range_Rover_Classic_1970s_Complete.glb"

print("=" * 80)
print(f"LOADING VEHICLE 34: {glb_path}")
print("=" * 80)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in dir(bpy.types) else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

# --- World & Ambient Environment ---
world = bpy.data.worlds.new('RRC_Assessment_World')
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new('ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.20, 0.22, 0.26, 1.0)
bg.inputs['Strength'].default_value = 1.0
output = nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], output.inputs['Surface'])

# --- Ground Studio Floor (Set to tire contact patch at Z = -0.105m) ---
bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0.0, 0.0, -0.105))
obj_floor = bpy.context.active_object
obj_floor.name = "STUDIO_Floor"
mat_floor = bpy.data.materials.new(name="Mat_Studio_Floor")
mat_floor.use_nodes = True
f_nodes = mat_floor.node_tree.nodes
f_nodes.clear()
f_out = f_nodes.new(type='ShaderNodeOutputMaterial')
f_bsdf = f_nodes.new(type='ShaderNodeBsdfPrincipled')
f_bsdf.inputs['Base Color'].default_value = (0.05, 0.055, 0.065, 1.0)
f_bsdf.inputs['Roughness'].default_value = 0.40
if 'Specular IOR Level' in f_bsdf.inputs:
    f_bsdf.inputs['Specular IOR Level'].default_value = 0.3
elif 'Specular' in f_bsdf.inputs:
    f_bsdf.inputs['Specular'].default_value = 0.3
mat_floor.node_tree.links.new(f_bsdf.outputs['BSDF'], f_out.inputs['Surface'])
obj_floor.data.materials.append(mat_floor)

# --- Glass Transparency Setup for Viewport/EEVEE ---
for m in bpy.data.materials:
    if "glass" in m.name.lower():
        if hasattr(m, "blend_method"):
            m.blend_method = 'BLEND'
        if hasattr(m, "shadow_method"):
            m.shadow_method = 'NONE'
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = 'DITHERED'
        if m.use_nodes:
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                if "Alpha" in bsdf.inputs:
                    bsdf.inputs["Alpha"].default_value = 0.28
                if "Roughness" in bsdf.inputs:
                    bsdf.inputs["Roughness"].default_value = 0.02
                if "Transmission Weight" in bsdf.inputs:
                    bsdf.inputs["Transmission Weight"].default_value = 0.95

# --- 3-Point Studio Lighting ---
def add_area_light(name, location, target_pos, energy=1400, size=6.0):
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.active_object
    light.name = name
    direction = target_pos - Vector(location)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    light.rotation_euler = rot_quat.to_euler()
    light.data.energy = energy
    light.data.size = size
    return light

target_center = Vector((0.0, 0.0, 0.85))
add_area_light('Key_Light_Front', (5.5, 6.0, 5.0), target_center, energy=1800, size=6.0)
add_area_light('Fill_Light_Rear', (-5.5, -5.5, 4.5), target_center, energy=1200, size=7.0)
add_area_light('Rim_Light_Top', (0.0, 0.0, 7.5), target_center, energy=1000, size=8.0)
add_area_light('Side_Light_Right', (-6.5, 1.5, 3.5), target_center, energy=800, size=5.0)
add_area_light('Ground_Bounce', (0.0, 0.0, -0.2), target_center, energy=300, size=10.0)

# --- Camera Setup ---
cam_data = bpy.data.cameras.new(name="Assessment_Camera")
cam_data.lens = 55.0  # 55mm portrait focal length (distortion-free automotive CAD standard)
cam_obj = bpy.data.objects.new(name="Assessment_Camera", object_data=cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def set_camera_view(cam_obj, eye_pos, target_pos=Vector((0.0, 0.0, 0.85))):
    cam_obj.location = eye_pos
    direction = target_pos - eye_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

validation_viewpoints = [
    {
        'filename': 'range_rover_classic_front_three_quarter.png',
        'title': 'Front 3/4 Hero View (Lucas 7" Lamps, Bahama Gold Paint, Rostyle Wheels, Clamshell Bonnet)',
        'eye': Vector((4.8, 5.2, 2.3)),
        'target': Vector((0.0, 0.2, 0.85)),
    },
    {
        'filename': 'range_rover_classic_rear_three_quarter.png',
        'title': 'Rear 3/4 View (Split Tailgate, Floating Roof, 3-Tier Taillamps, Rubber Overriders)',
        'eye': Vector((4.8, -5.2, 2.3)),
        'target': Vector((0.0, -0.2, 0.85)),
    },
    {
        'filename': 'range_rover_classic_side_profile.png',
        'title': 'Side Profile View (Floating Roof, Slim Pillars, 205/80R16 Tires, Slab-Sided Flanks)',
        'eye': Vector((9.0, 0.0, 1.4)),
        'target': Vector((0.0, 0.0, 0.85)),
    },
    {
        'filename': 'range_rover_classic_front_elevation.png',
        'title': 'Front Elevation (Recessed Grille, RANGE ROVER Block Lettering, Chrome Bumper)',
        'eye': Vector((0.0, 7.2, 1.3)),
        'target': Vector((0.0, 0.0, 0.80)),
    },
    {
        'filename': 'range_rover_classic_rear_elevation.png',
        'title': 'Rear Elevation (Split Tailgate Upper Hatch/Lower Gate, Wiper, Chrome Bumper)',
        'eye': Vector((0.0, -7.2, 1.3)),
        'target': Vector((0.0, 0.0, 0.80)),
    },
]

print("\n" + "=" * 80)
print("EXECUTING AUTONOMOUS 5-VIEW ASSESSMENT RENDERS")
print("=" * 80)

for vp in validation_viewpoints:
    set_camera_view(cam_obj, vp['eye'], vp['target'])
    out_path = os.path.join(output_dir, vp['filename'])
    scene.render.filepath = out_path
    print(f"Rendering: {vp['title']} -> {vp['filename']}")
    bpy.ops.render.render(write_still=True)
    f_size = os.path.getsize(out_path)
    print(f"  ✓ Rendered: {out_path} ({f_size:,} bytes)")

print("\n✓ All 5 assessment viewpoints successfully rendered!")
