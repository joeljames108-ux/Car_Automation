"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 6
Subsystem 19:
- Subsystem 19: 90L Saddle Fuel Tank & Stamped Aluminum Thermal Heat Shields
"""

PART_BENTLEY_EXTRA6 = '''
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 19: 90L SADDLE FUEL TANK & THERMAL HEAT SHIELDING
# ----------------------------------------------------------------------------

def build_bentley_fuel_tank_and_shields(parent_col, mats):
    """
    Constructs high-capacity saddle fuel reservoir and exhaust heat shielding:
    - 90-liter molded multi-layer HDPE fuel tank spanning over the central carbon propshaft.
    - Symmetrical dual-lobe deep fuel sumps with internal swirl pots and high-pressure pumps.
    - Stamped dimpled aluminum thermal radiation barriers enclosing the exhaust tunnel.
    - High-pressure fuel filler neck tube leading up to the right rear quarter panel.
    """
    objs = []
    bm_tank = bmesh.new()
    bm_shield = bmesh.new()

    # 1. 90-Liter Saddle Fuel Tank Saddle Bridge (Y: -0.820m to -1.180m, Z = 0.320m)
    mat_tank = Matrix.Translation(Vector((0.0, -1.000, 0.340)))
    bmesh.ops.create_cube(bm_tank, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((1.040, 0.360, 0.220, 1.0))))

    # Left & Right Deep Sump Lobes
    for lobe_sign in [-1.0, 1.0]:
        mat_lobe = mat_tank @ Matrix.Translation(Vector((lobe_sign * 0.380, 0.000, -0.060)))
        bmesh.ops.create_cylinder(bm_tank, radius=0.140, depth=0.260, segments=18, matrix=mat_lobe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Fuel Pump Flange Access Ring
        mat_flange = mat_lobe @ Matrix.Translation(Vector((0, 0, 0.140)))
        bmesh.ops.create_cylinder(bm_tank, radius=0.065, depth=0.020, segments=16, matrix=mat_flange)

    # Fuel Filler Neck Pipe leading to Right Rear Quarter (X: +0.480m to +0.860m, Y = -1.050m, Z: 0.380m to 0.760m)
    mat_filler = Matrix.Translation(Vector((0.670, -1.050, 0.570))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tank, radius=0.024, depth=0.520, segments=14, matrix=mat_filler)

    # 2. Embossed Aluminum Tunnel Heat Shielding (Spans Y: -1.800m to +0.800m above exhaust)
    mat_t_shield = Matrix.Translation(Vector((0.0, -0.500, 0.260)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_t_shield @ Matrix.Diagonal(Vector((0.480, 2.500, 0.012, 1.0))))

    # Rear Transverse Silencer Heat Deflector Plate (Under trunk well)
    mat_r_shield = Matrix.Translation(Vector((0.0, -1.880, 0.420)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_r_shield @ Matrix.Diagonal(Vector((1.120, 0.460, 0.012, 1.0))))

    obj_tank = link_obj("GEO_BENTLEY_90L_Saddle_Fuel_Tank", bm_tank, parent_col, mats["trim_black"], bevel=0.002)
    obj_shield = link_obj("GEO_BENTLEY_Embossed_Thermal_Heat_Shields", bm_shield, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_tank, obj_shield])
    return objs
'''
