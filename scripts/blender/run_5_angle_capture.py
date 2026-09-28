#!/usr/bin/env python3
"""
Runner to capture 5 standard automotive validation angles:
1. Front 3/4
2. Rear 3/4
3. Side
4. Front
5. Rear
"""
import os
import sys
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

def capture_suite(out_dir, prefix):
    os.makedirs(out_dir, exist_ok=True)
    views = [
        ('front_three_quarter', f"{prefix}_front34.png"),
        ('rear_three_quarter', f"{prefix}_rear34.png"),
        ('side', f"{prefix}_side.png"),
        ('front', f"{prefix}_front.png"),
        ('rear', f"{prefix}_rear.png"),
    ]
    results = {}
    for view_name, filename in views:
        # 1. Set viewport view in Blender
        code = f"""
import sys
if r"{scripts_dir}" not in sys.path:
    sys.path.append(r"{scripts_dir}")
import bpy
bpy.context.scene.frame_set(0)
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.rotation_euler = (0, 0, 0)
import exterior_upgrade_pipeline as eup
eup.set_viewport_view('{view_name}')
"""
        client.execute_code(code)
        time.sleep(0.3)
        # 2. Capture screenshot to disk
        out_path = os.path.join(out_dir, filename)
        res = client.get_viewport_screenshot(out_path, max_size=1200)
        results[view_name] = out_path
        print(f"Captured {view_name} -> {filename}: {res.get('status')}")
    return results

if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else r"e:\Car_Automation\scripts\output\screenshots\countach_before"
    prefix = sys.argv[2] if len(sys.argv) > 2 else "countach_before"
    capture_suite(out_dir, prefix)
