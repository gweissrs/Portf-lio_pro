import { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 80;
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 1.5;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function initParticles(w, h) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: randomBetween(0, w),
    y: randomBetween(0, h),
    vx: randomBetween(-0.2, 0.2),
    vy: randomBetween(-0.25, -0.05),
    r: randomBetween(1, 3),
    baseAlpha: randomBetween(0.15, 1),
    color: [
      'rgba(255,255,255,',
      'rgba(160,230,255,',
      'rgba(100,180,255,',
    ][Math.floor(Math.random() * 3)],
  }));
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

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      if (!stateRef.current) {
        stateRef.current = { particles: initParticles(w, h), w, h };
      } else {
        stateRef.current.w = w;
        stateRef.current.h = h;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function drawWaves(w, h) {
      const waveConfigs = [
        // fundo — mais fosca
        { speed: 0.4, amp: 28, yOff: 0.72, color: '#6366F1', alpha: 0.18, lw: 1 },
        // meio
        { speed: 0.6, amp: 22, yOff: 0.78, color: '#3B82F6', alpha: 0.45, lw: 1.5 },
        // frente — mais nítida
        { speed: 0.9, amp: 16, yOff: 0.84, color: '#06B6D4', alpha: 0.9, lw: 2 },
      ];

      waveConfigs.forEach(({ speed, amp, yOff, color, alpha, lw }) => {
        ctx.beginPath();
        ctx.lineWidth = lw;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = alpha > 0.5 ? 20 : 6;
        ctx.shadowColor = '#06B6D4';

        const baseY = h * yOff;
        const step = 6;

        ctx.moveTo(0, baseY + Math.sin(t * speed) * amp);
        for (let x = 0; x <= w; x += step) {
          const y =
            baseY +
            Math.sin((x / w) * Math.PI * 3 + t * speed) * amp +
            Math.sin((x / w) * Math.PI * 1.5 + t * speed * 0.7) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // fill abaixo da onda
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, baseY - amp, 0, h);
        grad.addColorStop(0, color.replace(')', ', 0.04)').replace('#', 'rgba(').replace('rgba(', 'rgba('));
        grad.addColorStop(1, 'transparent');

        // simples fill com alpha baixo
        ctx.globalAlpha = alpha * 0.12;
        ctx.fillStyle = color;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function drawParticles(w, h) {
      const { particles } = stateRef.current;
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      particles.forEach((p) => {
        // repulsão do mouse
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // movimento natural
        p.x += p.vx;
        p.y += p.vy;

        // wrap around
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;

        // depth: partículas altas na tela são "distantes" → mais transparentes
        const depthFactor = p.y / h; // 0 = topo (distante), 1 = base (próxima)
        const alpha = p.baseAlpha * (0.15 + depthFactor * 0.85);
        const glow = depthFactor > 0.6 ? 4 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.5 + depthFactor * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.shadowBlur = glow;
        ctx.shadowColor = '#06B6D4';
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    }

    function loop() {
      if (!stateRef.current) { rafId = requestAnimationFrame(loop); return; }
      const { w, h } = stateRef.current;

      ctx.clearRect(0, 0, w, h);
      t += 0.012;

      drawParticles(w, h);
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
      }}
    />
  );
}
