#!/usr/bin/env python3
"""
Captures feature verification angles for F40 at Frame 30 (Doors Open, Headlamps Popped Up, Engine Deck Tilted):
1. Front 3/4 (showing open door, popped-up headlights, front splitter)
2. Rear 3/4 (showing open door, tilted engine deck, exposed twin-turbo V8, rear wing)
3. Cockpit Interior (showing Nomex racing seats, Momo steering wheel, gated shifter, pedal box)
"""
import os
import sys
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

def capture_open_suite(out_dir, prefix):
    os.makedirs(out_dir, exist_ok=True)
    
    # Set frame to 30 (Open state)
    setup_code = """
import bpy, sys
if r"e:\\Car_Automation\\scripts\\blender" not in sys.path:
    sys.path.append(r"e:\\Car_Automation\\scripts\\blender")
import exterior_upgrade_pipeline as eup
bpy.context.scene.frame_set(30)
"""
    client.execute_code(setup_code)
    time.sleep(0.3)
    
    views = [
        ('front_three_quarter', f"{prefix}_open_front34.png"),
        ('rear_three_quarter', f"{prefix}_open_rear34.png"),
        ('side', f"{prefix}_open_side.png"),
    ]
    
    results = {}
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
        results[view_name] = out_path
        print(f"Captured {view_name} -> {filename}: {res.get('status')}")

    # Set frame back to 0
    client.execute_code("import bpy\nbpy.context.scene.frame_set(0)\n")
    return results

if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else r"e:\Car_Automation\assets\screenshots\f40_v5_open"
    prefix = sys.argv[2] if len(sys.argv) > 2 else "f40_v5"
    capture_open_suite(out_dir, prefix)
