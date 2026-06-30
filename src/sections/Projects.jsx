import { useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { projects } from '../data/projects'
import { playProjectTransition, playProjectEntrance } from '../components/ui/ProjectTransition'
import { getLenis } from '../lib/lenisInstance'
import { saveProjectScroll } from '../lib/scrollRestore'
import styles from './Projects.module.css'

export function Projects() {
  const sectionRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useLayoutEffect(() => {
    if (!location.state?.fromProject) return
    playProjectEntrance()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('cursor:preview', {
        detail: { active: false, image: null }
      }))
      document.querySelectorAll('[data-blade="transition"]').forEach(el => el.remove())
      const main = document.querySelector('main')
      if (main) {
        main.style.opacity = ''
        main.style.clipPath = ''
      }
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reveals = sectionRef.current.querySelectorAll('[data-reveal]')
      reveals.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 40 })
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: 1.0,
          ease: 'expo.out',
          delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleEnter = useCallback((project) => {
    window.dispatchEvent(new CustomEvent('cursor:preview', {
      detail: { active: true, image: project.image || null }
    }))
  }, [])

  const handleLeave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('cursor:preview', {
      detail: { active: false, image: null }
    }))
  }, [])

  const handleProjectClick = useCallback((e, project) => {
    e.preventDefault()
    const lenis = getLenis()
    saveProjectScroll(lenis ? lenis.scroll : window.scrollY)
    const rowEl = e.currentTarget
    playProjectTransition(rowEl, () => {
      navigate(`/projetos/${project.id}`)
    })
  }, [navigate])

  return (
    <section ref={sectionRef} id="projetos" className={styles.section}>
      <div className={styles.container}>

        <div className={styles.header} data-project-header>
          <span className={styles.label} data-reveal="up" data-delay="0">Projetos</span>
          <h2 className={styles.title} data-reveal="up" data-delay="0.08">O que eu construí</h2>
        </div>

        <div className={styles.list}>
          {projects.map((project, index) => (
            <a
              key={project.id}
              href={`/projetos/${project.id}`}
              className={styles.row}
              data-project-row
              data-reveal="up"
              data-delay={String((0.16 + index * 0.08).toFixed(2))}
              onClick={(e) => handleProjectClick(e, project)}
              onMouseEnter={() => handleEnter(project)}
              onMouseLeave={handleLeave}
            >
              <span className={styles.index} data-project-content>
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className={styles.rowContent} data-project-content>
                <h3 className={styles.projectName}>{project.name}</h3>
                <span className={styles.projectTagline}>{project.tagline}</span>
              </div>

              <div className={styles.rowMeta} data-project-content>
                <span
                  className={styles.status}
                  style={{
                    color: project.statusColor,
                    background: `${project.statusColor}14`,
                  }}
                >
                  <span
                    className={styles.statusDot}
                    style={{ background: project.statusColor }}
                  />
                  {project.status}
                </span>
                <span className={styles.arrow}>→</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
