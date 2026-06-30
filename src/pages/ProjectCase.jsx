import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import { getLenis } from '../lib/lenisInstance'
import styles from './ProjectCase.module.css'
import {
  SiReact, SiJavascript, SiHtml5, SiCss, SiVite,
  SiNodedotjs, SiExpress, SiPostgresql, SiGit,
  SiRailway, SiNetlify, SiVercel, SiMysql,
  SiPrisma, SiSqlite, SiFastify, SiSupabase,
  SiTypescript, SiGoogleanalytics, SiGithub,
} from 'react-icons/si'

const TECH_ICONS = {
  'HTML':             SiHtml5,
  'CSS':              SiCss,
  'JavaScript':       SiJavascript,
  'Node.js':          SiNodedotjs,
  'PostgreSQL':       SiPostgresql,
  'PgAdmin':          SiPostgresql,
  'React':            SiReact,
  'Vite':             SiVite,
  'Express':          SiExpress,
  'Git':              SiGit,
  'Railway':          SiRailway,
  'Netlify':          SiNetlify,
  'Vercel':           SiVercel,
  'MySQL':            SiMysql,
  'TypeScript':       SiTypescript,
  'Supabase':         SiSupabase,
  'Prisma':           SiPrisma,
  'SQLite':           SiSqlite,
  'Fastify':          SiFastify,
  'Google Analytics': SiGoogleanalytics,
  'JWT':              null,
  'Canvas API':       null,
  'Edge Functions':   null,
  'Resend':           null,
}

export function ProjectCase() {
  const { id } = useParams()
  const project = projects.find(p => p.id === id)
  const [activeSlide, setActiveSlide] = useState(0)
  const navigate = useNavigate()

  const handleBack = useCallback((e) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('cursor:preview', {
      detail: { active: false, image: null }
    }))
    navigate('/', { state: { fromProject: true } })
  }, [navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.dispatchEvent(new CustomEvent('cursor:preview', {
      detail: { active: false, image: null }
    }))
  }, [id])

  if (!project) {
    return (
      <div className={styles.notFound}>
        <p>Projeto não encontrado.</p>
        <Link to="/" className={styles.backLink}>← Voltar</Link>
      </div>
    )
  }

  const slides = project.gallery?.length > 0
    ? project.gallery
    : [null, null, null]

  const prevSlide = () =>
    setActiveSlide(i => (i - 1 + slides.length) % slides.length)
  const nextSlide = () =>
    setActiveSlide(i => (i + 1) % slides.length)

  return (
    <motion.article
      className={styles.case}
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className={styles.container}>

        <a href="/#projetos" onClick={handleBack} className={styles.backLink}>
          ← Todos os projetos
        </a>

        <div className={styles.split}>

          {/* Coluna esquerda — info */}
          <div className={styles.splitInfo}>
            <span className={styles.year}>{project.year}</span>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.tagline}>{project.tagline}</p>

            <div className={styles.metaRow}>
              <span
                className={styles.status}
                style={{ color: project.statusColor }}
              >
                <span
                  className={styles.statusDot}
                  style={{ background: project.statusColor }}
                />
                {project.status}
              </span>
              <span className={styles.role}>{project.role}</span>
            </div>

            <div className={styles.links}>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkPrimary}
                  data-cursor-no-expand
                >
                  Ver projeto →
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkGithub}
                >
                  <SiGithub aria-hidden="true" />
                  GitHub
                </a>
              )}
            </div>

            <div className={styles.stack}>
              {project.stack.map(tech => {
                const Icon = TECH_ICONS[tech]
                return (
                  <span key={tech} className={styles.tag}>
                    {Icon && <Icon className={styles.techIcon} aria-hidden="true" />}
                    {tech}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Coluna direita — carrossel */}
          <div className={styles.carousel}>
            <div className={styles.carouselWrapper}>

              {slides.length > 1 && (
                <button
                  onClick={prevSlide}
                  className={styles.carouselBtn}
                  aria-label="Slide anterior"
                >
                  ←
                </button>
              )}

              <div className={styles.carouselTrack}>
                {slides[activeSlide] ? (
                  slides[activeSlide].endsWith('.mp4') ? (
                    <video
                      key={slides[activeSlide]}
                      src={slides[activeSlide]}
                      className={styles.carouselImg}
                      controls
                      autoPlay={false}
                      muted
                      playsInline
                      loop
                    />
                  ) : (
                    <img
                      src={slides[activeSlide]}
                      alt={`${project.name} screenshot ${activeSlide + 1}`}
                      className={styles.carouselImg}
                    />
                  )
                ) : (
                  <div className={styles.carouselPlaceholder}>
                    <span className={styles.placeholderLabel}>
                      Screenshot em breve
                    </span>
                  </div>
                )}
              </div>

              {slides.length > 1 && (
                <button
                  onClick={nextSlide}
                  className={styles.carouselBtn}
                  aria-label="Próximo slide"
                >
                  →
                </button>
              )}

            </div>

            {slides.length > 1 && (
              <div className={styles.carouselDots}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ''}`}
                    aria-label={`Ir para slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        <div className={styles.sections}>
          <section className={styles.block}>
            <span className={styles.blockLabel}>O problema</span>
            <p className={styles.blockText}>{project.problem}</p>
          </section>
          <section className={styles.block}>
            <span className={styles.blockLabel}>O processo</span>
            <p className={styles.blockText}>{project.process}</p>
          </section>
          <section className={styles.block}>
            <span className={styles.blockLabel}>O resultado</span>
            <p className={styles.blockText}>{project.result}</p>
          </section>
          <section className={styles.block}>
            <span className={styles.blockLabel}>Desafios</span>
            <p className={styles.blockText}>{project.challenges}</p>
          </section>
        </div>

        <div className={styles.nav}>
          <a href="/" onClick={handleBack} className={styles.navBack}>
            ← Voltar para todos os projetos
          </a>
        </div>

      </div>
    </motion.article>
  )
}
