import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  SiReact, SiJavascript, SiHtml5, SiCss, SiVite,
  SiNodedotjs, SiExpress, SiPostgresql, SiGit,
  SiRailway, SiNetlify, SiVercel, SiMysql, SiPrisma,
} from 'react-icons/si'
import styles from './Skills.module.css'


const TECH_ICONS = {
  'React':                      SiReact,
  'JavaScript':                 SiJavascript,
  'HTML':                       SiHtml5,
  'CSS':                        SiCss,
  'Vite':                       SiVite,
  'Node.js':                    SiNodedotjs,
  'Express':                    SiExpress,
  'PostgreSQL':                 SiPostgresql,
  'PgAdmin':                    SiPostgresql,
  'Git':                        SiGit,
  'Railway':                    SiRailway,
  'Netlify':                    SiNetlify,
  'Vercel':                     SiVercel,
  'MySQL':                      SiMysql,
  'Prisma':                     SiPrisma,
}

const CATEGORIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    tech: ['React', 'JavaScript', 'HTML', 'CSS', 'Vite'],
    context: 'Aplicado em produção no PayReminder e no Poussin Learning.',
    badge: null,
  },
  {
    id: 'backend',
    label: 'Backend & Dados',
    tech: ['Node.js', 'Express', 'PostgreSQL', 'PgAdmin', 'Prisma', 'Git'],
    context: 'Stack completo aplicado em produção no SmartNotes, da modelagem do banco à API.',
    badge: null,
  },
  {
    id: 'deploy',
    label: 'Deploy & Infra',
    tech: ['Railway', 'Netlify', 'Vercel'],
    context: 'Deploy real do SmartNotes em produção (Netlify + Railway).',
    badge: null,
  },
  {
    id: 'process',
    label: 'Processo & Produto',
    tech: ['Modelagem de sistema (UML/ER)', 'Levantamento de requisitos', 'Boas práticas de UX', 'Scrum', 'MySQL'],
    context: 'Base formal do curso técnico em TI (SESI SENAI), aplicada em projetos acadêmicos.',
    badge: 'Formação',
  },
]

export function Skills() {
  const [activeCategory, setActiveCategory] = useState(0)
  const sectionRef = useRef(null)
  const prefersReduced = useReducedMotion()

  // Entrada da seção via sistema data-reveal existente (mesmo padrão de About.jsx)
  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionRef.current.querySelectorAll('[data-reveal]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay || 0)
        gsap.set(el, { opacity: 0, y: 50 })
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: 1.0,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const active = CATEGORIES[activeCategory]

  const motionProps = prefersReduced
    ? {}
    : {
        initial:    { opacity: 0, filter: 'blur(8px)' },
        animate:    { opacity: 1, filter: 'blur(0px)' },
        exit:       { opacity: 0, filter: 'blur(8px)' },
        transition: { duration: 0.35, ease: 'easeOut' },
      }

  return (
    <section ref={sectionRef} id="skills" className={styles.section}>
      <div className={styles.container}>

        <span className={styles.label} data-reveal="up" data-delay="0">
          Skills
        </span>
        <h2 className={styles.title} data-reveal="up" data-delay="0.08">
          Stack em uso
        </h2>

        <div className={styles.tabsBlock} data-reveal="up" data-delay="0.16">

          {/* Abas */}
          <div className={styles.tabs} role="tablist" aria-label="Categorias de habilidades">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${cat.id}`}
                aria-selected={activeCategory === i}
                aria-controls={`panel-${cat.id}`}
                className={`${styles.tab} ${activeCategory === i ? styles.tabActive : ''}`}
                onClick={() => setActiveCategory(i)}
              >
                <span className={styles.tabLabel}>{cat.label}</span>
                {cat.badge && (
                  <span className={styles.badge}>{cat.badge}</span>
                )}
                {activeCategory === i && (
                  prefersReduced
                    ? <div className={styles.activeIndicator} />
                    : <motion.div
                        className={styles.activeIndicator}
                        layoutId="skillsTabIndicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                )}
              </button>
            ))}
          </div>

          {/* Conteúdo — fade+blur na troca */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              id={`panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${active.id}`}
              className={styles.panel}
              {...motionProps}
            >
              <p className={styles.context}>{active.context}</p>
              <div className={styles.techGrid}>
                {active.tech.map((item) => {
                  const Icon = TECH_ICONS[item]
                  return (
                    <span key={item} className={styles.techTag}>
                      {Icon && <Icon className={styles.techIcon} aria-hidden="true" />}
                      {item}
                    </span>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  )
}
