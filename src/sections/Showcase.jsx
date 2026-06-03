import styles from './Showcase.module.css';

// Showcase: carrossel 3D cinematográfico com perspectiva CSS
// Card central: escala 1, laterais: escala 0.85, opacidade 0.5, rotateY ±35deg
// Navegação por setas + clique, dots de posição, efeito de reflexo
// Fundo com gradiente radial ciano ativado por scroll
// Mobile: carrossel linear com swipe, sem perspectiva 3D
// IMPLEMENTAR APENAS NO PROMPT DEDICADO AO SHOWCASE
export function Showcase() {
  return (
    <section id="showcase" className={styles.showcase}>
      <p className={styles.placeholder}>Seção Showcase — será implementada em prompt dedicado</p>
    </section>
  );
}
