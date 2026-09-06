import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add()
cube = bpy.context.active_object

for poly in cube.data.polygons:
    poly.use_smooth = True

mod = cube.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
mod.keep_sharp = True
mod.weight = 100

print(f"[TEST] Successfully added WeightedNormal modifier: {mod.name}, keep_sharp={mod.keep_sharp}")
