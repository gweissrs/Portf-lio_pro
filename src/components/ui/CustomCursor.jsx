// ARQUITETURA: 3 camadas separadas para evitar contaminação de backdrop-filter
// .cursorLens   → backdrop-filter isolado (some no previewMode)
// .cursorPreviewBg → fundo do preview (isolado da lens)
// .cursorLabel  → texto (nunca filho do backdrop-filter)
// Não colapse essas camadas em uma só — o bug volta.

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export function CustomCursor() {
  const cursorRef = useRef(null)
  const posRef = useRef({ x: -100, y: -100 })
  const curRef = useRef({ x: -100, y: -100 })
  const previewModeRef = useRef(false)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let animId
    const animate = () => {
      const ease = previewModeRef.current ? 0.08 : 0.15
      curRef.current.x += (posRef.current.x - curRef.current.x) * ease
      curRef.current.y += (posRef.current.y - curRef.current.y) * ease
      cursor.style.transform = `translate(${curRef.current.x}px, ${curRef.current.y}px)`
      animId = requestAnimationFrame(animate)
    }

    const onMouseMove = (e) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
    }

    const expand = () => {
      if (previewModeRef.current) return
      cursor.classList.add(styles.expanded)
    }
    const collapse = () => {
      cursor.classList.remove(styles.expanded)
    }

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, label'
    const els = document.querySelectorAll(interactiveSelector)
    els.forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', collapse)
    })

    const onPreview = (e) => {
      const { active } = e.detail
      if (!cursor) return

      previewModeRef.current = active

      if (active) {
        cursor.classList.remove(styles.expanded)
        cursor.classList.add(styles.previewMode)
      } else {
        cursor.classList.remove(styles.previewMode)
        cursor.classList.remove(styles.expanded)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('cursor:preview', onPreview)
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('cursor:preview', onPreview)
      cancelAnimationFrame(animId)
      els.forEach(el => {
        el.removeEventListener('mouseenter', expand)
        el.removeEventListener('mouseleave', collapse)
      })
    }
  }, [])

  return (
    <div ref={cursorRef} className={styles.cursor}>
      <div className={styles.cursorLens} />
      <div className={styles.cursorPreviewBg} />
      <span className={styles.cursorLabel}>Ver projeto</span>
    </div>
  )
}
