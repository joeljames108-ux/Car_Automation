import bpy

bpy.ops.mesh.primitive_cube_add()
cube = bpy.context.active_object
bpy.context.view_layer.objects.active = cube
cube.select_set(True)

try:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()
    print("OBJECT MODE: SUCCESS")
except Exception as e:
    print(f"OBJECT MODE ERROR: {e}")

bpy.ops.object.mode_set(mode='EDIT')
try:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()
    print("EDIT MODE: SUCCESS")
except Exception as e:
    print(f"EDIT MODE ERROR: {e}")
bpy.ops.object.mode_set(mode='OBJECT')
