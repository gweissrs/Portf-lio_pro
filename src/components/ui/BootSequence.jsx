import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './BootSequence.module.css';

const LINES = [
  { text: 'Initializing systems...', delay: 0,    speed: 38, cyan: false },
  { text: 'Loading modules...',      delay: 1100,  speed: 32, cyan: false },
  { text: 'AI systems online.',      delay: 2000,  speed: 28, cyan: true  },
];

function useTypewriter(text, speed, startDelay, active) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!active) return;
    let i = 0;
    setDisplayed('');
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [active, text, speed, startDelay]);

  return displayed;
}

function TypeLine({ text, speed, delay, cyan, active }) {
  const displayed = useTypewriter(text, speed, delay, active);
  const done = displayed.length === text.length;

  return (
    <div className={styles.line}>
      <span className={cyan ? styles.cyan : styles.muted}>{displayed}</span>
      {!done && displayed.length > 0 && (
        <span className={styles.cursor} aria-hidden="true">|</span>
      )}
    </div>
  );
}

export function BootSequence({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Após todas as linhas digitarem (~3s), faz fade out
    const totalDuration =
      LINES[LINES.length - 1].delay +
      LINES[LINES.length - 1].text.length * LINES[LINES.length - 1].speed +
      600; // pausa final

    const timer = setTimeout(() => {
      gsap.to(wrapperRef.current, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          setVisible(false);
          onComplete();
        },
      });
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className={styles.wrapper} aria-live="polite">
      <div className={styles.terminal}>
        <div className={styles.header}>
          <span className={styles.dot} style={{ background: '#FF5F57' }} />
          <span className={styles.dot} style={{ background: '#FFBD2E' }} />
          <span className={styles.dot} style={{ background: '#28C840' }} />
        </div>
        <div className={styles.body}>
          {LINES.map((line, i) => (
            <TypeLine key={i} {...line} active={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
