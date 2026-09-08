"""
==============================================================================
RENDER PHOTOREALISTIC STUDIO SHOTS OF UPGRADED CAD ASSETS (BLENDER 5.2 LTS)
==============================================================================
Loads the newly generated high-poly Class-A CAD assemblies and renders
cinematic studio preview PNGs to the artifacts directory:
1. upgraded_f1_cad_assembly.png
2. upgraded_powertrain_cad_assembly.png
==============================================================================
"""

import bpy
import math
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ARTIFACT_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if bpy.context.scene.collection:
        for obj in list(bpy.context.scene.collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

def setup_studio_environment():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    if hasattr(scene.cycles, 'device'):
        scene.cycles.device = 'CPU'
    scene.cycles.samples = 64
    scene.cycles.adaptive_threshold = 0.05
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    # World HDRI lighting
    world = scene.world or bpy.data.worlds.new("Studio_World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.05, 0.06, 0.08, 1.0)
        bg.inputs["Strength"].default_value = 0.8
        
    # Key Light (Soft Warm Area)
    light_key = bpy.data.lights.new(name="Studio_Key", type='AREA')
    light_key.energy = 450.0
    light_key.size = 2.5
    light_key.color = (1.0, 0.96, 0.92)
    obj_key = bpy.data.objects.new("Studio_Key", light_key)
    obj_key.location = (2.5, -2.8, 3.2)
    obj_key.rotation_euler = (math.radians(45), math.radians(15), math.radians(40))
    scene.collection.objects.link(obj_key)
    
    # Rim Light (Cool Blue Area)
    light_rim = bpy.data.lights.new(name="Studio_Rim", type='AREA')
    light_rim.energy = 380.0
    light_rim.size = 3.0
    light_rim.color = (0.75, 0.88, 1.0)
    obj_rim = bpy.data.objects.new("Studio_Rim", light_rim)
    obj_rim.location = (-2.8, 2.5, 2.8)
    obj_rim.rotation_euler = (math.radians(-45), math.radians(-20), math.radians(-130))
    scene.collection.objects.link(obj_rim)
    
    # Fill Light (Subtle overhead)
    light_fill = bpy.data.lights.new(name="Studio_Fill", type='AREA')
    light_fill.energy = 180.0
    light_fill.size = 4.0
    obj_fill = bpy.data.objects.new("Studio_Fill", light_fill)
    obj_fill.location = (0.0, 0.0, 4.0)
    scene.collection.objects.link(obj_fill)
    
    # Ground Reflector Plane
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.01))
    ground = bpy.context.active_object
    ground.name = "Studio_Floor"
    mat_floor = bpy.data.materials.new("Studio_Floor_Mat")
    mat_floor.use_nodes = True
    bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.02, 0.025, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.22
        bsdf.inputs["Metallic"].default_value = 0.5
    ground.data.materials.append(mat_floor)

def render_f1_showcase():
    clear_scene()
    setup_studio_environment()
    
    # Load F1 Upgraded Components
    f1_dir = os.path.join(PROJECT_ROOT, "public", "models", "vehicles", "f1")
    parts_to_load = [
        "f1_monocoque_m55j.glb",
        "f1_nose_wide.glb",
        "f1_floor_antiporpoise.glb",
        "f1_gearbox_carbon8.glb",
        "f1_halo_grade5.glb",
        "f1_suspension_fl_pullrod.glb",
        "f1_suspension_fr_pullrod.glb",
        "f1_suspension_rl_pushrod.glb",
        "f1_suspension_rr_pushrod.glb",
    ]
    
    for p in parts_to_load:
        path = os.path.join(f1_dir, p)
        if os.path.exists(path):
            bpy.ops.import_scene.gltf(filepath=path)
            
    # Camera setup (Hero 3/4 Perspective)
    cam_data = bpy.data.cameras.new("F1_Hero_Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("F1_Hero_Cam", cam_data)
    cam_obj.location = (3.4, -4.2, 1.9)
    cam_obj.rotation_euler = (math.radians(72), math.radians(0), math.radians(40))
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    out_path = os.path.join(ARTIFACT_DIR, "upgraded_f1_cad_assembly.png")
    bpy.context.scene.render.filepath = out_path
    print(f"[RENDER] Rendering F1 CAD Showcase to {out_path}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER] Successfully created {out_path}")

def render_powertrain_showcase():
    clear_scene()
    setup_studio_environment()
    
    # Load Upgraded Powertrain Components
    pw_dir = os.path.join(PROJECT_ROOT, "public", "models", "powertrain")
    edu_dir = os.path.join(pw_dir, "edu")
    
    inverter_path = os.path.join(edu_dir, "edu_inverter_sic.glb")
    gearbox_path = os.path.join(edu_dir, "edu_reduction_gearbox.glb")
    flange_path = os.path.join(pw_dir, "trans_outputflange_assembly.glb")
    shift_path = os.path.join(pw_dir, "trans_shiftmechanism.glb")
    
    if os.path.exists(inverter_path):
        bpy.ops.import_scene.gltf(filepath=inverter_path)
    if os.path.exists(gearbox_path):
        bpy.ops.import_scene.gltf(filepath=gearbox_path)
        
    # Camera setup for Powertrain
    cam_data = bpy.data.cameras.new("Powertrain_Cam")
    cam_data.lens = 65
    cam_obj = bpy.data.objects.new("Powertrain_Cam", cam_data)
    cam_obj.location = (1.2, -1.6, 0.9)
    cam_obj.rotation_euler = (math.radians(65), math.radians(0), math.radians(35))
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    out_path = os.path.join(ARTIFACT_DIR, "upgraded_powertrain_cad_assembly.png")
    bpy.context.scene.render.filepath = out_path
    print(f"[RENDER] Rendering Powertrain CAD Showcase to {out_path}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER] Successfully created {out_path}")

if __name__ == "__main__":
    render_f1_showcase()
    render_powertrain_showcase()
