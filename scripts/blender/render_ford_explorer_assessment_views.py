"""
=============================================================================
Autonomous Visual Feedback Loop: Ford Explorer 1st Gen (Vehicle 36, 1990s)
Generates 5 standard automotive validation viewpoints with accurate look-at
tracking, studio 3-point lighting, ground shadow floor, and 1080p rendering.
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

# Destination directories
output_dir_brain = r"C:\Users\acer\.gemini\antigravity-ide\brain\b4a77049-12bb-41b8-a852-bdc782fd07d7"
output_dir_assets = r"e:\Car_Automation\assets\screenshots\ford_explorer"
os.makedirs(output_dir_brain, exist_ok=True)
os.makedirs(output_dir_assets, exist_ok=True)

# Master GLB path
glb_path = r"e:\Car_Automation\public\models\vehicles\suv\1990s\vehicle.glb"

print("=" * 80)
print(f"LOADING VEHICLE #54: {glb_path}")
print("=" * 80)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide collision hitboxes so they don't occlude beauty geometry
for o in bpy.data.objects:
    if "hitbox" in o.name.lower():
        o.hide_render = True
        o.hide_viewport = True

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in dir(bpy.types) else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

# --- World & Ambient Environment ---
world = bpy.data.worlds.new('Explorer_Assessment_World')
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new('ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.22, 0.23, 0.26, 1.0)
bg.inputs['Strength'].default_value = 1.0
output = nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], output.inputs['Surface'])

# --- Ground Studio Floor (Centered at Y = -1.50m) ---
bpy.ops.mesh.primitive_plane_add(size=45.0, location=(0.0, -1.5, 0.0))
obj_floor = bpy.context.active_object
obj_floor.name = "STUDIO_Floor"
mat_floor = bpy.data.materials.new(name="Mat_Studio_Floor")
mat_floor.use_nodes = True
f_nodes = mat_floor.node_tree.nodes
f_nodes.clear()
f_out = f_nodes.new(type='ShaderNodeOutputMaterial')
f_bsdf = f_nodes.new(type='ShaderNodeBsdfPrincipled')
f_bsdf.inputs['Base Color'].default_value = (0.06, 0.065, 0.075, 1.0)
f_bsdf.inputs['Roughness'].default_value = 0.38
if 'Specular IOR Level' in f_bsdf.inputs:
    f_bsdf.inputs['Specular IOR Level'].default_value = 0.35
elif 'Specular' in f_bsdf.inputs:
    f_bsdf.inputs['Specular'].default_value = 0.35
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
                    bsdf.inputs["Alpha"].default_value = 0.26
                if "Roughness" in bsdf.inputs:
                    bsdf.inputs["Roughness"].default_value = 0.02
                if "Transmission Weight" in bsdf.inputs:
                    bsdf.inputs["Transmission Weight"].default_value = 0.94

# --- 3-Point Studio Lighting ---
def add_area_light(name, location, target_pos, energy=1500, size=7.0):
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.active_object
    light.name = name
    direction = target_pos - Vector(location)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    light.rotation_euler = rot_quat.to_euler()
    light.data.energy = energy
    light.data.size = size
    return light

target_center = Vector((0.0, -1.5, 0.85))
add_area_light('Key_Light_Front', (6.0, 5.5, 5.2), target_center, energy=2000, size=7.0)
add_area_light('Fill_Light_Rear', (-6.0, -6.5, 4.8), target_center, energy=1400, size=8.0)
add_area_light('Rim_Light_Top', (0.0, -1.5, 8.0), target_center, energy=1200, size=9.0)
add_area_light('Side_Light_Right', (-7.5, -0.5, 3.8), target_center, energy=900, size=6.0)
add_area_light('Ground_Bounce', (0.0, -1.5, -0.2), target_center, energy=350, size=12.0)

# --- Camera Setup ---
cam_data = bpy.data.cameras.new(name="Assessment_Camera")
cam_data.lens = 55.0
cam_obj = bpy.data.objects.new(name="Assessment_Camera", object_data=cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def set_camera_view(cam_obj, eye_pos, target_pos=Vector((0.0, -1.5, 0.85))):
    cam_obj.location = eye_pos
    direction = target_pos - eye_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

validation_viewpoints = [
    {
        'filename': 'ford_explorer_front_three_quarter.png',
        'title': 'Front 3/4 Hero View (Hunter Green Paint, Egg-Crate Grille, Composite Lights, Charcoal Cladding)',
        'eye': Vector((5.2, 4.4, 2.3)),
        'target': Vector((0.0, -0.6, 0.85)),
    },
    {
        'filename': 'ford_explorer_rear_three_quarter.png',
        'title': 'Rear 3/4 View (2-Piece Liftgate, Flip-Up Glass, Blackout Pillars, Roof Luggage Rack)',
        'eye': Vector((5.2, -6.8, 2.3)),
        'target': Vector((0.0, -2.4, 0.85)),
    },
    {
        'filename': 'ford_explorer_side_profile.png',
        'title': 'Side Profile View (Charcoal Cladding, Teardrop Alloy Wheels, Goodyear Wrangler Tires)',
        'eye': Vector((8.5, -1.5, 1.4)),
        'target': Vector((0.0, -1.5, 0.85)),
    },
    {
        'filename': 'ford_explorer_front_elevation.png',
        'title': 'Front Elevation (Egg-Crate Grille with Blue Oval, Aerodynamic Bumper, Flush Lights)',
        'eye': Vector((0.0, 6.4, 1.2)),
        'target': Vector((0.0, 0.0, 0.80)),
    },
    {
        'filename': 'ford_explorer_rear_elevation.png',
        'title': 'Rear Elevation (Split Liftgate Window, Integrated Bumper with Step Pad, Roof Rack)',
        'eye': Vector((0.0, -8.4, 1.2)),
        'target': Vector((0.0, -3.0, 0.80)),
    },
]

print("\n" + "=" * 80)
print("EXECUTING AUTONOMOUS 5-VIEW ASSESSMENT RENDERS: FORD EXPLORER")
print("=" * 80)

import shutil

for vp in validation_viewpoints:
    set_camera_view(cam_obj, vp['eye'], vp['target'])
    out_brain = os.path.join(output_dir_brain, vp['filename'])
    out_asset = os.path.join(output_dir_assets, vp['filename'])
    scene.render.filepath = out_brain
    print(f"Rendering: {vp['title']} -> {vp['filename']}")
    bpy.ops.render.render(write_still=True)
    f_size = os.path.getsize(out_brain)
    shutil.copyfile(out_brain, out_asset)
    print(f"  ✓ Rendered & Replicated: {out_brain} & {out_asset} ({f_size:,} bytes)")

print("\n✓ All 5 assessment viewpoints successfully rendered!")
