import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Eye,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonSensorLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [lidarRange, setLidarRange] = useState(250); // meters
  const [pointCloudDensity, setPointCloudDensity] = useState(128); // laser channels
  const [objectTracking, setObjectTracking] = useState(true);

  // Animated 360 LiDAR raycast canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Range rings
      ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
      ctx.lineWidth = 1;
      [40, 80, 120, 160].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating sweep line
      angle += 0.04;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 160, cy + Math.sin(angle) * 160);
      ctx.stroke();

      // Simulated pointcloud particles
      ctx.fillStyle = "rgba(0, 229, 255, 0.7)";
      for (let i = 0; i < pointCloudDensity / 2; i++) {
        const pAngle = (i / (pointCloudDensity / 2)) * Math.PI * 2 + Math.sin(angle) * 0.1;
        const dist = 50 + ((i * 17) % 100);
        const px = cx + Math.cos(pAngle) * dist;
        const py = cy + Math.sin(pAngle) * dist;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }

      // Tracked simulated objects (Bounding boxes)
      if (objectTracking) {
        ctx.strokeStyle = "#e040fb";
        ctx.lineWidth = 1.5;
        // Object 1: Ahead vehicle
        ctx.strokeRect(cx - 20, cy - 90, 40, 30);
        // Object 2: Corner barrier apex
        ctx.strokeRect(cx + 60, cy + 30, 25, 25);
      }

      // Vehicle center icon dot
      ctx.fillStyle = "#ffd740";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [pointCloudDensity, objectTracking]);

  const sensorArray = [
    { name: "Solid-State Front LiDAR (1550nm)", status: "ONLINE", latency: "1.4 ms", fov: "120° x 30°" },
    { name: "Triple Stereoscopic Front Cameras (8MP)", status: "ONLINE", latency: "2.1 ms", fov: "150° Wide" },
    { name: "4D Imaging Surround Radar (77GHz)", status: "ONLINE", latency: "0.8 ms", fov: "360° Array" },
    { name: "12-Point Ultrasonic Proximity Sensors", status: "ONLINE", latency: "0.2 ms", fov: "5m Periphery" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "360° LIDAR & AUTONOMOUS PERCEPTION LAB",
          subtitle: "Pointcloud raycasting, neural edge compute, and sensor fusion redundancy",
          icon: <Radio size={18} />,
          badge: <NeonHorizonBadge variant="live">LEVEL 4 ADAS ACTIVE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PERCEPTION RANGE" value={lidarRange} unit="m" accentColor="cyan" />
          <NeonHorizonDataCard label="NEURAL COMPUTE" value="1,200 TOPS" accentColor="gold" />
          <NeonHorizonDataCard label="FUSION LATENCY" value="3.8 ms" accentColor="emerald" />
          <NeonHorizonDataCard label="SENSOR HEALTH" value="100% ONLINE" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left LiDAR Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "360° POLAR POINTCLOUD RADAR FEED",
              icon: <Eye size={16} />,
            }}
            className="p-6 flex flex-col items-center justify-center relative"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="max-h-full max-w-full rounded-2xl bg-[#040816] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]"
              />
            </div>

            <div className="flex items-center justify-center gap-6 border-t border-white/10 pt-3 w-full text-xs nh-font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Pointcloud</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
                <span className="text-slate-300">3D Bounding Boxes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Host Vehicle</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sensor Parameters & Hardware Array (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SENSOR REDUNDANCY ARRAY",
              icon: <Cpu size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              {sensorArray.map((sensor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#060e22] border border-cyan-500/20 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{sensor.name}</span>
                    <NeonHorizonBadge variant="emerald" size="xs">
                      {sensor.status}
                    </NeonHorizonBadge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] nh-font-mono text-slate-400">
                    <span>FOV: {sensor.fov}</span>
                    <span className="text-cyan-300">Latency: {sensor.latency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <NeonHorizonSlider
                label="LIDAR SCAN RANGE"
                value={lidarRange}
                min={100}
                max={400}
                unit="m"
                onChange={setLidarRange}
                color="cyan"
              />

              <NeonHorizonToggle
                label="AI REAL-TIME OBJECT BOUNDING CLASSIFIER"
                description="Neural network detects vehicles, track apex markers, and pedestrian obstacles"
                checked={objectTracking}
                onChange={setObjectTracking}
                color="cyan"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
