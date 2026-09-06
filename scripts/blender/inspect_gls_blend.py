import bpy
import os

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
blend_path = os.path.join(PROJECT_DIR, "public", "models", "extracted", "32-mercedes-benz-gls-580-2020", "uploads_files_2787791_Mercedes+Benz+GLS+580.blend")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=blend_path)

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"GLS Blend Total meshes: {len(mesh_objs)}, Polys: {sum(len(m.data.polygons) for m in mesh_objs):,}")
print("Sample GLS mesh objects:", [o.name for o in mesh_objs[:30]])
print("GLS collections:", [c.name for c in bpy.data.collections])
