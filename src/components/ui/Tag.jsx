import styles from './Tag.module.css';

export function Tag({ children }) {
  return <span className={styles.tag}>{children}</span>;
}
