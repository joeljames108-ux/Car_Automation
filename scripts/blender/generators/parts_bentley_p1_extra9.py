"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 9
Subsystem 22:
- Subsystem 22: Cast Aluminum Subframe Cradles & Tunnel Shear Closure Plates
"""

PART_BENTLEY_EXTRA9 = '''
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 22: CAST ALUMINUM SUBFRAMES & TUNNEL SHEAR PLATES
# ----------------------------------------------------------------------------

def build_bentley_subframe_cradles(parent_col, mats):
    """
    Constructs high-torsion structural subframe assemblies and tunnel shear plates:
    - High-integrity cast aluminum front subframe cradle mounting the W12 powertrain.
    - Isolated perimeter rear subframe cradle carrying the eLSD, AWS, and multi-link geometry.
    - Monocoque center tunnel diagonal shear reinforcement plate (ensuring 33 kNm/deg stiffness).
    - Heavy-duty rubber-metal hydraulic isolation mounting subframe bushings.
    """
    objs = []
    bm_sub = bmesh.new()
    bm_shear = bmesh.new()

    # 1. Front High-Integrity Cast Aluminum Subframe (Axle Y = +1.425m, Z = 0.190m)
    mat_fsub = Matrix.Translation(Vector((0.0, 1.425, 0.190)))
    # Transverse Box Section Base Member
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fsub @ Matrix.Diagonal(Vector((0.920, 0.220, 0.080, 1.0))))

    # Longitudinal Engine Mount Cradle Rails (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_fside = mat_fsub @ Matrix.Translation(Vector((fx_sign * 0.410, -0.160, 0.045)))
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fside @ Matrix.Diagonal(Vector((0.110, 0.440, 0.075, 1.0))))
        # Hydraulic Engine Mount Isolation Bushing
        mat_fmount = mat_fsub @ Matrix.Translation(Vector((fx_sign * 0.360, -0.050, 0.110)))
        bmesh.ops.create_cylinder(bm_sub, radius=0.048, depth=0.065, segments=16, matrix=mat_fmount)

    # 2. Rear Perimeter Multi-Link Subframe Cradle (Axle Y = -1.426m, Z = 0.210m)
    mat_rsub = Matrix.Translation(Vector((0.0, -1.426, 0.210)))
    # Outer Perimeter Box Enclosing Rear Differential
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rsub @ Matrix.Diagonal(Vector((0.980, 0.620, 0.090, 1.0))))

    # Diagonal Subframe Shear Ties & Differential Mount Lugs
    for rx_sign in [-1.0, 1.0]:
        mat_rtie = mat_rsub @ Matrix.Translation(Vector((rx_sign * 0.440, 0.240, 0.050))) @ Euler((0, 0, rx_sign * math.radians(26)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rtie @ Matrix.Diagonal(Vector((0.070, 0.360, 0.055, 1.0))))
        # Subframe-to-Chassis Hydro-Bushing Mount Cans
        mat_rbush = mat_rsub @ Matrix.Translation(Vector((rx_sign * 0.480, -0.280, 0.080)))
        bmesh.ops.create_cylinder(bm_sub, radius=0.045, depth=0.075, segments=16, matrix=mat_rbush)

    # 3. Central Monocoque Transmission Tunnel Shear Closure Plate (Y: -0.800m to +0.200m, Z = 0.185m)
    mat_shear = Matrix.Translation(Vector((0.0, -0.300, 0.185)))
    bmesh.ops.create_cube(bm_shear, size=1.0, matrix=mat_shear @ Matrix.Diagonal(Vector((0.540, 1.000, 0.012, 1.0))))

    # Embossed Diagonal Cross-Ribs on Shear Plate for Extreme Torsional Rigidity
    for rib_ang in [-32, 32]:
        mat_xrib = mat_shear @ Euler((0, 0, math.radians(rib_ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_shear, size=1.0, matrix=mat_xrib @ Matrix.Diagonal(Vector((0.025, 0.850, 0.016, 1.0))))

    obj_sub = link_obj("GEO_BENTLEY_Cast_Aluminum_Subframe_Cradles", bm_sub, parent_col, mats["engine_alloy"], bevel=0.0018)
    obj_shear = link_obj("GEO_BENTLEY_Tunnel_Torsional_Shear_Plate", bm_shear, parent_col, mats["chrome"], bevel=0.001)

    objs.extend([obj_sub, obj_shear])
    return objs
'''
