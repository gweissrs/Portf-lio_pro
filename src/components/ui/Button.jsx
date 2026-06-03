import styles from './Button.module.css';

export function Button({ variant = 'primary', href, onClick, children, target, rel, ...rest }) {
  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    return (
      <a
        href={href}
        className={className}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
