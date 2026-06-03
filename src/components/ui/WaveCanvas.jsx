import { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 50; // reduzido de 80 → 50
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 1.5;

function rnd(a, b) {
  return a + Math.random() * (b - a);
}

function makeParticle(w, h) {
  return {
    x: rnd(0, w),
    y: rnd(0, h),
    vx: rnd(-0.2, 0.2),
    vy: rnd(-0.25, -0.05),
    r: rnd(1, 3),
    baseAlpha: rnd(0.15, 1),
    color: ['255,255,255', '160,230,255', '100,180,255'][Math.floor(Math.random() * 3)],
  };
}

export function WaveCanvas({ mousePos }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let t = 0;
    let frameCount = 0; // throttle do mouse

    function setup(w, h) {
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!stateRef.current || stateRef.current.w === 0) {
        stateRef.current = {
          particles: Array.from({ length: PARTICLE_COUNT }, () => makeParticle(w, h)),
          w,
          h,
        };
      } else {
        stateRef.current.w = w;
        stateRef.current.h = h;
      }
    }

    const parent = canvas.parentElement;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setup(width, height);
    });
    ro.observe(parent || canvas);

    const w0 = parent?.offsetWidth || window.innerWidth;
    const h0 = parent?.offsetHeight || window.innerHeight;
    setup(w0, h0);

    // ─── Ondas ───────────────────────────────────────────────
    const WAVES = [
      { speed: 0.40, amp: 28, yOff: 0.72, r: 99,  g: 102, b: 241, alpha: 0.18, lw: 1   },
      { speed: 0.60, amp: 22, yOff: 0.78, r: 59,  g: 130, b: 246, alpha: 0.45, lw: 1.5 },
      { speed: 0.90, amp: 16, yOff: 0.84, r: 6,   g: 182, b: 212, alpha: 0.90, lw: 2   },
    ];

    function drawWaves(w, h) {
      WAVES.forEach(({ speed, amp, yOff, r, g, b, alpha, lw }) => {
        const baseY = h * yOff;

        ctx.beginPath();
        ctx.lineWidth = lw;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = alpha > 0.5 ? 12 : 4; // reduzido de 20/6 → 12/4
        ctx.shadowColor = `rgba(${r},${g},${b},1)`;
        ctx.globalAlpha = 1;

        ctx.moveTo(0, baseY + Math.sin(t * speed) * amp);
        for (let x = 0; x <= w; x += 5) {
          const y =
            baseY +
            Math.sin((x / w) * Math.PI * 3 + t * speed) * amp +
            Math.sin((x / w) * Math.PI * 1.5 + t * speed * 0.7) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.1})`;
        ctx.shadowBlur = 0;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ─── Partículas ──────────────────────────────────────────
    function drawParticles(w, h, applyMouse) {
      const particles = stateRef.current?.particles;
      if (!particles) return;

      const mx = mousePos?.current?.x ?? -9999;
      const my = mousePos?.current?.y ?? -9999;

      particles.forEach((p) => {
        // Mouse só calculado a cada 2 frames — throttle
        if (applyMouse) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;

        const depth = p.y / h;
        const alpha = p.baseAlpha * (0.12 + depth * 0.88);
        const radius = Math.max(0.5, p.r * (0.5 + depth * 0.5));

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        // shadowBlur removido das partículas — operação mais pesada do Canvas 2D
        ctx.fill();
      });
    }

    // ─── Loop principal ──────────────────────────────────────
    function loop() {
      const state = stateRef.current;
      if (!state || state.w === 0) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      const { w, h } = state;

      frameCount++;
      const applyMouse = frameCount % 2 === 0; // throttle: mouse a cada 2 frames

      ctx.clearRect(0, 0, w, h);
      t += 0.012;

      drawParticles(w, h, applyMouse);
      drawWaves(w, h);

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
        willChange: 'transform', // força GPU layer
      }}
    />
  );
}
