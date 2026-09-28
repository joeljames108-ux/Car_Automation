import sys, os

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

gen_script = r"e:\Car_Automation\scripts\blender\generators\generate_bugatti_chiron_master_cad.py"
with open(gen_script, "r", encoding="utf-8") as f:
    code = f.read()

res = client.execute_code(code)
print("Execution result:", res)
