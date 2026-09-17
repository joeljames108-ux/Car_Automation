"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 4
Subsystem 30: Performance Sport Bucket Seats & Headrests
Subsystem 31: Center Console Tunnel Spine & Configurable Dynamics Switchgear
Subsystem 32: Sport Aluminum Foot Pedals & Dead Pedal Footrest
"""

PART_FTYPE_EXTRA4 = '''
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 30: PERFORMANCE SPORT BUCKET SEATS & EMBOSSED HEADRESTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sport_bucket_seats(parent_col, mats):
    """
    Constructs the driver and passenger lightweight performance sport seats:
    - High-bolstered ergonomic seat bottom cushions with leather/alcantara inserts.
    - Contoured seat backrests with pronounced lateral kidney and shoulder wings.
    - Integrated aerodynamic headrests aligned directly ahead of the safety roll hoops.
    - Recessed aluminum seat harness eyelet cutouts below headrests.
    """
    objs = []
    bm_seats = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.360
        sy = -0.240
        sz = 0.460

        # 1. Seat Bottom Cushion (Contoured bucket base)
        mat_base = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_base @ Matrix.Diagonal(Vector((0.440, 0.460, 0.120, 1.0))))

        # Lateral Thigh Support Bolsters (Left and Right of cushion)
        for bx_sign in [-1.0, 1.0]:
            mat_tbol = mat_base @ Matrix.Translation(Vector((bx_sign * 0.200, 0.020, 0.060)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_tbol @ Matrix.Diagonal(Vector((0.070, 0.440, 0.090, 1.0))))

        # 2. Reclined Seat Backrest (Rake angle ~18 degrees, Y: -0.240m to -0.420m, Z: 0.520m to 0.980m)
        mat_back = Matrix.Translation(Vector((sx, sy - 0.160, sz + 0.320))) @ Euler((math.radians(-18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.420, 0.120, 0.520, 1.0))))

        # Lateral Kidney Support Wings
        for kx_sign in [-1.0, 1.0]:
            mat_kwing = mat_back @ Matrix.Translation(Vector((kx_sign * 0.190, 0.050, -0.040)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_kwing @ Matrix.Diagonal(Vector((0.080, 0.110, 0.340, 1.0))))

        # 3. Integrated Headrest Apex (Z = 0.960m to 1.080m, directly ahead of roll hoops)
        mat_head = mat_back @ Matrix.Translation(Vector((0, 0.020, 0.320)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.240, 0.110, 0.180, 1.0))))

        # Harness Pass-Through Cutout Bezel
        mat_eyelet = mat_back @ Matrix.Translation(Vector((0, 0.015, 0.180)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_eyelet @ Matrix.Diagonal(Vector((0.180, 0.130, 0.040, 1.0))))

    obj_seats = link_obj("GEO_FTYPE_Sport_Bucket_Seats", bm_seats, parent_col, mats["satin_black"], bevel=0.002)
    objs.append(obj_seats)
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 31: CENTER CONSOLE & TRANSMISSION TUNNEL SPINE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_center_console(parent_col, mats):
    """
    Constructs the cockpit center console architecture:
    - High central transmission tunnel spine separating driver and passenger cocoons.
    - SportShift pistol-grip electronic gear selector lever.
    - Configurable Dynamics mode toggle switch (Checkered flag dynamic mode selector).
    - Center armrest storage compartment and cup holder cover.
    """
    objs = []
    bm_console = bmesh.new()

    # 1. Main Center Console Tunnel Spine (Y: -0.520m to +0.480m, Z = 0.440m to 0.680m)
    mat_tun = Matrix.Translation(Vector((0.0, -0.020, 0.540)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_tun @ Matrix.Diagonal(Vector((0.260, 0.980, 0.220, 1.0))))

    # 2. Forward Gear Selector Sloping Plinth (Y = +0.220m, Z = 0.620m)
    mat_plinth = Matrix.Translation(Vector((0.0, 0.220, 0.620))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_plinth @ Matrix.Diagonal(Vector((0.220, 0.280, 0.060, 1.0))))

    # SportShift Pistol-Grip Gear Shifter Lever
    mat_shifter = mat_plinth @ Matrix.Translation(Vector((-0.030, 0.040, 0.060)))
    # Shifter Stalk
    bmesh.ops.create_cylinder(bm_console, radius=0.012, depth=0.070, segments=12, matrix=mat_shifter)
    # Leather/Chrome Shifter Grip
    mat_grip = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.045))) @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_grip @ Matrix.Diagonal(Vector((0.042, 0.065, 0.040, 1.0))))

    # 3. Dynamic Mode Checkered Flag Toggle Switch
    mat_toggle = mat_plinth @ Matrix.Translation(Vector((0.055, 0.020, 0.040)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_toggle @ Matrix.Diagonal(Vector((0.024, 0.045, 0.015, 1.0))))

    # 4. Center Console Padded Armrest / Cubby Lid (Y = -0.280m, Z = 0.660m)
    mat_arm = Matrix.Translation(Vector((0.0, -0.280, 0.660)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.240, 0.340, 0.045, 1.0))))

    obj_console = link_obj("GEO_FTYPE_Center_Console_Tunnel", bm_console, parent_col, mats["satin_black"], bevel=0.0015)
    objs.append(obj_console)
    return objs


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 32: DRIVER SPORT PEDAL BOX
# ----------------------------------------------------------------------------

def build_jaguar_ftype_pedal_box(parent_col, mats):
    """
    Constructs the driver-side aluminum sports pedals:
    - Floor-hinged brushed aluminum organ-style accelerator pedal with rubber traction grip studs.
    - Suspended cast aluminum brake pedal arm and anti-slip pad.
    - Slanted brushed aluminum dead pedal footrest in left footwell corner.
    """
    objs = []
    bm_pedals = bmesh.new()

    # Coordinates in Driver Footwell (X = -0.340m, Y = +0.550m, Z = 0.240m to 0.420m)
    # 1. Floor-Hinged Accelerator Pedal
    mat_acc = Matrix.Translation(Vector((-0.260, 0.580, 0.300))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_acc @ Matrix.Diagonal(Vector((0.045, 0.140, 0.015, 1.0))))

    # 2. Suspended Brake Pedal
    mat_brk = Matrix.Translation(Vector((-0.340, 0.540, 0.350))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brk @ Matrix.Diagonal(Vector((0.075, 0.075, 0.020, 1.0))))
    # Brake Lever Arm
    bmesh.ops.create_cylinder(bm_pedals, radius=0.010, depth=0.180, segments=10, matrix=mat_brk @ Matrix.Translation(Vector((0, 0, 0.090))))

    # 3. Slanted Dead Pedal Footrest (Outboard left wall)
    mat_dead = Matrix.Translation(Vector((-0.440, 0.620, 0.320))) @ Euler((math.radians(40), math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.070, 0.220, 0.020, 1.0))))

    obj_pedals = link_obj("GEO_FTYPE_Sport_Pedals", bm_pedals, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_pedals)
    return objs
'''
