import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setLenis } from './lib/lenisInstance';
import { Navbar } from './components/layout/Navbar';
import { GlobalBackground } from './components/ui/GlobalBackground';
import { CustomCursor } from './components/ui/CustomCursor';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { Home } from './pages/Home';
import { ProjectCase } from './pages/ProjectCase';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const location = useLocation()
  const [bootDone, setBootDone] = useState(() => sessionStorage.getItem('bootDone') === 'true');
  const mousePos       = useRef(null);
  const revealProgress = useRef(sessionStorage.getItem('bootDone') === 'true' ? 1 : 0);

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
      smoothTouch: false,
    });

    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      setLenis(null);
      lenis.destroy();
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <CustomCursor />
      <GlobalBackground />
      <Navbar isBooting={!bootDone} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Home
                onBootComplete={() => {
                  sessionStorage.setItem('bootDone', 'true')
                  setBootDone(true)
                }}
                revealProgress={revealProgress}
                mousePos={mousePos}
              />
            }
          />
          <Route path="/projetos/:id" element={<ProjectCase />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
