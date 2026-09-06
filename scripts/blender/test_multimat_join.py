import bpy
import bmesh
import math
import os
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. Create 2 materials
mat1 = bpy.data.materials.new("Mat_Rubber")
mat1.use_nodes = True
mat1.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1.0)

mat2 = bpy.data.materials.new("Mat_Gold")
mat2.use_nodes = True
mat2.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (1.0, 0.8, 0.1, 1.0)

# 2. Create tire cylinder
bpy.ops.mesh.primitive_cylinder_add(radius=0.36, depth=0.3, location=(0,0,0))
obj1 = bpy.context.active_object
obj1.name = "Tire"
obj1.data.materials.append(mat1)

# 3. Create rim cylinder
bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.31, location=(0,0,0))
obj2 = bpy.context.active_object
obj2.name = "Rim"
obj2.data.materials.append(mat2)

# 4. Join them
bpy.ops.object.select_all(action='DESELECT')
obj1.select_set(True)
obj2.select_set(True)
bpy.context.view_layer.objects.active = obj1
bpy.ops.object.join()

joined = bpy.context.active_object
print("Joined object name:", joined.name)
print("Material slots:", [s.material.name for s in joined.material_slots])
print("Polygons total:", len(joined.data.polygons))

test_glb = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\exports\test_multimat.glb"
bpy.ops.export_scene.gltf(filepath=test_glb, export_format='GLB')
print("Exported test GLB size:", os.path.getsize(test_glb), "bytes")
