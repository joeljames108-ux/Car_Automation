"""
==============================================================================
BLENDER 5.2 AUTOMATED POWERTRAIN ASSET PIPELINE:
V8 TWIN-TURBO RACING ENGINE, 6-SPEED SEQUENTIAL & 7-SPEED DCT TRANSMISSIONS
==============================================================================
Generates:
1. V8 Twin-Turbo Racing Engine (24 modular components including full internal
   rotating assembly: billet crankshaft, titanium rods, forged pistons, DOHC
   camshafts with 32 valves, and complete fuel/coolant/dry-sump/downpipes).
2. 6-Speed Sequential Racing Gearbox (6 modular components).
3. 7-Speed Dual-Clutch Transmission (5 modular components aligned to engine).
4. 800V Electric Drive Unit (3 modular components: motor, inverter, gearbox).
5. Keyframed 60-frame exploded assembly animation.
6. Unified complete assemblies and static exploded GLBs.
==============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[POWERTRAIN_PIPELINE] {msg}")

def ensure_col(name):
    col = bpy.data.collections.get(name)
    if not col:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def add_cylinder(bm, radius, depth, segments=16, matrix=Matrix.Identity(4)):
    return bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )

def create_pbr_mat(name, base_color, metallic=0.9, roughness=0.2, clearcoat=0.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Clearcoat Weight" in bsdf.inputs:
            bsdf.inputs["Clearcoat Weight"].default_value = clearcoat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat
    return mat

def export_single_object(obj, filepath):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )

def export_assembly(objects, filepath, apply_transforms=True, export_anim=False):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        if obj:
            obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_apply=apply_transforms,
        export_yup=True,
        export_animations=export_anim,
    )
