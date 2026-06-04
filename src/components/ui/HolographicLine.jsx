import { useRef, useEffect } from 'react';

export function HolographicLine({ mousePos, revealProgress, ctaHovering }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;
    let currentAmp = 60;

    const particles = Array.from({ length: 40 }, () => {
      const yOffset = (Math.random() - 0.5) * 50;
      return {
        xRatio:        Math.random(),
        yOffset,
        baseYOffset:   yOffset,
        currentYOffset: yOffset,
        phase:         Math.random() * Math.PI * 2,
        glowPhase:     Math.random() * Math.PI * 2,
        radius:        0.8 + Math.random() * 1.2,
        baseRadius:    0,
        color:         ['#ffffff', '#06B6D4', '#93C5FD'][Math.floor(Math.random() * 3)],
        vx: 0, vy: 0,
        px: 0, py: 0,
        exploding:     false,
        explodeVx:     0,
        explodeVy:     0,
        explodeTimer:  0,
      };
    });
    particles.forEach(p => { p.baseRadius = p.radius; });

    let pulseTimer = 0;
    const PULSE_INTERVAL = 4.0;
    const PULSE_DURATION = 0.8;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (canvas.offsetWidth || window.innerWidth) * dpr;
      canvas.height = (canvas.offsetHeight || window.innerHeight) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function phaseProgress(global, start, end) {
      return Math.max(0, Math.min(1, (global - start) / (end - start)));
    }

    function drawRevealLine({ localP, baseYRatio, amp, phaseOffset, opacity, lineWidth, c0, c1, glowColor }) {
      if (localP <= 0) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const baseY   = baseYRatio * h;
      const revealX = w * localP;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.08, c0);
      grad.addColorStop(0.5, c1);
      grad.addColorStop(0.92, c0);
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = grad;

      if (glowColor) {
        ctx.shadowBlur  = lineWidth > 1 ? 16 : 8;
        ctx.shadowColor = glowColor;
      }

      const waveBlend = Math.max(0, Math.min(1, (localP - 0.2) / 0.5));

      ctx.beginPath();
      for (let x = 0; x <= revealX; x += 1.5) {
        const t     = x / w;
        const waveY = baseY + Math.sin(t * Math.PI * 2.5 + time + phaseOffset) * amp;
        const y     = baseY + (waveY - baseY) * waveBlend;

        ctx.globalAlpha = opacity * Math.min(1, t / 0.05 + 0.2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const progress = revealProgress?.current ?? 1;

      const isCtaHover = ctaHovering?.current ?? false;

      const my = mousePos?.current?.y ?? -9999;
      const dist = Math.abs(my - h * 0.80);
      const mouseNearLine = dist < 80;

      const targetAmp = isCtaHover ? 90 : mouseNearLine ? 80 : 60;
      currentAmp += (targetAmp - currentAmp) * 0.05;

      // FASE A — linha ciano forte (0% → 45%)
      drawRevealLine({
        localP: phaseProgress(progress, 0.0, 0.45),
        baseYRatio: 0.80, amp: currentAmp,       phaseOffset: 0,
        opacity: 0.9, lineWidth: 1.8,
        c0: '#06B6D4', c1: '#ffffff', glowColor: '#06B6D4',
      });

      // FASE B — linha ciano fraca (30% → 70%)
      drawRevealLine({
        localP: phaseProgress(progress, 0.30, 0.70),
        baseYRatio: 0.83, amp: currentAmp * 0.6, phaseOffset: 0.9,
        opacity: 0.35, lineWidth: 0.9,
        c0: '#0891B2', c1: '#06B6D4', glowColor: '#0891B2',
      });

      // FASE C — linha ciano clara (60% → 100%)
      const phaseC = phaseProgress(progress, 0.60, 1.0);
      drawRevealLine({
        localP: phaseC,
        baseYRatio: 0.77, amp: currentAmp * 0.45, phaseOffset: 1.8,
        opacity: 0.20, lineWidth: 0.6,
        c0: '#67E8F9', c1: '#E0F2FE', glowColor: '#67E8F9',
      });

      // Partículas da fase C
      if (phaseC > 0.2) {
        const particleFade = Math.min(1, (phaseC - 0.2) / 0.4);
        const mx  = mousePos?.current?.x ?? -9999;
        const my2 = mousePos?.current?.y ?? -9999;

        pulseTimer += 0.003;
        if (pulseTimer >= PULSE_INTERVAL) {
          pulseTimer = 0;
          particles.forEach(p => {
            p.exploding     = true;
            p.explodeTimer  = PULSE_DURATION;
            const angle     = Math.random() * Math.PI * 2;
            const force     = 2 + Math.random() * 4;
            p.explodeVx     = Math.cos(angle) * force;
            p.explodeVy     = Math.sin(angle) * force;
          });
        }

        for (const p of particles) {
          const px = p.xRatio * w;
          if (px > w * phaseC) continue;

          // Interpolar yOffset — CTA hover afasta partículas da linha
          const targetYOffset = isCtaHover ? p.baseYOffset * 3.5 : p.baseYOffset;
          p.currentYOffset += (targetYOffset - p.currentYOffset) * 0.04;

          const lineY  = h * 0.80 + Math.sin((px / w) * Math.PI * 2.5 + time) * currentAmp;
          const floatY = Math.sin(time * 14 + p.phase) * 8;
          const floatX = Math.cos(time * 8  + p.phase) * 3;

          let finalX = px    + floatX;
          let finalY = lineY + p.currentYOffset + floatY;

          if (p.exploding && p.explodeTimer > 0) {
            p.explodeTimer -= 0.003;
            const prog         = 1 - (p.explodeTimer / PULSE_DURATION);
            const explodeFactor = Math.sin(prog * Math.PI);
            finalX += p.explodeVx * explodeFactor * 30;
            finalY += p.explodeVy * explodeFactor * 20;
            if (p.explodeTimer <= 0) { p.exploding = false; p.explodeTimer = 0; }
          }

          const dxM = finalX - mx, dyM = finalY - my2;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 100 && distM > 0) {
            const force = (1 - distM / 100) * 18;
            const angle = Math.atan2(dyM, dxM);
            p.vx += Math.cos(angle) * force * 0.3;
            p.vy += Math.sin(angle) * force * 0.3;
          }
          p.vx *= 0.88; p.vy *= 0.88;
          finalX += p.vx; finalY += p.vy;

          const glowPulse    = 0.5 + 0.5 * Math.sin(time * 6 + p.glowPhase);
          const glowIntensity = 2 + glowPulse * 6;
          const absOffset    = Math.abs(p.yOffset);
          const baseAlpha    = absOffset < 10 ? 0.8 : absOffset > 25 ? 0.15 : 0.45;
          const alpha        = Math.min(1, baseAlpha * particleFade * (1 + glowPulse * 0.3));
          const radiusPulse  = p.baseRadius * (1 + glowPulse * 0.4);

          ctx.save();
          ctx.globalAlpha  = alpha;
          ctx.shadowBlur   = glowIntensity;
          ctx.shadowColor  = p.color;
          ctx.fillStyle    = p.color;
          ctx.beginPath();
          ctx.arc(finalX, finalY, radiusPulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      time += 0.003;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [mousePos, revealProgress]);

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
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
