import { useRef, useEffect } from 'react'

const LINE_CONFIGS = [
  {
    endXRatio: 1.0, endYRatio: 1.05,
    amplitude: 22,  speed: 1.0,  phase: 0,
    lineWidth: 1.8,
    colorCenter: '#ffffff', colorEdge: '#06B6D4',
    glowColor:   '#06B6D4', opacity: 0.90,
  },
  {
    endXRatio: 1.0, endYRatio: 1.10,
    amplitude: 14,  speed: 0.7,  phase: 0.9,
    lineWidth: 1.0,
    colorCenter: '#06B6D4', colorEdge: '#0891B2',
    glowColor:   '#0891B2', opacity: 0.45,
  },
  {
    endXRatio: 1.0, endYRatio: 1.15,
    amplitude: 8,   speed: 0.5,  phase: 1.8,
    lineWidth: 0.6,
    colorCenter: '#67E8F9', colorEdge: '#E0F2FE',
    glowColor:   '#67E8F9', opacity: 0.22,
  },
]

const N_PTS = 100

const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  lineIdx:   i % 3,
  tRatio:    Math.random(),
  phase:     Math.random() * Math.PI * 2,
  glowPhase: Math.random() * Math.PI * 2,
  radius:    0.7 + Math.random() * 1.1,
  color:     ['#ffffff', '#06B6D4', '#93C5FD'][Math.floor(Math.random() * 3)],
  dispX: 0, dispY: 0,
}))

function buildSmoothPath(ctx, points) {
  if (points.length < 2) return
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY)
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
}

export function ContactLines({ mousePos, ctaHovering }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let time = 0
    let currentAmpMult = 1.0
    let prevAmpMult    = 1.0
    let cachedRect     = { left: 0, top: 0 }
    let isVisible      = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = (canvas.offsetWidth  || 600) * dpr
      canvas.height = (canvas.offsetHeight || 400) * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cachedRect = canvas.getBoundingClientRect()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible && !animId) {
        animId = requestAnimationFrame(draw)
      } else if (!isVisible && animId) {
        cancelAnimationFrame(animId)
        animId = null
      }
    }, { threshold: 0 })
    io.observe(canvas)

    function getLinePoints(cfg, w, h, ampMult) {
      // Lines start at the lower-left of the canvas and sweep right along the bottom
      const sx = 0, sy = h * 0.75
      const ex = cfg.endXRatio * w
      const ey = cfg.endYRatio * h

      const dx = ex - sx, dy = ey - sy
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len   // perpendicular unit vector
      const ny =  dx / len

      const points = []
      for (let i = 0; i <= N_PTS; i++) {
        const t = i / N_PTS
        const px = sx + t * dx
        const py = sy + t * dy
        // wave tapers at origin (clean start at corner)
        const taper = t < 0.18 ? t / 0.18 : 1.0
        const wave  = Math.sin(t * Math.PI * 3.5 + time * cfg.speed + cfg.phase) * cfg.amplitude * ampMult * taper
        points.push({ x: px + nx * wave, y: py + ny * wave, t })
      }
      return points
    }

    const GLOW_LAYERS = [
      { blurPx: 16, widthMult: 12, alphaMult: 0.05 },
      { blurPx: 10, widthMult:  7, alphaMult: 0.09 },
      { blurPx:  5, widthMult:  4, alphaMult: 0.16 },
      { blurPx:  2, widthMult:  2, alphaMult: 0.28 },
    ]

    function draw() {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Convert viewport mouse coords to canvas-local coords (rect cached in ResizeObserver)
      const mx = (mousePos?.current?.x ?? -9999) - cachedRect.left
      const my = (mousePos?.current?.y ?? -9999) - cachedRect.top

      // Amplitude boost on CTA hover — lerp like HolographicLine
      const isCtaHover = ctaHovering?.current ?? false
      prevAmpMult    = currentAmpMult
      currentAmpMult += ((isCtaHover ? 3.2 : 1.0) - currentAmpMult) * 0.05
      const ampDelta    = Math.abs(currentAmpMult - prevAmpMult)
      const energyBoost = ampDelta > 0.01 ? Math.min(1, ampDelta / 0.1) : 0

      const linePoints = LINE_CONFIGS.map(cfg => getLinePoints(cfg, w, h, currentAmpMult))

      // Draw lines — glow passes then crisp line
      LINE_CONFIGS.forEach((cfg, li) => {
        const points = linePoints[li]
        if (points.length < 2) return

        GLOW_LAYERS.forEach((layer, gi) => {
          const effectiveAlpha = gi === GLOW_LAYERS.length - 1
            ? layer.alphaMult * (1 + energyBoost * 0.4)
            : layer.alphaMult
          ctx.save()
          ctx.globalAlpha = cfg.opacity * effectiveAlpha
          ctx.lineWidth   = cfg.lineWidth * layer.widthMult
          ctx.strokeStyle = cfg.glowColor
          ctx.filter      = `blur(${layer.blurPx}px)`
          ctx.beginPath()
          buildSmoothPath(ctx, points)
          ctx.stroke()
          ctx.filter = 'none'
          ctx.restore()
        })

        // Gradient along the line direction — visible at origin, fades at tip
        const sx = 0, sy = h * 0.75
        const ex = cfg.endXRatio * w, ey = cfg.endYRatio * h
        const grad = ctx.createLinearGradient(sx, sy, ex, ey)
        grad.addColorStop(0,    'transparent')
        grad.addColorStop(0.06, cfg.colorCenter)
        grad.addColorStop(0.80, cfg.colorEdge)
        grad.addColorStop(1,    'transparent')

        ctx.save()
        ctx.lineCap     = 'round'
        ctx.strokeStyle = grad
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1]
          const curr = points[i]
          const centerFactor = Math.max(0.3, 1 - Math.abs(curr.t - 0.35) * 1.3)
          ctx.lineWidth   = cfg.lineWidth * centerFactor
          ctx.globalAlpha = cfg.opacity
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(curr.x, curr.y)
          ctx.stroke()
        }
        ctx.restore()
      })

      // Particles — strand-anchored, repelled by mouse with slow spring return
      for (const p of PARTICLES) {
        const cfg    = LINE_CONFIGS[p.lineIdx]
        const points = linePoints[p.lineIdx]
        const ptIdx  = Math.min(Math.floor(p.tRatio * N_PTS), points.length - 1)
        const home   = points[ptIdx]
        if (!home) continue

        const floatX = Math.cos(time * 8  + p.phase) * 3
        const floatY = Math.sin(time * 14 + p.phase) * 6

        let finalX = home.x + floatX + p.dispX
        let finalY = home.y + floatY + p.dispY

        const dxM  = finalX - mx
        const dyM  = finalY - my
        const dist = Math.sqrt(dxM * dxM + dyM * dyM)
        if (dist < 90 && dist > 0) {
          const force = (1 - dist / 90) * 22
          const angle = Math.atan2(dyM, dxM)
          p.dispX += Math.cos(angle) * force * 0.4
          p.dispY += Math.sin(angle) * force * 0.4
        }
        p.dispX *= 0.985
        p.dispY *= 0.985

        const glowPulse   = 0.5 + 0.5 * Math.sin(time * 6 + p.glowPhase)
        const radiusPulse = p.radius * (1 + glowPulse * 0.4)
        const fadeByT     = 0.15 + p.tRatio * 0.85
        const alpha       = cfg.opacity * (0.35 + glowPulse * 0.35) * fadeByT

        ctx.save()
        ctx.globalAlpha = Math.min(1, alpha)
        ctx.shadowBlur  = 3 + glowPulse * 5
        ctx.shadowColor = p.color
        ctx.fillStyle   = p.color
        ctx.beginPath()
        ctx.arc(finalX, finalY, radiusPulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      time += 0.003
      if (isVisible) animId = requestAnimationFrame(draw)
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
      ro.disconnect()
      io.disconnect()
    }
  }, [mousePos])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
