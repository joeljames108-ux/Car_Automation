import bpy
import math
import os

def render_showcase():
    # Load GLB or inspect current scene
    glb_path = r"C:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\interior\showcase_interior_gadgets.glb"
    output_png = r"C:\Users\joelj\.gemini\antigravity-ide\brain\30296f4e-06b3-4c30-beb6-aae40bf38d0e\interior_gadgets_showcase_studio.png"
    
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.film_transparent = False
    
    # Add dark studio backdrop
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.05))
    floor = bpy.context.active_object
    floor_mat = bpy.data.materials.new("Studio_Floor")
    floor_mat.use_nodes = True
    nodes = floor_mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.04, 0.05, 0.07, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.25
        bsdf.inputs["Metallic"].default_value = 0.5
    floor.data.materials.append(floor_mat)
    
    # Studio Lighting: Key, Fill, Rim
    # Key light
    key_light_data = bpy.data.lights.new(name="Studio_Key", type='AREA')
    key_light_data.energy = 500.0
    key_light_data.size = 2.5
    key_light_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Studio_Key", key_light_data)
    scene.collection.objects.link(key_obj)
    key_obj.location = (-1.5, -2.5, 2.0)
    key_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))
    
    # Fill light
    fill_light_data = bpy.data.lights.new(name="Studio_Fill", type='AREA')
    fill_light_data.energy = 250.0
    fill_light_data.size = 3.0
    fill_light_data.color = (0.8, 0.9, 1.0)
    fill_obj = bpy.data.objects.new("Studio_Fill", fill_light_data)
    scene.collection.objects.link(fill_obj)
    fill_obj.location = (2.0, -2.0, 1.5)
    fill_obj.rotation_euler = (math.radians(40), math.radians(-20), math.radians(45))
    
    # Rim light
    rim_light_data = bpy.data.lights.new(name="Studio_Rim", type='SPOT')
    rim_light_data.energy = 400.0
    rim_light_data.spot_size = math.radians(60)
    rim_light_data.color = (0.3, 0.8, 1.0) # Cyber blue accent
    rim_obj = bpy.data.objects.new("Studio_Rim", rim_light_data)
    scene.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 2.5, 1.8)
    rim_obj.rotation_euler = (math.radians(-50), 0, math.radians(180))
    
    # Camera
    cam_data = bpy.data.cameras.new("Showcase_Cam")
    cam_data.lens = 50.0
    cam_obj = bpy.data.objects.new("Showcase_Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    # Target empty at center of gadgets
    target = bpy.data.objects.new("Cam_Target", None)
    target.location = (0.0, 0.0, 0.06)
    scene.collection.objects.link(target)
    
    # Track constraint
    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    # Position camera with elevated 3/4 view
    cam_obj.location = (0.15, -0.95, 0.55)
    
    # Set output settings
    try:
        scene.render.image_settings.media_type = 'IMAGE'
    except Exception:
        pass
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = output_png
    
    print(f"Rendering Showcase to {output_png}...")
    bpy.ops.render.render(write_still=True)
    print("Render complete!")

if __name__ == "__main__":
    render_showcase()
