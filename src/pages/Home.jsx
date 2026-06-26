import { motion } from 'framer-motion'
import { Hero } from '../sections/Hero'
import { About } from '../sections/About'
import { Projects } from '../sections/Projects'
import { Skills } from '../sections/Skills'
import { Experience } from '../sections/Experience'
import { Showcase } from '../sections/Showcase'
import { Contact } from '../sections/Contact'

export function Home({ onBootComplete, revealProgress, mousePos }) {
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
      <Showcase />
      <Contact />
    </motion.main>
  )
}
