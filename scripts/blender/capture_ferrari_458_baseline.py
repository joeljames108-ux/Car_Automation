#!/usr/bin/env python3
"""
Import baseline Ferrari 458 Italia and capture 5 automotive angles.
"""
import os
import sys
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client
from run_5_angle_capture import capture_suite

def main():
    glb_path = r"e:\Car_Automation\exports\Car_Ferrari_458_Italia_2010s.glb"
    out_dir = r"e:\Car_Automation\assets\screenshots\ferrari_458_baseline"
    
    print(f"Loading baseline Ferrari 458 from {glb_path}...")
    import_code = f"""
import sys
if r"{scripts_dir}" not in sys.path:
    sys.path.append(r"{scripts_dir}")
import exterior_upgrade_pipeline as eup
eup.import_vehicle_glb(r"{glb_path}")
"""
    res = client.execute_code(import_code)
    print("Import status:", res.get("status"))
    time.sleep(1.0)
    
    print("Capturing 5-angle baseline suite...")
    results = capture_suite(out_dir, "ferrari_458_baseline")
    print("Baseline captures complete:", results)

if __name__ == '__main__':
    main()
