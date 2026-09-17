# pyright: reportMissingImports=false
"""Render orthographic side/front/rear/3-4 views of a body .blend for review."""
import bpy
import sys
import os
import math
from mathutils import Vector

argv = sys.argv
blend_path = argv[argv.index("--") + 1]
out_dir = argv[argv.index("--") + 2]

bpy.ops.wm.open_mainfile(filepath=blend_path)
os.makedirs(out_dir, exist_ok=True)

obj = None
for o in bpy.data.objects:
    if o.type == 'MESH':
        obj = o
        break
if obj is None:
    raise SystemExit("no mesh found")

# Bounding box
bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
min_v = Vector((min(p.x for p in bb), min(p.y for p in bb), min(p.z for p in bb)))
max_v = Vector((max(p.x for p in bb), max(p.y for p in bb), max(p.z for p in bb)))
centre = (min_v + max_v) * 0.5
size = max_v - min_v
diag = size.length

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in \
    [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1100
scene.render.resolution_y = 640
scene.render.film_transparent = False

# World: soft studio grey
world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.72, 0.74, 0.78, 1.0)
    bg.inputs[1].default_value = 1.1

# Key + fill + rim
for name, loc, energy in (
    ("Key",  (4.0, 5.0, -3.0), 2400),
    ("Fill", (-5.0, 2.5, -1.0), 900),
    ("Rim",  (0.0, 4.0, 6.0), 1400),
):
    ld = bpy.data.lights.new(name, type='AREA')
    ld.energy = energy
    ld.size = 6.0
    lo = bpy.data.objects.new(name, ld)
    lo.location = Vector(loc) + centre
    scene.collection.objects.link(lo)
    d = (centre - lo.location).normalized()
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

# Ground plane
bpy.ops.mesh.primitive_plane_add(size=diag * 8, location=(centre.x, min_v.y, centre.z))
gp = bpy.context.active_object
gm = bpy.data.materials.new("Ground")
gm.use_nodes = True
gm.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.55, 0.57, 0.60, 1)
gp.data.materials.append(gm)

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = 'ORTHO'
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

VIEWS = {
    # name  : (view direction, up-axis as a string for to_track_quat)
    "side":  (Vector((1, 0, 0)), 'Y'),
    "front": (Vector((0, 0, -1)), 'Y'),
    "rear":  (Vector((0, 0, 1)), 'Y'),
    "iso":   (Vector((0.85, 0.42, -0.72)), 'Y'),
}

from mathutils import Vector, Matrix

def look_at(cam_obj, target, direction, up_hint):
    """
    Orient cam_obj so it looks from `direction` toward `target`.

    Builds the rotation matrix explicitly so the camera's local -Z points at
    the target and its local +X lands on a predictable world axis. Relying on
    to_track_quat()'s up-axis string is ambiguous for a side view where the
    view direction is parallel to a world axis.
    """
    d = direction.normalized()
    forward = -d                                  # camera looks along its -Z
    up = up_hint.normalized()
    # Orthogonalise the up hint against the forward axis
    up = (up - forward * up.dot(forward)).normalized()
    right = forward.cross(up).normalized()
    up = right.cross(forward).normalized()
    rot = Matrix((
        (right.x, up.x, -forward.x),
        (right.y, up.y, -forward.y),
        (right.z, up.z, -forward.z),
    )).to_4x4()
    cam_obj.rotation_euler = rot.to_euler()
    cam_obj.location = target + d * diag * 2.5


for name, (direction, up) in VIEWS.items():
    up_vec = Vector((0, 1, 0)) if up == 'Y' else Vector((0, 0, 1))
    look_at(cam, centre, direction, up_vec)
    if name == "side":
        cam_data.ortho_scale = size.z * 1.10
        scene.render.resolution_x, scene.render.resolution_y = 1280, 520
    elif name in ("front", "rear"):
        cam_data.ortho_scale = size.x * 1.45
        scene.render.resolution_x, scene.render.resolution_y = 900, 560
    else:
        cam_data.ortho_scale = size.z * 1.18
        scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.filepath = os.path.join(out_dir, f"civic_{name}.png")
    bpy.ops.render.render(write_still=True)
    print("rendered", scene.render.filepath)
