import { useRef } from 'react';
import styles from './EntryScreen.module.css';

export function EntryScreen({ onEnter }) {
  const btnRef = useRef(null);

  const handleEnter = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      // Silent buffer to unlock AudioContext on user gesture
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      window.__audioCtx = ctx;
    } catch (e) {
      // Audio unavailable — boot will run silently
    }
    onEnter();
  };

  return (
    <div className={styles.screen} aria-label="Tela de entrada">
      <button
        ref={btnRef}
        className={styles.btn}
        onClick={handleEnter}
        aria-label="Entrar no portfólio"
      >
        <span className={styles.label}>Entrar</span>
        <span className={styles.line} aria-hidden="true" />
      </button>
    </div>
  );
}
