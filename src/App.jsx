import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { Experience } from './sections/Experience';
import { Showcase } from './sections/Showcase';
import { Contact } from './sections/Contact';
import { GlobalBackground } from './components/ui/GlobalBackground';
import { CustomCursor } from './components/ui/CustomCursor';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const mousePos       = useRef(null);
  const revealProgress = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <GlobalBackground />
      <Navbar isBooting={!bootDone} />
      <main>
        <Hero
          onBootComplete={() => setBootDone(true)}
          revealProgress={revealProgress}
          mousePos={mousePos}
        />
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
