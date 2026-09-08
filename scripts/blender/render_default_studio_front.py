"""
Render preview of dashboard_interactive_master.glb from the newly added default 'dashboard_center' view
matching the user's reference illustration with full cabin width, A-pillars, side mirrors, and rearview mirror.
"""
import bpy
import math
import os
import shutil
from mathutils import Vector

def render_default_studio_front():
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
    
    # Hide alternative wheels & shifters & rear wall
    for name in [
        "CABIN_REAR_BULKHEAD",
        "STEERING_GT3_YOKE",
        "STEERING_FORMULA",
        "STEERING_CLASSIC_WOOD",
        "STEERING_LUXURY_2SPOKE",
        "STEERING_PERFORMANCE_4SPOKE",
        "CONSOLE_SHIFTER_MANUAL",
        "CONSOLE_SHIFTER_TOGGLE",
        "CONSOLE_SHIFTER_ROTARY",
        "CONSOLE_SHIFTER_CRYSTAL",
        "CONSOLE_SHIFTER_PERF",
    ]:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.hide_render = True
            
    # Studio lighting
    key = bpy.data.lights.new("Key", type='AREA')
    key.energy = 380
    key.size = 2.4
    key_obj = bpy.data.objects.new("Key", key)
    key_obj.location = Vector((0.0, -0.6, 1.20))
    bpy.context.scene.collection.objects.link(key_obj)
    
    fill_l = bpy.data.lights.new("Fill_L", type='AREA')
    fill_l.energy = 160
    fill_l.size = 2.0
    fill_l_obj = bpy.data.objects.new("Fill_L", fill_l)
    fill_l_obj.location = Vector((-0.85, -0.4, 0.75))
    bpy.context.scene.collection.objects.link(fill_l_obj)

    fill_r = bpy.data.lights.new("Fill_R", type='AREA')
    fill_r.energy = 160
    fill_r.size = 2.0
    fill_r_obj = bpy.data.objects.new("Fill_R", fill_r)
    fill_r_obj.location = Vector((0.85, -0.4, 0.75))
    bpy.context.scene.collection.objects.link(fill_r_obj)

    front_sun = bpy.data.lights.new("Front_Sun", type='SUN')
    front_sun.energy = 2.0
    front_sun_obj = bpy.data.objects.new("Front_Sun", front_sun)
    front_sun_obj.rotation_euler = (math.radians(30), math.radians(10), 0)
    bpy.context.scene.collection.objects.link(front_sun_obj)
    
    # Camera matching default 'dashboard_center' symmetrical front view
    cam_data = bpy.data.cameras.new("StudioFront")
    cam_data.lens = 21 # Wide automotive interior focal length (captures full cabin door-to-door)
    cam_obj = bpy.data.objects.new("StudioFront", cam_data)
    cam_obj.location = Vector((0.0, -0.98, 0.82)) # Positioned between front seats looking forward
    
    # Target center of dashboard trim spear & infotainment
    target = Vector((0.0, 0.15, 0.64))
    dir_v = target - cam_obj.location
    cam_obj.rotation_euler = dir_v.to_track_quat('-Z', 'Y').to_euler()
    
    bpy.context.scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    out_png = os.path.abspath("exports/dashboard_studio_front_preview.png")
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    scene.render.filepath = out_png
    bpy.ops.render.render(write_still=True)
    print(f"[RENDER DONE] {out_png}")

    # Copy to artifact directory
    artifact_dir = "C:/Users/acer/.gemini/antigravity-ide/brain/6b65af10-4dec-4c71-90b8-d02c18319690"
    if os.path.exists(artifact_dir):
        artifact_dest = os.path.join(artifact_dir, "dashboard_studio_front_preview.png")
        shutil.copy2(out_png, artifact_dest)
        print(f"[COPIED TO ARTIFACT] {artifact_dest}")

if __name__ == "__main__":
    render_default_studio_front()
