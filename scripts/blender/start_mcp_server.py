import bpy
import time

def start_mcp_delayed():
    try:
        print("[AUTO_START_MCP] Attempting to start Blender MCP Server...")
        if hasattr(bpy.ops, 'blendermcp') and hasattr(bpy.ops.blendermcp, 'start_server'):
            bpy.ops.blendermcp.start_server()
            print("[AUTO_START_MCP] blendermcp.start_server() called successfully!")
        else:
            print("[AUTO_START_MCP] bpy.ops.blendermcp.start_server not found, attempting direct server init...")
            import blender_mcp
            if not hasattr(bpy.types, "blendermcp_server") or not bpy.types.blendermcp_server:
                bpy.types.blendermcp_server = blender_mcp.BlenderMCPServer(host='127.0.0.1', port=9876)
            bpy.types.blendermcp_server.start()
            bpy.context.scene.blendermcp_server_running = True
            print("[AUTO_START_MCP] Direct BlenderMCPServer started on 127.0.0.1:9876!")
    except Exception as e:
        print("[AUTO_START_MCP] Error starting server:", e)
    return None

bpy.app.timers.register(start_mcp_delayed, first_interval=1.0)
