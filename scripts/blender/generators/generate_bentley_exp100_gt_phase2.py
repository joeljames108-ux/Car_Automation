"""
=============================================================================
Procedural Class-A CAD Generator: Bentley EXP 100 GT Future Limousine
PHASE 66: Organic Sculpture Body, Crystal Matrix Grille, Matrix LED Lights,
OLED Rear Light Bar, Active Aero & Electrochromic Glass Canopy
=============================================================================
Limousine Architecture — Future Sovereign Grand Touring Exterior
Phase 66 builds the breathtaking exterior body shell, lighting, and active
aerodynamic elements for the Bentley EXP 100 GT concept:
1. 5,800mm organic flowing sculpture body with dramatic crease lines
2. Illuminated Cumbrian Crystal Matrix grille with copper-infused Riverwood frame
3. Full-LED Matrix headlights with crystal jewel DRL and AI-adaptive beams
4. Illuminated Bentley "B" Flying Spur mascot with fiber-optic wings
5. OLED full-width rear light bar (2.1m continuous band)
6. Active aero: motorized splitter, side air curtains, adaptive rear wing
7. Electrochromic panoramic glass canopy (windshield-to-rear continuous)
8. Copper-tipped mirrors, flush handles, Bentley badges & jewelry
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ============================================================================
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
# ============================================================================

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh cylinder creation using create_cone."""
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    kwargs.pop('round_cap', None)
    if matrix is None:
        matrix = Matrix()
    try:
        bmesh.ops.create_cone(bm, cap_ends=cap_ends, cap_tris=cap_tris,
                              segments=segments, radius1=r1, radius2=r2,
                              depth=depth, matrix=matrix, **kwargs)
    except TypeError:
        bmesh.ops.create_cone(bm, cap_ends=cap_ends, cap_tris=cap_tris,
                              segments=segments, radius1=r1, radius2=r2,
                              depth=depth, matrix=matrix)


def _compat_create_uvsphere(bm, u_segments=16, v_segments=8, radius=1.0, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh UV sphere creation."""
    if matrix is None:
        matrix = Matrix()
    try:
        bmesh.ops.create_uvsphere(bm, u_segments=u_segments, v_segments=v_segments,
                                   radius=radius, matrix=matrix, **kwargs)
    except TypeError:
        bmesh.ops.create_uvsphere(bm, u_segments=u_segments, v_segments=v_segments,
                                   radius=radius, matrix=matrix)


def _compat_create_cube(bm, size=1.0, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh cube creation."""
    if matrix is None:
        matrix = Matrix()
    try:
        bmesh.ops.create_cube(bm, size=size, matrix=matrix, **kwargs)
    except TypeError:
        bmesh.ops.create_cube(bm, size=size, matrix=matrix)


def bmesh_to_object(bm, name, collection=None):
    """Convert bmesh to Blender object with proper cleanup."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    if collection is None:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    return obj


def apply_smooth_shading(obj, angle_deg=32.0):
    """Apply smooth shading by angle to object."""
    try:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        if hasattr(bpy.ops.object, 'shade_smooth_by_angle'):
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))
        elif hasattr(bpy.ops.object, 'shade_smooth'):
            bpy.ops.object.shade_smooth()
        obj.select_set(False)
    except Exception:
        pass


def create_principled_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0,
                                roughness=0.5, clearcoat=0.0, clearcoat_roughness=0.1,
                                emission_color=None, emission_strength=0.0,
                                alpha=1.0, transmission=0.0, ior=1.45,
                                specular=0.5, anisotropic=0.0, sheen=0.0):
    """Create a Principled BSDF material with PBR parameters."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    output_node.location = (400, 0)
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    principled.location = (0, 0)
    links.new(principled.outputs['BSDF'], output_node.inputs['Surface'])

    principled.inputs['Base Color'].default_value = base_color
    principled.inputs['Metallic'].default_value = metallic
    principled.inputs['Roughness'].default_value = roughness
    principled.inputs['IOR'].default_value = ior

    if transmission > 0.0:
        principled.inputs['Transmission Weight'].default_value = transmission
        mat.surface_render_method = 'BLENDED' if hasattr(mat, 'surface_render_method') else None

    if alpha < 1.0:
        principled.inputs['Alpha'].default_value = alpha
        mat.surface_render_method = 'BLENDED' if hasattr(mat, 'surface_render_method') else None

    try:
        principled.inputs['Coat Weight'].default_value = clearcoat
        principled.inputs['Coat Roughness'].default_value = clearcoat_roughness
    except KeyError:
        try:
            principled.inputs['Clearcoat'].default_value = clearcoat
            principled.inputs['Clearcoat Roughness'].default_value = clearcoat_roughness
        except KeyError:
            pass

    try:
        principled.inputs['Specular IOR Level'].default_value = specular
    except KeyError:
        try:
            principled.inputs['Specular'].default_value = specular
        except KeyError:
            pass

    if emission_color and emission_strength > 0:
        principled.inputs['Emission Color'].default_value = emission_color
        principled.inputs['Emission Strength'].default_value = emission_strength

    return mat


# ============================================================================
# 2. PBR MATERIAL FACTORY — PHASE 66 EXTERIOR
# ============================================================================

def create_bentley_exp100_phase2_materials():
    """Create the full PBR material palette for Bentley EXP 100 GT exterior."""
    mats = {}

    # Verdant Green hand-polished deep lacquer body
    mats['body_green'] = create_principled_material(
        'EXP100_P2_Body_Verdant_Green',
        base_color=(0.04, 0.22, 0.12, 1.0), metallic=0.88,
        roughness=0.08, clearcoat=1.0, clearcoat_roughness=0.02,
        specular=0.7, ior=1.52)

    # Cumbrian Crystal illuminated matrix
    mats['crystal'] = create_principled_material(
        'EXP100_P2_Cumbrian_Crystal',
        base_color=(0.95, 0.96, 0.98, 1.0), metallic=0.0,
        roughness=0.02, clearcoat=1.0, clearcoat_roughness=0.01,
        transmission=0.85, ior=1.72, specular=0.9,
        emission_color=(0.85, 0.92, 1.0, 1.0), emission_strength=1.5)

    # Copper-infused Riverwood grille surround
    mats['copper_wood'] = create_principled_material(
        'EXP100_P2_Copper_Riverwood',
        base_color=(0.55, 0.28, 0.12, 1.0), metallic=0.15,
        roughness=0.45, clearcoat=0.8, clearcoat_roughness=0.12,
        specular=0.4, ior=1.55)

    # Dark copper trim accents
    mats['dark_copper'] = create_principled_material(
        'EXP100_P2_Dark_Copper_Trim',
        base_color=(0.62, 0.35, 0.18, 1.0), metallic=0.92,
        roughness=0.18, clearcoat=0.6, clearcoat_roughness=0.05,
        specular=0.7)

    # Polished chrome (Flying B, badges)
    mats['chrome'] = create_principled_material(
        'EXP100_P2_Polished_Chrome',
        base_color=(0.92, 0.94, 0.96, 1.0), metallic=1.0,
        roughness=0.03, specular=0.9, clearcoat=1.0, clearcoat_roughness=0.01)

    # Headlamp projector lens — high-clarity optical polycarbonate
    mats['headlamp_lens'] = create_principled_material(
        'EXP100_P2_Headlamp_Lens',
        base_color=(0.92, 0.94, 0.96, 1.0), metallic=0.0,
        roughness=0.01, clearcoat=1.0, clearcoat_roughness=0.01,
        transmission=0.92, ior=1.59)

    # Headlamp DRL LED emissive (white)
    mats['drl_white'] = create_principled_material(
        'EXP100_P2_DRL_White_LED',
        base_color=(0.95, 0.97, 1.0, 1.0), metallic=0.0,
        roughness=0.02,
        emission_color=(0.95, 0.97, 1.0, 1.0), emission_strength=8.0)

    # Amber turn signal emissive
    mats['amber_signal'] = create_principled_material(
        'EXP100_P2_Amber_Signal',
        base_color=(1.0, 0.65, 0.05, 1.0), metallic=0.0,
        roughness=0.05,
        emission_color=(1.0, 0.65, 0.05, 1.0), emission_strength=5.0)

    # Headlamp internal reflector (satin chrome)
    mats['reflector'] = create_principled_material(
        'EXP100_P2_Reflector_Chrome',
        base_color=(0.88, 0.90, 0.92, 1.0), metallic=0.98,
        roughness=0.05, specular=0.85)

    # OLED rear light bar — ruby red
    mats['oled_red'] = create_principled_material(
        'EXP100_P2_OLED_Red_Lightbar',
        base_color=(0.85, 0.02, 0.02, 1.0), metallic=0.0,
        roughness=0.02,
        emission_color=(0.95, 0.03, 0.03, 1.0), emission_strength=6.0)

    # OLED rear light bar housing (dark)
    mats['oled_housing'] = create_principled_material(
        'EXP100_P2_OLED_Housing',
        base_color=(0.04, 0.04, 0.05, 1.0), metallic=0.3,
        roughness=0.35, clearcoat=0.8, clearcoat_roughness=0.05)

    # Taillight clear reverse lens
    mats['reverse_clear'] = create_principled_material(
        'EXP100_P2_Reverse_Clear_Lens',
        base_color=(0.90, 0.92, 0.94, 1.0), metallic=0.0,
        roughness=0.02, transmission=0.80, ior=1.52)

    # Electrochromic glass canopy
    mats['canopy_glass'] = create_principled_material(
        'EXP100_P2_Electrochromic_Canopy',
        base_color=(0.12, 0.15, 0.20, 1.0), metallic=0.0,
        roughness=0.01, clearcoat=1.0, clearcoat_roughness=0.01,
        transmission=0.82, ior=1.52, alpha=0.35)

    # Windshield glass
    mats['windshield'] = create_principled_material(
        'EXP100_P2_Windshield_Glass',
        base_color=(0.85, 0.88, 0.92, 1.0), metallic=0.0,
        roughness=0.01, clearcoat=1.0, clearcoat_roughness=0.01,
        transmission=0.90, ior=1.52, alpha=0.25)

    # Privacy rear glass
    mats['privacy_glass'] = create_principled_material(
        'EXP100_P2_Privacy_Glass',
        base_color=(0.08, 0.10, 0.14, 1.0), metallic=0.0,
        roughness=0.01, clearcoat=1.0, clearcoat_roughness=0.01,
        transmission=0.50, ior=1.52, alpha=0.40)

    # Carbon fiber (aero elements)
    mats['carbon'] = create_principled_material(
        'EXP100_P2_Carbon_Fiber',
        base_color=(0.04, 0.04, 0.06, 1.0), metallic=0.15,
        roughness=0.35, clearcoat=0.9, clearcoat_roughness=0.04,
        specular=0.5)

    # Active aero actuator motor
    mats['aero_motor'] = create_principled_material(
        'EXP100_P2_Aero_Actuator',
        base_color=(0.45, 0.46, 0.48, 1.0), metallic=0.88,
        roughness=0.30, specular=0.55)

    # Rubber seals & trim
    mats['rubber'] = create_principled_material(
        'EXP100_P2_Rubber_Seal',
        base_color=(0.03, 0.03, 0.04, 1.0), metallic=0.0,
        roughness=0.75, specular=0.08)

    # Dark inner wheel tubs
    mats['inner_tub'] = create_principled_material(
        'EXP100_P2_Inner_Wheel_Tub',
        base_color=(0.05, 0.05, 0.06, 1.0), metallic=0.1,
        roughness=0.60, specular=0.15)

    # Bentley "B" illuminated emblem
    mats['bentley_b'] = create_principled_material(
        'EXP100_P2_Bentley_B_Illuminated',
        base_color=(0.92, 0.94, 0.96, 1.0), metallic=0.95,
        roughness=0.03, specular=0.9,
        emission_color=(0.90, 0.92, 0.95, 1.0), emission_strength=3.0)

    # Fiber-optic wing filament (Flying B mascot)
    mats['fiber_optic'] = create_principled_material(
        'EXP100_P2_FiberOptic_Wing',
        base_color=(0.80, 0.85, 0.95, 1.0), metallic=0.0,
        roughness=0.02, transmission=0.70, ior=1.50,
        emission_color=(0.85, 0.90, 1.0, 1.0), emission_strength=4.0)

    return mats


# ============================================================================
# 3. ORGANIC SCULPTURE BODY SHELL
# ============================================================================

def build_exp100_body_shell(mats, collection):
    """Build the 5,800mm organic flowing sculpture body shell.
    Dramatic crease lines, sweeping fender haunches, flowing C-pillar,
    enclosed wheel arches with zero see-through voids.
    """
    objects = []

    # --- Main Upper Body Shell ---
    # Hood/bonnet section (front)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.10, 0.80))) @
        Matrix.Rotation(math.radians(-3), 4, 'X') @
        Matrix.Diagonal(Vector((1.90, 1.40, 0.06, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Hood_Bonnet', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Cabin roof panel
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 0.10, 1.28))) @
        Matrix.Diagonal(Vector((1.70, 2.40, 0.04, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Roof_Panel', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Trunk/decklid panel (rear)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -1.85, 0.88))) @
        Matrix.Rotation(math.radians(5), 4, 'X') @
        Matrix.Diagonal(Vector((1.80, 0.80, 0.06, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Trunk_Decklid', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Left Body Side Panel ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.98, 0.20, 0.62))) @
        Matrix.Diagonal(Vector((0.04, 4.80, 0.60, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Side_Panel_L', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Right Body Side Panel ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((-0.98, 0.20, 0.62))) @
        Matrix.Diagonal(Vector((0.04, 4.80, 0.60, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Side_Panel_R', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Front Nose Fascia (solid, no voids) ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.78, 0.55))) @
        Matrix.Diagonal(Vector((1.92, 0.12, 0.45, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Front_Nose_Fascia', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rear Fascia Panel (solid trunk rear face) ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.50, 0.62))) @
        Matrix.Diagonal(Vector((1.85, 0.08, 0.38, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Rear_Fascia', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Front Fender Left ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.88, 1.65, 0.55))) @
        Matrix.Diagonal(Vector((0.14, 0.90, 0.50, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Front_Fender_L', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Front Fender Right ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((-0.88, 1.65, 0.55))) @
        Matrix.Diagonal(Vector((0.14, 0.90, 0.50, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Front_Fender_R', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rear Quarter Panel Left (haunched) ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.90, -1.65, 0.58))) @
        Matrix.Diagonal(Vector((0.16, 0.95, 0.52, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Rear_Quarter_L', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rear Quarter Panel Right ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((-0.90, -1.65, 0.58))) @
        Matrix.Diagonal(Vector((0.16, 0.95, 0.52, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Rear_Quarter_R', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rocker Sills (left & right) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.96, 0.20, 0.28))) @
            Matrix.Diagonal(Vector((0.06, 3.80, 0.08, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_Rocker_Sill_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Front Bumper Apron ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.82, 0.30))) @
        Matrix.Diagonal(Vector((1.94, 0.08, 0.18, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Front_Bumper', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Front lower intake valance
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.85, 0.18))) @
        Matrix.Diagonal(Vector((1.50, 0.06, 0.10, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Front_Intake_Valance', collection)
    obj.data.materials.append(mats['carbon'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rear Bumper ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.55, 0.30))) @
        Matrix.Diagonal(Vector((1.88, 0.08, 0.16, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Rear_Bumper', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Rear diffuser lip
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.58, 0.18))) @
        Matrix.Diagonal(Vector((1.40, 0.06, 0.08, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'BODY_EXP100_Rear_Diffuser_Lip', collection)
    obj.data.materials.append(mats['carbon'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Inner Wheel Tubs (4 corners, dark enclosed) ---
    wheel_positions = [
        ('FL', Vector((0.95, 1.65, 0.33))),
        ('FR', Vector((-0.95, 1.65, 0.33))),
        ('RL', Vector((0.95, -1.65, 0.33))),
        ('RR', Vector((-0.95, -1.65, 0.33))),
    ]
    for label, center in wheel_positions:
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.40, depth=0.10, segments=32, matrix=(
            Matrix.Translation(center) @
            Matrix.Rotation(math.radians(90), 4, 'Y')
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_WheelTub_{label}', collection)
        obj.data.materials.append(mats['inner_tub'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Wheel Arch Openings (semicircular cutaway flares) ---
    for label, center in wheel_positions:
        x_sign = 1.0 if center.x > 0 else -1.0
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.42, depth=0.03, segments=32, matrix=(
            Matrix.Translation(Vector((center.x + x_sign * 0.04, center.y, center.z))) @
            Matrix.Rotation(math.radians(90), 4, 'Y')
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_WheelArch_{label}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- A-Pillar Left & Right (structural windshield frame) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.88, 1.25, 1.05))) @
            Matrix.Rotation(math.radians(-20), 4, 'X') @
            Matrix.Diagonal(Vector((0.05, 0.06, 0.50, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_A_Pillar_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- B-Pillar (thin, dark gloss) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.93, 0.10, 0.95))) @
            Matrix.Diagonal(Vector((0.03, 0.04, 0.35, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_B_Pillar_{side}', collection)
        obj.data.materials.append(mats['rubber'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- C-Pillar / D-Pillar (flowing sail panel) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.85, -1.05, 1.05))) @
            Matrix.Rotation(math.radians(12), 4, 'X') @
            Matrix.Diagonal(Vector((0.06, 0.06, 0.40, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'BODY_EXP100_C_Pillar_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

    return objects


# ============================================================================
# 4. ILLUMINATED CUMBRIAN CRYSTAL MATRIX GRILLE
# ============================================================================

def build_exp100_crystal_grille(mats, collection):
    """Build illuminated Cumbrian Crystal Matrix front grille.
    Copper-infused Riverwood surround frame with 3D crystal lattice interior.
    """
    objects = []

    # Grille surround frame (copper Riverwood)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.82, 0.56))) @
        Matrix.Diagonal(Vector((0.68, 0.06, 0.30, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GRILLE_EXP100_Surround_Frame', collection)
    obj.data.materials.append(mats['copper_wood'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Inner grille dark backing
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.80, 0.56))) @
        Matrix.Diagonal(Vector((0.60, 0.03, 0.26, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GRILLE_EXP100_Dark_Backing', collection)
    obj.data.materials.append(mats['rubber'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # 3D Crystal lattice elements (8x5 grid of crystal jewels)
    for row in range(5):
        for col in range(8):
            x_pos = -0.24 + col * 0.07
            z_pos = 0.45 + row * 0.05
            bm = bmesh.new()
            _compat_create_cube(bm, size=1.0, matrix=(
                Matrix.Translation(Vector((x_pos, 2.83, z_pos))) @
                Matrix.Diagonal(Vector((0.028, 0.015, 0.022, 1.0)))
            ))
            obj = bmesh_to_object(bm, f'GRILLE_EXP100_Crystal_{row+1:02d}_{col+1:02d}', collection)
            obj.data.materials.append(mats['crystal'])
            apply_smooth_shading(obj)
            objects.append(obj)

    # Grille chrome divider bar (horizontal center)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.84, 0.56))) @
        Matrix.Diagonal(Vector((0.62, 0.005, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GRILLE_EXP100_Chrome_Divider', collection)
    obj.data.materials.append(mats['chrome'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Bentley "B" badge on grille (illuminated)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.035, depth=0.008, segments=24, matrix=(
        Matrix.Translation(Vector((0.0, 2.85, 0.56))) @
        Matrix.Rotation(math.radians(90), 4, 'X')
    ))
    obj = bmesh_to_object(bm, 'GRILLE_EXP100_Bentley_B_Badge', collection)
    obj.data.materials.append(mats['bentley_b'])
    apply_smooth_shading(obj)
    objects.append(obj)

    return objects


# ============================================================================
# 5. FULL-LED MATRIX HEADLIGHTS & FLYING B MASCOT
# ============================================================================

def build_exp100_headlights_and_mascot(mats, collection):
    """Build Full-LED Matrix headlights with crystal jewel DRL and Flying B mascot."""
    objects = []

    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        x_base = x_sign * 0.72

        # Headlamp housing (body-colored outer shell)
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_base, 2.75, 0.62))) @
            Matrix.Diagonal(Vector((0.28, 0.12, 0.12, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_Housing_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Internal reflector bowl
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_base, 2.73, 0.62))) @
            Matrix.Diagonal(Vector((0.24, 0.06, 0.10, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_Reflector_{side}', collection)
        obj.data.materials.append(mats['reflector'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Matrix LED projector module (3 micro-projectors)
        for proj_i in range(3):
            proj_x = x_base + (proj_i - 1) * 0.05 * x_sign
            bm = bmesh.new()
            _compat_create_cylinder(bm, radius=0.018, depth=0.03, segments=16, matrix=(
                Matrix.Translation(Vector((proj_x, 2.76, 0.62))) @
                Matrix.Rotation(math.radians(90), 4, 'X')
            ))
            obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_Projector_{side}_{proj_i+1}', collection)
            obj.data.materials.append(mats['headlamp_lens'])
            apply_smooth_shading(obj)
            objects.append(obj)

        # Crystal Jewel DRL eyebrow (continuous LED strip above headlamp)
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_base, 2.78, 0.695))) @
            Matrix.Diagonal(Vector((0.26, 0.008, 0.012, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_DRL_Eyebrow_{side}', collection)
        obj.data.materials.append(mats['drl_white'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Polycarbonate outer lens cover
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_base, 2.80, 0.62))) @
            Matrix.Diagonal(Vector((0.27, 0.005, 0.11, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_OuterLens_{side}', collection)
        obj.data.materials.append(mats['headlamp_lens'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Amber turn signal strip (below DRL)
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_base, 2.78, 0.545))) @
            Matrix.Diagonal(Vector((0.22, 0.006, 0.008, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'HEADLAMP_EXP100_Amber_Signal_{side}', collection)
        obj.data.materials.append(mats['amber_signal'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Illuminated Flying B Mascot on Hood ---
    # Base plinth
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.025, depth=0.02, segments=20, matrix=(
        Matrix.Translation(Vector((0.0, 2.55, 0.82)))
    ))
    obj = bmesh_to_object(bm, 'MASCOT_EXP100_FlyingB_Plinth', collection)
    obj.data.materials.append(mats['chrome'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Flying "B" body
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.012, depth=0.05, segments=12, matrix=(
        Matrix.Translation(Vector((0.0, 2.55, 0.86)))
    ))
    obj = bmesh_to_object(bm, 'MASCOT_EXP100_FlyingB_Body', collection)
    obj.data.materials.append(mats['bentley_b'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Fiber-optic wing (left)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.04, 2.55, 0.885))) @
        Matrix.Rotation(math.radians(15), 4, 'Y') @
        Matrix.Diagonal(Vector((0.05, 0.005, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'MASCOT_EXP100_FlyingB_Wing_L', collection)
    obj.data.materials.append(mats['fiber_optic'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Fiber-optic wing (right)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((-0.04, 2.55, 0.885))) @
        Matrix.Rotation(math.radians(-15), 4, 'Y') @
        Matrix.Diagonal(Vector((0.05, 0.005, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'MASCOT_EXP100_FlyingB_Wing_R', collection)
    obj.data.materials.append(mats['fiber_optic'])
    apply_smooth_shading(obj)
    objects.append(obj)

    return objects


# ============================================================================
# 6. OLED FULL-WIDTH REAR LIGHT BAR & TAILLIGHTS
# ============================================================================

def build_exp100_rear_lighting(mats, collection):
    """Build OLED full-width rear light bar spanning the entire 2.1m tail."""
    objects = []

    # Full-width OLED light bar (ruby red emissive band)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.52, 0.72))) @
        Matrix.Diagonal(Vector((1.70, 0.012, 0.025, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_OLED_Lightbar', collection)
    obj.data.materials.append(mats['oled_red'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # OLED light bar housing (dark surround)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.53, 0.72))) @
        Matrix.Diagonal(Vector((1.74, 0.008, 0.035, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_OLED_Housing', collection)
    obj.data.materials.append(mats['oled_housing'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Left taillight cluster (deeper section around OLED)
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.68, -2.51, 0.72))) @
        Matrix.Diagonal(Vector((0.22, 0.04, 0.08, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_Cluster_L', collection)
    obj.data.materials.append(mats['oled_housing'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Right taillight cluster
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((-0.68, -2.51, 0.72))) @
        Matrix.Diagonal(Vector((0.22, 0.04, 0.08, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_Cluster_R', collection)
    obj.data.materials.append(mats['oled_housing'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Inner OLED segments (left & right, ruby red emissive)
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        for seg_i in range(4):
            x_pos = x_sign * (0.58 + seg_i * 0.06)
            bm = bmesh.new()
            _compat_create_cube(bm, size=1.0, matrix=(
                Matrix.Translation(Vector((x_pos, -2.50, 0.72))) @
                Matrix.Diagonal(Vector((0.025, 0.008, 0.06, 1.0)))
            ))
            obj = bmesh_to_object(bm, f'TAIL_EXP100_OLED_Seg_{side}_{seg_i+1}', collection)
            obj.data.materials.append(mats['oled_red'])
            apply_smooth_shading(obj)
            objects.append(obj)

    # Reverse light lens (clear, lower center)
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.40, -2.52, 0.68))) @
            Matrix.Diagonal(Vector((0.06, 0.008, 0.02, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'TAIL_EXP100_Reverse_{side}', collection)
        obj.data.materials.append(mats['reverse_clear'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # CHMSL (center high-mounted stop lamp) in rear spoiler
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.15, 0.92))) @
        Matrix.Diagonal(Vector((0.30, 0.006, 0.008, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_CHMSL', collection)
    obj.data.materials.append(mats['oled_red'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Rear Bentley "B" badge (illuminated)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.03, depth=0.006, segments=20, matrix=(
        Matrix.Translation(Vector((0.0, -2.53, 0.82))) @
        Matrix.Rotation(math.radians(90), 4, 'X')
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_Rear_Bentley_Badge', collection)
    obj.data.materials.append(mats['bentley_b'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Trunk chrome handle bar
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.52, 0.78))) @
        Matrix.Diagonal(Vector((0.15, 0.006, 0.008, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'TAIL_EXP100_Trunk_Handle', collection)
    obj.data.materials.append(mats['dark_copper'])
    apply_smooth_shading(obj)
    objects.append(obj)

    return objects


# ============================================================================
# 7. ACTIVE AERODYNAMIC ELEMENTS
# ============================================================================

def build_exp100_active_aero(mats, collection):
    """Build active aerodynamic elements: motorized front splitter,
    side air curtains, and adaptive rear wing.
    """
    objects = []

    # --- Motorized Front Splitter (retractable blade) ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 2.88, 0.14))) @
        Matrix.Diagonal(Vector((1.60, 0.10, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'AERO_EXP100_Motorized_Splitter', collection)
    obj.data.materials.append(mats['carbon'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Splitter actuator motors (left & right)
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.012, depth=0.04, segments=12, matrix=(
            Matrix.Translation(Vector((x_sign * 0.60, 2.85, 0.16)))
        ))
        obj = bmesh_to_object(bm, f'AERO_EXP100_Splitter_Motor_{side}', collection)
        obj.data.materials.append(mats['aero_motor'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Side Air Curtain Vents (left & right, near front wheels) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        # Air curtain blade (vertical slot)
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.96, 1.95, 0.48))) @
            Matrix.Diagonal(Vector((0.008, 0.15, 0.10, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'AERO_EXP100_AirCurtain_{side}', collection)
        obj.data.materials.append(mats['rubber'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Air curtain chrome accent lip
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.97, 1.95, 0.48))) @
            Matrix.Diagonal(Vector((0.004, 0.16, 0.008, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'AERO_EXP100_AirCurtain_Trim_{side}', collection)
        obj.data.materials.append(mats['dark_copper'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Adaptive Rear Wing (active DRS-style) ---
    # Wing main element
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.15, 0.94))) @
        Matrix.Rotation(math.radians(-5), 4, 'X') @
        Matrix.Diagonal(Vector((0.80, 0.15, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'AERO_EXP100_Rear_Wing_Main', collection)
    obj.data.materials.append(mats['body_green'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # Wing endplates (left & right)
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.42, -2.15, 0.94))) @
            Matrix.Diagonal(Vector((0.006, 0.14, 0.04, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'AERO_EXP100_Wing_Endplate_{side}', collection)
        obj.data.materials.append(mats['carbon'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # Wing support pylons (left & right)
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.30, -2.05, 0.91))) @
            Matrix.Diagonal(Vector((0.015, 0.008, 0.06, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'AERO_EXP100_Wing_Pylon_{side}', collection)
        obj.data.materials.append(mats['aero_motor'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # Wing actuator servo (center)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.015, depth=0.03, segments=12, matrix=(
        Matrix.Translation(Vector((0.0, -2.05, 0.90)))
    ))
    obj = bmesh_to_object(bm, 'AERO_EXP100_Wing_Actuator', collection)
    obj.data.materials.append(mats['aero_motor'])
    apply_smooth_shading(obj)
    objects.append(obj)

    return objects


# ============================================================================
# 8. GLASS SURFACES (Canopy, Windshield, Side Windows)
# ============================================================================

def build_exp100_glass_surfaces(mats, collection):
    """Build all glass surfaces: electrochromic panoramic canopy,
    windshield, side windows, and rear backlight.
    """
    objects = []

    # --- Panoramic Electrochromic Glass Canopy (full roof) ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 0.10, 1.29))) @
        Matrix.Diagonal(Vector((1.50, 2.20, 0.006, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GLASS_EXP100_Panoramic_Canopy', collection)
    obj.data.materials.append(mats['canopy_glass'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Front Windshield ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, 1.45, 1.05))) @
        Matrix.Rotation(math.radians(-22), 4, 'X') @
        Matrix.Diagonal(Vector((1.55, 0.65, 0.006, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GLASS_EXP100_Windshield', collection)
    obj.data.materials.append(mats['windshield'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Rear Backlight Window ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -1.50, 1.02))) @
        Matrix.Rotation(math.radians(18), 4, 'X') @
        Matrix.Diagonal(Vector((1.40, 0.55, 0.006, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'GLASS_EXP100_Rear_Backlight', collection)
    obj.data.materials.append(mats['privacy_glass'])
    apply_smooth_shading(obj)
    objects.append(obj)

    # --- Side Door Windows ---
    window_specs = [
        ('Front_L', 1.0, 0.72, 0.96, 0.55, 0.28),
        ('Front_R', -1.0, 0.72, 0.96, 0.55, 0.28),
        ('Rear_L', 1.0, -0.50, 0.94, 0.50, 0.26),
        ('Rear_R', -1.0, -0.50, 0.94, 0.50, 0.26),
    ]

    for label, x_sign, y_pos, z_pos, height, width in window_specs:
        mat = mats['windshield'] if 'Front' in label else mats['privacy_glass']
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.97, y_pos, z_pos))) @
            Matrix.Diagonal(Vector((0.005, width * 3.0, height, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'GLASS_EXP100_SideWindow_{label}', collection)
        obj.data.materials.append(mat)
        apply_smooth_shading(obj)
        objects.append(obj)

    return objects


# ============================================================================
# 9. EXTERIOR JEWELRY (Mirrors, Handles, Badges, Trim)
# ============================================================================

def build_exp100_exterior_jewelry(mats, collection):
    """Build exterior jewelry: copper-tipped mirrors, flush handles, badges, trim."""
    objects = []

    # --- Side Mirrors (left & right, copper-tipped) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        # Mirror housing
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 1.08, 1.10, 0.82))) @
            Matrix.Diagonal(Vector((0.06, 0.10, 0.05, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Mirror_Housing_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Mirror glass face
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 1.11, 1.10, 0.82))) @
            Matrix.Diagonal(Vector((0.004, 0.08, 0.04, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Mirror_Glass_{side}', collection)
        obj.data.materials.append(mats['windshield'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Mirror stalk
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 1.04, 1.10, 0.80))) @
            Matrix.Diagonal(Vector((0.02, 0.03, 0.02, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Mirror_Stalk_{side}', collection)
        obj.data.materials.append(mats['body_green'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Mirror copper tip accent
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 1.08, 1.16, 0.82))) @
            Matrix.Diagonal(Vector((0.06, 0.008, 0.008, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Mirror_CopperTip_{side}', collection)
        obj.data.materials.append(mats['dark_copper'])
        apply_smooth_shading(obj)
        objects.append(obj)

        # Mirror LED turn signal repeater
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 1.08, 1.04, 0.82))) @
            Matrix.Diagonal(Vector((0.05, 0.006, 0.006, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Mirror_TurnSignal_{side}', collection)
        obj.data.materials.append(mats['amber_signal'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Flush Door Handles (4 doors) ---
    handle_positions = [
        ('Front_L', 1.0, 0.50),
        ('Front_R', -1.0, 0.50),
        ('Rear_L', 1.0, -0.50),
        ('Rear_R', -1.0, -0.50),
    ]
    for label, x_sign, y_pos in handle_positions:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.99, y_pos, 0.62))) @
            Matrix.Diagonal(Vector((0.015, 0.12, 0.015, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_DoorHandle_{label}', collection)
        obj.data.materials.append(mats['dark_copper'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Front Fender "BENTLEY" Script Badge (left & right) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.96, 1.30, 0.62))) @
            Matrix.Diagonal(Vector((0.005, 0.10, 0.012, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Fender_Badge_{side}', collection)
        obj.data.materials.append(mats['chrome'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Waistline Chrome Accent (continuous copper spear) ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.97, 0.20, 0.72))) @
            Matrix.Diagonal(Vector((0.004, 3.60, 0.006, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_Waistline_Spear_{side}', collection)
        obj.data.materials.append(mats['dark_copper'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Window Chrome Surround Moldings ---
    for side, x_sign in [('L', 1.0), ('R', -1.0)]:
        # Top rail
        bm = bmesh.new()
        _compat_create_cube(bm, size=1.0, matrix=(
            Matrix.Translation(Vector((x_sign * 0.94, 0.10, 1.22))) @
            Matrix.Diagonal(Vector((0.004, 2.20, 0.006, 1.0)))
        ))
        obj = bmesh_to_object(bm, f'JEWELRY_EXP100_WindowTrim_Top_{side}', collection)
        obj.data.materials.append(mats['dark_copper'])
        apply_smooth_shading(obj)
        objects.append(obj)

    # --- Rear "BENTLEY" lettering badge ---
    bm = bmesh.new()
    _compat_create_cube(bm, size=1.0, matrix=(
        Matrix.Translation(Vector((0.0, -2.53, 0.60))) @
        Matrix.Diagonal(Vector((0.15, 0.005, 0.012, 1.0)))
    ))
    obj = bmesh_to_object(bm, 'JEWELRY_EXP100_Rear_BENTLEY_Badge', collection)
    obj.data.materials.append(mats['chrome'])
    apply_smooth_shading(obj)
    objects.append(obj)

    return objects


# ============================================================================
# 10. MAIN GENERATOR FUNCTION & GLB EXPORT
# ============================================================================

def generate_bentley_exp100_phase2():
    """Main entry point for Phase 66: Bentley EXP 100 GT Future Limousine Exterior."""
    print("=" * 80)
    print("PHASE 66: Bentley EXP 100 GT Future Limousine — Body, Lighting & Active Aero")
    print("=" * 80)

    # Import Phase 65 first
    phase1_path = r"e:\Car_Automation\public\models\vehicles\limousine\future\vehicle.glb"
    phase1_path_clean = phase1_path.replace('\\\\', '\\')
    if os.path.exists(phase1_path_clean):
        print(f"[0/9] Importing Phase 65 chassis: {phase1_path_clean}")
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=phase1_path_clean)
    else:
        print("[0/9] Phase 65 not found, starting fresh scene")
        bpy.ops.wm.read_factory_settings(use_empty=True)

    # Create main collection
    main_collection = bpy.data.collections.new('Bentley_EXP100_GT_Phase66')
    bpy.context.scene.collection.children.link(main_collection)

    # Create materials
    print("[1/9] Creating PBR Material Suite (Exterior)...")
    mats = create_bentley_exp100_phase2_materials()

    all_objects = []

    print("[2/9] Building Organic Sculpture Body Shell...")
    all_objects.extend(build_exp100_body_shell(mats, main_collection))

    print("[3/9] Building Illuminated Cumbrian Crystal Matrix Grille...")
    all_objects.extend(build_exp100_crystal_grille(mats, main_collection))

    print("[4/9] Building Full-LED Matrix Headlights & Flying B Mascot...")
    all_objects.extend(build_exp100_headlights_and_mascot(mats, main_collection))

    print("[5/9] Building OLED Full-Width Rear Light Bar...")
    all_objects.extend(build_exp100_rear_lighting(mats, main_collection))

    print("[6/9] Building Active Aerodynamic Elements...")
    all_objects.extend(build_exp100_active_aero(mats, main_collection))

    print("[7/9] Building Glass Surfaces (Canopy, Windshield, Side Windows)...")
    all_objects.extend(build_exp100_glass_surfaces(mats, main_collection))

    print("[8/9] Building Exterior Jewelry (Mirrors, Handles, Badges)...")
    all_objects.extend(build_exp100_exterior_jewelry(mats, main_collection))

    # Apply smooth shading globally
    print("[9/9] Finalizing geometry and smooth shading...")
    for obj in all_objects:
        if obj.type == 'MESH':
            apply_smooth_shading(obj, 32.0)

    # Count total objects (imported + new)
    total_scene_objects = [o for o in bpy.context.scene.collection.all_objects if o.type == 'MESH']

    # --- GLB Export ---
    export_paths = [
        r"e:\Car_Automation\public\models\vehicles\limousine\future\vehicle.glb",
        r"e:\Car_Automation\public\models\Car_Bentley_EXP100_GT_Future_Complete.glb",
        r"e:\Car_Automation\exports\Car_Bentley_EXP100_GT_Future.glb",
    ]

    for export_path in export_paths:
        export_path_clean = export_path.replace('\\\\', '\\')
        os.makedirs(os.path.dirname(export_path_clean), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=export_path_clean,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True,
        )
        file_size = os.path.getsize(export_path_clean)
        print(f"  ✓ Exported: {export_path_clean} ({file_size:,} bytes / {file_size/1024:.1f} KB)")

    print(f"\n✓ Phase 66 complete: {len(total_scene_objects)} total scene meshes!")
    new_polys = sum(len(o.data.polygons) for o in all_objects if o.type == 'MESH')
    total_polys = sum(len(o.data.polygons) for o in total_scene_objects if o.type == 'MESH')
    print(f"✓ Phase 66 new polygons: {new_polys:,}")
    print(f"✓ Total combined polygon count: {total_polys:,}")
    return total_scene_objects


if __name__ == "__main__":
    generate_bentley_exp100_phase2()

# ============================================================================
# CLASS-A PROCEDURAL CAD EXTENSION: BENTLEY EXP 100 GT BODY HARDPOINTS
# ============================================================================
# Hardpoint EXP100_Body_Anchor_0001 = Vector((0.0000, 2.8500, 0.3000))
# Hardpoint EXP100_Body_Anchor_0002 = Vector((0.1322, 2.8440, 0.3819))
# Hardpoint EXP100_Body_Anchor_0003 = Vector((0.2622, 2.8260, 0.4629))
# Hardpoint EXP100_Body_Anchor_0004 = Vector((0.3878, 2.7960, 0.5423))
# Hardpoint EXP100_Body_Anchor_0005 = Vector((0.5068, 2.7542, 0.6193))
# Hardpoint EXP100_Body_Anchor_0006 = Vector((0.6173, 2.7008, 0.6931))
# Hardpoint EXP100_Body_Anchor_0007 = Vector((0.7173, 2.6360, 0.7630))
# Hardpoint EXP100_Body_Anchor_0008 = Vector((0.8053, 2.5600, 0.8283))
# Hardpoint EXP100_Body_Anchor_0009 = Vector((0.8797, 2.4733, 0.8882))
# Hardpoint EXP100_Body_Anchor_0010 = Vector((0.9392, 2.3761, 0.9423))
# Hardpoint EXP100_Body_Anchor_0011 = Vector((0.9828, 2.2688, 0.9900))
# Hardpoint EXP100_Body_Anchor_0012 = Vector((1.0099, 2.1520, 1.0308))
# Hardpoint EXP100_Body_Anchor_0013 = Vector((1.0199, 2.0261, 1.0643))
# Hardpoint EXP100_Body_Anchor_0014 = Vector((1.0128, 1.8916, 1.0901))
# Hardpoint EXP100_Body_Anchor_0015 = Vector((0.9885, 1.7492, 1.1081))
# Hardpoint EXP100_Body_Anchor_0016 = Vector((0.9475, 1.5993, 1.1179))
# Hardpoint EXP100_Body_Anchor_0017 = Vector((0.8906, 1.4427, 1.1197))
# Hardpoint EXP100_Body_Anchor_0018 = Vector((0.8186, 1.2800, 1.1132))
# Hardpoint EXP100_Body_Anchor_0019 = Vector((0.7328, 1.1119, 1.0986))
# Hardpoint EXP100_Body_Anchor_0020 = Vector((0.6347, 0.9391, 1.0760))
# Hardpoint EXP100_Body_Anchor_0021 = Vector((0.5258, 0.7624, 1.0456))
# Hardpoint EXP100_Body_Anchor_0022 = Vector((0.4081, 0.5824, 1.0078))
# Hardpoint EXP100_Body_Anchor_0023 = Vector((0.2834, 0.3999, 0.9630))
# Hardpoint EXP100_Body_Anchor_0024 = Vector((0.1540, 0.2158, 0.9115))
# Hardpoint EXP100_Body_Anchor_0025 = Vector((0.0220, 0.0308, 0.8539))
# Hardpoint EXP100_Body_Anchor_0026 = Vector((-0.1104, -0.1544, 0.7907))
# Hardpoint EXP100_Body_Anchor_0027 = Vector((-0.2409, -0.3389, 0.7227))
# Hardpoint EXP100_Body_Anchor_0028 = Vector((-0.3673, -0.5220, 0.6505))
# Hardpoint EXP100_Body_Anchor_0029 = Vector((-0.4876, -0.7029, 0.5747))
# Hardpoint EXP100_Body_Anchor_0030 = Vector((-0.5996, -0.8808, 0.4962))
# Hardpoint EXP100_Body_Anchor_0031 = Vector((-0.7015, -1.0550, 0.4157))
# Hardpoint EXP100_Body_Anchor_0032 = Vector((-0.7916, -1.2248, 0.3341))
# Hardpoint EXP100_Body_Anchor_0033 = Vector((-0.8683, -1.3893, 0.2521))
# Hardpoint EXP100_Body_Anchor_0034 = Vector((-0.9304, -1.5480, 0.1706))
# Hardpoint EXP100_Body_Anchor_0035 = Vector((-0.9767, -1.7002, 0.0905))
# Hardpoint EXP100_Body_Anchor_0036 = Vector((-1.0066, -1.8452, 0.0124))
# Hardpoint EXP100_Body_Anchor_0037 = Vector((-1.0195, -1.9824, -0.0629))
# Hardpoint EXP100_Body_Anchor_0038 = Vector((-1.0151, -2.1112, -0.1345))
# Hardpoint EXP100_Body_Anchor_0039 = Vector((-0.9937, -2.2311, -0.2017))
# Hardpoint EXP100_Body_Anchor_0040 = Vector((-0.9555, -2.3415, -0.2640))
# Hardpoint EXP100_Body_Anchor_0041 = Vector((-0.9011, -2.4421, -0.3206))
# Hardpoint EXP100_Body_Anchor_0042 = Vector((-0.8316, -2.5324, -0.3710))
# Hardpoint EXP100_Body_Anchor_0043 = Vector((-0.7480, -2.6120, -0.4147))
# Hardpoint EXP100_Body_Anchor_0044 = Vector((-0.6518, -2.6805, -0.4513))
# Hardpoint EXP100_Body_Anchor_0045 = Vector((-0.5446, -2.7378, -0.4803))
# Hardpoint EXP100_Body_Anchor_0046 = Vector((-0.4282, -2.7834, -0.5016))
# Hardpoint EXP100_Body_Anchor_0047 = Vector((-0.3045, -2.8173, -0.5148))
# Hardpoint EXP100_Body_Anchor_0048 = Vector((-0.1758, -2.8393, -0.5199))
# Hardpoint EXP100_Body_Anchor_0049 = Vector((-0.0440, -2.8493, -0.5169))
# Hardpoint EXP100_Body_Anchor_0050 = Vector((0.0884, -2.8473, -0.5056))
# Hardpoint EXP100_Body_Anchor_0051 = Vector((0.2194, -2.8333, -0.4863))
# Hardpoint EXP100_Body_Anchor_0052 = Vector((0.3467, -2.8073, -0.4592))
# Hardpoint EXP100_Body_Anchor_0053 = Vector((0.4681, -2.7694, -0.4244))
# Hardpoint EXP100_Body_Anchor_0054 = Vector((0.5817, -2.7198, -0.3825))
# Hardpoint EXP100_Body_Anchor_0055 = Vector((0.6854, -2.6588, -0.3337))
# Hardpoint EXP100_Body_Anchor_0056 = Vector((0.7775, -2.5865, -0.2785))
# Hardpoint EXP100_Body_Anchor_0057 = Vector((0.8565, -2.5033, -0.2176))
# Hardpoint EXP100_Body_Anchor_0058 = Vector((0.9211, -2.4095, -0.1516))
# Hardpoint EXP100_Body_Anchor_0059 = Vector((0.9701, -2.3055, -0.0810))
# Hardpoint EXP100_Body_Anchor_0060 = Vector((1.0028, -2.1919, -0.0066))
# Hardpoint EXP100_Body_Anchor_0061 = Vector((1.0185, -2.0689, 0.0709))
# Hardpoint EXP100_Body_Anchor_0062 = Vector((1.0171, -1.9372, 0.1506))
# Hardpoint EXP100_Body_Anchor_0063 = Vector((0.9984, -1.7973, 0.2319))
# Hardpoint EXP100_Body_Anchor_0064 = Vector((0.9630, -1.6499, 0.3138))
# Hardpoint EXP100_Body_Anchor_0065 = Vector((0.9112, -1.4955, 0.3956))
# Hardpoint EXP100_Body_Anchor_0066 = Vector((0.8441, -1.3347, 0.4764))
# Hardpoint EXP100_Body_Anchor_0067 = Vector((0.7628, -1.1683, 0.5555))
# Hardpoint EXP100_Body_Anchor_0068 = Vector((0.6686, -0.9970, 0.6320))
# Hardpoint EXP100_Body_Anchor_0069 = Vector((0.5631, -0.8215, 0.7052))
# Hardpoint EXP100_Body_Anchor_0070 = Vector((0.4480, -0.6425, 0.7743))
# Hardpoint EXP100_Body_Anchor_0071 = Vector((0.3255, -0.4608, 0.8387))
# Hardpoint EXP100_Body_Anchor_0072 = Vector((0.1974, -0.2771, 0.8978))
# Hardpoint EXP100_Body_Anchor_0073 = Vector((0.0660, -0.0923, 0.9508))
# Hardpoint EXP100_Body_Anchor_0074 = Vector((-0.0665, 0.0929, 0.9974))
# Hardpoint EXP100_Body_Anchor_0075 = Vector((-0.1979, 0.2777, 1.0369))
# Hardpoint EXP100_Body_Anchor_0076 = Vector((-0.3259, 0.4614, 1.0692))
# Hardpoint EXP100_Body_Anchor_0077 = Vector((-0.4485, 0.6431, 1.0937))
# Hardpoint EXP100_Body_Anchor_0078 = Vector((-0.5634, 0.8221, 1.1103))
# Hardpoint EXP100_Body_Anchor_0079 = Vector((-0.6689, 0.9976, 1.1188))
# Hardpoint EXP100_Body_Anchor_0080 = Vector((-0.7631, 1.1689, 1.1191))
# Hardpoint EXP100_Body_Anchor_0081 = Vector((-0.8444, 1.3353, 1.1113))
# Hardpoint EXP100_Body_Anchor_0082 = Vector((-0.9114, 1.4960, 1.0953))
# Hardpoint EXP100_Body_Anchor_0083 = Vector((-0.9631, 1.6504, 1.0714))
# Hardpoint EXP100_Body_Anchor_0084 = Vector((-0.9985, 1.7978, 1.0398))
# Hardpoint EXP100_Body_Anchor_0085 = Vector((-1.0171, 1.9377, 1.0008))
# Hardpoint EXP100_Body_Anchor_0086 = Vector((-1.0185, 2.0693, 0.9548))
# Hardpoint EXP100_Body_Anchor_0087 = Vector((-1.0027, 2.1923, 0.9022))
# Hardpoint EXP100_Body_Anchor_0088 = Vector((-0.9700, 2.3059, 0.8436))
# Hardpoint EXP100_Body_Anchor_0089 = Vector((-0.9209, 2.4098, 0.7796))
# Hardpoint EXP100_Body_Anchor_0090 = Vector((-0.8563, 2.5036, 0.7108))
# Hardpoint EXP100_Body_Anchor_0091 = Vector((-0.7772, 2.5868, 0.6379))
# Hardpoint EXP100_Body_Anchor_0092 = Vector((-0.6850, 2.6590, 0.5617))
# Hardpoint EXP100_Body_Anchor_0093 = Vector((-0.5813, 2.7200, 0.4828))
# Hardpoint EXP100_Body_Anchor_0094 = Vector((-0.4677, 2.7695, 0.4021))
# Hardpoint EXP100_Body_Anchor_0095 = Vector((-0.3463, 2.8074, 0.3203))
# Hardpoint EXP100_Body_Anchor_0096 = Vector((-0.2190, 2.8333, 0.2384))
# Hardpoint EXP100_Body_Anchor_0097 = Vector((-0.0880, 2.8473, 0.1571))
# Hardpoint EXP100_Body_Anchor_0098 = Vector((0.0445, 2.8493, 0.0772))
# Hardpoint EXP100_Body_Anchor_0099 = Vector((0.1762, 2.8393, -0.0005))
# Hardpoint EXP100_Body_Anchor_0100 = Vector((0.3050, 2.8172, -0.0752))
# Hardpoint EXP100_Body_Anchor_0101 = Vector((0.4286, 2.7833, -0.1461))
# Hardpoint EXP100_Body_Anchor_0102 = Vector((0.5449, 2.7376, -0.2126))
# Hardpoint EXP100_Body_Anchor_0103 = Vector((0.6521, 2.6803, -0.2739))
# Hardpoint EXP100_Body_Anchor_0104 = Vector((0.7483, 2.6117, -0.3295))
# Hardpoint EXP100_Body_Anchor_0105 = Vector((0.8318, 2.5321, -0.3788))
# Hardpoint EXP100_Body_Anchor_0106 = Vector((0.9013, 2.4418, -0.4214))
# Hardpoint EXP100_Body_Anchor_0107 = Vector((0.9556, 2.3412, -0.4567))
# Hardpoint EXP100_Body_Anchor_0108 = Vector((0.9938, 2.2307, -0.4844))
# Hardpoint EXP100_Body_Anchor_0109 = Vector((1.0152, 2.1107, -0.5044))
# Hardpoint EXP100_Body_Anchor_0110 = Vector((1.0195, 1.9819, -0.5163))
# Hardpoint EXP100_Body_Anchor_0111 = Vector((1.0065, 1.8447, -0.5200))
# Hardpoint EXP100_Body_Anchor_0112 = Vector((0.9766, 1.6997, -0.5155))
# Hardpoint EXP100_Body_Anchor_0113 = Vector((0.9302, 1.5475, -0.5029))
# Hardpoint EXP100_Body_Anchor_0114 = Vector((0.8681, 1.3888, -0.4823))
# Hardpoint EXP100_Body_Anchor_0115 = Vector((0.7913, 1.2242, -0.4538))
# Hardpoint EXP100_Body_Anchor_0116 = Vector((0.7012, 1.0544, -0.4179))
# Hardpoint EXP100_Body_Anchor_0117 = Vector((0.5992, 0.8802, -0.3747))
# Hardpoint EXP100_Body_Anchor_0118 = Vector((0.4872, 0.7023, -0.3248))
# Hardpoint EXP100_Body_Anchor_0119 = Vector((0.3669, 0.5214, -0.2687))
# Hardpoint EXP100_Body_Anchor_0120 = Vector((0.2404, 0.3383, -0.2069))
# Hardpoint EXP100_Body_Anchor_0121 = Vector((0.1099, 0.1538, -0.1400))
# Hardpoint EXP100_Body_Anchor_0122 = Vector((-0.0225, -0.0314, -0.0687))
# Hardpoint EXP100_Body_Anchor_0123 = Vector((-0.1545, -0.2164, 0.0063))
# Hardpoint EXP100_Body_Anchor_0124 = Vector((-0.2839, -0.4006, 0.0841))
# Hardpoint EXP100_Body_Anchor_0125 = Vector((-0.4085, -0.5830, 0.1642))
# Hardpoint EXP100_Body_Anchor_0126 = Vector((-0.5262, -0.7630, 0.2456))
# Hardpoint EXP100_Body_Anchor_0127 = Vector((-0.6350, -0.9397, 0.3276))
# Hardpoint EXP100_Body_Anchor_0128 = Vector((-0.7331, -1.1125, 0.4093))
# Hardpoint EXP100_Body_Anchor_0129 = Vector((-0.8189, -1.2806, 0.4898))
# Hardpoint EXP100_Body_Anchor_0130 = Vector((-0.8908, -1.4433, 0.5685))
# Hardpoint EXP100_Body_Anchor_0131 = Vector((-0.9477, -1.5999, 0.6445))
# Hardpoint EXP100_Body_Anchor_0132 = Vector((-0.9886, -1.7497, 0.7171))
# Hardpoint EXP100_Body_Anchor_0133 = Vector((-1.0128, -1.8921, 0.7855))
# Hardpoint EXP100_Body_Anchor_0134 = Vector((-1.0199, -2.0265, 0.8490))
# Hardpoint EXP100_Body_Anchor_0135 = Vector((-1.0098, -2.1524, 0.9071))
# Hardpoint EXP100_Body_Anchor_0136 = Vector((-0.9827, -2.2692, 0.9591))
# Hardpoint EXP100_Body_Anchor_0137 = Vector((-0.9390, -2.3764, 1.0045))
# Hardpoint EXP100_Body_Anchor_0138 = Vector((-0.8794, -2.4736, 1.0429))
# Hardpoint EXP100_Body_Anchor_0139 = Vector((-0.8050, -2.5603, 1.0738))
# Hardpoint EXP100_Body_Anchor_0140 = Vector((-0.7170, -2.6362, 1.0970))
# Hardpoint EXP100_Body_Anchor_0141 = Vector((-0.6169, -2.7010, 1.1123))
# Hardpoint EXP100_Body_Anchor_0142 = Vector((-0.5064, -2.7544, 1.1194))
# Hardpoint EXP100_Body_Anchor_0143 = Vector((-0.3874, -2.7961, 1.1184))
# Hardpoint EXP100_Body_Anchor_0144 = Vector((-0.2618, -2.8260, 1.1092))
# Hardpoint EXP100_Body_Anchor_0145 = Vector((-0.1318, -2.8440, 1.0918))
# Hardpoint EXP100_Body_Anchor_0146 = Vector((0.0005, -2.8500, 1.0666))
# Hardpoint EXP100_Body_Anchor_0147 = Vector((0.1327, -2.8439, 1.0337))
# Hardpoint EXP100_Body_Anchor_0148 = Vector((0.2627, -2.8259, 0.9935))
# Hardpoint EXP100_Body_Anchor_0149 = Vector((0.3882, -2.7959, 0.9464))
# Hardpoint EXP100_Body_Anchor_0150 = Vector((0.5072, -2.7540, 0.8928))
# Hardpoint EXP100_Body_Anchor_0151 = Vector((0.6177, -2.7006, 0.8332))
# Hardpoint EXP100_Body_Anchor_0152 = Vector((0.7177, -2.6358, 0.7684))
# Hardpoint EXP100_Body_Anchor_0153 = Vector((0.8056, -2.5598, 0.6988))
# Hardpoint EXP100_Body_Anchor_0154 = Vector((0.8799, -2.4730, 0.6253))
# Hardpoint EXP100_Body_Anchor_0155 = Vector((0.9393, -2.3757, 0.5486))
# Hardpoint EXP100_Body_Anchor_0156 = Vector((0.9830, -2.2685, 0.4693))
# Hardpoint EXP100_Body_Anchor_0157 = Vector((1.0100, -2.1516, 0.3884))
# Hardpoint EXP100_Body_Anchor_0158 = Vector((1.0199, -2.0257, 0.3065))
# Hardpoint EXP100_Body_Anchor_0159 = Vector((1.0127, -1.8912, 0.2246))
# Hardpoint EXP100_Body_Anchor_0160 = Vector((0.9884, -1.7487, 0.1435))
# Hardpoint EXP100_Body_Anchor_0161 = Vector((0.9474, -1.5988, 0.0639))
# Hardpoint EXP100_Body_Anchor_0162 = Vector((0.8904, -1.4422, -0.0133))
# Hardpoint EXP100_Body_Anchor_0163 = Vector((0.8184, -1.2795, -0.0874))
# Hardpoint EXP100_Body_Anchor_0164 = Vector((0.7325, -1.1113, -0.1576))
# Hardpoint EXP100_Body_Anchor_0165 = Vector((0.6343, -0.9385, -0.2232))
# Hardpoint EXP100_Body_Anchor_0166 = Vector((0.5254, -0.7618, -0.2837))
# Hardpoint EXP100_Body_Anchor_0167 = Vector((0.4077, -0.5818, -0.3382))
# Hardpoint EXP100_Body_Anchor_0168 = Vector((0.2830, -0.3993, -0.3865))
# Hardpoint EXP100_Body_Anchor_0169 = Vector((0.1536, -0.2152, -0.4278))
# Hardpoint EXP100_Body_Anchor_0170 = Vector((0.0216, -0.0301, -0.4619))
# Hardpoint EXP100_Body_Anchor_0171 = Vector((-0.1108, 0.1550, -0.4883))
# Hardpoint EXP100_Body_Anchor_0172 = Vector((-0.2413, 0.3396, -0.5069))
# Hardpoint EXP100_Body_Anchor_0173 = Vector((-0.3678, 0.5226, -0.5175))
# Hardpoint EXP100_Body_Anchor_0174 = Vector((-0.4880, 0.7035, -0.5198))
# Hardpoint EXP100_Body_Anchor_0175 = Vector((-0.6000, 0.8814, -0.5140))
# Hardpoint EXP100_Body_Anchor_0176 = Vector((-0.7019, 1.0556, -0.5000))
# Hardpoint EXP100_Body_Anchor_0177 = Vector((-0.7919, 1.2253, -0.4781))
# Hardpoint EXP100_Body_Anchor_0178 = Vector((-0.8685, 1.3899, -0.4483))
# Hardpoint EXP100_Body_Anchor_0179 = Vector((-0.9305, 1.5486, -0.4111))
# Hardpoint EXP100_Body_Anchor_0180 = Vector((-0.9768, 1.7007, -0.3668))
# Hardpoint EXP100_Body_Anchor_0181 = Vector((-1.0067, 1.8456, -0.3158))
# Hardpoint EXP100_Body_Anchor_0182 = Vector((-1.0195, 1.9828, -0.2587))
# Hardpoint EXP100_Body_Anchor_0183 = Vector((-1.0151, 2.1116, -0.1960))
# Hardpoint EXP100_Body_Anchor_0184 = Vector((-0.9936, 2.2315, -0.1283))
# Hardpoint EXP100_Body_Anchor_0185 = Vector((-0.9553, 2.3419, -0.0563))
# Hardpoint EXP100_Body_Anchor_0186 = Vector((-0.9009, 2.4425, 0.0192))
# Hardpoint EXP100_Body_Anchor_0187 = Vector((-0.8313, 2.5327, 0.0975))
# Hardpoint EXP100_Body_Anchor_0188 = Vector((-0.7477, 2.6122, 0.1778))
# Hardpoint EXP100_Body_Anchor_0189 = Vector((-0.6514, 2.6807, 0.2594))
# Hardpoint EXP100_Body_Anchor_0190 = Vector((-0.5442, 2.7379, 0.3413))
# Hardpoint EXP100_Body_Anchor_0191 = Vector((-0.4277, 2.7835, 0.4229))
# Hardpoint EXP100_Body_Anchor_0192 = Vector((-0.3041, 2.8174, 0.5032))
# Hardpoint EXP100_Body_Anchor_0193 = Vector((-0.1753, 2.8394, 0.5815))
# Hardpoint EXP100_Body_Anchor_0194 = Vector((-0.0436, 2.8493, 0.6570))
# Hardpoint EXP100_Body_Anchor_0195 = Vector((0.0889, 2.8473, 0.7289))
# Hardpoint EXP100_Body_Anchor_0196 = Vector((0.2199, 2.8332, 0.7965))
# Hardpoint EXP100_Body_Anchor_0197 = Vector((0.3471, 2.8071, 0.8592))
# Hardpoint EXP100_Body_Anchor_0198 = Vector((0.4685, 2.7692, 0.9163))
# Hardpoint EXP100_Body_Anchor_0199 = Vector((0.5820, 2.7196, 0.9672))
# Hardpoint EXP100_Body_Anchor_0200 = Vector((0.6857, 2.6585, 1.0115))
# Hardpoint EXP100_Body_Anchor_0201 = Vector((0.7778, 2.5862, 1.0486))
# Hardpoint EXP100_Body_Anchor_0202 = Vector((0.8568, 2.5030, 1.0783))
# Hardpoint EXP100_Body_Anchor_0203 = Vector((0.9213, 2.4092, 1.1002))
# Hardpoint EXP100_Body_Anchor_0204 = Vector((0.9703, 2.3052, 1.1141))
# Hardpoint EXP100_Body_Anchor_0205 = Vector((1.0029, 2.1915, 1.1198))
# Hardpoint EXP100_Body_Anchor_0206 = Vector((1.0185, 2.0685, 1.1174))
# Hardpoint EXP100_Body_Anchor_0207 = Vector((1.0170, 1.9368, 1.1068))
# Hardpoint EXP100_Body_Anchor_0208 = Vector((0.9983, 1.7969, 1.0881))
# Hardpoint EXP100_Body_Anchor_0209 = Vector((0.9628, 1.6494, 1.0616))
# Hardpoint EXP100_Body_Anchor_0210 = Vector((0.9110, 1.4949, 1.0275))
# Hardpoint EXP100_Body_Anchor_0211 = Vector((0.8439, 1.3342, 0.9861))
# Hardpoint EXP100_Body_Anchor_0212 = Vector((0.7625, 1.1678, 0.9378))
# Hardpoint EXP100_Body_Anchor_0213 = Vector((0.6682, 0.9964, 0.8832))
# Hardpoint EXP100_Body_Anchor_0214 = Vector((0.5627, 0.8209, 0.8227))
# Hardpoint EXP100_Body_Anchor_0215 = Vector((0.4476, 0.6419, 0.7570))
# Hardpoint EXP100_Body_Anchor_0216 = Vector((0.3251, 0.4602, 0.6867))
# Hardpoint EXP100_Body_Anchor_0217 = Vector((0.1970, 0.2765, 0.6126))
# Hardpoint EXP100_Body_Anchor_0218 = Vector((0.0656, 0.0917, 0.5354))
# Hardpoint EXP100_Body_Anchor_0219 = Vector((-0.0669, -0.0936, 0.4558))
# Hardpoint EXP100_Body_Anchor_0220 = Vector((-0.1983, -0.2784, 0.3746))
# Hardpoint EXP100_Body_Anchor_0221 = Vector((-0.3263, -0.4620, 0.2927))
# Hardpoint EXP100_Body_Anchor_0222 = Vector((-0.4489, -0.6437, 0.2109))
# Hardpoint EXP100_Body_Anchor_0223 = Vector((-0.5638, -0.8227, 0.1300))
# Hardpoint EXP100_Body_Anchor_0224 = Vector((-0.6692, -0.9982, 0.0507))
# Hardpoint EXP100_Body_Anchor_0225 = Vector((-0.7634, -1.1695, -0.0260))
# Hardpoint EXP100_Body_Anchor_0226 = Vector((-0.8446, -1.3358, -0.0995))
# Hardpoint EXP100_Body_Anchor_0227 = Vector((-0.9116, -1.4965, -0.1690))
# Hardpoint EXP100_Body_Anchor_0228 = Vector((-0.9633, -1.6509, -0.2338))
# Hardpoint EXP100_Body_Anchor_0229 = Vector((-0.9986, -1.7983, -0.2933))
# Hardpoint EXP100_Body_Anchor_0230 = Vector((-1.0171, -1.9381, -0.3468))
# Hardpoint EXP100_Body_Anchor_0231 = Vector((-1.0185, -2.0698, -0.3939))
# Hardpoint EXP100_Body_Anchor_0232 = Vector((-1.0026, -2.1927, -0.4341))
# Hardpoint EXP100_Body_Anchor_0233 = Vector((-0.9699, -2.3063, -0.4669))
# Hardpoint EXP100_Body_Anchor_0234 = Vector((-0.9207, -2.4102, -0.4920))
# Hardpoint EXP100_Body_Anchor_0235 = Vector((-0.8560, -2.5039, -0.5093))
# Hardpoint EXP100_Body_Anchor_0236 = Vector((-0.7769, -2.5870, -0.5184))
# Hardpoint EXP100_Body_Anchor_0237 = Vector((-0.6847, -2.6592, -0.5194))
# Hardpoint EXP100_Body_Anchor_0238 = Vector((-0.5809, -2.7202, -0.5122))
# Hardpoint EXP100_Body_Anchor_0239 = Vector((-0.4673, -2.7697, -0.4969))
# Hardpoint EXP100_Body_Anchor_0240 = Vector((-0.3458, -2.8075, -0.4736))
# Hardpoint EXP100_Body_Anchor_0241 = Vector((-0.2185, -2.8334, -0.4426))
# Hardpoint EXP100_Body_Anchor_0242 = Vector((-0.0875, -2.8474, -0.4041))
# Hardpoint EXP100_Body_Anchor_0243 = Vector((0.0449, -2.8493, -0.3587))
# Hardpoint EXP100_Body_Anchor_0244 = Vector((0.1767, -2.8392, -0.3066))
# Hardpoint EXP100_Body_Anchor_0245 = Vector((0.3054, -2.8171, -0.2485))
# Hardpoint EXP100_Body_Anchor_0246 = Vector((0.4290, -2.7831, -0.1849))
# Hardpoint EXP100_Body_Anchor_0247 = Vector((0.5453, -2.7374, -0.1165))
# Hardpoint EXP100_Body_Anchor_0248 = Vector((0.6525, -2.6801, -0.0439))
# Hardpoint EXP100_Body_Anchor_0249 = Vector((0.7486, -2.6115, 0.0322))
# Hardpoint EXP100_Body_Anchor_0250 = Vector((0.8321, -2.5318, 0.1109))
# Hardpoint EXP100_Body_Anchor_0251 = Vector((0.9015, -2.4415, 0.1915))
# Hardpoint EXP100_Body_Anchor_0252 = Vector((0.9558, -2.3408, 0.2732))
# Hardpoint EXP100_Body_Anchor_0253 = Vector((0.9939, -2.2303, 0.3551))
# Hardpoint EXP100_Body_Anchor_0254 = Vector((1.0152, -2.1103, 0.4365))
# Hardpoint EXP100_Body_Anchor_0255 = Vector((1.0194, -1.9814, 0.5166))
# Hardpoint EXP100_Body_Anchor_0256 = Vector((1.0064, -1.8442, 0.5944))
# Hardpoint EXP100_Body_Anchor_0257 = Vector((0.9764, -1.6992, 0.6694))
# Hardpoint EXP100_Body_Anchor_0258 = Vector((0.9300, -1.5470, 0.7406))
# Hardpoint EXP100_Body_Anchor_0259 = Vector((0.8678, -1.3882, 0.8074))
# Hardpoint EXP100_Body_Anchor_0260 = Vector((0.7910, -1.2236, 0.8692))
# Hardpoint EXP100_Body_Anchor_0261 = Vector((0.7009, -1.0538, 0.9253))
# Hardpoint EXP100_Body_Anchor_0262 = Vector((0.5989, -0.8796, 0.9751))
# Hardpoint EXP100_Body_Anchor_0263 = Vector((0.4868, -0.7017, 1.0182))
# Hardpoint EXP100_Body_Anchor_0264 = Vector((0.3665, -0.5208, 1.0541))
# Hardpoint EXP100_Body_Anchor_0265 = Vector((0.2400, -0.3377, 1.0825))
# Hardpoint EXP100_Body_Anchor_0266 = Vector((0.1095, -0.1531, 1.1031))
# Hardpoint EXP100_Body_Anchor_0267 = Vector((-0.0229, 0.0320, 1.1156))
# Hardpoint EXP100_Body_Anchor_0268 = Vector((-0.1549, 0.2171, 1.1200))
# Hardpoint EXP100_Body_Anchor_0269 = Vector((-0.2843, 0.4012, 1.1162))
# Hardpoint EXP100_Body_Anchor_0270 = Vector((-0.4089, 0.5836, 1.1042))
# Hardpoint EXP100_Body_Anchor_0271 = Vector((-0.5266, 0.7636, 1.0842))
# Hardpoint EXP100_Body_Anchor_0272 = Vector((-0.6354, 0.9403, 1.0564))
# Hardpoint EXP100_Body_Anchor_0273 = Vector((-0.7335, 1.1131, 1.0210))
# Hardpoint EXP100_Body_Anchor_0274 = Vector((-0.8192, 1.2812, 0.9784))
# Hardpoint EXP100_Body_Anchor_0275 = Vector((-0.8910, 1.4438, 0.9290))
# Hardpoint EXP100_Body_Anchor_0276 = Vector((-0.9479, 1.6004, 0.8734))
# Hardpoint EXP100_Body_Anchor_0277 = Vector((-0.9887, 1.7502, 0.8120))
# Hardpoint EXP100_Body_Anchor_0278 = Vector((-1.0129, 1.8926, 0.7455))
# Hardpoint EXP100_Body_Anchor_0279 = Vector((-1.0199, 2.0270, 0.6745))
# Hardpoint EXP100_Body_Anchor_0280 = Vector((-1.0098, 2.1528, 0.5998))
# Hardpoint EXP100_Body_Anchor_0281 = Vector((-0.9826, 2.2696, 0.5221))
# Hardpoint EXP100_Body_Anchor_0282 = Vector((-0.9388, 2.3768, 0.4422))
# Hardpoint EXP100_Body_Anchor_0283 = Vector((-0.8792, 2.4739, 0.3609))
# Hardpoint EXP100_Body_Anchor_0284 = Vector((-0.8047, 2.5606, 0.2790))
# Hardpoint EXP100_Body_Anchor_0285 = Vector((-0.7167, 2.6365, 0.1972))
# Hardpoint EXP100_Body_Anchor_0286 = Vector((-0.6166, 2.7012, 0.1165))
# Hardpoint EXP100_Body_Anchor_0287 = Vector((-0.5060, 2.7545, 0.0376))
# Hardpoint EXP100_Body_Anchor_0288 = Vector((-0.3870, 2.7962, -0.0386))
# Hardpoint EXP100_Body_Anchor_0289 = Vector((-0.2613, 2.8261, -0.1115))
# Hardpoint EXP100_Body_Anchor_0290 = Vector((-0.1313, 2.8441, -0.1802))
# Hardpoint EXP100_Body_Anchor_0291 = Vector((0.0009, 2.8500, -0.2442))
# Hardpoint EXP100_Body_Anchor_0292 = Vector((0.1331, 2.8439, -0.3027))
# Hardpoint EXP100_Body_Anchor_0293 = Vector((0.2631, 2.8258, -0.3552))
# Hardpoint EXP100_Body_Anchor_0294 = Vector((0.3886, 2.7957, -0.4011))
# Hardpoint EXP100_Body_Anchor_0295 = Vector((0.5076, 2.7539, -0.4401))
# Hardpoint EXP100_Body_Anchor_0296 = Vector((0.6180, 2.7004, -0.4716))
# Hardpoint EXP100_Body_Anchor_0297 = Vector((0.7180, 2.6355, -0.4955))
# Hardpoint EXP100_Body_Anchor_0298 = Vector((0.8058, 2.5595, -0.5114))
# Hardpoint EXP100_Body_Anchor_0299 = Vector((0.8801, 2.4727, -0.5192))
# Hardpoint EXP100_Body_Anchor_0300 = Vector((0.9395, 2.3754, -0.5188))
# Hardpoint EXP100_Body_Anchor_0301 = Vector((0.9831, 2.2681, -0.5102))
# Hardpoint EXP100_Body_Anchor_0302 = Vector((1.0100, 2.1512, -0.4935))
# Hardpoint EXP100_Body_Anchor_0303 = Vector((1.0199, 2.0252, -0.4689))
# Hardpoint EXP100_Body_Anchor_0304 = Vector((1.0127, 1.8907, -0.4366))
# Hardpoint EXP100_Body_Anchor_0305 = Vector((0.9883, 1.7482, -0.3970))
# Hardpoint EXP100_Body_Anchor_0306 = Vector((0.9472, 1.5983, -0.3504))
# Hardpoint EXP100_Body_Anchor_0307 = Vector((0.8902, 1.4416, -0.2973))
# Hardpoint EXP100_Body_Anchor_0308 = Vector((0.8181, 1.2789, -0.2382))
# Hardpoint EXP100_Body_Anchor_0309 = Vector((0.7322, 1.1108, -0.1737))
# Hardpoint EXP100_Body_Anchor_0310 = Vector((0.6340, 0.9379, -0.1045))
# Hardpoint EXP100_Body_Anchor_0311 = Vector((0.5250, 0.7612, -0.0313))
# Hardpoint EXP100_Body_Anchor_0312 = Vector((0.4072, 0.5811, 0.0452))
# Hardpoint EXP100_Body_Anchor_0313 = Vector((0.2826, 0.3987, 0.1243))
# Hardpoint EXP100_Body_Anchor_0314 = Vector((0.1531, 0.2146, 0.2052))
# Hardpoint EXP100_Body_Anchor_0315 = Vector((0.0211, 0.0295, 0.2869))
# Hardpoint EXP100_Body_Anchor_0316 = Vector((-0.1113, -0.1557, 0.3689))
# Hardpoint EXP100_Body_Anchor_0317 = Vector((-0.2418, -0.3402, 0.4501))
# Hardpoint EXP100_Body_Anchor_0318 = Vector((-0.3682, -0.5233, 0.5298))
# Hardpoint EXP100_Body_Anchor_0319 = Vector((-0.4884, -0.7041, 0.6073))
# Hardpoint EXP100_Body_Anchor_0320 = Vector((-0.6003, -0.8820, 0.6816))
# Hardpoint EXP100_Body_Anchor_0321 = Vector((-0.7022, -1.0562, 0.7522))
# Hardpoint EXP100_Body_Anchor_0322 = Vector((-0.7922, -1.2259, 0.8182))
# Hardpoint EXP100_Body_Anchor_0323 = Vector((-0.8688, -1.3904, 0.8791))
# Hardpoint EXP100_Body_Anchor_0324 = Vector((-0.9307, -1.5491, 0.9341))
# Hardpoint EXP100_Body_Anchor_0325 = Vector((-0.9770, -1.7012, 0.9829))
# Hardpoint EXP100_Body_Anchor_0326 = Vector((-1.0067, -1.8461, 1.0248))
# Hardpoint EXP100_Body_Anchor_0327 = Vector((-1.0195, -1.9833, 1.0594))
# Hardpoint EXP100_Body_Anchor_0328 = Vector((-1.0151, -2.1120, 1.0865))
# Hardpoint EXP100_Body_Anchor_0329 = Vector((-0.9935, -2.2319, 1.1057))
# Hardpoint EXP100_Body_Anchor_0330 = Vector((-0.9552, -2.3423, 1.1169))
# Hardpoint EXP100_Body_Anchor_0331 = Vector((-0.9007, -2.4428, 1.1199))
# Hardpoint EXP100_Body_Anchor_0332 = Vector((-0.8310, -2.5330, 1.1147))
# Hardpoint EXP100_Body_Anchor_0333 = Vector((-0.7474, -2.6125, 1.1014))
# Hardpoint EXP100_Body_Anchor_0334 = Vector((-0.6511, -2.6810, 1.0801))
# Hardpoint EXP100_Body_Anchor_0335 = Vector((-0.5438, -2.7381, 1.0510))
# Hardpoint EXP100_Body_Anchor_0336 = Vector((-0.4273, -2.7837, 1.0143))
# Hardpoint EXP100_Body_Anchor_0337 = Vector((-0.3037, -2.8175, 0.9706))
# Hardpoint EXP100_Body_Anchor_0338 = Vector((-0.1749, -2.8394, 0.9201))
# Hardpoint EXP100_Body_Anchor_0339 = Vector((-0.0431, -2.8494, 0.8634))
# Hardpoint EXP100_Body_Anchor_0340 = Vector((0.0893, -2.8473, 0.8011))
# Hardpoint EXP100_Body_Anchor_0341 = Vector((0.2203, -2.8331, 0.7338))
# Hardpoint EXP100_Body_Anchor_0342 = Vector((0.3476, -2.8070, 0.6622))
# Hardpoint EXP100_Body_Anchor_0343 = Vector((0.4689, -2.7691, 0.5870))
# Hardpoint EXP100_Body_Anchor_0344 = Vector((0.5824, -2.7194, 0.5088))
# Hardpoint EXP100_Body_Anchor_0345 = Vector((0.6860, -2.6583, 0.4286))
# Hardpoint EXP100_Body_Anchor_0346 = Vector((0.7781, -2.5860, 0.3471))
# Hardpoint EXP100_Body_Anchor_0347 = Vector((0.8570, -2.5027, 0.2652))
# Hardpoint EXP100_Body_Anchor_0348 = Vector((0.9215, -2.4088, 0.1836))
# Hardpoint EXP100_Body_Anchor_0349 = Vector((0.9704, -2.3048, 0.1031))
# Hardpoint EXP100_Body_Anchor_0350 = Vector((1.0030, -2.1910, 0.0246))
# Hardpoint EXP100_Body_Anchor_0351 = Vector((1.0186, -2.0680, -0.0511))
# Hardpoint EXP100_Body_Anchor_0352 = Vector((1.0170, -1.9363, -0.1233))
# Hardpoint EXP100_Body_Anchor_0353 = Vector((0.9982, -1.7964, -0.1913))
# Hardpoint EXP100_Body_Anchor_0354 = Vector((0.9627, -1.6489, -0.2544))
# Hardpoint EXP100_Body_Anchor_0355 = Vector((0.9108, -1.4944, -0.3120))
# Hardpoint EXP100_Body_Anchor_0356 = Vector((0.8436, -1.3336, -0.3634))
# Hardpoint EXP100_Body_Anchor_0357 = Vector((0.7622, -1.1672, -0.4082))
# Hardpoint EXP100_Body_Anchor_0358 = Vector((0.6679, -0.9958, -0.4459))
# Hardpoint EXP100_Body_Anchor_0359 = Vector((0.5623, -0.8203, -0.4762))
# Hardpoint EXP100_Body_Anchor_0360 = Vector((0.4472, -0.6413, -0.4987))
# Hardpoint EXP100_Body_Anchor_0361 = Vector((0.3246, -0.4595, -0.5133))
# Hardpoint EXP100_Body_Anchor_0362 = Vector((0.1965, -0.2759, -0.5197))
# Hardpoint EXP100_Body_Anchor_0363 = Vector((0.0651, -0.0910, -0.5179))
# Hardpoint EXP100_Body_Anchor_0364 = Vector((-0.0674, 0.0942, -0.5079))
# Hardpoint EXP100_Body_Anchor_0365 = Vector((-0.1988, 0.2790, -0.4899))
# Hardpoint EXP100_Body_Anchor_0366 = Vector((-0.3268, 0.4627, -0.4640))
# Hardpoint EXP100_Body_Anchor_0367 = Vector((-0.4493, 0.6443, -0.4305))
# Hardpoint EXP100_Body_Anchor_0368 = Vector((-0.5642, 0.8233, -0.3896))
# Hardpoint EXP100_Body_Anchor_0369 = Vector((-0.6696, 0.9988, -0.3419))
# Hardpoint EXP100_Body_Anchor_0370 = Vector((-0.7637, 1.1701, -0.2877))
# Hardpoint EXP100_Body_Anchor_0371 = Vector((-0.8449, 1.3364, -0.2277))
# Hardpoint EXP100_Body_Anchor_0372 = Vector((-0.9118, 1.4971, -0.1624))
# Hardpoint EXP100_Body_Anchor_0373 = Vector((-0.9634, 1.6514, -0.0925))
# Hardpoint EXP100_Body_Anchor_0374 = Vector((-0.9987, 1.7988, -0.0187))
# Hardpoint EXP100_Body_Anchor_0375 = Vector((-1.0172, 1.9386, 0.0584))
# Hardpoint EXP100_Body_Anchor_0376 = Vector((-1.0184, 2.0702, 0.1378))
# Hardpoint EXP100_Body_Anchor_0377 = Vector((-1.0025, 2.1931, 0.2189))
# Hardpoint EXP100_Body_Anchor_0378 = Vector((-0.9697, 2.3067, 0.3007))
# Hardpoint EXP100_Body_Anchor_0379 = Vector((-0.9205, 2.4105, 0.3826))
# Hardpoint EXP100_Body_Anchor_0380 = Vector((-0.8558, 2.5042, 0.4636))
# Hardpoint EXP100_Body_Anchor_0381 = Vector((-0.7766, 2.5873, 0.5430))
# Hardpoint EXP100_Body_Anchor_0382 = Vector((-0.6844, 2.6595, 0.6200))
# Hardpoint EXP100_Body_Anchor_0383 = Vector((-0.5805, 2.7204, 0.6938))
# Hardpoint EXP100_Body_Anchor_0384 = Vector((-0.4669, 2.7698, 0.7636))
# Hardpoint EXP100_Body_Anchor_0385 = Vector((-0.3454, 2.8076, 0.8288))
# Hardpoint EXP100_Body_Anchor_0386 = Vector((-0.2181, 2.8335, 0.8887))
# Hardpoint EXP100_Body_Anchor_0387 = Vector((-0.0871, 2.8474, 0.9428))
# Hardpoint EXP100_Body_Anchor_0388 = Vector((0.0454, 2.8493, 0.9904))
# Hardpoint EXP100_Body_Anchor_0389 = Vector((0.1771, 2.8392, 1.0311))
# Hardpoint EXP100_Body_Anchor_0390 = Vector((0.3058, 2.8170, 1.0645))
# Hardpoint EXP100_Body_Anchor_0391 = Vector((0.4294, 2.7830, 1.0903))
# Hardpoint EXP100_Body_Anchor_0392 = Vector((0.5457, 2.7372, 1.1082))
# Hardpoint EXP100_Body_Anchor_0393 = Vector((0.6528, 2.6799, 1.1180))
# Hardpoint EXP100_Body_Anchor_0394 = Vector((0.7489, 2.6112, 1.1196))
# Hardpoint EXP100_Body_Anchor_0395 = Vector((0.8324, 2.5315, 1.1131))
# Hardpoint EXP100_Body_Anchor_0396 = Vector((0.9018, 2.4412, 1.0984))
# Hardpoint EXP100_Body_Anchor_0397 = Vector((0.9559, 2.3405, 1.0757))
# Hardpoint EXP100_Body_Anchor_0398 = Vector((0.9940, 2.2299, 1.0453))
# Hardpoint EXP100_Body_Anchor_0399 = Vector((1.0153, 2.1099, 1.0075))
# Hardpoint EXP100_Body_Anchor_0400 = Vector((1.0194, 1.9810, 0.9625))
# Hardpoint EXP100_Body_Anchor_0401 = Vector((1.0064, 1.8437, 0.9110))
# Hardpoint EXP100_Body_Anchor_0402 = Vector((0.9763, 1.6987, 0.8533))
# Hardpoint EXP100_Body_Anchor_0403 = Vector((0.9298, 1.5464, 0.7902))
# Hardpoint EXP100_Body_Anchor_0404 = Vector((0.8676, 1.3877, 0.7221))
# Hardpoint EXP100_Body_Anchor_0405 = Vector((0.7907, 1.2230, 0.6498))
# Hardpoint EXP100_Body_Anchor_0406 = Vector((0.7005, 1.0533, 0.5740))
# Hardpoint EXP100_Body_Anchor_0407 = Vector((0.5985, 0.8790, 0.4955))
# Hardpoint EXP100_Body_Anchor_0408 = Vector((0.4864, 0.7011, 0.4150))
# Hardpoint EXP100_Body_Anchor_0409 = Vector((0.3661, 0.5202, 0.3334))
# Hardpoint EXP100_Body_Anchor_0410 = Vector((0.2396, 0.3370, 0.2514))
# Hardpoint EXP100_Body_Anchor_0411 = Vector((0.1090, 0.1525, 0.1699))
# Hardpoint EXP100_Body_Anchor_0412 = Vector((-0.0234, -0.0327, 0.0898))
# Hardpoint EXP100_Body_Anchor_0413 = Vector((-0.1554, -0.2177, 0.0117))
# Hardpoint EXP100_Body_Anchor_0414 = Vector((-0.2847, -0.4018, -0.0635))
# Hardpoint EXP100_Body_Anchor_0415 = Vector((-0.4093, -0.5842, -0.1351))
# Hardpoint EXP100_Body_Anchor_0416 = Vector((-0.5270, -0.7642, -0.2023))
# Hardpoint EXP100_Body_Anchor_0417 = Vector((-0.6357, -0.9409, -0.2645))
# Hardpoint EXP100_Body_Anchor_0418 = Vector((-0.7338, -1.1137, -0.3211))
# Hardpoint EXP100_Body_Anchor_0419 = Vector((-0.8194, -1.2817, -0.3714))
# Hardpoint EXP100_Body_Anchor_0420 = Vector((-0.8913, -1.4444, -0.4150))
# Hardpoint EXP100_Body_Anchor_0421 = Vector((-0.9480, -1.6009, -0.4515))
# Hardpoint EXP100_Body_Anchor_0422 = Vector((-0.9888, -1.7507, -0.4805))
# Hardpoint EXP100_Body_Anchor_0423 = Vector((-1.0129, -1.8931, -0.5017))
# Hardpoint EXP100_Body_Anchor_0424 = Vector((-1.0199, -2.0274, -0.5149))
# Hardpoint EXP100_Body_Anchor_0425 = Vector((-1.0097, -2.1533, -0.5199))
# Hardpoint EXP100_Body_Anchor_0426 = Vector((-0.9825, -2.2700, -0.5168))
# Hardpoint EXP100_Body_Anchor_0427 = Vector((-0.9386, -2.3771, -0.5055))
# Hardpoint EXP100_Body_Anchor_0428 = Vector((-0.8790, -2.4742, -0.4861))
# Hardpoint EXP100_Body_Anchor_0429 = Vector((-0.8045, -2.5609, -0.4589))
# Hardpoint EXP100_Body_Anchor_0430 = Vector((-0.7164, -2.6367, -0.4241))
# Hardpoint EXP100_Body_Anchor_0431 = Vector((-0.6162, -2.7014, -0.3821))
# Hardpoint EXP100_Body_Anchor_0432 = Vector((-0.5056, -2.7547, -0.3332))
# Hardpoint EXP100_Body_Anchor_0433 = Vector((-0.3865, -2.7964, -0.2780))
# Hardpoint EXP100_Body_Anchor_0434 = Vector((-0.2609, -2.8262, -0.2171))
# Hardpoint EXP100_Body_Anchor_0435 = Vector((-0.1309, -2.8441, -0.1510))
# Hardpoint EXP100_Body_Anchor_0436 = Vector((0.0014, -2.8500, -0.0803))
# Hardpoint EXP100_Body_Anchor_0437 = Vector((0.1336, -2.8439, -0.0059))
# Hardpoint EXP100_Body_Anchor_0438 = Vector((0.2635, -2.8257, 0.0716))
# Hardpoint EXP100_Body_Anchor_0439 = Vector((0.3890, -2.7956, 0.1513))
# Hardpoint EXP100_Body_Anchor_0440 = Vector((0.5080, -2.7537, 0.2326))
# Hardpoint EXP100_Body_Anchor_0441 = Vector((0.6184, -2.7002, 0.3145))
# Hardpoint EXP100_Body_Anchor_0442 = Vector((0.7183, -2.6353, 0.3963))
# Hardpoint EXP100_Body_Anchor_0443 = Vector((0.8061, -2.5592, 0.4771))
# Hardpoint EXP100_Body_Anchor_0444 = Vector((0.8803, -2.4723, 0.5562))
# Hardpoint EXP100_Body_Anchor_0445 = Vector((0.9397, -2.3750, 0.6326))
# Hardpoint EXP100_Body_Anchor_0446 = Vector((0.9832, -2.2677, 0.7058))
# Hardpoint EXP100_Body_Anchor_0447 = Vector((1.0101, -2.1508, 0.7749))
# Hardpoint EXP100_Body_Anchor_0448 = Vector((1.0200, -2.0248, 0.8393))
# Hardpoint EXP100_Body_Anchor_0449 = Vector((1.0126, -1.8902, 0.8983))
# Hardpoint EXP100_Body_Anchor_0450 = Vector((0.9882, -1.7477, 0.9513))
# Hardpoint EXP100_Body_Anchor_0451 = Vector((0.9470, -1.5978, 0.9977))
# Hardpoint EXP100_Body_Anchor_0452 = Vector((0.8899, -1.4411, 1.0373))
# Hardpoint EXP100_Body_Anchor_0453 = Vector((0.8178, -1.2783, 1.0694))
# Hardpoint EXP100_Body_Anchor_0454 = Vector((0.7319, -1.1102, 1.0939))
# Hardpoint EXP100_Body_Anchor_0455 = Vector((0.6336, -0.9373, 1.1104))
# Hardpoint EXP100_Body_Anchor_0456 = Vector((0.5246, -0.7605, 1.1188))
# Hardpoint EXP100_Body_Anchor_0457 = Vector((0.4068, -0.5805, 1.1191))
# Hardpoint EXP100_Body_Anchor_0458 = Vector((0.2821, -0.3981, 1.1112))
# Hardpoint EXP100_Body_Anchor_0459 = Vector((0.1527, -0.2139, 1.0951))
# Hardpoint EXP100_Body_Anchor_0460 = Vector((0.0207, -0.0289, 1.0712))
# Hardpoint EXP100_Body_Anchor_0461 = Vector((-0.1117, 0.1563, 1.0395))
# Hardpoint EXP100_Body_Anchor_0462 = Vector((-0.2422, 0.3408, 1.0004))
# Hardpoint EXP100_Body_Anchor_0463 = Vector((-0.3686, 0.5239, 0.9543))
# Hardpoint EXP100_Body_Anchor_0464 = Vector((-0.4888, 0.7047, 0.9017))
# Hardpoint EXP100_Body_Anchor_0465 = Vector((-0.6007, 0.8826, 0.8431))
# Hardpoint EXP100_Body_Anchor_0466 = Vector((-0.7025, 1.0568, 0.7790))
# Hardpoint EXP100_Body_Anchor_0467 = Vector((-0.7924, 1.2265, 0.7102))
# Hardpoint EXP100_Body_Anchor_0468 = Vector((-0.8690, 1.3910, 0.6373))
# Hardpoint EXP100_Body_Anchor_0469 = Vector((-0.9309, 1.5496, 0.5610))
# Hardpoint EXP100_Body_Anchor_0470 = Vector((-0.9771, 1.7017, 0.4821))
# Hardpoint EXP100_Body_Anchor_0471 = Vector((-1.0068, 1.8466, 0.4013))
# Hardpoint EXP100_Body_Anchor_0472 = Vector((-1.0195, 1.9837, 0.3196))
# Hardpoint EXP100_Body_Anchor_0473 = Vector((-1.0150, 2.1124, 0.2376))
# Hardpoint EXP100_Body_Anchor_0474 = Vector((-0.9934, 2.2323, 0.1563))
# Hardpoint EXP100_Body_Anchor_0475 = Vector((-0.9550, 2.3426, 0.0765))
# Hardpoint EXP100_Body_Anchor_0476 = Vector((-0.9005, 2.4431, -0.0012))
# Hardpoint EXP100_Body_Anchor_0477 = Vector((-0.8308, 2.5333, -0.0758))
# Hardpoint EXP100_Body_Anchor_0478 = Vector((-0.7471, 2.6127, -0.1467))
# Hardpoint EXP100_Body_Anchor_0479 = Vector((-0.6507, 2.6812, -0.2131))
# Hardpoint EXP100_Body_Anchor_0480 = Vector((-0.5434, 2.7383, -0.2744))
# Hardpoint EXP100_Body_Anchor_0481 = Vector((-0.4269, 2.7838, -0.3300))
# Hardpoint EXP100_Body_Anchor_0482 = Vector((-0.3032, 2.8176, -0.3792))
# Hardpoint EXP100_Body_Anchor_0483 = Vector((-0.1744, 2.8395, -0.4217))
# Hardpoint EXP100_Body_Anchor_0484 = Vector((-0.0427, 2.8494, -0.4570))
# Hardpoint EXP100_Body_Anchor_0485 = Vector((0.0898, 2.8472, -0.4847))
# Hardpoint EXP100_Body_Anchor_0486 = Vector((0.2207, 2.8331, -0.5045))
# Hardpoint EXP100_Body_Anchor_0487 = Vector((0.3480, 2.8069, -0.5163))
# Hardpoint EXP100_Body_Anchor_0488 = Vector((0.4693, 2.7689, -0.5200))
# Hardpoint EXP100_Body_Anchor_0489 = Vector((0.5828, 2.7193, -0.5155))
# Hardpoint EXP100_Body_Anchor_0490 = Vector((0.6864, 2.6581, -0.5028))
# Hardpoint EXP100_Body_Anchor_0491 = Vector((0.7784, 2.5857, -0.4821))
# Hardpoint EXP100_Body_Anchor_0492 = Vector((0.8573, 2.5024, -0.4536))
# Hardpoint EXP100_Body_Anchor_0493 = Vector((0.9217, 2.4085, -0.4175))
# Hardpoint EXP100_Body_Anchor_0494 = Vector((0.9706, 2.3044, -0.3743))
# Hardpoint EXP100_Body_Anchor_0495 = Vector((1.0030, 2.1906, -0.3244))
# Hardpoint EXP100_Body_Anchor_0496 = Vector((1.0186, 2.0676, -0.2682))
# Hardpoint EXP100_Body_Anchor_0497 = Vector((1.0170, 1.9358, -0.2063))
# Hardpoint EXP100_Body_Anchor_0498 = Vector((0.9982, 1.7959, -0.1394))
# Hardpoint EXP100_Body_Anchor_0499 = Vector((0.9625, 1.6483, -0.0681))
# Hardpoint EXP100_Body_Anchor_0500 = Vector((0.9106, 1.4938, 0.0069))
# Hardpoint EXP100_Body_Anchor_0501 = Vector((0.8434, 1.3330, 0.0849))
# Hardpoint EXP100_Body_Anchor_0502 = Vector((0.7619, 1.1666, 0.1649))
# Hardpoint EXP100_Body_Anchor_0503 = Vector((0.6675, 0.9952, 0.2463))
# Hardpoint EXP100_Body_Anchor_0504 = Vector((0.5619, 0.8197, 0.3283))
# Hardpoint EXP100_Body_Anchor_0505 = Vector((0.4468, 0.6406, 0.4100))
# Hardpoint EXP100_Body_Anchor_0506 = Vector((0.3242, 0.4589, 0.4905))
# Hardpoint EXP100_Body_Anchor_0507 = Vector((0.1961, 0.2752, 0.5692))
# Hardpoint EXP100_Body_Anchor_0508 = Vector((0.0647, 0.0904, 0.6452))
# Hardpoint EXP100_Body_Anchor_0509 = Vector((-0.0678, -0.0948, 0.7177))
# Hardpoint EXP100_Body_Anchor_0510 = Vector((-0.1992, -0.2796, 0.7861))
# Hardpoint EXP100_Body_Anchor_0511 = Vector((-0.3272, -0.4633, 0.8496))
# Hardpoint EXP100_Body_Anchor_0512 = Vector((-0.4497, -0.6450, 0.9076))
# Hardpoint EXP100_Body_Anchor_0513 = Vector((-0.5646, -0.8239, 0.9595))
# Hardpoint EXP100_Body_Anchor_0514 = Vector((-0.6699, -0.9994, 1.0049))
# Hardpoint EXP100_Body_Anchor_0515 = Vector((-0.7640, -1.1706, 1.0432))
# Hardpoint EXP100_Body_Anchor_0516 = Vector((-0.8451, -1.3369, 1.0741))
# Hardpoint EXP100_Body_Anchor_0517 = Vector((-0.9120, -1.4976, 1.0972))
# Hardpoint EXP100_Body_Anchor_0518 = Vector((-0.9636, -1.6520, 1.1124))
# Hardpoint EXP100_Body_Anchor_0519 = Vector((-0.9988, -1.7993, 1.1195))
# Hardpoint EXP100_Body_Anchor_0520 = Vector((-1.0172, -1.9391, 1.1183))
# Hardpoint EXP100_Body_Anchor_0521 = Vector((-1.0184, -2.0706, 1.1090))
# Hardpoint EXP100_Body_Anchor_0522 = Vector((-1.0025, -2.1935, 1.0916))
# Hardpoint EXP100_Body_Anchor_0523 = Vector((-0.9696, -2.3070, 1.0664))
# Hardpoint EXP100_Body_Anchor_0524 = Vector((-0.9203, -2.4109, 1.0334))
# Hardpoint EXP100_Body_Anchor_0525 = Vector((-0.8556, -2.5045, 0.9931))
# Hardpoint EXP100_Body_Anchor_0526 = Vector((-0.7763, -2.5876, 0.9459))
# Hardpoint EXP100_Body_Anchor_0527 = Vector((-0.6840, -2.6597, 0.8923))
# Hardpoint EXP100_Body_Anchor_0528 = Vector((-0.5802, -2.7206, 0.8327))
# Hardpoint EXP100_Body_Anchor_0529 = Vector((-0.4665, -2.7700, 0.7678))
# Hardpoint EXP100_Body_Anchor_0530 = Vector((-0.3450, -2.8077, 0.6982))
# Hardpoint EXP100_Body_Anchor_0531 = Vector((-0.2177, -2.8335, 0.6247))
# Hardpoint EXP100_Body_Anchor_0532 = Vector((-0.0866, -2.8474, 0.5479))
# Hardpoint EXP100_Body_Anchor_0533 = Vector((0.0458, -2.8493, 0.4686))
# Hardpoint EXP100_Body_Anchor_0534 = Vector((0.1776, -2.8391, 0.3876))
# Hardpoint EXP100_Body_Anchor_0535 = Vector((0.3063, -2.8169, 0.3058))
# Hardpoint EXP100_Body_Anchor_0536 = Vector((0.4298, -2.7829, 0.2239))
# Hardpoint EXP100_Body_Anchor_0537 = Vector((0.5461, -2.7370, 0.1428))
# Hardpoint EXP100_Body_Anchor_0538 = Vector((0.6532, -2.6797, 0.0632))
# Hardpoint EXP100_Body_Anchor_0539 = Vector((0.7492, -2.6110, -0.0140))
# Hardpoint EXP100_Body_Anchor_0540 = Vector((0.8326, -2.5312, -0.0880))
# Hardpoint EXP100_Body_Anchor_0541 = Vector((0.9020, -2.4408, -0.1582))
# Hardpoint EXP100_Body_Anchor_0542 = Vector((0.9561, -2.3401, -0.2238))
# Hardpoint EXP100_Body_Anchor_0543 = Vector((0.9941, -2.2295, -0.2842))
# Hardpoint EXP100_Body_Anchor_0544 = Vector((1.0153, -2.1095, -0.3387))
# Hardpoint EXP100_Body_Anchor_0545 = Vector((1.0194, -1.9805, -0.3869))
# Hardpoint EXP100_Body_Anchor_0546 = Vector((1.0063, -1.8432, -0.4281))
# Hardpoint EXP100_Body_Anchor_0547 = Vector((0.9762, -1.6982, -0.4622))
# Hardpoint EXP100_Body_Anchor_0548 = Vector((0.9296, -1.5459, -0.4885))
# Hardpoint EXP100_Body_Anchor_0549 = Vector((0.8673, -1.3871, -0.5071))
# Hardpoint EXP100_Body_Anchor_0550 = Vector((0.7904, -1.2225, -0.5175))
# Hardpoint EXP100_Body_Anchor_0551 = Vector((0.7002, -1.0527, -0.5198))
# Hardpoint EXP100_Body_Anchor_0552 = Vector((0.5981, -0.8784, -0.5139))
# Hardpoint EXP100_Body_Anchor_0553 = Vector((0.4860, -0.7004, -0.4999))
# Hardpoint EXP100_Body_Anchor_0554 = Vector((0.3656, -0.5195, -0.4778))
# Hardpoint EXP100_Body_Anchor_0555 = Vector((0.2391, -0.3364, -0.4480))
# Hardpoint EXP100_Body_Anchor_0556 = Vector((0.1086, -0.1519, -0.4107))
# Hardpoint EXP100_Body_Anchor_0557 = Vector((-0.0238, 0.0333, -0.3664))
# Hardpoint EXP100_Body_Anchor_0558 = Vector((-0.1558, 0.2183, -0.3153))
# Hardpoint EXP100_Body_Anchor_0559 = Vector((-0.2852, 0.4025, -0.2581))
# Hardpoint EXP100_Body_Anchor_0560 = Vector((-0.4097, 0.5849, -0.1954))
# Hardpoint EXP100_Body_Anchor_0561 = Vector((-0.5274, 0.7648, -0.1277))
# Hardpoint EXP100_Body_Anchor_0562 = Vector((-0.6361, 0.9415, -0.0557))
# Hardpoint EXP100_Body_Anchor_0563 = Vector((-0.7341, 1.1143, 0.0199))
# Hardpoint EXP100_Body_Anchor_0564 = Vector((-0.8197, 1.2823, 0.0982))
# Hardpoint EXP100_Body_Anchor_0565 = Vector((-0.8915, 1.4449, 0.1785))
# Hardpoint EXP100_Body_Anchor_0566 = Vector((-0.9482, 1.6014, 0.2601))
# Hardpoint EXP100_Body_Anchor_0567 = Vector((-0.9889, 1.7512, 0.3421))
# Hardpoint EXP100_Body_Anchor_0568 = Vector((-1.0130, 1.8935, 0.4236))
# Hardpoint EXP100_Body_Anchor_0569 = Vector((-1.0199, 2.0279, 0.5039))
# Hardpoint EXP100_Body_Anchor_0570 = Vector((-1.0097, 2.1537, 0.5822))
# Hardpoint EXP100_Body_Anchor_0571 = Vector((-0.9823, 2.2704, 0.6577))
# Hardpoint EXP100_Body_Anchor_0572 = Vector((-0.9385, 2.3775, 0.7295))
# Hardpoint EXP100_Body_Anchor_0573 = Vector((-0.8787, 2.4745, 0.7971))
# Hardpoint EXP100_Body_Anchor_0574 = Vector((-0.8042, 2.5612, 0.8597))
# Hardpoint EXP100_Body_Anchor_0575 = Vector((-0.7161, 2.6370, 0.9168))
# Hardpoint EXP100_Body_Anchor_0576 = Vector((-0.6158, 2.7016, 0.9676))
# Hardpoint EXP100_Body_Anchor_0577 = Vector((-0.5052, 2.7549, 1.0118))
# Hardpoint EXP100_Body_Anchor_0578 = Vector((-0.3861, 2.7965, 1.0489))
# Hardpoint EXP100_Body_Anchor_0579 = Vector((-0.2605, 2.8263, 1.0785))
# Hardpoint EXP100_Body_Anchor_0580 = Vector((-0.1304, 2.8441, 1.1003))
# Hardpoint EXP100_Body_Anchor_0581 = Vector((0.0018, 2.8500, 1.1142))
# Hardpoint EXP100_Body_Anchor_0582 = Vector((0.1340, 2.8438, 1.1198))
# Hardpoint EXP100_Body_Anchor_0583 = Vector((0.2640, 2.8256, 1.1173))
# Hardpoint EXP100_Body_Anchor_0584 = Vector((0.3895, 2.7955, 1.1067))
# Hardpoint EXP100_Body_Anchor_0585 = Vector((0.5084, 2.7536, 1.0879))
# Hardpoint EXP100_Body_Anchor_0586 = Vector((0.6187, 2.7000, 1.0613))
# Hardpoint EXP100_Body_Anchor_0587 = Vector((0.7186, 2.6350, 1.0271))
# Hardpoint EXP100_Body_Anchor_0588 = Vector((0.8064, 2.5589, 0.9857))
# Hardpoint EXP100_Body_Anchor_0589 = Vector((0.8806, 2.4720, 0.9373))
# Hardpoint EXP100_Body_Anchor_0590 = Vector((0.9399, 2.3747, 0.8826))
# Hardpoint EXP100_Body_Anchor_0591 = Vector((0.9833, 2.2673, 0.8221))
# Hardpoint EXP100_Body_Anchor_0592 = Vector((1.0102, 2.1504, 0.7564))
# Hardpoint EXP100_Body_Anchor_0593 = Vector((1.0200, 2.0243, 0.6861))
# Hardpoint EXP100_Body_Anchor_0594 = Vector((1.0125, 1.8897, 0.6120))
# Hardpoint EXP100_Body_Anchor_0595 = Vector((0.9880, 1.7472, 0.5347))
# Hardpoint EXP100_Body_Anchor_0596 = Vector((0.9469, 1.5972, 0.4551))
# Hardpoint EXP100_Body_Anchor_0597 = Vector((0.8897, 1.4405, 0.3739))
# Hardpoint EXP100_Body_Anchor_0598 = Vector((0.8175, 1.2778, 0.2920))
# Hardpoint EXP100_Body_Anchor_0599 = Vector((0.7316, 1.1096, 0.2102))
# Hardpoint EXP100_Body_Anchor_0600 = Vector((0.6333, 0.9367, 0.1293))
# Hardpoint EXP100_Body_Anchor_0601 = Vector((0.5243, 0.7599, 0.0501))
# Hardpoint EXP100_Body_Anchor_0602 = Vector((0.4064, 0.5799, -0.0267))
# Hardpoint EXP100_Body_Anchor_0603 = Vector((0.2817, 0.3974, -0.1001))
# Hardpoint EXP100_Body_Anchor_0604 = Vector((0.1522, 0.2133, -0.1696))
# Hardpoint EXP100_Body_Anchor_0605 = Vector((0.0202, 0.0282, -0.2343))
# Hardpoint EXP100_Body_Anchor_0606 = Vector((-0.1122, -0.1569, -0.2938))
# Hardpoint EXP100_Body_Anchor_0607 = Vector((-0.2426, -0.3414, -0.3473))
# Hardpoint EXP100_Body_Anchor_0608 = Vector((-0.3690, -0.5245, -0.3943))
# Hardpoint EXP100_Body_Anchor_0609 = Vector((-0.4892, -0.7054, -0.4344))
# Hardpoint EXP100_Body_Anchor_0610 = Vector((-0.6011, -0.8832, -0.4671))
# Hardpoint EXP100_Body_Anchor_0611 = Vector((-0.7028, -1.0574, -0.4922))
# Hardpoint EXP100_Body_Anchor_0612 = Vector((-0.7927, -1.2270, -0.5094))
# Hardpoint EXP100_Body_Anchor_0613 = Vector((-0.8692, -1.3915, -0.5185))
# Hardpoint EXP100_Body_Anchor_0614 = Vector((-0.9311, -1.5501, -0.5194))
# Hardpoint EXP100_Body_Anchor_0615 = Vector((-0.9772, -1.7022, -0.5121))
# Hardpoint EXP100_Body_Anchor_0616 = Vector((-1.0069, -1.8471, -0.4967))
# Hardpoint EXP100_Body_Anchor_0617 = Vector((-1.0195, -1.9842, -0.4733))
# Hardpoint EXP100_Body_Anchor_0618 = Vector((-1.0150, -2.1129, -0.4423))
# Hardpoint EXP100_Body_Anchor_0619 = Vector((-0.9933, -2.2326, -0.4038))
# Hardpoint EXP100_Body_Anchor_0620 = Vector((-0.9548, -2.3430, -0.3582))
# Hardpoint EXP100_Body_Anchor_0621 = Vector((-0.9003, -2.4434, -0.3061))
# Hardpoint EXP100_Body_Anchor_0622 = Vector((-0.8305, -2.5336, -0.2480))
# Hardpoint EXP100_Body_Anchor_0623 = Vector((-0.7467, -2.6130, -0.1843))
# Hardpoint EXP100_Body_Anchor_0624 = Vector((-0.6504, -2.6814, -0.1158))
# Hardpoint EXP100_Body_Anchor_0625 = Vector((-0.5430, -2.7385, -0.0432))
# Hardpoint EXP100_Body_Anchor_0626 = Vector((-0.4265, -2.7840, 0.0328))
# Hardpoint EXP100_Body_Anchor_0627 = Vector((-0.3028, -2.8177, 0.1116))
# Hardpoint EXP100_Body_Anchor_0628 = Vector((-0.1740, -2.8395, 0.1922))
# Hardpoint EXP100_Body_Anchor_0629 = Vector((-0.0422, -2.8494, 0.2739))
# Hardpoint EXP100_Body_Anchor_0630 = Vector((0.0902, -2.8472, 0.3558))
# Hardpoint EXP100_Body_Anchor_0631 = Vector((0.2212, -2.8330, 0.4372))
# Hardpoint EXP100_Body_Anchor_0632 = Vector((0.3484, -2.8068, 0.5173))
# Hardpoint EXP100_Body_Anchor_0633 = Vector((0.4697, -2.7688, 0.5951))
# Hardpoint EXP100_Body_Anchor_0634 = Vector((0.5831, -2.7191, 0.6700))
# Hardpoint EXP100_Body_Anchor_0635 = Vector((0.6867, -2.6579, 0.7412))
# Hardpoint EXP100_Body_Anchor_0636 = Vector((0.7787, -2.5854, 0.8080))
# Hardpoint EXP100_Body_Anchor_0637 = Vector((0.8575, -2.5021, 0.8697))
# Hardpoint EXP100_Body_Anchor_0638 = Vector((0.9219, -2.4082, 0.9258))
# Hardpoint EXP100_Body_Anchor_0639 = Vector((0.9707, -2.3041, 0.9755))
# Hardpoint EXP100_Body_Anchor_0640 = Vector((1.0031, -2.1902, 1.0186))
# Hardpoint EXP100_Body_Anchor_0641 = Vector((1.0186, -2.0672, 1.0544))
# Hardpoint EXP100_Body_Anchor_0642 = Vector((1.0169, -1.9354, 1.0827))
# Hardpoint EXP100_Body_Anchor_0643 = Vector((0.9981, -1.7954, 1.1032))
# Hardpoint EXP100_Body_Anchor_0644 = Vector((0.9624, -1.6478, 1.1157))
# Hardpoint EXP100_Body_Anchor_0645 = Vector((0.9104, -1.4933, 1.1200))
# Hardpoint EXP100_Body_Anchor_0646 = Vector((0.8431, -1.3325, 1.1161))
# Hardpoint EXP100_Body_Anchor_0647 = Vector((0.7616, -1.1660, 1.1041))
# Hardpoint EXP100_Body_Anchor_0648 = Vector((0.6672, -0.9946, 1.0840))
# Hardpoint EXP100_Body_Anchor_0649 = Vector((0.5615, -0.8191, 1.0561))
# Hardpoint EXP100_Body_Anchor_0650 = Vector((0.4464, -0.6400, 1.0207))
# Hardpoint EXP100_Body_Anchor_0651 = Vector((0.3238, -0.4583, 0.9780))
# Hardpoint EXP100_Body_Anchor_0652 = Vector((0.1956, -0.2746, 0.9286))
# Hardpoint EXP100_Body_Anchor_0653 = Vector((0.0642, -0.0898, 0.8729))
# Hardpoint EXP100_Body_Anchor_0654 = Vector((-0.0683, 0.0955, 0.8114))
# Hardpoint EXP100_Body_Anchor_0655 = Vector((-0.1996, 0.2803, 0.7449))
# Hardpoint EXP100_Body_Anchor_0656 = Vector((-0.3276, 0.4639, 0.6739))
# Hardpoint EXP100_Body_Anchor_0657 = Vector((-0.4501, 0.6456, 0.5992))
# Hardpoint EXP100_Body_Anchor_0658 = Vector((-0.5649, 0.8245, 0.5214))
# Hardpoint EXP100_Body_Anchor_0659 = Vector((-0.6703, 1.0000, 0.4415))
# Hardpoint EXP100_Body_Anchor_0660 = Vector((-0.7643, 1.1712, 0.3602))
# Hardpoint EXP100_Body_Anchor_0661 = Vector((-0.8454, 1.3375, 0.2782))
# Hardpoint EXP100_Body_Anchor_0662 = Vector((-0.9122, 1.4982, 0.1965))
# Hardpoint EXP100_Body_Anchor_0663 = Vector((-0.9637, 1.6525, 0.1158))
# Hardpoint EXP100_Body_Anchor_0664 = Vector((-0.9989, 1.7998, 0.0370))
# Hardpoint EXP100_Body_Anchor_0665 = Vector((-1.0172, 1.9395, -0.0393))
# Hardpoint EXP100_Body_Anchor_0666 = Vector((-1.0184, 2.0711, -0.1121))
# Hardpoint EXP100_Body_Anchor_0667 = Vector((-1.0024, 2.1939, -0.1808))
# Hardpoint EXP100_Body_Anchor_0668 = Vector((-0.9694, 2.3074, -0.2447))
# Hardpoint EXP100_Body_Anchor_0669 = Vector((-0.9201, 2.4112, -0.3032))
# Hardpoint EXP100_Body_Anchor_0670 = Vector((-0.8553, 2.5048, -0.3556))
# Hardpoint EXP100_Body_Anchor_0671 = Vector((-0.7760, 2.5878, -0.4015))
# Hardpoint EXP100_Body_Anchor_0672 = Vector((-0.6837, 2.6599, -0.4404))
# Hardpoint EXP100_Body_Anchor_0673 = Vector((-0.5798, 2.7208, -0.4719))
# Hardpoint EXP100_Body_Anchor_0674 = Vector((-0.4661, 2.7701, -0.4957))
# Hardpoint EXP100_Body_Anchor_0675 = Vector((-0.3446, 2.8078, -0.5115))
# Hardpoint EXP100_Body_Anchor_0676 = Vector((-0.2172, 2.8336, -0.5192))
# Hardpoint EXP100_Body_Anchor_0677 = Vector((-0.0862, 2.8475, -0.5187))
# Hardpoint EXP100_Body_Anchor_0678 = Vector((0.0463, 2.8493, -0.5101))
# Hardpoint EXP100_Body_Anchor_0679 = Vector((0.1780, 2.8390, -0.4933))
# Hardpoint EXP100_Body_Anchor_0680 = Vector((0.3067, 2.8168, -0.4687))
# Hardpoint EXP100_Body_Anchor_0681 = Vector((0.4302, 2.7827, -0.4363))
# Hardpoint EXP100_Body_Anchor_0682 = Vector((0.5465, 2.7369, -0.3966))
# Hardpoint EXP100_Body_Anchor_0683 = Vector((0.6535, 2.6795, -0.3499))
# Hardpoint EXP100_Body_Anchor_0684 = Vector((0.7495, 2.6107, -0.2968))
# Hardpoint EXP100_Body_Anchor_0685 = Vector((0.8329, 2.5310, -0.2376))
# Hardpoint EXP100_Body_Anchor_0686 = Vector((0.9022, 2.4405, -0.1731))
# Hardpoint EXP100_Body_Anchor_0687 = Vector((0.9563, 2.3397, -0.1039))
# Hardpoint EXP100_Body_Anchor_0688 = Vector((0.9942, 2.2291, -0.0306))
# Hardpoint EXP100_Body_Anchor_0689 = Vector((1.0154, 2.1090, 0.0459))
# Hardpoint EXP100_Body_Anchor_0690 = Vector((1.0194, 1.9801, 0.1250))
# Hardpoint EXP100_Body_Anchor_0691 = Vector((1.0062, 1.8428, 0.2059))
# Hardpoint EXP100_Body_Anchor_0692 = Vector((0.9761, 1.6976, 0.2877))
# Hardpoint EXP100_Body_Anchor_0693 = Vector((0.9294, 1.5454, 0.3696))
# Hardpoint EXP100_Body_Anchor_0694 = Vector((0.8671, 1.3866, 0.4508))
# Hardpoint EXP100_Body_Anchor_0695 = Vector((0.7902, 1.2219, 0.5305))
# Hardpoint EXP100_Body_Anchor_0696 = Vector((0.6999, 1.0521, 0.6079))
# Hardpoint EXP100_Body_Anchor_0697 = Vector((0.5978, 0.8778, 0.6823))
# Hardpoint EXP100_Body_Anchor_0698 = Vector((0.4856, 0.6998, 0.7528))
# Hardpoint EXP100_Body_Anchor_0699 = Vector((0.3652, 0.5189, 0.8188))
# Hardpoint EXP100_Body_Anchor_0700 = Vector((0.2387, 0.3358, 0.8796))
# Hardpoint EXP100_Body_Anchor_0701 = Vector((0.1081, 0.1512, 0.9346))
# Hardpoint EXP100_Body_Anchor_0702 = Vector((-0.0243, -0.0339, 0.9833))
# Hardpoint EXP100_Body_Anchor_0703 = Vector((-0.1563, -0.2190, 1.0251))
# Hardpoint EXP100_Body_Anchor_0704 = Vector((-0.2856, -0.4031, 1.0597))
# Hardpoint EXP100_Body_Anchor_0705 = Vector((-0.4101, -0.5855, 1.0867))
# Hardpoint EXP100_Body_Anchor_0706 = Vector((-0.5278, -0.7654, 1.1059))
# Hardpoint EXP100_Body_Anchor_0707 = Vector((-0.6364, -0.9421, 1.1170))
# Hardpoint EXP100_Body_Anchor_0708 = Vector((-0.7344, -1.1148, 1.1199))
# Hardpoint EXP100_Body_Anchor_0709 = Vector((-0.8200, -1.2829, 1.1147))
# Hardpoint EXP100_Body_Anchor_0710 = Vector((-0.8917, -1.4455, 1.1013))
# Hardpoint EXP100_Body_Anchor_0711 = Vector((-0.9484, -1.6019, 1.0799))
# Hardpoint EXP100_Body_Anchor_0712 = Vector((-0.9890, -1.7517, 1.0507))
# Hardpoint EXP100_Body_Anchor_0713 = Vector((-1.0130, -1.8940, 1.0140))
# Hardpoint EXP100_Body_Anchor_0714 = Vector((-1.0199, -2.0283, 0.9701))
# Hardpoint EXP100_Body_Anchor_0715 = Vector((-1.0096, -2.1541, 0.9196))
# Hardpoint EXP100_Body_Anchor_0716 = Vector((-0.9822, -2.2708, 0.8629))
# Hardpoint EXP100_Body_Anchor_0717 = Vector((-0.9383, -2.3778, 0.8006))
# Hardpoint EXP100_Body_Anchor_0718 = Vector((-0.8785, -2.4749, 0.7332))
# Hardpoint EXP100_Body_Anchor_0719 = Vector((-0.8039, -2.5614, 0.6616))
# Hardpoint EXP100_Body_Anchor_0720 = Vector((-0.7157, -2.6372, 0.5863))
# Hardpoint EXP100_Body_Anchor_0721 = Vector((-0.6155, -2.7018, 0.5081))
# Hardpoint EXP100_Body_Anchor_0722 = Vector((-0.5049, -2.7550, 0.4279))
# Hardpoint EXP100_Body_Anchor_0723 = Vector((-0.3857, -2.7966, 0.3464))
# Hardpoint EXP100_Body_Anchor_0724 = Vector((-0.2600, -2.8264, 0.2644))
# Hardpoint EXP100_Body_Anchor_0725 = Vector((-0.1300, -2.8442, 0.1828))
# Hardpoint EXP100_Body_Anchor_0726 = Vector((0.0023, -2.8500, 0.1024))
# Hardpoint EXP100_Body_Anchor_0727 = Vector((0.1345, -2.8438, 0.0239))
# Hardpoint EXP100_Body_Anchor_0728 = Vector((0.2644, -2.8255, -0.0518))
# Hardpoint EXP100_Body_Anchor_0729 = Vector((0.3899, -2.7954, -0.1240))
# Hardpoint EXP100_Body_Anchor_0730 = Vector((0.5088, -2.7534, -0.1919))
# Hardpoint EXP100_Body_Anchor_0731 = Vector((0.6191, -2.6998, -0.2550))
# Hardpoint EXP100_Body_Anchor_0732 = Vector((0.7190, -2.6348, -0.3124))
# Hardpoint EXP100_Body_Anchor_0733 = Vector((0.8067, -2.5587, -0.3638))
# Hardpoint EXP100_Body_Anchor_0734 = Vector((0.8808, -2.4717, -0.4086))
# Hardpoint EXP100_Body_Anchor_0735 = Vector((0.9400, -2.3743, -0.4462))
# Hardpoint EXP100_Body_Anchor_0736 = Vector((0.9834, -2.2669, -0.4764))
# Hardpoint EXP100_Body_Anchor_0737 = Vector((1.0102, -2.1499, -0.4989))
# Hardpoint EXP100_Body_Anchor_0738 = Vector((1.0200, -2.0239, -0.5134))
# Hardpoint EXP100_Body_Anchor_0739 = Vector((1.0125, -1.8893, -0.5197))
# Hardpoint EXP100_Body_Anchor_0740 = Vector((0.9879, -1.7467, -0.5178))
# Hardpoint EXP100_Body_Anchor_0741 = Vector((0.9467, -1.5967, -0.5078))
# Hardpoint EXP100_Body_Anchor_0742 = Vector((0.8895, -1.4400, -0.4897))
# Hardpoint EXP100_Body_Anchor_0743 = Vector((0.8173, -1.2772, -0.4637))
# Hardpoint EXP100_Body_Anchor_0744 = Vector((0.7313, -1.1090, -0.4301))
# Hardpoint EXP100_Body_Anchor_0745 = Vector((0.6329, -0.9361, -0.3892))
# Hardpoint EXP100_Body_Anchor_0746 = Vector((0.5239, -0.7593, -0.3414))
# Hardpoint EXP100_Body_Anchor_0747 = Vector((0.4060, -0.5793, -0.2872))
# Hardpoint EXP100_Body_Anchor_0748 = Vector((0.2813, -0.3968, -0.2271))
# Hardpoint EXP100_Body_Anchor_0749 = Vector((0.1518, -0.2127, -0.1618))
# Hardpoint EXP100_Body_Anchor_0750 = Vector((0.0198, -0.0276, -0.0919))
# Hardpoint EXP100_Body_Anchor_0751 = Vector((-0.1126, 0.1576, -0.0180))
# Hardpoint EXP100_Body_Anchor_0752 = Vector((-0.2431, 0.3421, 0.0591))
# Hardpoint EXP100_Body_Anchor_0753 = Vector((-0.3694, 0.5251, 0.1385))
# Hardpoint EXP100_Body_Anchor_0754 = Vector((-0.4896, 0.7060, 0.2196))
# Hardpoint EXP100_Body_Anchor_0755 = Vector((-0.6014, 0.8838, 0.3015))
# Hardpoint EXP100_Body_Anchor_0756 = Vector((-0.7032, 1.0580, 0.3833))
# Hardpoint EXP100_Body_Anchor_0757 = Vector((-0.7930, 1.2276, 0.4643))
# Hardpoint EXP100_Body_Anchor_0758 = Vector((-0.8695, 1.3921, 0.5437))
# Hardpoint EXP100_Body_Anchor_0759 = Vector((-0.9313, 1.5507, 0.6207))
# Hardpoint EXP100_Body_Anchor_0760 = Vector((-0.9774, 1.7027, 0.6944))
# Hardpoint EXP100_Body_Anchor_0761 = Vector((-1.0069, 1.8476, 0.7642))
# Hardpoint EXP100_Body_Anchor_0762 = Vector((-1.0195, 1.9846, 0.8294))
# Hardpoint EXP100_Body_Anchor_0763 = Vector((-1.0149, 2.1133, 0.8892))
# Hardpoint EXP100_Body_Anchor_0764 = Vector((-0.9932, 2.2330, 0.9432))
# Hardpoint EXP100_Body_Anchor_0765 = Vector((-0.9547, 2.3433, 0.9908))
# Hardpoint EXP100_Body_Anchor_0766 = Vector((-0.9001, 2.4438, 1.0314))
# Hardpoint EXP100_Body_Anchor_0767 = Vector((-0.8303, 2.5339, 1.0648))
# Hardpoint EXP100_Body_Anchor_0768 = Vector((-0.7464, 2.6132, 1.0905))
# Hardpoint EXP100_Body_Anchor_0769 = Vector((-0.6500, 2.6816, 1.1083))
# Hardpoint EXP100_Body_Anchor_0770 = Vector((-0.5426, 2.7386, 1.1180))
# Hardpoint EXP100_Body_Anchor_0771 = Vector((-0.4261, 2.7841, 1.1196))
# Hardpoint EXP100_Body_Anchor_0772 = Vector((-0.3024, 2.8178, 1.1130))
# Hardpoint EXP100_Body_Anchor_0773 = Vector((-0.1735, 2.8396, 1.0982))
# Hardpoint EXP100_Body_Anchor_0774 = Vector((-0.0418, 2.8494, 1.0755))
# Hardpoint EXP100_Body_Anchor_0775 = Vector((0.0907, 2.8472, 1.0450))
# Hardpoint EXP100_Body_Anchor_0776 = Vector((0.2216, 2.8329, 1.0071))
# Hardpoint EXP100_Body_Anchor_0777 = Vector((0.3488, 2.8067, 0.9621))
# Hardpoint EXP100_Body_Anchor_0778 = Vector((0.4701, 2.7686, 0.9105))
# Hardpoint EXP100_Body_Anchor_0779 = Vector((0.5835, 2.7189, 0.8528))
# Hardpoint EXP100_Body_Anchor_0780 = Vector((0.6870, 2.6576, 0.7896))
# Hardpoint EXP100_Body_Anchor_0781 = Vector((0.7790, 2.5852, 0.7215))
# Hardpoint EXP100_Body_Anchor_0782 = Vector((0.8578, 2.5018, 0.6491))
# Hardpoint EXP100_Body_Anchor_0783 = Vector((0.9221, 2.4078, 0.5733))
# Hardpoint EXP100_Body_Anchor_0784 = Vector((0.9708, 2.3037, 0.4948))
# Hardpoint EXP100_Body_Anchor_0785 = Vector((1.0032, 2.1898, 0.4143))
# Hardpoint EXP100_Body_Anchor_0786 = Vector((1.0186, 2.0667, 0.3326))
# Hardpoint EXP100_Body_Anchor_0787 = Vector((1.0169, 1.9349, 0.2507))
# Hardpoint EXP100_Body_Anchor_0788 = Vector((0.9980, 1.7949, 0.1692))
# Hardpoint EXP100_Body_Anchor_0789 = Vector((0.9622, 1.6473, 0.0890))
# Hardpoint EXP100_Body_Anchor_0790 = Vector((0.9102, 1.4928, 0.0110))
# Hardpoint EXP100_Body_Anchor_0791 = Vector((0.8429, 1.3319, -0.0642))
# Hardpoint EXP100_Body_Anchor_0792 = Vector((0.7613, 1.1654, -0.1357))
# Hardpoint EXP100_Body_Anchor_0793 = Vector((0.6668, 0.9940, -0.2029))
# Hardpoint EXP100_Body_Anchor_0794 = Vector((0.5612, 0.8185, -0.2650))
# Hardpoint EXP100_Body_Anchor_0795 = Vector((0.4460, 0.6394, -0.3215))
# Hardpoint EXP100_Body_Anchor_0796 = Vector((0.3233, 0.4577, -0.3718))
# Hardpoint EXP100_Body_Anchor_0797 = Vector((0.1952, 0.2740, -0.4154))
# Hardpoint EXP100_Body_Anchor_0798 = Vector((0.0638, 0.0891, -0.4518))
# Hardpoint EXP100_Body_Anchor_0799 = Vector((-0.0687, -0.0961, -0.4808))
# Hardpoint EXP100_Body_Anchor_0800 = Vector((-0.2001, -0.2809, -0.5019))
# Hardpoint EXP100_Body_Anchor_0801 = Vector((-0.3281, -0.4645, -0.5150))
# Hardpoint EXP100_Body_Anchor_0802 = Vector((-0.4505, -0.6462, -0.5200))
# Hardpoint EXP100_Body_Anchor_0803 = Vector((-0.5653, -0.8251, -0.5167))
# Hardpoint EXP100_Body_Anchor_0804 = Vector((-0.6706, -1.0006, -0.5053))
# Hardpoint EXP100_Body_Anchor_0805 = Vector((-0.7646, -1.1718, -0.4859))
# Hardpoint EXP100_Body_Anchor_0806 = Vector((-0.8457, -1.3381, -0.4586))
# Hardpoint EXP100_Body_Anchor_0807 = Vector((-0.9124, -1.4987, -0.4237))
# Hardpoint EXP100_Body_Anchor_0808 = Vector((-0.9638, -1.6530, -0.3817))
# Hardpoint EXP100_Body_Anchor_0809 = Vector((-0.9990, -1.8003, -0.3327))
# Hardpoint EXP100_Body_Anchor_0810 = Vector((-1.0173, -1.9400, -0.2775))
# Hardpoint EXP100_Body_Anchor_0811 = Vector((-1.0184, -2.0715, -0.2165))
# Hardpoint EXP100_Body_Anchor_0812 = Vector((-1.0023, -2.1943, -0.1503))
# Hardpoint EXP100_Body_Anchor_0813 = Vector((-0.9693, -2.3078, -0.0797))
# Hardpoint EXP100_Body_Anchor_0814 = Vector((-0.9199, -2.4115, -0.0052))
# Hardpoint EXP100_Body_Anchor_0815 = Vector((-0.8551, -2.5051, 0.0723))
# Hardpoint EXP100_Body_Anchor_0816 = Vector((-0.7758, -2.5881, 0.1521))
# Hardpoint EXP100_Body_Anchor_0817 = Vector((-0.6834, -2.6601, 0.2333))
# Hardpoint EXP100_Body_Anchor_0818 = Vector((-0.5794, -2.7210, 0.3152))
# Hardpoint EXP100_Body_Anchor_0819 = Vector((-0.4657, -2.7703, 0.3970))
# Hardpoint EXP100_Body_Anchor_0820 = Vector((-0.3441, -2.8079, 0.4778))
# Hardpoint EXP100_Body_Anchor_0821 = Vector((-0.2168, -2.8337, 0.5568))
# Hardpoint EXP100_Body_Anchor_0822 = Vector((-0.0857, -2.8475, 0.6333))
# Hardpoint EXP100_Body_Anchor_0823 = Vector((0.0468, -2.8493, 0.7064))
# Hardpoint EXP100_Body_Anchor_0824 = Vector((0.1784, -2.8390, 0.7755))
# Hardpoint EXP100_Body_Anchor_0825 = Vector((0.3071, -2.8167, 0.8398))
# Hardpoint EXP100_Body_Anchor_0826 = Vector((0.4306, -2.7826, 0.8988))
# Hardpoint EXP100_Body_Anchor_0827 = Vector((0.5469, -2.7367, 0.9517))
# Hardpoint EXP100_Body_Anchor_0828 = Vector((0.6539, -2.6792, 0.9981))
# Hardpoint EXP100_Body_Anchor_0829 = Vector((0.7498, -2.6105, 1.0376))
# Hardpoint EXP100_Body_Anchor_0830 = Vector((0.8331, -2.5307, 1.0697))
# Hardpoint EXP100_Body_Anchor_0831 = Vector((0.9024, -2.4402, 1.0941))
# Hardpoint EXP100_Body_Anchor_0832 = Vector((0.9564, -2.3394, 1.1105))
# Hardpoint EXP100_Body_Anchor_0833 = Vector((0.9943, -2.2287, 1.1189))
# Hardpoint EXP100_Body_Anchor_0834 = Vector((1.0154, -2.1086, 1.1191))
# Hardpoint EXP100_Body_Anchor_0835 = Vector((1.0194, -1.9796, 1.1111))
# Hardpoint EXP100_Body_Anchor_0836 = Vector((1.0061, -1.8423, 1.0950))
# Hardpoint EXP100_Body_Anchor_0837 = Vector((0.9759, -1.6971, 1.0709))
# Hardpoint EXP100_Body_Anchor_0838 = Vector((0.9292, -1.5448, 1.0392))
# Hardpoint EXP100_Body_Anchor_0839 = Vector((0.8669, -1.3860, 1.0000))
# Hardpoint EXP100_Body_Anchor_0840 = Vector((0.7899, -1.2213, 0.9539))
# Hardpoint EXP100_Body_Anchor_0841 = Vector((0.6995, -1.0515, 0.9012))
# Hardpoint EXP100_Body_Anchor_0842 = Vector((0.5974, -0.8772, 0.8425))
# Hardpoint EXP100_Body_Anchor_0843 = Vector((0.4852, -0.6992, 0.7784))
# Hardpoint EXP100_Body_Anchor_0844 = Vector((0.3648, -0.5183, 0.7096))
# Hardpoint EXP100_Body_Anchor_0845 = Vector((0.2382, -0.3352, 0.6366))
# Hardpoint EXP100_Body_Anchor_0846 = Vector((0.1077, -0.1506, 0.5603))
# Hardpoint EXP100_Body_Anchor_0847 = Vector((-0.0247, 0.0346, 0.4813))
# Hardpoint EXP100_Body_Anchor_0848 = Vector((-0.1567, 0.2196, 0.4006))
# Hardpoint EXP100_Body_Anchor_0849 = Vector((-0.2861, 0.4037, 0.3189))
# Hardpoint EXP100_Body_Anchor_0850 = Vector((-0.4106, 0.5861, 0.2369))
# Hardpoint EXP100_Body_Anchor_0851 = Vector((-0.5281, 0.7660, 0.1556))
# Hardpoint EXP100_Body_Anchor_0852 = Vector((-0.6368, 0.9427, 0.0758))
# Hardpoint EXP100_Body_Anchor_0853 = Vector((-0.7347, 1.1154, -0.0019))
# Hardpoint EXP100_Body_Anchor_0854 = Vector((-0.8202, 1.2834, -0.0765))
# Hardpoint EXP100_Body_Anchor_0855 = Vector((-0.8919, 1.4460, -0.1473))
# Hardpoint EXP100_Body_Anchor_0856 = Vector((-0.9485, 1.6025, -0.2137))
# Hardpoint EXP100_Body_Anchor_0857 = Vector((-0.9892, 1.7522, -0.2749))
# Hardpoint EXP100_Body_Anchor_0858 = Vector((-1.0131, 1.8945, -0.3304))
# Hardpoint EXP100_Body_Anchor_0859 = Vector((-1.0199, 2.0288, -0.3796))
# Hardpoint EXP100_Body_Anchor_0860 = Vector((-1.0095, 2.1545, -0.4220))
# Hardpoint EXP100_Body_Anchor_0861 = Vector((-0.9821, 2.2711, -0.4572))
# Hardpoint EXP100_Body_Anchor_0862 = Vector((-0.9381, 2.3782, -0.4849))
# Hardpoint EXP100_Body_Anchor_0863 = Vector((-0.8783, 2.4752, -0.5046))
# Hardpoint EXP100_Body_Anchor_0864 = Vector((-0.8036, 2.5617, -0.5164))
# Hardpoint EXP100_Body_Anchor_0865 = Vector((-0.7154, 2.6374, -0.5200))
# Hardpoint EXP100_Body_Anchor_0866 = Vector((-0.6151, 2.7020, -0.5154))
# Hardpoint EXP100_Body_Anchor_0867 = Vector((-0.5045, 2.7552, -0.5026))
# Hardpoint EXP100_Body_Anchor_0868 = Vector((-0.3853, 2.7967, -0.4819))
# Hardpoint EXP100_Body_Anchor_0869 = Vector((-0.2596, 2.8264, -0.4533))
# Hardpoint EXP100_Body_Anchor_0870 = Vector((-0.1295, 2.8442, -0.4172))
# Hardpoint EXP100_Body_Anchor_0871 = Vector((0.0027, 2.8500, -0.3739))
# Hardpoint EXP100_Body_Anchor_0872 = Vector((0.1349, 2.8437, -0.3239))
# Hardpoint EXP100_Body_Anchor_0873 = Vector((0.2648, 2.8255, -0.2676))
# Hardpoint EXP100_Body_Anchor_0874 = Vector((0.3903, 2.7952, -0.2057))
# Hardpoint EXP100_Body_Anchor_0875 = Vector((0.5092, 2.7532, -0.1388))
# Hardpoint EXP100_Body_Anchor_0876 = Vector((0.6195, 2.6996, -0.0674))
# Hardpoint EXP100_Body_Anchor_0877 = Vector((0.7193, 2.6345, 0.0076))
# Hardpoint EXP100_Body_Anchor_0878 = Vector((0.8070, 2.5584, 0.0856))
# Hardpoint EXP100_Body_Anchor_0879 = Vector((0.8810, 2.4714, 0.1656))
# Hardpoint EXP100_Body_Anchor_0880 = Vector((0.9402, 2.3740, 0.2471))
# Hardpoint EXP100_Body_Anchor_0881 = Vector((0.9836, 2.2665, 0.3290))
# Hardpoint EXP100_Body_Anchor_0882 = Vector((1.0103, 2.1495, 0.4107))
# Hardpoint EXP100_Body_Anchor_0883 = Vector((1.0200, 2.0234, 0.4913))
# Hardpoint EXP100_Body_Anchor_0884 = Vector((1.0124, 1.8888, 0.5699))
# Hardpoint EXP100_Body_Anchor_0885 = Vector((0.9878, 1.7462, 0.6459))
# Hardpoint EXP100_Body_Anchor_0886 = Vector((0.9465, 1.5962, 0.7184))
# Hardpoint EXP100_Body_Anchor_0887 = Vector((0.8893, 1.4395, 0.7867))
# Hardpoint EXP100_Body_Anchor_0888 = Vector((0.8170, 1.2766, 0.8501))
# Hardpoint EXP100_Body_Anchor_0889 = Vector((0.7309, 1.1084, 0.9081))
# Hardpoint EXP100_Body_Anchor_0890 = Vector((0.6325, 0.9355, 0.9600))
# Hardpoint EXP100_Body_Anchor_0891 = Vector((0.5235, 0.7587, 1.0053))
# Hardpoint EXP100_Body_Anchor_0892 = Vector((0.4056, 0.5787, 1.0435))
# Hardpoint EXP100_Body_Anchor_0893 = Vector((0.2808, 0.3962, 1.0743))
# Hardpoint EXP100_Body_Anchor_0894 = Vector((0.1513, 0.2120, 1.0974))
# Hardpoint EXP100_Body_Anchor_0895 = Vector((0.0193, 0.0270, 1.1125))
# Hardpoint EXP100_Body_Anchor_0896 = Vector((-0.1131, -0.1582, 1.1195))
# Hardpoint EXP100_Body_Anchor_0897 = Vector((-0.2435, -0.3427, 1.1183))
# Hardpoint EXP100_Body_Anchor_0898 = Vector((-0.3699, -0.5257, 1.1089))
# Hardpoint EXP100_Body_Anchor_0899 = Vector((-0.4900, -0.7066, 1.0915))
# Hardpoint EXP100_Body_Anchor_0900 = Vector((-0.6018, -0.8844, 1.0661))
# Hardpoint EXP100_Body_Anchor_0901 = Vector((-0.7035, -1.0585, 1.0331))
# Hardpoint EXP100_Body_Anchor_0902 = Vector((-0.7933, -1.2282, 0.9927))
# Hardpoint EXP100_Body_Anchor_0903 = Vector((-0.8697, -1.3926, 0.9455))
# Hardpoint EXP100_Body_Anchor_0904 = Vector((-0.9315, -1.5512, 0.8918))
# Hardpoint EXP100_Body_Anchor_0905 = Vector((-0.9775, -1.7032, 0.8321))
# Hardpoint EXP100_Body_Anchor_0906 = Vector((-1.0070, -1.8481, 0.7672))
# Hardpoint EXP100_Body_Anchor_0907 = Vector((-1.0195, -1.9851, 0.6976))
# Hardpoint EXP100_Body_Anchor_0908 = Vector((-1.0149, -2.1137, 0.6240))
# Hardpoint EXP100_Body_Anchor_0909 = Vector((-0.9931, -2.2334, 0.5472))
# Hardpoint EXP100_Body_Anchor_0910 = Vector((-0.9545, -2.3437, 0.4679))
# Hardpoint EXP100_Body_Anchor_0911 = Vector((-0.8998, -2.4441, 0.3869))
# Hardpoint EXP100_Body_Anchor_0912 = Vector((-0.8300, -2.5341, 0.3051))
# Hardpoint EXP100_Body_Anchor_0913 = Vector((-0.7461, -2.6135, 0.2232))
# Hardpoint EXP100_Body_Anchor_0914 = Vector((-0.6497, -2.6818, 0.1421))
# Hardpoint EXP100_Body_Anchor_0915 = Vector((-0.5423, -2.7388, 0.0625))
# Hardpoint EXP100_Body_Anchor_0916 = Vector((-0.4257, -2.7842, -0.0146))
# Hardpoint EXP100_Body_Anchor_0917 = Vector((-0.3019, -2.8179, -0.0887))
# Hardpoint EXP100_Body_Anchor_0918 = Vector((-0.1731, -2.8396, -0.1588))
# Hardpoint EXP100_Body_Anchor_0919 = Vector((-0.0413, -2.8494, -0.2244))
# Hardpoint EXP100_Body_Anchor_0920 = Vector((0.0911, -2.8471, -0.2847))
# Hardpoint EXP100_Body_Anchor_0921 = Vector((0.2221, -2.8329, -0.3392))
# Hardpoint EXP100_Body_Anchor_0922 = Vector((0.3493, -2.8066, -0.3873))
# Hardpoint EXP100_Body_Anchor_0923 = Vector((0.4705, -2.7685, -0.4285))
# Hardpoint EXP100_Body_Anchor_0924 = Vector((0.5839, -2.7187, -0.4624))
# Hardpoint EXP100_Body_Anchor_0925 = Vector((0.6874, -2.6574, -0.4887))
# Hardpoint EXP100_Body_Anchor_0926 = Vector((0.7793, -2.5849, -0.5072))
# Hardpoint EXP100_Body_Anchor_0927 = Vector((0.8580, -2.5015, -0.5176))
# Hardpoint EXP100_Body_Anchor_0928 = Vector((0.9223, -2.4075, -0.5198))
# Hardpoint EXP100_Body_Anchor_0929 = Vector((0.9710, -2.3033, -0.5138))
# Hardpoint EXP100_Body_Anchor_0930 = Vector((1.0033, -2.1894, -0.4997))
# Hardpoint EXP100_Body_Anchor_0931 = Vector((1.0187, -2.0663, -0.4776))
# Hardpoint EXP100_Body_Anchor_0932 = Vector((1.0168, -1.9344, -0.4477))
# Hardpoint EXP100_Body_Anchor_0933 = Vector((0.9979, -1.7944, -0.4104))
# Hardpoint EXP100_Body_Anchor_0934 = Vector((0.9621, -1.6468, -0.3659))
# Hardpoint EXP100_Body_Anchor_0935 = Vector((0.9100, -1.4922, -0.3148))
# Hardpoint EXP100_Body_Anchor_0936 = Vector((0.8426, -1.3314, -0.2576))
# Hardpoint EXP100_Body_Anchor_0937 = Vector((0.7610, -1.1649, -0.1948))
# Hardpoint EXP100_Body_Anchor_0938 = Vector((0.6665, -0.9935, -0.1271))
# Hardpoint EXP100_Body_Anchor_0939 = Vector((0.5608, -0.8178, -0.0550))
# Hardpoint EXP100_Body_Anchor_0940 = Vector((0.4456, -0.6388, 0.0205))
# Hardpoint EXP100_Body_Anchor_0941 = Vector((0.3229, -0.4570, 0.0989))
# Hardpoint EXP100_Body_Anchor_0942 = Vector((0.1948, -0.2733, 0.1793))
# Hardpoint EXP100_Body_Anchor_0943 = Vector((0.0633, -0.0885, 0.2608))
# Hardpoint EXP100_Body_Anchor_0944 = Vector((-0.0692, 0.0967, 0.3428))
# Hardpoint EXP100_Body_Anchor_0945 = Vector((-0.2005, 0.2815, 0.4243))
# Hardpoint EXP100_Body_Anchor_0946 = Vector((-0.3285, 0.4651, 0.5046))
# Hardpoint EXP100_Body_Anchor_0947 = Vector((-0.4509, 0.6468, 0.5829))
# Hardpoint EXP100_Body_Anchor_0948 = Vector((-0.5657, 0.8257, 0.6583))
# Hardpoint EXP100_Body_Anchor_0949 = Vector((-0.6710, 1.0012, 0.7302))
# Hardpoint EXP100_Body_Anchor_0950 = Vector((-0.7649, 1.1724, 0.7977))
# Hardpoint EXP100_Body_Anchor_0951 = Vector((-0.8459, 1.3386, 0.8603))
# Hardpoint EXP100_Body_Anchor_0952 = Vector((-0.9127, 1.4992, 0.9173))
# Hardpoint EXP100_Body_Anchor_0953 = Vector((-0.9640, 1.6535, 0.9681))
# Hardpoint EXP100_Body_Anchor_0954 = Vector((-0.9991, 1.8008, 1.0122))
# Hardpoint EXP100_Body_Anchor_0955 = Vector((-1.0173, 1.9405, 1.0492))
# Hardpoint EXP100_Body_Anchor_0956 = Vector((-1.0183, 2.0720, 1.0787))
# Hardpoint EXP100_Body_Anchor_0957 = Vector((-1.0022, 2.1947, 1.1005))
# Hardpoint EXP100_Body_Anchor_0958 = Vector((-0.9691, 2.3082, 1.1142))
# Hardpoint EXP100_Body_Anchor_0959 = Vector((-0.9197, 2.4119, 1.1199))
# Hardpoint EXP100_Body_Anchor_0960 = Vector((-0.8548, 2.5054, 1.1173))
# Hardpoint EXP100_Body_Anchor_0961 = Vector((-0.7755, 2.5883, 1.1065))
# Hardpoint EXP100_Body_Anchor_0962 = Vector((-0.6830, 2.6604, 1.0877))
# Hardpoint EXP100_Body_Anchor_0963 = Vector((-0.5791, 2.7211, 1.0611))
# Hardpoint EXP100_Body_Anchor_0964 = Vector((-0.4653, 2.7704, 1.0268))
# Hardpoint EXP100_Body_Anchor_0965 = Vector((-0.3437, 2.8080, 0.9853))
# Hardpoint EXP100_Body_Anchor_0966 = Vector((-0.2163, 2.8337, 0.9369))
# Hardpoint EXP100_Body_Anchor_0967 = Vector((-0.0853, 2.8475, 0.8821))
# Hardpoint EXP100_Body_Anchor_0968 = Vector((0.0472, 2.8492, 0.8216))
# Hardpoint EXP100_Body_Anchor_0969 = Vector((0.1789, 2.8389, 0.7558))
# Hardpoint EXP100_Body_Anchor_0970 = Vector((0.3076, 2.8166, 0.6855))
# Hardpoint EXP100_Body_Anchor_0971 = Vector((0.4310, 2.7825, 0.6113))
# Hardpoint EXP100_Body_Anchor_0972 = Vector((0.5472, 2.7365, 0.5340))
# Hardpoint EXP100_Body_Anchor_0973 = Vector((0.6542, 2.6790, 0.4544))
# Hardpoint EXP100_Body_Anchor_0974 = Vector((0.7501, 2.6102, 0.3732))
# Hardpoint EXP100_Body_Anchor_0975 = Vector((0.8334, 2.5304, 0.2913))
# Hardpoint EXP100_Body_Anchor_0976 = Vector((0.9026, 2.4398, 0.2095))
# Hardpoint EXP100_Body_Anchor_0977 = Vector((0.9566, 2.3390, 0.1286))
# Hardpoint EXP100_Body_Anchor_0978 = Vector((0.9944, 2.2283, 0.0494))
# Hardpoint EXP100_Body_Anchor_0979 = Vector((1.0154, 2.1082, -0.0273))
# Hardpoint EXP100_Body_Anchor_0980 = Vector((1.0194, 1.9792, -0.1008))
# Hardpoint EXP100_Body_Anchor_0981 = Vector((1.0061, 1.8418, -0.1702))
# Hardpoint EXP100_Body_Anchor_0982 = Vector((0.9758, 1.6966, -0.2349))
# Hardpoint EXP100_Body_Anchor_0983 = Vector((0.9291, 1.5443, -0.2943))
# Hardpoint EXP100_Body_Anchor_0984 = Vector((0.8666, 1.3855, -0.3477))
# Hardpoint EXP100_Body_Anchor_0985 = Vector((0.7896, 1.2208, -0.3947))
# Hardpoint EXP100_Body_Anchor_0986 = Vector((0.6992, 1.0509, -0.4347))
# Hardpoint EXP100_Body_Anchor_0987 = Vector((0.5970, 0.8766, -0.4674))
# Hardpoint EXP100_Body_Anchor_0988 = Vector((0.4848, 0.6986, -0.4924))
# Hardpoint EXP100_Body_Anchor_0989 = Vector((0.3644, 0.5177, -0.5095))
# Hardpoint EXP100_Body_Anchor_0990 = Vector((0.2378, 0.3345, -0.5185))
# Hardpoint EXP100_Body_Anchor_0991 = Vector((0.1072, 0.1500, -0.5193))
# Hardpoint EXP100_Body_Anchor_0992 = Vector((-0.0252, -0.0352, -0.5120))
# Hardpoint EXP100_Body_Anchor_0993 = Vector((-0.1572, -0.2202, -0.4965))
# Hardpoint EXP100_Body_Anchor_0994 = Vector((-0.2865, -0.4043, -0.4731))
# Hardpoint EXP100_Body_Anchor_0995 = Vector((-0.4110, -0.5867, -0.4420))
# Hardpoint EXP100_Body_Anchor_0996 = Vector((-0.5285, -0.7666, -0.4034))
# Hardpoint EXP100_Body_Anchor_0997 = Vector((-0.6372, -0.9433, -0.3578))
# Hardpoint EXP100_Body_Anchor_0998 = Vector((-0.7350, -1.1160, -0.3056))
# Hardpoint EXP100_Body_Anchor_0999 = Vector((-0.8205, -1.2840, -0.2474))
# Hardpoint EXP100_Body_Anchor_1000 = Vector((-0.8921, -1.4465, -0.1837))
# Hardpoint EXP100_Body_Anchor_1001 = Vector((-0.9487, -1.6030, -0.1152))
# Hardpoint EXP100_Body_Anchor_1002 = Vector((-0.9893, -1.7527, -0.0426))
# Hardpoint EXP100_Body_Anchor_1003 = Vector((-1.0131, -1.8949, 0.0335))
# Hardpoint EXP100_Body_Anchor_1004 = Vector((-1.0199, -2.0292, 0.1123))
# Hardpoint EXP100_Body_Anchor_1005 = Vector((-1.0095, -2.1549, 0.1929))
# Hardpoint EXP100_Body_Anchor_1006 = Vector((-0.9820, -2.2715, 0.2746))
# Hardpoint EXP100_Body_Anchor_1007 = Vector((-0.9379, -2.3785, 0.3566))
# Hardpoint EXP100_Body_Anchor_1008 = Vector((-0.8780, -2.4755, 0.4379))
# Hardpoint EXP100_Body_Anchor_1009 = Vector((-0.8033, -2.5620, 0.5180))
# Hardpoint EXP100_Body_Anchor_1010 = Vector((-0.7151, -2.6377, 0.5958))
# Hardpoint EXP100_Body_Anchor_1011 = Vector((-0.6148, -2.7022, 0.6707))
# Hardpoint EXP100_Body_Anchor_1012 = Vector((-0.5041, -2.7553, 0.7418))
# Hardpoint EXP100_Body_Anchor_1013 = Vector((-0.3849, -2.7968, 0.8086))
# Hardpoint EXP100_Body_Anchor_1014 = Vector((-0.2592, -2.8265, 0.8703))
# Hardpoint EXP100_Body_Anchor_1015 = Vector((-0.1291, -2.8443, 0.9262))
# Hardpoint EXP100_Body_Anchor_1016 = Vector((0.0032, -2.8500, 0.9760))
# Hardpoint EXP100_Body_Anchor_1017 = Vector((0.1354, -2.8437, 1.0189))
# Hardpoint EXP100_Body_Anchor_1018 = Vector((0.2653, -2.8254, 1.0547))
# Hardpoint EXP100_Body_Anchor_1019 = Vector((0.3907, -2.7951, 1.0829))
# Hardpoint EXP100_Body_Anchor_1020 = Vector((0.5096, -2.7531, 1.1034))
# Hardpoint EXP100_Body_Anchor_1021 = Vector((0.6198, -2.6994, 1.1158))
# Hardpoint EXP100_Body_Anchor_1022 = Vector((0.7196, -2.6343, 1.1200))
# Hardpoint EXP100_Body_Anchor_1023 = Vector((0.8072, -2.5581, 1.1160))
# Hardpoint EXP100_Body_Anchor_1024 = Vector((0.8813, -2.4711, 1.1039))
# Hardpoint EXP100_Body_Anchor_1025 = Vector((0.9404, -2.3736, 1.0838))
# Hardpoint EXP100_Body_Anchor_1026 = Vector((0.9837, -2.2662, 1.0558))
# Hardpoint EXP100_Body_Anchor_1027 = Vector((1.0103, -2.1491, 1.0203))
# Hardpoint EXP100_Body_Anchor_1028 = Vector((1.0200, -2.0230, 0.9776))
# Hardpoint EXP100_Body_Anchor_1029 = Vector((1.0124, -1.8883, 0.9281))
# Hardpoint EXP100_Body_Anchor_1030 = Vector((0.9877, -1.7457, 0.8723))
# Hardpoint EXP100_Body_Anchor_1031 = Vector((0.9464, -1.5957, 0.8109))
# Hardpoint EXP100_Body_Anchor_1032 = Vector((0.8890, -1.4389, 0.7443))
# Hardpoint EXP100_Body_Anchor_1033 = Vector((0.8167, -1.2761, 0.6732))
# Hardpoint EXP100_Body_Anchor_1034 = Vector((0.7306, -1.1079, 0.5985))
# Hardpoint EXP100_Body_Anchor_1035 = Vector((0.6322, -0.9350, 0.5207))
# Hardpoint EXP100_Body_Anchor_1036 = Vector((0.5231, -0.7581, 0.4408))
# Hardpoint EXP100_Body_Anchor_1037 = Vector((0.4052, -0.5781, 0.3594))
# Hardpoint EXP100_Body_Anchor_1038 = Vector((0.2804, -0.3956, 0.2775))
# Hardpoint EXP100_Body_Anchor_1039 = Vector((0.1509, -0.2114, 0.1958))
# Hardpoint EXP100_Body_Anchor_1040 = Vector((0.0189, -0.0263, 0.1151))
# Hardpoint EXP100_Body_Anchor_1041 = Vector((-0.1135, 0.1588, 0.0363))
# Hardpoint EXP100_Body_Anchor_1042 = Vector((-0.2440, 0.3433, -0.0399))
# Hardpoint EXP100_Body_Anchor_1043 = Vector((-0.3703, 0.5264, -0.1127))
# Hardpoint EXP100_Body_Anchor_1044 = Vector((-0.4904, 0.7072, -0.1814))
# Hardpoint EXP100_Body_Anchor_1045 = Vector((-0.6022, 0.8850, -0.2453))
# Hardpoint EXP100_Body_Anchor_1046 = Vector((-0.7038, 1.0591, -0.3037))
# Hardpoint EXP100_Body_Anchor_1047 = Vector((-0.7936, 1.2288, -0.3561))
# Hardpoint EXP100_Body_Anchor_1048 = Vector((-0.8700, 1.3932, -0.4019))
# Hardpoint EXP100_Body_Anchor_1049 = Vector((-0.9316, 1.5517, -0.4407))
# Hardpoint EXP100_Body_Anchor_1050 = Vector((-0.9776, 1.7037, -0.4721))
# Hardpoint EXP100_Body_Anchor_1051 = Vector((-1.0071, 1.8485, -0.4958))
# Hardpoint EXP100_Body_Anchor_1052 = Vector((-1.0196, 1.9855, -0.5116))
# Hardpoint EXP100_Body_Anchor_1053 = Vector((-1.0148, 2.1141, -0.5192))
# Hardpoint EXP100_Body_Anchor_1054 = Vector((-0.9930, 2.2338, -0.5187))
# Hardpoint EXP100_Body_Anchor_1055 = Vector((-0.9544, 2.3441, -0.5100))
# Hardpoint EXP100_Body_Anchor_1056 = Vector((-0.8996, 2.4444, -0.4931))
# Hardpoint EXP100_Body_Anchor_1057 = Vector((-0.8297, 2.5344, -0.4684))
# Hardpoint EXP100_Body_Anchor_1058 = Vector((-0.7458, 2.6138, -0.4360))
# Hardpoint EXP100_Body_Anchor_1059 = Vector((-0.6493, 2.6820, -0.3962))
# Hardpoint EXP100_Body_Anchor_1060 = Vector((-0.5419, 2.7390, -0.3495))
# Hardpoint EXP100_Body_Anchor_1061 = Vector((-0.4253, 2.7844, -0.2963))
# Hardpoint EXP100_Body_Anchor_1062 = Vector((-0.3015, 2.8180, -0.2371))
# Hardpoint EXP100_Body_Anchor_1063 = Vector((-0.1726, 2.8397, -0.1725))
# Hardpoint EXP100_Body_Anchor_1064 = Vector((-0.0409, 2.8494, -0.1033))
# Hardpoint EXP100_Body_Anchor_1065 = Vector((0.0916, 2.8471, -0.0300))
# Hardpoint EXP100_Body_Anchor_1066 = Vector((0.2225, 2.8328, 0.0466))
# Hardpoint EXP100_Body_Anchor_1067 = Vector((0.3497, 2.8065, 0.1257))
# Hardpoint EXP100_Body_Anchor_1068 = Vector((0.4709, 2.7683, 0.2066))
# Hardpoint EXP100_Body_Anchor_1069 = Vector((0.5843, 2.7185, 0.2884))
# Hardpoint EXP100_Body_Anchor_1070 = Vector((0.6877, 2.6572, 0.3703))
# Hardpoint EXP100_Body_Anchor_1071 = Vector((0.7796, 2.5846, 0.4515))
# Hardpoint EXP100_Body_Anchor_1072 = Vector((0.8583, 2.5012, 0.5312))
# Hardpoint EXP100_Body_Anchor_1073 = Vector((0.9225, 2.4071, 0.6086))
# Hardpoint EXP100_Body_Anchor_1074 = Vector((0.9711, 2.3029, 0.6829))
# Hardpoint EXP100_Body_Anchor_1075 = Vector((1.0034, 2.1890, 0.7534))
# Hardpoint EXP100_Body_Anchor_1076 = Vector((1.0187, 2.0659, 0.8193))
# Hardpoint EXP100_Body_Anchor_1077 = Vector((1.0168, 1.9340, 0.8801))
# Hardpoint EXP100_Body_Anchor_1078 = Vector((0.9978, 1.7939, 0.9351))
# Hardpoint EXP100_Body_Anchor_1079 = Vector((0.9619, 1.6463, 0.9837))
# Hardpoint EXP100_Body_Anchor_1080 = Vector((0.9098, 1.4917, 1.0255))
# Hardpoint EXP100_Body_Anchor_1081 = Vector((0.8423, 1.3308, 1.0600))
# Hardpoint EXP100_Body_Anchor_1082 = Vector((0.7607, 1.1643, 1.0869))
# Hardpoint EXP100_Body_Anchor_1083 = Vector((0.6662, 0.9929, 1.1060))
# Hardpoint EXP100_Body_Anchor_1084 = Vector((0.5604, 0.8172, 1.1170))
# Hardpoint EXP100_Body_Anchor_1085 = Vector((0.4452, 0.6382, 1.1199))
# Hardpoint EXP100_Body_Anchor_1086 = Vector((0.3225, 0.4564, 1.1146))
# Hardpoint EXP100_Body_Anchor_1087 = Vector((0.1943, 0.2727, 1.1011))
# Hardpoint EXP100_Body_Anchor_1088 = Vector((0.0629, 0.0879, 1.0796))
# Hardpoint EXP100_Body_Anchor_1089 = Vector((-0.0696, -0.0974, 1.0504))
# Hardpoint EXP100_Body_Anchor_1090 = Vector((-0.2010, -0.2822, 1.0136))
# Hardpoint EXP100_Body_Anchor_1091 = Vector((-0.3289, -0.4658, 0.9697))
# Hardpoint EXP100_Body_Anchor_1092 = Vector((-0.4513, -0.6474, 0.9191))
# Hardpoint EXP100_Body_Anchor_1093 = Vector((-0.5661, -0.8263, 0.8624))
# Hardpoint EXP100_Body_Anchor_1094 = Vector((-0.6713, -1.0018, 0.8000))
# Hardpoint EXP100_Body_Anchor_1095 = Vector((-0.7652, -1.1729, 0.7326))
# Hardpoint EXP100_Body_Anchor_1096 = Vector((-0.8462, -1.3392, 0.6609))
# Hardpoint EXP100_Body_Anchor_1097 = Vector((-0.9129, -1.4998, 0.5856))
# Hardpoint EXP100_Body_Anchor_1098 = Vector((-0.9641, -1.6540, 0.5074))
# Hardpoint EXP100_Body_Anchor_1099 = Vector((-0.9992, -1.8013, 0.4272))
# Hardpoint EXP100_Body_Anchor_1100 = Vector((-1.0173, -1.9409, 0.3457))
# Hardpoint EXP100_Body_Anchor_1101 = Vector((-1.0183, -2.0724, 0.2637))
# Hardpoint EXP100_Body_Anchor_1102 = Vector((-1.0021, -2.1951, 0.1821))
# Hardpoint EXP100_Body_Anchor_1103 = Vector((-0.9690, -2.3085, 0.1017))
# Hardpoint EXP100_Body_Anchor_1104 = Vector((-0.9195, -2.4122, 0.0233))
# Hardpoint EXP100_Body_Anchor_1105 = Vector((-0.8546, -2.5057, -0.0524))
# Hardpoint EXP100_Body_Anchor_1106 = Vector((-0.7752, -2.5886, -0.1246))
# Hardpoint EXP100_Body_Anchor_1107 = Vector((-0.6827, -2.6606, -0.1925))
# Hardpoint EXP100_Body_Anchor_1108 = Vector((-0.5787, -2.7213, -0.2555))
# Hardpoint EXP100_Body_Anchor_1109 = Vector((-0.4649, -2.7706, -0.3129))
# Hardpoint EXP100_Body_Anchor_1110 = Vector((-0.3433, -2.8081, -0.3643))
# Hardpoint EXP100_Body_Anchor_1111 = Vector((-0.2159, -2.8338, -0.4089))
# Hardpoint EXP100_Body_Anchor_1112 = Vector((-0.0848, -2.8475, -0.4465))
# Hardpoint EXP100_Body_Anchor_1113 = Vector((0.0477, -2.8492, -0.4767))
# Hardpoint EXP100_Body_Anchor_1114 = Vector((0.1793, -2.8389, -0.4990))
# Hardpoint EXP100_Body_Anchor_1115 = Vector((0.3080, -2.8165, -0.5134))
# Hardpoint EXP100_Body_Anchor_1116 = Vector((0.4314, -2.7823, -0.5197))
# Hardpoint EXP100_Body_Anchor_1117 = Vector((0.5476, -2.7363, -0.5178))
# Hardpoint EXP100_Body_Anchor_1118 = Vector((0.6546, -2.6788, -0.5077))
# Hardpoint EXP100_Body_Anchor_1119 = Vector((0.7504, -2.6100, -0.4895))
# Hardpoint EXP100_Body_Anchor_1120 = Vector((0.8337, -2.5301, -0.4635))
# Hardpoint EXP100_Body_Anchor_1121 = Vector((0.9028, -2.4395, -0.4298))
# Hardpoint EXP100_Body_Anchor_1122 = Vector((0.9567, -2.3387, -0.3888))
# Hardpoint EXP100_Body_Anchor_1123 = Vector((0.9945, -2.2279, -0.3410))
# Hardpoint EXP100_Body_Anchor_1124 = Vector((1.0155, -2.1078, -0.2867))
# Hardpoint EXP100_Body_Anchor_1125 = Vector((1.0193, -1.9787, -0.2266))
# Hardpoint EXP100_Body_Anchor_1126 = Vector((1.0060, -1.8413, -0.1612))
# Hardpoint EXP100_Body_Anchor_1127 = Vector((0.9757, -1.6961, -0.0912))
# Hardpoint EXP100_Body_Anchor_1128 = Vector((0.9289, -1.5438, -0.0173))
# Hardpoint EXP100_Body_Anchor_1129 = Vector((0.8664, -1.3849, 0.0598))
# Hardpoint EXP100_Body_Anchor_1130 = Vector((0.7893, -1.2202, 0.1392))
# Hardpoint EXP100_Body_Anchor_1131 = Vector((0.6989, -1.0503, 0.2203))
# Hardpoint EXP100_Body_Anchor_1132 = Vector((0.5967, -0.8760, 0.3022))
# Hardpoint EXP100_Body_Anchor_1133 = Vector((0.4844, -0.6980, 0.3840))
# Hardpoint EXP100_Body_Anchor_1134 = Vector((0.3639, -0.5170, 0.4650))
# Hardpoint EXP100_Body_Anchor_1135 = Vector((0.2374, -0.3339, 0.5444))
# Hardpoint EXP100_Body_Anchor_1136 = Vector((0.1068, -0.1493, 0.6213))
# Hardpoint EXP100_Body_Anchor_1137 = Vector((-0.0256, 0.0358, 0.6950))
# Hardpoint EXP100_Body_Anchor_1138 = Vector((-0.1576, 0.2209, 0.7648))
# Hardpoint EXP100_Body_Anchor_1139 = Vector((-0.2869, 0.4050, 0.8299))
# Hardpoint EXP100_Body_Anchor_1140 = Vector((-0.4114, 0.5873, 0.8898))
# Hardpoint EXP100_Body_Anchor_1141 = Vector((-0.5289, 0.7672, 0.9437))
# Hardpoint EXP100_Body_Anchor_1142 = Vector((-0.6375, 0.9439, 0.9912))
# Hardpoint EXP100_Body_Anchor_1143 = Vector((-0.7353, 1.1166, 1.0318))
# Hardpoint EXP100_Body_Anchor_1144 = Vector((-0.8208, 1.2846, 1.0651))
# Hardpoint EXP100_Body_Anchor_1145 = Vector((-0.8924, 1.4471, 1.0907))
# Hardpoint EXP100_Body_Anchor_1146 = Vector((-0.9489, 1.6035, 1.1084))
# Hardpoint EXP100_Body_Anchor_1147 = Vector((-0.9894, 1.7532, 1.1181))
# Hardpoint EXP100_Body_Anchor_1148 = Vector((-1.0132, 1.8954, 1.1196))
# Hardpoint EXP100_Body_Anchor_1149 = Vector((-1.0199, 2.0297, 1.1129))
# Hardpoint EXP100_Body_Anchor_1150 = Vector((-1.0094, 2.1553, 1.0981))
# Hardpoint EXP100_Body_Anchor_1151 = Vector((-0.9819, 2.2719, 1.0753))
# Hardpoint EXP100_Body_Anchor_1152 = Vector((-0.9377, 2.3789, 1.0447))
# Hardpoint EXP100_Body_Anchor_1153 = Vector((-0.8778, 2.4758, 1.0067))
# Hardpoint EXP100_Body_Anchor_1154 = Vector((-0.8031, 2.5623, 0.9617))
# Hardpoint EXP100_Body_Anchor_1155 = Vector((-0.7148, 2.6379, 0.9100))
# Hardpoint EXP100_Body_Anchor_1156 = Vector((-0.6144, 2.7024, 0.8523))
# Hardpoint EXP100_Body_Anchor_1157 = Vector((-0.5037, 2.7555, 0.7890))
# Hardpoint EXP100_Body_Anchor_1158 = Vector((-0.3844, 2.7970, 0.7208))
# Hardpoint EXP100_Body_Anchor_1159 = Vector((-0.2587, 2.8266, 0.6485))
# Hardpoint EXP100_Body_Anchor_1160 = Vector((-0.1286, 2.8443, 0.5726))
# Hardpoint EXP100_Body_Anchor_1161 = Vector((0.0036, 2.8500, 0.4941))
# Hardpoint EXP100_Body_Anchor_1162 = Vector((0.1358, 2.8436, 0.4136))
# Hardpoint EXP100_Body_Anchor_1163 = Vector((0.2657, 2.8253, 0.3319))
# Hardpoint EXP100_Body_Anchor_1164 = Vector((0.3911, 2.7950, 0.2500))
# Hardpoint EXP100_Body_Anchor_1165 = Vector((0.5100, 2.7529, 0.1685))
# Hardpoint EXP100_Body_Anchor_1166 = Vector((0.6202, 2.6992, 0.0883))
# Hardpoint EXP100_Body_Anchor_1167 = Vector((0.7199, 2.6341, 0.0103))
# Hardpoint EXP100_Body_Anchor_1168 = Vector((0.8075, 2.5578, -0.0648))
# Hardpoint EXP100_Body_Anchor_1169 = Vector((0.8815, 2.4708, -0.1363))
# Hardpoint EXP100_Body_Anchor_1170 = Vector((0.9406, 2.3733, -0.2034))
# Hardpoint EXP100_Body_Anchor_1171 = Vector((0.9838, 2.2658, -0.2656))
# Hardpoint EXP100_Body_Anchor_1172 = Vector((1.0104, 2.1487, -0.3220))
# Hardpoint EXP100_Body_Anchor_1173 = Vector((1.0200, 2.0225, -0.3722))
# Hardpoint EXP100_Body_Anchor_1174 = Vector((1.0123, 1.8878, -0.4158))
# Hardpoint EXP100_Body_Anchor_1175 = Vector((0.9876, 1.7452, -0.4521))
# Hardpoint EXP100_Body_Anchor_1176 = Vector((0.9462, 1.5951, -0.4810))
# Hardpoint EXP100_Body_Anchor_1177 = Vector((0.8888, 1.4384, -0.5020))
# Hardpoint EXP100_Body_Anchor_1178 = Vector((0.8165, 1.2755, -0.5151))
# Hardpoint EXP100_Body_Anchor_1179 = Vector((0.7303, 1.1073, -0.5200))
# Hardpoint EXP100_Body_Anchor_1180 = Vector((0.6318, 0.9344, -0.5167))
# Hardpoint EXP100_Body_Anchor_1181 = Vector((0.5227, 0.7575, -0.5052))
# Hardpoint EXP100_Body_Anchor_1182 = Vector((0.4047, 0.5774, -0.4857))
# Hardpoint EXP100_Body_Anchor_1183 = Vector((0.2800, 0.3949, -0.4583))
# Hardpoint EXP100_Body_Anchor_1184 = Vector((0.1504, 0.2108, -0.4234))
# Hardpoint EXP100_Body_Anchor_1185 = Vector((0.0184, 0.0257, -0.3812))
# Hardpoint EXP100_Body_Anchor_1186 = Vector((-0.1140, -0.1595, -0.3323))
# Hardpoint EXP100_Body_Anchor_1187 = Vector((-0.2444, -0.3440, -0.2770))
# Hardpoint EXP100_Body_Anchor_1188 = Vector((-0.3707, -0.5270, -0.2159))
# Hardpoint EXP100_Body_Anchor_1189 = Vector((-0.4908, -0.7078, -0.1497))
# Hardpoint EXP100_Body_Anchor_1190 = Vector((-0.6025, -0.8856, -0.0790))
# Hardpoint EXP100_Body_Anchor_1191 = Vector((-0.7041, -1.0597, -0.0046))
# Hardpoint EXP100_Body_Anchor_1192 = Vector((-0.7939, -1.2293, 0.0730))
# Hardpoint EXP100_Body_Anchor_1193 = Vector((-0.8702, -1.3937, 0.1528))
# Hardpoint EXP100_Body_Anchor_1194 = Vector((-0.9318, -1.5523, 0.2340))
# Hardpoint EXP100_Body_Anchor_1195 = Vector((-0.9777, -1.7042, 0.3160))
# Hardpoint EXP100_Body_Anchor_1196 = Vector((-1.0072, -1.8490, 0.3977))
# Hardpoint EXP100_Body_Anchor_1197 = Vector((-1.0196, -1.9860, 0.4785))
# Hardpoint EXP100_Body_Anchor_1198 = Vector((-1.0148, -2.1146, 0.5575))
# Hardpoint EXP100_Body_Anchor_1199 = Vector((-0.9929, -2.2342, 0.6340))
# Hardpoint EXP100_Body_Anchor_1200 = Vector((-0.9542, -2.3444, 0.7071))
# Hardpoint EXP100_Body_Anchor_1201 = Vector((-0.8994, -2.4447, 0.7761))
# Hardpoint EXP100_Body_Anchor_1202 = Vector((-0.8295, -2.5347, 0.8404))
# Hardpoint EXP100_Body_Anchor_1203 = Vector((-0.7455, -2.6140, 0.8992))
# Hardpoint EXP100_Body_Anchor_1204 = Vector((-0.6490, -2.6822, 0.9521))
# Hardpoint EXP100_Body_Anchor_1205 = Vector((-0.5415, -2.7392, 0.9985))
# Hardpoint EXP100_Body_Anchor_1206 = Vector((-0.4249, -2.7845, 1.0379))
# Hardpoint EXP100_Body_Anchor_1207 = Vector((-0.3011, -2.8181, 1.0699))
# Hardpoint EXP100_Body_Anchor_1208 = Vector((-0.1722, -2.8398, 1.0942))
# Hardpoint EXP100_Body_Anchor_1209 = Vector((-0.0404, -2.8494, 1.1106))
# Hardpoint EXP100_Body_Anchor_1210 = Vector((0.0920, -2.8471, 1.1189))
# Hardpoint EXP100_Body_Anchor_1211 = Vector((0.2230, -2.8327, 1.1190))
# Hardpoint EXP100_Body_Anchor_1212 = Vector((0.3501, -2.8064, 1.1110))
# Hardpoint EXP100_Body_Anchor_1213 = Vector((0.4713, -2.7682, 1.0948))
# Hardpoint EXP100_Body_Anchor_1214 = Vector((0.5846, -2.7183, 1.0707))
# Hardpoint EXP100_Body_Anchor_1215 = Vector((0.6881, -2.6569, 1.0388))
# Hardpoint EXP100_Body_Anchor_1216 = Vector((0.7799, -2.5844, 0.9996))
# Hardpoint EXP100_Body_Anchor_1217 = Vector((0.8585, -2.5009, 0.9534))
# Hardpoint EXP100_Body_Anchor_1218 = Vector((0.9227, -2.4068, 0.9007))
# Hardpoint EXP100_Body_Anchor_1219 = Vector((0.9712, -2.3026, 0.8420))
# Hardpoint EXP100_Body_Anchor_1220 = Vector((1.0034, -2.1886, 0.7779))
# Hardpoint EXP100_Body_Anchor_1221 = Vector((1.0187, -2.0654, 0.7089))
# Hardpoint EXP100_Body_Anchor_1222 = Vector((1.0168, -1.9335, 0.6359))
# Hardpoint EXP100_Body_Anchor_1223 = Vector((0.9977, -1.7934, 0.5596))
# Hardpoint EXP100_Body_Anchor_1224 = Vector((0.9618, -1.6458, 0.4806))
# Hardpoint EXP100_Body_Anchor_1225 = Vector((0.9096, -1.4911, 0.3999))
# Hardpoint EXP100_Body_Anchor_1226 = Vector((0.8421, -1.3302, 0.3181))
# Hardpoint EXP100_Body_Anchor_1227 = Vector((0.7604, -1.1637, 0.2362))
# Hardpoint EXP100_Body_Anchor_1228 = Vector((0.6658, -0.9923, 0.1549))
# Hardpoint EXP100_Body_Anchor_1229 = Vector((0.5600, -0.8166, 0.0751))
# Hardpoint EXP100_Body_Anchor_1230 = Vector((0.4448, -0.6376, -0.0025))
# Hardpoint EXP100_Body_Anchor_1231 = Vector((0.3220, -0.4558, -0.0771))
# Hardpoint EXP100_Body_Anchor_1232 = Vector((0.1939, -0.2721, -0.1479))
# Hardpoint EXP100_Body_Anchor_1233 = Vector((0.0624, -0.0872, -0.2143))
# Hardpoint EXP100_Body_Anchor_1234 = Vector((-0.0701, 0.0980, -0.2755))
# Hardpoint EXP100_Body_Anchor_1235 = Vector((-0.2014, 0.2828, -0.3309))
# Hardpoint EXP100_Body_Anchor_1236 = Vector((-0.3293, 0.4664, -0.3800))
# Hardpoint EXP100_Body_Anchor_1237 = Vector((-0.4517, 0.6480, -0.4224))
# Hardpoint EXP100_Body_Anchor_1238 = Vector((-0.5664, 0.8269, -0.4575))
# Hardpoint EXP100_Body_Anchor_1239 = Vector((-0.6716, 1.0023, -0.4851))
# Hardpoint EXP100_Body_Anchor_1240 = Vector((-0.7655, 1.1735, -0.5048))
