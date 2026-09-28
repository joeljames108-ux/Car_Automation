import sys
scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

code = """
import bpy

lines = ["=== OBJECTS ==="]
for obj in bpy.data.objects:
    parent_name = obj.parent.name if obj.parent else "None"
    poly_count = len(obj.data.polygons) if obj.type == "MESH" else 0
    lines.append(f"{obj.name:32} | Type: {obj.type:8} | Parent: {parent_name:22} | Polys: {poly_count}")

lines.append("\\n=== MATERIALS ===")
for mat in bpy.data.materials:
    lines.append(f"- {mat.name}")

lines.append("\\n=== ACTIONS ===")
for act in bpy.data.actions:
    lines.append(f"- {act.name}")

with open(r"e:\\Car_Automation\\scripts\\output\\scene_info.txt", "w", encoding="utf-8") as f:
    f.write("\\n".join(lines))
"""
res = client.execute_code(code)
print("Execute code result:", res.get("status"))

with open(r"e:\Car_Automation\scripts\output\scene_info.txt", "r", encoding="utf-8") as f:
    print(f.read())
