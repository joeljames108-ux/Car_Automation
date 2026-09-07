"""
==============================================================================
BLENDER 5.2 CYCLES PHOTOREALISTIC RENDERER: UPGRADED ENGINES & POWERTRAINS
==============================================================================
Loads the upgraded V8 Twin-Turbo engine and DCT transmission, sets up an
automotive dark studio lighting rig with rim lights and softboxes, and renders
high-resolution beauty shots for quality verification and presentation.
==============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

def log(msg):
    print(f"[RENDER_V8_POWERTRAIN] {msg}")

def setup_studio():
    # Factory reset
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 36
    scene.cycles.preview_samples = 16
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    
    # World background: Deep dark slate with subtle ambient illumination
    world = bpy.data.worlds.new("StudioWorld")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.022, 0.025, 1.0)
        bg.inputs["Strength"].default_value = 0.5
        
    # Key Light: Warm overhead 3/4 softbox
    key_data = bpy.data.lights.new(name="Studio_Key", type='AREA')
    key_data.energy = 850.0
    key_data.size = 2.4
    key_data.color = (1.0, 0.96, 0.90)
    key_obj = bpy.data.objects.new(name="Studio_Key", object_data=key_data)
    key_obj.location = (-1.4, -1.8, 2.2)
    key_obj.rotation_euler = Euler((math.radians(52), math.radians(-15), math.radians(-38)), 'XYZ')
    bpy.context.scene.collection.objects.link(key_obj)
    
    # Fill Light: Cool daylight softbox from right
    fill_data = bpy.data.lights.new(name="Studio_Fill", type='AREA')
    fill_data.energy = 380.0
    fill_data.size = 3.0
    fill_data.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new(name="Studio_Fill", object_data=fill_data)
    fill_obj.location = (2.0, -1.2, 1.6)
    fill_obj.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(65)), 'XYZ')
    bpy.context.scene.collection.objects.link(fill_obj)
    
    # Rim / Hair Light: High-angle sharp edge backlight
    rim_data = bpy.data.lights.new(name="Studio_Rim", type='AREA')
    rim_data.energy = 1100.0
    rim_data.size = 1.8
    rim_data.color = (0.92, 0.95, 1.0)
    rim_obj = bpy.data.objects.new(name="Studio_Rim", object_data=rim_data)
    rim_obj.location = (0.0, 2.2, 1.8)
    rim_obj.rotation_euler = Euler((math.radians(-50), 0.0, math.radians(180)), 'XYZ')
    bpy.context.scene.collection.objects.link(rim_obj)
    
    # Studio Floor: Sleek dark matte reflective stage
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.01))
    floor_obj = bpy.context.active_object
    floor_obj.name = "Studio_Floor"
    floor_mat = bpy.data.materials.new(name="Studio_Floor_Mat")
    floor_mat.use_nodes = True
    floor_bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if floor_bsdf:
        floor_bsdf.inputs["Base Color"].default_value = (0.03, 0.032, 0.035, 1.0)
        floor_bsdf.inputs["Roughness"].default_value = 0.28
        floor_bsdf.inputs["Metallic"].default_value = 0.65
        if "Clearcoat Weight" in floor_bsdf.inputs:
            floor_bsdf.inputs["Clearcoat Weight"].default_value = 0.4
    floor_obj.data.materials.append(floor_mat)

def render_model(glb_path, output_png, cam_pos, cam_target, fov=42):
    log(f"Rendering {glb_path} -> {output_png}...")
    setup_studio()
    
    # Import model
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Setup Camera
    cam_data = bpy.data.cameras.new(name="Render_Camera")
    cam_data.angle = math.radians(fov)
    cam_data.dof.use_dof = False
    cam_obj = bpy.data.objects.new(name="Render_Camera", object_data=cam_data)
    cam_obj.location = cam_pos
    
    # Point camera at target
    dir_vec = Vector(cam_target) - Vector(cam_pos)
    rot_quat = dir_vec.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    os.makedirs(os.path.dirname(output_png), exist_ok=True)
    bpy.context.scene.render.filepath = output_png
    bpy.ops.render.render(write_still=True)
    log(f"[SUCCESS] Rendered: {output_png}")

def main():
    log("=================================================================")
    log("  RENDERING HIGH-RES BEAUTY SHOTS OF UPGRADED ENGINES            ")
    log("=================================================================")
    
    # 1. V8 Twin-Turbo Engine Complete
    v8_path = os.path.abspath("public/models/engines/v8_twinturbo_engine_complete.glb")
    out_v8 = os.path.abspath("exports/engine_v8_twinturbo_render.png")
    render_model(
        glb_path=v8_path,
        output_png=out_v8,
        cam_pos=(-1.35, -1.55, 1.05),
        cam_target=(0.0, 0.0, 0.40),
        fov=40
    )
    
    # 2. Complete Powertrain (V8TT + DCT 7-Speed)
    dct_path = os.path.abspath("public/models/powertrain/powertrain_v8tt_dct7_complete.glb")
    out_dct = os.path.abspath("exports/powertrain_dct_render.png")
    render_model(
        glb_path=dct_path,
        output_png=out_dct,
        cam_pos=(-1.80, -2.10, 1.25),
        cam_target=(0.20, 0.0, 0.35),
        fov=42
    )

if __name__ == "__main__":
    main()
