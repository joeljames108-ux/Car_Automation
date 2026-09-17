# pyright: reportMissingImports=false
# ============================================================================
# HONDA CIVIC (11TH GEN) SEDAN — ACCURATE BODY SHELL GENERATOR
# ============================================================================
# Supersedes the generic/boxy "sedan" primitive that was produced by the
# automotiveBodyLofter hypercar-station path.
#
# Reference vehicle: 2022+ Honda Civic Sedan (11th generation, FE/FL)
#   Length        4678 mm  (4.678 m)
#   Width         1802 mm  (1.802 m)
#   Height        1415 mm  (1.415 m)
#   Wheelbase     2736 mm  (2.736 m)
#   Track (F/R)   1547 / 1577 mm
#   Wheels        18" 235/40R18  -> tyre OD ~0.6454 m
#   Cd            0.29
#
# Design cues encoded in the surface:
#   - Long, low hood with A-pillars pulled 50 mm rearward (elongated hood)
#   - Low beltline with large glass area; flat, level windowsill
#   - Smooth laser-brazed roofline (no roof moulding lip), gentle fastback
#     taper into a short 3-box deck
#   - Horizontal shoulder character line running fender -> taillight
#   - Upswept lower character line rising from behind the front wheel
#   - Strong rear shoulder/haunch with wheels nearly flush to fenders
#   - Upswept trunk-lid trailing edge (aero downwash reduction)
#   - Coke-bottle rocker undercut, tucked front/rear bumper corners
#
# Method: station-based lofting with a superellipse section primitive, then
# Blender-native Subdivision Surface (Catmull-Clark) for true smooth C2
# continuity — which is exactly what the runtime three.js lofter could not do.
#
# Coordinate standard: +X right, +Y up, +Z rearward, 1 unit = 1 metre
# (matches blender/README.md and EngineGlbAnimator.ts contracts)
# ============================================================================

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

# ── Reference dimensions (metres) ──────────────────────────────────────────
LENGTH        = 4.678
WIDTH         = 1.802
HEIGHT        = 1.415
WHEELBASE     = 2.736
TRACK_F       = 1.547
TRACK_R       = 1.577
WHEEL_DIA     = 0.6454      # 235/40R18
WHEEL_RADIUS  = WHEEL_DIA / 2.0
GROUND_CLEAR  = 0.125
HALF_W        = WIDTH / 2.0

# Longitudinal layout: Z = 0 at the front axle.
FRONT_AXLE_Z  = 0.0
REAR_AXLE_Z   = WHEELBASE
# Split the overhangs to reach 4.678 m total with a nose-heavy overhang,
# as on the real car (short front overhang, longer rear deck).
FRONT_OVERHANG = 0.845
REAR_OVERHANG  = LENGTH - WHEELBASE - FRONT_OVERHANG   # = 1.097
NOSE_Z        = FRONT_AXLE_Z - FRONT_OVERHANG          # -0.845
TAIL_Z        = REAR_AXLE_Z + REAR_OVERHANG            # +3.833


# ============================================================================
# Cross-section primitive
# ============================================================================

def body_section_ring(hw, y_sill, y_shoulder, y_belt, y_roof,
                      corner_r=1.0, roof_r=1.0, sill_r=1.0, n_side=22,
                      shoulder_full=1.0, roof_flat=0.62, sill_tuck=0.90):
    """
    Build a car body cross-section as an explicit contour path.

    Automotive sections are NOT radial. They are defined as a sequence of
    characteristic points joined by controlled curves. Modelled here, going up
    the right flank:

        sill      -> lower flank (near-vertical, slight tuck)  : rocker
        shoulder  -> maximum width (the "body highlight")      : beltline ledge
        belt      -> tumblehome begins (upper flank leans in)  : glass base
        roof      -> crowned across the top                    : roof

    Doing it as an explicit path rather than a superellipse is what produces
    the long flat flanks, the crisp shoulder highlight, and the correct
    tumblehome that make the shape read as a real car.

    Returns a closed list of (y, x) pairs, counter-clockwise from the sill.
    """
    n_side = max(6, n_side)

    def smoothstep(t):
        t = max(0.0, min(1.0, t))
        return t * t * (3.0 - 2.0 * t)

    def arc_blend(p0, p1, p2, t):
        """Quadratic Bezier through p0->p1(control)->p2 for corner rounding."""
        u = 1.0 - t
        return (u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1])

    right = []

    # ── Lower flank: sill up to the shoulder ──────────────────────────────
    # Nearly vertical, tucked in at the very bottom (rocker undercut).
    lower_start = y_sill + (y_shoulder - y_sill) * 0.06
    lower_end   = y_shoulder - (y_shoulder - y_sill) * 0.22
    for i in range(n_side):
        t = i / n_side
        y = lower_start + (lower_end - lower_start) * t
        # start tucked, quickly come out to near-full width
        w = (sill_tuck + (1.0 - sill_tuck) * smoothstep(t * 1.8)) * hw
        right.append((y, w))

    # ── Shoulder corner: the body highlight ───────────────────────────────
    sh_in  = (lower_end, hw * shoulder_full * 0.985)
    sh_mid = (y_shoulder - (y_belt - y_shoulder) * 0.15, hw * shoulder_full)
    sh_out = (y_shoulder + (y_belt - y_shoulder) * 0.18, hw * shoulder_full * 0.988)
    for i in range(max(3, n_side // 3)):
        t = i / max(3, n_side // 3)
        right.append(arc_blend(sh_in, sh_mid, sh_out, t))

    # ── Upper flank: tumblehome (leans inward toward the roof) ────────────
    tumble_start = sh_out
    tumble_end   = (y_belt, hw * 0.93)
    for i in range(1, max(4, n_side // 2)):
        t = i / max(4, n_side // 2)
        y = tumble_start[0] + (tumble_end[0] - tumble_start[0]) * t
        w = tumble_start[1] + (tumble_end[1] - tumble_start[1]) * smoothstep(t)
        right.append((y, w))

    # ── Greenhouse flank -> roof edge ─────────────────────────────────────
    roof_w = hw * roof_flat
    gh_start = (y_belt, hw * 0.93)
    gh_end   = (y_roof - (y_roof - y_belt) * 0.06, roof_w)
    for i in range(1, max(4, n_side // 2)):
        t = i / max(4, n_side // 2)
        y = gh_start[0] + (gh_end[0] - gh_start[0]) * t
        w = gh_start[1] + (gh_end[1] - gh_start[1]) * smoothstep(t)
        right.append((y, w))

    # ── Roof crown: across the top ────────────────────────────────────────
    top = []
    crown = 0.008 * hw
    n_top = max(4, n_side // 2)
    for i in range(n_top + 1):
        t = i / n_top
        x = roof_w * (1.0 - 2.0 * t)
        y = y_roof - crown * (1.0 - abs(1.0 - 2.0 * t) ** 1.6)
        top.append((y, x))

    # ── Assemble full closed ring ─────────────────────────────────────────
    pts = list(right)
    pts.extend(top[1:]) if top else None
    # Mirror the right flank down the left side
    for (y, x) in reversed(right):
        pts.append((y, -x))

    # ── Floor: close across the bottom ────────────────────────────────────
    floor_w = hw * sill_tuck
    n_floor = max(3, n_side // 3)
    floor = []
    for i in range(1, n_floor):
        t = i / n_floor
        floor.append((y_sill, -floor_w * (1.0 - 2.0 * t)))
    pts.extend(floor)

    return pts


# ============================================================================
# Station table — the Civic 11th-gen silhouette
# ============================================================================
# Each entry: (z, half_width, y_bottom, y_top, exponent, top_flat,
#              bottom_flat, top_narrow, bottom_narrow, label)
#
# Z runs from the nose (negative) to the tail (positive, = rearward).
# The vertical stations carry the design DNA described in the header.

STATIONS = [
    # ── Front end ──────────────────────────────────────────────────────────
    # Each station: z, half-width at shoulder, sill y, shoulder y, belt y,
    # roof y, roof-width fraction, sill tuck. Parameterised by the real
    # section landmarks rather than an abstract superellipse exponent.
    dict(z=NOSE_Z,         hw=HALF_W * 0.66, ys=0.285, ysh=0.360, yb=0.470,
         yr=0.520, rf=0.80, st=0.84, label="Nose_Tip"),
    dict(z=NOSE_Z + 0.09,  hw=HALF_W * 0.86, ys=0.230, ysh=0.385, yb=0.530,
         yr=0.585, rf=0.80, st=0.86, label="Front_Fascia"),
    dict(z=NOSE_Z + 0.20,  hw=HALF_W * 0.955, ys=0.180, ysh=0.420, yb=0.590,
         yr=0.640, rf=0.79, st=0.88, label="Bumper_Crest"),
    dict(z=NOSE_Z + 0.36,  hw=HALF_W * 0.99, ys=0.145, ysh=0.455, yb=0.650,
         yr=0.695, rf=0.78, st=0.89, label="Headlight_Line"),

    # ── Hood: long and low, fender line dropped ────────────────────────────
    dict(z=NOSE_Z + 0.56,  hw=HALF_W * 0.998, ys=0.130, ysh=0.495, yb=0.700,
         yr=0.760, rf=0.76, st=0.90, label="Hood_Front"),
    dict(z=NOSE_Z + 0.70,  hw=HALF_W * 1.0,   ys=0.126, ysh=0.525, yb=0.740,
         yr=0.815, rf=0.75, st=0.90, label="Hood_Mid"),
    # Front fender peak — flat, wide haunch over the wheel
    dict(z=FRONT_AXLE_Z,   hw=HALF_W * 1.0,   ys=0.125, ysh=0.545, yb=0.775,
         yr=0.862, rf=0.74, st=0.90, label="Front_Fender_Peak"),

    # ── Cowl & A-pillar: pillar pulled rearward, low cowl ──────────────────
    dict(z=0.44,  hw=HALF_W * 0.995, ys=0.125, ysh=0.555, yb=0.800,
         yr=0.905, rf=0.72, st=0.90, label="Cowl_Low"),
    # Windshield base — this is where the hood stops and glass begins
    dict(z=0.64,  hw=HALF_W * 0.988, ys=0.125, ysh=0.565, yb=0.815,
         yr=0.965, rf=0.70, st=0.90, label="Windshield_Base"),

    # ── Greenhouse: large glass area, level windowsill ─────────────────────
    dict(z=0.88,  hw=HALF_W * 0.980, ys=0.125, ysh=0.575, yb=0.845,
         yr=1.115, rf=0.66, st=0.90, label="A_Pillar_Mid"),
    dict(z=1.16,  hw=HALF_W * 0.975, ys=0.125, ysh=0.580, yb=0.880,
         yr=1.265, rf=0.63, st=0.90, label="Windshield_Top"),
    # Roof peak — flat, wide, laser-brazed (no drip lip)
    dict(z=1.50,  hw=HALF_W * 0.972, ys=0.125, ysh=0.585, yb=0.905,
         yr=1.385, rf=0.66, st=0.90, label="Roof_Front_Peak"),
    dict(z=1.94,  hw=HALF_W * 0.972, ys=0.125, ysh=0.585, yb=0.915,
         yr=1.412, rf=0.68, st=0.90, label="Roof_Peak_B_Pillar"),
    dict(z=2.34,  hw=HALF_W * 0.978, ys=0.125, ysh=0.585, yb=0.925,
         yr=1.400, rf=0.66, st=0.90, label="Roof_Rear"),

    # ── C-pillar: gentle fastback taper into the deck ──────────────────────
    dict(z=2.68,  hw=HALF_W * 0.990, ys=0.125, ysh=0.588, yb=0.935,
         yr=1.300, rf=0.62, st=0.90, label="C_Pillar_Upper"),
    dict(z=2.98,  hw=HALF_W * 0.998, ys=0.125, ysh=0.592, yb=0.945,
         yr=1.170, rf=0.60, st=0.90, label="Rear_Glass_Base"),

    # ── Rear shoulder: widest point of the car, strong haunch ──────────────
    dict(z=REAR_AXLE_Z, hw=HALF_W * 1.005, ys=0.125, ysh=0.600, yb=0.960,
         yr=1.075, rf=0.60, st=0.90, label="Rear_Haunch_Peak"),
    # Trunk lid / upswept trailing edge (aero downwash control)
    dict(z=3.48,  hw=HALF_W * 0.996, ys=0.135, ysh=0.590, yb=0.925,
         yr=1.020, rf=0.62, st=0.90, label="Decklid_Upswept"),
    dict(z=3.64,  hw=HALF_W * 0.975, ys=0.150, ysh=0.570, yb=0.890,
         yr=0.975, rf=0.66, st=0.89, label="Trunk_Trailing_Edge"),

    # ── Tail: horizontal tail face, tucked corners ─────────────────────────
    dict(z=TAIL_Z - 0.10, hw=HALF_W * 0.945, ys=0.190, ysh=0.540, yb=0.850,
         yr=0.930, rf=0.72, st=0.88, label="Rear_Bumper_Face"),
    dict(z=TAIL_Z,        hw=HALF_W * 0.815, ys=0.240, ysh=0.510, yb=0.790,
         yr=0.870, rf=0.80, st=0.86, label="Tail_Tip"),
]

# Beltline / glass shelf heights
BELTLINE_Y = 0.90


# ============================================================================
# Loft construction
# ============================================================================

def build_loft(n_side=22):
    """Build the body shell as a lofted bmesh surface from the station table."""
    bm = bmesh.new()

    rings = []
    for st in STATIONS:
        pts = body_section_ring(
            hw=st["hw"],
            y_sill=st["ys"],
            y_shoulder=st["ysh"],
            y_belt=st["yb"],
            y_roof=st["yr"],
            roof_flat=st["rf"],
            sill_tuck=st["st"],
            n_side=n_side,
        )
        ring = [bm.verts.new((x, y, st["z"])) for (y, x) in pts]
        rings.append(ring)

    # All rings must have identical vertex counts for the quad strip
    n = min(len(r) for r in rings)
    rings = [r[:n] for r in rings]

    # Stitch quads between consecutive rings
    for r in range(len(rings) - 1):
        a_ring = rings[r]
        b_ring = rings[r + 1]
        for i in range(n):
            j = (i + 1) % n
            try:
                bm.faces.new((a_ring[i], a_ring[j], b_ring[j], b_ring[i]))
            except ValueError:
                pass  # duplicate/degenerate face, skip

    # Cap the nose and tail with fans
    for idx, reverse in ((0, True), (len(rings) - 1, False)):
        ring = rings[idx]
        centre_y = sum(v.co.y for v in ring) / len(ring)
        centre = bm.verts.new((0.0, centre_y, STATIONS[idx]["z"]))
        for i in range(len(ring)):
            j = (i + 1) % len(ring)
            if reverse:
                bm.faces.new((ring[j], ring[i], centre))
            else:
                bm.faces.new((ring[i], ring[j], centre))

    bm.normal_update()
    return bm


def carve_wheel_arches(obj, radius=0.395, inset=0.055):
    """
    Create wheel-arch recesses by projecting an arch profile onto the flanks.

    A true boolean cut is used so the arch opening reads correctly in the
    viewport (the flat-floor loft alone has no arch definition).
    """
    arch_objs = []
    for axle_z, label in ((FRONT_AXLE_Z, "Front"), (REAR_AXLE_Z, "Rear")):
        for side, sign in (("R", 1.0), ("L", -1.0)):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=48,
                radius=radius,
                depth=0.28,
                location=(sign * (HALF_W * 0.82), WHEEL_RADIUS + 0.02, axle_z),
                rotation=(0.0, math.radians(90.0), 0.0),
            )
            cutter = bpy.context.active_object
            cutter.name = f"ArchCutter_{label}_{side}"

            boolex = obj.modifiers.new(name=f"ArchBool_{label}_{side}",
                                       type='BOOLEAN')
            boolex.operation = 'DIFFERENCE'
            boolex.object = cutter
            boolex.solver = 'EXACT'
            arch_objs.append(cutter)

    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        if m.type == 'BOOLEAN':
            bpy.ops.object.modifier_apply(modifier=m.name)

    for c in arch_objs:
        bpy.data.objects.remove(c, do_unlink=True)


def add_bevel_and_subdiv(obj, subdiv_levels=3, bevel_width=0.010):
    """Catmull-Clark smoothing + micro-bevel to crisp the panel edges."""
    # Micro-bevel first so subdivision keeps a tight shut-line read
    bev = obj.modifiers.new(name="PanelEdgeBevel", type='BEVEL')
    bev.width = bevel_width
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(52.0)
    bev.harden_normals = True

    sub = obj.modifiers.new(name="BodySubdivision", type='SUBSURF')
    sub.levels = subdiv_levels
    sub.render_levels = subdiv_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    # Keep the loft boundary from shrinking away from the reference envelope
    sub.use_limit_surface = True

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=bev.name)
    bpy.ops.object.modifier_apply(modifier=sub.name)


def shade_auto_smooth(obj, angle_deg=38.0):
    """Blender 4.1+ uses the Smooth by Angle modifier instead of auto_smooth."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    try:
        bpy.ops.object.modifier_add(type='NODES')
    except Exception:
        pass
    # Prefer the native operator when available (4.1+/5.x)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))
        return
    except Exception:
        pass
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(angle_deg))
    except Exception:
        # Fallback for older builds
        if hasattr(obj.data, "use_auto_smooth"):
            obj.data.use_auto_smooth = True
            obj.data.auto_smooth_angle = math.radians(angle_deg)


# ============================================================================
# Materials
# ============================================================================

def make_material(name, base_color, metallic, roughness, coat=1.0, coat_r=0.03):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF") or nodes.new("ShaderNodeBsdfPrincipled")

    def setv(names, value):
        for nm in names:
            if nm in bsdf.inputs:
                bsdf.inputs[nm].default_value = value
                return

    setv(["Base Color"], base_color)
    setv(["Metallic"], metallic)
    setv(["Roughness"], roughness)
    setv(["Coat Weight", "Coat", "Clearcoat"], coat)
    setv(["Coat Roughness", "Clearcoat Roughness"], coat_r)
    setv(["IOR"], 1.5)
    return mat


# ============================================================================
# Main
# ============================================================================

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.objects):
        for block in list(coll):
            try:
                coll.remove(block)
            except Exception:
                pass

    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # Build the loft
    bm = build_loft(n_side=22)
    mesh = bpy.data.meshes.new("Civic11_Sedan_BodyShell")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new("Civic11_Sedan_BodyShell", mesh)
    scene.collection.objects.link(obj)

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Weld the ring seams, then arch cut, bevel and smooth
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0016)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

    carve_wheel_arches(obj)
    add_bevel_and_subdiv(obj, subdiv_levels=3, bevel_width=0.008)
    shade_auto_smooth(obj, angle_deg=38.0)

    # Materials — 2022 Civic palette (Rallye Red is the hero press colour)
    body_mat = make_material("Civic_Body_RallyeRed",
                             (0.62, 0.035, 0.045, 1.0), 0.85, 0.14,
                             coat=1.0, coat_r=0.02)
    obj.data.materials.append(body_mat)

    # Report the achieved envelope against the reference
    bpy.context.view_layer.update()
    xs = [ (obj.matrix_world @ v.co) for v in obj.data.vertices ]
    min_x = min(p.x for p in xs); max_x = max(p.x for p in xs)
    min_y = min(p.y for p in xs); max_y = max(p.y for p in xs)
    min_z = min(p.z for p in xs); max_z = max(p.z for p in xs)
    print("=" * 68)
    print("CIVIC 11TH GEN SEDAN BODY GENERATED")
    print(f"  verts/faces : {len(obj.data.vertices)} / {len(obj.data.polygons)}")
    print(f"  width  (X)  : {max_x - min_x:.4f} m   target {WIDTH:.3f} m")
    print(f"  height (Y)  : {max_y - min_y:.4f} m   target {HEIGHT:.3f} m")
    print(f"  length (Z)  : {max_z - min_z:.4f} m   target {LENGTH:.3f} m")
    print(f"  wheelbase   : {WHEELBASE:.3f} m   track F/R {TRACK_F}/{TRACK_R} m")
    print("=" * 68)

    # ── Export ─────────────────────────────────────────────────────────────
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
        os.path.abspath(__file__)))), "assets", "body")
    os.makedirs(out_dir, exist_ok=True)
    blend_path = os.path.join(out_dir, "civic11_sedan_body.blend")
    glb_path = os.path.join(out_dir, "civic11_sedan_body.glb")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved blend -> {blend_path}")

    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_materials='EXPORT',
    )
    print(f"Saved GLB   -> {glb_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
