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
    gsap.set(glowEl,   { opacity: 0, scale: 0 });

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

    // FASE 3 — G e W se aproximam
    tl.add(() => {
      const gRect   = gEl.getBoundingClientRect();
      const wRect   = wEl.getBoundingClientRect();
      const centerX = (gRect.right + wRect.left) / 2;
      const gMoveX  = centerX - gRect.right;
      const wMoveX  = wRect.left - centerX;

      gsap.to(gEl, { x: gMoveX,  duration: 0.5, ease: 'expo.inOut' });
      gsap.to(wEl, { x: -wMoveX, duration: 0.5, ease: 'expo.inOut' });
    });

    // FASE 4 — Glow burst (0.5s após fase 3 iniciar = quando ela termina)
    tl.add(() => {
      // Flash de brilho no overlay
      gsap.fromTo(overlay,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.8)', duration: 0.1, ease: 'power3.out', yoyo: true, repeat: 1 },
      );

      // Orbe de luz ciano expande e some
      gsap.to(glowEl, {
        opacity: 1, scale: 1, duration: 0.15, ease: 'power3.out',
        onComplete: () => {
          gsap.to(glowEl, { opacity: 0, scale: 3, duration: 0.4, ease: 'power2.out' });
        },
      });

      // Text shadow pulsante no GW
      gsap.to([gEl, wEl], {
        textShadow: '0 0 20px #06B6D4, 0 0 40px #06B6D4',
        duration: 0.2, ease: 'power3.out',
        onComplete: () => {
          gsap.to([gEl, wEl], {
            textShadow: '0 0 8px rgba(6,182,212,0.15)',
            duration: 0.5, ease: 'power2.out',
          });
        },
      });
    }, '+=0.5');

    // FASE 5 — GW voa para o logo da Navbar (0.3s após glow burst)
    tl.add(() => {
      const gCurrent    = gEl.getBoundingClientRect();
      const gwGroupRect = gwGroup.getBoundingClientRect();
      const logoEl      = document.querySelector('[data-logo]');
      const logoRect    = logoEl?.getBoundingClientRect();

      const doFly = (dx, dy, s) => {
        gsap.to(gwGroup, { x: dx, y: dy, scale: s, duration: 0.7, ease: 'expo.inOut' });
      };

      if (logoRect && logoRect.width > 0) {
        // Escala baseada no tamanho real do logo vs letra
        const s  = logoRect.height / gCurrent.height;
        // Transform-origin = centro do gwGroup
        const ox = gwGroupRect.left + gwGroupRect.width  / 2;
        const oy = gwGroupRect.top  + gwGroupRect.height / 2;
        // G deve pousar na posição exata do logo
        const dx = logoRect.left - ox - s * (gCurrent.left - ox);
        const dy = (logoRect.top + logoRect.height / 2) - oy
                   - s * (gCurrent.top + gCurrent.height / 2 - oy);
        doFly(dx, dy, s);
      } else {
        doFly(
          -(gwGroupRect.left + gwGroupRect.width  / 2) + 50,
          -(gwGroupRect.top  + gwGroupRect.height / 2) + 28,
          0.2,
        );
      }
    }, '+=0.3');

    // FASE 6 — overlay some (começa 0.2s após fase 5, termina junto com o voo)
    tl.to(overlay, {
      opacity: 0,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.inOut',
      onComplete: () => onComplete(),
    });

    return () => tl.kill();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={overlayRef} className={styles.overlay}>
      {/* Orbe de glow centralizado — aparece no momento da junção */}
      <div ref={glowRef} className={styles.glowBurst} aria-hidden="true" />

      <div ref={gwGroupRef} className={styles.gwGroup}>
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
