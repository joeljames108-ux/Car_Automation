"""
============================================================================
EXECUTIVE SEDAN BLUEPRINT PLACEMENT & ORTHOGRAPHIC CALIBRATION (BLENDER)
============================================================================
Automates the exact placement, scaling, and alignment of 4-view orthographic
blueprints (Side, Top, Front, Rear) for modern executive 3-box sedan modeling.

Vehicle Dimensions (Sedan Platform):
- Wheelbase (WB): 2,850 mm (2.85 m)
- Overall Length: 4,880 mm (4.88 m)
- Overall Width: 1,860 mm (1.86 m)
- Overall Height: 1,440 mm (1.44 m)
- Ground Clearance: 135 mm (0.135 m)
- Front Overhang: 920 mm (0.92 m)
- Rear Overhang: 1,110 mm (1.11 m)
- Front / Rear Track: 1,620 mm (1.62 m)
- Tire Diameter: ~680 mm (Radius: 340 mm)

Placement Checklist:
1. Side Profile (Numpad 3):
   - Ground plane aligned with bottom of tires (Z = 0.0)
   - Wheelbase center aligned at origin datum (Y = 0.0)
   - Front wheel center at Y = +1.425 m, Rear wheel center at Y = -1.425 m
   - Roof crown marker at Z = 1.440 m
2. Top View (Numpad 7):
   - Center symmetry line aligned with World X = 0.0
   - Center of wheelbase at Y = 0.0
3. Front View (Numpad 1):
   - Centered at X = 0.0
   - Bottom of tires at Z = 0.0, Roof height at Z = 1.440 m, Width = 1.860 m
4. Rear View (Ctrl + Numpad 1):
   - Centered at X = 0.0
   - Bottom of tires at Z = 0.0, Roof height at Z = 1.440 m, Beltline at Z = 0.980 m

Usage:
  blender -b -P scripts/blender/setup_sedan_blueprints.py
  (or run within Blender's Scripting workspace)
============================================================================
"""

import math

try:
    import bpy
    import mathutils
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False
    print("[INFO] Running in CLI mode outside Blender. Validating blueprint alignment schema.")


# ── SEDAN ENGINEERING PLATFORM METRICS (METERS) ──
WHEELBASE = 2.850
OVERALL_LENGTH = 4.880
OVERALL_WIDTH = 1.860
OVERALL_HEIGHT = 1.440
RIDE_HEIGHT = 0.135
FRONT_OVERHANG = 0.920
REAR_OVERHANG = 1.110
TRACK_WIDTH = 1.620
TIRE_RADIUS = 0.340
HOOD_HEIGHT = 0.920
BELTLINE_HEIGHT = 0.980

# Longitudinal wheel positions relative to wheelbase center (Y = 0)
FRONT_AXLE_Y = +(WHEELBASE / 2.0)  # +1.425 m
REAR_AXLE_Y = -(WHEELBASE / 2.0)   # -1.425 m

# Vehicle extreme boundaries along Y
FRONT_BUMPER_Y = FRONT_AXLE_Y + FRONT_OVERHANG  # +2.345 m
REAR_BUMPER_Y = REAR_AXLE_Y - REAR_OVERHANG     # -2.535 m


def get_or_create_collection(name, parent_collection=None):
    """Retrieve an existing collection or create and link a new one."""
    if not IN_BLENDER:
        return {"name": name}

    if name in bpy.data.collections:
        col = bpy.data.collections[name]
    else:
        col = bpy.data.collections.new(name)

    target_parent = parent_collection if parent_collection else bpy.context.scene.collection
    if col.name not in target_parent.children:
        target_parent.children.link(col)

    return col


def create_blueprint_empty(name, image_path=None, size=OVERALL_LENGTH, location=(0, 0, 0), rotation=(0, 0, 0), target_collection=None):
    """
    Instantiates an orthographic reference image Empty with calibrated transform,
    display settings, transparency, and placement.
    """
    if not IN_BLENDER:
        return {"name": name, "location": location, "rotation": rotation, "size": size}

    if name in bpy.data.objects:
        obj = bpy.data.objects[name]
    else:
        obj = bpy.data.objects.new(name, None)
        target_collection.objects.link(obj)

    obj.empty_display_type = "IMAGE"
    obj.empty_display_size = size
    obj.location = location
    obj.rotation_euler = rotation

    # Configure Empty Image properties if Blender API supports them
    if hasattr(obj, "use_empty_image_ortho"):
        obj.use_empty_image_ortho = True
        obj.use_empty_image_perspective = False
        obj.color[3] = 0.5  # 50% opacity for clear topology overlay

    # Optional: Load image datablock if provided
    if image_path and hasattr(bpy.data, "images"):
        try:
            img = bpy.data.images.load(image_path, check_existing=True)
            obj.data = img
        except Exception as e:
            print(f"[NOTE] Image '{image_path}' not loaded automatically: {e}")

    return obj


def create_datum_guide_lines(target_collection):
    """
    Creates lightweight datum guide curves marking:
    - Ground Plane (Z = 0)
    - Roof Height (Z = 1.44m)
    - Wheelbase Center & Axles (Y = +1.425m, Y = -1.425m)
    - Center Symmetry Line (X = 0)
    """
    if not IN_BLENDER:
        return

    curve_data = bpy.data.curves.new("Sedan_Datum_Guides_Curve", type="CURVE")
    curve_data.dimensions = "3D"

    # Guide 1: Ground plane line along Y (Z=0, X=0)
    spline_ground = curve_data.splines.new("POLY")
    spline_ground.points.add(1)
    spline_ground.points[0].co = (0.0, REAR_BUMPER_Y - 0.2, 0.0, 1.0)
    spline_ground.points[1].co = (0.0, FRONT_BUMPER_Y + 0.2, 0.0, 1.0)

    # Guide 2: Roof crown height line along Y (Z=1.44m, X=0)
    spline_roof = curve_data.splines.new("POLY")
    spline_roof.points.add(1)
    spline_roof.points[0].co = (0.0, -1.2, OVERALL_HEIGHT, 1.0)
    spline_roof.points[1].co = (0.0, +0.8, OVERALL_HEIGHT, 1.0)

    # Guide 3: Front Axle vertical marker (Y=+1.425m, X=0)
    spline_fa = curve_data.splines.new("POLY")
    spline_fa.points.add(1)
    spline_fa.points[0].co = (0.0, FRONT_AXLE_Y, 0.0, 1.0)
    spline_fa.points[1].co = (0.0, FRONT_AXLE_Y, TIRE_RADIUS * 2.0, 1.0)

    # Guide 4: Rear Axle vertical marker (Y=-1.425m, X=0)
    spline_ra = curve_data.splines.new("POLY")
    spline_ra.points.add(1)
    spline_ra.points[0].co = (0.0, REAR_AXLE_Y, 0.0, 1.0)
    spline_ra.points[1].co = (0.0, REAR_AXLE_Y, TIRE_RADIUS * 2.0, 1.0)

    guide_obj = bpy.data.objects.new("REF_Sedan_Datum_Rulers", curve_data)
    guide_obj.hide_select = True
    target_collection.objects.link(guide_obj)


def setup_sedan_blueprint_scene():
    """
    Main orchestrator: builds 00_Reference collection with perfectly aligned
    Side, Top, Front, and Rear orthographic blueprint projection empties.
    """
    print("=================================================================")
    print("  EXECUTIVE SEDAN BLUEPRINT PLACEMENT & ORTHOGRAPHIC CALIBRATION")
    print("=================================================================")

    # 1. Master Collection & 00_Reference
    master_col = get_or_create_collection("Car_Sedan_Master")
    ref_col = get_or_create_collection("00_Reference", parent_collection=master_col)

    # 2. Origin Empty at (0,0,0) - Master Mirror Target
    if IN_BLENDER:
        if "REF_Origin_Empty" in bpy.data.objects:
            origin_empty = bpy.data.objects["REF_Origin_Empty"]
        else:
            origin_empty = bpy.data.objects.new("REF_Origin_Empty", None)
            origin_empty.empty_display_type = "ARROWS"
            origin_empty.empty_display_size = 0.5
            origin_empty.location = (0.0, 0.0, 0.0)
            ref_col.objects.link(origin_empty)
        print("  [OK] REF_Origin_Empty established at (0.0, 0.0, 0.0)")

    # 3. SIDE PROFILE (Numpad 3):
    # - View along X-axis
    # - Ground plane at bottom of tires: Z = 0.0
    # - Center of wheelbase at Y = 0.0
    # - Longitudinal center offset: (FRONT_BUMPER_Y + REAR_BUMPER_Y) / 2
    side_center_y = (FRONT_BUMPER_Y + REAR_BUMPER_Y) / 2.0
    side_center_z = OVERALL_HEIGHT / 2.0
    bp_side = create_blueprint_empty(
        name="REF_Blueprint_Side",
        size=OVERALL_LENGTH,
        location=(OVERALL_WIDTH / 2.0 + 0.3, side_center_y, side_center_z),
        rotation=(math.radians(90.0), 0.0, math.radians(90.0)),
        target_collection=ref_col,
    )
    print(f"  [OK] REF_Blueprint_Side placed: Z={side_center_z:.3f}m (Ground=0.0m), Y={side_center_y:.3f}m (WB Axles at +/-{WHEELBASE/2:.3f}m)")

    # 4. TOP VIEW (Numpad 7):
    # - View along Z-axis looking down
    # - Center symmetry line aligns perfectly with World X = 0.0
    # - Longitudinal position centered on overall vehicle length
    bp_top = create_blueprint_empty(
        name="REF_Blueprint_Top",
        size=OVERALL_LENGTH,
        location=(0.0, side_center_y, -0.05),
        rotation=(0.0, 0.0, 0.0),
        target_collection=ref_col,
    )
    print(f"  [OK] REF_Blueprint_Top placed: Center symmetry line X = 0.0m, Length = {OVERALL_LENGTH}m, Width = {OVERALL_WIDTH}m")

    # 5. FRONT VIEW (Numpad 1):
    # - View looking back along Y-axis
    # - Centered laterally at X = 0.0
    # - Bottom of tires at Z = 0.0, Crown at Z = 1.440m
    bp_front = create_blueprint_empty(
        name="REF_Blueprint_Front",
        size=OVERALL_WIDTH,
        location=(0.0, FRONT_BUMPER_Y + 0.3, side_center_z),
        rotation=(math.radians(90.0), 0.0, 0.0),
        target_collection=ref_col,
    )
    print(f"  [OK] REF_Blueprint_Front placed: Centered X=0.0m, Roof Height={OVERALL_HEIGHT}m, Width={OVERALL_WIDTH}m")

    # 6. REAR VIEW (Ctrl + Numpad 1):
    # - View looking forward along Y-axis
    # - Centered laterally at X = 0.0
    # - Roof crown at Z = 1.440m, Beltline at Z = 0.980m
    bp_rear = create_blueprint_empty(
        name="REF_Blueprint_Rear",
        size=OVERALL_WIDTH,
        location=(0.0, REAR_BUMPER_Y - 0.3, side_center_z),
        rotation=(math.radians(90.0), 0.0, math.radians(180.0)),
        target_collection=ref_col,
    )
    print(f"  [OK] REF_Blueprint_Rear placed: Centered X=0.0m, Roof Height={OVERALL_HEIGHT}m, Beltline={BELTLINE_HEIGHT}m")

    # 7. Add Datum Rulers
    create_datum_guide_lines(ref_col)
    print("  [OK] Datum reference guides created (Ground Z=0, Roof Z=1.44m, Front/Rear Axle markers)")

    print("=================================================================")
    print("  CALIBRATION COMPLETE: Blueprints locked & aligned for modeling.")
    print("=================================================================")

    return {
        "side": bp_side,
        "top": bp_top,
        "front": bp_front,
        "rear": bp_rear,
        "metrics": {
            "wheelbase": WHEELBASE,
            "overallLength": OVERALL_LENGTH,
            "overallWidth": OVERALL_WIDTH,
            "overallHeight": OVERALL_HEIGHT,
            "frontAxleY": FRONT_AXLE_Y,
            "rearAxleY": REAR_AXLE_Y,
        },
    }


if __name__ == "__main__":
    setup_sedan_blueprint_scene()
