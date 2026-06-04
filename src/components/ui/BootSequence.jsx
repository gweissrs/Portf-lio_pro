import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './BootSequence.module.css';

const PHRASE = "Welcome to Guilherme Weiss's portfolio.";
// G = índice 11, W = índice 21
const G_IDX = 11;
const W_IDX = 21;

export function BootSequence({ onComplete }) {
  const overlayRef  = useRef(null);
  const phraseRef   = useRef(null);
  const gwGroupRef  = useRef(null);
  const gRef        = useRef(null);
  const wRef        = useRef(null);
  const glowRef     = useRef(null);

  useEffect(() => {
    const overlay  = overlayRef.current;
    const phraseEl = phraseRef.current;
    const gwGroup  = gwGroupRef.current;
    const gEl      = gRef.current;
    const wEl      = wRef.current;
    const glowEl   = glowRef.current;

    if (!overlay || !phraseEl || !gwGroup || !gEl || !wEl || !glowEl) return;

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

    // FASE 3 — G e W centralizam na tela sem gap entre eles
    tl.add(() => {
      const gRect        = gRef.current.getBoundingClientRect();
      const wRect        = wRef.current.getBoundingClientRect();
      const screenCenterX = window.innerWidth / 2;
      const gwTotalWidth  = gRect.width + wRect.width;
      const gTargetLeft   = screenCenterX - gwTotalWidth / 2;
      const wTargetLeft   = gTargetLeft + gRect.width;

      gsap.to(gRef.current, { x: `+=${gTargetLeft - gRect.left}`, duration: 0.5, ease: 'expo.inOut' });
      gsap.to(wRef.current, { x: `+=${wTargetLeft - wRect.left}`, duration: 0.5, ease: 'expo.inOut' });
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

      // Text shadow no GW
      gsap.to([gRef.current, wRef.current], {
        textShadow: '0 0 20px #06B6D4, 0 0 40px #06B6D4',
        duration: 0.2, ease: 'power3.out',
        onComplete: () => {
          gsap.to([gRef.current, wRef.current], {
            textShadow: '0 0 8px rgba(6,182,212,0.15)',
            duration: 0.5, ease: 'power2.out',
          });
        },
      });
    }, '+=0.5');

    // FASE 5 — GW voa para o logo da Navbar (0.3s após glow burst)
    tl.add(() => {
      const logoEl  = document.querySelector('[data-logo]');
      const logoRect = logoEl?.getBoundingClientRect();
      if (!logoRect || logoRect.width === 0) return;

      // Posição visual real de G e W após transforms individuais da FASE 3
      const gRect = gRef.current.getBoundingClientRect();
      const wRect = wRef.current.getBoundingClientRect();

      // Centro visual real do par GW na tela
      const gwVisualWidth  = wRect.right - gRect.left;
      const gwCenterX      = gRect.left  + gwVisualWidth  / 2;
      const gwCenterY      = gRect.top   + gRect.height   / 2;

      // Centro alvo do logo
      const targetCenterX  = logoRect.left + logoRect.width  / 2;
      const targetCenterY  = logoRect.top  + logoRect.height / 2;

      // Centro do gwGroup (pivô de escala do GSAP)
      const gwGroupRect    = gwGroupRef.current.getBoundingClientRect();
      const gwGroupCenterX = gwGroupRect.left + gwGroupRect.width  / 2;
      const gwGroupCenterY = gwGroupRect.top  + gwGroupRect.height / 2;

      // Offset entre centro visual do GW e pivô do gwGroup
      const offsetX = gwCenterX - gwGroupCenterX;
      const offsetY = gwCenterY - gwGroupCenterY;

      const scale  = logoRect.height / gRect.height;
      const deltaX = targetCenterX - gwGroupCenterX - scale * offsetX;
      const deltaY = targetCenterY - gwGroupCenterY - scale * offsetY;

      gsap.to(gwGroupRef.current, {
        x: deltaX,
        y: deltaY,
        scale,
        duration: 0.7,
        ease: 'expo.inOut',
        transformOrigin: 'center center',
      });
    }, '+=0.3');

    // FASE 6 — span simples na posição do logo faz crossfade com logo real
    tl.add(() => {
      const logoEl   = document.querySelector('[data-logo]');
      const logoRect = logoEl?.getBoundingClientRect();
      if (!logoRect) return;

      const logoComputedStyle = window.getComputedStyle(logoEl);
      const clone = document.createElement('span');
      clone.textContent = 'GW';
      clone.style.cssText = `
        position: fixed;
        top: ${logoRect.top}px;
        left: ${logoRect.left}px;
        width: ${logoRect.width}px;
        height: ${logoRect.height}px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-family: ${logoComputedStyle.fontFamily};
        font-size: ${logoComputedStyle.fontSize};
        font-weight: ${logoComputedStyle.fontWeight};
        color: ${logoComputedStyle.color};
        letter-spacing: ${logoComputedStyle.letterSpacing};
        z-index: 10000;
        pointer-events: none;
        margin: 0;
        padding: 0;
        line-height: 1;
      `;
      document.body.appendChild(clone);

      gsap.set(gwGroupRef.current, { opacity: 0 });

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        delay: 0.1,
        ease: 'power2.inOut',
        onComplete: () => {
          onComplete();
          gsap.to(clone, {
            opacity: 0,
            duration: 0.3,
            delay: 0.3,
            onComplete: () => clone.remove(),
          });
        },
      });
    }, '+=0.3');

    return () => tl.kill();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={overlayRef} className={styles.overlay}>
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
