import sys, os, time

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import blender_mcp_client as client

glb_path = r"e:\Car_Automation\public\models\vehicles\hypercar\2020s\vehicle.glb"

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
    ('front_three_quarter', 'bugatti_chiron_before_front34.png'),
    ('rear_three_quarter', 'bugatti_chiron_before_rear34.png'),
    ('side', 'bugatti_chiron_before_side.png'),
    ('front', 'bugatti_chiron_before_front.png'),
    ('rear', 'bugatti_chiron_before_rear.png'),
]

out_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\277a7bde-5b87-4846-b0e1-e15c69a327be"

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
