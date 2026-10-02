"""
AUTO TYCOON CAMPUS HQ - CAMPUS PBR MATERIAL LIBRARY (PHASE 62)

PBR Material Factory for Blender 4.x / 5.x procedural campus generation.
Implements the 45° resin diorama aesthetic with era-appropriate materials:
- 1970s Starter Era: Warm lavender exposed brick, coral-pink structural I-beams,
  tinted acrylic clerestory windows, travertine concrete, dark timber trim.
- 2000s+ Modern Era: Low-iron curtain walls, periwinkle composite panels,
  brushed structural aluminum, solar photovoltaic glass.
"""

import bpy

def get_or_create_material(name: str):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    else:
        mat.use_nodes = True
    return mat

def get_principled_bsdf(mat):
    tree = mat.node_tree
    bsdf = None
    for node in tree.nodes:
        if node.type == 'BSDF_PRINCIPLED':
            bsdf = node
            break
    if bsdf is None:
        bsdf = tree.nodes.new(type='ShaderNodeBsdfPrincipled')
        output = None
        for node in tree.nodes:
            if node.type == 'OUTPUT_MATERIAL':
                output = node
                break
        if output is None:
            output = tree.nodes.new(type='ShaderNodeOutputMaterial')
        tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return bsdf

def set_bsdf_color(bsdf, r, g, b, a=1.0):
    if 'Base Color' in bsdf.inputs:
        bsdf.inputs['Base Color'].default_value = (r, g, b, a)

def set_bsdf_prop(bsdf, prop_name, value):
    if prop_name in bsdf.inputs:
        bsdf.inputs[prop_name].default_value = value

# ── PBR Materials Palette ──

def mat_lavender_brick_1970():
    mat = get_or_create_material("MAT_Campus_Lavender_Brick_1970")
    bsdf = get_principled_bsdf(mat)
    # Warm lavender exposed brick (#9D8BA8 -> linear: 0.339, 0.264, 0.402)
    set_bsdf_color(bsdf, 0.339, 0.264, 0.402)
    set_bsdf_prop(bsdf, 'Roughness', 0.82)
    set_bsdf_prop(bsdf, 'Metallic', 0.02)
    return mat

def mat_coral_structural_beam():
    mat = get_or_create_material("MAT_Campus_Coral_IBeam")
    bsdf = get_principled_bsdf(mat)
    # Coral-pink structural steel beam (#FB7185 -> linear: 0.957, 0.165, 0.246)
    set_bsdf_color(bsdf, 0.957, 0.165, 0.246)
    set_bsdf_prop(bsdf, 'Roughness', 0.35)
    set_bsdf_prop(bsdf, 'Metallic', 0.65)
    return mat

def mat_tinted_acrylic_window():
    mat = get_or_create_material("MAT_Campus_Acrylic_Window_1970")
    bsdf = get_principled_bsdf(mat)
    # Tinted cyan-blue acrylic glazing (#38BDF8 -> linear: 0.038, 0.512, 0.941)
    set_bsdf_color(bsdf, 0.038, 0.512, 0.941, 0.85)
    set_bsdf_prop(bsdf, 'Roughness', 0.08)
    set_bsdf_prop(bsdf, 'IOR', 1.52)
    set_bsdf_prop(bsdf, 'Transmission Weight', 0.82)
    mat.blend_method = 'BLEND'
    return mat

def mat_modern_curtain_glass():
    mat = get_or_create_material("MAT_Campus_Modern_Curtain_Glass")
    bsdf = get_principled_bsdf(mat)
    # Low-iron architectural glass (#E0F2FE)
    set_bsdf_color(bsdf, 0.745, 0.900, 0.985, 0.90)
    set_bsdf_prop(bsdf, 'Roughness', 0.04)
    set_bsdf_prop(bsdf, 'IOR', 1.52)
    set_bsdf_prop(bsdf, 'Transmission Weight', 0.94)
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 1.0
    mat.blend_method = 'BLEND'
    return mat

def mat_travertine_concrete():
    mat = get_or_create_material("MAT_Campus_Travertine_Concrete")
    bsdf = get_principled_bsdf(mat)
    # Warm concrete (#E8E2D6 -> linear: 0.791, 0.753, 0.677)
    set_bsdf_color(bsdf, 0.791, 0.753, 0.677)
    set_bsdf_prop(bsdf, 'Roughness', 0.75)
    set_bsdf_prop(bsdf, 'Metallic', 0.05)
    return mat

def mat_dark_slate_roof():
    mat = get_or_create_material("MAT_Campus_Dark_Slate_Roof")
    bsdf = get_principled_bsdf(mat)
    # Dark slate gravel roof (#1E293B -> linear: 0.012, 0.022, 0.045)
    set_bsdf_color(bsdf, 0.012, 0.022, 0.045)
    set_bsdf_prop(bsdf, 'Roughness', 0.85)
    set_bsdf_prop(bsdf, 'Metallic', 0.1)
    return mat

def mat_brushed_aluminum():
    mat = get_or_create_material("MAT_Campus_Brushed_Aluminum")
    bsdf = get_principled_bsdf(mat)
    # Brushed aluminum window mullions (#CBD5E1)
    set_bsdf_color(bsdf, 0.584, 0.647, 0.723)
    set_bsdf_prop(bsdf, 'Roughness', 0.28)
    set_bsdf_prop(bsdf, 'Metallic', 0.92)
    return mat

def mat_interior_emissive_warm():
    mat = get_or_create_material("MAT_Campus_Interior_Emissive_Warm")
    bsdf = get_principled_bsdf(mat)
    # Warm interior illumination for night cycle (#FEF3C7)
    set_bsdf_color(bsdf, 0.990, 0.895, 0.575)
    set_bsdf_prop(bsdf, 'Roughness', 0.5)
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = (0.990, 0.895, 0.575, 1.0)
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 2.5
    return mat

def mat_safety_yellow():
    mat = get_or_create_material("MAT_Campus_Safety_Yellow")
    bsdf = get_principled_bsdf(mat)
    set_bsdf_color(bsdf, 0.941, 0.753, 0.038)
    set_bsdf_prop(bsdf, 'Roughness', 0.4)
    return mat

def mat_construction_orange():
    mat = get_or_create_material("MAT_Campus_Construction_Orange")
    bsdf = get_principled_bsdf(mat)
    set_bsdf_color(bsdf, 0.894, 0.294, 0.038)
    set_bsdf_prop(bsdf, 'Roughness', 0.5)
    return mat



def mat_corrugated_industrial_steel():
    mat = get_or_create_material("MAT_Campus_Industrial_Steel")
    bsdf = get_principled_bsdf(mat)
    # Galvanized corrugated industrial sheet metal (#78828F)
    set_bsdf_color(bsdf, 0.180, 0.220, 0.270)
    set_bsdf_prop(bsdf, 'Roughness', 0.45)
    set_bsdf_prop(bsdf, 'Metallic', 0.88)
    return mat

def mat_oil_stained_asphalt():
    mat = get_or_create_material("MAT_Campus_Oil_Stained_Asphalt")
    bsdf = get_principled_bsdf(mat)
    # Dark industrial tarmac with oily sheen (#222428)
    set_bsdf_color(bsdf, 0.015, 0.018, 0.022)
    set_bsdf_prop(bsdf, 'Roughness', 0.65)
    set_bsdf_prop(bsdf, 'Metallic', 0.15)
    return mat

def mat_high_voltage_orange():
    mat = get_or_create_material("MAT_Campus_HV_Orange")
    bsdf = get_principled_bsdf(mat)
    # High-voltage safety conduit orange (#EA580C)
    set_bsdf_color(bsdf, 0.800, 0.180, 0.015)
    set_bsdf_prop(bsdf, 'Roughness', 0.35)
    set_bsdf_prop(bsdf, 'Metallic', 0.1)
    return mat

def mat_cryo_cyan_emissive():
    mat = get_or_create_material("MAT_Campus_Cryo_Cyan_Emissive")
    bsdf = get_principled_bsdf(mat)
    # Cryogenic cleanroom glow (#06B6D4)
    set_bsdf_color(bsdf, 0.020, 0.700, 0.850)
    set_bsdf_prop(bsdf, 'Roughness', 0.1)
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = (0.020, 0.700, 0.850, 1.0)
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 3.5
    return mat

def mat_cast_iron_dark():
    mat = get_or_create_material("MAT_Campus_Cast_Iron_Dark")
    bsdf = get_principled_bsdf(mat)
    # Heavy machine tool bed cast iron (#33383F)
    set_bsdf_color(bsdf, 0.035, 0.042, 0.052)
    set_bsdf_prop(bsdf, 'Roughness', 0.55)
    set_bsdf_prop(bsdf, 'Metallic', 0.75)
    return mat

def mat_automotive_styling_clay():
    mat = get_or_create_material("MAT_Campus_Styling_Clay")
    bsdf = get_principled_bsdf(mat)
    # Warm industrial sulfur-free styling clay (#B45309 -> linear: 0.457, 0.133, 0.012)
    set_bsdf_color(bsdf, 0.457, 0.133, 0.012)
    set_bsdf_prop(bsdf, 'Roughness', 0.88)
    set_bsdf_prop(bsdf, 'Metallic', 0.0)
    return mat

def mat_cedar_wood_decking():
    mat = get_or_create_material("MAT_Campus_Cedar_Decking")
    bsdf = get_principled_bsdf(mat)
    # Warm golden architectural cedar decking (#C2884A -> linear: 0.535, 0.252, 0.070)
    set_bsdf_color(bsdf, 0.535, 0.252, 0.070)
    set_bsdf_prop(bsdf, 'Roughness', 0.62)
    set_bsdf_prop(bsdf, 'Metallic', 0.0)
    return mat

def mat_satin_matte_white():
    mat = get_or_create_material("MAT_Campus_Satin_White")
    bsdf = get_principled_bsdf(mat)
    # Alabaster satin architectural facade / exhibition surface (#F1F5F9)
    set_bsdf_color(bsdf, 0.875, 0.905, 0.935)
    set_bsdf_prop(bsdf, 'Roughness', 0.28)
    set_bsdf_prop(bsdf, 'Metallic', 0.05)
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 0.5
    return mat

def mat_pearl_concept_car_paint():
    mat = get_or_create_material("MAT_Campus_Pearl_Concept_Paint")
    bsdf = get_principled_bsdf(mat)
    # Pearlescent metallic electric blue (#0284C7 -> linear: 0.003, 0.231, 0.565)
    set_bsdf_color(bsdf, 0.003, 0.231, 0.565)
    set_bsdf_prop(bsdf, 'Roughness', 0.15)
    set_bsdf_prop(bsdf, 'Metallic', 0.85)
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 1.0
    return mat

def mat_holographic_cyan_glow():
    mat = get_or_create_material("MAT_Campus_Holo_Cyan_Glow")
    bsdf = get_principled_bsdf(mat)
    set_bsdf_color(bsdf, 0.05, 0.8, 1.0, 0.75)
    set_bsdf_prop(bsdf, 'Roughness', 0.05)
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = (0.05, 0.8, 1.0, 1.0)
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = 4.0
    mat.blend_method = 'BLEND'
    return mat

def mat_hitbox_invisible():
    mat = get_or_create_material("MAT_Campus_Hitbox_Invisible")
    bsdf = get_principled_bsdf(mat)
    set_bsdf_color(bsdf, 1.0, 1.0, 1.0, 0.0)
    set_bsdf_prop(bsdf, 'Transmission Weight', 1.0)
    set_bsdf_prop(bsdf, 'Roughness', 0.1)
    mat.blend_method = 'BLEND'
    return mat


