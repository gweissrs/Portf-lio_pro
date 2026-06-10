export function GlobalBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#0A0A0A',
      }}
    >
      {/* Orbe ciano central */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1000px',
        height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Orbe ciano superior esquerdo */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
