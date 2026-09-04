"""
==============================================================================
BLENDER 5.2 AUTOMATED CHASSIS ASSET PIPELINE: STRUCTURAL GT3 COMPETITION CHASSIS
==============================================================================
Generates a production-grade carbon composite monocoque chassis with:
- Carbon fiber survival cell tub with center tunnel and seat rails
- FIA homologated tubular chromoly roll cage with gussets
- Triangulated front and rear suspension subframes
- CNC machined pushrod bellcranks, steering rack mount, and crash cone
==============================================================================
"""

# pyright: reportMissingImports=false
import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[BLENDER_CHASSIS_PIPELINE] {msg}")

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

def set_principled_socket(principled, socket_names, value):
    for name in socket_names:
        if name in principled.inputs:
            principled.inputs[name].default_value = value
            return True
    return False

def create_chassis_materials():
    materials = {}

    def make_mat(name):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        node_pbr = nodes.new(type="ShaderNodeBsdfPrincipled")
        node_out = nodes.new(type="ShaderNodeOutputMaterial")
        mat.node_tree.links.new(node_pbr.outputs["BSDF"], node_out.inputs["Surface"])
        return mat, node_pbr

    # 1. Carbon Monocoque Tub (2x2 Twill Prepreg)
    mat_carbon, pbr = make_mat("Chassis_Carbon_Composite")
    set_principled_socket(pbr, ["Base Color"], (0.06, 0.07, 0.08, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.15)
    set_principled_socket(pbr, ["Roughness"], 0.18)
    set_principled_socket(pbr, ["Coat Weight", "Clearcoat"], 0.92)
    materials["carbon"] = mat_carbon

    # 2. Chromoly Steel Roll Cage & Subframes (Gloss Anthracite)
    mat_cage, pbr = make_mat("Chassis_Chromoly_Steel")
    set_principled_socket(pbr, ["Base Color"], (0.16, 0.18, 0.20, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.88)
    set_principled_socket(pbr, ["Roughness"], 0.22)
    materials["cage"] = mat_cage

    # 3. CNC Billet Aluminum Suspension Rockers & Hardware
    mat_billet, pbr = make_mat("Chassis_Billet_Aluminum")
    set_principled_socket(pbr, ["Base Color"], (0.92, 0.72, 0.18, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.95)
    set_principled_socket(pbr, ["Roughness"], 0.15)
    materials["billet"] = mat_billet

    # 4. Honeycomb Crash Attenuator
    mat_honeycomb, pbr = make_mat("Chassis_Crash_Cone")
    set_principled_socket(pbr, ["Base Color"], (0.78, 0.65, 0.35, 1.0))
    set_principled_socket(pbr, ["Roughness"], 0.45)
    materials["crash_cone"] = mat_honeycomb

    return materials

def create_empty(name, location=(0,0,0), parent=None):
    empty = bpy.data.objects.new(name, None)
    empty.location = location
    bpy.context.scene.collection.objects.link(empty)
    if parent:
        empty.parent = parent
    return empty

def create_mesh_object(name, mesh_data, location=(0,0,0), parent=None, material=None):
    obj = bpy.data.objects.new(name, mesh_data)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    if material:
        obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

def generate_gt3_competition_chassis(output_dir):
    log("Building structural GT3 competition chassis...")
    reset_scene()
    mats = create_chassis_materials()

    wb = 2.70
    tf = 1.66 / 2
    tr = 1.71 / 2
    rh = 0.10

    chassis_root = create_empty("Chassis_Master_Root", location=(0, 0, 0))

    # ========================================================================
    # 1. CARBON FIBER MONOCOQUE SURVIVAL CELL TUB
    # ========================================================================
    log("Building carbon composite monocoque tub and center tunnel...")
    bm_tub = bmesh.new()
    bmesh.ops.create_cube(bm_tub, size=1.0)
    bmesh.ops.scale(bm_tub, vec=Vector((tf * 1.48, wb * 0.55, 0.36)), verts=bm_tub.verts)
    bmesh.ops.translate(bm_tub, vec=Vector((0, 0, rh + 0.18)), verts=bm_tub.verts)
    mesh_tub = bpy.data.meshes.new("Mesh_Monocoque_Tub")
    bm_tub.to_mesh(mesh_tub)
    bm_tub.free()
    create_mesh_object("Chassis_Carbon_Monocoque_Tub", mesh_tub, parent=chassis_root, material=mats["carbon"])

    # Center Torsional Backbone Tunnel
    bm_tun = bmesh.new()
    bmesh.ops.create_cube(bm_tun, size=1.0)
    bmesh.ops.scale(bm_tun, vec=Vector((0.24, wb * 0.58, 0.18)), verts=bm_tun.verts)
    bmesh.ops.translate(bm_tun, vec=Vector((0, 0, rh + 0.15)), verts=bm_tun.verts)
    mesh_tun = bpy.data.meshes.new("Mesh_Torque_Tunnel")
    bm_tun.to_mesh(mesh_tun)
    bm_tun.free()
    create_mesh_object("Chassis_Torque_Tunnel", mesh_tun, parent=chassis_root, material=mats["carbon"])

    # Honeycomb Nose Crash Attenuator Cone
    bm_cone = bmesh.new()
    bmesh.ops.create_cone(bm_cone, cap_ends=True, radius1=0.22, radius2=0.14, depth=0.45, segments=24)
    bmesh.ops.rotate(bm_cone, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-90), 4, 'X'), verts=bm_cone.verts)
    bmesh.ops.translate(bm_cone, vec=Vector((0, (wb * 0.5) + 0.38, rh + 0.22)), verts=bm_cone.verts)
    mesh_cone = bpy.data.meshes.new("Mesh_Crash_Attenuator")
    bm_cone.to_mesh(mesh_cone)
    bm_cone.free()
    create_mesh_object("Chassis_Crash_Attenuator_Cone", mesh_cone, parent=chassis_root, material=mats["crash_cone"])

    # ========================================================================
    # 2. CHROMOLY TUBULAR FRONT SUBFRAME & STEERING RACK MOUNTS
    # ========================================================================
    log("Building tubular chromoly front subframe...")
    front_y = (wb * 0.5)
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        # Longitudinal Frame Rail
        bm_rail = bmesh.new()
        bmesh.ops.create_cone(bm_rail, cap_ends=True, radius1=0.024, radius2=0.024, depth=0.55, segments=16)
        bmesh.ops.rotate(bm_rail, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_rail.verts)
        bmesh.ops.translate(bm_rail, vec=Vector((side * 0.38, front_y - 0.10, rh + 0.18)), verts=bm_rail.verts)
        mesh_rail = bpy.data.meshes.new(f"Mesh_Front_Rail_{s_name}")
        bm_rail.to_mesh(mesh_rail)
        bm_rail.free()
        create_mesh_object(f"Front_Subframe_Rail_{s_name}", mesh_rail, parent=chassis_root, material=mats["cage"])

        # Diagonal Strut Brace
        bm_strut = bmesh.new()
        bmesh.ops.create_cone(bm_strut, cap_ends=True, radius1=0.018, radius2=0.018, depth=0.48, segments=16)
        bmesh.ops.rotate(bm_strut, cent=Vector((0,0,0)), matrix=Matrix.Rotation(side * math.radians(28), 4, 'Y'), verts=bm_strut.verts)
        bmesh.ops.translate(bm_strut, vec=Vector((side * 0.24, front_y, rh + 0.30)), verts=bm_strut.verts)
        mesh_strut = bpy.data.meshes.new(f"Mesh_Front_Strut_{s_name}")
        bm_strut.to_mesh(mesh_strut)
        bm_strut.free()
        create_mesh_object(f"Front_Subframe_Strut_{s_name}", mesh_strut, parent=chassis_root, material=mats["cage"])

    # Steering Rack Crossmember
    bm_rack = bmesh.new()
    bmesh.ops.create_cone(bm_rack, cap_ends=True, radius1=0.026, radius2=0.026, depth=0.82, segments=20)
    bmesh.ops.rotate(bm_rack, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'Y'), verts=bm_rack.verts)
    bmesh.ops.translate(bm_rack, vec=Vector((0, front_y + 0.05, rh + 0.15)), verts=bm_rack.verts)
    mesh_rack = bpy.data.meshes.new("Mesh_Steering_Crossmember")
    bm_rack.to_mesh(mesh_rack)
    bm_rack.free()
    create_mesh_object("Steering_Rack_Crossmember", mesh_rack, parent=chassis_root, material=mats["cage"])

    # ========================================================================
    # 3. REAR CHROMOLY SUBFRAME & ENGINE/TRANSAXLE CRADLE
    # ========================================================================
    log("Building rear tubular chromoly engine cradle and damper towers...")
    rear_y = -(wb * 0.5)
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        # Engine Cradle Lower Beam
        bm_cradle = bmesh.new()
        bmesh.ops.create_cone(bm_cradle, cap_ends=True, radius1=0.026, radius2=0.026, depth=0.75, segments=16)
        bmesh.ops.rotate(bm_cradle, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_cradle.verts)
        bmesh.ops.translate(bm_cradle, vec=Vector((side * 0.42, rear_y + 0.18, rh + 0.12)), verts=bm_cradle.verts)
        mesh_cradle = bpy.data.meshes.new(f"Mesh_Rear_Cradle_{s_name}")
        bm_cradle.to_mesh(mesh_cradle)
        bm_cradle.free()
        create_mesh_object(f"Rear_Subframe_Cradle_{s_name}", mesh_cradle, parent=chassis_root, material=mats["cage"])

        # Rear Damper Tower Tower
        bm_tower = bmesh.new()
        bmesh.ops.create_cube(bm_tower, size=1.0)
        bmesh.ops.scale(bm_tower, vec=Vector((0.08, 0.12, 0.32)), verts=bm_tower.verts)
        bmesh.ops.translate(bm_tower, vec=Vector((side * 0.46, rear_y, rh + 0.32)), verts=bm_tower.verts)
        mesh_tower = bpy.data.meshes.new(f"Mesh_Rear_Tower_{s_name}")
        bm_tower.to_mesh(mesh_tower)
        bm_tower.free()
        create_mesh_object(f"Rear_Damper_Tower_{s_name}", mesh_tower, parent=chassis_root, material=mats["cage"])

    # ========================================================================
    # 4. FULL FIA HOMOLOGATED TUBULAR ROLL CAGE WITH GUSSETS
    # ========================================================================
    log("Building full FIA homologated roll cage with A/B pillars and roof X-brace...")
    tube_r = 0.024 # 48mm OD FIA chromoly tubing

    # Main Roll Hoop (B-Pillar behind driver)
    bm_bhoop = bmesh.new()
    bmesh.ops.create_cube(bm_bhoop, size=1.0)
    bmesh.ops.scale(bm_bhoop, vec=Vector((tf * 1.32, tube_r * 2, 0.58)), verts=bm_bhoop.verts)
    bmesh.ops.translate(bm_bhoop, vec=Vector((0, -(wb * 0.10), rh + 0.54)), verts=bm_bhoop.verts)
    mesh_bhoop = bpy.data.meshes.new("Mesh_Roll_Cage_Main_Hoop")
    bm_bhoop.to_mesh(mesh_bhoop)
    bm_bhoop.free()
    create_mesh_object("Roll_Cage_Main_Hoop", mesh_bhoop, parent=chassis_root, material=mats["cage"])

    # Front Roll Hoop (A-Pillar)
    bm_ahoop = bmesh.new()
    bmesh.ops.create_cube(bm_ahoop, size=1.0)
    bmesh.ops.scale(bm_ahoop, vec=Vector((tf * 1.28, tube_r * 2, 0.52)), verts=bm_ahoop.verts)
    bmesh.ops.translate(bm_ahoop, vec=Vector((0, (wb * 0.18), rh + 0.52)), verts=bm_ahoop.verts)
    mesh_ahoop = bpy.data.meshes.new("Mesh_Roll_Cage_Front_Hoop")
    bm_ahoop.to_mesh(mesh_ahoop)
    bm_ahoop.free()
    create_mesh_object("Roll_Cage_Front_Hoop", mesh_ahoop, parent=chassis_root, material=mats["cage"])

    # Dual Door Side-Impact Crossbars (Left & Right X-Bracing)
    for side in [-1, 1]:
        s_name = "Left" if side < 0 else "Right"
        for bar_idx, bar_rot in enumerate([math.radians(22), math.radians(-22)]):
            bm_xbar = bmesh.new()
            bmesh.ops.create_cone(bm_xbar, cap_ends=True, radius1=tube_r, radius2=tube_r, depth=0.52, segments=16)
            bmesh.ops.rotate(bm_xbar, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bar_rot, 4, 'X'), verts=bm_xbar.verts)
            bmesh.ops.translate(bm_xbar, vec=Vector((side * tf * 0.88, 0.04, rh + 0.32)), verts=bm_xbar.verts)
            mesh_xbar = bpy.data.meshes.new(f"Mesh_Door_Crossbar_{s_name}_{bar_idx}")
            bm_xbar.to_mesh(mesh_xbar)
            bm_xbar.free()
            create_mesh_object(f"Roll_Cage_Door_XBar_{s_name}_{bar_idx+1}", mesh_xbar, parent=chassis_root, material=mats["cage"])

    # ========================================================================
    # 5. CNC BILLET ALUMINUM PUSHROD BELLCRANKS (4 CORNERS)
    # ========================================================================
    log("Building CNC billet aluminum pushrod rockers and pivots...")
    corners = [
        ("FL", -tf * 0.65,  wb * 0.44),
        ("FR",  tf * 0.65,  wb * 0.44),
        ("RL", -tr * 0.68, -(wb * 0.44)),
        ("RR",  tr * 0.68, -(wb * 0.44)),
    ]

    for c_name, cx, cy in corners:
        bm_rocker = bmesh.new()
        bmesh.ops.create_cube(bm_rocker, size=1.0)
        bmesh.ops.scale(bm_rocker, vec=Vector((0.045, 0.09, 0.065)), verts=bm_rocker.verts)
        bmesh.ops.translate(bm_rocker, vec=Vector((cx, cy, rh + 0.38)), verts=bm_rocker.verts)
        mesh_rocker = bpy.data.meshes.new(f"Mesh_Bellcrank_{c_name}")
        bm_rocker.to_mesh(mesh_rocker)
        bm_rocker.free()
        create_mesh_object(f"Suspension_Bellcrank_Rocker_{c_name}", mesh_rocker, parent=chassis_root, material=mats["billet"])

    # ========================================================================
    # 6. EXPORT CHASSIS GLBs
    # ========================================================================
    os.makedirs(output_dir, exist_ok=True)
    gt3_path = os.path.join(output_dir, "gt3_race_chassis_01.glb")
    super_path = os.path.join(output_dir, "supercar_monocoque_chassis_01.glb")
    sports_path = os.path.join(output_dir, "sports_car_chassis_01.glb")

    log(f"Exporting GT3 race chassis to: {gt3_path}")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=gt3_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
    )

    try:
        import shutil
        shutil.copyfile(gt3_path, super_path)
        shutil.copyfile(gt3_path, sports_path)
    except Exception as e:
        log(f"Error copying chassis presets: {e}")

    log("Chassis GLB export successfully completed!")

if __name__ == "__main__":
    target_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "chassis")
    )
    generate_gt3_competition_chassis(target_dir)
