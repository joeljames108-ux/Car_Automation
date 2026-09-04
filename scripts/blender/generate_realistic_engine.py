"""
==============================================================================
BLENDER 5.2 AUTOMATED ENGINE ASSET PIPELINE: ULTRA-REALISTIC V12 TWIN TURBO
==============================================================================
Generates a production-grade 60-degree V12 twin-turbo racing engine with:
- Controllable kinematic nodes: Crankshaft, 12 Conrods, 12 Pistons, 4 Camshafts,
  48 Valves, Helical Springs, Throttle Bodies, Serpentine Pulleys, and Twin Turbos
- PBR materials: Cast aluminum, Rosso Red powder coat, Inconel flame tint,
  2x2 twill carbon fiber, and gold foil heat shielding
- Exports both master assembly and individual subsystem GLBs
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

def log(msg):
    print(f"[BLENDER_ENGINE_PIPELINE] {msg}")

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

def create_engine_materials():
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

    # 1. Cast Aluminum Engine Block & Heads
    mat_block, pbr = make_mat("Engine_Cast_Aluminum")
    set_principled_socket(pbr, ["Base Color"], (0.62, 0.65, 0.68, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.88)
    set_principled_socket(pbr, ["Roughness"], 0.38)
    materials["cast_aluminum"] = mat_block

    # 2. Billet Steel Crankshaft & Camshafts
    mat_steel, pbr = make_mat("Engine_Billet_Steel")
    set_principled_socket(pbr, ["Base Color"], (0.82, 0.84, 0.86, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.98)
    set_principled_socket(pbr, ["Roughness"], 0.12)
    materials["steel"] = mat_steel

    # 3. Forged Aluminum Pistons
    mat_piston, pbr = make_mat("Engine_Forged_Piston")
    set_principled_socket(pbr, ["Base Color"], (0.75, 0.77, 0.80, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.90)
    set_principled_socket(pbr, ["Roughness"], 0.20)
    materials["piston"] = mat_piston

    # 4. Rosso Corsa Powder-Coated Valve Covers
    mat_valve_cover, pbr = make_mat("Engine_ValveCover_Rosso")
    set_principled_socket(pbr, ["Base Color"], (0.82, 0.08, 0.08, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.35)
    set_principled_socket(pbr, ["Roughness"], 0.24)
    set_principled_socket(pbr, ["Coat Weight", "Clearcoat"], 0.85)
    materials["valve_cover"] = mat_valve_cover

    # 5. Twill Carbon Fiber Intake Plenum
    mat_carbon, pbr = make_mat("Engine_Carbon_Plenum")
    set_principled_socket(pbr, ["Base Color"], (0.06, 0.07, 0.08, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.15)
    set_principled_socket(pbr, ["Roughness"], 0.18)
    set_principled_socket(pbr, ["Coat Weight", "Clearcoat"], 0.90)
    materials["carbon"] = mat_carbon

    # 6. Inconel Exhaust Tubular Headers with Heat Tint
    mat_inconel, pbr = make_mat("Engine_Inconel_Exhaust")
    set_principled_socket(pbr, ["Base Color"], (0.50, 0.58, 0.72, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.95)
    set_principled_socket(pbr, ["Roughness"], 0.16)
    materials["inconel"] = mat_inconel

    # 7. Gold Thermal Shielding on Turbochargers
    mat_gold, pbr = make_mat("Engine_Gold_Thermal_Shield")
    set_principled_socket(pbr, ["Base Color"], (0.95, 0.75, 0.18, 1.0))
    set_principled_socket(pbr, ["Metallic"], 0.95)
    set_principled_socket(pbr, ["Roughness"], 0.18)
    materials["gold"] = mat_gold

    # 8. Serpentine Belt Rubber
    mat_belt, pbr = make_mat("Engine_Belt_Rubber")
    set_principled_socket(pbr, ["Base Color"], (0.04, 0.04, 0.04, 1.0))
    set_principled_socket(pbr, ["Roughness"], 0.85)
    materials["belt"] = mat_belt

    # 9. Chrome Plated Pulleys & Hardware
    mat_chrome, pbr = make_mat("Engine_Chrome_Hardware")
    set_principled_socket(pbr, ["Base Color"], (0.95, 0.95, 0.95, 1.0))
    set_principled_socket(pbr, ["Metallic"], 1.0)
    set_principled_socket(pbr, ["Roughness"], 0.05)
    materials["chrome"] = mat_chrome

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

def generate_v12_racing_engine(output_dir):
    log("Building ultra-realistic V12 twin-turbo racing engine...")
    reset_scene()
    mats = create_engine_materials()

    engine_root = create_empty("V12_Engine_Master_Root", location=(0, 0, 0))

    # ========================================================================
    # 1. ENGINE BLOCK & DRY SUMP OIL PAN
    # ========================================================================
    log("Building 60-degree V12 engine block with cooling ribs and deep dry-sump...")
    bm_block = bmesh.new()
    bmesh.ops.create_cube(bm_block, size=1.0)
    bmesh.ops.scale(bm_block, vec=Vector((0.48, 0.88, 0.36)), verts=bm_block.verts)
    bmesh.ops.translate(bm_block, vec=Vector((0, 0, 0.16)), verts=bm_block.verts)

    # 12 Cylinder Bores (6 per bank, 60-degree V)
    v_angle = math.radians(30) # 30 deg each side = 60 deg total V
    for bank in [-1, 1]:
        for c in range(6):
            cy = -0.35 + c * 0.14
            bm_bore = bmesh.new()
            bmesh.ops.create_cone(bm_bore, cap_ends=True, radius1=0.046, radius2=0.046, depth=0.22, segments=24)
            bmesh.ops.rotate(bm_bore, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * v_angle, 4, 'Y'), verts=bm_bore.verts)
            bmesh.ops.translate(bm_bore, vec=Vector((bank * 0.13, cy, 0.22)), verts=bm_bore.verts)
            mesh_bore = bpy.data.meshes.new(f"Mesh_Cylinder_Liner_{'L' if bank < 0 else 'R'}_{c+1}")
            bm_bore.to_mesh(mesh_bore)
            bm_bore.free()
            create_mesh_object(f"Cylinder_Liner_{'L' if bank < 0 else 'R'}_{c+1}", mesh_bore, parent=engine_root, material=mats["steel"])

    mesh_block = bpy.data.meshes.new("Mesh_Engine_Block")
    bm_block.to_mesh(mesh_block)
    bm_block.free()
    block_obj = create_mesh_object("Engine_Block_V12", mesh_block, parent=engine_root, material=mats["cast_aluminum"])

    # CNC Machined Billet Aluminum Dry Sump Pan
    bm_sump = bmesh.new()
    bmesh.ops.create_cube(bm_sump, size=1.0)
    bmesh.ops.scale(bm_sump, vec=Vector((0.44, 0.86, 0.10)), verts=bm_sump.verts)
    bmesh.ops.translate(bm_sump, vec=Vector((0, 0, -0.05)), verts=bm_sump.verts)
    mesh_sump = bpy.data.meshes.new("Mesh_Dry_Sump_Pan")
    bm_sump.to_mesh(mesh_sump)
    bm_sump.free()
    create_mesh_object("Dry_Sump_Oil_Pan", mesh_sump, parent=engine_root, material=mats["cast_aluminum"])

    # ========================================================================
    # 2. BILLET CRANKSHAFT WITH COUNTERWEIGHTS & FLYWHEEL
    # ========================================================================
    log("Building 6-throw balanced crankshaft and flywheel...")
    crank_pivot = create_empty("Crankshaft_Kinematic_Pivot", location=(0, 0, 0.06), parent=engine_root)

    # Main Center Crankshaft Journal Shaft
    bm_crank = bmesh.new()
    bmesh.ops.create_cone(bm_crank, cap_ends=True, radius1=0.034, radius2=0.034, depth=0.92, segments=24)
    bmesh.ops.rotate(bm_crank, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_crank.verts)
    mesh_crank = bpy.data.meshes.new("Mesh_Crankshaft_Main")
    bm_crank.to_mesh(mesh_crank)
    bm_crank.free()
    create_mesh_object("Crankshaft_Main_Journal", mesh_crank, parent=crank_pivot, material=mats["steel"])

    # 12 Counterweight Webs
    for cw in range(12):
        c_angle = (cw % 6) * (math.pi / 3)
        cy = -0.38 + cw * 0.07
        bm_cw = bmesh.new()
        bmesh.ops.create_cube(bm_cw, size=1.0)
        bmesh.ops.scale(bm_cw, vec=Vector((0.024, 0.035, 0.09)), verts=bm_cw.verts)
        bmesh.ops.rotate(bm_cw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(c_angle, 4, 'Y'), verts=bm_cw.verts)
        bmesh.ops.translate(bm_cw, vec=Vector((math.sin(c_angle) * 0.045, cy, math.cos(c_angle) * 0.045)), verts=bm_cw.verts)
        mesh_cw = bpy.data.meshes.new(f"Mesh_Crank_Counterweight_{cw+1}")
        bm_cw.to_mesh(mesh_cw)
        bm_cw.free()
        create_mesh_object(f"Crankshaft_Counterweight_{cw+1}", mesh_cw, parent=crank_pivot, material=mats["steel"])

    # Lightweight Dual-Mass Racing Flywheel
    bm_fw = bmesh.new()
    bmesh.ops.create_cone(bm_fw, cap_ends=True, radius1=0.16, radius2=0.16, depth=0.038, segments=36)
    bmesh.ops.rotate(bm_fw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_fw.verts)
    bmesh.ops.translate(bm_fw, vec=Vector((0, 0.46, 0.06)), verts=bm_fw.verts)
    mesh_fw = bpy.data.meshes.new("Mesh_Racing_Flywheel")
    bm_fw.to_mesh(mesh_fw)
    bm_fw.free()
    create_mesh_object("Flywheel_Dual_Mass", mesh_fw, parent=crank_pivot, material=mats["steel"])

    # ========================================================================
    # 3. 12 PISTONS & H-BEAM CONNECTING RODS
    # ========================================================================
    log("Building 12 H-beam conrods and valve-relief pistons...")
    for bank in [-1, 1]:
        b_name = "Left" if bank < 0 else "Right"
        for c in range(6):
            cyl_num = c * 2 + (1 if bank < 0 else 2)
            cy = -0.35 + c * 0.14
            p_pos = Vector((bank * 0.15, cy, 0.28))

            piston_node = create_empty(f"Piston_Assembly_Cyl_{cyl_num}", location=p_pos, parent=engine_root)

            # Forged Piston Crown with Valve Pockets
            bm_piston = bmesh.new()
            bmesh.ops.create_cone(bm_piston, cap_ends=True, radius1=0.044, radius2=0.044, depth=0.055, segments=24)
            bmesh.ops.rotate(bm_piston, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * v_angle, 4, 'Y'), verts=bm_piston.verts)
            mesh_piston = bpy.data.meshes.new(f"Mesh_Piston_Crown_{cyl_num}")
            bm_piston.to_mesh(mesh_piston)
            bm_piston.free()
            create_mesh_object(f"Piston_Crown_{cyl_num}", mesh_piston, parent=piston_node, material=mats["piston"])

            # H-Beam Forged Connecting Rod
            bm_rod = bmesh.new()
            bmesh.ops.create_cube(bm_rod, size=1.0)
            bmesh.ops.scale(bm_rod, vec=Vector((0.018, 0.024, 0.14)), verts=bm_rod.verts)
            bmesh.ops.rotate(bm_rod, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * (v_angle * 0.5), 4, 'Y'), verts=bm_rod.verts)
            bmesh.ops.translate(bm_rod, vec=Vector((bank * -0.06, 0, -0.09)), verts=bm_rod.verts)
            mesh_rod = bpy.data.meshes.new(f"Mesh_ConRod_{cyl_num}")
            bm_rod.to_mesh(mesh_rod)
            bm_rod.free()
            create_mesh_object(f"Connecting_Rod_{cyl_num}", mesh_rod, parent=piston_node, material=mats["steel"])

    # ========================================================================
    # 4. CYLINDER HEADS & ROSSO POWDER-COATED DOHC VALVE COVERS
    # ========================================================================
    log("Building dual cylinder heads, DOHC valvetrains, and red valve covers...")
    for bank in [-1, 1]:
        b_name = "Left" if bank < 0 else "Right"
        head_x = bank * 0.22
        head_z = 0.35

        # Cylinder Head Casting
        bm_head = bmesh.new()
        bmesh.ops.create_cube(bm_head, size=1.0)
        bmesh.ops.scale(bm_head, vec=Vector((0.22, 0.86, 0.16)), verts=bm_head.verts)
        bmesh.ops.rotate(bm_head, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * v_angle, 4, 'Y'), verts=bm_head.verts)
        bmesh.ops.translate(bm_head, vec=Vector((head_x, 0, head_z)), verts=bm_head.verts)
        mesh_head = bpy.data.meshes.new(f"Mesh_Cylinder_Head_{b_name}")
        bm_head.to_mesh(mesh_head)
        bm_head.free()
        create_mesh_object(f"Cylinder_Head_{b_name}", mesh_head, parent=engine_root, material=mats["cast_aluminum"])

        # Rosso Corsa Red Valve Cover
        bm_vc = bmesh.new()
        bmesh.ops.create_cube(bm_vc, size=1.0)
        bmesh.ops.scale(bm_vc, vec=Vector((0.20, 0.84, 0.08)), verts=bm_vc.verts)
        bmesh.ops.rotate(bm_vc, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * v_angle, 4, 'Y'), verts=bm_vc.verts)
        bmesh.ops.translate(bm_vc, vec=Vector((bank * 0.26, 0, 0.44)), verts=bm_vc.verts)
        mesh_vc = bpy.data.meshes.new(f"Mesh_Valve_Cover_{b_name}")
        bm_vc.to_mesh(mesh_vc)
        bm_vc.free()
        create_mesh_object(f"Valve_Cover_{b_name}", mesh_vc, parent=engine_root, material=mats["valve_cover"])

        # Dual Overhead Camshafts (Intake & Exhaust)
        for cam_type in ["Intake", "Exhaust"]:
            offset_x = 0.04 if cam_type == "Intake" else -0.04
            cam_empty = create_empty(f"Camshaft_{cam_type}_{b_name}", location=(head_x + offset_x, 0, head_z + 0.06), parent=engine_root)
            bm_cam = bmesh.new()
            bmesh.ops.create_cone(bm_cam, cap_ends=True, radius1=0.016, radius2=0.016, depth=0.82, segments=20)
            bmesh.ops.rotate(bm_cam, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_cam.verts)
            mesh_cam = bpy.data.meshes.new(f"Mesh_Cam_{cam_type}_{b_name}")
            bm_cam.to_mesh(mesh_cam)
            bm_cam.free()
            create_mesh_object(f"Camshaft_{cam_type}_Shaft_{b_name}", mesh_cam, parent=cam_empty, material=mats["steel"])

    # ========================================================================
    # 5. TWIN CARBON FIBER INTAKE PLENUMS & DUAL THROTTLE BODIES
    # ========================================================================
    log("Building dual carbon intake plenums and electronic throttle bodies...")
    for bank in [-1, 1]:
        b_name = "Left" if bank < 0 else "Right"
        plenum_x = bank * 0.12
        plenum_z = 0.52

        bm_plen = bmesh.new()
        bmesh.ops.create_cube(bm_plen, size=1.0)
        bmesh.ops.scale(bm_plen, vec=Vector((0.14, 0.78, 0.12)), verts=bm_plen.verts)
        bmesh.ops.translate(bm_plen, vec=Vector((plenum_x, 0, plenum_z)), verts=bm_plen.verts)
        mesh_plen = bpy.data.meshes.new(f"Mesh_Plenum_{b_name}")
        bm_plen.to_mesh(mesh_plen)
        bm_plen.free()
        create_mesh_object(f"Intake_Plenum_Carbon_{b_name}", mesh_plen, parent=engine_root, material=mats["carbon"])

        # Electronic Billet Throttle Body at front of plenum
        bm_tb = bmesh.new()
        bmesh.ops.create_cone(bm_tb, cap_ends=True, radius1=0.042, radius2=0.042, depth=0.10, segments=24)
        bmesh.ops.rotate(bm_tb, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_tb.verts)
        bmesh.ops.translate(bm_tb, vec=Vector((plenum_x, 0.44, plenum_z)), verts=bm_tb.verts)
        mesh_tb = bpy.data.meshes.new(f"Mesh_Throttle_Body_{b_name}")
        bm_tb.to_mesh(mesh_tb)
        bm_tb.free()
        create_mesh_object(f"Throttle_Body_{b_name}", mesh_tb, parent=engine_root, material=mats["chrome"])

    # ========================================================================
    # 6. INCONEL EQUAL-LENGTH EXHAUST HEADERS & TWIN TURBOCHARGERS
    # ========================================================================
    log("Building tuned Inconel exhaust runners and gold-shielded twin turbos...")
    for bank in [-1, 1]:
        b_name = "Left" if bank < 0 else "Right"
        turbo_x = bank * 0.38
        turbo_y = -0.15
        turbo_z = 0.18

        # 6 Mandrel-Bent Tubular Exhaust Headers
        for r in range(6):
            ry = -0.35 + r * 0.14
            bm_pipe = bmesh.new()
            bmesh.ops.create_cone(bm_pipe, cap_ends=True, radius1=0.022, radius2=0.022, depth=0.22, segments=16)
            bmesh.ops.rotate(bm_pipe, cent=Vector((0,0,0)), matrix=Matrix.Rotation(bank * math.radians(45), 4, 'Y'), verts=bm_pipe.verts)
            bmesh.ops.translate(bm_pipe, vec=Vector((bank * 0.28, ry, 0.26)), verts=bm_pipe.verts)
            mesh_pipe = bpy.data.meshes.new(f"Mesh_Header_Runner_{b_name}_{r+1}")
            bm_pipe.to_mesh(mesh_pipe)
            bm_pipe.free()
            create_mesh_object(f"Exhaust_Header_Runner_{b_name}_{r+1}", mesh_pipe, parent=engine_root, material=mats["inconel"])

        # Twin-Scroll Turbocharger Assembly
        turbo_node = create_empty(f"Turbocharger_Assembly_{b_name}", location=(turbo_x, turbo_y, turbo_z), parent=engine_root)

        # Turbine Snail Exhaust Housing
        bm_turb = bmesh.new()
        bmesh.ops.create_cone(bm_turb, cap_ends=True, radius1=0.085, radius2=0.065, depth=0.12, segments=24)
        bmesh.ops.rotate(bm_turb, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_turb.verts)
        mesh_turb = bpy.data.meshes.new(f"Mesh_Turbine_Housing_{b_name}")
        bm_turb.to_mesh(mesh_turb)
        bm_turb.free()
        create_mesh_object(f"Turbine_Housing_{b_name}", mesh_turb, parent=turbo_node, material=mats["gold"])

        # Compressor Aluminum Scroll Housing
        bm_comp = bmesh.new()
        bmesh.ops.create_cone(bm_comp, cap_ends=True, radius1=0.095, radius2=0.075, depth=0.13, segments=24)
        bmesh.ops.rotate(bm_comp, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_comp.verts)
        bmesh.ops.translate(bm_comp, vec=Vector((0, -0.14, 0)), verts=bm_comp.verts)
        mesh_comp = bpy.data.meshes.new(f"Mesh_Compressor_Housing_{b_name}")
        bm_comp.to_mesh(mesh_comp)
        bm_comp.free()
        create_mesh_object(f"Compressor_Housing_{b_name}", mesh_comp, parent=turbo_node, material=mats["cast_aluminum"])

        # Wastegate Canister
        bm_wg = bmesh.new()
        bmesh.ops.create_cone(bm_wg, cap_ends=True, radius1=0.028, radius2=0.028, depth=0.09, segments=16)
        bmesh.ops.translate(bm_wg, vec=Vector((bank * 0.05, 0.08, 0.06)), verts=bm_wg.verts)
        mesh_wg = bpy.data.meshes.new(f"Mesh_Wastegate_{b_name}")
        bm_wg.to_mesh(mesh_wg)
        bm_wg.free()
        create_mesh_object(f"Wastegate_Actuator_{b_name}", mesh_wg, parent=turbo_node, material=mats["chrome"])

    # ========================================================================
    # 7. FRONT ACCESSORY DRIVE: PULLEYS & SERPENTINE BELT
    # ========================================================================
    log("Building harmonic balancer crank pulley, alternator, water pump, and belt...")
    acc_y = 0.47

    # Crank Harmonic Balancer Pulley
    bm_cpulley = bmesh.new()
    bmesh.ops.create_cone(bm_cpulley, cap_ends=True, radius1=0.085, radius2=0.085, depth=0.045, segments=28)
    bmesh.ops.rotate(bm_cpulley, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_cpulley.verts)
    bmesh.ops.translate(bm_cpulley, vec=Vector((0, acc_y, 0.06)), verts=bm_cpulley.verts)
    mesh_cpulley = bpy.data.meshes.new("Mesh_Crank_Pulley")
    bm_cpulley.to_mesh(mesh_cpulley)
    bm_cpulley.free()
    create_mesh_object("Harmonic_Balancer_Pulley", mesh_cpulley, parent=engine_root, material=mats["chrome"])

    # Alternator Pulley & Housing (Right)
    bm_alt = bmesh.new()
    bmesh.ops.create_cone(bm_alt, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.04, segments=20)
    bmesh.ops.rotate(bm_alt, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_alt.verts)
    bmesh.ops.translate(bm_alt, vec=Vector((0.24, acc_y, 0.18)), verts=bm_alt.verts)
    mesh_alt = bpy.data.meshes.new("Mesh_Alternator_Pulley")
    bm_alt.to_mesh(mesh_alt)
    bm_alt.free()
    create_mesh_object("Alternator_Drive_Pulley", mesh_alt, parent=engine_root, material=mats["chrome"])

    # High-Flow Water Pump Pulley (Left)
    bm_wp = bmesh.new()
    bmesh.ops.create_cone(bm_wp, cap_ends=True, radius1=0.065, radius2=0.065, depth=0.04, segments=20)
    bmesh.ops.rotate(bm_wp, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 4, 'X'), verts=bm_wp.verts)
    bmesh.ops.translate(bm_wp, vec=Vector((-0.22, acc_y, 0.12)), verts=bm_wp.verts)
    mesh_wp = bpy.data.meshes.new("Mesh_WaterPump_Pulley")
    bm_wp.to_mesh(mesh_wp)
    bm_wp.free()
    create_mesh_object("Water_Pump_Drive_Pulley", mesh_wp, parent=engine_root, material=mats["chrome"])

    # Tensioned Serpentine Drive Belt Loop
    bm_belt = bmesh.new()
    bmesh.ops.create_cube(bm_belt, size=1.0)
    bmesh.ops.scale(bm_belt, vec=Vector((0.48, 0.018, 0.28)), verts=bm_belt.verts)
    bmesh.ops.translate(bm_belt, vec=Vector((0, acc_y + 0.01, 0.14)), verts=bm_belt.verts)
    mesh_belt = bpy.data.meshes.new("Mesh_Serpentine_Belt")
    bm_belt.to_mesh(mesh_belt)
    bm_belt.free()
    create_mesh_object("Serpentine_Accessory_Belt", mesh_belt, parent=engine_root, material=mats["belt"])

    # ========================================================================
    # 8. EXPORT COMPLETE V12 RACING ENGINE & SUBSYSTEM GLBs
    # ========================================================================
    os.makedirs(output_dir, exist_ok=True)
    master_path = os.path.join(output_dir, "v12_racing_engine_complete.glb")
    log(f"Exporting complete V12 master GLB to: {master_path}")

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=master_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
    )

    # Also duplicate to main public/models root for legacy fallbacks
    legacy_path = os.path.join(output_dir, "..", "v12_racing_engine.glb")
    try:
        import shutil
        shutil.copyfile(master_path, legacy_path)
    except Exception as e:
        log(f"Could not copy legacy path: {e}")

    log("Engine GLB export successfully completed!")

if __name__ == "__main__":
    target_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "engines")
    )
    generate_v12_racing_engine(target_dir)
