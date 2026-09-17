"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 9
Subsystem 48: Front & Rear Anti-Roll Bar Drop Links & Mounting Bushings
Subsystem 49: Air Conditioning Refrigerant Lines & Service Ports
"""

PART_FTYPE_EXTRA9 = '''
# ----------------------------------------------------------------------------
# 48. SUBSYSTEM 48: ANTI-ROLL BAR DROP LINKS & URETHANE BUSHINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sway_bar_drop_links(parent_col, mats):
    """
    Constructs the precision ball-jointed sway bar end links:
    - Front drop links connecting tubular stabilizer bar to front suspension strut bodies.
    - Rear vertical drop links linking rear sway bar to lower wishbones.
    - Anodized aluminum link rods with sealed dust-booted ball sockets.
    """
    objs = []
    bm_links = bmesh.new()

    link_data = [
        # Axle,    Y_pos,  Link_X, Z_low,  Z_high
        ("Front",  1.311,  0.640,  0.240,  0.420),
        ("Rear",  -1.311,  0.660,  0.220,  0.380),
    ]

    for ax_name, ay, lx, z_lo, z_hi in link_data:
        for lx_sign in [-1.0, 1.0]:
            p_lo = Vector((lx_sign * lx, ay + 0.120, z_lo))
            p_hi = Vector((lx_sign * (lx * 0.95), ay + 0.080, z_hi))
            mid_l = (p_lo + p_hi) * 0.5
            mat_link = Matrix.Translation(mid_l) @ Vector((0, 0, 1)).rotation_difference(p_hi - p_lo).to_matrix().to_4x4()

            # Connecting Link Rod
            bmesh.ops.create_cylinder(bm_links, radius=0.008, depth=(p_hi - p_lo).length, segments=10, matrix=mat_link)
            # Upper Ball Joint
            mat_ubj = Matrix.Translation(p_hi)
            bmesh.ops.create_cylinder(bm_links, radius=0.016, depth=0.030, segments=12, matrix=mat_ubj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
            # Lower Ball Joint
            mat_lbj = Matrix.Translation(p_lo)
            bmesh.ops.create_cylinder(bm_links, radius=0.016, depth=0.030, segments=12, matrix=mat_lbj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_links = link_obj("GEO_FTYPE_Sway_Bar_Drop_Links", bm_links, parent_col, mats["alloy"], bevel=0.0008)
    objs.append(obj_links)
    return objs


# ----------------------------------------------------------------------------
# 49. SUBSYSTEM 49: AIR CONDITIONING LINES & HIGH-PRESSURE PORTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ac_refrigerant_lines(parent_col, mats):
    """
    Constructs the dual-circuit air conditioning refrigerant plumbing:
    - High-pressure aluminum AC hardline routed along passenger inner fender apron.
    - Low-pressure insulated suction hose connecting compressor to firewall evaporator.
    - High and low side R134a/R1234yf charging valve service ports with color-coded caps.
    """
    objs = []
    bm_ac = bmesh.new()

    # AC Compressor Housing (Lower right of engine block: X = 0.280m, Y = 1.420m, Z = 0.320m)
    mat_comp = Matrix.Translation(Vector((0.280, 1.420, 0.320)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.065, depth=0.160, segments=16, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # High-Pressure Line (Compressor to front condenser: Y = +1.420m to +1.880m)
    p_comp = Vector((0.280, 1.420, 0.360))
    p_cond = Vector((0.240, 1.880, 0.440))
    mid_ac = (p_comp + p_cond) * 0.5
    mat_acline = Matrix.Translation(mid_ac) @ Vector((0, 0, 1)).rotation_difference(p_cond - p_comp).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.010, depth=(p_cond - p_comp).length, segments=10, matrix=mat_acline)

    # Low-Pressure Line (Compressor to firewall: Y = +1.420m to +0.840m)
    p_firewall = Vector((0.340, 0.840, 0.680))
    mid_ac2 = (p_comp + p_firewall) * 0.5
    mat_acline2 = Matrix.Translation(mid_ac2) @ Vector((0, 0, 1)).rotation_difference(p_firewall - p_comp).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.014, depth=(p_firewall - p_comp).length, segments=12, matrix=mat_acline2)

    # Service Port Charging Valves
    mat_port1 = Matrix.Translation(Vector((0.360, 1.120, 0.650)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.024, segments=10, matrix=mat_port1)

    obj_ac = link_obj("GEO_FTYPE_AC_Refrigerant_Plumbing", bm_ac, parent_col, mats["alloy"], bevel=0.0008)
    objs.append(obj_ac)
    return objs
'''
