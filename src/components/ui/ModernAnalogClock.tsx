import { useState, useEffect, useRef, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModernAnalogClockProps {
  size?: number;
  variant?: "wall-light" | "glass-dark" | "minimal-cyan";
  showLiveBadge?: boolean;
  label?: string;
  enable3DMode?: boolean;
}

function ModernAnalogClockComponent({
  size = 110,
  variant = "wall-light",
  showLiveBadge = true,
  label = "STUDIO CLOCK",
  enable3DMode = true,
}: ModernAnalogClockProps) {
  const [time, setTime] = useState(new Date());
  const [is3D, setIs3D] = useState(enable3DMode);

  const mountRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<THREE.Mesh | null>(null);
  const minHandRef = useRef<THREE.Mesh | null>(null);
  const secHandRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // 3D Three.js Luxury Volumetric Chronograph Clock Scene Setup
  useEffect(() => {
    if (!is3D || !mountRef.current) return;
    const container = mountRef.current;
    const s = size;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(s, s);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x007aff, 2.0, 5);
    blueLight.position.set(-2, -2, 2);
    scene.add(blueLight);

    // 1. 3D Bezel Casing Ring (Titanium/Chrome)
    const bezelGeom = new THREE.TorusGeometry(1.0, 0.08, 16, 48);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const bezel = new THREE.Mesh(bezelGeom, bezelMat);
    scene.add(bezel);

    // 2. 3D Dial Face Plate
    const dialGeom = new THREE.CylinderGeometry(0.98, 0.98, 0.04, 48);
    dialGeom.rotateX(Math.PI / 2);
    const dialMat = new THREE.MeshStandardMaterial({
      color: variant === "wall-light" ? 0xf8fafc : 0x0f172a,
      metalness: 0.3,
      roughness: 0.3,
    });
    const dial = new THREE.Mesh(dialGeom, dialMat);
    dial.position.z = -0.02;
    scene.add(dial);

    // 3. 12 Depth Hour Tick Markers
    const ticksGroup = new THREE.Group();
    const tickGeom = new THREE.BoxGeometry(0.04, 0.16, 0.04);
    const tickMat = new THREE.MeshStandardMaterial({ color: 0x007aff, metalness: 0.8, roughness: 0.2 });

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const tick = new THREE.Mesh(tickGeom, tickMat);
      tick.position.set(Math.sin(angle) * 0.82, Math.cos(angle) * 0.82, 0.02);
      tick.rotation.z = -angle;
      ticksGroup.add(tick);
    }
    scene.add(ticksGroup);

    // 4. 3D Hour Hand
    const hourHandGeom = new THREE.BoxGeometry(0.06, 0.45, 0.03);
    hourHandGeom.translate(0, 0.2, 0);
    const hourHandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const hourHand = new THREE.Mesh(hourHandGeom, hourHandMat);
    hourHand.position.z = 0.04;
    scene.add(hourHand);
    hourHandRef.current = hourHand;

    // 5. 3D Minute Hand
    const minHandGeom = new THREE.BoxGeometry(0.04, 0.68, 0.03);
    minHandGeom.translate(0, 0.3, 0);
    const minHandMat = new THREE.MeshStandardMaterial({ color: 0x007aff, metalness: 0.8, roughness: 0.2 });
    const minHand = new THREE.Mesh(minHandGeom, minHandMat);
    minHand.position.z = 0.06;
    scene.add(minHand);
    minHandRef.current = minHand;

    // 6. 3D Red Sweep Second Hand
    const secHandGeom = new THREE.BoxGeometry(0.02, 0.8, 0.02);
    secHandGeom.translate(0, 0.35, 0);
    const secHandMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 });
    const secHand = new THREE.Mesh(secHandGeom, secHandMat);
    secHand.position.z = 0.08;
    scene.add(secHand);
    secHandRef.current = secHand;

    // 7. Center Pin Hub
    const pinGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16);
    pinGeom.rotateX(Math.PI / 2);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.1 });
    const pin = new THREE.Mesh(pinGeom, pinMat);
    pin.position.z = 0.06;
    scene.add(pin);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const now = new Date();
      const secs = now.getSeconds() + now.getMilliseconds() / 1000;
      const mins = now.getMinutes() + secs / 60;
      const hrs = (now.getHours() % 12) + mins / 60;

      if (secHandRef.current) secHandRef.current.rotation.z = -(secs / 60) * Math.PI * 2;
      if (minHandRef.current) minHandRef.current.rotation.z = -(mins / 60) * Math.PI * 2;
      if (hourHandRef.current) hourHandRef.current.rotation.z = -(hrs / 12) * Math.PI * 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [is3D, size, variant]);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours + minutes / 60) / 12) * 360;

  const isLight = variant === "wall-light";
  const bgColor = isLight
    ? "radial-gradient(circle, #ffffff 0%, #e2e8f0 100%)"
    : variant === "glass-dark"
    ? "rgba(15, 23, 42, 0.85)"
    : "rgba(11, 19, 36, 0.90)";

  const borderColor = isLight ? "rgba(255, 255, 255, 0.80)" : "rgba(56, 189, 248, 0.35)";
  const tickColor = isLight ? "#334155" : "#94a3b8";
  const hourHandColor = isLight ? "#0f172a" : "#f8fafc";
  const minHandColor = isLight ? "#1e293b" : "#fbbf24";
  const secHandColor = "#ef4444";

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        position: "relative",
      }}
    >
      {/* Live Badge & 3D Mode Toggle if enabled */}
      {showLiveBadge && (
        <div
          style={{
            position: "absolute",
            top: -6,
            left: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255, 252, 245, 0.90)",
            backdropFilter: "blur(12px) saturate(210%)",
            WebkitBackdropFilter: "blur(12px) saturate(210%)",
            border: "1px solid rgba(0, 122, 255, 0.35)",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 800,
            color: "#1c1c1e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              boxShadow: "0 0 8px #ef4444",
              display: "inline-block",
              animation: "pulse 1.5s infinite",
            }}
          />
          <span style={{ letterSpacing: "0.05em" }}>LIVE</span>
          <button
            onClick={() => setIs3D(!is3D)}
            style={{
              marginLeft: 4,
              fontSize: 8,
              fontFamily: "monospace",
              background: is3D ? "#007aff" : "#cbd5e1",
              color: is3D ? "#fff" : "#334155",
              border: "none",
              borderRadius: 4,
              padding: "1px 4px",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {is3D ? "3D" : "2D"}
          </button>
        </div>
      )}

      {/* Modern Analog Clock Frame (3D WebGL vs 2D SVG View) */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: is3D ? "transparent" : bgColor,
          border: is3D ? "none" : `2px solid ${borderColor}`,
          boxShadow: isLight && !is3D
            ? "0 12px 28px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.90), inset 0 -2px 6px rgba(0, 0, 0, 0.15)"
            : !is3D
            ? "0 12px 32px rgba(0, 0, 0, 0.50), inset 0 1px 1px rgba(255, 255, 255, 0.20)"
            : "none",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: is3D ? "none" : "blur(20px)",
          WebkitBackdropFilter: is3D ? "none" : "blur(20px)",
        }}
      >
        {is3D ? (
          <div ref={mountRef} style={{ width: size, height: size, cursor: "grab" }} />
        ) : (
          <>
            {/* Clock Dial Markings */}
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
              <circle cx="50" cy="50" r="48" fill="none" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} strokeWidth="1" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 50 + 38 * Math.sin(angle);
                const y1 = 50 - 38 * Math.cos(angle);
                const x2 = 50 + 44 * Math.sin(angle);
                const y2 = 50 - 44 * Math.cos(angle);
                const isQuarter = i % 3 === 0;

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={tickColor}
                    strokeWidth={isQuarter ? 2.5 : 1.2}
                    strokeLinecap="round"
                    opacity={isQuarter ? 0.95 : 0.6}
                  />
                );
              })}

              {Array.from({ length: 60 }).map((_, i) => {
                if (i % 5 === 0) return null;
                const angle = (i * 6 * Math.PI) / 180;
                const cx = 50 + 42 * Math.sin(angle);
                const cy = 50 - 42 * Math.cos(angle);
                return <circle key={i} cx={cx} cy={cy} r="0.6" fill={tickColor} opacity="0.4" />;
              })}
            </svg>

            {/* Hour Hand */}
            <div
              style={{
                position: "absolute",
                width: Math.max(3, size * 0.045),
                height: size * 0.28,
                backgroundColor: hourHandColor,
                borderRadius: 4,
                top: `calc(50% - ${size * 0.28}px)`,
                left: `calc(50% - ${Math.max(3, size * 0.045) / 2}px)`,
                transformOrigin: "bottom center",
                transform: `rotate(${hourDeg}deg)`,
                transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                zIndex: 3,
              }}
            />

            {/* Minute Hand */}
            <div
              style={{
                position: "absolute",
                width: Math.max(2, size * 0.032),
                height: size * 0.38,
                backgroundColor: minHandColor,
                borderRadius: 3,
                top: `calc(50% - ${size * 0.38}px)`,
                left: `calc(50% - ${Math.max(2, size * 0.032) / 2}px)`,
                transformOrigin: "bottom center",
                transform: `rotate(${minuteDeg}deg)`,
                transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
                zIndex: 4,
              }}
            />

            {/* Second Hand (Red Sweep) */}
            <div
              style={{
                position: "absolute",
                width: 1.5,
                height: size * 0.44,
                backgroundColor: secHandColor,
                borderRadius: 1,
                top: `calc(50% - ${size * 0.44}px)`,
                left: "calc(50% - 0.75px)",
                transformOrigin: "bottom center",
                transform: `rotate(${secondDeg}deg)`,
                transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
                zIndex: 5,
              }}
            />

            {/* Center Cap Pin */}
            <div
              style={{
                width: Math.max(6, size * 0.08),
                height: Math.max(6, size * 0.08),
                borderRadius: "50%",
                backgroundColor: isLight ? "#0f172a" : "#ffffff",
                border: `2px solid ${secHandColor}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                zIndex: 6,
              }}
            />
          </>
        )}
      </div>

      {label && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export const ModernAnalogClock = memo(ModernAnalogClockComponent);

