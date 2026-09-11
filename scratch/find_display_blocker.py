import bpy
import mathutils

glb_path = "public/models/interior/dashboard_interactive_master.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

ray_start = mathutils.Vector((0.01, -0.35, 0.70))
ray_end = mathutils.Vector((0.01, -0.08, 0.58))
ray_dir = (ray_end - ray_start).normalized()
ray_dist = (ray_end - ray_start).length

print(f"Ray from {ray_start} to {ray_end}, dist={ray_dist:.4f}")

for o in bpy.data.objects:
    if o.type == 'MESH':
        inv = o.matrix_world.inverted()
        local_start = inv @ ray_start
        local_end = inv @ ray_end
        local_dir = (local_end - local_start).normalized()
        local_dist = (local_end - local_start).length
        hit_o, loc_o, norm_o, idx_o = o.ray_cast(local_start, local_dir, distance=local_dist)
        if hit_o:
            world_hit = o.matrix_world @ loc_o
            print(f"OBJECT HIT: {o.name:32} at world {world_hit}")
