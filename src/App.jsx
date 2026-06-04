import { useState } from 'react';
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
