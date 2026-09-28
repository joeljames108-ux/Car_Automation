import bpy
import math
import os

def render_cockpit():
    glb_path = r"C:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\interior\cockpit_hypercar_interior_cad.glb"
    output_png = r"C:\Users\joelj\.gemini\antigravity-ide\brain\30296f4e-06b3-4c30-beb6-aae40bf38d0e\interior_study_cockpit_assembly_cad.png"
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.film_transparent = False
    
    # Studio Floor
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor_mat = bpy.data.materials.new("Cockpit_Studio_Floor")
    floor_mat.use_nodes = True
    bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.03, 0.04, 0.05, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.20
        bsdf.inputs["Metallic"].default_value = 0.60
    floor.data.materials.append(floor_mat)
    
    # Lighting: Key, Fill, Rim, Ambient cockpit fill
    key_l = bpy.data.lights.new("Key", 'AREA')
    key_l.energy = 800.0
    key_l.size = 3.5
    key_l.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Key", key_l)
    scene.collection.objects.link(key_obj)
    key_obj.location = (-1.8, -1.8, 2.4)
    key_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))
    
    fill_l = bpy.data.lights.new("Fill", 'AREA')
    fill_l.energy = 400.0
    fill_l.size = 4.0
    fill_l.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("Fill", fill_l)
    scene.collection.objects.link(fill_obj)
    fill_obj.location = (2.2, -1.2, 2.0)
    fill_obj.rotation_euler = (math.radians(35), math.radians(-20), math.radians(45))
    
    rim_l = bpy.data.lights.new("Rim", 'SPOT')
    rim_l.energy = 600.0
    rim_l.spot_size = math.radians(70)
    rim_l.color = (0.2, 0.7, 1.0)
    rim_obj = bpy.data.objects.new("Rim", rim_l)
    scene.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 2.5, 2.2)
    rim_obj.rotation_euler = (math.radians(-45), 0, math.radians(180))
    
    # Driver eye point camera looking toward center console and dash
    cam_data = bpy.data.cameras.new("Cockpit_Cam")
    cam_data.lens = 28.0  # Wide-angle automotive interior lens
    cam_obj = bpy.data.objects.new("Cockpit_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    # Position camera behind seats looking into cockpit
    cam_obj.location = (-0.25, -0.90, 1.15)
    
    target = bpy.data.objects.new("Cam_Target", None)
    target.location = (0.0, 0.40, 0.58)
    scene.collection.objects.link(target)
    
    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    try:
        scene.render.image_settings.media_type = 'IMAGE'
    except Exception:
        pass
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = output_png
    
    print(f"Rendering Cockpit Assembly to {output_png}...")
    bpy.ops.render.render(write_still=True)
    print("Cockpit Render complete!")

if __name__ == "__main__":
    render_cockpit()
