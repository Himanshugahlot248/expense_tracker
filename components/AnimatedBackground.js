"use client";

import { useEffect, useRef } from "react";

// Lightweight particle-network canvas: floating dots that link with thin
// lines when near each other, plus a few slow-rising "bubbles". Sits fixed
// behind all content, ignores pointer events, and pauses when tab is hidden.
export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w, h, dpr;
    let particles = [];
    let bubbles = [];
    let raf;
    let running = true;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));

      const bCount = Math.min(14, Math.floor(w / 90));
      bubbles = Array.from({ length: bCount }, () => spawnBubble(true));
    }

    function spawnBubble(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 40,
        r: Math.random() * 40 + 12,
        vy: Math.random() * 0.4 + 0.15,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.05 + 0.02,
      };
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // bubbles (soft accent blobs rising upward)
      for (const b of bubbles) {
        b.y -= b.vy;
        b.x += b.drift;
        if (b.y + b.r < -20) Object.assign(b, spawnBubble(false));
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(124,92,255,${b.alpha})`);
        grad.addColorStop(1, "rgba(124,92,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // particle network
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(157,134,255,${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(180,165,255,0.55)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function onVisibility() {
      running = !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    if (reduce) {
      // Respect reduced-motion: skip the animation loop entirely.
      // The body's static gradient remains as the backdrop.
      running = false;
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
