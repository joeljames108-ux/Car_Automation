import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
glb_path = os.path.join(PROJECT_DIR, "exports", "Car_Sedan_Complete.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

body = bpy.data.objects.get("bodypaint_A")
if body:
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    if body.data.has_custom_normals:
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    for p in body.data.polygons:
        p.use_smooth = True
    
    sub = body.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.levels = 1
    sub.render_levels = 1
    print("Added Subsurf modifier to bodypaint_A! Total verts after eval:", len(body.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.vertices))
