import fs from "node:fs";
import path from "node:path";

const targetFile = path.resolve("scripts/blender/generate_interactive_dashboard_master.py");
let content = fs.readFileSync(targetFile, "utf8");

// 1. Update cabin enclosure
const oldCabin = `    # Roof Headliner in dark charcoal Alcantara (contoured with recess)
    make_box("CABIN_ROOF_LINER", (0.0, -0.40, 1.25), (dash_w * 1.02, 1.30, 0.04), mats["headliner_alcantara"], bevel=0.015, parent=cabin_group)
    # Overhead Center Dome Light Console & Reading Lamps
    make_box("CABIN_DOME_CONSOLE", (0.0, -0.16, 1.222), (0.19, 0.24, 0.024), mats["piano_black"], bevel=0.005, parent=cabin_group)
    make_cylinder("DOME_LAMP_L", (-0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_cylinder("DOME_LAMP_R", (0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_box("DOME_SUNGLASS_HATCH", (0.0, -0.22, 1.218), (0.12, 0.06, 0.012), mats["charcoal_trim"], bevel=0.002, parent=cabin_group)
    # Rear Cabin Bulkhead Partition
    make_box("CABIN_REAR_BULKHEAD", (0.0, -1.05, 0.65), (dash_w * 1.02, 0.045, 1.18), mats["charcoal_trim"], bevel=0.012, parent=cabin_group)`;

const newCabin = `    # Roof Headliner in dark charcoal Alcantara (extended full 3-row cabin length)
    make_box("CABIN_ROOF_LINER", (0.0, -1.30, 1.25), (dash_w * 1.02, 3.20, 0.04), mats["headliner_alcantara"], bevel=0.015, parent=cabin_group)
    # Dual Panoramic Moonroof with Optical Glass
    make_box("CABIN_PANORAMIC_MOONROOF", (0.0, -1.30, 1.26), (dash_w * 0.70, 2.20, 0.015), mats["glass_optical"], bevel=0.005, parent=cabin_group)
    # Full Cabin Carpeted Floor Structure
    make_box("CABIN_CARPET_FLOOR", (0.0, -1.25, 0.02), (dash_w * 0.98, 3.10, 0.03), mats["charcoal_trim"], bevel=0.005, parent=cabin_group)
    # Overhead Center Dome Light Console & Reading Lamps
    make_box("CABIN_DOME_CONSOLE", (0.0, -0.16, 1.222), (0.19, 0.24, 0.024), mats["piano_black"], bevel=0.005, parent=cabin_group)
    make_cylinder("DOME_LAMP_L", (-0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_cylinder("DOME_LAMP_R", (0.052, -0.15, 1.212), 0.018, 0.005, (0, 0, 0), mats["glass_optical"], vertices=24, parent=cabin_group)
    make_box("DOME_SUNGLASS_HATCH", (0.0, -0.22, 1.218), (0.12, 0.06, 0.012), mats["charcoal_trim"], bevel=0.002, parent=cabin_group)
    # Mid-Cabin B-Pillar Trim Liners
    make_box("CABIN_B_PILLAR_L", (-dash_w * 0.49, -0.92, 0.74), (0.05, 0.12, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    make_box("CABIN_B_PILLAR_R", (dash_w * 0.49, -0.92, 0.74), (0.05, 0.12, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    # Rear C-Pillar Trim Liners
    make_box("CABIN_C_PILLAR_L", (-dash_w * 0.49, -1.82, 0.74), (0.05, 0.14, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    make_box("CABIN_C_PILLAR_R", (dash_w * 0.49, -1.82, 0.74), (0.05, 0.14, 0.98), mats["headliner_alcantara"], bevel=0.01, parent=cabin_group)
    # Rear Cabin Cargo Bulkhead Partition (Relocated behind Row 3)
    make_box("CABIN_REAR_BULKHEAD", (0.0, -2.85, 0.65), (dash_w * 1.02, 0.045, 1.18), mats["charcoal_trim"], bevel=0.012, parent=cabin_group)`;

if (!content.includes(oldCabin)) {
  console.error("Error: oldCabin chunk not found");
  process.exit(1);
}
content = content.replace(oldCabin, newCabin);
console.log("[1/3] Cabin enclosure updated.");

// 2. Add make_sculpted_seat_unit helper function before build_class_a_interactive_dashboard
const helperSearch = `def build_class_a_interactive_dashboard():`;

const seatHelperCode = `def make_sculpted_seat_unit(prefix, sx, cy, cz, width=0.46, length=0.46, back_h=0.56, is_center=False, has_shell=True, mats=None, parent=None, buckle_side="R"):
    """Procedural Class-A sculpted seat unit with bmesh bolsters, anatomical backrest, headrest, and seatbelt."""
    # Cushion
    bm_c = bmesh.new()
    nx, ny = (16, 14) if not is_center else (12, 12)
    w, l = width, length
    verts_c = []
    for j in range(ny + 1):
        v = j / ny
        y = cy + (v - 0.5) * l
        front_lift = 0.025 * math.sin(v * math.pi * 0.5)
        for i in range(nx + 1):
            u = i / nx
            x = sx + (u - 0.5) * w
            lat = abs(u - 0.5) * 2.0
            bolster_z = (0.065 if not is_center else 0.035) * (lat ** 2.0)
            center_dip = -0.012 * (1.0 - lat ** 2)
            flutes = 0.004 * math.sin(v * math.pi * 6.0) * (1.0 - lat ** 2)
            z = cz + front_lift + bolster_z + center_dip + flutes
            verts_c.append(bm_c.verts.new((x, y, z)))
    bm_c.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = verts_c[j * (nx + 1) + i]
            v2 = verts_c[j * (nx + 1) + i + 1]
            v3 = verts[(j + 1) * (nx + 1) + i + 1] if false else verts_c[(j + 1) * (nx + 1) + i + 1]
            v4 = verts_c[(j + 1) * (nx + 1) + i]
            bm_c.faces.new((v1, v2, v3, v4))
    for f in bm_c.faces: f.smooth = True
    m_c = bpy.data.meshes.new(f"SEAT_CUSHION_{prefix}_Mesh")
    bm_c.to_mesh(m_c)
    bm_c.free()
    obj_c = bpy.data.objects.new(f"SEAT_CUSHION_{prefix}", m_c)
    bpy.context.scene.collection.objects.link(obj_c)
    sol_c = obj_c.modifiers.new("Solidify", 'SOLIDIFY')
    sol_c.thickness = 0.075
    bpy.context.view_layer.objects.active = obj_c
    bpy.ops.object.modifier_apply(modifier="Solidify")
    obj_c.data.materials.append(mats["leather_ebony"])
    attach_to_parent(obj_c, parent)

    # Backrest
    bm_b = bmesh.new()
    bx_cnt, by_cnt = (18, 20) if not is_center else (14, 16)
    bw, bh = width * 0.96, back_h
    by_start = cy - l * 0.45
    bz_start = cz + 0.10
    verts_b = []
    for j in range(by_cnt + 1):
        v = j / by_cnt
        recline_y = -0.15 * v
        lumbar = 0.022 * math.sin(v * math.pi * 1.5)
        y = by_start + recline_y - lumbar
        z = bz_start + v * bh
        width_mod = 1.0 + (0.18 * math.sin((v - 0.65) / 0.35 * math.pi) if (v > 0.65 and not is_center) else 0.0)
        for i in range(bx_cnt + 1):
            u = i / bx_cnt
            lat = abs(u - 0.5) * 2.0
            x = sx + (u - 0.5) * bw * width_mod
            bolster_wrap = (0.070 if not is_center else 0.030) * (lat ** 2.0)
            flutes_b = 0.004 * math.sin(v * math.pi * 8.0) * (1.0 - lat ** 2)
            verts_b.append(bm_b.verts.new((x, y + bolster_wrap - flutes_b, z)))
    bm_b.verts.ensure_lookup_table()
    for j in range(by_cnt):
        for i in range(bx_cnt):
            v1 = verts_b[j * (bx_cnt + 1) + i]
            v2 = verts_b[j * (bx_cnt + 1) + i + 1]
            v3 = verts_b[(j + 1) * (bx_cnt + 1) + i + 1]
            v4 = verts_b[(j + 1) * (bx_cnt + 1) + i]
            bm_b.faces.new((v1, v2, v3, v4))
    for f in bm_b.faces: f.smooth = True
    m_b = bpy.data.meshes.new(f"SEAT_BACKREST_{prefix}_Mesh")
    bm_b.to_mesh(m_b)
    bm_b.free()
    obj_b = bpy.data.objects.new(f"SEAT_BACKREST_{prefix}", m_b)
    bpy.context.scene.collection.objects.link(obj_b)
    sol_b = obj_b.modifiers.new("Solidify", 'SOLIDIFY')
    sol_b.thickness = 0.055
    bpy.context.view_layer.objects.active = obj_b
    bpy.ops.object.modifier_apply(modifier="Solidify")
    obj_b.data.materials.append(mats["leather_ebony"])
    attach_to_parent(obj_b, parent)

    # Shell (if requested)
    if has_shell and not is_center:
        bm_sh = bmesh.new()
        sh_nx, sh_ny = 14, 18
        verts_sh = []
        for j in range(sh_ny + 1):
            v = j / sh_ny
            recline_y = -0.15 * v
            lumbar = 0.022 * math.sin(v * math.pi * 1.5)
            y = (by_start - 0.05) + recline_y - lumbar
            z = bz_start + v * bh
            for i in range(sh_nx + 1):
                u = i / sh_nx
                lat = abs(u - 0.5) * 2.0
                x = sx + (u - 0.5) * (bw + 0.02)
                shell_wrap = 0.08 * (lat ** 2.2)
                verts_sh.append(bm_sh.verts.new((x, y + shell_wrap, z)))
        bm_sh.verts.ensure_lookup_table()
        for j in range(sh_ny):
            for i in range(sh_nx):
                v1 = verts_sh[j * (sh_nx + 1) + i]
                v2 = verts_sh[j * (sh_nx + 1) + i + 1]
                v3 = verts_sh[(j + 1) * (sh_nx + 1) + i + 1]
                v4 = verts_sh[(j + 1) * (sh_nx + 1) + i]
                bm_sh.faces.new((v1, v2, v3, v4))
        for f in bm_sh.faces: f.smooth = True
        m_sh = bpy.data.meshes.new(f"SEAT_SHELL_{prefix}_Mesh")
        bm_sh.to_mesh(m_sh)
        bm_sh.free()
        obj_sh = bpy.data.objects.new(f"SEAT_SHELL_{prefix}", m_sh)
        bpy.context.scene.collection.objects.link(obj_sh)
        sol_sh = obj_sh.modifiers.new("Solidify", 'SOLIDIFY')
        sol_sh.thickness = 0.016
        bpy.context.view_layer.objects.active = obj_sh
        bpy.ops.object.modifier_apply(modifier="Solidify")
        obj_sh.data.materials.append(mats["charcoal_trim"])
        attach_to_parent(obj_sh, parent)

    # Headrest
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=20, ring_count=14, radius=0.10 if not is_center else 0.08,
        location=(sx, by_start - 0.18, bz_start + bh + 0.11)
    )
    hr = bpy.context.active_object
    hr.name = f"SEAT_HEADREST_{prefix}"
    hr.scale = (1.10, 0.55, 0.85)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for p in hr.data.polygons: p.use_smooth = True
    hr.data.materials.append(mats["leather_ebony"])
    attach_to_parent(hr, parent)

    # Seatbelt Buckle & Strap
    buckle_offset_x = 0.14 if buckle_side == "R" else -0.14
    make_box(f"SEATBELT_BUCKLE_{prefix}", (sx + buckle_offset_x, cy - 0.02, cz + 0.14), (0.030, 0.050, 0.065), mats["charcoal_trim"], bevel=0.002, parent=parent)
    make_box(f"SEATBELT_RED_BTN_{prefix}", (sx + buckle_offset_x, cy - 0.02, cz + 0.175), (0.022, 0.030, 0.007), mats["gauge_needle_red"], bevel=0.001, parent=parent)
    strap_rot = Euler((math.radians(35), math.radians(-14 if buckle_side == "R" else 14), 0))
    make_box(f"SEATBELT_STRAP_{prefix}", (sx, cy - 0.22, cz + 0.35), (0.045, 0.003, 0.60), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=parent)

`;

if (!content.includes(helperSearch)) {
  console.error("Error: helperSearch not found");
  process.exit(1);
}
content = content.replace(helperSearch, seatHelperCode + helperSearch);
console.log("[2/3] Seat helper function injected.");

// 3. Inject Row 2 and Row 3 modeling logic after front seat loop
const frontSeatsEnd = `        strap_rot = Euler((math.radians(35), math.radians(-15 if s_side == "DRIVER" else 15), 0))
        make_box(f"SEATBELT_STRAP_{s_side}", (sx, -0.62, 0.55), (0.048, 0.003, 0.65), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=seats_group)`;

const rearSeatsLogic = `        strap_rot = Euler((math.radians(35), math.radians(-15 if s_side == "DRIVER" else 15), 0))
        make_box(f"SEATBELT_STRAP_{s_side}", (sx, -0.62, 0.55), (0.048, 0.003, 0.65), mats["seatbelt_red"], rot_euler=strap_rot, bevel=0, parent=seats_group)

    # ------------------------------------------------------------------------
    # 9.B. ROW 2 SEATS (Back Seats / Second Row Cabin)
    # ------------------------------------------------------------------------
    log("9.B Modeling ROW 2 SEATS (Outboard L/R, Center Bench, Fold-Down Armrest, Captain Console)...")
    seats_row2_group = bpy.data.objects.new("SEATS_ROW2", None)
    bpy.context.scene.collection.objects.link(seats_row2_group)
    attach_to_parent(seats_row2_group, cockpit_master)

    r2_y = -1.35
    r2_z = 0.22

    # Left & Right Outboard Seats (Row 2)
    make_sculpted_seat_unit("ROW2_L", -0.42, r2_y, r2_z, width=0.46, length=0.48, back_h=0.56, is_center=False, has_shell=True, mats=mats, parent=seats_row2_group, buckle_side="R")
    make_sculpted_seat_unit("ROW2_R", 0.42, r2_y, r2_z, width=0.46, length=0.48, back_h=0.56, is_center=False, has_shell=True, mats=mats, parent=seats_row2_group, buckle_side="L")

    # Center Seat for Row 2 (40/20/40 Split Bench)
    make_sculpted_seat_unit("ROW2_C", 0.0, r2_y, r2_z, width=0.34, length=0.46, back_h=0.52, is_center=True, has_shell=False, mats=mats, parent=seats_row2_group, buckle_side="R")

    # Executive Fold-Down Center Armrest (Positioned in center of Row 2)
    make_box("SEAT_ROW2_ARMREST_CONSOLE", (0.0, r2_y - 0.04, r2_z + 0.22), (0.24, 0.38, 0.12), mats["leather_ebony"], bevel=0.012, parent=seats_row2_group)
    make_cylinder("REAR_ARMREST_CUPHOLDER_L", (-0.055, r2_y + 0.06, r2_z + 0.28), 0.035, 0.045, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_cylinder("REAR_ARMREST_CUPHOLDER_R", (0.055, r2_y + 0.06, r2_z + 0.28), 0.035, 0.045, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_box("REAR_ARMREST_TOUCH_SCREEN", (0.0, r2_y - 0.08, r2_z + 0.285), (0.14, 0.08, 0.005), mats["screen_infotainment"], bevel=0.002, parent=seats_row2_group)

    # Executive Captain Chairs Center Console (For VIP / 6-7 Seater Luxury)
    make_box("SEAT_ROW2_CAPTAIN_CONSOLE", (0.0, r2_y, r2_z + 0.12), (0.22, 0.72, 0.26), mats["charcoal_trim"], bevel=0.015, parent=seats_row2_group)
    make_box("REAR_CAPTAIN_TRIM_SPEAR", (0.0, r2_y, r2_z + 0.255), (0.20, 0.68, 0.010), mats["wood_walnut"], bevel=0.003, parent=seats_row2_group)
    make_cylinder("REAR_CAPTAIN_CUPHOLDER_1", (0.0, r2_y + 0.16, r2_z + 0.26), 0.038, 0.050, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)
    make_cylinder("REAR_CAPTAIN_CUPHOLDER_2", (0.0, r2_y + 0.06, r2_z + 0.26), 0.038, 0.050, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row2_group)

    # ------------------------------------------------------------------------
    # 9.C. REAR CABIN AMENITIES (Entertainment, Climate, Tables)
    # ------------------------------------------------------------------------
    log("9.C Modeling REAR CABIN AMENITIES (Rear HVAC Console, Seatback OLEDs, Theater Screen, Tray Tables)...")
    rear_amenities_group = bpy.data.objects.new("REAR_AMENITIES", None)
    bpy.context.scene.collection.objects.link(rear_amenities_group)
    attach_to_parent(rear_amenities_group, cockpit_master)

    # Rear HVAC Center Console (Mounted behind front center console)
    make_box("REAR_CONSOLE_HVAC", (0.0, -0.74, 0.44), (0.26, 0.14, 0.26), mats["charcoal_trim"], bevel=0.010, parent=rear_amenities_group)
    make_box("REAR_HVAC_VENT_L", (-0.06, -0.795, 0.50), (0.08, 0.02, 0.045), mats["aluminum_brushed"], bevel=0.002, parent=rear_amenities_group)
    make_box("REAR_HVAC_VENT_R", (0.06, -0.795, 0.50), (0.08, 0.02, 0.045), mats["aluminum_brushed"], bevel=0.002, parent=rear_amenities_group)
    make_box("REAR_HVAC_SCREEN", (0.0, -0.802, 0.43), (0.12, 0.015, 0.05), mats["screen_infotainment"], bevel=0.002, parent=rear_amenities_group)
    make_cylinder("REAR_HVAC_DIAL_L", (-0.06, -0.805, 0.36), 0.016, 0.014, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=24, parent=rear_amenities_group)
    make_cylinder("REAR_HVAC_DIAL_R", (0.06, -0.805, 0.36), 0.016, 0.014, (math.radians(90), 0, 0), mats["aluminum_brushed"], vertices=24, parent=rear_amenities_group)

    # Dual 11.6" Seatback 4K OLED Entertainment Displays (on front seatbacks)
    make_box("REAR_SEATBACK_SCREEN_L", (driver_x, -0.84, 0.68), (0.28, 0.015, 0.17), mats["screen_infotainment"], bevel=0.003, parent=rear_amenities_group)
    make_box("REAR_SEATBACK_SCREEN_R", (pass_x, -0.84, 0.68), (0.28, 0.015, 0.17), mats["screen_infotainment"], bevel=0.003, parent=rear_amenities_group)

    # Billet Aluminum Folding Tray Tables (on front seatbacks)
    make_box("REAR_FOLDING_TABLE_L", (driver_x, -0.82, 0.50), (0.32, 0.20, 0.012), mats["aluminum_brushed"], bevel=0.004, parent=rear_amenities_group)
    make_box("REAR_FOLDING_TABLE_R", (pass_x, -0.82, 0.50), (0.32, 0.20, 0.012), mats["aluminum_brushed"], bevel=0.004, parent=rear_amenities_group)

    # Ceiling-Deployable 31" 8K Panoramic Theater Screen
    make_box("REAR_THEATER_SCREEN_31IN", (0.0, -0.96, 1.16), (0.80, 0.018, 0.25), mats["screen_infotainment"], bevel=0.004, parent=rear_amenities_group)

    # ------------------------------------------------------------------------
    # 9.D. ROW 3 SEATS (Third Row for 7-Seater & 8-Seater)
    # ------------------------------------------------------------------------
    log("9.D Modeling ROW 3 SEATS (Third Row Outboard L/R, Center Seat, Side Armrests)...")
    seats_row3_group = bpy.data.objects.new("SEATS_ROW3", None)
    bpy.context.scene.collection.objects.link(seats_row3_group)
    attach_to_parent(seats_row3_group, cockpit_master)

    r3_y = -2.18
    r3_z = 0.28 # Elevated stadium seating height

    # Outboard Left and Right Seats (Row 3)
    make_sculpted_seat_unit("ROW3_L", -0.36, r3_y, r3_z, width=0.42, length=0.44, back_h=0.52, is_center=False, has_shell=True, mats=mats, parent=seats_row3_group, buckle_side="R")
    make_sculpted_seat_unit("ROW3_R", 0.36, r3_y, r3_z, width=0.42, length=0.44, back_h=0.52, is_center=False, has_shell=True, mats=mats, parent=seats_row3_group, buckle_side="L")

    # Center Seat for Row 3 (Active in 8-Seater Configuration)
    make_sculpted_seat_unit("ROW3_C", 0.0, r3_y, r3_z, width=0.32, length=0.44, back_h=0.50, is_center=True, has_shell=False, mats=mats, parent=seats_row3_group, buckle_side="R")

    # Third Row Quarter Trim Side Armrests with Cupholders
    make_box("ROW3_SIDE_ARMREST_L", (-0.60, r3_y, r3_z + 0.16), (0.12, 0.42, 0.10), mats["charcoal_trim"], bevel=0.010, parent=seats_row3_group)
    make_cylinder("ROW3_CUPHOLDER_L", (-0.60, r3_y + 0.08, r3_z + 0.21), 0.034, 0.040, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row3_group)
    make_box("ROW3_SIDE_ARMREST_R", (0.60, r3_y, r3_z + 0.16), (0.12, 0.42, 0.10), mats["charcoal_trim"], bevel=0.010, parent=seats_row3_group)
    make_cylinder("ROW3_CUPHOLDER_R", (0.60, r3_y + 0.08, r3_z + 0.21), 0.034, 0.040, (0, 0, 0), mats["aluminum_brushed"], vertices=24, parent=seats_row3_group)`;

if (!content.includes(frontSeatsEnd)) {
  console.error("Error: frontSeatsEnd not found");
  process.exit(1);
}
content = content.replace(frontSeatsEnd, rearSeatsLogic);
console.log("[3/3] Rear seats logic injected successfully.");

fs.writeFileSync(targetFile, content, "utf8");
console.log("Successfully updated generate_interactive_dashboard_master.py!");
