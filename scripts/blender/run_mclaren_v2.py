import sys
import os

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

script_path = r"e:\Car_Automation\scripts\blender\generators\generate_mclaren_f1_master_cad_v2.py"
with open(script_path, "r", encoding="utf-8") as f:
    code = f.read()

res = client.execute_code(code)
print("Execution result:", res.get("status"))
if "result" in res:
    print(res["result"].get("result", ""))
if "error" in res:
    print("Error:", res["error"])
