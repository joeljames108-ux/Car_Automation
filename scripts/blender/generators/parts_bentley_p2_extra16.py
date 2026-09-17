"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 16
Subsystems 40 and 41:
- Subsystem 40: Under-Bonnet Acoustic Insulation Pad & Perimeter Weatherstrips
- Subsystem 41: Drilled Aluminum Speed Sports Pedals & Dead Pedal Footrest
"""

PART_BENTLEY2_EXTRA16 = '''
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 40: UNDER-BONNET ACOUSTIC PAD & PERIMETER SEALS
# ----------------------------------------------------------------------------

def build_bentley_bonnet_insulation_and_seals(parent_col, mats):
    """
    Constructs the under-bonnet acoustic NVH attenuation:
    - High-density molded acoustic fiber insulation pad lining underside of bonnet.
    - Large 3D embossed Winged 'B' silhouette molded directly into insulation pad center.
    - Full-perimeter silicone bulb weatherstripping seals sealing engine compartment.
    - Plastic push-pin retaining clips securing pad to aluminum bonnet skeleton.
    """
    objs = []
    bm_pad = bmesh.new()
    bm_seals = bmesh.new()

    # 1. Molded Under-Bonnet Acoustic Fleece Pad (Y: +1.000m to +2.100m, Z = 0.810m)
    mat_pad = Matrix.Translation(Vector((0.0, 1.550, 0.810)))
    bmesh.ops.create_cube(bm_pad, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((1.180, 1.050, 0.015, 1.0))))

    # Embossed 3D Winged 'B' Medallion in Insulation Pad Center
    mat_emb = mat_pad @ Matrix.Translation(Vector((0.0, 0.0, -0.010)))
    bmesh.ops.create_cube(bm_pad, size=1.0, matrix=mat_emb @ Matrix.Diagonal(Vector((0.360, 0.180, 0.008, 1.0))))

    # 2. Engine Bay Perimeter Silicone Bulb Weatherstrip Seals
    for sx_sign in [-1.0, 1.0]:
        mat_side_seal = Matrix.Translation(Vector((sx_sign * 0.620, 1.550, 0.790)))
        bmesh.ops.create_cylinder(bm_seals, radius=0.008, depth=1.100, segments=12, matrix=mat_side_seal @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transverse Forward Header Seal
    mat_f_seal = Matrix.Translation(Vector((0.0, 2.120, 0.730)))
    bmesh.ops.create_cylinder(bm_seals, radius=0.008, depth=1.200, segments=12, matrix=mat_f_seal @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pad = link_obj("GEO_BENTLEY_UnderBonnet_Acoustic_Insulation_Pad", bm_pad, parent_col, mats["trim_black"], bevel=0.001)
    obj_seals = link_obj("GEO_BENTLEY_EngineBay_Perimeter_Bulb_Seals", bm_seals, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_pad, obj_seals])
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 41: DRILLED ALUMINUM SPEED SPORTS PEDALS & FOOTREST
# ----------------------------------------------------------------------------

def build_bentley_speed_sports_pedals(parent_col, mats):
    """
    Constructs the driver footwell sports control pedals:
    - Billet drilled aluminum throttle accelerator pedal with rubber traction nubs.
    - Wide high-pressure cast aluminum brake pedal pad with vulcanized rubber grip bars.
    - Large aluminum left footrest dead pedal with brushed surface and rubber anti-slip treads.
    """
    objs = []
    bm_pedals = bmesh.new()
    bm_rubber = bmesh.new()

    mat_footwell = Matrix.Translation(Vector((-0.420, 0.580, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Floor-Hinged Organ-Type Accelerator Pedal (Right pedal)
    mat_gas = mat_footwell @ Matrix.Translation(Vector((0.110, 0.0, 0.0)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.055, 0.160, 0.012, 1.0))))
    # Anti-Slip Rubber Grip Rows on Gas Pedal
    for r_i in range(5):
        mat_gr = mat_gas @ Matrix.Translation(Vector((0, -0.060 + r_i * 0.030, 0.008)))
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_gr @ Matrix.Diagonal(Vector((0.045, 0.012, 0.005, 1.0))))

    # 2. Wide Suspended Brake Pedal Pad (Center pedal)
    mat_brake = mat_footwell @ Matrix.Translation(Vector((0.020, 0.020, 0.0)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brake @ Matrix.Diagonal(Vector((0.075, 0.090, 0.014, 1.0))))
    # Brake Pedal Rubber Cleats
    mat_br = mat_brake @ Matrix.Translation(Vector((0, 0, 0.009)))
    bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_br @ Matrix.Diagonal(Vector((0.065, 0.075, 0.005, 1.0))))

    # 3. Left Dead Pedal Footrest
    mat_dead = mat_footwell @ Matrix.Translation(Vector((-0.120, -0.020, -0.010)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.085, 0.220, 0.012, 1.0))))
    for d_i in range(6):
        mat_dr = mat_dead @ Matrix.Translation(Vector((0, -0.080 + d_i * 0.032, 0.008)))
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_dr @ Matrix.Diagonal(Vector((0.070, 0.014, 0.005, 1.0))))

    obj_pedals = link_obj("GEO_BENTLEY_Speed_Drilled_Aluminum_Pedals", bm_pedals, parent_col, mats["chrome"], bevel=0.0004)
    obj_rubber = link_obj("GEO_BENTLEY_Pedal_Traction_Rubber_Cleats", bm_rubber, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_pedals, obj_rubber])
    return objs
'''
