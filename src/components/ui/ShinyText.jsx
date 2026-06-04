import './ShinyText.css';

export function ShinyText({ text, disabled = false, speed = 4, className = '' }) {
  return (
    <span
      className={`shiny-text${disabled ? ' disabled' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--shiny-speed': `${speed}s` }}
    >
      {text}
    </span>
  );
}
