import bpy

try:
    bpy.ops.preferences.addon_enable(module='addon')
    print("Addon enabled.")
except Exception as e:
    print("Addon enable error:", e)

try:
    bpy.ops.blendermcp.start_server()
    print("BlenderMCP server started.")
except Exception as e:
    print("Start server error:", e)
