import bpy
import math

bpy.ops.mesh.primitive_cylinder_add(vertices=16)
cyl = bpy.context.active_object
bpy.context.view_layer.objects.active = cyl
cyl.select_set(True)

bpy.ops.mesh.customdata_custom_splitnormals_clear()
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))

print("SUCCESS: shade_smooth_by_angle applied successfully! Modifiers:", [m.name for m in cyl.modifiers])
