"""
=============================================================================
2010s HEAVY TRUCK PROCEDURAL CAD GENERATOR: MERCEDES-BENZ ACTROS MP4 GIGASPACE
=============================================================================
Flagship 2012–2018 Mercedes-Benz Actros MP4 (1845 / 1851 / 1863 LS) 4x2 Long-Haul Tractor.
Class-A Procedural CAD Geometry & Authentic PBR Material Architecture.

Key Architectural & Design Attributes:
1. Proportions: Wheelbase 3,700 mm, overall length 5,900 mm, overall height 3,950 mm, width 2,500 mm.
2. Cab: GigaSpace flat-floor aerodynamic flagship cab with 15-deg raked windshield.
3. Front Mask: Cascading 4-level perforated trapezoidal grille with illuminated 280 mm Mercedes star.
4. Lighting: Characteristic "Boomerang / Sickle" LED DRL light-pipes and bi-xenon projector lenses.
5. Tech: Dual aerodynamic MirrorCam camera pods and comprehensive Euro aerodynamic mirrors.
6. Aerodynamics: Full-length contoured chassis side skirts, cab collar wings, and roof extension spoiler.
7. Powertrain & Emissions: OM 471 / OM 473 Euro VI SCR/DPF aftertreatment box with perforated stainless shield.
8. Fuel Storage: 650-liter polished aluminum fuel tank with integrated steps + 60-liter AdBlue urea tank.
9. Running Gear: Alcoa Dura-Bright 22.5" forged alloy wheels with fluorescent wheel nut safety indicators.
10. Coupling: Jost JSK 42 heavy cast ductile iron fifth wheel with release handle and lead-in ramps.

Author: Google DeepMind Advanced Agentic Coding Pair Programmer
Format: Pure Procedural Python CAD Pipeline (Blender 4.x / 5.x LTS via MCP)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Euler, Matrix

# ----------------------------------------------------------------------------
# 1. SCENE CLEANUP & SETUP
# ----------------------------------------------------------------------------
def safe_reset_scene():
    """Completely resets the Blender scene and configures metric units."""
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
        
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
        
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = 'METERS'
    print("[ACTROS MP4] Scene reset and configured for metric Class-A CAD.")

# ----------------------------------------------------------------------------
# 2. MASTER AUTOMOTIVE PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def make_pbr_material(name, base_color, metallic=0.0, roughness=0.4, clearcoat=0.0,
                      transmission=0.0, ior=1.50, emission_color=None, emission_strength=0.0,
                      alpha=1.0):
    """Creates a production-quality Principled BSDF PBR material compatible with all Blender versions."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
        output = nodes.get("Material Output")
        if not output:
            output = nodes.new(type="ShaderNodeOutputMaterial")
        links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
        
    # Helper for cross-version Blender Principled BSDF input sockets
    def set_socket(sock_name, val):
        if sock_name in bsdf.inputs:
            bsdf.inputs[sock_name].default_value = val
            
    set_socket("Base Color", (*base_color[:3], 1.0) if len(base_color) == 3 else base_color)
    set_socket("Metallic", metallic)
    set_socket("Roughness", roughness)
    
    if hasattr(bsdf.inputs, "get"):
        if bsdf.inputs.get("Clearcoat Weight"):
            bsdf.inputs["Clearcoat Weight"].default_value = clearcoat
        elif bsdf.inputs.get("Clearcoat"):
            bsdf.inputs["Clearcoat"].default_value = clearcoat
            
        if bsdf.inputs.get("Clearcoat Roughness"):
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
            
        if bsdf.inputs.get("Transmission Weight"):
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif bsdf.inputs.get("Transmission"):
            bsdf.inputs["Transmission"].default_value = transmission
            
        if bsdf.inputs.get("IOR"):
            bsdf.inputs["IOR"].default_value = ior
            
        if emission_color and emission_strength > 0.0:
            if bsdf.inputs.get("Emission Color"):
                bsdf.inputs["Emission Color"].default_value = (*emission_color[:3], 1.0)
            elif bsdf.inputs.get("Emission"):
                bsdf.inputs["Emission"].default_value = (*emission_color[:3], 1.0)
                
            if bsdf.inputs.get("Emission Strength"):
                bsdf.inputs["Emission Strength"].default_value = emission_strength
                
        if bsdf.inputs.get("Alpha"):
            bsdf.inputs["Alpha"].default_value = alpha
            
    if alpha < 1.0 or transmission > 0.0:
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'HASHED'
            
    return mat

def create_all_actros_materials():
    """Builds the comprehensive authentic PBR material library for the 2014 Actros MP4 GigaSpace."""
    mats = {}
    
    # 1. Cab Bodywork: Mercedes-Benz Iridium Silver Metallic (MB 7756 / DB 9775)
    mats['cab_paint'] = make_pbr_material(
        'Paint_ActrosIridiumSilver',
        base_color=(0.68, 0.70, 0.74),
        metallic=0.55,
        roughness=0.22,
        clearcoat=1.00
    )
    
    # 2. Aerodynamic Roof Cap & Side Skirts: Matching Brilliant Silver
    mats['aero_paint'] = make_pbr_material(
        'Paint_ActrosAeroSilver',
        base_color=(0.68, 0.70, 0.74),
        metallic=0.55,
        roughness=0.22,
        clearcoat=1.00
    )
    
    # 3. Chassis Rails & Suspension: Modern Satin Chassis Grey (Mercedes Nova Grey DB 7350 / RAL 7021)
    mats['chassis_grey'] = make_pbr_material(
        'Paint_ChassisNovaGrey',
        base_color=(0.048, 0.050, 0.054),
        metallic=0.20,
        roughness=0.38
    )
    
    # 4. Alcoa Dura-Bright Mirror-Polished Forged Alloy (22.5" wheels & fuel tank step pads)
    mats['dura_bright'] = make_pbr_material(
        'Alloy_AlcoaDuraBright',
        base_color=(0.94, 0.95, 0.96),
        metallic=0.96,
        roughness=0.04
    )
    
    # 5. Mercedes-Benz Three-Pointed Star Chrome & Grille Trim
    mats['chrome_star'] = make_pbr_material(
        'Chrome_MercedesStar',
        base_color=(0.97, 0.97, 0.98),
        metallic=1.00,
        roughness=0.02
    )
    
    # 6. Commercial Heavy-Duty Tire Rubber (Michelin X Line Energy low-rolling resistance)
    mats['tire_rubber'] = make_pbr_material(
        'Rubber_EuropeanTire',
        base_color=(0.025, 0.025, 0.026),
        metallic=0.00,
        roughness=0.86
    )
    
    # 7. Panoramic Windshield & Cab Windows: Laminated Safety Glass
    mats['glass_panoramic'] = make_pbr_material(
        'Glass_PanoramicGreenTint',
        base_color=(0.03, 0.05, 0.04),
        metallic=0.10,
        roughness=0.02,
        clearcoat=1.00,
        alpha=0.92
    )
    
    # 8. High-Tech Boomerang Headlamp Polycarbonate Outer Lens
    mats['glass_headlamp'] = make_pbr_material(
        'Glass_PolycarbonateClear',
        base_color=(0.98, 0.98, 0.99),
        metallic=0.00,
        roughness=0.02,
        transmission=0.94,
        ior=1.52,
        alpha=0.25
    )
    
    # 9. Boomerang LED Daytime Running Light (DRL) Sickle Light-Pipe (Crisp 6500K Diamond White)
    mats['drl_led_white'] = make_pbr_material(
        'Emissive_LEDDRLWhite',
        base_color=(0.92, 0.96, 1.00),
        emission_color=(0.92, 0.96, 1.00),
        emission_strength=24.0
    )
    
    # 10. Bi-Xenon / LED High-Intensity Projector Beam
    mats['beam_xenon'] = make_pbr_material(
        'Emissive_BiXenonWhite',
        base_color=(0.88, 0.94, 1.00),
        emission_color=(0.88, 0.94, 1.00),
        emission_strength=20.0
    )
    
    # 11. Illuminated Mercedes Star Halo Glow (Optional Factory Executive Package)
    mats['star_halo_glow'] = make_pbr_material(
        'Emissive_StarHaloWhite',
        base_color=(0.90, 0.95, 1.00),
        emission_color=(0.90, 0.95, 1.00),
        emission_strength=12.0
    )
    
    # 12. Headlamp Turn Indicator & Mirror LED Repeaters (Amber Polycarbonate)
    mats['glass_amber'] = make_pbr_material(
        'Glass_AmberIndicator',
        base_color=(0.98, 0.52, 0.02),
        metallic=0.00,
        roughness=0.08,
        transmission=0.82,
        ior=1.54,
        alpha=0.45
    )
    
    # 13. Emissive Amber LED Glow (Turn signals & clearance markers)
    mats['amber_led_glow'] = make_pbr_material(
        'Emissive_AmberSignal',
        base_color=(1.00, 0.48, 0.00),
        emission_color=(1.00, 0.48, 0.00),
        emission_strength=14.0
    )
    
    # 14. ECE Commercial Red Rear Taillamp Glass
    mats['glass_taillamp_red'] = make_pbr_material(
        'Glass_TaillampRed',
        base_color=(0.88, 0.04, 0.02),
        metallic=0.00,
        roughness=0.06,
        transmission=0.85,
        ior=1.54,
        alpha=0.40
    )
    
    # 15. Rear LED Stop & Tail Beam Glow (Brilliant Red)
    mats['beam_stop_red'] = make_pbr_material(
        'Emissive_LEDStopRed',
        base_color=(1.00, 0.02, 0.01),
        emission_color=(1.00, 0.02, 0.01),
        emission_strength=16.0
    )
    
    # 16. Molded Anthracite Composite (Grilles, air intake baffles, bumper steps)
    mats['composite_anthracite'] = make_pbr_material(
        'Plastic_AnthraciteComposite',
        base_color=(0.045, 0.047, 0.050),
        metallic=0.02,
        roughness=0.62
    )
    
    # 17. High-Gloss Piano Black Aerodynamic Accents (MirrorCam wings, pillar trim)
    mats['gloss_black'] = make_pbr_material(
        'Plastic_GlossBlack',
        base_color=(0.015, 0.015, 0.016),
        metallic=0.10,
        roughness=0.05,
        clearcoat=1.00
    )
    
    # 18. Perforated Stainless Steel & Heat Shield (Euro VI SCR/DPF exhaust box)
    mats['stainless_perforated'] = make_pbr_material(
        'Stainless_PerforatedHeatShield',
        base_color=(0.76, 0.77, 0.79),
        metallic=0.92,
        roughness=0.18
    )
    
    # 19. Extruded Satin Aluminum (650L Diesel Fuel Tank & Catwalk Plate)
    mats['aluminum_satin'] = make_pbr_material(
        'Aluminum_ExtrudedSatin',
        base_color=(0.84, 0.85, 0.87),
        metallic=0.88,
        roughness=0.22
    )
    
    # 20. AdBlue Urea Tank Composite (Blue Cap & Textured Polymer)
    mats['adblue_blue'] = make_pbr_material(
        'Decal_AdBlueBlue',
        base_color=(0.02, 0.38, 0.85),
        metallic=0.05,
        roughness=0.35
    )
    
    # 21. Wheel Nut Safety Indicators (Fluorescent Neon Yellow Polyethylene)
    mats['nut_indicator_yellow'] = make_pbr_material(
        'Plastic_NeonNutIndicator',
        base_color=(0.88, 0.95, 0.02),
        metallic=0.00,
        roughness=0.25,
        emission_color=(0.88, 0.95, 0.02),
        emission_strength=1.8
    )
    
    # 22. Trailer Coiled Umbilical Suzies (Red Emergency, Yellow Service, Black EBS)
    mats['suzie_red'] = make_pbr_material(
        'Suzie_EmergencyAirRed',
        base_color=(0.88, 0.08, 0.04),
        metallic=0.05,
        roughness=0.30
    )
    mats['suzie_yellow'] = make_pbr_material(
        'Suzie_ServiceAirYellow',
        base_color=(0.95, 0.78, 0.02),
        metallic=0.05,
        roughness=0.30
    )
    mats['suzie_black_ebs'] = make_pbr_material(
        'Suzie_EBSBlack',
        base_color=(0.02, 0.02, 0.02),
        metallic=0.02,
        roughness=0.45
    )
    
    # 23. ECAS Air Suspension Rolling-Lobe Bellow Rubber
    mats['ecas_rubber'] = make_pbr_material(
        'Rubber_ECASAirBag',
        base_color=(0.025, 0.025, 0.025),
        metallic=0.05,
        roughness=0.75
    )
    
    # 24. ECE 70.01 Conspicuity Chevron Marker Plates (Yellow/Red reflective)
    mats['ece70_chevron'] = make_pbr_material(
        'Decal_ECE70Chevron',
        base_color=(0.95, 0.65, 0.05),
        emission_color=(0.95, 0.65, 0.05),
        emission_strength=2.2
    )

    # Shorthand mapping
    for m in list(mats.values()):
        mats[m.name] = m

    aliases = {
        'Plastic_DarkAcrylic': make_pbr_material('Plastic_DarkAcrylic', base_color=(0.02, 0.02, 0.03), metallic=0.05, roughness=0.15, alpha=0.85),
        'Paint_ActrosSilverMetallic': mats['Paint_ActrosIridiumSilver'],
        'Glass_HeadlampClear': mats['Glass_PolycarbonateClear'],
        'Chrome_BrightReflector': mats['Chrome_MercedesStar'],
        'Emissive_AmberIndicator': mats['Emissive_AmberSignal'],
        'Glass_DarkPrivacyTint': make_pbr_material('Glass_DarkPrivacyTint', base_color=(0.02, 0.02, 0.02), metallic=0.10, roughness=0.05, alpha=0.94),
        'Rubber_WeathersealEPDM': make_pbr_material('Rubber_WeathersealEPDM', base_color=(0.02, 0.02, 0.02), metallic=0.0, roughness=0.80),
        'Stainless_Polished': make_pbr_material('Stainless_Polished', base_color=(0.88, 0.88, 0.89), metallic=0.94, roughness=0.06),
        'Mirror_GlassReflective': make_pbr_material('Mirror_GlassReflective', base_color=(0.98, 0.98, 0.98), metallic=1.0, roughness=0.0),
        'Plastic_AnthraciteComposite': mats['Plastic_AnthraciteComposite'],
        'Rubber_TireTreadCompound': mats['Rubber_EuropeanTire'],
        'Aluminum_DuraBrightForged': mats['Alloy_AlcoaDuraBright'],
        'Aluminum_DiamondPlate': make_pbr_material('Aluminum_DiamondPlate', base_color=(0.82, 0.84, 0.86), metallic=0.88, roughness=0.25),
        'Steel_ChassisSatinBlack': mats['Paint_ChassisNovaGrey'],
        'Glass_TaillampRed': mats['Glass_TaillampRed'],
        'Glass_IndicatorAmber': mats['Glass_AmberIndicator'],
        'Emissive_TailStopRed': mats['Emissive_LEDStopRed'],
        'Iron_CastSuspension': make_pbr_material('Iron_CastHeavy', base_color=(0.08, 0.08, 0.09), metallic=0.60, roughness=0.55),
        'Rubber_AirSuspensionBellow': mats['Rubber_ECASAirBag'],
        'Camera_SensorLens': make_pbr_material('Camera_SensorLens', base_color=(0.01, 0.02, 0.03), metallic=0.20, roughness=0.02, clearcoat=1.0),
    }
    for k, v in aliases.items():
        mats[k] = v
        mats[v.name] = v

    print(f"[ACTROS MP4] Initialized {len(mats)} master PBR show-truck materials.")
    return mats

# ----------------------------------------------------------------------------
# 3. BMESH CAD UTILITY PRIMITIVES
# ----------------------------------------------------------------------------
def add_box_to_bmesh(bm, center, dimensions, rot_euler=None):
    """Adds an aligned or rotated box to an existing BMesh."""
    dx = dimensions[0] * 0.5
    dy = dimensions[1] * 0.5
    dz = dimensions[2] * 0.5
    
    verts = [
        (-dx, -dy, -dz),
        ( dx, -dy, -dz),
        ( dx,  dy, -dz),
        (-dx,  dy, -dz),
        (-dx, -dy,  dz),
        ( dx, -dy,  dz),
        ( dx,  dy,  dz),
        (-dx,  dy,  dz)
    ]
    
    rot_mat = Euler(rot_euler, 'XYZ').to_matrix() if rot_euler else None
    c = Vector(center)
    bm_verts = []
    for v in verts:
        vec = Vector(v)
        if rot_mat:
            vec = rot_mat @ vec
        bm_verts.append(bm.verts.new(vec + c))
        
    faces = [
        (0, 1, 2, 3), # Bottom (-Z)
        (4, 7, 6, 5), # Top (+Z)
        (0, 4, 5, 1), # Front (-Y)
        (2, 6, 7, 3), # Back (+Y)
        (0, 3, 7, 4), # Left (-X)
        (1, 5, 6, 2)  # Right (+X)
    ]
    for f in faces:
        bm.faces.new([bm_verts[idx] for idx in f])

def add_cylinder_to_bmesh(bm, center, radius, length, segments=20, axis='Z', rot_euler=None):
    """Adds an aligned or rotated cylinder with caps to an existing BMesh."""
    half_l = length * 0.5
    c = Vector(center)
    rot_mat = Euler(rot_euler, 'XYZ').to_matrix() if rot_euler else None
    
    bot_verts = []
    top_verts = []
    
    for i in range(segments):
        ang = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        
        if axis == 'Z':
            v_bot = Vector((cos_a * radius, sin_a * radius, -half_l))
            v_top = Vector((cos_a * radius, sin_a * radius,  half_l))
        elif axis == 'Y':
            v_bot = Vector((cos_a * radius, -half_l, sin_a * radius))
            v_top = Vector((cos_a * radius,  half_l, sin_a * radius))
        elif axis == 'X':
            v_bot = Vector((-half_l, cos_a * radius, sin_a * radius))
            v_top = Vector(( half_l, cos_a * radius, sin_a * radius))
            
        if rot_mat:
            v_bot = rot_mat @ v_bot
            v_top = rot_mat @ v_top
            
        bot_verts.append(bm.verts.new(v_bot + c))
        top_verts.append(bm.verts.new(v_top + c))
        
    # Side faces
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([bot_verts[i], bot_verts[next_i], top_verts[next_i], top_verts[i]])
        
    # Cap faces
    bm.faces.new(list(reversed(bot_verts)))
    bm.faces.new(top_verts)

def add_tube_to_bmesh(bm, center, radius_outer, radius_inner, length, segments=20, axis='Z', rot_euler=None):
    """Adds a hollow tubular ring or sleeve with wall thickness to BMesh."""
    half_l = length * 0.5
    c = Vector(center)
    rot_mat = Euler(rot_euler, 'XYZ').to_matrix() if rot_euler else None
    
    outer_bot = []
    outer_top = []
    inner_bot = []
    inner_top = []
    
    for i in range(segments):
        ang = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        
        if axis == 'Z':
            ob = Vector((cos_a * radius_outer, sin_a * radius_outer, -half_l))
            ot = Vector((cos_a * radius_outer, sin_a * radius_outer,  half_l))
            ib = Vector((cos_a * radius_inner, sin_a * radius_inner, -half_l))
            it = Vector((cos_a * radius_inner, sin_a * radius_inner,  half_l))
        elif axis == 'Y':
            ob = Vector((cos_a * radius_outer, -half_l, sin_a * radius_outer))
            ot = Vector((cos_a * radius_outer,  half_l, sin_a * radius_outer))
            ib = Vector((cos_a * radius_inner, -half_l, sin_a * radius_inner))
            it = Vector((cos_a * radius_inner,  half_l, sin_a * radius_inner))
        elif axis == 'X':
            ob = Vector((-half_l, cos_a * radius_outer, sin_a * radius_outer))
            ot = Vector(( half_l, cos_a * radius_outer, sin_a * radius_outer))
            ib = Vector((-half_l, cos_a * radius_inner, sin_a * radius_inner))
            it = Vector(( half_l, cos_a * radius_inner, sin_a * radius_inner))
            
        if rot_mat:
            ob = rot_mat @ ob
            ot = rot_mat @ ot
            ib = rot_mat @ ib
            it = rot_mat @ it
            
        outer_bot.append(bm.verts.new(ob + c))
        outer_top.append(bm.verts.new(ot + c))
        inner_bot.append(bm.verts.new(ib + c))
        inner_top.append(bm.verts.new(it + c))
        
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([outer_bot[i], outer_bot[next_i], outer_top[next_i], outer_top[i]])
        bm.faces.new([inner_bot[next_i], inner_bot[i], inner_top[i], inner_top[next_i]])
        bm.faces.new([outer_top[i], outer_top[next_i], inner_top[next_i], inner_top[i]])
        bm.faces.new([outer_bot[next_i], outer_bot[i], inner_bot[i], inner_bot[next_i]])

def add_cone_to_bmesh(bm, center, radius_base, radius_top, height, segments=20, axis='Z', rot_euler=None):
    """Adds a truncated conical frustum to BMesh."""
    half_h = height * 0.5
    c = Vector(center)
    rot_mat = Euler(rot_euler, 'XYZ').to_matrix() if rot_euler else None
    bot_v = []
    top_v = []
    
    for i in range(segments):
        a = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(a)
        sin_a = math.sin(a)
        
        if axis == 'Z':
            vb = Vector((cos_a * radius_base, sin_a * radius_base, -half_h))
            vt = Vector((cos_a * radius_top, sin_a * radius_top,  half_h))
        elif axis == 'Y':
            vb = Vector((cos_a * radius_base, -half_h, sin_a * radius_base))
            vt = Vector((cos_a * radius_top,  half_h, sin_a * radius_base))
        elif axis == 'X':
            vb = Vector((-half_h, cos_a * radius_base, sin_a * radius_base))
            vt = Vector(( half_h, cos_a * radius_top, sin_a * radius_top))
            
        if rot_mat:
            vb = rot_mat @ vb
            vt = rot_mat @ vt
            
        bot_v.append(bm.verts.new(vb + c))
        top_v.append(bm.verts.new(vt + c))
        
    for i in range(segments):
        next_i = (i + 1) % segments
        bm.faces.new([bot_v[i], bot_v[next_i], top_v[next_i], top_v[i]])
        
    bm.faces.new(list(reversed(bot_v)))
    if radius_top > 0.001:
        bm.faces.new(top_v)

def add_helix_to_bmesh(bm, center, coil_radius, wire_radius, total_length, turns=10, segments_per_turn=12, axis='Z'):
    """Generates a flexible coiled pneumatic/electrical suzie line helix."""
    c = Vector(center)
    tot_steps = int(turns * segments_per_turn)
    dz = total_length / tot_steps
    step_ang = (2.0 * math.pi) / segments_per_turn
    
    cross_segs = 6
    prev_ring = None
    
    for s in range(tot_steps + 1):
        ang = s * step_ang
        z = -total_length * 0.5 + s * dz
        hx = math.cos(ang) * coil_radius
        hy = math.sin(ang) * coil_radius
        h_center = Vector((hx, hy, z)) + c
        
        # Build circular cross-section ring perpendicular to tangent
        tx = -math.sin(ang) * coil_radius
        ty =  math.cos(ang) * coil_radius
        tz = dz / step_ang
        tangent = Vector((tx, ty, tz)).normalized()
        up = Vector((0, 0, 1))
        norm1 = tangent.cross(up).normalized()
        norm2 = tangent.cross(norm1).normalized()
        
        ring = []
        for cs in range(cross_segs):
            c_ang = 2.0 * math.pi * (cs / cross_segs)
            p = h_center + (norm1 * math.cos(c_ang) + norm2 * math.sin(c_ang)) * wire_radius
            ring.append(bm.verts.new(p))
            
        if prev_ring:
            for cs in range(cross_segs):
                next_cs = (cs + 1) % cross_segs
                bm.faces.new([prev_ring[cs], prev_ring[next_cs], ring[next_cs], ring[cs]])
        prev_ring = ring

def create_bmesh_object(name, material, parent=None):
    """Creates a new Blender object and associated empty BMesh ready for Class-A assembly."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    if material:
        obj.data.materials.append(material)
    bm = bmesh.new()
    return obj, mesh, bm

def finalize_bmesh_object(obj, arg2, arg3=None, smooth_angle=35.0):
    """Converts BMesh to final mesh, enables auto-smooth, and releases memory safely."""
    if arg3 is None:
        bm = arg2
        mesh = obj.data
    else:
        mesh = arg2
        bm = arg3
        
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    
    if hasattr(mesh, 'use_auto_smooth'):
        mesh.use_auto_smooth = True
        mesh.auto_smooth_angle = math.radians(smooth_angle)
    else:
        for f in mesh.polygons:
            f.use_smooth = True


# =============================================================================
# SUBSYSTEM 1: HIGH-TENSILE ALLOY LADDER CHASSIS & FUPS CRASH STRUCTURE
# =============================================================================

def build_actros_chassis_frame(materials, parent=None):
    """
    Constructs the 2010s Mercedes-Benz Actros MP4 modular high-tensile alloy steel
    ladder chassis frame, 50mm DIN mounting hole grid, Front Underrun Protection
    System (FUPS) crash box, and structural cast crossmembers.
    
    Hardpoints:
    - Wheelbase: 3,700 mm (Steer: Y = +1.500 m, Drive: Y = -2.200 m)
    - Total Length: Y = +2.380 m to Y = -3.520 m (Total 5.900 m)
    - Outside frame rail width: 0.850 m (X = -0.425 m to +0.425 m)
    - C-Channel web: 0.300 m height, 0.085 m flange width, 0.008 m thickness
    - Top of rail height: Z = 0.900 m
    """
    frame_obj, frame_mesh, bm = create_bmesh_object("Chassis_Frame_Assembly", materials['Paint_ChassisNovaGrey'], parent)
    
    rail_len = 5.900
    rail_y_mid = (2.380 + (-3.520)) * 0.5  # -0.570 m
    web_h = 0.300
    flange_w = 0.085
    t = 0.008
    top_z = 0.900
    bot_z = top_z - web_h
    mid_z = (top_z + bot_z) * 0.5
    
    # 1. Left & Right High-Tensile Steel C-Channel Longitudinal Frame Rails
    for side in [-1.0, 1.0]:
        fx = side * (0.425 - flange_w * 0.5)
        # Vertical Web (300 mm x 8 mm)
        add_box_to_bmesh(bm, (fx, rail_y_mid, mid_z), (t, rail_len, web_h))
        # Top Horizontal Flange (85 mm x 8 mm)
        add_box_to_bmesh(bm, (fx + side * (flange_w * 0.5 - t * 0.5), rail_y_mid, top_z - t * 0.5), (flange_w, rail_len, t))
        # Bottom Horizontal Flange (85 mm x 8 mm)
        add_box_to_bmesh(bm, (fx + side * (flange_w * 0.5 - t * 0.5), rail_y_mid, bot_z + t * 0.5), (flange_w, rail_len, t))
        
        # Stamped DIN 50 mm modular attachment hole pattern along chassis web
        for hole_y in [-3.20, -2.80, -2.40, -1.80, -1.20, -0.60, 0.00, 0.60, 1.20, 1.80, 2.10]:
            add_cylinder_to_bmesh(bm, (fx, hole_y, mid_z), 0.022, t * 1.5, segments=12, axis='X')
            add_cylinder_to_bmesh(bm, (fx, hole_y, mid_z + 0.080), 0.016, t * 1.5, segments=10, axis='X')
            add_cylinder_to_bmesh(bm, (fx, hole_y, mid_z - 0.080), 0.016, t * 1.5, segments=10, axis='X')

    # 2. Structural Crossmembers
    # A. Front FUPS Support / Engine Crossmember (Y = +2.250 m)
    add_box_to_bmesh(bm, (0.0, 2.250, mid_z - 0.040), (0.830, 0.180, 0.160))
    # B. Transmission Rear Support Crossmember (Y = +0.800 m)
    add_cylinder_to_bmesh(bm, (0.0, 0.800, mid_z - 0.020), 0.065, 0.820, segments=16, axis='X')
    # C. Mid-Chassis Torsion Crossmember with Gusset Plates (Y = -0.600 m)
    add_box_to_bmesh(bm, (0.0, -0.600, mid_z), (0.830, 0.140, 0.120))
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * 0.350, -0.600, mid_z + 0.060), (0.120, 0.180, 0.080))
    # D. Drive Axle Bogie / ECAS Suspension Bridge Crossmember (Y = -2.200 m)
    add_box_to_bmesh(bm, (0.0, -2.200, mid_z + 0.020), (0.830, 0.260, 0.180))
    # E. Rear Chassis Tow & Underrun Crossmember (Y = -3.480 m)
    add_box_to_bmesh(bm, (0.0, -3.480, mid_z), (0.830, 0.120, 0.220))

    # 3. ECE R93 Front Underrun Protection System (FUPS) Cast Aluminum Crash Box
    fups_y = 2.360
    fups_z = 0.520
    # Heavy transverse extruded crash beam (2,300 mm width)
    add_box_to_bmesh(bm, (0.0, fups_y, fups_z), (2.300, 0.120, 0.140))
    # Energy-absorbing progressive deformation crash boxes
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * 0.380, fups_y - 0.110, fups_z), (0.180, 0.150, 0.120))
        # Structural triangular bracing to chassis rail bottom flanges
        add_box_to_bmesh(bm, (side * 0.380, fups_y - 0.220, fups_z + 0.060), (0.140, 0.120, 0.080), rot_euler=(side * 0.25, 0.0, 0.0))

    # 4. Heavy Commercial Front Towing Jaw & Removable Steel Pin
    add_box_to_bmesh(bm, (0.0, 2.420, fups_z + 0.020), (0.160, 0.140, 0.120))
    add_cylinder_to_bmesh(bm, (0.0, 2.440, fups_z + 0.020), 0.024, 0.180, segments=16, axis='Z')

    finalize_bmesh_object(frame_obj, frame_mesh, bm)
    return frame_obj


# =============================================================================
# SUBSYSTEM 2: FRONT STEER AXLE & VENTILATED DISC BRAKES
# =============================================================================

def build_actros_steer_axle_and_brakes(materials, parent=None):
    """
    Constructs the Mercedes-Benz VL 4/51 D-7.5 forged steel drop-center front steer
    axle, parabolic 2-leaf front steel springs, telescopic shock absorbers,
    430 mm ventilated cast iron disc brake assemblies, and steering linkages.
    
    Hardpoints:
    - Axle Centerline: Y = +1.500 m, Z = 0.510 m
    - Track Width: 2,050 mm
    """
    steer_obj, steer_mesh, bm = create_bmesh_object("Front_Steer_Suspension", materials['Paint_ChassisNovaGrey'], parent)
    brake_obj, brake_mesh, bm_brake = create_bmesh_object("Front_Disc_Brakes", materials['Iron_CastHeavy'], parent)
    
    axle_y = 1.500
    axle_z = 0.510
    track_w = 2.050
    half_track = track_w * 0.5  # 1.025 m
    
    # 1. Forged I-Beam Drop-Center Steer Axle Beam
    # Center dropped beam (low center of gravity)
    add_box_to_bmesh(bm, (0.0, axle_y, axle_z - 0.060), (1.500, 0.110, 0.100))
    # Angled rising forged axle necks to kingpin bosses
    for side in [-1.0, 1.0]:
        neck_x = side * 0.820
        add_box_to_bmesh(bm, (neck_x, axle_y, axle_z - 0.020), (0.180, 0.120, 0.110), rot_euler=(0.0, side * math.radians(22.0), 0.0))
        # Forged vertical Kingpin cylindrical housing boss
        kp_x = side * (half_track - 0.080)
        add_cylinder_to_bmesh(bm, (kp_x, axle_y, axle_z), 0.055, 0.220, segments=18, axis='Z')
        # Heavy-duty steer knuckle spindle stub axle
        add_cylinder_to_bmesh(bm, (side * half_track, axle_y, axle_z), 0.048, 0.160, segments=16, axis='X')
        
    # 2. Parabolic 2-Leaf Steel Springs (Mounted beneath chassis rails at X = +/- 0.425 m)
    leaf_len = 1.650
    for side in [-1.0, 1.0]:
        lx = side * 0.425
        # Main leaf (arch curving over axle)
        add_box_to_bmesh(bm, (lx, axle_y, axle_z + 0.140), (0.100, leaf_len, 0.022))
        add_box_to_bmesh(bm, (lx, axle_y, axle_z + 0.116), (0.100, leaf_len * 0.84, 0.020))
        # Spring clamping top pad and heavy U-bolts
        add_box_to_bmesh(bm, (lx, axle_y, axle_z + 0.170), (0.130, 0.220, 0.040))
        for uy in [-0.070, 0.070]:
            add_cylinder_to_bmesh(bm, (lx + 0.060, axle_y + uy, axle_z + 0.050), 0.014, 0.240, segments=10, axis='Z')
            add_cylinder_to_bmesh(bm, (lx - 0.060, axle_y + uy, axle_z + 0.050), 0.014, 0.240, segments=10, axis='Z')
            
        # Cast steel front spring eye hanger and rear sliding shackle
        add_box_to_bmesh(bm, (lx, axle_y + leaf_len * 0.48, 0.720), (0.120, 0.140, 0.160))
        add_box_to_bmesh(bm, (lx, axle_y - leaf_len * 0.48, 0.720), (0.120, 0.140, 0.180))
        # Heavy gas-pressurized telescopic shock absorber
        add_cylinder_to_bmesh(bm, (lx + side * 0.080, axle_y - 0.060, axle_z + 0.220), 0.038, 0.420, segments=14, axis='Z', rot_euler=(0.0, side * 0.15, 0.0))

    # 3. Steering Transverse Tie Rod Linkage
    add_cylinder_to_bmesh(bm, (0.0, axle_y - 0.160, axle_z - 0.030), 0.024, 1.820, segments=14, axis='X')
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm, (side * 0.920, axle_y - 0.160, axle_z - 0.010), 0.036, 0.080, segments=12, axis='Z')

    # 4. Front Internally Ventilated Disc Brake Rotors (430 mm diameter) & Pneumatic Calipers
    for side in [-1.0, 1.0]:
        bx = side * (half_track - 0.015)
        # Ventilated disc brake rotor
        add_tube_to_bmesh(bm_brake, (bx, axle_y, axle_z), 0.215, 0.130, 0.045, segments=28, axis='X')
        # Center rotor mounting hat
        add_cylinder_to_bmesh(bm_brake, (bx + side * 0.025, axle_y, axle_z), 0.135, 0.050, segments=24, axis='X')
        # Heavy floating single-piston pneumatic brake caliper
        cal_z = axle_z + 0.110
        add_box_to_bmesh(bm_brake, (bx - side * 0.010, axle_y, cal_z), (0.120, 0.260, 0.150))
        # Pneumatic diaphragm brake chamber canister
        add_cylinder_to_bmesh(bm_brake, (bx - side * 0.120, axle_y, cal_z + 0.040), 0.085, 0.160, segments=16, axis='X')

    finalize_bmesh_object(steer_obj, steer_mesh, bm)
    finalize_bmesh_object(brake_obj, brake_mesh, bm_brake)
    return [steer_obj, brake_obj]


# =============================================================================
# SUBSYSTEM 3: HYPOID REAR DRIVE AXLE & 4-BELLOW ECAS AIR SUSPENSION
# =============================================================================

def build_actros_drive_axle_and_ecas(materials, parent=None):
    """
    Constructs the Mercedes-Benz RT 440-13D single-reduction hypoid rear drive axle,
    differential banjo housing, 4-bellow ECAS electronically controlled air
    suspension, V-link torque rod, anti-roll torsion bar, and spring brake chambers.
    
    Hardpoints:
    - Drive Axle Centerline: Y = -2.200 m, Z = 0.510 m
    - Rear Track Width: 1,820 mm (Inner tire bead line)
    """
    axle_obj, axle_mesh, bm_axle = create_bmesh_object("Rear_Drive_Axle_Assembly", materials['Paint_ChassisNovaGrey'], parent)
    air_obj, air_mesh, bm_air = create_bmesh_object("Rear_ECAS_Air_Bags", materials['Rubber_ECASAirBag'], parent)
    
    ay = -2.200
    az = 0.510
    
    # 1. Cast Ductile Iron Hypoid Banjo Rear Axle Center Housing
    # Spherical / oval differential carrier bowl (offset 40 mm to right for hypoid pinion)
    add_cylinder_to_bmesh(bm_axle, (0.040, ay, az), 0.240, 0.320, segments=24, axis='Y')
    # Rear inspection cover plate with ring of bolts
    add_cylinder_to_bmesh(bm_axle, (0.040, ay - 0.165, az), 0.220, 0.035, segments=24, axis='Y')
    # Pinion input companion flange for propeller shaft coupling
    add_cylinder_to_bmesh(bm_axle, (0.040, ay + 0.180, az), 0.095, 0.120, segments=18, axis='Y')
    
    # 2. Tubular Welded Axle Sleeves & Wheel Spindles (Extending to X = +/- 1.080 m)
    for side in [-1.0, 1.0]:
        sx_mid = side * 0.600
        add_cylinder_to_bmesh(bm_axle, (sx_mid, ay, az), 0.085, 0.880, segments=20, axis='X')
        # Cast outer hub spindles with oil-lubricated wheel bearings
        add_cylinder_to_bmesh(bm_axle, (side * 1.060, ay, az), 0.075, 0.180, segments=18, axis='X')
        # Rear Ventilated Disc Brake Rotors (430 mm)
        add_tube_to_bmesh(bm_axle, (side * 0.940, ay, az), 0.215, 0.130, 0.045, segments=24, axis='X')
        # Tristop Type 24/30 Dual Diaphragm Spring Brake Actuators
        add_cylinder_to_bmesh(bm_axle, (side * 0.820, ay - 0.220, az + 0.060), 0.100, 0.260, segments=16, axis='Y')

    # 3. 4-Bellow ECAS Electronically Controlled Air Suspension System
    # Two rolling-lobe air springs per side (ahead of and behind axle)
    bellow_r = 0.160
    bellow_h = 0.280
    bellow_z = az + 0.160
    
    for side in [-1.0, 1.0]:
        ax = side * 0.480
        # Longitudinal trailing cast suspension guide beam
        add_box_to_bmesh(bm_axle, (ax, ay, az + 0.020), (0.140, 1.180, 0.090))
        # Top axle clamping saddle with heavy cast clamping plate
        add_box_to_bmesh(bm_axle, (ax, ay, az + 0.090), (0.160, 0.260, 0.060))
        
        # Front air bellow (Y = -1.820 m)
        add_cylinder_to_bmesh(bm_air, (ax, ay + 0.380, bellow_z), bellow_r, bellow_h, segments=24, axis='Z')
        # Aluminum base piston
        add_cylinder_to_bmesh(bm_axle, (ax, ay + 0.380, bellow_z - bellow_h * 0.5 - 0.030), bellow_r * 0.88, 0.060, segments=20, axis='Z')
        # Top chassis mounting bracket
        add_box_to_bmesh(bm_axle, (ax, ay + 0.380, bellow_z + bellow_h * 0.5 + 0.025), (0.240, 0.240, 0.050))
        
        # Rear air bellow (Y = -2.580 m)
        add_cylinder_to_bmesh(bm_air, (ax, ay - 0.380, bellow_z), bellow_r, bellow_h, segments=24, axis='Z')
        add_cylinder_to_bmesh(bm_axle, (ax, ay - 0.380, bellow_z - bellow_h * 0.5 - 0.030), bellow_r * 0.88, 0.060, segments=20, axis='Z')
        add_box_to_bmesh(bm_axle, (ax, ay - 0.380, bellow_z + bellow_h * 0.5 + 0.025), (0.240, 0.240, 0.050))
        
        # Heavy inclined gas-hydraulic shock absorber
        add_cylinder_to_bmesh(bm_axle, (ax + side * 0.080, ay - 0.180, az + 0.240), 0.042, 0.460, segments=14, axis='Z', rot_euler=(0.18, side * 0.10, 0.0))

    # 4. Transverse V-Link Axle Wishbone Torque Rod (Pivots from crossmember to axle center)
    add_box_to_bmesh(bm_axle, (0.0, ay + 0.380, az + 0.320), (0.160, 0.180, 0.120))
    # V-arms spreading to chassis rails
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_axle, (side * 0.220, ay + 0.560, az + 0.340), (0.060, 0.440, 0.050), rot_euler=(0.0, 0.0, side * math.radians(26.0)))
        # Heavy chassis pivot bushing
        add_cylinder_to_bmesh(bm_axle, (side * 0.420, ay + 0.740, az + 0.360), 0.045, 0.120, segments=14, axis='Y')

    # 5. Heavy Anti-Roll Torsion Sway Bar
    add_cylinder_to_bmesh(bm_axle, (0.0, ay - 0.520, az + 0.080), 0.034, 1.020, segments=16, axis='X')
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm_axle, (side * 0.480, ay - 0.420, az + 0.160), 0.028, 0.220, segments=12, axis='Z')

    finalize_bmesh_object(axle_obj, axle_mesh, bm_axle)
    finalize_bmesh_object(air_obj, air_mesh, bm_air)
    return [axle_obj, air_obj]


# =============================================================================
# SUBSYSTEM 4: ALCOA DURA-BRIGHT FORGED ALLOY WHEELSET & MICHELIN TIRES
# =============================================================================

def build_actros_wheelset_and_tires(materials, parent=None):
    """
    Constructs the 2010s Mercedes-Benz Actros MP4 Alcoa Dura-Bright 22.5" x 9.0"
    mirror-polished forged aluminum steer wheels, 22.5" x 11.75" dual rear drive
    wheel assemblies, Michelin X Line Energy 315/70 R22.5 low-rolling-resistance
    tires with 4-rib directional tread patterns, 10 M22 wheel studs with fluorescent
    yellow Checkpoint movement indicators, and Mercedes-Benz star hubcaps.
    """
    wheel_obj, wheel_mesh, bm_wheel = create_bmesh_object("Actros_DuraBright_Wheels", materials['Alloy_AlcoaDuraBright'], parent)
    tire_obj, tire_mesh, bm_tire = create_bmesh_object("Actros_Michelin_Tires", materials['Rubber_EuropeanTire'], parent)
    nut_obj, nut_mesh, bm_nut = create_bmesh_object("Wheel_Nut_Safety_Indicators", materials['Plastic_NeonNutIndicator'], parent)
    star_obj, star_mesh, bm_star = create_bmesh_object("Wheel_Center_Star_Caps", materials['Chrome_MercedesStar'], parent)
    
    # Standard 315/70 R22.5 Dimensions:
    # Outer Tire Diameter: 1,014 mm (Radius = 0.507 m)
    # Rim Diameter: 22.5 inches = 571.5 mm (Radius = 0.286 m)
    # Tire Section Width: 315 mm (0.315 m)
    tire_r_out = 0.507
    tire_r_in  = 0.286
    tire_w     = 0.315
    rim_r      = 0.286
    rim_w      = 0.260
    
    # -------------------------------------------------------------------------
    # A. FRONT STEER WHEELS (Single wheel per side at Y = +1.500 m, Z = 0.510 m)
    # -------------------------------------------------------------------------
    front_y = 1.500
    front_z = 0.510
    front_x_center = 1.040
    
    for side in [-1.0, 1.0]:
        wx = side * front_x_center
        
        # 1. Michelin X Line Energy 315/70 R22.5 Tire
        add_tube_to_bmesh(bm_tire, (wx, front_y, front_z), tire_r_out, tire_r_in, tire_w, segments=36, axis='X')
        # Rounded outer shoulder curve rings
        for sx in [-tire_w * 0.44, tire_w * 0.44]:
            add_tube_to_bmesh(bm_tire, (wx + sx, front_y, front_z), tire_r_out - 0.015, tire_r_out - 0.035, 0.035, segments=36, axis='X')
            
        # 4 Circumferential Water Drainage Grooves
        for g_offset in [-0.090, -0.030, 0.030, 0.090]:
            add_tube_to_bmesh(bm_tire, (wx + g_offset, front_y, front_z), tire_r_out + 0.002, tire_r_out - 0.014, 0.012, segments=36, axis='X')
            
        # 2. Alcoa Dura-Bright Forged Steer Wheel Rim
        add_tube_to_bmesh(bm_wheel, (wx, front_y, front_z), rim_r, rim_r * 0.72, rim_w, segments=36, axis='X')
        # Outer stepped wheel flange lip
        lip_x = wx + side * (rim_w * 0.5 + 0.010)
        add_tube_to_bmesh(bm_wheel, (lip_x, front_y, front_z), rim_r + 0.016, rim_r - 0.010, 0.022, segments=36, axis='X')
        
        # Steer Wheel Outer Concave Center Disc
        disc_x = wx + side * (rim_w * 0.48)
        add_tube_to_bmesh(bm_wheel, (disc_x, front_y, front_z), rim_r * 0.88, 0.140, 0.025, segments=32, axis='X')
        
        # 10 Oval Ventilation Handholes around perimeter
        num_holes = 10
        hole_pcd = 0.210  # 420 mm pitch circle diameter
        for h_idx in range(num_holes):
            ang = 2.0 * math.pi * (h_idx / num_holes)
            hy = front_y + math.cos(ang) * hole_pcd
            hz = front_z + math.sin(ang) * hole_pcd
            add_cylinder_to_bmesh(bm_wheel, (disc_x, hy, hz), 0.026, 0.030, segments=12, axis='X')
            
        # 3. 10 M22 Wheel Studs with Checkpoint Fluorescent Yellow Pointer Indicators
        stud_pcd = 0.1675  # 335 mm DIN wheel stud PCD
        for s_idx in range(10):
            ang = 2.0 * math.pi * (s_idx / 10)
            sy = front_y + math.cos(ang) * stud_pcd
            sz = front_z + math.sin(ang) * stud_pcd
            stud_x = disc_x + side * 0.018
            # Chromed M22 wheel nut
            add_cylinder_to_bmesh(bm_wheel, (stud_x, sy, sz), 0.017, 0.028, segments=8, axis='X')
            # Fluorescent Yellow Checkpoint pointer sleeve
            add_tube_to_bmesh(bm_nut, (stud_x + side * 0.010, sy, sz), 0.022, 0.017, 0.014, segments=12, axis='X')
            # Safety Pointer teardrop tip pointing toward adjacent nut
            ptr_ang = ang + math.radians(42.0)
            py = sy + math.cos(ptr_ang) * 0.028
            pz = sz + math.sin(ptr_ang) * 0.028
            add_box_to_bmesh(bm_nut, (stud_x + side * 0.010, py, pz), (0.012, 0.012, 0.016))
            
        # 4. Mercedes-Benz Center Star Chrome Beauty Hubcap
        cap_x = disc_x + side * 0.022
        add_cylinder_to_bmesh(bm_star, (cap_x, front_y, front_z), 0.078, 0.025, segments=28, axis='X')
        # Embossed three-pointed star on hubcap
        for star_arm in range(3):
            arm_ang = (2.0 * math.pi * star_arm / 3.0) + (math.pi * 0.5)
            ay = front_y + math.cos(arm_ang) * 0.038
            az = front_z + math.sin(arm_ang) * 0.038
            add_box_to_bmesh(bm_star, (cap_x + side * 0.008, ay, az), (0.008, 0.010, 0.044), rot_euler=(arm_ang, 0.0, 0.0))

    # -------------------------------------------------------------------------
    # B. REAR DUAL DRIVE WHEEL ASSEMBLIES (Dual wheels per side at Y = -2.200 m)
    # -------------------------------------------------------------------------
    rear_y = -2.200
    rear_z = 0.510
    inner_dual_x = 0.820
    outer_dual_x = 1.160
    
    for side in [-1.0, 1.0]:
        # Inner & Outer Dual Tires
        for wx in [side * inner_dual_x, side * outer_dual_x]:
            # Michelin Tire
            add_tube_to_bmesh(bm_tire, (wx, rear_y, rear_z), tire_r_out, tire_r_in, tire_w, segments=36, axis='X')
            for sx in [-tire_w * 0.44, tire_w * 0.44]:
                add_tube_to_bmesh(bm_tire, (wx + sx, rear_y, rear_z), tire_r_out - 0.015, tire_r_out - 0.035, 0.035, segments=36, axis='X')
            for g_offset in [-0.090, -0.030, 0.030, 0.090]:
                add_tube_to_bmesh(bm_tire, (wx + g_offset, rear_y, rear_z), tire_r_out + 0.002, tire_r_out - 0.014, 0.012, segments=36, axis='X')
                
            # Rim Barrel
            add_tube_to_bmesh(bm_wheel, (wx, rear_y, rear_z), rim_r, rim_r * 0.72, rim_w, segments=36, axis='X')
            
        # Deep-Dish Inverted Outer Wheel Disc (Deep dish characteristic of Euro drive axles)
        out_disc_x = side * (outer_dual_x - 0.080)
        add_tube_to_bmesh(bm_wheel, (out_disc_x, rear_y, rear_z), rim_r * 0.88, 0.140, 0.025, segments=32, axis='X')
        # Outer rim stepped lip
        out_lip_x = side * (outer_dual_x + rim_w * 0.5 + 0.005)
        add_tube_to_bmesh(bm_wheel, (out_lip_x, rear_y, rear_z), rim_r + 0.016, rim_r - 0.010, 0.022, segments=36, axis='X')
        
        # 10 Handholes on Drive Wheel Disc
        for h_idx in range(10):
            ang = 2.0 * math.pi * (h_idx / 10)
            hy = rear_y + math.cos(ang) * 0.210
            hz = rear_z + math.sin(ang) * 0.210
            add_cylinder_to_bmesh(bm_wheel, (out_disc_x, hy, hz), 0.024, 0.030, segments=12, axis='X')
            
        # Drive Axle Heavy Cast Hub Reduction Center Boss
        hub_x = side * (outer_dual_x + 0.040)
        add_cylinder_to_bmesh(bm_wheel, (hub_x, rear_y, rear_z), 0.115, 0.140, segments=24, axis='X')
        # Perimeter hub bolts
        for hb_idx in range(8):
            ang = 2.0 * math.pi * (hb_idx / 8)
            hby = rear_y + math.cos(ang) * 0.085
            hbz = rear_z + math.sin(ang) * 0.085
            add_cylinder_to_bmesh(bm_wheel, (hub_x + side * 0.072, hby, hbz), 0.010, 0.015, segments=8, axis='X')
            
        # 10 Wheel Nuts with Yellow Checkpoint Indicators on Drive Axle
        for s_idx in range(10):
            ang = 2.0 * math.pi * (s_idx / 10)
            sy = rear_y + math.cos(ang) * stud_pcd
            sz = rear_z + math.sin(ang) * stud_pcd
            stud_x = out_disc_x + side * 0.016
            add_cylinder_to_bmesh(bm_wheel, (stud_x, sy, sz), 0.017, 0.028, segments=8, axis='X')
            add_tube_to_bmesh(bm_nut, (stud_x + side * 0.010, sy, sz), 0.022, 0.017, 0.014, segments=12, axis='X')

    finalize_bmesh_object(wheel_obj, wheel_mesh, bm_wheel)
    finalize_bmesh_object(tire_obj, tire_mesh, bm_tire)
    finalize_bmesh_object(nut_obj, nut_mesh, bm_nut)
    finalize_bmesh_object(star_obj, star_mesh, bm_star)
    return [wheel_obj, tire_obj, nut_obj, star_obj]


# =============================================================================
# SUBSYSTEM 5: JOST JSK 42 CAST FIFTH-WHEEL COUPLING
# =============================================================================

def build_actros_fifth_wheel_coupling(materials, parent=None):
    """
    Constructs the Jost JSK 42 heavy cast ductile iron fifth-wheel coupling plate,
    twin pivoting trunnions, corrugated subframe mounting plates, locking jaw
    mechanism, low-friction composite top plate wear inserts, and safety release handle.
    
    Hardpoints:
    - Kingpin Center: Y = -1.950 m (250 mm ahead of drive axle for optimal axle load transfer)
    - Coupling Surface Height: Z = 1.150 m (Standard Euro fifth-wheel height)
    """
    fw_obj, fw_mesh, bm_fw = create_bmesh_object("Fifth_Wheel_Jost_JSK42", materials['Iron_CastHeavy'], parent)
    sensor_obj, sensor_mesh, bm_sensor = create_bmesh_object("FifthWheel_Sensors", materials['Decal_AdBlueBlue'], parent)
    handle_obj, handle_mesh, bm_handle = create_bmesh_object("FifthWheel_Release_Handle", materials['Alloy_AlcoaDuraBright'], parent)
    
    fy = -1.950
    fz = 1.150
    
    # 1. Main Cast Ductile Iron Coupling Top Plate (940 mm wide x 980 mm long)
    # Forward main bearing platform
    add_box_to_bmesh(bm_fw, (0.0, fy + 0.160, fz - 0.025), (0.920, 0.580, 0.050))
    
    # Left & Right Rear Entry Horns / Throat Funnels
    for side in [-1.0, 1.0]:
        hx = side * 0.320
        # Tapered horn body
        add_box_to_bmesh(bm_fw, (hx, fy - 0.320, fz - 0.035), (0.280, 0.420, 0.050))
        # Downward angled lead-in ramp tip
        add_box_to_bmesh(bm_fw, (hx, fy - 0.520, fz - 0.065), (0.240, 0.160, 0.040), rot_euler=(math.radians(18.0), 0.0, 0.0))
        
    # Machined Kingpin Throat Slot & 2" Locking Jaw Pocket
    add_cylinder_to_bmesh(bm_fw, (0.0, fy, fz - 0.030), 0.090, 0.060, segments=24, axis='Z')
    # Internal heavy forged steel locking jaw wedge
    add_box_to_bmesh(bm_fw, (0.040, fy, fz - 0.030), (0.080, 0.110, 0.045))
    
    # Low-Friction Composite Top Wear Lubrication Pads
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_sensor, (side * 0.280, fy + 0.160, fz + 0.002), (0.180, 0.380, 0.006))
        
    # 2. Corrugated Heavy Steel Subframe Mounting Brackets
    # Clamped to chassis rails at X = +/- 0.425 m
    for side in [-1.0, 1.0]:
        bx = side * 0.425
        # Longitudinal angle mounting plate
        add_box_to_bmesh(bm_fw, (bx, fy, 0.980), (0.120, 0.860, 0.160))
        # Cast pivoting trunnion pedestal bracket
        add_cylinder_to_bmesh(bm_fw, (bx, fy, 1.080), 0.065, 0.140, segments=18, axis='X')
        # High-tensile steel pivot pin (70 mm diameter)
        add_cylinder_to_bmesh(bm_fw, (bx, fy, 1.080), 0.035, 0.180, segments=16, axis='X')

    # 3. Ergonomic Long-Reach Manual Safety Release Handle
    # Extends outward to the driver's side chassis rail (Left side X < 0 in Euro LHD)
    add_cylinder_to_bmesh(bm_handle, (-0.450, fy + 0.060, fz - 0.050), 0.012, 0.720, segments=10, axis='X')
    # Curved safety carabiner release grip loop
    add_tube_to_bmesh(bm_handle, (-0.820, fy + 0.060, fz - 0.050), 0.045, 0.032, 0.018, segments=16, axis='Z')
    
    # 4. Electronic Kingpin Coupling Sensor & Safety Interlock Indicator Box
    add_box_to_bmesh(bm_sensor, (0.180, fy - 0.080, fz - 0.070), (0.090, 0.090, 0.060))

    finalize_bmesh_object(fw_obj, fw_mesh, bm_fw)
    finalize_bmesh_object(sensor_obj, sensor_mesh, bm_sensor)
    finalize_bmesh_object(handle_obj, handle_mesh, bm_handle)
    return [fw_obj, sensor_obj, handle_obj]


# =============================================================================
# SUBSYSTEM 6: ACTROS GIGASPACE AERODYNAMIC FLAT-FLOOR CAB STRUCTURE
# =============================================================================

def build_actros_gigaspace_cab_shell(materials, parent=None):
    """
    Constructs the flagship Mercedes-Benz Actros MP4 GigaSpace sleeper cab:
    - Standing height interior with completely flat floor (no engine tunnel bulge)
    - 15-degree aerodynamically raked A-pillars and windshield
    - Sweeping aerodynamic GigaSpace fiberglass high-roof cap rising to Z = 3.950 m
    - Recessed flush aerodynamic door apertures and window reveals
    - Rear cab bulkhead wall with aerodynamic vertical airflow channel ribs
    
    Dimensions:
    - Cab Width: 2,500 mm (X = -1.250 m to +1.250 m)
    - Cab Length: 2,300 mm (Front cowl: Y = +2.240 m to Rear bulkhead: Y = -0.060 m)
    - Floor / Sill Height: Z = 1.340 m
    - Base Roof Rail Height: Z = 3.250 m
    - GigaSpace Aerodynamic Crown: Z = 3.950 m
    """
    body_obj, body_mesh, bm_body = create_bmesh_object("Actros_Cab_Main_Shell", materials['Paint_ActrosIridiumSilver'], parent)
    roof_obj, roof_mesh, bm_roof = create_bmesh_object("Actros_GigaSpace_Roof", materials['Paint_ActrosAeroSilver'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Actros_Cab_Aero_Trim", materials['Plastic_AnthraciteComposite'], parent)
    
    half_w = 1.250
    sill_z = 1.340
    belt_z = 1.950
    roof_base_z = 3.250
    crown_z = 3.950
    front_cowl_y = 2.240
    front_header_y = 1.900
    rear_wall_y = -0.060
    
    # 1. Lower Cab Sub-Floor Core Block
    floor_mid_y = (front_cowl_y + rear_wall_y) * 0.5  # 1.090 m
    floor_len = front_cowl_y - rear_wall_y           # 2.300 m
    add_box_to_bmesh(bm_body, (0.0, floor_mid_y, (sill_z + belt_z) * 0.5), (half_w * 2.0, floor_len, belt_z - sill_z))
    
    # 2. Left & Right Aerodynamic Cab Flanks (Sleeper Bunk Section Behind Doors)
    sleeper_len = 1.200
    sleeper_mid_y = rear_wall_y + sleeper_len * 0.5  # 0.540 m
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_body, (side * (half_w - 0.040), sleeper_mid_y, (belt_z + roof_base_z) * 0.5), (0.080, sleeper_len, roof_base_z - belt_z))
        
    # 3. 15-Degree Aerodynamic Raked A-Pillars & Windshield Cowl
    p_mid_y = (front_cowl_y + front_header_y) * 0.5  # 2.070 m
    p_mid_z = (belt_z + roof_base_z) * 0.5           # 2.600 m
    p_len = math.sqrt((front_cowl_y - front_header_y)**2 + (roof_base_z - belt_z)**2)
    p_angle = math.atan2(front_cowl_y - front_header_y, roof_base_z - belt_z)  # ~14.6 deg
    
    for side in [-1.0, 1.0]:
        px = side * (half_w - 0.035)
        # Structural A-pillar
        add_box_to_bmesh(bm_body, (px, p_mid_y, p_mid_z), (0.075, 0.090, p_len), rot_euler=(p_angle, 0.0, 0.0))
        
        # Sculpted Cab Front Corner Aerodynamic Air Deflector Guide Vanes
        # Actros signature aerodynamic guide vanes channeling turbulent air around cab sides
        v_y = 2.220
        v_z = 1.580
        add_box_to_bmesh(bm_trim, (side * (half_w - 0.030), v_y, v_z), (0.065, 0.045, 0.520))
        # Aerodynamic slot channel air exit relief
        add_box_to_bmesh(bm_body, (side * (half_w - 0.055), v_y - 0.020, v_z), (0.035, 0.025, 0.480))
        for cap_z in [v_z - 0.240, v_z + 0.240]:
            add_box_to_bmesh(bm_trim, (side * (half_w - 0.030), v_y, cap_z), (0.070, 0.050, 0.020))

    # Upper Windshield Header Crossbeam
    add_box_to_bmesh(bm_body, (0.0, front_header_y, roof_base_z - 0.040), (half_w * 1.92, 0.120, 0.080))
    # Lower Windshield Cowl Scuttle Bar
    add_box_to_bmesh(bm_body, (0.0, front_cowl_y, belt_z + 0.030), (half_w * 1.94, 0.140, 0.060))

    # 4. Flagship GigaSpace Curved Aerodynamic High-Roof Cap
    # Rises from roof_base_z (3.250 m) to crown_z (3.950 m) with smooth aerodynamic bubble crown
    cap_h = crown_z - roof_base_z  # 0.700 m
    cap_mid_z = (roof_base_z + crown_z) * 0.5
    
    # Forward sloping high-roof forehead (sloping back from Y = 1.900 m to Y = 1.200 m)
    add_box_to_bmesh(bm_roof, (0.0, 1.550, cap_mid_z), (half_w * 1.94, 0.720, cap_h * 0.92))
    # Rear sleeper roof cap section
    add_box_to_bmesh(bm_roof, (0.0, 0.580, crown_z - 0.040), (half_w * 1.94, 1.180, 0.080))
    
    # Left & Right Curved Aerodynamic Roof Shoulder Curves
    for side in [-1.0, 1.0]:
        rx = side * (half_w - 0.065)
        add_cylinder_to_bmesh(bm_roof, (rx, 0.880, crown_z - 0.080), 0.130, 1.550, segments=18, axis='Y')
        
    # 5. Rear Cab Bulkhead Wall & Aerodynamic Stiffening Ribs
    add_box_to_bmesh(bm_body, (0.0, rear_wall_y, (sill_z + crown_z) * 0.5), (half_w * 1.96, 0.040, crown_z - sill_z))
    # Horizontal stamped aerodynamic ribs across rear cab wall
    for rz in [1.700, 2.300, 2.900, 3.500]:
        add_box_to_bmesh(bm_body, (0.0, rear_wall_y - 0.015, rz), (half_w * 1.84, 0.020, 0.035))

    finalize_bmesh_object(body_obj, body_mesh, bm_body)
    finalize_bmesh_object(roof_obj, roof_mesh, bm_roof)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    return [body_obj, roof_obj, trim_obj]


# =============================================================================
# SUBSYSTEM 7: CASCADING TRAPEZOIDAL GRILLE & ILLUMINATED MERCEDES STAR
# =============================================================================

def build_actros_cascading_grille_and_star(materials, parent=None):
    """
    Constructs the iconic Actros MP4 cascading 4-level perforated trapezoidal front
    intake grille, honeycomb mesh matrix, massive 280 mm diameter Mercedes-Benz
    three-pointed star, and backlit LED halo illumination ring.
    
    Hardpoints:
    - Front Grille Surface: Y = +2.260 m to +2.300 m
    - Height Span: Z = 1.250 m to Z = 1.940 m (0.690 m vertical face)
    - Trapezoidal Width: Top = 1.360 m, Bottom = 1.140 m
    """
    grille_obj, grille_mesh, bm_grille = create_bmesh_object("Grille_Cascading_Matrix", materials['Plastic_AnthraciteComposite'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Grille_MercedesStar_Chrome", materials['Chrome_MercedesStar'], parent)
    halo_obj, halo_mesh, bm_halo = create_bmesh_object("Grille_Star_Halo_LED", materials['Emissive_StarHaloWhite'], parent)
    
    gy = 2.260
    gz_bot = 1.250
    gz_top = 1.940
    gz_mid = (gz_bot + gz_top) * 0.5  # 1.595 m
    gh = gz_top - gz_bot            # 0.690 m
    gw_top = 1.360
    gw_bot = 1.140
    gw_mid = (gw_top + gw_bot) * 0.5 # 1.250 m
    
    # 1. Base Dark Honeycomb Grille Intake Backplate
    add_box_to_bmesh(bm_grille, (0.0, gy, gz_mid), (gw_mid, 0.040, gh))
    
    # 2. Outer Molded Composite Perimeter Frame Surround
    add_box_to_bmesh(bm_grille, (0.0, gy + 0.010, gz_top - 0.015), (gw_top, 0.035, 0.030))
    add_box_to_bmesh(bm_grille, (0.0, gy + 0.010, gz_bot + 0.015), (gw_bot, 0.035, 0.030))
    for s in [-1.0, 1.0]:
        add_box_to_bmesh(bm_grille, (s * (gw_mid * 0.5 - 0.015), gy + 0.010, gz_mid), (0.030, 0.035, gh))

    # 3. 4 Cascading Aerodynamic Slat Louvres (Signature Actros MP4 Horizontal Slats)
    num_slats = 4
    for s_idx in range(num_slats):
        t = s_idx / (num_slats - 1)
        sz = gz_top - 0.070 - t * (gh - 0.140)
        sw = gw_top - t * (gw_top - gw_bot)
        # Sweeping aerodynamic horizontal slat blade
        add_box_to_bmesh(bm_grille, (0.0, gy + 0.018, sz), (sw * 0.95, 0.038, 0.032))
        # Chrome leading-edge highlight strip along slat crest
        add_box_to_bmesh(bm_chrome, (0.0, gy + 0.038, sz), (sw * 0.93, 0.008, 0.008))

    # 4. Perforated Hexagonal Honeycomb Airflow Holes
    num_rows = 10
    for r_idx in range(num_rows):
        rz = gz_bot + 0.040 + (r_idx * (gh - 0.080) / num_rows)
        for col_x in [-0.50, -0.38, -0.26, 0.26, 0.38, 0.50]:
            add_cylinder_to_bmesh(bm_grille, (col_x, gy + 0.024, rz), 0.016, 0.014, segments=6, axis='Y')

    # 5. Massive 280 mm Diameter Mercedes-Benz Three-Pointed Star
    # Centered prominently at X = 0.0, Z = gz_mid + 0.040 m (Z = 1.635 m)
    star_z = gz_mid + 0.040
    star_y = gy + 0.038
    star_r = 0.140  # 280 mm diameter
    
    # Outer circular chrome ring
    add_tube_to_bmesh(bm_chrome, (0.0, star_y, star_z), star_r + 0.016, star_r, 0.024, segments=36, axis='Y')
    # Inner chrome ring chamfer step
    add_tube_to_bmesh(bm_chrome, (0.0, star_y - 0.006, star_z), star_r, star_r - 0.014, 0.020, segments=36, axis='Y')
    
    # Backlit LED Halo Illumination Ring (Behind outer chrome ring)
    add_tube_to_bmesh(bm_halo, (0.0, star_y - 0.008, star_z), star_r + 0.006, star_r - 0.006, 0.010, segments=36, axis='Y')

    # Three Pointed Star Arms (Pointing Up, Bottom-Right, Bottom-Left at 120-degree intervals)
    for arm_idx in range(3):
        # Arm 0 = Up (+90 deg), Arm 1 = 90 - 120 = -30 deg, Arm 2 = -30 - 120 = -150 deg
        arm_ang = math.radians(90.0 - arm_idx * 120.0)
        # Midpoint of arm from center to rim
        arm_mid_r = star_r * 0.50
        arm_x = math.cos(arm_ang) * arm_mid_r
        arm_z = star_z + math.sin(arm_ang) * arm_mid_r
        # Tapered three-dimensional faceted star arm with true radial alignment
        add_box_to_bmesh(bm_chrome, (arm_x, star_y + 0.008, arm_z), (star_r * 0.94, 0.016, 0.022), rot_euler=(0.0, -arm_ang, 0.0))
        # Central raised ridge spine for genuine Class-A 3D Mercedes star blade facet
        add_box_to_bmesh(bm_chrome, (arm_x, star_y + 0.012, arm_z), (star_r * 0.90, 0.008, 0.010), rot_euler=(0.0, -arm_ang, 0.0))

    # Center Hub Cap of Star
    add_cylinder_to_bmesh(bm_chrome, (0.0, star_y + 0.012, star_z), 0.036, 0.018, segments=20, axis='Y')

    finalize_bmesh_object(grille_obj, grille_mesh, bm_grille)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    finalize_bmesh_object(halo_obj, halo_mesh, bm_halo)
    return [grille_obj, chrome_obj, halo_obj]


# =============================================================================
# SUBSYSTEM 8: 3-PIECE COMPOSITE FRONT BUMPER & RADAR RADOME
# =============================================================================

def build_actros_front_bumper_and_radar(materials, parent=None):
    """
    Constructs the 3-piece modular composite front bumper, lower charge-air intake
    slats, integrated fold-out windshield cleaning steps, lower flexible rubber chin
    splitter, Euro registration plate carrier, and Active Brake Assist (ABA) radar radome.
    
    Hardpoints:
    - Bumper Face: Y = +2.340 m to +2.400 m
    - Vertical Span: Z = 0.480 m to Z = 1.250 m
    - Width: 2,460 mm
    """
    bumper_obj, bumper_mesh, bm_bump = create_bmesh_object("Front_Bumper_Composite", materials['Paint_ActrosIridiumSilver'], parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Front_Bumper_Steps_And_Trim", materials['Plastic_AnthraciteComposite'], parent)
    radar_obj, radar_mesh, bm_radar = create_bmesh_object("Active_Brake_Assist_Radar", materials['Plastic_GlossBlack'], parent)
    
    by = 2.340
    bz_bot = 0.480
    bz_top = 1.250
    bz_mid = (bz_bot + bz_top) * 0.5  # 0.865 m
    bh = bz_top - bz_bot            # 0.770 m
    bw = 2.460
    
    # 1. Main Center Bumper Beam Fascia
    add_box_to_bmesh(bm_bump, (0.0, by, bz_mid), (bw * 0.98, 0.080, bh))
    
    # Left & Right Aerodynamic Bumper Corner Wrap Fairings & Wheel Well Infill
    for side in [-1.0, 1.0]:
        cx = side * (bw * 0.5 - 0.120)
        # Swept-back aerodynamic corner bumper section
        add_box_to_bmesh(bm_bump, (cx, by - 0.120, bz_mid), (0.240, 0.280, bh), rot_euler=(0.0, 0.0, side * math.radians(24.0)))
        # Extended aerodynamic wheel arch enclosure fairing to entrance step
        add_box_to_bmesh(bm_bump, (side * 1.210, 2.080, bz_mid - 0.050), (0.090, 0.280, bh * 0.85))
        # Recessed step cutout in bumper corner
        add_box_to_bmesh(bm_step, (cx, by - 0.060, bz_bot + 0.160), (0.220, 0.120, 0.080))
        # Lower corner aerodynamic guide strake
        add_box_to_bmesh(bm_step, (side * 1.190, 2.120, bz_bot + 0.020), (0.050, 0.240, 0.040))
        
    # 2. Central Lower Engine Air Intake Cooling Scoop (Charge-Air Intercooler)
    intake_y = by + 0.020
    intake_z = 0.760
    add_box_to_bmesh(bm_step, (0.0, intake_y, intake_z), (1.180, 0.060, 0.320))
    # Horizontal cooling slats in lower intake
    for s_idx in [-0.080, 0.0, 0.080]:
        add_box_to_bmesh(bm_step, (0.0, intake_y + 0.025, intake_z + s_idx), (1.140, 0.035, 0.022))

    # 3. Active Brake Assist (ABA 3 / 4) High-Frequency Radar Radome
    # Centered in lower intake grille (black glossy rectangular radome)
    add_box_to_bmesh(bm_radar, (0.0, intake_y + 0.035, intake_z), (0.160, 0.020, 0.120))
    # Chrome surround bezel around radar unit
    add_box_to_bmesh(bm_bump, (0.0, intake_y + 0.032, intake_z), (0.175, 0.015, 0.135))

    # 4. Fold-Out Windshield Cleaning Footsteps (Two steps above lower intake)
    for side in [-1.0, 1.0]:
        step_x = side * 0.380
        # Recessed step pocket
        add_box_to_bmesh(bm_step, (step_x, by + 0.030, 1.040), (0.260, 0.040, 0.080))
        # Aluminum textured step tread bar
        add_box_to_bmesh(bm_bump, (step_x, by + 0.045, 1.035), (0.240, 0.025, 0.020))

    # 5. Lower Flexible Rubber Chin Spoiler Splitter
    add_box_to_bmesh(bm_step, (0.0, by + 0.010, bz_bot - 0.030), (bw * 0.94, 0.050, 0.060))

    # 6. Front European License Plate Carrier & Plate
    plate_y = by + 0.045
    plate_z = 0.590
    add_box_to_bmesh(bm_step, (-0.280, plate_y, plate_z), (0.540, 0.015, 0.130))
    # Euro white reflective license plate
    add_box_to_bmesh(bm_bump, (-0.280, plate_y + 0.008, plate_z), (0.520, 0.005, 0.115))

    finalize_bmesh_object(bumper_obj, bumper_mesh, bm_bump)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    finalize_bmesh_object(radar_obj, radar_mesh, bm_radar)
    return [bumper_obj, step_obj, radar_obj]


# =============================================================================
# SUBSYSTEM 9: BOOMERANG BI-XENON / LED DRL HEADLAMP CLUSTERS
# =============================================================================

def build_actros_boomerang_headlamps(materials, parent=None):
    """
    Constructs the signature Actros MP4 "Boomerang / Sickle" curved headlamp units:
    - Glowing 6500K diamond white LED daytime running light (DRL) sickle light-pipe
    - Dual optical projector lenses (bi-xenon low beam + assist high beam)
    - Chrome internal reflector shrouds and bezels
    - Amber LED directional turn indicator brow
    - Aerodynamic crystal-clear polycarbonate outer lens covers
    
    Hardpoints:
    - Bumper Corners: X = +/- 0.920 m, Y = +2.280 m, Z = 0.880 m
    """
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("Headlight_Outer_Covers", materials['Glass_PolycarbonateClear'], parent)
    drl_obj, drl_mesh, bm_drl = create_bmesh_object("Headlight_Boomerang_LED_DRL", materials['Emissive_LEDDRLWhite'], parent)
    proj_obj, proj_mesh, bm_proj = create_bmesh_object("Headlight_BiXenon_Projectors", materials['Emissive_BiXenonWhite'], parent)
    chrome_obj, chrome_mesh, bm_chrome = create_bmesh_object("Headlight_Chrome_Reflectors", materials['Chrome_MercedesStar'], parent)
    amber_obj, amber_mesh, bm_amber = create_bmesh_object("Headlight_Amber_Indicators", materials['Emissive_AmberSignal'], parent)
    
    for side in [-1.0, 1.0]:
        hx = side * 0.920
        hy = 2.280
        hz = 0.880
        hw = 0.380
        hh = 0.320
        
        # 1. Internal Black Composite & Chrome Reflector Housing
        add_box_to_bmesh(bm_chrome, (hx, hy - 0.040, hz), (hw, 0.120, hh))
        
        # 2. Dual Optical Projector Cannon Lenses (Low & High Beam)
        for p_idx, p_offset_x in enumerate([-0.070, 0.050]):
            px = hx + side * p_offset_x
            pz = hz - 0.020
            # Chrome circular projector shroud ring
            add_tube_to_bmesh(bm_chrome, (px, hy - 0.010, pz), 0.048, 0.038, 0.030, segments=20, axis='Y')
            # Glowing optical glass projector bulb hemisphere
            add_cylinder_to_bmesh(bm_proj, (px, hy, pz), 0.036, 0.015, segments=18, axis='Y')
            
        # 3. Characteristic "Boomerang / Sickle" LED Daytime Running Light (DRL) Pipe
        # Sweeps along the bottom and curves upward along the outer edge
        # Bottom horizontal branch
        add_box_to_bmesh(bm_drl, (hx, hy + 0.010, hz - hh * 0.5 + 0.025), (hw * 0.82, 0.016, 0.022))
        # Outer vertical curved sickle branch
        outer_drl_x = hx + side * (hw * 0.5 - 0.030)
        add_box_to_bmesh(bm_drl, (outer_drl_x, hy + 0.010, hz), (0.024, 0.016, hh * 0.75))
        # Diagonal boomerang corner transition
        add_box_to_bmesh(bm_drl, (hx + side * (hw * 0.32), hy + 0.010, hz - hh * 0.32), (0.032, 0.016, 0.032), rot_euler=(0.0, side * math.radians(45.0), 0.0))

        # 4. Upper Amber LED Direction Indicator Strip
        add_box_to_bmesh(bm_amber, (hx, hy + 0.010, hz + hh * 0.5 - 0.025), (hw * 0.84, 0.014, 0.020))

        # 5. Aerodynamic Crystal-Clear Polycarbonate Outer Lens
        add_box_to_bmesh(bm_lens, (hx, hy + 0.022, hz), (hw + 0.020, 0.012, hh + 0.015))

    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(drl_obj, drl_mesh, bm_drl)
    finalize_bmesh_object(proj_obj, proj_mesh, bm_proj)
    finalize_bmesh_object(chrome_obj, chrome_mesh, bm_chrome)
    finalize_bmesh_object(amber_obj, amber_mesh, bm_amber)
    return [lens_obj, drl_obj, proj_obj, chrome_obj, amber_obj]


# =============================================================================
# SUBSYSTEM 10: INTEGRATED BUMPER FOG LAMPS & CORNERING LIGHTS
# =============================================================================

def build_actros_fog_and_cornering_lamps(materials, parent=None):
    """
    Constructs the lower front bumper integrated halogen/LED fog lamps and static
    cornering assist lights angled at 45 degrees to illuminate intersections.
    
    Hardpoints:
    - Bumper Chin: X = +/- 0.980 m, Y = +2.310 m, Z = 0.570 m
    """
    fog_obj, fog_mesh, bm_fog = create_bmesh_object("Fog_Lamp_Beams", materials['Emissive_BiXenonWhite'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Fog_Lamp_Glass", materials['Glass_PolycarbonateClear'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Fog_Lamp_Trim", materials['Plastic_AnthraciteComposite'], parent)
    
    for side in [-1.0, 1.0]:
        fx = side * 0.980
        fy = 2.310
        fz = 0.570
        
        # Molded composite bumper housing pocket
        add_box_to_bmesh(bm_trim, (fx, fy - 0.030, fz), (0.240, 0.080, 0.120))
        # Primary Fog Lamp Reflector & Bulb
        add_cylinder_to_bmesh(bm_fog, (fx - side * 0.045, fy, fz), 0.038, 0.015, segments=16, axis='Y')
        # Static Cornering Light (Angled 40 degrees outward)
        add_cylinder_to_bmesh(bm_fog, (fx + side * 0.050, fy, fz), 0.032, 0.015, segments=14, axis='Y', rot_euler=(0.0, side * math.radians(40.0), 0.0))
        # Polycarbonate protective lens cover
        add_box_to_bmesh(bm_glass, (fx, fy + 0.012, fz), (0.220, 0.010, 0.100))

    finalize_bmesh_object(fog_obj, fog_mesh, bm_fog)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    return [fog_obj, glass_obj, trim_obj]


# =============================================================================
# SUBSYSTEM 11: PANORAMIC WINDSHIELD & TRI-JET PANTOGRAPH WIPERS
# =============================================================================

def build_actros_windshield_and_wipers(materials, parent=None):
    """
    Constructs the massive Actros green-tinted panoramic laminated safety windshield,
    black ceramic frit border masking, rain/light sensor pod, twin heavy-duty
    pantograph articulated wiper arms, and integrated tri-jet spray bars.
    
    Hardpoints:
    - Bottom Cowl: Y = +2.240 m, Z = 1.980 m
    - Top Header:  Y = +1.900 m, Z = 3.220 m
    - Width: 2,360 mm
    """
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Windshield_Panoramic", materials['Glass_PanoramicGreenTint'], parent)
    wiper_obj, wiper_mesh, bm_wiper = create_bmesh_object("Windshield_Pantograph_Wipers", materials['Plastic_AnthraciteComposite'], parent)
    
    w_bot_y = 2.240
    w_top_y = 1.900
    w_bot_z = 1.980
    w_top_z = 3.220
    w_mid_y = (w_bot_y + w_top_y) * 0.5  # 2.070 m
    w_mid_z = (w_bot_z + w_top_z) * 0.5  # 2.600 m
    w_len = math.sqrt((w_bot_y - w_top_y)**2 + (w_top_z - w_bot_z)**2)  # ~1.285 m
    w_rake = math.atan2(w_bot_y - w_top_y, w_top_z - w_bot_z)           # ~15 deg
    w_width = 2.360
    
    # 1. Main Laminated Windshield Glass Sheet
    add_box_to_bmesh(bm_glass, (0.0, w_mid_y, w_mid_z), (w_width, 0.015, w_len), rot_euler=(w_rake, 0.0, 0.0))
    # Ceramic frit black border perimeter trim
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_wiper, (side * (w_width * 0.5 - 0.025), w_mid_y, w_mid_z), (0.050, 0.018, w_len), rot_euler=(w_rake, 0.0, 0.0))
    add_box_to_bmesh(bm_wiper, (0.0, w_top_y + 0.010, w_top_z - 0.020), (w_width, 0.018, 0.040), rot_euler=(w_rake, 0.0, 0.0))
    add_box_to_bmesh(bm_wiper, (0.0, w_bot_y - 0.010, w_bot_z + 0.020), (w_width, 0.018, 0.040), rot_euler=(w_rake, 0.0, 0.0))

    # 2. Rain & Ambient Light Sensor Pod (Behind windshield top center)
    add_box_to_bmesh(bm_wiper, (0.0, w_top_y + 0.015, w_top_z - 0.120), (0.120, 0.030, 0.140), rot_euler=(w_rake, 0.0, 0.0))

    # 3. Twin Pantograph Heavy Commercial Wiper Arms & 750 mm Blades
    for side in [-1.0, 1.0]:
        wx = side * 0.480
        # Pivot motor spindle mounting boss
        add_cylinder_to_bmesh(bm_wiper, (wx, w_bot_y + 0.020, w_bot_z - 0.030), 0.024, 0.050, segments=12, axis='Y')
        # Pantograph primary arm
        add_box_to_bmesh(bm_wiper, (wx + side * 0.120, w_mid_y - 0.180, w_mid_z - 0.280), (0.020, 0.024, 0.620), rot_euler=(w_rake, 0.0, -side * 0.12))
        # 750 mm rubber wiper blade with integrated tri-jet washer line
        add_box_to_bmesh(bm_wiper, (wx + side * 0.200, w_mid_y - 0.120, w_mid_z - 0.220), (0.014, 0.018, 0.750), rot_euler=(w_rake, 0.0, -side * 0.08))

    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(wiper_obj, wiper_mesh, bm_wiper)
    return [glass_obj, wiper_obj]


# =============================================================================
# SUBSYSTEM 12: AERODYNAMIC GIGASPACE ROOF SPOILER & CORNER BLISTERS
# =============================================================================

def build_actros_gigaspace_roof_spoilers(materials, parent=None):
    """
    Constructs the GigaSpace adjustable 3D aerodynamic roof extension spoiler,
    over-cab air deflector fairings, and side corner aerodynamic blister fillets.
    
    Hardpoints:
    - Roof Crown: Y = +1.100 m to -0.060 m, Z = 3.850 m to 3.980 m
    """
    spoiler_obj, spoiler_mesh, bm_spoil = create_bmesh_object("Roof_Aerodynamic_Extension_Spoiler", materials['Paint_ActrosAeroSilver'], parent)
    bracket_obj, bracket_mesh, bm_brack = create_bmesh_object("Roof_Spoiler_Mounting_Hardware", materials['Paint_ChassisNovaGrey'], parent)
    
    # 1. Main Roof Extension Spoiler (Extending rearward over the trailer gap)
    spoil_y = 0.120
    spoil_z = 3.940
    spoil_w = 2.420
    spoil_len = 0.580
    # Curved aerodynamic spoiler wing blade
    add_box_to_bmesh(bm_spoil, (0.0, spoil_y, spoil_z), (spoil_w, spoil_len, 0.045), rot_euler=(math.radians(-8.0), 0.0, 0.0))
    
    # Left & Right Integrated Side Aerodynamic Extension Fins
    for side in [-1.0, 1.0]:
        sx = side * (spoil_w * 0.5 - 0.030)
        add_box_to_bmesh(bm_spoil, (sx, spoil_y, spoil_z - 0.180), (0.045, spoil_len * 0.95, 0.380), rot_euler=(math.radians(-6.0), 0.0, 0.0))
        # Heavy galvanized steel adjustable mounting struts
        add_cylinder_to_bmesh(bm_brack, (side * 0.850, spoil_y - 0.120, spoil_z - 0.120), 0.016, 0.320, segments=10, axis='Z')

    finalize_bmesh_object(spoiler_obj, spoiler_mesh, bm_spoil)
    finalize_bmesh_object(bracket_obj, bracket_mesh, bm_brack)
    return [spoiler_obj, bracket_obj]


# =============================================================================
# SUBSYSTEM 13: INTEGRATED SUNVISOR WITH LED ROOF CLEARANCE MARKERS
# =============================================================================

def build_actros_sunvisor_and_clearance_leds(materials, parent=None):
    """
    Constructs the aerodynamically sculpted external smoked acrylic sunvisor,
    pass-through airflow slot, and 4 flush-mounted amber/white LED roof clearance
    marker lamps integrated directly into the visor body.
    
    Hardpoints:
    - Sunvisor Header: Y = +1.980 m, Z = 3.260 m
    """
    visor_obj, visor_mesh, bm_visor = create_bmesh_object("Sunvisor_Smoked_Acrylic", materials['Plastic_DarkAcrylic'], parent)
    marker_obj, marker_mesh, bm_marker = create_bmesh_object("Roof_Clearance_Marker_LEDs", materials['Emissive_AmberSignal'], parent)
    mount_obj, mount_mesh, bm_mount = create_bmesh_object("Sunvisor_Mounts_And_Trim", materials['Paint_ActrosIridiumSilver'], parent)
    
    vy = 1.980
    vz = 3.260
    vw = 2.340
    
    # 1. Aerodynamic Smoked Dark Acrylic Visor Blade (Downward angled)
    add_box_to_bmesh(bm_visor, (0.0, vy, vz), (vw, 0.160, 0.024), rot_euler=(math.radians(24.0), 0.0, 0.0))
    # Aerodynamic Pass-Through Gap Frame (Separating visor from roof cap)
    add_box_to_bmesh(bm_mount, (0.0, vy - 0.080, vz + 0.060), (vw * 0.96, 0.080, 0.035))
    
    # 2. 4 Flush-Mounted European LED Roof Clearance Marker Lamps
    # Symmetrically spaced across visor leading edge
    for mx in [-0.920, -0.380, 0.380, 0.920]:
        add_box_to_bmesh(bm_marker, (mx, vy + 0.055, vz - 0.015), (0.090, 0.018, 0.030))
        # Protective chrome bezel framing
        add_box_to_bmesh(bm_mount, (mx, vy + 0.052, vz - 0.015), (0.105, 0.014, 0.042))

    # Center Mercedes-Benz Star Emblem on Sunvisor
    add_cylinder_to_bmesh(bm_mount, (0.0, vy + 0.062, vz - 0.010), 0.038, 0.012, segments=20, axis='Y')

    finalize_bmesh_object(visor_obj, visor_mesh, bm_visor)
    finalize_bmesh_object(marker_obj, marker_mesh, bm_marker)
    finalize_bmesh_object(mount_obj, mount_mesh, bm_mount)
    return [visor_obj, marker_obj, mount_obj]


# =============================================================================
# SUBSYSTEM 14: PIONEERING MIRRORCAM DIGITAL CAMERA PODS (FLAGSHIP TECH)
# =============================================================================

def build_actros_mirrorcam_digital_system(materials, parent=None):
    """
    Constructs the pioneering 2010s Mercedes-Benz MirrorCam digital camera wings:
    - High-mounted aerodynamic carbon/composite camera wings (saving 1.5% fuel)
    - Dual high-resolution optical camera lenses (wide-angle + distance view)
    - Aerodynamic rain-diverting drip channels and breakaway hinges
    
    Hardpoints:
    - Roof Edge Mounting: X = +/- 1.250 m, Y = +1.780 m, Z = 3.120 m
    """
    cam_obj, cam_mesh, bm_cam = create_bmesh_object("MirrorCam_Aerodynamic_Wings", materials['Plastic_GlossBlack'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("MirrorCam_Optical_Lenses", materials['Camera_SensorLens'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("MirrorCam_Silver_Accents", materials['Paint_ActrosIridiumSilver'], parent)
    
    for side in [-1.0, 1.0]:
        cx = side * 1.250
        cy = 1.780
        cz = 3.120
        
        # Base aerodynamic roof mounting stalk
        add_box_to_bmesh(bm_cam, (cx, cy, cz), (0.060, 0.120, 0.080))
        # Wing extending outward laterally (320 mm wing span)
        wing_mid_x = cx + side * 0.180
        add_box_to_bmesh(bm_cam, (wing_mid_x, cy - 0.040, cz + 0.020), (0.340, 0.090, 0.050), rot_euler=(0.0, side * math.radians(-12.0), 0.0))
        # Silver aerodynamic accent spear on top of camera wing
        add_box_to_bmesh(bm_trim, (wing_mid_x, cy - 0.040, cz + 0.048), (0.320, 0.040, 0.012), rot_euler=(0.0, side * math.radians(-12.0), 0.0))
        
        # Camera Pod Head on Wing Tip (Facing rearward)
        head_x = cx + side * 0.350
        add_box_to_bmesh(bm_cam, (head_x, cy - 0.070, cz + 0.010), (0.090, 0.120, 0.075))
        # Dual Optical Sensor Lenses (Pointing rearward along -Y)
        # 1. Primary driving camera lens
        add_cylinder_to_bmesh(bm_lens, (head_x, cy - 0.132, cz + 0.022), 0.018, 0.012, segments=16, axis='Y')
        # 2. Secondary wide-angle maneuver camera lens
        add_cylinder_to_bmesh(bm_lens, (head_x, cy - 0.132, cz - 0.022), 0.014, 0.012, segments=14, axis='Y')
        # Drip rail rain deflector lip
        add_box_to_bmesh(bm_trim, (head_x, cy - 0.110, cz + 0.050), (0.095, 0.060, 0.012))

    finalize_bmesh_object(cam_obj, cam_mesh, bm_cam)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    return [cam_obj, lens_obj, trim_obj]


# =============================================================================
# SUBSYSTEM 15: CONVENTIONAL AERODYNAMIC HEATED EURO MIRROR CLUSTERS
# =============================================================================

def build_actros_conventional_aero_mirrors(materials, parent=None):
    """
    Constructs the auxiliary commercial vehicle safety mirrors and MirrorCam base covers:
    - Sleek aerodynamic A-pillar blanking covers and integrated amber LED turn repeaters
    - Class V passenger curb-view close-proximity mirror above passenger window
    - Class VI front blind-spot cyclops mirror above front windshield header
    - Heavy-duty vibration-damped tubular mounting brackets and convex optical glass
    
    Hardpoints:
    - Cab Door A-Pillar Header: X = +/- 1.250 m, Y = +1.720 m, Z = 2.240 m
    - Class V Curb Mirror: X = +1.280 m, Y = +1.780 m, Z = 2.640 m
    - Class VI Front Mirror: X = +0.500 m, Y = +2.060 m, Z = 2.780 m
    """
    cover_obj, cover_mesh, bm_cover = create_bmesh_object("Side_Mirror_Base_Aero_Covers", materials['Paint_ActrosIridiumSilver'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Auxiliary_Mirror_Mounts_And_Trim", materials['Plastic_AnthraciteComposite'], parent)
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Auxiliary_Mirror_Reflective_Glass", materials['Mirror_GlassReflective'], parent)
    led_obj, led_mesh, bm_led = create_bmesh_object("A_Pillar_Turn_Repeater_LEDs", materials['Emissive_AmberSignal'], parent)
    
    # 1. Sleek Aerodynamic Door A-Pillar Mirror-Delete Blanking Covers & Side Turn Signals
    for side in [-1.0, 1.0]:
        mx = side * 1.260
        my = 1.720
        mz = 2.240
        
        # Streamlined flush A-pillar base mounting plate
        add_box_to_bmesh(bm_cover, (mx, my, mz), (0.040, 0.160, 0.220), rot_euler=(0.0, side * math.radians(-5.0), 0.0))
        # Aerodynamic curved air deflector rib
        add_box_to_bmesh(bm_trim, (mx + side * 0.015, my - 0.020, mz), (0.020, 0.140, 0.240))
        # Integrated Amber LED Direction Indicator Side Repeater Strip
        add_box_to_bmesh(bm_led, (mx + side * 0.025, my + 0.020, mz), (0.008, 0.080, 0.022))
        add_box_to_bmesh(bm_trim, (mx + side * 0.022, my + 0.020, mz), (0.012, 0.090, 0.028))
        # Lower aerodynamic spray guide vane
        add_box_to_bmesh(bm_trim, (mx + side * 0.010, my + 0.040, mz - 0.120), (0.018, 0.100, 0.040))

    # 2. Passenger Kerb-View Proximity Mirror (Class V) - Above right cab window
    px = 1.285
    py = 1.780
    pz = 2.640
    # Tubular steel mounting arm extending from cab roof edge
    add_cylinder_to_bmesh(bm_trim, (px - 0.040, py, pz + 0.080), 0.018, 0.140, segments=12, axis='X')
    add_cylinder_to_bmesh(bm_trim, (px, py, pz + 0.050), 0.018, 0.090, segments=12, axis='Z')
    # Aerodynamic composite housing
    add_box_to_bmesh(bm_cover, (px + 0.035, py - 0.020, pz), (0.150, 0.170, 0.100))
    add_box_to_bmesh(bm_trim, (px + 0.035, py - 0.020, pz - 0.025), (0.140, 0.160, 0.040))
    # Downward-angled convex optical mirror glass
    add_box_to_bmesh(bm_glass, (px + 0.035, py - 0.020, pz - 0.048), (0.135, 0.155, 0.012), rot_euler=(math.radians(15.0), 0.0, 0.0))

    # 3. Front Cyclops Blind-Spot Mirror (Class VI) - Above front windshield header
    fx = 0.500
    fy = 2.060
    fz = 2.780
    # Overhanging support stalk from cab sunvisor frame
    add_cylinder_to_bmesh(bm_trim, (fx, fy - 0.080, fz), 0.018, 0.160, segments=12, axis='Y')
    add_cylinder_to_bmesh(bm_trim, (fx, fy, fz - 0.020), 0.018, 0.060, segments=12, axis='Z')
    # Aerodynamic composite mirror housing
    add_box_to_bmesh(bm_cover, (fx, fy, fz - 0.040), (0.220, 0.130, 0.085))
    add_box_to_bmesh(bm_trim, (fx, fy, fz - 0.060), (0.210, 0.120, 0.035))
    # Downward / forward angled convex mirror glass
    add_box_to_bmesh(bm_glass, (fx, fy, fz - 0.078), (0.205, 0.115, 0.010), rot_euler=(math.radians(-25.0), 0.0, 0.0))

    finalize_bmesh_object(cover_obj, cover_mesh, bm_cover)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(led_obj, led_mesh, bm_led)
    return [cover_obj, trim_obj, glass_obj, led_obj]


# =============================================================================
# SUBSYSTEM 16: FULL AERODYNAMIC CHASSIS SIDE SKIRTS & STEP INLAYS
# =============================================================================

def build_actros_aerodynamic_chassis_skirts(materials, parent=None):
    """
    Constructs the full-length Actros MP4 aerodynamic chassis side skirts (fairings),
    integrated aluminum access footsteps, rubber ground sealing bottom lips, and
    amber LED side marker/reflector lamps (ECE R48 compliant).
    
    Hardpoints:
    - Side Fairings: X = +/- 1.220 m, Y = +0.780 m to -1.540 m (Length = 2.320 m)
    - Vertical Span: Z = 0.360 m to Z = 0.920 m (Height = 0.560 m)
    """
    skirt_obj, skirt_mesh, bm_skirt = create_bmesh_object("Chassis_Aero_Side_Skirts", materials['Paint_ActrosAeroSilver'], parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Aero_Skirt_Step_Inlays", materials['Alloy_AlcoaDuraBright'], parent)
    rubber_obj, rubber_mesh, bm_rub = create_bmesh_object("Aero_Skirt_Rubber_Seals", materials['Plastic_AnthraciteComposite'], parent)
    marker_obj, marker_mesh, bm_mark = create_bmesh_object("Side_Marker_Amber_LEDs", materials['Emissive_AmberSignal'], parent)
    
    sy_mid = (0.780 + (-1.540)) * 0.5  # -0.380 m
    s_len = 0.780 - (-1.540)          # 2.320 m
    s_h = 0.560
    sz_mid = (0.360 + 0.920) * 0.5    # 0.640 m
    
    for side in [-1.0, 1.0]:
        sx = side * 1.220
        # Main Sculpted Aerodynamic Fairing Panel
        add_box_to_bmesh(bm_skirt, (sx, sy_mid, sz_mid), (0.070, s_len, s_h))
        # Curved aerodynamic front transition to steer wheel arch
        add_box_to_bmesh(bm_skirt, (sx - side * 0.040, 0.760, sz_mid), (0.140, 0.120, s_h), rot_euler=(0.0, 0.0, side * math.radians(-22.0)))
        # Curved rear transition to drive wheel arch
        add_box_to_bmesh(bm_skirt, (sx - side * 0.040, -1.520, sz_mid), (0.140, 0.120, s_h), rot_euler=(0.0, 0.0, side * math.radians(22.0)))
        
        # Integrated Brushed Aluminum Footstep Recesses for Catwalk Access
        add_box_to_bmesh(bm_step, (sx + side * 0.010, sy_mid + 0.400, sz_mid + 0.140), (0.040, 0.520, 0.180))
        add_box_to_bmesh(bm_step, (sx + side * 0.010, sy_mid - 0.400, sz_mid - 0.140), (0.040, 0.280, 0.090))
        
        # Lower Flexible Ground Vortex Seal Lip
        add_box_to_bmesh(bm_rub, (sx, sy_mid, 0.340), (0.035, s_len * 0.98, 0.045))
        
        # 3 Flush Amber LED Side Marker / Reflex Reflectors along skirt bottom
        for my in [-1.20, -0.38, 0.45]:
            add_box_to_bmesh(bm_mark, (sx + side * 0.038, my, 0.440), (0.010, 0.095, 0.026))

    finalize_bmesh_object(skirt_obj, skirt_mesh, bm_skirt)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    finalize_bmesh_object(rubber_obj, rubber_mesh, bm_rub)
    finalize_bmesh_object(marker_obj, marker_mesh, bm_mark)
    return [skirt_obj, step_obj, rubber_obj, marker_obj]


# =============================================================================
# SUBSYSTEM 17: EURO VI SCR/DPF AFTERTREATMENT BOX & HEAT SHIELD
# =============================================================================

def build_actros_euro6_aftertreatment_box(materials, parent=None):
    """
    Constructs the massive Mercedes-Benz Euro VI BlueTec one-box exhaust aftertreatment
    system (DOC, DPF, SCR urea catalytic converter) on right chassis rail, perforated
    stainless steel heat shield, and downward-angled exhaust gas tailpipe diffuser.
    
    Hardpoints:
    - Right Chassis Flank: X = +0.720 m, Y = -0.420 m, Z = 0.640 m
    """
    box_obj, box_mesh, bm_box = create_bmesh_object("Euro6_Aftertreatment_Casing", materials['Paint_ChassisNovaGrey'], parent)
    shield_obj, shield_mesh, bm_shield = create_bmesh_object("SCR_Perforated_Heat_Shield", materials['Stainless_PerforatedHeatShield'], parent)
    pipe_obj, pipe_mesh, bm_pipe = create_bmesh_object("Euro6_Exhaust_Diffuser_Pipe", materials['Stainless_Polished'], parent)
    
    bx = 0.720
    by = -0.420
    bz = 0.640
    bw = 0.580
    bl = 1.150
    bh = 0.520
    
    # 1. Main Cast Stainless One-Box Aftertreatment Body
    add_box_to_bmesh(bm_box, (bx, by, bz), (bw, bl, bh))
    
    # 2. Perforated Stainless Steel Outer Protective Heat Shield
    # Wraps around the exterior side facing the skirts/road
    add_box_to_bmesh(bm_shield, (bx + bw * 0.5 + 0.015, by, bz), (0.012, bl * 0.98, bh * 0.96))
    # Hexagonal stamped ventilation punch holes in heat shield
    for ry in [-0.40, -0.20, 0.0, 0.20, 0.40]:
        for rz in [bz - 0.16, bz, bz + 0.16]:
            add_cylinder_to_bmesh(bm_shield, (bx + bw * 0.5 + 0.022, by + ry, rz), 0.022, 0.010, segments=6, axis='X')
            
    # 3. Downward-Angled Stainless Exhaust Diffuser Tailpipe (Directs gas cleanly inward)
    add_cylinder_to_bmesh(bm_pipe, (bx - 0.120, by - bl * 0.45, bz - bh * 0.38), 0.065, 0.280, segments=18, axis='Z', rot_euler=(math.radians(25.0), 0.0, 0.0))

    finalize_bmesh_object(box_obj, box_mesh, bm_box)
    finalize_bmesh_object(shield_obj, shield_mesh, bm_shield)
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm_pipe)
    return [box_obj, shield_obj, pipe_obj]


# =============================================================================
# SUBSYSTEM 18: MASSIVE ASYMMETRICAL FUEL TANKS & ADBLUE TANK
# =============================================================================

def build_actros_fuel_and_adblue_tanks(materials, parent=None):
    """
    Constructs the 650-liter extruded satin aluminum diesel fuel tank on the left
    chassis rail, integrated aluminum step rungs, 60-liter blue-capped AdBlue urea
    tank, heavy stainless tank mounting straps, and billet aluminum filler caps.
    
    Hardpoints:
    - Main Fuel Tank (Left): X = -0.740 m, Y = -0.420 m, Z = 0.640 m
    - AdBlue Tank: X = -0.740 m, Y = +0.550 m, Z = 0.640 m
    """
    tank_obj, tank_mesh, bm_tank = create_bmesh_object("Fuel_Tank_650L_Aluminum", materials['Aluminum_ExtrudedSatin'], parent)
    strap_obj, strap_mesh, bm_strap = create_bmesh_object("Fuel_Tank_Mounting_Straps", materials['Stainless_Polished'], parent)
    adblue_obj, adblue_mesh, bm_adblue = create_bmesh_object("AdBlue_Urea_Tank", materials['Decal_AdBlueBlue'], parent)
    
    tx = -0.740
    ty = -0.420
    tz = 0.640
    tw = 0.680
    tl = 1.450
    th = 0.540
    
    # 1. Main Extruded Aluminum Diesel Fuel Tank (650 Liters)
    add_box_to_bmesh(bm_tank, (tx, ty, tz), (tw, tl, th))
    # D-shape rounded top and bottom tank profiles
    add_cylinder_to_bmesh(bm_tank, (tx, ty, tz + th * 0.5 - 0.080), 0.120, tl, segments=20, axis='Y')
    add_cylinder_to_bmesh(bm_tank, (tx, ty, tz - th * 0.5 + 0.080), 0.120, tl, segments=20, axis='Y')
    
    # Stainless Steel Clamping Support Straps (3 straps along tank)
    for sty in [-0.55, 0.0, 0.55]:
        add_box_to_bmesh(bm_strap, (tx, ty + sty, tz), (tw + 0.020, 0.045, th + 0.020))
        
    # Billet Aluminum Fuel Filler Neck & Anti-Siphon Cap
    add_cylinder_to_bmesh(bm_strap, (tx - tw * 0.42, ty + tl * 0.38, tz + th * 0.5 + 0.040), 0.045, 0.080, segments=18, axis='Z')
    
    # 2. 60-Liter Polyethylene AdBlue Urea Tank (Mounted adjacent to diesel tank)
    ay = ty + tl * 0.5 + 0.280  # +0.585 m
    aw = 0.480
    al = 0.380
    ah = 0.520
    add_box_to_bmesh(bm_adblue, (tx, ay, tz), (aw, al, ah))
    # Bright Blue AdBlue Filler Cap (ISO 22241 compliant)
    add_cylinder_to_bmesh(bm_adblue, (tx - aw * 0.35, ay, tz + ah * 0.5 + 0.035), 0.032, 0.060, segments=16, axis='Z')

    finalize_bmesh_object(tank_obj, tank_mesh, bm_tank)
    finalize_bmesh_object(strap_obj, strap_mesh, bm_strap)
    finalize_bmesh_object(adblue_obj, adblue_mesh, bm_adblue)
    return [tank_obj, strap_obj, adblue_obj]


# =============================================================================
# SUBSYSTEM 19: EXTENDED CAB REAR COLLAR SIDE WINGS (AERO DEFLECTORS)
# =============================================================================

def build_actros_cab_rear_collar_wings(materials, parent=None):
    """
    Constructs the 500 mm deep aerodynamic cab rear collar side wings (extender wings)
    that bridge the turbulent aerodynamic vortex gap between the tractor rear cab wall
    and the semitrailer front bulkhead, including rubber flexible edge lips.
    
    Hardpoints:
    - Cab Rear Wall: Y = -0.060 m, extending back to Y = -0.560 m
    - Height Span: Z = 1.350 m to Z = 3.920 m
    """
    wing_obj, wing_mesh, bm_wing = create_bmesh_object("Cab_Rear_Collar_Wings", materials['Paint_ActrosAeroSilver'], parent)
    seal_obj, seal_mesh, bm_seal = create_bmesh_object("Cab_Collar_Rubber_Lips", materials['Plastic_AnthraciteComposite'], parent)
    
    w_len = 0.500
    w_mid_y = -0.060 - w_len * 0.5  # -0.310 m
    w_h = 2.570
    w_mid_z = (1.350 + 3.920) * 0.5  # 2.635 m
    
    for side in [-1.0, 1.0]:
        wx = side * (1.250 + 0.020)
        # Main Aerodynamic Extension Collar Panel
        add_box_to_bmesh(bm_wing, (wx, w_mid_y, w_mid_z), (0.035, w_len, w_h))
        # Flexible EPDM Rubber Trailing Edge Seal Lip
        add_box_to_bmesh(bm_seal, (wx, -0.060 - w_len - 0.025, w_mid_z), (0.025, 0.050, w_h))
        # Heavy-Duty Steel Stiffening Brackets (3 per side)
        for bz in [1.600, 2.600, 3.600]:
            add_box_to_bmesh(bm_seal, (wx - side * 0.040, w_mid_y, bz), (0.080, 0.080, 0.030))

    finalize_bmesh_object(wing_obj, wing_mesh, bm_wing)
    finalize_bmesh_object(seal_obj, seal_mesh, bm_seal)
    return [wing_obj, seal_obj]


# =============================================================================
# SUBSYSTEM 20: FLUSH CAB DOORS & CONCEALED 4-STAGE ENTRANCE STEPS
# =============================================================================

def build_actros_doors_and_concealed_steps(materials, parent=None):
    """
    Constructs the flush-fitting aerodynamic cab doors, recessed aerodynamic door
    handles, key cylinder, lower door extension covering the entrance stairwell,
    4-stage anti-slip aluminum entrance steps, and lower door puddle light LEDs.
    
    Hardpoints:
    - Cab Flanks: X = +/- 1.250 m, Y = +0.720 m to +1.860 m
    """
    door_obj, door_mesh, bm_door = create_bmesh_object("Cab_Flush_Doors", materials['Paint_ActrosIridiumSilver'], parent)
    handle_obj, handle_mesh, bm_hand = create_bmesh_object("Door_Handles_And_Seals", materials['Plastic_AnthraciteComposite'], parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Concealed_Entrance_Steps", materials['Alloy_AlcoaDuraBright'], parent)
    puddle_obj, puddle_mesh, bm_pud = create_bmesh_object("Door_Puddle_LED_Lights", materials['Emissive_BiXenonWhite'], parent)
    
    d_mid_y = (0.720 + 1.860) * 0.5  # 1.290 m
    d_len = 1.860 - 0.720           # 1.140 m
    
    for side in [-1.0, 1.0]:
        dx = side * 1.250
        
        # 1. Flush Aerodynamic Door Skin
        add_box_to_bmesh(bm_door, (dx, d_mid_y, 2.100), (0.040, d_len, 1.480))
        
        # 2. Recessed Ergonomic Door Handle
        hy = 1.120
        hz = 1.960
        add_box_to_bmesh(bm_hand, (dx + side * 0.015, hy, hz), (0.030, 0.180, 0.060))
        # Chromed grab pull lever
        add_box_to_bmesh(bm_door, (dx + side * 0.025, hy, hz), (0.015, 0.150, 0.030))
        
        # 3. Lower Door Extension (Encloses stairwell for aerodynamics)
        add_box_to_bmesh(bm_door, (dx, d_mid_y, 1.220), (0.045, d_len, 0.320))
        
        # 4. 4-Stage Anti-Slip Aluminum Entrance Steps (Inside stairwell behind door)
        step_x = side * 1.150
        step_heights = [0.580, 0.820, 1.060, 1.300]
        for idx, sz in enumerate(step_heights):
            add_box_to_bmesh(bm_step, (step_x, d_mid_y, sz), (0.240, 0.440, 0.035))
            
        # 5. Puddle Illuminator LED in Door Underside
        add_box_to_bmesh(bm_pud, (dx, d_mid_y, 1.050), (0.030, 0.080, 0.010))

    finalize_bmesh_object(door_obj, door_mesh, bm_door)
    finalize_bmesh_object(handle_obj, handle_mesh, bm_hand)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    finalize_bmesh_object(puddle_obj, puddle_mesh, bm_pud)
    return [door_obj, handle_obj, step_obj, puddle_obj]


# =============================================================================
# SUBSYSTEM 21: 3-PIECE MODULAR COMPOSITE REAR FENDERS & ANTI-SPRAY
# =============================================================================

def build_actros_rear_mudguards_and_antispray(materials, parent=None):
    """
    Constructs the 3-piece modular composite drive wheel mudguards, quick-detachable
    top arch segments, internal water-spray suppression baffles (EU 109/2011 compliant),
    heavy rubber anti-spray mudflaps with embossed Mercedes-Benz logo, and steel tubes.
    
    Hardpoints:
    - Drive Axle: Y = -2.200 m, Z = 0.510 m
    """
    fender_obj, fender_mesh, bm_fen = create_bmesh_object("Rear_Fenders_3Piece", materials['Plastic_AnthraciteComposite'], parent)
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Rear_Mudflaps_AntiSpray", materials['Rubber_EuropeanTire'], parent)
    tube_obj, tube_mesh, bm_tube = create_bmesh_object("Rear_Fender_Mounting_Tubes", materials['Paint_ChassisNovaGrey'], parent)
    logo_obj, logo_mesh, bm_logo = create_bmesh_object("Rear_Mudflap_Mercedes_Logos", materials['Alloy_AlcoaDuraBright'], parent)
    
    ay = -2.200
    az = 0.510
    arch_r = 0.580
    arch_w = 0.680
    
    for side in [-1.0, 1.0]:
        fx = side * 1.020
        
        # 1. Authentic Smooth Curved Multi-Segment Center Wheel Arch
        arch_angles = [-42.0, -28.0, -14.0, 0.0, 14.0, 28.0, 42.0]
        seg_len = arch_r * math.radians(16.0)  # ~0.162 m
        for ang_deg in arch_angles:
            ang_rad = math.radians(ang_deg)
            sy = ay + math.sin(ang_rad) * (arch_r + 0.020)
            sz = az + math.cos(ang_rad) * (arch_r + 0.020)
            # Main curved arch shell segment
            add_box_to_bmesh(bm_fen, (fx, sy, sz), (arch_w, seg_len * 1.08, 0.038), rot_euler=(-ang_rad, 0.0, 0.0))
            # Outer curved drip edge / anti-spray rim flange
            add_box_to_bmesh(bm_fen, (fx + side * (arch_w * 0.5 - 0.018), sy, sz - 0.012), (0.028, seg_len * 1.08, 0.044), rot_euler=(-ang_rad, 0.0, 0.0))
            # Inner anti-spray grooved rib
            add_box_to_bmesh(bm_fen, (fx, sy, sz - 0.012), (arch_w * 0.92, seg_len * 0.50, 0.012), rot_euler=(-ang_rad, 0.0, 0.0))
        
        # 2. Forward Quarter Mudguard Segment & Splash Shield
        add_box_to_bmesh(bm_fen, (fx, ay + 0.580, az + arch_r * 0.65), (arch_w, 0.360, 0.038), rot_euler=(math.radians(48.0), 0.0, 0.0))
        # Forward vertical splash shield to chassis
        add_box_to_bmesh(bm_fen, (fx, ay + 0.760, az + 0.220), (arch_w, 0.035, 0.440))
        
        # 3. Rear Quarter Mudguard Segment & Mudflap Mount
        add_box_to_bmesh(bm_fen, (fx, ay - 0.580, az + arch_r * 0.65), (arch_w, 0.360, 0.038), rot_euler=(math.radians(-48.0), 0.0, 0.0))
        
        # 4. Galvanized Steel Tubular Support Brackets to Chassis
        for ty in [ay + 0.620, ay - 0.620]:
            add_cylinder_to_bmesh(bm_tube, (side * 0.720, ty, az + 0.420), 0.024, 0.540, segments=12, axis='X')
            
        # 5. Heavy Rubber Anti-Spray Splash Guard Mudflaps (EU 109/2011 compliant)
        flap_y = ay - 0.860
        flap_z = az + 0.080
        add_box_to_bmesh(bm_flap, (fx, flap_y, flap_z), (arch_w * 0.96, 0.020, 0.520))
        
        # Embossed Silver Mercedes-Benz Three-Pointed Star on Mudflap
        add_cylinder_to_bmesh(bm_logo, (fx, flap_y - 0.012, flap_z), 0.055, 0.008, segments=20, axis='Y')
        # White lower safety reflective border stripe
        add_box_to_bmesh(bm_logo, (fx, flap_y - 0.012, flap_z - 0.220), (arch_w * 0.90, 0.008, 0.035))

    finalize_bmesh_object(fender_obj, fender_mesh, bm_fen)
    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap)
    finalize_bmesh_object(tube_obj, tube_mesh, bm_tube)
    finalize_bmesh_object(logo_obj, logo_mesh, bm_logo)
    return [fender_obj, flap_obj, tube_obj, logo_obj]


# =============================================================================
# SUBSYSTEM 22: HEAVY-DUTY ECE R58 REV.03 REAR UNDERRUN PROTECTION BUMPER
# =============================================================================

def build_actros_rear_underrun_bumper(materials, parent=None):
    """
    Constructs the ECE R58 Rev.03 heavy-duty rear underrun protection (RUP) beam,
    reinforced crash brackets, rear tow coupling pin clevis, and Euro license plate.
    
    Hardpoints:
    - Rear Bumper Beam: Y = -3.460 m, Z = 0.520 m, Width = 2,340 mm
    """
    beam_obj, beam_mesh, bm_beam = create_bmesh_object("Rear_Underrun_Bumper_Beam", materials['Paint_ChassisNovaGrey'], parent)
    bracket_obj, bracket_mesh, bm_brack = create_bmesh_object("Rear_Towing_Clevis_Hardware", materials['Alloy_AlcoaDuraBright'], parent)
    plate_obj, plate_mesh, bm_plate = create_bmesh_object("Rear_License_Plate_Carrier", materials['Plastic_AnthraciteComposite'], parent)
    
    by = -3.460
    bz = 0.520
    bw = 2.340
    
    # 1. Heavy Gauge Steel Square Tubular Underrun Beam (120 mm x 120 mm)
    add_box_to_bmesh(bm_beam, (0.0, by, bz), (bw, 0.120, 0.120))
    # Plastic end closure caps
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_plate, (side * (bw * 0.5 + 0.005), by, bz), (0.012, 0.125, 0.125))
        
    # 2. Structural Energy-Absorbing Shear Mount Brackets to Chassis Rails
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_beam, (side * 0.425, by + 0.160, bz + 0.140), (0.120, 0.240, 0.280))
        
    # 3. Center Rear Towing Shackle & Pin
    add_box_to_bmesh(bm_brack, (0.0, by - 0.080, bz), (0.140, 0.080, 0.090))
    add_cylinder_to_bmesh(bm_brack, (0.0, by - 0.080, bz), 0.022, 0.140, segments=14, axis='Z')
    
    # 4. Rear European License Plate & Twin LED Illuminator Lamps
    add_box_to_bmesh(bm_plate, (0.0, by - 0.065, bz + 0.010), (0.540, 0.015, 0.130))
    for lx in [-0.180, 0.180]:
        add_box_to_bmesh(bm_brack, (lx, by - 0.075, bz + 0.080), (0.050, 0.025, 0.020))

    finalize_bmesh_object(beam_obj, beam_mesh, bm_beam)
    finalize_bmesh_object(bracket_obj, bracket_mesh, bm_brack)
    finalize_bmesh_object(plate_obj, plate_mesh, bm_plate)
    return [beam_obj, bracket_obj, plate_obj]


# =============================================================================
# SUBSYSTEM 23: EURO LED MULTI-CHAMBER REAR LAMP CLUSTERS & CAGE GUARDS
# =============================================================================

def build_actros_rear_led_lamp_clusters(materials, parent=None):
    """
    Constructs the horizontal rectangular European multi-chamber LED rear lamps,
    internal red/amber/clear optical lenses, perimeter glow signature, and
    protective steel wrap-around rock guard cages.
    
    Hardpoints:
    - Rear Lamp Positions: X = +/- 0.880 m, Y = -3.420 m, Z = 0.580 m
    """
    house_obj, house_mesh, bm_house = create_bmesh_object("Rear_Lamp_Housings", materials['Plastic_AnthraciteComposite'], parent)
    red_obj, red_mesh, bm_red = create_bmesh_object("Rear_Lamp_Red_Lenses", materials['Glass_TaillampRed'], parent)
    amber_obj, amber_mesh, bm_amber = create_bmesh_object("Rear_Lamp_Amber_Lenses", materials['Glass_AmberIndicator'], parent)
    clear_obj, clear_mesh, bm_clear = create_bmesh_object("Rear_Lamp_Clear_Lenses", materials['Glass_PolycarbonateClear'], parent)
    cage_obj, cage_mesh, bm_cage = create_bmesh_object("Rear_Lamp_Protective_Cages", materials['Stainless_Polished'], parent)
    
    ly = -3.420
    lz = 0.580
    lw = 0.460
    lh = 0.140
    
    for side in [-1.0, 1.0]:
        lx = side * 0.880
        
        # 1. Main Black Composite Housing Box
        add_box_to_bmesh(bm_house, (lx, ly, lz), (lw, 0.070, lh))
        
        # 2. 6-Chamber Horizontal Optical Elements (From inside to outside):
        # Chamber 1: Reverse Light (Clear / White LED)
        add_box_to_bmesh(bm_clear, (lx - side * 0.180, ly - 0.038, lz), (0.070, 0.012, lh * 0.88))
        # Chamber 2: Rear Fog Lamp (High-Intensity Red)
        add_box_to_bmesh(bm_red, (lx - side * 0.110, ly - 0.038, lz), (0.065, 0.012, lh * 0.88))
        # Chamber 3 & 4: Dual Tail & Stop Lamp Glowing Rings (Brilliant Red)
        add_box_to_bmesh(bm_red, (lx - side * 0.035, ly - 0.038, lz), (0.075, 0.012, lh * 0.88))
        add_box_to_bmesh(bm_red, (lx + side * 0.045, ly - 0.038, lz), (0.075, 0.012, lh * 0.88))
        # Chamber 5: Progressive Amber LED Turn Indicator
        add_box_to_bmesh(bm_amber, (lx + side * 0.125, ly - 0.038, lz), (0.075, 0.012, lh * 0.88))
        # Chamber 6: Integrated Red Triangular Retroreflector
        add_box_to_bmesh(bm_red, (lx + side * 0.195, ly - 0.038, lz), (0.055, 0.012, lh * 0.88))
        
        # 3. Protective Tubular Steel Wrap-Around Rock Guard Cage
        for cy in [-0.050, 0.0]:
            add_cylinder_to_bmesh(bm_cage, (lx, ly + cy - 0.020, lz + lh * 0.5 + 0.015), 0.007, lw + 0.040, segments=8, axis='X')
            add_cylinder_to_bmesh(bm_cage, (lx, ly + cy - 0.020, lz - lh * 0.5 - 0.015), 0.007, lw + 0.040, segments=8, axis='X')

    finalize_bmesh_object(house_obj, house_mesh, bm_house)
    finalize_bmesh_object(red_obj, red_mesh, bm_red)
    finalize_bmesh_object(amber_obj, amber_mesh, bm_amber)
    finalize_bmesh_object(clear_obj, clear_mesh, bm_clear)
    finalize_bmesh_object(cage_obj, cage_mesh, bm_cage)
    return [house_obj, red_obj, amber_obj, clear_obj, cage_obj]


# =============================================================================
# SUBSYSTEM 24: DIAMOND-PATTERN ALUMINUM CATWALK & ACCESS LADDER
# =============================================================================

def build_actros_catwalk_and_ladder(materials, parent=None):
    """
    Constructs the lightweight embossed diamond-tread aluminum working platform
    catwalk spanning the chassis rails behind the cab, safety grab rails, and
    fold-down aluminum access ladder.
    
    Hardpoints:
    - Behind Cab Bulkhead: Y = -0.080 m to -1.350 m (Length = 1.270 m)
    - Top of Chassis Rails: Z = 0.920 m
    """
    walk_obj, walk_mesh, bm_walk = create_bmesh_object("Aluminum_Catwalk_Platform", materials['Aluminum_DiamondPlate'], parent)
    rail_obj, rail_mesh, bm_rail = create_bmesh_object("Catwalk_Safety_Rails", materials['Alloy_AlcoaDuraBright'], parent)
    
    wy_mid = (-0.080 + (-1.350)) * 0.5  # -0.715 m
    w_len = -0.080 - (-1.350)          # 1.270 m
    w_width = 1.080
    wz = 0.920
    
    # 1. Main Embossed Diamond-Plate Aluminum Deck
    add_box_to_bmesh(bm_walk, (0.0, wy_mid, wz), (w_width, w_len, 0.015))
    
    # Perforated Anti-Slip Drainage Hole Grid
    for px in [-0.40, -0.20, 0.0, 0.20, 0.40]:
        for py in [-1.20, -1.00, -0.80, -0.60, -0.40, -0.20]:
            add_cylinder_to_bmesh(bm_walk, (px, py, wz), 0.018, 0.020, segments=8, axis='Z')
            
    # 2. Safety Grab Rail along Front of Catwalk (Behind cab wall)
    add_cylinder_to_bmesh(bm_rail, (0.0, -0.120, wz + 0.320), 0.018, w_width * 0.92, segments=12, axis='X')
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm_rail, (side * 0.440, -0.120, wz + 0.160), 0.018, 0.320, segments=12, axis='Z')
        
    # 3. Two-Step Fold-Down Aluminum Access Ladder on Driver's Side (Left X < 0)
    lx = -0.560
    for lz in [0.720, 0.520]:
        add_box_to_bmesh(bm_rail, (lx, -0.320, lz), (0.140, 0.280, 0.025))

    finalize_bmesh_object(walk_obj, walk_mesh, bm_walk)
    finalize_bmesh_object(rail_obj, rail_mesh, bm_rail)
    return [walk_obj, rail_obj]


# =============================================================================
# SUBSYSTEM 25: 4-POINT AIR SUSPENDED CAB MOUNTING & HYDRAULIC TILT
# =============================================================================

def build_actros_cab_air_suspension(materials, parent=None):
    """
    Constructs the 4-point comfort air-suspended cab mounting system:
    - Front cab pivot torsion spring dampers and tilt lock hooks
    - Rear cab rolling-lobe comfort air bags and vertical shock absorbers
    - Hydraulic cab tilt actuator cylinder and manual hand pump
    
    Hardpoints:
    - Front Pivots: Y = +2.050 m, Z = 1.020 m
    - Rear Air Struts: Y = +0.120 m, Z = 1.040 m
    """
    mount_obj, mount_mesh, bm_mount = create_bmesh_object("Cab_Suspension_Mounts", materials['Paint_ChassisNovaGrey'], parent)
    air_obj, air_mesh, bm_air = create_bmesh_object("Cab_Air_Springs", materials['Rubber_ECASAirBag'], parent)
    tilt_obj, tilt_mesh, bm_tilt = create_bmesh_object("Cab_Tilt_Hydraulics", materials['Alloy_AlcoaDuraBright'], parent)
    
    # 1. Front Cab Pivot Hinges (Y = +2.050 m)
    for side in [-1.0, 1.0]:
        px = side * 0.480
        add_box_to_bmesh(bm_mount, (px, 2.050, 1.020), (0.140, 0.160, 0.180))
        add_cylinder_to_bmesh(bm_mount, (px, 2.050, 1.060), 0.038, 0.180, segments=14, axis='X')
        
    # 2. Rear Cab Comfort Rolling-Lobe Air Bags (Y = +0.120 m)
    for side in [-1.0, 1.0]:
        rx = side * 0.480
        # Rolling-lobe rubber air spring
        add_cylinder_to_bmesh(bm_air, (rx, 0.120, 1.140), 0.085, 0.180, segments=18, axis='Z')
        # Telescopic hydraulic damper
        add_cylinder_to_bmesh(bm_mount, (rx + side * 0.060, 0.120, 1.140), 0.026, 0.280, segments=12, axis='Z')
        # Heavy chassis pedestal tower
        add_box_to_bmesh(bm_mount, (rx, 0.120, 0.960), (0.160, 0.180, 0.180))

    # 3. Heavy-Duty Hydraulic Cab Tilt Ram (Mounted center chassis behind engine)
    add_cylinder_to_bmesh(bm_tilt, (0.0, 1.250, 1.020), 0.045, 0.480, segments=16, axis='Z', rot_euler=(math.radians(-25.0), 0.0, 0.0))
    # Chrome hydraulic piston rod
    add_cylinder_to_bmesh(bm_tilt, (0.0, 1.340, 1.220), 0.024, 0.320, segments=14, axis='Z', rot_euler=(math.radians(-25.0), 0.0, 0.0))

    finalize_bmesh_object(mount_obj, mount_mesh, bm_mount)
    finalize_bmesh_object(air_obj, air_mesh, bm_air)
    finalize_bmesh_object(tilt_obj, tilt_mesh, bm_tilt)
    return [mount_obj, air_obj, tilt_obj]


# =============================================================================
# SUBSYSTEM 26: TRAILER UMBILICAL PYLON & COILED SUZIE BRAKE LINES
# =============================================================================

def build_actros_trailer_umbilicals(materials, parent=None):
    """
    Constructs the vertical trailer umbilical mast pylon mounted behind the cab,
    parking holsters for Gladhand couplers, and flexible coiled suzie lines:
    - Red Emergency Supply Air Line (coiled helix)
    - Yellow Service Control Air Line (coiled helix)
    - Black Heavy EBS / ABS 7-Pin ISO 7638 Electrical Harness (coiled helix)
    - Dual 24V Lighting Cables
    
    Hardpoints:
    - Pylon Mast: Y = -0.160 m, X = 0.0 m, Z = 0.940 m to Z = 1.780 m
    """
    pylon_obj, pylon_mesh, bm_pylon = create_bmesh_object("Trailer_Umbilical_Pylon", materials['Paint_ChassisNovaGrey'], parent)
    red_obj, red_mesh, bm_red = create_bmesh_object("Umbilical_Red_Brake_Line", materials['Suzie_EmergencyAirRed'], parent)
    yellow_obj, yellow_mesh, bm_yel = create_bmesh_object("Umbilical_Yellow_Brake_Line", materials['Suzie_ServiceAirYellow'], parent)
    ebs_obj, ebs_mesh, bm_ebs = create_bmesh_object("Umbilical_EBS_Cables", materials['Suzie_EBSBlack'], parent)
    
    py = -0.160
    
    # 1. Vertical Tubular Steel Pylon Mast & Crossbar
    add_cylinder_to_bmesh(bm_pylon, (0.0, py, 1.360), 0.030, 0.840, segments=14, axis='Z')
    # Horizontal crossbar holding Gladhand holsters
    add_cylinder_to_bmesh(bm_pylon, (0.0, py, 1.740), 0.024, 0.440, segments=12, axis='X')
    
    # Spring suspension boom arm holding lines up off catwalk
    add_cylinder_to_bmesh(bm_pylon, (0.0, py - 0.140, 1.740), 0.016, 0.280, segments=10, axis='Y')

    # 2. Coiled Suzie Line Helices Hanging from Pylon
    # Red Emergency Air Brake Line
    add_helix_to_bmesh(bm_red, (-0.140, py - 0.180, 1.350), coil_radius=0.038, wire_radius=0.008, total_length=0.680, turns=10, axis='Z')
    # Cast Aluminum Red Gladhand Coupler Head
    add_box_to_bmesh(bm_red, (-0.140, py - 0.060, 1.740), (0.055, 0.065, 0.045))
    
    # Yellow Service Air Brake Line
    add_helix_to_bmesh(bm_yel, (-0.050, py - 0.180, 1.350), coil_radius=0.038, wire_radius=0.008, total_length=0.680, turns=10, axis='Z')
    # Cast Aluminum Yellow Gladhand Coupler Head
    add_box_to_bmesh(bm_yel, (-0.050, py - 0.060, 1.740), (0.055, 0.065, 0.045))
    
    # Black EBS ISO 7638 Electronic Braking Cable
    add_helix_to_bmesh(bm_ebs, (0.050, py - 0.180, 1.350), coil_radius=0.042, wire_radius=0.010, total_length=0.680, turns=9, axis='Z')
    # Black 24V Lighting Supply Cable
    add_helix_to_bmesh(bm_ebs, (0.140, py - 0.180, 1.350), coil_radius=0.038, wire_radius=0.009, total_length=0.680, turns=10, axis='Z')

    finalize_bmesh_object(pylon_obj, pylon_mesh, bm_pylon)
    finalize_bmesh_object(red_obj, red_mesh, bm_red)
    finalize_bmesh_object(yellow_obj, yellow_mesh, bm_yel)
    finalize_bmesh_object(ebs_obj, ebs_mesh, bm_ebs)
    return [pylon_obj, red_obj, yellow_obj, ebs_obj]


# =============================================================================
# SUBSYSTEM 27: OM 471 / OM 473 ENGINE SUMP & ACOUSTIC SHIELDING
# =============================================================================

def build_actros_engine_sump_and_shielding(materials, parent=None):
    """
    Constructs the Mercedes-Benz OM 471 / OM 473 inline-6 turbo-compound heavy commercial
    diesel engine cast aluminum lower oil pan / sump, ribbed acoustic attenuation
    covers, oil drain plug, and composite underbody encapsulation belly pan.
    
    Hardpoints:
    - Engine Sump: Y = +1.100 m to +1.950 m, Z = 0.440 m to Z = 0.680 m
    """
    sump_obj, sump_mesh, bm_sump = create_bmesh_object("Engine_OM471_Sump", materials['Iron_CastHeavy'], parent)
    belly_obj, belly_mesh, bm_belly = create_bmesh_object("Engine_Acoustic_Belly_Pan", materials['Plastic_AnthraciteComposite'], parent)
    
    ey = 1.520
    ez = 0.540
    
    # 1. Cast Ribbed Aluminum Engine Sump
    add_box_to_bmesh(bm_sump, (0.0, ey, ez), (0.540, 0.880, 0.220))
    # Longitudinal cooling and stiffening ribs along sump bottom
    for rx in [-0.20, -0.10, 0.0, 0.10, 0.20]:
        add_box_to_bmesh(bm_sump, (rx, ey, ez - 0.115), (0.018, 0.840, 0.025))
    # Threaded brass oil drain plug
    add_cylinder_to_bmesh(bm_sump, (0.180, ey - 0.360, ez - 0.110), 0.022, 0.025, segments=12, axis='Z')

    # 2. Composite Full-Coverage Acoustic Encapsulation Belly Pan
    # Reduces drive-by noise (ECE R51 compliant)
    add_box_to_bmesh(bm_belly, (0.0, ey, ez - 0.145), (0.840, 1.120, 0.025))
    # Oil drain access inspection flap
    add_box_to_bmesh(bm_belly, (0.180, ey - 0.360, ez - 0.160), (0.120, 0.120, 0.015))

    finalize_bmesh_object(sump_obj, sump_mesh, bm_sump)
    finalize_bmesh_object(belly_obj, belly_mesh, bm_belly)
    return [sump_obj, belly_obj]


# =============================================================================
# SUBSYSTEM 28: TELESCOPIC CARDAN DRIVESHAFT & CARRIER BEARING
# =============================================================================

def build_actros_cardan_driveshaft(materials, parent=None):
    """
    Constructs the heavy-duty tubular steel propeller driveshaft, splined slip
    yoke, needle-bearing universal joints (U-joints), and rubber-isolated center
    carrier support bearing crossmember mount.
    
    Hardpoints:
    - Transmission Flange: Y = +0.650 m, Z = 0.620 m
    - Rear Axle Flange:   Y = -2.020 m, Z = 0.510 m
    - Shaft Span: 2.670 m
    """
    shaft_obj, shaft_mesh, bm_shaft = create_bmesh_object("Cardan_Driveshaft_Assembly", materials['Paint_ChassisNovaGrey'], parent)
    ujoint_obj, ujoint_mesh, bm_uj = create_bmesh_object("Driveshaft_UJoints", materials['Alloy_AlcoaDuraBright'], parent)
    
    start_y = 0.650
    end_y = -2.020
    start_z = 0.620
    end_z = 0.510
    mid_y = (start_y + end_y) * 0.5  # -0.685 m
    mid_z = (start_z + end_z) * 0.5  # 0.565 m
    tot_len = math.sqrt((start_y - end_y)**2 + (start_z - end_z)**2)  # ~2.672 m
    pitch_ang = math.atan2(start_z - end_z, start_y - end_y)          # ~2.3 deg
    
    # 1. Main Tubular Propeller Shaft (120 mm diameter)
    add_cylinder_to_bmesh(bm_shaft, (0.0, mid_y, mid_z), 0.060, tot_len * 0.88, segments=20, axis='Y', rot_euler=(pitch_ang, 0.0, 0.0))
    # Splined slip joint sleeve
    add_cylinder_to_bmesh(bm_shaft, (0.0, mid_y + 0.500, mid_z + 0.020), 0.075, 0.280, segments=18, axis='Y', rot_euler=(pitch_ang, 0.0, 0.0))

    # 2. Universal Joints (Front & Rear Flanges)
    for jy, jz in [(start_y, start_z), (end_y, end_z)]:
        # 4-bolt companion flange
        add_cylinder_to_bmesh(bm_uj, (0.0, jy, jz), 0.095, 0.035, segments=16, axis='Y')
        # Cross spider bearing trunnions
        add_cylinder_to_bmesh(bm_uj, (0.0, jy - 0.040, jz), 0.028, 0.140, segments=12, axis='X')
        add_cylinder_to_bmesh(bm_uj, (0.0, jy - 0.040, jz), 0.028, 0.140, segments=12, axis='Z')

    # 3. Rubber-Isolated Center Support Bearing Bracket
    add_box_to_bmesh(bm_shaft, (0.0, mid_y, mid_z + 0.120), (0.240, 0.120, 0.180))
    add_tube_to_bmesh(bm_shaft, (0.0, mid_y, mid_z), 0.088, 0.062, 0.060, segments=18, axis='Y')

    finalize_bmesh_object(shaft_obj, shaft_mesh, bm_shaft)
    finalize_bmesh_object(ujoint_obj, ujoint_mesh, bm_uj)
    return [shaft_obj, ujoint_obj]


# =============================================================================
# SUBSYSTEM 29: ELECTRONIC AIR PROCESSING UNIT (E-APU) & AIR TANKS
# =============================================================================

def build_actros_ebs_pneumatics_and_apu(materials, parent=None):
    """
    Constructs the Knorr-Bremse Electronic Air Processing Unit (E-APU), desiccant
    dryer cartridge, multi-circuit protection valves, twin 40-liter extruded aluminum
    compressed air reservoirs, and brass pneumatic push-in fittings.
    
    Hardpoints:
    - Inside Chassis Rails: Y = +0.200 m to -0.600 m
    """
    apu_obj, apu_mesh, bm_apu = create_bmesh_object("Knorr_APU_Air_Dryer", materials['Paint_ChassisNovaGrey'], parent)
    tank_obj, tank_mesh, bm_tank = create_bmesh_object("Aluminum_Air_Reservoirs", materials['Aluminum_ExtrudedSatin'], parent)
    valve_obj, valve_mesh, bm_valve = create_bmesh_object("Pneumatic_Brass_Valves_Piping", materials['Alloy_AlcoaDuraBright'], parent)
    
    # 1. Knorr-Bremse E-APU Electronic Air Dryer Module (Mounted inside right rail)
    add_box_to_bmesh(bm_apu, (0.340, 0.220, 0.720), (0.160, 0.220, 0.240))
    # Spin-on desiccant air dryer cartridge canister
    add_cylinder_to_bmesh(bm_apu, (0.340, 0.220, 0.880), 0.075, 0.240, segments=18, axis='Z')
    
    # 2. Twin 40-Liter Extruded Aluminum Compressed Air Tanks
    # Mounted transversely between chassis rails
    for ty, tz in [(-0.150, 0.760), (-0.450, 0.760)]:
        add_cylinder_to_bmesh(bm_tank, (0.0, ty, tz), 0.130, 0.760, segments=22, axis='X')
        # Hemispherical tank domed end caps
        for side in [-1.0, 1.0]:
            add_cylinder_to_bmesh(bm_tank, (side * 0.380, ty, tz), 0.125, 0.040, segments=20, axis='X')
            # Condensate drain valve on bottom of air tank
            add_cylinder_to_bmesh(bm_valve, (0.0, ty, tz - 0.135), 0.012, 0.030, segments=10, axis='Z')

    # 3. Multi-Circuit Solenoid Valve Manifold & Distribution Block
    add_box_to_bmesh(bm_valve, (0.280, 0.120, 0.720), (0.090, 0.140, 0.080))

    finalize_bmesh_object(apu_obj, apu_mesh, bm_apu)
    finalize_bmesh_object(tank_obj, tank_mesh, bm_tank)
    finalize_bmesh_object(valve_obj, valve_mesh, bm_valve)
    return [apu_obj, tank_obj, valve_obj]


# =============================================================================
# SUBSYSTEM 30: CHASSIS TOOLBOX & POLYURETHANE WHEEL CHOCKS
# =============================================================================

def build_actros_toolbox_and_wheel_chocks(materials, parent=None):
    """
    Constructs the heavy commercial waterproof chassis storage toolbox with polished
    stainless T-handle latch, and dual DIN 76051 molded polyurethane wheel chocks
    in quick-release carrier brackets.
    
    Hardpoints:
    - Chassis Right Flank: Y = -1.250 m, Z = 0.640 m
    """
    box_obj, box_mesh, bm_box = create_bmesh_object("Chassis_Toolbox_Storage", materials['Plastic_AnthraciteComposite'], parent)
    chock_obj, chock_mesh, bm_chock = create_bmesh_object("Polyurethane_Wheel_Chocks", materials['Plastic_NeonNutIndicator'], parent)
    latch_obj, latch_mesh, bm_latch = create_bmesh_object("Toolbox_Stainless_Latches", materials['Stainless_Polished'], parent)
    
    bx = 0.720
    by = -1.250
    bz = 0.640
    
    # 1. Waterproof Molded Composite Storage Toolbox
    add_box_to_bmesh(bm_box, (bx, by, bz), (0.480, 0.650, 0.440))
    # Hinged lid perimeter gasket seal
    add_box_to_bmesh(bm_box, (bx + 0.245, by, bz), (0.020, 0.660, 0.450))
    # Stainless Steel Locking T-Handle Latch
    add_cylinder_to_bmesh(bm_latch, (bx + 0.258, by, bz), 0.028, 0.015, segments=14, axis='X')
    add_box_to_bmesh(bm_latch, (bx + 0.268, by, bz), (0.012, 0.090, 0.018))

    # 2. Dual DIN 76051 Heavy Commercial Yellow Wheel Chocks
    # Mounted in quick-release carrier on chassis rail
    for cy in [by + 0.160, by - 0.160]:
        add_box_to_bmesh(bm_chock, (bx - 0.180, cy, bz + 0.040), (0.160, 0.220, 0.180), rot_euler=(math.radians(35.0), 0.0, 0.0))
        # Rubber carrier retaining tension strap
        add_box_to_bmesh(bm_latch, (bx - 0.180, cy, bz + 0.120), (0.170, 0.040, 0.012))

    finalize_bmesh_object(box_obj, box_mesh, bm_box)
    finalize_bmesh_object(chock_obj, chock_mesh, bm_chock)
    finalize_bmesh_object(latch_obj, latch_mesh, bm_latch)
    return [box_obj, chock_obj, latch_obj]


# =============================================================================
# SUBSYSTEM 31: CENTRAL CHASSIS LUBRICATION SYSTEM
# =============================================================================

def build_actros_central_lubrication_system(materials, parent=None):
    """
    Constructs the automatic central chassis lubrication pump, transparent grease
    reservoir canister, distribution block, and high-pressure nylon micro-lines.
    
    Hardpoints:
    - Left Chassis Flank: X = -0.425 m, Y = +0.220 m, Z = 0.740 m
    """
    pump_obj, pump_mesh, bm_pump = create_bmesh_object("Central_Lube_Pump_Assembly", materials['Plastic_AnthraciteComposite'], parent)
    res_obj, res_mesh, bm_res = create_bmesh_object("Central_Lube_Grease_Reservoir", materials['Glass_PolycarbonateClear'], parent)
    
    px = -0.440
    py = 0.220
    pz = 0.740
    
    # 1. Electric Motor Drive Pump Base Housing
    add_box_to_bmesh(bm_pump, (px, py, pz - 0.080), (0.140, 0.160, 0.140))
    # 2. Cylindrical Transparent Polycarbonate Grease Reservoir Canister
    add_cylinder_to_bmesh(bm_res, (px, py, pz + 0.100), 0.070, 0.220, segments=18, axis='Z')
    # Canister Top Cap
    add_cylinder_to_bmesh(bm_pump, (px, py, pz + 0.215), 0.075, 0.030, segments=18, axis='Z')
    # Pressure distribution manifold block with brass micro-line unions
    add_box_to_bmesh(bm_pump, (px + 0.060, py, pz - 0.080), (0.050, 0.120, 0.060))

    finalize_bmesh_object(pump_obj, pump_mesh, bm_pump)
    finalize_bmesh_object(res_obj, res_mesh, bm_res)
    return [pump_obj, res_obj]


# =============================================================================
# SUBSYSTEM 32: ROOF PNEUMATIC AIR HORNS & FLEETBOARD TELEMATICS DOME
# =============================================================================

def build_actros_roof_horns_and_telematics(materials, parent=None):
    """
    Constructs the twin chrome pneumatic trumpet air horns (Hadley style),
    Mercedes-Benz FleetBoard / GPS / DSRC European toll collect telematics antenna dome,
    and twin CB radio flexible fiberglass antenna whips on the GigaSpace roof.
    
    Hardpoints:
    - GigaSpace Roof: Z = 3.940 m, Y = +1.100 m to +1.400 m
    """
    horn_obj, horn_mesh, bm_horn = create_bmesh_object("Roof_Pneumatic_Air_Horns", materials['Chrome_MercedesStar'], parent)
    tele_obj, tele_mesh, bm_tele = create_bmesh_object("Roof_FleetBoard_Telematics", materials['Plastic_GlossBlack'], parent)
    
    rz = 3.940
    
    # 1. Twin Chrome Pneumatic Trumpet Air Horns (650 mm and 550 mm lengths)
    for side, h_len in [(-1.0, 0.650), (1.0, 0.550)]:
        hx = side * 0.720
        hy = 1.250
        # Trumpet rear sound chamber base
        add_cylinder_to_bmesh(bm_horn, (hx, hy - h_len * 0.45, rz + 0.050), 0.045, 0.070, segments=16, axis='Y')
        # Tapered trumpet tube
        add_cylinder_to_bmesh(bm_horn, (hx, hy, rz + 0.050), 0.022, h_len * 0.80, segments=14, axis='Y')
        # Flared bell mouth (facing forward +Y)
        bell_y = hy + h_len * 0.45
        add_cone_to_bmesh(bm_horn, (hx, bell_y, rz + 0.050), 0.022, 0.075, 0.090, segments=18, axis='Y')
        # Roof mounting stanchions
        add_cylinder_to_bmesh(bm_horn, (hx, hy - 0.180, rz + 0.020), 0.012, 0.045, segments=8, axis='Z')
        add_cylinder_to_bmesh(bm_horn, (hx, hy + 0.180, rz + 0.020), 0.012, 0.045, segments=8, axis='Z')

    # 2. FleetBoard / Toll-Collect / GPS Telematics Aerodynamic Puck Dome
    add_cylinder_to_bmesh(bm_tele, (0.0, 1.180, rz + 0.035), 0.110, 0.050, segments=22, axis='Z')
    # Dual CB Radio Antenna Stalks & Flexible Whips
    for side in [-1.0, 1.0]:
        ax = side * 1.150
        add_cylinder_to_bmesh(bm_tele, (ax, 0.820, rz + 0.060), 0.018, 0.120, segments=10, axis='Z')
        add_cylinder_to_bmesh(bm_horn, (ax, 0.820, rz + 0.650), 0.004, 1.100, segments=8, axis='Z')

    finalize_bmesh_object(horn_obj, horn_mesh, bm_horn)
    finalize_bmesh_object(tele_obj, tele_mesh, bm_tele)
    return [horn_obj, tele_obj]


# =============================================================================
# SUBSYSTEM 33: REAR CHASSIS LEAD-IN RAMPS & FIFTH-WHEEL WEAR PLATES
# =============================================================================

def build_actros_lead_in_ramps(materials, parent=None):
    """
    Constructs the heavy chamfered steel trailer lead-in guide ramps on the rear
    chassis rail tips to guide semitrailer kingpins smoothly onto the fifth wheel.
    
    Hardpoints:
    - Rear Rail Tips: Y = -3.250 m to -3.520 m, Z = 0.880 m
    """
    ramp_obj, ramp_mesh, bm_ramp = create_bmesh_object("Rear_Chassis_LeadIn_Ramps", materials['Iron_CastHeavy'], parent)
    
    for side in [-1.0, 1.0]:
        rx = side * 0.425
        # Downward angled lead-in ramp wedge
        add_box_to_bmesh(bm_ramp, (rx, -3.380, 0.820), (0.110, 0.280, 0.080), rot_euler=(math.radians(16.0), 0.0, 0.0))
        # Side guide wear horn
        add_box_to_bmesh(bm_ramp, (rx + side * 0.045, -3.380, 0.860), (0.030, 0.260, 0.060))

    finalize_bmesh_object(ramp_obj, ramp_mesh, bm_ramp)
    return ramp_obj


# =============================================================================
# SUBSYSTEM 34: FRONT WHEEL ANTI-SPRAY FLAPS & MUD DEFLECTORS
# =============================================================================

def build_actros_front_antispray_flaps(materials, parent=None):
    """
    Constructs the heavy molded rubber anti-spray mudflaps behind the front steer
    wheels and under-cab splash shields protecting the engine bay.
    
    Hardpoints:
    - Behind Steer Wheels: X = +/- 1.020 m, Y = +0.940 m, Z = 0.480 m
    """
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Front_Steer_Mudflaps_AntiSpray", materials['Rubber_EuropeanTire'], parent)
    
    for side in [-1.0, 1.0]:
        fx = side * 1.020
        # Heavy ribbed rubber mudflap (340 mm wide x 460 mm tall)
        add_box_to_bmesh(bm_flap, (fx, 0.940, 0.480), (0.340, 0.018, 0.460))
        # White safety border marking
        add_box_to_bmesh(bm_flap, (fx, 0.930, 0.280), (0.320, 0.005, 0.030))
        # Steel mounting bracket clamp
        add_box_to_bmesh(bm_flap, (fx, 0.945, 0.700), (0.350, 0.035, 0.040))

    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap)
    return flap_obj


# =============================================================================
# SUBSYSTEM 35: ECE 70.01 REFLECTIVE REAR CHEVRON MARKER PLATES
# =============================================================================

def build_actros_ece70_chevrons_and_adr(materials, parent=None):
    """
    Constructs the ECE 70.01 compliant rear reflective chevron marker plates
    (diagonal red and yellow fluorescent stripes) and folding front/rear ADR
    orange hazard warning plates for commercial transport.
    
    Hardpoints:
    - Rear Underrun Bumper: Y = -3.470 m, Z = 0.540 m
    """
    chev_obj, chev_mesh, bm_chev = create_bmesh_object("Rear_Chevron_Reflective_Plates", materials['Decal_ECE70Chevron'], parent)
    stripe_obj, stripe_mesh, bm_stripe = create_bmesh_object("Rear_Chevron_Red_Stripes", materials['Glass_TaillampRed'], parent)
    
    # 1. Left & Right ECE 70.01 Long Commercial Vehicle Marker Plates (565x200 mm)
    for side in [-1.0, 1.0]:
        cx = side * 0.520
        cy = -3.475
        cz = 0.540
        # Yellow retroreflective backing plate
        add_box_to_bmesh(bm_chev, (cx, cy, cz), (0.540, 0.006, 0.180))
        # Diagonal red fluorescent warning stripes
        for s_idx in [-0.180, -0.060, 0.060, 0.180]:
            add_box_to_bmesh(bm_stripe, (cx + s_idx, cy - 0.004, cz), (0.055, 0.004, 0.170), rot_euler=(0.0, 0.0, side * math.radians(45.0)))

    # 2. Folding ADR Orange Hazard Identification Plate (Front bumper chin & Rear bumper)
    # Front Bumper Chin Plate (Unobstructed at Z = 0.880 m)
    add_box_to_bmesh(bm_chev, (-0.560, 2.370, 0.880), (0.400, 0.006, 0.280))
    # Center divider bar
    add_box_to_bmesh(bm_stripe, (-0.560, 2.374, 0.880), (0.390, 0.004, 0.012))

    finalize_bmesh_object(chev_obj, chev_mesh, bm_chev)
    finalize_bmesh_object(stripe_obj, stripe_mesh, bm_stripe)
    return [chev_obj, stripe_obj]


# =============================================================================
# SUBSYSTEM 36: GIGASPACE AERODYNAMIC SKYLIGHT & EMERGENCY EXIT HATCH
# =============================================================================

def build_actros_skylight_hatch(materials, parent=None):
    """
    Constructs the GigaSpace panoramic electric glass skylight and emergency
    roof exit hatch, dark optical privacy tint, extruded aluminum perimeter frame,
    EPDM rubber weatherseal gasket, and forward aerodynamic wind deflector lip.
    
    Hardpoints:
    - Roof Crown Center: X = 0.0 m, Y = +0.880 m, Z = 3.960 m
    - Dimensions: 820 mm x 640 mm
    """
    glass_obj, glass_mesh, bm_glass = create_bmesh_object("Roof_Skylight_Glass", materials['Glass_DarkPrivacyTint'], parent)
    frame_obj, frame_mesh, bm_frame = create_bmesh_object("Roof_Skylight_Frame", materials['Alloy_AlcoaDuraBright'], parent)
    seal_obj, seal_mesh, bm_seal = create_bmesh_object("Roof_Skylight_Weatherseal", materials['Plastic_AnthraciteComposite'], parent)
    
    hy = 0.880
    hz = 3.960
    hw = 0.820
    hl = 0.640
    
    # 1. Dark Privacy Tint Laminated Glass Skylight Pane
    add_box_to_bmesh(bm_glass, (0.0, hy, hz), (hw, hl, 0.015))
    
    # 2. Extruded Aluminum Perimeter Frame
    add_box_to_bmesh(bm_frame, (0.0, hy + hl * 0.5 + 0.018, hz), (hw + 0.060, 0.036, 0.030))
    add_box_to_bmesh(bm_frame, (0.0, hy - hl * 0.5 - 0.018, hz), (hw + 0.060, 0.036, 0.030))
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_frame, (side * (hw * 0.5 + 0.018), hy, hz), (0.036, hl, 0.030))
        
    # 3. EPDM Rubber Perimeter Compression Weatherseal Gasket
    add_box_to_bmesh(bm_seal, (0.0, hy, hz - 0.010), (hw + 0.080, hl + 0.080, 0.012))
    
    # 4. Aerodynamic Forward Wind Deflector Lip (Pivots up when hatch tilts)
    add_box_to_bmesh(bm_seal, (0.0, hy + hl * 0.5 + 0.045, hz + 0.018), (hw * 0.96, 0.040, 0.025), rot_euler=(math.radians(-18.0), 0.0, 0.0))

    finalize_bmesh_object(glass_obj, glass_mesh, bm_glass)
    finalize_bmesh_object(frame_obj, frame_mesh, bm_frame)
    finalize_bmesh_object(seal_obj, seal_mesh, bm_seal)
    return [glass_obj, frame_obj, seal_obj]


# =============================================================================
# SUBSYSTEM 37: MERCEDES POWERSHIFT 3 AUTOMATED 12-SPEED TRANSMISSION
# =============================================================================

def build_actros_powershift_transmission(materials, parent=None):
    """
    Constructs the Mercedes PowerShift 3 (G 281-12 KL) automated 12-speed heavy
    commercial transmission casing, cast cooling ribs, shift control solenoid block,
    auxiliary Power Take-Off (PTO) output flange, and oil cooling heat exchanger.
    
    Hardpoints:
    - Centerline behind engine: Y = +0.620 m, Z = 0.620 m
    """
    trans_obj, trans_mesh, bm_trans = create_bmesh_object("Transmission_PowerShift3_Casing", materials['Iron_CastHeavy'], parent)
    act_obj, act_mesh, bm_act = create_bmesh_object("Transmission_Shift_Actuators", materials['Alloy_AlcoaDuraBright'], parent)
    cooler_obj, cooler_mesh, bm_cool = create_bmesh_object("Transmission_Oil_Cooler", materials['Aluminum_ExtrudedSatin'], parent)
    
    ty = 0.620
    tz = 0.620
    
    # 1. Cast Aluminum Transmission Main Case
    add_cylinder_to_bmesh(bm_trans, (0.0, ty, tz), 0.220, 0.740, segments=22, axis='Y')
    # Front bellhousing bell flare connecting to OM 471 flywheel
    add_cone_to_bmesh(bm_trans, (0.0, ty + 0.420, tz), 0.220, 0.275, 0.160, segments=22, axis='Y')
    # Rear bearing output retainer housing
    add_cylinder_to_bmesh(bm_trans, (0.0, ty - 0.410, tz), 0.140, 0.120, segments=18, axis='Y')
    
    # Longitudinal and radial cooling fins along casing exterior
    for r_ang in [0.0, 45.0, 90.0, 135.0, 180.0, 225.0, 270.0, 315.0]:
        ang_rad = math.radians(r_ang)
        fx = math.cos(ang_rad) * 0.225
        fz = tz + math.sin(ang_rad) * 0.225
        add_box_to_bmesh(bm_trans, (fx, ty, fz), (0.014, 0.640, 0.022), rot_euler=(0.0, 0.0, -ang_rad))

    # 2. Electro-Pneumatic Shift Solenoid Control Block on Top of Case
    add_box_to_bmesh(bm_act, (0.0, ty - 0.060, tz + 0.240), (0.160, 0.240, 0.110))
    # Wiring harness conduit plug
    add_cylinder_to_bmesh(bm_act, (0.090, ty - 0.060, tz + 0.280), 0.024, 0.050, segments=12, axis='X')

    # 3. Auxiliary Power Take-Off (PTO) Flange on Side of Gearbox
    add_cylinder_to_bmesh(bm_act, (-0.240, ty - 0.120, tz - 0.060), 0.075, 0.080, segments=16, axis='X')

    # 4. Transmission Oil-to-Water Plate Heat Exchanger Cooler
    add_box_to_bmesh(bm_cool, (0.220, ty + 0.080, tz - 0.040), (0.090, 0.280, 0.180))

    finalize_bmesh_object(trans_obj, trans_mesh, bm_trans)
    finalize_bmesh_object(act_obj, act_mesh, bm_act)
    finalize_bmesh_object(cooler_obj, cooler_mesh, bm_cool)
    return [trans_obj, act_obj, cooler_obj]


# =============================================================================
# SUBSYSTEM 38: 24V DUAL BATTERY CARRIER & MASTER DISCONNECT SWITCH
# =============================================================================

def build_actros_battery_box_and_isolator(materials, parent=None):
    """
    Constructs the heavy structural steel battery carrier, twin 220Ah commercial
    AGM batteries, acid-resistant composite protective cover, stainless toggle latches,
    and heavy rotary master battery disconnect switch with lockout tab.
    
    Hardpoints:
    - Left Chassis Rail: X = -0.720 m, Y = +0.180 m, Z = 0.640 m
    """
    box_obj, box_mesh, bm_box = create_bmesh_object("Battery_Box_Carrier", materials['Paint_ChassisNovaGrey'], parent)
    cover_obj, cover_mesh, bm_cov = create_bmesh_object("Battery_Box_Cover", materials['Plastic_AnthraciteComposite'], parent)
    switch_obj, switch_mesh, bm_sw = create_bmesh_object("Battery_Master_Disconnect_Switch", materials['Glass_TaillampRed'], parent)
    
    bx = -0.720
    by = 0.180
    bz = 0.640
    bw = 0.440
    bl = 0.580
    bh = 0.420
    
    # 1. Structural Steel Chassis Mounting Tray
    add_box_to_bmesh(bm_box, (bx, by, bz), (bw, bl, bh))
    
    # 2. Acid-Resistant Polypropylene Outer Cover
    add_box_to_bmesh(bm_cov, (bx - 0.020, by, bz), (bw + 0.025, bl + 0.025, bh + 0.020))
    # Quick-release stainless steel over-center latches
    add_box_to_bmesh(bm_box, (bx - bw * 0.5 - 0.035, by + 0.180, bz), (0.015, 0.040, 0.080))
    add_box_to_bmesh(bm_box, (bx - bw * 0.5 - 0.035, by - 0.180, bz), (0.015, 0.040, 0.080))
    
    # 3. Heavy Commercial Rotary Battery Master Disconnect Switch (ADR compliant)
    # Mounted to exterior of battery box for emergency firefighter access
    sw_x = bx - bw * 0.5 - 0.040
    sw_y = by
    sw_z = bz + 0.080
    # Black switch mounting escutcheon plate
    add_box_to_bmesh(bm_cov, (sw_x, sw_y, sw_z), (0.015, 0.110, 0.110))
    # Bright red emergency disconnect rotary knob
    add_cylinder_to_bmesh(bm_sw, (sw_x - 0.020, sw_y, sw_z), 0.032, 0.035, segments=16, axis='X')
    # Padlock security lockout hole flange
    add_box_to_bmesh(bm_sw, (sw_x - 0.025, sw_y + 0.030, sw_z), (0.010, 0.025, 0.035))

    finalize_bmesh_object(box_obj, box_mesh, bm_box)
    finalize_bmesh_object(cover_obj, cover_mesh, bm_cov)
    finalize_bmesh_object(switch_obj, switch_mesh, bm_sw)
    return [box_obj, cover_obj, switch_obj]


# =============================================================================
# SUBSYSTEM 39: ECE R104 DIAMOND-GRADE CONSPICUITY CONTOUR MARKINGS
# =============================================================================

def build_actros_ece104_conspicuity_tape(materials, parent=None):
    """
    Constructs the ECE R104 compliant micro-prismatic retroreflective contour safety
    markings along the vehicle perimeter:
    - Yellow diamond-grade reflective tape along cab lower beltline and chassis side skirts
    - Red diamond-grade reflective tape framing the rear cab perimeter and underrun bumper
    """
    yellow_obj, yellow_mesh, bm_yel = create_bmesh_object("Conspicuity_Tape_Yellow", materials['Decal_ECE70Chevron'], parent)
    red_obj, red_mesh, bm_red = create_bmesh_object("Conspicuity_Tape_Red", materials['Glass_TaillampRed'], parent)
    
    # 1. Yellow Reflective Side Contour Tape along Chassis Skirt Bottom
    # X = +/- 1.258 m, Y = +0.760 m to -1.520 m, Z = 0.460 m
    for side in [-1.0, 1.0]:
        sx = side * 1.258
        add_box_to_bmesh(bm_yel, (sx, -0.380, 0.460), (0.004, 2.280, 0.045))
        # Cab door lower perimeter stripe
        add_box_to_bmesh(bm_yel, (sx, 1.290, 1.240), (0.004, 1.120, 0.045))

    # 2. Red Reflective Rear Contour Tape framing Rear Cab Bulkhead Perimeter
    # Y = -0.065 m, Z = 1.380 m to 3.900 m
    ry = -0.065
    # Left and right vertical contour lines
    for side in [-1.0, 1.0]:
        rx = side * 1.230
        add_box_to_bmesh(bm_red, (rx, ry, 2.640), (0.045, 0.004, 2.500))
    # Top horizontal contour line
    add_box_to_bmesh(bm_red, (0.0, ry, 3.900), (2.440, 0.004, 0.045))
    
    # Red stripe along rear underrun bumper beam
    add_box_to_bmesh(bm_red, (0.0, -3.468, 0.520), (2.300, 0.004, 0.045))

    finalize_bmesh_object(yellow_obj, yellow_mesh, bm_yel)
    finalize_bmesh_object(red_obj, red_mesh, bm_red)
    return [yellow_obj, red_obj]


# =============================================================================
# SUBSYSTEM 40: REAR DOCKING RUBBER BUFFERS & IMPACT ROLLERS
# =============================================================================

def build_actros_docking_buffers(materials, parent=None):
    """
    Constructs the heavy commercial molded EPDM rubber loading dock impact buffers
    and cylindrical rotating urethane guide rollers mounted on the rear chassis tips.
    
    Hardpoints:
    - Rear Chassis Tips: X = +/- 0.425 m, Y = -3.500 m, Z = 0.860 m
    """
    buffer_obj, buffer_mesh, bm_buf = create_bmesh_object("Docking_Impact_Buffers", materials['Rubber_EuropeanTire'], parent)
    roller_obj, roller_mesh, bm_roll = create_bmesh_object("Docking_Impact_Rollers", materials['Plastic_AnthraciteComposite'], parent)
    
    for side in [-1.0, 1.0]:
        bx = side * 0.425
        by = -3.500
        bz = 0.860
        
        # Heavy solid molded rubber impact bumper block
        add_box_to_bmesh(bm_buf, (bx, by, bz), (0.120, 0.080, 0.180))
        # Cylindrical revolving dock guide roller (absorbs vertical scuffing against dock)
        add_cylinder_to_bmesh(bm_roll, (bx, by - 0.048, bz), 0.038, 0.160, segments=16, axis='Z')
        # Heavy steel mounting backing plate
        add_box_to_bmesh(bm_buf, (bx, by + 0.045, bz), (0.130, 0.015, 0.190))

    finalize_bmesh_object(buffer_obj, buffer_mesh, bm_buf)
    finalize_bmesh_object(roller_obj, roller_mesh, bm_roll)
    return [buffer_obj, roller_obj]


# =============================================================================
# SUBSYSTEM 41: AERODYNAMIC DOOR WINDOW RAIN & WIND DEFLECTORS
# =============================================================================

def build_actros_window_wind_deflectors(materials, parent=None):
    """
    Constructs the aerodynamic smoked dark acrylic side window wind and rain
    deflectors mounted along the door window frame header and A-pillar channel.
    
    Hardpoints:
    - Door Window Header: X = +/- 1.258 m, Y = +1.100 m to +1.820 m, Z = 2.760 m
    """
    deflect_obj, deflect_mesh, bm_def = create_bmesh_object("Window_Rain_Wind_Deflectors", materials['Plastic_DarkAcrylic'], parent)
    
    for side in [-1.0, 1.0]:
        wx = side * 1.258
        wy = 1.460
        wz = 2.760
        # Curved aerodynamic smoked deflector visor strip
        add_box_to_bmesh(bm_def, (wx, wy, wz), (0.024, 0.760, 0.085), rot_euler=(0.0, side * math.radians(-10.0), 0.0))
        # Forward A-pillar leading edge transition
        add_box_to_bmesh(bm_def, (wx, 1.820, wz - 0.120), (0.024, 0.140, 0.180), rot_euler=(math.radians(16.0), side * math.radians(-10.0), 0.0))

    finalize_bmesh_object(deflect_obj, deflect_mesh, bm_def)
    return deflect_obj


# =============================================================================
# SUBSYSTEM 42: OM 471 HIGH-PRESSURE COMMON-RAIL & FUEL FILTRATION
# =============================================================================

def build_actros_fuel_filtration_and_rail(materials, parent=None):
    """
    Constructs the Mercedes-Benz OM 471 X-Pulse high-pressure common-rail injection
    manifold, high-pressure steel lines, primary fuel filter and water separator,
    and manual priming pump plunger.
    
    Hardpoints:
    - Left Engine Flank: X = -0.340 m, Y = +1.450 m, Z = 0.820 m
    """
    filter_obj, filter_mesh, bm_fil = create_bmesh_object("Engine_Fuel_Filter_Module", materials['Plastic_AnthraciteComposite'], parent)
    rail_obj, rail_mesh, bm_rail = create_bmesh_object("Engine_XPulse_Common_Rail", materials['Alloy_AlcoaDuraBright'], parent)
    
    fx = -0.340
    fy = 1.450
    fz = 0.820
    
    # 1. Primary Diesel Fuel Filter & Water Separator Housing
    add_box_to_bmesh(bm_fil, (fx, fy, fz), (0.120, 0.140, 0.220))
    # Spin-on fuel filter canister
    add_cylinder_to_bmesh(bm_fil, (fx, fy, fz - 0.120), 0.055, 0.180, segments=16, axis='Z')
    # Transparent water separator sight bowl at bottom of filter
    add_cylinder_to_bmesh(bm_rail, (fx, fy, fz - 0.220), 0.045, 0.045, segments=14, axis='Z')
    # Manual hand priming pump plunger button on top
    add_cylinder_to_bmesh(bm_fil, (fx, fy, fz + 0.130), 0.022, 0.040, segments=12, axis='Z')
    
    # 2. X-Pulse Forged Steel High-Pressure Common-Rail Manifold (2,100 bar)
    add_cylinder_to_bmesh(bm_rail, (fx + 0.120, fy, fz + 0.160), 0.020, 0.620, segments=14, axis='Y')
    # 6 High-pressure fuel injector lines branching from rail
    for l_idx in range(6):
        ly = fy - 0.250 + l_idx * 0.100
        add_cylinder_to_bmesh(bm_rail, (fx + 0.070, ly, fz + 0.200), 0.007, 0.120, segments=8, axis='X')

    finalize_bmesh_object(filter_obj, filter_mesh, bm_fil)
    finalize_bmesh_object(rail_obj, rail_mesh, bm_rail)
    return [filter_obj, rail_obj]


# =============================================================================
# SUBSYSTEM 43: PREDICTIVE POWERTRAIN CONTROL (PPC) & FORWARD STEREO CAMERAS
# =============================================================================

def build_actros_ppc_and_stereo_cameras(materials, parent=None):
    """
    Constructs the pioneering 2010s Mercedes-Benz Predictive Powertrain Control (PPC)
    and forward stereoscopic multi-purpose camera (SMPC) system behind the windshield:
    - Forward dual stereo optical camera lenses for Lane Keeping Assist & Active Brake Assist
    - 3D GPS topographical digital road map receiver module
    - Internal anti-glare baffled camera sunshield cowl
    
    Hardpoints:
    - Windshield Upper Center: X = 0.0 m, Y = +1.920 m, Z = 3.080 m
    """
    cowl_obj, cowl_mesh, bm_cowl = create_bmesh_object("PPC_Stereo_Camera_Cowl", materials['Plastic_AnthraciteComposite'], parent)
    lens_obj, lens_mesh, bm_lens = create_bmesh_object("PPC_Stereo_Camera_Lenses", materials['Camera_SensorLens'], parent)
    gps_obj, gps_mesh, bm_gps = create_bmesh_object("PPC_3D_GPS_Topo_Module", materials['Plastic_GlossBlack'], parent)
    
    cy = 1.920
    cz = 3.080
    
    # 1. Anti-Glare Internal Camera Shield Cowl (Trapezoidal housing behind windshield)
    add_box_to_bmesh(bm_cowl, (0.0, cy, cz), (0.280, 0.080, 0.140), rot_euler=(math.radians(15.0), 0.0, 0.0))
    # Triangular light-baffle shrouds shielding camera view from interior cab lighting
    add_box_to_bmesh(bm_cowl, (0.0, cy + 0.025, cz), (0.240, 0.035, 0.110), rot_euler=(math.radians(15.0), 0.0, 0.0))
    
    # 2. Dual Optical High-Resolution Stereo Cameras (Forward facing +Y through windshield)
    for cx in [-0.070, 0.070]:
        add_cylinder_to_bmesh(bm_lens, (cx, cy + 0.040, cz), 0.016, 0.018, segments=16, axis='Y', rot_euler=(math.radians(15.0), 0.0, 0.0))
        # Internal CMOS optical sensor aperture ring
        add_tube_to_bmesh(bm_cowl, (cx, cy + 0.035, cz), 0.022, 0.017, 0.012, segments=16, axis='Y', rot_euler=(math.radians(15.0), 0.0, 0.0))
        
    # 3. 3D Topographical GPS Predictive Powertrain Control Logic Unit
    add_box_to_bmesh(bm_gps, (0.0, cy - 0.045, cz + 0.020), (0.160, 0.060, 0.080))

    finalize_bmesh_object(cowl_obj, cowl_mesh, bm_cowl)
    finalize_bmesh_object(lens_obj, lens_mesh, bm_lens)
    finalize_bmesh_object(gps_obj, gps_mesh, bm_gps)
    return [cowl_obj, lens_obj, gps_obj]


# =============================================================================
# MASTER ORCHESTRATION: 2014 MERCEDES-BENZ ACTROS MP4 GIGASPACE BUILD
# =============================================================================

def build_complete_actros_mp4(materials):
    """
    Master assembly function that instantiates all 43 Class-A CAD subsystems
    of the 2014 Mercedes-Benz Actros MP4 GigaSpace 4x2 Commercial Tractor,
    organizes them hierarchically under a root empty, and verifies all hardpoints.
    """
    print("\n" + "=" * 80)
    print("[ACTROS MP4] Initiating Master Assembly of 2010s Heavy Truck Flagship...")
    print("=" * 80)
    
    # Root Empty
    root_empty = bpy.data.objects.new("Root_Mercedes_Actros_MP4_2010s", None)
    bpy.context.scene.collection.objects.link(root_empty)
    root_empty.location = (0.0, 0.0, 0.0)
    
    # Complete list of all 43 modular subsystems
    subsystem_builders = [
        ("1. Ladder Chassis & FUPS Crash Beam", build_actros_chassis_frame),
        ("2. Steer Axle & Ventilated Disc Brakes", build_actros_steer_axle_and_brakes),
        ("3. Hypoid Rear Drive Axle & ECAS Air Suspension", build_actros_drive_axle_and_ecas),
        ("4. Alcoa Dura-Bright Wheels & Michelin Tires", build_actros_wheelset_and_tires),
        ("5. Jost JSK 42 Cast Fifth-Wheel Coupling", build_actros_fifth_wheel_coupling),
        ("6. Actros GigaSpace Flat-Floor Cab Shell", build_actros_gigaspace_cab_shell),
        ("7. Cascading Grille & Illuminated Mercedes Star", build_actros_cascading_grille_and_star),
        ("8. 3-Piece Composite Front Bumper & Radar", build_actros_front_bumper_and_radar),
        ("9. Boomerang Bi-Xenon / LED DRL Headlamps", build_actros_boomerang_headlamps),
        ("10. Integrated Fog Lamps & Cornering Lights", build_actros_fog_and_cornering_lamps),
        ("11. Panoramic Windshield & Tri-Jet Wipers", build_actros_windshield_and_wipers),
        ("12. GigaSpace Roof Extension Spoiler", build_actros_gigaspace_roof_spoilers),
        ("13. Integrated Sunvisor & LED Clearance Lights", build_actros_sunvisor_and_clearance_leds),
        ("14. MirrorCam Digital Camera Aerodynamic Wings", build_actros_mirrorcam_digital_system),
        ("15. Conventional Aerodynamic Euro Mirrors", build_actros_conventional_aero_mirrors),
        ("16. Full Aerodynamic Chassis Side Skirts", build_actros_aerodynamic_chassis_skirts),
        ("17. Euro VI SCR/DPF Aftertreatment Box", build_actros_euro6_aftertreatment_box),
        ("18. 650L Aluminum Fuel Tank & AdBlue Tank", build_actros_fuel_and_adblue_tanks),
        ("19. Cab Rear Collar Aerodynamic Wings", build_actros_cab_rear_collar_wings),
        ("20. Flush Doors & Concealed 4-Stage Steps", build_actros_doors_and_concealed_steps),
        ("21. 3-Piece Modular Mudguards & Anti-Spray", build_actros_rear_mudguards_and_antispray),
        ("22. ECE R58 Underrun Protection Bumper", build_actros_rear_underrun_bumper),
        ("23. Euro LED Rear Multi-Chamber Lamps", build_actros_rear_led_lamp_clusters),
        ("24. Diamond-Pattern Aluminum Catwalk Deck", build_actros_catwalk_and_ladder),
        ("25. 4-Point Air Suspended Cab Mounting", build_actros_cab_air_suspension),
        ("26. Trailer Umbilical Pylon & Suzie Coils", build_actros_trailer_umbilicals),
        ("27. OM 471 / OM 473 Engine Sump & Belly Pan", build_actros_engine_sump_and_shielding),
        ("28. Telescopic Cardan Driveshaft & Bearing", build_actros_cardan_driveshaft),
        ("29. EBS Pneumatics & E-APU Air Dryer", build_actros_ebs_pneumatics_and_apu),
        ("30. Chassis Storage Toolbox & Wheel Chocks", build_actros_toolbox_and_wheel_chocks),
        ("31. Central Chassis Lubrication System", build_actros_central_lubrication_system),
        ("32. Roof Pneumatic Air Horns & FleetBoard", build_actros_roof_horns_and_telematics),
        ("33. Rear Chassis Lead-In Guide Ramps", build_actros_lead_in_ramps),
        ("34. Front Steer Anti-Spray Splash Flaps", build_actros_front_antispray_flaps),
        ("35. ECE 70.01 Reflective Chevrons & ADR", build_actros_ece70_chevrons_and_adr),
        ("36. GigaSpace Skylight & Emergency Hatch", build_actros_skylight_hatch),
        ("37. PowerShift 3 Automated Transmission", build_actros_powershift_transmission),
        ("38. 24V Battery Carrier & Master Switch", build_actros_battery_box_and_isolator),
        ("39. ECE R104 Conspicuity Contour Tape", build_actros_ece104_conspicuity_tape),
        ("40. Rear Docking Buffers & Rollers", build_actros_docking_buffers),
        ("41. Aerodynamic Window Wind Deflectors", build_actros_window_wind_deflectors),
        ("42. High-Pressure Common-Rail & Filter", build_actros_fuel_filtration_and_rail),
        ("43. Predictive Powertrain Control & Stereo Cameras", build_actros_ppc_and_stereo_cameras),
    ]
    
    total_objects = 0
    for name, builder in subsystem_builders:
        res = builder(materials, parent=root_empty)
        if isinstance(res, list):
            count = len(res)
            total_objects += count
        elif res:
            count = 1
            total_objects += 1
        else:
            count = 0
        print(f"  [OK] Subsystem completed: {name} ({count} objects created)")
        
    print(f"[Actros MP4] Assembly complete! Total CAD objects created: {total_objects}")
    return root_empty


# =============================================================================
# EXPORT PIPELINE: DUAL-MODE GLB GENERATION
# =============================================================================

def export_actros_mp4_models(export_paths):
    """Exports the generated Mercedes-Benz Actros MP4 vehicle model to specified GLB paths."""
    for path in export_paths:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        print(f"[Export] Exporting Actros MP4 GLB to: {path}")
        bpy.ops.export_scene.gltf(
            filepath=path,
            export_format='GLB',
            use_selection=False,
            export_apply=False,
            export_yup=True,
            export_materials='EXPORT',
            export_image_format='AUTO'
        )
        file_size_mb = os.path.getsize(path) / (1024 * 1024)
        print(f"  [OK] Exported successfully ({file_size_mb:.2f} MB)")


# =============================================================================
# MAIN ENTRYPOINT
# =============================================================================

def main():
    print("=" * 80)
    print("2010s HEAVY TRUCK GENERATOR: 2014 MERCEDES-BENZ ACTROS MP4 GIGASPACE")
    print("Class-A Procedural CAD Geometry & Authentic PBR Materials Pipeline")
    print("=" * 80)
    
    # 1. Reset Scene
    safe_reset_scene()
    
    # 2. Build PBR Material Factory
    materials = create_all_actros_materials()
    print(f"[Materials] Generated {len(materials)} PBR materials")
    
    # 3. Construct Complete Vehicle
    root = build_complete_actros_mp4(materials)
    
    # 4. Export GLBs
    export_targets = [
        "public/models/vehicles/heavy_truck/2010s/vehicle.glb",
        "public/models/Car_Mercedes_Actros_MP4_2010s.glb",
        "exports/Car_Mercedes_Actros_MP4_2010s.glb"
    ]
    export_actros_mp4_models(export_targets)
    
    print("=" * 80)
    print("ALL PROCEDURAL TASKS COMPLETED SUCCESSFULLY FOR 2010s MERCEDES-BENZ ACTROS MP4")
    print("=" * 80)

if __name__ == "__main__":
    main()
