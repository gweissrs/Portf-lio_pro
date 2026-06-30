import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './BootSequence.module.css';

const PHRASE = "Welcome to Guilherme Weiss's portfolio.";
// G = índice 11, W = índice 21
const G_IDX = 11;
const W_IDX = 21;

export function BootSequence({ onComplete }) {
  const overlayRef        = useRef(null);
  const phraseRef         = useRef(null);
  const gwGroupRef        = useRef(null);
  const gRef              = useRef(null);
  const wRef              = useRef(null);
  const glowRef           = useRef(null);
  const particleCanvasRef = useRef(null);
  const mousePosRef       = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const overlay  = overlayRef.current;
    const phraseEl = phraseRef.current;
    const gwGroup  = gwGroupRef.current;
    const gEl      = gRef.current;
    const wEl      = wRef.current;
    const glowEl   = glowRef.current;

    if (!overlay || !phraseEl || !gwGroup || !gEl || !wEl || !glowEl) return;

    // Canvas de partículas — dimensionar uma vez no mount
    const pCanvas = particleCanvasRef.current;
    const pCtx = pCanvas.getContext('2d');
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;

    const handleResize = () => {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let particleAnimId = null;
    let skipped = false;

    const skipIntro = () => {
      if (skipped) return;
      skipped = true;
      tl.kill();
      if (particleAnimId) cancelAnimationFrame(particleAnimId);
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => onComplete(),
      });
    };

    overlay.addEventListener('mousedown', skipIntro);

    const triggerExplosion = () => {
      const W = pCanvas.width;
      const H = pCanvas.height;
      const cx = W / 2;
      const cy = H / 2;

      const COLORS = ['#ffffff', '#06B6D4', '#93C5FD', '#67E8F9'];
      const mkParticle = (z, speed) => {
        const angle = Math.random() * Math.PI * 2;
        return {
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          z, settled: false,
          restX: null, restY: null,
          color: COLORS[Math.floor(Math.random() * 4)],
        };
      };

      const particles = [];

      // 80 partículas grandes na frente
      for (let i = 0; i < 80; i++) {
        const z = 0.7 + Math.random() * 0.3;
        const p = mkParticle(z, 18 + Math.random() * 20);
        p.radius  = 1.5 + z * 2.5;
        p.opacity = 0.7 + z * 0.3;
        particles.push(p);
      }

      // 100 partículas médias
      for (let i = 0; i < 100; i++) {
        const z = 0.3 + Math.random() * 0.4;
        const p = mkParticle(z, 8 + Math.random() * 10);
        p.radius  = 0.8 + z * 1.5;
        p.opacity = 0.5 + z * 0.3;
        particles.push(p);
      }

      // 70 partículas pequenas ao fundo
      for (let i = 0; i < 70; i++) {
        const z = 0.05 + Math.random() * 0.25;
        const p = mkParticle(z, 5 + Math.random() * 8);
        p.radius  = 0.4 + z * 1.0;
        p.opacity = 0.2 + z * 0.3;
        particles.push(p);
      }

      const drawParticles = () => {
        pCtx.clearRect(0, 0, W, H);

        for (const p of particles) {
          // FASE EXPLOSÃO — sem interação com mouse, drag próprio por profundidade
          if (p.restX === null) {
            if (!p.settled) {
              const drag = 0.95 + p.z * 0.015;
              p.vx *= drag;
              p.vy *= drag;
              p.x  += p.vx;
              p.y  += p.vy;
              if (Math.abs(p.vx) < 0.15 && Math.abs(p.vy) < 0.15) {
                p.settled = true;
                p.vx = 0;
                p.vy = 0;
                p.restX = p.x;
                p.restY = p.y;
              }
            }
          }
          // FASE INTERATIVA — repulsão + mola de retorno, damping 0.90
          else {
            const mx = mousePosRef.current.x;
            const my = mousePosRef.current.y;
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const REPEL_RADIUS = 80;

            if (dist < REPEL_RADIUS && dist > 0) {
              const force = (1 - dist / REPEL_RADIUS) * 0.3;
              const angle = Math.atan2(dy, dx);
              p.vx += Math.cos(angle) * force;
              p.vy += Math.sin(angle) * force;
              p.settled = false;
            }

            if (p.settled) {
              const dxR = p.restX - p.x;
              const dyR = p.restY - p.y;
              if (Math.sqrt(dxR * dxR + dyR * dyR) > 0.5) {
                p.vx += dxR * 0.04;
                p.vy += dyR * 0.04;
                p.settled = false;
              }
            }

            if (!p.settled) {
              p.vx *= 0.90;
              p.vy *= 0.90;
              p.x  += p.vx;
              p.y  += p.vy;
              if (Math.abs(p.vx) < 0.08 && Math.abs(p.vy) < 0.08) {
                p.settled = true;
                p.vx = 0;
                p.vy = 0;
              }
            }
          }

          pCtx.save();
          pCtx.globalAlpha = p.opacity;
          pCtx.shadowBlur  = 6 + p.z * 8;
          pCtx.shadowColor = p.color;
          pCtx.fillStyle   = p.color;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, Math.max(0.4, p.radius), 0, Math.PI * 2);
          pCtx.fill();
          pCtx.restore();
        }

        particleAnimId = requestAnimationFrame(drawParticles);
      };

      if (particleAnimId) cancelAnimationFrame(particleAnimId);
      drawParticles();
    };

    const otherLetters = phraseEl.querySelectorAll('[data-other]');

    // Estado inicial
    gsap.set(phraseEl, { opacity: 0 });
    gsap.set(glowEl,   { xPercent: -50, yPercent: -50, opacity: 0, scale: 0 });

    const tl = gsap.timeline();

    // FASE 1 — frase aparece
    tl.to(phraseEl, { opacity: 1, duration: 0.8, ease: 'expo.out' });

    // FASE 2 — letras somem, G e W ficam (após 0.8s de pausa)
    tl.to(otherLetters, {
      opacity: 0,
      duration: 0.5,
      stagger: 0.015,
      ease: 'expo.in',
    }, '+=0.8');

    // FASE 3 — G e W centralizam; explosão dispara no onComplete
    tl.add(() => {
      const gRect        = gRef.current.getBoundingClientRect();
      const wRect        = wRef.current.getBoundingClientRect();
      const screenCenterX = window.innerWidth / 2;
      const gwTotalWidth  = gRect.width + wRect.width;
      const gTargetLeft   = screenCenterX - gwTotalWidth / 2;
      const wTargetLeft   = gTargetLeft + gRect.width;

      gsap.to(gRef.current, { x: `+=${gTargetLeft - gRect.left}`, duration: 0.5, ease: 'expo.inOut' });
      gsap.to(wRef.current, {
        x: `+=${wTargetLeft - wRect.left}`,
        duration: 0.5,
        ease: 'expo.inOut',
        onUpdate: function() {
          if (this.progress() >= 0.95 && !wRef.current._exploded) {
            wRef.current._exploded = true;
            gsap.to([gRef.current, wRef.current], {
              fontWeight: 700,
              duration: 0.15,
              ease: 'power2.out',
            });
            triggerExplosion();
          }
        },
        onComplete: () => {
          wRef.current._exploded = false;
        },
      });
    });

    // FASE 4 — Glow burst (0.5s após fase 3 iniciar = quando ela termina)
    tl.add(() => {
      // Posição exata entre G e W após o movimento da FASE 3
      const gRect       = gRef.current.getBoundingClientRect();
      const wRect       = wRef.current.getBoundingClientRect();
      const gwGroupRect = gwGroupRef.current.getBoundingClientRect();

      const centerBetweenX = (gRect.left + wRect.right) / 2;
      const centerBetweenY = (gRect.top + gRect.bottom) / 2;

      gsap.set(glowRef.current, {
        left:     centerBetweenX - gwGroupRect.left,
        top:      centerBetweenY - gwGroupRect.top,
        xPercent: -50,
        yPercent: -50,
        opacity:  0,
        scale:    0,
      });

      // Flash de brilho no overlay
      gsap.fromTo(overlayRef.current,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.8)', duration: 0.1, ease: 'power3.out', yoyo: true, repeat: 1 },
      );

      // Orbe expande e some
      gsap.to(glowRef.current, {
        opacity: 1, scale: 1, duration: 0.15, ease: 'power3.out',
        onComplete: () => {
          gsap.to(glowRef.current, { opacity: 0, scale: 3.5, duration: 0.5, ease: 'power2.out' });
        },
      });

      // Text shadow multicamada no GW
      gsap.to([gRef.current, wRef.current], {
        textShadow: `
          0 0 10px rgba(6,182,212,0.9),
          0 0 20px rgba(6,182,212,0.7),
          0 0 40px rgba(6,182,212,0.5),
          0 0 80px rgba(6,182,212,0.3)
        `,
        duration: 0.4, ease: 'power2.out',
      });

    }, '+=0.5');

    // FASE 5 — Câmera entra pelo espaço escuro entre G e W
    tl.add(() => {
      gsap.set(overlayRef.current, { filter: 'brightness(1)' });

      const gRect       = gRef.current.getBoundingClientRect();
      const wRect       = wRef.current.getBoundingClientRect();
      const gwGroupRect = gwGroupRef.current.getBoundingClientRect();

      const zoomPointX = gRect.right - gwGroupRect.left;
      const zoomPointY = gRect.top + gRect.height / 2 - gwGroupRect.top;
      const originX    = (zoomPointX / gwGroupRect.width)  * 100;
      const originY    = (zoomPointY / gwGroupRect.height) * 100;

      gsap.to(gwGroupRef.current, {
        scale: 400,
        duration: 1.2,
        ease: 'power3.in',
        transformOrigin: `${originX}% ${originY}%`,
      });

      gsap.to(particleCanvasRef.current, {
        scale: 400,
        duration: 1.2,
        ease: 'power3.in',
        transformOrigin: `${originX}% ${originY}%`,
        onComplete: () => {
          if (particleAnimId) cancelAnimationFrame(particleAnimId);
        },
      });

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        delay: 0.9,
      });
    }, '+=0.8');

    // FASE 6 — Hero aparece após tudo escurecer
    tl.add(() => {
      onComplete();
    }, '+=1.5');

    return () => {
      tl.kill();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      overlay.removeEventListener('mousedown', skipIntro);
      if (particleAnimId) cancelAnimationFrame(particleAnimId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <span className={styles.skipHint}>clique para pular</span>
      <canvas
        ref={particleCanvasRef}
        className={styles.particleCanvas}
        aria-hidden="true"
      />
      <div ref={gwGroupRef} className={styles.gwGroup}>
        {/* Orbe de glow — top/left 50% relativo ao gwGroup */}
        <div ref={glowRef} className={styles.glowBurst} aria-hidden="true" />
        <p ref={phraseRef} className={styles.phrase}>
          {PHRASE.split('').map((char, i) => {
            if (i === G_IDX) {
              return <span key={i} ref={gRef} className={styles.highlight}>{char}</span>;
            }
            if (i === W_IDX) {
              return <span key={i} ref={wRef} className={styles.highlight}>{char}</span>;
            }
            if (char === ' ') {
              return <span key={i} data-other className={styles.space}>{' '}</span>;
            }
            return <span key={i} data-other className={styles.otherLetter}>{char}</span>;
          })}
        </p>
      </div>
    </div>
  );
}
