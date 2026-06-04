import { useState, useEffect } from 'react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import personal from '../../data/personal';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'skills', label: 'Skills' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'contato', label: 'Contato' },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.id);

export function Navbar({ isBooting = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.solid : ''}`}
      role="banner"
      style={{
        opacity: isBooting ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: isBooting ? 'none' : 'auto',
      }}
    >
      <nav className={styles.nav} aria-label="Navegação principal">
        <a
          href="#hero"
          className={styles.logo}
          data-logo
          aria-label="Ir para o início"
          style={{ opacity: isBooting ? 0 : 1, transition: 'opacity 0.4s ease' }}
        >
          GW
        </a>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`} role="list">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`${styles.link} ${activeId === id ? styles.active : ''}`}
                onClick={handleLinkClick}
                aria-current={activeId === id ? 'page' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </nav>
    </header>
  );
}
