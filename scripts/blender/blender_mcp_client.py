#!/usr/bin/env python3
"""
============================================================================
Blender MCP Client - Direct Socket Bridge
============================================================================
Provides reliable, zero-hang programmatic control over the active Blender
instance via its native BlenderMCP TCP socket (port 9876).

Capabilities:
- ping(): Test liveness
- execute_code(code_str): Run Python code on Blender's main thread
- execute_file(file_path): Execute an entire Python file inside Blender
- get_viewport_screenshot(output_path, max_size=1200): Capture GPU viewport
- get_scene_info(): Inspect scene objects, materials, and hierarchy
============================================================================
"""

import socket
import json
import os
import sys
import time

BLENDER_HOST = '127.0.0.1'
BLENDER_PORT = 9876


def send_command(cmd_dict, timeout=120.0):
    """Send a command dictionary to Blender and receive JSON response."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect((BLENDER_HOST, BLENDER_PORT))
        cmd_bytes = json.dumps(cmd_dict).encode('utf-8')
        s.sendall(cmd_bytes)

        # Receive until valid JSON is reconstructed
        buffer = b''
        while True:
            chunk = s.recv(16384)
            if not chunk:
                break
            buffer += chunk
            try:
                response = json.loads(buffer.decode('utf-8'))
                return response
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
        if buffer:
            return json.loads(buffer.decode('utf-8'))
        return {"status": "error", "message": "Empty response from Blender"}
    except Exception as e:
        return {"status": "error", "message": f"Socket error: {str(e)}"}
    finally:
        try:
            s.close()
        except Exception:
            pass


def ping():
    """Verify Blender MCP listener is alive."""
    res = send_command({"type": "ping"}, timeout=5.0)
    return res.get("status") == "success" and res.get("result", {}).get("pong") is True


def execute_code(code_str, timeout=300.0):
    """Execute Python code in the active Blender main thread."""
    res = send_command({"type": "execute_code", "params": {"code": code_str}}, timeout=timeout)
    return res


def execute_file(file_path, timeout=300.0):
    """Read a local Python file and execute it in Blender."""
    with open(file_path, 'r', encoding='utf-8') as f:
        code_str = f.read()
    return execute_code(code_str, timeout=timeout)


def get_viewport_screenshot(output_path, max_size=1200, timeout=30.0):
    """Capture a high-res GPU viewport screenshot directly to disk."""
    abs_path = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    res = send_command({
        "type": "get_viewport_screenshot",
        "params": {
            "filepath": abs_path,
            "max_size": max_size,
            "format": "png"
        }
    }, timeout=timeout)
    return res


def get_scene_info():
    """Fetch objects, counts, and materials from the active Blender scene."""
    return send_command({"type": "get_scene_info"}, timeout=15.0)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: blender_mcp_client.py [ping|info|run <file>|code <code>|shot <output_path>]")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    if cmd == 'ping':
        ok = ping()
        print(f"Blender MCP status: {'ONLINE' if ok else 'OFFLINE'}")
        sys.exit(0 if ok else 1)
    elif cmd == 'info':
        info = get_scene_info()
        print(json.dumps(info, indent=2))
    elif cmd == 'run':
        if len(sys.argv) < 3:
            print("Error: Missing file path")
            sys.exit(1)
        res = execute_file(sys.argv[2])
        print(json.dumps(res, indent=2))
    elif cmd == 'shot':
        if len(sys.argv) < 3:
            print("Error: Missing output path")
            sys.exit(1)
        res = get_viewport_screenshot(sys.argv[2])
        print(json.dumps(res, indent=2))
    elif cmd == 'code':
        if len(sys.argv) < 3:
            print("Error: Missing code string")
            sys.exit(1)
        res = execute_code(sys.argv[2])
        print(json.dumps(res, indent=2))
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
