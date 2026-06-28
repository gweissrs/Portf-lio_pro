import { useRef, useEffect } from 'react';

function buildSmoothPath(ctx, points, count) {
  if (count < 2) return;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < count - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  ctx.lineTo(points[count - 1].x, points[count - 1].y);
}

export function HolographicLine({ mousePos, revealProgress, ctaHovering }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;
    let currentAmp = 60;
    let prevAmp    = 60;

    // Dimensões cacheadas — atualizadas só no ResizeObserver, nunca no rAF
    let cachedW = 0, cachedH = 0;

    // Pool de pontos reutilizável — elimina GC pressure (sem push() por frame)
    const MAX_POINTS = Math.ceil((window.innerWidth || 1920) / 2) + 4;
    const pointPool  = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0, t: 0 }));
    let pointCount   = 0;

    // Gradientes por linha — criados uma vez, recriados só no resize
    let grads = [null, null, null];
    const LINE_GRAD_DEFS = [
      { colorCenter: '#ffffff', colorEdge: '#06B6D4' },
      { colorCenter: '#06B6D4', colorEdge: '#0891B2' },
      { colorCenter: '#67E8F9', colorEdge: '#E0F2FE' },
    ];
    const buildGrads = () => {
      if (cachedW <= 0) return;
      grads = LINE_GRAD_DEFS.map(({ colorCenter, colorEdge }) => {
        const g = ctx.createLinearGradient(0, 0, cachedW, 0);
        g.addColorStop(0,    'transparent');
        g.addColorStop(0.06, colorEdge);
        g.addColorStop(0.5,  colorCenter);
        g.addColorStop(0.94, colorEdge);
        g.addColorStop(1,    'transparent');
        return g;
      });
    };

    const particles = Array.from({ length: 40 }, () => {
      const yOffset = (Math.random() - 0.5) * 50;
      return {
        xRatio:         Math.random(),
        yOffset,
        baseYOffset:    yOffset,
        currentYOffset: yOffset,
        phase:          Math.random() * Math.PI * 2,
        glowPhase:      Math.random() * Math.PI * 2,
        radius:         0.8 + Math.random() * 1.2,
        baseRadius:     0,
        color:          ['#ffffff', '#06B6D4', '#93C5FD'][Math.floor(Math.random() * 3)],
        vx: 0, vy: 0,
        exploding:      false,
        explodeVx:      0,
        explodeVy:      0,
        explodeTimer:   0,
      };
    });
    particles.forEach(p => { p.baseRadius = p.radius; });

    let pulseTimer = 0;
    const PULSE_INTERVAL = 4.0;
    const PULSE_DURATION = 0.8;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cachedW = canvas.offsetWidth  || window.innerWidth;
      cachedH = canvas.offsetHeight || window.innerHeight;
      canvas.width  = cachedW * dpr;
      canvas.height = cachedH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrads();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let isVisible = false;
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(draw);
      } else if (!isVisible && animId) {
        cancelAnimationFrame(animId);
        animId = undefined;
      }
    }, { threshold: 0 });
    io.observe(canvas);

    function phaseProgress(global, start, end) {
      return Math.max(0, Math.min(1, (global - start) / (end - start)));
    }

    // 2 camadas de glow em vez de 4 — elimina 2 passes de ctx.filter por linha por frame
    // Alpha compensado para manter aparência visual idêntica
    const GLOW_LAYERS = [
      { blurPx: 16, widthMult: 12, alphaMult: 0.07 },
      { blurPx: 2,  widthMult: 2,  alphaMult: 0.32 },
    ];

    const N_STROKE_GROUPS = 20; // reduz ~960 strokes por linha para 20

    function drawPremiumLine({
      localP, baseYRatio, amp, phaseOffset,
      speed, lineWidth, gradIndex, glowColor,
      opacity, energyBoost = 0,
    }) {
      if (localP <= 0 || cachedW <= 0) return;

      const baseY     = baseYRatio * cachedH;
      const revealX   = cachedW * localP;
      const waveBlend = Math.max(0, Math.min(1, (localP - 0.2) / 0.5));

      // Reutilizar pool — sem alocação de objetos a cada frame
      pointCount = 0;
      for (let x = 0; x <= revealX; x += 2) {
        const t     = x / cachedW;
        const waveY = baseY + Math.sin(t * Math.PI * 2.5 + time * speed + phaseOffset) * amp;
        const y     = baseY + (waveY - baseY) * waveBlend;
        if (pointCount < pointPool.length) {
          pointPool[pointCount].x = x;
          pointPool[pointCount].y = y;
          pointPool[pointCount].t = t;
          pointCount++;
        }
      }
      if (pointCount < 2) return;

      const grad = grads[gradIndex];
      if (!grad) return;

      const energyAlphaBoost = energyBoost * 0.4;

      // Glow: 2 camadas (era 4) — 50% menos passes de ctx.filter por frame
      for (let gi = 0; gi < GLOW_LAYERS.length; gi++) {
        const layer = GLOW_LAYERS[gi];
        const effectiveAlpha = gi === GLOW_LAYERS.length - 1
          ? layer.alphaMult * (1 + energyAlphaBoost)
          : layer.alphaMult;
        ctx.save();
        ctx.globalAlpha = opacity * effectiveAlpha;
        ctx.lineWidth   = lineWidth * layer.widthMult;
        ctx.strokeStyle = glowColor;
        ctx.filter      = `blur(${layer.blurPx}px)`;
        ctx.beginPath();
        buildSmoothPath(ctx, pointPool, pointCount);
        ctx.stroke();
        ctx.filter = 'none';
        ctx.restore();
      }

      // Camada nítida — agrupada em N_STROKE_GROUPS (era 1 stroke/segmento ~960x/frame)
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineCap     = 'round';

      const groupSize = Math.ceil((pointCount - 1) / N_STROKE_GROUPS);
      for (let g = 0; g < N_STROKE_GROUPS; g++) {
        const startIdx = g * groupSize + 1;
        const endIdx   = Math.min(startIdx + groupSize - 1, pointCount - 1);
        if (startIdx >= pointCount) break;

        // Largura média do grupo; alpha do último ponto (preserva fade-in na borda)
        let sumW = 0, cnt = 0;
        for (let i = startIdx; i <= endIdx; i++) {
          const t  = pointPool[i].t;
          const lf = 1 - Math.abs(t - 0.5) * 1.5;
          const cf = lf < 0.5 ? 2 * lf * lf : 1 - Math.pow(-2 * lf + 2, 2) / 2;
          sumW += lineWidth * Math.max(0.3, cf);
          cnt++;
        }
        const lastT = pointPool[endIdx].t;
        ctx.lineWidth   = sumW / cnt;
        ctx.globalAlpha = Math.min(1, (lastT / 0.06) * opacity);

        ctx.beginPath();
        ctx.moveTo(pointPool[startIdx - 1].x, pointPool[startIdx - 1].y);
        for (let i = startIdx; i <= endIdx; i++) {
          const curr = pointPool[i];
          if (i < pointCount - 1) {
            const next = pointPool[i + 1];
            ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, cachedW, cachedH);

      const progress      = revealProgress?.current ?? 1;
      const isCtaHover    = ctaHovering?.current ?? false;
      const my            = mousePos?.current?.y ?? -9999;
      const mouseNearLine = Math.abs(my - cachedH * 0.76) < 80;

      const targetAmp = isCtaHover ? 140 : mouseNearLine ? 80 : 60;
      prevAmp     = currentAmp;
      currentAmp += (targetAmp - currentAmp) * 0.05;
      const ampDelta    = Math.abs(currentAmp - prevAmp);
      const energyBoost = ampDelta > 0.3 ? Math.min(1, ampDelta / 5) : 0;

      drawPremiumLine({
        localP:      phaseProgress(progress, 0.0, 0.45),
        baseYRatio:  0.76,
        amp:         currentAmp,
        phaseOffset: 0,
        speed:       1.0,
        lineWidth:   1.8,
        gradIndex:   0,
        glowColor:   '#06B6D4',
        opacity:     0.9,
        energyBoost,
      });

      drawPremiumLine({
        localP:      phaseProgress(progress, 0.30, 0.70),
        baseYRatio:  0.79,
        amp:         currentAmp * 0.65,
        phaseOffset: 0.9,
        speed:       0.7,
        lineWidth:   1.0,
        gradIndex:   1,
        glowColor:   '#0891B2',
        opacity:     0.45,
      });

      const phaseC = phaseProgress(progress, 0.60, 1.0);
      drawPremiumLine({
        localP:      phaseC,
        baseYRatio:  0.73,
        amp:         currentAmp * 0.4,
        phaseOffset: 1.8,
        speed:       0.5,
        lineWidth:   0.6,
        gradIndex:   2,
        glowColor:   '#67E8F9',
        opacity:     0.22,
      });

      // Partículas agrupadas por cor — reduz save/restore de 40 para 3
      if (phaseC > 0.2) {
        const particleFade = Math.min(1, (phaseC - 0.2) / 0.4);
        const mx  = mousePos?.current?.x ?? -9999;
        const my2 = mousePos?.current?.y ?? -9999;

        pulseTimer += 0.003;
        if (pulseTimer >= PULSE_INTERVAL) {
          pulseTimer = 0;
          particles.forEach(p => {
            p.exploding    = true;
            p.explodeTimer = PULSE_DURATION;
            const angle    = Math.random() * Math.PI * 2;
            const force    = 2 + Math.random() * 4;
            p.explodeVx    = Math.cos(angle) * force;
            p.explodeVy    = Math.sin(angle) * force;
          });
        }

        const colorGroups = {};
        for (const p of particles) {
          const px = p.xRatio * cachedW;
          if (px > cachedW * phaseC) continue;

          const targetYOffset = isCtaHover ? p.baseYOffset * 3.5 : p.baseYOffset;
          p.currentYOffset += (targetYOffset - p.currentYOffset) * 0.04;

          const lineY  = cachedH * 0.76 + Math.sin((px / cachedW) * Math.PI * 2.5 + time) * currentAmp;
          const floatY = Math.sin(time * 14 + p.phase) * 8;
          const floatX = Math.cos(time * 8  + p.phase) * 3;

          let finalX = px    + floatX;
          let finalY = lineY + p.currentYOffset + floatY;

          if (p.exploding && p.explodeTimer > 0) {
            p.explodeTimer -= 0.003;
            const prog          = 1 - (p.explodeTimer / PULSE_DURATION);
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

          const glowPulse     = 0.5 + 0.5 * Math.sin(time * 6 + p.glowPhase);
          const glowIntensity = 2 + glowPulse * 6;
          const absOffset     = Math.abs(p.yOffset);
          const baseAlpha     = absOffset < 10 ? 0.8 : absOffset > 25 ? 0.15 : 0.45;
          const alpha         = Math.min(1, baseAlpha * particleFade * (1 + glowPulse * 0.3));
          const radiusPulse   = p.baseRadius * (1 + glowPulse * 0.4);

          if (!colorGroups[p.color]) colorGroups[p.color] = [];
          colorGroups[p.color].push({ finalX, finalY, radiusPulse, alpha, glowIntensity });
        }

        // 1 save/restore por cor em vez de 1 por partícula (40→3 context switches)
        for (const [color, group] of Object.entries(colorGroups)) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.fillStyle   = color;
          for (const { finalX, finalY, radiusPulse, alpha, glowIntensity } of group) {
            ctx.globalAlpha = alpha;
            ctx.shadowBlur  = glowIntensity;
            ctx.beginPath();
            ctx.arc(finalX, finalY, radiusPulse, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      time += 0.003;
      if (isVisible) animId = requestAnimationFrame(draw);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
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
      }}
    />
  );
}
