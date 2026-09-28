import sys
import os
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

def capture_open_suite(out_dir, prefix):
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Set scene frame to 30 (where open keyframes are baked)
    open_code = """
import bpy
bpy.context.scene.frame_set(30)
"""
    client.execute_code(open_code)
    time.sleep(0.5)

    views = [
        ('front_three_quarter', f"{prefix}_open_front34.png"),
        ('rear_three_quarter', f"{prefix}_open_rear34.png"),
        ('side', f"{prefix}_open_side.png"),
    ]

    for view_name, filename in views:
        code = f"""
import sys
if r"{scripts_dir}" not in sys.path:
    sys.path.append(r"{scripts_dir}")
import exterior_upgrade_pipeline as eup
eup.set_viewport_view('{view_name}')
"""
        client.execute_code(code)
        time.sleep(0.3)
        out_path = os.path.join(out_dir, filename)
        res = client.get_viewport_screenshot(out_path, max_size=1200)
        print(f"Captured {view_name} -> {filename}: {res.get('status')}")

    # Reset back to frame 0
    reset_code = """
import bpy
bpy.context.scene.frame_set(0)
"""
    client.execute_code(reset_code)

if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else r"e:\Car_Automation\assets\screenshots\mclaren_f1_v6_open"
    prefix = sys.argv[2] if len(sys.argv) > 2 else "mclaren_f1_v6"
    capture_open_suite(out_dir, prefix)
