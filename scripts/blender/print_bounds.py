import bpy
import mathutils
import os

glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

print("\n=== GLB OBJECT BOUNDS (Blender Coord & Three.js Coord) ===")
for obj in sorted(bpy.context.scene.objects, key=lambda o: o.name):
    if obj.type == 'MESH':
        bbox = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
        min_b = [min(c[i] for c in bbox) for i in range(3)]
        max_b = [max(c[i] for c in bbox) for i in range(3)]
        center_b = [(min_b[i] + max_b[i])/2 for i in range(3)]
        
        # In Blender: X, Y, Z
        # In glTF exported to Three.js: X_three = X_blender, Y_three = Z_blender, Z_three = -Y_blender
        center_three = [center_b[0], center_b[2], -center_b[1]]
        
        print(f"{obj.name:35s} | Blender: ({center_b[0]:.3f}, {center_b[1]:.3f}, {center_b[2]:.3f}) | Three: ({center_three[0]:.3f}, {center_three[1]:.3f}, {center_three[2]:.3f})")

print("=== END OBJECT BOUNDS ===\n")
