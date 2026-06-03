import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import styles from './Hero.module.css';

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const fadeDown = (delay) => ({
  initial: { opacity: 0, y: -14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const fadeScale = (delay) => ({
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.7, ease: 'easeOut', delay },
});

export function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Início">
      <div className={styles.bgGlowLeft} aria-hidden="true" />
      <div className={styles.bgGlowRight} aria-hidden="true" />

      <div className={styles.container}>
        {/* Lado esquerdo: conteúdo textual */}
        <div className={styles.content}>
          <motion.div className={styles.badge} {...fadeDown(0.1)}>
            <span className={styles.dot} aria-hidden="true" />
            Disponível para estágio
          </motion.div>

          <motion.h1 className={styles.name} {...fadeUp(0.3)}>
            Guilherme Weiss
          </motion.h1>

          <motion.p className={styles.jobTitle} {...fadeUp(0.5)}>
            Desenvolvedor Front-end
          </motion.p>

          <motion.p className={styles.location} {...fadeUp(0.55)}>
            Florianópolis, SC — buscando estágio em tech
          </motion.p>

          <motion.p className={styles.phrase} {...fadeUp(0.7)}>
            Construo interfaces que resolvem problemas reais.
          </motion.p>

          <motion.div className={styles.ctas} {...fadeUp(0.9)}>
            <Button variant="primary" href="#projetos" aria-label="Ver meus projetos">
              Ver projetos
            </Button>
            <Button
              variant="outline"
              href="/cv-guilherme-weiss.pdf"
              target="_blank"
              aria-label="Baixar currículo em PDF"
            >
              Baixar CV
            </Button>
          </motion.div>
        </div>

        {/* Lado direito: elemento visual decorativo */}
        <motion.div className={styles.visual} aria-hidden="true" {...fadeScale(0.4)}>
          <div className={styles.visualInner}>
            <div className={`${styles.ring} ${styles.ring1}`} />
            <div className={`${styles.ring} ${styles.ring2}`} />
            <div className={`${styles.ring} ${styles.ring3}`} />
            <div className={styles.circle}>
              <div className={styles.grain} />
              <span className={styles.initials}>GW</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-label="Role para baixo para ver mais conteúdo"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
