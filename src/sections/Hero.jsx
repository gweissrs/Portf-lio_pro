import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { HolographicLine } from '../components/ui/HolographicLine';
import { BootSequence } from '../components/ui/BootSequence';
import { ShinyText } from '../components/ui/ShinyText';
import { Button } from '../components/ui/Button';
import styles from './Hero.module.css';

gsap.registerPlugin(SplitText);

// Persiste entre navegações SPA sem resetar no refresh
let _heroHasRendered = false;

export function Hero({ onBootComplete, revealProgress, mousePos }) {
  const [bootDone, setBootDone] = useState(() => sessionStorage.getItem('bootDone') === 'true');
  const isFirstRender = useRef(!_heroHasRendered);

  const sectionRef   = useRef(null);
  const badgeRef     = useRef(null);
  const nameRef      = useRef(null);
  const jobTitleRef  = useRef(null);
  const locationRef  = useRef(null);
  const phraseRef    = useRef(null);
  const ctasRef      = useRef(null);
  const scrollRef    = useRef(null);
  const ctaHovering  = useRef(false);

  useEffect(() => {
    _heroHasRendered = true;
  }, []);

  useEffect(() => {
    const ctaEl = ctasRef.current;
    if (!ctaEl) return;
    const onEnter = () => { ctaHovering.current = true; };
    const onLeave = () => { ctaHovering.current = false; };
    ctaEl.addEventListener('mouseenter', onEnter);
    ctaEl.addEventListener('mouseleave', onLeave);
    return () => {
      ctaEl.removeEventListener('mouseenter', onEnter);
      ctaEl.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!bootDone) return;

    // Retornando de navegação — mostrar tudo imediatamente sem animação
    if (!isFirstRender.current) {
      revealProgress.current = 1

      const show = (el) => {
        if (!el) return
        el.style.opacity = '1'
        el.style.transform = 'none'
        el.style.filter = 'none'
        el.style.clipPath = 'none'
      }

      requestAnimationFrame(() => {
        const contentEl = sectionRef.current?.querySelector(`.${styles.content}`)
        if (contentEl) contentEl.style.opacity = '1'

        show(nameRef.current)
        show(badgeRef.current)
        show(jobTitleRef.current)
        show(locationRef.current)
        show(phraseRef.current)
        show(ctasRef.current)
        show(scrollRef.current)

        onBootComplete?.()
      })

      return
    }

    revealProgress.current = 0;

    const ctx = gsap.context(() => {
      const contentEl = sectionRef.current.querySelector(`.${styles.content}`);
      gsap.set(contentEl, { opacity: 0 });
      gsap.set(scrollRef.current, { opacity: 0 });
      gsap.set(nameRef.current, { opacity: 0 });
      gsap.set(
        [badgeRef.current, jobTitleRef.current, locationRef.current,
         phraseRef.current, ctasRef.current],
        { opacity: 0, y: 20 }
      );
      gsap.set(badgeRef.current, { y: 30 });

      // FASE 1 — linha holográfica revela completamente
      gsap.to(revealProgress, {
        current: 1,
        duration: 1.8,
        ease: 'power1.inOut',
        delay: 0.2,
        onComplete: () => {
          onBootComplete?.();
          gsap.set(contentEl, { opacity: 1 });

          // ─── Nome: blur dissolve limpo, consistente com a cascata ─────────────
          gsap.set(nameRef.current, { opacity: 1, filter: 'blur(20px)', scale: 1.015 });
          gsap.to(nameRef.current, {
            filter: 'blur(0px)', scale: 1, duration: 0.65, ease: 'power2.out',
          });

          // ─── Cascata: posições absolutas no timeline, 0.1s de offset entre cada ─
          const tl = gsap.timeline();

          tl.fromTo(jobTitleRef.current,
            { opacity: 0, y: 16, filter: 'blur(14px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out' },
            0.08
          );

          tl.fromTo(badgeRef.current,
            { opacity: 0, y: 16, filter: 'blur(14px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out' },
            0.18
          );

          tl.fromTo(locationRef.current,
            { opacity: 1, clipPath: 'inset(0 100% 0 0)', filter: 'blur(8px)' },
            { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', duration: 0.38, ease: 'power3.inOut' },
            0.28
          );

          tl.fromTo(phraseRef.current,
            { opacity: 0, y: 16, filter: 'blur(14px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out' },
            0.38
          );

          tl.set(ctasRef.current, { opacity: 1, y: 0 }, 0.48);
          const ctaButtons = ctasRef.current?.children;
          if (ctaButtons?.length) {
            tl.fromTo(ctaButtons,
              { opacity: 0, y: 16, filter: 'blur(12px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.32, stagger: 0.08, ease: 'power2.out' },
              0.48
            );
          }

          tl.fromTo(scrollRef.current,
            { opacity: 0, filter: 'blur(8px)' },
            {
              opacity: 0.5, filter: 'blur(0px)', duration: 0.32, ease: 'power2.out',
              onComplete: () => {
                gsap.to(scrollRef.current, {
                  y: 9, repeat: -1, yoyo: true, duration: 1.1, ease: 'sine.inOut',
                });
              },
            },
            0.60
          );
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bootDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!bootDone && (
        <BootSequence onComplete={() => {
          sessionStorage.setItem('bootDone', 'true')
          setBootDone(true)
        }} />
      )}

      <section ref={sectionRef} id="hero" className={styles.hero} aria-label="Início">

        <HolographicLine mousePos={mousePos} revealProgress={revealProgress} ctaHovering={ctaHovering} />

        <div className={styles.content}>
          <div ref={badgeRef} className={styles.badge}>
            <ShinyText
              text="· Open to work · Florianópolis, SC"
              speed={5}
              className={styles.badgeShiny}
            />
          </div>

          <h1 ref={nameRef} className={styles.name}>
            Guilherme Weiss
          </h1>

          <p ref={jobTitleRef} className={styles.jobTitle}>
            Analytics & Business Intelligence
          </p>

          <p ref={locationRef} className={styles.location}>
            Florianópolis · SESI SENAI · Buscando estágio em BI
          </p>

          <p ref={phraseRef} className={styles.phrase}>
            Entendo o problema antes de construir a solução.
          </p>

          <div ref={ctasRef} className={styles.ctas}>
            <Button variant="primary" href="#projetos" aria-label="Ver meus projetos" style={{ background: '#0A1F22' }}>
              Ver projetos
            </Button>
            <Button
              variant="outline"
              href="/curriculo_gw/CV_Guilherme_Weiss.pdf"
              download="CV_Guilherme_Weiss.pdf"
              aria-label="Baixar currículo em PDF"
            >
              Baixar CV
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className={styles.scrollIndicator} aria-label="Role para baixo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
