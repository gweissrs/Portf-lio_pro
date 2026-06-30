import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Experience.module.css'


// ─── Data ─────────────────────────────────────────────────────────────────────

const ITEMS = [
  {
    id: '01', empresa: 'Coana', tipo: 'Freelance', periodo: '2026',
    papel: 'Desenvolvedor Frontend Freelance',
    entregas: [
      'PayReminder — sistema de cobrança automatizada em produção',
      'Sistema Feirao SP — B2B para Consulfarma 2026 (Anhembi, SP)',
    ],
    aprendizado: 'Quando o cliente ligou porque o sistema parou, entendi o que \'em produção\' realmente significa.',
  },
  {
    id: '02', empresa: 'SESI SENAI', tipo: 'Educação', periodo: '2024–presente',
    papel: 'Curso Técnico em TI — Integrado ao Ensino Médio',
    entregas: [
      'SmartNotes — full stack em produção (Node.js + Express + PostgreSQL)',
      'Rinha SENAI 2026 — gateway que aguentou 1000 requisições concorrentes sob stress',
    ],
    aprendizado: 'Tarefa toda semana, sistema pra entregar, prazo real. Se não funciona, não passa. O SENAI não simula pressão, ele aplica pressão.',
  },
  {
    id: '03', empresa: 'Hospital Baía Sul', tipo: 'Formal', periodo: '2025–presente',
    papel: 'Menor Aprendiz — Suprimentos / CAF',
    entregas: [
      'Operação de setor em ambiente hospitalar de alta exigência',
      'Rotina profissional paralela ao curso técnico e freelas',
    ],
    aprendizado: 'Se eu etiquetar um remédio errado, alguém se machuca. Foi o primeiro lugar onde erro não tem git revert.',
  },
  {
    id: '04', empresa: 'William Weiss', tipo: 'Freelance', periodo: '2026',
    papel: 'Desenvolvedor Web & Estratégia de Conteúdo',
    entregas: [
      'Landing page que gerou novos clientes para agente Santander PJ',
      'Estratégia de conteúdo e presença Instagram PJ',
    ],
    aprendizado: 'Quando o marketing funcionou antes do previsto, entendi que código é só o começo.',
  },
]

// ─── 3D geometry (module-level — computed once) ────────────────────────────────

const NODE_POSITIONS = [
  new THREE.Vector3(-4.80, -0.20, 0),
  new THREE.Vector3(-1.60, -0.20, 0),
  new THREE.Vector3(+1.60, -0.20, 0),
  new THREE.Vector3(+4.80, -0.20, 0),
]

const NODE_SIDES = ['bottom', 'bottom', 'bottom', 'bottom']
const NODE_LOGOS = ['coana.png', 'sesi_senai.png', 'hbs.svg', 'ww.png']

const NODE_WINDOWS = [
  { start: 0.00, end: 0.05 },
  { start: 0.30, end: 0.38 },
  { start: 0.60, end: 0.68 },
  { start: 0.90, end: 0.98 },
]

const NODE_HELIX_THRESHOLDS = [0.05, 0.35, 0.65, 0.95]

const windowProgress = (p, win) =>
  Math.max(0, Math.min(1, (p - win.start) / (win.end - win.start)))

const nodeSubProgress = (np) => ({
  ringScale:  Math.min(1, np / 0.4),
  ringDraw:   Math.max(0, Math.min(1, (np - 0.4) / 0.4)),
  logoReveal: Math.max(0, Math.min(1, (np - 0.8) / 0.2)),
})

class StrandCurve extends THREE.Curve {
  constructor(axisCurve, phase, radius, cycles) {
    super()
    this.axisCurve = axisCurve
    this.phase     = phase
    this.radius    = radius
    this.cycles    = cycles
    this.frames    = axisCurve.computeFrenetFrames(200, false)
  }
  getPoint(t) {
    const p     = this.axisCurve.getPointAt(t)
    const idx   = Math.min(Math.floor(t * 200), 200)
    const n     = this.frames.normals[idx]
    const bn    = this.frames.binormals[idx]
    const angle = t * Math.PI * 2 * this.cycles + this.phase
    const cos   = Math.cos(angle) * this.radius
    const sin   = Math.sin(angle) * this.radius
    return new THREE.Vector3(
      p.x + n.x * cos + bn.x * sin,
      p.y + n.y * cos + bn.y * sin,
      p.z + n.z * cos + bn.z * sin,
    )
  }
}

const RADIUS        = 0.15
const CYCLES        = 5
const N_PER_SEGMENT = 400

const STRAND_PHASES = [0, (2 * Math.PI / 3), (4 * Math.PI / 3)]

// Helix strand weights matched to HolographicLine visual language
const HELIX_CONFIGS = [
  { lineWidth: 1.8, colorCenter: '#ffffff', glowColor: '#06B6D4', opacity: 0.90 },
  { lineWidth: 1.0, colorCenter: '#06B6D4', glowColor: '#0891B2', opacity: 0.45 },
  { lineWidth: 0.9, colorCenter: '#93C5FD', glowColor: '#93C5FD', opacity: 0.42 },
]

const MAIN_CURVE  = new THREE.CatmullRomCurve3(NODE_POSITIONS)
const MAIN_FRAMES = MAIN_CURVE.computeFrenetFrames(N_PER_SEGMENT, false)

// ─── Particle pool (module-level — persists across renders) ───────────────────

const HELIX_PARTICLES = Array.from({ length: 50 }, () => {
  const yOffset = (Math.random() - 0.5) * 40
  return {
    tRatio:         Math.random(),
    strandIdx:      Math.floor(Math.random() * 3),
    yOffset,
    baseYOffset:    yOffset,
    currentYOffset: yOffset,
    phase:          Math.random() * Math.PI * 2,
    glowPhase:      Math.random() * Math.PI * 2,
    radius:         0.7 + Math.random() * 1.1,
    baseRadius:     0,
    color:          ['#ffffff', '#06B6D4', '#93C5FD'][Math.floor(Math.random() * 3)],
    dispX: 0, dispY: 0,
    exploding: false, explodeVx: 0, explodeVy: 0, explodeTimer: 0,
  }
})
HELIX_PARTICLES.forEach(p => { p.baseRadius = p.radius })

// ─── Helix rendering ──────────────────────────────────────────────────────────

function getHelixPoints(canvas, curve, frames, prog, phase, time = 0) {
  const w = canvas.offsetWidth
  const h = canvas.offsetHeight
  const N = Math.floor(N_PER_SEGMENT * prog)
  if (N < 2) return []

  const halfH = Math.tan((55 * Math.PI / 180) / 2) * 7
  const halfW = halfH * (w / h)

  const waveAmp = 5

  const pts = []
  for (let i = 0; i < N; i++) {
    const t     = i / 399
    const p3d   = curve.getPointAt(Math.min(t, 1))
    const idx   = Math.min(i, frames.normals.length - 1)
    const n     = frames.normals[idx]
    const bn    = frames.binormals[idx]
    const angle = t * Math.PI * 2 * CYCLES + phase
    const sx    = p3d.x + (n.x * Math.cos(angle) + bn.x * Math.sin(angle)) * RADIUS
    const sy    = p3d.y + (n.y * Math.cos(angle) + bn.y * Math.sin(angle)) * RADIUS

    const tN = N > 1 ? i / (N - 1) : 0
    let a = 1
    if (tN < 0.15)        a = Math.pow(tN / 0.15, 0.4)
    else if (i >= N - 16) a = Math.max(0, Math.pow(1 - (i - (N - 16)) / 16, 0.5))
    else if (tN > 0.92 && prog >= 1) a = Math.pow((1 - tN) / 0.08, 0.5)

    const y     = (1 - sy / halfH) / 2 * h
    const waveY = y + Math.sin(t * Math.PI * 3 + time * 0.7 + phase) * waveAmp

    pts.push({
      x: (sx / halfW + 1) / 2 * w,
      y: waveY,
      a,
    })
  }
  return pts
}

function strokePath(ctx, pts, strokeStyle, lineWidth, globalAlpha) {
  if (!pts || pts.length < 2) return
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth   = lineWidth
  ctx.globalAlpha = globalAlpha
  ctx.lineCap     = 'round'
  ctx.beginPath()
  pts.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.stroke()
}

function drawAllHelices(ctx, canvas, helixProgress, time = 0, mousePos = { x: -9999, y: -9999 }) {
  const w = canvas.offsetWidth
  const h = canvas.offsetHeight
  ctx.clearRect(0, 0, w, h)

  if (helixProgress <= 0) return

  const strandPts = STRAND_PHASES.map((phase, i) =>
    getHelixPoints(canvas, MAIN_CURVE, MAIN_FRAMES, helixProgress, phase, time)
  )

  // ── PASS 1: Bloom — cada strand usa sua cor de glow ─────────────────────────
  ctx.filter = 'blur(10px)'
  ;[2, 1, 0].forEach(i => {
    const pts = strandPts[i]
    if (!pts || pts.length < 2) return
    const bloomAlpha = i === 2
      ? 0.10 + 0.04 * Math.sin(time * 0.6 + i * 1.2)
      : 0.05 + 0.03 * Math.sin(time * 0.6 + i * 1.2)
    strokePath(ctx, pts, HELIX_CONFIGS[i].glowColor, 14, bloomAlpha)
  })
  ctx.filter      = 'none'
  ctx.globalAlpha = 1

  // ── PASS 2: Halo — config[i] aplicado somente à strand[i] ─────────────────
  ctx.filter = 'blur(4px)'
  ;[2, 1, 0].forEach(i => {
    const config = HELIX_CONFIGS[i]
    const pts    = strandPts[i]
    if (!pts || pts.length < 2) return
    strokePath(ctx, pts, config.glowColor, config.lineWidth * 2.5, config.opacity * 0.20)
  })
  ctx.filter      = 'none'
  ctx.globalAlpha = 1

  // ── PASS 3: Linhas nítidas — config[i] para strand[i] ─────────────────────
  ;[2, 1, 0].forEach(i => {
    const config = HELIX_CONFIGS[i]
    const pts    = strandPts[i]
    if (!pts || pts.length < 2) return
    for (let j = 1; j < pts.length; j++) {
      const { x: x1, y: y1 }    = pts[j - 1]
      const { x: x2, y: y2, a } = pts[j]
      const tN           = j / pts.length
      const centerFactor = Math.max(0.3, 1 - Math.abs(tN - 0.5) * 1.5)
      const t            = j / pts.length
      const shimmer      = 0.5 + 0.5 * Math.sin(t * Math.PI * 4 - time * 1.2 + i * (Math.PI * 2 / 3))
      const alphaFinal   = Math.min(1, config.opacity * a * (0.65 + 0.35 * shimmer))
      ctx.strokeStyle = config.colorCenter
      ctx.lineWidth   = config.lineWidth * centerFactor
      ctx.globalAlpha = alphaFinal
      ctx.lineCap     = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  })

  ctx.filter      = 'none'
  ctx.globalAlpha = 1

  // ── PASS 4: Particles ────────────────────────────────────────────────────────
  if (helixProgress > 0.1) {
    const particleFade = Math.min(1, (helixProgress - 0.1) / 0.3)

    for (const p of HELIX_PARTICLES) {
      if (p.tRatio > helixProgress) continue

      const strand = strandPts[p.strandIdx]
      if (!strand || strand.length < 2) continue
      const ptIdx = Math.min(Math.floor(p.tRatio * N_PER_SEGMENT), strand.length - 1)
      const base  = strand[ptIdx]
      if (!base) continue

      const floatX = Math.cos(time * 7  + p.phase) * 2.5
      const floatY = Math.sin(time * 12 + p.phase) * 7

      // Posição natural da partícula (home)
      const homeX = base.x + floatX
      const homeY = base.y + p.currentYOffset + floatY

      // Posição atual = home + deslocamento acumulado
      let finalX = homeX + p.dispX
      let finalY = homeY + p.dispY

      // Repulsão do mouse: empurra dispX/dispY sem limite de distância
      const dxM   = finalX - mousePos.x
      const dyM   = finalY - mousePos.y
      const distM = Math.sqrt(dxM * dxM + dyM * dyM)
      if (distM < 100 && distM > 0) {
        const force = (1 - distM / 100) * 10
        const angle = Math.atan2(dyM, dxM)
        p.dispX += Math.cos(angle) * force
        p.dispY += Math.sin(angle) * force
      }
      finalX = homeX + p.dispX
      finalY = homeY + p.dispY

      if (p.exploding && p.explodeTimer > 0) {
        p.explodeTimer -= 0.003
        const explodeFactor = Math.sin((1 - p.explodeTimer / 0.8) * Math.PI)
        finalX += p.explodeVx * explodeFactor * 28
        finalY += p.explodeVy * explodeFactor * 18
        if (p.explodeTimer <= 0) { p.exploding = false; p.explodeTimer = 0 }
      }

      const glowPulse     = 0.5 + 0.5 * Math.sin(time * 6 + p.glowPhase)
      const glowIntensity = 2 + glowPulse * 5
      const absOffset     = Math.abs(p.yOffset)
      const baseAlpha     = absOffset < 10 ? 0.75 : absOffset > 22 ? 0.12 : 0.4
      const alpha         = Math.min(1, baseAlpha * particleFade * (1 + glowPulse * 0.25))
      const radiusPulse   = p.baseRadius * (1 + glowPulse * 0.35)

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.shadowBlur  = glowIntensity
      ctx.shadowColor = p.color
      ctx.fillStyle   = p.color
      ctx.beginPath()
      ctx.arc(finalX, finalY, radiusPulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Experience() {
  const sectionRef     = useRef(null)
  const canvasRef      = useRef(null)
  const canvasLinesRef = useRef(null)
  const revealRef      = useRef(0)
  const hoveredNodeRef = useRef(null)
  const timeRef        = useRef(0)
  const pulseTimerRef  = useRef(0)
  const mousePosRef    = useRef({ x: -9999, y: -9999 })
  const prefersReducedMotion = useReducedMotion()

  const [hoveredNode,      setHoveredNode]      = useState(null)
  const [nodeScreenPos,    setNodeScreenPos]    = useState([])
  const [nodeAnimProgress, setNodeAnimProgress] = useState([0, 0, 0, 0])
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Entrance animations — faster, snappier (desktop only)
  useEffect(() => {
    const isMobileCheck = window.innerWidth <= 768
    if (isMobileCheck) return
    const ctx = gsap.context(() => {
      sectionRef.current?.querySelectorAll('[data-reveal]').forEach(el => {
        const delay = parseFloat(el.dataset.delay || 0)
        gsap.set(el, { opacity: 0, y: 30 })
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Canvas 2D — helix lines (DPR resize only)
  useEffect(() => {
    if (isMobile || !canvasLinesRef.current) return
    const canvas = canvasLinesRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      const dpr     = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    return () => ro.disconnect()
  }, [isMobile])

  // Three.js canvas — hitboxes + draw-range proxy
  useEffect(() => {
    if (isMobile || !canvasRef.current || !sectionRef.current) return
    const canvas = canvasRef.current

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.setClearColor(0x000000, 0)

    // ── Camera
    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.set(0, 0, 7)
    camera.lookAt(0, 0, 0)

    const scene = new THREE.Scene()

    // ── Nodes: invisible hitboxes for raycasting (radius covers full 220px ring)
    const hitboxes = NODE_POSITIONS.map(pos => {
      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(0.90, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      )
      hitbox.position.copy(pos)
      scene.add(hitbox)
      return hitbox
    })

    // ── helixLineObjects — proxy for setDrawRange (rendering is Canvas 2D)
    const helixLineObjects = STRAND_PHASES.map((phase) => {
      const strand   = new StrandCurve(MAIN_CURVE, phase, RADIUS, CYCLES)
      const pts      = strand.getPoints(N_PER_SEGMENT)
      const geometry = new THREE.BufferGeometry().setFromPoints(pts)
      geometry.setDrawRange(0, 0)
      const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0 })
      const line     = new THREE.Line(geometry, material)
      scene.add(line)
      return { geometry }
    })

    const updateGeometry = (helixProgress) => {
      const visibleCount = Math.max(2, Math.floor(N_PER_SEGMENT * helixProgress))
      helixLineObjects.forEach(({ geometry }) => geometry.setDrawRange(0, visibleCount))
    }

    // ── 3D → 2D projection
    const toScreen = (pos) => {
      const v = pos.clone().project(camera)
      return {
        x:           (v.x + 1) / 2 * canvas.offsetWidth,
        y:           -(v.y - 1) / 2 * canvas.offsetHeight,
        canvasWidth: canvas.offsetWidth,
      }
    }

    const updateNodeScreenPositions = () => {
      setNodeScreenPos(NODE_POSITIONS.map(toScreen))
    }

    // ── Initial render
    updateNodeScreenPositions()
    renderer.render(scene, camera)
    setTimeout(() => updateNodeScreenPositions(), 100)

    // ── prefers-reduced-motion: show full helix immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealRef.current = 1
      updateGeometry(1)
      renderer.render(scene, camera)
      const lc = canvasLinesRef.current
      if (lc) drawAllHelices(lc.getContext('2d'), lc, 1)
      setNodeAnimProgress([1, 1, 1, 1])
    }

    // ── ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   true,
      onUpdate: (self) => {
        const p = self.progress
        revealRef.current = p

        const helixProgress = Math.max(0, Math.min(1, (p - 0.05) / 0.90))
        updateGeometry(helixProgress)

        setNodeAnimProgress(NODE_WINDOWS.map(w => windowProgress(p, w)))

        renderer.render(scene, camera)
      },
    })

    // ── rAF loop — continuous helix shimmer (skipped when prefers-reduced-motion)
    let rafId = null
    let helixVisible = false

    const tick = () => {
      timeRef.current += 0.003

      HELIX_PARTICLES.forEach(p => {
        p.currentYOffset += (p.baseYOffset - p.currentYOffset) * 0.04
        p.dispX *= 0.985
        p.dispY *= 0.985
      })

      pulseTimerRef.current += 0.003
      if (pulseTimerRef.current >= 4.0) {
        pulseTimerRef.current = 0
        HELIX_PARTICLES.forEach(p => {
          p.exploding    = true
          p.explodeTimer = 0.8
          const angle    = Math.random() * Math.PI * 2
          const force    = 1.5 + Math.random() * 3
          p.explodeVx    = Math.cos(angle) * force
          p.explodeVy    = Math.sin(angle) * force
        })
      }

      const lc = canvasLinesRef.current
      if (lc) {
        const helixProgress = Math.max(0, Math.min(1, (revealRef.current - 0.05) / 0.90))
        drawAllHelices(lc.getContext('2d'), lc, helixProgress, timeRef.current, mousePosRef.current)
      }
      if (helixVisible) rafId = requestAnimationFrame(tick)
    }

    let helixIO = null
    if (!prefersReducedMotion) {
      helixIO = new IntersectionObserver(([entry]) => {
        helixVisible = entry.isIntersecting
        if (helixVisible && !rafId) {
          rafId = requestAnimationFrame(tick)
        } else if (!helixVisible && rafId) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
      }, { threshold: 0 })
      helixIO.observe(canvas)
    }

    // ── Raycaster — hover em nós já revelados pela hélice
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / canvas.offsetWidth)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / canvas.offsetHeight) * 2 + 1
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      raycaster.setFromCamera(mouse, camera)

      const hits     = raycaster.intersectObjects(hitboxes)
      const validHit = hits.find(hit => {
        const idx = hitboxes.indexOf(hit.object)
        return revealRef.current >= NODE_HELIX_THRESHOLDS[idx]
      })
      const found = validHit ? hitboxes.indexOf(validHit.object) : null

      // Cursor feedback
      canvas.style.cursor = found !== null ? 'pointer' : 'default'

      if (found !== hoveredNodeRef.current) {
        hoveredNodeRef.current = found
        setHoveredNode(found)
      }
    }

    canvas.addEventListener('mousemove', onMouseMove)

    // ── Resize
    const onResize = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      updateNodeScreenPositions()
      renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)

    // ── Cleanup
    return () => {
      st.kill()
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (helixIO) helixIO.disconnect()
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
      })
    }
  }, [isMobile])

  return (
    <section ref={sectionRef} id="experiencia" className={styles.section}>

      {/* ── Desktop ── */}
      {!isMobile && (
        <div className={styles.sticky}>
          <canvas ref={canvasRef} className={styles.canvas} style={{ zIndex: 0, touchAction: 'pan-y' }} />
          <canvas
            ref={canvasLinesRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <div className={styles.overlay}>
            <div className={styles.headerInner}>
              <span className={styles.label} data-reveal="up" data-delay="0">Experiência</span>
              <h2 className={styles.title}  data-reveal="up" data-delay="0.05">Onde já estive</h2>
              <p className={styles.subtitle} data-reveal="up" data-delay="0.10">Passe o mouse sobre cada empresa para ver os detalhes</p>
            </div>

            {ITEMS.map((item, i) => (
              <div key={item.id} style={{ position: 'absolute', pointerEvents: 'none' }}>

                {/* Nó visual premium: anel SVG + pontos orbitais + logo central */}
                {nodeAnimProgress[i] > 0 && nodeScreenPos[i] && (() => {
                  const sub    = nodeSubProgress(nodeAnimProgress[i])
                  const isIdle = sub.ringDraw >= 1 && hoveredNode !== i
                  return (
                    <div
                      className={styles.nodeRing}
                      style={{
                        position:  'absolute',
                        left:      nodeScreenPos[i].x,
                        top:       nodeScreenPos[i].y,
                        // Crystallization: grows from 55% rather than zero
                        transform: `translate(-50%, -50%) scale(${0.55 + sub.ringScale * 0.45})`,
                        pointerEvents: 'none',
                        width:  '220px',
                        height: '220px',
                      }}
                    >

                      {/* CAMADA 2 — Anel SVG animado */}
                      <svg
                        className={styles.nodeRingSvg}
                        viewBox="0 0 220 220"
                        style={{ position: 'absolute', inset: 0 }}
                      >
                        <circle cx="110" cy="110" r="88" fill="none"
                          stroke="rgba(6,182,212,0.08)" strokeWidth="3.5" />
                        <circle cx="110" cy="110" r="88" fill="none"
                          stroke="#06B6D4" strokeWidth="2.6" strokeLinecap="round"
                          strokeDasharray="553.0"
                          strokeDashoffset={`${553.0 * (1 - sub.ringDraw)}`}
                          transform="rotate(-90 110 110)"
                          style={{
                            filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.7))',
                            transition: 'stroke-dashoffset 0.05s linear',
                          }}
                        />
                      </svg>

                      {/* CAMADA 1 — Centro: círculo preto com logo */}
                      <div
                        className={styles.nodeCenter}
                        style={{
                          opacity: sub.logoReveal,
                          filter:  `blur(${(1 - sub.logoReveal) * 6}px)`,
                          transition: 'none',
                        }}
                      >
                        <img
                          src={`/logos parceiras/${NODE_LOGOS[i]}`}
                          alt={item.empresa}
                          className={`${styles.nodeLogo} ${i === 3 ? styles.nodeLogoWW : ''}`}
                          onError={(e) => {
                            e.currentTarget.src = `/logos%20parceiras/${NODE_LOGOS[i]}`
                          }}
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* Card — hover expand, aparece abaixo do nó */}
                <AnimatePresence>
                  {hoveredNode === i && nodeScreenPos[i] && (
                    <motion.div
                      key={`card-${item.id}`}
                      className={`${styles.nodeCard} ${styles.bottom}`}
                      style={{
                        top:  nodeScreenPos[i].y + 100,
                        left: nodeScreenPos[i].x,
                        x:    '-50%',
                      }}
                      initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      exit={{
                        opacity: 0,
                        filter:  'blur(2px)',
                        y:       -6,
                        transition: { duration: prefersReducedMotion ? 0 : 0.15, ease: 'easeIn' },
                      }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
                    >
                      {[
                        <h3   key="emp"  className={styles.nodeEmpresa}>{item.empresa}</h3>,
                        <div key="meta" className={styles.nodeMeta}>
                          <span className={styles.nodeMetaPapel}>{item.papel}</span>
                          <span className={styles.nodeMetaSub}>{item.tipo} · {item.periodo}</span>
                        </div>,
                        <div  key="div"  className={styles.nodeDivider} />,
                        <p    key="apr"  className={styles.nodeAprendizado}>"{item.aprendizado}"</p>,
                        <ul   key="list" className={styles.nodeEntregas}>
                          {item.entregas.map((e, j) => <li key={j}>{e}</li>)}
                        </ul>,
                      ].map((child, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: prefersReducedMotion ? 0 : 0.2,
                            delay:    prefersReducedMotion ? 0 : 0.05 + idx * 0.04,
                            ease:     'easeOut',
                          }}
                        >
                          {child}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile ── */}
      {isMobile && (
        <div className={styles.mobileWrapper}>
          <div className={styles.mobileHeader}>
            <span className={styles.label} data-reveal="up" data-delay="0">Experiência</span>
            <h2 className={styles.title}  data-reveal="up" data-delay="0.08">Onde já estive</h2>
          </div>
          <div className={styles.mobileList}>
            {ITEMS.map((item, i) => (
              <div
                key={item.id}
                className={styles.mobileItem}
                data-reveal="up"
                data-delay={String(0.15 + i * 0.08)}
              >
                <div className={styles.mobileItemHeader}>
<div className={styles.mobileTitles}>
                    <h3 className={styles.mobileEmpresa}>{item.empresa}</h3>
                    <span className={styles.mobileMeta}>{item.papel} · {item.periodo}</span>
                  </div>
                  <span className={`${styles.mobileBadge} ${item.tipo === 'Freelance' ? styles.badgeFreelance : styles.badgeFormal}`}>
                    {item.tipo}
                  </span>
                </div>
                <ul className={styles.mobileEntregas}>
                  {item.entregas.map((e, j) => (
                    <li key={j} className={styles.mobileEntrega}>{e}</li>
                  ))}
                </ul>
                <p className={styles.mobileAprendizado}>"{item.aprendizado}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  )
}
