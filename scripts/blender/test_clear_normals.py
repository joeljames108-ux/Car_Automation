import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

obj = bpy.data.objects.get("bodypaint_A")
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

print(f"BEFORE CLEAR: has_custom_normals = {obj.data.has_custom_normals}")
bpy.ops.mesh.customdata_custom_splitnormals_clear()
print(f"AFTER CLEAR: has_custom_normals = {obj.data.has_custom_normals}")

# Now let's test smooth shading:
for p in obj.data.polygons:
    p.use_smooth = True
obj.data.update()
print(f"AFTER SMOOTH: has_custom_normals = {obj.data.has_custom_normals}")
