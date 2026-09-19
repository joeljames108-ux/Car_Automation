import bpy
import sys
import os

sys.path.append(os.path.abspath("scripts/blender/generators"))
import generate_lotus_elise_s2_phase2

generate_lotus_elise_s2_phase2.build_lotus_elise_s2_phase2()

print("\n" + "="*80)
print("OBJECT AUDIT")
print("="*80)
for obj in bpy.data.objects:
    dims = [round(v, 3) for v in obj.dimensions]
    mat_names = [m.name for m in obj.data.materials] if hasattr(obj.data, "materials") else []
    print(f"OBJ: {obj.name:50s} | Dim: {dims} | Mat: {mat_names}")
