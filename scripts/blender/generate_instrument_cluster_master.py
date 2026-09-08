"""
==============================================================================
AUTOMOTIVE INSTRUMENT CLUSTER MASTER CAD GENERATOR (BLENDER 5.2 LTS)
==============================================================================
Generates a Class-A 3D Instrument Cluster matching "UNDERSTANDING YOUR DASHBOARD":
- Molded binnacle housing with anti-glare hooded cowl
- Recessed chrome dial bezels for Speedometer, Tachometer & 4 Auxiliary Gauges
- 6 Independent 3D needles with precise center pivots for rotation
- Central digital driver information display (MID)
- 24 Addressable telltale warning lights with emissive PBR shaders
- Curved anti-reflective polycarbonate cluster lens
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[CLUSTER_CAD] {msg}")

def reset_scene_clean():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def set_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.52, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")

    set_socket(bsdf, ["Base Color"], base_color)
    set_socket(bsdf, ["Metallic"], metallic)
    set_socket(bsdf, ["Roughness"], roughness)

    if clearcoat > 0:
        set_socket(bsdf, ["Coat Weight", "Clearcoat"], clearcoat)
        set_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.03)

    if transmission > 0:
        set_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_socket(bsdf, ["IOR"], ior)
        mat.blend_method = 'BLEND'

    if alpha < 1.0:
        set_socket(bsdf, ["Alpha"], alpha)
        mat.blend_method = 'BLEND'

    if emission:
        set_socket(bsdf, ["Emission Color", "Emission"], emission)
        set_socket(bsdf, ["Emission Strength"], emission_strength)

    return mat

def make_textured_emissive_mat(name, img_path, default_color=(1.0, 1.0, 1.0, 1.0), roughness=0.2, emission_strength=6.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    set_socket(bsdf, ["Base Color"], default_color)
    set_socket(bsdf, ["Roughness"], roughness)

    if os.path.exists(img_path):
        tex_node = tree.nodes.new(type="ShaderNodeTexImage")
        tex_node.location = (-400, 0)
        img = bpy.data.images.load(img_path, check_existing=True)
        tex_node.image = img
        tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
        if "Emission Color" in bsdf.inputs:
            tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Emission Color"])
        elif "Emission" in bsdf.inputs:
            tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Emission"])
        set_socket(bsdf, ["Emission Strength"], emission_strength)
        mat.blend_method = 'BLEND'

    return mat

def assign_mat(obj, mat):
    if not obj or not mat:
        return
    if len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat

def create_mesh_obj(name, verts, faces, mat=None, collection=None):
    me = bpy.data.meshes.new(name + "_Mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    if not collection:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def make_box(name, center, size, mat=None, collection=None):
    cx, cy, cz = center
    sx, sy, sz = size[0]/2, size[1]/2, size[2]/2
    verts = [
        (cx - sx, cy - sy, cz - sz),
        (cx + sx, cy - sy, cz - sz),
        (cx + sx, cy + sy, cz - sz),
        (cx - sx, cy + sy, cz - sz),
        (cx - sx, cy - sy, cz + sz),
        (cx + sx, cy - sy, cz + sz),
        (cx + sx, cy + sy, cz + sz),
        (cx - sx, cy + sy, cz + sz)
    ]
    faces = [
        (0, 1, 2, 3), (4, 5, 6, 7),
        (0, 1, 5, 4), (2, 3, 7, 6),
        (0, 3, 7, 4), (1, 2, 6, 5)
    ]
    return create_mesh_obj(name, verts, faces, mat, collection)

def make_cylinder(name, center, radius, depth, segments=32, axis='Z', mat=None, collection=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=segments,
        radius=radius,
        depth=depth,
        location=center
    )
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'Y':
        obj.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
    elif axis == 'X':
        obj.rotation_euler = Euler((0, math.radians(90), 0), 'XYZ')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if mat:
        assign_mat(obj, mat)
    return obj

def make_ring_bezel(name, center, r_inner, r_outer, depth=0.015, segments=48, mat=None, collection=None):
    cx, cy, cz = center
    verts = []
    faces = []
    for i in range(segments):
        th = 2.0 * math.pi * i / segments
        c = math.cos(th)
        s = math.sin(th)
        # Front inner
        verts.append((cx + r_inner * c, cy - depth/2, cz + r_inner * s))
        # Front outer
        verts.append((cx + r_outer * c, cy - depth/2, cz + r_outer * s))
        # Back inner
        verts.append((cx + r_inner * c, cy + depth/2, cz + r_inner * s))
        # Back outer
        verts.append((cx + r_outer * c, cy + depth/2, cz + r_outer * s))

    for i in range(segments):
        i0 = i * 4
        i1 = ((i + 1) % segments) * 4
        # Front face
        faces.append((i0 + 0, i0 + 1, i1 + 1, i1 + 0))
        # Outer rim
        faces.append((i0 + 1, i0 + 3, i1 + 3, i1 + 1))
        # Back face
        faces.append((i0 + 3, i0 + 2, i1 + 2, i1 + 3))
        # Inner rim
        faces.append((i0 + 2, i0 + 0, i1 + 0, i1 + 2))

    return create_mesh_obj(name, verts, faces, mat, collection)

def make_needle(name, pivot, length, width_base=0.006, width_tip=0.0015, mat=None, collection=None):
    """
    Creates an authentic glowing 3D needle with origin at its pivot point.
    Needle points towards +Z (12 o'clock) at rest so rotation along Y changes angle.
    """
    px, py, pz = pivot
    th = 0.003 # needle thickness

    # Vertices relative to pivot (0, 0, 0)
    verts = [
        (-width_base/2, 0, -0.015), # Tail Left
        (width_base/2,  0, -0.015), # Tail Right
        (width_base/2,  0, 0.010),  # Hub Right
        (width_tip/2,   0, length), # Tip Right
        (-width_tip/2,  0, length), # Tip Left
        (-width_base/2, 0, 0.010),  # Hub Left
        # Depth offset (back face)
        (-width_base/2, th, -0.015),
        (width_base/2,  th, -0.015),
        (width_base/2,  th, 0.010),
        (width_tip/2,   th, length),
        (-width_tip/2,  th, length),
        (-width_base/2, th, 0.010),
    ]
    faces = [
        (0, 1, 2, 5), (5, 2, 3, 4), # Front
        (6, 11, 8, 7), (11, 10, 9, 8), # Back
        (0, 6, 7, 1), (1, 7, 8, 2), (2, 8, 9, 3), # Sides
        (3, 9, 10, 4), (4, 10, 11, 5), (5, 11, 6, 0)
    ]
    me = bpy.data.meshes.new(name + "_Mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    obj.location = pivot
    if not collection:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def make_telltale_quad(name, center, size, mat=None, collection=None):
    cx, cy, cz = center
    sx, sz = size[0]/2, size[1]/2
    # Vertices facing -Y (towards driver)
    verts = [
        (cx - sx, cy, cz - sz),
        (cx + sx, cy, cz - sz),
        (cx + sx, cy, cz + sz),
        (cx - sx, cy, cz + sz),
    ]
    faces = [(0, 1, 2, 3)]
    me = bpy.data.meshes.new(name + "_Mesh")
    me.from_pydata(verts, [], faces)

    # UV unwrap 0-1
    uv_layer = me.uv_layers.new(name="UVMap")
    uvs = [(0, 0), (1, 0), (1, 1), (0, 1)]
    for poly in me.polygons:
        for loop_idx, vert_idx in enumerate(poly.vertices):
            uv_layer.data[poly.loop_start + loop_idx].uv = uvs[loop_idx]

    me.update()
    obj = bpy.data.objects.new(name, me)
    if not collection:
        collection = bpy.context.scene.collection
    collection.objects.link(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def build_instrument_cluster():
    reset_scene_clean()
    log("Building 3D Automotive Instrument Cluster Master CAD...")

    tex_dir = os.path.abspath("public/models/interior/textures/cluster")

    # Materials
    mat_abs_black = make_pbr_mat("Mat_Cluster_Housing", (0.02, 0.022, 0.026, 1.0), roughness=0.6)
    mat_cowl_matte = make_pbr_mat("Mat_Cluster_Cowl", (0.015, 0.016, 0.018, 1.0), roughness=0.7)
    mat_chrome = make_pbr_mat("Mat_Cluster_Chrome", (0.95, 0.96, 0.98, 1.0), metallic=1.0, roughness=0.03, clearcoat=1.0)
    mat_needle_red = make_pbr_mat("Mat_Cluster_Needle_Red", (1.0, 0.05, 0.05, 1.0), emission=(1.0, 0.05, 0.05, 1.0), emission_strength=12.0)
    mat_needle_cap = make_pbr_mat("Mat_Cluster_Needle_Cap", (0.05, 0.05, 0.06, 1.0), metallic=0.8, roughness=0.15)
    mat_glass = make_pbr_mat("Mat_Cluster_Glass", (0.95, 0.98, 1.0, 0.25), roughness=0.02, transmission=0.92, ior=1.52, alpha=0.3)

    # Master Faceplate Material
    mat_dials = make_textured_emissive_mat(
        "Mat_Cluster_DialsFace",
        os.path.join(tex_dir, "cluster_analog_dials_face.png"),
        roughness=0.3,
        emission_strength=1.5
    )

    # Digital MID Material
    mat_mid = make_textured_emissive_mat(
        "Mat_Cluster_DigitalMID",
        os.path.join(tex_dir, "cluster_digital_mid.png"),
        roughness=0.1,
        emission_strength=2.2
    )

    # Root Collection
    cluster_root = bpy.data.objects.new("INSTRUMENT_CLUSTER_ROOT", None)
    bpy.context.scene.collection.objects.link(cluster_root)

    # 1. Molded Binnacle Cowl Housing
    housing = make_box("CLUSTER_HOUSING", (0.0, 0.04, 0.0), (0.72, 0.12, 0.32), mat_abs_black)
    cowl = make_box("CLUSTER_COWL_HOOD", (0.0, -0.04, 0.14), (0.74, 0.08, 0.04), mat_cowl_matte)
    housing.parent = cluster_root
    cowl.parent = cluster_root

    # 2. Backing Gauge Faceplate Quad
    faceplate = make_telltale_quad("CLUSTER_FACEPLATE", (0.0, 0.0, 0.0), (0.64, 0.26), mat_dials)
    faceplate.parent = cluster_root

    # 3. Recessed Chrome Bezels
    # Center Speedometer Bezel
    bezel_speedo = make_ring_bezel("CLUSTER_BEZEL_SPEEDO", (0.0, -0.008, 0.0), r_inner=0.096, r_outer=0.104, depth=0.016, mat=mat_chrome)
    bezel_speedo.parent = cluster_root

    # Left Tachometer Bezel
    bezel_tacho = make_ring_bezel("CLUSTER_BEZEL_TACHO", (-0.186, -0.008, 0.0), r_inner=0.086, r_outer=0.094, depth=0.016, mat=mat_chrome)
    bezel_tacho.parent = cluster_root

    # Right Auxiliary Gauges Quad Bezel
    bezel_fuel = make_ring_bezel("CLUSTER_BEZEL_FUEL", (0.186, -0.008, 0.045), r_inner=0.038, r_outer=0.044, depth=0.012, mat=mat_chrome)
    bezel_temp = make_ring_bezel("CLUSTER_BEZEL_TEMP", (0.186, -0.008, -0.045), r_inner=0.038, r_outer=0.044, depth=0.012, mat=mat_chrome)
    bezel_volt = make_ring_bezel("CLUSTER_BEZEL_VOLT", (0.268, -0.008, 0.045), r_inner=0.030, r_outer=0.035, depth=0.010, mat=mat_chrome)
    bezel_oil  = make_ring_bezel("CLUSTER_BEZEL_OIL",  (0.268, -0.008, -0.045), r_inner=0.030, r_outer=0.035, depth=0.010, mat=mat_chrome)
    for b in [bezel_fuel, bezel_temp, bezel_volt, bezel_oil]:
        b.parent = cluster_root

    # 4. Moving 3D Glowing Red Needles with Center Caps
    # A. Speedometer Needle & Cap
    needle_speedo = make_needle("GAUGE_NEEDLE_SPEEDO", (0.0, -0.012, 0.0), length=0.088, mat=mat_needle_red)
    cap_speedo = make_cylinder("NEEDLE_CAP_SPEEDO", (0.0, -0.016, 0.0), radius=0.014, depth=0.008, axis='Y', mat=mat_needle_cap)
    needle_speedo.parent = cluster_root
    cap_speedo.parent = cluster_root

    # B. Tachometer Needle & Cap
    needle_tacho = make_needle("GAUGE_NEEDLE_TACHO", (-0.186, -0.012, 0.0), length=0.080, mat=mat_needle_red)
    cap_tacho = make_cylinder("NEEDLE_CAP_TACHO", (-0.186, -0.016, 0.0), radius=0.013, depth=0.008, axis='Y', mat=mat_needle_cap)
    needle_tacho.parent = cluster_root
    cap_tacho.parent = cluster_root

    # C. Fuel Level Needle & Cap
    needle_fuel = make_needle("GAUGE_NEEDLE_FUEL", (0.186, -0.012, 0.045), length=0.034, mat=mat_needle_red)
    cap_fuel = make_cylinder("NEEDLE_CAP_FUEL", (0.186, -0.015, 0.045), radius=0.008, depth=0.006, axis='Y', mat=mat_needle_cap)
    needle_fuel.parent = cluster_root
    cap_fuel.parent = cluster_root

    # D. Coolant Temp Needle & Cap
    needle_temp = make_needle("GAUGE_NEEDLE_TEMP", (0.186, -0.012, -0.045), length=0.034, mat=mat_needle_red)
    cap_temp = make_cylinder("NEEDLE_CAP_TEMP", (0.186, -0.015, -0.045), radius=0.008, depth=0.006, axis='Y', mat=mat_needle_cap)
    needle_temp.parent = cluster_root
    cap_temp.parent = cluster_root

    # E. Battery Voltage Needle & Cap
    needle_volt = make_needle("GAUGE_NEEDLE_VOLT", (0.268, -0.012, 0.045), length=0.026, mat=mat_needle_red)
    cap_volt = make_cylinder("NEEDLE_CAP_VOLT", (0.268, -0.015, 0.045), radius=0.007, depth=0.005, axis='Y', mat=mat_needle_cap)
    needle_volt.parent = cluster_root
    cap_volt.parent = cluster_root

    # F. Oil Pressure Needle & Cap
    needle_oil = make_needle("GAUGE_NEEDLE_OIL", (0.268, -0.012, -0.045), length=0.026, mat=mat_needle_red)
    cap_oil = make_cylinder("NEEDLE_CAP_OIL", (0.268, -0.015, -0.045), radius=0.007, depth=0.005, axis='Y', mat=mat_needle_cap)
    needle_oil.parent = cluster_root
    cap_oil.parent = cluster_root

    # 5. Central Digital Driver Information Display (MID)
    # Positioned at lower-center binnacle opening
    screen_mid = make_telltale_quad("CLUSTER_DIGITAL_MID", (0.0, -0.002, -0.042), (0.090, 0.045), mat_mid)
    screen_mid.parent = cluster_root

    # 6. Addressable Telltale Warning Lights Grid (Matching Reference Image)
    # Arranged along the upper arched bank and flanking side wings
    telltales = [
        # Green / Blue
        ("TELLTALE_TURN_SIGNALS", "telltale_turn_signals.png", (-0.085, -0.005, 0.095), (0.024, 0.024)),
        ("TELLTALE_HIGH_BEAM",     "telltale_high_beam.png",     ( 0.085, -0.005, 0.095), (0.024, 0.024)),
        ("TELLTALE_FOG_BEAMS",     "telltale_fog_beams.png",     ( 0.135, -0.005, 0.095), (0.022, 0.022)),
        ("TELLTALE_CRUISE",        "telltale_cruise_control.png",(-0.135, -0.005, 0.095), (0.022, 0.022)),

        # Yellow / Amber Left Arch & Left Wing
        ("TELLTALE_ABS",           "telltale_abs.png",              (-0.255, -0.005, 0.075), (0.022, 0.022)),
        ("TELLTALE_WARNING_LIGHT", "telltale_warning_triangle.png", (-0.285, -0.005, 0.050), (0.022, 0.022)),
        ("TELLTALE_SLIP",          "telltale_slip_tcs.png",         (-0.285, -0.005, 0.020), (0.022, 0.022)),
        ("TELLTALE_DEFROST_FRONT", "telltale_defrost_front.png",    (-0.285, -0.005,-0.010), (0.022, 0.022)),
        ("TELLTALE_CHILD_LOCKS",   "telltale_child_locks.png",      (-0.285, -0.005,-0.040), (0.022, 0.022)),
        ("TELLTALE_GLOW_PLUG",     "telltale_glow_plug.png",        (-0.285, -0.005,-0.070), (0.022, 0.022)),

        # Yellow / Amber Center & Center-Right
        ("TELLTALE_AWD",           "telltale_awd.png",              (-0.045, -0.005, 0.095), (0.022, 0.022)),
        ("TELLTALE_OD_OFF",        "telltale_od_off.png",           ( 0.045, -0.005, 0.095), (0.022, 0.022)),
        ("TELLTALE_CHECK_ENGINE",  "telltale_check_engine.png",     ( 0.125, -0.005, 0.045), (0.022, 0.022)),
        ("TELLTALE_TPMS",          "telltale_tpms.png",             ( 0.125, -0.005, 0.015), (0.022, 0.022)),
        ("TELLTALE_DEFROST_REAR",  "telltale_defrost_rear.png",     ( 0.125, -0.005,-0.015), (0.022, 0.022)),
        ("TELLTALE_POWERTRAIN",    "telltale_powertrain.png",       ( 0.125, -0.005,-0.045), (0.022, 0.022)),
        ("TELLTALE_ESP",           "telltale_esp.png",              ( 0.125, -0.005,-0.075), (0.022, 0.022)),
        ("TELLTALE_LOW_FUEL",      "telltale_low_fuel.png",         ( 0.165, -0.005, 0.080), (0.022, 0.022)),

        # Red Critical Warning Lights (Top & Wings)
        ("TELLTALE_BRAKE_ALERT",     "telltale_brake_alert.png",     ( 0.000, -0.005, 0.095), (0.024, 0.024)),
        ("TELLTALE_AIRBAG",          "telltale_airbag.png",          (-0.255, -0.005, 0.045), (0.022, 0.022)),
        ("TELLTALE_OPEN_DOORS",      "telltale_open_doors.png",      (-0.255, -0.005, 0.015), (0.022, 0.022)),
        ("TELLTALE_OIL_PRESSURE",    "telltale_oil_pressure.png",    (-0.255, -0.005,-0.015), (0.022, 0.022)),
        ("TELLTALE_SEAT_BELT",       "telltale_seat_belt.png",       (-0.255, -0.005,-0.045), (0.022, 0.022)),
        ("TELLTALE_TEMP_WARNING",    "telltale_temp_warning.png",    ( 0.225, -0.005,-0.080), (0.022, 0.022)),
        ("TELLTALE_BATTERY_WARNING", "telltale_battery_warning.png", ( 0.225, -0.005, 0.080), (0.022, 0.022)),
        ("TELLTALE_HAZARD",          "telltale_hazard_warning.png",  ( 0.000, -0.005, 0.065), (0.022, 0.022)),
    ]

    for node_name, tex_file, loc, sz in telltales:
        t_mat = make_textured_emissive_mat(
            f"Mat_{node_name}",
            os.path.join(tex_dir, tex_file),
            roughness=0.1,
            emission_strength=8.0
        )
        t_obj = make_telltale_quad(node_name, loc, sz, t_mat)
        t_obj.parent = cluster_root

    # 7. Curved Protective Optical Glass Cover
    glass = make_box("CLUSTER_GLASS_LENS", (0.0, -0.022, 0.0), (0.68, 0.004, 0.28), mat_glass)
    glass.parent = cluster_root

    # GLB Export
    out_glb = os.path.abspath("public/models/interior/instrument_cluster_master.glb")
    os.makedirs(os.path.dirname(out_glb), exist_ok=True)

    log(f"Exporting Instrument Cluster to {out_glb}...")
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True
    )
    log(f"[SUCCESS] Exported instrument_cluster_master.glb ({os.path.getsize(out_glb)/1024:.1f} KB)")

if __name__ == "__main__":
    build_instrument_cluster()
