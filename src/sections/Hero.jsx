import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { HolographicLine } from '../components/ui/HolographicLine';
import { BootSequence } from '../components/ui/BootSequence';
import { Button } from '../components/ui/Button';
import styles from './Hero.module.css';

export function Hero({ onBootComplete }) {
  const [bootDone, setBootDone] = useState(false);

  const sectionRef  = useRef(null);
  const mousePos    = useRef(null);
  const badgeRef    = useRef(null);
  const nameRef     = useRef(null);
  const jobTitleRef = useRef(null);
  const locationRef = useRef(null);
  const phraseRef   = useRef(null);
  const ctasRef     = useRef(null);
  const scrollRef   = useRef(null);

  // Mouse tracking para reatividade da linha holográfica
  useEffect(() => {
    const handler = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Animações de entrada GSAP — disparam após BootSequence terminar
  useEffect(() => {
    if (!bootDone) return;

    const ctx = gsap.context(() => {
      const words = nameRef.current?.querySelectorAll(`.${styles.word}`);

      gsap.set(
        [badgeRef.current, jobTitleRef.current, locationRef.current,
         phraseRef.current, ctasRef.current, scrollRef.current],
        { opacity: 0, y: 20 }
      );
      gsap.set(badgeRef.current, { y: -14 });
      if (words) gsap.set(words, { yPercent: 100 });

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.to(badgeRef.current,    { opacity: 1, y: 0, duration: 0.6 })
        .to(words,               { yPercent: 0, duration: 0.8, stagger: 0.08 }, '-=0.2')
        .to(jobTitleRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(locationRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(phraseRef.current,   { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(ctasRef.current,     { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
        .to(scrollRef.current,   { opacity: 0.5, y: 0, duration: 0.6 }, '-=0.2')
        .to(scrollRef.current,   {
          y: 7,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          ease: 'sine.inOut',
        });
    }, sectionRef);

    return () => ctx.revert();
  }, [bootDone]);

  return (
    <>
      {!bootDone && (
        <BootSequence onComplete={() => {
          setBootDone(true);
          onBootComplete?.();
        }} />
      )}

      <section ref={sectionRef} id="hero" className={styles.hero} aria-label="Início">

        <HolographicLine mousePos={mousePos} />

        {/* Grain filmístico */}
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.content}>
          <div ref={badgeRef} className={styles.badge}>
            <span className={styles.dot} aria-hidden="true" />
            Disponível para estágio
          </div>

          <h1 ref={nameRef} className={styles.name}>
            <span className={styles.wordWrap}>
              <span className={styles.word}>Guilherme</span>
            </span>
            {' '}
            <span className={styles.wordWrap}>
              <span className={styles.word}>Weiss</span>
            </span>
          </h1>

          <p ref={jobTitleRef} className={styles.jobTitle}>
            Desenvolvedor Front-end
          </p>

          <p ref={locationRef} className={styles.location}>
            Florianópolis, SC — buscando estágio em tech
          </p>

          <p ref={phraseRef} className={styles.phrase}>
            Construo interfaces que resolvem problemas reais.
          </p>

          <div ref={ctasRef} className={styles.ctas}>
            <Button variant="primary" href="#projetos" aria-label="Ver meus projetos">
              Ver projetos
            </Button>
            <Button
              variant="outline"
              href="/cv-guilherme-weiss.pdf"
              target="_blank"
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
