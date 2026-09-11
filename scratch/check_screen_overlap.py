import bpy
import mathutils

glb_path = "public/models/interior/dashboard_interactive_master.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

print("=== CHECKING ALL OBJECTS INTERSECTING CLUSTER SCREEN ===")
cluster_scr = bpy.data.objects.get("CLUSTER_SCREEN")
if cluster_scr:
    cs_bbox = [cluster_scr.matrix_world @ mathutils.Vector(corner) for corner in cluster_scr.bound_box]
    cs_min_x, cs_max_x = min(p.x for p in cs_bbox), max(p.x for p in cs_bbox)
    cs_min_y, cs_max_y = min(p.y for p in cs_bbox), max(p.y for p in cs_bbox)
    cs_min_z, cs_max_z = min(p.z for p in cs_bbox), max(p.z for p in cs_bbox)
    print(f"CLUSTER_SCREEN bbox: X:[{cs_min_x:.3f}, {cs_max_x:.3f}] Y:[{cs_min_y:.3f}, {cs_max_y:.3f}] Z:[{cs_min_z:.3f}, {cs_max_z:.3f}]")

    for obj in bpy.data.objects:
        if obj.type == 'MESH' and obj != cluster_scr:
            bbox = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
            o_min_x, o_max_x = min(p.x for p in bbox), max(p.x for p in bbox)
            o_min_y, o_max_y = min(p.y for p in bbox), max(p.y for p in bbox)
            o_min_z, o_max_z = min(p.z for p in bbox), max(p.z for p in bbox)

            # Check overlap
            overlap_x = max(0.0, min(cs_max_x, o_max_x) - max(cs_min_x, o_min_x))
            overlap_y = max(0.0, min(cs_max_y, o_max_y) - max(cs_min_y, o_min_y))
            overlap_z = max(0.0, min(cs_max_z, o_max_z) - max(cs_min_z, o_min_z))

            if overlap_x > 0.01 and overlap_y > 0.001 and overlap_z > 0.01:
                print(f"OVERLAP with {obj.name:30} overlap_x={overlap_x:.3f}, overlap_y={overlap_y:.3f}, overlap_z={overlap_z:.3f}")
