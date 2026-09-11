import bpy
import os
from mathutils import Vector

def check_nodes():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    bpy.ops.import_scene.gltf(filepath=glb_path)

    for obj in bpy.data.objects:
        if "ROW2" in obj.name or "ROW3" in obj.name or "CABIN" in obj.name or "REAR" in obj.name:
            bbox = [obj.matrix_world @ Vector(obj.bound_box[i]) for i in range(8)] if obj.type == 'MESH' else []
            if bbox:
                min_x = min(b.x for b in bbox)
                max_x = max(b.x for b in bbox)
                min_y = min(b.y for b in bbox)
                max_y = max(b.y for b in bbox)
                min_z = min(b.z for b in bbox)
                max_z = max(b.z for b in bbox)
                print(f"{obj.name:32} | X: [{min_x:6.2f}, {max_x:6.2f}] | Y: [{min_y:6.2f}, {max_y:6.2f}] | Z: [{min_z:6.2f}, {max_z:6.2f}]")
            else:
                print(f"{obj.name:32} | Loc: {obj.location}")

if __name__ == "__main__":
    check_nodes()
