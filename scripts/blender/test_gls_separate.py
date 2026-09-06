import bpy
import os

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
blend_path = os.path.join(PROJECT_DIR, "public", "models", "extracted", "32-mercedes-benz-gls-580-2020", "uploads_files_2787791_Mercedes+Benz+GLS+580.blend")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=blend_path)

# Delete backdrop cylinders
for o in [o for o in bpy.data.objects if "cylinder" in o.name.lower()]:
    bpy.data.objects.remove(o, do_unlink=True)

gls = bpy.data.objects.get("Mercedes Benz GLS 580")
print("GLS Material slots:", [slot.name for slot in gls.material_slots])

# Separate by material
bpy.ops.object.select_all(action='DESELECT')
gls.select_set(True)
bpy.context.view_layer.objects.active = gls
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='MATERIAL')
bpy.ops.object.mode_set(mode='OBJECT')

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"\nAfter separating by material, total meshes: {len(meshes)}")
for m in meshes:
    mat_name = m.material_slots[0].name if m.material_slots else "None"
    print(f"  - Mesh: {m.name}, Material: {mat_name}, Polys: {len(m.data.polygons)}")
