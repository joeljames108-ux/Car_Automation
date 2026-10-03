import sys, os, time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

glb_path = r"e:\Car_Automation\public\models\vehicles\supercar\future\vehicle.glb"

# Safely clean objects and import the baseline GLB
load_code = f"""
import bpy
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for m in list(bpy.data.meshes):
    bpy.data.meshes.remove(m, do_unlink=True)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=r'{glb_path}')
"""
client.execute_code(load_code)
time.sleep(1.0)

views = [
    ('front_three_quarter', 'mission_x_before_front34.png'),
    ('rear_three_quarter', 'mission_x_before_rear34.png'),
    ('side', 'mission_x_before_side.png'),
    ('front', 'mission_x_before_front.png'),
    ('rear', 'mission_x_before_rear.png'),
]

out_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\a7eed851-2962-4f9e-a40d-bf1769875cd5"

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
    print(f"Captured baseline {view_name} -> {fname}: {res.get('status')}")
