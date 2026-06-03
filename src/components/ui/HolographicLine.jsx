import { useRef, useEffect } from 'react';

export function HolographicLine({ mousePos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;
    let currentAmp = 60;

    const particles = Array.from({ length: 40 }, () => ({
      xRatio: Math.random(),
      yOffset: (Math.random() - 0.5) * 60,
      phase: Math.random() * Math.PI * 2,
      radius: 0.8 + Math.random() * 1.2,
      color: ['#ffffff', '#06B6D4', '#93C5FD'][Math.floor(Math.random() * 3)],
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (canvas.offsetWidth || window.innerWidth) * dpr;
      canvas.height = (canvas.offsetHeight || window.innerHeight) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function drawLine(baseYRatio, amp, phaseOffset, opacity, lineWidth, glowColor, c0, c1) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const baseY = baseYRatio * h;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.15, c0);
      grad.addColorStop(0.5, c1);
      grad.addColorStop(0.85, c0);
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = grad;

      if (glowColor) {
        ctx.shadowBlur = glowColor === '#06B6D4' ? 12 : 6;
        ctx.shadowColor = glowColor;
      }

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = baseY + Math.sin((x / w) * Math.PI * 2.5 + time + phaseOffset) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Lerp amplitude com base na proximidade do mouse
      const my = mousePos?.current?.y ?? -9999;
      const dist = Math.abs(my - h * 0.65);
      const targetAmp = dist < 80 ? 80 : 60;
      currentAmp += (targetAmp - currentAmp) * 0.05;

      // Linha 1 — principal holográfica
      drawLine(0.65, currentAmp, 0, 0.85, 1.5, '#06B6D4', '#06B6D4', '#ffffff');

      // Linha 2 — eco / profundidade
      drawLine(0.67, 40, 0.8, 0.3, 0.8, '#3B82F6', '#3B82F6', '#06B6D4');

      // Linha 3 — distante / fosca
      drawLine(0.69, 25, 1.6, 0.12, 0.5, null, '#06B6D4', '#06B6D4');

      // Partículas ao longo da linha
      for (const p of particles) {
        const px = p.xRatio * w;
        const lineY = h * 0.65 + Math.sin((px / w) * Math.PI * 2.5 + time) * currentAmp;
        const floatY = Math.sin(time * 9 + p.phase) * 5;
        const py = lineY + p.yOffset + floatY;

        const absOffset = Math.abs(p.yOffset);
        const alpha = absOffset < 10 ? 0.8 : absOffset > 20 ? 0.2 : 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        if (alpha > 0.5) {
          ctx.shadowBlur = 3;
          ctx.shadowColor = p.color;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      time += 0.003;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
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
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
