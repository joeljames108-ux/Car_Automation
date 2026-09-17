"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part G
Subsystem 24: Frunk Needle-Felt Carpet, Leather Tool Roll & Spare Straps
Subsystem 25: Underbody Aero Undertrays & Dzus Quarter-Turn Fasteners
Subsystem 26: Cockpit Sport Seat Fluted Leather Pleats & Seat Controls
Subsystem 27: Cabriolet Rear Quarter Trim Panels & Hi-Fi Speaker Grilles
"""

PART_P2_G = '''
# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 24: FRUNK NEEDLE-FELT CARPET, TOOLKIT & STRAPS
# ----------------------------------------------------------------------------

def build_993_frunk_carpet_toolkit_and_straps(parent_col, mats):
    """
    Constructs the front luggage compartment (frunk) interior lining and tools:
    - High-pile anthracite needle-felt carpet lining the front luggage tub floor and walls.
    - Black leather tool roll pouch containing factory Porsche emergency tools:
      * Spark plug socket, fan belt wrench, open-end wrenches, and forged tow eye.
    - Leather spare tire hold-down straps with chrome cam-lock buckles.
    - Jack storage bracket and wheel chock clip.
    """
    objs = []
    bm_carpet = bmesh.new()
    bm_tools = bmesh.new()
    bm_straps = bmesh.new()

    # Frunk Luggage Compartment Floor & Walls (Y = +0.720m to +1.350m, Z = 0.350m to 0.620m)
    mat_f_floor = Matrix.Translation(Vector((0.0, 1.035, 0.355)))
    bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_floor @ Matrix.Diagonal(Vector((0.680, 0.580, 0.015, 1.0))))

    # Left & Right Carpeted Sidewalls
    for fx_sign in [-1.0, 1.0]:
        mat_f_wall = Matrix.Translation(Vector((fx_sign * 0.345, 1.035, 0.480)))
        bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_wall @ Matrix.Diagonal(Vector((0.016, 0.560, 0.250, 1.0))))

    # Front Bulkhead Carpet Wall
    mat_f_front = Matrix.Translation(Vector((0.0, 1.325, 0.480)))
    bmesh.ops.create_cube(bm_carpet, size=1.0, matrix=mat_f_front @ Matrix.Diagonal(Vector((0.680, 0.016, 0.250, 1.0))))

    # Factory Leather Tool Roll Pouch (Ahead of spare wheel, Y = +1.220m, Z = 0.440m)
    mat_tool_roll = Matrix.Translation(Vector((0.140, 1.220, 0.440))) @ Euler((0, 0, math.radians(15)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tools, radius=0.038, depth=0.240, segments=16, matrix=mat_tool_roll @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Leather Pouch Buckle Straps
    for b_off in [-0.070, 0.070]:
        mat_p_strap = mat_tool_roll @ Matrix.Translation(Vector((0, b_off, 0)))
        bmesh.ops.create_cylinder(bm_straps, radius=0.040, depth=0.012, segments=16, matrix=mat_p_strap @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Chrome Buckle
        mat_p_buckle = mat_p_strap @ Matrix.Translation(Vector((0, 0, 0.040)))
        bmesh.ops.create_cube(bm_tools, size=1.0, matrix=mat_p_buckle @ Matrix.Diagonal(Vector((0.018, 0.014, 0.008, 1.0))))

    # Forged Steel Emergency Tow Eye Hook (Stored in clip)
    mat_tow_eye = Matrix.Translation(Vector((-0.220, 1.240, 0.420))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_torus(bm_tools, major_radius=0.024, minor_radius=0.006, major_segments=16, minor_segments=8, matrix=mat_tow_eye)
    bmesh.ops.create_cylinder(bm_tools, radius=0.006, depth=0.120, segments=10, matrix=mat_tow_eye @ Matrix.Translation(Vector((0, 0, -0.065))))

    # Leather Spare Tire Tie-Down Y-Strap with Cam Buckle
    mat_spare_strap = Matrix.Translation(Vector((0.0, 0.950, 0.490)))
    bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_spare_strap @ Matrix.Diagonal(Vector((0.032, 0.440, 0.005, 1.0))))
    mat_s_buckle = mat_spare_strap @ Matrix.Translation(Vector((0, 0, 0.006)))
    bmesh.ops.create_cube(bm_tools, size=1.0, matrix=mat_s_buckle @ Matrix.Diagonal(Vector((0.042, 0.035, 0.012, 1.0))))

    obj_carpet = link_obj("GEO_993_Frunk_NeedleFelt_Carpet", bm_carpet, parent_col, mats["canvas"], bevel=0.001)
    obj_tools = link_obj("GEO_993_Frunk_ToolKit_and_TowEye", bm_tools, parent_col, mats["alloy"], bevel=0.0008)
    obj_straps = link_obj("GEO_993_Frunk_Spare_TieDown_Straps", bm_straps, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_carpet, obj_tools, obj_straps])
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 25: UNDERBODY AERO UNDERTRAYS & DZUS FASTENERS
# ----------------------------------------------------------------------------

def build_993_underbody_aero_undertrays_and_dzus_fasteners(parent_col, mats):
    """
    Constructs the smooth underbody aerodynamic belly pans and hardware:
    - Front steering gear and sway bar protective aerodynamic pan.
    - Central chassis tunnel embossed heat shield covers.
    - Transaxle cooling NACA scoop tray with longitudinal air guide channels.
    - 16 slotted quarter-turn Dzus aero quick-release fasteners along underbody.
    """
    objs = []
    bm_aero_pan = bmesh.new()
    bm_dzus = bmesh.new()

    # 1. Front Steering Gear Aero Undertray (Y: +0.950m to +1.450m, Z = 0.170m)
    mat_f_pan = Matrix.Translation(Vector((0.0, 1.200, 0.170)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_f_pan @ Matrix.Diagonal(Vector((0.840, 0.500, 0.012, 1.0))))

    # Longitudinal Stiffening Ribs on Front Pan
    for rx in [-0.280, -0.140, 0.140, 0.280]:
        mat_rib = mat_f_pan @ Matrix.Translation(Vector((rx, 0, -0.008)))
        bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.016, 0.460, 0.010, 1.0))))

    # 2. Central Tunnel Embossed Heat Shield Pan (Y: -0.500m to +0.800m, Z = 0.180m)
    mat_c_shield = Matrix.Translation(Vector((0.0, 0.150, 0.180)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_c_shield @ Matrix.Diagonal(Vector((0.340, 1.300, 0.008, 1.0))))

    # 3. Transaxle Rear Aero Belly Pan with NACA Duct (Y: -0.650m to -1.150m, Z = 0.165m)
    mat_r_pan = Matrix.Translation(Vector((0.0, -0.900, 0.165)))
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_r_pan @ Matrix.Diagonal(Vector((0.760, 0.500, 0.014, 1.0))))

    # NACA Cooling Air Inflow Ramp Scoop (Recessed into belly pan)
    mat_naca = mat_r_pan @ Matrix.Translation(Vector((0, 0.050, 0.012))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_aero_pan, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.220, 0.024, 1.0))))

    # 4. 16 Slotted Quarter-Turn Dzus Aero Fasteners around perimeter seams
    dzus_locations = [
        # Front Pan Fasteners (4 pairs)
        (-0.380, 1.400, 0.164), (0.380, 1.400, 0.164),
        (-0.380, 1.200, 0.164), (0.380, 1.200, 0.164),
        (-0.380, 1.000, 0.164), (0.380, 1.000, 0.164),
        (-0.150, 1.420, 0.164), (0.150, 1.420, 0.164),
        # Rear Pan Fasteners (4 pairs)
        (-0.340, -0.700, 0.158), (0.340, -0.700, 0.158),
        (-0.340, -0.900, 0.158), (0.340, -0.900, 0.158),
        (-0.340, -1.100, 0.158), (0.340, -1.100, 0.158),
        (-0.160, -1.120, 0.158), (0.160, -1.120, 0.158),
    ]

    for dx, dy, dz in dzus_locations:
        mat_d = Matrix.Translation(Vector((dx, dy, dz)))
        # Outer Circular Bezel Ring
        bmesh.ops.create_cylinder(bm_dzus, radius=0.010, depth=0.003, segments=12, matrix=mat_d)
        # Quarter-Turn Screwdriver Slot
        bmesh.ops.create_cube(bm_dzus, size=1.0, matrix=mat_d @ Matrix.Translation(Vector((0, 0, -0.002))) @ Matrix.Diagonal(Vector((0.014, 0.0025, 0.002, 1.0))))

    obj_pan = link_obj("GEO_993_Underbody_Aero_Pans", bm_aero_pan, parent_col, mats["rubber"], bevel=0.001)
    obj_dzus = link_obj("GEO_993_Underbody_Dzus_Fasteners", bm_dzus, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_pan, obj_dzus])
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 26: SPORT SEAT LEATHER PLEATS & ELECTRIC CONTROLS
# ----------------------------------------------------------------------------

def build_993_sport_seat_pleats_and_controls(parent_col, mats):
    """
    Constructs the luxurious fluted leather cushions and electric seat controls:
    - Distinctive horizontal leather fluting pleats on driver & passenger sport seat cushions.
    - Side-bolster double stitching seams.
    - 4-way electric power seat adjustment switch toggles on lower outboard seat valances.
    - Backrest quick-release tilt forward lever for rear cabin access.
    """
    objs = []
    bm_pleats = bmesh.new()
    bm_switches = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # Seat Center Axis: X = +/- 0.360m, Y = -0.050m, Z = 0.580m
        mat_seat = Matrix.Translation(Vector((sx_sign * 0.360, -0.050, 0.580)))

        # 1. 5 Horizontal Fluted Leather Pleats on Seat Cushion Base
        for p_idx in range(5):
            py = -0.180 + p_idx * 0.065
            mat_pleat = mat_seat @ Matrix.Translation(Vector((0, py, -0.090)))
            bmesh.ops.create_cylinder(bm_pleats, radius=0.016, depth=0.280, segments=12, matrix=mat_pleat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. 6 Horizontal Fluted Leather Pleats on Seat Backrest
        for bp_idx in range(6):
            bz = 0.020 + bp_idx * 0.065
            by = -0.160 - bp_idx * 0.018 # Reclined backrest angle
            mat_bpleat = mat_seat @ Matrix.Translation(Vector((0, by, bz)))
            bmesh.ops.create_cylinder(bm_pleats, radius=0.015, depth=0.260, segments=12, matrix=mat_bpleat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. 4-Way Electric Seat Adjustment Switches on Outboard Seat Base
        mat_sw_base = mat_seat @ Matrix.Translation(Vector((sx_sign * 0.245, -0.040, -0.120)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_sw_base @ Matrix.Diagonal(Vector((0.018, 0.120, 0.048, 1.0))))
        # Horizontal & Vertical Rocker Toggles
        for t_y in [-0.030, 0.030]:
            mat_toggle = mat_sw_base @ Matrix.Translation(Vector((sx_sign * 0.010, t_y, 0)))
            bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_toggle @ Matrix.Diagonal(Vector((0.008, 0.032, 0.016, 1.0))))

        # 4. Chrome Seat Backrest Tilt-Forward Release Lever (Upper outboard bolster)
        mat_tilt = mat_seat @ Matrix.Translation(Vector((sx_sign * 0.230, -0.220, 0.280)))
        bmesh.ops.create_cylinder(bm_switches, radius=0.006, depth=0.035, segments=10, matrix=mat_tilt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pleats = link_obj("GEO_993_SportSeat_Fluted_Pleats", bm_pleats, parent_col, mats["rubber"], bevel=0.001)
    obj_switches = link_obj("GEO_993_Seat_Power_Controls", bm_switches, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_pleats, obj_switches])
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 27: CABRIOLET REAR QUARTER TRIM & HI-FI SPEAKER GRILLES
# ----------------------------------------------------------------------------

def build_993_cabriolet_rear_quarter_trim_and_speakers(parent_col, mats):
    """
    Constructs cabriolet-specific rear cabin quarter trim and stereo speakers:
    - Molded interior rear side quarter trim panels flanking the 2+2 rear seats.
    - Perforated rectangular Hi-Fi stereo rear speaker grilles (Porsche CR-210 system).
    - Convertible top mechanism lock receptacles and hydraulic pivot cover trim.
    - Rear seat lateral armrest bolsters.
    """
    objs = []
    bm_qtrim = bmesh.new()
    bm_spk = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        # Rear Cabin Quarter Axis: X = +/- 0.580m, Y = -0.580m, Z = 0.640m
        mat_qtrim = Matrix.Translation(Vector((qx_sign * 0.580, -0.580, 0.640)))

        # 1. Molded Leatherette Rear Quarter Trim Card
        bmesh.ops.create_cube(bm_qtrim, size=1.0, matrix=mat_qtrim @ Matrix.Diagonal(Vector((0.045, 0.440, 0.280, 1.0))))

        # Armrest Lateral Bolster Pad
        mat_arm = mat_qtrim @ Matrix.Translation(Vector((qx_sign * -0.024, -0.020, -0.060)))
        bmesh.ops.create_cube(bm_qtrim, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.035, 0.320, 0.075, 1.0))))

        # 2. Perforated Hi-Fi Stereo Rear Speaker Grille (Rectangular with fine acoustic mesh)
        mat_spkr = mat_qtrim @ Matrix.Translation(Vector((qx_sign * -0.024, 0.080, 0.040)))
        bmesh.ops.create_cube(bm_spk, size=1.0, matrix=mat_spkr @ Matrix.Diagonal(Vector((0.008, 0.140, 0.095, 1.0))))
        # Acoustic Mesh Bezel Frame
        bmesh.ops.create_cube(bm_spk, size=1.0, matrix=mat_spkr @ Matrix.Diagonal(Vector((0.012, 0.148, 0.105, 1.0))))

        # 3. Soft-Top Latch Guide Receptacle Socket (Top rear edge, Z = 0.810m)
        mat_socket = mat_qtrim @ Matrix.Translation(Vector((0, -0.160, 0.145)))
        bmesh.ops.create_cylinder(bm_spk, radius=0.014, depth=0.020, segments=14, matrix=mat_socket)

    obj_qtrim = link_obj("GEO_993_Cabriolet_Rear_Quarter_Trim", bm_qtrim, parent_col, mats["rubber"], bevel=0.0012)
    obj_spk = link_obj("GEO_993_HiFi_Rear_Speaker_Grilles", bm_spk, parent_col, mats["rubber"], bevel=0.0006)

    objs.extend([obj_qtrim, obj_spk])
    return objs
'''
