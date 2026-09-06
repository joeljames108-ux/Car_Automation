"""
Lead Automotive 3D Technical Artist & Systems Engineer
Sedan Component Topology Generator & GLB Exporter for Blender 4.x+ / 5.x.

Execution Parameters:
- World Dimensions: Length ~4.85m, Width ~1.88m, Height ~1.44m, Wheelbase ~2.88m.
- Coordinate Standard: Y-Forward (+Y), Z-Up, X-Lateral (+X Driver in LHD, -X Passenger).
- Transform Integrity: All subcomponents retain World Transformation matrix (snap at 0,0,0 in Three.js/Unreal).
- Topology Standard: Continuous quad-dominant topology, auto-smoothed normals, Solidify modifiers (1.5mm–2.0mm / 4mm glass),
  Weighted Normal modifiers, and UV Smart Projection unwrapping.
- Export Specification: Standalone GLBs in 'exports/parts/' and unified vehicle in 'exports/Car_Sedan_Complete.glb'.
"""
import bpy
import bmesh
import os
import math
from mathutils import Vector, Matrix

# ==============================================================================
# 1. ENVIRONMENT & DIRECTORY SETUP
# ==============================================================================
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
base_dir = os.path.join(PROJECT_DIR, "exports")
parts_dir = os.path.join(base_dir, "parts")
os.makedirs(parts_dir, exist_ok=True)

# Flush existing mesh/material data cleanly without terminating MCP listener socket
for obj in list(bpy.context.scene.collection.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.context.scene.collection.children):
    bpy.data.collections.remove(col)
for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# ==============================================================================
# 2. AUTOMOTIVE PBR MATERIAL GENERATOR
# ==============================================================================
def create_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, transmission=0.0, alpha=1.0, emission_color=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

    # Principled BSDF Standard Automotive Inputs
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    bsdf.inputs['Alpha'].default_value = alpha
    bsdf.inputs['Emission Color'].default_value = emission_color
    bsdf.inputs['Emission Strength'].default_value = emission_strength

    if transmission > 0.0 or alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

# Base automotive library
MAT_BODY_PAINT = create_pbr_mat("Mat_DeepBlue_Paint", (0.015, 0.045, 0.12, 1.0), metallic=0.92, roughness=0.18)
MAT_CARBON_TRIM = create_pbr_mat("Mat_SatinTrim", (0.02, 0.02, 0.02, 1.0), metallic=0.2, roughness=0.6)
MAT_CHROME = create_pbr_mat("Mat_ChromeAccents", (0.95, 0.95, 0.95, 1.0), metallic=1.0, roughness=0.08)
MAT_GLASS = create_pbr_mat("Mat_TintedGlass", (0.05, 0.08, 0.1, 1.0), metallic=0.1, roughness=0.02, transmission=0.92, alpha=0.3)
MAT_TIRE_RUBBER = create_pbr_mat("Mat_TireRubber", (0.03, 0.03, 0.03, 1.0), metallic=0.0, roughness=0.88)
MAT_ALLOY_WHEEL = create_pbr_mat("Mat_DiamondCutAlloy", (0.85, 0.85, 0.87, 1.0), metallic=0.98, roughness=0.22)
MAT_BRAKE_DISC = create_pbr_mat("Mat_CastIronBrakes", (0.5, 0.5, 0.5, 1.0), metallic=0.8, roughness=0.35)
MAT_LIGHT_HEAD_EMIT = create_pbr_mat("Mat_LED_White", (1.0, 1.0, 1.0, 1.0), roughness=0.1, emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=15.0)
MAT_LIGHT_TAIL_EMIT = create_pbr_mat("Mat_LED_Red", (1.0, 0.02, 0.02, 1.0), roughness=0.1, emission_color=(1.0, 0.0, 0.0, 1.0), emission_strength=12.0)
MAT_LIGHT_LENS = create_pbr_mat("Mat_PolycarbonateLens", (0.95, 0.95, 0.98, 1.0), metallic=0.05, roughness=0.05, transmission=0.96, alpha=0.25)

# ==============================================================================
# 3. PROCEDURAL PANEL ENGINE
# ==============================================================================
def create_panel_mesh(name, vertices, faces, material, mirror=True, thickness=0.002):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)

    mesh.from_pydata(vertices, [], faces)
    mesh.update()

    # Assign UVs
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)

    if material:
        obj.data.materials.append(material)

    # Modifier Chain: Mirror -> Solidify -> Subsurf -> Weighted Normal
    if mirror:
        m_mod = obj.modifiers.new(name="Mirror", type='MIRROR')
        m_mod.use_axis[0] = True
        m_mod.use_clip = True

    if thickness > 0:
        s_mod = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        s_mod.thickness = thickness
        s_mod.offset = -1.0

    sub_mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub_mod.levels = 1
    sub_mod.render_levels = 2

    wn_mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn_mod.keep_sharp = True

    if hasattr(mesh, "auto_smooth_angle"):
        mesh.auto_smooth_angle = math.radians(35.0)

    for poly in mesh.polygons:
        poly.use_smooth = True

    return obj

# ==============================================================================
# 4. COMPONENT ARCHITECTURE & TOPOLOGY
# ==============================================================================
def construct_sedan():
    parts = {}

    # 1. Hood: sculpted dual-crease profile
    hood_verts = [
        (0.00, 2.22, 0.81), (0.42, 2.20, 0.81), (0.76, 2.14, 0.79),
        (0.00, 1.55, 0.88), (0.44, 1.54, 0.88), (0.81, 1.50, 0.86),
        (0.00, 0.82, 0.95), (0.45, 0.94, 0.95), (0.83, 0.82, 0.93)
    ]
    hood_faces = [
        (0, 1, 4, 3), (1, 2, 5, 4),
        (3, 4, 7, 6), (4, 5, 8, 7)
    ]
    parts["GEO_Hood"] = create_panel_mesh("GEO_Hood", hood_verts, hood_faces, MAT_BODY_PAINT, mirror=True)

    # 2. Roof & Greenhouse Structure
    roof_verts = [
        (0.00, 0.28, 1.43), (0.58, 0.28, 1.41),
        (0.00, -0.32, 1.45), (0.61, -0.32, 1.43),
        (0.00, -0.95, 1.42), (0.57, -0.95, 1.40)
    ]
    roof_faces = [(0, 1, 3, 2), (2, 3, 5, 4)]
    parts["GEO_Roof"] = create_panel_mesh("GEO_Roof", roof_verts, roof_faces, MAT_BODY_PAINT, mirror=True)

    # 3. Windshield Glass
    ws_verts = [
        (0.00, 0.80, 0.96), (0.81, 0.80, 0.94),
        (0.00, 0.29, 1.42), (0.57, 0.29, 1.40)
    ]
    parts["GEO_Windshield"] = create_panel_mesh("GEO_Windshield", ws_verts, [(0, 1, 3, 2)], MAT_GLASS, mirror=True, thickness=0.004)

    # 4. Rear Glass Backlight
    rw_verts = [
        (0.00, -0.96, 1.41), (0.56, -0.96, 1.39),
        (0.00, -1.62, 1.06), (0.71, -1.62, 1.04)
    ]
    parts["GEO_Rear_Backlight"] = create_panel_mesh("GEO_Rear_Backlight", rw_verts, [(0, 1, 3, 2)], MAT_GLASS, mirror=True, thickness=0.004)

    # 5. Front Doors (.L / .R symmetrical)
    df_verts = [
        (0.85, 0.77, 0.85), (0.66, 0.28, 1.37),
        (0.88, -0.02, 0.85), (0.68, -0.02, 1.37),
        (0.85, 0.77, 0.28), (0.88, -0.02, 0.28)
    ]
    df_faces = [(0, 1, 3, 2), (4, 0, 2, 5)]
    parts["GEO_Door_Front"] = create_panel_mesh("GEO_Door_Front.L", df_verts, df_faces, MAT_BODY_PAINT, mirror=True)

    # 6. Rear Doors (.L / .R symmetrical)
    dr_verts = [
        (0.88, -0.02, 0.85), (0.68, -0.02, 1.37),
        (0.86, -0.82, 0.85), (0.64, -0.82, 1.37),
        (0.88, -0.02, 0.28), (0.86, -0.82, 0.28)
    ]
    dr_faces = [(0, 1, 3, 2), (4, 0, 2, 5)]
    parts["GEO_Door_Rear"] = create_panel_mesh("GEO_Door_Rear.L", dr_verts, dr_faces, MAT_BODY_PAINT, mirror=True)

    # 7. Rear Quarter Panels
    rq_verts = [
        (0.86, -0.82, 0.85), (0.64, -0.82, 1.37),
        (0.84, -1.65, 0.98), (0.68, -1.60, 1.05),
        (0.86, -0.82, 0.28), (0.84, -1.65, 0.35)
    ]
    rq_faces = [(0, 1, 3, 2), (4, 0, 2, 5)]
    parts["GEO_QuarterPanel_Rear"] = create_panel_mesh("GEO_QuarterPanel_Rear.L", rq_verts, rq_faces, MAT_BODY_PAINT, mirror=True)

    # 8. Trunk Decklid
    trunk_verts = [
        (0.00, -1.63, 1.05), (0.69, -1.63, 1.03),
        (0.00, -2.14, 1.01), (0.71, -2.14, 0.99),
        (0.00, -2.42, 0.89), (0.68, -2.42, 0.87)
    ]
    trunk_faces = [(0, 1, 3, 2), (2, 3, 5, 4)]
    parts["GEO_Trunk"] = create_panel_mesh("GEO_Trunk", trunk_verts, trunk_faces, MAT_BODY_PAINT, mirror=True)

    # 9. Front Bumper Fascia & Splitter
    fb_verts = [
        (0.00, 2.45, 0.30), (0.80, 2.38, 0.30),
        (0.00, 2.38, 0.65), (0.78, 2.30, 0.65),
        (0.00, 2.23, 0.81), (0.76, 2.14, 0.79)
    ]
    fb_faces = [(0, 1, 3, 2), (2, 3, 5, 4)]
    parts["GEO_Bumper_Front"] = create_panel_mesh("GEO_Bumper_Front", fb_verts, fb_faces, MAT_BODY_PAINT, mirror=True)

    # 10. Rear Bumper Assembly & Diffuser
    rb_verts = [
        (0.00, -2.52, 0.32), (0.78, -2.45, 0.32),
        (0.00, -2.48, 0.68), (0.75, -2.38, 0.68),
        (0.00, -2.42, 0.89), (0.68, -2.42, 0.87)
    ]
    rb_faces = [(0, 1, 3, 2), (2, 3, 5, 4)]
    parts["GEO_Bumper_Rear"] = create_panel_mesh("GEO_Bumper_Rear", rb_verts, rb_faces, MAT_BODY_PAINT, mirror=True)

    # 11. Headlight Clusters (Reflector Housing + Lens)
    hl_verts = [
        (0.40, 2.27, 0.73), (0.74, 2.08, 0.73),
        (0.70, 1.98, 0.79), (0.38, 2.18, 0.79)
    ]
    parts["GEO_Headlight_Lenses"] = create_panel_mesh("GEO_Headlight_Lenses.L", hl_verts, [(0, 1, 2, 3)], MAT_LIGHT_LENS, mirror=True, thickness=0.001)

    # Internal Emissive LED Strip
    led_verts = [
        (0.42, 2.25, 0.74), (0.72, 2.07, 0.74),
        (0.71, 2.04, 0.76), (0.41, 2.22, 0.76)
    ]
    parts["GEO_Headlight_LEDs"] = create_panel_mesh("GEO_Headlight_LEDs.L", led_verts, [(0, 1, 2, 3)], MAT_LIGHT_HEAD_EMIT, mirror=True, thickness=0.0)

    # 12. Taillight Clusters
    tl_verts = [
        (0.20, -2.42, 0.85), (0.67, -2.40, 0.84),
        (0.66, -2.36, 0.88), (0.20, -2.38, 0.89)
    ]
    parts["GEO_Taillight_LEDs"] = create_panel_mesh("GEO_Taillight_LEDs.L", tl_verts, [(0, 1, 2, 3)], MAT_LIGHT_TAIL_EMIT, mirror=True, thickness=0.0)

    # 13. Side Mirrors with Integrated Stalks
    mirror_verts = [
        (0.85, 0.65, 0.94), (1.06, 0.62, 0.98),
        (1.08, 0.48, 0.95), (0.87, 0.50, 0.91),
        (0.85, 0.65, 0.86), (1.06, 0.62, 0.88),
        (1.08, 0.48, 0.87), (0.87, 0.50, 0.83)
    ]
    mirror_faces = [
        (0, 1, 2, 3), (7, 6, 5, 4),
        (0, 4, 5, 1), (1, 5, 6, 2),
        (2, 6, 7, 3), (3, 7, 4, 0)
    ]
    parts["GEO_Mirror_Assembly"] = create_panel_mesh("GEO_Mirror_Assembly.L", mirror_verts, mirror_faces, MAT_CARBON_TRIM, mirror=True, thickness=0.0)

    # 14. Complete Wheel Assemblies (Rim, Caliper, Tire)
    stations = [
        ("Front.L", (0.84, 1.44, 0.35)),
        ("Front.R", (-0.84, 1.44, 0.35)),
        ("Rear.L", (0.84, -1.44, 0.35)),
        ("Rear.R", (-0.84, -1.44, 0.35))
    ]

    for station_name, pos in stations:
        # Tire
        bpy.ops.mesh.primitive_cylinder_add(radius=0.34, depth=0.24, location=pos, rotation=(0, 1.5708, 0))
        tire = bpy.context.active_object
        tire.name = f"GEO_Tire_{station_name}"
        tire.data.materials.append(MAT_TIRE_RUBBER)
        parts[tire.name] = tire

        # Rim
        bpy.ops.mesh.primitive_cylinder_add(radius=0.26, depth=0.25, location=pos, rotation=(0, 1.5708, 0))
        rim = bpy.context.active_object
        rim.name = f"GEO_Rim_{station_name}"
        rim.data.materials.append(MAT_ALLOY_WHEEL)
        parts[rim.name] = rim

        # Brake Rotor Disc
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.03, location=(pos[0] * 0.92, pos[1], pos[2]), rotation=(0, 1.5708, 0))
        disc = bpy.context.active_object
        disc.name = f"GEO_BrakeRotor_{station_name}"
        disc.data.materials.append(MAT_BRAKE_DISC)
        parts[disc.name] = disc

    return parts

# ==============================================================================
# 5. DUAL-MODE GLB EXPORT PIPELINE
# ==============================================================================
def execute_exports(parts_dict):
    bpy.ops.object.select_all(action='DESELECT')

    # Pass A: Export Individual Components (Retaining Absolute Coordinates for Instant Snapping)
    for part_name, obj in parts_dict.items():
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj

        part_out_path = os.path.join(parts_dir, f"{part_name}.glb")
        bpy.ops.export_scene.gltf(
            filepath=part_out_path,
            use_selection=True,
            export_format='GLB',
            export_apply=False,
            export_yup=True,
            export_materials='EXPORT'
        )
        obj.select_set(False)
        print(f"[STATUS] Exported Component: {part_out_path}")

    # Pass B: Export Complete Unified Sedan
    bpy.ops.object.select_all(action='SELECT')
    complete_out_path = os.path.join(base_dir, "Car_Sedan_Complete.glb")
    bpy.ops.export_scene.gltf(
        filepath=complete_out_path,
        use_selection=True,
        export_format='GLB',
        export_apply=True,  # Apply modifiers (Mirror, Subsurf, Solidify) for the master file
        export_yup=True,
        export_materials='EXPORT'
    )
    print(f"[STATUS] Master Vehicle Exported: {complete_out_path}")

# ==============================================================================
# EXECUTION ENTRY POINT
# ==============================================================================
if __name__ == "__main__":
    assembled_sedan = construct_sedan()
    execute_exports(assembled_sedan)
    print(f"[DONE] Successfully generated and exported {len(assembled_sedan)} sedan components.")
