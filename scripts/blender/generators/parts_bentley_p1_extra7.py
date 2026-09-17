"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 7
Subsystem 20:
- Subsystem 20: Trunk Well, Dual 12V AGM Battery Enclosure & Soft-Top Hydraulic Unit
"""

PART_BENTLEY_EXTRA7 = '''
# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 20: TRUNK WELL, DUAL AGM BATTERIES & ROOF HYDRAULICS
# ----------------------------------------------------------------------------

def build_bentley_trunk_well_and_electrical(parent_col, mats):
    """
    Constructs rear luggage trunk underfloor architecture and auxiliary power:
    - Deep structural trunk well tub positioned beneath the convertible tonneau deck.
    - Dual heavy-duty 12-Volt AGM auxiliary and starter batteries in secured aluminum trays.
    - Electro-hydraulic soft-top roof actuation powerpack pump and solenoid valve block.
    - High-output 48V lithium-ion supercapacitor / battery pack for Bentley Dynamic Ride.
    """
    objs = []
    bm_well = bmesh.new()
    bm_bat = bmesh.new()
    bm_pump = bmesh.new()

    # 1. Structural Rear Trunk Well Floor (Y: -1.550m to -2.150m, Z = 0.420m, Width: 1.080m)
    mat_well = Matrix.Translation(Vector((0.0, -1.850, 0.420)))
    bmesh.ops.create_cube(bm_well, size=1.0, matrix=mat_well @ Matrix.Diagonal(Vector((1.080, 0.600, 0.220, 1.0))))

    # 2. Dual 12V AGM Heavy-Duty Batteries (Left & Right inside trunk floor well)
    for bat_sign in [-1.0, 1.0]:
        mat_bat = mat_well @ Matrix.Translation(Vector((bat_sign * 0.380, -0.050, -0.020)))
        # Battery Polypropylene Outer Casing
        bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bat @ Matrix.Diagonal(Vector((0.260, 0.180, 0.160, 1.0))))
        # Lead Terminal Posts (Positive red & Negative black)
        for term_sign, term_mat in [(-1, mats["red_caliper"]), (1, mats["trim_black"])]:
            mat_term = mat_bat @ Matrix.Translation(Vector((term_sign * 0.080, 0.050, 0.090)))
            bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=10, matrix=mat_term)

    # 3. 48-Volt Supercapacitor / Lithium Module for Active Roll System (Center well)
    mat_48v_pack = mat_well @ Matrix.Translation(Vector((0.0, 0.160, -0.010)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_48v_pack @ Matrix.Diagonal(Vector((0.340, 0.200, 0.140, 1.0))))

    # 4. Electro-Hydraulic Convertible Roof Powerpack Pump & Valve Block (Offset Right, Y = -1.680m)
    mat_pump = mat_well @ Matrix.Translation(Vector((0.320, 0.160, 0.060)))
    # High-Pressure Electric Motor Pump
    bmesh.ops.create_cylinder(bm_pump, radius=0.045, depth=0.140, segments=16, matrix=mat_pump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Hydraulic Fluid Reservoir Bottle
    mat_res = mat_pump @ Matrix.Translation(Vector((0.0, 0.100, 0.020)))
    bmesh.ops.create_cylinder(bm_pump, radius=0.042, depth=0.090, segments=14, matrix=mat_res)
    # Billet Solenoid Valve Control Block
    mat_valve = mat_pump @ Matrix.Translation(Vector((-0.070, 0.000, 0.0)))
    bmesh.ops.create_cube(bm_pump, size=1.0, matrix=mat_valve @ Matrix.Diagonal(Vector((0.060, 0.120, 0.080, 1.0))))

    obj_well = link_obj("GEO_BENTLEY_Rear_Trunk_Structural_Well", bm_well, parent_col, mats["trim_black"], bevel=0.002)
    obj_bat = link_obj("GEO_BENTLEY_Dual_AGM_and_48V_Battery_Packs", bm_bat, parent_col, mats["trim_black"], bevel=0.0012)
    obj_pump = link_obj("GEO_BENTLEY_Roof_Hydraulic_Powerpack_Pump", bm_pump, parent_col, mats["engine_alloy"], bevel=0.001)

    objs.extend([obj_well, obj_bat, obj_pump])
    return objs
'''
