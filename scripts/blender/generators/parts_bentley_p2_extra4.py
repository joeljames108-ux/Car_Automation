"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 4
Subsystems 15 and 16:
- Subsystem 15: Speed Brake Caliper Pad Retainers & Raised "BENTLEY" Relief Script
- Subsystem 16: Tonneau Deck Stainless Brightware Rails & Soft-Top Latch Receptors
"""

PART_BENTLEY2_EXTRA4 = '''
# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 15: BRAKE CALIPER PAD RETAINERS & "BENTLEY" RELIEF SCRIPT
# ----------------------------------------------------------------------------

def build_bentley_caliper_jewelry_and_script(parent_col, mats):
    """
    Constructs the micro-detailing on the massive 10-piston CSiC brake calipers:
    - Raised polished white/chrome "BENTLEY" brand relief script across caliper face.
    - High-tensile stainless steel brake pad anti-rattle cross-spring retainer plates.
    - Dual caliper cross-pin slide bolts with safety R-clip retaining cotter pins.
    - Rubber dust caps over hydraulic bleeder screw nipples.
    """
    objs = []
    bm_script = bmesh.new()
    bm_pins = bmesh.new()

    caliper_configs = [
        # Side, X_pos, Y_pos, Z_pos, Is_Front
        ("FL", -0.795,  1.425, 0.365, True),
        ("FR",  0.795,  1.425, 0.365, True),
        ("RL", -0.785, -1.426, 0.365, False),
        ("RR",  0.785, -1.426, 0.365, False),
    ]

    for side, bx, by, bz, is_front in caliper_configs:
        x_sign = 1.0 if bx > 0 else -1.0
        cal_ang = 0.55 if is_front else 2.65
        cal_r = 0.220 * 0.88 if is_front else 0.190 * 0.88
        cal_y = math.sin(cal_ang) * cal_r
        cal_z = math.cos(cal_ang) * cal_r

        mat_cal = Matrix.Translation(Vector((bx + x_sign * 0.045, by + cal_y, bz + cal_z))) @ Euler((0, 0, cal_ang), 'XYZ').to_matrix().to_4x4()

        # 1. Raised "BENTLEY" Relief Lettering Script (Center face of caliper monobloc)
        b_len = 0.220 if is_front else 0.140
        mat_text_base = mat_cal @ Matrix.Translation(Vector((x_sign * 0.015, 0, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_text_base @ Matrix.Diagonal(Vector((0.006, b_len, 0.024, 1.0))))

        # 2. Stainless Steel Brake Pad Cross-Spring Retainer Plate (Bridge of caliper)
        mat_spring = mat_cal @ Matrix.Translation(Vector((0, 0, 0.048)))
        bmesh.ops.create_cube(bm_pins, size=1.0, matrix=mat_spring @ Matrix.Diagonal(Vector((0.055, 0.160, 0.008, 1.0))))

        # 3. Dual Pad Retainer Slide Pins
        for pin_off in [-0.065, 0.065]:
            mat_pin = mat_spring @ Matrix.Translation(Vector((0, pin_off, 0.008)))
            bmesh.ops.create_cylinder(bm_pins, radius=0.004, depth=0.065, segments=10, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Hydraulic Bleeder Nipple with Rubber Dust Cap
        mat_bleed = mat_cal @ Matrix.Translation(Vector((0, 0.120, 0.035)))
        bmesh.ops.create_cylinder(bm_pins, radius=0.006, depth=0.022, segments=10, matrix=mat_bleed)

    obj_script = link_obj("GEO_BENTLEY_Caliper_Raised_Bentley_Script", bm_script, parent_col, mats["chrome"], bevel=0.0003)
    obj_pins = link_obj("GEO_BENTLEY_Caliper_Hardware_and_Pins", bm_pins, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_script, obj_pins])
    return objs


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 16: TONNEAU DECK STAINLESS BRIGHTWARE RAILS & LATCHES
# ----------------------------------------------------------------------------

def build_bentley_tonneau_deck_brightware(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau deck brightware:
    - Symmetrical hand-polished stainless steel garnish rails flanking the soft-top seam.
    - Precision guide receptors and chrome locator pins for watertight tonneau closure.
    - Acoustic rubber perimeter seals isolating high-speed roadster turbulence.
    """
    objs = []
    bm_rails = bmesh.new()
    bm_latches = bmesh.new()

    # Left & Right Longitudinal Tonneau Garnish Rails (Y: -0.480m to -0.880m, X = +-0.680m, Z = 0.875m)
    for rx_sign in [-1.0, 1.0]:
        mat_rail = Matrix.Translation(Vector((rx_sign * 0.680, -0.680, 0.875)))
        bmesh.ops.create_cube(bm_rails, size=1.0, matrix=mat_rail @ Matrix.Diagonal(Vector((0.016, 0.380, 0.008, 1.0))))

        # Chrome Tonneau Guide Locator Pin Receptors (Forward & Aft ends of rail)
        for py in [-0.160, 0.160]:
            mat_rec = mat_rail @ Matrix.Translation(Vector((0, py, 0.006)))
            bmesh.ops.create_cylinder(bm_latches, radius=0.008, depth=0.012, segments=14, matrix=mat_rec)

    # Transverse Tonneau Forward Edge Weatherstrip Seal Lip (Y = -0.460m)
    mat_lip = Matrix.Translation(Vector((0.0, -0.460, 0.870)))
    bmesh.ops.create_cube(bm_rails, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((1.320, 0.018, 0.010, 1.0))))

    obj_rails = link_obj("GEO_BENTLEY_Tonneau_Stainless_Garnish_Rails", bm_rails, parent_col, mats["chrome"], bevel=0.0005)
    obj_latches = link_obj("GEO_BENTLEY_Tonneau_Locator_Pin_Receptors", bm_latches, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_rails, obj_latches])
    return objs
'''
