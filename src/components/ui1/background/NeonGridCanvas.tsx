import React, { useEffect, useRef } from "react";

export const NeonGridCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let offscreenCanvas: HTMLCanvasElement | null = null;
    let offscreenCtx: CanvasRenderingContext2D | null = null;

    const createGridPattern = (w: number, h: number) => {
      offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = w;
      offscreenCanvas.height = h;
      offscreenCtx = offscreenCanvas.getContext("2d");
      if (!offscreenCtx) return;

      const gridSize = 64;
      offscreenCtx.strokeStyle = "rgba(148, 163, 184, 0.05)";
      offscreenCtx.lineWidth = 1;
      offscreenCtx.beginPath();
      for (let x = 0; x < w; x += gridSize) {
        offscreenCtx.moveTo(x, 0);
        offscreenCtx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        offscreenCtx.moveTo(0, y);
        offscreenCtx.lineTo(w, y);
      }
      offscreenCtx.stroke();
    };

    createGridPattern(width, height);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createGridPattern(width, height);
    };
    window.addEventListener("resize", onResize);

    // Particle nodes for ambient floating telemetry motes
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 10 : 16;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.4 + 0.8,
      color: Math.random() > 0.35 ? "#7f9db8" : "#9d8fc4",
      alpha: Math.random() * 0.4 + 0.12,
    }));

    let isVisible = !document.hidden;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      // Draw pre-cached grid instantly
      if (offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0);
      }

      // Render floating sci-fi particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = width;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = height;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fill();

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 110) * 0.08;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};
