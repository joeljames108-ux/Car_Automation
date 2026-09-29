"""
Import the upgraded Ford Focus RS Mk3 Class-A GLB and render all 5 assessment views.
"""
import bpy
import os
import sys

# 1. Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)
for block in [bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

# 2. Import GLB
glb_path = r"E:\Car_Automation\public\models\vehicles\hatchback\2010s\vehicle.glb"
print(f"[RENDER RUNNER] Importing {glb_path}...")
bpy.ops.import_scene.gltf(filepath=glb_path)
print(f"[RENDER RUNNER] Imported {len(bpy.data.objects)} objects.")

# 3. Execute assessment rendering script
render_script = r"E:\Car_Automation\scripts\blender\render_focus_rs_assessment_views.py"
print(f"[RENDER RUNNER] Executing {render_script}...")
with open(render_script, "r", encoding="utf-8") as f:
    code = f.read()
exec(code, globals(), globals())
print("[RENDER RUNNER] All 5 upgraded assessment views successfully rendered!")
