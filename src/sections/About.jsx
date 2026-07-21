import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import styles from './About.module.css'

gsap.registerPlugin(SplitText)

export function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const splits = []
    let mounted = true

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
      // Wrapped in fonts.ready so SplitText measures correctly after web fonts load
      document.fonts.ready.then(() => {
        if (!mounted) return

        const leadEl       = sectionRef.current?.querySelector(`.${styles.lead}`)
        const paragraphEls = [...(sectionRef.current?.querySelectorAll(`.${styles.paragraph}`) || [])]
        const textEls      = [leadEl, ...paragraphEls].filter(Boolean)

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
            stagger:  0.15,
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
          .to(bigLines, {
            x:        -60,
            opacity:  0,
            duration: 0.35,
            ease:     'power3.in',
            stagger:  0.04,
          }, 0)
      })

    }, sectionRef)

    return () => {
      mounted = false
      ctx.revert()
      // split.revert() restaura innerHTML original, removendo spans de linha
      // E os mask divs adicionados manualmente (foram adicionados após o snapshot do SplitText)
      splits.forEach(s => s.revert())
    }
  }, [])

  return (
    <section ref={sectionRef} id="sobre" className={styles.section}>

      <div className={styles.container}>
        <div className={styles.body}>

          {/* COLUNA 1 — Título */}
          <div className={styles.titleCol}>
            <span className={styles.label} data-big-line>
              Sobre
            </span>
            <h2 className={styles.bigStatement}>
              <span className={styles.statLine} data-big-line>Analista.</span>
              <span className={styles.statLine} data-big-line><span className={styles.accent}>Builder.</span></span>
              <span className={styles.statLine} data-big-line>Em formação.</span>
            </h2>
          </div>

          {/* COLUNA 2 — Narrativa */}
          <div className={styles.narrative}>
            <p className={styles.lead}>
              Comecei pela tecnologia. Fiquei pelo problema de&#8239;negócio.
            </p>
            <p className={styles.paragraph}>
              O que me motivou nos projetos da Coana nunca foi o
              código. Foi entender como a empresa funcionava, onde
              o processo quebrava e o que precisaria mudar para
              funcionar melhor. Desenvolvimento foi o caminho.
              Análise foi o destino.
            </p>
            <p className={styles.paragraph}>
              No Hospital Baía Sul aprendi o que significa operar
              dentro de um processo crítico. Cada entrada de dado,
              cada pedido de suprimento tem consequência real. Foi
              o primeiro ambiente onde entendi que dados incorretos
              custam mais do que dados atrasados.
            </p>
            <p className={styles.paragraph}>
              Uso IA como ferramenta de análise: pesquiso como
              outros já resolveram o mesmo problema, mapeio os
              trade-offs e testo decisões antes de implementar.
              O que me motiva não é construir, é resolver.
              Construir é a consequência.
            </p>
          </div>

        </div>
      </div>

    </section>
  )
}
