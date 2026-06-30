import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaLinkedinIn } from 'react-icons/fa'
import { SiGithub, SiWhatsapp } from 'react-icons/si'
import { ContactLines } from '../components/ui/ContactLines'
import styles from './Contact.module.css'

const CHANNELS = [
  { icon: FaLinkedinIn, label: 'LinkedIn',  href: 'https://www.linkedin.com/in/guilherme-weiss-a996a1350', top: '38%', left: '18%' },
  { icon: SiGithub,   label: 'GitHub',    href: 'https://github.com/gweissrs',      top: '52%', left: '55%' },
  { icon: SiWhatsapp, label: 'WhatsApp',  href: 'https://wa.me/5548988251111',      top: '68%', left: '30%' },
]

export function Contact({ mousePos }) {
  const sectionRef      = useRef(null)
  const anchorRefs      = useRef([])
  const contactCtaHover = useRef(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {

      // data-reveal — padrão exato do About.jsx
      const reveals = sectionRef.current.querySelectorAll('[data-reveal]')
      reveals.forEach((el) => {
        const type  = el.dataset.reveal
        const delay = parseFloat(el.dataset.delay || 0)
        if (!prefersReduced) {
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
        }
      })

      // Links de contato entram com stagger
      const anchors = anchorRefs.current.filter(Boolean)
      if (anchors.length && !prefersReduced) {
        gsap.set(anchors, { opacity: 0, y: 30, filter: 'blur(14px)' })
        gsap.to(anchors, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.0,
          ease: 'power3.out',
          stagger: 0.15,
          clearProps: 'filter,transform',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }

    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} id="contato" className={styles.section}>

      {/* Linhas holográficas — filho direto da section, left: 0 relativo à section real */}
      <div className={styles.holographicWrap}>
        <ContactLines mousePos={mousePos} ctaHovering={contactCtaHover} />
      </div>

      <div className={styles.container}>

        {/* Frase de encerramento — topo esquerda */}
        <div className={styles.closing} data-reveal="up">
          <h2 className={styles.closingTitle} data-reveal="up" data-delay="0.08">
            O próximo projeto<br />
            <span className={styles.closingAccent}>começa com uma mensagem.</span>
          </h2>
          <p className={styles.closingSubtitle} data-reveal="up" data-delay="0.16">
            Disponível para estágio e projetos freelance.
          </p>
        </div>

        {/* Links magnéticos */}
        <div className={styles.channelRow}>
        {CHANNELS.map((channel, i) => {
          const ChannelIcon = channel.icon
          return (
          <a
            key={channel.label}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelAnchor}
            ref={el => { anchorRefs.current[i] = el }}
            onMouseEnter={() => {
              contactCtaHover.current = true
              window.dispatchEvent(new CustomEvent('cursor:preview', {
                detail: { active: true, label: 'visitar' }
              }))
            }}
            onMouseLeave={() => {
              contactCtaHover.current = false
              window.dispatchEvent(new CustomEvent('cursor:preview', {
                detail: { active: false }
              }))
            }}
          >
            <span className={styles.channelHitbox} />
            <span className={styles.channelText}>
              {channel.label}
              <span className={styles.channelArrow} aria-hidden="true">↗</span>
            </span>
            <ChannelIcon className={styles.channelIcon} aria-hidden="true" />
          </a>
          )
        })}
        </div>

      </div>
    </section>
  )
}
