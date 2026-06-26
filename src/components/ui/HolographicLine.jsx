import { useRef, useEffect } from 'react';

// Melhoria 1: path suave via midpoint quadratic — evita segmentos poligonais visíveis em HiDPI
function buildSmoothPath(ctx, points) {
  if (points.length < 2) return;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
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
    let prevAmp    = 60; // Melhoria 4: rastrear variação frame-a-frame

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
      canvas.width  = (canvas.offsetWidth  || window.innerWidth)  * dpr;
      canvas.height = (canvas.offsetHeight || window.innerHeight) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function phaseProgress(global, start, end) {
      return Math.max(0, Math.min(1, (global - start) / (end - start)));
    }

    function drawPremiumLine({
      localP, baseYRatio, amp, phaseOffset,
      speed, lineWidth, colorCenter, colorEdge,
      glowColor, opacity, energyBoost = 0,
    }) {
      if (localP <= 0) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const baseY     = baseYRatio * h;
      const revealX   = w * localP;
      const waveBlend = Math.max(0, Math.min(1, (localP - 0.2) / 0.5));

      const points = [];
      for (let x = 0; x <= revealX; x += 2) {
        const t     = x / w;
        const waveY = baseY + Math.sin(t * Math.PI * 2.5 + time * speed + phaseOffset) * amp;
        const y     = baseY + (waveY - baseY) * waveBlend;
        points.push({ x, y, t });
      }
      if (points.length < 2) return;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0,    'transparent');
      grad.addColorStop(0.06, colorEdge);
      grad.addColorStop(0.5,  colorCenter);
      grad.addColorStop(0.94, colorEdge);
      grad.addColorStop(1,    'transparent');

      // CAMADAS DE GLOW (1-4) — decaimento exponencial, mais difuso ao mais nítido
      // Melhoria 2: substitui as 2 camadas anteriores por 4 com alpha/blur calibrados
      const glowLayers = [
        { blurPx: 16, widthMult: 12, alphaMult: 0.05 },
        { blurPx: 10, widthMult: 7,  alphaMult: 0.09 },
        { blurPx: 5,  widthMult: 4,  alphaMult: 0.16 },
        { blurPx: 2,  widthMult: 2,  alphaMult: 0.28 },
      ];

      for (let gi = 0; gi < glowLayers.length; gi++) {
        const layer = glowLayers[gi];
        // Melhoria 4: energyBoost amplifica camada mais nítida (última) em até +40%
        const effectiveAlpha = gi === glowLayers.length - 1
          ? layer.alphaMult * (1 + energyBoost * 0.4)
          : layer.alphaMult;

        ctx.save();
        ctx.globalAlpha = opacity * effectiveAlpha;
        ctx.lineWidth   = lineWidth * layer.widthMult;
        ctx.strokeStyle = glowColor;
        ctx.filter      = `blur(${layer.blurPx}px)`;
        ctx.beginPath();
        buildSmoothPath(ctx, points); // Melhoria 1: quadratic suave
        ctx.stroke();
        ctx.filter = 'none';
        ctx.restore();
      }

      // CAMADA NÍTIDA — linha principal com espessura variável + curva suave
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineCap     = 'round';
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        // Melhoria 3: ease-in-out na variação de espessura central (era linear)
        const linearFactor = 1 - Math.abs(curr.t - 0.5) * 1.5;
        const centerFactor = linearFactor < 0.5
          ? 2 * linearFactor * linearFactor
          : 1 - Math.pow(-2 * linearFactor + 2, 2) / 2;

        ctx.lineWidth   = lineWidth * Math.max(0.3, centerFactor);
        ctx.globalAlpha = Math.min(1, (curr.t / 0.06) * opacity);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);

        // Melhoria 1: quadratic para cada segmento — sem arestas poligonais
        if (i < points.length - 1) {
          const next = points[i + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        } else {
          ctx.lineTo(curr.x, curr.y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const progress      = revealProgress?.current ?? 1;
      const isCtaHover    = ctaHovering?.current ?? false;
      const my            = mousePos?.current?.y ?? -9999;
      const mouseNearLine = Math.abs(my - h * 0.76) < 80;

      const targetAmp = isCtaHover ? 140 : mouseNearLine ? 80 : 60;

      // Melhoria 4: capturar delta de amplitude para energyBoost
      prevAmp     = currentAmp;
      currentAmp += (targetAmp - currentAmp) * 0.05;
      const ampDelta    = Math.abs(currentAmp - prevAmp);
      const energyBoost = ampDelta > 0.3 ? Math.min(1, ampDelta / 5) : 0;

      // LINHA 1 — Principal, próxima, mais rápida
      drawPremiumLine({
        localP:      phaseProgress(progress, 0.0, 0.45),
        baseYRatio:  0.76,
        amp:         currentAmp,
        phaseOffset: 0,
        speed:       1.0,
        lineWidth:   1.8,
        colorCenter: '#ffffff',
        colorEdge:   '#06B6D4',
        glowColor:   '#06B6D4',
        opacity:     0.9,
        energyBoost,
      });

      // LINHA 2 — Média, velocidade intermediária
      drawPremiumLine({
        localP:      phaseProgress(progress, 0.30, 0.70),
        baseYRatio:  0.79,
        amp:         currentAmp * 0.65,
        phaseOffset: 0.9,
        speed:       0.7,
        lineWidth:   1.0,
        colorCenter: '#06B6D4',
        colorEdge:   '#0891B2',
        glowColor:   '#0891B2',
        opacity:     0.45,
      });

      // LINHA 3 — Distante, mais lenta, quase invisível
      const phaseC = phaseProgress(progress, 0.60, 1.0);
      drawPremiumLine({
        localP:      phaseC,
        baseYRatio:  0.73,
        amp:         currentAmp * 0.4,
        phaseOffset: 1.8,
        speed:       0.5,
        lineWidth:   0.6,
        colorCenter: '#67E8F9',
        colorEdge:   '#E0F2FE',
        glowColor:   '#67E8F9',
        opacity:     0.22,
      });

      // Partículas da fase C — INALTERADO
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

        for (const p of particles) {
          const px = p.xRatio * w;
          if (px > w * phaseC) continue;

          const targetYOffset = isCtaHover ? p.baseYOffset * 3.5 : p.baseYOffset;
          p.currentYOffset += (targetYOffset - p.currentYOffset) * 0.04;

          const lineY  = h * 0.76 + Math.sin((px / w) * Math.PI * 2.5 + time) * currentAmp;
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

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur  = glowIntensity;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;
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
