import bpy
import math
import os
from mathutils import Vector

def render_v12_engine(glb_name, out_name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import target GLB
    glb_path = os.path.abspath(f"public/models/engines/{glb_name}")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Set up camera
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.lens = 55
    cam = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    
    # Position camera: 3/4 isometric perspective looking down at engine
    cam.location = Vector((1.6, -1.8, 1.3))
    
    # Point camera towards center of engine (0, 0, 0.20)
    target = Vector((0.0, 0.0, 0.20))
    direction = target - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()
    
    # Studio lighting
    light_key = bpy.data.lights.new("KeyLight", type='AREA')
    light_key.energy = 450
    light_key.size = 2.0
    obj_key = bpy.data.objects.new("KeyLight", light_key)
    obj_key.location = Vector((1.8, -1.2, 2.0))
    bpy.context.scene.collection.objects.link(obj_key)
    
    light_rim = bpy.data.lights.new("RimLight", type='AREA')
    light_rim.energy = 350
    light_rim.color = (0.95, 0.92, 0.88)
    obj_rim = bpy.data.objects.new("RimLight", light_rim)
    obj_rim.location = Vector((-1.8, 1.5, 1.8))
    bpy.context.scene.collection.objects.link(obj_rim)
    
    light_fill = bpy.data.lights.new("FillLight", type='AREA')
    light_fill.energy = 150
    light_fill.color = (0.85, 0.92, 1.0)
    obj_fill = bpy.data.objects.new("FillLight", light_fill)
    obj_fill.location = Vector((-1.5, -1.0, 0.8))
    bpy.context.scene.collection.objects.link(obj_fill)
    
    # Dark studio background
    bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    bg = bpy.context.scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.025, 0.035, 1.0)
        bg.inputs["Strength"].default_value = 0.5
        
    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.cycles.adaptive_threshold = 0.05
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.image_settings.file_format = 'PNG'
    
    out_img = os.path.abspath(f"exports/{out_name}")
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    scene.render.filepath = out_img
    
    print(f"Rendering {glb_name} to: {out_img}...")
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER COMPLETE] {out_img} ({os.path.getsize(out_img)/1024:.1f} KB)")

if __name__ == "__main__":
    render_v12_engine("v12_racing_engine_exploded.glb", "v12_engine_exploded_render.png")
