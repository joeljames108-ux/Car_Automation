"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 1
Subsystem 14:
- Subsystem 14: Grand Tourer Cockpit Tub, 2+2 Seat Pods, Flying Wing Dashboard & Center Console Silhouette
"""

PART_BENTLEY_EXTRA1 = '''
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 14: GRAND TOURER COCKPIT TUB, SEATS & DASHBOARD SILHOUETTE
# ----------------------------------------------------------------------------

def build_bentley_cockpit_silhouette(parent_col, mats):
    """
    Constructs the luxurious open-top grand tourer cockpit architecture:
    - Bentley "Flying Wing" symmetrical dashboard cowl sweeping into door waistlines.
    - Deeply contoured GT front sports seats with integrated headrests and Speed bolsters.
    - Sculpted rear 2-passenger bucket seating pods with central leather cascade divider.
    - Center console waterfall bridge housing the Breitling clock pod and gear selector.
    - 3-spoke sports steering wheel with aluminum knurled shift paddles and column shroud.
    """
    objs = []
    bm_seats = bmesh.new()
    bm_dash = bmesh.new()
    bm_console = bmesh.new()

    # 1. Flying Wing Dashboard Structure (Y: +0.220m to +0.580m, Z: 0.650m to 0.880m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.400, 0.740)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.380, 0.320, 0.180, 1.0))))

    # Driver & Passenger Dual Cowl Binnacles (Left Driver side and Right Co-pilot side)
    for cowl_sign in [-1.0, 1.0]:
        mat_cowl = mat_dash @ Matrix.Translation(Vector((cowl_sign * 0.420, 0.040, 0.090)))
        bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.440, 0.180, 0.060, 1.0))))

    # Bentley Rotating Display Center Console Screen Face (Z = 0.760m, Y = 0.420m)
    mat_screen = mat_dash @ Matrix.Translation(Vector((0.0, 0.060, 0.030)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.260, 0.040, 0.120, 1.0))))

    # 2. Elevated Center Console Waterfall Bridge (Y: -0.550m to +0.380m, Z: 0.360m to 0.580m)
    mat_bridge = Matrix.Translation(Vector((0.0, -0.080, 0.480)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_bridge @ Matrix.Diagonal(Vector((0.280, 0.920, 0.220, 1.0))))

    # Knurled Drive Dynamics Mode Selector Dial & Speed T-Bar Gear Shifter
    mat_dial = mat_bridge @ Matrix.Translation(Vector((0.0, 0.120, 0.120)))
    bmesh.ops.create_cylinder(bm_console, radius=0.035, depth=0.024, segments=18, matrix=mat_dial)
    mat_shifter = mat_bridge @ Matrix.Translation(Vector((0.0, 0.220, 0.160)))
    bmesh.ops.create_cylinder(bm_console, radius=0.022, depth=0.090, segments=16, matrix=mat_shifter)

    # 3. 3-Spoke Sport Steering Wheel & Column (Driver LHD, X = -0.420m, Y = 0.260m, Z = 0.780m)
    mat_whl_col = Matrix.Translation(Vector((-0.420, 0.260, 0.780))) @ Euler((-math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Steering Wheel Outer Rim (Torus, Radius = 0.180m, Tube Radius = 0.016m)
    bmesh.ops.create_torus(bm_console, major_radius=0.180, minor_radius=0.016, major_segments=28, minor_segments=12, matrix=mat_whl_col)
    # Center Horn Pad with Winged 'B' Badge Roundel
    bmesh.ops.create_cylinder(bm_console, radius=0.052, depth=0.032, segments=20, matrix=mat_whl_col)
    # Steering Column Shroud
    bmesh.ops.create_cylinder(bm_dash, radius=0.048, depth=0.220, segments=16, matrix=mat_whl_col @ Matrix.Translation(Vector((0, 0, -0.110))))
    # Aluminum Shift Paddles Behind Steering Wheel
    for pad_sign in [-1.0, 1.0]:
        mat_pad = mat_whl_col @ Matrix.Translation(Vector((pad_sign * 0.135, 0.0, -0.040)))
        bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.018, 0.010, 0.095, 1.0))))

    # 4. GT Contour Front Sport Bucket Seats (Left Driver & Right Passenger, Y = -0.180m, Z = 0.440m)
    for seat_sign in [-1.0, 1.0]:
        mat_seat = Matrix.Translation(Vector((seat_sign * 0.420, -0.180, 0.440)))
        # Lower Cushion Base with Thigh Extension
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_seat @ Matrix.Diagonal(Vector((0.480, 0.520, 0.140, 1.0))))
        # Lateral Thigh Bolster Wings
        for th_sign in [-1.0, 1.0]:
            mat_thigh = mat_seat @ Matrix.Translation(Vector((th_sign * 0.210, 0.020, 0.050)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_thigh @ Matrix.Diagonal(Vector((0.075, 0.480, 0.090, 1.0))))

        # High-Back Seat Rest canted backward 18 degrees
        mat_back = mat_seat @ Matrix.Translation(Vector((0.0, -0.220, 0.320))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.460, 0.130, 0.580, 1.0))))
        # Lateral Torso Bolster Wings
        for tor_sign in [-1.0, 1.0]:
            mat_tor = mat_back @ Matrix.Translation(Vector((tor_sign * 0.200, 0.040, -0.040)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_tor @ Matrix.Diagonal(Vector((0.065, 0.140, 0.440, 1.0))))

        # Integrated Monolithic Headrest with Embroidered 'Speed' Logo
        mat_head = mat_back @ Matrix.Translation(Vector((0.0, 0.020, 0.340)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.240, 0.110, 0.180, 1.0))))

    # 5. Sculpted Rear 2-Passenger Bucket Seats (Y = -0.760m, Z = 0.480m)
    for rseat_sign in [-1.0, 1.0]:
        mat_rseat = Matrix.Translation(Vector((rseat_sign * 0.360, -0.760, 0.480)))
        # Rear Seat Cushion Base
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rseat @ Matrix.Diagonal(Vector((0.420, 0.440, 0.120, 1.0))))
        # Rear Seat Backrest
        mat_rback = mat_rseat @ Matrix.Translation(Vector((0.0, -0.180, 0.240))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rback @ Matrix.Diagonal(Vector((0.400, 0.110, 0.420, 1.0))))
        # Rear Headrest Pod
        mat_rhead = mat_rback @ Matrix.Translation(Vector((0.0, 0.020, 0.260)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rhead @ Matrix.Diagonal(Vector((0.220, 0.100, 0.150, 1.0))))

    obj_seats = link_obj("GEO_BENTLEY_GrandTourer_Leather_Seats", bm_seats, parent_col, mats["leather"], bevel=0.0025)
    obj_dash = link_obj("GEO_BENTLEY_FlyingWing_Dashboard_Fascia", bm_dash, parent_col, mats["piano_black"], bevel=0.0015)
    obj_console = link_obj("GEO_BENTLEY_Center_Console_and_Steering", bm_console, parent_col, mats["chrome"], bevel=0.0012)

    objs.extend([obj_seats, obj_dash, obj_console])
    return objs
'''
