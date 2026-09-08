"""
Render studio showcases for Powertrain subassemblies and Vehicle Packaging Envelopes.
"""
import bpy
import math
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ARTIFACT_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if bpy.context.scene.collection:
        for obj in list(bpy.context.scene.collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

def setup_studio():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    if hasattr(scene.cycles, 'device'):
        scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.04, 0.05, 0.07, 1.0)
        bg.inputs["Strength"].default_value = 0.9
        
    # Key light
    lk = bpy.data.lights.new("Key", 'AREA')
    lk.energy = 500
    lk.size = 2.0
    ok = bpy.data.objects.new("Key", lk)
    ok.location = (2, -2, 2.5)
    scene.collection.objects.link(ok)
    
    # Rim light
    lr = bpy.data.lights.new("Rim", 'AREA')
    lr.energy = 400
    lr.size = 2.5
    lr.color = (0.7, 0.85, 1.0)
    ol = bpy.data.objects.new("Rim", lr)
    ol.location = (-2, 2, 2)
    scene.collection.objects.link(ol)
    
    # Floor
    bpy.ops.mesh.primitive_plane_add(size=15, location=(0, 0, -0.01))
    floor = bpy.context.active_object
    mat = bpy.data.materials.new("Floor")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.02, 0.02, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.25
    floor.data.materials.append(mat)

def render_powertrain():
    clear_scene()
    setup_studio()
    
    inverter_path = os.path.join(PROJECT_ROOT, "public", "models", "powertrain", "edu", "edu_inverter_sic.glb")
    gearbox_path = os.path.join(PROJECT_ROOT, "public", "models", "powertrain", "edu", "edu_reduction_gearbox.glb")
    diffuser_path = os.path.join(PROJECT_ROOT, "public", "models", "aero", "gt3_diffuser_exhaust_01.glb")
    
    if os.path.exists(inverter_path):
        bpy.ops.import_scene.gltf(filepath=inverter_path)
    if os.path.exists(gearbox_path):
        bpy.ops.import_scene.gltf(filepath=gearbox_path)
        
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = (0.9, -1.3, 0.7)
    cam.rotation_euler = (math.radians(65), 0, math.radians(35))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    
    target = os.path.join(ARTIFACT_DIR, "upgraded_powertrain_cad_assembly.png")
    bpy.context.scene.render.filepath = target
    bpy.ops.render.render(write_still=True)
    print(f"Rendered powertrain to {target}")

def render_envelopes():
    clear_scene()
    setup_studio()
    
    env_path = os.path.join(PROJECT_ROOT, "public", "models", "vehicles", "sedan", "envelopes.glb")
    if os.path.exists(env_path):
        bpy.ops.import_scene.gltf(filepath=env_path)
        
    cam_data = bpy.data.cameras.new("CamEnv")
    cam_data.lens = 45
    cam = bpy.data.objects.new("CamEnv", cam_data)
    cam.location = (3.5, -4.5, 2.2)
    cam.rotation_euler = (math.radians(68), 0, math.radians(38))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    
    target = os.path.join(ARTIFACT_DIR, "upgraded_architecture_envelopes.png")
    bpy.context.scene.render.filepath = target
    bpy.ops.render.render(write_still=True)
    print(f"Rendered envelopes to {target}")

if __name__ == "__main__":
    render_powertrain()
    render_envelopes()
