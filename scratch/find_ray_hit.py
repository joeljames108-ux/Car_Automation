import bpy
import mathutils

glb_path = "public/models/interior/dashboard_interactive_master.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

ray_start = mathutils.Vector((-0.38, -0.16, 0.74))
ray_end = mathutils.Vector((-0.38, -0.078, 0.735))
ray_dir = (ray_end - ray_start).normalized()
ray_dist = (ray_end - ray_start).length

print(f"Ray from {ray_start} to {ray_end}, dist={ray_dist:.4f}")

# Ray cast into the scene
depsgraph = bpy.context.evaluated_depsgraph_get()
hit, loc, normal, index, obj, matrix = bpy.context.scene.ray_cast(depsgraph, ray_start, ray_dir, distance=ray_dist)

if hit:
    print(f"HIT OBJECT: {obj.name} at location {loc}")
else:
    print("NO DIRECT HIT via scene.ray_cast, testing individual objects...")
    for o in bpy.data.objects:
        if o.type == 'MESH':
            # transform ray to local coordinates
            inv = o.matrix_world.inverted()
            local_start = inv @ ray_start
            local_end = inv @ ray_end
            local_dir = (local_end - local_start).normalized()
            local_dist = (local_end - local_start).length
            hit_o, loc_o, norm_o, idx_o = o.ray_cast(local_start, local_dir, distance=local_dist)
            if hit_o:
                world_hit = o.matrix_world @ loc_o
                print(f"OBJECT HIT: {o.name} at world {world_hit}")
