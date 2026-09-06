import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
glb_path = os.path.join(PROJECT_DIR, "exports", "Car_Sedan_Complete.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

body = None
for o in bpy.data.objects:
    if "bodypaint" in o.name.lower() or "mesh" in o.name.lower():
        # Check polygon count
        if o.type == 'MESH' and len(o.data.polygons) > 5000:
            body = o
            break

print("FOUND BODY:", body.name if body else "None")
if body:
    print("BEFORE has_custom_normals:", body.data.has_custom_normals)
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    
    # Try object mode
    try:
        res = bpy.ops.mesh.customdata_custom_splitnormals_clear()
        print("Object mode clear result:", res)
    except Exception as e:
        print("Object mode clear error:", e)
    print("AFTER OBJ MODE has_custom_normals:", body.data.has_custom_normals)

    # Try edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    try:
        res = bpy.ops.mesh.customdata_custom_splitnormals_clear()
        print("Edit mode clear result:", res)
    except Exception as e:
        print("Edit mode clear error:", e)
    bpy.ops.object.mode_set(mode='OBJECT')
    print("AFTER EDIT MODE has_custom_normals:", body.data.has_custom_normals)
