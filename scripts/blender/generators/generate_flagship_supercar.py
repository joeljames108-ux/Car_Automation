"""
==============================================================================
APEX SIMULATOR: FLAGSHIP MODULAR SUPERCAR ARCHITECTURE GENERATOR (BLENDER 5.2)
==============================================================================
Procedurally constructs an authentic, Class-A mid-engine Berlinetta Supercar
inspired by the Ferrari 296 GTB engineering architecture and proportions:
- Wheelbase: 2,600 mm (2.60 m)
- Overall Length: 4,565 mm (4.565 m)
- Overall Width: 1,960 mm (1.96 m)
- Overall Height: 1,185 mm (1.185 m)
- Front Track: 1,665 mm | Rear Track: 1,632 mm
- Ground Clearance: 110 mm (0.11 m)
- Mid-rear engine layout (120° V6 hybrid packaging envelope)
- Standardized VEHICLE_ROOT hierarchy with 12 discrete subsystem branches
- Standardized empty attachment points (ENGINE_MOUNT_MID, AERO, SUSPENSION)
- High-fidelity Principled BSDF PBR materials (Rosso Corsa, twill carbon, glass, LEDs)
- Dual-mode export: /public/assets/vehicles/vehicle_supercar.glb & preview
==============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# 1. SCENE SAFE RESET (ZERO MCP SOCKET DISCONNECT)
# ----------------------------------------------------------------------------
def safe_reset_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)

# ----------------------------------------------------------------------------
# 2. PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def set_pbr_socket(pbr, socket_names, value):
    for name in socket_names:
        if name in pbr.inputs:
            pbr.inputs[name].default_value = value
            return True
    return False

def build_pbr_materials():
    materials = {}

    def make_material(name):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        node_pbr = nodes.new(type="ShaderNodeBsdfPrincipled")
        node_out = nodes.new(type="ShaderNodeOutputMaterial")
        mat.node_tree.links.new(node_pbr.outputs["BSDF"], node_out.inputs["Surface"])
        return mat, node_pbr

    # 1. Rosso Corsa Metallic Clearcoat Body Paint
    mat_paint, pbr = make_material("Mat_Supercar_RossoPaint")
    set_pbr_socket(pbr, ["Base Color"], (0.84, 0.04, 0.06, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.90)
    set_pbr_socket(pbr, ["Roughness"], 0.12)
    set_pbr_socket(pbr, ["Coat Weight", "Clearcoat"], 1.0)
    set_pbr_socket(pbr, ["Coat Roughness", "Clearcoat Roughness"], 0.02)
    materials["paint"] = mat_paint

    # 2. Exposed 2x2 Twill High-Gloss Carbon Fiber
    mat_carbon, pbr = make_material("Mat_CarbonFiber_Twill")
    set_pbr_socket(pbr, ["Base Color"], (0.05, 0.05, 0.06, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.15)
    set_pbr_socket(pbr, ["Roughness"], 0.18)
    set_pbr_socket(pbr, ["Coat Weight", "Clearcoat"], 0.95)
    materials["carbon"] = mat_carbon

    # 3. Satin Technical Dark Trim / Grille Mesh
    mat_trim, pbr = make_material("Mat_SatinTrim_Dark")
    set_pbr_socket(pbr, ["Base Color"], (0.08, 0.09, 0.10, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.50)
    set_pbr_socket(pbr, ["Roughness"], 0.45)
    materials["trim"] = mat_trim

    # 4. Dielectric Automotive Acoustic Glass
    mat_glass, pbr = make_material("Mat_Dielectric_Glass")
    set_pbr_socket(pbr, ["Base Color"], (0.85, 0.90, 0.95, 1.0))
    set_pbr_socket(pbr, ["Roughness"], 0.02)
    set_pbr_socket(pbr, ["IOR"], 1.52)
    set_pbr_socket(pbr, ["Transmission Weight", "Transmission"], 0.94)
    mat_glass.blend_method = 'BLEND' if hasattr(mat_glass, 'blend_method') else 'OPAQUE'
    materials["glass"] = mat_glass

    # 5. LED Projector Daytime Running Light (White)
    mat_led_w, pbr = make_material("Mat_LED_White")
    set_pbr_socket(pbr, ["Base Color"], (1.0, 1.0, 1.0, 1.0))
    set_pbr_socket(pbr, ["Emission Color"], (1.0, 1.0, 1.0, 1.0))
    set_pbr_socket(pbr, ["Emission Strength"], 20.0)
    materials["led_white"] = mat_led_w

    # 6. OLED Rear Light Blade (Red)
    mat_led_r, pbr = make_material("Mat_LED_Red")
    set_pbr_socket(pbr, ["Base Color"], (1.0, 0.02, 0.03, 1.0))
    set_pbr_socket(pbr, ["Emission Color"], (1.0, 0.01, 0.02, 1.0))
    set_pbr_socket(pbr, ["Emission Strength"], 18.0)
    materials["led_red"] = mat_led_r

    # 7. Forged Diamond-Cut Lightweight Alloy Rims
    mat_alloy, pbr = make_material("Mat_ForgedAlloy")
    set_pbr_socket(pbr, ["Base Color"], (0.88, 0.89, 0.91, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.98)
    set_pbr_socket(pbr, ["Roughness"], 0.20)
    materials["alloy"] = mat_alloy

    # 8. High-Performance Semi-Slick Tire Rubber
    mat_rubber, pbr = make_material("Mat_TireRubber")
    set_pbr_socket(pbr, ["Base Color"], (0.025, 0.025, 0.028, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.0)
    set_pbr_socket(pbr, ["Roughness"], 0.85)
    materials["rubber"] = mat_rubber

    # 9. Carbon-Ceramic Ventilated Brake Rotor
    mat_rotor, pbr = make_material("Mat_CarbonCeramic_Brake")
    set_pbr_socket(pbr, ["Base Color"], (0.22, 0.23, 0.24, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.75)
    set_pbr_socket(pbr, ["Roughness"], 0.35)
    materials["rotor"] = mat_rotor

    # 10. Rosso Brembo Brake Caliper
    mat_caliper, pbr = make_material("Mat_Caliper_Red")
    set_pbr_socket(pbr, ["Base Color"], (0.90, 0.02, 0.03, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.30)
    set_pbr_socket(pbr, ["Roughness"], 0.25)
    materials["caliper"] = mat_caliper

    # 11. Titanium / Inconel Exhaust
    mat_exhaust, pbr = make_material("Mat_Inconel_Exhaust")
    set_pbr_socket(pbr, ["Base Color"], (0.55, 0.52, 0.50, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.95)
    set_pbr_socket(pbr, ["Roughness"], 0.28)
    materials["exhaust"] = mat_exhaust

    # 12. Dark Cockpit Interior Shell
    mat_interior, pbr = make_material("Mat_Cockpit_Interior")
    set_pbr_socket(pbr, ["Base Color"], (0.04, 0.04, 0.05, 1.0))
    set_pbr_socket(pbr, ["Metallic"], 0.10)
    set_pbr_socket(pbr, ["Roughness"], 0.75)
    materials["interior"] = mat_interior

    return materials

# ----------------------------------------------------------------------------
# 3. MESH CREATION & SMOOTHING UTILITIES
# ----------------------------------------------------------------------------
def create_mesh_object(name, bm, material=None, parent=None):
    me = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(me)
    bm.free()

    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)

    if material:
        obj.data.materials.append(material)

    if parent:
        obj.parent = parent

    # Weld vertices within 0.5mm
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Shade smooth by angle (35 degrees)
    for poly in me.polygons:
        poly.use_smooth = True
    if hasattr(me, "shade_smooth_by_angle"):
        me.shade_smooth_by_angle(math.radians(35))
    elif hasattr(me, "auto_smooth_angle"):
        me.auto_smooth_angle = math.radians(35)
        me.use_auto_smooth = True

    obj.select_set(False)
    return obj

def add_bevel_modifier(obj, width=0.003, segments=2):
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(40)
    mod.use_clamp_overlap = True

def add_weighted_normal(obj):
    mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    mod.keep_sharp = True

# ----------------------------------------------------------------------------
# 4. SUPERCAR PROCEDURAL COMPONENT BUILDERS
# ----------------------------------------------------------------------------

def build_chassis_monocoque(mats, parent):
    """Rigid central carbon monocoque tub and structural floor."""
    bm = bmesh.new()
    # Central tub: length from -1.4m to +1.2m, width 1.35m, height 0.38m
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((1.36, 2.50, 0.38)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector((0.0, -0.05, 0.28)), verts=bm.verts)
    
    # Rear aluminum engine cradle
    bm_rear = bmesh.new()
    bmesh.ops.create_cube(bm_rear, size=1.0)
    bmesh.ops.scale(bm_rear, vec=Vector((1.15, 1.45, 0.42)), verts=bm_rear.verts)
    bmesh.ops.translate(bm_rear, vec=Vector((0.0, -1.35, 0.32)), verts=bm_rear.verts)
    for v in bm_rear.verts:
        bm.verts.new(v.co)
    bm.verts.ensure_lookup_table()
    for f in bm_rear.faces:
        try:
            bm.faces.new([bm.verts[v.index] for v in f.verts])
        except ValueError:
            pass
    bm_rear.free()

    obj = create_mesh_object("CHASSIS_Monocoque", bm, mats["carbon"], parent)
    add_bevel_modifier(obj, width=0.004)
    add_weighted_normal(obj)
    return obj

def build_aerodynamic_underbody(mats, parent):
    """Full-length aerodynamic flat undertray with rear venturi diffuser strakes."""
    bm = bmesh.new()
    # Main flat floor at 110mm ground clearance
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((1.86, 4.30, 0.04)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector((0.0, 0.0, 0.11)), verts=bm.verts)

    # 4 Venturi diffuser strakes at rear (-1.5m to -2.25m, upswept)
    for strake_x in [-0.60, -0.22, 0.22, 0.60]:
        bm_s = bmesh.new()
        bmesh.ops.create_cube(bm_s, size=1.0)
        bmesh.ops.scale(bm_s, vec=Vector((0.025, 0.85, 0.16)), verts=bm_s.verts)
        bmesh.ops.translate(bm_s, vec=Vector((strake_x, -1.85, 0.18)), verts=bm_s.verts)
        for v in bm_s.verts:
            bm.verts.new(v.co)
        bm.verts.ensure_lookup_table()
        for f in bm_s.faces:
            try:
                bm.faces.new([bm.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_s.free()

    obj = create_mesh_object("UNDERBODY_Diffuser", bm, mats["carbon"], parent)
    add_bevel_modifier(obj, width=0.003)
    add_weighted_normal(obj)
    return obj

def build_front_clip_and_hood(mats, parent):
    """Sculpted front hood, nose cone, and lower tea-tray front splitter."""
    bm = bmesh.new()
    
    # Front Hood: raked downward toward +2.26m nose
    hood_sections = [
        # (Y, Z, Width, CrownHeight)
        (0.60, 0.76, 1.48, 0.04),
        (1.10, 0.72, 1.54, 0.05),
        (1.60, 0.64, 1.50, 0.05),
        (2.00, 0.52, 1.35, 0.04),
        (2.26, 0.38, 1.15, 0.02),
    ]
    
    for i in range(len(hood_sections) - 1):
        y0, z0, w0, c0 = hood_sections[i]
        y1, z1, w1, c1 = hood_sections[i+1]
        
        v0_l2 = bm.verts.new(Vector((-w0/2, y0, z0)))
        v0_l1 = bm.verts.new(Vector((-w0/4, y0, z0 + c0)))
        v0_c  = bm.verts.new(Vector((0.0, y0, z0 + c0*1.15)))
        v0_r1 = bm.verts.new(Vector((w0/4, y0, z0 + c0)))
        v0_r2 = bm.verts.new(Vector((w0/2, y0, z0)))

        v1_l2 = bm.verts.new(Vector((-w1/2, y1, z1)))
        v1_l1 = bm.verts.new(Vector((-w1/4, y1, z1 + c1)))
        v1_c  = bm.verts.new(Vector((0.0, y1, z1 + c1*1.15)))
        v1_r1 = bm.verts.new(Vector((w1/4, y1, z1 + c1)))
        v1_r2 = bm.verts.new(Vector((w1/2, y1, z1)))

        bm.faces.new([v0_l2, v1_l2, v1_l1, v0_l1])
        bm.faces.new([v0_l1, v1_l1, v1_c,  v0_c])
        bm.faces.new([v0_c,  v1_c,  v1_r1, v0_r1])
        bm.faces.new([v0_r1, v1_r1, v1_r2, v0_r2])

    obj_hood = create_mesh_object("BODY_Hood", bm, mats["paint"], parent)
    mod_solid = obj_hood.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod_solid.thickness = 0.003
    add_bevel_modifier(obj_hood, width=0.003)
    add_weighted_normal(obj_hood)

    # Front Splitter (Carbon fiber tea-tray)
    bm_sp = bmesh.new()
    bmesh.ops.create_cube(bm_sp, size=1.0)
    bmesh.ops.scale(bm_sp, vec=Vector((1.86, 0.48, 0.035)), verts=bm_sp.verts)
    bmesh.ops.translate(bm_sp, vec=Vector((0.0, 2.15, 0.125)), verts=bm_sp.verts)
    obj_sp = create_mesh_object("BODY_Front_Splitter", bm_sp, mats["carbon"], parent)
    add_bevel_modifier(obj_sp, width=0.004)
    add_weighted_normal(obj_sp)

    return obj_hood, obj_sp

def build_greenhouse_and_roof(mats, parent):
    """Low-slung teardrop cabin, raked windshield, and flying buttresses."""
    # Glass Canopy
    bm_g = bmesh.new()
    canopy_sections = [
        # (Y, Z, Width, ZTop)
        (0.65, 0.77, 1.44, 0.77),
        (0.20, 1.06, 1.25, 1.06),
        (-0.25, 1.185, 1.15, 1.185), # Peak at 1185mm
        (-0.75, 1.12, 1.08, 1.12),
        (-1.20, 0.90, 0.95, 0.90),
        (-1.60, 0.82, 0.88, 0.82),
    ]

    for i in range(len(canopy_sections) - 1):
        y0, z0, w0, _ = canopy_sections[i]
        y1, z1, w1, _ = canopy_sections[i+1]

        v0_l = bm_g.verts.new(Vector((-w0/2, y0, z0)))
        v0_c = bm_g.verts.new(Vector((0.0, y0, z0 + 0.02)))
        v0_r = bm_g.verts.new(Vector((w0/2, y0, z0)))

        v1_l = bm_g.verts.new(Vector((-w1/2, y1, z1)))
        v1_c = bm_g.verts.new(Vector((0.0, y1, z1 + 0.02)))
        v1_r = bm_g.verts.new(Vector((w1/2, y1, z1)))

        bm_g.faces.new([v0_l, v1_l, v1_c, v0_c])
        bm_g.faces.new([v0_c, v1_c, v1_r, v0_r])

    obj_glass = create_mesh_object("GLASS_Greenhouse", bm_g, mats["glass"], parent)
    mod_solid = obj_glass.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod_solid.thickness = 0.004
    add_weighted_normal(obj_glass)

    # Flying Buttresses & Painted Roof Cap
    bm_r = bmesh.new()
    bmesh.ops.create_cube(bm_r, size=1.0)
    bmesh.ops.scale(bm_r, vec=Vector((1.16, 0.72, 0.03)), verts=bm_r.verts)
    bmesh.ops.translate(bm_r, vec=Vector((0.0, -0.38, 1.18)), verts=bm_r.verts)

    for side in [-1, 1]:
        bm_b = bmesh.new()
        bmesh.ops.create_cube(bm_b, size=1.0)
        bmesh.ops.scale(bm_b, vec=Vector((0.09, 0.85, 0.22)), verts=bm_b.verts)
        bmesh.ops.translate(bm_b, vec=Vector((side * 0.58, -1.05, 0.98)), verts=bm_b.verts)
        bmesh.ops.rotate(bm_b, cent=Vector((side * 0.58, -1.05, 0.98)), matrix=Euler((math.radians(16), 0, 0)).to_matrix(), verts=bm_b.verts)
        for v in bm_b.verts:
            bm_r.verts.new(v.co)
        bm_r.verts.ensure_lookup_table()
        for f in bm_b.faces:
            try:
                bm_r.faces.new([bm_r.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_b.free()

    obj_roof = create_mesh_object("BODY_Roof_Buttresses", bm_r, mats["paint"], parent)
    add_bevel_modifier(obj_roof, width=0.003)
    add_weighted_normal(obj_roof)

    return obj_glass, obj_roof

def build_fenders_and_doors(mats, parent):
    """Muscular front wheel arches, sculpted doors, and wide rear quarter panels."""
    # Front Fenders (L & R)
    bm_f = bmesh.new()
    for side in [-1, 1]:
        bm_a = bmesh.new()
        bmesh.ops.create_cube(bm_a, size=1.0)
        bmesh.ops.scale(bm_a, vec=Vector((0.28, 1.25, 0.44)), verts=bm_a.verts)
        bmesh.ops.translate(bm_a, vec=Vector((side * 0.84, 1.30, 0.58)), verts=bm_a.verts)
        for v in bm_a.verts:
            bm_f.verts.new(v.co)
        bm_f.verts.ensure_lookup_table()
        for f in bm_a.faces:
            try:
                bm_f.faces.new([bm_f.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_a.free()

    obj_ff = create_mesh_object("BODY_Front_Fenders", bm_f, mats["paint"], parent)
    add_bevel_modifier(obj_ff, width=0.004)
    add_weighted_normal(obj_ff)

    # Doors with scalloped aerodynamic side intakes (L & R)
    bm_d = bmesh.new()
    for side in [-1, 1]:
        bm_door = bmesh.new()
        bmesh.ops.create_cube(bm_door, size=1.0)
        bmesh.ops.scale(bm_door, vec=Vector((0.24, 1.28, 0.52)), verts=bm_door.verts)
        bmesh.ops.translate(bm_door, vec=Vector((side * 0.86, 0.10, 0.56)), verts=bm_door.verts)
        for v in bm_door.verts:
            bm_d.verts.new(v.co)
        bm_d.verts.ensure_lookup_table()
        for f in bm_door.faces:
            try:
                bm_d.faces.new([bm_d.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_door.free()

    obj_doors = create_mesh_object("BODY_Doors", bm_d, mats["paint"], parent)
    add_bevel_modifier(obj_doors, width=0.004)
    add_weighted_normal(obj_doors)

    # Rear Quarter Haunches with High Intercooler Inlets (L & R)
    bm_rq = bmesh.new()
    for side in [-1, 1]:
        bm_q = bmesh.new()
        bmesh.ops.create_cube(bm_q, size=1.0)
        bmesh.ops.scale(bm_q, vec=Vector((0.34, 1.45, 0.56)), verts=bm_q.verts)
        bmesh.ops.translate(bm_q, vec=Vector((side * 0.88, -1.25, 0.62)), verts=bm_q.verts)
        for v in bm_q.verts:
            bm_rq.verts.new(v.co)
        bm_rq.verts.ensure_lookup_table()
        for f in bm_q.faces:
            try:
                bm_rq.faces.new([bm_rq.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_q.free()

    obj_rq = create_mesh_object("BODY_Rear_Quarters", bm_rq, mats["paint"], parent)
    add_bevel_modifier(obj_rq, width=0.004)
    add_weighted_normal(obj_rq)

    return obj_ff, obj_doors, obj_rq

def build_rear_fascia_and_exhaust(mats, parent):
    """Rear tail clip with central high-mounted exhaust and active spoiler slot."""
    bm_r = bmesh.new()
    bmesh.ops.create_cube(bm_r, size=1.0)
    bmesh.ops.scale(bm_r, vec=Vector((1.86, 0.52, 0.44)), verts=bm_r.verts)
    bmesh.ops.translate(bm_r, vec=Vector((0.0, -2.12, 0.54)), verts=bm_r.verts)
    obj_rb = create_mesh_object("BODY_Rear_Bumper", bm_r, mats["paint"], parent)
    add_bevel_modifier(obj_rb, width=0.003)
    add_weighted_normal(obj_rb)

    # High Central Dual Exhaust (Inconel tips)
    bm_ex = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cone(
            bm_ex,
            cap_ends=True,
            cap_tris=False,
            segments=24,
            radius1=0.065,
            radius2=0.065,
            depth=0.28,
            matrix=Matrix.Translation(Vector((side * 0.11, -2.26, 0.62))) @ Matrix.Rotation(math.radians(90), 4, 'X')
        )
    obj_ex = create_mesh_object("EXHAUST_Central_Dual", bm_ex, mats["exhaust"], parent)
    add_weighted_normal(obj_ex)

    return obj_rb, obj_ex

def build_lighting_assemblies(mats, parent):
    """Sleek Matrix LED headlights with DRL brows and full-width OLED rear light blade."""
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.24, 0.42, 0.06)), verts=bm_hl.verts)
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.72, 1.88, 0.64)), verts=bm_hl.verts)
    obj_hl = create_mesh_object("LIGHTING_Headlamps_LED", bm_hl, mats["led_white"], parent)
    add_bevel_modifier(obj_hl, width=0.002)

    bm_tl = bmesh.new()
    bmesh.ops.create_cube(bm_tl, size=1.0)
    bmesh.ops.scale(bm_tl, vec=Vector((1.72, 0.05, 0.045)), verts=bm_tl.verts)
    bmesh.ops.translate(bm_tl, vec=Vector((0.0, -2.24, 0.72)), verts=bm_tl.verts)
    obj_tl = create_mesh_object("LIGHTING_Taillight_Blade", bm_tl, mats["led_red"], parent)
    add_bevel_modifier(obj_tl, width=0.002)

    return obj_hl, obj_tl

def build_wheels_and_brakes(mats, parent):
    """4 Staggered forged alloy wheels (20" Front / 21" Rear) with carbon-ceramic brakes."""
    wheel_objects = []
    
    stations = [
        ("FL", 0.8325, 1.300, 0.340, 0.285, 0.265),
        ("FR", -0.8325, 1.300, 0.340, 0.285, 0.265),
        ("RL", 0.8160, -1.300, 0.355, 0.335, 0.280),
        ("RR", -0.8160, -1.300, 0.355, 0.335, 0.280),
    ]

    for code, x, y, r_outer, width, r_rim in stations:
        # Rubber Tire
        bm_t = bmesh.new()
        bmesh.ops.create_cone(
            bm_t,
            cap_ends=True,
            cap_tris=False,
            segments=32,
            radius1=r_outer,
            radius2=r_outer,
            depth=width,
            matrix=Matrix.Translation(Vector((x, y, r_outer))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        obj_tire = create_mesh_object(f"WHEEL_Tire_{code}", bm_t, mats["rubber"], parent)
        add_bevel_modifier(obj_tire, width=0.015, segments=3)
        add_weighted_normal(obj_tire)
        wheel_objects.append(obj_tire)

        # Forged Rim
        bm_r = bmesh.new()
        bmesh.ops.create_cone(
            bm_r,
            cap_ends=True,
            cap_tris=False,
            segments=32,
            radius1=r_rim,
            radius2=r_rim,
            depth=width * 0.92,
            matrix=Matrix.Translation(Vector((x, y, r_outer))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        obj_rim = create_mesh_object(f"WHEEL_Rim_{code}", bm_r, mats["alloy"], parent)
        add_bevel_modifier(obj_rim, width=0.004)
        add_weighted_normal(obj_rim)
        wheel_objects.append(obj_rim)

        # Carbon-Ceramic Rotor
        bm_b = bmesh.new()
        rotor_r = r_rim * 0.78
        rotor_x = x - (0.05 if x > 0 else -0.05)
        bmesh.ops.create_cone(
            bm_b,
            cap_ends=True,
            cap_tris=False,
            segments=28,
            radius1=rotor_r,
            radius2=rotor_r,
            depth=0.035,
            matrix=Matrix.Translation(Vector((rotor_x, y, r_outer))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        obj_rotor = create_mesh_object(f"BRAKE_Rotor_{code}", bm_b, mats["rotor"], parent)
        add_weighted_normal(obj_rotor)
        wheel_objects.append(obj_rotor)

        # Brembo Caliper
        bm_c = bmesh.new()
        caliper_z = r_outer + rotor_r * 0.65
        caliper_y = y + 0.05
        bmesh.ops.create_cube(bm_c, size=1.0)
        bmesh.ops.scale(bm_c, vec=Vector((0.08, 0.22, 0.12)), verts=bm_c.verts)
        bmesh.ops.translate(bm_c, vec=Vector((rotor_x, caliper_y, caliper_z)), verts=bm_c.verts)
        obj_caliper = create_mesh_object(f"BRAKE_Caliper_{code}", bm_c, mats["caliper"], parent)
        add_bevel_modifier(obj_caliper, width=0.003)
        add_weighted_normal(obj_caliper)
        wheel_objects.append(obj_caliper)

    return wheel_objects

def build_suspension_geometry(mats, parent):
    """Front and Rear Double Wishbone aluminum suspension links and coilovers."""
    bm_s = bmesh.new()
    
    corners = [
        ("FL", 0.8325, 1.300, 0.340),
        ("FR", -0.8325, 1.300, 0.340),
        ("RL", 0.8160, -1.300, 0.355),
        ("RR", -0.8160, -1.300, 0.355),
    ]

    for code, wx, wy, wz in corners:
        cx = 0.50 if wx > 0 else -0.50
        bm_w = bmesh.new()
        bmesh.ops.create_cube(bm_w, size=1.0)
        bmesh.ops.scale(bm_w, vec=Vector((abs(wx - cx), 0.24, 0.035)), verts=bm_w.verts)
        bmesh.ops.translate(bm_w, vec=Vector(((wx + cx)/2, wy, wz - 0.12)), verts=bm_w.verts)
        for v in bm_w.verts:
            bm_s.verts.new(v.co)
        bm_s.verts.ensure_lookup_table()
        for f in bm_w.faces:
            try:
                bm_s.faces.new([bm_s.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_w.free()

        bmesh.ops.create_cone(
            bm_s,
            cap_ends=True,
            cap_tris=False,
            segments=16,
            radius1=0.045,
            radius2=0.045,
            depth=0.28,
            matrix=Matrix.Translation(Vector(((wx*0.7 + cx*0.3), wy, wz + 0.08))) @ Matrix.Rotation(math.radians(18 * (1 if wx>0 else -1)), 4, 'Y')
        )

    obj_susp = create_mesh_object("SUSPENSION_Double_Wishbone", bm_s, mats["trim"], parent)
    add_weighted_normal(obj_susp)
    return obj_susp

def build_engine_bay_and_cabin(mats, parent):
    """Mid-engine bay envelope (120° V6 turbo hybrid) and placeholder cabin tub."""
    # 1. Engine Bay Cradle & Intake Plenum
    bm_e = bmesh.new()
    bmesh.ops.create_cube(bm_e, size=1.0)
    bmesh.ops.scale(bm_e, vec=Vector((0.85, 0.95, 0.48)), verts=bm_e.verts)
    bmesh.ops.translate(bm_e, vec=Vector((0.0, -0.92, 0.48)), verts=bm_e.verts)
    obj_eb = create_mesh_object("ENGINE_BAY_V6_Hybrid", bm_e, mats["trim"], parent)
    add_bevel_modifier(obj_eb, width=0.005)
    add_weighted_normal(obj_eb)

    # 2. Placeholder Cockpit Shell (Dark interior)
    bm_c = bmesh.new()
    bmesh.ops.create_cube(bm_c, size=1.0)
    bmesh.ops.scale(bm_c, vec=Vector((1.18, 1.35, 0.62)), verts=bm_c.verts)
    bmesh.ops.translate(bm_c, vec=Vector((0.0, 0.05, 0.62)), verts=bm_c.verts)
    obj_cab = create_mesh_object("CABIN_Interior_Cell", bm_c, mats["interior"], parent)
    add_weighted_normal(obj_cab)

    return obj_eb, obj_cab

# ----------------------------------------------------------------------------
# 5. STANDARDIZED ATTACHMENT POINTS (EMPTY OBJECTS)
# ----------------------------------------------------------------------------
def create_attachment_points(parent):
    """
    Spawns standardized Empty objects representing precision CAD hardpoints
    for downstream powertrain, suspension, and aerodynamic kit snapping.
    """
    empties = [
        ("ENGINE_MOUNT_MID", (0.0, -0.92, 0.35)),
        ("TRANSMISSION_MOUNT", (0.0, -1.45, 0.28)),
        ("FRONT_SUSPENSION_L", (0.50, 1.30, 0.28)),
        ("FRONT_SUSPENSION_R", (-0.50, 1.30, 0.28)),
        ("REAR_SUSPENSION_L", (0.48, -1.30, 0.28)),
        ("REAR_SUSPENSION_R", (-0.48, -1.30, 0.28)),
        ("FRONT_WHEEL_L", (0.8325, 1.300, 0.340)),
        ("FRONT_WHEEL_R", (-0.8325, 1.300, 0.340)),
        ("REAR_WHEEL_L", (0.8160, -1.300, 0.355)),
        ("REAR_WHEEL_R", (-0.8160, -1.300, 0.355)),
        ("RADIATOR_MOUNT_L", (0.45, 1.85, 0.32)),
        ("RADIATOR_MOUNT_R", (-0.45, 1.85, 0.32)),
        ("INTERCOOLER_MOUNT_L", (0.78, -0.85, 0.45)),
        ("INTERCOOLER_MOUNT_R", (-0.78, -0.85, 0.45)),
        ("EXHAUST_MOUNT", (0.0, -2.15, 0.62)),
        ("FRONT_SPLITTER_MOUNT", (0.0, 2.15, 0.12)),
        ("REAR_WING_MOUNT", (0.0, -2.05, 0.85)),
        ("SIDE_SKIRT_MOUNT_L", (0.92, 0.0, 0.14)),
        ("SIDE_SKIRT_MOUNT_R", (-0.92, 0.0, 0.14)),
        ("DIFFUSER_MOUNT", (0.0, -1.95, 0.15)),
    ]

    empty_objects = []
    for name, pos in empties:
        emp = bpy.data.objects.new(name, None)
        emp.empty_display_type = 'ARROWS'
        emp.empty_display_size = 0.12
        emp.location = Vector(pos)
        emp.parent = parent
        bpy.context.collection.objects.link(emp)
        empty_objects.append(emp)

    return empty_objects

# ----------------------------------------------------------------------------
# 6. MASTER BUILD & DUAL-MODE GLB EXPORT
# ----------------------------------------------------------------------------
def build_and_export_supercar(output_glb_path, preview_glb_path=None, legacy_glb_path=None):
    print("[SUPERCAR_GENERATOR] Starting Class-A Supercar generation...")
    safe_reset_scene()

    mats = build_pbr_materials()

    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    root.empty_display_type = 'PLAIN_AXES'
    root.empty_display_size = 0.5
    bpy.context.collection.objects.link(root)

    build_chassis_monocoque(mats, root)
    build_aerodynamic_underbody(mats, root)
    build_front_clip_and_hood(mats, root)
    build_greenhouse_and_roof(mats, root)
    build_fenders_and_doors(mats, root)
    build_rear_fascia_and_exhaust(mats, root)
    build_lighting_assemblies(mats, root)
    build_wheels_and_brakes(mats, root)
    build_suspension_geometry(mats, root)
    build_engine_bay_and_cabin(mats, root)

    create_attachment_points(root)

    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)

    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.data.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root

    print(f"[SUPERCAR_GENERATOR] Exporting unified GLB to {output_glb_path}...")
    bpy.ops.export_scene.gltf(
        filepath=output_glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
    )
    print(f"[SUPERCAR_GENERATOR] Successfully created {output_glb_path} ({os.path.getsize(output_glb_path)} bytes)")

    if legacy_glb_path:
        os.makedirs(os.path.dirname(legacy_glb_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=legacy_glb_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[SUPERCAR_GENERATOR] Overwrote legacy model at {legacy_glb_path} ({os.path.getsize(legacy_glb_path)} bytes)")

    if preview_glb_path:
        os.makedirs(os.path.dirname(preview_glb_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=preview_glb_path,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[SUPERCAR_GENERATOR] Exported preview GLB to {preview_glb_path}")

    return output_glb_path

if __name__ == "__main__":
    out_path = r"E:\Car_Automation\public\assets\vehicles\vehicle_supercar.glb"
    preview_path = r"E:\Car_Automation\public\assets\vehicles\preview_supercar.glb"
    legacy_path = r"E:\Car_Automation\public\models\Car_GT3_Supercar_Complete.glb"
    build_and_export_supercar(out_path, preview_path, legacy_path)
