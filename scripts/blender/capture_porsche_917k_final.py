import sys
import os
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

glb_path = r"e:\Car_Automation\public\models\vehicles\hypercar\1970s\vehicle.glb"
out_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\277a7bde-5b87-4846-b0e1-e15c69a327be"
os.makedirs(out_dir, exist_ok=True)

# 1. Load upgraded GLB into Blender
load_code = f"""
import sys
if r'{scripts_dir}' not in sys.path:
    sys.path.append(r'{scripts_dir}')
import exterior_upgrade_pipeline as eup
eup.import_vehicle_glb(r'{glb_path}')
"""
res = client.execute_code(load_code)
print("Import status:", res)

# 2. Viewport setup & 5-angle capture
views = [
    ('front_three_quarter', 'porsche_917k_final_front34.png'),
    ('rear_three_quarter', 'porsche_917k_final_rear34.png'),
    ('side', 'porsche_917k_final_side.png'),
    ('front', 'porsche_917k_final_front.png'),
    ('rear', 'porsche_917k_final_rear.png'),
]

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

print("Upgraded 917K capture complete.")
