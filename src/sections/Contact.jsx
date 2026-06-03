import styles from './Contact.module.css';

// Contato: formulário com nome, email, mensagem, envio via EmailJS ou Formspree,
// links diretos para email, GitHub e LinkedIn, animação de entrada
export function Contact() {
  return (
    <section id="contato" className={styles.contact}>
      <p className={styles.placeholder}>Seção Contato — será implementada no próximo prompt</p>
    </section>
  );
}
