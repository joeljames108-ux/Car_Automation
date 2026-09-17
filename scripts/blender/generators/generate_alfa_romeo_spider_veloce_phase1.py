"""
=============================================================================
Procedural Class-A CAD Generator: Alfa Romeo Spider Veloce Series 2 (1970s)
PHASE 1: Full Exterior Body Sculpture, Kamm Tail, Wheels & Greenhouse Glass
=============================================================================
Convertible Architecture · 1970s Era Icon (1970–1982 Coda Tronca)
Designed by Pininfarina (Cambiano, Turin, Italy).
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Factory Engineering & Aerodynamic Specifications:
- Wheelbase: 2,250 mm (Front Axle Y = +1.125 m, Rear Axle Y = -1.125 m)
- Overall Length: 4,120 mm (Y from -2.060 m to +2.060 m)
- Overall Width: 1,630 mm (Waistline X = +/- 0.815 m)
- Overall Height: 1,290 mm (Windshield Header Z = 1.290 m, Body Crown Z = 1.050 m)
- Track Width: Front 1,324 mm (X = +/- 0.662 m), Rear 1,274 mm (X = +/- 0.637 m)
- Ground Clearance: 140 mm (Sill base Z = 0.140 m)
- Kerb Weight: ~1,040 kg (53% Front / 47% Rear distribution)
- Aerodynamic Architecture: Pininfarina Kamm-tail (Coda Tronca) truncated transom
- Wheels & Tires:
  * 14 x 6.0J Campagnolo Turbina 16-vane lightweight magnesium-aluminum alloy wheels
  * 185/70 HR14 Michelin XAS / Pirelli Cinturato radial tires (R = 0.307 m, W = 0.185 m)

Phase 1 Architectural Scope:
1. Non-destructive MCP scene purge & reset.
2. Complete PBR Material Suite:
   - Alfa Rosso Corsa Two-Stage Metallic Paint (#C4151C, Clearcoat 1.0)
   - Mirror-Polished Italian Automotive Chrome (Bumpers, Scudetto, Windshield frame)
   - Campagnolo Cast Magnesium-Aluminum Alloy (Wheels, Cam covers, Suspension uprights)
   - Optical Dielectric Windshield Glass (Transmission 0.94, IOR 1.52)
   - Satin Black Trim & Weatherstripping Rubber (Wiper arms, Cowl screen, Seals)
   - Textured Pininfarina Black Vinyl Soft-Top (Folded convertible roof stack)
   - Michelin Radial Tread & Sidewall Rubber with vintage lettering relief
   - Cast Iron & Zinc-Plated Brake Rotors & Calipers
   - Polished Inox Stainless Steel Exhaust System (Headers, Resonator, Twin Tips)
   - Underbody Chassis Structural Satin Black Protective Undercoating
   - Cockpit Enclosure Privacy Blackout Shroud
3. Continuous Watertight Pininfarina Monocoque Body Shell:
   - 42 longitudinal cross-section stations along Y from front nose (+2.060m) to Kamm-tail (-2.060m).
   - Pininfarina scalloped concave waistline flank character groove.
   - Long sweeping engine bonnet with subtle central spine power crease.
   - Truncated Kamm-tail vertical rear transom plate with recessed lighting cradle.
   - Rolled wheel arch flanges and fully open wheel wells (zero draped flaps).
4. Front Scudetto Grille Aperture & Cowl Basin:
   - Triangular heart-shaped Scudetto grille intake pocket on nose.
   - Recessed cowl ventilation trough with stamped intake air louvers.
5. Full Enclosed Wheel Wells & Underbody Aerodynamic Floorpan:
   - Longitudinal boxed chassis frame rails, floor pan stiffening ribs, transmission tunnel.
   - Front and rear inner fender splash liners ensuring zero see-through voids.
6. Period-Correct Front & Rear Chassis Suspension Drivetrain:
   - Front unequal-length double wishbone suspension with coil springs and telescopic dampers.
   - Front anti-roll sway bar with spherical drop links and steering tie-rod linkages.
   - Rear live axle housing with cast differential pumpkin, trailing radius arms, and upper T-arm.
   - Complete 4-2-1 exhaust routing under floorpan with transverse rear silencer and twin tips.
7. Folded Convertible Soft-Top Stack & Tonneau Assembly:
   - Multi-fold textured vinyl roof stack behind seats with chrome hold-down molding.
8. Low Curved Windshield Assembly:
   - Thin chrome A-pillar perimeter surround, optical glass pane, and cowl wiper pivots.
9. 14-inch Campagnolo Turbina Wheels & Michelin Radial Tires:
   - 16 directional turbine cooling vanes, stepped outer rim lip, 5 chrome wheel bolts.
   - Central Alfa Romeo Milanese cross-and-serpent crest hub dust cap.
   - Ventilated brake discs with ATE calipers visible through turbine vanes.
10. Dual-Mode GLB Export:
    - public/models/vehicles/convertible/1970s/vehicle.glb
    - public/models/Car_Alfa_Romeo_Spider_Veloce_1970s.glb
    - exports/Car_Alfa_Romeo_Spider_Veloce_1970s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Compatibility polyfill for bmesh.ops.create_cylinder (which uses create_cone in Blender)
def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=cap_tris,
        segments=segments,
        radius1=r1,
        radius2=r2,
        depth=depth,
        matrix=matrix,
        **kwargs
    )
bmesh.ops.create_cylinder = _compat_create_cylinder

def _compat_create_torus(bm, major_radius=1.0, minor_radius=0.25, major_segments=24, minor_segments=12, matrix=None, **kwargs):
    if matrix is None:
        matrix = Matrix()
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u, sin_u = math.cos(u), math.sin(u)
        ring_center = Vector((major_radius * cos_u, major_radius * sin_u, 0.0))
        radial_dir = Vector((cos_u, sin_u, 0.0))
        z_dir = Vector((0.0, 0.0, 1.0))
        ring_verts = []
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            pos = ring_center + minor_radius * (math.cos(v) * radial_dir + math.sin(v) * z_dir)
            ring_verts.append(bm.verts.new(matrix @ pos))
        verts.append(ring_verts)
    faces = []
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            faces.append(bm.faces.new((verts[i][j], verts[next_i][j], verts[next_i][next_j], verts[i][next_j])))
    return {'verts': [v for ring in verts for v in ring], 'faces': faces}
bmesh.ops.create_torus = _compat_create_torus

# ---------------------------------------------------------------------------
# 1. SCENE CLEANUP & CAMERA / ENVIRONMENT INITIALIZATION
# ---------------------------------------------------------------------------
def reset_scene():
    """Purge all existing objects, meshes, materials, and orphan data blocks."""
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Purge orphan data blocks
    for collection in [bpy.data.meshes, bpy.data.materials, bpy.data.textures, bpy.data.curves]:
        for block in collection:
            if block.users == 0:
                collection.remove(block)

reset_scene()

# ---------------------------------------------------------------------------
# 2. PBR MATERIAL FACTORY
# ---------------------------------------------------------------------------
def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                        specular=0.5, clearcoat=0.0, clearcoat_roughness=0.03,
                        transmission=0.0, ior=1.45, emission_color=(0.0, 0.0, 0.0, 1.0),
                        emission_strength=0.0):
    """Factory helper to construct modern Principled BSDF materials."""
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    
    # Configure parameters
    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    if 'Specular IOR Level' in node_bsdf.inputs:
        node_bsdf.inputs['Specular IOR Level'].default_value = specular
    elif 'Specular' in node_bsdf.inputs:
        node_bsdf.inputs['Specular'].default_value = specular
    
    if 'Coat Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Coat Weight'].default_value = clearcoat
        node_bsdf.inputs['Coat Roughness'].default_value = clearcoat_roughness
    elif 'Clearcoat' in node_bsdf.inputs:
        node_bsdf.inputs['Clearcoat'].default_value = clearcoat
        node_bsdf.inputs['Clearcoat Roughness'].default_value = clearcoat_roughness
        
    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission
        
    node_bsdf.inputs['IOR'].default_value = ior
    
    if 'Emission Color' in node_bsdf.inputs:
        node_bsdf.inputs['Emission Color'].default_value = emission_color
        node_bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif 'Emission' in node_bsdf.inputs:
        node_bsdf.inputs['Emission'].default_value = emission_color
    
    node_output = nodes.new(type='ShaderNodeOutputMaterial')
    node_output.location = (300, 0)
    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_output.inputs['Surface'])
    
    if transmission > 0.05:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'
    
    return mat

print("[SETUP] Constructing Alfa Romeo Spider Veloce PBR Material Suite...")

# 1. Alfa Rosso Corsa Automotive Paint (Deep Italian racing red with clearcoat)
mat_paint = create_pbr_material("Alfa_Rosso_Paint",
                                base_color=(0.77, 0.08, 0.11, 1.0),
                                metallic=0.72,
                                roughness=0.18,
                                clearcoat=1.0,
                                clearcoat_roughness=0.03)

# 2. Mirror-Polished Italian Automotive Chrome (Bumpers, Scudetto, Windshield trim)
mat_chrome = create_pbr_material("Italian_Chrome_Polished",
                                 base_color=(0.95, 0.95, 0.96, 1.0),
                                 metallic=1.0,
                                 roughness=0.04)

# 3. Campagnolo Cast Magnesium-Aluminum Alloy (Wheels, Differential, Suspension)
mat_campagnolo_alloy = create_pbr_material("Campagnolo_Alloy",
                                           base_color=(0.82, 0.82, 0.84, 1.0),
                                           metallic=0.88,
                                           roughness=0.25)

# 4. Optical Dielectric Windshield Glass (Clear float glass)
mat_windshield_glass = create_pbr_material("Optical_Windshield_Glass",
                                           base_color=(0.90, 0.95, 0.96, 1.0),
                                           metallic=0.0,
                                           roughness=0.015,
                                           transmission=0.94,
                                           ior=1.52)

# 5. Satin Black Trim & Gaskets (Rubber moldings, Wiper arms, Louvers)
mat_satin_black_trim = create_pbr_material("Satin_Black_Trim",
                                           base_color=(0.04, 0.04, 0.04, 1.0),
                                           metallic=0.15,
                                           roughness=0.55)

# 6. Textured Black Vinyl Soft-Top (Folded convertible roof stack)
mat_soft_top_vinyl = create_pbr_material("Folded_Soft_Top_Vinyl",
                                         base_color=(0.05, 0.05, 0.05, 1.0),
                                         metallic=0.05,
                                         roughness=0.82)

# 7. Michelin Vintage Radial Tire Rubber (High-traction synthetic rubber)
mat_tire_rubber = create_pbr_material("Michelin_Tire_Rubber",
                                      base_color=(0.03, 0.03, 0.03, 1.0),
                                      metallic=0.0,
                                      roughness=0.85)

# 8. Brake Rotor Cast Steel (Cross-ground friction disc surface)
mat_brake_rotor = create_pbr_material("Brake_Rotor_Steel",
                                      base_color=(0.65, 0.65, 0.67, 1.0),
                                      metallic=0.92,
                                      roughness=0.28)

# 9. Zinc-Plated Brake Caliper (Vintage ATE cast iron caliper)
mat_brake_caliper = create_pbr_material("Brake_Caliper_Zinc",
                                        base_color=(0.58, 0.55, 0.48, 1.0),
                                        metallic=0.75,
                                        roughness=0.38)

# 10. Polished Inox Stainless Exhaust (Exhaust pipes, muffler, twin tips)
mat_exhaust_inox = create_pbr_material("Exhaust_Polished_Inox",
                                       base_color=(0.88, 0.88, 0.90, 1.0),
                                       metallic=0.96,
                                       roughness=0.12)

# 11. Chassis Underbody Protective Satin Black (Semi-gloss undercoating)
mat_chassis_underbody = create_pbr_material("Chassis_Underbody_Coating",
                                            base_color=(0.035, 0.035, 0.035, 1.0),
                                            metallic=0.10,
                                            roughness=0.70)

# 12. Cockpit Privacy Blackout Shroud (Interior cavity blackout)
mat_cockpit_shroud = create_pbr_material("Cockpit_Privacy_Blackout",
                                         base_color=(0.02, 0.02, 0.02, 1.0),
                                         metallic=0.0,
                                         roughness=0.90)

# 13. Polycarbonate Clear Headlamp Glass
mat_headlamp_glass = create_pbr_material("Clear_Headlamp_Glass",
                                         base_color=(0.95, 0.95, 0.98, 1.0),
                                         metallic=0.0,
                                         roughness=0.02,
                                         transmission=0.92,
                                         ior=1.58)

# 14. Amber Turn Indicator Prismatic Glass
mat_amber_indicator = create_pbr_material("Amber_Indicator_Glass",
                                          base_color=(0.95, 0.45, 0.02, 1.0),
                                          metallic=0.1,
                                          roughness=0.05,
                                          transmission=0.75,
                                          ior=1.56)

# 15. Ruby Red Taillamp Prismatic Glass
mat_ruby_taillamp = create_pbr_material("Ruby_Taillamp_Glass",
                                        base_color=(0.85, 0.02, 0.02, 1.0),
                                        metallic=0.1,
                                        roughness=0.05,
                                        transmission=0.70,
                                        ior=1.56)

# ---------------------------------------------------------------------------
# 3. MATHEMATICAL & CAD GEOMETRIC UTILITY FUNCTIONS
# ---------------------------------------------------------------------------
def add_bevel_modifier(obj, width=0.003, segments=2, angle_limit=35.0):
    """Apply precision angle-limited CAD edge bevel to eliminate razor corners."""
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(angle_limit)
    mod.profile = 0.7
    return mod

def add_weighted_normal_modifier(obj):
    """Apply weighted normal modifier to ensure flawless Class-A shading highlights."""
    mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    mod.keep_sharp = True
    return mod

def weld_and_smooth(obj, merge_dist=0.0002, smooth_angle_deg=34.0):
    """Weld coincident quad-mesh vertices and apply shade smooth by angle."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=merge_dist)
    bm.to_mesh(obj.data)
    bm.free()
    
    # Blender 4.x/5.x shade smooth by angle operation
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(smooth_angle_deg))
    except Exception:
        for p in obj.data.polygons:
            p.use_smooth = True

def create_cylinder_mesh(name, radius=0.1, depth=0.2, segments=24, cap_ends=True, material=None):
    """Generate a clean quad/cylinder mesh aligned to Z axis."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    bmesh.ops.create_cylinder(bm, cap_ends=cap_ends, cap_tris=False,
                              segments=segments, radius=radius, depth=depth)
    bm.to_mesh(mesh)
    bm.free()
    
    if material:
        obj.data.materials.append(material)
    weld_and_smooth(obj)
    return obj

def create_lathe_mesh(name, profile_coords, segments=24, material=None):
    """Construct a rotational axisymmetric lathe CAD mesh around the X or Y axis."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    # Create rings along profile
    ring_verts = []
    for r_idx, (px, py, radius) in enumerate(profile_coords):
        curr_ring = []
        for s in range(segments):
            ang = 2.0 * math.pi * s / segments
            y = py + radius * math.cos(ang)
            z = radius * math.sin(ang)
            v = bm.verts.new((px, y, z))
            curr_ring.append(v)
        ring_verts.append(curr_ring)
        
    for r in range(len(profile_coords) - 1):
        r1 = ring_verts[r]
        r2 = ring_verts[r + 1]
        for s in range(segments):
            s_next = (s + 1) % segments
            bm.faces.new([r1[s], r1[s_next], r2[s_next], r2[s]])
            
    bm.to_mesh(mesh)
    bm.free()
    if material:
        obj.data.materials.append(material)
    weld_and_smooth(obj)
    return obj

print("[READY] Part 1 initialization complete.")


# ---------------------------------------------------------------------------
# 4. PININFARINA MONOCOQUE BODY SHELL & CONTINUOUS FLANK STATION LOFTER
# ---------------------------------------------------------------------------
print("[SCULPTURE] Constructing Pininfarina Monocoque Body Shell & Stations...")

def build_alfa_spider_monocoque():
    """
    Constructs the Class-A continuous monocoque exterior body shell of the
    Alfa Romeo Spider Veloce Series 2 Coda Tronca using a multi-station
    parametric bmesh lofter with 46 longitudinal stations.
    """
    body_mesh = bpy.data.meshes.new("Alfa_Spider_Body_Mesh")
    body_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Body", body_mesh)
    bpy.context.collection.objects.link(body_obj)
    
    bm = bmesh.new()
    
    # 46 Longitudinal Stations from Front Nose (+2.060 m) to Kamm Tail (-2.060 m)
    # Wheelbase = 2,250 mm (Front Axle Y = +1.125 m, Rear Axle Y = -1.125 m)
    stations_y = [
        # Front nose & Scudetto apex (+2.060 to +1.800)
        2.060, 2.030, 1.980, 1.920, 1.850, 1.780, 1.700, 1.620,
        # Front fender & headlamp sweep (+1.620 to +1.125)
        1.540, 1.460, 1.380, 1.300, 1.220, 1.125, 1.030, 0.940,
        # Front wheel arch exit & hood transition (+0.940 to +0.680)
        0.860, 0.780, 0.700,
        # Cowl trough & Windshield base (+0.700 to +0.550)
        0.650, 0.580,
        # Cockpit opening & Doors (+0.550 to -0.550)
        0.480, 0.360, 0.220, 0.080, -0.060, -0.200, -0.340, -0.460, -0.560,
        # Rear deck & Soft-top well transition (-0.560 to -0.850)
        -0.660, -0.760, -0.860,
        # Rear haunches & Rear wheel arch (-0.860 to -1.450)
        -0.960, -1.060, -1.125, -1.220, -1.320, -1.420,
        # Rear quarter & Kamm tail approach (-1.420 to -1.950)
        -1.520, -1.620, -1.720, -1.820, -1.920, -1.990,
        # Truncated Kamm-tail vertical transom (-2.060)
        -2.060
    ]
    
    # Store station vertices for driver (+X) and passenger (-X)
    station_rings = []
    
    for y in stations_y:
        # Interpolate station characteristics
        # Front overhang: Y > 1.125
        # Wheelbase: -1.125 <= Y <= 1.125
        # Rear overhang: Y < -1.125
        
        # 1. Height profiles
        if y >= 1.600:
            # Front nose tapering down
            t = (y - 1.600) / (2.060 - 1.600)
            z_keel = 0.220 + 0.060 * t
            z_sill = 0.240 + 0.080 * t
            z_scallop = 0.440 + 0.040 * t
            z_fender = 0.680 - 0.120 * t
            z_deck = 0.700 - 0.140 * t
            z_spine = 0.720 - 0.140 * t
            width_factor = 1.0 - 0.35 * (t ** 1.4)
        elif y >= 0.650:
            # Front hood & fender sweep
            t = (y - 0.650) / (1.600 - 0.650)
            z_keel = 0.160 + 0.060 * (t ** 2)
            z_sill = 0.180 + 0.060 * t
            z_scallop = 0.460 - 0.020 * t
            z_fender = 0.770 - 0.090 * t
            z_deck = 0.810 - 0.110 * t
            z_spine = 0.830 - 0.110 * t
            width_factor = 0.98 + 0.02 * math.sin(t * math.pi)
        elif y >= -0.650:
            # Cockpit section (doors and waistline)
            t = (y - (-0.650)) / (0.650 - (-0.650))
            z_keel = 0.140
            z_sill = 0.160
            z_scallop = 0.470
            z_fender = 0.780
            z_deck = 0.820
            z_spine = 0.830
            width_factor = 1.00
        elif y >= -1.450:
            # Rear haunches swelling slightly over rear wheels
            t = (y - (-1.450)) / (-0.650 - (-1.450))
            z_keel = 0.140 + 0.040 * (1.0 - t)
            z_sill = 0.160 + 0.050 * (1.0 - t)
            z_scallop = 0.475
            z_fender = 0.795 + 0.020 * math.sin((1.0 - t) * math.pi)
            z_deck = 0.825 + 0.015 * math.sin((1.0 - t) * math.pi)
            z_spine = 0.835 + 0.015 * math.sin((1.0 - t) * math.pi)
            width_factor = 1.00 + 0.025 * math.sin((1.0 - t) * math.pi)
        else:
            # Rear Kamm tail tapering
            t = (-1.450 - y) / (-1.450 - (-2.060))
            z_keel = 0.180 + 0.140 * (t ** 1.2)
            z_sill = 0.210 + 0.140 * t
            z_scallop = 0.480 + 0.020 * t
            z_fender = 0.795 - 0.015 * t
            z_deck = 0.825 - 0.010 * t
            z_spine = 0.835 - 0.010 * t
            width_factor = 1.00 - 0.12 * (t ** 1.3)
            
        # Maximum half width at this station
        half_w = 0.815 * width_factor
        
        # Check if station falls inside wheel arch cutouts
        # Front wheel arch: center Y = 1.125, arch cutout Y from 0.775 to 1.475
        is_front_wheel_arch = (0.775 <= y <= 1.475)
        # Rear wheel arch: center Y = -1.125, arch cutout Y from -1.475 to -0.775
        is_rear_wheel_arch = (-1.475 <= y <= -0.775)
        
        arch_radius = 0.355
        if is_front_wheel_arch:
            dy = abs(y - 1.125)
            if dy < arch_radius:
                arch_opening_z = 0.307 + math.sqrt(max(0.0, arch_radius**2 - dy**2))
            else:
                arch_opening_z = z_sill
        elif is_rear_wheel_arch:
            dy = abs(y - (-1.125))
            if dy < arch_radius:
                arch_opening_z = 0.307 + math.sqrt(max(0.0, arch_radius**2 - dy**2))
            else:
                arch_opening_z = z_sill
        else:
            arch_opening_z = None
            
        # Is this station within the cockpit opening?
        is_cockpit = (-0.580 <= y <= 0.620)
        
        # Define 10 node coordinates on Driver Side (+X)
        # 0: Center Keel (X=0)
        # 1: Floorpan chine
        # 2: Lower Rocker Sill
        # 3: Flank Lower Belly
        # 4: Pininfarina Waistline Scallop (concave character flute)
        # 5: Flank Upper Crest (shoulder)
        # 6: Beltline / Fender Crown
        # 7: Deck / Hood / Cockpit Sill
        # 8: Inboard Hood / Boot
        # 9: Centerline Spine (X=0)
        
        p0 = Vector((0.0, y, z_keel))
        p1 = Vector((half_w * 0.45, y, z_keel + 0.015))
        
        if arch_opening_z is not None:
            # Wheel arch opening lifts the sill node up
            p2 = Vector((half_w * 0.88, y, max(z_sill, arch_opening_z * 0.92)))
            p3 = Vector((half_w * 0.94, y, max(z_scallop * 0.90, arch_opening_z)))
        else:
            p2 = Vector((half_w * 0.88, y, z_sill))
            p3 = Vector((half_w * 0.97, y, (z_sill + z_scallop) * 0.5))
            
        # Scallop is slightly concave (Pininfarina signature flute)
        p4 = Vector((half_w * 0.985, y, z_scallop))
        p5 = Vector((half_w * 0.965, y, (z_scallop + z_fender) * 0.5))
        p6 = Vector((half_w * 0.930, y, z_fender))
        
        if is_cockpit:
            # Cockpit coaming ledge
            p7 = Vector((half_w * 0.820, y, z_deck))
            p8 = Vector((half_w * 0.750, y, z_deck - 0.035))
            p9 = Vector((half_w * 0.680, y, z_deck - 0.060))
        else:
            p7 = Vector((half_w * 0.720, y, z_deck))
            p8 = Vector((half_w * 0.380, y, z_deck + 0.010))
            p9 = Vector((0.0, y, z_spine))
            
        # Create bmesh vertices for this station (Left + Right symmetry)
        pts_right = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9]
        
        ring_verts = []
        # Add driver side (+X)
        for pt in pts_right:
            v = bm.verts.new(pt)
            ring_verts.append(v)
            
        # Add passenger side (-X) mirroring X
        pts_left = [Vector((-pt.x, pt.y, pt.z)) for pt in pts_right]
        ring_verts_left = []
        for pt in pts_left:
            v = bm.verts.new(pt)
            ring_verts_left.append(v)
            
        station_rings.append((ring_verts, ring_verts_left))
        
    # Loft adjacent station rings with clean quad faces
    num_pts = len(station_rings[0][0])
    for s_idx in range(len(station_rings) - 1):
        r1_r, r1_l = station_rings[s_idx]
        r2_r, r2_l = station_rings[s_idx + 1]
        
        # Right (+X) side quad strips
        for p in range(num_pts - 1):
            v1 = r1_r[p]
            v2 = r1_r[p + 1]
            v3 = r2_r[p + 1]
            v4 = r2_r[p]
            bm.faces.new([v1, v2, v3, v4])
            
        # Left (-X) side quad strips
        for p in range(num_pts - 1):
            v1 = r1_l[p]
            v2 = r1_l[p + 1]
            v3 = r2_l[p + 1]
            v4 = r2_l[p]
            bm.faces.new([v4, v3, v2, v1])
            
        # Connect center bottom seam (between r1_r[0] and r1_l[0])
        # Since p0.x == 0, vertices can be welded or lofted
        # Connect center top seam (between r1_r[9] and r1_l[9]) if not cockpit
        y_curr = stations_y[s_idx]
        if not (-0.580 <= y_curr <= 0.620):
            v_top1_r = r1_r[num_pts - 1]
            v_top1_l = r1_l[num_pts - 1]
            v_top2_l = r2_l[num_pts - 1]
            v_top2_r = r2_r[num_pts - 1]
            if abs(v_top1_r.co.x) < 0.001 and abs(v_top1_l.co.x) < 0.001:
                pass # Seam vertices weld coincident
                
    # -----------------------------------------------------------------------
    # Front Nose Cap & Scudetto Shield Pocket
    # -----------------------------------------------------------------------
    # Cap front station at Y = +2.060 m with aerodynamic rounded leading edge
    front_r, front_l = station_rings[0]
    front_center = bm.verts.new((0.0, 2.065, 0.450))
    for p in range(len(front_r) - 1):
        bm.faces.new([front_r[p], front_r[p+1], front_center])
        bm.faces.new([front_l[p+1], front_l[p], front_center])
        
    # -----------------------------------------------------------------------
    # Truncated Kamm-Tail (Coda Tronca) Rear Transom Plate
    # -----------------------------------------------------------------------
    # Authentic Series 2 cut-off vertical transom wall at Y = -2.060 m
    rear_r, rear_l = station_rings[-1]
    # Build a flat inset rear panel
    kamm_center = bm.verts.new((0.0, -2.060, 0.520))
    kamm_mid_r = bm.verts.new((0.450, -2.060, 0.520))
    kamm_mid_l = bm.verts.new((-0.450, -2.060, 0.520))
    
    for p in range(len(rear_r) - 1):
        bm.faces.new([rear_r[p+1], rear_r[p], kamm_mid_r])
        bm.faces.new([rear_l[p], rear_l[p+1], kamm_mid_l])
    bm.faces.new([kamm_mid_r, rear_r[0], rear_l[0], kamm_mid_l])
    bm.faces.new([rear_r[-1], kamm_mid_r, kamm_center])
    bm.faces.new([kamm_mid_l, rear_l[-1], kamm_center])
    bm.faces.new([kamm_center, kamm_mid_r, kamm_mid_l])
    
    bm.to_mesh(body_mesh)
    bm.free()
    
    body_obj.data.materials.append(mat_paint)
    weld_and_smooth(body_obj, merge_dist=0.0005, smooth_angle_deg=34.0)
    add_bevel_modifier(body_obj, width=0.0025, segments=2, angle_limit=35.0)
    add_weighted_normal_modifier(body_obj)
    
    return body_obj

body_monocoque = build_alfa_spider_monocoque()
print("[SCULPTURE] Body monocoque successfully generated.")


# ---------------------------------------------------------------------------
# 5. HOOD, REAR DECKLID, COWL VENTILATION BASIN & WHEEL TUBS
# ---------------------------------------------------------------------------
print("[SCULPTURE] Building Front Hood, Cowl Basin, Rear Deck & Wheel Tubs...")

def build_alfa_spider_hood():
    """
    Constructs the long sculpted front engine bonnet with central spine crease
    and realistic panel shutline offsets.
    """
    hood_mesh = bpy.data.meshes.new("Alfa_Spider_Hood_Mesh")
    hood_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Hood", hood_mesh)
    bpy.context.collection.objects.link(hood_obj)
    
    bm = bmesh.new()
    
    # 22 Longitudinal slices along Y from nose (+1.880m) to cowl (+0.680m)
    y_steps = 22
    x_steps = 14
    
    y_min, y_max = 0.680, 1.880
    
    grid_verts = []
    for yi in range(y_steps):
        t_y = yi / (y_steps - 1)
        y = y_min + (y_max - y_min) * t_y
        
        # Determine half width at this Y
        if y > 1.600:
            w_max = 0.480 * (1.0 - 0.25 * ((y - 1.600) / 0.280)**1.2)
            z_base = 0.720 - 0.120 * ((y - 1.600) / 0.280)
        else:
            w_max = 0.560 - 0.080 * ((y - 0.680) / 0.920)
            z_base = 0.825 - 0.105 * ((y - 0.680) / 0.920)
            
        row = []
        for xi in range(x_steps):
            t_x = (xi / (x_steps - 1)) * 2.0 - 1.0 # -1 to +1
            x = t_x * w_max
            
            # Crown curve: parabolic droop toward fender shutlines
            parabola = (1.0 - (t_x ** 2)) * 0.025
            
            # Central spine crease (subtle 8mm triangular peak along center)
            crease = max(0.0, 0.008 * (1.0 - abs(t_x * 8.0)))
            
            z = z_base + parabola + crease
            v = bm.verts.new((x, y, z))
            row.append(v)
        grid_verts.append(row)
        
    for yi in range(y_steps - 1):
        for xi in range(x_steps - 1):
            v1 = grid_verts[yi][xi]
            v2 = grid_verts[yi][xi + 1]
            v3 = grid_verts[yi + 1][xi + 1]
            v4 = grid_verts[yi + 1][xi]
            bm.faces.new([v1, v2, v3, v4])
            
    bm.to_mesh(hood_mesh)
    bm.free()
    
    hood_obj.data.materials.append(mat_paint)
    weld_and_smooth(hood_obj, merge_dist=0.0002, smooth_angle_deg=34.0)
    add_bevel_modifier(hood_obj, width=0.002, segments=2, angle_limit=32.0)
    add_weighted_normal_modifier(hood_obj)
    return hood_obj

def build_alfa_spider_cowl_trough():
    """
    Constructs the recessed drainage basin and ventilation air intake louver grille
    between the engine bonnet and the windshield base (Y = +0.650m to +0.680m).
    """
    cowl_mesh = bpy.data.meshes.new("Alfa_Spider_Cowl_Mesh")
    cowl_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Cowl_Grille", cowl_mesh)
    bpy.context.collection.objects.link(cowl_obj)
    
    bm = bmesh.new()
    
    # Cowl basin floor
    v1 = bm.verts.new((-0.550, 0.650, 0.810))
    v2 = bm.verts.new(( 0.550, 0.650, 0.810))
    v3 = bm.verts.new(( 0.550, 0.680, 0.800))
    v4 = bm.verts.new((-0.550, 0.680, 0.800))
    bm.faces.new([v1, v2, v3, v4])
    
    # 14 Stamped transverse ventilation louvers
    num_louvers = 14
    for i in range(num_louvers):
        lx = -0.420 + i * (0.840 / (num_louvers - 1))
        # Thin raised louver fin
        lv1 = bm.verts.new((lx - 0.015, 0.655, 0.812))
        lv2 = bm.verts.new((lx + 0.015, 0.655, 0.812))
        lv3 = bm.verts.new((lx + 0.015, 0.675, 0.808))
        lv4 = bm.verts.new((lx - 0.015, 0.675, 0.808))
        bm.faces.new([lv1, lv2, lv3, lv4])
        
    bm.to_mesh(cowl_mesh)
    bm.free()
    
    cowl_obj.data.materials.append(mat_satin_black_trim)
    weld_and_smooth(cowl_obj)
    return cowl_obj

def build_alfa_spider_rear_decklid():
    """
    Constructs the flat, low rear decklid (boot lid) extending from the soft-top
    well (-0.720m) to the Kamm-tail trailing lip (-2.040m).
    """
    deck_mesh = bpy.data.meshes.new("Alfa_Spider_Decklid_Mesh")
    deck_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Decklid", deck_mesh)
    bpy.context.collection.objects.link(deck_obj)
    
    bm = bmesh.new()
    
    y_steps = 20
    x_steps = 14
    y_start = -0.720
    y_end = -2.040
    
    grid_verts = []
    for yi in range(y_steps):
        t_y = yi / (y_steps - 1)
        y = y_start + (y_end - y_start) * t_y
        
        # Width tapers gently toward the Kamm tail
        w_max = 0.540 - 0.090 * (t_y ** 1.3)
        z_base = 0.825 - 0.015 * t_y
        
        # Slight upward kick at the very trailing edge (Kamm aero lip)
        if t_y > 0.88:
            kick = 0.008 * ((t_y - 0.88) / 0.12) ** 2
        else:
            kick = 0.0
            
        row = []
        for xi in range(x_steps):
            t_x = (xi / (x_steps - 1)) * 2.0 - 1.0 # -1 to +1
            x = t_x * w_max
            # Subtle parabolic crown (15mm)
            parabola = (1.0 - (t_x ** 2)) * 0.015
            z = z_base + parabola + kick
            v = bm.verts.new((x, y, z))
            row.append(v)
        grid_verts.append(row)
        
    for yi in range(y_steps - 1):
        for xi in range(x_steps - 1):
            v1 = grid_verts[yi][xi]
            v2 = grid_verts[yi][xi + 1]
            v3 = grid_verts[yi + 1][xi + 1]
            v4 = grid_verts[yi + 1][xi]
            bm.faces.new([v1, v2, v3, v4])
            
    bm.to_mesh(deck_mesh)
    bm.free()
    
    deck_obj.data.materials.append(mat_paint)
    weld_and_smooth(deck_obj, merge_dist=0.0002, smooth_angle_deg=34.0)
    add_bevel_modifier(deck_obj, width=0.002, segments=2, angle_limit=32.0)
    add_weighted_normal_modifier(deck_obj)
    return deck_obj

def build_alfa_spider_wheel_tubs():
    """
    Constructs deep enclosed inner wheel tubs and splash aprons for all 4 corners
    to guarantee zero see-through voids from any viewing angle.
    """
    tubs_mesh = bpy.data.meshes.new("Alfa_Spider_Wheel_Tubs_Mesh")
    tubs_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Wheel_Tubs", tubs_mesh)
    bpy.context.collection.objects.link(tubs_obj)
    
    bm = bmesh.new()
    
    corners = [
        ("FL",  0.662,  1.125), # Front Left
        ("FR", -0.662,  1.125), # Front Right
        ("RL",  0.637, -1.125), # Rear Left
        ("RR", -0.637, -1.125), # Rear Right
    ]
    
    tub_radius = 0.365
    tub_width = 0.220
    segments = 18
    
    for name, cx, cy in corners:
        is_left = cx > 0
        sign_x = 1.0 if is_left else -1.0
        
        # Arch sweep from 15 deg to 165 deg
        outer_rim = []
        inner_wall = []
        
        for s in range(segments + 1):
            ang = math.radians(15.0 + s * (150.0 / segments))
            dy = tub_radius * math.cos(ang)
            dz = tub_radius * math.sin(ang)
            
            y_pos = cy + dy
            z_pos = 0.307 + dz
            
            # Outer flange near wheel opening
            x_outer = cx + sign_x * 0.080
            # Inner tub wall closer to center tunnel
            x_inner = cx - sign_x * tub_width
            
            vo = bm.verts.new((x_outer, y_pos, z_pos))
            vi = bm.verts.new((x_inner, y_pos, z_pos))
            outer_rim.append(vo)
            inner_wall.append(vi)
            
        # Loft outer to inner tub barrel
        for s in range(segments):
            v1 = outer_rim[s]
            v2 = outer_rim[s + 1]
            v3 = inner_wall[s + 1]
            v4 = inner_wall[s]
            if is_left:
                bm.faces.new([v1, v2, v3, v4])
            else:
                bm.faces.new([v4, v3, v2, v1])
                
        # Close the vertical inner bulkhead plate
        bulkhead_center = bm.verts.new((cx - sign_x * tub_width, cy, 0.307))
        for s in range(segments):
            v1 = inner_wall[s]
            v2 = inner_wall[s + 1]
            if is_left:
                bm.faces.new([v2, v1, bulkhead_center])
            else:
                bm.faces.new([v1, v2, bulkhead_center])
                
    bm.to_mesh(tubs_mesh)
    bm.free()
    
    tubs_obj.data.materials.append(mat_chassis_underbody)
    weld_and_smooth(tubs_obj)
    return tubs_obj

spider_hood = build_alfa_spider_hood()
spider_cowl = build_alfa_spider_cowl_trough()
spider_deck = build_alfa_spider_rear_decklid()
spider_tubs = build_alfa_spider_wheel_tubs()
print("[SCULPTURE] Hood, Cowl, Decklid and Wheel Tubs complete.")


# ---------------------------------------------------------------------------
# 6. STRUCTURAL CHASSIS UNDERBODY, SUSPENSION & INOX EXHAUST SYSTEM
# ---------------------------------------------------------------------------
print("[MECHANICAL] Engineering Underbody Chassis, Suspension & Exhaust...")

def build_alfa_spider_underbody_chassis():
    """
    Constructs the complete underbody structural floorpan, dual boxed frame rails,
    central transmission tunnel, floorpan reinforcing ribs, and rear spare tire tub.
    """
    chassis_mesh = bpy.data.meshes.new("Alfa_Spider_Chassis_Mesh")
    chassis_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Chassis_Platform", chassis_mesh)
    bpy.context.collection.objects.link(chassis_obj)
    
    bm = bmesh.new()
    
    # 1. Main Floorpan Plates (Left and Right of central tunnel)
    y_steps = 18
    y_start = 1.050
    y_end = -1.650
    
    for side in [1.0, -1.0]:
        x_tunnel = 0.160 * side
        x_outer = 0.620 * side
        
        row_inner = []
        row_mid = []
        row_outer = []
        
        for yi in range(y_steps):
            y = y_start + (y_end - y_start) * (yi / (y_steps - 1))
            z = 0.165
            
            vi = bm.verts.new((x_tunnel, y, z))
            vm = bm.verts.new(((x_tunnel + x_outer)*0.5, y, z - 0.008))
            vo = bm.verts.new((x_outer, y, z))
            row_inner.append(vi)
            row_mid.append(vm)
            row_outer.append(vo)
            
        for yi in range(y_steps - 1):
            # Inner quad
            if side > 0:
                bm.faces.new([row_inner[yi], row_mid[yi], row_mid[yi+1], row_inner[yi+1]])
                bm.faces.new([row_mid[yi], row_outer[yi], row_outer[yi+1], row_mid[yi+1]])
            else:
                bm.faces.new([row_inner[yi+1], row_mid[yi+1], row_mid[yi], row_inner[yi]])
                bm.faces.new([row_mid[yi+1], row_outer[yi+1], row_outer[yi], row_mid[yi]])
                
    # 2. Central Transmission & Driveshaft Tunnel (Arched spine)
    tunnel_segs = 8
    tunnel_rings = []
    for yi in range(y_steps):
        y = y_start + (y_end - y_start) * (yi / (y_steps - 1))
        # Front of tunnel is wider for gearbox bellhousing
        bell_factor = 1.4 if y > 0.400 else 1.0
        w_tun = 0.160 * bell_factor
        h_tun = 0.180 if y > 0.400 else 0.120
        
        ring = []
        for ti in range(tunnel_segs + 1):
            ang = math.pi * (ti / tunnel_segs) # 0 to pi
            x = w_tun * math.cos(ang)
            z = 0.165 + h_tun * math.sin(ang)
            v = bm.verts.new((x, y, z))
            ring.append(v)
        tunnel_rings.append(ring)
        
    for yi in range(y_steps - 1):
        r1 = tunnel_rings[yi]
        r2 = tunnel_rings[yi + 1]
        for ti in range(tunnel_segs):
            bm.faces.new([r1[ti], r2[ti], r2[ti+1], r1[ti+1]])
            
    # 3. Dual Longitudinal Boxed Chassis Frame Rails (Under floorpan)
    for side in [0.380, -0.380]:
        # Rectangular extruded tube along Y
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((side, -0.300, 0.135)) @ 
                              Matrix.Scale(0.060, 4, Vector((1,0,0))) @
                              Matrix.Scale(2.700, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.060, 4, Vector((0,0,1))))
                              
    # 4. Rear Spare Wheel Well Tub (Under boot floor)
    tub_center = Vector((0.0, -1.680, 0.220))
    bmesh.ops.create_cylinder(bm, cap_ends=True, cap_tris=False, segments=20,
                              radius=0.280, depth=0.160,
                              matrix=Matrix.Translation(tub_center))
                              
    bm.to_mesh(chassis_mesh)
    bm.free()
    
    chassis_obj.data.materials.append(mat_chassis_underbody)
    weld_and_smooth(chassis_obj)
    return chassis_obj

def build_alfa_spider_front_suspension():
    """
    Constructs the authentic 1970s Alfa Romeo front unequal-length double wishbone
    suspension, crossmember subframe, coilovers, anti-roll bar, and steering linkage.
    """
    susp_mesh = bpy.data.meshes.new("Alfa_Spider_Front_Susp_Mesh")
    susp_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Front_Suspension", susp_mesh)
    bpy.context.collection.objects.link(susp_obj)
    
    bm = bmesh.new()
    
    fy = 1.125 # Front Axle Y
    
    # 1. Front Heavy Steel Crossmember Subframe Cradle
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, fy, 0.170)) @
                          Matrix.Scale(0.880, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.180, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.070, 4, Vector((0,0,1))))
                          
    # 2. Steering Rack & Pinion Box & Tie Rods
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.025, depth=0.550,
                              matrix=Matrix.Translation((0.0, fy - 0.080, 0.220)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                              
    for side in [1.0, -1.0]:
        sx = 0.662 * side
        
        # Tie-rod shaft from rack to knuckle
        p_rack = Vector((0.275 * side, fy - 0.080, 0.220))
        p_knuckle = Vector((sx - 0.080 * side, fy - 0.060, 0.260))
        mid = (p_rack + p_knuckle) * 0.5
        length = (p_knuckle - p_rack).length
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.012, depth=length,
                                  matrix=Matrix.Translation(mid) @ 
                                  (p_knuckle - p_rack).to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
        # Lower Stamped Steel A-Arm (Triangular wishbone)
        p_chassis_f = Vector((0.240 * side, fy + 0.120, 0.180))
        p_chassis_r = Vector((0.240 * side, fy - 0.120, 0.180))
        p_ball_lower = Vector((sx - 0.070 * side, fy, 0.190))
        
        # Front leg
        v_leg_f = (p_ball_lower - p_chassis_f)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.016, depth=v_leg_f.length,
                                  matrix=Matrix.Translation((p_chassis_f + p_ball_lower)*0.5) @
                                  v_leg_f.to_track_quat('Z', 'Y').to_matrix().to_4x4())
        # Rear leg
        v_leg_r = (p_ball_lower - p_chassis_r)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.016, depth=v_leg_r.length,
                                  matrix=Matrix.Translation((p_chassis_r + p_ball_lower)*0.5) @
                                  v_leg_r.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
        # Upper Wishbone Arm
        p_up_chassis = Vector((0.280 * side, fy, 0.360))
        p_up_ball = Vector((sx - 0.085 * side, fy, 0.370))
        v_up = (p_up_ball - p_up_chassis)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.014, depth=v_up.length,
                                  matrix=Matrix.Translation((p_up_chassis + p_up_ball)*0.5) @
                                  v_up.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
        # Steering Knuckle / Upright
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((sx - 0.075 * side, fy, 0.280)) @
                              Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.055, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.200, 4, Vector((0,0,1))))
                              
        # Helical Progressive Coil Spring & Telescopic Shock Damper
        damper_top = Vector((0.360 * side, fy, 0.440))
        damper_bot = Vector((sx - 0.120 * side, fy, 0.200))
        v_damp = (damper_top - damper_bot)
        # Damper body
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.024, depth=v_damp.length,
                                  matrix=Matrix.Translation((damper_top + damper_bot)*0.5) @
                                  v_damp.to_track_quat('Z', 'Y').to_matrix().to_4x4())
        # Coil spring surrounding damper
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.044, depth=v_damp.length * 0.70,
                                  matrix=Matrix.Translation(damper_bot + v_damp * 0.45) @
                                  v_damp.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
    # Front Anti-Roll Sway Bar
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.012, depth=0.780,
                              matrix=Matrix.Translation((0.0, fy + 0.180, 0.210)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                              
    bm.to_mesh(susp_mesh)
    bm.free()
    
    susp_obj.data.materials.append(mat_campagnolo_alloy)
    weld_and_smooth(susp_obj)
    return susp_obj

def build_alfa_spider_rear_live_axle():
    """
    Constructs the authentic 1970s Alfa Romeo Spider live rear axle with cast aluminum
    differential pumpkin casing, axle tubes, trailing radius arms, and upper T-arm.
    """
    axle_mesh = bpy.data.meshes.new("Alfa_Spider_Rear_Axle_Mesh")
    axle_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Rear_Live_Axle", axle_mesh)
    bpy.context.collection.objects.link(axle_obj)
    
    bm = bmesh.new()
    
    ry = -1.125 # Rear Axle Y
    rz = 0.307  # Wheel center Z
    
    # 1. Cast Aluminum Differential Pumpkin Housing
    diff_center = Vector((0.0, ry, rz))
    # Spherical center bulb
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.115,
                              matrix=Matrix.Translation(diff_center))
    # Pinion snout pointing forward to driveshaft
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.055, depth=0.180,
                              matrix=Matrix.Translation((0.0, ry + 0.090, rz)) @
                              Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())
                              
    # Differential vertical cooling fins (5 fins)
    for i in range(-2, 3):
        fx = i * 0.025
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((fx, ry - 0.080, rz)) @
                              Matrix.Scale(0.005, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.050, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.120, 4, Vector((0,0,1))))
                              
    # 2. Steel Axle Tubes (Left and Right)
    for side in [1.0, -1.0]:
        tube_len = 0.520
        tube_x = (0.070 + tube_len * 0.5) * side
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.038, depth=tube_len,
                                  matrix=Matrix.Translation((tube_x, ry, rz)) @
                                  Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                                  
        # Lower Trailing Radius Arm (Connects chassis rail to axle tube)
        p_chassis = Vector((0.380 * side, ry + 0.650, 0.200))
        p_axle = Vector((0.480 * side, ry, rz - 0.030))
        v_arm = (p_axle - p_chassis)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.016, depth=v_arm.length,
                                  matrix=Matrix.Translation((p_chassis + p_axle)*0.5) @
                                  v_arm.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
        # Rear Helical Coil Spring
        spring_bot = Vector((0.440 * side, ry, rz + 0.040))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.050, depth=0.220,
                                  matrix=Matrix.Translation((0.440 * side, ry, rz + 0.150)))
                                  
        # Rear Telescopic Shock Absorber
        shock_bot = Vector((0.500 * side, ry - 0.040, rz))
        shock_top = Vector((0.460 * side, ry - 0.020, rz + 0.280))
        v_shock = (shock_top - shock_bot)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.020, depth=v_shock.length,
                                  matrix=Matrix.Translation((shock_bot + shock_top)*0.5) @
                                  v_shock.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
    # 3. Upper Reaction Triangle (Alfa Romeo signature T-Arm)
    p_t_pivot = Vector((0.0, ry - 0.020, rz + 0.090))
    for side in [1.0, -1.0]:
        p_t_front = Vector((0.260 * side, ry + 0.480, rz + 0.080))
        v_t = (p_t_pivot - p_t_front)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.018, depth=v_t.length,
                                  matrix=Matrix.Translation((p_t_front + p_t_pivot)*0.5) @
                                  v_t.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
    bm.to_mesh(axle_mesh)
    bm.free()
    
    axle_obj.data.materials.append(mat_campagnolo_alloy)
    weld_and_smooth(axle_obj)
    return axle_obj

def build_alfa_spider_exhaust_system():
    """
    Constructs the full stainless steel exhaust system: 4-into-2-into-1 front headers,
    center longitudinal resonator silencer, rear transverse muffler, and dual chrome tips.
    """
    exh_mesh = bpy.data.meshes.new("Alfa_Spider_Exhaust_Mesh")
    exh_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Exhaust_System", exh_mesh)
    bpy.context.collection.objects.link(exh_obj)
    
    bm = bmesh.new()
    
    # 1. Front Downpipe (routing from manifold area into tunnel)
    p1 = Vector((-0.180, 0.820, 0.260))
    p2 = Vector((-0.090, 0.450, 0.210))
    p3 = Vector((-0.050, 0.000, 0.190))
    
    for pa, pb in [(p1, p2), (p2, p3)]:
        v_seg = (pb - pa)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.026, depth=v_seg.length,
                                  matrix=Matrix.Translation((pa + pb)*0.5) @
                                  v_seg.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
    # 2. Center Resonator Silencer (Oval canister in tunnel)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.065, depth=0.420,
                              matrix=Matrix.Translation((-0.050, -0.280, 0.200)) @
                              Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())
                              
    # 3. Intermediate Pipe (Over the rear axle)
    p4 = Vector((-0.050, -0.500, 0.200))
    p5 = Vector((-0.090, -0.980, 0.220))
    p6 = Vector((-0.150, -1.250, 0.310)) # Arch over axle
    p7 = Vector((-0.200, -1.550, 0.220))
    
    for pa, pb in [(p4, p5), (p5, p6), (p6, p7)]:
        v_seg = (pb - pa)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.024, depth=v_seg.length,
                                  matrix=Matrix.Translation((pa + pb)*0.5) @
                                  v_seg.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                                  
    # 4. Transverse Rear Main Muffler Box
    muffler_center = Vector((-0.150, -1.780, 0.230))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(muffler_center) @
                          Matrix.Scale(0.480, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.240, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.140, 4, Vector((0,0,1))))
                          
    # 5. Dual Polished Chrome Tailpipes exiting at Rear Left
    # Two parallel pipes (50mm dia) exiting under rear valance at Y = -2.070m
    for pipe_x in [-0.220, -0.280]:
        # Pipe stem
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.024, depth=0.320,
                                  matrix=Matrix.Translation((pipe_x, -1.950, 0.210)) @
                                  Euler((math.radians(85), 0, 0)).to_matrix().to_4x4())
        # Rolled outer chrome tip extension
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.027, depth=0.080,
                                  matrix=Matrix.Translation((pipe_x, -2.070, 0.205)) @
                                  Euler((math.radians(85), 0, 0)).to_matrix().to_4x4())
        # Dark hollow inner bore
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.021, depth=0.082,
                                  matrix=Matrix.Translation((pipe_x, -2.070, 0.205)) @
                                  Euler((math.radians(85), 0, 0)).to_matrix().to_4x4())
                                  
    bm.to_mesh(exh_mesh)
    bm.free()
    
    exh_obj.data.materials.append(mat_exhaust_inox)
    weld_and_smooth(exh_obj)
    return exh_obj

spider_chassis = build_alfa_spider_underbody_chassis()
spider_f_susp = build_alfa_spider_front_suspension()
spider_r_axle = build_alfa_spider_rear_live_axle()
spider_exhaust = build_alfa_spider_exhaust_system()
print("[MECHANICAL] Chassis, Suspension and Exhaust successfully built.")


# ---------------------------------------------------------------------------
# 7. FOLDED CONVERTIBLE SOFT-TOP, WINDSHIELD ASSEMBLY & COCKPIT PRIVACY TUB
# ---------------------------------------------------------------------------
print("[CONVERTIBLE] Crafting Folded Soft-Top, Windshield & Cockpit Tub...")

def build_alfa_spider_soft_top_stack():
    """
    Constructs the folded black vinyl convertible soft-top stack, tonneau boot cover,
    chrome retaining molding, and Tenax snap studs behind the cockpit opening.
    """
    top_mesh = bpy.data.meshes.new("Alfa_Spider_SoftTop_Mesh")
    top_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Folded_SoftTop", top_mesh)
    bpy.context.collection.objects.link(top_obj)
    
    bm = bmesh.new()
    
    # 1. Folded Multi-layer Vinyl Fabric Stack (Accordion textile ripples)
    y_front = -0.580
    y_rear  = -0.740
    y_steps = 12
    x_steps = 18
    w_top   = 0.580
    
    folds = []
    for yi in range(y_steps):
        t_y = yi / (y_steps - 1)
        y = y_front + (y_rear - y_front) * t_y
        
        # Accordion ripple wave
        wave = math.sin(t_y * 3.0 * math.pi) * 0.012
        z_base = 0.835 + 0.025 * math.sin(t_y * math.pi) + wave
        
        row = []
        for xi in range(x_steps):
            t_x = (xi / (x_steps - 1)) * 2.0 - 1.0 # -1 to +1
            x = t_x * w_top * (1.0 - 0.08 * (t_y ** 2))
            
            # Droop at edges
            droop = -0.045 * (t_x ** 2)
            z = z_base + droop
            v = bm.verts.new((x, y, z))
            row.append(v)
        folds.append(row)
        
    for yi in range(y_steps - 1):
        for xi in range(x_steps - 1):
            v1 = folds[yi][xi]
            v2 = folds[yi][xi + 1]
            v3 = folds[yi + 1][xi + 1]
            v4 = folds[yi + 1][xi]
            bm.faces.new([v1, v2, v3, v4])
            
    # 2. Chrome Perimeter Retaining Molding Strip (Arching around rear of top well)
    molding_pts = 24
    m_inner = []
    m_outer = []
    for i in range(molding_pts + 1):
        ang = math.pi * (i / molding_pts) # 0 to pi
        rad_x = 0.590
        rad_y = 0.160
        x = rad_x * math.cos(ang)
        y = -0.660 - rad_y * math.sin(ang)
        z = 0.825 + 0.010 * math.sin(ang)
        
        vi = bm.verts.new((x, y, z))
        vo = bm.verts.new((x * 1.025, y - 0.012, z - 0.005))
        m_inner.append(vi)
        m_outer.append(vo)
        
    for i in range(molding_pts):
        bm.faces.new([m_inner[i], m_inner[i+1], m_outer[i+1], m_outer[i]])
        
    # 3. Tenax Chrome Hold-Down Snap Studs (8 snap studs along perimeter)
    for i in range(1, 9):
        ang = math.pi * (i / 9.0)
        x = 0.595 * math.cos(ang)
        y = -0.665 - 0.165 * math.sin(ang)
        z = 0.827 + 0.010 * math.sin(ang)
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.006, depth=0.008,
                                  matrix=Matrix.Translation((x, y, z)))
                                  
    bm.to_mesh(top_mesh)
    bm.free()
    
    top_obj.data.materials.append(mat_soft_top_vinyl)
    weld_and_smooth(top_obj, merge_dist=0.0002, smooth_angle_deg=30.0)
    return top_obj

def build_alfa_spider_windshield_assembly():
    """
    Constructs the classic curved optical windshield pane, extruded chrome A-pillars
    and upper header rail, EPDM base gasket, and cowl wiper arms.
    """
    ws_mesh = bpy.data.meshes.new("Alfa_Spider_Windshield_Mesh")
    ws_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Windshield", ws_mesh)
    bpy.context.collection.objects.link(ws_obj)
    
    bm = bmesh.new()
    
    # Windshield Geometry:
    # Cowl base: Y = +0.660m, Z = 0.815m, Width = 1.160m
    # Top header: Y = +0.310m, Z = 1.185m, Width = 1.040m
    
    y_steps = 14
    x_steps = 18
    
    glass_grid = []
    for yi in range(y_steps):
        t_y = yi / (y_steps - 1)
        y_pos = 0.660 + (0.310 - 0.660) * t_y
        z_pos = 0.815 + (1.185 - 0.815) * t_y
        
        # Half width tapers toward top
        w_half = 0.580 + (0.520 - 0.580) * t_y
        
        row = []
        for xi in range(x_steps):
            t_x = (xi / (x_steps - 1)) * 2.0 - 1.0
            x = t_x * w_half
            
            # Aerodynamic panoramic curvature across X (cylindrical sweep back)
            curve_y = -0.040 * (t_x ** 2)
            curve_z =  0.015 * (1.0 - t_x ** 2) * (1.0 - t_y)
            
            v = bm.verts.new((x, y_pos + curve_y, z_pos + curve_z))
            row.append(v)
        glass_grid.append(row)
        
    for yi in range(y_steps - 1):
        for xi in range(x_steps - 1):
            v1 = glass_grid[yi][xi]
            v2 = glass_grid[yi][xi + 1]
            v3 = glass_grid[yi + 1][xi + 1]
            v4 = glass_grid[yi + 1][xi]
            bm.faces.new([v1, v2, v3, v4])
            
    # 2. Chrome Perimeter A-Pillars & Header Frame
    # Left A-pillar (+X)
    p_bl = glass_grid[0][-1].co
    p_tl = glass_grid[-1][-1].co
    v_a_l = (p_tl - p_bl)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.015, depth=v_a_l.length,
                              matrix=Matrix.Translation((p_bl + p_tl)*0.5) @
                              v_a_l.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                              
    # Right A-pillar (-X)
    p_br = glass_grid[0][0].co
    p_tr = glass_grid[-1][0].co
    v_a_r = (p_tr - p_br)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.015, depth=v_a_r.length,
                              matrix=Matrix.Translation((p_br + p_tr)*0.5) @
                              v_a_r.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                              
    # Top Header Rail
    v_h = (p_tl - p_tr)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.014, depth=v_h.length,
                              matrix=Matrix.Translation((p_tr + p_tl)*0.5) @
                              v_h.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                              
    # Bottom Cowl Rubber Gasket
    v_b = (p_bl - p_br)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.012, depth=v_b.length,
                              matrix=Matrix.Translation((p_br + p_bl)*0.5) @
                              v_b.to_track_quat('Z', 'Y').to_matrix().to_4x4())
                              
    bm.to_mesh(ws_mesh)
    bm.free()
    
    # Assign glass material to mesh (header chrome can be textured or secondary)
    ws_obj.data.materials.append(mat_windshield_glass)
    weld_and_smooth(ws_obj, merge_dist=0.0002, smooth_angle_deg=34.0)
    return ws_obj

def build_alfa_spider_cockpit_tub():
    """
    Constructs the recessed interior cockpit privacy tub, floor, console bridge,
    and rear shelf to eliminate any interior see-through voids from any viewing angle.
    """
    tub_mesh = bpy.data.meshes.new("Alfa_Spider_Cockpit_Mesh")
    tub_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Cockpit_Tub", tub_mesh)
    bpy.context.collection.objects.link(tub_obj)
    
    bm = bmesh.new()
    
    # Cockpit Aperture: Y = +0.550 to -0.580, X = +/- 0.580
    # Floor: Z = 0.220
    
    # 1. Floor Plate
    f_fl = bm.verts.new(( 0.520,  0.480, 0.220))
    f_fr = bm.verts.new((-0.520,  0.480, 0.220))
    f_rr = bm.verts.new((-0.520, -0.520, 0.220))
    f_rl = bm.verts.new(( 0.520, -0.520, 0.220))
    bm.faces.new([f_fl, f_fr, f_rr, f_rl])
    
    # 2. Side Walls (connecting tub floor to door coaming)
    w_fl = bm.verts.new(( 0.620,  0.480, 0.740))
    w_fr = bm.verts.new((-0.620,  0.480, 0.740))
    w_rr = bm.verts.new((-0.620, -0.520, 0.760))
    w_rl = bm.verts.new(( 0.620, -0.520, 0.760))
    
    # Left wall
    bm.faces.new([f_fl, w_fl, w_rl, f_rl])
    # Right wall
    bm.faces.new([f_fr, f_rr, w_rr, w_fr])
    # Front bulkhead (firewall to dashboard)
    bm.faces.new([f_fr, w_fr, w_fl, f_fl])
    # Rear bulkhead (behind seats to soft-top well)
    bm.faces.new([f_rl, w_rl, w_rr, f_rr])
    
    # 3. Stylized Sports Bucket Seat Headrest & Shoulder Bolster Silhouettes
    # (Solid geometric silhouettes preventing hollow cabin appearance)
    for side in [0.260, -0.260]:
        # Seat backrest block
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((side, -0.220, 0.540)) @
                              Euler((math.radians(12), 0, 0)).to_matrix().to_4x4() @
                              Matrix.Scale(0.380, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.240, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.480, 4, Vector((0,0,1))))
        # Headrest cushion
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((side, -0.320, 0.820)) @
                              Euler((math.radians(12), 0, 0)).to_matrix().to_4x4() @
                              Matrix.Scale(0.220, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.120, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.160, 4, Vector((0,0,1))))
                              
    # 4. Classic 3-Spoke Hellebore Wood-Rim Steering Wheel Silhouette
    # Positioned at driver side (LHD: X = +0.260m, Y = +0.180m, Z = 0.760m)
    bmesh.ops.create_torus(bm, major_radius=0.175, minor_radius=0.012,
                           major_segments=24, minor_segments=8,
                           matrix=Matrix.Translation((0.260, 0.180, 0.760)) @
                           Euler((math.radians(65), 0, 0)).to_matrix().to_4x4())
                           
    bm.to_mesh(tub_mesh)
    bm.free()
    
    tub_obj.data.materials.append(mat_cockpit_shroud)
    weld_and_smooth(tub_obj)
    return tub_obj

spider_soft_top = build_alfa_spider_soft_top_stack()
spider_windshield = build_alfa_spider_windshield_assembly()
spider_cockpit = build_alfa_spider_cockpit_tub()
print("[CONVERTIBLE] Soft-Top, Windshield and Cockpit Tub complete.")


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 8B: FRONT RADIATOR PACK, BRAKE COOLING & OIL COOLER
# ----------------------------------------------------------------------------
def build_front_radiator_cooling_pack(parent_col, mats):
    """
    Constructs the authentic brass/copper crossflow engine cooling radiator,
    corrugated matrix, top/bottom tanks, filler neck, mechanical 6-blade fan,
    and front brake cooling air ducting.
    """
    bm = bmesh.new()
    f_axle = 1.125
    rad_y = 1.620
    rad_z = 0.460
    rad_w = 0.480
    rad_h = 0.360

    # 1. Core Matrix Fin Block
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, rad_y, rad_z)) @
                          Matrix.Scale(rad_w, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.045, 4, Vector((0,1,0))) @
                          Matrix.Scale(rad_h, 4, Vector((0,0,1))))

    # 2. Radiator Top Header Tank
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.042, depth=rad_w + 0.020,
                              matrix=Matrix.Translation((0.0, rad_y, rad_z + rad_h*0.5 + 0.035)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())

    # 3. Radiator Bottom Collector Tank
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.038, depth=rad_w + 0.020,
                              matrix=Matrix.Translation((0.0, rad_y, rad_z - rad_h*0.5 - 0.030)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())

    # 4. Brass Pressure Radiator Cap & Filler Neck
    p_neck = Vector((0.160, rad_y, rad_z + rad_h*0.5 + 0.075))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.020, depth=0.035,
                              matrix=Matrix.Translation(p_neck))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.032, depth=0.012,
                              matrix=Matrix.Translation(p_neck + Vector((0, 0, 0.020))))

    # Overflow Drain Hose
    p_over_start = p_neck + Vector((0.018, 0, 0.010))
    p_over_end = p_over_start + Vector((0.060, 0, -0.220))
    create_cylinder_between(bm, p_over_start, p_over_end, radius=0.004, segments=6)

    # 5. Upper and Lower Coolant Hoses
    p_rad_top_in = Vector((-0.150, rad_y - 0.020, rad_z + rad_h*0.5 + 0.030))
    p_eng_thermo = Vector((-0.100, rad_y - 0.280, rad_z + rad_h*0.5 + 0.010))
    create_curved_tube(bm, [p_eng_thermo, (p_eng_thermo + p_rad_top_in)*0.5 + Vector((0,0,0.040)), p_rad_top_in],
                       radius=0.018, segments=10)

    p_rad_bot_out = Vector((0.140, rad_y - 0.020, rad_z - rad_h*0.5 - 0.020))
    p_eng_pump    = Vector((0.080, rad_y - 0.320, rad_z - rad_h*0.5 + 0.040))
    create_curved_tube(bm, [p_rad_bot_out, (p_rad_bot_out + p_eng_pump)*0.5 - Vector((0,0,0.030)), p_eng_pump],
                       radius=0.020, segments=10)

    # 6. Cooling Fan Shroud & 6-Blade Fan Assembly
    fan_z = rad_z
    fan_y = rad_y - 0.040
    bmesh.ops.create_cylinder(bm, cap_ends=False, segments=24, radius=0.170, depth=0.055,
                              matrix=Matrix.Translation((0.0, fan_y, fan_z)) @
                              Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())

    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.050, depth=0.030,
                              matrix=Matrix.Translation((0.0, fan_y - 0.015, fan_z)) @
                              Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())

    for b in range(6):
        ang = b * (2.0 * math.pi / 6.0)
        bx = 0.105 * math.cos(ang)
        bz = fan_z + 0.105 * math.sin(ang)
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((bx, fan_y - 0.012, bz)) @
                              Euler((0, ang, math.radians(22))).to_matrix().to_4x4() @
                              Matrix.Scale(0.110, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.005, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.045, 4, Vector((0,0,1))))

    # 7. Front Brake Cooling Air Ducts
    for side in [1.0, -1.0]:
        duct_start = Vector((0.320 * side, 1.980, 0.280))
        duct_end   = Vector((0.480 * side, f_axle + 0.120, 0.260))
        create_curved_tube(bm, [duct_start, (duct_start + duct_end)*0.5 - Vector((0,0,0.020)), duct_end],
                           radius=0.032, segments=10)

    return link_obj("GEO_Spider_Cooling_Pack", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 8C: ZF BURMAN STEERING GEARBOX & DRAG LINKAGE
# ----------------------------------------------------------------------------
def build_steering_box_and_linkage_details(parent_col, mats):
    """
    Constructs the authentic 1970s worm-and-roller steering gearbox, drop Pitman arm,
    passenger-side idler arm assembly, transverse central drag link, and tie-rod clamps.
    """
    bm = bmesh.new()
    f_axle = 1.125

    sb_pos = Vector((-0.340, f_axle - 0.120, 0.320))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(sb_pos) @
                          Matrix.Scale(0.120, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.150, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.140, 4, Vector((0,0,1))))

    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.055, depth=0.015,
                              matrix=Matrix.Translation(sb_pos + Vector((0, 0, 0.075))))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.012, depth=0.025,
                              matrix=Matrix.Translation(sb_pos + Vector((0, 0, 0.088))))

    pit_pivot = sb_pos + Vector((0.0, 0.0, -0.075))
    pit_ball  = pit_pivot + Vector((0.040, 0.060, -0.110))
    create_cylinder_between(bm, pit_pivot, pit_ball, radius=0.016, segments=8)
    bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.020,
                              matrix=Matrix.Translation(pit_ball))

    id_pos = Vector((0.340, f_axle - 0.120, 0.320))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.035, depth=0.120,
                              matrix=Matrix.Translation(id_pos))

    id_pivot = id_pos + Vector((0.0, 0.0, -0.075))
    id_ball  = id_pivot + Vector((-0.040, 0.060, -0.110))
    create_cylinder_between(bm, id_pivot, id_ball, radius=0.016, segments=8)
    bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.020,
                              matrix=Matrix.Translation(id_ball))

    create_cylinder_between(bm, pit_ball, id_ball, radius=0.014, segments=10)

    for side in [1.0, -1.0]:
        clamp_pos = Vector((0.300 * side, f_axle - 0.080, 0.220))
        bmesh.ops.create_torus(bm, major_radius=0.018, minor_radius=0.005,
                               major_segments=12, minor_segments=6,
                               matrix=Matrix.Translation(clamp_pos))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.004, depth=0.030,
                                  matrix=Matrix.Translation(clamp_pos) @
                                  Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())

    return link_obj("GEO_Spider_Steering_Gearbox", bm, parent_col, mats["campagnolo_alloy"], bevel=0.002)


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 8D: REAR AXLE REBOUND LIMIT STRAPS & BRAKE HARDLINES
# ----------------------------------------------------------------------------
def build_rear_axle_details_and_limit_straps(parent_col, mats):
    """
    Constructs the authentic rear axle canvas rebound limiting check-straps,
    differential casing gusset webs, and brake hydraulic distribution T-junction.
    """
    bm = bmesh.new()
    r_axle = -1.125
    wheel_r = 0.307

    for side in [1.0, -1.0]:
        strap_x = 0.380 * side
        p_strap_axle = Vector((strap_x, r_axle, wheel_r - 0.040))
        p_strap_chass = Vector((strap_x, r_axle - 0.040, wheel_r + 0.260))

        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_strap_chass) @
                              Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.020, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.050, 4, Vector((0,0,1))))

        create_oriented_box_between(bm, p_strap_axle, p_strap_chass, width=0.038, height=0.006)

        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_strap_axle) @
                              Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.025, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.030, 4, Vector((0,0,1))))

    for web_deg in [30, 75, 120, 210, 255, 300]:
        rad = math.radians(web_deg)
        wx = 0.085 * math.cos(rad)
        wz = wheel_r + 0.085 * math.sin(rad)
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((wx, r_axle + 0.030, wz)) @
                              Euler((0, -rad, 0)).to_matrix().to_4x4() @
                              Matrix.Scale(0.006, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.050, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.025, 4, Vector((0,0,1))))

    p_t_block = Vector((-0.060, r_axle - 0.075, wheel_r + 0.060))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_t_block) @
                          Matrix.Scale(0.022, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.018, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.018, 4, Vector((0,0,1))))

    p_chass_hose = Vector((-0.060, r_axle + 0.220, wheel_r + 0.180))
    create_curved_tube(bm, [p_chass_hose, (p_chass_hose + p_t_block)*0.5 + Vector((0,0,0.060)), p_t_block],
                       radius=0.006, segments=8)

    return link_obj("GEO_Spider_Rear_Axle_Details", bm, parent_col, mats["campagnolo_alloy"], bevel=0.001)


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 8E: WINDSHIELD QUARTER VENT WINGS & COCKPIT MIRROR
# ----------------------------------------------------------------------------
def build_windshield_vent_wings_and_hardware(parent_col, mats):
    """
    Constructs the delicate triangular quarter vent deflector windows in the A-pillar base,
    chrome vent pivot pivots, interior rearview mirror stem, and prismatic glass mirror.
    """
    bm = bmesh.new()

    for side in [1.0, -1.0]:
        vx_base = 0.625 * side
        vy_base = 0.640
        vz_base = 0.775

        p_v1 = Vector((vx_base, vy_base, vz_base))
        p_v2 = Vector((vx_base - 0.045*side, vy_base - 0.210, vz_base + 0.030))
        p_v3 = Vector((vx_base - 0.035*side, vy_base - 0.120, vz_base + 0.220))

        v_tri = [bm.verts.new(p) for p in [p_v1, p_v2, p_v3]]
        bm.faces.new(v_tri)
        bmesh.ops.solidify(bm, geom=v_tri, thickness=0.004)

        create_cylinder_between(bm, p_v1, p_v3, radius=0.005, segments=8)

        p_latch = p_v2 + Vector((-0.010 * side, 0.020, 0.020))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.008, depth=0.014,
                                  matrix=Matrix.Translation(p_latch))

    p_header_c = Vector((0.0, 0.280, 1.140))
    p_mirror_c = Vector((0.0, 0.240, 1.090))

    create_cylinder_between(bm, p_header_c, p_mirror_c, radius=0.0055, segments=8)

    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_mirror_c) @
                          Euler((math.radians(12), 0, 0)).to_matrix().to_4x4() @
                          Matrix.Scale(0.180, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.015, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.048, 4, Vector((0,0,1))))

    return link_obj("GEO_Spider_Vent_Wings_Mirror", bm, parent_col, mats["chrome"], bevel=0.001)


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 8F: CHASSIS PINCHWELDS, JACKING PADS & EMBLEM STATIONS
# ----------------------------------------------------------------------------
def build_chassis_pinchwelds_and_jacking_points(parent_col, mats):
    """
    Constructs the longitudinal rocker sill hem pinchwelds, 4 structural chassis
    jacking pads, fuel filler flap recess, and rear Kamm-tail license plate plinth.
    """
    bm = bmesh.new()

    for side in [1.0, -1.0]:
        sx = 0.720 * side
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((sx, 0.0, 0.135)) @
                              Matrix.Scale(0.008, 4, Vector((1,0,0))) @
                              Matrix.Scale(2.100, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.022, 4, Vector((0,0,1))))

        for jy in [0.720, -0.680]:
            bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((sx - 0.035 * side, jy, 0.130)) @
                                  Matrix.Scale(0.065, 4, Vector((1,0,0))) @
                                  Matrix.Scale(0.090, 4, Vector((0,1,0))) @
                                  Matrix.Scale(0.025, 4, Vector((0,0,1))))

    p_fuel = Vector((-0.680, -1.350, 0.755))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=20, radius=0.045, depth=0.005,
                              matrix=Matrix.Translation(p_fuel) @
                              Euler((0, math.radians(22), 0)).to_matrix().to_4x4())

    p_plinth = Vector((0.0, -2.068, 0.440))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_plinth) @
                          Matrix.Scale(0.420, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.015, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.140, 4, Vector((0,0,1))))

    for l_side in [0.140, -0.140]:
        p_lamp = Vector((l_side, -2.072, 0.520))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.018, depth=0.030,
                                  matrix=Matrix.Translation(p_lamp) @
                                  Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())

    return link_obj("GEO_Spider_Chassis_Details", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 8G: WEBER 40 DCOE DUAL CARBURETORS & AIRBOX SILHOUETTE
# ----------------------------------------------------------------------------
def build_weber_carburetors_and_airbox(parent_col, mats):
    """
    Constructs the twin Weber 40 DCOE dual-choke side-draft carburetors, intake manifold,
    and cylindrical cast aluminum airbox canister situated in the engine bay.
    """
    bm = bmesh.new()

    carb_x = 0.280
    carb_z = 0.520

    # 1. Cast Aluminum Intake Manifold Runners to Cylinder Head
    for c_y in [1.360, 1.240]:
        create_cylinder_between(bm, Vector((0.140, c_y, carb_z)), Vector((carb_x - 0.050, c_y, carb_z)),
                                radius=0.022, segments=10)

    # 2. Twin Weber 40 DCOE Carburetor Bodies
    for c_y in [1.360, 1.240]:
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((carb_x, c_y, carb_z)) @
                              Matrix.Scale(0.100, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.095, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.110, 4, Vector((0,0,1))))

        # Twin Velocity Stacks / Trumpet Inlets
        for v_off in [-0.028, 0.028]:
            p_v_in = Vector((carb_x + 0.050, c_y + v_off, carb_z))
            p_v_out = Vector((carb_x + 0.095, c_y + v_off, carb_z))
            bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.020, radius2=0.026, depth=0.045,
                                  matrix=Matrix.Translation((p_v_in + p_v_out)*0.5) @
                                  Euler((0, math.radians(90), 0)).to_matrix().to_4x4())

    # 3. Longitudinal Cylindrical Airbox Filter Plenum
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.065, depth=0.340,
                              matrix=Matrix.Translation((carb_x + 0.120, 1.300, carb_z)) @
                              Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())

    # Forward Air Snorkel Intake Horn
    p_snork_base = Vector((carb_x + 0.120, 1.470, carb_z))
    p_snork_fwd  = Vector((carb_x + 0.080, 1.640, carb_z - 0.030))
    create_cylinder_between(bm, p_snork_base, p_snork_fwd, radius=0.032, segments=10)

    return link_obj("GEO_Spider_Engine_Bay_Induction", bm, parent_col, mats["campagnolo_alloy"], bevel=0.002)


# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 8H: PEDAL BOX, GEAR SHIFTER & HANDBRAKE COCKPIT CONTROLS
# ----------------------------------------------------------------------------
def build_cockpit_control_hardware(parent_col, mats):
    """
    Constructs the driver footwell pedal box (clutch, brake, accelerator),
    angled center console 5-speed gear shift lever, and mechanical handbrake lever.
    """
    bm = bmesh.new()

    # 1. Driver Footwell Stamped Steel Pedals (LHD driver side)
    for p_idx, px in enumerate([-0.360, -0.280, -0.210]):
        p_top = Vector((px, 0.540, 0.460))
        p_bot = Vector((px, 0.480, 0.220))
        create_cylinder_between(bm, p_top, p_bot, radius=0.007, segments=6)

        # Pedal Pad Plate
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(p_bot + Vector((0, 0.010, 0))) @
                              Euler((math.radians(25), 0, 0)).to_matrix().to_4x4() @
                              Matrix.Scale(0.045 if p_idx < 2 else 0.032, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.006, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.055 if p_idx < 2 else 0.075, 4, Vector((0,0,1))))

    # 2. Trademark Angled 5-Speed Gear Shift Lever
    p_shift_base = Vector((0.0, 0.080, 0.320))
    p_shift_knob = Vector((0.0, 0.020, 0.540))
    create_cylinder_between(bm, p_shift_base, p_shift_knob, radius=0.006, segments=8)

    # Leather Shift Boot Gaiter Cone
    bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.048, radius2=0.015, depth=0.075,
                          matrix=Matrix.Translation(p_shift_base + Vector((0, 0, 0.035))))

    # Spherical Wooden / Bakelite Gear Shift Knob
    bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=10, radius=0.022,
                              matrix=Matrix.Translation(p_shift_knob))

    # 3. Center Tunnel Mechanical Handbrake Lever
    p_hb_base = Vector((0.045, -0.160, 0.320))
    p_hb_tip  = Vector((0.045, -0.060, 0.440))
    create_cylinder_between(bm, p_hb_base, p_hb_tip, radius=0.008, segments=8)
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.004, depth=0.012,
                              matrix=Matrix.Translation(p_hb_tip + Vector((0, 0.006, 0.008))))

    return link_obj("GEO_Spider_Cockpit_Controls", bm, parent_col, mats["chrome"], bevel=0.001)


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 8I: REAR FUEL TANK, STRAPS & SPARE TIRE BASIN WELL
# ----------------------------------------------------------------------------
def build_fuel_tank_and_spare_tire_bay(parent_col, mats):
    """
    Constructs the 46-liter stamped steel fuel tank mounted beneath the trunk floor,
    twin steel retention straps with tensioning J-bolts, and the 14-inch spare wheel
    assembly clamped into the trunk floor well.
    """
    bm = bmesh.new()
    r_axle = -1.125
    tank_y = -1.620
    tank_z = 0.280

    # 1. Main Fuel Tank Stamped Upper and Lower Shells
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, tank_y, tank_z)) @
                          Matrix.Scale(0.720, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.420, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.180, 4, Vector((0,0,1))))

    # Horizontal Seam Flange (Perimeter weld seam)
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, tank_y, tank_z)) @
                          Matrix.Scale(0.750, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.450, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.012, 4, Vector((0,0,1))))

    # Fuel Filler Neck Spigot Sweeping to Left Rear Fender
    p_tank_spigot = Vector((-0.320, tank_y + 0.080, tank_z + 0.080))
    p_fender_neck = Vector((-0.640, tank_y + 0.180, 0.720))
    create_curved_tube(bm, [p_tank_spigot, (p_tank_spigot + p_fender_neck)*0.5 + Vector((0,0,0.100)), p_fender_neck],
                       radius=0.024, segments=10)

    # 2. Galvanized Steel Tank Mounting Straps with Tensioning J-Bolts
    for s_x in [-0.220, 0.220]:
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((s_x, tank_y, tank_z - 0.095)) @
                              Matrix.Scale(0.032, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.460, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.005, 4, Vector((0,0,1))))
        for hook_y in [tank_y - 0.230, tank_y + 0.230]:
            bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.006, depth=0.045,
                                      matrix=Matrix.Translation((s_x, hook_y, tank_z + 0.080)))

    # 3. Spare Wheel Retention Clamp & Threaded Hold-Down T-Bolt
    spare_c = Vector((0.080, -1.560, 0.250))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.045, depth=0.015,
                              matrix=Matrix.Translation(spare_c + Vector((0, 0, 0.110))))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.006, depth=0.180,
                              matrix=Matrix.Translation(spare_c + Vector((0, 0, 0.040))))

    return link_obj("GEO_Spider_Fuel_Tank_Bay", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 8J: DOOR STRUCTURAL MECHANISMS & SIDE WINDOW GLASS RAILS
# ----------------------------------------------------------------------------
def build_door_structures_and_window_channels(parent_col, mats):
    """
    Constructs the internal door intrusion beams, window glass channels,
    felt wiper felts along the waistline, and brass door hinge pivot pins.
    """
    bm = bmesh.new()

    for side in [1.0, -1.0]:
        dx = 0.770 * side
        door_y_f = 0.650
        door_y_r = -0.450
        door_len = door_y_f - door_y_r

        p_hinge_low = Vector((dx - 0.050*side, door_y_f, 0.260))
        p_latch_high = Vector((dx - 0.040*side, door_y_r, 0.520))
        create_cylinder_between(bm, p_hinge_low, p_latch_high, radius=0.018, segments=8)

        for hz in [0.320, 0.620]:
            h_pos = Vector((dx - 0.065*side, door_y_f, hz))
            bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(h_pos) @
                                  Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                                  Matrix.Scale(0.060, 4, Vector((0,1,0))) @
                                  Matrix.Scale(0.040, 4, Vector((0,0,1))))
            bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.006, depth=0.055,
                                      matrix=Matrix.Translation(h_pos + Vector((0, 0.015, 0))))

        p_strap_body = Vector((dx - 0.080*side, door_y_f + 0.040, 0.460))
        p_strap_door = Vector((dx - 0.035*side, door_y_f - 0.120, 0.460))
        create_oriented_box_between(bm, p_strap_body, p_strap_door, width=0.024, height=0.005)

        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((dx - 0.015*side, (door_y_f + door_y_r)*0.5, 0.772)) @
                              Matrix.Scale(0.012, 4, Vector((1,0,0))) @
                              Matrix.Scale(door_len * 0.96, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.008, 4, Vector((0,0,1))))

    return link_obj("GEO_Spider_Door_Hardware", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 8K: ENGINE BAY ANCILLARIES & HYDRAULIC RESERVOIRS
# ----------------------------------------------------------------------------
def build_engine_bay_ancillaries(parent_col, mats):
    """
    Constructs the period-correct Marelli ignition distributor with 4 spark plug leads,
    dual brake/clutch hydraulic fluid reservoir pots, and 12V period battery with hold-down.
    """
    bm = bmesh.new()

    dist_pos = Vector((-0.240, 0.940, 0.580))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.032, depth=0.085,
                              matrix=Matrix.Translation(dist_pos))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.034, depth=0.045,
                              matrix=Matrix.Translation(dist_pos + Vector((0, 0, 0.055))))

    for w_idx in range(4):
        w_y = 1.120 + w_idx * 0.110
        plug_pos = Vector((-0.080, w_y, 0.680))
        dist_tower = dist_pos + Vector((0.020, (w_idx - 1.5)*0.015, 0.080))
        create_curved_tube(bm, [dist_tower, (dist_tower + plug_pos)*0.5 + Vector((0,0,0.060)), plug_pos],
                           radius=0.004, segments=6)

    bulkhead_y = 0.720
    for res_idx, rx in enumerate([-0.320, -0.250]):
        r_pos = Vector((rx, bulkhead_y, 0.660))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=14, radius=0.026, depth=0.085,
                                  matrix=Matrix.Translation(r_pos))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.028, depth=0.016,
                                  matrix=Matrix.Translation(r_pos + Vector((0, 0, 0.048))))
        create_cylinder_between(bm, r_pos - Vector((0,0,0.042)), r_pos - Vector((0,0,0.140)), radius=0.005, segments=6)

    bat_pos = Vector((0.360, 1.480, 0.440))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(bat_pos) @
                          Matrix.Scale(0.180, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.240, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.160, 4, Vector((0,0,1))))

    p_pos_term = bat_pos + Vector((0.060, 0.080, 0.088))
    p_neg_term = bat_pos + Vector((-0.060, 0.080, 0.088))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.010, depth=0.018, matrix=Matrix.Translation(p_pos_term))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.010, depth=0.018, matrix=Matrix.Translation(p_neg_term))

    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(bat_pos + Vector((0, 0, 0.085))) @
                          Matrix.Scale(0.210, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.025, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.012, 4, Vector((0,0,1))))

    return link_obj("GEO_Spider_Engine_Ancillaries", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 8L: WIPER ARMS, PIVOTS & COWL SCUTTLE VENTILATION GRILLE
# ----------------------------------------------------------------------------
def build_wiper_arms_and_cowl_scuttle_grille(parent_col, mats):
    """
    Constructs the twin stainless steel pantograph wiper arms, wiper blades with
    rubber squeegees resting at windshield base, knurled wiper spindle escutcheons,
    twin chrome washer jet nozzles, and the 16-slot stamped cowl scuttle grille.
    """
    bm = bmesh.new()

    # 1. Stamped Cowl Scuttle Grille Slots (Base of windshield)
    cowl_y = 0.580
    cowl_z = 0.812
    for slot_idx in range(-8, 8):
        sx = slot_idx * 0.042 + 0.021
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((sx, cowl_y, cowl_z)) @
                              Matrix.Scale(0.028, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.008, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.005, 4, Vector((0,0,1))))

    # 2. Chrome Washer Jet Nozzles
    for wj_x in [-0.280, 0.280]:
        wj_pos = Vector((wj_x, 0.620, 0.816))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.006, depth=0.010,
                                  matrix=Matrix.Translation(wj_pos))
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.002, depth=0.006,
                                  matrix=Matrix.Translation(wj_pos + Vector((0, -0.004, 0.006))) @
                                  Matrix.Rotation(math.radians(-30.0), 4, 'X'))

    # 3. Wiper Arm Spindles, Pivots, Arms & Blades
    # Left hand drive Alfa Romeo Spider wiper spindle positions
    for w_idx, spin_x in enumerate([-0.360, 0.080]):
        spin_pos = Vector((spin_x, 0.540, 0.822))
        # Escutcheon nut collar
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.014, depth=0.012,
                                  matrix=Matrix.Translation(spin_pos))
        # Pivot head block
        head_pos = spin_pos + Vector((0, 0, 0.014))
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(head_pos) @
                              Matrix.Scale(0.018, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.022, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.016, 4, Vector((0,0,1))))

        # Arm body angling towards passenger side park position
        arm_start = head_pos + Vector((0.005, -0.010, 0.005))
        arm_elbow = arm_start + Vector((0.140, -0.030, 0.025))
        arm_end   = arm_elbow + Vector((0.180, -0.040, 0.030))
        create_curved_tube(bm, [arm_start, arm_elbow, arm_end], radius=0.0035, segments=6)

        # Wiper blade claw bridge (15 inch / 380 mm period blade)
        blade_center = arm_end + Vector((0.010, -0.005, -0.005))
        blade_half_len = 0.160
        blade_p1 = blade_center + Vector((-blade_half_len * 0.95, blade_half_len * 0.20, -blade_half_len * 0.12))
        blade_p2 = blade_center + Vector(( blade_half_len * 0.95, -blade_half_len * 0.20, blade_half_len * 0.12))
        create_oriented_box_between(bm, blade_p1, blade_p2, width=0.008, height=0.010)

        # Rubber squeegee strip resting against glass surface
        sq_p1 = blade_p1 - Vector((0, 0, 0.006))
        sq_p2 = blade_p2 - Vector((0, 0, 0.006))
        create_oriented_box_between(bm, sq_p1, sq_p2, width=0.004, height=0.004)

    return link_obj("GEO_Spider_Wipers_Scuttle", bm, parent_col, mats["chrome"], bevel=0.001)


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 8M: CLUTCH ACTUATOR, BELLHOUSING & PROPSHAFT GIUBO FLEX DISC
# ----------------------------------------------------------------------------
def build_clutch_and_transmission_tunnel_linkages(parent_col, mats):
    """
    Constructs the hydraulic clutch slave cylinder and operating fork, starter motor
    solenoid on bellhousing flange, propshaft front Giubo flexible rubber coupling
    disc with steel reinforcement sleeves, and propshaft center support carrier.
    """
    bm = bmesh.new()

    # 1. Hydraulic Clutch Slave Cylinder & Release Fork
    cyl_pos = Vector((-0.190, 0.420, 0.320))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.018, depth=0.110,
                              matrix=Matrix.Translation(cyl_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Pushrod connecting to clutch fork
    pushrod_end = cyl_pos + Vector((0.035, -0.080, -0.010))
    create_cylinder_between(bm, cyl_pos - Vector((0, 0.055, 0)), pushrod_end, radius=0.005, segments=6)
    # Stamped clutch fork lever entering bellhousing
    fork_pivot = cyl_pos + Vector((0.080, -0.090, 0.015))
    create_oriented_box_between(bm, pushrod_end, fork_pivot, width=0.012, height=0.024)

    # 2. Starter Motor & Solenoid Mounted on Right Hand Side of Bellhousing
    start_pos = Vector((0.210, 0.460, 0.310))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.042, depth=0.170,
                              matrix=Matrix.Translation(start_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
    sol_pos = start_pos + Vector((-0.010, 0.040, 0.050))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=10, radius=0.022, depth=0.120,
                              matrix=Matrix.Translation(sol_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    # 3. Propshaft Front Giubo Rubber Doughnut Coupling (Alfa Romeo trademark)
    giubo_pos = Vector((0.0, -0.080, 0.280))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.068, depth=0.035,
                              matrix=Matrix.Translation(giubo_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # 6 Cross-bolting steel bushings in Giubo disc
    for b_idx in range(6):
        ang = b_idx * (2.0 * math.pi / 6.0)
        bx = math.cos(ang) * 0.046
        bz = math.sin(ang) * 0.046
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=8, radius=0.009, depth=0.042,
                                  matrix=Matrix.Translation(giubo_pos + Vector((bx, 0, bz))) @
                                  Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # 4. Propshaft Center Support Bearing & Rubber Cushion Carrier
    cb_pos = Vector((0.0, -0.620, 0.285))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=12, radius=0.048, depth=0.032,
                              matrix=Matrix.Translation(cb_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Horseshoe mounting bracket bridging to floor tunnel
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(cb_pos + Vector((0, 0, 0.045))) @
                          Matrix.Scale(0.160, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.036, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.010, 4, Vector((0,0,1))))

    return link_obj("GEO_Spider_Drivetrain_Linkages", bm, parent_col, mats["underbody"], bevel=0.001)


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 8N: MONZA FUEL FILLER, TRUNK GUTTER DRAINAGE & DECKLID HINGES
# ----------------------------------------------------------------------------
def build_fuel_filler_neck_and_trunk_drain_gutters(parent_col, mats):
    """
    Constructs the polished Monza-style flip cap fuel filler in the left rear quarter recess,
    the perimeter water drain channel surrounding the Kamm-tail luggage compartment, and
    the spring-loaded luggage bootlid gooseneck hinges with torsion balance rods.
    """
    bm = bmesh.new()

    # 1. Left Rear Fender Monza Flip-Top Fuel Filler Cap
    fill_pos = Vector((-0.640, -1.440, 0.725))
    # Recessed bowl ring
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.042, depth=0.016,
                              matrix=Matrix.Translation(fill_pos))
    # Polished chrome flip cap lid
    cap_lid_pos = fill_pos + Vector((0, 0, 0.010))
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=16, radius=0.036, depth=0.012,
                              matrix=Matrix.Translation(cap_lid_pos))
    # Flip cap roller latch & hinge lug
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(cap_lid_pos + Vector((0.032, 0, 0.006))) @
                          Matrix.Scale(0.014, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.018, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.012, 4, Vector((0,0,1))))

    # 2. Luggage Decklid Perimeter Drain Gutter Channel
    # Stamped channel recessed around the boot opening
    gutter_y_f = -0.960
    gutter_y_r = -1.980
    gutter_x   = 0.520
    # Left and right side rain channels
    for s in [1.0, -1.0]:
        create_oriented_box_between(bm,
                                    Vector((gutter_x*s, gutter_y_f, 0.705)),
                                    Vector((gutter_x*s, gutter_y_r, 0.685)),
                                    width=0.016, height=0.012)
    # Forward transverse water trough
    create_oriented_box_between(bm,
                                Vector((-gutter_x, gutter_y_f, 0.705)),
                                Vector(( gutter_x, gutter_y_f, 0.705)),
                                width=0.016, height=0.012)
    # Rear transom transverse trough
    create_oriented_box_between(bm,
                                Vector((-gutter_x*0.92, gutter_y_r, 0.685)),
                                Vector(( gutter_x*0.92, gutter_y_r, 0.685)),
                                width=0.016, height=0.012)

    # 3. Bootlid Gooseneck Hinges & Torsion Assist Rods
    for hs in [1.0, -1.0]:
        hx = 0.380 * hs
        h_base = Vector((hx, -1.040, 0.580))
        h_arc  = Vector((hx, -0.980, 0.680))
        h_lid  = Vector((hx, -1.140, 0.710))
        create_curved_tube(bm, [h_base, h_arc, h_lid], radius=0.007, segments=8)
        # Torsion spring wire rod crossing across trunk forward bulkhead
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.003, depth=0.360,
                                  matrix=Matrix.Translation(Vector((hx * 0.5, -1.020, 0.570))) @
                                  Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    return link_obj("GEO_Spider_Trunk_Hardware", bm, parent_col, mats["chrome"], bevel=0.001)


# ---------------------------------------------------------------------------
# 8. CAMPAGNOLO TURBINA 14-INCH WHEELS, MICHELIN RADIAL TIRES & BRAKES
# ---------------------------------------------------------------------------
print("[RUNNING GEAR] Engineering Campagnolo Turbina Wheels & Michelin Tires...")

def build_campagnolo_turbina_wheel(is_left=True):
    """
    Constructs an authentic 14x6J Campagnolo Turbina magnesium-aluminum alloy wheel
    with 16 directional turbine cooling blades, stepped outer rim lip, 5 chrome wheel
    lug bolts, central Alfa Romeo crest dust cap, ventilated brake disc, and caliper.
    """
    wheel_mesh = bpy.data.meshes.new("Campagnolo_Turbina_Mesh")
    wheel_obj = bpy.data.objects.new("Campagnolo_Turbina_Wheel", wheel_mesh)
    bpy.context.collection.objects.link(wheel_obj)
    
    bm = bmesh.new()
    
    rim_radius = 0.190 # 14-inch rim outer lip radius
    rim_width  = 0.165
    sign_x     = 1.0 if is_left else -1.0
    
    # 1. Outer Stepped Rim Lip & Barrel
    profile_rim = [
        # (X offset, Radius)
        ( 0.080, rim_radius),
        ( 0.065, rim_radius * 0.94),
        ( 0.040, rim_radius * 0.90),
        (-0.060, rim_radius * 0.88),
        (-0.085, rim_radius * 0.92)
    ]
    
    rim_rings = []
    rim_segs = 32
    for px, pr in profile_rim:
        ring = []
        for s in range(rim_segs):
            ang = 2.0 * math.pi * s / rim_segs
            y = pr * math.cos(ang)
            z = pr * math.sin(ang)
            v = bm.verts.new((px * sign_x, y, z))
            ring.append(v)
        rim_rings.append(ring)
        
    for r in range(len(profile_rim) - 1):
        r1 = rim_rings[r]
        r2 = rim_rings[r + 1]
        for s in range(rim_segs):
            s_next = (s + 1) % rim_segs
            if is_left:
                bm.faces.new([r1[s], r2[s], r2[s_next], r1[s_next]])
            else:
                bm.faces.new([r1[s], r1[s_next], r2[s_next], r2[s]])
                
    # 2. 16 Directional Turbine Cooling Blades (Campagnolo Turbina signature)
    num_blades = 16
    hub_radius = 0.075
    blade_outer_r = rim_radius * 0.89
    blade_twist = math.radians(28.0) * sign_x
    
    for b in range(num_blades):
        base_ang = 2.0 * math.pi * b / num_blades
        
        # Blade inner edge at hub
        cos_b0 = math.cos(base_ang)
        sin_b0 = math.sin(base_ang)
        # Blade outer edge at rim (twisted)
        cos_b1 = math.cos(base_ang + blade_twist)
        sin_b1 = math.sin(base_ang + blade_twist)
        
        # 4 vertices per turbine vane
        v_in_f  = bm.verts.new(( 0.045 * sign_x, hub_radius * cos_b0, hub_radius * sin_b0))
        v_in_b  = bm.verts.new(( 0.020 * sign_x, hub_radius * cos_b0, hub_radius * sin_b0))
        v_out_f = bm.verts.new(( 0.055 * sign_x, blade_outer_r * cos_b1, blade_outer_r * sin_b1))
        v_out_b = bm.verts.new(( 0.025 * sign_x, blade_outer_r * cos_b1, blade_outer_r * sin_b1))
        
        # Blade thickness offset
        thickness = 0.005
        t_cos = math.cos(base_ang + math.pi/2) * thickness
        t_sin = math.sin(base_ang + math.pi/2) * thickness
        
        v_in_f2  = bm.verts.new(((0.045 * sign_x), hub_radius * cos_b0 + t_cos, hub_radius * sin_b0 + t_sin))
        v_out_f2 = bm.verts.new(((0.055 * sign_x), blade_outer_r * cos_b1 + t_cos, blade_outer_r * sin_b1 + t_sin))
        
        if is_left:
            bm.faces.new([v_in_f, v_out_f, v_out_b, v_in_b])
            bm.faces.new([v_in_f, v_in_f2, v_out_f2, v_out_f])
        else:
            bm.faces.new([v_in_f, v_in_b, v_out_b, v_out_f])
            bm.faces.new([v_in_f, v_out_f, v_out_f2, v_in_f2])
            
    # 3. Center Hub Bowl & 5 Chrome Wheel Lug Bolts
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=24, radius=hub_radius, depth=0.035,
                              matrix=Matrix.Translation((0.030 * sign_x, 0, 0)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                              
    bolt_pcd = 0.054 # 108mm PCD
    for i in range(5):
        ang = 2.0 * math.pi * i / 5.0
        bx = 0.042 * sign_x
        by = bolt_pcd * math.cos(ang)
        bz = bolt_pcd * math.sin(ang)
        # Hexagonal lug bolt
        bmesh.ops.create_cylinder(bm, cap_ends=True, segments=6, radius=0.009, depth=0.015,
                                  matrix=Matrix.Translation((bx, by, bz)) @
                                  Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                                  
    # 4. Central Aluminum Dust Cap with Alfa Romeo Crest Medallion
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=20, radius=0.032, depth=0.022,
                              matrix=Matrix.Translation((0.052 * sign_x, 0, 0)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                              
    # 5. Ventilated Brake Disc Rotor
    rotor_radius = 0.138
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=24, radius=rotor_radius, depth=0.018,
                              matrix=Matrix.Translation((0.005 * sign_x, 0, 0)) @
                              Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                              
    # 6. Vintage ATE Brake Caliper (Positioned at rear of rotor)
    caliper_y = -0.105
    caliper_z = 0.060
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.010 * sign_x, caliper_y, caliper_z)) @
                          Matrix.Scale(0.055, 4, Vector((1,0,0))) @
                          Matrix.Scale(0.110, 4, Vector((0,1,0))) @
                          Matrix.Scale(0.075, 4, Vector((0,0,1))))
                          
    bm.to_mesh(wheel_mesh)
    bm.free()
    
    wheel_obj.data.materials.append(mat_campagnolo_alloy)
    weld_and_smooth(wheel_obj, merge_dist=0.0002, smooth_angle_deg=34.0)
    add_bevel_modifier(wheel_obj, width=0.0015, segments=2, angle_limit=32.0)
    add_weighted_normal_modifier(wheel_obj)
    return wheel_obj

def build_michelin_radial_tire(is_left=True):
    """
    Constructs an authentic 185/70 HR14 Michelin XAS / Pirelli Cinturato radial tire
    with curved vintage sidewalls, bead retention lips, and directional highway tread sipes.
    """
    tire_mesh = bpy.data.meshes.new("Michelin_Tire_Mesh")
    tire_obj = bpy.data.objects.new("Michelin_Radial_Tire", tire_mesh)
    bpy.context.collection.objects.link(tire_obj)
    
    bm = bmesh.new()
    
    outer_radius = 0.307 # 614 mm overall tire diameter
    inner_radius = 0.182 # Bead seat
    tire_width   = 0.185 # 185 mm section width
    sign_x       = 1.0 if is_left else -1.0
    
    # Cross-sectional contour: from inner bead -> bulging sidewall -> shoulder -> tread face -> inner
    tire_profile = [
        # (X offset, Radius)
        ( 0.075, inner_radius),
        ( 0.092, 0.220), # Maximum sidewall bulge
        ( 0.088, 0.270),
        ( 0.076, 0.298), # Shoulder
        ( 0.045, outer_radius), # Outer tread
        ( 0.000, outer_radius + 0.002), # Center tread crown
        (-0.045, outer_radius),
        (-0.076, 0.298),
        (-0.088, 0.270),
        (-0.092, 0.220),
        (-0.075, inner_radius)
    ]
    
    t_rings = []
    tire_segs = 36
    for px, pr in tire_profile:
        ring = []
        for s in range(tire_segs):
            ang = 2.0 * math.pi * s / tire_segs
            y = pr * math.cos(ang)
            z = pr * math.sin(ang)
            v = bm.verts.new((px * sign_x, y, z))
            ring.append(v)
        t_rings.append(ring)
        
    for r in range(len(tire_profile) - 1):
        r1 = t_rings[r]
        r2 = t_rings[r + 1]
        for s in range(tire_segs):
            s_next = (s + 1) % tire_segs
            if is_left:
                bm.faces.new([r1[s], r2[s], r2[s_next], r1[s_next]])
            else:
                bm.faces.new([r1[s], r1[s_next], r2[s_next], r2[s]])
                
    # Directional circumferential water drainage channels (3 grooves)
    for gx in [-0.035, 0.0, 0.035]:
        bmesh.ops.create_torus(bm, major_radius=outer_radius, minor_radius=0.003,
                               major_segments=36, minor_segments=6,
                               matrix=Matrix.Translation((gx * sign_x, 0, 0)) @
                               Euler((0, math.radians(90), 0)).to_matrix().to_4x4())
                               
    bm.to_mesh(tire_mesh)
    bm.free()
    
    tire_obj.data.materials.append(mat_tire_rubber)
    weld_and_smooth(tire_obj, merge_dist=0.0002, smooth_angle_deg=34.0)
    add_weighted_normal_modifier(tire_obj)
    return tire_obj

def build_wheel_tire_assembly(name, loc_x, loc_y, loc_z, is_left=True):
    """Instantiates and positions a complete Campagnolo Turbina wheel and Michelin tire assembly."""
    wheel = build_campagnolo_turbina_wheel(is_left=is_left)
    tire  = build_michelin_radial_tire(is_left=is_left)
    
    wheel.name = f"{name}_Wheel"
    tire.name  = f"{name}_Tire"
    
    wheel.location = Vector((loc_x, loc_y, loc_z))
    tire.location  = Vector((loc_x, loc_y, loc_z))
    
    return wheel, tire

print("[RUNNING GEAR] Assembling 4 Campagnolo Turbina Wheel & Tire corners...")
w_fl, t_fl = build_wheel_tire_assembly("Front_Left",   0.662,  1.125, 0.307, is_left=True)
w_fr, t_fr = build_wheel_tire_assembly("Front_Right", -0.662,  1.125, 0.307, is_left=False)
w_rl, t_rl = build_wheel_tire_assembly("Rear_Left",    0.637, -1.125, 0.307, is_left=True)
w_rr, t_rr = build_wheel_tire_assembly("Rear_Right",  -0.637, -1.125, 0.307, is_left=False)

# ---------------------------------------------------------------------------
# 9. BASE LIGHTING HOUSINGS & CHROME BUMPERETTES (PHASE 1 FOUNDATIONS)
# ---------------------------------------------------------------------------
print("[JEWELRY] Adding Phase 1 Base Lamp Housings & Chrome Bumperettes...")

def build_alfa_spider_base_bumpers():
    """
    Constructs the split Italian chrome front and rear bumperettes with black rubber over-riders.
    """
    bmp_mesh = bpy.data.meshes.new("Alfa_Spider_Bumpers_Mesh")
    bmp_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Bumperettes", bmp_mesh)
    bpy.context.collection.objects.link(bmp_obj)
    
    bm = bmesh.new()
    
    # 1. Front Split Bumperettes (Left & Right flanking Scudetto heart opening)
    for side in [1.0, -1.0]:
        bx_in = 0.160 * side
        bx_out = 0.760 * side
        by = 2.010
        bz = 0.430
        
        # Chrome blade bar
        b_len = abs(bx_out - bx_in)
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(((bx_in + bx_out)*0.5, by, bz)) @
                              Matrix.Scale(b_len, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.045, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.065, 4, Vector((0,0,1))))
                              
        # Black rubber vertical over-rider guard
        ov_x = (bx_in + bx_out) * 0.45
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((ov_x, by + 0.025, bz)) @
                              Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.055, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.140, 4, Vector((0,0,1))))
                              
    # 2. Rear Split Bumperettes (Left & Right flanking truncated Kamm tail)
    for side in [1.0, -1.0]:
        bx_in = 0.220 * side
        bx_out = 0.770 * side
        by = -2.065
        bz = 0.460
        
        r_len = abs(bx_out - bx_in)
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(((bx_in + bx_out)*0.5, by, bz)) @
                              Matrix.Scale(r_len, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.045, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.065, 4, Vector((0,0,1))))
                              
        # Rear rubber over-rider
        ov_rx = (bx_in + bx_out) * 0.50
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((ov_rx, by - 0.025, bz)) @
                              Matrix.Scale(0.045, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.055, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.140, 4, Vector((0,0,1))))
                              
    bm.to_mesh(bmp_mesh)
    bm.free()
    
    bmp_obj.data.materials.append(mat_chrome)
    weld_and_smooth(bmp_obj)
    add_bevel_modifier(bmp_obj, width=0.002, segments=2, angle_limit=32.0)
    add_weighted_normal_modifier(bmp_obj)
    return bmp_obj

def build_alfa_spider_base_lights():
    """
    Constructs the base round 7-inch front sealed-beam headlamp buckets and
    rear Kamm-tail rectangular taillamp housings.
    """
    lights_mesh = bpy.data.meshes.new("Alfa_Spider_Base_Lights_Mesh")
    lights_obj = bpy.data.objects.new("Alfa_Romeo_Spider_Base_Lights", lights_mesh)
    bpy.context.collection.objects.link(lights_obj)
    
    bm = bmesh.new()
    
    # 1. Front Round 7-inch Headlamp Buckets (Chrome Bezel Ring & Glass Lens)
    headlamp_radius = 0.088
    for side in [0.550, -0.550]:
        hx, hy, hz = side, 1.840, 0.640
        # Chrome bezel ring
        bmesh.ops.create_torus(bm, major_radius=headlamp_radius, minor_radius=0.012,
                               major_segments=24, minor_segments=8,
                               matrix=Matrix.Translation((hx, hy, hz)) @
                               Euler((math.radians(10), 0, 0)).to_matrix().to_4x4())
        # Glass lens sphere dome
        bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=headlamp_radius * 0.96,
                                  matrix=Matrix.Translation((hx, hy + 0.015, hz)) @
                                  Euler((math.radians(10), 0, 0)).to_matrix().to_4x4())
                                  
    # 2. Front Bumper Turn Signal / Parking Lamp Indicator Housings
    for side in [0.460, -0.460]:
        ix, iy, iz = side, 1.995, 0.430
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((ix, iy, iz)) @
                              Matrix.Scale(0.120, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.025, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.045, 4, Vector((0,0,1))))
                              
    # 3. Rear Truncated Kamm-Tail Rectangular Taillamp Housings
    for side in [0.480, -0.480]:
        rx, ry, rz = side, -2.062, 0.580
        # Rectangular outer housing frame
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((rx, ry, rz)) @
                              Matrix.Scale(0.240, 4, Vector((1,0,0))) @
                              Matrix.Scale(0.025, 4, Vector((0,1,0))) @
                              Matrix.Scale(0.085, 4, Vector((0,0,1))))
                              
    # 4. Front Nose Classic Scudetto Shield Grille Frame
    # Heart-shaped triangular perimeter
    bmesh.ops.create_cylinder(bm, cap_ends=True, segments=3, radius=0.080, depth=0.025,
                              matrix=Matrix.Translation((0.0, 2.055, 0.470)) @
                              Euler((math.radians(85), 0, math.radians(180))).to_matrix().to_4x4())
                              
    bm.to_mesh(lights_mesh)
    bm.free()
    
    lights_obj.data.materials.append(mat_chrome)
    weld_and_smooth(lights_obj)
    return lights_obj

spider_bumpers = build_alfa_spider_base_bumpers()
spider_lights  = build_alfa_spider_base_lights()
print("[JEWELRY] Bumpers and Base Lights complete.")

# ---------------------------------------------------------------------------
# 10. DUAL-MODE GLB EXPORT PIPELINE & VERIFICATION
# ---------------------------------------------------------------------------
print("[EXPORT] Initiating Dual-Mode GLB Export Pipeline...")

try:
    CURRENT_FILE = __file__
except NameError:
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_alfa_romeo_spider_veloce_phase1.py"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(CURRENT_FILE), "..", "..", ".."))

PUBLIC_TARGET = os.path.join(ROOT_DIR, "public", "models", "vehicles", "convertible", "1970s", "vehicle.glb")
PUBLIC_CAR_TARGET = os.path.join(ROOT_DIR, "public", "models", "Car_Alfa_Romeo_Spider_Veloce_1970s.glb")
EXPORTS_TARGET = os.path.join(ROOT_DIR, "exports", "Car_Alfa_Romeo_Spider_Veloce_1970s.glb")

os.makedirs(os.path.dirname(PUBLIC_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(PUBLIC_CAR_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(EXPORTS_TARGET), exist_ok=True)

# Select all created objects for export
if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')

bpy.ops.object.select_all(action='SELECT')

# Execute glTF / GLB export
export_targets = [EXPORTS_TARGET, PUBLIC_CAR_TARGET, PUBLIC_TARGET]

for target_path in export_targets:
    print(f"[EXPORT] Writing GLB to: {target_path}")
    bpy.ops.export_scene.gltf(
        filepath=target_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
    )
    if os.path.exists(target_path):
        size_mb = os.path.getsize(target_path) / (1024 * 1024)
        print(f"[SUCCESS] Exported {target_path} ({size_mb:.2f} MB)")
    else:
        print(f"[ERROR] Failed to export {target_path}")

print("=============================================================================")
print("Alfa Romeo Spider Veloce Series 2 Coda Tronca (Phase 1) Generation Complete!")
print("=============================================================================")
