import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLenis } from '../lib/lenisInstance'
import { peekProjectScroll, clearProjectScroll } from '../lib/scrollRestore'
import { Hero } from '../sections/Hero'
import { About } from '../sections/About'
import { Projects } from '../sections/Projects'
import { Skills } from '../sections/Skills'
import { Experience } from '../sections/Experience'
import { Contact } from '../sections/Contact'

export function Home({ onBootComplete, revealProgress, mousePos }) {
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.fromProject) return
    const y = peekProjectScroll()
    if (y === null) return
    const timer = setTimeout(() => {
      clearProjectScroll()
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(y, { immediate: true })
      } else {
        window.scrollTo(0, y)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.main
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Hero
        onBootComplete={onBootComplete}
        revealProgress={revealProgress}
        mousePos={mousePos}
      />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact mousePos={mousePos} />
    </motion.main>
  )
}
