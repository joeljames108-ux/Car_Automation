#!/usr/bin/env python3
"""
Runner for Ferrari 458 Italia Master CAD generator.
"""
import sys
import time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

def main():
    script_path = r"e:\Car_Automation\scripts\blender\generators\generate_ferrari_458_master_cad_v4.py"
    print(f"Executing {script_path} inside Blender...")
    code = f"""
import traceback
try:
    with open(r"{script_path}", 'r') as f:
        src = f.read()
    exec(compile(src, r"{script_path}", 'exec'), globals())
    result = "SUCCESS"
except Exception as e:
    result = "TRACEBACK:\\n" + traceback.format_exc()
"""
    res = client.execute_code(code)
    print("Execution result:\n", res.get('result'))

if __name__ == '__main__':
    main()
