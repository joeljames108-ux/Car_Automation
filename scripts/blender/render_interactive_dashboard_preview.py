"""
Render preview of dashboard_interactive_master.glb matching Photo 1 cockpit wide view
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
    scene.cycles.samples = 32
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    
    # Import GLB
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Hide alternative wheels and shifters
    for obj in bpy.data.objects:
        if any(k in obj.name for k in [
            "STEERING_GT3", "STEERING_FORMULA", "STEERING_CLASSIC", "STEERING_LUXURY", "STEERING_PERFORMANCE",
            "CONSOLE_SHIFTER_MANUAL", "CONSOLE_SHIFTER_TOGGLE", "CONSOLE_SHIFTER_ROTARY", "CONSOLE_SHIFTER_CRYSTAL", "CONSOLE_SHIFTER_PERFORMANCE"
        ]):
            obj.hide_render = True
            obj.hide_viewport = True
            
    # Soft Studio lighting tailored for automotive cockpit surfacing
    key = bpy.data.lights.new("Key", type='AREA')
    key.energy = 220
    key.size = 2.4
    key_obj = bpy.data.objects.new("Key", key)
    key_obj.location = Vector((0.25, -0.65, 0.95))
    bpy.context.scene.collection.objects.link(key_obj)
    
    fill = bpy.data.lights.new("Fill", type='AREA')
    fill.energy = 130
    fill.size = 2.6
    fill_obj = bpy.data.objects.new("Fill", fill)
    fill_obj.location = Vector((-0.75, -0.35, 0.75))
    bpy.context.scene.collection.objects.link(fill_obj)

    rim = bpy.data.lights.new("Rim", type='AREA')
    rim.energy = 90
    rim.size = 2.0
    rim_obj = bpy.data.objects.new("Rim", rim)
    rim_obj.location = Vector((0.0, 0.35, 0.85))
    bpy.context.scene.collection.objects.link(rim_obj)
    
    # Camera matching Photo 1 cockpit wide view
    cam_data = bpy.data.cameras.new("DriverPOV")
    cam_data.lens = 22 # Ultra-wide 22mm automotive cockpit lens
    cam_obj = bpy.data.objects.new("DriverPOV", cam_data)
    cam_obj.location = Vector((0.0, -0.88, 0.82)) # Well zoomed-out center-cabin eye level
    
    # Look towards center stack / dashboard
    target = Vector((0.0, 0.12, 0.56))
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
