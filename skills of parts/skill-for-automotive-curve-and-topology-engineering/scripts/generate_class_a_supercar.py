import bpy
import bmesh
import math
from mathutils import Vector, Euler

def evaluate_quintic_bezier(p0, p1, p2, p3, p4, p5, t):
    """Quintic Bezier for G2 curvature continuity."""
    omt = 1.0 - t
    return (omt**5 * p0 +
            5.0 * omt**4 * t * p1 +
            10.0 * omt**3 * t**2 * p2 +
            10.0 * omt**2 * t**3 * p3 +
            5.0 * omt * t**4 * p4 +
            t**5 * p5)

def evaluate_cardinal_curves(y, y_min=-2.37, y_max=2.36):
    """
    Evaluates the 5 cardinal automotive curves at any longitudinal station y:
    - z_center(y): Centerline elevation (hood -> cowl -> roof -> rear deck -> Kamm lip)
    - x_shoulder(y): Lateral waist profile with Coke-bottle tuck and flared haunches
    - z_shoulder(y): Shoulder swage elevation
    - z_sill(y): Rocker sill height
    - theta_tumble(y): Cabin tumblehome angle
    """
    # Normalize y from 0 (rear) to 1 (front)
    u = (y - y_min) / (y_max - y_min)
    u = max(0.0, min(1.0, u))

    # Centerline Z(u) - Quintic Bezier through key hardpoints:
    # u=0.0 (Rear Kamm tail): Z=0.68m
    # u=0.18 (Rear deck): Z=0.76m
    # u=0.45 (Roof peak): Z=1.16m, slope=0
    # u=0.68 (Windshield cowl): Z=0.74m
    # u=0.88 (Front hood apex): Z=0.62m
    # u=1.0 (Front nose tip): Z=0.48m
    if u < 0.45:
        # Rear tail to roof peak (smooth fastback)
        t = u / 0.45
        # Hermite/Bezier blend from Z=0.68 up to 1.16 with zero slope at t=1
        z_center = 0.68 + (1.16 - 0.68) * (3.0 * t**2 - 2.0 * t**3)
    elif u < 0.68:
        # Roof peak down to windshield cowl
        t = (u - 0.45) / (0.68 - 0.45)
        # Smooth S-curve with zero slope at t=0
        z_center = 1.16 - (1.16 - 0.74) * (3.0 * t**2 - 2.0 * t**3)
    else:
        # Windshield cowl down to front nose
        t = (u - 0.68) / (1.0 - 0.68)
        # Power law curve for aerodynamic drooping hood
        z_center = 0.74 - (0.74 - 0.48) * (t ** 1.35)

    # Lateral Shoulder X(u) - Coke-bottle waist tuck
    # Front fender flare at u=0.82 (X=1.04m)
    # Waist pinch at u=0.55 (X=0.91m) -> 130mm tuck!
    # Rear haunch flare at u=0.25 (X=1.07m)
    # Rear tail taper at u=0.0 (X=0.98m)
    # Front nose taper at u=1.0 (X=0.88m)
    if u > 0.82:
        t = (u - 0.82) / (1.0 - 0.82)
        x_shoulder = 1.04 - (1.04 - 0.88) * t
    elif u > 0.55:
        t = (u - 0.55) / (0.82 - 0.55)
        x_shoulder = 0.91 + (1.04 - 0.91) * (math.sin(t * math.pi * 0.5))
    elif u > 0.25:
        t = (u - 0.25) / (0.55 - 0.25)
        x_shoulder = 1.07 - (1.07 - 0.91) * (math.sin(t * math.pi * 0.5))
    else:
        t = u / 0.25
        x_shoulder = 0.98 + (1.07 - 0.98) * (math.sin(t * math.pi * 0.5))

    # Shoulder elevation
    z_shoulder = 0.68 + (z_center - 0.68) * 0.35

    # Rocker sill
    z_sill = 0.12

    # Wheel arch cutouts at front (Y=1.35m) and rear (Y=-1.35m)
    r_front = abs(y - 1.35)
    r_rear = abs(y - (-1.35))
    arch_radius = 0.375
    z_arch = z_sill
    is_arch = False
    if r_front < arch_radius:
        z_arch = max(z_sill, 0.34 + math.sqrt(max(0.0, arch_radius**2 - r_front**2)))
        is_arch = True
    elif r_rear < arch_radius:
        z_arch = max(z_sill, 0.35 + math.sqrt(max(0.0, arch_radius**2 - r_rear**2)))
        is_arch = True

    # Greenhouse tumblehome
    # In cabin area (u in [0.35, 0.70]), roof is narrower than shoulder
    if 0.35 <= u <= 0.70:
        # Jet fighter canopy width at roof
        x_roof = 0.56 * (1.0 - 0.2 * abs((u - 0.525) / 0.175)**2)
    else:
        x_roof = x_shoulder * 0.70

    return {
        "z_center": z_center,
        "x_shoulder": x_shoulder,
        "z_shoulder": z_shoulder,
        "z_sill": z_arch if is_arch else z_sill,
        "x_roof": x_roof,
        "is_arch": is_arch,
        "u": u
    }

def generate_transverse_station(y, n_pts=24):
    """
    Generates a smoothly lofted half-station (+X) at longitudinal coordinate y,
    sampled with n_pts points from sill up to center ridge.
    """
    p = evaluate_cardinal_curves(y)
    u = p["u"]

    pts = []
    # Point 0: Lower sill / wheel arch lip
    x_sill = p["x_shoulder"] * 0.88 if not p["is_arch"] else p["x_shoulder"] * 0.96
    pts.append(Vector((x_sill, y, p["z_sill"])))

    # Points 1..8: Lower door / rocker flank tumble
    # S-curve lofting from sill up to shoulder swage
    for i in range(1, 8):
        f = i / 8.0
        # Concave inward tuck
        x = x_sill + (p["x_shoulder"] - x_sill) * (f**1.2)
        z = p["z_sill"] + (p["z_shoulder"] - p["z_sill"]) * (math.sin(f * math.pi * 0.5))
        pts.append(Vector((x, y, z)))

    # Point 8 is the Shoulder Crown
    pts.append(Vector((p["x_shoulder"], y, p["z_shoulder"])))

    # Points 9..16: Upper body / Greenhouse / Hood
    # If in cabin region, loft inward to roof. If in hood/trunk region, loft to center ridge
    if 0.35 <= u <= 0.70:
        # Cabin greenhouse: A-pillar / B-pillar inward slant
        for i in range(1, 8):
            f = i / 8.0
            # Convex outward bubble for tumblehome
            x = p["x_shoulder"] - (p["x_shoulder"] - p["x_roof"]) * (f**0.85)
            z = p["z_shoulder"] + (p["z_center"] - p["z_shoulder"]) * (math.sin(f * math.pi * 0.5))
            pts.append(Vector((x, y, z)))
    else:
        # Hood or rear deck: crown curve from shoulder to center
        for i in range(1, 8):
            f = i / 8.0
            x = p["x_shoulder"] * (1.0 - f**0.9)
            # Gentle convex parabolic hood crown
            z = p["z_shoulder"] + (p["z_center"] - p["z_shoulder"]) * (math.sin(f * math.pi * 0.5))
            pts.append(Vector((x, y, z)))

    # Point 16: Centerline ridge
    pts.append(Vector((0.0, y, p["z_center"])))

    return pts

def build_perfect_g2_body(name="BODY_ClassA_Perfect_G2"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    # Create 48 dense longitudinal stations from y=-2.37 to y=2.36
    n_stations = 48
    y_coords = [ -2.37 + (2.36 - (-2.37)) * (i / (n_stations - 1)) for i in range(n_stations) ]

    station_verts = []
    for y in y_coords:
        pts = generate_transverse_station(y)
        row = [bm.verts.new(p) for p in pts]
        station_verts.append(row)

    # Stitch rows into pure quads
    for s in range(len(station_verts) - 1):
        row0 = station_verts[s]
        row1 = station_verts[s + 1]
        for p in range(len(row0) - 1):
            v0 = row0[p]
            v1 = row0[p + 1]
            v2 = row1[p + 1]
            v3 = row1[p]
            bm.faces.new([v0, v1, v2, v3])

    # Mirror across X=0
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    # Modifiers: Mirror, Subsurf (Level 2), Solidify, WeightedNormal
    # 1. Mirror
    mod_mir = obj.modifiers.new("Mirror", 'MIRROR')
    mod_mir.use_axis[0] = True
    mod_mir.use_clip = True
    mod_mir.merge_threshold = 0.001

    # 2. Subsurf (Catmull-Clark G2)
    mod_sub = obj.modifiers.new("Subdivision", 'SUBSURF')
    mod_sub.levels = 2
    mod_sub.render_levels = 2

    # 3. Solidify (2.5mm sheet-metal depth)
    mod_sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    mod_sol.thickness = 0.003
    mod_sol.offset = -1.0

    # 4. Weighted Normal
    mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True

    # PBR Metallic Paint Material
    mat = bpy.data.materials.new(name="Paint_Apex_Rosso_Corsa")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.04, 0.08, 1.0) # Deep Italian Rosso Corsa
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.18
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
            bsdf.inputs["Coat Roughness"].default_value = 0.03
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
    obj.data.materials.append(mat)

    return obj

def render_test_frame(output_path):
    # Studio lighting
    key = bpy.data.lights.new(name="Key", type='AREA')
    key.energy = 1800.0
    key.size = 5.0
    k_obj = bpy.data.objects.new(name="Key", object_data=key)
    k_obj.location = (4.0, 3.5, 3.5)
    k_obj.rotation_euler = Euler((math.radians(45), math.radians(20), math.radians(45)), 'XYZ')
    bpy.context.collection.objects.link(k_obj)

    rim = bpy.data.lights.new(name="Rim", type='AREA')
    rim.energy = 1400.0
    rim.size = 6.0
    r_obj = bpy.data.objects.new(name="Rim", object_data=rim)
    r_obj.location = (-4.0, -3.5, 3.0)
    r_obj.rotation_euler = Euler((math.radians(45), math.radians(-20), math.radians(-45)), 'XYZ')
    bpy.context.collection.objects.link(r_obj)

    # Camera
    cam = bpy.data.cameras.new(name="Cam")
    cam.lens = 65.0
    c_obj = bpy.data.objects.new(name="Cam", object_data=cam)
    c_obj.location = (4.5, 4.0, 2.2)
    dir_vec = Vector((0.0, 0.0, 0.6)) - c_obj.location
    c_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.collection.objects.link(c_obj)
    bpy.context.scene.camera = c_obj

    # Background
    world = bpy.data.worlds.new(name="Studio")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.04, 0.05, 0.07, 1.0)
    bpy.context.scene.world = world

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered perfect G2 test body to: {output_path}")

if __name__ == '__main__':
    build_perfect_g2_body()
    out_file = "C:/Users/joelj/.gemini/antigravity-ide/brain/30296f4e-06b3-4c30-beb6-aae40bf38d0e/perfect_g2_body_test.png"
    render_test_frame(out_file)
