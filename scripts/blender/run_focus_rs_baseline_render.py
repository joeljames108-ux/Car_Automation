"""
Run Focus RS generation followed by assessment view renders in a single Blender execution.
"""
import sys
import os

scripts_dir = r"E:\Car_Automation\scripts\blender"
gen_dir = os.path.join(scripts_dir, "generators")
if gen_dir not in sys.path:
    sys.path.append(gen_dir)
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import generate_ford_focus_rs_mk3
print("[RUNNER] Generating Ford Focus RS Mk3...")
generate_ford_focus_rs_mk3.build_ford_focus_rs_mk3_master()

print("[RUNNER] Rendering 5 Assessment Views...")
with open(os.path.join(scripts_dir, "render_focus_rs_assessment_views.py"), "r", encoding="utf-8") as f:
    code = f.read()
exec(code, globals(), globals())
