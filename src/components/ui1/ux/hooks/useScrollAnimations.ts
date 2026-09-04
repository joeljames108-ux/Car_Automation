import { useRef, useState, useEffect, useCallback, RefObject } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  opts: { threshold?: number; rootMargin?: string; once?: boolean } = {}
) {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = opts;
  const ref = useRef<T>(null) as RefObject<T>;
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      setIsVisible(e.isIntersecting);
      if (e.isIntersecting) setHasEntered(true);
    }, { threshold, rootMargin });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return { ref, isVisible, hasEntered };
}

export function useScrollProgress(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => { const m = document.documentElement.scrollHeight - window.innerHeight; setP(m > 0 ? Math.min(1, Math.max(0, window.scrollY / m)) : 0); };
    window.addEventListener("scroll", h, { passive: true }); h();
    return () => window.removeEventListener("scroll", h);
  }, []);
  return p;
}

export function useMousePosition() {
  const [pos, setPos] = useState({x:0,y:0,cx:0,cy:0});
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({x:e.clientX/window.innerWidth,y:e.clientY/window.innerHeight,cx:e.clientX,cy:e.clientY});
    window.addEventListener("mousemove", h, {passive:true});
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

export function useMediaQuery(q: string): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q); setM(mq.matches);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [q]);
  return m;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

export function useThrottle<T>(value: T, limit: number): T {
  const [t, setT] = useState(value); const lr = useRef(Date.now());
  useEffect(() => {
    const h = setTimeout(() => { if (Date.now() - lr.current >= limit) { setT(value); lr.current = Date.now(); } }, limit - (Date.now() - lr.current));
    return () => clearTimeout(h);
  }, [value, limit]);
  return t;
}

export function useLocalStorage<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [s, setS] = useState<T>(() => { try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : init; } catch { return init; } });
  const set = useCallback((v: T | ((p: T) => T)) => {
    setS(prev => { const val = v instanceof Function ? v(prev) : v; localStorage.setItem(key, JSON.stringify(val)); return val; });
  }, [key]);
  return [s, set];
}

export function useClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const l = (e: MouseEvent | TouchEvent) => { if (!ref.current || ref.current.contains(e.target as Node)) return; handler(); };
    document.addEventListener("mousedown", l); document.addEventListener("touchstart", l);
    return () => { document.removeEventListener("mousedown", l); document.removeEventListener("touchstart", l); };
  }, [ref, handler]);
}

export function useKeyPress(key: string): boolean {
  const [p, setP] = useState(false);
  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.key === key) setP(true); };
    const u = (e: KeyboardEvent) => { if (e.key === key) setP(false); };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, [key]);
  return p;
}

export function useNumberAnimation(target: number, dur: number = 600) {
  const [c, setC] = useState(0);
  useEffect(() => {
    const s = performance.now(); const from = c; let r: number;
    const a = (n: number) => { const p = Math.min((n-s)/dur,1); const e = 1-Math.pow(1-p,3); setC(from+(target-from)*e); if(p<1) r=requestAnimationFrame(a); };
    r = requestAnimationFrame(a); return () => cancelAnimationFrame(r);
  }, [target, dur]);
  return c;
}

export function useResizeObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w:0,h:0});
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new ResizeObserver(([e]) => { const {width:w,height:h}=e.contentRect; setSize({w:Math.round(w),h:Math.round(h)}); });
    o.observe(el); return () => o.disconnect();
  }, []);
  return { ref, ...size };
}

export function useLocalStorage_Boolean(key: string, init: boolean) {
  return useLocalStorage(key, init);
}