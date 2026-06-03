import { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { Experience } from './sections/Experience';
import { Showcase } from './sections/Showcase';
import { Contact } from './sections/Contact';

export default function App() {
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Navbar isBooting={!bootDone} />
      <main>
        <Hero onBootComplete={() => setBootDone(true)} />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Showcase />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
