"""
=============================================================================
2000s HEAVY COMMERCIAL VEHICLE PROCEDURAL CAD GENERATOR - PHASE 1
Vehicle Model : 2005 Volvo FH12 (2nd Generation) Globetrotter XL 4x2 Tractor
Category      : Heavy Commercial Transport Truck (2000s Era)
Author        : Advanced Agentic Automotive CAD Engineering Suite
Target Engine : Blender 5.x LTS / Blender MCP Class-A BMesh Topology Standard
Coordinate Sys: Automotive Standard (+Y Forward, +Z Up, +X Driver/Right-Hand/LHD)
Phase Scope   : PHASE 1 - EXTERIOR BODY SCULPTURE, CHASSIS & RUNNING GEAR
Standards     : ECE R29 Cab Strength, ECE R58 RUPD, ECE R93 FUPS
Target Lines  : 2,500+ lines of substantive, fully procedural BMesh code.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

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
    print("[VOLVO FH12 PHASE 1] Scene reset and configured for metric Class-A CAD.")

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
            
        if bsdf.inputs.get("Transmission Weight"):
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif bsdf.inputs.get("Transmission"):
            bsdf.inputs["Transmission"].default_value = transmission
            
    set_socket("IOR", ior)
    
    if emission_color and emission_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*emission_color[:3], 1.0)
            set_socket("Emission Strength", emission_strength)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (*emission_color[:3], 1.0)
            set_socket("Emission Strength", emission_strength)
            
    if alpha < 1.0:
        set_socket("Alpha", alpha)
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'HASHED'
            
    return mat

def create_all_volvo_materials():
    """Initializes the complete palette of authentic 2000s Volvo FH12 factory showroom materials."""
    mats = {}
    
    # 1. Cab Bodywork: Swedish Prestige Ice Blue Metallic
    mats['cab_paint'] = make_pbr_material(
        'Paint_VolvoIceBlue',
        base_color=(0.12, 0.26, 0.42),
        metallic=0.30,
        roughness=0.16,
        clearcoat=1.00
    )
    
    # 2. Aerodynamic Roof Cap & Side Skirts
    mats['aero_paint'] = make_pbr_material(
        'Paint_VolvoAeroBlue',
        base_color=(0.12, 0.26, 0.42),
        metallic=0.30,
        roughness=0.16,
        clearcoat=1.00
    )
    
    # 3. Chassis Rails & Suspension: Modern Satin Chassis Grey (RAL 7021 Schwarzgrau)
    mats['chassis_grey'] = make_pbr_material(
        'Paint_ChassisDarkGrey',
        base_color=(0.045, 0.048, 0.052),
        metallic=0.25,
        roughness=0.42
    )
    
    # 4. Alcoa Dura-Bright Mirror-Polished Forged Alloy
    mats['dura_bright'] = make_pbr_material(
        'Alloy_AlcoaDuraBright',
        base_color=(0.92, 0.93, 0.94),
        metallic=0.95,
        roughness=0.06
    )
    
    # 5. Volvo Diagonal Iron Mark Chrome Bar & Badging
    mats['chrome_ironmark'] = make_pbr_material(
        'Chrome_VolvoIronMark',
        base_color=(0.96, 0.96, 0.97),
        metallic=1.00,
        roughness=0.02
    )
    
    # 6. Commercial Heavy-Duty Tire Rubber
    mats['tire_rubber'] = make_pbr_material(
        'Rubber_EuropeanTire',
        base_color=(0.026, 0.026, 0.027),
        metallic=0.00,
        roughness=0.88
    )
    
    # 7. Panoramic Windshield & Side Windows
    mats['glass_panoramic'] = make_pbr_material(
        'Glass_PanoramicGreenTint',
        base_color=(0.04, 0.06, 0.05),
        metallic=0.10,
        roughness=0.02,
        clearcoat=1.00,
        alpha=0.92
    )
    
    # 8. High-Tech Bi-Xenon Headlamp Outer Polycarbonate Cover
    mats['glass_xenon'] = make_pbr_material(
        'Glass_PolycarbonateClear',
        base_color=(0.97, 0.97, 0.98),
        metallic=0.00,
        roughness=0.02,
        transmission=0.92,
        ior=1.52,
        alpha=0.28
    )
    
    # 9. Bi-Xenon High-Intensity Projector Beam Glow
    mats['beam_xenon'] = make_pbr_material(
        'Emissive_BiXenonWhite',
        base_color=(0.88, 0.94, 1.00),
        emission_color=(0.88, 0.94, 1.00),
        emission_strength=18.0
    )
    
    # 10. Headlamp Indicator Eyebrow & Mirror Turn Signals
    mats['glass_amber'] = make_pbr_material(
        'Glass_AmberIndicator',
        base_color=(0.98, 0.52, 0.02),
        metallic=0.00,
        roughness=0.08,
        transmission=0.82,
        ior=1.54,
        alpha=0.45
    )
    
    # 11. Emissive Amber Turn Signal Glow
    mats['glow_amber'] = make_pbr_material(
        'Emissive_AmberSignal',
        base_color=(1.00, 0.50, 0.01),
        emission_color=(1.00, 0.50, 0.01),
        emission_strength=12.0
    )
    
    # 12. European 6-Chamber Taillamp Red Polycarbonate
    mats['glass_tail_red'] = make_pbr_material(
        'Glass_TaillampRed',
        base_color=(0.85, 0.02, 0.02),
        metallic=0.00,
        roughness=0.06,
        transmission=0.84,
        ior=1.54,
        alpha=0.42
    )
    
    # 13. LED Stop/Tail Lamp Red Emissive Glow
    mats['glow_led_red'] = make_pbr_material(
        'Emissive_LEDStopRed',
        base_color=(1.00, 0.02, 0.02),
        emission_color=(1.00, 0.02, 0.02),
        emission_strength=16.0
    )
    
    # 14. Reverse Lamp Clear Polycarbonate
    mats['glass_reverse'] = make_pbr_material(
        'Glass_ReverseClear',
        base_color=(0.95, 0.95, 0.95),
        roughness=0.08,
        transmission=0.85,
        alpha=0.35
    )
    
    # 15. Illuminated Globetrotter XL Roof Lightbox Panel
    mats['globetrotter_box'] = make_pbr_material(
        'Emissive_GlobetrotterSign',
        base_color=(0.96, 0.98, 1.00),
        emission_color=(0.96, 0.98, 1.00),
        emission_strength=6.5
    )
    
    # 16. Globetrotter Text Vinyl Decal
    mats['globetrotter_text'] = make_pbr_material(
        'Decal_GlobetrotterBlue',
        base_color=(0.02, 0.08, 0.18),
        metallic=0.10,
        roughness=0.35
    )
    
    # 17. Textured Composite Front Bumper & Air Intake Mesh
    mats['bumper_composite'] = make_pbr_material(
        'Plastic_AnthraciteComposite',
        base_color=(0.035, 0.036, 0.038),
        metallic=0.02,
        roughness=0.55
    )
    
    # 18. Cast Iron Heavy Engineering
    mats['cast_iron'] = make_pbr_material(
        'Iron_CastHeavy',
        base_color=(0.09, 0.09, 0.09),
        metallic=0.72,
        roughness=0.58
    )
    
    # 19. Brushed Aluminum Fuel Tanks
    mats['brushed_aluminum'] = make_pbr_material(
        'Alloy_BrushedTankAluminum',
        base_color=(0.88, 0.89, 0.90),
        metallic=0.92,
        roughness=0.18
    )
    
    # 20. AdBlue SCR Reservoir Tank
    mats['adblue_cap'] = make_pbr_material(
        'Plastic_AdBlueBlue',
        base_color=(0.01, 0.35, 0.85),
        metallic=0.00,
        roughness=0.40
    )
    
    # 21. Trailer Suzie Lines
    mats['suzie_red'] = make_pbr_material('Suzie_EmergencyAirRed', base_color=(0.88, 0.04, 0.04), metallic=0.05, roughness=0.30)
    mats['suzie_yellow'] = make_pbr_material('Suzie_ServiceAirYellow', base_color=(0.95, 0.78, 0.02), metallic=0.05, roughness=0.30)
    mats['suzie_black_ebs'] = make_pbr_material('Suzie_EBSBlack', base_color=(0.02, 0.02, 0.02), metallic=0.02, roughness=0.45)
    
    # 22. ECAS Rubber Air Spring Bags
    mats['ecas_rubber'] = make_pbr_material('Rubber_ECASAirBag', base_color=(0.025, 0.025, 0.025), metallic=0.05, roughness=0.75)
    
    # 23. ECE 70 Conspicuity Chevron Marker Plates
    mats['ece70_chevron'] = make_pbr_material('Decal_ECE70Chevron', base_color=(0.95, 0.65, 0.05), emission_color=(0.95, 0.65, 0.05), emission_strength=2.2)

    # Populate dictionary by material name as well
    for m in list(mats.values()):
        mats[m.name] = m

    aliases = {
        'Plastic_DarkAcrylic': make_pbr_material('Plastic_DarkAcrylic', base_color=(0.02, 0.02, 0.03), metallic=0.05, roughness=0.15, alpha=0.85),
        'Paint_VolvoIceBlueMetallic': mats['Paint_VolvoIceBlue'],
        'Glass_XenonHeadlampClear': mats['Glass_PolycarbonateClear'],
        'Chrome_BrightReflector': mats['Chrome_VolvoIronMark'],
        'Emissive_AmberIndicator': mats['Emissive_AmberSignal'],
        'Emissive_BacklitWhiteSign': mats['Emissive_GlobetrotterSign'],
        'Glass_DarkPrivacyTint': make_pbr_material('Glass_DarkPrivacyTint', base_color=(0.02, 0.02, 0.02), metallic=0.10, roughness=0.05, alpha=0.94),
        'Rubber_WeathersealEPDM': make_pbr_material('Rubber_WeathersealEPDM', base_color=(0.02, 0.02, 0.02), metallic=0.0, roughness=0.80),
        'Stainless_PolishedInconel': make_pbr_material('Stainless_PolishedInconel', base_color=(0.85, 0.85, 0.86), metallic=0.92, roughness=0.08),
        'Mirror_GlassReflective': make_pbr_material('Mirror_GlassReflective', base_color=(0.98, 0.98, 0.98), metallic=1.0, roughness=0.0),
        'Plastic_AnthraciteComposite': mats['Plastic_AnthraciteComposite'],
        'Rubber_TireTreadCompound': mats['Rubber_EuropeanTire'],
        'Aluminum_DuraBrightForged': mats['Alloy_AlcoaDuraBright'],
        'Aluminum_DiamondPlate': make_pbr_material('Aluminum_DiamondPlate', base_color=(0.80, 0.82, 0.84), metallic=0.88, roughness=0.25),
        'Steel_ChassisSatinBlack': mats['Paint_ChassisDarkGrey'],
        'Glass_TaillampRed': mats['Glass_TaillampRed'],
        'Glass_IndicatorAmber': mats['Glass_AmberIndicator'],
        'Emissive_TailStopRed': mats['Emissive_LEDStopRed'],
        'Iron_CastSuspension': mats['Iron_CastHeavy'],
        'Rubber_AirSuspensionBellow': mats['Rubber_ECASAirBag'],
        'trim_black': mats['Plastic_AnthraciteComposite'],
        'chrome': mats['Chrome_VolvoIronMark'],
    }
    for k, v in aliases.items():
        mats[k] = v
        mats[v.name] = v

    print(f"[VOLVO FH12 PHASE 1] Initialized {len(mats)} master PBR materials.")
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
        bm.faces.new([bm_verts[i] for i in f])

def add_cylinder_to_bmesh(bm, center, radius, length, segments=24, axis='Z', rot_euler=None):
    """Adds a cylinder aligned along specified axis."""
    c = Vector(center)
    half_len = length * 0.5
    angles = [2.0 * math.pi * i / segments for i in range(segments)]
    
    v_bot = []
    v_top = []
    
    rot_mat = Euler(rot_euler, 'XYZ').to_matrix() if rot_euler else None
    
    for a in angles:
        ca = math.cos(a) * radius
        sa = math.sin(a) * radius
        
        if axis == 'Z':
            p1 = Vector((ca, sa, -half_len))
            p2 = Vector((ca, sa, half_len))
        elif axis == 'Y':
            p1 = Vector((ca, -half_len, sa))
            p2 = Vector((ca, half_len, sa))
        elif axis == 'X':
            p1 = Vector((-half_len, ca, sa))
            p2 = Vector((half_len, ca, sa))
            
        if rot_mat:
            p1 = rot_mat @ p1
            p2 = rot_mat @ p2
            
        v_bot.append(bm.verts.new(p1 + c))
        v_top.append(bm.verts.new(p2 + c))
        
    # Side quad faces
    for i in range(segments):
        nxt = (i + 1) % segments
        bm.faces.new([v_bot[i], v_bot[nxt], v_top[nxt], v_top[i]])
        
    # Cap faces
    bm.faces.new(list(reversed(v_bot)))
    bm.faces.new(v_top)

def add_cone_to_bmesh(bm, center, radius_base, radius_top, height, segments=20, axis='Z'):
    """Adds a truncated conical frustum to BMesh."""
    half_h = height * 0.5
    c = Vector(center)
    bot_v = []
    top_v = []
    
    for i in range(segments):
        a = 2.0 * math.pi * (i / segments)
        cos_a = math.cos(a)
        sin_a = math.sin(a)
        
        if axis == 'Z':
            bot_v.append(bm.verts.new(Vector((cos_a * radius_base, sin_a * radius_base, -half_h)) + c))
            top_v.append(bm.verts.new(Vector((cos_a * radius_top, sin_a * radius_top,  half_h)) + c))
        elif axis == 'X':
            bot_v.append(bm.verts.new(Vector((-half_h, cos_a * radius_base, sin_a * radius_base)) + c))
            top_v.append(bm.verts.new(Vector(( half_h, cos_a * radius_top, sin_a * radius_top)) + c))
        elif axis == 'Y':
            bot_v.append(bm.verts.new(Vector((cos_a * radius_base, -half_h, sin_a * radius_base)) + c))
            top_v.append(bm.verts.new(Vector((cos_a * radius_top,  half_h, sin_a * radius_top)) + c))
            
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new([bot_v[i], bot_v[ni], top_v[ni], top_v[i]])
        
    if radius_base > 0.001:
        bm.faces.new(list(reversed(bot_v)))
    if radius_top > 0.001:
        bm.faces.new(top_v)

def add_tube_to_bmesh(bm, center, outer_radius, inner_radius, length, segments=24, axis='Z'):
    """Adds a hollow tubular sleeve/cylinder."""
    c = Vector(center)
    half_l = length * 0.5
    angles = [2.0 * math.pi * i / segments for i in range(segments)]
    
    o_bot, o_top = [], []
    i_bot, i_top = [], []
    
    for a in angles:
        coa = math.cos(a)
        sia = math.sin(a)
        if axis == 'Z':
            o_bot.append(bm.verts.new(c + Vector((coa * outer_radius, sia * outer_radius, -half_l))))
            o_top.append(bm.verts.new(c + Vector((coa * outer_radius, sia * outer_radius,  half_l))))
            i_bot.append(bm.verts.new(c + Vector((coa * inner_radius, sia * inner_radius, -half_l))))
            i_top.append(bm.verts.new(c + Vector((coa * inner_radius, sia * inner_radius,  half_l))))
        elif axis == 'Y':
            o_bot.append(bm.verts.new(c + Vector((coa * outer_radius, -half_l, sia * outer_radius))))
            o_top.append(bm.verts.new(c + Vector((coa * outer_radius,  half_l, sia * outer_radius))))
            i_bot.append(bm.verts.new(c + Vector((coa * inner_radius, -half_l, sia * inner_radius))))
            i_top.append(bm.verts.new(c + Vector((coa * inner_radius,  half_l, sia * inner_radius))))
        elif axis == 'X':
            o_bot.append(bm.verts.new(c + Vector((-half_l, coa * outer_radius, sia * outer_radius))))
            o_top.append(bm.verts.new(c + Vector(( half_l, coa * outer_radius, sia * outer_radius))))
            i_bot.append(bm.verts.new(c + Vector((-half_l, coa * inner_radius, sia * inner_radius))))
            i_top.append(bm.verts.new(c + Vector(( half_l, coa * inner_radius, sia * inner_radius))))
            
    for i in range(segments):
        nxt = (i + 1) % segments
        # Outer surface
        bm.faces.new([o_bot[i], o_bot[nxt], o_top[nxt], o_top[i]])
        # Inner surface
        bm.faces.new([i_top[i], i_top[nxt], i_bot[nxt], i_bot[i]])
        # Bottom ring
        bm.faces.new([o_bot[nxt], o_bot[i], i_bot[i], i_bot[nxt]])
        # Top ring
        bm.faces.new([o_top[i], o_top[nxt], i_top[nxt], i_top[i]])

def create_bmesh_object(name, material, parent=None):
    """Creates a new object linked to scene collection with material and BMesh instance."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    bm = bmesh.new()
    return obj, mesh, bm

def finalize_bmesh_object(obj, mesh, bm, smooth_angle=35.0):
    """Writes BMesh to Mesh data, frees memory, and sets auto-smooth normals."""
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if hasattr(bpy.ops.object, "shade_smooth_by_angle"):
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(smooth_angle))
    else:
        bpy.ops.object.shade_smooth()

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 1: HYDROFORMED HIGH-TENSILE STEEL LADDER CHASSIS FRAME
# ----------------------------------------------------------------------------
def build_volvo_hydroformed_chassis_frame(materials, parent=None):
    """
    Constructs the 2000s Volvo FH12 modern hydroformed high-tensile alloy steel
    ladder chassis frame, modular hole pattern grid, Front Underrun Protection
    System (FUPS) crash box, and structural crossmembers.
    
    Dimensions:
    - Wheelbase: 3,800 mm (Steer: Y = +1.600 m, Drive: Y = -2.200 m)
    - Length: Y = +2.420 m to Y = -3.430 m (Total 5.850 m)
    - Rail depth: 0.300 m (11.8 inches)
    - Flange width: 0.090 m (3.54 inches)
    - Rail thickness: 0.009 m
    - Outside frame width: 0.850 m (X = -0.425 m to +0.425 m)
    - Top flange height: Z = 0.900 m
    """
    frame_obj, frame_mesh, bm = create_bmesh_object("Chassis_Frame_Assembly", materials['Paint_ChassisDarkGrey'], parent)
    
    rail_len = 5.850
    rail_y_mid = (2.420 + (-3.430)) * 0.5  # -0.505 m
    web_h = 0.300
    flange_w = 0.090
    t = 0.009
    top_z = 0.900
    bot_z = top_z - web_h
    mid_z = (top_z + bot_z) * 0.5
    
    # 1. Left (-X) and Right (+X) Main Frame Rails
    for side in [-1.0, 1.0]:
        web_x = side * (0.425 - t * 0.5)
        # Vertical web plate
        add_box_to_bmesh(bm, (web_x, rail_y_mid, mid_z), (t, rail_len, web_h))
        
        # Upper horizontal flange (pointing inward)
        flange_x = side * (0.425 - flange_w * 0.5)
        add_box_to_bmesh(bm, (flange_x, rail_y_mid, top_z - t * 0.5), (flange_w, rail_len, t))
        
        # Lower horizontal flange (pointing inward)
        add_box_to_bmesh(bm, (flange_x, rail_y_mid, bot_z + t * 0.5), (flange_w, rail_len, t))
        
        # Rear frame cut-off tapered end (chamfered for semitrailer swing clearance)
        add_box_to_bmesh(bm, (web_x, -3.380, bot_z + 0.040), (t * 1.6, 0.100, 0.080))
        
    # 2. Front Underrun Protection System (FUPS) Crash Box Crossmember (ECE R93)
    fups_y = 2.400
    fups_z = bot_z + 0.050
    add_box_to_bmesh(bm, (0.0, fups_y, fups_z), (0.830, 0.180, 0.160))
    # Front heavy towing eye / recovery pin socket
    add_cylinder_to_bmesh(bm, (0.0, fups_y + 0.080, fups_z), 0.035, 0.140, segments=16, axis='Y')
    add_tube_to_bmesh(bm, (0.0, fups_y + 0.140, fups_z), 0.038, 0.022, 0.030, segments=16, axis='Y')
    
    # 3. Transverse Structural Crossmembers
    # A. Radiator & Front Engine Crossmember (Y = +1.700 m)
    add_box_to_bmesh(bm, (0.0, 1.700, bot_z + 0.060), (0.830, 0.180, 0.090))
    add_cylinder_to_bmesh(bm, (0.0, 1.700, bot_z + 0.060), 0.045, 0.830, segments=16, axis='X')
    
    # B. Transmission Support Mid Crossmember (Y = +0.600 m)
    add_box_to_bmesh(bm, (0.0, 0.600, mid_z - 0.020), (0.830, 0.150, 0.080))
    add_cylinder_to_bmesh(bm, (0.0, 0.600, mid_z - 0.020), 0.042, 0.830, segments=16, axis='X')
    
    # C. Center Chassis Crossmember (Y = -0.600 m, carrying air tanks and catwalk)
    add_box_to_bmesh(bm, (0.0, -0.600, mid_z), (0.830, 0.160, 0.080))
    add_cylinder_to_bmesh(bm, (0.0, -0.600, mid_z), 0.045, 0.830, segments=16, axis='X')
    
    # D. Drive Axle Air Suspension Heavy Crossmember (Y = -2.200 m)
    add_box_to_bmesh(bm, (0.0, -2.200, mid_z + 0.020), (0.830, 0.240, 0.110))
    add_box_to_bmesh(bm, (0.0, -2.200, top_z - 0.030), (0.830, 0.300, 0.040))
    
    # E. Rear End Closure Crossmember & Underrun Support (Y = -3.420 m)
    add_box_to_bmesh(bm, (0.0, -3.420, mid_z), (0.830, 0.090, web_h * 0.90))
    add_cylinder_to_bmesh(bm, (0.0, -3.420, bot_z + 0.060), 0.040, 0.830, segments=16, axis='X')
    
    # 4. Modular 50mm Hole Pattern & Chassis Fastener Bolts
    for bolt_y in [2.30, 1.90, 1.60, 1.20, 0.80, 0.40, 0.0, -0.40, -0.80, -1.20, -1.60, -2.00, -2.40, -2.80, -3.20]:
        for side in [-1.0, 1.0]:
            bx = side * 0.432
            for bz_off in [-0.09, 0.0, 0.09]:
                add_cylinder_to_bmesh(bm, (bx, bolt_y, mid_z + bz_off), 0.010, 0.014, segments=8, axis='X')
                
    finalize_bmesh_object(frame_obj, frame_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 1: Hydroformed ladder chassis frame built.")
    return frame_obj


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 2: FRONT AIR SUSPENSION, STEER AXLE & VENTILATED DISC BRAKES
# ----------------------------------------------------------------------------
def build_front_air_suspension_and_steer_axle(materials, parent=None):
    """
    Constructs the Volvo FAL 7.5 drop-forged I-beam front steer axle with
    parabolic leaf springs, anti-roll torsion bar, shock absorbers, and
    430 mm ventilated disc brakes with Knorr-Bremse calipers.
    
    Steer Axle Center: Y = +1.600 m, Z = 0.518 m (315/70R22.5 center)
    """
    susp_obj, susp_mesh, bm = create_bmesh_object("Front_Steer_Suspension", materials['Iron_CastHeavy'], parent)
    brake_obj, brake_mesh, bm_brake = create_bmesh_object("Front_Disc_Brakes", materials['Iron_CastHeavy'], parent)
    
    axle_y = 1.600
    axle_z = 0.518
    beam_drop_z = 0.425  # Center drop for D12 oil pan clearance
    
    # 1. Main Drop-Forged I-Beam Axle
    # Center dropped beam section
    add_box_to_bmesh(bm, (0.0, axle_y, beam_drop_z), (1.100, 0.080, 0.085))
    # Outer inclined transition beams to kingpins
    for side in [-1.0, 1.0]:
        t_x = side * 0.725
        t_z = (beam_drop_z + axle_z) * 0.5
        add_box_to_bmesh(bm, (t_x, axle_y, t_z), (0.350, 0.080, 0.085),
                         rot_euler=(0.0, side * math.radians(28.0), 0.0))
        # Kingpin boss knuckle hubs
        kp_x = side * 0.920
        add_cylinder_to_bmesh(bm, (kp_x, axle_y, axle_z), 0.048, 0.160, segments=16, axis='Z')
        # Steering stub axle spindle extending outward
        add_cylinder_to_bmesh(bm, (kp_x + side * 0.080, axle_y, axle_z), 0.038, 0.160, segments=16, axis='X')
        
    # 2. Parabolic Front Suspension Leaves (2-leaf high-stress parabolic pack)
    leaf_len = 1.600
    for side in [-1.0, 1.0]:
        lx = side * 0.425
        # Main master leaf with rolled eye bushings at front and rear
        add_box_to_bmesh(bm, (lx, axle_y, axle_z + 0.065), (0.080, leaf_len, 0.024))
        # Helper secondary leaf
        add_box_to_bmesh(bm, (lx, axle_y, axle_z + 0.042), (0.080, leaf_len * 0.75, 0.022))
        # Front fixed spring hanger bracket on frame rail
        add_box_to_bmesh(bm, (lx, axle_y + leaf_len * 0.5, axle_z + 0.140), (0.100, 0.120, 0.180))
        add_cylinder_to_bmesh(bm, (lx, axle_y + leaf_len * 0.5, axle_z + 0.065), 0.028, 0.110, segments=12, axis='X')
        # Rear swinging shackle bracket on frame rail
        add_box_to_bmesh(bm, (lx, axle_y - leaf_len * 0.5, axle_z + 0.140), (0.100, 0.120, 0.180))
        add_cylinder_to_bmesh(bm, (lx, axle_y - leaf_len * 0.5, axle_z + 0.065), 0.028, 0.110, segments=12, axis='X')
        # Heavy forged U-bolts clamping spring to I-beam seat
        for ub_y_off in [-0.055, 0.055]:
            add_cylinder_to_bmesh(bm, (lx - 0.045, axle_y + ub_y_off, axle_z + 0.010), 0.012, 0.150, segments=10, axis='Z')
            add_cylinder_to_bmesh(bm, (lx + 0.045, axle_y + ub_y_off, axle_z + 0.010), 0.012, 0.150, segments=10, axis='Z')
            
    # 3. Transverse Anti-Roll Torsion Stabilizer Bar
    add_cylinder_to_bmesh(bm, (0.0, axle_y + 0.280, axle_z + 0.020), 0.026, 0.880, segments=16, axis='X')
    for side in [-1.0, 1.0]:
        sb_x = side * 0.440
        # Connecting drop links to axle seat
        add_cylinder_to_bmesh(bm, (sb_x, axle_y + 0.140, axle_z + 0.040), 0.020, 0.280, segments=10, axis='Y')
        add_cylinder_to_bmesh(bm, (sb_x, axle_y + 0.020, axle_z + 0.060), 0.018, 0.120, segments=10, axis='Z')
        
    # 4. Telescopic Double-Acting Hydraulic Shock Absorbers
    for side in [-1.0, 1.0]:
        sx = side * 0.360
        # Angled damper tube linking lower spring seat to upper chassis tower
        add_cylinder_to_bmesh(bm, (sx, axle_y - 0.060, axle_z + 0.220), 0.038, 0.380, segments=16, axis='Z',
                             rot_euler=(math.radians(8.0), 0.0, side * math.radians(-5.0)))
        # Upper chassis shock mounting bracket
        add_box_to_bmesh(bm, (side * 0.425, axle_y - 0.060, 0.740), (0.080, 0.100, 0.120))
        
    # 5. Front Ventilated Disc Brakes & Knorr-Bremse Calipers (430 mm rotor)
    rotor_radius = 0.215
    for side in [-1.0, 1.0]:
        rx = side * 0.985
        # Dual-layer ventilated brake disc rotor
        add_cylinder_to_bmesh(bm_brake, (rx, axle_y, axle_z), rotor_radius, 0.045, segments=32, axis='X')
        # Center cooling ventilation slot channel
        add_tube_to_bmesh(bm_brake, (rx, axle_y, axle_z), rotor_radius - 0.030, 0.110, 0.015, segments=32, axis='X')
        # Heavy cast iron monobloc disc caliper (mounted rearward at 9 o'clock / 3 o'clock)
        add_box_to_bmesh(bm_brake, (rx - side * 0.015, axle_y - 0.130, axle_z + 0.060),
                         (0.110, 0.180, 0.140), rot_euler=(0.0, 0.0, side * math.radians(-12.0)))
        # Pneumatic brake actuator chamber
        add_cylinder_to_bmesh(bm_brake, (rx - side * 0.090, axle_y - 0.160, axle_z + 0.120),
                             0.055, 0.120, segments=16, axis='Y')
                             
    finalize_bmesh_object(susp_obj, susp_mesh, bm)
    finalize_bmesh_object(brake_obj, brake_mesh, bm_brake)
    print("[VOLVO FH12 PHASE 1] Subsystem 2: Front steer axle & disc brakes built.")
    return susp_obj


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 3: REAR DRIVE AXLE & ECAS 4-BELLOW AIR SUSPENSION
# ----------------------------------------------------------------------------
def build_rear_drive_axle_and_ecas_air_suspension(materials, parent=None):
    """
    Constructs the Volvo RSS1344B single reduction hypoid rear drive axle,
    central banjo differential housing, 4-bellow electronically controlled
    air suspension (ECAS), V-stay torque reaction rods, and rear disc brakes.
    
    Drive Axle Center: Y = -2.200 m, Z = 0.518 m
    """
    drive_obj, drive_mesh, bm = create_bmesh_object("Rear_Drive_Axle_Suspension", materials['Iron_CastHeavy'], parent)
    air_obj, air_mesh, bm_air = create_bmesh_object("ECAS_Air_Springs", materials['Rubber_ECASAirBag'], parent)
    
    axle_y = -2.200
    axle_z = 0.518
    
    # 1. Central Banjo Differential Housing & Axle Tubes
    # Heavy ductile iron differential carrier
    add_cylinder_to_bmesh(bm, (0.0, axle_y, axle_z), 0.235, 0.290, segments=24, axis='Y')
    # Front pinion input flange (connecting to driveshaft)
    add_cylinder_to_bmesh(bm, (0.0, axle_y + 0.180, axle_z), 0.080, 0.120, segments=20, axis='Y')
    # Transverse heavy steel axle carrier tubes extending to hub ends
    for side in [-1.0, 1.0]:
        tube_len = 0.860
        add_cylinder_to_bmesh(bm, (side * (0.145 + tube_len * 0.5), axle_y, axle_z),
                             0.075, tube_len, segments=20, axis='X')
        # Wheel hub carrier spindle end
        add_cylinder_to_bmesh(bm, (side * 0.980, axle_y, axle_z), 0.088, 0.120, segments=20, axis='X')
        
    # 2. ECAS 4-Bellow Air Suspension Assemblies (2 bags per side)
    bag_radius = 0.145
    bag_height = 0.270
    for side in [-1.0, 1.0]:
        bx = side * 0.470
        for by_off in [-0.360, 0.360]:
            by = axle_y + by_off
            # Rolling-lobe rubber air spring bellow
            add_cylinder_to_bmesh(bm_air, (bx, by, axle_z + 0.140), bag_radius, bag_height, segments=24, axis='Z')
            # Top stamped steel bead mounting plate attached to frame rail bracket
            add_cylinder_to_bmesh(bm, (bx, by, axle_z + 0.140 + bag_height * 0.5 + 0.015),
                                 bag_radius * 1.05, 0.030, segments=20, axis='Z')
            # Bottom piston pedestal seated on suspension Z-arm beam
            add_cylinder_to_bmesh(bm, (bx, by, axle_z + 0.140 - bag_height * 0.5 - 0.020),
                                 bag_radius * 0.95, 0.040, segments=20, axis='Z')
            # Chassis outer outrigger bracket supporting top plate from frame rail
            add_box_to_bmesh(bm, (bx - side * 0.030, by, 0.780), (0.120, 0.160, 0.180))
            
    # 3. Longitudinal Z-Arm Suspension Beams (Trailing link arms)
    for side in [-1.0, 1.0]:
        zx = side * 0.470
        # Main cast steel trailing beam spanning between front and rear air bags
        add_box_to_bmesh(bm, (zx, axle_y, axle_z - 0.040), (0.120, 1.100, 0.090))
        # Axle clamp saddle casting with heavy studs
        add_box_to_bmesh(bm, (zx, axle_y, axle_z + 0.030), (0.140, 0.220, 0.140))
        # Forward rubber pivot bushing bolted into frame crossmember hanger
        add_cylinder_to_bmesh(bm, (zx, axle_y + 0.650, axle_z + 0.020), 0.042, 0.140, segments=16, axis='X')
        add_box_to_bmesh(bm, (side * 0.425, axle_y + 0.650, 0.640), (0.100, 0.140, 0.260))
        
    # 4. Transverse V-Stay Upper Torque Reaction Rods (Triangle link)
    add_cylinder_to_bmesh(bm, (0.0, axle_y - 0.060, axle_z + 0.240), 0.035, 0.100, segments=16, axis='Z')
    for side in [-1.0, 1.0]:
        # Angled tube from differential top pivot to chassis frame brackets
        v_mid_x = side * 0.210
        v_mid_y = axle_y + 0.220
        v_mid_z = axle_z + 0.270
        add_cylinder_to_bmesh(bm, (v_mid_x, v_mid_y, v_mid_z), 0.028, 0.580, segments=14, axis='Y',
                             rot_euler=(math.radians(12.0), side * math.radians(-32.0), 0.0))
        # Frame attachment bracket
        add_box_to_bmesh(bm, (side * 0.425, axle_y + 0.440, 0.810), (0.090, 0.120, 0.100))
        
    # 5. Rear Ventilated Disc Brakes (430 mm diameter) & Dual Diaphragm Chambers
    for side in [-1.0, 1.0]:
        rx = side * 0.840
        # Brake rotor disc
        add_cylinder_to_bmesh(bm, (rx, axle_y, axle_z), 0.215, 0.045, segments=32, axis='X')
        # Floating caliper assembly
        add_box_to_bmesh(bm, (rx, axle_y - 0.140, axle_z + 0.050), (0.110, 0.180, 0.140))
        # Double diaphragm spring brake emergency parking actuator cylinder
        add_cylinder_to_bmesh(bm, (rx - side * 0.080, axle_y - 0.220, axle_z + 0.080),
                             0.065, 0.220, segments=18, axis='Y')
                             
    finalize_bmesh_object(drive_obj, drive_mesh, bm)
    finalize_bmesh_object(air_obj, air_mesh, bm_air)
    print("[VOLVO FH12 PHASE 1] Subsystem 3: Rear drive axle & ECAS air suspension built.")
    return drive_obj


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 4: 6-WHEEL FLEET (ALCOA DURA-BRIGHT WHEELS & HIGHWAY RADIALS)
# ----------------------------------------------------------------------------
def build_6_wheel_fleet(materials, parent=None):
    """
    Constructs the complete 6-wheel fleet:
    - 2x Front Steer: 22.5" x 9.00" Alcoa Dura-Bright 10-hole forged alloy wheels
      with recessed center hub, 10 lug nuts with chrome caps, and machined hand holes.
    - 4x Rear Dual Drive: 22.5" x 9.00" Alcoa Dura-Bright forged alloy wheels
      mounted in dual configuration with steel spacer rings and axle drive hub caps.
    - 6x European Highway Radial Tires: 315/70R22.5 low-rolling-resistance compound
      with directional tread grooves, shoulder sipes, and radial bead sidewalls.
      
    Dimensions:
    - Tire Outer Diameter: 1.014 m (Rolling radius: 0.518 m)
    - Tire Section Width: 0.312 m
    - Rim Diameter: 0.572 m (22.5 inches)
    - Front Track: X = +/- 1.025 m (Center of single wheel)
    - Rear Dual Track: Inner X = +/- 0.820 m, Outer X = +/- 1.150 m
    """
    wheel_obj, wheel_mesh, bm = create_bmesh_object("Wheels_Fleet_Assembly", materials['Alloy_AlcoaDuraBright'], parent)
    tire_obj, tire_mesh, bm_tire = create_bmesh_object("Tires_Fleet_Assembly", materials['Rubber_EuropeanTire'], parent)
    hub_obj, hub_mesh, bm_hub = create_bmesh_object("Wheel_Hubs_and_Lugs", materials['Iron_CastHeavy'], parent)
    
    # 1. Front Steer Wheels (Single configuration, convex outer face)
    front_y = 1.600
    front_z = 0.518
    rim_r = 0.286      # 22.5" rim outer edge
    tire_r = 0.507     # 315/70R22.5 outer tread
    tire_w = 0.312
    
    for side in [-1.0, 1.0]:
        wx = side * 1.025
        # --- Tire Assembly ---
        # Main outer tread cylinder
        add_cylinder_to_bmesh(bm_tire, (wx, front_y, front_z), tire_r, tire_w * 0.92, segments=36, axis='X')
        # Rounded outer and inner shoulder rings
        for sh_off in [-tire_w * 0.44, tire_w * 0.44]:
            add_cylinder_to_bmesh(bm_tire, (wx + sh_off, front_y, front_z), tire_r * 0.985, 0.024, segments=36, axis='X')
            add_cone_to_bmesh(bm_tire, (wx + sh_off * 0.85, front_y, front_z), tire_r * 0.985, rim_r * 1.08, 0.045, segments=36, axis='X')
        # Annular sidewall bulge
        add_tube_to_bmesh(bm_tire, (wx - side * 0.120, front_y, front_z), tire_r * 0.88, rim_r * 1.04, 0.035, segments=36, axis='X')
        add_tube_to_bmesh(bm_tire, (wx + side * 0.120, front_y, front_z), tire_r * 0.88, rim_r * 1.04, 0.035, segments=36, axis='X')
        # Longitudinal highway tread grooves (4 circumferential rain sipes)
        for gr_off in [-0.080, -0.026, 0.026, 0.080]:
            add_tube_to_bmesh(bm_tire, (wx + gr_off, front_y, front_z), tire_r + 0.002, tire_r - 0.012, 0.012, segments=36, axis='X')
            
        # --- Alcoa Dura-Bright Rim Assembly ---
        face_x = wx + side * (tire_w * 0.5 - 0.025)
        # Deep outer stepped rim flange lip
        add_tube_to_bmesh(bm, (face_x - side * 0.015, front_y, front_z), rim_r, rim_r - 0.025, 0.030, segments=36, axis='X')
        # Stepped drop center bead seat
        add_cylinder_to_bmesh(bm, (face_x - side * 0.060, front_y, front_z), rim_r - 0.025, 0.075, segments=36, axis='X')
        # Convex front dish wheel face disc
        add_cylinder_to_bmesh(bm, (face_x - side * 0.035, front_y, front_z), rim_r - 0.030, 0.025, segments=36, axis='X')
        
        # 10 Hand Holes (Ventilation apertures with smooth rounded contours)
        for h_idx in range(10):
            ha = 2.0 * math.pi * (h_idx / 10.0)
            hx = face_x - side * 0.032
            hy = front_y + math.cos(ha) * 0.195
            hz = front_z + math.sin(ha) * 0.195
            add_cylinder_to_bmesh(bm, (hx, hy, hz), 0.032, 0.028, segments=12, axis='X')
            
        # Recessed bolt circle flange & center hub
        add_cylinder_to_bmesh(bm, (face_x - side * 0.055, front_y, front_z), 0.155, 0.035, segments=24, axis='X')
        # Volvo chrome aerocap center hub cover
        add_cylinder_to_bmesh(bm_hub, (face_x - side * 0.020, front_y, front_z), 0.078, 0.065, segments=24, axis='X')
        add_cone_to_bmesh(bm_hub, (face_x + side * 0.015, front_y, front_z), 0.078, 0.062, 0.030, segments=24, axis='X')
        
        # 10 Wheel Lug Nuts with chrome conical protection sleeves
        for l_idx in range(10):
            la = 2.0 * math.pi * (l_idx / 10.0) + (math.pi / 10.0)
            lx = face_x - side * 0.040
            ly = front_y + math.cos(la) * 0.135
            lz = front_z + math.sin(la) * 0.135
            add_cylinder_to_bmesh(bm_hub, (lx, ly, lz), 0.018, 0.038, segments=10, axis='X')
            add_cone_to_bmesh(bm_hub, (lx + side * 0.015, ly, lz), 0.018, 0.012, 0.016, segments=10, axis='X')
            
    # 2. Rear Dual Drive Wheels (Dual assemblies per side)
    rear_y = -2.200
    rear_z = 0.518
    
    for side in [-1.0, 1.0]:
        for dual_idx, dual_x_center in enumerate([side * 0.820, side * 1.150]):
            wx = dual_x_center
            # --- Tire Assembly ---
            add_cylinder_to_bmesh(bm_tire, (wx, rear_y, rear_z), tire_r, tire_w * 0.92, segments=36, axis='X')
            for sh_off in [-tire_w * 0.44, tire_w * 0.44]:
                add_cylinder_to_bmesh(bm_tire, (wx + sh_off, rear_y, rear_z), tire_r * 0.985, 0.024, segments=36, axis='X')
                add_cone_to_bmesh(bm_tire, (wx + sh_off * 0.85, rear_y, rear_z), tire_r * 0.985, rim_r * 1.08, 0.045, segments=36, axis='X')
            add_tube_to_bmesh(bm_tire, (wx - side * 0.120, rear_y, rear_z), tire_r * 0.88, rim_r * 1.04, 0.035, segments=36, axis='X')
            add_tube_to_bmesh(bm_tire, (wx + side * 0.120, rear_y, rear_z), tire_r * 0.88, rim_r * 1.04, 0.035, segments=36, axis='X')
            for gr_off in [-0.080, -0.026, 0.026, 0.080]:
                add_tube_to_bmesh(bm_tire, (wx + gr_off, rear_y, rear_z), tire_r + 0.002, tire_r - 0.012, 0.012, segments=36, axis='X')
                
            # --- Rear Alcoa Rim (Deep dish concave profile on outer wheel) ---
            if dual_idx == 1:  # Outer wheel (dish faces inward, hub flange recessed deep inside)
                face_x = wx + side * 0.020
                add_tube_to_bmesh(bm, (face_x, rear_y, rear_z), rim_r, rim_r - 0.025, 0.030, segments=36, axis='X')
                # Deep dish concave center cone
                add_cone_to_bmesh(bm, (face_x - side * 0.075, rear_y, rear_z), rim_r - 0.025, 0.160, 0.140, segments=32, axis='X')
                # Center bolt flange
                add_cylinder_to_bmesh(bm, (face_x - side * 0.150, rear_y, rear_z), 0.155, 0.035, segments=24, axis='X')
                
                # 10 Hand ventilation holes on outer dish
                for h_idx in range(10):
                    ha = 2.0 * math.pi * (h_idx / 10.0)
                    hx = face_x - side * 0.065
                    hy = rear_y + math.cos(ha) * 0.210
                    hz = rear_z + math.sin(ha) * 0.210
                    add_cylinder_to_bmesh(bm, (hx, hy, hz), 0.032, 0.030, segments=12, axis='X')
                    
                # Heavy cast iron rear planetary axle hub cap projecting through wheel center
                add_cylinder_to_bmesh(bm_hub, (face_x - side * 0.080, rear_y, rear_z), 0.095, 0.170, segments=20, axis='X')
                add_box_to_bmesh(bm_hub, (face_x + side * 0.010, rear_y, rear_z), (0.025, 0.180, 0.060))
                
                # 10 Wheel Lug Nuts with yellow safety indicators (recessed inside dish)
                for l_idx in range(10):
                    la = 2.0 * math.pi * (l_idx / 10.0)
                    lx = face_x - side * 0.135
                    ly = rear_y + math.cos(la) * 0.135
                    lz = rear_z + math.sin(la) * 0.135
                    add_cylinder_to_bmesh(bm_hub, (lx, ly, lz), 0.018, 0.035, segments=10, axis='X')
            else:  # Inner dual wheel
                add_tube_to_bmesh(bm, (wx - side * 0.030, rear_y, rear_z), rim_r, rim_r - 0.025, 0.050, segments=32, axis='X')
                add_cylinder_to_bmesh(bm, (wx, rear_y, rear_z), rim_r - 0.030, 0.025, segments=32, axis='X')
                
        # Cast iron intermediate dual wheel spacer ring
        add_tube_to_bmesh(bm_hub, (side * 0.985, rear_y, rear_z), 0.185, 0.140, 0.120, segments=24, axis='X')
        
    finalize_bmesh_object(wheel_obj, wheel_mesh, bm)
    finalize_bmesh_object(tire_obj, tire_mesh, bm_tire)
    finalize_bmesh_object(hub_obj, hub_mesh, bm_hub)
    print("[VOLVO FH12 PHASE 1] Subsystem 4: 6-Wheel fleet (Alcoa wheels & tires) built.")
    return wheel_obj


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 5: JOST JSK 37C CAST STEEL FIFTH WHEEL COUPLING ASSEMBLY
# ----------------------------------------------------------------------------
def build_jost_fifth_wheel_assembly(materials, parent=None):
    """
    Constructs the Jost JSK 37C heavy-duty cast steel fifth-wheel coupling,
    mounting pedestals, slider bed angle irons bolted to chassis flanges,
    locking jaw mechanism, and manual unlock release handle.
    
    Position: Y = -2.050 m (150 mm forward of rear drive axle center)
    Coupling Height: Z = 1.150 m (Standard European semi-trailer kingpin height)
    """
    fifth_obj, fifth_mesh, bm = create_bmesh_object("Jost_Fifth_Wheel_Assembly", materials['Iron_CastHeavy'], parent)
    
    fw_y = -2.050
    fw_z = 1.150
    plate_len = 0.920
    plate_w = 0.980
    
    # 1. Main Cast Steel Coupling Top Plate
    # Forward main body plate
    add_box_to_bmesh(bm, (0.0, fw_y + 0.120, fw_z - 0.025), (plate_w, plate_len * 0.55, 0.048))
    # Chamfered lead-on guide throat ramps (horns) pointing rearward
    for side in [-1.0, 1.0]:
        horn_x = side * (plate_w * 0.27)
        horn_y = fw_y - 0.280
        add_box_to_bmesh(bm, (horn_x, horn_y, fw_z - 0.050), (plate_w * 0.38, plate_len * 0.42, 0.045),
                         rot_euler=(math.radians(14.0), side * math.radians(-6.0), 0.0))
        
    # Central V-shaped kingpin entrance throat channel
    add_box_to_bmesh(bm, (0.0, fw_y - 0.160, fw_z - 0.030), (0.160, 0.320, 0.060))
    # Kingpin locking pocket circular throat ring (2" SAE / DIN standard)
    add_cylinder_to_bmesh(bm, (0.0, fw_y + 0.040, fw_z - 0.035), 0.052, 0.050, segments=20, axis='Z')
    # Internal cast steel locking jaw wedge
    add_box_to_bmesh(bm, (0.035, fw_y + 0.040, fw_z - 0.035), (0.050, 0.080, 0.040))
    
    # Low-friction Teflon wear plate insert on top surface
    add_box_to_bmesh(bm, (0.0, fw_y + 0.100, fw_z + 0.002), (plate_w * 0.85, 0.420, 0.006))
    
    # 2. Dual Cast Steel Pivot Pedestals (Trunnion brackets)
    for side in [-1.0, 1.0]:
        px = side * 0.360
        # Pedestal tower linking chassis rail mounting plate to fifth wheel pivot pin
        add_box_to_bmesh(bm, (px, fw_y, 1.040), (0.130, 0.260, 0.170))
        # Heavy transverse pivot pin
        add_cylinder_to_bmesh(bm, (px, fw_y, fw_z - 0.055), 0.042, 0.160, segments=16, axis='X')
        # Pedestal base flange plate bolted into frame mounting angles
        add_box_to_bmesh(bm, (px, fw_y, 0.950), (0.160, 0.440, 0.024))
        
    # 3. Slider Bed Mounting Angles Bolted to Frame Rails
    for side in [-1.0, 1.0]:
        mx = side * 0.425
        # Heavy L-section angle iron resting on top chassis rail flange
        add_box_to_bmesh(bm, (mx, fw_y, 0.915), (0.110, 1.100, 0.018))
        # Vertical flange bolted into chassis web with 12 Grade-10.9 bolts
        add_box_to_bmesh(bm, (mx + side * 0.045, fw_y, 0.860), (0.018, 1.100, 0.090))
        for bolt_idx in range(6):
            by = fw_y - 0.450 + bolt_idx * 0.180
            add_cylinder_to_bmesh(bm, (mx + side * 0.055, by, 0.860), 0.011, 0.018, segments=8, axis='X')
            
    # 4. Manual Release Unlock Lever & Safety Catch Mechanism (Left Driver Side)
    add_cylinder_to_bmesh(bm, (-0.420, fw_y + 0.060, fw_z - 0.045), 0.012, 0.380, segments=10, axis='X')
    add_cylinder_to_bmesh(bm, (-0.600, fw_y + 0.060, fw_z - 0.045), 0.018, 0.080, segments=12, axis='Y')
    
    finalize_bmesh_object(fifth_obj, fifth_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 5: Jost JSK 37C fifth wheel assembly built.")
    return fifth_obj


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 6: AERODYNAMIC GLOBETROTTER XL ALL-STEEL CAB MONOCOQUE SHELL
# ----------------------------------------------------------------------------
def build_aerodynamic_globetrotter_xl_cab_shell(materials, parent=None):
    """
    Constructs the 2005 Volvo FH12 Globetrotter XL high-roof sleeper cab shell.
    Features aerodynamic 17-degree raked A-pillars, curved roof crown,
    sculpted front cab nose, integrated wheel arches, and rear sleeper bulkhead.
    
    Cab Specifications:
    - Width: 2,490 mm over side fenders (X = -1.245 m to +1.245 m)
    - Length: Y = +2.450 m (front grille line) to Y = +0.180 m (rear bulkhead) (2.270 m)
    - Floor Height: Z = 1.340 m (Flat cab floor above chassis engine tunnel)
    - Roof Peak Height: Z = 3.820 m (Globetrotter XL high roof pod)
    """
    cab_obj, cab_mesh, bm = create_bmesh_object("Cab_Monocoque_Shell", materials['Paint_VolvoIceBlue'], parent)
    aero_obj, aero_mesh, bm_aero = create_bmesh_object("Cab_Aero_Roof_Pod", materials['Paint_VolvoAeroBlue'], parent)
    trim_obj, trim_mesh, bm_trim = create_bmesh_object("Cab_Rubber_Seals", materials['Rubber_EuropeanTire'], parent)
    
    cab_w = 2.480
    half_w = cab_w * 0.5  # 1.240 m
    
    # 1. Lower Cab Monocoque Body (Floor to Beltline)
    # Floor pan & lower sill structure
    add_box_to_bmesh(bm, (0.0, 1.280, 1.380), (cab_w, 2.180, 0.120))
    
    # Front Lower Nose & Grille Fascia Surround (Y = +2.280 m to +2.440 m)
    add_box_to_bmesh(bm, (0.0, 2.360, 1.620), (cab_w * 0.94, 0.160, 0.420))
    # Aerodynamic rounded front cab corner pillars (reducing wind turbulence)
    for side in [-1.0, 1.0]:
        cx = side * (half_w - 0.080)
        add_cylinder_to_bmesh(bm, (cx, 2.260, 1.820), 0.110, 0.900, segments=16, axis='Z')
        # Cab side lower fender quarter panel
        add_box_to_bmesh(bm, (cx, 1.220, 1.620), (0.080, 2.050, 0.420))
        # Front wheel arch cut-out flare with rubber stone-guard edge
        add_tube_to_bmesh(bm_trim, (side * (half_w - 0.020), 1.600, 0.880), 0.610, 0.560, 0.045, segments=24, axis='X')
        
    # 2. Middle Cab Beltline & Window Sills (Z = 1.820 m to 2.380 m)
    # Front cowl header below windshield (sloped back 17 degrees)
    add_box_to_bmesh(bm, (0.0, 2.320, 2.080), (cab_w * 0.92, 0.140, 0.360),
                     rot_euler=(math.radians(-17.0), 0.0, 0.0))
    # Side beltline wall panels behind doors (sleeper area)
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * (half_w - 0.020), 0.650, 2.100), (0.050, 0.980, 0.600))
        
    # 3. Sloped A-Pillars & Windshield Perimeter Frame
    # Raked 17-degree aerodynamic A-pillars
    for side in [-1.0, 1.0]:
        ap_x = side * (half_w - 0.120)
        add_box_to_bmesh(bm, (ap_x, 1.950, 2.650), (0.090, 0.110, 1.180),
                         rot_euler=(math.radians(-17.0), side * math.radians(4.0), 0.0))
        
    # Windshield Upper Header Crossmember
    add_box_to_bmesh(bm, (0.0, 1.680, 3.080), (cab_w * 0.88, 0.140, 0.120),
                     rot_euler=(math.radians(-12.0), 0.0, 0.0))
                     
    # 4. Globetrotter XL Aerodynamic High Roof Pod (Z = 3.080 m to 3.820 m)
    # Main arched high roof shell
    add_box_to_bmesh(aero_obj and bm_aero, (0.0, 1.150, 3.420), (cab_w * 0.95, 2.050, 0.620))
    # Aerodynamic forward-sloping roof nose brow above windshield header
    add_cone_to_bmesh(bm_aero, (0.0, 1.920, 3.320), cab_w * 0.46, cab_w * 0.40, 0.420, segments=24, axis='Y')
    # High-roof curved crown top plate
    add_cylinder_to_bmesh(bm_aero, (0.0, 1.150, 3.680), cab_w * 0.48, 1.950, segments=24, axis='Y')
    
    # 5. Rear Sleeper Bulkhead Wall (Y = +0.180 m)
    # Solid structural back wall with vertical reinforcement ribs
    add_box_to_bmesh(bm, (0.0, 0.190, 2.500), (cab_w * 0.96, 0.045, 2.250))
    for rib_x in [-0.80, -0.40, 0.0, 0.40, 0.80]:
        add_box_to_bmesh(bm, (rib_x, 0.170, 2.500), (0.040, 0.035, 2.150))
        
    finalize_bmesh_object(cab_obj, cab_mesh, bm)
    finalize_bmesh_object(aero_obj, aero_mesh, bm_aero)
    finalize_bmesh_object(trim_obj, trim_mesh, bm_trim)
    print("[VOLVO FH12 PHASE 1] Subsystem 6: Aerodynamic Globetrotter XL cab shell built.")
    return cab_obj


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 7: INTEGRATED 3-PIECE FRONT BUMPER & FUPS (ECE R93)
# ----------------------------------------------------------------------------
def build_integrated_3piece_aerodynamic_bumper_and_fups(materials, parent=None):
    """
    Constructs the 3-piece aerodynamic modular front bumper, lower heavy-duty
    steel Front Underrun Protection System (FUPS) crossbeam, fold-out boarding
    steps, lower cooling air intake scoop, and front tow coupling socket.
    
    Position: Y = +2.440 m to +2.540 m, Z = 0.420 m to 1.150 m
    Width: 2,490 mm across bumper corner wraps
    """
    bump_obj, bump_mesh, bm = create_bmesh_object("Bumper_Aerodynamic_3Piece", materials['Plastic_AnthraciteComposite'], parent)
    fups_obj, fups_mesh, bm_fups = create_bmesh_object("FUPS_Steel_Beam", materials['Paint_ChassisDarkGrey'], parent)
    
    bump_y = 2.480
    bump_w = 2.480
    half_bw = bump_w * 0.5
    
    # 1. Central Aerodynamic Bumper Section
    add_box_to_bmesh(bm, (0.0, bump_y, 0.820), (1.420, 0.160, 0.440))
    # Lower cooling air intake scoop mouth
    add_box_to_bmesh(bm, (0.0, bump_y + 0.040, 0.640), (1.100, 0.120, 0.160))
    # Fold-out radiator maintenance boarding step (center step tread)
    add_box_to_bmesh(bm, (0.0, bump_y + 0.090, 0.960), (0.740, 0.110, 0.035))
    
    # 2. Left and Right Aerodynamic Bumper Corner Wrap Extensions
    for side in [-1.0, 1.0]:
        cx = side * (half_bw - 0.260)
        # Swept-back aerodynamic corner section
        add_box_to_bmesh(bm, (cx, bump_y - 0.120, 0.820), (0.580, 0.320, 0.440),
                         rot_euler=(0.0, 0.0, side * math.radians(-18.0)))
        # Integrated headlamp recess buckets in bumper corners
        add_box_to_bmesh(bm, (side * 0.920, bump_y - 0.020, 0.940), (0.340, 0.160, 0.220),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
        # Lower fog/cornering light housing apertures
        add_box_to_bmesh(bm, (side * 0.880, bump_y + 0.020, 0.680), (0.220, 0.140, 0.120),
                         rot_euler=(0.0, 0.0, side * math.radians(-12.0)))
        # Lower front entry boarding stirrup integrated into bumper corner
        add_box_to_bmesh(bm, (side * (half_bw - 0.080), bump_y - 0.280, 0.580), (0.160, 0.280, 0.080))
        
    # 3. Heavy Steel Front Underrun Protection System (FUPS) Beam (ECE R93)
    # Heavy boxed steel tube spanning behind and below composite bumper
    add_box_to_bmesh(bm_fups, (0.0, bump_y - 0.040, 0.460), (2.280, 0.140, 0.120))
    for side in [-1.0, 1.0]:
        # Diagonal collision energy absorption crush brackets to chassis rails
        add_box_to_bmesh(bm_fups, (side * 0.425, bump_y - 0.140, 0.520), (0.120, 0.220, 0.180))
        
    finalize_bmesh_object(bump_obj, bump_mesh, bm)
    finalize_bmesh_object(fups_obj, fups_mesh, bm_fups)
    print("[VOLVO FH12 PHASE 1] Subsystem 7: 3-piece front bumper & FUPS built.")
    return bump_obj


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 8: CHASSIS AERODYNAMIC SIDE SKIRTS, D-TANKS & ADBLUE RESERVOIR
# ----------------------------------------------------------------------------
def build_chassis_aerodynamic_side_skirts_and_tanks(materials, parent=None):
    """
    Constructs the European aerodynamic chassis side fairings / skirts enclosing
    both chassis flanks between front and rear axles (wheelbase area).
    Conceals the 600L driver-side D-shaped aluminum fuel tank, 450L passenger
    tank, 60L AdBlue SCR tank, and chassis battery enclosure.
    
    Span: Y = +0.800 m to Y = -1.550 m (2.350 m length)
    Width: Flush with outer cab width (X = +/- 1.220 m)
    Height: Z = 0.360 m (ground clearance 360 mm) to Z = 0.940 m
    """
    skirt_obj, skirt_mesh, bm = create_bmesh_object("Chassis_Aero_Side_Skirts", materials['Paint_VolvoAeroBlue'], parent)
    tank_obj, tank_mesh, bm_tank = create_bmesh_object("Chassis_Fuel_Tanks_Internal", materials['Alloy_BrushedTankAluminum'], parent)
    adblue_obj, adblue_mesh, bm_adblue = create_bmesh_object("AdBlue_SCR_Tank", materials['Plastic_AnthraciteComposite'], parent)
    
    skirt_y_mid = (0.800 + (-1.550)) * 0.5  # -0.375 m
    skirt_len = 2.350
    skirt_h = 0.560
    skirt_z_mid = 0.650
    
    # 1. Left (-X) and Right (+X) Full Aerodynamic Skirt Panels
    for side in [-1.0, 1.0]:
        sx = side * 1.210
        # Main vertical outer aerodynamic fairing panel
        add_box_to_bmesh(bm, (sx, skirt_y_mid, skirt_z_mid), (0.040, skirt_len, skirt_h))
        # Top rolled horizontal lip sealing against cab and frame
        add_box_to_bmesh(bm, (sx - side * 0.080, skirt_y_mid, skirt_z_mid + skirt_h * 0.5 - 0.015),
                         (0.180, skirt_len, 0.030))
        # Bottom curved aerodynamic ground-effect diffuser flange
        add_box_to_bmesh(bm, (sx - side * 0.040, skirt_y_mid, skirt_z_mid - skirt_h * 0.5 + 0.015),
                         (0.100, skirt_len, 0.030))
        # Front curved wheel arch flare transition
        add_cylinder_to_bmesh(bm, (sx, 0.780, skirt_z_mid), 0.060, skirt_h, segments=16, axis='Z')
        # Rear curved wheel arch flare transition
        add_cylinder_to_bmesh(bm, (sx, -1.530, skirt_z_mid), 0.060, skirt_h, segments=16, axis='Z')
        # Fold-out step cutout recess with anti-slip tread for catwalk access
        add_box_to_bmesh(bm, (sx, skirt_y_mid + 0.450, skirt_z_mid), (0.070, 0.360, 0.140))
        
    # 2. Left (-X) Driver Side 600-Liter D-Shaped Brushed Aluminum Fuel Tank
    tank_l_len = 1.620
    tank_l_y = skirt_y_mid - 0.120
    tank_d_w = 0.680
    tank_d_h = 0.650
    # D-profile extruded cylinder / box body
    add_box_to_bmesh(bm_tank, (-0.820, tank_l_y, 0.650), (tank_d_w, tank_l_len, tank_d_h))
    add_cylinder_to_bmesh(bm_tank, (-0.820 - tank_d_w * 0.35, tank_l_y, 0.650), tank_d_h * 0.48, tank_l_len, segments=24, axis='Y')
    # Heavy steel J-brackets clamping tank to chassis rail
    for j_off in [-0.55, 0.0, 0.55]:
        add_tube_to_bmesh(bm_tank, (-0.820, tank_l_y + j_off, 0.650), tank_d_w * 0.54, tank_d_w * 0.50, 0.045, segments=24, axis='Y')
        
    # 3. Right (+X) Passenger Side 450-Liter Fuel Tank & 60L AdBlue SCR Reservoir
    tank_r_len = 1.150
    tank_r_y = skirt_y_mid - 0.320
    add_box_to_bmesh(bm_tank, (0.820, tank_r_y, 0.650), (tank_d_w, tank_r_len, tank_d_h))
    add_cylinder_to_bmesh(bm_tank, (0.820 + tank_d_w * 0.35, tank_r_y, 0.650), tank_d_h * 0.48, tank_r_len, segments=24, axis='Y')
    
    # AdBlue SCR Reservoir (Forward of right tank)
    adblue_y = 0.420
    add_box_to_bmesh(bm_adblue, (0.780, adblue_y, 0.650), (0.480, 0.540, 0.520))
    # Distinctive AdBlue blue filler neck & cap
    add_cylinder_to_bmesh(bm_adblue, (0.980, adblue_y, 0.880), 0.045, 0.060, segments=16, axis='Z')
    
    finalize_bmesh_object(skirt_obj, skirt_mesh, bm)
    finalize_bmesh_object(tank_obj, tank_mesh, bm_tank)
    finalize_bmesh_object(adblue_obj, adblue_mesh, bm_adblue)
    print("[VOLVO FH12 PHASE 1] Subsystem 8: Chassis aero skirts, fuel & AdBlue tanks built.")
    return skirt_obj


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 9: CAB REAR COLLAR SIDE DEFLECTOR EXTENDER WINGS
# ----------------------------------------------------------------------------
def build_cab_rear_collar_side_deflectors(materials, parent=None):
    """
    Constructs the vertical aerodynamic side collar extender wings attached
    to the rear vertical corners of the Globetrotter XL cab.
    These extend 500 mm rearward over the trailer kingpin gap to eliminate
    aerodynamic vortex detachment between tractor and semi-trailer.
    
    Position: Y = +0.180 m to -0.320 m (500 mm depth)
    Span: Z = 1.450 m to 3.820 m (Full cab height: 2.370 m)
    """
    wing_obj, wing_mesh, bm = create_bmesh_object("Cab_Rear_Collar_Wings", materials['Paint_VolvoAeroBlue'], parent)
    rubber_obj, rubber_mesh, bm_rubber = create_bmesh_object("Collar_Rubber_Gaskets", materials['Rubber_EuropeanTire'], parent)
    
    wing_z_mid = (1.450 + 3.820) * 0.5  # 2.635 m
    wing_h = 3.820 - 1.450               # 2.370 m
    wing_depth = 0.500
    wing_y_mid = 0.180 - wing_depth * 0.5 # -0.070 m
    
    for side in [-1.0, 1.0]:
        wx = side * 1.235
        # Aerodynamic curved composite wing blade
        add_box_to_bmesh(bm, (wx, wing_y_mid, wing_z_mid), (0.024, wing_depth, wing_h),
                         rot_euler=(0.0, 0.0, side * math.radians(-3.0)))
        # Flexible EPDM rubber rear trailing edge blade (preventing trailer impact damage)
        add_box_to_bmesh(bm_rubber, (wx, 0.180 - wing_depth - 0.040, wing_z_mid), (0.012, 0.080, wing_h))
        # Top horizontal aerodynamic bridge spoiler linking left and right wings
        if side == 1.0:
            add_box_to_bmesh(bm, (0.0, wing_y_mid, 3.810), (2.420, wing_depth, 0.025))
            add_box_to_bmesh(bm_rubber, (0.0, 0.180 - wing_depth - 0.040, 3.810), (2.420, 0.080, 0.015))
            
        # Heavy cast aluminum hinge brackets securing wing to cab frame
        for hz in [1.65, 2.20, 2.85, 3.50]:
            add_box_to_bmesh(bm, (wx - side * 0.040, 0.160, hz), (0.060, 0.090, 0.080))
            
    finalize_bmesh_object(wing_obj, wing_mesh, bm)
    finalize_bmesh_object(rubber_obj, rubber_mesh, bm_rubber)
    print("[VOLVO FH12 PHASE 1] Subsystem 9: Cab rear collar side deflector wings built.")
    return wing_obj


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 10: 3-PIECE EUROPEAN REAR DRIVE AXLE FENDERS & MUDFLAPS
# ----------------------------------------------------------------------------
def build_3piece_rear_fenders_and_mudflaps(materials, parent=None):
    """
    Constructs the 3-piece thermoplastic rear drive axle fenders (front quarter,
    top horizontal bridge, rear quarter), heavy tubular stay brackets,
    anti-spray brush inner liners, and rubber mudflaps with Volvo Iron Mark.
    
    Drive Axle Center: Y = -2.200 m, Z = 0.518 m
    """
    fend_obj, fend_mesh, bm = create_bmesh_object("Rear_Drive_Fenders_3Piece", materials['Plastic_AnthraciteComposite'], parent)
    flap_obj, flap_mesh, bm_flap = create_bmesh_object("Rear_Volvo_Mudflaps", materials['Rubber_EuropeanTire'], parent)
    
    axle_y = -2.200
    fend_r = 0.620  # Fender radius over 1.014 m tire
    fend_w = 0.720  # Spanning both dual rear wheels
    
    for side in [-1.0, 1.0]:
        fx = side * 0.985
        # 1. Top Horizontal Deck Bridge Center Section
        add_box_to_bmesh(bm, (fx, axle_y, 0.518 + fend_r + 0.015), (fend_w, 0.780, 0.035))
        
        # 2. Forward Quarter Curved Shell
        add_tube_to_bmesh(bm, (fx, axle_y, 0.518), fend_r + 0.030, fend_r, 0.540, segments=24, axis='X')
        # Lower forward stone-guard return lip
        add_box_to_bmesh(bm, (fx, axle_y + 0.620, 0.680), (fend_w, 0.080, 0.280))
        
        # 3. Rear Quarter Curved Shell
        # Lower rear vertical apron holding mudflap
        add_box_to_bmesh(bm, (fx, axle_y - 0.640, 0.720), (fend_w, 0.080, 0.360))
        
        # 4. Transverse Tubular Support Stays Bolted to Chassis Rails
        for stay_y in [axle_y + 0.480, axle_y - 0.480]:
            add_cylinder_to_bmesh(bm, (side * 0.680, stay_y, 0.880), 0.024, 0.580, segments=12, axis='X')
            add_box_to_bmesh(bm, (side * 0.425, stay_y, 0.880), (0.080, 0.110, 0.090))
            
        # 5. Heavy Rubber Anti-Spray Rear Mudflap (Hanging behind drive tires)
        flap_y = axle_y - 0.710
        add_box_to_bmesh(bm_flap, (fx, flap_y, 0.420), (fend_w * 0.96, 0.022, 0.520))
        # Embossed rectangular backing plate with Volvo crest
        add_box_to_bmesh(bm_flap, (fx, flap_y - 0.012, 0.420), (fend_w * 0.80, 0.010, 0.240))
        
    finalize_bmesh_object(fend_obj, fend_mesh, bm)
    finalize_bmesh_object(flap_obj, flap_mesh, bm_flap)
    print("[VOLVO FH12 PHASE 1] Subsystem 10: 3-piece rear drive fenders & mudflaps built.")
    return fend_obj


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 11: ECE R58 REAR UNDERRUN PROTECTION BUMPER BAR (RUPD)
# ----------------------------------------------------------------------------
def build_ece_rear_underrun_bumper(materials, parent=None):
    """
    Constructs the ECE R58-compliant heavy tubular/channel rear underrun
    protection device (RUPD) spanning the full width of the rear tractor frame.
    Includes drop support uprights, emergency towing clevis eye, and rear end-caps.
    
    Position: Y = -3.440 m, Height: Z = 0.460 m to 0.580 m (ground clearance 460 mm)
    Width: 2,420 mm
    """
    rupd_obj, rupd_mesh, bm = create_bmesh_object("ECE_Rear_Underrun_Bumper", materials['Paint_ChassisDarkGrey'], parent)
    decal_obj, decal_mesh, bm_decal = create_bmesh_object("ECE70_Rear_Chevrons", materials['Decal_ECE70Chevron'], parent)
    
    bar_y = -3.440
    bar_z = 0.520
    bar_w = 2.420
    
    # 1. Main Transverse Heavy-Duty Steel Impact Beam
    add_box_to_bmesh(bm, (0.0, bar_y, bar_z), (bar_w, 0.110, 0.130))
    # Plastic end-caps with rounded bevels
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * (bar_w * 0.5 - 0.020), bar_y, bar_z), (0.040, 0.115, 0.135))
        
    # 2. Vertical Heavy Steel Drop Stanchion Uprights Bolted to Chassis Rails
    for side in [-1.0, 1.0]:
        ux = side * 0.425
        # Vertical drop column linking frame rail end to underrun impact beam
        add_box_to_bmesh(bm, (ux, bar_y + 0.040, 0.710), (0.090, 0.120, 0.320))
        # Diagonal rear chassis stiffener gusset struts
        add_box_to_bmesh(bm, (ux, bar_y + 0.180, 0.680), (0.070, 0.280, 0.070),
                         rot_euler=(math.radians(35.0), 0.0, 0.0))
        # Grade-10.9 mounting bolt clusters
        for bz in [0.62, 0.74, 0.84]:
            add_cylinder_to_bmesh(bm, (ux + side * 0.050, bar_y + 0.040, bz), 0.012, 0.022, segments=8, axis='X')
            
    # 3. Heavy Central Emergency Towing Clevis Eye / Tow Pin Housing
    add_box_to_bmesh(bm, (0.0, bar_y - 0.030, bar_z), (0.160, 0.160, 0.110))
    add_cylinder_to_bmesh(bm, (0.0, bar_y - 0.090, bar_z), 0.035, 0.120, segments=16, axis='Y')
    add_tube_to_bmesh(bm, (0.0, bar_y - 0.090, bar_z), 0.038, 0.022, 0.045, segments=16, axis='Z')
    
    # 4. ECE 70 Yellow/Red Retro-Reflective Conspicuity Warning Plates
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm_decal, (side * 0.850, bar_y - 0.058, bar_z), (0.540, 0.005, 0.110))
        
    finalize_bmesh_object(rupd_obj, rupd_mesh, bm)
    finalize_bmesh_object(decal_obj, decal_mesh, bm_decal)
    print("[VOLVO FH12 PHASE 1] Subsystem 11: ECE R58 rear underrun bumper built.")
    return rupd_obj


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 12: PUNCHED ALUMINUM CATWALK DECK & CHASSIS ACCESS STEPS
# ----------------------------------------------------------------------------
def build_aluminum_catwalk_deck_and_steps(materials, parent=None):
    """
    Constructs the punched non-skid aluminum catwalk deck plate spanning
    the chassis frame rails immediately behind the sleeper cab bulkhead.
    Allows safe operator footing for connecting trailer air and electric lines.
    Includes chassis boarding ladder steps on the left driver side.
    
    Position: Y = +0.140 m to -0.920 m (1.060 m length), Top of Frame: Z = 0.912 m
    Width: 0.880 m across frame rails
    """
    deck_obj, deck_mesh, bm = create_bmesh_object("Chassis_Catwalk_Deck", materials['Aluminum_DiamondPlate'], parent)
    step_obj, step_mesh, bm_step = create_bmesh_object("Chassis_Access_Ladder", materials['Alloy_AlcoaDuraBright'], parent)
    
    deck_y_mid = (0.140 + (-0.920)) * 0.5  # -0.390 m
    deck_len = 1.060
    deck_w = 0.860
    deck_z = 0.915
    
    # 1. Main Non-Skid Punched Catwalk Deck Plate
    add_box_to_bmesh(bm, (0.0, deck_y_mid, deck_z), (deck_w, deck_len, 0.016))
    # Outer side bent edge flanges (anti-slip kick plates)
    for side in [-1.0, 1.0]:
        add_box_to_bmesh(bm, (side * (deck_w * 0.5 - 0.015), deck_y_mid, deck_z + 0.020), (0.030, deck_len, 0.040))
        
    # Raised punched traction grip perforations (checker grid)
    for rx in [-0.32, -0.16, 0.0, 0.16, 0.32]:
        for ry_idx in range(6):
            ry = deck_y_mid - 0.40 + ry_idx * 0.16
            add_cylinder_to_bmesh(bm, (rx, ry, deck_z + 0.009), 0.022, 0.006, segments=10, axis='Z')
            
    # Forward transverse catwalk bridge section wrapping around cab back
    add_box_to_bmesh(bm, (0.0, 0.100, deck_z), (1.180, 0.160, 0.016))
    
    # 2. Left Driver-Side Chassis Access Boarding Steps
    ladder_x = -1.215
    ladder_y = 0.080
    # Two extruded aluminum boarding rungs with serrated anti-slip treads
    add_box_to_bmesh(bm_step, (ladder_x, ladder_y, 0.720), (0.110, 0.340, 0.040))
    add_box_to_bmesh(bm_step, (ladder_x, ladder_y, 0.520), (0.110, 0.340, 0.040))
    # Vertical tubular support handrails bolted to cab collar frame
    add_cylinder_to_bmesh(bm_step, (ladder_x + 0.020, ladder_y + 0.150, 0.820), 0.016, 0.480, segments=12, axis='Z')
    add_cylinder_to_bmesh(bm_step, (ladder_x + 0.020, ladder_y - 0.150, 0.820), 0.016, 0.480, segments=12, axis='Z')
    
    finalize_bmesh_object(deck_obj, deck_mesh, bm)
    finalize_bmesh_object(step_obj, step_mesh, bm_step)
    print("[VOLVO FH12 PHASE 1] Subsystem 12: Aluminum catwalk deck & boarding steps built.")
    return deck_obj


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 13: VOLVO D12D ENGINE SUMP, BELLHOUSING & ENCAPSULATION
# ----------------------------------------------------------------------------
def build_volvo_d12d_engine_sump_and_encapsulation(materials, parent=None):
    """
    Constructs the visible low-hanging underside powertrain components:
    - Cast aluminum ribbed oil pan sump of the Volvo D12D 12.1L turbo engine
    - Flywheel bellhousing & I-Shift 12-speed automated transmission casing
    - Lower acoustic noise encapsulation shields (ECE R51 noise abatement)
    
    Position: Y = +2.050 m to +0.220 m, Center Z = 0.480 m
    """
    sump_obj, sump_mesh, bm = create_bmesh_object("Engine_Transmission_Underside", materials['Iron_CastHeavy'], parent)
    shield_obj, shield_mesh, bm_shield = create_bmesh_object("Acoustic_Belly_Shields", materials['Plastic_AnthraciteComposite'], parent)
    
    # 1. Volvo D12D 12.1L Engine Lower Sump Pan
    sump_y = 1.480
    # Ribbed cast aluminum oil sump pan
    add_box_to_bmesh(bm, (0.0, sump_y, 0.460), (0.460, 0.780, 0.180))
    # Deep oil pickup reservoir well at rear
    add_box_to_bmesh(bm, (0.0, sump_y - 0.220, 0.390), (0.420, 0.360, 0.160))
    # Magnetic oil drain plug
    add_cylinder_to_bmesh(bm, (0.0, sump_y - 0.320, 0.320), 0.022, 0.030, segments=12, axis='Z')
    # Longitudinal cooling and stiffening ribs on oil pan
    for rx in [-0.16, -0.08, 0.0, 0.08, 0.16]:
        add_box_to_bmesh(bm, (rx, sump_y, 0.380), (0.016, 0.740, 0.024))
        
    # 2. Flywheel Bellhousing (Y = +0.950 m)
    add_cylinder_to_bmesh(bm, (0.0, 0.950, 0.580), 0.260, 0.160, segments=24, axis='Y')
    
    # 3. Volvo I-Shift 12-Speed Automated Manual Gearbox Casing (Y = +0.480 m)
    add_box_to_bmesh(bm, (0.0, 0.540, 0.560), (0.420, 0.680, 0.340))
    # Transmission rear output flange (connecting to driveshaft)
    add_cylinder_to_bmesh(bm, (0.0, 0.180, 0.520), 0.090, 0.110, segments=20, axis='Y')
    
    # 4. European Acoustic Noise Encapsulation Belly Shield (ECE R51 noise package)
    add_box_to_bmesh(bm_shield, (0.0, 1.420, 0.310), (0.840, 1.480, 0.025))
    
    finalize_bmesh_object(sump_obj, sump_mesh, bm)
    finalize_bmesh_object(shield_obj, shield_mesh, bm_shield)
    print("[VOLVO FH12 PHASE 1] Subsystem 13: Engine sump & encapsulation built.")
    return sump_obj


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 14: REAR CHASSIS TRAILER APPROACH RAMPS
# ----------------------------------------------------------------------------
def build_rear_chassis_approach_ramps(materials, parent=None):
    """
    Constructs the heavy pressed-steel trailer lead-on chassis guide ramps
    bolted onto the top flange of both chassis rails at the rear cut-off.
    These guide the trailer apron plate smoothly up onto the fifth wheel plate.
    
    Position: Y = -2.850 m to -3.420 m (0.570 m length)
    """
    ramp_obj, ramp_mesh, bm = create_bmesh_object("Trailer_Approach_Ramps", materials['Iron_CastHeavy'], parent)
    
    ramp_y = -3.120
    ramp_len = 0.580
    
    for side in [-1.0, 1.0]:
        rx = side * 0.425
        # Sloped angle ramp plate sloping down from Z=0.900m to Z=0.740m at rear
        add_box_to_bmesh(bm, (rx, ramp_y, 0.820), (0.110, ramp_len, 0.022),
                         rot_euler=(math.radians(16.0), 0.0, 0.0))
        # Side guide ridge keeping trailer kingpin centered
        add_box_to_bmesh(bm, (rx + side * 0.045, ramp_y, 0.835), (0.020, ramp_len, 0.045),
                         rot_euler=(math.radians(16.0), 0.0, 0.0))
        # Heavy mounting bolts into chassis rail top flange
        for by in [-2.92, -3.12, -3.32]:
            add_cylinder_to_bmesh(bm, (rx, by, 0.840), 0.010, 0.018, segments=8, axis='Z')
            
    finalize_bmesh_object(ramp_obj, ramp_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 14: Trailer approach ramps built.")
    return ramp_obj


# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 15: FRONT STEER AXLE ANTI-SPRAY FLAPS
# ----------------------------------------------------------------------------
def build_front_axle_anti_spray_flaps(materials, parent=None):
    """
    Constructs the flexible heavy rubber anti-spray mudflaps hanging behind
    the front steer tires inside the cab wheel arch wells (ECE R109 spray suppression).
    
    Position: Y = +1.120 m (behind steer wheel at Y=+1.600m), Z = 0.420 m
    """
    flap_obj, flap_mesh, bm = create_bmesh_object("Front_Steer_Mudflaps", materials['Rubber_EuropeanTire'], parent)
    
    flap_y = 1.120
    flap_w = 0.340
    flap_h = 0.440
    
    for side in [-1.0, 1.0]:
        fx = side * 1.025
        # Hanging rubber sheet
        add_box_to_bmesh(bm, (fx, flap_y, 0.440), (flap_w, 0.018, flap_h))
        # Galvanized steel top retaining bracket clamp bar
        add_box_to_bmesh(bm, (fx, flap_y - 0.010, 0.650), (flap_w * 1.05, 0.035, 0.040))
        # Retaining carriage bolts
        for bx_off in [-0.12, 0.0, 0.12]:
            add_cylinder_to_bmesh(bm, (fx + bx_off, flap_y - 0.025, 0.650), 0.008, 0.015, segments=8, axis='Y')
            
    finalize_bmesh_object(flap_obj, flap_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 15: Front steer anti-spray mudflaps built.")
    return flap_obj


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 16: FULL UNDERBODY BELLY PAN & ENCLOSED WHEEL TUBS
# ----------------------------------------------------------------------------
def build_under_chassis_full_belly_pan_and_tubs(materials, parent=None):
    """
    Constructs the full-length underbody aerodynamic floor panels and enclosed
    wheel arch tubs. Completely eliminates any see-through voids from any viewing
    angle (front, side, rear, 3/4 views) in accordance with the Class-A standard.
    
    Span: Y = +2.450 m (front bumper) to Y = -3.420 m (rear crossmember)
    Width: 0.850 m (frame rails) + side skirt under-trays out to 2.450 m
    """
    pan_obj, pan_mesh, bm = create_bmesh_object("Underbody_Full_Belly_Pan", materials['Plastic_AnthraciteComposite'], parent)
    tub_obj, tub_mesh, bm_tub = create_bmesh_object("Enclosed_Wheel_Tubs", materials['Plastic_AnthraciteComposite'], parent)
    
    # 1. Front Engine & Radiator Undertray Belly Pan
    # Slopes upward from front FUPS beam to engine front
    add_box_to_bmesh(bm, (0.0, 2.050, 0.420), (1.180, 0.840, 0.024),
                     rot_euler=(math.radians(-6.0), 0.0, 0.0))
    # Aerodynamic cooling air guide strakes
    for sx in [-0.45, -0.22, 0.0, 0.22, 0.45]:
        add_box_to_bmesh(bm, (sx, 2.050, 0.405), (0.016, 0.780, 0.035),
                         rot_euler=(math.radians(-6.0), 0.0, 0.0))
        
    # 2. Central Under-Transmission & Driveshaft Belly Pan
    add_box_to_bmesh(bm, (0.0, 0.650, 0.380), (0.840, 1.850, 0.022))
    for rx in [-0.35, -0.18, 0.0, 0.18, 0.35]:
        add_box_to_bmesh(bm, (rx, 0.650, 0.368), (0.014, 1.800, 0.028))
        
    # 3. Rear Bogie & Differential Undertray Aerodynamic Diffuser Plate
    add_box_to_bmesh(bm, (0.0, -1.850, 0.380), (0.840, 1.450, 0.022))
    add_box_to_bmesh(bm, (0.0, -2.850, 0.420), (0.840, 0.950, 0.022),
                     rot_euler=(math.radians(5.0), 0.0, 0.0))
                     
    # 4. Enclosed Front Steer Wheel Inner Splash Tubs
    # Curved thermoplastic splash shields completely closing the gap between
    # front wheel arch outer flare and the engine compartment side walls
    steer_y = 1.600
    tub_r = 0.580
    tub_w = 0.380
    for side in [-1.0, 1.0]:
        tx = side * 0.820
        # Curved arch top shield
        add_tube_to_bmesh(bm_tub, (tx, steer_y, 0.518), tub_r + 0.020, tub_r, tub_w, segments=24, axis='X')
        # Front vertical inner splash apron
        add_box_to_bmesh(bm_tub, (tx, steer_y + 0.550, 0.680), (tub_w, 0.022, 0.420))
        # Rear vertical inner splash apron
        add_box_to_bmesh(bm_tub, (tx, steer_y - 0.550, 0.680), (tub_w, 0.022, 0.420))
        # Inner vertical closure wall sealing against chassis frame rail
        add_box_to_bmesh(bm_tub, (side * 0.480, steer_y, 0.720), (0.020, 1.150, 0.480))
        
    # 5. Enclosed Rear Drive Wheel Inner Splash Tubs
    rear_y = -2.200
    r_tub_r = 0.640
    r_tub_w = 0.420
    for side in [-1.0, 1.0]:
        rx = side * 0.620
        # Curved arch top inner tub
        add_tube_to_bmesh(bm_tub, (rx, rear_y, 0.518), r_tub_r + 0.020, r_tub_r, r_tub_w, segments=24, axis='X')
        # Inner vertical closure wall against chassis frame rail
        add_box_to_bmesh(bm_tub, (side * 0.460, rear_y, 0.780), (0.020, 1.450, 0.560))
        
    finalize_bmesh_object(pan_obj, pan_mesh, bm)
    finalize_bmesh_object(tub_obj, tub_mesh, bm_tub)
    print("[VOLVO FH12 PHASE 1] Subsystem 16: Underbody belly pan & enclosed wheel tubs built.")
    return pan_obj


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 17: CHASSIS CROSSMEMBER GUSSETS & STRUCTURAL TIE PLATES
# ----------------------------------------------------------------------------
def build_chassis_crossmember_gussets_and_tie_plates(materials, parent=None):
    """
    Constructs the heavy structural chassis reinforcement hardware:
    - Triangular corner gusset plates stiffening frame rail joints
    - Transverse cross-tie tension rods preventing rail torsion
    - Grade-10.9 structural flange bolt arrays along frame flanges
    - Air brake and electrical conduit distribution brackets
    """
    gusset_obj, gusset_mesh, bm = create_bmesh_object("Chassis_Structural_Gussets", materials['Paint_ChassisDarkGrey'], parent)
    bolt_obj, bolt_mesh, bm_bolt = create_bmesh_object("Chassis_Flange_Bolts", materials['Iron_CastHeavy'], parent)
    
    top_z = 0.900
    bot_z = 0.600
    
    # 1. Triangular Crossmember Reinforcement Gussets
    cross_ys = [1.700, 0.600, -0.600, -2.200, -3.420]
    for cy in cross_ys:
        for side in [-1.0, 1.0]:
            gx = side * 0.380
            # Top flange corner gusset plate
            add_box_to_bmesh(bm, (gx, cy + 0.080, top_z - 0.015), (0.120, 0.160, 0.012),
                             rot_euler=(0.0, 0.0, side * math.radians(45.0)))
            # Bottom flange corner gusset plate
            add_box_to_bmesh(bm, (gx, cy + 0.080, bot_z + 0.015), (0.120, 0.160, 0.012),
                             rot_euler=(0.0, 0.0, side * math.radians(45.0)))
            # Heavy Grade-10.9 structural flange bolts
            for b_off in [-0.04, 0.04]:
                add_cylinder_to_bmesh(bm_bolt, (gx + b_off, cy + 0.080, top_z), 0.009, 0.022, segments=8, axis='Z')
                add_cylinder_to_bmesh(bm_bolt, (gx + b_off, cy + 0.080, bot_z), 0.009, 0.022, segments=8, axis='Z')
                
    # 2. Transverse Torsion Tie Rods Between Rails (Resisting lateral twist)
    for ty in [1.100, 0.0, -1.400, -2.750]:
        add_cylinder_to_bmesh(bm, (0.0, ty, 0.750), 0.018, 0.830, segments=12, axis='X')
        for side in [-1.0, 1.0]:
            add_box_to_bmesh(bm, (side * 0.410, ty, 0.750), (0.040, 0.080, 0.080))
            add_cylinder_to_bmesh(bm_bolt, (side * 0.430, ty, 0.750), 0.012, 0.020, segments=8, axis='X')
            
    # 3. Longitudinal Chassis Cable & Air Pipe Racks (Mounted inside left rail)
    add_box_to_bmesh(bm, (-0.395, -0.400, 0.740), (0.020, 3.800, 0.040))
    for ry in [-2.0, -1.2, -0.4, 0.4, 1.2]:
        add_box_to_bmesh(bm, (-0.395, ry, 0.740), (0.040, 0.030, 0.080))
        # Simulated bundled air and electrical lines
        add_cylinder_to_bmesh(bm_bolt, (-0.385, ry, 0.760), 0.012, 0.120, segments=8, axis='Y')
        add_cylinder_to_bmesh(bm_bolt, (-0.385, ry, 0.730), 0.010, 0.120, segments=8, axis='Y')
        
    finalize_bmesh_object(gusset_obj, gusset_mesh, bm)
    finalize_bmesh_object(bolt_obj, bolt_mesh, bm_bolt)
    print("[VOLVO FH12 PHASE 1] Subsystem 17: Chassis gussets & tie plates built.")
    return gusset_obj


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 18: FRONT CAB TILT HINGES & COOLING RADIATOR PACK
# ----------------------------------------------------------------------------
def build_front_cab_tilt_hinges_and_radiator(materials, parent=None):
    """
    Constructs the heavy forward cab tilt mechanism and cooling module:
    - Left and right cast steel cab forward tilt pivot hinges on chassis front
    - Torsion bar spring mechanism assisting 70-degree hydraulic cab tilt
    - Front high-capacity aluminum cooling radiator core, intercooler, and air conditioning condenser
    - Engine cooling fan shroud and hydraulic tilt cylinders
    
    Position: Y = +2.150 m to +2.380 m, Z = 0.850 m to 1.750 m
    """
    hinge_obj, hinge_mesh, bm = create_bmesh_object("Cab_Forward_Tilt_Hinges", materials['Iron_CastHeavy'], parent)
    rad_obj, rad_mesh, bm_rad = create_bmesh_object("Cooling_Radiator_Pack", materials['Plastic_AnthraciteComposite'], parent)
    
    tilt_y = 2.220
    tilt_z = 0.940
    
    # 1. Forward Cab Tilt Pivot Hinges (Left and Right)
    for side in [-1.0, 1.0]:
        hx = side * 0.425
        # Heavy cast steel pedestal bolted to front of chassis rail
        add_box_to_bmesh(bm, (hx, tilt_y, tilt_z), (0.110, 0.180, 0.160))
        # Transverse main cab pivot trunnion pin
        add_cylinder_to_bmesh(bm, (hx, tilt_y + 0.040, tilt_z + 0.040), 0.032, 0.160, segments=16, axis='X')
        # Cab-side swinging hinge arm
        add_box_to_bmesh(bm, (hx, tilt_y + 0.080, tilt_z + 0.120), (0.080, 0.140, 0.180))
        # Hydraulic cab tilt lifting cylinder (slanted back)
        add_cylinder_to_bmesh(bm, (hx - side * 0.040, tilt_y - 0.140, tilt_z + 0.020),
                             0.028, 0.320, segments=14, axis='Z',
                             rot_euler=(math.radians(18.0), 0.0, 0.0))
                             
    # Transverse Cab Tilt Torsion Bar Spring (Connecting left and right hinges)
    add_cylinder_to_bmesh(bm, (0.0, tilt_y + 0.040, tilt_z + 0.040), 0.022, 0.820, segments=16, axis='X')
    
    # 2. Complete Forward Cooling Module (Behind front grille)
    rad_y = 2.280
    rad_z = 1.240
    rad_w = 0.960
    rad_h = 0.780
    # Aluminum engine cooling radiator core
    add_box_to_bmesh(bm_rad, (0.0, rad_y, rad_z), (rad_w, 0.065, rad_h))
    # Turbocharged air-to-air charge intercooler core (mounted in front of radiator)
    add_box_to_bmesh(bm_rad, (0.0, rad_y + 0.065, rad_z), (rad_w * 0.96, 0.045, rad_h * 0.88))
    # Air conditioning refrigerant condenser core (front-most thin core)
    add_box_to_bmesh(bm_rad, (0.0, rad_y + 0.110, rad_z - 0.040), (rad_w * 0.92, 0.025, rad_h * 0.72))
    # Left and right vertical radiator header plastic tanks
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm_rad, (side * (rad_w * 0.5 - 0.030), rad_y, rad_z), 0.042, rad_h, segments=16, axis='Z')
        # Coolant radiator top hose connection
        if side == -1.0:
            add_cylinder_to_bmesh(bm_rad, (side * 0.38, rad_y - 0.060, rad_z + 0.32), 0.032, 0.140, segments=12, axis='Y')
            
    # Molded polymer fan shroud behind radiator
    add_box_to_bmesh(bm_rad, (0.0, rad_y - 0.070, rad_z), (rad_w * 0.94, 0.060, rad_h * 0.94))
    add_tube_to_bmesh(bm_rad, (0.0, rad_y - 0.110, rad_z), 0.340, 0.320, 0.080, segments=24, axis='Y')
    
    finalize_bmesh_object(hinge_obj, hinge_mesh, bm)
    finalize_bmesh_object(rad_obj, rad_mesh, bm_rad)
    print("[VOLVO FH12 PHASE 1] Subsystem 18: Cab tilt hinges & radiator pack built.")
    return hinge_obj


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 19: STEERING GEAR BOX, PITMAN ARM & DRAG LINKAGE
# ----------------------------------------------------------------------------
def build_steering_gear_box_and_drag_link(materials, parent=None):
    """
    Constructs the ZF/Volvo heavy hydraulic power steering gear box,
    recirculating ball assembly, drop pitman arm, longitudinal drag link,
    and transverse steering track rod connecting front kingpins.
    
    Position: Left frame rail at Y = +1.850 m, Z = 0.780 m
    """
    steer_obj, steer_mesh, bm = create_bmesh_object("Steering_Gear_and_Linkage", materials['Iron_CastHeavy'], parent)
    
    sg_x = -0.445  # Mounted outside left chassis frame rail
    sg_y = 1.840
    sg_z = 0.760
    
    # 1. Main Hydraulic Power Steering Gear Box
    # Heavy cast iron cylinder casing
    add_cylinder_to_bmesh(bm, (sg_x, sg_y, sg_z), 0.085, 0.280, segments=18, axis='Z')
    # Hydraulic control valve head casing on top
    add_cylinder_to_bmesh(bm, (sg_x, sg_y, sg_z + 0.160), 0.060, 0.120, segments=16, axis='Z')
    # Steering column input shaft connection (slanted back toward cab floor)
    add_cylinder_to_bmesh(bm, (sg_x, sg_y - 0.060, sg_z + 0.220), 0.024, 0.160, segments=12, axis='Z',
                         rot_euler=(math.radians(-25.0), 0.0, 0.0))
    # Frame mounting plate bolted with 4 heavy through-bolts
    add_box_to_bmesh(bm, (sg_x + 0.035, sg_y, sg_z), (0.025, 0.260, 0.260))
    for by_off in [-0.09, 0.09]:
        for bz_off in [-0.09, 0.09]:
            add_cylinder_to_bmesh(bm, (sg_x + 0.050, sg_y + by_off, sg_z + bz_off), 0.011, 0.030, segments=8, axis='X')
            
    # 2. Drop Pitman Arm (Connecting gear sector shaft to drag link)
    add_box_to_bmesh(bm, (sg_x - 0.030, sg_y, sg_z - 0.120), (0.040, 0.065, 0.180),
                     rot_euler=(math.radians(12.0), 0.0, 0.0))
    # Pitman arm ball joint socket
    add_cylinder_to_bmesh(bm, (sg_x - 0.030, sg_y + 0.035, sg_z - 0.200), 0.028, 0.045, segments=14, axis='X')
    
    # 3. Longitudinal Steering Drag Link (Connecting pitman arm to left kingpin steering arm)
    dl_start = Vector((sg_x - 0.030, sg_y + 0.035, sg_z - 0.200))
    dl_end = Vector((-0.920, 1.600, 0.518 + 0.060))
    dl_mid = (dl_start + dl_end) * 0.5
    dl_len = (dl_end - dl_start).length
    add_cylinder_to_bmesh(bm, dl_mid, 0.022, dl_len, segments=12, axis='Y',
                         rot_euler=(math.radians(-14.0), math.radians(24.0), 0.0))
    # Adjustable threaded tie-rod end ball joints with pinch clamps
    add_cylinder_to_bmesh(bm, dl_start, 0.030, 0.070, segments=12, axis='Y')
    add_cylinder_to_bmesh(bm, dl_end, 0.030, 0.070, segments=12, axis='Y')
    
    # 4. Transverse Steering Track Rod (Connecting left and right front wheel steering knuckles)
    add_cylinder_to_bmesh(bm, (0.0, 1.600 - 0.140, 0.440), 0.024, 1.720, segments=16, axis='X')
    for side in [-1.0, 1.0]:
        add_cylinder_to_bmesh(bm, (side * 0.860, 1.600 - 0.140, 0.440), 0.032, 0.090, segments=12, axis='X')
        
    finalize_bmesh_object(steer_obj, steer_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 19: Steering gear & drag link built.")
    return steer_obj


# ----------------------------------------------------------------------------
# 23. MASTER PHASE 1 BUILD AND EXPORT PIPELINE
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 20: BATTERY BOX ENCLOSURE & HIGH-CAPACITY CELLS
# ----------------------------------------------------------------------------
def build_ecm_and_battery_box_housing(materials, parent=None):
    """
    Constructs the chassis-mounted dual 12V 225Ah heavy commercial battery
    carrier box, heavy cast aluminum lid, external rotary safety isolator
    switch, starter cables, and EBS electronic control module brackets.
    
    Position: Right frame rail at Y = -0.850 m, Z = 0.650 m
    """
    bat_obj, bat_mesh, bm = create_bmesh_object("Battery_Box_Assembly", materials['Plastic_AnthraciteComposite'], parent)
    cell_obj, cell_mesh, bm_cell = create_bmesh_object("Battery_Cells_Internal", materials['Iron_CastHeavy'], parent)
    
    bx = 0.720  # Passenger side chassis rail
    by = -0.880
    bz = 0.660
    
    # 1. Main Pressed Steel Battery Carrier Enclosure Box
    add_box_to_bmesh(bm, (bx, by, bz), (0.540, 0.680, 0.380))
    # Cast aluminum protective cover lid with reinforcing stiffener ribs
    add_box_to_bmesh(bm, (bx, by, bz + 0.195), (0.560, 0.700, 0.040))
    for rx in [-0.18, 0.0, 0.18]:
        add_box_to_bmesh(bm, (bx + rx, by, bz + 0.220), (0.024, 0.660, 0.020))
    # Heavy rubber T-handle lid tie-down latches
    for ly_off in [-0.26, 0.26]:
        add_cylinder_to_bmesh(bm, (bx + 0.285, by + ly_off, bz + 0.160), 0.012, 0.090, segments=10, axis='Z')
        add_cylinder_to_bmesh(bm, (bx + 0.285, by + ly_off, bz + 0.110), 0.016, 0.035, segments=10, axis='Y')
        
    # 2. Internal 2x 12V 225Ah Heavy Duty Commercial Batteries
    for b_idx in [-0.14, 0.14]:
        add_box_to_bmesh(bm_cell, (bx, by + b_idx, bz + 0.020), (0.480, 0.260, 0.280))
        # Terminal lead posts (positive red and negative ground)
        add_cylinder_to_bmesh(bm_cell, (bx - 0.18, by + b_idx + 0.08, bz + 0.170), 0.014, 0.035, segments=12, axis='Z')
        add_cylinder_to_bmesh(bm_cell, (bx + 0.18, by + b_idx - 0.08, bz + 0.170), 0.014, 0.035, segments=12, axis='Z')
        # Heavy copper busbar linking batteries in 24V series circuit
        add_box_to_bmesh(bm_cell, (bx, by, bz + 0.180), (0.025, 0.220, 0.012))
        
    # 3. Red Exterior Rotary Master Power Battery Disconnect Switch (ADR compliance)
    add_cylinder_to_bmesh(bm, (bx + 0.290, by - 0.240, bz + 0.080), 0.040, 0.050, segments=16, axis='X')
    add_box_to_bmesh(bm, (bx + 0.315, by - 0.240, bz + 0.080), (0.020, 0.065, 0.025))
    
    finalize_bmesh_object(bat_obj, bat_mesh, bm)
    finalize_bmesh_object(cell_obj, cell_mesh, bm_cell)
    print("[VOLVO FH12 PHASE 1] Subsystem 20: Battery box & high-capacity cells built.")
    return bat_obj


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 21: COMPRESSED AIR STORAGE VESSELS & MANIFOLD VALVES
# ----------------------------------------------------------------------------
def build_compressed_air_storage_vessels_and_valves(materials, parent=None):
    """
    Constructs the 4x high-pressure aluminum compressed air storage vessels
    mounted inside and alongside chassis frame rails (30L service tanks),
    electronic air processing unit (APU) multi-circuit protection valves,
    and manual condensation moisture drain pull rings.
    
    Position: Chassis center from Y = +0.200 m to Y = -1.600 m
    """
    tank_obj, tank_mesh, bm = create_bmesh_object("Compressed_Air_Tanks", materials['Alloy_BrushedTankAluminum'], parent)
    valve_obj, valve_mesh, bm_valve = create_bmesh_object("Air_Brake_Valves", materials['Iron_CastHeavy'], parent)
    
    # 4 Compressed Air Vessels (2 inside frame rails, 2 stacked on left outer frame)
    # Tank Dimensions: Length = 0.820 m, Diameter = 0.240 m (Radius 0.120 m)
    tank_configs = [
        # Inside frame rails (center spine)
        (0.0, -0.450, 0.720, 'Y'),
        (0.0, -1.250, 0.720, 'Y'),
        # Outer left rail upper and lower stacked pair
        (-0.620, -0.250, 0.780, 'Y'),
        (-0.620, -0.250, 0.520, 'Y')
    ]
    
    for tx, ty, tz, axis_dir in tank_configs:
        # Cylindrical main vessel body
        add_cylinder_to_bmesh(bm, (tx, ty, tz), 0.120, 0.680, segments=24, axis=axis_dir)
        # Hemispherical deep-drawn domed end caps
        for cap_off in [-0.340, 0.340]:
            add_cylinder_to_bmesh(bm, (tx, ty + cap_off, tz), 0.116, 0.050, segments=24, axis=axis_dir)
            add_cone_to_bmesh(bm, (tx, ty + cap_off * 1.05, tz), 0.116, 0.030, 0.040, segments=24, axis=axis_dir)
        # Steel mounting strap saddles bolting to chassis crossmembers
        for str_off in [-0.220, 0.220]:
            add_tube_to_bmesh(bm, (tx, ty + str_off, tz), 0.128, 0.120, 0.035, segments=24, axis=axis_dir)
        # Bottom automatic condensation moisture drain valve with pull ring
        add_cylinder_to_bmesh(bm_valve, (tx, ty, tz - 0.125), 0.016, 0.035, segments=12, axis='Z')
        add_tube_to_bmesh(bm_valve, (tx, ty, tz - 0.155), 0.024, 0.016, 0.008, segments=12, axis='Y')
        
    # Knorr-Bremse Air Processing Unit (APU) 4-Circuit Protection Valve Block
    apu_x = -0.445
    apu_y = 0.380
    apu_z = 0.740
    add_box_to_bmesh(bm_valve, (apu_x, apu_y, apu_z), (0.160, 0.220, 0.180))
    # Regenerative desiccant air dryer screw-on spin-on cartridge
    add_cylinder_to_bmesh(bm_valve, (apu_x - 0.040, apu_y, apu_z + 0.160), 0.068, 0.220, segments=20, axis='Z')
    # Pressure relief silencer muffler venting under frame
    add_cylinder_to_bmesh(bm_valve, (apu_x, apu_y, apu_z - 0.120), 0.032, 0.080, segments=16, axis='Z')
    
    finalize_bmesh_object(tank_obj, tank_mesh, bm)
    finalize_bmesh_object(valve_obj, valve_mesh, bm_valve)
    print("[VOLVO FH12 PHASE 1] Subsystem 21: Compressed air storage vessels & valves built.")
    return tank_obj


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 22: EURO 4 ACOUSTIC SILENCER & SCR CATALYST EXHAUST
# ----------------------------------------------------------------------------
def build_exhaust_silencer_box_and_tailpipe(materials, parent=None):
    """
    Constructs the modern European under-chassis acoustic exhaust silencer,
    integrated SCR catalytic reduction converter box, and stainless steel
    downturned tailpipe exiting under the right chassis side fairing.
    
    Position: Right frame rail at Y = +0.150 m, Z = 0.620 m
    """
    exh_obj, exh_mesh, bm = create_bmesh_object("Exhaust_SCR_Silencer_Box", materials['Paint_ChassisDarkGrey'], parent)
    pipe_obj, pipe_mesh, bm_pipe = create_bmesh_object("Exhaust_Tailpipe_Stainless", materials['Stainless_PolishedInconel'], parent)
    
    ex_x = 0.640  # Right side behind cab entry steps
    ex_y = 0.180
    ex_z = 0.600
    
    # 1. Main Stainless Steel SCR Catalyst & Muffler Box
    add_box_to_bmesh(bm, (ex_x, ex_y, ex_z), (0.420, 0.880, 0.460))
    # Outer heat shield with perforated cooling mesh emboss
    add_box_to_bmesh(bm, (ex_x + 0.020, ex_y, ex_z), (0.430, 0.890, 0.470))
    # Heavy mounting brackets to chassis rail
    for my in [-0.32, 0.32]:
        add_box_to_bmesh(bm, (ex_x - 0.240, ex_y + my, ex_z), (0.120, 0.080, 0.220))
        
    # 2. Exhaust Inlet Pipe from Engine Turbocharger
    inlet_start = Vector((0.280, 0.950, 0.740))
    inlet_end = Vector((ex_x - 0.140, ex_y + 0.420, ex_z + 0.120))
    inlet_mid = (inlet_start + inlet_end) * 0.5
    inlet_len = (inlet_end - inlet_start).length
    add_cylinder_to_bmesh(bm_pipe, inlet_mid, 0.055, inlet_len, segments=18, axis='Y',
                         rot_euler=(math.radians(18.0), math.radians(-16.0), 0.0))
                         
    # 3. Downturned Stainless Steel Exhaust Tailpipe
    # Exits bottom rear of silencer box angled down and outward
    pipe_y = ex_y - 0.460
    add_cylinder_to_bmesh(bm_pipe, (ex_x - 0.060, pipe_y, ex_z - 0.180), 0.052, 0.260, segments=20, axis='Y')
    # 45-degree downturned nozzle tip directing hot exhaust away from tires and skirt
    add_cylinder_to_bmesh(bm_pipe, (ex_x - 0.060, pipe_y - 0.120, ex_z - 0.260), 0.052, 0.180, segments=20, axis='Z',
                         rot_euler=(math.radians(-38.0), math.radians(14.0), 0.0))
                         
    finalize_bmesh_object(exh_obj, exh_mesh, bm)
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm_pipe)
    print("[VOLVO FH12 PHASE 1] Subsystem 22: Exhaust silencer box & tailpipe built.")
    return exh_obj


# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 23: LOWER CAB ENTRY BOARDING STEP WELLS
# ----------------------------------------------------------------------------
def build_cab_lower_entry_step_wells(materials, parent=None):
    """
    Constructs the left and right 3-tier illuminated boarding step wells
    integrated into the lower cab side flanks behind the front wheels.
    Features serrated anti-slip aluminum treads, bottom flexible rubber step,
    courtesy lighting pockets, and door seal drainage scuppers.
    
    Position: X = +/- 1.200 m, Y = +1.240 m, Z = 0.550 m to 1.340 m
    """
    well_obj, well_mesh, bm = create_bmesh_object("Cab_Entry_Step_Wells", materials['Plastic_AnthraciteComposite'], parent)
    tread_obj, tread_mesh, bm_tread = create_bmesh_object("Step_Aluminum_Treads", materials['Alloy_AlcoaDuraBright'], parent)
    rubber_obj, rubber_mesh, bm_rubber = create_bmesh_object("Step_Rubber_Flex_Ring", materials['Rubber_EuropeanTire'], parent)
    
    step_y = 1.250
    step_w = 0.480
    
    for side in [-1.0, 1.0]:
        wx = side * 1.180
        # 1. Recessed Composite Step Well Alcove Pocket in Cab Flank
        add_box_to_bmesh(bm, (wx, step_y, 0.940), (0.240, step_w, 0.840))
        # Inner vertical back splash wall
        add_box_to_bmesh(bm, (wx - side * 0.110, step_y, 0.940), (0.025, step_w * 1.05, 0.860))
        
        # 2. Tier 1: Top Cab Door Entry Tread (Z = 1.280 m)
        add_box_to_bmesh(bm_tread, (wx, step_y, 1.280), (0.220, step_w * 0.92, 0.030))
        
        # 3. Tier 2: Middle Boarding Tread (Z = 1.020 m)
        add_box_to_bmesh(bm_tread, (wx + side * 0.030, step_y, 1.020), (0.220, step_w * 0.92, 0.030))
        
        # 4. Tier 3: Lower Fixed Tread (Z = 0.760 m)
        add_box_to_bmesh(bm_tread, (wx + side * 0.060, step_y, 0.760), (0.220, step_w * 0.92, 0.030))
        
        # 5. Tier 4: Bottom Flexible Rubber Loop Stirrup Step (Z = 0.520 m)
        # Prevents damage when negotiating high curbs or construction sites
        add_tube_to_bmesh(bm_rubber, (wx + side * 0.080, step_y, 0.540), 0.120, 0.095, 0.060, segments=18, axis='Y')
        add_box_to_bmesh(bm_tread, (wx + side * 0.080, step_y, 0.460), (0.160, step_w * 0.65, 0.024))
        
        # Serrated anti-slip diamond ridges on all aluminum treads
        for tz in [1.295, 1.035, 0.775]:
            for ry_off in [-0.14, -0.07, 0.0, 0.07, 0.14]:
                add_box_to_bmesh(bm_tread, (wx, step_y + ry_off, tz), (0.190, 0.014, 0.008))
                
    finalize_bmesh_object(well_obj, well_mesh, bm)
    finalize_bmesh_object(tread_obj, tread_mesh, bm_tread)
    finalize_bmesh_object(rubber_obj, rubber_mesh, bm_rubber)
    print("[VOLVO FH12 PHASE 1] Subsystem 23: Cab boarding step wells built.")
    return well_obj


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 24: CHASSIS PNEUMATIC BRAKE ACTUATORS & MODULATORS
# ----------------------------------------------------------------------------
def build_chassis_pneumatic_brake_chambers_and_valves(materials, parent=None):
    """
    Constructs the detailed commercial air brake system components:
    - Front type 24 service brake pneumatic diaphragms
    - Rear type 24/30 spring brake emergency parking chambers
    - Wabco Electronic Braking System (EBS) dual-channel axle modulators
    - Flexible high-pressure polyamide air lines with brass compression unions
    """
    brake_obj, brake_mesh, bm = create_bmesh_object("Chassis_Brake_Actuators", materials['Iron_CastHeavy'], parent)
    ebs_obj, ebs_mesh, bm_ebs = create_bmesh_object("EBS_Axle_Modulators", materials['Plastic_AnthraciteComposite'], parent)
    
    # 1. Front Axle Type 24 Service Air Diaphragms (Y = +1.600 m)
    for side in [-1.0, 1.0]:
        fx = side * 0.780
        # Actuator canister mounted on brake caliper anchor bracket
        add_cylinder_to_bmesh(bm, (fx, 1.480, 0.620), 0.078, 0.140, segments=18, axis='Y')
        add_cone_to_bmesh(bm, (fx, 1.560, 0.620), 0.078, 0.045, 0.050, segments=18, axis='Y')
        # Pushrod yoke linking chamber to caliper lever
        add_cylinder_to_bmesh(bm, (fx, 1.600, 0.620), 0.016, 0.090, segments=10, axis='Y')
        
    # 2. Rear Axle Type 24/30 Combination Spring Brake Chambers (Y = -2.200 m)
    for side in [-1.0, 1.0]:
        rx = side * 0.660
        # Double tandem cylinder housing heavy mechanical parking spring
        add_cylinder_to_bmesh(bm, (rx, -2.420, 0.580), 0.088, 0.280, segments=20, axis='Y')
        add_cylinder_to_bmesh(bm, (rx, -2.580, 0.580), 0.072, 0.080, segments=16, axis='Y')
        # Manual mechanical emergency cage bolt on rear dome
        add_cylinder_to_bmesh(bm, (rx, -2.630, 0.580), 0.012, 0.040, segments=8, axis='Y')
        
    # 3. Wabco Electronic Braking System (EBS) Axle Modulator Units
    # Central rear axle EBS dual-channel electro-pneumatic valve unit
    add_box_to_bmesh(bm_ebs, (0.0, -2.000, 0.780), (0.240, 0.220, 0.160))
    # 4 solenoid valve control heads
    for sx in [-0.08, 0.08]:
        for sy in [-0.06, 0.06]:
            add_cylinder_to_bmesh(bm_ebs, (sx, -2.000 + sy, 0.880), 0.022, 0.060, segments=12, axis='Z')
            
    finalize_bmesh_object(brake_obj, brake_mesh, bm)
    finalize_bmesh_object(ebs_obj, ebs_mesh, bm_ebs)
    print("[VOLVO FH12 PHASE 1] Subsystem 24: Brake actuators & EBS modulators built.")
    return brake_obj


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 25: 2-PIECE CARDAN DRIVESHAFT & CENTER SUPPORT BEARING
# ----------------------------------------------------------------------------
def build_cardan_heavy_driveshaft(materials, parent=None):
    """
    Constructs the heavy-duty commercial 2-piece tubular Cardan driveshaft
    transmitting 2,400 Nm torque from the I-Shift transmission output flange
    to the rear drive axle differential pinion.
    Includes intermediate chassis crossmember support bearing and Spicer universal joints.
    
    Span: Y = +0.180 m (Transmission) to Y = -2.020 m (Rear differential pinion) (2.200 m length)
    """
    ds_obj, ds_mesh, bm = create_bmesh_object("Cardan_Heavy_Driveshaft", materials['Iron_CastHeavy'], parent)
    
    # Driveshaft Geometry:
    # Transmission Output Flange: (0, +0.180, 0.520)
    # Center Support Bearing:      (0, -0.920, 0.518)
    # Rear Axle Differential Pinion: (0, -2.020, 0.518)
    
    # 1. Front Driveshaft Tube (Transmission to Center Support Bearing)
    p_trans = Vector((0.0, 0.180, 0.520))
    p_center = Vector((0.0, -0.920, 0.518))
    mid1 = (p_trans + p_center) * 0.5
    len1 = (p_center - p_trans).length
    add_cylinder_to_bmesh(bm, mid1, 0.065, len1 - 0.160, segments=20, axis='Y')
    
    # Transmission End Companion Flange & Spicer Universal Joint Cross
    add_cylinder_to_bmesh(bm, p_trans, 0.088, 0.040, segments=20, axis='Y')
    add_cylinder_to_bmesh(bm, p_trans - Vector((0, 0.05, 0)), 0.028, 0.110, segments=12, axis='X')
    add_cylinder_to_bmesh(bm, p_trans - Vector((0, 0.05, 0)), 0.028, 0.110, segments=12, axis='Z')
    
    # 2. Intermediate Center Support Carrier Bearing
    # Heavy rubber-isolated ball bearing carrier bolted to chassis crossmember
    add_tube_to_bmesh(bm, p_center, 0.110, 0.068, 0.090, segments=24, axis='Y')
    add_box_to_bmesh(bm, (0.0, p_center.y, 0.610), (0.240, 0.110, 0.120))
    
    # 3. Rear Driveshaft Tube with Splined Slip-Joint (Center to Rear Axle)
    p_rear = Vector((0.0, -2.020, 0.518))
    mid2 = (p_center + p_rear) * 0.5
    len2 = (p_rear - p_center).length
    add_cylinder_to_bmesh(bm, mid2, 0.065, len2 - 0.160, segments=20, axis='Y')
    
    # Splined Telescopic Slip-Joint Sleeve (Allowing suspension travel)
    add_tube_to_bmesh(bm, p_center - Vector((0, 0.16, 0)), 0.078, 0.065, 0.180, segments=20, axis='Y')
    
    # Rear Axle Input Flange & Universal Joint Cross
    add_cylinder_to_bmesh(bm, p_rear, 0.088, 0.040, segments=20, axis='Y')
    add_cylinder_to_bmesh(bm, p_rear + Vector((0, 0.05, 0)), 0.028, 0.110, segments=12, axis='X')
    add_cylinder_to_bmesh(bm, p_rear + Vector((0, 0.05, 0)), 0.028, 0.110, segments=12, axis='Z')
    
    finalize_bmesh_object(ds_obj, ds_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 25: Cardan heavy driveshaft built.")
    return ds_obj


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 26: CENTRAL AUTOMATIC CHASSIS LUBRICATION SYSTEM
# ----------------------------------------------------------------------------
def build_central_chassis_automatic_lubrication_pump(materials, parent=None):
    """
    Constructs the automated chassis greasing system (Lincoln Quicklub 24V):
    - Translucent cylindrical reservoir bowl with grease level indicator
    - Electric pump motor head and rotary stirrer paddle
    - Progressive progressive metering divider valve blocks on front and rear axles
    - High-pressure polyamide grease feeder lines to kingpins and fifth wheel
    
    Position: Left frame rail behind cab at Y = -0.150 m, Z = 0.820 m
    """
    lube_obj, lube_mesh, bm = create_bmesh_object("Chassis_AutoLube_System", materials['Plastic_AnthraciteComposite'], parent)
    bowl_obj, bowl_mesh, bm_bowl = create_bmesh_object("AutoLube_Grease_Reservoir", materials['Alloy_BrushedTankAluminum'], parent)
    
    lx = -0.445  # Mounted outside left chassis frame rail
    ly = -0.160
    lz = 0.820
    
    # 1. Main Cylindrical Grease Reservoir Bowl (2.0-liter capacity)
    add_cylinder_to_bmesh(bm_bowl, (lx - 0.050, ly, lz), 0.075, 0.220, segments=20, axis='Z')
    # Domed bottom with filling grease nipple
    add_cone_to_bmesh(bm_bowl, (lx - 0.050, ly, lz - 0.110), 0.075, 0.035, 0.040, segments=20, axis='Z')
    add_cylinder_to_bmesh(bm, (lx - 0.050, ly, lz - 0.135), 0.012, 0.025, segments=10, axis='Z')
    # Upper heavy die-cast aluminum pump head and electronic timer module
    add_cylinder_to_bmesh(bm, (lx - 0.050, ly, lz + 0.120), 0.082, 0.065, segments=20, axis='Z')
    add_box_to_bmesh(bm, (lx - 0.050, ly, lz + 0.160), (0.110, 0.120, 0.040))
    # Frame mounting bracket bolted to rail web
    add_box_to_bmesh(bm, (lx + 0.010, ly, lz), (0.024, 0.140, 0.260))
    add_cylinder_to_bmesh(bm, (lx + 0.025, ly - 0.050, lz + 0.080), 0.009, 0.020, segments=8, axis='X')
    add_cylinder_to_bmesh(bm, (lx + 0.025, ly + 0.050, lz - 0.080), 0.009, 0.020, segments=8, axis='X')
    
    # 2. Progressive Primary Metering Divider Block
    add_box_to_bmesh(bm, (lx - 0.020, ly + 0.120, lz - 0.040), (0.035, 0.085, 0.065))
    # 6 Outgoing high-pressure tube fittings
    for oz in [-0.02, 0.0, 0.02]:
        add_cylinder_to_bmesh(bm, (lx - 0.040, ly + 0.120, lz - 0.040 + oz), 0.008, 0.022, segments=8, axis='X')
        add_cylinder_to_bmesh(bm, (lx, ly + 0.120, lz - 0.040 + oz), 0.008, 0.022, segments=8, axis='X')
        
    finalize_bmesh_object(lube_obj, lube_mesh, bm)
    finalize_bmesh_object(bowl_obj, bowl_mesh, bm_bowl)
    print("[VOLVO FH12 PHASE 1] Subsystem 26: Central chassis autolube system built.")
    return lube_obj


# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 27: CHASSIS WHEEL CHOCKS & UNDERBODY TOOL CARRIER
# ----------------------------------------------------------------------------
def build_chassis_wheel_chocks_and_tool_carrier(materials, parent=None):
    """
    Constructs the ECE R100-compliant safety wheel chocks and tool carrier:
    - 2x Safety Yellow heavy ribbed commercial wheel chocks
    - Galvanized steel quick-release cradle brackets with spring retaining pins
    - Heavy lockable polyethylene under-chassis toolbox
    
    Position: Right frame rail at Y = -1.350 m, Z = 0.580 m
    """
    chock_obj, chock_mesh, bm_chock = create_bmesh_object("Safety_Wheel_Chocks", materials['Decal_ECE70Chevron'], parent)
    box_obj, box_mesh, bm_box = create_bmesh_object("Chassis_Tool_Carrier_Box", materials['Plastic_AnthraciteComposite'], parent)
    
    cx = 0.720
    cy = -1.380
    cz = 0.580
    
    # 1. 2x Safety Yellow Wedge-Profile Wheel Chocks
    for idx, y_off in enumerate([-0.18, 0.18]):
        # Curved wedge profile fitting 1.014 m tire radius
        add_box_to_bmesh(bm_chock, (cx, cy + y_off, cz), (0.220, 0.320, 0.180),
                         rot_euler=(0.0, math.radians(22.0), 0.0))
        # Ribbed grip base plate
        add_box_to_bmesh(bm_chock, (cx - 0.020, cy + y_off, cz - 0.080), (0.240, 0.340, 0.020))
        # Carrying handle eye
        add_cylinder_to_bmesh(bm_chock, (cx + 0.080, cy + y_off, cz + 0.090), 0.016, 0.140, segments=12, axis='Y')
        # Galvanized steel retaining bracket cradle
        add_box_to_bmesh(bm_box, (cx - 0.120, cy + y_off, cz), (0.040, 0.360, 0.220))
        # Quick-release spring linchpin
        add_cylinder_to_bmesh(bm_box, (cx + 0.120, cy + y_off, cz), 0.008, 0.260, segments=8, axis='X')
        
    # 2. Lockable Polyethylene Storage Toolbox (Left side forward of rear fender)
    tx = -0.740
    ty = -1.380
    tz = 0.580
    add_box_to_bmesh(bm_box, (tx, ty, tz), (0.420, 0.520, 0.380))
    # Front opening weather-sealed door lid with dual recessed stainless T-latches
    add_box_to_bmesh(bm_box, (tx - 0.215, ty, tz), (0.018, 0.540, 0.400))
    for ly in [-0.14, 0.14]:
        add_cylinder_to_bmesh(bm_box, (tx - 0.230, ty + ly, tz), 0.022, 0.025, segments=12, axis='X')
        add_box_to_bmesh(bm_box, (tx - 0.235, ty + ly, tz), (0.015, 0.045, 0.025))
        
    finalize_bmesh_object(chock_obj, chock_mesh, bm_chock)
    finalize_bmesh_object(box_obj, box_mesh, bm_box)
    print("[VOLVO FH12 PHASE 1] Subsystem 27: Wheel chocks & tool carrier built.")
    return chock_obj


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 28: FIFTH WHEEL PNEUMATIC UNLOCK CYLINDER & SENSORS
# ----------------------------------------------------------------------------
def build_fifth_wheel_air_actuated_locking_cylinder(materials, parent=None):
    """
    Constructs the pneumatic cab-controlled fifth-wheel remote unlock cylinder,
    optical kingpin proximity sensor, and throat safety latch lock indicator:
    - Linear pneumatic release cylinder mounted to fifth wheel slider plate
    - Protective rubber accordion dust bellows boot
    - Steel clevis fork connecting cylinder pushrod to fifth wheel release handle
    - Inductive proximity sensor wiring harness for in-cab dashboard display
    
    Position: Under fifth-wheel at Y = -2.050 m, Z = 1.080 m
    """
    cyl_obj, cyl_mesh, bm = create_bmesh_object("Fifth_Wheel_Air_Cylinder", materials['Iron_CastHeavy'], parent)
    
    fw_y = -2.050
    fw_z = 1.080
    
    # 1. Linear Pneumatic Release Cylinder Body (Mounted transversely)
    add_cylinder_to_bmesh(bm, (-0.220, fw_y + 0.060, fw_z), 0.042, 0.280, segments=18, axis='X')
    # Cylinder end caps with swivel trunnion mount
    add_cylinder_to_bmesh(bm, (-0.070, fw_y + 0.060, fw_z), 0.048, 0.040, segments=18, axis='X')
    add_cylinder_to_bmesh(bm, (-0.370, fw_y + 0.060, fw_z), 0.048, 0.040, segments=18, axis='X')
    # Cylinder mounting pivot bracket bolted to fifth wheel sub-frame
    add_box_to_bmesh(bm, (-0.050, fw_y + 0.060, fw_z), (0.040, 0.080, 0.090))
    
    # 2. Stainless Steel Piston Pushrod & Accordion Rubber Dust Boot
    add_cylinder_to_bmesh(bm, (-0.440, fw_y + 0.060, fw_z), 0.016, 0.160, segments=12, axis='X')
    add_cylinder_to_bmesh(bm, (-0.420, fw_y + 0.060, fw_z), 0.028, 0.080, segments=14, axis='X')
    # Clevis fork coupling to release lever
    add_box_to_bmesh(bm, (-0.520, fw_y + 0.060, fw_z), (0.045, 0.035, 0.050))
    add_cylinder_to_bmesh(bm, (-0.520, fw_y + 0.060, fw_z), 0.010, 0.045, segments=8, axis='Z')
    
    # 3. Inductive Kingpin Position Safety Sensors
    # Sensor housing in throat
    add_cylinder_to_bmesh(bm, (0.0, fw_y + 0.080, fw_z + 0.040), 0.018, 0.055, segments=12, axis='Z')
    # Armored electrical sensor conduit leading to chassis harness
    add_cylinder_to_bmesh(bm, (0.0, fw_y + 0.120, fw_z + 0.020), 0.010, 0.140, segments=8, axis='Y')
    
    finalize_bmesh_object(cyl_obj, cyl_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 28: Fifth wheel pneumatic unlock cylinder built.")
    return cyl_obj


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 29: REAR AXLE HEAVY ANTI-ROLL STABILIZER & DROP LINKS
# ----------------------------------------------------------------------------
def build_rear_axle_anti_roll_stabilizer_and_links(materials, parent=None):
    """
    Constructs the heavy rear axle anti-roll torsion bar (48 mm alloy steel):
    - Transverse torsion bar spanning behind the drive axle housing
    - Forged trailing lever arms extending forward to axle clamp saddles
    - Vertical drop links with polyurethane-insulated spherical bushings
    - Chassis pivot bearing brackets bolted to frame lower flange
    
    Drive Axle Center: Y = -2.200 m, Stabilizer Center: Y = -2.520 m, Z = 0.580 m
    """
    bar_obj, bar_mesh, bm = create_bmesh_object("Rear_AntiRoll_Stabilizer", materials['Iron_CastHeavy'], parent)
    
    bar_y = -2.520
    bar_z = 0.560
    
    # 1. Main Transverse Spring Steel Torsion Bar
    add_cylinder_to_bmesh(bm, (0.0, bar_y, bar_z), 0.024, 0.960, segments=18, axis='X')
    # Rubber pivot bushings in split chassis brackets
    for side in [-1.0, 1.0]:
        px = side * 0.425
        # Split clamp pillow block bearing housing
        add_tube_to_bmesh(bm, (px, bar_y, bar_z), 0.042, 0.024, 0.065, segments=16, axis='X')
        add_box_to_bmesh(bm, (px, bar_y, bar_z + 0.050), (0.080, 0.110, 0.080))
        # Grade-10.9 clamp bolts
        for by_off in [-0.035, 0.035]:
            add_cylinder_to_bmesh(bm, (px, bar_y + by_off, bar_z + 0.060), 0.009, 0.040, segments=8, axis='Z')
            
    # 2. Forged Forward Trailing Lever Arms (Left and Right)
    for side in [-1.0, 1.0]:
        ax = side * 0.510
        # Curved lever arm extending from transverse bar forward to drop link
        add_box_to_bmesh(bm, (ax, bar_y + 0.160, bar_z - 0.010), (0.038, 0.320, 0.050),
                         rot_euler=(math.radians(-6.0), 0.0, 0.0))
        # End eye boss for drop link ball pin
        add_cylinder_to_bmesh(bm, (ax, bar_y + 0.320, bar_z - 0.025), 0.032, 0.055, segments=14, axis='X')
        
        # 3. Vertical Drop Link to Axle Carrier Beam
        add_cylinder_to_bmesh(bm, (ax, bar_y + 0.320, bar_z + 0.070), 0.018, 0.190, segments=12, axis='Z')
        # Upper spherical ball joint attached to trailing suspension Z-arm
        add_cylinder_to_bmesh(bm, (ax, bar_y + 0.320, bar_z + 0.165), 0.030, 0.055, segments=14, axis='X')
        
    finalize_bmesh_object(bar_obj, bar_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 29: Rear anti-roll stabilizer built.")
    return bar_obj


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 30: MODULAR CHASSIS SKIRT SIDE MARKERS & CONSPICUITY TAPE
# ----------------------------------------------------------------------------
def build_modular_chassis_side_marker_brackets(materials, parent=None):
    """
    Constructs the ECE R48-compliant side marker lighting and reflex reflectors:
    - 4x Recessed amber LED side marker lamp pods integrated into side skirts
    - Micro-prismatic yellow retro-reflective contour marking tape along lower skirt
    - Chassis electrical junction boxes and wiring conduits
    
    Position: X = +/- 1.230 m, Y = +0.600 m to -1.400 m, Z = 0.620 m
    """
    marker_obj, marker_mesh, bm = create_bmesh_object("Chassis_Side_Markers_Amber", materials['Glass_AmberIndicator'], parent)
    glow_obj, glow_mesh, bm_glow = create_bmesh_object("Side_Markers_Glow", materials['Emissive_AmberSignal'], parent)
    tape_obj, tape_mesh, bm_tape = create_bmesh_object("Chassis_Reflex_Tape", materials['Decal_ECE70Chevron'], parent)
    
    # 4 Side Marker Lamp Stations per side along the wheelbase
    marker_ys = [0.650, 0.0, -0.700, -1.350]
    
    for side in [-1.0, 1.0]:
        mx = side * 1.232
        for my in marker_ys:
            # Polycarbonate amber lens housing recessed into side skirt panel
            add_box_to_bmesh(bm, (mx, my, 0.620), (0.012, 0.120, 0.040))
            # Internal high-intensity amber LED diode glow element
            add_cylinder_to_bmesh(bm_glow, (mx - side * 0.002, my, 0.620), 0.012, 0.008, segments=12, axis='X')
            # Black rubber mounting surround bezel gasket
            add_box_to_bmesh(bm, (mx - side * 0.006, my, 0.620), (0.010, 0.136, 0.054))
            
        # Continuous ECE 104 Yellow Retro-Reflective Contour Marking Stripe (50 mm height)
        # Spans along the lower edge of the aerodynamic skirt
        add_box_to_bmesh(bm_tape, (mx, -0.375, 0.440), (0.005, 2.320, 0.045))
        
    finalize_bmesh_object(marker_obj, marker_mesh, bm)
    finalize_bmesh_object(glow_obj, glow_mesh, bm_glow)
    finalize_bmesh_object(tape_obj, tape_mesh, bm_tape)
    print("[VOLVO FH12 PHASE 1] Subsystem 30: Chassis side markers & reflex tape built.")
    return marker_obj


# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 31: FIFTH WHEEL SLIDER RACK GUIDE FLANGES & PIN LOCKS
# ----------------------------------------------------------------------------
def build_chassis_fifth_wheel_lead_in_guide_plates_and_flanges(materials, parent=None):
    """
    Constructs the heavy structural guide flanges, sliding rack teeth, and
    pneumatic locking plunger pins for the adjustable Jost sliding fifth wheel:
    - Toothed rack guide rails bolted along chassis top flanges
    - Dual double-acting locking plunger pins engaging slider teeth
    - Heavy stop blocks preventing fifth wheel overrun
    - Grade-10.9 structural bolts and safety keeper pins
    
    Position: Y = -1.550 m to -2.550 m (1.000 m sliding travel range), Z = 0.920 m
    """
    rack_obj, rack_mesh, bm = create_bmesh_object("Fifth_Wheel_Slider_Racks", materials['Iron_CastHeavy'], parent)
    
    rack_y_mid = -2.050
    rack_len = 1.050
    
    for side in [-1.0, 1.0]:
        rx = side * 0.435
        # Main longitudinal slider base rail
        add_box_to_bmesh(bm, (rx, rack_y_mid, 0.925), (0.065, rack_len, 0.035))
        # Hardened steel locking tooth array (10 heavy locking notches per side)
        for t_idx in range(12):
            ty = rack_y_mid - 0.460 + t_idx * 0.084
            add_box_to_bmesh(bm, (rx + side * 0.025, ty, 0.940), (0.025, 0.045, 0.035))
            # Notch cavity
            add_box_to_bmesh(bm, (rx + side * 0.025, ty + 0.042, 0.940), (0.020, 0.035, 0.030))
            
        # Heavy forged front and rear slider stop limit blocks
        add_box_to_bmesh(bm, (rx, rack_y_mid + rack_len * 0.5 - 0.030, 0.960), (0.080, 0.070, 0.080))
        add_box_to_bmesh(bm, (rx, rack_y_mid - rack_len * 0.5 + 0.030, 0.960), (0.080, 0.070, 0.080))
        
        # Heavy through-bolts clamping rack to chassis rail flange
        for b_idx in range(8):
            by = rack_y_mid - 0.420 + b_idx * 0.120
            add_cylinder_to_bmesh(bm, (rx - side * 0.015, by, 0.925), 0.011, 0.045, segments=8, axis='Z')
            
    finalize_bmesh_object(rack_obj, rack_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 31: Fifth wheel slider rack & flanges built.")
    return rack_obj


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 32: UNDERBODY VORTEX GENERATORS & ACOUSTIC AIR DUCTS
# ----------------------------------------------------------------------------
def build_underbody_aerodynamic_vortex_generators_and_air_ducts(materials, parent=None):
    """
    Constructs the under-cab aerodynamic air management and acoustic baffles:
    - Radiator cooling air exit diffuser guides channeling air under cab floor
    - Front axle steering gear protective rock shields
    - Aerodynamic wheel wake vortex fins mounted forward of steer wheels
    - Chassis belly pan service access port covers with quick-release fasteners
    """
    duct_obj, duct_mesh, bm = create_bmesh_object("Aero_Underbody_Air_Ducts", materials['Plastic_AnthraciteComposite'], parent)
    
    # 1. Radiator Cooling Air Exit Diffuser Under Cab Floor
    add_box_to_bmesh(bm, (0.0, 1.850, 0.720), (0.920, 0.480, 0.024),
                     rot_euler=(math.radians(-16.0), 0.0, 0.0))
    # 3 Longitudinal Air Guide Strakes
    for dx in [-0.30, 0.0, 0.30]:
        add_box_to_bmesh(bm, (dx, 1.850, 0.690), (0.018, 0.460, 0.060),
                         rot_euler=(math.radians(-16.0), 0.0, 0.0))
                         
    # 2. Steering Gear & Engine Oil Pan Protective Heavy Stamped Rock Shield
    add_box_to_bmesh(bm, (-0.420, 1.620, 0.420), (0.280, 0.440, 0.035),
                     rot_euler=(math.radians(-8.0), math.radians(6.0), 0.0))
                     
    # 3. Aerodynamic Wheel Wake Deflector Fins (Mounted forward of front steer wheels)
    for side in [-1.0, 1.0]:
        wx = side * 1.050
        # Aerodynamic curved spats deflecting high-speed highway airflow away from tire face
        add_box_to_bmesh(bm, (wx, 1.950, 0.460), (0.035, 0.180, 0.260),
                         rot_euler=(0.0, 0.0, side * math.radians(-14.0)))
        add_cylinder_to_bmesh(bm, (wx, 1.950, 0.330), 0.018, 0.180, segments=12, axis='Y')
        
    # 4. Engine Belly Pan Removable Oil Service Access Hatch
    add_box_to_bmesh(bm, (0.0, 1.250, 0.305), (0.340, 0.340, 0.018))
    # 4 Quarter-turn Dzus quick-release fasteners
    for hx in [-0.14, 0.14]:
        for hy in [-0.14, 0.14]:
            add_cylinder_to_bmesh(bm, (hx, 1.250 + hy, 0.305), 0.010, 0.022, segments=8, axis='Z')
            
    finalize_bmesh_object(duct_obj, duct_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 32: Underbody vortex generators & air ducts built.")
    return duct_obj


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 33: FUEL PRIMARY FILTRATION & WATER SEPARATOR MODULE
# ----------------------------------------------------------------------------
def build_chassis_fuel_cooler_and_primary_filtration_module(materials, parent=None):
    """
    Constructs the heavy commercial chassis fuel supply processing unit:
    - Volvo primary fuel pre-filter cartridge with transparent sediment sight glass
    - Manual fuel system priming plunger pump on filter head casting
    - Electric fuel heater element for cold Scandinavian winter operation
    - Chassis return fuel air-to-liquid heat exchanger matrix with cooling fins
    
    Position: Left inner chassis rail at Y = +0.120 m, Z = 0.740 m
    """
    filter_obj, filter_mesh, bm = create_bmesh_object("Fuel_Filtration_Module", materials['Iron_CastHeavy'], parent)
    cooler_obj, cooler_mesh, bm_cooler = create_bmesh_object("Fuel_Cooler_Matrix", materials['Alloy_BrushedTankAluminum'], parent)
    
    fx = -0.380
    fy = 0.120
    fz = 0.740
    
    # 1. Primary Filter Head Die-Casting & Mounting Bracket
    add_box_to_bmesh(bm, (fx, fy, fz + 0.120), (0.085, 0.140, 0.090))
    # Manual rubber/steel hand priming pump button on top
    add_cylinder_to_bmesh(bm, (fx, fy, fz + 0.180), 0.026, 0.045, segments=16, axis='Z')
    # Filter canister spin-on housing
    add_cylinder_to_bmesh(bm, (fx, fy, fz), 0.058, 0.180, segments=20, axis='Z')
    # Bottom transparent sediment sight bowl
    add_cylinder_to_bmesh(bm, (fx, fy, fz - 0.110), 0.052, 0.060, segments=18, axis='Z')
    # Manual water drain thumb-screw petcock
    add_cylinder_to_bmesh(bm, (fx, fy, fz - 0.150), 0.012, 0.030, segments=10, axis='Z')
    add_box_to_bmesh(bm, (fx, fy, fz - 0.160), (0.032, 0.008, 0.012))
    
    # Fuel line banjo fittings & braided stainless flex lines
    add_cylinder_to_bmesh(bm, (fx + 0.035, fy - 0.040, fz + 0.120), 0.014, 0.035, segments=10, axis='X')
    add_cylinder_to_bmesh(bm, (fx + 0.035, fy + 0.040, fz + 0.120), 0.014, 0.035, segments=10, axis='X')
    
    # 2. Return Fuel Air-to-Liquid Cooler Radiator Matrix
    add_box_to_bmesh(bm_cooler, (fx + 0.020, fy - 0.220, fz), (0.045, 0.240, 0.180))
    # Cooling tube serpentine bends
    for py in [-0.28, -0.22, -0.16]:
        add_cylinder_to_bmesh(bm_cooler, (fx + 0.020, fy + py + 0.060, fz), 0.010, 0.160, segments=10, axis='Z')
        
    finalize_bmesh_object(filter_obj, filter_mesh, bm)
    finalize_bmesh_object(cooler_obj, cooler_mesh, bm_cooler)
    print("[VOLVO FH12 PHASE 1] Subsystem 33: Fuel filtration & cooler built.")
    return filter_obj


# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 34: FIFTH WHEEL DEDICATED LUBRICATION MANIFOLD
# ----------------------------------------------------------------------------
def build_chassis_fifth_wheel_grease_lines_and_manifold(materials, parent=None):
    """
    Constructs the high-pressure steel chassis grease routing lines and
    distribution block servicing the fifth-wheel trunnion bearings and lock jaw:
    - 4-way brass distribution junction block mounted to chassis crossmember
    - Braided stainless steel flexible jumper hoses allowing fifth-wheel articulation
    - Grease fittings on left and right pedestal pivot shafts
    
    Position: Y = -2.150 m, Z = 1.020 m
    """
    pipe_obj, pipe_mesh, bm = create_bmesh_object("Fifth_Wheel_Grease_Harness", materials['Iron_CastHeavy'], parent)
    
    fw_y = -2.100
    fw_z = 1.020
    
    # 1. Central 4-Way Brass Distribution Manifold Block
    add_box_to_bmesh(bm, (0.0, fw_y, fw_z), (0.055, 0.045, 0.035))
    add_cylinder_to_bmesh(bm, (0.0, fw_y, fw_z + 0.025), 0.008, 0.018, segments=8, axis='Z')
    
    # 2. Left and Right Articulation Grease Jumper Hoses
    for side in [-1.0, 1.0]:
        px = side * 0.360
        # Curved flexible hose from central block out to pedestal pivot pin
        add_cylinder_to_bmesh(bm, (side * 0.180, fw_y + 0.030, fw_z + 0.020), 0.008, 0.320, segments=8, axis='X')
        # Brass banjo fitting on pivot pedestal
        add_cylinder_to_bmesh(bm, (px, fw_y + 0.030, fw_z + 0.030), 0.014, 0.022, segments=10, axis='Z')
        add_cylinder_to_bmesh(bm, (px, fw_y + 0.030, fw_z + 0.045), 0.006, 0.012, segments=8, axis='Z')
        
    finalize_bmesh_object(pipe_obj, pipe_mesh, bm)
    print("[VOLVO FH12 PHASE 1] Subsystem 34: Fifth wheel grease lines built.")
    return pipe_obj

def build_volvo_fh12_phase1(materials=None, parent=None):
    """
    Executes the complete Phase 1 procedural Class-A CAD body sculpture build
    for the 2005 Volvo FH12 Globetrotter XL 4x2 tractor.
    """
    print("=============================================================================")
    print("EXECUTING PROCEDURAL VOLVO FH12 2ND GEN: PHASE 1 - EXTERIOR BODY SCULPTURE")
    print("=============================================================================")
    
    if parent is None:
        safe_reset_scene()
    if materials is None:
        materials = create_all_volvo_materials()
    
    root_obj = bpy.data.objects.new("Volvo_FH12_Phase1_Root", None)
    root_obj.empty_display_type = 'ARROWS'
    root_obj.empty_display_size = 1.0
    if parent:
        root_obj.parent = parent
    bpy.context.collection.objects.link(root_obj)
    
    # Construct Subsystems 1 through 19
    subsystems = [
        ("Chassis Frame", build_volvo_hydroformed_chassis_frame),
        ("Front Steer Suspension", build_front_air_suspension_and_steer_axle),
        ("Rear Drive Suspension", build_rear_drive_axle_and_ecas_air_suspension),
        ("6-Wheel Fleet", build_6_wheel_fleet),
        ("Jost Fifth Wheel", build_jost_fifth_wheel_assembly),
        ("Globetrotter XL Cab", build_aerodynamic_globetrotter_xl_cab_shell),
        ("3-Piece Bumper & FUPS", build_integrated_3piece_aerodynamic_bumper_and_fups),
        ("Aero Side Skirts & Tanks", build_chassis_aerodynamic_side_skirts_and_tanks),
        ("Cab Collar Wings", build_cab_rear_collar_side_deflectors),
        ("Rear Fenders & Flaps", build_3piece_rear_fenders_and_mudflaps),
        ("ECE R58 Underrun Bumper", build_ece_rear_underrun_bumper),
        ("Catwalk Deck & Steps", build_aluminum_catwalk_deck_and_steps),
        ("Engine Sump & Encapsulation", build_volvo_d12d_engine_sump_and_encapsulation),
        ("Trailer Approach Ramps", build_rear_chassis_approach_ramps),
        ("Front Mudflaps", build_front_axle_anti_spray_flaps),
        ("Underbody Belly Pan & Tubs", build_under_chassis_full_belly_pan_and_tubs),
        ("Chassis Gussets & Tie Plates", build_chassis_crossmember_gussets_and_tie_plates),
        ("Cab Tilt Hinges & Radiator", build_front_cab_tilt_hinges_and_radiator),
        ("Steering Gear & Linkage", build_steering_gear_box_and_drag_link),
        ("Battery Box & Cells", build_ecm_and_battery_box_housing),
        ("Air Tanks & Valves", build_compressed_air_storage_vessels_and_valves),
        ("Exhaust Silencer & SCR", build_exhaust_silencer_box_and_tailpipe),
        ("Cab Step Wells", build_cab_lower_entry_step_wells),
        ("Brake Actuators & EBS", build_chassis_pneumatic_brake_chambers_and_valves),
        ("Cardan Driveshaft", build_cardan_heavy_driveshaft),
        ("Chassis AutoLube", build_central_chassis_automatic_lubrication_pump),
        ("Wheel Chocks & Tool Box", build_chassis_wheel_chocks_and_tool_carrier),
        ("Fifth Wheel Air Cylinder", build_fifth_wheel_air_actuated_locking_cylinder),
        ("Rear AntiRoll Stabilizer", build_rear_axle_anti_roll_stabilizer_and_links),
        ("Chassis Skirt Markers", build_modular_chassis_side_marker_brackets),
        ("Fifth Wheel Slider Racks", build_chassis_fifth_wheel_lead_in_guide_plates_and_flanges),
        ("Underbody Air Ducts", build_underbody_aerodynamic_vortex_generators_and_air_ducts),
        ("Fuel Filter & Cooler", build_chassis_fuel_cooler_and_primary_filtration_module),
        ("Fifth Wheel Grease Lines", build_chassis_fifth_wheel_grease_lines_and_manifold),
    ]
    
    created_nodes = []
    for name, builder_func in subsystems:
        print(f"--> Building Subsystem: {name}...")
        sub_obj = builder_func(materials, parent=root_obj)
        if sub_obj:
            created_nodes.append(sub_obj)
            
    # Weld geometry, clear split normals, and apply weighted normal modifiers
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.mode_set(mode='EDIT')
            bm_edit = bmesh.from_edit_mesh(obj.data)
            bmesh.ops.remove_doubles(bm_edit, verts=bm_edit.verts, dist=0.0001)
            bmesh.ops.recalc_face_normals(bm_edit, faces=bm_edit.faces)
            bmesh.from_edit_mesh(obj.data)
            bpy.ops.object.mode_set(mode='OBJECT')
            if hasattr(bpy.ops.object, "shade_smooth_by_angle"):
                bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35.0))
            else:
                bpy.ops.object.shade_smooth()
            has_wn = any(m.type == 'WEIGHTED_NORMAL' for m in obj.modifiers)
            if not has_wn:
                wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
                wn.keep_sharp = True
            obj.select_set(False)
            
    print("=============================================================================")
    print(f"VOLVO FH12 PHASE 1 COMPLETE: {len(created_nodes)} core assembly groups built.")
    print("=============================================================================")
    return root_obj

build_volvo_fh12_phase1_chassis_and_body = build_volvo_fh12_phase1

if __name__ == '__main__':
    build_volvo_fh12_phase1()
