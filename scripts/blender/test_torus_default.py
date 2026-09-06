import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.1)
obj = bpy.context.active_object
print(f"default torus rot: {obj.rotation_euler[:]}")
for i, v in enumerate(obj.data.vertices[:10]):
    print(f"v{i}: {v.co[:]}")
