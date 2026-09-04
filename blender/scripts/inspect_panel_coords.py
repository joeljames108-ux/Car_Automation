import bpy

names = [
    'Bonnet_Hinge_Pivot', 'Bonnet_Hood_Skin', 'Greenhouse_Roof_Canopy',
    'Door_Hinge_Pivot_Left', 'Door_Main_Skin_Left', 'Fender_Front_Left',
    'Rear_Haunch_Left', 'Front_Bumper_Fascia', 'Rear_Bumper_Fascia',
    'Dicky_Decklid_Pivot', 'Dicky_Engine_Cover_Skin', 'Side_Skirts_Left',
    'Front_Splitter_Assembly', 'Rear_Wing_Assembly', 'Diffuser_Venturi_Assembly',
    'Wheel_Corner_Assembly_FL', 'Wheel_Corner_Assembly_RL'
]

for name in names:
    obj = bpy.data.objects.get(name)
    if obj:
        pname = obj.parent.name if obj.parent else "None"
        loc = [round(v, 3) for v in obj.location]
        wloc = [round(v, 3) for v in obj.matrix_world.translation]
        dims = [round(v, 3) for v in obj.dimensions]
        print(f"{name:26} | parent={pname:24} | loc={loc} | world_loc={wloc} | dims={dims}")
