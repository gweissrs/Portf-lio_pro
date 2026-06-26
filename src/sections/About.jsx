import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import styles from './About.module.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const splits = []

    const ctx = gsap.context(() => {

      // Sistema de reveal existente — .label, .availability
      const reveals = sectionRef.current.querySelectorAll('[data-reveal]')
      reveals.forEach((el) => {
        const type  = el.dataset.reveal
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
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      // bigStatement — cada palavra entra da esquerda, uma por vez (scrub)
      const bigLines = [...sectionRef.current.querySelectorAll('[data-big-line]')]
      gsap.set(bigLines, { x: -60, opacity: 0 })
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current.querySelector(`.${styles.bigStatement}`),
          start: 'top 85%',
          end:   'top 68%',
          scrub: true,
        },
      }).to(bigLines, {
        x:        0,
        opacity:  1,
        stagger:  0.2,
        duration: 0.5,
        ease:     'none',
      })

      // SplitText type:'lines' — cada linha entra como bloco único
      const leadEl       = sectionRef.current.querySelector(`.${styles.lead}`)
      const paragraphEls = [...sectionRef.current.querySelectorAll(`.${styles.paragraph}`)]
      const textEls      = [leadEl, ...paragraphEls]

      const splitInstances = textEls.map((el) => {
        const split = new SplitText(el, { type: 'lines' })
        splits.push(split)

        // Masking manual: overflow:hidden por linha para impedir "vazamento" visual
        // durante a transição. split.revert() restaura innerHTML original, removendo esses wrappers.
        split.lines.forEach(line => {
          const mask = document.createElement('div')
          mask.style.cssText = 'overflow: hidden; display: block;'
          line.parentNode.insertBefore(mask, line)
          mask.appendChild(line)
        })

        gsap.set(split.lines, { yPercent: 110, opacity: 0 })

        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end:   'top 68%',
            scrub: true,
          },
        }).to(split.lines, {
          yPercent: 0,
          opacity:  1,
          stagger:  0.15, // sequencial linha a linha, sem sobreposição
          duration: 0.5,
          ease:     'none',
        })

        return split
      })

      // Saída — narrativa sobe, bigStatement recua para a esquerda
      const orderedLines = splitInstances.flatMap(s => [...s.lines])
      const exitConfig = {
        trigger:       sectionRef.current,
        start:         'bottom 30%',
        end:           'bottom 18%',
        toggleActions: 'play none none reverse',
      }
      gsap.timeline({ scrollTrigger: exitConfig })
        .to(orderedLines, {
          yPercent: -110,
          opacity:  0,
          duration: 0.35,
          ease:     'power3.in',
          stagger:  0.04,
        })
      gsap.timeline({ scrollTrigger: exitConfig })
        .to(bigLines, {
          x:        -60,
          opacity:  0,
          duration: 0.35,
          ease:     'power3.in',
          stagger:  0.04,
        })

    }, sectionRef)

    return () => {
      ctx.revert()
      // split.revert() restaura innerHTML original, removendo spans de linha
      // E os mask divs adicionados manualmente (foram adicionados após o snapshot do SplitText)
      splits.forEach(s => s.revert())
    }
  }, [])

  return (
    <section ref={sectionRef} id="sobre" className={styles.section}>

      <div className={styles.opening} />

      <div className={styles.container}>
        <div className={styles.body}>

          {/* COLUNA 1 — Título */}
          <div className={styles.titleCol}>
            <span className={styles.label} data-big-line>
              Sobre
            </span>
            <h2 className={styles.bigStatement}>
              <span className={styles.statLine} data-big-line>Dev.</span>
              <span className={styles.statLine} data-big-line><span className={styles.accent}>Builder.</span></span>
              <span className={styles.statLine} data-big-line>17 anos.</span>
            </h2>
          </div>

          {/* COLUNA 2 — Narrativa */}
          <div className={styles.narrative}>
            <p className={styles.lead}>
              Comecei a programar em 2026. Hoje já tenho produtos reais no&#8239;ar.
            </p>
            <p className={styles.paragraph}>
              Em poucos meses saí do zero para o PayReminder
              — um sistema de cobrança automatizada que hoje
              gera receita recorrente para uma empresa real.
              Desenvolvi também a landing page do meu pai,
              que já trouxe clientes novos.
            </p>
            <p className={styles.paragraph}>
              Trabalho no Hospital Baía Sul como menor aprendiz.
              Não é tech, mas me ensinou rotina, responsabilidade
              e como ambientes profissionais funcionam de verdade.
            </p>
            <p className={styles.paragraph}>
              Uso IA como ferramenta de estudo — para pesquisar
              boas práticas, validar decisões técnicas e acelerar
              meu aprendizado. O que me motiva é resolver problemas
              reais, sempre pensando na experiência de quem vai usar.
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
