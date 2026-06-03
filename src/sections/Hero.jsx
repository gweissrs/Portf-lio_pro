import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';
import WAVES from 'vanta/dist/vanta.waves.min';
import { BootSequence } from '../components/ui/BootSequence';
import { Button } from '../components/ui/Button';
import styles from './Hero.module.css';

export function Hero() {
  const [bootDone, setBootDone] = useState(false);

  const sectionRef   = useRef(null);
  const vantaRef     = useRef(null);
  const vantaEffect  = useRef(null);
  const badgeRef     = useRef(null);
  const nameRef      = useRef(null);
  const jobTitleRef  = useRef(null);
  const locationRef  = useRef(null);
  const phraseRef    = useRef(null);
  const ctasRef      = useRef(null);
  const scrollRef    = useRef(null);

  // Vanta WAVES — inicializa uma vez, destrói no unmount
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = WAVES({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x0a0a1a,
        shininess: 35.00,
        waveHeight: 18.00,
        waveSpeed: 0.60,
        zoom: 0.85,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
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

      tl.to(badgeRef.current,   { opacity: 1, y: 0, duration: 0.6 })
        .to(words,              { yPercent: 0, duration: 0.8, stagger: 0.08 }, '-=0.2')
        .to(jobTitleRef.current,{ opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(locationRef.current,{ opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(phraseRef.current,  { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(ctasRef.current,    { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
        .to(scrollRef.current,  { opacity: 0.5, y: 0, duration: 0.6 }, '-=0.2')
        .to(scrollRef.current,  {
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
      {!bootDone && <BootSequence onComplete={() => setBootDone(true)} />}

      <section ref={sectionRef} id="hero" className={styles.hero} aria-label="Início">

        {/* Vanta WAVES — fundo animado WebGL */}
        <div
          ref={vantaRef}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
          aria-hidden="true"
        />

        {/* Grain filmístico sobre o Vanta */}
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
