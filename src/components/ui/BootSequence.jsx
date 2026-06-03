import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './BootSequence.module.css';

export function BootSequence({ onComplete }) {
  const overlayRef  = useRef(null);
  const introRef    = useRef(null);
  const gwGroupRef  = useRef(null);
  const gRef        = useRef(null);
  const uRef        = useRef(null);
  const wRef        = useRef(null);
  const eRef        = useRef(null);

  useEffect(() => {
    const introEl = introRef.current;
    const gEl     = gRef.current;
    const wEl     = wRef.current;
    const uEl     = uRef.current;
    const eEl     = eRef.current;
    const gwGroup = gwGroupRef.current;
    const overlay = overlayRef.current;

    if (!introEl || !gEl || !wEl || !gwGroup || !overlay) return;

    // Captura posições iniciais antes de qualquer transform
    const gRect0 = gEl.getBoundingClientRect();
    const wRect0 = wEl.getBoundingClientRect();
    const gap    = wRect0.left - gRect0.right;
    const moveX  = gap / 2 + 4;

    gsap.set(introEl, { opacity: 0 });
    gsap.set([gEl, uEl, wEl, eEl], { opacity: 0, x: 0, y: 0 });

    const tl = gsap.timeline();

    // Intro — texto de boas-vindas aparece
    tl.to(introEl, { opacity: 1, duration: 0.8, ease: 'expo.out' });

    // Intro some após 1.2s de pausa
    tl.to(introEl, { opacity: 0, duration: 0.5, ease: 'expo.in' }, '+=1.2');

    // Fase 1 — Nome aparece
    tl.to([gEl, uEl, wEl, eEl], {
      opacity: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: 'expo.out',
    });

    // Fase 2 — Sufixos somem após 0.6s
    tl.to([uEl, eEl], {
      opacity: 0,
      x: 20,
      duration: 0.5,
      ease: 'expo.in',
    }, '+=0.6');

    // Fase 3 — G e W se aproximam formando GW
    tl.to(gEl, { x: moveX,  duration: 0.5, ease: 'expo.inOut' }, '-=0.1');
    tl.to(wEl, { x: -moveX, duration: 0.5, ease: 'expo.inOut' }, '<');

    // Fase 4 — GW voa para o logo da Navbar
    tl.add(() => {
      const gCurrent    = gEl.getBoundingClientRect();
      const gwGroupRect = gwGroup.getBoundingClientRect();
      const logoEl      = document.querySelector('[data-logo]');
      const logoRect    = logoEl?.getBoundingClientRect();

      const doFly = (dx, dy, s) => {
        gsap.to(gwGroup, {
          x: dx, y: dy, scale: s,
          duration: 0.7,
          ease: 'expo.inOut',
          onComplete: () => {
            // Fase 5 — Overlay some
            gsap.to(overlay, {
              opacity: 0,
              duration: 0.45,
              ease: 'power2.inOut',
              onComplete: () => onComplete(),
            });
          },
        });
      };

      if (logoRect && logoRect.width > 0) {
        const s  = logoRect.height / gCurrent.height;
        const ox = gwGroupRect.left + gwGroupRect.width  / 2;
        const oy = gwGroupRect.top  + gwGroupRect.height / 2;
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
    });

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <p ref={introRef} className={styles.intro}>
        Welcome to Guilherme Weiss&apos;s portfolio.
      </p>
      <div className={styles.nameWrap}>
        <div ref={gwGroupRef} className={styles.gwGroup}>
          <span ref={gRef} className={styles.letter}>G</span>
          <span ref={uRef} className={styles.suffix}>uilherme</span>
          <span className={styles.space} aria-hidden="true" />
          <span ref={wRef} className={styles.letter}>W</span>
          <span ref={eRef} className={styles.suffix}>eiss</span>
        </div>
      </div>
    </div>
  );
}
