import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Navigation, Radar, Compass, Zap, ArrowRight } from "lucide-react";
import { playSubsystemEngageSound } from "../interactive/NeonHorizonSoundEngine";

export interface GlobeTabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  lat: number;
  lng: number;
  hue?: number;
  description?: string;
  cardinal?: string;
  side?: "top" | "bottom" | "left" | "right" | "top-left" | "top-right";
}

interface NeonHiggsfieldGlobeProps {
  tabs: GlobeTabDef[];
  activeId: string;
  onSelect: (id: string) => void;
  onArrive?: (id: string) => void;
}

const DEG = Math.PI / 180;

function project(latDeg: number, lngDeg: number, rx: number, ry: number) {
  const p = latDeg * DEG;
  const l = lngDeg * DEG;
  const x0 = Math.cos(p) * Math.sin(l);
  const y0 = Math.sin(p);
  const z0 = Math.cos(p) * Math.cos(l);
  const xr = x0 * Math.cos(ry) + z0 * Math.sin(ry);
  const zr = -x0 * Math.sin(ry) + z0 * Math.cos(ry);
  const yr = y0 * Math.cos(rx) - zr * Math.sin(rx);
  const zfin = y0 * Math.sin(rx) + zr * Math.cos(rx);
  return { x: xr, y: yr, z: zfin };
}

function shortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function angularDistanceDeg(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const p1 = a.lat * DEG;
  const l1 = a.lng * DEG;
  const p2 = b.lat * DEG;
  const l2 = b.lng * DEG;
  const c =
    Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(l1 - l2);
  return Math.acos(clamp(c, -1, 1)) / DEG;
}

interface Star {
  x: number;
  y: number;
  r: number;
  spd: number;
  ph: number;
}

interface Ripple {
  t0: number;
  sx: number;
  sy: number;
  hue: number;
}

interface Meteor {
  active: boolean;
  x: number;
  y: number;
  dx: number;
  dy: number;
  t0: number;
}

export function NeonHiggsfieldGlobe({ tabs, activeId, onSelect, onArrive }: NeonHiggsfieldGlobeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const readoutRef = useRef<HTMLSpanElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  const orbit = useRef({ rx: 0, ry: 0, trx: 0, try_: 0, booted: false });
  const sizeRef = useRef({ w: 0, h: 0 });
  const drag = useRef({ on: false, x: 0, y: 0, moved: false });
  const lastInteract = useRef(performance.now());
  const lastSelect = useRef(performance.now());
  const arrivedLatch = useRef(false);
  const hueCur = useRef(200);
  const ripples = useRef<Ripple[]>([]);
  const meteor = useRef<Meteor>({ active: false, x: 0, y: 0, dx: 0, dy: 0, t0: 0 });
  const stars = useRef<Star[]>([]);
  const isRotatingFast = useRef(false);

  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;

  const angleOf = useCallback(
    (id: string) => {
      const t = tabs.find((x) => x.id === id);
      return { lat: t?.lat ?? 0, lng: t?.lng ?? 0 };
    },
    [tabs]
  );

  useEffect(() => {
    const a = angleOf(activeId);
    const st = orbit.current;
    st.trx = a.lat;
    st.try_ = -a.lng;
    isRotatingFast.current = true;
    if (!st.booted) {
      st.rx = a.lat;
      st.ry = -a.lng;
      st.booted = true;
      hueCur.current = tabs.find((x) => x.id === activeId)?.hue ?? 200;
    }
    arrivedLatch.current = false;
    lastInteract.current = performance.now();
    lastSelect.current = performance.now();
  }, [activeId, angleOf]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.current.length === 0) {
        stars.current = Array.from({ length: 140 }, (_, i) => ({
          x: Math.random(),
          y: Math.random(),
          r: 0.35 + Math.random() * 1.25,
          spd: 0.0006 + Math.random() * 0.0022,
          ph: i * 1.7,
        }));
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let px = 0;
    let py = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag.current = { on: true, x: e.clientX, y: e.clientY, moved: false };
      px = e.clientX;
      py = e.clientY;
      lastInteract.current = performance.now();
      wrap.setAttribute("data-dragging", "true");
      wrap.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const st = orbit.current;
      st.try_ += (e.clientX - px) * 0.35;
      st.trx = clamp(st.trx - (e.clientY - py) * 0.28, -82, 82);
      if (Math.abs(e.clientX - drag.current.x) > 4 || Math.abs(e.clientY - drag.current.y) > 4)
        drag.current.moved = true;
      px = e.clientX;
      py = e.clientY;
      lastInteract.current = performance.now();
    };
    const up = (e: PointerEvent) => {
      if (!drag.current.on) return;
      drag.current.on = false;
      wrap.removeAttribute("data-dragging");
      wrap.releasePointerCapture?.(e.pointerId);
      if (drag.current.moved) {
        const st = orbit.current;
        let best: string | null = null;
        let bestScore = Infinity;
        for (const t of tabsRef.current) {
          const score =
            Math.abs(shortestAngleDelta(st.try_, -t.lng)) + Math.abs(st.trx - t.lat) * 0.85;
          if (score < bestScore) {
            bestScore = score;
            best = t.id;
          }
        }
        if (best && best !== activeRef.current) onSelect(best);
      }
    };

    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    return () => {
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
    };
  }, [onSelect]);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const st = orbit.current;

    const frame = () => {
      t += 16.7;
      const k = drag.current.on ? 0.28 : isRotatingFast.current ? 0.088 : 0.065;
      const dRy = shortestAngleDelta(st.ry, st.try_);
      const dRx = st.trx - st.rx;
      st.ry += dRy * k;
      st.rx += dRx * k;

      const idleMs = performance.now() - lastInteract.current;
      const sinceSelectMs = performance.now() - lastSelect.current;
      if (!drag.current.on && idleMs > 7000 && sinceSelectMs > 3000) {
        st.try_ -= 0.06;
      }

      const bobX = drag.current.on ? 0 : Math.sin(t * 0.0011) * 1.5;
      const bobY = drag.current.on ? 0 : Math.sin(t * 0.0007) * 1.2;
      const rx = st.rx + bobX;
      const ry = st.ry + bobY;

      const activeTab = tabsRef.current.find((x) => x.id === activeRef.current);
      const targetHue = activeTab?.hue ?? 200;
      hueCur.current += shortestAngleDelta(hueCur.current, targetHue) * 0.07;
      const hue = hueCur.current;

      const remAng = Math.abs(dRy) + Math.abs(dRx);
      const arrived = remAng < 1.8 && !drag.current.on;
      if (arrived) {
        isRotatingFast.current = false;
      }
      if (arrived && !arrivedLatch.current) {
        arrivedLatch.current = true;
        lastSelect.current = performance.now();
        const a = angleOf(activeRef.current);
        const cw0 = sizeRef.current.w / 2;
        const ch0 = sizeRef.current.h / 2;
        const RR0 = Math.min(sizeRef.current.w, sizeRef.current.h) / 2 - 28;
        const p3 = project(a.lat, a.lng, rx, ry);
        ripples.current.push({ t0: t, sx: cw0 + p3.x * RR0, sy: ch0 - p3.y * RR0, hue });
        arriveRef.current?.(activeRef.current);
      }

      const { w, h } = sizeRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx && w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) / 2 - 28;

        // ── 1. Starfield background ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * 0.00004) * 0.12);
        for (let i = 0; i < stars.current.length; i++) {
          const s = stars.current[i];
          const tw = 0.25 + 0.35 * Math.abs(Math.sin(t * s.spd + s.ph));
          ctx.fillStyle = `rgba(191,219,254,${tw.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc((s.x - 0.5) * w, (s.y - 0.5) * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ── 2. Meteor Shooting Stars ──
        if (!meteor.current.active && Math.random() < 0.004) {
          const fromLeft = Math.random() > 0.5;
          meteor.current = {
            active: true,
            x: fromLeft ? -30 : w + 30,
            y: Math.random() * h * 0.5,
            dx: (fromLeft ? 1 : -1) * (4.8 + Math.random() * 3),
            dy: 1.5 + Math.random() * 1.8,
            t0: t,
          };
        }
        const m = meteor.current;
        if (m.active) {
          const age = t - m.t0;
          m.x += m.dx;
          m.y += m.dy;
          const life = 1100;
          if (age > life || m.x < -60 || m.x > w + 60 || m.y > h + 40) {
            m.active = false;
          } else {
            const fade = 1 - age / life;
            const tailX = m.x - m.dx * 15;
            const tailY = m.y - m.dy * 15;
            const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            grad.addColorStop(0, `rgba(224,242,254,${(0.9 * fade).toFixed(3)})`);
            grad.addColorStop(1, "rgba(224,242,254,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
          }
        }

        // ── 3. Atmospheric Outer Glow ──
        const atmosGrad = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.25);
        atmosGrad.addColorStop(0, `hsla(${hue}, 95%, 65%, 0.12)`);
        atmosGrad.addColorStop(0.5, `hsla(${hue}, 90%, 55%, 0.05)`);
        atmosGrad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = atmosGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
        ctx.fill();

        // ── 4. 3D Wireframe Spherical Grid & Geodesic Arcs ──
        ctx.lineWidth = 1;
        const drawPolyline = (
          pts: { sx: number; sy: number; z: number }[],
          baseAlpha: number,
          isEquator = false
        ) => {
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const zm = (a.z + b.z) / 2;
            if (zm <= 0.02) continue;
            ctx.strokeStyle = isEquator
              ? `hsla(${(hue + 20) % 360}, 95%, 75%, 1)`
              : `hsla(${hue}, 92%, 66%, 1)`;
            ctx.globalAlpha = baseAlpha * (0.22 + zm * 0.78);
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        };

        const sample = (
          latFn: (i: number) => number,
          lngFn: (i: number) => number,
          steps: number
        ) => {
          const out: { sx: number; sy: number; z: number }[] = [];
          for (let i = 0; i <= steps; i++) {
            const p3 = project(latFn(i), lngFn(i), rx, ry);
            out.push({ sx: cx + p3.x * R, sy: cy - p3.y * R, z: p3.z });
          }
          return out;
        };

        // Latitudes (Parallels)
        for (let lat = -60; lat <= 60; lat += 20) {
          drawPolyline(sample(() => lat, (i) => -180 + (i * 360) / 48, 48), lat === 0 ? 0.35 : 0.09, lat === 0);
        }
        // Longitudes (Meridians)
        for (let lng = -180; lng < 180; lng += 30) {
          drawPolyline(sample((i) => -86 + (i * 172) / 44, () => lng, 44), lng % 90 === 0 ? 0.18 : 0.08);
        }

        // ── 5. Great-Circle Pathways Between All Stations ──
        const allTabs = tabsRef.current;
        for (let i = 0; i < allTabs.length; i++) {
          for (let j = i + 1; j < allTabs.length; j++) {
            const tA = allTabs[i];
            const tB = allTabs[j];
            const arcSteps = 16;
            const arcPts: { sx: number; sy: number; z: number }[] = [];
            for (let s = 0; s <= arcSteps; s++) {
              const u = s / arcSteps;
              const sLat = tA.lat + (tB.lat - tA.lat) * u;
              const sLng = tA.lng + (tB.lng - tA.lng) * u;
              const p3 = project(sLat, sLng, rx, ry);
              arcPts.push({ sx: cx + p3.x * R, sy: cy - p3.y * R, z: p3.z });
            }
            ctx.setLineDash([2, 6]);
            drawPolyline(arcPts, 0.12);
            ctx.setLineDash([]);
          }
        }

        // ── 6. Outer Horizon Limb Ring ──
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = `hsl(${hue}, 92%, 70%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // ── 7. Satellite & Equatorial Orbit Ring ──
        const orbA = t * 0.0009 + 2.1;
        const orbRx = R * 1.28;
        const orbRy = R * 0.36;
        const orbCy = cy - R * 0.12;
        ctx.strokeStyle = `hsla(${hue}, 60%, 75%, 0.14)`;
        ctx.setLineDash([2, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, orbCy, orbRx, orbRy, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const satX = cx + Math.cos(orbA) * orbRx;
        const satY = orbCy + Math.sin(orbA) * orbRy;
        const sg = ctx.createRadialGradient(satX, satY, 0, satX, satY, 8);
        sg.addColorStop(0, "rgba(226,232,240,0.95)");
        sg.addColorStop(1, "rgba(226,232,240,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(satX, satY, 8, 0, Math.PI * 2);
        ctx.fill();

        // ── 8. Dynamic Radar Scan Sweep ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.0005);
        ctx.strokeStyle = `hsla(${(hue + 45) % 360}, 92%, 74%, 0.42)`;
        ctx.setLineDash([3, 10]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, R + 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.setLineDash([]);

        // ── 9. Station Beacons & Laser Light Pillars ──
        for (const tab of tabsRef.current) {
          const p3 = project(tab.lat, tab.lng, rx, ry);
          if (p3.z < -0.25) continue;
          const isActive = tab.id === activeRef.current;
          const isHovered = tab.id === hoveredTabId;
          const nHue = tab.hue ?? hue;
          const sx = cx + p3.x * R;
          const sy = cy - p3.y * R;

          // Vertical laser pillar shooting outward along surface normal
          if (p3.z > 0.1) {
            const beamLen = (isActive ? 42 : 22) * (0.8 + 0.2 * p3.z);
            const bx = sx + p3.x * beamLen;
            const by = sy - p3.y * beamLen;
            const beamGrad = ctx.createLinearGradient(sx, sy, bx, by);
            beamGrad.addColorStop(0, `hsla(${nHue}, 100%, 80%, ${(0.95 * p3.z).toFixed(2)})`);
            beamGrad.addColorStop(1, `hsla(${nHue}, 100%, 80%, 0)`);
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = isActive ? 2.5 : 1.2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }

          // Concentric core node
          const rr = (isActive ? 5.5 : isHovered ? 4.8 : 3.4) * (0.72 + 0.28 * (p3.z + 1));
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr * 3.8);
          grad.addColorStop(0, `hsla(${nHue}, 95%, 72%, ${(0.9 * Math.max(0, p3.z)).toFixed(3)})`);
          grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, rr * 3.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isActive ? `hsl(${nHue}, 100%, 90%)` : `hsl(${nHue}, 85%, 78%)`;
          ctx.globalAlpha = Math.max(0.18, p3.z);
          ctx.beginPath();
          ctx.arc(sx, sy, rr, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Reticle square lock if active
          if (isActive && p3.z > 0.25) {
            const bSize = 14 + Math.sin(t * 0.005) * 1.5;
            ctx.strokeStyle = `hsla(${nHue}, 100%, 85%, ${(0.85 * p3.z).toFixed(2)})`;
            ctx.lineWidth = 1.2;
            ctx.strokeRect(sx - bSize / 2, sy - bSize / 2, bSize, bSize);
          }
        }

        // ── 10. Arrival Shockwaves ──
        ripples.current = ripples.current.filter((rp) => t - rp.t0 < 750);
        for (const rp of ripples.current) {
          const age = (t - rp.t0) / 750;
          ctx.strokeStyle = `hsla(${rp.hue}, 95%, 75%, ${(0.6 * (1 - age)).toFixed(3)})`;
          ctx.lineWidth = 2.4 * (1 - age) + 0.6;
          ctx.beginPath();
          ctx.arc(rp.sx, rp.sy, 6 + age * 54, 0, Math.PI * 2);
          ctx.stroke();
        }

        // ── 11. Center Holographic Crosshairs ──
        ctx.strokeStyle = "rgba(148,197,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R - 20, cy);
        ctx.lineTo(cx + R + 20, cy);
        ctx.moveTo(cx, cy - R - 20);
        ctx.lineTo(cx, cy + R + 20);
        ctx.stroke();
      }

      // ── DOM Markers on Globe Surface ──
      const cw = sizeRef.current.w / 2;
      const ch = sizeRef.current.h / 2;
      const RR = Math.min(sizeRef.current.w, sizeRef.current.h) / 2 - 28;
      markerRefs.current.forEach((el, id) => {
        const tab = tabsRef.current.find((x) => x.id === id);
        if (!el || !tab || RR <= 0) return;
        const p3 = project(tab.lat, tab.lng, rx, ry);
        const front = p3.z > 0.06;
        el.style.transform = `translate(-50%, -130%) translate(${cw + p3.x * RR}px, ${
          ch - p3.y * RR
        }px) scale(${0.78 + 0.28 * ((p3.z + 1) / 2)})`;
        el.style.opacity = `${Math.max(0, Math.min(1, (p3.z - 0.02) / 0.45))}`;
        el.style.zIndex = `${Math.round((p3.z + 1) * 60)}`;
        el.style.pointerEvents = front ? "auto" : "none";
      });

      if (readoutRef.current) {
        const lon = (((-ry % 360) + 540) % 360) - 180;
        readoutRef.current.textContent = `LAT ${(((rx % 360) + 540) % 360 - 180).toFixed(1)}°  LON ${lon.toFixed(1)}°`;
      }
      if (statusRef.current) {
        statusRef.current.textContent = arrived ? "TARGET LOCKED" : "ORBITING · EN ROUTE";
        statusRef.current.style.color = arrived
          ? `hsl(${hue}, 95%, 76%)`
          : "rgba(148,197,255,0.65)";
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [angleOf]);

  const handleSelect = (id: string) => {
    if (id !== activeId) {
      playSubsystemEngageSound();
      lastInteract.current = performance.now();
    }
    onSelect(id);
  };

  const cornerCls =
    "absolute font-mono text-[9px] tracking-[0.18em] uppercase select-none pointer-events-none";

  const sortedMarkers = useMemo(() => [...tabs].sort((a, b) => a.id.localeCompare(b.id)), [tabs]);

  return (
    <div className="relative w-full flex flex-col items-center">
      <style>{`
        @keyframes nhGlobeContentIn {
          from { opacity: 0; transform: translateY(18px) scale(.98); filter: blur(8px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        .nh-globe-content { animation: nhGlobeContentIn .55s cubic-bezier(.22,.9,.28,1) var(--nh-transit, 340ms) both; }
        @keyframes nhNodePing {
          0% { transform: scale(.6); opacity: .95; }
          80%, 100% { transform: scale(2.8); opacity: 0; }
        }
        .nh-node-ping { animation: nhNodePing 1.8s cubic-bezier(.2,.6,.35,1) infinite; }
        @keyframes nhTransitSweep {
          0% { transform: scaleX(.02); opacity: .95; }
          70% { opacity: .75; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        .nh-transit-bar {
          position: absolute; top: -12px; left: 0; right: 0; height: 3px; border-radius: 2px;
          transform-origin: left; animation: nhTransitSweep 1s cubic-bezier(.3,.7,.3,1) both;
        }
        [data-dragging] { cursor: grabbing !important; }
        @keyframes nhStationPulse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .nh-station-card { animation: nhStationPulse 4s ease-in-out infinite; }
      `}</style>

      {/* ── Outer Orbital Tabs Placed on Each Side of the Globe ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          const isHovered = t.id === hoveredTabId;
          const nHue = t.hue ?? 200;

          return (
            <button
              key={`side-card-${t.id}`}
              onClick={() => handleSelect(t.id)}
              onPointerEnter={() => setHoveredTabId(t.id)}
              onPointerLeave={() => setHoveredTabId(null)}
              className={`nh-station-card relative p-2.5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                isActive
                  ? "bg-amber-900/40 shadow-xl"
                  : "bg-amber-950/60 hover:bg-amber-900/40 border-white/10 hover:border-white/20"
              }`}
              style={{
                borderColor: isActive ? `hsl(${nHue} 92% 70% / 0.7)` : undefined,
                boxShadow: isActive ? `0 0 24px hsl(${nHue} 95% 65% / 0.25), inset 0 1px 0 rgba(255,255,255,0.15)` : undefined,
              }}
            >
              {/* Active / Hover Background Gradient Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, hsl(${nHue} 90% 60% / 0.15), transparent 70%)`,
                }}
              />

              {/* Top Row: Icon + Cardinal Bearing */}
              <div className="flex items-center justify-between mb-1.5 z-10">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: isActive ? `hsl(${nHue} 95% 65% / 0.25)` : "rgba(255,255,255,0.06)",
                    color: isActive ? `hsl(${nHue} 95% 75%)` : `hsl(${nHue} 85% 70%)`,
                    border: `1px solid hsl(${nHue} 90% 70% / ${isActive ? 0.6 : 0.2})`,
                  }}
                >
                  {t.icon}
                </div>

                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-200/60 font-semibold flex items-center gap-1">
                  <Compass size={10} className={isActive ? "text-sky-400 animate-spin" : "text-amber-300/50"} />
                  {t.cardinal || `${t.lat >= 0 ? "+" : ""}${t.lat}°, ${t.lng >= 0 ? "+" : ""}${t.lng}°`}
                </span>
              </div>

              {/* Label & Description */}
              <div className="z-10">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold tracking-wide ${isActive ? "text-white" : "text-amber-100/80 group-hover:text-white"}`}>
                    {t.label}
                  </span>
                  {isActive && <Zap size={11} className="text-amber-400 fill-amber-400 animate-pulse" />}
                </div>
                {t.description && (
                  <p className="text-[10px] text-amber-200/60 line-clamp-1 mt-0.5 font-sans">
                    {t.description}
                  </p>
                )}
              </div>

              {/* Status Footer Pill */}
              <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between z-10">
                <span
                  className="text-[9px] font-mono tracking-widest uppercase font-bold"
                  style={{
                    color: isActive ? `hsl(${nHue} 95% 75%)` : "#64748b",
                  }}
                >
                  {isActive ? "● LOCKED · ACTIVE" : isHovered ? "FLY TO STATION →" : "STANDBY"}
                </span>

                <ArrowRight size={10} className={`transition-transform duration-200 ${isActive ? "text-sky-400 translate-x-0.5" : "text-amber-400 group-hover:text-amber-100/80 group-hover:translate-x-1"}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Central 3D Canvas Globe Container ── */}
      <div
        ref={wrapRef}
        className="relative w-full aspect-square max-h-[460px] mx-auto overflow-hidden rounded-2xl border border-white/10 bg-amber-950/80 shadow-2xl cursor-grab touch-none select-none"
        role="tablist"
        aria-label="Higgsfield suite orbital navigation"
      >
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />

        {/* HUD Telemetry Overlays */}
        <span className={`${cornerCls} top-2.5 left-3.5 flex items-center gap-1.5 text-sky-300/60`}>
          <Navigation size={10} /> ORBITAL 3D NAV · DRAG TO SPIN
        </span>
        <span ref={readoutRef} className={`${cornerCls} bottom-2.5 left-3.5 text-sky-300/60`} />
        <span
          className={`${cornerCls} bottom-2.5 right-3.5 flex items-center gap-1.5`}
          style={{ color: "rgba(148,197,255,0.65)" }}
        >
          <Radar size={10} />
          <span ref={statusRef}>TARGET LOCKED</span>
        </span>
        <span className={`${cornerCls} top-2.5 right-3.5 flex items-center gap-1.5 text-sky-300/60`}>
          <Crosshair size={10} />
        </span>

        {/* 3D Pinned Waypoint Markers */}
        {sortedMarkers.map((tab) => {
          const isActive = tab.id === activeId;
          const nHue = tab.hue ?? 200;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) markerRefs.current.set(tab.id, el);
                else markerRefs.current.delete(tab.id);
              }}
              onClick={() => handleSelect(tab.id)}
              onPointerEnter={() => setHoveredTabId(tab.id)}
              onPointerLeave={() => setHoveredTabId(null)}
              role="tab"
              aria-selected={isActive}
              className={`absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-200 will-change-transform ${
                isActive ? "text-white scale-105" : "text-amber-100/80 hover:text-white hover:scale-105"
              }`}
              style={
                isActive
                  ? {
                      borderColor: `hsl(${nHue} 90% 72% / 0.8)`,
                      background: `hsl(${nHue} 90% 60% / 0.18)`,
                      boxShadow: `0 0 20px hsl(${nHue} 90% 65% / 0.4)`,
                    }
                  : { borderColor: "rgba(255,255,255,0.18)", background: "rgba(16,26,44,0.88)" }
              }
            >
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span
                    className="absolute w-2.5 h-2.5 rounded-full nh-node-ping"
                    style={{ background: `hsl(${nHue} 90% 70% / 0.75)` }}
                  />
                )}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isActive ? `hsl(${nHue} 95% 80%)` : `hsl(${nHue} 75% 68% / 0.85)`,
                    boxShadow: isActive ? `0 0 10px hsl(${nHue} 95% 72%)` : undefined,
                  }}
                />
              </span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase font-mono">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
