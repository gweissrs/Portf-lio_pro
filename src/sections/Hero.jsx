import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { HolographicLine } from '../components/ui/HolographicLine';
import { BootSequence } from '../components/ui/BootSequence';
import { ShinyText } from '../components/ui/ShinyText';
import { Button } from '../components/ui/Button';
import styles from './Hero.module.css';

gsap.registerPlugin(SplitText);

export function Hero({ onBootComplete, revealProgress, mousePos }) {
  const [bootDone, setBootDone] = useState(false);

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
        duration: 3.0,
        ease: 'power1.inOut',
        delay: 0.3,
        onComplete: () => {
          onBootComplete?.();
          gsap.set(contentEl, { opacity: 1 });

          const tl = gsap.timeline();

          // 1. NOME — Typewriter primeiro
          tl.add(() => {
            gsap.set(nameRef.current, { opacity: 1 });
            nameRef.current.textContent = '';

            const cursor = document.createElement('span');
            cursor.textContent = '|';
            cursor.style.cssText = `
              color: #06B6D4;
              font-weight: 300;
              animation: cursorBlink 0.7s step-end infinite;
              margin-left: 2px;
            `;
            nameRef.current.appendChild(cursor);

            if (!document.getElementById('cursor-style')) {
              const style = document.createElement('style');
              style.id = 'cursor-style';
              style.textContent = `
                @keyframes cursorBlink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0; }
                }
              `;
              document.head.appendChild(style);
            }

            const fullName = 'Guilherme Weiss';
            let charIndex = 0;
            const typeSpeed = 80;

            const typeNext = () => {
              if (!nameRef.current) return;
              if (charIndex < fullName.length) {
                const char = document.createTextNode(fullName[charIndex]);
                nameRef.current.insertBefore(char, cursor);
                charIndex++;
                setTimeout(typeNext, typeSpeed);
              } else {
                setTimeout(() => {
                  gsap.to(cursor, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => cursor.remove(),
                  });
                }, 800);
              }
            };

            setTimeout(typeNext, 200);
          });
          // Aguardar typewriter: 200ms delay + 15 chars × 80ms + 800ms cursor fade
          tl.to({}, { duration: 2.2 });

          // 2. JOB TITLE — letter-spacing collapse
          tl.fromTo(jobTitleRef.current,
            { opacity: 0, letterSpacing: '0.5em', filter: 'blur(4px)' },
            { opacity: 1, letterSpacing: '0.01em', filter: 'blur(0px)', duration: 1.0, ease: 'power4.out' }
          );

          // 3. BADGE — sobe de baixo, simultâneo com jobTitle
          tl.fromTo(badgeRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            '<'
          );

          // 4. LOCATION — clip-path da esquerda para direita
          tl.fromTo(locationRef.current,
            { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power3.inOut' },
            '-=0.3'
          );

          // 5. PHRASE — scale + blur reveal
          tl.fromTo(phraseRef.current,
            { opacity: 0, scale: 1.04, filter: 'blur(6px)', y: 8 },
            { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.9, ease: 'power2.out' },
            '-=0.3'
          );

          // 6. CTAs — stagger com back.out
          tl.set(ctasRef.current, { opacity: 1, y: 0 });
          const ctaButtons = ctasRef.current?.children;
          if (ctaButtons?.length) {
            tl.fromTo(ctaButtons,
              { opacity: 0, y: 24, scale: 0.88 },
              { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)' },
              '-=0.3'
            );
          }

          // 7. SCROLL INDICATOR — fade + bounce infinito
          tl.fromTo(scrollRef.current,
            { opacity: 0, y: -10 },
            {
              opacity: 0.5, y: 0, duration: 0.8, ease: 'power2.out',
              onComplete: () => {
                gsap.to(scrollRef.current, {
                  y: 9, repeat: -1, yoyo: true, duration: 1.1, ease: 'sine.inOut',
                });
              },
            },
            '-=0.2'
          );
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bootDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!bootDone && (
        <BootSequence onComplete={() => setBootDone(true)} />
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
            Desenvolvedor Full Stack
          </p>

          <p ref={locationRef} className={styles.location}>
            Florianópolis · Projetos em produção · Open to work
          </p>

          <p ref={phraseRef} className={styles.phrase}>
            Construo produtos reais. Pronto para o primeiro estágio.
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
