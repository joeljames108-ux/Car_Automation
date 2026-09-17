"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 8
Subsystems 41 to 43:
- Subsystem 41: Cockpit Center Console Ignis Start Button, SportShift Joystick Selector & Rotary Climate OLED Dials
- Subsystem 42: Meridian Surround Sound Precision Hex-Pattern CNC Aluminum Door Speaker Grilles
- Subsystem 43: Illuminated Stainless Steel Door Sill Treadplates with Laser-Etched "JAGUAR" Script & Torx Striker Hardware
"""

PART_FTYPE2_EXTRA8 = '''
# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 41: COCKPIT CENTER CONSOLE CONTROLS & IGNIS START BUTTON
# ----------------------------------------------------------------------------

def build_jaguar_ftype_console_controls_and_start_button(parent_col, mats):
    """
    Constructs the driver-focused cockpit center console controls:
    - "Ignis" copper/bronze anodized engine Start/Stop button with knurled aluminum outer bezel.
    - "SportShift" ergonomic 8-speed electronic gear selector joystick with leather stitched boot and chrome park trigger.
    - Dynamic Mode toggle switch (metal toggle lever featuring the iconic checkered racing flag engraving).
    - Dual rotary climate control dials with integrated digital OLED circular temperature screens and rubber grip rings.
    - Electronic park brake toggle switch and active exhaust acoustic bypass button with dual-pipe graphic.
    """
    objs = []
    bm_controls = bmesh.new()
    bm_screens = bmesh.new()

    # Center Console Trim Tunnel Location
    cy = 0.080
    cz = 0.590

    # 1. "Ignis" Engine Start/Stop Button (Mounted forward on console slope)
    mat_start = Matrix.Translation(Vector((-0.090, cy + 0.160, cz + 0.035))) @ Euler((-0.35, 0, 0), 'XYZ').to_matrix().to_4x4()
    # Knurled outer bezel
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.016,
        depth=0.008,
        segments=24,
        matrix=mat_start
    )
    # Anodized copper start button center
    mat_btn = mat_start @ Matrix.Translation(Vector((0, 0, 0.003)))
    bmesh.ops.create_cylinder(
        bm_screens,
        radius=0.013,
        depth=0.006,
        segments=20,
        matrix=mat_btn
    )

    # 2. "SportShift" Electronic Gear Selector Joystick
    mat_shifter_base = Matrix.Translation(Vector((-0.045, cy, cz + 0.020)))
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.028,
        depth=0.010,
        segments=20,
        matrix=mat_shifter_base
    )
    # Ergonomic pistol-grip shift knob
    mat_knob = mat_shifter_base @ Matrix.Translation(Vector((0, -0.010, 0.065))) @ Euler((-0.15, 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(
        bm_controls,
        size=1.0,
        matrix=mat_knob @ Matrix.Diagonal(Vector((0.038, 0.055, 0.050, 1.0)))
    )
    # Shifter shaft
    mat_shaft = mat_shifter_base @ Matrix.Translation(Vector((0, -0.005, 0.032)))
    bmesh.ops.create_cylinder(
        bm_controls,
        radius=0.007,
        depth=0.045,
        segments=12,
        matrix=mat_shaft
    )

    # 3. Dynamic Mode Checkered Flag Rocker Switch
    mat_dyn_switch = Matrix.Translation(Vector((-0.100, cy - 0.040, cz + 0.018)))
    bmesh.ops.create_cube(
        bm_controls,
        size=1.0,
        matrix=mat_dyn_switch @ Matrix.Diagonal(Vector((0.018, 0.042, 0.012, 1.0)))
    )

    # 4. Dual Rotary Climate Control Dials with OLED Displays
    for dx_sign in [-1.0, 1.0]:
        mat_dial = Matrix.Translation(Vector((dx_sign * 0.075, cy + 0.280, cz + 0.110))) @ Euler((-0.65, 0, 0), 'XYZ').to_matrix().to_4x4()
        # Knurled rotary outer ring
        bmesh.ops.create_cylinder(
            bm_controls,
            radius=0.025,
            depth=0.016,
            segments=24,
            matrix=mat_dial
        )
        # Center digital OLED display screen
        mat_oled = mat_dial @ Matrix.Translation(Vector((0, 0, 0.006)))
        bmesh.ops.create_cylinder(
            bm_screens,
            radius=0.019,
            depth=0.005,
            segments=20,
            matrix=mat_oled
        )

    # 5. Electronic Parking Brake & Active Exhaust Toggle Buttons
    for bx_off, by_off in [(-0.045, cy - 0.085), (-0.095, cy - 0.085)]:
        mat_btn2 = Matrix.Translation(Vector((bx_off, by_off, cz + 0.015)))
        bmesh.ops.create_cube(
            bm_controls,
            size=1.0,
            matrix=mat_btn2 @ Matrix.Diagonal(Vector((0.024, 0.024, 0.008, 1.0)))
        )

    obj_controls = link_obj("GEO_FTYPE_Console_Switchgear_and_Shifter", bm_controls, parent_col, mats["chrome"], bevel=0.0004)
    obj_screens = link_obj("GEO_FTYPE_Console_OLED_Displays_and_Ignis", bm_screens, parent_col, mats["drl_white"], bevel=0.0003)
    objs.extend([obj_controls, obj_screens])
    return objs


# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 42: MERIDIAN AUDIO SURROUND SOUND DOOR SPEAKER GRILLES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_meridian_speaker_grilles(parent_col, mats):
    """
    Constructs the high-end Meridian Surround Sound audio system door speaker enclosures:
    - Precision CNC machined brushed aluminum door speaker grilles with microscopic acoustic hexagonal perforation matrix.
    - Laser-etched "MERIDIAN" sound branding badge plate affixed to the lower speaker bezel.
    - A-pillar high-frequency neodymium dome tweeter grilles integrated into the inner mirror sail triangular trim.
    """
    objs = []
    bm_grilles = bmesh.new()
    bm_tweeters = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        # Main Mid-Bass Door Speaker (Lower forward door card)
        dx = dx_sign * 0.730
        dy = 0.420
        dz = 0.540

        mat_spk = Matrix.Translation(Vector((dx, dy, dz))) @ Euler((0, dx_sign * 0.22, 0), 'XYZ').to_matrix().to_4x4()
        # Perforated aluminum speaker grille body
        bmesh.ops.create_cylinder(
            bm_grilles,
            radius=0.075,
            depth=0.008,
            segments=28,
            matrix=mat_spk @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Outer polished bezel trim ring
        bmesh.ops.create_torus(
            bm_grilles,
            major_radius=0.076,
            minor_radius=0.003,
            major_segments=24,
            minor_segments=8,
            matrix=mat_spk @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Laser-etched "MERIDIAN" branding badge
        mat_badge = mat_spk @ Matrix.Translation(Vector((dx_sign * 0.005, 0.0, -0.062)))
        bmesh.ops.create_cube(
            bm_grilles,
            size=1.0,
            matrix=mat_badge @ Matrix.Diagonal(Vector((0.004, 0.042, 0.010, 1.0)))
        )

        # A-Pillar Neodymium Tweeter (In mirror sail triangle)
        tx = dx_sign * 0.740
        ty = 0.620
        tz = 0.880
        mat_tw = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((0, dx_sign * 0.35, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_tweeters,
            radius=0.022,
            depth=0.006,
            segments=18,
            matrix=mat_tw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_grilles = link_obj("GEO_FTYPE_Meridian_Door_Speaker_Grilles", bm_grilles, parent_col, mats["chrome"], bevel=0.0004)
    obj_tweeters = link_obj("GEO_FTYPE_Meridian_A_Pillar_Tweeters", bm_tweeters, parent_col, mats["piano_black"], bevel=0.0003)
    objs.extend([obj_grilles, obj_tweeters])
    return objs


# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 43: ILLUMINATED DOOR SILL TREADPLATES & B-PILLAR STRIKERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_illuminated_door_sills_and_strikers(parent_col, mats):
    """
    Constructs the entry sill jewelry and door latch structural hardware:
    - Polished stainless steel door sill treadplates with electroluminescent ice-blue illuminated "JAGUAR" script.
    - Satin rubber protective scuff perimeter surround gaskets.
    - Precision CNC machined B-pillar door latch striker loops with hardened Torx countersunk mounting bolts.
    - Heavy-duty cast aluminum door hinge check straps with dual detent notches preventing wind over-extension.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_strikers = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.760
        sy = 0.050
        sz = 0.445

        # 1. Door Sill Treadplate (Stainless plate)
        mat_sill = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cube(
            bm_sills,
            size=1.0,
            matrix=mat_sill @ Matrix.Diagonal(Vector((0.075, 0.620, 0.006, 1.0)))
        )
        # Illuminated "JAGUAR" Script Inlay Channel
        mat_script = mat_sill @ Matrix.Translation(Vector((0, 0, 0.004)))
        bmesh.ops.create_cube(
            bm_sills,
            size=1.0,
            matrix=mat_script @ Matrix.Diagonal(Vector((0.032, 0.260, 0.002, 1.0)))
        )
        # Rubber Perimeter Gasket
        mat_gasket = mat_sill @ Matrix.Translation(Vector((0, 0, -0.002)))
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_gasket @ Matrix.Diagonal(Vector((0.082, 0.635, 0.004, 1.0)))
        )

        # 2. B-Pillar Heavy-Duty Door Striker Pin & Bracket
        mat_striker = Matrix.Translation(Vector((sx_sign * 0.720, -0.320, 0.680)))
        # Base backing plate
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_striker @ Matrix.Diagonal(Vector((0.012, 0.045, 0.065, 1.0)))
        )
        # Hardened steel U-loop striker pin
        mat_loop = mat_striker @ Matrix.Translation(Vector((-sx_sign * 0.015, 0, 0)))
        bmesh.ops.create_torus(
            bm_strikers,
            major_radius=0.014,
            minor_radius=0.004,
            major_segments=16,
            minor_segments=8,
            matrix=mat_loop @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Torx T-40 countersunk mounting fasteners (Top & Bottom)
        for fz_off in [-0.022, 0.022]:
            mat_fastener = mat_striker @ Matrix.Translation(Vector((0, 0, fz_off)))
            bmesh.ops.create_cylinder(
                bm_strikers,
                radius=0.005,
                depth=0.006,
                segments=6,
                matrix=mat_fastener @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

        # 3. Door Check Strap (Forward A-Pillar hinge detent link)
        mat_check = Matrix.Translation(Vector((sx_sign * 0.740, 0.560, 0.520)))
        bmesh.ops.create_cube(
            bm_strikers,
            size=1.0,
            matrix=mat_check @ Matrix.Diagonal(Vector((0.028, 0.060, 0.012, 1.0)))
        )

    obj_sills = link_obj("GEO_FTYPE_Illuminated_Door_Sill_Plates", bm_sills, parent_col, mats["chrome"], bevel=0.0004)
    obj_strikers = link_obj("GEO_FTYPE_Door_Strikers_and_Hardware", bm_strikers, parent_col, mats["inconel"], bevel=0.0004)
    objs.extend([obj_sills, obj_strikers])
    return objs
'''
