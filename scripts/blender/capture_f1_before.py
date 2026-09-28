import sys, os, time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

# 1. Load baseline GLB into Blender
import_code = """
import bpy, sys
sys.path.append(r'e:\\Car_Automation\\scripts\\blender')
import exterior_upgrade_pipeline as eup
eup.safe_scene_clear()
bpy.ops.import_scene.gltf(filepath=r'e:\\Car_Automation\\public\\models\\vehicles\\supercar\\1990s\\vehicle.glb')
"""
res = client.execute_code(import_code)
print("Import status:", res.get("status"))
time.sleep(1.0)

# 2. Capture 5 validation angles
views = [
    ('front_three_quarter', 'f1_before_front34.png'),
    ('rear_three_quarter', 'f1_before_rear34.png'),
    ('side', 'f1_before_side.png'),
    ('front', 'f1_before_front.png'),
    ('rear', 'f1_before_rear.png'),
]

out_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\a7eed851-2962-4f9e-a40d-bf1769875cd5"

for view_name, fname in views:
    code = f"""
import sys
if r'{scripts_dir}' not in sys.path:
    sys.path.append(r'{scripts_dir}')
import exterior_upgrade_pipeline as eup
eup.set_viewport_view('{view_name}')
"""
    client.execute_code(code)
    time.sleep(0.4)
    out_path = os.path.join(out_dir, fname)
    res = client.get_viewport_screenshot(out_path, max_size=1200)
    print(f"Captured {view_name} -> {fname}: {res.get('status')}")
