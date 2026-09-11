"""
Sedan 4.4L Twin-Turbo V8 Powertrain & Drivetrain (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )
except ImportError:
    from sedan_common import (
        link_and_finish, make_tube,
        FRONT_AXLE_Y, REAR_AXLE_Y
    )

def build_powertrain(mats):
    created = []
    mat_alum = mats.get("billet_aluminum")
    mat_carbon = mats.get("carbon")
    mat_red = mats.get("engine_red")
    mat_exhaust = mats.get("exhaust_titanium")
    mat_steel = mats.get("chassis_steel")

    print("[SEDAN_POWERTRAIN] Generating 4.4L Twin-Turbo V8 Engine, Gearbox & Driveshafts...")

    # ------------------------------------------------------------------------
    # 1. 4.4L V8 ENGINE BLOCK & OIL SUMP PAN
    # ------------------------------------------------------------------------
    bm_eb = bmesh.new()
    # Main 90-degree V8 crankcase block
    rc_eb = bmesh.ops.create_cube(bm_eb, size=1.0)
    bmesh.ops.scale(bm_eb, vec=Vector((0.54, 0.62, 0.38)), verts=rc_eb['verts'])
    bmesh.ops.translate(bm_eb, vec=Vector((0.00, FRONT_AXLE_Y, 0.460)), verts=rc_eb['verts'])
    
    # Lower oil sump pan
    rc_sp = bmesh.ops.create_cube(bm_eb, size=1.0)
    bmesh.ops.scale(bm_eb, vec=Vector((0.44, 0.52, 0.12)), verts=rc_sp['verts'])
    bmesh.ops.translate(bm_eb, vec=Vector((0.00, FRONT_AXLE_Y, 0.220)), verts=rc_sp['verts'])
    
    # Front accessory pulleys and serpentine belt
    for p_z, p_rad in [(0.46, 0.075), (0.34, 0.090), (0.58, 0.065)]:
        rc_p = bmesh.ops.create_cone(bm_eb, cap_ends=True, radius1=p_rad, radius2=p_rad, depth=0.035, segments=24)
        bmesh.ops.rotate(bm_eb, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_p['verts'])
        bmesh.ops.translate(bm_eb, vec=Vector((0.00, FRONT_AXLE_Y + 0.330, p_z)), verts=rc_p['verts'])
        
    obj_eb = link_and_finish("GEO_Engine_Block", "07_Powertrain_Drivetrain", bm_eb, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_eb)

    # ------------------------------------------------------------------------
    # 2. FIRE-RED DOHC CYLINDER HEADS & VALVE COVERS
    # ------------------------------------------------------------------------
    bm_ch = bmesh.new()
    for sx in [-0.22, 0.22]:
        # Angled 45-degree valve cover
        rc_vc = bmesh.ops.create_cube(bm_ch, size=1.0)
        bmesh.ops.scale(bm_ch, vec=Vector((0.18, 0.58, 0.14)), verts=rc_vc['verts'])
        bmesh.ops.rotate(bm_ch, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-45 if sx > 0 else 45), 4, 'Y'), verts=rc_vc['verts'])
        bmesh.ops.translate(bm_ch, vec=Vector((sx, FRONT_AXLE_Y, 0.670)), verts=rc_vc['verts'])
        
        # 4 Ignition Coil Packs per bank
        for coil_y in [-0.18, -0.06, 0.06, 0.18]:
            rc_c = bmesh.ops.create_cube(bm_ch, size=1.0)
            bmesh.ops.scale(bm_ch, vec=Vector((0.045, 0.045, 0.035)), verts=rc_c['verts'])
            bmesh.ops.translate(bm_ch, vec=Vector((sx * 1.10, FRONT_AXLE_Y + coil_y, 0.740)), verts=rc_c['verts'])
            
    obj_ch = link_and_finish("GEO_Cylinder_Heads_Valves", "07_Powertrain_Drivetrain", bm_ch, mat_red, bevel=0.003, subsurf=0)
    created.append(obj_ch)

    # ------------------------------------------------------------------------
    # 3. CARBON FIBER INTAKE PLENUM & TWIN TURBOS
    # ------------------------------------------------------------------------
    bm_in = bmesh.new()
    # Central carbon plenum
    rc_pl = bmesh.ops.create_cube(bm_in, size=1.0)
    bmesh.ops.scale(bm_in, vec=Vector((0.36, 0.48, 0.12)), verts=rc_pl['verts'])
    bmesh.ops.translate(bm_in, vec=Vector((0.00, FRONT_AXLE_Y, 0.780)), verts=rc_pl['verts'])
    
    # Twin Turbochargers nestled in the "hot-V"
    for sx in [-0.12, 0.12]:
        # Compressor housing
        rc_tb = bmesh.ops.create_cone(bm_in, cap_ends=True, radius1=0.085, radius2=0.050, depth=0.140, segments=24)
        bmesh.ops.rotate(bm_in, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_tb['verts'])
        bmesh.ops.translate(bm_in, vec=Vector((sx, FRONT_AXLE_Y - 0.05, 0.680)), verts=rc_tb['verts'])
        
    obj_in = link_and_finish("GEO_Intake_Plenum_Turbos", "07_Powertrain_Drivetrain", bm_in, mat_carbon, bevel=0.003, subsurf=0)
    created.append(obj_in)

    # ------------------------------------------------------------------------
    # 4. 8-SPEED TRANSMISSION & TORQUE CONVERTER
    # ------------------------------------------------------------------------
    bm_tr = bmesh.new()
    # Bellhousing
    rc_bh = bmesh.ops.create_cone(bm_tr, cap_ends=True, radius1=0.24, radius2=0.18, depth=0.22, segments=24)
    bmesh.ops.rotate(bm_tr, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_bh['verts'])
    bmesh.ops.translate(bm_tr, vec=Vector((0.00, FRONT_AXLE_Y - 0.42, 0.380)), verts=rc_bh['verts'])
    
    # Gearbox case
    rc_gb = bmesh.ops.create_cube(bm_tr, size=1.0)
    bmesh.ops.scale(bm_tr, vec=Vector((0.34, 0.65, 0.28)), verts=rc_gb['verts'])
    bmesh.ops.translate(bm_tr, vec=Vector((0.00, FRONT_AXLE_Y - 0.85, 0.340)), verts=rc_gb['verts'])
    
    obj_tr = link_and_finish("GEO_Transmission_8Speed", "07_Powertrain_Drivetrain", bm_tr, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_tr)

    # ------------------------------------------------------------------------
    # 5. CARBON FIBER DRIVESHAFT & REAR DIFFERENTIAL
    # ------------------------------------------------------------------------
    bm_ds = bmesh.new()
    # Main propshaft
    make_tube(bm_ds, Vector((0.00, FRONT_AXLE_Y - 1.15, 0.320)), Vector((0.00, REAR_AXLE_Y + 0.20, 0.320)), radius=0.045, segments=24)
    
    # Center carrier bearing support
    rc_cb = bmesh.ops.create_cube(bm_ds, size=1.0)
    bmesh.ops.scale(bm_ds, vec=Vector((0.14, 0.08, 0.12)), verts=rc_cb['verts'])
    bmesh.ops.translate(bm_ds, vec=Vector((0.00, 0.00, 0.320)), verts=rc_cb['verts'])
    
    obj_ds = link_and_finish("GEO_Carbon_Driveshaft", "07_Powertrain_Drivetrain", bm_ds, mat_carbon, bevel=0.002, subsurf=0)
    created.append(obj_ds)

    # Rear Limited-Slip Differential
    bm_diff = bmesh.new()
    rc_df = bmesh.ops.create_cube(bm_diff, size=1.0)
    bmesh.ops.scale(bm_diff, vec=Vector((0.36, 0.38, 0.28)), verts=rc_df['verts'])
    bmesh.ops.translate(bm_diff, vec=Vector((0.00, REAR_AXLE_Y, 0.320)), verts=rc_df['verts'])
    
    # Left and Right half-shaft axle tubes
    for sx in [-1, 1]:
        make_tube(bm_diff, Vector((0.00, REAR_AXLE_Y, 0.320)), Vector((sx * 0.74, REAR_AXLE_Y, 0.340)), radius=0.032, segments=20)
        
    obj_diff = link_and_finish("GEO_Rear_Differential", "07_Powertrain_Drivetrain", bm_diff, mat_alum, bevel=0.004, subsurf=0)
    created.append(obj_diff)

    print(f"[SEDAN_POWERTRAIN] Successfully generated {len(created)} powertrain objects.")
    return created
