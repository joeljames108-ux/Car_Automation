import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Crosshair, Navigation, Radar } from "lucide-react";
import { playSubsystemEngageSound } from "../interactive/NeonHorizonSoundEngine";

export interface GlobeTabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  lat: number;
  lng: number;
  /** accent hue (0-360) that re-tints the globe while this node is locked */
  hue?: number;
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
        stars.current = Array.from({ length: 110 }, (_, i) => ({
          x: Math.random(),
          y: Math.random(),
          r: 0.4 + Math.random() * 1.1,
          spd: 0.0008 + Math.random() * 0.002,
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
      st.try_ += (e.clientX - px) * 0.33;
      st.trx = clamp(st.trx - (e.clientY - py) * 0.27, -82, 82);
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
      const k = drag.current.on ? 0.28 : 0.075;
      st.ry += shortestAngleDelta(st.ry, st.try_) * k;
      st.rx += (st.trx - st.rx) * k;

      const idleMs = performance.now() - lastInteract.current;
      const sinceSelectMs = performance.now() - lastSelect.current;
      if (!drag.current.on && idleMs > 6500 && sinceSelectMs > 2600) {
        st.try_ -= 0.05;
      }

      const bobX = drag.current.on ? 0 : Math.sin(t * 0.0011) * 1.7;
      const bobY = drag.current.on ? 0 : Math.sin(t * 0.0007) * 1.3;
      const rx = st.rx + bobX;
      const ry = st.ry + bobY;

      const activeTab = tabsRef.current.find((x) => x.id === activeRef.current);
      const targetHue = activeTab?.hue ?? 200;
      hueCur.current += shortestAngleDelta(hueCur.current, targetHue) * 0.06;
      const hue = hueCur.current;

      const remAng =
        Math.abs(shortestAngleDelta(st.ry, st.try_)) + Math.abs(st.trx - st.rx);
      const arrived = remAng < 2.2 && !drag.current.on;
      if (arrived && !arrivedLatch.current) {
        arrivedLatch.current = true;
        lastSelect.current = performance.now();
        const a = angleOf(activeRef.current);
        const cw0 = sizeRef.current.w / 2;
        const ch0 = sizeRef.current.h / 2;
        const RR0 = Math.min(sizeRef.current.w, sizeRef.current.h) / 2 - 30;
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
        const R = Math.min(w, h) / 2 - 30;

        // ── starfield ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * 0.00004) * 0.15);
        for (let i = 0; i < stars.current.length; i++) {
          const s = stars.current[i];
          const tw = 0.28 + 0.3 * Math.abs(Math.sin(t * s.spd + s.ph));
          ctx.fillStyle = `rgba(191,219,254,${tw.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc((s.x - 0.5) * w, (s.y - 0.5) * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ── shooting star ──
        if (!meteor.current.active && Math.random() < 0.0035) {
          const fromLeft = Math.random() > 0.5;
          meteor.current = {
            active: true,
            x: fromLeft ? -30 : w + 30,
            y: Math.random() * h * 0.5,
            dx: (fromLeft ? 1 : -1) * (4.5 + Math.random() * 3),
            dy: 1.4 + Math.random() * 1.6,
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
            const tailX = m.x - m.dx * 14;
            const tailY = m.y - m.dy * 14;
            const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            grad.addColorStop(0, `rgba(224,242,254,${(0.85 * fade).toFixed(3)})`);
            grad.addColorStop(1, "rgba(224,242,254,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
          }
        }

        // ── wireframe sphere ──
        ctx.lineWidth = 1;
        const drawPolyline = (
          pts: { sx: number; sy: number; z: number }[],
          baseAlpha: number
        ) => {
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const zm = (a.z + b.z) / 2;
            if (zm <= 0.02) continue;
            ctx.strokeStyle = `hsla(${hue}, 92%, 66%, 1)`;
            ctx.globalAlpha = baseAlpha * (0.25 + zm * 0.75);
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

        for (let lat = -60; lat <= 60; lat += 20) {
          drawPolyline(sample(() => lat, (i) => -180 + (i * 360) / 48, 48), lat === 0 ? 0.22 : 0.09);
        }
        for (let lng = -180; lng < 180; lng += 20) {
          drawPolyline(sample((i) => -86 + (i * 172) / 44, () => lng, 44), 0.08);
        }

        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = `hsl(${hue}, 90%, 68%)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // ── satellite ──
        const orbA = t * 0.00085 + 2.1;
        const orbRx = R * 1.26;
        const orbRy = R * 0.34;
        const orbCy = cy - R * 0.16;
        ctx.strokeStyle = `hsla(${hue}, 60%, 75%, 0.12)`;
        ctx.setLineDash([1, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, orbCy, orbRx, orbRy, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const satX = cx + Math.cos(orbA) * orbRx;
        const satY = orbCy + Math.sin(orbA) * orbRy;
        const sg = ctx.createRadialGradient(satX, satY, 0, satX, satY, 7);
        sg.addColorStop(0, "rgba(226,232,240,0.95)");
        sg.addColorStop(1, "rgba(226,232,240,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(satX, satY, 7, 0, Math.PI * 2);
        ctx.fill();

        // ── radar sweep ring ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.00045);
        ctx.strokeStyle = `hsla(${(hue + 40) % 360}, 90%, 72%, 0.38)`;
        ctx.setLineDash([3, 9]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, R + 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.setLineDash([]);

        // ── nodes ──
        for (const tab of tabsRef.current) {
          const p3 = project(tab.lat, tab.lng, rx, ry);
          if (p3.z < -0.25) continue;
          const isActive = tab.id === activeRef.current;
          const nHue = tab.hue ?? hue;
          const sx = cx + p3.x * R;
          const sy = cy - p3.y * R;
          const rr = (isActive ? 4.6 : 3) * (0.72 + 0.28 * (p3.z + 1));
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr * 3.4);
          grad.addColorStop(0, `hsla(${nHue}, 95%, 72%, ${(0.85 * Math.max(0, p3.z)).toFixed(3)})`);
          grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, rr * 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isActive ? `hsl(${nHue}, 100%, 86%)` : `hsl(${nHue}, 80%, 78%)`;
          ctx.globalAlpha = Math.max(0.15, p3.z);
          ctx.beginPath();
          ctx.arc(sx, sy, rr, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // ── arrival shockwaves ──
        ripples.current = ripples.current.filter((rp) => t - rp.t0 < 680);
        for (const rp of ripples.current) {
          const age = (t - rp.t0) / 680;
          ctx.strokeStyle = `hsla(${rp.hue}, 95%, 74%, ${(0.55 * (1 - age)).toFixed(3)})`;
          ctx.lineWidth = 2 * (1 - age) + 0.5;
          ctx.beginPath();
          ctx.arc(rp.sx, rp.sy, 6 + age * 46, 0, Math.PI * 2);
          ctx.stroke();
        }

        // ── crosshair ──
        ctx.strokeStyle = "rgba(148,197,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R - 18, cy);
        ctx.lineTo(cx + R + 18, cy);
        ctx.moveTo(cx, cy - R - 18);
        ctx.lineTo(cx, cy + R + 18);
        ctx.stroke();
      }

      // ── DOM markers ──
      const cw = sizeRef.current.w / 2;
      const ch = sizeRef.current.h / 2;
      const RR = Math.min(sizeRef.current.w, sizeRef.current.h) / 2 - 30;
      markerRefs.current.forEach((el, id) => {
        const tab = tabsRef.current.find((x) => x.id === id);
        if (!el || !tab || RR <= 0) return;
        const p3 = project(tab.lat, tab.lng, rx, ry);
        const front = p3.z > 0.08;
        el.style.transform = `translate(-50%, -130%) translate(${cw + p3.x * RR}px, ${
          ch - p3.y * RR
        }px) scale(${0.78 + 0.26 * ((p3.z + 1) / 2)})`;
        el.style.opacity = `${Math.max(0, Math.min(1, (p3.z - 0.02) / 0.45))}`;
        el.style.zIndex = `${Math.round((p3.z + 1) * 60)}`;
        el.style.pointerEvents = front ? "auto" : "none";
      });

      if (readoutRef.current) {
        const lon = (((-ry % 360) + 540) % 360) - 180;
        readoutRef.current.textContent = `LAT ${(((rx % 360) + 540) % 360 - 180).toFixed(1)}°  LON ${lon.toFixed(1)}°`;
      }
      if (statusRef.current) {
        statusRef.current.textContent = arrived ? "LOCKED" : "EN ROUTE";
        statusRef.current.style.color = arrived
          ? `hsl(${hue}, 95%, 76%)`
          : "rgba(148,197,255,0.55)";
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
    <div className="relative">
      <style>{`
        @keyframes nhGlobeContentIn {
          from { opacity: 0; transform: translateY(16px) scale(.984); filter: blur(7px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        .nh-globe-content { animation: nhGlobeContentIn .5s cubic-bezier(.22,.9,.28,1) var(--nh-transit, 340ms) both; }
        @keyframes nhNodePing {
          0% { transform: scale(.6); opacity: .9; }
          80%, 100% { transform: scale(2.6); opacity: 0; }
        }
        .nh-node-ping { animation: nhNodePing 1.8s cubic-bezier(.2,.6,.35,1) infinite; }
        @keyframes nhTransitSweep {
          0% { transform: scaleX(.02); opacity: .95; }
          70% { opacity: .65; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        .nh-transit-bar {
          position: absolute; top: -12px; left: 0; right: 0; height: 2px; border-radius: 2px;
          transform-origin: left; animation: nhTransitSweep 1s cubic-bezier(.3,.7,.3,1) both;
        }
        [data-dragging] { cursor: grabbing !important; }
      `}</style>

      <div
        ref={wrapRef}
        className="relative w-full aspect-square max-h-[520px] mx-auto overflow-hidden cursor-grab touch-none"
        role="tablist"
        aria-label="Higgsfield suite orbital navigation"
      >
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />

        <span className={`${cornerCls} top-2 left-3 flex items-center gap-1.5 text-sky-300/50`}>
          <Navigation size={9} /> ORBITAL NAV · DRAG TO SPIN
        </span>
        <span ref={readoutRef} className={`${cornerCls} bottom-2 left-3 text-sky-300/50`} />
        <span
          className={`${cornerCls} bottom-2 right-3 flex items-center gap-1.5`}
          style={{ color: "rgba(148,197,255,0.55)" }}
        >
          <Radar size={9} />
          <span ref={statusRef}>EN ROUTE</span>
        </span>
        <span className={`${cornerCls} top-2 right-3 flex items-center gap-1.5 text-sky-300/50`}>
          <Crosshair size={9} />
        </span>

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
              role="tab"
              aria-selected={isActive}
              className={`absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full border backdrop-blur-md transition-colors duration-200 will-change-transform ${
                isActive ? "text-white" : "text-slate-300 hover:text-white"
              }`}
              style={
                isActive
                  ? {
                      borderColor: `hsl(${nHue} 90% 72% / 0.65)`,
                      background: `hsl(${nHue} 90% 60% / 0.14)`,
                      boxShadow: `0 0 18px hsl(${nHue} 90% 65% / 0.3)`,
                    }
                  : { borderColor: "rgba(255,255,255,0.15)", background: "rgba(16,26,44,0.85)" }
              }
            >
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span
                    className="absolute w-2 h-2 rounded-full nh-node-ping"
                    style={{ background: `hsl(${nHue} 90% 70% / 0.7)` }}
                  />
                )}
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isActive ? `hsl(${nHue} 95% 78%)` : `hsl(${nHue} 75% 68% / 0.8)`,
                    boxShadow: isActive ? `0 0 8px hsl(${nHue} 95% 70%)` : undefined,
                  }}
                />
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
