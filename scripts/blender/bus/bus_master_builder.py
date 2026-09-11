"""
Bus Master Builder Orchestration Script (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Orchestrates: Scene setup, 16 PBR materials, chassis frame, e-powertrain, air suspension,
monocoque body shell, roof HVAC pods, panoramic glazing, bi-fold doors, LED optics & destination signs,
hardware & coach mirrors, dually wheels/brakes, interior cockpit & seating, topology finalization,
and complete dual-mode GLB export.
"""

import sys
import os

scripts_path = os.path.dirname(os.path.abspath(__file__))
if scripts_path not in sys.path:
    sys.path.insert(0, scripts_path)

import bpy
import bus_common
import bus_materials
import bus_chassis
import bus_body
import bus_glazing
import bus_doors
import bus_lighting
import bus_hardware
import bus_wheels
import bus_interior
import bus_finalize
import bus_export

import importlib
importlib.reload(bus_common)
importlib.reload(bus_materials)
importlib.reload(bus_chassis)
importlib.reload(bus_body)
importlib.reload(bus_glazing)
importlib.reload(bus_doors)
importlib.reload(bus_lighting)
importlib.reload(bus_hardware)
importlib.reload(bus_wheels)
importlib.reload(bus_interior)
importlib.reload(bus_finalize)
importlib.reload(bus_export)

def build_complete_bus():
    print("=" * 75)
    print("BUILDING ELECTRIC ZERO-EMISSION TRANSIT BUS (HIGH-FIDELITY PRODUCTION ASSET)")
    print("=" * 75)
    
    # 1. Safe scene reset
    bus_common.safe_reset_scene()
    
    # 2. Master PBR material registry
    mat_registry = bus_materials.BusMaterials()
    
    # 3. Chassis & e-Powertrain
    chassis_objs = bus_chassis.build_chassis_and_powertrain(mat_registry)
    
    # 4. Body Shell & Roof HVAC Pods
    body_objs = bus_body.build_bus_body_and_roof(mat_registry)
    
    # 5. Panoramic Glazing & Tinted Safety Glass
    glazing_objs = bus_glazing.build_bus_glazing(mat_registry)
    
    # 6. Bi-Fold Boarding Doors & Accessibility System
    door_objs = bus_doors.build_bus_doors(mat_registry)
    
    # 7. Lighting Optics & LED Destination Sign
    lighting_objs = bus_lighting.build_bus_lighting(mat_registry)
    
    # 8. Exterior Hardware & Coach Mirrors
    hardware_objs = bus_hardware.build_bus_hardware(mat_registry)
    
    # 9. Heavy-Duty Steer Wheels & Dually Drive Wheels
    wheel_objs = bus_wheels.build_bus_wheels_and_brakes(mat_registry)
    
    # 10. Interior Cockpit & Seating Rows
    interior_objs = bus_interior.build_bus_interior(mat_registry)
    
    # 11. Topology Finalization & Normal Hardening
    root_obj = bus_finalize.finalize_bus_topology()
    
    # 12. Showroom Lighting & Camera Setup
    setup_showroom_lighting()
    
    # 13. Export all production GLB artifacts
    bus_export.export_all()
    
    total_objs = (len(chassis_objs) + len(body_objs) + len(glazing_objs) + 
                  len(door_objs) + len(lighting_objs) + len(hardware_objs) + 
                  len(wheel_objs) + len(interior_objs))
    print("=" * 75)
    print(f"BUS BUILD COMPLETE! {total_objs} semantic parts assembled and exported.")
    print("=" * 75)

def setup_showroom_lighting():
    """Sets up three-point studio lighting and isometric view camera."""
    # Key Light (Warm daylight)
    key_light_data = bpy.data.lights.new(name="Light_Key_Sun", type='SUN')
    key_light_data.energy = 4.5
    key_light_data.color = (1.0, 0.98, 0.95)
    key_light = bpy.data.objects.new("Light_Key_Sun", key_light_data)
    key_light.location = (8.0, 12.0, 10.0)
    key_light.rotation_euler = (0.785, 0.35, -0.65)
    bpy.context.scene.collection.objects.link(key_light)
    
    # Fill Light (Cool sky reflection)
    fill_light_data = bpy.data.lights.new(name="Light_Fill_Sun", type='SUN')
    fill_light_data.energy = 2.0
    fill_light_data.color = (0.85, 0.92, 1.0)
    fill_light = bpy.data.objects.new("Light_Fill_Sun", fill_light_data)
    fill_light.location = (-10.0, -8.0, 8.0)
    fill_light.rotation_euler = (0.9, -0.4, 2.2)
    bpy.context.scene.collection.objects.link(fill_light)
    
    # Studio Camera
    cam_data = bpy.data.cameras.new(name="Cam_Showroom_Hero")
    cam_data.lens = 45.0
    cam = bpy.data.objects.new("Cam_Showroom_Hero", cam_data)
    cam.location = (7.5, 12.5, 4.2)
    cam.rotation_euler = (1.35, 0.0, 2.65)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

if __name__ == "__main__":
    build_complete_bus()
