import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export function CustomCursor() {
  const cursorRef = useRef(null)
  const posRef = useRef({ x: -100, y: -100 })
  const curRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMouseMove = (e) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
    }

    let animId
    const animate = () => {
      curRef.current.x += (posRef.current.x - curRef.current.x) * 0.15
      curRef.current.y += (posRef.current.y - curRef.current.y) * 0.15
      cursor.style.transform =
        `translate(${curRef.current.x}px, ${curRef.current.y}px)`
      animId = requestAnimationFrame(animate)
    }

    const expand = () => cursor.classList.add(styles.expanded)
    const collapse = () => cursor.classList.remove(styles.expanded)

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]'
    const els = document.querySelectorAll(interactiveSelector)
    els.forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', collapse)
    })

    window.addEventListener('mousemove', onMouseMove)
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
      els.forEach(el => {
        el.removeEventListener('mouseenter', expand)
        el.removeEventListener('mouseleave', collapse)
      })
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} />
}
