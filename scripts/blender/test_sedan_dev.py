"""
==============================================================================
EXECUTIVE SPORT SEDAN CLASS-A CAD GENERATOR & SHOWCASE RENDERER
==============================================================================
Builds authentic, German-engineered 4-Door Executive Sport Sedan
with continuous flowing sheetmetal, integrated optics, flared arches,
sculpted ducktail decklid, full interior, powertrain, and 20" forged wheels.
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for b in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
    for it in list(b):
        if it.users == 0:
            b.remove(it)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# ----------------------------------------------------------------------------
# 1. PBR AUTOMOTIVE SHADERS
# ----------------------------------------------------------------------------
def set_principled_socket(principled, socket_names, value):
    for name in socket_names:
        if name in principled.inputs:
            principled.inputs[name].default_value = value
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    set_principled_socket(bsdf, ['Base Color'], base_color)
    set_principled_socket(bsdf, ['Metallic'], metallic)
    set_principled_socket(bsdf, ['Roughness'], roughness)
    set_principled_socket(bsdf, ['Alpha'], alpha)

    if clearcoat > 0:
        set_principled_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
        set_principled_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], clearcoat_rough)

    if transmission > 0:
        set_principled_socket(bsdf, ['Transmission Weight', 'Transmission'], transmission)
        set_principled_socket(bsdf, ['IOR'], ior)

    if emission:
        set_principled_socket(bsdf, ['Emission Color', 'Emission'], emission)
        set_principled_socket(bsdf, ['Emission Strength'], emission_strength)

    if transmission > 0.0 or alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    return mat

# Palette
MAT_PAINT = make_pbr_mat("Mat_Paint_Tanzanite_Blue", (0.015, 0.055, 0.165, 1.0), metallic=0.94, roughness=0.10, clearcoat=1.0, clearcoat_rough=0.015)
MAT_PAINT_ACCENT = make_pbr_mat("Mat_Paint_Sill_Dark", (0.012, 0.015, 0.022, 1.0), metallic=0.85, roughness=0.18, clearcoat=0.8)
MAT_CARBON = make_pbr_mat("Mat_Carbon_Fiber_Satin", (0.030, 0.030, 0.035, 1.0), metallic=0.25, roughness=0.22, clearcoat=0.85)
MAT_GLOSS_BLACK = make_pbr_mat("Mat_Trim_Piano_Gloss_Black", (0.008, 0.008, 0.010, 1.0), metallic=0.10, roughness=0.03, clearcoat=1.0)
MAT_CHROME = make_pbr_mat("Mat_Chrome_High_Mirror", (0.96, 0.96, 0.98, 1.0), metallic=1.0, roughness=0.015, clearcoat=1.0)
MAT_GLASS = make_pbr_mat("Mat_Glass_Dielectric", (0.85, 0.92, 0.98, 0.30), roughness=0.02, transmission=0.92, ior=1.52, alpha=0.30)
MAT_GLASS_TINT = make_pbr_mat("Mat_Glass_Privacy_Tint", (0.08, 0.10, 0.14, 0.65), roughness=0.02, transmission=0.75, ior=1.52, alpha=0.65)
MAT_TIRE = make_pbr_mat("Mat_Tire_Rubber_Radial", (0.022, 0.022, 0.025, 1.0), metallic=0.00, roughness=0.88)
MAT_ALLOY = make_pbr_mat("Mat_Forged_Alloy_Rim", (0.88, 0.89, 0.91, 1.0), metallic=0.98, roughness=0.12, clearcoat=0.8)
MAT_ROTOR = make_pbr_mat("Mat_CarbonCeramic_Rotor", (0.38, 0.38, 0.40, 1.0), metallic=0.85, roughness=0.30)
MAT_CALIPER = make_pbr_mat("Mat_Brembo_Red_Caliper", (0.90, 0.02, 0.02, 1.0), metallic=0.40, roughness=0.10, clearcoat=1.0)
MAT_LED_HEAD = make_pbr_mat("Mat_LED_Projector_White", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=25.0)
MAT_LED_DRL = make_pbr_mat("Mat_DRL_Ice_Blue", (0.35, 0.88, 1.0, 1.0), roughness=0.05, emission=(0.35, 0.88, 1.0, 1.0), emission_strength=20.0)
MAT_LED_TAIL = make_pbr_mat("Mat_OLED_Taillight_Ruby", (1.0, 0.01, 0.01, 1.0), roughness=0.05, emission=(1.0, 0.01, 0.01, 1.0), emission_strength=22.0)
MAT_LED_IND = make_pbr_mat("Mat_LED_Amber_Indicator", (1.0, 0.50, 0.02, 1.0), roughness=0.05, emission=(1.0, 0.50, 0.02, 1.0), emission_strength=18.0)
MAT_LEATHER = make_pbr_mat("Mat_Interior_Nappa_Leather", (0.055, 0.055, 0.060, 1.0), roughness=0.65)
MAT_SCREEN = make_pbr_mat("Mat_Interior_Digital_Screen", (0.08, 0.25, 0.45, 1.0), roughness=0.15, emission=(0.10, 0.35, 0.65, 1.0), emission_strength=4.0)
MAT_STEEL = make_pbr_mat("Mat_Structural_Steel", (0.22, 0.24, 0.26, 1.0), metallic=0.90, roughness=0.35)
MAT_ALUM = make_pbr_mat("Mat_Extruded_Aluminum", (0.72, 0.74, 0.76, 1.0), metallic=0.94, roughness=0.25)
MAT_EXHAUST = make_pbr_mat("Mat_Inconel_Exhaust", (0.62, 0.54, 0.46, 1.0), metallic=0.95, roughness=0.22)

def apply_finishing(obj, bevel=0.003, subsurf=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
    if subsurf > 0:
        s = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        s.levels = subsurf
        s.render_levels = subsurf
    w = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    w.keep_sharp = True
    return obj

EXPORT_REGISTRY = {}
def register_part(glb_name, obj_or_objs):
    if not isinstance(obj_or_objs, list):
        obj_or_objs = [obj_or_objs]
    if glb_name not in EXPORT_REGISTRY:
        EXPORT_REGISTRY[glb_name] = []
    EXPORT_REGISTRY[glb_name].extend(obj_or_objs)

print("Shader suite and export registry ready.")
