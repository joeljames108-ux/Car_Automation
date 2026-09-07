"""
Render preview of dashboard_interactive_master.glb matching Image 4 driver POV
"""
import bpy
import math
import os
from mathutils import Vector

def render_preview():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 28
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    
    # Import GLB
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Hide alternative wheels & shifters
    for name in ["STEERING_GT3_YOKE", "STEERING_FORMULA", "STEERING_CLASSIC_WOOD", "CONSOLE_SHIFTER_MANUAL", "CONSOLE_SHIFTER_TOGGLE"]:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.hide_render = True
            
    # Studio lighting
    key = bpy.data.lights.new("Key", type='AREA')
    key.energy = 300
    key.size = 1.8
    key_obj = bpy.data.objects.new("Key", key)
    key_obj.location = Vector((0.0, -0.6, 0.85))
    bpy.context.scene.collection.objects.link(key_obj)
    
    fill = bpy.data.lights.new("Fill", type='AREA')
    fill.energy = 150
    fill.size = 2.0
    fill_obj = bpy.data.objects.new("Fill", fill)
    fill_obj.location = Vector((-0.8, -0.2, 0.6))
    bpy.context.scene.collection.objects.link(fill_obj)
    
    # Camera matching Image 4 driver POV (wide front-facing cockpit view)
    cam_data = bpy.data.cameras.new("DriverPOV")
    cam_data.lens = 28 # Wide 28mm automotive interior lens
    cam_obj = bpy.data.objects.new("DriverPOV", cam_data)
    cam_obj.location = Vector((-0.18, -1.05, 0.58)) # Eye level back in driver seat
    
    # Look towards center stack / dashboard
    target = Vector((0.02, 0.05, 0.35))
    dir_v = target - cam_obj.location
    cam_obj.rotation_euler = dir_v.to_track_quat('-Z', 'Y').to_euler()
    
    bpy.context.scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    out_png = os.path.abspath("exports/dashboard_interactive_preview.png")
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    scene.render.filepath = out_png
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER DONE] {out_png}")

if __name__ == "__main__":
    render_preview()
