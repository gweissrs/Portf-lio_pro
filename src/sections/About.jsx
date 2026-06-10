import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.css'

gsap.registerPlugin(ScrollTrigger)

export function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      const reveals = sectionRef.current.querySelectorAll('[data-reveal]')

      reveals.forEach((el) => {
        const type = el.dataset.reveal
        const delay = parseFloat(el.dataset.delay || 0)

        gsap.set(el, {
          opacity: 0,
          y: type === 'up' ? 50 : 0,
          x: type === 'left' ? -40 : 0,
        })

        gsap.to(el, {
          opacity: 1, y: 0, x: 0,
          duration: 1.0,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger: el, start: 'top 88%' }
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="sobre" className={styles.section}>

      <div className={styles.opening} />


      <div className={styles.container}>
        <div className={styles.body}>

          {/* COLUNA 1 — Título */}
          <div className={styles.titleCol}>
            <span className={styles.label} data-reveal="up" data-delay="0">
              Sobre
            </span>
            <h2 className={styles.bigStatement} data-reveal="up" data-delay="0.08">
              Dev.<br />
              <span className={styles.accent}>Builder.</span><br />
              17 anos.
            </h2>
          </div>

          {/* COLUNA 2 — Narrativa */}
          <div className={styles.narrative}>
            <p className={styles.lead} data-reveal="up" data-delay="0">
              Já tenho sistemas em produção.
            </p>
            <p className={styles.paragraph} data-reveal="up" data-delay="0.1">
              Construí o PayReminder — sistema de cobrança
              automatizada que gera receita recorrente para
              uma empresa real. Desenvolvi a landing page
              do meu pai que trouxe clientes reais.
            </p>
            <p className={styles.paragraph} data-reveal="up" data-delay="0.2">
              Trabalho no Hospital Baía Sul como menor
              aprendiz — tecnologia dentro de um hospital
              te ensina que erro tem consequência real.
            </p>
            <p className={styles.paragraph} data-reveal="up" data-delay="0.3">
              O que me move: ver algo que construí
              funcionando na vida de alguém. Não um exercício.
              Um produto real, com usuário real,
              resolvendo um problema real.
            </p>
            <div className={styles.availability} data-reveal="up" data-delay="0.42">
              <span className={styles.availDot} />
              <span className={styles.availText}>
                Disponível para estágio · Florianópolis, SC
              </span>
            </div>
          </div>


        </div>
      </div>

    </section>
  )
}
