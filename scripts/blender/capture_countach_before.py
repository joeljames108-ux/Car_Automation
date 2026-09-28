import sys
import os

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import exterior_upgrade_pipeline as eup
import bpy

# Import the existing model
glb_path = r"e:\Car_Automation\public\models\vehicles\supercar\1970s\vehicle.glb"
eup.import_vehicle_glb(glb_path)

out_dir = r"e:\Car_Automation\scripts\output\screenshots\countach_before"
os.makedirs(out_dir, exist_ok=True)

views = [
    ('front_three_quarter', 'countach_before_front34.png'),
    ('rear_three_quarter', 'countach_before_rear34.png'),
    ('side', 'countach_before_side.png'),
    ('front', 'countach_before_front.png'),
    ('rear', 'countach_before_rear.png'),
]

for view_name, filename in views:
    eup.set_viewport_view(view_name)
    shot_path = os.path.join(out_dir, filename)
    # Give viewport time to update
    bpy.context.view_layer.update()
    print(f"Set view: {view_name}")
