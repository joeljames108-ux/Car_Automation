import sys, os, time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

views = [
    ('front_three_quarter', 'mission_x_final_front34.png'),
    ('rear_three_quarter', 'mission_x_final_rear34.png'),
    ('side', 'mission_x_final_side.png'),
    ('front', 'mission_x_final_front.png'),
    ('rear', 'mission_x_final_rear.png'),
]

out_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\92f881cd-3dcf-4c07-ad54-41fc3095121a"

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
