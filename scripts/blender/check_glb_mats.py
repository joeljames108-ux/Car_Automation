import bpy
import os

p = os.path.abspath("exports/Car_Sedan_Complete.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=p)

for o in bpy.data.objects:
    if o.type == 'MESH':
        mats = [m.name for m in o.data.materials if m]
        if any(k in o.name.lower() for k in ["tyre", "rim", "disk", "caliper", "blk", "bodypaint", "interior"]):
            print(f"Object: {o.name:25s} -> Materials: {mats}")
            for m in o.data.materials:
                if m and m.use_nodes:
                    bsdf = m.node_tree.nodes.get("Principled BSDF")
                    if bsdf:
                        col = bsdf.inputs['Base Color'].default_value[:]
                        rough = bsdf.inputs['Roughness'].default_value
                        spec = bsdf.inputs.get('Specular IOR Level', bsdf.inputs.get('Specular'))
                        spec_val = spec.default_value if spec else None
                        print(f"   Mat [{m.name}]: Base Color = {col[:3]}, Roughness = {rough:.3f}, Specular = {spec_val}")
