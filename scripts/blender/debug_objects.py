import bpy
import os
import sys

sys.path.append(r"e:/Car_Automation/scripts/blender/generators")
import generate_audi_a8l_extended_phase2

generate_audi_a8l_extended_phase2.generate_audi_a8l_extended_phase2()

print("\n--- SCENE OBJECTS DIAGNOSTIC ---")
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        dims = obj.dimensions
        loc = obj.location
        mats = [m.name for m in obj.data.materials if m]
        print(f"Name: {obj.name:35s} | Dims: ({dims.x:.2f}, {dims.y:.2f}, {dims.z:.2f}) | Loc: ({loc.x:.2f}, {loc.y:.2f}, {loc.z:.2f}) | Mats: {mats}")
