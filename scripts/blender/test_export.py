import bpy

# Test glTF export parameters in Blender 5.2
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add()

test_out = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\scripts\blender\test_out.glb"
bpy.ops.export_scene.gltf(
    filepath=test_out,
    export_format='GLB',
    use_selection=False,
    export_apply=True
)
print("[TEST] glTF export succeeded!")
